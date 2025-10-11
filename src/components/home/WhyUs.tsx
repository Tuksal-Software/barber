import { Award, Shield, Users, Sparkles } from 'lucide-react'

const features = [
  {
    icon: <Award className="w-8 h-8" />,
    title: "Uzman Ekip",
    description: "10+ yıl deneyimli profesyonel kuaförlerimizle en kaliteli hizmeti alırsınız."
  },
  {
    icon: <Shield className="w-8 h-8" />,
    title: "Hijyenik Ortam",
    description: "Modern ekipmanlar ve sterilizasyon standartları ile güvenli bir deneyim."
  },
  {
    icon: <Users className="w-8 h-8" />,
    title: "Kişisel Yaklaşım",
    description: "Her müşterimize özel danışmanlık ve kişiselleştirilmiş hizmet sunuyoruz."
  },
  {
    icon: <Sparkles className="w-8 h-8" />,
    title: "Modern Teknikler",
    description: "En güncel kuaförlük teknikleri ve trendlerle stilinizi öne çıkarıyoruz."
  }
]

export default function WhyUs() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Neden The Mens Hair?
          </h2>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Profesyonel hizmet anlayışımız ve kalite odaklı yaklaşımımızla fark yaratıyoruz
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-300"
            >
              {/* Icon */}
              <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto mb-6 group-hover:bg-amber-600 group-hover:text-white transition-all duration-300">
                {feature.icon}
              </div>

              {/* Content */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-slate-50 rounded-2xl p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-amber-600">
                10+
              </div>
              <div className="text-lg font-semibold text-slate-900">
                Yıl Deneyim
              </div>
              <div className="text-slate-600">
                Profesyonel kuaförlük alanında
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-amber-600">
                500+
              </div>
              <div className="text-lg font-semibold text-slate-900">
                Mutlu Müşteri
              </div>
              <div className="text-slate-600">
                Memnuniyet garantili hizmet
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-4xl md:text-5xl font-bold text-amber-600">
                100%
              </div>
              <div className="text-lg font-semibold text-slate-900">
                Hijyenik
              </div>
              <div className="text-slate-600">
                Sterilizasyon standartları
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
