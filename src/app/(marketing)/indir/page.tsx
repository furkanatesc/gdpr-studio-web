import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/icon";

const PLATFORMS: { os: string; icon: IconName; file: string; note: string }[] = [
  { os: "Windows", icon: "windows", file: ".exe yükleyici", note: "Windows 10/11 (64-bit)" },
  { os: "macOS", icon: "apple", file: ".dmg paketi", note: "macOS 12+ (Apple Silicon & Intel)" },
];

export const metadata = {
  title: "İndir — KVKK Yönetim Masaüstü",
  description:
    "KVKK Yönetim masaüstü uygulaması; doküman üretimi cihazınızda yerel olarak çalışır. Windows ve macOS. Pro / Kurumsal üyelere özeldir.",
};

export default function IndirPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="eyebrow mb-3">Masaüstü Uygulaması · Pro üyelik</p>
        <h1 className="font-display text-4xl leading-tight text-ink md:text-5xl">
          Veriniz cihazınızda kalsın
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Masaüstü uygulamasında tüm doküman üretimi cihazınızda, yerel olarak gerçekleşir;
          bunun için kendi Claude API anahtarınızı kullanırsınız. Pro ve Kurumsal üyelere özeldir.
        </p>
      </div>

      {/* Üyelik kapısı uyarısı */}
      <div className="mx-auto mt-8 flex max-w-2xl items-center justify-center gap-2 rounded-pill border border-accent/40 bg-accent-soft px-5 py-2.5 text-center text-[13px] text-accent">
        <Icon name="lock" className="text-[15px]" /> İndirme bağlantıları yalnızca giriş yapmış Pro / Kurumsal üyelere açılır.
      </div>

      <div className="mx-auto mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
        {PLATFORMS.map((p) => (
          <div key={p.os} data-reveal className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-7 text-center">
            <Icon name={p.icon} className="mx-auto text-[32px] text-ink" />
            <h2 className="mt-3 font-display text-xl text-ink">{p.os}</h2>
            <p className="mt-1 text-[13px] text-ink-subtle">{p.file}</p>
            <p className="mt-0.5 text-[12px] text-ink-subtle">{p.note}</p>
            <Link
              href="/login"
              className="mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-pill border border-border-strong px-5 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              <Icon name="lock" className="text-[15px]" /> Üyelikle indir
            </Link>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-2xl text-center text-[13px] text-ink-muted">
        Henüz üye değil misiniz?{" "}
        <Link href="/fiyatlandirma" className="text-accent hover:text-accent-strong">
          Pro&apos;ya geçin
        </Link>{" "}
        veya{" "}
        <Link href="/login" className="text-accent hover:text-accent-strong">
          giriş yapın
        </Link>
        . Giriş sırasında üyelik durumunuz doğrulanır.
      </div>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <div data-reveal className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <h3 className="font-display text-lg text-ink">Sistem gereksinimleri</h3>
          <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-muted">
            <li>· Aktif Pro / Kurumsal üyelik (lisans masaüstünde doğrulanır)</li>
            <li>· Geçerli bir Claude API anahtarı (doküman üretimi için)</li>
            <li>· 4 GB RAM, 500 MB disk alanı</li>
            <li>· İnternet bağlantısı (model çağrıları ve lisans kontrolü için)</li>
          </ul>
        </div>
        <div data-reveal className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <h3 className="font-display text-lg text-ink">Web mi, masaüstü mü?</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
            <strong className="text-ink">Web:</strong> kurulum yok, ekipçe erişim, faturalama bizde.
            <br />
            <strong className="text-ink">Masaüstü:</strong> maksimum gizlilik, kendi anahtarınız,
            veri yerelde (Pro üyelik gerekir).
          </p>
        </div>
      </div>
    </div>
  );
}
