"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { AydinlatmaPreviewPanel } from "@/components/app/aydinlatma-preview-panel";
import { buildAydinlatmaPreview } from "@/lib/aydinlatma-preview";
import { Field, Select, Button, Card, MultiSelect } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  listClients,
  getClient,
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
import { buildDocFilename } from "@/lib/filename";
import { GenerationWarning } from "@/components/app/generation-warning";
import { GenerationError } from "@/components/app/generation-error";
import { QuotaBlock } from "@/components/app/generation-quota";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { OneriOnayi } from "./oneri-onayi";
import type { SectionField } from "@/lib/section-classify";
import { openPrintView, buildCover, formatTrDate } from "@/lib/print";

/*
  Aydınlatma üretim akışı (m.10): müvekkil seç → hedef kişi grupları → Hazırla
  (backend envanterden bölüm çıkarır + boş alanlar için öneri sunar) → öneri
  onayı → Üret (stream) → .docx indir. envanter-client.tsx (müvekkil seçici) ve
  use-document-stream.ts (stream state makinesi) desenlerini izler.
*/

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
  const [client, setClient] = useState<Client | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [sections, setSections] = useState<EnrichedSection[] | null>(null);
  const [edited, setEdited] = useState<AydinlatmaSection[]>([]);

  const { loading, streaming, result, error: genError, quotaBlock, warning, generate, reset, cancel, retry } =
    useDocumentStream();
  const { downloading, download } = useDocumentDownload();

  useEffect(() => {
    getClientInventorySummary(clientId)
      .then(setSummary)
      .catch((e) =>
        setSummaryError(e instanceof Error ? e.message : "Envanter özeti yüklenemedi."),
      );
  }, [clientId]);

  useEffect(() => {
    getClient(clientId)
      .then(setClient)
      .catch(() => setClient(null));
  }, [clientId]);

  function updateField(i: number, field: SectionField, values: string[]) {
    setEdited((prev) => prev.map((s, idx) => (idx === i ? { ...s, [field]: values } : s)));
    // Üretilmiş metin artık düzenlenen öneriyle tutarsız → bayat çıktıyı geçersizleştir,
    // kullanıcı yanlışlıkla eski belgeyi indirip/yazdırıp yayınlamasın (P0-4).
    if (result) reset();
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
    return download(
      () => aydinlatmaDocx(clientId, result.text, "Aydınlatma Metni", targetGroups),
      buildDocFilename({ docLabel: "Aydınlatma Metni", subject: client?.name }),
    );
  }

  function onPrint() {
    if (!result || !client) return;
    const cover = buildCover(client, "aydinlatma", {
      ilgiliKisi: targetGroups.join(", ") || undefined,
      tarih: formatTrDate(),
      versiyon: "Taslak",
    });
    openPrintView({ docType: "aydinlatma", content: result.text, cover });
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
            onChange={(v) => {
              setTargetGroups(v);
              // Hedef gruplar değişti → mevcut üretim/sections girdisiyle tutarsız; bayat çıktıyı temizle (P0-4).
              if (result) reset();
            }}
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

      {preparing && <GenerationSkeleton label="Envanterden bölümler çıkarılıyor…" />}

      {sections && sections.length === 0 && (
        <div className="border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
          <p className="text-[13.5px] text-ink-muted">
            Seçtiğiniz kişi grupları için envanterde işleme faaliyeti bulunamadı. Farklı bir kişi
            grubu seçin ya da envanteri güncelleyin.
          </p>
          <Link
            href={`/app/envanter?client=${clientId}`}
            className="mt-4 inline-block font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
          >
            Envanter Yönetimi&apos;ne git ↗
          </Link>
        </div>
      )}

      {sections && sections.length > 0 && (
        <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
          {/* Sol — editör + üretim */}
          <div className="space-y-4">
            <OneriOnayi
              sections={sections}
              edited={edited}
              clientId={clientId}
              onChange={updateField}
            />
            <div className="flex items-center gap-3">
              <Button onClick={onGenerate} disabled={loading}>
                {loading ? (
                  <>
                    <Icon name="spinner" className="animate-spin text-[15px]" /> Üretiliyor…
                  </>
                ) : (
                  "Üret"
                )}
              </Button>
              {loading && (
                <Button variant="secondary" onClick={cancel}>
                  Durdur
                </Button>
              )}
            </div>
            {quotaBlock && <QuotaBlock used={quotaBlock.used} quota={quotaBlock.quota} />}
            {genError && <GenerationError message={genError} onRetry={retry} />}
            {warning && <GenerationWarning warning={warning} />}
          </div>

          {/* Sağ — canlı önizleme (iskelet ↔ üretilmiş metin) */}
          <div className="lg:sticky lg:top-4">
            <AydinlatmaPreviewPanel
              preview={buildAydinlatmaPreview(edited, client)}
              result={result}
              streaming={streaming}
              loading={loading}
              actions={
                <>
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
                  <Button variant="secondary" onClick={onPrint} disabled={!client}>
                    <Icon name="file" className="text-[15px]" /> PDF / Yazdır
                  </Button>
                </>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
}
