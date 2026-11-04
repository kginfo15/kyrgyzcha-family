import type { PlayMethod } from "@/lib/client/speak";
import type { ConvLang, TransLang } from "@/lib/types";

export type Screen = "home" | "listen" | "reply" | "settings";

/** 会話履歴の1件。メモリ上にのみ保持し、保存しない。 */
export type LogEntry = {
  id: number;
  who: "them" | "me";
  time: number;
  lang: ConvLang;
  status: "processing" | "done" | "empty" | "error";
  text: string;
  /** 相手の言葉の翻訳、または自分の返答の意味（画面の言語・日本語） */
  translations?: Partial<Record<TransLang, string>>;
  confidence?: number | null;
  alternatives?: string[];
  error?: string;
  method?: PlayMethod;
};

/** 相手に見せる全画面表示。sub は利用者・確認者向けの意味 */
export type ShowText = { text: string; sub?: string; ja?: string } | null;

/** 返答を再生するときの要求。meaning は履歴に残す意味（画面の言語・日本語） */
export type SpeakFn = (req: {
  text: string;
  lang: ConvLang;
  phraseId?: string;
  ruFallback?: string;
  meaning?: Partial<Record<TransLang, string>>;
}) => PlayMethod;
