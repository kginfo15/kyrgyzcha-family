/* ===== Phase78：1つ前の画面にもどる =====
   ・冒険の画面の左上に「‹」。物語を読む画面 → 話の一覧、ほかのタブ → 地図、道を選ぶ画面 → 冒険の画面、地図 → ホーム。
   ・冒険や文法解説書から始めたレッスンは、終わったり「×」でやめたりしたとき、始めた画面にもどる（ホームまでもどらない）。 */
var P78_RET=null,P78_CHOOSE=false;
if(typeof p74Open==="function"){var _p78Open=p74Open;p74Open=function(choose){var P=null;try{P=p74Path();}catch(_){}P78_CHOOSE=!!choose||!P;return _p78Open.apply(this,arguments);};}
if(typeof p74Page==="function"){var _p78Page=p74Page;p74Page=function(){var m=_p78Page.apply(this,arguments);try{var h=m.querySelector(".p70-phead");if(h&&!h.querySelector(".p78-back"))h.insertAdjacentHTML("afterbegin",'<button type="button" class="p78-back" data-act="p78back" aria-label="1つ前にもどる">‹</button>');}catch(_){}return m;};}
function p78Back(){var P=null;try{P=p74Path();}catch(_){}
  if(P78_CHOOSE&&P&&p74Story()){p74Open(false);return;}
  if(P74_VIEW==="read"){P74_VIEW="story";p74Open(false);return;}
  if(P74_VIEW&&P74_VIEW!=="map"){P74_VIEW="map";p74Open(false);return;}
  p70ClosePage();try{render();}catch(_){}}
if(typeof p71Start==="function"){var _p78Start=p71Start;p71Start=function(){var pg=document.getElementById("p70page");P78_RET=(pg&&/show/.test(pg.className))?"quest":null;return _p78Start.apply(this,arguments);};}
if(typeof p77GpStart==="function"){var _p78Gp=p77GpStart;p77GpStart=function(t){var r=_p78Gp.apply(this,arguments);if(P71&&P71.gp)P78_RET="guide:"+t;return r;};}
if(typeof p72FavStart==="function"){var _p78Fav=p72FavStart;p72FavStart=function(){P78_RET=null;return _p78Fav.apply(this,arguments);};}
if(typeof p71Close==="function"){var _p78Close=p71Close;p71Close=function(){var r=P78_RET;P78_RET=null;_p78Close.apply(this,arguments);
  try{if(r==="quest")p74Open(false);else if(r&&r.indexOf("guide:")===0)p72GuideOpen(r.slice(6));}catch(_){}};}
if(typeof p71Render==="function"){var _p78R=p71Render;p71Render=function(){var x=_p78R.apply(this,arguments);try{if(P71&&P78_RET){var lab=P78_RET==="quest"?"冒険にもどる":"文法解説書にもどる";
  var bs=document.querySelectorAll('[data-act="p71close"]');for(var i=0;i<bs.length;i++)if(/ホーム/.test(bs[i].textContent))bs[i].textContent=lab;}}catch(_){}return x;};}
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest('[data-act="p78back"]'):null;if(!el)return;e.stopImmediatePropagation();e.preventDefault();p78Back();},true);
(function(){try{var st=document.createElement("style");st.textContent='.p78-back{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:700 24px/1 system-ui,sans-serif;padding:0 0 3px;margin-right:10px;cursor:pointer}.p70-phead{display:flex;align-items:center}.p70-phead>b{flex:1}';document.head.appendChild(st);}catch(_){}})();
