import Link from "next/link";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";
import { Icon } from "@/components/ui/icon";

export const metadata = {
  title: "Fiyatlandırma — KVKK Yönetim",
  description:
    "Başlangıç, Pro ve Kurumsal planlar. Web sürümünde model maliyetini biz karşılarız; masaüstü uygulaması Pro ve Kurumsal üyeliğe dahildir.",
};

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
      "Masaüstü uygulaması (yerel & gizli)",
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
          Web sürümünde model maliyetini biz karşılarız; masaüstü uygulaması ise Pro ve
          Kurumsal üyeliğe dahildir.
        </p>
      </div>

      <div className="mt-14 grid gap-5 md:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            data-reveal
            className={cn(
              "flex flex-col rounded-[calc(var(--radius)+6px)] border bg-surface p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-card)]",
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
            <p className="mt-4 font-display text-3xl text-ink">{t.price}</p>
            <ul className="mt-6 flex-1 space-y-2.5 text-[13.5px] text-ink-muted">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2">
                  <Icon name="check" className="mt-0.5 text-[15px] text-accent" />
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
        ))}
      </div>

      <div data-reveal className="mt-10 rounded-[var(--radius)] border border-border bg-surface px-6 py-5 text-center text-[13.5px] text-ink-muted">
        <strong className="text-ink">Masaüstü uygulaması:</strong> Gizlilik açısından hassas
        çalışmalar için verileriniz cihazınızdan hiç çıkmadan, yerel olarak işlenir. Pro ve
        Kurumsal üyeliğe dahildir.{" "}
        <Link href="/indir" className="text-accent hover:text-accent-strong">
          İndir →
        </Link>
      </div>
    </div>
  );
}
