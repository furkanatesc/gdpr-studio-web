import type { GenerateRequest, GenerateResponse } from "./types";
import { generateDocMock } from "./mock-api";

/*
  Üretim çağrısı — env-gated.
  NEXT_PUBLIC_API_BASE tanımlıysa gerçek backend'e (FastAPI /api/generate) gider;
  değilse mock'a düşer. Böylece lokal geliştirme gerçek backend'i kullanır,
  Vercel'deki prod (backend host'lanana dek) mock'ta kalır. Kontrat: lib/types.ts.
*/

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");

export async function generateDoc(req: GenerateRequest): Promise<GenerateResponse> {
  if (!API_BASE) return generateDocMock(req);

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    let detail = `Sunucu hatası (HTTP ${res.status})`;
    try {
      const e = await res.json();
      detail = e.detail || e.error || detail;
    } catch {
      /* gövde JSON değil */
    }
    throw new Error(detail);
  }

  return (await res.json()) as GenerateResponse;
}

/** Gerçek backend'e mi bağlı, yoksa mock'ta mı (UI rozeti için). */
export const usingRealApi = Boolean(API_BASE);
