"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { 
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { getActiveBarbers } from "@/lib/actions/barber.actions";
import { getAllAppointmentRequests } from "@/lib/actions/appointment-query.actions";
import { approveAppointmentRequest, cancelAppointmentRequest } from "@/lib/actions/appointment.actions";
import { parseTimeToMinutes, minutesToTime, overlaps } from "@/lib/time";
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
}

const TIME_SLOTS = (() => {
  const slots: string[] = [];
  for (let hour = 10; hour < 22; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    slots.push(`${hour.toString().padStart(2, '0')}:30`);
  }
  return slots;
})();

const DAYS_OF_WEEK = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function formatDateRange(dates: Date[]): string {
  const first = dates[0];
  const last = dates[dates.length - 1];
  const firstStr = first.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' });
  const lastStr = last.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  return `${firstStr} – ${lastStr}`;
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getAppointmentsForDate(
  appointments: Appointment[],
  dateKey: string,
  barberId: string | null
): Appointment[] {
  return appointments.filter(apt => {
    if (apt.date !== dateKey) return false;
    if (barberId && barberId !== 'all' && apt.barberId !== barberId) return false;
    return true;
  });
}

export default function TakvimPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<15 | 30 | 45 | 60>(30);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const isMobile = useIsMobile();

  const weekDates = useMemo(() => getWeekDates(new Date(currentWeek)), [currentWeek]);
  const dateRange = useMemo(() => formatDateRange(weekDates), [weekDates]);

  useEffect(() => {
    loadData();
  }, []);

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
      })));
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Randevular yüklenirken hata oluştu");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() - 7);
    setCurrentWeek(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeek);
    newDate.setDate(newDate.getDate() + 7);
    setCurrentWeek(newDate);
  };

  const goToToday = () => {
    setCurrentWeek(new Date());
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsSheetOpen(true);
    
    if (!appointment.requestedEndTime) {
      setSelectedDuration(30);
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
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Onay bekliyor</Badge>;
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

  const getAppointmentHeight = (appointment: Appointment): number => {
    if (!appointment.requestedEndTime) {
      return 40;
    }
    const startMinutes = parseTimeToMinutes(appointment.requestedStartTime);
    const endMinutes = parseTimeToMinutes(appointment.requestedEndTime);
    const durationMinutes = endMinutes - startMinutes;
    return (durationMinutes / 30) * 40;
  };

  const getAppointmentTop = (appointment: Appointment): number => {
    const startMinutes = parseTimeToMinutes(appointment.requestedStartTime);
    const dayStartMinutes = parseTimeToMinutes('10:00');
    const offsetMinutes = startMinutes - dayStartMinutes;
    return (offsetMinutes / 30) * 40;
  };

  const filteredAppointments = useMemo(() => {
    if (selectedBarber === 'all') return appointments;
    return appointments.filter(apt => apt.barberId === selectedBarber);
  }, [appointments, selectedBarber]);

  const dayAppointments = useMemo(() => {
    if (isMobile) {
      const dateKey = formatDateKey(weekDates[selectedDay]);
      return filteredAppointments
        .filter(apt => apt.date === dateKey)
        .sort((a, b) => {
          const aStart = parseTimeToMinutes(a.requestedStartTime);
          const bStart = parseTimeToMinutes(b.requestedStartTime);
          return aStart - bStart;
        });
    }
    return [];
  }, [isMobile, weekDates, selectedDay, filteredAppointments]);

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
        <h1 className="text-3xl font-bold text-foreground">Takvim</h1>
        <p className="text-muted-foreground">Randevu görünümü ve planlama</p>
      </div>

      <Card className="sticky top-0 z-10 border-b">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousWeek}
                className="h-9"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToToday}
                className="h-9"
              >
                Bugün
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextWeek}
                className="h-9"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="text-center md:text-left">
              <div className="text-lg font-semibold text-foreground">{dateRange}</div>
            </div>

            <div className="flex justify-center md:justify-end">
              <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                <SelectTrigger className="w-full md:w-[200px]">
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
            </div>
          </div>
        </CardContent>
      </Card>

      {isMobile ? (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weekDates.map((date, index) => {
              const dateKey = formatDateKey(date);
              const isToday = dateKey === formatDateKey(new Date());
              const isSelected = index === selectedDay;
              const dayAppts = filteredAppointments.filter(apt => apt.date === dateKey);
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDay(index)}
                  className={`flex-shrink-0 ${isToday ? "ring-2 ring-primary" : ""}`}
                >
                  <div className="flex flex-col items-center">
                    <div className="text-xs">{DAYS_OF_WEEK[index]}</div>
                    <div className="text-lg font-semibold">{date.getDate()}</div>
                    {dayAppts.length > 0 && (
                      <div className="text-xs mt-1">{dayAppts.length}</div>
                    )}
                  </div>
                </Button>
              );
            })}
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="space-y-3">
                {dayAppointments.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    Bu gün için randevu bulunamadı
                  </div>
                ) : (
                  dayAppointments.map((appointment) => (
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
                              <Clock className="h-4 w-4" />
                              <span>
                                {appointment.requestedStartTime}
                                {appointment.requestedEndTime && ` - ${appointment.requestedEndTime}`}
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
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6 p-0">
            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                <div className="grid grid-cols-8 border-b border-border">
                  <div className="p-2 border-r border-border bg-muted/30"></div>
                  {weekDates.map((date, index) => {
                    const dateKey = formatDateKey(date);
                    const isToday = dateKey === formatDateKey(new Date());
                    const dayAppts = filteredAppointments.filter(apt => apt.date === dateKey);
                    
                    return (
                      <div
                        key={index}
                        className={`p-2 border-r border-border text-center bg-muted/30 ${isToday ? "bg-primary/10" : ""} ${index === 6 ? "border-r-0" : ""}`}
                      >
                        <div className="text-xs text-muted-foreground">{DAYS_OF_WEEK[index]}</div>
                        <div className={`text-lg font-semibold ${isToday ? "text-primary" : "text-foreground"}`}>
                          {date.getDate()}
                        </div>
                        {dayAppts.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1">{dayAppts.length} randevu</div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="relative" style={{ height: `${TIME_SLOTS.length * 40}px` }}>
                  {TIME_SLOTS.map((slotTime, slotIndex) => {
                    const isHourMark = slotTime.endsWith(':00');
                    return (
                      <div key={slotIndex} className="absolute grid grid-cols-8 border-b border-border w-full" style={{ top: `${slotIndex * 40}px`, height: '40px' }}>
                        <div className={`p-2 border-r border-border bg-muted/30 text-sm text-muted-foreground flex items-start justify-end ${!isHourMark ? 'opacity-50' : ''}`}>
                          {isHourMark ? slotTime : ''}
                        </div>
                        {weekDates.map((date, dayIndex) => (
                          <div
                            key={dayIndex}
                            className={`border-r border-border ${dayIndex === 6 ? "border-r-0" : ""}`}
                          />
                        ))}
                      </div>
                    );
                  })}
                  
                  {weekDates.map((date, dayIndex) => {
                    const dateKey = formatDateKey(date);
                    const dayAppointments = getAppointmentsForDate(
                      filteredAppointments,
                      dateKey,
                      selectedBarber
                    );

                    return (
                      <div
                        key={dayIndex}
                        className="absolute top-0 bottom-0"
                        style={{
                          left: `${(dayIndex + 1) * (100 / 8)}%`,
                          width: `${100 / 8}%`,
                        }}
                      >
                        {dayAppointments.map((appointment) => {
                          const height = getAppointmentHeight(appointment);
                          const top = getAppointmentTop(appointment);
                          
                          return (
                            <div
                              key={appointment.id}
                              className="absolute left-1 right-1 rounded-md p-2 cursor-pointer hover:opacity-80 transition-opacity bg-card border border-border shadow-sm z-10 overflow-hidden"
                              style={{
                                top: `${top}px`,
                                height: `${height}px`,
                                minHeight: '40px',
                              }}
                              onClick={() => handleAppointmentClick(appointment)}
                            >
                              <div className="text-xs font-semibold text-foreground truncate">
                                {appointment.customerName}
                              </div>
                              <div className="text-xs text-muted-foreground truncate">
                                {appointment.requestedStartTime}
                                {appointment.requestedEndTime && ` - ${appointment.requestedEndTime}`}
                              </div>
                              <div className="mt-1 flex-shrink-0">
                                {getStatusBadge(appointment.status)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
                          {selectedAppointment.requestedStartTime}
                          {selectedAppointment.requestedEndTime && ` - ${selectedAppointment.requestedEndTime}`}
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
                          {(() => {
                            if (!selectedAppointment.requestedEndTime) {
                              return [30, 60].map(duration => (
                                <SelectItem key={duration} value={duration.toString()}>
                                  {duration} dakika
                                </SelectItem>
                              ));
                            }
                            
                            const startMinutes = parseTimeToMinutes(selectedAppointment.requestedStartTime);
                            const endMinutes = parseTimeToMinutes(selectedAppointment.requestedEndTime);
                            const maxDuration = endMinutes - startMinutes;
                            const options = [15, 30, 45, 60];
                            
                            return options
                              .filter(duration => duration <= maxDuration)
                              .map(duration => (
                                <SelectItem key={duration} value={duration.toString()}>
                                  {duration} dakika
                                </SelectItem>
                              ));
                          })()}
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

