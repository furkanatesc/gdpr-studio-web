import { Suspense } from "react";
import { CerezClient } from "./cerez-client";

export const metadata = {
  title: "Çerez Politikası Üret",
};

export default function CerezPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <CerezClient />
    </Suspense>
  );
}
