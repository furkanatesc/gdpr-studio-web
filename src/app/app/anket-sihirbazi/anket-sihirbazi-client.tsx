"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Field, Select, Input, MultiSelect, Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  listClients,
  getSurveySchema,
  getClientInventory,
  replaceClientInventory,
  usingRealApi,
  SECTOR_LABELS,
  type Client,
  type SurveySchema,
  type InventoryRow,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Anket Sihirbazı — müvekkil seç, departman/bölüm gez, o bölümün rehber sorularını
  gör ve "Süreç ekle" formuyla envanter satırı üret. Kaydetme mevcut envanterin
  ÜZERİNE değil, ONUNLA BİRLEŞTİRİLEREK gider (getClientInventory + replaceClientInventory).
  veri_turleri için sabit/ grounding'li bir sözlük yok (bkz. inventory-editor.tsx'te
  aynı alan serbest giriş) — bu yüzden burada da virgülle ayrılan serbest metin.
*/

function ProcessForm({
  dept,
  bolum,
  vocab,
  onAdd,
}: {
  dept: string;
  bolum: string;
  vocab: SurveySchema["vocab"];
  onAdd: (row: InventoryRow) => void;
}) {
  const toast = useToast();
  const [altSurec, setAltSurec] = useState("");
  const [kisiGrubu, setKisiGrubu] = useState("");
  const [veriTurleriRaw, setVeriTurleriRaw] = useState("");
  const [hukukiSebepler, setHukukiSebepler] = useState<string[]>([]);
  const [saklama, setSaklama] = useState("");
  const [toplama, setToplama] = useState("");
  const [alici, setAlici] = useState("");
  const [yurtdisi, setYurtdisi] = useState("");
  const [konum, setKonum] = useState("");

  function reset() {
    setAltSurec("");
    setKisiGrubu("");
    setVeriTurleriRaw("");
    setHukukiSebepler([]);
    setSaklama("");
    setToplama("");
    setAlici("");
    setYurtdisi("");
    setKonum("");
  }

  function submit() {
    if (!kisiGrubu) {
      toast("Kişi grubu zorunlu, boş bırakılamaz.", "warning");
      return;
    }
    onAdd({
      departman: dept,
      is_sureci: bolum,
      alt_surec: altSurec.trim(),
      kisi_grubu: kisiGrubu,
      kategoriler: [],
      veri_turleri: veriTurleriRaw.split(",").map((v) => v.trim()).filter(Boolean),
      amaclar: [],
      hukuki_sebepler: hukukiSebepler,
      dayanaklar: [],
      saklama_sureleri: saklama.trim() ? [saklama.trim()] : [],
      islem: [],
      ortam_format: [],
      konum: konum.trim() ? [konum.trim()] : [],
      idari_tedbirler: [],
      teknik_tedbirler: [],
      aktarim: [
        ...(alici.trim() ? [alici.trim()] : []),
        ...(yurtdisi === "Evet" ? ["Yurt dışına aktarım"] : []),
      ],
      toplama: toplama ? [toplama] : [],
    });
    reset();
  }

  return (
    <div className="border border-border bg-surface p-5">
      <h3 className="font-display text-[15px] text-ink">Süreç ekle</h3>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Departman">
          <Input value={dept} disabled />
        </Field>
        <Field label="İş süreci">
          <Input value={bolum} disabled />
        </Field>
        <Field label="Alt süreç">
          <Input
            value={altSurec}
            onChange={(e) => setAltSurec(e.target.value)}
            placeholder="Süreç adı"
          />
        </Field>
        <Field label="Kişi grubu" required>
          <Select value={kisiGrubu} onChange={(e) => setKisiGrubu(e.target.value)}>
            <option value="">Seçiniz…</option>
            {vocab.kisiGrubu.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <div className="sm:col-span-2">
          <Field label="Veri türleri">
            <Input
              value={veriTurleriRaw}
              onChange={(e) => setVeriTurleriRaw(e.target.value)}
              placeholder="Virgülle ayırın (örn. Ad Soyad, TC Kimlik No, E-posta)"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="Hukuki sebepler">
            <MultiSelect
              options={vocab.hukukiSebep}
              value={hukukiSebepler}
              onChange={setHukukiSebepler}
              ariaLabel="Hukuki sebepler"
              placeholder="Seçin…"
            />
          </Field>
        </div>
        <Field label="Saklama süresi">
          <Input value={saklama} onChange={(e) => setSaklama(e.target.value)} placeholder="Örn. 10 yıl" />
        </Field>
        <Field label="Toplama kaynağı">
          <Select value={toplama} onChange={(e) => setToplama(e.target.value)}>
            <option value="">Seçilmedi</option>
            {vocab.kaynak.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Veri alıcısı">
          <Input value={alici} onChange={(e) => setAlici(e.target.value)} placeholder="Kiminle paylaşılıyor" />
        </Field>
        <Field label="Yurt dışına aktarım">
          <Select value={yurtdisi} onChange={(e) => setYurtdisi(e.target.value)}>
            <option value="">Seçilmedi</option>
            {vocab.yurtdisi.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Kullanılan sistem">
          <Input value={konum} onChange={(e) => setKonum(e.target.value)} placeholder="Örn. SAP, Excel, bulut" />
        </Field>
      </div>

      <Button type="button" className="mt-5" onClick={submit} disabled={!kisiGrubu}>
        Süreç ekle
      </Button>
    </div>
  );
}

function AnketFlow({
  clientId,
  schema,
}: {
  clientId: string;
  schema: SurveySchema;
}) {
  const toast = useToast();
  const [deptIdx, setDeptIdx] = useState(0);
  const [bolumIdx, setBolumIdx] = useState(0);
  const [eklenenler, setEklenenler] = useState<InventoryRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const dept = schema.departments[deptIdx];
  const bolum = dept.bolumler[bolumIdx];

  function selectDept(i: number) {
    setDeptIdx(i);
    setBolumIdx(0);
  }

  function addRow(row: InventoryRow) {
    setEklenenler((rows) => [...rows, row]);
    setSavedCount(null);
  }

  function removeRow(i: number) {
    setEklenenler((rows) => rows.filter((_, idx) => idx !== i));
  }

  function onKaydet() {
    setSaving(true);
    getClientInventory(clientId)
      .then((d) => replaceClientInventory(clientId, [...d.rows, ...eklenenler]))
      .then((s) => {
        toast(`${s.count} kayıt envanterde`);
        setSavedCount(eklenenler.length);
        setEklenenler([]);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Kaydedilemedi.", "error"))
      .finally(() => setSaving(false));
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[200px_220px_1fr]">
      <nav aria-label="Departmanlar" className="border border-border bg-surface">
        <p className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
          Departman
        </p>
        <div className="max-h-[420px] overflow-y-auto lg:max-h-[560px]">
          {schema.departments.map((d, i) => (
            <button
              key={d.key}
              type="button"
              onClick={() => selectDept(i)}
              className={cn(
                "block w-full border-b border-border px-4 py-2.5 text-left text-[13px] transition-colors last:border-b-0",
                i === deptIdx
                  ? "bg-accent/10 font-medium text-accent-strong"
                  : "text-ink-muted hover:bg-bg hover:text-ink",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </nav>

      <nav aria-label="Bölümler" className="border border-border bg-surface">
        <p className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
          {dept.label}
        </p>
        <div className="max-h-[420px] overflow-y-auto lg:max-h-[560px]">
          {dept.bolumler.map((b, i) => (
            <button
              key={b.label}
              type="button"
              onClick={() => setBolumIdx(i)}
              className={cn(
                "block w-full border-b border-border px-4 py-2.5 text-left text-[13px] transition-colors last:border-b-0",
                i === bolumIdx
                  ? "bg-accent/10 font-medium text-accent-strong"
                  : "text-ink-muted hover:bg-bg hover:text-ink",
              )}
            >
              {b.label}
            </button>
          ))}
        </div>
      </nav>

      <div key={`${deptIdx}-${bolumIdx}`} className="space-y-5">
        <div className="border border-border bg-surface p-5">
          <h3 className="font-display text-[15px] text-ink">Bu süreçleri düşünün:</h3>
          {bolum.sorular.length ? (
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-ink-muted">
              {bolum.sorular.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[13px] text-ink-subtle">Bu bölüm için rehber soru tanımlı değil.</p>
          )}
        </div>

        <ProcessForm dept={dept.label} bolum={bolum.label} vocab={schema.vocab} onAdd={addRow} />

        {eklenenler.length > 0 && (
          <div className="border border-border bg-surface p-5">
            <h3 className="font-display text-[15px] text-ink">
              Eklenen süreçler <span className="font-normal text-ink-subtle">({eklenenler.length})</span>
            </h3>
            <ul className="mt-3 divide-y divide-border">
              {eklenenler.map((r, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="text-[13px] text-ink">
                    {r.departman} / {r.is_sureci} / {r.alt_surec || "—"}{" "}
                    <span className="text-ink-subtle">— {r.kisi_grubu}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => removeRow(i)}
                    aria-label={`${i + 1}. kaydı sil`}
                    className="flex-shrink-0 text-[15px] text-ink-subtle transition-colors hover:text-warning"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
            <Button type="button" className="mt-5" onClick={onKaydet} disabled={saving}>
              {saving ? "Kaydediliyor…" : `${eklenenler.length} kaydı envantere ekle`}
            </Button>
          </div>
        )}

        {savedCount !== null && (
          <div className="border border-border border-l-2 border-l-accent bg-surface px-5 py-4 text-[13px]">
            <p className="text-ink">{savedCount} kayıt müvekkilin envanterine eklendi.</p>
            <Link
              href={`/app/envanter?client=${clientId}`}
              className="mt-2 inline-block font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
            >
              Envanter Yönetimi&apos;nde gör ↗
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function AnketSihirbaziClient() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [schema, setSchema] = useState<SurveySchema | null>(null);

  useEffect(() => {
    if (!usingRealApi) return;
    listClients()
      .then((cs) => {
        setClients(cs);
        setSelectedId((id) => id || cs[0]?.id || "");
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkiller yüklenemedi.", "error"));
  }, [toast]);

  useEffect(() => {
    if (!usingRealApi) return;
    getSurveySchema()
      .then(setSchema)
      .catch((e) => toast(e instanceof Error ? e.message : "Anket şeması yüklenemedi.", "error"));
  }, [toast]);

  const header = <PageHeader eyebrow="Araçlar / Anket" title="Anket Sihirbazı" />;

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Anket sihirbazı gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
        </p>
      </div>
    );

  return (
    <div>
      {header}

      {clients === null ? (
        <p className="mt-8 text-[13px] text-ink-muted">Yükleniyor…</p>
      ) : clients.length === 0 ? (
        <div className="mt-8 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
          <p className="text-[13.5px] text-ink-muted">
            Anket sihirbazını kullanmak için önce bir müvekkil oluşturun.
          </p>
          <Link
            href="/app/muvekkiller"
            className="mt-4 inline-block font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
          >
            Müvekkil Yönetimi&apos;ne git ↗
          </Link>
        </div>
      ) : (
        <div className="mt-8">
          <section className="border border-border bg-surface p-6">
            <Field label="Müvekkil">
              <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.sector ? ` — ${SECTOR_LABELS[c.sector] ?? c.sector}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </section>

          {selectedId && (schema ? (
            <AnketFlow key={selectedId} clientId={selectedId} schema={schema} />
          ) : (
            <p className="mt-6 text-[13px] text-ink-muted">Anket şeması yükleniyor…</p>
          ))}
        </div>
      )}
    </div>
  );
}
