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
  "Sağlık verisi": rec("Sağlık Bilgileri", ["Sağlık Raporu", "Tanı"], "6/3 Açık Rıza (Özel Nitelikli)"),
  "IP Adresi / Çerez": rec("İşlem Güvenliği", ["IP", "Log", "Çerez"], "5/2-f Meşru Menfaat"),
  "Davranışsal / Analitik": rec("İşlem Güvenliği", ["Davranış İzi"], "5/2-f Meşru Menfaat"),
};

function rec(kategori: string, veri: string[], sebep: string): GroundingRecord {
  return { kategori, veriTurleri: veri, amaclar: [], hukukiSebepler: [sebep], kisiGruplari: [], saklamaSureleri: [] };
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

const sig = "\n\n---\n" + DISCLAIMER;

function buildAydinlatma(req: GenerateRequest, g: GroundingRecord[]): string {
  const f = req.fields;
  const sirket = f.sirket || "[Şirket Adı]";
  const ozel = g.some((x) => x.kategori === "Sağlık Bilgileri");
  const rows = g
    .map((x) => `| ${x.kategori} | ${x.veriTurleri.join(", ")} | ${(req.amaclar || ["İlgili faaliyetler"]).slice(0, 2).join(", ")} | ${x.hukukiSebepler.join("; ")} |`)
    .join("\n");
  let n = 1;
  return `# Aydınlatma Metni

**Veri Sorumlusu:** ${sirket}${f.site ? ` (${f.site})` : ""}
**İletişim:** ${f.email || "[e-posta]"}${f.dpo ? `\n**DPO:** ${f.dpo}` : ""}

İşbu metin, 6698 sayılı Kanun'un **m.10** ve GDPR **m.13-14** kapsamında ${sirket} tarafından hazırlanmıştır.

## ${n++}. İşlenen Veriler, Amaçlar ve Hukuki Sebepler

| Veri Kategorisi | Veri Türleri | İşleme Amacı | Hukuki Sebep |
|---|---|---|---|
${rows || "| — | — | — | — |"}
${ozel ? `\n## ${n++}. Özel Nitelikli Veri (KVKK m.6)\n\nSağlık verileriniz yalnızca **açık rızanız** (m.6/3) veya kanuni istisnalarla işlenir; Kurul'un öngördüğü ek güvenlik tedbirleri uygulanır.\n` : ""}
## ${n++}. Saklama Süresi

İlgili mevzuat ve işleme amacının gerektirdiği süre boyunca saklanır. **[Somut süreler avukat/veri sorumlusu tarafından belirlenecektir.]**

## ${n++}. Yurt Dışına Aktarım

${f.yurtdisi && f.yurtdisi !== "Hayır" ? `Verileriniz **${f.yurtdisi}** mekanizmasıyla aktarılmaktadır (KVKK m.9).` : "Kişisel verileriniz yurt dışına aktarılmamaktadır."}

## ${n++}. İlgili Kişi Hakları (KVKK m.11)

Erişme, düzeltme, silme ve itiraz haklarına sahipsiniz. Başvurularınızı veri sorumlusuna iletebilir, ardından **Kişisel Verileri Koruma Kurulu'na** şikayette bulunabilirsiniz.${sig}`;
}

function buildCerez(req: GenerateRequest): string {
  const f = req.fields;
  const rows = (req.veriler || []).map((c) => `| ${c} | [amaç] | ${c.startsWith("Zorunlu") ? "Meşru menfaat (m.5/2-f)" : "Açık rıza (m.5/1)"} | [süre] |`).join("\n");
  return `# Çerez Politikası

**${f.sirket || "[Şirket]"}** · ${f.site || "[site]"}

## 1. Çerez Nedir?

Çerezler, sitemizi ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır.

## 2. Kullandığımız Çerez Kategorileri

| Kategori | Amaç | Hukuki Dayanak | Saklama Süresi |
|---|---|---|---|
${rows || "| — | — | — | — |"}

## 3. Onay ve Tercih Yönetimi

Zorunlu olmayan çerezler **önceden açık rızanızla** (opt-in) çalışır. Tercihlerinizi ${f.cmp && f.cmp !== "Yok" ? "çerez tercih panelimizden" : "tarayıcı ayarlarınızdan"} yönetebilirsiniz.${f.tools ? `\n\n## 4. Üçüncü Taraf Araçlar\n\nKullanılan araçlar: ${f.tools}.` : ""}${sig}`;
}

function buildKayit(req: GenerateRequest): string {
  const f = req.fields;
  const sur = (req.veriler || []).map((s) => `- **${s}**: [veri kategorileri] · [amaç] · [hukuki sebep] · [saklama süresi]`).join("\n");
  return `# Kişisel Veri İşleme Faaliyetleri Kaydı (ROPA)

**Veri Sorumlusu:** ${f.sirket || "[Kuruluş]"}${f.dpo ? `\n**Sorumlu / DPO:** ${f.dpo}` : ""}

GDPR **m.30** ve VERBİS unsurlarına göre hazırlanan işleme kaydı.

## İşleme Süreçleri

${sur || "- [Süreç eklenmedi]"}

## Genel Notlar

Her süreç için somut **saklama süresi** (GDPR m.13/2-a) gerekir; envanterde yoksa **[avukat tarafından doldurulacak]**. Teknik ve idari tedbirler KVKK m.12 kapsamında listelenmelidir.${f.not ? `\n\n**Sektöre özel notlar:** ${f.not}` : ""}${sig}`;
}

function buildDpa(req: GenerateRequest, g: GroundingRecord[]): string {
  const f = req.fields;
  const veri = g.length ? g.map((x) => x.kategori).join(", ") : (req.veriler || []).join(", ") || "[veri kategorileri]";
  return `# Veri İşleme Sözleşmesi (DPA / VİS)

**Veri Sorumlusu:** ${f.sorumlu || "[Controller]"}
**Veri İşleyen:** ${f.isleyen || "[Processor]"}
**Hizmet:** ${f.hizmet || "[hizmet türü]"} · **Süre:** ${f.sure || "[süre]"} · **Lokasyon:** ${f.lokasyon || "[lokasyon]"}

## 1. Konu ve Kapsam

Veri İşleyen, yalnızca Veri Sorumlusu'nun **belgelenmiş talimatları** doğrultusunda ve şu veri kategorilerini işler: ${veri}.

## 2. Zorunlu Yükümlülükler (KVKK m.12 / GDPR m.28)

- Gizlilik taahhüdü ve çalışan yükümlülüğü
- KVKK m.12 / GDPR m.32 teknik-idari tedbirler
- Alt işleyici onay prosedürü
- Veri ihlali bildirimi (**en geç 72 saat**)
- Sözleşme sonunda silme/iade

## 3. Kırmızı Bayraklar 🚩

- İşleyicinin veriyi kendi amaçları için kullanması → **kabul edilemez**
- İhlal bildirim süresi 72 saati aşıyorsa → **reddedilmeli**
- Sözleşme sonunda silme/iade yerine süresiz saklama → **reddedilmeli**${f.lokasyon && /ab| avrupa|abd|usa/i.test(f.lokasyon) ? "\n- Yurt dışı transfer: SCCs / KVKK m.9 taahhütnamesi aranmalı" : ""}${sig}`;
}

function buildDpia(req: GenerateRequest): string {
  const f = req.fields;
  const riskler = req.veriler || [];
  const zorunlu = riskler.length >= 2;
  return `# Veri Koruma Etki Değerlendirmesi (DPIA / KİA)

**Proje:** ${f.proje || "[proje adı]"} · **Etkilenen kişi:** ${f.kisi || "[sayı]"}

## 1. Zorunluluk Değerlendirmesi

Seçilen risk faktörleri: ${riskler.join(", ") || "—"}.
**Sonuç: ${zorunlu ? "DPIA ZORUNLU" : "DPIA tavsiye edilir"}** (GDPR m.35 — iki veya daha fazla kriter varsa zorunlu).

## 2. İşlemenin Tanımı

${f.kapsam || "[Kapsam açıklaması]"}

## 3. Risk Matrisi

| Risk | Olasılık (1-5) | Etki (1-5) | Skor | Kategori |
|---|---|---|---|---|
| Yetkisiz erişim | [ ] | [ ] | [ ] | [ ] |
| Amaca aykırı kullanım | [ ] | [ ] | [ ] | [ ] |

*Skor: 1-4 Düşük · 5-9 Orta · 10-14 Yüksek · 15-25 Kritik*

## 4. Mevcut Tedbirler

${f.guvenlik || "[Güvenlik önlemleri]"}

## 5. Sonuç Kararı

☐ DEVAM ☐ KOŞULLU DEVAM ☐ **KURUL DANIŞMASI (GDPR m.36)** ☐ DURDUR

Yüksek risk azaltılamıyorsa Kurul danışması gereklidir.${sig}`;
}

function buildIhlal(req: GenerateRequest, g: GroundingRecord[]): string {
  const f = req.fields;
  const veri = g.length ? g.map((x) => x.kategori).join(", ") : (req.veriler || []).join(", ") || "[etkilenen kategoriler]";
  return `# Kişisel Veri İhlali Bildirim Formu

**Tespit tarihi:** ${f.tarih || "[tarih]"} · **Tür:** ${f.tur || "[tür]"} · **Durum:** ${f.devam || "[durum]"}

## 1. İhlalin Niteliği

${f.aciklama || "[İhlal açıklaması]"}

## 2. Etkilenen Veriler ve Kişiler

- **Veri kategorileri:** ${veri}
- **Tahmini etkilenen kişi sayısı:** ${f.kisi || "[sayı]"}

## 3. Bildirim Yükümlülüğü (KVKK m.12/5 · GDPR m.33-34)

- Kurul'a / DPA'ya **en geç 72 saat** içinde bildirilir.
- Yüksek risk varsa **ilgili kişilere** de bildirim (GDPR m.34) değerlendirilmelidir.
- 72 saat aşıldıysa **gecikme gerekçesi zorunludur**.

## 4. Alınan / Alınacak Tedbirler

[Teknik ve idari önlemler]${sig}`;
}

/** Mock üretim — backend gelince yalnızca bu fonksiyon gerçek fetch ile değişir. */
export async function generateDocMock(req: GenerateRequest): Promise<GenerateResponse> {
  await new Promise((r) => setTimeout(r, 1000));
  const grounding = dedupeGrounding(req.veriler || []);

  let text: string;
  switch (req.type) {
    case "aydinlatma": text = buildAydinlatma(req, grounding); break;
    case "cerez": text = buildCerez(req); break;
    case "kayit": text = buildKayit(req); break;
    case "dpa": text = buildDpa(req, grounding); break;
    case "dpia": text = buildDpia(req); break;
    case "ihlal": text = buildIhlal(req, grounding); break;
    default: text = `# ${req.type}\n\nDemo içerik.${sig}`;
  }

  return {
    text,
    grounding,
    model: "claude-sonnet-4-6 (demo / mock)",
    disclaimer: DISCLAIMER,
    usage: { inputTokens: 1240, outputTokens: 680 },
  };
}
