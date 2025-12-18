"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AdminSidebar variant="inset" collapsible="offcanvas" />
      <SidebarInset className="bg-sidebar">
        <AdminHeader />
        <div className="flex flex-1 flex-col bg-sidebar">
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-sidebar">
            <div className="mx-auto w-full max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

