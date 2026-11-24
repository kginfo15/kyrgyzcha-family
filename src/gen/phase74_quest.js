/* ===== Phase74：道のりを「冒険」に（5つの成り上がりの道・モンスター・ボス・装備・技・仲間）。ストーリーなし（今までの路線図）も選べる =====
   記録：settings.p74 = {mode:"story"|"plain", path:"sword"…}。進み具合そのものはレッスンの記録（settings.p71.done）から毎回計算するので、
   道を変えても進み具合は消えず、同じ段階の姿・装備・技・仲間がその道のものに置きかわる。 */
if(!settings.p74||typeof settings.p74!=="object")settings.p74={};
function p74S(){if(!settings.p74||typeof settings.p74!=="object")settings.p74={};return settings.p74;}
function p74Story(){return p74S().mode!=="plain";}
function p74Path(){var id=p74S().path;for(var i=0;i<P74_PATHS.length;i++)if(P74_PATHS[i].id===id)return P74_PATHS[i];return null;}
var P74_CH=8;
function p74Chapters(n){var out=[],a=0;for(var c=0;c<P74_CH;c++){var b=Math.round((c+1)*n/P74_CH);out.push([a,b]);a=b;}return out;}
/* 進み具合をまとめて計算 */
/* 「最初から」を選んだ道は、その道だけの冒険の記録 settings.p74.own[道] = {"テーマ#レッスン": 日付} で数える。
   単語の学習記録（settings.p71.done など）やお気に入りは消さない。「続きから」の道はレッスンの記録をそのまま使う。 */
function p74Own(pid){var s=p74S();pid=pid||s.path;return s.own&&s.own[pid]&&typeof s.own[pid]==="object"?s.own[pid]:null;}
function p74Next(ti,pid){var o=p74Own(pid);if(!o)return p71NextIn(ti);var L=p71Lessons(ti);for(var i=0;i<L.length;i++)if(!o[p71Key(ti,i)])return i;return -1;}
function p74Road(pid){var R=p70Road(),o=p74Own(pid);if(!o)return R;var L=R.list.map(function(x){var y={};for(var k in x)y[k]=x[k];var n=0;for(var i=0;i<y.ln;i++)if(o[p71Key(y.i,i)])n++;y.ld=n;y.done=y.ln>0&&n>=y.ln;return y;}),cur=-1;
  L.forEach(function(y){if(!y.done&&cur<0)cur=y.i;});return {list:L,cur:cur};}
