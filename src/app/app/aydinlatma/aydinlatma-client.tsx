"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DocumentOutput } from "@/components/app/document-output";
import { Field, Select, Button, Card, MultiSelect } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  listClients,
  getClientInventorySummary,
  prepareAydinlatma,
  generateAydinlatmaStream,
  aydinlatmaDocx,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
  type InventorySummary,
  type EnrichedSection,
  type AydinlatmaSection,
} from "@/lib/api";
import { useDocumentStream, useDocumentDownload } from "@/components/app/use-document-stream";
import { GenerationWarning } from "@/components/app/generation-warning";

/*
  Aydınlatma üretim akışı (m.10): müvekkil seç → hedef kişi grupları → Hazırla
  (backend envanterden bölüm çıkarır + boş alanlar için öneri sunar) → öneri
  onayı → Üret (stream) → .docx indir. envanter-client.tsx (müvekkil seçici) ve
  doc-flow.tsx (stream state makinesi) desenlerini izler.
*/

const FIELD_LABELS: Record<keyof Omit<AydinlatmaSection, "isSureci">, string> = {
  kisiGruplari: "İlgili kişi grupları",
  kategoriler: "Veri kategorileri",
  veriTurleri: "Veri türleri",
  amaclar: "İşleme amaçları",
  hukukiSebepler: "Hukuki sebepler",
  saklamaSureleri: "Saklama süreleri",
  aktarim: "Aktarım",
  toplama: "Toplama yöntemi",
};
const EDITABLE_FIELDS = Object.keys(FIELD_LABELS) as (keyof typeof FIELD_LABELS)[];
// Dolu olsa da düzenlenebilir (mevcut + öneri; ekle/çıkar) alanlar — avukat S2.
const ADDITIVE_FIELDS = new Set<keyof typeof FIELD_LABELS>(["amaclar"]);

function toApproved(s: EnrichedSection): AydinlatmaSection {
  return {
    isSureci: s.isSureci,
    kisiGruplari: s.kisiGruplari,
    kategoriler: s.kategoriler,
    veriTurleri: s.veriTurleri,
    amaclar: s.amaclar,
    hukukiSebepler: s.hukukiSebepler,
    saklamaSureleri: s.saklamaSureleri,
    aktarim: s.aktarim,
    toplama: s.toplama,
  };
}

