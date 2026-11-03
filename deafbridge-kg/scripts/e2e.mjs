/**
 * E2E 動作確認 & スクリーンショット生成
 *   npm run build && npx next start -p 3100 &   (音声認識はデモモード)
 *   node scripts/e2e.mjs
 * Chromium の偽マイクに「1秒無音 → 1.5秒の声に似た音 → 3秒無音」をループ再生させ、
 * 聞き取り → 自動区切り → 文字化 → 返答 の流れを確認する。
 */
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { chromium } = createRequire(import.meta.url)("playwright");
const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const shots = path.join(root, "docs", "screenshots");
mkdirSync(shots, { recursive: true });
const BASE = process.env.BASE_URL || "http://localhost:3100";

// ---- 偽マイク用 WAV（48kHz mono 16bit）
function makeWav(file) {
  const rate = 48000;
  const segs = [[1.0, 0], [1.5, 1], [3.0, 0]];
  const total = segs.reduce((a, [s]) => a + s, 0);
  const n = Math.round(total * rate);
  const buf = Buffer.alloc(44 + n * 2);
  buf.write("RIFF", 0); buf.writeUInt32LE(36 + n * 2, 4); buf.write("WAVE", 8);
  buf.write("fmt ", 12); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(1, 22);
  buf.writeUInt32LE(rate, 24); buf.writeUInt32LE(rate * 2, 28); buf.writeUInt16LE(2, 32); buf.writeUInt16LE(16, 34);
  buf.write("data", 36); buf.writeUInt32LE(n * 2, 40);
  let i = 0;
  for (const [sec, on] of segs) {
    for (let k = 0; k < sec * rate; k++, i++) {
      const t = i / rate;
      // 母音っぽい倍音 + 4Hz の音節的な揺れ
      const v = on ? (Math.sin(2 * Math.PI * 180 * t) * 0.5 + Math.sin(2 * Math.PI * 360 * t) * 0.3 + Math.sin(2 * Math.PI * 720 * t) * 0.15) * (0.6 + 0.4 * Math.sin(2 * Math.PI * 4 * t)) * 0.6
                   : (Math.random() - 0.5) * 0.002;
      buf.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), 44 + i * 2);
    }
  }
  writeFileSync(file, buf);
}

const fake = path.join(root, "node_modules", ".e2e-fake-mic.wav");
makeWav(fake);

const browser = await chromium.launch({
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    `--use-file-for-fake-audio-capture=${fake}`,
    "--autoplay-policy=no-user-gesture-required",
  ],
});
const results = [];
const check = (name, ok, extra = "") => {
  results.push({ name, ok });
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
};

for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: scheme,
    permissions: ["microphone"],
    locale: "ja-JP",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const suffix = scheme === "dark" ? "-dark" : "";

  await page.goto(BASE);
  await page.getByRole("button", { name: "会話を始める" }).waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, `01-home${suffix}.png`) });
  if (scheme === "dark") {
    // ダークは画面写真だけ
    await page.getByRole("button", { name: "会話を始める" }).click();
    await page.getByText(/Кто там\?|Что вам нужно\?|Какое лекарство\?|Подождите минуту\.|Это стоит триста сом\.|Рецепт есть\?/).first().waitFor({ timeout: 15000 });
    await page.screenshot({ path: path.join(shots, `02-listen${suffix}.png`) });
    check("dark: no page errors", errors.length === 0, errors.join(" | "));
    await ctx.close();
    continue;
  }

  const status = await (await page.request.get(BASE + "/api/status")).json();
  check("status endpoint responds (demo mode)", status.provider === "mock");

  await page.getByRole("button", { name: "会話を始める" }).click();
  await page.getByText("停止して文字にする").waitFor({ timeout: 5000 });
  check("listening started (mic permission + MediaRecorder)", true);

  await page.getByText("音を検出中").waitFor({ timeout: 8000 }).then(
    () => check("voice activity detected on level meter", true),
    () => check("voice activity detected on level meter", false),
  );
  await page.getByText("Кто там?").waitFor({ timeout: 15000 }).then(
    () => check("auto end-of-speech → transcribed text shown", true),
    () => check("auto end-of-speech → transcribed text shown", false),
  );
  check("translation shown", await page.getByText("どなたですか？").first().isVisible());
  await page.screenshot({ path: path.join(shots, "02-listen.png") });

  // 続けて聞き取り → 2つ目の発話も文字化される
  await page.getByText("Что вам нужно?").waitFor({ timeout: 15000 }).then(
    () => check("continuous mode: second utterance transcribed", true),
    () => check("continuous mode: second utterance transcribed", false),
  );

  // すぐ使う返答（再生中はマイクを止め、後で再開する）
  await page.getByRole("button", { name: /Я хочу купить лекарство/ }).click();
  await page.waitForTimeout(300);
  check("reply logged in history", await page.getByText("自分").first().isVisible());
  await page.getByText("停止して文字にする").waitFor({ timeout: 15000 }).then(
    () => check("listening resumes after reply playback", true),
    () => check("listening resumes after reply playback", false),
  );
  await page.screenshot({ path: path.join(shots, "03-listen-history.png"), fullPage: true });

  // 手動停止（送らない）
  await page.getByRole("button", { name: "停止", exact: true }).click();
  await page.getByText("聞き取り開始").waitFor();
  check("manual stop returns to idle", true);

  // 返答画面
  await page.getByRole("button", { name: "返答", exact: true }).click();
  await page.getByText("返答を選ぶ").waitFor();
  await page.screenshot({ path: path.join(shots, "04-reply.png") });
  await page.getByRole("tab", { name: "薬局" }).click();
  await page.screenshot({ path: path.join(shots, "05-reply-pharmacy.png") });
  await page.getByRole("button", { name: "画面を見せる" }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({ path: path.join(shots, "06-show-text.png") });
  check("show-to-them overlay opens", true);
  await page.getByRole("dialog").getByRole("button", { name: "閉じる" }).click();

  // 設定画面
  await page.getByRole("button", { name: "設定", exact: true }).click();
  await page.getByRole("button", { name: "特大" }).click();
  await page.getByRole("button", { name: "Кыргызча" }).first().click();
  await page.screenshot({ path: path.join(shots, "07-settings.png"), fullPage: true });
  await page.reload();
  await page.getByRole("button", { name: "会話を始める" }).waitFor();
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("deafbridge.settings.v1") || "{}"));
  check("settings persisted", persisted.fontSize === "xlarge" && persisted.convLang === "ky");
  check("no recordings stored in localStorage", Object.keys(await page.evaluate(() => ({ ...localStorage }))).length === 1);

  // キルギス語で会話
  await page.getByRole("button", { name: "会話を始める" }).click();
  await page.getByText(/Ким бул\?|Сизге эмне керек\?|Кайсы дары\?|Бир мүнөт күтө туруңуз\.|Бул үч жүз сом турат\.|Рецепт барбы\?/).first().waitFor({ timeout: 15000 }).then(
    () => check("kyrgyz conversation language works", true),
    () => check("kyrgyz conversation language works", false),
  );
  await page.screenshot({ path: path.join(shots, "08-listen-ky-xlarge.png") });

  const swOk = await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()));
  check("service worker registered", swOk);
  check("no page errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
