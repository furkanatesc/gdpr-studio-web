"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/app/page-header";
import { Field, Select, Button, Card, Textarea, buttonClasses } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/app/status-badge";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import {
  listClients,
  getClient,
  listProcessors,
  reviewDpa,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
  type Processor,
  type DpaReviewResult,
  type ReviewFinding,
} from "@/lib/api";
import { openPrintView, buildCover, formatTrDate } from "@/lib/print";
import { cn } from "@/lib/utils";

const TONE: Record<ReviewFinding["durum"], "ok" | "warning" | "danger"> = {
  var: "ok",
  yetersiz: "warning",
  eksik: "danger",
};
const LABEL: Record<ReviewFinding["durum"], string> = {
  var: "Var",
  yetersiz: "Yetersiz",
  eksik: "Eksik",
};

export function DpaReviewClient() {
  const toast = useToast();
  const [clients, setClients] = useState<Client[] | null>(null);
  const [selectedId, setSelectedId] = useState<string>("");

  useEffect(() => {
    if (!usingRealApi) return;
    listClients()
      .then((cs) => {
        setClients(cs);
        setSelectedId((id) => id || cs[0]?.id || "");
      })
      .catch((e) => toast(e instanceof Error ? e.message : "Müvekkiller yüklenemedi."));
  }, [toast]);

  const header = (
    <PageHeader
      eyebrow="Araçlar / DPA İncele"
      title="Veri İşleyen Sözleşmesi İncele"
      description="Mevcut bir DPA'yı yükleyip KVKK m.12 uyum kontrol listesine göre analiz edin."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          İnceleme gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            DPA incelemek için önce bir müvekkil oluşturun.
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

          {selectedId && <DpaReviewFlow key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function DpaReviewFlow({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [client, setClient] = useState<Client | null>(null);
  const [processors, setProcessors] = useState<Processor[] | null>(null);
  const [processorId, setProcessorId] = useState<string>("");
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DpaReviewResult | null>(null);

  useEffect(() => {
    getClient(clientId).then(setClient).catch(() => setClient(null));
  }, [clientId]);

  useEffect(() => {
    listProcessors(clientId)
      .then(setProcessors)
      .catch((e) => toast(e instanceof Error ? e.message : "Veri işleyenler yüklenemedi."));
  }, [clientId, toast]);

  function onFileChange(e: ChangeEvent<HTMLInputElement>) {
    setFile(e.target.files?.[0] ?? null);
    e.target.value = "";
  }

  function onReview() {
    if (!text.trim() && !file) return;
    setLoading(true);
    setResult(null);
    reviewDpa(clientId, {
      text: text.trim() || undefined,
      file: file ?? undefined,
      processorId: processorId || undefined,
    })
      .then(setResult)
      .catch((e) => toast(e instanceof Error ? e.message : "İnceleme başarısız."))
      .finally(() => setLoading(false));
  }

  function onPrint() {
    if (!result || !client) return;
    openPrintView({
      docType: "dpa",
      content: buildReportMarkdown(result, client.name),
      cover: buildCover(client, "dpa", { tarih: formatTrDate(), versiyon: "İnceleme Raporu" }),
    });
  }

  const canReview = !loading && (text.trim().length > 0 || file !== null);

  return (
    <div className="mt-5 space-y-5">
      <Card title="Veri İşleyen (opsiyonel)" icon={<Icon name="landmark" className="text-[18px]" />}>
        {processors === null ? (
          <p className="text-[13px] text-ink-muted">Yükleniyor…</p>
        ) : (
          <Field label="Veri İşleyen">
            <Select value={processorId} onChange={(e) => setProcessorId(e.target.value)}>
              <option value="">Genel (tüm işleyenler)</option>
              {processors.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.unvan}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </Card>

      <Card title="Sözleşme Metni" icon={<Icon name="file" className="text-[18px]" />}>
        <Textarea
          rows={8}
          placeholder="Sözleşme metnini buraya yapıştırın…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className={cn(buttonClasses("secondary", "sm"), "cursor-pointer")}>
            Dosya seç (.docx/.pdf)
            <input type="file" accept=".docx,.pdf" className="hidden" onChange={onFileChange} />
          </label>
          {file && (
            <span className="text-[12.5px] text-ink-muted">
              {file.name}
              <button
                type="button"
                onClick={() => setFile(null)}
                aria-label="Dosyayı kaldır"
                className="ml-2 text-ink-subtle hover:text-ink"
              >
                ×
              </button>
            </span>
          )}
        </div>
        <p className="mt-2 text-[12px] text-ink-subtle">
          Metin yapıştırın veya .docx/.pdf yükleyin. İkisi de verilirse dosya kullanılır.
        </p>

        <div className="mt-5">
          <Button onClick={onReview} disabled={!canReview}>
            {loading ? (
              <>
                <Icon name="spinner" className="animate-spin text-[15px]" /> İnceleniyor…
              </>
            ) : (
              "İncele"
            )}
          </Button>
        </div>
      </Card>

      {loading && <GenerationSkeleton label="Sözleşme KVKK m.12 kontrol listesine göre inceleniyor…" />}

      {result && !loading && <ReviewReport result={result} client={client} onPrint={onPrint} />}
    </div>
  );
}

function ReviewReport({
  result,
  client,
  onPrint,
}: {
  result: DpaReviewResult;
  client: Client | null;
  onPrint: () => void;
}) {
  return (
    <div className="space-y-5">
      <Card title="Özet" icon={<Icon name="clipboard" className="text-[18px]" />}>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="ok">{result.uygun} Uygun</StatusBadge>
          <StatusBadge tone="danger">{result.eksik} Eksik</StatusBadge>
          <StatusBadge tone="warning">{result.yetersiz} Yetersiz</StatusBadge>
          {result.kirmiziBayrak > 0 && (
            <StatusBadge tone="danger">{result.kirmiziBayrak} Kırmızı Bayrak</StatusBadge>
          )}
        </div>
      </Card>

      <div className="space-y-4">
        {result.bulgular.map((b) => (
          <div
            key={b.maddeId}
            className={cn(
              "border border-border bg-surface p-5 shadow-[var(--shadow-card)]",
              b.kirmiziBayrak && "border-l-2 border-l-danger",
            )}
          >
            <div className="flex flex-wrap items-center gap-2.5">
              <h3 className="font-display text-[15px] font-semibold text-ink">{b.baslik}</h3>
              <StatusBadge tone={TONE[b.durum]}>{LABEL[b.durum]}</StatusBadge>
              {b.kirmiziBayrak && <StatusBadge tone="danger">Kırmızı bayrak</StatusBadge>}
              <span className="text-[12px] text-ink-muted">{b.kvkkRef}</span>
            </div>

            {b.alinti && (
              <blockquote className="mt-3 border-l-2 border-border-strong pl-3 text-[13px] italic text-ink-muted">
                Sözleşmeden: &ldquo;{b.alinti}&rdquo;
              </blockquote>
            )}

            <p className="mt-3 text-[13.5px] leading-relaxed text-ink">{b.gerekce}</p>

            {b.durum !== "var" && b.oneri && (
              <div className="mt-3 bg-surface-2 p-3">
                <p className="mb-1 text-[12px] font-medium text-ink-muted">Önerilen düzeltme</p>
                <p className="select-all text-[13px] text-ink">{b.oneri}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <p className="text-[12px] text-ink-subtle">{result.disclaimer}</p>

      <Button variant="secondary" onClick={onPrint} disabled={!client}>
        <Icon name="file" className="text-[15px]" /> Yazdır / PDF
      </Button>
    </div>
  );
}

function buildReportMarkdown(result: DpaReviewResult, clientName: string): string {
  const lines: string[] = [`# DPA İnceleme Raporu — ${clientName}`, ""];
  lines.push(
    `**Özet:** ${result.uygun} Uygun · ${result.eksik} Eksik · ${result.yetersiz} Yetersiz` +
      (result.kirmiziBayrak > 0 ? ` · ${result.kirmiziBayrak} Kırmızı Bayrak` : ""),
    "",
  );
  for (const b of result.bulgular) {
    lines.push(
      `## ${b.baslik} — ${LABEL[b.durum]}${b.kirmiziBayrak ? " (Kırmızı Bayrak)" : ""}`,
      `_${b.kvkkRef}_`,
      "",
    );
    if (b.alinti) lines.push(`> Sözleşmeden: "${b.alinti}"`, "");
    lines.push(b.gerekce, "");
    if (b.durum !== "var" && b.oneri) lines.push(`**Önerilen düzeltme:** ${b.oneri}`, "");
  }
  lines.push("---", result.disclaimer);
  return lines.join("\n");
}
