"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { DocumentOutput } from "./document-output";
import { docByType } from "@/lib/catalog";
import { SCHEMAS, type FieldDef } from "@/lib/schemas";
import { generateDocStream } from "@/lib/api";
import type { DocType, GenerateResponse, GroundingRecord } from "@/lib/types";

function initialFields(type: DocType): Record<string, string> {
  const f: Record<string, string> = {};
  for (const card of SCHEMAS[type].cards) {
    for (const fd of card.fields ?? []) {
      if (fd.type === "select" && fd.options?.length) f[fd.key] = fd.options[0];
    }
  }
  return f;
}

export function DocFlow({ type }: { type: DocType }) {
  const meta = docByType(type);
  const schema = SCHEMAS[type];
  const [fields, setFields] = useState<Record<string, string>>(() => initialFields(type));
  const [tags, setTags] = useState<{ veriler: string[]; amaclar: string[] }>({
    veriler: [],
    amaclar: [],
  });
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<{ used: number; quota: number } | null>(null);

  const setField = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));
  const toggleTag = (group: "veriler" | "amaclar", v: string) =>
    setTags((t) => ({
      ...t,
      [group]: t[group].includes(v) ? t[group].filter((x) => x !== v) : [...t[group], v],
    }));

  async function onGenerate() {
    setLoading(true);
    setStreaming(true);
    setResult(null);
    setError(null);
    setQuotaBlock(null);

    let acc = "";
    let grounding: GroundingRecord[] = [];
    let lastFlush = 0;
    const flush = (force = false) => {
      const now = Date.now();
      if (!force && now - lastFlush < 90) return; // ~11 fps; markdown re-parse'ı sınırla
      lastFlush = now;
      setResult({ text: acc, grounding, model: "", disclaimer: "" });
    };

    try {
      await generateDocStream(
        { type, fields, veriler: tags.veriler, amaclar: tags.amaclar },
        {
          onGrounding: (g) => {
            grounding = g;
            flush(true);
          },
          onDelta: (t) => {
            acc += t;
            flush();
          },
          onDone: (meta) => {
            setResult({
              text: acc,
              grounding,
              model: meta.model,
              disclaimer: meta.disclaimer,
              usage: meta.usage,
            });
          },
          onQuotaExceeded: (info) => setQuotaBlock(info),
          onError: (msg) => setError(msg),
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  }

  function onClear() {
    setFields(initialFields(type));
    setTags({ veriler: [], amaclar: [] });
    setResult(null);
    setError(null);
    setQuotaBlock(null);
  }

  function renderField(fd: FieldDef) {
    if (fd.type === "textarea")
      return (
        <Textarea
          value={fields[fd.key] || ""}
          onChange={(e) => setField(fd.key, e.target.value)}
          placeholder={fd.placeholder}
        />
      );
    if (fd.type === "select")
      return (
        <Select value={fields[fd.key] || ""} onChange={(e) => setField(fd.key, e.target.value)}>
          {fd.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Select>
      );
    return (
      <Input
        type={fd.type === "date" ? "date" : "text"}
        value={fields[fd.key] || ""}
        onChange={(e) => setField(fd.key, e.target.value)}
        placeholder={fd.placeholder}
      />
    );
  }

  return (
    <div>
      <p className="eyebrow mb-2">{meta.eyebrow}</p>
      <h1 className="font-display text-3xl text-ink">{meta.title}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{meta.desc}</p>

      <div className="mt-8 space-y-5">
        {schema.cards.map((card, ci) => (
          <Card key={ci} title={card.title} icon={<Icon name={card.icon} className="text-[18px]" />}>
            {card.groups?.map((g) => (
              <div key={g.key} className="mb-5 last:mb-0">
                <p className="mb-2.5 text-[13px] font-medium text-ink-muted">{g.label}</p>
                <div className="flex flex-wrap gap-2">
                  {g.options.map((o) => (
                    <Tag
                      key={o}
                      label={o}
                      on={tags[g.key].includes(o)}
                      onToggle={() => toggleTag(g.key, o)}
                    />
                  ))}
                </div>
              </div>
            ))}

            {card.fields && (
              <div className={card.groups ? "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2" : "grid grid-cols-1 gap-4 sm:grid-cols-2"}>
                {card.fields.map((fd) => (
                  <div key={fd.key} className={fd.full ? "sm:col-span-2" : ""}>
                    <Field label={fd.label} required={fd.required}>
                      {renderField(fd)}
                    </Field>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        <div className="flex items-center gap-3">
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? "Hazırlanıyor…" : schema.cta}
          </Button>
          <Button variant="secondary" onClick={onClear} disabled={loading}>
            Temizle
          </Button>
        </div>

        {loading && !result && (
          <div className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-8 text-center text-sm text-ink-muted shadow-[var(--shadow-card)]">
            Claude dokümanı envanter kayıtlarına göre hazırlıyor…
          </div>
        )}

        {quotaBlock && (
          <div className="rounded-[calc(var(--radius)+4px)] border border-accent bg-accent-soft px-5 py-4 text-sm">
            <strong className="font-medium text-ink">
              Bu ayki ücretsiz doküman hakkınızı kullandınız ({quotaBlock.used}/{quotaBlock.quota}).
            </strong>
            <Link
              href="/app/faturalama"
              className="mt-3 inline-block rounded-[var(--radius)] bg-accent px-4 py-2 text-[13px] text-accent-contrast hover:bg-accent-strong"
            >
              Planı yükselt →
            </Link>
          </div>
        )}

        {error && (
          <div className="rounded-[calc(var(--radius)+4px)] border border-danger/40 bg-danger-soft px-5 py-4 text-sm text-danger">
            <strong className="font-medium">Üretim başarısız.</strong> {error}
          </div>
        )}

        {result && <DocumentOutput result={result} streaming={streaming} />}
      </div>
    </div>
  );
}
