import Link from "next/link";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="theme-brand flex min-h-screen bg-bg text-ink">
      {/* Sol — form */}
      <div className="flex w-full flex-col justify-between px-10 py-12 md:w-[460px] md:px-14">
        <div className="font-display text-[19px]">
          GDPR<span className="text-accent">.Studio</span>
        </div>

        <div className="max-w-sm">
          <p className="eyebrow mb-3">Avukat Portalı</p>
          <h1 className="font-display text-4xl leading-tight">Tekrar hoş geldiniz</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
            KVKK & GDPR dokümanlarınızı kaldığınız yerden sürdürün.
          </p>

          <form action="/app" className="mt-8 space-y-4">
            <Field label="E-posta">
              <Input type="email" placeholder="ad@hukukburonuz.com" />
            </Field>
            <Field label="Parola">
              <Input type="password" placeholder="••••••••••" />
            </Field>
            <Button type="submit" className="w-full">
              Giriş Yap →
            </Button>
          </form>

          <p className="mt-5 text-[13px] text-ink-muted">
            Hesabınız yok mu?{" "}
            <Link href="#" className="text-accent hover:text-accent-strong">
              Kayıt olun
            </Link>
          </p>
        </div>

        <p className="text-[11px] text-ink-subtle">
          Masaüstü sürümünde kendi API anahtarınızla (BYOK), veriniz cihazınızdan çıkmadan
          çalışabilirsiniz.
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
            G<span className="text-accent">.</span>S
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
