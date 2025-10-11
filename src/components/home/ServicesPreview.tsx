import Link from 'next/link'
import { Scissors, Sparkles, Clock, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface Service {
  id: string
  name: string
  description: string
  duration: number
  price: number
  category: string
}

interface ServicesPreviewProps {
  services: Service[]
}

const getServiceIcon = (category: string) => {
  switch (category) {
    case 'Saç':
      return <Scissors className="w-8 h-8" />
    case 'Sakal':
      return <Sparkles className="w-8 h-8" />
    default:
      return <Scissors className="w-8 h-8" />
  }
}

export default function ServicesPreview({ services }: ServicesPreviewProps) {
  const featuredServices = services.slice(0, 4)

  return (
    <section className="py-16 md:py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Hizmetlerimiz
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Size özel profesyonel bakım hizmetleri ile stilinizi öne çıkarın
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {featuredServices.map((service) => (
            <Card 
              key={service.id}
              className="group p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white"
            >
              {/* Icon */}
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                {getServiceIcon(service.category)}
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-slate-900 group-hover:text-amber-600 transition-colors">
                  {service.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {service.description}
                </p>
                
                {/* Duration & Price */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center space-x-2 text-slate-500">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{service.duration} dk</span>
                  </div>
                  <div className="text-lg font-bold text-slate-900">
                    {service.price}₺
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* View All Services CTA */}
        <div className="text-center">
          <Link
            href="/hizmetler"
            className="group inline-flex items-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-lg transition-all duration-300 font-semibold"
          >
            <span>Tüm Hizmetleri Görüntüle</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  )
}
