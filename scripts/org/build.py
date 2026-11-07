import json,os,re,sys
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from spec import MIN
from ja import JA
from extra import EXTRA
AG = [
 dict(id="gsin", n="国家刑罰執行庁", ru="Государственная служба исполнения наказаний", kind="内閣直属の機関", key="Государственной службе исполнения наказаний", sectors=["peace","governance"], strats=["legal"], d="刑務所と刑の執行を担う。下に警備・護送局がある。"),
 dict(id="gaca", n="国家民間航空庁", ru="Государственное агентство гражданской авиации", kind="内閣直属の機関", key="Государственном агентстве гражданской авиации", sectors=["transport"], strats=[], d="航空の安全と空港・航空会社の監督。"),
 dict(id="gacs", n="国家公務員・地方自治庁", ru="Государственное агентство по делам государственной службы и местного самоуправления", kind="内閣直属の機関", key="Государственном агентстве по делам государственной службы", sectors=["governance"], strats=["lsg"], d="公務員制度と地方自治体の支援。"),
 dict(id="gapd", n="国家個人情報保護庁", ru="Государственное агентство по защите персональных данных", kind="内閣直属の機関", key="Государственном агентстве по защите персональных данных", sectors=["digital","governance"], strats=["digital"], d="個人情報の保護の監督。"),
 dict(id="galr", n="国家土地資源・地籍・測地・地図庁", ru="Государственное агентство по земельным ресурсам, кадастру, геодезии и картографии", kind="内閣直属の機関", key="Государственном агентстве по земельным ресурсам", sectors=["agri","urban"], strats=[], d="土地の登記（地籍）・測量・地図。"),
 dict(id="gatd", n="国家観光開発庁", ru="Государственное агентство по развитию туризма", kind="内閣直属の機関", key="Государственном агентстве по развитию туризма", sectors=["private"], strats=["tourism"], d="観光の振興。2025〜26年に文化省の観光局から独立。"),
 dict(id="gasp", n="国家財産管理庁", ru="Государственное агентство по управлению государственным имуществом", kind="内閣直属の機関", key="Государственном агентстве по управлению государственным", sectors=["finance","private"], strats=[], d="国有財産・国営企業の管理と民営化。"),
 dict(id="gafs", n="国家体育・スポーツ庁", ru="Государственное агентство физической культуры и спорта", kind="内閣直属の機関", key="Государственном агентстве физической культуры", sectors=["sports"], strats=["sports"], d="体育・スポーツの振興。2025年に文化省のスポーツ局から独立。"),
 dict(id="nava", n="国家仮想資産・ブロックチェーン技術庁", ru="Национальное агентство по виртуальным активам и блокчейн-технологиям", kind="大統領直属の機関", key="Национальном агентстве по виртуальным активам", sectors=["digital","finance"], strats=[], d="暗号資産・ブロックチェーンの政策と監督。2026年にできた。"),
 dict(id="narr", n="国家宗教・民族間関係庁", ru="Национальное агентство по делам религий и межэтнических отношений", kind="大統領直属の機関", key="Национальном агентстве по делам религий", sectors=["peace"], strats=["religion"], d="宗教政策と民族間の関係。"),
 dict(id="nai", n="国家投資庁", ru="Национальное агентство по инвестициям", kind="大統領直属の機関", key="Национальном агентстве по инвестициям", sectors=["private"], strats=[], d="外国からの投資の呼び込みと支援。"),
]
ROOT=sys.argv[1] if len(sys.argv)>1 else '.'
d=json.load(open(os.path.join(ROOT,'orgdb/index.json')))
units=json.load(open(os.path.join(ROOT,'units.json')))
DROP={"mciy":lambda u:u['y']<2023}   # tourism/sport departments became Cabinet agencies in 2025
NOM=[("Государственной службе","Государственная служба"),("Национальном хирургическом центре","Национальный хирургический центр"),("Национальном институте","Национальный институт"),("Национальном центре","Национальный центр"),("Департаменте","Департамент"),("Службе","Служба"),("Фонде","Фонд"),("Центре","Центр"),("государственного предприятия","Государственное предприятие"),("государственного учреждения","Государственное учреждение")]
def nom(n):
    for a,b in NOM:
        if n.startswith(a): return b+n[len(a):]
    return n
def ed_iso(s):
    m=re.match(r'(\d\d)[.,](\d\d)[.,](\d{4})',s or ''); return f"{m.group(3)}-{m.group(2)}-{m.group(1)}" if m else ''
