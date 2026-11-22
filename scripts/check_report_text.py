#!/usr/bin/env python3
"""Check a sector text report (report-text JSON) against the site's data.

Usage:
  python3 check_report_text.py REPORT.json MONITOR_HTML SECTOR_DATA_DIR
  python3 scripts/check_report_text.py monitor.html monitor.html SECTOR_DATA_DIR   (checks the report-text tag in the page)

SECTOR_DATA_DIR holds projects.json and items-YYYY.json from the sector-data branch.

What it checks (a sentence fails if it says something the data does not back):
  1. every sentence / card / indicator pick has at least one ref
  2. every ref points at something that exists:
       news:<id>   -> an item in items-*.json
       proj:<id>   -> a project in projects.json
       tree:<strategy>:<node> -> a node in the tree-<strategy> script tag
       row:<id>    -> a row of summary-spec for the sector
       ind:<pillar>:<n> -> the n-th indicator of that pillar in ind-<sector>
       fact:<key>  -> a key in the sector's "facts" block
       rep:<group> -> a group in reports-<sector>
  3. every number written in a k="f" sentence appears in the referenced data
     (news headline, project amount/date, tree node text, indicator values, facts).
     Numbers are compared loosely (rounding to the units used in the text), and a
     number that cannot be found is reported as "要確認", not silently accepted.
  4. no personal names: news headlines with a person's name must not be copied;
     the text is checked against a short list of words that signal a name copied
     from a headline (edit NAME_HINTS when needed).
Exit code 1 when anything fails, so it can run before a PR.
"""
import json, re, sys, glob, os

NAME_HINTS = ["氏", "大統領ジャパロフ", "ジャパロフ", "カシミリエフ", "ママトカノフ", "オスモノフ"]


def tag_json(html, tag_id):
    m = re.search(r'<script type="application/json" id="%s">(.*?)</script>' % re.escape(tag_id), html, re.S)
    return json.loads(m.group(1)) if m else None


def walk_tree(nodes, out):
    for n in nodes:
        out[n["id"]] = n
        walk_tree(n.get("kids", []), out)


def nums(text):
    """numbers as written: 2.4億 -> 240000000-ish handled by unit-aware comparison below"""
    out = []
    # dates (2026年12月, 11月5日, 2027–2032) and counts of 0 are skipped: dates are checked by the refs themselves
    text = re.sub(r'\d{1,2}月?〜\d{1,2}[月日]', ' ', text)
    text = re.sub(r'\d{4}[–-]\d{2,4}|\d{4}年|\d{1,2}月|\d{1,2}日|No\.\d+', ' ', text)
    for m in re.finditer(r'(\d[\d,]*(?:\.\d+)?)\s*億(?:\s*(\d[\d,]*)\s*万)?|(\d[\d,]*(?:\.\d+)?)\s*(万|千)?', text):
        if m.group(1):   # 3億1,300万 -> 3.13億
            v = float(m.group(1).replace(",", "")) + (float(m.group(2).replace(",", "")) / 1e4 if m.group(2) else 0)
            unit = "億"
        else:
            v, unit = float(m.group(3).replace(",", "")), m.group(4) or ""
        if v == 0:
            continue
        out.append((m.group(0), v, unit))
    return out


