import glob
import json,re,sys,os
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from translit import roma, strip, ACUTE
from compose_add import UNITS
from lex import L, TAG
from vocab_add import V
src,dst=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()

def pron(acc):
    notes=[]
    unst_o=False
    for w in re.findall(r"[А-Яа-яЁё́]+",acc):
        vowels=sum(1 for ch in w if ch.lower() in "аеёиоуыэюя")
        if vowels<2: continue
        for i,ch in enumerate(w):
            if ch.lower()=="о" and not (i+1<len(w) and w[i+1]==ACUTE): unst_o=True
    if unst_o: notes.append("無アクセントの о は「ア」に近く聞こえます。")
    if re.search("[еёЕЁ]",acc): notes.append("е/ё は前の子音をやわらかくします。")
    return " ".join(notes)

missing=set()
comp=[]; n=401
for u in UNITS:
    for ja,acc,kana,easy in u["s"]:
        bd=[]
        for t in acc.split():
            t2=t.strip(",.!?")
            if not t2 or t2=="—": continue
            e=L.get(t2.lower())
            if not e: missing.add(t2.lower()); continue
            base,meaning,tag,extra=e.split("|")
            pos,why=TAG[tag]
            why=(why+(" "+extra if extra else "")).strip()
            bd.append({"surface":t2,"base":base,"meaning":meaning,"why":why,"note":why,"pos":pos})
        comp.append({"id":"R-A2-%03d"%n,"ja":ja,"ru":strip(acc),"accent":acc,"kana":kana,"roma":roma(acc),
            "gDetail":u["gDetail"],"gEasy":easy,"pron":pron(acc),"unit":u["unit"],"grammarPoint":u["gp"],
            "replace":[],"level":"A2","breakdown":bd})
        n+=1
if missing: sys.exit("missing lex: "+" ".join(sorted(missing)))

voc=[]; cnt={"A1":1326,"A2":1116}; li={"A1":0,"A2":0}
existing=set(json.loads(re.search(r'id="data-vocab">(.*?)</script>',s,re.S).group(1))["r"][i][1] for i in range(2440))
for lv,acc,kana,meaning,pos,cat,simple,rule,exr,exj in V:
    w=strip(acc)
    assert w not in existing,w
    pk="A1-16" if lv=="A1" else "A2-14"
    voc.append({"id":"%s-%03d"%(lv,cnt[lv]),"word":w,"accent":acc,"kana":kana,"roma":roma(acc),"meaning":meaning,
        "lesson":li[lv]%5+1,"exRu":exr,"exJa":exj,"detailExp":simple+" "+rule,"changeRule":rule,
        "packTitle":"%s パック%s（基礎語補強）"%(lv,pk.split("-")[1]),"category":cat,"pack":pk,"reviewStatus":"none",
        "dataStatus":"active","pos":pos,"level":lv,"pron":"","audio":"","simpleExp":simple})
    cnt[lv]+=1; li[lv]+=1

here=os.path.dirname(os.path.abspath(__file__))
data=open(os.path.join(here,"phase46_data.js"),encoding="utf-8").read()
data=data.replace("__P46_COMPOSE__",json.dumps(comp,ensure_ascii=False)).replace("__P46_VOCAB__",json.dumps(voc,ensure_ascii=False))
ui=open(os.path.join(here,"phase46_ui.js"),encoding="utf-8").read()

def rep(old,new,count=1):
    global s
    c=s.count(old)
    assert c==count,(old[:80],c)
    s=s.replace(old,new)

