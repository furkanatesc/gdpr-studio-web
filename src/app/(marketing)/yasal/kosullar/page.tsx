import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = {
  title: "Kullanım Koşulları — KVKK Yönetim",
  description:
    "KVKK Yönetim platformunu kullanırken geçerli olan koşullar, sorumluluk sınırları ve üyelik şartları.",
};

export default function YasalKosullarPage() {
  return (
    <LegalPage
      eyebrow="Yasal · Koşullar"
      title="Kullanım Koşulları"
      intro="KVKK Yönetim'i kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Üretilen her doküman avukat incelemesine tabi bir taslaktır; hukuki tavsiye niteliği taşımaz."
      sections={[
        "Hizmet kapsamı ve üyelik türleri (Başlangıç / Pro / Kurumsal)",
        "Üretilen dokümanların niteliği ve sorumluluk reddi",
        "Kullanıcı yükümlülükleri ve kabul edilebilir kullanım",
        "Fikri mülkiyet ve lisans hakları",
        "Ücretlendirme, yenileme ve iptal koşulları",
        "Sorumluluğun sınırlandırılması ve uyuşmazlık çözümü",
      ]}
    />
  );
}
