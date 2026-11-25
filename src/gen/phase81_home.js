/* ===== Phase81：ホームをシンプルに／使い方（どれから始める？）のページ =====
   ・ホームから「冒険の続き」の大きなカードを外す（設定でもどせる：settings.p81Road）。
   ・「学び方を選ぶ」の大きなカード3つ＋辞書・お気に入り・単語練習・その他の練習を、
     1行ずつの小さな一覧にまとめる（画面に入りきらないときは、ふつうに下へスクロール）。
   ・上の「？ 使い方」ボタンで、目的別のおすすめモードを案内するページを出す。
   ・初めての人には「迷ったら ここを見てね」の帯を出す（使い方を開くか ✕ で消える：settings.p81Seen）。 */

/* 線だけの小さなアイコン（オリジナル） */
var P81_IC={
  help:'<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.1-2.4 3.6"/><path d="M12 17.2v.1"/>',
  book:'<path d="M4 5.5C6.5 4.5 9 4.6 12 6.2c3-1.6 5.5-1.7 8-.7V19c-2.5-1-5-.9-8 .7-3-1.6-5.5-1.7-8-.7z"/><path d="M12 6.2v13.5"/>',
  flag:'<path d="M5 21V4"/><path d="M5 4.5c4-2 7 2 13 0v8c-6 2-9-2-13 0"/>',
  loop:'<path d="M4 12a8 8 0 0 1 13.7-5.6L20 8.7"/><path d="M20 4v4.7h-4.7"/><path d="M20 12a8 8 0 0 1-13.7 5.6L4 15.3"/><path d="M4 20v-4.7h4.7"/>',
  sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/>',
  search:'<circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5.5 5.5"/>',
  star:'<path d="M12 3.5l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.8l-5.2 2.7 1-5.8-4.2-4.1 5.8-.8z"/>',
  cards:'<rect x="3.5" y="6.5" width="13" height="13" rx="2"/><path d="M8 4h10.5a2 2 0 0 1 2 2v10.5"/>',
  grid:'<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  go:'<path d="M9 5l7 7-7 7"/>',
  x:'<path d="M6 6l12 12M18 6L6 18"/>'
};
function p81Ic(k,s){return '<svg width="'+(s||20)+'" height="'+(s||20)+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P81_IC[k]||"")+'</svg>';}

/* ---------- ホーム：小さな一覧 ---------- */
function p81Row(act,ic,title,sub){
  return '<button type="button" class="p81-row" data-act="'+act+'"><span class="p81-ric">'+p81Ic(ic,20)+'</span><span class="p81-rtx"><b>'+title+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button>';
}
function p81Tile(act,ic,title){
  return '<button type="button" class="p81-tile" data-act="'+act+'">'+p81Ic(ic,18)+'<b>'+title+'</b></button>';
}
function p81List(){
  var favN=0;try{favN=p72FavCount();}catch(_){}
  var h='<div class="p81-sec"><div class="p81-h">学び方</div><div class="p81-box">';
  h+=p81Row("p72guide","book","文法から学ぶ","解説を読んで、章ごとに練習");
  h+=p81Row("p70road","flag",P74_NAME+"（ストーリー）","物語を進めながら、1から全部");
  h+=p81Row("p48reinf","loop","まとめて周回","全部の単語をテンポよく復習");
  h+='</div></div><div class="p81-sec"><div class="p81-h">調べる・ほかの練習</div><div class="p81-tiles">';
  h+=p81Tile("p56search","search","辞書");
  h+=p81Tile("p72fav","star","お気に入り"+(favN?' <i>'+favN+'</i>':''));
  h+=p81Tile("p47words","cards","単語練習");
  h+=p81Tile("p47more","grid","その他の練習");
  h+='</div></div>';
  return h;
}
/* 初めての人への案内の帯 */
function p81Hint(){
  if(settings.p81Seen)return "";
  return '<div class="p81-hint"><button type="button" class="p81-hintb" data-act="p81guide">'+p81Ic("help",20)+'<span><b>はじめての方へ</b><small>どれから始めるか迷ったら、ここを見てね</small></span>'+p81Ic("go",16)+'</button><button type="button" class="p81-hx" data-act="p81hide" aria-label="この案内を消す">'+p81Ic("x",16)+'</button></div>';
}
if(typeof renderHome==="function"){
  var _p81Home=renderHome;
  renderHome=function(){
    var h=String(_p81Home.apply(this,arguments));
    if(h.indexOf('class="p47-home"')<0)return h;
    /* 冒険の続きカードを外す（設定でオンのときだけ残す） */
    if(!settings.p81Road){
      h=h.replace(/<button type="button" class="p74-card"[\s\S]*?<\/button>/,"").replace(/<button type="button" class="p70-roadcard"[\s\S]*?<\/button>/,"");
    }
    /* 「学び方を選ぶ」〜「その他の練習」をまとめて小さな一覧に置きかえる（ベーシックの形のとき） */
    var i=h.indexOf('<div class="p77-ents">'),j=h.indexOf('<button type="button" class="p47-more"');
    if(i>=0&&j>i){var k=h.indexOf('</button>',j)+9;h=h.slice(0,i)+p81List()+h.slice(k);}
    /* いまの目標のバー（記録の画面にもある）はホームから外して、画面を軽くする */
    h=h.replace(/<button type="button" class="p56-goal"[\s\S]*?<\/button>/,"");
    /* 初めての人への帯（週の帯の上） */
    var w=h.indexOf('<div class="p70-week">');if(w<0)w=h.indexOf('<div class="p51-herowrap">');
    if(w>=0)h=h.slice(0,w)+p81Hint()+h.slice(w);
    return h;
  };
}

