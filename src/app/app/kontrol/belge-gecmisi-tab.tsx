"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, Select, Button } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { useDocumentDownload } from "@/components/app/use-document-stream";
import { renderMarkdown } from "@/lib/markdown";
import { openPrintView, buildCover, formatTrDate, type PrintDocType } from "@/lib/print";
import {
  documentVersionDocx,
  getClient,
  getClientDocument,
  getClientDocuments,
  getDocumentVersion,
  getDocumentVersions,
  listClients,
  publishDocument,
  usingRealApi,
  type Client,
  type ClientDocumentMeta,
  type ClientDocumentVersionMeta,
} from "@/lib/api";

function toPrintDocType(t: ClientDocumentMeta["docType"]): PrintDocType {
  return t === "aydinlatma" || t === "cerez" || t === "kayit" || t === "dpia" ? t : "kayit";
}

type OpenDoc = {
  title: string;
  coverTitle: string;
  content: string;
  docType: PrintDocType;
  versiyon: string;
  tarih: string;
};

const DOC_TYPE_LABELS: Record<ClientDocumentMeta["docType"], string> = {
  aydinlatma: "Aydınlatma Metni",
  cerez: "Çerez Politikası",
  kayit: "İşleme Kaydı",
  dpa: "Veri İşleme Sözleşmesi",
  dpia: "Etki Değerlendirmesi",
  ihlal: "İhlal Bildirimi",
};
const ACTIVE_TYPES: ClientDocumentMeta["docType"][] = ["aydinlatma", "cerez", "kayit", "dpia"];

function pct(v: number | null): string {
  return v === null ? "—" : `%${Math.round(v * 100)}`;
}

function fmtDate(iso: string | null): string {
  return iso ? new Date(iso).toLocaleDateString("tr-TR") : "—";
}

