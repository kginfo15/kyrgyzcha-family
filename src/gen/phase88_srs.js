/* ===== PHASE88 復習の間隔を一人ずつ合わせる（2026-11-28 Yuta「勉強時間をもっと短くする手法を根拠をもとに」） =====
   いままで：正解するたびに 1→3→7→14→30→60→120 日（全部の単語で同じ）。まちがえると 1 日からやり直し。
   これから：単語ごとに「どれくらい覚えているか」を数字で持ち、「覚えている確率が目標（ふつう90%）まで下がるころ」に復習を出す。
     ・やさしい単語は間隔がどんどん長くなる → 復習の回数が減る（ここで時間が浮く）
     ・まちがえても、それまでの記憶をゼロにしない（少し短くするだけ）
     ・同じ日に何度正解しても、間隔はほとんど伸ばさない（すぐの繰り返しは長い記憶にあまり効かないため）
     ・実際に覚えていた率を記録し、予想より覚えていれば間隔を伸ばし、忘れていれば縮める（あなたに合わせる）
   式は、公開されている記憶のモデル FSRS（オープンソースの間隔反復アルゴリズム）の v4.5 の式と初期値を参考にした簡易版。
   新しい単語の最初の間隔だけは、初心者向けに FSRS の初期値より短めにしてある（P88_S0）。
   単語ごとの記録：progress[id].fs = {s:記憶の強さ（日）, d:むずかしさ1〜10, n:復習回数, l:まちがえた回数}
   設定：settings.p88 = {off:1（前の固定の間隔に戻す）, r:目標の覚えている率 0.85/0.9/0.95, k:合わせ係数, c:{n,p,a}（合わせるための集計）}
   画面：「このあと」シートの「勉強時間を短くするしくみ」(data-act="p88open")。 */
