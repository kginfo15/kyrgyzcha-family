import { downmix, encodeWav, normalize, resample, TARGET_SAMPLE_RATE } from "../wav";

/**
 * MediaRecorder の録音 Blob（webm / mp4 / ogg）を 16kHz モノラル WAV に変換する。
 */
export async function blobToWav16k(blob: Blob): Promise<Blob> {
  const arrayBuf = await blob.arrayBuffer();
  const Ctx: typeof AudioContext =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const ctx = new Ctx();
  try {
    const decoded = await new Promise<AudioBuffer>((resolve, reject) => {
      // 古い Safari はコールバック形式のみ対応
      const p = ctx.decodeAudioData(arrayBuf, resolve, reject);
      if (p && typeof p.then === "function") p.then(resolve, reject);
    });
    const channels: Float32Array[] = [];
    for (let c = 0; c < decoded.numberOfChannels; c++) channels.push(decoded.getChannelData(c));
    const mono = downmix(channels);
    const pcm = normalize(resample(mono, decoded.sampleRate, TARGET_SAMPLE_RATE));
    return new Blob([encodeWav(pcm, TARGET_SAMPLE_RATE)], { type: "audio/wav" });
  } finally {
    ctx.close().catch(() => {});
  }
}
