"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "warning" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

const ToastContext = createContext<(message: string, variant?: ToastVariant) => void>(
  () => {},
);

/** Geçici teyit bildirimi göster. Kalıcı durumlar (hata/kota) inline kutu kullanır. */
export function useToast() {
  return useContext(ToastContext);
}

const VARIANT: Record<ToastVariant, { icon: IconName; accent: string }> = {
  success: { icon: "check-circle", accent: "border-l-[color:var(--ok)] text-[color:var(--ok)]" },
  warning: { icon: "warning", accent: "border-l-warning text-warning" },
  error: { icon: "shield-alert", accent: "border-l-danger text-danger" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    // önce çıkış animasyonu, 200ms sonra kaldır
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 200);
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message, variant, leaving: false }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2 pb-safe"
      >
        {toasts.map((t) => {
          const v = VARIANT[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center gap-2.5 rounded-[var(--radius)] border border-border border-l-2 bg-surface px-4 py-3 text-[13px] shadow-[var(--shadow-card-lift)]",
                v.accent,
                t.leaving ? "animate-toast-out" : "animate-toast-in",
              )}
            >
              <Icon name={v.icon} className="flex-shrink-0 text-[15px]" />
              <span className="text-ink">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Bildirimi kapat"
                className="ml-2 text-ink-subtle transition-colors hover:text-ink"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
