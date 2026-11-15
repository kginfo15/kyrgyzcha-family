import { describe, expect, it } from "vitest";
import { DICTS } from "@/lib/i18n";
import { PHRASES, PHRASE_CATEGORIES } from "@/lib/phrases";
import { sanitizeSettings, DEFAULT_SETTINGS, toggleQuick } from "@/lib/settings";

describe("phrases", () => {
  it("have unique, file-safe ids", () => {
    const ids = PHRASES.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9_]+$/);
  });
  it("have text in every language", () => {
    for (const p of PHRASES) {
      expect(p.ru.trim(), p.id).not.toBe("");
      expect(p.ky.trim(), p.id).not.toBe("");
      expect(p.ja.trim(), p.id).not.toBe("");
      expect(PHRASE_CATEGORIES).toContain(p.category);
      expect(p.icon.trim(), p.id).not.toBe("");
    }
  });
  it("every category has phrases", () => {
    for (const c of PHRASE_CATEGORIES) expect(PHRASES.some((p) => p.category === c)).toBe(true);
  });
});

describe("i18n", () => {
  it("all UI languages define every key", () => {
    const keys = Object.keys(DICTS.ky).sort();
    for (const lang of ["ru", "ja"] as const) {
      expect(Object.keys(DICTS[lang]).sort()).toEqual(keys);
      for (const k of keys) expect(DICTS[lang][k as keyof typeof DICTS.ja], `${lang}.${k}`).not.toBe("");
    }
  });
});

describe("settings", () => {
  it("falls back to defaults on garbage", () => {
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({ uiLang: "xx", maxSeconds: 999, fontSize: 3 })).toEqual(DEFAULT_SETTINGS);
  });
  it("defaults to Kyrgyz UI, Japanese assist off, consent not yet given", () => {
    expect(DEFAULT_SETTINGS.uiLang).toBe("ky");
    expect(DEFAULT_SETTINGS.jaAssist).toBe(false);
    expect(DEFAULT_SETTINGS.consent).toBe(false);
    expect(sanitizeSettings({ consent: true }).consent).toBe(true);
  });
  it("migrates old Japanese UI setting to Kyrgyz + Japanese assist", () => {
    const s = sanitizeSettings({ uiLang: "ja", jaAssist: false });
    expect(s.uiLang).toBe("ky");
    expect(s.jaAssist).toBe(true);
  });
  it("validates saved my-phrases", () => {
    const s = sanitizeSettings({
      myPhrases: [
        { id: "a", text: "Парацетамол", lang: "ru" },
        { id: "b", text: "  ", lang: "ru" },
        { id: "c", text: "x", lang: "en" },
        "junk",
        { id: "d", text: "y".repeat(500), lang: "ky" },
      ],
    });
    expect(s.myPhrases.map((m) => m.id)).toEqual(["a", "d"]);
    expect(s.myPhrases[1].text.length).toBe(200);
  });
  it("idle auto-stop defaults to 60s and validates values", () => {
    expect(DEFAULT_SETTINGS.idleStopSec).toBe(60);
    expect(sanitizeSettings({ idleStopSec: 0 }).idleStopSec).toBe(0);
    expect(sanitizeSettings({ idleStopSec: 5 }).idleStopSec).toBe(60);
  });
  it("mode defaults to intercom and accepts counter", () => {
    expect(DEFAULT_SETTINGS.mode).toBe("intercom");
    expect(sanitizeSettings({ mode: "counter" }).mode).toBe("counter");
    expect(sanitizeSettings({ mode: "x" }).mode).toBe("intercom");
  });
  it("default quick replies are real phrases", () => {
    for (const id of DEFAULT_SETTINGS.quickIds) expect(PHRASES.some((p) => p.id === id), id).toBe(true);
  });
  it("sanitizes pinned quick replies (max 4, unique, safe ids)", () => {
    const s = sanitizeSettings({ quickIds: ["yes", "yes", "no", "<x>", 3, "thanks", "hello", "card"] });
    expect(s.quickIds).toEqual(["yes", "no", "thanks", "hello"]);
  });
  it("pinning a 5th quick reply drops the oldest; pinning again unpins", () => {
    const four = ["a", "b", "c", "d"];
    expect(toggleQuick(four, "e")).toEqual(["b", "c", "d", "e"]);
    expect(toggleQuick(four, "b")).toEqual(["a", "c", "d"]);
  });
  it("keeps valid values", () => {
    const s = sanitizeSettings({ uiLang: "ru", convLang: "ky", fontSize: "xlarge", translate: false, maxSeconds: 30 });
    expect(s).toMatchObject({ uiLang: "ru", convLang: "ky", fontSize: "xlarge", translate: false, maxSeconds: 30 });
  });
});
