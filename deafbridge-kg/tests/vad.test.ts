import { describe, expect, it } from "vitest";
import { Vad, VAD_PRESETS } from "@/lib/client/vad";

function run(vad: Vad, rms: number, ms: number) {
  const events: string[] = [];
  for (let t = 0; t < ms; t += 50) {
    const e = vad.push(rms, 50);
    if (e !== "none") events.push(e);
  }
  return events;
}

describe("vad", () => {
  it("detects speech start and end", () => {
    const vad = new Vad(VAD_PRESETS.mid);
    expect(run(vad, 0.003, 1000)).toEqual([]);
    expect(run(vad, 0.2, 600)).toEqual(["speech_start"]);
    expect(vad.hadSpeech).toBe(true);
    expect(run(vad, 0.003, 1500)).toEqual(["speech_end"]);
  });

  it("ignores very short clicks", () => {
    const vad = new Vad(VAD_PRESETS.mid);
    run(vad, 0.003, 500);
    expect(run(vad, 0.3, 100)).toEqual([]);
    expect(run(vad, 0.003, 500)).toEqual([]);
    expect(vad.hadSpeech).toBe(false);
  });

  it("adapts to steady background noise", () => {
    const vad = new Vad(VAD_PRESETS.mid);
    // 少し大きめの定常ノイズ（換気扇など）でも、しばらくすると声扱いしない
    run(vad, 0.012, 5000);
    expect(vad.hadSpeech).toBe(false);
    expect(vad.threshold()).toBeGreaterThan(0.025);
    expect(run(vad, 0.012, 2000)).toEqual([]);
    // ノイズより十分大きい声は検出
    expect(run(vad, 0.15, 400)).toEqual(["speech_start"]);
  });

  it("high sensitivity detects quieter voices than low", () => {
    const hi = new Vad(VAD_PRESETS.high);
    const lo = new Vad(VAD_PRESETS.low);
    run(hi, 0.002, 1000);
    run(lo, 0.002, 1000);
    expect(run(hi, 0.02, 500)).toEqual(["speech_start"]);
    expect(run(lo, 0.02, 500)).toEqual([]);
  });
});
