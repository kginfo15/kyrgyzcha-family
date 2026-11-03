"use client";

import { useEffect, useRef, useState } from "react";
import { categoryKey } from "@/lib/i18n";
import { PHRASE_CATEGORIES, PHRASES, phraseText, type Phrase, type PhraseCategory } from "@/lib/phrases";
import { MAX_MY_PHRASES, type MyPhrase, type Settings } from "@/lib/settings";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import { speakPhrase } from "./speak-phrase";
import type { ShowText, SpeakFn } from "./types";
import { Icon, Sheet } from "./ui";

type Cat = PhraseCategory | "mine";
const CATS: Cat[] = [...PHRASE_CATEGORIES, "mine"];
const CAT_ICONS: Record<Cat, string> = { basic: "💬", pharmacy: "💊", door: "🚪", mine: "⭐" };

export default function ReplySheet({
  settings,
  focusType,
  onChange,
  onSpeak,
  onShow,
  onClose,
}: {
  settings: Settings;
  focusType: boolean;
  onChange: (p: Partial<Settings>) => void;
  onSpeak: SpeakFn;
  onShow: (s: ShowText) => void;
  onClose: () => void;
}) {
  const { d } = useI18n();
  const [cat, setCat] = useState<Cat>("basic");
  const [custom, setCustom] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lang = settings.convLang;
  const ui = settings.uiLang;

  useEffect(() => {
    if (focusType) inputRef.current?.focus();
  }, [focusType]);

  // 返答したらパネルを閉じて、相手の反応（ステージ）が見えるようにする
  const sayPhrase = (p: Phrase) => {
    speakPhrase(onSpeak, p, settings);
    onClose();
  };
  const sayMine = (m: MyPhrase) => {
    onSpeak({ text: m.text, lang: m.lang });
    onClose();
  };

  const saveCustom = () => {
    const t = custom.trim();
    if (!t || settings.myPhrases.length >= MAX_MY_PHRASES) return;
    if (!settings.myPhrases.some((m) => m.text === t && m.lang === lang)) {
      onChange({
        myPhrases: [...settings.myPhrases, { id: `m${Date.now().toString(36)}`, text: t.slice(0, 200), lang }],
      });
    }
    setCustom("");
    setCat("mine");
  };

  const list = cat === "mine" ? [] : PHRASES.filter((p) => p.category === cat);

  const composer = (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = custom.trim();
        if (t) {
          onSpeak({ text: t, lang });
          onClose();
        }
      }}
    >
      <textarea
        id="custom-text"
        ref={inputRef}
        value={custom}
        onChange={(e) => setCustom(e.target.value)}
        placeholder={d.customPlaceholder}
        aria-label={d.customPlaceholder}
        rows={2}
        lang={lang}
        className="w-full resize-none rounded-2xl border border-line bg-surface p-3 text-reply placeholder:text-muted"
      />
      <div className="grid grid-cols-[1fr_auto_auto] gap-2">
        <button
          type="submit"
          disabled={!custom.trim()}
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-accent px-3 font-bold text-accent-fg disabled:opacity-40"
        >
          <Icon name="speaker" className="h-5 w-5 shrink-0" />
          <Tx k="speak" />
        </button>
        <button
          type="button"
          disabled={!custom.trim()}
          onClick={() => onShow({ text: custom.trim() })}
          aria-label={d.showToThem}
          title={d.showToThem}
          className="flex min-h-12 w-12 items-center justify-center rounded-xl bg-surface-2 disabled:opacity-40"
        >
          <Icon name="screen" className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={!custom.trim() || settings.myPhrases.length >= MAX_MY_PHRASES}
          onClick={saveCustom}
          aria-label={d.savePhrase}
          title={d.savePhrase}
          className="flex min-h-12 w-12 items-center justify-center rounded-xl bg-surface-2 text-xl disabled:opacity-40"
        >
          ⭐
        </button>
      </div>
    </form>
  );

  return (
    <Sheet title={<Tx k="replyTitle" />} onClose={onClose} closeLabel={d.close} footer={composer}>
      <div role="tablist" className="no-scrollbar -mx-5 mb-3 flex gap-2 overflow-x-auto px-5">
        {CATS.map((c) => (
          <button
            key={c}
            role="tab"
            type="button"
            aria-selected={cat === c}
            onClick={() => setCat(c)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-bold leading-tight ${
              cat === c ? "bg-fg text-bg" : "bg-surface-2 text-fg"
            }`}
          >
            <span aria-hidden="true">{CAT_ICONS[c]}</span>
            <Tx k={categoryKey(c)} />
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {list.map((p) => (
          <PhraseRow
            key={p.id}
            icon={p.icon}
            text={phraseText(p, lang)}
            textLang={lang}
            meaning={ui !== lang ? phraseText(p, ui) : undefined}
            ja={p.ja}
            onPlay={() => sayPhrase(p)}
            onShow={() =>
              onShow({ text: phraseText(p, lang), sub: ui !== lang ? phraseText(p, ui) : undefined, ja: p.ja })
            }
          />
        ))}
        {cat === "mine" && settings.myPhrases.length === 0 && (
          <li className="rounded-2xl border border-dashed border-line p-4 text-body text-muted">
            <Tx k="myPhrasesEmpty" />
          </li>
        )}
        {cat === "mine" &&
          settings.myPhrases.map((m) => (
            <PhraseRow
              key={m.id}
              icon="⭐"
              text={m.text}
              textLang={m.lang}
              onPlay={() => sayMine(m)}
              onShow={() => onShow({ text: m.text })}
              onDelete={() => onChange({ myPhrases: settings.myPhrases.filter((x) => x.id !== m.id) })}
            />
          ))}
      </ul>
    </Sheet>
  );
}

function PhraseRow({
  icon,
  text,
  textLang,
  meaning,
  ja,
  onPlay,
  onShow,
  onDelete,
}: {
  icon: string;
  text: string;
  textLang: string;
  meaning?: string;
  ja?: string;
  onPlay: () => void;
  onShow: () => void;
  onDelete?: () => void;
}) {
  const { d, uiLang } = useI18n();
  return (
    <li className="flex items-stretch overflow-hidden rounded-2xl border border-line bg-surface">
      <button type="button" onClick={onPlay} className="flex min-w-0 flex-1 items-center gap-3 p-3 text-left active:bg-surface-2">
        <span className="w-9 shrink-0 text-center text-3xl leading-none" aria-hidden="true">
          {icon}
        </span>
        <span className="flex min-w-0 flex-col [overflow-wrap:break-word]">
          <span className="text-reply font-bold" lang={textLang}>
            {text}
          </span>
          {meaning && (
            <span className="text-sm text-muted" lang={uiLang}>
              {meaning}
            </span>
          )}
          {ja && (
            <span className="text-sm text-muted">
              <JaGloss>{ja}</JaGloss>
            </span>
          )}
        </span>
      </button>
      <div className="flex shrink-0 flex-col border-l border-line">
        <button
          type="button"
          aria-label={d.showToThem}
          title={d.showToThem}
          onClick={onShow}
          className="flex flex-1 items-center justify-center px-3.5 text-muted active:bg-surface-2"
        >
          <Icon name="screen" className="h-5 w-5" />
        </button>
        {onDelete && (
          <button
            type="button"
            aria-label={d.deletePhrase}
            title={d.deletePhrase}
            onClick={onDelete}
            className="flex flex-1 items-center justify-center border-t border-line px-3.5 text-muted active:bg-surface-2"
          >
            <Icon name="trash" className="h-5 w-5" />
          </button>
        )}
      </div>
    </li>
  );
}
