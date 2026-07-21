import type {
  ChecklistItem,
  ComplianceChecklist,
  ComplianceStatusValue,
  GenerateRequest,
  GenerateResponse,
  GroundingRecord,
} from "./types";
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

/** Authorization başlığı — JSON istekler ve multipart yükleme (form-data) ortak kullanır. */
async function authHeaders(): Promise<HeadersInit> {
  const token = (await supabase?.auth.getSession())?.data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/*
  Tek istek çekirdeği (interceptor): auth header + Content-Type burada eklenir,
  hata gövdesi tek yerden okunur. authedJson / generateDoc / generateDocStream
  kendi kopyalarını tutmaz.
*/
async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_BASE) throw new Error("API yapılandırılmamış.");
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(await authHeaders()),
      ...(init.headers || {}),
    },
  });
}

/*
  Idempotency: istek başına bir UUID. Backend (org, key) üzerinde kısa-TTL kilit tutar →
  aynı isteğin ağ/proxy yeniden-iletimi veya çift-çağrı (ör. React StrictMode) çift üretim
  + çift faturaya yol açmaz (ikinci ulaşım 409 duplicate_request). Kullanıcı çift-tıklaması
  ayrıca UI'da `loading` ile kilitli. crypto.randomUUID tüm modern tarayıcılarda + Node 19+'ta var.
*/
function newIdempotencyKey(): string {
  return crypto.randomUUID();
}

const DUPLICATE_MESSAGE =
  "Bu üretim isteği zaten işleniyor. Lütfen mevcut üretimin tamamlanmasını bekleyin.";

/** 409 duplicate_request mı? (backend: {detail:{code:"duplicate_request"}}) */
async function isDuplicateRequest(res: Response): Promise<boolean> {
  if (res.status !== 409) return false;
  try {
    const e = await res.clone().json();
    return e?.detail?.code === "duplicate_request";
  } catch {
    return true; // 409 ama gövde okunamadı → yine de çift istek say
  }
}

