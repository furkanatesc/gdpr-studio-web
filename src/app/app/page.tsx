import Link from "next/link";
import { DOC_CATALOG } from "@/lib/catalog";

export default function Dashboard() {
  return (
    <div>
      <p className="eyebrow mb-3">Başlangıç</p>
      <h1 className="font-display text-4xl leading-tight text-ink">
        KVKK & GDPR dokümanlarını
        <br />
        <span className="text-accent-strong">gerçek envantere</span> dayandırarak üretin
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
        Her hukuki sebep, amaç ve süre kurumunuzun veri envanterinden gelir — yapay zekâ
        uydurmaz. Bir doküman türü seçerek başlayın.
      </p>

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DOC_CATALOG.map((d) => (
          <Link
            key={d.type}
            href={`/app/${d.type}`}
            className="group rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-mono text-xs text-ink-subtle transition-colors group-hover:bg-accent group-hover:text-accent-contrast">
                {d.no}
              </span>
              <h3 className="font-display text-[15px] font-semibold text-ink">{d.title}</h3>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{d.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `var(--doc-${d.type})` }}
              />
              {d.mevzuat}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
