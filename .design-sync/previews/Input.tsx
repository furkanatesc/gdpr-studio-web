import { Input } from "../../src/components/ui/input";

export function Bos() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Input placeholder="kvkk@sirket.com" />
    </div>
  );
}

export function Doldurulmus() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Input defaultValue="Yaşam Hastaneleri A.Ş." />
    </div>
  );
}