/** FastAPI hata gövdesi ({detail} | {error}) → okunur mesaj; JSON değilse HTTP kodu. */
async function errorDetail(res: Response): Promise<string> {
  const fallback = `Sunucu hatası (HTTP ${res.status})`;
  try {
    const e = await res.json();
    const d = e?.detail ?? e?.error;
    if (typeof d === "string" && d) return d;
    // detail nesne olabilir (ör. {code, message}) — okunur mesajı çıkar.
    if (d && typeof d === "object" && typeof d.message === "string") return d.message;
    return fallback;
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

/* Sektör, süreç şablonu grounding'inin eksenidir (spec §4) — bkz. sector-section.tsx. */
export const SECTOR_LABELS: Record<string, string> = {
  dis_klinigi: "Diş Kliniği",
  e_ticaret: "E-Ticaret",
  otel: "Otel / Konaklama",
  sirket: "Genel Şirket",
  psikoloji: "Psikoloji / Danışmanlık",
  meslek_orgutu: "Meslek Örgütü",
};

export async function listPersonGroups(): Promise<string[]> {
  if (!API_BASE) return [];
  return authedJson("/api/processes/person-groups", { method: "GET" });
}

export type InviteOut = components["schemas"]["InviteOut"];
export type MemberOut = components["schemas"]["MemberOut"];

export async function createInvitation(email: string, role: string): Promise<InviteOut> {
  return authedJson("/api/invitations", { method: "POST", body: JSON.stringify({ email, role }) });
}
export async function listInvitations(): Promise<InviteOut[]> {
  return authedJson("/api/invitations", { method: "GET" });
}
export async function revokeInvitation(invId: string): Promise<void> {
  return authedJson(`/api/invitations/${invId}`, { method: "DELETE" });
}
export async function acceptInvitation(token: string): Promise<IdentityOut> {
  return authedJson(`/api/invitations/${token}/accept`, { method: "POST" });
}

export async function listMembers(): Promise<MemberOut[]> {
  return authedJson("/api/memberships", { method: "GET" });
}
export async function updateMemberRole(userId: string, role: string): Promise<MemberOut> {
  return authedJson(`/api/memberships/${userId}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}
export async function removeMember(userId: string): Promise<void> {
  return authedJson(`/api/memberships/${userId}`, { method: "DELETE" });
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

/*
  Uyum kontrol listesi (Faz B) — spec §6: mock modda (API yok) boş liste döner,
  skor null (UI "—") — sahte gereksinim/skor uydurulmaz.
*/
const EMPTY_CHECKLIST: ComplianceChecklist = { groups: [], score: null, groupScores: {} };

export async function getComplianceChecklist(): Promise<ComplianceChecklist> {
  if (!API_BASE) return EMPTY_CHECKLIST;
  return authedJson("/api/compliance/checklist", { method: "GET" });
}

export async function setComplianceStatus(
  key: string,
  status: ComplianceStatusValue,
  note?: string | null,
): Promise<ChecklistItem> {
  return authedJson(`/api/compliance/status/${key}`, {
    method: "PUT",
    body: JSON.stringify({ status, note: note ?? null }),
  });
}

/*
  Müvekkil (client) yönetimi — hukuk bürosu kurumunun altında her müvekkilin kendi
  sektörü + envanteri + veri sorumlusu profili var (bkz. clients.py). Mock modda
  (API yok) boş liste döner — sahte müvekkil uydurulmaz.
*/
export type Client = {
  id: string;
  name: string;
  sector: string | null;
  legal_name?: string | null;
  kep?: string | null;
  mersis?: string | null;
  adres?: string | null;
  eposta?: string | null;
  telefon?: string | null;
  vergi_dairesi?: string | null;
  vergi_no?: string | null;
};

export type InventorySummary = { count: number; kisiGruplari: string[]; departmanlar: string[] };

export async function listClients(): Promise<Client[]> {
  if (!API_BASE) return [];
  return authedJson("/api/clients", { method: "GET" });
}
export async function createClient(name: string, sector?: string | null): Promise<Client> {
  return authedJson("/api/clients", { method: "POST", body: JSON.stringify({ name, sector: sector ?? null }) });
}
export async function getClient(id: string): Promise<Client> {
  return authedJson(`/api/clients/${id}`, { method: "GET" });
}
export async function updateClient(id: string, patch: Partial<Client>): Promise<Client> {
  return authedJson(`/api/clients/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
}
export async function importClientInventory(id: string, file: File): Promise<InventorySummary> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_BASE}/api/clients/${id}/inventory/import`, {
    method: "POST",
    headers: await authHeaders(),
    body: fd,
  });
  if (!res.ok) throw new Error(await errorDetail(res));
  return res.json();
}
export async function getClientInventorySummary(id: string): Promise<InventorySummary> {
  return authedJson(`/api/clients/${id}/inventory/summary`, { method: "GET" });
}

export type InventoryRow = {
  departman: string;
  is_sureci: string;
  alt_surec: string;
  kisi_grubu: string;
  kategoriler: string[];
  veri_turleri: string[];
  amaclar: string[];
  hukuki_sebepler: string[];
  dayanaklar: string[];
  saklama_sureleri: string[];
  islem: string[];
  ortam_format: string[];
  konum: string[];
  idari_tedbirler: string[];
  teknik_tedbirler: string[];
};

export async function getClientInventory(id: string): Promise<{ rows: InventoryRow[] }> {
  return authedJson(`/api/clients/${id}/inventory`, { method: "GET" });
}
export async function replaceClientInventory(id: string, rows: InventoryRow[]): Promise<InventorySummary> {
  return authedJson(`/api/clients/${id}/inventory`, { method: "PUT", body: JSON.stringify({ rows }) });
}
export const inventoryTemplateUrl = () => `${API_BASE}/api/inventory/template`;
export type GroundingOptions = { kategoriler: string[]; amaclar: string[]; ozelNitelikli: string[] };

export async function getGroundingOptions(): Promise<GroundingOptions> {
  if (!API_BASE) return { kategoriler: [], amaclar: [], ozelNitelikli: [] };
  return authedJson("/api/grounding/options", { method: "GET" });
}

/*
  Aydınlatma metni üretimi — envanterden hazırlanan bölümler (Section, m.10 alanları)
  öneri onayından geçtikten sonra sabit DocType.aydinlatma üretimine gider (bkz.
  backend app/modules/aydinlatma.py). Grounding'e ek olarak her bölüm kendi
  "oneriler" haritasını taşır — boş alan için öneri onayı burada yapılır.
*/
export type AydinlatmaSection = {
  isSureci: string;
  kisiGruplari: string[];
  kategoriler: string[];
  veriTurleri: string[];
  amaclar: string[];
  hukukiSebepler: string[];
  saklamaSureleri: string[];
  aktarim: string[];
  toplama: string[];
};
export type EnrichedSection = AydinlatmaSection & { oneriler: Record<string, string[]> };

export async function prepareAydinlatma(
  clientId: string,
  targetGroups: string[],
): Promise<{ sections: EnrichedSection[] }> {
  return authedJson(`/api/clients/${clientId}/aydinlatma/prepare`, {
    method: "POST",
    body: JSON.stringify({ targetGroups }),
  });
}

/** Streaming aydınlatma üretimi — generateDocStream ile aynı SSE/kota/idempotency deseni. */
export async function generateAydinlatmaStream(
  clientId: string,
  sections: AydinlatmaSection[],
  h: StreamHandlers,
): Promise<void> {
  if (!API_BASE) {
    h.onError?.("Aydınlatma üretimi gerçek API bağlantısı gerektirir.");
    return;
  }

  let resp: Response;
  try {
    resp = await apiFetch(`/api/clients/${clientId}/aydinlatma/generate`, {
      method: "POST",
      body: JSON.stringify({ sections }),
      headers: { "Idempotency-Key": newIdempotencyKey() },
    });
  } catch {
    h.onError?.("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
    return;
  }

  if (await isDuplicateRequest(resp)) {
    h.onError?.(DUPLICATE_MESSAGE);
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

export async function aydinlatmaDocx(clientId: string, text: string, title?: string): Promise<Blob> {
  const res = await apiFetch(`/api/clients/${clientId}/aydinlatma/docx`, {
    method: "POST",
    body: JSON.stringify({ text, title }),
  });
  if (!res.ok) throw new Error(await errorDetail(res));
  return res.blob();
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
    resp = await apiFetch("/api/generate/stream", {
      method: "POST",
      body: JSON.stringify(req),
      headers: { "Idempotency-Key": newIdempotencyKey() },
    });
  } catch {
    h.onError?.("Sunucuya ulaşılamadı. Backend çalışıyor mu?");
    return;
  }

  if (await isDuplicateRequest(resp)) {
    h.onError?.(DUPLICATE_MESSAGE);
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
  const res = await apiFetch("/api/generate", {
    method: "POST",
    body: JSON.stringify(req),
    headers: { "Idempotency-Key": newIdempotencyKey() },
  });
  if (await isDuplicateRequest(res)) throw new Error(DUPLICATE_MESSAGE);
  if (!res.ok) throw new Error(await errorDetail(res));
  return (await res.json()) as GenerateResponse;
}
