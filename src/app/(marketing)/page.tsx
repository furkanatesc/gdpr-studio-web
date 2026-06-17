import Link from "next/link";
import { DOC_CATALOG } from "@/lib/catalog";
import { Book3DIntro } from "@/components/marketing/book-3d-intro";
import { ScrollReveals } from "@/components/marketing/scroll-reveals";

const STEPS = [
  {
    no: "01",
    title: "Envanterinizi tanımlayın",
    desc: "Kişisel veri kategorilerinizi, amaçlarınızı ve hukuki dayanaklarınızı bir kez girin. Sistem bunları her dokümanda kullanır.",
  },
  {
    no: "02",
    title: "Doküman türünü seçin",
    desc: "Aydınlatma metni, çerez politikası, DPIA, DPA, ihlal bildirimi ve işleme kaydı — formu doldurun, üretin.",
  },
  {
    no: "03",
    title: "Avukat onayına hazır taslak",
    desc: "Madde-atıflı, envantere dayalı, uydurmasız bir taslak. İndirin, hukukçunuza iletin.",
  },
];

const FEATURES = [
  {
    title: "Uydurmayan yapay zekâ",
    desc: "Her hukuki sebep, amaç ve süre gerçek envanterinizden gelir. Veri yoksa model uydurmaz, alanı avukata bırakır.",
  },
  {
    title: "Madde-atıflı çıktı",
    desc: "Her değerlendirme ilgili KVKK / GDPR maddesine atıf yapar (ör. KVKK m.5/2-ç, GDPR m.6/1-c).",
  },
  {
    title: "Özel nitelikli veri koruması",
    desc: "Sağlık, biyometrik, ceza mahkûmiyeti gibi m.6 verileri tespit edilir; açık rıza ve ek tedbir uyarısı eklenir.",
  },
  {
    title: "Masaüstünde tam gizlilik",
    desc: "Electron uygulamasında kendi API anahtarınızla (BYOK) çalışın — veriniz cihazınızdan hiç çıkmaz.",
  },
  {
    title: "Diğer AI araçlarıyla entegre",
    desc: "MCP server desteğiyle KVKK motorunu Claude Desktop, Cursor ve diğer AI istemcilerinden kullanın.",
  },
  {
    title: "Avukat-merkezli iş akışı",
    desc: "Her çıktı 'avukat incelemesine tabi taslak' notuyla gelir. Karar ve sorumluluk her zaman hukukçuda.",
  },
];

export default function LandingPage() {
  return (
    <>
      <Book3DIntro />
      <ScrollReveals />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 60% at 50% -10%, rgba(217,184,92,0.16), transparent 60%)",
          }}
        />
        <div className="relative mx-auto max-w-4xl px-6 pb-20 pt-24 text-center">
          <p className="eyebrow mb-5">KVKK 6698 · GDPR 2016/679</p>
          <h1 className="font-display text-5xl leading-[1.1] text-ink md:text-6xl">
            Hukuki doğruluk,
            <br />
            <span className="text-accent">gerçek envanterden.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-[16px] leading-relaxed text-ink-muted">
            Avukatlar için KVKK & GDPR uyum dokümanlarını saniyeler içinde üreten, ama
            asla uydurmayan yapay zekâ platformu. Madde-atıflı, envantere dayalı, onaya hazır.
          </p>
          <div className="mt-9 flex items-center justify-center gap-3">
            <Link
              href="/login"
              className="rounded-pill bg-accent px-6 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
            >
              Ücretsiz Dene
            </Link>
            <Link
              href="/indir"
              className="rounded-pill border border-border-strong px-6 py-3 text-sm font-medium text-ink transition-colors hover:bg-surface-2"
            >
              Masaüstü için indir ↗
            </Link>
          </div>
        </div>
      </section>

      {/* Nasıl çalışır */}
      <section className="mx-auto max-w-5xl px-6 py-16">
        <p className="eyebrow mb-3 text-center">Nasıl çalışır</p>
        <h2 className="text-center font-display text-3xl text-ink">Üç adımda uyum dokümanı</h2>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.no}>
              <div className="font-display text-2xl text-accent">{s.no}</div>
              <h3 className="mt-3 font-display text-lg text-ink">{s.title}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Özellikler */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="eyebrow mb-3 text-center">Neden KVKK Yönetim</p>
          <h2 className="text-center font-display text-3xl text-ink">
            Hızdan ödün vermeden, hukuki güvenle
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-6"
              >
                <h3 className="font-display text-[16px] text-ink">{f.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Doküman türleri */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <p className="eyebrow mb-3 text-center">Kapsam</p>
          <h2 className="text-center font-display text-3xl text-ink">Altı temel uyum dokümanı</h2>
          <div className="mt-10 grid gap-3 md:grid-cols-2">
            {DOC_CATALOG.map((d) => (
              <div
                key={d.type}
                className="flex items-start gap-3 rounded-[var(--radius)] border border-border bg-surface p-4"
              >
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-accent-soft font-mono text-xs text-accent">
                  {d.no}
                </span>
                <div>
                  <h3 className="font-display text-[15px] text-ink">{d.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{d.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Masaüstü indirme bandı */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-[calc(var(--radius)+8px)] border border-border bg-surface p-10 text-center">
            <p className="eyebrow mb-3">Masaüstü · BYOK</p>
            <h2 className="font-display text-3xl text-ink">Veriniz cihazınızdan çıkmasın</h2>
            <p className="mx-auto mt-3 max-w-lg text-[14px] leading-relaxed text-ink-muted">
              Gizlilik-hassas dosyalar için Electron masaüstü uygulamasını kendi API
              anahtarınızla kullanın. Tüm işlem yerelde.
            </p>
            <Link
              href="/indir"
              className="mt-6 inline-flex rounded-pill bg-accent px-6 py-3 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
            >
              İndirme seçenekleri ↗
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-3xl px-6 py-20 text-center">
          <h2 className="font-display text-4xl leading-tight text-ink">
            İlk dokümanınızı bugün üretin
          </h2>
          <div className="mt-7">
            <Link
              href="/login"
              className="rounded-pill bg-accent px-7 py-3.5 text-sm font-medium text-accent-contrast transition-colors hover:bg-accent-strong"
            >
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
