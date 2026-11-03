import { phraseText, type Phrase } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import type { SpeakFn } from "./types";

/** 定型文を再生する（意味＝画面の言語と日本語も履歴に残す） */
export function speakPhrase(onSpeak: SpeakFn, p: Phrase, settings: Settings) {
  const lang = settings.convLang;
  return onSpeak({
    text: phraseText(p, lang),
    lang,
    phraseId: p.id,
    ruFallback: p.ru,
    meaning: { [settings.uiLang]: phraseText(p, settings.uiLang), ja: p.ja },
  });
}

/** 文字数に応じた相手の言葉のサイズ */
export function sayClass(text: string): string {
  const n = text.length;
  return n <= 14 ? "say-xl" : n <= 32 ? "say-l" : n <= 70 ? "say-m" : "say-s";
}