function p74State(pid){
  var R=p74Road(pid),L=R.list,CH=p74Chapters(L.length),lessons=0,half=0,boss=0,chs=[];
  L.forEach(function(x){lessons+=Math.min(x.ld||0,x.ln||0);});
  CH.forEach(function(r,c){var th=L.slice(r[0],r[1]),dn=th.filter(function(x){return x.done;}).length,need=th.length;
    var h=dn>=Math.ceil(need/2),d=dn>=need;if(h)half++;if(d)boss++;chs.push({c:c,from:r[0],to:r[1],themes:th,done:dn,need:need,half:h,beat:d});});
  var cur=R.cur>=0?L[R.cur]:null,cc=cur?chs.filter(function(ch){return R.cur>=ch.from&&R.cur<ch.to;})[0]:null;
  return {R:R,list:L,ch:chs,lessons:lessons,lv:1+lessons,stage:boss,boss:boss,gear:Math.min(17,1+half+boss),skills:boss,allies:[1,2,4,6,8].filter(function(k){return boss>=k;}).length,cur:cur,curCh:cc};
}
function p74Hero(P,stage,cls){return p74Svg(p74Person(P.st[Math.max(0,Math.min(8,stage))]),cls||"p74-hero");}
function p74AllyArt(a,cls){return p74Svg(a.animal?p74Animal(a.animal,a.c):p74Person(a.o),cls||"p74-ally");}
function p74Bar(v,max,cls){var P0=null;try{P0=p74Path();}catch(_){}if(P0&&P0.ev&&/red/.test(cls||"")){cls=cls.replace("red","ev");v=max-v;}var p=max?Math.max(0,Math.min(100,Math.round(v/max*100))):0;return '<span class="p74-hp '+(cls||"")+'"><i style="width:'+p+'%"></i></span>';}
function p74BossLv(c){return 8+c*9;}
/* ---------- ホームのカード ---------- */
var _p74RoadCard=p70RoadCard;
p70RoadCard=function(){
  var h=String(_p74RoadCard.apply(this,arguments));if(!p74Story())return h;
  var P=p74Path(),S=p74State(),card;
  h=h.replace("<b>道のり</b>","<b>"+P74_NAME+"</b>");
  if(!P){
    card='<button type="button" class="p74-card" data-act="p70road"><span class="p74-cart">'+p74Svg(p74Person(P74_PATHS[0].st[0]),"p74-cimg")+'</span><span class="p74-ctxt"><small>'+P74_NAME+'をはじめる</small><b>なりたい姿を選んで冒険しよう</b><em>剣・魔法・王・武士・海／マナスなど物語と歴史</em></span><span class="p70-rcgo">›</span></button>';
  }else{
    var c=S.cur,ti=c?c.i:0,mon=c?p74FoeName(P,ti):"";var li=c?p74Next(ti):-1;
    var ls=p71St().last,lx=-1;if(ls)S.list.forEach(function(x,k){if(x.cat===ls)lx=k;});
    if(lx>=0){var pk=null;for(var q=0;q<S.list.length&&!pk;q++){var y=S.list[(lx+q)%S.list.length];if(!y.done)pk=y;}if(pk){c=pk;ti=pk.i;mon=p74FoeName(P,ti);li=p74Next(ti);}}
    card='<button type="button" class="p74-card" data-act="p71go" data-val="'+ti+'"><span class="p74-cart p74-duel">'+p74Hero(P,S.stage,"p74-cimg")+(c?p74Svg(p74FoeArt(P,ti),"p74-cimg p74-cmon"):'')+'</span>'+
      '<span class="p74-ctxt"><small>'+P74_NAME+'を続きから ・ '+esc(P.titles[S.stage])+' Lv '+S.lv+'</small>'+
      (c?'<b>'+(P.ev?'「'+esc(mon)+'」へ進む':esc(mon)+'とたたかう')+'</b><em>'+esc(c.cat)+' ・ 完了 '+c.ld+' / '+c.ln+' レッスン</em>'+p74Bar(c.ln-c.ld,c.ln,"red"):'<b>'+(P.ev?'すべての出来事をクリア！':'すべての敵を'+P.verb+'！')+'</b><em>'+esc(P.titles[8])+'になりました</em>')+'</span><span class="p70-rcgo">›</span></button>';
  }
  return h.replace(/<button type="button" class="p70-roadcard"[\s\S]*?<\/button>/,card);
};
/* ---------- 冒険のページ ---------- */
var _p74Open=p70OpenRoad,P74_VIEW=null;
function p74Page(inner){
  var m=document.getElementById("p70page");if(!m){m=document.createElement("div");m.id="p70page";document.body.appendChild(m);}
  m.innerHTML='<div class="p70-phead"><b>'+P74_NAME+'</b><button type="button" class="p70-x" data-act="p70close" aria-label="閉じる">✕</button></div><div class="p70-pbody p74-page">'+inner+'</div>';
  m.className="show";document.body.classList.add("p70-noscroll");return m;
}
function p74Chooser(){
  var cur=p74S().path,h=(cur&&p74Path()?'<p class="p74-curp">いまの道：<b>'+esc(p74Path().name)+'</b>。同じ道を押すと「続きから／最初から」を選べます。</p>':'')+'<p class="p70-lead">なりたい姿を1つ選んでください。レッスンを終えるたびに敵にダメージを与え、テーマを終えると敵を倒せます。ボスを倒すたびに姿が変わり、装備・技・仲間が増えていきます。道はあとから変えられます（進み具合はそのまま）。</p><div class="p74-paths">';
  var pc=function(P){return '<button type="button" class="p74-pathc'+(cur===P.id?" on":"")+'" data-act="p74pick" data-val="'+P.id+'" style="--pc:'+P.color+'"><span class="p74-pfig">'+p74Hero(P,0,"p74-pimg")+'<i>›</i>'+p74Hero(P,8,"p74-pimg big")+'</span><span class="p74-ptx"><b>'+esc(P.name)+'</b><small>'+esc(P.goal)+'</small><span>'+esc(P.lead)+'</span></span></button>';};
  P74_PATHS.forEach(function(P){if(!P.hist)h+=pc(P);});
  h+='</div><div class="p74-sech"><b>物語と歴史の道（キルギス）</b><small>章をクリアするたびに次の場面が開き、解説と「〜で学ぶ例文」が読めます。全部クリアすると、その物語や人物の歴史がひととおりわかります。</small></div><div class="p74-paths">';
  P74_PATHS.forEach(function(P){if(P.hist)h+=pc(P);});
  h+='</div><button type="button" class="p74-plain" data-act="p74plain"><b>ストーリーなしで進める</b><small>物語や敵は出さず、今までの路線図（テーマの一覧）だけで進めます。</small></button>';
  return h;
}
function p74Main(){
  var P=p74Path(),S=p74State(),st=S.stage,h='';
  if(P74_VIEW==="read"&&P.story)return '<button type="button" class="p74-rtop" data-act="p74tab" data-val="map">‹ 冒険の画面にもどる</button>'+p74Reader(P,S);
  h+='<div class="p74-me" style="--pc:'+P.color+'"><div class="p74-mefig">'+p74Hero(P,st,"p74-big")+'</div><div class="p74-meinfo"><small>'+esc(P.name)+'</small><b>'+esc(P.titles[st])+'</b><span class="p74-lv">Lv '+S.lv+'</span>'+
     '<button type="button" class="p74-chg" data-act="p74choose">道を変える・最初から ›</button><div class="p74-stats"><span><b>'+S.gear+'</b>/17 装備</span><span><b>'+S.skills+'</b>/8 技</span><span><b>'+S.allies+'</b>/5 仲間</span></div>'+
     (st<8?'<small class="p74-next">次の姿「'+esc(P.titles[st+1])+'」まで：'+(P.ev?'「':'ボス「')+esc(p74BossName(P,S.ch.filter(function(c){return !c.beat;})[0]?S.ch.filter(function(c){return !c.beat;})[0].c:7))+(P.ev?'」をクリアする':'」を倒す')+'</small>':'<small class="p74-next">最終形に到達しました！</small>')+'</div></div>';
  if(P.story)h+=p74StoryHint(P,S,true);
  /* 仲間の列 */
  if(S.allies)h+='<div class="p74-party">'+P.al.slice(0,S.allies).map(function(a){return '<span>'+p74AllyArt(a,"p74-aimg")+'<small>'+esc(a.n)+'</small></span>';}).join("")+'</div>';
  /* 今たたかっている敵 */
  var c=S.cur;
  if(c){var li=p74Next(c.i);
    h+='<div class="p74-battle"><div class="p74-bfig">'+p74Hero(P,st,"p74-bimg")+'<span class="p74-vs">'+(P.ev?'›':'VS')+'</span>'+p74Svg(p74FoeArt(P,c.i),"p74-bimg p74-mon")+'</div>'+
       '<div class="p74-btx"><small>'+(P.ev?'第'+(p74ChOf(c.i)+1)+'章の出来事':'Lv '+(c.i+3))+' ・ テーマ「'+esc(c.cat)+'」</small><b>'+esc(p74FoeName(P,c.i))+'</b>'+p74Bar(c.ln-c.ld,c.ln,"red")+'<small>'+'完了 '+c.ld+' / '+c.ln+' レッスン'+(P.ev?'（レッスン1つで1歩前進）':'（レッスン1つで1ダメージ）')+'</small></div>'+
       '<button type="button" class="p74-go" data-act="p71go" data-val="'+c.i+'">'+(P.ev?'次のレッスンで進む':'次のレッスンでたたかう')+'</button></div>';}
  /* タブ */
  var v=P74_VIEW||"map";
  h+='<div class="p74-tabs">'+(P.hist?[["map","地図"],["story","物語"],["ex","例文"],["gear","装備"],["skill","技"],["ally","仲間"]]:P.story?[["map","地図"],["story","物語"],["gear","装備"],["skill","技"],["ally","仲間"]]:[["map","地図"],["gear","装備"],["skill","技"],["ally","仲間"]]).map(function(t){return '<button type="button" data-act="p74tab" data-val="'+t[0]+'" class="'+(v===t[0]||(v==="read"&&t[0]==="story")?"on":"")+'">'+t[1]+'</button>';}).join("")+'</div>';
  if(v==="map"){
    S.ch.forEach(function(ch){var B=P74_BOSS[ch.c],ct=P.story&&P.story[ch.c+1]?P.story[ch.c+1].t.replace(/^[^　]+　/,""):B.t+"の地",bn=p74BossName(P,ch.c);
      h+='<div class="p74-ch"><div class="p74-chh"><small>第'+(ch.c+1)+'章</small><b>'+esc(ct)+'</b></div>';
      ch.themes.forEach(function(x){var st2=x.done?"d":(S.cur&&x.i===S.cur.i?"c":"");
        h+='<button type="button" class="p74-row '+st2+'" data-act="p71go" data-val="'+x.i+'"'+(st2==="c"?' id="p70cur"':'')+'><span class="p74-rimg">'+p74Svg(p74FoeArt(P,x.i))+(x.done?'<i class="p74-ko">✓</i>':'')+'</span><span class="p74-rtx"><b>'+esc(p74FoeName(P,x.i))+'</b><small>'+esc(x.cat)+' ・ '+(x.done?P.verb:'完了 '+x.ld+' / '+x.ln)+'</small>'+(x.done?'':p74Bar(x.ln-x.ld,x.ln,"red sm"))+'</span></button>';});
      h+='<div class="p74-boss'+(ch.beat?" beat":"")+'"><span class="p74-bsimg">'+p74Svg(p74BossArt(P,ch.c))+(ch.beat?'<i class="p74-ko">✓</i>':'')+'</span><span class="p74-rtx"><small>'+(P.ev?'この章の大きな出来事':'ボス ・ Lv '+p74BossLv(ch.c))+'</small><b>'+esc(bn)+'</b>'+(P74_FOES[P.id]?'':'<small class="p74-ru">名前はロシア語の '+esc(B.ru)+'（'+esc(B.ja)+'）から</small>')+
        (ch.beat?'<small>'+P.verb+'！ 技「'+esc(P.sk[ch.c])+'」を覚えた</small>':p74Bar(ch.need-ch.done,ch.need,"red")+'<small>'+(P.ev?'この章のテーマを全部終えると、クリアできます':'この章の敵を全部倒すと、ボスも倒れます')+'（のこり '+(ch.need-ch.done)+'）</small>')+'</span></div></div>';});
  }else if(v==="read"&&P.story){h+=p74Reader(P,S);
  }else if(v==="story"&&P.story){h+=p74StoryTab(P,S);
  }else if(v==="ex"&&P.hist){h+=p74ExTab(P,S);
  }else if(v==="gear"){
    h+='<div class="p74-list">'+P.gear.map(function(g,i){var on=i<S.gear;var how=i===0?"はじめの持ち物":(i%2?"第"+((i+1)/2)+"章"+(P.ev?"の出来事を半分クリア":"の敵を半分倒す"):"第"+(i/2)+"章"+(P.ev?"をクリア":"のボスを倒す"));
      return '<div class="p74-li'+(on?"":" off")+'"><span class="p74-gi">'+(on?'★':'？')+'</span><span><b>'+(on?esc(g):'？？？')+'</b><small>'+how+'</small></span></div>';}).join("")+'</div>';
  }else if(v==="skill"){
    h+='<div class="p74-list">'+P.sk.map(function(k,i){var on=i<S.skills;return '<div class="p74-li'+(on?"":" off")+'"><span class="p74-gi">'+(on?'✦':'？')+'</span><span><b>'+(on?esc(k):'？？？')+'</b><small>'+(P.ev?'「':'ボス「')+esc(p74BossName(P,i))+(P.ev?'」をクリアすると覚える':'」を倒すと覚える')+'</small></span></div>';}).join("")+'</div>';
  }else{
    var need=[1,2,4,6,8];
    h+='<div class="p74-allies">'+P.al.map(function(a,i){var on=i<S.allies;return '<div class="p74-ac'+(on?"":" off")+'">'+p74AllyArt(a,"p74-aimg2")+'<b>'+(on?esc(a.n):'？？？')+'</b><small>'+(on?esc(a.r):(P.ev?need[i]+'つの章をクリアすると仲間に':'ボスを'+need[i]+'体倒すと仲間に'))+'</small></div>';}).join("")+'</div>';
  }
  h+='<div class="p74-foot"><button type="button" data-act="p74choose">道を選びなおす</button><button type="button" data-act="p74plain">ストーリーなしにする</button></div>';
  return h;
}
function p74Open(choose){
  if(!p74Story()){_p74Open();var m0=document.getElementById("p70page");
    if(m0){var b=m0.querySelector(".p70-pbody");if(b)b.insertAdjacentHTML("afterbegin",'<button type="button" class="p74-plain p74-toq" data-act="p74story"><b>'+P74_NAME+'モードにする</b><small>レッスンで敵を倒し、装備・技・仲間を集めながら進みます。</small></button>');}return;}
  var P0=p74Path();if(P0&&((!P0.hist&&P74_VIEW==="ex")||(!P0.story&&(P74_VIEW==="story"||P74_VIEW==="read"))))P74_VIEW="map";
  var m=p74Page(choose||!P0?p74Chooser():p74Main());try{p72Wrap(m);}catch(_){}
  setTimeout(function(){var nw=document.getElementById("p74newest");if(nw&&P74_VIEW==="story"&&!choose){var sc=nw.closest(".p70-pbody");if(sc)sc.scrollTop=Math.max(0,nw.getBoundingClientRect().top-sc.getBoundingClientRect().top+sc.scrollTop-8);return;}var c=document.getElementById("p70cur");if(c&&c.scrollIntoView&&(P74_VIEW||"map")==="map"&&!choose)c.scrollIntoView({block:"center"});},60);
}
p70OpenRoad=function(){p74Open(false);};
/* ---------- レッスン結果に戦いの様子を出す ---------- */
var P74_SNAP=null;
var _p74Start=p71Start;
p71Start=function(ti,li){try{P74_SNAP=p74State();}catch(_){P74_SNAP=null;}
  if(p74Story()&&p74Path()&&p74Own()&&ti!=null&&ti>=0&&(li==null||li<0)){var n=p74Next(ti);if(n>=0)return _p74Start.call(this,ti,n);}
  return _p74Start.apply(this,arguments);};
