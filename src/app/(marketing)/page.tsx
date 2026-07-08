import Image from "next/image";
import { ButtonLink } from "@/components/ui/button-link";
import { ContextPhoto } from "@/components/marketing/context-photo";
import { DOC_CATALOG } from "@/lib/catalog";

const STEPS = [
  {
    title: "Envanterinizi tanımlayın",
    desc: "Kişisel veri kategorilerinizi, amaçlarınızı ve hukuki dayanaklarınızı bir kez girin. Sistem bunları her dokümanda kullanır.",
  },
  {
    title: "Doküman türünü seçin",
    desc: "Aydınlatma metni, çerez politikası, DPIA, DPA, ihlal bildirimi ve işleme kaydı — formu doldurun, üretin.",
  },
  {
    title: "Avukat onayına hazır taslak",
    desc: "Madde atıflı, envantere dayalı, uydurmasız bir taslak. İndirin, hukukçunuza iletin.",
  },
];

const PRINCIPLES = [
  {
    title: "Özel nitelikli veri koruması",
    desc: "Sağlık, biyometrik, ceza mahkûmiyeti gibi m.6 verileri tespit edilir; açık rıza ve ek tedbir uyarısı eklenir.",
    img: "/photos/foto-biyometri.jpg",
  },
  {
    title: "Diğer AI araçlarıyla entegre",
    desc: "MCP server desteğiyle KVKK motorunu Claude Desktop, Cursor ve diğer AI istemcilerinden kullanın.",
    img: "/photos/foto-kablo.jpg",
  },
  {
    title: "Avukat-merkezli iş akışı",
    desc: "Her çıktı 'avukat incelemesine tabi taslak' notuyla gelir. Karar ve sorumluluk her zaman hukukçuda.",
    img: "/photos/foto-imza.jpg",
  },
];