var P88_W=[0.4872,1.4003,3.7145,13.8206,5.1618,1.2298,0.8975,0.031,1.6474,0.1367,1.0461,2.1072,0.0793,0.3246,1.587,0.2272,2.8755];
var P88_F=19/81,P88_DECAY=-0.5,P88_DAY=86400000,P88_MAX=180; /* 初心者向けに、いちばん長い間隔は半年まで */
/* 新しい単語の最初の「記憶の強さ」（日）：まちがえた／うろ覚え／できた */
var P88_S0={1:0.4,2:1.0,3:2.0};
function p88Set(){if(!settings.p88||typeof settings.p88!=="object")settings.p88={};var s=settings.p88;if([0.85,0.9,0.95].indexOf(s.r)<0)s.r=0.9;if(!(s.k>0))s.k=1;if(!s.c)s.c={n:0,p:0,a:0};return s;}
function p88On(){return !p88Set().off;}
/* 覚えている確率（t 日たったとき） */
function p88R(t,s){return Math.pow(1+P88_F*Math.max(0,t)/Math.max(0.05,s),P88_DECAY);}
/* 覚えている確率が r まで下がる日数 */
function p88Ivl(s,r){return s/P88_F*(Math.pow(r,1/P88_DECAY)-1);}
function p88Clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function p88D0(g){return p88Clamp(P88_W[4]-(g-3)*P88_W[5],1,10);}
/* 1回答えたあとの記憶の強さ・むずかしさ（g：1=まちがえた 2=うろ覚え 3=できた、t：前の復習からの日数） */
function p88Step(fs,g,t){
  var W=P88_W;
  if(!fs)return {s:P88_S0[g],d:p88D0(g),n:1,l:g===1?1:0};
  var s=fs.s,d=fs.d,R=p88R(t,s),ns;
  if(g===1){ns=Math.min(s,W[11]*Math.pow(d,-W[12])*(Math.pow(s+1,W[13])-1)*Math.exp(W[14]*(1-R)));}
  else{ns=s*(1+Math.exp(W[8])*(11-d)*Math.pow(s,-W[9])*(Math.exp(W[10]*(1-R))-1)*(g===2?W[15]:1));}
  var nd=d-W[6]*(g-3);nd=W[7]*p88D0(4)+(1-W[7])*nd;
  return {s:+p88Clamp(ns,0.1,3650).toFixed(2),d:+p88Clamp(nd,1,10).toFixed(2),n:(fs.n||0)+1,l:(fs.l||0)+(g===1?1:0)};
}
/* 次の復習までの日数（合わせ係数 k と目標 r を反映） */
function p88Days(s){var S=p88Set();return p88Clamp(Math.round(p88Ivl(s,S.r)*S.k),1,P88_MAX);}
/* 前の方式で覚えた単語：今の間隔を記憶の強さの目安にする */
function p88Guess(p){
  if(p.fs)return p.fs;
  if(!p.lastReviewed||p.status==="new")return null;
  var iv=p.intervalDays||0;if(!(iv>0))iv=[0,1,3,7,14,30,60,120][Math.min(7,p.intervalStep||0)]||0.4;
  return {s:Math.max(0.4,iv),d:5,n:p.correctCount||1,l:p.wrongCount||0};
}
/* 予想と実際の答えを集計して、50回ごとに係数 k を少しずつ直す */
function p88Calib(pred,ok){
  var S=p88Set(),c=S.c;c.n++;c.p+=pred;c.a+=ok?1:0;
  if(c.n>=50){
    var p=p88Clamp(c.p/c.n,0.5,0.99),a=p88Clamp(c.a/c.n,0.5,0.99);
    /* 覚えている確率の式から：実際の率 a に合う強さ ÷ 予想の強さ。急に変わらないよう半分だけ動かす */
    var ratio=(Math.pow(p,-2)-1)/(Math.pow(a,-2)-1);
    S.k=+p88Clamp(S.k*p88Clamp(Math.sqrt(ratio),0.85,1.18),0.4,2.5).toFixed(3); /* 1回で動かすのは 0.85〜1.18倍まで（50回では数%の偶然のぶれがあるため） */
    S.hist=(S.hist||[]).concat([[todayKey(),Math.round(a*100),Math.round(p*100),S.k]]).slice(-12);
    S.c={n:0,p:0,a:0};
  }
}
/* 1回の答えを反映する（単語・作文の両方で使う）。g:1/2/3。戻り値は次の復習までの日数（まちがえたら 0） */
function p88Apply(p,g,prevLast){
  var t=prevLast?(now()-prevLast)/P88_DAY:0,old=p88Guess(p);
  if(old&&prevLast&&t>=0.5){var S=p88Set();p88Calib(p88R(t,old.s*S.k),g>1);}
  var fs=p88Step(prevLast?old:null,g,t);p.fs=fs;
  if(g===1)return 0; /* まちがえたとき：10分後のもう一度は前のまま */
  var days=p88Days(fs.s);p.intervalDays=days;p.nextReview=now()+days*P88_DAY;return days;
}
function p88G(kind){return kind==="ok"?3:kind==="maybe"?2:1;}
/* 答えた直後に「次の復習は ◯ 日後」と見せるための予想（記録は変えない） */
function p88Preview(id,kind){
  var p=progress[id];if(!p)return P88_S0[p88G(kind)]?p88Days(P88_S0[p88G(kind)]):1;
  var t=p.lastReviewed?(now()-p.lastReviewed)/P88_DAY:0,old=p88Guess(p);
  return p88Days(p88Step(p.lastReviewed?old:null,p88G(kind),t).s);
}

/* ---- 単語（カード・4択・レッスンの終わり）：answer を包む ---- */
var _p88Answer=answer;
answer=function(id,kind){
  var p0=progress[id],prev=p0?p0.lastReviewed:null;
  var r=_p88Answer.apply(this,arguments);
  try{if(p88On()&&progress[id]){p88Apply(progress[id],p88G(kind),prev);saveAll();}}catch(_){}
  return r;
};
/* ---- 瞬間作文：composeAnswer を包む ---- */
var _p88CAnswer=composeAnswer;
composeAnswer=function(id,kind){
  var p0=cprogress[id],prev=p0?p0.lastReviewed:null;
  var r=_p88CAnswer.apply(this,arguments);
  try{if(p88On()&&cprogress[id]){p88Apply(cprogress[id],p88G(kind),prev);saveAll();}}catch(_){}
  return r;
};
/* ---- ほかのモードで答えた結果も、その単語の復習に数える（同じ単語を何度も別々に復習しない） ----
   到達テスト：もう習った単語に正解したら、その日の復習をすませたことにする。
   到達テスト・検定対策：習った単語をまちがえたら、すぐ復習に出す（記憶の強さは次の復習で直る）。
   レッスン・冒険はレッスンの終わりに answer() が呼ばれるので、ここでは何もしない。 */
