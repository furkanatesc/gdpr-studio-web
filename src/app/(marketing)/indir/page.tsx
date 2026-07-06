import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

const PLATFORMS: { os: string; icon: IconName; file: string; note: string }[] = [
  { os: "Windows", icon: "windows", file: ".exe yükleyici", note: "Windows 10/11 (64-bit)" },
  { os: "macOS", icon: "apple", file: ".dmg paketi", note: "macOS 12+ (Apple Silicon & Intel)" },
];

export const metadata = {
  title: "İndir — KVKK Yönetim Masaüstü",
  description:
    "KVKK Yönetim masaüstü uygulaması; doküman üretimi cihazınızda yerel olarak çalışır. Windows ve macOS. Standart / Premium üyelere özeldir.",
};

export default function IndirPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      {/* Sayfa başlığı grameri */}
      <div className="border-b border-border pb-8">
        <p className="eyebrow">Masaüstü uygulaması — Standart / Premium üyelik</p>
        <h1 className="mt-4 font-display text-4xl font-light leading-tight text-ink md:text-5xl">
          Veriniz cihazınızda kalsın.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Masaüstü uygulamasında tüm doküman üretimi cihazınızda, yerel olarak gerçekleşir; bunun
          için kendi Claude API anahtarınızı kullanırsınız.
        </p>
      </div>

      {/* Üyelik kapısı uyarısı — düz metin, kart/dolgu yok (3 renk kuralı) */}
      <p className="mt-10 flex items-center gap-2 text-[13.5px] text-ink">
        <Icon name="lock" className="text-[14px] text-accent" />
        İndirme bağlantıları yalnızca giriş yapmış Standart / Premium üyelere açılır.
      </p>

      <div className="mx-auto mt-10 grid max-w-2xl gap-5 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div
            key={p.os}
            data-reveal
            className="border border-border bg-surface p-8 text-center transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <Icon name={p.icon} className="mx-auto text-[32px] text-ink" />
            <h2 className="mt-4 font-display text-2xl text-ink">{p.os}</h2>
            <p className="mt-1 font-medium text-[11px] text-ink-subtle">{p.file}</p>
            <p className="mt-0.5 text-[12px] text-ink-subtle">{p.note}</p>
            <Link
              href="/login"
              className="mt-6 inline-flex w-full items-center justify-center gap-1.5 border border-border-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <Icon name="lock" className="text-[15px]" /> Üyelikle indir
            </Link>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-2xl text-center text-[13px] text-ink-muted">
        Henüz üye değil misiniz?{" "}
        <Link
          href="/fiyatlandirma"
          className="text-accent underline underline-offset-4 decoration-[1px] hover:text-accent-strong"
        >
          Standart&apos;a geçin
        </Link>{" "}
        veya{" "}
        <Link
          href="/login"
          className="text-accent underline underline-offset-4 decoration-[1px] hover:text-accent-strong"
        >
          giriş yapın
        </Link>
        . Giriş sırasında üyelik durumunuz doğrulanır.
      </div>

      <div className="mt-16 grid gap-5 md:grid-cols-2">
        <div data-reveal className="border border-border bg-surface p-7">
          <h3 className="font-display text-lg text-ink">Sistem gereksinimleri</h3>
          <ul className="mt-3 space-y-1.5 text-[13.5px] leading-relaxed text-ink-muted">
            <li>· Aktif Standart / Premium üyelik (lisans masaüstünde doğrulanır)</li>
            <li>· Geçerli bir Claude API anahtarı (doküman üretimi için)</li>
            <li>· 4 GB RAM, 500 MB disk alanı</li>
            <li>· İnternet bağlantısı (model çağrıları ve lisans kontrolü için)</li>
          </ul>
        </div>
        <div data-reveal className="border border-border bg-surface p-7">
          <h3 className="font-display text-lg text-ink">Web mi, masaüstü mü?</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
            <strong className="font-medium text-ink">Web:</strong> kurulum yok, ekipçe erişim,
            faturalama bizde.
            <br />
            <strong className="font-medium text-ink">Masaüstü:</strong> maksimum gizlilik, kendi
            anahtarınız, veri yerelde (Standart üyelik gerekir).
          </p>
        </div>
      </div>
    </div>
  );
}
