import { Suspense } from "react";
import { DpaClient } from "./dpa-client";

export const metadata = {
  title: "Veri İşleyen Sözleşmesi Üret",
};

export default function DpaPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <DpaClient />
    </Suspense>
  );
}
