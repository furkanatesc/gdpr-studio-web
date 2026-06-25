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

  if (loading) return <div className="p-8">Yükleniyor…</div>;

  return <>{children}</>;
}
