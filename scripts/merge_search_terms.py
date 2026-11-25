# Builds search-terms.json from the term tables terms-*.json.
# Run from the repo root: python3 scripts/merge_search_terms.py <folder with terms-*.json>
import json,glob,sys,os
out=[];seen=set()
TERMS=sys.argv[1] if len(sys.argv)>1 else 'terms'
ALL=os.path.join(TERMS,'terms-all.json')
files=[ALL] if os.path.exists(ALL) else sorted(f for f in glob.glob(os.path.join(TERMS,'terms-*.json')) if not f.endswith('terms-all.json'))
for f in files:
    for g in json.load(open(f))['groups']:
        if g['id'] in seen: print('dup',g['id'],f); g=dict(g,id=g['sec']+'-'+g['id'])
        seen.add(g['id'])
        o={k:g[k] for k in ('id','parent','sec','also','ja','ru','en','qru','qen') if k in g}
        o['show']=[q.strip('"') for q in (g.get('qru') or [])[:1]+(g.get('qen') or [])[:1]]
        out.append(o)
json.dump({"v":1,"note":"検索の言い換え表（terms-*.json から生成）。ja は部分一致、ru/en は単語の頭から、末尾 ! は単語全体。parent は親グループ。","groups":out},open('search-terms.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(out))
