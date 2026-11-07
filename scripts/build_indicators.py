#!/usr/bin/env python3
"""Build the per-pillar indicator data of monitor.html from indicators-raw.json.

  python3 scripts/build_indicators.py <indicators-raw.json> [monitor.html]

indicators-raw.json comes from scripts/fetch_indicators.py (the `indicators-data`
branch). The pillars, labels and targets per sector are written by hand in
scripts/indicators_spec.py. This script picks each series out of the raw file,
works out ✓/△/✕ ("at the current pace, does it reach the target in time?") and
rewrites the <script type="application/json" id="ind-<sector>"> tags between the
IND:AUTO markers in monitor.html. Health (id="ind-health") is hand-made and left alone.
"""
import json
import re
import sys

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from indicators_spec import SPEC, UPDATED  # noqa: E402

BEGIN, END = "<!--IND:AUTO-BEGIN-->", "<!--IND:AUTO-END-->"


def pick(raw, ref):
    """ref = ("wb", code) | ("sdg", code, {dim: value}) | ("who", code, "dimkey")"""
    kind, code = ref[0], ref[1]
    if kind == "wb":
        x = raw["wb"].get(code)
        return [list(p) for p in x["s"]] if x else []
    if kind == "sdg":
        x = raw["sdg"].get(code)
        if not x:
            return []
        want = ref[2] if len(ref) > 2 else {}
        for k, s in x["dims"].items():
            dims = json.loads(k)
            dims.pop("Reporting Type", None)
            if dims == want:
                return sorted({p[0]: p[1] for p in s}.items())   # the API repeats rows
        return []
    if kind == "who":
        x = raw["who"].get(code)
        return [list(p) for p in x["dims"].get(ref[2], [])] if x else []
    raise ValueError(ref)


def series(raw, ref, spec):
    s = [[int(y), float(v)] for y, v in pick(raw, ref)]
    f = spec.get("from", 2010)
    s = [p for p in s if p[0] >= f and p[0] not in spec.get("drop", [])]
    if spec.get("flip"):            # e.g. 100 - fossil share = non-fossil share
        s = [[y, spec["flip"] - v] for y, v in s]
    k = spec.get("scale", 1)
    nd = spec.get("nd", 1)
    return [[y, round(v * k, nd)] for y, v in s]


def slope(s):
    s = s[-8:]
    n = len(s)
    mx = sum(p[0] for p in s) / n
    my = sum(p[1] for p in s) / n
    den = sum((p[0] - mx) ** 2 for p in s)
    return (sum((p[0] - mx) * (p[1] - my) for p in s) / den) if den else 0.0, mx, my


def fmt(v):
    return f"{v:,.1f}".rstrip("0").rstrip(".") if abs(v) < 1000 else f"{v:,.0f}"


def judge(ind):
    """✓ already met or on pace / △ right way but short / ✕ wrong way or flat. Returns (status, text)."""
    s, up = ind["s"], ind["dir"] == "up"
    if len(s) < 3:
        return "na", "— データが少なく判定できない"
    b, mx, my = slope(s)
    last = s[-1][1]
    span = max(abs(p[1]) for p in s) or 1
    flat = abs(b) < span * 0.002
    trend = "横ばい" if flat else ("増加" if b > 0 else "減少")
    tg = [t for t in ind.get("t", []) if t.get("judge", True)]
    if not tg:
        return "na", f"— 目標値なし（{trend}傾向）"
    t = next((t for t in tg if t["k"] == "nat"), tg[0])
    good = (lambda v: v >= t["v"]) if up else (lambda v: v <= t["v"])
    if good(last):
        return "good", f"✓ 目標（{t['l']}）を達成済み"
    proj = my + b * (t["y"] - mx)
    if good(proj):
        return "good", f"✓ 今のペースで{t['y']}年に目標に届く見込み"
    if not flat and (b > 0) == up:
        return "warn", f"△ 今のペースだと{t['y']}年に約{fmt(proj)}"
    return "bad", "✕ 横ばいで目標に近づいていない" if flat else "✕ 目標と逆の方向に動いている"


def build_ind(raw, spec):
    ind = {k: v for k, v in spec.items() if k in ("name", "unit", "dir", "t", "src", "note", "ymin", "ymax", "sn", "s2n")}
    ind["s"] = series(raw, spec["ref"], spec)
    if not ind["s"]:
        raise ValueError(f"no data for {spec['name']} {spec['ref']}")
    if spec.get("ref2"):
        ind["s2"] = series(raw, spec["ref2"], spec)
    ind.setdefault("t", [])
    if spec.get("status"):
        ind["status"], ind["st"] = spec["status"], spec["st"]
    else:
        ind["status"], ind["st"] = judge(ind)
    return ind


def build(raw):
    out = {}
    for sec, D in SPEC.items():
        pillars = []
        for p in D["pillars"]:
            q = {k: v for k, v in p.items() if k not in ("inds", "detail")}
            q["inds"] = [build_ind(raw, i) for i in p.get("inds", [])]
            if p.get("detail"):
                q["detail"] = {"title": p["detail"]["title"], "inds": [build_ind(raw, i) for i in p["detail"]["inds"]]}
            pillars.append(q)
        out[sec] = {"updated": UPDATED, "fetched": raw.get("fetched"), "srcs": D.get("srcs", ""), "s2label": D.get("s2label"),
                    "pillars": pillars}
    return out


def main(rawpath, html="monitor.html"):
    raw = json.load(open(rawpath, encoding="utf-8"))
    data = build(raw)
    tags = "\n".join(
        f'<script type="application/json" id="ind-{sec}">' + json.dumps(d, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/") + "</script>"
        for sec, d in data.items())
    page = open(html, encoding="utf-8").read()
    if BEGIN not in page:
        raise SystemExit(f"{BEGIN} marker missing in {html}")
    page = re.sub(re.escape(BEGIN) + ".*?" + re.escape(END), lambda m: BEGIN + "\n" + tags + "\n" + END, page, flags=re.S)
    open(html, "w", encoding="utf-8").write(page)
    for sec, d in data.items():
        for p in d["pillars"]:
            for i in p["inds"] + (p.get("detail") or {}).get("inds", []):
                print(f"{sec:10} {p['id']:8} {i['s'][-1]} {i['st']}  | {i['name']}")


if __name__ == "__main__":
    main(*sys.argv[1:])
