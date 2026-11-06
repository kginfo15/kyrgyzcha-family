"""Turn the fetched strategy documents into Japanese Markdown for reading.

Run by .github/workflows/fetch-strategy-docs.yml inside the downloaded docs
folder. For each document named in TRANSLATE it extracts the text (PDF,
legal-database JSON or web page), keeps headings, machine-translates the
paragraphs into Japanese and writes ja/<name>.md, plus ja/index.json.

usage: translate_docs.py DOCS_DIR
"""
import html
import json
import os
import re
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import fetch_news as fn  # noqa: E402  (translate_batch)

# document file name -> (Japanese title, source language)
TRANSLATE = {
    "ndp-2030-stat": ("国家開発プログラム 2030年まで（大統領令 2025年 No.178）", "ru"),
    "nds-2040-ru": ("国家開発プログラム 2026年まで（前身のプログラム）", "ru"),
    "nds-2040-en-unesco": ("国家開発戦略 2018–2040", "en"),
    "nds-2040-en-adam": ("国家開発戦略 2018–2040", "en"),
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
}
HEADING = re.compile(r"^(?:[IVX]+\.\s+\S|\d{1,2}(?:\.\d{1,2}){0,2}\.?\s+[А-ЯЁA-Z]|Глава\s+\d|Раздел\s+\d|Задача\s+\d|"
                     r"Компонент\s+\d|Подпрограмма|Приложение|Chapter\s+\d|CHAPTER|[А-ЯЁ\s,\-–]{8,}$)")
MAX_CHARS = 260000


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
    raw = re.sub(r"(?i)<br\s*/?>|</(p|div|li|tr|h\d|table)>", "\n", raw)
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
    return [p for p in out if len(p) > 1]


def translate(paras, sl):
    res, batch, size = [], [], 0

    def flush():
        nonlocal batch, size
        if not batch:
            return
        for attempt in range(3):
            try:
                res.extend(fn.translate_batch(batch, sl=sl, tl="ja"))
                break
            except Exception as e:  # rate limit or network: wait and retry, then keep the original
                print(f"  translate retry {attempt}: {e}", file=sys.stderr)
                time.sleep(5 * (attempt + 1))
        else:
            res.extend(batch)
        batch, size = [], 0
        time.sleep(0.6)

    for p in paras:
        if size + len(p) > 3800:
            flush()
        batch.append(p[:3800]); size += len(p)
    flush()
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
    for name, (title, sl) in TRANSLATE.items():
        files = [f for f in os.listdir(d) if f.startswith(name + ".")]
        if not files:
            continue
        text = text_of(os.path.join(d, files[0]))[:MAX_CHARS]
        paras = paragraphs(text)
        if sum(len(p) for p in paras) < 1500:
            print(f"{name}: too little text, skipped", file=sys.stderr)
            continue
        t0 = time.time()
        ja = translate(paras, sl)
        md = [f"# {title}", "", f"原文: {src.get(name, '')}", "",
              "> この文書は原文を機械翻訳したものです。正確な内容は原文で確認してください。", ""]
        for o, j in zip(paras, ja):
            md.append(("## " + j) if HEADING.match(o) and len(o) < 160 else j)
            md.append("")
        open(os.path.join(d, "ja", name + ".md"), "w", encoding="utf-8").write("\n".join(md))
        index[name] = {"title": title, "source": src.get(name, ""), "paragraphs": len(paras),
                       "chars": sum(len(p) for p in paras)}
        print(f"{name}: {len(paras)} paragraphs in {int(time.time() - t0)}s", file=sys.stderr)
    json.dump(index, open(os.path.join(d, "ja", "index.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
