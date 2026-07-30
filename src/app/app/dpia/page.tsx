import { Suspense } from "react";
import { DpiaClient } from "./dpia-client";

export const metadata = {
  title: "DPIA Üret",
};

export default function DpiaPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <DpiaClient />
    </Suspense>
  );
}
