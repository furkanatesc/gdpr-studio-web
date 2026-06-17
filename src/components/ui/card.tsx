import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  title,
  icon,
  children,
  className,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[calc(var(--radius)+4px)] border border-border bg-surface shadow-[var(--shadow-card)]",
        className,
      )}
    >
      {title && (
        <header className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          {icon && <span className="text-accent-strong">{icon}</span>}
          <h2 className="font-display text-[15px] font-semibold text-ink">{title}</h2>
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}
