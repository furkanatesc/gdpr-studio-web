# Workspace UI Tam Revizyonu — Tasarım Spec'i

**Tarih:** 2026-07-02 · **Kapsam:** `web/` (gdpr-studio-web) · **Durum:** Kullanıcı onaylı tasarım

## Amaç

Workspace'i (`/app/*`) hukuki UX kurallarına tam uyumlu hale getirmek ve görsel dili
"product-grade premium" seviyesine cilalamak; paleti ve tipografiyi marka kimliğini
koruyarak daha özgün kılmak. Marka kimliği (iki katmanlı sıcak saman-altın tema)
**değişmez** — rafine edilir.

## Kararlar (kullanıcı onaylı, 2026-07-02)

| Karar | Sonuç |
|---|---|
| Tema yönü | Saman-altın kalır; cila pası yapılır (yeşil/kum palete geçilmez) |
| Kapsam | Workspace odaklı; token + font değişimleri doğal olarak site geneline yansır |
| Derinlik | **Tam paket (madde 1-12)** — wizard ve toast dahil |
| Palet revizyonları | R1 mühür kırmızısı + R2 doküman tipi renkleri + R3 Fraunces |

## 1. Tasarım token'ları (`globals.css`)

### 1a. Warning (amber) token'ı — YENİ
Uyarılar şu an marka altınıyla (`accent`) yapılıyor ve ayrışmıyor.

- `:root` (workspace): `--warning: #7a4f1c` · `--warning-soft: #f5ead8`
- `.theme-brand` (koyu): `--warning: #e0b168` · `--warning-soft: rgba(224,177,104,.12)`
- `@theme inline`'a `--color-warning` / `--color-warning-soft` bağlanır.
- `--info` **eklenmez** (YAGNI — kullanacak yüzey yok).

### 1b. R1 — Mühür kırmızısı (törensel rol)
- `--danger: #8b2a2a` → **`#7f1f2b`** (derin karmen; tuğladan uzaklaşır).
  `--danger-soft` uyumlu şekilde hafif revize edilir. `.theme-brand` danger'ı dokunulmaz.
- Kullanım genişlemesi (yeni token yok, mevcut danger'ın rolü): disclaimer kutusunun
  mühür/ikon vurgusu + `ihlal` doküman tipinin kimlik rengi. "Resmi ağırlık" anlarına
  özgü, seyrek kullanım — her hatada değil.

### 1c. R2 — Doküman tipi renkleri
6 tipe kısık, sıcak-eğimli kimlik tonları. **Sadece rozet/nokta/ince vurgu düzeyinde**
(dashboard rozetleri, step bar noktaları); yüzeyler ve butonlar saman-altın kalır.

| Tip | Ton (öneri — implementasyonda ince ayar serbest) |
|---|---|
| aydinlatma | `#b5912f` saman-altın (amiral gemisi = marka rengi) |
| cerez | `#7a4f1c` amber |
| kayit (ROPA) | `#4a5a3a` kısık çam |
| dpa | `#3d5a55` kısık petrol |
| dpia | `#634a5d` kısık patlıcan |
| ihlal | `#7f1f2b` mühür kırmızısı |

Token adlandırma: `--doc-aydinlatma` vb. `:root`'ta; `@theme`'e bağlanır.
Erişilebilirlik: bu tonlar yalnız dekoratif/ikincil kullanım; metin olarak kullanılırsa
`bg` üzerinde AA kontrastı doğrulanır.

### 1d. R3 — Display font: Playfair → Fraunces
- `layout.tsx`'te `next/font/google` Playfair Display → **Fraunces** (değişken;
  `opsz` ekseni açık). CSS değişken adı `--font-playfair` → `--font-fraunces`
  olarak yeniden adlandırılır; `--font-display` zinciri güncellenir.
- Site geneline yansır (marka + workspace + `.doc-prose` başlıkları).
- Gerekçe: Playfair AI-varsayılan seriflerin başında; Fraunces optik boyutla hem
  hero draması hem küçük başlık okunabilirliği verir, saman sıcaklığıyla uyumlu.
- Görsel kontrol: değişim sonrası hero/başlık boyutlarında tracking/weight ince
  ayarı gerekebilir (özellikle uppercase-tracked kullanım).

## 2. KVKK m.6 — Özel nitelikli veri sistemi

- `catalog.ts`: kategorilere `sensitive: true` bayrağı. Yalnız **mevcut** m.6
  kategorileri işaretlenir (Sağlık, Biyometrik + katalogta varsa diğerleri);
  yeni kategori **uydurulmaz** (bkz. veri-tamlığı ilkesi).
- `Tag` bileşenine `sensitive` varyantı:
  - Seçilmemiş: pill içinde küçük altın (warning) nokta işareti.
  - Seçili: `border-warning bg-warning-soft text-warning`.
  - DPIA şemasındaki "Özel nitelikli veri" risk etiketi de bu varyantı kullanır.
- ≥1 sensitive etiket seçiliyken etiket listesinin altında ikonlu uyarı kutusu
  (fade-in): *"Özel nitelikli kişisel veri seçtiniz. KVKK m.6 uyarınca açık rıza
  veya kanuni istisna şartları geçerlidir; üretilen metinde ayrıca ele alınır."*
- Wizard'ın "Üret" adımındaki özet ekranında da m.6 uyarısı tekrarlanır.

## 3. Disclaimer (yasal sorumluluk reddi)

