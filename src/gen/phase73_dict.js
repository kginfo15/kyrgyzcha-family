/* ===== Phase73: 辞書（ロシア語・日本語・英語・ひらがな・カタカナ・あいまい・関連検索）と、単語練習のお気に入りボタン ===== */
var P73_DRAW=/*P73D*/""/*P73DE*/;
var P73_D=null; /* id -> {en, yomi} */
function p73Ru(){return typeof P47_LANG==="undefined"||P47_LANG==="ru";}
function p73DictData(){
  if(P73_D)return P73_D;P73_D={};
  String(P73_DRAW||"").split("\n").forEach(function(l){var a=l.split("|");if(a.length>=2&&a[0])P73_D[a[0]]={en:a[1]||"",yomi:a[2]||""};});
  return P73_D;
}
/* 文字の正規化：全角→半角、カタカナ→ひらがな、アクセント記号・ё を統一、小文字化 */
function p73Hira(s){return String(s||"").replace(/[ァ-ヶ]/g,function(c){return String.fromCharCode(c.charCodeAt(0)-0x60);});}
function p73Norm(s){
  s=String(s||"");try{s=s.normalize("NFKC");}catch(_){}
  s=s.toLowerCase().replace(/́|̀/g,"").replace(/ё/g,"е");
  s=p73Hira(s);
  return s.replace(/[\s　]+/g," ").trim();
}
function p73Script(q){
  if(/[а-яе]/.test(q))return "ru";
  if(/[a-z]/.test(q))return "lat";
  if(/[一-鿿々]/.test(q))return "kanji";
  if(/[ぁ-ゖー]/.test(q))return "kana";
  return "other";
}
/* 編集距離（短い語どうしだけ） */
function p73Lev(a,b){
  if(a===b)return 0;var m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;
  var prev=[],cur=[],i,j;for(j=0;j<=n;j++)prev[j]=j;
  for(i=1;i<=m;i++){cur=[i];var best=i;for(j=1;j<=n;j++){var c=a.charAt(i-1)===b.charAt(j-1)?0:1;
      cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+c);
      if(i>1&&j>1&&a.charAt(i-1)===b.charAt(j-2)&&a.charAt(i-2)===b.charAt(j-1))cur[j]=Math.min(cur[j],prev[j-2]!=null?prev[j-2]+1:cur[j]);
      if(cur[j]<best)best=cur[j];}
    if(best>2)return 9;prev=cur;}
  return prev[n];
}
/* 検索用の見出し語リスト（単語ごとに 種類つきの語を並べる） */
var P73_SIX=null;
function p73SearchIndex(){
  if(P73_SIX)return P73_SIX;var D=p73DictData(),out=[];
  function terms(s,re){return String(s||"").split(re).map(function(x){return p73Norm(x.replace(/[〜～…]/g,""));}).filter(function(x){return x;});}
  VOCAB.forEach(function(w){
    var d=D[w.id]||{},T=[];
    var ru=p73Norm(w.word);T.push(["ru",ru]);if(/\s/.test(ru))ru.split(" ").forEach(function(x){if(x.length>1)T.push(["ru2",x]);});
    if(w.roma){var r=p73Norm(w.roma).replace(/[^a-z' ]/g,"");if(r)T.push(["lat",r]);}
    var en=d.en||"";terms(en.replace(/\([^)]*\)/g,""),/;\s*/).forEach(function(x){T.push(["en",x]);var y=x.replace(/^(to|a|an|the)\s+/,"");if(y!==x)T.push(["en",y]);if(/\s/.test(y))y.split(" ").forEach(function(z){if(z.length>2)T.push(["en2",z]);});});
    var ja=String(w.meaning||"");T.push(["ja",p73Norm(ja.replace(/（[^）]*）/g,""))]);
    terms(ja.replace(/（[^）]*）/g,""),/[／・、,]/).forEach(function(x){T.push(["ja",x]);});
    terms(d.yomi,/[／]/).forEach(function(x){T.push(["yomi",x]);});
    if(w.kana){var k=p73Norm(w.kana).replace(/[・\s]/g,"");if(k)T.push(["kana",k]);}
    out.push({w:w,t:T,en:en});
  });
  P73_SIX=out;return out;
}
var P73_WHY={ru:"ロシア語",ru2:"ロシア語",lat:"ローマ字",en:"英語",en2:"英語",ja:"日本語",yomi:"よみ",kana:"発音（カナ）",form:"変化した形",near:"近い語",rel:"関連"};
/* 1語の点数 */
function p73Score(e,q,sc){
  var best=0,why="";
  for(var i=0;i<e.t.length;i++){var k=e.t[i][0],t=e.t[i][1],s=0;
    if((sc==="kana"||sc==="kanji")&&(k==="ru"||k==="ru2"||k==="lat"||k==="en"||k==="en2"))continue;
    if((sc==="ru")&&!(k==="ru"||k==="ru2"))continue;
    if((sc==="lat")&&!(k==="lat"||k==="en"||k==="en2"))continue;
    if(t===q)s=100;
    else if(t.indexOf(q)===0)s=86-Math.min(10,t.length-q.length);
    else if(q.length>=2&&t.indexOf(q)>0)s=((k==="ja"||k==="yomi")?70:62)-Math.min(16,(t.length-q.length)/2);
    else if(q.length>=2&&t.length>=2&&t.length*2>q.length&&q.indexOf(t)>=0&&(k==="ja"||k==="yomi"))s=48;
    else if(q.length>=3&&k!=="ja"){var lim=q.length>=7?2:1;var d=p73Lev(q,t);if(d<=lim)s=52-d*8;else if(t.length>q.length){var d2=p73Lev(q,t.slice(0,q.length));if(d2<=lim)s=44-d2*8;}}
    if(k==="ru2"||k==="en2")s=s*0.9;
    if(s>best){best=s;why=k;}
  }
  /* 漢字の一部が重なる（例：医者→医師） */
  if(!best&&sc==="kanji"&&q.length>=2){var ja=p73Norm(e.w.meaning),hit=0,cs=q.split("");cs.forEach(function(c){if(/[一-鿿]/.test(c)&&ja.indexOf(c)>=0)hit++;});
    var kc=cs.filter(function(c){return /[一-鿿]/.test(c);}).length;if(kc&&hit/kc>=0.5){best=24+hit*4;why="near";}}
  return [best,why];
}
var P73_LAST={q:"",why:{},form:null,rel:[]};
function p73Find(raw){
  var q=p73Norm(raw);if(!q)return [];
  var sc=p73Script(q),ix=p73SearchIndex(),res=[],seen={};
  var form=null;
  /* ロシア語の変化形（маму → ма́ма の「〜を」） */
  if(sc==="ru"&&window.p72Look&&!/\s/.test(q)){try{var L=p72Look(q);if(L&&L.id&&!L.guess){form=L;}}catch(_){}}
  ix.forEach(function(e){var r=p73Score(e,q,sc);if(r[0]>0){res.push({w:e.w,s:r[0]+(e.w.level==="A1"?1.5:e.w.level==="A2"?0.8:0),why:r[1]});seen[e.w.id]=1;}});
  if(form&&WMAP[form.id]){var fw=WMAP[form.id];var ex=res.filter(function(x){return x.w.id===fw.id;})[0];
    if(ex){if(ex.s<99){ex.s=99;ex.why="form";}}else res.push({w:fw,s:99,why:"form"});}
  res.sort(function(a,b){return b.s-a.s;});
  /* 関連：上位の語と同じカテゴリ・同じ意味の語 */
  var rel=[],inRes={};res.slice(0,40).forEach(function(x){inRes[x.w.id]=1;});
  if(res.length){var top=res[0].w,tm=String(top.meaning||"").replace(/（[^）]*）/g,"").split(/[／・]/)[0];
    VOCAB.forEach(function(w){if(w.id===top.id||rel.length>=10)return;var m=String(w.meaning||"").replace(/（[^）]*）/g,"");
      if(!inRes[w.id]&&tm&&tm.length>=2&&m.indexOf(tm)>=0&&rel.indexOf(w)<0&&!/^\d/.test(m))rel.push(w);});
    VOCAB.forEach(function(w){if(w.id===top.id||rel.length>=10)return;if(!inRes[w.id]&&top.category&&w.category===top.category&&rel.indexOf(w)<0&&!/\s/.test(w.word))rel.push(w);});
  }
  var why={};res.forEach(function(x){why[x.w.id]=x.why;});
  P73_LAST={q:raw,why:why,form:form,rel:rel};
  return res.map(function(x){return x.w;});
}
/* 既存の単語検索を「辞書」に置きかえる（絞り込み・並べ替えはそのまま使える） */
if(typeof searchWords==="function"){
  var _p73Sw=searchWords;
  searchWords=function(){
    var s=ui.search||{},q=String(s.q||"").trim();
    if(!q||!p73Ru())return _p73Sw.apply(this,arguments);
    var keep=s.q;s.q="";var base=_p73Sw.apply(this,arguments);s.q=keep;
    var ok={};base.forEach(function(w){ok[w.id]=1;});
    var list=p73Find(q).filter(function(w){return ok[w.id];});
    if(s.sort==="fav")list=list.slice().sort(function(a,b){var A=(progress[a.id]&&progress[a.id].favorite)?1:0,B=(progress[b.id]&&progress[b.id].favorite)?1:0;return B-A;});
    return list;
  };
}
if(typeof renderWordSearch==="function"){
  var _p73Ws=renderWordSearch;
  renderWordSearch=function(){
    var h=String(_p73Ws.apply(this,arguments));
    if(!p73Ru()||ui.p68bm)return h;
    var D=p73DictData(),s=ui.search||{},q=String(s.q||"").trim();
    h=h.replace('<div class="small muted" style="margin:0 2px 10px">単語・意味・カテゴリなどで検索できます</div>',
      '<div class="p73-dhead"><span>単語帳の '+VOCAB.length+' 語を、ロシア語・日本語・英語・ひらがな・カタカナで引けます。つづりが少し違っても、近い単語が出ます。</span></div>');
    h=h.replace('placeholder="例：привет、あいさつ、名詞…"','placeholder="例：такси、タクシー、たくしー、taxi、呼ぶ、маму" autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="search"');
    var why=(q&&P73_LAST.q===q)?P73_LAST.why:{};
    h=h.replace(/(data-act="worddetail" data-val="([^"]+)"[^>]*><div class="w"><b>[^<]*<\/b>)/g,function(all,pre,id){
      var d=D[id],en=d&&d.en?'<span class="p73-en">'+esc(d.en)+'</span>':'';
      var y=why[id]&&why[id]!=="ru"?'<span class="p73-why p73-why-'+why[id]+'">'+esc(P73_WHY[why[id]]||"")+'で一致</span>':'';
      return pre+en+y;});
    if(q&&P73_LAST.q===q){
      var add='';var f=P73_LAST.form;
      if(f&&f.id&&WMAP[f.id]&&p71N(WMAP[f.id].word)!==p71N(q)){var fw=WMAP[f.id];
        add+='<div class="p73-form"><b>「'+esc(q)+'」</b>は <button type="button" data-act="worddetail" data-val="'+fw.id+'">'+esc(fw.accent||fw.word)+'（'+esc(fw.meaning)+'）</button> の形'+(f.form?'：'+esc(f.form):'')+'</div>';}
      if(P73_LAST.rel.length)add+='<div class="p73-rel"><div class="p73-relh">関連する単語</div><div class="p73-chips">'+P73_LAST.rel.map(function(w){return '<button type="button" data-act="worddetail" data-val="'+w.id+'"><b>'+esc(w.accent||w.word)+'</b><span>'+esc(w.meaning)+'</span></button>';}).join("")+'</div></div>';
      if(add)h=h.replace(/(<div class="small muted" style="margin:0 2px 8px">\d+件<\/div>)/,add+'$1');
      if(/条件に一致する単語がありません/.test(h))h=h.replace('条件に一致する単語がありません。','見つかりませんでした。短くしたり、別の言い方（ひらがな・英語など）でも試してみてください。');
    }
    return h;
  };
}
if(typeof renderWordDetailSheet==="function"){
  var _p73Wd=renderWordDetailSheet;
  renderWordDetailSheet=function(){
    var h=String(_p73Wd.apply(this,arguments));if(!p73Ru())return h;
    var w=byId(ui.searchDetailId),d=w&&p73DictData()[w.id];
    if(d&&d.en){var k='<div class="roma">'+esc(w.roma||"")+'</div>';var i=h.indexOf(k);
      if(i>=0)h=h.slice(0,i+k.length)+'<div class="p73-den">英語：'+esc(d.en)+'</div>'+h.slice(i+k.length);}
    return h;
  };
}
/* 日本語入力（ひらがな変換中）に画面を作り直すと入力が壊れるので、確定してから検索する */
(function(){
  var composing=false;
  window.addEventListener("compositionstart",function(e){if(e.target&&e.target.id==="wordSearchBox")composing=true;},true);
  window.addEventListener("compositionend",function(e){var t=e.target;if(!t||t.id!=="wordSearchBox")return;composing=false;
    setTimeout(function(){try{t.dispatchEvent(new Event("input",{bubbles:true}));}catch(_){}},0);},true);
  window.addEventListener("input",function(e){var t=e.target;if(!t||t.id!=="wordSearchBox")return;
    if(composing||e.isComposing){e.stopImmediatePropagation();}},true);
})();

