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
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError("Giriş başarısız: e-posta veya parola hatalı.");
      return;
    }
    router.push("/app");
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
