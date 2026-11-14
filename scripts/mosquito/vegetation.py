"""Vegetation of each survey park, one row per park -> vegetation.json.

  python3 scripts/mosquito/vegetation.py OUT_DIR

Park outline: OpenStreetMap (Overpass API; ODbL). Land cover: ESA WorldCover 10 m
(2021, v200; CC BY 4.0), read straight from its public cloud copy, only the window
around each park. For every park:
  area_ha                         size of the outline
  tree_frac / grass_frac / water_frac / built_frac / bare_frac / crop_frac
                                  share of the park's 10 m cells in each class
  tree_frac_200m, built_frac_200m, built_frac_500m
                                  same, in a ring 0-200 m / 0-500 m outside the outline
                                  (Aedes albopictus usually flies about 100-200 m)
Year-by-year greenness (Sentinel-2 NDVI) is a later step; the page already reads
`ndvi_<year>` keys if they appear here.
"""
import json, math, os, re, sys, time, urllib.parse, urllib.request
import numpy as np
import rasterio
from rasterio.features import geometry_mask
from rasterio.windows import from_bounds
from shapely.geometry import Point, Polygon, MultiPolygon, LineString, mapping, shape
from shapely.ops import linemerge, polygonize, unary_union, transform
from pyproj import Transformer

sys.path.insert(0, os.path.dirname(__file__))
from sites import SITES

OUT = sys.argv[1]
UA = {"User-Agent": "mosquito surveillance research page (github.com/kginfo15/kyrgyzcha-family)"}
WC = "/vsicurl/https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/ESA_WorldCover_10m_2021_v200_N33E138_Map.tif"
CLASSES = {"tree": [10], "shrub": [20], "grass": [30], "crop": [40], "built": [50], "bare": [60], "water": [80, 90, 95]}
OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"]

# words that pick the park's own outline out of the OSM features around the point
KEYWORDS = {
    "oi": "大井ふ頭中央海浜公園", "odaiba": "お台場海浜公園", "aoyama": "青山霊園", "yanaka": "谷中霊園",
    "somei": "染井霊園", "shakujii": "石神井公園", "toneri": "舎人公園", "kinuta": "砧公園",
    "inokashira": "井の頭", "tamazoo": "多摩動物公園", "sayama": "狭山公園", "oyamada": "小山田緑地",
    "hachioji": "八王子霊園", "yakuyo": "薬用植物園", "jindai": "神代植物公園", "mizuho": "瑞穂農芸",
    "yoyogi": "代々木公園", "hibiya": "日比谷公園", "hamarikyu": "浜離宮", "toyama": "戸山公園",
    "ueno": "上野(恩賜)?公園", "komazawa": "駒沢オリンピック公園", "hikarigaoka": "光が丘公園",
    "sarue": "猿江恩賜公園", "kasai": "葛西臨海公園",
}

to_m = Transformer.from_crs("EPSG:4326", "EPSG:6677", always_xy=True).transform   # JGD2011 / Japan zone IX (metres)
to_deg = Transformer.from_crs("EPSG:6677", "EPSG:4326", always_xy=True).transform


def overpass(q):
    data = urllib.parse.urlencode({"data": q}).encode()
    err = None
    for url in OVERPASS:
        for i in range(2):
            try:
                with urllib.request.urlopen(urllib.request.Request(url, data=data, headers=UA), timeout=180) as r:
                    return json.loads(r.read())
            except Exception as e:
                err = e
                print("overpass", url, e, flush=True)
                time.sleep(15)
    raise err


def all_outlines():
    """One Overpass request for every park: features named like the park within 1.5 km."""
    parts = []
    for key, survey, ja, en, region, muni, lat, lon, traps in SITES:
        kw = KEYWORDS[key]
        parts.append(f'way["name"~"{kw}"];relation["name"~"{kw}"];')
    q = "[out:json][timeout:170][bbox:35.45,139.10,35.90,139.95];(" + "".join(parts) + ");out geom;"
    els = overpass(q).get("elements", [])
    # plus every park / garden / cemetery / zoo / school area that contains a site point,
    # whatever its name (some park outlines carry no name, or a different one)
    sel = ['[leisure~"^(park|garden)$"]', '[landuse=cemetery]', '[amenity~"^(grave_yard|school)$"]', '[tourism=zoo]']
    parts = []
    for key, survey, ja, en, region, muni, lat, lon, traps in SITES:
        parts.append(f"is_in({lat},{lon})->.a;(" + "".join(f"way(pivot.a){t};relation(pivot.a){t};" for t in sel) + ");out geom;")
    time.sleep(5)
    try:
        more = overpass("[out:json][timeout:170];" + "".join(parts)).get("elements", [])
        for el in more:
            el["_containing"] = True
        els += more
    except Exception as e:
        print("is_in query failed", e)
    return els


def geom_of(el):
    if el["type"] == "way" and "geometry" in el:
        pts = [(p["lon"], p["lat"]) for p in el["geometry"]]
        return Polygon(pts) if len(pts) >= 4 and pts[0] == pts[-1] else None
    if el["type"] == "relation":
        lines = []
        for m in el.get("members", []):
            if m.get("type") != "way" or m.get("role") not in ("outer", ""):
                continue
            pts = [(p["lon"], p["lat"]) for p in (m.get("geometry") or []) if p and "lon" in p]
            if len(pts) >= 2:
                lines.append(LineString(pts))
        if not lines:
            return None
        u = unary_union(lines)
        try:
            merged = u if u.geom_type == "LineString" else linemerge(u)
        except ValueError:
            merged = u
        parts = list(merged.geoms) if hasattr(merged, "geoms") else [merged]
        polys = [Polygon(l.coords) for l in parts if l.is_ring and len(l.coords) >= 4]
        if not polys:
            polys = list(polygonize(unary_union(lines)))
        return unary_union(polys) if polys else None
    return None


