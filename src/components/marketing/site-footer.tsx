import Link from "next/link";

const COLS = [
  {
    title: "Ürün",
    links: [
      { href: "/urun", label: "Özellikler" },
      { href: "/fiyatlandirma", label: "Fiyatlandırma" },
      { href: "/indir", label: "Masaüstü uygulaması" },
      { href: "/login", label: "Giriş yap" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { href: "/ekip", label: "Ekip" },
      { href: "/iletisim", label: "İletişim" },
    ],
  },
  {
    title: "Yasal",
    links: [
      { href: "/yasal/aydinlatma", label: "Aydınlatma Metni" },
      { href: "/yasal/gizlilik", label: "Gizlilik Politikası" },
      { href: "/yasal/kosullar", label: "Kullanım Koşulları" },
    ],
  },
];

/** Koyu lacivert bant footer — sözleşme §0 (theme-band). */
export function SiteFooter() {
  return (
    <footer className="theme-band bg-bg text-ink">
      <div className="mx-auto max-w-6xl px-6 pb-8 pt-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-[18px] text-ink">
              KVKK <span className="text-accent">Yönetim</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              Avukatlar için uydurmayan KVKK &amp; GDPR doküman asistanı.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow mb-3 text-ink-subtle">{c.title}</p>
              <ul className="space-y-2">
                {c.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-[13px] text-ink-muted transition-colors hover:text-ink"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-12 text-[12px] leading-relaxed text-ink-subtle">
          Üretilen her doküman avukat incelemesine tabi hukuki taslaktır; hukuki tavsiye niteliği
          taşımaz.
        </p>
        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-5 font-medium text-[10.5px] uppercase tracking-[0.1em] text-ink-subtle sm:flex-row sm:justify-between">
          <span>© 2026 KVKK Yönetim</span>
          <span>KVKK 6698 · GDPR 2016/679</span>
        </div>
      </div>
    </footer>
  );
}
