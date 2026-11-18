"""「パパきらい?だいすき!」のうた — 歌声+伴奏を合成して song.wav と timeline.json を出力する。

使い方: pip install pyopenjtalk pyworld numpy scipy && python3 song.py <出力ディレクトリ>
"""
import json
import sys
import wave

import numpy as np
import pyopenjtalk
import pyworld as pw
from scipy.signal import resample_poly

SR = 48000
BPM = 120
BEAT = 60 / BPM
E = BEAT / 2  # 8分音符 = 1モーラ
BAR = BEAT * 4
TOTAL = 60.0

NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def hz(name):
    return 440 * 2 ** ((NOTE[name[:-1]] + 12 * (int(name[-1]) + 1) - 69) / 12)


# (小節, 拍(0始まり), モーラ列, 音名列, 表示する歌詞, 場面)
# モーラと音は1対1。「ー」「っ」も1モーラ。
SONG = [
    # ---- きらいパート(短調っぽく・ぷんぷん) ----
    (2, 0, "パ パ な ん て", "A4 A4 G4 G4 E4", "パパなんて", "kirai"),
    (3, 0, "き ら い", "A4 G4 E4", "きらい", "kirai"),
    (3, 2, "き ら い", "A4 G4 E4", "きらい!", "kirai"),
    (4, 0, "あ し が", "E4 G4 A4", "あしが", "kusai"),
    (4, 2, "く さ い", "C5 B4 A4", "くさい", "kusai"),
    (5, 0, "く さ い", "C5 B4 A4", "くさい", "kusai"),
    (5, 2, "く さ ー い", "C5 B4 B4 A4", "くさ〜い!", "kusai"),
    (6, 0, "お ひ げ が", "A4 A4 G4 E4", "おひげが", "hige"),
    (6, 2, "ち く ち く", "G4 E4 G4 E4", "ちくちく", "hige"),
    (7, 0, "い た い", "A4 G4 E4", "いたい", "hige"),
    (7, 2, "い た い", "A4 G4 E4", "いたい!", "hige"),
    (8, 0, "お な ら も", "E4 G4 A4 A4", "おならも", "onara"),
    (8, 2.5, "ぷ ー", "C5 C5", "ぷー!", "onara"),
    (9, 0, "く さ い", "C5 B4 A4", "くさい", "onara"),
    (9, 2, "く さ い", "C5 B4 A4", "くさい!", "onara"),
    (10, 0, "あ っ ち", "A4 A4 A4", "あっち", "acchi"),
    (10, 2, "い っ て", "C5 C5 A4", "いって!", "acchi"),
    (11, 0, "ぷ ん", "E5 E5", "ぷん", "acchi"),
    (11, 1, "ぷ ん", "D5 D5", "ぷん", "acchi"),
    (11, 2, "ぷ ん", "C5 A4", "ぷん!", "acchi"),
    # ---- でもパート(ゆっくり・やさしく) ----
    (12, 0, "で も", "E4 G4", "でも…", "demo"),
    (12, 2, "だ っ こ", "C5 C5 A4", "だっこ", "dakko"),
    (13, 0, "し て く れ る", "G4 A4 G4 E4 G4", "してくれる", "dakko"),
    (14, 0, "い っ しょ に", "E4 E4 G4 A4", "いっしょに", "asobu"),
    (14, 2, "あ そ ん で", "C5 C5 A4 G4", "あそんで", "asobu"),
    (15, 0, "く れ る", "A4 B4 C5", "くれる", "asobu"),
    (15, 2, "や っ ぱ り", "D5 D5 D5 E5", "やっぱり…", "yappari"),
    # ---- すきパート(長調・にこにこ) ----
    (16, 0, "す き", "E5 C5", "すき", "suki"),
    (16, 1, "す き", "E5 C5", "すき", "suki"),
    (16, 2, "パ パ が", "D5 D5 E5", "パパが", "suki"),
    (17, 0, "す き ー", "G5 E5 E5", "すき〜!", "suki"),
    (18, 0, "に ち か は", "C5 D5 E5 C5", "にちかは", "papa"),
    (18, 2, "パ パ が", "F5 F5 E5", "パパが", "papa"),
    (19, 0, "だ い す き ー", "D5 E5 D5 C5 C5", "だいすき!", "papa"),
    (20, 0, "パ パ も", "E5 E5 G5", "パパも", "hug"),
    (20, 2, "に ち か が", "A5 G5 E5 D5", "にちかが", "hug"),
    (21, 0, "だ い す き ー", "E5 G5 E5 D5 D5", "だいすき!", "hug"),
    (22, 0, "に ち か は", "C5 D5 E5 C5", "にちかは", "self"),
    (22, 2, "に ち か も", "F5 F5 E5 D5", "にちかも", "self"),
    (23, 0, "だ い す き ー", "D5 E5 D5 C5 C5", "だいすき!", "self"),
    (24, 0, "あ し は", "E5 E5 G5", "あしは", "kusaikedo"),
    (24, 2, "く さ い", "A5 G5 E5", "くさい", "kusaikedo"),
    (25, 0, "け ど", "D5 E5", "けど", "kusaikedo"),
    (25, 2, "や っ ぱ り", "D5 D5 E5 G5", "やっぱり", "kusaikedo"),
    (26, 0, "す き", "E5 C5", "すき", "finale"),
    (26, 1, "す き", "E5 C5", "すき", "finale"),
    (26, 2, "だ い す き", "D5 E5 G5 G5", "だいすき", "finale"),
    (27, 0, "パ パ ー", "A5 G5 G5", "パパ〜!", "finale"),
    (28, 0, "ぎゅ ー ー ー", "C5 E5 G5 C6", "ぎゅ〜〜っ!", "gyu"),
]

