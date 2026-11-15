import type { Sensitivity } from "../settings";

/**
 * 簡易な発話区間検出（音量ベース）。テストしやすいよう純粋なステートマシンにしている。
 *
 * - 周囲の雑音レベル（noise floor）を追従し、それより十分大きい音を「声」とみなす
 * - 声が minSpeechMs 続いたら発話開始
 * - 発話後に silenceMs 静かになったら「話し終わり」
 */
export type VadConfig = {
  /** 雑音レベルに掛ける倍率 */
  ratio: number;
  /** 絶対的な最小しきい値（RMS） */
  minThreshold: number;
  minSpeechMs: number;
  silenceMs: number;
};

export const VAD_PRESETS: Record<Sensitivity, VadConfig> = {
  low: { ratio: 3.5, minThreshold: 0.03, minSpeechMs: 200, silenceMs: 1300 },
  mid: { ratio: 2.5, minThreshold: 0.015, minSpeechMs: 150, silenceMs: 1200 },
  high: { ratio: 1.8, minThreshold: 0.008, minSpeechMs: 120, silenceMs: 1100 },
};

export type VadEvent = "none" | "speech_start" | "speech_end";

export class Vad {
  noiseFloor = 0.005;
  inSpeech = false;
  /** 一度でも発話を検出したか（このセグメント内） */
  hadSpeech = false;
  private loudMs = 0;
  private quietMs = 0;

  constructor(private cfg: VadConfig) {}

  threshold(): number {
    return Math.max(this.cfg.minThreshold, this.noiseFloor * this.cfg.ratio);
  }

  /** 新しいセグメント開始時に呼ぶ（雑音レベルは引き継ぐ） */
  resetSegment(): void {
    this.inSpeech = false;
    this.hadSpeech = false;
    this.loudMs = 0;
    this.quietMs = 0;
  }

  /** rms: 0〜1、dtMs: 前回からの経過ミリ秒 */
  push(rms: number, dtMs: number): VadEvent {
    const loud = rms > this.threshold();
    if (!loud) {
      // 雑音レベルは静かなときだけゆっくり追従（上昇は遅く、下降は速く）
      const a = rms > this.noiseFloor ? 0.02 : 0.2;
      this.noiseFloor = Math.max(0.001, this.noiseFloor + (rms - this.noiseFloor) * a);
    }
    if (loud) {
      this.loudMs += dtMs;
      this.quietMs = 0;
      if (!this.inSpeech && this.loudMs >= this.cfg.minSpeechMs) {
        this.inSpeech = true;
        this.hadSpeech = true;
        return "speech_start";
      }
    } else {
      this.quietMs += dtMs;
      if (!this.inSpeech) this.loudMs = 0;
      if (this.inSpeech && this.quietMs >= this.cfg.silenceMs) {
        this.inSpeech = false;
        this.loudMs = 0;
        return "speech_end";
      }
    }
    return "none";
  }
}
