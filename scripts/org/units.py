import json,re,sys
sys.path.insert(0,'org'); from spec import MIN
d=json.load(open('orgdb/index.json'))
def yr(x):
    e=x.get('editionDate') or ''; m=re.search(r'(\d{4})',e); return max(int(m.group(1)) if m else 0, int(x['date'][:4] or 0))
out={}
for m in MIN:
    st=m['stem']; units={}
    for x in d:
        t=' '.join(x['title'].split())
        mm=re.search(r'(?i)(?:Положение|ПОЛОЖЕНИЕ)\s*\d*\s*"?\s*[оО]б?\s+(.+?)\s+(?:при|Министерства)\s+'+re.escape(st),t)
        kind='pol'
        if not mm:
            mm=re.search(r'(?i)"О (?:создании|образовании)\s+(.+?)\s+при\s+'+re.escape(st),t); kind='create'
        if not mm:
            mm=re.search(r'(?i)"Об? ((?:Государственн|Национальн|Республиканск|Служб|Фонд|Департамент|Агентств|Центр)\S*.+?)\s+при\s+'+re.escape(st),t); kind='res'
        if not mm or yr(x)<2021: continue
        name=mm.group(1).strip(' "«»')
        k=name.lower()[:60]
        if k not in units or yr(x)>units[k]['y']:
            units[k]=dict(name=name,code=x['code'],y=yr(x),ed=x.get('editionDate'),kind=kind,title=t[:200])
    out[m['id']]=list(units.values())
    print('==',m['id'],len(units))
    for u in units.values(): print('  ',u['y'],u['code'],u['kind'],u['name'][:120])
json.dump(out,open('org/units.json','w'),ensure_ascii=False,indent=1)