# 歌声は1オクターブ下げて C4〜C5 あたりで歌わせる(子どもっぽい高さ)
VOICE_SHIFT = 0.5
FORMANT = 1.16  # 声を幼く


def trim(x, thr=0.02):
    a = np.abs(x) / (np.abs(x).max() + 1e-9)
    idx = np.where(a > thr)[0]
    return x[max(0, idx[0] - 200): idx[-1] + 200]


def sing(morae, notes):
    text = "".join(morae)
    x, sr = pyopenjtalk.tts(text)
    x = trim(x.astype(np.float64) / 32768)
    f0, t = pw.harvest(x, sr, frame_period=5.0)
    sp = pw.cheaptrick(x, f0, t, sr)
    ap = pw.d4c(x, f0, t, sr)
    n_in = len(f0)
    n_out = int(round(len(morae) * E / 0.005))
    # 時間伸縮: モーラ等間隔とみなしてフレームを線形対応
    src = np.clip(np.linspace(0, n_in - 1, n_out).round().astype(int), 0, n_in - 1)
    sp2, ap2, voiced = sp[src], ap[src], f0[src] > 0
    # フォルマントを上へずらす
    nb = sp2.shape[1]
    k = np.arange(nb)
    kk = np.clip(k / FORMANT, 0, nb - 1)
    lo = np.floor(kk).astype(int)
    hi = np.minimum(lo + 1, nb - 1)
    w = kk - lo
    sp2 = sp2[:, lo] * (1 - w) + sp2[:, hi] * w
    # メロディをF0に
    f = np.zeros(n_out)
    per = n_out / len(morae)
    tt = np.arange(n_out) * 0.005
    for i, nn in enumerate(notes):
        a, b = int(round(i * per)), int(round((i + 1) * per))
        f[a:b] = hz(nn) * VOICE_SHIFT
    # 音の変わり目をなめらかに + ビブラート少し
    ker = np.hanning(9)
    f = np.convolve(np.pad(f, 4, mode="edge"), ker / ker.sum(), mode="valid")
    f *= 1 + 0.008 * np.sin(2 * np.pi * 5.5 * tt)
    # 無声子音は残しつつ、母音はしっかり有声に
    f2 = np.where(voiced, f, 0.0)
    y = pw.synthesize(f2, np.ascontiguousarray(sp2), np.ascontiguousarray(ap2), sr, 5.0)
    y = resample_poly(y, SR, sr) if sr != SR else y
    fade = int(0.01 * SR)
    y[:fade] *= np.linspace(0, 1, fade)
    y[-fade:] *= np.linspace(1, 0, fade)
    return y / (np.abs(y).max() + 1e-9)


def tone(freq, dur, kind="pluck", vol=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    if kind == "pluck":  # マリンバ/トイピアノ風
        y = (np.sin(2 * np.pi * freq * t) + 0.4 * np.sin(2 * np.pi * freq * 4 * t) * np.exp(-t * 18)) * np.exp(-t * 6)
    elif kind == "bass":
        y = (np.sin(2 * np.pi * freq * t) + 0.3 * np.sin(2 * np.pi * freq * 2 * t)) * np.exp(-t * 4)
    elif kind == "bell":  # 鉄琴
        y = (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * freq * 3.01 * t) * np.exp(-t * 8)) * np.exp(-t * 3.5)
    else:  # pad
        y = sum(np.sin(2 * np.pi * freq * m * t) / m for m in (1, 2, 3)) * np.minimum(1, t * 8) * np.minimum(1, (dur - t) * 8)
    a = int(0.004 * SR)
    y[:a] *= np.linspace(0, 1, a)
    return y * vol


def kick():
    t = np.arange(int(0.25 * SR)) / SR
    return np.sin(2 * np.pi * (50 * t + 60 * (1 - np.exp(-t * 30)) / 30)) * np.exp(-t * 14)


def hat(rng, vol=1.0):
    n = int(0.05 * SR)
    y = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 90)
    return np.diff(y, prepend=0) * vol


def clap(rng):
    n = int(0.12 * SR)
    y = rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 35)
    return np.diff(y, prepend=0)


