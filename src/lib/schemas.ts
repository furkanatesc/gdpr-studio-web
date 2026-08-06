import type { DocType } from "./types";
import type { IconName } from "@/components/ui/icon";
import {
  VERI_KATEGORILERI,
  ISLEME_AMACLARI,
  SEKTORLER,
  YURTDISI_SECENEKLERI,
} from "./catalog";

export type FieldType = "text" | "textarea" | "select" | "date";

export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  full?: boolean; // iki kolon yerine tam genişlik
}

export interface TagGroupDef {
  key: "veriler" | "amaclar";
  label: string;
  options: string[];
}

export interface CardDef {
  title: string;
  icon: IconName;
  fields?: FieldDef[];
  groups?: TagGroupDef[];
}

export interface DocSchema {
  cards: CardDef[];
  cta: string;
}

const CEREZ_KATEGORILERI = [
  "Zorunlu çerezler",
  "Fonksiyonel çerezler",
  "Analitik çerezler",
  "Pazarlama çerezleri",
  "Sosyal medya çerezleri",
];

const KAYIT_SURECLERI = [
  "İK / Özlük",
  "Müşteri ilişkileri",
  "Pazarlama",
  "Finans / Muhasebe",
  "Bilgi güvenliği",
  "Tedarik / Lojistik",
];

const DPIA_RISKLERI = [
  "Profilleme / otomatik karar",
  "Özel nitelikli veri",
  "Büyük ölçekli izleme",
  "Yeni teknoloji (YZ / IoT)",
  "Savunmasız grup (çocuk vb.)",
  "Veri eşleştirme / birleştirme",
];

// "ihlal" DocType kontratında var (backend) ama /app/ihlal artık statik gerçek ekran (Task 8) —
// jenerik [doc] route hiçbir zaman bu anahtarla SCHEMAS'a erişmiyor (statik route öncelikli).
export const SCHEMAS = {
  aydinlatma: {
    cards: [
      {
        title: "Şirket Bilgileri",
        icon: "landmark",
        fields: [
          { key: "sirket", label: "Şirket / Kuruluş adı", required: true, placeholder: "Örn: Yaşam Hastaneleri A.Ş." },
          { key: "site", label: "Web sitesi", placeholder: "www.sirket.com" },
          { key: "email", label: "Veri sorumlusu e-postası", required: true, placeholder: "kvkk@sirket.com" },
          { key: "sektor", label: "Sektör", type: "select", required: true, options: SEKTORLER },
          { key: "dpo", label: "DPO / Veri Koruma Görevlisi (varsa)", full: true, placeholder: "Ad Soyad veya dpo@sirket.com" },
        ],
      },
      {
        title: "İşleme Faaliyetleri",
        icon: "clipboard",
        groups: [
          { key: "veriler", label: "Hangi kişisel veri kategorilerini işliyorsunuz?", options: VERI_KATEGORILERI },
          { key: "amaclar", label: "İşleme amaçları", options: ISLEME_AMACLARI },
        ],
        fields: [
          { key: "yurtdisi", label: "Yurt dışına veri aktarımı yapılıyor mu?", type: "select", options: YURTDISI_SECENEKLERI, full: true },
          { key: "ekbilgi", label: "Ek bağlam / özel durumlar", type: "textarea", full: true, placeholder: "Örn: çocuklara yönelik hizmet, özel kategori veri işleme..." },
        ],
      },
    ],
    cta: "Aydınlatma Metni Oluştur",
  },

  cerez: {
    cards: [
      {
        title: "Site Bilgileri",
        icon: "cookie",
        fields: [
          { key: "site", label: "Site / uygulama adı", required: true, placeholder: "www.sirket.com" },
          { key: "sirket", label: "Şirket adı", required: true, placeholder: "ABC A.Ş." },
          { key: "tools", label: "Kullanılan araçlar", full: true, placeholder: "Örn: Google Analytics, Hotjar, Meta Pixel" },
          { key: "cmp", label: "Çerez onay aracı (CMP)", type: "select", options: ["Yok", "Var — kendi çözümümüz", "Var — üçüncü taraf CMP"], full: true },
        ],
      },
      {
        title: "Çerez Kategorileri",
        icon: "grid",
        groups: [{ key: "veriler", label: "Hangi çerez kategorilerini kullanıyorsunuz?", options: CEREZ_KATEGORILERI }],
      },
    ],
    cta: "Çerez Politikası Oluştur",
  },

  kayit: {
    cards: [
      {
        title: "Kuruluş",
        icon: "book",
        fields: [
          { key: "sirket", label: "Kuruluş adı", required: true, placeholder: "ABC A.Ş." },
          { key: "dpo", label: "Sorumlu kişi / DPO", placeholder: "Ad Soyad, e-posta" },
          { key: "not", label: "Sektöre özel notlar", type: "textarea", full: true, placeholder: "Sektörünüze özel veri işleme süreçleri..." },
        ],
      },
      {
        title: "İşleme Süreçleri",
        icon: "refresh",
        groups: [{ key: "veriler", label: "Hangi iş süreçlerinde kişisel veri işliyorsunuz?", options: KAYIT_SURECLERI }],
      },
    ],
    cta: "İşleme Kaydı Oluştur",
  },

  dpa: {
    cards: [
      {
        title: "Taraflar",
        icon: "file",
        fields: [
          { key: "sorumlu", label: "Veri Sorumlusu (Controller)", required: true, placeholder: "Şirket adı, adres" },
          { key: "isleyen", label: "Veri İşleyen (Processor)", required: true, placeholder: "Hizmet sağlayıcı adı" },
          { key: "hizmet", label: "Hizmet türü", placeholder: "Örn: bulut barındırma, e-posta pazarlama" },
          { key: "sure", label: "Sözleşme süresi", placeholder: "Örn: 2 yıl / süresiz" },
          { key: "lokasyon", label: "Veri saklama lokasyonu", full: true, placeholder: "Türkiye, AB, ABD vb." },
        ],
      },
      {
        title: "Veri Kapsamı",
        icon: "folders",
        groups: [{ key: "veriler", label: "Sözleşme kapsamındaki veri kategorileri", options: VERI_KATEGORILERI }],
      },
    ],
    cta: "DPA / VİS Şablonu Oluştur",
  },

  dpia: {
    cards: [
      {
        title: "Proje",
        icon: "search",
        fields: [
          { key: "proje", label: "Proje / sistem adı", required: true, placeholder: "Örn: Müşteri Profilleme Sistemi" },
          { key: "kapsam", label: "Kapsam / açıklama", type: "textarea", full: true, placeholder: "Sistem ne yapıyor, hangi verileri nasıl işliyor..." },
          { key: "kisi", label: "Etkilenen kişi sayısı", type: "select", options: ["< 1.000", "1.000 - 10.000", "10.000 - 100.000", "> 100.000"] },
          { key: "guvenlik", label: "Mevcut güvenlik önlemleri", type: "textarea", full: true, placeholder: "Şifreleme, erişim kontrolü, log yönetimi..." },
        ],
      },
      {
        title: "Risk Faktörleri",
        icon: "warning",
        groups: [{ key: "veriler", label: "Aşağıdakilerden hangileri geçerli?", options: DPIA_RISKLERI }],
      },
    ],
    cta: "DPIA / KİA Raporu Oluştur",
  },

} as Record<DocType, DocSchema>;
