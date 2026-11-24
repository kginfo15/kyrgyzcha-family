"""Build the Kyrgyz app from the (built) Russian app shell + the existing Kyrgyz data.
usage: build_kg.py <russian/index.html> <old kyrgyz index.html> <out.html>"""
import json, re, sys, os, glob
here = os.path.dirname(os.path.abspath(__file__))
ru_path, ky_path, out_path = sys.argv[1:4]
s = open(ru_path, encoding="utf-8").read()
ky = open(ky_path, encoding="utf-8").read()
kv = json.loads(re.search(r'id="data-vocab">(.*?)</script>', ky, re.S).group(1))
kc = json.loads(re.search(r'id="data-compose">(.*?)</script>', ky, re.S).group(1))

# data fix: the month list had 'секунд' (second) where May belongs
for _w in kv:
    if _w["id"] == "A1-437" and _w["word"] == "секунд":
        _sec = dict(_w)
        _w.update(word="май", kana="マイ", roma="may", meaning="5月")
        kv.append(dict(_sec, id="A1-901"))
        break
# A2 coverage additions: add/*.txt  ("## LEVEL category" headers, then word|meaning|pos|exKg|exJa|explanation)
sys.path.insert(0, here)
from kana import kana as _kana, roma as _roma
_have = set(w["word"] for w in kv)
_n = {"A1": 901, "A2": 400}
_added = {}
for f in sorted(glob.glob(os.path.join(here, "add", "*.txt"))):
    lv = cat = None
    for ln in open(f, encoding="utf-8"):
        ln = ln.rstrip("\n")
        if not ln.strip(): continue
        if ln.startswith("## "):
            lv, cat = ln[3:].split(" ", 1); continue
        word, meaning, pos, exk, exj, exp = ln.split("|")
        if word in _have: continue
        _have.add(word); _n[lv] += 1
        wid = "%s-%03d" % (lv, _n[lv])
        k = sum(1 for x in _added.values() if x == (lv, cat))
        kv.append({"id": wid, "level": lv, "word": word, "kana": _kana(word), "roma": _roma(word), "meaning": meaning,
                   "category": cat, "pos": pos, "pack": lv + "-add", "packTitle": "A2到達の追加語", "lesson": k // 20 + 1,
                   "simpleExp": exp, "detailExp": exp, "exKg": exk, "exJa": exj, "audio": ""})
        _added[wid] = (lv, cat)
# optional enrichment: enrich/*.json  {id: {simpleExp, detailExp, changeRule, exKg, exJa}}
enrich = {}
for f in sorted(glob.glob(os.path.join(here, "enrich", "*.json"))):
    enrich.update(json.load(open(f, encoding="utf-8")))
cenrich = {}
for f in sorted(glob.glob(os.path.join(here, "cenrich", "*.json"))):
    cenrich.update(json.load(open(f, encoding="utf-8")))

POSJ = {"noun": "名詞", "verb": "動詞", "adjective": "形容詞", "adverb": "副詞", "pronoun": "代名詞", "number": "数詞",
        "numeral": "数詞", "postposition": "後置詞", "particle": "助詞", "conjunction": "接続詞", "phrase": "表現",
        "interjection": "間投詞", "expression": "表現", "ordinal": "序数詞", "proper_noun": "固有名詞", "counter": "助数詞"}
vocab = []
for w in kv:
    e = enrich.get(w["id"], {})
    vocab.append({"id": w["id"], "word": w["word"], "accent": w["word"], "kana": _kana(w["word"]), "roma": w["roma"],
        "meaning": w["meaning"], "lesson": w.get("lesson", 1), "exRu": e.get("exKg", w.get("exKg", "")),
        "exJa": e.get("exJa", w.get("exJa", "")), "detailExp": e.get("detailExp", w.get("detailExp", "")),
        "changeRule": e.get("changeRule", ""), "packTitle": w["packTitle"], "category": w["category"], "pack": w["pack"],
        "reviewStatus": "none", "dataStatus": "active", "pos": w["pos"], "level": w["level"], "pron": "", "audio": "",
        "simpleExp": e.get("simpleExp", w.get("simpleExp", ""))})
