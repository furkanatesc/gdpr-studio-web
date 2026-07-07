"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/ui/icon";
import { AuthShell, AuthError, AuthInfo } from "@/components/auth/auth-shell";
import { supabase, usingAuth } from "@/lib/supabase";
import { useAuth } from "@/lib/auth-context";
import { acceptInvitation } from "@/lib/api";

type Mode = "giris" | "kayit";

export default function DavetForm({ token }: { token: string }) {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<Mode>("giris");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function doAccept() {
    setError(null);
    setLoading(true);
    try {
      await acceptInvitation(token);
      router.push("/app");
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Davet kabul edilemedi.");
    }
  }

  async function handleAuthAndAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || loading) return;
    setError(null);
    setInfo(null);
    setLoading(true);

    if (mode === "giris") {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) {
        setLoading(false);
        setError("Giriş başarısız: e-posta veya parola hatalı.");
        return;
      }
    } else {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setLoading(false);
        setError("Kayıt başarısız: " + signUpError.message);
        return;
      }
      if (!data.session) {
        setLoading(false);
        setInfo(
          "Hesabınız oluşturuldu. E-postanıza gönderilen doğrulama bağlantısına tıklayın; doğrulama sonrası daveti kabul edebilirsiniz.",
        );
        return;
      }
    }

    // Auth başarılı — şimdi daveti kabul et.
    try {
      await acceptInvitation(token);
      router.push("/app");
    } catch (err) {
      setLoading(false);
      setError(err instanceof Error ? err.message : "Davet kabul edilemedi.");
    }
  }

  return (
    <AuthShell
      eyebrow="Davet"
      title="Ekibe katılın"
      description="Davetinizi kabul ederek KVKK & GDPR uyum ekibinize katılın."
    >
      {!usingAuth ? (
        <div className="mt-8">
          <AuthInfo>Davet yakında — kimlik doğrulama henüz yapılandırılmamış.</AuthInfo>
        </div>
      ) : authLoading ? (
        <p className="mt-8 text-[13px] text-ink-muted">Yükleniyor…</p>
      ) : session ? (
        /* Oturum var — doğrudan kabul butonu */
        <div className="mt-8 space-y-4">
          {error && <AuthError>{error}</AuthError>}
          <p className="text-[13px] text-ink-muted">
            <span className="font-medium text-ink">{session.user.email}</span> olarak giriş
            yapıldı.
          </p>
          <Button className="w-full" disabled={loading} onClick={doAccept}>
            {loading ? "Kabul ediliyor…" : <><span>Daveti Kabul Et</span> <Arrow /></>}
          </Button>
        </div>
      ) : (
        /* Oturum yok — giriş/kayıt formu */
        <>
          <div className="mt-8 flex gap-4 border-b border-border">
            {(
              [
                ["giris", "Giriş Yap"],
                ["kayit", "Hesap Oluştur"],
              ] as const
            ).map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setMode(key);
                  setError(null);
                  setInfo(null);
                }}
                className={
                  "pb-2 text-[13px] font-medium transition-colors " +
                  (mode === key
                    ? "border-b-2 border-accent text-ink"
                    : "text-ink-muted hover:text-ink")
                }
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleAuthAndAccept} className="mt-6 space-y-4">
            {error && <AuthError>{error}</AuthError>}
            {info && <AuthInfo>{info}</AuthInfo>}
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
                placeholder={mode === "kayit" ? "En az 8 karakter" : "••••••••••"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={mode === "kayit" ? 8 : undefined}
                autoComplete={mode === "kayit" ? "new-password" : "current-password"}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? mode === "giris"
                  ? "Giriş yapılıyor…"
                  : "Hesap oluşturuluyor…"
                : (
                  <>
                    <span>{mode === "giris" ? "Giriş Yap ve Kabul Et" : "Kayıt Ol ve Kabul Et"}</span>{" "}
                    <Arrow />
                  </>
                )}
            </Button>
          </form>
        </>
      )}
    </AuthShell>
  );
}
