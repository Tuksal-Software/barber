import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "The Mens Hair - Profesyonel Erkek Kuaförlük Hizmetleri",
  description: "Stilinizi yansıtan profesyonel kuaförlük deneyimi. Modern ve hijyenik ortamda saç kesimi, sakal traşı ve daha fazlası için randevu alın.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="antialiased">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}