- `document-output.tsx`: üretim tamamlandığında `result.disclaimer` doluysa çıktının
  altında kalıcı, ikonlu `warning-soft` kutu render edilir (ikon: mevcut `warning`
  glifi; mühür-kırmızısı vurgu ile "resmi" his).
- Metin **API'den gelir** — UI'a sabit metin gömülmez (tek kaynak backend).
- Veri zaten geliyor (`doc-flow.tsx` state'inde); bu salt render eksiği.

## 4. Görsel cila

- **Card**: opt-in `interactive` prop → hover'da `-translate-y-0.5` + gölge
  büyümesi; `transition` cubic-bezier(0.4,0,0.2,1) 200ms. Dashboard doküman
  kartları ve tıklanabilir kartlar kullanır; statik kartlar düz kalır.
- **Tag**: `active:scale-[0.96]` + `transition-transform` tık hissi.
- **Buton loading**: `Icon` setine `spinner` glifi (`animate-spin`); "Hazırlanıyor…"
  yanında döner ikon; `disabled` mevcut davranış korunur.
- **Skeleton**: üretim başlarken statik metin yerine iskelet çıktı kartı
  (3-4 `animate-pulse` çubuk, `.doc-prose` genişliğinde); ilk stream delta'sı
  gelince gerçek içerik devralır.
- **Hata/kota kutuları**: sol kalın vurgu çizgisi (`border-l-2`) + ikon
  (hata: `warning`, kota: `shield`). Kota kutusu `warning` token'ına taşınır
  (şu an accent — ayrışmıyor).
- **Mevzuat rozeti**: dashboard kartlarına katalogtaki `eyebrow` verisi
  (örn. "KVKK m.10 · GDPR m.13") küçük mono pill; R2 tip rengiyle noktalı.
- **Empty state**: "Yakında" kutusuna ikon + kısa yönlendirici açıklama;
  kesikli border korunur.

## 5. Wizard (adım barlı akış — `doc-flow.tsx` yeniden yapılanması)

- Adımlar şemadan türetilir: her `schema.cards` kartı bir adım + son adım
  "Üret & Önizleme". Tipik: **1. Bilgiler → 2. Veri Kategorileri → 3. Üret**.
- **Step bar** üstte: numaralı daireler + adım adları; tamamlanan adım altın dolgu
  + check ikonu + yumuşak parıltı geçişi; aktif adım vurgulu; aralar hairline.
  R2 tip rengi step bar'da ince nokta olarak görünür.
- **Navigasyon**: İleri/Geri pill butonları; adım geçişinde kısa fade+slide
  (saf CSS — workspace'e GSAP yükü eklenmez).
- **Adım doğrulama**: zorunlu alanlar dolmadan İleri pasif; tamamlanmış adımlara
  step bar'dan geri dönülebilir; ileri atlama yok.
- **Üret adımı**: seçimlerin kompakt özeti (kategoriler, varsa m.6 uyarısı) +
  Oluştur; streaming çıktı bu adımda akar. Mevcut hata/kota kutuları burada.
- Mobil: step bar kompakt (numaralar + aktif adım adı), yatay kaydırılabilir.
- **Değişmeyenler**: `schemas.ts` yapısı, API kontratı, form alan bileşenleri.

## 6. Toast/bildirim sistemi

- Bağımlılıksız özel sistem: `ToastProvider` (context) + `useToast()` hook;
  `app/layout.tsx`'te workspace'e sarılır (marketing'e değil).
- Sağ-alt yığın; `surface` + gölge + sol vurgu çizgisi; 3sn auto-dismiss +
  elle kapatma; giriş/çıkış slide+fade; `prefers-reduced-motion` saygısı.
- Varyantlar: `success` (ok), `warning` (amber), `error` (danger).
- **Kullanım ayrımı**: toast = geçici teyitler ("Kopyalandı", "Doküman hazır");
  inline kutular = kalıcı durumlar (üretim hatası, kota) — hata toast'a taşınmaz.

## 7. Kapsam dışı (bilinçli)

- Marketing/login sayfalarının yeniden tasarımı (font/token değişimi doğal yansır,
  ayrıca elden geçirilmez).
- Tema mimarisi (iki katman), zemin/yüzey değerleri, espresso katmanı.
- Yapıştırılan prompttaki yeşil/kum palet ve DM Serif/Instrument Sans — Electron'a ait.
- Backend/API değişikliği; `--info` token'ı; harici UI/toast kütüphanesi.
- Electron prototipi (`gdpr-electron-app/`).

## 8. Doğrulama

- `npm run build` + `npm run lint` + `npm run typecheck` temiz.
- Tarayıcıda mock akışla elle: (1) m.6 etiket seçiminde uyarı tetiklenir,
  (2) disclaimer üretim sonunda görünür, (3) wizard adım doğrulama/geri dönüş
  çalışır, (4) skeleton→streaming içerik geçişi akıcı, (5) toast'lar görünür/kapanır,
  (6) mobil görünümde step bar + off-canvas sidebar bozulmaz,
  (7) Fraunces sonrası hero/başlıklarda görsel kontrol.
- Klavye erişimi: step bar ve tag'lerde focus-visible halkaları; toast'lar
  `aria-live="polite"`.

## 9. Yaşayan doküman etkisi

İmplementasyon kapanışında: `CHANGELOG.md` girdisi + hafızadaki `design-system`
notu güncellenir (Fraunces, mühür kırmızısı, doküman tipi renkleri, warning token).
