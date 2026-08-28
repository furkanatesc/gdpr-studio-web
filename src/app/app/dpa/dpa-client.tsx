"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DocumentOutput } from "@/components/app/document-output";
import { Field, Select, Button, Card } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/app/status-badge";
import {
  listClients,
  getClient,
  listProcessors,
  prepareDpa,
  generateDpaStream,
  dpaDocx,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
  type Processor,
  type DpaPrepareResult,
} from "@/lib/api";
import { useDocumentStream, useDocumentDownload } from "@/components/app/use-document-stream";
import { buildDocFilename } from "@/lib/filename";
import { GenerationWarning } from "@/components/app/generation-warning";
import { GenerationError } from "@/components/app/generation-error";
import { QuotaBlock } from "@/components/app/generation-quota";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { openPrintView, buildCover, formatTrDate } from "@/lib/print";

/*
  DPA üretim akışı: müvekkil seç → Veri İşleyen seç (listProcessors; boşsa "önce
  Veri İşleyen ekleyin" + müvekkil detayına link) → prepareDpa ile kapsam özeti
  (eşleşen süreç sayısı + kategori/tedbir rozetleri; 422 → kapsam boş mesajı, Üret
  devre dışı) → Üret (stream) → .docx/PDF indir. dpia-client.tsx'in müvekkil
  seçici + stream deseni izlenir; kapsam adımı zorunluluk anketi yerine geçer.
*/

