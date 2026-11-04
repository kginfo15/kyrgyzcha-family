/**
 * 定型返答の音声ファイル（MP3）を事前生成する。
 *
 *   GOOGLE_API_KEY=xxxx node scripts/generate-audio.mjs          # 生成
 *   node scripts/generate-audio.mjs --dry-run                    # 対象一覧だけ表示
 *
 * - 出力: public/audio/{ru|ky}/{id}.mp3 と public/audio/manifest.json
 * - Google Cloud Text-to-Speech を使用（Cloud Console で API を有効化しておく）
 * - キルギス語は Google TTS が未対応の可能性が高い。その場合はスキップされるので、
 *   ネイティブ話者に録音してもらい public/audio/ky/{id}.mp3 として置き、
 *   `node scripts/generate-audio.mjs --manifest-only` で manifest を更新する。
 */
import { mkdirSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PHRASES } from "../src/lib/phrases.ts";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const audioDir = path.join(root, "public", "audio");
const args = new Set(process.argv.slice(2));

// --dump <lang> : 定型文を JSON で出力（GitHub Actions のキルギス語音声生成で使う）
const dumpIdx = process.argv.indexOf("--dump");
if (dumpIdx > -1) {
  const lang = process.argv[dumpIdx + 1] || "ky";
  process.stdout.write(JSON.stringify(PHRASES.map((p) => ({ id: p.id, text: p[lang] })), null, 2));
  process.exit(0);
}
const dry = args.has("--dry-run");
const manifestOnly = args.has("--manifest-only");
const force = args.has("--force");
const key = process.env.GOOGLE_API_KEY;

const VOICES = {
  ru: { languageCode: "ru-RU", name: process.env.TTS_VOICE_RU || "ru-RU-Wavenet-D" },
  ky: { languageCode: "ky-KG", name: process.env.TTS_VOICE_KY || undefined },
};

async function synth(text, lang) {
  const res = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: VOICES[lang],
      audioConfig: { audioEncoding: "MP3", speakingRate: 0.9, volumeGainDb: 4 },
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `HTTP ${res.status}`);
  return Buffer.from(data.audioContent, "base64");
}

function writeManifest() {
  const manifest = {};
  for (const lang of ["ru", "ky"]) {
    const dir = path.join(audioDir, lang);
    const ids = new Set(PHRASES.map((p) => p.id));
    manifest[lang] = existsSync(dir)
      ? readdirSync(dir).filter((f) => f.endsWith(".mp3")).map((f) => f.slice(0, -4)).filter((id) => ids.has(id)).sort()
      : [];
  }
  writeFileSync(path.join(audioDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
  console.log("manifest:", Object.entries(manifest).map(([l, a]) => `${l}=${a.length}`).join(" "));
}

if (!manifestOnly) {
  if (!dry && !key) {
    console.error("GOOGLE_API_KEY を設定してください（--dry-run で一覧表示のみ）");
    process.exit(1);
  }
  for (const lang of ["ru", "ky"]) {
    mkdirSync(path.join(audioDir, lang), { recursive: true });
    let skipLang = false;
    for (const p of PHRASES) {
      const file = path.join(audioDir, lang, `${p.id}.mp3`);
      const text = p[lang];
      if (dry) { console.log(`[${lang}] ${p.id}: ${text}`); continue; }
      if (skipLang || (existsSync(file) && !force)) continue;
      try {
        writeFileSync(file, await synth(text, lang));
        console.log(`[${lang}] ✓ ${p.id}`);
      } catch (e) {
        console.warn(`[${lang}] ✗ ${p.id}: ${e.message}`);
        if (lang === "ky") {
          console.warn("  → キルギス語の音声合成は未対応のようです。ネイティブ話者の録音を置いてください。");
          skipLang = true;
        }
      }
    }
  }
}
if (!dry) writeManifest();
