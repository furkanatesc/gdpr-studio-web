import { Icon } from "@/components/ui/icon";

/*
  Üretim kesme/reddi uyarısı — backend `warning` SSE olayı (truncated_max_tokens |
  generation_refused). Bu durumda belge KAYDEDİLMEZ; aydinlatma/cerez/kayit-client.tsx
  üçünde de quotaBlock ile aynı uyarı görünümü, DocumentOutput'un ÜSTÜNDE gösterilir.
*/
export function GenerationWarning({ warning }: { warning: { code: string; message: string } }) {
  return (
    <div className="flex items-start gap-2.5 border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-5 py-4 text-sm">
      <Icon name="shield-alert" className="mt-0.5 flex-shrink-0 text-[16px] text-warning" />
      <div>
        <strong className="font-medium text-ink">Belge kaydedilmedi.</strong>
        <p className="mt-1 text-ink-muted">{warning.message}</p>
      </div>
    </div>
  );
}
