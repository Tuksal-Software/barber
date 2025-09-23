import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Scissors, Clock, Star, Users } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Sol Taraf - İçerik */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                Profesyonel{' '}
                <span className="text-slate-300">Berber</span>{' '}
                Hizmetleri
              </h1>
              <p className="text-xl lg:text-2xl text-slate-300 leading-relaxed">
                Modern ve hijyenik ortamda, uzman berberlerimizle 
                tarzınızı yansıtın. Her kesimde mükemmellik.
              </p>
            </div>

            {/* Özellikler */}
            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <Scissors className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Uzman Berberler</p>
                  <p className="text-sm text-slate-400">Deneyimli ekip</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Hızlı Hizmet</p>
                  <p className="text-sm text-slate-400">30-60 dakika</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Kalite Garantisi</p>
                  <p className="text-sm text-slate-400">%100 memnuniyet</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">Binlerce Müşteri</p>
                  <p className="text-sm text-slate-400">Güvenilir hizmet</p>
                </div>
              </div>
            </div>

            {/* CTA Butonları */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-slate-600 hover:bg-slate-700 text-white px-8 py-4 text-lg">
                <Link href="/randevu">
                  Hemen Randevu Al
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 text-lg">
                <Link href="/hizmetler">
                  Hizmetlerimizi Gör
                </Link>
              </Button>
            </div>
          </div>

          {/* Sağ Taraf - Görsel */}
          <div className="relative">
            <div className="relative z-10">
              {/* Placeholder görsel - gerçek projede buraya salon fotoğrafı gelecek */}
              <div className="w-full h-96 lg:h-[500px] bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl shadow-2xl flex items-center justify-center">
                <div className="text-center text-white">
                  <Scissors className="w-24 h-24 mx-auto mb-4 opacity-80" />
                  <p className="text-xl font-semibold">Salon Görseli</p>
                  <p className="text-sm opacity-80">Buraya gerçek salon fotoğrafı gelecek</p>
                </div>
              </div>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-slate-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-slate-400 rounded-full opacity-30 animate-pulse delay-1000"></div>
          </div>
        </div>
      </div>

      {/* Wave Divider */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            fill="currentColor"
          />
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.46,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            fill="currentColor"
          />
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  )
}
