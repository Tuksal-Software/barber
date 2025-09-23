import { mockServices } from '@/lib/mock-data'
import { formatPrice } from '@/lib/utils'
import { Scissors, Clock, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function HizmetlerPage() {
  // Hizmetleri kategorilere göre grupla
  const servicesByCategory = mockServices.reduce((acc, service) => {
    if (!acc[service.category]) {
      acc[service.category] = []
    }
    acc[service.category].push(service)
    return acc
  }, {} as Record<string, typeof mockServices>)

  const categories = Object.keys(servicesByCategory)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl lg:text-6xl font-bold mb-6">
            Hizmetlerimiz
          </h1>
          <p className="text-xl lg:text-2xl text-slate-300 max-w-3xl mx-auto">
            Profesyonel berber hizmetlerimizle tarzınızı yansıtın. 
            Her hizmet özenle hazırlanmış ve kalite garantilidir.
          </p>
        </div>
      </section>

      {/* Hizmet Kategorileri */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          {categories.map((category) => (
            <div key={category} className="mb-20 last:mb-0">
              <div className="text-center mb-12">
                <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
                  {category}
                </h2>
                <div className="w-24 h-1 bg-slate-600 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicesByCategory[category].map((service) => (
                  <div
                    key={service.id}
                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 group"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center">
                      <Scissors className="w-16 h-16 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-4 right-4 bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 mb-4">
                        {service.description}
                      </p>

                      {/* Service Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} dakika</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-slate-400 fill-current" />
                          <span className="text-sm font-semibold text-slate-700">4.9</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-2xl font-bold text-slate-600 mb-4">
                        {formatPrice(service.price)}
                      </div>

                      {/* Features */}
                      <div className="mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Profesyonel ekipman</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600 mb-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Hijyenik ortam</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Kalite garantisi</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button asChild className="w-full bg-slate-600 hover:bg-slate-700">
                        <Link href={`/randevu?service=${service.id}`}>
                          Randevu Al
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fiyat Tablosu */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
              Fiyat Listesi
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Tüm hizmetlerimizin güncel fiyatları. 
              Kaliteli hizmet, uygun fiyat garantisi.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Hizmet</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Süre</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Fiyat</th>
                    <th className="px-6 py-4 text-center text-lg font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockServices.map((service, index) => (
                    <tr key={service.id} className={index % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">{service.name}</h3>
                          <p className="text-sm text-slate-600">{service.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {service.duration} dakika
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl font-bold text-slate-600">
                          {formatPrice(service.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button asChild size="sm" className="bg-slate-600 hover:bg-slate-700">
                          <Link href={`/randevu?service=${service.id}`}>
                            Randevu Al
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-600 to-slate-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6">
            Hemen Randevu Alın
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Profesyonel berber hizmetlerimizden yararlanmak için 
            hemen randevu alın ve tarzınızı yansıtın.
          </p>
          <Button asChild size="lg" className="bg-white text-slate-600 hover:bg-slate-100 px-8 py-4 text-lg">
            <Link href="/randevu">
              Randevu Al
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
