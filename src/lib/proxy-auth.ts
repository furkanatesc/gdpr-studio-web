import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { hasValidSessionCookie, readAccessToken, type CookiePair } from "@/lib/session-cookie";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Modül-singleton: auth-js JWKS cache'i (storageKey ile anahtarlı, GLOBAL_JWKS) istekler
// arası korunur → ES256 imza doğrulaması ilk çağrıdan sonra tamamen yerel (ağsız) olur.
let client: SupabaseClient | null = null;
function getClient(): SupabaseClient | null {
  if (!url || !anon) return null;
  if (!client) {
    client = createClient(url, anon, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
  }
  return client;
}

/**
 * Oturumu YETKİLİ + YARIŞSIZ doğrular: cookie'deki access-token'ı getClaims(token) ile
 * ES256 imzasına göre YERELDE verify eder (refresh/rotation YOK — argümansız getClaims
 * içeride getSession() çağırıp yarışı geri getirir, o yüzden token'ı açıkça veriyoruz).
 * İmza geçersiz / token süresi dolmuş → false. JWKS ağ hatası gibi imza-dışı durumda
 * yerel expires_at fallback'ine düşer (optimistic gate'i ağ hatasında ayakta tutar).
 */
export async function verifySession(cookies: CookiePair[]): Promise<boolean> {
  const token = readAccessToken(cookies);
  if (!token) return false;
  const supabase = getClient();
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.auth.getClaims(token);
    if (!error && data?.claims) return true;
    if (error && /Jwt/i.test(error.name)) return false; // geçersiz imza / süresi dolmuş
    return hasValidSessionCookie(cookies); // ağ/JWKS/bilinmeyen → yerel fallback
  } catch {
    return hasValidSessionCookie(cookies); // getClaims fırlattı (ör. JWKS fetch) → yerel fallback
  }
}
