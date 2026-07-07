"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/ui/icon";
import { AuthShell, AuthError, AuthInfo } from "@/components/auth/auth-shell";
import { supabase, usingAuth } from "@/lib/supabase";

export default function SifreSifirlaForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || loading) return;
    setError(null);
    setLoading(true);
    // Bağlantı, parolanın gerçekten güncellenebileceği sayfaya döner (akışın ikinci yarısı).
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/yeni-parola`,
    });
    setLoading(false);
    if (resetError) {
      setError("Sıfırlama başarısız: " + resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthShell
      eyebrow="Avukat Portalı"
      title="Parola sıfırla"
      description="Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderilecektir."
    >
      {!usingAuth ? (
        <div className="mt-8">
          <AuthInfo>Parola sıfırlama yakında — kimlik doğrulama henüz yapılandırılmamış.</AuthInfo>
        </div>
      ) : sent ? (
        <div className="mt-8">
          <p className="text-[14px] font-medium text-ink">Sıfırlama bağlantısı gönderildi.</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-muted">
            <strong className="font-medium text-ink">{email}</strong> adresine gönderilen
            bağlantıya tıklayarak yeni parolanızı belirleyin. Gelen kutunuzu kontrol edin;
            spam klasörünü de unutmayın.
          </p>
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
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Gönderiliyor…" : <><span>Sıfırlama Bağlantısı Gönder</span> <Arrow /></>}
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