DEBUG = {}


def safe_geom(el):
    try:
        return geom_of(el)
    except Exception:
        return None


def park_outline(els, key, lat, lon):
    kw = KEYWORDS[key]
    here = Point(lon, lat)
    cands = []
    for el in els:
        tags = el.get("tags", {})
        named = bool(re.search(kw, tags.get("name", "")))
        if not named and not el.get("_containing"):
            continue
        try:
            g = geom_of(el)
        except Exception as e:
            print("outline", el.get("id"), e)
            continue
        if g is None or g.is_empty:
            continue
        g = g.buffer(0)
        if g.distance(here) > 0.05:   # about 5 km: the same name elsewhere is another place
            continue
        # the park itself, not a pond, stage or stadium inside it
        kind = (tags.get("leisure") in ("park", "garden", "nature_reserve") or tags.get("landuse") == "cemetery"
                or tags.get("amenity") in ("grave_yard", "school") or tags.get("tourism") in ("zoo", "attraction")
                or tags.get("boundary") in ("national_park", "protected_area"))
        inside = g.contains(here)
        if not named and not inside:
            continue
        # best: a park-type area holding the site point; next: a park-type area with the park's name
        rank = 2 if (kind and inside) else 1 if kind else 0
        cands.append((rank, g.area, el["type"] + "/" + str(el["id"]), tags.get("name"), g))
    if not cands:
        return None, None, None
    cands.sort(key=lambda c: (c[0], c[1]), reverse=True)
    DEBUG[key] = [[c[0], round(transform(to_m, c[4]).area / 1e4, 2), c[2], c[3], c[4].geom_type] for c in cands[:8]]
    if cands[0][0] == 0:
        return None, None, None
    best = cands[0]
    return best[4], best[2], best[3]


def fractions(src, geom_deg):
    minx, miny, maxx, maxy = geom_deg.bounds
    win = from_bounds(minx, miny, maxx, maxy, src.transform).round_offsets().round_lengths()
    arr = src.read(1, window=win, boundless=True, fill_value=0)
    tr = src.window_transform(win)
    inside = ~geometry_mask([mapping(geom_deg)], out_shape=arr.shape, transform=tr, all_touched=False)
    vals = arr[inside & (arr > 0)]
    if vals.size == 0:
        return None
    return {k: round(float(np.isin(vals, v).sum()) / vals.size, 3) for k, v in CLASSES.items()}


def main():
    out = {"built": time.strftime("%Y-%m-%dT%H:%MZ", time.gmtime()),
           "sources": {"outline": "OpenStreetMap contributors (ODbL)",
                       "landcover": "ESA WorldCover 10m 2021 v200 (CC BY 4.0)"},
           "sites": {}, "problems": []}
    try:
        els = all_outlines()
    except Exception as e:
        els = []
        out["problems"].append(f"OpenStreetMap: {e}")
    with rasterio.Env(GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR", CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif"):
        src = rasterio.open(WC)
        for key, survey, ja, en, region, muni, lat, lon, traps in SITES:
            g, osm_id, osm_name = park_outline(els, key, lat, lon)
            if g is None:
                out["problems"].append(f"{key}: no OpenStreetMap outline")
            row = {"name": ja}
            if g is None:
                # no outline found: a 150 m circle around the representative point, marked as such
                gm = Point(*to_m(lon, lat)).buffer(150)
                row["boundary"] = "circle_150m"
            else:
                gm = transform(to_m, g)
                c = g.representative_point()
                row.update({"boundary": "osm", "osm_id": osm_id, "osm_name": osm_name,
                            "outline_lat": round(c.y, 5), "outline_lon": round(c.x, 5),
                            "point_inside": bool(g.contains(Point(lon, lat))),
                            "point_to_outline_m": round(gm.distance(Point(*to_m(lon, lat))))})
            row["area_ha"] = round(gm.area / 1e4, 2)
            inner = fractions(src, transform(to_deg, gm))
            if inner:
                for k, v in inner.items():
                    row[k + "_frac"] = v
            for dist in (200, 500):
                ring = transform(to_deg, gm.buffer(dist).difference(gm))
                f = fractions(src, ring)
                if f:
                    row[f"built_frac_{dist}m"] = f["built"]
                    row[f"tree_frac_{dist}m"] = f["tree"]
            out["sites"][key] = row
            print(key, row)
    out["candidates"] = DEBUG
    out["unmatched"] = [[el.get("tags", {}).get("name", ""), el["type"], el.get("tags", {}).get("type"),
                         sorted({(m.get("type"), m.get("role")) for m in el.get("members", [])}),
                         sum(1 for m in el.get("members", []) if m.get("geometry"))]
                        for el in els if el["type"] == "relation" and safe_geom(el) is None
                        and any(t in el.get("tags", {}).get("name", "") for t in ("公園", "霊園", "庭園", "緑地"))][:40]
    json.dump(out, open(os.path.join(OUT, "vegetation.json"), "w"), ensure_ascii=False, indent=1)
    with open(os.path.join(OUT, "vegetation.csv"), "w", encoding="utf-8") as f:
        cols = ["site", "name", "boundary", "osm_id", "area_ha", "tree_frac", "shrub_frac", "grass_frac", "crop_frac",
                "built_frac", "bare_frac", "water_frac", "tree_frac_200m", "built_frac_200m", "tree_frac_500m", "built_frac_500m"]
        f.write(",".join(cols) + "\n")
        for k, r in out["sites"].items():
            f.write(",".join([k] + ["" if r.get(c) is None else str(r.get(c)) for c in cols[1:]]) + "\n")
    print("problems:", out["problems"])


if __name__ == "__main__":
    main()
