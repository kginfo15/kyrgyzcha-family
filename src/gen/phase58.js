/* ===== PHASE58: 到達テストの作り直し（語彙・文法・読解/聞き取り 45問）と画面の収まり修正 ===== */
/* ---- 画面の収まり：画面が切り替わったら必ず一番上から表示。戻るボタンを常に見える位置に ---- */
var P58_LASTKEY="";
var _p58Render=render;
render=function(){
  var r=_p58Render.apply(this,arguments);
  try{
    var s=ui.session,key=[ui.bnav,ui.learnOpen?1:0,ui.view,s?(s.label||"")+":"+(s.origin||""):"",ui.composeSession?1:0,ui.chalPick?1:0,ui.mixSummary?1:0,ui.p58?ui.p58.done?"d":"t":""].join("|");
    if(key!==P58_LASTKEY){P58_LASTKEY=key;window.scrollTo(0,0);}
    /* 問題を解いている画面（左上に✕がある画面）は集中表示：上の帯と下のナビを隠して1画面に収める */
    var m=document.getElementById("main");document.body.classList.toggle("p58-focus",!!(m&&m.querySelector(".p52-top [data-act]")));
  }catch(_){}
  return r;
};
/* ---- 到達テスト ---- */
var P58_UNITS={ru:{A1:[0,10],A2:[10,99]},ky:{A1:[0,8],A2:[8,99]}};
function p58Strip(s){return String(s||"").replace(/́/g,"").toLowerCase();}
var P58_FORMS=(function(){var f={},disp={};COMPOSE.forEach(function(c){(c.breakdown||[]).forEach(function(b){var k=p58Strip(b.base);if(!k)return;
  var s=p58Strip(b.surface);(f[k]=f[k]||{})[s]=1;disp[s]=disp[s]||String(b.surface).replace(/^[«"(]+|[»")]+$/g,"");});});
  Object.keys(f).forEach(function(k){if(!disp[k])disp[k]=k;});return {f:f,disp:disp};})();
