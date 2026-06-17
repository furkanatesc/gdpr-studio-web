import Link from "next/link";
import { DOC_CATALOG } from "@/lib/catalog";

// Next 16: params artık asenkron (Promise).
export default async function DocStubPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc } = await params;
  const meta = DOC_CATALOG.find((d) => d.type === doc);

  return (
    <div>
      <p className="eyebrow mb-2">{meta?.eyebrow ?? "Araç"}</p>
      <h1 className="font-display text-3xl text-ink">{meta?.title ?? "Yakında"}</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
        {meta?.desc ??
          "Bu bölüm yakında eklenecek."}
      </p>

      <div className="mt-8 rounded-[calc(var(--radius)+4px)] border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
        <p className="font-display text-lg text-ink">Bu akış henüz hazır değil</p>
        <p className="mt-2 text-[13px] text-ink-muted">
          İlk olarak Aydınlatma Metni akışı uçtan uca hazır. Diğer doküman türleri sıradaki
          fazda eklenecek.
        </p>
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
