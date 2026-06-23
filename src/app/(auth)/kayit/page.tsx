import type { Metadata } from "next";
import KayitForm from "./kayit-form";

export const metadata: Metadata = {
  title: "Hesap Oluştur — KVKK Yönetim",
  description:
    "Büronuzu kaydedin, KVKK ve GDPR uyum sürecinizi başlatın. Ücretsiz hesap oluşturun.",
};

export default function KayitPage() {
  return <KayitForm />;
}
