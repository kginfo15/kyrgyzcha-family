"""Weekly key-news summary for monitor.html, written by Claude (Haiku).

Run once a week by .github/workflows/week-summary.yml. For each of the 20
sectors it takes the past 7 days of news from the `sector-data` branch,
short-lists candidates with the same free rules the page uses (government
move, donor, several outlets, a strategy-area keyword, money/agreement words),
and asks Claude to choose the 5 that matter most, give each a short reason,
and write one sentence on the week. The result is week.json, which the page
shows above the free-rule list.

Without ANTHROPIC_API_KEY it writes nothing and exits 0: the page then keeps
its free-rule selection.

  python3 scripts/week_summary.py OUT_DIR [--candidates-only]

--candidates-only writes candidates.json (the short-lists, no API call), used
to make a sample by hand.
"""
import datetime as dt
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA = "https://raw.githubusercontent.com/yuuuta21/kyrgyzcha-family/sector-data/"
MODEL = os.environ.get("WEEK_MODEL") or "claude-haiku-5-5"
PICKS = 5
CANDIDATES = 15
DAY = 86400

BIG = re.compile(r"ドル|ソム|億|万円|融資|無償|助成|署名|協定|覚書|合意|承認|可決|採択|決定|法律|法案|改正|大統領令|政令|決議|戦略|プログラム|開始|開通|着工|開所|"
                 r"подпис|соглашен|меморанд|млн|млрд|грант|кредит|утверд|постановл|указ|закон", re.I)


def log(*a):
    print(*a, file=sys.stderr)


def page_json(tag_id):
    html = open(os.path.join(ROOT, "monitor.html"), encoding="utf-8").read()
    m = re.search(r'<script type="application/json" id="%s">(.*?)</script>' % re.escape(tag_id), html, re.S)
    return json.loads(m.group(1))


def page_sectors():
    html = open(os.path.join(ROOT, "monitor.html"), encoding="utf-8").read()
    body = html[html.index("const SECTORS = ["):]
    body = body[:body.index("];")]
    return re.findall(r'\["(\w+)","([^"]+)"\]', body)


def get(name):
    with urllib.request.urlopen(DATA + name, timeout=60) as r:
        return json.load(r)


def load_week():
    now = dt.datetime.now(dt.timezone.utc)
    years = {now.year, (now - dt.timedelta(days=7)).year}
    items = []
    for y in sorted(years):
        try:
            d = get(f"items-{y}.json")
        except Exception as e:  # a year file may not exist yet
            log(f"items-{y}.json: {e}")
            continue
        items += d["items"] if isinstance(d, dict) else d
    since = now.timestamp() - 7 * DAY
    out = []
    for x in items:
        try:
            ts = dt.datetime.fromisoformat(x["p"].replace("Z", "+00:00")).timestamp()
        except Exception:
            continue
        x["ts"] = ts
        out.append(x)
    # outlets repeating the same story point at it with "dup"
    by_id = {x["i"]: x for x in out}
    repeats = {}
    for x in out:
        if x.get("dup") and x["dup"] in by_id:
            repeats[x["dup"]] = repeats.get(x["dup"], 0) + 1
    week = [x for x in out if x["ts"] >= since and not (x.get("dup") and x["dup"] in by_id)]
    return week, repeats


def score(x, sec, rows, repeats):
    """The page's free rules (monitor.html wkScore), kept in step by hand."""
    txt = " ".join([x.get("tj") or "", x.get("lj") or "", x.get("t") or ""])
    sc, why, row = 0.0, [], ""
    if x.get("g"):
        sc += 4; why.append("政府")
    if x.get("d"):
        sc += 4 + (1 if any(d in ("jica", "jp") for d in x["d"]) else 0); why.append("ドナー:" + ",".join(x["d"][:3]))
    rp = repeats.get(x["i"], 0)
    if rp:
        sc += min(6, rp * 2); why.append(f"{rp + 1}媒体")
    for r in rows:
        if r["k"].search(txt) and not (r["x"] and r["x"].search(txt)):
            row = r["n"]; sc += 3; break
    if BIG.search(txt):
        sc += 2
    if x.get("c") and x["c"][0] == sec:
        sc += 2
    sc -= max(0, len(x.get("c") or []) - 2)
    return sc, why, row


def shortlists(week, repeats, sectors, spec):
    out = {}
    for sid, ja in sectors:
        rows = []
        for r in (spec.get(sid) or {}).get("rows", []):
            if r.get("nk"):
                rows.append({"n": re.sub(r"[(（].*$", "", r["n"]), "k": re.compile(r["nk"], re.I),
                             "x": re.compile(r["nx"], re.I) if r.get("nx") else None})
        cand = []
        for x in week:
            if sid not in (x.get("c") or []):
                continue
            sc, why, row = score(x, sid, rows, repeats)
            if sc >= 3:
                cand.append((sc, x, why, row))
        cand.sort(key=lambda c: (-c[0], -c[1]["ts"]))
        out[sid] = {"ja": ja, "n_week": sum(1 for x in week if sid in (x.get("c") or [])), "areas": [r["n"] for r in rows],
                    "candidates": [{"id": x["i"], "date": dt.datetime.fromtimestamp(x["ts"], dt.timezone.utc).strftime("%m/%d"),
                                    "title": x.get("tj") or x.get("t"), "lead": (x.get("lj") or x.get("l") or "")[:220],
                                    "source": x.get("s") or "", "signals": why, "area": row}
                                   for sc, x, why, row in cand[:CANDIDATES]]}
    return out


