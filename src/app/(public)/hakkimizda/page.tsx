import { mockSiteSettings, mockBarbers } from '@/lib/mock-data'
import { Award, Users, Clock, Star, MapPin, Phone, Mail } from 'lucide-react'
import Image from 'next/image'

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Hakkımızda
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
            {mockSiteSettings.description}
          </p>
        </div>
      </section>

      {/* Hikayemiz */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-6">
                Hikayemiz
              </h2>
              <div className="space-y-4 text-lg text-slate-600">
                <p>
                  2015 yılında kurulan Elite Berber Salonu, geleneksel berberlik 
                  sanatını modern teknoloji ile birleştirerek müşterilerine en kaliteli 
                  hizmeti sunmayı hedeflemiştir.
                </p>
                <p>
                  Kurucumuz Ahmet Yılmaz'ın 20 yıllık deneyimi ve tutkusu ile 
                  başlayan bu yolculuk, bugün İstanbul'un en güvenilir ve kaliteli 
                  berber salonlarından biri olarak devam etmektedir.
                </p>
                <p>
                  Her müşterimizin kendine özgü tarzını keşfetmesine yardımcı olmak, 
                  hijyenik ortamda profesyonel hizmet sunmak ve sürekli kendimizi 
                  geliştirmek temel prensiplerimizdir.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full h-96 relative rounded-2xl overflow-hidden shadow-lg">
                <Image 
                  src="/about.jpg" 
                  alt="The Mens Hair Salon" 
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Misyon ve Vizyon */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Misyon */}
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Misyonumuz</h3>
              <p className="text-slate-600 leading-relaxed">
                Müşterilerimize en kaliteli berber hizmetlerini sunarak, 
                her birinin kendine özgü tarzını ortaya çıkarmak ve 
                %100 memnuniyet sağlamak.
              </p>
            </div>

            {/* Vizyon */}
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Star className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Vizyonumuz</h3>
              <p className="text-slate-600 leading-relaxed">
                İstanbul'un en prestijli berber salonu olmak ve 
                berberlik sektöründe kalite standartlarını belirleyen 
                öncü kuruluş haline gelmek.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ekip */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Uzman Ekibimiz
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Deneyimli ve profesyonel berberlerimizle tanışın
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {mockBarbers.map((barber) => (
              <div
                key={barber.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100"
              >
                <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center">
                  <div className="w-24 h-24 bg-slate-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {barber.name.charAt(0)}
                    </span>
                  </div>
                  
                  <div className="absolute top-4 left-4 bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {barber.experience} yıl
                  </div>

                  <div className="absolute top-4 right-4 bg-white text-slate-600 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{barber.rating}</span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {barber.name}
                  </h3>
                  
                  <div className="flex items-center space-x-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor(barber.rating)
                            ? 'text-slate-400 fill-current'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-slate-600 mb-2">Uzmanlık Alanları:</p>
                    <div className="flex flex-wrap gap-2">
                      {barber.specialties.split(', ').slice(0, 3).map((specialty, index) => (
                        <span
                          key={index}
                          className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* İletişim Bilgileri */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              İletişim Bilgileri
            </h2>
            <p className="text-xl text-slate-600">
              Bize ulaşmak için aşağıdaki bilgileri kullanabilirsiniz
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Adres</h3>
              <p className="text-slate-600">{mockSiteSettings.address}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Telefon</h3>
              <p className="text-slate-600">{mockSiteSettings.phone}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">E-posta</h3>
              <p className="text-slate-600">{mockSiteSettings.email}</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <div className="bg-white rounded-xl p-8 shadow-lg inline-block">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">Çalışma Saatleri</h3>
              <div className="space-y-2 text-slate-600">
                <p>Pazartesi - Cuma: 09:00 - 19:00</p>
                <p>Cumartesi: 09:00 - 17:00</p>
                <p>Pazar: Kapalı</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
