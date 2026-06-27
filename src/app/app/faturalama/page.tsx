import { Suspense } from "react";
import { FaturalamaClient } from "./faturalama-client";

export const metadata = { title: "Plan & Faturalama — KVKK Yönetim" };

export default function FaturalamaPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <FaturalamaClient />
    </Suspense>
  );
}
