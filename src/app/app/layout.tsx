"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";
import { useAuth } from "@/lib/auth-context";
import { usingAuth } from "@/lib/supabase";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session && usingAuth) router.replace("/login");
  }, [loading, session, router]);

  if (loading) return <div className="p-8">Yükleniyor…</div>;

  return <AppShell>{children}</AppShell>;
}
