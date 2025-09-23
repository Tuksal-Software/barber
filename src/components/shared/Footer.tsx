import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter } from 'lucide-react'
import { mockSiteSettings } from '@/lib/mock-data'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-slate-800 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Salon Bilgileri */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold">{mockSiteSettings.salonName}</span>
            </div>
            <p className="text-slate-300 mb-6 max-w-md">
              {mockSiteSettings.description}
            </p>
            
            {/* İletişim Bilgileri */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-slate-400" />
                <span>{mockSiteSettings.phone}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-slate-400" />
                <span>{mockSiteSettings.email}</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span>{mockSiteSettings.address}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>Pazartesi - Cumartesi: 09:00 - 19:00</span>
              </div>
            </div>
          </div>

          {/* Hızlı Linkler */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Hızlı Linkler</h3>
            <ul className="space-y-2">
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
                <Link href="/galeri" className="text-slate-300 hover:text-white transition-colors">
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/iletisim" className="text-slate-300 hover:text-white transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Hizmetler */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-slate-300">Hizmetler</h3>
            <ul className="space-y-2">
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
            </ul>
          </div>
        </div>

        {/* Alt Bilgi */}
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-slate-400 text-sm mb-4 md:mb-0">
              © {currentYear} {mockSiteSettings.salonName}. Tüm hakları saklıdır.
            </div>
            
            {/* Sosyal Medya */}
            <div className="flex items-center space-x-4">
              <span className="text-slate-400 text-sm">Bizi takip edin:</span>
              {mockSiteSettings.socialMedia.instagram && (
                <a
                  href={mockSiteSettings.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {mockSiteSettings.socialMedia.facebook && (
                <a
                  href={mockSiteSettings.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {mockSiteSettings.socialMedia.twitter && (
                <a
                  href={mockSiteSettings.socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
