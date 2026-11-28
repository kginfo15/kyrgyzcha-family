/* ===== PHASE89: 音を出せないとき（電車の中など）に、聞き取り問題を「文字で見る」に切りかえる =====
   settings.noSound が true のあいだ：
   ・聞き取り問題は、音の代わりにロシア語の文字を出して解く（単語クイズ・到達テスト・難易度の練習・検定対策）
   ・読み上げ（speak／speakUtterance）は鳴らさない
   ・切りかえボタン（nsBtn）は、聞き取り問題の画面にいつも出す。押すたびに 音あり ⇄ 文字で見る が入れかわる
   記録：単語クイズ・練習はふつうに数える。検定対策の聴解だけは「耳で聞き取れた」証拠にならないので、
   文字で解いた回は周回には数えるが「定着」の段は上げない（phase86 側で処理）。 */
function nsOn(){try{return !!settings.noSound;}catch(_){return false;}}
function nsBtn(){
  return nsOn()
    ?'<button type="button" class="ns-btn on" data-act="nsToggle"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8q3 4 0 8" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>文字で見ています　<b>音で聞くにもどす</b></span></button>'
    :'<button type="button" class="ns-btn" data-act="nsToggle"><svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 9l5 6M21 9l-5 6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/></svg><span>音を出せないときは　<b>文字で見る</b></span></button>';
}
/* 読み上げを止める */
if(typeof speak==="function"){var _nsSpeak=speak;speak=function(){if(nsOn()){try{speechSynthesis.cancel();}catch(_){}return;}return _nsSpeak.apply(this,arguments);};}
if(typeof speakUtterance==="function"){var _nsSpeakU=speakUtterance;speakUtterance=function(){if(nsOn())return Promise.resolve();return _nsSpeakU.apply(this,arguments);};}
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
 '.ns-note{font-size:12px;color:var(--muted);text-align:center;margin:4px 0 0}';
 document.head.appendChild(c);})();
