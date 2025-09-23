'use client'
import { AppointmentData } from '../AppointmentWizard'
import { User, Phone, Mail, MessageSquare } from 'lucide-react'

interface CustomerInfoProps {
  data: AppointmentData
  onDataChange: (data: Partial<AppointmentData>) => void
}

export default function CustomerInfo({ data, onDataChange }: CustomerInfoProps) {
  const handleInputChange = (field: keyof AppointmentData, value: string) => {
    onDataChange({ [field]: value })
  }

  const formatPhoneNumber = (input: string) => {
    // Sadece rakamları al
    const numbers = input.replace(/\D/g, '')
    
    // Eğer 5 ile başlıyorsa, Türkiye numarası olarak kabul et
    if (numbers.startsWith('5') && numbers.length <= 10) {
      if (numbers.length === 0) return ''
      if (numbers.length <= 3) return `+90 ${numbers}`
      if (numbers.length <= 6) return `+90 ${numbers.slice(0, 3)} ${numbers.slice(3)}`
      if (numbers.length <= 8) return `+90 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6)}`
      return `+90 ${numbers.slice(0, 3)} ${numbers.slice(3, 6)} ${numbers.slice(6, 8)} ${numbers.slice(8, 10)}`
    }
    
    // Eğer +90 ile başlıyorsa, mevcut formatı koru
    if (input.startsWith('+90')) {
      return input
    }
    
    // Diğer durumlarda sadece rakamları döndür
    return numbers
  }

  const handlePhoneChange = (value: string) => {
    // Eğer +90 ile başlıyorsa, mevcut formatı koru
    if (value.startsWith('+90')) {
      onDataChange({ customerPhone: value })
      return
    }
    
    // Sadece rakamları al
    const numbers = value.replace(/\D/g, '')
    
    // Eğer 5 ile başlıyorsa ve 10 haneli ise formatla
    if (numbers.startsWith('5') && numbers.length <= 10) {
      const formatted = formatPhoneNumber(numbers)
      onDataChange({ customerPhone: formatted })
    } else {
      // Henüz formatlanmamış, sadece rakamları kaydet
      onDataChange({ customerPhone: numbers })
    }
  }

  const handlePhoneBlur = () => {
    // Input'tan çıkıldığında otomatik formatla
    const currentPhone = data.customerPhone
    if (currentPhone && !currentPhone.startsWith('+90')) {
      const numbers = currentPhone.replace(/\D/g, '')
      if (numbers.startsWith('5') && numbers.length === 10) {
        const formatted = formatPhoneNumber(numbers)
        onDataChange({ customerPhone: formatted })
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-2xl font-bold text-slate-900 mb-2">
          İletişim Bilgileriniz
        </h3>
        <p className="text-slate-600">
          Randevu onayı için gerekli bilgileri girin
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {/* Ad Soyad */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Ad Soyad *
          </label>
          <input
            type="text"
            value={data.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            placeholder="Adınız ve soyadınız"
            maxLength={50}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent text-slate-900 placeholder-slate-500 bg-white"
            required
          />
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Phone className="w-4 h-4 inline mr-2" />
            Telefon Numarası *
          </label>
          <input
            type="tel"
            value={data.customerPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            onBlur={handlePhoneBlur}
            placeholder="5XX XXX XX XX"
            maxLength={20}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent text-slate-900 placeholder-slate-500 bg-white font-mono"
            required
          />
          <p className="text-xs text-slate-500 mt-1">
            Numara otomatik olarak +90 ile formatlanacaktır (Maksimum 20 karakter)
          </p>
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <Mail className="w-4 h-4 inline mr-2" />
            E-posta (Opsiyonel)
          </label>
          <input
            type="email"
            value={data.customerEmail}
            onChange={(e) => handleInputChange('customerEmail', e.target.value)}
            placeholder="ornek@email.com"
            maxLength={100}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent text-slate-900 placeholder-slate-500 bg-white"
          />
        </div>

        {/* Notlar */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Özel İstekler (Opsiyonel)
          </label>
          <textarea
            value={data.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Özel istekleriniz, notlarınız..."
            rows={3}
            maxLength={500}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent text-slate-900 placeholder-slate-500 bg-white resize-none"
          />
          <p className="text-xs text-slate-500 mt-1">
            Maksimum 500 karakter
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">Bilgi:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• * işaretli alanlar zorunludur</li>
          <li>• Telefon numaranız randevu onayı için kullanılacaktır</li>
          <li>• E-posta adresiniz varsa bilgilendirmeler için kullanılacaktır</li>
          <li>• Özel istekleriniz berbere iletilecektir</li>
        </ul>
      </div>
    </div>
  )
}
