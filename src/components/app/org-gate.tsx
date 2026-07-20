"use client";

import type { ReactNode } from "react";
import { usingRealApi } from "@/lib/api";
import { OnboardingScreen } from "./onboarding-screen";
import { useWorkspaceInfo } from "./use-workspace-info";

/* Girişli ama kurumu (membership) olmayan kullanıcıya onboarding gösterir.
   Kurum yoksa backend authed uçları 403 döner (üretim vb. çalışmaz) → önce kurum oluşturulur. */
export function OrgGate({ children }: { children: ReactNode }) {
  const { identity, ready } = useWorkspaceInfo();
  if (usingRealApi && ready && identity === null) return <OnboardingScreen />;
  return <>{children}</>;
}
