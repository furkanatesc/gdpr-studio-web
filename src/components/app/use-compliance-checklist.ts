"use client";

import { useEffect, useState } from "react";
import { getComplianceChecklist, usingRealApi } from "@/lib/api";
import type { ComplianceChecklist } from "@/lib/types";
import { useAuth } from "@/lib/auth-context";

/*
  Uyum kontrol listesi verisi — sidebar skor bloğu (ComplianceMeter), dashboard skor
  halkası (ScoreRing) ve /app/kontrol sayfası AYNI isteği paylaşır (useWorkspaceInfo
  deseni, duplicate yok). Mock modda (API yok) getComplianceChecklist() boş listeyi
  senkron döner — sahte skor uydurulmaz (UI "—").
  /app/kontrol optimistik durum değişikliklerini kendi yerel state'inde uygular;
  bir PUT başarıyla bitince refreshComplianceChecklist() çağırıp bu cache'i tazeler
  ki sidebar/dashboard skoru da anında güncellensin.
*/
let cache: Promise<ComplianceChecklist> | null = null;
const listeners = new Set<() => void>();

function load(): Promise<ComplianceChecklist> {
  if (!cache) {
    cache = getComplianceChecklist().catch((e) => {
      cache = null; // bir sonraki mount/refresh'te tekrar denensin
      throw e;
    });
  }
  return cache;
}

export function refreshComplianceChecklist(): void {
  cache = null;
  load()
    .then(() => listeners.forEach((notify) => notify()))
    .catch(() => listeners.forEach((notify) => notify()));
}

export function useComplianceChecklist(): {
  checklist: ComplianceChecklist | null;
  ready: boolean;
  error: string | null;
} {
  const { session } = useAuth();
  const [checklist, setChecklist] = useState<ComplianceChecklist | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Gerçek API'de oturum gerekir; mock modda getComplianceChecklist() zaten
    // senkron boş liste döner (oturumsuz da çalışır).
    if (usingRealApi && !session) return;
    let alive = true;
    const pull = () => {
      load()
        .then((c) => {
          if (!alive) return;
          setChecklist(c);
          setError(null);
        })
        .catch((e) => {
          if (!alive) return;
          setError((e as Error).message);
        });
    };
    pull();
    listeners.add(pull);
    return () => {
      alive = false;
      listeners.delete(pull);
    };
  }, [session]);

  return { checklist, ready: checklist !== null || error !== null, error };
}
