const PLATFORMS = [
  { os: "Windows", icon: "🪟", file: ".exe yükleyici", note: "Windows 10/11 (64-bit)" },
  { os: "macOS", icon: "", file: ".dmg paketi", note: "macOS 12+ (Apple Silicon & Intel)" },
  { os: "Linux", icon: "🐧", file: ".AppImage", note: "Ubuntu 22.04+ / çoğu dağıtım" },
];

export default function IndirPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="eyebrow mb-3">Masaüstü Uygulaması · BYOK</p>
        <h1 className="font-display text-5xl leading-tight text-ink">
          Veriniz cihazınızda kalsın
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          GDPR.Studio masaüstü uygulaması, kendi Anthropic API anahtarınızla (BYOK) çalışır.
          Tüm doküman üretimi yerelde yapılır; kişisel veriler bizim sunucularımıza hiç gönderilmez.
        </p>
      </div>

      <div className="mt-14 grid gap-4 md:grid-cols-3">
        {PLATFORMS.map((p) => (
          <div
            key={p.os}
            className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-7 text-center"
          >
            <div className="text-3xl">{p.icon}</div>
            <h2 className="mt-3 font-display text-xl text-ink">{p.os}</h2>
            <p className="mt-1 text-[13px] text-ink-subtle">{p.file}</p>
            <p className="mt-0.5 text-[12px] text-ink-subtle">{p.note}</p>
            <a
              href="#"
              aria-disabled
              className="mt-5 inline-flex w-full items-center justify-center rounded-pill bg-accent px-5 py-2.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
            >
              İndir
            </a>
          </div>
        ))}
      </div>

      <p className="mt-6 text-center text-[12px] text-ink-subtle">
        İndirme bağlantıları yayın sürümünde aktifleşecektir.
      </p>

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <h3 className="font-display text-lg text-ink">Sistem gereksinimleri</h3>
          <ul className="mt-3 space-y-1.5 text-[13.5px] text-ink-muted">
            <li>· Geçerli bir Anthropic Claude API anahtarı (BYOK)</li>
            <li>· 4 GB RAM, 500 MB disk alanı</li>
            <li>· İnternet bağlantısı (yalnızca model çağrıları için)</li>
          </ul>
        </div>
        <div className="rounded-[var(--radius)] border border-border bg-surface p-6">
          <h3 className="font-display text-lg text-ink">Web mi, masaüstü mü?</h3>
          <p className="mt-3 text-[13.5px] leading-relaxed text-ink-muted">
            <strong className="text-ink">Web:</strong> kurulum yok, ekipçe erişim, faturalama bizde.
            <br />
            <strong className="text-ink">Masaüstü:</strong> maksimum gizlilik, kendi anahtarınız,
            veri yerelde.
          </p>
        </div>
      </div>
    </div>
  );
}
