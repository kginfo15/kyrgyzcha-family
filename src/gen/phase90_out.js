/* ===== PHASE90 話す・書く練習（2026-11-28 Yuta「ライティングや音声入力も取り入れて、より早く到達したい」） =====
   2つの練習を「このあと」シートから開く（ホームにはカードを足さない）。全画面 #psw。
   ① 話して・打って答える瞬間作文：日本語を見て、外国語の文を自分で作る（選ばない）。
      声（claude.ai の dictation。使えない端末では iPhone などのキーボードのマイクで入力）か、文字で答える。
      使った語が見本と同じなら正解（語順はロシア語では入れかえられることが多いので見ない）。
      ちがうときは AI に「この答えでも正しいか」「どこがちがうか」を初心者向けに説明させる。
      結果は composeAnswer() に渡す → 復習の間隔（phase88）と1問ごとの記録（phase85）にそのまま入る。
   ② 3文作文とAIの添削：お題と最近覚えた単語を見て3文書く → AI が1文ずつ直し、なぜ直したかを日本語で説明。
      記録：settings.psw = {h:[{d:日付, t:お題, s:[[書いた文,直した文,ok]] , c:ひとこと}]（最新10件）}
   根拠：選ぶより自分で作って思い出すほうが、話す・書く力として残りやすい（産出の想起練習）。
         書いた文を直してもらう練習は、正確さを伸ばす効果がメタ分析で確かめられている（効果は中くらい）。 */
var PSW={tab:"say",list:[],pos:0,ans:"",res:null,ai:null,busy:0,part:"",dict:undefined,dState:"idle",w:null};
function pswSet(){if(!settings.psw||typeof settings.psw!=="object")settings.psw={};if(!Array.isArray(settings.psw.h))settings.psw.h=[];return settings.psw;}
/* 音声入力（dictation）を先に取っておく：start() はクリックの中ですぐ呼ぶ必要があるため */
(function(){try{if(window.claude&&window.claude.use){window.claude.use("dictation").then(function(d){PSW.dict=d||null;if(d){
  d.onPartial(function(e){PSW.part=e.text||"";pswLive();});
  d.onFinal(function(e){var t=e.text||"";PSW.part="";pswAppend(t);});
  d.onState(function(e){PSW.dState=e.state;if(e.state==="idle"&&e.reason&&["not_granted","unavailable"].indexOf(e.reason)>=0)PSW.dict=null;pswRender();});
}}).catch(function(){PSW.dict=null;});}else PSW.dict=null;}catch(_){PSW.dict=null;}})();
function pswDictLang(){return P47_LANG==="ky"?"ky":"ru";}
/* いま書いている欄に、聞き取った言葉を足す */
function pswAppend(t){
  var el=document.getElementById("pswin");var cur=el?el.value:(PSW.tab==="say"?PSW.ans:(PSW.w&&PSW.w.text)||"");
  if(!cur.trim())t=t.replace(/^\s+/,"");var v=cur+t;
  if(PSW.tab==="say")PSW.ans=v;else if(PSW.w)PSW.w.text=v;
  if(el){el.value=v;}pswLive();
}
function pswLive(){var e=document.getElementById("pswpart");if(e)e.textContent=PSW.part||"";}
function pswMicBtn(){
  if(!PSW.dict)return '';
  var on=PSW.dState!=="idle";
  return '<button type="button" class="psw-mic'+(on?" on":"")+'" data-act="pswmic" aria-label="'+(on?"止める":"声で入力")+'">'+(typeof P55_MIC!=="undefined"?P55_MIC:"🎤")+'<span>'+(on?"止める":"声で答える")+'</span></button>';
}
function pswMicHint(){return PSW.dict?'':'<div class="psw-hint">声で答えるときは、キーボードのマイクのボタン（iPhone・Android）で話すと文字になります。</div>';}

