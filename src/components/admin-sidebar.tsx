"use client"

import * as React from "react"
import {
  LayoutDashboardIcon,
  CalendarIcon,
  CalendarDaysIcon,
  UsersIcon,
  BookOpenIcon,
  ReceiptIcon,
  MessageSquareIcon,
  ActivityIcon,
  SettingsIcon,
  ClockIcon,
  RepeatIcon,
  CalendarPlusIcon,
} from "lucide-react"
import { usePathname } from "next/navigation"
import { useTransition } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/actions/auth.actions"
import { getSessionClient } from "@/lib/actions/auth-client.actions"

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboardIcon,
    disabled: false
  },
  {
    title: "Randevular",
    url: "/admin/randevular",
    icon: CalendarIcon,
    disabled: false
  },
  {
    title: "Takvim",
    url: "/admin/randevular/takvim",
    icon: CalendarDaysIcon,
    disabled: false
  },
  {
    title: "Abonmanlar",
    url: "/admin/abonmanlar",
    icon: RepeatIcon,
    disabled: false
  },
  {
    title: "Çalışma Saatleri",
    url: "/admin/working-hours",
    icon: ClockIcon,
    disabled: false
  },
  {
    title: "Manuel Randevu",
    url: "/admin/manuel-randevu",
    icon: CalendarPlusIcon,
    disabled: false
  },
  {
    title: "Defter",
    url: "/admin/defter",
    icon: BookOpenIcon,
    disabled: false
  },
  {
    title: "Giderler",
    url: "/admin/giderler",
    icon: ReceiptIcon,
    disabled: false
  },
  {
    title: "SMS Logları",
    url: "/admin/sms-log",
    icon: MessageSquareIcon,
    disabled: false
  },
  {
    title: "Audit Logs",
    url: "/admin/audit-logs",
    icon: ActivityIcon,
    disabled: false
  },
  {
    title: "Berberler",
    url: "/admin/berberler",
    icon: UsersIcon,
    disabled: false
  },
  {
    title: "Ayarlar",
    url: "/admin/settings",
    icon: SettingsIcon,
    disabled: false
  },
]

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [user, setUser] = React.useState<{ name: string; email: string; avatar: string } | null>(null)

  React.useEffect(() => {
    async function loadUser() {
      const session = await getSessionClient()
      if (session) {
        setUser({
          name: session.name,
          email: session.email,
          avatar: "",
        })
      }
    }
    loadUser()
  }, [])

  const handleLogout = () => {
    if (isPending) return
    
    startTransition(async () => {
      await logout()
      toast.success("Çıkış yapıldı")
      router.replace("/admin/login")
      router.refresh()
    })
  }

  const navItemsWithActive = navItems.map((item) => ({
    ...item,
    isActive: pathname === item.url || (item.url === "/admin/randevular" && pathname.startsWith("/admin/randevular") && pathname !== "/admin/randevular/takvim"),
  }))

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/admin">
                <span className="text-base font-semibold">Berber Paneli</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItemsWithActive.filter(item => !item.disabled)} />
      </SidebarContent>
      <SidebarFooter>
        {user && (
          <NavUser 
            user={user}
            onLogout={handleLogout}
            isPending={isPending}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}

