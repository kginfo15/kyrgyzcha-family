/* ===== PHASE68: 3回目のご要望 =====
   1) 文法の専門用語（完了体・生格など）に、やさしい言いかえを自動で添える（最初の1回は（ ）で、2回目からは点線。タップで説明）
   2) 解説・単語分解の入れ子を減らして、横幅いっぱいに読みやすく
   3) ブックマーク：いつ登録したかを記録・表示し、一覧ページを作る
   4) ブックマークした単語からチャンク（よく一緒に使う短いフレーズ）を作る */

/* ---------- 1) 用語のやさしい説明 ---------- */
var P68_TERMS=[
 ["不完了体","くり返し・途中の動作の形","動作のくり返し・習慣・している最中を表す動詞の形。例：читать（読む／読んでいる）。"],
 ["完了体","1回でやり終える形","1回で終わる動作や、やり終えた結果を表す動詞の形。例：прочитать（読み終える）。"],
 ["主格","「〜が・〜は」の形","主語になる形。辞書に載っている形と同じです。"],
 ["生格","「〜の・〜がない」の形","「〜の」（持ち主）、「〜がない」、数のあとなどで使う形。"],
 ["与格","「〜に」の形","「〜に（あげる・言う）」の相手を表す形。"],
 ["対格","「〜を」の形","「〜を」（動作の相手）や、行き先「〜へ」を表す形。"],
 ["造格","「〜で・〜と一緒に」の形","道具「〜で」、「〜と一緒に（с＋この形）」、職業「〜として」を表す形。"],
 ["前置格","「〜で（場所）・〜について」の形","в・на のあとの場所「〜で」や、о（〜について）のあとで使う形。"],
 ["格変化","役割による語尾の変化","名詞や形容詞の語尾が、文の中の役割（〜が・〜を・〜に など）で変わること。"],
 ["短語尾","形容詞の短い形","「〜だ」と述べるときに使う、形容詞の短い形。例：рад（うれしい）。"],
 ["形動詞","動詞からできた形容詞","「〜している〇〇」「〜された〇〇」のように、名詞を説明する動詞の形。"],
 ["副動詞","「〜しながら・〜してから」の形","主な動作に添えて「〜しながら」「〜してから」を表す動詞の形。"],
 ["再帰動詞","-ся が付く動詞","-ся（-сь）で終わる動詞。「自分を〜する」「お互いに〜する」などを表します。"],
 ["命令形","「〜して（ください）」の形","人にお願い・指示をするときの動詞の形。"],
 ["接頭辞","単語の頭に付く部分","動詞などの頭に付けて意味を足す部分。例：при-（来る）、у-（去る）。"],
 ["語幹","変わらない部分","語尾を取った、単語の中心の部分。"],
 ["比較級","「より〜」の形","2つを比べて「より〜」を表す形。例：больше（より多く）。"],
 ["最上級","「最も〜」の形","「一番〜」を表す形。例：самый（最も）。"],
 ["不定形","辞書に載っている動詞の形","-ть などで終わる、動詞の元の形。"],
 ["不定詞","辞書に載っている動詞の形","-ть などで終わる、動詞の元の形。"],
 ["関係代名詞","名詞をくわしく説明する文をつなぐ言葉","который など。「〜するところの〇〇」のように前の名詞を説明します。"],
 ["他動詞","「〜を」をとる動詞","「〜を」にあたる言葉（対格）がいっしょに来る動詞。"],
 ["自動詞","「〜を」をとらない動詞","「〜を」にあたる言葉がいらない動詞。"],
 ["目的語","「〜を」にあたる言葉","動作を受ける相手・もの。"],
 ["述語","「どうする・どんなだ」にあたる部分","文の最後に「何をする・どんな状態か」を言う部分。"],
 ["中性名詞","名詞のグループの1つ（-о・-е で終わることが多い）","ロシア語の名詞は男性・女性・中性の3つのグループに分かれ、形容詞などの語尾が変わります。"],
 ["男性名詞","名詞のグループの1つ（子音で終わることが多い）","ロシア語の名詞は男性・女性・中性の3つのグループに分かれ、形容詞などの語尾が変わります。"],
 ["女性名詞","名詞のグループの1つ（-а・-я で終わることが多い）","ロシア語の名詞は男性・女性・中性の3つのグループに分かれ、形容詞などの語尾が変わります。"],
 ["活用","主語などによる形の変化","主語（私・あなた・彼…）や時（いま・過去・未来）によって動詞の形が変わること。"],
 ["1人称","「私・私たち」","話している本人。1人称＝私、2人称＝あなた、3人称＝彼・彼女・それ。"],
 ["2人称","「あなた・あなたたち」","話している相手。1人称＝私、2人称＝あなた、3人称＝彼・彼女・それ。"],
 ["3人称","「彼・彼女・それ」","話している人と相手以外。1人称＝私、2人称＝あなた、3人称＝彼・彼女・それ。"]
];
var P68_MAP={},P68_RE=null;
(function(){P68_TERMS.forEach(function(t){P68_MAP[t[0]]=t;});
  var keys=P68_TERMS.map(function(t){return t[0];}).sort(function(a,b){return b.length-a.length;});
  P68_RE=new RegExp(keys.join("|"),"g");})();