/* ---------- 使い方のページ ---------- */
function p81GuideHtml(){
  var t=20;try{t=p47Target();}catch(_){}
  var card=function(who,ic,mode,body,act,btn){
    return '<div class="p81-g"><div class="p81-gwho">'+who+'</div><div class="p81-gmode">'+p81Ic(ic,20)+'<b>'+mode+'</b></div><p>'+body+'</p>'+(act?'<button type="button" class="p81-gbtn" data-act="p81go" data-val="'+act+'">'+btn+' '+p81Ic("go",15)+'</button>':'')+'</div>';
  };
  var h='<p class="p81-lead">目的に合わせて、入り口を1つ選んでください。どこから始めても、覚えた単語や進み具合は全部いっしょに記録されます。途中で変えても大丈夫です。</p>';
  h+=card("とにかく、たくさん解きたい人","loop","まとめて周回（練習モード）","全部の単語を順番に、テンポよく出題します。1問ごとの説明は短めで、どんどん進みます。","p48reinf","まとめて周回を始める");
  h+=card("1日少しずつ、続けたい人","sun","今日のチャレンジ","ホームのいちばん上のカードです。1日に解く問題の数を自分で決められます（いまは <b>"+t+"問</b>）。10・15・20・30・50問から選ぶか、5問ずつ増やしたり減らしたりできます。数はカードの右上の歯車からいつでも変えられます。","p51daily","問題の数を決める");
  h+=card("じっくり、徹底的にやりたい人","flag",P74_NAME+"（ストーリーモード）","剣・魔法・王・武士・海の冒険や、マナスなどキルギスの物語と歴史から1つ選び、1つめのテーマから順番に全部進めます。レッスンを終えるたびに物語が進みます。1周したら、聞き取りや書き取りのある難しい段階に進めます。","p70road",P74_NAME+"を見る");
  h+=card("文法から理解したい人","book","文法から学ぶ","文法の解説書を章ごとに読み、その章の文法が出てくる練習問題を解きます。答えたあとに「なぜこの形になるのか」の説明が出ます。","p72guide","文法の解説書を開く");
  h+='<div class="p81-gh">そのほか</div><div class="p81-gsmall">'+
    '<p>'+p81Ic("search",16)+'<b>辞書</b>　知らない単語を調べます。耳で聞いた音をひらがな・カタカナで入れても探せます。</p>'+
    '<p>'+p81Ic("star",16)+'<b>お気に入り</b>　問題や単語の ☆ を押して集めたものだけを練習します。</p>'+
    '<p>'+p81Ic("cards",16)+'<b>単語練習</b>　テーマ（食べもの・家族など）を選んで単語を覚えます。</p>'+
    '<p>'+p81Ic("grid",16)+'<b>その他の練習</b>　作文・リスニング・会話など。</p></div>';
  h+='<div class="p81-tipbox"><b>迷ったら</b>まず「今日のチャレンジ」を10問から始めて、慣れてきたら'+P74_NAME+'や文法に広げるのがおすすめです。</div>';
  return h;
}
function p81Sheet(){var m=document.getElementById("p81sheet");if(!m){m=document.createElement("div");m.id="p81sheet";document.body.appendChild(m);}return m;}
function p81Open(){
  var m=p81Sheet();
  m.innerHTML='<div class="p81-mask" data-act="p81close"></div><div class="p81-panel" role="dialog" aria-modal="true" aria-label="使い方"><div class="p81-ph"><b>使い方　どれから始める？</b><button type="button" class="p81-x" data-act="p81close" aria-label="閉じる">'+p81Ic("x",18)+'</button></div><div class="p81-pb">'+p81GuideHtml()+'</div></div>';
  m.className="show";document.body.classList.add("p81-open");
  if(!settings.p81Seen){settings.p81Seen=1;try{saveAll();}catch(_){}}
}
function p81Close(){var m=p81Sheet();m.className="";m.innerHTML="";document.body.classList.remove("p81-open");}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a==="p81guide"){e.stopImmediatePropagation();e.preventDefault();p81Open();return;}
  if(a==="p81close"){e.stopImmediatePropagation();e.preventDefault();p81Close();try{render();}catch(_){}return;}
  if(a==="p81hide"){e.stopImmediatePropagation();e.preventDefault();settings.p81Seen=1;try{saveAll();}catch(_){}render();return;}
  if(a==="p81road"){e.stopImmediatePropagation();e.preventDefault();settings.p81Road=!settings.p81Road;try{saveAll();}catch(_){}render();return;}
},true);
/* 使い方のページの中のボタン（data-act="p81go" data-val="行き先"）：ページを閉じてから、
   行き先のボタンを押したのと同じ処理を呼ぶ（見えない仮のボタンを作って押す） */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest('[data-act="p81go"]');if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();p81Close();
  var t=document.createElement("button");t.type="button";t.style.display="none";t.setAttribute("data-act",el.getAttribute("data-val"));
  document.body.appendChild(t);try{t.click();}finally{t.remove();}
},true);

