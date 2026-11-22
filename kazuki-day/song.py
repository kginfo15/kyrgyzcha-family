"""「かづきの ほいくえんの いちにち」— 歌声+伴奏を合成して song.wav と timeline.json を出力する。

使い方: python3 song.py <出力ディレクトリ>   (../nichika-papa/song.py の合成エンジンを再利用)
サチノせんせいのセリフ(voice/*.wav)は piper-tts で作ったもの:
  ru1 "Повторяйте за мной!" / ru2 "Молодец!" (ru_RU-dmitri-medium), en1 "Apple!" / en2 "Hello!" (en_US-joe-medium)
"""
import json
import os
import sys
import wave

import numpy as np
from scipy.signal import resample_poly

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "nichika-papa"))
import song as base  # noqa: E402

SR = base.SR
BPM = 150
BEAT = 60 / BPM
E = BEAT / 2
BAR = BEAT * 4
TOTAL = 60.0
TR = 2 ** (-2 / 12)
base.E = E
base.VOICE_SHIFT = TR
base.FORMANT = 1.2
tone, kick, hat, clap = base.tone, base.kick, base.hat, base.clap


def hz(n):
    return base.hz(n) * TR


SONG = []    # (bar, beat, morae, notes, lyric, scene, line)
SPEECH = []  # (bar, beat, wavname, text, scene, line)
_line = [0]


def ph(bar, beat, morae, notes, lyric, scene, new=False):
    if new:
        _line[0] += 1
    m = morae.split()
    n = notes.split()
    assert len(m) == len(n), (lyric, len(m), len(n))
    SONG.append((bar, beat, m, n, lyric, scene, _line[0]))


def say(bar, beat, name, text, scene, new=False):
    if new:
        _line[0] += 1
    SPEECH.append((bar, beat, name, text, scene, _line[0]))


UNITS = [
    ("E5 E5 C5 C5 D5 D5 E5 C5", "D5 D5 B4 B4 B4", "D5 E5 D5 B4"),
    ("C5 C5 A4 A4 C5 D5 E5 E5", "E5 E5 D5 B4 B4", "B4 D5 E5 E5"),
    ("F5 F5 E5 D5 C5 C5 A4 C5", "C5 C5 E5 E5 E5", "E5 D5 C5 C5"),
    ("D5 D5 B4 B4 D5 E5 F5 F5", "E5 D5 D5 B4 B4", "D5 E5 F5 F5"),
]


def cut(notes, m):
    return " ".join(notes.split()[: len(m.split())])


def unit(bar, u, a, a_ly, b, b_ly, r, r_ly, scene, scene_b=None, rbeat=2):
    A, B, R = UNITS[u]
    ph(bar, 0, a, cut(A, a), a_ly, scene, new=True)
    ph(bar + 1, 0, b, cut(B, b), b_ly, scene_b or scene)
    ph(bar + 1, rbeat, r, cut(R, r), r_ly, scene_b or scene)


