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

/*
  Tek istek çekirdeği (interceptor): auth header + Content-Type burada eklenir,
  hata gövdesi tek yerden okunur. authedJson / generateDoc / generateDocStream
  kendi kopyalarını tutmaz.
*/
async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_BASE) throw new Error("API yapılandırılmamış.");
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers || {}),
    },
  });
}

/** FastAPI hata gövdesi ({detail} | {error}) → okunur mesaj; JSON değilse HTTP kodu. */
async function errorDetail(res: Response): Promise<string> {
  const fallback = `Sunucu hatası (HTTP ${res.status})`;
  try {
    const e = await res.json();
    const d = e?.detail ?? e?.error;
    return typeof d === "string" && d ? d : fallback;
  } catch {
    return fallback;
  }
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

export type BillingStatus = components["schemas"]["BillingStatusOut"];

export async function getBillingStatus(): Promise<BillingStatus> {
  return authedJson("/api/billing/status", { method: "GET" });
}
export async function createCheckout(plan: string, interval: string): Promise<{ url: string }> {
  return authedJson("/api/billing/checkout", {
    method: "POST",
    body: JSON.stringify({ plan, interval }),
  });
}
export async function createPortal(): Promise<{ url: string }> {
  return authedJson("/api/billing/portal", { method: "POST" });
}

async function authedJson(path: string, init: RequestInit) {
  const res = await apiFetch(path, init);
  if (!res.ok) throw new Error(await errorDetail(res));
  return res.status === 204 ? undefined : res.json();
}
export const usingRealApi = Boolean(API_BASE);

export interface StreamHandlers {
  onGrounding?: (g: GroundingRecord[]) => void;
  onDelta?: (text: string) => void;
  onDone?: (meta: { model: string; disclaimer: string; usage?: GenerateResponse["usage"] }) => void;
  onError?: (message: string) => void;
  onQuotaExceeded?: (info: { used: number; quota: number }) => void;
}

/** Streaming üretim — gerçek backend'de SSE, mock'ta simüle akış. */
export async function generateDocStream(req: GenerateRequest, h: StreamHandlers): Promise<void> {
  if (!API_BASE) return mockStream(req, h);

  let resp: Response;
  try {
    resp = await apiFetch("/api/generate/stream", { method: "POST", body: JSON.stringify(req) });
  } catch {
    h.onError?.("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
    return;
  }

  if (resp.status === 402) {
    let info = { used: 0, quota: 5 };
    try {
      const e = await resp.json();
      if (e?.detail?.code === "quota_exceeded") info = { used: e.detail.used, quota: e.detail.quota };
    } catch { /* */ }
    h.onQuotaExceeded?.(info);
    return;
  }

  if (!resp.ok || !resp.body) {
    h.onError?.(await errorDetail(resp));
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
  return (await authedJson("/api/generate", {
    method: "POST",
    body: JSON.stringify(req),
  })) as GenerateResponse;
}
