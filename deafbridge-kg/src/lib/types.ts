/** 相手（インターフォンの向こう側）の言語 */
export type ConvLang = "ru" | "ky";
/**
 * 画面表示（UI）の言語。利用者はキルギスのろう者なので、キルギス語・ロシア語のみ。
 * 日本語は「日本語補助」（開発者・支援者の確認用）として別に重ねて表示する。
 */
export type UiLang = "ky" | "ru";
/** 翻訳先として扱える言語（ja は補助表示用） */
export type TransLang = "ky" | "ru" | "ja";

export const CONV_LANGS: ConvLang[] = ["ru", "ky"];
export const UI_LANGS: UiLang[] = ["ky", "ru"];
export const TRANS_LANGS: TransLang[] = ["ky", "ru", "ja"];

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
  /** 翻訳結果（要求された言語のうち、成功したもの） */
  translations: Partial<Record<TransLang, string>>;
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
