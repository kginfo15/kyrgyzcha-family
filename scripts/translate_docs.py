"""Turn the fetched strategy documents into Japanese Markdown for reading.

Run by .github/workflows/fetch-strategy-docs.yml inside the downloaded docs
folder. For each document named in TRANSLATE it extracts the text (PDF,
legal-database JSON or web page), keeps headings, machine-translates the
paragraphs into Japanese and writes ja/<name>.md, plus ja/index.json.

usage: translate_docs.py DOCS_DIR
"""
import html
import collections
import json
import os
import re
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_news as fn  # noqa: E402  (translate_batch)

# document file name -> (Japanese title, source language)
TRANSLATE = {
    "cbd-education-2040": ("教育発展プログラム 2021–2040", "ru"),
    "cbd-digital-2028": ("デジタル・トランスフォーメーション構想 2024–2028", "ru"),
    "cbd-tourism-2030": ("持続可能な観光発展プログラム 2030年まで", "ru"),
    "cbd-pasture-2029": ("牧草地発展プログラム 2024–2029", "ru"),
    "cbd-sports-2030": ("体育・スポーツ発展プログラム 2030年まで", "ru"),
    "cbd-religion-2026": ("宗教分野の国家政策構想 2021–2026", "ru"),
    "cbd-energy-efficiency-2027": ("省エネ・エネルギー効率政策プログラム 2023–2027", "ru"),
    "cbd-gender-2030": ("ジェンダー平等達成国家戦略 2030年まで", "ru"),
    "health-2030": ("保健プログラム「健康な人 ― 繁栄する国」2019–2030", "ru"),
    "local-self-gov-2028": ("地方自治発展プログラム 2024–2028", "ru"),
    "roads-2030": ("道路部門発展の基本方針 2023–2030", "ru"),
    "drinking-water-2026": ("飲料水供給・排水システム発展プログラム 2026年まで", "ru"),
    "drr-plan-2030": ("緊急事態リスク低減の行動計画 2025–2030", "ru"),
    "food-security-2023": ("食料安全保障・栄養プログラム 2019–2023", "ru"),
    "water-code-2025": ("水法典 2025", "ru"),
    "ndc-2021-en": ("国が決定する貢献（NDC）2021年更新版", "en"),
    "ndp-2030-stat": ("国家開発プログラム 2030年まで（大統領令 2025年 No.178）", "ru"),
    "nds-2040-en-unesco": ("国家開発戦略 2018–2040", "en"),
    "nds-2040-en-adam": ("国家開発戦略 2018–2040", "en"),
    "nds-2040-ru": ("国家開発プログラム 2026年まで（前身のプログラム）", "ru"),
}
HEADING = re.compile(r"^(?:[IVX]+\.\s+\S|\d{1,2}(?:\.\d{1,2}){0,2}\.?\s+[А-ЯЁA-Z]|Глава\s+\d|Раздел\s+\d|Задача\s+\d|"
                     r"Компонент\s+\d|Подпрограмма|Приложение|Chapter\s+\d|CHAPTER|[А-ЯЁ\s,\-–]{8,}$)")
MAX_CHARS = 260000
TIME_BUDGET = int(os.environ.get("TRANSLATE_BUDGET", 50 * 60))
START = time.time()
STATS = collections.Counter()
PREV = "https://raw.githubusercontent.com/yuuuta21/kyrgyzcha-family/strategy-docs/"


def gtx(texts, sl):
    """Google's free translation endpoint, with the text in a POST body (a long GET URL is refused with 400)."""
    body = urllib.parse.urlencode({"q": "\n".join(t.replace("\n", " ") for t in texts)}).encode()
    url = "https://translate.googleapis.com/translate_a/single?" + urllib.parse.urlencode(
        {"client": "gtx", "sl": sl, "tl": "ja", "dt": "t"})
    req = urllib.request.Request(url, data=body, headers={**fn.UA, "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"})
    with urllib.request.urlopen(req, timeout=40) as res:
        data = json.loads(res.read())
    parts = [p.strip() for p in "".join(seg[0] for seg in data[0] if seg and seg[0]).split("\n")]
    if len(texts) == 1:
        return [" ".join(x for x in parts if x)]
    if len(parts) != len(texts):
        raise ValueError("paragraph count changed")
    return parts


