// アプリアイコン（PNG）を SVG から生成する: node scripts/generate-icons.mjs
import { createRequire } from "node:module";
// Playwright は開発環境にグローバル導入されたものを使う（npm i -D playwright でも可）
const { chromium } = createRequire(import.meta.url)("playwright");
import { fileURLToPath } from "node:url";
import path from "node:path";

const out = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public");
const svg = (size) => `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#060607"/>
  <line x1="406.0" y1="256.0" x2="461.0" y2="256.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="398.7" y1="302.4" x2="451.0" y2="319.3" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="377.4" y1="344.2" x2="421.8" y2="376.5" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="344.2" y1="377.4" x2="376.5" y2="421.8" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="302.4" y1="398.7" x2="319.3" y2="451.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="256.0" y1="406.0" x2="256.0" y2="461.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="209.6" y1="398.7" x2="192.7" y2="451.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="167.8" y1="377.4" x2="135.5" y2="421.8" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="134.6" y1="344.2" x2="90.2" y2="376.5" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="113.3" y1="302.4" x2="61.0" y2="319.3" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="106.0" y1="256.0" x2="51.0" y2="256.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="113.3" y1="209.6" x2="61.0" y2="192.7" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="134.6" y1="167.8" x2="90.2" y2="135.5" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="167.8" y1="134.6" x2="135.5" y2="90.2" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="209.6" y1="113.3" x2="192.7" y2="61.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="256.0" y1="106.0" x2="256.0" y2="51.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="302.4" y1="113.3" x2="319.3" y2="61.0" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="344.2" y1="134.6" x2="376.5" y2="90.2" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="377.4" y1="167.8" x2="421.8" y2="135.5" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <line x1="398.7" y1="209.6" x2="451.0" y2="192.7" stroke="#ffd23f" stroke-width="20" stroke-linecap="round"/>
  <circle cx="256" cy="256" r="118" fill="#ffd23f"/>
  <g fill="none" stroke="#e8112d" stroke-width="16" stroke-linecap="round">
    <circle cx="256" cy="256" r="88"/>
    <path d="M212 182c20 44 20 104 0 148M256 168v176M300 182c-20 44-20 104 0 148"/>
    <path d="M182 212c44 20 104 20 148 0M182 300c44-20 104-20 148 0"/>
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
