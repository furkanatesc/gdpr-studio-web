import { Icon } from "@/components/ui/icon";

/** KVKK m.6 uyarısı — en az bir özel nitelikli etiket seçiliyken görünür. */
export function SensitiveNotice() {
  return (
    <div className="animate-fade-in mt-4 flex items-start gap-2.5 rounded-[var(--radius)] border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-4 py-3 text-[13px] leading-relaxed text-warning">
      <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[15px]" />
      <span>
        <strong className="font-medium">Özel nitelikli kişisel veri seçtiniz.</strong> KVKK
        m.6 uyarınca açık rıza veya kanuni istisna şartları geçerlidir; üretilen metinde
        ayrıca ele alınır.
      </span>
    </div>
  );
}
