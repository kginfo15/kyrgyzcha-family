"""例文・単語分解のカタカナ読みの表を作る（アプリの画面に読み方を出すため）。
使い方：一度アプリをビルドし、画面から例文と単語分解の一覧（texts.json: {"ex":[...],"bd":[...]}）を書き出してから
  python3 -I make_kana.py texts.json p67_kana.json
その後もう一度ビルドすると、表がアプリに組み込まれる。"""
import json, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import ru_kana
src, dst = sys.argv[1], sys.argv[2]
d = json.load(open(src, encoding="utf-8"))
out = {}
for t in d["ex"]:
    k = ru_kana.kana(t)
    if k: out[t] = k
for t in d["bd"]:
    core = t.strip(",.!?«»:;")
    if core: out[t] = ru_kana.kana(core)
json.dump(out, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print(len(out))
