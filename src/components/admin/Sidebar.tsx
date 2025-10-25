'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  Scissors, 
  Image, 
  Settings,
  BarChart3
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Randevular', href: '/admin/appointments', icon: Calendar },
  { name: 'Berberler', href: '/admin/barbers', icon: Users },
  { name: 'Hizmetler', href: '/admin/services', icon: Scissors },
  { name: 'Galeri', href: '/admin/gallery', icon: Image },
  { name: 'Ayarlar', href: '/admin/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col w-64 bg-slate-900 text-white">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 px-4 border-b border-slate-700">
        <h1 className="text-xl font-bold">Admin Panel</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <item.icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Quick Stats */}
      <div className="p-4 border-t border-slate-700">
        <div className="text-xs text-slate-400 mb-2">Bugünkü İstatistikler</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Randevular</span>
            <span className="text-white font-semibold">12</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">Gelir</span>
            <span className="text-white font-semibold">₺1,240</span>
          </div>
        </div>
      </div>
    </div>
  )
}




