import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

export function AdminHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border bg-sidebar/95 backdrop-blur supports-[backdrop-filter]:bg-sidebar/80 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 md:px-6">
        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground active:text-primary hover:bg-accent/50" />
        <Separator
          orientation="vertical"
          className="h-4"
        />
        <h1 className="text-base font-semibold text-foreground">Admin Panel</h1>
      </div>
    </header>
  )
}

