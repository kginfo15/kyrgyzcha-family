"""Read the Tokyo mosquito surveillance result tables (PDF) into rows.

Each table: one block of rows per facility (one row per mosquito group),
one column per survey round ("第N回", with its date range), then totals.
The reader works from word positions, because the facility names are written
vertically and some cells hold two rows. Every row is checked against the
PDF's own totals (round counts must add up to the row total, row totals to
the facility total); a table that does not add up is reported, not guessed.
"""
import re, unicodedata
import pdfplumber

Z2H = str.maketrans("０１２３４５６７８９", "0123456789")

# Mosquito groups as printed -> key used by the page
GROUPS = [
    ("ヒトスジシマカ群", "albopictus"),
    ("ネッタイシマカ", "aegypti"),
    ("その他のシマカ亜属", "stegomyia_other"),
    ("アカイエカ群", "pipiens"),
    ("アカイエカ（チカイエカ含む）", "pipiens"),
    ("アカイエカ(チカイエカ含む)", "pipiens"),
    ("ニセシロハシイエカ亜群", "vishnui"),
    ("コガタアカイエカ", "vishnui"),
    ("ハマダラカ", "anopheles"),
    ("その他の蚊", "other"),
]
GROUP_BY_LABEL = {unicodedata.normalize("NFKC", a): b for a, b in GROUPS}

SITES = {  # short key -> characters used to recognise the vertical name
    "oi": "大井ふ頭中央海浜公園", "odaiba": "お台場海浜公園", "odaiba_rainbow": "お台場レインボー公園",
    "aoyama": "青山霊園", "yanaka": "谷中霊園", "somei": "染井霊園", "shakujii": "石神井公園",
    "toneri": "舎人公園", "kinuta": "砧公園", "inokashira": "井の頭恩賜公園", "tamazoo": "多摩動物公園",
    "sayama": "狭山公園", "oyamada": "小山田緑地", "hachioji": "八王子霊園", "yakuyo": "薬用植物園",
    "jindai": "神代植物公園", "mizuho": "瑞穂農芸高等学校",
    "yoyogi": "代々木公園", "hibiya": "日比谷公園", "hamarikyu": "浜離宮恩賜庭園", "toyama": "戸山公園",
    "ueno": "上野恩賜公園", "komazawa": "駒沢オリンピック公園", "hikarigaoka": "光が丘公園",
    "sarue": "猿江恩賜公園", "kasai": "葛西臨海公園",
}
COMMON = set("公園霊恩賜海浜")


def norm(s):
    return unicodedata.normalize("NFKC", s).translate(Z2H).replace(" ", "")


def match_site(chars):
    """Pick the facility whose name shares the most distinctive characters."""
    cs = set(chars)
    best, score = None, 0
    for key, name in SITES.items():
        s = sum(2 if c not in COMMON else 1 for c in set(name) & cs) - 0.3 * len(set(name) - cs)
        if s > score:
            best, score = key, s
    return best


def num(t):
    t = norm(t)
    return int(t) if re.fullmatch(r"\d+", t) else None


