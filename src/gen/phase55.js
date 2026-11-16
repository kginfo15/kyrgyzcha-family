/* ===== PHASE55: 間違えたノート・AIロールプレイ会話・発音チェック・やさしい読み物 ===== */
P48_ART.note='<rect x="9" y="5" width="30" height="38" rx="5" fill="'+P48_C+'"/><rect x="9" y="5" width="7" height="38" rx="3" fill="'+P48_A+'"/><path d="M21 15h12M21 21h12M21 27h8" stroke="'+P48_D+'" stroke-width="2.2" stroke-linecap="round" opacity=".7"/><circle cx="34" cy="35" r="7" fill="#FF453A"/><path d="M31.5 32.5l5 5M36.5 32.5l-5 5" stroke="#fff" stroke-width="2" stroke-linecap="round"/>';
P48_ART.talk='<path d="M4 10a6 6 0 016-6h18a6 6 0 016 6v8a6 6 0 01-6 6H16l-6 5v-5.2A6 6 0 014 18z" fill="'+P48_A+'"/><path d="M16 26h22a6 6 0 016 6v4a6 6 0 01-6 6v4l-6-4H22a6 6 0 01-6-6z" fill="'+P48_G+'"/><circle cx="12" cy="14" r="2" fill="#fff"/><circle cx="19" cy="14" r="2" fill="#fff"/><circle cx="26" cy="14" r="2" fill="#fff"/><path d="M24 34h12" stroke="'+P48_D+'" stroke-width="2.4" stroke-linecap="round"/>';
var P55_LANG_JA=(P47_LANG==="ky")?"キルギス語":"ロシア語";
/* ===== 1) 間違えたノート ===== */
if(!appHist.mist)appHist.mist={};
function p55Mark(key,kind){
  if(!appHist.mist)appHist.mist={};
  if(kind==="ok"){delete appHist.mist[key];return;}
  var m=appHist.mist[key]||{n:0};m.n++;m.t=Date.now();appHist.mist[key]=m;
}
function p55Prune(){var lim=Date.now()-30*86400000;Object.keys(appHist.mist||{}).forEach(function(k){if((appHist.mist[k].t||0)<lim)delete appHist.mist[k];});}
var _p55Answer=answer;
answer=function(id,kind){p55Mark("w:"+id,kind);return _p55Answer.apply(this,arguments);};
var _p55CAnswer=composeAnswer;
composeAnswer=function(id,kind){p55Mark("c:"+id,kind);return _p55CAnswer.apply(this,arguments);};
function p55MistList(days){
  p55Prune();var lim=Date.now()-days*86400000,w=[],c=[];
  Object.keys(appHist.mist||{}).forEach(function(k){var m=appHist.mist[k];if((m.t||0)<lim)return;var id=k.slice(2);
    if(k[0]==="w"&&WMAP[id])w.push({id:id,n:m.n,t:m.t});else if(k[0]==="c"&&CMAP[id])c.push({id:id,n:m.n,t:m.t});});
  w.sort(function(a,b){return b.t-a.t;});c.sort(function(a,b){return b.t-a.t;});
  return {w:w,c:c};
}
function renderP55Mist(){
  var days=ui.p55MistDays||7,L=p55MistList(days);
  var h='<div class="small muted" style="margin:0 2px 12px">間違えたり「わからない」「うろ覚え」にした単語・作文が自動でここにたまります。正解すると消えます。</div>';
  h+='<div class="p47-seg" style="grid-template-columns:repeat(3,1fr);margin-bottom:14px">'+[[1,"今日"],[7,"今週"],[30,"30日"]].map(function(o){return '<button type="button" data-act="p55days" data-val="'+o[0]+'" class="'+(days===o[0]?"on":"")+'">'+o[1]+'</button>';}).join("")+'</div>';
  if(!L.w.length&&!L.c.length)return h+'<div class="p55-empty">'+p48Art("trophy",56)+'<b>間違えた問題はありません</b><span>この調子で続けましょう</span></div>';
  if(L.w.length){
    h+='<button type="button" class="p47-btn primary" style="width:100%;margin-bottom:10px" data-act="p55redo" data-val="w">単語をやり直す（'+L.w.length+'語）</button><div class="p55-list">';
    L.w.slice(0,60).forEach(function(x){var w=WMAP[x.id];h+='<button type="button" class="p55-row" data-act="say" data-say="'+esc(w.accent||w.word)+'"><span class="p55-rw">'+esc(w.accent||w.word)+'</span><span class="p55-rm">'+esc(p52Short(w.meaning))+'</span><em>×'+x.n+'</em></button>';});
    h+='</div>';
  }
  if(L.c.length){
    h+='<button type="button" class="p47-btn" style="width:100%;margin:16px 0 10px" data-act="p55redo" data-val="c">作文をやり直す（'+L.c.length+'文）</button><div class="p55-list">';
    L.c.slice(0,40).forEach(function(x){var c=CMAP[x.id];h+='<div class="p55-row c"><span class="p55-rm">'+esc(c.ja)+'</span><span class="p55-rw">'+esc(c.accent||c.ru)+'</span><em>×'+x.n+'</em></div>';});
    h+='</div>';
  }
  return h;
}
/* ===== 2) AIロールプレイ会話（Claudeに直接つなぐ。外部APIキー不要） ===== */
var P55_SC=[
  {k:"cafe",t:"カフェで注文",role:"カフェの店員",art:"food"},
  {k:"taxi",t:"タクシーに乗る",role:"タクシーの運転手",art:"bus"},
  {k:"shop",t:"市場で買い物",role:"市場の売り手",art:"bag"},
  {k:"clinic",t:"病院で症状を伝える",role:"医師",art:"heart"},
  {k:"home",t:"大家さんに修理を頼む",role:"アパートの大家",art:"home"},
  {k:"intro",t:"自己紹介・雑談",role:"初めて会った近所の人",art:"people"},
  {k:"free",t:"自由に話す",role:"親しい友達",art:"chat"}
];
var P55={sample:undefined};
async function p55Sample(){if(P55.sample!==undefined)return P55.sample;try{P55.sample=(window.claude&&window.claude.use)?await window.claude.use("sample"):null;}catch(_){P55.sample=null;}return P55.sample;}
function p55ErrMsg(e){var c=e&&e.code;return {rate_limited:"少し時間をおいてからもう一度試してください",not_granted:"AIの利用が許可されていません",not_declared:"このページではAIを使えません",sampling_disabled:"AIが使えない設定になっています",session_expired:"ページを開き直してください",refused:"その内容には答えられませんでした",prompt_too_large:"会話が長くなりすぎました。新しく始めてください"}[c]||"うまく応答できませんでした。もう一度試してください";}
function p55Rules(sc){
  var known=VOCAB.filter(function(w){return p47IsKnown(w.id);}).slice(-40).map(function(w){return w.word;}).join(", ");
  return "あなたは日本人の"+P55_LANG_JA+"学習者（A1〜A2レベル）の会話練習相手です。場面：「"+sc.t+"」。あなたの役：「"+sc.role+"」。\n"+
    "ルール：\n1. 毎回、"+P55_LANG_JA+"で1〜2文だけ短く話す。A2までのやさしい語彙と文法を使う。\n2. その次の行に、日本語訳を（）で書く。\n"+
    "3. 学習者の"+P55_LANG_JA+"に間違いがあれば、さらに次の行に「💡 」から始めて、正しい言い方と日本語の短い説明を1行で書く。間違いがなければこの行は書かない。\n"+
    "4. 学習者が日本語で書いたら、それを"+P55_LANG_JA+"でどう言うかを教えてから会話を続ける。\n5. 毎回、相手が答えやすい質問で終える。絵文字・マークダウンは使わない（💡だけ使う）。\n"+
    (known?"6. 可能なら学習者が覚えた単語を使う："+known+"\n":"")+
    (P47_LANG==="ru"?"7. ロシア語にはアクセント記号（́）を付ける。\n":"");
}
async function p55Send(text){
  var T=ui.p55t;if(!T||T.busy)return;
  var s=await p55Sample();if(!s){T.err="この機能は、Claudeのページとして開いたときに使えます";render();return;}
  if(text)T.msgs.push({role:"user",content:text});
  T.busy=true;T.err="";T.live="";render();
  var sc=P55_SC.filter(function(x){return x.k===T.sc;})[0];
  var input=[{role:"user",content:p55Rules(sc)+"\n\n会話を始めてください。"}].concat(T.msgs);
  if(input[input.length-1].role!=="user")input.push({role:"user",content:"（続けてください）"});
  try{
    var r=await s(input,{cache:false,modelTier:"quick",onText:function(o){T.live=o.text;var el=document.getElementById("p55live");if(el)el.textContent=o.text;}});
    T.msgs.push({role:"assistant",content:r.text});
  }catch(e){T.err=p55ErrMsg(e);if(e&&e.text)T.msgs.push({role:"assistant",content:e.text});}
  T.busy=false;T.live="";saveUI();render();
  setTimeout(function(){var b=document.getElementById("p55chat");if(b)b.scrollTop=b.scrollHeight;window.scrollTo(0,document.body.scrollHeight);},30);
}
async function p55Report(){
  var T=ui.p55t;if(!T||T.busy||!T.msgs.length)return;
  var s=await p55Sample();if(!s)return;
  T.busy=true;T.report="";render();
  var tr=T.msgs.map(function(m){return (m.role==="user"?"学習者: ":"相手: ")+m.content;}).join("\n");
  try{
    var r=await s("次は"+P55_LANG_JA+"学習者（A1〜A2）の会話練習の記録です。日本語で短いふりかえりを書いてください。\n形式：\nよかった点：（1行）\n直すとよい表現：（誤→正 を最大3つ、各1行。なければ「特になし」）\n次に使える表現：（"+P55_LANG_JA+"の文を2つ、日本語訳付き）\nマークダウン記号は使わない。\n\n"+tr,{cache:false,modelTier:"quick",onText:function(o){var el=document.getElementById("p55rep");if(el)el.textContent=o.text;}});
    T.report=r.text;
  }catch(e){T.report=p55ErrMsg(e);}
  T.busy=false;saveUI();render();
}
function p55Bubble(m){
  var lines=String(m.content).split("\n").filter(function(x){return x.trim();});
  if(m.role==="user")return '<div class="p55-b me">'+esc(m.content)+'</div>';
  var main=[],ja=[],tip=[];
  lines.forEach(function(l){if(/^💡/.test(l))tip.push(l.replace(/^💡\s*/,""));else if(/^[（(]/.test(l.trim()))ja.push(l);else main.push(l);});
  var say=main.join(" ");
  return '<div class="p55-b ai"><div class="p55-bt">'+esc(say)+'<button type="button" class="p52-spk" data-act="say" data-say="'+esc(say)+'" aria-label="聞く">'+P52_SPK+'</button></div>'+
    (ja.length?'<div class="p55-bj">'+esc(ja.join(" "))+'</div>':'')+(tip.length?'<div class="p55-tip">💡 '+esc(tip.join(" "))+'</div>':'')+'</div>';
}
function renderP55Talk(){
  var T=ui.p55t;
  if(!T||!T.sc){
    var h='<div class="small muted" style="margin:0 2px 12px">場面を選ぶと、AIが相手役になって'+P55_LANG_JA+'で話しかけます。間違いはその場で💡で教えてくれます。日本語で「〜って何て言う？」と聞いてもOKです。</div><div class="p55-scs">';
    P55_SC.forEach(function(sc){h+='<button type="button" class="p55-sc" data-act="p55start" data-val="'+sc.k+'"><span class="p48-ill p55-scic">'+p48Art(sc.art,30)+'</span><b>'+esc(sc.t)+'</b><small>相手：'+esc(sc.role)+'</small></button>';});
    return h+'</div>';
  }
  var sc=P55_SC.filter(function(x){return x.k===T.sc;})[0];
  var h='<div class="p55-top"><span class="p48-ill p55-scic">'+p48Art(sc.art,24)+'</span><b>'+esc(sc.t)+'</b><button type="button" class="p55-mini" data-act="p55reset">場面を変える</button></div>';
  h+='<div class="p55-chat" id="p55chat">'+T.msgs.map(p55Bubble).join("")+(T.busy&&!T.report?'<div class="p55-b ai"><div class="p55-bt" id="p55live">'+esc(T.live||"…")+'</div></div>':'')+'</div>';
  if(T.err)h+='<div class="p55-err">'+esc(T.err)+'</div>';
  if(T.report!==undefined&&T.report!==null&&(T.report||T.busy))h+='<div class="p55-report"><b>ふりかえり</b><div id="p55rep">'+esc(T.report||"作成中…")+'</div></div>';
  h+='<div class="p55-input"><textarea id="p55in" rows="1" placeholder="'+P55_LANG_JA+'で返事（日本語でもOK）"'+(T.busy?' disabled':'')+'></textarea><button type="button" data-act="p55send" aria-label="送信"'+(T.busy?' disabled':'')+'><svg width="20" height="20" viewBox="0 0 24 24" fill="#fff"><path d="M3 11l18-8-8 18-2.5-7.5L3 11z"/></svg></button></div>';
  if(T.msgs.length>=4)h+='<button type="button" class="p55-end" data-act="p55report"'+(T.busy?' disabled':'')+'>会話を終えて、ふりかえりを見る</button>';
  return h;
}
/* ===== 3) 発音チェック（ロシア語。端末の音声認識を使う） ===== */
var P55_SR=window.SpeechRecognition||window.webkitSpeechRecognition||null;
function p55Norm(s){return String(s||"").replace(/́/g,"").toLowerCase().replace(/ё/g,"е").replace(/[^а-яөүң\s]/g,"").replace(/\s+/g," ").trim();}
function p55Mic(target){
  if(!P55_SR){toast("この端末では音声認識が使えません");return;}
  try{
    var r=new P55_SR();r.lang=P47_LANG==="ky"?"ky-KG":"ru-RU";r.interimResults=false;r.maxAlternatives=5;
    var tn=p55Norm(target);toast("🎤 聞いています…どうぞ話してください");
    r.onresult=function(ev){var alts=[];for(var i=0;i<ev.results[0].length;i++)alts.push(ev.results[0][i].transcript);
      var ok=alts.some(function(a){var n=p55Norm(a);return n===tn||n.indexOf(tn)>=0||tn.indexOf(n)>=0&&n.length>=tn.length-1;});
      toast((ok?"✓ よく言えました！":"△ もう一度：")+"（聞き取り：「"+alts[0]+"」）");};
    r.onerror=function(e){toast(e.error==="not-allowed"||e.error==="service-not-allowed"?"マイクが使えません（この画面ではマイクの許可が必要です）":(e.error==="no-speech"?"声が聞き取れませんでした":"音声認識がうまくいきませんでした"));};
    r.start();
  }catch(e){toast("この環境では音声認識が使えません");}
}
var _p55Detail=p52Detail;
p52Detail=function(w){
  var h=_p55Detail(w);
  if(P55_SR&&P47_LANG==="ru")h=h.replace('<div class="p52-dw">','<div class="p52-dw">').replace(/(<\/button>)(<\/div>)/,'$1<button type="button" class="p52-spk p55-mic" data-act="p55mic" data-val="'+esc(w.accent||w.word)+'" aria-label="発音してみる">'+P55_MIC+'</button>$2');
  return h;
};
var P55_MIC='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0M12 18v3"/></svg>';
/* ===== 4) やさしい読み物（LingQ式：タップで意味・ブックマーク） ===== */
function p55Lookup(tok){
  var t=p55Norm(tok);if(t.length<2)return null;
  var best=null;
  VOCAB.forEach(function(w){if(best)return;var b=p55Norm(w.word);if(b===t)best=w;});
  if(best)return best;
  VOCAB.forEach(function(w){if(best||/\s/.test(w.word))return;var b=p55Norm(w.word),st=b.length>4?b.slice(0,b.length-2):b;if(st.length>=4&&t.indexOf(st)===0)best=w;});
  return best;
}
function p55Tokens(text){
  return String(text).split(/(\s+|[,.!?;:—«»"“”()]+)/).map(function(tok){
    if(!/[А-Яа-яЁёӨөҮүҢң]/.test(tok))return esc(tok);
    var w=p55Lookup(tok);
    return '<span class="p55-tok'+(w?(p47IsKnown(w.id)?" known":" unk"):"")+'" data-act="p55tok" data-val="'+(w?w.id:"")+'" data-tok="'+esc(tok.replace(/́/g,""))+'">'+esc(tok)+'</span>';
  }).join("");
}
function p55Coverage(sents){
  var tot=0,kn=0;sents.forEach(function(s){String(s.t).split(/\s+/).forEach(function(tok){if(!/[А-Яа-яЁёӨөҮүҢң]/.test(tok))return;tot++;var w=p55Lookup(tok);if(w&&p47IsKnown(w.id))kn++;});});
  return tot?Math.round(kn/tot*100):0;
}
function p55ExampleStory(){
  var pool=VOCAB.filter(function(w){return w.exRu&&(p47IsKnown(w.id)||progress[w.id]);});
  if(pool.length<6)pool=VOCAB.filter(function(w){return w.exRu;});
  return {title:"覚えた単語の例文",src:"ex",sentences:shuffle(pool).slice(0,8).map(function(w){return {t:w.exRu,ja:w.exJa||""};})};
}
async function p55AiStory(){
  var s=await p55Sample();if(!s){toast("AIの読み物はClaudeのページとして開いたときに使えます");return;}
  var R=ui.p55r||(ui.p55r={});R.busy=true;render();
  var words=shuffle(VOCAB.filter(function(w){return p47IsKnown(w.id)||(progress[w.id]&&progress[w.id].status!=="new");})).slice(0,25).map(function(w){return w.word;});
  try{
    var v=await s.json("日本人の"+P55_LANG_JA+"学習者（A2）向けに、日常の短いお話を"+P55_LANG_JA+"で7文書いてください。やさしい語彙だけを使い、できるだけ次の単語を使うこと："+(words.join(", ")||"基本語")+"。"+(P47_LANG==="ru"?"アクセント記号を付けること。":"")+
      'JSONだけを返す：{"title":"日本語のタイトル","sentences":[{"t":"'+P55_LANG_JA+'の文","ja":"日本語訳"}]}',{modelTier:"quick",cache:false});
    if(v&&v.sentences&&v.sentences.length){R.story={title:v.title||"AIのお話",src:"ai",sentences:v.sentences.slice(0,10)};}
  }catch(e){toast(p55ErrMsg(e));}
  R.busy=false;R.showJa={};saveUI();render();
}
function renderP55Read(){
  var R=ui.p55r||(ui.p55r={});
  if(!R.story)R.story=p55ExampleStory();
  var st=R.story,cov=p55Coverage(st.sentences);
  var h='<div class="p55-rhead"><div><b>'+esc(st.title)+'</b><small>'+(st.src==="ai"?"AIが覚えた単語で作ったお話":"覚えた単語の例文を集めた読み物")+'</small></div><span class="p55-cov"><b>'+cov+'%</b>知っている単語</span></div>';
  h+='<div class="p55-legend"><i class="k"></i>覚えた <i class="u"></i>まだ <span>単語をタップすると意味が出ます</span></div>';
  h+='<div class="p55-text">';
  st.sentences.forEach(function(s,i){var open=R.showJa&&R.showJa[i];
    h+='<div class="p55-sent"><div class="p55-st">'+p55Tokens(s.t)+'<button type="button" class="p52-spk" data-act="say" data-say="'+esc(s.t)+'" aria-label="聞く">'+P52_SPK+'</button></div>'+
      '<button type="button" class="p55-ja'+(open?" open":"")+'" data-act="p55ja" data-val="'+i+'">'+(open?esc(s.ja):"訳を見る")+'</button></div>';});
  h+='</div><div class="p50-btns" style="margin-top:14px"><button type="button" class="p47-btn" data-act="p55newex">例文で別の読み物</button><button type="button" class="p47-btn primary" data-act="p55ai"'+(R.busy?' disabled':'')+'>'+(R.busy?'作成中…':'AIでお話を作る')+'</button></div>';
  return h;
}
function p55ShowWord(id,tok){
  var w=WMAP[id];var m=document.getElementById("p48modal");if(!m){m=document.createElement("div");m.id="p48modal";document.body.appendChild(m);}
  if(!w){toast("「"+tok+"」は単語リストにありません");return;}
  var fav=progress[id]&&progress[id].favorite;
  m.innerHTML='<div class="p48-mask" data-act="p51close"></div><div class="p48-dialog"><div class="p52-dw" style="justify-content:center;font-size:28px">'+esc(w.accent||w.word)+'<button type="button" class="p52-spk" data-act="say" data-say="'+esc(w.accent||w.word)+'">'+P52_SPK+'</button></div>'+
    (w.kana?'<div class="p52-dk">'+esc(w.kana)+'</div>':'')+'<div class="p52-dm">'+esc(w.meaning)+'</div>'+(tok&&p55Norm(tok)!==p55Norm(w.word)?'<div class="small muted" style="margin-top:4px">文中の形：'+esc(tok)+'</div>':'')+
    '<div class="p52-dexp" style="text-align:center">'+esc(w.simpleExp||"")+'</div>'+
    '<button type="button" class="p48-dlgbtn" data-act="p55fav" data-val="'+id+'" style="margin-top:14px">'+(fav?"ブックマーク済み ✓":"ブックマークに追加")+'</button>'+
    '<button type="button" class="p48-dlgbtn" style="background:var(--accent);border-color:var(--accent);color:#fff" data-act="p51close">閉じる</button></div>';
  m.className="show";
}
/* ===== 画面のつなぎこみ ===== */
LEARN_ITEMS=LEARN_ITEMS.filter(function(it){return it[0]!=="aichat";});
LEARN_ITEMS.push(["p55talk","AI会話","場面のロールプレイで話す"],["p55read","読み物","タップで意味が分かる"],["p55mist","間違えたノート","間違えた単語と作文"]);
P52_CORE=["compose","p55talk","p55read","listening","p55mist","gnote"];
P49_HUB.p55talk="talk";P49_HUB.p55read="book";P49_HUB.p55mist="note";
P51_TITLES.p55talk="AI会話";P51_TITLES.p55read="読み物";P51_TITLES.p55mist="間違えたノート";
var _p55Sub=renderLearnSub;
renderLearnSub=function(){
  var v=ui.view,body=v==="p55talk"?renderP55Talk():v==="p55read"?renderP55Read():v==="p55mist"?renderP55Mist():null;
  if(body===null)return _p55Sub.apply(this,arguments);
  return '<div class="p51-sub v-'+v+'"><div class="p51-head"><button type="button" class="p51-back" data-act="closelearn" aria-label="戻る"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button>'+
    '<span class="p51-headic p48-ill">'+p48Art(P49_HUB[v],26)+'</span><span class="p51-headt">'+esc(P51_TITLES[v])+'</span></div>'+body+'</div>';
};
var _p55Home=renderHome;
renderHome=function(){
  var h=String(_p55Home()),n=p55MistList(7).w.length+p55MistList(7).c.length;
  if(n>0)h=h.replace('<button type="button" class="p47-more"','<button type="button" class="p47-card p55-homemist" data-act="openlearn" data-val="p55mist"><span class="p47-cardic p48-ill">'+p48Art("note",30)+'</span><span class="p47-cardtxt"><b>間違えたノート</b><small>今週 '+n+' 件 ・ まとめてやり直せます</small></span>'+p47Icon("chev",18)+'</button><button type="button" class="p47-more"');
  return h;
};
var _p55Fin=p21RenderFinish;
p21RenderFinish=function(){var n=p55MistList(1).w.length;var h=String(_p55Fin.apply(this,arguments));
  return n?h.replace(/(<div class="p21-fincard">[\s\S]*?)(<\/div><\/div>)$/,'$1<button type="button" class="p21-finbtn ghost" data-act="openlearn" data-val="p55mist" style="margin-top:10px">今日間違えた単語を見る（'+n+'）</button>$2'):h;};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="openlearn"&&(v==="aichat"||v==="p55talk"||v==="p55read"||v==="p55mist")){e.stopImmediatePropagation();e.preventDefault();clearTransientUI();ui.session=null;ui.composeSession=null;ui.mixSummary=null;ui.bnav="wordbook";ui.view=v==="aichat"?"p55talk":v;ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);return;}
  var mine={p55days:1,p55redo:1,p55start:1,p55reset:1,p55send:1,p55report:1,p55mic:1,p55tok:1,p55ja:1,p55newex:1,p55ai:1,p55fav:1};
  if(!mine[a])return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p55days"){ui.p55MistDays=+v;saveUI();render();return;}
  if(a==="p55redo"){var L=p55MistList(ui.p55MistDays||7);if(v==="w")p47StartIds(L.w.map(function(x){return x.id;}),"間違えた単語");else{clearTransientUI();ui.bnav="wordbook";ui.view="compose";ui.learnOpen=true;startCompose({type:"ids",ids:L.c.map(function(x){return x.id;})},"間違えた作文");}return;}
  if(a==="p55start"){ui.p55t={sc:v,msgs:[],busy:false,err:"",report:null};saveUI();render();p55Send(null);return;}
  if(a==="p55reset"){ui.p55t=null;saveUI();render();return;}
  if(a==="p55send"){var ta=document.getElementById("p55in");var t=ta?ta.value.trim():"";if(t)p55Send(t);return;}
  if(a==="p55report"){p55Report();return;}
  if(a==="p55mic"){p55Mic(v);return;}
  if(a==="p55tok"){p55ShowWord(v,el.getAttribute("data-tok"));try{speak(el.getAttribute("data-tok"));}catch(_){}return;}
  if(a==="p55ja"){var R=ui.p55r||(ui.p55r={});R.showJa=R.showJa||{};R.showJa[v]=!R.showJa[v];saveUI();render();return;}
  if(a==="p55newex"){ui.p55r={story:p55ExampleStory(),showJa:{}};saveUI();render();return;}
  if(a==="p55ai"){p55AiStory();return;}
  if(a==="p55fav"){var p=P(v);p.favorite=!p.favorite;saveAll();p55ShowWord(v,"");render();return;}
},true);
document.addEventListener("keydown",function(e){if(e.target&&e.target.id==="p55in"&&e.key==="Enter"&&!e.shiftKey&&!e.isComposing){e.preventDefault();var t=e.target.value.trim();if(t)p55Send(t);}},true);
(function(){
  var css='.p55-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:30px 0;color:var(--muted)}.p55-empty b{color:var(--ink);font-size:16px}'+
  '.p55-list{display:flex;flex-direction:column;gap:6px}.p55-row{display:flex;align-items:center;gap:10px;width:100%;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);text-align:left;cursor:pointer}'+
  '.p55-row.c{flex-direction:column;align-items:flex-start;gap:3px;cursor:default;position:relative}.p55-rw{font-weight:800;font-size:15px}.p55-rm{flex:1;color:var(--muted);font-size:13px}.p55-row em{font-style:normal;font-size:12px;font-weight:800;color:#FF6B60}.p55-row.c em{position:absolute;right:12px;top:10px}'+
  '.p55-scs{display:grid;grid-template-columns:1fr 1fr;gap:10px}.p55-sc{display:flex;flex-direction:column;align-items:flex-start;gap:6px;padding:14px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);text-align:left;cursor:pointer}'+
  '.p55-sc b{font-size:14.5px}.p55-sc small{font-size:11.5px;color:var(--muted)}.p55-scic{width:44px;height:44px;border-radius:13px;display:flex;align-items:center;justify-content:center}'+
  '.p55-top{display:flex;align-items:center;gap:10px;margin-bottom:10px}.p55-top b{flex:1}.p55-top .p55-scic{width:36px;height:36px}.p55-mini{font-size:12px;font-weight:700;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--muted);cursor:pointer}'+
  '.p55-chat{display:flex;flex-direction:column;gap:10px;margin-bottom:12px}.p55-b{max-width:88%;padding:11px 13px;border-radius:18px;font-size:15px;line-height:1.55}'+
  '.p55-b.me{align-self:flex-end;background:var(--accent);color:#fff;border-bottom-right-radius:6px}.p55-b.ai{align-self:flex-start;background:var(--card);border:1px solid var(--line);border-bottom-left-radius:6px}'+
  '.p55-bt{font-weight:700}.p55-bt .p52-spk{width:30px;height:30px;margin-left:6px}.p55-bj{font-size:12.5px;color:var(--muted);margin-top:4px}.p55-tip{margin-top:8px;padding:8px 10px;border-radius:12px;background:rgba(242,183,5,.12);color:#F2CC5B;font-size:12.5px}'+
  '.p55-err{color:#FF6B60;font-size:13px;margin:0 2px 10px}.p55-report{background:var(--card);border:1px solid var(--accent);border-radius:18px;padding:14px;margin-bottom:12px;white-space:pre-wrap;font-size:13.5px;line-height:1.7}.p55-report b{display:block;margin-bottom:6px;color:var(--accent)}'+
  '.p55-input{position:sticky;bottom:calc(84px + env(safe-area-inset-bottom));display:flex;gap:8px;align-items:flex-end;padding:8px;border-radius:20px;background:var(--card);border:1px solid var(--line)}'+
  '.p55-input textarea{flex:1;resize:none;border:none;background:transparent;color:var(--ink);font-size:15px;padding:8px;outline:none;font-family:inherit}.p55-input button{width:42px;height:42px;border-radius:14px;border:none;background:var(--accent);display:flex;align-items:center;justify-content:center;cursor:pointer}.p55-input button[disabled]{opacity:.5}'+
  '.p55-end{display:block;width:100%;margin-top:10px;padding:13px;border-radius:16px;border:1px dashed var(--lineStrong);background:none;color:var(--muted);font-weight:800;cursor:pointer}'+
  '.p55-mic{background:rgba(48,209,88,.14)!important;color:#30D158!important}'+
  '.p55-rhead{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:10px}.p55-rhead b{display:block;font-size:17px}.p55-rhead small{color:var(--muted);font-size:12px}'+
  '.p55-cov{display:flex;flex-direction:column;align-items:center;padding:8px 12px;border-radius:14px;background:var(--accentSoft);color:var(--muted);font-size:10.5px}.p55-cov b{font-size:20px;color:var(--accent)}'+
  '.p55-legend{display:flex;align-items:center;gap:6px;font-size:11.5px;color:var(--muted);margin-bottom:10px}.p55-legend i{width:12px;height:4px;border-radius:3px;display:inline-block}.p55-legend i.k{background:#30D158}.p55-legend i.u{background:var(--sub)}.p55-legend span{margin-left:auto}'+
  '.p55-text{display:flex;flex-direction:column;gap:10px}.p55-sent{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 14px}.p55-st{font-size:17px;line-height:1.9}'+
  '.p55-tok{cursor:pointer;border-bottom:2px solid transparent;border-radius:3px}.p55-tok.known{border-bottom-color:rgba(48,209,88,.6)}.p55-tok.unk{border-bottom-color:var(--sub)}.p55-tok:active{background:var(--accentSoft)}'+
  '.p55-st .p52-spk{width:28px;height:28px;margin-left:4px}.p55-ja{display:block;margin-top:6px;background:none;border:none;padding:0;color:var(--accent);font-size:12.5px;font-weight:700;cursor:pointer;text-align:left}.p55-ja.open{color:var(--muted);font-weight:500}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
