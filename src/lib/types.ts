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

/** İstemci-tarafı yardımcı — FastAPI hata gövdesi {detail}; üretilen şemada ayrı tip yok. */
export interface ApiError {
  error: string;
  details?: string;
}
