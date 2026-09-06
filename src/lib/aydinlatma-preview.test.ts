import { describe, it, expect } from "vitest";
import {
  buildAydinlatmaPreview,
  formatFieldValues,
  PLACEHOLDER,
  PREVIEW_REQUIRED,
} from "./aydinlatma-preview";
import type { AydinlatmaSection, Client } from "@/lib/api";

function section(overrides: Partial<AydinlatmaSection> = {}): AydinlatmaSection {
  return {
    isSureci: "İşe alım",
    kisiGruplari: ["Çalışan adayları"],
    kategoriler: ["Kimlik", "İletişim"],
    veriTurleri: [],
    amaclar: ["İşe alım süreçlerinin yürütülmesi"],
    hukukiSebepler: ["m.5/2-c sözleşmenin ifası"],
    saklamaSureleri: ["Başvurudan itibaren 2 yıl"],
    aktarim: [],
    toplama: ["Başvuru formu"],
    ...overrides,
  };
}
const client = (o: Partial<Client> = {}): Client => ({ id: "c1", name: "Nova A.Ş.", sector: null, ...o });

describe("formatFieldValues", () => {
  it("dolu liste → virgülle birleşir", () => {
    expect(formatFieldValues(["Kimlik", "İletişim"])).toBe("Kimlik, İletişim");
  });
  it("boş liste → placeholder", () => {
    expect(formatFieldValues([])).toBe(PLACEHOLDER);
  });
});

describe("buildAydinlatmaPreview — veri sorumlusu adı", () => {
  it("legal_name varsa onu kullanır", () => {
    const p = buildAydinlatmaPreview([section()], client({ legal_name: "Nova Perakende Anonim Şirketi", name: "Nova A.Ş." }));
    expect(p.controllerName).toBe("Nova Perakende Anonim Şirketi");
  });
  it("legal_name yoksa name'e düşer", () => {
    const p = buildAydinlatmaPreview([section()], client({ legal_name: null, name: "Nova A.Ş." }));
    expect(p.controllerName).toBe("Nova A.Ş.");
  });
  it("client yoksa placeholder", () => {
    const p = buildAydinlatmaPreview([section()], null);
    expect(p.controllerName).toBe(PLACEHOLDER);
  });
});

describe("buildAydinlatmaPreview — eksik zorunlu alan tespiti", () => {
  it("boş hukukiSebepler → missing'de hukukiSebepler var", () => {
    const p = buildAydinlatmaPreview([section({ hukukiSebepler: [] })], client());
    expect(p.activities[0].missing).toContain("hukukiSebepler");
  });
  it("tüm zorunlu alanlar dolu → missing boş", () => {
    const p = buildAydinlatmaPreview([section()], client());
    expect(p.activities[0].missing).toEqual([]);
  });
  it("boş aktarim missing DEĞİL (opsiyonel)", () => {
    const p = buildAydinlatmaPreview([section({ aktarim: [] })], client());
    expect(p.activities[0].missing).not.toContain("aktarim");
    expect(PREVIEW_REQUIRED).not.toContain("aktarim");
  });
  it("totalMissing bölümler arası toplanır", () => {
    const p = buildAydinlatmaPreview(
      [section({ hukukiSebepler: [] }), section({ hukukiSebepler: [], toplama: [] })],
      client(),
    );
    expect(p.totalMissing).toBe(3); // 1 + 2
  });
});

describe("buildAydinlatmaPreview — yapı", () => {
  it("her bölüm bir activity'ye eşlenir (uzunluk korunur)", () => {
    const p = buildAydinlatmaPreview([section(), section({ isSureci: "Müşteri" })], client());
    expect(p.activities.map((a) => a.isSureci)).toEqual(["İşe alım", "Müşteri"]);
  });
  it("activity alanları kaynak bölümden taşınır", () => {
    const p = buildAydinlatmaPreview([section({ amaclar: ["A", "B"] })], client());
    expect(p.activities[0].amaclar).toEqual(["A", "B"]);
  });
});
