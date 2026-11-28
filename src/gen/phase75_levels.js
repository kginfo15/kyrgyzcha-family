/* ===== Phase75：冒険モードの「難易度（5段階）」と「レッスンの途中から再開」 =====
   難易度：単語とレッスンは同じまま、問題の形だけを難しくする。
     1 見て選ぶ（今まで通り）／2 聞いて選ぶ／3 文字を並べて書く／4 聞いて書く／5 文の形を書く
   基本は難易度1から。どこかの道を1周（全テーマ完了）すると次の難易度が開く。まだ開いていない難易度も、確認のうえで選べる。
   難易度ごとに道の進み具合は別（settings.p74.own["道@難易度"]）。難易度1は今までの記録のまま。
   記録：settings.p74.lvl（いまの難易度）、settings.p74.clr（1周した最高の難易度）。
   途中再開：レッスンの途中でやめても、その端末の localStorage（K.set+"_p71run"）に問題と答えの状態を残し、
   同じレッスンを開くと続きから始まる。個人情報は含まない（単語のIDと正誤だけ）。 */
var P75_LV=[
 {n:"見て選ぶ",d:"絵と意味を見て、言葉を4つから選びます（今まで通り）"},
 {n:"聞いて選ぶ",d:"文字は見ずに音だけを聞いて、意味を選びます"},
 {n:"文字を並べて書く",d:"絵と意味を見て、文字を並べて言葉を自分で書きます"},
 {n:"聞いて書く",d:"音だけを聞いて、文字を並べて言葉を書きます（書き取り）"},
 {n:"文の形を書く",d:"聞いて書く＋文の空欄に入る形（格・活用）を選ばずに自分で書きます"}];
function p75Lv(){var s=p74S(),v=+s.lvl||1;return p74Story()&&p74Path()?Math.max(1,Math.min(5,v)):1;}
function p75Clr(){return Math.max(0,Math.min(5,+p74S().clr||0));}
function p75Open(l){return l<=p75Clr()+1;}
/* 難易度2以上は、道と難易度ごとの記録で数える */
var _p75Own=p74Own;
p74Own=function(pid){var s=p74S();pid=pid||s.path;var l=(+s.lvl||1);if(!p74Story()||l<2)return _p75Own(pid);
  if(!s.own||typeof s.own!=="object")s.own={};var k=pid+"@"+l;if(!s.own[k]||typeof s.own[k]!=="object")s.own[k]={};return s.own[k];};
/* ---------- 問題の形を難易度に合わせて変える ---------- */
var P75_EXTRA="абвгдеёжзийклмнопрстуфхцчшщыьэюя";
function p75Tiles(t){var a=p71Plain(t).toLowerCase().split("").filter(function(c){return c!==" ";}),ex=[];
  for(var i=0;i<Math.min(3,Math.max(2,Math.round(a.length/3)));i++)ex.push(P75_EXTRA[Math.floor(Math.random()*P75_EXTRA.length)]);
  var sp=/ /.test(t)?[" "]:[];return shuffle(a.concat(ex,sp));}
var _p75Build=p71Build;
p71Build=function(ti,li){var S=_p75Build.apply(this,arguments);var l=p75Lv();if(!S||l<2||S.fav)return S;S.lv=l;
  S.steps.forEach(function(x){
    if(x.t==="pick"){x.m=l===2?"hear":(l===3?"type":"dict");}
    else if(l===5&&(x.t==="cloze"||x.t==="form")&&x.c&&x.c.f){x.m="ctype";}
    if(x.m&&x.m!=="hear"){var w=WMAP[x.id];x.ans=p71Plain(x.m==="ctype"?x.c.f.surface:(w.accent||w.word));x.tiles=p75Tiles(x.ans);}});
  return S;};
