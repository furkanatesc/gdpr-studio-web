"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button, buttonClasses } from "@/components/ui/button";

/*
  Onay dialog'u — native window.confirm() yerine tasarım sistemine uygun, erişilebilir
  modal (UX P4-5). Promise tabanlı: imperatif akışı korur, çağrı yeri
  `if (!(await confirm({...}))) return;` biçiminde native confirm ile aynı okunur.

  Kullanım:
    const { confirm, dialog } = useConfirm();
    ...
    if (!(await confirm({ title, message, danger: true }))) return;
    ...
    return (<> ...{dialog}</>);
*/

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Yıkıcı eylem (silme/çıkarma) → onay butonu danger tonunda. */
  danger?: boolean;
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (ok: boolean) => void;
}

export function useConfirm() {
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setPending({ ...opts, resolve });
    });
  }, []);

  const settle = useCallback(
    (ok: boolean) => {
      setPending((p) => {
        p?.resolve(ok);
        return null;
      });
    },
    [],
  );

  const dialog = pending ? (
    <ConfirmDialog options={pending} onCancel={() => settle(false)} onConfirm={() => settle(true)} />
  ) : null;

  return { confirm, dialog };
}

function ConfirmDialog({
  options,
  onCancel,
  onConfirm,
}: {
  options: ConfirmOptions;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  // Açılışta onay butonuna odaklan + Escape ile iptal + body scroll kilidi.
  useEffect(() => {
    confirmRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [onCancel]);

  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0c192c]/45 p-4 animate-toast-in"
      onMouseDown={(e) => {
        // Yalnız overlay'e (karta değil) tıklama iptal eder.
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="w-full max-w-md border border-border bg-surface p-6 shadow-[var(--shadow-card-lift)]"
      >
        <h2 id="confirm-title" className="font-display text-lg text-ink">
          {options.title}
        </h2>
        <p id="confirm-message" className="mt-2 text-[14px] leading-relaxed text-ink-muted">
          {options.message}
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            {options.cancelLabel ?? "Vazgeç"}
          </Button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            className={buttonClasses(
              "primary",
              "sm",
              options.danger ? "bg-danger text-white hover:bg-danger hover:brightness-110" : undefined,
            )}
          >
            {options.confirmLabel ?? "Onayla"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
