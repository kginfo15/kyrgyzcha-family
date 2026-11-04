import urllib.request, urllib.parse, xml.etree.ElementTree as ET, json
UA={"User-Agent":"Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
def get(u):
    with urllib.request.urlopen(urllib.request.Request(u,headers=UA),timeout=25) as r: return r.status, r.read()
C=["https://24.kg/rss/","https://24.kg/rss.xml","https://kaktus.media/rss","https://kaktus.media/?rss","https://kaktus.media/rss.xml",
"https://akipress.org/rss/news.rss","https://akipress.org/rss.php","https://akipress.com/rss/news.rss","https://kloop.kg/feed/",
"https://economist.kg/feed/","https://kabar.kg/rss/","https://kabar.kg/rus/rss/","https://rus.azattyk.org/api/epiqq","https://rus.azattyk.org/rss",
"https://www.vb.kg/rss/","https://knews.kg/feed/","https://tazabek.kg/rss/","https://www.tazabek.kg/rss.xml","https://kg.akipress.org/rss/news.rss",
"https://www.ezairyu.mofa.go.jp/opendata/country/0996A.xml","https://www.ezairyu.mofa.go.jp/opendata/country/0996L.xml",
"https://www.ezairyu.mofa.go.jp/opendata/area/newarrivalA.xml","https://www.anzen.mofa.go.jp/rss/news.xml",
"https://news.google.com/rss/search?"+urllib.parse.urlencode({"q":"キルギス (site:nikkei.com OR site:asahi.com OR site:yomiuri.co.jp OR site:mainichi.jp OR site:sankei.com OR site:nhk.or.jp OR site:jiji.com OR site:kyodonews.jp OR site:47news.jp)","hl":"ja","gl":"JP","ceid":"JP:ja"}),
]
for u in C:
    try:
        s,b=get(u)
        try:
            root=ET.fromstring(b); its=list(root.iter("item")) or list(root.iter("{http://www.w3.org/2005/Atom}entry"))
            first=its[0] if its else None
            t=(first.findtext("title") or first.findtext("{http://www.w3.org/2005/Atom}title") or "")[:70] if first is not None else ""
            dsc=(first.findtext("description") or "")[:120].replace("\n"," ") if first is not None else ""
            print("OK",s,len(its),u,"|",t,"|",dsc)
            if "mofa" in u: print(b[:1500].decode("utf-8","replace"))
        except Exception as e: print("NOTXML",s,len(b),u,b[:200])
    except Exception as e: print("FAIL",u,e)
try:
    s,b=get("https://translate.googleapis.com/translate_a/single?client=gtx&sl=ru&tl=ja&dt=t&q="+urllib.parse.quote("Президент подписал закон о бюджете"))
    print("GTX",s,b[:200].decode())
except Exception as e: print("GTX FAIL",e)
