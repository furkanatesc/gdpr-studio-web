import type { Metadata, Viewport } from "next";
import { Frank_Ruhl_Libre, DM_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { PLAUSIBLE_DOMAIN, SITE_NAME, SITE_URL } from "@/lib/site";

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

const DESCRIPTION =
  "KVKK ve GDPR uyum dokümanlarını gerçek veri envanterine dayandırarak, hukuki olarak doğru biçimde üreten platform.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    template: `%s — ${SITE_NAME}`,
    default: `${SITE_NAME} — KVKK & GDPR Doküman Platformu`,
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: SITE_NAME,
    url: "/",
    title: `${SITE_NAME} — KVKK & GDPR Doküman Platformu`,
    description: DESCRIPTION,
    images: [{ url: "/og.png", width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — KVKK & GDPR Doküman Platformu`,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
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
  // Plausible yalnız Vercel PRODUCTION dağıtımında yüklenir — preview/localhost
  // istatistikleri kirletmez. Gizlilik-dostu, çerezsiz; rıza banner'ı gerekmez.
  const analyticsEnabled = process.env.VERCEL_ENV === "production";

  return (
    <html lang="tr" className={`${frankRuhl.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full">
        <AuthProvider>{children}</AuthProvider>
        {analyticsEnabled && (
          <Script
            defer
            data-domain={PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
