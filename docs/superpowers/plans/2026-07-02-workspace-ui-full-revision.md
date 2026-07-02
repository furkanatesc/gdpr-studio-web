# Workspace UI Tam Revizyonu — İmplementasyon Planı

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Workspace'i (`/app/*`) KVKK m.6 uyarıları, disclaimer, adım barlı wizard, toast sistemi ve görsel cila ile revize etmek; paleti (mühür kırmızısı, doküman tipi renkleri, amber warning) ve display fontu (Playfair → Fraunces) rafine etmek.

**Architecture:** Tüm renkler `globals.css`'teki semantik CSS değişkenleri üzerinden akar (Tailwind v4 `@theme inline` bağlaması); bileşenler token'ları kullanır, ham hex yazmaz. `doc-flow.tsx` şemadan türeyen adımlı wizard'a dönüşür; toast bağımsız context provider olarak yalnız workspace'e sarılır. Spec: `web/docs/superpowers/specs/2026-07-02-workspace-ui-full-revision-design.md`.

**Tech Stack:** Next.js 16.2.9 (App Router), React 19.2.4, Tailwind CSS v4 (CSS-first, config dosyası yok), TypeScript 5, next/font/google.

## Global Constraints

- Çalışma dizini: `web/` (repo: gdpr-studio-web, branch `main`).
- **Next.js 16 uyarısı (AGENTS.md):** API'ler eğitim verinden farklı olabilir; emin olunmayan Next API'si için `web/node_modules/next/dist/docs/` içindeki rehbere bak.
- **Test altyapısı yok** (repo deseninde UI testi yok): her görevin doğrulaması `npm run typecheck` + `npm run lint` + gerekiyorsa `npm run build` + belirtilen elle tarayıcı kontrolü. Mock akış (`NEXT_PUBLIC_API_BASE` olmadan) backend'siz çalışır — elle kontroller `npm run dev` + mock ile yapılır.
- Bileşenlerde **ham hex yazılmaz** — yalnız token/utility (`text-warning`, `var(--doc-aydinlatma)` vb.).
- Metinler yalnız **Türkçe**; emoji yok (monokrom `Icon` seti); tipografik karakterler (`→`, `×`) serbest.
- **Yeni npm bağımlılığı eklenmez.**
- Commit mesajları Türkçe, conventional prefix (`feat:`, `docs:`...) ile; **Co-Authored-By treyleri EKLENMEZ** (kullanıcı kuralı). **Push yapılmaz** — kullanıcı onayı gerekir.
- `prefers-reduced-motion: reduce` altında eklenen tüm animasyonlar kapatılır.

---

### Task 1: Tasarım token'ları (warning, mühür kırmızısı, doküman tipi renkleri, lift gölgesi)

**Files:**
- Modify: `web/src/app/globals.css:10-77`

**Interfaces:**
- Produces: Tailwind utility'leri `text-warning`, `bg-warning-soft`, `border-warning`, `border-l-warning` (ve danger eşdeğerleri); CSS değişkenleri `--doc-aydinlatma|cerez|kayit|dpa|dpia|ihlal` (inline style ile `var(--doc-<type>)` şeklinde kullanılır); `--shadow-card-lift`.

- [ ] **Step 1: `:root` bloğuna yeni token'ları ekle ve danger'ı rafine et**

`globals.css` `:root` içinde `--danger: #8b2a2a;` ve `--danger-soft: #f3e2d8;` satırlarını değiştir, `--ok-soft` satırından sonra yenilerini ekle:

```css
  --danger: #7f1f2b; /* mühür kırmızısı — törensel rol: disclaimer vurgusu + ihlal tipi */
  --danger-soft: #f5e3e2;
  --ok: #3f6212;
  --ok-soft: #e8eed6;
  --warning: #7a4f1c;
  --warning-soft: #f5ead8;

  /* Doküman tipi kimlik renkleri — yalnız rozet/nokta düzeyinde (yüzeyler saman kalır) */
  --doc-aydinlatma: #b5912f;
  --doc-cerez: #7a4f1c;
  --doc-kayit: #4a5a3a;
  --doc-dpa: #3d5a55;
  --doc-dpia: #634a5d;
  --doc-ihlal: #7f1f2b;

  --radius: 0.625rem;
  --shadow-card: 0 1px 2px rgba(33, 28, 18, 0.04), 0 8px 24px rgba(33, 28, 18, 0.06);
  --shadow-card-lift: 0 2px 4px rgba(33, 28, 18, 0.05), 0 16px 40px rgba(33, 28, 18, 0.1);
```

(Mevcut `--danger/-soft`, `--ok/-soft`, `--radius`, `--shadow-card` satırlarının yerini yukarıdaki bütün blok alır; `--ok` değerleri değişmez.)

- [ ] **Step 2: `.theme-brand` bloğuna warning + lift ekle**

`.theme-brand` içinde `--ok-soft` satırından sonra:

```css
  --warning: #e0b168;
  --warning-soft: rgba(224, 177, 104, 0.12);
  --shadow-card-lift: 0 2px 4px rgba(0, 0, 0, 0.45), 0 20px 56px rgba(0, 0, 0, 0.4);
```

(`.theme-brand` danger değerleri `#d98a6a` olarak DEĞİŞMEZ — koyu katmanda mühür rolü yok.)

- [ ] **Step 3: `@theme inline` bloğuna utility bağlarını ekle**

`--color-ok-soft` satırından sonra:

```css
  --color-warning: var(--warning);
  --color-warning-soft: var(--warning-soft);
```

