"""「かずきの がんばってる!ソング」— 歌声+伴奏を合成して song.wav と timeline.json を出力する。

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
BPM = 144
BEAT = 60 / BPM
E = BEAT / 2
BAR = BEAT * 4
TOTAL = 60.0
TR = 2 ** (-2 / 12)  # 全体を全音下げ(声のいちばん高いところ ≒ ミ♭5)
base.E = E
base.VOICE_SHIFT = TR  # 前の曲より約5度高い声
base.FORMANT = 1.22
tone, kick, hat, clap = base.tone, base.kick, base.hat, base.clap


def hz(n):
    return base.hz(n) * TR


HOOK1 = "G4 C5 E5 E5 D5 C5"
HOOK2 = "A4 C5 F5 F5 E5 D5"
HAI = ("ハ イ", "E5 E5", "ハイ!")
SONG = [
    (2, 0, "が ん ば っ て る", HOOK1, "がんばってる", "hook"), (2, 3, *HAI, "hook"),
    (3, 0, "が ん ば っ て る", HOOK2, "がんばってる", "hook"), (3, 3, *HAI, "hook"),
    (4, 0, "か ず き は い つ も", "C5 D5 E5 E5 D5 C5 D5", "かずきは いつも", "hook"),
    (5, 0, "が ん ば っ て る ー", "E5 E5 D5 D5 C5 C5 C5", "がんばってる!", "hook"),
    (6, 0, "す い よ う び は", "C5 C5 D5 D5 E5 C5", "すいようびは", "pool"),
    (7, 0, "プ ー ル に い く よ", "A4 A4 C5 D5 E5 D5 C5", "プールに いくよ", "pool"),
    (8, 0, "ば しゃ ば しゃ", "E5 C5 E5 C5", "ばしゃばしゃ", "pool"),
    (8, 2, "ば しゃ ば しゃ", "D5 B4 D5 B4", "ばしゃばしゃ", "pool"),
    (9, 0, "が ん ば っ て る", HOOK1, "がんばってる", "pool"), (9, 3, *HAI, "pool"),
    (10, 0, "ま い に ち", "C5 C5 D5 E5", "まいにち", "study"),
    (10, 2, "べ ん きょ う", "E5 D5 C5 C5", "べんきょう", "study"),
    (11, 0, "が ん ば っ て る", HOOK2, "がんばってる", "study"), (11, 3, *HAI, "study"),
    (12, 0, "え ん ぴ つ", "A4 A4 C5 C5", "えんぴつ", "study"),
    (12, 2, "も っ て", "D5 D5 E5", "もって", "study"),
    (13, 0, "か き か き か き", "E5 C5 E5 C5 D5 D5", "かきかきかき", "study"), (13, 3, *HAI, "study"),
    (14, 0, "お り が み", "C5 D5 E5 E5", "おりがみ", "origami"),
    (14, 2, "だ い す き", "D5 E5 D5 C5", "だいすき", "origami"),
    (15, 0, "つ る も お れ る よ", "A4 C5 C5 D5 E5 D5 C5", "つるも おれるよ", "origami"),
    (16, 0, "お え か き", "C5 D5 E5 E5", "おえかき", "oekaki"),
    (16, 2, "だ い す き", "F5 E5 D5 C5", "だいすき", "oekaki"),
    (17, 0, "に じ い ろ ク レ ヨ ン", "D5 D5 E5 E5 D5 C5 B4 B4", "にじいろ クレヨン", "oekaki"),
    (18, 0, "マ マ に お て が み", "C5 C5 A4 C5 D5 E5 E5", "ママに おてがみ", "tegami"),
    (19, 0, "い つ も か く よ", "D5 D5 E5 D5 C5 C5", "いつも かくよ", "tegami"),
    (20, 0, "マ マ だ い す き っ て", "E5 E5 D5 E5 D5 C5 C5 D5", "「ママ だいすき」って", "tegami2"),
    (21, 0, "か い て あ る よ ー", "E5 E5 D5 D5 C5 C5 C5", "かいてあるよ", "tegami2"),
    (22, 0, "か ず き は お り こ う", "A4 A4 C5 C5 D5 E5 D5 C5", "かずきは おりこう", "oriko"),
    (23, 0, "や さ し い ね え ね", "A4 C5 D5 D5 E5 D5 D5", "やさしい ねえね", "oriko"),
    (24, 0, "に ち か を い つ も", "C5 C5 D5 D5 E5 E5 D5", "にちかを いつも", "mamoru"),
    (25, 0, "ま も っ て る ー", "E5 F5 F5 E5 D5 D5", "まもってる!", "mamoru"),
    (26, 0, "に ち か が だ い す き", "C5 D5 E5 E5 D5 E5 D5 C5", "にちかが だいすき", "nsuki"),
    (27, 0, "ぎゅ っ", "E5 E5", "ぎゅっ", "nsuki"), (27, 1, "ぎゅ っ", "D5 D5", "ぎゅっ", "nsuki"),
    (27, 2, "ぎゅ ー", "C5 C5", "ぎゅー", "nsuki"), (27, 3, *HAI, "nsuki"),
    (28, 0, "パ パ も だ い す き", "E5 E5 C5 D5 E5 D5 C5", "パパも だいすき", "fam1"),
    (29, 0, "マ マ も だ い す き", "F5 F5 D5 E5 F5 E5 D5", "ママも だいすき", "fam2"),
    (30, 0, "に ち か も だ い す き", "E5 E5 E5 C5 D5 E5 D5 C5", "にちかも だいすき", "fam3"),
    (31, 0, "わ た し が だ い す き", "D5 D5 D5 E5 F5 E5 D5 D5", "わたしが だいすき", "fam4"),
    (32, 0, "か ず き は い つ も", "C5 D5 E5 E5 D5 C5 D5", "かずきは いつも", "final"),
    (33, 0, "が ん ば っ て る ー", "E5 E5 D5 D5 C5 C5 C5", "がんばってる!", "final"),
    (34, 0, "きょ う も", "C5 D5 E5", "きょうも", "final"),
    (34, 2, "が ん ば る", "F5 F5 E5 D5", "がんばる", "final"),
    (35, 0, "か ず き ー", "C5 E5 E5 E5", "かずき〜", "final"),
    (35, 2, "イェ ー イ", "E5 E5 E5", "イェーイ!", "final"),
]

CH = {"C": ("C2", ["G3", "C4", "E4"]), "F": ("F2", ["A3", "C4", "F4"]), "G": ("G2", ["G3", "B3", "D4"]),
      "Am": ("A2", ["A3", "C4", "E4"]), "Em": ("E2", ["G3", "B3", "E4"])}
CHORDS = ("C G  C F C G  C Am F G  C Am F G  Am F C G  F G C C  F G Em Am F G  C G Am F  C F G C").split()


def main(out):
    rng = np.random.default_rng(3)
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
        add(voice, base.sing(morae, notes), t0)
        for i, nn in enumerate(notes):
            if morae[i] not in ("ー", "っ") or i == 0:
                add(mel, tone(hz(nn) * 2, 0.4, "bell"), t0 + i * E, 0.11)
                add(mel, tone(hz(nn), 0.25, "pluck"), t0 + i * E, 0.10)
        timeline.append({"t": round(t0, 3), "d": round(len(morae) * E, 3), "text": lyric, "scene": scene, "line": bar // 2})

    assert len(CHORDS) == 36
    for b, name in enumerate(CHORDS):
        t0 = b * BAR
        r, ch = hz(CH[name][0]), CH[name][1]
        calm = 22 <= b < 27
        for i in range(4):
            tb = t0 + i * BEAT
            if not calm or i % 2 == 0:
                add(back, kick(), tb, 0.6)
            if not calm:
                # はずむオクターブベース
                add(back, tone(r, 0.2, "bass"), tb, 0.5)
                add(back, tone(r * 2, 0.16, "bass"), tb + E, 0.36)
                for n in ch:
                    add(back, tone(hz(n) * 2, 0.16, "pluck"), tb + E, 0.12)
                if i % 2 == 1 and b >= 2:
                    add(back, clap(rng), tb, 0.26)
                add(back, hat(rng), tb + E, 0.15)
                add(back, hat(rng), tb + E / 2, 0.05)
                add(back, hat(rng), tb + E * 1.5, 0.05)
            else:
                add(back, tone(hz(ch[i % 3]) * 2, 0.5, "bell"), tb, 0.13)
                add(back, tone(hz(ch[(i + 1) % 3]) * 2, 0.5, "bell"), tb + E, 0.10)
                add(back, hat(rng), tb + E, 0.08)
        if calm:
            add(back, tone(r, BAR * 0.95, "bass"), t0, 0.42)
            for n in ch:
                add(back, tone(hz(n), BAR, "pad"), t0, 0.03)
        if b in (1, 5, 13, 21, 27, 31):  # フィルイン
            for i in range(8):
                add(back, clap(rng), t0 + 2 * BEAT + i * E / 2, 0.07 + 0.025 * i)
        if b in (2, 6, 14, 22, 28, 32):  # シンバルっぽい頭
            n = int(0.9 * SR)
            add(back, np.diff(rng.standard_normal(n) * np.exp(-np.arange(n) / SR * 5), prepend=0), t0, 0.12)
    # イントロ: フックのメロディを鉄琴で
    for bar, notes in ((0, HOOK1), (1, HOOK2)):
        for i, n in enumerate(notes.split()):
            add(mel, tone(hz(n) * 2, 0.5, "bell"), bar * BAR + i * E, 0.3)
            add(mel, tone(hz(n), 0.3, "pluck"), bar * BAR + i * E, 0.2)
    # おしまいのジャーン
    for i, n in enumerate(["C5", "E5", "G5", "C6"]):
        add(back, tone(hz(n), 1.2, "bell"), 35 * BAR + 3.5 * BEAT + i * 0.05, 0.25)

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
    print("ok", len(timeline), "phrases")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
