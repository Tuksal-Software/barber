import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scissors, Clock, Star, ArrowRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
  image?: string
}

interface ServicesPreviewProps {
  services: Record<string, Service[]>
}

export default function ServicesPreview({ services }: ServicesPreviewProps) {
  // İlk 6 hizmeti al
  const allServices = Object.values(services).flat().slice(0, 6)

  if (allServices.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Hizmetlerimiz
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Profesyonel berber hizmetlerimizle tarzınızı yansıtın. 
            Her hizmet özenle hazırlanmış ve kalite garantilidir.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {allServices.map((service) => (
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

                {/* CTA Button */}
                <Button asChild className="w-full bg-slate-600 hover:bg-slate-700">
                  <Link href={`/randevu?service=${service.id}`}>
                    Randevu Al
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white">
            <Link href="/hizmetler">
              Tüm Hizmetleri Görüntüle
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
