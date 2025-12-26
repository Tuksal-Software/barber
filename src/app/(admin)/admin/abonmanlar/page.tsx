"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Repeat,
  Plus,
  Edit,
  X,
  Trash2,
} from "lucide-react";
import { getActiveBarbers } from "@/lib/actions/barber.actions";
import { getSubscriptions, createSubscription, updateSubscription, cancelSubscription } from "@/lib/actions/subscription.actions";
import { getCustomerByPhone } from "@/lib/actions/appointment.actions";
import { SubscriptionRecurrenceType } from "@prisma/client";
import { toast } from "sonner";
import { format } from "date-fns"
import { tr } from "date-fns/locale/tr"
import { TimeRangePicker } from "@/components/app/TimeRangePicker";
import { minutesToTime, parseTimeToMinutes } from "@/lib/time";

interface Barber {
  id: string;
  name: string;
}

interface Subscription {
  id: string;
  barberId: string;
  customerName: string;
  customerPhone: string;
  recurrenceType: SubscriptionRecurrenceType;
  dayOfWeek: number;
  weekOfMonth: number | null;
  startTime: string;
  durationMinutes: number;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  createdAt: Date;
  barber: {
    id: string;
    name: string;
  };
  appointmentRequests: Array<{
    id: string;
    date: string;
    status: string;
  }>;
}

const DAY_NAMES = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
const RECURRENCE_TYPES = [
  { value: 'weekly', label: 'Haftalık' },
  { value: 'biweekly', label: '2 Haftada Bir' },
  { value: 'monthly', label: 'Aylık' },
];

