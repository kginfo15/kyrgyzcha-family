"""Probe: download Yokohama City mosquito surveillance pages/PDFs and JMA Yokohama
daily weather into OUT for offline study (temporary research helper)."""
import os, re, sys, time, json, urllib.request, urllib.parse, subprocess

OUT = sys.argv[1]
os.makedirs(OUT + "/pdf", exist_ok=True); os.makedirs(OUT + "/html", exist_ok=True); os.makedirs(OUT + "/weather", exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0 (research data fetch)"}
B = "https://www.city.yokohama.lg.jp/kenko-iryo-fukushi/kenko-iryo/eiken/"
log = []

def get(url):
    for i in range(3):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
        except Exception as e:
            err = e; time.sleep(2)
    raise err

def save_pdf(url):
    name = re.sub(r"[^A-Za-z0-9._-]", "_", url.split("/eiken/")[-1])
    p = f"{OUT}/pdf/{name}"
    if os.path.exists(p): return
    try:
        open(p, "wb").write(get(url)); log.append(("ok", url))
        subprocess.run(["pdftotext", "-layout", p, p[:-4] + ".txt"])
    except Exception as e:
        log.append(("fail", url, str(e)))
    time.sleep(0.5)

seen = set()
def crawl(url, depth):
    if url in seen or depth < 0: return
    seen.add(url)
    try:
        html = get(url).decode("utf-8", "replace")
    except Exception as e:
        log.append(("fail", url, str(e))); return
    name = re.sub(r"[^A-Za-z0-9._-]", "_", url.split("/eiken/")[-1] or "index")
    open(f"{OUT}/html/{name}", "w").write(html); log.append(("ok", url))
    for h in re.findall(r'href="([^"#]+)"', html):
        u = urllib.parse.urljoin(url, h)
        if "/eiken/" not in u or "city.yokohama.lg.jp" not in u: continue
        if u.lower().endswith(".pdf"):
            if any(k in u for k in ("kabaikai", "pathogen", "dengue", "ka", "mosq")):
                save_pdf(u)
        elif u.endswith(".html") and any(k in u for k in ("kansen-center", "kabaikai", "byogentai", "dengue", "gaiyo/annual")):
            crawl(u, depth - 1)
        time.sleep(0.2)

for start in [B + "kansen-center/byogentai/infc-kabaikai.html",
              B + "kansen-center/byogentai/",
              B + "kansen-center/byogentai/pathogen.html",
              B + "kansen-center/rinji/dengue.html",
              B + "gaiyo/annualreport.html",
              B + "kansen-center/"]:
    crawl(start, 2)

for u in [B + "kansen-center/byogentai/pathogen.files/seisoku.pdf"] + \
         [B + f"kansen-center/byogentai/infc-kabaikai.files/kakekka{y}.pdf" for y in range(2014, 2027)] + \
         [B + f"gaiyo/annualreport.files/annualreport{n}.pdf" for n in range(50, 66)]:
    save_pdf(u)

# JMA Yokohama (prec_no 46, block 47670), daily, 2010-2026
for y in range(2010, 2027):
    for m in range(1, 13):
        p = f"{OUT}/weather/47670_{y}-{m:02d}.html"
        if os.path.exists(p): continue
        try:
            open(p, "wb").write(get(f"https://www.data.jma.go.jp/stats/etrn/view/daily_s1.php?prec_no=46&block_no=47670&year={y}&month={m}&day=&view="))
        except Exception as e:
            log.append(("fail", "jma", y, m, str(e)))
        time.sleep(0.6)

json.dump(log, open(f"{OUT}/log.json", "w"), ensure_ascii=False, indent=0)
print(len([l for l in log if l[0] == "ok"]), "ok,", len([l for l in log if l[0] == "fail"]), "fail")
