import type { Metadata } from "next";
import "./globals.css";
import Navigation from "@/components/shared/Navigation";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "Elite Berber Salonu - Profesyonel Berber Hizmetleri",
  description: "Modern ve hijyenik ortamda profesyonel berber hizmetleri. Saç kesimi, sakal traşı, saç boyama ve daha fazlası için randevu alın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        <Navigation />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}