/* ===== phase84：ストーリーの進み具合をスタンプで見せる（2026-11-26 の要望） =====
   冒険の「地図」で、各章の「3 / 5」のような数字の代わりに、テーマの数だけ空の丸を並べ、
   テーマを終えるたびにユルタ（ボズ・ウイ）のスタンプが押される。
   - 絵はオリジナルの SVG（線だけのはんこ風）。表情（にっこり・うれしい目・ウインク・けむり）は4種類を順番に使う。
   - インクの色は難易度ごと（1周目＝赤、2周目以降は難易度が上がるたびに色が変わる）。
   - 新しく押されたスタンプだけ、ポンと押す動き。前に見た数は localStorage に覚える
     （消えても動きが出るだけで、記録には影響しない）。 */

var P84_INK=["#D9483B","#3A7EE0","#2A9A5A","#9358D6","#CC8C00"];/* 難易度1〜5のインクの色 */

/* ユルタ（キルギス語でボズ・ウイ）の絵。はんこ風の線画。
   特徴：丸いフェルトの壁、ゆるいドームの屋根、てっぺんの天窓トゥンドゥク（十字に交差した木の輪）、
   壁を巻く模様の帯、木の扉。ゆるい感じを出すため、壁に小さな顔をつける。
   v＝表情 0:にっこり 1:うれしい目 2:ウインク 3:けむりがぽっ（天窓から煙） */
function p84Face(v){
  var C='currentColor',L='stroke="'+C+'" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" fill="none"';
  var s='<circle cx="20" cy="20" r="18.4" fill="none" stroke="'+C+'" stroke-width="2"/>';
  /* 屋根（ドーム）と壁。屋根はうすく塗る */
  s+='<path d="M7.6 21.4 Q9.6 13.2 17.4 11.2 L22.6 11.2 Q30.4 13.2 32.4 21.4 Z" fill="'+C+'" opacity=".22"/>'+
     '<path d="M7.6 21.4 Q9.6 13.2 17.4 11.2 L22.6 11.2 Q30.4 13.2 32.4 21.4" '+L+'/>'+
     '<path d="M9 21.4 Q8.2 26.4 9.6 30.4 Q20 32.4 30.4 30.4 Q31.8 26.4 31 21.4" '+L+'/><path d="M7.6 21.4 L32.4 21.4" '+L+'/>';
  /* 屋根の上をわたるフェルトの帯（2本） */
  s+='<path d="M15.6 11.6 Q12.6 15.6 12.4 21.4" stroke="'+C+'" stroke-width="1.1" fill="none" opacity=".7"/><path d="M24.4 11.6 Q27.4 15.6 27.6 21.4" stroke="'+C+'" stroke-width="1.1" fill="none" opacity=".7"/>';
  /* 天窓トゥンドゥク（キルギスの国旗にもある、十字に交差した輪） */
  s+='<path d="M17 11.2 Q20 8.2 23 11.2" '+L+'/><path d="M18.4 10.3 L21.6 10.3 M20 8.9 L20 11.2" stroke="'+C+'" stroke-width="1" fill="none"/>';
  /* 壁を巻く模様の帯（小さなひし形） */
  s+='<path d="M9 23.6 L31 23.6" stroke="'+C+'" stroke-width="1" fill="none" opacity=".75"/>'+
     '<path d="M10.6 23.6 l1 -1 l1 1 l-1 1z M27.4 23.6 l1 -1 l1 1 l-1 1z" fill="'+C+'" opacity=".8"/>';
  /* 木の扉 */
  s+='<path d="M17.6 31 L17.6 25.6 Q20 24.6 22.4 25.6 L22.4 31" '+L+'/><path d="M17.6 31 L17.6 25.6 Q20 24.6 22.4 25.6 L22.4 31 Z" fill="'+C+'" opacity=".3"/>';
  /* 顔（扉の左右の壁に目、ほっぺ） */
  var E='stroke="'+C+'" stroke-width="1.4" stroke-linecap="round" fill="none"';
  if(v===1)s+='<path d="M12.6 27.4 Q13.8 26 15 27.4" '+E+'/><path d="M25 27.4 Q26.2 26 27.4 27.4" '+E+'/>';
  else if(v===2)s+='<circle cx="13.6" cy="26.8" r="1.5" fill="'+C+'"/><path d="M25 27.1 L27.4 27.1" '+E+'/>';
  else s+='<circle cx="13.6" cy="26.8" r="1.5" fill="'+C+'"/><circle cx="26.4" cy="26.8" r="1.5" fill="'+C+'"/>';
  s+='<ellipse cx="11.6" cy="29.2" rx="1.3" ry=".8" fill="'+C+'" opacity=".35"/><ellipse cx="28.4" cy="29.2" rx="1.3" ry=".8" fill="'+C+'" opacity=".35"/>';
  /* けむり */
  if(v===3)s+='<path d="M21 7.6 Q19.4 6.4 21 5.2 Q22.6 4.2 21.4 3.2" stroke="'+C+'" stroke-width="1.2" stroke-linecap="round" fill="none" opacity=".75"/>';
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
