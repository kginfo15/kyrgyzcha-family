"""Collect the official structure ("схема управления") of every Kyrgyz ministry and agency.

Run by .github/workflows/org-db.yml (cbd.minjust.gov.kg answers GitHub's runners,
not every network). Each ministry or agency has a Cabinet resolution
"О Министерстве ..." / "Об утверждении Положения о ..." whose annex is the
management scheme. This script:

  1. searches the legal database for those resolutions (in force only),
  2. downloads the latest edition of each (Russian text),
  3. cuts out the annex called "Схема управления" as plain text (text only: pictures and
     drawn charts are never copied; most schemes are drawn, so the site's structures are
     built from the text of the regulations and the titles of the units' own regulations),

and writes into OUT_DIR:

  index.json          one row per act: code, title, date, number, edition, organ,
                      whether a scheme was found, its size, pictures in it
  schemes/<code>.txt  the scheme annex as text (what people read to build the site data)
  full/<code>.txt     the whole act as text (for checking)
  status.json         {"checked": date, "latest": {code: date}} - the site compares
                      this with the date each ministry's data was last read

usage: org_db.py OUT_DIR
"""
import html
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://cbd.minjust.gov.kg/api/v1"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept": "application/json", "Origin": "https://cbd.minjust.gov.kg", "Referer": "https://cbd.minjust.gov.kg/"}
PAGE = 50
MAX_PAGES = 8

# Title searches (Russian). Each finds the resolutions that approve a body's regulation and scheme.
TITLE_QUERIES = [
    "О Министерстве",
    "схемы управления",
    "О Государственном агентстве",
    "О Государственной службе",
    "О Государственном комитете",
    "О Службе",
    "Об Агентстве",
    "О Национальном",
    "О Департаменте",
    "Об Инспекции",
    # each current ministry by name (some resolutions are called "Вопросы ..." / "О вопросах ...")
    "Министерства цифрового развития",
    "Министерства юстиции",
    "Министерства внутренних дел",
    "Министерства просвещения",
    "Министерства науки, высшего образования",
    "Министерства культуры, информации",
    "Министерства иностранных дел",
    "Министерства труда, социального обеспечения",
    "Министерства обороны",
    "Министерства здравоохранения",
    "Министерства водных ресурсов",
    "Министерства энергетики",
    "Министерства транспорта",
    "Министерства финансов",
    "Министерства экономики и коммерции",
    "Министерства природных ресурсов",
    "Министерства чрезвычайных ситуаций",
]
# Text search: every act whose text approves a management scheme.
TEXT_QUERIES = ["схему управления"]

BODY_RE = re.compile(r"Министерств|агентств|служб|комитет|департамент|инспекц|фонд|центр|комисси|управлени",
                     re.I)
CABINET_RE = re.compile(r"Кабинет|Правительств|Президент", re.I)


def call(path, body=None):
    data = json.dumps(body).encode() if body is not None else None
    headers = {**UA, "Content-Type": "application/json"} if data else UA
    err = None
    for n in range(3):
        try:
            req = urllib.request.Request(API + path, data=data, headers=headers)
            with urllib.request.urlopen(req, timeout=60) as res:
                return json.loads(res.read())
        except urllib.error.HTTPError as e:
            err = f"HTTP {e.code}: {e.read()[:300].decode('utf-8', 'replace')}"
            if e.code < 500 and e.code != 429:
                break
        except Exception as e:
            err = repr(e)
        time.sleep(5 * (n + 1))
    raise RuntimeError(err)


def search_all(words, field):
    rows = []
    for page in range(1, MAX_PAGES + 1):
        answer = call(f"/GetDocuments?pageNumber={page}&pageSize={PAGE}",
                      {field: words, "includeInvalid": False})
        data = answer.get("data") or [] if isinstance(answer, dict) else []
        rows += data
        total = answer.get("filteredResultsCount") or 0 if isinstance(answer, dict) else 0
        if len(data) < PAGE or len(rows) >= total:
            break
        time.sleep(1)
    return rows


def to_text(h):
    h = re.sub(r"(?is)<(script|style)\b.*?</\1>", " ", h)
    h = re.sub(r"(?i)<br\s*/?>", "\n", h)
    h = re.sub(r"(?i)</?(p|div|tr|li|h\d|table)\b[^>]*>", "\n", h)
    h = re.sub(r"(?i)</?t[dh]\b[^>]*>", " | ", h)
    h = re.sub(r"<[^>]+>", " ", h)
    h = html.unescape(h).replace("\xa0", " ")
    lines = [" ".join(x.split()).strip(" |") for x in h.split("\n")]
    out = []
    for x in lines:
        if x or (out and out[-1]):
            out.append(x)
    return "\n".join(out).strip()


