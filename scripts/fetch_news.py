"""Collect Kyrgyzstan news for weather.html and print it as JSON.

Run by .github/workflows/update-news.yml; the output is published to the
`news-data` branch.

Three parts:
  local  - Kyrgyz media (Russian) filtered to politics / economy / safety,
           with title and lead machine-translated into Japanese
  japan  - Japanese press coverage of Kyrgyzstan (major papers flagged)
  safety - Japan MOFA travel-safety level and embassy (consular) e-mails
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


def collect_local(prev_tr):
    items, seen = [], set()
    cutoff = NOW - timedelta(hours=36)
    for source, url in LOCAL_FEEDS:
        try:
            got = list(rss_items(url))
        except Exception as e:
            log(f"local {source}: failed: {e}")
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

    for x in out:
        cached = prev_tr.get(x["link"])
        if cached:
            x["title_ja"], x["lead_ja"] = cached
            continue
        try:
            texts = [x["title"]] + ([x["lead"]] if x["lead"] else [])
            tr = translate_batch(texts)
            x["title_ja"] = tr[0]
            x["lead_ja"] = tr[1] if len(tr) > 1 else ""
            time.sleep(0.4)
        except Exception as e:
            log(f"translate failed: {e}")
            x["title_ja"], x["lead_ja"] = "", ""
    return out


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
        yield {"title": title, "link": it["link"], "source": src,
               "published": it["date"].isoformat() if it["date"] else None}


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
        for x in prev.get("local", []):
            if x.get("title_ja"):
                prev_tr[x["link"]] = (x["title_ja"], x.get("lead_ja", ""))
    except Exception as e:
        log(f"no previous data: {e}")

    out = {"version": 2, "updated": NOW.isoformat()}
    for key, fn in (("local", lambda: collect_local(prev_tr)), ("japan", collect_japan), ("safety", collect_safety)):
        try:
            out[key] = fn()
        except Exception as e:
            log(f"{key}: failed: {e}")
            out[key] = None
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
