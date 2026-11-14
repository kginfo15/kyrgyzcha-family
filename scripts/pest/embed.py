"""Put a copy of pest.json into pest.html (the <script type="application/json"
id="pest-json"> tag), so the page draws at once and also works offline.
The page still reads the newest pest.json from the pest-data branch.

usage: python3 scripts/pest/embed.py path/to/pest.json
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
page = os.path.join(ROOT, "pest.html")
data = json.load(open(sys.argv[1]))
blob = json.dumps(data, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
s = open(page, encoding="utf-8").read()
s, n = re.subn(r'(<script type="application/json" id="pest-json">).*?(</script>)',
               lambda m: m.group(1) + blob + m.group(2), s, count=1, flags=re.S)
assert n == 1, "pest-json tag not found"
open(page, "w", encoding="utf-8").write(s)
print(f"embedded {len(blob)//1024} KB, built {data['built']}")
