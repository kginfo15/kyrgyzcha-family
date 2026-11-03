import { STT_LANG_CODE, type ConvLang, type TransLang } from "../types";
import { googlePost, readGoogleAuth, type GoogleAuth } from "./google-auth";
import { PHRASE_HINTS } from "./phrase-hints";

export type SttOutput = { text: string; confidence: number | null; alternatives: string[] };

export type SttProvider = {
  name: "mock" | "google";
  /** pcm: 16bit little-endian mono PCM */
  transcribe(pcm: Uint8Array, sampleRate: number, lang: ConvLang): Promise<SttOutput>;
  translate(text: string, from: ConvLang, to: TransLang): Promise<string | null>;
};

// ---------------------------------------------------------------- mock

import { MOCK_SAMPLES } from "../mock-samples";

export { MOCK_SAMPLES };

let mockIndex = 0;

export function createMockProvider(): SttProvider {
  return {
    name: "mock",
    async transcribe(_pcm, _rate, lang) {
      const s = MOCK_SAMPLES[mockIndex++ % MOCK_SAMPLES.length];
      return { text: s[lang], confidence: 0.92, alternatives: [] };
    },
    async translate(text, from, to) {
      const s = MOCK_SAMPLES.find((m) => m[from] === text);
      return s ? s[to] : null;
    },
  };
}

// ---------------------------------------------------------------- google

type GoogleSttResponse = {
  results?: {
    alternatives?: { transcript?: string; confidence?: number }[];
  }[];
  error?: { message?: string };
};

export function buildGoogleSttRequest(wavBase64: string, sampleRate: number, lang: ConvLang) {
  return {
    config: {
      encoding: "LINEAR16",
      sampleRateHertz: sampleRate,
      audioChannelCount: 1,
      languageCode: STT_LANG_CODE[lang],
      maxAlternatives: 3,
      // 自動句読点はロシア語のみ対応（キルギス語は未対応の可能性があるため送らない）
      enableAutomaticPunctuation: lang === "ru",
      profanityFilter: false,
      speechContexts: [{ phrases: PHRASE_HINTS[lang], boost: 10 }],
      ...(process.env.GOOGLE_STT_MODEL ? { model: process.env.GOOGLE_STT_MODEL } : {}),
    },
    audio: { content: wavBase64 },
  };
}

export function parseGoogleSttResponse(data: GoogleSttResponse): SttOutput {
  const results = data.results ?? [];
  // 長めの発話は複数 result に分割されるので、各 result の第1候補を連結する
  const text = results
    .map((r) => r.alternatives?.[0]?.transcript?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
  const confs = results
    .map((r) => r.alternatives?.[0]?.confidence)
    .filter((c): c is number => typeof c === "number");
  const confidence = confs.length ? confs.reduce((a, b) => a + b, 0) / confs.length : null;
  const alternatives =
    results.length === 1
      ? (results[0].alternatives ?? [])
          .slice(1)
          .map((a) => a.transcript?.trim() ?? "")
          .filter(Boolean)
      : [];
  return { text, confidence, alternatives };
}

export function createGoogleProvider(auth: GoogleAuth): SttProvider {
  const sttUrl = "https://speech.googleapis.com/v1/speech:recognize";
  const translateUrl = "https://translation.googleapis.com/language/translate/v2";

  return {
    name: "google",
    async transcribe(pcm, sampleRate, lang) {
      const body = buildGoogleSttRequest(Buffer.from(pcm).toString("base64"), sampleRate, lang);
      const res = await googlePost(auth, sttUrl, body, AbortSignal.timeout(20000));
      const data = (await res.json().catch(() => ({}))) as GoogleSttResponse;
      if (!res.ok) {
        throw new Error(`google stt ${res.status}: ${data.error?.message ?? "unknown"}`);
      }
      return parseGoogleSttResponse(data);
    },
    async translate(text, from, to) {
      if (!text) return null;
      const res = await googlePost(
        auth,
        translateUrl,
        { q: text, source: from, target: to, format: "text" },
        AbortSignal.timeout(8000),
      );
      if (!res.ok) return null;
      const data = (await res.json()) as {
        data?: { translations?: { translatedText?: string }[] };
      };
      return data.data?.translations?.[0]?.translatedText ?? null;
    },
  };
}

// ---------------------------------------------------------------- select

export function getProvider(env: NodeJS.ProcessEnv = process.env): SttProvider {
  if (env.STT_PROVIDER === "mock") return createMockProvider();
  const auth = readGoogleAuth(env);
  return auth ? createGoogleProvider(auth) : createMockProvider();
}

export function translationEnabled(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.TRANSLATION_ENABLED !== "false";
}