var _p74Finish=p71Finish;
p71Finish=function(){var S=P71,was=S&&S.fin,o=_p74Finish.apply(this,arguments);
  try{var ow=p74Own();if(S&&!was&&!S.fav&&p74Story()&&p74Path()&&ow){ow[p71Key(S.ti,S.li)]=todayKey();saveAll();}}catch(_){}return o;};
var _p74Result=p71Result;
p71Result=function(){
  var h=String(_p74Result.apply(this,arguments)),P=p74Path();
  if(!p74Story()||!P||!P71||P71.fav)return h;
  var A=P74_SNAP,B=p74State(),ti=P71.ti,x=B.list[ti];if(!x)return h;
  var dead=x.done,sk=B.skills?P.sk[(P71.li+ti)%B.skills]:null;
  var g='<div class="p74-res" style="--pc:'+P.color+'"><div class="p74-bfig">'+p74Hero(P,B.stage,"p74-bimg")+'<span class="p74-hit">'+(dead?(P.ev?"クリア!":"KO!"):(P.ev?"+1":"−1"))+'</span>'+p74Svg(p74FoeArt(P,ti),"p74-bimg p74-mon"+(dead&&!P.ev?" ko":""))+'</div>';
  var fn=p74FoeName(P,ti);g+='<p>'+(P.ev?'「'+esc(fn)+'」へ 1歩前進。'+(dead?'<b>「'+esc(fn)+'」をクリア！</b>':'完了 '+x.ld+' / '+x.ln+' レッスン'):(sk?'技「'+esc(sk)+'」！ ':'')+esc(fn)+'に 1 ダメージ。'+(dead?'<b>'+esc(fn)+'を'+P.verb+'！</b>':'完了 '+x.ld+' / '+x.ln+' レッスン'))+'</p>'+(dead?'':p74Bar(x.ln-x.ld,x.ln,"red"));
  var news=[];
  if(A){
    for(var i=A.gear;i<B.gear;i++)news.push('<li><span>装備</span>'+esc(P.gear[i])+'</li>');
    for(var j=A.skills;j<B.skills;j++)news.push('<li><span>技</span>'+esc(P.sk[j])+'</li>');
    for(var k=A.allies;k<B.allies;k++)news.push('<li><span>仲間</span>'+esc(P.al[k].n)+'（'+esc(P.al[k].r)+'）が仲間になった！</li>');
    for(var b=0;b<B.ch.length;b++)if(B.ch[b].beat&&!(A.ch[b]&&A.ch[b].beat))g+='<div class="p74-bossko">'+p74Svg(p74BossArt(P,b),"p74-bimg"+(P.ev?"":" ko"))+'<b>'+(P.ev?'「'+esc(p74BossName(P,b))+'」をクリア！':'ボス「'+esc(p74BossName(P,b))+'」を'+P.verb+'！')+'</b></div>';
    if(B.stage>A.stage)g+='<div class="p74-up">'+p74Hero(P,B.stage,"p74-big")+'<b>「'+esc(P.titles[B.stage])+'」になった！</b></div>';
  }
  if(P.story){if(A&&B.stage>A.stage)g+='<div class="p74-newsc"><small>'+(P.hist?'新しい場面が開いた！':'新しい話が開いた！')+'</small>'+p74SceneHtml(P,B.stage,true)+'<button type="button" class="p74-go" data-act="p74read" data-val="'+B.stage+'">'+esc(p74Short(P))+'の物語をひらく</button></div>';else g+=p74StoryHint(P,B,false);}
  if(news.length)g+='<div class="p74-news"><small>手に入れたもの</small><ul>'+news.join("")+'</ul></div>';
  g+='</div>';
  h=h.replace(/<div class="p71-dart">[\s\S]*?<\/svg><\/div>/,'');
  return h.replace('<div class="p71-body">','<div class="p71-body">'+g);
};
/* ---------- 「道のり」という呼び名を冒険モードでは置きかえる ---------- */
function p74Relabel(root){
  if(!p74Story()||!root||!document.createTreeWalker)return;
  var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),n,L=[];while((n=tw.nextNode()))if(n.nodeValue.indexOf("道のり")>=0)L.push(n);
  L.forEach(function(n){n.nodeValue=n.nodeValue.replace(/道のり/g,P74_NAME);});
}
(function(){
  var _r=render;render=function(){var o=_r.apply(this,arguments);try{p74Relabel(document.getElementById("app")||document.body);}catch(_){}return o;};
  var _pr=p71Render;p71Render=function(){var o=_pr.apply(this,arguments);try{p74Relabel(document.getElementById("p71"));}catch(_){}return o;};
})();
/* ---------- 物語・歴史の道（hist:1 の道だけ）：場面・解説・例文 ---------- */
function p74Short(P){return String(P.name).replace(/の道$/,"");}
function p74Paras(t){return String(t).split("\n").map(function(p){return '<p>'+esc(p)+'</p>';}).join("");}
function p74Fig(P,f,i){var m=/^(.+?)@(-?\d+)$/.exec(f),k=m?m[1]:f,x=m?+m[2]:90,svg="";
  if(k==="h")svg=p74Person(P.st[Math.min(8,i)]);
  else if(/^a\d$/.test(k)){var a=P.al[+k.slice(1)];if(a)svg=a.animal?p74Animal(a.animal,a.c):p74Person(a.o);}
  else if(/^npc:/.test(k)&&P74_NPC[k.slice(4)])svg=p74Person(P74_NPC[k.slice(4)]);
  else svg=p74Art(k);
  return {x:x,y:38,s:.62,svg:svg};}
