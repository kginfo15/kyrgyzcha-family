import { timingSafeEqual } from "node:crypto";
import { CONV_LANGS, TRANS_LANGS, type ConvLang, type TranscribeError, type TranscribeResult, type TransLang } from "../types";
import { parseWav } from "../wav";
import { createRateLimiter } from "./rate-limit";
import { getProvider, translationEnabled, type SttProvider } from "./stt";

export const MAX_SECONDS = 30;
/** 16kHz * 16bit * 30秒 ≒ 960KB。余裕を見て 1.2MB */
export const MAX_BYTES = 1_200_000;

const limiter = createRateLimiter(
  Number(process.env.RATE_LIMIT_PER_MINUTE) || 30,
  60_000,
);

function json(body: TranscribeResult | TranscribeError, status = 200) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

function err(error: TranscribeError["error"], message: string, status: number) {
  return json({ ok: false, error, message }, status);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function accessCodeRequired(env: NodeJS.ProcessEnv = process.env): boolean {
  return !!env.APP_ACCESS_CODE;
}

/** アクセスコードとレート制限の確認（文字化・翻訳の両方で使う）。問題なければ null */
export function guardRequest(req: Request, env: NodeJS.ProcessEnv): Response | null {
  if (env.APP_ACCESS_CODE) {
    const code = req.headers.get("x-access-code") ?? "";
    if (!safeEqual(code, env.APP_ACCESS_CODE)) return err("unauthorized", "invalid access code", 401);
  }
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (!limiter(ip)) return err("rate_limited", "too many requests", 429);
  return null;
}

/** "ky,ja" のような翻訳先の指定を検証する */
export function parseTargets(raw: unknown, from: ConvLang): TransLang[] {
  const list = Array.isArray(raw) ? raw : typeof raw === "string" ? raw.split(",") : [];
  return [
    ...new Set(
      list
        .map((t) => String(t).trim())
        .filter((t): t is TransLang => TRANS_LANGS.includes(t as TransLang) && t !== from),
    ),
  ];
}

/**
 * POST /api/transcribe?lang=ru&tr=ky,ja
 *   lang: 相手の言語 / tr: 翻訳先（カンマ区切り。ky / ru / ja）
 * body: audio/wav (16bit PCM mono)
 * 録音データはメモリ上でのみ扱い、保存もログ出力もしない。
 */
export async function handleTranscribe(
  req: Request,
  provider: SttProvider = getProvider(),
  env: NodeJS.ProcessEnv = process.env,
): Promise<Response> {
  const started = Date.now();
  const url = new URL(req.url);

  // 1) アクセスコード（設定されている場合のみ）・2) レート制限
  const blocked = guardRequest(req, env);
  if (blocked) return blocked;

  // 3) パラメータ
  const lang = url.searchParams.get("lang") as ConvLang;
  if (!CONV_LANGS.includes(lang)) return err("bad_request", "lang must be ru or ky", 400);
  const targets = parseTargets(url.searchParams.get("tr") ?? "", lang);

  // 4) サイズ・形式チェック
  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > MAX_BYTES) return err("too_large", "audio too large", 413);
  const ctype = req.headers.get("content-type") ?? "";
  if (!ctype.startsWith("audio/wav") && !ctype.startsWith("audio/x-wav")) {
    return err("unsupported_audio", "send audio/wav (16-bit PCM mono)", 415);
  }
  const buf = new Uint8Array(await req.arrayBuffer());
  if (buf.length > MAX_BYTES) return err("too_large", "audio too large", 413);
  const info = parseWav(buf);
  if (!info || info.channels !== 1 || info.bitsPerSample !== 16) {
    return err("unsupported_audio", "invalid wav: need 16-bit PCM mono", 415);
  }
  if (info.sampleRate < 8000 || info.sampleRate > 48000) {
    return err("unsupported_audio", "unsupported sample rate", 415);
  }
  if (info.durationSec > MAX_SECONDS + 0.5) return err("too_long", "audio too long", 413);
  if (info.durationSec < 0.2) {
    return json({
      ok: true, text: "", confidence: null, alternatives: [], translations: {},
      provider: provider.name, elapsedMs: Date.now() - started,
    });
  }

  // 5) 文字化 → 翻訳
  try {
    const pcm = buf.subarray(info.dataOffset, info.dataOffset + info.dataLength);
    const out = await provider.transcribe(pcm, info.sampleRate, lang);
    const translations: Partial<Record<TransLang, string>> = {};
    if (out.text && targets.length && translationEnabled(env)) {
      const results = await Promise.all(
        targets.map((t) => provider.translate(out.text, lang, t).catch(() => null)),
      );
      targets.forEach((t, i) => {
        if (results[i]) translations[t] = results[i]!;
      });
    }
    return json({
      ok: true,
      text: out.text,
      confidence: out.confidence,
      alternatives: out.alternatives,
      translations,
      provider: provider.name,
      elapsedMs: Date.now() - started,
    });
  } catch (e) {
    // 音声内容はログに出さない（エラー種別のみ）
    console.error("[transcribe] provider error:", e instanceof Error ? e.message : "unknown");
    return err("provider_error", "speech recognition failed", 502);
  }
}
