"use client";

import { useEffect, useState } from "react";
import {
  ApiError,
  getBillingStatus,
  getMe,
  usingRealApi,
  type BillingStatus,
  type IdentityOut,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export type WorkspaceInfo = {
  identity: IdentityOut | null;
  billing: BillingStatus | null;
  // Kesin "kuruma ait değil" (GET /api/auth/me → 403) → onboarding göster.
  noOrg: boolean;
  // Geçici kimlik hatası (ağ/401/5xx) → onboarding'e İTME; hata/yeniden-dene göster.
  identityError: string | null;
};

/*
  Kabuk verisi (kurum adı, plan, kullanım) — sözleşme §2.3/§4: veri gerçek API'den gelir;
  mock modda (API yok) hiçbir sahte rakam gösterilmez, tüketen bileşenler kendini gizler.
  Modül seviyesi cache: Sidebar + TopBar + dashboard + faturalama aynı isteği tekrarlamasın.
  refreshWorkspaceInfo(): cache'i tazeler ve abone tüm bileşenleri yeniden besler
  (ör. checkout dönüşünde plan/kota değişmiştir).
*/
let cache: Promise<WorkspaceInfo> | null = null;
const listeners = new Set<() => void>();

function load(): Promise<WorkspaceInfo> {
  if (!cache) {
    cache = Promise.allSettled([getMe(), getBillingStatus()]).then(([me, billing]) => {
      let identity: IdentityOut | null = null;
      let noOrg = false;
      let identityError: string | null = null;
      if (me.status === "fulfilled") {
        identity = me.value;
      } else {
        // /api/auth/me yalnız "kurum/üyelik yok" durumunda 403 döner (bkz. get_current_identity).
        // Geçici hata (fetch reject, 401 oturum, 5xx) mevcut üyeyi onboarding'e DÜŞÜRMEMELİ.
        const reason: unknown = me.reason;
        if (reason instanceof ApiError && reason.status === 403) noOrg = true;
        else identityError = reason instanceof Error ? reason.message : "Kimlik bilgisi alınamadı.";
      }
      return {
        identity,
        billing: billing.status === "fulfilled" ? billing.value : null,
        noOrg,
        identityError,
      };
    });
  }
  return cache;
}

export function refreshWorkspaceInfo(): void {
  if (!usingRealApi) return;
  cache = null;
  load().then(() => listeners.forEach((notify) => notify()));
}

export function useWorkspaceInfo(): WorkspaceInfo & { ready: boolean } {
  const { session } = useAuth();
  const [info, setInfo] = useState<WorkspaceInfo | null>(null);

  useEffect(() => {
    if (!usingRealApi || !session) return;
    let alive = true;
    const pull = () => {
      load().then((v) => {
        if (alive) setInfo(v);
      });
    };
    pull();
    listeners.add(pull);
    return () => {
      alive = false;
      listeners.delete(pull);
    };
  }, [session]);

  return {
    identity: info?.identity ?? null,
    billing: info?.billing ?? null,
    noOrg: info?.noOrg ?? false,
    identityError: info?.identityError ?? null,
    ready: info !== null,
  };
}
