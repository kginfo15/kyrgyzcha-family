/* ===== PHASE70: デザインの切り替え（シンプル／ポップ／クール／イラスト）と、続けたくなる仕組み（今週の連続・道のり・バッジ・週のまとめ） =====
   絵はすべてこのアプリ用に一から描いたSVG。記録（バッジ獲得日・日ごとの覚えた単語数）はこの端末の localStorage に保存。 */
if(!settings.p70Style)settings.p70Style="simple";
var P70_STYLES=[
  ["simple","シンプル","今のデザイン。平らで落ち着いた見た目"],
  ["pop","ポップ","丸くて大きなボタン、明るい色、押すと弾む"],
  ["cool","クール","細い線と1色のアクセント。数字がくっきり"],
  ["illust","イラスト","進むほど景色が変わる、大きな絵のデザイン"]
];
var P70_KEY=K.prog.replace("vocabProgress","p70");
var p70Store=lget(P70_KEY,{known:{},badges:{},best:0,init:0});
if(!p70Store.known)p70Store.known={};if(!p70Store.badges)p70Store.badges={};
function p70Save(){lset(P70_KEY,p70Store);}
function p70DayKey(off){var d=new Date();d.setDate(d.getDate()+(off||0));return todayKey(d);}
/* ---------- 大きな絵（オリジナル） ---------- */
function p70Person(x,y,s,c,hair){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><path d="M-6 30v-16q0-6 6-6t6 6v16z" fill="'+c+'"/><path d="M-4 30v14M4 30v14" stroke="#334155" stroke-width="3.4" stroke-linecap="round"/><circle cy="0" r="6" fill="#F2C39A"/><path d="M-6 -1q0-7 6-7t6 7q-2-3-6-3t-6 3z" fill="'+(hair||"#4A2F1F")+'"/></g>';}
var P70_SCENE={
  A1:function(){var s='<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="p70s1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8FD3FF"/><stop offset="1" stop-color="#E8F6FF"/></linearGradient></defs><rect width="360" height="150" fill="url(#p70s1)"/>'+
    '<circle cx="300" cy="34" r="14" fill="#FFE08A"/><path d="M40 30q8-10 20-4 8-8 18 0 10 0 8 8H40z" fill="#fff"/><path d="M190 22q6-8 16-3 6-6 14 0 8 0 6 6h-36z" fill="#fff" opacity=".9"/>';
    [[0,58,46,"#F4B183"],[50,40,52,"#9BB7D4"],[106,66,40,"#F7D794"],[214,50,48,"#C5A3D9"],[266,34,56,"#86C5A4"],[326,60,40,"#F4B183"]].forEach(function(b){s+='<rect x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+(124-b[1])+'" fill="'+b[3]+'"/>';for(var yy=b[1]+8;yy<112;yy+=14)for(var xx=b[0]+6;xx<b[0]+b[2]-8;xx+=12)s+='<rect x="'+xx+'" y="'+yy+'" width="6" height="8" fill="#FFFBEA" opacity=".85"/>';});
    s+='<rect y="120" width="360" height="30" fill="#7B8794"/><rect y="118" width="360" height="4" fill="#CBD2D9"/>'+[0,1,2,3,4,5].map(function(i){return '<rect x="'+(150+i*12)+'" y="128" width="7" height="22" fill="#F5F7FA"/>';}).join("")+
      '<path d="M150 74v46" stroke="#52606D" stroke-width="3"/><path d="M144 74h20" stroke="#52606D" stroke-width="3"/><circle cx="162" cy="78" r="4" fill="#FFE08A"/>'+
      '<g transform="translate(212 92)"><path d="M10 -18l14-14M26 -18l14-14" stroke="#334155" stroke-width="2"/><rect x="0" y="-18" width="110" height="34" rx="8" fill="#2E86DE"/><rect x="0" y="6" width="110" height="5" fill="#1B5FA8"/>'+[8,30,52,74].map(function(x){return '<rect x="'+x+'" y="-12" width="18" height="14" rx="2" fill="#D6EEFF"/>';}).join("")+'<rect x="96" y="-12" width="10" height="24" rx="2" fill="#D6EEFF"/><circle cx="20" cy="18" r="7" fill="#1F2933"/><circle cx="88" cy="18" r="7" fill="#1F2933"/></g>'+
      '<g transform="translate(40 106)"><rect x="-3" y="-4" width="6" height="18" fill="#8D6E63"/><circle cy="-14" r="16" fill="#58B368"/><circle cx="-10" cy="-6" r="10" fill="#4C9A5B"/></g>'+
      p70Person(88,88,0.9,"#E4572E")+p70Person(108,90,0.85,"#3D5A80","#2B1B12")+'</svg>';return s;},
  A2:function(){var s='<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="p70s2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFC48A"/><stop offset="1" stop-color="#FFF1DC"/></linearGradient></defs><rect width="360" height="150" fill="url(#p70s2)"/>'+
    '<path d="M0 80l50-44 40 30 46-50 54 50 40-28 60 46 40-30 30 26v20H0z" fill="#B7A6C9"/><path d="M136 16l-14 14 8-2 6 6 6-6 8 2z" fill="#fff"/><path d="M90 66l-8 7" stroke="#fff" stroke-width="0"/>'+
    '<rect y="112" width="360" height="38" fill="#D9B28A"/>';
    [[10,"#E4572E"],[130,"#2E86DE"],[250,"#2FB36B"]].forEach(function(st){var x=st[0],c=st[1];s+='<rect x="'+(x+6)+'" y="56" width="4" height="64" fill="#7A5230"/><rect x="'+(x+96)+'" y="56" width="4" height="64" fill="#7A5230"/>';
      for(var i=0;i<6;i++)s+='<path d="M'+(x+i*18)+' 50h18v14q-9 8-18 0z" fill="'+(i%2?"#fff":c)+'"/>';
      s+='<rect x="'+(x+2)+'" y="96" width="102" height="22" fill="#A0703F"/>'+[0,1,2,3,4,5,6].map(function(j){return '<circle cx="'+(x+12+j*14)+'" cy="94" r="7" fill="'+["#E63946","#F4A261","#90BE6D","#F9C74F","#E63946","#F4A261","#90BE6D"][(j+x/10)%7|0]+'"/>';}).join("");
      s+=p70Person(x+52,62,0.8,c==="#fff"?"#555":c);});
    s+=p70Person(118,100,0.9,"#6D597A")+'<path d="M126 122h14l-2 10h-10z" fill="#F4A261"/>'+'<path d="M0 50q60 10 120 0t120 0 120 0" stroke="#7A5230" stroke-width="1.2" fill="none"/>'+[30,90,150,210,270,330].map(function(x){return '<circle cx="'+x+'" cy="'+(52+(x%60?4:0))+'" r="4" fill="#FFE08A"/>';}).join("")+'</svg>';return s;},
  B1:function(){var s='<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="p70s3" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5B7DB1"/><stop offset=".6" stop-color="#F7B267"/><stop offset="1" stop-color="#FCE1C0"/></linearGradient></defs><rect width="360" height="150" fill="url(#p70s3)"/>'+
    '<circle cx="270" cy="74" r="22" fill="#FFE8A3"/>'+
    '<path d="M0 104l60-62 40 34 50-56 70 70 40-30 60 50 40-20v60H0z" fill="#4A5A7A"/><path d="M150 20l-16 18 9-3 7 8 8-8 9 3z" fill="#fff"/><path d="M60 42l-12 13 7-2 5 6 6-6 6 2z" fill="#fff"/>'+
    '<path d="M0 116q90-16 180-4t180-6v44H0z" fill="#3E7C59"/><path d="M0 132h360v18H0z" fill="#2F5D45"/>'+
    '<path d="M0 118h360" stroke="#5D4037" stroke-width="3"/>'+[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17].map(function(i){return '<rect x="'+(i*20)+'" y="118" width="3" height="6" fill="#5D4037"/>';}).join("")+
    '<g transform="translate(70 92)"><path d="M0 -6q0-14 14-14h22v26H0z" fill="#C0392B"/><rect x="10" y="-16" width="14" height="10" rx="2" fill="#FDEBD0"/><rect x="4" y="-28" width="8" height="10" fill="#2C3E50"/>'+
      [40,92,144].map(function(x){return '<rect x="'+x+'" y="-22" width="48" height="28" rx="4" fill="#E67E22"/><rect x="'+(x+4)+'" y="-16" width="40" height="10" rx="2" fill="#FDEBD0"/><path d="M'+(x-4)+' 0h4" stroke="#2C3E50" stroke-width="3"/>';}).join("")+
      [8,30,50,80,102,132,154,184].map(function(x){return '<circle cx="'+x+'" cy="8" r="5" fill="#2C3E50"/>';}).join("")+'<path d="M8 -30q-6-10 4-14t10-12" stroke="#fff" stroke-width="5" fill="none" opacity=".7" stroke-linecap="round"/></g>'+
    '<path d="M280 40l6 4M300 30l6 4" stroke="#2C3E50" stroke-width="1.6"/></svg>';return s;},
  goal:function(){return '<svg viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs><linearGradient id="p70s4" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A8B"/><stop offset=".55" stop-color="#FFC371"/><stop offset="1" stop-color="#FFF3D6"/></linearGradient></defs><rect width="360" height="150" fill="url(#p70s4)"/>'+
    '<circle cx="180" cy="120" r="56" fill="#FFE8A3" opacity=".8"/>'+[0,20,40,60,80,100,120,140,160].map(function(a){var r=a*Math.PI/180;return '<path d="M'+(180+Math.cos(Math.PI+r)*64).toFixed(1)+' '+(120+Math.sin(Math.PI+r)*64).toFixed(1)+'L'+(180+Math.cos(Math.PI+r)*84).toFixed(1)+' '+(120+Math.sin(Math.PI+r)*84).toFixed(1)+'" stroke="#FFE8A3" stroke-width="4" stroke-linecap="round" opacity=".8"/>';}).join("")+
    '<path d="M0 150l90-80 50 30 40-56 60 60 40-26 80 72z" fill="#5B6C8F"/><path d="M180 44l-16 20 10-4 6 8 6-8 10 4z" fill="#fff"/>'+
    '<path d="M180 44v-30" stroke="#334155" stroke-width="2.4"/><path d="M180 14h26l-6 7 6 7h-26z" fill="#E63946"/>'+
    '<g transform="translate(160 44)"><path d="M-6 0q-8-10-4-18M6 0q8-10 4-18" stroke="#2E86DE" stroke-width="4" stroke-linecap="round" fill="none"/></g>'+p70Person(160,26,0.75,"#2E86DE")+
    [[40,20,"#E63946"],[90,40,"#2E86DE"],[260,26,"#2FB36B"],[310,46,"#F9C74F"],[130,16,"#9B5DE5"],[230,12,"#E63946"]].map(function(c){return '<rect x="'+c[0]+'" y="'+c[1]+'" width="6" height="10" rx="1" fill="'+c[2]+'" transform="rotate(25 '+c[0]+' '+c[1]+')"/>';}).join("")+'</svg>';}
};
/* ホームの小さな絵（イラストデザイン用） */
var P70_ICON={
  p47words:'<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="8" y="12" width="24" height="30" rx="3" fill="#FFD6A5" transform="rotate(-10 20 27)"/><rect x="16" y="8" width="24" height="30" rx="3" fill="#fff" stroke="#E2B07A"/><path d="M21 16h14M21 21h10" stroke="#E07A5F" stroke-width="2.4" stroke-linecap="round"/><circle cx="28" cy="30" r="4" fill="#81B29A"/></svg>',
  p48reinf:'<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="none" stroke="#81B29A" stroke-width="4" stroke-dasharray="80 30"/><path d="M38 12l2 9-9-1z" fill="#81B29A"/><rect x="15" y="17" width="18" height="14" rx="2" fill="#F2CC8F"/><path d="M19 22h10M19 26h7" stroke="#B5835A" stroke-width="2"/></svg>',
  p47more:'<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 28a14 14 0 0 1 28 0" stroke="#3D405B" stroke-width="3.4" fill="none"/><rect x="7" y="27" width="7" height="12" rx="3" fill="#E07A5F"/><rect x="34" y="27" width="7" height="12" rx="3" fill="#E07A5F"/><path d="M20 38l14-14 3 3-14 14h-3z" fill="#F2CC8F"/></svg>'
};
/* ---------- 道のり ---------- */
function p70Road(){
  var out=[],cur=-1;
  P47_THEMES.forEach(function(th,i){var n=th.ids.length,k=th.ids.filter(p47IsKnown).length,done=n&&k/n>=0.8;out.push({i:i,cat:th.cat,level:th.level,n:n,k:k,done:done});if(!done&&cur<0)cur=i;});
  return {list:out,cur:cur};
}
function p70RoadCard(){
  var R=p70Road(),done=R.list.filter(function(x){return x.done;}).length,c=R.list[R.cur];
  var dots='';var start=Math.max(0,(R.cur<0?R.list.length:R.cur)-3);for(var i=start;i<Math.min(R.list.length,start+7);i++){var x=R.list[i];dots+='<i class="'+(x.done?"d":(i===R.cur?"c":""))+'"></i>';}
  return '<button type="button" class="p70-roadcard" data-act="p70road"><span class="p70-rcart">'+P70_SCENE[c?c.level:P_LVLS[P_LVLS.length-1]]()+'</span><span class="p70-rctxt"><small>道のり ・ '+done+' / '+R.list.length+' テーマ</small><b>'+(c?'次の一歩：'+esc(c.cat):'すべてのテーマを達成！')+'</b><em class="p70-rdots">'+dots+'</em></span><span class="p70-rcgo">›</span></button>';
}
function p70OpenRoad(){
  var R=p70Road(),h='<div class="p70-phead"><b>道のり</b><button type="button" class="p70-x" data-act="p70close" aria-label="閉じる">✕</button></div><div class="p70-pbody"><p class="p70-lead">テーマを順に進めます。8割の単語を「覚えた」にすると、そのテーマに印が付きます。</p>';
  var pat=[50,72,84,72,50,28,16,28];var lv="";var seg=[];
  function flush(){if(!seg.length)return;var hgt=seg.length*92+20;var pts=seg.map(function(x,j){return [pat[j%8],j*92+46];});
    h+='<div class="p70-seg" style="height:'+hgt+'px"><svg viewBox="0 0 100 '+hgt+'" preserveAspectRatio="none"><path d="M'+pts.map(function(p){return p[0]+' '+p[1];}).join(" L")+'" stroke="var(--line)" stroke-width="10" fill="none" vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round"/><path d="M'+pts.map(function(p){return p[0]+' '+p[1];}).join(" L")+'" stroke="var(--mutedSoft)" stroke-width="2" stroke-dasharray="2 8" fill="none" vector-effect="non-scaling-stroke"/></svg>';
    seg.forEach(function(x,j){var p=pts[j],st=x.done?"d":(x.i===R.cur?"c":"");
      h+='<button type="button" class="p70-node '+st+'" data-act="p70go" data-val="'+x.i+'" style="left:'+p[0]+'%;top:'+p[1]+'px"'+(st==="c"?' id="p70cur"':'')+'><span class="p70-dot">'+(x.done?'✓':(x.i+1))+'</span><span class="p70-lab '+(p[0]>50?"l":"r")+'"><b>'+esc(x.cat)+'</b><small>'+x.k+' / '+x.n+' 語'+(st==="c"?' ・ ここから':'')+'</small></span></button>';});
    h+='</div>';seg=[];}
  R.list.forEach(function(x){if(x.level!==lv){flush();lv=x.level;h+='<div class="p70-lvban"><div class="p70-lvart">'+P70_SCENE[lv]()+'</div><b>'+lv+'</b><span>'+({A1:"街かど",A2:"市場",B1:"列車の旅"}[lv]||"")+'</span></div>';}seg.push(x);});
  flush();h+='</div>';
  var m=document.getElementById("p70page");if(!m){m=document.createElement("div");m.id="p70page";document.body.appendChild(m);}
  m.innerHTML=h;m.className="show";document.body.classList.add("p70-noscroll");
  setTimeout(function(){var c=document.getElementById("p70cur");if(c&&c.scrollIntoView)c.scrollIntoView({block:"center"});},60);
}
function p70ClosePage(){var m=document.getElementById("p70page");if(m){m.className="";m.innerHTML="";}document.body.classList.remove("p70-noscroll");}
/* ---------- バッジ ---------- */
function p70Stats(){
  var days=appHist.days||{},studied=0,all=0;Object.keys(days).forEach(function(k){var c=p48DayCount(k);if(c>0)studied++;all+=c;});
  var st=appHist.streak.count||0;if(st>(p70Store.best||0)){p70Store.best=st;}
  var lv=0;P_LVLS.forEach(function(l){if(appHist.levelTests&&appHist.levelTests[l]&&appHist.levelTests[l].passed)lv++;});
  return {known:p47KnownCount(),best:p70Store.best||0,all:all,days:studied,lv:lv};
}
var P70_BADGES=[
  ["w10","はじめの10語","known",10,"book"],["w50","50語","known",50,"book"],["w100","100語","known",100,"book"],["w300","300語","known",300,"book"],["w500","500語","known",500,"book"],["w1000","1000語","known",1000,"book"],["w2000","2000語","known",2000,"book"],
  ["s3","3日連続","best",3,"flame"],["s7","7日連続","best",7,"flame"],["s14","14日連続","best",14,"flame"],["s30","30日連続","best",30,"flame"],["s100","100日連続","best",100,"flame"],
  ["a100","100問","all",100,"star"],["a1000","1000問","all",1000,"star"],["a5000","5000問","all",5000,"star"],
  ["d10","学習10日","days",10,"cal"],["d30","学習30日","days",30,"cal"],["d100","学習100日","days",100,"cal"],
  ["l1","到達テスト合格","lv",1,"flag"],["lall","全レベル合格","lv",0,"flag"]
];
function p70BadgeNeed(b){return b[2]==="lv"&&b[3]===0?P_LVLS.length:b[3];}
var P70_TIER=["#C8875A","#A7B1BC","#E8B923","#4FB3BF","#9B7BEA"];
function p70BadgeArt(b,on,size){
  var same=P70_BADGES.filter(function(x){return x[4]===b[4];}),tier=Math.min(4,Math.floor(same.indexOf(b)/Math.max(1,same.length)*5)),c=on?P70_TIER[tier]:"#9AA0A6",bg=on?c:"#5F6368";
  var ic={book:'<path d="M-9 -6l9 2 9-2v14l-9 2-9-2z" fill="#fff"/><path d="M0 -4v14" stroke="'+bg+'" stroke-width="1.2"/>',flame:'<path d="M0 11v-10" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/><path d="M0 1q0-9 10-10 0 9-10 10z" fill="#fff"/><path d="M0 4q0-7-8-7 0 7 8 7z" fill="#fff"/>',star:'<path d="M0 -10l3 6 6.6.9-4.8 4.6 1.2 6.5L0 5-5.9 8l1.2-6.5L-9.5-3.1l6.6-.9z" fill="#fff"/>',cal:'<rect x="-9" y="-7" width="18" height="16" rx="2" fill="#fff"/><rect x="-9" y="-7" width="18" height="5" fill="'+bg+'" opacity=".5"/><path d="M-4 3l3 3 6-7" stroke="'+bg+'" stroke-width="2" fill="none"/>',flag:'<path d="M-6 10v-20" stroke="#fff" stroke-width="2.4"/><path d="M-6 -10h14l-4 5 4 5h-14z" fill="#fff"/>'}[b[4]];
  return '<svg width="'+(size||56)+'" height="'+(size||56)+'" viewBox="0 0 56 56" aria-hidden="true"><path d="M18 36l-6 18 8-4 5 6 4-16zM38 36l6 18-8-4-5 6-4-16z" fill="'+(on?"#E63946":"#80868B")+'" opacity="'+(on?1:.5)+'"/><circle cx="28" cy="26" r="20" fill="'+bg+'"/><circle cx="28" cy="26" r="16" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.4" stroke-dasharray="'+(on?"0":"3 3")+'"/><g transform="translate(28 26)">'+ic+'</g>'+(on?'<path d="M14 14q6-6 12-7" stroke="#fff" stroke-opacity=".5" stroke-width="2.4" fill="none" stroke-linecap="round"/>':'')+'</svg>';
}
function p70Earned(S){return P70_BADGES.filter(function(b){return S[b[2]]>=p70BadgeNeed(b);});}
function p70CheckBadges(){
  try{var S=p70Stats(),e=p70Earned(S),fresh=[];
    p70Store.known[todayKey()]=S.known;
    e.forEach(function(b){if(!p70Store.badges[b[0]]){p70Store.badges[b[0]]=todayKey();fresh.push(b);}});
    if(!p70Store.init){p70Store.init=1;fresh=[];}
    p70Save();
    if(fresh.length&&!document.querySelector("#p48modal.show"))setTimeout(function(){p70ShowBadge(fresh);},400);
  }catch(_){}
}
function p70ShowBadge(list){
  var m=document.getElementById("p48modal");if(!m){m=document.createElement("div");m.id="p48modal";document.body.appendChild(m);}
  if(m.className==="show")return;
  var conf="";for(var i=0;i<30;i++)conf+='<i style="left:'+(Math.random()*100).toFixed(1)+'%;animation-delay:'+(Math.random()*0.6).toFixed(2)+'s;background:'+(["var(--accent)","#F2B705","#FFF4E0","var(--sub)"][i%4])+';transform:rotate('+(i*37)+'deg)"></i>';
  var b=list[list.length-1];
  m.innerHTML='<div class="p48-mask"></div><div class="p53-conf">'+conf+'</div><div class="p48-dialog p53-cele p70-bdlg"><div class="p70-bscene">'+P70_SCENE.goal()+'</div><div class="p70-bbig">'+p70BadgeArt(b,1,92)+'</div><h3>バッジ獲得！</h3><p><b>'+esc(b[1])+'</b>'+(list.length>1?'<br>ほか '+(list.length-1)+' 個':'')+'</p>'+
    '<button type="button" class="p48-dlgbtn" style="background:var(--accent);border-color:var(--accent);color:#fff" data-act="p53celeok">やった！</button></div>';
  m.className="show";
}
/* ---------- 週のまとめ ---------- */
function p70Week(){
  var now=new Date(),dow=(now.getDay()+6)%7,days=[],ans=0,act=0,prev=0;
  for(var i=0;i<7;i++){var k=p70DayKey(i-dow),c=i<=dow?p48DayCount(k):0;days.push({k:k,c:c,future:i>dow,today:i===dow});ans+=c;if(c>0)act++;}
  for(var j=1;j<=7;j++)prev+=p48DayCount(p70DayKey(-dow-j));
  var base=null,ks=Object.keys(p70Store.known).sort();ks.forEach(function(k){if(k<days[0].k)base=p70Store.known[k];});
  if(base===null){ks.forEach(function(k){if(base===null&&k>=days[0].k)base=p70Store.known[k];});}
  var gain=Math.max(0,p47KnownCount()-(base===null?p47KnownCount():base));
  return {days:days,ans:ans,act:act,prev:prev,gain:gain};
}
function p70WeekStrip(){
  var W=p70Week(),wd=["月","火","水","木","金","土","日"],t=p47Target(),d=p47DoneToday(),left=Math.max(0,t-d);
  return '<div class="p70-week"><div class="p70-wdays">'+W.days.map(function(x,i){return '<span class="'+(x.c>0?"on ":"")+(x.today?"td ":"")+(x.future?"fu":"")+'"><i>'+(x.c>0?'<svg viewBox="0 0 24 24" width="13" height="13"><path d="M12 21v-8" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M12 13q0-8 9-9 0 8-9 9z" fill="currentColor"/><path d="M12 16q0-6-8-6 0 6 8 6z" fill="currentColor"/></svg>':'')+'</i><small>'+wd[i]+'</small></span>';}).join("")+'</div>'+
    '<div class="p70-left">'+(left?'今日あと <b>'+left+'</b> 問':'<b>今日の目標達成</b> ✓')+'</div></div>';
}
function p70WeekCard(){
  var W=p70Week(),diff=W.ans-W.prev,S=p70Stats(),e=p70Earned(S);
  var h='<div class="p60-h">今週のまとめ<small>月曜から</small></div><div class="p70-wsum"><div><b>'+W.act+'</b><small>/ 7 日</small><span>学習した日</span></div><div><b>'+W.ans.toLocaleString()+'</b><small>問</small><span>解いた問題'+(W.prev||W.ans?'<em class="'+(diff>=0?"up":"dn")+'">'+(diff>=0?'先週より +'+diff:'先週は '+W.prev.toLocaleString()+' 問')+'</em>':'')+'</span></div><div><b>'+W.gain+'</b><small>語</small><span>新しく覚えた</span></div></div>';
  h+='<div class="p60-h">バッジ<small>'+e.length+' / '+P70_BADGES.length+'</small></div><div class="p70-badges">';
  P70_BADGES.forEach(function(b){var on=S[b[2]]>=p70BadgeNeed(b),need=p70BadgeNeed(b),left=Math.max(0,need-S[b[2]]);h+='<div class="p70-bd'+(on?" on":"")+'">'+p70BadgeArt(b,on,52)+'<b>'+esc(b[1])+'</b><small>'+(on?(p70Store.badges[b[0]]?p70Store.badges[b[0]].slice(5).replace("-","/"):"獲得"):'あと '+left.toLocaleString())+'</small></div>';});
  h+='</div><button type="button" class="p60-rowlink p70-roadlink" data-act="p70road"><span>道のりを見る</span><span>›</span></button>';
  return h;
}
/* ---------- 画面への組み込み ---------- */
var _p70Home=renderHome;
renderHome=function(){
  var h=String(_p70Home.apply(this,arguments));
  try{
    var strip=p70WeekStrip(),i=h.indexOf('<button type="button" class="p56-goal"');
    if(i<0)i=h.indexOf('<div class="p51-herowrap">');
    if(i>=0)h=h.slice(0,i)+strip+h.slice(i);
    var rc=p70RoadCard(),j=h.indexOf('<button type="button" class="p47-card"');
    if(j<0)j=h.indexOf('<div class="p62-facts">');
    if(j<0)j=h.indexOf('<div class="p62-list">');
    if(j>=0)h=h.slice(0,j)+rc+h.slice(j);else{var e=h.lastIndexOf('</div>');h=h.slice(0,e)+rc+h.slice(e);}
    if(settings.p70Style==="illust"){
      var L=p56LevelState();
      h=h.replace(/<div class="p47-heroart">[\s\S]*?<\/div>(?=<div class="p47-herobody">)/,'<div class="p47-heroart p70-heroart">'+P70_SCENE[L.cur]()+'</div>');
      h=h.replace(/(<button type="button" class="p47-card" data-act="(p47words|p48reinf)"><span class="p47-cardic[^"]*">)[\s\S]*?(<\/span>)/g,function(m,a,k,c){return a+P70_ICON[k]+c;});
    }
  }catch(_){}
  setTimeout(p70CheckBadges,0);
  return h;
};
var _p70Stats=renderP48Stats;
renderP48Stats=function(){
  var h=String(_p70Stats.apply(this,arguments));
  try{
    var i=h.indexOf('<div class="p60-h">レベル</div>');
    if(i>=0)h=h.slice(0,i)+p70WeekCard()+h.slice(i);
    h=h.replace(/<div class="p60-row"><div class="p60-rt"><b>(A1|A2|B1)<\/b>/g,function(m,l){return '<div class="p60-row p70-door"><div class="p70-doorart">'+P70_SCENE[l]()+'<span>'+({A1:"街かど",A2:"市場",B1:"列車の旅"}[l])+'</span></div><div class="p60-rt"><b>'+l+'</b>';});
  }catch(_){}
  return h;
};
/* 今日の目標達成：イラストデザインでは大きな絵を */
var _p70Cele=p53Celebrate;
p53Celebrate=function(){_p70Cele.apply(this,arguments);try{if(settings.p70Style==="illust"){var d=document.querySelector("#p48modal .p53-cele");if(d&&!d.querySelector(".p70-bscene"))d.insertAdjacentHTML("afterbegin",'<div class="p70-bscene">'+P70_SCENE.goal()+'</div>');}}catch(_){}};
/* ---------- 設定：デザイン ---------- */
function p70Mini(k){
  var m={
    simple:'<rect width="80" height="56" rx="6" fill="#141416"/><rect x="8" y="8" width="64" height="18" rx="4" fill="#26262A"/><rect x="12" y="12" width="20" height="4" rx="2" fill="#8E8E93"/><rect x="12" y="19" width="30" height="3" rx="1.5" fill="#0A84FF"/><rect x="8" y="30" width="64" height="8" rx="3" fill="#26262A"/><rect x="8" y="41" width="64" height="8" rx="3" fill="#26262A"/>',
    pop:'<rect width="80" height="56" rx="6" fill="#FFF4E6"/><rect x="8" y="6" width="64" height="22" rx="10" fill="#FF7A45"/><rect x="14" y="11" width="22" height="5" rx="2.5" fill="#fff"/><rect x="40" y="20" width="26" height="6" rx="3" fill="#fff"/><rect x="8" y="32" width="30" height="18" rx="9" fill="#5BC0EB"/><rect x="42" y="32" width="30" height="18" rx="9" fill="#9BC53D"/><circle cx="66" cy="10" r="3" fill="#FDE74C"/>',
    cool:'<rect width="80" height="56" rx="6" fill="#07090D"/><path d="M0 14h80M0 28h80M0 42h80M20 0v56M40 0v56M60 0v56" stroke="#1B222C" stroke-width=".6"/><rect x="8" y="8" width="64" height="18" fill="none" stroke="#2A3441"/><path d="M8 8v18" stroke="#22D3EE" stroke-width="1.6"/><text x="13" y="22" font-size="11" font-family="monospace" fill="#E5E7EB" font-weight="300">12</text><path d="M36 20h30" stroke="#22D3EE" stroke-width="1"/><rect x="8" y="32" width="64" height="8" fill="none" stroke="#2A3441"/><rect x="8" y="43" width="64" height="8" fill="none" stroke="#2A3441"/>',
    illust:'<rect width="80" height="56" rx="6" fill="#8FD3FF"/><path d="M0 34l16-14 12 10 14-16 16 16 10-8 12 12v22H0z" fill="#86C5A4"/><rect x="0" y="40" width="80" height="16" fill="#D9B28A"/><rect x="10" y="26" width="12" height="16" fill="#F4B183"/><rect x="24" y="22" width="10" height="20" fill="#9BB7D4"/><circle cx="64" cy="12" r="5" fill="#FFE08A"/><rect x="40" y="34" width="26" height="10" rx="3" fill="#2E86DE"/>'
  }[k];return '<svg viewBox="0 0 80 56" aria-hidden="true">'+m+'</svg>';
}
var _p70SetUI=p62SettingsUI;
p62SettingsUI=function(){
  var h=String(_p70SetUI.apply(this,arguments));
  var d='<div class="p60-dirl">デザイン</div><div class="p70-styles">'+P70_STYLES.map(function(x){return '<button type="button" class="p70-sty'+(settings.p70Style===x[0]?" on":"")+'" data-act="p70style" data-val="'+x[0]+'">'+p70Mini(x[0])+'<b>'+x[1]+'</b><small>'+x[2]+'</small></button>';}).join("")+'</div><div class="p70-stynote">色は下の「色」で別に選べます。</div>';
  return h.replace('<div class="p62-set">','<div class="p62-set">'+d+'<div style="height:16px"></div>');
};
function p70ApplyStyle(){
  var b=document.body;if(!b)return;
  P70_STYLES.forEach(function(x){b.classList.toggle("p70-"+x[0],settings.p70Style===x[0]);});
  b.classList.toggle("p63-art",!!settings.p63Art||settings.p70Style==="illust");
}
p70ApplyStyle();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',p70ApplyStyle);
var _p70Render=render;render=function(){try{p70ApplyStyle();}catch(_){}return _p70Render.apply(this,arguments);};
window.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="p70style"){e.stopImmediatePropagation();e.preventDefault();settings.p70Style=v;saveAll();p70ApplyStyle();render();return;}
  if(a==="p70road"){e.stopImmediatePropagation();e.preventDefault();p70OpenRoad();return;}
  if(a==="p70close"){e.stopImmediatePropagation();e.preventDefault();p70ClosePage();return;}
  if(a==="p70go"&&typeof p71Start==="function"){e.stopImmediatePropagation();e.preventDefault();p71Start(+v);return;}
  if(a==="p70go"){e.stopImmediatePropagation();e.preventDefault();var th=P47_THEMES[+v];p70ClosePage();if(!th)return;
    var ids=th.ids.filter(function(id){return !p47IsKnown(id);});if(!ids.length)ids=shuffle(th.ids.slice());
    var due=ids.filter(isDue),rest=ids.filter(function(id){return due.indexOf(id)<0;});p47StartIds(due.concat(rest),th.cat);return;}
  if(a==="p63art"){setTimeout(p70ApplyStyle,0);}
},true);
/* ---------- 見た目 ---------- */
(function(){try{var st=document.createElement("style");st.textContent=[
/* 共通：今週の帯・道のりカード・道のり画面・バッジ */
'.p70-week{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:2px 0 12px}',
'.p70-wdays{display:flex;gap:5px}.p70-wdays span{display:flex;flex-direction:column;align-items:center;gap:3px}',
'.p70-wdays i{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;border:1.5px solid var(--line);color:#fff;font-style:normal}',
'.p70-wdays span.on i{background:#2E9C8F;border-color:#2E9C8F}.p70-wdays span.td i{border-color:var(--accent);box-shadow:0 0 0 2px rgba(127,127,127,.0)}.p70-wdays span.td.on i{border-color:#2E9C8F}.p70-wdays span.fu i{opacity:.45}',
'.p70-wdays small{font-size:10px;color:var(--muted)}.p70-wdays span.td small{color:var(--accent);font-weight:800}',
'.p70-left{font-size:12.5px;color:var(--muted);text-align:right;white-space:nowrap}.p70-left b{font-size:17px;color:var(--ink);font-weight:800}',
'.p70-roadcard{margin-top:12px!important;display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:10px 14px 10px 10px;margin:0 0 10px;border-radius:16px;background:var(--card);border:1px solid var(--line);color:var(--ink);font:inherit}',
'.p70-rcart{flex:none;width:64px;height:48px;border-radius:10px;overflow:hidden;display:block}.p70-rcart svg{width:100%;height:100%;display:block}',
'.p70-rctxt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p70-rctxt small{font-size:11.5px;color:var(--muted)}.p70-rctxt b{font-size:15px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.p70-rdots{display:flex;gap:4px;margin-top:4px}.p70-rdots i{width:14px;height:5px;border-radius:3px;background:var(--line)}.p70-rdots i.d{background:var(--accent)}.p70-rdots i.c{background:#2E9C8F;width:22px}',
'.p70-rcgo{font-size:22px;color:var(--muted)}',
'#p70page{position:fixed;inset:0;z-index:110;background:var(--bg,#000);display:none;overflow-y:auto;-webkit-overflow-scrolling:touch}#p70page.show{display:block}body.p70-noscroll{overflow:hidden}',
'.p70-phead{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;padding:calc(env(safe-area-inset-top) + 12px) 16px 12px;background:var(--bg,#000);border-bottom:1px solid var(--line)}.p70-phead b{font-size:20px}',
'.p70-x{width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:16px}',
'.p70-pbody{padding:12px 16px 60px;max-width:560px;margin:0 auto}.p70-lead{font-size:13px;color:var(--muted);line-height:1.7;margin:0 0 12px}',
'.p70-lvban{position:relative;height:96px;border-radius:16px;overflow:hidden;margin:18px 0 6px}.p70-lvart,.p70-lvart svg{position:absolute;inset:0;width:100%;height:100%}',
'.p70-lvban b{position:absolute;left:10px;top:10px;padding:2px 10px;border-radius:10px;background:rgba(0,0,0,.55);font-size:20px;color:#fff;font-weight:900}.p70-lvban span{position:absolute;left:62px;top:15px;padding:2px 9px;border-radius:999px;background:rgba(0,0,0,.45);font-size:12px;color:#fff;font-weight:700}',
'.p70-seg{position:relative}.p70-seg svg{position:absolute;inset:0;width:100%;height:100%}',
'.p70-node{position:absolute;transform:translate(-50%,-50%);background:none;border:none;padding:0;color:var(--ink);font:inherit}',
'.p70-dot{width:52px;height:52px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:16px;background:var(--card);border:2px solid var(--lineStrong,var(--line));color:var(--muted)}',
'.p70-node.d .p70-dot{background:var(--accent);border-color:var(--accent);color:#fff;font-size:22px}',
'.p70-node.c .p70-dot{width:62px;height:62px;background:#2E9C8F;border-color:#9ED8CF;color:#fff;box-shadow:0 0 0 6px rgba(46,156,143,.22);animation:p70pulse 1.8s ease-in-out infinite}',
'@keyframes p70pulse{50%{box-shadow:0 0 0 12px rgba(46,156,143,.06)}}',
'.p70-lab{position:absolute;top:50%;transform:translateY(-50%);width:max-content;max-width:min(150px,38vw);display:flex;flex-direction:column;text-align:left}.p70-lab.r{left:62px}.p70-lab.l{right:62px;text-align:right}',
'.p70-node.c .p70-lab.r{left:74px}.p70-node.c .p70-lab.l{right:74px}.p70-lab b{font-size:13px;font-weight:700;line-height:1.3}.p70-lab small{font-size:11px;color:var(--muted)}.p70-node.c .p70-lab b{color:#2E9C8F}',
'.p70-wsum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:6px}.p70-wsum>div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 10px}',
'.p70-wsum b{font-size:24px;font-weight:800}.p70-wsum small{font-size:11px;color:var(--muted);margin-left:3px}.p70-wsum span{display:block;font-size:11.5px;color:var(--muted);margin-top:2px}',
'.p70-wsum em{display:block;font-style:normal;font-size:10.5px;margin-top:2px}.p70-wsum em.up{color:#30D158}.p70-wsum em.dn{color:var(--muted)}',
'.p70-badges{display:grid;grid-template-columns:repeat(4,1fr);gap:10px 6px;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 8px}',
'.p70-bd{display:flex;flex-direction:column;align-items:center;text-align:center;gap:2px}.p70-bd b{font-size:10.5px;line-height:1.3}.p70-bd small{font-size:10px;color:var(--muted)}.p70-bd:not(.on){opacity:.6}',
'.p70-roadlink{margin-top:10px;width:100%;border:1px solid var(--line)!important;border-radius:14px!important;background:var(--card)!important}',
'.p70-door .p70-doorart{display:none}',
'.p70-bdlg{overflow:hidden}.p70-bscene{margin:-20px -20px 0;height:120px;position:relative}.p70-bscene svg{width:100%;height:100%;display:block}.p70-bbig{margin-top:-46px;position:relative;display:flex;justify-content:center}',
'.p53-cele .p70-bscene+.p53-celeart{margin-top:-40px;position:relative}',
/* 設定のデザイン選択 */
'.p70-styles{display:grid;grid-template-columns:1fr 1fr;gap:10px}',
'.p70-sty{display:flex;flex-direction:column;align-items:flex-start;gap:3px;padding:8px 8px 10px;border-radius:14px;background:var(--card);border:2px solid var(--line);color:var(--ink);text-align:left;font:inherit}',
'.p70-sty svg{width:100%;height:auto;border-radius:8px;display:block;margin-bottom:4px}.p70-sty b{font-size:14px}.p70-sty small{font-size:11px;color:var(--muted);line-height:1.45}.p70-sty.on{border-color:var(--accent)}',
'.p70-stynote{font-size:11.5px;color:var(--muted);margin-top:6px}',
/* ===== ポップ ===== */
'body.p70-pop{font-family:ui-rounded,"SF Pro Rounded","Hiragino Maru Gothic ProN","M PLUS Rounded 1c",system-ui,sans-serif}',
'body.p70-pop #main button,body.p70-pop nav.bnav button{transition:transform .18s cubic-bezier(.34,1.56,.64,1)}body.p70-pop #main button:active{transform:scale(.95)}',
'body.p70-pop .p47-greet{font-size:30px!important;font-weight:900!important}',
'body.p70-pop .p47-hero{background:linear-gradient(135deg,var(--accent),var(--sub))!important;border:none!important;border-radius:26px!important;color:#fff!important;box-shadow:0 10px 24px rgba(0,0,0,.18)!important}',
'body.p70-pop .p47-hero .p47-kicker,body.p70-pop .p47-hero .p47-sub,body.p70-pop .p47-hero .p47-big,body.p70-pop .p47-hero .p47-big small{color:#fff!important}',
'body.p70-pop .p47-hero .p47-gauge{background:rgba(255,255,255,.35)!important;height:10px!important;border-radius:6px!important}body.p70-pop .p47-hero .p47-gauge i{background:#fff!important;border-radius:6px!important}',
'body.p70-pop .p47-cta{background:#fff!important;color:var(--accentDeep)!important;border-radius:999px!important;font-weight:900!important;box-shadow:0 4px 12px rgba(0,0,0,.16)!important}',
'body.p70-pop .p51-gear{background:rgba(255,255,255,.25)!important;border-color:transparent!important;color:#fff!important}',
'body.p70-pop .p47-card,body.p70-pop .p70-roadcard,body.p70-pop .p62-lrow{border-radius:22px!important;border:2px solid var(--line)!important;box-shadow:0 6px 18px rgba(0,0,0,.10)!important;padding-top:14px!important;padding-bottom:14px!important}',
'body.p70-pop .p47-cardic{display:flex!important;width:44px;height:44px;border-radius:14px;align-items:center;justify-content:center;flex:none}',
'body.p70-pop .p47-card[data-act="p47words"] .p47-cardic{background:#FFD6A5}body.p70-pop .p47-card[data-act="p48reinf"] .p47-cardic{background:#CAFFBF}',
'body.p70-pop .p47-more{border-radius:999px!important;border:2px dashed var(--line)!important}',
'body.p70-pop .p47-streak{background:#2E9C8F!important;color:#fff!important;border:none!important;border-radius:999px!important;box-shadow:none!important}body.p70-pop .p47-streak b,body.p70-pop .p47-streak span{color:#fff!important}',
'body.p70-pop .p70-wdays i{width:28px;height:28px;border-width:2px}body.p70-pop .p70-wdays span.on i{animation:p70bounce .5s cubic-bezier(.34,1.56,.64,1)}',
'@keyframes p70bounce{0%{transform:scale(.6)}100%{transform:scale(1)}}',
'body.p70-pop .p52-opt{border-radius:20px!important;border-width:2px!important;box-shadow:0 6px 18px rgba(0,0,0,.10)!important}',
'body.p70-pop .p52-opt.right{animation:p70pop .45s cubic-bezier(.34,1.56,.64,1);position:relative;overflow:visible!important}',
'body.p70-pop .p52-opt.right:after{content:"";position:absolute;right:18px;top:50%;width:6px;height:6px;margin-top:-3px;border-radius:50%;background:transparent;box-shadow:0 -22px #FDE74C,18px -12px #FF7A45,22px 8px #5BC0EB,8px 22px #9BC53D,-14px 18px #FF5C8A,-20px -8px #FDE74C;animation:p70burst .6s ease-out forwards}',
'@keyframes p70pop{0%{transform:scale(1)}40%{transform:scale(1.06)}100%{transform:scale(1)}}@keyframes p70burst{0%{opacity:1;transform:scale(.3)}100%{opacity:0;transform:scale(1.6)}}',
'body.p70-pop .p52-opt.wrong{animation:p70shake .35s}@keyframes p70shake{25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}',
'body.p70-pop .ans3btn,body.p70-pop .p52-next,body.p70-pop .p47-btn{border-radius:999px!important;font-weight:800!important}',
'body.p70-pop .p70-wsum>div,body.p70-pop .p70-badges,body.p70-pop .p60-list,body.p70-pop .p60-sum{border-radius:22px!important}',
'body.p70-pop nav.bnav button.on .ic{transform:scale(1.15)}',
/* ===== クール ===== */
'body.p70-cool{font-feature-settings:"tnum" 1;background-image:linear-gradient(rgba(127,127,127,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(127,127,127,.06) 1px,transparent 1px)!important;background-size:24px 24px!important}',
'body.p70-cool:not(.p69-light):not(.p62-bg){background-color:#06080C!important}',
'body.p70-cool .p47-greet{font-weight:300!important;letter-spacing:.01em!important}',
'body.p70-cool .p47-date,body.p70-cool .p47-kicker,body.p70-cool .p60-h,body.p70-cool .p60-cap,body.p70-cool .p60-dirl,body.p70-cool .p56-gl{text-transform:uppercase;letter-spacing:.14em!important;font-size:10.5px!important;font-weight:600!important}',
'body.p70-cool .p47-hero,body.p70-cool .p47-card,body.p70-cool .p70-roadcard,body.p70-cool .p60-list,body.p70-cool .p60-sum,body.p70-cool .p70-wsum>div,body.p70-cool .p70-badges,body.p70-cool .p62-lrow,body.p70-cool .p52-opt{background:transparent!important;border:1px solid var(--line)!important;border-radius:4px!important;box-shadow:none!important}',
'body.p70-cool .p47-hero{border-left:2px solid var(--accent)!important}',
'body.p70-cool .p47-big,body.p70-cool .p60-big,body.p70-cool .p70-wsum b{font-weight:200!important;letter-spacing:-.02em;font-variant-numeric:tabular-nums}',
'body.p70-cool .p47-gauge,body.p70-cool .p60-line,body.p70-cool .p56-gbar{height:2px!important;border-radius:0!important}body.p70-cool .p47-gauge i,body.p70-cool .p60-line i,body.p70-cool .p56-gbar i{border-radius:0!important;box-shadow:0 0 8px var(--accent)}',
'body.p70-cool .p47-cta{background:transparent!important;border:1px solid var(--accent)!important;color:var(--accent)!important;border-radius:2px!important;letter-spacing:.12em;font-weight:600!important}',
'body.p70-cool .p47-streak{border-radius:2px!important;font-variant-numeric:tabular-nums}',
'body.p70-cool .p70-wdays i{border-radius:2px;width:22px;height:22px;border-width:1px}body.p70-cool .p70-wdays span.on i{background:transparent;border-color:var(--accent);color:var(--accent)}',
'body.p70-cool .p70-rdots i{height:2px;border-radius:0}body.p70-cool .p70-rcart{filter:grayscale(.7) contrast(1.1);border-radius:2px}',
'body.p70-cool .p70-dot{border-radius:4px;border-width:1px}body.p70-cool .p70-node.d .p70-dot{background:transparent;color:var(--accent);border-color:var(--accent)}body.p70-cool .p70-node.c .p70-dot{background:var(--accent);border-color:var(--accent);box-shadow:0 0 18px var(--accent);animation:none}',
'body.p70-cool .p70-lvban{border-radius:4px}body.p70-cool .p70-lvart{filter:grayscale(.6) brightness(.8)}',
'body.p70-cool .p70-sty,body.p70-cool .p62-opts,body.p70-cool .p62-swb{border-radius:4px!important}',
'body.p70-cool .p53-conf{display:none}body.p70-cool #main *{transition-duration:.1s!important}',
'body.p70-cool nav.bnav{border-top:1px solid var(--line)!important}',
/* ===== イラスト ===== */
'body.p70-illust .p47-hero{border-radius:22px!important;min-height:170px;background:#2B3A55!important}body.p70-illust .p47-heroart{max-height:none!important}',
'body.p70-illust .p70-heroart:after{background:linear-gradient(90deg,rgba(0,0,0,.55) 0%,rgba(0,0,0,.25) 55%,rgba(0,0,0,0) 85%)!important}',
'body.p70-illust .p47-cardic{display:flex!important;width:48px;height:48px;border-radius:14px;background:var(--card2);align-items:center;justify-content:center;flex:none}body.p70-illust .p47-cardic svg{width:40px;height:40px}',
'body.p70-illust .p47-card,body.p70-illust .p70-roadcard{border-radius:18px!important}',
'body.p70-illust .p70-rcart{width:84px;height:60px;border-radius:12px}',
'body.p70-illust .p70-door .p70-doorart{display:block;position:relative;height:74px;margin:-14px -14px 10px;overflow:hidden;border-radius:14px 14px 0 0}body.p70-illust .p70-doorart svg{width:100%;height:100%;display:block}',
'body.p70-illust .p70-doorart span{position:absolute;right:10px;bottom:8px;padding:2px 10px;border-radius:999px;background:rgba(0,0,0,.45);color:#fff;font-size:11.5px;font-weight:700}',
'body.p70-illust .p70-wdays span.on i{background:#F4A261;border-color:#F4A261}',
'body.p70-illust .p70-badges{background:linear-gradient(180deg,var(--card),var(--card2))}'
].join("");document.head.appendChild(st);}catch(_){}})();
