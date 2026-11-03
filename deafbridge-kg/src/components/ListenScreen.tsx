"use client";

import type { PlayRequest, PlayMethod } from "@/lib/client/speak";
import type { useListener } from "@/lib/client/useListener";
import type { Dict } from "@/lib/i18n";
import { findPhrase, PHRASES, phraseText } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import { meaning } from "./ReplyScreen";
import type { LogEntry, ShowText } from "./types";
import { Card, Icon } from "./ui";

type Listener = ReturnType<typeof useListener>;

const QUICK_IDS = ["repeat", "deaf", "buy_medicine", "open_door"];

export default function ListenScreen({
  d,
  settings,
  log,
  listener,
  onStart,
  onSpeak,
  onShow,
  onClear,
  onGoReply,
}: {
  d: Dict;
  settings: Settings;
  log: LogEntry[];
  listener: Listener;
  onStart: () => void;
  onSpeak: (r: PlayRequest) => PlayMethod;
  onShow: (s: ShowText) => void;
  onClear: () => void;
  onGoReply: () => void;
}) {
  const latest = [...log].reverse().find((e) => e.who === "them");
  const history = [...log].reverse().filter((e) => e !== latest);
  const listening = listener.state === "listening";
  const lang = settings.convLang;

  const sayPhrase = (id: string) => {
    const p = findPhrase(id);
    if (!p) return;
    onSpeak({ text: phraseText(p, lang), lang, phraseId: p.id, ruFallback: p.ru });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ---- 最新の相手の発言（最も大きく表示） ---- */}
      <Card className="min-h-44 border-2 !border-them-line !bg-them">
        <div aria-live="polite" aria-atomic="true">
          {!latest && <p className="text-body text-muted">{d.emptyLog}</p>}
          {latest?.status === "processing" && (
            <p className="text-big font-bold text-muted">{d.processing}</p>
          )}
          {latest?.status === "done" && (
            <>
              <p className="text-xs font-bold uppercase text-muted">{d.them}</p>
              <p className="text-big font-black break-words" lang={latest.lang}>
                {latest.text}
              </p>
              {latest.translation && (
                <p className="mt-2 text-reply font-bold" lang={settings.uiLang}>
                  {latest.translation}
                </p>
              )}
              {latest.confidence != null && latest.confidence < 0.6 && (
                <p className="mt-2 inline-block rounded-full bg-warn px-2 py-0.5 text-sm font-bold text-bg">
                  {d.confidenceLow} ({Math.round(latest.confidence * 100)}%)
                </p>
              )}
              {!!latest.alternatives?.length && (
                <ul className="mt-2 text-body text-muted">
                  {latest.alternatives.map((a) => (
                    <li key={a}>… {a}</li>
                  ))}
                </ul>
              )}
            </>
          )}
          {(latest?.status === "empty" || latest?.status === "error") && (
            <div className="flex flex-col gap-3">
              <p className="text-reply font-black">
                {latest.status === "empty" ? d.noSpeech : latest.error}
              </p>
              {latest.status === "empty" && <p className="text-body">{d.noSpeechHint}</p>}
              <button
                type="button"
                onClick={() => sayPhrase("repeat")}
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-body font-bold text-accent-fg"
              >
                <Icon name="speaker" />
                {d.askRepeat}
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ---- 音量メーター：耳で確認できない代わりに「音を拾えているか」を目で見る ---- */}
      <LevelMeter d={d} listener={listener} />

      {/* ---- 録音操作 ---- */}
      {listening ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => listener.stop(true)}
            className="rec-pulse flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-rec px-4 text-xl font-black text-rec-fg"
          >
            <Icon name="stop" className="h-8 w-8" />
            {d.stopListening}
          </button>
          <button
            type="button"
            onClick={() => listener.stop(false)}
            className="min-h-20 rounded-2xl border-2 border-line bg-surface px-4 text-body font-bold"
          >
            {d.stopNoSend}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={listener.state === "starting"}
          className="flex min-h-20 items-center justify-center gap-3 rounded-2xl bg-accent px-4 text-2xl font-black text-accent-fg disabled:opacity-60"
        >
          <Icon name="mic" className="h-9 w-9" />
          {d.startListening}
        </button>
      )}
      {!listening && <p className="text-center text-body text-muted">{d.holdNear}</p>}

      {/* ---- すぐ使う返答 ---- */}
      <div className={`grid gap-2 ${settings.fontSize === "xlarge" ? "grid-cols-1" : "grid-cols-2"}`}>
        {QUICK_IDS.map((id) => {
          const p = PHRASES.find((x) => x.id === id)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => sayPhrase(id)}
              className="flex min-h-20 flex-col items-start justify-center rounded-xl border-2 border-line bg-surface p-3 text-left"
            >
              <span className="text-body font-black leading-tight" lang={lang}>
                {phraseText(p, lang)}
              </span>
              {settings.uiLang !== lang && (
                <span className="text-sm text-muted">{meaning(p, settings.uiLang)}</span>
              )}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onGoReply}
        className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 border-accent text-xl font-black text-accent"
      >
        <Icon name="chat" />
        {d.goReply}
      </button>

      {/* ---- 履歴（この画面を閉じると消える） ---- */}
      {history.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-body font-bold text-muted">{d.history}</h2>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-muted"
            >
              <Icon name="trash" className="h-4 w-4" />
              {d.clearLog}
            </button>
          </div>
          {history.map((e) => (
            <HistoryItem key={e.id} e={e} d={d} onShow={onShow} />
          ))}
        </section>
      )}
    </div>
  );
}