compose = []
for c in kc:
    g = (c.get("grammar") or "").strip()
    lines = [x for x in g.split("\n") if x.strip()]
    e = cenrich.get(c["id"], {})
    easy = e.get("gEasy") or (lines[1] if len(lines) > 1 else (lines[0] if lines else ""))
    compose.append({"id": c["id"], "ja": c["ja"], "ru": c["ky"], "accent": c["ky"], "kana": _kana(c["ky"]), "roma": c["roma"],
        "gDetail": g, "gEasy": easy, "pron": "", "unit": c["unit"], "grammarPoint": c["grammarPoint"], "replace": [],
        "level": c.get("level", "A2"), "breakdown": e.get("breakdown", [])})
# grammar groups = one per grammar point
groups, seen = [], {}
for c in compose:
    gp = c["grammarPoint"]
    if gp not in seen:
        seen[gp] = {"id": "gp%02d" % (len(groups) + 1), "title": gp, "count": 0, "composeIds": []}
        groups.append(seen[gp])
    seen[gp]["composeIds"].append(c["id"]); seen[gp]["count"] += 1

# words about the Russian language must survive the global "ロシア語"→"キルギス語" rename below
def J(x): return json.dumps(x, ensure_ascii=False, separators=(",", ":")).replace("ロシア語", "@@RU@@")

def sub_re(pat, repl, flags=re.S, count=1):
    global s
    new, n = re.subn(pat, lambda m: repl, s, count=count, flags=flags)
    assert n == count, ("pattern not found", pat[:60], n)
    s = new

def rep(old, new, count=1):
    global s
    c = s.count(old)
    assert c == count, (old[:70], c)
    s = s.replace(old, new)

# 1) data
sub_re(r'(<script type="application/json" id="data-vocab">).*?(</script>)', None) if False else None
s = re.sub(r'(<script type="application/json" id="data-vocab">).*?(</script>)', lambda m: m.group(1) + J(vocab) + m.group(2), s, count=1, flags=re.S)
s = re.sub(r'(<script type="application/json" id="data-compose">).*?(</script>)', lambda m: m.group(1) + J(compose) + m.group(2), s, count=1, flags=re.S)
s = re.sub(r'(<script type="application/json" id="data-groups">).*?(</script>)', lambda m: m.group(1) + J(groups) + m.group(2), s, count=1, flags=re.S)
# 2) Russian-only dictionaries -> empty
for name, empty in [("PRON_TABLE", '[""]'), ("VD", "[]"), ("VT", '{"d":[],"c":[]}'), ("CT", "{}"), ("CBD", "[]"), ("VSE", "[]"),
                    ("P46_COMPOSE", "[]"), ("P46_VOCAB", "[]"), ("P54_EX", "{}"), ("P54_GE", "{}")]:
    sub_re(r"^var %s=.*$" % name, "var %s=%s;" % (name, empty), flags=re.M)
# 4) TTS: Kyrgyz voice if the device has one, otherwise Russian voice with letter approximations
rep('if(!RU_VOICE&&lang.indexOf("ru")===0)RU_VOICE=vs[i];',
    'if(lang.indexOf("ky")===0)KY_VOICE=vs[i];\n      if(!RU_VOICE&&lang.indexOf("ru")===0)RU_VOICE=vs[i];')
rep("RU_VOICE=null;JA_VOICE=null;", "RU_VOICE=null;JA_VOICE=null;KY_VOICE=null;")
rep("var RU_VOICE=null,JA_VOICE=null;", "var RU_VOICE=null,JA_VOICE=null,KY_VOICE=null;\n"
    "/* キルギス語の音声が端末に無い場合は、ロシア語音声で近い音に置き換えて読む（ө→о, ү→у, ң→нг） */\n"
    "function kyForTTS(t){t=String(t||\"\");if(KY_VOICE)return t;return t.replace(/ө/g,\"о\").replace(/Ө/g,\"О\").replace(/ү/g,\"у\").replace(/Ү/g,\"У\").replace(/ң/g,\"нг\").replace(/Ң/g,\"Нг\");}\n"
    "function kyLang(){return KY_VOICE?(KY_VOICE.lang||\"ky-KG\"):\"ru-RU\";}")