/* ---------- 描画 ---------- */
function p75Eq(a,b){var f=function(t){return p71N(t).replace(/\s+/g,"");};return f(a)===f(b);}
function p75Built(S){return (S.inp||[]).map(function(i){return S.cur.tiles[i];}).join("");}
function p75Render(m,S,x){
  var w=WMAP[x.id],h='',foot='',done=S.picked!==null;
  if(S._said!==S.pos&&(x.m==="hear"||x.m==="dict")){S._said=S.pos;setTimeout(function(){try{speak(w.accent||w.word);}catch(_){}},250);}
  var big='<button type="button" class="p75-play" data-act="p75say" aria-label="もう一度聞く"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8q3 4 0 8M18.5 5.5q5 6.5 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><small>もう一度聞く</small></button>';
  var tag='<div class="p71-tag">'+(x.rev?'おさらい・':'')+'難易度'+S.lv+' ・ ';
  var NS=nsOn();
  if(x.m==="hear"){
    h='<div class="p71-body">'+tag+(NS?'言葉の意味は？（聞き取りを文字で）':'聞こえた言葉の意味は？')+'</div><div class="p71-q">'+(done?p71Pic(x.id)+'<div class="p71-mean"><b>'+esc(w.accent||w.word)+'</b></div>':NS?'<div class="ns-text">'+esc(w.accent||w.word)+'</div>':big)+'<div class="ns-wrap">'+nsBtn()+'</div>'+(done?p71Stamp(S.picked===x.id?1:0):'')+'</div><div class="p71-opts">'+
      x.opts.map(function(o,i){var st=done?(o===x.id?"right":(o===S.picked?"wrong":"dim")):"";var W=WMAP[o];
        return '<div class="p71-orow"><button type="button" class="p71-opt '+st+'" data-act="p71pick" data-val="'+i+'"><span>'+esc(W.meaning||"")+'</span>'+(done&&(o===x.id||o===S.picked)?'<small>'+esc(W.accent||W.word)+'</small>':'')+'</button></div>';}).join("")+'</div></div>';
    foot=done?'<button type="button" class="p71-main" data-act="p71next">次へ</button>':'<div class="p71-wait">選んでください</div>';
  }else{
    S.cur=x;var b=p75Built(S),ok=done&&p75Eq(S.picked,x.ans);
    var q='';
    if(x.m==="type")q='<div class="p71-q">'+p71Pic(x.id)+'<div class="p71-mean">'+esc(w.meaning||"")+'</div>'+(done?p71Stamp(ok?1:0):'')+'</div>';
    else if(x.m==="dict")q='<div class="p71-q">'+(done||NS?p71Pic(x.id)+'<div class="p71-mean">'+esc(w.meaning||"")+'</div>':big)+(done?p71Stamp(ok?1:0):'')+'<div class="ns-wrap">'+nsBtn()+'</div></div>';
    else{var c=x.c;q='<div class="p71-paper"><div class="p71-sent">'+p71Sentence(c,done?p71Plain(c.f.surface):null,done?(ok?"ok":"ng"):"")+'</div><div class="p71-ja">'+esc(c.ja)+'</div>'+(done?p71Spk(p71Plain(c.f.toks.join("")))+p71Stamp(ok?1:0):(p71N(c.f.surface)!==p71N(w.word)?'<p class="p75-hint">使う言葉：<b>'+esc(w.accent||w.word)+'</b>（'+esc(w.meaning||"")+'）を、文に合う形にして書きます</p>':'<p class="p75-hint">空欄の意味：<b>'+esc(w.meaning||"")+'</b></p>'))+'</div>';}
    h='<div class="p71-body">'+tag+(x.m==="type"?'絵と意味に合う言葉を書こう':x.m==="dict"?(NS?'絵と意味に合う言葉を書こう（聞き取りを文字で）':'聞こえた言葉を書こう'):'空欄に入る形を書こう')+'</div>'+q+
      '<div class="p75-ans'+(done?(ok?" ok":" ng"):"")+'">'+(b?esc(b).replace(/ /g,"&nbsp;"):'<span>下の文字をタップ</span>')+'</div>';
    if(!done){h+='<div class="p75-tiles">'+x.tiles.map(function(t,i){var u=(S.inp||[]).indexOf(i)>=0;return '<button type="button" class="p75-tile'+(u?" used":"")+'" data-act="p75tile" data-val="'+i+'"'+(u?" disabled":"")+'>'+(t===" "?"␣":esc(t))+'</button>';}).join("")+'</div>'+
      '<div class="p75-row"><button type="button" class="p75-sm" data-act="p75back">1文字けす</button><button type="button" class="p75-sm" data-act="p75clear">全部けす</button></div><p class="p71-small">余分な文字も混ざっています。アクセント記号は気にしなくて大丈夫です。</p>';
      foot='<button type="button" class="p71-main" data-act="p75check"'+(b?'':' disabled')+'>答え合わせ</button>';}
    else{h+=(ok?'':'<div class="p71-exp"><p>正解：<b>'+esc(x.m==="ctype"?x.ans:(w.accent||w.word))+'</b>　'+esc(w.meaning||"")+'</p>'+(w.simpleExp&&x.m!=="ctype"?'<p class="p71-det">'+esc(w.simpleExp)+'</p>':'')+'</div>')+(x.m==="ctype"?p71Explain(x,w):'');
      foot='<button type="button" class="p71-main" data-act="p71next">次へ</button>';}
    h+='</div>';
  }
  m.innerHTML='<div class="p71-wrap">'+p71Head()+'<div class="p71-scroll">'+h+'</div><div class="p71-foot">'+foot+'</div></div>';
  m.className="show";document.body.classList.add("p70-noscroll");p71FillPics(m);try{p72Wrap(m);}catch(_){}
  var sc=m.querySelector(".p71-scroll");if(sc&&S._top!==S.pos+"/"+S.stage){sc.scrollTop=0;S._top=S.pos+"/"+S.stage;}
}
var _p75Render=p71Render;
p71Render=function(){var S=P71,x=S&&!S.confirm&&S.steps[S.pos];
  if(x&&x.m){var m=document.getElementById("p71");if(!m){m=document.createElement("div");m.id="p71";document.body.appendChild(m);}try{p72PopClose();}catch(_){}p75Render(m,S,x);}
  else _p75Render.apply(this,arguments);
  p75Save();};
