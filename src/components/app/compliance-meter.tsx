"use client";

import Link from "next/link";
import { useComplianceChecklist } from "./use-compliance-checklist";

/*
  Sidebar uyum skoru bloğu (Faz B, T10) — UsageMeter deseniyle birebir: mono başlık +
  yüzde + accent çubuk. Skor `/api/compliance/checklist`'ten (sunucu hesaplı, spec §3
  formülü) gelir; boş/seed'siz set ya da payda=0 durumunda `score` null → hiç
  render edilmez (uydurulmuş sayı yok). Tıklanınca /app/kontrol'e gider.
*/
export function ComplianceMeter() {
  const { checklist } = useComplianceChecklist();
  if (!checklist || checklist.score === null) return null;
  const pct = Math.round(checklist.score * 100);

  return (
    <Link
      href="/app/kontrol"
      className="block border-t border-border px-6 py-4 transition-colors hover:bg-white/[0.03]"
    >
      <p className="font-medium text-[9.5px] uppercase tracking-[0.14em] text-ink-subtle">
        Uyum skoru
      </p>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[13px] font-medium text-ink">Kontrol listesi</span>
        <span className="font-medium text-[10px] text-ink-subtle">%{pct}</span>
      </div>
      <div className="mt-2 h-[5px] overflow-hidden bg-white/[0.08]">
        <div className="h-full bg-accent" style={{ width: `${pct}%` }} />
      </div>
    </Link>
  );
}