function p74ExHtml(ex,lab){return '<div class="p71-ex p74-ex">'+(lab?'<small class="p74-exl">'+esc(lab)+'</small>':'')+'<div><span class="p74-exru">'+esc(ex[0])+'</span>'+p71Spk(ex[0],"p74-exspk")+'</div><small>'+esc(ex[1])+'</small></div>';}
function p74SceneHtml(P,i,noTitle){var s=P.story[i];if(!s)return "";
  return '<div class="p74-sc"><div class="p74-scimg">'+p74Scene(s.fig.map(function(f){return p74Fig(P,f,i);}),{night:s.night,fire:s.fire,yurt:P.hist?undefined:false,sea:P.id==="sea"})+'</div>'+(noTitle?'<b class="p74-sct">'+esc(s.t)+'</b>':'')+
    '<div class="p74-scx">'+p74Paras(s.x)+'</div>'+(s.ex?p74ExHtml(s.ex,p74Short(P)+"で学ぶ例文"):'')+(s.nx?'<p class="p74-nx"><b>次回予告</b>'+esc(s.nx)+'</p>':'')+'</div>';}
/* 次の場面まであと何テーマか */
function p74StoryHint(P,S,btn){var st=S.stage;
  if(st>=8)return '<div class="p74-hint"><span><small>'+esc(p74Short(P))+'の物語</small><b>すべての'+(P.hist?'場面':'話')+'を読めます</b></span>'+(btn?'<button type="button" data-act="p74ri" data-val="0">読む</button>':'')+'</div>';
  var ch=S.ch.filter(function(c){return !c.beat;})[0],left=ch?ch.need-ch.done:0;
  return '<div class="p74-hint"><span><small>次の'+(P.hist?'場面':'話')+'「'+esc(P.story[st+1].t)+'」まで</small><b>あと '+left+' テーマ（'+(P.ev?'':'ボス')+'「'+esc(p74BossName(P,ch?ch.c:7))+'」）</b></span>'+(btn?'<button type="button" data-act="p74ri" data-val="'+st+'">'+(st?'ここまでを読む':'序章を読む')+'</button>':'')+'</div>';}
