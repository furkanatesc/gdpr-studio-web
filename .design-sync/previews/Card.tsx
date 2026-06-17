import { Card } from "../../src/components/ui/card";
import { Input } from "../../src/components/ui/input";

export function BilgiKarti() {
  return (
    <div style={{ maxWidth: 480 }}>
      <Card title="Şirket Bilgileri" icon={<span>🏛️</span>}>
        <div style={{ display: "grid", gap: 12 }}>
          <Input defaultValue="Yaşam Hastaneleri A.Ş." />
          <Input placeholder="kvkk@sirket.com" />
        </div>
      </Card>
    </div>
  );
}

export function BasliksizKart() {
  return (
    <div style={{ maxWidth: 480 }}>
      <Card>
        <p style={{ margin: 0, fontSize: 14 }}>
          Başlıksız içerik kartı — herhangi bir içerik barındırabilir.
        </p>
      </Card>
    </div>
  );
}
