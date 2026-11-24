/* ===== Phase75：物語を「4コマ漫画風」でも読めるようにする =====
   それぞれの話の場面（P.story[i].fig）から、カメラの位置を変えた4コマを作る。
   1コマ目＝場面全体、2コマ目＝相手の顔のアップ、3コマ目＝主人公のアップ（動きをつける）、4コマ目＝しめの場面。
   本文は4つに分けて、各コマの下に入れる。絵はすべてこのアプリのオリジナル（p74Person など）。
   読み方：settings.p74.rd = "both"（4コマ＋文章・最初の設定）／"comic"（4コマだけ）／"text"（文章だけ）。 */
function p75Rd(){var v=p74S().rd;return v==="text"||v==="comic"?v:"both";}
function p75Split(x){
  var ss=[];String(x||"").split("\n").forEach(function(par){var buf="",q=0;
    for(var k=0;k<par.length;k++){var ch=par[k];buf+=ch;if(ch==="「")q++;if(ch==="」")q=Math.max(0,q-1);if((ch==="。"||ch==="！"||ch==="？")&&q===0&&par[k+1]!=="」"){ss.push(buf);buf="";}}
    if(buf.trim())ss.push(buf);});
  ss=ss.map(function(t){return t.trim();}).filter(Boolean);
  if(ss.length<=4){while(ss.length<4)ss.push("");return ss;}
  /* 文字数がなるべく均等になるように4つに分ける */
  var tot=ss.reduce(function(a,t){return a+t.length;},0),out=["","","",""],acc=0,g=0;
  ss.forEach(function(t,k){var left=ss.length-k;if(g<3&&acc>=tot*(g+1)/4&&out[g])g++;if(3-g>=left&&out[g])g++;g=Math.min(3,g);out[g]+=t;acc+=t.length;});
  return out;}
function p75Comic(P,i){var s=P.story[i];if(!s)return "";
  var figs=(s.fig||[]).map(function(f){var m=/^(.+?)@(-?\d+)$/.exec(f);return {k:m?m[1]:f,x:m?+m[2]:90};});
  var hero=figs.filter(function(f){return f.k==="h";})[0],other=figs.filter(function(f){return f.k!=="h";})[0];
  var build=function(pose){return figs.map(function(f){var o=p74Fig(P,(f.k)+"@"+f.x,i);
      if(f.k==="h"&&pose){var hp=JSON.parse(JSON.stringify(P.st[Math.min(8,i)]));hp.pose=pose;o.svg=p74Person(hp);}return o;});};
  var opt={night:s.night,fire:s.fire,yurt:P.hist?undefined:false,sea:P.id==="sea"};
  var cam=function(svg,vb,extra){svg=svg.replace('viewBox="0 0 240 140"','viewBox="'+vb+'" preserveAspectRatio="xMidYMid slice"');if(extra)svg=svg.replace("</svg>",extra+"</svg>");return svg;};
  var zc=function(f){return Math.max(60,Math.min(180,f.x+37));},zoom=function(f){var cx=zc(f);return (cx-60)+" 34 120 70";};
  var first=other||hero||figs[0],main=hero||figs[figs.length-1]||first;
  var poses=["point","both","wave","heart","shrug","pray"],pz=poses[(i+P.id.length)%poses.length];
  var fx=function(x,y,kind){if(kind==="!")return '<g transform="translate('+x+' '+y+')"><path d="M0 0l3 12h-6z" fill="#E2483B"/><circle cy="16" r="2" fill="#E2483B"/></g>';
    return '<g transform="translate('+x+' '+y+')" fill="#F5B301"><path d="M0-6l1.6 4.4 4.4 1.6-4.4 1.6L0 6l-1.6-4.4-4.4-1.6 4.4-1.6z"/></g>';};
  var p1=p74Scene(build(null),opt),
      p2=first?cam(p74Scene(build(null),opt),zoom(first),fx(zc(first)+26,38,"!")):p1,
      p3=main?cam(p74Scene(build(pz),opt),zoom(main)):p1,
      p4=cam(p74Scene(build(hero?"wave":null),opt),"12 14 216 126",fx(40,40,"*")+fx(200,52,"*"));
  var tx=p75Split(s.x),pan=[p1,p2,p3,p4];
  return '<div class="p75-comic" role="img" aria-label="4コマ漫画：'+esc(s.t)+'">'+pan.map(function(sv,k){return '<div class="p75-pan"><i>'+(k+1)+'</i><div class="p75-pimg">'+sv+'</div>'+(tx[k]?'<p>'+esc(tx[k])+'</p>':'')+'</div>';}).join("")+'</div>';}
