'use client'
import { AppointmentData } from '../AppointmentWizard'
import { formatPrice } from '@/lib/utils'
import { Calendar, Clock, User, Phone, Mail, MessageSquare, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AppointmentConfirmationProps {
  data: AppointmentData
  onConfirm: () => void
  loading: boolean
}

export default function AppointmentConfirmation({ data, onConfirm, loading }: AppointmentConfirmationProps) {
  if (!data.service || !data.barber || !data.date || !data.timeSlot) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Lütfen önceki adımları tamamlayın.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          Randevu Detaylarını Onaylayın
        </h3>
        <p className="text-slate-600">
          Aşağıdaki bilgileri kontrol edip randevunuzu onaylayın
        </p>
      </div>

      {/* Appointment Details */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Randevu Bilgileri</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service & Barber */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Hizmet</p>
                <p className="font-semibold text-slate-900">{data.service.name}</p>
                <p className="text-sm text-slate-600">{data.service.duration} dakika • {formatPrice(data.service.price)}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Berber</p>
                <p className="font-semibold text-slate-900">{data.barber.name}</p>
                <p className="text-sm text-slate-600">{data.barber.experience} yıl deneyim • ⭐ {data.barber.rating}</p>
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Tarih</p>
                <p className="font-semibold text-slate-900">
                  {data.date.toLocaleDateString('tr-TR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-700">Saat</p>
                <p className="font-semibold text-slate-900">{data.timeSlot}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Details */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
        <h4 className="text-lg font-semibold text-slate-900 mb-4">Müşteri Bilgileri</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-700">Ad Soyad</p>
              <p className="font-semibold text-slate-900">{data.customerName}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-sm font-medium text-slate-700">Telefon</p>
              <p className="font-semibold text-slate-900">{data.customerPhone}</p>
            </div>
          </div>

          {data.customerEmail && (
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700">E-posta</p>
                <p className="font-semibold text-slate-900">{data.customerEmail}</p>
              </div>
            </div>
          )}

          {data.notes && (
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700">Notlar</p>
                <p className="font-semibold text-slate-900">{data.notes}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Total Price */}
      <div className="bg-slate-900 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-300">Toplam Tutar</p>
            <p className="text-2xl font-bold">{formatPrice(data.service.price)}</p>
          </div>
          <div className="text-right">
            <p className="text-slate-300">Hizmet</p>
            <p className="font-semibold">{data.service.name}</p>
          </div>
        </div>
      </div>

      {/* Confirmation Button */}
      <div className="text-center">
        <Button
          onClick={onConfirm}
          disabled={loading}
          size="lg"
          className="bg-green-600 hover:bg-green-700 px-8 py-4 text-lg"
        >
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Randevu Oluşturuluyor...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Randevuyu Onayla</span>
            </div>
          )}
        </Button>
      </div>

      {/* Important Notes */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h5 className="font-semibold text-blue-800 mb-2">Önemli Bilgiler:</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Randevunuz onaylandıktan sonra WhatsApp üzerinden bilgilendirileceksiniz</li>
          <li>• En az 2 saat önceden randevu almanız gerekmektedir</li>
          <li>• Randevu saatinden 10 dakika önce gelmeniz önerilir</li>
          <li>• İptal durumunda en az 2 saat önceden haber vermeniz gerekmektedir</li>
        </ul>
      </div>
    </div>
  )
}
