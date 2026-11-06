import urllib.request, urllib.parse, xml.etree.ElementTree as ET, re
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=25) as r: return r.status, r.read()
FEEDS=["https://tengrinews.kz/news.rss","https://tengrinews.kz/rss/","https://www.inform.kz/rss/rus.xml","https://www.inform.kz/ru/rss",
"https://www.zakon.kz/rss/","https://www.zakon.kz/news.rss","https://www.nur.kz/rss/all.rss","https://www.nur.kz/rss/kazakhstan.rss",
"https://vlast.kz/rss/","https://orda.kz/feed/","https://kz.kursiv.media/feed/","https://kursiv.media/feed/","https://www.kt.kz/rus/rss/",
"https://ru.sputnik.kz/export/rss2/archive/index.xml","https://24.kz/ru/?format=feed&type=rss","https://almaty.tv/rss","https://www.caravan.kz/feed/",
"https://www.azattyq.org/api/","https://rus.azattyq.org/api/zmgqoe","https://rus.azattyq.org/api/epiqq","https://forbes.kz/rss/","https://lsm.kz/rss"]
for u in FEEDS:
    try:
        s,b=get(u); root=ET.fromstring(b); its=list(root.iter("item"))
        t=(its[0].findtext("title") or "")[:60] if its else ""
        d=re.sub(r"<[^>]+>","",(its[0].findtext("description") or ""))[:80].replace("\n"," ") if its else ""
        print("OK",len(its),u,"|",t,"|",d)
    except Exception as e: print("FAIL",u,str(e)[:80])
for code in ["0007","0077","7"]:
    for suf in ["A.xml"]:
        u=f"https://www.ezairyu.mofa.go.jp/opendata/country/{code}{suf}"
        try:
            s,b=get(u); txt=b.decode("utf-8","replace"); m=re.search(r"<country[^>]*>\s*<cd>(\d+)</cd>\s*<name>([^<]+)",txt)
            print("MOFA",u,m.groups() if m else txt[:200].replace("\n"," "))
        except Exception as e: print("MOFA FAIL",u,str(e)[:60])
for q in ["отключение света Алматы when:3d","отключение воды Алматы when:3d","отключение света Астана when:3d","отключение воды Астана when:3d"]:
    u="https://news.google.com/rss/search?"+urllib.parse.urlencode({"q":q,"hl":"ru","gl":"KZ","ceid":"KZ:ru"})
    try:
        s,b=get(u); its=list(ET.fromstring(b).iter("item"))
        print("GN",q,len(its)); [print("   ",(i.findtext("source") or ""),"|",(i.findtext("title") or "")[:90]) for i in its[:6]]
    except Exception as e: print("GN FAIL",q,e)
