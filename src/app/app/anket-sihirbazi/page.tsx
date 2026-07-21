import { Suspense } from "react";
import { AnketSihirbaziClient } from "./anket-sihirbazi-client";

export const metadata = {
  title: "Anket Sihirbazı",
};

export default function AnketSihirbaziPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <AnketSihirbaziClient />
    </Suspense>
  );
}
