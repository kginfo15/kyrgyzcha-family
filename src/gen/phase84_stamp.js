/* ===== phase84：ストーリーの進み具合をスタンプで見せる（2026-11-26 の要望） =====
   冒険の「地図」で、各章の「3 / 5」のような数字の代わりに、テーマの数だけ空の丸を並べ、
   テーマを終えるたびに「ぼうず頭の子」のスタンプが押される。
   - 絵はオリジナルの SVG（線だけのはんこ風）。表情は4種類を順番に使う。
   - インクの色は難易度ごと（1周目＝赤、2周目以降は難易度が上がるたびに色が変わる）。
   - 新しく押されたスタンプだけ、ポンと押す動き。前に見た数は localStorage に覚える
     （消えても動きが出るだけで、記録には影響しない）。 */

var P84_INK=["#D9483B","#3A7EE0","#2A9A5A","#9358D6","#CC8C00"];/* 難易度1〜5のインクの色 */

/* ぼうず頭の子の顔（v＝表情 0:にっこり 1:うれしい目 2:ウインク 3:わーい） */
function p84Face(v){
  var s='<circle cx="20" cy="20" r="18.4" fill="none" stroke="currentColor" stroke-width="2"/>';
  /* 耳・ぼうず頭の短い髪（うすい色）・頭の線・てっぺんのひと房 */
  s+='<circle cx="8.6" cy="22.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="31.4" cy="22.6" r="2.4" fill="none" stroke="currentColor" stroke-width="1.6"/>'+
     '<path d="M9.7 19.4 A10.9 10.9 0 0 1 30.3 19.4 Q20 15.4 9.7 19.4Z" fill="currentColor" opacity=".3"/>'+
     '<circle cx="20" cy="22" r="11" fill="none" stroke="currentColor" stroke-width="1.8"/>'+
     '<path d="M20 11 Q19 8 21.8 7.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>';
  /* ほっぺ */
  s+='<ellipse cx="13.2" cy="25.8" rx="2" ry="1.3" fill="currentColor" opacity=".35"/><ellipse cx="26.8" cy="25.8" rx="2" ry="1.3" fill="currentColor" opacity=".35"/>';
  var L='stroke="currentColor" stroke-width="1.7" stroke-linecap="round" fill="none"';
  if(v===1)s+='<path d="M14.2 22.6 Q15.9 20.6 17.6 22.6" '+L+'/><path d="M22.4 22.6 Q24.1 20.6 25.8 22.6" '+L+'/><path d="M17.2 26 Q20 28.8 22.8 26" '+L+'/>';
  else if(v===2)s+='<circle cx="16" cy="22.2" r="1.5" fill="currentColor"/><path d="M22.4 22.4 L25.8 22.4" '+L+'/><path d="M17.4 26.2 Q20 28.4 22.6 26.2" '+L+'/>';
  else if(v===3)s+='<circle cx="16" cy="22" r="1.5" fill="currentColor"/><circle cx="24" cy="22" r="1.5" fill="currentColor"/><path d="M17.2 25.4 Q20 24.8 22.8 25.4 Q20 29.6 17.2 25.4Z" fill="currentColor"/>';
  else s+='<circle cx="16" cy="22.2" r="1.5" fill="currentColor"/><circle cx="24" cy="22.2" r="1.5" fill="currentColor"/><path d="M17.2 26 Q20 28.6 22.8 26" '+L+'/>';
  return s;
}
/* スタンプ1つ。on＝押された、i＝何番目か（表情と傾きを変える）、pop＝押す動きをつける */
function p84Stamp(on,i,ink,pop){
  if(!on)return '<span class="p84-s off" aria-hidden="true"></span>';
  var rot=((i*47)%17)-8;/* 少しずつ傾けて、手で押した感じに */
  return '<span class="p84-s on'+(pop?' pop':'')+'" style="--ink:'+ink+';--r:'+rot+'deg" aria-hidden="true"><svg viewBox="0 0 40 40">'+p84Face(i%4)+'</svg></span>';
}
function p84Ink(){var l=1;try{l=p75Lv();}catch(_){}return P84_INK[Math.max(0,Math.min(4,(l||1)-1))];}

