/* ===== PHASE85: AI学習コーチ 手順1 ― 1問ごとの学習記録 =====
   2026-11-27 Yuta の要望。「解いた問題・正誤・かかった時間・間違えた単語/文法・日時」を毎回のこす。
   - 今までの記録（appHist.days の日ごとの合計、progress の単語ごとの成績）はそのまま。横に新しい記録を足すだけ。
   - 時間は「実際に解いている時間」だけ：問題が画面に出た時刻から答えた時刻まで。
     画面が隠れていた間（別のアプリ・画面オフ）は引き、1問 120 秒を上限にする（開いたまま放置しても増えない）。
   - 記録の形（1件）：[t 秒の時刻, m モード, id 問題ID, ok 1/0, s 秒, g 文法タグ[] or 0, w 間違えた単語ID[] or 0]
     モード m：lesson（一歩レッスン・冒険）/ fav（お気に入り）/ gp（文法解説書の練習）/ card（単語カード）/ quiz（4択）
               / compose（瞬間作文）/ test（到達テスト）/ trki（試験対策、phase86 から coachLog で入る）
   - 保存先：メモリ上は P85.log = {"2026-11":[…], …}（月ごと）。
     端末（localStorage）には直近2か月だけ（容量の上限で他の記録まで保存できなくなるのを防ぐため）。
     クラウド（phase50 の data/users/<uid>）には全部。月ごとの文書 "lg2026-11"、4000件ごとに "lg2026-11.1" … と分ける。
     2台の端末で解いた記録は、読み込むときに足し合わせる（上書きしない）。
   ほかの phase から記録するときは coachLog({m:"モード", id:"問題ID", ok:true/false, s:秒(省略可), g:[文法], w:[単語ID]}) を呼ぶ。 */
var P85_MAX_SEC=120,P85_CHUNK=4000,P85_LOCAL_MONTHS=2;
var P85={mark:Date.now(),key:"",hid:0,hidAt:0,skip:0,lkey:K.set+"_p85log"};
P85.log=(function(){var o=lget(P85.lkey,{});return (o&&typeof o==="object")?o:{};})();
function p85Month(tSec){var d=new Date(tSec*1000);return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0");}
/* 同じ記録かどうか（2台の端末の記録を足し合わせるとき、同じものを2回数えない） */
function p85Sig(e){return e[0]+"|"+e[1]+"|"+e[2]+"|"+e[3];}
function p85Merge(month,arr){
  if(!Array.isArray(arr))return 0;var cur=P85.log[month]||(P85.log[month]=[]),have={},n=0;
  cur.forEach(function(e){have[p85Sig(e)]=1;});
  arr.forEach(function(e){if(Array.isArray(e)&&e.length>=5&&!have[p85Sig(e)]){cur.push(e);have[p85Sig(e)]=1;n++;}});
  if(n)cur.sort(function(a,b){return a[0]-b[0];});return n;
}
/* 端末には直近の月だけ書く */
function p85SaveLocal(){
  var ms=Object.keys(P85.log).sort().slice(-P85_LOCAL_MONTHS),o={};ms.forEach(function(m){o[m]=P85.log[m];});
  lset(P85.lkey,o);
}
/* ---- いま解いている問題の「出た時刻」を覚える ---- */
function p85QKey(){
  try{
    if(typeof P71!=="undefined"&&P71&&!P71.confirm&&!P71.fin){var x=P71.steps[P71.pos];if(x&&x.t!=="card"&&x.t!=="memo")return "71:"+P71.pos+":"+(P71.fav?1:0)+":"+P71.ti+":"+P71.li;}
    if(ui.view==="p58test"&&ui.p58&&!ui.p58.done)return "58:"+ui.p58.pos;
    if(ui.composeSession&&ui.view==="compose")return "c:"+ui.composeSession.pos;
    if(ui.session&&ui.session.list)return "s:"+ui.session.pos+":"+ui.session.list[ui.session.pos];
  }catch(_){}
  return "";
}
function p85Tick(){var k=p85QKey();if(k&&k!==P85.key){P85.mark=Date.now();P85.hid=0;}P85.key=k;}
function p85Elapsed(){
  var now=Date.now(),hid=P85.hid+(P85.hidAt?now-P85.hidAt:0);
  var s=Math.round((now-P85.mark-hid)/1000);return Math.max(1,Math.min(P85_MAX_SEC,s));
}
document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="hidden"){P85.hidAt=Date.now();}
  else if(P85.hidAt){P85.hid+=Date.now()-P85.hidAt;P85.hidAt=0;}
});
/* ---- 記録する（ほかの phase からも呼べる） ---- */
function coachLog(o){
  try{
    if(!o||!o.m)return;
    var t=Math.floor(Date.now()/1000);
    var s=(typeof o.s==="number"&&o.s>=0)?Math.min(P85_MAX_SEC,Math.round(o.s)):p85Elapsed();
    var g=(o.g&&o.g.length)?o.g.filter(Boolean).map(String):0,w=(o.w&&o.w.length)?o.w.filter(Boolean).map(String):0;
    var e=[t,String(o.m),String(o.id||""),o.ok?1:0,s,g&&g.length?g:0,w&&w.length?w:0];
    var m=p85Month(t);(P85.log[m]||(P85.log[m]=[])).push(e);
    /* 次の問題（2段階の穴埋めの②など）は、いま答えた時刻から数える */
    P85.mark=Date.now();P85.hid=0;
    p85SaveLocal();
    try{if(typeof p50Schedule==="function")p50Schedule();}catch(_){}
  }catch(_){}
}
/* 記録を新しい順に n 件まで（あとの手順で使う） */
function p85Recent(days){
  var from=Math.floor(Date.now()/1000)-days*86400,out=[];
  Object.keys(P85.log).sort().forEach(function(m){P85.log[m].forEach(function(e){if(e[0]>=from)out.push(e);});});
  return out;
}
/* ---- 各モードの「答えた」ところにつなぐ ---- */
/* 1) 一歩レッスン・冒険・お気に入り・文法の練習（p71Grade。文字を並べる・書く問題も同じ） */
var _p85Grade=p71Grade;
p71Grade=function(x,ok){
  var r=_p85Grade.apply(this,arguments);
  try{
    var S=P71,w=WMAP[x.id],g=[];
    if(x.c&&x.c.forms&&w){var lab=x.c.forms.lab[x.c.forms.key]||"";try{g=p72Topics(w,lab,x.c.f);}catch(_){}if(lab)g.push("f:"+lab);}
    var m=S&&S.fav?(S.gp?"gp":"fav"):"lesson";
    coachLog({m:m,id:x.id,ok:ok,g:g,w:ok?[]:[x.id],kind:x.t});
  }catch(_){}
  return r;
};
/* レッスンの終わりにまとめて呼ばれる answer() は、1問ずつ記録ずみなので数えない */
var _p85Finish=p71Finish;
p71Finish=function(){P85.skip++;try{return _p85Finish.apply(this,arguments);}finally{P85.skip--;}};
/* 2) 文法解説書の章の練習問題（phase82 の t:"gq"）は、phase82 の p82Pick の中から coachLog を呼ぶ（関数が外から見えないため） */
/* 3) 単語カード・4択（answer）と瞬間作文（composeAnswer） */
var _p85Answer=answer;
answer=function(id,kind){
  var r=_p85Answer.apply(this,arguments);
  if(!P85.skip){try{var s=ui.session,m=(s&&s.p52)?"quiz":"card";coachLog({m:m,id:id,ok:kind==="ok",w:kind==="ok"?[]:[id]});}catch(_){}}
  return r;
};
var _p85CAnswer=composeAnswer;
composeAnswer=function(id,kind){
  var r=_p85CAnswer.apply(this,arguments);
  try{var c=CMAP[id];coachLog({m:"compose",id:id,ok:kind==="ok",g:c&&c.grammarPoint?[String(c.grammarPoint).slice(0,40)]:[],w:[]});}catch(_){}
  return r;
};
/* 4) 到達テスト（phase58 のクリックより先に、window のキャプチャで答えを読む） */
window.addEventListener("click",function(e){
  try{
    var el=e.target&&e.target.closest?e.target.closest('[data-act="p58pick"]'):null;if(!el)return;
    var T=ui.p58;if(!T||T.done)return;var it=T.items[T.pos];if(!it)return;
    var ok=(+el.getAttribute("data-val"))===it.ans,c=it.cid&&CMAP[it.cid];
    coachLog({m:"test",id:it.kind==="vocab"?it.id:(it.cid||""),ok:ok,g:["t:"+it.sec].concat(it.kind==="gram"&&c&&c.grammarPoint?[String(c.grammarPoint).slice(0,40)]:[]),w:(!ok&&it.kind==="vocab")?[it.id]:[]});
  }catch(_){}
},true);
/* ---- 画面が変わるたびに「問題が出た時刻」を更新する ---- */
var _p85Render=render;
render=function(){var r=_p85Render.apply(this,arguments);try{p85Tick();}catch(_){}return r;};
var _p85R71=p71Render;
p71Render=function(){var r=_p85R71.apply(this,arguments);try{p85Tick();}catch(_){}return r;};

