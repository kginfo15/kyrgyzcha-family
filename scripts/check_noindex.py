"""Check that every HTML page in the repo tells search engines to stay away.

usage: python3 scripts/check_noindex.py   (exit code 1 if a page is missing it)

Every page must carry, inside <head>:
  <meta name="robots" content="noindex, nofollow, noarchive">
robots.txt can't be used instead: GitHub Pages serves this site under
kginfo15.github.io/kyrgyzcha-family/, and crawlers only read robots.txt at the
domain root.
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TAG = re.compile(r'<meta\s+name="robots"\s+content="noindex,\s*nofollow,\s*noarchive"\s*/?>', re.I)

bad = []
for f in sorted(glob.glob(os.path.join(ROOT, "**", "*.htm*"), recursive=True)):
    if "/.git/" in f:
        continue
    s = open(f, encoding="utf-8", errors="replace").read()
    m = TAG.search(s)
    # must come before the page body starts
    if not m or re.search(r"<body[\s>]", s[:m.start()], re.I):
        bad.append(os.path.relpath(f, ROOT))
for f in bad:
    print("missing robots noindex meta:", f)
print(f"{'NG' if bad else 'OK'}: checked HTML pages")
sys.exit(1 if bad else 0)
