/** 相手（インターフォンの向こう側）の言語 */
export type ConvLang = "ru" | "ky";
/** 画面表示（UI）の言語 */
export type UiLang = "ja" | "ru" | "ky";

export const CONV_LANGS: ConvLang[] = ["ru", "ky"];
export const UI_LANGS: UiLang[] = ["ja", "ru", "ky"];

/** 音声認識 API に渡す BCP-47 言語コード */
export const STT_LANG_CODE: Record<ConvLang, string> = {
  ru: "ru-RU",
  ky: "ky-KG",
};

export type TranscribeResult = {
  ok: true;
  text: string;
  /** 0〜1。プロバイダが返さない場合は null */
  confidence: number | null;
  alternatives: string[];
  /** 翻訳（UI 言語へ）。翻訳不要・不可の場合は null */
  translation: string | null;
  provider: "mock" | "google";
  /** サーバー処理時間 (ms) */
  elapsedMs: number;
};

export type TranscribeError = {
  ok: false;
  error:
    | "bad_request"
    | "unsupported_audio"
    | "too_large"
    | "too_long"
    | "unauthorized"
    | "rate_limited"
    | "provider_error";
  message: string;
};

export type StatusResponse = {
  provider: "mock" | "google";
  translation: boolean;
  accessCodeRequired: boolean;
  maxSeconds: number;
};
