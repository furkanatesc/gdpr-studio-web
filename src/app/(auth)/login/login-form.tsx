"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/ui/icon";
import { AuthShell, AuthError, AuthInfo } from "@/components/auth/auth-shell";
import { supabase, usingAuth } from "@/lib/supabase";
import { safeNext } from "@/lib/gate-decision";

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || loading) return;
    setError(null);
    setLoading(true);
    try {
      // Timeout: askıda kalan bir signIn (ör. auth-js lock'u tutan takılı refresh
      // ya da ağ stall'ı) butonu kalıcı disabled bırakmasın. finally her hâlde açar.
      const { error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password }),
        15000,
      );
      if (authError) {
        setError("Giriş başarısız: e-posta veya parola hatalı.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next");
      router.push(next ? safeNext(next) : "/app");
    } catch {
      setError("Bağlantı zaman aşımına uğradı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Avukat Portalı"
      title="Tekrar hoş geldiniz"
      description="KVKK & GDPR dokümanlarınızı kaldığınız yerden sürdürün."
    >
      {!usingAuth ? (
        <div className="mt-8">
          <AuthInfo>Giriş yakında — kimlik doğrulama henüz yapılandırılmamış.</AuthInfo>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <AuthError>{error}</AuthError>}
          <Field label="E-posta">
            <Input
              type="email"
              placeholder="ad@hukukburonuz.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </Field>
          <Field label="Parola">
            <Input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Giriş yapılıyor…" : <><span>Giriş Yap</span> <Arrow /></>}
          </Button>
          <p className="text-right text-[12px] text-ink-muted">
            <Link href="/sifre-sifirla" className="hover:text-accent">
              Parolamı unuttum
            </Link>
          </p>
        </form>
      )}

      <p className="mt-5 text-[13px] text-ink-muted">
        Hesabınız yok mu?{" "}
        <Link href="/kayit" className="text-accent hover:text-accent-strong">
          Kayıt olun
        </Link>
      </p>
    </AuthShell>
  );
}
