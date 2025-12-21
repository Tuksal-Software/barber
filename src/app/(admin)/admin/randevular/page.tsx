"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
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
import { parseTimeToMinutes, minutesToTime } from "@/lib/time";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

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
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
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
  const [selectedDuration, setSelectedDuration] = useState<15 | 30 | 45 | 60>(30);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, selectedBarber, selectedStatus]);

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
        status: r.status,
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
    
    if (appointment.status === 'pending' || !appointment.requestedEndTime) {
      setSelectedDuration(60);
      return;
    }
    
    const startMinutes = parseTimeToMinutes(appointment.requestedStartTime);
    const endMinutes = parseTimeToMinutes(appointment.requestedEndTime);
    const maxDuration = endMinutes - startMinutes;
    
    if (maxDuration >= 60) {
      setSelectedDuration(60);
    } else if (maxDuration >= 45) {
      setSelectedDuration(45);
    } else if (maxDuration >= 30) {
      setSelectedDuration(30);
    } else {
      setSelectedDuration(15);
    }
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

  const handleCancel = async () => {
    if (!selectedAppointment) return;

    setActionLoading(true);
    try {
      await cancelAppointmentRequest({
        appointmentRequestId: selectedAppointment.id,
      });

      toast.success("Randevu iptal edildi");
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
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Onay Bekliyor</Badge>;
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
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-card"
                  onClick={() => handleAppointmentClick(appointment)}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{appointment.customerName}</h4>
                        {getStatusBadge(appointment.status)}
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(appointment.date)}</span>
                        </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {appointment.status === 'pending' 
                            ? `Talep Edilen Saat: ${appointment.requestedStartTime}`
                            : (() => {
                                const slot = appointment.appointmentSlots?.[0];
                                if (slot) {
                                  return `${slot.startTime} - ${slot.endTime}`;
                                }
                                return '—';
                              })()
                          }
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
                          {selectedAppointment.status === 'pending'
                            ? `Talep Edilen Saat: ${selectedAppointment.requestedStartTime}`
                            : (() => {
                                const slot = selectedAppointment.appointmentSlots?.[0];
                                if (slot) {
                                  return `${slot.startTime} - ${slot.endTime}`;
                                }
                                return '—';
                              })()
                          }
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

                {selectedAppointment.status === 'pending' && (
                  <div className="space-y-4 pt-4 border-t border-border">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Onaylanacak Süre (dakika)
                      </label>
                      <Select 
                        value={selectedDuration.toString()} 
                        onValueChange={(value) => setSelectedDuration(parseInt(value) as 15 | 30 | 45 | 60)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[15, 30, 45, 60].map(duration => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {duration} dakika
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={actionLoading}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reddet
                      </Button>
                      <Button
                        className="flex-1"
                        onClick={handleApprove}
                        disabled={actionLoading}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Onayla
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
