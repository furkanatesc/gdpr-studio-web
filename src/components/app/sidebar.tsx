"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { DOC_CATALOG } from "@/lib/catalog";
import { PLAN_LABEL } from "@/lib/pricing";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import { usingAuth } from "@/lib/supabase";
import { useWorkspaceInfo } from "./use-workspace-info";
import { ComplianceMeter } from "./compliance-meter";

/*
  Sidebar (sözleşme §2.3, 2026-07-06 revizyonu): koyu lacivert bant (theme-band),
  numarasız yalın nav; seçili durum sade — soft zemin + beyaz metin, süs yok.
  Kullanım göstergesi yalnız gerçek API verisiyle; alt bilgi = kurum adı + plan rozeti.
*/
function NavItem({
  href,
  label,
  active,
  soon,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  soon?: boolean;
  onNavigate?: () => void;
}) {
  // "Yakında" öğesi tıklanabilir link değildir — sessiz 404 kalmaz (sözleşme §2.3).
  if (soon) {
    return (
      <div className="mx-3 flex cursor-default items-center gap-2.5 px-3 py-2 text-[13px] text-ink-subtle">
        {label}
        <span className=" bg-surface-2 px-1.5 py-0.5 font-medium text-[8px] uppercase tracking-[0.08em] text-ink-subtle">
          Yakında
        </span>
      </div>
    );
  }
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "mx-3 flex items-center px-3 py-2 text-[13px] transition-colors",
        active
          ? "bg-white/[0.07] font-medium text-ink"
          : "text-ink-muted hover:bg-white/[0.04] hover:text-ink",
      )}
    >
      {label}
    </Link>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="px-6 pb-1.5 pt-5 font-medium text-[9.5px] uppercase tracking-[0.14em] text-ink-subtle">
      {children}
    </p>
  );
}

function UsageMeter() {
  const { billing } = useWorkspaceInfo();
  if (!billing || billing.usage.quota === null) return null;
  const used = billing.usage.used;
  const quota = billing.usage.quota;
  const pct = Math.min(100, Math.round((used / quota) * 100));
  return (
    <div className="border-t border-border px-6 py-4">
      <p className="font-medium text-[9.5px] uppercase tracking-[0.14em] text-ink-subtle">
        Bu ay üretim
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">
          {used}/{quota} belge
        </span>
        <span className="font-medium text-[10px] text-ink-subtle">%{pct}</span>
      </div>
      <div className="mt-2 h-[5px] overflow-hidden bg-white/[0.08]">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function OrgFooter({ onNavigate }: { onNavigate?: () => void }) {
  const { identity, billing } = useWorkspaceInfo();
  const { session, signOut } = useAuth();
  const router = useRouter();

  return (
    <div className="border-t border-border px-6 py-4">
      {usingAuth && session && (
        <button
          onClick={async () => {
            await signOut();
            onNavigate?.();
            router.push("/login");
          }}
          className="mb-3 w-full px-0 text-left text-[12px] text-ink-muted transition-colors hover:text-ink md:hidden"
        >
          Çıkış yap
        </button>
      )}
      {identity ? (
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-[12px] font-medium text-ink-muted">{identity.orgName}</span>
          {billing && (
            <span className="font-medium text-[9px] uppercase tracking-[0.08em] text-accent">
              {PLAN_LABEL[billing.plan as keyof typeof PLAN_LABEL] ?? billing.plan}
            </span>
          )}
        </div>
      ) : (
        <span className="text-[11px] text-ink-subtle">Web sürümü · Managed mod</span>
      )}
    </div>
  );
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const path = usePathname();

  return (
    // Kabuk koyusu: lacivertin derin tonu #0C192C (bantlar #123055) — iki ton kuralı
    <aside className="theme-band flex h-full w-[264px] flex-shrink-0 flex-col bg-[#0c192c] text-ink">
      <Link href="/" onClick={onNavigate} className="block px-6 pb-4 pt-6">
        <div className="font-display text-[19px] leading-tight text-ink">
          KVKK <span className="text-accent-strong">Yönetim</span>
        </div>
        <div className="mt-1 font-medium text-[9px] uppercase tracking-[0.08em] text-ink-subtle">
          KVKK & GDPR Doküman Asistanı
        </div>
      </Link>

      <nav className="flex-1 overflow-y-auto pb-4">
        <SectionLabel>Sayfa</SectionLabel>
        <NavItem href="/app" label="Başlangıç" active={path === "/app"} onNavigate={onNavigate} />

        <SectionLabel>Doküman Üret</SectionLabel>
        {DOC_CATALOG.map((d) => (
          <NavItem
            key={d.type}
            href={`/app/${d.type}`}
            label={d.title}
            active={path === `/app/${d.type}`}
            onNavigate={onNavigate}
          />
        ))}

        <SectionLabel>Araçlar</SectionLabel>
        <NavItem
          href="/app/envanter"
          label="Envanter Yönetimi"
          active={path === "/app/envanter"}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/kontrol"
          label="Uyum Kontrol Listesi"
          active={path === "/app/kontrol"}
          onNavigate={onNavigate}
        />

        <SectionLabel>Hesap</SectionLabel>
        <NavItem
          href="/app/ayarlar"
          label="Ayarlar"
          active={path === "/app/ayarlar"}
          onNavigate={onNavigate}
        />
        <NavItem
          href="/app/faturalama"
          label="Plan & Faturalama"
          active={path === "/app/faturalama"}
          onNavigate={onNavigate}
        />
      </nav>

      <UsageMeter />
      <ComplianceMeter />
      <OrgFooter onNavigate={onNavigate} />
    </aside>
  );
}