function p58LevelCompose(lv){var r=P58_UNITS[P47_LANG==="ky"?"ky":"ru"][lv];return COMPOSE.filter(function(c){var i=UNITS.indexOf(c.unit);return i>=r[0]&&i<r[1];});}
function p58Vocab(lv,n){
  var themes=P47_THEMES.filter(function(t){return t.level===lv;}),total=0;themes.forEach(function(t){total+=t.ids.length;});
  var out=[];themes.forEach(function(t){var k=Math.max(1,Math.round(n*t.ids.length/total));out=out.concat(shuffle(t.ids.filter(function(id){return !/\s/.test(WMAP[id].word);})).slice(0,k));});
  if(out.length<n){var have={};out.forEach(function(id){have[id]=1;});var rest=[];themes.forEach(function(t){t.ids.forEach(function(id){if(!have[id]&&!/\s/.test(WMAP[id].word))rest.push(id);});});out=out.concat(shuffle(rest).slice(0,n-out.length));}
  out=shuffle(out).slice(0,n);
  return out.map(function(id,i){var w=WMAP[id],mode=i%5<3?"meaning":"reverse",pool=shuffle(p52Pool(w)),opts=[],seen={};seen[mode==="reverse"?w.word:p52Short(w.meaning)]=1;
    for(var j=0;j<pool.length&&opts.length<3;j++){var key=mode==="reverse"?pool[j].word:p52Short(pool[j].meaning);if(seen[key])continue;seen[key]=1;opts.push(pool[j].id);}
    opts.push(id);opts=shuffle(opts);return {sec:"v",kind:"vocab",mode:mode,id:id,opts:opts,ans:opts.indexOf(id)};});
}
function p58Grammar(lv,n){
  var items=[],sents=shuffle(p58LevelCompose(lv));
  for(var i=0;i<sents.length&&items.length<n;i++){var c=sents[i],cand=[];
    (c.breakdown||[]).forEach(function(b){var base=p58Strip(b.base),s=p58Strip(b.surface),fs=P58_FORMS.f[base];if(!fs||s===base&&Object.keys(fs).length<3)return;
      var all={};Object.keys(fs).forEach(function(x){all[x]=1;});all[base]=1;if(Object.keys(all).length>=3&&s.length>1)cand.push({b:b,forms:Object.keys(all)});});
    if(!cand.length)continue;var pick=cand[Math.floor(Math.random()*cand.length)],s=p58Strip(pick.b.surface);
    var others=shuffle(pick.forms.filter(function(x){return x!==s;})).slice(0,3),opts=shuffle([s].concat(others));
    var src=c.accent||c.ru,idx=p58Strip(src).indexOf(s);if(idx<0)continue;
    var map=[];for(var k=0;k<src.length;k++)if(src.charCodeAt(k)!==0x301)map.push(k);map.push(src.length);
    var st=map[idx],en=map[idx+s.length];while(en<src.length&&src.charCodeAt(en)===0x301)en++;
    var blank=src.slice(0,st)+"＿＿＿"+src.slice(en);
    items.push({sec:"g",kind:"gram",cid:c.id,sent:blank,ja:c.ja,opts:opts.map(function(o){var d=String(P58_FORMS.disp[o]||o).replace(/\u0301/g,"").toLowerCase();return st===0?d.charAt(0).toUpperCase()+d.slice(1):d;}),ans:opts.indexOf(s),correct:pick.b.surface});
  }
  return items;
}
function p58Read(lv,n){
  var pool=shuffle(p58LevelCompose(lv)),items=[],canListen=!!window.speechSynthesis;
  for(var i=0;i<pool.length&&items.length<n;i++){var c=pool[i],others=shuffle(pool.filter(function(x){return x.id!==c.id&&x.ja!==c.ja;})).slice(0,3);
    var opts=shuffle([c].concat(others)).map(function(x){return x.id;});
    items.push({sec:"r",kind:"read",mode:(canListen&&items.length%2===1)?"listen":"read",cid:c.id,opts:opts,ans:opts.indexOf(c.id)});}
  return items;
}
function p58Start(lv){
  var items=p58Vocab(lv,20).concat(p58Grammar(lv,15)).concat(p58Read(lv,10));
  ui.p58={lv:lv,items:items,pos:0,picks:[],startedAt:Date.now(),done:false};
  clearTransientUI();ui.session=null;ui.composeSession=null;ui.mixQueue=null;ui.bnav="wordbook";ui.learnOpen=true;ui.view="p58test";saveUI();render();
}
p56StartTest=p58Start;
var P58_SEC={v:"語彙",g:"文法",r:"読解・聞き取り"};
function p58Score(T){var sec={v:[0,0],g:[0,0],r:[0,0]},ok=0;T.items.forEach(function(it,i){sec[it.sec][1]++;if(T.picks[i]===it.ans){sec[it.sec][0]++;ok++;}});
  var pct=Math.round(ok/T.items.length*100),sp={};Object.keys(sec).forEach(function(k){sp[k]=sec[k][1]?Math.round(sec[k][0]/sec[k][1]*100):100;});
  return {ok:ok,n:T.items.length,pct:pct,sec:sec,sp:sp,pass:pct>=75&&sp.v>=60&&sp.g>=60&&sp.r>=60};}
