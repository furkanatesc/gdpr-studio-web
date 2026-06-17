import { Tag } from "../../src/components/ui/tag";

export function SecimDurumlari() {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", maxWidth: 420 }}>
      <Tag label="Ad-Soyad" on onToggle={() => {}} />
      <Tag label="E-posta" on onToggle={() => {}} />
      <Tag label="Telefon" on={false} onToggle={() => {}} />
      <Tag label="Adres" on={false} onToggle={() => {}} />
      <Tag label="Sağlık verisi" on={false} onToggle={() => {}} />
    </div>
  );
}
