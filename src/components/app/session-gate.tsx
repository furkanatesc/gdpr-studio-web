"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { usingAuth } from "@/lib/supabase";

export function SessionGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session && usingAuth) router.replace("/login");
  }, [loading, session, router]);

  if (loading) return <div role="status" className="p-8">Yükleniyor…</div>;

  // Redirect useEffect tetiklendi ama henüz tamamlanmadı: korunan içeriği render ETME
  // (aksi halde /app içeriği bir an flash eder).
  if (!session && usingAuth) return null;

  return <>{children}</>;
}
