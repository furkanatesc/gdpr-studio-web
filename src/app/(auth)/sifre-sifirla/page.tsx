import type { Metadata } from "next";
import SifreSifirlaForm from "./sifre-sifirla-form";

export const metadata: Metadata = {
  title: "Parola Sıfırlama — KVKK Yönetim",
  description:
    "Parolanızı mı unuttunuz? E-posta adresinize sıfırlama bağlantısı gönderin ve erişiminizi geri kazanın.",
};

export default function SifreSifirlaPage() {
  return <SifreSifirlaForm />;
}
