import type { DocType } from "./types";

export interface DocMeta {
  type: DocType;
  no: string;
  eyebrow: string;
  title: string;
  desc: string;
}

/** Sol menü / üretim akışları — mevcut prototipteki 6 doküman türü. */
export const DOC_CATALOG: DocMeta[] = [
  {
    type: "aydinlatma",
    no: "01",
    eyebrow: "Doküman 01 · KVKK m.10 / GDPR m.13-14",
    title: "Aydınlatma Metni",
    desc: "Kişisel verilerin toplanması sırasında veri sahiplerine sunulması zorunlu bilgileri içeren temel uyum belgesi.",
  },
  {
    type: "cerez",
    no: "02",
    eyebrow: "Doküman 02 · GDPR + ePrivacy",
    title: "Çerez Politikası",
    desc: "Çerez türleri, amaçları ve kullanıcı tercih mekanizmasını içeren politika belgesi.",
  },
  {
    type: "kayit",
    no: "03",
    eyebrow: "Doküman 03 · VERBİS / GDPR m.30",
    title: "İşleme Faaliyetleri Kaydı",
    desc: "Veri sorumlusunun tüm işleme faaliyetlerini kayıt altına aldığı zorunlu register (ROPA) belgesi.",
  },
  {
    type: "dpa",
    no: "04",
    eyebrow: "Doküman 04 · KVKK m.12 / GDPR m.28",
    title: "Veri İşleme Sözleşmesi",
    desc: "Veri sorumlusu ile veri işleyen arasındaki yükümlülükleri tanımlayan sözleşme (DPA / VİS).",
  },
  {
    type: "dpia",
    no: "05",
    eyebrow: "Doküman 05 · GDPR m.35",
    title: "DPIA / KİA Raporu",
    desc: "Yüksek riskli işlemeler için veri koruma etki değerlendirmesi raporu.",
  },
  {
    type: "ihlal",
    no: "06",
    eyebrow: "Doküman 06 · KVKK m.12/5 / GDPR m.33-34",
    title: "İhlal Bildirim Formu",
    desc: "Kişisel veri ihlallerinde Kurul'a ve ilgili kişilere bildirim için form.",
  },
];

export const docByType = (t: DocType) =>
  DOC_CATALOG.find((d) => d.type === t)!;

/* Aydınlatma formu seçenekleri (prototiple birebir). */
export const VERI_KATEGORILERI = [
  "Ad-Soyad",
  "E-posta",
  "Telefon",
  "TC Kimlik No",
  "Adres",
  "Ödeme / Kredi Kartı",
  "IP Adresi / Çerez",
  "Konum verisi",
  "Biyometrik veri",
  "Sağlık verisi",
  "Seyahat bilgileri",
  "Davranışsal / Analitik",
];

export const ISLEME_AMACLARI = [
  "Hizmet sunumu",
  "Sözleşme ifası",
  "Pazarlama / İletişim",
  "Analitik / İstatistik",
  "Müşteri desteği",
  "Yasal yükümlülük",
  "Güvenlik / Doğrulama",
  "Profilleme / Kişiselleştirme",
  "Faturalandırma",
];

export const SEKTORLER = [
  "Sağlık / Medikal",
  "Fintech / Finans",
  "E-ticaret",
  "SaaS / Teknoloji",
  "Eğitim",
  "Üretim / Sanayi",
  "Hukuk / Danışmanlık",
  "Diğer",
];

export const YURTDISI_SECENEKLERI = [
  "Hayır",
  "Evet — Standart Sözleşme Maddeleri (SCCs) ile",
  "Evet — AB Yeterlilik Kararı olan ülkelere",
  "Evet — Açık Rıza ile",
];

/**
 * KVKK m.6 — özel nitelikli kişisel veri seçenekleri. Mevcut seçenek metinlerinin
 * alt kümesidir; YENİ kategori eklenmez (envanter-gerçekliği ilkesi).
 * "Özel nitelikli veri" DPIA risk listesinden gelir (schemas.ts).
 */
export const OZEL_NITELIKLI = new Set<string>([
  "Biyometrik veri",
  "Sağlık verisi",
  "Özel nitelikli veri",
]);
