"use client";

import type { ReactNode } from "react";
import type { useListener } from "@/lib/client/useListener";
import type { Dict } from "@/lib/i18n";
import { findPhrase, phraseText } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import MicButton from "./MicButton";
import { sayClass, speakPhrase } from "./speak-phrase";
import type { LogEntry, SpeakFn } from "./types";
import { Icon } from "./ui";

type Listener = ReturnType<typeof useListener>;
export type PlayState = { phase: "playing" | "done"; text: string } | null;

const QUICK_IDS = ["repeat", "deaf", "buy_medicine", "open_door"];

/** RMS（小さい値）を見やすい 0〜1 に */
function levelToUnit(v: number) {
  return Math.min(1, Math.max(0, (Math.log10(v + 1e-4) + 4) / 3.3));
}

export default function ConversationScreen({
  settings,
  log,
  listener,
  playState,
  toast,
  onStart,
  onSpeak,
  onOpenReplies,
  onOpenType,
  onOpenHistory,
}: {
  settings: Settings;
  log: LogEntry[];
  listener: Listener;
  playState: PlayState;
  toast: ReactNode;
  onStart: () => void;
  onSpeak: SpeakFn;
  onOpenReplies: () => void;
  onOpenType: () => void;
  onOpenHistory: () => void;
}) {
  const { d } = useI18n();
  const listening = listener.state === "listening";
  const speaking = listening && listener.inSpeech;
  const latestIdx = log.findLastIndex((e) => e.who === "them");
  const latest = latestIdx >= 0 ? log[latestIdx] : undefined;
  const lastMine = [...log].reverse().find((e, i) => e.who === "me" && log.length - 1 - i > latestIdx);
  const lang = settings.convLang;
  const ui = settings.uiLang;

  const sayId = (id: string) => {
    const p = findPhrase(id);
    if (p) speakPhrase(onSpeak, p, settings);
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 px-3 pb-safe">
      {/* ================= ステージ：相手の言葉 ================= */}
      <section
        className={`relative flex min-h-0 flex-1 flex-col rounded-[28px] border border-line p-4 transition-[background-color,box-shadow] duration-200 ${
          speaking ? "stage-speaking bg-them-soft" : "bg-surface"
        }`}
        aria-label={d.them}
      >
        <div className="flex items-center justify-between gap-2">
          <StatusPill listening={listening} speaking={speaking} playState={playState} processing={latest?.status === "processing"} />
          {log.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              aria-label={d.history}
              className="flex h-10 items-center gap-1.5 rounded-full bg-surface-2 px-3 text-sm font-bold text-muted"
            >
              <Icon name="history" className="h-4 w-4" />
              {log.length}
            </button>
          )}
        </div>

        <div className="no-scrollbar flex min-h-0 flex-1 flex-col overflow-y-auto py-3" aria-live="polite">
          {/* my-auto: 中央寄せしつつ、はみ出した時は上から読めるようにする */}
          <div className="my-auto">
          {!latest && <EmptyStage onIntro={() => sayId("app_info")} />}

          {latest?.status === "processing" && (
            <div className="flex flex-col gap-3" aria-label={d.processing}>
              <div className="shimmer h-10 w-4/5 rounded-xl bg-surface-2" />
              <div className="shimmer h-10 w-3/5 rounded-xl bg-surface-2" />
              <p className="text-body font-bold text-muted">
                <Tx k="processing" />
              </p>
            </div>
          )}

          {latest?.status === "done" && (
            <div className="flex flex-col gap-3">
              <p className={`say ${sayClass(latest.text)}`} lang={latest.lang}>
                {latest.text}
              </p>
              {latest.translations?.[ui] && (
                <p className="text-reply font-bold text-fg/85" lang={ui}>
                  {latest.translations[ui]}
                </p>
              )}
              {latest.translations?.ja && (
                <p className="text-reply text-muted">
                  <JaGloss>{latest.translations.ja}</JaGloss>
                </p>
              )}
              {latest.confidence != null && latest.confidence < 0.6 && (
                <p className="w-fit rounded-full bg-warn/15 px-3 py-1 text-sm font-bold text-warn">
                  <Tx k="confidenceLow" /> · {Math.round(latest.confidence * 100)}%
                </p>
              )}
            </div>
          )}

          {(latest?.status === "empty" || latest?.status === "error") && (
            <div className="flex flex-col items-start gap-4">
              <p className="text-2xl font-extrabold">
                <Tx k={latest.status === "empty" ? "noSpeech" : (latest.error as keyof Dict)} />
              </p>
              {latest.status === "empty" && (
                <p className="text-body text-muted">
                  <Tx k="noSpeechHint" />
                </p>
              )}
              <button
                type="button"
                onClick={() => sayId("repeat")}
                className="flex min-h-12 items-center gap-2 rounded-full bg-accent px-5 font-bold text-accent-fg"
              >
                <Icon name="speaker" className="h-5 w-5" />
                <Tx k="askRepeat" />
              </button>
            </div>
          )}
          </div>
        </div>

        {/* 直前の自分の返答 */}
        {lastMine && (
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-me px-3 py-2 text-right">
            <p className="text-sm font-bold" lang={lastMine.lang}>
              {lastMine.text}
            </p>
            {lastMine.translations?.ja && (
              <p className="text-xs text-muted">
                <JaGloss>{lastMine.translations.ja}</JaGloss>
              </p>
            )}
          </div>
        )}
        {toast}
      </section>

      {/* ================= すぐ使う返答 ================= */}
      <div className="grid grid-cols-2 gap-2">
        {QUICK_IDS.map((id) => {
          const p = findPhrase(id)!;
          return (
            <button
              key={id}
              type="button"
              onClick={() => speakPhrase(onSpeak, p, settings)}
              className="flex min-w-0 items-start gap-2 rounded-2xl border border-line bg-surface p-2.5 text-left active:scale-[0.98]"
            >
              <span className="text-2xl leading-none" aria-hidden="true">
                {p.icon}
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="text-[0.95rem] font-bold leading-tight [overflow-wrap:break-word]" lang={lang}>
                  {phraseText(p, lang)}
                </span>
                {ui !== lang && (
                  <span className="tile-sub line-clamp-1 text-xs text-muted" lang={ui}>
                    {phraseText(p, ui)}
                  </span>
                )}
                <span className="tile-sub line-clamp-1 text-xs text-muted">
                  <JaGloss>{p.ja}</JaGloss>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= 操作ドック ================= */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
        <DockButton icon="grid" k="allReplies" onClick={onOpenReplies} />
        <div className="flex flex-col items-center">
          <MicButton
            listening={listening}
            starting={listener.state === "starting"}
            level={levelToUnit(listener.level)}
            speaking={speaking}
            label={listening ? d.stopShort : d.startListening}
            onClick={() => (listening ? listener.stop(true) : onStart())}
          />
          <span className="mt-1 text-center text-xs font-bold leading-tight">
            <Tx k={listening ? "stopShort" : "startListening"} />
          </span>
        </div>
        {listening ? (
          <DockButton icon="close" k="cancel" onClick={() => listener.stop(false)} />
        ) : (
          <DockButton icon="keyboard" k="typeText" onClick={onOpenType} />
        )}
      </div>
    </div>
  );
}

function DockButton({ icon, k, onClick }: { icon: "grid" | "keyboard" | "close"; k: keyof Dict; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-h-[76px] flex-col items-center justify-center gap-1 rounded-2xl bg-surface-2 px-1 text-center text-xs font-bold leading-tight"
    >
      <Icon name={icon} className="h-6 w-6" />
      <Tx k={k} />
    </button>
  );
}

function StatusPill({
  listening,
  speaking,
  processing,
  playState,
}: {
  listening: boolean;
  speaking: boolean;
  processing: boolean;
  playState: PlayState;
}) {
  let cls = "bg-surface-2 text-muted";
  let dot = "bg-muted";
  let k: keyof Dict = "ready";
  let sub: ReactNode = null;
  if (playState?.phase === "playing") {
    cls = "bg-ok text-bg";
    dot = "bg-bg pulse-dot";
    k = "playing";
    sub = <Tx k="silentHint" />;
  } else if (playState?.phase === "done") {
    cls = "bg-ok/15 text-ok";
    dot = "bg-ok";
    k = "playDone";
  } else if (speaking) {
    cls = "bg-them text-them-ink";
    dot = "bg-them-ink pulse-dot";
    k = "speakingNow";
  } else if (processing) {
    cls = "bg-accent/15 text-accent";
    dot = "bg-accent pulse-dot";
    k = "processing";
  } else if (listening) {
    cls = "bg-rec/15 text-rec";
    dot = "bg-rec pulse-dot";
    k = "nowListening";
  }
  return (
    <div role="status" className={`flex min-w-0 items-start gap-2 rounded-2xl px-3 py-2 text-sm font-extrabold ${cls}`}>
      <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
      <span className="min-w-0">
        <Tx k={k} />
        {sub && <span className="block text-xs font-medium opacity-90">{sub}</span>}
      </span>
    </div>
  );
}

function EmptyStage({ onIntro }: { onIntro: () => void }) {
  const steps: { icon: string; k: keyof Dict }[] = [
    { icon: "📱", k: "stepHold" },
    { icon: "🔔", k: "stepRing" },
    { icon: "👀", k: "stepRead" },
  ];
  return (
    <div className="flex flex-col gap-5">
      <ol className="flex flex-col gap-3">
        {steps.map((s, i) => (
          <li key={s.k} className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xl">
              {s.icon}
            </span>
            <span className="text-reply font-bold">
              <span className="mr-1.5 text-muted tabular-nums">{i + 1}.</span>
              <Tx k={s.k} />
            </span>
          </li>
        ))}
      </ol>
      <button
        type="button"
        onClick={onIntro}
        className="flex items-center gap-3 rounded-2xl border border-accent/50 bg-accent/10 p-3 text-left"
      >
        <span className="text-3xl" aria-hidden="true">
          🧏
        </span>
        <span className="flex-1 text-body font-extrabold">
          <Tx k="playIntro" />
        </span>
        <Icon name="speaker" className="h-6 w-6 shrink-0 text-accent" />
      </button>
    </div>
  );
}
