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

const RU_SAMPLES = /Кто там\?|Что вам нужно\?|Какое лекарство\?|Подождите минуту\.|Это стоит триста сом\.|Рецепт есть\?/;
const KY_SAMPLES = /Ким бул\?|Сизге эмне керек\?|Кайсы дары\?|Бир мүнөт күтө туруңуз\.|Бул үч жүз сом турат\.|Рецепт барбы\?/;
const wait = (loc, name, timeout = 15000) =>
  loc.waitFor({ timeout }).then(() => check(name, true), () => check(name, false));

for (const scheme of ["light", "dark"]) {
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: scheme,
    permissions: ["microphone"],
    locale: "ky-KG",
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const suffix = scheme === "dark" ? "-dark" : "";
  const startBtn = page.getByRole("button", { name: /Сүйлөшүүнү баштоо/ });

  await page.goto(BASE);
  await startBtn.waitFor();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, `01-home${suffix}.png`), fullPage: true });
  if (scheme === "dark") {
    await startBtn.click();
    await page.getByText(RU_SAMPLES).first().waitFor({ timeout: 15000 });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(shots, `02-listen${suffix}.png`) });
    check("dark: no page errors", errors.length === 0, errors.join(" | "));
    await ctx.close();
    continue;
  }

  check("UI defaults to Kyrgyz", await startBtn.isVisible());
  check("Japanese assist shown by default", await page.getByText("会話を始める").first().isVisible());

  const status = await (await page.request.get(BASE + "/api/status")).json();
  check("status endpoint responds (demo mode)", status.provider === "mock");

  await startBtn.click();
  await wait(page.getByRole("button", { name: /Токтотуп, текстке айлантуу/ }), "listening started (mic + MediaRecorder)", 5000);
  await wait(page.getByText("Маектеш сүйлөп жатат").first(), "visual 'someone is talking' banner", 8000);
  check("screen flash alert fired", (await page.locator(".flash").count()) > 0);
  await page.screenshot({ path: path.join(shots, "02-listen-speaking.png") });

  await wait(page.getByText(RU_SAMPLES).first(), "auto end-of-speech → Russian text shown");
  await page.waitForTimeout(300);
  check("Kyrgyz translation shown (UI language)", await page.getByText(KY_SAMPLES).first().isVisible());
  check("Japanese assist translation shown", (await page.locator(".ja-gloss", { hasText: /？|。/ }).count()) > 0);
  await page.screenshot({ path: path.join(shots, "03-listen.png") });

  await wait(page.getByText(RU_SAMPLES).nth(1), "continuous mode: second utterance transcribed");

  // すぐ使う返答 → 再生中表示 → 聞き取り再開
  await page.getByRole("button", { name: /Я хочу купить лекарство/ }).click();
  await wait(page.getByText(/Ойнотулууда|Үн чыкты/).first(), "playback status shown (deaf user can't hear it)", 3000);
  await wait(page.getByRole("button", { name: /Токтотуп, текстке айлантуу/ }), "listening resumes after reply playback");
  await page.screenshot({ path: path.join(shots, "04-listen-history.png"), fullPage: true });

  // 日本語補助オフ
  await page.getByRole("button", { name: /日本語補助表示/ }).click();
  await page.waitForTimeout(200);
  check("Japanese assist can be turned off", (await page.locator(".ja-gloss").count()) === 0);
  await page.screenshot({ path: path.join(shots, "05-listen-no-ja.png") });
  await page.getByRole("button", { name: /日本語補助表示/ }).click();

  await page.getByRole("button", { name: /^Токтотуу/ }).click();
  await wait(page.getByRole("button", { name: /Угууну баштоо/ }), "manual stop returns to idle", 5000);

  // 返答画面
  const nav = page.locator("nav");
  await nav.getByRole("button", { name: /Жооп/ }).click();
  await page.getByText("Жоопту тандаңыз").waitFor();
  await page.screenshot({ path: path.join(shots, "06-reply.png") });
  await page.getByRole("tab", { name: /Дарыкана/ }).click();
  await page.screenshot({ path: path.join(shots, "07-reply-pharmacy.png") });
  await page.getByRole("button", { name: "Экранды көрсөтүү" }).first().click();
  await page.getByRole("dialog").waitFor();
  await page.screenshot({ path: path.join(shots, "08-show-text.png") });
  check("show-to-them overlay opens", true);
  await page.getByRole("dialog").getByRole("button").click();

  // マイ返答（薬の名前を保存）
  await page.locator("textarea").fill("Парацетамол 500 мг");
  await page.getByRole("button", { name: /Менин сөздөрүмө сактоо/ }).click();
  await wait(page.getByText("Парацетамол 500 мг").first(), "my phrase saved", 3000);
  await page.screenshot({ path: path.join(shots, "09-my-phrases.png") });

  // 設定
  await nav.getByRole("button", { name: /Жөндөөлөр/ }).click();
  await page.getByRole("button", { name: /Абдан чоң/ }).click();
  await page.getByRole("button", { name: /^Кыргызча/ }).first().click();
  await page.screenshot({ path: path.join(shots, "10-settings.png"), fullPage: true });
  await page.reload();
  await startBtn.waitFor();
  const persisted = await page.evaluate(() => JSON.parse(localStorage.getItem("deafbridge.settings.v1") || "{}"));
  check("settings + my phrases persisted", persisted.fontSize === "xlarge" && persisted.convLang === "ky" && persisted.myPhrases?.length === 1);
  check("no recordings stored in localStorage", Object.keys(await page.evaluate(() => ({ ...localStorage }))).length === 1);

  // 相手もキルギス語
  await startBtn.click();
  await wait(page.getByText(KY_SAMPLES).first(), "Kyrgyz conversation language works");
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(shots, "11-listen-ky-xlarge.png") });
  await page.getByRole("button", { name: /^Токтотуу/ }).click();

  // ロシア語 UI
  await page.locator("nav").getByRole("button", { name: /Жөндөөлөр/ }).click();
  await page.getByRole("button", { name: /Абдан чоң/ }).isVisible();
  await page.getByRole("button", { name: /^Чоң/ }).click();
  await page.getByRole("button", { name: /^Русский/ }).nth(1).click();
  await wait(page.getByText("Настройки").first(), "Russian UI works", 3000);
  await page.screenshot({ path: path.join(shots, "12-settings-ru.png") });

  const swOk = await page.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()));
  check("service worker registered", swOk);
  check("no page errors", errors.length === 0, errors.join(" | "));
  await ctx.close();
}

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
