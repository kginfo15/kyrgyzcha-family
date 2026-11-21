"""「にちかちゃん えらいね!ソング」— 歌声+伴奏を合成して song.wav と timeline.json を出力する。

使い方: python3 song.py <出力ディレクトリ>   (../nichika-papa/song.py の合成エンジンを再利用)
"""
import json
import os
import sys
import wave

import numpy as np

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "nichika-papa"))
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
base.FORMANT = 1.22
tone, kick, hat, clap = base.tone, base.kick, base.hat, base.clap


def hz(n):
    return base.hz(n) * TR


SONG = []


def ph(bar, beat, morae, notes, lyric, scene):
    m = morae.split()
    SONG.append((bar, beat, m, notes.split()[: len(m)], lyric, scene))


def hook(bar, scene, last="に ち か は え ら い", last_lyric="にちかは えらい!", four=True):
    ph(bar, 0, "え ら い", "C5 E5 E5", "えらい", scene)
    ph(bar, 2, "え ら い", "C5 E5 E5", "えらい", scene)
    ph(bar + 1, 0, "に ち か は え ら い", "E5 E5 D5 C5 D5 E5 C5", "にちかは えらい!", scene)
    if four:
        ph(bar + 2, 0, "え ら い", "C5 F5 F5", "えらい", scene)
        ph(bar + 2, 2, "え ら い", "C5 F5 F5", "えらい", scene)
        ph(bar + 3, 0, last, "F5 E5 D5 D5 B4 C5 D5", last_lyric, scene)


# 2小節ユニット: (うたの前半8音, 後半4音, かけ声「えらい!」3音)
UNITS = [
    ("C5 C5 D5 E5 E5 D5 C5 D5", "D5 D5 B4 D5", "D5 D5 B4"),
    ("A4 A4 C5 E5 E5 D5 C5 C5", "B4 B4 D5 E5", "E5 E5 B4"),
    ("A4 C5 F5 F5 E5 D5 C5 A4", "C5 C5 D5 E5", "E5 E5 C5"),
    ("D5 D5 D5 E5 F5 E5 D5 D5", "B4 D5 D5 E5", "F5 F5 D5"),
]


def unit(bar, u, a, a_lyric, b, b_lyric, scene):
    A, B, R = UNITS[u]
    ph(bar, 0, a, A, a_lyric, scene)
    ph(bar + 1, 0, b, B, b_lyric, scene)
    ph(bar + 1, 2, "え ら い", R, "えらい!", scene)


hook(2, "hook", "す ご い ぞ に ち か", "すごいぞ にちか!")
unit(6, 0, "ほ い く え ん に", "ほいくえんに", "い っ て", "いって", "hoiku")
unit(8, 1, "か づ き と べ つ べ つ", "かづきと べつべつ", "へ い き で", "へいきで", "betsu")
unit(10, 2, "お と も だ ち に", "おともだちに", "や さ し い", "やさしい", "tomo")
unit(12, 3, "ふ た り で お ひ る ね", "ふたりで おひるね", "な か よ し", "なかよし", "hirune")
hook(14, "hook2", four=False)
unit(16, 0, "お や つ を は ん ぶ ん", "おやつを はんぶん", "ど う ぞ で", "どうぞで", "oyatsu")
unit(18, 1, "か づ き と な か よ し", "かづきと なかよし", "ま も っ て", "まもって", "mamoru")
unit(20, 2, "マ マ の お て つ だ い", "ママの おてつだい", "で き て", "できて", "tetsudai")
unit(22, 3, "く さ い パ パ と も", "くさい パパとも", "な か よ し", "なかよし", "papa")
unit(24, 0, "お え か き が ん ば る", "おえかき がんばる", "じょ う ず", "じょうず", "oekaki")
unit(26, 3, "お りょ う り て つ だ う", "おりょうり てつだう", "ま ぜ ま ぜ", "まぜまぜ", "gohan")
ph(28, 0, "た ま に は わ が ま ま", "A4 A4 C5 C5 D5 D5 C5 A4", "たまには わがまま", "naku")
ph(29, 0, "な い ちゃ う け ど", "B4 B4 D5 D5 D5 D5", "ないちゃう けど…", "naku")
ph(30, 0, "そ れ で も に ち か は", "C5 C5 E5 E5 D5 D5 C5 D5", "それでも にちかは", "soredemo")
ph(31, 0, "い つ で も え ら い", "D5 D5 E5 F5 F5 E5 D5", "いつでも えらい!", "soredemo")
hook(32, "final", "み ん な だ い す き", "みんな だいすき!")
ph(36, 0, "に ち か ー", "C5 E5 E5 E5", "にちか〜", "final")
ph(36, 2, "イェ ー イ", "E5 E5 E5", "イェーイ!", "final")

