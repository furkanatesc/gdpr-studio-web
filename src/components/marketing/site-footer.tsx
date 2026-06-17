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

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <div className="font-display text-[18px] text-ink">
              KVKK <span className="text-accent">Yönetim</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-ink-muted">
              KVKK & GDPR uyum dokümanlarını gerçek envantere dayandırarak üreten platform.
            </p>
          </div>
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="eyebrow mb-3">{c.title}</p>
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

        <div className="mt-12 border-t border-border pt-6 text-[12px] leading-relaxed text-ink-subtle">
          © 2026 KVKK Yönetim · Üretilen her doküman avukat incelemesine tabi hukuki taslaktır;
          hukuki tavsiye niteliği taşımaz.
        </div>
      </div>
    </footer>
  );
}
