import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = {
  title: "Gizlilik Politikası — KVKK Yönetim",
  description:
    "KVKK Yönetim'in verilerinizi nasıl topladığı, sakladığı ve koruduğuna dair gizlilik politikası.",
};

export default function YasalGizlilikPage() {
  return (
    <LegalPage
      eyebrow="Yasal · Gizlilik"
      title="Gizlilik Politikası"
      intro="Verilerinizin güvenliği hizmetimizin temelidir. Bu politika, hangi verileri neden topladığımızı ve nasıl koruduğumuzu açıklar."
      sections={[
        "Toplanan veriler ve toplama yöntemleri",
        "Verilerin işlenme amaçları ve hukuki dayanakları",
        "AB/TR veri ikameti ve barındırma konumları",
        "Çerezler ve takip teknolojileri",
        "Üçüncü taraf hizmet sağlayıcılar ve alt işleyenler",
        "Veri güvenliği tedbirleri ve saklama süreleri",
        "Haklarınız ve başvuru kanalları",
      ]}
    />
  );
}
