"use client";

import { useEffect, useState } from "react";
import { Field, Select, Input, MultiSelect, Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import {
  getSurveySchema,
  getClientInventory,
  replaceClientInventory,
  type SurveySchema,
  type InventoryRow,
} from "@/lib/api";
import { cn } from "@/lib/utils";

/*
  Envanter rehberli mod — departman/bölüm gez, rehber soruları gör, "Listeye ekle" ile
  süreç stage'le, "Envantere kaydet" ile mevcut envantere BİRLEŞTİREREK yaz. Envanter
  çalışma alanının bir modu (ayrı rota değil); müvekkil seçici workspace'te.
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
        Listeye ekle
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
  const [mevcutRows, setMevcutRows] = useState<InventoryRow[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);

  const dept = schema.departments[deptIdx];
  const bolum = dept.bolumler[bolumIdx];

  useEffect(() => {
    getClientInventory(clientId)
      .then((d) => setMevcutRows(d.rows))
      .catch(() => setMevcutRows([]));
  }, [clientId]);

  const coveredKeys = new Set(
    [...mevcutRows, ...eklenenler]
      .filter((r) => r.departman && r.is_sureci)
      .map((r) => `${r.departman} ${r.is_sureci}`),
  );
  const isCovered = (deptLabel: string, bolumLabel: string) =>
    coveredKeys.has(`${deptLabel} ${bolumLabel}`);

  const deptKapsama = schema.departments.map((d) => ({
    total: d.bolumler.length,
    covered: d.bolumler.filter((b) => isCovered(d.label, b.label)).length,
  }));
  const toplamBolum = deptKapsama.reduce((s, k) => s + k.total, 0);
  const kapsananBolum = deptKapsama.reduce((s, k) => s + k.covered, 0);
  const yuzde = toplamBolum ? Math.round((kapsananBolum / toplamBolum) * 100) : 0;

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
      .then((d) => {
        const birlesik = [...d.rows, ...eklenenler];
        return replaceClientInventory(clientId, birlesik).then((s) => {
          setMevcutRows(birlesik);
          return s;
        });
      })
      .then((s) => {
        toast(`${s.count} kayıt envanterde`);
        setSavedCount(eklenenler.length);
        setEklenenler([]);
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Kaydedilemedi.", "error"))
      .finally(() => setSaving(false));
  }

  return (
    <div className="mt-6 space-y-5">
      <div className="border border-border bg-surface p-5">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-[15px] text-ink">Envanter kapsaması</h3>
          <span className="text-[13px] text-ink-muted">
            <span className="font-medium text-ink">{kapsananBolum}</span> / {toplamBolum} bölüm ·{" "}
            <span className="font-medium text-accent-strong">%{yuzde}</span>
          </span>
        </div>
        <div className="mt-3 h-2 w-full bg-bg" role="progressbar" aria-valuenow={yuzde} aria-valuemin={0} aria-valuemax={100}>
          <div className="h-full bg-accent-strong transition-[width]" style={{ width: `${yuzde}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[200px_220px_1fr]">
      <nav aria-label="Departmanlar" className="border border-border bg-surface">
        <p className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
          Departman
        </p>
        <div className="max-h-[420px] overflow-y-auto lg:max-h-[560px]">
          {schema.departments.map((d, i) => {
            const k = deptKapsama[i];
            const tam = k.total > 0 && k.covered === k.total;
            return (
            <button
              key={d.key}
              type="button"
              onClick={() => selectDept(i)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-left text-[13px] transition-colors last:border-b-0",
                i === deptIdx
                  ? "bg-accent/10 font-medium text-accent-strong"
                  : "text-ink-muted hover:bg-bg hover:text-ink",
              )}
            >
              <span className="truncate">{d.label}</span>
              <span
                className={cn(
                  "flex-shrink-0 text-[11px] tabular-nums",
                  tam ? "text-accent-strong" : "text-ink-subtle",
                )}
              >
                {k.covered}/{k.total}
              </span>
            </button>
            );
          })}
        </div>
      </nav>

      <nav aria-label="Bölümler" className="border border-border bg-surface">
        <p className="border-b border-border px-4 py-2.5 text-[11px] font-medium uppercase tracking-[0.08em] text-ink-subtle">
          {dept.label}
        </p>
        <div className="max-h-[420px] overflow-y-auto lg:max-h-[560px]">
          {dept.bolumler.map((b, i) => {
            const covered = isCovered(dept.label, b.label);
            return (
            <button
              key={b.label}
              type="button"
              onClick={() => setBolumIdx(i)}
              className={cn(
                "flex w-full items-center justify-between gap-2 border-b border-border px-4 py-2.5 text-left text-[13px] transition-colors last:border-b-0",
                i === bolumIdx
                  ? "bg-accent/10 font-medium text-accent-strong"
                  : "text-ink-muted hover:bg-bg hover:text-ink",
              )}
            >
              <span className="truncate">{b.label}</span>
              {covered && (
                <span className="flex-shrink-0 text-[12px] text-accent-strong" aria-label="Kapsandı">
                  ✓
                </span>
              )}
            </button>
            );
          })}
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
              <span className="ml-2 font-normal text-[12px] text-ink-subtle">— henüz kaydedilmedi</span>
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
              {saving ? "Kaydediliyor…" : `Envantere kaydet (${eklenenler.length})`}
            </Button>
          </div>
        )}

        {savedCount !== null && (
          <div className="border border-border border-l-2 border-l-accent bg-surface px-5 py-4 text-[13px]">
            <p className="text-ink">{savedCount} kayıt müvekkilin envanterine eklendi.</p>
            <p className="mt-1 text-[12.5px] text-ink-subtle">Tablo modunda görüntüleyip düzenleyebilirsiniz.</p>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export function InventoryWizard({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [schema, setSchema] = useState<SurveySchema | null>(null);

  useEffect(() => {
    getSurveySchema()
      .then(setSchema)
      .catch((e) => toast(e instanceof Error ? e.message : "Anket şeması yüklenemedi.", "error"));
  }, [toast]);

  if (!schema) return <p className="mt-6 text-[13px] text-ink-muted">Anket şeması yükleniyor…</p>;
  return <AnketFlow key={clientId} clientId={clientId} schema={schema} />;
}
