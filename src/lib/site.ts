/**
 * SEO/metadata için tek kaynak: kanonik alan adı + marketing (public/index-edilebilir)
 * rota listesi. sitemap.ts, robots.ts, root layout metadataBase ve her marketing
 * sayfasının `alternates.canonical` alanı buradan besleniyor — domain sürüklenmesin.
 *
 * NOT: canlı domain doğrulandı — kanonik host www'lu (kvkkyonetim.com, www'suz,
 * 308 ile www'ya yönleniyor; Vercel primary = www).
 */
export const SITE_URL = "https://www.kvkkyonetim.com";
export const SITE_NAME = "KVKK Yönetim";

/**
 * Plausible Analytics `data-domain` — Plausible panelinde site AYNI string ile eklenmeli.
 * Gizlilik-dostu (çerez yok, kişisel veri toplamaz → KVKK/GDPR'a uygun; rıza banner'ı gerekmez).
 * Script yalnız production'da yüklenir (bkz. layout.tsx VERCEL_ENV gate).
 */
export const PLAUSIBLE_DOMAIN = "kvkkyonetim.com";

/** (marketing) route group altındaki, index'lenmesi istenen 8 public sayfa. */
export const MARKETING_ROUTES = [
  "/",
  "/ekip",
  "/fiyatlandirma",
  "/iletisim",
  "/indir",
  "/urun",
  "/yasal/aydinlatma",
  "/yasal/gizlilik",
  "/yasal/kosullar",
] as const;
