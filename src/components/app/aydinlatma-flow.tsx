"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { DocumentOutput } from "./document-output";
import {
  VERI_KATEGORILERI,
  ISLEME_AMACLARI,
  SEKTORLER,
  YURTDISI_SECENEKLERI,
  docByType,
} from "@/lib/catalog";
import { generateDocMock } from "@/lib/mock-api";
import type { GenerateResponse } from "@/lib/types";

export function AydinlatmaFlow() {
  const meta = docByType("aydinlatma");
  const [fields, setFields] = useState<Record<string, string>>({
    sektor: SEKTORLER[0],
    yurtdisi: YURTDISI_SECENEKLERI[0],
  });
  const [veriler, setVeriler] = useState<string[]>([]);
  const [amaclar, setAmaclar] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);

  const setField = (k: string, v: string) =>
    setFields((f) => ({ ...f, [k]: v }));
  const toggle = (
    arr: string[],
    setArr: (v: string[]) => void,
    v: string,
  ) => setArr(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  async function onGenerate() {
    setLoading(true);
    setResult(null);
    try {
      const res = await generateDocMock({
        type: "aydinlatma",
        fields,
        veriler,
        amaclar,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setFields({ sektor: SEKTORLER[0], yurtdisi: YURTDISI_SECENEKLERI[0] });
    setVeriler([]);
    setAmaclar([]);
    setResult(null);
  }

  return (
    <div>
      <p className="eyebrow mb-2">{meta.eyebrow}</p>
      <h1 className="font-display text-3xl text-ink">{meta.title}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        {meta.desc}
      </p>

      <div className="mt-5 rounded-[var(--radius)] border border-accent/30 bg-accent-soft px-4 py-3 text-[13px] leading-relaxed text-accent-strong">
        Veri sorumlusu kimliği, işleme amaçları, hukuki dayanak, ilgili kişi hakları ve
        şikayet yolu dahil tüm KVKK m.10 / GDPR m.13 unsurları envantere dayanarak dahil edilir.
      </div>

      <div className="mt-8 space-y-5">
        <Card title="Şirket Bilgileri" icon={<span>🏛️</span>}>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Şirket / Kuruluş adı" required>
              <Input
                value={fields.sirket || ""}
                onChange={(e) => setField("sirket", e.target.value)}
                placeholder="Örn: Yaşam Hastaneleri A.Ş."
              />
            </Field>
            <Field label="Web sitesi">
              <Input
                value={fields.site || ""}
                onChange={(e) => setField("site", e.target.value)}
                placeholder="www.sirket.com"
              />
            </Field>
            <Field label="Veri sorumlusu e-postası" required>
              <Input
                value={fields.email || ""}
                onChange={(e) => setField("email", e.target.value)}
                placeholder="kvkk@sirket.com"
              />
            </Field>
            <Field label="Sektör" required>
              <Select
                value={fields.sektor}
                onChange={(e) => setField("sektor", e.target.value)}
              >
                {SEKTORLER.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </Select>
            </Field>
          </div>
          <div className="mt-4">
            <Field label="DPO / Veri Koruma Görevlisi (varsa)">
              <Input
                value={fields.dpo || ""}
                onChange={(e) => setField("dpo", e.target.value)}
                placeholder="Ad Soyad veya dpo@sirket.com"
              />
            </Field>
          </div>
        </Card>

        <Card title="İşleme Faaliyetleri" icon={<span>📋</span>}>
          <p className="mb-2.5 text-[13px] font-medium text-ink-muted">
            Hangi kişisel veri kategorilerini işliyorsunuz?
          </p>
          <div className="flex flex-wrap gap-2">
            {VERI_KATEGORILERI.map((v) => (
              <Tag
                key={v}
                label={v}
                on={veriler.includes(v)}
                onToggle={() => toggle(veriler, setVeriler, v)}
              />
            ))}
          </div>

          <p className="mb-2.5 mt-5 text-[13px] font-medium text-ink-muted">
            İşleme amaçları
          </p>
          <div className="flex flex-wrap gap-2">
            {ISLEME_AMACLARI.map((a) => (
              <Tag
                key={a}
                label={a}
                on={amaclar.includes(a)}
                onToggle={() => toggle(amaclar, setAmaclar, a)}
              />
            ))}
          </div>

          <div className="mt-5">
            <Field label="Yurt dışına veri aktarımı yapılıyor mu?">
              <Select
                value={fields.yurtdisi}
                onChange={(e) => setField("yurtdisi", e.target.value)}
              >
                {YURTDISI_SECENEKLERI.map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </Select>
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Ek bağlam / özel durumlar">
              <Textarea
                value={fields.ekbilgi || ""}
                onChange={(e) => setField("ekbilgi", e.target.value)}
                placeholder="Örn: çocuklara yönelik hizmet, özel kategori veri işleme, DPIA yapıldı..."
              />
            </Field>
          </div>
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? "Hazırlanıyor…" : "⚡ Aydınlatma Metni Oluştur"}
          </Button>
          <Button variant="secondary" onClick={onClear} disabled={loading}>
            Temizle
          </Button>
        </div>

        {loading && (
          <div className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-8 text-center text-sm text-ink-muted shadow-[var(--shadow-card)]">
            Claude dokümanı envanter kayıtlarına göre hazırlıyor…
          </div>
        )}

        {result && <DocumentOutput result={result} />}
      </div>
    </div>
  );
}