/* ---------- 単語練習：お気に入りボタンを文字つきで分かりやすく ---------- */
/* 単語の「ブックマーク」を、画面上はすべて「お気に入り」と呼ぶ（呼び方をそろえる） */
function p73Relabel(){
  if(!p73Ru())return;var root=document.body;if(!root||!document.createTreeWalker)return;
  var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,L=[];
  while((n=tw.nextNode())){if(/ブックマーク|単語を検索（|右上の印|右上のしおり/.test(n.nodeValue))L.push(n);}
  L.forEach(function(n){var p=n.parentNode;if(p&&/^(SCRIPT|STYLE)$/.test(p.nodeName))return;
    n.nodeValue=n.nodeValue.replace(/単語を検索（(\d+)語）/,"辞書で調べる（$1語・日本語／英語／ひらがなでもOK）").replace(/右上の印|右上のしおり/g,"右上の「お気に入り」ボタン").replace(/ブックマーク/g,"お気に入り");});
  var h=document.querySelectorAll(".p72-links");for(var i=0;i<h.length;i++){var el=h[i];if(el.querySelector('[data-act="p56search"]'))continue;
    var b=document.createElement("button");b.type="button";b.setAttribute("data-act","p56search");b.innerHTML="<b>辞書</b><small>"+VOCAB.length+" 語</small>";el.appendChild(b);}
  if(typeof ui!=="undefined"&&ui.view==="search"&&!ui.p68bm){var hs=document.querySelectorAll("h1,h2,.title,b,div");for(var j=0;j<hs.length&&j<4000;j++){var x=hs[j];if(x.childNodes.length===1&&x.firstChild.nodeType===3&&x.firstChild.nodeValue==="単語検索"){x.firstChild.nodeValue="辞書";}}}
}
function p73FavBtn(id){
  var on=!!(progress[id]&&progress[id].favorite);
  return '<button type="button" class="p73-fav'+(on?" on":"")+'" data-act="fav" data-val="'+esc(id)+'" aria-pressed="'+on+'">'+
    '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.2l2.6 5.5 6 .8-4.4 4.1 1.1 5.9L12 16.6l-5.3 2.9 1.1-5.9L3.4 9.5l6-.8z" fill="'+(on?"currentColor":"none")+'" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>'+
    '<span>お気に入り</span></button>';
}
(function(){
  if(typeof render!=="function")return;
  var _r=render;
  render=function(){
    var out=_r.apply(this,arguments);
    try{
      var bms=document.querySelectorAll(".p52-bm");
      for(var i=0;i<bms.length;i++){var b=bms[i],id=b.getAttribute("data-val");if(!id)continue;
        var wrap=document.createElement("div");wrap.innerHTML=p73FavBtn(id);var nb=wrap.firstChild;b.parentNode.replaceChild(nb,b);}
    }catch(_){}
    try{p73Relabel();}catch(_){}
    return out;
  };
  window.addEventListener("click",function(e){
    var el=e.target.closest&&e.target.closest(".p73-fav");if(!el)return;var id=el.getAttribute("data-val");
    setTimeout(function(){var on=!!(progress[id]&&progress[id].favorite);
      try{toast(on?"★ お気に入りに入れました":"お気に入りから外しました");}catch(_){}},30);
  },false);
})();

