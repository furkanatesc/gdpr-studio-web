"use client";

import { PageHeader } from "@/components/app/page-header";
import { SectorSection } from "@/components/app/sector-section";
import { TeamSection } from "@/components/app/team-section";
import { useWorkspaceInfo } from "@/components/app/use-workspace-info";
import { useAuth } from "@/lib/auth-context";
import { PLAN_LABEL } from "@/lib/pricing";

/*
  Faz A iskeleti (sözleşme §2.4): kurum profili (bootstrap verisi) + hesap bilgisi.
  Tam kurum profili düzenleme sihirbazı ROADMAP'te ayrı kalem — burada yalnız
  gerçek API'den gelen veriler gösterilir, sahte alan uydurulmaz.
*/
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-t border-border py-3.5 first:border-t-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
        {label}
      </span>
      <span className="text-[13.5px] text-ink">{value}</span>
    </div>
  );
}

export default function AyarlarPage() {
  const { identity, billing } = useWorkspaceInfo();
  const { session } = useAuth();

  return (
    <div>
      <PageHeader eyebrow="Hesap / Ayarlar" title="Ayarlar" />

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <section className="border border-border bg-surface p-6">
          <h2 className="font-display text-[17px] text-ink">Kurum profili</h2>
          {identity ? (
            <div className="mt-4">
              <InfoRow label="Kurum adı" value={identity.orgName} />
              <InfoRow label="Rolünüz" value={identity.role} />
              {billing && (
                <InfoRow
                  label="Plan"
                  value={PLAN_LABEL[billing.plan as keyof typeof PLAN_LABEL] ?? billing.plan}
                />
              )}
              <SectorSection sector={identity?.sector} isAdmin={identity?.role === "yonetici"} />
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
              Kurum bilgileri giriş yapıldığında ve API bağlıyken görüntülenir.
            </p>
          )}
          <p className="mt-5 border-t border-border pt-4 font-medium text-[10px] uppercase tracking-[0.06em] text-ink-subtle">
            Kurum profili düzenleme yakında
          </p>
        </section>

        <section className="border border-border bg-surface p-6">
          <h2 className="font-display text-[17px] text-ink">Hesap</h2>
          {session ? (
            <div className="mt-4">
              <InfoRow label="E-posta" value={session.user?.email ?? "—"} />
            </div>
          ) : (
            <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
              Hesap bilgileri giriş yapıldığında görüntülenir.
            </p>
          )}
        </section>

        <TeamSection selfRole={identity?.role} />
      </div>
    </div>
  );
}
