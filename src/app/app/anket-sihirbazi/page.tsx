"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/* Anket Sihirbazı artık Envanter Çalışma Alanı'nın "Rehberli" modu. Eski link/bookmark
   kırılmasın diye rota /app/envanter?mode=rehberli'ye yönlendirir (client param korunur). */
function Redirect() {
  const router = useRouter();
  const sp = useSearchParams();
  useEffect(() => {
    const c = sp.get("client");
    router.replace(`/app/envanter?mode=rehberli${c ? `&client=${c}` : ""}`);
  }, [router, sp]);
  return <p className="p-8 text-[14px] text-ink-muted">Yönlendiriliyor…</p>;
}

export default function AnketSihirbaziPage() {
  return (
    <Suspense fallback={<p className="p-8 text-[14px] text-ink-muted">Yükleniyor…</p>}>
      <Redirect />
    </Suspense>
  );
}