function HistoryItem({ e, d, onShow }: { e: LogEntry; d: Dict; onShow: (s: ShowText) => void }) {
  const mine = e.who === "me";
  const time = new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const body =
    e.status === "processing"
      ? d.processing
      : e.status === "empty"
        ? d.noSpeech
        : e.status === "error"
          ? e.error
          : e.text;
  return (
    <button
      type="button"
      onClick={() => e.status === "done" && onShow({ text: e.text, sub: e.translation ?? undefined })}
      className={`rounded-xl border border-line p-3 text-left ${mine ? "ml-8 bg-me" : "mr-8 bg-surface"}`}
    >
      <span className="block text-xs font-bold text-muted">
        {mine ? d.me : d.them} · {time}
      </span>
      <span className="block text-body font-bold" lang={e.lang}>
        {body}
      </span>
      {e.translation && <span className="block text-sm text-muted">{e.translation}</span>}
    </button>
  );
}

function LevelMeter({ d, listener }: { d: Dict; listener: Listener }) {
  const listening = listener.state === "listening";
  // RMS は小さい値なので見やすいよう対数的に伸ばす
  const toPct = (v: number) => Math.min(100, Math.max(0, (Math.log10(v + 1e-4) + 4) * 30));
  const pct = listening ? toPct(listener.level) : 0;
  const th = listening ? toPct(listener.threshold) : 0;
  const label = !listening
    ? ""
    : listener.inSpeech
      ? d.soundDetected
      : d.waitingForVoice;
  return (
    <div aria-hidden={!listening}>
      <div className="relative h-6 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-[width] duration-75 ${
            listener.inSpeech ? "bg-ok" : "bg-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
        {listening && (
          <div className="absolute inset-y-0 w-0.5 bg-fg/60" style={{ left: `${th}%` }} />
        )}
      </div>
      {listening && (
        <p className="mt-1 flex justify-between text-body font-bold" role="status">
          <span className={listener.inSpeech ? "text-ok" : "text-muted"}>
            {listener.inSpeech ? "● " : "○ "}
            {label}
          </span>
          <span className="tabular-nums text-muted">{(listener.elapsedMs / 1000).toFixed(0)}s</span>
        </p>
      )}
    </div>
  );
}
