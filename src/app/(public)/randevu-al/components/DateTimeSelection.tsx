'use client';

import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { ModernDatePicker } from '@/components/ui/modern-date-picker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAvailableSlots } from '@/lib/actions/appointment';
import { format, addDays, isToday, isSameDay } from 'date-fns';
import { tr } from 'date-fns/locale';
import { Calendar as CalendarIcon, Clock, RefreshCw } from 'lucide-react';

interface TimeSlot {
  time: string;
  isAvailable: boolean;
}

interface DateTimeSelectionProps {
  barberId: string;
  onSelect: (date: Date, timeSlot: string) => void;
  selectedDate?: Date | null;
  selectedTime?: string;
  totalDuration?: number;
}

export function DateTimeSelection({ 
  barberId, 
  onSelect, 
  selectedDate, 
  selectedTime,
  totalDuration,
}: DateTimeSelectionProps) {
  const [date, setDate] = useState<Date | undefined>(selectedDate || undefined);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tarih değiştiğinde slot'ları yükle
  useEffect(() => {
    if (date) {
      loadTimeSlots(date);
    }
  }, [date, barberId, totalDuration]);

  const loadTimeSlots = async (selectedDate: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await getAvailableSlots(barberId, selectedDate, totalDuration);
      
      if (result.success && result.data) {
        setTimeSlots(result.data);
      } else {
        setError(result.error || 'Müsait saatler yüklenemedi');
      }
    } catch (err) {
      setError('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleTimeSelect = (time: string) => {
    if (date) {
      onSelect(date, time);
    }
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  const getDayName = (date: Date) => {
    const days = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return days[date.getDay()];
  };

  const getDateInfo = (date: Date) => {
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (isSameDay(date, today)) {
      return { label: 'Bugün', color: 'bg-green-100 text-green-800' };
    } else if (isSameDay(date, tomorrow)) {
      return { label: 'Yarın', color: 'bg-blue-100 text-blue-800' };
    } else {
      return { label: getDayName(date), color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Tarih ve Saat Seçin</h2>
        <p className="text-gray-600">Uygun tarih ve saati seçerek devam edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol Panel - Takvim */}
        <div className="animate-in slide-in-from-left-50 duration-500">
            <ModernDatePicker
              selected={date}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const maxDate = new Date();
                maxDate.setDate(maxDate.getDate() + 30);
                maxDate.setHours(23, 59, 59, 999);
                return date < today || date > maxDate;
              }}
              className="w-full"
            />
            
            {date && (
              <div className="mt-6 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-teal-600 font-medium">Seçili Tarih</p>
                    <p className="font-semibold text-gray-900 text-lg">
                      {format(date, 'dd MMMM yyyy, EEEE', { locale: tr })}
                    </p>
                    <Badge className={getDateInfo(date).color} variant="secondary">
                      {getDateInfo(date).label}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDate(undefined)}
                    className="text-gray-500 hover:text-gray-700 border-teal-200 hover:border-teal-300"
                  >
                    Temizle
                  </Button>
                </div>
              </div>
            )}
        </div>

        {/* Sağ Panel - Saat Seçimi */}
        <Card className="p-6 animate-in slide-in-from-right-50 duration-500">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-teal-600" />
              Müsait Saatler
              {date && (
                <span className="text-sm font-normal text-gray-600 ml-2">
                  - {format(date, 'dd MMMM', { locale: tr })}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!date ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">📅</div>
                <p className="text-gray-600">Önce bir tarih seçin</p>
              </div>
            ) : loading ? (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-14 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-red-500 text-4xl mb-4">⚠️</div>
                <p className="text-red-600 mb-4">{error}</p>
                <Button 
                  onClick={() => loadTimeSlots(date)}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Tekrar Dene
                </Button>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-4xl mb-4">😔</div>
                <p className="text-gray-600">Bu tarihte müsait saat bulunmuyor</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto pr-2">
                {timeSlots.map((slot, index) => (
                  <Button
                    key={slot.time}
                    variant={selectedTime === slot.time ? "default" : "outline"}
                    disabled={!slot.isAvailable}
                    onClick={() => slot.isAvailable && handleTimeSelect(slot.time)}
                    className={cn(
                      "h-14 text-base font-semibold transition-all duration-300 animate-in fade-in-50 rounded-xl border-2",
                      slot.isAvailable 
                        ? selectedTime === slot.time
                          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105 border-teal-400"
                          : "hover:bg-teal-50 hover:text-teal-600 hover:border-teal-300 hover:scale-105 hover:shadow-md border-gray-200"
                        : "opacity-50 cursor-not-allowed line-through bg-gray-100 border-gray-200"
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {formatTime(slot.time)}
                  </Button>
                ))}
              </div>
            )}

            {selectedTime && (
              <div className="mt-4 p-3 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-lg border border-teal-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-teal-800">
                      Seçilen Saat: {formatTime(selectedTime)}
                    </p>
                    <p className="text-sm text-teal-600">
                      {format(date!, 'dd MMMM yyyy', { locale: tr })}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(date!, '')}
                    className="text-teal-600 hover:text-teal-700"
                  >
                    Değiştir
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedDate && selectedTime && (
        <div className="text-center">
          <Button
            onClick={() => onSelect(selectedDate, selectedTime)}
            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            Devam Et →
          </Button>
        </div>
      )}
    </div>
  );
}
