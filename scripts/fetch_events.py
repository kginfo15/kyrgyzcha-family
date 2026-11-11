"""Collect culture events (concerts, theatre, festivals...) for events.html.

Run by .github/workflows/update-events.yml; the JSON printed here is
published to the `events-data` branch as events.json.

Sources
  ticket.kg  - the largest ticket seller. Only the public event pages are read
               (robots.txt allows them); from each page we keep name, dates,
               venue, price range and the link to buy. No images or
               descriptions are copied. Its terms allow personal,
               non-commercial use, which is what this site is.
  24.kg / kaktus.media - their RSS feeds; we keep weekly "afisha"
               (what's on) articles and festival news as links.
Not used: kassir.kg (its terms forbid robots), Instagram (Meta's terms),
sxodim.com (its event lists are loaded by script, so only a link is shown).

Annual festivals are hand-made and live in events.html itself.
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from fetch_news import translate_batch, rss_items, clean  # noqa: E402

UA = {"User-Agent": "kyrgyzcha-family-events/1.0 (personal non-commercial event list; "
                    "+https://github.com/kginfo15/kyrgyzcha-family)"}
PREV_URL = "https://raw.githubusercontent.com/kginfo15/kyrgyzcha-family/events-data/events.json"
KGT = timezone(timedelta(hours=6))  # Bishkek time
NOW = datetime.now(timezone.utc)
TODAY = NOW.astimezone(KGT).date()
DELAY = 1.5        # seconds between requests to ticket.kg
MAX_EVENTS = 220   # safety cap on pages read per run
HORIZON_DAYS = 120  # ignore sessions further away than this


def log(*a):
    print(*a, file=sys.stderr)


def get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read().decode("utf-8", "replace")


# ------------------------------------------------------------------ ticket.kg

# ticket.kg category pages -> our category. Sport, seminars, tourism and
# cinema are left out (not culture events / films change daily).
TK_CATEGORIES = [("concerts", "concert"), ("performances", "theatre"), ("humor", "comedy"),
                 ("kids", "kids"), ("exhibition", "exhibit"), ("other", "other"),
                 ("sport", None), ("seminars", None), ("tourism", None)]  # None = leave out
TYPE_CAT = {"MusicEvent": "concert", "TheaterEvent": "theatre", "DanceEvent": "theatre",
            "ComedyEvent": "comedy", "ChildrensEvent": "kids", "ExhibitionEvent": "exhibit",
            "Festival": "festival", "VisualArtsEvent": "exhibit", "LiteraryEvent": "other"}
SKIP_TYPES = {"SportsEvent", "EducationEvent", "BusinessEvent", "ScreeningEvent"}
FEST_RE = re.compile(r"фестивал|festival|\bfest\b|фест\b", re.I)

# Where an event is, from its coordinates (Bishkek first; more can be added).
CITIES = [  # (code, lat_min, lat_max, lon_min, lon_max)
    ("bishkek", 42.75, 42.98, 74.40, 74.80),
    ("osh", 40.45, 40.62, 72.70, 72.90),
    ("issykkul", 41.90, 42.90, 76.00, 79.30),
]
CITY_WORDS = [("osh", r"\bОш\b|\bОше\b|osh-shaar|\bOsh\b"), ("issykkul", r"Чолпон|Каракол|Иссык|Ысык|Балыкчы|Бостери"),
              ("bishkek", r"Бишкек|Bishkek")]


def city_of(lat, lon, text):
    if lat is not None and lon is not None:
        for code, a, b, c, d in CITIES:
            if a <= lat <= b and c <= lon <= d:
                return code
        return "other"
    for code, rx in CITY_WORDS:
        if re.search(rx, text or ""):
            return code
    return "bishkek"


def event_links(page):
    out = []
    for slug in re.findall(r'href="/event/([^"/?#]+)"', page):
        slug = urllib.parse.unquote(html.unescape(slug))
        if slug not in out:
            out.append(slug)
    return out


def parse_event_page(slug, page):
    blocks = []
    for raw in re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', page, re.S):
        try:
            data = json.loads(raw)
        except Exception:
            continue
        for d in (data if isinstance(data, list) else [data]):
            if isinstance(d, dict) and (str(d.get("@type", "")).endswith("Event") or d.get("@type") == "Festival"):
                blocks.append(d)
    if not blocks:
        return None
    first = blocks[0]
    dates = []
    for d in blocks:
        s = d.get("startDate")
        try:
            dt = datetime.fromisoformat(s.replace("Z", "+00:00")).astimezone(KGT)
        except Exception:
            continue
        if TODAY <= dt.date() <= TODAY + timedelta(days=HORIZON_DAYS):
            dates.append(dt.isoformat(timespec="minutes"))
    if not dates:
        return None
    loc = first.get("location") or {}
    if isinstance(loc, list):
        loc = loc[0] if loc else {}
    geo = loc.get("geo") or {}
    addr = loc.get("address") or {}
    try:
        lat, lon = float(geo.get("latitude")), float(geo.get("longitude"))
    except (TypeError, ValueError):
        lat = lon = None
    offers = first.get("offers") or {}
    if isinstance(offers, list):
        offers = offers[0] if offers else {}
    venue = clean(loc.get("name") or "")
    street = clean(addr.get("streetAddress") if isinstance(addr, dict) else str(addr))
    title = clean(first.get("name") or slug)
    return {
        "id": "tk:" + slug,
        "src": "ticket.kg",
        "url": "https://ticket.kg/event/" + urllib.parse.quote(slug),
        "title": title,
        "type": first.get("@type", ""),
        "dates": sorted(set(dates)),
        "venue": venue,
        "address": street,
        "city": city_of(lat, lon, venue + " " + street + " " + slug),
        "lat": lat, "lon": lon,
        "price_min": offers.get("lowPrice"), "price_max": offers.get("highPrice"),
        "currency": offers.get("priceCurrency") or "KGS",
        "status": (first.get("eventStatus") or "").rsplit("/", 1)[-1],
    }


def collect_ticketkg():
    cat_of = {}
    order = []
    for slug, cat in TK_CATEGORIES:
        try:
            page = get(f"https://ticket.kg/events/{slug}")
        except Exception as e:
            log(f"ticket.kg /events/{slug}: {e}")
            continue
        for s in event_links(page):
            cat_of.setdefault(s, cat)
            if s not in order and cat:
                order.append(s)
        time.sleep(DELAY)
    try:  # the home page lists events of every category; type decides for these
        for s in event_links(get("https://ticket.kg/")):
            if s not in order and s not in cat_of:
                order.append(s)
    except Exception as e:
        log(f"ticket.kg home: {e}")
    log(f"ticket.kg: {len(order)} event links to read, {sum(1 for v in cat_of.values() if v is None)} left out (sport/seminar/tour)")
    out = []
    for slug in order[:MAX_EVENTS]:
        time.sleep(DELAY)
        try:
            ev = parse_event_page(slug, get("https://ticket.kg/event/" + urllib.parse.quote(slug)))
        except Exception as e:
            log(f"ticket.kg event {slug}: {e}")
            continue
        if not ev:
            continue
        if slug not in cat_of and ev["type"] in SKIP_TYPES:
            continue
        cat = cat_of.get(slug) or TYPE_CAT.get(ev["type"], "other")
        if FEST_RE.search(ev["title"]):
            cat = "festival"
        ev["cat"] = cat
        out.append(ev)
    log(f"ticket.kg: {len(out)} upcoming events kept")
    return out


# ------------------------------------------------------------- news articles

ARTICLE_FEEDS = [("24.kg", "https://24.kg/rss/"), ("Kaktus.media", "https://kaktus.media/?rss")]
ARTICLE_RE = re.compile(r"афиш|куда сходить|фестивал|фест\b|концерт|гастрол|спектакл|премьер|выставк|нооруз|ноорүз", re.I)
ARTICLE_SKIP = re.compile(r"отключ|дтп|задерж|суд\b|погиб", re.I)
ARTICLE_DAYS = 21


def collect_articles(prev):
    keep = {}
    for x in prev:
        try:
            if datetime.fromisoformat(x["date"]) >= NOW - timedelta(days=ARTICLE_DAYS):
                keep[x["url"]] = x
        except Exception:
            pass
    for source, url in ARTICLE_FEEDS:
        try:
            items = list(rss_items(url))
        except Exception as e:
            log(f"{source} rss: {e}")
            continue
        for it in items:
            title = clean(it.get("title"))
            if not ARTICLE_RE.search(title) or ARTICLE_SKIP.search(title) or it["link"] in keep:
                continue
            d = it.get("date") or NOW
            keep[it["link"]] = {"src": source, "url": it["link"], "title": title,
                                "afisha": bool(re.search(r"афиш|куда сходить", title, re.I)),
                                "date": d.isoformat()}
    return sorted(keep.values(), key=lambda x: x["date"], reverse=True)[:40]


# -------------------------------------------------------------- translation

def translate_all(items, key, cache):
    """Fill item[key + '_ja'] from cache or Google's free endpoint.

    Small batches with pauses; Google answers 429 (too many requests) when
    called fast from GitHub's machines. Whatever is left untranslated is
    tried again on the next run (the page then shows the original)."""
    todo = []
    for x in items:
        if x.get(key) and not cache.get(x[key]) and x[key] not in todo:
            todo.append(x[key])
    fails = 0
    i = 0
    while i < len(todo) and fails < 4:
        chunk = todo[i:i + 5]
        try:
            for src, t in zip(chunk, translate_batch(chunk, sl="auto", tl="ja")):
                cache[src] = t
            i += len(chunk)
            fails = 0
            time.sleep(1.5)
        except Exception as e:
            fails += 1
            log(f"translate failed ({fails}): {e}")
            time.sleep(20 * fails)
    for x in items:
        x[key + "_ja"] = cache.get(x.get(key), "")


def main():
    prev = {}
    try:
        prev = json.loads(get(PREV_URL))
    except Exception as e:
        log(f"no previous data: {e}")
    cache = dict(prev.get("tr") or {})

    out = {"version": 1, "updated": NOW.isoformat(), "events": [], "articles": [], "sources": {}}
    try:
        out["events"] = collect_ticketkg()
    except Exception as e:
        log(f"ticket.kg failed: {e}")
    if not out["events"]:  # keep yesterday's list rather than show nothing
        out["events"] = [e for e in prev.get("events") or [] if any(d[:10] >= TODAY.isoformat() for d in e.get("dates", []))]
        out["events_stale"] = True
    try:
        out["articles"] = collect_articles(prev.get("articles") or [])
    except Exception as e:
        log(f"articles failed: {e}")
        out["articles"] = prev.get("articles") or []
    if not out["events"] and not out["articles"]:
        sys.exit("nothing fetched")

    out["events"].sort(key=lambda e: e["dates"][0])
    translate_all(out["events"], "title", cache)
    translate_all(out["events"], "venue", cache)
    translate_all(out["articles"], "title", cache)
    used = {x.get(k) for x in out["events"] + out["articles"] for k in ("title", "venue")}
    out["tr"] = {k: v for k, v in cache.items() if k in used}
    for e in out["events"]:
        out["sources"][e["src"]] = out["sources"].get(e["src"], 0) + 1
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
