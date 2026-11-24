/* ===== Phase77：入り口をわかりやすく／文法書から練習／押すと出る注釈 =====
   ・ホームに「学び方は3つ」：文法から学ぶ／冒険で1から全部／まとめて周回（スピード復習）。辞書とお気に入りも並べる。
   ・冒険の画面のいちばん上に「いま進行中のストーリー」と「ストーリーを選ぶ」を大きく出す。道の一覧では進行中の道に印。
   ・文法解説書の各章に「この文法の練習問題を解く」。その文法が出てくる問題だけを集めて10問。答えのあとに理由つきの解説。
   ・「？」を押すと短い説明（注釈）の吹き出しが出る。 */
var P77_TIPS={
 home:"学び方は3つあります。どれから始めても、進み具合は全部いっしょに記録されます。",
 grammar:"文法解説書を読んで、その章の文法が出てくる問題だけを練習できます。答えたあとに「なぜこの形？」の説明が出ます。",
 quest:"なりたい姿（9つのストーリー）を選んで、1つめのテーマから順番に全部進めます。ストーリーはあとから変えられます。",
 lap:"覚えた単語も、まだの単語も、全部を順番にどんどん回す復習モードです。1問ごとの説明は短く、テンポよく進みます。",
 dict:"知らない単語を調べられます。ロシア語・日本語・英語のほか、耳で聞いた音をひらがな・カタカナで入れても探せます（例：すぱしば）。",
 fav:"問題の右上の ☆ や、単語の ☆ で入れたものだけを練習できます。",
 story:"冒険は9つのストーリー（剣・魔法・王・武士・海、マナスなど物語と歴史）から選べます。いま進んでいるストーリーは、ここに出ます。",
 gp:"この章の文法が出てくる問題を、アプリの全レッスンから集めました。まちがえても、答えのあとの説明で理由がわかります。"
};
function p77Tip(k){return '<button type="button" class="p77-tip" data-act="p77tip" data-val="'+k+'" aria-label="説明を見る">?</button>';}
document.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest('[data-act="p77tip"]'):null;
  var open=document.querySelectorAll(".p77-bub");for(var i=0;i<open.length;i++)if(!el||open[i].getAttribute("data-k")!==el.getAttribute("data-val"))open[i].remove();
  if(!el)return;e.stopImmediatePropagation();e.preventDefault();
  var k=el.getAttribute("data-val"),ex=document.querySelector('.p77-bub[data-k="'+k+'"]');if(ex){ex.remove();return;}
  var b=document.createElement("div");b.className="p77-bub";b.setAttribute("data-k",k);b.setAttribute("role","note");b.textContent=P77_TIPS[k]||"";
  document.body.appendChild(b);var r=el.getBoundingClientRect(),w=Math.min(280,window.innerWidth-24);b.style.width=w+"px";
  var x=Math.max(12,Math.min(window.innerWidth-w-12,r.left+r.width/2-w/2));b.style.left=x+"px";
  var top=r.bottom+8;b.style.top=top+"px";b.style.setProperty("--ax",(r.left+r.width/2-x)+"px");
  if(top+b.offsetHeight>window.innerHeight-8){b.style.top=(r.top-b.offsetHeight-8)+"px";b.classList.add("up");}
},true);
window.addEventListener("scroll",function(){var o=document.querySelectorAll(".p77-bub");for(var i=0;i<o.length;i++)o[i].remove();},true);

