"use client";

import type { ReactNode } from "react";
import { usingRealApi } from "@/lib/api";
import { OnboardingScreen } from "./onboarding-screen";
import { refreshWorkspaceInfo, useWorkspaceInfo } from "./use-workspace-info";

/* Girişli ama kurumu (membership) olmayan kullanıcıya onboarding gösterir.
   Kurum yoksa backend authed uçları 403 döner (GET /api/auth/me dahil) → önce kurum oluşturulur.
   ÖNEMLİ: Yalnız KESİN 403 sinyalinde onboarding. Geçici kimlik hatası (ağ/401/5xx) mevcut üyeyi
   yanlışlıkla "kurum oluştur" ekranına düşürmemeli (mükerrer org riski) → hata/yeniden-dene. */
export function OrgGate({ children }: { children: ReactNode }) {
  const { noOrg, identityError, ready } = useWorkspaceInfo();
  if (usingRealApi && ready) {
    if (identityError) return <WorkspaceError message={identityError} />;
    if (noOrg) return <OnboardingScreen />;
  }
  return <>{children}</>;
}

function WorkspaceError({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-md border border-border bg-surface p-8 text-center">
        <h1 className="text-lg font-medium text-ink">Çalışma alanı yüklenemedi</h1>
        <p className="mt-2 text-[13.5px] leading-relaxed text-ink-muted">{message}</p>
        <p className="mt-1 text-[12.5px] text-ink-subtle">
          Geçici bir bağlantı sorunu olabilir. Lütfen tekrar deneyin.
        </p>
        <button
          type="button"
          onClick={() => refreshWorkspaceInfo()}
          className="mt-5 border border-border-strong px-4 py-2 text-[12.5px] font-medium uppercase tracking-[0.06em] text-ink transition-colors hover:bg-surface-2"
        >
          Tekrar dene
        </button>
      </div>
    </div>
  );
}
