"""One-off probe: download the raw sources the mosquito page needs, so their
layout can be checked. Output goes to the `mosquito-data` branch under probe/."""
import os, re, sys, time, urllib.request, urllib.parse, json

OUT = sys.argv[1]
UA = {"User-Agent": "Mozilla/5.0 (research data tool)"}
log = []

def get(url, path=None, binary=False):
    req = urllib.request.Request(url, headers=UA)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            data = r.read()
        log.append([url, "ok", len(data)])
        if path:
            p = os.path.join(OUT, path); os.makedirs(os.path.dirname(p), exist_ok=True)
            open(p, "wb").write(data)
        return data
    except Exception as e:
        log.append([url, "error", str(e)[:200]])
        return None

BASE = "https://www.tmiph.metro.tokyo.lg.jp"
pdfs = set()
for kind, page in (("kouiki", "/kj_kankyo/mosq/mosquito/kansensyou-surveillance/data/"),
                   ("juuten", "/kj_kankyo/mosq/mosquito/dengue-surveillance/data/"),
                   ("top", "/kj_kankyo/mosq/mosquito/"),
                   ("kouiki_about", "/kj_kankyo/mosq/mosquito/kansensyou-surveillance/"),
                   ("juuten_about", "/kj_kankyo/mosq/mosquito/dengue-surveillance/")):
    html = get(BASE + page, f"probe/html/{kind}.html")
    if html:
        for href in re.findall(rb'href="([^"]+\.pdf)"', html):
            pdfs.add(urllib.parse.urljoin(BASE + page, href.decode()))
get("https://www.hokeniryo.metro.tokyo.lg.jp/kankyo/eisei/baikaikataisaku/mosquito_measures", "probe/html/hokeniryo.html")
for u in sorted(pdfs):
    if "/mosq/" not in u:
        continue
    get(u, "probe/pdf/" + u.rsplit("/", 1)[1]); time.sleep(1)

# JMA: station pages for Tokyo (prec_no=44) and sample daily pages
J = "https://www.data.jma.go.jp/stats/etrn"
get(J + "/select/prefecture.php?prec_no=44&block_no=&year=&month=&day=&view=", "probe/jma/prefecture44.html")
get(J + "/view/daily_s1.php?prec_no=44&block_no=47662&year=2025&month=7&day=&view=", "probe/jma/daily_s1_tokyo_202507.html")
get(J + "/view/daily_a1.php?prec_no=44&block_no=0366&year=2025&month=7&day=&view=", "probe/jma/daily_a1_0366_202507.html")

# Base map: N03 Tokyo
get("https://nlftp.mlit.go.jp/ksj/gml/data/N03/N03-2024/N03-20240101_13_GML.zip", "probe/n03/N03_13.zip")
get("https://archive-api.open-meteo.com/v1/archive?latitude=35.68&longitude=139.76&start_date=2025-07-01&end_date=2025-07-03&daily=temperature_2m_mean", "probe/openmeteo.json")

json.dump(log, open(os.path.join(OUT, "probe/log.json"), "w"), ensure_ascii=False, indent=1)
print("\n".join(map(str, log)))
