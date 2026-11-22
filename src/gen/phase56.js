/* ===== PHASE56: 全体の見直し（重複機能の削除・設定の整理・A1→A2への道筋と到達テスト） ===== */
/* ---- 1) 重複していた練習を削除（記録は消さない） ---- */
var P56_DROP={weak:1,read:1,scenario:1,aloud:1,grammar:1,drill:1,word:1,search:1,a2check:1};
LEARN_ITEMS=LEARN_ITEMS.filter(function(it){return !P56_DROP[it[0]];});
/* 単語検索は「単語練習」の中へ、A2カバー状況は「記録」の中へ移す */
var _p56Words=renderP47Words;
renderP47Words=function(){
  var h=String(_p56Words());
  return h.replace('<div class="p47-tiles">','<button type="button" class="p56-search" data-act="p56search"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.8-4.8"/></svg><span>単語を検索（'+VOCAB.length+'語）</span></button><div class="p47-tiles">');
};
/* ---- 2) 設定の整理：アプリに関係しなくなった項目を外す ---- */
var _p56Settings=renderSettings;
renderSettings=function(embed){
  var h=String(_p56Settings(embed));
  var m=/<div class="p51-adv">([\s\S]*)<\/div><\/details>/.exec(h);if(!m)return h;
  var box=document.createElement("div");box.innerHTML=m[1];
  var DROP=/^(出題順の初期値|単語の出題方向|詳しい解説を最初から開く|テーマ|カード余白)$/;
  Array.prototype.slice.call(box.querySelectorAll("*")).forEach(function(el){
    if(el.children.length===0&&DROP.test((el.textContent||"").trim())){var nx=el.nextElementSibling;if(nx&&(nx.classList.contains("seg")||nx.querySelector(".seg")))nx.remove();el.remove();}
  });
  /* リスニング設定はリスニング画面にあるので外す */
  var kids=Array.prototype.slice.call(box.children),skip=false;
  kids.forEach(function(el){if(el.classList.contains("h2"))skip=(el.textContent.trim()==="リスニング設定");if(skip)el.remove();});
  return h.replace(m[1],box.innerHTML);
};
/* ---- 3) A1→A2 の道筋：新しい単語はレベル順、作文はユニット順に出す ---- */
var P56_ORDER={};P47_THEMES.forEach(function(th,ti){th.ids.forEach(function(id,i){P56_ORDER[id]=ti*10000+i;});});
var _p56Build=p47BuildChallenge;
p47BuildChallenge=function(n){
  var items=_p56Build(n);
  /* 新出語をレベル・テーマ順に入れ替える */
  var fresh=VOCAB.filter(function(w){return !p47IsKnown(w.id)&&!(progress[w.id]&&progress[w.id].status!=="new");}).map(function(w){return w.id;})
    .sort(function(a,b){return (P56_ORDER[a]||0)-(P56_ORDER[b]||0);});
  var fi=0;
  items.forEach(function(it){if(it.kind==="word"){var p=progress[it.id];if((!p||p.status==="new")&&!p47IsKnown(it.id)&&fi<fresh.length){it.id=fresh[fi++];}}});
  /* 作文は「復習の時期が来た文」→「まだやっていない文をユニット順に」 */
  var due=buildCompose({type:"review"}),next=COMPOSE.filter(function(c){return !cprogress[c.id]||cprogress[c.id].status==="new";}).map(function(c){return c.id;});
  var cq=uniqueIds(due.concat(next)),ci=0,seen={};
  items.forEach(function(it){if(it.kind==="compose"&&ci<cq.length){it.id=cq[ci++];}});
  /* 重複除去 */
  return items.filter(function(it){var k=it.kind+it.id;if(seen[k])return false;seen[k]=1;return true;});
};
/* ---- 4) 到達テスト（A1・A2）：そのレベルの単語から25問。80%以上で合格 ---- */
if(!appHist.levelTests)appHist.levelTests={};
function p56StartTest(level){
  var ids=shuffle(VOCAB.filter(function(w){return w.level===level;}).map(function(w){return w.id;})).slice(0,25);
  ui.mixQueue=null;clearTransientUI();ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;
  startSessionFromIds(ids,level+" 到達テスト","levelTest");
  ui.session.p56level=level;saveUI();render();
}
var _p56Applies=p52Applies;
p52Applies=function(s){if(s&&s.origin==="levelTest"&&s.list&&s.pos<s.list.length)return true;return _p56Applies(s);};
var _p56Make=p52Make;
p52Make=function(s){
  var q=_p56Make(s);
  if(q&&s.origin==="levelTest"&&q.type==="intro"){var w=WMAP[q.id],pool=shuffle(p52Pool(w)),opts=[],seen={};seen[p52Short(w.meaning)]=1;
    for(var i=0;i<pool.length&&opts.length<3;i++){var k=p52Short(pool[i].meaning);if(seen[k])continue;seen[k]=1;opts.push(pool[i].id);}
    opts.push(q.id);q={id:q.id,type:"meaning",opts:shuffle(opts),pick:null};}
  return q;
};
var _p56Requeue=requeueInSession;
requeueInSession=function(id,kind){if(ui.session&&ui.session.origin==="levelTest")return;return _p56Requeue.apply(this,arguments);};
var _p56Sum=renderSessionSummary;
renderSessionSummary=function(){
  var s=ui.session,h=String(_p56Sum.apply(this,arguments));
  if(!s||s.origin!=="levelTest")return h;
  var st=s.stats||{},tot=s.list.length,ok=st.ok||0,pct=tot?Math.round(ok/tot*100):0,lv=s.p56level||"A1",pass=pct>=80;
  var rec=appHist.levelTests[lv]||{};
  if(!s.p56saved){rec.last=pct;rec.best=Math.max(rec.best||0,pct);rec.date=todayKey();if(pass)rec.passed=true;appHist.levelTests[lv]=rec;s.p56saved=true;saveAll();}
  var card='<div class="p56-result '+(pass?"ok":"ng")+'"><div class="p56-rart p48-ill">'+p48Art(pass?"trophy":"star",54)+'</div>'+
    '<div class="p56-rlv">'+lv+' 到達テスト</div><div class="p56-rpct">'+pct+'<small>%</small></div><div class="p56-rmsg">'+(pass?lv+' の単語は合格です！':'合格ラインは80%です。間違えた単語を復習してもう一度挑戦しましょう')+'</div>'+
    '<div class="p56-rsub">'+ok+' / '+tot+' 問正解 ・ これまでの最高 '+rec.best+'%</div></div>';
  return card+h;
};
/* ---- 5) ホーム：いまの目標レベルを1行で ---- */
function p56LevelState(){
  var r={};P_LVLS.forEach(function(lv){var ids=VOCAB.filter(function(w){return w.level===lv;}),k=ids.filter(function(w){return p47IsKnown(w.id);}).length;
    r[lv]={n:ids.length,k:k,pct:ids.length?Math.round(k/ids.length*100):0,passed:!!(appHist.levelTests[lv]&&appHist.levelTests[lv].passed)};});
  /* いまの目標：合格（または9割覚えた）していない最初のレベル */
  r.cur=P_LVLS[P_LVLS.length-1];for(var i=0;i<P_LVLS.length;i++){var x=r[P_LVLS[i]];if(!(x.passed||x.pct>=90)){r.cur=P_LVLS[i];break;}}return r;
}
var _p56Home=renderHome;
renderHome=function(){
  var h=String(_p56Home()),L=p56LevelState(),c=L[L.cur];
  var bar='<button type="button" class="p56-goal" data-act="bnav" data-val="stats"><span class="p56-gl">いまの目標</span><b>'+L.cur+'</b>'+
    '<span class="p56-gbar"><i style="width:'+c.pct+'%"></i></span><span class="p56-gn">'+c.pct+'%</span>'+P_LVLS.map(function(l){return L[l].passed?'<span class="p56-badge">'+l+'合格</span>':'';}).join("")+'</button>';
  return h.replace('<div class="p53-note">','<div class="p53-note">').replace(/(<div class="p51-herowrap">)/,bar+'$1');
};
/* ---- 6) 記録：到達テストとA2カバー状況への入口 ---- */
var _p56Stats=renderP48Stats;
renderP48Stats=function(){
  var h=String(_p56Stats()),L=p56LevelState();
  var row=function(lv){var t=appHist.levelTests[lv]||{},c=L[lv];
    return '<div class="p56-trow"><span class="p48-lvtag">'+lv+'</span><span class="p56-tt"><b>'+(t.passed?'合格 ✓':(t.best!=null?'最高 '+t.best+'%':'未受験'))+'</b><small>覚えた単語 '+c.k+' / '+c.n+'</small></span>'+
      '<button type="button" class="p47-btn'+(t.passed?'':' primary')+'" data-act="p56test" data-val="'+lv+'">'+(t.best!=null?'もう一度':'テストを受ける')+'</button></div>';};
  var card='<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">'+p48Art("trophy",22)+'</span>到達テスト</b><span>25問・80%で合格</span></div>'+P_LVLS.map(row).join("")+
    '<button type="button" class="p56-link" data-act="p56a2">A2の文法項目ごとの達成度を見る ›</button></div>';
  return h.replace('<div class="p48-tiles">',card+'<div class="p48-tiles">');
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="closelearn"&&ui.view==="search"){e.stopImmediatePropagation();e.preventDefault();ui.view="p47words";saveUI();render();window.scrollTo(0,0);return;}
  if(a==="closelearn"&&ui.view==="a2check"){e.stopImmediatePropagation();e.preventDefault();ui.learnOpen=false;ui.bnav="stats";saveUI();render();window.scrollTo(0,0);return;}
  if(a!=="p56search"&&a!=="p56test"&&a!=="p56a2")return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p56search"){clearTransientUI();ui.bnav="wordbook";ui.view="search";ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);return;}
  if(a==="p56test"){p56StartTest(v);return;}
  if(a==="p56a2"){clearTransientUI();ui.session=null;ui.bnav="wordbook";ui.view="a2check";ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);return;}
},true);
(function(){
  var css='.p56-search{display:flex;align-items:center;gap:10px;width:100%;padding:13px 14px;margin-bottom:10px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--muted);font-size:14px;font-weight:700;cursor:pointer}'+
  '.p56-goal{display:flex;align-items:center;gap:8px;width:100%;margin:0 0 12px;padding:10px 14px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}'+
  '.p56-gl{font-size:11.5px;color:var(--muted);font-weight:700}.p56-goal b{font-size:16px;color:var(--accent)}.p56-gbar{flex:1;height:8px;border-radius:9px;background:var(--card2);overflow:hidden}'+
  '.p56-gbar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--sub));border-radius:9px;min-width:3px}.p56-gn{font-size:13px;font-weight:800}'+
  '.p56-badge{font-size:10.5px;font-weight:800;color:#30D158;background:rgba(48,209,88,.14);padding:2px 7px;border-radius:99px}'+
  '.p56-trow{display:flex;align-items:center;gap:10px;padding:10px 0;border-top:1px solid var(--line)}.p56-trow:first-of-type{border-top:none}.p56-tt{flex:1}.p56-tt b{display:block;font-size:14px}.p56-tt small{font-size:11.5px;color:var(--muted)}'+
  '.p56-trow .p47-btn{padding:9px 12px;font-size:12.5px}.p56-link{display:block;margin-top:8px;background:none;border:none;color:var(--accent);font-size:12.5px;font-weight:700;cursor:pointer;padding:6px 0}'+
  '.p56-result{text-align:center;padding:22px 16px;border-radius:24px;margin-bottom:14px;border:1px solid var(--line);background:radial-gradient(120% 90% at 50% 0%,var(--accentSoft),transparent 65%),var(--card)}'+
  '.p56-result.ok{border-color:#30D158}.p56-rart{width:84px;height:84px;margin:0 auto 8px;border-radius:26px;display:flex;align-items:center;justify-content:center}'+
  '.p56-rlv{font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.06em}.p56-rpct{font-size:54px;font-weight:800;line-height:1.1}.p56-rpct small{font-size:22px;color:var(--muted)}'+
  '.p56-result.ok .p56-rpct{color:#30D158}.p56-rmsg{font-size:14px;font-weight:700;margin-top:4px}.p56-rsub{font-size:12px;color:var(--muted);margin-top:6px}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