/* ---- ① 瞬間作文で答える ---- */
/* 出す文：復習の日が来た作文 → 前に出た作文 → まだの作文（単元の順） 。10文 */
function pswPick(){
  var ids=Object.keys(CMAP),due=[],seen=[],fresh=[];
  ids.forEach(function(id){var p=cprogress[id];if(p&&p.nextReview&&p.nextReview<=now())due.push(id);else if(p&&p.status&&p.status!=="new")seen.push(id);else fresh.push(id);});
  due.sort(function(a,b){return cprogress[a].nextReview-cprogress[b].nextReview;});
  seen.sort(function(a,b){return (cprogress[a].nextReview||0)-(cprogress[b].nextReview||0);});
  var out=due.concat(fresh.slice(0,6),seen).slice(0,10);if(out.length<10)out=out.concat(fresh.slice(6,6+10-out.length));return out;
}
function pswNorm(s){return String(s||"").replace(/́/g,"").toLowerCase().replace(/ё/g,"е").replace(/[^\p{L}\p{N}\s-]/gu," ").replace(/\s-\s|^-|-$/g," ").replace(/\s+/g," ").trim();}
function pswToks(s){var t=pswNorm(s);return t?t.split(" "):[];}
/* 見本と答えの語を比べる（順番は見ない）。miss=足りない語、extra=見本にない語 */
function pswCompare(ans,target){
  var a=pswToks(ans),t=pswToks(target),cnt={};t.forEach(function(w){cnt[w]=(cnt[w]||0)+1;});
  var extra=[];a.forEach(function(w){if(cnt[w])cnt[w]--;else extra.push(w);});
  var miss=[];Object.keys(cnt).forEach(function(w){for(var i=0;i<cnt[w];i++)miss.push(w);});
  return {ok:!miss.length&&!extra.length,same:a.join(" ")===t.join(" "),miss:miss,extra:extra,n:t.length};
}
function pswStartSay(){PSW.tab="say";PSW.list=pswPick();PSW.pos=0;PSW.ans="";PSW.res=null;PSW.ai=null;PSW.t0=Date.now();}
function pswCur(){return CMAP[PSW.list[PSW.pos]];}
function pswCheck(){
  var c=pswCur();if(!c)return;var el=document.getElementById("pswin");if(el)PSW.ans=el.value;
  if(!PSW.ans.trim()){toast("答えを入れてください（わからないときは「答えを見る」）");return;}
  try{if(PSW.dict&&PSW.dState!=="idle")PSW.dict.stop();}catch(_){}
  PSW.res=pswCompare(PSW.ans,c.ru);PSW.ai=null;
  if(PSW.res.ok){pswGrade("ok");}
  else pswAskAI();
  pswRender();
}
function pswReveal(){var c=pswCur();if(!c)return;PSW.res={ok:false,giveup:1,miss:[],extra:[]};PSW.ai=null;pswGrade("no");pswRender();}
/* 記録：1文につき1回だけ */
function pswGrade(kind){
  var c=pswCur();if(!c||PSW.graded===c.id)return;PSW.graded=c.id;
  try{composeAnswer(c.id,kind);}catch(_){}
}
async function pswAskAI(){
  var c=pswCur();if(!c)return;var s=null;try{s=await p55Sample();}catch(_){}
  if(!s){PSW.ai={err:"AIの判定は、Claudeのページとして開いたときに使えます。見本とくらべて、下のボタンで自分で判定してください。"};pswRender();return;}
  PSW.busy=1;PSW.ai={wait:1};pswRender();
  var prompt="あなたは日本人の初心者に"+P55_LANG_JA+"を教える先生です。学習者は、日本語の文を"+P55_LANG_JA+"に訳しました。\n"+
    JSON.stringify({日本語:c.ja,見本:c.ru,学習者の答え:PSW.ans,この文の文法:c.grammarPoint||""})+"\n\n"+
    "次のJSONだけを返してください：{\"ok\":真偽値,\"fixed\":\"学習者の答えを最小限に直した文（正しければそのまま）\",\"points\":[{\"bad\":\"まちがえた部分\",\"good\":\"正しい形\",\"why\":\"理由\"}],\"note\":\"ひとこと\"}\n"+
    "ルール：\n1. ok は、日本語の意味に合っていて、文法も正しければ true（語順やつづりの小さなちがいが見本とちがっても、正しければ true）。音声入力で句読点や大文字がないのは気にしない。\n"+
    "2. why は初心者が一度で分かる日本語で、なぜその形になるのか（名詞の性、格〔文の中での役目で語尾が変わること〕、動詞の人称など）を具体的に書く。専門用語には（）で短い言いかえを付ける。1つ80字まで。最大3つ。\n"+
    "3. note は、ok なら見本とのちがい（ほかの言い方として使えるか）、ok でないなら一番大事な直し方を、日本語60字まで。\n"+
    (P47_LANG==="ru"?"4. fixed のロシア語にはアクセント記号を付けない。\n":"")+"5. "+P55_SAFE;
  try{
    var r=s.json?await s.json(prompt):JSON.parse(String((await s(prompt)).text).replace(/^[^{]*/,"").replace(/[^}]*$/,""));
    if(!r||typeof r!=="object")throw {};
    PSW.ai={ok:!!r.ok,fixed:String(r.fixed||"").slice(0,200),points:(Array.isArray(r.points)?r.points:[]).slice(0,3).map(function(p){return {bad:String(p.bad||"").slice(0,60),good:String(p.good||"").slice(0,60),why:String(p.why||"").slice(0,160)};}),note:String(r.note||"").slice(0,160)};
    if(PSW.list[PSW.pos]===c.id)pswGrade(PSW.ai.ok?"ok":"no");
  }catch(e){PSW.ai={err:(typeof p55ErrMsg==="function"&&e&&e.code)?p55ErrMsg(e):"AIの判定がうまくいきませんでした。見本とくらべて、下のボタンで自分で判定してください。"};}
  PSW.busy=0;pswRender();
}
function pswNext(){PSW.pos++;PSW.ans="";PSW.res=null;PSW.ai=null;PSW.part="";if(PSW.pos>=PSW.list.length)PSW.done=1;pswRender();}
function pswSayHtml(){
  if(!PSW.list.length)return '<div class="psw-empty">作文の問題がありません。</div>';
  if(PSW.done||PSW.pos>=PSW.list.length)return '<div class="psw-card"><b class="psw-big">おつかれさまでした</b><p>'+PSW.list.length+'文、自分で文を作りました。まちがえた文は、復習の日に自動でまた出ます。</p><button type="button" class="psw-pri" data-act="pswagain">もう10文</button></div>';
  var c=pswCur(),R=PSW.res,A=PSW.ai,h='';
  h+='<div class="psw-prog">'+(PSW.pos+1)+' / '+PSW.list.length+(c.grammarPoint?' ・ '+esc(c.grammarPoint):'')+'</div>';
  h+='<div class="psw-card"><div class="psw-q">'+esc(c.ja)+'</div><div class="psw-qs">この文を'+P55_LANG_JA+'で言う・書く</div></div>';
  if(!R){
    h+='<textarea id="pswin" class="psw-in" rows="3" placeholder="'+P55_LANG_JA+'で入力" autocapitalize="off" autocomplete="off" spellcheck="false" lang="'+pswDictLang()+'">'+esc(PSW.ans)+'</textarea><div id="pswpart" class="psw-part"></div>'+pswMicHint()+
       '<div class="psw-row">'+pswMicBtn()+'<button type="button" class="psw-pri" data-act="pswcheck">答え合わせ</button></div>'+
       '<button type="button" class="psw-link" data-act="pswreveal">わからない（答えを見る）</button>';
    return h;
  }
  /* 結果 */
  var ok=R.ok||(A&&A.ok);
  h+='<div class="psw-res '+(ok?"ok":(A&&A.wait?"":"ng"))+'">';
  if(R.giveup)h+='<b>見本の答え</b>';
  else if(R.ok)h+='<b>正解！</b><span>'+(R.same?'見本と同じです。':'使った語は見本と同じです（並べ方はちがっても通じます）。')+'</span>';
  else if(A&&A.wait)h+='<b>AIが確かめています…</b>';
  else if(A&&A.ok)h+='<b>正解！</b><span>見本とはちがいますが、この言い方でも正しいです。</span>';
  else h+='<b>おしい</b>';
  h+='</div>';
  if(!R.giveup)h+='<div class="psw-kv"><span>あなた</span><p>'+esc(PSW.ans)+'</p></div>';
  h+='<div class="psw-kv"><span>見本</span><p class="psw-model">'+esc(c.accent||c.ru)+'</p><button type="button" class="psw-spk" data-act="pswspeak" aria-label="読み上げ">'+'▶'+'</button></div>';
  if(c.kana)h+='<div class="psw-kana">'+esc(c.kana)+'</div>';
  if(!R.ok&&!R.giveup&&(R.miss.length||R.extra.length))h+='<div class="psw-diff">'+(R.miss.length?'<div><span>足りない語</span>'+R.miss.map(function(w){return '<i class="m">'+esc(w)+'</i>';}).join("")+'</div>':'')+(R.extra.length?'<div><span>見本にない語</span>'+R.extra.map(function(w){return '<i class="x">'+esc(w)+'</i>';}).join("")+'</div>':'')+'</div>';
  if(A&&!A.wait){
    if(A.err)h+='<div class="psw-note">'+esc(A.err)+'</div>';
    else{
      if(!A.ok&&A.fixed)h+='<div class="psw-kv"><span>直すと</span><p>'+esc(A.fixed)+'</p></div>';
      if(A.points.length)h+='<ol class="psw-pts">'+A.points.map(function(p){return '<li><b>'+esc(p.bad)+'</b> → <b class="g">'+esc(p.good)+'</b><p>'+esc(p.why)+'</p></li>';}).join("")+'</ol>';
      if(A.note)h+='<div class="psw-note">'+esc(A.note)+'</div>';
      h+='<div class="psw-ai">AIの説明です。まちがうこともあります。</div>';
    }
  }
  if(c.gEasy)h+='<div class="psw-g"><span>この文のポイント</span>'+esc(c.gEasy)+'</div>';
  /* AIが使えないときは自分で判定 */
  if(!R.ok&&!R.giveup&&A&&A.err&&PSW.graded!==c.id)h+='<div class="psw-row"><button type="button" class="psw-sub" data-act="pswself" data-val="maybe">ほぼ合っていた</button><button type="button" class="psw-sub" data-act="pswself" data-val="no">まちがえた</button></div>';
  else if(!(A&&A.wait))h+='<button type="button" class="psw-pri wide" data-act="pswnext">次へ</button>';
  return h;
}

