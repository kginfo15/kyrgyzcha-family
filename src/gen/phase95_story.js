/* ===== Phase95：物語を細かく区切って、レッスンの途中でも少しずつ読めるようにする =====
   2026-11-28 Yuta「新しい話までの間隔が長くて飽きそう。話を細かくして、所々でストーリーを見られるように」。
   対象：キルギスの物語・歴史の道（マナス・セメテイ・クルマンジャン・トクトグル。P.hist）。両方のアプリ共通。
   しくみ：
   - 次に開く話（第 N 話）の「少し長めの本文」（phase78 の s.xl）を1文ずつの「その1・その2…」に分ける（新しい文章は書かない）。
   - いまの章のレッスンを終えるたびに数を数え、章のレッスン数を区切りの数で割った間隔ごとに、次の「その」が読める。
     最後の「その」は、今までどおり章をクリアしたとき（話がまるごと開くとき）。
   - 絵は、その話の描き下ろし4コマ（P76）のうち、文の位置に合うコマを1つ使う。
   記録：新しく保存するものはない。読める数はレッスンの記録（p74State）から毎回計算するので、
   スタンプ・章・ボス・姿の段階・前からの記録は何も変わらない。端末を替えてもクラウドの記録から同じ数になる。 */
(function(){
if(typeof p74State!=="function"||typeof P74_PATHS==="undefined")return;

/* この道で区切りを使うか（いまはキルギスの物語・歴史の道だけ。冒険の5つの道にも広げるなら P.story だけにする） */
function p95On(P){return !!(P&&P.hist&&P.story&&P.story.length>1);}

/* 文に分ける（「」の中の。では切らない）。段落の区切りも1文として扱う */
function sents(x){var out=[];String(x||"").split("\n").forEach(function(par){var buf="",q=0;
  for(var k=0;k<par.length;k++){var ch=par[k];buf+=ch;if(ch==="「")q++;if(ch==="」")q=Math.max(0,q-1);
    if((ch==="。"||ch==="！"||ch==="？")&&q===0&&par[k+1]!=="」"){out.push(buf);buf="";}}
  if(buf.trim())out.push(buf);});
  return out.map(function(t){return t.trim();}).filter(Boolean);}
/* 短すぎる文（12字未満）は、次の文とまとめて1つの「その」にする */
var CACHE={};
function p95Parts(P,e){var key=P.id+"#"+e;if(CACHE[key])return CACHE[key];var s=P.story[e];if(!s)return [];
  var ss=sents(s.xl||s.x),parts=[],buf="";
  ss.forEach(function(t,k){buf+=t;if(buf.length>=12||k===ss.length-1){parts.push(buf);buf="";}});
  if(buf)parts.push(buf);
  CACHE[key]=parts;return parts;}
/* 第 e 話について、いま「その」がいくつ読めるか。{k:読める数, m:全部の数, next:次までのレッスン数, ch:章} */
function p95Got(P,S,e){var parts=p95Parts(P,e),m=parts.length;if(!m)return {k:0,m:0,next:0,ch:null};
  if(S.stage>=e)return {k:m,m:m,next:0,ch:null};
  if(e!==S.stage+1)return {k:0,m:m,next:0,ch:null};
  var ch=S.ch.filter(function(c){return !c.beat;})[0];if(!ch)return {k:m,m:m,next:0,ch:null};
  var L=0,D=0;ch.themes.forEach(function(x){L+=x.ln||0;D+=Math.min(x.ld||0,x.ln||0);});
  if(!L)return {k:0,m:m,next:0,ch:ch};
  /* 最後の1つは章クリアのとき。それまでは L/m レッスンごとに1つ */
  var k=Math.min(m-1,Math.floor(D*m/L)),need=k+1<m?Math.ceil((k+1)*L/m)-D:0;
  /* 最後の1つの手前は「章のテーマを全部終えると」なので、残りレッスン数を出す */
  if(k+1>=m)need=L-D;
  return {k:k,m:m,next:Math.max(1,need),ch:ch};}
window.p95Got=p95Got;window.p95On=p95On;

/* 1つの「その」の絵：4コマのうち、文の位置に合うコマ */
function pic(P,e,n,m){try{if(typeof P76!=="undefined"&&P76[P.id]&&P76[P.id][e]){var A=P76[P.id][e],j=Math.min(A.length-1,Math.floor(n*A.length/m));
      var sv=M6.svg(A[j].d()),jp=n>0?Math.min(A.length-1,Math.floor((n-1)*A.length/m)):-1;
      /* 前の「その」と同じコマになるときは、カメラを寄せて別の切り取りにする（同じ絵が続かないように） */
      if(jp===j)sv=sv.replace('viewBox="0 0 240 140"','viewBox="'+(n%2?"62 8 172 100":"6 8 172 100")+'" preserveAspectRatio="xMidYMid slice"');
      return sv;}}catch(_){}
  try{var s=P.story[e];return p74Scene(s.fig.map(function(f){return p74Fig(P,f,e);}),{night:s.night,fire:s.fire});}catch(_){return "";}}
function epName(P,e){var t=String(P.story[e].t||""),m=/^([^　]+)　(.*)$/.exec(t);return m?{no:m[1],t:m[2]}:{no:"第"+e+"話",t:t};}
/* 「その」1つ分のカード */
function partHtml(P,e,n,m,isNew){var rd=(typeof p75Rd==="function")?p75Rd():"both",parts=p95Parts(P,e);
  return '<div class="p95-part'+(isNew?" new":"")+'"><span class="p95-no">その'+(n+1)+'<small> / '+m+'</small></span>'+
    (rd==="text"?'':'<div class="p95-pic">'+pic(P,e,n,m)+'</div>')+'<p>'+esc(parts[n]||"")+'</p></div>';}
function moreLine(G){return G.next>0?'<p class="p95-more">'+(G.k+1>=G.m?'この話の最後は、この章のテーマを全部終えると読めます（あと '+G.next+' レッスン）。':'つづき（その'+(G.k+1)+'）は、あと <b>'+G.next+'</b> レッスンで読めます。')+'</p>':'';}

/* ---------- 1) 冒険の画面の「次の話まで」 ---------- */
var _hint=p74StoryHint;
p74StoryHint=function(P,S,btn){if(!p95On(P)||S.stage>=8)return _hint.apply(this,arguments);
  var e=S.stage+1,G=p95Got(P,S,e),E=epName(P,e);if(!G.m)return _hint.apply(this,arguments);
  var b=btn?'<button type="button" data-act="p74ri" data-val="'+(G.k?e:S.stage)+'">'+(G.k?'つづきを読む':(S.stage?'ここまでを読む':'序章を読む'))+'</button>':'';
  return '<div class="p74-hint p95-hint"><span><small>'+esc(E.no)+'「'+esc(E.t)+'」 ・ その'+G.k+' / '+G.m+' まで読めます</small>'+
    '<b>'+(G.k+1>=G.m?'この話の最後まで あと '+G.next+' レッスン':'つづき（その'+(G.k+1)+'）まで あと '+G.next+' レッスン')+'</b></span>'+b+'</div>';};

/* ---------- 2) 物語の一覧：途中まで読める話を押せるようにする ---------- */
var _tab=p74StoryTab;
p74StoryTab=function(P,S){var h=String(_tab.apply(this,arguments));if(!p95On(P)||!S||S.stage>=8)return h;
  h=h.replace('章をクリアするたびに、次の場面が開きます。場面ごとに解説と例文があります。','レッスンを進めるたびに、次の話が「その1」「その2」…と少しずつ読めます。章をクリアすると話がそろい、解説と例文も開きます。');
  var e=S.stage+1,G=p95Got(P,S,e);if(!G.k)return h;
  var re=new RegExp('<div class="p74-tocr off"><span class="p74-tocn">'+e+'</span><span><b>([^<]*)</b><small>[^<]*</small></span></div>');
  return h.replace(re,function(_,t){return '<button type="button" class="p74-tocr p95-tocr" data-act="p74ri" data-val="'+e+'"><span class="p74-tocn">'+e+'</span><span><b>'+t+'</b><small>読んでいる途中 ・ その'+G.k+' / '+G.m+' まで読めます</small></span><i>›</i></button>';});};

/* ---------- 3) 1話ずつ読む画面：途中まで読める話を「その」ごとに出す ---------- */
var _reader=p74Reader;
p74Reader=function(P,S){if(!p95On(P)||!S||S.stage>=8)return _reader.apply(this,arguments);
  var st=S.stage,e=st+1,G=p95Got(P,S,e),i=P74_RI|0;
  if(!G.k)return _reader.apply(this,arguments);
  if(i<=st){/* いちばん新しい「読める話」から、途中の話へ進めるようにする */
    var h=String(_reader.apply(this,arguments)),tot=st+2;
    h=h.replace(new RegExp('(<button type="button" data-act="p74ri" data-val="'+(i+1)+'") disabled(>次の話 ›)','g'),'$1$2');
    h=h.replace(new RegExp(' / '+(st+1)+'</span>','g'),' / '+tot+'</span>');
    if(i===st)h=h.replace(/<p class="p74-rmore">[\s\S]*?<\/p>/,'<button type="button" class="p74-go p95-goon" data-act="p74ri" data-val="'+e+'">'+esc(epName(P,e).no)+'のつづき（その1〜'+G.k+'）を読む ›</button>');
    return h;}
  P74_RI=e;var E=epName(P,e),tot2=st+2;
  var nav=function(pos){return '<div class="p74-rnav '+pos+'"><button type="button" data-act="p74ri" data-val="'+st+'">‹ 前の話</button><span>'+esc(E.no)+' ・ '+tot2+' / '+tot2+'</span><button type="button" disabled>次の話 ›</button></div>';};
  var h2=(typeof p75RdBar==="function"?p75RdBar():'')+nav("top")+'<div class="p74-rd p95-rd"><b class="p74-sct">'+esc(P.story[e].t)+'</b><p class="p95-lead">この話は、レッスンを進めるたびに少しずつ読めます。いまは その'+G.k+' まで。</p>';
  for(var n=0;n<G.k;n++)h2+=partHtml(P,e,n,G.m,false);
  if(G.k<G.m)h2+='<div class="p95-part off"><span class="p95-no">その'+(G.k+1)+(G.k+1<G.m?'〜'+G.m:'')+'</span><p>まだ読めません。レッスンを進めると、1つずつ開きます。</p></div>';
  h2+=moreLine(G)+'</div>'+nav("bot")+'<button type="button" class="p74-rback" data-act="p74tab" data-val="story">話の一覧へ</button>';
  return h2;};

/* ---------- 4) レッスンの結果：新しく読める「その」を出す ---------- */
var _res=p71Result;
p71Result=function(){var h=String(_res.apply(this,arguments));
  try{var P=p74Path();if(!p74Story()||!p95On(P)||!P71||P71.fav||!P74_SNAP)return h;
    var A=P74_SNAP,B=p74State();if(B.stage>A.stage||B.stage>=8)return h;/* 章クリアのときは今までどおり話がまるごと開く */
    var e=B.stage+1,GA=p95Got(P,A,e),GB=p95Got(P,B,e);if(GB.k<=GA.k)return h;
    var E=epName(P,e),c='<div class="p95-newbox"><small>物語のつづきが読めます！</small><b>'+esc(E.no)+'「'+esc(E.t)+'」</b>';
    for(var n=GA.k;n<GB.k;n++)c+=partHtml(P,e,n,GB.m,true);
    c+=moreLine(GB)+'<button type="button" class="p74-go" data-act="p74read" data-val="'+e+'">この話をはじめから読む</button></div>';
    /* 「次の場面まで」の帯の代わりに置く */
    if(/<div class="p74-hint[^"]*">[\s\S]*?<\/span><\/div>/.test(h))return h.replace(/<div class="p74-hint[^"]*">[\s\S]*?<\/span><\/div>/,c);
    return h.replace('<div class="p71-body">','<div class="p71-body">'+c);
  }catch(_){return h;}};

/* ---------- 5) 冒険の画面（地図）にも、つづきまでの残りを1行 ---------- */
var _main=p74Main;
p74Main=function(){var h=String(_main.apply(this,arguments));
  try{var P=p74Path();if(!p95On(P)||P74_VIEW==="read")return h;var S=p74State();if(S.stage>=8)return h;
    var e=S.stage+1,G=p95Got(P,S,e);if(!G.m)return h;
    var line='<button type="button" class="p95-line" data-act="p74ri" data-val="'+(G.k?e:S.stage)+'"><span><small>物語 '+esc(epName(P,e).no)+'「'+esc(epName(P,e).t)+'」 ・ その'+G.k+' / '+G.m+' まで読める</small><b>'+(G.k+1>=G.m?'この話の最後まで':'つづき（その'+(G.k+1)+'）まで')+' あと '+G.next+' レッスン</b></span><i>›</i></button>';
    return h.replace('<div class="p83-links">',line+'<div class="p83-links">');}catch(_){return h;}};

(function(){try{var st=document.createElement("style");st.textContent=
'.p95-part{border:1.5px solid var(--line);border-radius:12px;overflow:hidden;background:var(--card);margin:10px 0;position:relative}'+
'.p95-part.new{border-color:var(--accent)}.p95-part.off{opacity:.55}.p95-part.off p{color:var(--muted)}'+
'.p95-no{position:absolute;left:8px;top:8px;z-index:1;background:#fff;color:#2B2233;border:1.5px solid #2B2233;border-radius:999px;padding:1px 9px;font:800 12.5px/20px system-ui,sans-serif}.p95-no small{font-weight:600;opacity:.7}'+
'.p95-part.off .p95-no{position:static;display:inline-block;margin:8px 0 0 8px}'+
'.p95-pic{line-height:0}.p95-pic svg{width:100%;height:auto;display:block;aspect-ratio:240/140}'+
'.p95-part p{margin:0;padding:12px 14px 14px;font-size:16.5px;line-height:1.85;color:var(--ink)}.p95-pic+p{border-top:1.5px solid var(--line)}'+
'.p95-part:not(:has(.p95-pic)) p{padding-top:38px}.p95-part.off p{padding-top:8px}'+
'.p95-newbox{margin:12px 0;padding:12px;border-radius:14px;background:color-mix(in srgb,var(--accent) 9%,transparent);border:1.5px solid color-mix(in srgb,var(--accent) 40%,transparent)}'+
'.p95-newbox>small{display:block;font-weight:800;color:var(--accent);font-size:13px}.p95-newbox>b{display:block;font-size:16px;margin:2px 0 2px;color:var(--ink)}'+
'.p95-more{font-size:14px;color:var(--muted);margin:8px 2px 10px;line-height:1.6}.p95-more b{color:var(--ink)}'+
'.p95-lead{font-size:14px;color:var(--muted);margin:6px 0 4px;line-height:1.6}'+
'.p95-goon{margin:14px 0 4px}'+
'.p95-line{display:flex;align-items:center;gap:8px;width:100%;text-align:left;border:1.5px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:10px 12px;margin:8px 0 2px;font:inherit;cursor:pointer;min-height:48px}'+
'.p95-line span{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p95-line small{font-size:12.5px;color:var(--muted);line-height:1.4}.p95-line b{font-size:14.5px;line-height:1.4}.p95-line i{font-style:normal;color:var(--muted);font-size:20px}';
document.head.appendChild(st);}catch(_){}})();
})();
