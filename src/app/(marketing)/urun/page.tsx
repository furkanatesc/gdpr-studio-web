import { ButtonLink } from "@/components/ui/button-link";
import { ContextPhoto } from "@/components/marketing/context-photo";

export const metadata = {
  title: "Ürün — KVKK Yönetim",
  description:
    "Uydurmayan yapay zekâ, madde-atıflı çıktı, özel nitelikli veri koruması ve MCP entegrasyonu. KVKK Yönetim'in ürün özellikleri.",
};

const SECTIONS = [
  {
    no: "Grounding",
    title: "Uydurmayan yapay zekâ",
    body: "Geleneksel LLM araçları hukuki sebep ve süreleri uydurur. KVKK Yönetim, çıktının her satırını kurumunuzun gerçek veri envanterine bağlar. Envanterde bir değer yoksa model onu icat etmez — alanı 'avukat tarafından doldurulacak' olarak bırakır.",
    img: "/photos/foto-arsiv.jpg",
  },
  {
    no: "Atıf",
    title: "Madde atıflı hukuki metin",
    body: "Her değerlendirme ilgili KVKK ve GDPR maddesine doğrudan atıf yapar (KVKK m.5/2-ç, GDPR m.6/1-c gibi). Hukuk biriminin incelemesi hızlanır, atıfsız belirsizlik ortadan kalkar.",
    img: "/photos/foto-kitap.jpg",
  },
  {
    no: "Özel nitelikli veri",
    title: "KVKK m.6 farkındalığı",
    body: "Sağlık, biyometrik, genetik veya ceza mahkûmiyeti gibi özel nitelikli veriler otomatik tespit edilir. Bu verilerin yalnızca açık rıza veya sınırlı istisnalarla işlenebileceği ve ek güvenlik tedbirleri açıkça belirtilir.",
    img: "/photos/foto-kasa.png",
  },
  {
    no: "Entegrasyon",
    title: "MCP ile her yerde",
    body: "KVKK grounding motorunu bir MCP server olarak Claude Desktop, Cursor ve diğer AI istemcilerinden kullanın. Ayrıca uygulama çoklu model sağlayıcısını destekler.",
    img: "/photos/foto-kablo.jpg",
  },
];

export default function UrunPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-20">
      {/* Sayfa başlığı grameri */}
      <div className="pb-4">
        <p className="eyebrow">Ürün — Dört ilke</p>
        <h1 className="mt-4 font-display text-5xl font-light leading-[1.1] text-ink md:text-6xl">
          Hız ve hukuki güven,
          <br />
          <span className="text-accent">aynı anda.</span>
        </h1>
      </div>

      <div className="mt-10">
        {SECTIONS.map((s) => (
          <div
            key={s.no}
            data-reveal
            className="grid gap-4 border-t border-border py-11 lg:grid-cols-[240px_minmax(0,1fr)_220px] lg:gap-12"
          >
            <p className="font-medium text-[11.5px] uppercase tracking-[0.1em] text-accent">{s.no}</p>
            <div>
              <h2 className="font-display text-[28px] font-normal text-ink">{s.title}</h2>
              <p className="mt-3 max-w-2xl text-[15px] leading-[1.72] text-ink-muted">{s.body}</p>
            </div>
            {/* İlkeyle bağlamsal gerçek fotoğraf — yalnız geniş ekranda, sessiz */}
            <ContextPhoto src={s.img} className="hidden h-36 lg:block" />
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <ButtonLink href="/login">Ücretsiz Dene</ButtonLink>
      </div>
    </div>
  );
}
