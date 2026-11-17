/* ===== PHASE64: 右上のボタンから「見た目の変更」を開く ／ ホームはスクロールなしで1画面に収める ===== */
function p64Sheet(){var s=document.getElementById("p64sheet");if(!s){s=document.createElement("div");s.id="p64sheet";document.body.appendChild(s);}return s;}
function p64Fill(){
  var s=p64Sheet();
  s.innerHTML='<div class="p64-mask" data-act="p64close"></div><div class="p64-panel" role="dialog" aria-label="見た目の変更"><div class="p64-ph"><b>見た目の変更</b><button type="button" class="p64-x" data-act="p64close" aria-label="閉じる"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="p64-pb">'+p62SettingsUI()+'</div></div>';
}
function p64Open(){p64Fill();p64Sheet().className="show";}
function p64Close(){var s=p64Sheet();s.className="";s.innerHTML="";}
(function(){
  var hd=document.querySelector("header.app");
  if(hd&&!document.getElementById("p64btn")){
    var b=document.createElement("button");b.type="button";b.id="p64btn";b.setAttribute("data-act","p64open");b.setAttribute("aria-label","ホーム画面の形と色を変える");
    b.innerHTML='<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2.2"/><circle cx="9" cy="17" r="2.2"/></svg>';
    hd.appendChild(b);
  }
})();
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a==="p64open"){e.stopImmediatePropagation();e.preventDefault();p64Open();return;}
  if(a==="p64close"){e.stopImmediatePropagation();e.preventDefault();p64Close();return;}
},true);
/* ホーム：内容が画面に収まるまで段階的に詰め、収まったらスクロールを止める */
function p64FitHome(){
  var b=document.body,isHome=ui.bnav==="home"&&!ui.learnOpen&&!!document.querySelector("#main .p47-home")&&!document.querySelector("#main .p52-top");
  b.classList.remove("p64-t1","p64-t2","p64-t3","p64-lock");
  b.classList.toggle("p64-home",isHome);
  if(!isHome)return;
  var nav=document.querySelector("nav.bnav"),home=document.querySelector("#main .p47-home");
  var fits=function(){var lim=(nav&&getComputedStyle(nav).display!=="none"?nav.getBoundingClientRect().top:window.innerHeight)-6,mx=0;
    for(var i=0;i<home.children.length;i++){var r=home.children[i].getBoundingClientRect();if(r.height>0&&r.bottom>mx)mx=r.bottom;}
    return mx<=lim;};
  window.scrollTo(0,0);
  var steps=["p64-t1","p64-t2","p64-t3"];
  for(var i=0;i<steps.length&&!fits();i++)b.classList.add(steps[i]);
  if(fits())b.classList.add("p64-lock");
}
var _p64Render=render;
render=function(){
  var r=_p64Render.apply(this,arguments);
  try{p64FitHome();if(p64Sheet().className==="show")p64Fill();}catch(_){}
  return r;
};
window.addEventListener("resize",function(){try{p64FitHome();}catch(_){}});
(function(){
  var st=document.createElement("style");
  st.textContent=
  'header.app{position:relative}#p64btn{position:absolute;right:16px;top:50%;transform:translateY(-50%);width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
  '#p64sheet{display:none}#p64sheet.show{display:block;position:fixed;inset:0;z-index:200}.p64-mask{position:absolute;inset:0;background:rgba(0,0,0,.55)}'+
  '.p64-panel{position:absolute;left:0;right:0;bottom:0;max-height:86vh;max-width:560px;margin:0 auto;background:var(--bg);border-top:1px solid var(--line);border-radius:18px 18px 0 0;display:flex;flex-direction:column}'+
  '.p64-ph{display:flex;align-items:center;justify-content:space-between;padding:16px 16px 10px}.p64-ph b{font-size:17px;font-weight:700}.p64-x{width:34px;height:34px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
  '.p64-pb{overflow-y:auto;-webkit-overflow-scrolling:touch;padding:4px 16px calc(20px + env(safe-area-inset-bottom))}.p64-pb .p62-set{margin:0}'+
  /* ホームを詰める */
  'body.p64-home header.app{padding-top:10px!important;padding-bottom:10px!important}'+
  'body.p64-home .p47-home{padding-bottom:0!important}body.p64-home .p47-top{margin-bottom:10px!important}body.p64-home .p56-goal{margin-bottom:10px!important}'+
  'body.p64-home .p47-card{padding:12px 14px!important;margin-bottom:7px!important}body.p64-home .p47-more{margin-top:4px!important;padding-top:8px!important;padding-bottom:8px!important}'+
  'body.p64-home .p47-herobody{padding-top:14px!important;padding-bottom:6px!important}body.p64-home .p47-cta{margin:10px 14px 14px!important;padding:13px!important}body.p64-home .p53-note{margin-bottom:8px!important}'+
  'body.p64-t1 .p47-card small,body.p64-t1 .p62-lrow small{display:none!important}body.p64-t1 .p47-big{font-size:38px!important}body.p64-t1 .p62-lrow{padding:11px 14px!important}body.p64-t1 .p47-greet{font-size:22px!important}'+
  'body.p64-t2 .p47-date,body.p64-t2 .p47-sub,body.p64-t2 .p53-note{display:none!important}body.p64-t2 .p47-card{padding:10px 14px!important;margin-bottom:6px!important}body.p64-t2 .p47-cta{padding:11px!important;margin:8px 14px 12px!important}body.p64-t2 .p62-lrow{padding:9px 14px!important}'+
  'body:not(.p63-art).p64-home .p47-herobody{min-height:0!important}'+
  'body.p64-t3 .p56-goal{display:none!important}body.p64-t3 .p47-big{font-size:32px!important}body.p64-t3 .p47-heroart{max-height:120px!important}'+
  'html:has(body.p64-lock),body.p64-lock{overflow:hidden!important;height:100%!important;overscroll-behavior:none}';
  document.head.appendChild(st);
})();
