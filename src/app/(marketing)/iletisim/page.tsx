import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Arrow } from "@/components/ui/icon";

export const metadata = {
  title: "İletişim — KVKK Yönetim",
  description:
    "Demo talebi, kurumsal kullanım veya iş birliği için KVKK Yönetim ekibiyle iletişime geçin.",
};

export default function IletisimPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-20">
      <div className="grid gap-14 md:grid-cols-2">
        <div data-reveal>
          <p className="eyebrow mb-3">İletişim</p>
          <h1 className="font-display text-4xl leading-tight text-ink">
            Sorularınız mı var?
          </h1>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-muted">
            Demo talebi, kurumsal kullanım veya iş birliği için bize yazın. En kısa sürede
            dönüş yaparız.
          </p>

          <div className="mt-8 space-y-4 text-[14px]">
            <div>
              <p className="eyebrow mb-1">E-posta</p>
              <p className="text-ink">merhaba@kvkkyonetim.com</p>
            </div>
            <div>
              <p className="eyebrow mb-1">Adres</p>
              <p className="text-ink-muted">İstanbul, Türkiye</p>
            </div>
          </div>
        </div>

        <form data-reveal className="space-y-4">
          <Field label="Ad Soyad">
            <Input placeholder="Adınız" />
          </Field>
          <Field label="E-posta">
            <Input type="email" placeholder="ad@hukukburonuz.com" />
          </Field>
          <Field label="Kurum (varsa)">
            <Input placeholder="Hukuk büronuz / şirketiniz" />
          </Field>
          <Field label="Mesajınız">
            <Textarea placeholder="Nasıl yardımcı olabiliriz?" className="min-h-32" />
          </Field>
          <Button type="submit" className="w-full">
            Gönder <Arrow />
          </Button>
        </form>
      </div>
    </div>
  );
}
