/* ===== Phase85：育てるモード（学習の進み具合に合わせてマナスが成長する） =====
   ・設定でオン／オフを切りかえる（settings.pGr.on）。オフのときは、これまでの画面とまったく同じ。
   ・成長ポイントは、いまある学習記録から計算するだけ（新しい学習記録は作らない）：
       解いた問題 1問 = 1点（appHist.days の studiedWords + composeCount）
       覚えた単語 1語 = 3点（p47Known）
       学習した日 1日 = 10点
   ・10段階（PGR_KINDS.manas.st）。各段階の中に5つの小さな段階があり、上がるたびに光の星が増える。
   ・進化したときは全画面の演出（暗転 → 光 → 白いフラッシュ → 新しい姿と称号）。
     出すのは「この起動中に勉強してポイントが増え、新しい段階に入ったあと、ホームに戻ったとき」だけ。
     開いただけで毎回出ることがないように、見せた段階は settings.pGr.seen（クラウド保存）に記録する。
   ・絵はすべてこのアプリのオリジナル（phase74_art の p74Person、phase76_manga の M6 の部品を組み立てる）。
     服装・持ち物は phase74_hist／phase76_manas と同じ（資料は HANDOVER の phase76 の欄）。
   ・あとから「育てる相手」（動物など）を足すときは PGR_KINDS に同じ形で足す（settings.pGr.k で選ぶ）。 */

/* ---------- 記録 ---------- */
function pGrSt(){
  if(!settings.pGr||typeof settings.pGr!=="object"||Array.isArray(settings.pGr))settings.pGr={};
  var s=settings.pGr;if(!s.k||!PGR_KINDS[s.k])s.k="manas";
  /* こわれた値を直す */
  if(s.seen!=null&&!isFinite(+s.seen))s.seen=null;else if(s.seen!=null)s.seen=+s.seen;
  if(s.base&&(typeof s.base!=="object"||typeof s.base.d!=="string"||!isFinite(+s.base.p)))delete s.base;
  if(s.pend&&(typeof s.pend!=="object"||!isFinite(+s.pend.from)||!isFinite(+s.pend.to)))delete s.pend;
  return s;
}
function pGrOn(){return !!(settings.pGr&&settings.pGr.on);}
/* 成長ポイント（内訳つき） */
function pGrPts(){
  var days=(appHist&&appHist.days)||{},q=0,d=0;
  Object.keys(days).forEach(function(k){var c=0;try{c=p48DayCount(k);}catch(_){}if(c>0){q+=c;d++;}});
  var w=0;try{w=p47KnownCount();}catch(_){}
  return {q:q,w:w,d:d,p:q+w*3+d*10};
}
/* 今日ふえたポイント：今日はじめて見たときの値（settings.pGr.base）との差。
   はじめて見たのが勉強のあとでも数えられるように、今日の問題数から逆算した値と小さいほうを使う */
function pGrToday(P){
  var s=pGrSt(),k=todayKey(),c=0;try{c=p48DayCount(k);}catch(_){}
  var est=P.p-c-(c>0?10:0);
  if(!s.base||s.base.d!==k){s.base={d:k,p:est};}
  else if(est<s.base.p)s.base.p=est;
  return Math.max(0,P.p-s.base.p);
}

