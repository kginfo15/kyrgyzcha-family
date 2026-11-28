/* ===== Phase85：育てるモード（学習の進み具合に合わせて仲間が成長する） =====
   ・設定でオン／オフを切りかえる（settings.pGr.on）。オフのときは、これまでの画面とまったく同じ。
   ・成長ポイントは、いまある学習記録から計算するだけ（新しい学習記録は作らない）：
       解いた問題 1問 = 1点（appHist.days の studiedWords + composeCount ＋ 文法書の練習・到達テスト・検定対策。下の pGrXSync）
       文法書の章を読む 1章 = 5点
       覚えた単語 1語 = 3点（p47Known）
       学習した日 1日 = 10点
   ・仲間は10種類（phase85_grow_kinds.js の PGR_KINDS）。一度に育てるのは1人。
     仲間ごとの記録 settings.pGr.own[id] = {acc:ためたポイント, since:育て始めたときの合計, seen:見せた段階, br:選んだ道}
     育てていない仲間は、育ったところで止まって待っている（切りかえても消えない）。
   ・10段階。各段階の中に5つの小さな段階があり、上がるたびに光の星が増える。段階5で「進化の道」を2つから選ぶ。
   ・進化したときは全画面の演出（暗転 → 光 → 白いフラッシュ → 新しい姿と称号）。
     出すのは「この起動中に勉強してポイントが増え、新しい段階に入ったあと、ホームが見えているとき」だけ。
     まだ見せていない進化は settings.pGr.pend に入れておき、ほかの画面が開いていないときに出す。 */

/* ---------- 記録 ---------- */
var PGR_T=[0,30,150,400,800,1400,2300,3500,5200,7500];/* 1日20問ほどで、1日目・3日目・9日目・18日目・1か月…5か月半で最後の姿 */
function pGrSt(){
  if(!settings.pGr||typeof settings.pGr!=="object"||Array.isArray(settings.pGr))settings.pGr={};
  var s=settings.pGr;if(!s.k||!PGR_KINDS[s.k])s.k=PGR_KINDS.manas?"manas":PGR_ORDER[0];
  if(!s.own||typeof s.own!=="object"||Array.isArray(s.own)){s.own={};}
  /* 前の形（マナスだけ）からの引っこし：これまでの学習は全部マナスのもの */
  if(!s.own.manas&&PGR_KINDS.manas)s.own.manas={acc:0,since:0,seen:(s.seen!=null&&isFinite(+s.seen))?+s.seen:null};
  delete s.seen;
  Object.keys(s.own).forEach(function(k){var o=s.own[k];
    if(!PGR_KINDS[k]||!o||typeof o!=="object"){delete s.own[k];return;}
    o.acc=isFinite(+o.acc)?Math.max(0,+o.acc):0;
    if(o.since!=null&&!isFinite(+o.since))o.since=null;else if(o.since!=null)o.since=+o.since;
    if(o.seen!=null&&!isFinite(+o.seen))o.seen=null;else if(o.seen!=null)o.seen=+o.seen;
    if(o.br!=="a"&&o.br!=="b")delete o.br;});
  if(!s.own[s.k])s.own[s.k]={acc:0,since:null,seen:null};
  if(!s.xm||typeof s.xm!=="object"||Array.isArray(s.xm))s.xm={};
  Object.keys(s.xm).forEach(function(mo){var X=s.xm[mo];if(!/^\d{4}-\d{2}$/.test(mo)||!X||typeof X!=="object"||Array.isArray(X)){delete s.xm[mo];return;}
    Object.keys(X).forEach(function(dd){if(!/^\d{2}$/.test(dd)||!isFinite(+X[dd])||+X[dd]<0)delete X[dd];else X[dd]=Math.min(5000,Math.floor(+X[dd]));});});
  if(!s.rc||typeof s.rc!=="object"||Array.isArray(s.rc))s.rc={};
  Object.keys(s.rc).forEach(function(id){if(typeof s.rc[id]!=="string")delete s.rc[id];});
  if(s.base&&(typeof s.base!=="object"||typeof s.base.d!=="string"||!isFinite(+s.base.p)))delete s.base;
  if(s.pend&&(typeof s.pend!=="object"||!PGR_KINDS[s.pend.k]||!isFinite(+s.pend.from)||!isFinite(+s.pend.to)))delete s.pend;
  return s;
}
function pGrOn(){return !!(settings.pGr&&settings.pGr.on);}
/* ---------- ほかのモードの学習（2026-11-28 追加） ----------
   appHist.days（単語カード・4択・レッスン・冒険・お気に入り・聞き流し・瞬間作文）に入らない学習も数える：
     文法書の章の練習（coachLog の m:"gp" で id が "gq:" のもの）・到達テスト（m:"test"）・検定対策（m:"trki"）＝ 1問1点
     文法書の章を読む（開いて20秒以上）＝ 1章5点（同じ章は1回だけ。100日コースの「読む」もここで数える）
   1問ごとの記録（P85.log）は端末に2か月分しか残らないので、数えた結果を settings.pGr.xm = {"YYYY-MM":{"日":問題数}} に
   残し、日ごとに大きいほうを使う（減らない・2台の端末で数えても二重にならない）。読んだ章は settings.pGr.rc = {章ID:日付}。 */
