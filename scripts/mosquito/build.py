"""Build the data behind mosquito.html.

  python3 scripts/mosquito/build.py OUT_DIR

OUT_DIR is a checkout of the `mosquito-data` branch (it may hold earlier runs:
weather months already fetched are kept and not downloaded again).
Writes there:
  mosquito.json      counts per survey / year / site / mosquito group / round, sites, stations
  weather.json       daily weather per JMA station (Jan-Nov of every year)
  counts.csv         one row per count (long format), for R / Python
  sites.csv          survey sites with elevation, 1 km mesh code and weather stations
  weather_daily.csv  daily weather per station
  report.json        what was read, checks against the PDFs' own totals, failures

Sources: Tokyo Metropolitan Institute of Public Health (mosquito surveillance PDFs)
and the Japan Meteorological Agency (past weather data, daily values).
"""
import csv, datetime as dt, json, math, os, re, sys, time, unicodedata, urllib.parse, urllib.request
from html import unescape

sys.path.insert(0, os.path.dirname(__file__))
from read_pdf import read_pdf, check, norm
from sites import SITES, ALIASES, STATIONS

OUT = sys.argv[1]
CACHE = os.path.join(OUT, "cache")
UA = {"User-Agent": "Mozilla/5.0 (mosquito surveillance research page; github.com/kginfo15/kyrgyzcha-family)"}
TODAY = dt.date.today()
FIRST_YEAR = 2015
report = {"built": dt.datetime.utcnow().strftime("%Y-%m-%dT%H:%MZ"), "pdfs": [], "problems": [], "weather": {}}

BASE = "https://www.tmiph.metro.tokyo.lg.jp"
LISTS = {"kouiki": "/kj_kankyo/mosq/mosquito/kansensyou-surveillance/data/",
         "juuten": "/kj_kankyo/mosq/mosquito/dengue-surveillance/data/"}


def get(url, tries=3):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                return r.read()
        except Exception as e:
            err = e
            time.sleep(3 * (i + 1))
    raise err


def fiscal_year(title):
    t = norm(title)
    m = re.search(r"(平成|令和)(元|\d+)年度", t)
    if not m:
        return None
    n = 1 if m.group(2) == "元" else int(m.group(2))
    return (1988 if m.group(1) == "平成" else 2018) + n


# ---------------------------------------------------------------- mosquito counts
def pdf_links(kind):
    html = get(BASE + LISTS[kind]).decode("utf-8", "replace")
    out = []
    for m in re.finditer(r'<a[^>]+href="([^"]+\.pdf)"[^>]*>(.*?)</a>', html, re.S):
        label = re.sub(r"<[^>]+>|\s+", " ", unescape(m.group(2))).strip()
        # the fiscal year is written just before the link (or in the link text)
        before = re.sub(r"<[^>]+>", "", html[max(0, m.start() - 2000):m.start()])
        years = re.findall(r"(?:平成|令和)(?:元|[0-9０-９]+)年度", before)
        hint = fiscal_year(label) or (fiscal_year(years[-1]) if years else None)
        if kind == "juuten" and "成虫" not in label:
            continue
        if hint and hint < FIRST_YEAR:
            continue  # before 2015 only district totals are published
        out.append((urllib.parse.urljoin(BASE + LISTS[kind], m.group(1)), label, hint))
    return out


def page_title(path):
    import pdfplumber
    with pdfplumber.open(path) as pdf:
        return (pdf.pages[0].extract_text() or "").split("\n")[0]


