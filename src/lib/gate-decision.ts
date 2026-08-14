// Optimistic gating kararı — saf mantık (proxy.ts bunu NextResponse'a çevirir).
// Gerçek authz burada DEĞİL; API Bearer + backend RLS'de.

export const PROTECTED_PREFIX = "/app";
export const AUTH_ROUTES = ["/login", "/kayit"];

export type GateDecision = { pathname: string; next?: string } | null;

/** İç path mi? Protokol-relatif (//evil) veya mutlak URL reddedilir → /app. */
export function safeNext(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? path : PROTECTED_PREFIX;
}

export function decideGate(
  path: string,
  hasSession: boolean,
  authEnabled: boolean,
): GateDecision {
  if (!authEnabled) return null; // mock/dev: gating devre dışı
  if (path.startsWith(PROTECTED_PREFIX) && !hasSession) {
    return { pathname: "/login", next: safeNext(path) };
  }
  if (hasSession && AUTH_ROUTES.includes(path)) {
    return { pathname: PROTECTED_PREFIX };
  }
  return null;
}
