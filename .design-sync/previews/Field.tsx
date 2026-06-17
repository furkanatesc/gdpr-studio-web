import { Field } from "../../src/components/ui/field";
import { Input } from "../../src/components/ui/input";

export function ZorunluAlan() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Field label="Veri sorumlusu e-postası" required>
        <Input placeholder="kvkk@sirket.com" />
      </Field>
    </div>
  );
}

export function OpsiyonelAlan() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Field label="DPO / Veri Koruma Görevlisi (varsa)">
        <Input placeholder="Ad Soyad veya dpo@sirket.com" />
      </Field>
    </div>
  );
}