/* 前に見たときのスタンプの数（新しく押されたものだけ動かすため） */
function p84SeenKey(){var s={};try{s=p74S();}catch(_){}var l=1;try{l=p75Lv();}catch(_){}return (s.path||"")+"@"+l;}
function p84Seen(){try{return JSON.parse(localStorage.getItem(K.set+"_p84")||"{}")||{};}catch(_){return {};}}
function p84SaveSeen(o){try{localStorage.setItem(K.set+"_p84",JSON.stringify(o));}catch(_){}}

/* 章をクリアしたときの印（題名の横） */
function p84Clear(ch){return ch.beat?'<em class="p84-clr" style="--ink:'+p84Ink()+'">クリア</em>':'';}
/* 章の見出しに並べるスタンプの列 */
function p84Row(ch){
  var ink=p84Ink(),key=p84SeenKey()+"#"+ch.c,seen=p84Seen(),n=ch.themes.length,dn=0,h='';
  ch.themes.forEach(function(x){if(x.done)dn++;});
  var before=typeof seen[key]==="number"?seen[key]:dn;/* 初めて見る章は動かさない */
  var k=0;
  ch.themes.forEach(function(x,j){if(x.done){h+=p84Stamp(true,j,ink,k>=before);k++;}else h+=p84Stamp(false,j,ink,false);});
  if(seen[key]!==dn){seen[key]=dn;p84SaveSeen(seen);}
  return '<span class="p84-row" role="img" aria-label="'+n+'テーマ中 '+dn+' クリア">'+h+'</span>';
}

(function(){try{var st=document.createElement("style");st.textContent=
/* 見出し：1行目に「第N章 題名」、2行目にスタンプ */
'.p83-chh .p84-tt{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px;font-size:inherit;color:inherit;font-weight:inherit}'+
'.p83-chh .p84-tl{display:flex;align-items:center;gap:8px;min-width:0;flex:none;font-size:inherit;color:var(--ink);font-weight:inherit}.p84-tl small{flex:none}.p84-tl b{min-width:0;flex:0 1 auto!important}'+
'.p83-chh .p84-row{display:flex;flex-wrap:nowrap;align-items:center;gap:4px;flex:none;max-width:100%}'+
'/* 話数が多い章（10など）でも1行に収まるよう、丸は幅に合わせて小さくなる（最小16px） */.p84-s{display:inline-block;width:26px;height:26px;border-radius:50%;flex:none}.p84-row .p84-s{flex:0 1 26px;width:auto;height:auto;aspect-ratio:1/1;min-width:16px}'+
'.p84-s.off{border:1.8px dashed color-mix(in srgb,var(--muted) 60%,transparent);box-sizing:border-box}'+
'.p84-s.on{color:var(--ink);background:color-mix(in srgb,var(--ink) 10%,transparent);transform:rotate(var(--r));opacity:.95}'+
'.p84-s svg{display:block;width:100%;height:100%}'+
/* 押す動き（大きく上から→ぎゅっ→もどる） */
'.p84-s.pop{animation:p84pop .55s cubic-bezier(.3,1.4,.5,1) both;animation-delay:.25s}'+
'@keyframes p84pop{0%{transform:rotate(var(--r)) scale(2.1);opacity:0}55%{transform:rotate(var(--r)) scale(.86);opacity:1}100%{transform:rotate(var(--r)) scale(1);opacity:.95}}'+
'@media (prefers-reduced-motion:reduce){.p84-s.pop{animation:none}}'+
'.p84-clr{flex:none;font-style:normal;font-size:12px;font-weight:800;color:var(--ink);border:1.5px solid var(--ink);border-radius:6px;padding:0 6px;line-height:20px;transform:rotate(-4deg)}'+
/* 章の中のテーマの行：緑の✓の代わりに同じスタンプ */
'.p83-dot.p84d{border:0;width:28px;height:28px}.p83-row.d .p83-dot.p84d{background:transparent}.p83-dot.p84d .p84-s{width:28px;height:28px}'+
'.p83-row.d{opacity:1}.p83-row.d .p83-rtx{opacity:.75}';
document.head.appendChild(st);}catch(_){}})();
