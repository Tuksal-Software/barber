'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import ServiceSelection from './appointment/ServiceSelection'
import BarberSelection from './appointment/BarberSelection'
import DateTimeSelection from './appointment/DateTimeSelection'
import CustomerInfo from './appointment/CustomerInfo'
import AppointmentConfirmation from './appointment/AppointmentConfirmation'
import { createAppointment } from '@/lib/actions/appointment'
import { getBarbers } from '@/lib/actions/barbers'
import { Service, Barber } from '@/types'

export type AppointmentData = {
  service?: Service
  barber?: Barber
  date?: Date
  timeSlot?: string
  customerName: string
  customerPhone: string
  customerEmail: string
  notes: string
}

const STEPS = [
  { id: 1, title: 'Hizmet Seçimi', description: 'Hangi hizmeti almak istiyorsunuz?' },
  { id: 2, title: 'Berber Seçimi', description: 'Hangi berberle randevu almak istiyorsunuz?' },
  { id: 3, title: 'Tarih & Saat', description: 'Ne zaman gelmek istiyorsunuz?' },
  { id: 4, title: 'Bilgileriniz', description: 'İletişim bilgilerinizi girin' },
  { id: 5, title: 'Onay', description: 'Randevu detaylarını onaylayın' }
]

export default function AppointmentWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: ''
  })
  const [services, setServices] = useState<Service[]>([])
  const [barbers, setBarbers] = useState<Barber[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Verileri yükle
  useEffect(() => {
    const loadData = async () => {
      try {
        const barbersResult = await getBarbers()

        if (barbersResult.success) {
          setBarbers(barbersResult.data)
        }
        
        // Services are not used in the new system
        setServices([])
      } catch (error) {
        console.error('Data loading error:', error)
        setError('Veriler yüklenirken bir hata oluştu')
      }
    }

    loadData()
  }, [])

  const nextStep = () => {
    if (canProceedToNext()) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
      setError(null)
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError(null)
  }

  const updateAppointmentData = (data: Partial<AppointmentData>) => {
    setAppointmentData(prev => ({ ...prev, ...data }))
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return !!appointmentData.service
      case 2:
        return !!appointmentData.barber
      case 3:
        return !!appointmentData.date && !!appointmentData.timeSlot
      case 4:
        return appointmentData.customerName.trim() !== '' && 
               appointmentData.customerPhone.trim() !== ''
      default:
        return true
    }
  }

  const calculateEndTime = (startTime: string, duration: number = 30) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!appointmentData.service || !appointmentData.barber || !appointmentData.date || !appointmentData.timeSlot) {
      setError('Lütfen tüm gerekli bilgileri doldurun')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const localDate = new Date(appointmentData.date);
      localDate.setHours(0, 0, 0, 0);
      
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      console.log('Appointment date being sent:', dateString);
      console.log('Selected date object:', appointmentData.date);

      const result = await createAppointment({
        barberId: appointmentData.barber.id,
        date: dateString,
        startTime: appointmentData.timeSlot,
        endTime: calculateEndTime(appointmentData.timeSlot),
        customerName: appointmentData.customerName,
        customerPhone: appointmentData.customerPhone,
        customerEmail: appointmentData.customerEmail,
        notes: appointmentData.notes
      })

      if (result.success) {
        setSuccess(true)
        // WhatsApp paylaşımı için hazırla
        const whatsappMessage = `🎉 Randevunuz başarıyla oluşturuldu!

📅 Tarih: ${appointmentData.date.toLocaleDateString('tr-TR')}
⏰ Saat: ${appointmentData.timeSlot}
💇‍♂️ Hizmet: ${appointmentData.service.name}
👨‍💼 Berber: ${appointmentData.barber.name}
👤 Müşteri: ${appointmentData.customerName}
📱 Telefon: ${appointmentData.customerPhone}

Elite Berber Salonu'na hoş geldiniz! 🪒`

        // WhatsApp link'ini oluştur
        const whatsappLink = `https://wa.me/905325550123?text=${encodeURIComponent(whatsappMessage)}`
        
        // WhatsApp'ı aç
        window.open(whatsappLink, '_blank')
      } else {
        setError(result.error || 'Randevu oluşturulurken bir hata oluştu')
      }
    } catch (error) {
      console.error('Appointment creation error:', error)
      setError('Randevu oluşturulurken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <ServiceSelection
            services={services}
            selectedService={appointmentData.service}
            onServiceSelect={(service) => updateAppointmentData({ service })}
          />
        )
      case 2:
        return (
          <BarberSelection
            selectedService={appointmentData.service}
            barbers={barbers}
            selectedBarber={appointmentData.barber}
            onBarberSelect={(barber) => updateAppointmentData({ barber })}
          />
        )
      case 3:
        return (
          <DateTimeSelection
            selectedBarber={appointmentData.barber}
            selectedDate={appointmentData.date}
            selectedTimeSlot={appointmentData.timeSlot}
            onDateTimeSelect={(date, timeSlot) => updateAppointmentData({ date, timeSlot })}
          />
        )
      case 4:
        return (
          <CustomerInfo
            data={appointmentData}
            onDataChange={updateAppointmentData}
          />
        )
      case 5:
        return (
          <AppointmentConfirmation
            data={appointmentData}
            onConfirm={handleConfirm}
            loading={loading}
          />
        )
      default:
        return null
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Randevunuz Oluşturuldu! 🎉
          </h2>
          <p className="text-slate-600 mb-6">
            Randevu detayları WhatsApp üzerinden paylaşıldı. 
            Berberimiz sizinle iletişime geçecek.
          </p>
          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full bg-slate-600 hover:bg-slate-700 text-white font-semibold"
          >
            Ana Sayfaya Dön
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  currentStep >= step.id
                    ? 'bg-slate-600 text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    step.id
                  )}
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    currentStep > step.id ? 'bg-slate-600' : 'bg-slate-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          
          {/* Step Info */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-slate-600">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <Button
            onClick={prevStep}
            disabled={currentStep === 1}
            variant="outline"
            className="px-6 py-3 border-2 border-slate-600 text-slate-700 hover:bg-slate-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>

          {currentStep < STEPS.length && (
            <Button
              onClick={nextStep}
              disabled={!canProceedToNext()}
              className="px-6 py-3 bg-slate-600 hover:bg-slate-700 text-white font-semibold"
            >
              İleri
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