def read_counts():
    os.makedirs(os.path.join(CACHE, "pdf"), exist_ok=True)
    found = {}  # (kind, year) -> parsed
    for kind in LISTS:
        for url, label, hint in pdf_links(kind):
            name = url.rsplit("/", 1)[1]
            path = os.path.join(CACHE, "pdf", name)
            try:
                data = get(url)
                open(path, "wb").write(data)
                time.sleep(1)
                year = fiscal_year(page_title(path)) or hint
                tabs = read_pdf(path)
            except Exception as e:
                report["problems"].append(f"{name}: {e}")
                continue
            if not tabs or not year:
                report["problems"].append(f"{name}: no table / year found")
                continue
            if kind == "juuten":
                tab = tabs[0]  # page 1 is the per-park summary; later pages are single traps
            else:              # the facility table runs over two pages
                tab = dict(tabs[0], blocks=[b for t in tabs for b in t["blocks"]])
                if any(t["dates"] != tabs[0]["dates"] for t in tabs):
                    report["problems"].append(f"{name}: pages with different survey dates")
            blocks = [b for b in tab["blocks"] if b["site"]]
            probs = [f"{name} {b['chars']}: {p}" for b in tab["blocks"] for p in check(b)]
            filled = sum(c is not None for b in blocks for r in b["rows"] for c in r["counts"])
            entry = {"kind": kind, "year": year, "file": name, "url": url, "label": label if fiscal_year(label) else f"{year}年度 {label}",
                     "sites": len(blocks), "filled": filled, "problems": probs}
            report["pdfs"].append(entry)
            if probs:
                report["problems"] += probs
                continue  # never publish a table that does not add up
            prev = found.get((kind, year))
            if prev is None or filled > prev[1]["filled"]:
                found[(kind, year)] = (tab, entry)
    return found


def round_dates(year, d):
    if not d:
        return None, None
    m1, d1, m2, d2 = d
    return dt.date(year, m1, d1), dt.date(year, m2, d2)


def counts_json(found):
    surveys = {"kouiki": {}, "juuten": {}}
    groups = {"kouiki": [], "juuten": []}
    for (kind, year), (tab, entry) in sorted(found.items()):
        rounds = []
        for i, d in enumerate(tab["dates"]):
            s, e = round_dates(year, d)
            rounds.append({"n": i + 1, "start": s.isoformat() if s else None, "end": e.isoformat() if e else None})
        sites = {}
        for b in tab["blocks"]:
            key = b["site"]
            if not key:
                continue
            note = None
            if key in ALIASES:
                key, note = ALIASES[key]
            rows = {r["group"]: r["counts"] for r in b["rows"]}
            for g in rows:
                if g not in groups[kind]:
                    groups[kind].append(g)
            status = []
            for i in range(len(rounds)):
                if any(rows[g][i] is not None for g in rows):
                    status.append("ok")
                    continue
                notes = " ".join(n for r in b["rows"] for n in [r["notes"][i]] if n)
                end = rounds[i]["end"]
                if end and dt.date.fromisoformat(end) >= TODAY - dt.timedelta(days=3):
                    status.append("pending")
                elif "欠" in notes:
                    status.append("missing")
                else:
                    status.append("cancelled")  # printed as 中止, or left blank
            sites[key] = {"counts": rows, "status": status}
            if note:
                sites[key]["note"] = note
        surveys[kind][str(year)] = {"rounds": rounds, "sites": sites, "source": entry["url"], "label": entry["label"]}
    return surveys, groups


# ---------------------------------------------------------------- weather (JMA daily values)
ETRN = "https://www.data.jma.go.jp/stats/etrn/view/"


def fnum(t, precip=False):
    """One JMA cell. "--": nothing observed (0 for precipitation). "]": too few
    observations -> left out. ")": quasi-normal value -> kept."""
    t = unescape(re.sub(r"<[^>]+>", "", t)).strip().replace(" ", "")
    if t == "--":
        return 0.0 if precip else None
    if not t or "]" in t or t in ("///", "×", "#", "x"):
        return None
    try:
        return float(t.replace(")", ""))
    except ValueError:
        return None


# column of each value in the daily table (s = observatory page, a = AMeDAS page)
COLS = {"s": {"p": 3, "t": 6, "tx": 7, "tn": 8, "h": 9, "w": 11},
        "a": {"p": 1, "t": 4, "tx": 5, "tn": 6, "h": 7, "w": 9}}