/* ---------- 育てる相手（いまはマナスだけ） ---------- */
/* 次の段階に必要なポイント。1日に20問ほど解くと、およそ 1日目・3日目・9日目・18日目・1か月・…・5か月半で最後の姿 */
var PGR_T=[0,30,150,400,800,1400,2300,3500,5200,7500];
var PGR_KINDS={};
(function(){
  var P=null;try{P74_PATHS.forEach(function(x){if(x.id==="manas")P=x;});}catch(_){}
  if(!P||typeof M6==="undefined")return;
  var S=function(k){return P.st[k];},N=P74_NPC;
  var C=m6(N.chiyirdy,{beld:"#2B2233"}),AL=m6(P.al[2].o,{braid:"#E8B923"}),KN=m6(N.kanykey,{beld:"#3A2A4A"}),BK=P.al[1].o;
  var mate=function(c,h){return {hand:"spear",off:"none",head:h||"kalpak",body:{type:"chapan",c:c,t:"#E8D5A8"},hair:"#2B2233"};};
  var AK="#F2EEE4",AKM="#8A6A4A";/* アク・クラ：白っぽい灰色の馬（phase76_manas と同じ色） */
  PGR_KINDS.manas={name:"マナス",
    /* bg：背景とまわりの人（姿の後ろ）、fig：主人公だけ（進化の演出でも使う）、c：星を置く中心 */
    st:[
     {t:"ゆりかごのマナス",bg:function(){return M6.yurtIn()+M6.P(m6(C,{face:"joy",look:"d"}),66,130,104);},
      fig:function(){return M6.beshik(138,128,2.2)+M6.spark(160,62,.8,"#FFD34D");},c:[138,96],
      x:"物語では、ジャクプとチユルドゥの夫婦が長いあいだ祈りつづけて、やっと生まれた男の子がマナスです。ゆりかごは「ベシク（бешик）」と呼ばれる木のゆりかごです。"},
     {t:"少年マナス",bg:function(){return M6.steppe("day")+M6.yurt(206,104,.8)+M6.sheep(160,128,.9,1)+M6.sheep(186,134,.8,1);},
      fig:function(){return M6.P(m6(S(0),{face:"smile",pose:"wave"}),96,134,84);},c:[96,92],
      x:"遊牧の暮らしでは、子どもも羊や馬の世話を手伝いました。物語の少年マナスも、草原で元気に育ちます。"},
     {t:"力自慢の少年",bg:function(){return M6.steppe("day")+M6.yurt(210,104,.7);},
      fig:function(){return M6.P(m6(S(1),{pose:"wave",face:"laugh",hand:"none"}),106,134,92)+M6.rock(132,80,.8)+M6.sweat(96,52);},c:[110,84],
      x:"物語では、少年マナスは力が強く、元気にあふれていて、まわりの大人をおどろかせます。"},
     {t:"馬を乗りこなす少年",bg:function(){return M6.steppe("day")+M6.yurt(36,100,.6);},
      fig:function(){return M6.horse(130,128,.95,AK,{mane:AKM,run:1,rider:m6(S(1),{face:"joy"})});},c:[136,74],
      x:"とても小さいころから、すぐれた馬に乗れるようになったと語られます。愛馬アク・クラ（Аккула）は、物語の中で何度も活やくします。"},
     {t:"若き勇者",bg:function(){return M6.steppe("dawn")+M6.eagle(186,34,.8);},
      fig:function(){return M6.P(m6(S(2),{face:"determined",look:"r"}),110,134,112);},c:[110,76],
      x:"弓と馬は、草原で暮らす人々にとって大切な道具でした。物語の若いマナスも、勇者として名を知られていきます。"},
     {t:"四十人の仲間の長",bg:function(){return M6.steppe("day")+M6.flag(200,118,"#B3202B")+M6.P(mate("#6B8E4E"),40,124,74)+M6.P(mate("#C7823E"),66,128,78)+M6.P(mate("#5E4A7E"),170,128,78,{flip:1})+M6.P(mate("#3E6E4A"),196,124,74,{flip:1});},
      fig:function(){return M6.P(m6(S(3),{face:"determined",pose:"fist"}),118,136,112);},c:[118,76],
      x:"物語では、マナスは若いうちに「四十人の仲間（кырк чоро）」をつくります。仲間たちは一生マナスを助け、最後までともに戦ったと語られます。"},
     {t:"アルマンベトの友",bg:function(){return M6.steppe("dusk")+M6.P(m6(AL,{face:"smile"}),164,134,104,{flip:1});},
      fig:function(){return M6.P(m6(S(4),{face:"smile"}),86,134,108);},c:[86,76],
      x:"別の国で育った勇者アルマンベト（Алмамбет）が、長い旅のすえに仲間に加わります。二人は兄弟のような友になります。"},
     {t:"カヌケイの夫",bg:function(){return M6.steppe("day")+M6.yurt(206,104,.85)+M6.P(m6(KN,{face:"smile"}),160,134,100,{flip:1});},
      fig:function(){return M6.P(m6(S(5),{face:"smile"}),88,134,108);},c:[88,76],
      x:"妻カヌケイ（Каныкей）は、かしこく、人をもてなす心をもった女性として描かれます。夫が人々をまとめる戦いにも、自分から力を貸しました。"},
     {t:"民のかしら",bg:function(){return M6.steppe("day")+M6.yurt(30,100,.6)+M6.yurt(70,96,.5)+M6.yurt(214,100,.6)+M6.P(m6(BK,{face:"smile"}),196,132,70,{flip:1});},
      fig:function(){return M6.horse(118,130,1,AK,{mane:AKM,rider:m6(S(6),{face:"determined"})});},c:[122,70],
      x:"マナスたちの大きな目的は、ばらばらになっていた部族をまとめ、一つの民にすることでした。知恵のある相談役バカイ（Бакай）も、マナスを支えます。"},
     {t:"英雄マナス",bg:function(){return M6.steppe("dawn")+M6.speed(120,70,"#F2D28A")+M6.eagle(46,30,.8)+M6.flag(212,122,"#B3202B");},
      fig:function(){return M6.horse(120,132,1.08,AK,{mane:AKM,run:1,rider:m6(S(8),{face:"determined",olpok:1})});},c:[124,66],
      x:"白い戦衣アク・オルポクを着て愛馬アク・クラに乗り、仲間をひきいて大遠征（Чоң казат）に出る英雄の姿です。2013年、「マナス」の三部作はユネスコの無形文化遺産に登録されました。"}
    ]};
})();
function pGrKind(){return PGR_KINDS[pGrSt().k]||PGR_KINDS.manas;}
/* いまの段階：{i:段階, sub:小段階0〜4, frac:次の段階までの割合, need:あと何点} */
function pGrStage(p){
  var i=0;for(var j=0;j<PGR_T.length;j++)if(p>=PGR_T[j])i=j;
  if(i>=PGR_T.length-1)return {i:i,sub:4,frac:1,need:0,last:1};
  var a=PGR_T[i],b=PGR_T[i+1],f=(p-a)/(b-a);
  return {i:i,sub:Math.min(4,Math.floor(f*5)),frac:f,need:b-p,last:0};
}

