import { describe, expect, it, vi } from "vitest";
import { handleTranscribe } from "@/lib/server/transcribe-handler";
import {
  buildGoogleSttRequest,
  createMockProvider,
  getProvider,
  parseGoogleSttResponse,
  type SttProvider,
} from "@/lib/server/stt";
import { createRateLimiter } from "@/lib/server/rate-limit";
import { encodeWav } from "@/lib/wav";

function wavBody(seconds: number, rate = 16000) {
  return encodeWav(new Float32Array(Math.round(seconds * rate)).fill(0.1), rate);
}

function req(body: BodyInit | null, opts: { lang?: string; tr?: string; type?: string; code?: string; ip?: string } = {}) {
  const url = new URL("http://localhost/api/transcribe");
  if (opts.lang !== "") url.searchParams.set("lang", opts.lang ?? "ru");
  if (opts.tr) url.searchParams.set("tr", opts.tr);
  return new Request(url, {
    method: "POST",
    body,
    headers: {
      "content-type": opts.type ?? "audio/wav",
      "x-forwarded-for": opts.ip ?? `10.0.0.${Math.floor(Math.random() * 250)}`,
      ...(opts.code ? { "x-access-code": opts.code } : {}),
    },
  });
}

const asEnv = (o: Record<string, string>) => o as unknown as NodeJS.ProcessEnv;
const env = asEnv({});

describe("POST /api/transcribe", () => {
  it("transcribes Russian and translates to Kyrgyz (UI) and Japanese (assist)", async () => {
    const res = await handleTranscribe(req(wavBody(1), { tr: "ky,ja" }), createMockProvider(), env);
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
    expect(data.provider).toBe("mock");
    expect(data.text).toBeTruthy();
    expect(Object.keys(data.translations).sort()).toEqual(["ja", "ky"]);
  });

  it("ignores unknown / duplicate / same-language translation targets", async () => {
    const translate = vi.fn(async (_t: string, _f: string, to: string) => `x-${to}`);
    const p: SttProvider = { ...createMockProvider(), translate };
    const res = await handleTranscribe(req(wavBody(1), { tr: "ru,ja,ja,en,<script>" }), p, env);
    expect((await res.json()).translations).toEqual({ ja: "x-ja" });
    expect(translate).toHaveBeenCalledTimes(1);
  });

  it("keeps successful translations when one target fails", async () => {
    const p: SttProvider = {
      ...createMockProvider(),
      translate: async (_t, _f, to) => {
        if (to === "ja") throw new Error("x");
        return "ok";
      },
    };
    const res = await handleTranscribe(req(wavBody(1), { tr: "ky,ja" }), p, env);
    expect((await res.json()).translations).toEqual({ ky: "ok" });
  });

  it("passes raw PCM and sample rate to provider", async () => {
    const transcribe = vi.fn(async () => ({ text: "Привет", confidence: 0.9, alternatives: [] }));
    const p: SttProvider = { name: "google", transcribe, translate: async () => null };
    await handleTranscribe(req(wavBody(0.5, 8000)), p, env);
    const [pcm, rate, lang] = transcribe.mock.calls[0] as unknown as [Uint8Array, number, string];
    expect(pcm.length).toBe(8000); // 0.5s * 8000Hz * 2 bytes
    expect(rate).toBe(8000);
    expect(lang).toBe("ru");
  });

  it("does not translate when no targets requested", async () => {
    const translate = vi.fn(async () => "x");
    const p: SttProvider = { ...createMockProvider(), translate };
    const res = await handleTranscribe(req(wavBody(1)), p, env);
    expect((await res.json()).translations).toEqual({});
    expect(translate).not.toHaveBeenCalled();
  });

  it("rejects bad language", async () => {
    const res = await handleTranscribe(req(wavBody(1), { lang: "en" }), createMockProvider(), env);
    expect(res.status).toBe(400);
  });

  it("rejects non-wav content", async () => {
    const res = await handleTranscribe(req("hello", { type: "audio/webm" }), createMockProvider(), env);
    expect(res.status).toBe(415);
    const res2 = await handleTranscribe(req("not a wav file at all, definitely not.......................", {}), createMockProvider(), env);
    expect(res2.status).toBe(415);
  });

  it("rejects too long audio", async () => {
    const res = await handleTranscribe(req(wavBody(35, 8000)), createMockProvider(), env);
    expect(res.status).toBe(413);
  });

  it("returns empty text for very short audio without calling provider", async () => {
    const transcribe = vi.fn();
    const p: SttProvider = { name: "mock", transcribe, translate: async () => null };
    const res = await handleTranscribe(req(wavBody(0.1)), p, env);
    expect((await res.json()).text).toBe("");
    expect(transcribe).not.toHaveBeenCalled();
  });

  it("enforces access code when configured", async () => {
    const e = asEnv({ APP_ACCESS_CODE: "secret" });
    expect((await handleTranscribe(req(wavBody(1)), createMockProvider(), e)).status).toBe(401);
    expect((await handleTranscribe(req(wavBody(1), { code: "wrong!" }), createMockProvider(), e)).status).toBe(401);
    expect((await handleTranscribe(req(wavBody(1), { code: "secret" }), createMockProvider(), e)).status).toBe(200);
  });

  it("maps provider failures to 502 without leaking details", async () => {
    const p: SttProvider = {
      name: "google",
      transcribe: async () => {
        throw new Error("boom");
      },
      translate: async () => null,
    };
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await handleTranscribe(req(wavBody(1)), p, env);
    spy.mockRestore();
    expect(res.status).toBe(502);
    expect(JSON.stringify(await res.json())).not.toContain("boom");
  });

  it("rate limits per IP", async () => {
    let last = 200;
    for (let i = 0; i < 35; i++) {
      last = (await handleTranscribe(req(wavBody(0.3), { ip: "1.2.3.4" }), createMockProvider(), env)).status;
    }
    expect(last).toBe(429);
  });
});

