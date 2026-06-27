/** Shared pricing constants — single source of truth for plan labels and prices. */

export const PLAN_LABEL: Record<string, string> = {
  baslangic: "Başlangıç",
  standart: "Standart",
  premium: "Premium",
};

export const PLAN_PRICE: Record<"standart" | "premium", { month: string; year: string }> = {
  standart: { month: "₺2.600/ay", year: "₺26.000/yıl" },
  premium: { month: "₺5.000/ay", year: "₺50.000/yıl" },
};
