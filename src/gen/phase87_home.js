/* ===== Phase87：ホーム（ベーシック）を「次の1つだけ」の形に（2026-11-28 Yuta が案1を選択） =====
   ねらい：開いたときに、やることが1つだけ見える。スクロールしなくても「学び方」まで見える。
   上から：
     1) あいさつ ＋ 検定対策の小さな入口（ロシア語版）／連続日数（キルギス語版）
     2) 大きなカード1枚：今日の勉強時間（細い棒）→「次は：○○」→［始める］→「このあと：△ → □ ›」
        ・ロシア語版：AI学習コーチの「今日やること」（あなた専用の講義もここに入る）の、まだ終わっていない最初の1つ。
          「このあと」を押すと、今日やること全部・使える時間（15/30/60分）・今日のチャレンジのシートが開く。
        ・キルギス語版（コーチなし）：今日のチャレンジ（問題数は ⚙ で変更）。
     3) 学び方（3つのボタン）  4) 調べる・ほかの練習（4つのボタン）
   外したもの：週の丸い印、「はじめての方へ」の帯（右上の「使い方」に任せる）、今日のチャレンジの大きなカード（シートの中へ）。
   育てるモードがオンのときは、そのカードを大きなカードの下に残す。
   ホームの形が「ベーシック」以外（設定で選んだとき）は、今までどおり。 */