/* ---------- 絵 ---------- */
/* 光の星（小さな段階の数だけ、主人公のまわりに置く） */
function pGrStars(St,n){var c=St.c||[120,80],pos=[[-46,-30],[44,-38],[-56,10],[54,6],[0,-56]],s="";
  for(var i=0;i<n;i++){s+=M6.spark(c[0]+pos[i][0],c[1]+pos[i][1],1.1,"#FFD34D");}return s;}
function pGrScene(i,sub){var K=pGrKind(),St=K.st[i];if(!St)return "";var b="";
  try{b=St.bg()+St.fig()+pGrStars(St,sub||0);}catch(e){b=M6.steppe("day");}
  return M6.svg(b);}
/* 主人公だけの絵（背景なし）。中心のまわりを切りぬいて大きく見せる */
function pGrFigSvg(i){var St=pGrKind().st[i],b="",c=St.c||[120,80];try{b=St.fig();}catch(_){}
  return '<svg class="p76-svg" viewBox="'+(c[0]-75)+' 0 150 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="overflow:visible">'+b+'</svg>';}

/* ---------- ホームの小さなカード ---------- */
function pGrCard(){
  if(!pGrOn()||!pGrKind().st)return "";
  var P=pGrPts(),G=pGrStage(P.p),St=pGrKind().st[G.i],t=pGrToday(P);
  var dots="";for(var k=0;k<5;k++)dots+='<i class="'+(k<G.sub||G.last?"on":"")+'"></i>';
  return '<button type="button" class="pgr-card" data-act="pgropen" aria-label="育てるモードを開く">'+
    '<span class="pgr-cimg">'+pGrScene(G.i,G.sub)+'</span>'+
    '<span class="pgr-ctx"><small>育てるモード　第'+(G.i+1)+'段階</small><b>'+esc(St.t)+'</b>'+
    '<span class="pgr-bar"><i style="width:'+Math.round(G.frac*100)+'%"></i></span>'+
    '<span class="pgr-cline"><span class="pgr-dots">'+dots+'</span><em>'+(G.last?'最後の姿です':'進化まで あと '+G.need.toLocaleString())+'</em></span>'+
    '<span class="pgr-today'+(t>0?' up':'')+'">今日 +'+t.toLocaleString()+'</span></span></button>';
}
if(typeof renderHome==="function"){
  var _pGrHome=renderHome;
  renderHome=function(){
    var h=String(_pGrHome.apply(this,arguments));
    if(!pGrOn()||h.indexOf('class="p47-home"')<0)return h;
    /* 週の帯（またはチャレンジのカード）の上に置く */
    var w=h.indexOf('<div class="p70-week">');if(w<0)w=h.indexOf('<div class="p51-herowrap">');
    if(w<0)return h;
    return h.slice(0,w)+pGrCard()+h.slice(w);
  };
}

