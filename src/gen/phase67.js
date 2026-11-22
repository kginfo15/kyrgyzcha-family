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
    if(card&&easy)card.scrollTo({top:Math.max(0,easy.offsetTop-80),behavior:"smooth"});}catch(_){}},60);
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
  'body.p67-result #main .p50-btns{position:sticky;bottom:0;z-index:20;background:var(--bg);padding:10px 0 calc(10px + env(safe-area-inset-bottom));margin-top:14px!important;border-top:1px solid var(--line)}'+
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
    ["不定・否定代名詞","誰か・何か／誰も〜ない"],["意見・議論","意見を述べる・比べる"]];
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
    "時・条件・譲歩":"「〜する前に・〜なのに・〜するとすぐ」でつなげる","受け身":"「〜される・〜された」を言える・読める","不定・否定代名詞":"「誰か・何か」と「誰も〜ない」を使い分けられる","意見・議論":"賛成・反対・比較を理由つきで言える"};
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
