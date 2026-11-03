import { CONV_LANGS, UI_LANGS, type ConvLang, type UiLang } from "./types";

export type FontSize = "large" | "xlarge";
export type Sensitivity = "low" | "mid" | "high";

export type Settings = {
  uiLang: UiLang;
  convLang: ConvLang;
  fontSize: FontSize;
  translate: boolean;
  autoStop: boolean;
  continuous: boolean;
  sensitivity: Sensitivity;
  maxSeconds: 8 | 15 | 30;
  accessCode: string;
};

export const DEFAULT_SETTINGS: Settings = {
  uiLang: "ja",
  convLang: "ru",
  fontSize: "large",
  translate: true,
  autoStop: true,
  continuous: true,
  sensitivity: "mid",
  maxSeconds: 15,
  accessCode: "",
};

const KEY = "deafbridge.settings.v1";

/** 保存値を検証しつつ既定値とマージする（壊れた値・古い値に強くする） */
export function sanitizeSettings(raw: unknown): Settings {
  const s = { ...DEFAULT_SETTINGS };
  if (!raw || typeof raw !== "object") return s;
  const r = raw as Record<string, unknown>;
  if (UI_LANGS.includes(r.uiLang as UiLang)) s.uiLang = r.uiLang as UiLang;
  if (CONV_LANGS.includes(r.convLang as ConvLang)) s.convLang = r.convLang as ConvLang;
  if (r.fontSize === "large" || r.fontSize === "xlarge") s.fontSize = r.fontSize;
  if (typeof r.translate === "boolean") s.translate = r.translate;
  if (typeof r.autoStop === "boolean") s.autoStop = r.autoStop;
  if (typeof r.continuous === "boolean") s.continuous = r.continuous;
  if (r.sensitivity === "low" || r.sensitivity === "mid" || r.sensitivity === "high")
    s.sensitivity = r.sensitivity;
  if (r.maxSeconds === 8 || r.maxSeconds === 15 || r.maxSeconds === 30) s.maxSeconds = r.maxSeconds;
  if (typeof r.accessCode === "string") s.accessCode = r.accessCode.slice(0, 100);
  return s;
}

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    return sanitizeSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveSettings(s: Settings): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // プライベートブラウズ等で保存できなくても動作は続ける
  }
}
