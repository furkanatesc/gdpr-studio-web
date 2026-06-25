import type { GenerateRequest, GenerateResponse, GroundingRecord } from "./types";
import type { components } from "./api-types";
import { generateDocMock } from "./mock-api";
import { supabase } from "./supabase";

/*
  Üretim çağrısı — env-gated + streaming.
  NEXT_PUBLIC_API_BASE tanımlıysa gerçek backend'e (FastAPI) gider; değilse mock'a düşer.
  Streaming (SSE): grounding anında, metin delta delta akar → algılanan gecikme saniyelere iner.
  Prod (Vercel, env yok) mock'ta kalır. Kontrat: lib/types.ts.
*/

const API_BASE = process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "");

async function authHeader(): Promise<Record<string, string>> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type IdentityOut = components["schemas"]["IdentityOut"];

export async function bootstrap(orgName: string): Promise<IdentityOut> {
  return authedJson("/api/auth/bootstrap", { method: "POST", body: JSON.stringify({ orgName }) });
}
export async function getMe(): Promise<IdentityOut> {
  return authedJson("/api/auth/me", { method: "GET" });
}
export async function createInvitation(email: string, role: string) {
  return authedJson("/api/invitations", { method: "POST", body: JSON.stringify({ email, role }) });
}
export async function listInvitations() {
  return authedJson("/api/invitations", { method: "GET" });
}
export async function acceptInvitation(token: string): Promise<IdentityOut> {
  return authedJson(`/api/invitations/${token}/accept`, { method: "POST" });
}

async function authedJson(path: string, init: RequestInit) {
  if (!API_BASE) throw new Error("API yapılandırılmamış.");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(await authHeader()), ...(init.headers || {}) },
  });
  if (!res.ok) {
    let detail = `Sunucu hatası (HTTP ${res.status})`;
    try { detail = (await res.json()).detail || detail; } catch { /* */ }
    throw new Error(detail);
  }
  return res.status === 204 ? undefined : res.json();
}
export const usingRealApi = Boolean(API_BASE);

export interface StreamHandlers {
  onGrounding?: (g: GroundingRecord[]) => void;
  onDelta?: (text: string) => void;
  onDone?: (meta: { model: string; disclaimer: string; usage?: GenerateResponse["usage"] }) => void;
  onError?: (message: string) => void;
}

/** Streaming üretim — gerçek backend'de SSE, mock'ta simüle akış. */
export async function generateDocStream(req: GenerateRequest, h: StreamHandlers): Promise<void> {
  if (!API_BASE) return mockStream(req, h);

  let resp: Response;
  try {
    resp = await fetch(`${API_BASE}/api/generate/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeader()) },
      body: JSON.stringify(req),
    });
  } catch {
    h.onError?.("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
    return;
  }

  if (!resp.ok || !resp.body) {
    let detail = `Sunucu hatası (HTTP ${resp.status})`;
    try {
      const e = await resp.json();
      detail = e.detail || e.error || detail;
    } catch {
      /* gövde JSON değil */
    }
    h.onError?.(detail);
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buf.indexOf("\n\n")) !== -1) {
      const frame = buf.slice(0, sep);
      buf = buf.slice(sep + 2);

      let event = "message";
      let data = "";
      for (const line of frame.split("\n")) {
        if (line.startsWith("event:")) event = line.slice(6).trim();
        else if (line.startsWith("data:")) data += line.slice(5).trim();
      }
      if (!data) continue;

      let payload: unknown;
      try {
        payload = JSON.parse(data);
      } catch {
        continue;
      }

      if (event === "grounding") h.onGrounding?.(payload as GroundingRecord[]);
      else if (event === "delta") h.onDelta?.((payload as { text: string }).text);
      else if (event === "done")
        h.onDone?.(payload as { model: string; disclaimer: string; usage?: GenerateResponse["usage"] });
      else if (event === "error") h.onError?.((payload as { detail?: string }).detail || "Üretim hatası.");
    }
  }
}

/** Mock için akış simülasyonu — prod'da da "yazılıyor" hissi verir. */
async function mockStream(req: GenerateRequest, h: StreamHandlers): Promise<void> {
  const res = await generateDocMock(req);
  h.onGrounding?.(res.grounding);
  const text = res.text;
  const step = 48;
  for (let i = 0; i < text.length; i += step) {
    h.onDelta?.(text.slice(i, i + step));
    await new Promise((r) => setTimeout(r, 12));
  }
  h.onDone?.({ model: res.model, disclaimer: res.disclaimer, usage: res.usage });
}

/** Non-streaming üretim (yedek / programatik kullanım). */
export async function generateDoc(req: GenerateRequest): Promise<GenerateResponse> {
  if (!API_BASE) return generateDocMock(req);

  const res = await fetch(`${API_BASE}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(await authHeader()) },
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
