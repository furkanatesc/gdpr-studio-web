"use client";

import { useEffect, useState } from "react";
import { Button, buttonClasses, Field, Input, MultiSelect } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
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

type ListFieldKey =
  | "veri_turleri"
  | "hukuki_sebepler"
  | "dayanaklar"
  | "saklama_sureleri"
  | "islem"
  | "ortam_format"
  | "konum"
  | "idari_tedbirler"
  | "teknik_tedbirler";

const DETAIL_FIELDS: readonly [ListFieldKey, string][] = [
  ["veri_turleri", "Veri türleri"],
  ["hukuki_sebepler", "Hukuki sebepler"],
  ["dayanaklar", "Dayanaklar"],
  ["saklama_sureleri", "Saklama süreleri"],
  ["islem", "İşlem"],
  ["ortam_format", "Ortam / format"],
  ["konum", "Konum"],
  ["idari_tedbirler", "İdari tedbirler"],
  ["teknik_tedbirler", "Teknik tedbirler"],
];

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

function ChipListInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [draft, setDraft] = useState("");

  function commit(raw: string) {
    const parts = raw.split(",").map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const p of parts) if (!next.includes(p)) next.push(p);
    onChange(next);
  }

  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-1.5 border border-border bg-surface px-2.5 py-1.5">
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
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit(draft);
              setDraft("");
            } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => {
            if (draft.trim()) {
              commit(draft);
              setDraft("");
            }
          }}
          placeholder="Ekle, virgül veya Enter…"
          className="min-w-[140px] flex-1 border-0 bg-transparent p-1 text-[13px] text-ink outline-none placeholder:text-ink-subtle"
        />
      </div>
    </Field>
  );
}

function InventoryRowEditor({
  row,
  index,
  groundingOptions,
  onPatch,
  onRemove,
}: {
  row: EditableRow;
  index: number;
  groundingOptions: GroundingOptions;
  onPatch: (patch: Partial<InventoryRow>) => void;
  onRemove: () => void;
}) {
  const [detailsOpen, setDetailsOpen] = useState(
    () => DETAIL_FIELDS.some(([key]) => row[key].length > 0),
  );

  return (
    <div className="border-t border-border py-5 first:border-t-0">
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
          Kayıt {index + 1}
        </span>
        <button
          type="button"
          onClick={onRemove}
          className="text-[12px] text-ink-subtle transition-colors hover:text-warning"
        >
          Satırı sil
        </button>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Departman">
          <Input value={row.departman} onChange={(e) => onPatch({ departman: e.target.value })} />
        </Field>
        <Field label="İş süreci">
          <Input value={row.is_sureci} onChange={(e) => onPatch({ is_sureci: e.target.value })} />
        </Field>
        <Field label="Alt süreç">
          <Input value={row.alt_surec} onChange={(e) => onPatch({ alt_surec: e.target.value })} />
        </Field>
        <Field label="Kişi grubu" required>
          <Input
            value={row.kisi_grubu}
            onChange={(e) => onPatch({ kisi_grubu: e.target.value })}
            className={cn(!row.kisi_grubu.trim() && "border-warning")}
          />
        </Field>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <Field label="Kategoriler">
          <MultiSelect
            options={groundingOptions.kategoriler}
            value={row.kategoriler}
            onChange={(v) => onPatch({ kategoriler: v })}
            ariaLabel="Kategoriler"
            isSensitive={(o) => groundingOptions.ozelNitelikli.includes(o)}
          />
        </Field>
        <Field label="Amaçlar">
          <MultiSelect
            options={groundingOptions.amaclar}
            value={row.amaclar}
            onChange={(v) => onPatch({ amaclar: v })}
            ariaLabel="Amaçlar"
          />
        </Field>
      </div>

      <button
        type="button"
        onClick={() => setDetailsOpen((o) => !o)}
        className="mt-3 text-[12px] font-medium text-accent-strong hover:underline"
      >
        {detailsOpen ? "Detayları gizle" : "Detayları göster"}
      </button>

      {detailsOpen && (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          {DETAIL_FIELDS.map(([key, label]) => (
            <ChipListInput
              key={key}
              label={label}
              value={row[key]}
              onChange={(v) => onPatch({ [key]: v })}
            />
          ))}
        </div>
      )}
    </div>
  );
}

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

  function removeRow(id: string) {
    setRows((rs) => rs?.filter((r) => r._id !== id) ?? rs);
  }

  function patchRow(id: string, patch: Partial<InventoryRow>) {
    setRows((rs) => rs?.map((r) => (r._id === id ? { ...r, ...patch } : r)) ?? rs);
  }

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
          <div className={cn(importing && "pointer-events-none opacity-50")}>
            {rows.map((row, i) => (
              <InventoryRowEditor
                key={row._id}
                row={row}
                index={i}
                groundingOptions={groundingOptions}
                onPatch={(patch) => patchRow(row._id, patch)}
                onRemove={() => removeRow(row._id)}
              />
            ))}
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
