"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { type BillingStatus, createCheckout, createPortal, getBillingStatus } from "@/lib/api";

const PLAN_LABEL: Record<string, string> = {
  baslangic: "Başlangıç",
  standart: "Standart",
  premium: "Premium",
};
const PRICE: Record<string, { month: string; year: string }> = {
  standart: { month: "₺2.600/ay", year: "₺26.000/yıl" },
  premium: { month: "₺5.000/ay", year: "₺50.000/yıl" },
};

export function FaturalamaClient() {
  const params = useSearchParams();
  const [status, setStatus] = useState<BillingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [interval, setIntervalState] = useState<"month" | "year">("year");

  useEffect(() => {
    getBillingStatus().then(setStatus).catch((e) => setError(e.message));
  }, []);

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

  if (error) return <p className="p-8 text-[14px] text-red-600">{error}</p>;
  if (!status) return <p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>;
  if (!status.canManage)
    return (
      <p className="p-8 text-[14px] text-ink-muted">
        Faturalandırmayı yalnızca kurum yöneticisi yönetebilir.
      </p>
    );

  const isPaid = status.plan !== "baslangic";
  const banner =
    params.get("billing") === "success"
      ? "Ödeme alındı, planınız güncelleniyor."
      : params.get("billing") === "cancel"
        ? "Ödeme iptal edildi."
        : null;

  return (
    <div className="mx-auto max-w-3xl p-8">
      <h1 className="font-display text-2xl text-ink">Plan & Faturalama</h1>
      {banner && <p className="mt-3 rounded-[var(--radius)] bg-accent-soft px-4 py-2 text-[13px] text-accent-strong">{banner}</p>}

      <div className="mt-6 rounded-[var(--radius)] border border-border bg-surface p-6">
        <p className="text-[13px] text-ink-subtle">Mevcut plan</p>
        <p className="font-display text-xl text-ink">{PLAN_LABEL[status.plan]}</p>
        {status.usage.quota !== null && (
          <div className="mt-4">
            <p className="text-[13px] text-ink-muted">
              Bu ay: {status.usage.used}/{status.usage.quota} doküman
            </p>
            <div className="mt-1 h-2 w-full overflow-hidden rounded-pill bg-surface-2">
              <div
                className="h-full bg-accent"
                style={{ width: `${Math.min(100, (status.usage.used / status.usage.quota!) * 100)}%` }}
              />
            </div>
          </div>
        )}
        {isPaid && (
          <button onClick={manage} disabled={busy} className="mt-4 rounded-[var(--radius)] border border-border px-4 py-2 text-[13px] hover:bg-surface-2 disabled:opacity-50">
            Planı yönet
          </button>
        )}
      </div>

      {!isPaid && (
        <>
          <div className="mt-6 flex items-center gap-3">
            <button onClick={() => setIntervalState("month")} className={`rounded-pill px-4 py-1.5 text-[13px] ${interval === "month" ? "bg-accent text-accent-contrast" : "text-ink-muted"}`}>Aylık</button>
            <button onClick={() => setIntervalState("year")} className={`rounded-pill px-4 py-1.5 text-[13px] ${interval === "year" ? "bg-accent text-accent-contrast" : "text-ink-muted"}`}>Yıllık (2 ay bedava)</button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {(["standart", "premium"] as const).map((plan) => (
              <div key={plan} className="rounded-[var(--radius)] border border-border bg-surface p-6">
                <p className="font-display text-lg text-ink">{PLAN_LABEL[plan]}</p>
                <p className="mt-1 font-display text-2xl text-ink">{PRICE[plan][interval]}</p>
                <p className="text-[12px] text-ink-subtle">KDV hariç</p>
                <button onClick={() => upgrade(plan)} disabled={busy} className="mt-4 w-full rounded-[var(--radius)] bg-accent px-4 py-2 text-[13px] text-accent-contrast hover:bg-accent-strong disabled:opacity-50">
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