/* ---------- 育てるモードの画面（下から出るページ） ---------- */
function pGrPageHtml(){
  var K=pGrKind(),P=pGrPts(),G=pGrStage(P.p),St=K.st[G.i],t=pGrToday(P);
  var h='<div class="pgr-hero">'+pGrScene(G.i,G.sub)+'</div>';
  h+='<div class="pgr-name"><small>第'+(G.i+1)+'段階 / 全'+K.st.length+'段階</small><b>'+esc(St.t)+'</b></div>';
  h+='<div class="pgr-gauge"><div class="pgr-bar big"><i style="width:'+Math.round(G.frac*100)+'%"></i></div>'+
     '<div class="pgr-gl"><span>'+(G.last?'最後の姿まで育ちました':'次の進化まで あと <b>'+G.need.toLocaleString()+'</b> ポイント')+'</span><span class="pgr-today'+(t>0?' up':'')+'">今日 +'+t.toLocaleString()+'</span></div></div>';
  h+='<p class="pgr-desc">'+esc(St.x)+'</p>';
  h+='<div class="pgr-h">成長ポイント<small>合計 '+P.p.toLocaleString()+'</small></div><div class="pgr-sum">'+
     '<div><b>'+P.q.toLocaleString()+'</b><span>解いた問題</span><small>1問 = 1</small></div>'+
     '<div><b>'+P.w.toLocaleString()+'</b><span>覚えた単語</span><small>1語 = 3</small></div>'+
     '<div><b>'+P.d.toLocaleString()+'</b><span>学習した日</span><small>1日 = 10</small></div></div>';
  h+='<p class="pgr-note">どの練習をしても、ポイントは同じように増えます。光の星は、段階の中で少し育つたびに1つずつ増えます（5つで次の段階が近い合図）。</p>';
  h+='<div class="pgr-h">これまでの姿</div><div class="pgr-gal">';
  K.st.forEach(function(s,i){var open=i<=G.i;
    h+='<div class="pgr-gi'+(open?"":" lock")+(i===G.i?" now":"")+'">'+(open?pGrScene(i,0):pGrFigSvg(i))+'<b>'+(i+1)+'. '+(open?esc(s.t):'？？？')+'</b>'+(open?'':'<small>'+PGR_T[i].toLocaleString()+' ポイントで</small>')+'</div>';});
  h+='</div>';
  h+='<button type="button" class="pgr-off" data-act="pgroff">育てるモードをやめる（通常のホームにもどす）</button>';
  h+='<p class="pgr-note">やめても、学習の記録と育ったようすはそのまま残ります。設定からいつでも、もう一度オンにできます。</p>';
  return h;
}
function pGrSheet(){var m=document.getElementById("pgrpage");if(!m){m=document.createElement("div");m.id="pgrpage";document.body.appendChild(m);}return m;}
function pGrOpen(){
  var m=pGrSheet();
  m.innerHTML='<div class="pgr-mask" data-act="pgrclose"></div><div class="pgr-panel" role="dialog" aria-modal="true" aria-label="育てるモード"><div class="pgr-ph"><b>育てるモード</b><button type="button" class="pgr-x" data-act="pgrclose" aria-label="閉じる"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="pgr-pb">'+pGrPageHtml()+'</div></div>';
  m.className="show";document.body.classList.add("pgr-open");
}
function pGrClose(){var m=pGrSheet();m.className="";m.innerHTML="";document.body.classList.remove("pgr-open");}

