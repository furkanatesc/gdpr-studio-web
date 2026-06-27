"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";

type Interval = "month" | "year";

const TIERS = [
  {
    name: "Başlangıç",
    price: { month: "Ücretsiz", year: "Ücretsiz" },
    sub: "Denemek için",
    features: ["Ayda 5 doküman üretimi", "Temel doküman türleri", "Markdown çıktı", "Topluluk desteği"],
    cta: "Ücretsiz başla",
    href: "/login",
    popular: false,
  },
  {
    name: "Standart",
    price: { month: "₺2.600/ay", year: "₺26.000/yıl" },
    sub: "Bireysel avukatlar",
    features: [
      "Sınırsız doküman üretimi",
      "Altı doküman türünün tamamı",
      "Masaüstü uygulaması (yerel & gizli)",
      "DOCX / PDF dışa aktarım",
      "Envanter & iş kuralları yönetimi",
      "Öncelikli destek",
    ],
    cta: "Standart'a geç",
    href: "/login",
    popular: true,
  },
  {
    name: "Premium",
    price: { month: "₺5.000/ay", year: "₺50.000/yıl" },
    sub: "Hukuk büroları & şirketler",
    features: [
      "Çok kullanıcılı çalışma alanı",
      "SSO & rol yönetimi",
      "Denetim günlüğü",
      "AB/TR veri ikameti",
      "MCP server erişimi",
    ],
    cta: "Premium'a geç",
    href: "/login",
    popular: false,
  },
];

export function PricingTiers() {
  const [interval, setInterval] = useState<Interval>("year");
  return (
    <>
      <div className="mt-8 flex items-center justify-center gap-3">
        <button
          onClick={() => setInterval("month")}
          className={cn(
            "rounded-pill px-4 py-1.5 text-[13px] transition-colors",
            interval === "month" ? "bg-accent text-accent-contrast" : "text-ink-muted hover:bg-surface-2",
          )}
        >
          Aylık
        </button>
        <button
          onClick={() => setInterval("year")}
          className={cn(
            "rounded-pill px-4 py-1.5 text-[13px] transition-colors",
            interval === "year" ? "bg-accent text-accent-contrast" : "text-ink-muted hover:bg-surface-2",
          )}
        >
          Yıllık <span className="ml-1 text-[11px] opacity-80">2 ay bedava</span>
        </button>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            data-reveal
            className={cn(
              "flex flex-col rounded-[calc(var(--radius)+6px)] border bg-surface p-7 transition-[box-shadow,border-color] duration-300 hover:shadow-[var(--shadow-card)]",
              t.popular ? "border-accent" : "border-border hover:border-border-strong",
            )}
          >
            {t.popular && (
              <span className="mb-3 self-start rounded-pill bg-accent px-3 py-1 text-[11px] font-semibold text-accent-contrast">
                EN POPÜLER
              </span>
            )}
            <h2 className="font-display text-xl text-ink">{t.name}</h2>
            <p className="mt-1 text-[12px] text-ink-subtle">{t.sub}</p>
            <p className="mt-4 font-display text-3xl text-ink">{t.price[interval]}</p>
            <p className="mt-1 text-[12px] text-ink-subtle">KDV hariç</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] text-ink-muted">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Icon name="check" className="mt-0.5 text-[15px] text-accent" />
                  {f}
                </li>
              ))}
            </ul>
            <ButtonLink href={t.href} variant={t.popular ? "primary" : "secondary"} size="sm" className="mt-7 w-full">
              {t.cta}
            </ButtonLink>
          </div>
        ))}
      </div>

      <div data-reveal className="mt-10 rounded-[var(--radius)] border border-border bg-surface px-6 py-5 text-center text-[13.5px] text-ink-muted">
        <strong className="text-ink">Masaüstü uygulaması:</strong> Gizlilik açısından hassas
        çalışmalar için verileriniz cihazınızdan hiç çıkmadan, yerel olarak işlenir. Standart ve
        Premium üyeliğe dahildir.{" "}
        <Link href="/indir" className="text-accent hover:text-accent-strong">
          İndir →
        </Link>
      </div>
    </>
  );
}
