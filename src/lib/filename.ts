/**
 * İndirilen belgeler için anlamlı, dosya sistemi güvenli ad üretir (UX P4-2).
 * Jenerik "aydinlatma.docx" yerine "Furkan-Hukuk_Aydinlatma-Metni_2026-08-28.docx".
 */

const TR_MAP: Record<string, string> = {
  ç: "c", Ç: "C", ğ: "g", Ğ: "G", ı: "i", İ: "I",
  ö: "o", Ö: "O", ş: "s", Ş: "S", ü: "u", Ü: "U",
};

const MAX_SUBJECT_LEN = 60;

/** Türkçe → ASCII + yasak/noktalama temizliği + boşluk→tire. */
function slug(raw: string): string {
  return raw
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (c) => TR_MAP[c] ?? c)
    .replace(/[^A-Za-z0-9\s]/g, "") // alfanümerik + boşluk dışını sil (/, :, ., * vb.)
    .trim()
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildDocFilename(opts: {
  /** Belge türü etiketi, ör. "Aydınlatma Metni". */
  docLabel: string;
  /** Müvekkil/kurum adı (varsa). Boşsa yok sayılır. */
  subject?: string | null;
  /** Üretim tarihi (varsayılan: şimdi). */
  date?: Date;
  /** Uzantı (varsayılan: docx). */
  ext?: string;
}): string {
  const date = opts.date ?? new Date();
  const stamp = [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0"),
  ].join("-");

  const label = slug(opts.docLabel);
  const subject = opts.subject ? slug(opts.subject).slice(0, MAX_SUBJECT_LEN).replace(/-+$/g, "") : "";
  const ext = opts.ext ?? "docx";

  const parts = subject ? [subject, label, stamp] : [label, stamp];
  return `${parts.join("_")}.${ext}`;
}
