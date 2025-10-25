'use client';

import { useState } from 'react';
import { BarberSelection } from './components/BarberSelection';
import { DateTimeSelection } from './components/DateTimeSelection';
import { CustomerForm } from './components/CustomerForm';
import { cn } from '@/lib/utils';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { createAppointment } from '@/lib/actions/appointment';
import { getAppointmentSettings } from '@/lib/actions/settings';
import { getActiveServices } from '@/lib/actions/services';
import { ServiceSelection as PublicServiceSelection } from '@/components/booking/ServiceSelection';
import { getActiveBarbers } from '@/lib/actions/barber.actions';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import confetti from 'canvas-confetti';

interface CustomerFormData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  notes?: string;
}

interface Barber {
  id: string;
  name: string;
  image?: string;
  specialties?: string;
  experience: number;
  rating: number;
  slotDuration: number;
}

export default function BookingPage() {
  const [step, setStep] = useState(1);
  const [barberId, setBarberId] = useState<string>('');
  const [date, setDate] = useState<Date | null>(null);
  const [timeSlot, setTimeSlot] = useState<string>('');
  const [customerData, setCustomerData] = useState<CustomerFormData | null>(null);
  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [serviceBasedDuration, setServiceBasedDuration] = useState(false);
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const calculateEndTime = (startTime: string, duration: number = 30) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    return `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
  };

  const handleBarberSelect = async (selectedBarberId: string) => {
    setBarberId(selectedBarberId);
    
    // Berber bilgilerini al
    const result = await getActiveBarbers();
    if (result.success && result.data) {
      const selectedBarber = result.data.find(b => b.id === selectedBarberId);
      if (selectedBarber) {
        setBarber(selectedBarber as any);
      }
    }

    // Ayarları ve hizmetleri yükle
    const [settingsRes, servicesRes] = await Promise.all([
      getAppointmentSettings(),
      getActiveServices(),
    ]);
    const isServiceBased = !!settingsRes.data?.serviceBasedDuration;
    setServiceBasedDuration(isServiceBased);
    if (servicesRes.success) setServices(servicesRes.data as any);

    setStep(isServiceBased ? 2 : 2);
  };

  const handleDateTimeSelect = (selectedDate: Date, selectedTimeSlot: string) => {
    setDate(selectedDate);
    setTimeSlot(selectedTimeSlot);
    setStep(serviceBasedDuration ? 4 : 3);
  };

  const handleCustomerSubmit = (data: CustomerFormData) => {
    setCustomerData(data);
    setStep(serviceBasedDuration ? 5 : 4);
  };

  const handleConfirmAppointment = async () => {
    if (!barberId || !date || !timeSlot || !customerData) return;

    setLoading(true);
    try {
      const localDate = new Date(date);
      localDate.setHours(0, 0, 0, 0);
      
      const year = localDate.getFullYear();
      const month = String(localDate.getMonth() + 1).padStart(2, '0');
      const day = String(localDate.getDate()).padStart(2, '0');
      const dateString = `${year}-${month}-${day}`;

      const result = await createAppointment({
        barberId,
        customerName: customerData.customerName,
        customerPhone: customerData.customerPhone,
        customerEmail: customerData.customerEmail,
        notes: customerData.notes,
        date: dateString,
        startTime: timeSlot,
        endTime: serviceBasedDuration ? undefined : calculateEndTime(timeSlot),
        serviceIds: serviceBasedDuration ? selectedServices : undefined,
      });

      if (result.success) {
        setAppointmentId('APT-' + Math.random().toString(36).substr(2, 9).toUpperCase());
        setSuccess(true);
        
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });

        setTimeout(() => {
          window.location.href = '/randevu-al';
        }, 3000);
      }
    } catch (error) {
      console.error('Appointment creation failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const ProgressStepper = () => (
    <div className="flex items-center justify-center mb-8">
      {(serviceBasedDuration ? [1,2,3,4,5] : [1,2,3,4]).map((stepNumber) => (
        <div key={stepNumber} className="flex items-center">
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-500 transform",
            step >= stepNumber 
              ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg scale-110" 
              : "bg-gray-200 text-gray-600 hover:scale-105"
          )}>
            {step > stepNumber ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              stepNumber
            )}
          </div>
          {stepNumber < 4 && (
            // hizmet bazlı modda 5 adım
            <div className={cn(
              "w-16 h-1 mx-2 transition-all duration-500",
              step > stepNumber ? "bg-gradient-to-r from-teal-500 to-cyan-500" : "bg-gray-200"
            )} />
          )}
        </div>
      ))}
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white rounded-3xl shadow-2xl p-12 animate-in fade-in-50 duration-700">
            <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            
            <h1 className="text-4xl font-bold text-gray-900 mb-4 animate-in slide-in-from-bottom-50 duration-500">
              Randevu Başarıyla Oluşturuldu!
            </h1>
            
            <p className="text-gray-600 text-lg mb-8 animate-in fade-in-50 duration-500" style={{ animationDelay: '200ms' }}>
              Randevunuz onaylandı ve sistemimize kaydedildi.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 animate-in slide-in-from-bottom-50 duration-500" style={{ animationDelay: '400ms' }}>
              <p className="text-sm text-gray-600 mb-2">Randevu Numarası:</p>
              <p className="text-2xl font-bold text-gray-900 font-mono">{appointmentId}</p>
            </div>

            <div className="space-y-4 animate-in fade-in-50 duration-500" style={{ animationDelay: '600ms' }}>
              <Button
                onClick={() => window.location.href = '/randevu-al'}
                className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105"
              >
                Yeni Randevu Al
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-4">
            Randevu Al
          </h1>
          <p className="text-gray-600 text-lg">
            Hızlı ve kolay randevu sistemi
          </p>
        </div>

        {/* Progress Stepper */}
        <ProgressStepper />

        {/* Step Content */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 animate-in fade-in-50 duration-500">
          {step === 1 && (
            <BarberSelection
              onSelect={handleBarberSelect}
              selectedId={barberId}
            />
          )}

          {step === 2 && serviceBasedDuration && (
            <PublicServiceSelection
              services={services as any}
              selectedServices={selectedServices}
              onSelectionChange={setSelectedServices}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
              showNavigation={true}
            />
          )}

          {((!serviceBasedDuration && step === 2) || (serviceBasedDuration && step === 3)) && barberId && (
            <DateTimeSelection
              barberId={barberId}
              onSelect={handleDateTimeSelect}
              selectedDate={date}
              selectedTime={timeSlot}
              totalDuration={serviceBasedDuration ? services.filter((s: any) => selectedServices.includes(s.id)).reduce((acc: number, s: any) => acc + s.duration, 0) : undefined}
            />
          )}

          {((!serviceBasedDuration && step === 3) || (serviceBasedDuration && step === 4)) && (
            <CustomerForm
              onSubmit={handleCustomerSubmit}
              initialData={customerData || undefined}
            />
          )}

          {((!serviceBasedDuration && step === 4) || (serviceBasedDuration && step === 5)) && barberId && date && timeSlot && customerData && barber && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Randevu Özeti</h2>
                <p className="text-gray-600">Bilgilerinizi kontrol edip randevunuzu onaylayın</p>
              </div>

              <div className="max-w-4xl mx-auto space-y-6">
                {/* Berber Bilgileri */}
                <Card className="animate-in slide-in-from-left-50 duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={barber.image} />
                          <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white">
                            {barber.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        Berber Bilgileri
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(1)}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        Değiştir
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={barber.image} />
                        <AvatarFallback className="bg-gradient-to-r from-teal-500 to-cyan-500 text-white text-lg font-semibold">
                          {barber.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{barber.name}</h3>
                        <p className="text-gray-600">{barber.specialties}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary">{barber.experience} yıl deneyim</Badge>
                          <Badge variant="outline">⭐⭐⭐⭐⭐ {barber.rating}</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Tarih ve Saat */}
                <Card className="animate-in slide-in-from-right-50 duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Tarih ve Saat</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(2)}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        Değiştir
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {format(date, 'dd MMMM yyyy', { locale: tr })}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(date, 'EEEE', { locale: tr })}
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {timeSlot} - {calculateEndTime(timeSlot)}
                        </p>
                        <p className="text-sm text-gray-600">{serviceBasedDuration ? `${services.filter((s: any) => selectedServices.includes(s.id)).reduce((acc: number, s: any) => acc + s.duration, 0)} dakika` : '30 dakika'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {serviceBasedDuration && selectedServices.length > 0 && (
                  <Card className="animate-in slide-in-from-bottom-50 duration-500">
                    <CardHeader>
                      <CardTitle>Seçilen Hizmetler</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {services.filter((s: any) => selectedServices.includes(s.id)).map((srv: any) => (
                          <div key={srv.id} className="flex justify-between">
                            <span>{srv.name} ({srv.duration} dk)</span>
                            <span className="font-medium">{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(Number(srv.price))}</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-semibold text-lg pt-2">
                          <span>Toplam</span>
                          <span className="text-teal-600">
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(
                              services.filter((s: any) => selectedServices.includes(s.id)).reduce((acc: number, s: any) => acc + Number(s.price), 0)
                            )}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Müşteri Bilgileri */}
                <Card className="animate-in slide-in-from-bottom-50 duration-500">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Müşteri Bilgileri</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setStep(3)}
                        className="text-teal-600 hover:text-teal-700"
                      >
                        Değiştir
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p><span className="font-medium">İsim:</span> {customerData.customerName}</p>
                      <p><span className="font-medium">Telefon:</span> {customerData.customerPhone}</p>
                      {customerData.customerEmail && (
                        <p><span className="font-medium">Email:</span> {customerData.customerEmail}</p>
                      )}
                      {customerData.notes && (
                        <p><span className="font-medium">Notlar:</span> {customerData.notes}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Onay Butonu */}
                <div className="text-center pt-6 animate-in fade-in-50 duration-500" style={{ animationDelay: '400ms' }}>
                  <Button
                    onClick={handleConfirmAppointment}
                    disabled={loading}
                    className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-semibold px-12 py-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {loading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Randevu Oluşturuluyor...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Randevuyu Onayla
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Back Button */}
        {step > 1 && step < 4 && (
          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={() => setStep(step - 1)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Geri dön
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
