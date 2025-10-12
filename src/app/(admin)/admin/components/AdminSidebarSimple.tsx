"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Calendar, LogOut } from "lucide-react";

const navigation = [
  {
    name: "Anasayfa",
    href: "/admin",
    icon: Home,
  },
  {
    name: "Berberler",
    href: "/admin/berberler",
    icon: Users,
  },
  {
    name: "Randevular",
    href: "/admin/randevular",
    icon: Calendar,
  },
];

export function AdminSidebarSimple() {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex-1 flex flex-col min-h-0 bg-slate-900">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0 px-4 mb-8">
            <img src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="ml-3 text-xl font-bold text-white">
              The Mens Hair
            </span>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-slate-800 border-l-4 border-blue-500 text-white shadow-lg"
                      : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 transition-colors ${
                      isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="border-t border-slate-700" />
        
        {/* User Section */}
        <div className="flex-shrink-0 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
              AY
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                Ahmet Yılmaz
              </p>
              <p className="text-xs text-slate-400 truncate">
                Admin
              </p>
            </div>
          </div>
          <button
            className="w-full flex items-center px-3 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors rounded-lg"
            onClick={() => {
              localStorage.removeItem('barberId');
              window.location.href = '/admin/login';
            }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Çıkış Yap
          </button>
        </div>
      </div>
    </div>
  );
}
