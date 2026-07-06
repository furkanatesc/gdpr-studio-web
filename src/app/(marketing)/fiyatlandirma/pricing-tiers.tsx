"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { PLAN_PRICE } from "@/lib/pricing";

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
    price: PLAN_PRICE.standart,
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
    price: PLAN_PRICE.premium,
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

/** "₺26.000/yıl" → ["₺26.000", "YIL"]; "Ücretsiz" → ["Ücretsiz", null] */
function splitPrice(p: string): [string, string | null] {
  const ix = p.indexOf("/");
  if (ix === -1) return [p, null];
  return [p.slice(0, ix), p.slice(ix + 1).toUpperCase()];
}

export function PricingTiers() {
  const [interval, setInterval] = useState<Interval>("year");
  return (
    <>
      <div className="mt-8 flex justify-end">
        <div className="flex items-center gap-1 border border-border-strong p-1">
          {(
            [
              ["month", "AYLIK"],
              ["year", "YILLIK — 2 AY BEDAVA"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setInterval(key)}
              aria-pressed={interval === key}
              className={cn(
                " px-4 py-2 font-medium text-[10.5px] uppercase tracking-[0.08em] transition-colors",
                interval === key ? "bg-accent text-accent-contrast" : "text-ink-muted hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => {
          const [amount, unit] = splitPrice(t.price[interval]);
          return (
            <div
              key={t.name}
              data-reveal
              className={cn(
                "flex flex-col border bg-surface p-8 transition-[box-shadow,border-color] duration-300 hover:shadow-[var(--shadow-card)]",
                t.popular ? "border-accent" : "border-border hover:border-border-strong",
              )}
            >
              <div className="flex h-6 items-center justify-end">
                {t.popular && (
                  <span className=" bg-accent px-2.5 py-1 font-medium text-[9.5px] uppercase tracking-[0.1em] text-accent-contrast">
                    En Popüler
                  </span>
                )}
              </div>
              <h2 className="mt-3 font-display text-2xl text-ink">{t.name}</h2>
              <p className="mt-1 text-[12.5px] text-ink-subtle">{t.sub}</p>
              <p className="mt-6 font-display text-4xl font-light text-ink">{amount}</p>
              <p className="mt-1.5 font-medium text-[10.5px] uppercase tracking-[0.08em] text-ink-subtle">
                {unit ? `/ ${unit} · KDV hariç` : "Süresiz"}
              </p>
              <div className="mt-6 border-t border-border" />
              <ul className="mt-5 flex-1 space-y-2.5 text-[13.5px] text-ink-muted">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <span aria-hidden className="mt-px font-medium text-[12px] text-accent">
                      ✓
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <ButtonLink
                href={t.href}
                variant={t.popular ? "primary" : "secondary"}
                size="sm"
                className="mt-7 w-full"
              >
                {t.cta}
              </ButtonLink>
            </div>
          );
        })}
      </div>

      <div
        data-reveal
        className="mt-8 flex flex-col gap-4 border border-border bg-surface px-7 py-6 sm:flex-row sm:items-center sm:justify-between"
      >
        <p className="max-w-3xl text-[13.5px] leading-relaxed text-ink-muted">
          <strong className="font-medium text-ink">Masaüstü uygulaması:</strong> gizlilik açısından
          hassas çalışmalar için verileriniz cihazınızdan hiç çıkmadan, yerel olarak işlenir.
          Standart ve Premium üyeliğe dahildir.
        </p>
        <Link
          href="/indir"
          className="whitespace-nowrap font-medium text-[11.5px] uppercase tracking-[0.08em] text-ink underline underline-offset-4 decoration-[1px] transition-colors hover:text-accent"
        >
          İndir ↗
        </Link>
      </div>
    </>
  );
}
