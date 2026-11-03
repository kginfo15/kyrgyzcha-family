"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import type { useListener } from "@/lib/client/useListener";
import type { Dict } from "@/lib/i18n";
import { findPhrase, phraseText } from "@/lib/phrases";
import type { Settings } from "@/lib/settings";
import { JaGloss, Tx, useI18n } from "./i18n-context";
import MicButton from "./MicButton";
import { sayClass, speakPhrase } from "./speak-phrase";
import type { LogEntry, ShowText, SpeakFn } from "./types";
import { Icon, TundukMark, type IconName } from "./icons";

type Listener = ReturnType<typeof useListener>;
export type PlayState = { phase: "playing" | "done"; text: string } | null;

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
  onShow,
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
  onShow: (s: ShowText) => void;
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

  const time = latest ? new Date(latest.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "";
  // 今どの段階か：1 スピーカーに近づける → 2 インターフォンを押す → 3 読んで返答
  const step: 1 | 2 | 3 = latest || speaking ? 3 : listening ? 2 : 1;
  // 状態表示は「何か起きている時」だけ（案内中は案内と赤い録音ボタンで分かる）
  const busy = speaking || !!playState || latest?.status === "processing" || (listening && step === 3);

  // ---- ステージに収まらない時は段階的に詰める（画面サイズ・言語・文の長さに関係なくスクロール不要に）
  const scRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState("");
  useEffect(() => {
    const on = () => setViewport(`${window.innerWidth}x${window.innerHeight}`);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  const fitKey = [step, latest?.id, latest?.status, busy, lastMine?.id, settings.fontSize, settings.jaAssist, ui, lang, viewport].join("|");
  // 内容や画面サイズが変わったら段階 0（普通の大きさ）からやり直す
  const [fitState, setFitState] = useState({ key: "", level: 0 });
  const fit = fitState.key === fitKey ? fitState.level : 0;
  // 書体の読み込みや文字の折り返しで大きさが変わったら測り直す（段階は戻さない）
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const el = scRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setTick((t) => t + 1));
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    document.fonts?.ready.then(() => setTick((t) => t + 1)).catch(() => {});
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => {
    const el = scRef.current;
    if (el && fit < 3 && el.scrollHeight > el.clientHeight + 1) {
      setFitState({ key: fitKey, level: fit + 1 });
    }
  }, [fitKey, fit, tick]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2.5 px-3 pb-safe">
      {/* ================= ステージ：相手の言葉 ================= */}
      <section
        className={`stage fit-${fit} relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[30px] border border-line p-4 transition-[background-color,box-shadow] duration-200 ${
          speaking ? "stage-speaking" : ""
        }`}
        aria-label={d.them}
      >
        {/* 透かし：トゥンドゥク */}
        <TundukMark mono className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 text-fg opacity-[0.03]" />

        <div className="relative flex items-start gap-2">
          <Stepper step={step} />
          {log.length > 0 && (
            <button
              type="button"
              onClick={onOpenHistory}
              aria-label={d.history}
              className="flex h-8 shrink-0 items-center gap-1 rounded-full border border-line bg-bg/40 px-2.5 text-xs font-bold text-muted"
            >
              <Icon name="history" className="h-3.5 w-3.5" />
              {log.length}
            </button>
          )}
        </div>
        {busy && (
          <div className="relative mt-2 flex">
            <StatusPill listening={listening} speaking={speaking} playState={playState} processing={latest?.status === "processing"} />
          </div>
        )}

        <div ref={scRef} className="no-scrollbar relative flex min-h-0 flex-1 flex-col overflow-y-auto py-2" aria-live="polite">
          {/* my-auto: 中央寄せしつつ、はみ出した時は上から読めるようにする */}
          <div className="my-auto">
            {!latest && <Guide step={step === 3 ? 2 : step} onIntro={() => sayId("app_info")} />}

            {latest?.status === "processing" && (
              <div className="flex flex-col gap-3" aria-label={d.processing}>
                <div className="shimmer h-9 w-4/5 rounded-xl bg-surface-2" />
                <div className="shimmer h-9 w-3/5 rounded-xl bg-surface-2" />
              </div>
            )}

            {latest?.status === "done" && (
              <div className="flex flex-col gap-2.5">
                <p className="eyebrow text-them">
                  <span className="mr-2 inline-block h-[3px] w-5 rounded-full bg-them align-middle" />
                  {d.them} · {time}
                </p>
                <p className={`say ${sayClass(latest.text)}`} lang={latest.lang}>
                  {latest.text}
                </p>
                {latest.translations?.[ui] && (
                  <p className="stage-trans text-reply font-semibold text-fg/80" lang={ui}>
                    {latest.translations[ui]}
                  </p>
                )}
                {latest.translations?.ja && (
                  <p className="stage-ja text-reply text-muted">
                    <JaGloss>{latest.translations.ja}</JaGloss>
                  </p>
                )}
                {latest.confidence != null && latest.confidence < 0.6 && (
                  <p className="w-fit rounded-full bg-warn/15 px-3 py-1 text-xs font-bold text-warn">
                    <Tx k="confidenceLow" /> · {Math.round(latest.confidence * 100)}%
                  </p>
                )}
              </div>
            )}

            {(latest?.status === "empty" || latest?.status === "error") && (
              <div className="flex flex-col items-start gap-3">
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
                  className="flex min-h-12 items-center gap-2 rounded-full bg-fg px-5 font-bold text-bg"
                >
                  <Icon name="repeat" className="h-5 w-5" />
                  <Tx k="askRepeat" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 直前の自分の返答（タップで相手に見せる） */}
        {lastMine && (
          <button
            type="button"
            onClick={() =>
              onShow({ text: lastMine.text, sub: lastMine.translations?.[ui], ja: lastMine.translations?.ja })
            }
            title={d.showToThem}
            className="relative ml-auto flex max-w-[88%] items-end gap-2 rounded-2xl rounded-br-md border border-[#2a3b66] bg-me px-3 py-2 text-right"
          >
            <span className="min-w-0">
              <span className="block text-sm font-bold" lang={lastMine.lang}>
                {lastMine.text}
              </span>
              {lastMine.translations?.ja && (
                <span className="block text-xs text-muted">
                  <JaGloss>{lastMine.translations.ja}</JaGloss>
                </span>
              )}
            </span>
            <Icon name="screen" className="mb-0.5 h-4 w-4 shrink-0 text-muted" />
          </button>
        )}
        <div className="relative">{toast}</div>
      </section>

      {/* ================= すぐ使う返答（返答一覧でピン留めしたもの） ================= */}
      <div className="grid grid-cols-2 gap-2">
        {settings.quickIds.slice(0, 4).map((id) => {
          const p = findPhrase(id);
          const mine = p ? undefined : settings.myPhrases.find((m) => m.id === id);
          if (!p && !mine) return null;
          const text = p ? phraseText(p, lang) : mine!.text;
          return (
            <button
              key={id}
              type="button"
              onClick={() => (p ? speakPhrase(onSpeak, p, settings) : onSpeak({ text: mine!.text, lang: mine!.lang }))}
              className="tile flex min-w-0 items-start gap-2.5 rounded-2xl border border-line p-2.5 text-left transition active:scale-[0.98]"
            >
              <span className="tile-icon flex shrink-0 items-center justify-center rounded-xl border border-them/25 bg-them/[0.08] text-them">
                <Icon name={(p?.icon ?? "star") as IconName} className="h-[55%] w-[55%]" />
              </span>
              <span className="flex min-w-0 flex-col">
                <span className="tile-text font-bold leading-tight [overflow-wrap:break-word]" lang={p ? lang : mine!.lang}>
                  {text}
                </span>
                {p && ui !== lang && (
                  <span className="tile-sub line-clamp-1 text-xs text-muted" lang={ui}>
                    {phraseText(p, ui)}
                  </span>
                )}
                {p && (
                  <span className="tile-sub line-clamp-1 text-xs text-muted">
                    <JaGloss>{p.ja}</JaGloss>
                  </span>
                )}
              </span>
            </button>
          );
        })}
      </div>

      {/* ================= 操作ドック ================= */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 pt-0.5">
        <DockButton icon="grid" k="allReplies" onClick={onOpenReplies} />
        <div className="flex flex-col items-center gap-1">
          <MicButton
            cta={step === 1}
            listening={listening}
            starting={listener.state === "starting"}
            level={levelToUnit(listener.level)}
            speaking={speaking}
            label={listening ? d.stopShort : d.startListening}
            onClick={() => (listening ? listener.stop(true) : onStart())}
          />
          <span className="dock-label text-center text-[0.72rem] font-extrabold leading-tight">
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
    <button type="button" onClick={onClick} className="group flex flex-col items-center gap-1 text-center">
      <span className="dock-btn flex items-center justify-center rounded-full border border-line bg-surface-2 transition group-active:scale-95">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <span className="dock-label text-[0.72rem] font-bold leading-tight text-fg/85">
        <Tx k={k} />
      </span>
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
  let cls = "border-line text-muted";
  let dot = "bg-muted";
  let k: keyof Dict = "ready";
  let sub: ReactNode = null;
  if (playState?.phase === "playing") {
    cls = "border-ok bg-ok text-bg";
    dot = "bg-bg pulse-dot";
    k = "playing";
    sub = <Tx k="silentHint" />;
  } else if (playState?.phase === "done") {
    cls = "border-ok/40 bg-ok/10 text-ok";
    dot = "bg-ok";
    k = "playDone";
  } else if (speaking) {
    cls = "border-them bg-them text-them-ink";
    dot = "bg-them-ink pulse-dot";
    k = "speakingNow";
  } else if (processing) {
    cls = "border-fg/30 bg-fg/10 text-fg";
    dot = "bg-fg pulse-dot";
    k = "processing";
  } else if (listening) {
    cls = "border-rec/50 bg-rec/10 text-rec";
    dot = "bg-rec pulse-dot";
    k = "nowListening";
  }
  return (
    <div
      role="status"
      className={`flex min-w-0 items-start gap-2 rounded-2xl border px-3 py-1.5 text-[0.8rem] font-extrabold leading-tight ${cls}`}
    >
      <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dot}`} />
      <span className="min-w-0">
        <Tx k={k} />
        {sub && <span className="status-sub block text-[0.7rem] font-medium opacity-90">{sub}</span>}
      </span>
    </div>
  );
}

const STEPS: { icon: IconName; k: keyof Dict }[] = [
  { icon: "phone-text", k: "stepShort1" },
  { icon: "bell", k: "stepShort2" },
  { icon: "eye", k: "stepShort3" },
];

/** 進行ステップ：今どこにいるかを常に表示（音が聞こえない利用者が流れを見失わないように） */
function Stepper({ step }: { step: 1 | 2 | 3 }) {
  return (
    <ol className="stepper flex min-w-0 flex-1 items-start" aria-label="steps">
      {STEPS.map((s, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <li key={s.k} className="relative flex min-w-0 flex-1 flex-col items-center gap-1 text-center" aria-current={active ? "step" : undefined}>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={`absolute left-[calc(50%+18px)] right-[calc(-50%+18px)] top-[15px] h-[2px] rounded-full ${
                  done ? "bg-them" : "bg-line"
                }`}
              />
            )}
            <span
              className={`relative flex h-[30px] w-[30px] items-center justify-center rounded-full border transition ${
                done
                  ? "border-them bg-them text-them-ink"
                  : active
                    ? "step-active border-them bg-them/10 text-them"
                    : "border-line text-muted"
              }`}
            >
              {done ? (
                <Icon name="check-mark" className="h-4 w-4" strokeWidth={2.6} />
              ) : (
                <Icon name={s.icon} className="h-4 w-4" />
              )}
            </span>
            <span className={`stepper-label whitespace-nowrap text-[0.72rem] font-bold leading-tight ${active ? "text-fg" : "text-muted"}`}>
              <Tx k={s.k} />
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** 相手が話す前の案内（ステップ1・2）と「耳が聞こえない」と伝えるボタン */
function Guide({ step, onIntro }: { step: 1 | 2; onIntro: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="min-w-0">
        <p className="eyebrow mb-1.5 text-them">
          <span className="mr-2 inline-block h-[3px] w-5 rounded-full bg-them align-middle" />
          {step} / 3
        </p>
        <p className="guide-title font-extrabold leading-tight">
          <Tx k={step === 1 ? "stepHold" : "step2Title"} />
        </p>
        <p className="guide-sub mt-1.5 text-sm leading-snug text-muted">
          <Tx k={step === 1 ? "step1Sub" : "step2Sub"} />
        </p>
      </div>
      <button
        type="button"
        onClick={onIntro}
        className="intro flex items-center gap-3 rounded-2xl border border-fg/20 bg-fg/[0.05] p-2.5 text-left"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-fg text-bg">
          <Icon name="ear-off" className="h-5 w-5" />
        </span>
        <span className="flex-1 text-[0.95rem] font-extrabold leading-snug">
          <Tx k="playIntro" />
        </span>
        <Icon name="speaker" className="h-5 w-5 shrink-0 text-them" />
      </button>
    </div>
  );
}