/* ---------- ホーム：学び方は3つ ---------- */
function p77CurQuest(){try{if(!p74Story())return null;var P=p74Path();if(!P)return null;var S=p74State();return {P:P,S:S};}catch(_){return null;}}
function p77Entrances(){
  var q=p77CurQuest(),G=window.P72_GUIDE||[],rd=0;try{var r=(settings.p72g||{}).read||{};G.forEach(function(g){if(r[g.id])rd++;});}catch(_){}
  var lap="";try{lap=(p35LapDone()>0||p35Lap()>1)?(p36ScopeLabel()+' '+p35Lap()+'周目'):'';}catch(_){}
  var favN=0;try{favN=p72FavCount();}catch(_){}
  var card=function(act,val,art,kicker,title,sub,tip,cls){return '<div class="p77-ent'+(cls?" "+cls:"")+'"><button type="button" class="p77-entb" data-act="'+act+'"'+(val!=null?' data-val="'+val+'"':'')+'><span class="p77-ic">'+art+'</span><span class="p77-tx"><small>'+kicker+'</small><b>'+title+'</b><em>'+sub+'</em></span><span class="p77-go">›</span></button>'+p77Tip(tip)+'</div>';};
  var qa=q?'<span class="p77-hero">'+p74Hero(q.P,q.S.stage,"p77-himg")+'</span>':p48Art("mountain",34);
  var qsub=q?'<i class="p77-now">進行中</i> '+esc(q.P.name)+' ・ '+esc(q.P.titles[q.S.stage])+' Lv '+q.S.lv:'9つのストーリーから選んで、1から順番に全部';
  var h='<div class="p77-ents"><div class="p77-enth"><b>学び方を選ぶ</b><small>入り口は3つ。進み具合は全部いっしょに記録されます。</small>'+p77Tip("home")+'</div>';
  h+=card("p72guide","",p48Art("book",34),"1　文法から学ぶ","文法解説書と練習問題",G.length+'章 ・ 読んだ '+rd+'章 ・ 各章に練習問題',"grammar");
  h+=card("p70road",null,qa,"2　冒険で1から全部",q?'ストーリーの続きへ':'ストーリーを選んで始める',qsub,"quest","p77-q");
  h+=card("p48reinf",null,p48Art("loop",34),"3　まとめて周回","全単語をスピード復習",lap?esc(lap):'全部の単語を順番にどんどん回す',"lap");
  h+='<div class="p77-sub2"><div class="p77-ent p77-mini"><button type="button" class="p77-entb" data-act="p56search"><span class="p77-tx"><b>辞書</b><em>ひらがな・カタカナの音でも引ける</em></span></button>'+p77Tip("dict")+'</div>'+
     '<div class="p77-ent p77-mini"><button type="button" class="p77-entb" data-act="p72fav"><span class="p77-tx"><b>お気に入り</b><em>'+favN+' 問を練習</em></span></button>'+p77Tip("fav")+'</div></div></div>';
  return h;
}
if(typeof renderHome==="function"){
  var _p77Home=renderHome;
  renderHome=function(){var h=String(_p77Home.apply(this,arguments));
    if(h.indexOf('class="p72-links"')<0)return h;
    h=h.replace(/<div class="p72-links">[\s\S]*?<\/div>/,p77Entrances());
    h=h.replace(/<button type="button" class="p47-card" data-act="p48reinf">[\s\S]*?<\/button>/,"");
    /* 冒険の「続きから」カードにも、進行中のストーリー名を出す */
    var q=p77CurQuest();if(q)h=h.replace('<small>'+P74_NAME+'を続きから ・ ','<small>進行中のストーリー：<b>'+esc(q.P.name)+'</b> ・ ');
    return h;};
}
/* 辞書ボタンを .p72-links に足す処理が、新しい入り口にも重ならないように */
/* ---------- 冒険の画面：進行中のストーリーを大きく ---------- */
if(typeof p74Main==="function"){
  var _p77Main=p74Main;
  p74Main=function(){var h=String(_p77Main.apply(this,arguments));if(P74_VIEW==="read")return h;
    var P=p74Path();if(!P)return h;var n=P74_PATHS.length;
    var ban='<div class="p77-story" style="--pc:'+P.color+'"><div class="p77-sth"><small>いま進行中のストーリー</small>'+p77Tip("story")+'</div><b>'+esc(P.name)+'</b><span>'+esc(P.goal)+'</span>'+
      '<button type="button" class="p77-stb" data-act="p74choose">ほかのストーリーを選ぶ（全'+n+'つ） ›</button></div>';
    return ban+h;};
}
if(typeof p74Chooser==="function"){
  var _p77Ch=p74Chooser;
  p74Chooser=function(){var h=String(_p77Ch.apply(this,arguments)),cur=p74S().path;
    h='<div class="p77-chh"><b>ストーリーを選ぶ</b><small>'+P74_PATHS.length+'つの中から1つ。いつでも変えられ、それぞれの進み具合は残ります。</small></div>'+h;
    if(cur)h=h.replace('data-act="p74pick" data-val="'+cur+'"','data-act="p74pick" data-val="'+cur+'" data-now="1"').replace(/(data-now="1"[^>]*>[\s\S]*?<span class="p74-ptx"><b>)/,'$1<i class="p77-now">進行中</i> ');
    return h;};
}
/* ---------- 文法解説書：この章の練習問題 ---------- */
var P77_GPX={};
/* その章だけの問題がないときに使う、関係の深い章（どの章の問題かは、練習の画面に書く） */
var P77_GFB={basics:["nom","acc","pre"],gender:["adj","past"],cases:["gen","dat","acc","ins","pre"],jpdiff:["acc","dat","ins"],aspect:["past","pres"],imper:["pres"],motion:["acc","pre"]};
function p77GpTopics(t){var n=0;try{n=(p72WhereIndex()[t]||[]).length;}catch(_){}return n?[t]:(P77_GFB[t]||[]);}
function p77GpSteps(t){
  var TS=p77GpTopics(t),ix=[];TS.forEach(function(k){try{ix=ix.concat(p72WhereIndex()[k]||[]);}catch(_){}});
  var seen={},cand=[];
  ix.forEach(function(r){var L=[];try{L=p71Lessons(r.ti);}catch(_){}(L[r.li]||[]).forEach(function(id){if(!seen[id]){seen[id]=1;cand.push(id);}});});
  cand=shuffle(cand);var steps=[],pool=[];try{pool=cand.slice();}catch(_){}
  for(var i=0;i<cand.length&&steps.length<10;i++){var id=cand[i],w=WMAP[id],c=null;try{c=p71Cloze(id);}catch(_){}if(!c||!w)continue;
    var lab=c.forms?c.forms.lab[c.forms.key]:"";try{lab=lab||p72FormName(w,c.f.surface);}catch(_){}
    var ts=[];try{ts=p72Topics(w,lab,c.f);}catch(_){}if(!ts.some(function(k){return TS.indexOf(k)>=0;}))continue;
    if(c.forms)steps.push({t:"form",id:id,c:c});
    else{var opts=[id];try{opts=shuffle([id].concat(p71Distract(id,p72PoolFor(id),3)));}catch(_){}steps.push({t:"cloze",id:id,c:c,opts:opts});}}
  return steps;
}
function p77GpCount(t){if(P77_GPX[t]==null){var n=0;p77GpTopics(t).forEach(function(k){try{n+=(p72WhereIndex()[k]||[]).length;}catch(_){}});P77_GPX[t]=n;}return P77_GPX[t];}
function p77GName(id){var g=(window.P72_GUIDE||[]).filter(function(x){return x.id===id;})[0];return g?g.t.replace(/（.*$/,""):id;}
function p77GpStart(t){
  var steps=p77GpSteps(t);if(!steps.length){toast("この章の練習問題は、まだ用意できていません");return;}
  var ids=[];steps.forEach(function(s){if(ids.indexOf(s.id)<0)ids.push(s.id);});
  try{p70ClosePage();}catch(_){}try{p72GuideClose();}catch(_){}
  P71={fav:1,gp:t,ti:-1,li:0,n:1,ids:ids,steps:steps,pos:0,stage:0,picked:null,picked2:null,mist:{},retried:{},ok:0,ng:0,rv:[],before:p47DoneToday(),confirm:false};
  p71Render();
}
var _p77Head=p71Head;
p71Head=function(){var S=P71;if(!S||!S.gp)return _p77Head.apply(this,arguments);var tot=S.steps.length,p=Math.min(S.pos,tot),g=(window.P72_GUIDE||[]).filter(function(x){return x.id===S.gp;})[0];
  return '<div class="p71-top"><button type="button" class="p71-x" data-act="p71quit" aria-label="やめる">✕</button><div class="p71-meta"><small>文法の練習：'+esc(g?g.t:"")+'</small><div class="p71-bar"><i style="width:'+Math.round(p/tot*100)+'%"></i></div></div><span class="p71-count">'+p+'<small>/'+tot+'</small></span></div>';};
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest('[data-act="p77gp"],[data-act="p72fav"]'):null;if(!el)return;
  var a=el.getAttribute("data-act");if(a!=="p77gp")return;
  e.stopImmediatePropagation();e.preventDefault();var t=el.getAttribute("data-val");P71=null;p77GpStart(t);},true);