def text_of(path):
    if path.endswith(".pdf"):
        return subprocess.run(["pdftotext", "-q", path, "-"], capture_output=True, text=True).stdout
    raw = open(path, encoding="utf-8", errors="replace").read()
    if path.endswith(".dat") or raw.lstrip().startswith("{"):
        try:
            d = json.loads(raw)
            raw = d.get("contentRu") or d.get("content") or json.dumps(d, ensure_ascii=False)
        except ValueError:
            pass
    raw = re.sub(r"(?is)<(script|style|nav|header|footer).*?</\1>", " ", raw)
    # Word's filtered HTML (the legal database) leaves <p> unclosed, so opening tags break lines too
    raw = re.sub(r"(?i)<br\s*/?>|</?(p|div|li|tr|h\d|table)\b[^>]*>", "\n", raw)
    txt = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    # legal-database mirrors carry site navigation before the act itself
    m = re.search(r"(ПОСТАНОВЛЕНИЕ|УКАЗ|ПРОГРАММА|КОНЦЕПЦИЯ|СТРАТЕГИЯ)\s", txt)
    return txt[m.start():] if m and m.start() < len(txt) // 2 else txt


def paragraphs(text):
    """Join wrapped lines into paragraphs; headings and list items stand alone."""
    out, cur = [], []
    for ln in text.splitlines():
        s = re.sub(r"\s+", " ", ln).strip()
        if not s or re.fullmatch(r"\d{1,3}", s):  # blank line or page number
            if cur:
                out.append(" ".join(cur)); cur = []
            continue
        if re.search(r"\.{6,}\s*\d*$", s):  # table of contents line
            continue
        if HEADING.match(s) and len(s) < 160:
            if cur:
                out.append(" ".join(cur)); cur = []
            out.append(s)
            continue
        if re.match(r"^(\d+\)|[-–•])\s", s):  # a list item starts its own paragraph and takes its wrapped lines
            if cur:
                out.append(" ".join(cur))
            cur = [s]
            continue
        cur.append(s)
        if s.endswith((".", ";", ":")) and len(" ".join(cur)) > 300:
            out.append(" ".join(cur)); cur = []
    if cur:
        out.append(" ".join(cur))
    res = []
    for p in out:  # an overlong paragraph is split at sentence ends so nothing is cut off
        while len(p) > 2000:
            cut = max(p.rfind(". ", 0, 2000), p.rfind("; ", 0, 2000))
            cut = cut + 1 if cut > 500 else 2000
            res.append(p[:cut].strip()); p = p[cut:].strip()
        res.append(p)
    return [p for p in res if len(p) > 1]


def untranslated(line):
    """True for a line of a Japanese .md that is still mostly Cyrillic (a paragraph the translator refused)."""
    letters = [c for c in line if c.isalpha()]
    return len(letters) >= 20 and sum("\u0400" <= c <= "\u04ff" for c in letters) > len(letters) / 2


class Stop(Exception):
    """The time budget is used up, or the service keeps refusing: stop and publish what is done."""


BLOCKED = {"run": 0}  # refusals (429) in a row, across documents


def translate(paras, sl, stats=None):
    """Returns the translations in order. A paragraph that could not be translated
    is returned unchanged and counted in stats["failed"]."""
    res, batch, size = [], [], 0
    if stats is not None:
        stats["failed"] = 0

    def one(chunk):
        """Translate a chunk; on refusal or a changed paragraph count split it at once,
        wait only when the service asks us to slow down, and keep the original when nothing works."""
        for attempt in range(3):
            # checked before every request: a run of refusals with waits could otherwise outlast the step's time limit
            if time.time() - START > TIME_BUDGET:
                raise Stop("out of time")
            try:
                out = gtx(chunk, sl)
                BLOCKED["run"] = 0
                return out
            except ValueError:
                STATS["split"] += 1
                break
            except urllib.error.HTTPError as e:
                STATS[f"http{e.code}"] += 1
                print(f"  translate: HTTP {e.code} ({len(chunk)} paragraphs)", file=sys.stderr)
                if e.code == 429:
                    BLOCKED["run"] += 1
                    if BLOCKED["run"] >= 8:
                        raise Stop("the service keeps refusing (429)")
                if e.code == 429 or e.code >= 500:
                    time.sleep(10 * (attempt + 1))
                    continue
                break
            except Exception as e:
                STATS["error"] += 1
                print(f"  translate: {e!r}", file=sys.stderr)
                time.sleep(3 * (attempt + 1))
        if len(chunk) > 1:
            mid = len(chunk) // 2
            return one(chunk[:mid]) + one(chunk[mid:])
        STATS["kept"] += 1
        if stats is not None:
            stats["failed"] += 1
        return chunk

    def flush():
        nonlocal batch, size
        if batch:
            res.extend(one(batch))
            time.sleep(0.3)
        batch, size = [], 0

    try:
        for p in paras:
            if time.time() - START > TIME_BUDGET:
                break
            if size + len(p) > 2500:
                flush()
            batch.append(p[:2500]); size += len(p)
        flush()
    except Stop as e:  # keep what is translated; the rest waits for the next run
        print(f"  translate: stopped, {e}", file=sys.stderr)
        if stats is not None:
            stats["stopped"] = str(e)
    return res


