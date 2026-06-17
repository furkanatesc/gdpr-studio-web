# design-sync notları — KVKK Yönetim UI

Bu repo bir Next.js uygulaması (yayınlanmış paket değil). Tasarım sistemi = `src/components/ui/`.

## Kurulum gotcha'ları (re-sync için)

- **Synth-entry via barrel:** Self-repo'da `node_modules/web` yok. Converter `--entry`
  ile çalıştırılmalı: `--entry ./src/components/ui/index.ts` (barrel). Bu sayede PKG_DIR
  repo köküne (`web/`) çözülür. Barrel `src/components/ui/index.ts` committed.
- **componentSrcMap zorunlu:** Bileşenler paket entry'sinden export edilmediği için 7
  bileşenin src yolları config'te `componentSrcMap` ile pinlenir.
- **`@/` alias:** `cfg.tsconfig: "tsconfig.json"` ile esbuild `@/lib/utils` (cn) çözer.
- **Tailwind v4 CSS:** Bileşen CSS'i ayrı üretilir — kaynak `.design-sync/tw-input.css`,
  çıktı `.design-sync/components.css` (`cfg.cssEntry`). Re-sync'te DS değiştiyse yeniden üret:
  `npx @tailwindcss/cli@4 -i .design-sync/tw-input.css -o .design-sync/components.css`
  (`@import "tailwindcss" source(none)` + `@source` ile yalnızca ui + previews taranır).
- **Render-check:** playwright **1.46.0** (chromium revision **1129**) cache ile eşleşiyor;
  `.ds-sync`'e kurulur. Farklı bir chromium cache'i varsa eşleşen playwright sürümünü kur.

## Bilinen render warns
- `[FONT_REMOTE]` — Inter / Playfair Display / JetBrains Mono, `tw-input.css`'teki Google
  Fonts `@import url(...)` ile runtime'da yüklenir (next/font yerine). Beklenen, eylem yok.

## Re-sync riskleri
- **Fontlar remote:** Google Fonts erişilemezse önizlemeler sistem fontuna düşer (kırık değil).
- **Yeni bileşen eklenince:** `componentSrcMap`'e ekle + barrel'a export satırı ekle.
- **components.css commit'li** ama generated — DS stili değişirse yukarıdaki Tailwind CLI ile
  yeniden üretmeyi unutma (yoksa eski utility'ler yüklenir).
