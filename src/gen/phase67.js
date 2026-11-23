/* ===== PHASE67: 操作性とデザインの見直し =====
   - 学習中のサブ画面では上の「Русский」帯を隠し、戻るボタン付きの見出しだけにする
   - 単語カード：単語が長いときに音声ボタンと並んで不自然に折り返す問題を直す
   - 瞬間作文：読み仮名の括弧、「0.68x」などの数字、ローマ字、重複した文法ラベル、途中の設定ボタンを外す
               「解説を見る」は1回押せば解説がすべて開き、下の評価ボタンはいつでも押せる
   - 4択クイズ：選択肢を「同じテーマ・同じ品詞・同じ長さ（単語か文か）」からそろえ、答えが見え見えにならないようにする
   - 結果画面：下のボタンを画面下に固定し、スクロールしなくても押せる
   - 開発用の画面（要確認データ）を一覧から外す */

/* ---- 4択の選択肢：まぎらわしいものから選ぶ ---- */
p52Pool=function(w){
  var multi=/\s/.test(w.word),sm=p52Short(w.meaning);
  var ok=function(x){return x.id!==w.id&&x.word!==w.word&&p52Short(x.meaning)!==sm&&/\s/.test(x.word)===multi;};
  var t1=VOCAB.filter(function(x){return ok(x)&&x.category===w.category&&x.pos===w.pos;});
  if(t1.length>=6)return t1;
  var t2=t1.concat(VOCAB.filter(function(x){return ok(x)&&x.category!==w.category&&x.pos===w.pos&&x.level===w.level;}));
  if(t2.length>=6)return t2;
  var t3=t2.concat(VOCAB.filter(function(x){return ok(x)&&x.pos!==w.pos;}));
  if(t3.length>=6)return t3;
  return VOCAB.filter(function(x){return x.id!==w.id&&p52Short(x.meaning)!==sm;});
};

/* ---- 開発用の画面を一覧から外す ---- */
try{if(typeof LEARN_ITEMS!=="undefined")LEARN_ITEMS=LEARN_ITEMS.filter(function(it){return it[0]!=="reviewqueue";});}catch(_){}