/* ---- ② 3文作文とAIの添削 ---- */
var PSW_TOPICS=["きのうしたこと","わたしの家族","好きな食べ物","週末の予定","わたしの町","仕事や学校","好きなこと（趣味）","今日の天気と、着ている服","朝おきてから家を出るまで","行ってみたい場所"];
function pswNewWrite(){
  var known=VOCAB.filter(function(w){return p47IsKnown(w.id)&&!/\s/.test(w.word);});
  var pool=known.length>=5?known.slice(-60):VOCAB.slice(0,120);
  PSW.w={topic:PSW_TOPICS[Math.floor(Math.random()*PSW_TOPICS.length)],words:shuffle(pool.slice()).slice(0,5).map(function(w){return w.id;}),text:"",res:null};
}
async function pswCorrect(){
  var W=PSW.w;if(!W)return;var el=document.getElementById("pswin");if(el)W.text=el.value;
  var lines=W.text.replace(/([.!?])\s+/g,"$1\n").split(/\n+/).map(function(x){return x.trim();}).filter(Boolean).slice(0,6);
  if(!lines.length){toast("まず文を書いてください");return;}
  try{if(PSW.dict&&PSW.dState!=="idle")PSW.dict.stop();}catch(_){}
  var s=null;try{s=await p55Sample();}catch(_){}
  if(!s){W.res={err:"AIの添削は、Claudeのページとして開いたときに使えます。"};pswRender();return;}
  PSW.busy=1;W.res={wait:1};pswRender();
  var prompt="あなたは日本人の初心者（"+pLvRange()+"レベル）に"+P55_LANG_JA+"を教える先生です。学習者がお題「"+W.topic+"」で次の文を書きました。\n"+JSON.stringify(lines)+"\n\n"+
    "1文ずつ添削して、次のJSONだけを返してください：{\"s\":[{\"orig\":\"書いた文\",\"fixed\":\"最小限に直した文\",\"ok\":真偽値,\"why\":[\"直した理由\"]}],\"good\":\"よかったところ\",\"next\":\"次に気をつけること\"}\n"+
    "ルール：\n1. 意味を変えず、学習者のレベルで自然な形に最小限だけ直す。正しい文は ok:true で fixed はそのまま、why は空。\n"+
    "2. why は初心者が一度で分かる日本語で、なぜその形か（名詞の性、格〔文の中での役目で語尾が変わること〕、動詞の人称・時制・体など）を具体的に。専門用語には（）で短い言いかえ。1つ80字まで、1文につき最大3つ。\n"+
    "3. 日本語で書かれた部分があれば、"+P55_LANG_JA+"での言い方を fixed に入れ、why で教える。\n4. good と next は日本語でそれぞれ60字まで。ほめすぎない。\n"+
    (P47_LANG==="ru"?"5. ロシア語にアクセント記号は付けない。\n":"")+"6. "+P55_SAFE;
  try{
    var r=s.json?await s.json(prompt):JSON.parse(String((await s(prompt)).text).replace(/^[^{]*/,"").replace(/[^}]*$/,""));
    var arr=(r&&Array.isArray(r.s))?r.s:[];if(!arr.length)throw {};
    W.res={s:arr.slice(0,6).map(function(x){return {o:String(x.orig||"").slice(0,200),f:String(x.fixed||"").slice(0,200),ok:!!x.ok,why:(Array.isArray(x.why)?x.why:[]).slice(0,3).map(function(y){return String(y).slice(0,160);})};}),good:String(r.good||"").slice(0,120),next:String(r.next||"").slice(0,120)};
    var S=pswSet();S.h.unshift({d:todayKey(),t:W.topic,s:W.res.s.map(function(x){return [x.o,x.f,x.ok?1:0];}),c:W.res.next});S.h=S.h.slice(0,10);
    try{saveAll();}catch(_){}
    try{coachLog({m:"write",id:"write:"+todayKey(),ok:W.res.s.every(function(x){return x.ok;}),s:Math.min(120,Math.round((Date.now()-(W.t0||Date.now()))/1000)),g:["write"],w:[]});}catch(_){}
  }catch(e){W.res={err:(typeof p55ErrMsg==="function"&&e&&e.code)?p55ErrMsg(e):"添削がうまくいきませんでした。もう一度押してください。"};}
  PSW.busy=0;pswRender();
}
function pswWriteHtml(){
  if(!PSW.w)pswNewWrite();var W=PSW.w,h='';
  h+='<div class="psw-card"><div class="psw-qs">お題</div><div class="psw-q">'+esc(W.topic)+'</div><div class="psw-qs">'+P55_LANG_JA+'で3文書いてみましょう。下の言葉を使うと、復習にもなります（使わなくてもかまいません）。</div>'+
     '<div class="psw-words">'+W.words.map(function(id){var w=WMAP[id];return w?'<span><b>'+esc(w.accent||w.word)+'</b>'+esc(String(w.meaning).split(/[、,;／]/)[0])+'</span>':'';}).join("")+'</div></div>';
  var R=W.res;
  if(!R||R.err){
    h+='<textarea id="pswin" class="psw-in" rows="5" placeholder="1文ずつ改行して書く" autocapitalize="sentences" autocomplete="off" spellcheck="false" lang="'+pswDictLang()+'">'+esc(W.text)+'</textarea><div id="pswpart" class="psw-part"></div>'+pswMicHint()+
       (R&&R.err?'<div class="psw-note">'+esc(R.err)+'</div>':'')+
       '<div class="psw-row">'+pswMicBtn()+'<button type="button" class="psw-pri" data-act="pswcorrect">添削してもらう</button></div>'+
       '<button type="button" class="psw-link" data-act="pswtopic">お題と言葉を変える</button>';
  }else if(R.wait){h+='<div class="psw-res"><b>添削しています…</b></div>';}
  else{
    h+=R.s.map(function(x,i){return '<div class="psw-ws'+(x.ok?" ok":"")+'"><div class="psw-wn">'+(i+1)+(x.ok?' ・ そのままで正しい':' ・ 直したところ')+'</div><p class="o">'+esc(x.o)+'</p>'+(x.ok?'':'<p class="f">'+esc(x.f)+'<button type="button" class="psw-spk" data-act="pswspeakt" data-val="'+esc(x.f)+'" aria-label="読み上げ">▶</button></p>')+(x.why.length?'<ul>'+x.why.map(function(y){return '<li>'+esc(y)+'</li>';}).join("")+'</ul>':'')+'</div>';}).join("");
    if(R.good)h+='<div class="psw-kv"><span>よかったところ</span><p>'+esc(R.good)+'</p></div>';
    if(R.next)h+='<div class="psw-kv"><span>次に気をつけること</span><p>'+esc(R.next)+'</p></div>';
    h+='<div class="psw-ai">AIの添削です。まちがうこともあります。</div><button type="button" class="psw-pri wide" data-act="pswtopic">次のお題で書く</button>';
  }
  var H=pswSet().h;
  if(H.length)h+='<details class="psw-hist"><summary>これまでの作文（'+H.length+'）</summary>'+H.map(function(x){return '<div><span>'+esc(x.d)+' ・ '+esc(x.t)+'</span>'+x.s.map(function(y){return '<p>'+esc(y[2]?y[0]:y[1])+'</p>';}).join("")+'</div>';}).join("")+'</details>';
  return h;
}

