import Navigation from "@/components/shared/Navigation";
import Footer from "@/components/shared/Footer";
import { Toaster } from "sonner";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navigation />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <Toaster richColors position="top-right" />
    </>
  );
}
