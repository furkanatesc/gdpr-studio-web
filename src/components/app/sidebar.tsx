"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DOC_CATALOG } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { usingAuth } from "@/lib/supabase";

function NavItem({
  href,
  dot,
  label,
  active,
  onNavigate,
}: {
  href: string;
  dot: string;
  label: string;
  active: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "mx-2 my-1 flex items-center gap-3 rounded-[var(--radius)] px-3 py-2.5 text-[13px] transition-colors",
        active
          ? "bg-accent-soft font-medium text-accent-strong"
          : "text-ink-muted hover:bg-surface-2",
      )}
    >
      <span
        className={cn(
          "flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
          active ? "bg-accent text-accent-contrast" : "bg-surface-2 text-ink-subtle",
        )}
      >
        {dot}
      </span>
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-4 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
      {children}
    </p>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();
  const router = useRouter();
  const { session, signOut } = useAuth();

  return (
    <aside className="flex h-screen w-[264px] flex-shrink-0 flex-col border-r border-border bg-surface">
      <Link href="/" onClick={onNavigate} className="block px-5 pb-4 pt-6">
        <div className="font-display text-[19px] leading-tight text-ink">
          KVKK <span className="text-accent-strong">Yönetim</span>
        </div>
        <div className="mt-0.5 text-[11px] tracking-wide text-ink-subtle">
          KVKK & GDPR Doküman Asistanı
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto pb-4">
        <SectionLabel>Sayfa</SectionLabel>
        <NavItem href="/app" dot="⌂" label="Başlangıç" active={path === "/app"} onNavigate={onNavigate} />

        <SectionLabel>Doküman Üret</SectionLabel>
        {DOC_CATALOG.map((d) => (
          <NavItem
            key={d.type}
            href={`/app/${d.type}`}
            dot={d.no}
            label={d.title}
            active={path === `/app/${d.type}`}
            onNavigate={onNavigate}
          />
        ))}

        <SectionLabel>Araçlar</SectionLabel>
        <NavItem href="/app/envanter" dot="❖" label="Envanter Yönetimi" active={path === "/app/envanter"} onNavigate={onNavigate} />
        <NavItem href="/app/kontrol" dot="✓" label="Uyum Kontrol Listesi" active={path === "/app/kontrol"} onNavigate={onNavigate} />

        <SectionLabel>Hesap</SectionLabel>
        <NavItem href="/app/faturalama" dot="₺" label="Plan & Faturalama" active={path === "/app/faturalama"} onNavigate={onNavigate} />
      </nav>

      <div className="px-5 py-4 text-[11px] text-ink-subtle">
        {usingAuth && session && (
          <button
            onClick={async () => { await signOut(); onNavigate?.(); router.push("/login"); }}
            className="mb-2 w-full rounded-[var(--radius)] px-3 py-1.5 text-left text-ink-muted transition-colors hover:bg-surface-2 hover:text-ink"
          >
            Çıkış yap
          </button>
        )}
        Web sürümü · Managed mod
      </div>
    </aside>
  );
}