(Doküman tipi renkleri utility'ye bağlanmaz — dinamik tip adıyla inline `style={{ backgroundColor: "var(--doc-...)" }}` kullanılacak; Tailwind dinamik sınıf üretemez.)

- [ ] **Step 4: Doğrula**

Run: `cd web && npm run typecheck && npm run build`
Expected: ikisi de hatasız. Görsel fark henüz yok (token'lar kullanılmıyor) — sadece danger tonu: `npm run dev` ile `/app/aydinlatma`'da üretim hatası tetiklemeye gerek yok, ton farkı Task 7'de görülecek.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css
git commit -m "feat(theme): warning token'ları, mühür kırmızısı danger, doküman tipi renkleri, lift gölgesi"
```

---

### Task 2: Display font — Playfair → Fraunces (site geneli)

**Files:**
- Modify: `web/src/app/layout.tsx:1-22,46`
- Modify: `web/src/app/globals.css:72` (`--font-display` zinciri)

**Interfaces:**
- Produces: `--font-fraunces` CSS değişkeni; `--font-display` artık Fraunces'a çözülür. `font-display`/`.font-display` kullanan hiçbir bileşen değişmez.

- [ ] **Step 1: `layout.tsx` font import ve tanımını değiştir**

```tsx
import { Fraunces, Inter, JetBrains_Mono } from "next/font/google";
```

`playfair` sabitinin yerine (Türkçe glifler için `latin-ext` ZORUNLU — ğ/ş/ı; `opsz` ekseni: hero'da dramatik, küçük başlıkta okunaklı kesim):

```tsx
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin", "latin-ext"],
  display: "swap",
  axes: ["opsz"],
});
```

`inter` ve `jbMono` tanımlarına da `subsets: ["latin", "latin-ext"]` yaz (mevcutta yalnız `latin` — Türkçe karakterler fallback'ten geliyordu; bu görevde düzelt).

`<html>` className'inde `${playfair.variable}` → `${fraunces.variable}`.

- [ ] **Step 2: `globals.css` display zincirini güncelle**

```css
  --font-display: var(--font-fraunces), Georgia, "Times New Roman", serif;
```

- [ ] **Step 3: Doğrula**

Run: `cd web && npm run typecheck && npm run build`
Expected: hatasız. (`axes` desteği hata verirse `node_modules/next/dist/docs/` altında font dokümanına bak; Fraunces değişken font, `opsz` next/font'ta desteklenir.)
Elle: `npm run dev` → `/` (marka koyu hero) ve `/app` başlıklarında Fraunces görünür; "Aydınlatma", "İşleme" gibi Türkçe başlıklarda ı/İ/ş glifleri serif'le tutarlı (fallback Georgia karışıklığı yok). Uppercase-tracked kullanımlar (nav, eyebrow'lar sans zaten — etkilenmez) kontrol.

- [ ] **Step 4: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat(theme): display font Playfair -> Fraunces (opsz, latin-ext); sans/mono'ya latin-ext"
```

---

### Task 3: KVKK m.6 — sensitive tag varyantı + uyarı kutusu