def main():
    d = sys.argv[1]
    os.makedirs(os.path.join(d, "ja"), exist_ok=True)
    index = {}
    src = {}
    for line in open(os.path.join(d, "index.tsv"), encoding="utf-8"):
        parts = line.rstrip("\n").split("\t")
        if len(parts) >= 2:
            src[parts[0]] = parts[1]
    os.makedirs(os.path.join(d, "txt"), exist_ok=True)
    try:  # translations from earlier runs: keep them, translate only what is new
        prev = json.loads(urllib.request.urlopen(PREV + "ja/index.json", timeout=30).read())
    except Exception:
        prev = {}
    for name, (title, sl) in TRANSLATE.items():
        files = [f for f in os.listdir(d) if f.startswith(name + ".")]
        if not files:
            continue
        text = text_of(os.path.join(d, files[0]))[:MAX_CHARS]
        paras = paragraphs(text)
        open(os.path.join(d, "txt", name + ".txt"), "w", encoding="utf-8").write("\n\n".join(paras))
        chars = sum(len(p) for p in paras)
        if chars < 1500:
            print(f"{name}: too little text, skipped", file=sys.stderr)
            continue
        old = prev.get(name)
        if old and old.get("chars") == chars and old.get("complete"):
            try:
                md = urllib.request.urlopen(PREV + "ja/" + urllib.parse.quote(name) + ".md", timeout=60).read()
                left = sum(untranslated(ln) for ln in md.decode("utf-8", "replace").splitlines()[4:])
                if left:
                    raise ValueError(f"{left} paragraphs still in the original language")
                open(os.path.join(d, "ja", name + ".md"), "wb").write(md)
                index[name] = old
                print(f"{name}: kept earlier translation", file=sys.stderr)
                continue
            except Exception as e:
                print(f"{name}: translating again ({e})", file=sys.stderr)
        def keep_old():  # keep what earlier runs translated (even a partial one) instead of publishing nothing
            if not old:
                return
            try:
                md = urllib.request.urlopen(PREV + "ja/" + urllib.parse.quote(name) + ".md", timeout=60).read()
                open(os.path.join(d, "ja", name + ".md"), "wb").write(md)
                index[name] = {**old, "complete": False} if old.get("chars") != chars else old
            except Exception as e:
                print(f"{name}: earlier translation not kept ({e})", file=sys.stderr)
        if time.time() - START > TIME_BUDGET or BLOCKED["run"] >= 8:
            print(f"{name}: out of time (or refused), next run", file=sys.stderr)
            keep_old()
            continue
        t0 = time.time()
        st = {}
        ja = translate(paras, sl, st)
        if st.get("stopped") and not ja and old:
            keep_old()
            continue
        md = [f"# {title}", "", f"原文: {src.get(name, '')}", "",
              "> この文書は原文を機械翻訳したものです。正確な内容は原文で確認してください。", ""]
        for o, j in zip(paras, ja):
            md.append(("## " + j) if HEADING.match(o) and len(o) < 160 else j)
            md.append("")
        if len(ja) < len(paras):
            md.append(f"> ここまで（全{len(paras)}段落のうち{len(ja)}段落）。続きは次回の更新で訳します。")
        open(os.path.join(d, "ja", name + ".md"), "w", encoding="utf-8").write("\n".join(md))
        index[name] = {"title": title, "source": src.get(name, ""), "paragraphs": len(paras),
                       "chars": chars, "untranslated": st["failed"],
                       # a refused paragraph stays in the original language; leave the document
                       # incomplete so the next run translates it again
                       "complete": len(ja) >= len(paras) and not st["failed"]}
        print(f"{name}: {len(paras)} paragraphs in {int(time.time() - t0)}s, {st['failed']} not translated {dict(STATS)}", file=sys.stderr)
        STATS.clear()
    json.dump(index, open(os.path.join(d, "ja", "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
