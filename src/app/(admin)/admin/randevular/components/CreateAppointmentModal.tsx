'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  User,
  Scissors,
  Calendar,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  Check,
  Loader2,
  CalendarIcon,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
// import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { getActiveBarbers } from '@/lib/actions/barber.actions';
import { getActiveServices } from '@/lib/actions/services';
import { getAppointmentSettings } from '@/lib/actions/settings';
import { getAvailableSlots, createAppointment } from '@/lib/actions/appointment';

interface CreateAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CreateAppointmentModal({ isOpen, onClose, onSuccess }: CreateAppointmentModalProps) {
  const router = useRouter();
  
  // Step management
  const [step, setStep] = useState(1);
  const [serviceBased, setServiceBased] = useState(false);
  
  // Form data
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
  });

  // Data
  const [barbers, setBarbers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  
  // Loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Steps configuration
  const steps = [
    { number: 1, title: 'Berber', icon: User },
    ...(serviceBased ? [{ number: 2, title: 'Hizmetler', icon: Scissors }] : []),
    { 
      number: serviceBased ? 3 : 2, 
      title: 'Tarih & Saat', 
      icon: Calendar 
    },
    { 
      number: serviceBased ? 4 : 3, 
      title: 'Müşteri', 
      icon: UserCheck 
    },
  ];

  const maxStep = steps[steps.length - 1].number;

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;
      
      setIsInitialLoading(true);
      try {
        const [barbersData, servicesData, settings] = await Promise.all([
          getActiveBarbers(),
          getActiveServices(),
          getAppointmentSettings(),
        ]);
        
        setBarbers(barbersData?.data || []);
        setServices(servicesData?.data || []);
        setServiceBased(settings?.data?.serviceBasedDuration || false);
      } catch (error) {
        toast.error('Veriler yüklenirken hata oluştu');
        console.error(error);
      } finally {
        setIsInitialLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Fetch available slots when date/barber changes
  useEffect(() => {
    const fetchSlots = async () => {
      if (!selectedBarber || !selectedDate) return;

      setIsSlotsLoading(true);
      try {
        const totalDuration = serviceBased
          ? services
              .filter(s => selectedServices.includes(s.id))
              .reduce((sum, s) => sum + s.duration, 0)
          : undefined;

        const slots = await getAvailableSlots(
          selectedBarber,
          selectedDate,
          totalDuration
        );

        setAvailableSlots(slots?.data?.map((slot: any) => slot.time) || []);
      } catch (error) {
        toast.error('Slotlar yüklenirken hata oluştu');
        console.error(error);
      } finally {
        setIsSlotsLoading(false);
      }
    };

    const currentDateTimeStep = serviceBased ? 3 : 2;
    if (step === currentDateTimeStep) {
      fetchSlots();
    }
  }, [selectedBarber, selectedDate, selectedServices, serviceBased, step, services]);

  // Reset state on close
  useEffect(() => {
    if (!isOpen) {
      // Reset after animation
      setTimeout(() => {
        setStep(1);
        setSelectedBarber('');
        setSelectedServices([]);
        setSelectedDate(null);
        setSelectedTime('');
        setCustomerData({ name: '', phone: '', email: '', notes: '' });
        setAvailableSlots([]);
      }, 200);
    }
  }, [isOpen]);

  // Validation functions
  const canProceedToNextStep = (): boolean => {
    switch (step) {
      case 1:
        return selectedBarber !== '';
      case 2:
        return !serviceBased || selectedServices.length > 0;
      case serviceBased ? 3 : 2:
        return selectedDate !== null && selectedTime !== '';
      case serviceBased ? 4 : 3:
        return (
          customerData.name.trim() !== '' &&
          customerData.phone.trim() !== '' &&
          /^05\d{9}$/.test(customerData.phone.replace(/\s/g, ''))
        );
      default:
        return false;
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!canProceedToNextStep()) {
      toast.error('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAppointment({
        barberId: selectedBarber,
        date: format(selectedDate!, 'yyyy-MM-dd'),
        startTime: selectedTime,
        customerName: customerData.name.trim(),
        customerPhone: customerData.phone.trim(),
        customerEmail: customerData.email.trim() || undefined,
        notes: customerData.notes.trim() || undefined,
        serviceIds: serviceBased && selectedServices.length > 0 
          ? selectedServices 
          : undefined,
      });
      if (res.success) {
        toast.success('Randevu başarıyla oluşturuldu');
        onSuccess?.();
        onClose();
        router.refresh();
      } else {
        toast.error(res.error || 'Randevu oluşturulamadı');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Randevu oluşturulamadı');
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateTimeStep = serviceBased ? 3 : 2;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Randevu Oluştur</DialogTitle>
        </DialogHeader>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            {steps.map((s, idx) => (
              <div key={s.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                      step >= s.number
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-muted text-muted-foreground'
                    )}
                  >
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      'text-xs font-medium text-center',
                      step >= s.number ? 'text-foreground' : 'text-muted-foreground'
                    )}
                  >
                    {s.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div
                    className={cn(
                      'h-0.5 flex-1 mx-2 transition-all',
                      step > s.number ? 'bg-primary' : 'bg-muted'
                    )}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {isInitialLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-32 w-full bg-muted animate-pulse rounded" />
              <div className="h-32 w-full bg-muted animate-pulse rounded" />
              <div className="h-32 w-full bg-muted animate-pulse rounded" />
            </div>
          ) : step === 1 ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Berber Seçin</h3>
                <p className="text-sm text-muted-foreground">Randevu oluşturmak istediğiniz berberi seçin</p>
              </div>
              {barbers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aktif berber bulunamadı</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {barbers.map((barber) => (
                    <Card
                      key={barber.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        selectedBarber === barber.id && 'ring-2 ring-primary'
                      )}
                      onClick={() => setSelectedBarber(barber.id)}
                    >
                      <CardContent className="p-4 flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={barber.image} />
                          <AvatarFallback>{barber.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-semibold">{barber.name}</p>
                          {barber.specialties && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {barber.specialties}
                            </p>
                          )}
                        </div>
                        {selectedBarber === barber.id && (
                          <Check className="h-5 w-5 text-primary" />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : step === 2 && serviceBased ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Hizmet Seçin</h3>
                <p className="text-sm text-muted-foreground">Sunulacak hizmetleri seçin (En az 1 hizmet)</p>
              </div>
              {services.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Scissors className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Aktif hizmet bulunamadı</p>
                </div>
              ) : (
                <ServiceSelection
                  services={services as any}
                  selectedServices={selectedServices}
                  onSelectionChange={setSelectedServices}
                />
              )}
            </div>
          ) : step === dateTimeStep ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Tarih ve Saat Seçin</h3>
                <p className="text-sm text-muted-foreground">Müsait tarih ve saati seçin</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label className="mb-2 block">Tarih</Label>
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate || undefined}
                    onSelect={(date) => {
                      setSelectedDate(date || null);
                      setSelectedTime(''); // Reset time when date changes
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    locale={tr}
                    className="rounded-md border w-full"
                  />
                </div>
                {selectedDate && (
                  <div className="space-y-2">
                    <Label>Uygun Saatler</Label>
                    {isSlotsLoading ? (
                      <div className="grid grid-cols-4 gap-2">
                        {[...Array(8)].map((_, i) => (
                          <div key={i} className="h-10 bg-muted animate-pulse rounded" />
                        ))}
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <CalendarIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">
                          {format(selectedDate, 'd MMMM yyyy', { locale: tr })} için uygun slot bulunamadı
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {availableSlots.map((slot) => (
                          <Button
                            key={slot}
                            type="button"
                            variant={selectedTime === slot ? 'default' : 'outline'}
                            onClick={() => setSelectedTime(slot)}
                            className="h-10 text-sm"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-1">Müşteri Bilgileri</h3>
                <p className="text-sm text-muted-foreground">Müşteri iletişim bilgilerini girin</p>
              </div>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="customer-name">
                    Ad Soyad <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-name"
                    value={customerData.name}
                    onChange={(e) => setCustomerData({ ...customerData, name: e.target.value })}
                    placeholder="Ahmet Yılmaz"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-phone">
                    Telefon <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="customer-phone"
                    value={customerData.phone}
                    onChange={(e) => setCustomerData({ ...customerData, phone: e.target.value })}
                    placeholder="05XX XXX XX XX"
                    className="mt-1"
                  />
                  {customerData.phone && !/^05\d{9}$/.test(customerData.phone.replace(/\s/g, '')) && (
                    <p className="text-xs text-destructive mt-1">
                      Geçerli bir telefon numarası girin (05XX XXX XX XX)
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="customer-email">E-posta</Label>
                  <Input
                    id="customer-email"
                    type="email"
                    value={customerData.email}
                    onChange={(e) => setCustomerData({ ...customerData, email: e.target.value })}
                    placeholder="ornek@email.com"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="customer-notes">Notlar</Label>
                  <Textarea
                    id="customer-notes"
                    value={customerData.notes}
                    onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
                    placeholder="Özel istekler veya notlar..."
                    rows={3}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <DialogFooter className="gap-2 sm:gap-0">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
              disabled={isSubmitting}
              className="sm:mr-2"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Geri
            </Button>
          )}

          {step < maxStep ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!canProceedToNextStep() || isInitialLoading}
            >
              İleri
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceedToNextStep() || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Randevu Oluştur
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}