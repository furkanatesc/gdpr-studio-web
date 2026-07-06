# Tasarım Dili Sözleşmesi — Marketing ↔ Workspace Uyumu

**Tarih:** 2026-07-04 · **Durum:** Faz A UYGULANDI (2026-07-06; build+lint yeşil).
Kalan Faz A borçları: §7.4 iç sayfa migrasyonu (`[doc]` ve `faturalama` sayfaları henüz
PageHeader gramerine + StatusBadge sözlüğüne geçmedi; StatusBadge bileşeni hazır, bekliyor),
tarayıcıda görsel doğrulama turu.
**Tetikleyici:** Kullanıcı geri bildirimi — "login sonrası ekran web sitesiyle uyumlu değil;
hover lift yok, underline yok, tam bir AI işi." + Figma Make referansı ("KVKK PRO" kontrol paneli).
**Karar (kullanıcı onaylı):** Figma referansının **yapısı ve mikro-dili** alınır, **kimlik bizden**
kalır (saman/altın palet + Fraunces). İki faz: **Faz A** = dil sözleşmesi + mevcut ekranların
dönüşümü; **Faz B** = kontrol listesi + uyum skoru (yeni özellik, ROADMAP'e işlendi).

Figma kaynak: yerel MCP (127.0.0.1:3845), dosya `dWd4B3oYhzWKjug3KPvbwv` (Figma Make, App.tsx).

---

## 0. Kimlik sabitleri

> **PALET REVİZYONU (2026-07-06, kullanıcı kararı; aynı gün DÜZELTİLDİ):** Saman/espresso TERK.
> Referans: https://www.omarochoalaw.com — **beyaz-öncelikli** lacivert+terracotta.
> İlk deneme her yeri laciverte boyamıştı → kullanıcı reddetti ("laciverte boğmuşsun").
> DOĞRU OKUMA: beyaz zemin baskındır, elemanlar arası bölgelere beyaz yayılır (boğma yok);
> lacivert = mürekkep + SEÇİLİ koyu bantlar; terracotta = vurgu + doku paneli çeşnisi.
> Figma: `ef7pNqSeEf2NGnHG9OLeD3`, "Landing — BEYAZ + Lacivert + Terracotta v3" (node 29:2).

- **Kullanım oranı (kritik):** sayfa gövdesi BEYAZ `#FFFFFF`; kartlar açık gri `#F4F6F8`
  (hairline lacivert %8); koyu lacivert `#0C192C` yalnız seçili bantlarda (hero, masaüstü
  bandı, footer); araya hep beyaz nefes girer.
- **Metin tokenları (açık zeminde):** ink `#123055`, muted `#5A6B82`, subtle `#8795A8`,
  accent `#BE5827` (hover/koyu `#A34A1F` türetilebilir).
- **Koyu bant tokenları:** zemin degrade `#1B2438→#33415F` (kayrak, fotoğraf dokulu — zifiri
  DEĞİL), ink `#F5F5F5`, muted `#9FB0C7`, accent koyu zeminde aydınlatılır `#C96A35`/`#D97B45`.
- **Hero anatomisi (referans birebir):** karanlık degrade + **fotoğraf katmanı** (Lady Justice
  silüeti; Old Bailey CC BY 2.0, desatüre + karartılmış filtreler) + %82-95 lacivert örtü +
  sağda yay-dokulu **terracotta panel** `#AE5229` + sınırı taşan içerik objesi (belge kartı).
- **İllüstrasyon kuralı:** elle çizilmiş vektör maskot/obje YOK (kullanıcı reddetti —
  "rezalet terazi çizimi"). Atmosfer = gerçek fotoğraf + overlay; ikonlar hariç.
- **SADELİK DİSİPLİNİ (2026-07-06 kullanıcı geri bildirimi — "çok fazla renk çeşidi ve çok
  fazla yazı tipi kullanınca orijinallik elde etmiş olmuyorsun"):**
  - **TEK accent:** `#be5827` her katmanda AYNI (hover `#98431a`). Koyu zeminde "aydınlatılmış"
    ton türetmesi YASAK (sarımsı kayıyor). Doküman-tipi renk paleti (6 ayrı renk) KALDIRILDI —
    tüm tip noktaları accent.
  - **İKİ yazı ailesi — YALNIZ referansın fontları (2026-07-06 son revizyon):**
    **Frank Ruhl Libre** (başlık serif'i) + **DM Sans** (geri kalan her şey).
    Fraunces/Inter/JetBrains Mono KALDIRILDI; kod blokları sistem monospace (webfont yok).
  - **ÜÇ RENK:** lacivert + turuncu (#be5827) + beyaz/gri. Şeftali/soft tint dolgular YASAK
    (accent-soft görünür UI'dan söküldü); düz bilgi metni karta/pill'e SARILMAZ.
    Lacivertin **iki tonu** bağlama göre: #0C192C = kabuk koyusu (hero örtü tabanı, sidebar),
    #123055 = birincil bant/yüzey (footer, masaüstü bandı, açık zeminde mürekkep).
    (+ törensel mühür kırmızısı ve seyrek ok/danger durum renkleri.)
  - **RADIUS TAMAMEN YASAK (2026-07-06):** pill/rozet/avatar dahil her şey dik köşe
    (--radius:0, --radius-pill:0; rounded-full sınıfları söküldü; mühür dikdörtgen damga).
  - **Sahte dekoratif numaralandırma YASAK:** hayalet rakamlar, "BÖLÜM 01 / İLKE № x / PLAN 01"
    önekleri kullanılmaz; numara yalnız gerçekten sıralı içerikte.
- **Mühür kırmızısı** `#7F1F2B` törensel rolde kalır (taslak damgası, ihlal, disclaimer).
  ⚠ Açık soru: terracotta accent ile yakınlığı ekranda test edilecek; gerekirse danger koyulaştırılır.
- Cümle içi yazım tipi karışımı YASAK (kullanıcı geri bildirimi 2026-07-06): başlıkta tek stil;
  vurgu yalnız tam satır/blok renk değişimiyle.
- **Köşe kuralı (2026-07-06 revizyonu, kullanıcı talebi):** kartlar/paneller/inputlar **KESKİN
  köşeli** (radius 0). Yuvarlaklık yalnız pill buton, rozet, çip ve avatar gibi hap/tam-yuvarlak
  öğelerde kalır. Eski `--radius: 0.625rem` kart kuralı GEÇERSİZ.
- Dil: yalnız Türkçe (Figma'daki EN alt-etiketler alınmaz).

## 1. Figma'dan alınan mikro-dil (çeviri kuralları)

| Figma deseni | Bizim çevirimiz |
|---|---|
| Barlow Condensed UPPERCASE başlık | **Fraunces** başlık, normal case (uppercase display YOK) |
| Sarı `#f5c518` primary | `--accent` altın (`#b5912f` / koyu katman `#d9b85c`) |
| Trafik ışığı yeşil/sarı/kırmızı | `--ok` / `--warning` / `--danger` (mevcut semantik token'lar) |
| Mavi "Taslak" rozeti | Nötr: `surface-2` zemin + `ink-muted` (yeni renk EKLENMEZ) |
| 2px köşeler, keskin kutular | `--radius` yumuşak köşeler, hairline border |
| Koyu zemin kart hover `bg-white/[0.02]` | `hover:bg-surface-2/60` satır tint'i |

## 2. Workspace kabuğu (Faz A)

### 2.1 Sayfa başlığı grameri (her workspace sayfası — `PageHeader` bileşeni)
```
[eyebrow — JetBrains Mono, uppercase, tracked]  KONTROL PANELİ / 04 TEMMUZ 2026
[h1 — Fraunces, text-3xl/4xl]                   Sayfa başlığı
[opsiyonel sağ slot]                            bağlamsal uyarı çipi / eylem
─────────────────────────────────────────────── border-b hairline, pb-6
```
- `.eyebrow` GLOBAL olarak mono'ya geçer (`font-family: var(--font-mono)`) — marketing +
  workspace aynı jesti paylaşır (katmanlar arası köprü #1).
- Eyebrow'da `/` ile bağlam eklenir: bölüm adı / tarih ya da bölüm / alt-bölüm.

### 2.2 Üst bar (masaüstünde YENİ)
Şu an masaüstünde üst bar yok (yalnız mobil). Eklenir: sol = mono breadcrumb
(`KVKK Yönetim ▸ Başlangıç`), sağ = kullanıcı kimliği (avatar harfi altın kare değil —
`rounded-full bg-accent-soft text-accent-strong` + e-posta) + çıkış. Sticky, `bg-surface/95 backdrop-blur`.

### 2.3 Sidebar revizyonu (2026-07-06 revizyonu — kullanıcı geri bildirimi)
- **Koyu lacivert bant** (`theme-band`): sidebar açık değil, lacivert zemin + açık metin —
  içerik alanı (açık gri) ile kontrast kabuk.
- **Numaralandırma YOK**: nav öğelerinde numara/rozet/ikon dairesi kullanılmaz — yalın metin.
  (Kullanıcı: "numaralandırma anlamsız".)
- **Seçili durum SADE**: yalnız soft zemin (`bg-white/[0.07]`) + beyaz metin + medium ağırlık.
  Sol kenar rayı, renkli daire vb. süsler KULLANILMAZ. (Kullanıcı: eski isSelected efekti
  "çok AI kokuyor".)
- **Kullanım göstergesi bloğu**: nav altında hairline'la ayrılmış blok — `BU AY ÜRETİM` mono
  etiketi + `X/Y belge` + ince ilerleme çubuğu (terracotta). Veri: `getBillingStatus()`;
  API yoksa (mock mod) blok gizlenir.
- Alt bilgi: kurum adı (`getMe()` bootstrap verisi) + plan rozeti; mock modda
  `Web sürümü · Managed mod` yazısına düşer.
- `/app/kontrol` nav öğesi Faz B'ye kadar tıklanamaz + "Yakında" rozetli (sessiz 404 yok).

### 2.4 Workspace sayfa haritası (2026-07-04 eki — kullanıcı talebi: "Figma'daki gibi farklı sayfalar")

Uygulama bugüne dek sihirbaz etrafında organik büyüdü; kabuk hiç tam sayfa setiyle tasarlanmadı.
Hedef harita ve fazlanması:

| Sayfa | Rota | Faz | Not |
|---|---|---|---|
| Başlangıç (dashboard) | `/app` | **A** | §4'teki yeniden düzen |
| Doküman üretimi (6 tip) | `/app/[doc]` | **A** | mevcut; başlık gramerine geçer |
| Envanter Yönetimi | `/app/envanter` | **A (iskelet)** | nav'da link var, sayfa YOK (404) — Faz A'da "yakında" durumu ya da temel liste; tam CRUD ROADMAP'te ayrı kalem |
| Ayarlar (kurum profili + hesap) | `/app/ayarlar` | **A (iskelet)** | kurum adı/adres/e-posta (bootstrap verisi) + hesap bilgisi + çıkış; tam kurum profili sihirbazı ROADMAP'te ayrı kalem |
| Plan & Faturalama | `/app/faturalama` | **A** | mevcut; durum sözlüğüne migre |
| Uyum Kontrol Listesi | `/app/kontrol` | **B** | skorla birlikte |
| Belgeler (üretim arşivi) | `/app/belgeler` | **B+** | backend belge saklama/audit'e bağımlı |

Faz A "iskelet" = sayfa var, başlık grameri + boş-durum tasarımı doğru, veri mevcut API'den;
sessiz 404 kalmaz.

## 3. Durum grameri (tek sistem, her yerde)

`StatusBadge` bileşeni — üç görünüm, tek renk sözlüğü:
- **Rozet** (belge/kayıt durumu): soft zemin + nokta + etiket. `Tamamlandı`=ok,
  `Bekliyor/Devam Ediyor`=warning, `Gecikmiş/İhlal`=danger, `Taslak`=nötr.
- **Nokta+etiket** (satır içi, mono 11-12px): liste satırlarında.
- **Dev rakam** (stat kartı): Fraunces, durum renginde.
Mevcut dağınık rozetler (faturalama, doc-flow, toast renkleri) bu sözlüğe migre edilir.

## 4. Dashboard yeniden düzeni (Faz A — mevcut veriyle)

Figma yapısının mevcut veriye oturan hali:
1. `PageHeader`: `BAŞLANGIÇ / {tarih}` + Fraunces başlık (mevcut metin kalır).
2. **Stat şeridi** (3 kart): `Bu ay üretilen` (entitlement kullanımı), `Plan` (Başlangıç/Pro +
   limit), `Envanter durumu` (kategori sayısı / "bağlı değil"). Dev Fraunces rakam + mono alt satır.
   API yoksa (mock mod) şerit gizlenir — sahte rakam GÖSTERİLMEZ (uydurmama ilkesi UI'da da geçerli).
3. **Doküman kataloğu** mevcut 2-sütun kart grid'i kalır (hover-lift zaten doğru).
4. **Hızlı işlemler** satırı: Envanter, Faturalama, (Faz B sonrası Kontrol Listesi).

## 5. Marketing/auth düzeltmeleri (denetim bulguları)

1. **Hover-lift standardı:** marketing kartlarına workspace'teki tam paket uygulanır:
   `hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-card-lift)]` +
   `transition-[transform,box-shadow,border-color]`. Kapsam: `(marketing)/page.tsx` (85, 101),
   `ekip/page.tsx` (30), `fiyatlandirma/pricing-tiers.tsx` (88), `indir/page.tsx` (36).
2. **Underline disiplini:** gövde metni içindeki linkler `underline underline-offset-4
   decoration-[1px] decoration-ink-subtle hover:decoration-current`; "Tümünü Gör →" tarzı
   eylem linkleri mono + ok; nav linkleri hover'da underline-offset. Sitede sıfır underline
   durumu kapanır.
3. **Eyebrow mono birleşmesi** (§2.1) marketing'de de geçerli.

## 6. Faz B kapsamı (bu sözleşmenin DIŞI — ROADMAP Faz 2 frontend'e eklendi)

- **Uyum kontrol listesi** (`/app/kontrol`): KVKK madde-referanslı gereksinim listesi,
  tıklanır durum döngüsü, öncelik, filtre çipleri, ilerleme çubuğu. Veri modeli + persistens
  kararı (tenant başına, backend) ayrı tasarlanacak.
- **Uyum skoru**: kontrol listesinden türetilen %, sidebar bloğu + dashboard halkası (SVG).
- **Belgeler arşivi görünümü**: üretilen belgelerin durum rozetli listesi — backend
  belge saklama (object storage / audit log) işine bağımlı.
- Bağımlılık notu: skor ⇐ kontrol listesi; arşiv ⇐ export/storage.

## 7. Uygulama sırası (Faz A)

1. `globals.css`: `.eyebrow` mono, satır-tint token'ı gerekirse.
2. Bileşenler: `PageHeader`, `StatusBadge`, `TopBar`; `Sidebar` revizyonu.
3. Dashboard yeniden düzeni (`app/page.tsx`).
4. İç sayfalar: `[doc]` ve `faturalama` sayfa başlığı gramerine + durum sözlüğüne geçer.
5. Marketing: hover-lift + underline + eyebrow taraması.
6. Doğrulama: her ekranda görsel kontrol (verify), build, mevcut testler.

## 8. Kapsam dışı / ertelenen

- Divit logosu entegrasyonu — ayrı iş (favicon/OG seti); bu sözleşme yalnız stil dilini bağlar.
- Figma'daki bildirim zili, arama kutusu, şablon kütüphanesi — Faz B+ ürün kararları.
- Koyu workspace teması yok; iki katman ilkesi aynen sürer.
