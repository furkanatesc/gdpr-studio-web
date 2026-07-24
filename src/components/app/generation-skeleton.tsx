"use client";

import { Icon } from "@/components/ui/icon";

/** Üretim beklerken iskelet çıktı kartı — ilk stream delta'sı gelince yerini gerçek içerik alır. */
export function GenerationSkeleton({
  label = "Claude dokümanı envanter kayıtlarına göre hazırlıyor…",
}: {
  label?: string;
}) {
  return (
    <div className=" border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
        <Icon name="spinner" className="animate-spin text-[15px]" /> {label}
      </div>
      <div aria-hidden className="mt-5 space-y-3">
        <div className="h-4 w-2/5 animate-pulse bg-surface-2" />
        <div className="h-3 w-full animate-pulse bg-surface-2" />
        <div className="h-3 w-11/12 animate-pulse bg-surface-2" />
        <div className="h-3 w-4/5 animate-pulse bg-surface-2" />
      </div>
    </div>
  );
}
