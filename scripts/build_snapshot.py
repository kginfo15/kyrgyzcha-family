"""Build a self-contained copy of monitor.html with the data inside it.

The claude.ai page can't fetch the data branch itself, so it gets a snapshot.

usage: build_snapshot.py DATA_DIR OUT_HTML [DAYS]

DATA_DIR holds index.json, items-YYYY.json and projects.json (the
`sector-data` branch). Items from the last DAYS days (default 180) are kept.
The output has no <html>/<head>/<body> tags: the publisher wraps it.
"""
import glob
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    data_dir, out = sys.argv[1], sys.argv[2]
    days = int(sys.argv[3]) if len(sys.argv) > 3 else 180
    index = json.load(open(os.path.join(data_dir, "index.json")))
    cutoff = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
    items = []
    for f in glob.glob(os.path.join(data_dir, "items-*.json")):
        items += [x for x in json.load(open(f)).get("items", []) if x.get("p", "") >= cutoff]
    items.sort(key=lambda x: x["p"], reverse=True)
    projects = json.load(open(os.path.join(data_dir, "projects.json")))
    for p in projects.get("projects", []):
        if len(p.get("x", "")) > 220:
            p["x"] = p["x"][:220] + "…"
    index = {k: v for k, v in index.items() if k != "stats"}
    upd = datetime.fromisoformat(index["updated"]).astimezone(timezone(timedelta(hours=6)))
    data = {"index": index, "items": items, "projects": projects,
            "note": f"スナップショット版（{upd:%Y/%m/%d %H:%M} ビシュケク時間の収集データ・直近{days}日分）。"
                    "最新の情報は自動更新される Web 版で見られます。"}

    src = open(os.path.join(ROOT, "monitor.html"), encoding="utf-8").read()
    head = src.split("<!--KM:HEAD-START-->")[1].split("<!--KM:HEAD-END-->")[0]
    body = src.split("<body>", 1)[1].rsplit("</body>", 1)[0]
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    body = body.replace("<script>", "<script>window.KM_DATA=" + blob + ";</script>\n<script>", 1)
    with open(out, "w", encoding="utf-8") as fh:
        fh.write(head.strip() + "\n" + body.strip() + "\n")
    print(f"{len(items)} items, {len(projects.get('projects', []))} projects, "
          f"{os.path.getsize(out) / 1e6:.1f} MB -> {out}")


if __name__ == "__main__":
    main()
