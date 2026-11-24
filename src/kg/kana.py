"""Kyrgyz Cyrillic -> roma / katakana (approximate reading aid), matching the style of the existing data."""
ROMA={'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'j','з':'z','и':'i','й':'y','к':'k','л':'l','м':'m','н':'n','ң':'ng','о':'o','ө':'ö','п':'p','р':'r','с':'s','т':'t','у':'u','ү':'ü','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ы':'y','э':'e','ю':'yu','я':'ya','ь':'','ъ':''}
def roma(t): return ''.join(ROMA.get(c,c) for c in t.lower())
# Kyrgyz-style katakana (v2, 2026-11-24).
# The old table wrote ө/ү Turkish-style (күн→キュン, бүгүн→ビュギュン, өз→オズ but нөл→ニョル).
# Kyrgyz ө/ү are rounded front vowels with no palatal glide, so here they use the plain オ/ウ rows
# (күн→クン, бүгүн→ブグン, нөл→ノル), as Japanese usually writes Kyrgyz names (Чүй→チュイ, Түндүк→トゥンドゥク).
# ы is ウ (кыргыз→クルグズ) but シ/ジ/チ after ш/ж/ч (жакшы→ジャクシ).
# е is イェ at the start of a word and after a vowel (Kyrgyz reads it [je] there).
V={'а':'a','ы':'y','у':'u','о':'o','э':'e','е':'e','и':'i','ө':'o','ү':'u','я':'ya','ю':'yu','ё':'yo'}
ALONE={'a':'ア','i':'イ','u':'ウ','y':'ウ','e':'エ','ye':'イェ','o':'オ','yu':'ユ','ya':'ヤ','yo':'ヨ'}
def _row(a,i,u,e,o,ya,yu,yo,end,y=None):
    return {'a':a,'i':i,'u':u,'e':e,'o':o,'ya':ya,'yu':yu,'yo':yo,'':end,'y':y or u}
T={
'к':_row('カ','キ','ク','ケ','コ','キャ','キュ','キョ','ク'),
'г':_row('ガ','ギ','グ','ゲ','ゴ','ギャ','ギュ','ギョ','グ'),
'с':_row('サ','シ','ス','セ','ソ','シャ','シュ','ショ','ス'),
'з':_row('ザ','ジ','ズ','ゼ','ゾ','ジャ','ジュ','ジョ','ズ'),
'т':_row('タ','ティ','トゥ','テ','ト','チャ','チュ','チョ','ト'),
'д':_row('ダ','ディ','ドゥ','デ','ド','ジャ','ジュ','ジョ','ド'),
'н':_row('ナ','ニ','ヌ','ネ','ノ','ニャ','ニュ','ニョ','ン'),
'ң':_row('ンガ','ンギ','ング','ンゲ','ンゴ','ンギャ','ンギュ','ンギョ','ン'),
'б':_row('バ','ビ','ブ','ベ','ボ','ビャ','ビュ','ビョ','プ'),
'п':_row('パ','ピ','プ','ペ','ポ','ピャ','ピュ','ピョ','プ'),
'м':_row('マ','ミ','ム','メ','モ','ミャ','ミュ','ミョ','ム'),
'р':_row('ラ','リ','ル','レ','ロ','リャ','リュ','リョ','ル'),
'л':_row('ラ','リ','ル','レ','ロ','リャ','リュ','リョ','ル'),
'ж':_row('ジャ','ジ','ジュ','ジェ','ジョ','ジャ','ジュ','ジョ','ジ','ジ'),
'ч':_row('チャ','チ','チュ','チェ','チョ','チャ','チュ','チョ','チ','チ'),
'ш':_row('シャ','シ','シュ','シェ','ショ','シャ','シュ','ショ','シュ','シ'),
'щ':_row('シチャ','シチ','シチュ','シチェ','シチョ','シチャ','シチュ','シチョ','シチ','シチ'),
'в':_row('ヴァ','ヴィ','ヴ','ヴェ','ヴォ','ヴャ','ヴュ','ヴョ','ヴ'),
'ф':_row('ファ','フィ','フ','フェ','フォ','フャ','フュ','フョ','フ'),
'х':_row('ハ','ヒ','フ','ヘ','ホ','ヒャ','ヒュ','ヒョ','フ'),
'ц':_row('ツァ','ツィ','ツ','ツェ','ツォ','ツャ','ツュ','ツョ','ツ'),
'й':_row('ヤ','イ','ユ','イェ','ヨ','ヤ','ユ','ヨ','イ','イ'),
}
VOW=set(V)
def kana_word(w):
    w=w.lower().replace('ъ','ь');out=[];i=0;n=len(w)
    def vkey(j):
        c=w[j];v=V[c]
        if c=='е' and (j==0 or w[j-1] in VOW or w[j-1]=='ь'): v='ye'
        return v
    w2=w;w=w.replace('ь','');
    # keep е→イェ after ь: mark positions before removing ь
    if 'ь' in w2:
        w=''.join(('\u0001' if (c=='е' and k>0 and w2[k-1]=='ь') else c) for k,c in enumerate(w2) if c!='ь')
    n=len(w)
    def isv(j): return j<n and (w[j] in V or w[j]=='\u0001')
    def key(j):
        if w[j]=='\u0001': return 'ye'
        return vkey(j)
    def same(j,c): return j<n and w[j]==c
    while i<n:
        c=w[i]
        if isv(i):
            v=key(i);k=ALONE[v]
            if same(i+1,c) or (c=='\u0001' and same(i+1,'е')): k+='ー';i+=1
            out.append(k);i+=1
        elif c in T:
            if isv(i+1):
                v=key(i+1)
                if v=='ye': v='e'
                k=T[c][v];j=i+2
                if same(j,w[i+1]): k+='ー';j+=1
                out.append(k);i=j
            else:
                k=T[c]['']
                if c=='м' and i+1<n and w[i+1] in 'бп': k='ン'
                if c=='б': k='ブ'
                out.append(k);i+=1
        else: out.append(c);i+=1
    return ''.join(out)
def kana(t):
    import re
    return ' '.join('・'.join(kana_word(y) for y in x.split('-') if y) for x in t.split(' ') if x)
