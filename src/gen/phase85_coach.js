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