var P68_SKIP={BUTTON:1,A:1,INPUT:1,TEXTAREA:1,SELECT:1,OPTION:1,SCRIPT:1,STYLE:1,SUMMARY:1,LABEL:1,H1:1,H2:1};
function p68Gloss(root){
  if(!root||!root.querySelectorAll)return;
  var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:function(n){
    if(!n.nodeValue||n.nodeValue.length<2)return NodeFilter.FILTER_REJECT;P68_RE.lastIndex=0;if(!P68_RE.test(n.nodeValue))return NodeFilter.FILTER_REJECT;
    for(var e=n.parentNode;e&&e!==root;e=e.parentNode){if(e.nodeType!==1)continue;if(P68_SKIP[e.tagName]||(e.namespaceURI&&e.namespaceURI.indexOf("svg")>=0))return NodeFilter.FILTER_REJECT;
      var c=e.className&&typeof e.className==="string"?e.className:"";if(/\bp68-|tagpill|p47-tile|p56-search|bnav|tabbar/.test(c))return NodeFilter.FILTER_REJECT;}
    /* 見出しや短いラベル（カテゴリ名など）には付けない */
    var blk=n.parentNode;while(blk&&blk!==root&&blk.nodeType===1&&/^(B|STRONG|EM|SPAN|I|SMALL)$/.test(blk.tagName))blk=blk.parentNode;
    if(blk&&blk.textContent&&blk.textContent.replace(/\s+/g,"").length<16)return NodeFilter.FILTER_REJECT;
    return NodeFilter.FILTER_ACCEPT;}});
  var list=[],done={};while(tw.nextNode())list.push(tw.currentNode);
  list.forEach(function(n){
    var s=n.nodeValue,frag=document.createDocumentFragment(),last=0;P68_RE.lastIndex=0;var m;
    while((m=P68_RE.exec(s))){var t=P68_MAP[m[0]];if(!t)continue;
      frag.appendChild(document.createTextNode(s.slice(last,m.index)));
      var sp=document.createElement("span");sp.className="p68-t";sp.setAttribute("data-g",m[0]);sp.textContent=m[0];frag.appendChild(sp);
      var after=s.slice(m.index+m[0].length,m.index+m[0].length+1);
      /* 画面の中で最初の1回だけ、やさしい言いかえを（ ）で添える。すぐ後ろに「（」がある場合は付けない */
      if(!done[m[0]]&&!document.querySelector('.p68-g[data-g="'+m[0]+'"]')&&after!=="（"&&after!=="("){
        done[m[0]]=1;var g=document.createElement("span");g.className="p68-g"+(t[1].length>14?" p68-gl":"");g.setAttribute("data-g",m[0]);g.textContent=t[1];frag.appendChild(g);
      }
      last=m.index+m[0].length;}
    frag.appendChild(document.createTextNode(s.slice(last)));
    if(n.parentNode)n.parentNode.replaceChild(frag,n);
  });
}
function p68Pop(el){
  var t=P68_MAP[el.getAttribute("data-g")];if(!t)return;
  var p=document.getElementById("p68pop");if(!p){p=document.createElement("div");p.id="p68pop";p.className="p68-pop";document.body.appendChild(p);}
  p.innerHTML='<b>'+esc(t[0])+'</b><span class="p68-pop1">'+esc(t[1])+'</span><span class="p68-pop2">'+esc(t[2])+'</span>';
  p.style.display="block";var r=el.getBoundingClientRect(),w=Math.min(300,window.innerWidth-24);p.style.width=w+"px";
  var x=Math.max(12,Math.min(window.innerWidth-w-12,r.left+r.width/2-w/2));p.style.left=x+"px";
  var y=r.bottom+8;p.style.top=y+"px";var ph=p.offsetHeight;if(y+ph>window.innerHeight-90)p.style.top=Math.max(12,r.top-ph-8)+"px";
}
function p68PopHide(){var p=document.getElementById("p68pop");if(p)p.style.display="none";}
window.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest(".p68-t,.p68-g");
  if(el){e.stopImmediatePropagation();e.preventDefault();var t=el.classList.contains("p68-g")?el.previousSibling:el;if(t&&t.classList&&t.classList.contains("p68-t"))p68Pop(t);return;}
  if(!(e.target.closest&&e.target.closest("#p68pop")))p68PopHide();
},true);
window.addEventListener("scroll",p68PopHide,{passive:true});
var _p68R=render;
render=function(){var r=_p68R.apply(this,arguments);p68PopHide();try{p68Gloss(document.getElementById("main"));}catch(_){}return r;};
try{var _p68sh=document.getElementById("sheetHost");if(_p68sh)new MutationObserver(function(){try{p68Gloss(_p68sh);}catch(_){}}).observe(_p68sh,{childList:true,subtree:true});}catch(_){}
/* 解説の中で、あとから開く部分（解説を見る・もっと見る）にも付ける */
try{var _p68mn=document.getElementById("main");if(_p68mn)new MutationObserver(function(ms){if(ms.some(function(m){return m.addedNodes.length&&!(m.addedNodes[0].className&&String(m.addedNodes[0].className).indexOf("p68-")===0);}))try{p68Gloss(_p68mn);}catch(_){}}).observe(_p68mn,{childList:true,subtree:true});}catch(_){}
/* 文法ノートの先頭に、用語のやさしい説明の一覧 */
if(typeof renderGrammarNotes==="function"){
  var _p68Gn=renderGrammarNotes;
  renderGrammarNotes=function(){
    var used=P68_TERMS.filter(function(t){return P47_LANG==="ru"||!/体$/.test(t[0]);});
    var box='<details class="p68-gloss"><summary>むずかしい用語のやさしい説明</summary><div class="p68-glist">'+used.map(function(t){return '<div class="p68-gi"><b>'+esc(t[0])+'</b><span>'+esc(t[1])+'</span><small>'+esc(t[2])+'</small></div>';}).join("")+'</div></details>';
    return box+String(_p68Gn.apply(this,arguments));};
}

