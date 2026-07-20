"use client";

import { memo, useCallback, useEffect, useState } from "react";
import { Button, buttonClasses } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { ComboCell } from "@/components/app/inventory-grid-cell";
import {
  getClientInventory,
  getClientInventorySummary,
  getGroundingOptions,
  importClientInventory,
  inventoryTemplateUrl,
  replaceClientInventory,
  type GroundingOptions,
  type InventoryRow,
  type InventorySummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Envanter elle düzenleme — /app/envanter (müvekkil seçici) ve müvekkil sayfasının
  ortak düzenleme motoru. clientId'ye göre yükler/kaydeder; çağıran taraf müvekkil
  değişiminde key={clientId} ile remount ederek eski/yeni istek yarışını önler.

  Datagrid düzeni: satır = süreç, sütun = 15 alan. Başlık satırı dikeyde,
  kimlik kolonları (departman/iş süreci/alt süreç/kişi grubu) yatayda sabit
  (position: sticky) — VERBİS/RoPA tarzı geniş tablo, kart değil.
*/

function SummaryTags({ label, items }: { label: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div className="mt-3">
      <p className="font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">{label}</p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {items.map((it) => (
          <span key={it} className="border border-border px-2.5 py-1 text-[11.5px] text-ink-muted">
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

type EditableRow = InventoryRow & { _id: string };

type IdentityKey = "departman" | "is_sureci" | "alt_surec" | "kisi_grubu";
type ListKey =
  | "kategoriler"
  | "veri_turleri"
  | "amaclar"
  | "hukuki_sebepler"
  | "dayanaklar"
  | "saklama_sureleri"
  | "islem"
  | "ortam_format"
  | "konum"
  | "idari_tedbirler"
  | "teknik_tedbirler";

const IDENTITY_COLUMNS: { key: IdentityKey; label: string; width: number; required?: boolean }[] = [
  { key: "departman", label: "Departman", width: 160 },
  { key: "is_sureci", label: "İş süreci", width: 160 },
  { key: "alt_surec", label: "Alt süreç", width: 160 },
  { key: "kisi_grubu", label: "Kişi grubu", width: 160, required: true },
];

const LIST_COLUMNS: { key: ListKey; label: string; width: number; groundingKey?: "kategoriler" | "amaclar" }[] = [
  { key: "kategoriler", label: "Kategoriler", width: 200, groundingKey: "kategoriler" },
  { key: "veri_turleri", label: "Veri türleri", width: 200 },
  { key: "amaclar", label: "Amaçlar", width: 200, groundingKey: "amaclar" },
  { key: "hukuki_sebepler", label: "Hukuki sebepler", width: 190 },
  { key: "dayanaklar", label: "Dayanaklar", width: 190 },
  { key: "saklama_sureleri", label: "Saklama süreleri", width: 190 },
  { key: "islem", label: "İşlem", width: 170 },
  { key: "ortam_format", label: "Ortam / format", width: 190 },
  { key: "konum", label: "Konum", width: 170 },
  { key: "idari_tedbirler", label: "İdari tedbirler", width: 190 },
  { key: "teknik_tedbirler", label: "Teknik tedbirler", width: 190 },
];

const ACTION_WIDTH = 40;
// Sabit (frozen) sol kolonlar: aksiyon + 4 kimlik kolonu. Her birinin sticky left ofseti
// kendinden önceki tüm frozen kolonların toplam genişliği.
const FROZEN_WIDTHS = [ACTION_WIDTH, ...IDENTITY_COLUMNS.map((c) => c.width)];
const FROZEN_OFFSETS = FROZEN_WIDTHS.map((_, i) => FROZEN_WIDTHS.slice(0, i).reduce((a, b) => a + b, 0));
const GRID_TEMPLATE = [...FROZEN_WIDTHS, ...LIST_COLUMNS.map((c) => c.width)].map((w) => `${w}px`).join(" ");

function headerCellClass(frozen: boolean) {
  return cn(
    "sticky top-0 flex items-center border-b border-r border-border bg-surface-2 px-2.5 py-2 text-[11px] font-medium uppercase tracking-[0.06em] text-ink-muted",
    frozen ? "z-30" : "z-20",
  );
}

function bodyCellClass(frozen: boolean, zebra: boolean, warn: boolean) {
  return cn(
    "flex items-center border-b border-r border-border px-0.5",
    frozen ? "sticky z-10" : "z-0",
    warn ? "bg-warning-soft" : zebra ? "bg-bg" : "bg-surface",
  );
}

function emptyRow(): InventoryRow {
  return {
    departman: "",
    is_sureci: "",
    alt_surec: "",
    kisi_grubu: "",
    kategoriler: [],
    veri_turleri: [],
    amaclar: [],
    hukuki_sebepler: [],
    dayanaklar: [],
    saklama_sureleri: [],
    islem: [],
    ortam_format: [],
    konum: [],
    idari_tedbirler: [],
    teknik_tedbirler: [],
  };
}

function withId(row: InventoryRow): EditableRow {
  return { ...row, _id: crypto.randomUUID() };
}

function toInventoryRow(row: EditableRow): InventoryRow {
  return {
    departman: row.departman,
    is_sureci: row.is_sureci,
    alt_surec: row.alt_surec,
    kisi_grubu: row.kisi_grubu,
    kategoriler: row.kategoriler,
    veri_turleri: row.veri_turleri,
    amaclar: row.amaclar,
    hukuki_sebepler: row.hukuki_sebepler,
    dayanaklar: row.dayanaklar,
    saklama_sureleri: row.saklama_sureleri,
    islem: row.islem,
    ortam_format: row.ortam_format,
    konum: row.konum,
    idari_tedbirler: row.idari_tedbirler,
    teknik_tedbirler: row.teknik_tedbirler,
  };
}

function GridHeader() {
  return (
    <>
      <div className={headerCellClass(true)} style={{ left: FROZEN_OFFSETS[0] }} />
      {IDENTITY_COLUMNS.map((col, i) => (
        <div key={col.key} className={headerCellClass(true)} style={{ left: FROZEN_OFFSETS[i + 1] }}>
          {col.label}
          {col.required && <span className="text-accent-strong"> *</span>}
        </div>
      ))}
      {LIST_COLUMNS.map((col) => (
        <div key={col.key} className={headerCellClass(false)}>
          {col.label}
        </div>
      ))}
    </>
  );
}

const GridRow = memo(function GridRow({
  row,
  idx,
  groundingOptions,
  onPatchIdentity,
  onPatchList,
  onRemove,
}: {
  row: EditableRow;
  idx: number;
  groundingOptions: GroundingOptions;
  onPatchIdentity: (id: string, key: IdentityKey, v: string) => void;
  onPatchList: (id: string, key: ListKey, v: string[]) => void;
  onRemove: (id: string) => void;
}) {
  const zebra = idx % 2 === 1;

  return (
    <>
      <div className={bodyCellClass(true, zebra, false)} style={{ left: FROZEN_OFFSETS[0] }}>
        <button
          type="button"
          onClick={() => onRemove(row._id)}
          aria-label={`Kayıt ${idx + 1} satırını sil`}
          className="mx-auto flex h-7 w-7 flex-shrink-0 items-center justify-center text-[15px] text-ink-subtle transition-colors hover:text-warning"
        >
          ×
        </button>
      </div>

      {IDENTITY_COLUMNS.map((col, i) => {
        const warn = !!col.required && !row[col.key].trim();
        return (
          <div
            key={col.key}
            className={bodyCellClass(true, zebra, warn)}
            style={{ left: FROZEN_OFFSETS[i + 1] }}
          >
            <input
              value={row[col.key]}
              onChange={(e) => onPatchIdentity(row._id, col.key, e.target.value)}
              aria-label={`${col.label} — kayıt ${idx + 1}`}
              aria-invalid={warn || undefined}
              className="h-8 w-full min-w-0 border-0 bg-transparent px-2 text-[12.5px] text-ink outline-none placeholder:text-ink-subtle"
            />
          </div>
        );
      })}

      {LIST_COLUMNS.map((col) => (
        <div key={col.key} className={bodyCellClass(false, zebra, false)}>
          <ComboCell
            value={row[col.key]}
            onChange={(v) => onPatchList(row._id, col.key, v)}
            mode={col.groundingKey ? "options" : "free"}
            options={col.groundingKey ? groundingOptions[col.groundingKey] : undefined}
            isSensitive={col.groundingKey ? (o) => groundingOptions.ozelNitelikli.includes(o) : undefined}
            ariaLabel={`${col.label} — kayıt ${idx + 1}`}
          />
        </div>
      ))}
    </>
  );
});

export function InventoryEditor({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [rows, setRows] = useState<EditableRow[] | null>(null);
  const [groundingOptions, setGroundingOptions] = useState<GroundingOptions>({
    kategoriler: [],
    amaclar: [],
    ozelNitelikli: [],
  });
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getClientInventorySummary(clientId)
      .then(setSummary)
      .catch((e) => toast(e instanceof Error ? e.message : "Envanter özeti alınamadı."));
    getClientInventory(clientId)
      .then((d) => setRows(d.rows.map(withId)))
      .catch((e) => toast(e instanceof Error ? e.message : "Envanter yüklenemedi."));
    getGroundingOptions()
      .then(setGroundingOptions)
      .catch(() => setGroundingOptions({ kategoriler: [], amaclar: [], ozelNitelikli: [] }));
  }, [clientId, toast]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    importClientInventory(clientId, file)
      .then((s) => {
        setSummary(s);
        toast(`${s.count} kayıt yüklendi.`);
        return getClientInventory(clientId);
      })
      .then((d) => setRows(d.rows.map(withId)))
      .catch((err) => toast(err instanceof Error ? err.message : "Yükleme başarısız."))
      .finally(() => {
        setImporting(false);
        e.target.value = "";
      });
  }

  function addRow() {
    setRows((rs) => [...(rs ?? []), withId(emptyRow())]);
  }

  const removeRow = useCallback((id: string) => {
    setRows((rs) => rs?.filter((r) => r._id !== id) ?? rs);
  }, []);

  const patchIdentity = useCallback((id: string, key: IdentityKey, v: string) => {
    setRows((rs) => rs?.map((r) => (r._id === id ? { ...r, [key]: v } : r)) ?? rs);
  }, []);

  const patchList = useCallback((id: string, key: ListKey, v: string[]) => {
    setRows((rs) => rs?.map((r) => (r._id === id ? { ...r, [key]: v } : r)) ?? rs);
  }, []);

  function onSave() {
    if (!rows) return;
    const emptyGroupIdx = rows.findIndex((r) => !r.kisi_grubu.trim());
    if (emptyGroupIdx !== -1) {
      toast(`Kayıt ${emptyGroupIdx + 1}: kişi grubu zorunlu, boş bırakılamaz.`);
      return;
    }
    setSaving(true);
    const payload = rows.map(toInventoryRow);
    replaceClientInventory(clientId, payload)
      .then((s) => {
        setSummary(s);
        toast(`Envanter kaydedildi (${s.count} kayıt).`);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Kaydedilemedi."))
      .finally(() => setSaving(false));
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className={cn(buttonClasses("secondary", "sm"), "cursor-pointer", importing && "pointer-events-none opacity-50")}>
          Envanter dosyası yükle (.xlsx)
          <input type="file" accept=".xlsx" className="hidden" onChange={onFileChange} disabled={importing} />
        </label>
        <a href={inventoryTemplateUrl()} className="text-[12.5px] text-accent-strong hover:underline">
          Boş şablonu indir
        </a>
      </div>
      <p className="mt-2 text-[12px] text-ink-subtle">
        Dosya yükleme mevcut envanterin tamamının yerini alır; elle yaptığınız düzenlemelerin üzerine yazar.
      </p>

      {summary && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-[13px] text-ink">
            <span className="font-medium">{summary.count}</span> süreç kaydı
          </p>
          <SummaryTags label="Kişi grupları" items={summary.kisiGruplari} />
          <SummaryTags label="Departmanlar" items={summary.departmanlar} />
        </div>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-[15px] text-ink">Envanter kayıtları</h3>
          <div className="flex items-center gap-3">
            {importing && <span className="text-[12px] text-ink-subtle">İçe aktarılıyor…</span>}
            <Button type="button" variant="secondary" size="sm" onClick={addRow} disabled={rows === null || importing}>
              Satır ekle
            </Button>
          </div>
        </div>

        {rows === null ? (
          <p className="mt-4 text-[13px] text-ink-muted">Yükleniyor…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-muted">Henüz envanter kaydı yok.</p>
        ) : (
          <div
            className={cn(
              "mt-4 max-h-[65vh] overflow-auto border border-border-strong",
              importing && "pointer-events-none opacity-50",
            )}
          >
            <div style={{ display: "grid", gridTemplateColumns: GRID_TEMPLATE }}>
              <GridHeader />
              {rows.map((row, i) => (
                <GridRow
                  key={row._id}
                  row={row}
                  idx={i}
                  groundingOptions={groundingOptions}
                  onPatchIdentity={patchIdentity}
                  onPatchList={patchList}
                  onRemove={removeRow}
                />
              ))}
            </div>
          </div>
        )}

        <Button
          type="button"
          size="sm"
          className="mt-5"
          onClick={onSave}
          disabled={saving || importing || rows === null}
        >
          {saving ? "Kaydediliyor…" : "Envanteri kaydet"}
        </Button>
      </div>
    </div>
  );
}
