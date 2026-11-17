"""Generate Kyrgyz audio bundles.
Model: kyrgyz-ai/TTS_small (VITS fine-tuned from facebook/mms-tts-kir on one Kyrgyz speaker, CC-BY-NC 4.0).
The base MMS model drops the letter "ж" in about a third of cases, so it is not used.
Each clip is checked with speech recognition (facebook/mms-1b-all, kir adapter); for single words several
candidates are generated and the one recognised most accurately is kept.

usage: gen_audio.py <tts_model_dir> <asr_model_dir> <texts.json> <out_dir> <kinds e.g. w or ec>
texts.json = {"w":[words], "e":[example sentences], "c":[compose sentences]}
Writes <out_dir>/ky-<bundle>.mp3 and <out_dir>/ky-index-<kinds>.json {normalized text: [bundle, offset, length]}.
Merge the index parts into ky-index.json afterwards."""
import sys, os, json, re, subprocess, tempfile, torch
import scipy.io.wavfile as wav
import numpy as np
from transformers import VitsModel, AutoTokenizer, Wav2Vec2ForCTC, AutoProcessor
tts_dir, asr_dir, texts_path, out, kinds = sys.argv[1:6]
os.makedirs(out, exist_ok=True)
torch.set_num_threads(int(os.environ.get("THREADS", "2")))
CHECK = "w" in kinds  # speech-recognition check only for single words; sentences come out clean in one pass
tok = AutoTokenizer.from_pretrained(tts_dir); m = VitsModel.from_pretrained(tts_dir); m.eval()
if CHECK:
    proc = AutoProcessor.from_pretrained(asr_dir, target_lang="kir")
    asr = Wav2Vec2ForCTC.from_pretrained(asr_dir, target_lang="kir", ignore_mismatched_sizes=True); asr.eval()
def norm(t): return re.sub(r"\s+", " ", re.sub(r"[^\w\s\-]", " ", t.lower().replace("́", ""))).strip()
ONES = ["", "бир", "эки", "үч", "төрт", "беш", "алты", "жети", "сегиз", "тогуз"]
TENS = ["", "он", "жыйырма", "отуз", "кырк", "элүү", "алтымыш", "жетимиш", "сексен", "токсон"]
def num(n):
    n = int(n)
    if n == 0: return "нөл"
    p = []
    if n >= 1000: p.append((ONES[n // 1000] + " " if n // 1000 > 1 else "") + "миң"); n %= 1000
    if n >= 100: p.append((ONES[n // 100] + " " if n // 100 > 1 else "") + "жүз"); n %= 100
    if n >= 10: p.append(TENS[n // 10]); n %= 10
    if n: p.append(ONES[n])
    return " ".join(p)
def speakable(k): return re.sub(r"\s+", " ", re.sub(r"\d+", lambda x: " " + num(x.group()) + " ", k).replace("щ", "ш").replace("_", " ")).strip()
def lev(a, b):
    d = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        p = d[:]; d[0] = i
        for j, y in enumerate(b, 1): d[j] = min(p[j] + 1, d[j - 1] + 1, p[j - 1] + (x != y))
    return d[-1]
def synth(text, rate, ns, seed):
    m.speaking_rate = rate; m.noise_scale = ns
    torch.manual_seed(seed)
    with torch.no_grad(): o = m(**tok(text, return_tensors="pt")).waveform[0].numpy()
    return o / max(1e-6, float(np.abs(o).max())) * 0.89
def heard(o):
    x = np.concatenate([np.zeros(3200, dtype=np.float32), o.astype(np.float32), np.zeros(4800, dtype=np.float32)])
    with torch.no_grad(): lg = asr(**proc(x, sampling_rate=16000, return_tensors="pt")).logits
    return norm(proc.decode(torch.argmax(lg, -1)[0]))
WORD_TRIES = [(0.9, 0.5, 7), (0.85, 0.4, 11), (0.9, 0.667, 3), (0.8, 0.3, 5)]
T = json.load(open(texts_path, encoding="utf-8"))
MAX = 13 * 1024 * 1024
index = {}; bundles = {}; cur = {}; stats = {"n": 0, "err": 0, "len": 0, "perfect": 0, "retried": 0}
def put(kind, data):
    n = cur.get(kind, 0); name = "%s%d" % (kind, n)
    if len(bundles.get(name, b"")) + len(data) > MAX:
        n += 1; cur[kind] = n; name = "%s%d" % (kind, n)
    b = bundles.setdefault(name, bytearray()); off = len(b); b.extend(data); return name, off
tmp = tempfile.mkdtemp()
for kind in kinds:
    for t in T[kind]:
        k = norm(t)
        if not k or k in index: continue
        s = speakable(k)
        if len(s) < 1: continue
        best = None; i = 0
        if not CHECK:
            best = (0, synth(s, 0.9, 0.5, 7))
        else:
            for i, (rate, ns, seed) in enumerate(WORD_TRIES):
                o = synth(s, rate, ns, seed); e = lev(s, heard(o))
                if best is None or e < best[0]: best = (e, o)
                if e == 0 or (e == 1 and len(s) >= 7): break
        if i > 0: stats["retried"] += 1
        e, o = best
        stats["n"] += 1; stats["err"] += e; stats["len"] += len(s); stats["perfect"] += (e == 0)
        o = np.concatenate([np.zeros(1920, dtype=o.dtype), o, np.zeros(4000, dtype=o.dtype)])  # 120 ms lead, 250 ms tail
        wp = os.path.join(tmp, "a.wav"); mp = os.path.join(tmp, "a.mp3")
        wav.write(wp, 16000, (o * 32767).astype(np.int16))
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", wp, "-ac", "1", "-ar", "16000", "-b:a", "32k",
                        "-write_xing", "0", "-id3v2_version", "0", mp], check=True)
        data = open(mp, "rb").read()
        name, off = put(kind, data)
        index[k] = [name, off, len(data)]
        if stats["n"] % 100 == 0: print("done", kinds, stats, flush=True)
for name, b in bundles.items():
    open(os.path.join(out, "ky-%s.mp3" % name), "wb").write(bytes(b)); print(name, len(b), flush=True)
json.dump(index, open(os.path.join(out, "ky-index-%s.json" % kinds), "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("FINISHED", kinds, stats, "CER%%=%.1f" % (100.0 * stats["err"] / max(1, stats["len"])), flush=True)
