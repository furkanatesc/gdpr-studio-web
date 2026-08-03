"use client";

import { useCallback, useEffect, useState } from "react";
import { Button, Field, Input, Textarea } from "@/components/ui";
import { MultiSelect } from "@/components/ui/multi-select";
import { useToast } from "@/components/ui/toast";
import {
  createProcessor,
  deleteProcessor,
  getAktarimAdlari,
  listProcessors,
  updateProcessor,
  type Client,
  type Processor,
  type ProcessorIn,
} from "@/lib/api";

/*
  Veri işleyen (processor) yönetimi — her işleyen için DPA (Veri İşleyen Sözleşmesi)
  ayrı hazırlanır (bkz. Araçlar → DPA). aktarimAliases, envanterdeki aktarım
  alanlarından toplanan adlardan seçilir (getAktarimAdlari) — bağımsız veri
  sorumluları (SGK, banka, vergi dairesi vb.) burada seçilmemeli.
*/

const emptyForm: ProcessorIn = {
  ad: "",
  unvan: "",
  adres: "",
  yetkiliKisi: "",
  iletisim: "",
  vergiDairesiNo: "",
  yurtDisi: false,
  altIsleyenVar: false,
  aktarimAliases: [],
  notlar: "",
};

function toForm(p: Processor): ProcessorIn {
  return {
    ad: p.ad,
    unvan: p.unvan,
    adres: p.adres ?? "",
    yetkiliKisi: p.yetkiliKisi ?? "",
    iletisim: p.iletisim ?? "",
    vergiDairesiNo: p.vergiDairesiNo ?? "",
    yurtDisi: p.yurtDisi,
    altIsleyenVar: p.altIsleyenVar,
    aktarimAliases: p.aktarimAliases,
    notlar: p.notlar ?? "",
  };
}

function toBody(f: ProcessorIn): ProcessorIn {
  return {
    ad: f.ad.trim(),
    unvan: f.unvan.trim(),
    adres: f.adres?.trim() || null,
    yetkiliKisi: f.yetkiliKisi?.trim() || null,
    iletisim: f.iletisim?.trim() || null,
    vergiDairesiNo: f.vergiDairesiNo?.trim() || null,
    yurtDisi: f.yurtDisi,
    altIsleyenVar: f.altIsleyenVar,
    aktarimAliases: f.aktarimAliases,
    notlar: f.notlar?.trim() || null,
  };
}

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <label className="flex items-center gap-2 text-[13px] text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 flex-shrink-0 border border-border accent-accent"
      />
      {label}
    </label>
  );
}

function ProcessorForm({
  initial,
  aktarimOptions,
  busy,
  onCancel,
  onSubmit,
}: {
  initial: ProcessorIn;
  aktarimOptions: string[];
  busy: boolean;
  onCancel?: () => void;
  onSubmit: (body: ProcessorIn) => void;
}) {
  const [form, setForm] = useState<ProcessorIn>(initial);

  function set<K extends keyof ProcessorIn>(key: K, value: ProcessorIn[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.ad.trim() || !form.unvan.trim()) return;
    onSubmit(toBody(form));
  }

  return (
    <form onSubmit={onFormSubmit} className="mt-4 flex flex-col gap-3 border border-border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Ad" required>
          <Input value={form.ad} onChange={(e) => set("ad", e.target.value)} required />
        </Field>
        <Field label="Ünvan" required>
          <Input value={form.unvan} onChange={(e) => set("unvan", e.target.value)} required />
        </Field>
        <Field label="Adres">
          <Input value={form.adres ?? ""} onChange={(e) => set("adres", e.target.value)} />
        </Field>
        <Field label="Yetkili kişi">
          <Input value={form.yetkiliKisi ?? ""} onChange={(e) => set("yetkiliKisi", e.target.value)} />
        </Field>
        <Field label="İletişim">
          <Input value={form.iletisim ?? ""} onChange={(e) => set("iletisim", e.target.value)} />
        </Field>
        <Field label="Vergi dairesi / no">
          <Input value={form.vergiDairesiNo ?? ""} onChange={(e) => set("vergiDairesiNo", e.target.value)} />
        </Field>
      </div>

      <div className="flex flex-wrap gap-4">
        <Toggle checked={form.yurtDisi} onChange={(v) => set("yurtDisi", v)} label="Yurt dışında" />
        <Toggle
          checked={form.altIsleyenVar}
          onChange={(v) => set("altIsleyenVar", v)}
          label="Alt işleyen kullanıyor"
        />
      </div>

      <div>
        <p className="mb-1.5 text-[13px] font-medium text-ink-muted">Aktarım eşleşmeleri</p>
        <p className="mb-2 text-[12px] text-ink-subtle">
          Tüm aktarımlar veri işleyen değildir; yalnız sizin adınıza/talimatınızla işleyenleri seçin
          (SGK, banka, vergi dairesi gibi bağımsız veri sorumluları hariç).
        </p>
        <MultiSelect
          options={aktarimOptions}
          value={form.aktarimAliases}
          onChange={(v) => set("aktarimAliases", v)}
          placeholder="Aktarım adı seçin…"
          ariaLabel="Aktarım eşleşmeleri"
        />
      </div>

      <Field label="Notlar">
        <Textarea value={form.notlar ?? ""} onChange={(e) => set("notlar", e.target.value)} />
      </Field>

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy || !form.ad.trim() || !form.unvan.trim()}>
          Kaydet
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" size="sm" onClick={onCancel} disabled={busy}>
            Vazgeç
          </Button>
        )}
      </div>
    </form>
  );
}

