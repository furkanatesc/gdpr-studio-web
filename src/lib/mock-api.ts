import type { GenerateRequest, GenerateResponse, GroundingRecord } from "./types";

const DISCLAIMER =
  "⚠️ Bu çıktı avukat incelemesine tabi hukuki taslaktır. Hukuki tavsiye niteliği taşımaz. Her resmi belge, konuya hâkim bir hukukçu tarafından incelenmeli ve onaylanmalıdır.";

// Demo grounding — gerçek backend categories.json / Postgres'ten gelecek.
const GROUNDING_BY_TAG: Record<string, GroundingRecord> = {
  "Ad-Soyad": rec("Kimlik", ["Ad", "Soyad", "TCKN"], "5/2-ç Hukuki Yükümlülük"),
  "TC Kimlik No": rec("Kimlik", ["TCKN"], "5/2-ç Hukuki Yükümlülük"),
  "E-posta": rec("İletişim", ["E-posta", "Telefon", "Adres"], "5/2-c Sözleşmenin İfası"),
  Telefon: rec("İletişim", ["Telefon", "E-posta"], "5/2-c Sözleşmenin İfası"),
  Adres: rec("İletişim", ["Adres"], "5/2-c Sözleşmenin İfası"),
  "Ödeme / Kredi Kartı": rec("Finans", ["IBAN", "Kart Bilgisi"], "5/2-c Sözleşmenin İfası"),
  "Sağlık verisi": rec(
    "Sağlık Bilgileri",
    ["Sağlık Raporu", "Tanı"],
    "6/3 Açık Rıza (Özel Nitelikli)",
  ),
  "IP Adresi / Çerez": rec("İşlem Güvenliği", ["IP", "Log", "Çerez"], "5/2-f Meşru Menfaat"),
  "Davranışsal / Analitik": rec("İşlem Güvenliği", ["Davranış İzi"], "5/2-f Meşru Menfaat"),
};

function rec(kategori: string, veri: string[], sebep: string): GroundingRecord {
  return {
    kategori,
    veriTurleri: veri,
    amaclar: [],
    hukukiSebepler: [sebep],
    kisiGruplari: [],
    saklamaSureleri: [],
  };
}

function dedupeGrounding(tags: string[]): GroundingRecord[] {
  const byCat = new Map<string, GroundingRecord>();
  for (const t of tags) {
    const g = GROUNDING_BY_TAG[t];
    if (!g) continue;
    const ex = byCat.get(g.kategori);
    if (ex) {
      ex.veriTurleri = Array.from(new Set([...ex.veriTurleri, ...g.veriTurleri]));
      ex.hukukiSebepler = Array.from(new Set([...ex.hukukiSebepler, ...g.hukukiSebepler]));
    } else {
      byCat.set(g.kategori, { ...g });
    }
  }
  return Array.from(byCat.values());
}

function buildAydinlatma(req: GenerateRequest, grounding: GroundingRecord[]): string {
  const f = req.fields;
  const sirket = f.sirket || "[Şirket Adı]";
  const ozelNitelikli = grounding.some((g) => g.kategori === "Sağlık Bilgileri");

  const satirlar = grounding
    .map(
      (g) =>
        `| ${g.kategori} | ${g.veriTurleri.join(", ")} | ${(req.amaclar || ["İlgili faaliyetlerin yürütülmesi"]).slice(0, 2).join(", ")} | ${g.hukukiSebepler.join("; ")} |`,
    )
    .join("\n");

  return `# Aydınlatma Metni

**Veri Sorumlusu:** ${sirket}${f.site ? ` (${f.site})` : ""}
**İletişim:** ${f.email || "[veri sorumlusu e-postası]"}${f.dpo ? `\n**DPO / Veri Koruma Görevlisi:** ${f.dpo}` : ""}

İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun **10. maddesi** ve GDPR **m.13-14** kapsamında, ${sirket} tarafından hazırlanmıştır.

## 1. İşlenen Kişisel Veriler, Amaçlar ve Hukuki Sebepler

| Veri Kategorisi | Veri Türleri | İşleme Amacı | Hukuki Sebep |
|---|---|---|---|
${satirlar || "| — | — | — | — |"}
${
  ozelNitelikli
    ? `
## 2. Özel Nitelikli Kişisel Veri (KVKK m.6)

Sağlık verileriniz özel nitelikli kişisel veri olup, yalnızca **açık rızanız** (KVKK m.6/3) veya kanunda öngörülen sınırlı istisnalar kapsamında işlenir. Bu veriler için Kurul'un belirlediği ek güvenlik tedbirleri uygulanır.
`
    : ""
}
## ${ozelNitelikli ? "3" : "2"}. Saklama Süresi

Kişisel verileriniz, ilgili mevzuatta öngörülen veya işleme amacının gerektirdiği süre boyunca saklanır. **[Somut saklama süreleri avukat / veri sorumlusu tarafından belirlenecektir.]**

## ${ozelNitelikli ? "4" : "3"}. Yurt Dışına Aktarım

${f.yurtdisi && f.yurtdisi !== "Hayır" ? `Verileriniz **${f.yurtdisi}** mekanizmasıyla yurt dışına aktarılmaktadır (KVKK m.9).` : "Kişisel verileriniz yurt dışına aktarılmamaktadır."}

## ${ozelNitelikli ? "5" : "4"}. İlgili Kişi Hakları (KVKK m.11)

Kanun'un 11. maddesi kapsamında; verilerinize erişme, düzeltme, silinmesini isteme ve itiraz haklarına sahipsiniz. Başvurularınızı önce veri sorumlusuna iletebilir, sonuçtan memnun kalmazsanız **Kişisel Verileri Koruma Kurulu'na** şikayette bulunabilirsiniz.

---
${DISCLAIMER}`;
}

/** Mock üretim — backend gelince yalnızca bu fonksiyon gerçek fetch ile değişir. */
export async function generateDocMock(
  req: GenerateRequest,
): Promise<GenerateResponse> {
  await new Promise((r) => setTimeout(r, 1100));
  const grounding = dedupeGrounding(req.veriler || []);
  const text =
    req.type === "aydinlatma"
      ? buildAydinlatma(req, grounding)
      : `# ${req.type}\n\nBu doküman türü için demo içerik yakında.\n\n---\n${DISCLAIMER}`;

  return {
    text,
    grounding,
    model: "claude-sonnet-4-6 (demo / mock)",
    disclaimer: DISCLAIMER,
    usage: { inputTokens: 1240, outputTokens: 680 },
  };
}
