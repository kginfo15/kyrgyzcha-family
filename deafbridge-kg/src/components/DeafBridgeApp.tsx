"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStatus, transcribe } from "@/lib/client/api";
import { blobToWav16k } from "@/lib/client/audio-convert";
import { play, preloadAudioManifest } from "@/lib/client/speak";
import { useListener } from "@/lib/client/useListener";
import { DICTS, JA, LANG_NAMES } from "@/lib/i18n";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "@/lib/settings";
import type { StatusResponse, TransLang } from "@/lib/types";
import HomeScreen from "./HomeScreen";
import { I18nProvider, Tx } from "./i18n-context";
import ListenScreen from "./ListenScreen";
import ReplyScreen from "./ReplyScreen";
import SettingsScreen from "./SettingsScreen";
import ShowTextOverlay from "./ShowTextOverlay";
import type { LogEntry, Screen, ShowText, SpeakFn } from "./types";
import { Icon, type IconName } from "./ui";

type PlayState = { phase: "playing" | "done"; text: string } | null;
type Notice = { k: "noVoiceFallback" | "noVoiceAtAll" } | null;

export default function DeafBridgeApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [micError, setMicError] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
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
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
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

  const listener = useListener({
    sensitivity: settings.sensitivity,
    autoStop: settings.autoStop,
    continuous: settings.continuous,
    maxSeconds: settings.maxSeconds,
    onSegment: handleSegment,
    onError: () => setMicError(true),
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
    setMicError(false);
    listener.start();
  }, [listener]);

  // ---- 返答の再生 ---------------------------------------------------------
  const speak: SpeakFn = useCallback(
    (req) => {
      setNotice(null);
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
        {
          id,
          who: "me",
          time: Date.now(),
          lang: req.lang,
          status: "done",
          text: req.text,
          translations: req.meaning,
          method,
        },
      ]);
      if (method === "none") {
        setNotice({ k: "noVoiceAtAll" });
        setShowText({ text: req.text, sub: req.meaning?.[settingsRef.current.uiLang], ja: req.meaning?.ja });
      } else {
        if (method === "tts-ru-fallback") setNotice({ k: "noVoiceFallback" });
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

  const clearLog = useCallback(() => setLog([]), []);

  const demo = status?.provider === "mock";
  const fsClass = settings.fontSize === "xlarge" ? "fs-xlarge" : "fs-large";

  const tabs: { id: Screen; k: "tabListen" | "tabReply" | "tabSettings"; icon: IconName }[] = [
    { id: "listen", k: "tabListen", icon: "ear" },
    { id: "reply", k: "tabReply", icon: "chat" },
    { id: "settings", k: "tabSettings", icon: "gear" },
  ];

  return (
    <I18nProvider uiLang={settings.uiLang} ja={settings.jaAssist}>
      <div className={`${fsClass} mx-auto flex min-h-dvh max-w-xl flex-col`}>
        <header className="pt-safe sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-line bg-bg/95 px-4 pb-2 backdrop-blur">
          <button
            type="button"
            onClick={() => setScreen("home")}
            className="text-lg font-black tracking-wide"
          >
            DeafBridge <span className="text-accent">KG</span>
          </button>
          <div className="flex items-center gap-2 text-sm font-bold">
            {demo && <span className="rounded-full bg-warn px-2 py-0.5 text-bg">{d.demo}</span>}
            <span className="rounded-full border border-line px-2 py-0.5">
              {LANG_NAMES[settings.convLang]}
            </span>
            {/* 日本語補助のクイック切替（確認用） */}
            <button
              type="button"
              aria-pressed={settings.jaAssist}
              aria-label={`${JA.jaAssist}: ${settings.jaAssist ? JA.on : JA.off}`}
              onClick={() => updateSettings({ jaAssist: !settings.jaAssist })}
              className={`rounded-full border-2 px-2 py-0.5 ${
                settings.jaAssist ? "border-accent bg-accent text-accent-fg" : "border-line text-muted"
              }`}
            >
              日本語
            </button>
          </div>
        </header>

        {/* 再生中・再生完了の表示（耳で確認できない代わり） */}
        {playState && (
          <div
            role="status"
            className={`sticky top-[calc(env(safe-area-inset-top)+3rem)] z-10 mx-4 mt-2 flex items-center gap-3 rounded-xl p-3 text-body font-bold ${
              playState.phase === "playing" ? "bg-ok text-bg" : "border-2 border-ok bg-surface"
            }`}
          >
            <Icon name="speaker" className={`h-7 w-7 shrink-0 ${playState.phase === "playing" ? "animate-pulse" : ""}`} />
            <span>
              <Tx k={playState.phase === "playing" ? "playing" : "playDone"} />
              {playState.phase === "playing" && (
                <span className="block text-sm font-normal">
                  <Tx k="silentHint" />
                </span>
              )}
            </span>
          </div>
        )}

        {!online && (
          <div role="status" className="bg-warn px-4 py-2 text-center font-bold text-bg">
            <Tx k="offline" />
          </div>
        )}
        {demo && screen !== "home" && (
          <div className="px-4 pt-2 text-sm text-muted">
            <Tx k="demoMode" />
          </div>
        )}
        {micError && (
          <div role="alert" className="mx-4 mt-3 rounded-xl bg-rec p-3 text-body font-bold text-rec-fg">
            <Tx k="errMic" />
          </div>
        )}
        {notice && (
          <div role="status" className="mx-4 mt-3 rounded-xl border-2 border-warn p-3 text-body font-bold">
            <Tx k={notice.k} />
          </div>
        )}

        <main className="flex-1 px-4 pb-32 pt-3">
          {screen === "home" && (
            <HomeScreen
              settings={settings}
              demo={demo}
              onChange={updateSettings}
              onStart={() => {
                setScreen("listen");
                startListening();
              }}
            />
          )}
          {screen === "listen" && (
            <ListenScreen
              settings={settings}
              log={log}
              listener={listener}
              onStart={startListening}
              onSpeak={speak}
              onShow={setShowText}
              onClear={clearLog}
              onGoReply={() => setScreen("reply")}
            />
          )}
          {screen === "reply" && (
            <ReplyScreen
              settings={settings}
              onChange={updateSettings}
              onSpeak={speak}
              onShow={setShowText}
              onGoListen={() => setScreen("listen")}
            />
          )}
          {screen === "settings" && (
            <SettingsScreen settings={settings} status={status} onChange={updateSettings} onSpeak={speak} />
          )}
        </main>

        {screen !== "home" && (
          <nav className="pb-safe fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface">
            <div className="mx-auto grid max-w-xl grid-cols-3">
              {tabs.map((t) => {
                const active = screen === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setScreen(t.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex flex-col items-center gap-0.5 py-2 text-sm font-bold ${
                      active ? "text-accent" : "text-muted"
                    }`}
                  >
                    <Icon name={t.icon} className="h-7 w-7" />
                    <span className="text-center">
                      <Tx k={t.k} />
                    </span>
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        {/* 画面フラッシュ（視覚通知） */}
        {flashKey > 0 && (
          <div
            key={flashKey}
            aria-hidden="true"
            className="flash pointer-events-none fixed inset-0 z-40 border-[14px] border-them-line bg-them-line/30"
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

