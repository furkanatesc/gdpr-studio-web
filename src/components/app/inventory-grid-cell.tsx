"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/*
  Datagrid hücresi: çoklu-değer combobox. Açılır menü grid'in overflow-auto
  konteynerinin İÇİNDE absolute konumlanırsa kırpılır — bu yüzden menü
  document.body'ye portal edilir ve tetikleyicinin getBoundingClientRect'ine
  göre position:fixed ile konumlanır. Scroll/resize'da yeniden konumlanır;
  tetikleyici dondurulmuş bir kolonun (veya sabit başlığın) altına kayıp
  görünmez olursa menü kapatılır (elementFromPoint ile tespit).
*/

type MenuPos = { top: number; left: number; minWidth: number };

function isAnchorVisible(anchor: HTMLElement): boolean {
  const r = anchor.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  const cx = r.left + r.width / 2;
  const cy = r.top + r.height / 2;
  if (cx < 0 || cy < 0 || cx > window.innerWidth || cy > window.innerHeight) return false;
  const topEl = document.elementFromPoint(cx, cy);
  // Görünür alanın merkezinde başka bir öğe (ör. sticky dondurulmuş kolon) varsa
  // tetikleyici o öğenin altında kalmış demektir.
  return !!topEl && (topEl === anchor || anchor.contains(topEl));
}

function useAnchoredPosition(
  anchorRef: React.RefObject<HTMLElement | null>,
  menuRef: React.RefObject<HTMLDivElement | null>,
  onOutOfView: () => void,
) {
  const [pos, setPos] = useState<MenuPos | null>(null);

  useLayoutEffect(() => {
    function reposition() {
      const anchor = anchorRef.current;
      if (!anchor) return;
      if (!isAnchorVisible(anchor)) {
        onOutOfView();
        return;
      }
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
  }, [anchorRef, menuRef, onOutOfView]);

  return pos;
}

function GridComboMenu({
  anchorRef,
  onEscape,
  onOutsideClick,
  onOutOfView,
  children,
}: {
  anchorRef: React.RefObject<HTMLElement | null>;
  onEscape: () => void;
  onOutsideClick: () => void;
  onOutOfView: () => void;
  children: ReactNode;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const pos = useAnchoredPosition(anchorRef, menuRef, onOutOfView);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      const t = e.target as Node;
      if (anchorRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      onOutsideClick();
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.preventDefault();
        onEscape();
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [anchorRef, onEscape, onOutsideClick]);

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
 *
 * Kapanış semantiği: dışarı tıkla / tetikleyiciye tekrar tıkla / görünürlükten
 * kayma -> serbest modda yazılmış ama commit edilmemiş taslak KAYDEDİLİR (çip
 * olarak eklenir), sonra kapanır. Escape -> taslak atılır (iptal semantiği).
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
  const [openOrder, setOpenOrder] = useState<string[]>([]);
  const [filter, setFilter] = useState("");
  const [draft, setDraft] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  function openMenu() {
    // Seçili öğeler en üstte (açılışta dondurulur — seçim yaparken liste zıplamaz).
    setOpenOrder([...options.filter((o) => value.includes(o)), ...options.filter((o) => !value.includes(o))]);
    setOpen(true);
  }
  const triggerRef = useRef<HTMLButtonElement>(null);
  const filterInputRef = useRef<HTMLInputElement>(null);
  const optionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    if (activeIndex >= 0) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex]);

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

  function closeMenu({ commit, focusTrigger }: { commit: boolean; focusTrigger: boolean }) {
    if (commit && mode === "free" && draft.trim()) commitDraft(draft);
    setOpen(false);
    setFilter("");
    setDraft("");
    setActiveIndex(-1);
    if (focusTrigger) triggerRef.current?.focus();
  }

  const hasSensitive = isSensitive ? value.some((v) => isSensitive(v)) : false;
  const baseOptions = openOrder.length ? openOrder : options;
  const filteredOptions = filter.trim()
    ? baseOptions.filter((o) => o.toLowerCase().includes(filter.trim().toLowerCase()))
    : baseOptions;

  function onOptionsListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredOptions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (activeIndex <= 0) {
        setActiveIndex(-1);
        filterInputRef.current?.focus();
      } else {
        setActiveIndex((i) => Math.max(i - 1, 0));
      }
    } else if (e.key === "Home") {
      e.preventDefault();
      setActiveIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setActiveIndex(filteredOptions.length - 1);
    } else if (e.key === "Enter" && activeIndex >= 0 && filteredOptions[activeIndex]) {
      e.preventDefault();
      toggleOption(filteredOptions[activeIndex]);
    } else if (e.key === "Tab") {
      closeMenu({ commit: false, focusTrigger: false });
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup={mode === "options" ? "listbox" : "dialog"}
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => (open ? closeMenu({ commit: true, focusTrigger: true }) : openMenu())}
        className="flex h-8 w-full min-w-0 items-center px-2 text-left text-[12.5px] outline-none hover:bg-bg focus-visible:bg-bg"
      >
        <CellSummary value={value} placeholder={placeholder} hasSensitive={hasSensitive} />
      </button>

      {open &&
        (mode === "options" ? (
          <GridComboMenu
            anchorRef={triggerRef}
            onEscape={() => closeMenu({ commit: false, focusTrigger: true })}
            onOutsideClick={() => closeMenu({ commit: true, focusTrigger: false })}
            onOutOfView={() => closeMenu({ commit: true, focusTrigger: false })}
          >
            <div role="listbox" aria-multiselectable="true" aria-label={ariaLabel} onKeyDown={onOptionsListKeyDown}>
              <div className="border-b border-border p-1.5">
                <input
                  ref={filterInputRef}
                  autoFocus
                  value={filter}
                  onChange={(e) => {
                    setFilter(e.target.value);
                    setActiveIndex(-1);
                  }}
                  placeholder="Ara…"
                  className="h-8 w-full border border-border bg-bg px-2 text-[12.5px] text-ink outline-none focus:border-accent"
                />
              </div>
              {filteredOptions.length === 0 ? (
                <p className="px-3 py-2 text-[12.5px] text-ink-subtle">Seçenek bulunamadı.</p>
              ) : (
                filteredOptions.map((o, i) => {
                  const sel = value.includes(o);
                  const hassas = isSensitive?.(o) ?? false;
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
                      onClick={() => {
                        setActiveIndex(i);
                        toggleOption(o);
                      }}
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
          <GridComboMenu
            anchorRef={triggerRef}
            onEscape={() => closeMenu({ commit: false, focusTrigger: true })}
            onOutsideClick={() => closeMenu({ commit: true, focusTrigger: false })}
            onOutOfView={() => closeMenu({ commit: true, focusTrigger: false })}
          >
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
                  } else if (e.key === "Tab") {
                    closeMenu({ commit: true, focusTrigger: false });
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
