"use client"; // Hata sınırları Client Component olmalı (Next.js).

import { useEffect } from "react";
import Link from "next/link";
import { buttonClasses } from "@/components/ui/button";

/*
  /app/* çalışma alanı hata sınırı (UX P4-8). layout.tsx'i (AppShell) SARMAZ — yalnız
  sayfa içeriğini kapsar; hata olduğunda sidebar/nav ayakta kalır, kullanıcı boş/çökmüş
  ekranla kalmaz. Next 16.2: kurtarma prop'u `reset` değil `unstable_retry`
  (segment'i yeniden getirip render eder); yoksa tam sayfa yeniden yükleme fallback'i.
*/
export default function AppError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry?: () => void;
}) {
  useEffect(() => {
    // Prod'da sunucu tarafı log'la eşleşen digest ile; istemci mesajı sızmaz.
    console.error("[app-shell] beklenmeyen hata:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg border border-danger/40 bg-danger-soft px-6 py-8">
      <p className="font-medium text-[10px] uppercase tracking-[0.12em] text-danger">
        Beklenmeyen hata
      </p>
      <h1 className="mt-2 font-display text-2xl font-light text-ink">Bir şeyler ters gitti</h1>
      <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
        Bu bölüm yüklenirken bir sorun oluştu. Verileriniz güvende — tekrar deneyebilir ya da
        başlangıç ekranına dönebilirsiniz.
      </p>
      {error.digest && (
        <p className="mt-3 font-mono text-[11px] text-ink-subtle">Hata kodu: {error.digest}</p>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => (unstable_retry ? unstable_retry() : window.location.reload())}
          className={buttonClasses("primary", "sm")}
        >
          Tekrar dene
        </button>
        <Link href="/app" className={buttonClasses("secondary", "sm")}>
          Başlangıca dön
        </Link>
      </div>
    </div>
  );
}