/** Hero'daki kağıt belge objesi — açık şemaya dönmek için theme-brand ile sarılır. */
function HeroDocumentCard() {
  return (
    <div className="theme-brand relative hidden select-none lg:block lg:translate-x-12" aria-hidden>
      {/* Arka kağıt (istif hissi) */}
      <div className="absolute left-8 top-6 h-full w-full rotate-[4deg] bg-[#e9ecf0]" />

      {/* Ön kağıt */}
      <div className="relative w-[400px] -rotate-[2.5deg] border border-border bg-white p-7 shadow-[0_18px_48px_rgba(10,18,32,0.35)]">
        <div className="flex items-center justify-between font-medium text-[9.5px] uppercase tracking-[0.12em]">
          <span className="text-ink-muted">Aydınlatma Metni</span>
          <span className="text-accent">Taslak · v1</span>
        </div>
        <div className="mt-3 border-t border-border pt-4">
          <p className="font-display text-[19px] leading-snug text-ink">
            Kişisel Verilerin İşlenmesine İlişkin Aydınlatma Metni
          </p>
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-muted">
            İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu&apos;nun 10.
            maddesi uyarınca, veri sorumlusu sıfatıyla hazırlanmıştır.
          </p>
          <p className="mt-4 font-display text-[13px] text-ink">2. İşlemenin Hukuki Dayanağı</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {["KVKK m.5/2-ç", "GDPR m.6/1-c", "KVKK m.10"].map((c) => (
              <span
                key={c}
                className="border border-border px-2 py-1 font-medium text-[9px] text-accent"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="mt-3 text-[10.5px] leading-relaxed text-ink-muted">
            Veri sorumlusunun hukuki yükümlülüğünü yerine getirebilmesi için zorunlu olması hukuki
            sebebine dayanılarak; kimlik ve iletişim verileriniz, iş sözleşmesinin kurulması ve
            ifası amacıyla işlenmektedir.
          </p>
          <p className="mt-4 font-display text-[13px] text-ink">3. Saklama Süresi</p>
          <p className="mt-2 text-[10.5px] leading-relaxed text-danger">
            [ Envanterde saklama süresi tanımlı değil — avukat değerlendirmesine bırakılmıştır. ]
          </p>
        </div>
      </div>

      {/* Mühür — taslak damgası */}
      <div className="absolute -right-3 bottom-4 flex h-[104px] w-[104px] rotate-[8deg] items-center justify-center border-[1.5px] border-danger/85">
        <div className="flex h-[88px] w-[88px] items-center justify-center border border-danger/55">
          <p className="text-center text-[10px] font-medium leading-[1.5] tracking-[0.08em] text-danger/90">
            TASLAK
            <br />
            İNCELEME
            <br />
            GEREKLİ
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Hero — koyu kayrak bant: fotoğraf + lacivert örtü + terracotta panel (sözleşme §0) */}
      <section className="theme-band relative overflow-hidden bg-bg text-ink">
        {/* Fotoğraf katmanı — Lady Justice, Old Bailey (CC BY 2.0, Wikimedia Commons).
            Katman %130 genişletilip sola kaydırılır: heykel ekranın sol üçlüsüne düşer,
            belge kartının arkasından çıkar. */}
        <div className="absolute inset-y-0 left-0 w-full lg:-left-1/2 lg:w-[130%]" aria-hidden>
          <Image
            src="/hero-justice.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover brightness-[.55] grayscale"
          />
        </div>
        {/* Lacivert örtü */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(12,25,44,0.92) 0%, rgba(18,48,85,0.9) 100%)",
          }}
        />
        {/* Terracotta doku paneli */}
        <div className="absolute inset-y-0 right-0 hidden w-[27%] overflow-hidden bg-[#be5827] lg:block">
          <svg className="absolute inset-0 h-full w-full" aria-hidden>
            <circle cx="100%" cy="120" r="130" fill="none" stroke="#fff" strokeOpacity="0.07" strokeWidth="1.5" />
            <circle cx="100%" cy="120" r="230" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="1.5" />
            <circle cx="100%" cy="120" r="330" fill="none" stroke="#fff" strokeOpacity="0.05" strokeWidth="1.5" />
            <circle cx="0" cy="85%" r="170" fill="none" stroke="#fff" strokeOpacity="0.06" strokeWidth="1.5" />
            <circle cx="0" cy="85%" r="280" fill="none" stroke="#fff" strokeOpacity="0.05" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-16 px-6 pb-24 pt-20 md:pt-24 lg:grid-cols-[minmax(0,1fr)_470px] lg:pb-28">
          <div>
            <p className="flex items-center gap-3.5">
              <span aria-hidden className="h-px w-7 bg-accent-strong" />
              <span className="font-medium text-[11.5px] uppercase tracking-[0.12em] text-ink-muted">
                KVKK 6698 · GDPR 2016/679 — Madde atıflı üretim
              </span>
            </p>
            <h1 className="mt-7 font-display text-5xl font-light leading-[1.06] sm:text-6xl md:text-[72px]">
              Hukuki doğruluk,
              <br />
              <span className="text-accent-strong">gerçek envanterden.</span>
            </h1>
            <p className="mt-7 max-w-[470px] text-[16px] leading-relaxed text-ink-muted">
              Avukatlar için KVKK &amp; GDPR uyum dokümanlarını saniyeler içinde üreten, ama asla
              uydurmayan yapay zekâ platformu. Madde atıflı, envantere dayalı, onaya hazır.
            </p>
            <div className="mt-8 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <ButtonLink href="/login">Ücretsiz Dene</ButtonLink>
              <a
                href="/indir"
                className="font-medium text-[12px] uppercase tracking-[0.08em] text-ink underline underline-offset-4 decoration-[1px] transition-colors hover:text-accent-strong"
              >
                Masaüstü için indir ↗
              </a>
            </div>
            <div className="mt-12 max-w-[470px] border-t border-border pt-3">
              <p className="font-medium text-[10.5px] uppercase tracking-[0.06em] text-ink-subtle">
                * Her çıktı, avukat incelemesine tabi taslaktır. Karar hukukçuda.
              </p>
            </div>
          </div>

          <HeroDocumentCard />
        </div>
      </section>

      {/* Süreç — referans dili: başlık + yalın öğe listesi (numara/ikon yok) */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="eyebrow">Süreç</p>
        <h2 className="mt-4 font-display text-4xl font-light leading-[1.12] text-ink">
          Üç adımda uyum dokümanı.
        </h2>
        <div className="mt-12 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {STEPS.map((s) => (
            <div key={s.title} data-reveal className="border-t border-border pt-6">
              <h3 className="font-display text-[21px] text-ink">{s.title}</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-ink-muted">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bölüm 02 — Kapsam: açık gri bant, fihrist (içindekiler) motifi */}
      <section className="bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-24">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="eyebrow">Kapsam</p>
              <h2 className="mt-4 font-display text-4xl font-light text-ink">
                Altı temel uyum dokümanı.
              </h2>
            </div>
            <p className="font-medium text-[11px] uppercase tracking-[0.06em] text-ink-muted">
              Her belge madde atıflı üretilir
            </p>
          </div>

          <div className="mt-12 space-y-7">
            {DOC_CATALOG.map((d) => (
              <div key={d.type} data-reveal>
                <div className="flex items-baseline gap-4">
                  <span className="font-medium text-[12px] text-accent">{d.no}</span>
                  <h3 className="font-display text-[20px] text-ink">{d.title}</h3>
                  <span
                    aria-hidden
                    className="mx-1 flex-1 -translate-y-1 border-b border-dotted border-border-strong"
                  />
                  <span className="hidden font-medium text-[11px] tracking-[0.04em] text-ink-muted sm:block">
                    {d.mevzuat}
                  </span>
                </div>
                <p className="mt-1.5 pl-8 text-[13px] leading-relaxed text-ink-muted">{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bölüm 03 — Neden: asimetrik bento */}
      <section className="mx-auto max-w-6xl px-6 py-20 md:py-28">
        <p className="eyebrow">Neden KVKK Yönetim</p>
        <h2 className="mt-4 font-display text-4xl font-light text-ink">
          Hızdan ödün vermeden, hukuki güvenle.
        </h2>

        <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,1fr)_400px]">
          {/* Büyük kart — uydurmayan AI + terminal görseli */}
          <div
            data-reveal
            className="border border-border bg-surface p-8 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <p className="font-medium text-[10.5px] uppercase tracking-[0.12em] text-accent">İlke № 1</p>
            <h3 className="mt-3 font-display text-[21px] text-ink">Uydurmayan yapay zekâ</h3>
            <p className="mt-2.5 max-w-xl text-[13.5px] leading-relaxed text-ink-muted">
              Her hukuki sebep, amaç ve süre gerçek envanterinizden gelir. Veri yoksa model
              uydurmaz — alanı işaretler ve avukata bırakır.
            </p>
            {/* Gerçek kod içeriği — mono yalnız burada (tipografi disiplini) */}
            <div className="mt-5 space-y-1.5 bg-surface-2 p-5 font-mono text-[11.5px] leading-relaxed">
              <p className="text-ink-muted">hukuki_sebep &nbsp;←&nbsp; envanter.kayit[3].dayanak</p>
              <p className="text-ink-muted">saklama_suresi &nbsp;←&nbsp; envanter.kayit[3].sure</p>
              <p className="text-accent">sure tanımsız → &quot;[avukat değerlendirmesine bırakıldı]&quot;</p>
              <p className="text-ok">✓ uydurma yok — kaynaksız alan üretilmedi</p>
            </div>
          </div>

          {/* Küçük kart — madde atıf */}
          <div
            data-reveal
            className="border border-border bg-surface p-8 transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <p className="font-medium text-[10.5px] uppercase tracking-[0.12em] text-accent">İlke № 2</p>
            <h3 className="mt-3 font-display text-[21px] text-ink">Madde atıflı çıktı</h3>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">
              Her değerlendirme ilgili KVKK / GDPR maddesine atıf yapar — ör. KVKK m.5/2-ç, GDPR
              m.6/1-c.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {["KVKK m.5/2-ç", "GDPR m.6/1-c", "KVKK m.10", "GDPR m.30"].map((c) => (
                <span key={c} className="border border-border px-2.5 py-1.5 font-medium text-[10px] text-accent">
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div
              key={p.title}
              data-reveal
              className="border border-border bg-surface transition-[transform,box-shadow,border-color] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
            >
              {/* Kart metniyle bağlamsal gerçek fotoğraf (kasa/altyapı/imza) */}
              <ContextPhoto src={p.img} className="h-36 w-full" />
              <div className="p-7">
                <h3 className="font-display text-[19px] text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink-muted">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Bölüm 04 — Masaüstü gizlilik bandı (koyu lacivert) */}
      <section className="theme-band bg-bg text-ink">
        <div className="mx-auto grid max-w-6xl items-center gap-14 px-6 py-20 md:py-28 lg:grid-cols-[minmax(0,1fr)_460px]">
          <div data-reveal>
            <p className="eyebrow">Masaüstü — Standart üyelik</p>
            <h2 className="mt-4 font-display text-4xl font-light leading-[1.12]">
              Veriniz cihazınızdan
              <br />
              çıkmasın.
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-ink-muted">
              Gizlilik açısından hassas dosyalar için masaüstü uygulamasını kullanın; tüm doküman
              üretimi cihazınızda, yerel olarak gerçekleşir. Standart ve Premium üyelere özeldir.
            </p>
            <a
              href="/indir"
              className="mt-6 inline-block font-medium text-[12px] uppercase tracking-[0.08em] text-ink underline underline-offset-4 decoration-[1px] transition-colors hover:text-accent-strong"
            >
              İndirme seçenekleri ↗
            </a>
          </div>

          <div data-reveal className="border border-border bg-surface p-6">
            <div className="flex items-center justify-between font-medium text-[11px] uppercase tracking-[0.12em]">
              <span className="text-ink">Cihazınız</span>
              <span className="text-ink-muted">⌂ Çevrimdışı çalışır</span>
            </div>
            <div className="mt-4 space-y-2">
              {["envanter.db", "üretim motoru", "aydinlatma_metni.docx"].map((f) => (
                <div key={f} className="flex items-center justify-between bg-surface-2 px-4 py-3">
                  <span className="font-medium text-[12px] text-ink-muted">{f}</span>
                  <span className="flex items-center gap-2 font-medium text-[10.5px] tracking-[0.08em] text-ok">
                    <span aria-hidden className="h-1.5 w-1.5 bg-ok" />
                    YEREL
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-medium text-[11.5px] tracking-[0.06em] text-accent">
              DIŞARI GİDEN VERİ — 0 BAYT
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div data-reveal className="mx-auto max-w-3xl px-6 py-24 text-center md:py-32">
          <h2 className="font-display text-5xl font-light leading-tight text-ink md:text-[56px]">
            İlk dokümanınızı bugün üretin.
          </h2>
          <div className="mt-9">
            <ButtonLink href="/login">Ücretsiz Dene</ButtonLink>
          </div>
          <p className="mt-5 font-medium text-[11px] uppercase tracking-[0.08em] text-ink-subtle">
            Kredi kartı gerekmez · İlk belge ücretsiz
          </p>
        </div>
      </section>
    </>
  );
}