/* ---------- 進化の演出 ---------- */
var PGR_T0=null;/* クラウドを読み終えたときのポイント（これより増えた＝この起動中に勉強した） */
function pGrEvolve(from,to,first){
  var K=pGrKind(),St=K.st[to];if(!St)return;
  var m=document.getElementById("pgrevo");if(!m){m=document.createElement("div");m.id="pgrevo";document.body.appendChild(m);}
  var burst="";for(var i=0;i<18;i++){burst+='<span style="transform:rotate('+(i*20)+'deg)"><i style="animation-delay:'+(i%3*.06).toFixed(2)+'s"></i></span>';}
  var lead=first?(K.name+'が、あなたの学習の仲間になりました'):(K.name+'のようすが……！');
  m.innerHTML='<div class="pgr-ebg"></div><div class="pgr-rays"></div>'+
    '<div class="pgr-efig"><div class="pgr-eold">'+pGrFigSvg(first?to:from)+'</div><div class="pgr-enew">'+pGrFigSvg(to)+'</div><div class="pgr-burst">'+burst+'</div></div>'+
    '<div class="pgr-flash"></div><div class="pgr-elead">'+esc(lead)+'</div>'+
    '<div class="pgr-etx"><small>'+(first?'いまの姿':'進化！　第'+(to+1)+'段階')+'</small><b>'+esc(St.t)+'</b><p>'+esc(St.x)+'</p>'+
    '<button type="button" class="pgr-ebtn" data-act="pgrevook">つづける</button><button type="button" class="pgr-elink" data-act="pgrevopage">育つようすを見る</button></div>';
  m.className="show s1";document.body.classList.add("pgr-open");
  var go=function(c){if(m.className.indexOf("show")<0||m.className.indexOf("s4")>=0)return;m.className="show "+c;};
  var reduce=false;try{reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(_){}
  PGR_TM.forEach(clearTimeout);
  if(reduce||first){PGR_TM=[setTimeout(function(){go("s4");},first?900:50)];}
  else{PGR_TM=[setTimeout(function(){go("s2");},1500),setTimeout(function(){go("s3");},3300),setTimeout(function(){go("s4");},3600)];}
  try{if(navigator.vibrate&&!first)setTimeout(function(){navigator.vibrate([30,40,60]);},3300);}catch(_){}
}
var PGR_TM=[];
function pGrEvoClose(){PGR_TM.forEach(clearTimeout);PGR_TM=[];var m=document.getElementById("pgrevo");if(m){m.className="";m.innerHTML="";}document.body.classList.remove("pgr-open");}
/* 段階が上がったかを確かめる（どの画面でも）。
   この起動中に勉強してポイントが増えて上がったときは「まだ見せていない進化」settings.pGr.pend に入れる。
   開いただけ（クラウドから記録が届いただけ）で上がったときは、演出なしで記録だけ合わせる。 */
var PGR_BUSY="#p48modal.show,#pgrevo.show,#p81sheet.show,#pgrpage.show,#p70page.show,#p72g.show,#onboardHost:not(:empty)";
function pGrCheck(){
  try{
    if(!pGrOn()||!pGrKind().st)return;
    if(typeof p83Cloud==="function"&&!p83Cloud())return;/* クラウドを読み終えるまで待つ */
    var s=pGrSt(),P=pGrPts(),G=pGrStage(P.p),ch=false;
    if(PGR_T0===null)PGR_T0=P.p;
    if(s.seen==null){s.seen=G.i;ch=true;}
    else if(G.i>s.seen){
      if(P.p>PGR_T0)s.pend={from:s.pend?s.pend.from:s.seen,to:G.i};
      s.seen=G.i;ch=true;
    }else if(G.i<s.seen){s.seen=G.i;delete s.pend;ch=true;}/* 記録を戻したとき */
    if(ch){try{saveAll();}catch(_){}}
    pGrShowPend();
  }catch(_){}
}
/* まだ見せていない進化を、ホームが見えていて、ほかの画面（お祝い・冒険・文法書など）が開いていないときに出す */
function pGrShowPend(){
  var s=pGrSt();if(!s.pend||!pGrOn())return;
  if(ui.bnav!=="home"||document.querySelector(PGR_BUSY))return;
  if(PGR_WAIT)return;PGR_WAIT=1;
  setTimeout(function(){PGR_WAIT=0;
    if(!s.pend||ui.bnav!=="home"||document.querySelector(PGR_BUSY))return;/* 直前にお祝いなどが開いたら、次の機会に */
    var e=s.pend;delete s.pend;try{saveAll();}catch(_){}
    pGrEvolve(+e.from,+e.to,false);
  },700);
}
var PGR_WAIT=0;
(function(){
  var r=render;render=function(){var o=r.apply(this,arguments);setTimeout(pGrCheck,0);return o;};
  /* クラウドを読み終えた時点のポイントを覚える */
  (function wait(n){if(typeof p83Cloud!=="function"||p83Cloud()){try{PGR_T0=pGrPts().p;}catch(_){}return;}if(n<80)setTimeout(function(){wait(n+1);},250);})(0);
  /* 冒険や文法書を閉じたときは render が呼ばれないことがあるので、ときどき確かめる（オンのときだけ） */
  setInterval(function(){if(pGrOn()&&!document.hidden)pGrCheck();},1500);
})();

/* ---------- ボタン ---------- */
function pGrSetOn(v){
  var s=pGrSt();s.on=v?1:0;
  if(v){var G=pGrStage(pGrPts().p);s.seen=G.i;}
  try{saveAll();}catch(_){}
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a.indexOf("pgr")!==0)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="pgropen"){pGrOpen();return;}
  if(a==="pgrclose"){pGrClose();try{render();}catch(_){}return;}
  if(a==="pgrtog"){var on=!pGrOn();pGrSetOn(on);render();if(on)pGrEvolve(0,pGrStage(pGrPts().p).i,true);return;}
  if(a==="pgron"){pGrSetOn(1);try{if(typeof p81Close==="function")p81Close();}catch(_){}ui.bnav="home";render();pGrEvolve(0,pGrStage(pGrPts().p).i,true);return;}
  if(a==="pgroff"){pGrSetOn(0);pGrClose();render();return;}
  if(a==="pgrevook"){pGrEvoClose();try{render();}catch(_){}return;}
  if(a==="pgrevopage"){pGrEvoClose();pGrOpen();return;}
},true);
/* 演出の途中で画面を押したら、最後（新しい姿）まで飛ばす */
document.addEventListener("click",function(e){
  var m=document.getElementById("pgrevo");if(!m||m.className.indexOf("show")<0)return;
  if(e.target.closest&&e.target.closest("[data-act]"))return;
  if(m.className.indexOf("s4")<0){PGR_TM.forEach(clearTimeout);m.className="show s4";}
},true);

