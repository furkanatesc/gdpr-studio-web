import type { Metadata } from "next";
import SifreSifirlaForm from "./sifre-sifirla-form";

export const metadata: Metadata = {
  title: "Parola Sıfırlama",
  description:
    "Parolanızı mı unuttunuz? E-posta adresinize sıfırlama bağlantısı gönderin ve erişiminizi geri kazanın.",
  robots: { index: false, follow: false },
};

export default function SifreSifirlaPage() {
  return <SifreSifirlaForm />;
}
