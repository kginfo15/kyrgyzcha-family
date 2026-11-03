"use client";

import { useState } from "react";
import { categoryKey } from "@/lib/i18n";
import { PHRASE_CATEGORIES, PHRASES, phraseText, type Phrase, type PhraseCategory } from "@/lib/phrases";
import { MAX_MY_PHRASES, type MyPhrase, type Settings } from "@/lib/settings";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import { speakPhrase } from "./ListenScreen";
import type { ShowText, SpeakFn } from "./types";
import { Icon } from "./ui";

type Cat = PhraseCategory | "mine";
const CATS: Cat[] = [...PHRASE_CATEGORIES, "mine"];
const CAT_ICONS: Record<Cat, string> = { basic: "💬", pharmacy: "💊", door: "🚪", mine: "⭐" };

export default function ReplyScreen({
  settings,
  onChange,
  onSpeak,
  onShow,
  onGoListen,
}: {
  settings: Settings;
  onChange: (p: Partial<Settings>) => void;
  onSpeak: SpeakFn;
  onShow: (s: ShowText) => void;
  onGoListen: () => void;
}) {
  const { d } = useI18n();
  const [cat, setCat] = useState<Cat>("basic");
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const lang = settings.convLang;
  const ui = settings.uiLang;

  const flashPlaying = (id: string) => {
    setPlayingId(id);
    window.setTimeout(() => setPlayingId((cur) => (cur === id ? null : cur)), 2500);
  };

  const sayPhrase = (p: Phrase) => {
    flashPlaying(p.id);
    speakPhrase(onSpeak, p, settings);
  };

  const sayMine = (m: MyPhrase) => {
    flashPlaying(m.id);
    onSpeak({ text: m.text, lang: m.lang });
  };

  const saveCustom = () => {
    const t = custom.trim();
    if (!t || settings.myPhrases.length >= MAX_MY_PHRASES) return;
    if (settings.myPhrases.some((m) => m.text === t && m.lang === lang)) return;
    onChange({
      myPhrases: [...settings.myPhrases, { id: `m${Date.now().toString(36)}`, text: t.slice(0, 200), lang }],
    });
    setCustom("");
    setCat("mine");
  };

  const list = cat === "mine" ? [] : PHRASES.filter((p) => p.category === cat);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-black">
          <Tx k="replyTitle" />
        </h1>
        <p className="text-body text-muted">
          🔊 <Tx k="tapToPlay" />
        </p>
      </div>

      <div role="tablist" className="grid grid-cols-2 gap-2">
        {CATS.map((c) => (
          <button
            key={c}
            role="tab"
            type="button"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 px-2 text-body font-bold leading-tight ${
              cat === c ? "border-accent bg-accent text-accent-fg" : "border-line bg-surface"
            }`}
          >
            <span className="text-2xl" aria-hidden="true">
              {CAT_ICONS[c]}
            </span>
            <Tx k={categoryKey(c)} />
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-3">
        {list.map((p) => (
          <PhraseRow
            key={p.id}
            icon={p.icon}
            text={phraseText(p, lang)}
            textLang={lang}
            meaning={ui !== lang ? phraseText(p, ui) : undefined}
            ja={p.ja}
            primary={p.primary}
            playing={playingId === p.id}
            onPlay={() => sayPhrase(p)}
            onShow={() =>
              onShow({ text: phraseText(p, lang), sub: ui !== lang ? phraseText(p, ui) : undefined, ja: p.ja })
            }
          />
        ))}

        {cat === "mine" && settings.myPhrases.length === 0 && (
          <li className="rounded-2xl border-2 border-dashed border-line p-4 text-body text-muted">
            ⭐ <Tx k="myPhrasesEmpty" />
          </li>
        )}
        {cat === "mine" &&
          settings.myPhrases.map((m) => (
            <PhraseRow
              key={m.id}
              icon="⭐"
              text={m.text}
              textLang={m.lang}
              playing={playingId === m.id}
              onPlay={() => sayMine(m)}
              onShow={() => onShow({ text: m.text })}
              onDelete={() => onChange({ myPhrases: settings.myPhrases.filter((x) => x.id !== m.id) })}
            />
          ))}
      </ul>

      {/* ---- 自由入力（薬の名前など）。保存するとマイ返答になる ---- */}
      <form
        className="flex flex-col gap-2 rounded-2xl border-2 border-line bg-surface p-3"
        onSubmit={(e) => {
          e.preventDefault();
          const t = custom.trim();
          if (t) onSpeak({ text: t, lang });
        }}
      >
        <label className="text-sm font-bold text-muted">
          ✏️ <Tx k="customPlaceholder" />
        </label>
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          placeholder={d.customPlaceholder}
          aria-label={d.customPlaceholder}
          rows={2}
          lang={lang}
          className="w-full resize-none rounded-xl border border-line bg-bg p-3 text-reply"
        />
        <div className="grid grid-cols-2 gap-2">
          <button
            type="submit"
            disabled={!custom.trim()}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent px-2 font-bold text-accent-fg disabled:opacity-50"
          >
            <Icon name="speaker" className="h-6 w-6 shrink-0" />
            <Tx k="speak" />
          </button>
          <button
            type="button"
            disabled={!custom.trim()}
            onClick={() => onShow({ text: custom.trim() })}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl border-2 border-line px-2 font-bold disabled:opacity-50"
          >
            <Icon name="screen" className="h-6 w-6 shrink-0" />
            <Tx k="showToThem" />
          </button>
        </div>
        <button
          type="button"
          disabled={!custom.trim() || settings.myPhrases.length >= MAX_MY_PHRASES}
          onClick={saveCustom}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-accent px-2 font-bold text-accent disabled:opacity-50"
        >
          ⭐ <Tx k="savePhrase" />
        </button>
      </form>

      <button
        type="button"
        onClick={onGoListen}
        className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 border-accent text-xl font-black text-accent"
      >
        <Icon name="ear" className="h-7 w-7 shrink-0" />
        <Tx k="goListen" />
      </button>
    </div>
  );
}

function PhraseRow({
  icon,
  text,
  textLang,
  meaning,
  ja,
  primary,
  playing,
  onPlay,
  onShow,
  onDelete,
}: {
  icon: string;
  text: string;
  textLang: string;
  meaning?: string;
  ja?: string;
  primary?: boolean;
  playing: boolean;
  onPlay: () => void;
  onShow: () => void;
  onDelete?: () => void;
}) {
  const { d, uiLang } = useI18n();
  return (
    <li className="flex items-stretch gap-2">
      <button
        type="button"
        onClick={onPlay}
        className={`flex min-w-0 flex-1 items-center gap-3 rounded-2xl border-2 p-3 text-left active:scale-[0.99] ${
          playing ? "border-ok bg-me" : primary ? "border-accent bg-surface" : "border-line bg-surface"
        }`}
      >
        <span className="w-12 shrink-0 text-center text-4xl leading-none" aria-hidden="true">
          {icon}
        </span>
        <span className="flex min-w-0 flex-col [overflow-wrap:break-word]">
          <span className="text-reply font-black" lang={textLang}>
            {text}
          </span>
          {meaning && (
            <span className="text-body text-muted" lang={uiLang}>
              {meaning}
            </span>
          )}
          {ja && (
            <span className="text-body text-muted">
              <JaGloss>{ja}</JaGloss>
            </span>
          )}
          {playing && (
            <span className="text-sm font-bold text-ok">
              🔊 <Tx k="playing" />
            </span>
          )}
        </span>
      </button>
      <div className="flex w-16 shrink-0 flex-col gap-2">
        <button
          type="button"
          aria-label={d.showToThem}
          title={d.showToThem}
          onClick={onShow}
          className="flex flex-1 items-center justify-center rounded-2xl border-2 border-line bg-surface"
        >
          <Icon name="screen" className="h-7 w-7" />
        </button>
        {onDelete && (
          <button
            type="button"
            aria-label={d.deletePhrase}
            title={d.deletePhrase}
            onClick={onDelete}
            className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-line bg-surface text-muted"
          >
            <Icon name="trash" className="h-6 w-6" />
          </button>
        )}
      </div>
    </li>
  );
}
