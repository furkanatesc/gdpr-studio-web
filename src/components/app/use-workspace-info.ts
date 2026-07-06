"use client";

import { useEffect, useState } from "react";
import { getBillingStatus, getMe, usingRealApi, type BillingStatus, type IdentityOut } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export type WorkspaceInfo = {
  identity: IdentityOut | null;
  billing: BillingStatus | null;
};

/*
  Kabuk verisi (kurum adı, plan, kullanım) — sözleşme §2.3/§4: veri gerçek API'den gelir;
  mock modda (API yok) hiçbir sahte rakam gösterilmez, tüketen bileşenler kendini gizler.
  Modül seviyesi cache: Sidebar + TopBar + dashboard aynı isteği tekrarlamasın.
*/
let cache: Promise<WorkspaceInfo> | null = null;

function load(): Promise<WorkspaceInfo> {
  if (!cache) {
    cache = Promise.allSettled([getMe(), getBillingStatus()]).then(([me, billing]) => ({
      identity: me.status === "fulfilled" ? me.value : null,
      billing: billing.status === "fulfilled" ? billing.value : null,
    }));
  }
  return cache;
}

export function useWorkspaceInfo(): WorkspaceInfo & { ready: boolean } {
  const { session } = useAuth();
  const [info, setInfo] = useState<WorkspaceInfo | null>(null);

  useEffect(() => {
    if (!usingRealApi || !session) return;
    let alive = true;
    load().then((v) => {
      if (alive) setInfo(v);
    });
    return () => {
      alive = false;
    };
  }, [session]);

  return { identity: info?.identity ?? null, billing: info?.billing ?? null, ready: info !== null };
}
