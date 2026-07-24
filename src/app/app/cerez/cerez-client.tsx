"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DocumentOutput } from "@/components/app/document-output";
import { Field, Select, Input, Button, Card, MultiSelect } from "@/components/ui";
import { Textarea } from "@/components/ui/textarea";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import {
  listClients,
  generateCerezStream,
  cerezDocx,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
} from "@/lib/api";
import { useDocumentStream, useDocumentDownload } from "@/components/app/use-document-stream";
import { GenerationWarning } from "@/components/app/generation-warning";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";

/*
  Cerez uretim akisi: muvekkil sec -> sabit form (site + araclar + CMP + kategoriler) ->
  Uret (stream) -> .docx indir. aydinlatma-client.tsx'in muvekkil secici + stream state
  makinesi (onGenerate: acc/grounding/flush + Date.now() throttle) desenini izler; fark:
  prepare/oneri-onay yok, form sabit.
*/

const CEREZ_KATEGORILERI = [
  "Zorunlu çerezler",
  "Fonksiyonel çerezler",
  "Analitik çerezler",
  "Pazarlama çerezleri",
  "Sosyal medya çerezleri",
];
const CMP_OPTIONS: [string, string][] = [
  ["yok", "Yok"],
  ["var-kendi", "Var — kendi çözümümüz"],
  ["var-3taraf", "Var — 3. taraf CMP"],
];

export function CerezClient() {
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
      eyebrow="Araçlar / Çerez Politikası Üret"
      title="Çerez Politikası Üret"
      description="Müvekkilin sitesi/uygulaması için çerez politikası hazırlayın."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          Çerez üretimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            Çerez politikası üretmek için önce bir müvekkil oluşturun.
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

          {selectedId && <CerezForm key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function CerezForm({ clientId }: { clientId: string }) {
  const [site, setSite] = useState("");
  const [tools, setTools] = useState("");
  const [cmp, setCmp] = useState("yok");
  const [kategoriler, setKategoriler] = useState<string[]>([]);

  const { loading, streaming, result, error: genError, quotaBlock, warning, generate } =
    useDocumentStream();
  const { downloading, download } = useDocumentDownload();

  function onGenerate() {
    return generate(
      (h) => generateCerezStream(clientId, { site, tools, cmp, kategoriler }, h),
      "Çerez politikası hazır",
    );
  }

  function onDownload() {
    if (!result) return Promise.resolve();
    return download(() => cerezDocx(clientId, result.text, "Çerez Politikası"), "cerez-politikasi.docx");
  }

  return (
    <div className="mt-5 space-y-5">
      <Card title="Site ve çerez bilgileri" icon={<Icon name="cookie" className="text-[18px]" />}>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Site / uygulama" required>
            <Input
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="www.sirket.com"
            />
          </Field>
          <Field label="Çerez onay aracı (CMP)">
            <Select value={cmp} onChange={(e) => setCmp(e.target.value)}>
              {CMP_OPTIONS.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </Select>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Kullanılan 3. taraf araçlar / çerezler">
              <Textarea
                value={tools}
                onChange={(e) => setTools(e.target.value)}
                placeholder="Örn: Google Analytics, Hotjar, Meta Pixel"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Çerez kategorileri">
              <MultiSelect
                options={CEREZ_KATEGORILERI}
                value={kategoriler}
                onChange={setKategoriler}
                ariaLabel="Çerez kategorileri"
                placeholder="Kategori seçin…"
              />
            </Field>
          </div>
        </div>

        <div className="mt-4">
          <Button onClick={onGenerate} disabled={!site.trim() || loading}>
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
