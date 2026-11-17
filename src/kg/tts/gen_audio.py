"""Generate Kyrgyz audio bundles with Meta MMS-TTS (facebook/mms-tts-kir, CC-BY-NC 4.0).
usage: gen_audio.py <model_dir> <texts.json> <out_dir>
texts.json = {"w":[words], "e":[example sentences], "c":[compose sentences]}
Writes <out_dir>/ky-<bundle>.mp3 (concatenated MP3 clips) and <out_dir>/ky-index.json {normalized text: [bundle, offset, length]}."""
import sys, os, json, re, subprocess, tempfile, torch
import scipy.io.wavfile as wav
import numpy as np
from transformers import VitsModel, AutoTokenizer
model_dir, texts_path, out = sys.argv[1:4]
os.makedirs(out, exist_ok=True)
tok = AutoTokenizer.from_pretrained(model_dir); m = VitsModel.from_pretrained(model_dir); m.eval()
torch.set_num_threads(4)
def norm(t): return re.sub(r"\s+", " ", re.sub(r"[^\w\s\-]", " ", t.lower().replace("́", ""))).strip()
T = json.load(open(texts_path, encoding="utf-8"))
MAX = 13 * 1024 * 1024
index = {}; bundles = {}; cur = {}
def put(kind, data):
    n = cur.get(kind, 0)
    name = "%s%d" % (kind, n)
    if len(bundles.get(name, b"")) + len(data) > MAX:
        n += 1; cur[kind] = n; name = "%s%d" % (kind, n)
    b = bundles.setdefault(name, bytearray()); off = len(b); b.extend(data); return name, off
tmp = tempfile.mkdtemp()
done = 0
for kind in ("w", "e", "c"):
    for t in T[kind]:
        k = norm(t)
        if not k or k in index: continue
        torch.manual_seed(7)
        ids = tok(k, return_tensors="pt")
        if ids["input_ids"].shape[1] < 2: continue
        with torch.no_grad(): o = m(**ids).waveform[0].numpy()
        o = o / max(1e-6, float(np.abs(o).max())) * 0.89
        wp = os.path.join(tmp, "a.wav"); mp = os.path.join(tmp, "a.mp3")
        wav.write(wp, m.config.sampling_rate, (o * 32767).astype(np.int16))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wp, "-ac", "1", "-ar", "16000", "-b:a", "24k",
                        "-write_xing", "0", "-id3v2_version", "0", mp], check=True)
        data = open(mp, "rb").read()
        name, off = put(kind, data)
        index[k] = [name, off, len(data)]
        done += 1
        if done % 200 == 0: print("done", done, flush=True)
for name, b in bundles.items():
    open(os.path.join(out, "ky-%s.mp3" % name), "wb").write(bytes(b)); print(name, len(b), flush=True)
json.dump(index, open(os.path.join(out, "ky-index.json"), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("FINISHED", len(index), flush=True)