ph(1, 3.5, "あ し た は ほ い く え ん", "G4 C5 C5 E5 E5 D5 C5 D5 E5", "あしたは ほいくえん", "hook", new=True)
ph(3, 0, "が ん ば ろ う", "F5 F5 E5 D5 C5", "がんばろう!", "hook")
ph(3, 3, "オ ー", "E5 E5", "オー!", "hook")
ph(4, 0, "か づ き の い ち に ち", "A4 A4 C5 C5 D5 D5 E5 D5", "かづきの いちにち", "hook", new=True)
ph(5, 0, "は じ ま る よ", "D5 E5 F5 E5 D5", "はじまるよ!", "hook")
unit(6, 0, "ク ラ ス で べ ん きょ う", "クラスで べんきょう", "え い ご の", "えいごの", "じ か ん", "じかん", "class")
ph(8, 0, "サ チ ノ せ ん せ い", "C5 C5 E5 E5 D5 C5 C5", "サチノせんせい", "sachino", new=True)
say(9, 0, "ru1", "「Повторяйте за мной!」", "sachino")
say(10, 0, "en1", "Apple!", "apple", new=True)
ph(10, 2, "ア ッ プ ル", "E5 E5 C5 C5", "アップル!", "apple")
say(11, 0, "en2", "Hello!", "hello")
ph(11, 2, "ハ ロ ー", "F5 D5 D5", "ハロー!", "hello")
say(12, 0, "ru2", "「Молодец!」", "molodets", new=True)
ph(12, 2, "や っ た ー", "D5 D5 F5 F5", "やったー!", "molodets")
unit(13, 1, "じ ゆ う じ か ん", "じゆうじかん", "ノ ー ト に", "ノートに", "お え か き", "おえかき", "jiyu")
unit(15, 2, "お ひ る ご は ん だ", "おひるごはんだ", "い っ ぱ い", "いっぱい", "も ぐ も ぐ", "もぐもぐ", "lunch")
unit(17, 3, "お ひ る ね タ イ ム", "おひるね タイム", "ぐ っ す り", "ぐっすり", "ぐ ー ぐ ー", "ぐーぐー", "hirune")
unit(19, 0, "お そ と で い っ ぱ い", "おそとで いっぱい", "あ そ ぼ う", "あそぼう", "わ ー い", "わーい!", "soto")
unit(21, 1, "マ マ が お む か え", "ママが おむかえ", "き た よ", "きたよ", "や っ た ー", "やったー!", "mama")
unit(23, 2, "か え っ た ら お や つ", "かえったら おやつ", "た べ て", "たべて", "ダ ン ス", "ダンス!", "oyatsu", "dance")
unit(25, 3, "パ パ が た だ い ま", "パパが ただいま", "い っ しょ に", "いっしょに", "あ そ ぼ", "あそぼ!", "papa", "asobu")
unit(27, 0, "ご は ん を た べ た ら", "ごはんを たべたら", "お ふ ろ で", "おふろで", "ば しゃ ば しゃ", "ばしゃばしゃ", "gohan", "ofuro")
unit(29, 1, "は み が き しゅ っ しゅ", "はみがき しゅっしゅ", "ド ラ イ ヤ ー", "ドライヤー", "ぶ お ー", "ぶおー", "hamigaki", "dryer", rbeat=2.5)
unit(31, 2, "ふ わ ふ わ お ふ と ん", "ふわふわ おふとん", "お や す み", "おやすみ", "ね ん ね", "ねんね", "neru")
ph(32, 3.5, "あ し た も ほ い く え ん", "G4 C5 C5 E5 E5 D5 C5 D5 E5", "あしたも ほいくえん", "final", new=True)
ph(34, 0, "が ん ば ろ う", "F5 F5 E5 D5 C5", "がんばろう!", "final")
ph(34, 3, "オ ー", "E5 E5", "オー!", "final")
ph(35, 0, "か づ き な ら で き る", "B4 B4 D5 D5 E5 E5 F5 D5", "かづきなら できる", "final", new=True)
ph(36, 0, "が ん ば ろ ー", "E5 E5 D5 C5 C5", "がんばろー!", "final")
ph(36, 3, "オ ー", "E5 E5", "オー!", "final")

CH = {"C": ("C2", ["G3", "C4", "E4"]), "F": ("F2", ["A3", "C4", "F4"]), "G": ("G2", ["G3", "B3", "D4"]),
      "Am": ("A2", ["A3", "C4", "E4"]), "Em": ("E2", ["G3", "B3", "E4"])}
CHORDS = ("C G  C F Am G  C G  Am Em F C G  Am Em  F C  G G  C G  Am Em  F C  G G  C G  Am Em  F C  C F G C").split()
CALM = {17, 18, 31, 32}
TALK = {9}


def load(name):
    with wave.open(os.path.join(HERE, "voice", name + ".wav")) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    x = base.trim(x)
    y = resample_poly(x, SR, sr)
    return y / (np.abs(y).max() + 1e-9)