/* 設定：育てるモードのオン／オフ */
if(typeof p62SettingsUI==="function"){
  var _pGrSetUI=p62SettingsUI;
  p62SettingsUI=function(){
    var h=String(_pGrSetUI.apply(this,arguments)),i=h.lastIndexOf('</div>');
    return h.slice(0,i)+'<button type="button" class="p63-tog" data-act="pgrtog"><span><b>育てるモード（マナスが育つ）</b><small>勉強するほどマナスが成長し、ホームに今の姿が出ます。オフにすると、ふつうのホームにもどります</small></span><i class="'+(pGrOn()?"on":"")+'"></i></button>'+h.slice(i);
  };
}
/* 使い方のページ：続ける気持ちを高めたい人への案内 */
if(typeof p81GuideHtml==="function"){
  var _pGrGuide=p81GuideHtml;
  p81GuideHtml=function(){
    var h=String(_pGrGuide.apply(this,arguments)),i=h.indexOf('<div class="p81-gh">');if(i<0)return h;
    var c='<div class="p81-g"><div class="p81-gwho">続ける楽しみがほしい人</div><div class="p81-gmode">'+p81Ic("sun",20)+'<b>育てるモード</b></div><p>どのモードで勉強しても、解いた問題・覚えた単語・学習した日の数に合わせて、英雄マナスがゆりかごの赤ちゃんから少しずつ育ちます。ホームに今の姿が出て、新しい段階に入ると進化の場面が見られます。'+(pGrOn()?'<br><b>いまオンになっています。</b>':'')+'</p>'+(pGrOn()?'':'<button type="button" class="p81-gbtn" data-act="pgron">育てるモードをオンにする '+p81Ic("go",15)+'</button>')+'</div>';
    return h.slice(0,i)+c+h.slice(i);
  };
}

