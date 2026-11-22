# ロシア語（アクセント記号つき）→ カタカナ読み。B1追加分の読みがなを自動で作るための簡易変換。
# 方針：アクセントのある母音は長音「ー」、アクセントのない о は「ア」、е・я は「イ」に近づける（既存データの書き方に合わせる）。
import re
ACUTE = "́"
VOW = "аеёиоуыэюя"
SOFTV = "еёиюя"
# 子音 → (硬い a,i,u,e,o), (やわらかい a,i,u,e,o)
C = {
 "б": ("バ ビ ブ ベ ボ", "ビャ ビ ビュ ビェ ビョ", "ブ", "ビ", "プ"),
 "в": ("ヴァ ヴィ ヴ ヴェ ヴォ", "ヴャ ヴィ ヴュ ヴィェ ヴョ", "ヴ", "ヴィ", "フ"),
 "г": ("ガ ギ グ ゲ ゴ", "ギャ ギ ギュ ゲ ギョ", "グ", "ギ", "ク"),
 "д": ("ダ ディ ドゥ デ ド", "ジャ ジ ジュ ジェ ジョ", "ド", "ジ", "ト"),
 "ж": ("ジャ ジ ジュ ジェ ジョ", "ジャ ジ ジュ ジェ ジョ", "ジュ", "ジ", "シュ"),
 "з": ("ザ ズィ ズ ゼ ゾ", "ジャ ジ ジュ ジェ ジョ", "ズ", "ジ", "ス"),
 "й": ("ヤ イ ユ イェ ヨ", "ヤ イ ユ イェ ヨ", "イ", "イ", "イ"),
 "к": ("カ キ ク ケ コ", "キャ キ キュ ケ キョ", "ク", "キ", "ク"),
 "л": ("ラ リ ル レ ロ", "リャ リ リュ リェ リョ", "ル", "リ", "ル"),
 "м": ("マ ミ ム メ モ", "ミャ ミ ミュ ミェ ミョ", "ム", "ミ", "ム"),
 "н": ("ナ ニ ヌ ネ ノ", "ニャ ニ ニュ ニェ ニョ", "ン", "ニ", "ン"),
 "п": ("パ ピ プ ペ ポ", "ピャ ピ ピュ ピェ ピョ", "プ", "ピ", "プ"),
 "р": ("ラ リ ル レ ロ", "リャ リ リュ リェ リョ", "ル", "リ", "ル"),
 "с": ("サ スィ ス セ ソ", "シャ シ シュ シェ ショ", "ス", "シ", "ス"),
 "т": ("タ ティ トゥ テ ト", "チャ チ チュ チェ チョ", "ト", "チ", "ト"),
 "ф": ("ファ フィ フ フェ フォ", "フャ フィ フュ フィェ フョ", "フ", "フィ", "フ"),
 "х": ("ハ ヒ フ ヘ ホ", "ヒャ ヒ ヒュ ヘ ヒョ", "フ", "ヒ", "フ"),
 "ц": ("ツァ ツィ ツ ツェ ツォ", "ツァ ツィ ツ ツェ ツォ", "ツ", "ツ", "ツ"),
 "ч": ("チャ チ チュ チェ チョ", "チャ チ チュ チェ チョ", "チ", "チ", "チ"),
 "ш": ("シャ シ シュ シェ ショ", "シャ シ シュ シェ ショ", "シュ", "シ", "シュ"),
 "щ": ("シャ シ シュ シェ ショ", "シャ シ シュ シェ ショ", "シ", "シ", "シ"),
}
VOICED = set("бвгджз")
VOICELESS = set("пфктшсхцчщ")
DEVOICE = {"б": "п", "в": "ф", "г": "к", "д": "т", "ж": "ш", "з": "с"}
BARE_V = {"a": "ア", "i": "イ", "u": "ウ", "e": "エ", "o": "オ"}
IOT = {"a": "ヤ", "i": "イ", "u": "ユ", "e": "イェ", "o": "ヨ"}
IDX = {"a": 0, "i": 1, "u": 2, "e": 3, "o": 4}
SPECIAL = {"что": "シト", "чтобы": "シトブィ", "что-то": "シタタ", "что-нибудь": "シタニブーチ", "его": "イヴォー", "сегодня": "シヴォードニャ",
           "конечно": "カニェーシナ", "скучно": "スクーシナ", "ничего": "ニチヴォー", "чего": "チヴォー", "кого": "カヴォー", "в": "ヴ", "с": "ス", "к": "ク", "здравствуйте": "ズドラーストヴイチェ", "чувство": "チューストヴァ", "солнце": "ソーンツェ", "сердце": "シェールツェ", "лестница": "リェースニツァ", "дождь": "ドーシチ", "счастье": "シャースチエ", "счастливый": "シシスリーヴィ"}