/* 練習の結果画面の「もう一度」は、同じ章の練習をもう一度 */
if(typeof p71Render==="function"){var _p77R=p71Render;p71Render=function(){var r=_p77R.apply(this,arguments);try{if(P71&&P71.gp){var bs=document.querySelectorAll('[data-act="p72fav"]');for(var i=0;i<bs.length;i++){bs[i].setAttribute("data-act","p77gp");bs[i].setAttribute("data-val",P71.gp);}}}catch(_){}return r;};}
if(typeof p72GuideRender==="function"){
  var _p77GR=p72GuideRender;
  p72GuideRender=function(){_p77GR.apply(this,arguments);var m=document.getElementById("p72g");if(!m||!P72G)return;
    if(!P72G.id){var lead=m.querySelector(".p72-glead");if(lead&&!m.querySelector(".p77-gtl"))lead.insertAdjacentHTML("afterend",'<p class="p77-gtl"><span>どの章にも「<b>この文法の練習問題を解く</b>」ボタンがあります。読んだらすぐ練習できます。</span>'+p77Tip("grammar")+'</p>');return;}
    if(P71)return;var t=P72G.id,n=p77GpCount(t);if(!n)return;
    var b='<div class="p77-gp"><button type="button" class="p77-gpb" data-act="p77gp" data-val="'+t+'"><b>この文法の練習問題を解く</b><small>'+(p77GpTopics(t)[0]===t?'この章の文法が出てくる問題を10問。':'この章だけの問題はまだないので、関係の深い「'+p77GpTopics(t).map(p77GName).join('」「')+'」の問題を10問出します。')+'答えたあとに理由つきの解説が出ます。</small></button>'+p77Tip("gp")+'</div>';
    var sub=m.querySelector(".p72-gsub");if(sub)sub.insertAdjacentHTML("afterend",b);
    var nav=m.querySelector(".p72-gnav");if(nav)nav.insertAdjacentHTML("beforebegin",b.replace('class="p77-gp"','class="p77-gp p77-gp2"'));};
}
/* ---------- 辞書・まとめて周回にも注釈 ---------- */
if(typeof renderWordSearch==="function"){
  var _p77Ws2=renderWordSearch;
  renderWordSearch=function(){var h=String(_p77Ws2.apply(this,arguments));return h.replace('<div class="p73-dhead"><span>','<div class="p73-dhead">'+p77Tip("dict")+'<span>');};
}
if(typeof p36RenderScopePick==="function"){
  var _p77Sp=p36RenderScopePick;
  p36RenderScopePick=function(){var h=String(_p77Sp.apply(this,arguments));return h.replace('<h2>まとめて練習</h2><p>全部の単語を順番に見ていく周回モードです。','<h2>まとめて周回 '+p77Tip("lap")+'</h2><p>全部の単語を順番に、スピードよく回していく復習モードです。');};
}
(function(){try{var st=document.createElement("style");st.textContent=
'.p77-tip{flex:none;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--line);background:var(--card);color:var(--muted);font:800 13px/20px system-ui,sans-serif;padding:0;cursor:pointer;text-align:center;vertical-align:middle}'+
'.p77-bub{position:fixed;z-index:9999;background:var(--ink);color:var(--bg);font-size:13.5px;line-height:1.6;padding:10px 12px;border-radius:12px;box-shadow:0 6px 20px rgba(0,0,0,.25)}.p77-bub:before{content:"";position:absolute;top:-6px;left:calc(var(--ax) - 6px);border:6px solid transparent;border-top:0;border-bottom-color:var(--ink)}.p77-bub.up:before{top:auto;bottom:-6px;border:6px solid transparent;border-bottom:0;border-top-color:var(--ink)}'+
'.p77-ents{margin:14px 0 10px}.p77-enth{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:0 2px 8px}.p77-enth b{font-size:17px}.p77-enth small{flex:1 1 180px;color:var(--muted);font-size:12px}'+
'.p77-ent{position:relative;margin-bottom:8px}.p77-ent>.p77-tip{position:absolute;right:10px;top:10px}.p77-entb{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:16px;padding:12px 40px 12px 12px;font:inherit;cursor:pointer}'+
'.p77-ic{flex:none;width:52px;height:52px;border-radius:14px;background:var(--bg);display:flex;align-items:center;justify-content:center;overflow:hidden}.p77-hero svg,.p77-himg{width:52px;height:52px}.p77-tx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p77-tx small{font-size:12px;color:var(--accent);font-weight:800}.p77-tx b{font-size:16px}.p77-tx em{font-style:normal;font-size:12.5px;color:var(--muted);line-height:1.45}.p77-go{color:var(--muted);font-size:20px}'+
'.p77-now{display:inline-block;font-style:normal;font-size:11px;font-weight:800;color:#fff;background:#2E9E5B;border-radius:999px;padding:1px 8px;margin-right:2px;vertical-align:1px}'+
'.p77-sub2{display:flex;gap:8px}.p77-mini{flex:1;margin:0}.p77-mini .p77-entb{padding:10px 36px 10px 12px;border-radius:14px}.p77-mini .p77-tip{top:50%;margin-top:-12px;right:8px}.p77-mini .p77-tx b{font-size:15px}'+
'.p77-story{border:2px solid var(--pc);border-radius:18px;padding:12px 14px;margin:0 0 12px;background:var(--card)}.p77-sth{display:flex;align-items:center;justify-content:space-between}.p77-sth small{font-size:12px;font-weight:800;color:var(--muted)}.p77-story>b{display:block;font-size:22px;margin:2px 0}.p77-story>span{display:block;font-size:13px;color:var(--muted);margin-bottom:10px}'+
'.p77-stb{width:100%;border:0;border-radius:12px;background:var(--pc);color:#fff;font:inherit;font-weight:800;font-size:15px;padding:11px 12px;cursor:pointer}'+
'.p77-chh{margin:0 0 10px}.p77-chh b{display:block;font-size:20px}.p77-chh small{color:var(--muted);font-size:13px}'+
'.p77-gp{position:relative;margin:10px 0 14px}.p77-gp>.p77-tip{position:absolute;right:10px;top:10px}.p77-gpb{display:block;width:100%;text-align:left;border:0;border-radius:14px;background:var(--accent);color:#fff;font:inherit;padding:12px 40px 12px 14px;cursor:pointer}.p77-gpb b{display:block;font-size:16px}.p77-gpb small{display:block;font-size:12.5px;opacity:.92;line-height:1.5;margin-top:2px}.p77-gp .p77-tip{background:rgba(255,255,255,.9);color:#2B2233;border-color:transparent}'+
'.p77-gtl{font-size:13.5px;line-height:1.6;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 12px;display:flex;gap:8px;align-items:flex-start}.p77-gtl .p77-tip{margin-left:auto}'+
'.p73-dhead{display:flex;gap:8px;align-items:flex-start}.p73-dhead .p77-tip{order:2;margin-left:auto}';
document.head.appendChild(st);}catch(_){}})();
