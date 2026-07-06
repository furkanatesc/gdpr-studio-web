import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, DM_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

// Tipografi disiplini (2026-07-06): YALNIZ referans sitenin iki ailesi —
// Frank Ruhl Libre (başlık serif'i) + DM Sans (geri kalan her şey). Üçüncü font yok;
// kod blokları sistem monospace'ine düşer (ek webfont yüklenmez).
const frankRuhl = Frank_Ruhl_Libre({
  variable: "--font-frankruhl",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KVKK Yönetim — KVKK & GDPR Doküman Platformu",
  description:
    "KVKK ve GDPR uyum dokümanlarını gerçek veri envanterine dayandırarak, hukuki olarak doğru biçimde üreten platform.",
};

// viewport-fit=cover: içerik iPhone çentik/kavis (safe-area) bölgesine uzanır;
// böylece üst barın üstünde beyaz şerit kalmaz. Padding'ler env(safe-area-inset-*) ile.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={`${frankRuhl.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
