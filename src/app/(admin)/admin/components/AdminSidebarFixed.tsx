"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Calendar,
  Settings,
  Scissors,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

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
  {
    name: "Hizmetler",
    href: "/admin/services",
    icon: Scissors,
  },
  {
    name: "Ayarlar",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebarFixed() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300",
        isCollapsed ? "md:w-16" : "md:w-72"
      )}>
        <div className="flex-1 flex flex-col min-h-0 bg-white/10 backdrop-blur-xl border-r border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-5 mb-8">
              <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-lg shadow" />
              {!isCollapsed && (
                <div className="ml-3">
                  <span className="block text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 bg-clip-text text-transparent">
                    The Mens Hair
                  </span>
                  <span className="block text-[11px] text-slate-500">Admin Panel</span>
                </div>
              )}
            </div>
            
            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "relative group flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-300",
                      isActive
                        ? "text-slate-900 bg-white/70 shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    )}
                    title={isCollapsed ? item.name : undefined}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1.5 rounded-full bg-gradient-to-b from-teal-500 to-cyan-500" />
                    )}
                    <item.icon
                      className={cn(
                        "h-5 w-5 flex-shrink-0 transition-all",
                        isActive ? "text-teal-600" : "text-slate-400 group-hover:text-slate-700",
                        isCollapsed ? "mx-auto" : "mr-3"
                      )}
                    />
                    {!isCollapsed && (
                      <span className="transition-transform group-hover:translate-x-0.5">{item.name}</span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="border-t border-white/10" />
          
          {/* User Section */}
          <div className="flex-shrink-0 p-4">
            {!isCollapsed && (
              <div className="flex items-center space-x-3 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">
                    Burak Şirin
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    Admin
                  </p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <button
                className={cn(
                  "w-full flex items-center px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-white/50 transition-colors rounded-lg",
                  isCollapsed && "justify-center"
                )}
                onClick={() => {
                  localStorage.removeItem('barberId');
                  window.location.href = '/admin/login';
                }}
                title={isCollapsed ? "Çıkış Yap" : undefined}
              >
                <LogOut className={cn("h-4 w-4", isCollapsed ? "" : "mr-2")} />
                {!isCollapsed && "Çıkış Yap"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  );
}

function MobileSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Mobile Menu Button */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 bg-slate-900 text-white border-slate-700 hover:bg-slate-800"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        
        <SheetContent side="left" className="w-64 p-0 bg-gradient-to-b from-slate-900 to-slate-800 border-slate-700">
          <div className="flex flex-col h-full">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Logo */}
              <div className="flex items-center justify-between px-4 mb-8">
                <div className="flex items-center">
                  <img src="/logo.png" alt="Logo" className="h-8 w-8" />
                  <span className="ml-3 text-xl font-bold text-white">
                    The Mens Hair
                  </span>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "group flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200",
                        isActive
                          ? "bg-slate-800 border-l-4 border-blue-500 text-white shadow-lg"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                          isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white"
                        )}
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
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    Burak Şirin
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
        </SheetContent>
      </Sheet>
    </div>
  );
}