/* 画面の上（ヘッダー右、見た目ボタンの左）に「？ 使い方」ボタン */
(function(){
  var hd=document.querySelector("header.app");
  if(hd&&!document.getElementById("p81btn")){
    var b=document.createElement("button");b.type="button";b.id="p81btn";b.className="p81-help";b.setAttribute("data-act","p81guide");b.setAttribute("aria-label","使い方");
    b.innerHTML=p81Ic("help",18)+'<span>使い方</span>';hd.appendChild(b);
  }
})();
/* 設定：ホームに冒険の続きカードを出す（ふだんは出さない） */
if(typeof p62SettingsUI==="function"){
  var _p81SetUI=p62SettingsUI;
  p62SettingsUI=function(){
    var h=String(_p81SetUI.apply(this,arguments)),i=h.lastIndexOf('</div>');
    return h.slice(0,i)+'<button type="button" class="p63-tog" data-act="p81road"><span><b>ホームに'+P74_NAME+'の続きを表示</b><small>進行中のストーリーの続きを、ホームに大きなカードで出します</small></span><i class="'+(settings.p81Road?"on":"")+'"></i></button>'+h.slice(i);
  };
}

(function(){
  var st=document.createElement("style");
  st.textContent=
  /* 上の段：使い方ボタン */
  '#p81btn{position:absolute;right:64px;top:50%;transform:translateY(-50%)}'+
  '.p81-help{display:inline-flex;align-items:center;gap:5px;height:40px;padding:0 12px 0 10px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer}'+
  '.p81-help svg{color:var(--accent)}'+
  /* とても狭い画面（320px など）では「？」だけにして、タイトルと重ならないように */
  '@media (max-width:350px){#p81btn{width:40px;padding:0;justify-content:center}#p81btn span{display:none}}'+
  /* 初めての人への帯 */
  '.p81-hint{position:relative;margin:0 0 12px}'+
  '.p81-hintb{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1.5px solid var(--accent);background:var(--card);color:var(--ink);border-radius:14px;padding:10px 44px 10px 12px;font:inherit;cursor:pointer}'+
  '.p81-hintb>svg:first-child{flex:none;color:var(--accent)}.p81-hintb span{flex:1;display:flex;flex-direction:column}.p81-hintb b{font-size:14px}.p81-hintb small{font-size:12.5px;color:var(--muted)}.p81-hintb>svg:last-child{color:var(--muted)}'+
  '.p81-hx{position:absolute;right:6px;top:50%;margin-top:-16px;width:32px;height:32px;border:0;background:none;color:var(--muted);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
  /* 一覧 */
  '.p81-sec{margin:16px 0 0}.p81-h{font-size:13px;font-weight:700;color:var(--muted);margin:0 4px 6px}'+
  '.p81-box{border:1px solid var(--line);background:var(--card);border-radius:14px;overflow:hidden}'+
  '.p81-row{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);font:inherit;padding:11px 12px 11px 14px;min-height:56px;cursor:pointer}.p81-row:first-child{border-top:0}'+
  '.p81-ric{flex:none;color:var(--accent);display:flex}.p81-rtx{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.p81-rtx b{font-size:15.5px}.p81-rtx small{font-size:12.5px;color:var(--muted)}.p81-rgo{color:var(--muted);display:flex}'+
  '.p81-tiles{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
  '.p81-tile{display:flex;align-items:center;gap:8px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:0 12px;min-height:48px;font:inherit;text-align:left;cursor:pointer}.p81-tile svg{flex:none;color:var(--muted)}.p81-tile b{font-size:14px;font-weight:600}.p81-tile i{font-style:normal;font-size:12px;color:var(--muted);margin-left:2px}'+
  /* 使い方のページ（下から出るシート） */
  '#p81sheet{display:none}#p81sheet.show{display:block;position:fixed;inset:0;z-index:210}.p81-mask{position:absolute;inset:0;background:rgba(0,0,0,.55)}'+
  '.p81-panel{position:absolute;left:0;right:0;bottom:0;max-height:92vh;max-width:560px;margin:0 auto;background:var(--bg);border-top:1px solid var(--line);border-radius:18px 18px 0 0;display:flex;flex-direction:column}'+
  '.p81-ph{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:16px 16px 8px}.p81-ph b{font-size:18px}'+
  '.p81-x{flex:none;width:36px;height:36px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
  '.p81-pb{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:4px 16px calc(24px + env(safe-area-inset-bottom))}'+
  '.p81-lead{font-size:14px;line-height:1.7;color:var(--muted);margin:0 0 12px}'+
  '.p81-g{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px;margin:0 0 10px}'+
  '.p81-gwho{font-size:12.5px;font-weight:700;color:var(--muted)}.p81-gmode{display:flex;align-items:center;gap:8px;margin:3px 0 6px;color:var(--accent)}.p81-gmode b{font-size:17px;color:var(--ink)}'+
  '.p81-g p{font-size:14px;line-height:1.75;margin:0 0 10px}'+
  '.p81-gbtn{display:inline-flex;align-items:center;gap:4px;border:1px solid var(--accent);background:none;color:var(--accent);border-radius:10px;padding:8px 12px;font:inherit;font-size:14px;font-weight:700;cursor:pointer}'+
  '.p81-gh{font-size:13px;font-weight:700;color:var(--muted);margin:16px 4px 6px}'+
  '.p81-gsmall{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:4px 14px}.p81-gsmall p{font-size:13.5px;line-height:1.7;margin:0;padding:9px 0;border-top:1px solid var(--line)}.p81-gsmall p:first-child{border-top:0}.p81-gsmall svg{vertical-align:-3px;margin-right:6px;color:var(--muted)}'+
  '.p81-tipbox{margin:14px 0 0;font-size:14px;line-height:1.7;padding:12px 14px;border-radius:14px;background:var(--card);border-left:3px solid var(--accent)}.p81-tipbox b{display:block;margin-bottom:2px}'+
  'body.p81-open{overflow:hidden}';
  document.head.appendChild(st);
})();
