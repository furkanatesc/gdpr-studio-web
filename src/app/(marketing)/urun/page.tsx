import { ButtonLink } from "@/components/ui/button-link";

export const metadata = {
  title: "Ürün — KVKK Yönetim",
  description:
    "Uydurmayan yapay zekâ, madde-atıflı çıktı, özel nitelikli veri koruması ve MCP entegrasyonu. KVKK Yönetim'in ürün özellikleri.",
};

const SECTIONS = [
  {
    eyebrow: "Grounding",
    title: "Uydurmayan yapay zekâ",
    body: "Geleneksel LLM araçları hukuki sebep ve süreleri uydurur. KVKK Yönetim, çıktının her satırını kurumunuzun gerçek veri envanterine bağlar. Envanterde bir değer yoksa model onu icat etmez — alanı 'avukat tarafından doldurulacak' olarak bırakır.",
  },
  {
    eyebrow: "Atıf",
    title: "Madde-atıflı hukuki metin",
    body: "Her değerlendirme ilgili KVKK ve GDPR maddesine doğrudan atıf yapar (KVKK m.5/2-ç, GDPR m.6/1-c gibi). Hukuk biriminin incelemesi hızlanır, atıfsız belirsizlik ortadan kalkar.",
  },
  {
    eyebrow: "Özel nitelikli veri",
    title: "KVKK m.6 farkındalığı",
    body: "Sağlık, biyometrik, genetik veya ceza mahkûmiyeti gibi özel nitelikli veriler otomatik tespit edilir. Bu verilerin yalnızca açık rıza veya sınırlı istisnalarla işlenebileceği ve ek güvenlik tedbirleri açıkça belirtilir.",
  },
  {
    eyebrow: "Entegrasyon",
    title: "MCP ile her yerde",
    body: "KVKK grounding motorunu bir MCP server olarak Claude Desktop, Cursor ve diğer AI istemcilerinden kullanın. Ayrıca uygulama çoklu model sağlayıcısını destekler.",
  },
];

export default function UrunPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-20">
      <div className="text-center">
        <p className="eyebrow mb-3">Ürün</p>
        <h1 className="font-display text-5xl leading-tight text-ink">
          Hız ve hukuki güven,
          <br />
          <span className="text-accent">aynı anda.</span>
        </h1>
      </div>

      <div className="mt-16 space-y-14">
        {SECTIONS.map((s) => (
          <div key={s.title} data-reveal className="border-t border-border pt-10">
            <p className="eyebrow mb-3">{s.eyebrow}</p>
            <h2 className="font-display text-2xl text-ink">{s.title}</h2>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{s.body}</p>
          </div>
        ))}
      </div>

      <div className="mt-16 text-center">
        <ButtonLink href="/login">Ücretsiz Dene</ButtonLink>
      </div>
    </div>
  );
}