function p74StoryTab(P,S){var st=Math.min(8,S.stage),h='<p class="p70-lead">'+(P.hist?'章をクリアするたびに、次の場面が開きます。場面ごとに解説と例文があります。':'ボスを倒すたびに、次の話が開きます。')+'読みたい話を押すと、前後に行き来しながら読めます。</p>';
  h+='<button type="button" class="p74-go p74-readall" data-act="p74ri" data-val="0">はじめから読む（いま '+(st+1)+' 話まで読めます）</button><div class="p74-toc">';
  P.story.forEach(function(s,i){
    if(i<=st)h+='<button type="button" class="p74-tocr" data-act="p74ri" data-val="'+i+'"><span class="p74-tocn">'+(i===0?'序':i)+'</span><span><b>'+esc(s.t.replace(/^[^　]+　/,""))+'</b><small>'+(i===st?'いちばん新しい話':'読める')+'</small></span><i>›</i></button>';
    else h+='<div class="p74-tocr off"><span class="p74-tocn">'+i+'</span><span><b>'+esc(s.t.replace(/^[^　]+　/,""))+'</b><small>'+(P.ev?'「':'ボス「')+esc(p74BossName(P,i-1))+(P.ev?'」をクリアすると開きます':'」を倒すと開きます')+'</small></span></div>';});
  if(P.about)h+=S.stage>=8?'<button type="button" class="p74-tocr" data-act="p74ri" data-val="9"><span class="p74-tocn">★</span><span><b>'+esc(P.about.t)+'</b><small>まとめ</small></span><i>›</i></button>':'<div class="p74-tocr off"><span class="p74-tocn">★</span><span><b>'+esc(P.about.t)+'</b><small>すべての章をクリアすると読めます</small></span></div>';
  return h+'</div>';}
/* 1話ずつ読む画面（前後に行き来できる） */
var P74_RI=0;
function p74Top(){setTimeout(function(){var m=document.getElementById("p70page");if(m)m.scrollTop=0;},80);}
function p74Reader(P,S){var st=Math.min(8,S.stage),last=st+(S.stage>=8&&P.about?1:0),i=Math.max(0,Math.min(last,P74_RI|0)),h='';
  var nav=function(pos){return '<div class="p74-rnav '+pos+'"><button type="button" data-act="p74ri" data-val="'+(i-1)+'"'+(i>0?'':' disabled')+'>‹ 前の話</button><span>'+(i>8?'まとめ':(i===0?'序章':'第'+i+'話'))+' ・ '+(i+1)+' / '+(last+1)+'</span><button type="button" data-act="p74ri" data-val="'+(i+1)+'"'+(i<last?'':' disabled')+'>次の話 ›</button></div>';};
  h+=nav("top");
  if(i>8)h+='<div class="p74-about"><b>'+esc(P.about.t)+'</b>'+p74Paras(P.about.x)+'</div>';
  else h+='<div class="p74-rd"><b class="p74-sct">'+esc(P.story[i].t)+'</b>'+p74SceneHtml(P,i,false)+'</div>';
  if(i===last&&i<8){var ch=S.ch.filter(function(c){return !c.beat;})[0],left=ch?ch.need-ch.done:0;h+='<p class="p74-rmore">ここまでが、いま読める話です。次の'+(P.hist?'場面':'話')+'は、あと '+left+' テーマで開きます。</p>';}
  h+=nav("bot")+'<button type="button" class="p74-rback" data-act="p74tab" data-val="story">話の一覧へ</button>';
  return h;}
function p74ExTab(P,S){var st=Math.min(8,S.stage),h='<p class="p70-lead">'+esc(p74Short(P))+'で学ぶ例文です。スピーカーで読み上げ、単語をタップすると意味と形（格など）が出ます。場面が開くたびに増えます。</p>';
  P.story.forEach(function(s,i){if(i<=st&&s.ex)h+=p74ExHtml(s.ex,s.t);});
  if(st<8)h+='<p class="p74-exmore">のこり '+(8-st)+' 文は、次の場面が開くと読めます。</p>';
  return h;}
