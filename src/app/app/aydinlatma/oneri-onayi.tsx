"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, MultiSelect } from "@/components/ui";
import { Icon } from "@/components/ui/icon";
import { classifySections, FIELD_LABELS, type SectionField } from "@/lib/section-classify";
import type { AydinlatmaSection, EnrichedSection } from "@/lib/api";

export function OneriOnayi({
  sections,
  edited,
  clientId,
  onChange,
}: {
  sections: EnrichedSection[];
  edited: AydinlatmaSection[];
  clientId: string;
  onChange: (sectionIndex: number, field: SectionField, values: string[]) => void;
}) {
  const { kararlar, eksikler, hazirlar } = classifySections(sections);
  const [hazirAcik, setHazirAcik] = useState(false);
  const [acikEksik, setAcikEksik] = useState<SectionField | null>(null);
  const eksikHucre = eksikler.reduce((a, e) => a + e.sections.length, 0);

  return (
    <Card title="Öneri onayı" icon={<Icon name="clipboard" className="text-[18px]" />}>
      <p className="mb-5 text-[13px] text-ink-muted">
        {sections.length} bölüm · {kararlar.length} karar · {eksikHucre} eksik
      </p>

      {/* Blok 1 — karar gerektirenler */}
      <section>
        <h3 className="eyebrow mb-3">Karar gerektirenler ({kararlar.length})</h3>
        {kararlar.length === 0 ? (
          <p className="text-[13px] text-ink-muted">
            Karar gerektiren alan yok — doğrudan üretebilirsiniz.
          </p>
        ) : (
          <div className="space-y-4">
            {kararlar.map((k) => (
              <div key={`${k.sectionIndex}-${k.field}`} className="border border-border p-4">
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="font-display text-[14.5px] text-ink">{k.isSureci}</span>
                  <span className="text-[12.5px] text-ink-muted">{FIELD_LABELS[k.field]}</span>
                </div>
                <MultiSelect
                  options={Array.from(new Set([...k.base, ...k.oneri]))}
                  value={edited[k.sectionIndex]?.[k.field] ?? k.base}
                  onChange={(v) => onChange(k.sectionIndex, k.field, v)}
                  ariaLabel={`${k.isSureci} — ${FIELD_LABELS[k.field]}`}
                  placeholder="Mevcut + öneriler; ekleyin/çıkarın…"
                />
                {k.oneri.length > 0 && (
                  <p className="mt-1 text-[11px] text-ink-subtle">Öneri: {k.oneri.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Blok 2 — eksikler */}
      {eksikler.length > 0 && (
        <section className="mt-8">
          <h3 className="eyebrow mb-3">Eksikler ({eksikHucre}) — envanterde doldurulmalı</h3>
          <div className="space-y-2">
            {eksikler.map((e) => (
              <div
                key={e.field}
                className="border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setAcikEksik(acikEksik === e.field ? null : e.field)}
                    className="flex items-center gap-2 text-left text-[13px] text-ink"
                    aria-expanded={acikEksik === e.field}
                  >
                    <Icon name="shield-alert" className="text-[15px] text-warning" />
                    <strong className="font-medium">{FIELD_LABELS[e.field]}</strong>
                    <span className="text-ink-muted">{e.sections.length} bölümde boş</span>
                  </button>
                  <Link
                    href={`/app/envanter?client=${clientId}`}
                    className="font-medium text-[12.5px] uppercase tracking-[0.08em] text-accent-strong hover:underline"
                  >
                    Envanter&apos;de düzelt ↗
                  </Link>
                </div>
                {acikEksik === e.field && (
                  <p className="mt-2 text-[12px] text-ink-muted">
                    {e.sections.map((s) => s.isSureci).join(" · ")}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Blok 3 — hazir */}
      {hazirlar.length > 0 && (
        <section className="mt-8">
          <button
            type="button"
            onClick={() => setHazirAcik(!hazirAcik)}
            className="eyebrow flex items-center gap-2 hover:text-ink"
            aria-expanded={hazirAcik}
          >
            Hazır ({hazirlar.reduce((a, h) => a + h.fields.length, 0)}) {hazirAcik ? "▲" : "▼"}
          </button>
          {hazirAcik && (
            <div className="mt-4 space-y-4">
              {hazirlar.map((h) => (
                <div key={h.sectionIndex} className="border border-border p-4">
                  <h4 className="font-display text-[14px] text-ink">{h.isSureci}</h4>
                  <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {h.fields.map((f) => (
                      <div key={f.field}>
                        <p className="mb-1 text-[12px] font-medium text-ink-muted">
                          {FIELD_LABELS[f.field]}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {f.values.map((v) => (
                            <span
                              key={v}
                              className="border border-border-strong bg-surface-2 px-2 py-0.5 text-[12px] text-ink-muted"
                            >
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </Card>
  );
}
