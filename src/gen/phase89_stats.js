/* ===== Phase89：記録の画面を整理（2026-11-28 Yuta が案を選択） =====
   上から：数字3つ（今日の勉強／覚えた単語／連続日数）→ 直近14日の勉強時間グラフ
           → AIコーチ（週次レポート・学習の実績・試験の計画・弱点と講義・100日コースなどのボタンを1つの一覧に）
           → レベル（A1/A2/B1 の細い棒）→ くわしい記録（押すと下からシートで開く）。
   しくみ：今までの記録の画面の HTML を作ったあと、「見出し（.p60-h）＋その下の部品」をひとまとまりとして切り分け、
           くわしい記録の一覧に並べる。後から別の機能が見出しつきの部品を足しても、自動でこの一覧に入る（消えない）。
           AIコーチのボタン（.p85c-links の中のボタン、.p85c-weakb）は取り出して上の一覧へ。 */
var P89_SEC=[];
function p89Ic(k,s){return (typeof p81Ic==="function")?p81Ic(k,s||20):"";}
function p89Coach(){return typeof p85DaySecs==="function"&&typeof P47_LANG!=="undefined"&&P47_LANG==="ru";}
/* 見出しごとのアイコン */
function p89SecIc(t){
  if(/勉強時間/.test(t))return "sun";if(/バッジ/.test(t))return "star";if(/1問/.test(t))return "cards";
  if(/レベル/.test(t))return "flag";if(/周回/.test(t))return "loop";if(/復習|学習した日|この7日|日ごと/.test(t))return "grid";
  return "book";
}
function p89Build(h){
  var box=document.createElement("div");box.innerHTML=h;
  var root=box;while(root.children.length===1&&!root.querySelector(":scope>.p60-h"))root=root.children[0];
  var kids=[].slice.call(root.children);if(!kids.length)return h;
  /* AIコーチのボタンを取り出す */
  var coach=[];
  kids.forEach(function(c){
    var bs=c.matches(".p85c-links")?[].slice.call(c.querySelectorAll("[data-act]")):(c.matches(".p85c-weakb")?[c]:[]);
    bs.forEach(function(b){var t=(b.querySelector("b")||b).textContent.trim(),s=b.querySelector("small");coach.push({act:b.getAttribute("data-act"),val:b.getAttribute("data-val"),t:t,s:s?s.textContent.trim():""});});
  });
  /* 見出しごとに切り分ける */
  var secs=[],cur=null;
  kids.forEach(function(c){
    if(c.matches(".p48-title,.p60-sum,.p85c-links,.p85c-weakb"))return;
    if(c.matches(".p60-h")){var sm=c.querySelector("small");var t=c.cloneNode(true);if(t.querySelector("small"))t.querySelector("small").remove();
      cur={t:t.textContent.trim(),s:sm?sm.textContent.trim():"",html:""};secs.push(cur);return;}
    if(!cur){cur={t:"そのほか",s:"",html:""};secs.push(cur);}
    cur.html+=c.outerHTML;
  });
  /* 同じ種類の見出しをまとめる（グラフ・カレンダーは1つに） */
  var merged=[],byKey={};
  secs.forEach(function(x){var k=/復習の予定|この7日間|学習した日|日ごとの記録/.test(x.t)?"cal":x.t;
    if(byKey[k]){byKey[k].html+='<div class="p60-h">'+esc(x.t)+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</div>'+x.html;return;}
    var y={t:k==="cal"?"復習の予定・学習した日":x.t,s:x.s,html:(k==="cal"?'<div class="p60-h">'+esc(x.t)+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</div>':'')+x.html,ic:p89SecIc(x.t)};
    byKey[k]=y;merged.push(y);});
  P89_SEC=merged;
  /* 上の数字 */
  var streak=0,known=0;try{streak=appHist.streak.count||0;}catch(_){}try{known=p47KnownCount();}catch(_){}
  var first;
  if(p89Coach()){var D=p85DaySecs(1);first='<div><small>今日の勉強</small><b>'+p85Mins(D[0].s)+'<i>分</i></b></div>';}
  else{var d=0;try{d=p47DoneToday();}catch(_){}first='<div><small>今日の問題</small><b>'+d+'<i>問</i></b></div>';}
  var out='<div class="p89"><div class="p48-title">記録</div><div class="p89-n3">'+first+'<div><small>覚えた単語</small><b>'+known.toLocaleString()+'<i>語</i></b></div><div><small>連続</small><b>'+streak+'<i>日</i></b></div></div>';
  /* 14日の勉強時間（ロシア語版）。押すと勉強時間のくわしい画面 */
  if(p89Coach()){try{var D14=p85DaySecs(14),w=0;D14.slice(7).forEach(function(x){w+=x.s;});
    out+='<button type="button" class="p89-chart" data-act="p89sec" data-val="'+p89Find(/勉強時間/)+'"><span class="p89-ch"><span>直近14日の勉強時間</span><span>この7日 '+p85HM(w)+' ›</span></span>'+p85TimeChart(D14,p85Set().min)+'</button>';}catch(_){}}
  /* AIコーチ */
  if(coach.length){
    var cic={p85weak:"book",p85course:"flag"};
    out+='<div class="p81-h p89-h">AIコーチ</div><div class="p81-box">'+coach.map(function(c){
      return '<button type="button" class="p81-row" data-act="'+esc(c.act)+'"'+(c.val!=null?' data-val="'+esc(c.val)+'"':'')+'><span class="p81-ric">'+p89Ic(cic[c.act]||"grid")+'</span><span class="p81-rtx"><b>'+esc(c.t)+'</b>'+(c.s?'<small>'+esc(c.s)+'</small>':'')+'</span><span class="p81-rgo">'+p89Ic("go",16)+'</span></button>';}).join("")+'</div>';
  }
  /* レベル */
  try{var L=p56LevelState(),li=p89Find(/レベル/);
    out+='<div class="p81-h p89-h">レベル</div><div class="p81-box">'+P_LVLS.map(function(l){var x=L[l];
      return '<div class="p89-lv"><b>'+l+'</b><span class="p89-tr"><i style="width:'+x.pct+'%"></i></span><span class="p89-lvn">'+(x.passed?'合格 ・ ':'')+x.k.toLocaleString()+' / '+x.n.toLocaleString()+'語</span></div>';}).join("")+
      (li>=0?'<button type="button" class="p81-row p89-more" data-act="p89sec" data-val="'+li+'"><span class="p81-rtx"><b>到達テストとレベルのくわしい内容</b></span><span class="p81-rgo">'+p89Ic("go",16)+'</span></button>':'')+'</div>';}catch(_){}
  /* くわしい記録 */
  var rows=merged.map(function(x,i){if(/レベル/.test(x.t))return "";
    return '<button type="button" class="p81-row" data-act="p89sec" data-val="'+i+'"><span class="p81-ric">'+p89Ic(x.ic)+'</span><span class="p81-rtx"><b>'+esc(x.t)+'</b>'+(x.s?'<small>'+esc(x.s)+'</small>':'')+'</span><span class="p81-rgo">'+p89Ic("go",16)+'</span></button>';}).join("");
  if(rows)out+='<div class="p81-h p89-h">くわしい記録</div><div class="p81-box">'+rows+'</div>';
  return out+'</div>';
}
function p89Find(re){for(var i=0;i<P89_SEC.length;i++)if(re.test(P89_SEC[i].t))return i;return -1;}
if(typeof renderP48Stats==="function"){
  var _p89Stats=renderP48Stats;
  renderP48Stats=function(){
    var h=String(_p89Stats.apply(this,arguments));
    try{return p89Build(h);}catch(e){return h;}
  };
}
/* くわしい記録のシート */
function p89Sheet(){var m=document.getElementById("p89sheet");if(!m){m=document.createElement("div");m.id="p89sheet";document.body.appendChild(m);}return m;}
function p89Open(i){
  var x=P89_SEC[i];if(!x)return;var m=p89Sheet();
  m.innerHTML='<div class="p81-mask" data-act="p89close"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="'+esc(x.t)+'"><div class="p81-ph"><b>'+esc(x.t)+'</b><button type="button" class="p81-x" data-act="p89close" aria-label="閉じる">'+p89Ic("x",18)+'</button></div><div class="p81-pb p89-pb p60-st">'+x.html+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");
}
function p89Close(){var m=p89Sheet();m.className="";m.innerHTML="";document.body.classList.remove("p81-open");}
/* シートの中のボタン（バッジ・受ける・冒険を見る など）：先にシートを閉じてから元の処理へ */
window.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("#p89sheet [data-act]");if(!el)return;
  var a=el.getAttribute("data-act");if(a==="p89close"||a==="p77tip")return;
  p89Close();
},true);
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(a==="p89sec"){e.stopImmediatePropagation();e.preventDefault();p89Open(+el.getAttribute("data-val"));return;}
  if(a==="p89close"){e.stopImmediatePropagation();e.preventDefault();p89Close();return;}
},true);

