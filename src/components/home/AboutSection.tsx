import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Award, Users, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export default function AboutSection() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative h-[400px] md:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/about.jpg"
              alt="The Mens Hair Salon"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          </div>

          {/* Content Side */}
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
                Profesyonel Ekibimizle En İyi Berber Deneyimini Yaşayın
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed">
                Modern teknikler ve geleneksel ustalıkla, her müşterimize özel ilgi göstererek 
                stilinizi en iyi şekilde yansıtmanıza yardımcı oluyoruz.
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6">
              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">10+</div>
                  <div className="text-sm text-slate-600">Yıl Deneyim</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">500+</div>
                  <div className="text-sm text-slate-600">Mutlu Müşteri</div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-amber-600" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 mb-1">7/24</div>
                  <div className="text-sm text-slate-600">Hizmetinizdeyiz</div>
                </CardContent>
              </Card>
            </div>

            {/* Description */}
            <div className="space-y-4 text-slate-600">
              <p>
                Hijyenik ve modern ortamımızda, uzman berberlerimiz size özel saç kesimi, 
                sakal tıraşı ve bakım hizmetleri sunmaktadır. Her detaya özen göstererek, 
                mükemmel bir görünüm elde etmenizi sağlıyoruz.
              </p>
              <p>
                Siz değerli müşterilerimizin memnuniyeti bizim için her şeyden önemlidir. 
                Randevu sistemimiz sayesinde bekleme süresi olmadan hizmet alabilirsiniz.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/randevu-al">
                <Button size="lg" className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white">
                  Hemen Randevu Al
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/hakkimizda">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Daha Fazla Bilgi
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

