/* ===== PHASE49: 色の統一・評価ボタン・チャレンジモード選択・イラスト追加・読み上げ速度 ===== */
P48_ART.headphones='<path d="M8 28v-4a16 16 0 0132 0v4" stroke="'+P48_A+'" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="5" y="26" width="10" height="16" rx="4" fill="'+P48_G+'"/><rect x="33" y="26" width="10" height="16" rx="4" fill="'+P48_G+'"/><path d="M20 33l3 3 6-7" stroke="'+P48_C+'" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".0"/>';
P48_ART.mic='<rect x="17" y="4" width="14" height="24" rx="7" fill="'+P48_A+'"/><path d="M11 22a13 13 0 0026 0" stroke="'+P48_G+'" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M24 35v7M17 43h14" stroke="'+P48_G+'" stroke-width="3.4" stroke-linecap="round"/><path d="M21 11h6M21 16h6" stroke="'+P48_C+'" stroke-width="2" stroke-linecap="round" opacity=".7"/>';
P48_ART.search='<circle cx="21" cy="21" r="13" fill="'+P48_C+'" stroke="'+P48_A+'" stroke-width="4"/><path d="M31 31l10 10" stroke="'+P48_G+'" stroke-width="6" stroke-linecap="round"/><path d="M15 18a7 7 0 016-5" stroke="'+P48_A+'" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".6"/>';
P48_ART.trophy='<path d="M14 6h20v10a10 10 0 01-20 0z" fill="'+P48_G+'"/><path d="M14 9H7v3a7 7 0 007 7M34 9h7v3a7 7 0 01-7 7" stroke="'+P48_G+'" stroke-width="3" fill="none"/><rect x="21" y="25" width="6" height="8" fill="'+P48_D+'"/><rect x="13" y="33" width="22" height="8" rx="2" fill="'+P48_A+'"/><path d="M24 10l1.6 3.3 3.6.5-2.6 2.5.6 3.6-3.2-1.7-3.2 1.7.6-3.6-2.6-2.5 3.6-.5z" fill="#fff"/>';
P48_ART.sun='<g stroke="'+P48_G+'" stroke-width="3" stroke-linecap="round"><path d="M24 3v6M24 39v6M3 24h6M39 24h6M9 9l4 4M35 35l4 4M39 9l-4 4M13 35l-4 4"/></g><circle cx="24" cy="24" r="11" fill="'+P48_G+'"/><g stroke="'+P48_A+'" stroke-width="2" fill="none"><circle cx="24" cy="24" r="5.5"/><path d="M18.5 22h11M18.5 26h11M22 18.5v11M26 18.5v11"/></g>';
/* 1) モードごとの色替え（紫・緑）をやめ、アクセント1色に固定 */
var _p49Render=render;
render=function(){var r=_p49Render.apply(this,arguments);try{document.body.classList.remove("p21-challenge","p23-compose");}catch(_){}return r;};
/* 2) 評価ボタン：アイコン付き・デザインに合わせた配色 */
var P49_GI={no:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  maybe:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M4 13c2.5-3 5-3 8 0s5.5 3 8 0"/></svg>',
  ok:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>'};
function p49GradeIcons(html){
  return String(html).replace(/(<button type="button" class="ans3btn a-(no|mb|ok)"[^>]*>)/g,function(m,open,k){return open+'<span class="p49-gi">'+P49_GI[k==="mb"?"maybe":k]+'</span>';});
}
var _p49Study=renderStudy;renderStudy=function(){return p49GradeIcons(_p49Study.apply(this,arguments));};
var _p49CStudy=renderComposeStudy;renderComposeStudy=function(){
  return p49GradeIcons(String(_p49CStudy.apply(this,arguments)).replace(/(data-val="no">)できない(<\/button>)/g,"$1言えない$2").replace(/(data-val="maybe">)微妙(<\/button>)/g,"$1あやしい$2").replace(/(data-val="ok">)できた！?(<\/button>)/g,"$1言えた$2"));};
/* 3) チャレンジモード（まとめて練習）の選択画面 */
p36RenderScopePick=function(){
  var ART={word:"cards",phrase:"chat",all:"grid"};
  var h='<div class="p49-pick"><div class="p49-pickhead"><div class="p49-pickart">'+p47L().hero+'</div><div class="p49-pickbadge">'+p48Art("loop",44)+'</div></div>';
  h+='<div class="p49-pickbody"><h2>まとめて練習</h2><p>全部の単語を順番に見ていく周回モードです。単語とフレーズは思い出し方が違うので、回す範囲を選んでください。</p>';
  P36SCOPES.forEach(function(sp){
    var key=sp[0],ids=p36ScopeIds(key),st=p36SavedState(key),lap=p35Lap(key),done=p35LapDone(key);
    var mid=(st&&st.list&&st.list.length&&st.pos<st.list.length-1);
    var pct=mid?Math.round((st.pos+1)/st.list.length*100):0;
    var stat=mid?(lap+'周目 ・ '+(st.pos+1)+' / '+st.list.length):(done>0?('通算 '+done+'周 ・ 次は'+lap+'周目'):'まだ始めていません');
    h+='<button type="button" class="p49-scope'+(p36Scope()===key?' on':'')+'" data-act="chalscope" data-val="'+key+'">'+
      '<span class="p49-scopeic p48-ill">'+p48Art(ART[key]||"grid",32)+'</span>'+
      '<span class="p49-scopetxt"><span class="p49-scopetop"><b>'+esc(sp[1])+'</b><em>'+ids.length.toLocaleString()+'語</em></span>'+
      '<small>'+esc(sp[2])+'</small><span class="p49-scopebar"><i style="width:'+pct+'%"></i></span><span class="p49-scopestat">'+(mid?'<b>続きから</b> ・ ':'')+esc(stat)+'</span></span>'+
      p47Icon("chev",18)+'</button>';
  });
  h+='<button type="button" class="p49-ghost" data-act="chalback">ホームに戻る</button></div></div>';
  return h;
};
/* 4) その他の練習の一覧アイコンもイラストに */
var P49_HUB={word:"cards",search:"search",weak:"heart",read:"book",compose:"chat",scenario:"city",aloud:"mic",grammar:"link",listening:"headphones",drill:"loop",aichat:"smile",qadrill:"bolt",dialog:"people",gnote:"book",a2check:"trophy",reinforce:"loop"};
hubIcon=function(key){return '<span class="p49-hubic p48-ill">'+p48Art(P49_HUB[key]||"grid",30)+'</span>';};
/* 5) 完了画面にイラスト */
var _p49Fin=p21RenderFinish;
p21RenderFinish=function(){return String(_p49Fin.apply(this,arguments)).replace('<div class="p21-fincard">','<div class="p21-fincard"><div class="p49-finart p48-ill">'+p48Art("trophy",48)+'</div>');};
/* 6) 読み上げ速度：設定の速さを基準に「ゆっくり」はその0.75倍。iOSで速さが反映されない問題に対処 */
function p49SlowRate(){return Math.max(0.5,Math.round((settings.ruRate||0.9)*0.75*100)/100);}
var _p49Spk=spkRow;spkRow=function(t){return String(_p49Spk.apply(this,arguments)).replace("遅く再生<br>0.7x","ゆっくり<br>"+p49SlowRate()+"x");};
speak=function(text,rate){
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){toast("この端末では読み上げを使えません");return;}
  try{
    var u=p48Utter(text,rate),ss=window.speechSynthesis;
    if(ss.speaking||ss.pending){ss.cancel();setTimeout(function(){ss.speak(u);},80);}else ss.speak(u);
  }catch(e){toast("読み上げに失敗しました");}
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  if(el.getAttribute("data-act")==="sayslow"){e.stopImmediatePropagation();e.preventDefault();speak(el.getAttribute("data-say"),p49SlowRate());}
},true);
var _p49Settings=renderSettings;
renderSettings=function(embed){
  var rate=settings.ruRate||0.9;
  return String(_p49Settings(embed)).replace(/<div class="p47-seg" style="grid-template-columns:repeat\(4,1fr\)">[\s\S]*?<\/div>/,
    '<div class="p47-seg" style="grid-template-columns:repeat(4,1fr)">'+[[0.7,"ゆっくり"],[0.8,"やや遅め"],[0.9,"ふつう"],[1.0,"速め"]].map(function(o){return '<button type="button" data-act="p48rate" data-val="'+o[0]+'" class="'+(Math.abs(rate-o[0])<0.02?"on":"")+'">'+o[1]+'<br><small style="opacity:.7;font-weight:600">'+o[0]+'x</small></button>';}).join("")+'</div>');
};
/* ---- 見た目 ---- */
(function(){
  var css=
  /* ヘッダーの国旗 */
  '.p49-flagsvg{display:block;flex:0 0 auto;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,.35)}'+
  /* 評価ボタン */
  '.ans3btn.a-no,.ans3btn.a-mb,.ans3btn.a-ok,.p12-stickybar .ans3btn.a-no,.p12-stickybar .ans3btn.a-mb,.p12-stickybar .ans3btn.a-ok{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;border-radius:16px!important;font-weight:800;min-height:62px}'+
  '.ans3btn.a-no,.p12-stickybar .ans3btn.a-no{background:var(--card2)!important;color:#FF8A80!important;border:1px solid var(--lineStrong)!important}'+
  '.ans3btn.a-mb,.p12-stickybar .ans3btn.a-mb{background:var(--card2)!important;color:#FFCC66!important;border:1px solid var(--lineStrong)!important}'+
  '.ans3btn.a-ok,.p12-stickybar .ans3btn.a-ok{background:var(--accent)!important;color:#fff!important;border:1px solid var(--accent)!important;box-shadow:0 6px 18px var(--accentSoft)}'+
  '.p49-gi{display:flex;width:28px;height:28px;border-radius:50%;align-items:center;justify-content:center;background:rgba(255,255,255,.08)}.a-ok .p49-gi{background:rgba(255,255,255,.22)}'+
  '.p12-stickybar{background:color-mix(in srgb,var(--bg) 88%,transparent)!important;backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-color:var(--line)!important}'+
  /* まとめて練習の選択画面 */
  '.p49-pick{margin:-4px -2px 0;padding-bottom:24px}.p49-pickhead{position:relative;height:150px;border-radius:24px;overflow:hidden}'+
  '.p49-pickart,.p49-pickart svg{position:absolute;inset:0;width:100%;height:100%}.p49-pickhead:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,0) 40%,var(--bg))}'+
  '.p49-pickbadge{position:absolute;left:50%;bottom:-6px;transform:translateX(-50%);z-index:1;width:76px;height:76px;border-radius:24px;background:var(--card);border:1px solid var(--line);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(0,0,0,.45)}'+
  '.p49-pickbody{padding:18px 2px 0;text-align:center}.p49-pickbody h2{font-size:24px;margin:6px 0 6px;letter-spacing:-.02em}.p49-pickbody>p{color:var(--muted);font-size:13.5px;line-height:1.75;margin:0 8px 16px}'+
  '.p49-scope{width:100%;display:flex;align-items:center;gap:12px;padding:14px;margin-bottom:10px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:var(--ink);text-align:left;cursor:pointer}'+
  '.p49-scope.on{border-color:var(--accent);box-shadow:0 0 0 3px var(--accentSoft)}.p49-scope>svg{color:var(--mutedSoft);flex:0 0 auto}'+
  '.p49-scopeic{width:52px;height:52px;border-radius:16px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}'+
  '.p49-scopetxt{flex:1;min-width:0}.p49-scopetop{display:flex;justify-content:space-between;align-items:baseline;gap:8px}.p49-scopetop b{font-size:16px}'+
  '.p49-scopetop em{font-style:normal;font-size:12px;font-weight:800;color:var(--accent);background:var(--accentSoft);padding:2px 8px;border-radius:99px}'+
  '.p49-scopetxt small{display:block;font-size:12px;color:var(--muted);margin-top:3px}.p49-scopebar{display:block;height:5px;border-radius:9px;background:var(--card2);margin-top:9px;overflow:hidden}'+
  '.p49-scopebar i{display:block;height:100%;background:linear-gradient(90deg,var(--accent),var(--sub));border-radius:9px}.p49-scopestat{display:block;font-size:11.5px;color:var(--muted);margin-top:6px}.p49-scopestat b{color:var(--accent)}'+
  '.p49-ghost{width:100%;margin-top:6px;padding:14px;border-radius:16px;border:1px solid var(--line);background:none;color:var(--muted);font-weight:800;font-size:14px;cursor:pointer}'+
  /* その他の練習 */
  '.p49-hubic{width:46px;height:46px;border-radius:14px;display:flex;align-items:center;justify-content:center}'+
  '.hubcard{border-radius:20px!important;background:var(--card)!important;border:1px solid var(--line)!important}'+
  '.p49-finart{width:84px;height:84px;border-radius:26px;margin:0 auto 10px;display:flex;align-items:center;justify-content:center}'+
  /* 記録：イラスト入りゲージ */
  '.p49-scene{position:relative;overflow:hidden;padding-top:8px!important}.p49-sceneart{position:absolute;left:0;right:0;top:0;height:230px}.p49-sceneart svg{width:100%;height:100%;display:block}'+
  '.p49-sceneart:after{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 46%,rgba(0,0,0,.6) 0,rgba(0,0,0,.45) 32%,rgba(0,0,0,0) 62%),linear-gradient(180deg,rgba(0,0,0,.15) 0%,rgba(0,0,0,.3) 55%,var(--card) 100%)}'+
  '.p49-scene>*:not(.p49-sceneart){position:relative}.p49-scene .p48-gl,.p49-scene .p48-pct small{color:rgba(255,255,255,.8)}.p49-scene .p48-pct,.p49-scene .p48-gn{color:#fff;text-shadow:0 2px 12px rgba(0,0,0,.45)}'+
  /* 記録：スタンプカード風カレンダー */
  '.p48-heat i{display:flex;align-items:center;justify-content:center;border-radius:9px}.p48-heat i svg{display:block}'+
  '.p48-heat i.s1 svg{width:46%;height:46%;opacity:.75}.p48-heat i.s2 svg{width:62%;height:62%;opacity:.9}.p48-heat i.s3 svg,.p48-heat i.s4 svg{width:80%;height:80%}'+
  '.p48-heat i.s1,.p48-heat i.s2,.p48-heat i.s3,.p48-heat i.s4{background:color-mix(in srgb,var(--accent) 16%,var(--card2))!important}'+
  '.p48-heat i.s4{box-shadow:inset 0 0 0 1.5px var(--sub)}'+'.p48-tile{background:linear-gradient(160deg,color-mix(in srgb,var(--accent) 20%,var(--card)) 0%,var(--card) 70%)!important}'+'.p49-cardill{background:radial-gradient(120% 80% at 100% 0%,color-mix(in srgb,var(--accent) 16%,transparent),transparent 60%),var(--card)!important}'+'.p49-chic{display:inline-flex;width:30px;height:30px;border-radius:10px;align-items:center;justify-content:center;margin-right:8px;vertical-align:middle}'+'.p48-ch b{display:flex;align-items:center}'+'.p48-bar i{background:linear-gradient(180deg,var(--sub),var(--accent))!important;opacity:.45;border-radius:8px 8px 3px 3px!important;max-width:28px!important}'+'.p48-bar.today i{opacity:1;box-shadow:0 0 16px var(--accentSoft)}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
