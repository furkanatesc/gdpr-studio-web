import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Card({
  title,
  icon,
  children,
  className,
  interactive = false,
}: {
  title?: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  interactive?: boolean;
}) {
  return (
    <section
      className={cn(
        " border border-border bg-surface shadow-[var(--shadow-card)]",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]",
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
