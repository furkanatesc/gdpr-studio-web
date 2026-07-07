"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createCheckout, createPortal, usingRealApi } from "@/lib/api";
import { PLAN_LABEL, PLAN_PRICE } from "@/lib/pricing";
import { PageHeader } from "@/components/app/page-header";
import { StatusBadge } from "@/components/app/status-badge";
import { refreshWorkspaceInfo, useWorkspaceInfo } from "@/components/app/use-workspace-info";
import { cn } from "@/lib/utils";

/*
  Plan & Faturalama — sözleşme §2.1 başlık grameri + §3 durum sözlüğü (StatusBadge).
  Kabuk konteyneri app-shell'den gelir; sayfa kendi max-width sarmalayıcısını kullanmaz.
  Veri kaynağı = useWorkspaceInfo cache'i (sidebar/topbar ile AYNI istek — duplicate yok);
  checkout dönüşünde cache tazelenir ki yeni plan/kota anında yansısın.
*/
export function FaturalamaClient() {
  const params = useSearchParams();
  const { billing: status, ready } = useWorkspaceInfo();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [interval, setIntervalState] = useState<"month" | "year">("year");

  const billingResult = params.get("billing");
  useEffect(() => {
    if (billingResult === "success") refreshWorkspaceInfo();
  }, [billingResult]);

  async function upgrade(plan: string) {
    setBusy(true);
    setError(null);
    try {
      const { url } = await createCheckout(plan, interval);
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  async function manage() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await createPortal();
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  const header = <PageHeader eyebrow="Hesap / Faturalama" title="Plan & Faturalama" />;

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Faturalama gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
        </p>
      </div>
    );
  if (!ready)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">Yükleniyor…</p>
      </div>
    );
  // Cache yüklendi ama billing gelmedi → ilk yükleme hatası.
  if (!status)
    return (
      <div>
        {header}
        <div className="mt-6 border border-danger/40 bg-danger-soft px-5 py-4 text-sm text-danger">
          Faturalama durumu alınamadı. Sayfayı yenileyip tekrar deneyin.
        </div>
      </div>
    );
  if (!status.canManage)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Faturalandırmayı yalnızca kurum yöneticisi yönetebilir.
        </p>
      </div>
    );

  const isPaid = status.plan !== "baslangic";
  const active = status.status === "active";
  const banner =
    params.get("billing") === "success"
      ? "Ödeme alındı, planınız güncelleniyor."
      : params.get("billing") === "cancel"
        ? "Ödeme iptal edildi."
        : null;

  return (
    <div>
      <PageHeader
        eyebrow="Hesap / Faturalama"
        title="Plan & Faturalama"
        action={
          <StatusBadge tone={active ? "ok" : "warning"}>
            {active ? "Abonelik aktif" : status.status}
          </StatusBadge>
        }
      />

      {banner && (
        <p className="mt-6 border border-border bg-surface px-4 py-2.5 text-[13px] text-ink">
          {banner}
        </p>
      )}

      {/* Inline action error — shown without unmounting the page so users can retry. */}
      {error && (
        <div className="mt-6 border border-danger/40 bg-danger-soft px-5 py-4 text-sm text-danger">
          {error}
        </div>
      )}

      {/* Mevcut plan kartı */}
      <div className="mt-7 border border-border bg-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-medium text-[10px] uppercase tracking-[0.12em] text-ink-subtle">
              Mevcut plan
            </p>
            <p className="mt-1 font-display text-2xl font-light text-ink">
              {PLAN_LABEL[status.plan] ?? status.plan}
            </p>
          </div>
          {isPaid && (
            <button
              onClick={manage}
              disabled={busy}
              className="border border-border-strong px-4 py-2 text-[13px] text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
            >
              Planı yönet
            </button>
          )}
        </div>
        {status.usage.quota !== null && (
          <div className="mt-5 border-t border-border pt-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] text-ink-muted">
                Bu ay:{" "}
                <span className="font-medium text-ink">
                  {status.usage.used}/{status.usage.quota}
                </span>{" "}
                doküman
              </p>
              <span className="font-medium text-[10px] text-ink-subtle">
                %{Math.min(100, Math.round((status.usage.used / status.usage.quota) * 100))}
              </span>
            </div>
            <div className="mt-2 h-[5px] w-full overflow-hidden bg-surface-2">
              <div
                className="h-full bg-accent"
                style={{
                  width: `${Math.min(100, (status.usage.used / status.usage.quota!) * 100)}%`,
                }}
              />
            </div>
          </div>
        )}
      </div>

      {!isPaid && (
        <>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[18px] text-ink">Planı yükselt</h2>
            <div className="flex items-center gap-1 border border-border-strong p-1">
              {(
                [
                  ["month", "Aylık"],
                  ["year", "Yıllık — 2 ay bedava"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setIntervalState(key)}
                  aria-pressed={interval === key}
                  className={cn(
                    "px-3.5 py-1.5 text-[12px] font-medium transition-colors",
                    interval === key
                      ? "bg-accent text-accent-contrast"
                      : "text-ink-muted hover:text-ink",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(["standart", "premium"] as const).map((plan) => (
              <div key={plan} className="border border-border bg-surface p-6">
                <p className="font-display text-lg text-ink">{PLAN_LABEL[plan]}</p>
                <p className="mt-2 font-display text-3xl font-light text-ink">
                  {PLAN_PRICE[plan][interval]}
                </p>
                <p className="mt-1 font-medium text-[10px] uppercase tracking-[0.08em] text-ink-subtle">
                  KDV hariç
                </p>
                <button
                  onClick={() => upgrade(plan)}
                  disabled={busy}
                  className="mt-5 w-full bg-accent px-4 py-2.5 text-[13px] font-medium text-accent-contrast transition-colors hover:bg-accent-strong disabled:opacity-50"
                >
                  {PLAN_LABEL[plan]}&apos;a geç
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
