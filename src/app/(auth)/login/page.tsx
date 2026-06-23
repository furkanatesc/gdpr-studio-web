import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Giriş — KVKK Yönetim",
  description:
    "KVKK Yönetim hesabınıza giriş yapın; KVKK ve GDPR uyum dokümanlarınıza kaldığınız yerden devam edin.",
};

export default function LoginPage() {
  return <LoginForm />;
}
