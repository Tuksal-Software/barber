import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Star, Award, ArrowRight } from 'lucide-react'

interface Barber {
  id: string
  name: string
  experience: number
  rating: number
  specialties: string
  image: string
}

interface BarbersPreviewProps {
  barbers: Barber[]
}

export default function BarbersPreview({ barbers }: BarbersPreviewProps) {
  // İlk 3 berberi al
  const featuredBarbers = barbers.slice(0, 3)

  if (featuredBarbers.length === 0) {
    return null
  }

  return (
    <section className="py-20 bg-slate-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 mb-4">
            Uzman Ekibimiz
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Deneyimli ve uzman berberlerimizle tanışın. 
            Her biri kendi alanında uzmanlaşmış profesyoneller.
          </p>
        </div>

        {/* Barbers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {featuredBarbers.map((barber) => {
            // Mock data'da specialties zaten array
            const specialties = Array.isArray(barber.specialties) ? barber.specialties : []
            
            return (
              <div
                key={barber.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-slate-100 group"
              >
                {/* Barber Image */}
                <div className="relative h-64 bg-gradient-to-br from-slate-100 to-slate-200 rounded-t-xl flex items-center justify-center">
                  <div className="w-24 h-24 bg-slate-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-3xl font-bold">
                      {barber.name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Experience Badge */}
                  <div className="absolute top-4 left-4 bg-slate-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {barber.experience} yıl
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-white text-slate-600 px-3 py-1 rounded-full text-sm font-semibold">
                    {barber.rating}
                  </div>
                </div>

                {/* Barber Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-slate-600 transition-colors">
                    {barber.name}
                  </h3>
                  
                  {/* Rating */}
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
                    <span className="text-sm text-slate-600 ml-2">
                      ({barber.rating})
                    </span>
                  </div>

                  {/* Experience */}
                  <div className="flex items-center space-x-2 text-sm text-slate-500 mb-3">
                    <Award className="w-4 h-4" />
                    <span>{barber.experience} yıl deneyim</span>
                  </div>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className="text-xs text-slate-600 mb-2">Uzmanlık Alanları:</p>
                    <div className="flex flex-wrap gap-1">
                      {specialties.slice(0, 3).map((specialty: string, index: number) => (
                        <span
                          key={index}
                          className="bg-slate-100 text-slate-700 px-2 py-1 rounded-full text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button asChild className="w-full bg-slate-600 hover:bg-slate-700">
                    <Link href={`/randevu?barber=${barber.id}`}>
                      Randevu Al
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button asChild size="lg" variant="outline" className="border-slate-600 text-slate-600 hover:bg-slate-600 hover:text-white">
            <Link href="/hakkimizda">
              Tüm Ekibi Görüntüle
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
