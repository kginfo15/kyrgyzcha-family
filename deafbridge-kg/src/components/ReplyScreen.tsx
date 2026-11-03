"use client";

import { useState } from "react";
import type { PlayMethod, PlayRequest } from "@/lib/client/speak";
import { categoryLabel, type Dict } from "@/lib/i18n";
import { PHRASE_CATEGORIES, PHRASES, phraseText, type Phrase, type PhraseCategory } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import type { UiLang } from "@/lib/types";
import type { ShowText } from "./types";
import { Icon } from "./ui";

/** 定型文の意味を UI 言語で返す */
export function meaning(p: Phrase, ui: UiLang): string {
  return ui === "ja" ? p.ja : ui === "ru" ? p.ru : p.ky;
}

export default function ReplyScreen({
  d,
  settings,
  onSpeak,
  onShow,
  onGoListen,
}: {
  d: Dict;
  settings: Settings;
  onSpeak: (r: PlayRequest) => PlayMethod;
  onShow: (s: ShowText) => void;
  onGoListen: () => void;
}) {
  const [cat, setCat] = useState<PhraseCategory>("basic");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const lang = settings.convLang;

  const sayPhrase = (p: Phrase) => {
    setPlayingId(p.id);
    window.setTimeout(() => setPlayingId((cur) => (cur === p.id ? null : cur)), 2500);
    onSpeak({ text: phraseText(p, lang), lang, phraseId: p.id, ruFallback: p.ru });
  };

  const list = PHRASES.filter((p) => p.category === cat);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black">{d.replyTitle}</h1>
        <p className="text-body text-muted">{d.tapToPlay}</p>
      </div>

      <div role="tablist" className="grid grid-cols-3 gap-2">
        {PHRASE_CATEGORIES.map((c) => (
          <button
            key={c}
            role="tab"
            type="button"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`min-h-12 rounded-xl border-2 text-body font-bold ${
              cat === c ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"
            }`}
          >
            {categoryLabel(d, c)}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {list.map((p) => {
          const text = phraseText(p, lang);
          const playing = playingId === p.id;
          return (
            <li key={p.id} className="flex items-stretch gap-2">
              <button
                type="button"
                onClick={() => sayPhrase(p)}
                className={`flex flex-1 items-center gap-3 rounded-2xl border-2 p-4 text-left active:scale-[0.99] ${
                  playing
                    ? "border-ok bg-me"
                    : p.primary
                      ? "border-accent bg-surface"
                      : "border-line bg-surface"
                }`}
              >
                <Icon name="speaker" className={`h-7 w-7 shrink-0 ${playing ? "text-ok" : "text-accent"}`} />
                <span className="flex flex-col">
                  <span className="text-reply font-black" lang={lang}>
                    {text}
                  </span>
                  {settings.uiLang !== lang && (
                    <span className="text-body text-muted">{meaning(p, settings.uiLang)}</span>
                  )}
                  {playing && <span className="text-sm font-bold text-ok">{d.playing}</span>}
                </span>
              </button>
              <button
                type="button"
                aria-label={d.showToThem}
                title={d.showToThem}
                onClick={() => onShow({ text, sub: settings.uiLang !== lang ? meaning(p, settings.uiLang) : undefined })}
                className="flex w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-line bg-surface"
              >
                <Icon name="screen" className="h-7 w-7" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* ---- 自由入力（薬の名前など） ---- */}
      <form
        className="flex flex-col gap-2 rounded-2xl border-2 border-line bg-surface p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const t = custom.trim();
          if (t) onSpeak({ text: t, lang });
        }}
      >
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={d.customPlaceholder}
          rows={2}
          lang={lang}
          className="w-full resize-none rounded-xl border border-line bg-bg p-3 text-reply"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            disabled={!custom.trim()}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent font-bold text-accent-fg disabled:opacity-50"
          >
            <Icon name="speaker" />
            {d.speak}
          </button>
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => onShow({ text: custom.trim() })}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-line font-bold disabled:opacity-50"
          >
            <Icon name="screen" />
            {d.showToThem}
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={onGoListen}
        className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 border-accent text-xl font-black text-accent"
      >
        <Icon name="ear" />
        {d.goListen}
      </button>
    </div>
  );
}