def _vowel(ch, stressed, final):
    """母音の (a/i/u/e/o, やわらかいか) を返す。アクセントのない母音は弱める。"""
    soft = ch in SOFTV
    base = {"а": "a", "я": "a", "о": "o", "ё": "o", "у": "u", "ю": "u", "ы": "i", "и": "i", "э": "e", "е": "e"}[ch]
    if not stressed:
        if base == "o": base = "a"
        if ch in "ея" and not final: base = "i"
        if ch == "е" and final: base = "e"
    return base, soft

def word_kana(w):
    raw = w.replace(ACUTE, "").lower()
    if raw in SPECIAL: return SPECIAL[raw]
    s = w.lower().replace("ться", "ца").replace("тся", "ца").replace("сч", "щ")
    # アクセント位置：´ の直前の母音、ё、または母音が1つだけの語
    letters = []; stress_idx = None
    for ch in s:
        if ch == ACUTE:
            if letters: stress_idx = len(letters) - 1
            continue
        letters.append(ch)
    if stress_idx is None:
        for i, ch in enumerate(letters):
            if ch == "ё": stress_idx = i
    vidx = [i for i, ch in enumerate(letters) if ch in VOW]
    # 母音が1つでアクセント記号のない語（я, на, бы など）は弱く短く読むので「ー」を付けない
    mono = stress_idx is None and len(vidx) == 1
    if mono: stress_idx = vidx[0]
    t = "".join(letters)
    # 形容詞・代名詞の語尾 -ого/-его の г は「ヴ」と読む
    t = re.sub(r"(?<=[оеё])г(?=о$)", "в", t) if re.search(r"[ое]го$", t) and len(t) > 3 else t
    if len(t) != len(letters):
        # 置き換えで長さが変わった場合はアクセント位置を末尾側からずらす
        shift = len(letters) - len(t)
        if stress_idx is not None and stress_idx >= len(t): stress_idx = max(0, stress_idx - shift)
    out = []; i = 0; n = len(t)
    while i < n:
        ch = t[i]
        if ch in "ъь-": i += 1; continue
        if ch in VOW:
            base, soft = _vowel(ch, i == stress_idx, i == n - 1)
            prev = t[i - 1] if i > 0 else ""
            if soft and (i == 0 or prev in VOW or prev in "ъь" or prev == "-") and ch != "и":
                k = IOT["a" if ch == "я" else ("e" if ch == "е" else base)]
            elif ch == "ы":
                k = "ィ"
            else:
                k = BARE_V[base]
            out.append(k + ("ー" if i == stress_idx and not mono else ""))
            i += 1; continue
        if ch in C:
            hard, soft_row, bare, bare_soft, final_dev = C[ch]
            nxt = t[i + 1] if i + 1 < n else ""
            # 有声・無声の同化（語末の有声子音は無声になる）
            c2 = ch
            if ch in VOICED and (nxt == "" or nxt in VOICELESS or (nxt != "" and nxt in "ъь" and i + 2 >= n)): c2 = DEVOICE[ch]
            if nxt != "" and nxt in VOW:
                base, soft = _vowel(nxt, i + 1 == stress_idx, i + 1 == n - 1)
                row = (soft_row if soft else hard).split()
                if nxt == "ы": k = hard.split()[1] if ch not in "кгх" else hard.split()[1]
                else: k = row[IDX[base]]
                if nxt == "ы" and ch in "бвмпф": k = hard.split()[0][0] + "ィ" if False else {"б": "ブィ", "в": "ヴィ", "м": "ムィ", "п": "プィ", "ф": "フィ"}[ch]
                out.append(k + ("ー" if i + 1 == stress_idx and not mono else ""))
                i += 2; continue
            if nxt != "" and nxt == "ь":
                hs = C[c2] if c2 in C else C[ch]
                out.append(hs[3] if c2 == ch else C[c2][3]); i += 2; continue
            if c2 != ch: out.append(C[c2][2] if i + 1 < n else C[ch][4])
            else: out.append(bare)
            i += 1; continue
        i += 1
    return "".join(out)

def kana(text):
    """文や句をまとめて読みにする（語ごとにスペースで区切る）。"""
    parts = []
    for tok in text.split():
        core = re.sub(r"^[«\"(]+|[»\")?!.,:;—]+$", "", tok)
        if not re.search(r"[а-яё]", core.lower()): continue
        parts.append(word_kana(core))
    return " ".join(parts)

if __name__ == "__main__":
    for w in ["здра́вствуйте", "до́брый ве́чер", "спаси́бо", "хорошо́", "молоко́", "челове́к", "пятьдеся́т", "учи́ться", "жизнь", "го́род", "Я вчера́ ходи́л в больни́цу.", "но́вого", "впечатле́ние", "отноше́ние", "путеше́ствовать", "объясни́ть", "сча́стье", "дождь"]:
        print(w, "→", kana(w))