/* ---- 画面 ---- */
function pswEl(){var m=document.getElementById("psw");if(!m){m=document.createElement("div");m.id="psw";document.body.appendChild(m);}return m;}
function pswRender(){
  var m=pswEl();if(!PSW.open){m.className="";m.innerHTML="";return;}
  var y=0,b0=m.querySelector(".psw-body");if(b0)y=b0.scrollTop;
  var foc=document.activeElement&&document.activeElement.id==="pswin";
  m.className="show";
  m.innerHTML='<div class="psw-top"><button type="button" class="psw-x" data-act="pswclose" aria-label="閉じる">‹</button><b>話す・書く練習</b></div>'+
    '<div class="psw-tabs" role="tablist"><button type="button" class="'+(PSW.tab==="say"?"on":"")+'" data-act="pswtab" data-val="say">作文で答える</button><button type="button" class="'+(PSW.tab==="write"?"on":"")+'" data-act="pswtab" data-val="write">3文作文と添削</button></div>'+
    '<div class="psw-body">'+(PSW.tab==="say"?pswSayHtml():pswWriteHtml())+'</div>';
  var b=m.querySelector(".psw-body");if(b)b.scrollTop=y;
  var el=document.getElementById("pswin");
  if(el){el.addEventListener("input",function(){if(PSW.tab==="say")PSW.ans=el.value;else if(PSW.w)PSW.w.text=el.value;});if(foc)el.focus();}
}
function pswOpen(tab){PSW.open=1;PSW.tab=tab||"say";PSW.done=0;if(PSW.tab==="say"&&!PSW.list.length)pswStartSay();if(PSW.tab==="write"&&!PSW.w)pswNewWrite();if(PSW.w)PSW.w.t0=Date.now();document.body.classList.add("p81-open");pswRender();}
function pswClose(){try{if(PSW.dict&&PSW.dState!=="idle")PSW.dict.stop();}catch(_){}PSW.open=0;document.body.classList.remove("p81-open");pswRender();try{render();}catch(_){}}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");if(a.indexOf("psw")!==0)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="pswopen")pswOpen(v||"say");
  else if(a==="pswclose")pswClose();
  else if(a==="pswtab"){try{if(PSW.dict&&PSW.dState!=="idle")PSW.dict.stop();}catch(_){}PSW.tab=v;if(v==="say"&&!PSW.list.length)pswStartSay();pswRender();}
  else if(a==="pswmic"){
    /* start() はクリックの中ですぐ呼ぶ（間に await をはさまない） */
    var d=PSW.dict;if(!d)return;
    if(PSW.dState!=="idle"){d.stop().catch(function(){});return;}
    var inp=document.getElementById("pswin");if(inp){if(PSW.tab==="say")PSW.ans=inp.value;else if(PSW.w)PSW.w.text=inp.value;}
    d.start({language:pswDictLang()}).catch(function(err){var c=err&&err.code;
      if(c==="not_granted")toast("マイクが許可されていません。キーボードのマイクか、文字で答えてください");
      else if(c==="unavailable"){PSW.dict=null;toast("この画面では声の入力が使えません。キーボードのマイクで話してください");}
      else if(c!=="stopped"&&c!=="dismissed")toast("声の入力がうまくいきませんでした");
      pswRender();});
  }
  else if(a==="pswcheck")pswCheck();
  else if(a==="pswreveal")pswReveal();
  else if(a==="pswself"){pswGrade(v==="maybe"?"maybe":"no");pswNext();}
  else if(a==="pswnext")pswNext();
  else if(a==="pswagain"){PSW.done=0;pswStartSay();pswRender();}
  else if(a==="pswspeak"){var c=pswCur();if(c)try{speak(c.accent||c.ru);}catch(_){}}
  else if(a==="pswspeakt"){try{speak(v);}catch(_){}}
  else if(a==="pswcorrect")pswCorrect();
  else if(a==="pswtopic"){pswNewWrite();PSW.w.t0=Date.now();pswRender();}
},true);
/* 「このあと」シートの「ほかのやり方」に入口（ホームにはカードを足さない） */
if(typeof p87PlanHtml==="function"){
  var _pswPlan=p87PlanHtml;
  p87PlanHtml=function(){
    var h=String(_pswPlan.apply(this,arguments));
    var row='<button type="button" class="p81-row" data-act="p87go" data-val="pswopen"><span class="p81-ric">'+(typeof P55_MIC!=="undefined"?P55_MIC:'')+'</span><span class="p81-rtx"><b>話す・書く練習</b><small>日本語を見て自分で文を作る・3文作文をAIが添削</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button>';
    var i=h.indexOf('data-val="p88open"');if(i>=0){i=h.lastIndexOf("<button",i);return h.slice(0,i)+row+h.slice(i);}
    i=h.lastIndexOf("</div>");return i>=0?h.slice(0,i)+row+h.slice(i):h+row;
  };
}
(function(){
  var css='#psw{display:none}#psw.show{display:flex;flex-direction:column;position:fixed;inset:0;z-index:212;background:var(--bg);color:var(--ink)}'+
    '.psw-top{display:flex;align-items:center;gap:8px;padding:calc(10px + env(safe-area-inset-top)) 12px 6px}.psw-top b{font-size:17px}'+
    '.psw-x{width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:24px;line-height:1;cursor:pointer}'+
    '.psw-tabs{display:grid;grid-template-columns:1fr 1fr;gap:4px;margin:4px 14px 8px;padding:3px;border:1px solid var(--line);border-radius:12px;background:var(--card)}'+
    '.psw-tabs button{min-height:40px;border:0;border-radius:9px;background:none;color:var(--muted);font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}.psw-tabs button.on{background:var(--card2);color:var(--ink)}'+
    '.psw-body{flex:1;overflow-y:auto;padding:4px 14px calc(24px + env(safe-area-inset-bottom));max-width:600px;width:100%;margin:0 auto;box-sizing:border-box}'+
    '.psw-prog{font-size:12.5px;color:var(--muted);font-weight:600;margin:2px 2px 8px}'+
    '.psw-card{border:1px solid var(--line);border-radius:16px;background:var(--card);padding:16px}.psw-q{font-size:19px;font-weight:800;line-height:1.5;margin:2px 0}.psw-qs{font-size:12.5px;color:var(--muted);line-height:1.6}'+
    '.psw-card p{font-size:14px;line-height:1.7;margin:8px 0 14px}.psw-big{font-size:18px}'+
    '.psw-in{display:block;width:100%;box-sizing:border-box;margin-top:12px;border:1px solid var(--lineStrong,var(--line));border-radius:14px;background:var(--card);color:var(--ink);font:inherit;font-size:18px;line-height:1.5;padding:12px 14px;resize:vertical}'+
    '.psw-part{min-height:1.2em;font-size:14px;color:var(--muted);padding:4px 4px 0}.psw-hint{font-size:12.5px;color:var(--muted);line-height:1.6;padding:2px 4px}'+
    '.psw-row{display:flex;gap:8px;margin-top:10px}.psw-row>*{flex:1}'+
    '.psw-pri{min-height:50px;border:0;border-radius:14px;background:var(--accent);color:#fff;font:inherit;font-size:16px;font-weight:800;cursor:pointer}.psw-pri.wide{width:100%;margin-top:14px}.psw-pri[disabled]{opacity:.5}'+
    '.psw-sub{min-height:48px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}'+
    '.psw-mic{min-height:50px;border:1px solid var(--accent);border-radius:14px;background:var(--card);color:var(--accent);font:inherit;font-weight:800;display:flex;align-items:center;justify-content:center;gap:6px;cursor:pointer}.psw-mic.on{background:var(--accent);color:#fff}'+
    '.psw-link{display:block;margin:12px auto 0;border:0;background:none;color:var(--muted);font:inherit;font-size:13.5px;text-decoration:underline;cursor:pointer;min-height:40px}'+
    '.psw-res{margin-top:12px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);display:flex;flex-direction:column;gap:3px}.psw-res b{font-size:16px}.psw-res span{font-size:13.5px;color:var(--muted)}.psw-res.ok{border-color:var(--good)}.psw-res.ok b{color:var(--good)}.psw-res.ng b{color:var(--warn)}'+
    '.psw-kv{position:relative;margin-top:10px;padding:10px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card)}.psw-kv span{font-size:12px;color:var(--muted);font-weight:700}.psw-kv p{margin:3px 0 0;font-size:17px;line-height:1.55;padding-right:40px;overflow-wrap:anywhere}'+
    '.psw-model{font-weight:800}.psw-spk{position:absolute;right:8px;top:50%;transform:translateY(-50%);width:36px;height:36px;border-radius:50%;border:1px solid var(--line);background:var(--card2);color:var(--ink);cursor:pointer}'+
    '.psw-kana{font-size:13px;color:var(--sub,var(--muted));padding:4px 6px 0}'+
    '.psw-diff{margin-top:10px;font-size:13px;display:flex;flex-direction:column;gap:6px}.psw-diff div{display:flex;flex-wrap:wrap;gap:5px;align-items:center}.psw-diff span{color:var(--muted);font-weight:700;margin-right:4px}.psw-diff i{font-style:normal;padding:2px 8px;border-radius:8px;border:1px solid var(--line)}.psw-diff i.m{border-color:var(--good)}.psw-diff i.x{border-color:var(--warn);text-decoration:line-through}'+
    '.psw-pts{margin:10px 0 0;padding-left:22px;font-size:14px;line-height:1.7}.psw-pts li{margin-bottom:6px}.psw-pts b.g{color:var(--good)}.psw-pts p{margin:2px 0 0}'+
    '.psw-note{margin-top:10px;font-size:13.5px;line-height:1.7;padding:10px 12px;border-radius:12px;background:var(--card2)}.psw-ai{font-size:11.5px;color:var(--muted);margin-top:6px}'+
    '.psw-g{margin-top:10px;font-size:13.5px;line-height:1.7;color:var(--ink)}.psw-g span{display:block;font-size:12px;color:var(--muted);font-weight:700}'+
    '.psw-words{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.psw-words span{font-size:12.5px;padding:4px 9px;border-radius:9px;background:var(--card2);display:flex;gap:6px;align-items:baseline}.psw-words b{font-size:14px}'+
    '.psw-ws{margin-top:10px;padding:10px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card)}.psw-ws.ok{border-color:var(--good)}.psw-wn{font-size:12px;color:var(--muted);font-weight:700}'+
    '.psw-ws p{margin:4px 0;font-size:16px;line-height:1.55;overflow-wrap:anywhere}.psw-ws p.o{color:var(--muted)}.psw-ws:not(.ok) p.o{text-decoration:line-through;text-decoration-thickness:1px}.psw-ws p.f{position:relative;font-weight:700;color:var(--good);padding-right:42px}.psw-ws ul{margin:6px 0 0;padding-left:20px;font-size:13.5px;line-height:1.7}'+
    '.psw-hist{margin-top:18px;border-top:1px solid var(--line);padding-top:8px}.psw-hist summary{font-size:13.5px;font-weight:700;color:var(--muted);padding:8px 0;cursor:pointer}.psw-hist div{padding:6px 0;border-bottom:1px solid var(--line)}.psw-hist span{font-size:12px;color:var(--muted)}.psw-hist p{margin:2px 0;font-size:14px}'+
    '.psw-empty{padding:30px 10px;text-align:center;color:var(--muted)}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