(function(){
  var css=
  '.p73-dhead{margin:0 2px 10px;display:flex;flex-direction:column;gap:3px}.p73-dhead b{font-size:17px}.p73-dhead span{font-size:13px;color:var(--muted);line-height:1.55}'+
  '.p73-en{display:block;font-size:12.5px;font-weight:500;color:var(--muted);margin-top:1px;font-style:italic}'+
  '.p73-why{display:inline-block;margin-top:3px;font-size:11px;font-weight:600;padding:1px 7px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}'+
  '.p73-why-form,.p73-why-near{border-style:dashed}'+
  '.p73-form{margin:0 0 10px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card2,var(--card));font-size:14px;line-height:1.6}'+
  '.p73-form button{font:inherit;font-weight:700;color:inherit;background:none;border:none;border-bottom:2px solid currentColor;padding:0;cursor:pointer}'+
  '.p73-rel{margin:0 0 12px}.p73-relh{font-size:12px;font-weight:700;color:var(--muted);margin:0 2px 6px}'+
  '.p73-chips{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;-webkit-overflow-scrolling:touch}'+
  '.p73-chips button{flex:0 0 auto;display:flex;flex-direction:column;align-items:flex-start;gap:1px;max-width:160px;padding:7px 10px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer;text-align:left}'+
  '.p73-chips b{font-size:14px}.p73-chips span{font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px}'+
  '.p73-den{margin-top:6px;font-size:14px;color:var(--muted)}'+
  '.p73-fav{position:absolute;top:12px;right:12px;display:inline-flex;align-items:center;gap:6px;height:40px;padding:0 12px;border-radius:999px;border:1.5px solid var(--line);background:var(--card);color:var(--muted);font:inherit;font-size:13px;font-weight:700;cursor:pointer;touch-action:manipulation;z-index:2}'+
  '.p73-fav.on{color:#B7791F;border-color:#E8B54A;background:rgba(232,181,74,.14)}'+
  'html.p72-dark .p73-fav.on{color:#F6C969;border-color:#C9963A;background:rgba(246,201,105,.12)}';
  var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
})();
if(typeof renderLearnSub==="function"){var _p73Sub=renderLearnSub;
  renderLearnSub=function(){var h=String(_p73Sub.apply(this,arguments));return (p73Ru()&&ui.view==="search"&&!ui.p68bm)?h.replace(">単語検索<",">辞書<"):h.replace(">ブックマーク<",">お気に入り単語<");};}
