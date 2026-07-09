import { SITE_NAME, SITE_URL } from "@/lib/site";
import { PLAN_PRICE } from "@/lib/pricing";

/**
 * Organization + SoftwareApplication JSON-LD (schema.org). Yalnız doğrulanmış gerçek
 * bilgi: marka adı/URL/logo ve fiyatlandırma sayfasındaki (src/lib/pricing.ts) gerçek
 * yıllık fiyatlar. Hiçbir alan uydurulmadı — bilinmeyen/doğrulanmamış alanlar (ör.
 * founder isimleri, sameAs sosyal medya) atlandı (KVKK içerik-bütünlüğü kuralı).
 *
 * FAQPage JSON-LD BİLEREK EKLENMEDİ: /fiyatlandirma ve /urun sayfalarında gerçek
 * soru-cevap içeriği yok (denetlendi, 2026-07-09) — sahte SSS uydurulmaz.
 */
export function StructuredData() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: SITE_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/icon-512.png`,
      },
      {
        "@type": "SoftwareApplication",
        name: SITE_NAME,
        url: SITE_URL,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, Windows, macOS",
        offers: [
          {
            "@type": "Offer",
            name: "Başlangıç",
            price: "0",
            priceCurrency: "TRY",
          },
          {
            "@type": "Offer",
            name: "Standart",
            price: PLAN_PRICE.standart.year.replace(/[^\d]/g, ""),
            priceCurrency: "TRY",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: PLAN_PRICE.standart.year.replace(/[^\d]/g, ""),
              priceCurrency: "TRY",
              billingDuration: "P1Y",
            },
          },
          {
            "@type": "Offer",
            name: "Premium",
            price: PLAN_PRICE.premium.year.replace(/[^\d]/g, ""),
            priceCurrency: "TRY",
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              price: PLAN_PRICE.premium.year.replace(/[^\d]/g, ""),
              priceCurrency: "TRY",
              billingDuration: "P1Y",
            },
          },
        ],
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
