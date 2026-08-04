"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { DpaClient } from "./dpa-client";
import { DpaReviewClient } from "./dpa-review-client";

export function DpaTabs() {
  const tab = useSearchParams().get("tab") === "incele" ? "incele" : "uret";
  const tabCls = (active: boolean) =>
    `pb-2 text-[12.5px] uppercase tracking-[0.08em] font-medium border-b-2 ${
      active ? "border-accent-strong text-accent-strong" : "border-transparent text-ink-muted hover:text-ink"
    }`;
  return (
    <div>
      <div className="flex gap-6 border-b border-border px-1">
        <Link href="/app/dpa" className={tabCls(tab === "uret")}>Üret</Link>
        <Link href="/app/dpa?tab=incele" className={tabCls(tab === "incele")}>İncele</Link>
      </div>
      <div className="mt-6">
        {tab === "incele" ? <DpaReviewClient /> : <DpaClient />}
      </div>
    </div>
  );
}
