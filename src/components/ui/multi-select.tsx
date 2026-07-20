"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Çoklu-seçim combobox. Kapalıyken seçili öğeler listenin en üstünde durur;
 * sıra yalnız açılış anında (openMenu) hesaplanır — açıkken seçim yapıldıkça liste zıplamaz.
 */
export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Seçin…",
  ariaLabel,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [ordered, setOrdered] = useState<string[]>(options);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function openMenu() {
    const sel = options.filter((o) => value.includes(o));
    const rest = options.filter((o) => !value.includes(o));
    setOrdered([...sel, ...rest]);
    setActiveIndex(0);
    setOpen(true);
  }

  function closeMenu(focusTrigger = true) {
    setOpen(false);
    if (focusTrigger) triggerRef.current?.focus();
  }

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [open, activeIndex]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) closeMenu(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  function toggle(o: string) {
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeMenu();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, ordered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(ordered.length - 1);
    } else if (e.key === "Tab") {
      closeMenu(false);
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeMenu() : openMenu())}
        onKeyDown={(e) => {
          if (e.key === "Escape" && open) {
            e.preventDefault();
            closeMenu();
          }
        }}
        className="flex min-h-9 w-full items-center justify-between border border-border bg-surface px-3 py-1.5 text-left text-[13px] text-ink outline-none transition-colors focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent/20"
      >
        <span className={cn(value.length === 0 && "text-ink-subtle")}>
          {value.length === 0 ? placeholder : `${value.length} seçili`}
        </span>
        <svg
          aria-hidden
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={cn("flex-shrink-0 text-ink-subtle transition-transform", open && "rotate-180")}
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>

      {value.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {value.map((v) => (
            <span
              key={v}
              className="border border-accent bg-transparent px-2 py-0.5 text-[12px] text-accent-strong"
            >
              {v}
            </span>
          ))}
        </div>
      )}

      {open && (
        <div
          role="listbox"
          aria-multiselectable="true"
          aria-label={ariaLabel}
          onKeyDown={onListKeyDown}
          className="absolute z-40 mt-1 max-h-64 w-full overflow-auto border border-border bg-surface shadow-[var(--shadow-card)]"
        >
          {ordered.length === 0 ? (
            <p className="px-3 py-2 text-[13px] text-ink-subtle">Seçenek bulunamadı.</p>
          ) : (
            ordered.map((o, i) => {
              const sel = value.includes(o);
              return (
                <button
                  key={o}
                  ref={(el) => {
                    optionRefs.current[i] = el;
                  }}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  tabIndex={i === activeIndex ? 0 : -1}
                  onClick={() => toggle(o)}
                  className={cn(
                    "flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left text-[13px] outline-none",
                    sel
                      ? "border-l-accent bg-transparent font-medium text-accent-strong"
                      : "border-l-transparent text-ink hover:bg-bg focus-visible:bg-bg",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "inline-block h-3.5 w-3.5 flex-shrink-0 border",
                      sel ? "border-accent bg-accent" : "border-border",
                    )}
                  />
                  {o}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
