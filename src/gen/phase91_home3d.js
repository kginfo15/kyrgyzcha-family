/* ===== Phase91：ホームの上に「立体の進捗」（2026-11-28 Yuta「やる気の出る3Dデザインで進捗」「トップを整理して見やすく」） =====
   上から：あいさつ＋検定対策 → 進捗のカード（左：今日の時間の立体リング、右：A1→A2→B1 の立体の階段）
          → 大きなカード（今日は何分できる？／次は／始める／このあと）→ 学び方 → 調べる。
   ・今日の時間の棒・連続日数・レベルの1行（phase90）は、大きなカードから進捗のカードへ移した（同じことを2回出さない）。
   ・階段の各段は、そのレベルの進み具合だけ下から色が満ちる。いまのレベルの上に「いま」の印。
   ・ロシア語版：レベルは AIコーチの現在地（p90Level）。押すと現在地のシート。リングを押すと勉強時間。
   ・キルギス語版（コーチなし）：リング＝今日のチャレンジの問題数、階段＝覚えた単語の割合（p56LevelState）。押すと記録へ。
   ・絵はすべてこのアプリ用に SVG で描いたもの（外部の画像・ライブラリなし）。 */
function p91Ru(){return typeof p90Level==="function"&&typeof P47_LANG!=="undefined"&&P47_LANG==="ru";}
function p91Data(){
  var streak=0;try{streak=appHist.streak.count||0;}catch(_){}
  var d={streak:streak,steps:[],cap:""};
  if(p91Ru()){
    var D=p85DaySecs(1),m=p85Mins(D[0].s),goal=(typeof p85Goal==="function"?p85Goal():p85Set().min);
    d.ring={v:m,max:goal,unit:"分",lab:"今日の勉強",act:"p85time"};
    var P=p90Level();
    P.L.forEach(function(o){d.steps.push({lv:o.lv,f:Math.max(0,Math.min(1,(P.pos-o.h0)/(o.h1-o.h0))),col:o.col,cur:o.lv===P.cur.lv});});
    d.cap='<b style="color:'+P.cur.col+'">'+P.cur.lv+' '+P.pct+'%</b><span>'+(P.remain>0?P.cur.lv+'まで あと約'+P.remain+'時間':P.cur.lv+' 到達')+'</span>';
    d.lvAct="p90open";
  }else{
    var t=20,dn=0;try{t=p47Target();dn=p47DoneToday();}catch(_){}
    d.ring={v:Math.min(dn,t),max:t,unit:"問",lab:"今日の問題",act:"p47chal"};
    var L=p56LevelState(),cols=["#F2B705","#E5332A","#8E5BE8"];
    P_LVLS.slice(0,3).forEach(function(lv,i){d.steps.push({lv:lv,f:Math.min(1,(L[lv].passed?100:L[lv].pct)/100),col:cols[i],cur:lv===L.cur});});
    var c=L[L.cur];d.cap='<b style="color:'+cols[Math.max(0,P_LVLS.indexOf(L.cur))]+'">'+L.cur+' '+c.pct+'%</b><span>覚えた単語 '+c.k.toLocaleString()+' / '+c.n.toLocaleString()+'</span>';
    d.lvAct="p91stats";
  }
  return d;
}
/* 立体のリング（今日の分）：下に影、太い輪に光と陰 */
function p91Ring(r){
  var R=34,C=2*Math.PI*R,f=r.max?Math.min(1,r.v/r.max):0,done=f>=1;
  return '<svg class="p91-ring" viewBox="0 0 100 104" aria-hidden="true"><defs>'+
    '<linearGradient id="p91rg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="var(--p91a2)"/><stop offset="1" stop-color="var(--accent)"/></linearGradient>'+
    '<radialGradient id="p91sh" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".35"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>'+
    '<ellipse cx="50" cy="95" rx="34" ry="6" fill="url(#p91sh)"/>'+
    '<circle cx="50" cy="50" r="'+R+'" fill="none" stroke="var(--p91trk)" stroke-width="13"/>'+
    (f>0?'<circle cx="50" cy="52" r="'+R+'" fill="none" stroke="#000" stroke-opacity=".18" stroke-width="13" stroke-dasharray="'+(C*f).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 50 52)" stroke-linecap="round"/>'+'<circle cx="50" cy="50" r="'+R+'" fill="none" stroke="url(#p91rg)" stroke-width="13" stroke-dasharray="'+(C*f).toFixed(1)+' '+C.toFixed(1)+'" transform="rotate(-90 50 50)" stroke-linecap="round"/>'+
      '<circle cx="50" cy="50" r="'+(R+4)+'" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1.6" stroke-dasharray="'+(2*Math.PI*(R+4)*f).toFixed(1)+' 999" transform="rotate(-90 50 50)" stroke-linecap="round"/>':'')+
    '<circle cx="50" cy="50" r="'+(R-7)+'" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="1"/>'+
    '<text x="50" y="'+(done?47:53)+'" text-anchor="middle" class="p91-rv">'+r.v+'</text>'+
    '<text x="50" y="'+(done?62:68)+'" text-anchor="middle" class="p91-ru">/ '+r.max+r.unit+'</text>'+
    (done?'<text x="50" y="75" text-anchor="middle" class="p91-rd">達成</text>':'')+
    '</svg>';
}
/* 立体の階段（A1→A2→B1）：各段の前の面と横の面が、進んだぶんだけ下から満ちる */
function p91Stairs(S){
  var n=S.length,W=40,G=8,dx=13,dy=-8,base=104,hs=n<3?[40,66]:[30,52,74],VW=6+3*(W+G)+dx+2,x0=6+(3-n)*(W+G)/2,o='';
  o+='<svg class="p91-st" viewBox="0 18 '+VW+' 94" aria-hidden="true"><defs><radialGradient id="p91sh2" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>'+
    '<linearGradient id="p91gl" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>';
  o+='<ellipse cx="'+(x0+(n*(W+G))/2+4)+'" cy="'+(base+3)+'" rx="'+((n*(W+G))/2+8)+'" ry="5" fill="url(#p91sh2)"/>';
  var mark='';
  S.forEach(function(s,i){
    var x=x0+i*(W+G),h=hs[i]||hs[hs.length-1],y=base-h,fh=Math.round(h*s.f),fy=base-fh;
    /* 横の面（奥行き） */
    o+='<polygon points="'+(x+W)+','+y+' '+(x+W+dx)+','+(y+dy)+' '+(x+W+dx)+','+(base+dy)+' '+(x+W)+','+base+'" fill="var(--p91sd)"/><polygon points="'+(x+W)+','+y+' '+(x+W+dx)+','+(y+dy)+' '+(x+W+dx)+','+(base+dy)+' '+(x+W)+','+base+'" fill="'+s.col+'" fill-opacity=".12"/>';
    if(fh>0)o+='<polygon points="'+(x+W)+','+fy+' '+(x+W+dx)+','+(fy+dy)+' '+(x+W+dx)+','+(base+dy)+' '+(x+W)+','+base+'" fill="'+s.col+'"/><polygon points="'+(x+W)+','+fy+' '+(x+W+dx)+','+(fy+dy)+' '+(x+W+dx)+','+(base+dy)+' '+(x+W)+','+base+'" fill="#000" fill-opacity=".32"/>';
    /* 上の面 */
    o+='<polygon points="'+x+','+y+' '+(x+dx)+','+(y+dy)+' '+(x+W+dx)+','+(y+dy)+' '+(x+W)+','+y+'" fill="'+(s.f>=1?s.col:"var(--p91tp)")+'"/>'+(s.f<1?'<polygon points="'+x+','+y+' '+(x+dx)+','+(y+dy)+' '+(x+W+dx)+','+(y+dy)+' '+(x+W)+','+y+'" fill="'+s.col+'" fill-opacity=".22"/>':'');
    if(s.f>=1)o+='<polygon points="'+x+','+y+' '+(x+dx)+','+(y+dy)+' '+(x+W+dx)+','+(y+dy)+' '+(x+W)+','+y+'" fill="#fff" fill-opacity=".28"/>';
    /* 前の面 */
    o+='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+h+'" fill="var(--p91fr)"/><rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+h+'" fill="'+s.col+'" fill-opacity=".14"/>';
    if(fh>0)o+='<rect x="'+x+'" y="'+fy+'" width="'+W+'" height="'+fh+'" fill="'+s.col+'"/>'+(fh>2&&fh<h?'<rect x="'+x+'" y="'+fy+'" width="'+W+'" height="2" fill="#fff" fill-opacity=".45"/>':'');
    o+='<rect x="'+x+'" y="'+y+'" width="'+W+'" height="'+h+'" fill="url(#p91gl)"/>';
    o+='<text x="'+(x+W/2)+'" y="'+(base-7)+'" text-anchor="middle" class="p91-sl'+(fh>12?" on":"")+'">'+s.lv+'</text>';
    if(s.cur){var mx=x+W/2+dx/2,my=y+dy-6;
      mark='<g class="p91-mk"><line x1="'+mx+'" y1="'+(my-2)+'" x2="'+mx+'" y2="'+(my-15)+'" stroke="var(--ink)" stroke-width="1.6"/>'+
        '<path d="M'+mx+' '+(my-15)+' l11 4 l-11 4z" fill="'+s.col+'"/><ellipse cx="'+mx+'" cy="'+my+'" rx="5" ry="2.2" fill="var(--ink)" fill-opacity=".5"/></g>';}
  });
  return o+mark+'</svg>';
}
function p91Hero(){
  var d=p91Data();
  return '<div class="p91-hero">'+
    '<button type="button" class="p91-rb" data-act="'+d.ring.act+'" aria-label="'+d.ring.lab+' '+d.ring.v+' / '+d.ring.max+d.ring.unit+'"><small>'+d.ring.lab+'</small>'+p91Ring(d.ring)+
      '<span class="p91-strk'+(d.streak>0?" on":"")+'">'+d.streak+'<i>日連続</i></span></button>'+
    '<button type="button" class="p91-sb" data-act="'+d.lvAct+'" aria-label="いまの現在地。くわしく見る"><small>いまの現在地 ›</small>'+p91Stairs(d.steps)+'<span class="p91-cap">'+d.cap+'</span></button>'+
  '</div>';
}
if(typeof renderHome==="function"){
  var _p91Home=renderHome;
  renderHome=function(){
    var h=String(_p91Home.apply(this,arguments));
    var i=h.indexOf('<div class="p87-main">');if(i<0)return h;
    try{
      var hero=p91Hero();
      var main=h.slice(i);
      main=main.replace(/<button type="button" class="p87-time"[\s\S]*?<\/button>/,"").replace(/<div class="p87-time p87-static">[\s\S]*?<\/div>/,"")
               .replace(/<div class="p87-bar"><i[^>]*><\/i><\/div>/,"").replace(/<button type="button" class="p90-line[\s\S]*?<\/button>/,"");
      h=h.slice(0,i)+hero+main;
    }catch(_){}
    return h;
  };
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest('[data-act="p91stats"]');if(!el)return;
  e.stopImmediatePropagation();e.preventDefault();
  try{ui.bnav="stats";render();window.scrollTo(0,0);}catch(_){}
},true);

