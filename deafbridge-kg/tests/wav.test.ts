import { describe, expect, it } from "vitest";
import { downmix, encodeWav, normalize, parseWav, resample } from "@/lib/wav";

describe("wav", () => {
  it("encodes and parses 16kHz mono PCM", () => {
    const samples = new Float32Array(16000).map((_, i) => Math.sin(i / 10) * 0.5);
    const buf = new Uint8Array(encodeWav(samples, 16000));
    expect(buf.length).toBe(44 + 32000);
    const info = parseWav(buf)!;
    expect(info).toMatchObject({ sampleRate: 16000, channels: 1, bitsPerSample: 16, dataOffset: 44 });
    expect(info.durationSec).toBeCloseTo(1, 5);
  });

  it("clips out-of-range samples", () => {
    const buf = encodeWav(new Float32Array([2, -2]), 16000);
    const v = new DataView(buf);
    expect(v.getInt16(44, true)).toBe(32767);
    expect(v.getInt16(46, true)).toBe(-32768);
  });

  it("rejects non-wav / non-PCM data", () => {
    expect(parseWav(new Uint8Array(10))).toBeNull();
    expect(parseWav(new TextEncoder().encode("x".repeat(100)))).toBeNull();
    const buf = new Uint8Array(encodeWav(new Float32Array(100), 16000));
    new DataView(buf.buffer).setUint16(20, 3, true); // float format
    expect(parseWav(buf)).toBeNull();
  });

  it("skips extra chunks before data", () => {
    const base = new Uint8Array(encodeWav(new Float32Array(160), 16000));
    // RIFF header(12) + fmt(24) + LIST chunk(8+4) + data
    const list = new Uint8Array([0x4c, 0x49, 0x53, 0x54, 4, 0, 0, 0, 1, 2, 3, 4]);
    const out = new Uint8Array(base.length + list.length);
    out.set(base.subarray(0, 36), 0);
    out.set(list, 36);
    out.set(base.subarray(36), 36 + list.length);
    const info = parseWav(out)!;
    expect(info.dataOffset).toBe(56);
    expect(info.dataLength).toBe(320);
  });

  it("resamples 48k -> 16k with correct length", () => {
    const out = resample(new Float32Array(48000).fill(0.25), 48000, 16000);
    expect(out.length).toBe(16000);
    expect(out[100]).toBeCloseTo(0.25);
  });

  it("downmixes stereo", () => {
    const m = downmix([new Float32Array([1, 0]), new Float32Array([0, 0])]);
    expect(Array.from(m)).toEqual([0.5, 0]);
  });

  it("normalizes quiet audio but leaves silence alone", () => {
    const quiet = normalize(new Float32Array([0.1, -0.1]));
    expect(quiet[0]).toBeCloseTo(0.8); // capped at 8x
    const silent = new Float32Array([0, 0]);
    expect(normalize(silent)).toBe(silent);
  });
});
