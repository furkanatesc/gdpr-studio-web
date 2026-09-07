import type { IhlalOlay, InventoryRow, Client } from "@/lib/api";

/*
  İhlal bildirimi "yapı önizlemesi" — TAMAMEN DETERMİNİSTİK, ağsız. Elle doldurulan
  olay formundan (IhlalOlay) + etkilenen envanter satırlarından, Kurul ve İlgili Kişi
  bildirimlerinin ortak olay verisini türetir. LLM ÇAĞIRMAZ (anlık + ücretsiz canlı
  önizleme). Gerçek metin "Üret"te LLM stream'inden gelir; panel iki tipi (kurul/ilgili
  kişi) bu tek modelden farklı çerçeveyle render eder. İskelet taslaktır, indirilemez.
*/

export const PLACEHOLDER = "[Doldurulacak]";

export type IhlalField = "tespit" | "etkilenenSurecler" | "nasil" | "onlemler";

/** Anlamlı bir bildirim için dolu olması beklenen alanlar (tur'un varsayılanı hep dolu). */
export const IHLAL_REQUIRED: IhlalField[] = ["tespit", "etkilenenSurecler", "nasil", "onlemler"];

export type IhlalPreview = {
  controllerName: string;
  tespit: string;
  tur: string;
  kisiSayisi: number;
  kimlikFinansal: boolean;
  sifreli: boolean;
  nasil: string;
  onlemler: string;
  affectedProcesses: string[];
  affectedCategories: string[];
  missing: IhlalField[];
};

/** ihlal-client.tsx'teki rowLabel ile aynı — etkilenen süreç etiketi. */
function rowLabel(r: InventoryRow): string {
  const baslik =
    [r.departman, r.is_sureci, r.alt_surec].filter(Boolean).join(" / ") || "(isimsiz süreç)";
  return r.kisi_grubu ? `${baslik} — ${r.kisi_grubu}` : baslik;
}

function controllerNameOf(client: Client | null): string {
  if (!client) return PLACEHOLDER;
  return client.legal_name || client.name || PLACEHOLDER;
}

export function buildIhlalPreview(
  olay: IhlalOlay,
  rows: InventoryRow[] | null,
  client: Client | null,
): IhlalPreview {
  const affectedRows = rows
    ? olay.etkilenenIndeksler
        .filter((i) => i >= 0 && i < rows.length)
        .map((i) => rows[i])
    : [];
  const affectedProcesses = affectedRows.map(rowLabel);
  const affectedCategories = Array.from(new Set(affectedRows.flatMap((r) => r.kategoriler)));

  const missing: IhlalField[] = [];
  if (!olay.tespit) missing.push("tespit");
  if (affectedProcesses.length === 0) missing.push("etkilenenSurecler");
  if (!olay.nasil.trim()) missing.push("nasil");
  if (!olay.onlemler.trim()) missing.push("onlemler");

  return {
    controllerName: controllerNameOf(client),
    tespit: olay.tespit,
    tur: olay.tur,
    kisiSayisi: olay.kisiSayisi,
    kimlikFinansal: olay.kimlikFinansal,
    sifreli: olay.sifreli,
    nasil: olay.nasil,
    onlemler: olay.onlemler,
    affectedProcesses,
    affectedCategories,
    missing,
  };
}
