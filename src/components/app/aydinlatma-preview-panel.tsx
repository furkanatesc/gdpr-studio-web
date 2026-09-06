"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { DocumentOutput } from "@/components/app/document-output";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { formatFieldValues, type AydinlatmaPreview, type PreviewActivity } from "@/lib/aydinlatma-preview";
import type { GenerateResponse } from "@/lib/types";

/*
  Aydınlatma sağ panel — iki durumlu tek yüzey:
  1) result yoksa: DETERMİNİSTİK yapı önizlemesi (buildAydinlatmaPreview) — alanlar
     düzenlendikçe anında güncellenir, ağ yok. Açıkça "taslak" etiketli; indirilemez.
  2) result varsa: gerçek LLM metni (DocumentOutput) + .docx/Yazdır aksiyonları.
  Üretim başlarken (loading, henüz delta yok) iskelet yerine üretim skeleton'ı.
*/
export function AydinlatmaPreviewPanel({
  preview,
  result,
  streaming,
  loading,
  actions,
}: {
  preview: AydinlatmaPreview;
  result: GenerateResponse | null;
  streaming: boolean;
  loading: boolean;
  actions?: ReactNode;
}) {
  if (result) return <DocumentOutput result={result} streaming={streaming} actions={actions} />;
  if (loading) return <GenerationSkeleton label="Avukat-dili metin üretiliyor…" />;
  return <PreviewSheet preview={preview} />;
}

/** Boşsa yer tutucuyu uyarı tonunda gösterir; doluysa düz metin. */
function FieldSpan({ values, required }: { values: string[]; required?: boolean }) {
  if (values.length === 0 && required) {
    return <span className="text-warning">{formatFieldValues(values)}</span>;
  }
  return <span className="text-ink">{formatFieldValues(values)}</span>;
}

function ActivityBlock({ a }: { a: PreviewActivity }) {
  const grup = a.kisiGruplari.length ? a.kisiGruplari.join(", ") : "İlgili kişiler";
  return (
    <div className="border-l-2 border-border pl-4">
      <p className="eyebrow mb-1.5 text-accent-strong">
        {grup} — {a.isSureci}
      </p>
      <p className="text-[14px] leading-[1.75] text-ink">
        <strong className="font-medium">{grup}</strong> kapsamında{" "}
        <FieldSpan values={a.kategoriler} required /> kategorilerindeki kişisel verileriniz;{" "}
        <FieldSpan values={a.amaclar} required /> amaçlarıyla,{" "}
        <FieldSpan values={a.hukukiSebepler} required /> hukuki sebeplerine dayanılarak işlenmektedir.
        Verileriniz <FieldSpan values={a.toplama} required /> yöntemleriyle toplanmakta ve{" "}
        <FieldSpan values={a.saklamaSureleri} required /> süresince saklanmaktadır.{" "}
        {a.aktarim.length > 0 ? (
          <>
            Söz konusu veriler <span className="text-ink">{a.aktarim.join(", ")}</span> ile, ilgili
            mevzuat ve KVKK m.8 uyarınca işbu amaçlarla sınırlı olarak paylaşılmaktadır.
          </>
        ) : (
          <>Söz konusu kişisel verileriniz üçüncü kişilerle paylaşılmamaktadır.</>
        )}
      </p>
    </div>
  );
}

const HAKLAR = [
  "işlenip işlenmediğini öğrenme, işlenmişse buna ilişkin bilgi talep etme",
  "işlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme",
  "yurt içinde/yurt dışında aktarıldığı üçüncü kişileri bilme",
  "eksik veya yanlış işlenmişse düzeltilmesini, KVKK m.7’deki şartlarla silinmesini/yok edilmesini isteme",
  "münhasıran otomatik sistemlerle analiz sonucu aleyhe bir sonucun ortaya çıkmasına itiraz etme",
];

function PreviewSheet({ preview }: { preview: AydinlatmaPreview }) {
  return (
    <div className="border border-border bg-surface shadow-[var(--shadow-card)]">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-3.5">
        <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
          <Icon name="file" className="text-[16px]" /> Yapı önizlemesi — taslak
        </div>
        {preview.totalMissing > 0 && (
          <span className="inline-flex items-center gap-1.5 border border-warning/40 bg-warning-soft px-2.5 py-1 text-[12px] text-warning">
            <Icon name="shield-alert" className="text-[14px]" /> {preview.totalMissing} eksik zorunlu alan
          </span>
        )}
      </header>

      <p className="border-b border-border bg-surface-2 px-5 py-2.5 text-[12px] text-ink-subtle">
        Alanları düzenledikçe anında güncellenir. Nihai avukat-dili metin için{" "}
        <strong className="font-medium text-ink-muted">Üret</strong>’e basın — bu taslak indirilemez.
      </p>

      <div className="space-y-6 px-6 py-6">
        <section>
          <h3 className="font-display text-[15px] text-ink">1. Veri Sorumlusu</h3>
          <p className="mt-1.5 text-[14px] leading-[1.75] text-ink">
            Kişisel verileriniz, veri sorumlusu sıfatıyla{" "}
            <strong className="font-medium">{preview.controllerName}</strong> tarafından aşağıda
            açıklanan kapsamda 6698 sayılı KVKK m.10 uyarınca işlenmektedir.
          </p>
        </section>

        <section>
          <h3 className="font-display text-[15px] text-ink">
            2. İşlenen Veriler, Amaçlar ve Hukuki Sebepler
          </h3>
          <div className="mt-3 space-y-4">
            {preview.activities.length > 0 ? (
              preview.activities.map((a, i) => <ActivityBlock key={`${a.isSureci}-${i}`} a={a} />)
            ) : (
              <p className="text-[13px] text-ink-muted">Henüz bölüm yok.</p>
            )}
          </div>
        </section>

        <section>
          <h3 className="font-display text-[15px] text-ink">3. İlgili Kişinin Hakları (KVKK m.11)</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[13.5px] leading-relaxed text-ink">
            {HAKLAR.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </section>

        <section>
          <h3 className="font-display text-[15px] text-ink">4. Başvuru</h3>
          <p className="mt-1.5 text-[14px] leading-[1.75] text-ink">
            Taleplerinizi, Veri Sorumlusuna Başvuru Usul ve Esasları Hakkında Tebliğ’e uygun biçimde
            veri sorumlusuna iletebilirsiniz; başvurularınız en geç 30 gün içinde sonuçlandırılır.
          </p>
        </section>
      </div>
    </div>
  );
}
