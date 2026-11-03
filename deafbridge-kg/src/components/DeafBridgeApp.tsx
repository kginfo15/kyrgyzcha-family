"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStatus, transcribe, translateText } from "@/lib/client/api";
import { blobToWav16k } from "@/lib/client/audio-convert";
import { play, preloadAudioManifest } from "@/lib/client/speak";
import { useListener } from "@/lib/client/useListener";
import { DICTS, JA, type Dict } from "@/lib/i18n";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "@/lib/settings";
import type { StatusResponse, TransLang } from "@/lib/types";
import ConversationScreen, { type PlayState } from "./ConversationScreen";
import HistorySheet from "./HistorySheet";
import { I18nProvider, Tx } from "./i18n-context";
import ReplySheet from "./ReplySheet";
import SettingsSheet from "./SettingsSheet";
import StaffTypeSheet from "./StaffTypeSheet";
import ShowTextOverlay from "./ShowTextOverlay";
import type { LogEntry, ShowText, SpeakFn } from "./types";
import { Icon, OrnamentBand, TundukMark } from "./icons";

type SheetName = "replies" | "type" | "settings" | "history" | "staff" | null;

export default function DeafBridgeApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [sheet, setSheet] = useState<SheetName>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [toastKey, setToastKey] = useState<keyof Dict | null>(null);
  const [showText, setShowText] = useState<ShowText>(null);
  const [online, setOnline] = useState(true);
  const [playState, setPlayState] = useState<PlayState>(null);
  const [flashKey, setFlashKey] = useState(0);
  const nextId = useRef(1);
  const resumeAfterPlay = useRef(false);

  const d = DICTS[settings.uiLang];
  const settingsRef = useRef(settings);
  useEffect(() => {
    settingsRef.current = settings;
  });

  // ---- 初期化 -----------------------------------------------------------
  useEffect(() => {
    // localStorage はクライアントでしか読めないため、マウント後に反映する
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSettings());
    setLoaded(true);
    setOnline(navigator.onLine);
    fetchStatus().then(setStatus);
    preloadAudioManifest();
    if (
      "serviceWorker" in navigator &&
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PUBLIC_STATIC_DEMO !== "1"
    ) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => {
      window.removeEventListener("online", on);
      window.removeEventListener("offline", off);
    };
  }, []);

  useEffect(() => {
    if (loaded) saveSettings(settings);
    document.documentElement.lang = settings.uiLang;
  }, [settings, loaded]);

  // お知らせは数秒で消す
  useEffect(() => {
    if (!toastKey || toastKey === "errMic") return;
    const t = window.setTimeout(() => setToastKey(null), 5000);
    return () => window.clearTimeout(t);
  }, [toastKey]);

  const updateSettings = useCallback((patch: Partial<Settings>) => {
    setSettings((s) => ({ ...s, ...patch }));
  }, []);

  const patchEntry = useCallback((id: number, patch: Partial<LogEntry>) => {
    setLog((l) => l.map((e) => (e.id === id ? { ...e, ...patch } : e)));
  }, []);

  // ---- 視覚通知（ろう者は音で気づけないため、光と振動で知らせる） -------------
  const alertUser = useCallback((pattern: number | number[]) => {
    if (!settingsRef.current.visualAlert) return;
    setFlashKey((k) => k + 1);
    try {
      navigator.vibrate?.(pattern); // iPhone の Safari は未対応（Android のみ振動）
    } catch {
      /* noop */
    }
  }, []);

  // ---- 録音セグメント → 文字化 -------------------------------------------
  const handleSegment = useCallback(
    async (blob: Blob) => {
      const s = settingsRef.current;
      const id = nextId.current++;
      setLog((l) => [
        ...l,
        { id, who: "them", time: Date.now(), lang: s.convLang, status: "processing", text: "" },
      ]);
      let wav: Blob;
      try {
        wav = await blobToWav16k(blob);
      } catch {
        patchEntry(id, { status: "error", error: "errGeneric" });
        return;
      }
      // 翻訳先: 画面の言語（相手の言語と違う場合）＋ 日本語補助
      const targets: TransLang[] = [];
      if (s.translate && s.uiLang !== s.convLang) targets.push(s.uiLang);
      if (s.jaAssist) targets.push("ja");
      const r = await transcribe(wav, s.convLang, targets, s.accessCode);
      if (r.ok) {
        patchEntry(id, {
          status: r.text ? "done" : "empty",
          text: r.text,
          translations: r.translations,
          confidence: r.confidence,
          alternatives: r.alternatives,
        });
        if (r.text) alertUser([120, 80, 120]);
      } else {
        const key =
          r.error === "unauthorized"
            ? "errUnauthorized"
            : r.error === "rate_limited"
              ? "errRateLimited"
              : r.message === "network"
                ? "errNetwork"
                : "errGeneric";
        patchEntry(id, { status: "error", error: key });
      }
    },
    [patchEntry, alertUser],
  );

  // ---- 対面モード：相手が手で書いた文 ---------------------------------------
  const handleStaffText = useCallback(
    async (text: string) => {
      const s = settingsRef.current;
      const id = nextId.current++;
      setLog((l) => [...l, { id, who: "them", time: Date.now(), lang: s.convLang, status: "done", text, translations: {} }]);
      alertUser([120, 80, 120]);
      const targets: TransLang[] = [];
      if (s.translate && s.uiLang !== s.convLang) targets.push(s.uiLang);
      if (s.jaAssist) targets.push("ja");
      const translations = await translateText(text, s.convLang, targets, s.accessCode);
      patchEntry(id, { translations });
    },
    [alertUser, patchEntry],
  );

  const listener = useListener({
    sensitivity: settings.sensitivity,
    autoStop: settings.autoStop,
    continuous: settings.continuous,
    maxSeconds: settings.maxSeconds,
    onSegment: handleSegment,
    onError: () => setToastKey("errMic"),
    onSpeechStart: () => alertUser(60),
  });

  // 聞き取り中は画面が消えないようにする（対応ブラウザのみ）
  useEffect(() => {
    if (listener.state !== "listening" || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    navigator.wakeLock.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, [listener.state]);

  const startListening = useCallback(() => {
    setToastKey(null);
    listener.start();
  }, [listener]);

  // ---- 返答の再生 ---------------------------------------------------------
  const speak: SpeakFn = useCallback(
    (req) => {
      setToastKey(null);
      // iPhone ではマイク使用中に再生すると受話口から小さく鳴ることがあるため、
      // 再生の間はマイクを止め、終わったら聞き取りを再開する。
      const wasListening = listener.state === "listening";
      if (wasListening) {
        listener.stop(false);
        resumeAfterPlay.current = true;
      }
      const { method, done } = play(req);
      const id = nextId.current++;
      setLog((l) => [
        ...l,
        { id, who: "me", time: Date.now(), lang: req.lang, status: "done", text: req.text, translations: req.meaning, method },
      ]);
      if (method === "none") {
        setToastKey("noVoiceAtAll");
        setShowText({ text: req.text, sub: req.meaning?.[settingsRef.current.uiLang], ja: req.meaning?.ja });
      } else {
        if (method === "tts-ru-fallback") setToastKey("noVoiceFallback");
        // ろう者は音が出たか耳で確認できないため、再生中・再生完了を画面に出す
        setPlayState({ phase: "playing", text: req.text });
      }
      done.then(() => {
        setPlayState((p) => (p && p.text === req.text ? { phase: "done", text: req.text } : p));
        window.setTimeout(() => setPlayState((p) => (p?.phase === "done" ? null : p)), 2500);
        if (resumeAfterPlay.current) {
          resumeAfterPlay.current = false;
          window.setTimeout(() => listener.start(), 300);
        }
      });
      return method;
    },
    [listener],
  );

  const demo = status?.provider === "mock";
  const fsClass = settings.fontSize === "xlarge" ? "fs-xlarge" : "fs-large";
  const closeSheet = useCallback(() => setSheet(null), []);

  const toast = (
    <>
      {!online && (
        <p role="status" className="mt-2 rounded-xl bg-warn/15 px-3 py-2 text-sm font-bold text-warn">
          <Tx k="offline" />
        </p>
      )}
      {toastKey && (
        <p
          role={toastKey === "errMic" ? "alert" : "status"}
          className={`mt-2 rounded-xl px-3 py-2 text-sm font-bold ${
            toastKey === "errMic" ? "bg-rec text-rec-fg" : "bg-warn/15 text-warn"
          }`}
        >
          <Tx k={toastKey} />
        </p>
      )}
    </>
  );

  return (
    <I18nProvider uiLang={settings.uiLang} ja={settings.jaAssist}>
      <div className={`${fsClass} mx-auto flex h-full max-w-xl flex-col overflow-hidden`}>
        {/* ---------------- ヘッダー ---------------- */}
        <header className="pt-safe flex items-center gap-2 px-4 pb-2">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <TundukMark className="h-8 w-8 shrink-0" />
            <div className="flex min-w-0 flex-col leading-none">
              <span className="brand text-[1rem]">DeafBridge</span>
              <span className="mt-1 whitespace-nowrap text-[0.6rem] font-extrabold tracking-[0.18em] text-muted">
                <span className="hidden min-[390px]:inline">KYRGYZSTAN</span>
                <span className="min-[390px]:hidden">KG</span>
                {demo && <span className="text-warn"> · DEMO</span>}
              </span>
            </div>
          </div>
          {/* 相手の言語のクイック切替 */}
          <button
            type="button"
            onClick={() => updateSettings({ convLang: settings.convLang === "ru" ? "ky" : "ru" })}
            aria-label={`${d.convLang}: ${settings.convLang === "ru" ? "Русский" : "Кыргызча"}`}
            className="flex h-9 items-center gap-1 rounded-full bg-surface-2 px-2.5 text-sm font-extrabold"
          >
            <Icon name="swap" className="h-4 w-4 text-muted" />
            {settings.convLang === "ru" ? "RU" : "KY"}
          </button>
          {/* 日本語補助のクイック切替（確認用） */}
          <button
            type="button"
            aria-pressed={settings.jaAssist}
            aria-label={`${JA.jaAssist}: ${settings.jaAssist ? JA.on : JA.off}`}
            onClick={() => updateSettings({ jaAssist: !settings.jaAssist })}
            className={`h-9 rounded-full px-2.5 text-sm font-extrabold ${
              settings.jaAssist ? "bg-fg text-bg" : "bg-surface-2 text-muted"
            }`}
          >
            日本語
          </button>
          <button
            type="button"
            onClick={() => setSheet("settings")}
            aria-label={d.settingsTitle}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2"
          >
            <Icon name="gear" className="h-5 w-5" />
          </button>
        </header>

        <OrnamentBand className="mb-2 opacity-70" />

        {/* 使う場面の切り替え：インターフォン / 対面（窓口） */}
        <div role="tablist" aria-label={d.convLang} className="mode-tabs mx-3 mb-2.5 grid grid-cols-2 gap-1 rounded-full border border-line bg-surface p-1">
          {(["intercom", "counter"] as const).map((m) => {
            const active = settings.mode === m;
            return (
              <button
                key={m}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => updateSettings({ mode: m })}
                className={`flex min-h-9 items-center justify-center gap-2 rounded-full px-2 text-[0.8rem] font-extrabold leading-tight transition ${
                  active ? "bg-fg text-bg" : "text-muted"
                }`}
              >
                <Icon name={m === "intercom" ? "bell" : "facing"} className="h-4 w-4 shrink-0" />
                <span className="mode-label whitespace-nowrap">
                  <Tx k={m === "intercom" ? "modeIntercom" : "modeCounter"} />
                </span>
              </button>
            );
          })}
        </div>

        <ConversationScreen
          settings={settings}
          log={log}
          listener={listener}
          playState={playState}
          toast={toast}
          onStart={startListening}
          onSpeak={speak}
          onOpenReplies={() => setSheet("replies")}
          onOpenType={() => setSheet("type")}
          onOpenHistory={() => setSheet("history")}
          onShow={setShowText}
          onOpenStaffType={() => setSheet("staff")}
        />

        {(sheet === "replies" || sheet === "type") && (
          <ReplySheet
            settings={settings}
            focusType={sheet === "type"}
            onChange={updateSettings}
            onSpeak={speak}
            onShow={setShowText}
            onClose={closeSheet}
          />
        )}
        {sheet === "settings" && (
          <SettingsSheet settings={settings} status={status} onChange={updateSettings} onSpeak={speak} onClose={closeSheet} />
        )}
        {sheet === "staff" && (
          <StaffTypeSheet lang={settings.convLang} onSubmit={handleStaffText} onClose={closeSheet} />
        )}
        {sheet === "history" && (
          <HistorySheet log={log} onShow={setShowText} onClear={() => setLog([])} onClose={closeSheet} />
        )}

        {/* 画面フラッシュ（視覚通知） */}
        {flashKey > 0 && (
          <div
            key={flashKey}
            aria-hidden="true"
            className="flash pointer-events-none fixed inset-0 z-[60] border-[10px] border-them bg-them/20"
          />
        )}

        {showText && (
          <ShowTextOverlay
            text={showText.text}
            sub={showText.sub}
            ja={settings.jaAssist ? showText.ja : undefined}
            closeLabel={d.close}
            onClose={() => setShowText(null)}
          />
        )}
      </div>
    </I18nProvider>
  );
}