var _p75Next=p71Next;
p71Next=function(){if(P71){P71.inp=[];}return _p75Next.apply(this,arguments);};
function p75Check(){var S=P71,x=S&&S.steps[S.pos];if(!x||!x.m||S.picked!==null)return;var b=p75Built(S);if(!b)return;
  S.picked=b;var ok=p75Eq(b,x.ans);p71Grade(x,ok);var cp=S.steps[S.steps.length-1];if(!ok&&cp&&cp.again&&cp.id===x.id&&cp.tiles)cp.tiles=shuffle(cp.tiles.slice());
  try{speak(x.m==="ctype"?p71Plain(x.c.f.toks.join("")):x.ans);}catch(_){}p71Render();}
document.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(!/^p75/.test(a))return;e.stopImmediatePropagation();e.preventDefault();var S=P71,x=S&&S.steps[S.pos];
  if(a==="p75say"){if(x)try{speak(WMAP[x.id].accent||WMAP[x.id].word);}catch(_){}}
  else if(a==="p75tile"){if(!S||S.picked!==null)return;S.inp=S.inp||[];if(S.inp.indexOf(+v)<0)S.inp.push(+v);p71Render();}
  else if(a==="p75back"){if(S&&S.inp&&S.picked===null){S.inp.pop();p71Render();}}
  else if(a==="p75clear"){if(S&&S.picked===null){S.inp=[];p71Render();}}
  else if(a==="p75check")p75Check();
  else if(a==="p75lv")p75Dlg(0);
  else if(a==="p75set"){var l=+v;if(!p75Open(l)&&el.getAttribute("data-ok")!=="1"){p75Dlg(l);return;}
    p74S().lvl=l;try{saveAll();}catch(_){}var d=document.getElementById("p74dlg");if(d)d.remove();p74Open(false);try{render();}catch(_){}toast("難易度"+l+"「"+P75_LV[l-1].n+"」にしました");}
},true);
/* パソコンのキーボードでも入力できる（ロシア語の文字・Backspace・Enter） */
document.addEventListener("keydown",function(e){var S=P71,x=S&&!S.confirm&&S.steps[S.pos];if(!x||!x.m||x.m==="hear"||S.picked!==null)return;
  if(e.target&&/input|textarea/i.test(e.target.tagName))return;
  if(e.key==="Backspace"){e.preventDefault();(S.inp=S.inp||[]).pop();p71Render();return;}
  if(e.key==="Enter"){e.preventDefault();p75Check();return;}
  var k=String(e.key||"").toLowerCase();if(k.length!==1)return;if(k===" ")e.preventDefault();
  S.inp=S.inp||[];for(var i=0;i<x.tiles.length;i++){if(x.tiles[i]===k&&S.inp.indexOf(i)<0){S.inp.push(i);p71Render();return;}}});
