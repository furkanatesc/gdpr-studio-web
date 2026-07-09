import type { MetadataRoute } from "next";
import { MARKETING_ROUTES, SITE_URL } from "@/lib/site";

/**
 * Yalnız (marketing) route group altındaki public sayfalar. (auth) rotaları
 * (/login, /kayit, /sifre-sifirla, /yeni-parola, /davet/[token]) ve /app/* çalışma
 * alanı kimlik doğrulama arkasında olduğu için sitemap'e dahil edilmez.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return MARKETING_ROUTES.map((route) => ({
    url: new URL(route, SITE_URL).toString(),
    lastModified,
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.6,
  }));
}
