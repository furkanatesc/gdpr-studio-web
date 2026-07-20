import { Suspense } from "react";
import { EnvanterClient } from "./envanter-client";

export const metadata = {
  title: "Envanter Yönetimi",
};

export default function EnvanterPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <EnvanterClient />
    </Suspense>
  );
}