**Files:**
- Modify: `web/src/lib/catalog.ts` (dosya sonuna ekleme)
- Modify: `web/src/components/ui/tag.tsx` (tam yeniden yazım)
- Create: `web/src/components/app/sensitive-notice.tsx`
- Modify: `web/src/app/globals.css` (fade-in animasyonu)
- Modify: `web/src/components/app/doc-flow.tsx:142-158` (grup render'ı)

**Interfaces:**
- Consumes: Task 1'in `warning` utility'leri.
- Produces: `OZEL_NITELIKLI: Set<string>` (catalog.ts export'u); `Tag` yeni prop `sensitive?: boolean`; `SensitiveNotice` bileşeni (props'suz); `.animate-fade-in` CSS sınıfı. Task 7 (wizard) bu üçünü aynen taşıyacak.

- [ ] **Step 1: `catalog.ts` sonuna m.6 kümesini ekle**

```ts
/**
 * KVKK m.6 — özel nitelikli kişisel veri seçenekleri. Mevcut seçenek metinlerinin
 * alt kümesidir; YENİ kategori eklenmez (envanter-gerçekliği ilkesi).
 * "Özel nitelikli veri" DPIA risk listesinden gelir (schemas.ts).
 */
export const OZEL_NITELIKLI = new Set<string>([
  "Biyometrik veri",
  "Sağlık verisi",
  "Özel nitelikli veri",
]);
```

- [ ] **Step 2: `tag.tsx`'i sensitive varyantı + tık mikro-etkileşimiyle yeniden yaz**

Dosyanın tam yeni içeriği:

```tsx
import { cn } from "@/lib/utils";

/**
 * Seçilebilir pill etiket (on/off). Durum üst bileşende tutulur.
 * sensitive: KVKK m.6 özel nitelikli kategori — altın nokta + seçilince warning stili.
 */
export function Tag({
  label,
  on,
  onToggle,
  sensitive = false,
}: {
  label: string;
  on: boolean;
  onToggle: () => void;
  sensitive?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        "rounded-pill border px-3.5 py-1.5 text-[13px] transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.96]",
        on
          ? sensitive
            ? "border-warning bg-warning-soft font-medium text-warning"
            : "border-accent bg-accent-soft font-medium text-accent-strong"
          : "border-border text-ink-muted hover:border-border-strong hover:text-ink",
      )}
    >
      {sensitive && (
        <span
          aria-hidden
          className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-warning align-middle"
        />
      )}
      {label}
    </button>
  );
}
```

- [ ] **Step 3: `sensitive-notice.tsx`'i oluştur**

```tsx
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
```

- [ ] **Step 4: `globals.css` sonuna fade-in animasyonunu ekle**

```css
/* Küçük giriş animasyonları */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.animate-fade-in {
  animation: fade-in 0.25s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .animate-fade-in {
    animation: none;
  }
}
```

- [ ] **Step 5: `doc-flow.tsx` grup render'ına bağla**

Import'lara ekle: `import { docByType, OZEL_NITELIKLI } from "@/lib/catalog";` (mevcut satırı genişlet) ve `import { SensitiveNotice } from "./sensitive-notice";`

`card.groups?.map((g) => (...))` bloğunu şöyle değiştir:

```tsx
            {card.groups?.map((g) => {
              const hasSensitive = tags[g.key].some((v) => OZEL_NITELIKLI.has(v));
              return (
                <div key={g.key} className="mb-5 last:mb-0">
                  <p className="mb-2.5 text-[13px] font-medium text-ink-muted">{g.label}</p>
                  <div className="flex flex-wrap gap-2">
                    {g.options.map((o) => (
                      <Tag
                        key={o}
                        label={o}
                        on={tags[g.key].includes(o)}
                        onToggle={() => toggleTag(g.key, o)}
                        sensitive={OZEL_NITELIKLI.has(o)}
                      />
                    ))}
                  </div>
                  {hasSensitive && <SensitiveNotice />}
                </div>
              );
            })}
```

- [ ] **Step 6: Doğrula**

Run: `cd web && npm run typecheck && npm run lint`
Expected: hatasız.
Elle: `npm run dev` → `/app/aydinlatma` → "İşleme Faaliyetleri" kartında "Sağlık verisi" ve "Biyometrik veri" pill'lerinde altın nokta görünür; birine tıklayınca pill warning stiline döner ve altında m.6 uyarı kutusu fade-in ile belirir; seçim kaldırılınca kutu kaybolur. `/app/dpia`'da "Özel nitelikli veri" riski de aynı davranır. Tag tıklamasında hafif küçülme (scale) hissedilir.

- [ ] **Step 7: Commit**

```bash
git add src/lib/catalog.ts src/components/ui/tag.tsx src/components/app/sensitive-notice.tsx src/app/globals.css src/components/app/doc-flow.tsx
git commit -m "feat(m6): özel nitelikli veri tag varyantı + KVKK m.6 uyarı kutusu"
```

---

### Task 4: Kart cilası — Card interactive, dashboard hover-lift + mevzuat rozeti, empty state

**Files:**
- Modify: `web/src/components/ui/card.tsx` (interactive prop)
- Modify: `web/src/lib/catalog.ts:3-58` (DocMeta: `eyebrow` → `mevzuat` + `docEyebrow` helper)
- Modify: `web/src/app/app/page.tsx` (dashboard kartları)
- Modify: `web/src/components/app/doc-flow.tsx:137` (eyebrow kullanımı)
- Modify: `web/src/app/app/[doc]/page.tsx:29-35` (empty state)

**Interfaces:**
- Consumes: Task 1'in `--shadow-card-lift` ve `--doc-<type>` token'ları.
- Produces: `Card` yeni prop `interactive?: boolean`; `DocMeta.mevzuat: string` (`eyebrow` alanı KALKAR); `docEyebrow(d: DocMeta): string` helper. Task 7 `docEyebrow(meta)` kullanacak.

- [ ] **Step 1: `card.tsx`'e interactive prop ekle**

`Card` imzasına `interactive = false` (`interactive?: boolean`) ekle; `<section>` className'ini şöyle değiştir:

```tsx
      className={cn(
        "rounded-[calc(var(--radius)+4px)] border border-border bg-surface shadow-[var(--shadow-card)]",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]",
        className,
      )}
```

- [ ] **Step 2: `catalog.ts` DocMeta'yı mevzuat alanına geçir**

`DocMeta` arayüzünde `eyebrow: string;` → `mevzuat: string;`. Her katalog girdisinde `eyebrow` satırını `mevzuat` ile değiştir (yalnız mevzuat kısmı kalır):

```ts
    mevzuat: "KVKK m.10 / GDPR m.13-14",   // aydinlatma
    mevzuat: "GDPR + ePrivacy",             // cerez
    mevzuat: "VERBİS / GDPR m.30",          // kayit
    mevzuat: "KVKK m.12 / GDPR m.28",       // dpa
    mevzuat: "GDPR m.35",                   // dpia
    mevzuat: "KVKK m.12/5 / GDPR m.33-34",  // ihlal
```

`docByType` altına helper ekle:

```ts
/** Doküman sayfası eyebrow'u — "Doküman 01 · KVKK m.10 / GDPR m.13-14" */
export const docEyebrow = (d: DocMeta) => `Doküman ${d.no} · ${d.mevzuat}`;
```

- [ ] **Step 3: `doc-flow.tsx:137`'yi helper'a geçir**

Import satırını genişlet: `import { docByType, docEyebrow, OZEL_NITELIKLI } from "@/lib/catalog";`

```tsx
      <p className="eyebrow mb-2">{docEyebrow(meta)}</p>
```

- [ ] **Step 4: Dashboard kartlarını cilala (`app/page.tsx`)**

`DOC_CATALOG.map` içindeki `<Link>` bloğunun tam yeni hali:

```tsx
          <Link
            key={d.type}
            href={`/app/${d.type}`}
            className="group rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-200 ease-[cubic-bezier(0.4,0,0.2,1)] hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]"
          >
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 font-mono text-xs text-ink-subtle transition-colors group-hover:bg-accent group-hover:text-accent-contrast">
                {d.no}
              </span>
              <h3 className="font-display text-[15px] font-semibold text-ink">{d.title}</h3>
            </div>
            <p className="mt-2.5 text-[13px] leading-relaxed text-ink-muted">{d.desc}</p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-pill border border-border bg-surface-2 px-2.5 py-1 font-mono text-[11px] text-ink-muted">
              <span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: `var(--doc-${d.type})` }}
              />
              {d.mevzuat}
            </span>
          </Link>
```

- [ ] **Step 5: Empty state'i iyileştir (`[doc]/page.tsx`)**

Import ekle: `import { Icon } from "@/components/ui/icon";`
Kesikli kutuyu şöyle değiştir:

```tsx
      <div className="mt-8 rounded-[calc(var(--radius)+4px)] border border-dashed border-border-strong bg-surface-2 px-6 py-12 text-center">
        <Icon name="folders" className="mx-auto text-[28px] text-ink-subtle" />
        <p className="mt-4 font-display text-lg text-ink">Doküman üretmek ister misiniz?</p>
        <p className="mx-auto mt-2 max-w-sm text-[13px] leading-relaxed text-ink-muted">
          Bu araç hazır olana kadar altı doküman akışının tamamını kullanabilirsiniz.
        </p>
        <ButtonLink href="/app/aydinlatma" size="sm" className="mt-5">
          Aydınlatma Metni&apos;ne git <Arrow />
        </ButtonLink>
      </div>
```

- [ ] **Step 6: Doğrula**

Run: `cd web && npm run typecheck && npm run lint && npm run build`
Expected: hatasız — özellikle `eyebrow` alanına başka referans kalmadığını typecheck garanti eder (kalırsa derleme hatası verir; o kullanımı da `docEyebrow`'a çevir).
Elle: `/app` dashboard'unda kartlar hover'da yükselir + gölge büyür; her kartta tip renkli noktalı mono mevzuat rozeti; `/app/envanter` gibi geçersiz segmentte ikonlu yeni empty state.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/card.tsx src/lib/catalog.ts src/app/app/page.tsx src/components/app/doc-flow.tsx "src/app/app/[doc]/page.tsx"
git commit -m "feat(ui): kart hover-lift, dashboard mevzuat rozetleri + tip renkleri, empty state"
```

---

### Task 5: Disclaimer render (document-output)

**Files:**
- Modify: `web/src/components/app/document-output.tsx:63-78`

**Interfaces:**
- Consumes: Task 1 `warning` utility'leri + mühür kırmızısı `danger`. `result.disclaimer` zaten `GenerateResponse`'ta var — API/type değişikliği YOK.

- [ ] **Step 1: doc-prose div'i ile footer arasına disclaimer kutusunu ekle**

```tsx
      {!streaming && result.disclaimer && (
        <div className="mx-5 mb-4 flex items-start gap-2.5 rounded-[var(--radius)] border border-warning/40 border-l-2 border-l-danger bg-warning-soft px-4 py-3 text-[13px] leading-relaxed text-warning">
          <Icon
            name="shield-alert"
            className="mt-0.5 flex-shrink-0 text-[15px] text-danger"
          />
          <span>{result.disclaimer}</span>
        </div>
      )}
```

(Metin API'den gelir — sabit metin gömülmez. Mühür kırmızısı sol çizgi + ikon = "resmi" vurgu; gövde warning-soft.)

- [ ] **Step 2: Doğrula**

Run: `cd web && npm run typecheck && npm run lint`
Expected: hatasız.
Elle: `/app/aydinlatma`'da mock üretim tamamlanınca çıktı altında, footer üstünde mühür-vurgulu uyarı kutusu görünür; streaming sürerken görünmez.

- [ ] **Step 3: Commit**

```bash
git add src/components/app/document-output.tsx
git commit -m "feat(uyum): üretilen doküman altında yasal sorumluluk reddi kutusu"
```

---

### Task 6: Toast sistemi + kopyalama/hazır bildirimleri

**Files:**
- Create: `web/src/components/ui/toast.tsx`
- Modify: `web/src/app/globals.css` (toast animasyonları)
- Modify: `web/src/app/app/layout.tsx` (provider)
- Modify: `web/src/components/app/document-output.tsx:16-40` (copy → toast)
- Modify: `web/src/components/app/doc-flow.tsx` ("Doküman hazır" toast'ı)

**Interfaces:**
- Produces: `ToastProvider` (children sarar), `useToast(): (message: string, variant?: "success" | "warning" | "error") => void`. Task 7 bunları korur.
- Kural: toast = geçici teyit; kalıcı durumlar (hata, kota) inline kutuda KALIR.

- [ ] **Step 1: `toast.tsx`'i oluştur**

```tsx
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Icon, type IconName } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "warning" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
  leaving: boolean;
}

