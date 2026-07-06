"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/ui/icon";
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
      setError(
        err instanceof Error ? err.message : "Davet kabul edilemedi.",
      );
    }
  }

  async function handleAuthAndAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
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

    // Auth succeeded — now accept the invitation
    try {
      await acceptInvitation(token);
      router.push("/app");
    } catch (err) {
      setLoading(false);
      setError(
        err instanceof Error ? err.message : "Davet kabul edilemedi.",
      );
    }
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
          <p className="eyebrow mb-3">Davet</p>
          <h1 className="font-display text-4xl leading-tight">Ekibe katılın</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
            Davetinizi kabul ederek KVKK &amp; GDPR uyum ekibinize katılın.
          </p>

          {!usingAuth ? (
            <div className="mt-8 border border-border bg-surface-2 px-5 py-4 text-[13px] text-ink-muted">
              Davet yakında — kimlik doğrulama henüz yapılandırılmamış.
            </div>
          ) : authLoading ? (
            <div className="mt-8 text-[13px] text-ink-muted">Yükleniyor…</div>
          ) : session ? (
            /* Oturum var — doğrudan kabul butonu */
            <div className="mt-8 space-y-4">
              {error && (
                <p className=" border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
                  {error}
                </p>
              )}
              <p className="text-[13px] text-ink-muted">
                <span className="font-medium text-ink">{session.user.email}</span> olarak giriş yapıldı.
              </p>
              <Button className="w-full" disabled={loading} onClick={doAccept}>
                {loading ? "Kabul ediliyor…" : <><span>Daveti Kabul Et</span> <Arrow /></>}
              </Button>
            </div>
          ) : (
            /* Oturum yok — giriş/kayıt formu */
            <>
              {/* Sekme geçişi */}
              <div className="mt-8 flex gap-4 border-b border-border">
                <button
                  type="button"
                  onClick={() => { setMode("giris"); setError(null); setInfo(null); }}
                  className={
                    "pb-2 text-[13px] font-medium transition-colors " +
                    (mode === "giris"
                      ? "border-b-2 border-accent text-ink"
                      : "text-ink-muted hover:text-ink")
                  }
                >
                  Giriş Yap
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("kayit"); setError(null); setInfo(null); }}
                  className={
                    "pb-2 text-[13px] font-medium transition-colors " +
                    (mode === "kayit"
                      ? "border-b-2 border-accent text-ink"
                      : "text-ink-muted hover:text-ink")
                  }
                >
                  Hesap Oluştur
                </button>
              </div>

              <form onSubmit={handleAuthAndAccept} className="mt-6 space-y-4">
                {error && (
                  <p className=" border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] text-red-400">
                    {error}
                  </p>
                )}
                {info && (
                  <p className=" border border-accent/30 bg-accent/10 px-4 py-2.5 text-[13px] text-ink">
                    {info}
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
                    ? (mode === "giris" ? "Giriş yapılıyor…" : "Hesap oluşturuluyor…")
                    : <><span>{mode === "giris" ? "Giriş Yap ve Kabul Et" : "Kayıt Ol ve Kabul Et"}</span> <Arrow /></>}
                </Button>
              </form>
            </>
          )}
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