function renderP58(){
  var T=ui.p58;if(!T)return '<div class="p55-empty">テストがありません</div>';
  if(T.done)return p58Result(T);
  var it=T.items[T.pos],n=T.items.length;
  var h='<div class="p52"><div class="p52-top"><button type="button" class="p51-back" data-act="p58quit" aria-label="やめる"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
    '<div class="p52-prog"><i style="width:'+Math.round(T.pos/n*100)+'%"></i></div><span class="p52-cnt">'+(T.pos+1)+' / '+n+'</span></div>';
  h+='<div class="p58-sec">'+T.lv+' 到達テスト ・ <b>'+P58_SEC[it.sec]+'</b></div><div class="p52-card">';
  var opts;
  if(it.kind==="vocab"){var w=WMAP[it.id];
    if(it.mode==="meaning"){h+='<div class="p52-tag">意味はどれ？</div><div class="p52-q">'+esc(w.accent||w.word)+'</div>';opts=it.opts.map(function(o){return p52Short(WMAP[o].meaning);});}
    else{h+='<div class="p52-tag">'+p47L().name+'でどう言う？</div><div class="p52-q ja">'+esc(p52Short(w.meaning))+'</div>';opts=it.opts.map(function(o){return WMAP[o].accent||WMAP[o].word;});}}
  else if(it.kind==="gram"){h+='<div class="p52-tag">正しい形はどれ？</div><div class="p53-cloze">'+esc(it.sent).replace("＿＿＿",'<span class="p53-blank">？</span>')+'</div><div class="p53-clozeja">'+esc(it.ja)+'</div>';opts=it.opts;}
  else{var c=CMAP[it.cid];
    if(it.mode==="listen")h+='<div class="p52-tag">聞こえた文の意味は？</div><button type="button" class="p52-listen" data-act="say" data-say="'+esc(c.accent||c.ru)+'">'+P52_SPK.replace('width="20" height="20"','width="40" height="40"')+'<span>タップして聞く</span></button>';
    else h+='<div class="p52-tag">文の意味は？</div><div class="p58-sent">'+esc(c.accent||c.ru)+'</div>';
    opts=it.opts.map(function(o){return CMAP[o].ja;});}
  h+='</div><div class="p52-opts">'+opts.map(function(t,i){return '<button type="button" class="p52-opt" data-act="p58pick" data-val="'+i+'"><span class="p52-n">'+(i+1)+'</span><span class="p52-t">'+esc(t)+'</span></button>';}).join("")+'</div>';
  h+='<button type="button" class="p52-idk" data-act="p58pick" data-val="-1">わからない</button>';
  return h+'</div>';
}
function p58Result(T){
  var S=p58Score(T),lv=T.lv;
  var h='<div class="p56-result '+(S.pass?"ok":"ng")+'"><div class="p56-rart p48-ill">'+p48Art(S.pass?"trophy":"star",54)+'</div><div class="p56-rlv">'+lv+' 到達テスト</div>'+
    '<div class="p56-rpct">'+S.pct+'<small>%</small></div><div class="p56-rmsg">'+(S.pass?lv+' 合格です！おめでとうございます':'合格まであと少し。弱い分野を練習してもう一度挑戦しましょう')+'</div>'+
    '<div class="p56-rsub">'+S.ok+' / '+S.n+' 問正解 ・ 合格条件：全体75%以上、各分野60%以上</div></div>';
  h+='<div class="p48-card">';Object.keys(P58_SEC).forEach(function(k){var p=S.sp[k],ok=p>=60;
    h+='<div class="p58-srow"><span>'+P58_SEC[k]+'</span><span class="p58-sbar"><i class="'+(ok?"":"low")+'" style="width:'+p+'%"></i><em style="left:60%"></em></span><b class="'+(ok?"":"low")+'">'+p+'%</b><small>'+S.sec[k][0]+'/'+S.sec[k][1]+'</small></div>';});
  h+='<div class="p58-adv">'+(S.sp.v<60?'・語彙：単語練習とチャレンジで、'+lv+'のテーマを順に進めましょう<br>':'')+(S.sp.g<60?'・文法：文法ノートで格変化・活用を確認し、瞬間作文で練習しましょう<br>':'')+(S.sp.r<60?'・読解・聞き取り：読み物とリスニングで、文のまま理解する練習をしましょう':'')+(S.pass?'・話す力は、AI会話の場面練習で仕上げましょう':'')+'</div></div>';
  var wrong=T.items.map(function(it,i){return {it:it,i:i};}).filter(function(x){return T.picks[x.i]!==x.it.ans;});
  if(wrong.length){h+='<div class="h2" style="margin:16px 4px 8px">間違えた問題（'+wrong.length+'）</div><div class="p55-list">';
    wrong.slice(0,45).forEach(function(x){var it=x.it,q,a;
      if(it.kind==="vocab"){var w=WMAP[it.id];q=w.accent||w.word;a=p52Short(w.meaning);}
      else if(it.kind==="gram"){q=it.sent.replace("＿＿＿","［"+it.correct+"］");a=it.ja;}
      else{var c=CMAP[it.cid];q=c.accent||c.ru;a=c.ja;}
      h+='<div class="p55-row c"><span class="p55-rw">'+esc(q)+'</span><span class="p55-rm">'+esc(a)+'</span><em>'+P58_SEC[it.sec]+'</em></div>';});
    h+='</div>';}
  h+='<div class="p50-btns" style="margin-top:14px"><button type="button" class="p47-btn" data-act="p58again">もう一度受ける</button><button type="button" class="p47-btn primary" data-act="p57home">ホームへ</button></div>';
  return h;
}
function p58Finish(){
  var T=ui.p58,S=p58Score(T),rec=appHist.levelTests[T.lv]||{};
  rec.last=S.pct;rec.best=Math.max(rec.best||0,S.pct);rec.date=todayKey();rec.sec=S.sp;rec.v=2;if(S.pass)rec.passed=true;appHist.levelTests[T.lv]=rec;
  T.items.forEach(function(it,i){if(T.picks[i]!==it.ans){if(it.kind==="vocab")p55Mark("w:"+it.id,"no");else p55Mark("c:"+it.cid,"no");}});
  T.done=true;saveAll();saveUI();render();
  if(S.pass)setTimeout(function(){try{p53Celebrate();var hh=document.querySelector(".p53-cele h3");if(hh)hh.textContent=T.lv+" 合格！";var pp=document.querySelector(".p53-cele p");if(pp)pp.textContent="到達テストに合格しました。";}catch(_){}},300);
}
/* つなぎこみ */
var _p58Sub=renderLearnSub;
renderLearnSub=function(){if(ui.view==="p58test")return renderP58();return _p58Sub.apply(this,arguments);};
var _p58Stats=renderP48Stats;
renderP48Stats=function(){var h=String(_p58Stats());
  return h.replace('<span>25問・80%で合格</span>','<span>45問 ・ 語彙・文法・読解</span>').replace(/最高 (\d+)%/g,function(m,p){return '最高 '+p+'%';})+'';};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  var mine={p58pick:1,p58quit:1,p58quitok:1,p58again:1};if(!mine[a])return;
  e.stopImmediatePropagation();e.preventDefault();var T=ui.p58;
  if(a==="p58pick"&&T&&!T.done){T.picks[T.pos]=+v;T.pos++;if(T.pos>=T.items.length){p58Finish();return;}saveUI();render();window.scrollTo(0,0);
    var nx=T.items[T.pos];if(nx.kind==="read"&&nx.mode==="listen"){try{var c=CMAP[nx.cid];speak(c.accent||c.ru);}catch(_){}}return;}
  if(a==="p58quit"){var m=document.getElementById("p48modal");if(!m){m=document.createElement("div");m.id="p48modal";document.body.appendChild(m);}
    m.innerHTML='<div class="p48-mask" data-act="p48quitno"></div><div class="p48-dialog"><div class="p48-dlgart">'+p48Art("trophy",40)+'</div><h3>テストをやめますか？</h3><p>途中の回答は保存されず、結果も記録されません。</p><button type="button" class="p48-dlgbtn danger" data-act="p58quitok">はい、やめる</button><button type="button" class="p48-dlgbtn" data-act="p48quitno">テストを続ける</button></div>';m.className="show";return;}
  if(a==="p58quitok"){p48HideQuit();ui.p58=null;ui.learnOpen=false;ui.bnav="home";saveUI();render();return;}
  if(a==="p58again"&&T){p58Start(T.lv);return;}
},true);
(function(){
  var css='.p51-head{position:sticky;top:0;z-index:30;background:var(--bg);padding:8px 0;margin-top:-8px}.p52-top{position:sticky;top:0;z-index:30;background:var(--bg);padding:8px 0;margin-top:-8px}'+
  '#main .filtertabs{flex-wrap:wrap!important;overflow:visible!important;row-gap:6px}'+
  '#main .waveform{overflow:hidden;max-width:100%}'+
  'body.p58-focus header.app,body.p58-focus nav.bnav{display:none!important}body.p58-focus{padding-bottom:calc(12px + env(safe-area-inset-bottom))!important}body.p58-focus .p52-foot{bottom:0!important}body.p58-focus .p52-top{padding-top:calc(8px + env(safe-area-inset-top))}'+
  '.p58-sec{font-size:12px;color:var(--muted);margin:-4px 2px 10px}.p58-sec b{color:var(--accent)}.p58-sent{font-size:22px;font-weight:800;line-height:1.5;margin:4px 0 6px}'+
  '.p58-srow{display:grid;grid-template-columns:96px 1fr 44px 40px;align-items:center;gap:8px;padding:8px 0}.p58-srow span:first-child{font-size:13px;font-weight:700}'+
  '.p58-sbar{position:relative;height:10px;border-radius:9px;background:var(--card2);overflow:visible}.p58-sbar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--accent),var(--sub))}.p58-sbar i.low{background:#FF6B60}'+
  '.p58-sbar em{position:absolute;top:-3px;bottom:-3px;width:2px;background:var(--muted);opacity:.6}.p58-srow b{font-size:14px;text-align:right}.p58-srow b.low{color:#FF6B60}.p58-srow small{font-size:11px;color:var(--muted)}'+
  '.p58-adv{font-size:12.5px;color:var(--muted);line-height:1.8;margin-top:8px;padding-top:8px;border-top:1px solid var(--line)}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