export function AydinlatmaClient() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const clientParam = searchParams.get("client");
  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!usingRealApi) return;
    listClients()
      .then((cs) => {
        setClients(cs);
        setSelectedId((id) => {
          if (id) return id;
          if (clientParam && cs.some((c) => c.id === clientParam)) return clientParam;
          return cs[0]?.id ?? "";
        });
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkiller yüklenemedi."));
  }, [toast, clientParam]);

  const header = (
    <PageHeader
      eyebrow="Araçlar / Aydınlatma Üret"
      title="Aydınlatma Metni Üret"
      description="Müvekkil envanterinden hedef kişi gruplarına özel aydınlatma metni hazırlayın."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Aydınlatma üretimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            Aydınlatma üretmek için önce bir müvekkil oluşturun.
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

          {selectedId && <AydinlatmaFlow key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function AydinlatmaFlow({ clientId }: { clientId: string }) {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [targetGroups, setTargetGroups] = useState<string[]>([]);

  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [sections, setSections] = useState<EnrichedSection[] | null>(null);
  const [edited, setEdited] = useState<AydinlatmaSection[]>([]);

  const { loading, streaming, result, error: genError, quotaBlock, warning, generate, reset } =
    useDocumentStream();
  const { downloading, download } = useDocumentDownload();

  useEffect(() => {
    getClientInventorySummary(clientId)
      .then(setSummary)
      .catch((e) =>
        setSummaryError(e instanceof Error ? e.message : "Envanter özeti yüklenemedi."),
      );
  }, [clientId]);

  function updateField(i: number, field: keyof typeof FIELD_LABELS, values: string[]) {
    setEdited((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: values } : s)));
  }

  async function onPrepare() {
    setPreparing(true);
    setPrepareError(null);
    setSections(null);
    setEdited([]);
    reset();
    try {
      const res = await prepareAydinlatma(clientId, targetGroups);
      setSections(res.sections);
      setEdited(res.sections.map(toApproved));
    } catch (e) {
      setPrepareError(e instanceof Error ? e.message : "Hazırlama başarısız.");
    } finally {
      setPreparing(false);
    }
  }

  function onGenerate() {
    return generate((h) => generateAydinlatmaStream(clientId, edited, h), "Aydınlatma metni hazır");
  }

  function onDownload() {
    if (!result) return Promise.resolve();
    return download(() => aydinlatmaDocx(clientId, result.text, "Aydınlatma Metni"), "aydinlatma.docx");
  }

  if (summaryError) return <p className="mt-5 text-[13.5px] text-danger">{summaryError}</p>;

  if (!summary) return <p className="mt-5 text-[13px] text-ink-muted">Envanter özeti yükleniyor…</p>;

  if (summary.count === 0)
    return (
      <div className="mt-5 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
        <p className="text-[13.5px] text-ink-muted">
          Bu müvekkilin envanteri boş. Aydınlatma üretmek için önce envanter kaydı gerekir.
        </p>
        <Link
          href={`/app/envanter?client=${clientId}`}
          className="mt-4 inline-block font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
        >
          Envanter Yönetimi&apos;ne git ↗
        </Link>
      </div>
    );

  return (
    <div className="mt-5 space-y-5">
      <Card title="Hedef kişi grupları" icon={<Icon name="grid" className="text-[18px]" />}>
        <Field label="Aydınlatma metninin kapsayacağı kişi grupları">
          <MultiSelect
            options={summary.kisiGruplari}
            value={targetGroups}
            onChange={setTargetGroups}
            ariaLabel="Hedef kişi grupları"
            placeholder="Kişi grubu seçin…"
          />
        </Field>
        <div className="mt-4">
          <Button onClick={onPrepare} disabled={targetGroups.length === 0 || preparing || loading}>
            {preparing ? (
              <>
                <Icon name="spinner" className="animate-spin text-[15px]" /> Hazırlanıyor…
              </>
            ) : (
              "Hazırla"
            )}
          </Button>
        </div>
        {prepareError && <p className="mt-3 text-[13px] text-danger">{prepareError}</p>}
      </Card>

      {sections && sections.length > 0 && (
        <Card title="Öneri onayı" icon={<Icon name="clipboard" className="text-[18px]" />}>
          <p className="mb-4 text-[13px] text-ink-muted">
            Boş bırakılan ve ek öneri sunulan (ör. hukuk departmanı) alanlar için öneriler
            listelenir; seçtiğiniz değerler metne işlenir. Öneri olmayan boş alanlar üretimde
            &quot;[Avukat tarafından doldurulacak]&quot; olarak bırakılır.
          </p>
          <div className="space-y-6">
            {sections.map((s, i) => (
              <div key={`${s.isSureci}-${i}`} className="border border-border p-4">
                <h3 className="font-display text-[14.5px] text-ink">{s.isSureci}</h3>
                <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {EDITABLE_FIELDS.map((field) => {
                    const base = s[field];
                    const oneri = s.oneriler[field] ?? [];
                    return (
                      <div key={field}>
                        <p className="mb-1.5 text-[12.5px] font-medium text-ink-muted">
                          {FIELD_LABELS[field]}
                        </p>
                        {ADDITIVE_FIELDS.has(field) || oneri.length > 0 ? (
                          // Additive alan ya da (dolu/bos farketmez) oneri bulunan alan: mevcut +
                          // oneri birlesik, avukat ekler/cikarir (S4 hukuk mesru menfaat dahil).
                          <>
                            <MultiSelect
                              options={Array.from(new Set([...base, ...oneri]))}
                              value={edited[i]?.[field] ?? base}
                              onChange={(v) => updateField(i, field, v)}
                              ariaLabel={FIELD_LABELS[field]}
                              placeholder="Mevcut + öneriler; ekleyin/çıkarın…"
                            />
                            {oneri.length > 0 && (
                              <p className="mt-1 text-[11px] text-ink-subtle">
                                Öneri: {oneri.join(", ")}
                              </p>
                            )}
                          </>
                        ) : base.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {base.map((v) => (
                              <span
                                key={v}
                                className="border border-border-strong bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted"
                              >
                                {v}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[12.5px] text-ink-subtle">
                            [Avukat tarafından doldurulacak]
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <Button onClick={onGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="spinner" className="animate-spin text-[15px]" /> Üretiliyor…
                </>
              ) : (
                "Üret"
              )}
            </Button>
          </div>
        </Card>
      )}

      {quotaBlock && (
        <div className="flex items-start gap-2.5 border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-5 py-4 text-sm">
          <Icon name="shield-alert" className="mt-0.5 flex-shrink-0 text-[16px] text-warning" />
          <div>
            <strong className="font-medium text-ink">
              Bu ayki ücretsiz doküman hakkınızı kullandınız ({quotaBlock.used}/{quotaBlock.quota}).
            </strong>
            <Link
              href="/app/faturalama"
              className="mt-3 inline-block bg-accent px-4 py-2 text-[13px] text-accent-contrast hover:bg-accent-strong"
            >
              Planı yükselt →
            </Link>
          </div>
        </div>
      )}

      {genError && (
        <div className="flex items-start gap-2.5 border border-danger/40 border-l-2 border-l-danger bg-danger-soft px-5 py-4 text-sm text-danger">
          <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[16px]" />
          <span>
            <strong className="font-medium">Üretim başarısız.</strong> {genError}
          </span>
        </div>
      )}

      {warning && <GenerationWarning warning={warning} />}

      {result && (
        <>
          <DocumentOutput result={result} streaming={streaming} />
          {!streaming && (
            <Button variant="secondary" onClick={onDownload} disabled={downloading}>
              {downloading ? (
                <>
                  <Icon name="spinner" className="animate-spin text-[15px]" /> İndiriliyor…
                </>
              ) : (
                <>
                  <Icon name="file" className="text-[15px]" /> .docx indir
                </>
              )}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
