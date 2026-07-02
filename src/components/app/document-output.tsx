"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { renderMarkdown } from "@/lib/markdown";
import type { GenerateResponse } from "@/lib/types";

export function DocumentOutput({
  result,
  streaming = false,
}: {
  result: GenerateResponse;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(result.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    });
  }

  return (
    <div className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface shadow-[var(--shadow-card)]">
      <header className="flex items-center justify-between border-b border-border px-5 py-3.5">
        {streaming ? (
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
            <span className="h-2 w-2 animate-pulse rounded-full bg-accent" /> Yazılıyor…
          </div>
        ) : (
          <div className="flex items-center gap-2 text-[13px] font-medium text-ink">
            <Icon name="check-circle" className="text-[16px] text-[color:var(--ok)]" /> Doküman hazır
          </div>
        )}
        <Button variant="secondary" size="sm" onClick={copy} disabled={streaming}>
          <Icon name={copied ? "check" : "copy"} className="text-[15px]" />
          {copied ? "Kopyalandı" : "Kopyala"}
        </Button>
      </header>

      {/* Grounding şeffaflık paneli */}
      {result.grounding.length > 0 && (
        <div className="border-b border-border bg-surface-2 px-5 py-3.5">
          <p className="eyebrow mb-2">Dayanak · Envanter kayıtları</p>
          <div className="flex flex-wrap gap-1.5">
            {result.grounding.map((g) => (
              <span
                key={g.kategori}
                className="rounded-pill border border-border-strong bg-surface px-2.5 py-1 text-[12px] text-ink-muted"
                title={g.hukukiSebepler.join(", ")}
              >
                <strong className="font-medium text-ink">{g.kategori}</strong>
                {" · "}
                {g.hukukiSebepler[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      <div
        className="doc-prose px-6 py-6"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(result.text) }}
      />

      {!streaming && result.disclaimer && (
        <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-[var(--radius)] border border-warning/40 border-l-2 border-l-danger bg-warning-soft px-4 py-3 text-[13px] leading-relaxed text-warning">
          <Icon
            name="shield-alert"
            className="mt-0.5 flex-shrink-0 text-[15px] text-danger"
          />
          <span>{result.disclaimer}</span>
        </div>
      )}

      <footer className="border-t border-border px-5 py-2.5 text-[11px] text-ink-subtle">
        {streaming ? (
          "Akış sürüyor…"
        ) : (
          <>
            Model: {result.model}
            {result.usage &&
              ` · ${result.usage.inputTokens + result.usage.outputTokens} token`}
          </>
        )}
      </footer>
    </div>
  );
}
