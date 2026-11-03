"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fetchStatus, transcribe } from "@/lib/client/api";
import { blobToWav16k } from "@/lib/client/audio-convert";
import { play, preloadAudioManifest, type PlayRequest } from "@/lib/client/speak";
import { useListener } from "@/lib/client/useListener";
import { DICTS, LANG_NAMES } from "@/lib/i18n";
import { DEFAULT_SETTINGS, loadSettings, saveSettings, type Settings } from "@/lib/settings";
import type { StatusResponse } from "@/lib/types";
import HomeScreen from "./HomeScreen";
import ListenScreen from "./ListenScreen";
import ReplyScreen from "./ReplyScreen";
import SettingsScreen from "./SettingsScreen";
import ShowTextOverlay from "./ShowTextOverlay";
import type { LogEntry, Screen, ShowText } from "./types";
import { Icon, type IconName } from "./ui";

export default function DeafBridgeApp() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showText, setShowText] = useState<ShowText>(null);
  const [online, setOnline] = useState(true);
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
        patchEntry(id, { status: "error", error: DICTS[s.uiLang].errGeneric });
        return;
      }
      const ui = s.translate && s.uiLang !== s.convLang ? s.uiLang : null;
      const r = await transcribe(wav, s.convLang, ui, s.accessCode);
      const dd = DICTS[s.uiLang];
      if (r.ok) {
        patchEntry(id, {
          status: r.text ? "done" : "empty",
          text: r.text,
          translation: r.translation,
          confidence: r.confidence,
          alternatives: r.alternatives,
        });
      } else {
        const msg =
          r.error === "unauthorized"
            ? dd.errUnauthorized
            : r.error === "rate_limited"
              ? dd.errRateLimited
              : r.message === "network"
                ? dd.errNetwork
                : dd.errGeneric;
        patchEntry(id, { status: "error", error: msg });
      }
    },
    [patchEntry],
  );

  const listener = useListener({
    sensitivity: settings.sensitivity,
    autoStop: settings.autoStop,
    continuous: settings.continuous,
    maxSeconds: settings.maxSeconds,
    onSegment: handleSegment,
    onError: () => setError(d.errMic),
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
    setError(null);
    listener.start();
  }, [listener]);

  // ---- 返答の再生 ---------------------------------------------------------
  const speak = useCallback(
    (req: PlayRequest) => {
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
        { id, who: "me", time: Date.now(), lang: req.lang, status: "done", text: req.text, method },
      ]);
      if (method === "none") {
        setNotice(d.noVoiceAtAll);
        setShowText({ text: req.text });
      } else if (method === "tts-ru-fallback") {
        setNotice(d.noVoiceFallback);
      }
      done.then(() => {
        if (resumeAfterPlay.current) {
          resumeAfterPlay.current = false;
          window.setTimeout(() => listener.start(), 300);
        }
      });
      return method;
    },
    [listener, d],
  );

  const clearLog = useCallback(() => setLog([]), []);

  const demo = status?.provider === "mock";
  const fsClass = settings.fontSize === "xlarge" ? "fs-xlarge" : "fs-large";

  const tabs: { id: Screen; label: string; icon: IconName }[] = [
    { id: "listen", label: d.tabListen, icon: "ear" },
    { id: "reply", label: d.tabReply, icon: "chat" },
    { id: "settings", label: d.tabSettings, icon: "gear" },
  ];

  return (
    <div className={`${fsClass} mx-auto flex min-h-dvh max-w-xl flex-col`}>
      <header className="pt-safe sticky top-0 z-10 flex items-center justify-between gap-2 border-b border-line bg-bg/95 px-4 pb-2 backdrop-blur">
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
        </div>
      </header>

      {!online && (
        <div role="status" className="bg-warn px-4 py-2 text-center font-bold text-bg">
          {d.offline}
        </div>
      )}
      {demo && screen !== "home" && (
        <div className="px-4 pt-2 text-sm text-muted">{d.demoMode}</div>
      )}
      {error && (
        <div role="alert" className="mx-4 mt-3 rounded-xl bg-rec p-3 text-body font-bold text-rec-fg">
          {error}
        </div>
      )}
      {notice && (
        <div role="status" className="mx-4 mt-3 rounded-xl border-2 border-warn p-3 text-body font-bold">
          {notice}
        </div>
      )}

      <main className="flex-1 px-4 pb-28 pt-3">
        {screen === "home" && (
          <HomeScreen
            d={d}
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
            d={d}
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
            d={d}
            settings={settings}
            onSpeak={speak}
            onShow={setShowText}
            onGoListen={() => setScreen("listen")}
          />
        )}
        {screen === "settings" && (
          <SettingsScreen
            d={d}
            settings={settings}
            status={status}
            onChange={updateSettings}
            onSpeak={speak}
          />
        )}
      </main>

      {screen !== "home" && (
        <nav className="pb-safe fixed inset-x-0 bottom-0 z-10 border-t border-line bg-surface">
          <div className="mx-auto grid max-w-xl grid-cols-3">
            {tabs.map((t) => {
              const active = screen === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setScreen(t.id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 py-2 text-sm font-bold ${
                    active ? "text-accent" : "text-muted"
                  }`}
                >
                  <Icon name={t.icon} className="h-7 w-7" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </nav>
      )}

      {showText && (
        <ShowTextOverlay
          text={showText.text}
          sub={showText.sub}
          closeLabel={d.close}
          onClose={() => setShowText(null)}
        />
      )}
    </div>
  );
}