GUIDE = """あなたは、キルギスの開発協力を追う日本人スタッフ向けに、分野ごとの「今週の重要ニュース」を選ぶ編集者です。

各分野について、候補のニュース(過去7日間)から次の基準で最大5本を選び、重要な順に並べてください。
- 政策・制度・予算・大型案件など、その分野の今後に影響する動きを優先する
- 援助機関・外国政府との合意、署名、融資・無償資金、案件の開始・完了を優先する
- 同じ出来事の重複は1本にまとめる。事件・事故・個人の話題、分野と関係の薄い記事は選ばない
- 選ぶに値する記事が少なければ、5本未満でよい

出力:
- lead: その分野のこの1週間を1文(60字以内)でまとめた日本語。分野名で始めない。具体的な固有名詞・金額を入れる。誇張しない
- picks: 選んだ記事の id と、選んだ理由 why(日本語30字以内、「〜のため」で終えない体言止め)
候補にない事実を書かないこと。"""


def schema():
    return {"type": "object", "properties": {"sectors": {"type": "array", "items": {"type": "object", "properties": {
        "sector": {"type": "string"},
        "lead": {"type": "string"},
        "picks": {"type": "array", "items": {"type": "object", "properties": {
            "id": {"type": "string"}, "why": {"type": "string"}}, "required": ["id", "why"], "additionalProperties": False}}},
        "required": ["sector", "lead", "picks"], "additionalProperties": False}}},
        "required": ["sectors"], "additionalProperties": False}


def ask(client, batch):
    body = "分野ごとの候補(JSON):\n" + json.dumps(batch, ensure_ascii=False)
    resp = client.messages.create(
        model=MODEL, max_tokens=8000,
        system=[{"type": "text", "text": GUIDE, "cache_control": {"type": "ephemeral"}}],
        output_config={"format": {"type": "json_schema", "schema": schema()}},
        messages=[{"role": "user", "content": body}],
    )
    text = "".join(b.text for b in resp.content if getattr(b, "type", "") == "text")
    return json.loads(text), resp.usage


def main():
    out_dir = sys.argv[1] if len(sys.argv) > 1 else "."
    os.makedirs(out_dir, exist_ok=True)
    sectors, spec = page_sectors(), page_json("summary-spec")["sectors"]
    week, repeats = load_week()
    lists = shortlists(week, repeats, sectors, spec)
    if "--candidates-only" in sys.argv:
        json.dump(lists, open(os.path.join(out_dir, "candidates.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        log(f"candidates.json: {sum(len(v['candidates']) for v in lists.values())} candidates")
        return
    if not os.environ.get("ANTHROPIC_API_KEY"):
        log("ANTHROPIC_API_KEY is not set: no AI summary this week (the page keeps its free-rule list)")
        return
    import anthropic
    client = anthropic.Anthropic(max_retries=4, timeout=300)
    result, usage = {}, {"in": 0, "out": 0, "requests": 0}
    ids = [sid for sid, _ in sectors if lists[sid]["candidates"]]
    for i in range(0, len(ids), 5):  # five sectors per request keeps answers short and reliable
        batch = {sid: {k: lists[sid][k] for k in ("ja", "n_week", "candidates")} for sid in ids[i:i + 5]}
        try:
            data, u = ask(client, batch)
        except Exception as e:
            log(f"week summary: {ids[i:i + 5]} failed: {e}")
            continue
        usage["requests"] += 1; usage["in"] += u.input_tokens or 0; usage["out"] += u.output_tokens or 0
        for s in data.get("sectors", []):
            sid = s.get("sector")
            if sid not in batch:
                continue
            known = {c["id"] for c in lists[sid]["candidates"]}
            picks = [{"i": p["id"], "why": p["why"][:60]} for p in s.get("picks", []) if p.get("id") in known][:PICKS]
            result[sid] = {"lead": (s.get("lead") or "")[:120], "picks": picks}
    if not result:
        log("week summary: no answer from the API; keeping last week's file")
        sys.exit(1)
    now = dt.datetime.now(dt.timezone.utc)
    doc = {"v": 1, "updated": now.strftime("%Y-%m-%d"), "by": "Claude Haiku", "model": MODEL,
           "usage": usage, "sectors": result}
    for name in ("week.json", f"weeks/{now.strftime('%Y-%m-%d')}.json"):
        path = os.path.join(out_dir, name)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        json.dump(doc, open(path, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    log(f"week.json: {len(result)} sectors, {usage}")


if __name__ == "__main__":
    main()
