import type { Metadata } from "next";
import YeniParolaForm from "./yeni-parola-form";

export const metadata: Metadata = {
  title: "Yeni Parola",
  description: "Sıfırlama bağlantısıyla hesabınız için yeni bir parola belirleyin.",
  robots: { index: false, follow: false },
};

export default function YeniParolaPage() {
  return <YeniParolaForm />;
}
