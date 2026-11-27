/* ===== Phase82：B1に向けた追加 =====
   1) 文法解説書に B1 の章（phase82_guide.js の P82_CH）を、決めた位置に入れる
   2) 章ごとの専用の練習問題（P82_Q）を「この文法の練習問題を解く」で出す（問題の形 t:"gq"）
   3) 単語の解説の誤りを直す（P82_FIX）
   4) 「使い方」に、B1までの時間と周回の目安を足す
   記録：章の練習（t:"gq"）の結果は保存しません（その場の正解率とまちがえた文だけを結果画面に出す）。新しい保存場所は作っていません。 */
(function(){
if(!window.P72_GUIDE||P47_LANG==="ky")return;

/* ---------- 1) 章を入れる ---------- */
P82_CH.forEach(function(c){
  var at=-1,a=P82_AFTER[c.id];
  if(a)P72_GUIDE.forEach(function(g,i){if(g.id===a)at=i;});
  if(at<0)P72_GUIDE.push(c);else P72_GUIDE.splice(at+1,0,c);
});
window.P82_IDS={};P82_CH.forEach(function(c){P82_IDS[c.id]=1;c.t=c.t.replace(/\u0301/g,"");});
/* 目次のアイコン：前からの章と同じ「色の四角＋文字」の形で、章の中身を表す短い語（オリジナル） */
(function(){var I={fut:["#3B82C4","бу́ду","これから"],sya:["#2E9C8F","-ся","自分を"],plcase:["#C98A12","-ов","複数"],comp:["#E0503F","＞","より"],short:["#8A63C9","рад","短い形"],
  pron:["#5B8C3A","мне","代名詞"],svoy:["#3B82C4","свой","自分の"],pmotion:["#2E9C8F","при-","着く"],kotory:["#C98A12","кото́","〜する人"],conj:["#E0503F","что","つなぐ"],
  cond:["#8A63C9","е́сли","もし"],speech:["#5B8C3A","«  »","伝える"],neg:["#3B82C4","ни-","ない"],time:["#2E9C8F","че́рез","時"],part:["#C98A12","-щий","読む用"]};
  function sv(c,a,b){var n=a.replace(/\u0301/g,"");var fs=n.length>4?11:n.length>3?13:15;
    return '<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="1" y="1" width="42" height="42" rx="11" fill="'+c+'" opacity=".15"/><text x="22" y="22" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="'+c+'" font-family="system-ui,sans-serif">'+n+'</text><text x="22" y="35" text-anchor="middle" font-size="8" font-weight="700" fill="'+c+'" font-family="system-ui,sans-serif">'+b+'</text></svg>';}
  Object.keys(I).forEach(function(k){var r=I[k];P72_ICON[k]=function(){return sv(r[0],r[1],r[2]);};});})();

/* ---------- 3) 単語の解説の誤りを直す ----------
   単語帳の「活用・変化形」の説明に、まちがいが見つかったもの。 */
var NUM5="-ь で終わる女性名詞のように変化します。",NUMEND="主格・対格のときは形が変わらず、うしろの名詞は複数の生格です（пять книг）。ほかの格では名詞も同じ格になります（с пятью́ кни́гами）。";
var P82_FIX={
 "день":"男性名詞。生格 дня（е が落ちます）、複数主格 дни。",
 "кашель":"男性名詞。生格 ка́шля（е が落ちます）。",
 "учитель":"男性名詞。生格 учи́теля、複数主格 учителя́（-и ではなく -я になる特別な形）。",
 "семья":"女性名詞。対格 семью́、生格 семьи́、前置格 семье́、複数主格 се́мьи、複数生格 семе́й。",
 "ничего":"この形のまま使います。",
 "ноль":"男性名詞のように変化します：生格 нуля́、造格 нулём。",
 "два":"格で形が変わります：生格・前置格 двух、与格 двум、造格 двумя́。女性名詞の前では две。主格・対格のとき、うしろの名詞は単数の生格（два бра́та）。ほかの格では名詞も同じ格（двум бра́тьям）。",
 "три":"格で形が変わります：生格・前置格 трёх、与格 трём、造格 тремя́。主格・対格のとき、うしろの名詞は単数の生格（три бра́та）。ほかの格では名詞も同じ格。",
 "четыре":"格で形が変わります：生格・前置格 четырёх、与格 четырём、造格 четырьмя́。主格・対格のとき、うしろの名詞は単数の生格。ほかの格では名詞も同じ格。",
 "сорок":"主格・対格以外はすべて сорока́ になります。",
 "девяносто":"主格・対格以外はすべて девяно́ста になります。",
 "сто":"主格・対格以外はすべて ста になります（о́коло ста рубле́й）。",
 "тысяча":"女性名詞のように変化します：生格 ты́сячи、対格 ты́сячу、造格 ты́сячей。うしろの名詞は複数の生格（ты́сяча рубле́й）。",
 "пятьдесят":"両方の部分が変化します：生格・与格・前置格 пяти́десяти、造格 пятью́десятью。"+NUMEND,
 "шестьдесят":"両方の部分が変化します：生格・与格・前置格 шести́десяти。"+NUMEND,
 "семьдесят":"両方の部分が変化します：生格・与格・前置格 семи́десяти。"+NUMEND,
 "восемьдесят":"両方の部分が変化します：生格・与格・前置格 восьми́десяти。"+NUMEND
};
/* 5〜20・30：-ь の女性名詞と同じ（生格・与格・前置格 -и、造格 -ью） */
[["пять","пяти́","пятью́"],["шесть","шести́","шестью́"],["семь","семи́","семью́"],["восемь","восьми́","восемью́"],["девять","девяти́","девятью́"],["десять","десяти́","десятью́"],
 ["одиннадцать","оди́ннадцати","оди́ннадцатью"],["двенадцать","двена́дцати","двена́дцатью"],["тринадцать","трина́дцати","трина́дцатью"],["четырнадцать","четы́рнадцати","четы́рнадцатью"],
 ["пятнадцать","пятна́дцати","пятна́дцатью"],["шестнадцать","шестна́дцати","шестна́дцатью"],["семнадцать","семна́дцати","семна́дцатью"],["восемнадцать","восемна́дцати","восемна́дцатью"],
 ["девятнадцать","девятна́дцати","девятна́дцатью"],["двадцать","двадцати́","двадцатью́"],["тридцать","тридцати́","тридцатью́"]].forEach(function(r){
  P82_FIX[r[0]]=NUM5+"生格・与格・前置格 "+r[1]+"、造格 "+r[2]+"。"+NUMEND;});
VOCAB.forEach(function(w){var k=String(w.word||"").replace(/́/g,"").toLowerCase();if(P82_FIX[k])w.changeRule=P82_FIX[k];});

/* ---------- 2) 章専用の練習問題 ---------- */
function p82Steps(t){var Q=P82_Q[t]||[];return shuffle(Q.map(function(q,i){return {t:"gq",id:"gq:"+t+":"+i,q:q,opts:shuffle([q[2]].concat(q[3]))};})).slice(0,10);}
var _tp=p77GpTopics;p77GpTopics=function(t){return P82_Q[t]?[t]:_tp.apply(this,arguments);};
var _cnt=p77GpCount;p77GpCount=function(t){return P82_Q[t]?P82_Q[t].length:_cnt.apply(this,arguments);};
var _start=p77GpStart;p77GpStart=function(t){
  if(!P82_Q[t])return _start.apply(this,arguments);
  var steps=p82Steps(t);if(!steps.length){toast("この章の練習問題は、まだ用意できていません");return;}
  try{p70ClosePage();}catch(_){}try{p72GuideClose();}catch(_){}
  P71={fav:1,gp:t,gq:1,ti:-1,li:0,n:1,ids:[],steps:steps,pos:0,stage:0,picked:null,picked2:null,mist:{},retried:{},ok:0,ng:0,rv:[],before:p47DoneToday(),confirm:false};
  p71Render();
};
/* 文の空欄 ＿ を、答える前は線、答えたあとは正解の語にする */
function p82Sent(q,done,ok){var p=String(q[0]).split("＿");
  var fill=done?'<span class="p71-blank '+(ok?"ok":"ng")+'">'+esc(q[2])+'</span>':'<span class="p71-blank">　　　</span>';
  return esc(p[0])+fill+esc(p.slice(1).join("＿"));}
function p82Full(q){return p71Plain(String(q[0]).replace("＿",q[2]));}
var _render=p71Render;
p71Render=function(){
  var S=P71,x=S&&S.steps[S.pos];
  if(!S||S.confirm||!x||x.t!=="gq")return _render.apply(this,arguments);
  var m=document.getElementById("p71");if(!m){m=document.createElement("div");m.id="p71";document.body.appendChild(m);}
  document.body.classList.add("p70-noscroll");try{p72PopClose();p72Theme();}catch(_){}
  var q=x.q,done=S.picked!==null,ok=done&&S.picked===q[2];
  var h='<div class="p71-body"><div class="p71-tag">'+(x.again?'もう一度・':'')+'空欄に入る形は？</div>'+
    '<div class="p71-paper"><div class="p71-sent">'+p82Sent(q,done,ok)+'</div><div class="p71-ja">'+esc(q[1])+'</div>'+(done?p71Spk(p82Full(q)):'')+(done?p71Stamp(ok):'')+'</div>'+
    '<div class="p71-opts">'+x.opts.map(function(o,i){var st=done?(o===q[2]?"right":(o===S.picked?"wrong":"dim")):"";
      return '<div class="p71-orow"><button type="button" class="p71-opt '+st+'" data-act="p82pick" data-val="'+i+'"><span>'+esc(o)+'</span></button>'+p71Spk(p71Plain(o),"p71-ospk")+'</div>';}).join("")+'</div>';
  if(done)h+='<div class="p71-exp"><p><b>'+(ok?'正解':'正解は '+esc(q[2]))+'</b></p><p class="p71-det">'+esc(q[4])+'</p><p class="p82-full">'+esc(p82Full(q))+'</p></div>';
  h+='</div>';
  var foot=done?'<button type="button" class="p71-main" data-act="p71next">次へ</button>':'<div class="p71-wait">選んでください</div>';
  m.innerHTML='<div class="p71-wrap">'+p71Head()+'<div class="p71-scroll">'+h+'</div><div class="p71-foot">'+foot+'</div></div>';
  m.className="show";
  try{p72Wrap(m);}catch(_){}
  var sc=m.querySelector(".p71-scroll");if(sc&&S._top!==S.pos+"/"+(done?1:0)){if(!done)sc.scrollTop=0;S._top=S.pos+"/"+(done?1:0);}
  if(done&&sc){var e=m.querySelector(".p71-exp");if(e)setTimeout(function(){try{e.scrollIntoView({block:"nearest"});}catch(_){}},30);}
};
function p82Pick(i){
  var S=P71,x=S&&S.steps[S.pos];if(!x||x.t!=="gq"||S.picked!==null)return;
  S.picked=x.opts[i];var ok=S.picked===x.q[2];
  /* phase85 のコーチ用の記録（章の練習も1問ずつ残す） */
  try{if(typeof coachLog==="function")coachLog({m:"gp",id:x.id,ok:ok,g:[String(x.id).split(":")[1]||""],w:[]});}catch(_){}
  if(!x.again){if(ok)S.ok++;else S.ng++;}
  if(!ok){S.mist[x.id]=1;if(!x.again){var cp={t:"gq",id:x.id,q:x.q,opts:shuffle(x.opts.slice()),again:1};S.steps.push(cp);}}
  try{speak(p82Full(x.q));}catch(_){}
  p71Render();
}
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest('[data-act="p82pick"]'):null;if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();p82Pick(+el.getAttribute("data-val"));},true);
/* 結果画面：まちがえた問題を見直せるように */
var _res=p71Result;
p71Result=function(){var S=P71;if(!S||!S.gq)return _res.apply(this,arguments);
  var tot=S.ok+S.ng,rate=tot?Math.round(S.ok/tot*100):100,seen={},miss=[];
  S.steps.forEach(function(x){if(S.mist[x.id]&&!seen[x.id]){seen[x.id]=1;miss.push(x.q);}});
  var g=(P72_GUIDE.filter(function(c){return c.id===S.gp;})[0]||{}).t||"";
  return '<div class="p71-body"><div class="p71-done"><h3>文法の練習 完了</h3><p>'+esc(g)+'</p></div><div class="p71-sum"><div><b>'+rate+'<small>%</small></b><span>1回目で正解</span></div><div><b>'+(S.ok+S.ng)+'</b><span>問題</span></div><div><b>'+miss.length+'</b><span>まちがえた</span></div></div>'+
    (miss.length?'<div class="p71-note"><div class="p71-tblh">見直しておきたい文</div>'+miss.map(function(q){return '<div class="p71-wrow"><b>'+esc(p82Full(q))+'</b><span>'+esc(q[1])+'</span></div>';}).join("")+'</div>':'<div class="p71-note"><p>全部正解です。「もう一度」を押すと、問題の順番を変えて出します。</p></div>')+
    '<button type="button" class="p72-glink" data-act="p72guide" data-val="'+esc(S.gp)+'">章の解説を読み直す ›</button></div>';};
