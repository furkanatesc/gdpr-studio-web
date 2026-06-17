"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DOC_CATALOG } from "@/lib/catalog";
import { cn } from "@/lib/utils";

function NavItem({
  href,
  dot,
  label,
  active,
}: {
  href: string;
  dot: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "mx-2 flex items-center gap-3 rounded-[var(--radius)] border border-transparent px-3 py-2 text-[13px] transition-colors",
        active
          ? "border-accent-soft bg-accent-soft font-medium text-accent-strong"
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

export function Sidebar() {
  const path = usePathname();

  return (
    <aside className="flex h-screen w-[264px] flex-shrink-0 flex-col border-r border-border bg-surface">
      <Link href="/" className="block border-b border-border px-5 py-6">
        <div className="font-display text-[19px] leading-tight text-ink">
          GDPR<span className="text-accent-strong">.Studio</span>
        </div>
        <div className="mt-0.5 text-[11px] tracking-wide text-ink-subtle">
          KVKK & GDPR Doküman Asistanı
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto pb-4">
        <SectionLabel>Sayfa</SectionLabel>
        <NavItem href="/app" dot="⌂" label="Başlangıç" active={path === "/app"} />

        <SectionLabel>Doküman Üret</SectionLabel>
        {DOC_CATALOG.map((d) => (
          <NavItem
            key={d.type}
            href={`/app/${d.type}`}
            dot={d.no}
            label={d.title}
            active={path === `/app/${d.type}`}
          />
        ))}

        <SectionLabel>Araçlar</SectionLabel>
        <NavItem href="/app/envanter" dot="❖" label="Envanter Yönetimi" active={path === "/app/envanter"} />
        <NavItem href="/app/kontrol" dot="✓" label="Uyum Kontrol Listesi" active={path === "/app/kontrol"} />
      </nav>

      <div className="border-t border-border px-4 py-3 text-[11px] text-ink-subtle">
        Web sürümü · Managed mod
      </div>
    </aside>
  );
}
