"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Calendar,
  Clock,
  User,
  Phone,
  Mail
} from "lucide-react";
import { getBarbers } from "@/lib/actions/barber.actions";
import { getAppointmentsByWeek, getAppointmentById } from "@/lib/actions/appointment";
import { getAppointmentSettings } from "@/lib/actions/settings";
import { AppointmentDetailModal } from "./components/AppointmentDetailModal";
import { CreateAppointmentModal } from "./components/CreateAppointmentModal";
import { BarberFilter } from "./components/BarberFilter";

interface Barber {
  id: string;
  name: string;
  image?: string;
}

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  barber: Barber;
}

const dayNames = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
const monthNames = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

// Berber renkleri
const barberColors = [
  'bg-blue-100 border-blue-400 text-blue-900',
  'bg-green-100 border-green-400 text-green-900',
  'bg-purple-100 border-purple-400 text-purple-900',
  'bg-orange-100 border-orange-400 text-orange-900',
  'bg-pink-100 border-pink-400 text-pink-900',
  'bg-indigo-100 border-indigo-400 text-indigo-900',
  'bg-teal-100 border-teal-400 text-teal-900',
];

export default function RandevularPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedBarber, setSelectedBarber] = useState<string>('all');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [serviceBased, setServiceBased] = useState(false);

  // Haftanın başlangıcını hesapla (Pazartesi)
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStartDate = new Date(d);
    weekStartDate.setDate(diff);
    weekStartDate.setHours(0, 0, 0, 0);
    return weekStartDate;
  };

  const weekStart = getWeekStart(currentWeek);

  useEffect(() => {
    loadData();
  }, [currentWeek, selectedBarber]);

  const loadData = async () => {
    setLoading(true);
    try {
      const settings = await getAppointmentSettings();
      setServiceBased(!!settings.data?.serviceBasedDuration);
      // Berberleri yükle
      const barbersResult = await getBarbers();
      if (barbersResult.success && barbersResult.data) {
        setBarbers(barbersResult.data as any);
      }

      // Randevuları yükle - Filtreleme kontrolü
      const appointmentsResult = await getAppointmentsByWeek(
        weekStart,
        selectedBarber === 'all' ? undefined : selectedBarber
      );
      
      console.log('Appointments fetch result:', appointmentsResult);
      console.log('Selected barber:', selectedBarber);
      console.log('Week start:', weekStart);
      
      if (appointmentsResult.success && appointmentsResult.data) {
        console.log('Appointments data:', appointmentsResult.data);
        setAppointments(appointmentsResult.data as any);
      } else {
        console.log('No appointments found or error:', appointmentsResult);
        setAppointments([]);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const navigateWeek = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentWeek);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 7);
    } else if (direction === 'next') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setTime(Date.now());
    }
    setCurrentWeek(newDate);
  };

  const formatDateRange = () => {
    const endDate = new Date(weekStart);
    endDate.setDate(weekStart.getDate() + 6);
    
    const startDay = weekStart.getDate();
    const endDay = endDate.getDate();
    const month = monthNames[weekStart.getMonth()];
    const year = weekStart.getFullYear();
    
    return `${startDay}-${endDay} ${month} ${year}`;
  };

  const getAppointmentsForDay = (dayIndex: number) => {
    const targetDate = new Date(weekStart);
    targetDate.setDate(weekStart.getDate() + dayIndex);
    
    console.log('Getting appointments for day:', dayIndex, targetDate);
    const filtered = appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      const match = aptDate.getDate() === targetDate.getDate() &&
             aptDate.getMonth() === targetDate.getMonth() &&
             aptDate.getFullYear() === targetDate.getFullYear();
      if (match) {
        console.log('Found appointment:', apt.customerName, apt.startTime);
      }
      return match;
    });
    console.log('Filtered appointments:', filtered.length);
    return filtered;
  };

  const getBarberColor = (barberId: string) => {
    const index = barbers.findIndex(b => b.id === barberId);
    return barberColors[index % barberColors.length];
  };

  const handleAppointmentClick = async (appointmentId: string) => {
    try {
      const result = await getAppointmentById(appointmentId);
      if (result.success && result.data) {
        setSelectedAppointment(result.data as any);
        setDetailModalOpen(true);
      }
    } catch (error) {
      console.error("Error loading appointment:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Randevular</h1>
          <p className="text-gray-600">Randevu yönetimi ve takvim görünümü</p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Yeni Randevu
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <BarberFilter
              barbers={barbers}
              selectedBarber={selectedBarber}
              onBarberChange={setSelectedBarber}
            />
          </div>
        </CardContent>
      </Card>

      {/* Week Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigateWeek('prev')}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Önceki
            </Button>
            
            <div className="text-center">
              <h3 className="text-lg font-semibold">{formatDateRange()}</h3>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => navigateWeek('today')}>
                Bugün
              </Button>
              <Button variant="outline" onClick={() => navigateWeek('next')}>
                Sonraki
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Haftalık Takvim
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Header - Days */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="p-3 text-center font-semibold text-gray-600">
                  Saat
                </div>
                {dayNames.map((day, index) => {
                  const date = new Date(weekStart);
                  date.setDate(weekStart.getDate() + index);
                  const isToday = date.toDateString() === new Date().toDateString();
                  
                  return (
                    <div 
                      key={index}
                      className={`p-3 text-center font-semibold ${
                        isToday ? 'bg-blue-100 text-blue-900 rounded-lg' : 'text-gray-600'
                      }`}
                    >
                      <div>{day}</div>
                      <div className="text-sm">{date.getDate()}</div>
                    </div>
                  );
                })}
              </div>

              {/* Time Slots - 10:00-22:00 */}
              {Array.from({ length: 24 }, (_, slotIndex) => {
                const hour = Math.floor(slotIndex / 2) + 10;
                const minute = (slotIndex % 2) * 30;
                const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
                
                return (
                  <div key={slotIndex} className="grid grid-cols-8 gap-2 mb-2">
                    {/* Time Column */}
                    <div className="p-2 text-sm text-gray-600 text-center border-r">
                      {timeString}
                    </div>
                    
                    {/* Day Columns */}
                    {Array.from({ length: 7 }, (_, dayIndex) => {
                      const dayAppointments = getAppointmentsForDay(dayIndex)
                        .filter(apt => apt.startTime === timeString);
                      
                      return (
                        <div 
                          key={dayIndex}
                          className="min-h-[60px] p-1 border border-gray-200 hover:bg-gray-50 cursor-pointer"
                        >
                          {dayAppointments.map((appointment) => (
                            <div
                              key={appointment.id}
                              className={`p-2 rounded text-xs cursor-pointer transition-colors hover:shadow-md ${
                                appointment.status === 'cancelled' 
                                  ? 'bg-gray-100 border-gray-300 text-gray-500 opacity-60' 
                                  : getBarberColor(appointment.barber.id)
                              }`}
                              onClick={() => handleAppointmentClick(appointment.id)}
                            >
                              <div className={`font-medium truncate ${appointment.status === 'cancelled' ? 'line-through' : ''}`}>
                                {appointment.customerName}
                              </div>
                              <div className="text-xs opacity-75 truncate">
                                [{appointment.barber.name.split(' ').map(n => n[0]).join('')}]
                              </div>
                        {serviceBased && (appointment as any).totalPrice && (
                          <div className="text-[10px] mt-1 font-semibold">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number((appointment as any).totalPrice))}
                          </div>
                        )}
                              {appointment.status === 'cancelled' && (
                                <div className="text-[10px] mt-1 font-semibold">İPTAL</div>
                              )}
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mobile List View */}
      <div className="md:hidden">
        <Card>
          <CardHeader>
            <CardTitle>Randevu Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {appointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="p-4 border rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleAppointmentClick(appointment.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{appointment.customerName}</h4>
                    <Badge variant={
                      appointment.status === 'confirmed' ? 'default' :
                      appointment.status === 'pending' ? 'secondary' :
                      appointment.status === 'completed' ? 'outline' : 'destructive'
                    }>
                      {appointment.status === 'confirmed' ? 'Onaylandı' :
                       appointment.status === 'pending' ? 'Beklemede' :
                       appointment.status === 'completed' ? 'Tamamlandı' : 'İptal Edildi'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      {new Date(appointment.date).toLocaleDateString('tr-TR')} - {appointment.startTime}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {appointment.barber.name}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" />
                      {appointment.customerPhone}
                    </div>
                  </div>
                </div>
              ))}
              
              {appointments.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Bu hafta için randevu bulunmuyor
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {selectedAppointment && (
        <AppointmentDetailModal
          appointment={selectedAppointment}
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          onSuccess={loadData}
        />
      )}
      
      <CreateAppointmentModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={loadData}
      />
    </div>
  );
}
