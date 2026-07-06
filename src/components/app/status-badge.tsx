import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/*
  Durum grameri (sözleşme §3) — tek renk sözlüğü, iki görünüm:
  - badge: soft zemin + nokta + etiket (belge/kayıt durumu)
  - dot:   satır içi nokta + mono etiket (liste satırları)
  Tamamlandı=ok · Bekliyor/Devam=warning · Gecikmiş/İhlal=danger · Taslak=neutral
*/
export type StatusTone = "ok" | "warning" | "danger" | "neutral";

const TONES: Record<StatusTone, { text: string; bg: string; dot: string }> = {
  ok: { text: "text-ok", bg: "bg-ok-soft", dot: "bg-ok" },
  warning: { text: "text-warning", bg: "bg-warning-soft", dot: "bg-warning" },
  danger: { text: "text-danger", bg: "bg-danger-soft", dot: "bg-danger" },
  neutral: { text: "text-ink-muted", bg: "bg-surface-2", dot: "bg-ink-subtle" },
};

export function StatusBadge({
  tone,
  variant = "badge",
  className,
  children,
}: {
  tone: StatusTone;
  variant?: "badge" | "dot";
  className?: string;
  children: ReactNode;
}) {
  const t = TONES[tone];
  if (variant === "dot") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 font-medium text-[10px] uppercase tracking-[0.08em]",
          t.text,
          className,
        )}
      >
        <span aria-hidden className={cn("h-1.5 w-1.5", t.dot)} />
        {children}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 font-medium text-[10px] uppercase tracking-[0.08em]",
        t.bg,
        t.text,
        className,
      )}
    >
      <span aria-hidden className={cn("h-1.5 w-1.5", t.dot)} />
      {children}
    </span>
  );
}
