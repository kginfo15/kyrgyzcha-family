"""Read the downloaded PDFs / JMA pages (scripts/pest/fetch.py) into pest.json.

usage: python3 scripts/pest/build.py OUT     (needs pdftotext from poppler)

  pest.json    counts per fiscal year x month x pest, JMA monthly weather for
               Tokyo, and the checks that were run
  pest.csv     the same counts in long format (one row per year/month/pest)
  report.json  which PDFs were read and every problem found

Tokyo's "被害発生・相談件数" PDF has one row per pest (about 87) with 12
months (April..March) and a total; each of the 12 classes ends with a 小計
row and the table with a 総計 row. Every year is checked:
  - the 12 months of each row add up to its total
  - the pests of each class add up to the class's 小計
  - the class 小計 rows equal the class rows of that year's 調査結果 PDF
  - the 小計 rows add up to the 総計
A year that fails a check is left out and listed in report.json.
The 調査結果 PDF alone (12 classes x month) is used for years without a
pest-level PDF (平成27年度).
"""
import datetime as dt
import json
import os
import re
import subprocess
import sys
import unicodedata
from html import unescape

OUT = sys.argv[1]
RAW = os.path.join(OUT, "raw")
report = {"built": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%MZ"), "pdfs": [], "problems": []}

CLASSES = ["吸血昆虫", "刺咬昆虫", "ダニ類", "細菌付着昆虫", "接触昆虫", "不快昆虫",
           "不快動物", "農林害虫", "食品・衣類害虫", "木材害虫", "ネズミ類", "その他"]
EN = ["Blood-sucking insects", "Stinging insects", "Mites & ticks", "Germ-carrying insects",
      "Skin-irritating insects", "Nuisance insects", "Nuisance animals", "Plant pests",
      "Food & clothes pests", "Wood pests", "Rats & mice", "Other"]
# middle level printed in a column of its own (vertically centred, so it can't
# be read from the row): which pest belongs to which group
GROUP_LABELS = {"シラミ類", "ノミ類", "カ類", "ハチ類", "ダニ類", "ゴキブリ類", "ハエ類", "ガ類", "シロアリ類"}
GROUP_OF = {
    "アタマジラミ": "シラミ類", "ケジラミ": "シラミ類", "コロモジラミ": "シラミ類",
    "ネコノミ": "ノミ類", "ヤブカ": "カ類", "イエカ": "カ類",
    "アシナガバチ": "ハチ類", "スズメバチ": "ハチ類", "ミツバチ": "ハチ類", "マルハナバチ": "ハチ類",
    "クマバチ": "ハチ類", "シバンムシアリガタバチ": "ハチ類",
    "ツメダニ": "ダニ類", "イエダニ": "ダニ類", "トリサシダニ": "ダニ類", "スズメサシダニ": "ダニ類",
    "ヒゼンダニ": "ダニ類", "マダニ": "ダニ類", "チリダニ": "ダニ類", "コナダニ": "ダニ類", "タカラダニ": "ダニ類",
    "チャバネゴキブリ": "ゴキブリ類", "クロゴキブリ": "ゴキブリ類", "ウジ": "ハエ類",
    "チャドクガ": "ガ類", "ドクガ": "ガ類", "イラガ": "ガ類", "ヤネホソバ": "ガ類",
    "ヤマトシロアリ": "シロアリ類", "イエシロアリ": "シロアリ類",
}
# "その他(ハチ)" -> ハチ類
for g in GROUP_LABELS:
    GROUP_OF["その他(" + g[:-1] + ")"] = g
# same pest, different spelling in some years
ALIASES = {"アリ(羽アリ)": "羽アリ", "羽アリ(アリ)": "羽アリ", "アリ(ハネアリ)": "羽アリ",
           "シバンムシアリガタ": "シバンムシアリガタバチ", "ヘアキャスト": "ヘアーキャスト"}

ERA = {"平成": 1988, "令和": 2018}
NUM = re.compile(r"^-?[\d,]+$")


def norm(s):
    return unicodedata.normalize("NFKC", s)


def fiscal_year(text):
    m = re.search(r"(平成|令和)\s*(元|\d+)\s*年度", norm(text[:600]))
    if not m:
        return None
    return ERA[m.group(1)] + (1 if m.group(2) == "元" else int(m.group(2)))


def pdf_text(path):
    r = subprocess.run(["pdftotext", "-layout", path, "-"], capture_output=True)
    return r.stdout.decode("utf-8", "replace")


def split_row(line):
    """name part and the 13 numbers (12 months + total) of a table row, or None."""
    toks = norm(line).split()
    if len(toks) < 13 or not all(NUM.match(t) for t in toks[-13:]):
        return None
    vals = [int(t.replace(",", "")) for t in toks[-13:]]
    return toks[:-13], vals


def clean_name(toks, cls):
    toks = [t for t in toks if t not in GROUP_LABELS]
    if toks and toks[0].isdigit():
        toks = toks[1:]
    # a character of the vertically printed class name ("吸", "木材", ...)
    label = CLASSES[cls] if cls is not None else ""
    if (len(toks) > 1 and len(toks[0]) <= 2 and all(c in label for c in toks[0])
            and "".join(toks) != "その他"):
        toks = toks[1:]
    name = "".join(toks)
    return ALIASES.get(name, name)


def read_detail(text):
    """{class index: {"items": {name: [12]}, "sub": [12]}}, total [12], problems"""
    out, total, probs = {}, None, []
    cls = None
    pending = []
    for line in text.splitlines():
        m = re.match(r"^\s*(\d{1,2})\s", norm(line))
        r = split_row(line)
        if m and 1 <= int(m.group(1)) <= 12 and not (r and len(r[0]) <= 1):
            cls = int(m.group(1)) - 1
        if r is None:
            if norm(line).strip():
                pending += norm(line).split()
            continue
        toks, vals = r
        if not [t for t in toks if not t.isdigit()] and pending:
            # name printed on the line(s) above the numbers: take its longest word
            label = CLASSES[cls] if cls is not None else ""
            words = [t for t in pending if t not in GROUP_LABELS and not t.isdigit()
                     and not all(c in label for c in t)]
            toks = [max(words, key=len)] if words else toks
        pending = []
        if sum(vals[:12]) != vals[12]:
            probs.append(f"row {''.join(toks)}: months add up to {sum(vals[:12])}, total says {vals[12]}")
        name = clean_name(toks, cls)
        if name in ("総計", "合計"):
            total = vals[:12]
            continue
        if cls is None:
            probs.append(f"row before the first class: {name}")
            continue
        c = out.setdefault(cls, {"items": {}, "sub": None})
        if name == "小計":
            c["sub"] = vals[:12]
            continue
        if name == "その他":
            name = "その他(" + CLASSES[cls] + ")"
        if name in c["items"]:
            probs.append(f"{CLASSES[cls]}: {name} appears twice")
        c["items"][name] = vals[:12]
    return out, total, probs


def read_summary(text):
    """12 class rows of the 調査結果 PDF: {class index: [12]}, total [12]"""
    out, total = {}, None
    for line in text.splitlines():
        r = split_row(line)
        if r is None:
            continue
        toks, vals = r
        name = "".join(t for t in toks if not t.isdigit())
        if name in ("合計", "総計"):
            if total is None:
                total = vals[:12]
                out["_year"] = vals[12]
            continue
        if name in CLASSES and CLASSES.index(name) not in out:
            out[CLASSES.index(name)] = vals[:12]
            if sum(vals[:12]) != vals[12]:
                out.setdefault("_bad", []).append(name)
    return out, total


def weather():
    """JMA monthly values for Tokyo: {calendar year: {var: [12]}}"""
    cols = {"t": 7, "tx": 8, "tn": 9, "txx": 10, "p": 3, "h": 12, "w": 14, "sun": 19}
    out = {}
    jdir = os.path.join(RAW, "jma")
    for f in sorted(os.listdir(jdir)):
        y = int(f[:4])
        html = open(os.path.join(jdir, f), encoding="utf-8", errors="replace").read()
        yr = {k: [None] * 12 for k in cols}
        for row in re.findall(r'<tr class="mtx"[^>]*>(.*?)</tr>', html, re.S):
            cells = [unescape(re.sub(r"<[^>]+>", "", c)).strip() for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]
            if not cells or not cells[0].isdigit():
                continue
            m = int(cells[0])
            for k, i in cols.items():
                v = cells[i] if i < len(cells) else ""
                # "]": too few observations (month not over yet) -> left out
                if not v or "]" in v or v in ("///", "×", "#", "--"):
                    v = "0" if (k == "p" and v == "--") else None
                if v is not None:
                    try:
                        yr[k][m - 1] = float(v.replace(")", ""))
                    except ValueError:
                        pass
        if any(x is not None for x in yr["t"]):
            out[str(y)] = yr
    return out


def main():
    pdfs = json.load(open(os.path.join(RAW, "pdfs.json")))
    detail, summary = {}, {}
    for p in pdfs:
        text = pdf_text(os.path.join(RAW, "pdf", p["file"]))
        # the text as read, kept next to the data so a parsing problem can be looked at
        os.makedirs(os.path.join(OUT, "text"), exist_ok=True)
        open(os.path.join(OUT, "text", p["file"][:-4] + ".txt"), "w").write(text)
        head = norm(text[:800])
        fy = fiscal_year(text)
        kind = ("detail" if "被害発生・相談件数" in head and "4月" in head
                else "summary" if "調査結果" in head and "月" in head else None)
        entry = {"file": p["file"], "url": p["url"], "label": p["label"], "year": fy, "kind": kind}
        report["pdfs"].append(entry)
        if fy is None or kind is None:
            continue
        if kind == "detail" and fy not in detail:
            d, tot, probs = read_detail(text)
            detail[fy] = {"classes": d, "total": tot, "problems": probs, "url": p["url"]}
            entry["rows"] = sum(len(c["items"]) for c in d.values())
        elif kind == "summary" and fy not in summary:
            s, tot = read_summary(text)
            ty = s.pop("_year", None)
            bad = s.pop("_bad", [])
            summary[fy] = {"classes": s, "total": tot, "total_year": ty, "bad": bad, "url": p["url"]}
            entry["rows"] = len(s)

    years = {}
    notes = []
    for fy in sorted(set(detail) | set(summary)):
        probs = []
        d, s = detail.get(fy), summary.get(fy)
        if d:
            probs += d["problems"]
            if len(d["classes"]) != 12:
                probs.append(f"found {len(d['classes'])} classes, expected 12")
            for ci, c in d["classes"].items():
                add = [sum(v[m] for v in c["items"].values()) for m in range(12)]
                if c["sub"] is None:
                    probs.append(f"{CLASSES[ci]}: no 小計 row")
                elif add != c["sub"]:
                    probs.append(f"{CLASSES[ci]}: pests add up to {sum(add)}, 小計 says {sum(c['sub'])}")
                if s and ci in s["classes"] and c["sub"] and s["classes"][ci] != c["sub"]:
                    probs.append(f"{CLASSES[ci]}: 小計 {sum(c['sub'])} differs from 調査結果 {sum(s['classes'][ci])}")
            if d["total"]:
                subs = [sum((c["sub"] or [0] * 12)[m] for c in d["classes"].values()) for m in range(12)]
                if subs != d["total"]:
                    probs.append(f"小計 rows add up to {sum(subs)}, 総計 says {sum(d['total'])}")
            else:
                probs.append("no 総計 row")
        if s and not d:
            probs += [f"調査結果 {n}: months do not add up to the row total" for n in s["bad"]]
            if len(s["classes"]) != 12:
                probs.append(f"調査結果: found {len(s['classes'])} classes")
            elif s["total"]:
                months = [sum(s["classes"][c][m] for c in range(12)) for m in range(12)]
                if sum(months) != s["total_year"]:
                    probs.append(f"調査結果: classes add up to {sum(months)}, 合計 says {s['total_year']}")
                elif months != s["total"]:
                    # 平成25年度: the 合計 row's months are misprinted in the PDF itself,
                    # while every class row and the yearly total agree
                    notes.append(f"{fy}年度: PDFの「合計」行の月別の数字に誤りがあるため、月の合計は12分類の数字を足して出しています(年間合計はPDFと一致)")
        if probs:
            report["problems"] += [f"{fy}: {x}" for x in probs]
            print(f"FY{fy}: left out ({len(probs)} problems)")
            for x in probs:
                print("   ", x)
            continue
        if d:
            years[str(fy)] = {"level": "pest", "source": d["url"], "classes": {
                str(ci): {"sub": c["sub"], "items": c["items"]} for ci, c in sorted(d["classes"].items())}}
        else:
            years[str(fy)] = {"level": "class", "source": s["url"], "classes": {
                str(ci): {"sub": v, "items": {}} for ci, v in sorted(s["classes"].items())}}
        print(f"FY{fy}: ok ({years[str(fy)]['level']})")

    # pest list in table order (first year it appears decides the place)
    pests = []
    for y in sorted(years):
        for ci, c in years[y]["classes"].items():
            for name in c["items"]:
                key = (int(ci), name)
                if key not in pests:
                    pests.append(key)
    pests.sort(key=lambda k: k[0])  # stable: keeps the table order inside a class
    data = {
        "built": report["built"],
        "classes": [{"ja": c, "en": e} for c, e in zip(CLASSES, EN)],
        "pests": [{"c": c, "name": n, "group": GROUP_OF.get(n)} for c, n in pests],
        "years": years,
        "weather": weather(),
        "problems": report["problems"],
        "notes": notes,
    }
    json.dump(data, open(os.path.join(OUT, "pest.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    months = [4, 5, 6, 7, 8, 9, 10, 11, 12, 1, 2, 3]
    with open(os.path.join(OUT, "pest.csv"), "w", encoding="utf-8-sig") as f:
        f.write("fiscal_year,calendar_year,month,class_no,class,group,pest,count\n")
        for y in sorted(years):
            for ci, c in years[y]["classes"].items():
                rows = list(c["items"].items()) or [("(小計)", c["sub"])]
                if c["items"]:
                    rows.append(("(小計)", c["sub"]))
                for name, vals in rows:
                    g = GROUP_OF.get(name) or ""
                    for i, m in enumerate(months):
                        cy = int(y) + (1 if m <= 3 else 0)
                        f.write(f"{y},{cy},{m},{int(ci)+1},{CLASSES[int(ci)]},{g},{name},{vals[i]}\n")
    report["notes"] = notes
    json.dump(report, open(os.path.join(OUT, "report.json"), "w"), ensure_ascii=False, indent=1)
    print(f"{len(years)} years, {len(pests)} pests, {len(report['problems'])} problems")


if __name__ == "__main__":
    main()
