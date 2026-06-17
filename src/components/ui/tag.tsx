import { cn } from "@/lib/utils";

/** Seçilebilir pill etiket (on/off). Durum üst bileşende tutulur. */
export function Tag({
  label,
  on,
  onToggle,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 text-[13px] transition-colors",
        on
          ? "border-accent bg-accent-soft text-accent-strong font-medium"
          : "border-border text-ink-muted hover:border-border-strong hover:text-ink",
      )}
    >
      {label}
    </button>
  );
}
