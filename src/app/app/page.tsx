"use client";

import Link from "next/link";
import { DOC_CATALOG } from "@/lib/catalog";
import { PLAN_LABEL } from "@/lib/pricing";
import { PageHeader } from "@/components/app/page-header";
import { ScoreRing } from "@/components/app/score-ring";
import { useComplianceChecklist } from "@/components/app/use-compliance-checklist";
import { useWorkspaceInfo } from "@/components/app/use-workspace-info";

/*
  Dashboard (sözleşme §4): PageHeader grameri + stat şeridi (yalnız GERÇEK veriyle —
  mock modda şerit gizlenir, sahte rakam gösterilmez) + doküman kataloğu + hızlı işlemler.
*/
function todayEyebrow(): string {
  const t = new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "long", year: "numeric" })
    .format(new Date());
  return `Kontrol Paneli / ${t}`;
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="border border-border bg-surface px-6 py-5">
      <p className="font-medium text-[9.5px] uppercase tracking-[0.12em] text-ink-subtle">{label}</p>
      <p className="mt-1.5 font-display text-3xl font-light text-ink">{value}</p>
      <p className="mt-1 font-medium text-[10px] uppercase tracking-[0.04em] text-ink-subtle">{sub}</p>
    </div>
  );
}

export default function Dashboard() {
  const { billing } = useWorkspaceInfo();
  const { checklist } = useComplianceChecklist();

  return (
    <div>
      <PageHeader eyebrow={todayEyebrow()} title="Hoş geldiniz — bugün ne üretelim?" />

      {/* Stat şeridi — yalnız gerçek API verisi varsa (uydurmama ilkesi UI'da da geçerli) */}
      {billing && (
        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Bu ay üretilen"
            value={String(billing.usage.used)}
            sub={
              billing.usage.quota !== null
                ? `/ ${billing.usage.quota} belge — plan limiti`
                : "sınırsız üretim"
            }
          />
          <StatCard
            label="Plan"
            value={PLAN_LABEL[billing.plan as keyof typeof PLAN_LABEL] ?? billing.plan}
            sub={billing.status === "active" ? "abonelik aktif" : billing.status}
          />
        </div>
      )}

      {/* Uyum skoru halkası — /app/kontrol'e gider (Faz B); score null → "—" (uydurulmuş sayı yok) */}
      <div className="mt-4 flex items-center gap-5 border border-border bg-surface px-6 py-5">
        <ScoreRing score={checklist?.score ?? null} />
        <div>
          <p className="font-medium text-[9.5px] uppercase tracking-[0.12em] text-ink-subtle">
            Uyum skoru
          </p>
          <p className="mt-1 font-display text-xl text-ink">Kontrol listesi</p>
          <p className="mt-1 text-[12.5px] text-ink-muted">KVKK/GDPR yükümlülük durumunuz</p>
        </div>
      </div>

      {/* Katalog başlığı + hızlı işlemler */}
      <div className="mt-9 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-[18px] text-ink">Doküman kataloğu</h2>
        <div className="flex items-center gap-5">
          <Link
            href="/app/muvekkiller"
            className="font-medium text-[10.5px] uppercase tracking-[0.08em] text-ink underline underline-offset-4 decoration-[1px] transition-colors hover:text-accent"
          >
            Envanter ↗
          </Link>
          <Link
            href="/app/faturalama"
            className="font-medium text-[10.5px] uppercase tracking-[0.08em] text-ink underline underline-offset-4 decoration-[1px] transition-colors hover:text-accent"
          >
            Faturalama ↗
          </Link>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DOC_CATALOG.map((d) => (
          <Link
            key={d.type}
            href={`/app/${d.type}`}
            className="group border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center bg-surface-2 font-medium text-xs text-ink-muted transition-colors group-hover:bg-accent group-hover:text-accent-contrast">
                {d.no}
              </span>
              <h3 className="font-display text-[15px] font-semibold text-ink">{d.title}</h3>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{d.desc}</p>
            <div className="mt-3.5 flex items-center justify-between border-t border-border pt-3">
              <span className="inline-flex items-center gap-1.5 font-medium text-[10.5px] text-ink-muted">
                <span
                  aria-hidden
                  className="h-1.5 w-1.5"
                  style={{ backgroundColor: `var(--doc-${d.type})` }}
                />
                {d.mevzuat}
              </span>
              <span className="font-medium text-[10px] uppercase tracking-[0.08em] text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Üret →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
