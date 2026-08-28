import { describe, expect, it } from "vitest";
import { buildDocFilename } from "./filename";

const DATE = new Date("2026-08-28T10:00:00Z");

describe("buildDocFilename", () => {
  it("konu + belge adı + tarih ile anlamlı ad üretir", () => {
    expect(
      buildDocFilename({ docLabel: "Aydınlatma Metni", subject: "Furkan Hukuk", date: DATE }),
    ).toBe("Furkan-Hukuk_Aydinlatma-Metni_2026-08-28.docx");
  });

  it("konu yoksa yalnız belge adı + tarih kullanır", () => {
    expect(buildDocFilename({ docLabel: "Çerez Politikası", date: DATE })).toBe(
      "Cerez-Politikasi_2026-08-28.docx",
    );
  });

  it("Türkçe karakterleri ASCII'ye çevirir (dosya sistemi güvenli)", () => {
    expect(buildDocFilename({ docLabel: "İşleme Kaydı", subject: "Öz Güneş Ç.", date: DATE })).toBe(
      "Oz-Gunes-C_Isleme-Kaydi_2026-08-28.docx",
    );
  });

  it("dosya sistemi yasak karakterlerini temizler", () => {
    expect(
      buildDocFilename({ docLabel: "Rapor", subject: 'A/B:C*?"<>|D', date: DATE }),
    ).toBe("ABCD_Rapor_2026-08-28.docx");
  });

  it("boş/whitespace konuyu yok sayar", () => {
    expect(buildDocFilename({ docLabel: "Rapor", subject: "   ", date: DATE })).toBe(
      "Rapor_2026-08-28.docx",
    );
  });

  it("özel uzantı verilebilir", () => {
    expect(buildDocFilename({ docLabel: "Rapor", date: DATE, ext: "pdf" })).toBe(
      "Rapor_2026-08-28.pdf",
    );
  });

  it("aşırı uzun konuyu kısaltır", () => {
    const long = "A".repeat(120);
    const out = buildDocFilename({ docLabel: "Rapor", subject: long, date: DATE });
    expect(out.length).toBeLessThanOrEqual(100);
    expect(out.endsWith("_Rapor_2026-08-28.docx")).toBe(true);
  });
});
