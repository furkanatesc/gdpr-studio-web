"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { PageHeader } from "@/components/app/page-header";
import { useWorkspaceInfo } from "@/components/app/use-workspace-info";
import { Button, buttonClasses, Field, Input, MultiSelect, Select } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  createClient,
  getClientInventory,
  getClientInventorySummary,
  getGroundingOptions,
  importClientInventory,
  inventoryTemplateUrl,
  listClients,
  replaceClientInventory,
  SECTOR_LABELS,
  updateClient,
  usingRealApi,
  type Client,
  type GroundingOptions,
  type InventoryRow,
  type InventorySummary,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Müvekkil yönetimi (Faz 2.1 envanter-müvekkil): kurum = hukuk bürosu, her müvekkilin
  kendi sektörü + envanteri + veri sorumlusu profili var. Sol: liste + ekleme formu.
  Sağ: seçili müvekkilin profili (yalnız yönetici düzenler — backend 409/403 ile korur)
  ve envanter yükleme/özet. usingRealApi guard — mock modda sayfa devre dışı mesajı verir.
*/

type ProfileKey = "legal_name" | "mersis" | "kep" | "adres" | "eposta" | "telefon" | "vergi_dairesi" | "vergi_no";

const PROFILE_FIELDS: readonly [ProfileKey, string][] = [
  ["legal_name", "Ünvan (tam)"],
  ["mersis", "Mersis no"],
  ["kep", "KEP adresi"],
  ["adres", "Adres"],
  ["eposta", "E-posta"],
  ["telefon", "Telefon"],
  ["vergi_dairesi", "Vergi dairesi"],
  ["vergi_no", "Vergi no"],
];

function toForm(client: Client): Record<ProfileKey, string> {
  const out = {} as Record<ProfileKey, string>;
  for (const [key] of PROFILE_FIELDS) out[key] = client[key] ?? "";
  return out;
}

function NewClientForm({ onCreated }: { onCreated: (c: Client) => void }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [busy, setBusy] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    setBusy(true);
    createClient(trimmed, sector || null)
      .then((c) => {
        toast("Müvekkil eklendi.");
        setName("");
        setSector("");
        onCreated(c);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkil eklenemedi."))
      .finally(() => setBusy(false));
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
      <h3 className="font-medium text-[11px] uppercase tracking-[0.1em] text-ink-subtle">
        Yeni müvekkil
      </h3>
      <Input
        placeholder="Müvekkil adı"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        aria-label="Müvekkil adı"
      />
      <Select value={sector} onChange={(e) => setSector(e.target.value)} aria-label="Sektör">
        <option value="">Sektör seçilmedi</option>
        {Object.entries(SECTOR_LABELS).map(([k, label]) => (
          <option key={k} value={k}>
            {label}
          </option>
        ))}
      </Select>
      <Button type="submit" size="sm" disabled={busy || !name.trim()}>
        Ekle
      </Button>
    </form>
  );
}

function ProfileForm({
  client,
  isAdmin,
  onSaved,
}: {
  client: Client;
  isAdmin: boolean;
  onSaved: (c: Client) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(client));
  const [busy, setBusy] = useState(false);

  function onSave() {
    setBusy(true);
    const patch: Partial<Client> = {};
    for (const [key] of PROFILE_FIELDS) patch[key] = form[key] || null;
    updateClient(client.id, patch)
      .then((c) => {
        toast("Müvekkil profili kaydedildi.");
        onSaved(c);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Kaydedilemedi."))
      .finally(() => setBusy(false));
  }

  if (!isAdmin)
    return (
      <div className="mt-4">
        {PROFILE_FIELDS.map(([key, label]) => (
          <div
            key={key}
            className="flex flex-col gap-1 border-t border-border py-3 first:border-t-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="font-medium text-[10px] uppercase tracking-[0.1em] text-ink-subtle">
              {label}
            </span>
            <span className="text-[13.5px] text-ink">{client[key] || "—"}</span>
          </div>
        ))}
      </div>
    );

  return (
    <div className="mt-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {PROFILE_FIELDS.map(([key, label]) => (
          <Field key={key} label={label}>
            <Input value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
          </Field>
        ))}
      </div>
      <Button size="sm" className="mt-4" disabled={busy} onClick={onSave}>
        Profili kaydet
      </Button>
    </div>
  );
}

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