describe("rate limiter", () => {
  it("resets after window", () => {
    const check = createRateLimiter(2, 1000);
    expect(check("a", 0)).toBe(true);
    expect(check("a", 1)).toBe(true);
    expect(check("a", 2)).toBe(false);
    expect(check("a", 1001)).toBe(true);
  });
});

describe("google provider helpers", () => {
  it("builds request with language and hints", () => {
    const r = buildGoogleSttRequest("AAAA", 16000, "ky");
    expect(r.config.languageCode).toBe("ky-KG");
    expect(r.config.encoding).toBe("LINEAR16");
    expect(r.config.enableAutomaticPunctuation).toBe(false);
    expect(r.config.speechContexts[0].phrases).toContain("дары");
    expect(buildGoogleSttRequest("AAAA", 16000, "ru").config.enableAutomaticPunctuation).toBe(true);
  });

  it("parses multi-result responses", () => {
    const out = parseGoogleSttResponse({
      results: [
        { alternatives: [{ transcript: "Что вам", confidence: 0.8 }] },
        { alternatives: [{ transcript: " нужно?", confidence: 0.6 }] },
      ],
    });
    expect(out.text).toBe("Что вам нужно?");
    expect(out.confidence).toBeCloseTo(0.7);
  });

  it("parses alternatives and empty responses", () => {
    expect(parseGoogleSttResponse({}).text).toBe("");
    const out = parseGoogleSttResponse({
      results: [{ alternatives: [{ transcript: "Кто там", confidence: 0.9 }, { transcript: "Кот там" }] }],
    });
    expect(out.alternatives).toEqual(["Кот там"]);
  });

  it("selects provider from env", () => {
    expect(getProvider(asEnv({})).name).toBe("mock");
    expect(getProvider(asEnv({ GOOGLE_API_KEY: "k" })).name).toBe("google");
    expect(getProvider(asEnv({ GOOGLE_API_KEY: "k", STT_PROVIDER: "mock" })).name).toBe("mock");
  });
});
