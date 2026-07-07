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
import { bootstrap } from "@/lib/api";

export default function KayitForm() {
  const router = useRouter();
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
    if (signUpError) {
      setLoading(false);
      setError("Kayıt başarısız: " + signUpError.message);
      return;
    }

    if (!data.session) {
      // E-posta doğrulaması bekleniyor — oturum henüz yok, bootstrap çalıştırılamaz.
      setLoading(false);
      setInfo(
        "Hesabınız oluşturuldu. E-postanıza gönderilen doğrulama bağlantısına tıklayın; doğrulama sonrası kurumunuz oluşturulacak.",
      );
      return;
    }

    try {
      await bootstrap(orgName);
    } catch (bootstrapError) {
      setLoading(false);
      setError(
        bootstrapError instanceof Error ? bootstrapError.message : "Kurum oluşturulamadı.",
      );
      return;
    }

    setLoading(false);
    router.push("/app");
  }

  return (
    <AuthShell
      eyebrow="Avukat Portalı"
      title="Hesap oluşturun"
      description="Büronuzu kaydedin ve KVKK & GDPR uyum sürecinizi başlatın."
    >
      {!usingAuth ? (
        <div className="mt-8">
          <AuthInfo>Kayıt yakında — kimlik doğrulama henüz yapılandırılmamış.</AuthInfo>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <AuthError>{error}</AuthError>}
          {info && <AuthInfo>{info}</AuthInfo>}
          <Field label="Firma / Büro Adı">
            <Input
              type="text"
              placeholder="Hukuk Bürosu A.Ş."
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              required
              autoComplete="organization"
            />
          </Field>
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
              placeholder="En az 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Hesap oluşturuluyor…" : <><span>Kayıt Ol</span> <Arrow /></>}
          </Button>
        </form>
      )}

      <p className="mt-5 text-[13px] text-ink-muted">
        Zaten hesabınız var mı?{" "}
        <Link href="/login" className="text-accent hover:text-accent-strong">
          Giriş yapın
        </Link>
      </p>
    </AuthShell>
  );
}
