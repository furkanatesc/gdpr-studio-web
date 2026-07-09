#!/usr/bin/env node
/**
 * public/og.png üretici — 1200x630 markalı Open Graph görseli.
 *
 * Tasarım disiplini (web/.claude memory: design-system, sabit):
 *   - Üç renk: lacivert bant #123055 (kabuk #0C192C üzerinde), terracotta #BE5827,
 *     krem mürekkep #F5F5F5. Dördüncü renk yok.
 *   - Frank Ruhl Libre (başlık) + DM Sans (gövde). Üçüncü font yok.
 *   - radius: 0 — köşeler keskin, "hairline" çizgiler dışında süs yok, sahte dekoratif
 *     numaralandırma/çember yok.
 *
 * Fontlar next/og (satori) için TTF/OTF/WOFF gerektirir — WOFF2 DEĞİL. Google Fonts'un
 * GitHub deposu Frank Ruhl Libre'yi yalnız değişken (variable) TTF olarak sunuyor; onun
 * yerine fontsource'un STATİK WOFF dosyaları kullanılıyor (jsDelivr CDN, derleme anında
 * indirilir — repo'ya font binary'si commit edilmez, yalnız bu üretici script commit edilir).
 *
 * Çalıştırma: node scripts/generate-og-image.mjs
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "public", "og.png");

const NAVY_BAND = "#123055";
const NAVY_SHELL = "#0C192C";
const TERRACOTTA = "#BE5827";
const INK = "#F5F5F5";

const FONT_URLS = {
  frankRuhlBold:
    "https://cdn.jsdelivr.net/npm/@fontsource/frank-ruhl-libre/files/frank-ruhl-libre-latin-700-normal.woff",
  dmSansRegular:
    "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/files/dm-sans-latin-400-normal.woff",
  dmSansMedium:
    "https://cdn.jsdelivr.net/npm/@fontsource/dm-sans/files/dm-sans-latin-500-normal.woff",
};

/**
 * Plain React-element-shaped object — satori tüketir, gerçek React/JSX derlemesi gerekmez.
 * satori kuralı: bir <div>'in tam olarak 1 metin/eleman çocuğu YOKSA (0 ya da 2+),
 * style.display açıkça "flex" | "contents" | "none" olmalı — yoksa satori hata verir.
 * Bu yüzden display verilmemişse varsayılan olarak "flex" atanır.
 */
function h(type, props = {}, ...children) {
  const flatChildren = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  const style = props.style ? { ...props.style } : undefined;
  if (style && style.display === undefined && flatChildren.length !== 1) {
    style.display = "flex";
  }
  return {
    type,
    props: { ...props, ...(style ? { style } : {}), children: flatChildren.length === 1 ? flatChildren[0] : flatChildren },
  };
}

async function fetchFont(url, label) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} indirilemedi: HTTP ${res.status} — ${url}`);
  const buf = await res.arrayBuffer();
  console.log(`  ✓ ${label} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
  return buf;
}

async function loadFonts() {
  console.log("Fontlar indiriliyor (fontsource, statik WOFF)…");
  const [frankRuhlBold, dmSansRegular, dmSansMedium] = await Promise.all([
    fetchFont(FONT_URLS.frankRuhlBold, "Frank Ruhl Libre 700"),
    fetchFont(FONT_URLS.dmSansRegular, "DM Sans 400"),
    fetchFont(FONT_URLS.dmSansMedium, "DM Sans 500"),
  ]);
  return {
    fonts: [
      { name: "Frank Ruhl Libre", data: frankRuhlBold, weight: 700, style: "normal" },
      { name: "DM Sans", data: dmSansRegular, weight: 400, style: "normal" },
      { name: "DM Sans", data: dmSansMedium, weight: 500, style: "normal" },
    ],
    usedFallback: false,
  };
}

function buildTree() {
  const MARGIN = 14; // kabuk (#0C192C) çerçeve payı
  const TERRACOTTA_W = 300;
  const contentLeft = MARGIN + 46;

  return h(
    "div",
    {
      style: {
        width: "1200px",
        height: "630px",
        display: "flex",
        position: "relative",
        background: NAVY_SHELL,
        fontFamily: "DM Sans",
      },
    },
    // Lacivert bant — kabuk üzerinde, ince çerçeve payı bırakır
    h("div", {
      style: {
        position: "absolute",
        top: `${MARGIN}px`,
        left: `${MARGIN}px`,
        width: `${1200 - MARGIN * 2}px`,
        height: `${630 - MARGIN * 2}px`,
        background: NAVY_BAND,
        display: "flex",
      },
    }),
    // Terracotta panel — sağ kenar, bandla bitişik (hero deseniyle tutarlı)
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: `${MARGIN}px`,
          right: `${MARGIN}px`,
          width: `${TERRACOTTA_W}px`,
          height: `${630 - MARGIN * 2}px`,
          background: TERRACOTTA,
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "28px",
        },
      },
      // İnce dikey hairline dokusu — dikdörtgen/çizgi disiplini, yuvarlak süs yok
      h("div", { style: { width: "100%", height: "1px", background: "rgba(245,245,245,0.28)" } }),
      h("div", {
        style: {
          marginTop: "10px",
          fontFamily: "DM Sans",
          fontWeight: 500,
          fontSize: "15px",
          letterSpacing: "2px",
          textTransform: "uppercase",
          color: "rgba(245,245,245,0.75)",
          display: "flex",
        },
      }, "KVKK & GDPR"),
    ),
    // İçerik sütunu
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: `${MARGIN}px`,
          left: `${contentLeft}px`,
          width: `${1200 - TERRACOTTA_W - MARGIN * 2 - (contentLeft - MARGIN) - 40}px`,
          height: `${630 - MARGIN * 2}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
      },
      h(
        "div",
        {
          style: {
            display: "flex",
            flexWrap: "wrap",
            fontFamily: "Frank Ruhl Libre",
            fontWeight: 700,
            fontSize: "80px",
            lineHeight: 1.08,
            color: INK,
          },
        },
        h("span", { style: { display: "flex", marginRight: "22px" } }, "KVKK"),
        h("span", { style: { display: "flex", color: TERRACOTTA } }, "YÖNETİM"),
      ),
      h("div", {
        style: {
          marginTop: "30px",
          marginBottom: "26px",
          width: "110px",
          height: "3px",
          background: TERRACOTTA,
          display: "flex",
        },
      }),
      h(
        "div",
        {
          style: {
            display: "flex",
            width: "640px",
            fontFamily: "DM Sans",
            fontWeight: 400,
            fontSize: "29px",
            lineHeight: 1.45,
            color: "rgba(245,245,245,0.86)",
          },
        },
        "KVKK & GDPR uyum dokümanları — gerçek veri envanterine dayalı, madde atıflı.",
      ),
    ),
    // Alt-sol: alan adı
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: `${contentLeft}px`,
          bottom: `${MARGIN + 26}px`,
          display: "flex",
          fontFamily: "DM Sans",
          fontWeight: 500,
          fontSize: "17px",
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: "rgba(245,245,245,0.5)",
        },
      },
      "www.kvkkyonetim.com",
    ),
  );
}

async function main() {
  const { fonts } = await loadFonts();
  const tree = buildTree();

  const image = new ImageResponse(tree, {
    width: 1200,
    height: 630,
    fonts,
  });

  const arrayBuffer = await image.arrayBuffer();
  await writeFile(OUT_PATH, Buffer.from(arrayBuffer));
  console.log(`\n✓ Yazıldı: ${path.relative(ROOT, OUT_PATH)} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error("\n✗ OG görseli üretilemedi:", err);
  process.exitCode = 1;
});
