'use client'
import { useState, useEffect } from 'react'
import { Barber } from '@/types'
import { Calendar, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { getBarberAvailability } from '@/lib/actions/appointment'
import { format, addDays, isToday, isSameDay } from 'date-fns'
import { tr } from 'date-fns/locale'

interface DateTimeSelectionProps {
  selectedBarber?: Barber
  selectedDate?: Date
  selectedTimeSlot?: string
  onDateTimeSelect: (date: Date, timeSlot: string) => void
}

interface TimeSlot {
  time: string
  isAvailable: boolean
}

export default function DateTimeSelection({ 
  selectedBarber, 
  selectedDate, 
  selectedTimeSlot, 
  onDateTimeSelect 
}: DateTimeSelectionProps) {
  const [localSelectedDate, setLocalSelectedDate] = useState<Date | undefined>(selectedDate)
  const [localSelectedTimeSlot, setLocalSelectedTimeSlot] = useState<string | undefined>(selectedTimeSlot)
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Berber seçildiğinde müsait saatleri al
  useEffect(() => {
    if (localSelectedDate && selectedBarber) {
      loadBarberAvailability()
    }
  }, [localSelectedDate, selectedBarber])

  const loadBarberAvailability = async () => {
    if (!localSelectedDate || !selectedBarber) return

    setLoading(true)
    setError(null)

    try {
      console.log('Seçilen tarih:', localSelectedDate)
      console.log('Seçilen berber ID:', selectedBarber.id)
      const result = await getBarberAvailability(
        selectedBarber.id, 
        localSelectedDate.toISOString()
      )

      console.log('API response:', result)
      if (result.success) {
        const raw = (result as any).timeSlots || (result as any).data?.timeSlots || []
        const normalized = (raw as any[]).map((s: any) => ({
          time: s.time ?? `${s.start}-${s.end}`,
          isAvailable: s.isAvailable ?? s.available ?? false,
        }))
        setAvailableTimeSlots(normalized)
      } else {
        setError(result.error || 'Müsaitlik bilgisi alınamadı')
        setAvailableTimeSlots([])
      }
    } catch (error) {
      console.error('Load availability error:', error)
      setError('Müsaitlik bilgisi yüklenirken bir hata oluştu')
      setAvailableTimeSlots([])
    } finally {
      setLoading(false)
    }
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    
    // Gelecek 30 gün
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
  }

  const availableDates = getAvailableDates()

  const handleDateSelect = (date: Date) => {
    setLocalSelectedDate(date)
    setLocalSelectedTimeSlot(undefined) // Tarih değişince saat seçimini sıfırla
    onDateTimeSelect(date, '') // Parent'a boş saat gönder
  }

  const handleTimeSelect = (timeSlot: string) => {
    setLocalSelectedTimeSlot(timeSlot)
    if (localSelectedDate) {
      onDateTimeSelect(localSelectedDate, timeSlot)
    }
  }

  const isDateSelected = (date: Date) => {
    return localSelectedDate && 
           date.toDateString() === localSelectedDate.toDateString()
  }

  const isTimeSlotSelected = (timeSlot: string) => {
    return localSelectedTimeSlot === timeSlot
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('tr-TR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    })
  }

  if (!selectedBarber) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-600 mb-2">
          Önce Berber Seçin
        </h3>
        <p className="text-slate-500">
          Tarih ve saat seçimi için önce bir berber seçmelisiniz.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Tarih ve Saat Seçimi
        </h3>
        <p className="text-slate-600">
          <strong>{selectedBarber.name}</strong> ile randevu alacağınız tarih ve saati seçin
        </p>
      </div>

      {/* Date Selection */}
      <div>
        <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          Tarih Seçin
        </h4>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {availableDates.map((date) => (
            <button
              key={date.toISOString()}
              onClick={() => handleDateSelect(date)}
              className={`p-3 rounded-lg border-2 transition-all ${
                isDateSelected(date)
                  ? 'border-slate-600 bg-slate-600 text-white'
                  : 'border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-sm font-medium">
                {formatDate(date)}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Time Selection */}
      {localSelectedDate && (
        <div>
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Saat Seçin
          </h4>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-slate-600">Müsait saatler yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
              <p className="text-red-800">{error}</p>
            </div>
          ) : availableTimeSlots.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600">Bu tarihte müsait saat bulunmuyor</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
              {availableTimeSlots.map((slot) => (
                <button
                  key={slot.time}
                  onClick={() => handleTimeSelect(slot.time)}
                  disabled={!slot.isAvailable}
                  className={`h-14 rounded-xl border-2 transition-all duration-300 font-semibold ${
                    !slot.isAvailable
                      ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                      : isTimeSlotSelected(slot.time)
                      ? 'border-teal-400 bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-105'
                      : 'border-gray-200 hover:border-teal-300 text-gray-700 hover:bg-teal-50 hover:scale-105 hover:shadow-md'
                  }`}
                >
                  <div className="text-base font-semibold">
                    {slot.time}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 border border-teal-200 rounded-lg p-4">
        <h4 className="font-semibold text-teal-800 mb-2">ℹ️ Bilgi:</h4>
        <ul className="text-sm text-teal-700 space-y-1">
          <li>• Gelecek 30 gün içinden tarih seçebilirsiniz</li>
          <li>• Dolu saatler gri renkte gösterilir ve seçilemez</li>
          <li>• Müsait saatler: 10:00 - 22:00 arası</li>
          <li>• Berberin çalışma saatleri dışındaki slotlar disabled gösterilir</li>
        </ul>
      </div>
    </div>
  )
}
