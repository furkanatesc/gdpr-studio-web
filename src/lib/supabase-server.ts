import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

// Proxy için request-scoped Supabase client. Cookie'yi request'ten okur, güncellenen
// auth cookie'lerini response'a yazar (getAll/setAll adapter chunked cookie'yi yönetir).
// Env yoksa null → proxy gating'i atlar (mock/dev).
export function createServerClientForProxy(req: NextRequest): {
  supabase: SupabaseClient | null;
  response: NextResponse;
} {
  const response = NextResponse.next();
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) return { supabase: null, response };

  const supabase = createServerClient(url, anon, {
    cookies: {
      getAll: () => req.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  return { supabase, response };
}
