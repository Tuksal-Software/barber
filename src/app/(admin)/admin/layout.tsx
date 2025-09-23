"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const navItems: { href: string; label: string; icon: string }[] = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/appointments", label: "Randevular", icon: "📅" },
  { href: "/admin/barbers", label: "Berberler", icon: "💇‍♂️" },
  { href: "/admin/services", label: "Hizmetler", icon: "✂️" },
  { href: "/admin/gallery", label: "Galeri", icon: "🖼️" },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙️" },
];

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex h-14 items-center border-b px-4 lg:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Menüyü Aç/Kapat"
        >
          ☰ Menü
        </Button>
        <div className="ml-4 font-semibold">Admin Panel</div>
      </div>

      <div className="mx-auto grid w-full max-w-[1400px] grid-cols-1 gap-0 lg:grid-cols-[260px_1fr] lg:gap-6">
        {/* Sidebar */}
        <aside
          className={
            "fixed inset-y-0 z-40 w-72 -translate-x-full border-r bg-card p-4 transition-transform lg:static lg:translate-x-0" +
            (menuOpen ? " translate-x-0" : "")
          }
        >
          <div className="mb-4 hidden items-center gap-2 lg:flex">
            <span className="text-xl">✂️</span>
            <span className="text-lg font-semibold">Admin Panel</span>
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
                    active ? "bg-accent text-accent-foreground" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="px-4 py-6 lg:px-0">
          <div className="hidden h-14 items-center justify-between border-b px-4 lg:flex">
            <div className="font-semibold">{getPageTitle(pathname)}</div>
          </div>
          <div className="pt-4 lg:pt-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

function getPageTitle(pathname: string) {
  const match = navItems.find((n) => n.href === pathname);
  return match ? match.label : "Dashboard";
}


