/* ===== PHASE47: シンプルUI（ホーム2択・テーマ別単語練習・覚えたリスト・ブックマーク・新デザイン） ===== */
/* 収録レベルの一覧（ロシア語は B1 まで。キルギス語は A1/A2） */
var P_LVLS=(function(){var o=["A1","A2"];if(VOCAB.some(function(w){return w.level==="B1";}))o.push("B1");return o;})();
function pLvRange(){return P_LVLS.length>2?P_LVLS[0]+"〜"+P_LVLS[P_LVLS.length-1]:P_LVLS.join("/");}
var P47_LANG="ru";
var P47={
  ru:{name:"ロシア語",native:"Русский",greet:function(h){return h<11?"Доброе утро":(h<18?"Добрый день":"Добрый вечер");},
      hero:'<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="p47sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B3D91"/><stop offset="1" stop-color="#0A84FF"/></linearGradient></defs><rect width="360" height="150" fill="url(#p47sky)"/><g fill="#fff" opacity=".85"><circle cx="40" cy="26" r="1.6"/><circle cx="96" cy="14" r="1.2"/><circle cx="150" cy="34" r="1.4"/><circle cx="300" cy="20" r="1.6"/><circle cx="330" cy="46" r="1.1"/><circle cx="250" cy="10" r="1.1"/></g><circle cx="292" cy="40" r="16" fill="#FFE8A3"/><circle cx="299" cy="35" r="14" fill="#1C5FC4"/><g fill="#06245A"><rect x="0" y="118" width="360" height="32"/><path d="M60 118V86h28v32z"/><path d="M74 46c10 10 14 18 14 26 0 8-6 14-14 14s-14-6-14-14c0-8 4-16 14-26z"/><rect x="72" y="34" width="4" height="14"/><path d="M120 118V96h22v22z"/><path d="M131 66c8 8 11 14 11 20 0 6-5 11-11 11s-11-5-11-11c0-6 3-12 11-20z"/><rect x="129.5" y="56" width="3" height="11"/><path d="M168 118V78h34v40z"/><path d="M185 28c13 13 18 23 18 33 0 10-8 18-18 18s-18-8-18-18c0-10 5-20 18-33z"/><rect x="183" y="14" width="4" height="16"/><path d="M226 118V98h20v20z"/><path d="M236 70c7 7 10 12 10 18 0 5-4 10-10 10s-10-5-10-10c0-6 3-11 10-18z"/></g><g fill="#FFD60A"><circle cx="74" cy="33" r="2.2"/><circle cx="185" cy="12" r="2.6"/><circle cx="131" cy="55" r="2"/></g><g fill="#0B2E70"><path d="M268 118v-46l3-6 3 6v46z"/><path d="M300 118v-36l2-5 2 5v36z"/><path d="M322 118v-52l3-6 3 6v52z"/></g></svg>'},
  ky:{name:"キルギス語",native:"Кыргызча",greet:function(h){return h<11?"Кутман таң":(h<18?"Кутмандуу күн":"Кутмандуу кеч");},
      hero:'<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true"><defs><linearGradient id="p47sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B3261E"/><stop offset="1" stop-color="#F06A3A"/></linearGradient></defs><rect width="360" height="150" fill="url(#p47sky)"/><g transform="translate(268 48)"><g stroke="#F2B705" stroke-width="2" opacity=".55">'+(function(){var s="";for(var i=0;i<20;i++){var a=i*Math.PI/10;s+='<line x1="'+(Math.cos(a)*24).toFixed(1)+'" y1="'+(Math.sin(a)*24).toFixed(1)+'" x2="'+(Math.cos(a)*34).toFixed(1)+'" y2="'+(Math.sin(a)*34).toFixed(1)+'"/>';}return s;})()+'</g><circle r="20" fill="#F2B705"/><g stroke="#C77C02" stroke-width="2.2" fill="none"><circle r="10"/><path d="M-10 -4h20M-10 4h20M-4 -10v20M4 -10v20"/></g></g><path d="M0 120L46 70l26 22 40-52 46 58 30-28 50 50H0z" fill="#7A1712" opacity=".75"/><path d="M92 60l20-20 18 22-12-6z" fill="#fff" opacity=".9"/><path d="M0 150v-30l70-38 50 30 60-44 80 52 50-26 50 30v26z" fill="#5C100C"/><g transform="translate(206 106)"><path d="M0 26V10Q22 -8 44 10v16z" fill="#FFF4E0"/><path d="M-2 11Q22 -10 46 11" fill="none" stroke="#C77C02" stroke-width="2.4"/><rect x="17" y="12" width="10" height="14" rx="1" fill="#B3261E"/><path d="M4 18h8M32 18h8" stroke="#C77C02" stroke-width="1.6"/></g></svg>'}
};
function p47L(){return P47[P47_LANG]||P47.ru;}
/* ---- 設定・保存 ---- */
if(!settings.p47Daily)settings.p47Daily=20;
var P47_KNOWN_KEY=K.prog.replace("vocabProgress","knownWords");
var p47Known=lget(P47_KNOWN_KEY,{});
function p47SaveKnown(){lset(P47_KNOWN_KEY,p47Known);}
function p47IsKnown(id){return !!p47Known[id];}
function p47KnownCount(){var n=0;for(var k in p47Known)if(p47Known[k]&&WMAP[k])n++;return n;}
function p47BookmarkIds(){return VOCAB.filter(function(w){return progress[w.id]&&progress[w.id].favorite;}).map(function(w){return w.id;});}
/* 単語の評価：「覚えた」で覚えたリストへ。「覚えてない／うろ覚え」なら外す */
var _p47Answer=answer;
answer=function(id,kind){
  var r=_p47Answer.apply(this,arguments);
  try{ if(WMAP[id]){ if(kind==="ok")p47Known[id]=1; else delete p47Known[id]; p47SaveKnown(); } }catch(_){}
  return r;
};
/* ---- 今日のチャレンジ ---- */
function p47Target(){return Math.max(5,Math.min(200,settings.p47Daily|0||20));}
function p47DoneToday(){return p23ModeCount("challenge");}
function p47BuildChallenge(n){
  var nCompose=Math.round(n/5), nWord=n-nCompose;
  var due=buildQueue({type:"review",allLevels:true});
  var fresh=VOCAB.filter(function(w){return !p47IsKnown(w.id)&&due.indexOf(w.id)<0&&!(progress[w.id]&&progress[w.id].status!=="new");}).map(function(w){return w.id;});
  var notKnown=VOCAB.filter(function(w){return !p47IsKnown(w.id)&&due.indexOf(w.id)<0&&fresh.indexOf(w.id)<0;}).map(function(w){return w.id;});
  var words=due.slice(0,nWord);
  if(words.length<nWord)words=words.concat(shuffle(notKnown).slice(0,Math.ceil((nWord-words.length)/2)));
  if(words.length<nWord)words=words.concat(fresh.slice(0,nWord-words.length));
  if(words.length<nWord)words=words.concat(shuffle(VOCAB.map(function(w){return w.id;})).filter(function(id){return words.indexOf(id)<0;}).slice(0,nWord-words.length));
  var comps=buildCompose({type:"review"}).concat(buildCompose({type:"random"}));
  var items=shuffle(words).map(function(id){return {kind:"word",id:id};});
  uniqueIds(comps).slice(0,nCompose).forEach(function(id,i){items.splice(Math.min(items.length,(i+1)*5-1),0,{kind:"compose",id:id});});
  return items;
}
function p47StartChallenge(){
  if(ui.mixQueue&&ui.mixQueue.mode==="challenge"&&ui.mixQueue.pos<ui.mixQueue.items.length){clearTransientUI();ui.bnav="wordbook";ui.learnOpen=true;p21OpenCurrent();return;}
  var left=p47Target()-p47DoneToday();
  var n=left>0?left:p47Target();
  var q=p47BuildChallenge(n).filter(function(it){return it.id;});
  if(!q.length){toast("対象の問題がありません");return;}
  ui.studyMode="challenge";
  ui.mixQueue={items:q,pos:0,mode:"challenge",startedAt:now(),stats:{ok:0,maybe:0,no:0,answered:0},total:q.length};
  clearTransientUI();ui.bnav="wordbook";ui.learnOpen=true;p21OpenCurrent();
}
/* ---- アイコン（テーマ別） ---- */
var P47_IC={
  chat:'<path d="M4 5h16v10H9l-5 4z"/>',people:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.4"/><path d="M3 19c0-3.3 2.7-5 6-5s6 1.7 6 5M15 14.5c3 0 6 1.4 6 4.5"/>',
  food:'<path d="M5 3v8a2 2 0 004 0V3M7 11v10M16 3c-2 2-2 6 0 8v10M16 3c2 2 2 6 0 8"/>',clock:'<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3 2"/>',
  city:'<path d="M3 21h18M5 21V9l5-3v15M10 21V4l9 4v13M13 10h3M13 14h3M7 12h1M7 16h1"/>',bus:'<rect x="5" y="3" width="14" height="14" rx="3"/><path d="M5 11h14M8 21v-4M16 21v-4"/><circle cx="8.5" cy="14" r=".8"/><circle cx="15.5" cy="14" r=".8"/>',
  bag:'<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 016 0v2"/>',heart:'<path d="M12 20s-7-4.4-7-10a4 4 0 017-2.6A4 4 0 0119 10c0 5.6-7 10-7 10z"/><path d="M12 10v4M10 12h4"/>',
  book:'<path d="M4 5a2 2 0 012-2h13v16H6a2 2 0 00-2 2zM4 5v16"/><path d="M9 7h6"/>',bolt:'<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  palette:'<path d="M12 3a9 9 0 100 18c1.5 0 2-1 2-2s-1-1.5-1-2.5 1-1.5 2-1.5h2a4 4 0 004-4c0-4.4-4-8-9-8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  case:'<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 12h18"/>',home:'<path d="M3 11l9-7 9 7M5 10v10h14V10M10 20v-6h4v6"/>',
  mountain:'<path d="M2 20l7-11 4 6 3-4 6 9z"/><circle cx="17" cy="6" r="2"/>',smile:'<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14c1 1.5 2.2 2 3.5 2s2.5-.5 3.5-2M9 9.5h.01M15 9.5h.01"/>',
  link:'<path d="M10 14a4 4 0 005.7 0l3-3a4 4 0 00-5.7-5.7l-1 1M14 10a4 4 0 00-5.7 0l-3 3a4 4 0 005.7 5.7l1-1"/>',hash:'<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>',
  star:'<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',bookmark:'<path d="M6 3h12v18l-6-4-6 4z"/>',check:'<path d="M5 12.5l4.5 4.5L19 7"/>',
  chev:'<path d="M9 5l7 7-7 7"/>',flame:'<path d="M12 21c4 0 7-2.7 7-6.5 0-3.6-2.6-5.6-3.6-8.5-.4 2-1.6 3.2-2.8 3.6C12.8 6.4 11 4.3 9 3c.4 3.1-4 5.6-4 11.5C5 18.3 8 21 12 21z"/>',
  grid:'<rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/>',
  cards:'<rect x="7" y="3" width="12" height="16" rx="2"/><path d="M5 7v12a2 2 0 002 2h9"/>'
};
function p47Icon(k,size,color){return '<svg width="'+(size||22)+'" height="'+(size||22)+'" viewBox="0 0 24 24" fill="none" stroke="'+(color||"currentColor")+'" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(P47_IC[k]||P47_IC.star)+'</svg>';}
function p47CatIcon(cat){
  var R=[[/基本表現|丁寧|会話チャンク|あいさつ/,"chat"],[/家族|人・|人$|性格|関係/,"people"],[/食|飲/,"food"],[/時間|曜日|月|数量|数・|予定/,"clock"],
    [/場所|街|都市|公共|行政/,"city"],[/交通|移動|方向/,"bus"],[/買い物|支払|衣服/,"bag"],[/健康|身体|医療|病院/,"heart"],[/学校|学習|子ども/,"book"],
    [/動詞|操作/,"bolt"],[/形容|副詞/,"palette"],[/仕事|書類|手続|通信/,"case"],[/住|家|持ち物|家事/,"home"],[/自然|地理|文化|国|趣味/,"mountain"],
    [/感情|抽象/,"smile"],[/前置詞|接続|格変化|代名詞/,"link"],[/チャンク|実用/,"cards"]];
  for(var i=0;i<R.length;i++)if(R[i][0].test(cat))return R[i][1];
  return "grid";
}
/* ---- テーマ一覧（カテゴリー＝テーマ） ---- */
var P47_THEMES=(function(){var m={},out=[];VOCAB.forEach(function(w){var c=w.category||"その他";if(!m[c]){m[c]={cat:c,level:w.level,ids:[]};out.push(m[c]);}m[c].ids.push(w.id);});
  out.sort(function(a,b){return P_LVLS.indexOf(a.level)-P_LVLS.indexOf(b.level);});return out;})();
/* ---- 画面：ホーム ---- */
function p47Ring(pct,size){var r=(size-10)/2,c=2*Math.PI*r,off=c*(1-Math.min(1,pct));
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'"><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="8"/><circle cx="'+size/2+'" cy="'+size/2+'" r="'+r+'" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'" transform="rotate(-90 '+size/2+' '+size/2+')"/></svg>';}
renderHome=function(){
  var L=p47L(),t=p47Target(),d=p47DoneToday(),done=d>=t,left=Math.max(0,t-d);
  var inProg=ui.mixQueue&&ui.mixQueue.mode==="challenge"&&ui.mixQueue.pos<ui.mixQueue.items.length;
  var streak=appHist.streak.count||0, known=p47KnownCount();
  var dt=new Date(),wd=["日","月","火","水","木","金","土"][dt.getDay()];
  var h='<div class="p47-home">';
  h+='<div class="p47-top"><div><div class="p47-date">'+(dt.getMonth()+1)+'月'+dt.getDate()+'日（'+wd+'）</div><div class="p47-greet">'+esc(L.greet(dt.getHours()))+'</div></div>'+
     '<div class="p47-streak'+(streak>0?" on":"")+'">'+p47Icon("flame",18)+'<b>'+streak+'</b><span>日連続</span></div></div>';
  h+='<button type="button" class="p47-hero" data-act="p47chal"><div class="p47-heroart">'+L.hero+'</div><div class="p47-herobody">'+
     '<div class="p47-herotxt"><div class="p47-kicker">今日のチャレンジ</div>'+
     '<div class="p47-big">'+Math.min(d,t)+'<small> / '+t+'問</small></div>'+
     '<div class="p47-sub">'+(done?p47Icon("check",15)+' 今日の目標を達成しました':('あと'+left+'問で今日の目標達成'))+'</div></div>'+
     '</div>'+
     '<div class="p47-gauge"><i style="width:'+Math.round(Math.min(1,d/t)*100)+'%"></i></div>'+
     '<div class="p47-cta">'+(inProg?'続きから再開':(done?'もう1セットやる':(d>0?'続ける':'はじめる')))+p47Icon("chev",18)+'</div></button>';
  h+='<button type="button" class="p47-card" data-act="p47words"><span class="p47-cardic">'+p47Icon("cards",24)+'</span>'+
     '<span class="p47-cardtxt"><b>単語練習</b><small>テーマを選んで覚える ・ 覚えた '+known+' / '+VOCAB.length+'語</small></span>'+p47Icon("chev",18)+'</button>';
  h+='<button type="button" class="p47-more" data-act="p47more">その他の練習（作文・リスニング・文法）'+p47Icon("chev",14)+'</button>';
  h+='</div>';
  return h;
};
/* ---- 画面：単語練習（テーマ別） ---- */
function renderP47Words(){
  var bm=p47BookmarkIds(),kn=VOCAB.filter(function(w){return p47IsKnown(w.id);}).map(function(w){return w.id;});
  var h='<div class="p47-tiles">'+
    '<button type="button" class="p47-tile" data-act="p47set" data-val="bookmark"'+(bm.length?'':' disabled')+'>'+p47Icon("bookmark",20)+'<b>'+bm.length+'</b><span>ブックマーク</span></button>'+
    '<button type="button" class="p47-tile" data-act="p47set" data-val="known"'+(kn.length?'':' disabled')+'>'+p47Icon("check",20)+'<b>'+kn.length+'</b><span>覚えた単語</span></button></div>';
  var lv="";
  P47_THEMES.forEach(function(th,i){
    if(th.level!==lv){lv=th.level;h+='<div class="p47-sec">'+({A1:'A1 ・ 基礎',A2:'A2 ・ ステップアップ',B1:'B1 ・ 中級'}[lv]||lv)+'</div>';}
    var n=th.ids.length,k=th.ids.filter(p47IsKnown).length,open=ui.p47Open===i;
    h+='<div class="p47-theme'+(open?" open":"")+'"><button type="button" class="p47-themehead" data-act="p47theme" data-val="'+i+'">'+
      '<span class="p47-themeic">'+p47Icon(p47CatIcon(th.cat),22)+'</span><span class="p47-themetxt"><b>'+esc(th.cat)+'</b>'+
      '<span class="p47-bar"><i style="width:'+Math.round(k/n*100)+'%"></i></span></span><span class="p47-cnt">'+k+'<small>/'+n+'</small></span></button>';
    if(open){
      var nk=n-k;
      h+='<div class="p47-themeact">'+
        '<button type="button" class="p47-btn primary" data-act="p47go" data-val="'+i+':new"'+(nk?'':' disabled')+'>覚えていない単語（'+nk+'）</button>'+
        '<button type="button" class="p47-btn" data-act="p47go" data-val="'+i+':known"'+(k?'':' disabled')+'>覚えた単語を確認（'+k+'）</button></div>';
    }
    h+='</div>';
  });
  return h;
}
function p47StartIds(ids,label){if(!ids.length){toast("対象の単語がありません");return;}ui.mixQueue=null;clearTransientUI();ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;startSessionFromIds(ids.slice(0,20),label);}
/* ---- 画面：設定（よく使う項目だけ上に、残りは「詳細設定」に） ---- */
var _p47Settings=renderSettings;
renderSettings=function(embed){
  var t=p47Target();
  var h='<div class="hero"><div class="greet">設定</div></div>';
  h+='<div class="p47-set"><div class="p47-setrow"><div><b>1日のチャレンジ数</b><small>ホームの「今日のチャレンジ」の目標です</small></div></div>'+
     '<div class="p47-seg">'+[10,15,20,30,50].map(function(v){return '<button type="button" data-act="p47daily" data-val="'+v+'" class="'+(t===v?"on":"")+'">'+v+'</button>';}).join("")+'</div>'+
     '<div class="p47-step"><button type="button" data-act="p47daily" data-val="'+(t-5)+'">−5</button><span>'+t+' 問</span><button type="button" data-act="p47daily" data-val="'+(t+5)+'">＋5</button></div></div>';
  h+='<div class="p47-set"><button type="button" class="p47-link" data-act="onbreplay">はじめの案内をもう一度見る'+p47Icon("chev",16)+'</button></div>';
  h+='<details class="p47-adv"><summary>詳細設定</summary>'+_p47Settings(true)+'</details>';
  return h;
};
/* ---- 下のメニュー：ホーム／記録／設定 ---- */
BNAV=[["home","ホーム"],["stats","記録"],["settings","設定"]];
var P47_NAVIC={home:"home",stats:"clock",settings:"grid"};
P47_IC.gear='<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z"/>';
P47_IC.chart='<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>';
P47_NAVIC={home:"home",stats:"chart",settings:"gear"};
renderBNav=function(){
  var bar=document.getElementById("bnavbar");if(!bar)return;
  var cur=(ui.bnav==="wordbook"||ui.bnav==="review")?"home":(ui.bnav==="profile"?"settings":ui.bnav);
  bar.innerHTML=BNAV.map(function(b){var on=cur===b[0];return '<button type="button" data-act="bnav" data-val="'+b[0]+'" class="'+(on?"on":"")+'"><span class="ic">'+p47Icon(P47_NAVIC[b[0]],24)+'</span>'+b[1]+'</button>';}).join("");
};
var _p47Render=render;
render=function(){
  if(ui.bnav==="profile"){ui.bnav=(ui.profileSub==="stats")?"stats":"settings";}
  if(ui.bnav==="review"){ui.bnav="home";}
  return _p47Render.apply(this,arguments);
};
/* ---- 単語カードの評価ボタンを「覚えてない／うろ覚え／覚えた」に ---- */
var _p47Study=renderStudy;
renderStudy=function(){
  return String(_p47Study.apply(this,arguments))
    .replace(/(data-val="no">)できない(<\/button>)/g,"$1覚えてない$2").replace(/(data-val="maybe">)微妙(<\/button>)/g,"$1うろ覚え$2")
    .replace(/(data-val="ok">)できた！?(<\/button>)/g,"$1覚えた$2");
};
var _p47Check=p21RenderCheckpoint;
p21RenderCheckpoint=function(){
  var t=p47Target(),d=Math.min(p47DoneToday(),t);
  return String(_p47Check.apply(this,arguments)).replace(/本日の達成率<\/span><span>\d+%/,"今日のチャレンジ</span><span>"+d+" / "+t+"問");
};
/* ---- はじめの案内 ---- */
var P47_SLIDES=[
  {ic:"flame",title:"毎日のチャレンジ",body:"開いたら「はじめる」を押すだけ。復習が必要な単語と新しい単語、瞬間作文を自動で組み合わせて出題します。"},
  {ic:"cards",title:"単語はテーマで覚える",body:"あいさつ・家族・食べ物などテーマを選んで練習。「覚えた」を押した単語が覚えたリストに入ります。"},
  {ic:"bookmark",title:"ブックマークで自分だけの単語帳",body:"気になる単語はカードの右上のしおりで保存。単語練習からまとめて復習できます。"},
  {ic:"check",title:"記録はこの端末に保存",body:"学習データはこのブラウザの中に保存されます。1日の問題数は設定でいつでも変えられます。"}
];
ONBOARD_SLIDES=P47_SLIDES;
renderOnboarding=function(){
  var L=p47L(),i=Math.min(ui.onbSlide||0,P47_SLIDES.length-1),s=P47_SLIDES[i],last=i===P47_SLIDES.length-1;
  var h='<div class="p47-onb"><div class="p47-onbart">'+L.hero+'<span class="p47-onbbadge">'+p47Icon(s.ic,30)+'</span></div>';
  h+='<div class="p47-onbbody">'+(last?'':'<button type="button" class="p47-onbskip" data-act="onbskip">スキップ</button>')+
     '<div class="p47-onbapp">'+esc(L.native)+' ・ '+esc(L.name)+' '+pLvRange()+'</div>'+
     '<h2>'+esc(s.title)+'</h2><p>'+esc(s.body)+'</p>'+
     '<div class="p47-dots">'+P47_SLIDES.map(function(_,k){return '<i class="'+(k===i?"on":"")+'"></i>';}).join("")+'</div>'+
     '<button type="button" class="p47-onbbtn" data-act="'+(last?"onbfinish":"onbnext")+'">'+(last?"はじめる":"次へ")+p47Icon("chev",18)+'</button></div></div>';
  return h;
};
/* ---- 操作 ---- */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  var mine={p47chal:1,p47words:1,p47more:1,p47theme:1,p47go:1,p47set:1,p47daily:1};
  if(!mine[a])return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p47chal"){p47StartChallenge();return;}
  if(a==="p47words"){clearTransientUI();ui.bnav="wordbook";ui.view="p47words";ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);return;}
  if(a==="p47more"){clearTransientUI();ui.bnav="wordbook";ui.learnOpen=false;saveUI();render();window.scrollTo(0,0);return;}
  if(a==="p47theme"){var ti=+v;ui.p47Open=(ui.p47Open===ti)?null:ti;saveUI();render();return;}
  if(a==="p47go"){var pr=v.split(":"),th=P47_THEMES[+pr[0]];if(!th)return;
    if(pr[1]==="new"){var ids=th.ids.filter(function(id){return !p47IsKnown(id);});var due=ids.filter(isDue);var rest=ids.filter(function(id){return due.indexOf(id)<0;});p47StartIds(due.concat(rest),th.cat);}
    else p47StartIds(shuffle(th.ids.filter(p47IsKnown)),th.cat+"（覚えた単語）");
    return;}
  if(a==="p47set"){if(v==="bookmark")p47StartIds(shuffle(p47BookmarkIds()),"ブックマーク");else p47StartIds(shuffle(VOCAB.filter(function(w){return p47IsKnown(w.id);}).map(function(w){return w.id;})),"覚えた単語");return;}
  if(a==="p47daily"){settings.p47Daily=Math.max(5,Math.min(200,+v||20));saveAll();render();return;}
},true);
/* ---- 見た目 ---- */
(function(){
  var css=
  'header.app .hact{display:none!important}'+
  'body.p21-challenge,body.p23-compose{--accent:inherit;--accentDeep:inherit;--accentSoft:inherit;--blue:inherit;--blueDeep:inherit;--star:inherit}'+
  '.p47-home{padding:4px 2px 24px}'+
  '.p47-top{display:flex;justify-content:space-between;align-items:flex-end;margin:6px 2px 16px}'+
  '.p47-date{font-size:13px;color:var(--muted);font-weight:600}.p47-greet{font-size:26px;font-weight:800;letter-spacing:-.02em;margin-top:2px}'+
  '.p47-streak{display:flex;align-items:center;gap:4px;padding:7px 12px;border-radius:999px;background:var(--card);color:var(--muted);font-size:12px}'+
  '.p47-streak b{font-size:16px;color:var(--ink)}.p47-streak.on{color:#FF9F0A}.p47-streak.on b{color:#FF9F0A}'+
  '.p47-hero{display:block;width:100%;padding:0;border:none;border-radius:24px;overflow:hidden;position:relative;background:var(--accent);color:#fff;text-align:left;cursor:pointer;box-shadow:0 12px 32px rgba(0,0,0,.35)}'+
  '.p47-heroart{position:absolute;inset:0}.p47-heroart svg{width:100%;height:100%;display:block}'+
  '.p47-heroart:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(0,0,0,.62) 0%,rgba(0,0,0,.35) 50%,rgba(0,0,0,0) 85%),linear-gradient(180deg,rgba(0,0,0,0) 55%,rgba(0,0,0,.45) 100%)}'+
  '.p47-herobody{position:relative;padding:22px 20px 4px;min-height:132px}.p47-sub{display:flex;align-items:center;gap:4px}.p47-gauge{position:relative;margin:12px 20px 0;height:8px;border-radius:9px;background:rgba(255,255,255,.28);overflow:hidden}.p47-gauge i{display:block;height:100%;border-radius:9px;background:#fff}'+
  '.p47-kicker{font-size:13px;font-weight:700;opacity:.9;letter-spacing:.04em}.p47-big{font-size:44px;font-weight:800;line-height:1.05;margin-top:6px;letter-spacing:-.02em}'+
  '.p47-big small{font-size:17px;font-weight:700;opacity:.85}.p47-sub{font-size:13px;opacity:.92;margin-top:6px}'+
  '.p47-ring{position:relative;width:84px;height:84px;flex:0 0 auto}.p47-ring span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:17px}'+
  '.p47-cta{position:relative;margin:14px 16px 16px;padding:15px;border-radius:16px;background:#fff;color:#111;font-weight:800;font-size:16px;display:flex;align-items:center;justify-content:center;gap:6px}'+
  '.p47-card{margin-top:14px;width:100%;display:flex;align-items:center;gap:14px;padding:18px;border-radius:20px;background:var(--card);border:1px solid var(--line);color:var(--ink);text-align:left;cursor:pointer}'+
  '.p47-cardic{width:48px;height:48px;border-radius:14px;background:var(--accentSoft);color:var(--accent);display:flex;align-items:center;justify-content:center;flex:0 0 auto}'+
  '.p47-cardtxt{flex:1;min-width:0}.p47-cardtxt b{display:block;font-size:17px}.p47-cardtxt small{display:block;font-size:12.5px;color:var(--muted);margin-top:3px}'+
  '.p47-card>svg{color:var(--mutedSoft)}'+
  '.p47-more{margin:18px auto 0;display:flex;align-items:center;gap:4px;background:none;border:none;color:var(--muted);font-size:13px;cursor:pointer;padding:8px}'+
  '.p47-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:6px}'+
  '.p47-tile{display:flex;flex-direction:column;align-items:flex-start;gap:4px;padding:16px;border-radius:18px;background:var(--card);border:1px solid var(--line);color:var(--accent);cursor:pointer;text-align:left}'+
  '.p47-tile b{font-size:24px;color:var(--ink);line-height:1.1;margin-top:4px}.p47-tile span{font-size:12.5px;color:var(--muted)}.p47-tile[disabled]{opacity:.5}'+
  '.p47-sec{font-size:12px;font-weight:700;color:var(--muted);letter-spacing:.06em;margin:20px 4px 8px}'+
  '.p47-theme{background:var(--card);border:1px solid var(--line);border-radius:18px;margin-bottom:8px;overflow:hidden}.p47-theme.open{border-color:var(--accent)}'+
  '.p47-themehead{width:100%;display:flex;align-items:center;gap:12px;padding:13px 14px;background:none;border:none;color:var(--ink);text-align:left;cursor:pointer}'+
  '.p47-themeic{width:42px;height:42px;border-radius:12px;background:var(--accentSoft);color:var(--accent);display:flex;align-items:center;justify-content:center;flex:0 0 auto}'+
  '.p47-themetxt{flex:1;min-width:0}.p47-themetxt b{display:block;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}'+
  '.p47-bar{display:block;height:5px;border-radius:9px;background:var(--line);margin-top:8px;overflow:hidden}.p47-bar i{display:block;height:100%;background:var(--accent);border-radius:9px}'+
  '.p47-cnt{font-weight:800;font-size:16px}.p47-cnt small{font-size:12px;color:var(--muted);font-weight:600}'+
  '.p47-themeact{display:flex;flex-direction:column;gap:8px;padding:0 14px 14px}'+
  '.p47-btn{padding:13px;border-radius:14px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font-weight:700;font-size:14px;cursor:pointer}'+
  '.p47-btn.primary{background:var(--accent);border-color:var(--accent);color:#fff}.p47-btn[disabled]{opacity:.45}'+
  '.p47-set{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:16px;margin-bottom:12px}'+
  '.p47-setrow b{display:block;font-size:15px}.p47-setrow small{display:block;color:var(--muted);font-size:12px;margin-top:2px}'+
  '.p47-seg{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin-top:12px}'+
  '.p47-seg button{padding:10px 0;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font-weight:700;cursor:pointer}'+
  '.p47-seg button.on{background:var(--accent);border-color:var(--accent);color:#fff}'+
  '.p47-step{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:12px}.p47-step span{font-weight:800;font-size:18px;min-width:70px;text-align:center}'+
  '.p47-step button{width:52px;height:38px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font-weight:700;cursor:pointer}'+
  '.p47-link{width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;color:var(--ink);font-size:15px;font-weight:600;padding:2px 0;cursor:pointer}'+
  '.p47-adv{margin-top:8px}.p47-adv>summary{cursor:pointer;color:var(--muted);font-size:13px;font-weight:700;padding:12px 4px;list-style:none}.p47-adv>summary::-webkit-details-marker{display:none}'+
  '.p47-adv>summary:after{content:" ›"}.p47-adv[open]>summary:after{content:" ⌄"}'+
  'nav.bnav .ic svg{display:block}'+
  '.p47-onb{position:fixed;inset:0;z-index:95;background:var(--bg);display:flex;flex-direction:column}'+
  '.p47-onbart{position:relative;flex:1 1 auto;min-height:38vh;overflow:hidden}.p47-onbart svg{position:absolute;inset:0;width:100%;height:100%}'+
  '.p47-onbart:after{content:"";position:absolute;left:0;right:0;bottom:0;height:40%;background:linear-gradient(180deg,rgba(0,0,0,0),var(--bg))}'+
  '.p47-onbbadge{position:absolute;left:50%;bottom:14px;transform:translateX(-50%);z-index:1;width:68px;height:68px;border-radius:22px;background:var(--card);color:var(--accent);display:flex;align-items:center;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,.4)}'+
  '.p47-onbbody{position:relative;padding:18px 24px calc(26px + env(safe-area-inset-bottom));text-align:center;max-width:460px;margin:0 auto;width:100%;box-sizing:border-box}'+
  '.p47-onbskip{position:absolute;top:-40vh;right:16px;margin-top:calc(14px + env(safe-area-inset-top));background:rgba(0,0,0,.35);color:#fff;border:none;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:700;cursor:pointer;z-index:2}'+
  '.p47-onbapp{font-size:12px;font-weight:700;color:var(--accent);letter-spacing:.06em}'+
  '.p47-onbbody h2{font-size:26px;margin:10px 0 10px;letter-spacing:-.02em}.p47-onbbody p{color:var(--muted);font-size:15px;line-height:1.8;margin:0;min-height:5.4em}'+
  '.p47-dots{display:flex;justify-content:center;gap:6px;margin:20px 0}.p47-dots i{width:7px;height:7px;border-radius:9px;background:var(--line);transition:width .2s}.p47-dots i.on{width:24px;background:var(--accent)}'+
  '.p47-onbbtn{width:100%;padding:17px;border:none;border-radius:18px;background:var(--accent);color:#fff;font-size:17px;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer;box-shadow:0 10px 24px var(--accentSoft)}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