if(typeof coachLog==="function"){
  var _p88Log=coachLog;
  coachLog=function(o){
    var r=_p88Log.apply(this,arguments);
    try{
      if(!p88On()||!o||(o.m!=="test"&&o.m!=="trki"))return r;
      var ids=[];if(o.ok){if(o.m==="test"&&WMAP[o.id])ids=[o.id];}else ids=(o.w||[]).filter(function(id){return WMAP[id];});
      var ch=0;
      ids.forEach(function(id){
        var p=progress[id];if(!p||p.status==="new"||!p.lastReviewed)return;
        if(o.ok){if(!isDue(id))return;var prev=p.lastReviewed;p.lastReviewed=now();p.correctCount=(p.correctCount||0)+1;p88Apply(p,3,prev);ch=1;}
        else if(p.nextReview>now()){p.nextReview=now();ch=1;}
      });
      if(ch)saveAll();
    }catch(_){}
    return r;
  };
}
/* ---- 4択の「次の復習は ◯ 日後の予定です」を、新しい計算の日数に ---- */
if(typeof renderStudy==="function"){
  var _p88Study=renderStudy;
  renderStudy=function(){
    var h=_p88Study.apply(this,arguments);
    try{if(p88On()&&typeof h==="string"&&h.indexOf("次の復習は ")>=0){var s=ui.session,id=s&&s.list&&s.list[s.pos];
      if(id)h=h.replace(/次の復習は \d+ 日後の予定です/,"次の復習は "+p88Preview(id,"ok")+" 日後の予定です");}}catch(_){}
    return h;
  };
}

