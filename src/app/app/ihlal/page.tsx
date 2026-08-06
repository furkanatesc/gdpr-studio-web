import { Suspense } from "react";
import { IhlalClient } from "./ihlal-client";

export const metadata = {
  title: "İhlal Bildirimi",
};

export default function IhlalPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <IhlalClient />
    </Suspense>
  );
}
