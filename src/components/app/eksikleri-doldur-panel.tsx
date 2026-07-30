"use client";

import { useState } from "react";
import { Button, Tag } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { LIST_FIELD_LABELS, type ListKey } from "@/components/app/inventory-fields";
import {
  getClientInventory,
  getInventorySuggestions,
  replaceClientInventory,
  type InventoryRow,
  type InventorySuggestionRow,
  type InventorySuggestions,
} from "@/lib/api";

/*
  Envanterdeki boş alanlar için grounding tabanlı öneri onayı — mevcut satırları
  silmez/değiştirmez, yalnız seçilen önerileri boş alanlara ekler. `suggestion.index`
  backend'de getClientInventory ile aynı sırayı paylaşır; birleştirmeden hemen önce
  envanter taze çekilir (elle düzenleme aradan geçmiş olabilir).
*/

function selectionKey(index: number, field: string, value: string): string {
  return `${index}::${field}::${value}`;
}

function cardTitle(row: InventorySuggestionRow): string {
  return [row.departman, row.isSureci, row.altSurec, row.kisiGrubu].filter((s) => s.trim()).join(" · ");
}

function fieldLabel(key: string): string {
  return LIST_FIELD_LABELS[key as ListKey] ?? key;
}

export function EksikleriDoldurPanel({
  clientId,
  onApplied,
  disabled = false,
}: {
  clientId: string;
  onApplied: () => void;
  disabled?: boolean;
}) {
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [suggestions, setSuggestions] = useState<InventorySuggestions | null>(null);
  const [deselected, setDeselected] = useState<Set<string>>(new Set());

  function fetchSuggestions() {
    setLoading(true);
    return getInventorySuggestions(clientId)
      .then((s) => {
        setSuggestions(s);
        setDeselected(new Set());
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Öneriler yüklenemedi.", "error"))
      .finally(() => setLoading(false));
  }

  function toggle() {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    fetchSuggestions();
  }

  function isSelected(index: number, field: string, value: string): boolean {
    return !deselected.has(selectionKey(index, field, value));
  }

  function toggleValue(index: number, field: string, value: string) {
    const key = selectionKey(index, field, value);
    setDeselected((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  async function applyRows(targetRows: InventorySuggestionRow[]) {
    const patches = targetRows
      .map((row) => {
        const patch: Partial<Record<ListKey, string[]>> = {};
        for (const [field, values] of Object.entries(row.oneriler)) {
          const chosen = values.filter((v) => isSelected(row.index, field, v));
          if (chosen.length > 0) patch[field as ListKey] = chosen;
        }
        return { index: row.index, patch };
      })
      .filter((p) => Object.keys(p.patch).length > 0);

    if (patches.length === 0) {
      toast("Seçili öneri yok.", "warning");
      return;
    }

    setApplying(true);
    let freshRows: InventoryRow[];
    try {
      freshRows = (await getClientInventory(clientId)).rows;
    } catch (e) {
      toast(e instanceof Error ? e.message : "Envanter okunamadı.", "error");
      setApplying(false);
      return;
    }

    const merged = freshRows.map((row, i) => {
      const patch = patches.find((p) => p.index === i)?.patch;
      if (!patch) return row;
      const next: InventoryRow = { ...row };
      for (const [field, values] of Object.entries(patch)) {
        const key = field as ListKey;
        next[key] = Array.from(new Set([...next[key], ...values]));
      }
      return next;
    });

    // Yazma (replaceClientInventory) burada biter — başarı/hata bildirimi bu bloğa özel.
    // Sonraki tazeleme (rows + suggestions) ayrı try/catch'te; yazma başarılıysa
    // tazeleme hatası "uygulama başarısız" gibi yanlış bir izlenim vermemeli.
    try {
      await replaceClientInventory(clientId, merged);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Uygulanamadı.", "error");
      setApplying(false);
      return;
    }

    toast(`${patches.length} kayıt güncellendi.`);
    setApplying(false);
    onApplied();
    fetchSuggestions();
  }

  const visibleRows = suggestions?.rows ?? [];

  return (
    <div className="mt-4">
      <Button type="button" variant="secondary" size="sm" onClick={toggle} disabled={disabled}>
        Eksikleri Doldur
      </Button>

      {open && (
        <div className="mt-4 border border-border bg-surface-2 p-4">
          {loading || !suggestions ? (
            <p className="text-[13px] text-ink-muted">Öneriler yükleniyor…</p>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-ink">
                  {suggestions.bosSlot} boş slot · %{Math.round((suggestions.tamlik ?? 0) * 100)} tamlık
                </p>
                {visibleRows.length > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => applyRows(visibleRows)}
                    disabled={applying}
                  >
                    Görünür tümünü uygula
                  </Button>
                )}
              </div>

              {visibleRows.length === 0 ? (
                <p className="mt-3 text-[13px] text-ink-muted">Tüm otomatik doldurulabilir alanlar dolu.</p>
              ) : (
                <div className="mt-4 flex flex-col gap-3">
                  {visibleRows.map((row) => (
                    <div key={row.index} className="border border-border bg-surface p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="text-[13.5px] font-medium text-ink">
                          {cardTitle(row) || "(kimliksiz kayıt)"}
                        </h4>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => applyRows([row])}
                          disabled={applying}
                        >
                          Uygula
                        </Button>
                      </div>

                      <div className="mt-3 flex flex-col gap-3">
                        {Object.entries(row.oneriler).map(([field, values]) => (
                          <div key={field}>
                            <p className="text-[11px] font-medium uppercase tracking-[0.06em] text-ink-subtle">
                              {fieldLabel(field)}
                            </p>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {values.map((v) => (
                                <Tag
                                  key={v}
                                  label={v}
                                  on={isSelected(row.index, field, v)}
                                  onToggle={() => toggleValue(row.index, field, v)}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                        {row.elleAlanlar.map((alan) => (
                          <p key={alan} className="text-[12px] text-ink-subtle">
                            {fieldLabel(alan)} — grounding&apos;de karşılığı yok, datagrid&apos;den elle girin
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
