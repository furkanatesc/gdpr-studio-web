import type { AydinlatmaSection, Client } from "@/lib/api";
import type { SectionField } from "@/lib/section-classify";

/*
  Aydınlatma "yapı önizlemesi" — TAMAMEN DETERMİNİSTİK, ağsız. Onaylanan bölüm
  alanlarından (edited: AydinlatmaSection[]) standart KVKK iskeletini üretir.
  LLM ÇAĞIRMAZ: canlı geri bildirim ücretsiz + anlık olsun diye (Anthropic maliyeti yok).
  Gerçek avukat-dili metin "Üret"te LLM stream'inden gelir ve bu iskeletin yerini alır.
  İskelet nihai metin DEĞİLDİR; panel bunu açıkça etiketler, .docx/Yazdır yalnız üretilmiş
  metne bağlıdır (iskelet indirilemez).
*/

/** Boş kalırsa belgede görünecek yer tutucu (oneri-onayi.tsx ile aynı lafız). */
export const PLACEHOLDER = "[Avukat tarafından doldurulacak]";

/** İskeletin anlamlı olması için dolu olması beklenen zorunlu alanlar (aktarim opsiyonel). */
export const PREVIEW_REQUIRED: SectionField[] = [
  "kategoriler",
  "amaclar",
  "hukukiSebepler",
  "saklamaSureleri",
  "toplama",
];

export type PreviewActivity = {
  isSureci: string;
  kisiGruplari: string[];
  kategoriler: string[];
  amaclar: string[];
  hukukiSebepler: string[];
  aktarim: string[];
  saklamaSureleri: string[];
  toplama: string[];
  /** PREVIEW_REQUIRED içinden bu bölümde boş olan alanlar (KVKK uyarısı için). */
  missing: SectionField[];
};

export type AydinlatmaPreview = {
  controllerName: string;
  activities: PreviewActivity[];
  totalMissing: number;
};

/** Dolu değerler virgülle; boşsa yer tutucu. */
export function formatFieldValues(values: string[]): string {
  return values.length > 0 ? values.join(", ") : PLACEHOLDER;
}

function controllerNameOf(client: Client | null): string {
  if (!client) return PLACEHOLDER;
  return client.legal_name || client.name || PLACEHOLDER;
}

export function buildAydinlatmaPreview(
  edited: AydinlatmaSection[],
  client: Client | null,
): AydinlatmaPreview {
  const activities: PreviewActivity[] = edited.map((s) => ({
    isSureci: s.isSureci,
    kisiGruplari: s.kisiGruplari,
    kategoriler: s.kategoriler,
    amaclar: s.amaclar,
    hukukiSebepler: s.hukukiSebepler,
    aktarim: s.aktarim,
    saklamaSureleri: s.saklamaSureleri,
    toplama: s.toplama,
    missing: PREVIEW_REQUIRED.filter((f) => (s[f]?.length ?? 0) === 0),
  }));
  return {
    controllerName: controllerNameOf(client),
    activities,
    totalMissing: activities.reduce((a, act) => a + act.missing.length, 0),
  };
}
