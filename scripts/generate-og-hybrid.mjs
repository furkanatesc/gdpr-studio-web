#!/usr/bin/env node
/**
 * public/og.png HİBRİT üretici — YEREL atmosferik arka plan (kullanıcının Gemini/Nano Banana
 * uygulamasında ürettiği metinsiz görsel) + keskin marka metni (next/og / satori ile bindirilir).
 *
 * Neden: görsel modelleri net metin basamaz → "KVKK YÖNETİM" + tagline satori ile VEKTÖREL
 * bindirilir (net kalır); arka plan premium foto olur. Markanın "gerçek foto + lacivert örtü"
 * dili (ContextPhoto/hero) ile birebir tutarlı.
 *
 * Disiplin: 3 renk (lacivert #123055/#0C192C, terracotta #BE5827, krem #F5F5F5),
 * Frank Ruhl Libre (başlık) + DM Sans (gövde), radius 0.
 *
 * Kullanım: node scripts/generate-og-hybrid.mjs "<arka plan görseli yolu>"
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { ImageResponse } from "next/og.js";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_PATH = path.join(ROOT, "public", "og.png");

const NAVY_BAND = "#123055";
const TERRACOTTA = "#BE5827";
const INK = "#F5F5F5";

// ── sharp: 1200x630 cover kırp + çok hafif ton düzeltme (foto zaten koyu/lacivert) ──
async function toBackground(srcPath) {
  const input = await readFile(srcPath);
  const buf = await sharp(input)
    .resize(1200, 630, { fit: "cover", position: "centre" })
    .modulate({ saturation: 0.9 }) // hafif desatüre; terracotta huzmeyi korur
    .png()
    .toBuffer();
  return `data:image/png;base64,${buf.toString("base64")}`;
}

function h(type, props = {}, ...children) {
  const flat = children.flat().filter((c) => c !== null && c !== undefined && c !== false);
  const style = props.style ? { ...props.style } : undefined;
  if (style && style.display === undefined && flat.length !== 1) style.display = "flex";
  return { type, props: { ...props, ...(style ? { style } : {}), children: flat.length === 1 ? flat[0] : flat } };
}

async function fetchFont(url, label) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${label} indirilemedi: HTTP ${res.status}`);
  return res.arrayBuffer();
}

async function loadFonts() {
  console.log("Fontlar indiriliyor (fontsource, statik WOFF)…");
  const base = "https://cdn.jsdelivr.net/npm/@fontsource";
  const [frank, dm400, dm500] = await Promise.all([
    fetchFont(`${base}/frank-ruhl-libre/files/frank-ruhl-libre-latin-700-normal.woff`, "Frank Ruhl 700"),
    fetchFont(`${base}/dm-sans/files/dm-sans-latin-400-normal.woff`, "DM Sans 400"),
    fetchFont(`${base}/dm-sans/files/dm-sans-latin-500-normal.woff`, "DM Sans 500"),
  ]);
  return [
    { name: "Frank Ruhl Libre", data: frank, weight: 700, style: "normal" },
    { name: "DM Sans", data: dm400, weight: 400, style: "normal" },
    { name: "DM Sans", data: dm500, weight: 500, style: "normal" },
  ];
}

function buildTree(bgDataUri) {
  const PAD = 64;
  return h(
    "div",
    { style: { width: "1200px", height: "630px", display: "flex", position: "relative", background: NAVY_BAND, fontFamily: "DM Sans" } },
    // Atmosferik arka plan — tam kaplama
    h("img", {
      src: bgDataUri,
      width: 1200,
      height: 630,
      style: { position: "absolute", top: 0, left: 0, width: "1200px", height: "630px", objectFit: "cover" },
    }),
    // Lacivert scrim — soldan koyu → sağa şeffaf (heykel/huzme görünür kalır, sol metin okunur)
    h("div", {
      style: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "1200px",
        height: "630px",
        display: "flex",
        // Yumuşak ve UZUN geçiş: fotonun kendi siyah-sol/aydınlık-sağ dikişini örtmek için
        // koyuluk ~%52'ye kadar yüksek tutulur, sonra kademeli sıfırlanır (dikey kenar görünmez).
        backgroundImage:
          "linear-gradient(100deg, rgba(12,25,44,0.97) 0%, rgba(12,25,44,0.93) 34%, rgba(12,25,44,0.80) 52%, rgba(18,48,85,0.42) 66%, rgba(18,48,85,0.14) 80%, rgba(18,48,85,0) 100%)",
      },
    }),
    // İçerik sütunu (sol)
    h(
      "div",
      {
        style: {
          position: "absolute",
          top: `${PAD}px`,
          left: `${PAD}px`,
          width: "660px",
          height: `${630 - PAD * 2}px`,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        },
      },
      h(
        "div",
        { style: { display: "flex", flexWrap: "wrap", fontFamily: "Frank Ruhl Libre", fontWeight: 700, fontSize: "84px", lineHeight: 1.05, color: INK } },
        h("span", { style: { display: "flex", marginRight: "22px" } }, "KVKK"),
        h("span", { style: { display: "flex", color: TERRACOTTA } }, "YÖNETİM"),
      ),
      h("div", { style: { marginTop: "28px", marginBottom: "26px", width: "110px", height: "3px", background: TERRACOTTA, display: "flex" } }),
      h(
        "div",
        { style: { display: "flex", width: "560px", fontFamily: "DM Sans", fontWeight: 400, fontSize: "28px", lineHeight: 1.45, color: "rgba(245,245,245,0.92)" } },
        "KVKK & GDPR uyum dokümanları — gerçek veri envanterine dayalı, madde atıflı.",
      ),
    ),
    // Alt-sol: alan adı
    h(
      "div",
      {
        style: {
          position: "absolute",
          left: `${PAD}px`,
          bottom: `${PAD - 6}px`,
          display: "flex",
          fontFamily: "DM Sans",
          fontWeight: 500,
          fontSize: "17px",
          letterSpacing: "2.5px",
          textTransform: "uppercase",
          color: "rgba(245,245,245,0.66)",
        },
      },
      "www.kvkkyonetim.com",
    ),
  );
}

async function main() {
  // Varsayılan: repoya commit'li atmosferik kaynak (Gemini/Nano Banana ile üretilmiş, metinsiz).
  // Farklı bir arka plan denemek için yol argümanı geçilebilir.
  const src = process.argv[2] || path.join(__dirname, "assets", "og-bg.jpg");
  console.log(`Arka plan: ${src}`);
  const bgDataUri = await toBackground(src);
  const fonts = await loadFonts();
  const image = new ImageResponse(buildTree(bgDataUri), { width: 1200, height: 630, fonts });
  const arrayBuffer = await image.arrayBuffer();
  await writeFile(OUT_PATH, Buffer.from(arrayBuffer));
  console.log(`\n✓ Yazıldı: ${path.relative(ROOT, OUT_PATH)} (${(arrayBuffer.byteLength / 1024).toFixed(1)} KB)`);
}

main().catch((err) => {
  console.error("\n✗ Hibrit OG üretilemedi:", err.message);
  process.exitCode = 1;
});
