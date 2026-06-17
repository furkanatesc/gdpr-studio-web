import type { ReactNode } from "react";

export function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[13px] font-medium text-ink-muted">
        {label}
        {required && <span className="text-accent-strong"> *</span>}
      </span>
      {children}
    </label>
  );
}
