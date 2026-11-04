"""
定型文のキルギス語音声（MP3）を Meta MMS-TTS で生成する。

  python scripts/tts_mms.py --lang kir --in phrases-ky.json --out public/audio/ky

- モデル: facebook/mms-tts-kir（Hugging Face）。ライセンスは CC BY-NC 4.0（非商用）。
  商用化の前には、ネイティブ話者の録音か商用ライセンスの音声合成に置き換えること。
- 通常は GitHub Actions（.github/workflows/generate-kyrgyz-audio.yml）から実行される。
- 入力 JSON: [{"id": "...", "text": "..."}]
"""
import argparse
import json
import os
import subprocess
import tempfile

import numpy as np
import torch
from scipy.io import wavfile
from transformers import AutoTokenizer, VitsModel


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--lang", default="kir", help="MMS の言語コード（キルギス語 = kir）")
    ap.add_argument("--in", dest="inp", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--rate", type=float, default=0.92, help="話す速さ（1.0 = 標準）")
    args = ap.parse_args()

    name = f"facebook/mms-tts-{args.lang}"
    tok = AutoTokenizer.from_pretrained(name)
    model = VitsModel.from_pretrained(name)
    model.speaking_rate = args.rate
    sr = model.config.sampling_rate

    romanize = None
    if getattr(tok, "is_uroman", False):
        import uroman as ur  # キリル文字のままで良い言語では使われない

        romanize = ur.Uroman().romanize_string

    with open(args.inp, encoding="utf-8") as f:
        items = json.load(f)
    os.makedirs(args.out, exist_ok=True)

    for item in items:
        text = item["text"].strip()
        if romanize:
            text = romanize(text)
        torch.manual_seed(0)  # 毎回同じ声になるように
        inputs = tok(text, return_tensors="pt")
        with torch.no_grad():
            wav = model(**inputs).waveform[0].numpy()
        # 音量をそろえ、前後に少し無音を入れる（インターフォンで頭が切れないように）
        peak = float(np.max(np.abs(wav))) or 1.0
        wav = wav / peak * 0.9
        pad = np.zeros(int(sr * 0.15), dtype=np.float32)
        wav = np.concatenate([pad, wav.astype(np.float32), pad])
        with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
            wavfile.write(tmp.name, sr, (wav * 32767).astype(np.int16))
        out = os.path.join(args.out, f"{item['id']}.mp3")
        subprocess.run(
            ["ffmpeg", "-y", "-loglevel", "error", "-i", tmp.name, "-ac", "1", "-b:a", "48k", out],
            check=True,
        )
        os.unlink(tmp.name)
        print(f"✓ {item['id']}  ({len(wav) / sr:.1f}s)")


if __name__ == "__main__":
    main()
