import Link from "next/link";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    name: "Başlangıç",
    price: "Ücretsiz",
    sub: "Denemek için",
    features: [
      "Ayda 5 doküman üretimi",
      "Temel doküman türleri",
      "Markdown çıktı",
      "Topluluk desteği",
    ],
    cta: "Ücretsiz başla",
    href: "/login",
    popular: false,
  },
  {
    name: "Pro",
    price: "₺—/ay",
    sub: "Bireysel avukatlar",
    features: [
      "Sınırsız doküman üretimi",
      "Altı doküman türünün tamamı",
      "DOCX / PDF dışa aktarım",
      "Envanter & iş kuralları yönetimi",
      "Öncelikli destek",
    ],
    cta: "Pro'ya geç",
    href: "/login",
    popular: true,
  },
  {
    name: "Kurumsal",
    price: "İletişime geçin",
    sub: "Hukuk büroları & şirketler",
    features: [
      "Çok kullanıcılı çalışma alanı",
      "SSO & rol yönetimi",
      "Denetim günlüğü",
      "AB/TR veri ikameti",
      "MCP server erişimi",
    ],
    cta: "Bizimle görüşün",
    href: "/iletisim",
    popular: false,
  },
];

export default function FiyatlandirmaPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="eyebrow mb-3">Fiyatlandırma</p>
        <h1 className="font-display text-4xl leading-tight text-ink">Size uygun planı seçin</h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Web sürümünde model maliyeti bize ait; masaüstünde kendi anahtarınızla sınırsız ve
          ücretsiz kullanırsınız.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            data-reveal
            className={cn(
              "flex flex-col rounded-[calc(var(--radius)+6px)] border bg-surface p-7",
              t.popular ? "border-accent" : "border-border",
            )}
          >
            {t.popular && (
              <span className="mb-3 self-start rounded-pill bg-accent px-3 py-1 text-[11px] font-semibold text-accent-contrast">
                EN POPÜLER
              </span>
            )}
            <h2 className="font-display text-xl text-ink">{t.name}</h2>
            <p className="mt-1 text-[12px] text-ink-subtle">{t.sub}</p>
            <p className="mt-4 font-display text-3xl text-ink">{t.price}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] text-ink-muted">
              {t.features.map((f) => (
                <li key={f} className="flex gap-2">
                  <span className="text-accent">✓</span>
                  {f}
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className={cn(
                "mt-7 inline-flex items-center justify-center rounded-pill px-5 py-2.5 text-sm font-medium transition-colors",
                t.popular
                  ? "bg-accent text-accent-contrast hover:bg-accent-strong"
                  : "border border-border-strong text-ink hover:bg-surface-2",
              )}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>

      <div data-reveal className="mt-10 rounded-[var(--radius)] border border-border bg-surface px-6 py-5 text-center text-[13.5px] text-ink-muted">
        <strong className="text-ink">Masaüstü (BYOK):</strong> Electron uygulaması ücretsizdir;
        yalnızca kendi Anthropic API kullanımınızı ödersiniz. Veriniz cihazınızdan çıkmaz.{" "}
        <Link href="/indir" className="text-accent hover:text-accent-strong">
          İndir →
        </Link>
      </div>
    </div>
  );
}
