/* ===== PHASE53: 他アプリの良いところ（穴埋め例文・達成のお祝い・連続日数のおやすみ券・復習予報・到達予測） ===== */
/* ---- 1) 例文の穴埋めクイズ（Clozemaster式） ---- */
function p53Strip(s){return String(s||"").replace(/́/g,"").toLowerCase();}
function p53Cloze(w){
  if(!w||!w.exRu||/\s/.test(w.word.trim()))return null;
  var base=p53Strip(w.word),stem=base.length>4?base.slice(0,Math.max(3,base.length-(P47_LANG==="ky"?2:2))):base;
  if(P47_LANG==="ky"&&/(уу|үү|оо|өө)$/.test(base))stem=base.slice(0,-2);
  if(stem.length<2)return null;
  var toks=w.exRu.split(/(\s+|[,.!?;:—«»"“”()]+)/),hit=-1;
  for(var i=0;i<toks.length;i++){var t=p53Strip(toks[i]);if(t&&t.indexOf(stem)===0){hit=i;break;}}
  if(hit<0)return null;
  var shown=toks.map(function(t,i){return i===hit?"＿＿＿":t;}).join("");
  return {sentence:shown,answer:toks[hit].replace(/́/g,"")};
}
var _p53Make=p52Make;
p52Make=function(s){
  var q=_p53Make(s);if(!q||q.type==="intro")return q;
  var w=WMAP[q.id],cz=p53Cloze(w),pr=progress[q.id];
  if(cz&&((pr&&pr.correctCount)||0)>=1&&(p50Hash(q.id+(pr?pr.wrongCount:0))%3===0)){q.type="cloze";q.cloze=cz;}
  return q;
};
/* 穴埋めの選択肢は単語で表示 */
var _p53RenderOpts=p52Render;
p52Render=function(s){
  var q=s.p52;
  if(q&&q.type==="cloze"){q.type="reverse";var h=_p53RenderOpts(s);q.type="cloze";
    var w=WMAP[q.id];
    return h.replace(/<div class="p52-tag">[^<]*<\/div><div class="p52-q ja">[^<]*<\/div>/,
      '<div class="p52-tag">空欄に入る単語は？</div><div class="p53-cloze">'+esc(q.cloze.sentence).replace("＿＿＿",'<span class="p53-blank">'+(q.pick===null?"？":esc(q.cloze.answer))+'</span>')+'</div><div class="p53-clozeja">'+esc(w.exJa||"")+'</div>');}
  return _p53RenderOpts(s);
};
/* ---- 2) 今日の目標を達成したらお祝い（Duolingo式） ---- */
var _p53Advance=p21Advance;
p21Advance=function(kind){
  var before=p47DoneToday(),t=p47Target();
  var r=_p53Advance.apply(this,arguments);
  var after=p47DoneToday();
  if(before<t&&after>=t)setTimeout(p53Celebrate,350);
  return r;
};
function p53Celebrate(){
  var n=appHist.streak.count||0,mile=[7,30,50,100,200,365].indexOf(n)>=0;
  var m=document.getElementById("p48modal");if(!m){m=document.createElement("div");m.id="p48modal";document.body.appendChild(m);}
  var conf="";for(var i=0;i<36;i++){conf+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;animation-delay:'+(Math.random()*0.6).toFixed(2)+'s;background:'+(["var(--accent)","#F2B705","#FFF4E0","var(--sub)"][i%4])+';transform:rotate('+(i*37)+'deg)"></i>';}
  m.innerHTML='<div class="p48-mask"></div><div class="p53-conf">'+conf+'</div><div class="p48-dialog p53-cele">'+
    '<div class="p53-celeart">'+p48Art(mile?"trophy":"star",64)+'</div><h3>'+(mile?n+'日連続達成！':'今日の目標達成！')+'</h3>'+
    '<p>'+p47Target()+'問をクリアしました。'+(n>0?'連続 <b>'+n+'</b> 日目です。':'')+(appHist.freeze?'<br>おやすみ券 <b>'+appHist.freeze+'</b> 枚を持っています。':'')+'</p>'+
    '<button type="button" class="p48-dlgbtn" style="background:var(--accent);border-color:var(--accent);color:#fff" data-act="p53celeok">やった！</button></div>';
  m.className="show";
}
/* ---- 3) 連続日数のおやすみ券（7日続けるごとに1枚、最大2枚。1日休んでも連続が切れない） ---- */
var _p53Bump=bumpStreak;
bumpStreak=function(){
  var st=appHist.streak,t=todayKey();
  if(st.last&&st.last!==t){
    var last=new Date(st.last+"T00:00:00"),today=new Date(t+"T00:00:00"),gap=Math.round((today-last)/86400000)-1;
    var fz=appHist.freeze||0;
    if(gap>0&&gap<=fz){appHist.freeze=fz-gap;var y=new Date();y.setDate(y.getDate()-1);st.last=todayKey(y);appHist.freezeUsedAt=t;}
  }
  var before=st.count;
  var r=_p53Bump.apply(this,arguments);
  if(st.count>before&&st.count%7===0)appHist.freeze=Math.min(2,(appHist.freeze||0)+1);
  return r;
};
var _p53Home=renderHome;
renderHome=function(){
  var h=String(_p53Home()),fz=appHist.freeze||0;
  if(fz>0)h=h.replace('<span>日連続</span></div>','<span>日連続</span><em class="p53-fz" title="おやすみ券">'+p53IceIcon()+fz+'</em></div>');
  if(appHist.freezeUsedAt===todayKey())h=h.replace('<div class="p51-herowrap">','<div class="p53-note">おやすみ券を使って、連続日数を守りました</div><div class="p51-herowrap">');
  return h;
};
function p53IceIcon(){return '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M4 6l16 12M20 6L4 18"/></svg>';}
/* ---- 4) 復習予報（Anki式）と 5) 到達予測（Busuu式） ---- */
function p53Forecast(){
  var out=[],t0=new Date();t0.setHours(0,0,0,0);
  for(var i=0;i<7;i++)out.push(0);
  VOCAB.forEach(function(w){var p=progress[w.id];if(!p||!p.nextReview)return;var d=Math.floor((p.nextReview-t0.getTime())/86400000);if(d<0)d=0;if(d<7)out[d]++;});
  return out;
}
function p53Projection(level){
  var ids=VOCAB.filter(function(w){return w.level===level;}),left=ids.filter(function(w){return !p47IsKnown(w.id);}).length;
  if(!left)return {done:true};
  var sum=0,days=0;for(var i=0;i<14;i++){var d=new Date();d.setDate(d.getDate()-i);var r=appHist.days[todayKey(d)];if(r){sum+=r.newIntro||0;days++;}}
  var rate=sum/14;if(rate<0.5)return {left:left,rate:rate};
  var eta=new Date();eta.setDate(eta.getDate()+Math.ceil(left/rate));
  return {left:left,rate:rate,eta:eta};
}
var _p53Stats=renderP48Stats;
renderP48Stats=function(){
  var h=String(_p53Stats()),fc=p53Forecast(),mx=Math.max(1,Math.max.apply(null,fc));
  var wd=["日","月","火","水","木","金","土"];
  var f='<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">'+p48Art("clock",22)+'</span>これからの復習</b><span>単語数</span></div><div class="p53-fc">';
  fc.forEach(function(v,i){var d=new Date();d.setDate(d.getDate()+i);f+='<div class="p53-fcd'+(i===0?" today":"")+'"><em>'+(v||"")+'</em><i style="height:'+(v?Math.max(6,Math.round(v/mx*70)):3)+'px"></i><span>'+(i===0?"今日":i===1?"明日":wd[d.getDay()])+'</span></div>';});
  f+='</div><div class="p53-fcnote">間違えた単語は早めに、正解した単語は間隔をあけて自動で出題されます</div></div>';
  var pr=function(lv){var p=p53Projection(lv);
    if(p.done)return '<div class="p53-pj"><span class="p48-lvtag">'+lv+'</span><span>すべて覚えました！</span></div>';
    return '<div class="p53-pj"><span class="p48-lvtag">'+lv+'</span><span>残り <b>'+p.left+'</b> 語'+(p.eta?' ・ このペースなら <b>'+(p.eta.getFullYear()!==new Date().getFullYear()?p.eta.getFullYear()+'年':'')+(p.eta.getMonth()+1)+'月'+p.eta.getDate()+'日</b>ごろ達成':' ・ 新しい単語を進めると到達日を予測します')+'</span></div>';};
  var pj='<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">'+p48Art("trophy",22)+'</span>到達予測</b><span>直近14日のペース</span></div>'+P_LVLS.map(pr).join("")+'</div>';
  return h.replace('<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">',f+pj+'<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">');
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  if(el.getAttribute("data-act")==="p53celeok"){e.stopImmediatePropagation();e.preventDefault();p48HideQuit();}
},true);
(function(){
  var css='.p53-cloze{font-size:20px;font-weight:700;line-height:1.7;margin:4px 0 6px}.p53-blank{display:inline-block;min-width:64px;padding:0 8px;margin:0 2px;border-bottom:3px solid var(--accent);color:var(--accent);font-weight:800}'+
  '.p53-clozeja{font-size:13px;color:var(--muted)}'+
  '.p53-conf{position:absolute;inset:0;overflow:hidden;pointer-events:none}.p53-conf i{position:absolute;top:-12px;width:9px;height:14px;border-radius:2px;animation:p53fall 1.9s cubic-bezier(.2,.7,.4,1) forwards}'+
  '@keyframes p53fall{to{top:105%;transform:rotate(540deg) translateX(30px);opacity:.9}}'+
  '.p53-cele h3{font-size:24px}.p53-celeart{width:96px;height:96px;margin:0 auto 10px;border-radius:30px;background:radial-gradient(circle,var(--accentSoft),transparent 70%);display:flex;align-items:center;justify-content:center;animation:p53pop .5s cubic-bezier(.3,1.6,.5,1)}'+
  '@keyframes p53pop{from{transform:scale(.4);opacity:0}}'+
  '.p53-fz{display:inline-flex;align-items:center;gap:2px;font-style:normal;margin-left:6px;padding:1px 6px;border-radius:99px;background:rgba(100,210,255,.16);color:#64D2FF;font-weight:800}'+
  '.p53-note{font-size:12px;color:#64D2FF;margin:-6px 4px 10px}'+
  '.p53-fc{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:110px}.p53-fcd{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%}'+
  '.p53-fcd i{display:block;width:100%;max-width:26px;border-radius:7px 7px 3px 3px;background:var(--sub);opacity:.5}.p53-fcd.today i{background:var(--accent);opacity:1}'+
  '.p53-fcd em{font-style:normal;font-size:11px;font-weight:800;min-height:14px}.p53-fcd span{font-size:11px;color:var(--muted)}.p53-fcd.today span{color:var(--ink);font-weight:800}'+
  '.p53-fcnote{font-size:11.5px;color:var(--muted);margin-top:10px;line-height:1.6}'+
  '.p53-pj{display:flex;align-items:center;gap:10px;padding:8px 0;font-size:13px;border-top:1px solid var(--line)}.p53-pj:first-of-type{border-top:none}.p53-pj b{color:var(--ink)}.p53-pj span:last-child{color:var(--muted)}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
