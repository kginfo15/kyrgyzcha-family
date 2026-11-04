"""Fetch Kyrgyzstan headlines from Google News RSS and print them as JSON.

Run by .github/workflows/update-news.yml; the output is published to the
`news-data` branch and read by weather.html.
"""
import json
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime

# key: (query, hl, gl, ceid, max items per source, title must contain one of)
FEEDS = {
    # Japanese-language coverage of Kyrgyzstan (past week)
    "ja": ("キルギス OR ビシュケク when:7d", "ja", "JP", "JP:ja", 2,
           ("キルギス", "ビシュケク", "イシク", "オシュ")),
    # Local Russian-language news (past day): 24.kg, Kaktus, AKIpress, ...
    "local": ("Кыргызстан OR Бишкек when:1d", "ru", "KG", "KG:ru", 3, None),
}
MAX_ITEMS = 12


def fetch(query, hl, gl, ceid, per_source, keywords):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
        {"q": query, "hl": hl, "gl": gl, "ceid": ceid})
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (news fetcher)"})
    with urllib.request.urlopen(req, timeout=30) as res:
        root = ET.fromstring(res.read())
    items, seen = [], set()
    for it in root.iter("item"):
        title = (it.findtext("title") or "").strip()
        source = (it.findtext("source") or "").strip()
        if source and title.endswith(" - " + source):
            title = title[: -len(" - " + source)].strip()
        if not title or title in seen:
            continue
        seen.add(title)
        try:
            pub = parsedate_to_datetime(it.findtext("pubDate")).astimezone(timezone.utc).isoformat()
        except Exception:
            pub = None
        items.append({"title": title, "link": (it.findtext("link") or "").strip(),
                      "source": source, "published": pub})
    items.sort(key=lambda x: x["published"] or "", reverse=True)
    if keywords:
        items = [x for x in items if any(k in x["title"] for k in keywords)]
    # a few sites post many near-identical stories; keep the newest few from each
    per, out = {}, []
    for x in items:
        per[x["source"]] = per.get(x["source"], 0) + 1
        if per[x["source"]] <= per_source:
            out.append(x)
    return out[:MAX_ITEMS]


def main():
    out = {"updated": datetime.now(timezone.utc).isoformat(), "feeds": {}}
    ok = False
    for key, args in FEEDS.items():
        try:
            out["feeds"][key] = fetch(*args)
            ok = ok or bool(out["feeds"][key])
            print(f"{key}: {len(out['feeds'][key])} items", file=sys.stderr)
        except Exception as e:  # keep going so one broken feed doesn't hide the other
            out["feeds"][key] = []
            print(f"{key}: failed: {e}", file=sys.stderr)
    if not ok:
        sys.exit("no news fetched")
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
