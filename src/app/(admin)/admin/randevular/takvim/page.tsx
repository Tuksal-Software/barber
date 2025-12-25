"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
import { getCalendarAppointments, CalendarAppointment } from "@/lib/actions/appointment-query.actions";
import { approveAppointmentRequest, cancelAppointmentRequest } from "@/lib/actions/appointment.actions";
import { parseTimeToMinutes, minutesToTime, overlaps } from "@/lib/time";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface Barber {
  id: string;
  name: string;
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
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function normalizeTime(time: string): string {
  const trimmed = time.trim();
  const first5 = trimmed.slice(0, 5);
  const colonIndex = first5.indexOf(':');
  
  if (colonIndex === -1) {
    return '00:00';
  }
  
  const h = first5.slice(0, colonIndex);
  const m = first5.slice(colonIndex + 1);
  const hours = h.padStart(2, '0');
  const minutes = m.padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

function getAppointmentsForDate(
  appointments: CalendarAppointment[],
  dateKey: string,
  barberId: string | null
): CalendarAppointment[] {
  return appointments.filter(apt => {
    if (apt.date !== dateKey) return false;
    if (barberId && barberId !== 'all' && apt.barberId !== barberId) return false;
    return true;
  });
}


function getStatusPriority(status: CalendarAppointment['status']): number {
  switch (status) {
    case 'approved': return 3;
    case 'pending': return 2;
    case 'cancelled': return 1;
    case 'rejected': return 1;
    default: return 0;
  }
}

function getPrimaryAppointment(appointments: CalendarAppointment[]): CalendarAppointment | null {
  if (appointments.length === 0) return null;
  return appointments.reduce((primary, current) => {
    const primaryPriority = getStatusPriority(primary.status);
    const currentPriority = getStatusPriority(current.status);
    return currentPriority > primaryPriority ? current : primary;
  });
}

const SLOT_HEIGHT = 40;
const DAY_START = "10:00";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getSlotIndexSafe(time: string): number {
  const t = normalizeTime(time);
  const idx = TIME_SLOTS.findIndex(s => s === t);
  if (idx !== -1) return idx;

  const minutes = parseTimeToMinutes(t);
  const dayStartMin = parseTimeToMinutes(DAY_START);
  const delta = minutes - dayStartMin;
  return clamp(Math.floor(delta / 30), 0, TIME_SLOTS.length - 1);
}

function getSlotSpan(startTime: string, endTime: string): { rowStart: number; rowEnd: number } {
  const startIdx = getSlotIndexSafe(startTime);
  const startMin = parseTimeToMinutes(normalizeTime(startTime));
  const endMin = parseTimeToMinutes(normalizeTime(endTime));
  const duration = Math.max(30, endMin - startMin);
  const span = Math.max(1, Math.ceil(duration / 30));

  const rowStart = startIdx + 1;
  const rowEnd = rowStart + span;
  return { rowStart, rowEnd };
}

function groupBySlot(apts: CalendarAppointment[]): Map<string, CalendarAppointment[]> {
  const map = new Map<string, CalendarAppointment[]>();
  for (const a of apts) {
    const key = `${a.date}-${normalizeTime(a.startTime)}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(a);
  }
  return map;
}


function getBorderColor(status: CalendarAppointment['status']): string {
  switch (status) {
    case 'approved': return 'border-green-500';
    case 'pending': return 'border-yellow-500';
    case 'cancelled': return 'border-red-500';
    case 'rejected': return 'border-red-500';
    default: return 'border-border';
  }
}

export default function TakvimPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<CalendarAppointment | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [selectedDuration, setSelectedDuration] = useState<30 | 60>(30);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const isMobile = useIsMobile();

  const weekDates = useMemo(() => getWeekDates(new Date(currentWeek)), [currentWeek]);
  const dateRange = useMemo(() => formatDateRange(weekDates), [weekDates]);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!selectedAppointment) return;
    const start = parseTimeToMinutes(normalizeTime(selectedAppointment.startTime));
    const end = parseTimeToMinutes(normalizeTime(selectedAppointment.endTime));
    const duration = end - start;
    setSelectedDuration(duration >= 60 ? 60 : 30);
  }, [selectedAppointment]);

  const loadData = async () => {
    setLoading(true);
    try {
      const barbersList = await getActiveBarbers();
      setBarbers(barbersList.map(b => ({ id: b.id, name: b.name })));

      const calendarAppointments = await getCalendarAppointments();
      setAppointments(calendarAppointments);
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

  const handleAppointmentClick = (appointment: CalendarAppointment) => {
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

  const getStatusBadge = (status: CalendarAppointment['status']) => {
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

  const isPastAppointment = (appointment: CalendarAppointment): boolean => {
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
      const appointmentStartTime = appointment.startTime;
      const appointmentStartMinutes = parseTimeToMinutes(normalizeTime(appointmentStartTime));
      return appointmentStartMinutes < currentMinutes;
    }

    return false;
  };

  const getCancelledCount = (
    appointment: CalendarAppointment,
    allAppointments: CalendarAppointment[]
  ): number => {
    const normalizedStartTime = normalizeTime(appointment.startTime);
    return allAppointments.filter(
      apt =>
        apt.date === appointment.date &&
        normalizeTime(apt.startTime) === normalizedStartTime &&
        (apt.status === 'cancelled' || apt.status === 'rejected')
    ).length;
  };

  const filteredAppointments = useMemo(() => {
    if (selectedBarber === 'all') return appointments;
    return appointments.filter(apt => apt.barberId === selectedBarber);
  }, [appointments, selectedBarber]);

  const dayAppointments = useMemo(() => {
    if (isMobile) {
      const dateKey = formatDateKey(weekDates[selectedDay]);
      const dayAppts = filteredAppointments.filter(apt => apt.date === dateKey);
      const groupedByTimeSlot = groupBySlot(dayAppts);
      const primaryAppointments: Array<{
        appointment: CalendarAppointment;
        cancelledCount: number;
      }> = [];
      
      groupedByTimeSlot.forEach((appointmentsInSlot) => {
        const primary = getPrimaryAppointment(appointmentsInSlot);
        if (primary) {
          const cancelledCount = appointmentsInSlot.filter(a => a.status === 'cancelled' || a.status === 'rejected').length;
          primaryAppointments.push({
            appointment: primary,
            cancelledCount,
          });
        }
      });
      
      return primaryAppointments.sort((a, b) => {
        const aStart = parseTimeToMinutes(normalizeTime(a.appointment.startTime));
        const bStart = parseTimeToMinutes(normalizeTime(b.appointment.startTime));
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
                  dayAppointments.map(({ appointment, cancelledCount }) => {
                    const borderColor = getBorderColor(appointment.status);
                    return (
                      <div
                        key={appointment.id}
                        className={`p-4 border-2 ${borderColor} rounded-lg cursor-pointer hover:bg-muted/50 transition-colors bg-card relative`}
                        onClick={() => handleAppointmentClick(appointment)}
                      >
                        {appointment.status !== 'cancelled' && appointment.status !== 'rejected' && cancelledCount > 0 && (
                          <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                            {Array.from({ length: Math.min(3, cancelledCount) }).map((_, i) => (
                              <span key={i} className="w-2 h-2 bg-red-500 rounded-full" />
                            ))}
                            {cancelledCount > 3 && (
                              <span className="text-[10px] text-red-400 font-semibold">+{cancelledCount - 3}</span>
                            )}
                          </div>
                        )}
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
                                  {`${normalizeTime(appointment.startTime)} - ${normalizeTime(appointment.endTime)}`}
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
                    );
                  })
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

                    const groupedByTimeSlot = groupBySlot(dayAppointments);
                    const renderedAppointments: Array<{
                      appointment: CalendarAppointment;
                      cancelledCount: number;
                    }> = [];

                    groupedByTimeSlot.forEach((appointmentsInSlot) => {
                      const cancelledCount = appointmentsInSlot.filter(
                        a => a.status === 'cancelled' || a.status === 'rejected'
                      ).length;
                      
                      const visible = appointmentsInSlot.filter(
                        a => a.status === 'approved' || a.status === 'pending'
                      );
                      
                      if (visible.length === 0) return;
                      
                      let primary: CalendarAppointment | null = null;
                      const approved = visible.find(a => a.status === 'approved');
                      if (approved) {
                        primary = approved;
                      } else {
                        const pending = visible.find(a => a.status === 'pending');
                        if (pending) {
                          primary = pending;
                        }
                      }
                      
                      if (primary) {
                        renderedAppointments.push({
                          appointment: primary,
                          cancelledCount,
                        });
                      }
                    });

                    return (
                      <div
                        key={dayIndex}
                        className="absolute top-0"
                        style={{
                          left: `${(dayIndex + 1) * (100 / 8)}%`,
                          width: `${100 / 8}%`,
                          height: `${TIME_SLOTS.length * SLOT_HEIGHT}px`,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateRows: `repeat(${TIME_SLOTS.length}, ${SLOT_HEIGHT}px)`,
                            height: `${TIME_SLOTS.length * SLOT_HEIGHT}px`,
                          }}
                        >
                          {renderedAppointments.map(({ appointment, cancelledCount }) => {
                            const { rowStart, rowEnd } = getSlotSpan(appointment.startTime, appointment.endTime);
                            const borderColor = getBorderColor(appointment.status);
                            
                            return (
                              <div
                                key={appointment.id}
                                className={`mx-1 my-[2px] rounded-md p-2 cursor-pointer hover:opacity-80 transition-opacity bg-card border-2 ${borderColor} shadow-sm z-10 overflow-hidden relative`}
                                style={{
                                  gridRowStart: rowStart,
                                  gridRowEnd: rowEnd,
                                  minHeight: `${SLOT_HEIGHT}px`,
                                }}
                                onClick={() => handleAppointmentClick(appointment)}
                              >
                                {cancelledCount > 0 && (
                                  <div className="absolute top-1 right-1 flex items-center gap-1 z-20">
                                    {Array.from({ length: Math.min(3, cancelledCount) }).map((_, i) => (
                                      <span key={i} className="w-2 h-2 bg-red-500 rounded-full" />
                                    ))}
                                    {cancelledCount > 3 && (
                                      <span className="text-[10px] text-red-400 font-semibold">+{cancelledCount - 3}</span>
                                    )}
                                  </div>
                                )}
                                <div className="text-xs font-semibold text-foreground truncate">
                                  {appointment.customerName}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {`${normalizeTime(appointment.startTime)} - ${normalizeTime(appointment.endTime)}`}
                                </div>
                                <div className="mt-1 flex-shrink-0">
                                  {getStatusBadge(appointment.status)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
                          {`${normalizeTime(selectedAppointment.startTime)} - ${normalizeTime(selectedAppointment.endTime)}`}
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
                          {[30, 60].map(duration => (
                            <SelectItem key={duration} value={duration.toString()}>
                              {duration} dakika
                            </SelectItem>
                          ))}
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
                İptal Nedeni (opsiyonel)
              </label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="İptal nedeni..."
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

