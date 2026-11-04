"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Sensitivity } from "../settings";
import { setAudioSession } from "./audio-session";
import { Vad, VAD_PRESETS } from "./vad";

export type ListenerOptions = {
  sensitivity: Sensitivity;
  /** 声が途切れたら自動でセグメントを確定する */
  autoStop: boolean;
  /** 確定後も聞き取りを続ける */
  continuous: boolean;
  maxSeconds: number;
  /** 確定した録音。hadSpeech=false は手動停止で声が検出されなかった場合 */
  onSegment: (blob: Blob, info: { hadSpeech: boolean; durationMs: number }) => void;
  onError?: (e: unknown) => void;
  /** 相手が話し始めた瞬間（画面フラッシュ等の視覚通知用） */
  onSpeechStart?: () => void;
};

export type ListenerState = "idle" | "starting" | "listening";

/** 発話のない待ち受けが続いたら、録音を捨てて新しく始め直す間隔 */
const IDLE_RECYCLE_MS = 8000;
const TICK_MS = 50;

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm", "audio/ogg;codecs=opus"];
  return candidates.find((t) => MediaRecorder.isTypeSupported?.(t));
}

/**
 * マイクで待ち受け、発話区間ごとに録音 Blob を返すフック。
 *
 * 「インターフォンを押した直後に相手が話し始めると最初の言葉を取り逃がす」問題への対策として、
 * 聞き取り開始と同時に録音を始めておき（待ち受け）、声を検出したセグメントだけを送信する。
 * 声のない録音は送らないので API 費用もかからない。
 */
export function useListener(opts: ListenerOptions) {
  const [state, setState] = useState<ListenerState>("idle");
  const [level, setLevel] = useState(0);
  const [threshold, setThreshold] = useState(0);
  const [inSpeech, setInSpeech] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const optsRef = useRef(opts);
  useEffect(() => {
    optsRef.current = opts;
  });

  const ctxRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);
  const vadRef = useRef<Vad | null>(null);
  const segStartRef = useRef(0);
  const stoppingRef = useRef(false);

  const release = useCallback(() => {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    timerRef.current = null;
    sourceRef.current?.disconnect();
    sourceRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    recorderRef.current = null;
    setLevel(0);
    setInSpeech(false);
    setElapsedMs(0);
    setState("idle");
  }, []);

  const startSegment = useCallback(() => {
    const stream = streamRef.current;
    if (!stream) return;
    const mimeType = pickMimeType();
    const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: Blob[] = [];
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) chunks.push(e.data);
    };
    recorderRef.current = rec;
    segStartRef.current = performance.now();
    vadRef.current?.resetSegment();
    (rec as MediaRecorder & { _chunks?: Blob[] })._chunks = chunks;
    rec.start(250);
  }, []);

  /**
   * 現在のセグメントを確定する。
   * mode: send = 声があれば送る / force = 声がなくても送る / discard = 送らない
   */
  const finalize = useCallback(
    (mode: "send" | "force" | "discard", keepListening: boolean) => {
      const rec = recorderRef.current;
      if (!rec) {
        if (!keepListening) release();
        return;
      }
      const hadSpeech = vadRef.current?.hadSpeech ?? false;
      const durationMs = performance.now() - segStartRef.current;
      const chunks = (rec as MediaRecorder & { _chunks?: Blob[] })._chunks ?? [];
      recorderRef.current = null;
      rec.onstop = () => {
        const shouldSend = mode === "force" || (mode === "send" && hadSpeech);
        if (shouldSend && chunks.length) {
          const blob = new Blob(chunks, { type: rec.mimeType || chunks[0].type });
          optsRef.current.onSegment(blob, { hadSpeech, durationMs });
        }
      };
      try {
        if (rec.state !== "inactive") rec.stop();
      } catch {
        /* noop */
      }
      if (keepListening && !stoppingRef.current) {
        startSegment();
      } else {
        release();
      }
    },
    [release, startSegment],
  );

  const tick = useCallback(() => {
    const an = analyserRef.current;
    const vad = vadRef.current;
    if (!an || !vad || !recorderRef.current) return;
    const buf = new Float32Array(an.fftSize);
    an.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    const rms = Math.sqrt(sum / buf.length);
    const ev = vad.push(rms, TICK_MS);
    const segMs = performance.now() - segStartRef.current;

    setLevel(rms);
    setThreshold(vad.threshold());
    setInSpeech(vad.inSpeech);
    setElapsedMs(segMs);

    const o = optsRef.current;
    if (ev === "speech_start") o.onSpeechStart?.();
    if (ev === "speech_end" && o.autoStop) {
      finalize("send", o.continuous);
    } else if (segMs >= o.maxSeconds * 1000) {
      finalize("send", o.continuous);
    } else if (o.autoStop && !vad.hadSpeech && segMs >= IDLE_RECYCLE_MS) {
      finalize("discard", true);
    }
  }, [finalize]);

  const start = useCallback(async () => {
    if (streamRef.current || state === "starting") return;
    stoppingRef.current = false;
    setState("starting");
    try {
      // AudioContext はタップ（ユーザー操作）の中で作る必要がある（iOS）
      if (!ctxRef.current) {
        const Ctx: typeof AudioContext =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        ctxRef.current = new Ctx();
      }
      const ctx = ctxRef.current;
      setAudioSession("play-and-record");
      const resumeP = ctx.state === "suspended" ? ctx.resume() : Promise.resolve();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // インターフォンのスピーカー音を拾うため、エコー除去はオフ。
          // 雑音抑制・自動ゲインは実機で比較検証すること（README 参照）。
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      await resumeP.catch(() => {});
      streamRef.current = stream;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      sourceRef.current = source;
      analyserRef.current = analyser;
      if (!vadRef.current) vadRef.current = new Vad(VAD_PRESETS[optsRef.current.sensitivity]);
      startSegment();
      timerRef.current = window.setInterval(tick, TICK_MS);
      setState("listening");
    } catch (e) {
      release();
      optsRef.current.onError?.(e);
    }
  }, [release, startSegment, state, tick]);

  /** send=true: 今までの録音を文字化に回す / false: 捨てる */
  const stop = useCallback(
    (send: boolean) => {
      stoppingRef.current = true;
      finalize(send ? "force" : "discard", false);
    },
    [finalize],
  );

  // 感度変更時は VAD を作り直す
  useEffect(() => {
    vadRef.current = new Vad(VAD_PRESETS[opts.sensitivity]);
  }, [opts.sensitivity]);

  useEffect(
    () => () => {
      stoppingRef.current = true;
      try {
        recorderRef.current?.stop();
      } catch {
        /* noop */
      }
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      ctxRef.current?.close().catch(() => {});
    },
    [],
  );

  return { state, level, threshold, inSpeech, elapsedMs, start, stop };
}