var PGR_XN=-1,PGR_XO=null,PGR_RU=!(typeof P47_LANG!=="undefined"&&P47_LANG==="ky");
function pGrXSync(){
  var s=pGrSt(),L=(typeof P85!=="undefined"&&P85&&P85.log)||{},ch=false;
  var n=0;Object.keys(L).forEach(function(m){n+=(L[m]||[]).length;});
  if(n!==PGR_XN||s.xm!==PGR_XO){PGR_XN=n;PGR_XO=s.xm;Object.keys(L).forEach(function(m){var cnt={};
    (L[m]||[]).forEach(function(e){if(!Array.isArray(e))return;var md=e[1],id=String(e[2]||"");
      if(md==="trki"||md==="test"||(md==="gp"&&id.indexOf("gq:")===0)){var k=todayKey(new Date(e[0]*1000));cnt[k]=(cnt[k]||0)+1;}});
    Object.keys(cnt).forEach(function(k){var mo=k.slice(0,7),dd=k.slice(8),X=s.xm[mo]||(s.xm[mo]={});if(!(X[dd]>=cnt[k])){X[dd]=cnt[k];ch=true;}});});}
  /* 100日コースで読んだ章（settings.p85.course.rd）も読んだ章に入れる */
  try{var rd=settings.p85&&settings.p85.course&&settings.p85.course.rd;if(rd&&typeof rd==="object")Object.keys(rd).forEach(function(id){if(!s.rc[id]&&pGrIsCh(id)&&typeof rd[id]==="string"){s.rc[id]=rd[id];ch=true;}});}catch(_){}
  if(ch){try{saveAll();}catch(_){}}
}
/* その日のほかのモードの問題数 */
function pGrXDay(k){var s=pGrSt(),X=s.xm[k.slice(0,7)];return X&&X[k.slice(8)]||0;}
/* 文法書の章を読んだ：開いて20秒たっても同じ章が開いていたら1回だけ記録 */
function pGrIsCh(id){return (window.P72_GUIDE||[]).some(function(g){return g&&g.id===id;});}
function pGrReadMark(id){var s=pGrSt();if(!id||s.rc[id]||!pGrIsCh(id))return;s.rc[id]=todayKey();try{saveAll();}catch(_){}}
var PGR_RT=null;
if(typeof p72GuideRender==="function"){var _pgrGR=p72GuideRender;p72GuideRender=function(){var r=_pgrGR.apply(this,arguments);
  try{var id=typeof P72G!=="undefined"&&P72G&&P72G.id;clearTimeout(PGR_RT);
    if(id&&!pGrSt().rc[id])PGR_RT=setTimeout(function(){try{var g=document.getElementById("p72g");if(P72G&&P72G.id===id&&g&&g.classList.contains("show"))pGrReadMark(id);}catch(_){}},20000);}catch(_){}
  return r;};}
/* 学習記録から計算した合計ポイント（内訳つき）
   q：解いた問題（全部のモード）, x：そのうち文法書の練習・到達テスト・検定対策, r：読んだ章, w：覚えた単語, d：学習した日 */
function pGrPts(){
  try{pGrXSync();}catch(_){}
  var s=pGrSt(),days=(appHist&&appHist.days)||{},q=0,x=0,d=0,seen={};
  Object.keys(days).forEach(function(k){var c=0;try{c=p48DayCount(k);}catch(_){}if(c>0){q+=c;seen[k]=1;}});
  Object.keys(s.xm).forEach(function(mo){var X=s.xm[mo];Object.keys(X).forEach(function(dd){var c=+X[dd]||0;if(c>0){x+=c;seen[mo+"-"+dd]=1;}});});
  d=Object.keys(seen).length;q+=x;
  var r=Object.keys(s.rc).length,w=0;try{w=p47KnownCount();}catch(_){}
  return {q:q,x:x,r:r,w:w,d:d,p:q+w*3+d*10+r*5};
}
/* 仲間ごとのポイント：ためた分＋（いま育てていれば）育て始めてから増えた分 */
function pGrKP(k,T){
  var s=pGrSt(),o=s.own[k];if(!o)return 0;if(T==null)T=pGrPts().p;
  if(s.k===k){if(o.since==null)o.since=T;return o.acc+Math.max(0,T-o.since);}
  return o.acc;
}
/* 今日ふえたポイント：今日はじめて見たときの合計（settings.pGr.base）との差 */
function pGrToday(P){
  var s=pGrSt(),k=todayKey(),c=0;try{c=p48DayCount(k);}catch(_){}var dq=c>0||pGrXDay(k)>0;c+=pGrXDay(k);
  Object.keys(s.rc).forEach(function(id){if(s.rc[id]===k)c+=5;});
  var est=P.p-c-(dq?10:0);
  if(!s.base||s.base.d!==k){s.base={d:k,p:est};}
  else if(est<s.base.p)s.base.p=est;
  return Math.max(0,Math.min(P.p-s.base.p,pGrKP(s.k,P.p)));
}
function pGrKind(k){return PGR_KINDS[k||pGrSt().k]||PGR_KINDS[PGR_ORDER[0]];}
/* いまの段階：{i:段階, sub:小段階0〜4, frac:次の段階までの割合, need:あと何点} */
function pGrStage(p){
  var i=0;for(var j=0;j<PGR_T.length;j++)if(p>=PGR_T[j])i=j;
  if(i>=PGR_T.length-1)return {i:i,sub:4,frac:1,need:0,last:1};
  var a=PGR_T[i],b=PGR_T[i+1],f=(p-a)/(b-a);
  return {i:i,sub:Math.min(4,Math.floor(f*5)),frac:f,need:b-p,last:0};
}
/* 選んだ道（まだなら null）。段階が分かれ道より前なら関係ない */
function pGrBr(k){var o=pGrSt().own[k];return o&&o.br||null;}