/* ---------- 3) ブックマーク：登録日を記録 ---------- */
window.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest('[data-act="fav"],[data-act="lisfav"],[data-act="cfav"]');if(!el)return;
  var a=el.getAttribute("data-act"),id=el.getAttribute("data-val");if(!id)return;
  var store=a==="cfav"?cprogress:progress,before=!!(store[id]&&store[id].favorite);
  setTimeout(function(){var p=store[id];if(!p)return;var now=!!p.favorite;
    if(now&&!before){p.favAt=Date.now();try{saveAll();}catch(_){}}
    else if(!now&&before&&p.favAt){delete p.favAt;try{saveAll();}catch(_){}}},0);
},true);
function p68FavDate(ts){if(!ts)return "以前に登録";var d=new Date(ts),t=new Date();t.setHours(0,0,0,0);var dd=new Date(d);dd.setHours(0,0,0,0);
  var diff=Math.round((t-dd)/86400000);return diff===0?"今日":diff===1?"昨日":(d.getFullYear()!==t.getFullYear()?d.getFullYear()+"/":"")+(d.getMonth()+1)+"月"+d.getDate()+"日";}
function p68FavIds(){return VOCAB.filter(function(w){return progress[w.id]&&progress[w.id].favorite;}).sort(function(a,b){return (progress[b.id].favAt||0)-(progress[a.id].favAt||0);}).map(function(w){return w.id;});}

