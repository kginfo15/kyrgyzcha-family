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
PREV_URL = "https://raw.githubusercontent.com/yuuuta21/kyrgyzcha-family/news-data/news.json"
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

def translate_batch(texts, sl="ru", tl="ja"):
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
    ("safety", ["гкнб", "мвд", "милици", "задерж", "арест", "дтп", "авари", "пожар", "землетряс", "сель",
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
    """Match words at a word start; words of 3 letters or fewer must match whole."""
    parts = []
    for w in words:
        w = w.strip()
        if w == "$":
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
             r"|перевал\w*[^.!?]{0,30}закрыт|сход\w* (сел|лавин)|гололед"),
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


def infra_kinds(text):
    t = text.lower()
    if not OUTAGE_RE.search(t):
        return []
    return [k for k, rx in INFRA_RES if rx.search(t)]


def collect_infra(prev_tr):
    cutoff = NOW - timedelta(hours=48)
    cands = []
    for source, url in LOCAL_FEEDS:
        for it in local_feed(source, url) or []:
            cands.append((source, it))
    gq = "(отключение OR отключат OR перекроют OR без) (воды OR электроэнергии OR электричества OR газа OR отопления OR движения) (Бишкек OR Ош OR Кыргызстан) when:2d"
    try:
        for it in rss_items("https://news.google.com/rss/search?" + urllib.parse.urlencode(
                {"q": gq, "hl": "ru", "gl": "KG", "ceid": "KG:ru"})):
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
    log(f"infra: {len(items)} items")
    translate_items(items, prev_tr)
    return items


# ---------------------------------------------------------------- my streets

# Central Bishkek streets around the JICA office (Panfilov St. 178) that the app
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
    """Open the Bishkek outage articles and keep the lines naming our streets."""
    out, checked, failed = [], 0, 0
    for x in infra:
        if "bishkek" not in x["cities"] or "news.google.com" in x["link"]:
            continue
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
            if low.count(",") < 2 and not tm:
                continue
            streets = []
            first = None
            for ja, rx in STREET_RES:
                for m in rx.finditer(low):
                    before = low[max(0, m.start() - 100):m.start()]
                    before = re.split(r"[;\n]", before)[-1]
                    if VILLAGE_RE.search(before):
                        continue  # same street name in a village outside the city
                    streets.append(ja)
                    first = m.start() if first is None else min(first, m.start())
                    break
            if not streets:
                continue
            snippet = ln[max(0, first - 120): first + 220].strip()
            when = ln[tm.start():tm.end()] if tm else (last_time if n - last_time_at <= 6 else None)
            snippet = TIME_RE.sub(" ", snippet).strip(" -–—:,")
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
        out.append({"kinds": x["kinds"], "title": x["title"], "title_ja": x.get("title_ja", ""),
                    "link": x["link"], "source": x["source"], "published": x["published"],
                    "date": outage_date(x["title"] + " " + x.get("lead", "")), "hits": hits})
    log(f"mystreet: checked {checked} articles ({failed} failed), {len(out)} with our streets")
    return {"streets": [sid for sid, _ in WATCH_STREETS], "checked": checked, "failed": failed, "items": out}


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
    queries = [f"キルギス ({sites}) when:90d", "キルギス when:14d", "ビシュケク when:30d"]
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


# ---------------------------------------------------------------- MOFA safety

def mofa_date(s):
    try:
        return datetime.strptime(s.strip(), "%Y/%m/%d %H:%M:%S").replace(tzinfo=JST).astimezone(timezone.utc).isoformat()
    except Exception:
        return None


def collect_safety():
    root = ET.fromstring(get("https://www.ezairyu.mofa.go.jp/opendata/country/0996A.xml"))
    txt = lambda tag: (root.findtext(tag) or "").strip()
    out = {
        "levels": {f"l{n}": int(txt(f"riskLevel{n}") or 0) for n in (1, 2, 3, 4)},
        "riskTitle": txt("riskTitle"),
        "riskLead": clean(txt("riskLead"))[:400],
        "riskDate": mofa_date(txt("riskLeaveDate")),
        "riskUrl": txt("riskMapUrl") or "https://www.anzen.mofa.go.jp/info/pcinfectionspothazardinfo_265.html",
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

def main():
    prev_tr = {}
    try:
        prev = json.loads(get(PREV_URL))
        for x in (prev.get("local") or []) + (prev.get("infra") or []):
            if x.get("title_ja"):
                prev_tr[x["link"]] = (x["title_ja"], x.get("lead_ja", ""))
        for x in (prev.get("mystreet") or {}).get("items", []):
            for h in x.get("hits", []):
                if h.get("text_ja"):
                    prev_tr["hit:" + h["text"]] = (h["text_ja"], "")
    except Exception as e:
        log(f"no previous data: {e}")

    out = {"version": 2, "updated": NOW.isoformat()}
    for key, fn in (("local", lambda: collect_local(prev_tr)), ("japan", collect_japan), ("safety", collect_safety),
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
    # older app versions read feeds.ja / feeds.local
    out["feeds"] = {
        "ja": [{"title": x["title"], "link": x["link"], "source": x["source"], "published": x["published"]}
               for x in (out["japan"] or [])],
        "local": [{"title": x.get("title_ja") or x["title"], "link": x["link"], "source": x["source"],
                   "published": x["published"]} for x in (out["local"] or [])],
    }
    json.dump(out, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