/* 使い方の文言を、この形に合わせる */
function p87Coach(){return typeof p85Plan==="function"&&typeof P47_LANG!=="undefined"&&P47_LANG==="ru";}
function p87Next(){
  var P=[];try{P=p85Plan();}catch(_){}
  var i=0;while(i<P.length&&P[i].done)i++;
  return {P:P,i:i,it:P[i]||null};
}
/* 大きなカード */
function p87Main(){
  var streak=0;try{streak=appHist.streak.count||0;}catch(_){}
  var play='<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>';
  var st='<span class="p87-streak'+(streak>0?" on":"")+'">'+streak+'<small>日連続</small></span>';
  if(p87Coach()){
    var S=p85Set(),D=p85DaySecs(1),m=p85Mins(D[0].s),goal=(typeof p85Goal==="function"?p85Goal():S.min),pct=Math.min(100,Math.round(m/goal*100));
    var N=p87Next(),it=N.it,h='<div class="p87-main">';
    h+='<button type="button" class="p87-time" data-act="p85time"><span>今日の勉強</span><b>'+m+'</b><span>/ '+goal+'分</span>'+st+'</button>';
    h+='<div class="p87-bar"><i style="width:'+pct+'%"></i></div>';
    if(it){
      var lec=/^lec:/.test(it.act);
      /* 100日コース中は「100日コース ◯日目」を小さく添える（メンターのひとことは「このあと」のシートに） */
      var crs="";try{var X=(typeof p85CState==="function")?p85CState():null;if(X)crs='100日コース '+(X.d>100?'完了':X.d+'日目')+' ・ ';}catch(_){}
      h+='<div class="p87-next"><small>'+crs+(lec?'あなた専用の講義':'次は')+'</small><b>'+esc(it.title)+'</b><span>'+esc(it.amt)+'</span></div>';
      h+='<button type="button" class="p87-cta" data-act="p85go" data-val="'+esc(it.act)+'">'+play+'始める</button>';
      var rest=N.P.slice(N.i+1).filter(function(x){return !x.done;}).map(function(x){return esc(x.title.replace(/（.*?）/g,""));});
      h+='<button type="button" class="p87-more" data-act="p87plan">'+(rest.length?'このあと：'+rest.join(' → '):'今日やることを見る')+' ›</button>';
    }else{
      h+='<div class="p87-next"><small>今日の分</small><b>今日やることは全部できました</b><span>もう少しやるなら、今日のチャレンジがおすすめです。</span></div>';
      h+='<button type="button" class="p87-cta" data-act="p47chal">'+play+'今日のチャレンジ</button>';
      h+='<button type="button" class="p87-more" data-act="p87plan">今日やることを見る ›</button>';
    }
    return h+'</div>';
  }
  /* コーチがない言語：今日のチャレンジ */
  var t=p47Target(),d=p47DoneToday(),done=d>=t;
  var inProg=ui.mixQueue&&ui.mixQueue.mode==="challenge"&&ui.mixQueue.pos<ui.mixQueue.items.length;
  var h2='<div class="p87-main"><div class="p87-time p87-static"><span>今日のチャレンジ</span><b>'+Math.min(d,t)+'</b><span>/ '+t+'問</span>'+st+'</div>';
  h2+='<div class="p87-bar"><i style="width:'+Math.round(Math.min(1,d/t)*100)+'%"></i></div>';
  h2+='<div class="p87-next"><small>次は</small><b>'+(done?'今日の目標を達成しました':'あと '+(t-d)+' 問')+'</b><span>'+(done?'もう1セットやることもできます':'1日に解く数は、下から変えられます')+'</span></div>';
  h2+='<button type="button" class="p87-cta" data-act="p47chal">'+play+(inProg?'続きから再開':(done?'もう1セットやる':(d>0?'続ける':'始める')))+'</button>';
  h2+='<button type="button" class="p87-more" data-act="p51daily">問題の数を変える（いまは '+t+' 問） ›</button></div>';
  return h2;
}
function p87Tile(act,ic,t,cls){return '<button type="button" class="p87-tile'+(cls?" "+cls:"")+'" data-act="'+act+'">'+p81Ic(ic,cls?22:20)+'<b>'+t+'</b></button>';}
function p87Lists(){
  var favN=0;try{favN=p72FavCount();}catch(_){}
  return '<div class="p81-h p87-h">学び方</div><div class="p87-g3">'+p87Tile("p72guide","book","文法から","big")+p87Tile("p70road","flag",P74_NAME,"big")+p87Tile("p48reinf","loop","まとめて周回","big")+'</div>'+
    '<div class="p81-h p87-h">調べる・ほかの練習</div><div class="p87-g4">'+p87Tile("p56search","search","辞書")+p87Tile("p72fav","star","お気に入り"+(favN?" "+favN:""))+p87Tile("p47words","cards","単語")+p87Tile("p47more","grid","その他")+'</div>';
}
if(typeof renderHome==="function"){
  var _p87Home=renderHome;
  renderHome=function(){
    var h=String(_p87Home.apply(this,arguments));
    if(h.indexOf('class="p47-home"')<0||(settings.p62Home&&settings.p62Home!=="basic"))return h;
    try{
      var chip=(h.match(/<button type="button" class="p86-chip"[\s\S]*?<\/button>/)||[""])[0];
      var grow="";try{if(typeof pGrOn==="function"&&pGrOn())grow=pGrCard();}catch(_){}
      var note=(h.match(/<div class="p53-note">[\s\S]*?<\/div>/)||[""])[0];
      var top=(h.match(/<div class="p47-top">[\s\S]*?<div class="p47-streak[\s\S]*?<\/div><\/div>/)||[""])[0];
      if(!top)return h;
      /* 上の段：あいさつ＋（あれば）検定の入口。連続日数は大きなカードの中へ */
      var greet=(top.match(/<div class="p47-greet">[\s\S]*?<\/div>/)||[""])[0];
      var topN='<div class="p47-top p87-top"><div>'+greet+'</div>'+(chip?chip.replace('class="p86-chip"','class="p86-chip p87-chip"').replace('<b>ロシア語検定 対策</b>','<b>検定対策</b>'):'')+'</div>';
      var out='<div class="p47-home p87-home">'+topN+note+p87Main()+grow+p87Lists()+'</div>';
      return out;
    }catch(_){return h;}
  };
}

/* 「このあと」：今日やること全部（使える時間・あなた専用の講義・今日のチャレンジ）をシートで */
function p87PlanHtml(){
  var h='';
  try{h=p85HomeHtml();}catch(_){}
  var t=20,d=0;try{t=p47Target();d=p47DoneToday();}catch(_){}
  h+='<div class="p81-h" style="margin-top:16px">ほかのやり方</div><div class="p81-box">'+
     '<button type="button" class="p81-row" data-act="p87go" data-val="p47chal"><span class="p81-ric">'+p81Ic("loop",20)+'</span><span class="p81-rtx"><b>今日のチャレンジ</b><small>'+Math.min(d,t)+' / '+t+' 問 ・ 決めた数だけ解く</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button>'+
     '<button type="button" class="p81-row" data-act="p87go" data-val="p51daily"><span class="p81-ric">'+p81Ic("grid",20)+'</span><span class="p81-rtx"><b>チャレンジの問題数を変える</b><small>いまは '+t+' 問（10〜50問）</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button>'+
     '<button type="button" class="p81-row" data-act="p87go" data-val="p85weak"><span class="p81-ric">'+p81Ic("book",20)+'</span><span class="p81-rtx"><b>弱点と講義</b><small>まちがえた問題から作る、あなた専用の講義</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button></div>';
  return h;
}
function p87Sheet(){var m=document.getElementById("p87sheet");if(!m){m=document.createElement("div");m.id="p87sheet";document.body.appendChild(m);}return m;}
function p87Open(){
  var m=p87Sheet();
  m.innerHTML='<div class="p81-mask" data-act="p87close"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="今日やること"><div class="p81-ph"><b>今日やること</b><button type="button" class="p81-x" data-act="p87close" aria-label="閉じる">'+p81Ic("x",18)+'</button></div><div class="p81-pb">'+p87PlanHtml()+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");
}
function p87Close(){var m=p87Sheet();m.className="";m.innerHTML="";document.body.classList.remove("p81-open");}
/* シートの中のボタン：p85min（時間の切りかえ）はシートを作り直す。それ以外はシートを閉じてから元の処理へ */
window.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("#p87sheet [data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a==="p87close"||a==="p87go")return;
  if(a==="p85min"){setTimeout(function(){if(p87Sheet().className==="show")p87Open();},0);return;}
  p87Close();
},true);
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a==="p87plan"){e.stopImmediatePropagation();e.preventDefault();p87Open();return;}
  if(a==="p87close"){e.stopImmediatePropagation();e.preventDefault();p87Close();try{render();}catch(_){}return;}
  if(a==="p87go"){e.stopImmediatePropagation();e.preventDefault();p87Close();
    var t=document.createElement("button");t.type="button";t.style.display="none";t.setAttribute("data-act",el.getAttribute("data-val"));
    document.body.appendChild(t);try{t.click();}finally{t.remove();}return;}
},true);

