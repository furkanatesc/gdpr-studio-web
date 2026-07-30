"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DocumentOutput } from "@/components/app/document-output";
import { Field, Select, Button, Card, Tag } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/app/status-badge";
import {
  listClients,
  getClient,
  prepareDpia,
  generateDpiaStream,
  dpiaDocx,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
  type DpiaAnket,
  type DpiaPrepareResult,
} from "@/lib/api";
import { useDocumentStream, useDocumentDownload } from "@/components/app/use-document-stream";
import { GenerationWarning } from "@/components/app/generation-warning";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { openPrintView, buildCover, formatTrDate } from "@/lib/print";

/*
  DPIA üretim akışı: müvekkil seç → Zorunluluk Testi (anket + envanterden otomatik
  tespit) → Değerlendir → Üret (stream) → .docx/PDF indir. kayit-client.tsx'in
  müvekkil seçici + stream deseni, aydinlatma-client.tsx'in "Hazırla" geçit deseni
  izlenir.
*/

const ANKET_SORULARI: { key: keyof DpiaAnket; label: string }[] = [
  { key: "buyukOlcek", label: "Büyük ölçekli işleme" },
  { key: "yeniTeknoloji", label: "Yeni teknoloji kullanımı" },
  { key: "savunmasizGrup", label: "Savunmasız grup (çocuk, hasta, çalışan vb.)" },
  { key: "veriEslestirme", label: "Veri eşleştirme / birleştirme" },
];

const BOS_ANKET: DpiaAnket = {
  buyukOlcek: false,
  yeniTeknoloji: false,
  savunmasizGrup: false,
  veriEslestirme: false,
};

export function DpiaClient() {
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
      eyebrow="Araçlar / DPIA Üret"
      title="DPIA Üret"
      description="Zorunluluk testini uygulayıp müvekkil envanterinden veri koruma etki değerlendirmesi hazırlayın."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          DPIA üretimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            DPIA üretmek için önce bir müvekkil oluşturun.
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

          {selectedId && <DpiaFlow key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function DpiaFlow({ clientId }: { clientId: string }) {
  const [anket, setAnket] = useState<DpiaAnket>(BOS_ANKET);
  const [client, setClient] = useState<Client | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [prepareResult, setPrepareResult] = useState<DpiaPrepareResult | null>(null);

  const { loading, streaming, result, error: genError, quotaBlock, warning, generate, reset } =
    useDocumentStream();
  const { downloading, download } = useDocumentDownload();

  useEffect(() => {
    getClient(clientId)
      .then(setClient)
      .catch(() => setClient(null));
  }, [clientId]);

  function toggleAnket(key: keyof DpiaAnket) {
    setAnket((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function onPrepare() {
    setPreparing(true);
    setPrepareError(null);
    setPrepareResult(null);
    reset();
    try {
      const res = await prepareDpia(clientId, anket);
      setPrepareResult(res);
    } catch (e) {
      setPrepareError(e instanceof Error ? e.message : "Değerlendirme başarısız.");
    } finally {
      setPreparing(false);
    }
  }

  function onGenerate() {
    if (!prepareResult) return Promise.resolve();
    return generate(
      (h) => generateDpiaStream(clientId, prepareResult.tetiklenenler, h),
      "DPIA taslağı hazır",
    );
  }

  function onDownload() {
    if (!result) return Promise.resolve();
    return download(() => dpiaDocx(clientId, result.text), "dpia.docx");
  }

  function onPrint() {
    if (!result || !client) return;
    const cover = buildCover(client, "dpia", { tarih: formatTrDate(), versiyon: "Taslak" });
    openPrintView({ docType: "dpia", content: result.text, cover });
  }

  return (
    <div className="mt-5 space-y-5">
      <Card title="Zorunluluk Testi" icon={<Icon name="shield-alert" className="text-[18px]" />}>
        <p className="text-[13px] text-ink-muted">
          Aşağıdaki soruları yanıtlayın; özel nitelikli veri ve profilleme varlığı envanterden
          otomatik tespit edilir.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {ANKET_SORULARI.map((s) => (
            <Tag key={s.key} label={s.label} on={anket[s.key]} onToggle={() => toggleAnket(s.key)} />
          ))}
        </div>
        <div className="mt-4">
          <Button onClick={onPrepare} disabled={preparing || loading}>
            {preparing ? (
              <>
                <Icon name="spinner" className="animate-spin text-[15px]" /> Değerlendiriliyor…
              </>
            ) : (
              "Değerlendir"
            )}
          </Button>
        </div>
        {prepareError && <p className="mt-3 text-[13px] text-danger">{prepareError}</p>}

        {prepareResult && (
          <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-border pt-4">
            <StatusBadge tone={prepareResult.otomatik.ozelNitelikliVar ? "warning" : "neutral"}>
              Özel nitelikli veri: {prepareResult.otomatik.ozelNitelikliVar ? "Var" : "Yok"}
            </StatusBadge>
            <StatusBadge tone={prepareResult.otomatik.profillemeVar ? "warning" : "neutral"}>
              Profilleme: {prepareResult.otomatik.profillemeVar ? "Var" : "Yok"}
            </StatusBadge>
            <StatusBadge tone={prepareResult.zorunlu ? "ok" : "neutral"}>
              {prepareResult.zorunlu
                ? `DPIA ZORUNLU — ${prepareResult.kriterSayisi}/6 kriter`
                : "Zorunlu değil (yine de üretebilirsiniz)"}
            </StatusBadge>
          </div>
        )}
      </Card>

      {prepareResult && (
        <Card title="DPIA taslağı" icon={<Icon name="clipboard" className="text-[18px]" />}>
          <p className="text-[13px] text-ink-muted">
            Müvekkilin tüm envanter kayıtlarından DPIA (veri koruma etki değerlendirmesi) taslağı
            üretilir.
          </p>
          <div className="mt-4">
            <Button onClick={onGenerate} disabled={loading}>
              {loading ? (
                <>
                  <Icon name="spinner" className="animate-spin text-[15px]" /> Üretiliyor…
                </>
              ) : prepareResult.zorunlu ? (
                "Üret"
              ) : (
                "Yine de Üret"
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

      {loading && !result && <GenerationSkeleton />}

      {result && (
        <>
          <DocumentOutput result={result} streaming={streaming} />
          {!streaming && (
            <div className="flex items-center gap-3">
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
