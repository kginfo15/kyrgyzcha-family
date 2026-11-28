/* ===== PHASE89: 音を出せないとき（電車の中など）に、聞き取り問題を「文字で見る」に切りかえる =====
   settings.noSound が true のあいだ：
   ・聞き取り問題は、音の代わりにロシア語の文字を出して解く（単語クイズ・到達テスト・難易度の練習・検定対策）
   ・自動で流れる読み上げ（speak／speakUtterance）は鳴らさない。スピーカーのボタンを自分で押したときだけ鳴らす
   ・切りかえボタン（nsBtn）は、聞き取り問題の画面にいつも出す。押すたびに 音あり ⇄ 文字で見る が入れかわる
   記録：単語クイズ・練習はふつうに数える。検定対策の聴解だけは「耳で聞き取れた」証拠にならないので、
   文字で解いた回は周回には数えるが「定着」の段は上げない（phase86 側で処理）。 */
function nsOn(){try{return !!settings.noSound;}catch(_){return false;}}
function nsBtn(){
  return nsOn()
    ?'<button type="button" class="ns-btn on" data-act="nsToggle"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8q3 4 0 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>文字で見ています　<b>音で聞くにもどす</b></span></button>'
    :'<button type="button" class="ns-btn" data-act="nsToggle"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>音を出せないときは　<b>文字で見る</b></span></button>';
}
/* 読み上げを止めるのは「自動で流れる音」だけ。スピーカーのボタンを自分で押したときは、文字で見るモードでも鳴らす
   （押した瞬間を pointerdown で記録し、その直後の読み上げは通す） */
var NS_TAP=0;
function nsTapOk(){return Date.now()-NS_TAP<1500;}
["pointerdown","touchstart","mousedown"].forEach(function(ev){window.addEventListener(ev,function(e){
  var el=e.target&&e.target.closest?e.target.closest('[data-act*="say"],[data-act="p86play"],[data-say],.p52-spk,.p52-listen,.p75-play,.p86-play,[class*="spk"],[aria-label*="聞く"],[aria-label*="読み上げ"]'):null;
  if(el)NS_TAP=Date.now();},{capture:true,passive:true});});
if(typeof speak==="function"){var _nsSpeak=speak;speak=function(){if(nsOn()&&!nsTapOk()){try{speechSynthesis.cancel();}catch(_){}return;}return _nsSpeak.apply(this,arguments);};}
if(typeof speakUtterance==="function"){var _nsSpeakU=speakUtterance;speakUtterance=function(){if(nsOn()&&!nsTapOk())return Promise.resolve();return _nsSpeakU.apply(this,arguments);};}
function nsToggle(){
  settings.noSound=!nsOn();try{saveAll();}catch(_){}
  if(settings.noSound){try{speechSynthesis.cancel();}catch(_){}}
  toast(settings.noSound?"文字で見るモードにしました（音は出ません）":"音で聞くモードにもどしました");
  try{document.dispatchEvent(new CustomEvent("nschange"));}catch(_){}
  var p71=document.getElementById("p71");
  if(typeof P71!=="undefined"&&P71&&p71&&p71.classList.contains("show")){try{p71Render();}catch(_){}}
  else{try{render();}catch(_){}}
}
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest('[data-act="nsToggle"]'):null;if(!el)return;e.stopImmediatePropagation();e.preventDefault();nsToggle();},true);
(function(){var c=document.createElement("style");c.textContent=
 '.ns-btn{display:inline-flex;align-items:center;gap:6px;margin:8px auto 0;padding:6px 12px;min-height:36px;border:1px solid var(--line);border-radius:999px;background:none;color:var(--muted);font:inherit;font-size:12.5px;cursor:pointer;max-width:100%;text-align:left}'+
 '.ns-btn b{color:var(--accent,#0a84ff);font-weight:700}.ns-btn.on{border-color:var(--accent,#0a84ff)}.ns-btn svg{flex:none}'+
 '.ns-wrap{display:flex;justify-content:center}.ns-text{font-size:clamp(22px,6.5vw,28px);font-weight:800;line-height:1.4;text-align:center;overflow-wrap:anywhere;margin:6px 0}'+
 '.p52-card>.p73-fav+.p52-tag,.p52-card>.p52-bm+.p52-tag{display:block;margin-top:44px!important}'+
 '.ns-note{font-size:12px;color:var(--muted);text-align:center;margin:4px 0 0}';
 document.head.appendChild(c);})();

/* ===== 自動の読み上げ（音を出すモードのとき） =====
   次の問題に進んだら、単語の問題は自動で1回読む。穴埋めは答えが分かってしまうので読まない（答えたあとに「文全体を聞く」ボタン）。
   設定の「自動音声」（settings.autoSpeak）がオフのとき、文字で見るモードのときは読まない。
   iPhone では、画面を押した直後でないと読み上げが始まらないことがあるため、「次へ」を押したその流れの中で読む。 */
var AUTO_KEY=null;
function autoOk(){try{return settings.autoSpeak!==false&&!nsOn();}catch(_){return false;}}
function autoSay(key,text,fn){if(!autoOk()||AUTO_KEY===key)return;AUTO_KEY=key;try{if(fn)fn();else speak(text);}catch(_){}}
function sayAllBtn(text){return '<button type="button" class="say-all" data-act="p71say" data-val="'+esc(String(text).replace(/́/g,""))+'"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8q3 4 0 8M18.5 5.5q5 6.5 0 13" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>文全体を聞く</span></button>';}
/* 単語クイズ（4択）：新しい単語・「意味はどれ？」・「聞こえた単語の意味は？」は出たときに読む（「ロシア語でどう言う？」は答えになるので読まない） */
if(typeof p52Render==="function"){var _nsP52=p52Render;p52Render=function(s){var h=_nsP52.apply(this,arguments);
  try{var q=s&&s.p52,w=q&&WMAP[q.id];
    if(w&&(q.type==="intro"||/^(meaning|listen)$/.test(q.type)&&q.pick===null))autoSay("p52:"+q.id+":"+(s.pos||0)+":"+q.type,w.accent||w.word);
    else if(w&&q.type==="reverse"&&q.pick!==null)autoSay("p52a:"+q.id+":"+(s.pos||0),w.accent||w.word);}catch(_){}
  return h;};}
/* 一歩レッスン：新しい言葉のカードは読む。「絵と意味に合う言葉は？」は答えになるので、答えたあとに正解の言葉を読む */
if(typeof p71Render==="function"){var _nsP71=p71Render;p71Render=function(){var r=_nsP71.apply(this,arguments);
  try{var S=P71,x=S&&!S.confirm&&S.steps[S.pos];if(x&&!x.m){var w=WMAP[x.id];
    if(x.t==="card"&&w)autoSay("p71c:"+S.pos+":"+x.id,w.accent||w.word);
    else if(x.t==="pick"&&w&&S.picked!==null)autoSay("p71p:"+S.pos+":"+x.id,w.accent||w.word);}}catch(_){}
  return r;};}
(function(){var c=document.createElement("style");c.textContent=
 '.say-all{display:inline-flex;align-items:center;gap:6px;margin:6px 0 2px;padding:6px 14px;min-height:40px;border:1px solid var(--accent,#0a84ff);border-radius:999px;background:none;color:var(--accent,#0a84ff);font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}'+
 '.p86x .p86-why{text-align:left}.p86x{margin-top:8px}';
 document.head.appendChild(c);})();