def main(out):
    rng = np.random.default_rng(21)
    N = int(TOTAL * SR)
    voice, mel, back = np.zeros(N), np.zeros(N), np.zeros(N)

    def add(buf, y, t, g=1.0):
        i = int(t * SR)
        y = y[: max(0, N - i)]
        buf[i: i + len(y)] += y * g

    timeline = []
    for bar, beat, morae, notes, lyric, scene, line in SONG:
        t0 = bar * BAR + beat * BEAT
        add(voice, base.sing(morae, notes), t0)
        for i, nn in enumerate(notes):
            if morae[i] not in ("ー", "っ") or i == 0:
                add(mel, tone(hz(nn) * 2, 0.4, "bell"), t0 + i * E, 0.10)
                add(mel, tone(hz(nn), 0.25, "pluck"), t0 + i * E, 0.09)
        timeline.append({"t": round(t0, 3), "d": round(len(morae) * E, 3), "text": lyric, "scene": scene, "line": line})
    for bar, beat, name, text, scene, line in SPEECH:
        t0 = bar * BAR + beat * BEAT
        y = load(name)
        add(voice, y, t0, 1.25)
        timeline.append({"t": round(t0, 3), "d": round(len(y) / SR, 3), "text": text, "scene": scene, "line": line, "spoken": True})
    timeline.sort(key=lambda p: p["t"])

    assert len(CHORDS) == 37, len(CHORDS)
    for b, name in enumerate(CHORDS):
        t0 = b * BAR
        r, ch = hz(CH[name][0]), CH[name][1]
        calm, talk, last = b in CALM, b in TALK, b == 36
        g = 0.55 if talk or b in (10, 11, 12) else 1.0  # せんせいのセリフのときは伴奏をひかえめに
        for i in range(4):
            tb = t0 + i * BEAT
            if calm:
                add(back, tone(hz(ch[i % 3]) * 2, 0.5, "bell"), tb, 0.13)
                add(back, tone(hz(ch[(i + 1) % 3]) * 2, 0.5, "bell"), tb + E, 0.10)
                if i % 2 == 0:
                    add(back, kick(), tb, 0.35)
                continue
            add(back, kick(), tb, 0.6 * g)
            # ファンクっぽいベース: 1拍目どっしり、裏でオクターブ
            add(back, tone(r, 0.2, "bass"), tb, 0.5 * g)
            add(back, tone(r * 2, 0.1, "bass"), tb + E, 0.3 * g)
            if i in (1, 3):
                add(back, tone(r * 1.5, 0.1, "bass"), tb + E * 1.5, 0.26 * g)
                if b >= 2:
                    add(back, clap(rng), tb, 0.26 * g)
            for n in ch:  # ピアノのきざみ
                add(back, tone(hz(n) * 2, 0.14, "pluck"), tb, 0.07 * g)
                add(back, tone(hz(n) * 2, 0.12, "pluck"), tb + E, 0.14 * g)
            for k in range(4):
                add(back, hat(rng), tb + k * E / 2, (0.13 if k == 2 else 0.05) * g)
        if calm:
            add(back, tone(r, BAR * 0.95, "bass"), t0, 0.4)
            for n in ch:
                add(back, tone(hz(n), BAR, "pad"), t0, 0.03)
        if b in (1, 5, 12, 18, 22, 26, 30, 32):  # フィルイン
            for i in range(8):
                add(back, clap(rng), t0 + 2 * BEAT + i * E / 2, (0.05 + 0.02 * i) * (0.6 if b == 12 else 1))
        if b in (2, 6, 13, 19, 23, 27, 33):
            n = int(0.9 * SR)
            add(back, np.diff(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5), prepend=0), t0, 0.12)
        if b == 24:  # ダンスのところはキラキラ
            for i, n in enumerate(["C6", "E6", "G6", "E6", "C6", "E6", "G6", "C7"]):
                add(back, tone(hz(n), 0.2, "bell"), t0 + i * E, 0.14)
    for bar, notes in ((0, "C5 C5 E5 E5 D5 C5 D5 E5"), (1, "F5 F5 E5 D5 C5 - - -")):  # イントロ
        for i, n in enumerate(notes.split()):
            if n != "-":
                add(mel, tone(hz(n) * 2, 0.5, "bell"), bar * BAR + i * E, 0.3)
                add(mel, tone(hz(n), 0.3, "pluck"), bar * BAR + i * E, 0.2)
    for i, n in enumerate(["C5", "E5", "G5", "C6"]):
        add(back, tone(hz(n), 1.2, "bell"), 36 * BAR + 3.9 * BEAT + i * 0.04, 0.2)

    mix = voice * 0.66 + mel + back
    mix = np.tanh(mix * 1.15)
    mix /= np.abs(mix).max() / 0.95
    fo = int(0.25 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)
    with wave.open(f"{out}/song.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    json.dump(timeline, open(f"{out}/timeline.json", "w"), ensure_ascii=False, indent=1)
    print("ok", len(timeline), "phrases, last ends", max(p["t"] + p["d"] for p in timeline))


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
