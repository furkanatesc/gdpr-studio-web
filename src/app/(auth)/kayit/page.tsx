import type { Metadata } from "next";
import KayitForm from "./kayit-form";

export const metadata: Metadata = {
  title: "Hesap Oluştur",
  description:
    "Büronuzu kaydedin, KVKK ve GDPR uyum sürecinizi başlatın. Ücretsiz hesap oluşturun.",
  robots: { index: false, follow: false },
};

export default function KayitPage() {
  return <KayitForm />;
}