export function BelgeGecmisiTab() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientId, setClientId] = useState("");
  const [client, setClient] = useState<Client | null>(null);
  const [docs, setDocs] = useState<ClientDocumentMeta[]>([]);
  const [open, setOpen] = useState<OpenDoc | null>(null);
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [publishing, setPublishing] = useState<Set<string>>(new Set());
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [versions, setVersions] = useState<Record<string, ClientDocumentVersionMeta[]>>({});
  const { downloading, download } = useDocumentDownload();
  const [prevClientId, setPrevClientId] = useState(clientId);
  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setOpen(null);
    setClient(null);
    setDocs([]);
    setNoteDrafts({});
    setPublishing(new Set());
    setPublishErrors({});
    setExpanded(new Set());
    setVersions({});
  }

  useEffect(() => {
    if (!usingRealApi) return;
    listClients().then((cs) => {
      setClients(cs);
      setClientId((id) => id || cs[0]?.id || "");
    });
  }, []);

  useEffect(() => {
    if (!clientId) return;
    getClientDocuments(clientId)
      .then(setDocs)
      .catch(() => setDocs([]));
    getClient(clientId)
      .then(setClient)
      .catch(() => setClient(null));
  }, [clientId]);

  const byType = useMemo(() => {
    const m: Record<string, ClientDocumentMeta[]> = {};
    for (const d of docs) (m[d.docType] ??= []).push(d);
    return m;
  }, [docs]);

  function onPublish(d: ClientDocumentMeta) {
    const note = (noteDrafts[d.id] ?? "").trim();
    setPublishing((prev) => new Set(prev).add(d.id));
    setPublishErrors((prev) => ({ ...prev, [d.id]: "" }));
    publishDocument(clientId, d.id, note || null)
      .then(() => {
        setNoteDrafts((prev) => ({ ...prev, [d.id]: "" }));
        setPublishErrors((prev) => ({ ...prev, [d.id]: "" }));
        // Refresh sonrası hatası yayınlamayı geçersiz kılmaz; sessizce yut.
        Promise.all([
          getClientDocuments(clientId).then(setDocs),
          versions[d.id]
            ? getDocumentVersions(clientId, d.id).then((vs) =>
                setVersions((prev) => ({ ...prev, [d.id]: vs })),
              )
            : Promise.resolve(),
        ]).catch(() => {});
      })
      .catch((e) =>
        setPublishErrors((prev) => ({
          ...prev,
          [d.id]: e instanceof Error ? e.message : "Yayınlama başarısız.",
        })),
      )
      .finally(() =>
        setPublishing((prev) => {
          const next = new Set(prev);
          next.delete(d.id);
          return next;
        }),
      );
  }

  function onToggleVersions(d: ClientDocumentMeta) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(d.id)) {
        next.delete(d.id);
      } else {
        next.add(d.id);
        if (!versions[d.id]) {
          getDocumentVersions(clientId, d.id)
            .then((vs) => setVersions((prev2) => ({ ...prev2, [d.id]: vs })))
            .catch(() => setVersions((prev2) => ({ ...prev2, [d.id]: [] })));
        }
      }
      return next;
    });
  }

  function onViewVersion(d: ClientDocumentMeta, v: ClientDocumentVersionMeta) {
    getDocumentVersion(clientId, d.id, v.id).then((full) =>
      setOpen({
        title: `${d.title} · v${v.version}`,
        coverTitle: d.title,
        content: full.content,
        docType: toPrintDocType(d.docType),
        versiyon: String(v.version),
        tarih: formatTrDate(v.publishedAt),
      }),
    );
  }

  function onPrint() {
    if (!open || !client) return;
    const cover = buildCover(client, open.docType, {
      ilgiliKisi: open.coverTitle,
      site: open.coverTitle,
      tarih: open.tarih,
      versiyon: open.versiyon,
    });
    openPrintView({ docType: open.docType, content: open.content, cover });
  }

  if (!usingRealApi)
    return <p className="mt-6 text-[14px] text-ink-muted">Belge geçmişi gerçek API bağlantısı gerektirir.</p>;
  if (clients === null) return <p className="mt-6 text-[13px] text-ink-muted">Yükleniyor…</p>;

  return (
    <div className="mt-6 space-y-6">
      <section className="border border-border bg-surface p-6">
        <Field label="Müvekkil">
          <Select value={clientId} onChange={(e) => setClientId(e.target.value)}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </Field>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(Object.keys(DOC_TYPE_LABELS) as ClientDocumentMeta["docType"][]).map((t) => {
          const items = byType[t] ?? [];
          const active = ACTIVE_TYPES.includes(t);
          return (
            <div key={t} className="border border-border bg-surface p-5">
              <h3 className="font-display text-[15px] text-ink">{DOC_TYPE_LABELS[t]}</h3>
              {!active ? (
                <p className="mt-3 text-[12.5px] text-ink-subtle">Yakında</p>
              ) : items.length === 0 ? (
                <p className="mt-3 text-[12.5px] text-ink-muted">Henüz belge üretilmedi.</p>
              ) : (
                <ul className="mt-3 flex flex-col gap-2">
                  {items.map((d) => (
                    <li key={d.id} className="border border-border-strong">
                      <button
                        type="button"
                        onClick={() =>
                          getClientDocument(clientId, d.id).then((full) =>
                            setOpen({
                              title: full.title,
                              coverTitle: full.title,
                              content: full.content,
                              docType: toPrintDocType(full.docType),
                              versiyon: "Taslak",
                              tarih: formatTrDate(),
                            }),
                          )
                        }
                        className="flex w-full flex-wrap items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-surface-2"
                      >
                        <span className="text-[13px] text-ink">{d.title}</span>
                        <span className="flex gap-2 font-mono text-[11px] text-ink-subtle">
                          <span title="Zorunlu unsur tamlığı">Tamlık {pct(d.scoreCompleteness)}</span>
                          <span title="Uyum maddeleri">Uyum {pct(d.scoreCompliance)}</span>
                        </span>
                      </button>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-3 py-2">
                        <span className="text-[11px] text-ink-subtle">
                          {d.latestVersion
                            ? `v${d.latestVersion} · ${fmtDate(d.latestPublishedAt)}`
                            : "Yayınlanmamış taslak"}
                        </span>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={noteDrafts[d.id] ?? ""}
                            onChange={(e) =>
                              setNoteDrafts((prev) => ({ ...prev, [d.id]: e.target.value }))
                            }
                            placeholder="Not (opsiyonel)"
                            aria-label="Yayın notu"
                            className="h-8 w-32 border border-border bg-surface px-2 text-[12px] text-ink outline-none focus:border-accent sm:w-40"
                          />
                          <button
                            type="button"
                            disabled={publishing.has(d.id)}
                            onClick={() => onPublish(d)}
                            className="whitespace-nowrap border border-border-strong px-3 py-1.5 text-[12px] text-ink transition-colors hover:bg-surface-2 disabled:opacity-50"
                          >
                            {publishing.has(d.id) ? "Yayınlanıyor…" : "Yayınla"}
                          </button>
                          <button
                            type="button"
                            onClick={() => onToggleVersions(d)}
                            aria-expanded={expanded.has(d.id)}
                            className="whitespace-nowrap text-[12px] text-ink-subtle hover:text-ink"
                          >
                            {expanded.has(d.id) ? "Sürümler ▲" : "Sürümler ▼"}
                          </button>
                        </div>
                      </div>
                      {publishErrors[d.id] && (
                        <p className="border-t border-border px-3 py-1.5 text-[11px] text-danger">
                          {publishErrors[d.id]}
                        </p>
                      )}

                      {expanded.has(d.id) && (
                        <div className="border-t border-border px-3 py-2">
                          {!versions[d.id] ? (
                            <p className="text-[12px] text-ink-muted">Yükleniyor…</p>
                          ) : versions[d.id].length === 0 ? (
                            <p className="text-[12px] text-ink-muted">Henüz yayınlanmış sürüm yok.</p>
                          ) : (
                            <ul className="flex flex-col gap-1.5">
                              {versions[d.id].map((v) => (
                                <li
                                  key={v.id}
                                  className="flex flex-wrap items-center justify-between gap-2 text-[12px] text-ink-muted"
                                >
                                  <span>
                                    v{v.version} · {fmtDate(v.publishedAt)} · {v.note ?? "—"}
                                  </span>
                                  <span className="flex gap-3">
                                    <button
                                      type="button"
                                      onClick={() => onViewVersion(d, v)}
                                      className="text-accent-strong hover:underline"
                                    >
                                      Görüntüle
                                    </button>
                                    <button
                                      type="button"
                                      disabled={downloading}
                                      onClick={() =>
                                        download(
                                          () => documentVersionDocx(clientId, v.id),
                                          `${d.docType}-v${v.version}.docx`,
                                        )
                                      }
                                      className="text-accent-strong hover:underline disabled:opacity-50"
                                    >
                                      .docx
                                    </button>
                                  </span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {open && (
        <section className="border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-display text-[16px] text-ink">{open.title}</h3>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" onClick={onPrint} disabled={!client}>
                <Icon name="file" className="text-[15px]" /> PDF / Yazdır
              </Button>
              <button type="button" onClick={() => setOpen(null)} className="text-[12px] text-ink-subtle hover:text-ink">
                Kapat ✕
              </button>
            </div>
          </div>
          <div
            className="doc-prose max-w-none text-[14px] leading-relaxed"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(open.content) }}
          />
        </section>
      )}
    </div>
  );
}
