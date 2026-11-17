/* ===== PHASE66: 単語の絵をイラスト画像に（Microsoft Fluent Emoji 3D・MITライセンス、pics/atlas.webp） ===== */
var P66=/*P66S*/null/*P66E*/;
var P66_OK=false;
function p66Seg(s){
  try{var out=[],it=new Intl.Segmenter(undefined,{granularity:"grapheme"}).segment(String(s));for(var x of it)out.push(x.segment);return out;}
  catch(_){return [String(s)];}
}
function p66Fill(d,pic){
  d.textContent="";
  var parts=p66Seg(pic),ok=P66_OK&&P66&&parts.every(function(g){return P66.map[g]!==undefined;});
  if(!ok){d.textContent=pic;d.classList.remove("p66-img");return;}
  d.classList.add("p66-img");
  parts.forEach(function(g){
    var i=P66.map[g],c=i%P66.cols,r=Math.floor(i/P66.cols),t=document.createElement("i");
    t.className="p66-t";
    t.style.backgroundSize=(P66.cols*100)+"% "+(P66.rows*100)+"%";
    t.style.backgroundPosition=(P66.cols>1?c/(P66.cols-1)*100:0)+"% "+(P66.rows>1?r/(P66.rows-1)*100:0)+"%";
    d.appendChild(t);
  });
}
p59Put=function(el,pic,cls){
  if(!el||!pic)return;var prev=el.previousElementSibling;
  if(prev&&prev.classList&&prev.classList.contains("p59-pic"))return;
  var d=document.createElement("div");d.className="p59-pic"+(cls?" "+cls:"");d.setAttribute("aria-hidden","true");
  p66Fill(d,pic);el.parentNode.insertBefore(d,el);
};
(function(){
  if(!P66)return;
  var st=document.createElement("style");
  st.textContent='.p59-pic.p66-img{display:flex!important;justify-content:center;align-items:center;gap:6px;filter:none!important;opacity:1!important;margin:0 0 8px!important;font-size:0!important;line-height:0!important}'+
    '.p66-t{display:block;width:64px;height:64px;background-image:url(pics/atlas.webp);background-repeat:no-repeat;flex:none}'+
    'body.p58-focus .p52:has(.p52-res) .p52-detail .p59-pic.p66-img{display:none!important}'+
    '.p59-pic.p66-img .p66-t:not(:only-child){width:48px;height:48px}.p59-pic.sm .p66-t{width:44px;height:44px}.p48-dialog .p66-t{width:52px;height:52px}';
  document.head.appendChild(st);
  var im=new Image();
  im.onload=function(){P66_OK=true;try{var a=document.querySelectorAll(".p59-pic");for(var i=0;i<a.length;i++){var t=a[i].textContent;if(t)p66Fill(a[i],t);}}catch(_){}};
  im.src="pics/atlas.webp";
})();
var _p66Settings=renderSettings;
renderSettings=function(embed){var h=String(_p66Settings.apply(this,arguments));return P66?h+'<div class="p61-note" style="margin-top:4px">単語の絵：Microsoft Fluent Emoji（MIT License, © Microsoft Corporation）</div>':h;};
(function(){var st=document.createElement("style");st.textContent='.p61-note{font-size:11.5px;color:var(--muted);line-height:1.7;margin:18px 4px 8px}';document.head.appendChild(st);})();
