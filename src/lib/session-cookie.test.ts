import { describe, it, expect } from "vitest";
import { hasValidSessionCookie, readAccessToken } from "./session-cookie";

const KEY = "sb-whdalglsjebkvrszcfep-auth-token";
const NOW = 1_700_000_000_000; // sabit "now" (ms)

function b64url(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), "utf8").toString("base64url");
}
function jwt(payload: unknown): string {
  const h = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" }), "utf8").toString("base64url");
  const p = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${h}.${p}.sig`;
}
function session(overrides: Record<string, unknown> = {}) {
  return {
    access_token: jwt({ exp: Math.floor(NOW / 1000) + 3600 }),
    token_type: "bearer",
    expires_in: 3600,
    expires_at: Math.floor(NOW / 1000) + 3600,
    refresh_token: "r-token",
    user: { id: "u1", email: "a@b.com" },
    ...overrides,
  };
}
const cookie = (name: string, value: string) => ({ name, value });

describe("hasValidSessionCookie", () => {
  it("cookie yok → false", () => {
    expect(hasValidSessionCookie([], NOW)).toBe(false);
  });

  it("yalnız alakasız cookie → false", () => {
    expect(hasValidSessionCookie([cookie("theme", "dark")], NOW)).toBe(false);
  });

  it("düz JSON (chunk'sız), süresi gelecekte → true", () => {
    expect(hasValidSessionCookie([cookie(KEY, JSON.stringify(session()))], NOW)).toBe(true);
  });

  it("base64- (chunk'sız), süresi gelecekte → true", () => {
    expect(hasValidSessionCookie([cookie(KEY, "base64-" + b64url(session()))], NOW)).toBe(true);
  });

  it("süresi geçmiş → false", () => {
    const expired = session({ expires_at: Math.floor(NOW / 1000) - 10 });
    expect(hasValidSessionCookie([cookie(KEY, "base64-" + b64url(expired))], NOW)).toBe(false);
  });

  it("chunk'lı (.0/.1) yeniden birleşir, gelecekte → true", () => {
    const full = "base64-" + b64url(session());
    const mid = Math.ceil(full.length / 2);
    expect(
      hasValidSessionCookie(
        [cookie(`${KEY}.0`, full.slice(0, mid)), cookie(`${KEY}.1`, full.slice(mid))],
        NOW,
      ),
    ).toBe(true);
  });

  it("chunk sırası karışık gelse de doğru birleşir → true", () => {
    const full = "base64-" + b64url(session());
    const mid = Math.ceil(full.length / 2);
    expect(
      hasValidSessionCookie(
        [cookie(`${KEY}.1`, full.slice(mid)), cookie(`${KEY}.0`, full.slice(0, mid))],
        NOW,
      ),
    ).toBe(true);
  });

  it("eksik chunk (bozuk/kısmi yazım) → false (loop-safe)", () => {
    const full = "base64-" + b64url(session());
    const mid = Math.ceil(full.length / 2);
    // yalnız .0 var, .1 kayıp → JSON parse edilemez
    expect(hasValidSessionCookie([cookie(`${KEY}.0`, full.slice(0, mid))], NOW)).toBe(false);
  });

  it("bozuk JSON → false", () => {
    expect(hasValidSessionCookie([cookie(KEY, "base64-!!!notb64!!!")], NOW)).toBe(false);
  });

  it("expires_at yok ama access_token JWT exp gelecekte → true (JWT fallback)", () => {
    const s = session({ expires_at: undefined });
    delete (s as Record<string, unknown>).expires_at;
    expect(hasValidSessionCookie([cookie(KEY, JSON.stringify(s))], NOW)).toBe(true);
  });

  it("expires_at yok, access_token JWT exp geçmiş → false", () => {
    const s = session({
      expires_at: undefined,
      access_token: jwt({ exp: Math.floor(NOW / 1000) - 10 }),
    });
    delete (s as Record<string, unknown>).expires_at;
    expect(hasValidSessionCookie([cookie(KEY, JSON.stringify(s))], NOW)).toBe(false);
  });

  it("expires_at yok, access_token yok → false", () => {
    expect(hasValidSessionCookie([cookie(KEY, JSON.stringify({ foo: 1 }))], NOW)).toBe(false);
  });
});

describe("readAccessToken", () => {
  it("cookie yok → null", () => {
    expect(readAccessToken([])).toBeNull();
  });

  it("chunk'lı base64 cookie'den access_token çıkarır", () => {
    const s = session();
    const full = "base64-" + b64url(s);
    const mid = Math.ceil(full.length / 2);
    expect(
      readAccessToken([cookie(`${KEY}.0`, full.slice(0, mid)), cookie(`${KEY}.1`, full.slice(mid))]),
    ).toBe(s.access_token);
  });

  it("düz JSON cookie'den access_token çıkarır", () => {
    const s = session();
    expect(readAccessToken([cookie(KEY, JSON.stringify(s))])).toBe(s.access_token);
  });

  it("bozuk cookie → null", () => {
    expect(readAccessToken([cookie(KEY, "base64-!!!notb64!!!")])).toBeNull();
  });

  it("access_token'sız oturum → null", () => {
    expect(readAccessToken([cookie(KEY, JSON.stringify({ expires_at: 123 }))])).toBeNull();
  });
});
