import type { Client } from "@/lib/api";

export type PrintDocType = "aydinlatma" | "cerez" | "kayit" | "dpia" | "dpa" | "ihlal";

export type PrintCover = {
  veriSorumlusu: string;
  ilgiliKisi?: string;
  site?: string;
  veriIsleyen?: string;
  tarih: string;
  versiyon: string;
};

export type PrintPayload = {
  docType: PrintDocType;
  content: string;
  cover: PrintCover;
};

export const PRINT_STORAGE_KEY = "kvkk-print-payload";

export function formatTrDate(iso?: string): string {
  const d = iso ? new Date(iso) : new Date();
  const gg = String(d.getDate()).padStart(2, "0");
  const aa = String(d.getMonth() + 1).padStart(2, "0");
  return `${gg}.${aa}.${d.getFullYear()}`;
}

export function buildCover(
  client: Pick<Client, "legal_name" | "name">,
  docType: PrintDocType,
  opts: { ilgiliKisi?: string; site?: string; veriIsleyen?: string; tarih: string; versiyon: string },
): PrintCover {
  return {
    veriSorumlusu: client.legal_name || client.name || "",
    ilgiliKisi: docType === "aydinlatma" ? opts.ilgiliKisi : undefined,
    site: docType === "cerez" ? opts.site : undefined,
    veriIsleyen: docType === "dpa" ? opts.veriIsleyen : undefined,
    tarih: opts.tarih,
    versiyon: opts.versiyon,
  };
}

export function openPrintView(payload: PrintPayload): void {
  sessionStorage.setItem(PRINT_STORAGE_KEY, JSON.stringify(payload));
  window.open("/yazdir", "_blank");
}
