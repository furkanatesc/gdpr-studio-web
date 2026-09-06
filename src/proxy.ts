import { NextResponse, type NextRequest } from "next/server";
import { decideGate } from "@/lib/gate-decision";
import { verifySession } from "@/lib/proxy-auth";

const authEnabled = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export default async function proxy(req: NextRequest): Promise<NextResponse> {
  // Oturumu cookie'deki access-token'ın ES256 imzasını getClaims(token) ile YEREL doğrulayarak
  // belirle — ağ refresh'i / token rotation YOK (getSession() bunları yapıp seri gezinmede
  // eşzamanlı isteklerde çakışarak kullanıcıyı /login'e atıyordu).
  const hasSession = authEnabled ? await verifySession(req.cookies.getAll()) : false;

  const decision = decideGate(req.nextUrl.pathname, hasSession, authEnabled);
  if (decision) {
    const url = req.nextUrl.clone();
    url.pathname = decision.pathname;
    url.search = "";
    if (decision.next) url.searchParams.set("next", decision.next);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// api, _next statikleri ve uzantılı dosyalar hariç her yol. /app/* ve /login,/kayit dahil.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.[\\w]+$).*)"],
};
