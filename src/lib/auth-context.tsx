"use client";
import { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthState { session: Session | null; loading: boolean; signOut: () => Promise<void>; }
const Ctx = createContext<AuthState>({ session: null, loading: true, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setLoading(false); });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase?.auth.signOut(); };
  return <Ctx.Provider value={{ session, loading, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
