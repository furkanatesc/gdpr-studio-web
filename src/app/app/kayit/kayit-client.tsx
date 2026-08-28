"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DocumentOutput } from "@/components/app/document-output";
import { Field, Select, Button, Card } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  listClients,
  getClient,
  getClientInventorySummary,
  generateKayitStream,
  kayitDocx,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
  type InventorySummary,
} from "@/lib/api";
import { useDocumentStream, useDocumentDownload } from "@/components/app/use-document-stream";
import { buildDocFilename } from "@/lib/filename";
import { GenerationWarning } from "@/components/app/generation-warning";
import { GenerationError } from "@/components/app/generation-error";
import { QuotaBlock } from "@/components/app/generation-quota";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { openPrintView, buildCover, formatTrDate } from "@/lib/print";

/*
  İşleme kaydı (VERBİS) üretim akışı: müvekkil seç → envanter özeti kontrolü →
  Üret (stream) → .docx indir. Form/öneri-onay yok — envanterin tamamından tek
  parça kayıt üretilir. aydinlatma-client.tsx'in müvekkil seçici + stream state
  makinesi (use-document-stream.ts) desenini izler.
*/

export function KayitClient() {
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
      eyebrow="Araçlar / İşleme Kaydı Üret"
      title="İşleme Kaydı Üret"
      description="Müvekkil envanterinden VERBİS işleme kaydı (faaliyet envanteri) hazırlayın."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          İşleme kaydı üretimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            İşleme kaydı üretmek için önce bir müvekkil oluşturun.
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

          {selectedId && <KayitFlow key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function KayitFlow({ clientId }: { clientId: string }) {
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [client, setClient] = useState<Client | null>(null);

  const { loading, streaming, result, error: genError, quotaBlock, warning, generate, cancel, retry } =
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

  function onGenerate() {
    return generate((h) => generateKayitStream(clientId, h), "İşleme kaydı hazır");
  }

  function onDownload() {
    if (!result) return Promise.resolve();
    return download(
      () => kayitDocx(clientId, result.text, "İşleme Kaydı"),
      buildDocFilename({ docLabel: "İşleme Kaydı", subject: client?.name }),
    );
  }

  function onPrint() {
    if (!result || !client) return;
    const cover = buildCover(client, "kayit", { tarih: formatTrDate(), versiyon: "Taslak" });
    openPrintView({ docType: "kayit", content: result.text, cover });
  }

  if (summaryError) return <p className="mt-5 text-[13.5px] text-danger">{summaryError}</p>;

  if (!summary) return <p className="mt-5 text-[13px] text-ink-muted">Envanter özeti yükleniyor…</p>;

  if (summary.count === 0)
    return (
      <div className="mt-5 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
        <p className="text-[13.5px] text-ink-muted">
          Bu müvekkilin envanteri boş. İşleme kaydı üretmek için önce envanter kaydı gerekir.
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
      <Card title="İşleme kaydı" icon={<Icon name="clipboard" className="text-[18px]" />}>
        <p className="text-[13px] text-ink-muted">
          Müvekkilin tüm envanter kayıtlarından VERBİS işleme kaydı (faaliyet envanteri) tek
          parça olarak üretilir.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? (
              <>
                <Icon name="spinner" className="animate-spin text-[15px]" /> Üretiliyor…
              </>
            ) : (
              "İşleme Kaydı Üret"
            )}
          </Button>
          {loading && (
            <Button variant="secondary" onClick={cancel}>
              Durdur
            </Button>
          )}
        </div>
      </Card>

      {quotaBlock && <QuotaBlock used={quotaBlock.used} quota={quotaBlock.quota} />}

      {genError && <GenerationError message={genError} onRetry={retry} />}

      {warning && <GenerationWarning warning={warning} />}

      {loading && !result && <GenerationSkeleton />}

      {result && (
        <DocumentOutput
          result={result}
          streaming={streaming}
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
      )}
    </div>
  );
}
