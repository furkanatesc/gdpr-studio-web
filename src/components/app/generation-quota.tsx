"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/icon";

/* Kota-aşıldı bloğu — tüm üretim akışlarında ortak (P4-4). Tek yerden düzenlenir. */
export function QuotaBlock({ used, quota }: { used: number; quota: number }) {
  return (
    <div className="flex items-start gap-2.5 border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-5 py-4 text-sm">
      <Icon name="shield-alert" className="mt-0.5 flex-shrink-0 text-[16px] text-warning" />
      <div>
        <strong className="font-medium text-ink">
          Bu ayki ücretsiz doküman hakkınızı kullandınız ({used}/{quota}).
        </strong>
        <Link
          href="/app/faturalama"
          className="mt-3 inline-block bg-accent px-4 py-2 text-[13px] text-accent-contrast hover:bg-accent-strong"
        >
          Planı yükselt →
        </Link>
      </div>
    </div>
  );
}