anchor="var WMAP={}; VOCAB.forEach(function(w){WMAP[w.id]=w;});"
p54ex=json.load(open(os.path.join(here,"..","ru","examples.json"),encoding="utf-8"))
p54='''/* ===== PHASE54: ロシア語 例文の補充（944語）と、機械的な組み合わせフレーズの整理 =====
   「мой хлеб」「напишите паспорт」のように名詞と動詞・形容詞を機械的に組み合わせた項目（約920件）は
   単語としては不自然なものが多いため、単語練習・チャレンジ・集計から外す（学習記録は削除しない）。
   数詞＋名詞（два документа など）と格変化のチャンクは文法の練習になるので残す。 */
var P54_EX=__EX__;
var P54_GE=__GE__;
var P54_HIDE_CATS=["基本チャンク","形容詞チャンク","副詞チャンク","丁寧依頼チャンク","A2実用チャンク","A2操作チャンク","仕事・手続きチャンク","医療チャンク"];
if(String(DATA_VERSION).indexOf("ru-")===0){
  VOCAB.forEach(function(w){var e=P54_EX[w.id];if(e&&!w.exRu){w.exRu=e[0];w.exJa=e[1];}});
  VOCAB=VOCAB.filter(function(w){return P54_HIDE_CATS.indexOf(w.category)<0;});
  /* 同じ単語が A1 と A2 に重複している12語は A1 に統合（A2側の説明を A1 に追記して A2 側を外す） */
  var _a1={};VOCAB.forEach(function(w){if(w.level==="A1")_a1[w.word]=w;});
  VOCAB=VOCAB.filter(function(w){var a=_a1[w.word];if(w.level!=="A2"||!a)return true;
    if(w.simpleExp&&String(a.simpleExp||"").indexOf(w.simpleExp)<0)a.simpleExp=(a.simpleExp?a.simpleExp+" ":"")+w.simpleExp;
    if(w.meaning&&a.meaning.indexOf(w.meaning.split("（")[0])<0)a.meaning=a.meaning+"／"+w.meaning.split("（")[0];return false;});
  /* 瞬間作文：決まり文句だった「やさしい解説」を文ごとの説明に差し替え */
  COMPOSE.forEach(function(c){if(P54_GE[c.id])c.gEasy=P54_GE[c.id];});
  /* 不自然だった文の修正 */
  COMPOSE.forEach(function(c){if(c.id==="R-A2-271"&&/объясня/.test(c.ru)){c.ru="Он рассказывает о работе.";c.accent="Он расска́зывает о рабо́те.";c.ja="彼は仕事について話します。";c.kana="オン ラスカーズィヴァエト ア ラボーチェ。";c.roma="On rasskázyvayet o rabóte.";
    (c.breakdown||[]).forEach(function(b,i){if(/объясн/.test(b.base||"")){c.breakdown[i]={surface:"расска́зывает",base:"расска́зывать",meaning:"話す・語る",why:"он に対応する現在形。о＋前置格で「〜について話す」。",note:"он に対応する現在形。о＋前置格で「〜について話す」。",pos:"動詞"};}});}});
}
'''.replace("__EX__",json.dumps(p54ex,ensure_ascii=False)).replace("__GE__",json.dumps(json.load(open(os.path.join(here,"..","ru","gEasy.json"),encoding="utf-8")),ensure_ascii=False))
rep(anchor,data+"\n"+p54+"\n"+ui+"\n"+anchor)
# learn sub routing
rep('else if(ui.view==="dialog")body=renderDialogs();','else if(ui.view==="dialog")body=renderDialogs();\n  else if(ui.view==="gnote")body=renderGrammarNotes();\n  else if(ui.view==="a2check")body=renderA2Check();')
m=re.search(r'var title=\{word:"単語",',s); assert m
rep('var title={word:"単語",','var title={gnote:"文法ノート",a2check:"A2カバー状況",word:"単語",')
# hub icons
rep('    reinforce:{bg:"rgba(249,115,22,.14)"','    gnote:{bg:"rgba(16,185,129,.14)",svg:bookIcon2("#10B981")},\n    a2check:{bg:"rgba(47,158,68,.14)",svg:svgIcon("check",19,{color:"#2F9E44"})},\n    reinforce:{bg:"rgba(249,115,22,.14)"')
# click handlers
rep('  if(a==="ggroup"){','  /* PHASE46: 文法ノート／A2カバー状況から練習開始 */\n  if(a==="p46note"){var pn=P46_NOTES[+V("data-val")];if(pn){ui.p46Open=pn.key;startCompose({type:"ids",ids:p46NoteIds(pn.gps)},"文法ノート："+pn.title);}return;}\n  if(a==="p46a2"){var pa=P46_A2[+V("data-val")];if(pa)startCompose({type:"ids",ids:p46NoteIds(pa[2])},"A2："+pa[0]);return;}\n  if(a==="aienable"){settings.aiChatEnabled=true;saveAll();render();return;}\n  if(a==="aidisable"){settings.aiChatEnabled=false;saveAll();render();return;}\n  if(a==="ggroup"){')
# legacy progress labels
rep('lvbar("A1 単語（900語）",a1)+lvbar("A2 単語（700語）",a2)+lvbar("A2 瞬間作文（400文）",','lvbar("A1 単語（"+a1.total+"語）",a1)+lvbar("A2 単語（"+a2.total+"語）",a2)+lvbar("A2 瞬間作文（"+cAll+"文）",')
# AI chat: opt-in (no network request unless the user turns it on)
rep("function renderAIChat(){\n  var A=ensureAIChat();\n",
 "function renderAIChat(){\n  var A=ensureAIChat();\n  /* PHASE46: 外部通信を伴うため既定はオフ。ユーザーが明示的にオンにした場合だけ使える */\n  if(!settings.aiChatEnabled){\n    return '<div class=\"hero\"><div class=\"greet\">AI会話練習</div><div class=\"sub\">この機能はオフになっています</div></div>'+\n      '<div class=\"note\" style=\"margin:12px 0\">AI会話は入力した文章を外部（api.anthropic.com）へ送信します。それ以外の機能は端末内だけで動き、外部通信はしません。Claude.ai のアプリ内プレビューなど対応環境以外では動作しません。</div>'+\n      '<button type=\"button\" class=\"btn full\" data-act=\"aienable\">内容を理解したうえでオンにする</button>';\n  }\n")
