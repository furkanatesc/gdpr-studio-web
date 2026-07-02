import { ButtonLink } from "@/components/ui/button-link";
import { Arrow, Icon } from "@/components/ui/icon";
import { DocFlow } from "@/components/app/doc-flow";
import { DOC_CATALOG } from "@/lib/catalog";
import type { DocType } from "@/lib/types";

const VALID = new Set(DOC_CATALOG.map((d) => d.type));

// Next 16: params asenkron (Promise).
export default async function DocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;

  if (VALID.has(doc as DocType)) {
    return <DocFlow key={doc} type={doc as DocType} />;
  }

  // Araçlar / bilinmeyen segment → yakında
  return (
    <div>
      <p className="eyebrow mb-2">Araç</p>
      <h1 className="font-display text-3xl text-ink">Yakında</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
        Bu bölüm (ör. Envanter Yönetimi, Uyum Kontrol Listesi) sıradaki fazda eklenecek.
      </p>
      <div className="mt-8 rounded-[calc(var(--radius)+4px)] border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
        <Icon name="folders" className="mx-auto text-[28px] text-ink-subtle" />
        <p className="mt-4 font-display text-lg text-ink">Doküman üretmek ister misiniz?</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
          Bu araç hazır olana kadar altı doküman akışının tamamını kullanabilirsiniz.
        </p>
        <ButtonLink href="/app/aydinlatma" size="sm" className="mt-5">
          Aydınlatma Metni&apos;ne git <Arrow />
        </ButtonLink>
      </div>
    </div>
  );
}
