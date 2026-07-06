import type { ReactNode } from "react";

/*
  Sayfa başlığı grameri (sözleşme §2.1):
  mono eyebrow (bölüm / bağlam) → Fraunces h1 → opsiyonel sağ slot → hairline.
*/
export function PageHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-display text-3xl font-light leading-tight text-ink md:text-4xl">
          {title}
        </h1>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}
