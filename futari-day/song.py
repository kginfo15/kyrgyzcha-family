"""「かづきと にちかの いちにち」— 1日ぶん(40小節)を2回くりかえす歌。song.wav と timeline.json を出力する。

使い方: python3 song.py <出力ディレクトリ>   (../nichika-papa/song.py の合成エンジンを再利用)
サチノせんせいの英語のセリフ(voice/*.wav)は piper-tts (en_US-joe-medium) で作ったもの。
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
LOOP = 40            # 1日ぶんの小節数
TOTAL = LOOP * 2 * BAR + 2.0
TR = 2 ** (-2 / 12)
base.E = E
base.VOICE_SHIFT = TR
base.FORMANT = 1.2
tone, kick, hat, clap = base.tone, base.kick, base.hat, base.clap


def hz(n):
    return base.hz(n) * TR


SONG = []    # (bar, beat, morae, notes, lyric, scene, line)
SPEECH = []
_line = [0]
OFF = [0]


def ph(bar, beat, morae, notes, lyric, scene, new=False):
    if new:
        _line[0] += 1
    m, n = morae.split(), notes.split()
    assert len(m) == len(n), (lyric, len(m), len(n))
    SONG.append((bar + OFF[0], beat, m, n, lyric, scene, _line[0]))


def say(bar, beat, name, text, scene, new=False):
    if new:
        _line[0] += 1
    SPEECH.append((bar + OFF[0], beat, name, text, scene, _line[0]))


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


def day(last):
    ph(1, 3.5, "お は よ う ほ い く え ん", "G4 C5 C5 E5 E5 D5 C5 D5 E5", "おはよう ほいくえん", "toujou", new=True)
    ph(3, 0, "か づ き が", "F5 F5 E5 D5", "かづきが", "toujou")
    ph(3, 2, "と う じょ う", "C5 D5 E5 E5", "とうじょう!", "toujou")
    ph(4, 0, "きょ う は プ ー ル も", "A4 A4 C5 C5 C5 D5 E5", "きょうは プールも", "pool", new=True)
    ph(5, 0, "が ん ば っ た ね", "D5 E5 F5 E5 D5 D5", "がんばったね!", "pool")
    ph(6, 0, "サ チ ノ せ ん せ い", "C5 C5 E5 E5 D5 C5 C5", "サチノせんせい", "sachino", new=True)
    say(7, 0, "gm", "Good morning, everyone!", "gm")
    say(8, 0.5, "repeat", "Repeat after me!", "repeat", new=True)
    say(9, 0, "apple", "Apple!", "apple", new=True)
    ph(9, 2, "ア ッ プ ル", "E5 E5 C5 C5", "アップル!", "apple")
    say(10, 0, "hello", "Hello!", "hello")
    ph(10, 2, "ハ ロ ー", "F5 D5 D5", "ハロー!", "hello")
    say(11, 0, "good", "Very good!", "good", new=True)
    ph(11, 2, "や っ た ー", "D5 D5 F5 F5", "やったー!", "good")
    unit(12, 1, "じ ゆ う じ か ん", "じゆうじかん", "ノ ー ト に", "ノートに", "お え か き", "おえかき", "jiyu")
    unit(14, 2, "お ひ る ご は ん", "おひるごはん", "ぜ ん ぶ", "ぜんぶ", "た べ た", "たべた!", "lunch")
    unit(16, 3, "お ひ る ね タ イ ム", "おひるね タイム", "お や す み", "おやすみ", "ぐ ー ぐ ー", "ぐーぐー…", "hirune")
    unit(20, 0, "に ち か と お そ と で", "にちかと おそとで", "あ そ ぼ う", "あそぼう", "わ ー い", "わーい!", "soto")
    unit(22, 1, "マ マ が お む か え", "ママが おむかえ", "ふ た り で", "ふたりで", "か え ろ", "かえろ!", "mama")
    unit(24, 2, "リュ ッ ク と す い と う", "リュックと すいとう", "ノ ー ト も", "ノートも", "も っ た", "もった!", "bags")
    unit(26, 3, "ユ ー チュ ー ブ み て", "ユーチューブ みて", "お や つ", "おやつ", "も ぐ も ぐ", "もぐもぐ", "oyatsu")
    unit(28, 0, "マ マ の お て つ だ い", "ママの おてつだい", "で き た よ", "できたよ", "え ら い", "えらい!", "tetsudai")
    unit(30, 1, "パ パ も か え っ て", "パパも かえって", "よ に ん で", "よにんで", "ご は ん", "ごはん!", "papa", "gohan")
    unit(32, 2, "パ パ と お ふ ろ で", "パパと おふろで", "え の ぐ で", "えのぐで", "お え か き", "おえかき", "ofuro")
    unit(34, 3, "は み が き しゅ っ しゅ", "はみがき しゅっしゅ", "ド ラ イ ヤ ー", "ドライヤー", "ぶ お ー", "ぶおー", "hamigaki", "dryer", rbeat=2.5)
    unit(36, 2, "ふ わ ふ わ お ふ と ん", "ふわふわ おふとん", "お や す み", "おやすみ", "ね ん ね", "ねんね", "neru")
    if not last:
        ph(38, 0, "あ さ だ よ お は よ う", "C5 C5 E5 E5 D5 C5 D5 E5", "あさだよ おはよう", "asa", new=True)
        ph(39, 0, "も う い っ か い", "F5 F5 E5 D5 D5 C5", "もういっかい!", "asa")
    else:
        ph(38, 0, "きょ う も い ち に ち", "C5 C5 E5 E5 D5 C5 D5", "きょうも いちにち", "owari", new=True)
        ph(39, 0, "が ん ば っ た ね", "F5 F5 E5 D5 D5 C5", "がんばったね!", "owari")


day(False)
OFF[0] = LOOP
day(True)

CH = {"C": ("C2", ["G3", "C4", "E4"]), "F": ("F2", ["A3", "C4", "F4"]), "G": ("G2", ["G3", "B3", "D4"]),
      "Am": ("A2", ["A3", "C4", "E4"]), "Em": ("E2", ["G3", "B3", "E4"])}
CHORDS = ("C G  C F Am G  Am Em F C F G  Am Em  F C  G G F G  C G  Am Em  F C  G G  C G  Am Em  F C  G G  F C  C G").split()
CALM = {16, 17, 18, 19, 36, 37}
QUIET = {7, 8, 9, 10, 11}


def load(name):
    with wave.open(os.path.join(HERE, "voice", name + ".wav")) as w:
        sr = w.getframerate()
        x = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    y = resample_poly(base.trim(x), SR, sr)
    return y / (np.abs(y).max() + 1e-9)


def main(out):
    rng = np.random.default_rng(31)
    N = int(TOTAL * SR)
    voice, mel, back = np.zeros(N), np.zeros(N), np.zeros(N)

    def add(buf, y, t, g=1.0):
        i = int(t * SR)
        y = y[: max(0, N - i)]
        buf[i: i + len(y)] += y * g

    timeline = []
    cache = {}
    for bar, beat, morae, notes, lyric, scene, line in SONG:
        t0 = bar * BAR + beat * BEAT
        key = (tuple(morae), tuple(notes))
        if key not in cache:
            cache[key] = base.sing(morae, notes)
        add(voice, cache[key], t0)
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

    assert len(CHORDS) == LOOP, len(CHORDS)
    for bb in range(LOOP * 2):
        b = bb % LOOP
        name = CHORDS[b]
        t0 = bb * BAR
        r, ch = hz(CH[name][0]), CH[name][1]
        calm = b in CALM
        g = 0.5 if b in QUIET else 1.0
        intro = b < 2 and bb < LOOP
        for i in range(4):
            tb = t0 + i * BEAT
            if calm:
                add(back, tone(hz(ch[i % 3]) * 2, 0.5, "bell"), tb, 0.13)
                add(back, tone(hz(ch[(i + 1) % 3]) * 2, 0.5, "bell"), tb + E, 0.10)
                if i % 2 == 0 and b not in (18, 19):
                    add(back, kick(), tb, 0.3)
                continue
            add(back, kick(), tb, 0.6 * g)
            add(back, tone(r, 0.2, "bass"), tb, 0.5 * g)
            add(back, tone(r * 2, 0.1, "bass"), tb + E, 0.3 * g)
            if i in (1, 3):
                add(back, tone(r * 1.5, 0.1, "bass"), tb + E * 1.5, 0.26 * g)
                if not intro:
                    add(back, clap(rng), tb, 0.26 * g)
            for n in ch:
                add(back, tone(hz(n) * 2, 0.14, "pluck"), tb, 0.07 * g)
                add(back, tone(hz(n) * 2, 0.12, "pluck"), tb + E, 0.14 * g)
            for k in range(4):
                add(back, hat(rng), tb + k * E / 2, (0.13 if k == 2 else 0.05) * g)
        if calm:
            add(back, tone(r, BAR * 0.95, "bass"), t0, 0.4)
            for n in ch:
                add(back, tone(hz(n), BAR, "pad"), t0, 0.03)
        if b == 18:  # おひるねのオルゴール(2小節)
            for i, n in enumerate("E5 G5 C6 G5 A5 G5 E5 - D5 F5 B5 F5 G5 - - -".split()):
                if n != "-":
                    add(mel, tone(hz(n) * 2, 0.9, "bell"), t0 + i * E, 0.2)
        if b in (1, 5, 11, 19, 23, 27, 31, 35, 37, 39):  # フィルイン
            for i in range(8):
                add(back, clap(rng), t0 + 2 * BEAT + i * E / 2, (0.05 + 0.02 * i) * (0.5 if b in (11, 19, 37) else 1))
        if b in (2, 6, 12, 20, 24, 28, 32, 38):
            n = int(0.9 * SR)
            add(back, np.diff(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5), prepend=0), t0, 0.12)
        if b < 2:  # イントロ / 2日目のあさ
            notes = ("C5 C5 E5 E5 D5 C5 D5 E5", "F5 F5 E5 D5 C5 - - -")[b]
            for i, n in enumerate(notes.split()):
                if n != "-":
                    add(mel, tone(hz(n) * 2, 0.5, "bell"), t0 + i * E, 0.3)
                    add(mel, tone(hz(n), 0.3, "pluck"), t0 + i * E, 0.2)
    for i, n in enumerate(["C4", "G4", "C5", "E5", "G5", "C6"]):  # おしまいのジャーン
        add(back, tone(hz(n), 1.8, "bell"), LOOP * 2 * BAR + i * 0.05, 0.25)
    add(back, tone(hz("C2"), 1.8, "bass"), LOOP * 2 * BAR, 0.6)
    add(back, kick(), LOOP * 2 * BAR, 0.6)

    mix = voice * 0.66 + mel + back
    mix = np.tanh(mix * 1.15)
    mix /= np.abs(mix).max() / 0.95
    fo = int(0.5 * SR)
    mix[-fo:] *= np.linspace(1, 0, fo)
    with wave.open(f"{out}/song.wav", "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())
    json.dump(timeline, open(f"{out}/timeline.json", "w"), ensure_ascii=False, indent=1)
    print("ok", len(timeline), "phrases, total", TOTAL)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