export function DpaClient() {
  const toast = useToast();
  const searchParams = useSearchParams();
  const router = useRouter();
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

  // Seçili müvekkili URL'e yaz → İncele sekmesine geçince bağlam korunur (P3-1).
  function selectClient(id: string) {
    setSelectedId(id);
    const params = new URLSearchParams(searchParams.toString());
    params.set("client", id);
    router.replace(`/app/dpa?${params.toString()}`);
  }

  const header = (
    <PageHeader
      eyebrow="Araçlar / DPA Üret"
      title="Veri İşleyen Sözleşmesi Üret"
      description="Bir veri işleyen seçip müvekkil envanterinden ona aktarılan kapsama göre sözleşme taslağı hazırlayın."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          DPA üretimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            DPA üretmek için önce bir müvekkil oluşturun.
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
              <Select value={selectedId} onChange={(e) => selectClient(e.target.value)}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.sector ? ` — ${SECTOR_LABELS[c.sector] ?? c.sector}` : ""}
                  </option>
                ))}
              </Select>
            </Field>
          </section>

          {selectedId && <DpaFlow key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function DpaFlow({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [processors, setProcessors] = useState<Processor[] | null>(null);
  const [processorId, setProcessorId] = useState<string>("");

  useEffect(() => {
    getClient(clientId)
      .then(setClient)
      .catch(() => setClient(null));
  }, [clientId]);

  useEffect(() => {
    listProcessors(clientId)
      .then((ps) => {
        setProcessors(ps);
        setProcessorId(ps[0]?.id ?? "");
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Veri işleyenler yüklenemedi."));
  }, [clientId, toast]);

  if (processors === null) {
    return <p className="mt-5 text-[13px] text-ink-muted">Yükleniyor…</p>;
  }

  if (processors.length === 0) {
    return (
      <div className="mt-5 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
        <p className="text-[13.5px] text-ink-muted">
          Önce bu müvekkil için bir Veri İşleyen ekleyin.
        </p>
        <Link
          href={`/app/muvekkiller?client=${clientId}`}
          className="mt-4 inline-block font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
        >
          Bu müvekkilin Veri İşleyenleri&apos;ne git ↗
        </Link>
      </div>
    );
  }

  const processor = processors.find((p) => p.id === processorId) ?? null;

  return (
    <div className="mt-5 space-y-5">
      <Card title="Veri İşleyen" icon={<Icon name="landmark" className="text-[18px]" />}>
        <Field label="Veri İşleyen">
          <Select value={processorId} onChange={(e) => setProcessorId(e.target.value)}>
            {processors.map((p) => (
              <option key={p.id} value={p.id}>
                {p.unvan}
              </option>
            ))}
          </Select>
        </Field>
      </Card>

      {processor && <DpaScope key={processor.id} clientId={clientId} client={client} processor={processor} />}
    </div>
  );
}

function DpaScope({
  clientId,
  client,
  processor,
}: {
  clientId: string;
  client: Client | null;
  processor: Processor;
}) {
  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [prepareResult, setPrepareResult] = useState<DpaPrepareResult | null>(null);

  const { loading, streaming, result, error: genError, quotaBlock, warning, generate, cancel, retry } =
    useDocumentStream();
  const { downloading, download } = useDocumentDownload();

  // P2-4: kapsam artık otomatik değil — kullanıcı "Değerlendir" ile tetikler (DPIA/İhlal
  // ile tutarlı; işleyen seçince istenmeyen otomatik API atışı olmaz). DpaScope işleyene
  // göre key'lendiğinden işleyen değişince state zaten tazelenir.
  function onEvaluate() {
    setPreparing(true);
    setPrepareError(null);
    setPrepareResult(null);
    prepareDpa(clientId, processor.id)
      .then((res) => setPrepareResult(res))
      .catch((e) => {
        const errMsg = e instanceof Error ? e.message : "Kapsam hesaplanamadı.";
        const isEmptyScopeError = errMsg.includes("422") || errMsg.toLowerCase().includes("empty");
        setPrepareError(
          isEmptyScopeError
            ? "Bu işleyene aktarılan süreç yok; işleyenin aktarım eşlemesini kontrol edin."
            : errMsg,
        );
      })
      .finally(() => setPreparing(false));
  }

  function onGenerate() {
    if (!prepareResult) return Promise.resolve();
    return generate((h) => generateDpaStream(clientId, processor.id, h), "DPA taslağı hazır");
  }

  function onDownload() {
    if (!result) return Promise.resolve();
    return download(
      () => dpaDocx(clientId, result.text, processor.id),
      buildDocFilename({ docLabel: "Veri İşleyen Sözleşmesi", subject: client?.name }),
    );
  }

  function onPrint() {
    if (!result || !client) return;
    const cover = buildCover(client, "dpa", {
      tarih: formatTrDate(),
      versiyon: "Taslak",
      veriIsleyen: processor.unvan,
    });
    openPrintView({ docType: "dpa", content: result.text, cover });
  }

  return (
    <>
      <Card title="Kapsam Özeti" icon={<Icon name="clipboard" className="text-[18px]" />}>
        {preparing ? (
          <p className="text-[13px] text-ink-muted">Kapsam hesaplanıyor…</p>
        ) : prepareError ? (
          <div>
            <p className="text-[13px] text-danger">{prepareError}</p>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <Button variant="secondary" onClick={onEvaluate}>
                Tekrar değerlendir
              </Button>
              <Link
                href={`/app/muvekkiller?client=${clientId}`}
                className="font-medium text-[12px] uppercase tracking-[0.06em] text-accent-strong hover:underline"
              >
                Aktarım eşlemesini düzenle ↗
              </Link>
            </div>
          </div>
        ) : prepareResult ? (
          <>
            <StatusBadge tone="ok">
              Bu işleyene aktarılan {prepareResult.eslesenSurecSayisi} süreç
            </StatusBadge>

            {prepareResult.kategoriler.length > 0 && (
              <div className="mt-4">
                <p className="mb-1.5 text-[12px] font-medium text-ink-muted">Veri kategorileri</p>
                <div className="flex flex-wrap gap-1.5">
                  {prepareResult.kategoriler.map((k) => (
                    <span
                      key={k}
                      className="border border-border-strong bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {(prepareResult.teknikTedbirler.length > 0 || prepareResult.idariTedbirler.length > 0) && (
              <div className="mt-4">
                <p className="mb-1.5 text-[12px] font-medium text-ink-muted">Tedbirler</p>
                <div className="flex flex-wrap gap-1.5">
                  {[...prepareResult.teknikTedbirler, ...prepareResult.idariTedbirler].map((t) => (
                    <span
                      key={t}
                      className="border border-border-strong bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center gap-3">
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
          </>
        ) : (
          <div>
            <p className="text-[13px] text-ink-muted">
              Bu işleyene aktarılan süreçlerin kapsamını değerlendirin.
            </p>
            <Button className="mt-4" onClick={onEvaluate}>
              Değerlendir
            </Button>
          </div>
        )}
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
    </>
  );
}
