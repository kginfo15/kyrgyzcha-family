/* ===== PHASE51: 全画面のデザイン統一・ホームの歯車・詳細設定の整理 ===== */
/* ---- ホーム：今日のチャレンジに歯車（1日の問題数） ---- */
var P51_GEAR='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+P47_IC.gear+'</svg>';
var _p51Home=renderHome;
renderHome=function(){
  var h=String(_p51Home());
  h=h.replace('<button type="button" class="p47-hero"','<div class="p51-herowrap"><button type="button" class="p51-gear" data-act="p51daily" aria-label="1日のチャレンジ数を変える">'+P51_GEAR+'</button><button type="button" class="p47-hero"');
  h=h.replace('<button type="button" class="p47-card" data-act="p47words">','</div><button type="button" class="p47-card" data-act="p47words">');
  return h;
};
function p51ShowDaily(){
  var m=document.getElementById("p48modal");if(!m){m=document.createElement("div");m.id="p48modal";document.body.appendChild(m);}
  var t=p47Target();
  m.innerHTML='<div class="p48-mask" data-act="p51close"></div><div class="p48-dialog p51-sheet" role="dialog" aria-modal="true">'+
    '<div class="p48-dlgart">'+p48Art("bolt",40)+'</div><h3>1日のチャレンジ数</h3><p>ホームの「今日のチャレンジ」で、1日に解く問題の数です。</p>'+
    '<div class="p47-seg">'+[10,15,20,30,50].map(function(v){return '<button type="button" data-act="p51set" data-val="'+v+'" class="'+(t===v?"on":"")+'">'+v+'</button>';}).join("")+'</div>'+
    '<div class="p47-step"><button type="button" data-act="p51set" data-val="'+(t-5)+'">−5</button><span>'+t+' 問</span><button type="button" data-act="p51set" data-val="'+(t+5)+'">＋5</button></div>'+
    '<button type="button" class="p48-dlgbtn" style="margin-top:16px;background:var(--accent);border-color:var(--accent);color:#fff" data-act="p51close">決定</button></div>';
  m.className="show";
}
/* ---- その他の練習：画面ヘッダーをイラスト付きに統一 ---- */
var P51_TITLES={search:"単語検索",weak:"苦手単語",read:"例文を読む",compose:"瞬間作文",scenario:"生活シナリオ",aloud:"音読",grammar:"文法別練習",listening:"リスニング",drill:"反復スピーキング",aichat:"AI会話練習",qadrill:"瞬間応答",dialog:"ミニ会話",gnote:"文法ノート",a2check:"A2カバー状況",p47words:"単語練習",reviewqueue:"要確認データ",word:"単語"};
var _p51Sub=renderLearnSub;
renderLearnSub=function(){
  var h=String(_p51Sub.apply(this,arguments));
  var v=ui.view, title=P51_TITLES[v];
  if(v==="scenario"&&ui.scenarioDetail){var sc=SCENARIOS.filter(function(s){return s.key===ui.scenarioDetail;})[0];if(sc)title=sc.title;}
  h=h.replace(/<div class="subhead"><button type="button" data-act="([a-z]+)">‹<\/button><div class="ttl">([^<]*)<\/div><\/div>/,function(m,act,t){
    return '<div class="p51-head"><button type="button" class="p51-back" data-act="'+act+'" aria-label="戻る"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'+
      '<span class="p51-headic p48-ill">'+p48Art(P49_HUB[v]||(v==="p47words"?"cards":"grid"),26)+'</span><span class="p51-headt">'+esc(title||t)+'</span></div>';});
  return '<div class="p51-sub v-'+v+'">'+h+'</div>';
};
/* その他の練習の「単語」は新しい単語練習へ */
var _p51Hub=renderLearnHub;
renderLearnHub=function(){
  return String(_p51Hub.apply(this,arguments)).replace('<div class="hero"><div class="greet">学習</div><div class="sub">今日はどれから始めますか？</div></div>',
    '<div class="p51-hubhead"><div class="p48-title" style="margin-bottom:4px">その他の練習</div><div class="p51-hubsub">作文・リスニング・文法など、目的に合わせて練習できます</div></div>');
};
/* 生活シナリオのアイコンもイラストに */
var P51_SC={taxi:"bus",cafe:"food",market:"bag",bank:"case",hospital:"heart",school:"people",landlord:"home",delivery:"clock",work:"case",jica:"people"};
scenarioIcon=function(key){return p48Art(P51_SC[key]||"grid",28);};
/* ---- 練習のまとめ画面 ---- */
var _p51Sum=renderSessionSummary;
renderSessionSummary=function(){
  return String(_p51Sum.apply(this,arguments)).replace(/<div style="width:60px;height:60px;border-radius:50%;background:rgba\(16,185,129,\.14\)[^>]*>[\s\S]*?<\/svg><\/div>/,'<div class="p49-finart p48-ill" style="margin-bottom:0">'+p48Art("trophy",48)+'</div>').replace(/>微妙</g,">うろ覚え<").replace(/>できない</g,">覚えてない<").replace(/>できた</g,">覚えた<");
};
/* ---- 詳細設定：使うものだけ残す ---- */
var P51_KEEP={"学習設定":1,"表示設定":1,"リスニング設定":1,"データ管理":1};
var _p51Settings=renderSettings;
renderSettings=function(embed){
  var h=String(_p51Settings(embed));
  var m=/<details class="p47-adv"><summary>詳細設定<\/summary>([\s\S]*)<\/details>/.exec(h);
  if(!m)return h;
  var box=document.createElement("div");box.innerHTML=m[1];
  var DROP=/^(1日の新出単語目標|1日の復習目標|1日のリスニング目標|1回の標準問題数|.*語音声速度|日本語読み上げ速度)$/;
  Array.prototype.slice.call(box.querySelectorAll("*")).forEach(function(el){
    if(el.children.length===0&&DROP.test((el.textContent||"").trim())){var nx=el.nextElementSibling;if(nx&&(nx.classList.contains("seg")||nx.querySelector(".seg")))nx.remove();el.remove();}
  });
  var keep=false,out=[];
  Array.prototype.slice.call(box.children).forEach(function(el){
    if(el.classList.contains("h2")){keep=!!P51_KEEP[el.textContent.trim()];}
    if(keep)out.push(el.outerHTML);
  });
  var home='<div class="p47-set p51-a2hs"><div class="p50-row"><span class="p50-ic p48-ill">'+p48Art("home",30)+'</span><div class="p47-setrow"><b>アプリのようにホーム画面から開く</b>'+
    '<small><span class="p51-k">iPhone</span>：Safariでこのページを開き、共有ボタン →「ホーム画面に追加」。<br><span class="p51-k">Android</span>：Chromeのメニュー →「ホーム画面に追加」。<br>Claudeアプリからも開けます。記録はClaudeアカウントに保存されるので、どこから開いても同じです。</small></div></div></div>';
  return h.replace(m[0],home+'<details class="p47-adv"><summary>詳細設定</summary><div class="p51-adv">'+out.join("")+'</div></details>');
};
/* ---- 操作 ---- */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="openlearn"&&v==="word"){e.stopImmediatePropagation();e.preventDefault();clearTransientUI();ui.bnav="wordbook";ui.view="p47words";ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);return;}
  if(a!=="p51daily"&&a!=="p51set"&&a!=="p51close")return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p51daily"){p51ShowDaily();return;}
  if(a==="p51set"){settings.p47Daily=Math.max(5,Math.min(200,+v||20));saveAll();render();p51ShowDaily();return;}
  if(a==="p51close"){p48HideQuit();return;}
},true);
/* ---- 見た目（古い画面も同じ部品の見た目にそろえる） ---- */
(function(){
  var css=
  '.p51-herowrap{position:relative}.p51-gear{position:absolute;top:12px;right:12px;z-index:3;width:40px;height:40px;border-radius:14px;border:1px solid rgba(255,255,255,.28);background:rgba(0,0,0,.28);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px)}'+
  '.p51-sheet .p47-seg{margin-top:4px}'+
  '.p51-head{display:flex;align-items:center;gap:12px;margin:2px 0 16px}.p51-back{width:42px;height:42px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;flex:0 0 auto}'+
  '.p51-headic{width:42px;height:42px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}.p51-headt{font-size:22px;font-weight:800;letter-spacing:-.02em}'+
  '.p51-sub .hero .greet{display:none}.p51-sub .hero{margin:0 2px 12px!important;padding:0!important;background:none!important}.p51-sub .hero .sub{color:var(--muted);font-size:13px}'+
  '.p51-hubhead{margin:4px 2px 14px}.p51-hubsub{color:var(--muted);font-size:13px}'+
  /* 共通部品 */
  '#main .card{border-radius:20px;border:1px solid var(--line);background:var(--card)}'+
  '#main .seg{background:var(--card2)!important;border-radius:14px;padding:4px;gap:4px;border:1px solid var(--line)}'+
  '#main .seg button{border-radius:11px!important;border:none!important;background:transparent!important;color:var(--muted)!important;font-weight:700}'+
  '#main .seg button.on{background:var(--accent)!important;color:#fff!important;box-shadow:0 4px 12px var(--accentSoft)!important}'+
  '#main .btn{border-radius:14px}#main .btn.primary,#main .btn.full[style*="var(--teal)"]{background:var(--accent)!important;border-color:var(--accent)!important;color:#fff!important}'+
  '#main select{appearance:none;-webkit-appearance:none;width:100%;background:var(--card) url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2716%27 height=%2716%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%2398989F%27 stroke-width=%272.4%27 stroke-linecap=%27round%27%3E%3Cpath d=%27M6 9l6 6 6-6%27/%3E%3C/svg%3E") no-repeat right 14px center;border:1px solid var(--line);border-radius:14px;color:var(--ink);padding:13px 40px 13px 14px;font-size:14px;font-weight:700}'+
  '#main input[type=search],#main input[type=text]{background:var(--card);border:1px solid var(--line);border-radius:14px;color:var(--ink);padding:13px 14px;font-size:15px}'+
  '#main .row2{border-radius:18px!important;background:var(--card)!important;border:1px solid var(--line)!important}'+
  '#main .bar{background:var(--card2);border-radius:9px;overflow:hidden}#main .bar i{background:linear-gradient(90deg,var(--accent),var(--sub))!important;border-radius:9px}'+
  '#main .note{border-radius:14px}'+
  '#main .p21-fincard{border-radius:24px}'+
  '.p51-adv .h2{font-size:12px;font-weight:800;color:var(--muted);letter-spacing:.06em;margin:18px 4px 8px}'+
  '.p51-adv .card{border-radius:18px!important;background:var(--card)!important;border:1px solid var(--line)!important}'+
  '.p51-a2hs .p51-k{color:var(--ink);font-weight:800}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