/* ===== 画面：勉強時間を短くするしくみ ===== */
/* 次の30日の復習回数の目安：全部正解したと仮定して、新しい方式と前の固定の間隔で数える */
function p88Forecast(){
  var end=now()+30*P88_DAY,a=0,b=0,L=[1,3,7,14,30,60,120];
  Object.keys(progress).forEach(function(id){
    var p=progress[id];if(!WMAP[id]||!p||p.status==="new"||!p.nextReview)return;
    var fs=p88Guess(p);if(!fs)return;
    var t=Math.max(now(),p.nextReview),s=fs.s,d=fs.d,g=0;
    while(t<=end&&g<40){a++;g++;var iv=p88Days(s);var nx=p88Step({s:s,d:d,n:1,l:0},3,iv);s=nx.s;d=nx.d;t+=iv*P88_DAY;}
    var st=p.intervalStep||0;t=Math.max(now(),p.nextReview);g=0;
    while(t<=end&&g<40){b++;g++;st++;t+=L[Math.min(st-1,L.length-1)]*P88_DAY;}
  });
  return {a:a,b:b};
}
function p88Stats(){
  var n=0,str=0;Object.keys(progress).forEach(function(id){var p=progress[id];if(WMAP[id]&&p&&p.fs){n++;str+=p.fs.s;}});
  return {n:n,avg:n?Math.round(str/n):0};
}
function p88Html(){
  var S=p88Set(),on=!S.off,f=on?p88Forecast():null,st=p88Stats(),c=S.c,h='';
  /* ---- かんたんな説明（初めて見る人向け。結論→数え方→目安→できること の順） ---- */
  var per=20;try{per=p85SecPerQ();}catch(_){}
  var save=(on&&f&&f.b>f.a)?Math.round((f.b-f.a)*per/60):0;
  h+='<div class="p88-lead"><b>短くなるのは「復習」の時間です。</b>もう覚えている単語は出す間隔をどんどん空け、忘れかけた単語だけを出します。新しい単語を覚える時間は変わりません。</div>';
  if(on&&f&&(f.a||f.b)){
    h+='<div class="p81-box p88-num"><div><span>次の30日の復習（目安）</span><b>'+f.a+'<small> 回</small></b></div><div><span>前の方式なら</span><b>'+f.b+'<small> 回</small></b></div></div>'+
       (save>0?'<div class="p88-save">この30日で、復習の時間が <b>約'+save+'分</b> 少なくなる見込みです</div>':'')+
       (f.a>f.b?'<div class="p88-note">あなたの記録では予想より忘れやすいので、前の方式より早めに復習を出しています（忘れてから覚え直すより短くすみます）。</div>':'')+
       '<div class="p88-note">全部正解したと仮定した計算です（1問 約'+per+'秒で計算）。何時間短くなったかを実際に測った数字ではありません。</div>';
  }else if(on){h+='<div class="p88-note">単語をいくつか学ぶと、ここに「次の30日の復習回数」と、前の方式との差が出ます。</div>';}
  /* 勉強時間の数え方 */
  h+='<div class="p81-h" style="margin-top:16px">勉強時間の数え方</div><div class="p81-box p88-me">'+
     '<div>問題が画面に出てから<b>答えるまでの時間だけ</b>を数えます。</div>'+
     '<div>ほかのアプリを開いていた時間は引きます。1問は長くても<b>2分まで</b>です。</div>'+
     '<div>弱点の講義と文法書は、<b>読んでいる時間も</b>数えます。ただし<b>1分なにも操作しないと止まり</b>、画面に触れるとまた数え始めます（開きっぱなしは数えません）。</div></div>';
  /* レベルまでの目安（検定対策の「合格まで」と同じ数字。ロシア語版だけ） */
  if(typeof P47_LANG==="undefined"||P47_LANG==="ru"){
    var tot=0;try{tot=p85Totals().s;}catch(_){}
    h+='<div class="p81-h" style="margin-top:16px">レベルまでにかかる時間の目安</div><div class="p81-box p88-lv">'+
       [["入門","A1","ТЭУ",150],["基礎","A2","ТБУ",350],["第1レベル","B1","ТРКИ-1",700]].map(function(r){return '<div><span>'+r[0]+'（'+r[1]+'・'+r[2]+'）</span><b>約'+r[3]+'時間</b></div>';}).join("")+
       '</div><div class="p88-note">はじめてからの合計の目安です（一般的な学習時間の目安をもとにした大まかな数字で、人によって大きく変わります）。いまのあなたの合計は <b>'+(function(){try{return p85HM(tot);}catch(_){return Math.round(tot/60)+"分";}})()+'</b> です。</div>';
  }
  /* 自分でできること */
  h+='<div class="p81-h" style="margin-top:16px">もっと短くするためにできること</div><div class="p81-box p88-me">'+
     '<div><b>1. 毎日すこしずつ</b>：週末にまとめて2時間より、毎日15分のほうが少ない時間で長く覚えていられます。</div>'+
     '<div><b>2. 復習の日を飛ばさない</b>：期限を大きく過ぎると忘れてしまい、覚え直しに時間がかかります。</div>'+
     '<div><b>3. 答えを見る前に思い出す</b>：「わからない」をすぐ押さず、数秒だけ思い出そうとすると記憶に残ります。</div></div>';
  h+='<div class="p81-h" style="margin-top:22px">くわしい設定</div>';
  /* 目標の覚えている率（時間と確実さの交換） */
  h+='<div class="p81-h" style="margin-top:16px">どれくらい確実に覚えておく？</div><div class="p88-seg" role="group" aria-label="目標">'+
     [[0.85,"時間を優先","85%"],[0.9,"ふつう","90%"],[0.95,"確実さを優先","95%"]].map(function(o){return '<button type="button" class="'+(S.r===o[0]?"on":"")+'" data-act="p88r" data-val="'+o[0]+'"><b>'+o[1]+'</b><small>'+o[2]+'</small></button>';}).join("")+'</div>'+
     '<div class="p88-note">復習のときに思い出せる確率の目標です。上げるほど復習が増えます（90%→95%で、間隔はおよそ半分になります）。試験の直前は「確実さを優先」がおすすめです。</div>';
  /* あなたに合わせた結果 */
  h+='<div class="p81-h" style="margin-top:16px">あなたに合わせた結果</div><div class="p81-box p88-me">';
  var last=(S.hist||[]).slice(-1)[0];
  if(last)h+='<div>前回の集計：実際に覚えていた率 <b>'+last[1]+'%</b>（予想 '+last[2]+'%）</div>';
  h+='<div>間隔の合わせ係数：<b>×'+(S.k||1).toFixed(2)+'</b>'+(last?'':'（50回復習すると、あなたの結果で自動で直します。いま '+c.n+' / 50）')+'</div>';
  if(st.n)h+='<div>新しい方式で記録している単語：'+st.n+' 語（記憶の強さの平均 約'+st.avg+'日）</div>';
  h+='</div>';
  /* しくみと根拠 */
  h+='<div class="p81-h" style="margin-top:16px">しくみと、その根拠</div><div class="p88-why">'+
    p88Why("間をあけて復習する","すでに入っています","同じ回数なら、続けて詰めこむより、日をあけて復習したほうが長く覚えていられます。多くの実験をまとめた研究で、いちばん確かめられている方法の1つです。","根拠：強い")+
    p88Why("見て覚えるより、思い出す","すでに入っています","答えを見る前に自分で思い出そうとすると、読み直すより記憶に残ります（テスト効果）。このアプリの問題形式はこれにあたります。","根拠：強い")+
    p88Why("間隔を単語ごとに変える","新しく追加","やさしい単語は間隔を大きく伸ばし、むずかしい単語は短くします。前は全部の単語が同じ間隔でした。大量の学習記録で比べた公開データでは、固定の間隔より少ない復習で同じくらい覚えていられる結果が出ています。","根拠：中くらい（学習記録の分析が中心）")+
    p88Why("まちがえてもゼロにしない","新しく追加","一度覚えた単語は、忘れても思い出しなおすのが早くなります。前は1日からやり直していましたが、これまでの記憶の強さを少し下げるだけにしました。","根拠：中くらい")+
    p88Why("同じ日の繰り返しで間隔を伸ばさない","新しく追加","その場で何度も正解しても、長い記憶はあまり増えません（覚えすぎの効果は時間がたつと消えやすい）。同じ日の正解では間隔を伸ばさないので、むだな繰り返しが減ります。","根拠：中くらい")+
    p88Why("ほかのモードの答えも数える","新しく追加","到達テストで習った単語に正解したら、その日の復習をすませたことにします。到達テスト・検定対策でまちがえた単語は、すぐ復習に出します。","根拠：考え方（同じ記憶を2回別々に復習しない）")+
    '</div>'+
    '<div class="p88-note">確認できていないこと：このアプリ自身で「何時間短くなるか」はまだ測っていません。数字は上の目安と、実際に覚えていた率で確かめていきます。</div>';
  h+='<div class="p81-box" style="margin-top:14px"><button type="button" class="p81-row" data-act="p88off"><span class="p81-rtx"><b>'+(on?"前の固定の間隔にもどす":"単語ごとに合わせる方式を使う")+'</b><small>'+(on?"1・3・7・14・30・60・120日の順に戻します":"いまは前の固定の間隔です")+'</small></span></button></div>';
  return h;
}
function p88Why(t,st,x,ev){return '<div class="p88-w"><div class="p88-wt"><b>'+t+'</b><span class="'+(st.indexOf("新しく")===0?"new":"")+'">'+st+'</span></div><p>'+x+'</p><small>'+ev+'</small></div>';}
function p88Sheet(){var m=document.getElementById("p88sheet");if(!m){m=document.createElement("div");m.id="p88sheet";document.body.appendChild(m);}return m;}
function p88Open(){
  var m=p88Sheet(),y=0;var pb=m.querySelector(".p81-pb");if(pb)y=pb.scrollTop;
  m.innerHTML='<div class="p81-mask" data-act="p88close"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="勉強時間を短くするしくみ"><div class="p81-ph"><b>勉強時間を短くするしくみ</b><button type="button" class="p81-x" data-act="p88close" aria-label="閉じる">'+p81Ic("x",18)+'</button></div><div class="p81-pb">'+p88Html()+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");pb=m.querySelector(".p81-pb");if(pb)pb.scrollTop=y;
}
function p88Close(){var m=p88Sheet();m.className="";m.innerHTML="";document.body.classList.remove("p81-open");}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");if(a.indexOf("p88")!==0)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p88open")p88Open();
  else if(a==="p88close"){p88Close();try{render();}catch(_){}}
  else if(a==="p88r"){p88Set().r=+el.getAttribute("data-val");try{saveAll();}catch(_){}p88Open();}
  else if(a==="p88off"){var S=p88Set();if(S.off)delete S.off;else S.off=1;try{saveAll();}catch(_){}p88Open();}
},true);
try{if(typeof P81_IC==="object"&&!P81_IC.clock)P81_IC.clock='<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>';}catch(_){}
/* 「このあと」シートの「ほかのやり方」に入口を1行足す（ホームにはカードを足さない） */
if(typeof p87PlanHtml==="function"){
  var _p88Plan=p87PlanHtml;
  p87PlanHtml=function(){
    var h=String(_p88Plan.apply(this,arguments));
    var row='<button type="button" class="p81-row" data-act="p87go" data-val="p88open"><span class="p81-ric">'+p81Ic("clock",20)+'</span><span class="p81-rtx"><b>勉強時間を短くするしくみ</b><small>復習の間隔を単語ごとに合わせる'+(p88On()?'':'（いまは止めています）')+'</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button>';
    var i=h.lastIndexOf("</div>");return i>=0?h.slice(0,i)+row+h.slice(i):h+row;
  };
}
(function(){
  var css='#p88sheet{display:none}#p88sheet.show{display:block;position:fixed;inset:0;z-index:211}'+
    '.p88-lead{font-size:14.5px;line-height:1.75;padding:2px 2px 12px}'+
    '.p88-num{display:grid;grid-template-columns:1fr 1fr}.p88-num>div{padding:12px 14px;display:flex;flex-direction:column;gap:2px}.p88-num>div+div{border-left:1px solid var(--line)}'+
    '.p88-num span{font-size:12px;color:var(--muted);font-weight:600}.p88-num b{font-size:26px;font-weight:800;font-variant-numeric:tabular-nums}.p88-num>div+div b{color:var(--muted)}.p88-num small{font-size:13px;font-weight:600;color:var(--muted)}'+
    '.p88-save{margin-top:8px;padding:10px 14px;border-radius:12px;border:1px solid var(--accent);font-size:14px;line-height:1.6}.p88-save b{font-size:17px;color:var(--accent)}'+
    '.p88-lv>div{display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:9px 14px;font-size:13.5px}.p88-lv>div+div{border-top:1px solid var(--line)}.p88-lv b{font-variant-numeric:tabular-nums;white-space:nowrap}'+
    '.p88-note{font-size:12.5px;line-height:1.7;color:var(--muted);padding:8px 2px 0}'+
    '.p88-seg{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.p88-seg button{min-height:52px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--text);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;font:inherit;padding:6px 4px}'+
    '.p88-seg button b{font-size:13.5px}.p88-seg button small{font-size:12px;color:var(--muted)}.p88-seg button.on{border:2px solid var(--accent)}.p88-seg button.on small{color:var(--accent);font-weight:700}'+
    '.p88-me>div{padding:9px 14px;font-size:13.5px;line-height:1.6}.p88-me>div+div{border-top:1px solid var(--line)}'+
    '.p88-why{display:flex;flex-direction:column;gap:8px}.p88-w{border:1px solid var(--line);border-radius:12px;padding:11px 13px;background:var(--card)}'+
    '.p88-wt{display:flex;align-items:center;justify-content:space-between;gap:8px}.p88-wt b{font-size:14.5px}.p88-wt span{font-size:11.5px;font-weight:700;color:var(--muted);white-space:nowrap;border:1px solid var(--line);border-radius:99px;padding:2px 8px}.p88-wt span.new{color:var(--accent);border-color:var(--accent)}'+
    '.p88-w p{margin:6px 0 4px;font-size:13.5px;line-height:1.75}.p88-w small{font-size:12px;color:var(--muted);font-weight:600}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* 記録の画面の「勉強時間」カードの下にも入口を置く（ロシア語版でだけカードが出る） */
if(typeof p85TimeCard==="function"){
  var _p88Time=p85TimeCard;
  p85TimeCard=function(){
    var h=String(_p88Time.apply(this,arguments)),i=h.lastIndexOf("</div>");
    var btn='<button type="button" class="p81-row p88-from" data-act="p88open"><span class="p81-rtx"><b>勉強時間を短くするしくみ</b><small>どう短くなるか・数え方・レベルまでの目安</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button>';
    return i>=0?h.slice(0,i)+btn+h.slice(i):h+btn;
  };
}
