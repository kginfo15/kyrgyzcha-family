"use client";

import type { useListener } from "@/lib/client/useListener";
import type { Dict } from "@/lib/i18n";
import { findPhrase, phraseText, type Phrase } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import type { LogEntry, ShowText, SpeakFn } from "./types";
import { Card, Icon } from "./ui";

type Listener = ReturnType<typeof useListener>;

const QUICK_IDS = ["repeat", "deaf", "buy_medicine", "open_door"];

/** 定型文を再生するときの共通処理（意味＝画面の言語と日本語も履歴に残す） */
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

export default function ListenScreen({
  settings,
  log,
  listener,
  onStart,
  onSpeak,
  onShow,
  onClear,
  onGoReply,
}: {
  settings: Settings;
  log: LogEntry[];
  listener: Listener;
  onStart: () => void;
  onSpeak: SpeakFn;
  onShow: (s: ShowText) => void;
  onClear: () => void;
  onGoReply: () => void;
}) {
  const latest = [...log].reverse().find((e) => e.who === "them");
  const history = [...log].reverse().filter((e) => e !== latest);
  const listening = listener.state === "listening";
  const lang = settings.convLang;
  const ui = settings.uiLang;

  const sayPhrase = (id: string) => {
    const p = findPhrase(id);
    if (p) speakPhrase(onSpeak, p, settings);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ---- 最初に「耳が聞こえない」ことを伝える ---- */}
      {log.length === 0 && (
        <button
          type="button"
          onClick={() => sayPhrase("app_info")}
          className="flex min-h-16 items-center gap-3 rounded-2xl border-2 border-accent bg-surface p-3 text-left text-body font-black"
        >
          <span className="text-4xl" aria-hidden="true">
            🧏
          </span>
          <span className="flex-1">
            <Tx k="playIntro" />
          </span>
          <Icon name="speaker" className="h-7 w-7 shrink-0 text-accent" />
        </button>
      )}

      {/* ---- 相手が話している（音が聞こえない利用者のための最重要表示） ---- */}
      {listening && listener.inSpeech && (
        <div
          role="status"
          className="flex items-center gap-3 rounded-2xl bg-them-line p-3 text-reply font-black text-black"
        >
          <span className="text-4xl" aria-hidden="true">
            🗣️
          </span>
          <Tx k="speakingNow" />
        </div>
      )}

      {/* ---- 最新の相手の発言（最も大きく表示） ---- */}
      <Card className="min-h-44 border-2 !border-them-line !bg-them">
        <div aria-live="polite" aria-atomic="true">
          {!latest && (
            <p className="text-body text-muted">
              <Tx k="emptyLog" />
            </p>
          )}
          {latest?.status === "processing" && (
            <p className="text-big font-bold text-muted">
              <Tx k="processing" />
            </p>
          )}
          {latest?.status === "done" && (
            <>
              <p className="flex items-start gap-1 text-xs font-bold uppercase text-muted">
                <span aria-hidden="true">🗣️</span>
                <Tx k="them" />
              </p>
              <p className="text-big font-black break-words" lang={latest.lang}>
                {latest.text}
              </p>
              {/* 画面の言語への翻訳（相手がロシア語で、画面がキルギス語の場合など） */}
              {latest.translations?.[ui] && (
                <p className="mt-2 text-reply font-bold" lang={ui}>
                  {latest.translations[ui]}
                </p>
              )}
              {latest.translations?.ja && (
                <p className="mt-2 text-reply">
                  <JaGloss>{latest.translations.ja}</JaGloss>
                </p>
              )}
              {latest.confidence != null && latest.confidence < 0.6 && (
                <p className="mt-2 inline-block rounded-lg bg-warn px-2 py-0.5 text-sm font-bold text-bg">
                  ⚠️ <Tx k="confidenceLow" /> ({Math.round(latest.confidence * 100)}%)
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
                ❓ <Tx k={latest.status === "empty" ? "noSpeech" : (latest.error as keyof Dict)} />
              </p>
              {latest.status === "empty" && (
                <p className="text-body">
                  <Tx k="noSpeechHint" />
                </p>
              )}
              <button
                type="button"
                onClick={() => sayPhrase("repeat")}
                className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-accent px-4 text-body font-bold text-accent-fg"
              >
                <span aria-hidden="true">🔁</span>
                <Tx k="askRepeat" />
              </button>
            </div>
          )}
        </div>
      </Card>

      {/* ---- 音量メーター：耳で確認できない代わりに「音を拾えているか」を目で見る ---- */}
      <LevelMeter listener={listener} />

      {/* ---- 録音操作 ---- */}
      {listening ? (
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            type="button"
            onClick={() => listener.stop(true)}
            className="rec-pulse flex min-h-20 items-center justify-center gap-2 rounded-2xl bg-rec px-4 text-xl font-black text-rec-fg"
          >
            <Icon name="stop" className="h-8 w-8 shrink-0" />
            <Tx k="stopListening" />
          </button>
          <button
            type="button"
            onClick={() => listener.stop(false)}
            className="min-h-20 rounded-2xl border-2 border-line bg-surface px-4 text-body font-bold"
          >
            <Tx k="stopNoSend" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onStart}
          disabled={listener.state === "starting"}
          className="flex min-h-20 items-center justify-center gap-3 rounded-2xl bg-accent px-4 text-2xl font-black text-accent-fg disabled:opacity-60"
        >
          <Icon name="mic" className="h-9 w-9 shrink-0" />
          <Tx k="startListening" />
        </button>
      )}
      {!listening && (
        <p className="text-center text-body text-muted">
          📱➡️🔊 <Tx k="holdNear" />
        </p>
      )}

      {/* ---- すぐ使う返答 ---- */}
      <div className={`grid gap-2 ${settings.fontSize === "xlarge" ? "grid-cols-1" : "grid-cols-1 min-[440px]:grid-cols-2"}`}>
        {QUICK_IDS.map((id) => {
          const p = findPhrase(id)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => sayPhrase(id)}
              className="flex min-h-20 min-w-0 items-start gap-2 rounded-xl border-2 border-line bg-surface p-3 text-left"
            >
              <span className="text-3xl leading-none" aria-hidden="true">
                {p.icon}
              </span>
              <span className="flex min-w-0 flex-col [overflow-wrap:break-word]">
                <span className="text-body font-black leading-tight" lang={lang}>
                  {phraseText(p, lang)}
                </span>
                {ui !== lang && (
                  <span className="text-sm text-muted" lang={ui}>
                    {phraseText(p, ui)}
                  </span>
                )}
                <span className="text-sm text-muted">
                  <JaGloss>{p.ja}</JaGloss>
                </span>
              </span>
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={onGoReply}
        className="flex min-h-16 items-center justify-center gap-2 rounded-2xl border-2 border-accent text-xl font-black text-accent"
      >
        <Icon name="chat" className="h-7 w-7 shrink-0" />
        <Tx k="goReply" />
      </button>

      {/* ---- 履歴（この画面を閉じると消える） ---- */}
      {history.length > 0 && (
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-body font-bold text-muted">
              <Tx k="history" />
            </h2>
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-bold text-muted"
            >
              <Icon name="trash" className="h-4 w-4" />
              <Tx k="clearLog" />
            </button>
          </div>
          {history.map((e) => (
            <HistoryItem key={e.id} e={e} onShow={onShow} />
          ))}
        </section>
      )}
    </div>
  );
}

function HistoryItem({ e, onShow }: { e: LogEntry; onShow: (s: ShowText) => void }) {
  const { uiLang } = useI18n();
  const mine = e.who === "me";
  const time = new Date(e.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return (
    <button
      type="button"
      onClick={() =>
        e.status === "done" &&
        onShow({ text: e.text, sub: e.translations?.[uiLang], ja: e.translations?.ja })
      }
      className={`rounded-xl border border-line p-3 text-left ${mine ? "ml-8 bg-me" : "mr-8 bg-surface"}`}
    >
      <span className="block text-xs font-bold text-muted">
        {mine ? "🙋 " : "🗣️ "}
        {mine ? <Tx k="me" /> : <Tx k="them" />} · {time}
      </span>
      <span className="block text-body font-bold" lang={e.lang}>
        {e.status === "processing" ? (
          <Tx k="processing" />
        ) : e.status === "empty" ? (
          <Tx k="noSpeech" />
        ) : e.status === "error" ? (
          <Tx k={e.error as keyof Dict} />
        ) : (
          e.text
        )}
      </span>
      {e.translations?.[uiLang] && e.lang !== uiLang && (
        <span className="block text-sm text-muted">{e.translations[uiLang]}</span>
      )}
      {e.translations?.ja && (
        <span className="block text-sm text-muted">
          <JaGloss>{e.translations.ja}</JaGloss>
        </span>
      )}
    </button>
  );
}

function LevelMeter({ listener }: { listener: Listener }) {
  const listening = listener.state === "listening";
  // RMS は小さい値なので見やすいよう対数的に伸ばす
  const toPct = (v: number) => Math.min(100, Math.max(0, (Math.log10(v + 1e-4) + 4) * 30));
  const pct = listening ? toPct(listener.level) : 0;
  const th = listening ? toPct(listener.threshold) : 0;
  return (
    <div aria-hidden={!listening}>
      <div className="relative h-6 overflow-hidden rounded-full bg-surface-2">
        <div
          className={`h-full rounded-full transition-[width] duration-75 ${
            listener.inSpeech ? "bg-ok" : "bg-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
        {listening && <div className="absolute inset-y-0 w-0.5 bg-fg/60" style={{ left: `${th}%` }} />}
      </div>
      {listening && (
        <p className="mt-1 flex justify-between text-body font-bold">
          <span className={`flex items-start gap-2 ${listener.inSpeech ? "text-ok" : "text-muted"}`}>
            <span aria-hidden="true">{listener.inSpeech ? "●" : "○"}</span>
            <Tx k={listener.inSpeech ? "soundDetected" : "waitingForVoice"} />
          </span>
          <span className="tabular-nums text-muted">{(listener.elapsedMs / 1000).toFixed(0)}s</span>
        </p>
      )}
    </div>
  );
}
