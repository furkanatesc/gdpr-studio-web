#!/usr/bin/env node
/**
 * Web app manifest ikonları — mevcut src/app/icon.svg (lacivert kare + krem "K" +
 * terracotta bacak, marka simgesi) tek kaynaktan PNG'ye ölçeklenir (sharp/libvips,
 * vektör kaynaklı olduğundan kayıpsız). manifest.ts bu dosyaları referans alır.
 *
 * Çalıştırma: node scripts/generate-app-icons.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const SRC_SVG = path.join(ROOT, "src", "app", "icon.svg");
const SIZES = [192, 512];

async function main() {
  const svg = await readFile(SRC_SVG);
  for (const size of SIZES) {
    const outPath = path.join(ROOT, "public", `icon-${size}.png`);
    const buf = await sharp(svg, { density: 384 }).resize(size, size).png().toBuffer();
    await writeFile(outPath, buf);
    console.log(`✓ Yazıldı: ${path.relative(ROOT, outPath)} (${(buf.byteLength / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error("✗ Uygulama ikonları üretilemedi:", err);
  process.exitCode = 1;
});
