import { AdminSidebarFixed } from "./components/AdminSidebarFixed";
import { AuthGuard } from "./components/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="flex h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <AdminSidebarFixed />
        <div className="flex-1 flex flex-col overflow-hidden md:ml-72 transition-all duration-300">
          <main className="flex-1 overflow-y-auto p-4 pt-16 md:pt-8 md:p-8">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