function InventorySection({ client }: { client: Client }) {
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
    getClientInventorySummary(client.id)
      .then(setSummary)
      .catch((e) => toast(e instanceof Error ? e.message : "Envanter özeti alınamadı."));
    getClientInventory(client.id)
      .then((d) => setRows(d.rows.map(withId)))
      .catch((e) => toast(e instanceof Error ? e.message : "Envanter yüklenemedi."));
    getGroundingOptions()
      .then(setGroundingOptions)
      .catch(() => setGroundingOptions({ kategoriler: [], amaclar: [], ozelNitelikli: [] }));
  }, [client.id, toast]);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    importClientInventory(client.id, file)
      .then((s) => {
        setSummary(s);
        toast(`${s.count} kayıt yüklendi.`);
        return getClientInventory(client.id);
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
    replaceClientInventory(client.id, payload)
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
          <Button type="button" variant="secondary" size="sm" onClick={addRow} disabled={rows === null}>
            Satır ekle
          </Button>
        </div>

        {rows === null ? (
          <p className="mt-4 text-[13px] text-ink-muted">Yükleniyor…</p>
        ) : rows.length === 0 ? (
          <p className="mt-4 text-[13px] text-ink-muted">Henüz envanter kaydı yok.</p>
        ) : (
          <div>
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

        <Button type="button" size="sm" className="mt-5" onClick={onSave} disabled={saving || rows === null}>
          Envanteri kaydet
        </Button>
      </div>
    </div>
  );
}

export default function MuvekkillerPage() {
  const { identity } = useWorkspaceInfo();
  const toast = useToast();
  const isAdmin = identity?.role === "yonetici";

  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    return listClients()
      .then((cs) => {
        setClients(cs);
        setSelectedId((id) => id ?? cs[0]?.id ?? null);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkiller yüklenemedi."));
  }, [toast]);

  useEffect(() => {
    if (usingRealApi) void refresh();
  }, [refresh]);

  const selected = useMemo(() => clients?.find((c) => c.id === selectedId) ?? null, [clients, selectedId]);

  function onCreated(c: Client) {
    setClients((cs) => [...(cs ?? []), c]);
    setSelectedId(c.id);
  }

  function onProfileSaved(c: Client) {
    setClients((cs) => cs?.map((x) => (x.id === c.id ? c : x)) ?? cs);
  }

  const header = (
    <PageHeader
      eyebrow="Müvekkiller"
      title="Müvekkil Yönetimi"
      description="Her müvekkilin kendi sektörü, veri envanteri ve veri sorumlusu profili vardır."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Müvekkil yönetimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
        </p>
      </div>
    );

  return (
    <div>
      {header}
      <div className="mt-8 grid gap-6 lg:grid-cols-[300px_1fr]">
        <section className="border border-border bg-surface p-6">
          <h2 className="font-display text-[17px] text-ink">Müvekkiller</h2>
          <div className="mt-4">
            {clients === null ? (
              <p className="text-[13px] text-ink-muted">Yükleniyor…</p>
            ) : clients.length === 0 ? (
              <p className="text-[13px] text-ink-muted">Henüz müvekkil eklenmedi.</p>
            ) : (
              <ul>
                {clients.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(c.id)}
                      className={cn(
                        "flex w-full items-center justify-between gap-2 border-t border-border py-2.5 text-left first:border-t-0",
                        selectedId === c.id ? "font-medium text-ink" : "text-ink-muted hover:text-ink",
                      )}
                    >
                      <span className="truncate text-[13.5px]">{c.name}</span>
                      {c.sector && (
                        <span className="flex-shrink-0 text-[11px] text-ink-subtle">
                          {SECTOR_LABELS[c.sector] ?? c.sector}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <NewClientForm onCreated={onCreated} />
        </section>

        <div className="flex flex-col gap-5">
          {selected ? (
            <>
              <section className="border border-border bg-surface p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="font-display text-[17px] text-ink">{selected.name}</h2>
                  {selected.sector && (
                    <span className="font-medium text-[10px] uppercase tracking-[0.08em] text-accent">
                      {SECTOR_LABELS[selected.sector] ?? selected.sector}
                    </span>
                  )}
                </div>
                <ProfileForm key={selected.id} client={selected} isAdmin={isAdmin} onSaved={onProfileSaved} />
              </section>

              <section className="border border-border bg-surface p-6">
                <h2 className="font-display text-[17px] text-ink">Veri envanteri</h2>
                <InventorySection key={selected.id} client={selected} />
              </section>
            </>
          ) : (
            <section className="border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
              <p className="text-[13.5px] text-ink-muted">Bir müvekkil seçin veya yeni ekleyin.</p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
