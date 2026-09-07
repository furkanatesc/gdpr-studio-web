import { describe, it, expect } from "vitest";
import { buildIhlalPreview, IHLAL_REQUIRED, PLACEHOLDER } from "./ihlal-preview";
import type { IhlalOlay, InventoryRow, Client } from "@/lib/api";

function row(o: Partial<InventoryRow> = {}): InventoryRow {
  return {
    departman: "İK",
    is_sureci: "İşe alım",
    alt_surec: "",
    kisi_grubu: "Çalışan adayları",
    kategoriler: ["Kimlik", "İletişim"],
    veri_turleri: [],
    amaclar: [],
    hukuki_sebepler: [],
    dayanaklar: [],
    saklama_sureleri: [],
    islem: [],
    ortam_format: [],
    konum: [],
    idari_tedbirler: [],
    teknik_tedbirler: [],
    aktarim: [],
    toplama: [],
    ...o,
  };
}
function olay(o: Partial<IhlalOlay> = {}): IhlalOlay {
  return {
    tespit: "2026-09-07T10:00",
    tur: "Yetkisiz erişim",
    etkilenenIndeksler: [0],
    kimlikFinansal: true,
    sifreli: false,
    kisiSayisi: 120,
    nasil: "Phishing ile hesap ele geçirildi.",
    onlemler: "Parolalar sıfırlandı.",
    ...o,
  };
}
const client = (o: Partial<Client> = {}): Client => ({ id: "c1", name: "Nova A.Ş.", sector: null, ...o });

describe("buildIhlalPreview — veri sorumlusu", () => {
  it("legal_name > name > placeholder", () => {
    expect(buildIhlalPreview(olay(), [row()], client({ legal_name: "Nova Perakende A.Ş." })).controllerName).toBe(
      "Nova Perakende A.Ş.",
    );
    expect(buildIhlalPreview(olay(), [row()], client({ legal_name: null })).controllerName).toBe("Nova A.Ş.");
    expect(buildIhlalPreview(olay(), [row()], null).controllerName).toBe(PLACEHOLDER);
  });
});

describe("buildIhlalPreview — etkilenen süreçler", () => {
  it("seçili indeksleri satır etiketine çevirir", () => {
    const p = buildIhlalPreview(olay({ etkilenenIndeksler: [0] }), [row()], client());
    expect(p.affectedProcesses).toEqual(["İK / İşe alım — Çalışan adayları"]);
  });
  it("aralık dışı indeksi yok sayar", () => {
    const p = buildIhlalPreview(olay({ etkilenenIndeksler: [0, 5] }), [row()], client());
    expect(p.affectedProcesses).toHaveLength(1);
  });
  it("rows null → boş", () => {
    const p = buildIhlalPreview(olay(), null, client());
    expect(p.affectedProcesses).toEqual([]);
  });
});

describe("buildIhlalPreview — etkilenen kategoriler (benzersiz union)", () => {
  it("seçili satırların kategorilerini benzersiz birleştirir", () => {
    const rows = [row({ kategoriler: ["Kimlik", "İletişim"] }), row({ kategoriler: ["İletişim", "Finans"] })];
    const p = buildIhlalPreview(olay({ etkilenenIndeksler: [0, 1] }), rows, client());
    expect(p.affectedCategories).toEqual(["Kimlik", "İletişim", "Finans"]);
  });
});

describe("buildIhlalPreview — eksik zorunlu alan", () => {
  it("boş tespit → missing'de tespit", () => {
    expect(buildIhlalPreview(olay({ tespit: "" }), [row()], client()).missing).toContain("tespit");
  });
  it("etkilenen süreç yok → missing'de etkilenenSurecler", () => {
    expect(buildIhlalPreview(olay({ etkilenenIndeksler: [] }), [row()], client()).missing).toContain(
      "etkilenenSurecler",
    );
  });
  it("boş nasil ve onlemler → ikisi de missing", () => {
    const p = buildIhlalPreview(olay({ nasil: "", onlemler: "" }), [row()], client());
    expect(p.missing).toContain("nasil");
    expect(p.missing).toContain("onlemler");
  });
  it("tümü dolu → missing boş", () => {
    expect(buildIhlalPreview(olay(), [row()], client()).missing).toEqual([]);
  });
  it("IHLAL_REQUIRED tur içermez (varsayılanı hep dolu)", () => {
    expect(IHLAL_REQUIRED).not.toContain("tur");
  });
});

describe("buildIhlalPreview — passthrough", () => {
  it("olay alanlarını taşır", () => {
    const p = buildIhlalPreview(olay({ tur: "Fidye / şifreleme", kisiSayisi: 5, sifreli: true }), [row()], client());
    expect(p.tur).toBe("Fidye / şifreleme");
    expect(p.kisiSayisi).toBe(5);
    expect(p.sifreli).toBe(true);
    expect(p.nasil).toBe("Phishing ile hesap ele geçirildi.");
  });
});