/* ---------- 3') ブックマーク一覧ページ（単語検索の画面を借りて表示） ---------- */
var P68C=null; /* チャンク作成の状態 */
function p68LoadChunks(){try{return JSON.parse(localStorage.getItem("p68chunks_"+P47_LANG)||"null")||{list:[],at:0};}catch(_){return {list:[],at:0};}}
function p68SaveChunks(c){try{localStorage.setItem("p68chunks_"+P47_LANG,JSON.stringify(c));}catch(_){}}
function p68RenderBm(){
  var ids=p68FavIds(),h='';
  if(!ids.length)return '<div class="empty">まだブックマークした単語がありません。単語カードの右上の印をタップすると、ここに集まります。</div>';
  h+='<div class="p68-bmtop"><div><b>'+ids.length+'</b><span>語</span></div>'+
     '<button type="button" class="p68-btn" data-act="p68bmstudy">まとめて練習</button>'+
     '<button type="button" class="p68-btn p68-btn2" data-act="p68chunk"'+(ids.length<2?' disabled':'')+'>チャンクを作る</button></div>';
  /* チャンク */
  var C=p68LoadChunks();
  if(P68C&&P68C.busy)h+='<div class="p68-chunks"><div class="p68-ch-h">チャンクを作っています…</div><div class="p68-ch-note">ブックマークした単語を組み合わせて、よく使う短いフレーズにしています。</div></div>';
  else if(P68C&&P68C.err)h+='<div class="p68-chunks"><div class="p68-ch-h">チャンク</div><div class="p68-ch-note">'+esc(P68C.err)+'</div></div>';
  if(!(P68C&&P68C.busy)&&C.list&&C.list.length){
    h+='<div class="p68-chunks"><div class="p68-ch-h">チャンク<small>'+(C.ai?"AIが作成":"アプリ内の例文から")+' ・ '+p68FavDate(C.at)+'</small></div>'+
       '<div class="p68-ch-note">チャンク＝いっしょに使うことばのかたまり。まるごと声に出して覚えると、会話でそのまま使えます。</div>';
    C.list.forEach(function(c){h+='<div class="p68-ch"><div class="p68-chr"><b>'+esc(c.ru)+'</b>'+p67SpkBtn(c.ru)+'</div>'+(c.kana?'<div class="p67-k">'+esc(c.kana)+'</div>':'')+'<div class="p68-chj">'+esc(c.ja)+'</div>'+
      (c.words&&c.words.length?'<div class="p68-chw">'+c.words.map(function(x){return '<span>'+esc(x)+'</span>';}).join("")+'</div>':'')+'</div>';});
    h+='</div>';}
  /* 単語の一覧（登録日ごと） */
  var cur=null;h+='<div class="p68-bmlist">';
  ids.forEach(function(id){var w=byId(id),p=progress[id],lab=p68FavDate(p.favAt);
    if(lab!==cur){h+='<div class="p68-bmday">'+esc(lab)+'</div>';cur=lab;}
    h+='<button type="button" class="p68-bmrow" data-act="worddetail" data-val="'+id+'"><span class="p68-bmw"><b>'+esc(w.accent||w.word)+'</b><small>'+esc(w.meaning)+'</small></span><span class="p68-bmd">'+esc(w.level)+(p.favAt?'<br>'+new Date(p.favAt).toLocaleTimeString("ja-JP",{hour:"2-digit",minute:"2-digit"}):'')+'</span></button>';});
  return h+'</div>';
}
var _p68Ws=renderWordSearch;
renderWordSearch=function(){return ui.p68bm?p68RenderBm():_p68Ws.apply(this,arguments);};
var _p68Sub=renderLearnSub;
renderLearnSub=function(){var h=String(_p68Sub.apply(this,arguments));return (ui.view==="search"&&ui.p68bm)?h.replace(">単語検索<",">ブックマーク<"):h;};
/* ブックマークのタイル：練習を始める代わりに一覧を開く */
window.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest('[data-act]');if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="p47set"&&v==="bookmark"){e.stopImmediatePropagation();e.preventDefault();clearTransientUI();ui.bnav="wordbook";ui.view="search";ui.p68bm=true;ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);return;}
  if(a==="closelearn"&&ui.p68bm){e.stopImmediatePropagation();e.preventDefault();ui.p68bm=false;ui.view="p47words";saveUI();render();window.scrollTo(0,0);return;}
  if(a==="p68bmstudy"){e.stopImmediatePropagation();e.preventDefault();ui.p68bm=false;p47StartIds(shuffle(p68FavIds()),"ブックマーク");return;}
  if(a==="p68chunk"){e.stopImmediatePropagation();e.preventDefault();p68MakeChunks();return;}
  if(ui.p68bm&&(a==="bnav"||a==="p47words"||a==="tab"))ui.p68bm=false;
},true);