def main():
    rep_path, html_path, data_dir = sys.argv[1:4]
    html = open(html_path, encoding="utf-8").read()
    # REPORT.json may also be the page itself: then the "report-text" tag inside it is checked
    rep = tag_json(open(rep_path, encoding="utf-8").read(), "report-text") if rep_path.endswith(".html") else json.load(open(rep_path))
    items = {}
    for f in glob.glob(os.path.join(data_dir, "items-*.json")):
        for x in json.load(open(f)).get("items", []):
            items[x["i"]] = x
    projects = {p["id"]: p for p in json.load(open(os.path.join(data_dir, "projects.json"))).get("projects", [])}
    spec = (tag_json(html, "summary-spec") or {}).get("sectors", {})
    errors, warns = [], []

    for sid, sec in rep["sectors"].items():
        facts = sec.get("facts", {})
        rows = {r["id"] for r in spec.get(sid, {}).get("rows", [])}
        ind = tag_json(html, "ind-" + sid) or {"pillars": []}
        pillars = {p["id"]: p for p in ind["pillars"]}
        reports = tag_json(html, "reports-" + sid) or {"groups": []}
        groups = {g["id"] for g in reports["groups"]}
        tree_cache = {}

        def resolve(ref):
            kind, _, rest = ref.partition(":")
            if kind == "news":
                x = items.get(rest)
                return (x.get("tj") or x.get("t") or "") + " " + x.get("p", "")[:10] if x else None
            if kind == "proj":
                p = projects.get(rest)
                return json.dumps(p, ensure_ascii=False) if p else None
            if kind == "tree":
                strat, _, node = rest.partition(":")
                if strat not in tree_cache:
                    t = tag_json(html, "tree-" + strat)
                    tree_cache[strat] = {}
                    if t:
                        walk_tree(t["nodes"], tree_cache[strat])
                n = tree_cache[strat].get(node)
                return json.dumps(n, ensure_ascii=False) if n else None
            if kind == "row":
                if rest not in rows:
                    return None
                return json.dumps(facts.get("rows", {}).get(rest, rest), ensure_ascii=False)
            if kind == "ind":
                pid, _, i = rest.partition(":")
                p = pillars.get(pid)
                if not p or not i.isdigit() or int(i) >= len(p.get("inds", [])):
                    return None
                return json.dumps(p["inds"][int(i)], ensure_ascii=False)
            if kind == "fact":
                return json.dumps(facts.get(rest), ensure_ascii=False) if rest in facts else None
            if kind == "rep":
                return rest if rest in groups else None
            return None

        def check(where, text, refs, kind="f"):
            if not refs:
                errors.append(f"[{sid}] {where}: 根拠(ref)がない: {text[:40]}")
                return
            backing = []
            for r in refs:
                b = resolve(r)
                if b is None:
                    errors.append(f"[{sid}] {where}: 根拠が見つからない {r}")
                else:
                    backing.append(b)
            for h in NAME_HINTS:
                if h in text:
                    errors.append(f"[{sid}] {where}: 個人名の疑い「{h}」: {text[:40]}")
            if kind != "f":
                return
            core = {k: v for k, v in facts.items() if k not in ("asof", "data", "note", "rows")}
            pool = " ".join(backing) + " " + json.dumps(core, ensure_ascii=False)
            pool = re.sub(r'\d{4}-\d\d-\d\d(T[\d:.+Z]+)?', ' ', pool)   # dates are not amounts
            pool_nums = [float(x.replace(",", "")) for x in re.findall(r'\d[\d,]*(?:\.\d+)?', pool)]
            # headlines write 4億3000万 / 3億1,300万: read those as one number too
            for a, b2 in re.findall(r'(\d+)\s*億\s*(\d[\d,]*)\s*万', pool):
                pool_nums.append(float(a) + float(b2.replace(",", "")) / 1e4)
            for shown, v, unit in nums(text):
                cands = {v}
                if unit == "億":
                    cands |= {v * 100, v * 1e8, v * 1e2}          # 2.4億ドル -> 240 (百万) / 2.4e8
                if unit == "万":
                    cands |= {v / 100, v * 1e4, v}                 # 6,800万ドル -> 68 (百万)
                if unit == "千":
                    cands |= {v * 1e3}
                ok = any(abs(c - n) <= max(0.06 * abs(c), 0.051) for c in cands for n in pool_nums)
                if not ok:
                    warns.append(f"[{sid}] {where}: 数字「{shown}」が根拠のデータに見つからない(要確認): {text[:50]}")

        for i, s in enumerate(sec.get("lead", [])):
            check(f"結論{i+1}", s["t"], s.get("ref"), s.get("k", "f"))
        for ch in sec.get("chapters", []):
            for i, s in enumerate(ch.get("body", [])):
                check(f"{ch['h']}{i+1}", s["t"], s.get("ref"), s.get("k", "f"))
            for i, c in enumerate(ch.get("cards", [])):
                check(f"{ch['h']}・案件{i+1}", c["why"], c.get("ref"), "f")
            for i, p in enumerate(ch.get("picks", [])):
                check(f"{ch['h']}・指標{i+1}", p["say"], p.get("ref"), p.get("k", "f"))
            for i, w in enumerate(ch.get("watch", [])):
                check(f"{ch['h']}・注目{i+1}", w["t"], w.get("ref"), "v")

    for e in errors:
        print("NG ", e)
    for w in warns:
        print("要確認", w)
    print(f"結果: NG {len(errors)} 件 / 要確認 {len(warns)} 件")
    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
