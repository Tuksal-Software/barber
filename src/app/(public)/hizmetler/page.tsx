import { mockServices } from '@/lib/mock-data'
import { formatPrice } from '@/lib/utils'
import { Scissors, Clock, Star, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
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
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 tracking-tight">
            Hizmetlerimiz
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Size Özel Profesyonel Bakım
          </p>
        </div>
      </section>

      {/* Hizmet Kategorileri */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {categories.map((category) => (
            <div key={category} className="mb-20 last:mb-0">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                  {category}
                </h2>
                <div className="w-24 h-1 bg-amber-600 mx-auto"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {servicesByCategory[category].map((service) => (
                  <Card
                    key={service.id}
                    className="group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-0 bg-white overflow-hidden"
                  >
                    {/* Service Image */}
                    <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <Scissors className="w-16 h-16 text-slate-600 group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-4 right-4 bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        {formatPrice(service.price)}
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                        {service.name}
                      </h3>
                      <p className="text-slate-600 mb-4 leading-relaxed">
                        {service.description}
                      </p>

                      {/* Service Details */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} dakika</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Star className="w-4 h-4 text-amber-400 fill-current" />
                          <span className="text-sm font-semibold text-slate-700">4.9</span>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-2xl font-bold text-slate-900 mb-6">
                        {formatPrice(service.price)}
                      </div>

                      {/* Features */}
                      <div className="mb-6 space-y-2">
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Profesyonel ekipman</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Hijyenik ortam</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-slate-600">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span>Kalite garantisi</span>
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button asChild className="w-full bg-amber-600 hover:bg-amber-700 group">
                        <Link href={`/randevu-al?service=${service.id}`} className="flex items-center justify-center space-x-2">
                          <span>Randevu Al</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fiyat Tablosu */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
              Fiyat Listesi
            </h2>
            <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Tüm hizmetlerimizin güncel fiyatları. 
              Kaliteli hizmet, uygun fiyat garantisi.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-900 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Hizmet</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Süre</th>
                    <th className="px-6 py-4 text-left text-lg font-semibold">Fiyat</th>
                    <th className="px-6 py-4 text-center text-lg font-semibold">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {mockServices.map((service, index) => (
                    <tr key={service.id} className={`hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                      <td className="px-6 py-4">
                        <div>
                          <h3 className="font-semibold text-slate-900">{service.name}</h3>
                          <p className="text-sm text-slate-600">{service.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} dakika</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xl font-bold text-amber-600">
                          {formatPrice(service.price)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <Button asChild size="sm" className="bg-amber-600 hover:bg-amber-700">
                          <Link href={`/randevu-al?service=${service.id}`}>
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
      <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full translate-y-32 -translate-x-32" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Hemen Randevu Alın
          </h2>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Profesyonel kuaförlük hizmetlerimizden yararlanmak için 
            hemen randevu alın ve stilinizi öne çıkarın.
          </p>
          <Button asChild size="lg" className="bg-amber-600 hover:bg-amber-700 px-8 py-4 text-lg group">
            <Link href="/randevu-al" className="flex items-center space-x-2">
              <span>Randevu Al</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
