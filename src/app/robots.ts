import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * (marketing) rotaları index'e açık; auth akışı ve /app/* çalışma alanı kapalı.
 * Bu robots.ts kuralı tek başına yeterli değil — noindex meta etiketleri de
 * (auth) sayfalarında ve app/layout.tsx'te ayrıca ayarlı (belt-and-suspenders).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/app/", "/login", "/kayit", "/sifre-sifirla", "/yeni-parola", "/davet/"],
    },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
