import { ButtonLink } from "@/components/ui/button-link";
import { Arrow, Icon } from "@/components/ui/icon";

/* Altı doküman türünün tamamı kendi statik rotasına sahip (/app/aydinlatma …). Bu dinamik
   segment yalnız BİLİNMEYEN /app/* yollarını yakalar → "yakında" gösterir. (Eski DocFlow
   sihirbazı ölü koddu — statik rotalar her zaman kazanıyordu — kaldırıldı.) */
export default async function DocPage() {
  return (
    <div>
      <p className="eyebrow mb-2">Araç</p>
      <h1 className="font-display text-3xl text-ink">Yakında</h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-ink-muted">
        Bu bölüm sıradaki fazda eklenecek.
      </p>
      <div className="mt-8 border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
        <Icon name="folders" className="mx-auto text-[28px] text-ink-subtle" />
        <p className="mt-4 font-display text-lg text-ink">Doküman üretmek ister misiniz?</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
          Altı doküman akışının tamamını sol menüden kullanabilirsiniz.
        </p>
        <ButtonLink href="/app/aydinlatma" size="sm" className="mt-5">
          Aydınlatma Metni&apos;ne git <Arrow />
        </ButtonLink>
      </div>
    </div>
  );
}
