import { Button } from "../../src/components/ui/button";

export function Varyantlar() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <Button>Doküman Üret</Button>
      <Button variant="secondary">Temizle</Button>
      <Button variant="ghost">Vazgeç</Button>
    </div>
  );
}

export function Boyutlar() {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Button size="md">Orta boy</Button>
      <Button size="sm">Küçük boy</Button>
    </div>
  );
}

export function Pasif() {
  return <Button disabled>Hazırlanıyor…</Button>;
}