/* 解説書：B1の章に印、練習ボタンの説明を「この章のための問題」に */
var _gr=p72GuideRender;
p72GuideRender=function(){_gr.apply(this,arguments);var m=document.getElementById("p72g");if(!m||!P72G)return;
  if(!P72G.id){m.querySelectorAll('button[data-act="p72guide"]').forEach(function(b){if(P82_IDS[b.getAttribute("data-val")]){var t=b.querySelector("b");if(t&&!t.querySelector(".p82-b1"))t.insertAdjacentHTML("afterbegin",'<span class="p82-b1">B1</span>');}});
    var lead=m.querySelector(".p72-glead");if(lead&&!m.querySelector(".p82-lead"))lead.insertAdjacentHTML("afterend",'<p class="p82-lead"><span class="p82-b1">B1</span> の印がある章は、中級の入り口（B1）で必要になる文法です。前の章を読んでから進むと分かりやすくなります。</p>');return;}
  var t=P72G.id;if(!P82_Q[t])return;
  m.querySelectorAll(".p77-gpb small").forEach(function(s){s.textContent="この章のために作った問題を"+Math.min(10,P82_Q[t].length)+"問。答えたあとに理由つきの解説が出ます。";});};

/* ---------- 4) 使い方に B1 までの目安 ---------- */
var _gh=p81GuideHtml;
p81GuideHtml=function(){var h=_gh.apply(this,arguments);
  var b='<div class="p81-gh">B1（中級の入り口）までの目安</div><div class="p82-plan">'+
   '<p>ロシアの検定の基準では、ゼロからB1までに<b>約440〜460時間</b>の学習が必要とされています。このアプリの中だけでできるのは、そのうち<b>約190時間分</b>です（下の表の合計）。残りは、AI会話・読み物・ロシア語の動画や音声などで「読む・聞く・話す」を増やしてください。</p>'+
   '<table class="p82-t"><tr><th>やること</th><th>めやす</th></tr>'+
   '<tr><td>'+P74_NAME+'　難易度1（見て選ぶ）</td><td>395レッスン・約26時間</td></tr>'+
   '<tr><td>難易度2（聞いて選ぶ）</td><td>約26時間</td></tr>'+
   '<tr><td>難易度3（文字を並べて書く）</td><td>約35時間</td></tr>'+
   '<tr><td>難易度5（文の形を書く）</td><td>約40時間</td></tr>'+
   '<tr><td>文法の解説書（全章）と章ごとの練習</td><td>約20時間</td></tr>'+
   '<tr><td>まとめて周回・今日のチャレンジでの復習</td><td>約45時間</td></tr></table>'+
   '<p><b>何周する？</b>　難易度1・2・3・5の<b>4周</b>がおすすめです（4は聞き取りが得意になりたい人向け）。1周ごとに、覚えた単語は「復習の間隔」（1・3・7・14・30・60・120日）にそって出なおします。</p>'+
   '<p><b>全部覚えるまで</b>　最後の単語を習ってから、120日あけても答えられるようになるまで、最短でも約4か月かかります。1日30分なら約1年2か月、1日1時間なら約7か月が目安です。</p>'+
   '<p class="p82-mut">時間は1レッスン約4分として計算した見積もりです。人によって速さは変わります。</p></div>';
  return h.replace('<div class="p81-tipbox">',b+'<div class="p81-tipbox">');};

/* ---------- 見た目 ---------- */
var st=document.createElement("style");st.textContent=
 '.p82-b1{display:inline-block;font-style:normal;font-size:11px;font-weight:700;line-height:1;padding:3px 6px;border-radius:6px;border:1px solid currentColor;opacity:.8;vertical-align:2px;margin:0 6px 0 0;width:auto!important;height:auto!important;background:none!important}'+
 '.p82-lead{font-size:13px;line-height:1.7;margin:6px 0 10px;opacity:.85}'+
 '.p82-full{margin-top:8px;font-weight:600}'+
 '.p82-plan p{font-size:14px;line-height:1.75;margin:8px 0}'+
 '.p82-t{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0}.p82-t th,.p82-t td{text-align:left;padding:7px 6px;border-bottom:1px solid rgba(127,127,127,.3);vertical-align:top}.p82-t td:last-child{white-space:nowrap}'+
 '.p82-mut{font-size:12px!important;opacity:.7}';
document.head.appendChild(st);
})();
