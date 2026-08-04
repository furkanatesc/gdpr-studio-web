import { Suspense } from "react";
import { DpaTabs } from "./dpa-tabs";

export const metadata = {
  title: "Veri İşleyen Sözleşmesi",
};

export default function DpaPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <DpaTabs />
    </Suspense>
  );
}
