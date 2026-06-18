import type { ReactNode } from "react";
import Link from "next/link";

/**
 * Yasal sayfa iskeleti. İçerik gerçek hukuki metinle doldurulana dek
 * dürüst "hazırlanıyor" yer tutucu gösterir — bağlayıcı metin uydurulmaz.
 */
export function LegalPage({
  eyebrow,
  title,
  intro,
  sections,
}: {
  eyebrow: string;
  title: string;
  intro: ReactNode;
  sections: string[];
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="font-display text-4xl leading-tight text-ink">{title}</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{intro}</p>

      <div className="mt-8 rounded-[calc(var(--radius)+4px)] border border-dashed border-border-strong bg-surface-2 px-6 py-8">
        <p className="text-[14px] leading-relaxed text-ink">
          Bu belgenin nihai metni hukuk danışmanımızla birlikte hazırlanıyor. Yürürlüğe
          girdiğinde bu sayfada yayımlanacak ve aşağıdaki başlıkları kapsayacaktır:
        </p>
        <ul className="mt-4 space-y-2 text-[13.5px] text-ink-muted">
          {sections.map((s) => (
            <li key={s} className="flex items-start gap-2.5">
              <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-accent" />
              {s}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-[13px] text-ink-muted">
        Bu konuda bilgi almak için{" "}
        <Link href="/iletisim" className="text-accent hover:text-accent-strong">
          bizimle iletişime geçin
        </Link>
        .
      </p>
    </div>
  );
}
