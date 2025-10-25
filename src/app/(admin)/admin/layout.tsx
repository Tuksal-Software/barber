import { AdminSidebarFixed } from "./components/AdminSidebarFixed";
import { AdminHeader } from "./components/AdminHeader";
import { AuthGuard } from "./components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-slate-50">
        <AdminSidebarFixed />
        <div className="flex-1 flex flex-col overflow-hidden md:ml-64 transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