/* ---- 描画後の仕上げ ---- */
function p67Tidy(){
  var m=document.getElementById("main");if(!m)return;
  var b=document.body;
  /* サブ画面（戻る／やめるボタンがある画面）では上の帯を隠す */
  var sub=!!ui.learnOpen||!!m.querySelector(".p52-top,.p51-head");
  b.classList.toggle("p67-sub",sub);
  /* 瞬間作文カード */
  var st=m.querySelector(".study");
  if(st){
    var gear=st.querySelector(':scope > div:first-child [data-act="bnav"][data-val="profile"]');if(gear)gear.style.visibility="hidden";
    st.querySelectorAll(".kana").forEach(function(k){var t=k.textContent.replace(/^\s*[\[【]\s*/,"").replace(/\s*[\]】]\s*$/,"").replace(/[。．]\s*$/,"");if(t!==k.textContent)k.textContent=t;});
    st.querySelectorAll('[data-act="sayslow"]').forEach(function(x){if(/x/.test(x.textContent))x.textContent="ゆっくり";});
    st.querySelectorAll(".roma").forEach(function(r){r.style.display="none";});
    var unit=st.querySelector(":scope > .small"),pill=st.querySelector(".tagpill");
    if(unit&&pill&&unit.textContent.indexOf(pill.textContent.trim())>=0)pill.parentNode.style.display="none";
    var det=st.querySelector("details.more");if(det&&st.querySelector(".easy"))det.open=true;
    var extra=st.querySelector('[data-act="toggleextra"] span');if(extra&&st.querySelector(".easy"))extra.textContent="解説を閉じる";
    else if(extra)extra.textContent="解説を見る";
    var gd=st.querySelector(".gd");if(gd)gd.textContent=gd.textContent.replace(/\s*下の単語分解では、表面形・基本形・意味・なぜこの形かを確認します。\s*$/,"");
  }
  /* 文法ページ（A2カバー状況）の作る側向けの注記を外す */
  m.querySelectorAll(".note").forEach(function(n){if(/draft|ネイティブ確認/.test(n.textContent))n.style.display="none";});
  /* 読み仮名の［ ］【 】を外す（リスニングなど） */
  m.querySelectorAll(".kana,.p52-dk").forEach(function(k){if(k.children.length)return;var t=k.textContent,u=t.replace(/^\s*[\[【]\s*/,"").replace(/\s*[\]】]\s*$/,"");if(u!==t)k.textContent=u;});
  /* 見出しと同じ大見出し（hero）を重ねて出さない */
  if(m.querySelector(".p51-head"))m.querySelectorAll(".hero .greet").forEach(function(g){g.style.display="none";});
  /* 作る側の数字・用語を外す */
  m.querySelectorAll(".card").forEach(function(c){var bb=c.querySelector(":scope > b");if(bb&&bb.textContent==="収録データ")c.style.display="none";});
  m.querySelectorAll(".small.muted,.p51-hubsub,.sub").forEach(function(x){if(x.children.length)return;var t=x.textContent;
    var u=t.replace(/^瞬間作文（[^）]*）。\s*/,"").replace("端末の読み上げでロシア語を聞き流します","ロシア語を聞き流して、耳を慣らします");if(u!==t)x.textContent=u;});
  /* リスニング：細かい設定は「再生の設定」にまとめて畳む */
  var lis=m.querySelector(".v-listening");
  if(lis&&!lis.querySelector(".p67-lisset")){
    var wf=lis.querySelector(".waveform");if(wf)wf.style.display="none";
    var first=null,kids=[].slice.call(lis.children);
    for(var i=0;i<kids.length;i++){if(kids[i].classList.contains("h2")){first=i;break;}}
    if(first!==null){
      var d=document.createElement("details");d.className="p67-lisset";if(ui.p67LisOpen)d.open=true;
      d.innerHTML='<summary>再生の設定</summary>';
      kids.slice(first).forEach(function(k){var txt=k.textContent||"";
        if(/フィルター再生|現在の設定/.test(txt)&&!k.classList.contains("seg")){k.style.display="none";}
        if(k.classList.contains("seg")&&k.querySelector('[data-act="lisquickfilter"]'))k.style.display="none";
        d.appendChild(k);});
      d.addEventListener("toggle",function(){ui.p67LisOpen=d.open;});
      lis.appendChild(d);
    }
  }
  /* 結果画面：ボタンを下に固定 */
  var res=m.querySelector(".p56-result");
  b.classList.toggle("p67-result",!!res);
}
var _p67Render=render;
render=function(){var r=_p67Render.apply(this,arguments);try{p67Tidy();}catch(_){}return r;};

/* 解説を開いたら、解説の先頭が見えるようにカードの中だけをスクロールする（評価ボタンは固定のまま） */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest('[data-act="toggleextra"]');if(!el)return;
  setTimeout(function(){try{var card=document.querySelector("#main .study > .card"),easy=card&&card.querySelector(".easy");
    /* 問題文（日本語）とロシア語の答えが上に残る位置までにとどめ、その下に解説が続くようにする */
    var ans=card&&(card.querySelector(".qcard .accent")||card.querySelector(".qcard .jp"));
    if(card&&easy)card.scrollTo({top:Math.max(0,Math.min(easy.offsetTop-80,(ans?ans.offsetTop-70:0))),behavior:"smooth"});}catch(_){}},60);
});

