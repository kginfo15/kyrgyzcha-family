/**
 * お試しページ用：サーバーを使わず、ブラウザ内でサンプル文を返す。
 * scripts/build-demo.mjs が "@/lib/client/api" をこのファイルに差し替える。
 */
import { MOCK_SAMPLES } from "../lib/mock-samples";
import type { ConvLang, StatusResponse, TranscribeError, TranscribeResult, TransLang } from "../lib/types";

let index = 0;

export async function fetchStatus(): Promise<StatusResponse | null> {
  return { provider: "mock", translation: true, accessCodeRequired: false, maxSeconds: 30 };
}

export async function transcribe(
  _wav: Blob,
  lang: ConvLang,
  targets: TransLang[],
): Promise<TranscribeResult | TranscribeError> {
  await new Promise((r) => setTimeout(r, 700)); // 通信している感じを再現
  const s = MOCK_SAMPLES[index++ % MOCK_SAMPLES.length];
  const translations: Partial<Record<TransLang, string>> = {};
  for (const t of targets) if (t !== lang) translations[t] = s[t];
  return { ok: true, text: s[lang], confidence: 0.92, alternatives: [], translations, provider: "mock", elapsedMs: 700 };
}
