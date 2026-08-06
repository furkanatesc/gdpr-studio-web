"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { PageHeader } from "@/components/app/page-header";
import { DocumentOutput } from "@/components/app/document-output";
import { Field, Select, Input, Textarea, Button, Card } from "@/components/ui";
import { Icon, type IconName } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StatusBadge } from "@/components/app/status-badge";
import {
  listClients,
  getClient,
  getClientInventory,
  prepareIhlal,
  generateIhlalStream,
  ihlalDocx,
  SECTOR_LABELS,
  usingRealApi,
  type Client,
  type InventoryRow,
  type IhlalOlay,
  type IhlalPrepareResult,
} from "@/lib/api";
import { useDocumentStream, useDocumentDownload } from "@/components/app/use-document-stream";
import { GenerationWarning } from "@/components/app/generation-warning";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { openPrintView, buildCover, formatTrDate } from "@/lib/print";

/*
  İhlal bildirimi akışı: müvekkil seç → olay formu → Değerlendir (72s + kurul/ilgili
  kişi eşik testi) → koşullu üret (kurul her zaman gerekli, ilgili kişi metni
  gerekliyse öne çıkar) → stream → docx/PDF. dpia-client.tsx'in müvekkil seçici +
  prepare/geçit deseni izlenir. KALICILIK YOK — Belge Geçmişi'ne kaydedilmez.
*/

const IHLAL_TURLERI = [
  "Yetkisiz erişim",
  "Veri kaybı",
  "Yanlış ifşa",
  "Fidye / şifreleme",
  "Diğer",
];

const BOS_OLAY: IhlalOlay = {
  tespit: "",
  tur: IHLAL_TURLERI[0],
  etkilenenIndeksler: [],
  kimlikFinansal: false,
  sifreli: false,
  kisiSayisi: 0,
  nasil: "",
  onlemler: "",
};

const SINYAL_LABELS: Record<string, string> = {
  ozel_nitelikli: "Özel nitelikli veri etkilendi",
  kimlik_finansal: "Kimlik / finansal veri etkilendi",
  buyuk_olcek: "Büyük ölçekli (1000+ kişi)",
  sifresiz: "Etkilenen veriler şifresiz",
};

function rowLabel(r: InventoryRow): string {
  const baslik = [r.departman, r.is_sureci, r.alt_surec].filter(Boolean).join(" / ") || "(isimsiz süreç)";
  return r.kisi_grubu ? `${baslik} — ${r.kisi_grubu}` : baslik;
}

export function IhlalClient() {
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
      eyebrow="Araçlar / İhlal Bildirimi"
      title="İhlal Bildirimi"
      description="Veri ihlali olayını değerlendirin; Kurul'a ve gerekiyorsa ilgili kişilere sunulacak bildirim taslaklarını hazırlayın."
    />
  );

  if (!usingRealApi)
    return (
      <div>
        {header}
        <p className="mt-6 text-[14px] text-ink-muted">
          İhlal bildirimi üretimi gerçek API bağlantısı gerektirir; bu ortamda devre dışı.
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
            İhlal bildirimi hazırlamak için önce bir müvekkil oluşturun.
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

          {selectedId && <IhlalFlow key={selectedId} clientId={selectedId} />}
        </div>
      )}
    </div>
  );
}

