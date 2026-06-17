import { Select } from "../../src/components/ui/select";

export function Varsayilan() {
  return (
    <div style={{ maxWidth: 360 }}>
      <Select defaultValue="Sağlık / Medikal">
        <option>Sağlık / Medikal</option>
        <option>Fintech / Finans</option>
        <option>E-ticaret</option>
        <option>SaaS / Teknoloji</option>
      </Select>
    </div>
  );
}
