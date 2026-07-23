"use client";

import { useEffect, useMemo, useState } from "react";
import { Field, Select } from "@/components/ui";
import { renderMarkdown } from "@/lib/markdown";
import {
  getClientDocument,
  getClientDocuments,
  listClients,
  usingRealApi,
  type Client,
  type ClientDocument,
  type ClientDocumentMeta,
} from "@/lib/api";

const DOC_TYPE_LABELS: Record<ClientDocumentMeta["docType"], string> = {
  aydinlatma: "Aydınlatma Metni",
  cerez: "Çerez Politikası",
  kayit: "İşleme Kaydı",
  dpa: "Veri İşleme Sözleşmesi",
  dpia: "Etki Değerlendirmesi",
  ihlal: "İhlal Bildirimi",
};
const ACTIVE_TYPES: ClientDocumentMeta["docType"][] = ["aydinlatma", "cerez"];

function pct(v: number | null): string {
  return v === null ? "—" : `%${Math.round(v * 100)}`;
}

export function BelgeGecmisiTab() {
  const [clients, setClients] = useState<Client[] | null>(null);
  const [clientId, setClientId] = useState("");
  const [docs, setDocs] = useState<ClientDocumentMeta[]>([]);
  const [open, setOpen] = useState<ClientDocument | null>(null);
  const [prevClientId, setPrevClientId] = useState(clientId);
  if (clientId !== prevClientId) {
    setPrevClientId(clientId);
    setOpen(null);
    setDocs([]);
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
  }, [clientId]);

  const byType = useMemo(() => {
    const m: Record<string, ClientDocumentMeta[]> = {};
    for (const d of docs) (m[d.docType] ??= []).push(d);
    return m;
  }, [docs]);

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
                    <li key={d.id}>
                      <button
                        type="button"
                        onClick={() => getClientDocument(clientId, d.id).then(setOpen)}
                        className="flex w-full flex-wrap items-center justify-between gap-2 border border-border-strong px-3 py-2 text-left transition-colors hover:bg-surface-2"
                      >
                        <span className="text-[13px] text-ink">{d.title}</span>
                        <span className="flex gap-2 font-mono text-[11px] text-ink-subtle">
                          <span title="Zorunlu unsur tamlığı">Tamlık {pct(d.scoreCompleteness)}</span>
                          <span title="Uyum maddeleri">Uyum {pct(d.scoreCompliance)}</span>
                        </span>
                      </button>
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
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-[16px] text-ink">{open.title}</h3>
            <button type="button" onClick={() => setOpen(null)} className="text-[12px] text-ink-subtle hover:text-ink">
              Kapat ✕
            </button>
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