/* ---------- 絵 ---------- */
/* 光の星（小さな段階の数だけ、主人公のまわりに置く） */
function pGrStars(c,n){var pos=[[-46,-30],[44,-38],[-56,10],[54,6],[0,-56]],s="";
  for(var i=0;i<n;i++){s+=M6.spark(c[0]+pos[i][0],c[1]+pos[i][1],1.1,"#FFD34D");}return s;}
/* 場面の絵：背景＋後ろの光＋主人公＋星。主人公のまわりを少し大きく切りぬく */
function pGrScene(k,i,sub,b){
  var K=pGrKind(k);if(b===undefined)b=pGrBr(K.id);var body="",c=[120,80];
  try{c=K.c(i,b||"a");
    var glow='<defs><radialGradient id="pgrgl'+i+K.id+'"><stop offset="0" stop-color="#FFF6D6" stop-opacity="'+(i===9?.85:.5)+'"/><stop offset="1" stop-color="#FFF6D6" stop-opacity="0"/></radialGradient></defs><ellipse cx="'+c[0]+'" cy="'+c[1]+'" rx="'+(i===9?92:70)+'" ry="'+(i===9?66:52)+'" fill="url(#pgrgl'+i+K.id+')"/>';
    body=K.bg(i,b||"a")+glow+'<g class="pgr-hf">'+K.fig(i,b||"a")+'</g>'+pGrStars(c,sub||0)+(i===9?M6.spark(c[0]-70,c[1]-40,1.2,"#FFE27A")+M6.spark(c[0]+72,c[1]-30,1,"#FFE27A"):"");
  }catch(e){body=M6.steppe("day");}
  /* ふつうは主人公のまわりを少し大きく切りぬく。背の高い姿（天馬・馬に乗る姿など）は切らずに全体を見せる */
  var tall=c[1]<82,x=tall?0:Math.max(0,Math.min(48,c[0]-96)),vb=tall?"0 0 240 140":x+" 23 192 117";
  return '<svg class="p76-svg" viewBox="'+vb+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+body+'</svg>';
}
/* 主人公だけの絵（背景なし）。中心のまわりを切りぬいて大きく見せる */
function pGrFigSvg(k,i,b){var K=pGrKind(k);if(b===undefined)b=pGrBr(K.id);var s="",c=[120,80];try{c=K.c(i,b||"a");s=K.fig(i,b||"a");}catch(_){}
  /* 中心 c から足もと（y≒136）までの高さで、切りぬく大きさを決める（小さな子どもの姿も大きく見える） */
  var hg=Math.max(70,Math.min(150,(136-c[1])*2.3)),w=hg*1.15;
  return '<svg class="p76-svg" viewBox="'+(c[0]-w/2).toFixed(1)+' '+(138-hg).toFixed(1)+' '+w.toFixed(1)+' '+hg.toFixed(1)+'" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+s+'</svg>';}
function pGrTitle(k,i){var K=pGrKind(k),b=pGrBr(K.id);return (K.brAt&&i>=K.brAt&&!b)?"進化の道を選ぼう":K.t(i,b||"a");}

/* ---------- ホームの小さなカード ---------- */
function pGrCard(){
  if(!pGrOn())return "";
  var s=pGrSt(),K=pGrKind(),P=pGrPts(),kp=pGrKP(K.id,P.p),G=pGrStage(kp),t=pGrToday(P);
  var dots="";for(var j=0;j<5;j++)dots+='<i class="'+(j<G.sub||G.last?"on":"")+'"></i>';
  return '<button type="button" class="pgr-card" data-act="pgropen" aria-label="育てるモードを開く">'+
    '<span class="pgr-cimg">'+pGrScene(K.id,G.i,G.sub)+'</span>'+
    '<span class="pgr-ctx"><small>'+esc(K.name)+'　第'+(G.i+1)+'段階</small><b>'+esc(pGrTitle(K.id,G.i))+'</b>'+
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
function pGrChoiceHtml(K,cls){
  var h='<div class="pgr-choose'+(cls?' '+cls:'')+'">';
  ["a","b"].forEach(function(b){h+='<button type="button" class="pgr-cho" data-act="pgrbr" data-val="'+b+'"><span class="pgr-choimg">'+pGrFigSvg(K.id,K.brAt+1,b)+'</span><b>'+esc(K.br[b].n)+'</b><small>'+esc(K.br[b].x)+'</small></button>';});
  return h+'</div>';
}
function pGrPageHtml(){
  var s=pGrSt(),K=pGrKind(),P=pGrPts(),kp=pGrKP(K.id,P.p),G=pGrStage(kp),t=pGrToday(P),b=pGrBr(K.id);
  var needBr=K.brAt&&G.i>=K.brAt&&!b;
  var h='<div class="pgr-hero">'+pGrScene(K.id,G.i,G.sub)+'</div>';
  h+='<div class="pgr-name"><small>'+esc(K.name)+'　第'+(G.i+1)+'段階 / 全10段階'+(b&&K.brAt?'　'+esc(K.br[b].n):'')+'</small><b>'+esc(pGrTitle(K.id,G.i))+'</b></div>';
  h+='<div class="pgr-gauge"><div class="pgr-bar big"><i style="width:'+Math.round(G.frac*100)+'%"></i></div>'+
     '<div class="pgr-gl"><span>'+(G.last?'最後の姿まで育ちました':'次の進化まで あと <b>'+G.need.toLocaleString()+'</b> ポイント')+'</span><span class="pgr-today'+(t>0?' up':'')+'">今日 +'+t.toLocaleString()+'</span></div></div>';
  if(needBr)h+='<div class="pgr-h">進化の道を選んでください</div>'+pGrChoiceHtml(K);
  else h+='<p class="pgr-desc">'+esc(K.x(G.i,b||"a"))+'</p>';
  if(K.brAt&&!b&&G.i<K.brAt)h+='<p class="pgr-note">第'+(K.brAt+1)+'段階で、進化の道を2つから選べます（'+esc(K.br.a.n)+'／'+esc(K.br.b.n)+'）。</p>';
  /* これまでの姿 */
  h+='<div class="pgr-h">これまでの姿</div><div class="pgr-gal">';
  for(var i=0;i<10;i++){var open=i<=G.i,unk=K.brAt&&i>=K.brAt&&!b;
    h+='<div class="pgr-gi'+(open&&!unk?"":" lock")+(i===G.i?" now":"")+'">'+(open&&!unk?pGrScene(K.id,i,0):pGrFigSvg(K.id,i,b||"a"))+'<b>'+(i+1)+'. '+(open&&!unk?esc(K.t(i,b||"a")):'？？？')+'</b>'+(open?'':'<small>'+PGR_T[i].toLocaleString()+' ポイントで</small>')+'</div>';}
  h+='</div>';
  /* 育てる仲間を選ぶ */
  h+='<div class="pgr-h">育てる仲間を選ぶ<small>10種類</small></div><p class="pgr-note">仲間ごとに育ち方は別々です。新しい仲間は第1段階から始まり、ポイントはいま選んでいる仲間にだけ入ります。前の仲間は育ったところのまま牧場で待っていて、もう一度選べば続きから育てられます。</p><div class="pgr-kinds">';
  PGR_ORDER.forEach(function(id){var KK=PGR_KINDS[id],o=s.own[id],kg=pGrStage(o?pGrKP(id,P.p):0);
    h+='<button type="button" class="pgr-kd'+(id===K.id?" on":"")+'" data-act="pgrkind" data-val="'+id+'"><span class="pgr-kdimg">'+pGrFigSvg(id,o?kg.i:0,o&&o.br||"a")+'</span><b>'+esc(KK.name)+'</b><small>'+(id===K.id?'育てています':o?'第'+(kg.i+1)+'段階で待っています':esc(KK.sub))+'</small></button>';});
  h+='</div>';
  h+='<div class="pgr-h">成長ポイント<small>合計 '+P.p.toLocaleString()+'</small></div><div class="pgr-sum">'+
     '<div><b>'+P.q.toLocaleString()+'</b><span>解いた問題</span><small>1問 = 1</small></div>'+
     '<div><b>'+P.r.toLocaleString()+'</b><span>読んだ文法の章</span><small>1章 = 5</small></div>'+
     '<div><b>'+P.w.toLocaleString()+'</b><span>覚えた単語</span><small>1語 = 3</small></div>'+
     '<div><b>'+P.d.toLocaleString()+'</b><span>学習した日</span><small>1日 = 10</small></div></div>';
  h+='<div class="pgr-h">何をすると育つ？</div><table class="pgr-how"><tbody>'+
     '<tr><th>単語カード・4択・レッスン・冒険・お気に入り・聞き流し</th><td>1問 +1</td></tr>'+
     '<tr><th>瞬間作文</th><td>1問 +1</td></tr>'+
     '<tr><th>文法書の章の練習・到達テスト'+(PGR_RU?'・検定対策（ТРКИ）':'')+'</th><td>1問 +1</td></tr>'+
     '<tr><th>文法書の章を読む（開いて20秒。同じ章は1回だけ）</th><td>1章 +5</td></tr>'+
     '<tr><th>単語が「覚えた」になる</th><td>1語 +3</td></tr>'+
     '<tr><th>その日に1問でも解く</th><td>1日 +10</td></tr>'+
     '</tbody></table>';
  h+='<p class="pgr-note">100日コース・今日やること・弱点の講義から始めた練習も、上のどれかとして同じように数えます（同じ問題を二重には数えません）。どのモードで勉強しても、育ち方は同じです。'+(P.x?'このうち文法書の練習・到達テスト'+(PGR_RU?'・検定対策':'')+'で解いた問題は '+P.x.toLocaleString()+' 問です。':'')+'</p>';
  h+='<p class="pgr-note">光の星は、段階の中で少し育つたびに1つずつ増えます（5つで次の段階が近い合図）。</p>';
  h+='<button type="button" class="pgr-off" data-act="pgroff">育てるモードをやめる（通常のホームにもどす）</button>';
  h+='<p class="pgr-note">やめても、学習の記録と育ったようすはそのまま残ります。設定からいつでも、もう一度オンにできます。</p>';
  return h;
}
function pGrSheet(){var m=document.getElementById("pgrpage");if(!m){m=document.createElement("div");m.id="pgrpage";document.body.appendChild(m);}return m;}
function pGrOpen(keep){
  var m=pGrSheet(),pb=m.querySelector(".pgr-pb"),y=keep&&pb?pb.scrollTop:0;
  m.innerHTML='<div class="pgr-mask" data-act="pgrclose"></div><div class="pgr-panel" role="dialog" aria-modal="true" aria-label="育てるモード"><div class="pgr-ph"><b>育てるモード</b><button type="button" class="pgr-x" data-act="pgrclose" aria-label="閉じる"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><div class="pgr-pb">'+pGrPageHtml()+'</div></div>';
  m.className="show";document.body.classList.add("pgr-open");
  if(y){var nb=m.querySelector(".pgr-pb");if(nb)nb.scrollTop=y;}
}
function pGrClose(){var m=pGrSheet();m.className="";m.innerHTML="";document.body.classList.remove("pgr-open");}

/* ---------- 進化の演出 ---------- */
var PGR_T0=null;/* クラウドを読み終えたときの合計ポイント（これより増えた＝この起動中に勉強した） */
var PGR_TM=[],PGR_EV=null;
function pGrEvolve(k,from,to,first){
  var K=pGrKind(k);if(!K)return;
  var m=document.getElementById("pgrevo");if(!m){m=document.createElement("div");m.id="pgrevo";document.body.appendChild(m);}
  var choose=!first&&K.brAt&&to>=K.brAt&&!pGrBr(K.id);
  PGR_EV={k:K.id,from:from,to:to,first:first};
  var burst="";for(var i=0;i<18;i++){burst+='<span style="transform:rotate('+(i*20)+'deg)"><i style="animation-delay:'+(i%3*.06).toFixed(2)+'s"></i></span>';}
  var lead=first?(K.name+'が、あなたの学習の仲間になりました'):(K.name+'のようすが……！');
  m.innerHTML='<div class="pgr-ebg"></div><div class="pgr-rays"></div>'+
    '<div class="pgr-efig"><div class="pgr-eold">'+pGrFigSvg(K.id,first?to:from)+'</div><div class="pgr-enew"></div><div class="pgr-burst">'+burst+'</div></div>'+
    '<div class="pgr-flash"></div><div class="pgr-elead">'+esc(lead)+'</div>'+
    (choose?'<div class="pgr-echo"><b>どちらの姿に進化させる？</b><small>一度選ぶと、この仲間はその道で育ちます</small>'+pGrChoiceHtml(K,"dark")+'</div>':'')+
    '<div class="pgr-etx"></div>';
  pGrEvoFill();
  m.className="show s1";document.body.classList.add("pgr-open");
  PGR_TM.forEach(clearTimeout);PGR_TM=[];
  if(choose){PGR_TM=[setTimeout(function(){pGrGo("sc");},1400)];return;}/* 道を選ぶまで待つ */
  pGrRun(first);
}
/* 新しい姿と文を入れる（道を選んだあとにも呼ぶ） */
function pGrEvoFill(){
  var m=document.getElementById("pgrevo"),E=PGR_EV;if(!m||!E)return;var K=pGrKind(E.k),b=pGrBr(K.id)||"a";
  var nw=m.querySelector(".pgr-enew");if(nw)nw.innerHTML=pGrFigSvg(K.id,E.to,b);
  var tx=m.querySelector(".pgr-etx");if(tx)tx.innerHTML='<small>'+(E.first?esc(K.name)+'　第'+(E.to+1)+'段階':'進化！　第'+(E.to+1)+'段階')+'</small><b>'+esc(K.t(E.to,b))+'</b><p>'+esc(K.x(E.to,b))+'</p>'+
    '<button type="button" class="pgr-ebtn" data-act="pgrevook">つづける</button><button type="button" class="pgr-elink" data-act="pgrevopage">育つようすを見る</button>';
}
function pGrGo(c){var m=document.getElementById("pgrevo");if(!m||m.className.indexOf("show")<0||m.className.indexOf("s4")>=0)return;m.className="show "+c;}
function pGrRun(first){
  PGR_TM.forEach(clearTimeout);
  var reduce=false;try{reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;}catch(_){}
  if(reduce||first){PGR_TM=[setTimeout(function(){pGrGo("s4");},first?900:50)];return;}
  PGR_TM=[setTimeout(function(){pGrGo("s2");},first===0?200:1500),setTimeout(function(){pGrGo("s3");},first===0?2000:3300),setTimeout(function(){pGrGo("s4");},first===0?2300:3600)];
  try{if(navigator.vibrate)setTimeout(function(){navigator.vibrate([30,40,60]);},first===0?2000:3300);}catch(_){}
}
function pGrEvoClose(){PGR_TM.forEach(clearTimeout);PGR_TM=[];PGR_EV=null;var m=document.getElementById("pgrevo");if(m){m.className="";m.innerHTML="";}document.body.classList.remove("pgr-open");}

/* 段階が上がったかを確かめる（どの画面でも）。
   この起動中に勉強してポイントが増えて上がったときは「まだ見せていない進化」settings.pGr.pend に入れる。
   開いただけ（クラウドから記録が届いただけ）で上がったときは、演出なしで記録だけ合わせる。 */
var PGR_BUSY="#p48modal.show,#pgrevo.show,#p81sheet.show,#pgrpage.show,#p70page.show,#p72g.show,#onboardHost:not(:empty)";
function pGrCheck(){
  try{
    if(!pGrOn())return;
    if(typeof p83Cloud==="function"&&!p83Cloud())return;/* クラウドを読み終えるまで待つ */
    var s=pGrSt(),P=pGrPts(),o=s.own[s.k],G=pGrStage(pGrKP(s.k,P.p)),ch=false;
    if(PGR_T0===null)PGR_T0=P.p;
    if(o.seen==null){o.seen=G.i;ch=true;}
    else if(G.i>o.seen){
      if(P.p>PGR_T0)s.pend={k:s.k,from:(s.pend&&s.pend.k===s.k)?s.pend.from:o.seen,to:G.i};
      o.seen=G.i;ch=true;
    }else if(G.i<o.seen){o.seen=G.i;delete s.pend;ch=true;}/* 記録を戻したとき */
    if(ch){try{saveAll();}catch(_){}}
    pGrShowPend();
  }catch(_){}
}
/* まだ見せていない進化を、ホームが見えていて、ほかの画面（お祝い・冒険・文法書など）が開いていないときに出す */
var PGR_WAIT=0;
function pGrShowPend(){
  var s=pGrSt();if(!s.pend||!pGrOn())return;
  if(ui.bnav!=="home"||document.querySelector(PGR_BUSY))return;
  if(PGR_WAIT)return;PGR_WAIT=1;
  setTimeout(function(){PGR_WAIT=0;
    if(!s.pend||ui.bnav!=="home"||document.querySelector(PGR_BUSY))return;/* 直前にお祝いなどが開いたら、次の機会に */
    var e=s.pend;delete s.pend;try{saveAll();}catch(_){}
    if(e.k!==s.k)return;
    pGrEvolve(e.k,+e.from,+e.to,false);
  },700);
}
(function(){
  var r=render;render=function(){var o=r.apply(this,arguments);setTimeout(pGrCheck,0);return o;};
  /* クラウドを読み終えた時点のポイントを覚える */
  (function wait(n){if(typeof p83Cloud!=="function"||p83Cloud()){try{PGR_T0=pGrPts().p;}catch(_){}return;}if(n<80)setTimeout(function(){wait(n+1);},250);})(0);
  /* 冒険や文法書を閉じたときは render が呼ばれないことがあるので、ときどき確かめる（オンのときだけ） */
  setInterval(function(){if(pGrOn()&&!document.hidden)pGrCheck();},1500);
})();

/* ---------- 切りかえ ---------- */
function pGrSetOn(v){
  var s=pGrSt();s.on=v?1:0;
  if(v){var o=s.own[s.k];if(o.since==null)o.since=pGrPts().p;o.seen=pGrStage(pGrKP(s.k)).i;}
  try{saveAll();}catch(_){}
}
/* 育てる仲間を変える：いまの仲間のポイントをためておき、新しい仲間は今の合計から数え始める */
function pGrSwitch(id){
  var s=pGrSt();if(!PGR_KINDS[id]||id===s.k)return false;var T=pGrPts().p,cur=s.own[s.k];
  cur.acc=pGrKP(s.k,T);cur.since=null;
  var fresh=!s.own[id];if(fresh)s.own[id]={acc:0,since:T,seen:0};else s.own[id].since=T;
  s.k=id;delete s.pend;try{saveAll();}catch(_){}
  return true;
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a.indexOf("pgr")!==0)return;
  e.stopImmediatePropagation();e.preventDefault();
  var v=el.getAttribute("data-val");
  if(a==="pgropen"){pGrOpen();return;}
  if(a==="pgrclose"){pGrClose();try{render();}catch(_){}return;}
  if(a==="pgrtog"){var on=!pGrOn();pGrSetOn(on);render();if(on)pGrEvolve(pGrSt().k,0,pGrStage(pGrKP(pGrSt().k)).i,true);return;}
  if(a==="pgron"){pGrSetOn(1);try{if(typeof p81Close==="function")p81Close();}catch(_){}ui.bnav="home";render();pGrEvolve(pGrSt().k,0,pGrStage(pGrKP(pGrSt().k)).i,true);return;}
  if(a==="pgroff"){pGrSetOn(0);pGrClose();render();return;}
  if(a==="pgrevook"){pGrEvoClose();try{render();}catch(_){}return;}
  if(a==="pgrevopage"){pGrEvoClose();pGrOpen();return;}
  if(a==="pgrkind"){if(pGrSwitch(v)){pGrClose();render();var s=pGrSt();pGrEvolve(s.k,0,pGrStage(pGrKP(s.k)).i,true);}return;}
  if(a==="pgrbr"&&(v==="a"||v==="b")){var s2=pGrSt();s2.own[s2.k].br=v;try{saveAll();}catch(_){}
    var m=document.getElementById("pgrevo");
    if(m&&m.className.indexOf("show")>=0&&PGR_EV){pGrEvoFill();var ch=m.querySelector(".pgr-echo");if(ch)ch.remove();m.className="show s1";pGrRun(0);}/* 選んだら、すぐ進化の光へ */
    else{pGrOpen(1);}
    return;}
},true);
/* 演出の途中で画面を押したら、最後（新しい姿）まで飛ばす（道を選ぶ画面のときは飛ばさない） */
document.addEventListener("click",function(e){
  var m=document.getElementById("pgrevo");if(!m||m.className.indexOf("show")<0)return;
  if(e.target.closest&&e.target.closest("[data-act]"))return;
  if(m.querySelector(".pgr-echo"))return;
  if(m.className.indexOf("s4")<0){PGR_TM.forEach(clearTimeout);m.className="show s4";}
},true);

