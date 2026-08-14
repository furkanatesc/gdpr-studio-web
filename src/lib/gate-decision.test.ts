import { describe, it, expect } from "vitest";
import { decideGate, safeNext } from "./gate-decision";

describe("safeNext", () => {
  it("iç path'i korur", () => {
    expect(safeNext("/app/dpia")).toBe("/app/dpia");
  });
  it("protokol-relatif //evil'i reddeder", () => {
    expect(safeNext("//evil.com")).toBe("/app");
  });
  it("mutlak URL'i reddeder", () => {
    expect(safeNext("https://evil.com")).toBe("/app");
  });
});

describe("decideGate", () => {
  it("korumalı + session yok → /login?next", () => {
    expect(decideGate("/app/envanter", false, true)).toEqual({
      pathname: "/login",
      next: "/app/envanter",
    });
  });
  it("korumalı + session var → null (geçer)", () => {
    expect(decideGate("/app/envanter", true, true)).toBeNull();
  });
  it("girişli + /login → /app (ters yönlendirme)", () => {
    expect(decideGate("/login", true, true)).toEqual({ pathname: "/app" });
  });
  it("girişli + /kayit → /app", () => {
    expect(decideGate("/kayit", true, true)).toEqual({ pathname: "/app" });
  });
  it("session yok + /login → null (dokunulmaz)", () => {
    expect(decideGate("/login", false, true)).toBeNull();
  });
  it("marketing / → null", () => {
    expect(decideGate("/", false, true)).toBeNull();
  });
  it("iç /app/kayit girişli → null (ters yönlendirme tetiklenmez)", () => {
    expect(decideGate("/app/kayit", true, true)).toBeNull();
  });
  it("auth kapalı (env yok) → her zaman null", () => {
    expect(decideGate("/app/envanter", false, false)).toBeNull();
  });
});
