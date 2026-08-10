"use client";

import { Icon } from "@/components/ui/icon";

/* Üretim hatası bloğu — tüm üretim akışlarında ortak (P2-2 + P4-4). onRetry verilirse
   "Tekrar dene" gösterir (aynı üretimi yeniden başlatır). */
export function GenerationError({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border border-danger/40 border-l-2 border-l-danger bg-danger-soft px-5 py-4 text-sm text-danger">
      <span className="flex items-start gap-2.5">
        <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[16px]" />
        <span>
          <strong className="font-medium">Üretim başarısız.</strong> {message}
        </span>
      </span>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 self-center whitespace-nowrap text-[12px] font-medium text-danger underline-offset-2 transition-colors hover:underline"
        >
          Tekrar dene
        </button>
      )}
    </div>
  );
}
