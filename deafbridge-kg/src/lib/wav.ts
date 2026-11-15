/**
 * WAV (PCM 16bit mono) のエンコード／検証。
 *
 * ブラウザごとに MediaRecorder の出力形式が違う（iPhone Safari: audio/mp4,
 * Chrome: audio/webm 等）ため、クライアント側で 16kHz モノラル WAV に統一してから
 * サーバーへ送る。サーバーは WAV ヘッダーを検証するだけでよく、ffmpeg 等の変換基盤が不要になる。
 */

export const TARGET_SAMPLE_RATE = 16000;

/** 複数チャンネルをモノラルに平均化 */
export function downmix(channels: Float32Array[]): Float32Array {
  if (channels.length === 0) return new Float32Array(0);
  if (channels.length === 1) return channels[0];
  const len = channels[0].length;
  const out = new Float32Array(len);
  for (const ch of channels) {
    for (let i = 0; i < len; i++) out[i] += ch[i] / channels.length;
  }
  return out;
}

/**
 * 線形補間による簡易リサンプリング（ダウンサンプル時は区間平均でエイリアスを軽減）。
 * 音声認識用途では十分な品質。
 */
export function resample(input: Float32Array, fromRate: number, toRate: number): Float32Array {
  if (fromRate === toRate) return input;
  const ratio = fromRate / toRate;
  const outLen = Math.floor(input.length / ratio);
  const out = new Float32Array(outLen);
  if (ratio > 1) {
    for (let i = 0; i < outLen; i++) {
      const start = Math.floor(i * ratio);
      const end = Math.min(input.length, Math.floor((i + 1) * ratio));
      let sum = 0;
      for (let j = start; j < end; j++) sum += input[j];
      out[i] = end > start ? sum / (end - start) : 0;
    }
  } else {
    for (let i = 0; i < outLen; i++) {
      const pos = i * ratio;
      const i0 = Math.floor(pos);
      const i1 = Math.min(input.length - 1, i0 + 1);
      const t = pos - i0;
      out[i] = input[i0] * (1 - t) + input[i1] * t;
    }
  }
  return out;
}

/** ピークを 0.9 付近にそろえる（インターフォン越しの小さな声対策）。無音は増幅しない。 */
export function normalize(samples: Float32Array, target = 0.9, maxGain = 8): Float32Array {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
  if (peak < 1e-4) return samples;
  const gain = Math.min(maxGain, target / peak);
  if (gain <= 1) return samples;
  const out = new Float32Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  return out;
}

export function encodeWav(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const dataLen = samples.length * 2;
  const buf = new ArrayBuffer(44 + dataLen);
  const v = new DataView(buf);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, "RIFF");
  v.setUint32(4, 36 + dataLen, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  v.setUint32(16, 16, true); // fmt chunk size
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true); // byte rate
  v.setUint16(32, 2, true); // block align
  v.setUint16(34, 16, true); // bits per sample
  writeStr(36, "data");
  v.setUint32(40, dataLen, true);
  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buf;
}

export type WavInfo = {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  dataOffset: number;
  dataLength: number;
  durationSec: number;
};

/** サーバー側の入力検証用。PCM WAV でなければ null。 */
export function parseWav(bytes: Uint8Array): WavInfo | null {
  if (bytes.length < 44) return null;
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const str = (off: number, len: number) =>
    String.fromCharCode(...Array.from(bytes.subarray(off, off + len)));
  if (str(0, 4) !== "RIFF" || str(8, 4) !== "WAVE") return null;

  let off = 12;
  let fmt: { format: number; channels: number; sampleRate: number; bits: number } | null = null;
  while (off + 8 <= bytes.length) {
    const id = str(off, 4);
    const size = v.getUint32(off + 4, true);
    const body = off + 8;
    if (id === "fmt ") {
      if (size < 16 || body + 16 > bytes.length) return null;
      fmt = {
        format: v.getUint16(body, true),
        channels: v.getUint16(body + 2, true),
        sampleRate: v.getUint32(body + 4, true),
        bits: v.getUint16(body + 14, true),
      };
    } else if (id === "data") {
      if (!fmt || fmt.format !== 1) return null;
      const dataLength = Math.min(size, bytes.length - body);
      const bytesPerSec = fmt.sampleRate * fmt.channels * (fmt.bits / 8);
      if (!bytesPerSec) return null;
      return {
        sampleRate: fmt.sampleRate,
        channels: fmt.channels,
        bitsPerSample: fmt.bits,
        dataOffset: body,
        dataLength,
        durationSec: dataLength / bytesPerSec,
      };
    }
    off = body + size + (size % 2);
  }
  return null;
}
