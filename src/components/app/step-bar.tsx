"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Wizard adım barı. Tamamlanan adım altın dolgu + check + yumuşak parıltı;
 * aktif adım soft vurgu; ulaşılmamış adımlar pasif. Tamamlanmışlara geri tıklanır.
 * docColor: doküman tipi kimlik rengi (CSS değeri, ör. "var(--doc-aydinlatma)").
 */
export function StepBar({
  steps,
  current,
  reachable: reachableProp,
  docColor,
  onSelect,
  locked = false,
}: {
  steps: { title: string }[];
  current: number;
  reachable: boolean[];
  docColor: string;
  onSelect: (i: number) => void;
  locked?: boolean;
}) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Adımlar">
      <span
        aria-hidden
        className="h-2 w-2 flex-shrink-0"
        style={{ backgroundColor: docColor }}
      />
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = reachableProp[i];
        return (
          <li key={s.title} className="flex min-w-0 items-center gap-2">
            {i > 0 && <span aria-hidden className="hairline-dotted w-5 flex-shrink-0 sm:w-9" />}
            <button
              type="button"
              disabled={!reachable || active || locked}
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 border px-3 py-1.5 text-[13px] transition-[color,background-color,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none",
                done && "border-accent bg-accent text-accent-contrast",
                active && "border-accent bg-surface font-medium text-accent",
                !done &&
                  !active &&
                  (reachable
                    ? "border-border text-ink-muted hover:border-border-strong hover:text-ink"
                    : "border-border text-ink-subtle opacity-60"),
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center text-[11px]",
                  done
                    ? "bg-accent-contrast/20"
                    : active
                      ? "bg-accent text-accent-contrast"
                      : "bg-surface-2 text-ink-subtle",
                )}
              >
                {done ? <Icon name="check" className="text-[11px]" /> : i + 1}
              </span>
              <span className={cn("truncate", !active && "hidden sm:inline")}>{s.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
