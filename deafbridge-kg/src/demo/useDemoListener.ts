"use client";

/**
 * お試しページ用の疑似マイク。
 * claude.ai 上のページではマイクが使えないため、「聞き取り中」になると
 * 数秒ごとに「相手が話す → 話し終わる」を自動で再現する。
 * 返り値の形は本物の useListener と同じ。
 */
import { useCallback, useEffect, useRef, useState } from "react";
import type { ListenerOptions, ListenerState } from "../lib/client/useListener";

export type { ListenerOptions, ListenerState };

const WAIT_MS = 3000; // 相手が話し始めるまで
const SPEAK_MS = 1800; // 相手が話している長さ
const TICK = 80;

export function useListener(opts: ListenerOptions) {
  const [state, setState] = useState<ListenerState>("idle");
  const [level, setLevel] = useState(0);
  const [inSpeech, setInSpeech] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });
  const timer = useRef<number | null>(null);
  const segStart = useRef(0);

  const clear = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };

  const run = useCallback(() => {
    clear();
    segStart.current = performance.now();
    let spoke = false;
    timer.current = window.setInterval(() => {
      const t = performance.now() - segStart.current;
      setElapsedMs(t);
      const speaking = t > WAIT_MS && t < WAIT_MS + SPEAK_MS;
      if (speaking && !spoke) {
        spoke = true;
        optsRef.current.onSpeechStart?.();
      }
      setInSpeech(speaking);
      setLevel(speaking ? 0.08 + Math.random() * 0.12 : 0.0003 + Math.random() * 0.0005);
      if (t >= WAIT_MS + SPEAK_MS + 900) {
        optsRef.current.onSegment(new Blob(), { hadSpeech: true, durationMs: t });
        if (optsRef.current.continuous) {
          segStart.current = performance.now();
          spoke = false;
        } else {
          clear();
          setState("idle");
          setLevel(0);
        }
      }
    }, TICK);
  }, []);

  const start = useCallback(async () => {
    setState("listening");
    run();
  }, [run]);

  const stop = useCallback((send: boolean) => {
    const wasSpeaking = performance.now() - segStart.current > WAIT_MS;
    clear();
    setState("idle");
    setLevel(0);
    setInSpeech(false);
    setElapsedMs(0);
    if (send && wasSpeaking) optsRef.current.onSegment(new Blob(), { hadSpeech: true, durationMs: 0 });
  }, []);

  useEffect(() => () => clear(), []);

  return { state, level, threshold: 0.03, inSpeech, elapsedMs, start, stop };
}
