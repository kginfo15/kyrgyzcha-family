/* ===== PHASE65: まとめて練習・作文カードもスクロールなしで1画面に収める ===== */
/* カード式の学習画面（下に固定ボタンがある画面）は、上の帯と下のタブを隠し、
   カードだけが必要なときに内側でスクロールする。ページ自体はスクロールしない。 */
function p65Apply(){
  var b=document.body,m=document.getElementById("main");
  var study=!!(m&&m.querySelector(".study > .p12-stickybar")),pick=!!(m&&m.querySelector(".p49-pick"));
  b.classList.toggle("p65-study",study);b.classList.toggle("p65-pick",pick);
  if(study||pick)window.scrollTo(0,0);
}
var _p65Render=render;
render=function(){var r=_p65Render.apply(this,arguments);try{p65Apply();}catch(_){}return r;};
(function(){
  var st=document.createElement("style");
  st.textContent=
  'body.p65-study header.app,body.p65-study nav.bnav,body.p65-pick header.app,body.p65-pick nav.bnav{display:none!important}'+
  'html:has(body.p65-study),body.p65-study,html:has(body.p65-pick),body.p65-pick{overflow:hidden!important;height:100%!important;overscroll-behavior:none}'+
  'body.p65-study #main .study{position:fixed!important;inset:0!important;z-index:20;display:flex!important;flex-direction:column!important;box-sizing:border-box!important;max-width:560px;margin:0 auto!important;'+
    'padding:calc(12px + env(safe-area-inset-top)) 16px calc(104px + env(safe-area-inset-bottom))!important;background:var(--bg)!important}'+
  'body.p65-study #main .study > *{flex:0 0 auto}'+
  'body.p65-study #main .study > .card{flex:0 1 auto!important;min-height:0!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;margin-bottom:0!important;border-radius:16px!important}'+
  'body.p65-study #main .study > .p12-stickybar{position:fixed!important;left:0!important;right:0!important;bottom:0!important;top:auto!important;padding-bottom:calc(10px + env(safe-area-inset-bottom))!important;background:var(--bg)!important;border-top:1px solid var(--line)!important;z-index:30}'+
  'body.p65-study #main .study > .p12-stickybar .inner{max-width:560px;margin:0 auto!important;background:none!important;border:none!important}'+
  'body.p65-study .ans3btn{border-radius:12px!important;font-weight:700!important}'+
  /* 範囲選び：絵をやめて詰める */
  'body.p65-pick .p49-pickhead,.p49-scopeic{display:none!important}'+
  'body.p65-pick #main .p49-pick{position:fixed!important;inset:0!important;z-index:20;overflow-y:auto;box-sizing:border-box;max-width:560px;margin:0 auto!important;padding:calc(18px + env(safe-area-inset-top)) 16px calc(16px + env(safe-area-inset-bottom))!important;background:var(--bg)!important;border-radius:0!important;border:none!important}'+
  'body.p65-pick .p49-pickbody{padding:0!important}body.p65-pick .p49-pickbody h2{font-size:24px!important;font-weight:700!important;margin:4px 0 6px!important}body.p65-pick .p49-pickbody p{font-size:13px!important;margin:0 0 14px!important}'+
  'body.p65-pick .p49-scope{padding:13px 14px!important;margin-bottom:8px!important;border-radius:14px!important;min-height:0!important}body.p65-pick .p49-ghost{margin-top:6px!important;border-radius:12px!important}';
  document.head.appendChild(st);
})();
