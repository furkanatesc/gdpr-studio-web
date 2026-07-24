import { Suspense } from "react";
import { KayitClient } from "./kayit-client";

export const metadata = {
  title: "İşleme Kaydı Üret",
};

export default function KayitPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <KayitClient />
    </Suspense>
  );
}
