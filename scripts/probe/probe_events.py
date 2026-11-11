"""One-off: print the structure of ticket.kg / sxodim.com listing pages."""
import json, re, sys, time, urllib.request
UA = {"User-Agent": "kyrgyzcha-family-events/0.1 (personal non-commercial event list; +https://github.com/kginfo15/kyrgyzcha-family)"}
def get(u):
    time.sleep(2)
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30) as r:
        return r.read().decode("utf-8", "replace")
def show(name, s, n=3000):
    print(f"\n######## {name} ({len(s)} chars)\n{s[:n]}")

t = get("https://ticket.kg/")
for i, m in enumerate(re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', t, re.S)):
    show(f"ticket ld{i}", m, 2500)
links = sorted(set(re.findall(r'href="(/[a-z]{2}/[^"#?]{3,100}|/event[^"]{0,100}|/[^"/]+/[^"]{3,80})"', t)))
links = [l for l in links if not l.startswith("/_nuxt")]
print("ticket links", len(links)); print("\n".join(links[:80]))
m = re.search(r'<script[^>]*id="__NUXT_DATA__"[^>]*>(.*?)</script>', t, re.S)
if m: show("ticket NUXT_DATA", m.group(1), 4000)
i = t.find("<main"); show("ticket main html", re.sub(r"\s+", " ", t[i:i+200000]), 5000)
ev = [l for l in links if "event" in l or "afisha" in l]
if ev:
    p = get("https://ticket.kg" + ev[0])
    for j, m in enumerate(re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', p, re.S)):
        show(f"ticket event page {ev[0]} ld{j}", m, 2500)
    show("ticket event title", " ".join(re.findall(r"<title>(.*?)</title>", p)))
for u in ["https://ticket.kg/sitemap_index.xml"]:
    try: show(u, get(u), 2000)
    except Exception as e: print(u, e)

s = get("https://sxodim.com/bishkek/afisha")
for j, m in enumerate(re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S)):
    show(f"sxodim ld{j}", m, 2000)
el = sorted(set(re.findall(r'href="(https://sxodim\.com/bishkek/event/[^"]+)"', s)))
print("sxodim event links", len(el)); print("\n".join(el[:30]))
i = s.find(el[0]) if el else s.find("event")
show("sxodim around first event", re.sub(r"\s+", " ", s[max(0, i-2500):i+3500]), 6000)
if el:
    p = get(el[0])
    for j, m in enumerate(re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', p, re.S)):
        show(f"sxodim event ld{j}", m, 2500)
    i = p.find("<h1"); show("sxodim event h1", re.sub(r"\s+", " ", p[i:i+4000]))
for u in ["https://24.kg/rss/"]:
    r = get(u); show(u, r, 800)
    print("afisha items:", re.findall(r"<title>([^<]*[Аа]фиш[^<]*)</title>", r))
