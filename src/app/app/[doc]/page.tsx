import Link from "next/link";
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
    return <DocFlow type={doc as DocType} />;
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
        <p className="font-display text-lg text-ink">Doküman üretmek ister misiniz?</p>
        <Link
          href="/app/aydinlatma"
          className="mt-5 inline-flex rounded-pill bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast hover:bg-accent-strong"
        >
          Aydınlatma Metni'ne git →
        </Link>
      </div>
    </div>
  );
}