(function(){
  var st=document.createElement("style");
  st.textContent=
  /* ホームのカード */
  '.pgr-card{display:flex;align-items:center;gap:12px;width:100%;text-align:left;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:16px;padding:10px 12px 10px 10px;margin:0 0 12px;font:inherit;cursor:pointer}'+
  '.pgr-cimg{flex:none;width:118px;border-radius:10px;overflow:hidden;line-height:0}.pgr-cimg svg{width:100%;height:auto;display:block}'+
  '.pgr-ctx{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.pgr-ctx small{font-size:12px;color:var(--muted);font-weight:700}.pgr-ctx b{font-size:16px;line-height:1.3}'+
  '.pgr-bar{display:block;height:7px;border-radius:99px;background:var(--line);overflow:hidden}.pgr-bar i{display:block;height:100%;border-radius:99px;background:linear-gradient(90deg,var(--accent),#E8B923);transition:width .8s ease}.pgr-bar.big{height:10px}'+
  '.pgr-cline{display:flex;align-items:center;justify-content:space-between;gap:6px}.pgr-cline em{font-style:normal;font-size:12px;color:var(--muted)}'+
  '.pgr-dots{display:flex;gap:3px}.pgr-dots i{width:7px;height:7px;border-radius:50%;border:1.5px solid #C99A2E}.pgr-dots i.on{background:#E8B923;border-color:#E8B923}'+
  '.pgr-today{font-size:12.5px;font-weight:700;color:var(--muted)}.pgr-today.up{color:var(--accent)}'+
  /* 育てるモードの画面 */
  '#pgrpage{display:none}#pgrpage.show{display:block;position:fixed;inset:0;z-index:212}.pgr-mask{position:absolute;inset:0;background:rgba(0,0,0,.55)}'+
  '.pgr-panel{position:absolute;left:0;right:0;bottom:0;max-height:94vh;max-width:560px;margin:0 auto;background:var(--bg);border-top:1px solid var(--line);border-radius:18px 18px 0 0;display:flex;flex-direction:column}'+
  '.pgr-ph{display:flex;align-items:center;justify-content:space-between;padding:14px 16px 8px}.pgr-ph b{font-size:18px}'+
  '.pgr-x{width:40px;height:40px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
  '.pgr-pb{overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:4px 16px calc(24px + env(safe-area-inset-bottom))}'+
  '.pgr-hero{border-radius:14px;overflow:hidden;line-height:0;border:1px solid var(--line)}.pgr-hero svg{width:100%;height:auto}'+
  '.pgr-name{margin:12px 2px 6px}.pgr-name small{display:block;font-size:12.5px;color:var(--muted);font-weight:700}.pgr-name b{font-size:22px}'+
  '.pgr-gl{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;margin-top:6px}.pgr-gl b{color:var(--accent)}'+
  '.pgr-desc{font-size:14.5px;line-height:1.8;margin:12px 2px}'+
  '.pgr-h{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:700;color:var(--muted);margin:16px 2px 6px}.pgr-h small{font-size:12.5px}'+
  '.pgr-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.pgr-sum div{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:10px 8px;text-align:center;display:flex;flex-direction:column;gap:1px}.pgr-sum b{font-size:19px}.pgr-sum span{font-size:12.5px}.pgr-sum small{font-size:11.5px;color:var(--muted)}'+
  '.pgr-note{font-size:13px;line-height:1.7;color:var(--muted);margin:10px 2px}'+
  '.pgr-gal{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pgr-gi{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:6px;display:flex;flex-direction:column;gap:3px}.pgr-gi svg{width:100%;height:auto;border-radius:8px}.pgr-gi b{font-size:13px}.pgr-gi small{font-size:11.5px;color:var(--muted)}'+
  '.pgr-gi.now{border:2px solid var(--accent)}.pgr-gi.lock svg{filter:brightness(0) contrast(0);opacity:.55}'+
  '.pgr-off{display:block;width:100%;margin:18px 0 0;min-height:48px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:14px;cursor:pointer}'+
  'body.pgr-open{overflow:hidden}'+
  /* 進化の演出（s1 前の姿 → s2 光に包まれる → s3 白いフラッシュ → s4 新しい姿） */
  '#pgrevo{display:none}#pgrevo.show{display:block;position:fixed;inset:0;z-index:230;overflow:hidden;color:#fff}'+
  '.pgr-ebg{position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,#2A2140 0%,#0B0912 70%);animation:pgrFade .6s ease}'+
  '.pgr-rays{position:absolute;left:50%;top:40%;width:180vmax;height:180vmax;margin:-90vmax 0 0 -90vmax;background:repeating-conic-gradient(from 0deg,rgba(255,224,140,.0) 0deg 9deg,rgba(255,224,140,.22) 9deg 14deg);opacity:0;transition:opacity .8s;animation:pgrSpin 14s linear infinite;-webkit-mask:radial-gradient(circle,#000 0,#000 18%,transparent 60%);mask:radial-gradient(circle,#000 0,#000 18%,transparent 60%)}'+
  '#pgrevo.s2 .pgr-rays{opacity:.7;animation-duration:5s}#pgrevo.s4 .pgr-rays{opacity:1;animation-duration:22s}'+
  '.pgr-efig{position:absolute;left:50%;top:40%;width:min(80vw,400px,44vh);transform:translate(-50%,-50%);transition:top .7s ease}#pgrevo.s4 .pgr-efig{top:30%}.pgr-efig svg{width:100%;height:auto;display:block;overflow:visible}'+
  '.pgr-eold,.pgr-enew{transition:opacity .3s,filter .6s,transform .6s}.pgr-enew{position:absolute;inset:0;opacity:0;transform:scale(.6)}'+
  '#pgrevo.s1 .pgr-eold{animation:pgrRise .9s ease both}'+
  '#pgrevo.s2 .pgr-eold{filter:brightness(0) invert(1) drop-shadow(0 0 12px #FFE08C) drop-shadow(0 0 28px #FFB84D);animation:pgrShake .18s linear infinite,pgrPulse .9s ease-in-out infinite alternate}'+
  '#pgrevo.s3 .pgr-eold{filter:brightness(0) invert(1);transform:scale(1.3);opacity:0}'+
  '#pgrevo.s4 .pgr-eold{opacity:0}#pgrevo.s4 .pgr-enew{opacity:1;transform:scale(1);animation:pgrPop .7s cubic-bezier(.2,1.6,.4,1) both;filter:drop-shadow(0 0 18px rgba(255,214,110,.55))}'+
  '.pgr-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}#pgrevo.s3 .pgr-flash{opacity:1;transition:opacity .15s}#pgrevo.s4 .pgr-flash{opacity:0;transition:opacity .9s}'+
  '.pgr-burst{position:absolute;left:50%;top:50%;width:0;height:0}.pgr-burst span{position:absolute;left:0;top:0;width:0;height:0}.pgr-burst i{position:absolute;left:-3px;top:-14px;width:6px;height:28px;border-radius:3px;background:linear-gradient(#FFF6D0,#FFB84D);opacity:0}'+
  '#pgrevo.s4 .pgr-burst i{animation:pgrBurst .9s ease-out both}'+
  '.pgr-elead{position:absolute;left:0;right:0;top:calc(40% + min(40vw,200px,22vh) + 12px);text-align:center;font-size:18px;font-weight:800;letter-spacing:.04em;padding:0 16px;transition:opacity .4s}#pgrevo.s4 .pgr-elead{opacity:0}'+
  '.pgr-etx{position:absolute;left:0;right:0;bottom:0;padding:0 20px calc(24px + env(safe-area-inset-bottom));max-width:560px;margin:0 auto;text-align:center;opacity:0;transform:translateY(20px);pointer-events:none}'+
  '#pgrevo.s4 .pgr-etx{opacity:1;transform:none;transition:opacity .6s .5s,transform .6s .5s;pointer-events:auto}'+
  '.pgr-etx small{display:block;font-size:14px;font-weight:800;color:#FFD34D;letter-spacing:.12em}.pgr-etx b{display:block;font-size:30px;line-height:1.3;margin:4px 0 8px;text-shadow:0 0 18px rgba(255,200,90,.6)}'+
  '.pgr-etx p{font-size:14px;line-height:1.75;color:#E9E4F2;margin:0 0 16px;text-align:left}'+
  '.pgr-ebtn{display:block;width:100%;min-height:52px;border-radius:14px;border:0;background:#E8B923;color:#2B2233;font:inherit;font-size:17px;font-weight:800;cursor:pointer}'+
  '.pgr-elink{display:block;width:100%;min-height:44px;margin-top:6px;border:0;background:none;color:#E9E4F2;font:inherit;font-size:14px;text-decoration:underline;cursor:pointer}'+
  '@keyframes pgrFade{from{opacity:0}to{opacity:1}}@keyframes pgrSpin{to{transform:rotate(360deg)}}'+
  '@keyframes pgrRise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}'+
  '@keyframes pgrShake{0%{transform:translate(0,0)}25%{transform:translate(-2px,1px)}50%{transform:translate(2px,-1px)}75%{transform:translate(-1px,-2px)}100%{transform:translate(1px,2px)}}'+
  '@keyframes pgrPulse{from{opacity:.75}to{opacity:1}}'+
  '@keyframes pgrPop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:scale(1)}}'+
  '@keyframes pgrBurst{0%{opacity:0;transform:translateY(-40px)}20%{opacity:1}100%{opacity:0;transform:translateY(-200px)}}'+
  /* こまかい動きを減らす設定の人には、動きなしで新しい姿だけ */
  '@media (prefers-reduced-motion:reduce){.pgr-rays,.pgr-eold,.pgr-enew,.pgr-burst i{animation:none!important}.pgr-burst{display:none}}'+
  /* 高さの低い画面（小さいスマホ・横向き）：絵を小さくし、説明はその中でスクロール */
  '@media (max-height:620px){.pgr-efig{width:min(80vw,400px,34vh)}#pgrevo.s4 .pgr-efig{top:20%}.pgr-etx b{font-size:24px;margin:2px 0 4px}.pgr-etx p{font-size:13px;line-height:1.6;margin:0 0 10px;max-height:22vh;overflow-y:auto}.pgr-ebtn{min-height:46px}}'+
  '@media (max-height:420px){#pgrevo.s4 .pgr-efig{left:25%;top:50%;width:min(44vw,60vh)}.pgr-etx{left:50%;right:0;bottom:auto;top:50%;transform:translateY(-50%)!important;padding:0 16px}#pgrevo.s4 .pgr-etx{transform:translateY(-50%)!important}.pgr-etx p{max-height:34vh}}'+
  /* とても狭い画面 */
  '@media (max-width:350px){.pgr-cimg{width:96px}.pgr-etx b{font-size:26px}}';
  document.head.appendChild(st);
})();