(function(){
  var st=document.createElement("style");
  st.textContent=
  '.p89 .p48-title{margin-bottom:12px}'+
  '.p89-n3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.p89-n3>div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px}'+
  '.p89-n3 small{display:block;font-size:12px;color:var(--muted);font-weight:700}.p89-n3 b{font-size:24px;font-weight:800;color:var(--ink)}.p89-n3 b i{font-style:normal;font-size:13px;color:var(--muted);margin-left:2px;font-weight:700}'+
  '.p89-n3>div:first-child b{color:var(--accent)}'+
  '.p89-chart{display:block;width:100%;margin-top:10px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 12px 6px;color:var(--ink);font:inherit;text-align:left;cursor:pointer}'+
  '.p89-ch{display:flex;justify-content:space-between;gap:8px;font-size:12.5px;font-weight:700;color:var(--muted);margin:0 2px 4px}.p89-chart svg{display:block;width:100%;height:auto}'+
  '.p89-h{margin:18px 4px 7px!important}'+
  '.p89-lv{display:flex;align-items:center;gap:10px;padding:0 14px;min-height:46px;border-top:1px solid var(--line)}.p89-lv:first-child{border-top:0}.p89-lv b{width:28px;font-size:14px}'+
  '.p89-tr{flex:1;height:6px;border-radius:3px;background:var(--line);overflow:hidden}.p89-tr i{display:block;height:100%;background:var(--accent);border-radius:3px}.p89-lvn{font-size:12.5px;color:var(--muted);min-width:84px;text-align:right}'+
  '.p89-more{border-top:1px solid var(--line)!important;min-height:46px}.p89-more b{font-size:13.5px!important;color:var(--accent);font-weight:600}'+
  '#p89sheet{display:none}#p89sheet.show{display:block;position:fixed;inset:0;z-index:210}';
  document.head.appendChild(st);
})();
