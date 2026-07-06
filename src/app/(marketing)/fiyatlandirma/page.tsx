import { PricingTiers } from "./pricing-tiers";

export const metadata = {
  title: "Fiyatlandırma — KVKK Yönetim",
  description:
    "Başlangıç, Standart ve Premium planlar. Web sürümünde model maliyetini biz karşılarız; masaüstü uygulaması Standart ve Premium üyeliğe dahildir.",
};

export default function FiyatlandirmaPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      {/* Sayfa başlığı grameri: mono eyebrow → Fraunces h1 → hairline (sözleşme §2.1) */}
      <div className="border-b border-border pb-8">
        <p className="eyebrow">Fiyatlandırma — Tüm fiyatlar KDV hariç</p>
        <h1 className="mt-4 font-display text-4xl font-light leading-tight text-ink md:text-5xl">
          Size uygun planı seçin.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Web sürümünde model maliyetini biz karşılarız; masaüstü uygulaması ise Standart ve
          Premium üyeliğe dahildir.
        </p>
      </div>
      <PricingTiers />
    </div>
  );
}
