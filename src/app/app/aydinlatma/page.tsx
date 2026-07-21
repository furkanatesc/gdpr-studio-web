import { Suspense } from "react";
import { AydinlatmaClient } from "./aydinlatma-client";

export const metadata = {
  title: "Aydınlatma Üret",
};

export default function AydinlatmaPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <AydinlatmaClient />
    </Suspense>
  );
}
