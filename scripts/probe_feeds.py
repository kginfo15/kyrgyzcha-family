import re, sys, time, json, urllib.request, urllib.parse
import xml.etree.ElementTree as ET
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"}
def get(u, t=25):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=t) as r:
        return r.status, r.read()
FEEDS = """
uz https://www.gazeta.uz/ru/rss/
uz https://kun.uz/ru/news/rss
uz https://podrobno.uz/rss/
uz https://uz.sputniknews.ru/export/rss2/archive/index.xml
uz https://ru.sputniknews.uz/export/rss2/archive/index.xml
uz https://www.uzdaily.uz/ru/rss/
uz https://uzdaily.uz/ru/rss
uz https://daryo.uz/ru/feed/
uz https://www.spot.uz/ru/rss/
uz https://uza.uz/ru/rss
uz https://uz.kursiv.media/feed/
uz https://repost.uz/feed
uz https://nuz.uz/feed/
uz https://www.review.uz/ru/rss
uz https://kommersant.uz/feed
uz https://upl.uz/rss.xml
uz https://www.norma.uz/rss
uz https://dunyo.info/ru/rss
tj https://asiaplustj.info/ru/rss
tj https://asiaplustj.info/rss
tj https://asiaplustj.info/ru/rss.xml
tj https://tj.sputniknews.ru/export/rss2/archive/index.xml
tj https://ru.sputnik-tj.com/export/rss2/archive/index.xml
tj https://avesta.tj/feed/
tj https://khovar.tj/rus/feed/
tj https://khovar.tj/rus/rss/
tj https://www.dialog.tj/feed
tj https://news.tj/ru/rss.xml
tj https://tajikta.tj/feed/
tj https://ru.ozodi.org/api/
tj https://rus.ozodi.org/api/epiqq
tj https://www.ozodi.org/api/epiqq
tj https://pressa.tj/feed/
tj https://tojnews.org/ru/rss
tj https://vecherka.tj/feed/
tj https://cabar.asia/ru/feed
"""
for line in FEEDS.strip().splitlines():
    c, u = line.split()
    try:
        st, b = get(u)
        try:
            root = ET.fromstring(b)
            items = root.findall(".//item")
            t0 = items[0].findtext("title")[:60] if items else ""
            d0 = items[0].findtext("pubDate") if items else ""
            print(f"OK   {c} {u} {st} items={len(items)} | {d0} | {t0}")
        except Exception as e:
            print(f"XML? {c} {u} {st} {len(b)}B {e} {b[:120]!r}")
    except Exception as e:
        print(f"FAIL {c} {u} {e}")
for page in ("https://rus.ozodi.org/rssfeeds", "https://www.ozodi.org/rssfeeds"):
    try:
        st, b = get(page)
        print(page, st, sorted(set(re.findall(rb'/api/[a-z0-9_\-]+', b)))[:30])
    except Exception as e:
        print(page, "FAIL", e)
for code in ("0998", "0992", "0996"):
    try:
        st, b = get(f"https://www.ezairyu.mofa.go.jp/opendata/country/{code}A.xml")
        root = ET.fromstring(b)
        print("mofa", code, root.findtext("countryName"), root.findtext("riskLevel1"), root.findtext("riskLevel2"), root.findtext("riskTitle"), len(list(root.iter("mail"))))
    except Exception as e:
        print("mofa", code, "FAIL", e)
for gl, q in (("UZ", "Ташкент отключение"), ("TJ", "Душанбе отключение"), ("KZ", "Алматы")):
    try:
        u = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q + " when:7d", "hl": "ru", "gl": gl, "ceid": gl + ":ru"})
        st, b = get(u)
        items = ET.fromstring(b).findall(".//item")
        print("gnews", gl, st, len(items), [i.findtext("title")[:50] for i in items[:3]])
    except Exception as e:
        print("gnews", gl, "FAIL", e)
for q in ("ウズベキスタン when:14d", "タジキスタン when:14d"):
    u = "https://news.google.com/rss/search?" + urllib.parse.urlencode({"q": q, "hl": "ja", "gl": "JP", "ceid": "JP:ja"})
    try:
        st, b = get(u); items = ET.fromstring(b).findall(".//item")
        print("ja", q, len(items), [i.findtext("title")[:40] for i in items[:3]])
    except Exception as e:
        print("ja", q, "FAIL", e)
u = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=2026-09-01&minmagnitude=3&minlatitude=36.5&maxlatitude=45.7&minlongitude=55.9&maxlongitude=75.2"
try:
    st, b = get(u); f = json.loads(b)["features"]
    print("usgs", len(f), sorted(set(x["properties"]["place"].split(", ")[-1] for x in f)))
    print([x["properties"]["place"] for x in f if "Uzbek" in x["properties"]["place"] or "Tajik" in x["properties"]["place"]][:10])
except Exception as e:
    print("usgs FAIL", e)
