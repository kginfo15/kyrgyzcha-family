"""Collect Kyrgyzstan news for weather.html and print it as JSON.

Run by .github/workflows/update-news.yml; the output is published to the
`news-data` branch.

Four parts:
  local  - Kyrgyz media (Russian) filtered to politics / economy / safety,
           with title and lead machine-translated into Japanese
  japan  - Japanese press coverage of Kyrgyzstan (major papers flagged)
  safety - Japan MOFA travel-safety level and embassy (consular) e-mails
  infra  - water / power / gas / heating outages and road closures
  mystreet - outage notices that mention the family's own streets in Bishkek
"""
import html
import json
import re
import sys
import time
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}
PREV_URL = "https://raw.githubusercontent.com/kginfo15/kyrgyzcha-family/news-data/news.json"
JST = timezone(timedelta(hours=9))
NOW = datetime.now(timezone.utc)


def log(*a):
    print(*a, file=sys.stderr)


def get(url, timeout=30):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


def clean(text):
    text = html.unescape(re.sub(r"<[^>]+>", " ", text or ""))
    return re.sub(r"\s+", " ", text).strip()


def parse_date(s):
    try:
        return parsedate_to_datetime(s).astimezone(timezone.utc)
    except Exception:
        return None


def post(url, data, timeout=30):
    req = urllib.request.Request(url, data=data.encode(), headers={
        **UA, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    with urllib.request.urlopen(req, timeout=timeout) as res:
        return res.read()


GNEWS_CACHE = {}


def resolve_gnews(url):
    """Turn a news.google.com/rss/articles/... link into the publisher's own URL.

    Google News links only redirect via JavaScript, which translation proxies
    can't follow. Returns the original link if anything fails."""
    if "news.google.com" not in url:
        return url
    if url in GNEWS_CACHE:
        return GNEWS_CACHE[url]
    try:
        gid = re.search(r"/articles/([^?/]+)", url).group(1)
        page = get("https://news.google.com/rss/articles/" + gid, timeout=20).decode("utf-8", "replace")
        sig = re.search(r'data-n-a-sg="([^"]+)"', page).group(1)
        ts = re.search(r'data-n-a-ts="([^"]+)"', page).group(1)
        req = ["Fbv4je", json.dumps(["garturlreq", [["X", "X", ["X", "X"], None, None, 1, 1, "US:en", None, 1,
                                                     None, None, None, None, None, 0, 1], "X", "X", 1, [1, 1, 1],
                                                    1, 1, None, 0, 0, None, 0], gid, int(ts), sig])]
        body = "f.req=" + urllib.parse.quote(json.dumps([[req]]))
        raw = post("https://news.google.com/_/DotsSplashUi/data/batchexecute", body).decode("utf-8", "replace")
        real = json.loads(json.loads(raw.split("\n\n")[1])[0][2])[1]
        if real.startswith("http"):
            GNEWS_CACHE[url] = real
            time.sleep(0.3)
            return real
    except Exception as e:
        log(f"gnews resolve failed: {e}")
    GNEWS_CACHE[url] = url
    return url


def rss_items(url):
    root = ET.fromstring(get(url))
    for it in root.iter("item"):
        yield {
            "title": clean(it.findtext("title")),
            "link": (it.findtext("link") or "").strip(),
            "desc": clean(it.findtext("description")),
            "date": parse_date(it.findtext("pubDate")),
            "source_el": (it.findtext("source") or "").strip(),
            "source_url": (it.find("source").get("url", "") if it.find("source") is not None else ""),
        }


# ---------------------------------------------------------------- translation

def translate_batch(texts, sl="auto", tl="ja"):
    """Translate a list of short strings with Google's free endpoint.

    Strings are joined with newlines so one request handles a title + lead."""
    joined = "\n".join(t.replace("\n", " ") for t in texts)
    url = "https://translate.googleapis.com/translate_a/single?" + urllib.parse.urlencode(
        {"client": "gtx", "sl": sl, "tl": tl, "dt": "t", "q": joined})
    data = json.loads(get(url, timeout=20))
    out = "".join(seg[0] for seg in data[0] if seg and seg[0])
    parts = [p.strip() for p in out.split("\n")]
    if len(parts) != len(texts):  # fall back to one request per string
        parts = []
        for t in texts:
            d = json.loads(get("https://translate.googleapis.com/translate_a/single?" + urllib.parse.urlencode(
                {"client": "gtx", "sl": sl, "tl": tl, "dt": "t", "q": t}), timeout=20))
            parts.append("".join(seg[0] for seg in d[0] if seg and seg[0]).strip())
    return parts


def first_sentences(text, limit=260):
    text = text.strip()
    if len(text) <= limit:
        return text
    cut = text[:limit]
    m = max(cut.rfind(". "), cut.rfind("! "), cut.rfind("? "))
    return (cut[: m + 1] if m > 80 else cut.rstrip() + "…")


# ---------------------------------------------------------------- local news

LOCAL_FEEDS = [
    ("24.kg", "https://24.kg/rss/"),
    ("Kaktus.media", "https://kaktus.media/?rss"),
    ("AKIpress", "https://kg.akipress.org/rss/news.rss"),
    ("Kloop", "https://kloop.kg/feed/"),
    ("Economist.kg", "https://economist.kg/feed/"),
    ("Tazabek", "https://tazabek.kg/rss/"),
    ("Азаттык", "https://rus.azattyk.org/api/epiqq"),
]

# Order matters: the first category whose words match wins.
CATEGORIES = [
    # festivals, fairs, exhibitions, concerts, workshops - checked first so a fair
    # mentioning police or closures isn't filed under safety
    ("event", ["фестивал", "ярмарк", "выставк", "концерт", "праздн", "мастер-класс", "воркшоп", "тренинг",
               "конкурс", "спектакл", "премьера", "экскурс", "кинопоказ", "показ фильм",
               "фэст", "fest", "день города", "нооруз", "ноорус", "новогодн", "ёлк",
               "марафон", "забег", "турнир", "чемпионат", "игры кочевников", "ремесл", "этно"]),
    ("safety", ["гкнб", "мвд", "милици", "задерж", "арест", "дтп", "авари", "пожар", "землетряс", "сель$", "селя$", "сели$", "селев",
                "лавин", "наводн", "паводк", "взрыв", "террор", "экстремис", "митинг", "протест", "погранич",
                "мчс", "убий", "нападен", "мошенн", "эвакуац", "отключ", "карантин", "вспышк",
                "корь", "эпидем", "загрязн", "смог", "похищ", "розыск", "погиб", "пострада", "госпитализ",
                "отравл", "коррупц", "обыск", "уголовн", "штормов", "гололед", "грабеж", "краж", "насили"]),
    ("politics", ["жапаров", "президент", "жогорку кенеш", "депутат", "парламент", "кабмин", "кабинет министров",
                  "премьер", "министр", "выбор", "закон", "указ", "посол", "визит", "мид", "переговор",
                  "еаэс", "одкб", "шос", "ташиев", "мэр", "акым", "полпред", "референдум", "конституц",
                  "партия", "совбез", "безопасност", "суд", "суда", "судом", "судеб", "генпрокур", "оппозиц", "санкц"]),
    ("economy", ["сом", "сома", "сомов", "курс", "доллар", "ввп", "инфляц", "бюджет", "налог", "банк", "нацбанк", "инвест",
                 "экспорт", "импорт", "цены", "цен", "подорож", "тариф", "кредит", "госдолг", "долг", "торгов", "бизнес",
                 "предприним", "золот", "кумтор", "энерг", "гэс", "газ", "бензин", "топлив", "рынок",
                 "млн", "млрд", "$", "зарплат", "пенси", "таможн", "строительств", "ипотек", "мвф",
                 "всемирн", "абр", "железн дорог", "железной дорог"]),
]
KG_WORDS = ["кыргыз", "киргиз", "бишкек", "кр", "жапаров", "ош", "оше", "оша", "ошск", "сома", "сомов", "чуй", "чуйск", "иссык", "ысык", "нарын",
            "талас", "баткен", "жалал", "каракол", "токмок", "жогорку", "кабмин", "гкнб", "сом", "чолпон",
            "кара-балт", "балыкч", "ала-арч", "кумтор", "манас"]


def word_re(words):
    """Match words at a word start; words of 3 letters or fewer, or ending in "$", must match whole."""
    parts = []
    for w in words:
        w = w.strip()
        if len(w) > 1 and w.endswith("$"):
            parts.append(r"(?<![а-яёa-z])" + re.escape(w[:-1]) + r"(?![а-яёa-z])")
        elif w == "$":
            parts.append(r"\$")
        elif len(w) <= 3:
            parts.append(r"(?<![а-яёa-z])" + re.escape(w) + r"(?![а-яёa-z])")
        else:
            parts.append(r"(?<![а-яёa-z])" + re.escape(w))
    return re.compile("|".join(parts))


CAT_RES = [(cat, word_re(words)) for cat, words in CATEGORIES]
KG_RE = word_re(KG_WORDS)


def categorize(text):
    t = text.lower()
    for cat, rx in CAT_RES:
        if rx.search(t):
            return cat
    return None


_FEED_CACHE = {}


def local_feed(source, url):
    if url not in _FEED_CACHE:
        try:
            _FEED_CACHE[url] = list(rss_items(url))
        except Exception as e:
            log(f"local {source}: failed: {e}")
            _FEED_CACHE[url] = None
    return _FEED_CACHE[url]


def translate_items(items, prev_tr):
    for x in items:
        cached = prev_tr.get(x["link"])
        if cached:
            x["title_ja"], x["lead_ja"] = cached
            continue
        try:
            texts = [x["title"]] + ([x["lead"]] if x.get("lead") else [])
            tr = translate_batch(texts)
            x["title_ja"] = tr[0]
            x["lead_ja"] = tr[1] if len(tr) > 1 else ""
            time.sleep(0.4)
        except Exception as e:
            log(f"translate failed: {e}")
            x["title_ja"], x["lead_ja"] = "", ""


def collect_local(prev_tr):
    items, seen = [], set()
    cutoff = NOW - timedelta(hours=36)
    for source, url in LOCAL_FEEDS:
        got = local_feed(source, url)
        if got is None:
            continue
        n = 0
        for it in got:
            if not it["title"] or it["title"] in seen:
                continue
            if it["date"] and it["date"] < cutoff:
                continue
            desc = it["desc"]
            if desc.startswith("kloop.kg"):
                desc = desc[len("kloop.kg"):].strip()
            text = (it["title"] + " " + desc).lower()
            if not KG_RE.search(text):
                continue  # foreign news carried by local media
            cat = categorize(it["title"] + " " + desc)
            if not cat:
                continue
            seen.add(it["title"])
            items.append({"title": it["title"], "lead": first_sentences(desc), "link": it["link"],
                          "source": source, "published": it["date"].isoformat() if it["date"] else None,
                          "cat": cat})
            n += 1
        log(f"local {source}: {len(got)} fetched, {n} kept")
    items.sort(key=lambda x: x["published"] or "", reverse=True)
    # keep a balanced mix: up to 12 per category
    per, out = {}, []
    for x in items:
        per[x["cat"]] = per.get(x["cat"], 0) + 1
        if per[x["cat"]] <= 12:
            out.append(x)

    translate_items(out, prev_tr)
    return out


# ---------------------------------------------------------------- infrastructure

# (kind, regex) - checked against the lower-cased title + lead
INFRA_KINDS = [
    ("water", r"(отключ\w*|без|не будет|нет|подач\w*|перебо\w*|ограничен\w*|прекращ\w*)[^.!?]{0,50}(вод[аыуе]|водоснабж)"
              r"|водоканал|водоснабжен|питьев\w* вод|холодн\w* вод|горяч\w* вод"),
    ("power", r"(отключ\w*|без|не будет|нет|перебо\w*|прекращ\w*)[^.!?]{0,50}(электр|свет[аы]?\b)|электроснабжен|нэск|"
              r"северэлектро|востокэлектро|ошэлектро|джалалабадэлектро|блэкаут"),
    ("gas", r"(отключ\w*|без|не будет|нет|подач\w*|прекращ\w*)[^.!?]{0,40}газ|газоснабжен|газпром кыргызстан"),
    ("heat", r"отоплен|теплоснабжен|теплосет|отопительн|тэц"),
    ("road", r"перекро|перекрыт|ограничен\w* движени|схем\w* движени|закрыт\w*[^.!?]{0,30}(перевал|трасс|дорог|мост)"
             r"|(перевал|трасс|дорог|автодорог)\w*[^.!?]{0,40}закрыт|сход\w* (сел|лавин)|гололед"),
]
INFRA_RES = [(k, re.compile(rx)) for k, rx in INFRA_KINDS]
# the story must actually be about an interruption or closure
OUTAGE_RE = re.compile(
    r"отключ|не будет|остан\w* без|без (воды|света|электроэнерг|электричеств|газа|отоплен|тепла)|нет (воды|света|газа)"
    r"|перекро|перекрыт|ограничен\w* (движени|подач)|прекращ|авари|перебо|порыв|закрыт|"
    r"измен\w*[^.!?]{0,30}(схем|маршрут)|схем\w* движени|сход\w* (сел|лавин)|гололед")
# city id (as in weather.html) -> Russian word starts
CITY_WORDS = {
    "bishkek": ["бишкек", "столиц"], "osh": ["ош", "оше", "оша", "ошск"], "jalalabad": ["жалал-абад"],
    "karakol": ["каракол"], "cholponata": ["чолпон-ат"], "balykchy": ["балыкч"], "naryn": ["нарын"],
    "talas": ["талас"], "batken": ["баткен"], "tokmok": ["токмок"], "karabalta": ["кара-балт"],
}
CITY_RES = {cid: word_re(ws) for cid, ws in CITY_WORDS.items()}


# natural hazards and weather warnings: (kind, regex); reported whether or not anything was cut off
HAZARD_KINDS = [
    ("quake", r"землетрясен|подземн\w* толч|сейсмич|магнитуд"),
    ("slide", r"оползн|оползен|(?<![а-яё])сел(ь|я|и|ем|евой|евые|евого|еопасн)(?![а-яё])|сход\w* сел|камнепад|обвал"),
    ("avalanche", r"лавин"),
    ("flood", r"наводнен|паводк|подтоплен|разлив\w* рек|затопл"),
    ("wind", r"смерч|торнадо|ураган|шквал|сильн\w* ветер|штормов\w* ветер|порыв\w* ветра"),
    ("storm", r"штормов\w* предупрежд|гроз[аыу]|(?<![а-яё])град(?![а-яё])|снегопад|метел|буран|(?<![а-яё])ливн|аномальн\w* (холод|жар|мороз)|сильн\w* мороз"),
    ("emergency", r"режим\w* чс|чрезвычайн\w* ситуац|мчс (предупрежда|предупредил|призыва)|эвакуац"),
]
HAZARD_RES = [(k, re.compile(rx)) for k, rx in HAZARD_KINDS]
# things that use hazard words without being one (sports "Лавина", price "обвал", ...)
HAZARD_NOT = re.compile(r"обвал\w* (курс|цен|рынк|акци|тенге|сома|рубл)|хоккей|(?<![а-яё])хк(?![а-яё])|матч|футбол|клуб|фильм|сериал|концерт|учени")


def infra_kinds(text):
    t = text.lower()
    kinds = []
    if OUTAGE_RE.search(t):
        kinds = [k for k, rx in INFRA_RES if rx.search(t)]
    if not HAZARD_NOT.search(t):
        hz = [k for k, rx in HAZARD_RES if rx.search(t)]
        if hz:
            kinds = kinds + ["hazard"] + hz
    return kinds


def collect_infra(prev_tr):
    cutoff = NOW - timedelta(hours=48)
    cands = []
    for source, url in LOCAL_FEEDS:
        for it in local_feed(source, url) or []:
            cands.append((source, it))
    for gq in INFRA_QUERIES:
        try:
            for it in rss_items("https://news.google.com/rss/search?" + urllib.parse.urlencode(
                    {"q": gq, "hl": "ru", "gl": GN_REGION, "ceid": GN_REGION + ":ru"})):
                src = it["source_el"]
                if src and it["title"].endswith(" - " + src):
                    it["title"] = it["title"][: -len(" - " + src)].strip()
                it["desc"] = ""  # Google News descriptions only repeat the title
                cands.append((src or "Google News", it))
        except Exception as e:
            log(f"infra google: failed: {e}")
    items, seen = [], set()
    for source, it in cands:
        if not it["title"] or (it["date"] and it["date"] < cutoff):
            continue
        key = it["title"].lower()[:60]
        if key in seen:
            continue
        desc = it["desc"][len("kloop.kg"):].strip() if it["desc"].startswith("kloop.kg") else it["desc"]
        text = it["title"] + " " + desc
        kinds = infra_kinds(text)
        if not kinds or not KG_RE.search(text.lower()):
            continue
        seen.add(key)
        cities = [cid for cid, rx in CITY_RES.items() if rx.search(text.lower())]
        items.append({"title": it["title"], "lead": first_sentences(desc), "link": it["link"], "source": source,
                      "published": it["date"].isoformat() if it["date"] else None,
                      "kinds": kinds, "cities": cities})
    items.sort(key=lambda x: x["published"] or "", reverse=True)
    items = items[:25]
    for x in items:
        x["link"] = resolve_gnews(x["link"])
    log(f"infra: {len(items)} items, {sum('news.google.com' in x['link'] for x in items)} unresolved Google links")
    translate_items(items, prev_tr)
    return items


# ---------------------------------------------------------------- my streets

# Central Bishkek streets that the app
# lets people pick from: (id used by weather.html, Russian word start).
# Kyrgyz forms share the same start.
WATCH_STREETS = [
    ("panfilova", r"панфилов(?!ск)"), ("razzakova", "раззаков"), ("kievskaya", "киевск"),
    ("orozbekova", "орозбеков"), ("toktogula", "токтогул"), ("moskovskaya", "московск"),
    ("chui", r"чуй(?![а-яё])"), ("erkindik", "эркиндик"), ("abdrakhmanova", "абдрахманов"),
    ("tynystanova", "тыныстанов"), ("isanova", "исанов"), ("logvinenko", "логвиненко"),
    ("togolok", "тоголок молдо"), ("shopokova", "шопоков"), ("manasa", "манаса"),
    ("bokonbaeva", "боконбаев"), ("frunze", "фрунзе"), ("jumabek", "жумабек"),
]
STREET_RES = [(sid, re.compile(r"(?<![а-яё])" + rx)) for sid, rx in WATCH_STREETS]
VILLAGE_RE = re.compile(r"(?<![а-яё])(сел[оа]|с\.|поселк|пос\.|айыл|ала-арч|арча-бешик|кок-жар|ак-жол|чуй\w* област)")
POSTCODE_RE = re.compile(r"(?<!\d)72\d{4}(?!\d)")
TIME_RE = re.compile(r"(с\s*)?\d{1,2}[:.]\d{2}\s*(до|-|–|—)\s*\d{1,2}[:.]\d{2}")
RU_MONTHS = ["январ", "феврал", "март", "апрел", "ма", "июн", "июл", "август", "сентябр", "октябр", "ноябр", "декабр"]
DATE_RE = re.compile(r"(\d{1,2})\s+(январ|феврал|март|апрел|ма[яй]|июн|июл|август|сентябр|октябр|ноябр|декабр)")


def article_lines(url):
    """Fetch an article and return its visible text split into lines."""
    raw = get(url, timeout=25).decode("utf-8", "replace")
    raw = re.sub(r"(?is)<(script|style|noscript|header|footer|nav)[^>]*>.*?</\1>", " ", raw)
    raw = re.sub(r"(?i)<br\s*/?>|</(p|li|div|h\d|tr)>", "\n", raw)
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return [re.sub(r"[ \t\xa0]+", " ", ln).strip() for ln in text.split("\n") if ln.strip()]


def outage_date(text):
    m = DATE_RE.search(text.lower())
    if not m:
        return None
    day = int(m.group(1))
    mon = next(i for i, w in enumerate(RU_MONTHS) if m.group(2).startswith(w)) + 1
    year = NOW.year + (1 if mon < NOW.month - 6 else 0)
    try:
        return datetime(year, mon, day).date().isoformat()
    except ValueError:
        return None


def collect_mystreet(infra, prev_tr):
    """Open the outage articles for the watched cities and keep the lines naming watched streets."""
    out, checked, failed = [], 0, 0
    for x in infra:
        city = next((c for c in x["cities"] if c in WATCH_CITIES), None)
        if not city or "news.google.com" in x["link"]:
            continue
        street_res = STREET_RES_BY_CITY[city]
        if checked >= 20:
            break
        checked += 1
        try:
            lines = article_lines(x["link"])
        except Exception as e:
            failed += 1
            log(f"mystreet {x['link'][:60]}: {e}")
            continue
        hits, last_time, last_time_at = [], None, -99
        for n, ln in enumerate(lines):
            low = ln.lower()
            tm = TIME_RE.search(low)
            if tm:
                last_time, last_time_at = ln[tm.start():tm.end()], n
            if len(ln) > 1200:  # skip page-wide junk
                continue
            # outage notices list many streets; headlines of other articles on the page don't
            if low.count(",") < 2 and not tm and not re.search(r"\d+\s*[-–]\s*\d+", low):
                continue
            if "адрес" in low or "address" in low or POSTCODE_RE.search(low):
                continue  # the site's own contact address

            streets = []
            first = None
            for ja, rx in street_res:
                for m in rx.finditer(low):
                    before = low[max(0, m.start() - 100):m.start()]
                    before = re.split(r"[;\n]", before)[-1]
                    if VILLAGE_RE.search(before):
                        continue  # same street name in a village outside the city
                    # "Шарта (Ленина, Шопокова, ...)": streets listed in brackets after a village name
                    head = low[:m.start()]
                    opened = head.rfind("(")
                    if opened > head.rfind(")") and not re.search(r"(ул|улиц|пр|просп|мкр|ж/м)[^,;]{0,12}$", head[max(0, opened - 25):opened]):
                        continue
                    streets.append(ja)
                    first = m.start() if first is None else min(first, m.start())
                    break
            if not streets:
                continue
            snippet = ln[max(0, first - 120): first + 220].strip()
            when = ln[tm.start():tm.end()] if tm else (last_time if n - last_time_at <= 6 else None)
            snippet = TIME_RE.sub(" ", snippet).strip(" -–—:,")
            if any(h["text"] == snippet for h in hits):
                continue  # the same line repeated on the page (e.g. lead + body)
            hits.append({"streets": streets, "text": snippet,
                         "time": re.sub(r"^с\s*", "", when).replace(" до ", "–").replace("-", "–") if when else None})
            if len(hits) >= 4:
                break
        if not hits:
            continue
        for h in hits:
            key = "hit:" + h["text"]
            if key in prev_tr:
                h["text_ja"] = prev_tr[key][0]
                continue
            try:
                h["text_ja"] = translate_batch([h["text"]])[0]
                time.sleep(0.3)
            except Exception as e:
                log(f"translate failed: {e}")
                h["text_ja"] = ""
        out.append({"city": city, "kinds": x["kinds"], "title": x["title"], "title_ja": x.get("title_ja", ""),
                    "link": x["link"], "source": x["source"], "published": x["published"],
                    "date": outage_date(x["title"] + " " + x.get("lead", "")), "hits": hits})
    log(f"mystreet: checked {checked} articles ({failed} failed), {len(out)} with our streets")
    return {"cities": {c: [sid for sid, _ in ws] for c, ws in WATCH_CITIES.items()},
            "streets": [sid for ws in WATCH_CITIES.values() for sid, _ in ws],
            "checked": checked, "failed": failed, "items": out}


# ---------------------------------------------------------------- Japanese press

MAJOR = {
    "日本経済新聞": "日経", "日経": "日経", "朝日新聞": "朝日", "読売新聞": "読売", "毎日新聞": "毎日",
    "産経ニュース": "産経", "産経新聞": "産経", "NHK": "NHK", "共同通信": "共同", "時事通信": "時事",
    "時事ドットコム": "時事", "47NEWS": "共同", "東京新聞": "東京", "日刊工業新聞": "日刊工業",
    "NNAアジア": "NNA", "ジェトロ": "JETRO", "JETRO": "JETRO", "Bloomberg": "Bloomberg", "ロイター": "ロイター",
    "Reuters": "ロイター", "AFPBB": "AFP", "nippon.com": "nippon.com",
}
JA_KEYWORDS = ("キルギス", "ビシュケク", "イシク", "オシュ", "ジャパロフ")
SKIP_SOURCES = ("Vietnam.vn", "Laodong.vn", "VietnamPlus", "タグマ！", "디지털투데이", "IQAir", "ｄメニュー")


def gnews(query, hl="ja", gl="JP", ceid="JP:ja"):
    url = "https://news.google.com/rss/search?" + urllib.parse.urlencode(
        {"q": query, "hl": hl, "gl": gl, "ceid": ceid})
    for it in rss_items(url):
        title, src = it["title"], it["source_el"]
        if src and title.endswith(" - " + src):
            title = title[: -len(" - " + src)].strip()
        yield {"title": title, "link": it["link"], "source": src, "source_url": it["source_url"],
               "published": it["date"].isoformat() if it["date"] else None}


# Japanese outlets on non-.jp domains; other .jp news sites are accepted by domain
JP_MEDIA_DOMAINS = (
    "nikkei.com", "asahi.com", "sankei.com", "jiji.com", "nippon.com", "toyokeizai.net",
    "newsweekjapan.jp", "forbesjapan.com", "president.jp", "bunshun.jp", "itmedia.co.jp",
    "47news.jp", "kyodonews.jp", "nna.jp", "jetro.go.jp", "tbs.co.jp", "fnn.jp", "ntv.co.jp",
    "tv-asahi.co.jp", "nhk.or.jp", "yomiuri.co.jp", "mainichi.jp", "tokyo-np.co.jp",
    "sponichi.co.jp", "nikkansports.com", "hochi.news", "sanspo.com", "daily.co.jp",
    "huffingtonpost.jp", "news.yahoo.co.jp", "gendai.media", "diamond.jp", "aera-style.com",
)
NON_MEDIA_JP = (".go.jp", ".ac.jp", ".lg.jp", ".ed.jp")


def is_japanese_media(source_url):
    host = urllib.parse.urlparse(source_url).hostname or ""
    if any(host == d or host.endswith("." + d) for d in JP_MEDIA_DOMAINS):
        return True
    return host.endswith(".jp") and not host.endswith(NON_MEDIA_JP)


def major_of(source):
    for k, v in MAJOR.items():
        if k.lower() in source.lower():
            return v
    return None


def collect_japan():
    sites = " OR ".join("site:" + s for s in [
        "nikkei.com", "asahi.com", "yomiuri.co.jp", "mainichi.jp", "sankei.com", "nhk.or.jp",
        "jiji.com", "kyodonews.jp", "47news.jp", "tokyo-np.co.jp", "nna.jp", "jetro.go.jp", "nippon.com"])
    queries = [q.format(sites=sites) for q in JA_QUERIES]
    items, seen = [], set()
    for q in queries:
        try:
            got = list(gnews(q))
        except Exception as e:
            log(f"japan {q[:20]}: failed: {e}")
            continue
        for it in got:
            key = re.sub(r"[\s　、。・「」『』（）()]", "", it["title"])[:18]
            if key in seen or not any(k in it["title"] for k in JA_KEYWORDS):
                continue
            if any(s.lower() in it["source"].lower() for s in SKIP_SOURCES):
                continue
            if not is_japanese_media(it["source_url"]):
                continue
            if not it["published"] or it["published"] < (NOW - timedelta(days=60)).isoformat():
                continue  # Google ignores when: for some site queries
            seen.add(key)
            it["major"] = major_of(it["source"])
            items.append(it)
        log(f"japan '{q[:24]}': {len(got)} fetched")
    items.sort(key=lambda x: x["published"] or "", reverse=True)
    per, out = {}, []
    for x in items:
        per[x["source"]] = per.get(x["source"], 0) + 1
        if per[x["source"]] <= (6 if x["major"] else 2):
            out.append(x)
    return out[:25]


# ---------------------------------------------------------------- world press (international outlets only, English and Russian)

WORLD_MEDIA = {
    "reuters.com": "Reuters", "apnews.com": "AP", "bbc.com": "BBC", "bbc.co.uk": "BBC", "bloomberg.com": "Bloomberg",
    "ft.com": "Financial Times", "theguardian.com": "The Guardian", "nytimes.com": "New York Times",
    "wsj.com": "Wall Street Journal", "washingtonpost.com": "Washington Post", "economist.com": "The Economist",
    "aljazeera.com": "Al Jazeera", "dw.com": "DW", "france24.com": "France 24", "cnn.com": "CNN",
    "asia.nikkei.com": "Nikkei Asia", "rferl.org": "RFE/RL", "euronews.com": "Euronews", "afp.com": "AFP",
    "scmp.com": "South China Morning Post", "politico.eu": "Politico", "voanews.com": "VOA", "lemonde.fr": "Le Monde",
    # wider net (2026-11-10): outlets that often cover Central Asia, in English and Russian
    "eurasianet.org": "Eurasianet", "thediplomat.com": "The Diplomat", "timesca.com": "Times of Central Asia",
    "intellinews.com": "bne IntelliNews", "cabar.asia": "CABAR.asia",
    "xinhuanet.com": "Xinhua", "news.cn": "Xinhua", "cgtn.com": "CGTN",
    "globaltimes.cn": "Global Times", "aa.com.tr": "Anadolu", "trtworld.com": "TRT World",
    "dailysabah.com": "Daily Sabah", "rfi.fr": "RFI",
    "independent.co.uk": "The Independent", "telegraph.co.uk": "The Telegraph", "time.com": "TIME",
    "foreignpolicy.com": "Foreign Policy", "newsweek.com": "Newsweek", "upi.com": "UPI", "cnbc.com": "CNBC",
    "forbes.com": "Forbes", "abc.net.au": "ABC (Australia)", "straitstimes.com": "Straits Times",
    "worldbank.org": "World Bank", "un.org": "UN News", "devex.com": "Devex", "thenewhumanitarian.org": "The New Humanitarian",
    "tass.com": "TASS", "tass.ru": "TASS", "ria.ru": "RIA Novosti", "interfax.ru": "Interfax",
    "kommersant.ru": "Kommersant", "rbc.ru": "RBC", "vedomosti.ru": "Vedomosti", "iz.ru": "Izvestia",
    "rg.ru": "Rossiyskaya Gazeta", "lenta.ru": "Lenta.ru", "gazeta.ru": "Gazeta.ru", "meduza.io": "Meduza",
    "novayagazeta.eu": "Novaya Gazeta Europe", "currenttime.tv": "Current Time",
    "fergana.media": "Fergana", "fergana.agency": "Fergana", "eadaily.com": "EADaily",
    "regnum.ru": "Regnum", "ng.ru": "Nezavisimaya Gazeta", "mk.ru": "MK", "aif.ru": "AiF",
}
# each outlet at most this many items, so one wire service cannot fill the list
WORLD_PER_OUTLET = 4
WORLD_MAX = 30
WORLD_DAYS = 30
EDITIONS = {"en-US": ("en-US", "US", "US:en"), "en-GB": ("en-GB", "GB", "GB:en"), "ru": ("ru", "RU", "RU:ru")}


def world_outlet(source_url):
    host = urllib.parse.urlparse(source_url).hostname or ""
    for dom, name in WORLD_MEDIA.items():
        if host == dom or host.endswith("." + dom):
            return name
    return None


def collect_world(prev_tr):
    items, seen = [], set()
    for q in WORLD_QUERIES:
        q, ed = q if isinstance(q, tuple) else (q, "en-US")
        hl, gl, ceid = EDITIONS[ed]
        try:
            got = list(rss_items("https://news.google.com/rss/search?" + urllib.parse.urlencode(
                {"q": q, "hl": hl, "gl": gl, "ceid": ceid})))
        except Exception as e:
            log(f"world {q}: failed: {e}")
            continue
        for it in got:
            outlet = world_outlet(it["source_url"])
            if not outlet:
                continue
            title, src = it["title"], it["source_el"]
            if src and title.endswith(" - " + src):
                title = title[: -len(" - " + src)].strip()
            key = title.lower()[:60]
            if key in seen or not it["date"] or it["date"] < NOW - timedelta(days=WORLD_DAYS):
                continue
            seen.add(key)
            items.append({"title": title, "link": it["link"], "source": outlet,
                          "published": it["date"].isoformat()})
        log(f"world '{q}': {len(got)} fetched")
    items.sort(key=lambda x: x["published"], reverse=True)
    per, kept = {}, []
    for x in items:
        per[x["source"]] = per.get(x["source"], 0) + 1
        if per[x["source"]] <= WORLD_PER_OUTLET:
            kept.append(x)
    items = kept[:WORLD_MAX]
    for x in items:
        x["link"] = resolve_gnews(x["link"])
    # paid placements on news sites (e.g. BBC StoryWorks) are not reporting
    items = [x for x in items if not re.search(r"advertiser-content|storyworks|sponsored|/partner-content/|/paid-content/", x["link"])]
    translate_items(items, prev_tr)
    return items


# ---------------------------------------------------------------- MOFA safety

def mofa_date(s):
    try:
        return datetime.strptime(s.strip(), "%Y/%m/%d %H:%M:%S").replace(tzinfo=JST).astimezone(timezone.utc).isoformat()
    except Exception:
        return None


def collect_safety():
    root = ET.fromstring(get(f"https://www.ezairyu.mofa.go.jp/opendata/country/{MOFA_CODE}A.xml"))
    txt = lambda tag: (root.findtext(tag) or "").strip()
    out = {
        "levels": {f"l{n}": int(txt(f"riskLevel{n}") or 0) for n in (1, 2, 3, 4)},
        "riskTitle": txt("riskTitle"),
        "riskLead": clean(txt("riskLead"))[:400],
        "riskDate": mofa_date(txt("riskLeaveDate")),
        "riskUrl": txt("riskMapUrl") or "https://www.anzen.mofa.go.jp/",
        "infoUrl": txt("infoUrl"),
        "mails": [],
    }
    mails = list(root.iter("mail"))
    if mails:
        log("mofa mail fields:", [c.tag for c in mails[0]])
    seen = set()
    for m in mails:
        g = lambda tag: (m.findtext(tag) or "").strip()
        key = g("keyCd")
        if (g("title"), g("leaveDate")) in seen:
            continue
        seen.add((g("title"), g("leaveDate")))
        if len(out["mails"]) >= 15:
            break
        out["mails"].append({
            "title": clean(g("title")),
            "lead": clean(g("lead"))[:300],
            "type": g("infoName"),
            "published": mofa_date(g("leaveDate")),
            "link": g("infoUrl") or (f"https://www.anzen.mofa.go.jp/od/ryojiMailDetail.html?keyCd={key}" if key else out["infoUrl"]),
        })
    out["mails"].sort(key=lambda x: x["published"] or "", reverse=True)
    log(f"safety: levels {out['levels']}, {len(out['mails'])} mails")
    return out


# ---------------------------------------------------------------- main

# ---------------------------------------------------------------- weekly digest

ARCHIVE_DAYS = 15  # enough for last Monday-to-Sunday week plus this week
STOP_STEMS = {"кыргыз", "киргиз", "бишкек", "казахс", "астана", "алматы", "ноября", "декабр", "октябр",
              "январ", "феврал", "сентяб", "сообщи", "заявил", "рассказ", "которы", "будет", "стране",
              "страны", "президе", "области", "районе", "города", "городе", "жители", "году", "сегодня"}


def stems(title):
    """Rough word stems of a Russian headline, for grouping stories about the same event."""
    out = set()
    for w in re.findall(r"[а-яёәіңғүұқөһa-z0-9]+", title.lower()):
        if len(w) >= 5:
            st = w[:6]
            if st not in STOP_STEMS and w[:5] not in STOP_STEMS:
                out.add(st)
    return out


def update_archive(archive, out):
    """Keep about a week of items so the app can show a weekly digest."""
    items = {x["link"]: x for x in (archive or {}).get("items", [])}
    now = NOW.isoformat()
    for x in out.get("local") or []:
        if not x.get("title_ja"):
            continue
        it = items.setdefault(x["link"], {"first_seen": now})
        it.update({"kind": "news", "title": x["title"], "title_ja": x["title_ja"], "lead_ja": x.get("lead_ja", ""),
                   "link": x["link"], "source": x["source"], "published": x["published"] or it["first_seen"],
                   "cat": x["cat"]})
    for x in out.get("infra") or []:
        if not x.get("title_ja"):
            continue
        it = items.setdefault(x["link"], {"first_seen": now})
        it.update({"kind": "infra", "title": x["title"], "title_ja": x["title_ja"], "link": x["link"],
                   "source": x["source"], "published": x["published"] or it["first_seen"],
                   "kinds": x["kinds"], "cities": x["cities"]})
    for x in out.get("world") or []:
        if not x.get("title_ja"):
            continue
        it = items.setdefault(x["link"], {"first_seen": now})
        it.update({"kind": "world", "title": x["title"], "title_ja": x["title_ja"], "link": x["link"],
                   "source": x["source"], "published": x["published"] or it["first_seen"]})
    cutoff = (NOW - timedelta(days=ARCHIVE_DAYS)).isoformat()
    kept = [x for x in items.values() if (x.get("published") or "") >= cutoff]
    kept.sort(key=lambda x: x.get("published") or "", reverse=True)
    since = (archive or {}).get("since") or now
    return {"country": COUNTRY, "since": since, "updated": now, "items": kept}


def week_bounds():
    """(last Monday 00:00, this Monday 00:00) in the country's local time, as UTC datetimes."""
    off = timedelta(hours=TZ_HOURS)
    local = NOW + off
    this_mon = datetime(local.year, local.month, local.day, tzinfo=timezone.utc) - timedelta(days=local.weekday())
    this_mon -= off
    return this_mon - timedelta(days=7), this_mon


def build_weekly(archive, out, start, end):
    """Group one week's headlines into stories and rank them by how widely they were covered."""
    week_ago, until = start.isoformat(), end.isoformat()
    inside = lambda x: week_ago <= (x.get("published") or "") < until
    news = [x for x in archive["items"] if x.get("kind") == "news" and inside(x)]
    news.sort(key=lambda x: x.get("published") or "")
    clusters = []
    for x in news:
        st = stems(x["title"])
        best, best_score = None, 0
        for c in clusters:
            common = len(st & c["stems"])
            score = common / max(1, min(len(st), len(c["stems"])))
            if common >= 2 and score >= 0.34 and score > best_score:
                best, best_score = c, score
        if best:
            best["items"].append(x)
            best["stems"] |= st
        else:
            clusters.append({"stems": set(st), "items": [x]})

    def story(c):
        items = c["items"]
        rep_item = max(items, key=lambda i: (len(i.get("lead_ja") or ""), i.get("published") or ""))
        cats = [i["cat"] for i in items]
        return {"title_ja": rep_item["title_ja"], "lead_ja": rep_item.get("lead_ja", ""), "link": rep_item["link"],
                "source": rep_item["source"], "cat": max(set(cats), key=cats.count),
                "count": len(items), "sources": len({i["source"] for i in items}),
                "first": min(i.get("published") or "" for i in items),
                "last": max(i.get("published") or "" for i in items)}

    stories = [story(c) for c in clusters]
    stories.sort(key=lambda s: (s["sources"] * 2 + s["count"], s["last"]), reverse=True)
    by_cat = {}
    for s_ in stories:
        lst = by_cat.setdefault(s_["cat"], [])
        if len(lst) < 4 and s_ not in stories[:6]:
            lst.append(s_)
    infra = [x for x in archive["items"] if x.get("kind") == "infra" and inside(x)]
    counts, by_city = {}, {}
    for x in infra:
        for k in x.get("kinds") or []:
            counts[k] = counts.get(k, 0) + 1
            for c in x.get("cities") or []:
                by_city.setdefault(c, {})
                by_city[c][k] = by_city[c].get(k, 0) + 1
    safety = out.get("safety") or {}
    mails = [m for m in safety.get("mails") or [] if inside(m)]
    japan = [j for j in out.get("japan") or [] if inside(j)][:6]
    world = [x for x in archive["items"] if x.get("kind") == "world" and inside(x)][:6]
    local_day = lambda d: (d + timedelta(hours=TZ_HOURS)).date().isoformat()
    return {"from": week_ago, "to": until, "from_date": local_day(start), "to_date": local_day(end - timedelta(seconds=1)),
            "since": archive["since"], "complete": archive["since"] <= week_ago,
            "articles": len(news), "top": stories[:6], "by_cat": by_cat,
            "infra": {"total": len(infra), "counts": counts, "by_city": by_city,
                      "recent": [{"title_ja": x["title_ja"], "link": x["link"], "source": x["source"],
                                  "published": x["published"], "kinds": x.get("kinds"), "cities": x.get("cities")}
                                 for x in infra[:8]]},
            "mofa": mails, "japan": japan, "world": world}


# ---------------------------------------------------------------- countries

KZ_STREETS = {
    # Almaty, central grid
    "almaty": [
        ("al_abaya", "абая"), ("al_alfarabi", "аль-фараби"), ("al_dostyk", "достык"),
        ("al_nazarbaeva", r"назарбаев|фурманов"), ("al_tolebi", "толе би"), ("al_zhibekzholy", "жибек жолы"),
        ("al_zheltoksan", "желтоксан"), ("al_seifullina", "сейфуллин"), ("al_baitursynova", "байтурсынов"),
        ("al_auezova", "ауэзов"), ("al_rozybakieva", "розыбакиев"), ("al_raiymbeka", "райымбек"),
        ("al_gogolya", "гогол"), ("al_kabanbay", "кабанбай батыр"), ("al_bogenbay", "богенбай батыр"),
        ("al_satpaeva", "сатпаев"), ("al_timiryazeva", "тимирязев"), ("al_abylaykhana", "абылай хан"),
    ],
    # Astana, left and right bank
    "astana": [
        ("as_mangilikel", "мангилик ел|мәңгілік ел"), ("as_turan", "туран"), ("as_kabanbay", "кабанбай батыр"),
        ("as_respubliki", "республики"), ("as_abaya", "абая"), ("as_saryarka", "сарыарк"),
        ("as_kenesary", "кенесары"), ("as_beibitshilik", "бейбітшілік|бейбитшилик"), ("as_seifullina", "сейфуллин"),
        ("as_imanova", "иманов"), ("as_auezova", "ауэзов"), ("as_zhenis", "жеңіс|женис|победы"),
        ("as_momyshuly", "момышулы|момышұлы"), ("as_syganak", "сыганак|сығанақ"), ("as_ulydala", "улы дала|ұлы дала"),
        ("as_kunaeva", "кунаев|қонаев"), ("as_tauelsizdik", "тауелсиздик|тәуелсіздік"), ("as_dostyk", "достык"),
    ],
}

COUNTRIES = {
    "kg": dict(
        feeds=LOCAL_FEEDS, national=KG_WORDS, city_words=CITY_WORDS, region="KG",
        infra_queries=["(отключение OR отключат OR перекроют OR без) (воды OR электроэнергии OR электричества OR газа OR отопления OR движения) (Бишкек OR Ош OR Кыргызстан) when:2d",
                       "(МЧС OR сель OR оползень OR лавина OR землетрясение OR паводок OR штормовое предупреждение OR перевал закрыт) Кыргызстан when:3d"],
        watch={"bishkek": WATCH_STREETS}, village=VILLAGE_RE.pattern, postcode=r"(?<!\d)72\d{4}(?!\d)",
        ja_keywords=("キルギス", "ビシュケク", "イシク", "オシュ", "ジャパロフ"),
        ja_queries=["キルギス ({sites}) when:90d", "キルギス when:14d", "ビシュケク when:30d"],
        mofa="0996", prev="news.json", tz_hours=6, world_queries=["Kyrgyzstan when:30d", "Kyrgyz OR Bishkek OR Japarov when:30d",
                                                            ("Kyrgyzstan when:30d", "en-GB"),
                                                            ("Киргизия OR Кыргызстан when:14d", "ru"),
                                                            ("Бишкек OR Жапаров OR киргизский when:14d", "ru")]),
    "kz": dict(
        feeds=[("Tengrinews", "https://tengrinews.kz/news.rss"), ("Kazinform", "https://www.inform.kz/rss/rus.xml"),
               ("Kursiv", "https://kz.kursiv.media/feed/"), ("Sputnik Казахстан", "https://ru.sputnik.kz/export/rss2/archive/index.xml"),
               ("Orda.kz", "https://orda.kz/feed/"), ("Caravan", "https://www.caravan.kz/feed/"),
               ("LS", "https://lsm.kz/rss"), ("Азаттык", "https://rus.azattyq.org/api/epiqq")],
        national=["казахстан", "казахст", "астан", "алмат", "шымкент", "караганд", "актоб", "атырау", "актау",
                  "павлодар", "усть-каменогорск", "семе", "костана", "петропавловск", "кызылорд", "туркестан",
                  "тараз", "уральск", "токаев", "мажилис", "сенат", "акимат", "аким", "тенге", "рк", "курултай"],
        city_words={"astana": ["астан", "столиц"], "almaty": ["алмат"], "shymkent": ["шымкент"],
                    "karaganda": ["караганд"], "aktobe": ["актоб"], "atyrau": ["атырау"], "aktau": ["актау"],
                    "pavlodar": ["павлодар"], "oskemen": ["усть-каменогорск", "өскемен"],
                    "turkistan": ["туркестан"], "taraz": ["тараз"], "kostanay": ["костана"]},
        region="KZ",
        infra_queries=["(отключение OR отключат OR без) (света OR электричества OR электроэнергии) (Алматы OR Астана) when:2d",
                       "(отключение OR отключат OR без) (воды OR газа OR отопления) (Алматы OR Астана) when:2d",
                       "(перекроют OR ограничат движение) (Алматы OR Астана) when:2d",
                       "(МЧС OR сель OR оползень OR лавина OR землетрясение OR паводок OR штормовое предупреждение OR трасса закрыта) Казахстан when:3d"],
        watch=KZ_STREETS,
        village=r"(?<![а-яё])(сел[оа]|с\.|поселк|пос\.|ауыл|аул\b|снт|дачн|садовод|алматинск\w* област|акмолинск\w* област)",
        postcode=r"(?<!\d)0[01]\d{4}(?!\d)",
        ja_keywords=("カザフ", "アスタナ", "アルマトイ", "アルマティ", "トカエフ"),
        ja_queries=["カザフスタン ({sites}) when:90d", "カザフスタン when:14d", "アスタナ OR アルマトイ when:30d"],
        mofa="0007", prev="news-kz.json", tz_hours=5,
        world_queries=["Kazakhstan when:30d", "Astana OR Almaty OR Tokayev when:30d", ("Kazakhstan when:30d", "en-GB"),
                       ("Казахстан when:14d", "ru"), ("Астана OR Алматы OR Токаев when:14d", "ru")]),
}


def use_country(code):
    """Point the module-level settings used by the collectors at one country."""
    global COUNTRY, LOCAL_FEEDS, KG_RE, CITY_RES, INFRA_QUERIES, GN_REGION, WATCH_CITIES, STREET_RES_BY_CITY
    global VILLAGE_RE, POSTCODE_RE, JA_KEYWORDS, JA_QUERIES, MOFA_CODE, PREV_URL, TZ_HOURS, WORLD_QUERIES
    c = COUNTRIES[code]
    COUNTRY = code
    LOCAL_FEEDS = c["feeds"]
    KG_RE = word_re(c["national"])
    CITY_RES = {cid: word_re(ws) for cid, ws in c["city_words"].items()}
    INFRA_QUERIES, GN_REGION = c["infra_queries"], c["region"]
    WATCH_CITIES = {city: ws for city, ws in c["watch"].items()}
    STREET_RES_BY_CITY = {city: [(sid, re.compile(r"(?<![а-яёәіңғүұқөһ])(?:" + rx + ")")) for sid, rx in ws]
                          for city, ws in WATCH_CITIES.items()}
    VILLAGE_RE, POSTCODE_RE = re.compile(c["village"]), re.compile(c["postcode"])
    JA_KEYWORDS, JA_QUERIES, MOFA_CODE = c["ja_keywords"], c["ja_queries"], c["mofa"]
    TZ_HOURS, WORLD_QUERIES = c["tz_hours"], c["world_queries"]
    PREV_URL = "https://raw.githubusercontent.com/kginfo15/kyrgyzcha-family/news-data/" + c["prev"]


def main():
    use_country(sys.argv[1] if len(sys.argv) > 1 else "kg")
    prev_tr = {}
    try:
        prev = json.loads(get(PREV_URL))
        for x in (prev.get("local") or []) + (prev.get("infra") or []) + (prev.get("world") or []):
            if x.get("title_ja"):
                prev_tr[x["link"]] = (x["title_ja"], x.get("lead_ja", ""))
        GNEWS_CACHE.update(prev.get("gnews_links") or {})
        for x in (prev.get("mystreet") or {}).get("items", []):
            for h in x.get("hits", []):
                if h.get("text_ja"):
                    prev_tr["hit:" + h["text"]] = (h["text_ja"], "")
    except Exception as e:
        log(f"no previous data: {e}")

    out = {"version": 2, "country": COUNTRY, "updated": NOW.isoformat()}
    for key, fn in (("local", lambda: collect_local(prev_tr)), ("japan", collect_japan), ("safety", collect_safety), ("world", lambda: collect_world(prev_tr)),
                    ("infra", lambda: collect_infra(prev_tr))):
        try:
            out[key] = fn()
        except Exception as e:
            log(f"{key}: failed: {e}")
            out[key] = None
    try:
        out["mystreet"] = collect_mystreet(out.get("infra") or [], prev_tr)
    except Exception as e:
        log(f"mystreet: failed: {e}")
        out["mystreet"] = None
    if not out["local"] and not out["japan"]:
        sys.exit("no news fetched")
    out["gnews_links"] = {k: v for k, v in GNEWS_CACHE.items() if v != k}
    # older app versions read feeds.ja / feeds.local
    out["feeds"] = {
        "ja": [{"title": x["title"], "link": x["link"], "source": x["source"], "published": x["published"]}
               for x in (out["japan"] or [])],
        "local": [{"title": x.get("title_ja") or x["title"], "link": x["link"], "source": x["source"],
                   "published": x["published"]} for x in (out["local"] or [])],
    }
    # weekly digest: keep a week of items in a separate archive file
    archive_out = sys.argv[2] if len(sys.argv) > 2 else None
    try:
        try:
            archive = json.loads(get(PREV_URL.replace(".json", "-archive.json").replace("news-kz-archive", "news-archive-kz")))
        except Exception as e:
            log(f"no previous archive: {e}")
            archive = None
        archive = update_archive(archive, out)
        last_mon, this_mon = week_bounds()
        out["weekly"] = {"last": build_weekly(archive, out, last_mon, this_mon),
                         "this": build_weekly(archive, out, this_mon, NOW + timedelta(seconds=1)),
                         "since": archive["since"]}
        log(f"weekly: last {out['weekly']['last']['articles']} / this {out['weekly']['this']['articles']} articles, archive {len(archive['items'])}")
        if archive_out:
            with open(archive_out, "w") as fh:
                json.dump(archive, fh, ensure_ascii=False)
    except Exception as e:
        log(f"weekly: failed: {e}")
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
