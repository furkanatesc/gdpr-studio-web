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
import { useAuth } from "@/lib/auth-context";

/*
  Parola sıfırlama akışının ikinci yarısı: e-postadaki bağlantı buraya döner.
  Supabase istemcisi URL'deki recovery token'ı otomatik işleyip oturumu açar
  (auth-context onAuthStateChange ile yakalar); bu sayfa oturum üzerinden
  updateUser({ password }) çağırır. Oturum yoksa bağlantı geçersiz/süresi dolmuştur.
*/
export default function YeniParolaForm() {
  const router = useRouter();
  const { session, loading: authLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || loading) return;
    if (password !== confirm) {
      setError("Parolalar eşleşmiyor.");
      return;
    }
    setError(null);
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) {
      setError("Parola güncellenemedi: " + updateError.message);
      return;
    }
    router.push("/app");
  }

  return (
    <AuthShell
      eyebrow="Avukat Portalı"
      title="Yeni parola belirleyin"
      description="Hesabınız için yeni bir parola seçin; kaydedildiğinde çalışma alanınıza yönlendirilirsiniz."
    >
      {!usingAuth ? (
        <div className="mt-8">
          <AuthInfo>Parola güncelleme yakında — kimlik doğrulama henüz yapılandırılmamış.</AuthInfo>
        </div>
      ) : authLoading ? (
        <p className="mt-8 text-[13px] text-ink-muted">Bağlantı doğrulanıyor…</p>
      ) : !session ? (
        <div className="mt-8">
          <AuthInfo>
            Sıfırlama bağlantısı geçersiz veya süresi dolmuş.{" "}
            <Link href="/sifre-sifirla" className="text-accent hover:text-accent-strong">
              Yeni bağlantı isteyin
            </Link>
            .
          </AuthInfo>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          {error && <AuthError>{error}</AuthError>}
          <Field label="Yeni parola">
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
          <Field label="Yeni parola (tekrar)">
            <Input
              type="password"
              placeholder="Parolayı tekrar yazın"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </Field>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Kaydediliyor…" : <><span>Parolayı Kaydet</span> <Arrow /></>}
          </Button>
        </form>
      )}

      <p className="mt-5 text-[13px] text-ink-muted">
        Parolanızı hatırladınız mı?{" "}
        <Link href="/login" className="text-accent hover:text-accent-strong">
          Giriş yapın
        </Link>
      </p>
    </AuthShell>
  );
}