/* ---------- 道を選んだとき：「続きから」か「最初から」か ---------- */
function p74Dlg(pid,confirm){
  var P=P74_PATHS.filter(function(x){return x.id===pid;})[0];if(!P)return;
  var S=p74State(pid),own=p74Own(pid),h;
  var now='Lv '+S.lv+' ・ '+(P.ev?'章 '+S.boss+' / 8':'ボス '+S.boss+' / 8 体')+' ・ 「'+esc(P.titles[S.stage])+'」';
  if(!confirm){
    h='<b class="p74-dt">'+esc(P.name)+'</b><p>どちらから始めますか？</p>'+
      '<button type="button" class="p74-dbtn main" data-act="p74cont" data-pid="'+pid+'"><b>続きから</b><small>'+(own?'この道の冒険の続き：':'これまでのレッスンの進み具合を引きつぎます：')+now+'</small></button>'+
      '<button type="button" class="p74-dbtn" data-act="'+(S.lessons?"p74fresh":"p74fresh2")+'" data-pid="'+pid+'"><b>最初から</b><small>この道の冒険を Lv 1 から始めます。単語の学習記録やお気に入りは消えません。</small></button>';
  }else if(confirm!==2){
    h='<b class="p74-dt">本当に最初からにしますか？（確認 1 / 2）</b><p>「'+esc(P.name)+'」の冒険の進み具合（'+now+'）が 0 に戻ります。<br>単語の学習記録、覚えた単語、お気に入りはそのまま残ります。</p>'+
      '<button type="button" class="p74-dbtn warn" data-act="p74freshB" data-pid="'+pid+'"><b>最初から始める</b></button>'+
      '<button type="button" class="p74-dbtn" data-act="p74cont" data-pid="'+pid+'"><b>やめて、続きから進める</b></button>';
  }else{
    h='<b class="p74-dt">最後の確認です（確認 2 / 2）</b><p>「'+esc(P.name)+'」の冒険を、本当に最初に戻しますか？<br>戻すと、いまの進み具合（'+now+'）には戻せません。</p>'+
      '<button type="button" class="p74-dbtn warn" data-act="p74fresh2" data-pid="'+pid+'"><b>はい、最初に戻す</b></button>'+
      '<button type="button" class="p74-dbtn" data-act="p74cont" data-pid="'+pid+'"><b>やめて、続きから進める</b></button>';
  }
  h+='<button type="button" class="p74-dbtn x" data-act="p74dlgx">キャンセル</button>';
  var d=document.getElementById("p74dlg");if(!d){d=document.createElement("div");d.id="p74dlg";document.body.appendChild(d);}
  d.innerHTML='<div class="p74-dbox" role="dialog" aria-modal="true">'+h+'</div>';
}
/* ---------- 操作 ---------- */
window.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(!/^p74/.test(a))return;e.stopImmediatePropagation();e.preventDefault();var s=p74S();
  if(a==="p74pick"){p74Dlg(v,false);}
  else if(a==="p74plain"){s.mode="plain";try{saveAll();}catch(_){}p74Open(false);try{render();}catch(_){}toast("ストーリーなしにしました");}
  else if(a==="p74story"){s.mode="story";try{saveAll();}catch(_){}p74Open(!s.path);try{render();}catch(_){}}
  else if(a==="p74choose"){p74Open(true);}
  else if(a==="p74dlgx"){var d=document.getElementById("p74dlg");if(d)d.remove();}
  else if(a==="p74freshB"){p74Dlg(el.getAttribute("data-pid"),2);}
  else if(a==="p74cont"||a==="p74fresh"||a==="p74fresh2"){var pid=el.getAttribute("data-pid");
    if(a==="p74fresh"){p74Dlg(pid,1);return;}
    var was=s.path;s.mode="story";s.path=pid;if(!s.own||typeof s.own!=="object")s.own={};if(a==="p74fresh2"){var lk=(+s.lvl||1)>1?pid+"@"+(+s.lvl):pid;s.own[lk]={};try{var rr=JSON.parse(localStorage.getItem(K.set+"_p71run")||"null");if(rr&&rr.ctx&&rr.ctx.indexOf(pid+"@")===0)localStorage.removeItem(K.set+"_p71run");}catch(_){}}
    try{saveAll();}catch(_){}var d2=document.getElementById("p74dlg");if(d2)d2.remove();P74_VIEW="map";p74Open(false);try{render();}catch(_){}
    var P2=p74Path();toast(a==="p74fresh2"?"「"+P2.name+"」を最初から始めます":(was&&was!==pid?"「"+P2.name+"」に変えました（続きから）":"「"+P2.name+"」を続きから進めます"));}
  else if(a==="p74read"){P74_VIEW="read";P74_RI=+(v||0);try{if(P71)p71Close();}catch(_){}p74Open(false);p74Top();}
  else if(a==="p74ri"){P74_VIEW="read";P74_RI=+v;p74Open(false);p74Top();}
  else if(a==="p74tab"){P74_VIEW=v;var m=document.getElementById("p70page"),sc=m&&m.querySelector(".p70-pbody"),y=sc?sc.scrollTop:0;p74Open(false);var sc2=document.querySelector("#p70page .p70-pbody");if(sc2)sc2.scrollTop=y;}
},true);
/* ---------- 見た目（色はテーマ変数を使い、ダーク・ライトどちらでも読める） ---------- */
(function(){var css=
'.p74-rtop{border:0;background:none;color:var(--accent);font:inherit;font-weight:800;padding:4px 0 8px;cursor:pointer}'+
'.p74-readall{margin:4px 0 10px}.p74-toc{display:flex;flex-direction:column;gap:8px}.p74-tocr{display:flex;align-items:center;gap:10px;width:100%;text-align:left;padding:10px 12px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer;box-sizing:border-box}.p74-tocr span:nth-child(2){flex:1;min-width:0}.p74-tocr b{display:block;font-size:15px}.p74-tocr small{display:block;color:var(--muted);font-size:12.5px}.p74-tocr i{font-style:normal;color:var(--muted);font-size:20px}.p74-tocr.off{opacity:.6;border-style:dashed;cursor:default}'+
'.p74-tocn{flex:none;width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px}.p74-tocr.off .p74-tocn{background:var(--line);color:var(--muted)}'+
'.p74-rnav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:6px 0 10px}.p74-rnav span{font-size:13px;color:var(--muted);font-weight:700;text-align:center}.p74-rnav button{flex:none;min-height:40px;padding:0 14px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--accent);font:inherit;font-weight:800;cursor:pointer}.p74-rnav button:disabled{opacity:.35;cursor:default}.p74-rnav.bot{margin-top:14px}'+
'.p74-rd .p74-sct{font-size:18px;margin:0 0 8px}.p74-rmore{font-size:13.5px;color:var(--muted);line-height:1.7;margin:10px 0 0}.p74-rback{display:block;width:100%;margin-top:8px;min-height:42px;border-radius:12px;border:0;background:none;color:var(--muted);font:inherit;font-weight:700;cursor:pointer}'+

'.p74-nx{margin:10px 0 4px;padding:10px 12px;border-radius:12px;background:var(--card2,rgba(127,127,127,.1));font-size:14px;line-height:1.7}.p74-nx b{display:inline-block;margin-right:8px;padding:1px 8px;border-radius:999px;background:var(--accent);color:#fff;font-size:12px}'+

'#p74dlg{position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center;padding:16px;box-sizing:border-box}.p74-dbox{width:100%;max-width:420px;background:var(--card);color:var(--ink);border-radius:18px;padding:16px;box-sizing:border-box;margin-bottom:max(8px,env(safe-area-inset-bottom))}.p74-dt{display:block;font-size:17px}.p74-dbox p{font-size:14px;line-height:1.7;margin:6px 0 10px;color:var(--ink)}'+
'.p74-dbtn{display:block;width:100%;text-align:left;margin-top:8px;padding:12px 14px;border-radius:14px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;cursor:pointer}.p74-dbtn b{display:block;font-size:15px}.p74-dbtn small{display:block;font-size:12.5px;color:var(--muted);line-height:1.6;margin-top:2px}.p74-dbtn.main{border:2px solid var(--accent)}.p74-dbtn.warn{background:#C0392B;border-color:#C0392B;color:#fff}.p74-dbtn.x{text-align:center;border:0;color:var(--muted)}'+
'.p74-chg{display:inline-block;margin:6px 0 2px;padding:5px 10px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--accent);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}.p74-curp{font-size:13.5px;color:var(--muted);margin:0 0 8px}'+

'.p74-sech{margin:16px 2px 8px}.p74-sech b{display:block;font-size:16px}.p74-sech small{display:block;color:var(--muted);font-size:13px;line-height:1.6;margin-top:2px}'+
'.p74-hint{display:flex;align-items:center;gap:10px;justify-content:space-between;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:10px 12px;margin:10px 0}.p74-hint span{min-width:0}.p74-hint small{display:block;color:var(--muted);font-size:12.5px}.p74-hint b{display:block;font-size:14.5px}.p74-hint button{flex:none;border:0;border-radius:999px;padding:8px 14px;background:var(--pc,var(--accent));color:#fff;font:inherit;font-weight:700}'+
'.p74-sc{margin:8px 0 4px}.p74-scimg{border-radius:14px;overflow:hidden;line-height:0}.p74-scene{width:100%;height:auto;display:block}.p74-sct{display:block;font-size:16px;margin:10px 0 2px}'+
'.p74-scx{font-size:14.5px;line-height:1.8;margin:8px 0}.p74-scx p{margin:0 0 8px}.p74-ex{margin:8px 0;box-sizing:border-box}.p74-ex .p74-exl{color:var(--accent);font-weight:800;font-size:12px;margin-bottom:2px}.p74-exru{font-size:17px;font-weight:600;line-height:1.7}.p74-ex .p71-spk{position:static}'+
'.p74-scd{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:4px 12px;margin:8px 0}.p74-scd summary{cursor:pointer;padding:8px 0;font-size:15px}.p74-sclock{border:1px dashed var(--line);border-radius:14px;padding:10px 12px;margin:8px 0;opacity:.75}.p74-sclock b{display:block;font-size:14.5px}.p74-sclock small{color:var(--muted);font-size:12.5px}'+
'.p74-about{border:2px solid var(--accent);border-radius:14px;padding:10px 12px;margin:12px 0;font-size:14.5px;line-height:1.8}.p74-about b{display:block;font-size:16px;margin-bottom:6px}.p74-about p{margin:0 0 6px}.p74-newsc{margin-top:12px;text-align:left}.p74-newsc>small{display:block;font-weight:800;color:var(--accent)}.p74-exmore{color:var(--muted);font-size:13px}'+

'.p74-card{display:flex;align-items:center;gap:12px;width:100%;padding:12px 12px 12px 10px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer;margin-bottom:10px}'+
'.p74-cart{flex:none;width:96px;height:74px;border-radius:14px;background:linear-gradient(180deg,#BFE3F2,#E7F3D8 70%,#B9D99A);display:flex;align-items:flex-end;justify-content:center;overflow:hidden;position:relative}'+
'.p74-cimg{width:50px;height:68px}.p74-duel .p74-cimg{width:46px;height:62px}.p74-duel .p74-cmon{margin-left:-4px}'+
'.p74-ctxt{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.p74-ctxt small{font-size:11.5px;color:var(--muted)}.p74-ctxt b{font-size:15.5px;line-height:1.35}.p74-ctxt em{font-style:normal;font-size:12px;color:var(--muted)}'+
'.p74-hp{display:block;height:7px;border-radius:4px;background:var(--line);overflow:hidden;margin-top:3px}.p74-hp i{display:block;height:100%;background:#3FA46A;border-radius:4px}.p74-hp.red i{background:#E2483B}.p74-hp.ev i{background:var(--accent)}.p74-hp.sm{height:5px}'+
'.p74-page{padding-bottom:40px}'+
'.p74-paths{display:flex;flex-direction:column;gap:10px}.p74-pathc{display:flex;gap:10px;align-items:center;padding:10px;border-radius:16px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer}.p74-pathc.on{border-color:var(--pc);box-shadow:inset 0 0 0 1px var(--pc)}'+
'.p74-pfig{flex:none;display:flex;align-items:center;background:linear-gradient(180deg,#DDEFF7,#F3EEDD);border-radius:12px;padding:2px 4px}.p74-pfig i{font-style:normal;color:#7A6A55;font-weight:800;margin:0 -2px}.p74-pimg{width:44px;height:60px}.p74-pimg.big{width:58px;height:78px}'+
'.p74-ptx{display:flex;flex-direction:column;gap:2px;min-width:0}.p74-ptx b{font-size:16px;color:var(--pc)}html.p72-dark .p74-ptx b{filter:brightness(1.6)}.p74-ptx small{font-size:12px;font-weight:700}.p74-ptx span{font-size:12.5px;color:var(--muted);line-height:1.5}'+
'.p74-plain{display:flex;flex-direction:column;gap:2px;width:100%;margin-top:12px;padding:12px;border-radius:14px;border:1px dashed var(--line);background:none;color:var(--ink);font:inherit;text-align:left;cursor:pointer}.p74-plain small{color:var(--muted);font-size:12px}.p74-toq{margin:0 0 12px;border-style:solid}'+
'.p74-me{display:flex;gap:12px;align-items:center;padding:12px;border-radius:18px;background:var(--card);border:1px solid var(--line)}.p74-mefig{flex:none;width:112px;height:140px;border-radius:14px;background:linear-gradient(180deg,#BFE3F2,#E7F3D8 70%,#B9D99A);display:flex;align-items:flex-end;justify-content:center}.p74-big{width:104px;height:138px}'+
'.p74-meinfo{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}.p74-meinfo>small{font-size:12px;color:var(--muted)}.p74-meinfo>b{font-size:20px}.p74-lv{font-weight:800;font-size:13px}.p74-stats{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}.p74-stats span{font-size:11.5px;padding:3px 8px;border-radius:999px;border:1px solid var(--line)}.p74-stats b{font-size:13px}.p74-next{font-size:11.5px!important;line-height:1.5;margin-top:4px}'+
'.p74-party{display:flex;gap:6px;margin:10px 0 0;overflow-x:auto}.p74-party span{flex:none;display:flex;flex-direction:column;align-items:center;width:58px}.p74-aimg{width:52px;height:66px}.p74-party small{font-size:10px;line-height:1.25;color:var(--muted);text-align:center;white-space:normal;overflow-wrap:anywhere;max-width:58px}'+
'.p74-battle,.p74-res{margin-top:12px;padding:12px;border-radius:18px;border:1px solid var(--line);background:var(--card)}.p74-bfig{display:flex;align-items:flex-end;justify-content:center;gap:4px;height:120px;border-radius:14px;background:linear-gradient(180deg,#2E3A5C,#55708F 60%,#6E8F5A 61%,#58764A);position:relative}'+
'.p74-bimg{width:84px;height:112px}.p74-mon{transform:scaleX(-1)}.p74-vs{font-weight:900;color:#FFD34D;font-size:18px;align-self:center;text-shadow:0 2px 0 #2B2233}'+
'.p74-btx{display:flex;flex-direction:column;gap:2px;margin-top:8px}.p74-btx small{font-size:12px;color:var(--muted)}.p74-btx b{font-size:16px}'+
'.p74-go{width:100%;margin-top:10px;min-height:48px;border-radius:14px;border:none;background:var(--accent);color:#fff;font:inherit;font-weight:800;font-size:15px;cursor:pointer}'+
'.p74-tabs{display:flex;gap:6px;margin:14px 0 10px}.p74-tabs button{flex:1;min-width:0;padding:0 2px;min-height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-weight:700;cursor:pointer}.p74-tabs button.on{background:var(--accent);color:#fff;border-color:var(--accent)}'+
'.p74-ch{margin-bottom:14px}.p74-chh{display:flex;align-items:baseline;gap:8px;margin:6px 2px 6px}.p74-chh small{font-size:12px;color:var(--muted);font-weight:700}.p74-chh b{font-size:15px}'+
'.p74-row,.p74-boss{display:flex;gap:10px;align-items:center;width:100%;padding:6px 10px;margin-bottom:6px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;text-align:left;cursor:pointer}.p74-row.c{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}.p74-row.d{opacity:.7}'+
'.p74-rimg,.p74-bsimg{flex:none;position:relative;width:44px;height:58px}.p74-rimg svg,.p74-bsimg svg{width:100%;height:100%}.p74-bsimg{width:66px;height:86px}.p74-ko{position:absolute;right:-4px;bottom:2px;width:20px;height:20px;border-radius:50%;background:#3FA46A;color:#fff;font-style:normal;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center}'+
'.p74-rtx{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p74-rtx b{font-size:14.5px}.p74-rtx small{font-size:11.5px;color:var(--muted)}.p74-ru{font-style:italic}'+
'.p74-boss{cursor:default;border-width:2px;border-color:#B48C3A;background:linear-gradient(90deg,rgba(180,140,58,.14),transparent)}.p74-boss.beat{opacity:.8}'+
'.p74-list{display:flex;flex-direction:column;gap:6px}.p74-li{display:flex;gap:10px;align-items:center;padding:8px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card)}.p74-li b{display:block;font-size:14.5px}.p74-li small{font-size:11.5px;color:var(--muted)}.p74-li.off b{color:var(--muted)}.p74-gi{flex:none;width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(232,185,35,.2);color:#B7791F;font-weight:800}.p74-li.off .p74-gi{background:var(--line);color:var(--muted)}'+
'.p74-allies{display:grid;grid-template-columns:repeat(auto-fill,minmax(100px,1fr));gap:8px}.p74-ac{display:flex;flex-direction:column;align-items:center;padding:8px 4px;border-radius:14px;border:1px solid var(--line);background:var(--card);text-align:center}.p74-aimg2{width:76px;height:100px}.p74-ac b{font-size:13.5px}.p74-ac small{font-size:11px;color:var(--muted);line-height:1.4}.p74-ac.off svg{filter:brightness(0) opacity(.25)}'+
'.p74-foot{display:flex;gap:8px;margin-top:16px}.p74-foot button{flex:1;min-height:42px;border-radius:12px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:13px;cursor:pointer}'+
'.p74-res p{margin:10px 0 4px;font-size:14.5px;line-height:1.6}.p74-hit{position:absolute;left:50%;top:14px;transform:translateX(-50%);font-weight:900;font-size:22px;color:#FFD34D;text-shadow:0 2px 0 #7A1F2B;animation:p74pop .6s ease-out}.p74-mon.ko{opacity:.45;transform:scaleX(-1) rotate(-12deg) translateY(10px)}'+
'@keyframes p74pop{0%{transform:translateX(-50%) scale(.3);opacity:0}60%{transform:translateX(-50%) scale(1.25);opacity:1}100%{transform:translateX(-50%) scale(1)}}'+
'.p74-bossko,.p74-up{display:flex;align-items:center;gap:10px;margin-top:10px;padding:8px 10px;border-radius:14px;background:rgba(232,185,35,.15);border:1px solid rgba(232,185,35,.5)}.p74-bossko .p74-bimg{width:60px;height:80px;opacity:.6}.p74-up .p74-big{width:70px;height:94px}.p74-bossko b,.p74-up b{font-size:15px}'+
'.p74-news{margin-top:10px}.p74-news small{font-size:12px;color:var(--muted);font-weight:700}.p74-news ul{list-style:none;margin:4px 0 0;padding:0;display:flex;flex-direction:column;gap:4px}.p74-news li{font-size:14px;font-weight:700}.p74-news li span{display:inline-block;font-size:11px;font-weight:700;padding:1px 7px;margin-right:6px;border-radius:999px;background:var(--accent);color:#fff}';
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);})();
/* ---------- 冒険モードのレッスン：よく出る言葉の絵を、その道の時代の絵（昔の衣装・ユルトなど）に差しかえる ----------
   絵は1つだけ。差しかえ用の絵がない言葉は、元の絵のまま。 */
(function(){
  var _f=p66Fill;p66Fill=function(d,pic){try{
    var m=/^art:(\w+)$/.exec(String(pic||""));
    if(m&&d&&d.closest&&d.closest("#p71")&&p74Story()){var P=p74Path(),sv=P&&p74EraArt(m[1],P);
      if(sv){d.textContent="";d.innerHTML=sv;d.classList.add("p66-img","p67-art");return;}}
  }catch(_){}return _f.apply(this,arguments);};
})();
