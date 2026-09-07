"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/ui/icon";
import { DocumentOutput } from "@/components/app/document-output";
import { GenerationSkeleton } from "@/components/app/generation-skeleton";
import { PLACEHOLDER, type IhlalPreview } from "@/lib/ihlal-preview";
import type { GenerateResponse } from "@/lib/types";

/*
  İhlal sağ panel — Kurul / İlgili Kişi SEKMELİ, her sekme iki durumlu:
  1) o tipin stream sonucu yoksa: DETERMİNİSTİK yapı iskeleti (buildIhlalPreview'den),
     olay formu doldukça anında güncellenir (ağ yok). "taslak" etiketli, indirilemez.
  2) sonuç varsa: gerçek LLM metni (DocumentOutput) + .docx/Yazdır aksiyonları.
  İki bildirim aynı olaydan türer, farklı çerçevelenir (Kurul resmi / İlgili kişi sade).
*/

export type PreviewSlot = {
  result: GenerateResponse | null;
  streaming: boolean;
  loading: boolean;
  actions: ReactNode;
};

type Tip = "kurul" | "ilgili";

export function IhlalPreviewPanel({
  preview,
  kurul,
  ilgili,
}: {
  preview: IhlalPreview;
  kurul: PreviewSlot;
  ilgili: PreviewSlot;
}) {
  const [tab, setTab] = useState<Tip>("kurul");
  const slot = tab === "kurul" ? kurul : ilgili;

  return (
    <div className="border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex items-stretch border-b border-border" role="tablist">
        <TabButton active={tab === "kurul"} onClick={() => setTab("kurul")} label="Kurul Bildirimi" />
        <TabButton
          active={tab === "ilgili"}
          onClick={() => setTab("ilgili")}
          label="İlgili Kişi Bildirimi"
        />
      </div>

      {slot.result ? (
        <div className="p-3">
          <DocumentOutput result={slot.result} streaming={slot.streaming} actions={slot.actions} />
        </div>
      ) : slot.loading ? (
        <div className="p-4">
          <GenerationSkeleton label="Avukat-dili metin üretiliyor…" />
        </div>
      ) : (
        <SkeletonSheet preview={preview} tip={tab} />
      )}
    </div>
  );
}

function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={`flex-1 px-4 py-3 text-[13px] font-medium ${
        active
          ? "border-b-2 border-accent bg-accent-soft text-accent-strong"
          : "border-b-2 border-transparent text-ink-muted hover:text-ink"
      }`}
    >
      {label}
    </button>
  );
}

/** Boşsa uyarı tonunda yer tutucu; doluysa düz metin. */
function Val({ text, required }: { text: string; required?: boolean }) {
  if (!text.trim() && required) return <span className="text-warning">{PLACEHOLDER}</span>;
  return <span className="text-ink">{text.trim() || "—"}</span>;
}

function List({ items, required }: { items: string[]; required?: boolean }) {
  if (items.length === 0) {
    return <span className={required ? "text-warning" : "text-ink"}>{required ? PLACEHOLDER : "—"}</span>;
  }
  return <span className="text-ink">{items.join(", ")}</span>;
}

function fmtTespit(t: string): string {
  return t ? t.replace("T", " · ") : "";
}

function SkeletonSheet({ preview: p, tip }: { preview: IhlalPreview; tip: Tip }) {
  const kurul = tip === "kurul";
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-5 py-2.5">
        <span className="flex items-center gap-2 text-[12px] font-medium text-ink-muted">
          <Icon name="file" className="text-[15px]" /> Yapı önizlemesi — taslak
        </span>
        {p.missing.length > 0 && (
          <span className="inline-flex items-center gap-1.5 border border-warning/40 bg-warning-soft px-2.5 py-1 text-[11.5px] text-warning">
            <Icon name="shield-alert" className="text-[13px]" /> {p.missing.length} eksik zorunlu alan
          </span>
        )}
      </div>
      <p className="border-b border-border bg-surface-2 px-5 py-2 text-[11.5px] text-ink-subtle">
        Formu doldurdukça güncellenir. Nihai metin için ilgili <strong className="font-medium text-ink-muted">Üret</strong>’e
        basın — bu taslak indirilemez.
      </p>

      <div className="space-y-5 px-6 py-5 text-[14px] leading-[1.7]">
        {kurul ? (
          <>
            <Section no="1" title="Veri Sorumlusu">
              <strong className="font-medium">{p.controllerName}</strong> tarafından, 6698 sayılı KVKK
              m.12/5 uyarınca Kişisel Verileri Koruma Kurulu’na sunulan ihlal bildirimidir.
            </Section>
            <Section no="2" title="İhlalin Niteliği ve Tespiti">
              İhlal türü: <Val text={p.tur} />. Tespit: <Val text={fmtTespit(p.tespit)} required />. İhlalin
              gerçekleşme biçimi: <Val text={p.nasil} required />.
            </Section>
            <Section no="3" title="Etkilenen Kişi Grupları ve Veri Kategorileri">
              Etkilenen süreç/kişi grupları: <List items={p.affectedProcesses} required />. Etkilenen veri
              kategorileri: <List items={p.affectedCategories} />
              {p.kimlikFinansal ? " (kimlik/finansal veri dâhil)" : ""}. Yaklaşık etkilenen kişi sayısı:{" "}
              <span className="text-ink">{p.kisiSayisi > 0 ? p.kisiSayisi : PLACEHOLDER}</span>.
              {p.sifreli ? " Etkilenen veriler şifreli/anonim olduğundan risk azaltılmıştır." : ""}
            </Section>
            <Section no="4" title="Olası Sonuçlar">
              İhlalin ilgili kişiler üzerindeki olası sonuçları değerlendirilmekte olup, gerekli hâllerde
              ilgili kişilere ayrıca bildirim yapılacaktır.
            </Section>
            <Section no="5" title="Alınan ve Alınacak Önlemler">
              <Val text={p.onlemler} required />
            </Section>
          </>
        ) : (
          <>
            <Section no="1" title="Ne Oldu?">
              <strong className="font-medium">{p.controllerName}</strong> nezdinde{" "}
              <Val text={fmtTespit(p.tespit)} required /> tarihinde bir kişisel veri ihlali (
              <Val text={p.tur} />) tespit edilmiştir. Olay: <Val text={p.nasil} required />.
            </Section>
            <Section no="2" title="Hangi Verileriniz Etkilendi?">
              Etkilenen veri kategorileri: <List items={p.affectedCategories} />
              {p.kimlikFinansal ? " — kimlik/finansal verileriniz etkilenmiş olabilir" : ""}.
            </Section>
            <Section no="3" title="Olası Sonuçlar ve Önerimiz">
              Alınan önlemler: <Val text={p.onlemler} required />. Hesap güvenliğiniz için parolanızı
              güncellemenizi ve şüpheli işlemlere karşı dikkatli olmanızı öneririz.
            </Section>
            <Section no="4" title="İletişim">
              Sorularınız için veri sorumlusu <strong className="font-medium">{p.controllerName}</strong> ile
              iletişime geçebilirsiniz.
            </Section>
          </>
        )}
      </div>
    </div>
  );
}

function Section({ no, title, children }: { no: string; title: string; children: ReactNode }) {
  return (
    <section>
      <h3 className="font-display text-[15px] text-ink">
        <span className="text-accent-strong">{no}.</span> {title}
      </h3>
      <p className="mt-1.5 text-ink">{children}</p>
    </section>
  );
}
