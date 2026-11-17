"""Build a picture atlas (one WebP sprite sheet + index) from Microsoft Fluent Emoji 3D images (MIT license).
usage: build_atlas.py <assets_dir> <out.webp> <out.json> <source files...>
Sources: "ID emoji" text files or {id: emoji} JSON files. Every distinct picture (grapheme) used becomes one tile.
assets_dir = node_modules/@lobehub/fluent-emoji-3d/assets (npm i @lobehub/fluent-emoji-3d)"""
import sys, os, json, regex
from PIL import Image
assets, out_img, out_json = sys.argv[1:4]
RULES = ["🧸","🏫","💊","🏥","🏢","🚕","📄","🍵","🫓","🍞","🥛","💧","🏦","📮","🍽️","🛫","💼","🧑‍⚕️","🏪","🏠","🧒","👰","🧑‍💼"]
vals = list(RULES)
for f in sys.argv[4:]:
    if f.endswith(".json"): vals += list(json.load(open(f, encoding="utf-8")).values())
    else:
        for ln in open(f, encoding="utf-8"):
            a = ln.split()
            if len(a) == 2: vals.append(a[1])
gs = []
for v in vals:
    for g in regex.findall(r"\X", v):
        if g.strip() and g not in gs: gs.append(g)
def find(g):
    cps = ["%04x" % ord(c) for c in g]
    cands = ["-".join(cps), "-".join(c for c in cps if c != "fe0f"), "-".join(cps + ["fe0f"])]
    if len(cps) == 1: cands.append(cps[0] + "-fe0f")
    if "200d" in cps:  # zwj sequence: try adding fe0f after first part
        cands.append("-".join(cps).replace("-200d", "-fe0f-200d", 1))
    for c in cands:
        p = os.path.join(assets, c + ".webp")
        if os.path.exists(p): return p
    return None
TILE, COLS = 96, 24
found = [(g, find(g)) for g in gs]
miss = [g for g, p in found if not p]
found = [(g, p) for g, p in found if p]
rows = (len(found) + COLS - 1) // COLS
sheet = Image.new("RGBA", (TILE * COLS, TILE * rows), (0, 0, 0, 0))
idx = {}
for i, (g, p) in enumerate(found):
    t = Image.open(p).convert("RGBA").resize((TILE - 8, TILE - 8), Image.LANCZOS)
    sheet.paste(t, (TILE * (i % COLS) + 4, TILE * (i // COLS) + 4), t); idx[g] = i
sheet.save(out_img, "WEBP", quality=82, method=6)
json.dump({"cols": COLS, "rows": rows, "map": idx}, open(out_json, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("tiles", len(found), "rows", rows, "bytes", os.path.getsize(out_img), "missing", "".join(miss))
