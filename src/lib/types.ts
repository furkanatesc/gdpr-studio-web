/*
  DONDURULMUŞ API SÖZLEŞMESİ (frontend ↔ backend)
  Backend (FastAPI) bu şekilleri birebir implemente eder: POST /api/generate.
  Frontend mock'u da aynı şekli döndürür; backend gelince yalnızca fetch hedefi değişir.
*/

export type DocType =
  | "aydinlatma"
  | "cerez"
  | "kayit"
  | "dpa"
  | "dpia"
  | "ihlal";

/** Kategori bazlı grounding kaydı (backend: categories.json / Postgres envanter). */
export interface GroundingRecord {
  kategori: string;
  veriTurleri: string[];
  amaclar: string[];
  hukukiSebepler: string[];
  kisiGruplari: string[];
  saklamaSureleri: string[];
}

export interface GenerateRequest {
  type: DocType;
  /** Doküman türüne göre dolan serbest alanlar (sirket, email, sektor, dpo, ...). */
  fields: Record<string, string>;
  /** Seçili kişisel veri kategorileri / etiketleri. */
  veriler?: string[];
  /** Seçili işleme amaçları. */
  amaclar?: string[];
}

export interface GenerateResponse {
  /** Üretilen markdown doküman. */
  text: string;
  /** Şeffaflık: çıktının dayandığı envanter kayıtları. */
  grounding: GroundingRecord[];
  model: string;
  disclaimer: string;
  usage?: { inputTokens: number; outputTokens: number };
}

export interface ApiError {
  error: string;
  details?: string;
}