def parse_month(html, kind):
    out = {}
    for r in re.findall(r'<tr class="mtx"[^>]*>(.*?)</tr>', html, re.S):
        cells = re.findall(r"<td[^>]*>(.*?)</td>", r, re.S)
        if not cells:
            continue
        day = re.sub(r"<[^>]+>", "", cells[0]).strip()
        if not day.isdigit():
            continue
        out[int(day)] = {k: (fnum(cells[i], k == "p") if i < len(cells) else None) for k, i in COLS[kind].items()}
    return out


def fetch_weather():
    wdir = os.path.join(OUT, "weather")
    os.makedirs(wdir, exist_ok=True)
    n_fetch = 0
    for sid, kind, name, lat, lon, has in STATIONS:
        for y in range(FIRST_YEAR, TODAY.year + 1):
            for m in range(1, 12):
                first = dt.date(y, m, 1)
                if first > TODAY:
                    continue
                path = os.path.join(wdir, f"{sid}_{y}-{m:02d}.json")
                recent = (TODAY - first).days < 75  # values of recent months may still be corrected
                if os.path.exists(path) and not recent:
                    continue
                page = "daily_s1.php" if kind == "s" else "daily_a1.php"
                url = f"{ETRN}{page}?prec_no=44&block_no={sid}&year={y}&month={m}&day=&view="
                try:
                    html = get(url).decode("utf-8", "replace")
                    data = parse_month(html, kind)
                    json.dump(data, open(path, "w"), separators=(",", ":"))
                    n_fetch += 1
                except Exception as e:
                    report["problems"].append(f"weather {sid} {y}-{m}: {e}")
                time.sleep(0.7)
    report["weather"]["fetched_months"] = n_fetch
    # assemble: station -> year -> var -> list for day-of-year 1..334 (Jan-Nov)
    out = {}
    for sid, kind, name, lat, lon, has in STATIONS:
        st = {}
        for y in range(FIRST_YEAR, TODAY.year + 1):
            days = (dt.date(y, 12, 1) - dt.date(y, 1, 1)).days
            arr = {k: [None] * days for k in ("t", "tx", "tn", "h", "p", "w")}
            any_val = False
            for m in range(1, 12):
                path = os.path.join(wdir, f"{sid}_{y}-{m:02d}.json")
                if not os.path.exists(path):
                    continue
                for d, v in json.load(open(path)).items():
                    i = (dt.date(y, m, int(d)) - dt.date(y, 1, 1)).days
                    if dt.date(y, m, int(d)) > TODAY:
                        continue
                    for k in arr:
                        if v.get(k) is not None:
                            arr[k][i] = v[k]
                            any_val = True
            if any_val:
                st[str(y)] = arr
        out[sid] = st
    return out


# ---------------------------------------------------------------- sites: elevation, mesh, stations
def mesh3(lat, lon):
    """JIS X 0410 third-level mesh code (about 1 km)."""
    p, a = divmod(lat * 60, 40)
    q, b = divmod(a, 5)
    r, c = divmod(b * 60, 30)
    u = int(lon - 100)
    f = lon - 100 - u
    v, g = divmod(f * 60, 7.5)
    w = int(g * 60 / 45)
    return f"{int(p)}{u}{int(q)}{int(v)}{int(r)}{w}"


def dist_km(a, b):
    dy = (a[0] - b[0]) * 111.0
    dx = (a[1] - b[1]) * 111.0 * math.cos(math.radians(a[0]))
    return math.hypot(dx, dy)


def elevation(lat, lon):
    try:
        url = f"https://cyberjapandata2.gsi.go.jp/general/dem/scripts/getelevation.php?lon={lon}&lat={lat}&outtype=JSON"
        v = json.loads(get(url)).get("elevation")
        return round(float(v), 1) if v not in (None, "-----") else None
    except Exception as e:
        report["problems"].append(f"elevation {lat},{lon}: {e}")
        return None


