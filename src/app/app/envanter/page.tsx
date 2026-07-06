import { PageHeader } from "@/components/app/page-header";

export const metadata = {
  title: "Envanter Yönetimi — KVKK Yönetim",
};

/*
  Faz A iskeleti (sözleşme §2.4): sayfa var, başlık grameri + boş durum doğru;
  tam envanter CRUD'u ROADMAP'te ayrı kalem. Sessiz 404 kalmaz.
*/
export default function EnvanterPage() {
  return (
    <div>
      <PageHeader eyebrow="Araçlar / Envanter" title="Envanter Yönetimi" />
      <div className="mt-8 border border-dashed border-border-strong bg-surface px-8 py-12 text-center">
        <p className="font-medium text-[10.5px] uppercase tracking-[0.1em] text-accent">Yakında</p>
        <p className="mx-auto mt-3 max-w-md font-display text-xl text-ink">
          Bağımsız envanter yönetimi bu ekrana geliyor.
        </p>
        <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink-muted">
          Şimdilik veri envanterinizi doküman sihirbazının envanter adımında tanımlayabilirsiniz;
          girdiğiniz kayıtlar tüm doküman türlerinde kullanılır.
        </p>
      </div>
    </div>
  );
}
