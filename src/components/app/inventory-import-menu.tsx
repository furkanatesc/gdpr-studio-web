"use client";

import { useEffect, useRef, useState } from "react";
import { buttonClasses } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  getClientInventory,
  replaceClientInventory,
  importClientInventory,
  importClientWorkbook,
  inventoryTemplateUrl,
  workbookTemplateUrl,
  type InventoryRow,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Excel içe/dışa aktarma — envanterin İKİNCİL yolu (birincil: grid + rehberli mod).
  Şablon indir (boş VERBİS / müvekkile toplatılacak anket kitabı) + doldurulmuş dosya yükle.
  Yükleme, mevcut envanter doluysa üzerine-yaz/birleştir onayı sorar (elle emek ezilmesin).
  Birleştir = snapshot al → import (replace) → snapshot+yeni → replaceClientInventory (backend değişmez).
*/

type FileKind = "verbis" | "workbook";
type Pending = { file: File; kind: FileKind };

export function InventoryImportMenu({
  clientId,
  onImported,
  open,
  onOpenChange,
}: {
  clientId: string;
  onImported: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const toast = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOpenChange(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open, onOpenChange]);

  async function onPick(file: File, kind: FileKind) {
    const cur = await getClientInventory(clientId).catch(() => ({ rows: [] as InventoryRow[] }));
    if (cur.rows.length > 0) setPending({ file, kind });
    else await runImport(file, kind, "replace");
  }

  async function runImport(file: File, kind: FileKind, mode: "replace" | "merge") {
    setBusy(true);
    try {
      const snapshot = mode === "merge" ? (await getClientInventory(clientId)).rows : null;
      const doImport = kind === "verbis" ? importClientInventory : importClientWorkbook;
      const res = await doImport(clientId, file);
      if (mode === "merge" && snapshot) {
        const imported = (await getClientInventory(clientId)).rows;
        const merged = [...snapshot, ...imported];
        const saved = await replaceClientInventory(clientId, merged);
        toast(`${saved.count} kayıt (birleştirildi).`);
      } else {
        toast(`${res.count} kayıt yüklendi.`);
      }
      onImported();
      onOpenChange(false);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Yükleme başarısız.", "error");
    } finally {
      setBusy(false);
      setPending(null);
    }
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>, kind: FileKind) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void onPick(file, kind);
  }

  const itemClass =
    "block w-full px-4 py-2.5 text-left text-[13px] text-ink transition-colors hover:bg-surface-2";
  const uploadClass = cn(itemClass, "cursor-pointer", busy && "pointer-events-none opacity-50");

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => onOpenChange(!open)}
        className={cn(buttonClasses("secondary", "sm"))}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        İçe/Dışa Aktar ▾
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1 w-72 border border-border-strong bg-surface shadow-lg"
        >
          {pending ? (
            <div className="p-4">
              <p className="text-[13px] text-ink">
                Bu müvekkilin envanterinde kayıt var. Yüklenen dosya ne yapsın?
              </p>
              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => runImport(pending.file, pending.kind, "merge")}
                  disabled={busy}
                  className={cn(buttonClasses("primary", "sm"), "justify-center")}
                >
                  Mevcuda ekle (birleştir)
                </button>
                <button
                  type="button"
                  onClick={() => runImport(pending.file, pending.kind, "replace")}
                  disabled={busy}
                  className={cn(buttonClasses("secondary", "sm"), "justify-center")}
                >
                  Üzerine yaz
                </button>
                <button
                  type="button"
                  onClick={() => setPending(null)}
                  disabled={busy}
                  className="mt-1 text-[12px] text-ink-subtle transition-colors hover:text-ink"
                >
                  Vazgeç
                </button>
              </div>
            </div>
          ) : (
            <>
              <p className="border-b border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                Şablon indir
              </p>
              <a href={inventoryTemplateUrl()} className={itemClass} role="menuitem">
                Boş VERBİS şablonu
              </a>
              <a href={workbookTemplateUrl()} className={itemClass} role="menuitem">
                Anket kitabı — müvekkile toplat
              </a>
              <p className="border-y border-border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
                Doldurulmuş dosya yükle
              </p>
              <label className={uploadClass}>
                VERBİS dosyası (.xlsx)
                <input type="file" accept=".xlsx" className="hidden" disabled={busy}
                  onChange={(e) => onInputChange(e, "verbis")} />
              </label>
              <label className={uploadClass}>
                Anket kitabı (.xlsx)
                <input type="file" accept=".xlsx" className="hidden" disabled={busy}
                  onChange={(e) => onInputChange(e, "workbook")} />
              </label>
              {busy && (
                <p className="border-t border-border px-4 py-2 text-[12px] text-ink-subtle">İçe aktarılıyor…</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