const ToastContext = createContext<(message: string, variant?: ToastVariant) => void>(
  () => {},
);

/** Geçici teyit bildirimi göster. Kalıcı durumlar (hata/kota) inline kutu kullanır. */
export function useToast() {
  return useContext(ToastContext);
}

const VARIANT: Record<ToastVariant, { icon: IconName; accent: string }> = {
  success: { icon: "check-circle", accent: "border-l-[color:var(--ok)] text-[color:var(--ok)]" },
  warning: { icon: "warning", accent: "border-l-warning text-warning" },
  error: { icon: "shield-alert", accent: "border-l-danger text-danger" },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    // önce çıkış animasyonu, 200ms sonra kaldır
    setToasts((t) => t.map((x) => (x.id === id ? { ...x, leaving: true } : x)));
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 200);
  }, []);

  const show = useCallback(
    (message: string, variant: ToastVariant = "success") => {
      const id = nextId.current++;
      setToasts((t) => [...t, { id, message, variant, leaving: false }]);
      setTimeout(() => dismiss(id), 3000);
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-50 flex flex-col gap-2 pb-safe"
      >
        {toasts.map((t) => {
          const v = VARIANT[t.variant];
          return (
            <div
              key={t.id}
              className={cn(
                "pointer-events-auto flex items-center gap-2.5 rounded-[var(--radius)] border border-border border-l-2 bg-surface px-4 py-3 text-[13px] shadow-[var(--shadow-card-lift)]",
                v.accent,
                t.leaving ? "animate-toast-out" : "animate-toast-in",
              )}
            >
              <Icon name={v.icon} className="flex-shrink-0 text-[15px]" />
              <span className="text-ink">{t.message}</span>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Bildirimi kapat"
                className="ml-2 text-ink-subtle transition-colors hover:text-ink"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 2: `globals.css` sonuna toast animasyonlarını ekle**

```css
@keyframes toast-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
@keyframes toast-out {
  to {
    opacity: 0;
    transform: translateY(8px);
  }
}
.animate-toast-in {
  animation: toast-in 0.2s ease-out;
}
.animate-toast-out {
  animation: toast-out 0.2s ease-in forwards;
}
@media (prefers-reduced-motion: reduce) {
  .animate-toast-in,
  .animate-toast-out {
    animation: none;
  }
}
```

- [ ] **Step 3: Workspace layout'una provider'ı sar (`app/layout.tsx`)**

```tsx
import type { ReactNode } from "react";
import { AppShell } from "@/components/app/app-shell";
import { SessionGate } from "@/components/app/session-gate";
import { ToastProvider } from "@/components/ui/toast";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppShell>
      <SessionGate>
        <ToastProvider>{children}</ToastProvider>
      </SessionGate>
    </AppShell>
  );
}
```

- [ ] **Step 4: `document-output.tsx` kopyalamayı toast'a geçir**

`useState(copied)` state'ini ve `copied` kullanımını KALDIR; yerine:

```tsx
import { useToast } from "@/components/ui/toast";
```

```tsx
  const toast = useToast();

  function copy() {
    navigator.clipboard.writeText(result.text).then(() => toast("Panoya kopyalandı"));
  }
```

Kopyala butonu sadeleşir:

```tsx
        <Button variant="secondary" size="sm" onClick={copy} disabled={streaming}>
          <Icon name="copy" className="text-[15px]" />
          Kopyala
        </Button>
```

(`useState` import'u artık kullanılmıyorsa satırı kaldır — lint yakalar.)

- [ ] **Step 5: `doc-flow.tsx` onDone'da hazır toast'ı**

Import: `import { useToast } from "@/components/ui/toast";` — bileşen başında `const toast = useToast();` — `onDone` callback'inin sonuna `toast("Doküman hazır");`

- [ ] **Step 6: Doğrula**

Run: `cd web && npm run typecheck && npm run lint && npm run build`
Expected: hatasız.
Elle: mock üretim bitince sağ-altta "Doküman hazır" toast'ı belirir, 3sn sonra kayarak kaybolur; Kopyala → "Panoya kopyalandı" toast'ı; × ile elle kapanır; üst üste tetiklenince yığılır.

- [ ] **Step 7: Commit**

```bash
git add src/components/ui/toast.tsx src/app/globals.css src/app/app/layout.tsx src/components/app/document-output.tsx src/components/app/doc-flow.tsx
git commit -m "feat(ui): bağımlılıksız toast sistemi; kopyalama ve doküman-hazır bildirimleri"
```

---

### Task 7: Wizard — adım barı, adım doğrulama, üret adımı (skeleton + spinner + ikonlu kutular)

**Files:**
- Modify: `web/src/components/ui/icon.tsx` (spinner glifi)
- Create: `web/src/components/app/step-bar.tsx`
- Modify: `web/src/app/globals.css` (adım geçiş animasyonu)
- Modify: `web/src/components/app/doc-flow.tsx` (tam yeniden yazım)

**Interfaces:**
- Consumes: Task 3 (`OZEL_NITELIKLI`, `SensitiveNotice`, `Tag.sensitive`), Task 4 (`docEyebrow`), Task 6 (`useToast`), Task 1 token'ları.
- Produces: `IconName`'e `"spinner"`; `StepBar` bileşeni (props: `steps: { title: string }[]`, `current: number`, `maxReached: number`, `docColor: string`, `onSelect: (i: number) => void`); `.animate-step-in` sınıfı.
- DEĞİŞMEZ: `schemas.ts` yapısı, `generateDocStream` çağrı kontratı, `DocumentOutput` arayüzü.

- [ ] **Step 1: `icon.tsx`'e spinner glifini ekle**

`IconName` union'ında `| "check-circle"` satırından sonra `| "spinner"` ekle. `PATHS`'e (`"check-circle"` girdisinden sonra):

```tsx
  spinner: <path d="M21 12a9 9 0 1 1-6.22-8.56" />,
```

- [ ] **Step 2: `step-bar.tsx`'i oluştur**

```tsx
"use client";

import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Wizard adım barı. Tamamlanan adım altın dolgu + check + yumuşak parıltı;
 * aktif adım soft vurgu; ulaşılmamış adımlar pasif. Tamamlanmışlara geri tıklanır.
 * docColor: doküman tipi kimlik rengi (CSS değeri, ör. "var(--doc-aydinlatma)").
 */
export function StepBar({
  steps,
  current,
  maxReached,
  docColor,
  onSelect,
}: {
  steps: { title: string }[];
  current: number;
  maxReached: number;
  docColor: string;
  onSelect: (i: number) => void;
}) {
  return (
    <ol className="flex items-center gap-2 overflow-x-auto pb-1" aria-label="Adımlar">
      <span
        aria-hidden
        className="h-2 w-2 flex-shrink-0 rounded-full"
        style={{ backgroundColor: docColor }}
      />
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const reachable = i <= maxReached;
        return (
          <li key={s.title} className="flex min-w-0 items-center gap-2">
            {i > 0 && <span aria-hidden className="hairline-dotted w-5 flex-shrink-0 sm:w-9" />}
            <button
              type="button"
              disabled={!reachable || active}
              onClick={() => onSelect(i)}
              aria-current={active ? "step" : undefined}
              className={cn(
                "flex items-center gap-2 rounded-pill border px-3 py-1.5 text-[13px] transition-[color,background-color,border-color,box-shadow] duration-300 focus-visible:ring-2 focus-visible:ring-accent/40 focus-visible:outline-none",
                done && "border-accent bg-accent text-accent-contrast shadow-[0_0_0_3px_var(--accent-soft)]",
                active && "border-accent bg-accent-soft font-medium text-accent-strong",
                !done &&
                  !active &&
                  (reachable
                    ? "border-border text-ink-muted hover:border-border-strong hover:text-ink"
                    : "border-border text-ink-subtle opacity-60"),
              )}
            >
              <span
                className={cn(
                  "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full font-mono text-[11px]",
                  done
                    ? "bg-accent-contrast/20"
                    : active
                      ? "bg-accent text-accent-contrast"
                      : "bg-surface-2 text-ink-subtle",
                )}
              >
                {done ? <Icon name="check" className="text-[11px]" /> : i + 1}
              </span>
              <span className={cn("truncate", !active && "hidden sm:inline")}>{s.title}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
```

- [ ] **Step 3: `globals.css` sonuna adım geçiş animasyonunu ekle**

```css
@keyframes step-in {
  from {
    opacity: 0;
    transform: translateX(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
.animate-step-in {
  animation: step-in 0.25s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .animate-step-in {
    animation: none;
  }
}
```

- [ ] **Step 4: `doc-flow.tsx`'i wizard olarak yeniden yaz**

Dosyanın tam yeni içeriği (Task 3/4/6 entegrasyonları dahil — state yönetimi, `onGenerate`, `renderField` mevcut halinden aynen taşınır):

```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useToast } from "@/components/ui/toast";
import { StepBar } from "./step-bar";
import { SensitiveNotice } from "./sensitive-notice";
import { DocumentOutput } from "./document-output";
import { docByType, docEyebrow, OZEL_NITELIKLI } from "@/lib/catalog";
import { SCHEMAS, type CardDef, type FieldDef } from "@/lib/schemas";
import { generateDocStream } from "@/lib/api";
import type { DocType, GenerateResponse, GroundingRecord } from "@/lib/types";

function initialFields(type: DocType): Record<string, string> {
  const f: Record<string, string> = {};
  for (const card of SCHEMAS[type].cards) {
    for (const fd of card.fields ?? []) {
      if (fd.type === "select" && fd.options?.length) f[fd.key] = fd.options[0];
    }
  }
  return f;
}

/** Üretim beklerken iskelet çıktı kartı — ilk stream delta'sı gelince yerini gerçek içerik alır. */
function GenerationSkeleton() {
  return (
    <div className="rounded-[calc(var(--radius)+4px)] border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2 text-[13px] font-medium text-ink-muted">
        <Icon name="spinner" className="animate-spin text-[15px]" /> Claude dokümanı envanter
        kayıtlarına göre hazırlıyor…
      </div>
      <div aria-hidden className="mt-5 space-y-3">
        <div className="h-4 w-2/5 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-full animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-11/12 animate-pulse rounded bg-surface-2" />
        <div className="h-3 w-4/5 animate-pulse rounded bg-surface-2" />
      </div>
    </div>
  );
}

export function DocFlow({ type }: { type: DocType }) {
  const meta = docByType(type);
  const schema = SCHEMAS[type];
  const toast = useToast();

  // Adımlar: her şema kartı bir adım + son adım "Üret & Önizleme".
  const steps = [...schema.cards.map((c) => ({ title: c.title })), { title: "Üret & Önizleme" }];
  const generateStep = schema.cards.length;

  const [step, setStep] = useState(0);
  const [maxReached, setMaxReached] = useState(0);
  const [fields, setFields] = useState<Record<string, string>>(() => initialFields(type));
  const [tags, setTags] = useState<{ veriler: string[]; amaclar: string[] }>({
    veriler: [],
    amaclar: [],
  });
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quotaBlock, setQuotaBlock] = useState<{ used: number; quota: number } | null>(null);

  const setField = (k: string, v: string) => setFields((f) => ({ ...f, [k]: v }));
  const toggleTag = (group: "veriler" | "amaclar", v: string) =>
    setTags((t) => ({
      ...t,
      [group]: t[group].includes(v) ? t[group].filter((x) => x !== v) : [...t[group], v],
    }));

  /** Adım (şema kartı) zorunlu alanları dolu mu? Üret adımı her zaman geçerli. */
  function stepValid(i: number): boolean {
    const card = schema.cards[i];
    if (!card) return true;
    return (card.fields ?? []).every((fd) => !fd.required || (fields[fd.key] || "").trim() !== "");
  }

  function goTo(i: number) {
    setStep(i);
    setMaxReached((m) => Math.max(m, i));
  }

  const anySensitive = [...tags.veriler, ...tags.amaclar].some((v) => OZEL_NITELIKLI.has(v));

  async function onGenerate() {
    setLoading(true);
    setStreaming(true);
    setResult(null);
    setError(null);
    setQuotaBlock(null);

    let acc = "";
    let grounding: GroundingRecord[] = [];
    let lastFlush = 0;
    const flush = (force = false) => {
      const now = Date.now();
      if (!force && now - lastFlush < 90) return; // ~11 fps; markdown re-parse'ı sınırla
      lastFlush = now;
      setResult({ text: acc, grounding, model: "", disclaimer: "" });
    };

    try {
      await generateDocStream(
        { type, fields, veriler: tags.veriler, amaclar: tags.amaclar },
        {
          onGrounding: (g) => {
            grounding = g;
            flush(true);
          },
          onDelta: (t) => {
            acc += t;
            flush();
          },
          onDone: (meta) => {
            setResult({
              text: acc,
              grounding,
              model: meta.model,
              disclaimer: meta.disclaimer,
              usage: meta.usage,
            });
            toast("Doküman hazır");
          },
          onQuotaExceeded: (info) => setQuotaBlock(info),
          onError: (msg) => setError(msg),
        },
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Beklenmeyen bir hata oluştu.");
    } finally {
      setStreaming(false);
      setLoading(false);
    }
  }

  function onClear() {
    setFields(initialFields(type));
    setTags({ veriler: [], amaclar: [] });
    setResult(null);
    setError(null);
    setQuotaBlock(null);
    setStep(0);
    setMaxReached(0);
  }

  function renderField(fd: FieldDef) {
    if (fd.type === "textarea")
      return (
        <Textarea
          value={fields[fd.key] || ""}
          onChange={(e) => setField(fd.key, e.target.value)}
          placeholder={fd.placeholder}
        />
      );
    if (fd.type === "select")
      return (
        <Select value={fields[fd.key] || ""} onChange={(e) => setField(fd.key, e.target.value)}>
          {fd.options?.map((o) => (
            <option key={o}>{o}</option>
          ))}
        </Select>
      );
    return (
      <Input
        type={fd.type === "date" ? "date" : "text"}
        value={fields[fd.key] || ""}
        onChange={(e) => setField(fd.key, e.target.value)}
        placeholder={fd.placeholder}
      />
    );
  }

  function renderCard(card: CardDef) {
    return (
      <Card title={card.title} icon={<Icon name={card.icon} className="text-[18px]" />}>
        {card.groups?.map((g) => {
          const hasSensitive = tags[g.key].some((v) => OZEL_NITELIKLI.has(v));
          return (
            <div key={g.key} className="mb-5 last:mb-0">
              <p className="mb-2.5 text-[13px] font-medium text-ink-muted">{g.label}</p>
              <div className="flex flex-wrap gap-2">
                {g.options.map((o) => (
                  <Tag
                    key={o}
                    label={o}
                    on={tags[g.key].includes(o)}
                    onToggle={() => toggleTag(g.key, o)}
                    sensitive={OZEL_NITELIKLI.has(o)}
                  />
                ))}
              </div>
              {hasSensitive && <SensitiveNotice />}
            </div>
          );
        })}

        {card.fields && (
          <div
            className={
              card.groups
                ? "mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                : "grid grid-cols-1 gap-4 sm:grid-cols-2"
            }
          >
            {card.fields.map((fd) => (
              <div key={fd.key} className={fd.full ? "sm:col-span-2" : ""}>
                <Field label={fd.label} required={fd.required}>
                  {renderField(fd)}
                </Field>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  /** Üret adımı: seçimlerin kompakt özeti + CTA + çıktı alanı. */
  function renderGenerateStep() {
    const groups = schema.cards.flatMap((c) => c.groups ?? []);
    return (
      <div className="space-y-5">
        <Card title="Özet" icon={<Icon name="clipboard" className="text-[18px]" />}>
          {groups.map((g) => (
            <div key={g.key} className="mb-4 last:mb-0">
              <p className="mb-2 text-[13px] font-medium text-ink-muted">{g.label}</p>
              {tags[g.key].length ? (
                <div className="flex flex-wrap gap-1.5">
                  {tags[g.key].map((v) => (
                    <span
                      key={v}
                      className={
                        OZEL_NITELIKLI.has(v)
                          ? "rounded-pill border border-warning/60 bg-warning-soft px-2.5 py-1 text-[12px] text-warning"
                          : "rounded-pill border border-border-strong bg-surface-2 px-2.5 py-1 text-[12px] text-ink-muted"
                      }
                    >
                      {v}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-[13px] text-ink-subtle">Seçim yapılmadı.</p>
              )}
            </div>
          ))}
          {anySensitive && <SensitiveNotice />}
        </Card>

        <div className="flex items-center gap-3">
          <Button onClick={onGenerate} disabled={loading}>
            {loading ? (
              <>
                <Icon name="spinner" className="animate-spin text-[15px]" /> Hazırlanıyor…
              </>
            ) : (
              schema.cta
            )}
          </Button>
          <Button variant="secondary" onClick={onClear} disabled={loading}>
            Temizle
          </Button>
        </div>

        {loading && !result && <GenerationSkeleton />}

        {quotaBlock && (
          <div className="flex items-start gap-2.5 rounded-[calc(var(--radius)+4px)] border border-warning/40 border-l-2 border-l-warning bg-warning-soft px-5 py-4 text-sm">
            <Icon name="shield-alert" className="mt-0.5 flex-shrink-0 text-[16px] text-warning" />
            <div>
              <strong className="font-medium text-ink">
                Bu ayki ücretsiz doküman hakkınızı kullandınız ({quotaBlock.used}/{quotaBlock.quota}).
              </strong>
              <Link
                href="/app/faturalama"
                className="mt-3 inline-block rounded-[var(--radius)] bg-accent px-4 py-2 text-[13px] text-accent-contrast hover:bg-accent-strong"
              >
                Planı yükselt →
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 rounded-[calc(var(--radius)+4px)] border border-danger/40 border-l-2 border-l-danger bg-danger-soft px-5 py-4 text-sm text-danger">
            <Icon name="warning" className="mt-0.5 flex-shrink-0 text-[16px]" />
            <span>
              <strong className="font-medium">Üretim başarısız.</strong> {error}
            </span>
          </div>
        )}

        {result && <DocumentOutput result={result} streaming={streaming} />}
      </div>
    );
  }

  return (
    <div>
      <p className="eyebrow mb-2">{docEyebrow(meta)}</p>
      <h1 className="font-display text-3xl text-ink">{meta.title}</h1>
      <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-ink-muted">{meta.desc}</p>

      <div className="mt-8">
        <StepBar
          steps={steps}
          current={step}
          maxReached={maxReached}
          docColor={`var(--doc-${type})`}
          onSelect={goTo}
        />
      </div>

      <div key={step} className="animate-step-in mt-6">
        {step < generateStep ? renderCard(schema.cards[step]) : renderGenerateStep()}
      </div>

      {step < generateStep && (
        <div className="mt-5 flex items-center gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => goTo(step - 1)}>
              Geri
            </Button>
          )}
          <Button onClick={() => goTo(step + 1)} disabled={!stepValid(step)}>
            İleri →
          </Button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Doğrula**

Run: `cd web && npm run typecheck && npm run lint && npm run build`
Expected: hatasız.
Elle (`npm run dev`, mock):
1. `/app/aydinlatma`: step bar "① Şirket Bilgileri — ② İşleme Faaliyetleri — ③ Üret & Önizleme" + tip renk noktası; zorunlu alanlar (Şirket, e-posta, Sektör) boşken İleri pasif; doldurunca aktif.
2. Adım 2'de Sağlık verisi seç → m.6 kutusu; İleri → Üret adımında özet + m.6 tekrar + sensitive pill warning stilinde.
3. Oluştur → buton spinner'ı + skeleton → ilk delta'da skeleton yerini streaming çıktıya bırakır → bitince "Doküman hazır" toast + disclaimer kutusu.
4. Step bar'dan 1. adıma geri dön → değerler korunur; tamamlanan adımlar altın+check+parıltı.
5. Temizle → adım 1'e döner, her şey sıfır.
6. 6 tipin hepsinde step bar doğru adım sayısı üretir (hepsi 2 kart + üret = 3 adım).
7. Mobil genişlikte (devtools) step bar kompakt (pasif adımların adı gizli), taşma yok.

- [ ] **Step 6: Commit**

```bash
git add src/components/ui/icon.tsx src/components/app/step-bar.tsx src/app/globals.css src/components/app/doc-flow.tsx
git commit -m "feat(wizard): adım barlı doküman akışı; skeleton, spinner, ikonlu durum kutuları"
```

---

### Task 8: Kapanış — tam doğrulama + yaşayan doküman güncellemeleri

**Files:**
- Modify: `../CHANGELOG.md` (proje kökü — web repo'su DIŞINDA, git'e girmez)
- Memory: `design-system` hafıza dosyası güncellenir (uygulayan oturumun hafıza dizininde)

- [ ] **Step 1: Tam doğrulama**

Run: `cd web && npm run typecheck && npm run lint && npm run build`
Expected: üçü de temiz.

- [ ] **Step 2: Elle uçtan uca kontrol listesi (mock, `npm run dev`)**

Task 7 Step 5'in 7 maddesi + şunlar:
- `/` marka sayfası: Fraunces hero + espresso tema bozulmamış; login split-screen sağlam.
- `/app` dashboard: hover-lift + rozetler + 6 tip rengi ayırt edilir.
- `prefers-reduced-motion` emülasyonunda (devtools → Rendering) animasyonlar kapalı, akış çalışır.
- Klavye: step bar butonları Tab ile gezilir, focus halkası görünür; toast × butonu erişilir.

- [ ] **Step 3: Kök `CHANGELOG.md`'ye girdi ekle**

Mevcut biçime uyarak 2026-07-02 girdisi: workspace UI tam revizyonu — m.6 uyarı sistemi, disclaimer, wizard, toast, palet R1-R3 (mühür kırmızısı, doküman tipi renkleri, Fraunces), cila kalemleri.

- [ ] **Step 4: Hafıza `design-system` dosyasını güncelle**

Değişen gerçekler: Display font Playfair → **Fraunces** (opsz, latin-ext); danger = mühür kırmızısı `#7f1f2b` (törensel rol); `--warning/-soft` amber token'ları; `--doc-<tip>` kimlik renkleri; workspace'te wizard + toast var. MEMORY.md hook satırı da güncellenir.

- [ ] **Step 5: Kullanıcıya push onayı sor**

Commit'ler lokalde. Kullanıcıya push isteyip istemediğini AÇIKÇA sor ve CEVABI BEKLE (global kural: dış-etkili adım onaysız yürütülmez).
