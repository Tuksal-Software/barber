"use client"

import { AdminSidebar } from "@/components/admin-sidebar"
import { AdminHeader } from "@/components/admin-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"

export function AdminShell({ children }: { children: React.ReactNode }) {
    return (
        <SidebarProvider>
            <AdminSidebar variant="inset" collapsible="offcanvas" />
            <SidebarInset className="bg-black">
                <AdminHeader />
                <div className="flex flex-1 flex-col bg-black">
                    <main className="flex-1 overflow-y-auto p-3 md:p-4 lg:p-6 bg-black">
                        <Card className="rounded-3xl shadow-lg">
                            <div className="p-6 md:p-8 lg:p-10">
                                {children}
                            </div>
                        </Card>
                    </main>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}