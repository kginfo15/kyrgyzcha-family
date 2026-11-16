import glob,json,re,os
words={}
for l in open('words.txt',encoding='utf-8'):
    i,w,m,p=l.rstrip('\n').split('|'); words[i]=(w,m,p)
VOW="аыоуэеиөүёюя"
LOW={'а':'а','ы':'а','я':'а','о':'о','ё':'о','у':'а','ю':'а','э':'е','е':'е','и':'е','ө':'ө','ү':'ө'}
VOICELESS=set("птксшчфхцщ")
SKIP={"A1-464","A2-003","A2-260","A1-095","A1-843","A1-844","A1-845","A1-852"}
def forms(word):
    last=re.split(r"[ ]",word)[-1]
    part=last.split("-")[-1]
    if not re.fullmatch(r"[а-яөүңё]+",part): return None
    v=[c for c in part if c in VOW]
    if not v: return None
    lo=LOW[v[-1]]; f=part[-1]
    if f in VOW or f in "йр": pl,da,lc="л","г","д"
    elif f in VOICELESS: pl,da,lc="т","к","т"
    elif f in "лмнңзжбвгд": pl,da,lc="д","г","д"
    else: return None
    if f=="к" or f=="г": pass
    base=word
    return "複数 %s／〜へ %s／〜で %s／〜から %s"%(base+pl+lo+"р", base+da+lo, base+lc+lo, base+lc+lo+"н")
out={}; errs=[]
for f in sorted(glob.glob('src/b*.txt')):
    for n,l in enumerate(open(f,encoding='utf-8'),1):
        l=l.rstrip('\n')
        if not l.strip(): continue
        p=l.split('|')
        if len(p)!=4: errs.append((f,n,'fields',l[:40])); continue
        i,se,ek,ej=p
        if i not in words: errs.append((f,n,'id',i)); continue
        if i in out: errs.append((f,n,'dup',i))
        if re.search(r'[A-Za-z]',ek): errs.append((f,n,'latin',ek))
        w,m,pos=words[i]
        cr=""
        if pos=="noun" and i not in SKIP:
            multi=" " in w
            if not (multi and w[-1] in "ыиуү"):
                cr=forms(w) or ""
        out[i]={"simpleExp":se,"exKg":ek,"exJa":ej,"changeRule":cr,"detailExp":(("変化："+cr) if cr else se)}
missing=[i for i in words if i not in out]
print("entries",len(out),"missing",missing[:10],len(missing),"errs",errs[:10])
os.makedirs('enrich',exist_ok=True)
json.dump(out,open('enrich/words.json','w',encoding='utf-8'),ensure_ascii=False)
import random
for i in ["A1-126","A1-148","A1-805","A1-110","A2-062","A1-097","A1-188","A1-194","A2-221","A1-216"]: print(i,words[i][0],out[i]["changeRule"])