/* 物語の場面の出し方を、読み方の設定に合わせる */
var _p75Scene=p74SceneHtml;
p74SceneHtml=function(P,i,noTitle){var rd=p75Rd(),s=P&&P.story&&P.story[i];if(!s||rd==="text")return _p75Scene.apply(this,arguments);
  var h=_p75Scene.apply(this,arguments);
  var cm=p75Comic(P,i);
  if(rd==="comic"){/* 4コマだけ：場面の絵と本文を4コマに置きかえる（例文・次回予告は残す） */
    h=h.replace(/<div class="p74-scimg">[\s\S]*?<\/svg><\/div>/,"").replace(/<div class="p74-scx">[\s\S]*?<\/div>(?=<div class="p74-ex|<p class="p74-nx|<\/div>$)/,cm);
    if(h.indexOf("p75-comic")<0)h=h.replace('<div class="p74-sc">','<div class="p74-sc">'+cm);}
  else{h=h.replace(/<div class="p74-scimg">[\s\S]*?<\/svg><\/div>/,cm);}
  return h;};
function p75RdBar(){var rd=p75Rd(),b=function(v,t){return '<button type="button" class="'+(rd===v?"on":"")+'" data-act="p75rd" data-val="'+v+'">'+t+'</button>';};
  return '<div class="p75-rdbar"><span>読み方を選ぶ</span>'+b("comic","4コマ漫画で読む")+b("text","文章で読む")+b("both","両方")+'</div>';}
var _p75Tab=p74StoryTab;
p74StoryTab=function(){return p75RdBar()+_p75Tab.apply(this,arguments);};
var _p75Reader=p74Reader;
p74Reader=function(){return p75RdBar()+_p75Reader.apply(this,arguments);};
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest('[data-act="p75rd"]'):null;if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();p74S().rd=el.getAttribute("data-val");try{saveAll();}catch(_){}
  var m=document.getElementById("p70page"),sc=m&&m.querySelector(".p70-pbody"),y=sc?sc.scrollTop:0;p74Open(false);var sc2=document.querySelector("#p70page .p70-pbody");if(sc2)sc2.scrollTop=y;},true);
(function(){try{var st=document.createElement("style");st.textContent=
'.p75-rdbar{display:flex;align-items:center;gap:6px;margin:0 0 10px;flex-wrap:wrap}.p75-rdbar span{font-size:12px;color:var(--muted);font-weight:700;margin-right:2px}.p75-rdbar button{border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:13px;font-weight:700;padding:6px 12px;border-radius:999px;cursor:pointer}.p75-rdbar button.on{background:var(--accent);border-color:var(--accent);color:#fff}'+
'.p75-comic{display:flex;flex-direction:column;gap:10px;margin:8px 0 10px}.p75-pan{position:relative;border:2.5px solid var(--ink);border-radius:6px;overflow:hidden;background:var(--card)}.p75-pan>i{position:absolute;left:6px;top:6px;z-index:1;width:22px;height:22px;border-radius:50%;background:#fff;color:#2B2233;border:1.5px solid #2B2233;font:800 12px/19px system-ui,sans-serif;text-align:center;font-style:normal}'+
'.p75-pimg{line-height:0}.p75-pimg svg{width:100%;height:auto;display:block;aspect-ratio:240/140}.p75-pan p{margin:0;padding:8px 10px;font-size:14.5px;line-height:1.65;border-top:2px solid var(--ink);color:var(--ink)}';
document.head.appendChild(st);}catch(_){}})();
