"""Download the sources behind pest.html into OUT/raw (cached between runs).

usage: python3 scripts/pest/fetch.py OUT

  raw/list.html          Tokyo's list page of the yearly pest-consultation PDFs
  raw/pdf/<name>.pdf     every PDF linked from it, plus a few older ones that
                         are still on the site but no longer linked
  raw/pdfs.json          url, link text and file name of each PDF
  raw/jma/<year>.html    JMA monthly values for Tokyo (station 47662)

PDFs already downloaded are kept (they never change); the list page and the
JMA pages of the last two years are always fetched again.
"""
import datetime as dt
import hashlib
import json
import os
import re
import sys
import time
import urllib.parse
import urllib.request
from html import unescape

OUT = sys.argv[1]
RAW = os.path.join(OUT, "raw")
UA = {"User-Agent": "Mozilla/5.0 (pest consultation research page; github.com/kginfo15/kyrgyzcha-family)"}
SITE = "https://www.hokeniryo.metro.tokyo.lg.jp"
LIST = [SITE + "/kankyo/eisei/nezukon.html", SITE + "/kankyo//eisei/nezukon.html"]
# older years: still on the site, no longer linked from the list page
EXTRA = [
    SITE + "/documents/d/hokeniryo/h27chousakekka",
    SITE + "/kankyo/eisei/nezukon.files/25-cyousakekka.pdf",
]
for slug in ("h27soudankensuu", "h27higaihassei", "h26chousakekka", "h26soudankensuu",
             "h26higaihassei", "h25chousakekka", "h24chousakekka"):
    EXTRA.append(SITE + "/documents/d/hokeniryo/" + slug)
for n in ("24", "25", "26", "27"):
    for kind in ("cyousakekka", "soudankensuu", "higaihassei", "soudan", "kensuu"):
        EXTRA.append(f"{SITE}/kankyo/eisei/nezukon.files/{n}-{kind}.pdf")
TODAY = dt.date.today()
log = []


def get(url, tries=3):
    err = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read(), r.geturl()
        except urllib.error.HTTPError as e:
            if e.code == 404:
                raise
            err = e
        except Exception as e:
            err = e
        time.sleep(3 * (i + 1))
    raise err


def text(h):
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", h))).strip()


def main():
    os.makedirs(os.path.join(RAW, "pdf"), exist_ok=True)
    os.makedirs(os.path.join(RAW, "jma"), exist_ok=True)
    html = None
    for u in LIST:
        try:
            body, final = get(u)
            html = body.decode("utf-8", "replace")
            open(os.path.join(RAW, "list.html"), "w").write(html)
            log.append(f"list page: {final}")
            break
        except Exception as e:
            log.append(f"list page {u}: {e}")
    idx_path = os.path.join(RAW, "pdfs.json")
    known = {p["url"]: p for p in json.load(open(idx_path))} if os.path.exists(idx_path) else {}
    links = []
    if html:
        for href, label in re.findall(r'<a[^>]+href="([^"]+)"[^>]*>(.*?)</a>', html, re.S):
            u = urllib.parse.urljoin(LIST[0], unescape(href))
            if "/documents/d/" in u or u.lower().endswith(".pdf"):
                links.append((u, text(label)))
    for u in EXTRA:
        if u not in [l[0] for l in links]:
            links.append((u, "(not linked)"))
    for u, label in links:
        if u in known and os.path.exists(os.path.join(RAW, "pdf", known[u]["file"])):
            if label != "(not linked)":
                known[u]["label"] = label
            continue
        try:
            body, final = get(u)
        except Exception as e:
            if label != "(not linked)":
                log.append(f"pdf {u}: {e}")
            continue
        if not body.startswith(b"%PDF"):
            log.append(f"not a pdf: {u}")
            continue
        name = re.sub(r"[^\w.-]", "_", u.rstrip("/").split("/")[-1])
        if not name.lower().endswith(".pdf"):
            name += ".pdf"
        if any(p["file"] == name and p["url"] != u for p in known.values()):
            name = hashlib.sha1(u.encode()).hexdigest()[:8] + "_" + name
        open(os.path.join(RAW, "pdf", name), "wb").write(body)
        known[u] = {"url": u, "label": label, "file": name}
        log.append(f"got {name} ({len(body)//1024} KB) {label}")
        time.sleep(1)
    json.dump(sorted(known.values(), key=lambda p: p["file"]), open(idx_path, "w"), ensure_ascii=False, indent=1)
    for y in range(2012, TODAY.year + 1):
        path = os.path.join(RAW, "jma", f"{y}.html")
        if os.path.exists(path) and y < TODAY.year - 1:
            continue
        url = f"https://www.data.jma.go.jp/stats/etrn/view/monthly_s1.php?prec_no=44&block_no=47662&year={y}&month=&day=&view="
        try:
            body, _ = get(url)
            open(path, "wb").write(body)
        except Exception as e:
            log.append(f"jma {y}: {e}")
        time.sleep(0.7)
    open(os.path.join(RAW, "fetch-log.txt"), "w").write("\n".join(log) + "\n")
    print("\n".join(log))


if __name__ == "__main__":
    main()
