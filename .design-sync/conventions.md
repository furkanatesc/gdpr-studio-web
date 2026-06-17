# KVKK Yönetim UI — kullanım rehberi

Türk hukuk/veri-koruma (KVKK & GDPR) ürünü için sıcak, editöryel bir tasarım sistemi.
Bileşenler `window.KvkkUI.*`'tan gelir ve **önceden stillidir** — sarmalayan bir provider
GEREKMEZ. Tasarım token'ları global `:root`'ta tanımlıdır (açık "workspace" teması:
saman-krem zemin, sıcak siyah metin, saman-altın vurgu).

## Stil dili

Tailwind v4 utility'leri **semantik token'lara** bağlıdır. Kendi düzen kodunuz (kart aralığı,
grid) için bu token'ları kullanın. **Önemli:** Yüklenen `styles.css` yalnızca kütüphane
bileşenlerinin kullandığı utility'leri içerir; yazdığınız özel işaretlemede güvenli olmak için
ya aşağıdaki **garanti utility class'ları** ya da doğrudan **CSS değişkenlerini** (`var(--*)`,
hepsi her zaman tanımlı) kullanın.

**Renk/yüzey token'ları (CSS değişkeni):**

| Amaç | Değişken |
|---|---|
| Zemin / kart / hafif kart | `--bg` · `--surface` · `--surface-2` |
| Metin (birincil/ikincil/üçüncül) | `--ink` · `--ink-muted` · `--ink-subtle` |
| Vurgu (saman-altın) | `--accent` · `--accent-strong` · `--accent-soft` · `--accent-contrast` |
| Kenar çizgisi | `--border` · `--border-strong` |
| Köşe / gölge | `--radius` · `--shadow-card` (pill için `rounded-pill`) |

**Garanti utility class'ları** (`styles.css`'te kesinlikle var):
`bg-bg` · `bg-surface` · `bg-accent` · `bg-accent-soft` · `text-ink` · `text-accent-strong`
· `border-border` · `rounded-pill` · `font-display` (Playfair serif — başlıklar; gövde Inter).

## Gerçeğin yeri

Stillemeden önce `styles.css`'i (token tanımları + bileşen CSS'i) ve her bileşenin
`<Name>.d.ts` (prop sözleşmesi) + `<Name>.prompt.md` dosyalarını oku.

## Bileşenler

- **Button** — `variant`: `primary` | `secondary` | `ghost`; `size`: `md` | `sm`. Pill formlu.
- **Input · Textarea · Select** — standart form kontrolleri (Select kendi chevron'unu çizer).
- **Card** — `title?`, `icon?` props; içerik `children`. Başlıksız da kullanılır.
- **Tag** — seçilebilir pill: `label`, `on` (boolean), `onToggle`.
- **Field** — etiket sarmalayıcı: `label`, `required?`; kontrolü `children` olarak alır.

## Örnek (form satırı)

```tsx
<Card title="Şirket Bilgileri" icon={<span>🏛️</span>}>
  <div style={{ display: "grid", gap: 12 }}>
    <Field label="Veri sorumlusu e-postası" required>
      <Input placeholder="kvkk@sirket.com" />
    </Field>
    <div style={{ display: "flex", gap: 12 }}>
      <Button>Doküman Üret</Button>
      <Button variant="secondary">Temizle</Button>
    </div>
  </div>
</Card>
```