def read_table(page):
    """One summary page -> (rounds, blocks). blocks: [{site, chars, rows:[{group, label, counts, total}], total}]."""
    ws = page.extract_words(x_tolerance=1.5, y_tolerance=1)
    heads = []
    for w in ws:
        m = re.fullmatch(r"第(\d+)回", norm(w["text"]))
        if m:
            heads.append((int(m.group(1)), (w["x0"] + w["x1"]) / 2, w["bottom"]))
    if len(heads) < 5:
        return None
    heads.sort()
    xs = [h[1] for h in heads]
    gap = (xs[-1] - xs[0]) / (len(xs) - 1)
    spans = [(x - gap / 2, x + gap / 2) for x in xs]
    head_bottom = max(h[2] for h in heads)
    # dates: "6/2～6/6" words under the round headers
    dates = [None] * len(xs)
    for w in ws:
        m = re.fullmatch(r"(\d+)/(\d+)[～~〜](\d+)/(\d+)", norm(w["text"]))
        if m and w["top"] < head_bottom + 40:
            cx = (w["x0"] + w["x1"]) / 2
            i = min(range(len(xs)), key=lambda k: abs(xs[k] - cx))
            if abs(xs[i] - cx) < gap / 2:
                dates[i] = tuple(int(g) for g in m.groups())
    # mosquito-group labels (left of the first round)
    labels = []
    for w in ws:
        t = norm(w["text"])
        if w["top"] > head_bottom and w["x1"] < spans[0][0] + 2 and t in GROUP_BY_LABEL:
            labels.append({"label": t, "group": GROUP_BY_LABEL[t], "x0": w["x0"],
                           "y": (w["top"] + w["bottom"]) / 2, "top": w["top"], "bottom": w["bottom"]})
    if not labels:
        return None
    labels.sort(key=lambda r: r["y"])
    lab_x0 = min(r["x0"] for r in labels)
    nums = [w for w in ws if w["top"] > head_bottom and num(w["text"]) is not None and w["x0"] > spans[0][0] - 2]
    texts = [w for w in ws if w["top"] > head_bottom and w["x0"] > spans[0][0] - 2 and num(w["text"]) is None]
    for r in labels:
        line = sorted((w for w in nums if abs((w["top"] + w["bottom"]) / 2 - r["y"]) < 2.2), key=lambda w: w["x0"])
        counts = [None] * len(xs)
        for i, (a, b) in enumerate(spans):
            inside = [w for w in line if a <= (w["x0"] + w["x1"]) / 2 < b]
            if inside:
                counts[i] = num(inside[0]["text"])
        right = [num(w["text"]) for w in line if (w["x0"] + w["x1"]) / 2 >= spans[-1][1]]
        r["counts"], r["right"] = counts, right
        # notes printed instead of a number (e.g. 欠測, 中止)
        r["notes"] = [None] * len(xs)
        for w in texts:
            if abs((w["top"] + w["bottom"]) / 2 - r["y"]) < 2.2:
                t = norm(w["text"])
                if re.search(r"欠|中止|未|休|－|-|―", t):
                    cx = (w["x0"] + w["x1"]) / 2
                    for i, (a, b) in enumerate(spans):
                        if a <= cx < b and counts[i] is None:
                            r["notes"][i] = t
    # facility blocks: a new block starts where the first group of the page repeats
    first = labels[0]["group"]
    blocks, cur = [], None
    for r in labels:
        if r["group"] == first or cur is None:
            cur = {"rows": []}; blocks.append(cur)
        cur["rows"].append(r)
    fac = [w for w in ws if w["top"] > head_bottom and w["x1"] <= lab_x0 + 0.5 and len(norm(w["text"])) <= 3]
    for bi, b in enumerate(blocks):
        top = b["rows"][0]["top"] - 3
        bot = b["rows"][-1]["bottom"] + 3
        if bi + 1 < len(blocks):
            bot = min(bot, blocks[bi + 1]["rows"][0]["top"] - 0.5)
        chars = "".join(norm(w["text"]) for w in fac if top <= (w["top"] + w["bottom"]) / 2 <= bot)
        b["chars"] = chars
        b["site"] = None if ("合計" in chars or "総計" in chars or chars in ("", "計")) else match_site(chars)
        # facility total: the extra number to the right of the row totals
        extras = [x for r in b["rows"] for x in r["right"][1:]]
        loose = [num(w["text"]) for w in nums if (w["x0"] + w["x1"]) / 2 >= spans[-1][1]
                 and top <= (w["top"] + w["bottom"]) / 2 <= bot
                 and all(abs((w["top"] + w["bottom"]) / 2 - r["y"]) >= 2.2 for r in b["rows"])]
        b["total"] = (extras + loose)[-1] if (extras + loose) else None
    return {"dates": dates, "blocks": blocks, "n": len(xs)}


def read_pdf(path):
    out = []
    with pdfplumber.open(path) as pdf:
        for pi, page in enumerate(pdf.pages):
            t = read_table(page)
            if t:
                t["page"] = pi + 1
                out.append(t)
    return out


def check(block):
    """Problems with one facility block, as text (empty list = all totals agree)."""
    probs = []
    for r in block["rows"]:
        vals = [c for c in r["counts"] if c is not None]
        tot = r["right"][0] if r["right"] else None
        if tot is not None and sum(vals) != tot:
            probs.append(f"{r['label']}: rounds add to {sum(vals)}, PDF says {tot}")
        if tot is None and vals:
            probs.append(f"{r['label']}: no row total")
    rows_tot = [r["right"][0] for r in block["rows"] if r["right"]]
    if block["total"] is not None and sum(rows_tot) != block["total"]:
        probs.append(f"rows add to {sum(rows_tot)}, facility total {block['total']}")
    return probs


if __name__ == "__main__":
    import sys
    for f in sys.argv[1:]:
        tabs = read_pdf(f)
        nb = sum(len(t["blocks"]) for t in tabs)
        bad = [(t["page"], b["chars"], p) for t in tabs for b in t["blocks"] for p in check(b)]
        sites = [b["site"] for t in tabs for b in t["blocks"]]
        print(f"{f}: pages {[t['page'] for t in tabs]} rounds {[t['n'] for t in tabs][:1]} blocks {nb} problems {len(bad)}")
        print("   sites:", sites)
        for x in bad[:8]:
            print("   !", x)