/* 設定：育てるモードのオン／オフ */
if(typeof p62SettingsUI==="function"){
  var _pGrSetUI=p62SettingsUI;
  p62SettingsUI=function(){
    var h=String(_pGrSetUI.apply(this,arguments)),i=h.lastIndexOf('</div>');
    return h.slice(0,i)+'<button type="button" class="p63-tog" data-act="pgrtog"><span><b>育てるモード（マナスや動物が育つ）</b><small>勉強するほど仲間が成長し、ホームに今の姿が出ます。オフにすると、ふつうのホームにもどります</small></span><i class="'+(pGrOn()?"on":"")+'"></i></button>'+h.slice(i);
  };
}
/* 使い方のページ：続ける気持ちを高めたい人への案内 */
if(typeof p81GuideHtml==="function"){
  var _pGrGuide=p81GuideHtml;
  p81GuideHtml=function(){
    var h=String(_pGrGuide.apply(this,arguments)),i=h.indexOf('<div class="p81-gh">');if(i<0)return h;
    var c='<div class="p81-g"><div class="p81-gwho">続ける楽しみがほしい人</div><div class="p81-gmode">'+p81Ic("sun",20)+'<b>育てるモード</b></div><p>どのモードで勉強しても（100日コース・文法書・到達テスト'+(PGR_RU?"・検定対策":"")+'も）、解いた問題・読んだ文法の章・覚えた単語・学習した日の数に合わせて、仲間が10段階で育ちます。仲間は、英雄マナス・おじさん・犬・猫・うさぎ・ヤク・天馬トゥルパル・ユキヒョウ・イヌワシ・竜の10種類から選べます。途中で進化の道を2つから選ぶこともできます。'+(pGrOn()?'<br><b>いまオンになっています。</b>':'')+'</p>'+(pGrOn()?'':'<button type="button" class="p81-gbtn" data-act="pgron">育てるモードをオンにする '+p81Ic("go",15)+'</button>')+'</div>';
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
  '.pgr-sum{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.pgr-how{width:100%;border-collapse:collapse;font-size:13px;line-height:1.5}.pgr-how th{text-align:left;font-weight:normal;padding:7px 6px 7px 2px;border-bottom:1px solid var(--line)}.pgr-how td{white-space:nowrap;text-align:right;font-weight:700;color:var(--accent,#C9821E);padding:7px 2px;border-bottom:1px solid var(--line)}.pgr-sum div{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:10px 8px;text-align:center;display:flex;flex-direction:column;gap:1px}.pgr-sum b{font-size:19px}.pgr-sum span{font-size:12.5px}.pgr-sum small{font-size:11.5px;color:var(--muted)}'+
  '.pgr-note{font-size:13px;line-height:1.7;color:var(--muted);margin:10px 2px}'+
  '.pgr-gal{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pgr-gi{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:6px;display:flex;flex-direction:column;gap:3px}.pgr-gi svg{width:100%;height:auto;border-radius:8px}.pgr-gi b{font-size:13px}.pgr-gi small{font-size:11.5px;color:var(--muted)}'+
  '.pgr-gi.now{border:2px solid var(--accent)}.pgr-gi.lock svg{filter:brightness(0) contrast(0);opacity:.55}'+
  '.pgr-off{display:block;width:100%;margin:18px 0 0;min-height:48px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:14px;cursor:pointer}'+
  'body.pgr-open{overflow:hidden}'+
  /* 主人公にやわらかい光のふち */
  '.pgr-hf{filter:drop-shadow(0 0 3px rgba(255,246,214,.9))}'+
  /* 仲間を選ぶ */
  '.pgr-kinds{display:grid;grid-template-columns:1fr 1fr;gap:8px}.pgr-kd{display:flex;flex-direction:column;align-items:flex-start;gap:2px;border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:12px;padding:6px 8px 8px;font:inherit;text-align:left;cursor:pointer;min-height:44px}'+
  '.pgr-kd.on{border:2px solid var(--accent)}.pgr-kdimg{display:block;width:100%;height:72px;line-height:0}.pgr-kdimg svg{width:100%;height:100%}.pgr-kd b{font-size:14px}.pgr-kd small{font-size:11.5px;color:var(--muted);line-height:1.4}'+
  /* 進化の道を選ぶ */
  '.pgr-choose{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 6px}.pgr-cho{display:flex;flex-direction:column;gap:3px;border:1.5px solid var(--accent);background:var(--card);color:var(--ink);border-radius:14px;padding:8px;font:inherit;text-align:left;cursor:pointer}'+
  '.pgr-choimg{display:block;height:96px;line-height:0}.pgr-choimg svg{width:100%;height:100%}.pgr-cho b{font-size:14.5px}.pgr-cho small{font-size:12px;line-height:1.5;color:var(--muted)}'+
  '.pgr-echo{position:absolute;left:0;right:0;bottom:0;padding:16px 16px calc(20px + env(safe-area-inset-bottom));max-width:560px;margin:0 auto;opacity:0;pointer-events:none;transition:opacity .5s;text-align:center}'+
  '#pgrevo.sc .pgr-echo{opacity:1;pointer-events:auto}#pgrevo.sc .pgr-elead{opacity:0}#pgrevo.sc .pgr-efig{top:24%}#pgrevo.sc .pgr-rays{opacity:.4}'+
  '.pgr-echo>b{display:block;font-size:20px;margin-bottom:2px}.pgr-echo>small{display:block;font-size:12.5px;color:#C9C2DA;margin-bottom:10px}'+
  '.pgr-choose.dark .pgr-cho{background:rgba(255,255,255,.08);border-color:#E8B923;color:#fff}.pgr-choose.dark .pgr-cho small{color:#D9D2EA}'+
  '@media (max-height:620px){.pgr-choimg{height:64px}.pgr-echo>b{font-size:17px}}'+
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
  '@media (max-height:420px){#pgrevo.s4 .pgr-efig{left:25%;top:50%;width:min(44vw,60vh)}.pgr-etx{left:50%;right:0;bottom:auto;top:50%;transform:translateY(-50%)!important;padding:0 16px}#pgrevo.s4 .pgr-etx{transform:translateY(-50%)!important}.pgr-etx p{max-height:34vh}#pgrevo.sc .pgr-efig{opacity:0}}'+
  /* とても狭い画面 */
  '@media (max-width:350px){.pgr-cimg{width:96px}.pgr-etx b{font-size:26px}}';
  document.head.appendChild(st);
})();
