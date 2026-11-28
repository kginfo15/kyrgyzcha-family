/* ===== PHASE52: 4択クイズで答え合わせ・復習タイミング・戻る動作・その他の練習の整理 ===== */
/* ---- 復習の間隔：正解するたびに 1→3→7→14→30→60→120日。間違えたら10分後にもう一度 ---- */
LADDER_DAYS=[1,3,7,14,30,60,120];
if(!settings.p52Mode)settings.p52Mode="quiz";
function p52DueCount(){return VOCAB.filter(function(w){return isDue(w.id);}).length;}
/* ---- 4択クイズ ---- */
function p52Applies(s){return settings.p52Mode==="quiz"&&s&&s.origin!=="reinforce"&&s.list&&s.pos<s.list.length;}
function p52Short(m){return String(m||"").split(/[／\/]/)[0].replace(/（[^）]*）/g,"").trim()||String(m||"");}
function p52Pool(w){
  var same=VOCAB.filter(function(x){return x.id!==w.id&&x.pos===w.pos&&p52Short(x.meaning)!==p52Short(w.meaning)&&x.word!==w.word;});
  if(same.length<12)same=same.concat(VOCAB.filter(function(x){return x.id!==w.id&&x.pos!==w.pos&&p52Short(x.meaning)!==p52Short(w.meaning);}));
  return same;
}
function p52Make(s){
  var id=s.list[s.pos],w=WMAP[id];if(!w)return null;
  var pr=progress[id],isNew=(!pr||pr.status==="new")&&!p47IsKnown(id);
  if(isNew)return {id:id,type:"intro"};
  var types=["meaning","reverse","listen"],k=(p50Hash(id)+(pr?pr.correctCount+pr.wrongCount:0))%3,type=types[k];
  if(type==="listen"&&!window.speechSynthesis)type="meaning";
  var pool=shuffle(p52Pool(w)),opts=[],seen={};seen[type==="reverse"?w.word:p52Short(w.meaning)]=1;
  for(var i=0;i<pool.length&&opts.length<3;i++){var key=type==="reverse"?pool[i].word:p52Short(pool[i].meaning);if(seen[key])continue;seen[key]=1;opts.push(pool[i].id);}
  opts.push(id);opts=shuffle(opts);
  return {id:id,type:type,opts:opts,pick:null};
}
function p52Header(s){
  var mq=ui.mixQueue&&s.origin==="mix"?ui.mixQueue:null;
  var cur=mq?mq.pos+1:s.pos+1,tot=mq?mq.items.length:s.list.length;
  return '<div class="p52-top"><button type="button" class="p51-back" data-act="endsession" aria-label="やめる"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>'+
    '<div class="p52-prog"><i style="width:'+Math.round((cur-1)/Math.max(1,tot)*100)+'%"></i></div><span class="p52-cnt">'+cur+' / '+tot+'</span></div>';
}
function p52Detail(w){
  return '<div class="p52-detail"><div class="p52-dw">'+esc(w.accent||w.word)+'<button type="button" class="p52-spk" data-act="say" data-say="'+esc(w.accent||w.word)+'" aria-label="もう一度聞く">'+P52_SPK+'</button></div>'+
    (w.kana?'<div class="p52-dk">'+esc(w.kana)+'</div>':'')+'<div class="p52-dm">'+esc(w.meaning)+'</div>'+
    (w.exRu?'<div class="p52-dex"><b>'+esc(w.exRu)+'</b><span>'+esc(w.exJa||"")+'</span></div>':'')+
    (w.simpleExp?'<div class="p52-dexp">'+esc(w.simpleExp)+'</div>':'')+'</div>';
}
var P52_SPK='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5L6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13"/></svg>';
function p52Render(s){
  var q=s.p52;if(!q||q.id!==s.list[s.pos]){q=s.p52=p52Make(s);saveUI();}
  if(!q)return null;
  var w=WMAP[q.id],fav=progress[q.id]&&progress[q.id].favorite;
  var h='<div class="p52">'+p52Header(s);
  var bm='<button type="button" class="p52-bm'+(fav?" on":"")+'" data-act="fav" data-val="'+q.id+'" aria-label="ブックマーク">'+p47Icon("bookmark",20)+'</button>';
  if(q.type==="intro"){
    h+='<div class="p52-card">'+bm+'<div class="p52-tag p52-new">新しい単語</div>'+p52Detail(w)+'</div>';
    h+='<div class="p52-foot"><div class="p52-hint">次に出てきたときにクイズで確認します</div><button type="button" class="p52-next" data-act="p52next">覚えた、次へ'+p47Icon("chev",18)+'</button></div></div>';
    return h;
  }
  var lab={meaning:"意味はどれ？",reverse:p47L().name+"でどう言う？",listen:nsOn()?"意味はどれ？（聞き取り問題を文字で）":"聞こえた単語の意味は？"}[q.type];
  h+='<div class="p52-card">'+bm+'<div class="p52-tag">'+lab+'</div>';
  if(q.type==="meaning")h+='<div class="p52-q">'+esc(w.accent||w.word)+'</div><button type="button" class="p52-spk big" data-act="say" data-say="'+esc(w.accent||w.word)+'">'+P52_SPK+'</button>';
  else if(q.type==="reverse")h+='<div class="p52-q ja">'+esc(p52Short(w.meaning))+'</div>';
  else if(nsOn())h+='<div class="p52-q">'+esc(w.accent||w.word)+'</div><div class="ns-wrap">'+nsBtn()+'</div>';
  else h+='<button type="button" class="p52-listen" data-act="say" data-say="'+esc(w.accent||w.word)+'">'+P52_SPK.replace('width="20" height="20"','width="40" height="40"')+'<span>タップして聞く</span></button><div class="ns-wrap">'+nsBtn()+'</div>';
  h+='</div><div class="p52-opts">';
  q.opts.forEach(function(oid,i){
    var o=WMAP[oid],txt=q.type==="reverse"?(o.accent||o.word):p52Short(o.meaning),cls="";
    if(q.pick!==null){if(oid===q.id)cls=" right";else if(i===q.pick)cls=" wrong";else cls=" dim";}
    h+='<button type="button" class="p52-opt'+cls+'" data-act="p52pick" data-val="'+i+'"'+(q.pick!==null?' disabled':'')+'><span class="p52-n">'+(i+1)+'</span><span class="p52-t">'+esc(txt)+'</span>'+
      (cls===" right"?p47Icon("check",20):cls===" wrong"?'<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>':'')+'</button>';
  });
  h+='</div>';
  if(q.pick===null)h+='<button type="button" class="p52-idk" data-act="p52pick" data-val="-1">わからない</button>';
  else{
    var ok=q.opts[q.pick]===q.id;
    h+='<div class="p52-res '+(ok?"ok":"ng")+'"><b>'+(ok?"正解！":(q.pick<0?"答えを確認しましょう":"おしい！"))+'</b><span>'+(ok?"次の復習は "+LADDER_DAYS[Math.min((progress[q.id]&&progress[q.id].intervalStep)||0,LADDER_DAYS.length-1)]+" 日後の予定です":"10分後にもう一度出題します")+'</span></div>'+p52Detail(w)+
       '<div class="p52-foot"><button type="button" class="p52-next" data-act="p52next">次へ'+p47Icon("chev",18)+'</button></div>';
  }
  return h+'</div>';
}
var _p52Study=renderStudy;
renderStudy=function(){
  var s=ui.session;
  if(p52Applies(s)){var r=p52Render(s);if(r)return r;}
  return _p52Study.apply(this,arguments);
};
function p52Grade(kind){
  var s=ui.session;if(!s)return;var id=s.list[s.pos];
  answer(id,kind);requeueInSession(id,kind);
  s.pos++;s.revealed=false;s.kanaPeek=false;s.showExtra=false;s.showGrammar=false;s.p8GraderPending=null;s.p52=null;
  touchSession();saveUI();
  if(ui.mixQueue&&s.origin==="mix"){p21Advance(kind);window.scrollTo(0,0);return;}
  render();window.scrollTo(0,0);
}
/* ---- 戻るボタン：単語練習はホームへ ---- */
/* ---- その他の練習：よく使う5つだけ。残りは「ほかの練習も表示」 ---- */
var P52_CORE=["compose","qadrill","listening","dialog","gnote"];
renderLearnHub=function(){
  var items=LEARN_ITEMS.filter(function(it){return it[0]!=="word"&&it[0]!=="reinforce";});
  var core=P52_CORE.map(function(k){return items.filter(function(it){return it[0]===k;})[0];}).filter(Boolean);
  var rest=items.filter(function(it){return P52_CORE.indexOf(it[0])<0;});
  var desc={compose:"日本語を見て、すぐ言う",qadrill:"聞かれたら、すぐ答える",listening:"聞き流しで耳を慣らす",dialog:"場面の会話を聞いてまねる",gnote:"文法の早見表と練習"};
  var card=function(it){return '<button type="button" class="hubcard" data-act="openlearn" data-val="'+it[0]+'">'+hubIcon(it[0])+'<div class="nm" style="margin-top:10px">'+esc(it[1])+'</div><div class="ct">'+esc(desc[it[0]]||it[2])+'</div></button>';};
  var h='<div class="p51-hubhead"><div class="p48-title" style="margin-bottom:4px">その他の練習</div><div class="p51-hubsub">単語はホームの「単語練習」で。ここでは話す・聞く・文法を練習します</div></div>';
  h+='<div class="hubgrid">'+core.map(card).join("")+'</div>';
  h+='<button type="button" class="p52-morehub" data-act="p52hubmore">'+(ui.p52HubMore?'ほかの練習を隠す':'ほかの練習も表示（'+rest.length+'）')+'</button>';
  if(ui.p52HubMore)h+='<div class="hubgrid" style="margin-top:10px">'+rest.map(card).join("")+'</div>';
  return h;
};
/* ---- ホーム：復習が来ている単語の数 ---- */
var _p52Home=renderHome;
renderHome=function(){
  var h=String(_p52Home()),n=p52DueCount();
  if(n>0)h=h.replace('<div class="p47-sub">','<div class="p52-due">'+p47Icon("clock",14)+'<span>復習の時期 <b>'+n+'</b>語</span></div><div class="p47-sub">');
  return h;
};
/* ---- 設定：出題の形式 ---- */
var _p52Settings=renderSettings;
renderSettings=function(embed){
  var h=String(_p52Settings(embed)),m=settings.p52Mode;
  var s='<div class="p47-set"><div class="p47-setrow"><div><b>単語の答え合わせ</b><small>4択クイズは正解したときだけ「覚えた」になります。間違えた単語は10分後、正解した単語は1・3・7・14・30日…後に復習で出ます</small></div></div>'+
    '<div class="p47-seg" style="grid-template-columns:1fr 1fr"><button type="button" data-act="p52mode" data-val="quiz" class="'+(m==="quiz"?"on":"")+'">4択クイズ</button><button type="button" data-act="p52mode" data-val="card" class="'+(m==="card"?"on":"")+'">カード（自己採点）</button></div></div>';
  return h.replace('<div class="p47-set"><div class="p47-setrow"><div><b>読み上げの声</b>',s+'<div class="p47-set"><div class="p47-setrow"><div><b>読み上げの声</b>');
};
/* ---- 操作 ---- */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="closelearn"&&ui.view==="p47words"){e.stopImmediatePropagation();e.preventDefault();clearTransientUI();ui.learnOpen=false;ui.bnav="home";saveUI();render();window.scrollTo(0,0);return;}
  var mine={p52pick:1,p52next:1,p52hubmore:1,p52mode:1};
  if(!mine[a])return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p52hubmore"){ui.p52HubMore=!ui.p52HubMore;saveUI();render();return;}
  if(a==="p52mode"){settings.p52Mode=v==="card"?"card":"quiz";saveAll();render();return;}
  var s=ui.session,q=s&&s.p52;if(!q)return;
  if(a==="p52pick"){if(q.pick!==null)return;q.pick=+v;saveUI();render();try{var w=WMAP[q.id];speak(w.accent||w.word);}catch(_){}return;}
  if(a==="p52next"){
    if(q.type==="intro"){p52Grade("maybe");return;}
    p52Grade(q.pick>=0&&q.opts[q.pick]===q.id?"ok":"no");return;
  }
},true);
/* ---- 見た目 ---- */
(function(){
  var css=
  '.p52{padding-bottom:20px}.p52-top{display:flex;align-items:center;gap:12px;margin:2px 0 16px}.p52-prog{flex:1;height:8px;border-radius:9px;background:var(--card2);overflow:hidden}'+
  '.p52-prog i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--accent),var(--sub))}.p52-cnt{font-size:13px;font-weight:800;color:var(--muted);min-width:46px;text-align:right}'+
  '.p52-card{position:relative;background:radial-gradient(120% 90% at 50% 0%,var(--accentSoft),transparent 65%),var(--card);border:1px solid var(--line);border-radius:24px;padding:22px 18px;text-align:center;margin-bottom:14px}'+
  '.p52-bm{position:absolute;top:12px;right:12px;width:38px;height:38px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--muted);display:flex;align-items:center;justify-content:center;cursor:pointer}.p52-bm.on{color:var(--accent);border-color:var(--accent)}.p52-bm.on svg path{fill:currentColor}'+
  '.p52-tag{display:inline-block;font-size:12px;font-weight:800;color:var(--accent);background:var(--accentSoft);padding:4px 10px;border-radius:99px;margin-bottom:12px}.p52-tag.p52-new{color:#F2B705;background:rgba(242,183,5,.14)}'+
  '.p52-q{font-size:34px;font-weight:800;letter-spacing:-.01em;line-height:1.2;margin:4px 0 10px}.p52-q.ja{font-size:28px}'+
  '.p52-spk{width:36px;height:36px;border-radius:50%;border:none;background:var(--card2);color:var(--accent);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;vertical-align:middle;margin-left:8px}'+
  '.p52-spk.big{width:52px;height:52px;margin:0;background:var(--accent);color:#fff;box-shadow:0 8px 20px var(--accentSoft)}'+
  '.p52-listen{display:flex;flex-direction:column;align-items:center;gap:8px;margin:6px auto 4px;width:120px;height:120px;border-radius:50%;border:none;background:var(--accent);color:#fff;justify-content:center;cursor:pointer;box-shadow:0 0 0 10px var(--accentSoft)}.p52-listen span{font-size:11px;font-weight:800}'+
  '.p52-opts{display:flex;flex-direction:column;gap:9px}'+
  '.p52-opt{display:flex;align-items:center;gap:12px;width:100%;padding:15px 14px;border-radius:16px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:16px;font-weight:700;text-align:left;cursor:pointer}'+
  '.p52-n{width:26px;height:26px;border-radius:9px;background:var(--card2);color:var(--muted);font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex:0 0 auto}.p52-t{flex:1}'+
  '.p52-opt.right{border-color:#30D158;background:rgba(48,209,88,.12);color:#fff}.p52-opt.right .p52-n{background:#30D158;color:#fff}.p52-opt.right svg{color:#30D158}'+
  '.p52-opt.wrong{border-color:#FF453A;background:rgba(255,69,58,.12)}.p52-opt.wrong .p52-n{background:#FF453A;color:#fff}.p52-opt.wrong svg{color:#FF453A}.p52-opt.dim{opacity:.45}'+
  '.p52-idk{display:block;margin:14px auto 0;background:none;border:none;color:var(--muted);font-size:14px;font-weight:700;padding:8px 14px;cursor:pointer}'+
  '.p52-res{margin:14px 0 10px;padding:12px 14px;border-radius:16px;display:flex;flex-direction:column;gap:2px}.p52-res b{font-size:17px}.p52-res span{font-size:12.5px;color:var(--muted)}'+
  '.p52-res.ok{background:rgba(48,209,88,.12);border:1px solid rgba(48,209,88,.35)}.p52-res.ok b{color:#30D158}.p52-res.ng{background:rgba(255,69,58,.10);border:1px solid rgba(255,69,58,.3)}.p52-res.ng b{color:#FF6B60}'+
  '.p52-detail{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:16px;text-align:left}.p52-card .p52-detail{background:none;border:none;padding:0;text-align:center}'+
  '.p52-dw{font-size:26px;font-weight:800;display:flex;align-items:center;gap:4px}.p52-card .p52-dw{justify-content:center;font-size:32px}'+
  '.p52-dk{color:var(--accent);font-weight:700;margin-top:4px}.p52-dm{font-size:18px;font-weight:800;margin-top:8px}'+
  '.p52-dex{margin-top:12px;padding:12px;border-radius:14px;background:var(--card2);text-align:left}.p52-dex b{display:block;font-size:15px}.p52-dex span{display:block;font-size:12.5px;color:var(--muted);margin-top:3px}'+
  '.p52-dexp{margin-top:10px;font-size:13px;color:var(--muted);line-height:1.7;text-align:left}'+
  '.p52-foot{position:sticky;bottom:calc(84px + env(safe-area-inset-bottom));margin-top:14px;padding-top:8px;background:linear-gradient(180deg,transparent,var(--bg) 30%)}'+
  '.p52-hint{text-align:center;font-size:12px;color:var(--muted);margin-bottom:8px}'+
  '.p52-next{width:100%;padding:16px;border:none;border-radius:18px;background:var(--accent);color:#fff;font-size:16px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;box-shadow:0 10px 24px var(--accentSoft)}'+
  '.p52-due{display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:700;margin-top:8px;padding:4px 10px;border-radius:99px;background:rgba(0,0,0,.28);white-space:nowrap}.p52-due b{font-size:14px}'+
  '.p52-morehub{display:block;width:100%;margin-top:12px;padding:14px;border-radius:16px;border:1px dashed var(--lineStrong);background:none;color:var(--muted);font-weight:800;font-size:13.5px;cursor:pointer}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