rep('var clean=String(text||"").replace(/\\u0301/g,"");\n    var u=new SpeechSynthesisUtterance(clean);\n    u.lang="ru-RU"; u.rate=rate||0.9; if(RU_VOICE)u.voice=RU_VOICE;',
    'var clean=kyForTTS(String(text||"").replace(/\\u0301/g,""));\n    var u=new SpeechSynthesisUtterance(clean);\n    u.lang=kyLang(); u.rate=rate||0.9; if(KY_VOICE)u.voice=KY_VOICE; else if(RU_VOICE)u.voice=RU_VOICE;')
rep('var clean=String(text||"").replace(/\\u0301/g,"").trim();',
    'var clean=String(text||"").replace(/\\u0301/g,"").trim();\n    if(String(lang||"").indexOf("ru")===0){clean=kyForTTS(clean);if(KY_VOICE){lang=kyLang();voice=KY_VOICE;}}')
# 5) AI prompt
rep("あなたは日本人向けロシア語会話の先生です。", "あなたは日本人向けキルギス語会話の先生です。")
rep("(1)必ず短いロシア語（アクセント記号付き）", "(1)必ず短いキルギス語")
# 6) names, storage keys, labels
s = s.replace("russianApp_v1_", "kyrgyzApp_v4_").replace("russianApp_legacyBackup", "kyrgyzApp_v4_legacyBackup")
rep('<meta name="apple-mobile-web-app-title" content="Русский">', '<meta name="apple-mobile-web-app-title" content="Кыргызча">')
rep("<title>Русский — A1・A2</title>", "<title>Кыргызча — A1・A2</title>")
rep('<div><h1>Русский</h1><p id="hsub">ロシア語 · A1 / A2</p></div>', '<div><h1>Кыргызча</h1><p id="hsub">キルギス語 · A1 / A2</p></div>')
s = s.replace("日→露", "日→キ").replace("露→日", "キ→日").replace("ロシア語", "キルギス語")
s = s.replace("A2（ТБУ・基礎レベル）までに必要な文法の早見表です。", "A2（基礎レベル）までに必要なキルギス語文法の早見表です。")
s = s.replace("目安：A2 は ТБУ（基礎レベル・ТРКИ-1の一つ手前）相当。", "目安：A2 は日常の身近な場面で短いやり取りができるレベル。")
# Kyrgyz has no stress marks to show; hide the "アクセント記号なし" style QA by making the QA generic
sub_re(r'(?ms)^function p33RunQA\(\)\{.*?^\}\n(?=function p33QASummary)',
"""function p33RunQA(){
  var out=[];
  function push(tag,sev,w,detail){out.push({tag:tag,sev:sev,id:w.id,word:w.word,detail:detail});}
  var byWord={};
  VOCAB.forEach(function(w){(byWord[w.word]=byWord[w.word]||[]).push(w);});
  Object.keys(byWord).forEach(function(k){var g=byWord[k];if(g.length>1)push("同一wordの重複","info",g[0],g.length+"件: "+g.map(function(x){return x.id;}).join(", "));});
  VOCAB.forEach(function(w){
    var nw=w.word.split(/[\\s-]+/).length;
    if(/[a-z]/i.test(w.word))push("見出し語にラテン文字","error",w,w.word);
    if(!w.simpleExp)push("解説が未作成","info",w,"");
    if(!w.exRu)push("例文が未作成","info",w,"");
  });
  return out;
}
""")
# 3) content blocks
content = open(os.path.join(here, "content.js"), encoding="utf-8").read()
for blk in content.split("//@@")[1:]:
    name, body = blk.split("\n", 1)
    name = name.strip()
    sub_re(r'(?ms)^var %s=\[.*?^\];' % name, body.strip())
s = s.replace("露 → 日", "キ → 日").replace("日 → 露", "日 → キ").replace("露 速度", "キ 速度")
rep('var P47_LANG="ru";', 'var P47_LANG="ky";')
# 7) colours: red x gold on black
s = s.replace("--accent:#0A84FF; --accentDeep:#0066CC; --accentSoft:rgba(10,132,255,.14);",
              "--accent:#E5332A; --accentDeep:#B3261E; --accentSoft:rgba(229,51,42,.16);")
