import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Env yoksa null → UI "auth yapılandırılmamış" durumunu nazikçe ele alır (dev/mock).
export const supabase: SupabaseClient | null = url && anon ? createClient(url, anon) : null;
export const usingAuth = Boolean(supabase);