function ProcessorRow({
  clientId,
  processor,
  onEdit,
  onDeleted,
}: {
  clientId: string;
  processor: Processor;
  onEdit: () => void;
  onDeleted: (id: string) => void;
}) {
  const toast = useToast();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  function onConfirmDelete() {
    setBusy(true);
    deleteProcessor(clientId, processor.id)
      .then(() => {
        toast("Veri işleyen silindi.");
        onDeleted(processor.id);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Silinemedi."))
      .finally(() => {
        setBusy(false);
        setConfirming(false);
      });
  }

  return (
    <li className="border-t border-border py-3 first:border-t-0">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-medium text-ink">{processor.ad}</p>
          <p className="truncate text-[12px] text-ink-subtle">{processor.unvan}</p>
        </div>
        {confirming ? (
          <div className="flex flex-shrink-0 items-center gap-2">
            <span className="text-[12.5px] text-ink-muted">Emin misiniz?</span>
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={onConfirmDelete}>
              Evet
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setConfirming(false)}>
              Vazgeç
            </Button>
          </div>
        ) : (
          <div className="flex flex-shrink-0 items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={onEdit}>
              Düzenle
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirming(true)}>
              Sil
            </Button>
          </div>
        )}
      </div>
    </li>
  );
}

export function VeriIsleyenlerSection({ client }: { client: Client }) {
  const toast = useToast();
  const [processors, setProcessors] = useState<Processor[] | null>(null);
  const [aktarimOptions, setAktarimOptions] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | "new" | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(() => {
    return listProcessors(client.id)
      .then(setProcessors)
      .catch((e) => toast(e instanceof Error ? e.message : "Veri işleyenler yüklenemedi."));
  }, [client.id, toast]);

  useEffect(() => {
    void refresh();
    getAktarimAdlari(client.id)
      .then((r) => setAktarimOptions(r.adlar))
      .catch(() => setAktarimOptions([]));
  }, [client.id, refresh]);

  function onCreate(body: ProcessorIn) {
    setBusy(true);
    createProcessor(client.id, body)
      .then(() => {
        toast("Veri işleyen eklendi.");
        setEditingId(null);
        return refresh();
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Eklenemedi."))
      .finally(() => setBusy(false));
  }

  function onUpdate(id: string, body: ProcessorIn) {
    setBusy(true);
    updateProcessor(client.id, id, body)
      .then(() => {
        toast("Veri işleyen kaydedildi.");
        setEditingId(null);
        return refresh();
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Kaydedilemedi."))
      .finally(() => setBusy(false));
  }

  function onDeleted() {
    void refresh();
  }

  return (
    <section className="border border-border bg-surface p-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-[17px] text-ink">Veri İşleyenler</h2>
        {editingId === null && (
          <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId("new")}>
            Ekle
          </Button>
        )}
      </div>

      <div className="mt-4">
        {processors === null ? (
          <p className="text-[13px] text-ink-muted">Yükleniyor…</p>
        ) : processors.length === 0 && editingId !== "new" ? (
          <p className="text-[13px] text-ink-muted">Henüz veri işleyen eklenmedi.</p>
        ) : (
          <ul>
            {processors.map((p) =>
              editingId === p.id ? (
                <li key={p.id} className="border-t border-border py-3 first:border-t-0">
                  <ProcessorForm
                    initial={toForm(p)}
                    aktarimOptions={aktarimOptions}
                    busy={busy}
                    onCancel={() => setEditingId(null)}
                    onSubmit={(body) => onUpdate(p.id, body)}
                  />
                </li>
              ) : (
                <ProcessorRow
                  key={p.id}
                  clientId={client.id}
                  processor={p}
                  onEdit={() => setEditingId(p.id)}
                  onDeleted={onDeleted}
                />
              ),
            )}
          </ul>
        )}
      </div>

      {editingId === "new" && (
        <ProcessorForm
          initial={emptyForm}
          aktarimOptions={aktarimOptions}
          busy={busy}
          onCancel={() => setEditingId(null)}
          onSubmit={onCreate}
        />
      )}
    </section>
  );
}