/* ---------- 難易度を選ぶ ---------- */
function p75Dlg(ask){
  var cur=p75Lv(),h;
  if(!ask){h='<b class="p74-dt">難易度を選ぶ</b><p>単語とレッスンは同じで、問題の形が変わります。難易度ごとに、道の進み具合は別に記録されます。どこかの道を1周すると、次の難易度が開きます。</p>'+
    P75_LV.map(function(L,i){var l=i+1,op=p75Open(l);return '<button type="button" class="p74-dbtn'+(l===cur?" main":"")+'" data-act="p75set" data-val="'+l+'"><b>'+'★'.repeat(l)+'　'+esc(L.n)+(l===cur?'（いま）':'')+(op?'':' 🔒')+'</b><small>'+esc(L.d)+'</small></button>';}).join("");}
  else{h='<b class="p74-dt">難易度'+ask+'はまだ開いていません</b><p>ふつうは、難易度'+(ask-1)+'でどこかの道を1周すると開きます。それでも難易度'+ask+'「'+esc(P75_LV[ask-1].n)+'」で始めますか？</p>'+
    '<button type="button" class="p74-dbtn warn" data-act="p75set" data-val="'+ask+'" data-ok="1"><b>難易度'+ask+'で始める</b></button><button type="button" class="p74-dbtn" data-act="p75lv"><b>もどる</b></button>';}
  h+='<button type="button" class="p74-dbtn x" data-act="p74dlgx">キャンセル</button>';
  var d=document.getElementById("p74dlg");if(!d){d=document.createElement("div");d.id="p74dlg";document.body.appendChild(d);}
  d.innerHTML='<div class="p74-dbox" role="dialog" aria-modal="true">'+h+'</div>';}
var _p75Main=p74Main;
p74Main=function(){var h=_p75Main.apply(this,arguments);var l=p75Lv();
  return '<button type="button" class="p75-lvbar" data-act="p75lv"><span>難易度</span><b>'+'★'.repeat(l)+'<i>'+'★'.repeat(5-l)+'</i></b><em>'+esc(P75_LV[l-1].n)+'</em><small>変える ›</small></button>'+h;};
/* 1周したら次の難易度を開く */
var _p75Fin=p71Finish;
p71Finish=function(){var S=P71,o=_p75Fin.apply(this,arguments);
  try{if(S&&!S.fav&&p74Story()&&p74Path()){var st=p74State();if(!st.cur){var s=p74S(),l=p75Lv();if(l>(+s.clr||0)){s.clr=l;try{saveAll();}catch(_){}if(l<5)setTimeout(function(){toast("1周クリア！難易度"+(l+1)+"「"+P75_LV[l].n+"」が開きました");},600);}}}}catch(_){}
  try{if(S&&!S.fav)localStorage.removeItem(P75_RKEY);}catch(_){}return o;};
/* ---------- レッスンの途中から再開 ---------- */
var P75_RKEY=K.set+"_p71run";
function p75Ctx(){return (p74Story()&&p74Path()?p74S().path:"plain")+"@"+p75Lv();}
function p75Save(){var S=P71;try{
  if(!S||S.fav||S.fin)return;if(S.pos>=S.steps.length)return;if(S.pos===0&&S.picked===null)return;
  var c={};for(var k in S)if(k!=="confirm"&&k!=="cur"&&k!=="_top"&&k!=="_said")c[k]=S[k];
  localStorage.setItem(P75_RKEY,JSON.stringify({ctx:p75Ctx(),S:c}));}catch(_){}}
