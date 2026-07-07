import type { Metadata } from "next";
import YeniParolaForm from "./yeni-parola-form";

export const metadata: Metadata = {
  title: "Yeni Parola — KVKK Yönetim",
  description: "Sıfırlama bağlantısıyla hesabınız için yeni bir parola belirleyin.",
};

export default function YeniParolaPage() {
  return <YeniParolaForm />;
}
