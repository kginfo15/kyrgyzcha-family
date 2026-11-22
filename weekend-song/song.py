"""「こんしゅうも がんばったね」(しゅうまつのうた)— 歌声+伴奏を合成して song.wav と timeline.json を出力する。

これまでの曲とちがい、ゆったりテンポ・低めで自然な声・ギター風アルペジオのやさしい伴奏。
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
BPM = 104
BEAT = 60 / BPM
E = BEAT / 2
BAR = BEAT * 4
TOTAL = 60.0
base.E = E
base.VOICE_SHIFT = 0.5   # 話し声に近い高さ(ソ3〜ミ4)で、聞き取りやすく
base.FORMANT = 1.04      # 声質はほぼそのまま
tone, kick, hat, clap, hz = base.tone, base.kick, base.hat, base.clap, base.hz

RG = "B4 B4 D5 D5 E5 D5"
RA = "C5 C5 E5 E5 D5 C5"
GANBA = ("が ん ば っ た ね", "がんばったね")
SONG = [
    (2, 0, "に ち か ちゃ ん と", "E5 E5 D5 C5 C5 D5", "にちかちゃんと", "futari"),
    (3, 0, "か づ き ちゃ ん", "C5 D5 C5 A4 A4", "かづきちゃん", "futari"),
    (4, 0, "きょ う も い ち に ち", "A4 A4 C5 C5 D5 C5 A4", "きょうも いちにち", "futari"),
    (5, 0, GANBA[0], RG, GANBA[1], "futari"),
    (6, 0, "か づ き は こ う さ く", "E5 E5 D5 C5 C5 D5 E5 E5", "かづきは こうさく", "kousaku"),
    (7, 0, "だ ん ボ ー ル で", "C5 C5 A4 A4 C5 A4", "だんボールで", "kousaku"),
    (8, 0, "お え か き も", "A4 C5 C5 D5 C5", "おえかきも", "kzoekaki"),
    (9, 0, GANBA[0], RG, GANBA[1], "kzoekaki"),
    (10, 0, "に ち か は い ろ ぬ り", "E5 E5 D5 C5 C5 D5 E5 E5", "にちかは いろぬり", "nurie"),
    (11, 0, GANBA[0], RA, GANBA[1], "nurie"),
    (12, 0, "ちょ っ と な い た け ど", "A4 A4 A4 C5 D5 D5 C5 A4", "ちょっと ないたけど", "naku"),
    (13, 0, "か づ き が よ し よ し", "B4 B4 D5 D5 E5 D5 E5 D5", "かづきが よしよし", "naku"),
    (14, 0, "お う ち で い ち に ち", "E5 E5 D5 C5 C5 D5 E5 E5", "おうちで いちにち", "ouchi"),
    (15, 0, GANBA[0], RA, GANBA[1], "ouchi"),
    (16, 0, "パ パ の た ん じょ う び", "C5 C5 A4 C5 D5 E5 D5 C5", "パパの たんじょうび", "tanjoubi"),
    (17, 0, "お い わ い し た ね", "B4 B4 D5 D5 E5 D5 D5", "おいわい したね", "tanjoubi"),
    (18, 0, "み ん な で ケ ー キ を", "C5 C5 E5 E5 E5 E5 D5 C5", "みんなで ケーキを", "cake"),
    (19, 0, "つ く っ て く れ た", "B4 B4 B4 D5 E5 D5 B4", "つくってくれた", "cake"),
    (20, 0, "お に く も た べ た ね", "A4 A4 C5 C5 D5 C5 D5 C5", "おにくも たべたね", "niku"),
    (21, 0, "あ り が と う", "D5 E5 D5 B4 B4", "ありがとう", "niku"),
    (22, 0, "こ ん しゅ う も ふ た り", "E5 E5 D5 C5 C5 D5 E5 E5", "こんしゅうも ふたり", "konshu"),
    (23, 0, GANBA[0], RA, GANBA[1], "konshu"),
    (23, 3.5, "あ し た も ほ い く え ん", "G4 A4 C5 C5 D5 D5 E5 E5 D5", "あしたも ほいくえん", "ashita"),
    (25, 0, "が ん ば ろ う", "C5 C5 E5 D5 C5", "がんばろう!", "ashita"),
]

CH = {"C": ("C2", ["C3", "G3", "C4", "E4"]), "F": ("F2", ["F3", "A3", "C4", "E4"]), "G": ("G2", ["G3", "B3", "D4", "F4"]),
      "Am": ("A2", ["A3", "C4", "E4", "G4"]), "Em": ("E2", ["E3", "G3", "B3", "D4"]), "Dm": ("D2", ["D3", "A3", "C4", "F4"])}
CHORDS = "C G  C Am F G  C Am F G  C Am Dm G  C Am F G  Am Em F G  C Am F C".split()


def guitar(freq, dur, vol=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    y = sum(np.sin(2 * np.pi * freq * m * t) * np.exp(-t * (3 + m * 1.6)) / m ** 1.3 for m in range(1, 7))
    a = int(0.003 * SR)
    y[:a] *= np.linspace(0, 1, a)
    return y * vol


def main(out):
    rng = np.random.default_rng(5)
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
        for i, nn in enumerate(notes):  # メロディはうっすら(声をじゃましない)
            if morae[i] not in ("ー", "っ") or i == 0:
                add(mel, tone(hz(nn), 0.5, "bell"), t0 + i * E, 0.06)
        line = (bar + (1 if beat > 3 else 0)) // 2
        timeline.append({"t": round(t0, 3), "d": round(len(morae) * E, 3), "text": lyric, "scene": scene, "line": line})

    assert len(CHORDS) == 26, len(CHORDS)
    ARP = [0, 2, 1, 3, 2, 1, 3, 2]
    for b, name in enumerate(CHORDS):
        t0 = b * BAR
        r, ch = hz(CH[name][0]), CH[name][1]
        last = b == 25
        if last:
            for i, n in enumerate(ch):
                add(back, guitar(hz(n), 3.0), t0 + i * 0.06, 0.22)
            add(back, tone(r, 2.5, "bass"), t0, 0.5)
            for i, n in enumerate(["E5", "G5", "C6"]):
                add(back, tone(hz(n), 1.8, "bell"), t0 + 2.6 * BEAT + i * 0.12, 0.14)
            continue
        for i in range(8):  # ギター風アルペジオ
            add(back, guitar(hz(ch[ARP[i]]), 0.9), t0 + i * E, 0.17 if i % 2 == 0 else 0.12)
        for n in ch[1:]:
            add(back, tone(hz(n), BAR, "pad"), t0, 0.014)
        # ボサノバっぽいベース
        for bt, g in ((0, 0.5), (1.5, 0.34), (2, 0.46), (3.5, 0.3)):
            add(back, tone(r * (1.5 if bt in (2, 3.5) else 1), 0.5, "bass"), t0 + bt * BEAT, g)
        if b >= 2:
            add(back, kick(), t0, 0.32)
            add(back, kick(), t0 + 2 * BEAT, 0.26)
            for i in range(8):  # シェイカー
                add(back, hat(rng), t0 + i * E, 0.07 if i % 2 else 0.035)
            for bt in (1, 2.5, 3):  # リムショット風
                add(back, tone(1800, 0.03, "pluck"), t0 + bt * BEAT, 0.10)
    # イントロ: 鉄琴で「がんばったね」のふし
    for i, n in enumerate("C5 C5 E5 E5 D5 C5 - - B4 B4 D5 D5 E5 D5 - -".split()):
        if n != "-":
            add(mel, tone(hz(n), 0.7, "bell"), i * E, 0.22)

    mix = voice * 0.85 + mel + back
    mix = np.tanh(mix * 1.1)
    mix /= np.abs(mix).max() / 0.95
    fo = int(0.5 * SR)
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
