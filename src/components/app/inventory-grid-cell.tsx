"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/*
  Datagrid hücresi: çoklu-değer combobox. Açılır menü grid'in overflow-auto
  konteynerinin İÇİNDE absolute konumlanırsa kırpılır — bu yüzden menü
  document.body'ye portal edilir ve tetikleyicinin getBoundingClientRect'ine
  göre position:fixed ile konumlanır. Scroll/resize'da yeniden konumlanır.
*/

type MenuPos = { top: number; left: number; minWidth: number };

function useAnchoredPosition(anchorRef: React.RefObject<HTMLElement | null>, menuRef: React.RefObject<HTMLDivElement | null>) {
  const [pos, setPos] = useState<MenuPos | null>(null);

  useLayoutEffect(() => {
    function reposition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const menuH = menuRef.current?.offsetHeight ?? 260;
      const menuW = Math.max(r.width, 260);
      const openUp = window.innerHeight - r.bottom < menuH + 8 && r.top > menuH + 8;
      setPos({
        top: openUp ? Math.max(8, r.top - menuH - 4) : r.bottom + 4,
        left: Math.min(Math.max(8, r.left), window.innerWidth - menuW - 8),
        minWidth: menuW,
      });
    }
    reposition();
    window.addEventListener("scroll", reposition, true);
    window.addEventListener("resize", reposition);
    return () => {
      window.removeEventListener("scroll", reposition, true);
      window.removeEventListener("resize", reposition);
    };
  }, [anchorRef, menuRef]);

  return pos;
}

function GridComboMenu({
  anchorRef,
  onClose,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
  children: ReactNode;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPosition(anchorRef, menuRef);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      onClose();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, onClose]);

  return createPortal(
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        minWidth: pos?.minWidth ?? 260,
        visibility: pos ? "visible" : "hidden",
      }}
      className="z-[100] max-h-72 overflow-auto border border-border bg-surface shadow-[var(--shadow-card-lift)]"
    >
      {children}
    </div>,
    document.body,
  );
}

function CellSummary({ value, placeholder, hasSensitive }: { value: string[]; placeholder: string; hasSensitive: boolean }) {
  if (value.length === 0) return <span className="truncate text-ink-subtle">{placeholder}</span>;
  return (
    <span className="flex min-w-0 items-center gap-1">
      {hasSensitive && <span aria-hidden className="h-1.5 w-1.5 flex-shrink-0 bg-warning" />}
      <span className="truncate text-ink">{value[0]}</span>
      {value.length > 1 && <span className="flex-shrink-0 text-[11px] text-ink-subtle">+{value.length - 1}</span>}
    </span>
  );
}

/**
 * Grid hücresi combobox. mode="options" -> sabit liste (grounding), sadece seçim.
 * mode="free" -> serbest giriş: yaz + Enter/virgül ile çip ekle, × ile sil.
 */
export function ComboCell({
  value,
  onChange,
  mode,
  options = [],
  isSensitive,
  ariaLabel,
  placeholder = "—",
}: {
  value: string[];
  onChange: (v: string[]) => void;
  mode: "options" | "free";
  options?: string[];
  isSensitive?: (o: string) => boolean;
  ariaLabel: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState("");
  const triggerRef = useRef<HTMLButtonElement>(null);

  function close() {
    setOpen(false);
    setFilter("");
    setDraft("");
    triggerRef.current?.focus();
  }

  function toggleOption(o: string) {
    onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o]);
  }

  function commitDraft(raw: string) {
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
  }

  const hasSensitive = isSensitive ? value.some((v) => isSensitive(v)) : false;
  const filteredOptions = filter.trim()
    ? options.filter((o) => o.toLowerCase().includes(filter.trim().toLowerCase()))
    : options;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup={mode === "options" ? "listbox" : "dialog"}
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-full min-w-0 items-center px-2 text-left text-[12.5px] outline-none hover:bg-bg focus-visible:bg-bg"
      >
        <CellSummary value={value} placeholder={placeholder} hasSensitive={hasSensitive} />
      </button>

      {open &&
        (mode === "options" ? (
          <GridComboMenu anchorRef={triggerRef} onClose={close}>
            <div role="listbox" aria-multiselectable="true" aria-label={ariaLabel}>
              <div className="border-b border-border p-1.5">
                <input
                  autoFocus
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  placeholder="Ara…"
                  className="h-8 w-full border border-border bg-bg px-2 text-[12.5px] text-ink outline-none focus:border-accent"
                />
              </div>
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-[12.5px] text-ink-subtle">Seçenek bulunamadı.</p>
              ) : (
                filteredOptions.map((o) => {
                  const sel = value.includes(o);
                  const hassas = isSensitive?.(o) ?? false;
                  return (
                    <button
                      key={o}
                      type="button"
                      role="option"
                      aria-selected={sel}
                      onClick={() => toggleOption(o)}
                      className={cn(
                        "flex w-full items-center gap-2 border-l-2 px-3 py-1.5 text-left text-[12.5px] outline-none",
                        sel
                          ? hassas
                            ? "border-l-warning font-medium text-warning"
                            : "border-l-accent font-medium text-accent-strong"
                          : "border-l-transparent text-ink hover:bg-bg focus-visible:bg-bg",
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "inline-block h-3.5 w-3.5 flex-shrink-0 border",
                          sel ? (hassas ? "border-warning bg-warning" : "border-accent bg-accent") : "border-border",
                        )}
                      />
                      {hassas && <span aria-hidden className="inline-block h-1.5 w-1.5 flex-shrink-0 bg-warning" />}
                      {o}
                    </button>
                  );
                })
              )}
            </div>
          </GridComboMenu>
        ) : (
          <GridComboMenu anchorRef={triggerRef} onClose={close}>
            <div role="group" aria-label={ariaLabel} className="p-2">
              <div className={cn("flex flex-wrap gap-1.5", value.length === 0 && "hidden")}>
                {value.map((v) => (
                  <span key={v} className="flex items-center gap-1 border border-accent px-2 py-0.5 text-[12px] text-accent-strong">
                    {v}
                    <button
                      type="button"
                      onClick={() => onChange(value.filter((x) => x !== v))}
                      aria-label={`${v} kaldır`}
                      className="text-accent-strong hover:text-warning"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    commitDraft(draft);
                    setDraft("");
                  } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
                    onChange(value.slice(0, -1));
                  }
                }}
                placeholder="Ekle, virgül veya Enter…"
                className={cn(
                  "h-8 w-full border border-border bg-bg px-2 text-[12.5px] text-ink outline-none focus:border-accent",
                  value.length > 0 && "mt-2",
                )}
              />
            </div>
          </GridComboMenu>
        ))}
    </>
  );
}
