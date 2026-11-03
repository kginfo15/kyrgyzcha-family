import type { PlayMethod } from "@/lib/client/speak";
import type { ConvLang } from "@/lib/types";

export type Screen = "home" | "listen" | "reply" | "settings";

/** 会話履歴の1件。メモリ上にのみ保持し、保存しない。 */
export type LogEntry = {
  id: number;
  who: "them" | "me";
  time: number;
  lang: ConvLang;
  status: "processing" | "done" | "empty" | "error";
  text: string;
  translation?: string | null;
  confidence?: number | null;
  alternatives?: string[];
  error?: string;
  method?: PlayMethod;
};

export type ShowText = { text: string; sub?: string } | null;
