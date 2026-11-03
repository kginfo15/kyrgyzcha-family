import { CONV_LANGS, UI_LANGS, type ConvLang, type UiLang } from "./types";

export type FontSize = "large" | "xlarge";
export type Sensitivity = "low" | "mid" | "high";

/** 利用者が自分で保存する返答（薬の名前など）。端末内にのみ保存。 */
export type MyPhrase = { id: string; text: string; lang: ConvLang };

export type Settings = {
  /** 画面の言語（キルギスのろう者向け: ky / ru） */
  uiLang: UiLang;
  /** 相手（インターフォンの向こう）の言語 */
  convLang: ConvLang;
  fontSize: FontSize;
  /** 相手の言葉を画面の言語に翻訳して表示（相手の言語と画面の言語が違うとき） */
  translate: boolean;
  /** 日本語補助表示（開発者・支援者の確認用） */
  jaAssist: boolean;
  /** 相手が話し始めた時・文字が出た時に画面を光らせる／振動 */
  visualAlert: boolean;
  autoStop: boolean;
  continuous: boolean;
  sensitivity: Sensitivity;
  maxSeconds: 8 | 15 | 30;
  accessCode: string;
  myPhrases: MyPhrase[];
};

export const DEFAULT_SETTINGS: Settings = {
  uiLang: "ky",
  convLang: "ru",
  fontSize: "large",
  translate: true,
  jaAssist: true,
  visualAlert: true,
  autoStop: true,
  continuous: true,
  sensitivity: "mid",
  maxSeconds: 15,
  accessCode: "",
  myPhrases: [],
};

export const MAX_MY_PHRASES = 30;
const KEY = "deafbridge.settings.v1";

/** 保存値を検証しつつ既定値とマージする（壊れた値・古い値に強くする） */
export function sanitizeSettings(raw: unknown): Settings {
  const s: Settings = { ...DEFAULT_SETTINGS, myPhrases: [] };
  if (!raw || typeof raw !== "object") return s;
  const r = raw as Record<string, unknown>;
  if (UI_LANGS.includes(r.uiLang as UiLang)) s.uiLang = r.uiLang as UiLang;
  // 旧バージョンの「表示言語=日本語」は、キルギス語表示＋日本語補助に移行
  if (r.uiLang === "ja") {
    s.uiLang = "ky";
    s.jaAssist = true;
  }
  if (CONV_LANGS.includes(r.convLang as ConvLang)) s.convLang = r.convLang as ConvLang;
  if (r.fontSize === "large" || r.fontSize === "xlarge") s.fontSize = r.fontSize;
  for (const k of ["translate", "jaAssist", "visualAlert", "autoStop", "continuous"] as const) {
    if (typeof r[k] === "boolean" && !(k === "jaAssist" && r.uiLang === "ja")) s[k] = r[k] as boolean;
  }
  if (r.sensitivity === "low" || r.sensitivity === "mid" || r.sensitivity === "high")
    s.sensitivity = r.sensitivity;
  if (r.maxSeconds === 8 || r.maxSeconds === 15 || r.maxSeconds === 30) s.maxSeconds = r.maxSeconds;
  if (typeof r.accessCode === "string") s.accessCode = r.accessCode.slice(0, 100);
  if (Array.isArray(r.myPhrases)) {
    s.myPhrases = r.myPhrases
      .filter(
        (p): p is MyPhrase =>
          !!p &&
          typeof p === "object" &&
          typeof (p as MyPhrase).id === "string" &&
          typeof (p as MyPhrase).text === "string" &&
          (p as MyPhrase).text.trim() !== "" &&
          CONV_LANGS.includes((p as MyPhrase).lang),
      )
      .slice(0, MAX_MY_PHRASES)
      .map((p) => ({ id: p.id.slice(0, 40), text: p.text.slice(0, 200), lang: p.lang }));
  }
  return s;
}

export function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(KEY);
    return sanitizeSettings(raw ? JSON.parse(raw) : null);
  } catch {
    return { ...DEFAULT_SETTINGS, myPhrases: [] };
  }
}

export function saveSettings(s: Settings): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // プライベートブラウズ等で保存できなくても動作は続ける
  }
}
