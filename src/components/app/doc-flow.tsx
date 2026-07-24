"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { MultiSelect } from "@/components/ui/multi-select";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StepBar } from "./step-bar";
import { PageHeader } from "./page-header";
import { SensitiveNotice } from "./sensitive-notice";
import { DocumentOutput } from "./document-output";
import { docByType, docEyebrow, OZEL_NITELIKLI } from "@/lib/catalog";
import { SCHEMAS, type CardDef, type FieldDef, type TagGroupDef } from "@/lib/schemas";
import { generateDocStream, getGroundingOptions, listPersonGroups, usingRealApi, type GroundingOptions } from "@/lib/api";
import type { DocType, GenerateResponse, GroundingRecord } from "@/lib/types";
import { refreshWorkspaceInfo } from "@/components/app/use-workspace-info";

function initialFields(type: DocType): Record<string, string> {
  const f: Record<string, string> = {};
  for (const card of SCHEMAS[type].cards) {
    for (const fd of card.fields ?? []) {
      if (fd.type === "select" && fd.options?.length) f[fd.key] = fd.options[0];
    }
  }
  return f;
}

/** Üretim beklerken iskelet çıktı kartı — ilk stream delta'sı gelince yerini gerçek içerik alır. */
function GenerationSkeleton() {
  return (
    <div className=" border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
        <Icon name="spinner" className="animate-spin text-[15px]" /> Claude dokümanı envanter
        kayıtlarına göre hazırlıyor…
      </div>
      <div aria-hidden className="mt-5 space-y-3">
        <div className="h-4 w-2/5 animate-pulse bg-surface-2" />
        <div className="h-3 w-full animate-pulse bg-surface-2" />
        <div className="h-3 w-11/12 animate-pulse bg-surface-2" />
        <div className="h-3 w-4/5 animate-pulse bg-surface-2" />
      </div>
    </div>
  );
}