function p75Load(){try{var r=JSON.parse(localStorage.getItem(P75_RKEY)||"null");if(r&&r.S&&r.ctx===p75Ctx()&&r.S.steps&&r.S.steps.length)return r.S;}catch(_){}return null;}
var _p75Start=p71Start;
p71Start=function(ti,li){var R=p75Load();
  if(R&&(ti==null||ti<0||+ti===R.ti)&&(li==null||li<0||+li===R.li)&&P47_THEMES[R.ti]){
    try{P74_SNAP=p74State();}catch(_){P74_SNAP=null;}
    R.picked=null;R.picked2=null;R.stage=0;R.inp=[];R.confirm=false;R.fin=0;try{p70ClosePage();}catch(_){}
    P71=R;p71Render();toast("前回やめたところから再開します");return;}
  return _p75Start.apply(this,arguments);};
/* 「道のりの続きへ」：冒険モードでは、この道（と難易度）の記録で次を選ぶ */
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest('[data-act="p71again"]'):null;if(!el||!P71||P71.fav||!p74Story()||!p74Path())return;
  e.stopImmediatePropagation();e.preventDefault();var S=P71;P71=null;var R=p74Road(),ti=p74Next(S.ti)>=0?S.ti:(R.cur<0?S.ti:R.cur);
  if(S.cele)setTimeout(function(){try{p53Celebrate();}catch(_){}},300);p71Start(ti);},true);
/* ホーム：途中のレッスンがあれば、そのテーマへ */
var _p75Card=p70RoadCard;
p70RoadCard=function(){var h=String(_p75Card.apply(this,arguments)),R=p75Load();
  if(p74Story()&&p74Path()){var l=p75Lv();h=h.replace(P74_NAME+'を続きから ・ ',P74_NAME+'を続きから ・ ★'+l+' ・ ');}
  if(R){h=h.replace(/(class="p7[04]-(?:road)?card" data-act="p71go" data-val=")\d+(")/,"$1"+R.ti+"$2").replace(/を続きから ・ /,'を続きから（レッスン '+(R.li+1)+' の途中から） ・ ');}
  return h;};
(function(){try{var st=document.createElement("style");st.textContent=
'.p75-play{display:flex;flex-direction:column;align-items:center;gap:4px;margin:10px auto;padding:18px 26px;border-radius:20px;border:2px solid var(--accent);background:transparent;color:var(--accent);font:inherit;font-weight:800;cursor:pointer}.p75-play small{font-size:12px}'+
'.p75-ans{min-height:52px;margin:12px 0 8px;padding:10px 14px;border-radius:14px;border:2px dashed var(--line);font-size:26px;font-weight:800;text-align:center;color:var(--ink);letter-spacing:.04em;word-break:break-all}.p75-ans span{font-size:14px;font-weight:600;color:var(--muted);letter-spacing:0}.p75-ans.ok{border:2px solid #2E9E5B}.p75-ans.ng{border:2px solid #D0473A}'+
'.p75-tiles{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}.p75-tile{min-width:44px;height:48px;padding:0 10px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:22px;font-weight:800;cursor:pointer;box-shadow:0 2px 0 var(--line)}.p75-tile.used{opacity:.25}'+
'.p75-row{display:flex;gap:8px;justify-content:center;margin-top:10px}.p75-sm{border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer}'+
'.p75-hint{font-size:13px;color:var(--muted);margin:8px 0 0}.p75-hint b{color:var(--ink)}'+
'.p75-lvbar{display:flex;align-items:center;gap:8px;width:100%;box-sizing:border-box;margin:0 0 12px;padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer;text-align:left}.p75-lvbar span{font-size:12px;color:var(--muted);font-weight:700}.p75-lvbar b{color:#E0A100;letter-spacing:1px}.p75-lvbar b i{font-style:normal;color:var(--line)}.p75-lvbar em{flex:1;font-style:normal;font-weight:800;font-size:14px}.p75-lvbar small{color:var(--accent);font-weight:800;font-size:13px}'+
'.p71-main[disabled]{opacity:.45}';
document.head.appendChild(st);}catch(_){}})();
