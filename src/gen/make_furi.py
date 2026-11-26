# こどもモード（phase83）用ふりがなデータを作る：語の読み表（最長一致用）＋文ごとの例外
# 使い方：node src/gen/furi_strings.js <russian/index.htmlの絶対パス> <kyrgyz/index.htmlの絶対パス>  → /tmp/claude-0/s/jstr.json
#         python3 src/gen/make_furi.py /tmp/claude-0/s/jstr.json src/gen/furi.json   （pip install sudachipy sudachidict_core が必要）
# 読みは自動（SudachiPy）なので、まれにまちがいがある。気づいたら FIX / G / 下の単語表に足す。
import re,sys,json,collections
from sudachipy import dictionary,tokenizer
tk=dictionary.Dictionary().create();M=tokenizer.Tokenizer.SplitMode.C
KAN=re.compile(r'[一-龯々〆ヶ]')
def hira(s):return ''.join(chr(ord(c)-0x60) if 'ァ'<=c<='ヶ' else c for c in s)
FIX={"日本":"にほん","私":"わたし","明日":"あした","言う":"いう","一回":"いっかい","何時":"なんじ","お金":"おかね","私たち":"わたしたち","私達":"わたしたち"}
strs=json.load(open(sys.argv[1]))
G={"主格":"しゅかく","生格":"せいかく","与格":"よかく","対格":"たいかく","造格":"ぞうかく","前置格":"ぜんちかく","位格":"いかく","奪格":"だっかく","所有格":"しょゆうかく","不定形":"ふていけい","命令形":"めいれいけい","過去形":"かこけい","現在形":"げんざいけい","未来形":"みらいけい","複数形":"ふくすうけい","単数形":"たんすうけい","男性形":"だんせいけい","女性形":"じょせいけい","中性形":"ちゅうせいけい","短語尾":"たんごび","長語尾":"ちょうごび","完了体":"かんりょうたい","不完了体":"ふかんりょうたい","語尾":"ごび","語幹":"ごかん","格変化":"かくへんか","生格形":"せいかくけい","辞書形":"じしょけい","日本語":"にほんご","何曜日":"なんようび","今日":"きょう","一人":"ひとり","二人":"ふたり","1人":"ひとり","2人":"ふたり"}
GR=re.compile("("+"|".join(sorted(map(re.escape,G),key=len,reverse=True))+")")
def toks(s):
  out=[]
  for part in GR.split(s):
    if not part:continue
    if part in G:out.append((part,G[part]));continue
    out.extend(toks0(part))
  return out
def toks0(s):
  out=[]
  for m in tk.tokenize(s,M):
    sf=m.surface()
    if KAN.search(sf):
      r=FIX.get(sf) or hira(m.reading_form())
      if not re.fullmatch(r'[ぁ-んー]+',r):r=None
      out.append((sf,r))
    else:out.append((sf,None))
  return out
red=collections.defaultdict(collections.Counter);T={}
for s in strs:
  if not KAN.search(s):continue
  T[s]=toks(s)
  for sf,r in T[s]:
    if r:red[sf][r]+=1
D={sf:c.most_common(1)[0][0] for sf,c in red.items()}
D.update(G)
D.update({"形":"かたち","人":"ひと","体":"からだ","後":"あと","数":"かず","何":"なに","時":"とき","中":"なか","日":"ひ","間":"あいだ","方":"ほう","上":"うえ","下":"した","前":"まえ","今":"いま","語":"ご","文":"ぶん","格":"かく","性":"せい","問":"もん","例":"れい","私":"わたし","明日":"あした","表":"ひょう","使":"つか","見":"み","来":"く","出":"で","話":"はなし","対":"たい","生":"せい","造":"ぞう","入":"はい","主":"しゅ","月":"つき","分":"ぶん","本":"ほん","名":"な","年":"とし"})
ML=max(len(k) for k in D)
def greedy(s):
  out=[];i=0
  while i<len(s):
    for L in range(min(ML,len(s)-i),0,-1):
      k=s[i:i+L]
      if k in D:out.append((k,D[k]));i+=L;break
    else:out.append((s[i],None));i+=1
  return out
def norm(t):return [(a,b) for a,b in t if b]
X={}
for s,t in T.items():
  if norm(greedy(s))!=norm(t):X[s]=[[a,b] for a,b in t if b]
json.dump({"d":D,"x":X},open(sys.argv[2],'w'),ensure_ascii=False,separators=(',',':'))
print(len(D),'words',len(X),'sentence exceptions')
