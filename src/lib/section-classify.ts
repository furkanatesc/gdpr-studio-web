import type { AydinlatmaSection, EnrichedSection } from "@/lib/api";

/*
  Oneri onayi ekraninin alan siniflandirmasi. Uc kume ayriktir ve toplamlari
  her zaman bolum x alan sayisina esittir; ekran bu garantiye dayanir.
*/

export const FIELD_LABELS: Record<keyof Omit<AydinlatmaSection, "isSureci">, string> = {
  kisiGruplari: "İlgili kişi grupları",
  kategoriler: "Veri kategorileri",
  veriTurleri: "Veri türleri",
  amaclar: "İşleme amaçları",
  hukukiSebepler: "Hukuki sebepler",
  saklamaSureleri: "Saklama süreleri",
  aktarim: "Aktarım",
  toplama: "Toplama yöntemi",
};

export type SectionField = keyof typeof FIELD_LABELS;

export const EDITABLE_FIELDS = Object.keys(FIELD_LABELS) as SectionField[];

/** Dolu olsa da duzenlenebilir alanlar (mevcut + oneri; ekle/cikar) — avukat S2. */
export const ADDITIVE_FIELDS = new Set<SectionField>(["amaclar"]);

export type KararSatiri = {
  sectionIndex: number;
  isSureci: string;
  field: SectionField;
  base: string[];
  oneri: string[];
};

export type EksikGrubu = {
  field: SectionField;
  sections: { index: number; isSureci: string }[];
};

export type HazirBolum = {
  sectionIndex: number;
  isSureci: string;
  fields: { field: SectionField; values: string[] }[];
};

export type Classified = {
  kararlar: KararSatiri[];
  eksikler: EksikGrubu[];
  hazirlar: HazirBolum[];
  toplamHucre: number;
};

export function classifySections(sections: EnrichedSection[]): Classified {
  const kararlar: KararSatiri[] = [];
  const eksikMap = new Map<SectionField, { index: number; isSureci: string }[]>();
  const hazirlar: HazirBolum[] = [];

  sections.forEach((s, index) => {
    const hazirFields: { field: SectionField; values: string[] }[] = [];

    for (const field of EDITABLE_FIELDS) {
      const base = s[field] ?? [];
      const oneri = s.oneriler?.[field] ?? [];

      if (ADDITIVE_FIELDS.has(field) || oneri.length > 0) {
        kararlar.push({ sectionIndex: index, isSureci: s.isSureci, field, base, oneri });
      } else if (base.length === 0) {
        const list = eksikMap.get(field) ?? [];
        list.push({ index, isSureci: s.isSureci });
        eksikMap.set(field, list);
      } else {
        hazirFields.push({ field, values: base });
      }
    }

    if (hazirFields.length > 0) {
      hazirlar.push({ sectionIndex: index, isSureci: s.isSureci, fields: hazirFields });
    }
  });

  const eksikler = EDITABLE_FIELDS.filter((f) => eksikMap.has(f)).map((field) => ({
    field,
    sections: eksikMap.get(field) as { index: number; isSureci: string }[],
  }));

  return {
    kararlar,
    eksikler,
    hazirlar,
    toplamHucre: sections.length * EDITABLE_FIELDS.length,
  };
}
