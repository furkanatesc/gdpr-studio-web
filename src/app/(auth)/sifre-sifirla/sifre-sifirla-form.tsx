"use client";

import { useState } from "react";
import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Arrow, Icon } from "@/components/ui/icon";
import { supabase, usingAuth } from "@/lib/supabase";

export default function SifreSifirlaForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError(null);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (resetError) {
      setError("Sıfırlama başarısız: " + resetError.message);
      return;
    }
    setSent(true);
  }

  return (
    <div className="theme-brand flex min-h-dvh bg-bg text-ink">
      {/* Sol — form */}
      <div
        className="flex w-full flex-col justify-between px-10 py-12 md:w-[460px] md:px-14"
        style={{ paddingTop: "max(3rem, env(safe-area-inset-top))" }}
      >
        <div className="font-display text-[19px]">
          KVKK <span className="text-accent">Yönetim</span>
        </div>

        <div className="max-w-sm">
          <p className="eyebrow mb-3">Avukat Portalı</p>
          <h1 className="font-display text-4xl leading-tight">Parola sıfırla</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
            Kayıtlı e-posta adresinize sıfırlama bağlantısı gönderilecektir.
          </p>

          {!usingAuth ? (
            <div className="mt-8 rounded-[var(--radius)] border border-border bg-surface-2 px-5 py-4 text-[13px] text-ink-muted">
              Parola sıfırlama yakında — kimlik doğrulama henüz yapılandırılmamış.
            </div>
          ) : sent ? (
            <div className="mt-8 flex items-start gap-3 rounded-[var(--radius)] border border-accent/30 bg-accent/10 px-5 py-4">
              <Icon name="check-circle" className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-accent" />
              <div>
                <p className="text-[13px] font-medium text-ink">Sıfırlama bağlantısı gönderildi</p>
                <p className="mt-1 text-[12px] text-ink-muted">
                  <strong className="text-ink">{email}</strong> adresine gönderilen bağlantıya tıklayın.
                  Gelen kutunuzu kontrol edin; spam klasörünü de unutmayın.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-4">
              {error && (
                <p className="rounded-[var(--radius)] border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
                  {error}
                </p>
              )}
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
        </div>

        <p className="text-[11px] text-ink-subtle">
          Masaüstü sürümünde verileriniz cihazınızdan hiç çıkmadan, yerel olarak işlenir.
        </p>
      </div>

      {/* Sağ — sinematik görsel */}
      <div className="relative hidden flex-1 overflow-hidden border-l border-border md:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 90% at 70% 10%, rgba(217,184,92,0.18), transparent 55%), radial-gradient(120% 120% at 30% 100%, rgba(217,184,92,0.08), transparent 50%), #15110b",
          }}
        />
        <div className="relative flex h-full flex-col items-center justify-center px-12 text-center">
          <div className="font-display text-[120px] leading-none tracking-tight text-ink/90">
            K<span className="text-accent">.</span>Y
          </div>
          <p className="mt-6 max-w-md font-display text-2xl leading-snug text-ink">
            Hukuki doğruluk,
            <br />
            gerçek envanterden.
          </p>
          <p className="mt-4 text-[13px] tracking-wide text-ink-muted">
            Uydurmayan yapay zekâ · madde-atıflı · avukat onayına hazır taslak
          </p>
        </div>
      </div>
    </div>
  );
}
