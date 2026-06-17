import Link from "next/link";

const LINKS = [
  { href: "/urun", label: "Ürün" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/indir", label: "İndir" },
  { href: "/ekip", label: "Ekip" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-display text-[18px] text-ink">
          KVKK <span className="text-accent">Yönetim</span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[13px] text-ink-muted transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-[13px] text-ink-muted transition-colors hover:text-ink"
          >
            Giriş
          </Link>
          <Link
            href="/login"
            className="rounded-pill bg-accent px-4 py-2 text-[13px] font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
          >
            Ücretsiz Dene
          </Link>
        </div>
      </div>
    </header>
  );
}
