import { cn } from "@/lib/utils";

/**
 * Seçilebilir pill etiket (on/off). Durum üst bileşende tutulur.
 * sensitive: KVKK m.6 özel nitelikli kategori — altın nokta + seçilince warning stili.
 */
export function Tag({
  label,
  on,
  onToggle,
  sensitive = false,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  sensitive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        " border px-3.5 py-1.5 text-[13px] transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96]",
        on
          ? sensitive
            ? "border-warning bg-warning-soft font-medium text-warning"
            : "border-accent bg-accent font-medium text-accent-contrast"
          : "border-border text-ink-muted hover:border-border-strong hover:text-ink",
      )}
    >
      {sensitive && (
        <span
          aria-hidden
          className="mr-1.5 inline-block h-1.5 w-1.5 bg-warning align-middle"
        />
      )}
      {label}
    </button>
  );
}
