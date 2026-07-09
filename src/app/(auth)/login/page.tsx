import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Giriş",
  description:
    "KVKK Yönetim hesabınıza giriş yapın; KVKK ve GDPR uyum dokümanlarınıza kaldığınız yerden devam edin.",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return <LoginForm />;
}