SCHEME_RE = re.compile(r"(?i)с\s*х\s*е\s*м\s*а\s+управлени")
ANNEX_RE = re.compile(r"(?m)^\s*Приложение(\s+\d+)?\s*$|^\s*ПРИЛОЖЕНИЕ(\s+\d+)?\s*$")


def cut_scheme(text):
    """The annex whose heading says 'Схема управления' (the last such heading wins)."""
    starts = [m.start() for m in ANNEX_RE.finditer(text)]
    blocks = [text[a:b] for a, b in zip(starts, starts[1:] + [len(text)])]
    hits = [b for b in blocks if SCHEME_RE.search(b[:600])]
    if hits:
        return hits[-1].strip()
    # No "Приложение" lines: take from the last scheme heading that starts a line.
    ms = [m for m in re.finditer(r"(?im)^\s*СХЕМА\s+УПРАВЛЕНИЯ.*$", text)]
    return text[ms[-1].start():].strip() if ms else ""


def main():
    out = sys.argv[1]
    os.makedirs(os.path.join(out, "schemes"), exist_ok=True)
    os.makedirs(os.path.join(out, "full"), exist_ok=True)
    found, log = {}, []
    for words in TITLE_QUERIES:
        try:
            rows = search_all(words, "nameRus")
            log.append(f"title {words!r}: {len(rows)}")
        except Exception as e:
            rows = []
            log.append(f"title {words!r}: ERROR {e}")
        for r in rows:
            found.setdefault(str(r.get("documentCode")), r)
        time.sleep(1)
    for words in TEXT_QUERIES:
        try:
            rows = search_all(words, "searchByTextRu")
            log.append(f"text {words!r}: {len(rows)}")
        except Exception as e:
            rows = []
            log.append(f"text {words!r}: ERROR {e}")
        for r in rows:
            found.setdefault(str(r.get("documentCode")), r)
        time.sleep(1)

    index = []
    for code, r in found.items():
        title = " ".join(str(r.get("nameRu") or "").split())
        organ = str(r.get("organ") or "")
        if not BODY_RE.search(title) or not CABINET_RE.search(organ):
            continue
        if str(r.get("status") or "").startswith("Утратил"):
            continue
        row = {"code": code, "title": title, "date": str(r.get("dateAdopted") or "")[:10],
               "organ": organ, "type": r.get("vid") or "", "edition": r.get("lastEdition")}
        try:
            ed = call(f"/GetEdition?editionId={row['edition']}&lang=ru")
            content = ed.get("contentRu") or ed.get("content") or "" if isinstance(ed, dict) else ""
            row["editionDate"] = (ed.get("nameRus") or "") if isinstance(ed, dict) else ""
            text = to_text(content)
            scheme = cut_scheme(text)
            safe = re.sub(r"[^\w.-]", "_", code)
            open(os.path.join(out, "full", safe + ".txt"), "w", encoding="utf-8").write(text)
            if scheme:
                open(os.path.join(out, "schemes", safe + ".txt"), "w", encoding="utf-8").write(scheme)
            row.update(chars=len(text), scheme=bool(scheme), schemeChars=len(scheme),
                       images=len(re.findall(r"(?i)<img\b", content)), file=safe)
        except Exception as e:
            row.update(error=str(e)[:300])
        index.append(row)
        time.sleep(1)

    index.sort(key=lambda x: (not x.get("scheme"), x["title"]))
    json.dump(index, open(os.path.join(out, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    status = {"checked": time.strftime("%Y-%m-%d", time.gmtime()),
              "latest": {x["code"]: x.get("editionDate") or x["date"] for x in index},
              "titles": {x["code"]: x["title"] for x in index}}
    json.dump(status, open(os.path.join(out, "status.json"), "w", encoding="utf-8"), ensure_ascii=False)
    md = ["# 省庁の組織図（схема управления）", "",
          f"取得: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}（cbd.minjust.gov.kg）", ""] + \
         [f"- {x}" for x in log] + ["", f"対象 {len(index)} 件、組織図あり {sum(1 for x in index if x.get('scheme'))} 件", ""] + \
         [f"- {'◯' if x.get('scheme') else '×'} {x['date']} {x['title']} (code {x['code']}, 版 {x.get('editionDate', '')}, 図 {x.get('images', 0)})"
          for x in index]
    open(os.path.join(out, "summary.md"), "w", encoding="utf-8").write("\n".join(md) + "\n")
    print("\n".join(md[:40]))


if __name__ == "__main__":
    main()