function IhlalFlow({ clientId }: { clientId: string }) {
  const toast = useToast();
  const [olay, setOlay] = useState<IhlalOlay>(BOS_OLAY);
  const [client, setClient] = useState<Client | null>(null);
  const [rows, setRows] = useState<InventoryRow[] | null>(null);

  const [preparing, setPreparing] = useState(false);
  const [prepareError, setPrepareError] = useState<string | null>(null);
  const [prepareResult, setPrepareResult] = useState<IhlalPrepareResult | null>(null);

  const kurul = useDocumentStream();
  const kurulDownload = useDocumentDownload();
  const ilgiliKisi = useDocumentStream();
  const ilgiliKisiDownload = useDocumentDownload();

  useEffect(() => {
    getClient(clientId).then(setClient).catch(() => setClient(null));
  }, [clientId]);

  useEffect(() => {
    getClientInventory(clientId)
      .then((d) => setRows(d.rows))
      .catch((e) => {
        setRows([]);
        toast(e instanceof Error ? e.message : "Envanter yüklenemedi.");
      });
  }, [clientId, toast]);

  // Olayı güncelleyen tek giriş noktası — "Değerlendir" sonrası form değişirse
  // geçit paneli (ve varsa üretilmiş çıktılar) artık üretim girdisiyle tutarsız
  // olur; bu yüzden her değişiklikte prepareResult geçersiz kılınır.
  function updateOlay(updater: (prev: IhlalOlay) => IhlalOlay) {
    setOlay(updater);
    if (prepareResult) {
      setPrepareResult(null);
      setPrepareError(null);
      kurul.reset();
      ilgiliKisi.reset();
    }
  }

  function toggleRow(i: number) {
    updateOlay((prev) => ({
      ...prev,
      etkilenenIndeksler: prev.etkilenenIndeksler.includes(i)
        ? prev.etkilenenIndeksler.filter((x) => x !== i)
        : [...prev.etkilenenIndeksler, i],
    }));
  }

  async function onPrepare() {
    setPreparing(true);
    setPrepareError(null);
    setPrepareResult(null);
    kurul.reset();
    ilgiliKisi.reset();
    try {
      const res = await prepareIhlal(clientId, olay);
      setPrepareResult(res);
    } catch (e) {
      setPrepareError(e instanceof Error ? e.message : "Değerlendirme başarısız.");
    } finally {
      setPreparing(false);
    }
  }

  function onGenerateKurul() {
    return kurul.generate(
      (h) => generateIhlalStream(clientId, { ...olay, bildirimTuru: "kurul" }, h),
      "Kurul bildirim formu hazır",
    );
  }
  function onGenerateIlgiliKisi() {
    return ilgiliKisi.generate(
      (h) => generateIhlalStream(clientId, { ...olay, bildirimTuru: "ilgili_kisi" }, h),
      "İlgili kişi bildirim metni hazır",
    );
  }

  function onDownloadKurul() {
    if (!kurul.result) return Promise.resolve();
    return kurulDownload.download(
      () => ihlalDocx(clientId, kurul.result!.text, "Kurul Bildirim Formu"),
      "ihlal-kurul-bildirimi.docx",
    );
  }
  function onDownloadIlgiliKisi() {
    if (!ilgiliKisi.result) return Promise.resolve();
    return ilgiliKisiDownload.download(
      () => ihlalDocx(clientId, ilgiliKisi.result!.text, "İlgili Kişiye Bildirim Metni"),
      "ihlal-ilgili-kisi-bildirimi.docx",
    );
  }

  function onPrintKurul() {
    if (!kurul.result || !client) return;
    const cover = buildCover(client, "ihlal", { tarih: formatTrDate(), versiyon: "Taslak" });
    openPrintView({ docType: "ihlal", content: kurul.result.text, cover });
  }
  function onPrintIlgiliKisi() {
    if (!ilgiliKisi.result || !client) return;
    const cover = buildCover(client, "ihlal", { tarih: formatTrDate(), versiyon: "Taslak" });
    openPrintView({ docType: "ihlal", content: ilgiliKisi.result.text, cover });
  }

  // Üretim (stream) sürerken form kilitlenir — useDocumentStream.reset() in-flight
  // isteği iptal etmez, bu yüzden form düzenlemesi orphan-stream/bayat içerik
  // riski doğurur. Form kilitliyken updateOlay hiç tetiklenmez.
  const busy = kurul.loading || ilgiliKisi.loading;

  const saatBadge = (() => {
    if (!prepareResult || prepareResult.saatKalan === null) return null;
    const saat = Math.round(prepareResult.saatKalan);
    if (prepareResult.sureAsildi) {
      return { tone: "danger" as const, label: `SÜRE AŞILDI (${Math.abs(saat)} saat gecikme)` };
    }
    return {
      tone: saat <= 24 ? ("warning" as const) : ("ok" as const),
      label: `Kalan süre: ${saat} saat`,
    };
  })();

  return (
    <div className="mt-5 space-y-5">
      <Card title="Olay Bilgileri" icon={<Icon name="shield-alert" className="text-[18px]" />}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tespit tarihi ve saati" required>
            <Input
              type="datetime-local"
              value={olay.tespit}
              onChange={(e) => updateOlay((p) => ({ ...p, tespit: e.target.value }))}
              disabled={busy}
            />
          </Field>
          <Field label="İhlal türü" required>
            <Select
              value={olay.tur}
              onChange={(e) => updateOlay((p) => ({ ...p, tur: e.target.value }))}
              disabled={busy}
            >
              {IHLAL_TURLERI.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Etkilenen yaklaşık kişi sayısı">
            <Input
              type="number"
              min={0}
              value={olay.kisiSayisi}
              onChange={(e) =>
                updateOlay((p) => ({ ...p, kisiSayisi: Math.max(0, Number(e.target.value) || 0) }))
              }
              disabled={busy}
            />
          </Field>
          <div className="flex flex-wrap items-center gap-5">
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={olay.kimlikFinansal}
                onChange={(e) => updateOlay((p) => ({ ...p, kimlikFinansal: e.target.checked }))}
                disabled={busy}
                className="h-4 w-4 flex-shrink-0 border border-border accent-accent"
              />
              Kimlik / finansal veri etkilendi
            </label>
            <label className="flex items-center gap-2 text-[13px] text-ink">
              <input
                type="checkbox"
                checked={olay.sifreli}
                onChange={(e) => updateOlay((p) => ({ ...p, sifreli: e.target.checked }))}
                disabled={busy}
                className="h-4 w-4 flex-shrink-0 border border-border accent-accent"
              />
              Etkilenen veriler şifreli / anonim
            </label>
          </div>
        </div>

        <div className="mt-4">
          <Field label="Etkilenen süreçler">
            {rows === null ? (
              <p className="text-[13px] text-ink-muted">Envanter yükleniyor…</p>
            ) : rows.length === 0 ? (
              <p className="text-[13px] text-ink-muted">
                Envanterde süreç yok.{" "}
                <Link href="/app/envanter" className="text-accent-strong hover:underline">
                  Envanteri doldurun ↗
                </Link>
              </p>
            ) : (
              <div className="max-h-64 space-y-1.5 overflow-y-auto border border-border p-3">
                {rows.map((r, i) => (
                  <label key={i} className="flex items-start gap-2 text-[13px] text-ink">
                    <input
                      type="checkbox"
                      checked={olay.etkilenenIndeksler.includes(i)}
                      onChange={() => toggleRow(i)}
                      disabled={busy}
                      className="mt-0.5 h-4 w-4 flex-shrink-0 border border-border accent-accent"
                    />
                    {rowLabel(r)}
                  </label>
                ))}
              </div>
            )}
          </Field>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="İhlal nasıl gerçekleşti">
            <Textarea
              value={olay.nasil}
              onChange={(e) => updateOlay((p) => ({ ...p, nasil: e.target.value }))}
              disabled={busy}
              rows={4}
            />
          </Field>
          <Field label="Alınan / alınacak önlemler">
            <Textarea
              value={olay.onlemler}
              onChange={(e) => updateOlay((p) => ({ ...p, onlemler: e.target.value }))}
              disabled={busy}
              rows={4}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Button onClick={onPrepare} disabled={preparing || busy || !olay.tespit}>
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
      </Card>

      {prepareResult && (
        <Card title="Değerlendirme Sonucu" icon={<Icon name="warning" className="text-[18px]" />}>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="danger">Kurul Bildirimi: GEREKLİ</StatusBadge>
            {saatBadge && <StatusBadge tone={saatBadge.tone}>{saatBadge.label}</StatusBadge>}
            <StatusBadge tone={prepareResult.ilgiliKisiGerekli ? "danger" : "neutral"}>
              İlgili Kişi Bildirimi: {prepareResult.ilgiliKisiGerekli ? "GEREKLİ" : "GEREKMEYEBİLİR"}
            </StatusBadge>
            <StatusBadge tone={prepareResult.ozelNitelikliVar ? "warning" : "neutral"}>
              Özel nitelikli veri: {prepareResult.ozelNitelikliVar ? "Var" : "Yok"}
            </StatusBadge>
          </div>

          {prepareResult.sureAsildi && (
            <div className="mt-4 flex items-start gap-2.5 border border-danger/40 border-l-2 border-l-danger bg-danger-soft px-4 py-3 text-[13px] text-danger">
              <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[16px]" />
              <span>
                <strong className="font-medium">SÜRE AŞILDI</strong> — 72 saatlik bildirim süresi
                geçti; gecikmeyi gerekçelendirin.
              </span>
            </div>
          )}

          {prepareResult.ilgiliKisiSinyaller.length > 0 && (
            <div className="mt-4">
              <p className="eyebrow mb-2">İlgili kişi bildirimini gerektiren sinyaller</p>
              <ul className="list-inside list-disc text-[13px] text-ink-muted">
                {prepareResult.ilgiliKisiSinyaller.map((s) => (
                  <li key={s}>{SINYAL_LABELS[s] ?? s}</li>
                ))}
              </ul>
            </div>
          )}
          {prepareResult.ilgiliKisiMuafiyet && (
            <p className="mt-3 text-[13px] text-ink-muted">
              Etkilenen veriler şifreli/anonim olduğundan ilgili kişi bildirimi muafiyet
              kapsamında değerlendirilebilir; nihai karar avukata aittir.
            </p>
          )}

          <div className="mt-5 flex items-start gap-2.5 border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-4 py-3 text-[13px] text-ink">
            <Icon name="shield-alert" className="mt-0.5 flex-shrink-0 text-[16px] text-warning" />
            <span>
              Bu değerlendirme otomatik ve taslak niteliğindedir; bildirim kararı ve gönderimi
              avukat onayına tabidir.
            </span>
          </div>
        </Card>
      )}

      {prepareResult && (
        <GenerateSection
          title="Kurul Bildirim Formu"
          icon="clipboard"
          buttonLabel="Kurul Bildirim Formu Üret"
          variant="primary"
          stream={kurul}
          onGenerate={onGenerateKurul}
          onDownload={onDownloadKurul}
          downloading={kurulDownload.downloading}
          onPrint={onPrintKurul}
          canPrint={!!client}
        />
      )}

      {prepareResult && (
        <GenerateSection
          title="İlgili Kişiye Bildirim Metni"
          icon="check-circle"
          buttonLabel={
            prepareResult.ilgiliKisiGerekli ? "İlgili Kişi Metni Üret" : "Yine de İlgili Kişi Metni Üret"
          }
          variant={prepareResult.ilgiliKisiGerekli ? "primary" : "secondary"}
          stream={ilgiliKisi}
          onGenerate={onGenerateIlgiliKisi}
          onDownload={onDownloadIlgiliKisi}
          downloading={ilgiliKisiDownload.downloading}
          onPrint={onPrintIlgiliKisi}
          canPrint={!!client}
        />
      )}
    </div>
  );
}

function GenerateSection({
  title,
  icon,
  buttonLabel,
  variant,
  stream,
  onGenerate,
  onDownload,
  downloading,
  onPrint,
  canPrint,
}: {
  title: string;
  icon: IconName;
  buttonLabel: string;
  variant: "primary" | "secondary";
  stream: ReturnType<typeof useDocumentStream>;
  onGenerate: () => Promise<void>;
  onDownload: () => Promise<void>;
  downloading: boolean;
  onPrint: () => void;
  canPrint: boolean;
}) {
  const { loading, streaming, result, error, quotaBlock, warning } = stream;
  return (
    <Card title={title} icon={<Icon name={icon} className="text-[18px]" />}>
      <Button variant={variant} onClick={onGenerate} disabled={loading}>
        {loading ? (
          <>
            <Icon name="spinner" className="animate-spin text-[15px]" /> Üretiliyor…
          </>
        ) : (
          buttonLabel
        )}
      </Button>

      {quotaBlock && (
        <div className="mt-4 flex items-start gap-2.5 border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-5 py-4 text-sm">
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

      {error && (
        <div className="mt-4 flex items-start gap-2.5 border border-danger/40 border-l-2 border-l-danger bg-danger-soft px-5 py-4 text-sm text-danger">
          <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[16px]" />
          <span>
            <strong className="font-medium">Üretim başarısız.</strong> {error}
          </span>
        </div>
      )}

      {warning && (
        <div className="mt-4">
          <GenerationWarning warning={warning} />
        </div>
      )}

      {loading && !result && (
        <div className="mt-4">
          <GenerationSkeleton />
        </div>
      )}

      {result && (
        <>
          <div className="mt-4">
            <DocumentOutput result={result} streaming={streaming} />
          </div>
          {!streaming && (
            <div className="mt-3 flex items-center gap-3">
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
              <Button variant="secondary" onClick={onPrint} disabled={!canPrint}>
                <Icon name="file" className="text-[15px]" /> PDF / Yazdır
              </Button>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