s = s.replace("--blue:#0A84FF; --blueDeep:#0066CC; --sub:#64D2FF;", "--blue:#E5332A; --blueDeep:#B3261E; --sub:#F2B705;")
s = s.replace("--star:#0A84FF;", "--star:#F2B705;").replace("--navy:#0A84FF; --teal:#64D2FF; --gold:#FFD60A;", "--navy:#E5332A; --teal:#F2B705; --gold:#F2B705;")
s = s.replace("--card:#1C1C1E; --card2:#2C2C2E;", "--card:#1E1A18; --card2:#2D2724;").replace("--line:#2C2C2E; --lineStrong:#3A3A3C;", "--line:#2D2724; --lineStrong:#3D3531;")
s = s.replace("#0B63F6", "#E5332A").replace("#38BDF8", "#F2B705").replace("#2563EB", "#E5332A").replace("rgba(37,99,235", "rgba(229,51,42").replace("#0A84FF", "#E5332A").replace("#0066CC", "#B3261E")
s = s.replace("rgba(10,132,255", "rgba(229,51,42").replace("#1971C2", "#C77C02").replace("%230B7CFF", "%23F2B705").replace("%2305070D", "%23C8102E")
s = s.replace("PHASE31: 純黒ベース＋iOSブルーの配色に刷新", "KG: 黒ベース＋国旗の赤と金の配色")
# header flag: Kyrgyz flag (red, 40-ray sun, tunduk)
s, _n = re.subn(r'<svg class="p49-flagsvg".*?</svg>', lambda m: '<svg class="p49-flagsvg" width="32" height="22" viewBox="0 0 30 20" aria-label="キルギス国旗"><clipPath id="p49fc"><rect width="30" height="20" rx="3"/></clipPath><g clip-path="url(#p49fc)"><rect width="30" height="20" fill="#E8112D"/><g fill="#FFEF00"><path d="M15 10 L22.19 9.72 L22.19 10.28 z"/><path d="M15 10 L22.15 10.85 L22.06 11.40 z"/><path d="M15 10 L21.93 11.96 L21.76 12.49 z"/><path d="M15 10 L21.54 13.02 L21.29 13.51 z"/><path d="M15 10 L20.98 14.01 L20.66 14.45 z"/><path d="M15 10 L20.28 14.89 L19.89 15.28 z"/><path d="M15 10 L19.45 15.66 L19.01 15.98 z"/><path d="M15 10 L18.51 16.29 L18.02 16.54 z"/><path d="M15 10 L17.49 16.76 L16.96 16.93 z"/><path d="M15 10 L16.40 17.06 L15.85 17.15 z"/><path d="M15 10 L15.28 17.19 L14.72 17.19 z"/><path d="M15 10 L14.15 17.15 L13.60 17.06 z"/><path d="M15 10 L13.04 16.93 L12.51 16.76 z"/><path d="M15 10 L11.98 16.54 L11.49 16.29 z"/><path d="M15 10 L10.99 15.98 L10.55 15.66 z"/><path d="M15 10 L10.11 15.28 L9.72 14.89 z"/><path d="M15 10 L9.34 14.45 L9.02 14.01 z"/><path d="M15 10 L8.71 13.51 L8.46 13.02 z"/><path d="M15 10 L8.24 12.49 L8.07 11.96 z"/><path d="M15 10 L7.94 11.40 L7.85 10.85 z"/><path d="M15 10 L7.81 10.28 L7.81 9.72 z"/><path d="M15 10 L7.85 9.15 L7.94 8.60 z"/><path d="M15 10 L8.07 8.04 L8.24 7.51 z"/><path d="M15 10 L8.46 6.98 L8.71 6.49 z"/><path d="M15 10 L9.02 5.99 L9.34 5.55 z"/><path d="M15 10 L9.72 5.11 L10.11 4.72 z"/><path d="M15 10 L10.55 4.34 L10.99 4.02 z"/><path d="M15 10 L11.49 3.71 L11.98 3.46 z"/><path d="M15 10 L12.51 3.24 L13.04 3.07 z"/><path d="M15 10 L13.60 2.94 L14.15 2.85 z"/><path d="M15 10 L14.72 2.81 L15.28 2.81 z"/><path d="M15 10 L15.85 2.85 L16.40 2.94 z"/><path d="M15 10 L16.96 3.07 L17.49 3.24 z"/><path d="M15 10 L18.02 3.46 L18.51 3.71 z"/><path d="M15 10 L19.01 4.02 L19.45 4.34 z"/><path d="M15 10 L19.89 4.72 L20.28 5.11 z"/><path d="M15 10 L20.66 5.55 L20.98 5.99 z"/><path d="M15 10 L21.29 6.49 L21.54 6.98 z"/><path d="M15 10 L21.76 7.51 L21.93 8.04 z"/><path d="M15 10 L22.06 8.60 L22.15 9.15 z"/></g><circle cx="15" cy="10" r="4.3" fill="#FFEF00"/><g fill="none" stroke="#E8112D" stroke-width=".7"><circle cx="15" cy="10" r="3"/><path d="M12.2 9.1h5.6M12.2 10.9h5.6M14.1 7.2c-.6 1.8-.6 4 0 5.6M15.9 7.2c.6 1.8.6 4 0 5.6"/></g></g><rect x=".5" y=".5" width="29" height="19" rx="2.6" fill="none" stroke="rgba(255,255,255,.25)"/></svg>', s, count=1, flags=re.S)
assert _n == 1, "kg flag"
# 8) header comment
sub_re(r'<!--\n  Русский — .*?-->',
"""<!--
  Кыргызча — 日本人初学者向け キルギス語 A1/A2 学習アプリ（v4）
  ============================================================
  - ロシア語版（Русский v1 / PHASE46）の画面・学習機能をそのまま移植し、
    データ（単語%d語・瞬間作文%d文）と文法ノート・会話教材をキルギス語用に差し替え。
  - 配色：黒ベース＋国旗の赤（#E5332A）と金（#F2B705）。
  - 例文・解説・文法ノートはすべて新規作成の draft（ネイティブ確認前）。
  - 読み上げ：端末にキルギス語音声があれば使い、無ければロシア語音声で近似（ө→о, ү→у, ң→нг）。
  - 外部通信は AI会話（既定オフ）のみ。学習データは localStorage に保存。
  ============================================================
-->""" % (len(vocab), len(compose)))
s = s.replace('DATA_VERSION="ru-a1a2-', 'DATA_VERSION="ky-a1a2-')
s = re.sub(r'check\("VOCABが[^"]*",VOCAB.length>=\d+&&VOCAB.length<=\d+,', 'check("VOCABが%d件前後",VOCAB.length>=%d&&VOCAB.length<=%d,' % (len(vocab), len(vocab) - 100, len(vocab) + 300), s)
s = re.sub(r'check\("COMPOSEが\d+件前後",COMPOSE.length>=\d+&&COMPOSE.length<=\d+,', 'check("COMPOSEが%d件前後",COMPOSE.length>=%d&&COMPOSE.length<=%d,' % (len(compose), len(compose) - 50, len(compose) + 200), s)
# Kyrgyz pictures: pics/auto.json (matched to the Russian table by meaning) + pics/k*.txt ("ID emoji", manual, wins)
_pics = json.load(open(os.path.join(here, "pics", "auto.json"), encoding="utf-8"))
for f in sorted(glob.glob(os.path.join(here, "pics", "k*.txt"))):
    for ln in open(f, encoding="utf-8"):
        a = ln.split()
        if len(a) == 2: _pics["A" + a[0]] = a[1]
_ids = set(w["id"] for w in vocab)
_pics = {k: v for k, v in _pics.items() if k in _ids}
s = re.sub(r"/\*P59S\*/.*?/\*P59E\*/", lambda m: "/*P59S*/" + json.dumps(_pics, ensure_ascii=False) + "/*P59E*/", s, flags=re.S)
print("pictures", len(_pics))
s = re.sub(r"/\*P66S\*/.*?/\*P66E\*/", lambda m: "/*P66S*/" + open(os.path.join(here, "..", "pics", "atlas-ky.json"), encoding="utf-8").read().strip() + "/*P66E*/", s, flags=re.S)
s = s.replace("@@RU@@", "ロシア語")
open(out_path, "w", encoding="utf-8").write(s)
print("vocab", len(vocab), "enriched", sum(1 for w in vocab if w["simpleExp"]), "compose", len(compose), "groups", len(groups))
