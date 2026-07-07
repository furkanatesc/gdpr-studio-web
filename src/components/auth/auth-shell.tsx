"use client";

import Image from "next/image";

/*
  Auth kabuğu — sözleşme §0: sol beyaz form kolonu + sağda lacivert bantlı GERÇEK fotoğraf
  (Lady Justice, Old Bailey — CC BY 2.0, Wikimedia Commons). Tüm (auth) sayfaları bu kabuğu
  kullanır; sayfa başına panel kopyası tutulmaz.
*/
export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
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
          <p className="eyebrow mb-3">{eyebrow}</p>
          <h1 className="font-display text-4xl leading-tight">{title}</h1>
          <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">{description}</p>
          {children}
        </div>

        <p className="text-[11px] text-ink-subtle">
          Masaüstü sürümünde verileriniz cihazınızdan hiç çıkmadan, yerel olarak işlenir.
        </p>
      </div>

      {/* Sağ — fotoğraflı lacivert bant */}
      <div className="theme-band relative hidden flex-1 overflow-hidden border-l border-border text-ink md:block">
        <Image
          src="/hero-justice.jpg"
          alt=""
          aria-hidden
          fill
          sizes="60vw"
          className="object-cover brightness-[.55] grayscale"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(18,48,85,0.9) 0%, rgba(12,25,44,0.92) 100%)",
          }}
        />
        <div className="relative flex h-full flex-col justify-end px-14 pb-16">
          <p className="max-w-md font-display text-[28px] font-light leading-snug text-ink">
            Hukuki doğruluk,
            <br />
            gerçek envanterden.
          </p>
          <p className="mt-4 font-medium text-[11px] uppercase tracking-[0.1em] text-ink-subtle">
            KVKK 6698 · GDPR 2016/679 — Madde atıflı üretim
          </p>
        </div>
      </div>
    </div>
  );
}

/** Form hatası — durum sözlüğündeki mühür kırmızısı; red-500 gibi palet dışı ton kullanılmaz. */
export function AuthError({ children }: { children: React.ReactNode }) {
  return (
    <p className="border border-danger/40 bg-danger-soft px-4 py-2.5 text-[13px] text-danger">
      {children}
    </p>
  );
}

/** Nötr bilgi kutusu (ör. e-posta doğrulaması bekleniyor, auth yapılandırılmamış). */
export function AuthInfo({ children }: { children: React.ReactNode }) {
  return (
    <div className="border border-border bg-surface-2 px-5 py-4 text-[13px] leading-relaxed text-ink-muted">
      {children}
    </div>
  );
}