/* 使い方の文言：今日のチャレンジの場所が変わったので書きかえる */
if(typeof p81GuideHtml==="function"){
  var _p87Guide=p81GuideHtml;
  p81GuideHtml=function(){var h=String(_p87Guide.apply(this,arguments));
    if(p87Coach()&&(!settings.p62Home||settings.p62Home==="basic")){
      h=h.replace("ホームのいちばん上のカードです。","ホームの大きなカードの「このあと」を押すと、「ほかのやり方」にあります。");
      h=h.replace("数はカードの右上の歯車からいつでも変えられます。","数は同じ場所の「チャレンジの問題数を変える」からいつでも変えられます。");
    }else{
      h=h.replace("数はカードの右上の歯車からいつでも変えられます。","数はカードの下の「問題の数を変える」からいつでも変えられます。");
    }
    return h;};
}

(function(){
  var st=document.createElement("style");
  st.textContent=
  '.p87-top{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px!important}.p87-top>div{min-width:0}'+
  '.p87-top .p47-greet{font-size:24px!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  /* 検定対策の入口：小さな丸い札にする */
  '.p86-chip.p87-chip{width:auto;flex:none;margin:0;min-height:36px;padding:3px 10px 3px 5px}.p87-chip small{display:none}.p87-chip b{font-size:13px}'+
  /* 大きなカード */
  '.p87-main{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px 16px 10px}'+
  '.p87-time{display:flex;align-items:baseline;gap:6px;width:100%;border:0;background:none;color:var(--muted);font:inherit;font-size:13px;font-weight:700;padding:0;text-align:left;cursor:pointer}.p87-time.p87-static{cursor:default}'+
  '.p87-time b{font-size:20px;color:var(--ink);font-weight:800}'+
  '.p87-streak{margin-left:auto;font-size:14px;font-weight:800;color:var(--ink)}.p87-streak small{font-size:12px;color:var(--muted);font-weight:700;margin-left:2px}.p87-streak.on{color:#2E9C8F}'+
  '.p87-bar{height:6px;border-radius:3px;background:var(--line);margin:8px 0 14px;overflow:hidden}.p87-bar i{display:block;height:100%;background:var(--accent);border-radius:3px}'+
  '.p87-next small{display:block;font-size:12.5px;font-weight:700;color:var(--accent)}.p87-next b{display:block;font-size:19px;font-weight:800;line-height:1.35;margin:2px 0 3px}.p87-next span{display:block;font-size:13px;color:var(--muted);line-height:1.5}'+
  '.p87-cta{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;min-height:52px;margin-top:14px;border:0;border-radius:14px;background:var(--accent);color:#fff;font:inherit;font-size:17px;font-weight:800;cursor:pointer}'+
  '.p87-more{display:block;width:100%;border:0;background:none;color:var(--muted);font:inherit;font-size:13px;padding:10px 4px 4px;min-height:40px;cursor:pointer;text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  /* 学び方・調べる */
  '.p87-h{margin:16px 4px 7px!important}'+
  '.p87-g3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.p87-g4{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}'+
  '.p87-tile{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;min-height:58px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:8px 2px;font:inherit;cursor:pointer}'+
  '.p87-tile svg{color:var(--muted);flex:none}.p87-tile b{font-size:12.5px;font-weight:600;white-space:nowrap}'+
  '.p87-tile.big{min-height:70px}.p87-tile.big svg{color:var(--accent)}.p87-tile.big b{font-size:13.5px;font-weight:700}'+
  '#p87sheet .p85c-th>div:first-child>b{display:none}'+
  '@media (max-width:350px){.p87-g4 b{font-size:11.5px}.p87-top .p47-greet{font-size:21px!important}}'+
  '#p87sheet{display:none}#p87sheet.show{display:block;position:fixed;inset:0;z-index:210}#p87sheet .p85c-today{margin:0}';
  document.head.appendChild(st);
})();
