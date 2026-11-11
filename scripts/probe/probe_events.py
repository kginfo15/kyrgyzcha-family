"""One-off: print the structure of sxodim.com pages."""
import json, re, sys, time, urllib.request
UA = {"User-Agent": "kyrgyzcha-family-events/0.1 (personal non-commercial event list; +https://github.com/kginfo15/kyrgyzcha-family)"}
def get(u):
    time.sleep(2)
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=30) as r:
        return r.read().decode("utf-8", "replace")
def show(name, s, n=3000):
    print(f"\n######## {name} ({len(s)} chars)\n{s[:n]}")
for page in ["https://sxodim.com/bishkek", "https://sxodim.com/bishkek/events/week", "https://sxodim.com/bishkek/events/koncert"]:
    s = get(page)
    links = sorted(set(re.findall(r'href="(https://sxodim\.com/bishkek/[^"]+)"', s)))
    kinds = {}
    for l in links:
        k = l.split("/")[4] if len(l.split("/")) > 4 else ""
        kinds.setdefault(k, []).append(l)
    print("\n== ", page, len(s), {k: len(v) for k, v in kinds.items()})
    for k, v in kinds.items():
        print(k, v[:4])
    for j, m in enumerate(re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', s, re.S)):
        show(f"ld{j}", m, 1500)
    print("api hints", sorted(set(re.findall(r'["\'](/api/[^"\']+|https://[^"\']*api[^"\']*)["\']', s)))[:20])
    ev = kinds.get("event") or kinds.get("events") or []
    ev = [l for l in ev if l.count("/") >= 5]
    if ev:
        i = s.find(ev[0]); show("card html", re.sub(r"\s+", " ", s[max(0, i-1500):i+2000]), 3500)
p = get("https://sxodim.com/bishkek/event/" if False else [l for l in links if "/event/" in l][0]) if any("/event/" in l for l in links) else ""
if p:
    for j, m in enumerate(re.findall(r'<script type="application/ld\+json"[^>]*>(.*?)</script>', p, re.S)):
        show(f"event page ld{j}", m, 2500)
    i = p.find("<h1"); show("event h1", re.sub(r"\s+", " ", p[i:i+3000]))
