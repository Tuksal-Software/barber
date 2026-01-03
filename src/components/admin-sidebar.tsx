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

import { NavUser } from "@/components/nav-user"
import Link from "next/link"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { logout } from "@/lib/actions/auth.actions"
import { getSessionClient } from "@/lib/actions/auth-client.actions"

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboardIcon,
    disabled: false,
    group: "ana"
  },
  {
    title: "Randevular",
    url: "/admin/randevular",
    icon: CalendarIcon,
    disabled: false,
    group: "ana"
  },
  {
    title: "Takvim",
    url: "/admin/randevular/takvim",
    icon: CalendarDaysIcon,
    disabled: false,
    group: "ana"
  },
  {
    title: "Berberler",
    url: "/admin/berberler",
    icon: UsersIcon,
    disabled: false,
    group: "isletme"
  },
  {
    title: "Çalışma Saatleri",
    url: "/admin/working-hours",
    icon: ClockIcon,
    disabled: false,
    group: "isletme"
  },
  {
    title: "Abonmanlar",
    url: "/admin/abonmanlar",
    icon: RepeatIcon,
    disabled: false,
    group: "isletme"
  },
  {
    title: "Manuel Randevu",
    url: "/admin/manuel-randevu",
    icon: CalendarPlusIcon,
    disabled: false,
    group: "isletme"
  },
  {
    title: "Defter",
    url: "/admin/defter",
    icon: BookOpenIcon,
    disabled: false,
    group: "defter"
  },
  {
    title: "Giderler",
    url: "/admin/giderler",
    icon: ReceiptIcon,
    disabled: false,
    group: "defter"
  },
  {
    title: "SMS Logları",
    url: "/admin/sms-log",
    icon: MessageSquareIcon,
    disabled: false,
    group: "loglar"
  },
  {
    title: "Sistem Logları",
    url: "/admin/audit-logs",
    icon: ActivityIcon,
    disabled: false,
    group: "loglar"
  },
  {
    title: "Ayarlar",
    url: "/admin/settings",
    icon: SettingsIcon,
    disabled: false,
    group: "ayarlar"
  },
]

const groupLabels: Record<string, string> = {
  ana: "Ana",
  isletme: "İşletme",
  defter: "Defter & Finans",
  loglar: "Loglar & Kayıtlar",
  ayarlar: "Ayarlar"
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [user, setUser] = React.useState<{ name: string; email: string; avatar: string } | null>(null)
  const { isMobile, setOpenMobile } = useSidebar()

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

  React.useEffect(() => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }, [pathname, isMobile, setOpenMobile])

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

  const groupedItems = navItemsWithActive
    .filter(item => !item.disabled)
    .reduce((acc, item) => {
      if (!acc[item.group]) {
        acc[item.group] = []
      }
      acc[item.group].push(item)
      return acc
    }, {} as Record<string, typeof navItemsWithActive>)

  const groupOrder = ["ana", "isletme", "defter", "loglar", "ayarlar"]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link 
                href="/admin"
                onClick={() => {
                  if (isMobile) {
                    setOpenMobile(false)
                  }
                }}
              >
                <span className="text-base font-semibold">Berber Paneli</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {groupOrder.map((groupKey) => {
          const items = groupedItems[groupKey]
          if (!items || items.length === 0) return null

          return (
            <SidebarGroup key={groupKey}>
              <SidebarGroupLabel className="text-xs text-muted-foreground uppercase tracking-wide">
                {groupLabels[groupKey]}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {items.map((item) => {
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          asChild
                          tooltip={item.title}
                          isActive={item.isActive}
                        >
                          <Link 
                            href={item.url}
                            onClick={() => {
                              if (isMobile) {
                                setOpenMobile(false)
                              }
                            }}
                          >
                            {Icon && <Icon />}
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
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

