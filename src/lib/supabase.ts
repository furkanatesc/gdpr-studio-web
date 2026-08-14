import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Env yoksa null → UI "auth yapılandırılmamış" durumunu nazikçe ele alır (dev/mock).
// createBrowserClient: session'ı cookie'ye yazar (proxy okuyabilir). flowType:'implicit' —
// kayıt onayı + parola sıfırlama e-posta akışları URL-hash token'a dayanır; PKCE'ye kayarsa
// (@supabase/ssr varsayılanı) callback route gerektirir (yok) ve akışlar kırılır.
export const supabase: SupabaseClient | null =
  url && anon
    ? createBrowserClient(url, anon, { auth: { flowType: "implicit" } })
    : null;
export const usingAuth = Boolean(supabase);
