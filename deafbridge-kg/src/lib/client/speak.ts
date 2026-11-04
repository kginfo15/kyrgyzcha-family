import { STT_LANG_CODE, type ConvLang } from "../types";
import { setAudioSession } from "./audio-session";

/**
 * 返答の音声再生。優先順位:
 *   1. 事前生成した音声ファイル（public/audio/{lang}/{id}.mp3） … オフラインでも確実・高品質
 *   2. 端末の音声合成（speechSynthesis）
 *   3. キルギス語の音声が端末にない場合 → 同じ意味のロシア語を読み上げ
 *   4. どれも無理なら 'none'（画面を見せてもらう）
 *
 * iOS では「タップから同期的に」play()/speak() を呼ばないとブロックされるため、
 * この関数は play/speak 呼び出しまで await を挟まない。
 */

export type PlayMethod = "file" | "tts" | "tts-ru-fallback" | "none";

type AudioManifest = Partial<Record<ConvLang, string[]>>;
let manifest: AudioManifest = {};
let currentAudio: HTMLAudioElement | null = null;

/** アプリ起動時に呼んでおく */
export async function preloadAudioManifest(): Promise<void> {
  try {
    // 相対パス：本番（/）でもお試しページ（claude.ai 上）でも同じ場所を指す
    const res = await fetch("audio/manifest.json", { cache: "no-cache" });
    if (res.ok) manifest = (await res.json()) as AudioManifest;
  } catch {
    /* オフライン時はキャッシュ（Service Worker）に任せる */
  }
  // Safari は getVoices() が最初は空なので、先に一度呼んでおく
  if (typeof speechSynthesis !== "undefined") speechSynthesis.getVoices();
}

export function hasAudioFile(lang: ConvLang, id: string): boolean {
  return !!manifest[lang]?.includes(id);
}

function findVoice(lang: ConvLang): SpeechSynthesisVoice | null {
  if (typeof speechSynthesis === "undefined") return null;
  const voices = speechSynthesis.getVoices();
  const code = STT_LANG_CODE[lang].toLowerCase();
  return (
    voices.find((v) => v.lang.toLowerCase().replace("_", "-") === code) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(lang)) ??
    null
  );
}

export function stopPlayback(): void {
  currentAudio?.pause();
  currentAudio = null;
  if (typeof speechSynthesis !== "undefined") speechSynthesis.cancel();
}

function speakTts(text: string, lang: ConvLang, voice: SpeechSynthesisVoice | null): Promise<void> {
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = STT_LANG_CODE[lang];
    if (voice) u.voice = voice;
    u.rate = 0.9;
    u.volume = 1;
    let done = false;
    const finish = () => {
      if (!done) {
        done = true;
        resolve();
      }
    };
    u.onend = finish;
    u.onerror = finish;
    // onend が来ないブラウザ対策の保険
    window.setTimeout(finish, 2000 + text.length * 120);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  });
}

export type PlayRequest = {
  text: string;
  lang: ConvLang;
  /** 定型文の id（事前生成音声を探す） */
  phraseId?: string;
  /** ky でキルギス語音声がない場合に読み上げるロシア語 */
  ruFallback?: string;
};

export function play(req: PlayRequest): { method: PlayMethod; done: Promise<void> } {
  stopPlayback();
  setAudioSession("playback");

  if (req.phraseId && hasAudioFile(req.lang, req.phraseId)) {
    const audio = new Audio(`audio/${req.lang}/${req.phraseId}.mp3`);
    currentAudio = audio;
    const done = new Promise<void>((resolve) => {
      audio.onended = () => resolve();
      audio.onerror = () => resolve();
    });
    audio.play().catch(() => {});
    return { method: "file", done };
  }

  if (typeof speechSynthesis === "undefined") return { method: "none", done: Promise.resolve() };

  const voice = findVoice(req.lang);
  const voices = speechSynthesis.getVoices();
  if (voice || voices.length === 0) {
    // voices が空 = まだ読み込み中の可能性。lang 指定だけで試す
    return { method: "tts", done: speakTts(req.text, req.lang, voice) };
  }

  if (req.lang === "ky" && req.ruFallback) {
    if (req.phraseId && hasAudioFile("ru", req.phraseId)) {
      const r = play({ text: req.ruFallback, lang: "ru", phraseId: req.phraseId });
      return { method: "tts-ru-fallback", done: r.done };
    }
    const ruVoice = findVoice("ru");
    if (ruVoice) return { method: "tts-ru-fallback", done: speakTts(req.ruFallback, "ru", ruVoice) };
  }
  return { method: "none", done: Promise.resolve() };
}