/* ---------- 4) チャンクを作る：AI（Claude）が使えればAIで、使えなければアプリ内の例文から ---------- */
function p68Stem(w){w=String(w||"").toLowerCase().replace(/́/g,"").replace(/ё/g,"е").split(/[\s,]+/)[0];return w.length>5?w.slice(0,w.length-2):w.length>3?w.slice(0,w.length-1):w;}
function p68LocalChunks(ids){
  var ws=ids.map(byId).filter(Boolean),out=[],seen={};
  var sents=[];VOCAB.forEach(function(v){if(v.exRu)sents.push({ru:v.exRu,ja:v.exJa||""});});
  if(typeof COMPOSE!=="undefined")COMPOSE.forEach(function(c){if(c.ru||c.accent)sents.push({ru:c.accent||c.ru,ja:c.ja||""});});
  function has(s,w){var st=p68Stem(w.word);if(st.length<2)return false;var low=s.toLowerCase().replace(/́/g,"").replace(/ё/g,"е");return new RegExp("(^|[^а-яөүң])"+st.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i").test(low);}
  sents.forEach(function(s){if(out.length>=8||seen[s.ru])return;var hit=ws.filter(function(w){return has(s.ru,w);});
    if(hit.length>=2){seen[s.ru]=1;out.push({ru:s.ru,ja:s.ja,kana:p67Kana(s.ru),words:hit.map(function(w){return w.word;})});}});
  if(out.length<4)ws.slice(0,8).forEach(function(w){if(out.length>=8||!w.exRu||seen[w.exRu])return;seen[w.exRu]=1;out.push({ru:w.exRu,ja:w.exJa||"",kana:p67Kana(w.exRu),words:[w.word]});});
  return out;
}
async function p68MakeChunks(){
  var ids=p68FavIds().slice(0,12);if(ids.length<2){toast("ブックマークを2語以上にすると作れます");return;}
  P68C={busy:true};render();
  var ws=ids.map(byId).filter(Boolean),s=null;
  try{s=await p55Sample();}catch(_){s=null;}
  if(s){
    var prompt="あなたは日本人の"+P55_LANG_JA+"学習者（"+pLvRange()+"）の先生です。次の単語リストから、2〜3語を組み合わせた自然で短いチャンク（よく一緒に使う語のかたまり・2〜6語のフレーズ）を6つ作ってください。\n"+
      "単語："+ws.map(function(w){return w.word+"（"+w.meaning+"）";}).join("、")+"\n"+
      "条件：日常でそのまま使える表現。語尾は正しく変化させる。"+(P47_LANG==="ru"?"ロシア語にはアクセント記号（́）を付ける。":"")+"\n"+
      "出力はJSONの配列だけ（説明やマークダウンは書かない）。各要素は {\"ru\":\""+P55_LANG_JA+"のチャンク\",\"kana\":\"カタカナ読み\",\"ja\":\"日本語訳\",\"words\":[\"使ったリストの単語\"]}";
    try{var r=await s(prompt,{cache:false,modelTier:"quick"});var t=String(r.text||"");var m=t.match(/\[[\s\S]*\]/);var arr=m?JSON.parse(m[0]):[];
      arr=arr.filter(function(c){return c&&c.ru&&c.ja;}).slice(0,8).map(function(c){return {ru:String(c.ru),kana:String(c.kana||""),ja:String(c.ja),words:(c.words||[]).map(String).slice(0,4)};});
      if(arr.length){p68SaveChunks({list:arr,at:Date.now(),ai:true});P68C=null;render();return;}
    }catch(e){/* AIが使えないときはアプリ内の例文で作る */}
  }
  var loc=p68LocalChunks(ids);
  if(loc.length){p68SaveChunks({list:loc,at:Date.now(),ai:false});P68C=null;}
  else P68C={err:"組み合わせられる例文が見つかりませんでした。単語をもう少しブックマークしてから試してください。"};
  render();
}

/* ---------- 見た目 ---------- */
(function(){var css=
  /* 用語 */
  '.p68-t{border-bottom:1.5px dotted currentColor;cursor:help}'+
  '.p68-g{display:inline;font-size:.8em;font-weight:700;color:var(--blue);background:rgba(59,130,246,.14);border-radius:6px;padding:1px 6px;margin:0 3px;cursor:help;white-space:nowrap;-webkit-box-decoration-break:clone;box-decoration-break:clone}.p68-g.p68-gl{white-space:normal}'+
  '.p68-pop{position:fixed;z-index:9999;display:none;background:var(--card);color:var(--ink);border:1px solid var(--lineStrong);border-radius:14px;padding:12px 14px;box-shadow:0 12px 32px rgba(0,0,0,.35);font-size:14px;line-height:1.7}'+
  '.p68-pop b{display:block;font-size:15px}.p68-pop1{display:block;color:var(--blue);font-weight:800;margin:2px 0 4px}.p68-pop2{display:block;color:var(--sub);font-size:13.5px}'+
  '.p68-gloss{margin:0 0 14px;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}'+
  '.p68-gloss summary{padding:14px 16px;font-weight:800;cursor:pointer;color:var(--blue)}'+
  '.p68-glist{padding:0 16px 8px}.p68-gi{padding:10px 0;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:2px}'+
  '.p68-gi b{font-size:15px}.p68-gi span{color:var(--blue);font-weight:700;font-size:14px}.p68-gi small{color:var(--sub);font-size:13px;line-height:1.6}'+
  /* 解説：入れ子の枠を減らし、横幅を広く使う */
  '@media (max-width:520px){'+
    '.study .qcard:has(.easy),.study .qcard:has(details.more){padding-left:14px!important;padding-right:14px!important}'+
    '.qcard .easy{padding:12px 14px!important}'+
    '.qcard details.more{background:transparent!important;border:none!important;border-top:1px solid var(--line)!important;border-radius:0!important}'+
    '.qcard details.more>summary{padding:14px 2px!important;background:transparent!important}'+
    '.qcard details.more .inner{padding:4px 0 8px!important;background:transparent!important}'+
    '.qcard details.more .bdc{padding:12px 14px!important}'+
    '.qcard details.more .note{padding:10px 12px!important}'+
  '}'+
  '.qcard .easy,.qcard details.more .gd,.qcard details.more .wy,.qcard details.more .mn{font-size:15px!important;line-height:1.85!important;letter-spacing:.01em;word-break:normal;overflow-wrap:anywhere;line-break:strict}'+
  '.bdc .top{display:grid!important;grid-template-columns:1fr auto;column-gap:10px;row-gap:2px;align-items:center}'+
  '.bdc .top .sf{grid-column:1;grid-row:1}.bdc .top .p67-bdr{display:contents}'+
  '.bdc .top .p67-bdr .p67-k{grid-column:1;grid-row:2}.bdc .top .p67-bdr .p67-spk{grid-column:2;grid-row:1/span 2}'+
  '.bdc .top .bs{grid-column:1/-1;margin-top:4px}'+
  '.p52-detail,.p15-sec{line-height:1.85}'+
  /* ブックマーク */
  '.p68-bmtop{display:flex;align-items:center;gap:8px;margin:2px 0 14px}'+
  '.p68-bmtop>div{display:flex;align-items:baseline;gap:3px;margin-right:auto}.p68-bmtop>div b{font-size:26px;font-weight:800}.p68-bmtop>div span{color:var(--muted);font-size:13px}'+
  '.p68-btn{min-height:44px;padding:0 14px;border-radius:12px;border:none;background:var(--blue);color:#fff;font-weight:800;font-size:14px;cursor:pointer}'+
  '.p68-btn2{background:var(--card2);color:var(--ink);border:1px solid var(--lineStrong)}.p68-btn:disabled{opacity:.4}'+
  '.p68-chunks{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px;margin-bottom:16px}'+
  '.p68-ch-h{font-weight:800;font-size:15px;display:flex;justify-content:space-between;align-items:baseline}.p68-ch-h small{color:var(--muted);font-weight:600;font-size:12px}'+
  '.p68-ch-note{color:var(--sub);font-size:13px;line-height:1.7;margin:4px 0 6px}'+
  '.p68-ch{padding:12px 0;border-top:1px solid var(--line)}.p68-chr{display:flex;align-items:center;gap:10px;justify-content:space-between}.p68-chr b{font-size:17px;line-height:1.5}'+
  '.p68-chj{font-size:14px;margin-top:2px}.p68-chw{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}.p68-chw span{font-size:12px;background:var(--card2);border-radius:8px;padding:2px 8px;color:var(--sub)}'+
  '.p68-bmlist{display:flex;flex-direction:column;gap:6px}'+
  '.p68-bmday{font-size:12.5px;font-weight:800;color:var(--muted);margin:10px 2px 2px}'+
  '.p68-bmrow{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:inherit;font:inherit;cursor:pointer}'+
  '.p68-bmw{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p68-bmw b{font-size:17px}.p68-bmw small{color:var(--sub);font-size:13px}'+
  '.p68-bmd{flex:none;text-align:right;font-size:12px;color:var(--muted);line-height:1.5}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}})();
/* ---------- 場面のイラスト（art:i_〜）は細部が見えるよう大きめに表示 ---------- */
var _p68Fill=p66Fill;
p66Fill=function(d,pic){var r=_p68Fill.apply(this,arguments);try{if(d&&d.classList){if(/^art:[ij]_/.test(String(pic||"")))d.classList.add("p68-scene");else if(!d.classList.contains("p67-art"))d.classList.remove("p68-scene");}}catch(_){}return r;};
(function(){try{var st=document.createElement("style");st.textContent='.p59-pic.p68-scene svg{width:128px!important;height:128px!important;border-radius:18px;box-shadow:0 6px 18px rgba(0,0,0,.25)}.p59-pic.sm.p68-scene svg{width:84px!important;height:84px!important}';document.head.appendChild(st);}catch(_){}})();
