import { LegalPage } from "@/components/marketing/legal-page";

export const metadata = {
  title: "Aydınlatma Metni — KVKK Yönetim",
  description:
    "KVKK Yönetim'in veri sorumlusu sıfatıyla kişisel verilerinizi nasıl işlediğine dair aydınlatma metni.",
};

export default function YasalAydinlatmaPage() {
  return (
    <LegalPage
      eyebrow="Yasal · KVKK m.10"
      title="Aydınlatma Metni"
      intro="KVKK Yönetim olarak, hizmetlerimizi kullanırken işlediğimiz kişisel verilerinize ilişkin sizi 6698 sayılı KVKK kapsamında aydınlatmakla yükümlüyüz."
      sections={[
        "Veri sorumlusunun kimliği ve iletişim bilgileri",
        "İşlenen kişisel veri kategorileri ve işleme amaçları",
        "Kişisel verilerin aktarıldığı taraflar ve aktarım amaçları",
        "Toplama yöntemi ve hukuki sebepler (KVKK m.5/6)",
        "İlgili kişinin KVKK m.11 kapsamındaki hakları",
        "Saklama süreleri ve imha politikası",
      ]}
    />
  );
}
