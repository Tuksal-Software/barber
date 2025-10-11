import Link from 'next/link'
import { Calendar, ArrowRight } from 'lucide-react'

export default function CTASection() {
  return (
    <section className="py-16 md:py-24 bg-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/20 to-transparent" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/10 rounded-full -translate-y-48 translate-x-48" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-600/10 rounded-full translate-y-32 -translate-x-32" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Heading */}
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 tracking-tight">
            Yeni Görünümünüz İçin
            <span className="block text-amber-400">Randevu Alın</span>
          </h2>
          
          {/* Description */}
          <p className="text-xl md:text-2xl text-slate-300 mb-12 leading-relaxed">
            Profesyonel ekibimizle birlikte stilinizi keşfedin ve en iyi versiyonunuzu ortaya çıkarın.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/randevu-al"
              className="group bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-semibold text-lg flex items-center space-x-3 min-h-[56px] w-full sm:w-auto justify-center"
            >
              <Calendar className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Hemen Randevu Al</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link
              href="/iletisim"
              className="group border-2 border-white text-white hover:bg-white hover:text-slate-900 px-8 py-4 rounded-lg transition-all duration-300 font-semibold text-lg flex items-center space-x-3 min-h-[56px] w-full sm:w-auto justify-center"
            >
              <span>İletişime Geç</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">
                ✓ Ücretsiz Danışmanlık
              </div>
              <div className="text-slate-300 text-sm">
                İlk randevunuzda ücretsiz stil danışmanlığı
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">
                ✓ Esnek Saatler
              </div>
              <div className="text-slate-300 text-sm">
                Hafta içi ve hafta sonu uygun saatler
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-2xl md:text-3xl font-bold text-amber-400">
                ✓ Memnuniyet Garantisi
              </div>
              <div className="text-slate-300 text-sm">
                %100 memnuniyet garantili hizmet
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
