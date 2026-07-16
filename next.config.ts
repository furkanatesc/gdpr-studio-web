import type { NextConfig } from "next";

/*
  Güvenlik başlıkları (mimari review H1-6). Tüm rotalara uygulanır.

  CSP notları (derinlik savunması — model çıktısı zaten XSS-escape'li):
  - connect-src build-time env'den kurulur: Supabase (auth REST + realtime wss) ve
    backend API (SSE üretim akışı dahil) + Plausible. Böylece env değişince CSP de doğru olur.
  - script-src'de 'unsafe-inline': Next.js hydration bootstrap satır içi script kullanır;
    nonce tabanlı sıkı CSP bu sürümde (değiştirilmiş Next) uygulamayı kırma riski taşır →
    pragmatik taban. Dev'de Fast Refresh için ek olarak 'unsafe-eval'.
  - Stripe redirect tabanlı (hosted checkout) — gömülü script yok, CSP'ye eklenmez.
*/
const isProd = process.env.NODE_ENV === "production";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const apiBase = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");

// Supabase realtime için https origin'in wss karşılığı da gerekir.
const supabaseWss = supabaseUrl?.replace(/^https:/, "wss:");
const plausible = "https://plausible.io";

const connectSrc = [
  "'self'",
  supabaseUrl,
  supabaseWss,
  apiBase,
  plausible,
].filter(Boolean);

const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isProd ? "" : " 'unsafe-eval'"} ${plausible}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  `connect-src ${connectSrc.join(" ")}`,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  // HSTS: yalnız HTTPS'te anlamlı; Vercel HTTPS sunar. 2 yıl + subdomain + preload.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
