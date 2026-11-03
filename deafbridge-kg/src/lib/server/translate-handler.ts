import { CONV_LANGS, type ConvLang, type TransLang } from "../types";
import { getProvider, translationEnabled, type SttProvider } from "./stt";
import { guardRequest, parseTargets } from "./transcribe-handler";

export const MAX_TEXT = 500;

/**
 * POST /api/translate  { text, from: "ru"|"ky", targets: ["ky","ja"] }
 * 対面モードで相手（窓口の人）が手で書いた文を、利用者の画面の言語と日本語補助に訳す。
 * 文はログにも残さない。
 */
export async function handleTranslate(
  req: Request,
  provider: SttProvider = getProvider(),
  env: NodeJS.ProcessEnv = process.env,
): Promise<Response> {
  const blocked = guardRequest(req, env);
  if (blocked) return blocked;
  const bad = (message: string, status = 400) =>
    Response.json({ ok: false, error: "bad_request", message }, { status, headers: { "Cache-Control": "no-store" } });

  let body: { text?: unknown; from?: unknown; targets?: unknown };
  try {
    body = await req.json();
  } catch {
    return bad("invalid json");
  }
  const text = typeof body.text === "string" ? body.text.trim() : "";
  if (!text) return bad("text required");
  if (text.length > MAX_TEXT) return bad("text too long", 413);
  const from = body.from as ConvLang;
  if (!CONV_LANGS.includes(from)) return bad("from must be ru or ky");
  const targets = parseTargets(body.targets, from);

  const translations: Partial<Record<TransLang, string>> = {};
  if (targets.length && translationEnabled(env)) {
    const results = await Promise.all(targets.map((t) => provider.translate(text, from, t).catch(() => null)));
    targets.forEach((t, i) => {
      if (results[i]) translations[t] = results[i]!;
    });
  }
  return Response.json({ ok: true, translations }, { headers: { "Cache-Control": "no-store" } });
}