CH = {"C": ("C2", ["G3", "C4", "E4"]), "F": ("F2", ["A3", "C4", "F4"]), "G": ("G2", ["G3", "B3", "D4"]),
      "Am": ("A2", ["A3", "C4", "E4"]), "Em": ("E2", ["G3", "B3", "E4"])}
V = "C G Am Em F C G G"
CHORDS = f"C G  C Am F G  {V}  C G  {V}  C G G G  F G Am G  C Am F G C".split()


def main(out):
    rng = np.random.default_rng(11)
    N = int(TOTAL * SR)
    voice, mel, back = np.zeros(N), np.zeros(N), np.zeros(N)

    def add(buf, y, t, g=1.0):
        i = int(t * SR)
        y = y[: max(0, N - i)]
        buf[i: i + len(y)] += y * g

    timeline = []
    for bar, beat, morae, notes, lyric, scene in SONG:
        assert len(morae) == len(notes), lyric
        t0 = bar * BAR + beat * BEAT
        shout = lyric == "えらい!"
        add(voice, base.sing(morae, notes), t0, 1.15 if shout else 1.0)
        if shout:  # かけ声は3度上でハモって、みんなで言ってる感じに
            up = {"B4": "D5", "C5": "E5", "D5": "F5", "E5": "G5", "F5": "A5"}
            add(voice, base.sing(morae, [up[n] for n in notes]), t0 + 0.012, 0.55)
            for k in range(3):
                add(back, clap(rng), t0 + k * E, 0.3)
        for i, nn in enumerate(notes):
            if morae[i] not in ("ー", "っ") or i == 0:
                add(mel, tone(hz(nn) * 2, 0.4, "bell"), t0 + i * E, 0.11)
                add(mel, tone(hz(nn), 0.25, "pluck"), t0 + i * E, 0.10)
        timeline.append({"t": round(t0, 3), "d": round(len(morae) * E, 3), "text": lyric, "scene": scene, "line": bar // 2})

    assert len(CHORDS) == 37, len(CHORDS)
    for b, name in enumerate(CHORDS):
        t0 = b * BAR
        r, ch = hz(CH[name][0]), CH[name][1]
        calm = 28 <= b < 31
        last = b == 36
        for i in range(4):
            tb = t0 + i * BEAT
            if last and i >= 2:
                break
            if not calm or i % 2 == 0:
                add(back, kick(), tb, 0.6)
            if not calm:
                # スカっぽい裏打ち + はねるベース
                add(back, tone(r, 0.22, "bass"), tb, 0.5)
                add(back, tone(r * (1.5 if i % 2 else 2), 0.14, "bass"), tb + E, 0.34)
                for n in ch:
                    add(back, tone(hz(n) * 2, 0.12, "pluck"), tb + E, 0.15)
                if i % 2 == 1 and b >= 2:
                    add(back, clap(rng), tb, 0.24)
                for k in range(4):  # タンバリン
                    add(back, hat(rng), tb + k * E / 2, 0.13 if k == 2 else 0.05)
            else:
                add(back, tone(hz(ch[i % 3]) * 2, 0.5, "bell"), tb, 0.13)
                add(back, tone(hz(ch[(i + 1) % 3]) * 2, 0.5, "bell"), tb + E, 0.10)
        if calm:
            add(back, tone(r, BAR * 0.95, "bass"), t0, 0.42)
            for n in ch:
                add(back, tone(hz(n), BAR, "pad"), t0, 0.03)
        if b in (1, 5, 13, 15, 23, 27, 31):  # フィルイン
            for i in range(8):
                add(back, clap(rng), t0 + 2 * BEAT + i * E / 2, 0.06 + 0.025 * i)
        if b in (2, 6, 14, 16, 24, 32):
            n = int(0.9 * SR)
            add(back, np.diff(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5), prepend=0), t0, 0.12)
    # イントロ: フックを鉄琴で
    for bar, notes in ((0, "C5 E5 E5 - C5 E5 E5 -"), (1, "E5 E5 D5 C5 D5 E5 C5 -")):
        for i, n in enumerate(notes.split()):
            if n != "-":
                add(mel, tone(hz(n) * 2, 0.5, "bell"), bar * BAR + i * E, 0.3)
                add(mel, tone(hz(n), 0.3, "pluck"), bar * BAR + i * E, 0.2)
    for i, n in enumerate(["C5", "E5", "G5", "C6"]):  # おしまいのジャーン
        add(back, tone(hz(n), 1.4, "bell"), 36 * BAR + 3.6 * BEAT + i * 0.05, 0.25)

    mix = voice * 0.66 + mel + back
    mix = np.tanh(mix * 1.15)
    mix /= np.abs(mix).max() / 0.95
    fo = int(0.3 * SR)
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
