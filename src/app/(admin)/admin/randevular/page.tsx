"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { getActiveBarbers } from "@/lib/actions/barber.actions";
import { getAllAppointmentRequests } from "@/lib/actions/appointment-query.actions";
import { approveAppointmentRequest, cancelAppointmentRequest } from "@/lib/actions/appointment.actions";
import { parseTimeToMinutes, minutesToTime, formatAppointmentTimeRange } from "@/lib/time";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Barber {
  id: string;
  name: string;
}

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  date: string;
  requestedStartTime: string;
  requestedEndTime: string | null;
  serviceType: string | null;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  cancelledBy: string | null;
  barberId: string;
  barberName: string;
  appointmentSlots?: Array<{
    startTime: string;
    endTime: string;
  }>;
}

type StatusFilter = 'all' | 'pending' | 'approved' | 'cancelled';

export default function RandevularPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>('all');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(30);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedBarber, selectedStatus]);

  useEffect(() => {
    if (!selectedAppointment) {
      return;
    }

    if (selectedAppointment.status === 'approved' && selectedAppointment.appointmentSlots && selectedAppointment.appointmentSlots.length > 0) {
      const slot = selectedAppointment.appointmentSlots[0];
      const startMinutes = parseTimeToMinutes(slot.startTime);
      const endMinutes = parseTimeToMinutes(slot.endTime);
      const duration = endMinutes - startMinutes;
      
      if (duration === 30 || duration === 60) {
        setSelectedDuration(duration as 30 | 60);
        return;
      }
    }

    if (selectedAppointment.status === 'pending' || selectedAppointment.status === 'rejected') {
      if (!selectedAppointment.requestedEndTime) {
        if (selectedAppointment.serviceType === 'sac_sakal') {
          setSelectedDuration(60);
        } else {
          setSelectedDuration(30);
        }
        return;
      }
      
      const startMinutes = parseTimeToMinutes(selectedAppointment.requestedStartTime);
      const endMinutes = parseTimeToMinutes(selectedAppointment.requestedEndTime);
      const maxDuration = endMinutes - startMinutes;
      
      if (maxDuration >= 60) {
        setSelectedDuration(60);
      } else {
        setSelectedDuration(30);
      }
    } else {
      if (selectedAppointment.requestedEndTime) {
        const startMinutes = parseTimeToMinutes(selectedAppointment.requestedStartTime);
        const endMinutes = parseTimeToMinutes(selectedAppointment.requestedEndTime);
        const duration = endMinutes - startMinutes;
        if (duration === 30 || duration === 60) {
          setSelectedDuration(duration as 30 | 60);
        } else {
          setSelectedDuration(30);
        }
      } else {
        setSelectedDuration(30);
      }
    }
  }, [selectedAppointment]);

  const loadData = async () => {
    setLoading(true);
    try {
      const barbersList = await getActiveBarbers();
      setBarbers(barbersList.map(b => ({ id: b.id, name: b.name })));

      const requests = await getAllAppointmentRequests();
      
      setAppointments(requests.map(r => ({
        id: r.id,
        customerName: r.customerName,
        customerPhone: r.customerPhone,
        customerEmail: r.customerEmail || undefined,
        date: r.date,
        requestedStartTime: r.requestedStartTime,
        requestedEndTime: r.requestedEndTime,
        serviceType: r.serviceType,
        status: r.status,
        cancelledBy: r.cancelledBy,
        barberId: r.barberId,
        barberName: r.barberName,
        appointmentSlots: r.appointmentSlots,
      })));
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Randevular yüklenirken hata oluştu");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = [...appointments];

    if (selectedBarber !== 'all') {
      filtered = filtered.filter(apt => apt.barberId === selectedBarber);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(apt => apt.status === selectedStatus);
    }

    setFilteredAppointments(filtered);
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsSheetOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedAppointment) return;

    setActionLoading(true);
    try {
      await approveAppointmentRequest({
        appointmentRequestId: selectedAppointment.id,
        approvedDurationMinutes: selectedDuration,
      });

      toast.success("Randevu onaylandı");
      setIsSheetOpen(false);
      setSelectedAppointment(null);
      await loadData();
    } catch (error) {
      console.error("Error approving appointment:", error);
      toast.error(error instanceof Error ? error.message : "Randevu onaylanırken hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelClick = () => {
    setIsCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!selectedAppointment) return;

    setActionLoading(true);
    try {
      await cancelAppointmentRequest({
        appointmentRequestId: selectedAppointment.id,
        reason: cancelReason.trim() || undefined,
      });

      toast.success("Randevu iptal edildi");
      setIsCancelDialogOpen(false);
      setCancelReason("");
      setIsSheetOpen(false);
      setSelectedAppointment(null);
      await loadData();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      toast.error(error instanceof Error ? error.message : "Randevu iptal edilirken hata oluştu");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Onaylandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Bekliyor</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">İptal</Badge>;
      case 'rejected':
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Reddedildi</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const getServiceTypeText = (serviceType: string | null, requestedStartTime: string, requestedEndTime: string | null): string => {
    if (serviceType === 'sac') return 'Saç'
    if (serviceType === 'sakal') return 'Sakal'
    if (serviceType === 'sac_sakal') return 'Saç ve Sakal'
    
    if (!requestedEndTime) return 'Belirtilmedi'
    
    const startMinutes = parseTimeToMinutes(requestedStartTime)
    const endMinutes = parseTimeToMinutes(requestedEndTime)
    const duration = endMinutes - startMinutes
    
    if (duration === 30) return '30 dk'
    if (duration === 60) return '60 dk'
    return 'Belirtilmedi'
  };

  const isPastAppointment = (appointment: Appointment): boolean => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const appointmentDate = appointment.date;
    const isPastDate = appointmentDate < today;
    const isToday = appointmentDate === today;

    if (isPastDate) {
      return true;
    }

    if (isToday) {
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const appointmentStartTime = appointment.status === 'approved' && appointment.appointmentSlots && appointment.appointmentSlots.length > 0
        ? appointment.appointmentSlots[0].startTime
        : appointment.requestedStartTime;
      const appointmentStartMinutes = parseTimeToMinutes(appointmentStartTime);
      return appointmentStartMinutes < currentMinutes;
    }

    return false;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-foreground">Randevular</h1>
        <p className="text-muted-foreground">Randevu yönetimi ve onay işlemleri</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Berber Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Berberler</SelectItem>
                {barbers.map((barber) => (
                  <SelectItem key={barber.id} value={barber.id}>
                    {barber.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedStatus} onValueChange={(value) => setSelectedStatus(value as StatusFilter)}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Durum Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                <SelectItem value="pending">Bekleyen</SelectItem>
                <SelectItem value="approved">Onaylanan</SelectItem>
                <SelectItem value="cancelled">İptal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Randevu Listesi</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Randevu bulunamadı
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className={cn(
                    "p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors",
                    appointment.status === 'cancelled' && appointment.cancelledBy === 'customer' 
                      ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800"
                      : "bg-card"
                  )}
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{appointment.customerName}</h4>
                        {getStatusBadge(appointment.status)}
                        {appointment.status === 'cancelled' && appointment.cancelledBy === 'admin' && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Badge variant="destructive" className="text-xs">
                                  Çalışma saatleri kapatıldı
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Bu randevu çalışma saatleri kapatıldığı için iptal edilmiştir.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                        {appointment.status === 'cancelled' && appointment.cancelledBy === 'customer' && (
                          <Badge variant="outline" className="text-xs">
                            Müşteri
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            {formatAppointmentTimeRange(
                              appointment.requestedStartTime,
                              appointment.requestedEndTime,
                              appointment.appointmentSlots
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Hizmet:</span>
                          <span className="text-xs font-medium text-primary">
                            {getServiceTypeText(
                              appointment.serviceType,
                              appointment.requestedStartTime,
                              appointment.requestedEndTime
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{appointment.barberName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span>{appointment.customerPhone}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent 
          side={isMobile ? "bottom" : "right"}
          className={isMobile ? "h-[90vh] overflow-y-auto" : "sm:max-w-md overflow-y-auto"}
        >
          {selectedAppointment && (
            <>
              <SheetHeader>
                <SheetTitle>Randevu Detayı</SheetTitle>
                <SheetDescription>
                  Randevu bilgileri ve işlemler
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Müşteri Bilgileri</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground font-medium">{selectedAppointment.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedAppointment.customerPhone}</span>
                      </div>
                      {selectedAppointment.customerEmail && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{selectedAppointment.customerEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Randevu Bilgileri</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{formatDate(selectedAppointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">
                          {formatAppointmentTimeRange(
                            selectedAppointment.requestedStartTime,
                            selectedAppointment.requestedEndTime,
                            selectedAppointment.appointmentSlots
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Hizmet:</span>
                        <span className="text-foreground font-medium">
                          {getServiceTypeText(
                            selectedAppointment.serviceType,
                            selectedAppointment.requestedStartTime,
                            selectedAppointment.requestedEndTime
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{selectedAppointment.barberName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">Durum:</span>
                        {getStatusBadge(selectedAppointment.status)}
                      </div>
                    </div>
                  </div>
                </div>

                {(selectedAppointment.status === 'pending' || selectedAppointment.status === 'approved' || selectedAppointment.status === 'rejected') && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Onaylanacak Süre (dakika)
                      </label>
                      <Select 
                        value={selectedDuration.toString()} 
                        onValueChange={(value) => setSelectedDuration(parseInt(value) as 30 | 60)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {(() => {
                            if (!selectedAppointment.requestedEndTime) {
                              return [30, 60].map(duration => (
                                <SelectItem key={duration} value={duration.toString()}>
                                  {duration} dakika
                                </SelectItem>
                              ));
                            }
                            
                            const options = [30, 60];
                            
                            return options.map(duration => (
                              <SelectItem key={duration} value={duration.toString()}>
                                {duration} dakika
                              </SelectItem>
                            ));
                          })()}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {isPastAppointment(selectedAppointment) ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="flex-1">
                                <Button
                                  variant="destructive"
                                  className="flex-1 w-full opacity-50 cursor-not-allowed"
                                  disabled
                                >
                                  <XCircle className="h-4 w-4 mr-2" />
                                  İptal Et
                                </Button>
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Geçmiş randevular iptal edilemez</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ) : (
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={handleCancelClick}
                          disabled={actionLoading}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          İptal Et
                        </Button>
                      )}
                      <Button
                        className="flex-1"
                        onClick={handleApprove}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        {selectedAppointment.status === 'approved' ? 'Süreyi Güncelle' : 'Onayla'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Randevuyu İptal Et</DialogTitle>
            <DialogDescription>
              Randevuyu iptal etmek istediğinizden emin misiniz? İptal nedeni opsiyoneldir.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                İptal Nedeni (Neden girilmezse gönderilecek neden: İşletme tarafından kapatılan saatler)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="İşletme tarafından kapatılan saatler"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsCancelDialogOpen(false);
                setCancelReason("");
              }}
              disabled={actionLoading}
            >
              İptal
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? "İptal ediliyor..." : "Onayla"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
