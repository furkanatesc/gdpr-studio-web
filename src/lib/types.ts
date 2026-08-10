/*
  API SÖZLEŞMESİ — TEK KAYNAK: backend OpenAPI → `api-types.ts` (openapi-typescript ile üretilir).
  Bu dosya yalnızca üretilen şemalara ergonomik takma adlar verir; elle alan TANIMLANMAZ.
  Kontrat değişince:  backend `python -m app.export_openapi`  →  web `npm run gen:api-types`.
  (openapi-typescript, `default`'lu alanları zorunlu üretir → diziler hep mevcut, opsiyonel değil.)
*/

import type { components } from "./api-types";

type Schemas = components["schemas"];

export type DocType = Schemas["DocType"];
export type GroundingRecord = Schemas["GroundingRecord"];
export type GenerateRequest = Schemas["GenerateRequest"];
export type GenerateResponse = Schemas["GenerateResponse"];
export type Usage = Schemas["Usage"];

/** Uyum kontrol listesi (Faz B) — bkz. spec §2/§6. */
// StatusUpdate.status artık nullable (not statüsüz kaydedilebilir) — ama 3-durum enum'u
// STATUS_OPTIONS/TONE_ACTIVE Record anahtarı olduğundan null'ı SIYIR. "Statü yok" hali
// çağrı katmanında ayrı `| null` ile taşınır (bkz. setComplianceStatus).
export type ComplianceStatusValue = NonNullable<Schemas["StatusUpdate"]["status"]>;
export type ChecklistItem = Schemas["ChecklistItem"];
export type ChecklistGroup = Schemas["ChecklistGroup"];
export type ComplianceChecklist = Schemas["ChecklistOut"];

/** İstemci-tarafı yardımcı — FastAPI hata gövdesi {detail}; üretilen şemada ayrı tip yok. */
export interface ApiError {
  error: string;
  details?: string;
}
