/* ===== PHASE57: 最終チェックでの修正（戻る動作の統一など） ===== */
/* その他の練習：ほかの画面と同じく左上に戻るボタン（ホームへ） */
var _p57Hub=renderLearnHub;
renderLearnHub=function(){
  return String(_p57Hub.apply(this,arguments)).replace('<div class="p51-hubhead"><div class="p48-title" style="margin-bottom:4px">その他の練習</div>',
    '<div class="p51-hubhead"><div class="p51-head" style="margin-bottom:6px"><button type="button" class="p51-back" data-act="p57home" aria-label="ホームへ戻る"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg></button><span class="p51-headt">その他の練習</span></div>');
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  if(el.getAttribute("data-act")!=="p57home")return;
  e.stopImmediatePropagation();e.preventDefault();
  try{window.speechSynthesis.cancel();}catch(_){}
  if(ui.listen)ui.listen.playing=false;
  clearTransientUI();ui.learnOpen=false;ui.bnav="home";saveUI();render();window.scrollTo(0,0);
},true);
