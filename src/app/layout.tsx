import type { Metadata, Viewport } from "next";
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const jbMono = JetBrains_Mono({
  variable: "--font-jbmono",
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
    <html
      lang="tr"
      className={`${fraunces.variable} ${inter.variable} ${jbMono.variable} h-full`}
    >
      <body className="min-h-full"><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
