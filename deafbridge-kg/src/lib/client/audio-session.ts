/**
 * iOS Safari (16.4+) の Audio Session API。
 *
 * ろう者は iPhone をマナーモード（消音）にしていることが多い。
 * 既定のままだと消音スイッチで返答音声が鳴らないため、再生時は "playback" にして
 * 消音スイッチを無視させる。録音時は "play-and-record"。
 * 未対応ブラウザでは何もしない。実機での確認が必要（README 参照）。
 */
type AudioSessionType = "auto" | "playback" | "transient" | "transient-solo" | "ambient" | "play-and-record";

export function setAudioSession(type: AudioSessionType): void {
  try {
    const nav = navigator as Navigator & { audioSession?: { type: AudioSessionType } };
    if (nav.audioSession) nav.audioSession.type = type;
  } catch {
    /* noop */
  }
}