/* ---- クラウド保存（phase50）に月ごとの記録を足す ---- */
var _p85Payloads=p50Payloads;
p50Payloads=function(){
  var o=_p85Payloads.apply(this,arguments);
  Object.keys(P85.log).forEach(function(m){var a=P85.log[m]||[];
    for(var i=0;i*P85_CHUNK<a.length||i===0;i++){o["lg"+m+(i?"."+i:"")]=a.slice(i*P85_CHUNK,(i+1)*P85_CHUNK);if(!a.length)break;}});
  return o;
};
var _p85Adopt=p50Adopt;
p50Adopt=function(docId,obj){
  var mm=/^lg(\d{4}-\d{2})(\.\d+)?$/.exec(docId);
  if(mm){if(p85Merge(mm[1],obj))p85SaveLocal();return;}
  return _p85Adopt.apply(this,arguments);
};

/* ---- 記録の画面：「1問ごとの記録」カード（ロシア語版だけ。キルギス語版は確認してから） ---- */
function p85Sum(list){var n=list.length,ok=0,s=0;list.forEach(function(e){ok+=e[3];s+=e[4];});return {n:n,ok:ok,s:s,pct:n?Math.round(ok/n*100):0};}
function p85Min(sec){return sec<60?(sec?"1分未満":"0分"):Math.round(sec/60)+"分";}
var P85_MODE={lesson:"レッスン",fav:"お気に入り",gp:"文法の練習",card:"単語カード",quiz:"4択",compose:"瞬間作文",test:"到達テスト",trki:"試験対策"};
function p85Card(){
  var tk=todayKey(),all=p85Recent(7),today=all.filter(function(e){return todayKey(new Date(e[0]*1000))===tk;});
  var T=p85Sum(today),W=p85Sum(all);
  var h='<div class="p60-h">1問ごとの記録<small>実際に解いた時間だけ</small></div><div class="p60-list p85-card">';
  if(!all.length){
    return h+'<div class="p85-empty">まだ記録がありません。今日から、問題を1問解くごとに「正解か・何秒かかったか・どの言葉と文法か」を記録します。</div></div>';
  }
  h+='<div class="p85-grid"><div><span>今日</span><b>'+T.n+'<small> 問</small></b><em>'+(T.n?T.pct+'% 正解':'まだ')+'</em><i>'+p85Min(T.s)+'</i></div>'+
     '<div><span>この7日</span><b>'+W.n+'<small> 問</small></b><em>'+W.pct+'% 正解</em><i>'+p85Min(W.s)+'</i></div></div>';
  /* よくまちがえる言葉（この7日） */
  var bad={};all.forEach(function(e){if(!e[3]&&e[6])e[6].forEach(function(id){bad[id]=(bad[id]||0)+1;});});
  var top=Object.keys(bad).filter(function(id){return WMAP[id];}).sort(function(a,b){return bad[b]-bad[a];}).slice(0,5);
  if(top.length)h+='<div class="p85-sub">この7日でまちがえた言葉</div>'+top.map(function(id){var w=WMAP[id];return '<div class="p85-row"><b>'+esc(w.accent||w.word)+'</b><span>'+esc(w.meaning)+'</span><em>'+bad[id]+'回</em></div>';}).join("");
  /* 最近の5問 */
  var last=all.slice(-5).reverse();
  h+='<div class="p85-sub">最近解いた問題</div>'+last.map(function(e){var d=new Date(e[0]*1000),w=WMAP[e[2]],c=CMAP[e[2]];
    var nm=w?(w.accent||w.word):(c?(c.ru||""):e[2]);
    return '<div class="p85-row"><span class="p85-ok '+(e[3]?"ok":"ng")+'">'+(e[3]?"○":"×")+'</span><b>'+esc(String(nm).slice(0,28))+'</b><span>'+esc(P85_MODE[e[1]]||e[1])+'</span><em>'+e[4]+'秒 ・ '+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+'</em></div>';}).join("");
  return h+'</div>';
}
var _p85Stats=renderP48Stats;
renderP48Stats=function(){
  var h=String(_p85Stats.apply(this,arguments));
  if(P47_LANG!=="ru")return h;
  try{var i=h.indexOf('<div class="p60-h">レベル</div>');var c=p85Card();h=i>=0?h.slice(0,i)+c+h.slice(i):h+c;}catch(_){}
  return h;
};
(function(){
  var css='.p85-card{padding:4px 0 6px}.p85-empty{padding:14px;font-size:13.5px;line-height:1.7;color:var(--muted)}'+
    '.p85-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid var(--line)}.p85-grid>div{padding:12px 14px;display:flex;flex-direction:column;gap:2px}.p85-grid>div+div{border-left:1px solid var(--line)}'+
    '.p85-grid span{font-size:12px;color:var(--muted);font-weight:600}.p85-grid b{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}.p85-grid b small{font-size:13px;font-weight:600;color:var(--muted)}'+
    '.p85-grid em{font-style:normal;font-size:13px;font-weight:700}.p85-grid i{font-style:normal;font-size:12.5px;color:var(--muted)}'+
    '.p85-sub{font-size:12px;font-weight:700;color:var(--muted);padding:12px 14px 4px}'+
    '.p85-row{display:flex;align-items:baseline;gap:8px;padding:7px 14px;font-size:14px;min-width:0}.p85-row b{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:48%}.p85-row span{color:var(--muted);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'+
    '.p85-row em{margin-left:auto;font-style:normal;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}'+
    '.p85-ok{font-weight:800;font-size:13px;flex:0 0 auto}.p85-ok.ok{color:var(--accent)}.p85-ok.ng{color:#D9480F}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE85 手順2：今日やること（3つ・理由つき・使える時間で量を合わせる） =====
   Yuta の選択（2026-11-27）：毎日の提案はアプリの中の計算で出す（すぐ出る・通信なしで動く）。AI は週次レポートだけ。
   設定：settings.p85 = {min:15|30|60（使える時間）, exam:{name,date,goal}（手順3）}
   考えること：
     ① 忘れかけ：復習の日をすぎた単語（progress の nextReview）。多いほど先に。
     ② 弱点：この14日の記録で正答率がいちばん低い文法の章（3問以上解いたもの）。なければ、よくまちがえる言葉。
     ③ 新しい言葉：次のレッスン。試験日があれば、残りの日数で割ったペースを理由に出す（手順3）。
     記録がまだ少ない人には、最初に到達テスト（実力の診断）をすすめる。
   量：1問あたりの時間は、記録の平均（実際に解いた秒）×1.5（解説を読む時間のぶん）。記録がなければ 20 秒。 */
function p85Set(){if(!settings.p85||typeof settings.p85!=="object")settings.p85={};var s=settings.p85;if([15,30,60].indexOf(s.min)<0)s.min=30;return s;}
function p85SecPerQ(){var a=p85Recent(14);if(a.length<20)return 20;var s=0;a.forEach(function(e){s+=e[4];});return Math.max(10,Math.min(45,Math.round(s/a.length*1.5)));}
/* 章の名前（文法解説書の目次から） */
function p85ChName(id){var g=(window.P72_GUIDE||[]).filter(function(c){return c.id===id;})[0];return g?String(g.t).replace(/（.*$/,""):"";}
function p85IsCh(id){return !!p85ChName(id);}
/* この14日の、文法の章ごとの正答率（低い順） */
function p85WeakChapters(){
  var st={};p85Recent(14).forEach(function(e){if(!e[5])return;var seen={};e[5].forEach(function(g){if(!p85IsCh(g)||seen[g])return;seen[g]=1;var r=st[g]||(st[g]={n:0,ok:0});r.n++;r.ok+=e[3];});});
  return Object.keys(st).filter(function(g){return st[g].n>=3;}).map(function(g){return {id:g,n:st[g].n,ok:st[g].ok,pct:Math.round(st[g].ok/st[g].n*100)};})
    .filter(function(r){return r.pct<80;}).sort(function(a,b){return a.pct-b.pct||b.n-a.n;});
}
/* この14日でまちがえた回数が多い言葉 */
function p85WeakWords(){
  var bad={};p85Recent(14).forEach(function(e){if(!e[3]&&e[6])e[6].forEach(function(id){if(WMAP[id])bad[id]=(bad[id]||0)+1;});});
  return Object.keys(bad).sort(function(a,b){return bad[b]-bad[a];});
}
function p85DueIds(){
  var t=now();return Object.keys(progress).filter(function(id){return WMAP[id]&&isDue(id);}).sort(function(a,b){return (progress[a].nextReview||0)-(progress[b].nextReview||0);});
}
function p85LessonsToday(){var n=0,t=todayKey();try{var d=p71St().done;Object.keys(d).forEach(function(k){if(d[k]===t)n++;});}catch(_){}return n;}
function p85TodayLog(){var tk=todayKey();return p85Recent(1).filter(function(e){return todayKey(new Date(e[0]*1000))===tk;});}
/* 試験までの日数（手順3で設定。なければ null） */
function p85DaysLeft(){var x=p85Set().exam;if(!x||!x.date)return null;var d=new Date(x.date+"T00:00:00"),t=new Date(todayKey()+"T00:00:00");return Math.round((d-t)/86400000);}
/* まだ習っていない言葉の数（レッスンで出てくる単語のうち） */
function p85NewLeft(){var n=0;try{P47_THEMES.forEach(function(th){th.ids.forEach(function(id){var p=progress[id];if(!p||p.status==="new")n++;});});}catch(_){}return n;}
/* 今日の3つを作る */
function p85Plan(){
  var S=p85Set(),budget=S.min*60,per=p85SecPerQ(),q=Math.max(10,Math.floor(budget/per));
  var log=p85Recent(30),items=[],todayL=p85TodayLog();
  var due=p85DueIds(),weakCh=p85WeakChapters(),weakW=p85WeakWords(),newLeft=p85NewLeft(),days=p85DaysLeft();
  var lt=appHist.levelTests||{},tested=Object.keys(lt).length>0;
  /* 記録が少なく、到達テストもまだ → まず実力を測る */
  if(!tested&&log.length<30){
    var lv="A1";try{var L=p56LevelState();["A1","A2","B1"].forEach(function(x){if(L[x]&&L[x].pct>=60)lv=x==="A1"?"A2":"B1";});}catch(_){}
    items.push({k:"test",act:"test:"+lv,title:"まず実力を測る（"+lv+" 到達テスト）",amt:"45問 ・ 約15分",
      sec:900,why:"今の力を一度測っておくと、あとで伸びを数字で比べられます。苦手な分野（語彙・文法・読解）も分かります。",done:todayL.some(function(e){return e[1]==="test";})});
  }
  var share={rev:0.3,weak:0.2,newl:0.5};
  /* ① 忘れかけの復習 */
  if(due.length){
    var n=Math.max(5,Math.min(due.length,Math.round(q*share.rev)));
    var doneN=todayL.filter(function(e){return e[1]==="card"||e[1]==="quiz";}).length;
    items.push({k:"rev",act:"rev:"+n,title:"忘れかけた言葉の復習",amt:n+"語 ・ 約"+Math.max(1,Math.round(n*per/60))+"分",
      sec:n*per,why:"前に覚えた言葉のうち "+due.length+" 語が、復習の日をすぎています。忘れる直前に思い出すと、記憶が長く残ります。",done:doneN>=n});
  }
  /* ② 弱点 */
  if(weakCh.length){
    var c=weakCh[0],gpN=todayL.filter(function(e){return e[1]==="gp"&&e[5]&&e[5].indexOf(c.id)>=0;}).length;
    items.push({k:"weak",act:"gp:"+c.id,title:"苦手な文法「"+p85ChName(c.id)+"」",amt:"10問 ・ 約"+Math.max(2,Math.round(10*per/60))+"分",
      sec:10*per,why:"この2週間、この文法の問題は "+c.n+" 問中 "+c.ok+" 問正解（"+c.pct+"%）で、いちばん低い分野です。解説を読んでから解くと効果的です。",done:gpN>=8});
  }else if(weakW.length>=3){
    var ww=weakW.slice(0,Math.max(5,Math.min(20,Math.round(q*share.weak))));
    items.push({k:"weakw",act:"words",title:"よくまちがえる言葉",amt:ww.length+"語 ・ 約"+Math.max(1,Math.round(ww.length*per/60))+"分",
      sec:ww.length*per,why:"この2週間でまちがえた言葉が "+weakW.length+" 語あります。まちがえた言葉だけを続けて解くと、弱点が早く減ります。",done:false,ids:ww});
  }
  /* ③ 新しい言葉（次のレッスン） */
  if(newLeft>0){
    /* 量：ほかの項目で使う時間を引いた残りを、新しいレッスンにあてる（1レッスン約20問） */
    var used=0;items.forEach(function(it){used+=it.sec||0;});
    var perLesson=20,rem=Math.max(budget*0.3,budget-used-(items.length<2?300:0)),ln=Math.min(5,Math.max(1,Math.round(rem/(perLesson*per)))),dn=p85LessonsToday();/* 新しい言葉は1日5レッスン（約30語）まで：多すぎると復習が追いつかない */
    var why="まだ習っていない言葉が "+newLeft.toLocaleString()+" 語あります。1レッスンで約6語ずつ増やします。";
    if(days!=null&&days>0){var need=Math.ceil(newLeft/days);why="試験まであと "+days+" 日。残り "+newLeft.toLocaleString()+" 語を終えるには、1日 "+need+" 語（約"+Math.ceil(need/6)+"レッスン）のペースが必要です。";
      ln=Math.max(ln,Math.min(8,Math.ceil(need/6)));}
    items.push({k:"new",act:"new",title:"新しい言葉のレッスン",amt:ln+"レッスン ・ 約"+Math.round(ln*perLesson*per/60)+"分",why:why,done:dn>=ln,ln:ln});
  }
  /* 3つに足りないとき：話す練習（瞬間作文） */
  if(items.length<3){
    items.push({k:"compose",act:"compose",title:"瞬間作文（話す練習）",amt:"10文 ・ 約5分",
      why:"日本語を見てすぐロシア語で言う練習です。単語と文法を「使える」形にします。試験の話す・書く部分の準備にもなります。",done:todayL.filter(function(e){return e[1]==="compose";}).length>=10});
  }
  return items.slice(0,3);
}
/* ホームの「今日やること」 */
function p85HomeHtml(){
  var S=p85Set(),P=p85Plan(),days=p85DaysLeft(),x=S.exam||{};
  var head='<div class="p85-th"><div><b>今日やること</b>'+
    (days!=null&&days>=0?'<small>'+esc(x.name||"試験")+'まで あと '+days+' 日</small>':'<small>あなたの記録から選びました</small>')+'</div>'+
    '<div class="p85-mins" role="group" aria-label="使える時間">'+[15,30,60].map(function(m){return '<button type="button" class="'+(S.min===m?"on":"")+'" data-act="p85min" data-val="'+m+'">'+m+'分</button>';}).join("")+'</div></div>';
  var rows=P.map(function(it,i){
    return '<button type="button" class="p85-it'+(it.done?" done":"")+'" data-act="p85go" data-val="'+esc(it.act)+'"><span class="p85-num">'+(it.done?'✓':(i+1))+'</span>'+
      '<span class="p85-itx"><b>'+esc(it.title)+'</b><em>'+esc(it.amt)+'</em><small>'+esc(it.why)+'</small></span><span class="p85-go">'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</span></button>';
  }).join("");
  return '<div class="p81-sec p85-today">'+head+'<div class="p81-box">'+rows+'</div></div>';
}
/* 提案のボタンを押したとき */
function p85Go(v){
  var P=p85Plan(),it=P.filter(function(x){return x.act===v;})[0]||{};
  if(v.indexOf("rev:")===0){var n=+v.split(":")[1]||20,ids=p85DueIds().slice(0,n);if(!ids.length){toast("復習の時期の言葉はありません");return;}
    ui.mixQueue=null;clearTransientUI();ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;startSessionFromIds(ids,"今日の復習");return;}
  if(v.indexOf("gp:")===0){p77GpStart(v.slice(3));return;}
  if(v==="words"){var w=it.ids||p85WeakWords().slice(0,15);ui.mixQueue=null;clearTransientUI();ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;startSessionFromIds(w,"よくまちがえる言葉");return;}
  if(v==="new"){p71Start();return;}
  if(v.indexOf("test:")===0){p58Start(v.slice(5));return;}
  if(v==="compose"){var b=document.createElement("button");b.type="button";b.style.display="none";b.setAttribute("data-act","openlearn");b.setAttribute("data-val","compose");document.body.appendChild(b);try{b.click();}finally{b.remove();}return;}
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(a!=="p85min"&&a!=="p85go")return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p85min"){p85Set().min=+el.getAttribute("data-val");try{saveAll();}catch(_){}render();return;}
  if(a==="p85go"){p85Go(el.getAttribute("data-val"));}
},true);
if(typeof renderHome==="function"){
  var _p85Home=renderHome;
  renderHome=function(){
    var h=String(_p85Home.apply(this,arguments));
    if(P47_LANG!=="ru")return h;
    /* 開いてすぐ見えるよう、「今日のチャレンジ」のカードの上に置く */
    try{var i=h.indexOf('<div class="p51-herowrap">');if(i<0)i=h.indexOf('<div class="p81-sec"><div class="p81-h">学び方</div>');if(i>=0)h=h.slice(0,i)+p85HomeHtml()+h.slice(i);}catch(_){}
    return h;
  };
}
(function(){
  var css='.p85-today{margin:4px 0 16px}.p85-th{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:0 2px 8px}.p85-th>div:first-child{min-width:0}'+
    '.p85-th b{display:block;font-size:15px;font-weight:800;color:var(--ink)}.p85-th small{display:block;font-size:12px;color:var(--muted);margin-top:2px}'+
    '.p85-mins{display:flex;gap:2px;padding:2px;border:1px solid var(--line);border-radius:10px;background:var(--card);flex:0 0 auto}'+
    '.p85-mins button{border:0;background:none;color:var(--muted);font-size:12.5px;font-weight:700;padding:7px 9px;border-radius:8px;min-height:34px;cursor:pointer}.p85-mins button.on{background:var(--accent);color:#fff}'+
    '.p85-it{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:13px 14px;color:var(--ink);cursor:pointer;font:inherit}.p85-it:last-child{border-bottom:0}.p85-it *{pointer-events:none}'+
    '.p85-num{flex:0 0 26px;height:26px;border-radius:50%;border:1.5px solid var(--accent);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;margin-top:1px}'+
    '.p85-it.done .p85-num{background:var(--accent);color:#fff}.p85-it.done .p85-itx b{color:var(--muted)}'+
    '.p85-itx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p85-itx b{font-size:15px;font-weight:700;line-height:1.4}.p85-itx em{font-style:normal;font-size:12.5px;font-weight:700;color:var(--accent)}'+
    '.p85-itx small{font-size:12.5px;line-height:1.6;color:var(--muted)}.p85-go{color:var(--muted);margin-top:4px;flex:0 0 auto}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE85 手順3：試験からの逆算 =====
   settings.p85.exam = {name:"試験名", date:"YYYY-MM-DD", lv:"A2"|"B1"（その級までの単語を全部習う）, acc:目標の正答率%}
   考え方：
     ・新しい言葉は「試験の3週間前」までに習い終える（最後の3週間は復習と模試にあてる。日数が少ないときは残りの1/3）。
     ・必要なペース＝残りの語数 ÷ 新しい言葉に使える日数。今のペース＝この14日に新しく習った語数 ÷ 14。
     ・今のペースが必要なペースより遅いときは、必要なペースに合わせて「今日やること」の量と1日の時間を組み直す。
       組み直した日と数を settings.p85.plan に残し、「前の計画 → 新しい計画」を見せる。
   ТРКИの試験対策モード（phase86）があれば、最新のミニ模試の点（settings.p86.mk）も合格ライン66%と並べて出す。 */
var P85_LVORDER=["A1","A2","B1"];
function p85ExamWords(){
  var x=p85Set().exam||{},lim=P85_LVORDER.indexOf(x.lv||"B1"),tot=0,done=0;
  VOCAB.forEach(function(w){var i=P85_LVORDER.indexOf(w.level);if(i<0||i>lim)return;tot++;var p=progress[w.id];if(p&&p.status&&p.status!=="new")done++;});
  return {tot:tot,done:done,left:tot-done};
}
function p85PaceNow(){var s=0;for(var i=0;i<14;i++){var d=new Date();d.setDate(d.getDate()-i);var r=appHist.days[todayKey(d)];if(r)s+=r.newWords||0;}return Math.round(s/14*10)/10;}
function p85Acc14(){var a=p85Recent(14);if(a.length<10)return null;var ok=0;a.forEach(function(e){ok+=e[3];});return Math.round(ok/a.length*100);}
function p85AddDays(n){var d=new Date();d.setDate(d.getDate()+n);return d;}
function p85MD(d){return (d.getFullYear()!==new Date().getFullYear()?d.getFullYear()+"年":"")+(d.getMonth()+1)+"月"+d.getDate()+"日";}
/* 逆算の計画 */
function p85ExamPlan(){
  var x=p85Set().exam;if(!x||!x.date)return null;
  var days=p85DaysLeft(),W=p85ExamWords(),pace=p85PaceNow();
  var buf=days>42?21:Math.floor(Math.max(0,days)/3),learnDays=Math.max(1,days-buf);
  var need=W.left>0?Math.ceil(W.left/learnDays):0;
  var st=W.left<=0?"done":(pace<=0?"nodata":(pace>=need?"ok":(pace>=need*0.8?"tight":"late")));
  var eta=pace>0&&W.left>0?p85AddDays(Math.ceil(W.left/pace)):null;
  /* 1日に必要な時間：新しい言葉（6語＝1レッスン約20問）＋その復習（新しい語の約2倍の問題） */
  var per=p85SecPerQ(),lessons=Math.ceil(need/6),mins=Math.round((lessons*20+need*2)*per/60);
  var rec=mins<=15?15:(mins<=30?30:60);
  return {x:x,days:days,W:W,pace:pace,need:need,buf:buf,learnEnd:p85AddDays(learnDays),st:st,eta:eta,lessons:lessons,mins:mins,rec:rec,acc:p85Acc14()};
}
/* 計画を組み直したら記録する（前の計画と比べて見せるため） */
function p85Replan(P){
  if(!P||P.st==="done")return null;var S=p85Set(),old=S.plan;
  /* 1日に1回まで、2語以上かつ1割以上変わったときだけ組み直す（毎日少しずつ数字が動いて落ち着かないのを防ぐ） */
  if(!old||(old.d!==todayKey()&&Math.abs(old.need-P.need)>=Math.max(2,old.need*0.1))){var prev=old?{d:old.d,need:old.need}:null;S.plan={d:todayKey(),need:P.need,prev:old?prev:null};try{saveAll();}catch(_){}}
  return S.plan;
}
var P85_ST={ok:["間に合うペースです","ok"],tight:["少し遅れています","warn"],late:["このままでは間に合いません","ng"],nodata:["まだ記録が少ないので、計画だけ出します",""],done:["範囲の単語はすべて習いました","ok"]};
function p85ExamSheet(edit){
  var S=p85Set(),x=S.exam||{},P=p85ExamPlan(),h='';
  var form='<div class="p85-form"><label><span>試験の名前</span><input id="p85name" type="text" maxlength="40" value="'+esc(x.name||"ТРКИ-1（B1）")+'"></label>'+
    '<label><span>試験日</span><input id="p85date" type="date" value="'+esc(x.date||"")+'" min="'+todayKey()+'"></label>'+
    '<label><span>目標：この級までの単語を全部習う</span><select id="p85lv">'+["A2","B1"].map(function(l){return '<option'+((x.lv||"B1")===l?" selected":"")+'>'+l+'</option>';}).join("")+'</select></label>'+
    '<label><span>目標の正答率</span><select id="p85acc">'+[66,70,75,80,85,90].map(function(a){return '<option value="'+a+'"'+((x.acc||75)===a?" selected":"")+'>'+a+'%</option>';}).join("")+'</select></label>'+
    '<p class="p85-err" id="p85err"></p><div class="p85-fbtn">'+(x.date?'<button type="button" class="p47-btn" data-act="p85exclear">試験日を消す</button>':'')+'<button type="button" class="p47-btn primary" data-act="p85exsave">保存する</button></div>'+
    '<p class="p85-fnote">ТРКИ-1 の合格ラインは、各分野 66% です。少し上の 75% を目標にすると安心です。</p></div>';
  if(!P||edit){h=form;}
  else{
    var Rp=p85Replan(P),stt=P85_ST[P.st];
    h+='<div class="p85-ex"><div class="p85-exd"><b>'+esc(x.name||"試験")+'</b><span>'+esc(x.date.replace(/-/g,"/"))+'</span></div><div class="p85-exn">あと <b>'+P.days+'</b> 日</div>'+
      '<div class="p85-st '+stt[1]+'">'+stt[0]+'</div></div>';
    h+='<div class="p85-tbl">'+
      '<div><span>'+esc(x.lv||"B1")+'までの単語</span><b>'+P.W.done.toLocaleString()+' / '+P.W.tot.toLocaleString()+' 語</b><i class="p85-bar"><i style="width:'+(P.W.tot?Math.round(P.W.done/P.W.tot*100):0)+'%"></i></i></div>'+
      '<div><span>今のペース（この2週間）</span><b>1日 '+P.pace+' 語</b></div>'+
      (P.st!=="done"?'<div><span>必要なペース</span><b>1日 '+P.need+' 語</b><small>残り '+P.W.left.toLocaleString()+' 語を '+p85MD(P.learnEnd)+' までに。最後の'+(P.buf>=21?'3週間':P.buf+'日')+'は復習と模試にあてます。</small></div>':'')+
      (P.eta?'<div><span>このままのペースだと</span><b>'+p85MD(P.eta)+'に習い終わる</b></div>':'')+
      '<div><span>正答率（この2週間）</span><b>'+(P.acc==null?'記録がまだ少ない':P.acc+'%')+'</b><small>目標 '+(x.acc||75)+'%</small></div>';
    try{var mk=settings.p86&&settings.p86.mk&&settings.p86.mk[0];
      if(mk){var f=function(a){return a&&a[1]?Math.round(a[0]/a[1]*100)+'%':'-';};h+='<div><span>ТРКИ ミニ模試（'+p85MD(new Date(mk.d))+'）</span><b>語彙・文法 '+f(mk.lg)+' ・ 読解 '+f(mk.rd)+' ・ 聴解 '+f(mk.au)+'</b><small>合格ラインは各分野 66%</small></div>';}
      else h+='<div><span>ТРКИ ミニ模試</span><b>まだ受けていません</b><small>ホームの「試験対策」から受けられます</small></div>';}catch(_){}
    h+='</div>';
    if(P.st!=="done"){
      h+='<div class="p85-plan"><b>これからの計画</b><p>1日 <em>'+P.need+' 語</em>（約'+P.lessons+'レッスン）と、その復習。1日の目安は <em>約'+P.mins+'分</em> です。</p>'+
        (Rp&&Rp.prev&&Rp.prev.need!==P.need?'<p class="p85-re">計画を組み直しました：1日 '+Rp.prev.need+' 語 → '+P.need+' 語（'+(P.need>Rp.prev.need?'遅れを取り戻すため':'先に進めているため')+'）</p>':'')+
        (P.st==="late"||P.st==="tight"?'<p class="p85-re">今のペースより速くする必要があるので、「今日やること」の新しいレッスンを1日 '+P.lessons+' レッスンにしています。毎日続けるのが難しいときは、試験日や目標の級を見直してください。</p>':'')+
        (S.min<P.rec?'<button type="button" class="p47-btn primary" data-act="p85min" data-val="'+P.rec+'">「今日やること」を '+P.rec+'分 にする</button>':'<p class="p85-ok">「今日やること」（'+S.min+'分）を毎日こなすと、このペースになります。</p>')+'</div>';
    }
    h+='<button type="button" class="p85-edit" data-act="p85exedit">試験日・目標を変える</button>';
  }
  return h;
}
function p85OpenExam(edit){
  var m=document.getElementById("p85sheet");if(!m){m=document.createElement("div");m.id="p85sheet";document.body.appendChild(m);}
  m.innerHTML='<div class="p81-mask" data-act="p85exclose"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="試験の計画"><div class="p81-ph"><b>試験までの計画</b><button type="button" class="p81-x" data-act="p85exclose" aria-label="閉じる">'+(typeof p81Ic==="function"?p81Ic("x",18):"✕")+'</button></div><div class="p81-pb">'+p85ExamSheet(edit)+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");
}
function p85CloseExam(){var m=document.getElementById("p85sheet");if(m){m.className="";m.innerHTML="";}document.body.classList.remove("p81-open");}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(["p85exam","p85exclose","p85exedit","p85exsave","p85exclear"].indexOf(a)<0)return;
  e.stopImmediatePropagation();e.preventDefault();var S=p85Set();
  if(a==="p85exam"){p85OpenExam(false);return;}
  if(a==="p85exclose"){p85CloseExam();render();return;}
  if(a==="p85exedit"){p85OpenExam(true);return;}
  if(a==="p85exclear"){delete S.exam;delete S.plan;try{saveAll();}catch(_){}p85CloseExam();render();toast("試験日を消しました");return;}
  if(a==="p85exsave"){
    var nm=(document.getElementById("p85name").value||"").trim().slice(0,40)||"試験",dt=document.getElementById("p85date").value||"",er=document.getElementById("p85err");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(dt)){er.textContent="試験日を選んでください。";return;}
    if(dt<todayKey()){er.textContent="試験日が今日より前になっています。";return;}
    S.exam={name:nm,date:dt,lv:document.getElementById("p85lv").value,acc:+document.getElementById("p85acc").value};delete S.plan;
    try{saveAll();}catch(_){}p85OpenExam(false);return;
  }
},true);
/* 計画の画面の中で「◯分にする」を押したら、画面を描き直す */
document.addEventListener("click",function(e){var el=e.target.closest&&e.target.closest('#p85sheet [data-act="p85min"]');if(!el)return;setTimeout(function(){if(document.getElementById("p85sheet").className==="show")p85OpenExam(false);},0);},false);
/* ホームの見出しの下を「試験までの日数」のボタンにする */
var _p85HomeHtml=p85HomeHtml;
p85HomeHtml=function(){
  var h=_p85HomeHtml(),P=p85ExamPlan(),sub;
  if(P){var st=P85_ST[P.st];sub='<button type="button" class="p85-exb '+st[1]+'" data-act="p85exam">'+esc(P.x.name||"試験")+'まで あと '+P.days+' 日 ・ '+(P.st==="nodata"?'計画を見る':st[0])+' ›</button>';}
  else sub='<button type="button" class="p85-exb" data-act="p85exam">試験日を決めると、残りの日数から計画を立てます ›</button>';
  return h.replace(/<small>[^<]*<\/small><\/div><div class="p85-mins"/,sub+'</div><div class="p85-mins"');
};
/* 「今日やること」：試験が近いときは試験形式の練習を入れる（試験対策モードがあるときだけ） */
var _p85Plan=p85Plan;
p85Plan=function(){
  var items=_p85Plan(),days=p85DaysLeft();
  if(days==null||days<0)return items;
  var hasTrki=!!window.P86_LG&&P47_LANG==="ru";if(!hasTrki)return items;
  var todayT=p85TodayLog().filter(function(e){return e[1]==="trki";}).length,mk=(settings.p86&&settings.p86.mk)||[],lastMk=mk[0]?mk[0].d:0;
  var it=null;
  if(days<=30&&Date.now()-lastMk>6*86400000)it={k:"mock",act:"trki",title:"ТРКИ ミニ模試",amt:"約35分",why:"試験まであと "+days+" 日。週に1回は本番に近い形で解いて、時間の配分と各分野の点（合格ライン66%）を確かめましょう。",done:Date.now()-lastMk<86400000};
  else if(days<=90)it={k:"trki",act:"trki",title:"試験形式の練習（ТРКИ）",amt:"10問 ・ 約"+Math.max(3,Math.round(10*p85SecPerQ()*1.5/60))+"分",why:"試験まであと "+days+" 日。試験と同じ形の問題に慣れておくと、本番で迷う時間が減ります。",done:todayT>=10};
  if(!it)return items;
  /* 3つ目（瞬間作文か新しいレッスン）と入れかえる。1つ目・2つ目（復習・弱点）は残す */
  var i=items.map(function(x){return x.k;}).indexOf("compose");if(i<0)i=items.length-1;
  if(items.length<3)items.push(it);else items[i]=it;
  return items;
};
var _p85Go=p85Go;
p85Go=function(v){
  if(v==="trki"){var b=document.createElement("button");b.type="button";b.style.display="none";b.setAttribute("data-act","p86open");document.body.appendChild(b);try{b.click();}finally{b.remove();}return;}
  return _p85Go(v);
};
(function(){
  var css='.p85-exb{display:block;border:0;background:none;padding:2px 0 0;margin:0;font:inherit;font-size:12px;color:var(--muted);text-align:left;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}'+
    '.p85-exb.ok{color:var(--accent)}.p85-exb.warn{color:#C77700}.p85-exb.ng{color:#D9480F}'+
    '.p85-form label{display:block;margin:0 0 14px}.p85-form span{display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px}'+
    '.p85-form input,.p85-form select{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);min-height:46px}'+
    '.p85-err{color:#D9480F;font-size:13px;min-height:1em;margin:0 0 8px}.p85-fbtn{display:flex;gap:8px}.p85-fbtn .p47-btn{flex:1}.p85-fnote{font-size:12.5px;color:var(--muted);line-height:1.7;margin:12px 0 0}'+
    '.p85-ex{text-align:center;padding:6px 0 14px}.p85-exd b{display:block;font-size:15px}.p85-exd span{font-size:12.5px;color:var(--muted)}.p85-exn{font-size:15px;margin-top:6px}.p85-exn b{font-size:40px;font-weight:800;font-variant-numeric:tabular-nums}'+
    '.p85-st{display:inline-block;margin-top:6px;padding:5px 12px;border-radius:99px;font-size:13px;font-weight:700;border:1px solid var(--line);color:var(--muted)}.p85-st.ok{color:var(--accent);border-color:var(--accent)}.p85-st.warn{color:#C77700;border-color:#C77700}.p85-st.ng{color:#D9480F;border-color:#D9480F}'+
    '.p85-tbl{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}.p85-tbl>div{padding:11px 14px;border-bottom:1px solid var(--line)}.p85-tbl>div:last-child{border-bottom:0}'+
    '.p85-tbl span{display:block;font-size:12px;color:var(--muted);font-weight:600}.p85-tbl b{display:block;font-size:15px;font-weight:700;margin-top:2px;font-variant-numeric:tabular-nums}.p85-tbl small{display:block;font-size:12px;color:var(--muted);margin-top:3px;line-height:1.6}'+
    '.p85-bar{display:block;height:6px;border-radius:99px;background:var(--line);margin-top:8px;overflow:hidden}.p85-bar i{display:block;height:100%;background:var(--accent);border-radius:99px}'+
    '.p85-plan{margin-top:14px;padding:14px;border-radius:14px;border:1px solid var(--accent)}.p85-plan>b{font-size:14px}.p85-plan p{font-size:13.5px;line-height:1.7;margin:6px 0 0}.p85-plan em{font-style:normal;font-weight:800;color:var(--accent)}'+
    '.p85-plan .p85-re{font-size:12.5px;color:var(--muted)}.p85-plan .p85-ok{font-size:12.5px;color:var(--muted)}.p85-plan .p47-btn{width:100%;margin-top:10px}'+
    '.p85-edit{display:block;width:100%;margin:14px 0 4px;padding:12px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:14px;font-weight:700;cursor:pointer;min-height:44px}'+
    '#p85sheet{display:none}#p85sheet.show{display:block;position:fixed;inset:0;z-index:210}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE85 手順4：週次レポート =====
   週は月曜〜日曜。数字は 1問ごとの記録（P85.log）と日ごとの記録（appHist.days の newWords）から、開いたときに計算する。
   AIのひとこと：終わった週だけ、レポートを開いたときに Claude（sample）に数字を渡して2〜3文を書いてもらう。
     書いてもらった文は settings.p85.wk["週の月曜"] = {ai:文, at:時刻} に残す（2回目からはすぐ出る。12週分まで）。
     通信できないときや AI が使えないときは、数字のまとめだけを出す。
   ホーム：新しい週になって、先週のレポートをまだ開いていなければ「先週のレポート」の帯を出す（settings.p85.wkSeen）。 */
function p85Monday(d){d=new Date(d||Date.now());d.setHours(0,0,0,0);var w=(d.getDay()+6)%7;d.setDate(d.getDate()-w);return d;}
function p85WkKey(d){return todayKey(p85Monday(d));}
function p85WkRange(key){var a=new Date(key+"T00:00:00"),b=new Date(a);b.setDate(b.getDate()+7);return [a,b];}
function p85InRange(a,b){var x=Math.floor(a.getTime()/1000),y=Math.floor(b.getTime()/1000),out=[];
  Object.keys(P85.log).sort().forEach(function(m){P85.log[m].forEach(function(e){if(e[0]>=x&&e[0]<y)out.push(e);});});return out;}
function p85ShiftKey(key,weeks){var d=new Date(key+"T00:00:00");d.setDate(d.getDate()+7*weeks);return todayKey(d);}
function p85ChStats(list){var st={};list.forEach(function(e){if(!e[5])return;var seen={};e[5].forEach(function(g){if(!p85IsCh(g)||seen[g])return;seen[g]=1;var r=st[g]||(st[g]={n:0,ok:0});r.n++;r.ok+=e[3];});});return st;}
/* 1週間分のまとめ */
function p85Week(key){
  var R=p85WkRange(key),L=p85InRange(R[0],R[1]),P=p85InRange(new Date(p85ShiftKey(key,-1)+"T00:00:00"),R[0]);
  var sum=function(l){var n=l.length,ok=0,s=0;l.forEach(function(e){ok+=e[3];s+=e[4];});return {n:n,ok:ok,s:s,pct:n?Math.round(ok/n*100):null};};
  var A=sum(L),B=sum(P),daysMin=[],studied=0,newW=0;
  for(var i=0;i<7;i++){var d=new Date(R[0]);d.setDate(d.getDate()+i);var k=todayKey(d),s=0;L.forEach(function(e){if(todayKey(new Date(e[0]*1000))===k)s+=e[4];});daysMin.push(Math.round(s/60));if(s>0)studied++;var r=appHist.days[k];if(r)newW+=r.newWords||0;}
  /* 伸びた点：文法の章（今週 vs その前の2週間）、まちがえていた言葉が今週は正解 */
  var cur=p85ChStats(L),before=p85ChStats(p85InRange(new Date(p85ShiftKey(key,-2)+"T00:00:00"),R[0])),up=[];
  Object.keys(cur).forEach(function(g){var c=cur[g],b=before[g];if(c.n>=3&&b&&b.n>=3){var d=Math.round(c.ok/c.n*100)-Math.round(b.ok/b.n*100);if(d>=10)up.push({id:g,from:Math.round(b.ok/b.n*100),to:Math.round(c.ok/c.n*100)});}});
  up.sort(function(a,b){return (b.to-b.from)-(a.to-a.from);});
  var wrongBefore={},okNow={},wrongNow={};
  p85InRange(new Date(p85ShiftKey(key,-4)+"T00:00:00"),R[0]).forEach(function(e){if(!e[3]&&e[6])e[6].forEach(function(id){wrongBefore[id]=1;});});
  L.forEach(function(e){if(WMAP[e[2]]){if(e[3])okNow[e[2]]=1;else wrongNow[e[2]]=1;}});
  var fixed=Object.keys(wrongBefore).filter(function(id){return okNow[id]&&!wrongNow[id]&&WMAP[id];});
  /* 次の重点：今週いちばん低い章、今週2回以上まちがえた言葉 */
  var weak=Object.keys(cur).filter(function(g){return cur[g].n>=3;}).map(function(g){return {id:g,n:cur[g].n,pct:Math.round(cur[g].ok/cur[g].n*100)};}).filter(function(r){return r.pct<80;}).sort(function(a,b){return a.pct-b.pct;});
  var wc={};L.forEach(function(e){if(!e[3]&&e[6])e[6].forEach(function(id){wc[id]=(wc[id]||0)+1;});});
  var often=Object.keys(wc).filter(function(id){return wc[id]>=2&&WMAP[id];}).sort(function(a,b){return wc[b]-wc[a];});
  return {key:key,A:A,B:B,daysMin:daysMin,studied:studied,newW:newW,up:up,fixed:fixed,weak:weak,often:often,done:R[1].getTime()<=Date.now()};
}
function p85WkLabel(key){var R=p85WkRange(key),e=new Date(R[1]);e.setDate(e.getDate()-1);return (R[0].getMonth()+1)+"/"+R[0].getDate()+"〜"+(e.getMonth()+1)+"/"+e.getDate();}
function p85WkHtml(key){
  var W=p85Week(key),S=p85Set(),cache=(S.wk||{})[key],h='';
  var diffPct=(W.A.pct!=null&&W.B.pct!=null)?W.A.pct-W.B.pct:null,diffMin=Math.round((W.A.s-W.B.s)/60);
  var thisWk=p85WkKey();
  h+='<div class="p85-wnav"><button type="button" class="p85-wb" data-act="p85wk" data-val="'+p85ShiftKey(key,-1)+'" aria-label="前の週">‹</button><b>'+p85WkLabel(key)+(key===thisWk?'（今週・途中）':'')+'</b>'+
     '<button type="button" class="p85-wb" data-act="p85wk" data-val="'+p85ShiftKey(key,1)+'"'+(key>=thisWk?' disabled':'')+' aria-label="次の週">›</button></div>';
  if(!W.A.n){return h+'<p class="p85-empty">この週は記録がありません。</p>';}
  h+='<div class="p85-grid p85-wgrid"><div><span>学習時間</span><b>'+Math.round(W.A.s/60)+'<small> 分</small></b><i>'+(W.B.n?(diffMin>=0?'先週より +'+diffMin+'分':'先週より '+diffMin+'分'):'先週の記録なし')+'</i></div>'+
     '<div><span>正答率</span><b>'+W.A.pct+'<small> %</small></b><i>'+(diffPct==null?'先週の記録なし':(diffPct>=0?'先週より +'+diffPct+'ポイント':'先週より '+diffPct+'ポイント'))+'</i></div></div>';
  h+='<div class="p85-wfacts"><span><b>'+W.A.n+'</b> 問</span><span><b>'+W.studied+'</b> / 7 日</span><span>新しい言葉 <b>'+W.newW+'</b> 語</span></div>';
  try{h+=p60Cols(W.daysMin,["月","火","水","木","金","土","日"],key===thisWk?((new Date().getDay()+6)%7):-1)+'<p class="p85-wcap">1日ごとの学習時間（分）</p>';}catch(_){}
  var good=[];
  W.up.slice(0,2).forEach(function(u){good.push('文法「'+esc(p85ChName(u.id))+'」の正答率が '+u.from+'% → '+u.to+'% に上がりました');});
  if(W.fixed.length)good.push('前にまちがえていた言葉 '+W.fixed.length+' 語を、今週は正解できました（'+W.fixed.slice(0,3).map(function(id){return esc(WMAP[id].accent||WMAP[id].word);}).join("、")+(W.fixed.length>3?' など':'')+'）');
  if(diffPct!=null&&diffPct>=5)good.push('全体の正答率が先週より '+diffPct+' ポイント上がりました');
  if(W.studied>=5)good.push('7日のうち '+W.studied+' 日学習できました');
  if(!good.length)good.push('今週は '+W.A.n+' 問解き、'+W.newW+' 語の新しい言葉を習いました');
  var next=[];
  if(W.weak.length)next.push('文法「'+esc(p85ChName(W.weak[0].id))+'」（今週 '+W.weak[0].pct+'%）。解説を読み直してから章の練習を');
  if(W.often.length)next.push('2回以上まちがえた言葉 '+W.often.length+' 語（'+W.often.slice(0,3).map(function(id){return esc(WMAP[id].accent||WMAP[id].word);}).join("、")+'）');
  try{var EP=p85ExamPlan();if(EP&&EP.st!=="done")next.push(esc(EP.x.name||"試験")+'まで '+EP.days+' 日。新しい言葉は1日 '+EP.need+' 語のペースで'+(EP.st==="late"||EP.st==="tight"?'（今は少し遅れています）':''));}catch(_){}
  if(W.studied<4)next.push('短い時間でも、学習する日を増やす（15分コースでも大丈夫です）');
  h+='<div class="p85-wsec"><b>伸びた点</b><ul>'+good.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';
  h+='<div class="p85-wsec"><b>次の週の重点</b><ul>'+next.slice(0,3).map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';
  /* AIのひとこと（終わった週だけ） */
  if(W.done){
    h+='<div class="p85-ai" id="p85ai"><b>AIのひとこと</b>'+(cache&&cache.ai?'<p>'+esc(cache.ai)+'</p><small>AI（Claude）が数字を読んで書いた文です。まちがうことがあります。</small><button type="button" class="p85-airedo" data-act="p85ai" data-val="'+key+'">書き直してもらう</button>':'<p class="p85-aiwait">'+(P85.aiBusy===key?'考えています…':'')+'</p>')+'</div>';
  }
  return h;
}
/* AIに渡すのは数字だけ（名前やメールなどは渡さない） */
async function p85AskAI(key){
  if(P85.aiBusy)return;var W=p85Week(key);if(!W.A.n||!W.done)return;
  var s=null;try{s=await p55Sample();}catch(_){}
  var box=function(t){var b=document.querySelector("#p85ai .p85-aiwait");if(b)b.textContent=t;};
  if(!s){box("AIのひとことは、Claudeのページとして開いたときに出ます。");return;}
  P85.aiBusy=key;box("考えています…");
  var data={週:p85WkLabel(key),学習時間_分:Math.round(W.A.s/60),先週の学習時間_分:Math.round(W.B.s/60),解いた問題:W.A.n,正答率:W.A.pct,先週の正答率:W.B.pct,学習した日数:W.studied,新しく習った言葉:W.newW,
    伸びた文法:W.up.slice(0,2).map(function(u){return p85ChName(u.id)+" "+u.from+"%→"+u.to+"%";}),前にまちがえて今週正解した言葉の数:W.fixed.length,
    苦手な文法:W.weak.slice(0,2).map(function(r){return p85ChName(r.id)+" "+r.pct+"%";}),よくまちがえた言葉の数:W.often.length};
  try{var EP=p85ExamPlan();if(EP)data.試験={名前:EP.x.name,残り日数:EP.days,必要なペース_1日:EP.need,今のペース_1日:EP.pace,状況:P85_ST[EP.st][0]};}catch(_){}
  var prompt="あなたは日本人のロシア語学習者を支えるコーチです。次は、この人の1週間の学習の記録（数字）です。\n"+JSON.stringify(data)+"\n\n"+
    "日本語で、2〜3文のひとことを書いてください。ルール：\n1. 数字を1つ以上そのまま使い、よかった点を1つ具体的に言う。\n2. 来週いちばん大事なことを1つ、すぐできる形で言う。\n3. 大げさなほめ言葉、命令口調、絵文字、「！」の連発は使わない。やさしい言葉で。\n4. 記録にないことは書かない。\n5. "+(typeof P55_SAFE==="string"?P55_SAFE:"")+"\n前置きや見出しは書かず、ひとことの文だけを返してください。";
  try{
    var r=await s(prompt),t=String(r&&r.text||"").trim().slice(0,400);
    if(!t)throw {};
    var S=p85Set();if(!S.wk)S.wk={};S.wk[key]={ai:t,at:Date.now()};
    var ks=Object.keys(S.wk).sort();while(ks.length>12)delete S.wk[ks.shift()];
    try{saveAll();}catch(_){}
    P85.aiBusy=null;if(P85.wkOpen===key)p85OpenWeek(key);
  }catch(e){P85.aiBusy=null;box(typeof p55ErrMsg==="function"?p55ErrMsg(e):"うまく書けませんでした。もう一度開いてください。");}
}
function p85OpenWeek(key){
  key=key||p85ShiftKey(p85WkKey(),-1);P85.wkOpen=key;
  var S=p85Set();if(key===p85ShiftKey(p85WkKey(),-1)&&S.wkSeen!==key){S.wkSeen=key;try{saveAll();}catch(_){}}
  var m=document.getElementById("p85sheet");if(!m){m=document.createElement("div");m.id="p85sheet";document.body.appendChild(m);}
  m.innerHTML='<div class="p81-mask" data-act="p85exclose"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="週次レポート"><div class="p81-ph"><b>週次レポート</b><button type="button" class="p81-x" data-act="p85exclose" aria-label="閉じる">'+(typeof p81Ic==="function"?p81Ic("x",18):"✕")+'</button></div><div class="p81-pb">'+p85WkHtml(key)+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");
  var W=p85Week(key),c=(S.wk||{})[key];if(W.done&&W.A.n&&!(c&&c.ai)&&P85.aiBusy!==key)p85AskAI(key);
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(a!=="p85week"&&a!=="p85wk"&&a!=="p85ai")return;
  e.stopImmediatePropagation();e.preventDefault();var v=el.getAttribute("data-val");
  if(a==="p85week"){p85OpenWeek(v||null);return;}
  if(a==="p85wk"){if(el.disabled)return;p85OpenWeek(v);return;}
  if(a==="p85ai"){var S=p85Set();if(S.wk)delete S.wk[v];p85OpenWeek(v);return;}
},true);
/* ホーム：先週のレポートをまだ開いていなければ帯を出す */
var _p85HomeHtml2=p85HomeHtml;
p85HomeHtml=function(){
  var h=_p85HomeHtml2(),S=p85Set(),last=p85ShiftKey(p85WkKey(),-1);
  if(S.wkSeen===last)return h;
  var R=p85WkRange(last);if(!p85InRange(R[0],R[1]).length)return h;
  return h.replace('<div class="p81-box">','<button type="button" class="p85-wkb" data-act="p85week" data-val="'+last+'"><b>先週のレポートができました</b><span>'+p85WkLabel(last)+' ・ 学習時間と伸びた点</span>'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</button><div class="p81-box">');
};
/* 記録の画面：「1問ごとの記録」の下に週次レポートと試験の計画への入口 */
var _p85Card=p85Card;
p85Card=function(){
  return _p85Card()+'<div class="p85-links"><button type="button" class="p47-btn" data-act="p85week" data-val="'+p85WkKey()+'">週次レポート</button><button type="button" class="p47-btn" data-act="p85exam">試験までの計画</button></div>';
};
(function(){
  var css='.p85-wnav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px}.p85-wnav b{font-size:15px}'+
    '.p85-wb{width:44px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:20px;cursor:pointer}.p85-wb[disabled]{opacity:.35;cursor:default}'+
    '.p85-wgrid{border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden}'+
    '.p85-wfacts{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin:12px 2px}.p85-wfacts b{color:var(--ink);font-weight:800}.p85-wcap{font-size:12px;color:var(--muted);margin:2px 2px 0;text-align:center}'+
    '.p85-wsec{margin-top:16px}.p85-wsec>b{font-size:14px}.p85-wsec ul{margin:6px 0 0;padding-left:20px}.p85-wsec li{font-size:13.5px;line-height:1.7;margin:3px 0}'+
    '.p85-ai{margin-top:16px;padding:14px;border-radius:14px;border:1px solid var(--line);background:var(--card)}.p85-ai>b{font-size:14px}.p85-ai p{font-size:14px;line-height:1.8;margin:6px 0 0}.p85-ai small{display:block;font-size:11.5px;color:var(--muted);margin-top:8px}'+
    '.p85-aiwait{color:var(--muted)}.p85-airedo{margin-top:8px;border:0;background:none;color:var(--accent);font:inherit;font-size:12.5px;padding:6px 0;cursor:pointer}'+
    '.p85-wkb{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 8px;padding:11px 14px;border-radius:12px;border:1px solid var(--accent);background:var(--card);color:var(--ink);text-align:left;cursor:pointer;font:inherit}.p85-wkb *{pointer-events:none}'+
    '.p85-wkb b{font-size:14px;white-space:nowrap}.p85-wkb span{flex:1;min-width:0;font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
    '.p85-links{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.p85-links .p47-btn{font-size:13px;padding:11px 6px}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
