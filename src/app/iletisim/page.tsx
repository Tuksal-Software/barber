'use client'

import { useState } from 'react'
import { mockSiteSettings } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Burada form verilerini API'ye gönderebilirsiniz
    console.log('Form data:', formData)
    setIsSubmitted(true)
    
    // 3 saniye sonra formu sıfırla
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({ name: '', email: '', phone: '', message: '' })
    }, 3000)
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            İletişim
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
            Bizimle iletişime geçin. Sorularınızı yanıtlamaya hazırız.
          </p>
        </div>
      </section>

      {/* İletişim Bilgileri ve Form */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sol Taraf - İletişim Bilgileri */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                İletişim Bilgileri
              </h2>
              
              <div className="space-y-6">
                {/* Adres */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Adres</h3>
                    <p className="text-slate-600">{mockSiteSettings.address}</p>
                  </div>
                </div>

                {/* Telefon */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Telefon</h3>
                    <p className="text-slate-600">{mockSiteSettings.phone}</p>
                  </div>
                </div>

                {/* E-posta */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">E-posta</h3>
                    <p className="text-slate-600">{mockSiteSettings.email}</p>
                  </div>
                </div>

                {/* Çalışma Saatleri */}
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Çalışma Saatleri</h3>
                    <div className="space-y-1 text-slate-600">
                      <p>Pazartesi - Cuma: 09:00 - 19:00</p>
                      <p>Cumartesi: 09:00 - 17:00</p>
                      <p>Pazar: Kapalı</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sosyal Medya */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Sosyal Medya</h3>
                <div className="flex space-x-4">
                  {mockSiteSettings.socialMedia.instagram && (
                    <a
                      href={mockSiteSettings.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-white font-bold">IG</span>
                    </a>
                  )}
                  {mockSiteSettings.socialMedia.facebook && (
                    <a
                      href={mockSiteSettings.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-white font-bold">FB</span>
                    </a>
                  )}
                  {mockSiteSettings.socialMedia.twitter && (
                    <a
                      href={mockSiteSettings.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors"
                    >
                      <span className="text-white font-bold">TW</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Sağ Taraf - İletişim Formu */}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-8">
                Mesaj Gönderin
              </h2>

              {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-green-800 mb-2">
                    Mesajınız Gönderildi!
                  </h3>
                  <p className="text-green-700">
                    En kısa sürede size geri dönüş yapacağız.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-colors"
                      placeholder="Adınız ve soyadınız"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                      E-posta
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-colors"
                      placeholder="ornek@email.com"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-colors"
                      placeholder="05XX XXX XX XX"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-2">
                      Mesaj *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-600 focus:border-transparent transition-colors resize-none"
                      placeholder="Mesajınızı buraya yazın..."
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-slate-600 hover:bg-slate-700 py-3 text-lg"
                  >
                    <Send className="w-5 h-5 mr-2" />
                    Mesaj Gönder
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Harita Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">
              Konum
            </h2>
            <p className="text-xl text-slate-600">
              Salonumuzun konumunu haritada görebilirsiniz
            </p>
          </div>

          {/* Placeholder Harita */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
              <div className="text-center text-slate-600">
                <MapPin className="w-24 h-24 mx-auto mb-4" />
                <p className="text-xl font-semibold">Harita</p>
                <p className="text-sm">Buraya Google Maps entegrasyonu gelecek</p>
                <p className="text-sm mt-2">{mockSiteSettings.address}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