export function DocFlow({ type }: { type: DocType }) {
  const meta = docByType(type);
  const schema = SCHEMAS[type];
  const toast = useToast();

  // Adımlar: her şema kartı bir adım + son adım "Üret & Önizleme".
  const steps = [...schema.cards.map((c) => ({ title: c.title })), { title: "Üret & Önizleme" }];
  const generateStep = schema.cards.length;

  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
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
  const [personGroups, setPersonGroups] = useState<string[]>([]);
  const [kisiGrubu, setKisiGrubu] = useState("");
  const [groundingOptions, setGroundingOptions] = useState<GroundingOptions>({
    kategoriler: [],
    amaclar: [],
    ozelNitelikli: [],
  });

  // KVKK m.6 hassasiyeti kategori ETİKETİNE bağlı; etiketlerin kaynağı backend grounding'i.
  // Sabit katalog yalnız mock/hata durumunda geçerli — tek başına bırakılırsa uyarı sessizce kaybolur.
  const sensitiveSet = useMemo(
    () => new Set<string>([...OZEL_NITELIKLI, ...groundingOptions.ozelNitelikli]),
    [groundingOptions.ozelNitelikli],
  );

  useEffect(() => {
    if (!usingRealApi) return;
    listPersonGroups()
      .then(setPersonGroups)
      .catch(() => setPersonGroups([])); // sektör yok/hata → adım gizlenir, akış bozulmaz
  }, []);

  // Yalnız aydınlatma metni veri kategorisi/amaç alanları grounding'den beslenir (envanter gerçekliği).
  useEffect(() => {
    if (!usingRealApi || type !== "aydinlatma") return;
    getGroundingOptions()
      .then(setGroundingOptions)
      .catch(() => setGroundingOptions({ kategoriler: [], amaclar: [], ozelNitelikli: [] }));
  }, [type]);

  /** Grounding boşsa (mock/hata) şemadaki sabit katalog listesine düşer. */
  function groupOptions(g: TagGroupDef): string[] {
    if (type !== "aydinlatma") return g.options;
    const dynamic = g.key === "veriler" ? groundingOptions.kategoriler : groundingOptions.amaclar;
    return dynamic.length ? dynamic : g.options;
  }

  const setField = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));
  const toggleTag = (group: "veriler" | "amaclar", v: string) =>
    setTags((t) => ({
      ...t,
      [group]: t[group].includes(v) ? t[group].filter((x) => x !== v) : [...t[group], v],
    }));

  /** Adım (şema kartı) zorunlu alanları dolu mu? Üret adımı her zaman geçerli. */
  function stepValid(i: number): boolean {
    const card = schema.cards[i];
    if (!card) return true;
    return (card.fields ?? []).every((fd) => !fd.required || (fields[fd.key] || "").trim() !== "");
  }

  const reachable = steps.map(
    (_, i) =>
      i <= maxReached &&
      Array.from({ length: Math.min(i, generateStep) }, (_, ci) => ci).every((ci) =>
        stepValid(ci),
      ),
  );

  function goTo(i: number) {
    if (i !== step + 1 && !reachable[i]) return;
    setStep(i);
    setMaxReached((m) => Math.max(m, i));
  }

  const anySensitive = [...tags.veriler, ...tags.amaclar].some((v) => sensitiveSet.has(v));

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

    // Payload temizliği: yazılıp silinmiş/boş alanlar sözlükte kalmasın — yalnız dolu değerler gider.
    const filledFields = Object.fromEntries(
      Object.entries(fields).filter(([, v]) => v.trim() !== ""),
    );

    try {
      await generateDocStream(
        {
          type,
          fields: filledFields,
          veriler: tags.veriler,
          amaclar: tags.amaclar,
          kisiGrubu: kisiGrubu || null,
        },
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
            toast("Doküman hazır");
            refreshWorkspaceInfo(); // kenar çubuğu kullanım sayacı
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
    setStep(0);
    setMaxReached(0);
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

  function renderCard(card: CardDef) {
    return (
      <Card title={card.title} icon={<Icon name={card.icon} className="text-[18px]" />}>
        {card.groups?.map((g) => {
          const hasSensitive = tags[g.key].some((v) => sensitiveSet.has(v));
          const opts = groupOptions(g);
          return (
            <div key={g.key} className="mb-5 last:mb-0">
              <p className="mb-2.5 text-[13px] font-medium text-ink-muted">{g.label}</p>
              {type === "aydinlatma" ? (
                <MultiSelect
                  options={opts}
                  value={tags[g.key]}
                  onChange={(v) => setTags((t) => ({ ...t, [g.key]: v }))}
                  ariaLabel={g.label}
                  placeholder="Seçin…"
                  isSensitive={(o) => sensitiveSet.has(o)}
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {opts.map((o) => (
                    <Tag
                      key={o}
                      label={o}
                      on={tags[g.key].includes(o)}
                      onToggle={() => toggleTag(g.key, o)}
                      sensitive={sensitiveSet.has(o)}
                    />
                  ))}
                </div>
              )}
              {hasSensitive && <SensitiveNotice />}
            </div>
          );
        })}

        {card.fields && (
          <div
            className={
              card.groups
                ? "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
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
    );
  }

  /** Üret adımı: seçimlerin kompakt özeti + CTA + çıktı alanı. */
  function renderGenerateStep() {
    const groups = schema.cards.flatMap((c) => c.groups ?? []);
    return (
      <div className="space-y-5">
        {personGroups.length > 0 && (
          <Field label="İlgili kişi grubu">
            <Select value={kisiGrubu} onChange={(e) => setKisiGrubu(e.target.value)} aria-label="İlgili kişi grubu">
              <option value="">Seçilmedi (genel)</option>
              {personGroups.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </Select>
          </Field>
        )}

        <Card title="Özet" icon={<Icon name="clipboard" className="text-[18px]" />}>
          {groups.map((g) => (
            <div key={g.key} className="mb-4 last:mb-0">
              <p className="mb-2 text-[13px] font-medium text-ink-muted">{g.label}</p>
              {tags[g.key].length ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags[g.key].map((v) => (
                    <span
                      key={v}
                      className={
                        sensitiveSet.has(v)
                          ? " border border-warning/60 bg-warning-soft px-2.5 py-1 text-[12px] text-warning"
                          : " border border-border-strong bg-surface-2 px-2.5 py-1 text-[12px] text-ink-muted"
                      }
                    >
                      {v}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-ink-subtle">Seçim yapılmadı.</p>
              )}
            </div>
          ))}
          {anySensitive && <SensitiveNotice />}
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? (
              <>
                <Icon name="spinner" className="animate-spin text-[15px]" /> Hazırlanıyor…
              </>
            ) : (
              schema.cta
            )}
          </Button>
          <Button variant="secondary" onClick={onClear} disabled={loading}>
            Temizle
          </Button>
        </div>

        {loading && !result && <GenerationSkeleton />}

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

        {error && (
          <div className="flex items-start gap-2.5 border border-danger/40 border-l-2 border-l-danger bg-danger-soft px-5 py-4 text-sm text-danger">
            <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[16px]" />
            <span>
              <strong className="font-medium">Üretim başarısız.</strong> {error}
            </span>
          </div>
        )}

        {result && <DocumentOutput result={result} streaming={streaming} />}
      </div>
    );
  }

  return (
    <div>
      {/* Sayfa başlığı grameri (sözleşme §2.1) */}
      <PageHeader eyebrow={docEyebrow(meta)} title={meta.title} description={meta.desc} />

      <div className="mt-7">
        <StepBar
          steps={steps}
          current={step}
          reachable={reachable}
          docColor={`var(--doc-${type})`}
          onSelect={goTo}
          locked={loading}
        />
      </div>

      <div key={step} className="animate-step-in mt-6">
        {step < generateStep ? renderCard(schema.cards[step]) : renderGenerateStep()}
      </div>

      {step < generateStep && (
        <div className="mt-5 flex items-center gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => goTo(step - 1)}>
              Geri
            </Button>
          )}
          <Button onClick={() => goTo(step + 1)} disabled={!stepValid(step)}>
            İleri →
          </Button>
        </div>
      )}
    </div>
  );
}
