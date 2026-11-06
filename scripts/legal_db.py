"""Ask Kyrgyzstan's legal database (cbd.minjust.gov.kg) which acts exist and how they link.

Run by .github/workflows/legal-db.yml (the database cannot be reached from
everywhere, but it answers GitHub's runners). Reads scripts/legal_db_queries.txt:

  search <TAB> label <TAB> words      acts whose Russian title contains the words
  text   <TAB> label <TAB> words      acts whose Russian text contains the words
  refs   <TAB> label <TAB> code       acts linked to the act with this document code
  doc    <TAB> label <TAB> code       the act's card (title, date, number, status, editions)
  chain  <TAB> label <TAB> words      a title search, then the linked acts of each of its first 5 hits

and writes, for each line, <out>/<kind>-<label>.json with the database's own
answer, plus <out>/summary.md (one readable list for people) and
<out>/index.json.

usage: legal_db.py OUT_DIR
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

API = "https://cbd.minjust.gov.kg/api/v1"
UA = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36",
      "Accept": "application/json", "Origin": "https://cbd.minjust.gov.kg", "Referer": "https://cbd.minjust.gov.kg/"}
PAGE = 50
QUERIES = os.path.join(os.path.dirname(os.path.abspath(__file__)), "legal_db_queries.txt")


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


def pick(x, *keys):
    for k in keys:
        if isinstance(x, dict) and x.get(k) not in (None, ""):
            return x[k]
    return ""


def row(x):
    """The fields people need from one act, whatever the database calls them."""
    return {
        "code": pick(x, "documentCode", "code", "id", "refId"),
        "title": pick(x, "nameRu", "nameRus", "name", "title", "nameKg"),
        "type": pick(x, "refTypeName", "typeName", "type", "refType"),
        "number": pick(x, "number", "docNumber", "aktNumber"),
        "date": str(pick(x, "dateAdopted", "adoptedDate", "date", "dateAdoption"))[:10],
        "status": pick(x, "refStatusName", "statusName", "status", "refStatus"),
        "organ": pick(x, "authoritiesName", "organName", "authorities"),
    }


def items_of(answer):
    if isinstance(answer, list):
        return answer
    for k in ("data", "items", "documents", "documentReferences", "references", "result"):
        v = answer.get(k) if isinstance(answer, dict) else None
        if isinstance(v, list):
            return v
        if isinstance(v, dict):
            inner = items_of(v)
            if inner:
                return inner
    return []


def search(words, field):
    body = {field: words, "includeInvalid": False}
    answer = call(f"/GetDocuments?pageNumber=1&pageSize={PAGE}", body)
    return answer, items_of(answer)


def main():
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    index, md = [], ["# 法令データベースの照会結果", "",
                     f"取得: {time.strftime('%Y-%m-%d %H:%M UTC', time.gmtime())}（cbd.minjust.gov.kg）", ""]
    for line in open(QUERIES, encoding="utf-8"):
        if not line.strip() or line.startswith("#"):
            continue
        kind, label, value = (line.rstrip("\n").split("\t") + ["", ""])[:3]
        name = f"{kind}-{label}"
        entry = {"kind": kind, "label": label, "value": value, "file": name + ".json"}
        try:
            if kind == "search":
                answer, items = search(value, "nameRus")
            elif kind == "text":
                answer, items = search(value, "searchByTextRu")
            elif kind == "refs":
                answer = call("/References?id=" + urllib.parse.quote(value))
                items = items_of(answer)
            elif kind == "doc":
                answer = call("/GetDocument?DocumentCode=" + urllib.parse.quote(value))
                items = [answer] if isinstance(answer, dict) else items_of(answer)
            elif kind == "chain":
                answer, items = search(value, "nameRus")
                answer = {"search": answer, "refs": {}}
                for x in items[:5]:
                    code = str(row(x)["code"])
                    if code:
                        try:
                            answer["refs"][code] = call("/References?id=" + urllib.parse.quote(code))
                        except Exception as e:
                            answer["refs"][code] = {"error": str(e)}
                        time.sleep(1)
            else:
                raise ValueError(f"unknown kind {kind!r}")
            json.dump(answer, open(os.path.join(out, name + ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
            rows = [row(x) for x in items]
            entry.update(ok=True, count=len(rows),
                         total=pick(answer.get("search", answer), "totalResultsCount", "filteredResultsCount") if isinstance(answer, dict) else "",
                         rows=rows)
            md += [f"## {kind} {label}: {value}", "",
                   f"{len(rows)} 件" + (f"（全 {entry['total']} 件）" if entry["total"] != "" else ""), ""]
            md += [f"- {r['date']} {r['type']} {r['number']} — {r['title']} [{r['status']}] (code {r['code']})" for r in rows]
            for code, ref in (answer.get("refs", {}) if kind == "chain" else {}).items():
                linked = [row(x) for x in items_of(ref)] if isinstance(ref, (dict, list)) else []
                md += ["", f"### code {code} とつながる文書: {len(linked)} 件"]
                md += [f"- {r['date']} {r['type']} {r['number']} — {r['title']} [{r['status']}] (code {r['code']})" for r in linked]
                if isinstance(ref, dict) and ref.get("error"):
                    md.append(f"失敗: {ref['error']}")
            md.append("")
        except Exception as e:
            entry.update(ok=False, error=str(e))
            md += [f"## {kind} {label}: {value}", "", f"失敗: {e}", ""]
        print(f"{name}: {'ok ' + str(entry.get('count')) if entry.get('ok') else entry.get('error')}", file=sys.stderr)
        index.append(entry)
        time.sleep(1)
    json.dump(index, open(os.path.join(out, "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
    open(os.path.join(out, "summary.md"), "w", encoding="utf-8").write("\n".join(md))
    if not any(e.get("ok") for e in index):
        sys.exit("no query answered")


if __name__ == "__main__":
    main()
