import Link from 'next/link'
import Image from 'next/image'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo & Tagline */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative w-12 h-12">
                <Image
                  src="/logo.png"
                  alt="The Mens Hair"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold tracking-tight">The Mens Hair</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-md leading-relaxed">
              Profesyonel Erkek Kuaförlük Hizmetleri ile stilinizi yansıtan deneyimler sunuyoruz.
            </p>
            
            {/* Sosyal Medya */}
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com/themenshair"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/themenshair"
                target="_blank"
                rel="noopener noreferrer"
                className="text-slate-400 hover:text-white transition-colors p-2 rounded-full hover:bg-slate-800"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Hızlı Linkler</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-slate-300 hover:text-white transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/hakkimizda" className="text-slate-300 hover:text-white transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-slate-300 hover:text-white transition-colors">
                  Hizmetler
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-slate-300 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
              <li>
                <Link href="/randevu-al" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
                  Randevu Al
                </Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">Hizmetlerimiz</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/hizmetler" className="text-slate-300 hover:text-white transition-colors">
                  Saç Kesimi
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-slate-300 hover:text-white transition-colors">
                  Sakal Traşı
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-slate-300 hover:text-white transition-colors">
                  Saç Boyama
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-slate-300 hover:text-white transition-colors">
                  Çocuk Saç Kesimi
                </Link>
              </li>
              <li>
                <Link href="/hizmetler" className="text-slate-300 hover:text-white transition-colors">
                  Kombinasyon Paketleri
                </Link>
              </li>
            </ul>
          </div>

          {/* İletişim Bilgileri */}
          <div>
            <h3 className="text-lg font-semibold mb-6 text-white">İletişim</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300 text-sm leading-relaxed">
                  Atatürk Caddesi No:123<br />
                  Merkez/İstanbul
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300">+90 (212) 555 0123</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400 flex-shrink-0" />
                <span className="text-slate-300">info@themenshair.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-slate-400 mt-0.5 flex-shrink-0" />
                <div className="text-slate-300 text-sm">
                  <div>Pazartesi - Cumartesi: 09:00 - 19:00</div>
                  <div>Pazar: Kapalı</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-slate-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-400 text-sm text-center md:text-left mb-4 md:mb-0">
              © {currentYear} The Mens Hair. Tüm hakları saklıdır.
            </div>
            <div className="text-slate-400 text-sm">
              Profesyonel Kuaförlük Hizmetleri
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
