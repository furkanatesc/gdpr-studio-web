"use client";

import { useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";

const LINKS = [
  { href: "/urun", label: "Ürün" },
  { href: "/fiyatlandirma", label: "Fiyatlandırma" },
  { href: "/indir", label: "İndir" },
  { href: "/ekip", label: "Ekip" },
  { href: "/iletisim", label: "İletişim" },
];

export function SiteNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="pt-safe px-safe sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" onClick={() => setOpen(false)} className="font-display text-[18px] text-ink">
          KVKK <span className="text-accent">Yönetim</span>
        </Link>

        {/* Masaüstü linkler */}
        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[13px] text-ink-muted transition-colors hover:text-ink">
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Masaüstü aksiyonlar */}
        <div className="hidden items-center gap-2.5 md:flex">
          <Link href="/login" className="text-[13px] text-ink-muted transition-colors hover:text-ink">
            Giriş
          </Link>
          <ButtonLink href="/login" size="sm">
            Ücretsiz Dene
          </ButtonLink>
        </div>

        {/* Mobil hamburger */}
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Menü"
          aria-expanded={open}
          className="flex h-9 w-9 items-center justify-center rounded-[var(--radius)] border border-border text-ink md:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobil açılır menü */}
      {open && (
        <div className="border-t border-border bg-bg md:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3 text-[14px] text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-3 flex flex-col gap-2.5">
              <ButtonLink href="/login" variant="secondary" onClick={() => setOpen(false)}>
                Giriş
              </ButtonLink>
              <ButtonLink href="/login" onClick={() => setOpen(false)}>
                Ücretsiz Dene
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