def site_list():
    prev = {}
    try:
        prev = {s["key"]: s for s in json.load(open(os.path.join(OUT, "mosquito.json")))["sites"]}
    except Exception:
        pass
    out = []
    for key, survey, ja, en, region, muni, lat, lon, traps in SITES:
        st = {}
        for var in "tpwh":
            cands = [(dist_km((lat, lon), (s[3], s[4])), s[0]) for s in STATIONS if var in s[5]]
            st[var] = min(cands)[1]
        nearest = min((dist_km((lat, lon), (s[3], s[4])), s[0]) for s in STATIONS)
        elev = prev.get(key, {}).get("elevation_m")
        if elev is None:
            elev = elevation(lat, lon)
            time.sleep(0.5)
        out.append({"key": key, "survey": survey, "name": ja, "name_en": en, "region": region,
                    "municipality": muni, "lat": lat, "lon": lon, "n_traps": traps,
                    "elevation_m": elev, "mesh3": mesh3(lat, lon), "stations": st,
                    "nearest_station_km": round(nearest[0], 1)})
    return out


# ---------------------------------------------------------------- write
def main():
    found = read_counts()
    surveys, groups = counts_json(found)
    sites = site_list()
    weather = fetch_weather()
    stations = [{"id": s[0], "kind": s[1], "name": s[2], "lat": s[3], "lon": s[4], "has": s[5]} for s in STATIONS]
    doc = {"built": report["built"], "sites": sites, "stations": stations, "groups": groups, "surveys": surveys,
           "sources": {
               "mosquito": "東京都健康安全研究センター「蚊のサーベイランス」結果(PDF)をもとに集計",
               "weather": "気象庁ホームページ「過去の気象データ」の日別値をもとに加工",
           }}
    json.dump(doc, open(os.path.join(OUT, "mosquito.json"), "w"), ensure_ascii=False, separators=(",", ":"))
    json.dump({"built": report["built"], "start": "01-01", "stations": weather},
              open(os.path.join(OUT, "weather.json"), "w"), separators=(",", ":"))

    with open(os.path.join(OUT, "counts.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["survey", "year", "round", "start", "end", "site", "site_name", "n_traps", "group", "count", "status"])
        names = {s["key"]: s for s in sites}
        for kind, years in surveys.items():
            for y, Y in years.items():
                for key, S in Y["sites"].items():
                    for g, vals in S["counts"].items():
                        for i, v in enumerate(vals):
                            r = Y["rounds"][i]
                            w.writerow([kind, y, r["n"], r["start"], r["end"], key, names[key]["name"],
                                        names[key]["n_traps"], g, "" if v is None else v, S["status"][i]])
    with open(os.path.join(OUT, "sites.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["site", "survey", "name_ja", "name_en", "region", "municipality", "lat", "lon", "elevation_m",
                    "mesh3", "n_traps", "station_temp", "station_precip", "station_wind", "station_humidity"])
        for s in sites:
            w.writerow([s["key"], s["survey"], s["name"], s["name_en"], s["region"], s["municipality"], s["lat"], s["lon"],
                        s["elevation_m"], s["mesh3"], s["n_traps"], s["stations"]["t"], s["stations"]["p"],
                        s["stations"]["w"], s["stations"]["h"]])
    with open(os.path.join(OUT, "weather_daily.csv"), "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(["station", "station_name", "date", "t_mean", "t_max", "t_min", "rh_mean", "precip", "wind_mean"])
        sname = {s[0]: s[2] for s in STATIONS}
        for sid, years in weather.items():
            for y, arr in years.items():
                for i in range(len(arr["t"])):
                    vals = [arr[k][i] for k in ("t", "tx", "tn", "h", "p", "w")]
                    if all(v is None for v in vals):
                        continue
                    d = dt.date(int(y), 1, 1) + dt.timedelta(days=i)
                    w.writerow([sid, sname[sid], d.isoformat()] + ["" if v is None else v for v in vals])
    report["years"] = {k: sorted(v) for k, v in surveys.items()}
    json.dump(report, open(os.path.join(OUT, "report.json"), "w"), ensure_ascii=False, indent=1)
    print(json.dumps({k: report[k] for k in ("years", "weather")}, ensure_ascii=False))
    print("problems:", len(report["problems"]))
    for p in report["problems"][:30]:
        print(" -", p)


if __name__ == "__main__":
    main()
