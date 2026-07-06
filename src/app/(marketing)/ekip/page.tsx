export const metadata = {
  title: "Ekip — KVKK Yönetim",
  description: "Veri koruma hukuku ile modern yazılım mühendisliğini bir araya getiren ekip.",
};

const TEAM = [
  { name: "[Ad Soyad]", role: "Kurucu · Mühendislik", initials: "AS" },
  { name: "[Ad Soyad]", role: "Hukukçu · Kurucu", initials: "AS" },
  { name: "[Ad Soyad]", role: "Veri Koruma Danışmanı", initials: "AS" },
];

export default function EkipPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      {/* Sayfa başlığı grameri */}
      <div className="border-b border-border pb-8">
        <p className="eyebrow">Ekip — Hukuk × Mühendislik</p>
        <h1 className="mt-4 font-display text-4xl font-light leading-tight text-ink md:text-5xl">
          Hukuk ve mühendisliğin kesişiminde.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Veri koruma hukuku ile modern yazılım mühendisliğini bir araya getiren bir ekip.
        </p>
      </div>

      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {TEAM.map((m, i) => (
          <div
            key={i}
            data-reveal
            className="border border-border bg-surface p-9 text-center transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center bg-surface-2 font-display text-xl text-accent">
              {m.initials}
            </div>
            <h2 className="mt-5 font-display text-lg text-ink">{m.name}</h2>
            <p className="mt-1.5 font-medium text-[11px] uppercase tracking-[0.06em] text-ink-subtle">
              {m.role}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-10 text-center font-medium text-[10.5px] uppercase tracking-[0.06em] text-ink-subtle">
        * Ekip bilgileri yer tutucudur; gerçek içerikle güncellenecektir.
      </p>
    </div>
  );
}
