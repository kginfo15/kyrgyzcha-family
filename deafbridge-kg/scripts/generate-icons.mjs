// アプリアイコン（PNG）を SVG から生成する: node scripts/generate-icons.mjs
import { createRequire } from "node:module";
// Playwright は開発環境にグローバル導入されたものを使う（npm i -D playwright でも可）
const { chromium } = createRequire(import.meta.url)("playwright");
import { fileURLToPath } from "node:url";
import path from "node:path";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#1747c8"/>
  <g fill="none" stroke="#fff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"
     transform="translate(60 40) scale(14)">
    <path d="M8 9a4 4 0 1 1 8 0c0 3-3 4-3 7a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0" stroke-width="1.8"/>
  </g>
  <g fill="#ffd400">
    <rect x="300" y="350" width="150" height="22" rx="11"/>
    <rect x="300" y="395" width="110" height="22" rx="11"/>
  </g>
</svg>`;

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg(size)}</body></html>`);
  await page.screenshot({ path: path.join(out, name), omitBackground: false });
  console.log("wrote", name);
}
await browser.close();
