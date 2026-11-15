import { describe, expect, it, vi } from "vitest";
import { handleTranslate } from "@/lib/server/translate-handler";
import { createMockProvider, type SttProvider } from "@/lib/server/stt";

const env = {} as unknown as NodeJS.ProcessEnv;
const req = (body: unknown, headers: Record<string, string> = {}) =>
  new Request("http://localhost/api/translate", {
    method: "POST",
    body: typeof body === "string" ? body : JSON.stringify(body),
    headers: { "content-type": "application/json", "x-forwarded-for": `10.1.0.${Math.floor(Math.random() * 250)}`, ...headers },
  });

describe("POST /api/translate (staff-typed text)", () => {
  it("translates to requested targets", async () => {
    const res = await handleTranslate(req({ text: "Кто там?", from: "ru", targets: ["ky", "ja"] }), createMockProvider(), env);
    const data = await res.json();
    expect(data.ok).toBe(true);
    expect(data.translations).toEqual({ ky: "Ким бул?", ja: "どなたですか？" });
  });
  it("skips same-language and unknown targets", async () => {
    const translate = vi.fn(async () => "x");
    const p: SttProvider = { ...createMockProvider(), translate };
    await handleTranslate(req({ text: "Привет", from: "ru", targets: ["ru", "en", "ja"] }), p, env);
    expect(translate).toHaveBeenCalledTimes(1);
  });
  it("validates input", async () => {
    expect((await handleTranslate(req("{bad"), createMockProvider(), env)).status).toBe(400);
    expect((await handleTranslate(req({ text: "", from: "ru" }), createMockProvider(), env)).status).toBe(400);
    expect((await handleTranslate(req({ text: "x", from: "en" }), createMockProvider(), env)).status).toBe(400);
    expect((await handleTranslate(req({ text: "x".repeat(501), from: "ru" }), createMockProvider(), env)).status).toBe(413);
  });
  it("requires access code when configured", async () => {
    const e = { APP_ACCESS_CODE: "s" } as unknown as NodeJS.ProcessEnv;
    expect((await handleTranslate(req({ text: "x", from: "ru" }), createMockProvider(), e)).status).toBe(401);
    expect((await handleTranslate(req({ text: "x", from: "ru" }, { "x-access-code": "s" }), createMockProvider(), e)).status).toBe(200);
  });
});