(function(){
  var css=
  /* サブ画面：上の帯を隠し、見出しを上に詰める */
  'body.p67-sub header.app{display:none!important}'+
  'body.p67-sub #main{padding-top:calc(6px + env(safe-area-inset-top))!important}'+
  '.p51-head h2,.p51-head .p51-title{font-size:20px!important;letter-spacing:.01em}'+
  /* 単語カード：単語と音声ボタンを分けて折り返す */
  '.p52-dw{display:flex!important;flex-wrap:wrap;align-items:center;justify-content:center;gap:6px 10px;line-height:1.15;overflow-wrap:anywhere}'+
  '.p52-dw .p52-spk{flex:0 0 auto}'+
  '.p52-dk{margin-top:6px!important}.p52-dexp{line-height:1.75!important;font-size:14px!important}'+
  '.p52-dex b{font-size:16px!important;line-height:1.5}.p52-dex span{line-height:1.6}'+
  /* 4択の選択肢：押しやすく、文字は読みやすく */
  '.p52-opt{min-height:56px!important;border-radius:14px!important}.p52-opt .p52-t{font-size:16px!important;line-height:1.4}'+
  /* 瞬間作文カード */
  '.study .qcard .jp{font-size:19px!important;line-height:1.6!important}.study .qcard .accent{font-size:24px!important;line-height:1.45!important}'+
  '.study .qcard .kana{font-size:14px!important;opacity:.85;margin-top:6px!important}'+
  '.study .extrabtn{border-radius:12px!important}.study .easy{line-height:1.75!important}'+
  '.study details.more>summary{font-weight:700}.study .gd{line-height:1.8!important}'+
  /* 結果画面：ボタンを画面下に固定 */
  'body.p67-result #main .p50-btns{position:fixed;left:0;right:0;bottom:calc(57px + env(safe-area-inset-bottom));z-index:25;background:var(--bg);padding:10px max(16px,calc(50% - 284px));margin:0!important;border-top:1px solid var(--line)}'+
  'body.p67-result #main{padding-bottom:150px}'+
  /* リスニングの設定の畳み */
  '.p67-lisset{margin-top:14px;border:1px solid var(--line);border-radius:16px;background:var(--card);padding:0 14px}'+
  '.p67-lisset>summary{list-style:none;cursor:pointer;padding:14px 0;font-weight:700;display:flex;justify-content:space-between;align-items:center}'+
  '.p67-lisset>summary::-webkit-details-marker{display:none}.p67-lisset>summary::after{content:"＋";color:var(--muted);font-weight:400}.p67-lisset[open]>summary::after{content:"－"}'+
  '.p67-lisset[open]{padding-bottom:14px}.p67-lisset .h2:first-of-type{margin-top:0}'+
  /* 全体：カードの角・行間をそろえる */
  '#main .card,#main .p48-card,#main .p47-card{border-radius:16px}'+
  'body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility}'+
  'button{-webkit-tap-highlight-color:transparent}'+
  /* リスニング：「前へ」「次へ」のアイコンの向きが逆だったので反転 */
  '[data-act="lisprev"] svg,[data-act="lisnext"] svg{transform:scaleX(-1)}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();

/* ===== PHASE67-B1: B1（中級）の追加分を画面に反映（ロシア語のみ。B1データがない言語では何もしない） ===== */
if(P_LVLS.indexOf("B1")>=0){
  /* 上の帯とタブ名 */
  try{var _hs=document.getElementById("hsub");if(_hs)_hs.textContent=_hs.textContent.replace(/A1\s*\/\s*A2/,"A1〜B1");document.title=document.title.replace("A1・A2","A1〜B1");}catch(_){}
  /* 文法別練習に B1 の10項目を追加 */
  var P67_B1GP=[["仮定法","仮定法 бы（もし〜なら）"],["関係代名詞","関係代名詞 кото́рый"],["形動詞","形動詞（〜している…・〜された…）"],["副動詞","副動詞（〜しながら・〜してから）"],
    ["移動動詞・接頭辞","接頭辞つきの移動動詞"],["間接話法","間接話法・〜かどうか"],["時・条件・譲歩","時・理由・譲歩をつなぐ"],["受け身","受け身（〜される）"],
    ["不定・否定代名詞","誰か・何か／誰も〜ない"],["意見・議論","意見を述べる・比べる"],
    ["複数形の格","複数形の格変化"],["動詞と格","動詞と格の組み合わせ"]];
  P67_B1GP.forEach(function(d,i){var ids=COMPOSE.filter(function(c){return c.grammarPoint===d[0];}).map(function(c){return c.id;});
    if(ids.length)GROUPS.push({id:"b1_"+i,title:"B1："+d[1],count:ids.length,composeIds:ids});});
  /* 文法ノート：B1 の項目を追加（ユニットの解説＋例文2つ） */
  P67_B1GP.forEach(function(d){
    var cs=COMPOSE.filter(function(c){return c.grammarPoint===d[0];});if(!cs.length)return;
    P46_NOTES.push({key:"b1_"+d[0],title:d[1],lv:"B1",gps:[d[0]],body:function(){
      return '<p style="line-height:1.8;margin:4px 0 10px">'+esc(cs[0].gDetail)+'</p><ul>'+cs.slice(0,2).map(function(c){
        return '<li><span class="p46ex">'+esc(c.accent||c.ru)+'</span><br><span class="small muted">'+esc(c.ja)+'</span></li>';}).join("")+'</ul>';}});
  });
  var _p67Gn=renderGrammarNotes;
  renderGrammarNotes=function(){return String(_p67Gn.apply(this,arguments)).replace("A2（ТБУ・基礎レベル）までに必要な文法の早見表です。","A1 から B1（中級）までの文法の早見表です。");};
  /* 文法の達成度：B1 の項目も並べる */
  var P67_B1CAN={"仮定法":"「もし〜なら」・ていねいな頼み方ができる","関係代名詞":"名詞を文で詳しく説明できる（すべての格）","形動詞":"書き言葉の「〜している…」を読み取れる",
    "副動詞":"「〜しながら」「〜してから」を一文で言える","移動動詞・接頭辞":"入る・出る・寄る・渡るを言い分けられる","間接話法":"人の話を伝え、「〜かどうか」を聞ける",
    "時・条件・譲歩":"「〜する前に・〜なのに・〜するとすぐ」でつなげる","受け身":"「〜される・〜された」を言える・読める","不定・否定代名詞":"「誰か・何か」と「誰も〜ない」を使い分けられる","意見・議論":"賛成・反対・比較を理由つきで言える","複数形の格":"複数の名詞・形容詞をすべての格で使える","動詞と格":"занима́ться＋造格など、動詞ごとの格を使える"};
  P67_B1GP.forEach(function(d){if(COMPOSE.some(function(c){return c.grammarPoint===d[0];}))P46_A2.push(["B1："+d[1],P67_B1CAN[d[0]]||"",[d[0]]]);});
  if(typeof SHOW_LEVELS!=="undefined"&&SHOW_LEVELS.indexOf("B1")<0)SHOW_LEVELS.push("B1");
  var _p67A2c=renderA2Check;
  renderA2Check=function(){return String(_p67A2c.apply(this,arguments)).replace(/目安：A2 は ТБУ（基礎レベル・ТРКИ-1の一つ手前）相当。/,"目安：A2 は ТБУ（基礎レベル）、B1 は ТРКИ-1（日常生活と仕事で困らないレベル）相当。");};
  LEARN_ITEMS.forEach(function(it){if(it[0]==="gnote")it[2]="B1までの文法早見表";if(it[0]==="a2check"){it[1]="文法の達成度";it[2]="A1〜B1の文法項目ごとの進み具合";}});
  /* リスニング・単語検索：B1 で絞り込めるように */
  var _p67Blq=buildListenQueue;
  buildListenQueue=function(f){if(f==="b1")return baseLevel("B1");return _p67Blq.apply(this,arguments);};
  var _p67Lt=listenTitle;
  listenTitle=function(f){return f==="b1"?"B1コレクション":_p67Lt.apply(this,arguments);};
  var _p67Lis=renderListening;
  renderListening=function(){var L=ui.listen||{};return String(_p67Lis.apply(this,arguments)).replace(/(<button type="button" data-act="lisfilter" data-val="a2"[^>]*>A2<\/button>)/,
    '$1<button type="button" data-act="lisfilter" data-val="b1" class="'+(L.filter==="b1"?"on":"")+'">B1</button>').replace("露 速度<br>","読む速さ<br>");};
  var _p67Ws=renderWordSearch;
  renderWordSearch=function(){var s=ui.search||{};return String(_p67Ws.apply(this,arguments)).replace(/(<button type="button" data-act="searchlevel" data-val="A2"[^>]*>A2<\/button>)/,
    '$1<button type="button" data-act="searchlevel" data-val="B1" class="'+(s.level==="B1"?"on":"")+'">B1</button>');};
  /* 「A2カバー状況」の呼び名を「文法の達成度」にそろえる */
  try{if(typeof P51_TITLES!=="undefined")P51_TITLES.a2check="文法の達成度";}catch(_){}
  var _p67RenderB1=render;
  render=function(){var r=_p67RenderB1.apply(this,arguments);
    try{var m=document.getElementById("main");if(m){var a=m.querySelectorAll(".p60-rowlink span,.p56-link,.p51-head h2,.p51-head .p51-title");
      for(var i=0;i<a.length;i++){var t=a[i].textContent;if(/A2の文法項目ごとの達成度|A2カバー状況/.test(t))a[i].textContent=t.replace(/A2の文法項目ごとの達成度/,"文法項目ごとの達成度（A1〜B1）").replace("A2カバー状況","文法の達成度");}}}catch(_){}
    return r;};
}

/* ===== PHASE67-2: レビュー指摘の修正（全言語共通） ===== */
/* 瞬間作文の一覧：「各20文」をやめ、B1 のユニットの前に見出しを入れる */
var _p67Cs=renderComposeSelect;
renderComposeSelect=function(){var h=String(_p67Cs.apply(this,arguments)).replace("ユニットで選ぶ（各20文）","ユニットで選ぶ");
  var b=-1;for(var i=0;i<UNITS.length;i++){if(COMPOSE.some(function(c){return c.unit===UNITS[i]&&c.level==="B1";})){b=i;break;}}
  if(b>=0)h=h.replace('<div class="row2" data-act="cunit" data-val="'+b+'"','<div class="h2">B1 ・ 中級</div><div class="row2" data-act="cunit" data-val="'+b+'"');
  return h;};
/* リスニング：0語のときに「0語中 1語目」と出さない */
var _p67Lis2=renderListening;
renderListening=function(){return String(_p67Lis2.apply(this,arguments)).replace(/>0語中 1語目</,">対象の単語がありません<");};
/* 設定：クラウドに保存できていないときは「Claudeアカウントに保存」の一文を出さない */
var _p67Set=renderSettings;
renderSettings=function(){var h=String(_p67Set.apply(this,arguments));
  if(typeof P50==="undefined"||P50.state!=="cloud")h=h.replace("記録はClaudeアカウントに保存されるので、どこから開いても同じです。","");return h;};

/* ===== PHASE67-3: 2回目のご要望 =====
   - 例文・単語分解：それぞれに読み上げボタンとカタカナ読み
   - 記録画面：上の帯を消して余白を詰める／日ごとの記録／まとめて練習の周回数（レベル別・全体）
   - まとめて練習：レベル（A1・A2・B1）を選んで回せる */
var P67_KANA=/*P67K*/{}/*P67KE*/;
function p67Kana(t){t=String(t||"").trim();return P67_KANA[t]||P67_KANA[t.replace(/[,.!?»:;]+$/,"")]||"";}
function p67SpkBtn(t){return '<button type="button" class="p67-spk" data-act="p67say" data-val="'+esc(t)+'" aria-label="読み上げ"><svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg></button>';}
function p67AddReading(root){
  /* キルギス語版はロシア語の読み上げにならないよう対象外 */
  if(!root||P47_LANG!=="ru")return;
  /* 例文（単語カード・単語の詳細・まとめて練習の詳細） */
  root.querySelectorAll(".p52-dex b,.p15-exru,.easy > div[style*='font-weight:700']").forEach(function(el){
    if(el.getAttribute("data-p67r"))return;var t=el.textContent.trim();if(!/[А-Яа-яЁё]/.test(t))return;el.setAttribute("data-p67r","1");
    var k=p67Kana(t),wrap=document.createElement("div");wrap.className="p67-read";
    wrap.innerHTML=p67SpkBtn(t)+(k?'<span class="p67-k">'+esc(k)+'</span>':'');el.parentNode.insertBefore(wrap,el.nextSibling);
  });
  /* 単語分解の1語ずつ */
  root.querySelectorAll(".bdc .top").forEach(function(top){
    if(top.getAttribute("data-p67r"))return;var sf=top.querySelector(".sf");if(!sf)return;top.setAttribute("data-p67r","1");
    var t=sf.textContent.trim(),k=p67Kana(t);
    var s=document.createElement("span");s.className="p67-bdr";s.innerHTML=(k?'<span class="p67-k">'+esc(k)+'</span>':'')+p67SpkBtn(t);top.insertBefore(s,sf.nextSibling);
  });
}
document.addEventListener("click",function(e){var el=e.target.closest&&e.target.closest('[data-act="p67say"]');if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();speak(el.getAttribute("data-val"),0.85);},true);
/* 描画のたびに、読み方を足し、記録画面では上の帯を消す */
var _p67R3=render;
render=function(){var r=_p67R3.apply(this,arguments);
  try{p67AddReading(document.getElementById("main"));
    if(ui.bnav==="stats"&&!ui.learnOpen)document.body.classList.add("p67-sub");}catch(_){}
  return r;};
/* 単語の詳細シートなど、render 以外で開く画面にも読み方を付ける */
try{var _p67sh=document.getElementById("sheetHost");if(_p67sh)new MutationObserver(function(){p67AddReading(_p67sh);}).observe(_p67sh,{childList:true,subtree:true});}catch(_){}

/* ---- まとめて練習：レベルで絞って回す（周回数はレベル×範囲ごとに別々に数える） ---- */
function p67Split(s){var a=String(s||"").split("@");return {t:(["word","phrase","all"].indexOf(a[0])>=0?a[0]:"all"),lv:(P_LVLS.indexOf(a[1])>=0?a[1]:"")};}
p36Scope=function(){var t=(["word","phrase","all"].indexOf(ui.chalScope)>=0)?ui.chalScope:p67Split(ui.chalScope).t;var lv=P_LVLS.indexOf(ui.chalLevel)>=0?ui.chalLevel:"";return t+(lv?"@"+lv:"");};
var _p67ScIds=p36ScopeIds;
p36ScopeIds=function(scope){var s=p67Split(scope),ids=_p67ScIds(s.t);if(!s.lv)return ids;return ids.filter(function(id){var w=byId(id);return w&&w.level===s.lv;});};
var _p67ScLab=p36ScopeLabel;
p36ScopeLabel=function(scope){var s=p67Split(scope||p36Scope());return (s.lv?s.lv+" ・ ":"")+_p67ScLab(s.t);};
var _p67Start=p36Start;
p36Start=function(scope){var s=p67Split(scope);ui.chalLevel=s.lv;ui.chalScope=s.t;
  var key=s.t+(s.lv?"@"+s.lv:"");if(!s.lv)return _p67Start(s.t);
  /* レベル付きの範囲：元の処理は範囲名を3種類に限っているので、同じ流れをここで行う */
  ui.chalPick=false;var saved=p36SavedState(key);
  if(saved&&saved.list&&saved.list.length&&saved.pos<saved.list.length-1&&saved.list.every(function(id){return !!byId(id);})){
    ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;
    startSessionFromIds(saved.list,"チャレンジモード","reinforce",{type:"all",allLevels:true,chal:key},saved.pos);p32SpeakCurrent();return;}
  p35StartLap(false);};
/* 1周終わったら、その日の記録にも残す */
var _p67Lap=p35StartLap;
p35StartLap=function(next){if(next){try{var d=dayRec();d.lapsDone=(d.lapsDone||0)+1;d.lapsBy=d.lapsBy||{};var sc=p36Scope();d.lapsBy[sc]=(d.lapsBy[sc]||0)+1;}catch(_){}}
  return _p67Lap.apply(this,arguments);};
/* 範囲の選択画面：上にレベルの切り替えを置く */
var _p67Pick=p36RenderScopePick;
p36RenderScopePick=function(){
  var cur=P_LVLS.indexOf(ui.chalLevel)>=0?ui.chalLevel:"";
  var seg='<div class="p67-lvseg" role="tablist">'+[""].concat(P_LVLS).map(function(l){return '<button type="button" data-act="p67chlv" data-val="'+l+'" class="'+(cur===l?"on":"")+'">'+(l||"全レベル")+'</button>';}).join("")+'</div>';
  var h=String(_p67Pick.apply(this,arguments));
  if(cur){/* 各行の件数・周回・行き先をレベル付きの範囲に差し替える */
    P36SCOPES.forEach(function(sp){var key=sp[0]+"@"+cur,ids=p36ScopeIds(key),st=p36SavedState(key),lap=p35Lap(key),done=p35LapDone(key);
      var mid=(st&&st.list&&st.list.length&&st.pos<st.list.length-1),pct=mid?Math.round((st.pos+1)/st.list.length*100):0;
      var stat=mid?(lap+'周目 ・ '+(st.pos+1)+' / '+st.list.length):(done>0?('通算 '+done+'周 ・ 次は'+lap+'周目'):'まだ始めていません');
      h=h.replace(new RegExp('data-act="chalscope" data-val="'+sp[0]+'"([\\s\\S]*?)<em>[^<]*</em>([\\s\\S]*?)<span class="p49-scopebar"><i style="width:[^"]*"></i></span><span class="p49-scopestat">[\\s\\S]*?</span></span>'),
        function(m,a,b){return 'data-act="chalscope" data-val="'+key+'"'+a+'<em>'+ids.length.toLocaleString()+'語</em>'+b+'<span class="p49-scopebar"><i style="width:'+pct+'%"></i></span><span class="p49-scopestat">'+(mid?'<b>続きから</b> ・ ':'')+esc(stat)+'</span></span>';});
    });
    h=h.replace(/ class="p49-scope on"/g,' class="p49-scope"');
  }
  return h.replace(/(<div class="p49-pickbody"><h2>まとめて練習<\/h2><p>[^<]*<\/p>)/,'$1'+seg).replace("全部の単語を順番に見ていく周回モードです。","単語を順番に全部見ていく周回モードです。レベルと範囲を選んでください。").replace("単語とフレーズは思い出し方が違うので、回す範囲を選んでください。","");
};
document.addEventListener("click",function(e){var el=e.target.closest&&e.target.closest('[data-act="p67chlv"]');if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();ui.chalLevel=el.getAttribute("data-val")||"";saveUI();render();},true);

/* ---- 記録画面：まとめて練習の周回数と、日ごとの記録 ---- */
function p67LapsBy(){var by=(appHist.totals&&appHist.totals.reinforceLapsBy)||{},r={total:0};["", ].concat(P_LVLS).forEach(function(l){r[l||"all"]=0;});
  Object.keys(by).forEach(function(k){var s=p67Split(k),n=by[k]|0;r.total+=n;r[s.lv||"all"]+=n;});return r;}
var _p67St=renderP48Stats;
renderP48Stats=function(){
  var h=String(_p67St.apply(this,arguments)),L=p67LapsBy();
  var laps='<div class="p60-h">まとめて練習の周回<small>通算</small></div><div class="p60-list p67-laps">'+
    '<div class="p67-lap"><b>'+L.total+'</b><span>合計</span></div><div class="p67-lap"><b>'+L.all+'</b><span>全レベル</span></div>'+
    P_LVLS.map(function(l){return '<div class="p67-lap"><b>'+L[l]+'</b><span>'+l+'</span></div>';}).join("")+'</div>';
  /* 日ごとの記録（直近14日のうち学習した日） */
  var rows=[],wd=["日","月","火","水","木","金","土"];
  for(var i=0;i<14;i++){var dt=new Date();dt.setDate(dt.getDate()-i);var k=todayKey(dt),d=appHist.days[k];if(!d)continue;
    var parts=[];if(d.newWords)parts.push("新しい単語 "+d.newWords);if(d.reviewedWords)parts.push("復習 "+d.reviewedWords);
    if(!d.newWords&&!d.reviewedWords&&d.studiedWords)parts.push("単語 "+d.studiedWords);
    if(d.composeCount)parts.push("作文 "+d.composeCount+"文");if(d.reinforceCount)parts.push("まとめて "+d.reinforceCount+"語");
    if(d.lapsDone)parts.push("周回 "+d.lapsDone+"周");if(d.listeningCount)parts.push("リスニング "+d.listeningCount+"語");
    if(!parts.length)continue;var min=Math.round((d.studySeconds||0)/60);
    rows.push('<div class="p67-day"><div class="p67-dd"><b>'+(i===0?"今日":i===1?"昨日":(dt.getMonth()+1)+"/"+dt.getDate())+'</b><small>'+wd[dt.getDay()]+'</small></div><div class="p67-dp">'+parts.map(function(p){return '<span>'+esc(p)+'</span>';}).join("")+'</div>'+(min?'<em>'+min+'分</em>':'')+'</div>');}
  var days='<div class="p60-h">日ごとの記録<small>直近14日</small></div><div class="p60-list">'+(rows.length?rows.join(""):'<div class="p67-day p67-empty">まだ記録がありません。学習するとここに日ごとの内容が出ます。</div>')+'</div>';
  var mark='<div class="p60-h">復習の予定';
  return h.indexOf(mark)>=0?h.replace(mark,laps+days+mark):h+laps+days;
};
(function(){var css=
  'html{padding-top:0!important}'+
  '.p67-read{display:flex;align-items:center;gap:8px;margin:4px 0 2px;flex-wrap:wrap}'+
  '.p67-k{color:var(--sub);font-size:13px;font-weight:700;line-height:1.5}'+
  '.p67-spk{flex:none;width:32px;height:32px;border-radius:50%;border:1px solid var(--lineStrong);background:var(--card2);color:var(--ink);display:inline-flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
  '.p67-spk:active{transform:scale(.94)}'+
  '.p67-bdr{display:inline-flex;align-items:center;gap:6px;margin-left:auto}.bdc .top{align-items:center!important}'+
  '.p67-lvseg{display:flex;gap:6px;margin:4px 0 14px;padding:4px;background:var(--card2);border-radius:12px}'+
  '.p67-lvseg button{flex:1;min-height:40px;border:none;border-radius:9px;background:transparent;color:var(--muted);font-weight:800;font-size:14px;cursor:pointer}'+
  '.p67-lvseg button.on{background:var(--accent);color:#fff}'+
  '.p67-laps{display:flex;padding:14px 6px!important}.p67-lap{flex:1;text-align:center}.p67-lap b{display:block;font-size:22px;font-weight:800}.p67-lap span{font-size:12px;color:var(--muted)}'+
  '.p67-day{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border-bottom:1px solid var(--line)}.p67-day:last-child{border-bottom:none}'+
  '.p67-dd{width:44px;flex:none}.p67-dd b{display:block;font-size:14px}.p67-dd small{color:var(--muted);font-size:11px}'+
  '.p67-dp{flex:1;display:flex;flex-wrap:wrap;gap:6px}.p67-dp span{font-size:12.5px;background:var(--card2);border-radius:8px;padding:3px 8px;color:var(--ink)}'+
  '.p67-day em{font-style:normal;color:var(--muted);font-size:12px;flex:none;padding-top:3px}.p67-empty{color:var(--muted);font-size:13px}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}})();

/* ===== PHASE67-4: オリジナルの絵（art:キー）を表示できるようにする ===== */
var _p67Fill=p66Fill;
p66Fill=function(d,pic){
  var m=/^art:(\w+)$/.exec(String(pic||""));
  if(m&&P67_ART[m[1]]){var _u=(p66Fill._n=(p66Fill._n||0)+1);d.innerHTML=P67_ART[m[1]].replace(/\b(a3(?:c|sky|wall|cool|stage))\b/g,"$1_"+_u);d.classList.add("p66-img","p67-art");return;}
  if(d.classList&&d.classList.contains("p67-art"))return; /* 画像の読み込み後の再描画で絵の中の文字を絵文字扱いしない */
  return _p67Fill.apply(this,arguments);
};
(function(){try{var st=document.createElement("style");st.textContent='.p59-pic.p67-art svg{width:84px;height:84px;display:block}.p59-pic.sm.p67-art svg{width:60px;height:60px}';document.head.appendChild(st);}catch(_){}})();

/* ===== PHASE67-5: 見やすさの改善（デザインレビューの指摘） =====
   1) 青いボタンの白文字のコントラスト不足（3.65:1）→ 濃い青 #0066CC（5.57:1）
   2) 下のタブ・補足の灰色文字が小さく薄い → 11px／#8E8E93
   3) 押す場所を 44px 以上に
   4) 補足の文字（例文の訳・読み方・カードの説明）を大きく
   5) 作文の解説を開いたら、問題文がカードの上に見えるように戻す */
(function(){var css=
  ':root{--mutedSoft:#8E8E93}'+
  '.p47-cta,.p52-next,.ans3btn.a-ok,.p67-lvseg button.on,.seg button.on,.filtertabs button.on,.p47-btn.primary{background:#0066CC!important;background-image:none!important}'+
  'nav.bnav button{font-size:11px!important;padding:8px 1px 8px!important}'+
  'header.app p{font-size:12px!important}'+
  '.p67-spk,.p52-spk,.p52-bm{width:44px!important;height:44px!important;min-width:44px}'+
  '.p60-link{padding:12px 0 12px 16px!important}.p47-more{min-height:44px}.p56-goal{padding-top:12px!important;padding-bottom:12px!important}'+
  '.star{min-width:44px;min-height:44px}'+
  '.p52-dex span,.p67-k{font-size:14px!important}.p47-cardtxt small{font-size:13.5px!important}.p52-dexp{font-size:15px!important}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}})();
