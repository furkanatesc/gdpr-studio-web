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
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="text-center">
        <p className="eyebrow mb-3">Ekip</p>
        <h1 className="font-display text-4xl leading-tight text-ink">
          Hukuk ve mühendisliğin kesişiminde
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-ink-muted">
          Veri koruma hukuku ile modern yazılım mühendisliğini bir araya getiren bir ekip.
        </p>
      </div>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {TEAM.map((m, i) => (
          <div
            key={i}
            data-reveal
            className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-7 text-center transition-all duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[var(--shadow-card)]"
          >
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent-soft font-display text-xl text-accent">
              {m.initials}
            </div>
            <h2 className="mt-4 font-display text-lg text-ink">{m.name}</h2>
            <p className="mt-1 text-[13px] text-ink-muted">{m.role}</p>
          </div>
        ))}
      </div>

      <p className="mt-8 text-center text-[12px] text-ink-subtle">
        Ekip bilgileri yer tutucudur; gerçek içerikle güncellenecektir.
      </p>
    </div>
  );
}
