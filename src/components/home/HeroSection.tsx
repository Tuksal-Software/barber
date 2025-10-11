import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'

export default function HeroSection() {
  return (
    <section className="relative min-h-[600px] md:min-h-[700px] lg:min-h-[800px] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero.jpg"
          alt="The Mens Hair Salon"
          fill
          className="object-cover"
          priority
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/70 via-slate-900/50 to-slate-900/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
            The Mens Hair
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl text-white/90 mb-8 font-light leading-relaxed">
            Stilinizi Yansıtan Profesyonel Kuaförlük Deneyimi
          </p>
          
          {/* Description */}
          <p className="text-lg md:text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
            Modern ve hijyenik ortamda uzman ekibimizle birlikte size özel bakım hizmetleri sunuyoruz.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/randevu-al"
              className="group bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center space-x-3 min-h-[56px]"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Randevu Al</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/hizmetler"
              className="group border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg flex items-center space-x-3 min-h-[56px]"
            >
              <span>Hizmetlerimizi Keşfedin</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="text-white/90">
              <div className="text-3xl font-bold text-amber-400 mb-2">10+</div>
              <div className="text-sm uppercase tracking-wide">Yıl Deneyim</div>
            </div>
            <div className="text-white/90">
              <div className="text-3xl font-bold text-amber-400 mb-2">500+</div>
              <div className="text-sm uppercase tracking-wide">Mutlu Müşteri</div>
            </div>
            <div className="text-white/90">
              <div className="text-3xl font-bold text-amber-400 mb-2">100%</div>
              <div className="text-sm uppercase tracking-wide">Hijyenik</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}
