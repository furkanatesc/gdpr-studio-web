export type ListKey =
  | "kategoriler"
  | "veri_turleri"
  | "amaclar"
  | "hukuki_sebepler"
  | "dayanaklar"
  | "saklama_sureleri"
  | "islem"
  | "ortam_format"
  | "konum"
  | "idari_tedbirler"
  | "teknik_tedbirler"
  | "aktarim"
  | "toplama";

/** InventoryEditor grid'i (LIST_COLUMNS) ve Eksikleri Doldur paneli ortak alan etiketleri. */
export const LIST_FIELD_LABELS: Record<ListKey, string> = {
  kategoriler: "Kategoriler",
  veri_turleri: "Veri türleri",
  amaclar: "Amaçlar",
  hukuki_sebepler: "Hukuki sebepler",
  dayanaklar: "Dayanaklar",
  saklama_sureleri: "Saklama süreleri",
  islem: "İşlem",
  ortam_format: "Ortam / format",
  konum: "Konum",
  idari_tedbirler: "İdari tedbirler",
  teknik_tedbirler: "Teknik tedbirler",
  aktarim: "Aktarım",
  toplama: "Toplama",
};
