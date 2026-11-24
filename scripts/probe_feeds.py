# temporary: run the news collector for Uzbekistan and Tajikistan and print a summary
import json, subprocess, sys
for c in ("uz", "tj"):
    p = subprocess.run([sys.executable, "scripts/fetch_news.py", c, f"/tmp/arch-{c}.json"], capture_output=True, text=True, timeout=1500)
    print("=====", c, "exit", p.returncode)
    print(p.stderr[-6000:])
    try:
        d = json.loads(p.stdout)
    except Exception as e:
        print("no json", e); continue
    for k in ("local", "infra", "japan", "world"):
        xs = d.get(k) or []
        print(f"--- {k}: {len(xs)} items, translated {sum(1 for x in xs if x.get('title_ja'))}")
        for x in xs[:6]:
            print("  ", x.get("cat") or x.get("kinds") or x.get("source"), "|", (x.get("title_ja") or x["title"])[:70], "|", x.get("cities", ""))
    sf = d.get("safety") or {}
    print("safety", sf.get("levels"), len(sf.get("mails") or []))
    ms = d.get("mystreet") or {}
    print("mystreet checked", ms.get("checked"), "items", len(ms.get("items") or []))
    for x in (ms.get("items") or [])[:4]:
        print("  ", x["city"], [h["streets"] for h in x["hits"]], x["hits"][0].get("text_ja", "")[:80])
    w = d.get("weekly") or {}
    print("weekly this", (w.get("this") or {}).get("articles"))
