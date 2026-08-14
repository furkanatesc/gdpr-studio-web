import { NextResponse, type NextRequest } from "next/server";
import { createServerClientForProxy } from "@/lib/supabase-server";
import { decideGate } from "@/lib/gate-decision";

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  const { supabase, response } = createServerClientForProxy(req);

  // Optimistic: cookie'yi YERELDE decode et (ağ yok). getUser() ağ çağrısıdır — kullanılmaz.
  let hasSession = false;
  if (supabase) {
    const { data } = await supabase.auth.getSession();
    hasSession = Boolean(data.session);
  }

  const decision = decideGate(req.nextUrl.pathname, hasSession, Boolean(supabase));
  if (decision) {
    const url = req.nextUrl.clone();
    url.pathname = decision.pathname;
    url.search = "";
    if (decision.next) url.searchParams.set("next", decision.next);
    return NextResponse.redirect(url);
  }
  return response; // güncellenmiş auth cookie header'larını taşır
}

// api, _next statikleri ve uzantılı dosyalar hariç her yol. /app/* ve /login,/kayit dahil.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
