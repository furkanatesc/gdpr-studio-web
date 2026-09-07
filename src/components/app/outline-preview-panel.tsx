"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { DocumentOutput } from "@/components/app/document-output";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import type { GenerateResponse } from "@/lib/types";

/*
  Genel "yapı outline" önizleme paneli — dpia/dpa gibi kullanıcının gövde alanı
  DÜZENLEMEDİĞİ (içerik envanterden sunucu-türevli) belgeler için. Sağ panelde,
  üretilecek belgenin bölüm iskeletini Değerlendir'den tohumlanmış şekilde gösterir;
  "Üret"e basınca gerçek LLM metni (DocumentOutput) yerini alır. Outline deterministik
  ve statik yapıdadır (aydınlatma/ihlal'deki alan-sürümlü canlı iskeletin hafif hâli),
  taslaktır, indirilemez.
*/

export type OutlineSection = { no: string; title: string; body: ReactNode };

export function OutlinePreviewPanel({
  ready,
  notReadyHint,
  sections,
  badges,
  result,
  streaming,
  loading,
  actions,
}: {
  ready: boolean;
  notReadyHint: string;
  sections: OutlineSection[];
  badges?: ReactNode;
  result: GenerateResponse | null;
  streaming: boolean;
  loading: boolean;
  actions: ReactNode;
}) {
  if (result) return <DocumentOutput result={result} streaming={streaming} actions={actions} />;
  if (loading) return <GenerationSkeleton label="Avukat-dili metin üretiliyor…" />;

  return (
    <div className="border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5 text-[13px] font-medium text-ink-muted">
        <Icon name="file" className="text-[16px]" /> Yapı önizlemesi — taslak
      </div>

      {!ready ? (
        <p className="px-6 py-10 text-center text-[13px] text-ink-muted">{notReadyHint}</p>
      ) : (
        <>
          {badges && (
            <div className="flex flex-wrap items-center gap-2 border-b border-border bg-surface-2 px-5 py-3">
              {badges}
            </div>
          )}
          <div className="space-y-5 px-6 py-5">
            {sections.map((s) => (
              <section key={s.no}>
                <h3 className="font-display text-[15px] text-ink">
                  <span className="text-accent-strong">{s.no}.</span> {s.title}
                </h3>
                <p className="mt-1.5 text-[14px] leading-[1.7] text-ink">{s.body}</p>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