function generateTimeSlots(): Array<{ time: string; disabled: boolean }> {
  const slots: Array<{ time: string; disabled: boolean }> = [];
  for (let hour = 11; hour < 22; hour++) {
    slots.push({ time: `${hour.toString().padStart(2, '0')}:00`, disabled: false });
    slots.push({ time: `${hour.toString().padStart(2, '0')}:30`, disabled: false });
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function normalizePhone(phone: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  
  if (digits.startsWith('90') && digits.length >= 12) {
    return `+${digits.slice(0, 12)}`;
  }
  
  if (digits.startsWith('0') && digits.length >= 11) {
    return `+90${digits.slice(1, 12)}`;
  }
  
  if (digits.startsWith('5') && digits.length >= 10) {
    return `+90${digits.slice(0, 10)}`;
  }
  
  if (digits.length > 0) {
    if (digits.startsWith('90')) {
      return `+${digits.slice(0, 12)}`;
    }
    if (digits.startsWith('0')) {
      return `+90${digits.slice(1, 12)}`;
    }
    if (digits.startsWith('5')) {
      return `+90${digits.slice(0, 10)}`;
    }
    return `+90${digits.slice(0, 10)}`;
  }
  
  return '';
}

function getRecurrenceDescription(
  recurrenceType: SubscriptionRecurrenceType,
  dayOfWeek: number,
  weekOfMonth: number | null,
  startTime?: string,
  durationMinutes?: number,
  startDate?: string,
  endDate?: string | null
): string {
  const dayName = DAY_NAMES[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
  
  let description = '';
  
  if (recurrenceType === 'weekly') {
    description = `Her hafta ${dayName}`;
  } else if (recurrenceType === 'biweekly') {
    description = `2 haftada bir ${dayName}`;
  } else {
    const weekText = weekOfMonth === 1 ? '1.' : weekOfMonth === 2 ? '2.' : weekOfMonth === 3 ? '3.' : weekOfMonth === 4 ? '4.' : '5.';
    description = `Her ayın ${weekText} ${dayName} günü`;
  }
  
  if (startTime && durationMinutes) {
    const startMinutes = parseTimeToMinutes(startTime);
    const endMinutes = startMinutes + durationMinutes;
    const endTime = minutesToTime(endMinutes);
    description += ` ${startTime} – ${endTime}`;
  } else if (startTime) {
    description += ` ${startTime}`;
  }
  
  if (startDate || endDate) {
    const dateParts: string[] = [];
    if (startDate) {
      const start = format(new Date(startDate), 'dd.MM.yyyy', { locale: tr });
      dateParts.push(`Başlangıç: ${start}`);
    }
    if (endDate) {
      const end = format(new Date(endDate), 'dd.MM.yyyy', { locale: tr });
      dateParts.push(`Bitiş: ${end}`);
    }
    if (dateParts.length > 0) {
      description += `\n${dateParts.join(', ')}`;
    }
  }
  
  return description;
}

export default function AbonmanlarPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [formData, setFormData] = useState({
    barberId: '',
    customerName: '',
    customerPhone: '',
    recurrenceType: 'weekly' as SubscriptionRecurrenceType,
    dayOfWeek: 1,
    weekOfMonth: null as number | null,
    startTime: '',
    durationMinutes: 30,
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (barbers.length === 1 && !formData.barberId) {
      setFormData(prev => ({ ...prev, barberId: barbers[0].id }));
    }
  }, [barbers, formData.barberId]);

  useEffect(() => {
    const normalized = normalizePhone(formData.customerPhone);
    if (normalized !== formData.customerPhone) {
      setFormData(prev => ({ ...prev, customerPhone: normalized }));
      return;
    }
    
    if (normalized && normalized.match(/^\+90[5][0-9]{9}$/)) {
      const timer = setTimeout(async () => {
        try {
          const customer = await getCustomerByPhone(normalized);
          if (customer && !formData.customerName) {
            setFormData(prev => ({ ...prev, customerName: customer.customerName }));
          }
        } catch (error) {
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [formData.customerPhone, formData.customerName]);

  async function loadData() {
    try {
      setLoading(true);
      const [barbersData, subscriptionsData] = await Promise.all([
        getActiveBarbers(),
        getSubscriptions(),
      ]);
      setBarbers(barbersData);
      setSubscriptions(subscriptionsData as any);
    } catch (error) {
      toast.error('Veriler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  }

  const filteredSubscriptions = useMemo(() => {
    if (filterActive === 'all') return subscriptions;
    return subscriptions.filter(sub => 
      filterActive === 'active' ? sub.isActive : !sub.isActive
    );
  }, [subscriptions, filterActive]);

  function handleCreate() {
    setFormData({
      barberId: '',
      customerName: '',
      customerPhone: '',
      recurrenceType: 'weekly',
      dayOfWeek: 1,
      weekOfMonth: null,
      startTime: '',
      durationMinutes: 30,
      startDate: '',
      endDate: '',
    });
    setIsCreateDialogOpen(true);
  }

  const isFormValid = useMemo(() => {
    const finalBarberId = formData.barberId || (barbers.length === 1 ? barbers[0].id : '');
    return !!(
      finalBarberId &&
      formData.customerName &&
      formData.customerPhone &&
      formData.startTime &&
      formData.durationMinutes &&
      formData.startDate &&
      (formData.recurrenceType !== 'monthly' || formData.weekOfMonth)
    );
  }, [formData, barbers]);

  async function handleSubmit() {
    const finalBarberId = formData.barberId || (barbers.length === 1 ? barbers[0].id : '');
    
    if (!finalBarberId || !formData.customerName || !formData.customerPhone || 
        !formData.startTime || !formData.durationMinutes || !formData.startDate) {
      toast.error('Tüm zorunlu alanları doldurun');
      return;
    }

    if (formData.recurrenceType === 'monthly' && !formData.weekOfMonth) {
      toast.error('Aylık abonman için hafta numarası seçin');
      return;
    }

    const normalizedPhone = normalizePhone(formData.customerPhone);
    if (!normalizedPhone.match(/^\+90[5][0-9]{9}$/)) {
      toast.error('Geçerli bir telefon numarası girin');
      return;
    }

    try {
      await createSubscription({
        barberId: finalBarberId,
        customerName: formData.customerName,
        customerPhone: normalizedPhone,
        recurrenceType: formData.recurrenceType,
        dayOfWeek: formData.dayOfWeek,
        weekOfMonth: formData.recurrenceType === 'monthly' ? formData.weekOfMonth : null,
        startTime: formData.startTime,
        durationMinutes: formData.durationMinutes,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
      });
      toast.success('Abonman oluşturuldu');
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Abonman oluşturulurken hata oluştu');
    }
  }

  async function handleCancel() {
    if (!selectedSubscription) return;
    
    try {
      await cancelSubscription(selectedSubscription.id);
      toast.success('Abonman iptal edildi');
      setIsCancelDialogOpen(false);
      setSelectedSubscription(null);
      loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Abonman iptal edilirken hata oluştu');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Abonmanlar</h1>
          <p className="text-muted-foreground mt-1">
            Tekrarlayan randevu abonmanlarını yönetin
          </p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Abonman
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Abonman Listesi</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={filterActive === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('all')}
              >
                Tümü
              </Button>
              <Button
                variant={filterActive === 'active' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('active')}
              >
                Aktif
              </Button>
              <Button
                variant={filterActive === 'inactive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterActive('inactive')}
              >
                Pasif
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSubscriptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Abonman bulunamadı
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscriptions.map((subscription) => (
                <Card key={subscription.id} className="border">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{subscription.customerName}</span>
                          <Badge variant={subscription.isActive ? 'default' : 'secondary'}>
                            {subscription.isActive ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {subscription.customerPhone}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Repeat className="h-4 w-4" />
                          {getRecurrenceDescription(
                            subscription.recurrenceType,
                            subscription.dayOfWeek,
                            subscription.weekOfMonth
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {subscription.startTime} ({subscription.durationMinutes} dk)
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(subscription.startDate), 'dd MMM yyyy', { locale: tr })}
                          {subscription.endDate && ` - ${format(new Date(subscription.endDate), 'dd MMM yyyy', { locale: tr })}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Berber: {subscription.barber.name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Aktif randevu: {subscription.appointmentRequests.length}
                        </div>
                      </div>
                      {subscription.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedSubscription(subscription);
                            setIsCancelDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          İptal Et
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Abonman</DialogTitle>
            <DialogDescription>
              Tekrarlayan randevu abonmanı oluşturun
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {barbers.length === 0 ? (
              <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                Aktif berber bulunamadı
              </div>
            ) : barbers.length === 1 ? (
              <div className="space-y-2">
                <Label>Berber</Label>
                <Input
                  value={barbers[0].name}
                  disabled
                  className="bg-muted"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Berber *</Label>
                <Select
                  value={formData.barberId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, barberId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Berber seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map((barber) => (
                      <SelectItem key={barber.id} value={barber.id}>
                        {barber.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Müşteri Telefon *</Label>
              <Input
                value={formData.customerPhone}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                placeholder="+905551234567"
              />
            </div>
            <div className="space-y-2">
              <Label>Müşteri Adı *</Label>
              <Input
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                placeholder="Müşteri adı"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Periyot *</Label>
                <Select
                  value={formData.recurrenceType}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    recurrenceType: value as SubscriptionRecurrenceType,
                    weekOfMonth: value === 'monthly' ? 1 : null,
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECURRENCE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gün *</Label>
                <Select
                  value={formData.dayOfWeek.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, dayOfWeek: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_NAMES.map((day, index) => (
                      <SelectItem key={index} value={(index + 1).toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {formData.recurrenceType === 'monthly' && (
              <div className="space-y-2">
                <Label>Ayın Kaçıncı Haftası *</Label>
                <Select
                  value={formData.weekOfMonth?.toString() || ''}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, weekOfMonth: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Hafta seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((week) => (
                      <SelectItem key={week} value={week.toString()}>
                        {week}. Hafta
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Başlangıç Saati *</Label>
                <TimeRangePicker
                  selectedStart={formData.startTime}
                  onStartSelect={(time) => setFormData(prev => ({ ...prev, startTime: time }))}
                  timeButtons={TIME_SLOTS}
                />
              </div>
              <div className="space-y-2">
                <Label>Süre (dakika) *</Label>
                <Select
                  value={formData.durationMinutes.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, durationMinutes: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 dakika</SelectItem>
                    <SelectItem value="60">60 dakika</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Başlangıç Tarihi *</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Bitiş Tarihi (Opsiyonel)</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                />
              </div>
            </div>
            <Card className="bg-muted">
              <CardHeader>
                <CardTitle className="text-sm">Önizleme</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-line">
                  {formData.startTime && formData.durationMinutes && formData.dayOfWeek && formData.recurrenceType && 
                   (formData.recurrenceType !== 'monthly' || formData.weekOfMonth)
                    ? getRecurrenceDescription(
                        formData.recurrenceType,
                        formData.dayOfWeek,
                        formData.weekOfMonth,
                        formData.startTime,
                        formData.durationMinutes,
                        formData.startDate,
                        formData.endDate || null
                      )
                    : 'Formu doldurun'}
                </p>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              İptal
            </Button>
            <Button onClick={handleSubmit} disabled={!isFormValid}>
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Abonmanı İptal Et</AlertDialogTitle>
            <AlertDialogDescription>
              Bu abonmanı iptal etmek istediğinizden emin misiniz? Gelecekteki tüm randevular iptal edilecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleCancel}>Evet, İptal Et</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

