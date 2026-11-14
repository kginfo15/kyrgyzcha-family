"""Tokyo base map for mosquito.html: municipality outlines (mainland only) as SVG paths.

  python3 scripts/mosquito/make_map.py N03-20240101_13.geojson > scripts/mosquito/tokyo_map.json

Source: 国土数値情報 行政区域データ N03 (2024), CC BY 4.0. Islands are left out
(no survey sites); lines are simplified to about 60 m.
"""
import json, math, sys
from collections import defaultdict

W = 1000.0
LON0, LON1, LAT0, LAT1 = 138.93, 139.93, 35.48, 35.91   # mainland Tokyo
KX = math.cos(math.radians(35.7))
SCALE = W / ((LON1 - LON0) * KX)
H = (LAT1 - LAT0) * SCALE


def proj(lon, lat):
    return ((lon - LON0) * KX * SCALE, (LAT1 - lat) * SCALE)


def dp(pts, eps):
    if len(pts) < 3:
        return pts
    keep = [False] * len(pts); keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        (x1, y1), (x2, y2) = pts[a], pts[b]
        dx, dy = x2 - x1, y2 - y1; L = math.hypot(dx, dy) or 1e-9
        best, bi = 0, None
        for i in range(a + 1, b):
            d = abs(dy * (pts[i][0] - x1) - dx * (pts[i][1] - y1)) / L
            if d > best:
                best, bi = d, i
        if bi is not None and best > eps:
            keep[bi] = True; stack += [(a, bi), (bi, b)]
    return [p for p, k in zip(pts, keep) if k]


def dp_ring(pts, eps):
    """Closed ring: split at the point farthest from the start, simplify both halves."""
    k = max(range(len(pts)), key=lambda i: math.hypot(pts[i][0] - pts[0][0], pts[i][1] - pts[0][1]))
    return dp(pts[:k + 1], eps)[:-1] + dp(pts[k:], eps)


def area(r):
    return abs(sum(r[i][0] * r[i - 1][1] - r[i - 1][0] * r[i][1] for i in range(len(r)))) / 2


gj = json.load(open(sys.argv[1]))
paths = defaultdict(list)
names = {}
for f in gj["features"]:
    p = f["properties"]
    code = p.get("N03_007")
    name = (p.get("N03_004") or p.get("N03_003") or "")
    g = f["geometry"]
    polys = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
    for poly in polys:
        ring = poly[0]
        lat = sum(c[1] for c in ring) / len(ring)
        if lat < 35.4:
            continue  # islands
        pts = dp_ring([proj(*c) for c in ring], 0.7)
        if len(pts) < 4 or area(pts) < 6:
            continue
        paths[code].append("M" + "L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + "Z")
        names[code] = name
out = {"source": "国土数値情報(行政区域データ N03, 2024年) 国土交通省 / CC BY 4.0 を加工",
       "w": W, "h": round(H, 1), "lon0": LON0, "lat1": LAT1, "kx": KX, "scale": SCALE,
       "areas": [{"code": c, "name": names[c], "ward": c.startswith("131"), "d": "".join(v)} for c, v in sorted(paths.items())]}
print(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
