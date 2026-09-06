// Auth cookie'sini TAMAMEN YEREL okuma yardımcıları (ağ yok, cookie yazımı yok).
// Proxy, getSession() KULLANMAZ: auth-js getSession(), access token süresine 90sn
// kala SUNUCUDA refresh yapıp refresh token'ı rotate eder; hızlı gezinmede eşzamanlı
// proxy istekleri çakışır (refresh_token_already_used) veya chunk'lı cookie'yi bozar
// → oturum düşer → /login'e atar. Bunun yerine access-token'ı buradan çıkarıp
// getClaims(token) ile YEREL imza doğrulaması yaparız; JWKS ağ hatasında ise
// hasValidSessionCookie() yerel expiry fallback'i devreye girer.

export interface CookiePair {
  name: string;
  value: string;
}

// sb-<ref>-auth-token veya chunk'ı sb-<ref>-auth-token.0 / .1 …
// (-code-verifier, -flows-code-verifier gibi kardeş anahtarlarla eşleşmez.)
const AUTH_COOKIE_RE = /^sb-.+-auth-token(\.\d+)?$/;

function b64urlDecode(input: string): string {
  const b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** @supabase/ssr chunk'lı cookie'yi birleşik ham string'e çevirir; yoksa/bozuksa null. */
function readAuthCookiePayload(cookies: CookiePair[]): string | null {
  const auth = cookies.filter((c) => AUTH_COOKIE_RE.test(c.name) && c.value);
  if (auth.length === 0) return null;

  const base = auth[0].name.replace(/\.\d+$/, "");
  const unchunked = auth.find((c) => c.name === base);
  let combined: string;
  if (unchunked) {
    combined = unchunked.value;
  } else {
    combined = auth
      .filter((c) => c.name.startsWith(base + ".") && /\.\d+$/.test(c.name))
      .sort((a, b) => Number(a.name.split(".").pop()) - Number(b.name.split(".").pop()))
      .map((c) => c.value)
      .join("");
  }

  if (!combined.startsWith("base64-")) return combined;
  try {
    return b64urlDecode(combined.slice("base64-".length));
  } catch {
    return null; // kısmi/karışık chunk → yok say (loop-safe)
  }
}

/** Cookie'deki oturum nesnesini parse eder; yoksa/bozuksa null. */
function parseSessionCookie(cookies: CookiePair[]): Record<string, unknown> | null {
  const payload = readAuthCookiePayload(cookies);
  if (!payload) return null;
  try {
    const parsed = JSON.parse(payload);
    return typeof parsed === "object" && parsed !== null ? (parsed as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Cookie'deki access_token JWT'sini döndürür; yoksa null. getClaims(token) için. */
export function readAccessToken(cookies: CookiePair[]): string | null {
  const session = parseSessionCookie(cookies);
  if (session && typeof session.access_token === "string" && session.access_token) {
    return session.access_token;
  }
  return null;
}

function extractExpiresAt(session: Record<string, unknown>): number | null {
  if (typeof session.expires_at === "number") return session.expires_at;
  // expires_at yoksa access_token JWT'sinin exp'ine düş.
  if (typeof session.access_token === "string") {
    const parts = session.access_token.split(".");
    if (parts.length === 3) {
      try {
        const payload = JSON.parse(b64urlDecode(parts[1])) as { exp?: unknown };
        if (typeof payload.exp === "number") return payload.exp;
      } catch {
        /* düş */
      }
    }
  }
  return null;
}

/**
 * YEREL fallback: cookie'de geçerli (süresi dolmamış) oturum var mı? İmza doğrulamaz —
 * yalnız getClaims JWKS ağ hatası verdiğinde optimistic gate'i ayakta tutmak için.
 * Belirsiz/bozuk durum → false (loop-safe).
 */
export function hasValidSessionCookie(cookies: CookiePair[], nowMs: number = Date.now()): boolean {
  const session = parseSessionCookie(cookies);
  if (!session) return false;
  const expiresAt = extractExpiresAt(session);
  if (expiresAt == null) return false;
  return expiresAt * 1000 > nowMs;
}
