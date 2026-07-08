"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import { DOC_CATALOG } from "@/lib/catalog";

// Etiketler doğrudan büyük harf yazılır (Türkçe İ/ı için CSS uppercase'e güvenilmez).
const LINKS = [
  { href: "/urun", label: "ÜRÜN", items: DOC_CATALOG },
  { href: "/fiyatlandirma", label: "FİYATLANDIRMA" },
  { href: "/indir", label: "İNDİR" },
  { href: "/ekip", label: "EKİP" },
  { href: "/iletisim", label: "İLETİŞİM" },
] as const;

const linkClass =
  "font-display text-[13px] tracking-[0.12em] text-ink-muted transition-colors hover:text-ink";

export function SiteNav() {
  const [open, setOpen] = useState(false); // mobil menü
  const [dropOpen, setDropOpen] = useState(false); // masaüstü "Ürün" dropdown
  const [scrolled, setScrolled] = useState(false);

  // Burton deseni: aşağı kaydırınca bant düz koyu (#0c192c) + kompakt hâle geçer.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`theme-band pt-safe px-safe sticky top-0 z-50 border-b border-border transition-[background-color,box-shadow] duration-300 ${
        scrolled ? "bg-[#0c192c] shadow-[0_8px_30px_rgba(0,0,0,0.35)]" : "bg-[#123055]"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between px-6 transition-[height] duration-300 ${
          scrolled ? "h-14" : "h-20"
        }`}
      >
        <Link
          href="/"
          onClick={() => setOpen(false)}
          className={`font-display tracking-[0.14em] text-ink transition-all duration-300 ${
            scrolled ? "text-[16px]" : "text-[18px]"
          }`}
        >
          KVKK <span className="text-accent">YÖNETİM</span>
        </Link>

        {/* Masaüstü linkler */}
        <nav className="hidden h-full items-stretch gap-8 lg:flex">
          {LINKS.map((l) =>
            "items" in l ? (
              <div
                key={l.href}
                className={`relative flex h-full items-center px-4 transition-colors ${dropOpen ? "bg-[#0c192c]" : ""}`}
                onMouseEnter={() => setDropOpen(true)}
                onMouseLeave={() => setDropOpen(false)}
              >
                <Link
                  href={l.href}
                  aria-expanded={dropOpen}
                  className={`${linkClass} inline-flex items-center gap-1.5 ${dropOpen ? "!text-ink" : ""}`}
                >
                  {l.label}
                  <svg
                    width="9"
                    height="9"
                    viewBox="0 0 10 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    aria-hidden
                    className={`transition-transform duration-200 ${dropOpen ? "rotate-180" : ""}`}
                  >
                    <path d="M2 3.5L5 6.5L8 3.5" />
                  </svg>
                </Link>

                {/* Dropdown — sola hizalı (sağa doğru açılır), tetikleyiciye bitişik
                    keskin köşeli koyu panel (#0c192c); belge türleri, açık hairline ayraç. */}
                <div
                  className={`absolute left-0 top-full w-[320px] border border-border bg-[#0c192c] shadow-[0_22px_54px_rgba(0,0,0,0.5)] transition-opacity duration-150 ${
                    dropOpen ? "visible opacity-100" : "invisible opacity-0"
                  }`}
                >
                  {l.items.map((d) => (
                    <Link
                      key={d.type}
                      href={`/app/${d.type}`}
                      className="group block border-b border-border px-6 py-4 transition-colors last:border-b-0 hover:bg-surface"
                    >
                      <span className="font-display text-[13px] uppercase tracking-[0.14em] leading-snug text-ink-muted transition-colors group-hover:text-ink">
                        {d.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={l.href} href={l.href} className={`${linkClass} inline-flex items-center`}>
                {l.label}
              </Link>
            ),
          )}
        </nav>

        {/* Masaüstü aksiyonlar */}
        <div className="hidden items-center gap-5 lg:flex">
          <Link
            href="/login"
            className="font-display text-[12px] tracking-[0.12em] text-ink transition-colors hover:text-accent"
          >
            GİRİŞ
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
          className="flex h-9 w-9 items-center justify-center border border-border text-ink lg:hidden"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M3 6h18M3 12h18M3 18h18" />}
          </svg>
        </button>
      </div>

      {/* Mobil açılır menü */}
      {open && (
        <div className="theme-band border-t border-border bg-[#0c192c] lg:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col px-6 py-3">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="border-b border-border py-3.5 font-display text-[14px] tracking-[0.08em] text-ink-muted transition-colors hover:text-ink"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-2.5">
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
