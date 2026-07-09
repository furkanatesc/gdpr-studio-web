import type { Metadata } from "next";
import DavetForm from "./davet-form";

export const metadata: Metadata = {
  title: "Daveti Kabul Et",
  description:
    "Davet bağlantısını kullanarak KVKK Yönetim'e katılın ve ekibinizle çalışmaya başlayın.",
  robots: { index: false, follow: false },
};

export default async function DavetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  return <DavetForm token={token} />;
}