rep("  if(!text||A.busy)return;\n","  if(!text||A.busy||!settings.aiChatEnabled)return;\n")
rep("会話内容は学習データとして端末には保存されません。</div>';","会話内容は学習データとして端末には保存されません。 <button type=\"button\" class=\"btn\" data-act=\"aidisable\" style=\"padding:4px 10px;font-size:12px;margin-left:4px\">オフにする</button></div>';")
# header / versions / self-test
rep("  - 単語2440語（A1 1325 / A2 1115）と A2 例文・瞬間作文400文を主データに使用。",
    "  - 単語%d語（A1 %d / A2 %d）と A2 例文・瞬間作文%d文を主データに使用。\n  - PHASE46: A2範囲の監査で不足していた文法（造格・生格・動詞の体・比較・複文・再帰動詞/否定・日付）を\n    瞬間作文7ユニット105文で追加。基礎語%d語（язы́к, страна́, кото́рый, са́мый, стать 等）を追加。\n    文法ノート（早見表）と A2カバー状況画面を追加。AI会話は外部通信のため既定オフに変更。"%(2440+len(voc),1325+cnt["A1"]-1326,1115+cnt["A2"]-1116,400+len(comp),len(voc)))
rep('DATA_VERSION="ru-a1a2-2440-compose400"','DATA_VERSION="ru-a1a2-%d-compose%d"'%(2440+len(voc),400+len(comp)))
rep('check("VOCABが2440件前後",VOCAB.length>=2290&&VOCAB.length<=2590,','check("VOCABが1500件以上",VOCAB.length>=1500&&VOCAB.length<=2700,')
rep('check("COMPOSEが400件前後",COMPOSE.length>=350&&COMPOSE.length<=450,','check("COMPOSEが%d件前後",COMPOSE.length>=%d&&COMPOSE.length<=%d,'%(400+len(comp),400+len(comp)-50,400+len(comp)+50))
# PHASE47 simple UI layer
pics={}
for f in sorted(glob.glob(os.path.join(here,"..","ru","pics*.txt"))):
    for ln in open(f,encoding="utf-8"):
        a=ln.split()
        if len(a)==2: pics["A"+a[0]]=a[1]
p59=open(os.path.join(here,"phase59.js"),encoding="utf-8").read().replace("/*P59S*/{}/*P59E*/","/*P59S*/"+json.dumps(pics,ensure_ascii=False)+"/*P59E*/")
p47=open(os.path.join(here,"phase47.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase48.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase49.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase50.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase51.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase52.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase53.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase55.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase56.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase57.js"),encoding="utf-8").read()+"\n"+open(os.path.join(here,"phase58.js"),encoding="utf-8").read()+"\n"+p59+"\n"+open(os.path.join(here,"phase60.js"),encoding="utf-8").read()
rep("/* ===== init ===== */", p47+"\n/* ===== init ===== */")
rep('else if(ui.view==="gnote")body=renderGrammarNotes();','else if(ui.view==="gnote")body=renderGrammarNotes();\n  else if(ui.view==="p47words")body=renderP47Words();')
rep('var title={gnote:"文法ノート",','var title={p47words:"単語練習",gnote:"文法ノート",')
import re as _re
s,_n=_re.subn(r'<div style="width:8px;height:26px;border-radius:2px;overflow:hidden;flex:0 0 auto;display:flex;flex-direction:column">.*?</div>\s*(?=<div><h1>)',
 lambda m:'<svg class="p49-flagsvg" width="32" height="22" viewBox="0 0 30 20" aria-label="ロシア国旗"><clipPath id="p49fc"><rect width="30" height="20" rx="3"/></clipPath><g clip-path="url(#p49fc)"><rect width="30" height="6.7" fill="#FFFFFF"/><rect y="6.6" width="30" height="6.8" fill="#0039A6"/><rect y="13.3" width="30" height="6.7" fill="#D52B1E"/></g><rect x=".5" y=".5" width="29" height="19" rx="2.6" fill="none" stroke="rgba(255,255,255,.3)"/></svg>\n      ',s,count=1,flags=_re.S)
assert _n==1,"flag"
open(dst,'w',encoding='utf-8').write(s)
print("compose",len(comp),"vocab",len(voc))
