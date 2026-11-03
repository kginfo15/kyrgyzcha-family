/**
 * claude.ai などで開ける「お試し版」の単一 HTML を作る。
 *   npm run build          # Tailwind の CSS を作るため先に本番ビルド
 *   node scripts/build-demo.mjs  → dist-demo/deafbridge-demo.html
 *
 * 画面部品は本物と同じ。マイク・音声認識だけを疑似動作に差し替える
 * （"相手が話す" を数秒ごとに自動で再現し、サンプル文を表示する）。
 */
import { build } from "esbuild";
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const SWAP = {
  "@/lib/client/api": "src/demo/demo-api.ts",
  "@/lib/client/useListener": "src/demo/useDemoListener.ts",
  "@/lib/client/audio-convert": "src/demo/demo-audio-convert.ts",
};

const result = await build({
  entryPoints: [path.join(root, "src/demo/entry.tsx")],
  bundle: true,
  minify: true,
  write: false,
  format: "iife",
  jsx: "automatic",
  target: ["safari15", "chrome100"],
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.NEXT_PUBLIC_STATIC_DEMO": '"1"',
  },
  plugins: [
    {
      name: "demo-swap",
      setup(b) {
        b.onResolve({ filter: /^@\/lib\/client\/(api|useListener|audio-convert)$/ }, (args) => ({
          path: path.join(root, SWAP[args.path]),
        }));
      },
    },
  ],
});
const js = result.outputFiles[0].text.replace(/<\/script/gi, "<\\/script");

const cssDir = path.join(root, ".next/static/chunks");
const cssFile = readdirSync(cssDir).find((f) => f.endsWith(".css"));
if (!cssFile) throw new Error("先に npm run build を実行してください（CSS が見つかりません）");
const css = readFileSync(path.join(cssDir, cssFile), "utf8").replace(/<\/style/gi, "<\\/style");

const html = `<title>DeafBridge KG Demo</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;700;800&family=Unbounded:wght@700&display=swap">
<style>${css}</style>
<style>#root{height:100%}</style>
<div id="root"></div>
<script>${js}</script>
`;
const out = path.join(root, "dist-demo");
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, "deafbridge-demo.html"), html);
console.log(`dist-demo/deafbridge-demo.html  ${(html.length / 1024).toFixed(0)} KB`);