def find_pol(prefix, key=None):
    best=None
    for x in d:
        t=' '.join(x['title'].split())
        ok = (t.lower().startswith(prefix.lower())) if not key else (key in t and re.match(r'(?i)\s*положение',t))
        if ok and (best is None or ed_iso(x.get('editionDate'))>ed_iso(best.get('editionDate'))): best=x
    return best
CBD="https://cbd.minjust.gov.kg/{}/edition/{}/ru"
def basis(x, label):
    if not x: return {"t":"規程は法令データベースで確認中"}
    code=x['code']; num=re.sub(r'\D','',code) if code.isdigit() else None
    return {"t":label, "code":code, "ed":ed_iso(x.get('editionDate')), "u":CBD.format(code, x['edition']) if code.isdigit() else ""}
orgs=[]
missing=set()
for m in MIN:
    pol=find_pol(m['pol'])
    groups=[]
    groups.append(dict(n="本省（中央機構）", type="本省", items=[dict(id=m['id']+"-ca", n="大臣・次官と本省の局・課", d="組織図では本省は「中央機構」という1つの箱で書かれ、局・課の名前は出ていません。局・課の分け方は大臣が決めるため（規程による）、法令には載っていません。", conf="法令" if pol else "未取得")]))
    ag=[];ent=[]
    for u in units.get(m['id'],[]):
        if m['id'] in DROP and DROP[m['id']](u): continue
        k=next((k for k in JA if u['name'].startswith(k) or u['name'].lower().startswith(k.lower())),None)
        if not k: missing.add(u['name']); continue
        n,desc,strat,typ=JA[k]
        item=dict(id=m['id']+"-"+re.sub(r'\W','',u['code'])[-8:], n=n, ru=nom(u['name']).replace('"Кыргызфармация','«Кыргызфармация»').replace('"Кыргызтранснефтегаз','«Кыргызтранснефтегаз»'), d=desc+(("。" if desc else "")+f"規程: 法令データベース {u.get('ed') or u['y']} 版"), strat=strat, conf="法令")
        (ag if typ=="外局" else ent).append(item)
    seen={i['n'] for i in ag+ent}
    for n,ru,desc,strat,typ in EXTRA.get(m['id'],[]):
        if n in seen: continue
        item=dict(id=m['id']+"-x"+str(len(ag)+len(ent)), n=n, ru=ru, d=(desc+"。" if desc else "")+"組織図から読み取り", strat=strat, conf="組織図")
        (ag if typ=="外局" else ent).append(item)
    if ag: groups.append(dict(n="省の下の外局（局・庁）", type="外局", items=ag))
    if ent: groups.append(dict(n="国の機関・公営企業", type="公営企業・機関", items=ent))
    if not ag and not ent: groups.append(dict(n="省の下の外局（局・庁）", type="外局", items=[dict(id=m['id']+"-ag", n="確認中", d="外局の規程が法令データベースの検索で見つかっていません", conf="未取得")]))
    orgs.append(dict(id=m['id'], n=m['n'], ru=m['ru']+" Кыргызской Республики", kind="省", d=m['d'], sectors=m['sectors'], strats=m['strats'],
                     basis=basis(pol, "「"+m['n']+"に関する規程」(内閣決定)"), groups=groups))
for a in AG:
    pol=find_pol(None, a['key'])
    kids=[]
    if a['id']=="gsin": kids=[dict(n="下の機関", type="外局", items=[dict(id="gsin-conv", n="警備・護送局", ru="Департамент охраны и конвоирования", conf="法令")])]
    orgs.append(dict(id=a['id'], n=a['n'], ru=a['ru']+" Кыргызской Республики", kind=a['kind'], d=a['d'], sectors=a['sectors'], strats=a['strats'],
                     basis=basis(pol, "「"+a['n']+"に関する規程」"), groups=kids))
out=dict(updated="2026-11-07", note="キルギスの省（18）と、内閣・大統領の直属の主な機関。各省庁の規程（法務省の法令データベース）の文字と組織図から、こちらで日本語の組織図に組み立てたものです。画像はそのまま使っていません。", orgs=orgs)
json.dump(out,open(os.path.join(ROOT,'orgs.json'),'w'),ensure_ascii=False,separators=(',',':'))
print('missing JA:',missing); print(len(orgs),'orgs')