def main(out):
    rng = np.random.default_rng(7)
    N = int(TOTAL * SR)
    voice, mel, back = np.zeros(N), np.zeros(N), np.zeros(N)

    def add(buf, y, t, g=1.0):
        i = int(t * SR)
        y = y[: max(0, N - i)]
        buf[i: i + len(y)] += y * g

    timeline = []
    for bar, beat, mo, no, lyric, scene in SONG:
        morae, notes = mo.split(), no.split()
        assert len(morae) == len(notes), lyric
        t0 = bar * BAR + beat * BEAT
        add(voice, sing(morae, notes), t0)
        for i, nn in enumerate(notes):  # メロディを鉄琴でうっすら重ねる
            if morae[i] not in ("ー", "っ") or i == 0:
                add(mel, tone(hz(nn), 0.5, "bell"), t0 + i * E, 0.16)
        timeline.append({"t": round(t0, 3), "d": round(len(morae) * E, 3), "text": lyric, "scene": scene})

    # 伴奏コード(小節ごと)
    Am, Em, F_, G_, C_, Dm = (["A3", "C4", "E4"], ["G3", "B3", "E4"], ["A3", "C4", "F4"],
                              ["G3", "B3", "D4"], ["G3", "C4", "E4"], ["A3", "D4", "F4"])
    root = {id(Am): "A2", id(Em): "E2", id(F_): "F2", id(G_): "G2", id(C_): "C2", id(Dm): "D2"}
    chords = ([Am, Em] + [Am, Am, Am, Em, Am, Am, Am, Em, Am, Em]
              + [F_, C_, F_, G_]
              + [C_, C_, F_, C_, C_, G_, F_, C_, C_, G_, F_, G_]
              + [C_, C_])
    for b, ch in enumerate(chords):
        t0 = b * BAR
        r = hz(root[id(ch)])
        if b < 2:  # イントロ
            for i in range(8):
                add(back, tone(hz(ch[i % 3]) * 2, 0.3, "pluck"), t0 + i * E, 0.22)
            add(back, tone(r, 0.9, "bass"), t0, 0.5)
            add(back, tone(r, 0.9, "bass"), t0 + 2 * BEAT, 0.5)
        elif b < 12:  # きらい: どすどす
            for i in range(4):
                add(back, tone(r * (1 if i % 2 == 0 else 1.5), 0.4, "bass"), t0 + i * BEAT, 0.55)
                add(back, kick(), t0 + i * BEAT, 0.5)
                for n in ch:
                    add(back, tone(hz(n), 0.18, "pluck"), t0 + i * BEAT + E, 0.13)
                add(back, hat(rng), t0 + i * BEAT + E, 0.12)
        elif b < 16:  # でも: やさしく
            for n in ch:
                add(back, tone(hz(n), BAR, "pad"), t0, 0.035)
            for i in range(8):
                add(back, tone(hz(ch[(0, 1, 2, 1)[i % 4]]) * 2, 0.6, "bell"), t0 + i * E, 0.12)
            add(back, tone(r, 1.8, "bass"), t0, 0.4)
            if b == 15:  # もりあげ
                for i in range(8):
                    add(back, clap(rng), t0 + 2 * BEAT + i * E / 2, 0.05 + 0.02 * i)
        elif b < 28:  # すき: はずむ
            for i in range(4):
                add(back, kick(), t0 + i * BEAT, 0.55)
                add(back, tone(r * (1 if i % 2 == 0 else 2), 0.35, "bass"), t0 + i * BEAT, 0.5)
                add(back, tone(r * 1.5, 0.2, "bass"), t0 + i * BEAT + E, 0.3)
                for n in ch:
                    add(back, tone(hz(n) * 2, 0.22, "pluck"), t0 + i * BEAT + E, 0.13)
                add(back, hat(rng), t0 + i * BEAT, 0.07)
                add(back, hat(rng), t0 + i * BEAT + E, 0.13)
            add(back, clap(rng), t0 + BEAT, 0.22)
            add(back, clap(rng), t0 + 3 * BEAT, 0.22)
        else:  # おしまい
            if b == 28:
                for n in ch:
                    add(back, tone(hz(n), BAR, "pad"), t0, 0.04)
                add(back, tone(r, 2, "bass"), t0, 0.5)
            else:
                for i, n in enumerate(["C5", "E5", "G5", "C6"]):
                    add(back, tone(hz(n), 1.5, "bell"), t0 + i * 0.09, 0.3)
                add(back, tone(hz("C2"), 2, "bass"), t0, 0.6)
                add(back, kick(), t0, 0.6)
                add(back, clap(rng), t0, 0.3)
    # イントロのメロディ
    for i, n in enumerate("E5 C5 E5 C5 D5 D5 E5 - A4 C5 E5 A5 G5 - E5 -".split()):
        if n != "-":
            add(mel, tone(hz(n), 0.5, "bell"), i * E, 0.3)

    mix = voice * 0.62 + mel + back
    mix = np.tanh(mix * 1.1)
    mix /= np.abs(mix).max() / 0.95
    fo = int(0.4 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)
    with wave.open(f"{out}/song.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    json.dump(timeline, open(f"{out}/timeline.json", "w"), ensure_ascii=False, indent=1)
    print("ok", len(timeline), "phrases")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
