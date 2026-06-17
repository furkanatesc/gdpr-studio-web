import { Textarea } from "../../src/components/ui/textarea";

export function Varsayilan() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea placeholder="Ek bağlam / özel durumlar — örn: çocuklara yönelik hizmet, özel kategori veri işleme..." />
    </div>
  );
}

export function Doldurulmus() {
  return (
    <div style={{ maxWidth: 420 }}>
      <Textarea defaultValue={"Hastaneler grubu. Sağlık verisi ve özel nitelikli veri işleniyor; DPIA yapıldı."} />
    </div>
  );
}
