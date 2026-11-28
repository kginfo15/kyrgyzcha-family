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
     クラウド（phase50 の data/users/<uid>）には全部。月ごとの文書 "lg2026-11"、20万字ごとに "lg2026-11.1" … と分ける。
     2台の端末で解いた記録は、読み込むときに足し合わせる（上書きしない）。
   ほかの phase から記録するときは coachLog({m:"モード", id:"問題ID", ok:true/false, s:秒(省略可), g:[文法], w:[単語ID]}) を呼ぶ。 */
var P85_MAX_SEC=120,P85_DOC_MAX=200000,P85_LOCAL_MONTHS=2;
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
  var all=Object.keys(P85.log).sort(),ms=all.slice(-P85_LOCAL_MONTHS),o={};
  /* 端末から外す古い月があれば、外す前に週ごとの数字（settings.p85.wkS）に残す（1回の起動で1回だけ） */
  if(all.length>P85_LOCAL_MONTHS&&!P85.rolled&&typeof p85Series==="function"){P85.rolled=1;try{p85Series();}catch(_){}}ms.forEach(function(m){o[m]=P85.log[m];});
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
    /* まちがえたときだけ、問題の中身 [問題文, 正解, 選んだ答え, 理由] を8番目に残す（講義の「あなたがまちがえた問題」に使う） */
    if(!o.ok&&o.x&&typeof o.x==="object"){var cut=function(v,n){return String(v==null?"":v).replace(/<[^>]*>/g,"").slice(0,n);};e.push([cut(o.x.s,140),cut(o.x.a,40),cut(o.x.p,40),cut(o.x.r,80)]);}
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
    var cx=null;try{cx=ok?null:p85LessonCtx(S,x,w);}catch(_){}
    coachLog({m:m,id:x.id,ok:ok,g:g,w:ok?[]:[x.id],kind:x.t,x:cx});
  }catch(_){}
  return r;
};
/* まちがえた問題の中身：意味を選ぶ問題・穴埋め（意味／形）・文字を並べて書く問題 */
function p85WordTxt(id){var w=WMAP[id];return w?(w.accent||w.word):String(id||"");}
function p85LessonCtx(S,x,w){
  var c=x.c,sent=c&&c.f?c.f.toks.map(function(t,i){return i===c.f.a?"＿＿":(i>c.f.a&&i<=c.f.z?"":t);}).join("").replace(/\u0301/g,""):"";
  if(c&&c.forms&&S.picked2!=null){var fm=c.forms,pl=fm.lab[p71N(S.picked2)]||"";
    return {s:sent+(c.ja?"（"+c.ja+"）":""),a:p71Plain(c.f.surface),p:S.picked2,r:"正解の形："+(fm.lab[fm.key]||"")+(pl?"／選んだ形："+pl:"")};}
  if(c)return {s:sent+(c.ja?"（"+c.ja+"）":""),a:w?(w.accent||w.word):"",p:p85WordTxt(S.picked),r:"意味の取りちがえ"};
  if(x.m)return {s:w?"「"+w.meaning+"」を書く・聞き取る":"",a:x.ans||"",p:S.picked||"",r:"つづり・聞き取り"};
  return {s:w?"「"+w.meaning+"」にあたる言葉":"",a:w?(w.accent||w.word):"",p:p85WordTxt(S.picked),r:"意味の取りちがえ"};
}
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
    coachLog({m:"test",id:it.kind==="vocab"?it.id:(it.cid||""),ok:ok,g:["t:"+it.sec].concat(it.kind==="gram"&&c&&c.grammarPoint?[String(c.grammarPoint).slice(0,40)]:[]),w:(!ok&&it.kind==="vocab")?[it.id]:[],
      x:it.kind==="gram"?{s:it.sent+(it.ja?"（"+it.ja+"）":""),a:it.correct,p:it.opts[+el.getAttribute("data-val")],r:"到達テスト・文法"}:(it.kind==="vocab"?{s:"「"+(WMAP[it.id]||{}).meaning+"」",a:p85WordTxt(it.id),p:"",r:"到達テスト・語彙"}:null)});
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
  /* 1つの文書が保存の上限（25万字）をこえないよう、20万字ごとに分ける（lg2026-11, lg2026-11.1, …） */
  Object.keys(P85.log).forEach(function(m){var a=P85.log[m]||[],part=[],len=2,n=0;
    a.forEach(function(e){var l=JSON.stringify(e).length+1;if(part.length&&len+l>P85_DOC_MAX){o["lg"+m+(n?"."+n:"")]=part;n++;part=[];len=2;}part.push(e);len+=l;});
    o["lg"+m+(n?"."+n:"")]=part;});
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
  var h='<div class="p60-h">1問ごとの記録<small>実際に解いた時間だけ</small></div><div class="p60-list p85c-card">';
  if(!all.length){
    return h+'<div class="p85c-empty">まだ記録がありません。今日から、問題を1問解くごとに「正解か・何秒かかったか・どの言葉と文法か」を記録します。</div></div>';
  }
  h+='<div class="p85c-grid"><div><span>今日</span><b>'+T.n+'<small> 問</small></b><em>'+(T.n?T.pct+'% 正解':'まだ')+'</em></div>'+
     '<div><span>この7日</span><b>'+W.n+'<small> 問</small></b><em>'+W.pct+'% 正解</em></div></div>';
  /* よくまちがえる言葉（この7日） */
  var bad={};all.forEach(function(e){if(!e[3]&&e[6])e[6].forEach(function(id){bad[id]=(bad[id]||0)+1;});});
  var top=Object.keys(bad).filter(function(id){return WMAP[id];}).sort(function(a,b){return bad[b]-bad[a];}).slice(0,5);
  if(top.length)h+='<div class="p85c-sub">この7日でまちがえた言葉</div>'+top.map(function(id){var w=WMAP[id];return '<div class="p85c-row"><b>'+esc(w.accent||w.word)+'</b><span>'+esc(w.meaning)+'</span><em>'+bad[id]+'回</em></div>';}).join("");
  /* 最近の5問 */
  var last=all.slice(-5).reverse();
  h+='<div class="p85c-sub">最近解いた問題</div>'+last.map(function(e){var d=new Date(e[0]*1000),w=WMAP[e[2]],c=CMAP[e[2]];
    var nm=w?(w.accent||w.word):(c?(c.ru||""):e[2]);
    return '<div class="p85c-row"><span class="p85c-ok '+(e[3]?"ok":"ng")+'">'+(e[3]?"○":"×")+'</span><b>'+esc(String(nm).slice(0,28))+'</b><span>'+esc(P85_MODE[e[1]]||e[1])+'</span><em>'+e[4]+'秒 ・ '+String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0")+'</em></div>';}).join("");
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
  var css='.p85c-card{padding:4px 0 6px}.p85c-empty{padding:14px;font-size:13.5px;line-height:1.7;color:var(--muted)}'+
    '.p85c-grid{display:grid;grid-template-columns:1fr 1fr;gap:0;border-bottom:1px solid var(--line)}.p85c-grid>div{padding:12px 14px;display:flex;flex-direction:column;gap:2px}.p85c-grid>div+div{border-left:1px solid var(--line)}'+
    '.p85c-grid span{font-size:12px;color:var(--muted);font-weight:600}.p85c-grid b{font-size:24px;font-weight:800;font-variant-numeric:tabular-nums}.p85c-grid b small{font-size:13px;font-weight:600;color:var(--muted)}'+
    '.p85c-grid em{font-style:normal;font-size:13px;font-weight:700}.p85c-grid i{font-style:normal;font-size:12.5px;color:var(--muted)}'+
    '.p85c-sub{font-size:12px;font-weight:700;color:var(--muted);padding:12px 14px 4px}'+
    '.p85c-row{display:flex;align-items:baseline;gap:8px;padding:7px 14px;font-size:14px;min-width:0}.p85c-row b{font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:48%}.p85c-row span{color:var(--muted);font-size:12.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;min-width:0}'+
    '.p85c-row em{margin-left:auto;font-style:normal;font-size:12px;color:var(--muted);font-variant-numeric:tabular-nums;white-space:nowrap}'+
    '.p85c-ok{font-weight:800;font-size:13px;flex:0 0 auto}.p85c-ok.ok{color:var(--accent)}.p85c-ok.ng{color:#D9480F}';
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
  var head='<div class="p85c-th"><div><b>今日やること</b>'+
    (days!=null&&days>=0?'<small>'+esc(x.name||"試験")+'まで あと '+days+' 日</small>':'<small>あなたの記録から選びました</small>')+'</div>'+
    '<div class="p85c-mins" role="group" aria-label="使える時間">'+[15,30,60].map(function(m){return '<button type="button" class="'+(S.min===m?"on":"")+'" data-act="p85min" data-val="'+m+'">'+m+'分</button>';}).join("")+'</div></div>';
  var rows=P.map(function(it,i){
    return '<button type="button" class="p85c-it'+(it.done?" done":"")+'" data-act="p85go" data-val="'+esc(it.act)+'"><span class="p85c-num">'+(it.done?'✓':(i+1))+'</span>'+
      '<span class="p85c-itx"><b>'+esc(it.title)+'</b><em>'+esc(it.amt)+'</em><small>'+esc(it.why)+'</small></span><span class="p85c-go">'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</span></button>';
  }).join("");
  return '<div class="p81-sec p85c-today">'+head+'<div class="p81-box">'+rows+'</div></div>';
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
  var css='.p85c-today{margin:4px 0 16px}.p85c-th{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:0 2px 8px}.p85c-th>div:first-child{min-width:0}'+
    '.p85c-th b{display:block;font-size:15px;font-weight:800;color:var(--ink)}.p85c-th small{display:block;font-size:12px;color:var(--muted);margin-top:2px}'+
    '.p85c-mins{display:flex;gap:2px;padding:2px;border:1px solid var(--line);border-radius:10px;background:var(--card);flex:0 0 auto}'+
    '.p85c-mins button{border:0;background:none;color:var(--muted);font-size:12.5px;font-weight:700;padding:7px 9px;border-radius:8px;min-height:34px;cursor:pointer}.p85c-mins button.on{background:var(--accent);color:#fff}'+
    '.p85c-it{display:flex;align-items:flex-start;gap:12px;width:100%;text-align:left;background:none;border:0;border-bottom:1px solid var(--line);padding:13px 14px;color:var(--ink);cursor:pointer;font:inherit}.p85c-it:last-child{border-bottom:0}.p85c-it *{pointer-events:none}'+
    '.p85c-num{flex:0 0 26px;height:26px;border-radius:50%;border:1.5px solid var(--accent);color:var(--accent);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;margin-top:1px}'+
    '.p85c-it.done .p85c-num{background:var(--accent);color:#fff}.p85c-it.done .p85c-itx b{color:var(--muted)}'+
    '.p85c-itx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p85c-itx b{font-size:15px;font-weight:700;line-height:1.4}.p85c-itx em{font-style:normal;font-size:12.5px;font-weight:700;color:var(--accent)}'+
    '.p85c-itx small{font-size:12.5px;line-height:1.6;color:var(--muted)}.p85c-go{color:var(--muted);margin-top:4px;flex:0 0 auto}';
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
  if(days<0)return {x:x,days:days,W:W,pace:pace,need:0,st:"past",acc:p85Acc14()};
  var buf=days>42?21:Math.floor(Math.max(0,days)/3),learnDays=Math.max(1,days-buf);
  var need=W.left>0?Math.ceil(W.left/learnDays):0;
  var st=W.left<=0?"done":(pace<=0?"nodata":(pace>=need?"ok":(pace>=need*0.8?"tight":"late")));
  /* 試験まで14日を切ったら、新しい言葉は増やさず復習と模試にしぼる */
  if(days<=14&&W.left>0){st="final";need=0;}
  var eta=pace>0&&W.left>0?p85AddDays(Math.ceil(W.left/pace)):null;
  /* 1日に必要な時間：新しい言葉（6語＝1レッスン約20問）＋その復習（新しい語の約2倍の問題） */
  var per=p85SecPerQ(),lessons=Math.ceil(need/6),mins=Math.round((lessons*20+need*2)*per/60);
  mins=Math.min(mins,240);var rec=mins<=15?15:(mins<=30?30:60);
  return {x:x,days:days,W:W,pace:pace,need:need,buf:buf,learnEnd:p85AddDays(learnDays),st:st,eta:eta,lessons:lessons,mins:mins,rec:rec,acc:p85Acc14()};
}
/* 計画を組み直したら記録する（前の計画と比べて見せるため） */
function p85Replan(P){
  if(!P||P.st==="done")return null;var S=p85Set(),old=S.plan;
  /* 1日に1回まで、2語以上かつ1割以上変わったときだけ組み直す（毎日少しずつ数字が動いて落ち着かないのを防ぐ） */
  if(!old||(old.d!==todayKey()&&Math.abs(old.need-P.need)>=Math.max(2,old.need*0.1))){var prev=old?{d:old.d,need:old.need}:null;S.plan={d:todayKey(),need:P.need,prev:old?prev:null};try{saveAll();}catch(_){}}
  return S.plan;
}
var P85_ST={ok:["間に合うペースです","ok"],tight:["少し遅れています","warn"],late:["このままでは間に合いません","ng"],nodata:["まだ記録が少ないので、計画だけ出します",""],done:["範囲の単語はすべて習いました","ok"],final:["試験直前：復習と模試にしぼる時期です","warn"],past:["試験日が過ぎました",""]};
function p85ExamSheet(edit){
  var S=p85Set(),x=S.exam||{},P=p85ExamPlan(),h='';
  var form='<div class="p85c-form"><label><span>試験の名前</span><input id="p85name" type="text" maxlength="40" value="'+esc(x.name||"ТРКИ-1（B1）")+'"></label>'+
    '<label><span>試験日</span><input id="p85date" type="date" value="'+esc(x.date||"")+'" min="'+todayKey()+'"></label>'+
    '<label><span>目標：この級までの単語を全部習う</span><select id="p85lv">'+["A2","B1"].map(function(l){return '<option'+((x.lv||"B1")===l?" selected":"")+'>'+l+'</option>';}).join("")+'</select></label>'+
    '<label><span>目標の正答率</span><select id="p85acc">'+[66,70,75,80,85,90].map(function(a){return '<option value="'+a+'"'+((x.acc||75)===a?" selected":"")+'>'+a+'%</option>';}).join("")+'</select></label>'+
    '<p class="p85c-err" id="p85err"></p><div class="p85c-fbtn">'+(x.date?'<button type="button" class="p47-btn" data-act="p85exclear">試験日を消す</button>':'')+'<button type="button" class="p47-btn primary" data-act="p85exsave">保存する</button></div>'+
    '<p class="p85c-fnote">ТРКИ-1 の合格ラインは、各分野 66% です。少し上の 75% を目標にすると安心です。</p></div>';
  if(P&&P.st==="past"&&!edit){h='<p class="p85c-fnote" style="margin-top:0">'+esc(x.name||"試験")+'（'+esc(x.date.replace(/-/g,"/"))+'）の日が過ぎました。次の試験日を決めると、また計画を立てます。</p>'+form;}
  else if(!P||edit){h=form;}
  else{
    var Rp=p85Replan(P),stt=P85_ST[P.st];
    h+='<div class="p85c-ex"><div class="p85c-exd"><b>'+esc(x.name||"試験")+'</b><span>'+esc(x.date.replace(/-/g,"/"))+'</span></div><div class="p85c-exn">あと <b>'+P.days+'</b> 日</div>'+
      '<div class="p85c-st '+stt[1]+'">'+stt[0]+'</div></div>';
    h+='<div class="p85c-tbl">'+
      '<div><span>'+esc(x.lv||"B1")+'までの単語</span><b>'+P.W.done.toLocaleString()+' / '+P.W.tot.toLocaleString()+' 語</b><i class="p85c-bar"><i style="width:'+(P.W.tot?Math.round(P.W.done/P.W.tot*100):0)+'%"></i></i></div>'+
      '<div><span>今のペース（この2週間）</span><b>1日 '+P.pace+' 語</b></div>'+
      (P.st!=="done"?'<div><span>必要なペース</span><b>1日 '+P.need+' 語</b><small>残り '+P.W.left.toLocaleString()+' 語を '+p85MD(P.learnEnd)+' までに。最後の'+(P.buf>=21?'3週間':P.buf+'日')+'は復習と模試にあてます。</small></div>':'')+
      (P.eta?'<div><span>このままのペースだと</span><b>'+p85MD(P.eta)+'に習い終わる</b></div>':'')+
      '<div><span>正答率（この2週間）</span><b>'+(P.acc==null?'記録がまだ少ない':P.acc+'%')+'</b><small>目標 '+(x.acc||75)+'%</small></div>';
    try{var mk=settings.p86&&settings.p86.mk&&settings.p86.mk[0];
      if(mk){var f=function(a){return a&&a[1]?Math.round(a[0]/a[1]*100)+'%':'-';};h+='<div><span>ТРКИ ミニ模試（'+p85MD(new Date(mk.d))+'）</span><b>語彙・文法 '+f(mk.lg)+' ・ 読解 '+f(mk.rd)+' ・ 聴解 '+f(mk.au)+'</b><small>合格ラインは各分野 66%</small></div>';}
      else h+='<div><span>ТРКИ ミニ模試</span><b>まだ受けていません</b><small>ホームの「試験対策」から受けられます</small></div>';}catch(_){}
    h+='</div>';
    if(P.st==="final"){h+='<div class="p85c-plan"><b>これからの計画</b><p>試験まで2週間を切りました。新しい言葉はこれ以上増やさず、「今日やること」の復習・苦手な文法・試験形式の練習に集中しましょう。</p></div>';}
    else if(P.st!=="done"){
      h+='<div class="p85c-plan"><b>これからの計画</b><p>1日 <em>'+P.need+' 語</em>（約'+P.lessons+'レッスン）と、その復習。1日の目安は <em>約'+P.mins+(P.mins>=240?'分以上':'分')+'</em> です。</p>'+(P.mins>90?'<p class="p85c-re">1日に使える時間をこえるときは、試験日や目標の級を見直すことも考えてください。</p>':'')+''+
        (Rp&&Rp.prev&&Rp.prev.need!==P.need?'<p class="p85c-re">計画を組み直しました：1日 '+Rp.prev.need+' 語 → '+P.need+' 語（'+(P.need>Rp.prev.need?'遅れを取り戻すため':'先に進めているため')+'）</p>':'')+
        (P.st==="late"||P.st==="tight"?'<p class="p85c-re">今のペースより速くする必要があるので、「今日やること」の新しいレッスンを1日 '+P.lessons+' レッスンにしています。毎日続けるのが難しいときは、試験日や目標の級を見直してください。</p>':'')+
        (S.min<P.rec?'<button type="button" class="p47-btn primary" data-act="p85min" data-val="'+P.rec+'">「今日やること」を '+P.rec+'分 にする</button>':'<p class="p85c-ok">「今日やること」（'+S.min+'分）を毎日こなすと、このペースになります。</p>')+'</div>';
    }
    h+='<button type="button" class="p85c-edit" data-act="p85exedit">試験日・目標を変える</button>';
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
  if(P&&P.st==="past")sub='<button type="button" class="p85c-exb" data-act="p85exedit">試験日が過ぎました。次の試験日を決める ›</button>';
  else if(P){var st=P85_ST[P.st];sub='<button type="button" class="p85c-exb '+st[1]+'" data-act="p85exam">'+esc(P.x.name||"試験")+'まで あと '+P.days+' 日 ・ '+(P.st==="nodata"?'計画を見る':st[0])+' ›</button>';}
  else sub='<button type="button" class="p85c-exb" data-act="p85exam">試験日を決めると、残りの日数から計画を立てます ›</button>';
  return h.replace(/<small>[^<]*<\/small><\/div><div class="p85c-mins"/,sub+'</div><div class="p85c-mins"');
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
  var css='.p85c-exb{display:block;border:0;background:none;padding:2px 0 0;margin:0;font:inherit;font-size:12px;color:var(--muted);text-align:left;cursor:pointer;text-decoration:underline;text-underline-offset:3px;text-decoration-color:var(--line)}'+
    '.p85c-exb.ok{color:var(--accent)}.p85c-exb.warn{color:#C77700}.p85c-exb.ng{color:#D9480F}'+
    '.p85c-form label{display:block;margin:0 0 14px}.p85c-form span{display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px}'+
    '.p85c-form input,.p85c-form select{width:100%;box-sizing:border-box;font:inherit;font-size:16px;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);min-height:46px}'+
    '.p85c-err{color:#D9480F;font-size:13px;min-height:1em;margin:0 0 8px}.p85c-fbtn{display:flex;gap:8px}.p85c-fbtn .p47-btn{flex:1}.p85c-fnote{font-size:12.5px;color:var(--muted);line-height:1.7;margin:12px 0 0}'+
    '.p85c-ex{text-align:center;padding:6px 0 14px}.p85c-exd b{display:block;font-size:15px}.p85c-exd span{font-size:12.5px;color:var(--muted)}.p85c-exn{font-size:15px;margin-top:6px}.p85c-exn b{font-size:40px;font-weight:800;font-variant-numeric:tabular-nums}'+
    '.p85c-st{display:inline-block;margin-top:6px;padding:5px 12px;border-radius:99px;font-size:13px;font-weight:700;border:1px solid var(--line);color:var(--muted)}.p85c-st.ok{color:var(--accent);border-color:var(--accent)}.p85c-st.warn{color:#C77700;border-color:#C77700}.p85c-st.ng{color:#D9480F;border-color:#D9480F}'+
    '.p85c-tbl{border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}.p85c-tbl>div{padding:11px 14px;border-bottom:1px solid var(--line)}.p85c-tbl>div:last-child{border-bottom:0}'+
    '.p85c-tbl span{display:block;font-size:12px;color:var(--muted);font-weight:600}.p85c-tbl b{display:block;font-size:15px;font-weight:700;margin-top:2px;font-variant-numeric:tabular-nums}.p85c-tbl small{display:block;font-size:12px;color:var(--muted);margin-top:3px;line-height:1.6}'+
    '.p85c-bar{display:block;height:6px;border-radius:99px;background:var(--line);margin-top:8px;overflow:hidden}.p85c-bar i{display:block;height:100%;background:var(--accent);border-radius:99px}'+
    '.p85c-plan{margin-top:14px;padding:14px;border-radius:14px;border:1px solid var(--accent)}.p85c-plan>b{font-size:14px}.p85c-plan p{font-size:13.5px;line-height:1.7;margin:6px 0 0}.p85c-plan em{font-style:normal;font-weight:800;color:var(--accent)}'+
    '.p85c-plan .p85c-re{font-size:12.5px;color:var(--muted)}.p85c-plan .p85c-ok{font-size:12.5px;color:var(--muted)}.p85c-plan .p47-btn{width:100%;margin-top:10px}'+
    '.p85c-edit{display:block;width:100%;margin:14px 0 4px;padding:12px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:14px;font-weight:700;cursor:pointer;min-height:44px}'+
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
  h+='<div class="p85c-wnav"><button type="button" class="p85c-wb" data-act="p85wk" data-val="'+p85ShiftKey(key,-1)+'" aria-label="前の週">‹</button><b>'+p85WkLabel(key)+(key===thisWk?'（今週・途中）':'')+'</b>'+
     '<button type="button" class="p85c-wb" data-act="p85wk" data-val="'+p85ShiftKey(key,1)+'"'+(key>=thisWk?' disabled':'')+' aria-label="次の週">›</button></div>';
  if(!W.A.n){return h+'<p class="p85c-empty">この週は記録がありません。</p>';}
  h+='<div class="p85c-grid p85c-wgrid"><div><span>学習時間</span><b>'+Math.round(W.A.s/60)+'<small> 分</small></b><i>'+(W.B.n?(diffMin>=0?'先週より +'+diffMin+'分':'先週より '+diffMin+'分'):'先週の記録なし')+'</i></div>'+
     '<div><span>正答率</span><b>'+W.A.pct+'<small> %</small></b><i>'+(diffPct==null?'先週の記録なし':(diffPct>=0?'先週より +'+diffPct+'ポイント':'先週より '+diffPct+'ポイント'))+'</i></div></div>';
  h+='<div class="p85c-wfacts"><span><b>'+W.A.n+'</b> 問</span><span><b>'+W.studied+'</b> / 7 日</span><span>新しい言葉 <b>'+W.newW+'</b> 語</span></div>';
  try{h+=p60Cols(W.daysMin,["月","火","水","木","金","土","日"],key===thisWk?((new Date().getDay()+6)%7):-1)+'<p class="p85c-wcap">1日ごとの学習時間（分）</p>';}catch(_){}
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
  h+='<div class="p85c-wsec"><b>伸びた点</b><ul>'+good.map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';
  h+='<div class="p85c-wsec"><b>次の週の重点</b><ul>'+next.slice(0,3).map(function(x){return '<li>'+x+'</li>';}).join("")+'</ul></div>';
  /* AIのひとこと（終わった週だけ） */
  if(W.done){
    h+='<div class="p85c-ai" id="p85ai"><b>AIのひとこと</b>'+(cache&&cache.ai?'<p>'+esc(cache.ai)+'</p><small>AI（Claude）が数字を読んで書いた文です。まちがうことがあります。</small><button type="button" class="p85c-airedo" data-act="p85ai" data-val="'+key+'">書き直してもらう</button>':'<p class="p85c-aiwait">'+(P85.aiBusy===key?'考えています…':'')+'</p>')+'</div>';
  }
  return h;
}
/* AIに渡すのは数字だけ（名前やメールなどは渡さない） */
async function p85AskAI(key){
  if(P85.aiBusy)return;var W=p85Week(key);if(!W.A.n||!W.done)return;
  var s=null;try{s=await p55Sample();}catch(_){}
  var box=function(t){var b=document.querySelector("#p85ai .p85c-aiwait");if(b)b.textContent=t;};
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
  return h.replace('<div class="p81-box">','<button type="button" class="p85c-wkb" data-act="p85week" data-val="'+last+'"><b>先週のレポートができました</b><span>'+p85WkLabel(last)+' ・ 学習時間と伸びた点</span>'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</button><div class="p81-box">');
};
/* 記録の画面：「1問ごとの記録」の下に週次レポートと試験の計画への入口 */
var _p85Card=p85Card;
p85Card=function(){
  return _p85Card()+'<div class="p85c-links"><button type="button" class="p47-btn" data-act="p85week" data-val="'+p85WkKey()+'">週次レポート</button><button type="button" class="p47-btn" data-act="p85exam">試験の計画</button></div>';
};
(function(){
  var css='.p85c-wnav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px}.p85c-wnav b{font-size:15px}'+
    '.p85c-wb{width:44px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:20px;cursor:pointer}.p85c-wb[disabled]{opacity:.35;cursor:default}'+
    '.p85c-wgrid{border:1px solid var(--line);border-radius:14px;background:var(--card);overflow:hidden}'+
    '.p85c-wfacts{display:flex;gap:14px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin:12px 2px}.p85c-wfacts b{color:var(--ink);font-weight:800}.p85c-wcap{font-size:12px;color:var(--muted);margin:2px 2px 0;text-align:center}'+
    '.p85c-wsec{margin-top:16px}.p85c-wsec>b{font-size:14px}.p85c-wsec ul{margin:6px 0 0;padding-left:20px}.p85c-wsec li{font-size:13.5px;line-height:1.7;margin:3px 0}'+
    '.p85c-ai{margin-top:16px;padding:14px;border-radius:14px;border:1px solid var(--line);background:var(--card)}.p85c-ai>b{font-size:14px}.p85c-ai p{font-size:14px;line-height:1.8;margin:6px 0 0}.p85c-ai small{display:block;font-size:11.5px;color:var(--muted);margin-top:8px}'+
    '.p85c-aiwait{color:var(--muted)}.p85c-airedo{margin-top:8px;border:0;background:none;color:var(--accent);font:inherit;font-size:12.5px;padding:6px 0;cursor:pointer}'+
    '.p85c-wkb{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 8px;padding:11px 14px;border-radius:12px;border:1px solid var(--accent);background:var(--card);color:var(--ink);text-align:left;cursor:pointer;font:inherit}.p85c-wkb *{pointer-events:none}'+
    '.p85c-wkb b{font-size:14px;white-space:nowrap}.p85c-wkb span{flex:1;min-width:0;font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
    '.p85c-links{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px}.p85c-links .p47-btn{font-size:13px;padding:11px 6px}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE85 手順5：実績の記録と書き出し =====
   ・開始時の実力：到達テストの結果を settings.p85.tests に残す（{d:日付, lv, pct, sp:{v,g,r}}、新しいものを後ろに、50件まで）。
     いちばん古いものが「開始時の実力」。この機能より前に受けたテストは appHist.levelTests から1件だけ取りこむ。
   ・週ごとの数字：settings.p85.wkS = {"週の月曜":[問題数, 正解数, 秒, 学習した日数]}。
     1問ごとの記録から計算し、問題数の多いほうを残す（端末には2か月分の記録しかないので、古い週の数字はここが元になる）。
   ・書き出し（Yuta の選択 2026-11-27：グラフ画像＋数字の表）：PNG 画像（1080×1350）と CSV。名前・メールなどは入れない。
     保存は公開ページの downloads（保存の確認が出る）。使えないときはブラウザのダウンロードにする。 */
var _p85Fin58=p58Finish;
p58Finish=function(){
  var T=ui.p58,r=_p85Fin58.apply(this,arguments);
  try{var S=p85Set(),sc=p58Score(T);if(!Array.isArray(S.tests))S.tests=[];S.tests.push({d:todayKey(),lv:T.lv,pct:sc.pct,sp:sc.sp});if(S.tests.length>50)S.tests.splice(1,S.tests.length-50);saveAll();}catch(_){}
  return r;
};
function p85Tests(){
  var S=p85Set();if(!Array.isArray(S.tests))S.tests=[];
  if(!S.tests.length&&!S.testsOld){var lt=appHist.levelTests||{},old=null;Object.keys(lt).forEach(function(lv){var r=lt[lv];if(r&&r.date&&(!old||r.date<old.d))old={d:r.date,lv:lv,pct:r.last!=null?r.last:r.best,sp:r.sec||null,old:1};});
    S.testsOld=1;if(old){S.tests.push(old);try{saveAll();}catch(_){}}}
  return S.tests;
}
function p85Series(){
  var S=p85Set(),stored=S.wkS||(S.wkS={}),calc={},dayset={};
  Object.keys(P85.log).forEach(function(m){P85.log[m].forEach(function(e){var d=new Date(e[0]*1000),k=p85WkKey(d),r=calc[k]||(calc[k]=[0,0,0,0]);r[0]++;r[1]+=e[3];r[2]+=e[4];var dk=todayKey(d);if(!dayset[dk]){dayset[dk]=1;r[3]++;}});});
  var changed=false;Object.keys(calc).forEach(function(k){if(!stored[k]||stored[k][0]<calc[k][0]){stored[k]=calc[k];changed=true;}});
  if(changed){try{saveAll();}catch(_){}}
  return Object.keys(stored).sort().map(function(k){var r=stored[k];return {k:k,n:r[0],ok:r[1],s:r[2],days:r[3],pct:r[0]?Math.round(r[1]/r[0]*100):null};});
}
function p85Totals(){
  var W=p85Series(),t={n:0,ok:0,s:0,days:0,first:W.length?W[0].k:null};W.forEach(function(w){t.n+=w.n;t.ok+=w.ok;t.s+=w.s;t.days+=w.days;});
  var learned=0;Object.keys(progress).forEach(function(id){var p=progress[id];if(WMAP[id]&&p&&p.status&&p.status!=="new")learned++;});
  t.learned=learned;try{t.known=p47KnownCount();}catch(_){t.known=0;}t.W=W;
  /* 記録の始まり：いちばん古い1問の日 */
  var ms=Object.keys(P85.log).sort();if(ms.length&&P85.log[ms[0]].length){var fd=todayKey(new Date(P85.log[ms[0]][0][0]*1000));if(!t.first||fd<t.first)t.first=fd;}
  return t;
}
function p85HM(sec){var m=Math.round(sec/60);return m>=60?Math.floor(m/60)+"時間"+(m%60?(m%60)+"分":""):m+"分";}
/* 週ごとのグラフ（SVG）：line=正答率の折れ線、bar=学習時間の棒。1系列なので凡例なし（見出しが名前） */
function p85Chart(W,kind){
  var w=320,h=150,pl=30,pr=8,pt=12,pb=24,iw=w-pl-pr,ih=h-pt-pb,n=W.length;if(!n)return '';
  var vals=W.map(function(x){return kind==="line"?x.pct:Math.round(x.s/60);}),mx=kind==="line"?100:Math.max(10,Math.ceil(Math.max.apply(null,vals.map(function(v){return v||0;}))/10)*10);
  var X=function(i){return pl+(n===1?iw/2:i*iw/(n-1));},Y=function(v){return pt+ih-(v||0)/mx*ih;};
  var g='<svg class="p85c-chart" viewBox="0 0 '+w+' '+h+'" role="img" aria-label="'+(kind==="line"?"週ごとの正答率":"週ごとの学習時間")+'">';
  [0,0.5,1].forEach(function(f){var v=Math.round(mx*f),y=Y(v);g+='<line x1="'+pl+'" x2="'+(w-pr)+'" y1="'+y+'" y2="'+y+'" class="p85c-gl"/><text x="'+(pl-5)+'" y="'+(y+3.5)+'" text-anchor="end" class="p85c-tx">'+v+'</text>';});
  var lab=function(i){var d=new Date(W[i].k+"T00:00:00");return (d.getMonth()+1)+"/"+d.getDate();};
  var step=Math.max(1,Math.ceil(n/5));
  if(kind==="bar"){var bw=Math.max(4,Math.min(22,iw/n-4));W.forEach(function(x,i){var cx=n===1?pl+iw/2:pl+(i+0.5)*iw/n,v=vals[i],y=Y(v),hh=Math.max(0,pt+ih-y);
      g+='<rect x="'+(cx-bw/2)+'" y="'+y+'" width="'+bw+'" height="'+hh+'" rx="'+Math.min(4,bw/2)+'" class="p85c-bar1"><title>'+lab(i)+'の週：'+v+'分</title></rect>';
      if((i%step===0&&n-1-i>=step)||i===n-1)g+='<text x="'+cx+'" y="'+(h-6)+'" text-anchor="middle" class="p85c-tx">'+lab(i)+'</text>';});}
  else{var pts=[];W.forEach(function(x,i){if(x.pct!=null)pts.push([X(i),Y(x.pct),i]);});
    if(pts.length>1)g+='<polyline points="'+pts.map(function(p){return p[0]+","+p[1];}).join(" ")+'" class="p85c-ln"/>';
    pts.forEach(function(p){g+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="4" class="p85c-dot"><title>'+lab(p[2])+'の週：'+W[p[2]].pct+'%（'+W[p[2]].n+'問）</title></circle>';});
    W.forEach(function(x,i){if((i%step===0&&n-1-i>=step)||i===n-1)g+='<text x="'+X(i)+'" y="'+(h-6)+'" text-anchor="middle" class="p85c-tx">'+lab(i)+'</text>';});
    if(pts.length){var lp=pts[pts.length-1];g+='<text x="'+Math.min(lp[0],w-pr-4)+'" y="'+(lp[1]-9)+'" text-anchor="end" class="p85c-tv">'+W[lp[2]].pct+'%</text>';}}
  return g+'</svg>';
}
function p85AchHtml(){
  var T=p85Totals(),tests=p85Tests(),W=T.W.slice(-12),h='';
  if(!T.n&&!tests.length)return '<p class="p85c-empty">まだ記録がありません。問題を解くと、ここに累計の数字とグラフがたまっていきます。最初に到達テストを受けておくと、「開始時の実力」として残ります。</p><button type="button" class="p47-btn primary p85c-wide" data-act="p85go" data-val="test:A1">到達テスト（A1）を受ける</button>';
  h+='<div class="p85c-ach">'+
    '<div><span>累計の学習時間</span><b>'+p85HM(T.s)+'</b><small>実際に解いた時間だけ</small></div>'+
    '<div><span>解いた問題</span><b>'+T.n.toLocaleString()+'<small> 問</small></b><small>正答率 '+(T.n?Math.round(T.ok/T.n*100):0)+'%</small></div>'+
    '<div><span>学習した日</span><b>'+T.days+'<small> 日</small></b><small>'+(T.first?T.first.replace(/-/g,"/")+' から':'')+'</small></div>'+
    '<div><span>習った単語</span><b>'+T.learned.toLocaleString()+'<small> 語</small></b><small>覚えた '+T.known.toLocaleString()+' 語</small></div></div>';
  /* 開始時の実力と最新 */
  h+='<div class="p85c-wsec"><b>開始時の実力と、いまの実力（到達テスト）</b>';
  if(tests.length){var b=tests[0],l=tests[tests.length-1],row=function(t,lab){var sp=t.sp||{};return '<div class="p85c-trow"><span>'+lab+'<small>'+String(t.d).replace(/-/g,"/")+' ・ '+t.lv+'</small></span><b>'+t.pct+'%</b><em>'+(sp.v!=null?'語彙 '+sp.v+' ・ 文法 '+sp.g+' ・ 読解 '+sp.r:'')+'</em></div>';};
    h+=row(b,"開始時"+(b.old?"（この機能の前に受けたテスト）":""))+(tests.length>1?row(l,"最新"):'<p class="p85c-fnote">もう一度受けると、最新の結果と並べて比べられます。</p>');}
  else h+='<p class="p85c-fnote">まだ到達テストを受けていません。一度受けると「開始時の実力」として残ります。</p><button type="button" class="p47-btn p85c-wide" data-act="p85go" data-val="test:A1">到達テスト（A1）を受ける</button>';
  h+='</div>';
  if(W.length){
    h+='<div class="p85c-wsec"><b>週ごとの正答率（%）</b>'+p85Chart(W,"line")+'</div>';
    h+='<div class="p85c-wsec"><b>週ごとの学習時間（分）</b>'+p85Chart(W,"bar")+'</div>';
    h+='<details class="p85c-tbl2"><summary>数字の表で見る</summary><table><tr><th>週</th><th>時間</th><th>問題</th><th>正答率</th><th>日数</th></tr>'+W.slice().reverse().map(function(x){return '<tr><td>'+x.k.slice(5).replace("-","/")+'〜</td><td>'+Math.round(x.s/60)+'分</td><td>'+x.n+'</td><td>'+(x.pct==null?'-':x.pct+'%')+'</td><td>'+x.days+'</td></tr>';}).join("")+'</table></details>';
  }
  h+='<div class="p85c-wsec"><b>公開用に書き出す</b><p class="p85c-fnote">グラフと数字を1枚にした画像と、週ごとの数字の表（CSV）を保存できます。名前やメールアドレスは入りません。</p>'+
    '<div class="p85c-links"><button type="button" class="p47-btn primary" data-act="p85png">画像で保存</button><button type="button" class="p47-btn" data-act="p85csv">数字の表（CSV）</button></div></div>';
  return h;
}
function p85OpenAch(){
  var m=document.getElementById("p85sheet");if(!m){m=document.createElement("div");m.id="p85sheet";document.body.appendChild(m);}
  m.innerHTML='<div class="p81-mask" data-act="p85exclose"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="学習の実績"><div class="p81-ph"><b>学習の実績</b><button type="button" class="p81-x" data-act="p85exclose" aria-label="閉じる">'+(typeof p81Ic==="function"?p81Ic("x",18):"✕")+'</button></div><div class="p81-pb">'+p85AchHtml()+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");
}
/* ---- 書き出し ---- */
async function p85Save(name,data,mime){
  try{var dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null;
    if(dl){await dl.save({filename:name,data:data});toast("保存しました");return;}}
  catch(e){if(e&&e.code==="declined"){toast("保存を取りやめました");return;}if(e&&e.code==="rate_limited"){toast("少し待ってからもう一度押してください");return;}}
  try{var blob=data instanceof Blob?data:new Blob([data],{type:mime}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},300);toast("書き出しました");}
  catch(_){toast("この画面では保存できませんでした");}
}
function p85Csv(){
  var T=p85Totals(),tests=p85Tests(),L=[];
  var q=function(v){v=String(v==null?"":v);return /[",\n]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v;};
  L.push("# ロシア語の学習記録（"+todayKey()+" 書き出し）");
  L.push("項目,値");
  L.push(["記録の開始",T.first||""].map(q).join(","));
  L.push(["累計の学習時間（分・実際に解いた時間）",Math.round(T.s/60)].join(","));
  L.push(["解いた問題",T.n].join(","));L.push(["正答率（%）",T.n?Math.round(T.ok/T.n*100):""].join(","));
  L.push(["学習した日",T.days].join(","));L.push(["習った単語",T.learned].join(","));L.push(["覚えた単語",T.known].join(","));
  L.push("");L.push("到達テスト,日付,レベル,全体（%）,語彙（%）,文法（%）,読解・聞き取り（%）");
  tests.forEach(function(t,i){var sp=t.sp||{};L.push([i===0?"開始時":"",t.d,t.lv,t.pct,sp.v,sp.g,sp.r].map(q).join(","));});
  L.push("");L.push("週（月曜）,学習時間（分）,解いた問題,正解,正答率（%）,学習した日数");
  T.W.forEach(function(w){L.push([w.k,Math.round(w.s/60),w.n,w.ok,w.pct==null?"":w.pct,w.days].join(","));});
  return "﻿"+L.join("\r\n");   /* 先頭の ﻿ は Excel で文字化けしないための印 */
}
function p85Png(){
  var T=p85Totals(),tests=p85Tests(),W=T.W.slice(-12),c=document.createElement("canvas"),X=c.getContext("2d");
  c.width=1080;c.height=1350;
  var F='"Hiragino Sans","Noto Sans JP",system-ui,sans-serif',ink="#1C1C1E",mut="#6B6B72",acc="#0A6CDB",line="#E2E3E8";
  X.fillStyle="#FFFFFF";X.fillRect(0,0,1080,1350);
  X.fillStyle=ink;X.font="800 54px "+F;X.fillText("ロシア語の学習記録",72,130);
  X.fillStyle=mut;X.font="500 30px "+F;X.fillText((T.first?T.first.replace(/-/g,"/")+" 〜 ":"")+todayKey().replace(/-/g,"/"),72,180);
  var cells=[["学習時間",p85HM(T.s)],["解いた問題",T.n.toLocaleString()+"問"],["正答率",(T.n?Math.round(T.ok/T.n*100):0)+"%"],["学習した日",T.days+"日"],["習った単語",T.learned.toLocaleString()+"語"],["到達テスト",tests.length?(tests.length>1?tests[0].pct+"% → "+tests[tests.length-1].pct+"%":tests[0].pct+"%"):"—"]];
  cells.forEach(function(cl,i){var x=72+(i%3)*320,y=250+Math.floor(i/3)*150;X.strokeStyle=line;X.lineWidth=2;X.beginPath();X.roundRect?X.roundRect(x,y,296,126,18):X.rect(x,y,296,126);X.stroke();
    X.fillStyle=mut;X.font="600 26px "+F;X.fillText(cl[0],x+24,y+44);X.fillStyle=ink;X.font="800 44px "+F;X.fillText(cl[1],x+24,y+100);});
  function chart(y0,title,kind){
    X.fillStyle=ink;X.font="700 32px "+F;X.fillText(title,72,y0);
    var pl=140,pr=72,top=y0+34,h=220,iw=1080-pl-pr,n=W.length;if(!n){X.fillStyle=mut;X.font="500 26px "+F;X.fillText("まだ記録がありません",pl,top+60);return;}
    var vals=W.map(function(x){return kind==="line"?x.pct:Math.round(x.s/60);}),mx=kind==="line"?100:Math.max(10,Math.ceil(Math.max.apply(null,vals.map(function(v){return v||0;}))/10)*10);
    var Y=function(v){return top+h-(v||0)/mx*h;};
    X.font="500 22px "+F;X.textAlign="right";[0,0.5,1].forEach(function(f){var v=Math.round(mx*f),y=Y(v);X.strokeStyle=line;X.lineWidth=1.5;X.beginPath();X.moveTo(pl,y);X.lineTo(1080-pr,y);X.stroke();X.fillStyle=mut;X.fillText(String(v),pl-14,y+8);});
    X.textAlign="center";var step=Math.max(1,Math.ceil(n/6));
    var lab=function(i){var d=new Date(W[i].k+"T00:00:00");return (d.getMonth()+1)+"/"+d.getDate();};
    if(kind==="bar"){var bw=Math.min(48,iw/n-12);W.forEach(function(x,i){var cx=pl+(i+0.5)*iw/n,v=vals[i],y=Y(v);X.fillStyle=acc;X.beginPath();if(X.roundRect)X.roundRect(cx-bw/2,y,bw,Math.max(0,top+h-y),[6,6,0,0]);else X.rect(cx-bw/2,y,bw,Math.max(0,top+h-y));X.fill();
        if((i%step===0&&n-1-i>=step)||i===n-1){X.fillStyle=mut;X.fillText(lab(i),cx,top+h+36);}});}
    else{var XX=function(i){return n===1?pl+iw/2:pl+i*iw/(n-1);},pts=[];W.forEach(function(x,i){if(x.pct!=null)pts.push([XX(i),Y(x.pct),i]);});
      X.strokeStyle=acc;X.lineWidth=4;X.beginPath();pts.forEach(function(p,j){if(j)X.lineTo(p[0],p[1]);else X.moveTo(p[0],p[1]);});X.stroke();
      pts.forEach(function(p){X.fillStyle="#fff";X.beginPath();X.arc(p[0],p[1],9,0,7);X.fill();X.fillStyle=acc;X.beginPath();X.arc(p[0],p[1],6,0,7);X.fill();});
      W.forEach(function(x,i){if((i%step===0&&n-1-i>=step)||i===n-1){X.fillStyle=mut;X.fillText(lab(i),XX(i),top+h+36);}});
      if(pts.length){var lp=pts[pts.length-1];X.fillStyle=ink;X.font="700 26px "+F;X.textAlign="right";X.fillText(W[lp[2]].pct+"%",Math.min(lp[0],1080-pr),lp[1]-20);}}
    X.textAlign="left";
  }
  chart(620,"週ごとの正答率（%）","line");
  chart(985,"週ごとの学習時間（分）","bar");
  X.fillStyle=mut;X.font="500 22px "+F;X.fillText("学習時間は、実際に問題を解いていた時間だけを数えています。",72,1318);
  return c;
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(a!=="p85ach"&&a!=="p85png"&&a!=="p85csv")return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p85ach"){p85OpenAch();return;}
  if(a==="p85csv"){p85Save("russian_record_"+todayKey()+".csv",p85Csv(),"text/csv");return;}
  if(a==="p85png"){try{var c=p85Png();c.toBlob(function(b){if(b)p85Save("russian_record_"+todayKey()+".png",b,"image/png");else toast("画像を作れませんでした");},"image/png");}catch(_){toast("画像を作れませんでした");}return;}
},true);
/* 「今日やること」の提案ボタンを、実績の画面の中から押したとき（到達テスト）はシートを閉じる */
document.addEventListener("click",function(e){var el=e.target.closest&&e.target.closest('#p85sheet [data-act="p85go"]');if(el)p85CloseExam();},true);
/* 記録の画面の入口を3つにする */
var _p85Card2=p85Card;
p85Card=function(){return _p85Card2().replace('<div class="p85c-links">','<div class="p85c-links p85c-links3"><button type="button" class="p47-btn" data-act="p85ach">学習の実績</button>');};
(function(){
  var css='.p85c-ach{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--card)}'+
    '.p85c-ach>div{padding:12px 14px;border-bottom:1px solid var(--line)}.p85c-ach>div:nth-child(odd){border-right:1px solid var(--line)}.p85c-ach>div:nth-last-child(-n+2){border-bottom:0}'+
    '.p85c-ach span{display:block;font-size:12px;color:var(--muted);font-weight:600}.p85c-ach b{display:block;font-size:22px;font-weight:800;margin-top:2px;font-variant-numeric:tabular-nums}.p85c-ach b small{font-size:13px;color:var(--muted);font-weight:600}.p85c-ach>div>small{display:block;font-size:12px;color:var(--muted);margin-top:2px}'+
    '.p85c-trow{display:grid;grid-template-columns:1fr auto;gap:2px 10px;padding:10px 0;border-bottom:1px solid var(--line)}.p85c-trow span{font-size:13.5px;font-weight:700}.p85c-trow span small{display:block;font-size:12px;color:var(--muted);font-weight:500}'+
    '.p85c-trow b{font-size:22px;font-weight:800;align-self:center}.p85c-trow em{grid-column:1/-1;font-style:normal;font-size:12px;color:var(--muted)}'+
    '.p85c-chart{display:block;width:100%;height:auto;margin-top:6px}.p85c-gl{stroke:var(--line);stroke-width:1}.p85c-tx{fill:var(--muted);font-size:10px}.p85c-tv{fill:var(--ink);font-size:11px;font-weight:700}'+
    '.p85c-ln{fill:none;stroke:var(--accent);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.p85c-dot{fill:var(--accent);stroke:var(--bg);stroke-width:2}.p85c-bar1{fill:var(--accent)}'+
    '.p85c-tbl2{margin-top:14px;border:1px solid var(--line);border-radius:12px;overflow:hidden}.p85c-tbl2 summary{padding:11px 14px;font-size:13.5px;font-weight:700;cursor:pointer}'+
    '.p85c-tbl2 table{width:100%;border-collapse:collapse;font-size:13px;font-variant-numeric:tabular-nums}.p85c-tbl2 th,.p85c-tbl2 td{padding:7px 8px;border-top:1px solid var(--line);text-align:right}.p85c-tbl2 th:first-child,.p85c-tbl2 td:first-child{text-align:left}.p85c-tbl2 th{color:var(--muted);font-weight:600;font-size:12px}'+
    '.p85c-wide{width:100%;margin-top:10px}.p85c-links3{grid-template-columns:1fr 1fr 1fr}.p85c-links3 .p47-btn{font-size:12.5px;padding:11px 4px}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== settings.p85 を2台の端末で合わせる（レビューで見つかった問題の修正） =====
   クラウドの設定文書は丸ごと新しいほうが勝つ（phase50）。そのままだと、別の端末で受けた到達テストの履歴などが消える。
   そこで p85 だけは、両方を足し合わせる：tests は日付・級・点数で重ならないように足す、wkS は週ごとに問題数の多いほう、wk は新しいほう。 */
function p85MergeP85(a,b){
  a=(a&&typeof a==="object")?a:{};b=(b&&typeof b==="object")?b:{};var o={};Object.keys(a).forEach(function(k){o[k]=a[k];});Object.keys(b).forEach(function(k){o[k]=b[k];});
  var seen={},t=[];(Array.isArray(a.tests)?a.tests:[]).concat(Array.isArray(b.tests)?b.tests:[]).forEach(function(x){if(!x)return;var k=x.d+"|"+x.lv+"|"+x.pct;if(seen[k])return;seen[k]=1;t.push(x);});
  t.sort(function(x,y){return x.d<y.d?-1:(x.d>y.d?1:0);});if(t.length>50)t.splice(1,t.length-50);if(t.length)o.tests=t;
  var w={};[a.wkS||{},b.wkS||{}].forEach(function(src){Object.keys(src).forEach(function(k){if(!w[k]||(src[k]&&src[k][0]>w[k][0]))w[k]=src[k];});});o.wkS=w;
  var c={};[a.wk||{},b.wk||{}].forEach(function(src){Object.keys(src).forEach(function(k){if(!c[k]||(src[k]&&(src[k].at||0)>(c[k].at||0)))c[k]=src[k];});});o.wk=c;
  return o;
}
function p85MergeSettings(remote){try{if(remote&&remote.p85){settings.p85=p85MergeP85(settings.p85,remote.p85);}}catch(_){}}
var _p85Adopt2=p50Adopt;
p50Adopt=function(docId,obj){
  var before=docId==="settings"?settings.p85:null;
  var r=_p85Adopt2.apply(this,arguments);
  if(docId==="settings"&&before)settings.p85=p85MergeP85(before,settings.p85);
  return r;
};

/* ===== PHASE85 手順6：まちがいの分析と、自分専用の講義 =====
   2026-11-27 Yuta の追加の要望：「解けなかった問題を裏で分析し、学ぶべき所を取り出して提案。集めたデータで講義を作る」。
   ・分析はアプリの中の計算（通信なし・すぐ）。開いたとき・画面を描くときに、この30日の1問ごとの記録から数える。
   ・弱点のまとまり（キー）：
       "g:章ID"   文法解説書の章（レッスンの形の問題・章の練習・到達テストの文法タグから）
       "t:p1〜p4" 検定（ТРКИ）の試験形式のパート、"t:rd" 読解、"t:au" 聴解、"t:gr" 語の形
       "w:分類"   言葉の分類（単語帳の category）。形の問題（f: のタグ）は文法として数え、ここには入れない
   ・優先の点数 ＝ まちがいの数（新しいほど重い：10日で半分）×（1－正答率）。まちがいが2回以上、正答率85%未満だけ。
     最近3回続けて正解していれば「回復中」として点数を下げる。
   ・講義：①やさしい解説（解説書の章から。理由つき）②あなたがまちがえた問題と正しい答え ③覚え方のコツ（取りちがえた組み合わせ・
     覚える1文・間隔をあけた確認）④確認の問題。「AIで深める」は押したときだけ Claude が書く（ロシア語は問題文の語だけを使う）。
   ・間隔をあけた確認：講義を開いた日を settings.p85.lr[キー]={d:日付, s:段階} に残し、1日後・3日後・7日後に、まだ弱点なら
     「今日やること」に「講義の確認」を出す。その日にそのまとまりの問題を3問以上解くと次の段階へ進む。 */
var P85_TP={1:"語の意味と使い分け",2:"名詞・代名詞の格",3:"動詞（体・移動・活用）",4:"文のつなぎ方"};
var P85_TCH={2:"cases",3:"aspect",4:"conj",gr:"cases"};/* 検定のパートを説明する解説書の章 */
var P85_GAP=[1,3,7];
function p85Plain(s){return String(s||"").replace(/<[^>]*>/g,"").replace(/\u0301/g,"").trim().toLowerCase();}
function p85WordByText(t){
  if(!P85.wx){P85.wx={};try{VOCAB.forEach(function(w){var k=p85Plain(w.word);if(k&&!P85.wx[k])P85.wx[k]=w.id;});}catch(_){}}
  return P85.wx[p85Plain(t)]||null;
}
function p85Keys(e){
  var ks=[],g=e[5]||[],m=e[1],form=false;
  g.forEach(function(t){if(p85IsCh(t))ks.push("g:"+t);if(/^f:/.test(t))form=true;});
  if(m==="trki"){
    var p=g.filter(function(t){return /^trki-p\d$/.test(t);})[0];
    if(p)ks.push("t:p"+p.slice(6));else if(g.indexOf("trki-rd")>=0)ks.push("t:rd");else if(g.indexOf("trki-au")>=0||g.indexOf("trki-hs")>=0)ks.push("t:au");else if(g.indexOf("trki-gr")>=0)ks.push("t:gr");
  }
  if(m!=="gp"&&m!=="compose"&&!form){
    var wid=WMAP[e[2]]?e[2]:null;if(!wid){var mm=/^trki:vo:(.+)$/.exec(e[2]);if(mm&&WMAP[mm[1]])wid=mm[1];}
    if(!wid&&e[6]&&WMAP[e[6][0]])wid=e[6][0];
    if(wid)ks.push("w:"+(WMAP[wid].category||"その他"));
  }
  return ks;
}
function p85KeyName(k){
  var t=k.slice(2);
  if(k[0]==="g")return p85ChName(t)||t;
  if(k[0]==="t")return t==="rd"?"検定の読解":(t==="au"?"検定の聴解":(t==="gr"?"検定の語の形（語尾）":"検定 "+(P85_TP[t.slice(1)]||t)));
  return "言葉（"+t+"）";
}
function p85KeyKind(k){return k[0]==="g"?"文法":(k[0]==="t"?"検定":"言葉");}
/* 弱点のまとまりを、優先の高い順に */
function p85Weak(days){
  if(P85.wkCache&&P85.wkCache.at===P85.logN()&&P85.wkCache.d===todayKey())return P85.wkCache.r;
  var now=Date.now()/1000,B={};
  p85Recent(days||30).forEach(function(e){
    var ks=p85Keys(e);if(!ks.length)return;var wt=Math.pow(0.5,(now-e[0])/86400/10);
    ks.forEach(function(k){var b=B[k]||(B[k]={k:k,n:0,ok:0,miss:0,wm:0,wk:0,all:[],bad:[],ids:{}});
      b.n++;b.ok+=e[3];b.all.push(e);
      if(!e[3]){b.miss++;b.wm+=wt;if(now-e[0]<7*86400)b.wk++;b.bad.push(e);(e[6]||[]).forEach(function(id){if(WMAP[id])b.ids[id]=(b.ids[id]||0)+1;});
        if(k[0]==="w"&&WMAP[e[2]])b.ids[e[2]]=(b.ids[e[2]]||0)+(e[6]&&e[6].indexOf(e[2])>=0?0:1);}
    });
  });
  var r=Object.keys(B).map(function(k){return B[k];}).filter(function(b){return b.miss>=2&&b.ok/b.n<0.85;}).map(function(b){
    b.pct=Math.round(b.ok/b.n*100);b.score=b.wm*(1-b.ok/b.n);
    var last=b.all.slice(-3);b.rec=last.length===3&&last.every(function(e){return e[3];});if(b.rec)b.score*=0.4;
    b.why="この30日、"+b.n+"問中"+b.ok+"問正解（"+b.pct+"%）。まちがいは"+b.miss+"回"+(b.wk?"で、うち"+b.wk+"回はこの1週間":"")+"。"+(b.rec?"最近は3回続けて正解していて、回復中です。":"");
    return b;}).sort(function(a,b){return b.score-a.score;});
  P85.wkCache={at:P85.logN(),d:todayKey(),r:r};
  return r;
}
P85.logN=function(){var n=0;Object.keys(P85.log).forEach(function(m){n+=P85.log[m].length;});return n;};
function p85WeakGet(k){return p85Weak().filter(function(b){return b.k===k;})[0]||null;}

/* ---- 講義の中身 ---- */
function p85Guide(id){return (window.P72_GUIDE||[]).filter(function(c){return c.id===id;})[0]||null;}
/* 章の本文から「やさしく」の部分、まちがえやすい所、最初の例文を取り出す */
function p85GuideParts(id){
  var g=p85Guide(id);if(!g)return null;var b=String(g.b||""),secs=b.split("<h4>");
  var easy="",ei=-1;secs.forEach(function(s,i){if(ei<0&&/^やさしく<\/h4>/.test(s)){easy=s.replace(/^やさしく<\/h4>/,"");ei=i;}});
  /* 「やさしく」が短い章は、次の見出しの部分（例文の前まで）も入れる */
  if(ei>=0&&easy.replace(/<[^>]*>/g,"").length<200&&secs[ei+1]&&!/^例文/.test(secs[ei+1]))easy+="<h4>"+secs[ei+1];
  if(!easy)easy=(secs[0]&&secs[0].trim())?secs[0]:(secs[1]||"").replace(/^[^<]*<\/h4>/,"");
  var notes=[],re=/<p class="p72-n">([\s\S]*?)<\/p>/g,m;while((m=re.exec(b))&&notes.length<3)notes.push(m[1]);
  var eg=/<p class="p72-eg">([\s\S]*?)<\/p>/.exec(b),eg2=/<ul class="p72-ex"><li><b>([\s\S]*?)<\/b><span>([\s\S]*?)<\/span>/.exec(b);
  return {t:g.t,easy:easy,notes:notes,eg:eg?eg[1]:(eg2?eg2[1]+"<br>"+eg2[2]:"")};
}
/* まちがえた問題（同じ問題は新しい1回だけ。あとで正解したかも見る） */
function p85Mistakes(b){
  var seen={},out=[];
  b.bad.slice().reverse().forEach(function(e){var k=e[7]?e[7][0]+"|"+e[7][2]:e[2];if(seen[k])return;seen[k]=1;
    var later=b.all.some(function(x){return x[2]===e[2]&&x[0]>e[0]&&x[3];});out.push({e:e,x:e[7]||null,fixed:later});});
  return out;
}
/* 覚え方のコツ（記録から計算） */
function p85Tips(b,M){
  var tips=[],pairs={},forms={};
  b.bad.forEach(function(e){var x=e[7];if(!x||!x[1]||!x[2])return;
    var fm=/正解の形：([^／]*)(?:／選んだ形：(.*))?/.exec(x[3]||"");
    if(fm&&fm[2]){var fk=fm[2]+"→"+fm[1];forms[fk]=(forms[fk]||0)+1;}
    else{var pk=p85Plain(x[1])+"｜"+p85Plain(x[2]);if(p85Plain(x[1])!==p85Plain(x[2]))pairs[pk]=(pairs[pk]||{a:x[1],p:x[2],n:0}),pairs[pk].n++;}
  });
  Object.keys(forms).sort(function(a,c){return forms[c]-forms[a];}).slice(0,2).forEach(function(k){var f=k.split("→");
    tips.push("<b>形の取りちがえ</b>：正しくは「"+esc(f[1])+"」の所で「"+esc(f[0])+"」を選んだことが"+forms[k]+"回あります。どちらの形になるかは、文の中の前置詞や動詞などが決めています。問題文で、形を決めている語に印をつけてから選びましょう。");});
  Object.keys(pairs).sort(function(a,c){return pairs[c].n-pairs[a].n;}).slice(0,2).forEach(function(k){var P=pairs[k],ia=p85WordByText(P.a),ip=p85WordByText(P.p);
    tips.push("<b>まぎらわしい組み合わせ</b>："+esc(P.a)+(ia?"（"+esc(WMAP[ia].meaning)+"）":"")+" と "+esc(P.p)+(ip?"（"+esc(WMAP[ip].meaning)+"）":"")+(P.n>1?" を"+P.n+"回":" を")+"取りちがえました。2つを並べて、ちがいを1つ言えるようにすると混ざりにくくなります。");});
  if(b.k[0]==="g"){var G=p85GuideParts(b.k.slice(2));if(G&&G.eg)tips.push("<b>この1文を覚える</b>：ルールより、正しい例文を1つ丸ごと覚えるほうが形は残ります。声に出して3回読みましょう。<div class=\"p72-eg\">"+G.eg+"</div>");}
  if(b.k[0]==="w")tips.push("<b>言葉の覚え方</b>：意味だけでなく、例文の中で覚えると思い出しやすくなります。下の「まちがえた言葉だけ練習」で、思い出せるか確かめましょう。");
  if(b.k==="t:rd")tips.push("<b>読解のコツ</b>：先に質問を読んで、何を探すかを決めてから本文を読みます。答えを選んだら、その根拠になる文を本文の中で指させるか確かめます。知らない語があっても、前後の文から意味を推測して先へ進みます。");
  if(b.k==="t:au")tips.push("<b>聴解のコツ</b>：1回目は「だれが・どこで・何をするか」の全体だけをつかみ、2回目で数字・時刻・場所を聞き取ります。選択肢は聞く前に読んでおきます。");
  tips.push("<b>間をあけて確認</b>：今日この講義を読んだら、1日後・3日後・7日後に確認の問題をもう一度解きます。忘れかけたころに思い出すと、記憶が長く残ります。「今日やること」に自動で出ます。");
  return tips;
}
function p85Lec(k){
  var b=p85WeakGet(k);
  if(!b){/* もう弱点ではない（回復した）ときも、記録があれば講義は見られるようにする */
    var all=p85Recent(30).filter(function(e){return p85Keys(e).indexOf(k)>=0;});
    b={k:k,n:all.length,ok:all.filter(function(e){return e[3];}).length,all:all,bad:all.filter(function(e){return !e[3];}),ids:{},wk:0,miss:0};
    b.bad.forEach(function(e){(e[6]||[]).forEach(function(id){if(WMAP[id])b.ids[id]=1;});});
    b.pct=b.n?Math.round(b.ok/b.n*100):0;b.why=b.n?"この30日、"+b.n+"問中"+b.ok+"問正解（"+b.pct+"%）。今は弱点の一覧から外れています。":"まだ記録がありません。";b.gone=1;
  }
  return b;
}
function p85LecHtml(k){
  var b=p85Lec(k),M=p85Mistakes(b),h='',ic=function(n,s){return typeof p81Ic==="function"?p81Ic(n,s):"";};
  h+='<div class="p85c-lhead"><span class="p85c-tag">'+p85KeyKind(k)+'</span><b>'+esc(p85KeyName(k))+'</b><small>'+esc(b.why)+'</small></div>';
  /* ① やさしい解説 */
  var ch=k[0]==="g"?k.slice(2):(k[0]==="t"?P85_TCH[k.slice(2).replace(/^p/,"")]||P85_TCH[k.slice(2)]:null),G=ch?p85GuideParts(ch):null;
  h+='<div class="p85c-lsec"><b>① やさしい解説</b>';
  if(G){h+=(k[0]==="t"?'<p class="p85c-fnote">検定のこの部分は、解説書の「'+esc(String(G.t).replace(/（.*$/,""))+'」の内容が土台です。</p>':'')+'<div class="p85c-lbody">'+G.easy+'</div>';
    if(G.notes.length)h+='<div class="p85c-lnote"><b>まちがえやすい所</b>'+G.notes.map(function(n){return '<p>'+n.replace(/^まちがえやすい所[：:]\s*/,"")+'</p>';}).join("")+'</div>';
    h+='<button type="button" class="p85c-lmore" data-act="p85lguide" data-val="'+esc(ch)+'">解説書でこの章をぜんぶ読む '+ic("go",14)+'</button>';}
  else{
    var ids=Object.keys(b.ids).slice(0,8);
    if(ids.length)h+='<p class="p85c-fnote">まちがえた言葉の意味と使い方です。</p>'+ids.map(function(id){var w=WMAP[id];return '<div class="p85c-lw"><b>'+esc(w.accent||w.word)+'</b><span>'+esc(w.meaning)+'</span>'+(w.simpleExp?'<small>'+esc(w.simpleExp)+'</small>':'')+(w.exRu?'<div class="p72-eg">'+esc(w.exRu)+'<br>'+esc(w.exJa||"")+'</div>':'')+'</div>';}).join("");
    else if(k==="t:rd")h+='<p>読解の問題は、本文の中に答えの根拠が必ずあります。まちがえたときは「本文のどの文を見れば分かったか」を探すと、次に同じ形の質問が来たときに速く見つけられます。</p>';
    else if(k==="t:au")h+='<p>聴解の問題は、細かい語を全部聞き取れなくても解けるように作られています。だれが話しているか、何を頼んでいるか、という全体の流れをまずつかみます。</p>';
    else if(k==="t:p1")h+='<p>このパートは、意味の近い言葉の中から、文に合うものを選ぶ問題です。似た言葉は、いっしょに使う語（どの前置詞・どの格と使うか）で区別できることが多いです。</p>';
    else h+='<p class="p85c-fnote">この分野の解説はまだありません。下のまちがえた問題と正しい答えを見比べてください。</p>';
  }
  h+='</div>';
  /* ② まちがえた問題 */
  h+='<div class="p85c-lsec"><b>② あなたがまちがえた問題</b>';
  var shown=M.filter(function(o){return o.x||WMAP[o.e[2]];}).slice(0,6);
  if(!shown.length)h+='<p class="p85c-fnote">まちがえた問題の文は、この機能を入れた日から残ります。次にまちがえたときから、ここに出ます。</p>';
  shown.forEach(function(o){var x=o.x,w=WMAP[o.e[2]];
    h+='<div class="p85c-lq">'+(x?'<div class="p85c-lqs">'+esc(x[0])+'</div><div class="p85c-lqa"><span class="ok">○ '+esc(x[1])+'</span>'+(x[2]?'<span class="ng">× '+esc(x[2])+'</span>':'')+'</div>'+(x[3]&&!/^(意味の取りちがえ|到達テスト・|つづり)/.test(x[3])?'<small>'+esc(x[3])+'</small>':''):
      '<div class="p85c-lqs">'+esc(w.accent||w.word)+' ＝ '+esc(w.meaning)+'</div>')+(o.fixed?'<em class="p85c-fixed">そのあと正解しました</em>':'')+'</div>';});
  if(M.length>shown.length&&shown.length)h+='<p class="p85c-fnote">ほかに '+(M.length-shown.length)+' 問あります。</p>';
  h+='</div>';
  /* ③ 覚え方のコツ */
  h+='<div class="p85c-lsec"><b>③ 覚え方のコツ</b><ul class="p85c-ltips">'+p85Tips(b,M).map(function(t){return '<li>'+t+'</li>';}).join("")+'</ul></div>';
  /* ④ 確認の問題 */
  h+='<div class="p85c-lsec"><b>④ 確認の問題</b><p class="p85c-fnote">読んだら、すぐに解いて確かめましょう。</p><div class="p85c-lbtns">';
  var gpOk=false;if(ch){try{gpOk=!!(window.P82_Q&&P82_Q[ch]&&P82_Q[ch].length)||p77GpSteps(ch).length>0;}catch(_){}}
  if(gpOk&&k[0]==="g")h+='<button type="button" class="p47-btn primary" data-act="p85lgo" data-val="gp:'+esc(ch)+'">この文法の問題を解く</button>';
  if(k[0]==="t")h+='<button type="button" class="p47-btn primary" data-act="p85lgo" data-val="tk:'+esc(k.slice(2))+'">検定のこの分野を解く</button>';
  if(Object.keys(b.ids).length)h+='<button type="button" class="p47-btn'+(k[0]==="w"?" primary":"")+'" data-act="p85lgo" data-val="wd:'+esc(k)+'">まちがえた言葉だけ練習（'+Math.min(20,Object.keys(b.ids).length)+'語）</button>';
  if(gpOk&&k[0]==="t")h+='<button type="button" class="p47-btn" data-act="p85lgo" data-val="gp:'+esc(ch)+'">解説書の章の問題を解く</button>';
  h+='</div></div>';
  /* AIで深める */
  var S=p85Set(),c=(S.lec||{})[k];
  h+='<div class="p85c-ai" id="p85lai"><b>AIで深める</b>'+(c&&c.ai?'<p>'+esc(c.ai).replace(/\n/g,"<br>")+'</p><small>Claude（AI）が、あなたのまちがい方を読んで書いた説明です。まちがいがあるかもしれません。</small><button type="button" class="p85c-airedo" data-act="p85lai" data-val="'+esc(k)+'">書き直してもらう</button>':
    '<p class="p85c-fnote">Claudeが、あなたのまちがい方に合わせて「なぜその答えになるのか」を説明します。押したときだけ使います。</p><button type="button" class="p47-btn" data-act="p85lai" data-val="'+esc(k)+'">AIに説明してもらう</button><p class="p85c-aiwait"></p>')+'</div>';
  return h;
}
async function p85LecAI(k){
  if(P85.lecBusy)return;var b=p85Lec(k),M=p85Mistakes(b).filter(function(o){return o.x;}).slice(0,6);
  var box=function(t){var e=document.querySelector("#p85lai .p85c-aiwait");if(e)e.textContent=t;};
  var s=null;try{s=await p55Sample();}catch(_){}
  if(!s){box("AIの説明は、Claudeのページとして開いたときに使えます。");return;}
  if(!M.length){box("まちがえた問題の文がまだ残っていないので、説明できません。次にまちがえたあとで押してください。");return;}
  P85.lecBusy=k;box("考えています…");
  var data={分野:p85KeyName(k),正答率:b.pct,まちがえた問題:M.map(function(o){return {問題文:o.x[0],正解:o.x[1],選んだ答え:o.x[2],メモ:o.x[3]};})};
  var prompt="あなたは日本人の初心者にロシア語を教える先生です。次は、ある学習者がまちがえた問題です。\n"+JSON.stringify(data)+"\n\n"+
    "日本語で、この人のためだけの短い講義を書いてください。ルール：\n1. まず、まちがえ方に共通する原因を1つ、やさしい言葉で言う。\n2. 次に、問題ごとに「なぜ正解はその形・その語になるのか」を、性・格・体などの理由まで1〜2文で説明する。専門用語には短い言い換えをつける。\n3. 最後に、次に同じ問題が来たときの見分け方を1つ。\n4. ロシア語は、上の問題文・正解・選んだ答えに出てくる語だけを使う。新しいロシア語の文や単語は作らない。\n5. 見出し記号（#）・表・絵文字は使わない。全体で400字くらいまで。\n6. "+(typeof P55_SAFE==="string"?P55_SAFE:"")+"\n講義の文だけを返してください。";
  try{
    var r=await s(prompt),t=String(r&&r.text||"").replace(/^#+\s*/gm,"").trim().slice(0,1200);if(!t)throw {};
    var S=p85Set();if(!S.lec||typeof S.lec!=="object")S.lec={};S.lec[k]={ai:t,at:Date.now()};
    var ks=Object.keys(S.lec).sort(function(a,c){return S.lec[a].at-S.lec[c].at;});while(ks.length>8)delete S.lec[ks.shift()];
    try{saveAll();}catch(_){}P85.lecBusy=null;if(P85.lecOpen===k)p85OpenLec(k,1);
  }catch(e){P85.lecBusy=null;box(typeof p55ErrMsg==="function"?p55ErrMsg(e):"うまく書けませんでした。もう一度押してください。");}
}
/* ---- 間隔をあけた確認 ---- */
function p85Lr(){var S=p85Set();if(!S.lr||typeof S.lr!=="object")S.lr={};return S.lr;}
function p85DayAdd(key,n){var d=new Date(key+"T00:00:00");d.setDate(d.getDate()+n);return todayKey(d);}
function p85LecRead(k){var L=p85Lr(),r=L[k],t=todayKey();if(!r||r.s>=P85_GAP.length){L[k]={d:t,s:0};try{saveAll();}catch(_){}}}
/* 確認の日が来ていて、まだ弱点のもの。その日以降にそのまとまりを3問以上解いていたら次の段階へ */
function p85LecDue(){
  var L=p85Lr(),t=todayKey(),out=[],ch=false;
  Object.keys(L).forEach(function(k){var r=L[k];if(!r||r.s>=P85_GAP.length)return;
    var due=p85DayAdd(r.d,P85_GAP[r.s]);if(t<due)return;
    var from=Math.floor(new Date(due+"T00:00:00").getTime()/1000),n=p85Recent(10).filter(function(e){return e[0]>=from&&p85Keys(e).indexOf(k)>=0;}).length;
    if(n>=3){r.s++;ch=true;return;}
    if(p85WeakGet(k))out.push({k:k,step:r.s,day:P85_GAP[r.s]});
    else{r.s=P85_GAP.length;ch=true;}
  });
  if(ch){try{saveAll();}catch(_){}}
  return out;
}
/* ---- 画面 ---- */
function p85Sheet(title,body){
  var m=document.getElementById("p85sheet");if(!m){m=document.createElement("div");m.id="p85sheet";document.body.appendChild(m);}
  m.innerHTML='<div class="p81-mask" data-act="p85exclose"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="p81-ph"><b>'+esc(title)+'</b><button type="button" class="p81-x" data-act="p85exclose" aria-label="閉じる">'+(typeof p81Ic==="function"?p81Ic("x",18):"✕")+'</button></div><div class="p81-pb">'+body+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");return m;
}
function p85OpenLec(k,keep){
  var pb=document.querySelector("#p85sheet .p81-pb"),top=keep&&pb?pb.scrollTop:0;
  P85.lecOpen=k;if(!keep)p85LecRead(k);
  var m=p85Sheet("あなた専用の講義",p85LecHtml(k));
  try{if(typeof p72Wrap==="function")p72Wrap(m);}catch(_){}
  var nb=m.querySelector(".p81-pb");if(nb)nb.scrollTop=top;
}
function p85WeakListHtml(){
  var W=p85Weak().slice(0,6),h='<p class="p85c-fnote">この30日の答えから、まちがいが多く、最近まちがえたものほど上に並べています。押すと、その弱点のためだけの講義が開きます。</p>';
  if(!W.length)return h+'<div class="p85c-empty">今は目立つ弱点はありません。問題を解くと、まちがえ方からここに弱点が出ます。</div>';
  var L=p85Lr();
  h+='<div class="p81-box">'+W.map(function(b,i){var r=L[b.k],st=r&&r.s<P85_GAP.length?"確認 "+(r.s+1)+"/"+P85_GAP.length:"";
    return '<button type="button" class="p85c-it" data-act="p85lec" data-val="'+esc(b.k)+'"><span class="p85c-num">'+(i+1)+'</span><span class="p85c-itx"><b>'+esc(p85KeyName(b.k))+'</b><em>'+p85KeyKind(b.k)+' ・ 正答率 '+b.pct+'%'+(st?' ・ '+st:'')+(b.rec?' ・ 回復中':'')+'</em><small>'+esc(b.why)+'</small></span><span class="p85c-go">'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</span></button>';}).join("")+'</div>';
  return h;
}
function p85OpenWeakList(){P85.lecOpen=null;p85Sheet("弱点と講義",p85WeakListHtml());}
function p85LecGo(v){
  var i=v.indexOf(":"),kind=v.slice(0,i),arg=v.slice(i+1);
  p85CloseExam();
  if(kind==="gp"){p77GpStart(arg);return;}
  if(kind==="wd"){var b=p85Lec(arg),ids=Object.keys(b.ids).sort(function(a,c){return b.ids[c]-b.ids[a];}).slice(0,20);if(!ids.length){toast("練習する言葉がありません");return;}
    ui.mixQueue=null;clearTransientUI();ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;startSessionFromIds(ids,p85KeyName(arg));return;}
  if(kind==="tk"){var sec=/^p\d$/.test(arg)?"ex:"+arg.slice(1):arg;/* "ex:N" は試験形式のパートNだけ（phase86 が対応） */
    var click=function(a,val){var x=document.createElement("button");x.type="button";x.style.display="none";x.setAttribute("data-act",a);if(val)x.setAttribute("data-val",val);document.body.appendChild(x);try{x.click();}finally{x.remove();}};
    render();click("p86open");click("p86prac",sec);return;}
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(["p85lec","p85weak","p85lgo","p85lai","p85lguide"].indexOf(a)<0)return;
  e.stopImmediatePropagation();e.preventDefault();var v=el.getAttribute("data-val")||"";
  if(a==="p85weak"){p85OpenWeakList();return;}
  if(a==="p85lec"){p85OpenLec(v);return;}
  if(a==="p85lgo"){p85LecGo(v);return;}
  if(a==="p85lguide"){p85CloseExam();render();try{p72GuideOpen(v);}catch(_){}return;}
  if(a==="p85lai"){var S=p85Set();if(S.lec&&S.lec[v]&&S.lec[v].ai){delete S.lec[v];p85OpenLec(v,1);}p85LecAI(v);return;}
},true);
/* 「今日やること」：苦手の項目を講義につなぐ。確認の日が来たものを先に出す */
var _p85Plan3=p85Plan;
p85Plan=function(){
  var items=_p85Plan3.apply(this,arguments);
  try{
    var W=p85Weak(),due=p85LecDue(),it=null,per=p85SecPerQ(),todayN=function(k){return p85TodayLog().filter(function(e){return p85Keys(e).indexOf(k)>=0;}).length;};
    if(due.length){var d=due[0],b=p85WeakGet(d.k);
      it={k:"lec",act:"lec:"+d.k,title:"講義の確認："+p85KeyName(d.k),amt:"読みなおし2分＋確認の問題 ・ 約"+Math.max(3,Math.round(2+10*per/60))+"分",
        why:"講義を読んでから"+d.day+"日たちました。忘れかけた今もう一度解くと、記憶が長く残ります。"+(b?"いまの正答率は"+b.pct+"%です。":""),done:todayN(d.k)>=3};}
    else if(W.length){var w=W[0],rd=p85Lr()[w.k];
      it={k:"lec",act:"lec:"+w.k,title:"弱点の講義："+p85KeyName(w.k),amt:"読む3分＋確認の問題 ・ 約"+Math.max(4,Math.round(3+10*per/60))+"分",
        why:w.why+"あなたのまちがえた問題から作った講義で、理由とコツを確かめてから解きます。",done:!!(rd&&rd.d===todayKey())&&todayN(w.k)>=5};}
    if(it){var i=items.map(function(x){return x.k;}).indexOf("weak");if(i<0)i=items.map(function(x){return x.k;}).indexOf("weakw");
      if(i>=0)items[i]=it;else if(items.length<3)items.push(it);else{var j=items.map(function(x){return x.k;}).indexOf("compose");items[j>=0?j:items.length-1]=it;}}
  }catch(_){}
  return items;
};
var _p85Go3=p85Go;
p85Go=function(v){if(String(v).indexOf("lec:")===0){p85OpenLec(v.slice(4));return;}return _p85Go3.apply(this,arguments);};
/* 記録の画面：「弱点と講義」への入口 */
var _p85Card3=p85Card;
p85Card=function(){var h=_p85Card3(),W=[];try{W=p85Weak();}catch(_){}
  return h+'<button type="button" class="p85c-weakb" data-act="p85weak"><span><b>弱点と講義</b><small>'+(W.length?"いちばんの弱点："+esc(p85KeyName(W[0].k))+(W.length>1?" ほか"+(W.length-1)+"つ":""):"まちがえた問題から、あなた専用の講義を作ります")+'</small></span>'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</button>';};
/* 2台の端末：講義の確認の段階は進んでいるほう、AIの説明は新しいほう */
var _p85MergeP85b=p85MergeP85;
p85MergeP85=function(a,b){var o=_p85MergeP85b(a,b);a=a||{};b=b||{};
  var lr={};[a.lr||{},b.lr||{}].forEach(function(src){Object.keys(src).forEach(function(k){var x=src[k];if(!x)return;if(!lr[k]||x.d>lr[k].d||(x.d===lr[k].d&&x.s>lr[k].s))lr[k]=x;});});o.lr=lr;
  var lc={};[a.lec||{},b.lec||{}].forEach(function(src){Object.keys(src).forEach(function(k){if(!lc[k]||(src[k]&&(src[k].at||0)>(lc[k].at||0)))lc[k]=src[k];});});o.lec=lc;
  return o;};
(function(){
  var css='.p85c-lhead{margin:0 0 6px}.p85c-lhead b{display:block;font-size:18px;font-weight:800;line-height:1.4;margin-top:6px}.p85c-lhead small{display:block;font-size:13px;color:var(--muted);line-height:1.6;margin-top:4px}'+
    '.p85c-tag{display:inline-block;font-size:11.5px;font-weight:700;color:var(--accent);border:1px solid var(--accent);border-radius:999px;padding:1px 9px}'+
    '.p85c-lsec{margin-top:18px}.p85c-lsec>b{display:block;font-size:15px;font-weight:800;margin-bottom:6px}.p85c-lbody{font-size:14px;line-height:1.8}.p85c-lbody p{margin:6px 0}'+
    '.p85c-lbody table{max-width:100%;font-size:13px}.p85c-lbody,.p85c-lsec{overflow-wrap:anywhere}.p85c-lbody .p72-t{display:block;overflow-x:auto}'+
    '.p85c-lnote{margin-top:10px;padding:10px 12px;border-radius:12px;background:var(--card);border:1px solid var(--line);font-size:13.5px;line-height:1.7}.p85c-lnote b{font-size:13px;color:#C77700}.p85c-lnote p{margin:4px 0 0}'+
    '.p85c-lmore{display:flex;align-items:center;gap:4px;border:0;background:none;color:var(--accent);font:inherit;font-size:13.5px;font-weight:700;padding:10px 0;min-height:44px;cursor:pointer}'+
    '.p85c-lw{padding:10px 0;border-top:1px solid var(--line)}.p85c-lw:first-of-type{border-top:0}.p85c-lw>b{font-size:16px;margin-right:8px}.p85c-lw>span{font-size:14px}.p85c-lw>small{display:block;font-size:13px;color:var(--muted);line-height:1.6;margin-top:2px}.p85c-lw .p72-eg{margin:6px 0 0}'+
    '.p85c-lq{padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);margin-top:8px}.p85c-lqs{font-size:14.5px;line-height:1.6}'+
    '.p85c-lqa{display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:4px;font-size:14px;font-weight:700}.p85c-lqa .ok{color:var(--accent)}.p85c-lqa .ng{color:#D9480F;text-decoration:line-through;text-decoration-thickness:1px}'+
    '.p85c-lq small{display:block;font-size:12.5px;color:var(--muted);line-height:1.6;margin-top:4px}.p85c-fixed{display:inline-block;font-style:normal;font-size:11.5px;font-weight:700;color:var(--accent);margin-top:4px}'+
    '.p85c-ltips{margin:0;padding-left:18px}.p85c-ltips li{font-size:13.5px;line-height:1.75;margin:6px 0}.p85c-ltips .p72-eg{margin:6px 0 0}'+
    '.p85c-lbtns{display:flex;flex-direction:column;gap:8px}.p85c-lbtns .p47-btn{width:100%}.p85c-empty{padding:18px 14px;border:1px dashed var(--line);border-radius:12px;font-size:13.5px;color:var(--muted);line-height:1.7}'+
    '.p85c-weakb{display:flex;align-items:center;gap:10px;width:100%;margin-top:8px;padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);text-align:left;cursor:pointer;font:inherit;min-height:56px}.p85c-weakb *{pointer-events:none}'+
    '.p85c-weakb span{flex:1;min-width:0;display:flex;flex-direction:column}.p85c-weakb b{font-size:14.5px}.p85c-weakb small{font-size:12px;color:var(--muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE85 手順7：勉強時間を見やすく（2026-11-28 Yuta：「何分勉強したかは重要な指標。トップにも、大きくならずに」） =====
   ・数えるのは1問ごとの記録の秒（問題が出てから答えるまで。画面を離れた時間は引き、1問2分まで）。
   ・1日の目標＝「今日やること」で選んだ時間（settings.p85.min：15/30/60分）。
   ・ホーム：「今日やること」の見出しの下に1行だけ（今日の分・目標までの細い棒・この7日の合計）。押すと記録の画面の「勉強時間」へ。
   ・記録の画面のいちばん上：「勉強時間」カード（今日／この7日／累計、直近14日の棒グラフと目標の線、この7日の内訳）。 */
function p85DaySecs(n){
  var out=[],idx={};for(var i=n-1;i>=0;i--){var d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-i);var k=todayKey(d);idx[k]=out.length;out.push({k:k,d:d,s:0,n:0});}
  p85Recent(n+1).forEach(function(e){var k=todayKey(new Date(e[0]*1000));if(idx[k]!=null){out[idx[k]].s+=e[4];out[idx[k]].n++;}});
  return out;
}
function p85Mins(sec){return Math.round(sec/60);}
/* 1日の目標（100日コース中はコースの時間） */
function p85Goal(){try{var c=p85Crs();if(c)return c.min;}catch(_){}return p85Set().min;}
function p85TimeHome(){
  var S=p85Set(),D=p85DaySecs(7),t=D[6].s,w=0;D.forEach(function(x){w+=x.s;});
  var m=p85Mins(t),goal=p85Goal(),pct=Math.min(100,Math.round(m/goal*100));
  return '<button type="button" class="p85c-tline" data-act="p85time" aria-label="今日の勉強 '+m+'分、目標'+goal+'分。この7日 '+p85HM(w)+'"><span class="p85c-tl1">今日の勉強</span><b>'+m+'<small>分</small></b>'+
    '<span class="p85c-tbar" aria-hidden="true"><i style="width:'+pct+'%"></i></span><span class="p85c-tl2">'+(m>=goal?'目標達成':'目標 '+goal+'分')+'<span class="p85c-w7"> ・ 7日 '+p85HM(w)+'</span></span></button>';
}
var _p85HomeHtml7=p85HomeHtml;
p85HomeHtml=function(){
  var h=_p85HomeHtml7.apply(this,arguments);
  try{var a=h.indexOf('<button type="button" class="p85c-wkb"'),b=h.indexOf('<div class="p81-box">'),i=(a>=0&&(b<0||a<b))?a:b;if(i>=0)h=h.slice(0,i)+p85TimeHome()+h.slice(i);}catch(_){}
  return h;
};
var P85_TMODE=[["lesson","レッスン",["lesson","fav"]],["card","単語の復習",["card","quiz"]],["gp","文法の練習",["gp"]],["trki","検定対策",["trki"]],["compose","瞬間作文",["compose"]],["test","到達テスト",["test"]]];
function p85TimeChart(D,goal){
  var W=340,H=150,L=8,R=8,T=18,B=24,n=D.length,cw=(W-L-R)/n,max=Math.max(goal,1);D.forEach(function(x){max=Math.max(max,p85Mins(x.s));});
  max=Math.ceil(max/10)*10||10;var y=function(v){return T+(H-T-B)*(1-v/max);},wd="日月火水木金土",s='<svg class="p85c-chart" viewBox="0 0 '+W+' '+H+'" role="img" aria-label="直近14日の勉強時間">';
  s+='<line class="p85c-gl" x1="'+L+'" x2="'+(W-R)+'" y1="'+y(0)+'" y2="'+y(0)+'"/>';
  var gy=y(goal);s+='<line class="p85c-goal" x1="'+L+'" x2="'+(W-R)+'" y1="'+gy+'" y2="'+gy+'"/><text class="p85c-tx" x="'+(W-R)+'" y="'+(gy-4)+'" text-anchor="end">目標 '+goal+'分</text>';
  D.forEach(function(x,i){var m=p85Mins(x.s),bx=L+i*cw+cw*0.18,bw=cw*0.64,last=i===n-1,top=y(m);
    if(m>0)s+='<rect class="'+(last?"p85c-bar1":"p85c-bar2")+'" x="'+bx.toFixed(1)+'" y="'+top.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+(y(0)-top).toFixed(1)+'" rx="3"><title>'+(x.d.getMonth()+1)+'/'+x.d.getDate()+' '+m+'分</title></rect>';
    else if(x.n)s+='<rect class="p85c-bar2" x="'+bx.toFixed(1)+'" y="'+(y(0)-2)+'" width="'+bw.toFixed(1)+'" height="2" rx="1"/>';
    if(last&&m>0)s+='<text class="p85c-tv" x="'+(bx+bw/2).toFixed(1)+'" y="'+(top-5).toFixed(1)+'" text-anchor="middle">'+m+'</text>';
    s+='<text class="p85c-tx'+(last?' p85c-txon':'')+'" x="'+(bx+bw/2).toFixed(1)+'" y="'+(H-8)+'" text-anchor="middle">'+(last?"今日":wd[x.d.getDay()])+'</text>';});
  return s+'</svg>';
}
function p85TimeCard(){
  var S=p85Set(),goal=p85Goal(),D=p85DaySecs(14),today=D[13],w7=0,p7=0,days7=0,hit=0;
  D.forEach(function(x,i){if(i>=7){w7+=x.s;if(x.n)days7++;if(p85Mins(x.s)>=goal)hit++;}else p7+=x.s;});
  var T=p85Totals(),m=p85Mins(today.s),pct=Math.min(100,Math.round(m/goal*100)),diff=p85Mins(w7)-p85Mins(p7);
  var h='<div class="p60-h" id="p85time">勉強時間<small>実際に解いた時間だけ</small></div><div class="p60-list p85c-time">';
  h+='<div class="p85c-tnow"><div><span>今日</span><b>'+m+'<small> 分</small></b></div><div class="p85c-tgoal"><span>'+(m>=goal?'今日の目標（'+goal+'分）を達成しました':'目標 '+goal+'分まで あと '+(goal-m)+'分')+'</span><span class="p85c-tbar big"><i style="width:'+pct+'%"></i></span></div></div>';
  h+='<div class="p85c-t3"><div><span>この7日</span><b>'+p85HM(w7)+'</b><em>'+(p7||w7?(diff>=0?'前の7日 +'+diff+'分':'前の7日 '+diff+'分'):'')+'</em></div>'+
     '<div><span>1日平均</span><b>'+p85Mins(w7/7)+'分</b><em>目標達成 '+hit+' / 7日</em></div>'+
     '<div><span>累計</span><b>'+p85HM(T.s)+'</b><em>'+T.days+'日 学習</em></div></div>';
  h+='<div class="p85c-tsub">直近14日</div><div class="p85c-tchart">'+p85TimeChart(D,goal)+'</div>';
  /* この7日の内訳 */
  var by={},from=Math.floor(D[7].d.getTime()/1000);p85Recent(8).forEach(function(e){if(e[0]>=from)by[e[1]]=(by[e[1]]||0)+e[4];});
  var rows=P85_TMODE.map(function(r){var s=0;r[2].forEach(function(k){s+=by[k]||0;});return {name:r[1],s:s};}).filter(function(r){return r.s>=30;}).sort(function(a,b){return b.s-a.s;});
  if(rows.length){var mx=rows[0].s;h+='<div class="p85c-tsub">この7日の内訳</div>'+rows.map(function(r){return '<div class="p85c-trow2"><span>'+r.name+'</span><i><b style="width:'+Math.max(3,Math.round(r.s/mx*100))+'%"></b></i><em>'+p85HM(r.s)+'</em></div>';}).join("");}
  h+='<p class="p85c-tnote">問題が画面に出てから答えるまでの時間だけを数えます。ほかのアプリを開いていた時間は引き、1問は長くても2分までにしています。目標はホームの「今日やること」で選んだ時間（100日コース中はコースの時間）です。</p>';
  return h+'</div>';
}
/* 記録の画面：いちばん上に勉強時間。「1問ごとの記録」からは時間を外す（同じ数字を2回出さない） */
var _p85Stats7=renderP48Stats;
renderP48Stats=function(){
  var h=String(_p85Stats7.apply(this,arguments));
  if(P47_LANG!=="ru")return h;
  try{var j=h.indexOf('今週のまとめ'),i=j>=0?h.lastIndexOf('<div class="p60-h"',j):-1;var c=p85TimeCard();h=i>=0?h.slice(0,i)+c+h.slice(i):c+h;}catch(_){}
  return h;
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest('[data-act="p85time"]');if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();
  try{clearTransientUI();}catch(_){}ui.bnav="stats";ui.learnOpen=false;render();
  setTimeout(function(){var t=document.getElementById("p85time");if(t)try{t.scrollIntoView({block:"start"});}catch(_){}},30);
},true);
(function(){
  var css='.p85c-tline{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 8px;padding:7px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer;min-height:40px}.p85c-tline *{pointer-events:none}'+
    '.p85c-tl1{font-size:12px;color:var(--muted);font-weight:700;white-space:nowrap}.p85c-tline>b{font-size:16px;font-weight:800;font-variant-numeric:tabular-nums;white-space:nowrap}.p85c-tline>b small{font-size:11px;font-weight:700;color:var(--muted);margin-left:1px}'+
    '.p85c-tbar{flex:1;min-width:30px;height:6px;border-radius:3px;background:var(--line);overflow:hidden;display:block}.p85c-tbar i{display:block;height:100%;background:var(--accent);border-radius:3px}.p85c-tbar.big{height:8px;flex:none;width:100%;margin-top:6px}'+
    '.p85c-tl2{font-size:11.5px;color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}@media(max-width:360px){.p85c-w7{display:none}}'+
    '.p85c-time{padding:2px 0 4px}.p85c-tnow{display:flex;align-items:flex-end;gap:14px;padding:12px 14px 12px}.p85c-tnow>div:first-child span{display:block;font-size:12px;color:var(--muted);font-weight:700}'+
    '.p85c-tnow>div:first-child b{display:block;font-size:34px;font-weight:800;line-height:1.05;font-variant-numeric:tabular-nums}.p85c-tnow>div:first-child b small{font-size:14px;color:var(--muted);font-weight:700}'+
    '.p85c-tgoal{flex:1;min-width:0;padding-bottom:5px}.p85c-tgoal>span:first-child{display:block;font-size:12.5px;color:var(--muted);line-height:1.4}'+
    '.p85c-t3{display:grid;grid-template-columns:repeat(3,1fr);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}.p85c-t3>div{padding:10px 10px 10px 14px;min-width:0}.p85c-t3>div+div{border-left:1px solid var(--line);padding-left:10px}'+
    '.p85c-t3 span{display:block;font-size:11.5px;color:var(--muted);font-weight:700}.p85c-t3 b{display:block;font-size:17px;font-weight:800;margin-top:1px;font-variant-numeric:tabular-nums;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.p85c-t3 em{display:block;font-style:normal;font-size:11px;color:var(--muted);margin-top:1px;line-height:1.35}'+
    '.p85c-tsub{font-size:12px;font-weight:700;color:var(--muted);padding:12px 14px 2px}.p85c-tchart{padding:0 8px}'+
    '.p85c-goal{stroke:var(--muted);stroke-width:1;stroke-dasharray:4 4;opacity:.7}.p85c-bar2{fill:var(--accent);opacity:.45}.p85c-txon{fill:var(--accent);font-weight:700}'+
    '.p85c-trow2{display:flex;align-items:center;gap:10px;padding:5px 14px;font-size:13px}.p85c-trow2>span{flex:0 0 76px;white-space:nowrap}.p85c-trow2>i{flex:1;height:8px;border-radius:4px;background:var(--line);overflow:hidden;display:block}.p85c-trow2>i>b{display:block;height:100%;background:var(--accent);border-radius:4px}'+
    '.p85c-trow2>em{flex:0 0 auto;font-style:normal;font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums;min-width:52px;text-align:right}'+
    '.p85c-tnote{font-size:11.5px;color:var(--muted);line-height:1.6;margin:10px 14px 8px}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE85 手順8：100日コース（AIメンター） =====
   2026-11-28 Yuta：「毎日100日続ければかなりのレベルに確実に届く構成を。AIサポート・AIメンターのように」。
   ・届くレベルは時間で決まる（試験対策モードの「合格までの道のり」と同じ目安：A1約150時間・A2約350時間・B1約700時間）。
     1日30分=50時間 / 60分=100時間 / 90分=150時間 / 120分=200時間。「100%」は約束せず、届く見込みを正直に出す。
   ・道のり：文法書の全章を1〜75日目に順番どおり（約2日に1章：読む→章の練習）、新しい単語は85日目までに目標の語数、
     検定の問題集は毎日10問（50日目からは週1回ミニ模試）、忘れかけの復習と弱点の講義、25・50・75・100日目は到達テストで節目。
   ・settings.p85.course = {start:"YYYY-MM-DD", min:30|60|90|120, at:作った時刻, rd:{章ID:読んだ日}, ai:{d:日付, t:文}}
   ・遅れ：予定の量と今の量を比べ、残りの日数で割り直した「1日の量」を出す。選んだ時間の1.5倍を超えるなら正直に伝える。 */
var P85_CRS={
  30:{h:50,lv:"A1",words:450,goal:"A1の前半（あいさつ・数・家族・場所の文が言える）",trki:1},
  60:{h:100,lv:"A1",words:913,goal:"A1のほとんど（ТЭУ＝入門の合格ラインの手前）",trki:2},
  90:{h:150,lv:"A1",words:913,goal:"ТЭУ（A1・入門）合格の目安",trki:3},
  120:{h:200,lv:"A2",words:1383,goal:"A1合格と、A2（ТБУ）の途中まで",trki:3}
};
var P85_CMS=[25,50,75,100];
function p85Crs(){var S=p85Set(),c=S.course;return (c&&c.start&&P85_CRS[c.min])?c:null;}
function p85CDay(c){c=c||p85Crs();if(!c)return 0;var a=new Date(c.start+"T00:00:00"),t=new Date(todayKey()+"T00:00:00");return Math.round((t-a)/86400000)+1;}
function p85Chs(){return (window.P72_GUIDE||[]).map(function(g){return g.id;});}
/* 章 i の予定日（1〜75日目に均等） */
function p85ChDay(i,n){return Math.floor(i*75/n)+1;}
function p85ChDone(c,id){
  var rd=c.rd&&c.rd[id];if(!rd)return false;
  var has=false;try{has=!!(window.P82_Q&&P82_Q[id]&&P82_Q[id].length);}catch(_){}
  if(!has)return true;
  var from=Math.floor(new Date(c.start+"T00:00:00").getTime()/1000),n=0,ok=0;
  Object.keys(P85.log).forEach(function(m){P85.log[m].forEach(function(e){if(e[0]>=from&&e[1]==="gp"&&e[5]&&e[5].indexOf(id)>=0){n++;ok+=e[3];}});});
  return n>=8;
}
function p85CWords(c){
  var lvs=P85_CRS[c.min].lv==="A2"?["A1","A2"]:["A1"],n=0;
  Object.keys(progress).forEach(function(id){var w=WMAP[id],p=progress[id];if(w&&p&&p.status&&p.status!=="new"&&lvs.indexOf(w.level)>=0)n++;});return n;
}
function p85CSince(c){var from=Math.floor(new Date(c.start+"T00:00:00").getTime()/1000),o={s:0,trki:0,days:{}};
  Object.keys(P85.log).forEach(function(m){P85.log[m].forEach(function(e){if(e[0]>=from){o.s+=e[4];if(e[1]==="trki")o.trki++;o.days[todayKey(new Date(e[0]*1000))]=1;}});});o.nd=Object.keys(o.days).length;return o;}
/* コースの状態（予定と実際） */
function p85CState(){
  var c=p85Crs();if(!c)return null;var C=P85_CRS[c.min],d=Math.max(1,p85CDay(c)),dd=Math.min(d,100),ch=p85Chs(),n=ch.length;
  var chDue=ch.filter(function(id,i){return p85ChDay(i,n)<=dd;}),chDone=ch.filter(function(id){return p85ChDone(c,id);});
  var next=ch.filter(function(id){return !p85ChDone(c,id);})[0]||null;
  var w=p85CWords(c),wPlan=Math.round(C.words*Math.min(1,dd/85)),wLeft=Math.max(0,C.words-w),dLeft=Math.max(1,85-dd+1);
  var perDay=Math.ceil(wLeft/dLeft),base=Math.ceil(C.words/85);
  var S=p85CSince(c),hPlan=c.min*dd/60,hNow=S.s/3600;
  /* 遅れは「昨日までの予定」とくらべる（今日の分はまだやっていなくてよい） */
  var chPrev=ch.filter(function(id,i){return p85ChDay(i,n)<dd;}).length,wPrev=Math.round(C.words*Math.min(1,(dd-1)/85));
  var chBehind=Math.max(0,chPrev-chDone.length),wBehind=wPrev-w;
  var st=d>100?"done":((chBehind>=3||wBehind>base*4)?"late":((chBehind>=1||wBehind>base*1.5)?"tight":"ok"));
  var over=perDay>base*1.5&&dd<85;
  return {c:c,C:C,d:d,dd:dd,ch:ch,chDue:chDue,chDone:chDone,next:next,w:w,wPlan:wPlan,perDay:perDay,base:base,S:S,hPlan:hPlan,hNow:hNow,st:st,over:over,chBehind:chBehind,wBehind:wBehind};
}
var P85_CST={ok:["予定どおり","ok"],tight:["少し遅れ","warn"],late:["遅れています","ng"],done:["100日を終えました","ok"]};
/* 今日のメニュー（コース中は「今日やること」をこれに置きかえる） */
function p85CPlan(base){
  var X=p85CState(),items=[],per=p85SecPerQ(),todayL=p85TodayLog();if(!X)return base;
  var c=X.c,t=todayKey(),dn=function(k){return todayL.filter(function(e){return e[1]===k;}).length;};
  /* 節目の到達テスト */
  var ms=P85_CMS.filter(function(m){return X.d>=m&&X.d<m+7;})[0];
  if(ms){var md=p85DayAdd(c.start,ms-1),took=(p85Set().tests||[]).some(function(r){return r.d>=md;});
    if(!took)items.push({k:"test",act:"test:"+X.C.lv,title:ms+"日目の節目：到達テスト（"+X.C.lv+"）",amt:"約15分",sec:900,why:"ここまでの伸びを数字で確かめます。結果は100日コースの画面に残り、開始時とくらべられます。",done:false});}
  /* 文法書の章 */
  if(X.next){var i=X.ch.indexOf(X.next),g=p85Guide(X.next),rd=c.rd&&c.rd[X.next],sched=p85ChDay(i,X.ch.length);
    if(sched<=Math.min(X.dd+1,100)||X.chBehind>0){
      items.push({k:"ch",act:"ch:"+X.next,title:"文法書 "+(i+1)+"章「"+p85ChName(X.next)+"」"+(rd?"の練習":"を読む"),amt:rd?"10問 ・ 約"+Math.max(3,Math.round(10*per/60))+"分":"読む 約10分 ＋ 練習10問",
        sec:rd?10*per:600+10*per,why:(rd?"読んだ章を、すぐに問題で確かめます。8問以上解くと、この章は終わりです。":"100日で全"+X.ch.length+"章を順番に読みます。今日は"+(i+1)+"章目です。")+(X.chBehind>0?"予定より"+X.chBehind+"章遅れているので、この章から追いつきましょう。":""),done:false});}}
  else if(X.dd<=100)items.push({k:"ch",act:"guide",title:"文法書の見直し",amt:"約10分",why:"全部の章を終えました。弱点の講義に出た章を読み直すと、仕上げになります。",done:false});
  /* 新しい言葉 */
  if(X.dd<=85&&X.w<X.C.words){var ln=Math.max(1,Math.ceil(X.perDay/6)),dl=p85LessonsToday();
    items.push({k:"new",act:"new",title:"新しい言葉 "+X.perDay+"語",amt:ln+"レッスン ・ 約"+Math.round(ln*20*per/60)+"分",sec:ln*20*per,
      why:"目標の"+X.C.words.toLocaleString()+"語のうち "+X.w.toLocaleString()+"語まで来ました。85日目までに終えるには、1日"+X.perDay+"語です。",done:dl>=ln,ln:ln});}
  /* 復習か弱点の講義（基本の提案から取る） */
  var rv=base.filter(function(x){return x.k==="lec";})[0]||base.filter(function(x){return x.k==="rev";})[0];if(rv)items.push(rv);
  /* 検定の問題集 */
  if(window.P86_LG&&X.d>=1){var mk=(settings.p86&&settings.p86.mk)||[],lastMk=mk[0]?mk[0].d:0;
    if(X.d>=50&&Date.now()-lastMk>6*86400000)items.push({k:"mock",act:"trki",title:"検定のミニ模試（週1回）",amt:"約35分",why:"50日目からは、週に1回本番の形で解いて、合格ライン（66%）との差を確かめます。",done:false});
    else items.push({k:"trki",act:"trkitoday",title:"検定の問題集 今日の10問",amt:"10問 ・ 約"+Math.max(3,Math.round(10*per*1.5/60))+"分",why:"毎日10問ずつ回すと、100日で約1,000問。目標は問題集を"+X.C.trki+"周です。",done:dn("trki")>=10});}
  return items.slice(0,4);
}
var _p85Plan8=p85Plan;
p85Plan=function(){var b=_p85Plan8.apply(this,arguments);try{if(p85Crs()&&P47_LANG==="ru")return p85CPlan(b);}catch(_){}return b;};
var _p85Go8=p85Go;
p85Go=function(v){v=String(v);
  if(v.indexOf("ch:")===0){var id=v.slice(3),c=p85Crs();if(c&&c.rd&&c.rd[id]){p77GpStart(id);}else{try{p72GuideOpen(id);}catch(_){}}return;}
  if(v==="guide"){try{p72GuideOpen(null);}catch(_){}return;}
  if(v==="trkitoday"){var ck=function(a){var x=document.createElement("button");x.type="button";x.style.display="none";x.setAttribute("data-act",a);document.body.appendChild(x);try{x.click();}finally{x.remove();}};ck("p86open");ck("p86today");return;}
  return _p85Go8.apply(this,arguments);};
/* 文法書の章を開いたら「読んだ」にする（コース中だけ） */
if(typeof p72GuideOpen==="function"){var _p85GOpen=p72GuideOpen;p72GuideOpen=function(id){var r=_p85GOpen.apply(this,arguments);try{var c=p85Crs();if(c&&id&&p85Guide(id)){if(!c.rd)c.rd={};if(!c.rd[id]){c.rd[id]=todayKey();saveAll();}}}catch(_){}return r;};}
/* ---- メンターのひとこと（計算。AIが使えるときは1日1回AIが書く） ---- */
function p85CTip(X){
  var y=p85DaySecs(2)[0],ym=p85Mins(y.s),c=X.c,t="";
  if(X.d>100)return "100日おつかれさまでした。最後の到達テストで、開始時からの伸びを確かめましょう。";
  if(X.d===1)t="今日から100日コースです。最初の目標は、毎日「今日やること」を上から順に終えることです。";
  else if(!y.n)t="昨日はお休みでした。1日休んでも、今日いつもの分をやれば取り戻せます。";
  else t="昨日は"+ym+"分"+(ym>=c.min?"、目標どおりでした。":"でした（目標は"+c.min+"分）。");
  if(X.st==="late")t+=X.over?"いまのままでは100日目に届きません。1日の時間を増やすか、コースを"+(c.min>30?"短い時間のものに":"立て直す")+"のがおすすめです。":"遅れを取り戻すため、今日は文法書の章を1つ多めに進めましょう。";
  else if(X.st==="tight")t+="少し遅れています。今日の分を終えれば、ほぼ予定に戻ります。";
  else if(X.d>1)t+="予定どおりです。この調子で続けましょう。";
  return t;
}
/* 節目（25・50・75・100日目から1週間）の振り返り。まだ書いていなければ、その日のひとことの代わりにAIが書く */
function p85CMile(X){return P85_CMS.filter(function(m){return X.d>=m&&X.d<m+7&&!(X.c.rv&&X.c.rv[m]);})[0]||0;}
async function p85CAIMile(s,X,m){
  var c=X.c,T=p85Set().tests||[],first=T.filter(function(x){return x.d<=p85DayAdd(c.start,6);})[0],last=T.slice(-1)[0];
  var data={節目:m+"日目",一日の目標_分:c.min,開始からの勉強_時間:Math.round(X.hNow*10)/10,予定の勉強_時間:Math.round(X.hPlan*10)/10,学習した日数:X.S.nd,
    文法書:X.chDone.length+"/"+X.ch.length+"章",単語:X.w+"/"+X.C.words+"語",検定の問題:X.S.trki,
    開始時の到達テスト:first?first.lv+" "+first.pct+"%":"なし",最新の到達テスト:last?last.lv+" "+last.pct+"%":"なし",いちばんの弱点:(p85Weak()[0]?p85KeyName(p85Weak()[0].k):"なし"),目標:X.C.goal};
  var prompt="あなたは日本人のロシア語学習者を支えるメンターです。この人は100日コースの"+m+"日目の節目に来ました。記録の数字：\n"+JSON.stringify(data)+"\n\n"+
    "日本語で4〜5文の振り返りを書いてください。ルール：\n1. ここまでで伸びたことを、数字を使って1つか2つ。\n2. 予定とくらべてどうか、正直に。\n3. 次の25日でいちばん大事なことを1つ、具体的に。\n4. 責めない。大げさなほめ言葉・命令口調・絵文字は使わない。合格を約束しない。記録にないことは書かない。\n5. "+(typeof P55_SAFE==="string"?P55_SAFE:"")+"\n振り返りの文だけを返してください。";
  var r=await s(prompt),tx=String(r&&r.text||"").trim().slice(0,600);
  if(tx){if(!c.rv)c.rv={};c.rv[m]={d:todayKey(),t:tx};c.ai={d:todayKey(),t:m+"日目の振り返りを書きました。100日コースの画面で読めます。"};try{saveAll();}catch(_){}}
}
async function p85CAI(){
  var c=p85Crs();if(!c||P85.cBusy)return;var t=todayKey();if(c.ai&&c.ai.d===t)return;
  var s=null;try{s=await p55Sample();}catch(_){}if(!s)return;P85.cBusy=1;
  var X=p85CState(),y=p85DaySecs(2)[0],mm=p85CMile(X);
  if(mm){try{await p85CAIMile(s,X,mm);var e2=document.querySelector(".p85c-mentor span");if(e2&&c.ai)e2.textContent=c.ai.t;}catch(_){}P85.cBusy=0;return;}
  var data={何日目:X.d,一日の目標_分:c.min,昨日の勉強_分:p85Mins(y.s),昨日の問題数:y.n,開始からの勉強_時間:Math.round(X.hNow*10)/10,予定の勉強_時間:Math.round(X.hPlan*10)/10,
    文法書:X.chDone.length+"/"+X.ch.length+"章（予定 "+X.chDue.length+"章）",単語:X.w+"/"+X.C.words+"語（予定 "+X.wPlan+"語）",状況:P85_CST[X.st][0],
    弱点:(p85Weak()[0]?p85KeyName(p85Weak()[0].k):"なし"),目標:X.C.goal};
  var prompt="あなたは日本人のロシア語学習者に毎日声をかけるメンターです。この人は100日コースの途中です。記録の数字：\n"+JSON.stringify(data)+"\n\n"+
    "日本語で2〜3文のひとことを書いてください。ルール：\n1. 数字を1つ使って、昨日のことに具体的にふれる。\n2. 今日いちばん大事なことを1つ、すぐできる形で言う。\n3. 遅れていても責めない。大げさなほめ言葉・命令口調・絵文字は使わない。\n4. 記録にないことは書かない。合格を約束しない。\n5. "+(typeof P55_SAFE==="string"?P55_SAFE:"")+"\nひとことの文だけを返してください。";
  try{var r=await s(prompt),tx=String(r&&r.text||"").trim().slice(0,300);if(tx){c.ai={d:t,t:tx};try{saveAll();}catch(_){}
      var el=document.querySelector(".p85c-mentor span");if(el)el.textContent=tx;}}catch(_){}
  P85.cBusy=0;
}
function p85CMsg(X){var c=X.c;return (c.ai&&c.ai.d===todayKey())?{t:c.ai.t,ai:1}:{t:p85CTip(X),ai:0};}
/* ---- ホーム：見出しの下の小さな文字を「100日コース ◯日目」に。メンターのひとことは2行まで ---- */
var _p85HomeHtml8=p85HomeHtml;
p85HomeHtml=function(){
  var h=_p85HomeHtml8.apply(this,arguments);
  try{var X=p85CState(),i=h.indexOf('<button type="button" class="p85c-exb'),j=i>=0?h.indexOf('</button>',i)+9:-1;
    if(X){var st=P85_CST[X.st],sub='<button type="button" class="p85c-exb '+st[1]+'" data-act="p85course">100日コース '+(X.d>100?"完了":X.d+"日目")+' ・ '+st[0]+' ›</button>';
      if(i>=0)h=h.slice(0,i)+sub+h.slice(j);
      /* コース中は1日の時間はコースで決まるので、15/30/60分の切りかえは出さない（変えるときはコースの画面から） */
      h=h.replace(/<div class="p85c-mins"[\s\S]*?<\/div>/,"");
      var M=p85CMsg(X),k=h.indexOf('<button type="button" class="p85c-tline"');
      if(k>=0)h=h.slice(0,k)+'<button type="button" class="p85c-mentor" data-act="p85course"><b>'+(M.ai?"AIメンター":"メンター")+'</b><span>'+esc(M.t)+'</span></button>'+h.slice(k);
      if(!M.ai)setTimeout(p85CAI,400);}
    else if(i>=0&&!p85Set().exam)h=h.slice(0,i)+'<button type="button" class="p85c-exb" data-act="p85course">100日コースを始める（毎日やることを案内します） ›</button>'+h.slice(j);
  }catch(_){}
  return h;
};
/* ---- コースの画面 ---- */
function p85CBar(lab,v,goal,plan,txt){var p=Math.min(100,Math.round(v/Math.max(1,goal)*100)),q=Math.min(100,Math.round(plan/Math.max(1,goal)*100));
  return '<div class="p85c-cr"><div class="p85c-crt"><b>'+lab+'</b><span>'+txt+'</span></div><div class="p85c-cbar"><i style="width:'+p+'%"></i><u style="left:'+q+'%" title="予定"></u></div></div>';}
function p85CourseHtml(edit){
  var c=p85Crs(),S=p85Set();
  if(!c||edit){
    var cur=c?c.min:(S.min>=60?60:60);
    var h='<p class="p85c-fnote" style="margin-top:0">1日の時間を決めると、100日分の予定を作ります。毎日「今日やること」に、その日の分（文法書の章・新しい言葉・復習・検定の問題集）が出ます。</p>';
    h+='<div class="p85c-csel" role="radiogroup" aria-label="1日の時間">'+[30,60,90,120].map(function(m){var C=P85_CRS[m];return '<button type="button" role="radio" aria-checked="'+(m===cur)+'" class="p85c-copt'+(m===cur?" on":"")+'" data-act="p85cmin" data-val="'+m+'"><b>1日'+(m<60?m+"分":(m/60)+"時間")+'</b><span>100日で約'+C.h+'時間</span><em>'+esc(C.goal)+'</em></button>';}).join("")+'</div>';
    h+='<div class="p85c-honest"><b>正直な見積もり</b><p>A1（入門）までは約150時間、A2までは約350時間、B1までは約700時間が目安です（試験対策モードの「合格までの道のり」と同じ数字）。100日でB1に届くには1日7時間が必要なので、このコースでは目指しません。毎日の分をこなせば上の見込みに届くように組みますが、合格を100%約束するものではありません。本番の作文と会話は、瞬間作文で別に練習してください。</p></div>';
    h+='<label class="p85c-cdate"><span>始める日</span><input type="date" id="p85cstart" value="'+esc(c?c.start:todayKey())+'"></label><p class="p85c-err" id="p85cerr"></p>';
    h+='<div class="p85c-fbtn">'+(c?'<button type="button" class="p47-btn" data-act="p85course">もどる</button>':'')+'<button type="button" class="p47-btn primary" data-act="p85cgo" data-val="'+cur+'">'+(c?"この内容で組み直す":"100日コースを始める")+'</button></div>';
    if(c)h+='<button type="button" class="p85c-lmore" data-act="p85cstop" style="color:var(--muted)">コースをやめる（記録は消えません）</button>';
    return h;
  }
  var X=p85CState(),st=P85_CST[X.st],M=p85CMsg(X),pd=Math.min(100,X.d);
  var h='<div class="p85c-chead"><div class="p85c-cday"><b>'+(X.d>100?"完了":X.d)+'</b><span>'+(X.d>100?"100日":"/ 100日目")+'</span></div><div><span class="p85c-cst '+st[1]+'">'+st[0]+'</span><p>1日'+(c.min<60?c.min+"分":(c.min/60)+"時間")+'のコース ・ 目標：'+esc(X.C.goal)+'</p></div></div>';
  h+='<div class="p85c-cbar big"><i style="width:'+pd+'%"></i></div>';
  h+='<div class="p85c-ai"><b>'+(M.ai?"AIメンターのひとこと":"メンターのひとこと")+'</b><p>'+esc(M.t)+'</p>'+(M.ai?'<small>Claude（AI）が、あなたの記録の数字を読んで書きました。</small>':'')+'</div>';
  h+='<div class="p85c-lsec"><b>進み具合</b><p class="p85c-fnote" style="margin:0 0 6px">細い線が、今日までの予定の位置です。</p>'+
    p85CBar("文法書",X.chDone.length,X.ch.length,X.chDue.length,X.chDone.length+' / '+X.ch.length+'章（予定 '+X.chDue.length+'章）')+
    p85CBar("単語",X.w,X.C.words,X.wPlan,X.w.toLocaleString()+' / '+X.C.words.toLocaleString()+'語（予定 '+X.wPlan.toLocaleString()+'語）')+
    p85CBar("勉強時間",X.hNow,X.C.h,X.hPlan,p85HM(X.S.s)+' / 約'+X.C.h+'時間（予定 '+p85HM(X.hPlan*3600)+'）')+
    p85CBar("検定の問題集",X.S.trki,1000,Math.min(1000,X.dd*10),X.S.trki.toLocaleString()+' / 約1,000問（予定 '+Math.min(1000,X.dd*10).toLocaleString()+'問）')+'</div>';
  if(X.over)h+='<div class="p85c-lnote"><b>このままでは届きません</b><p>残りの単語を85日目までに終えるには1日'+X.perDay+'語（予定の'+Math.round(X.perDay/X.base*10)/10+'倍）が必要です。1日の時間を増やすか、短い時間のコースに組み直すと、無理なく続けられます。</p></div>';
  /* 節目 */
  var T=p85Set().tests||[];
  h+='<div class="p85c-lsec"><b>節目の到達テスト</b>'+P85_CMS.map(function(m){var md=p85DayAdd(c.start,m-1),r=T.filter(function(x){return x.d>=md;})[0],first=T.filter(function(x){return x.d<=c.start;}).slice(-1)[0];
    var rv=c.rv&&c.rv[m];
    return '<div class="p85c-crow"><span>'+m+'日目<small>'+md.slice(5).replace("-","/")+'</small></span><em>'+(r?r.lv+' '+r.pct+'%':(X.d>=m?'まだ受けていません':'これから'))+'</em></div>'+
      (rv?'<div class="p85c-rv"><p>'+esc(rv.t)+'</p><small>AIメンターの振り返り（'+esc(rv.d.slice(5).replace("-","/"))+'）</small></div>':'');}).join("")+'</div>';
  /* 道のり */
  var ph=[[1,25],[26,50],[51,75]].map(function(r){var names=X.ch.map(function(id,i){return {d:p85ChDay(i,X.ch.length),i:i,id:id};}).filter(function(o){return o.d>=r[0]&&o.d<=r[1];});
    return '<li><b>'+r[0]+'〜'+r[1]+'日目</b>：文法書 '+(names.length?(names[0].i+1)+'〜'+(names[names.length-1].i+1)+'章（'+names.map(function(o){return esc(p85ChName(o.id));}).join("・")+'）':'')+'</li>';}).join("");
  h+='<div class="p85c-lsec"><b>100日の流れ</b><ul class="p85c-ltips">'+ph+
    '<li><b>76〜100日目</b>：新しい章はなく、復習・模試・弱点の仕上げ。新しい言葉は85日目までに目標の語数を終えます。</li>'+
    '<li><b>毎日</b>：新しい言葉、忘れかけの復習か弱点の講義、検定の問題集10問（50日目からは週1回ミニ模試）。25・50・75・100日目は到達テスト。</li></ul></div>';
  h+='<div class="p85c-fbtn" style="margin-top:14px"><button type="button" class="p47-btn" data-act="p85cedit">時間を変える・組み直す</button></div>';
  return h;
}
function p85OpenCourse(edit){p85Sheet("100日コース",p85CourseHtml(edit));}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(["p85course","p85cedit","p85cmin","p85cgo","p85cstop"].indexOf(a)<0)return;
  e.stopImmediatePropagation();e.preventDefault();var v=el.getAttribute("data-val");
  if(a==="p85course"){p85OpenCourse(false);return;}
  if(a==="p85cedit"){p85OpenCourse(true);return;}
  if(a==="p85cmin"){document.querySelectorAll("#p85sheet .p85c-copt").forEach(function(b){var on=b===el;b.classList.toggle("on",on);b.setAttribute("aria-checked",on);});var g=document.querySelector('#p85sheet [data-act="p85cgo"]');if(g)g.setAttribute("data-val",v);return;}
  if(a==="p85cgo"){var m=+v,d=(document.getElementById("p85cstart")||{}).value||todayKey(),er=document.getElementById("p85cerr");
    if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){if(er)er.textContent="始める日を選んでください。";return;}
    var lim=p85DayAdd(todayKey(),-99);if(d<lim){if(er)er.textContent="100日より前の日は選べません。";return;}
    if(d>p85DayAdd(todayKey(),30)){if(er)er.textContent="始める日は30日後までにしてください。";return;}
    var S=p85Set(),old=(S.course&&S.course.start)?S.course:{};S.course={start:d,min:P85_CRS[m]?m:60,at:Date.now(),rd:old.rd||{}};S.min=m>=60?60:30;
    try{saveAll();}catch(_){}p85OpenCourse(false);try{render();}catch(_){}return;}
  if(a==="p85cstop"){var S2=p85Set();if(!el.getAttribute("data-sure")){el.setAttribute("data-sure","1");el.textContent="もう一度押すと、コースをやめます";return;}
    S2.course={stop:1,at:Date.now()};/* 消さずに「やめた」を残す：2台目の端末のコースより新しいので、足し合わせでも戻らない */try{saveAll();}catch(_){}p85CloseExam();render();toast("100日コースをやめました");return;}
},true);
/* 記録の画面にも入口 */
var _p85Card8=p85Card;
p85Card=function(){var h=_p85Card8(),X=null;try{X=p85CState();}catch(_){}
  return h+'<button type="button" class="p85c-weakb" data-act="p85course"><span><b>100日コース</b><small>'+(X?(X.d>100?"100日を終えました":X.d+"日目 ・ "+P85_CST[X.st][0]):"毎日やることを案内します")+'</small></span>'+(typeof p81Ic==="function"?p81Ic("go",16):"›")+'</button>';};
/* 2台の端末：コースは新しく作ったほう、読んだ章は足し合わせ、AIのひとことは新しい日付のほう */
var _p85MergeP85c=p85MergeP85;
p85MergeP85=function(a,b){var o=_p85MergeP85c(a,b);a=a||{};b=b||{};var ca=a.course,cb=b.course;
  if(ca&&cb){var w=(cb.at||0)>=(ca.at||0)?cb:ca,x=w===cb?ca:cb,c={};Object.keys(w).forEach(function(k){c[k]=w[k];});
    if(w.start===x.start){c.rd={};[x.rd||{},w.rd||{}].forEach(function(r){Object.keys(r).forEach(function(k){if(!c.rd[k]||r[k]<c.rd[k])c.rd[k]=r[k];});});
      if(x.ai&&(!c.ai||x.ai.d>c.ai.d))c.ai=x.ai;
      if(x.rv){c.rv={};[x.rv||{},w.rv||{}].forEach(function(r){Object.keys(r).forEach(function(k){c.rv[k]=r[k];});});}}
    o.course=c;}
  else if(ca||cb)o.course=cb||ca;
  return o;};
(function(){
  var css='.p85c-mentor{display:flex;gap:8px;align-items:flex-start;width:100%;margin:0 0 8px;padding:8px 12px;border:0;border-left:3px solid var(--accent);border-radius:0 10px 10px 0;background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer}.p85c-mentor *{pointer-events:none}'+
    '.p85c-mentor b{flex:0 0 auto;font-size:11.5px;color:var(--accent);font-weight:800;margin-top:1px}.p85c-mentor span{flex:1;min-width:0;font-size:12.5px;line-height:1.55;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}'+
    '.p85c-csel{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0}.p85c-copt{display:flex;flex-direction:column;gap:2px;text-align:left;padding:12px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer;min-height:96px}.p85c-copt *{pointer-events:none}'+
    '.p85c-copt.on{border-color:var(--accent);box-shadow:0 0 0 1px var(--accent) inset}.p85c-copt b{font-size:15px}.p85c-copt span{font-size:12px;color:var(--muted)}.p85c-copt em{font-style:normal;font-size:12.5px;line-height:1.5;color:var(--accent);font-weight:700;margin-top:2px}'+
    '.p85c-honest{padding:12px 14px;border-radius:12px;border:1px solid var(--line);background:var(--card);margin-bottom:12px}.p85c-honest b{font-size:13.5px}.p85c-honest p{font-size:13px;line-height:1.75;color:var(--muted);margin:4px 0 0}'+
    '.p85c-cdate{display:block}.p85c-cdate span{display:block;font-size:13px;font-weight:700;color:var(--muted);margin-bottom:6px}.p85c-cdate input{width:100%;box-sizing:border-box;padding:11px 12px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:16px;min-height:44px}'+
    '.p85c-chead{display:flex;align-items:center;gap:14px}.p85c-cday{display:flex;flex-direction:column;align-items:center;min-width:74px}.p85c-cday b{font-size:40px;font-weight:800;line-height:1;color:var(--accent);font-variant-numeric:tabular-nums}.p85c-cday span{font-size:12px;color:var(--muted);margin-top:4px}'+
    '.p85c-chead p{font-size:13px;line-height:1.6;color:var(--muted);margin:4px 0 0}.p85c-cst{display:inline-block;font-size:12px;font-weight:800;padding:2px 10px;border-radius:999px;border:1px solid currentColor}.p85c-cst.ok{color:var(--accent)}.p85c-cst.warn{color:#C77700}.p85c-cst.ng{color:#D9480F}'+
    '.p85c-cbar{position:relative;height:8px;border-radius:4px;background:var(--line);margin-top:6px}.p85c-cbar i{display:block;height:100%;border-radius:4px;background:var(--accent)}.p85c-cbar u{position:absolute;top:-3px;width:2px;height:14px;background:var(--ink);margin-left:-1px;border-radius:1px}.p85c-cbar.big{height:10px;margin:14px 0 4px}'+
    '.p85c-cr{padding:8px 0}.p85c-crt{display:flex;justify-content:space-between;gap:8px;align-items:baseline}.p85c-crt b{font-size:14px}.p85c-crt span{font-size:12px;color:var(--muted);text-align:right;font-variant-numeric:tabular-nums}'+
    '.p85c-rv{padding:4px 0 10px}.p85c-rv p{font-size:13.5px;line-height:1.75;margin:0}.p85c-rv small{display:block;font-size:11.5px;color:var(--muted);margin-top:4px}'+
    '.p85c-crow{display:flex;justify-content:space-between;align-items:center;padding:9px 0;border-top:1px solid var(--line);font-size:14px}.p85c-crow:first-of-type{border-top:0}.p85c-crow small{margin-left:8px;font-size:12px;color:var(--muted)}.p85c-crow em{font-style:normal;font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