(function(){
  var st=document.createElement("style");
  st.textContent=
  '.p91-hero{--p91trk:var(--card2);--p91fr:var(--card2);--p91sd:var(--line);--p91tp:var(--lineStrong);--p91a2:var(--sub)}'+
  '.p91-hero{display:grid;grid-template-columns:100px 1fr;gap:8px;margin-bottom:10px}'+
  '.p91-hero>button{position:relative;display:flex;flex-direction:column;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:18px;padding:8px 8px 7px;color:var(--ink);font:inherit;cursor:pointer;min-width:0;overflow:hidden}'+
  '.p91-hero>button::before{content:"";position:absolute;inset:0;background:radial-gradient(120% 70% at 50% 0%,var(--accentSoft),transparent 70%);pointer-events:none}'+
  '.p91-hero small{position:relative;align-self:flex-start;font-size:11.5px;font-weight:700;color:var(--muted);margin-left:2px;white-space:nowrap}'+
  '.p91-ring{position:relative;width:74px;height:auto;display:block;margin-top:1px}'+
  '.p91-rv{font-size:24px;font-weight:800;fill:var(--ink)}.p91-ru{font-size:10.5px;font-weight:700;fill:var(--muted)}.p91-rd{font-size:10px;font-weight:800;fill:var(--accent)}'+
  '.p91-strk{position:relative;font-size:14px;font-weight:800;color:var(--muted);line-height:1.1}.p91-strk i{font-style:normal;font-size:11px;font-weight:700;margin-left:1px}.p91-strk.on{color:#F08A24}'+
  '.p91-st{position:relative;width:100%;max-width:200px;height:86px;display:block;margin:0 auto}'+
  '.p91-sl{font-size:11px;font-weight:800;fill:var(--muted)}.p91-sl.on{fill:#fff}'+
  '.p91-mk{animation:p91bob 2.6s ease-in-out infinite}@keyframes p91bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}'+
  '@media (prefers-reduced-motion:reduce){.p91-mk{animation:none}}body.reduce-motion .p91-mk{animation:none}'+
  '.p91-cap{position:relative;display:flex;gap:6px;align-items:baseline;justify-content:center;flex-wrap:wrap;font-size:12px;color:var(--muted);line-height:1.3;margin-top:2px}.p91-cap b{font-size:13px;font-weight:800}'+
  '.p87-home .p87-main{padding-top:14px}.p87-home .p87-main .p90-ask{margin:0 0 12px}'+
  '@media (max-width:350px){.p91-hero{grid-template-columns:90px 1fr}.p91-ring{width:68px}.p91-cap{font-size:11px}}';
  document.head.appendChild(st);
})();
