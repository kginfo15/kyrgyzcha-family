/* ===== PHASE90：AIコーチが「今日は何分できるか」から今日の勉強を組み立てる／いまの現在地と残りの時間／外のAIで使う会話練習の文 =====
   2026-11-28 Yuta：「毎日何分できるかをチェックして、AIがその日の勉強を組み立てる。世の中のデータにもとづいたロジックで。
                    進捗・レベル・残りの学習時間をトップと検定の上に小さく、少しカラフルに。ChatGPT などに渡す会話練習のプロンプトを、その日の進み具合で変えて」。
   組み立てのルール（根拠）：
     R1 間をあけた復習を先に（分散学習：Cepeda ほか 2006 のメタ分析。復習の時期は phase88 の記憶モデルが決める）。
     R2 読むより「思い出す・解く」（テスト効果：Roediger & Karpicke 2006）。どの項目も問題を解く形にする。
     R3 正答率を約85%に保つ（Wilson ほか 2019「85%ルール」）。直近14日の正答率が75%未満なら新しい言葉を減らして復習へ、92%超なら新しい言葉を増やす。
     R4 復習がたまっているときは新しい言葉を減らす（たまった復習は翌日以降の時間を押しつぶすため。FSRS の運用の考え方）。
     R5 種類をまぜる（交互練習：Rohrer & Taylor 2007）。最後に検定の問題集（分野がまざった10問）を置く。
     R6 短い日でも0にしない（毎日少しでも続けると、間をあけた復習がこわれない）。10分以下の日は復習だけ。
   いまのレベルの推定（目安）：
     A1・A2・B1 それぞれの「達成度」＝ 単語（そのレベルの語のうち習った割合）50% ＋ 文法書の章（そのレベルの章の練習の済み具合）20% ＋ テスト（到達テストかミニ模試の点 ÷ 合格ライン）30%。
     達成度を時間の目安（A1 150・A2 350・B1 700 時間、試験対策モードと同じ）に当てはめて「いまの位置」を時間で表し、次のレベルまでの残りを出す。
     テストを受けていないレベルは、テストの30%を単語の割合で代わりにし、「確かさ：低い」と出す。
   設定：settings.p85.today = {d:日付, min:今日できる分}（その日だけ）。 */
var P90_LV=[["A1",150,"#22A06B"],["A2",350,"#2F80ED"],["B1",700,"#8E5BE8"]];
var P90_CHLV=function(i){return i<12?"A1":(i<23?"A2":"B1");}; /* 文法書の章：100日コースの区切りと同じ（1〜12章 A1、13〜23章 A2、24〜34章 B1） */
var P90_MINS=[10,20,30,45,60,90];
function p90Today(){var t=(settings.p85||{}).today;return (t&&t.d===todayKey()&&t.min>0)?t.min:0;}
/* 目標の分：今日答えた分 → 100日コース → 15/30/60分の設定 */
var _p90Goal=p85Goal;
p85Goal=function(){var m=p90Today();return m||_p90Goal();};

/* ---------- 今日の勉強を、使える時間に合わせて組み立てる ---------- */
function p90Sec(it,per){
  var k=it.k;
  if(k==="rev"){var n=+String(it.act).split(":")[1]||10;return n*per;}
  if(k==="new")return (it.ln||1)*20*per;
  if(k==="test")return 900;if(k==="mock")return 2100;if(k==="compose")return 300;if(k==="talk"||k==="listen")return 600;
  if(k==="trki")return Math.round(10*per*1.5);
  if(k==="ch")return /を読む/.test(it.title)?600+10*per:10*per;
  if(k==="lec")return 180+10*per;
  return it.sec||10*per;
}
function p90Fit(items){
  var min=p90Today();if(!min||!items||!items.length)return items;
  var B=min*60,per=p85SecPerQ(),acc=p85Acc14(),due=0;try{due=p85DueIds().length;}catch(_){}
  var pri={test:0,rev:1,lec:2,weak:2,weakw:2,ch:2,new:3,trki:4,mock:4,compose:5,talk:4,listen:5};
  var L=items.map(function(it,i){var o={};for(var k in it)o[k]=it[k];o._i=i;o._p=pri[it.k]!=null?pri[it.k]:4;return o;});
  /* R6：10分以下の日は、復習（なければいちばん上）だけ */
  if(min<=10){var r=L.filter(function(x){return x.k==="rev";})[0]||L.filter(function(x){return !x.done;})[0]||L[0];L=[r];}
  /* R3・R4：新しい言葉の量 */
  var newF=1,note=[];
  if(acc!=null&&acc<75){newF=0.5;note.push("正答率が"+acc+"%と低めなので、新しい言葉を控えめにして、復習と弱点の練習を多めにしました（正答率85%前後がいちばん身につくため）");}
  else if(acc!=null&&acc>92){newF=1.3;note.push("正答率が"+acc+"%と高いので、新しい言葉を少し増やしました（やさしすぎると伸びにくいため）");}
  if(due>Math.max(30,3*Math.round(B*0.3/per))){newF=Math.min(newF,0.5);note.push("復習の時期の言葉が"+due+"語たまっているので、新しい言葉を控えめにしました");}
  L.sort(function(a,b){return a._p-b._p||a._i-b._i;});
  var used=0,out=[];
  L.forEach(function(it){
    var left=B-used;if(left<=60&&out.length)return;
    if(it.k==="rev"){var n=+String(it.act).split(":")[1]||10,cap=Math.max(5,Math.floor(Math.min(left,B*0.4)/per));n=Math.max(1,Math.min(n,cap));it.act="rev:"+n;it.amt=n+"語 ・ 約"+Math.max(1,Math.round(n*per/60))+"分";}
    else if(it.k==="new"){var ln=Math.max(1,Math.round((it.ln||1)*newF)),fit=Math.max(1,Math.floor(left/(20*per)));ln=Math.min(ln,fit);it.ln=ln;it.amt=ln+"レッスン（約"+ln*6+"語） ・ 約"+Math.max(1,Math.round(ln*20*per/60))+"分";}
    var s=p90Sec(it,per);
    if(used+s>B*1.1&&out.length&&!it.done){if(it.k==="trki"&&left>=180){it.amt="5問 ・ 約"+Math.round(5*per*1.5/60)+"分";s=Math.round(5*per*1.5);}else return;}
    used+=s;out.push(it);
  });
  /* 時間が余るときは足す：まぜた問題（検定10問）→ 新しい言葉を増やす（1日8レッスンまで）→ 瞬間作文 */
  if(min>10){
    var has=function(k){return out.some(function(x){return x.k===k;});},todayT=0;try{todayT=p85TodayLog().filter(function(e){return e[1]==="trki";}).length;}catch(_){}
    var sT=Math.round(10*per*1.5);var noT=false;try{noT=typeof p85Crs==="function"&&p85Crs()&&p85Pur()==="talk";}catch(_){}
    if(B-used>=sT&&window.P86_LG&&!noT&&!has("trki")&&!has("mock")){out.push({k:"trki",act:(typeof p85Crs==="function"&&p85Crs())?"trkitoday":"trki",title:"検定の問題集 10問（分野がまざった問題）",amt:"10問 ・ 約"+Math.round(sT/60)+"分",why:"種類のちがう問題をまぜて解くと、本番で見分ける力がつきます。",done:todayT>=10});used+=sT;}
    /* 正答率が低い日は、新しい言葉より先に弱点の講義（解いて確かめる）を足す */
    if(newF<1){try{p85Weak().slice(0,3).forEach(function(b){var act="lec:"+b.k,sL=180+10*per;if(B-used<sL||out.some(function(x){return x.act===act;}))return;
      out.push({k:"lec",act:act,title:"弱点の講義："+p85KeyName(b.k),amt:"読む3分＋確認の問題 ・ 約"+Math.round(sL/60)+"分",why:b.why,done:false});used+=sL;});}catch(_){}}
    var nw=out.filter(function(x){return x.k==="new";})[0],cap=newF<1?3:8;
    if(B-used>=20*per){
      if(!nw){nw={k:"new",act:"new",title:"新しい言葉のレッスン",why:"時間に余裕があるので、新しい言葉を進めます。",done:false,ln:0};out.push(nw);}
      var add=Math.min(cap-(nw.ln||0),Math.floor((B-used)/(20*per)));if(add>0){nw.ln=(nw.ln||0)+add;used+=add*20*per;nw.amt=nw.ln+"レッスン（約"+nw.ln*6+"語） ・ 約"+Math.round(nw.ln*20*per/60)+"分";}
    }
    if(B-used>=300&&!has("compose")){out.push({k:"compose",act:"compose",title:"瞬間作文（話す練習）",amt:"10文 ・ 約5分",why:"日本語を見てすぐロシア語で言う練習です。",done:false});used+=300;}
  }
  /* R5：やる順番＝復習でウォームアップ → 頭を使うもの（章・講義・テスト）→ 新しい言葉 → まぜた問題 */
  var ord={rev:0,test:1,ch:1,lec:1,weak:1,weakw:1,new:2,compose:3,talk:3,listen:3,trki:4,mock:4};
  out.sort(function(a,b){return (ord[a.k]!=null?ord[a.k]:3)-(ord[b.k]!=null?ord[b.k]:3);});
  P90.fit={min:min,used:Math.round(used/60),note:note,drop:Math.max(0,items.length-out.filter(function(x){return x._i!=null;}).length)};
  return out;
}
var P90={};
var _p90Plan=p85Plan;
p85Plan=function(){var it=_p90Plan.apply(this,arguments);P90.fit=null;try{if(P47_LANG==="ru")return p90Fit(it);}catch(_){}return it;};

/* ---------- いまの現在地（レベル・残りの時間） ---------- */
function p90ChDone(){
  var st={},from=0;Object.keys(P85.log).forEach(function(m){P85.log[m].forEach(function(e){if(e[1]!=="gp"||!e[5])return;e[5].forEach(function(g){var r=st[g]||(st[g]={n:0,ok:0});r.n++;r.ok+=e[3];});});});
  var c=null;try{c=p85Crs();}catch(_){}
  return function(id){var r=st[id];if(r&&r.n>=5&&r.ok/r.n>=0.6)return true;return !!(c&&typeof p85ChDone==="function"&&p85ChDone(c,id));};
}
/* ---------- いまのレベルと残り時間（2026-11-28 Yuta：「会話や解いた問題の数などを総合して正確に計算し、A1に達したかを判定。残り時間を毎日積算」） ----------
   レベルごと（A1・A2・B1）に、次の材料から「達成度」を出す。
   ① 学んだ範囲＝単語60%＋文法書の章40%
      単語：習った語を、覚えている強さ（復習の間隔・記憶の安定度）で0.5〜1に重みづけ。
      章：読んだ・練習した章。章の問題の正答率が分かれば、それで重みづけ。
   ② 身についている度合い（0〜1）：材料がある分だけ、量に応じた重みで平均（材料がないうちは 0.75 と仮に置く）
      ・問題の正答率（60日、そのレベルの単語・章・検定の問題。50%→0、90%以上→1）
      ・話す・書く（瞬間作文を声や文字で答えた正答率と、3文作文で正しく書けた文の割合）
   ③ 達成度＝①×(0.6＋0.4×②)。到達テスト・ミニ模試があれば、その結果（合格ライン66%で1）と半分ずつ。
   判定：テストが合格ライン以上 かつ 達成度80%以上 → 「到達」（確定）。テストなしで達成度85%以上 → 「ほぼ到達（テストで確定）」。
   時間：A1 150・A2 350・B1 700時間の目安を、下のレベルから積み上げる（下のレベルが8割未満なら上は割り引く）。
   自分のペース：毎日の推定を settings.p85.lvh {日付:[位置h, 記録した勉強h]} に残し、記録が5時間以上たまったら
   「記録した時間 ÷ 進んだ位置」で残り時間を0.6〜2倍に補正。材料が少ないうちは幅を広く出す。 */
function p90Clamp(x,a,b){return Math.max(a,Math.min(b,x));}
function p90WordStr(p){if(!p||!p.status||p.status==="new")return 0;var st=(p.fs&&p.fs.s)||p.intervalDays||1,bad=(p.wrongCount||0)>(p.correctCount||0)?0.8:1;return (0.5+0.5*Math.min(1,st/21))*bad;}
function p90Ev(){
  /* 60日分の記録をレベルごとに数える */
  var chs=(window.P72_GUIDE||[]).map(function(g){return g.id;}),chLv={};chs.forEach(function(id,i){chLv[id]=P90_CHLV(i);});
  var E={A1:{q:[0,0],o:[0,0],ch:{}},A2:{q:[0,0],o:[0,0],ch:{}},B1:{q:[0,0],o:[0,0],ch:{}}},from=Date.now()/1000-60*86400;
  var add=function(lv,k,ok){var b=E[lv];if(b){b[k][0]+=ok;b[k][1]++;}};
  Object.keys(P85.log).forEach(function(m){P85.log[m].forEach(function(e){if(e[0]<from)return;var md=e[1],ok=e[3]?1:0,g=e[5]||[];
    if(md==="compose"){var c=CMAP[e[2]];var lv=c&&E[c.level]?c.level:"A1";add(lv,"o",ok);if(lv!=="A1"&&E.A1.o[1]<40)add("A1","o",ok);return;}
    if(md==="write")return;
    if(md==="gp"){g.forEach(function(id){var lv=chLv[id];if(lv){add(lv,"q",ok);var r=E[lv].ch[id]||(E[lv].ch[id]=[0,0]);r[0]+=ok;r[1]++;}});return;}
    if(md==="trki"){var t=g.filter(function(x){return /^trki-(A1|A2|B1)$/.test(x);})[0];add(t?t.slice(5):"A1","q",ok);return;}
    if(md==="test"){var tl=null;g.forEach(function(x){var mm=/^t:.*?(A1|A2|B1)/.exec(x);if(mm)tl=mm[1];});var w=WMAP[e[2]];add(tl||(w&&w.level)||"A1","q",ok);return;}
    var w2=WMAP[e[2]];if(w2&&E[w2.level])add(w2.level,"q",ok);
  });});
  /* 3文作文：正しく書けた文の割合（いまのレベルに入れる。どのレベルの文かは決められないので A1 と A2 に） */
  try{(settings.psw&&settings.psw.h||[]).forEach(function(r){var d=new Date((r.d||"")+"T00:00:00").getTime()/1000;if(d&&d<from)return;(r.s||[]).forEach(function(x){add("A1","o",x[2]?1:0);add("A2","o",x[2]?1:0);});});}catch(_){}
  return {E:E,chLv:chLv,chs:chs};
}
function p90Level(){
  var EV=p90Ev(),E=EV.E,by={A1:[0,0,0],A2:[0,0,0],B1:[0,0,0]};
  try{VOCAB.forEach(function(w){var b=by[w.level];if(!b)return;b[1]++;var st=p90WordStr(progress[w.id]);if(st>0){b[0]++;b[2]+=st;}});}catch(_){}
  var done=p90ChDone(),cb={A1:[0,0,0],A2:[0,0,0],B1:[0,0,0]};
  EV.chs.forEach(function(id){var lv=EV.chLv[id],b=cb[lv];b[1]++;var r=E[lv].ch[id],d=done(id);
    if(d||(r&&r[1])){b[0]++;b[2]+=(r&&r[1]>=4)?p90Clamp(0.4+0.6*r[0]/r[1],0,1):(d?0.85:0.5);}});
  var T=(settings.p85&&settings.p85.tests)||[],mk=(settings.p86&&settings.p86.mk)||[],pass=66;
  var qs=function(a){return a[1]?p90Clamp((a[0]/a[1]-0.5)/0.4,0,1):null;};
  var out=[],prevH=0;
  P90_LV.forEach(function(L){
    var lv=L[0],w=by[lv][1]?by[lv][2]/by[lv][1]:0,g=cb[lv][1]?cb[lv][2]/cb[lv][1]:0,cov=0.6*w+0.4*g;
    var tp=null,td=null;T.forEach(function(t){if(t.lv===lv){tp=t.pct;td=t.d;}});
    mk.forEach(function(m){if((m.lv||"B1")===lv&&m.lg){var tot=0,ok=0;["lg","rd","au"].forEach(function(c){if(m[c]){ok+=m[c][0];tot+=m[c][1];}});if(tot){var pp=Math.round(ok/tot*100);if(tp==null||pp>tp){tp=pp;td=m.d?todayKey(new Date(m.d)):td;}}}});
    var q=E[lv].q,o=E[lv].o,Q=qs(q),O=qs(o),eq=Math.min(1,q[1]/60),eo=Math.min(1,o[1]/30);
    /* 身についている度合い：仮の値 0.75（重み0.5）に、材料を量の重みで足す */
    var K=(0.75*0.5+(Q!=null?Q*eq:0)+(O!=null?O*eo*0.8:0))/(0.5+(Q!=null?eq:0)+(O!=null?eo*0.8:0));
    var f0=cov*(0.6+0.4*K),Tt=tp==null?null:Math.min(1,tp/pass),f=Tt==null?f0:0.5*f0+0.5*Tt;
    f=p90Clamp(f,0,1);
    var st=(Tt!=null&&tp>=pass&&f>=0.8)?"reached":(f>=0.85?"almost":"working");
    out.push({lv:lv,f:f,cov:cov,K:K,w:w,g:g,Q:Q,O:O,nq:q[1],okq:q[0],no:o[1],oko:o[0],tp:tp,td:td,st:st,h0:prevH,h1:L[1],col:L[2],nW:by[lv][0],tW:by[lv][1],nG:cb[lv][0],tG:cb[lv][1]});prevH=L[1];
  });
  /* 位置（時間）：下から積み上げ。テストで「到達」と決まったレベルは満点として数える */
  var pos=0,gate=1;out.forEach(function(o){var fx=o.st==="reached"?1:o.f,ff=fx*gate;pos+=(o.h1-o.h0)*ff;gate=Math.min(gate,fx/0.8);o.eff=ff;});
  var cur=out.filter(function(o){return o.st!=="reached"&&pos<o.h1;})[0]||out.filter(function(o){return o.st!=="reached";})[0]||out[out.length-1];
  if(pos<cur.h0)pos=cur.h0;pos=Math.round(pos*10)/10;
  /* 確かさ：そのレベルの問題の数とテスト */
  var recent=cur.td&&(Date.now()-new Date(cur.td+"T00:00:00").getTime())<45*86400000;
  var conf=(cur.tp!=null&&recent&&cur.nq>=60)?"高め":((cur.nq>=40||cur.tp!=null)?"中":"低い"),spread={"高め":0.12,"中":0.25,"低い":0.4}[conf];
  /* 勉強した時間と、毎日の推定の記録 */
  var tot=0;try{tot=Math.round(p85Totals().s/3600*10)/10;}catch(_){}
  var H=p90Hist(pos,tot),fac=1,facN="";
  var ks=Object.keys(H).sort();if(ks.length>=2){var a=H[ks[0]],dl=tot-a[1],dp=pos-a[0];if(dl>=5&&dp>0.5){fac=p90Clamp(dl/dp,0.6,2);facN=Math.round(dl*10)/10+"時間の勉強で、位置が"+Math.round(dp*10)/10+"時間ぶん進みました";}}
  var remain0=Math.max(0,cur.h1-pos),remain=Math.round(remain0*fac),lo=Math.round(remain*(1-spread)),hi=Math.round(remain*(1+spread));
  var D=p85DaySecs(14),s=0;D.forEach(function(x){s+=x.s;});var pace=Math.round(s/60/14);
  var dayN=pace>0&&remain>0?Math.ceil(remain*60/pace):null;
  /* 昨日の推定とくらべる */
  var yk=ks.filter(function(k){return k<todayKey();}).slice(-1)[0],dy=null;
  if(yk&&H[yk][2]!=null&&H[yk][3]===cur.lv)dy=Math.round((remain-H[yk][2])*10)/10;
  var t=todayKey();if(H[t]){H[t][2]=remain;H[t][3]=cur.lv;}
  return {L:out,pos:Math.round(pos),cur:cur,remain:remain,lo:lo,hi:hi,fac:fac,facN:facN,pace:pace,dayN:dayN,conf:conf,logged:tot,dy:dy,hist:H,
    pct:Math.max(0,Math.min(100,Math.round((pos-cur.h0)/(cur.h1-cur.h0)*100)))};
}
/* 毎日の推定を残す（1日1件、今日の分は上書き。120日分） */
/* 2台の端末：毎日の推定は日付ごとに、勉強時間の多いほう */
if(typeof p85MergeP85==="function"){var _p90Merge=p85MergeP85;p85MergeP85=function(a,b){var o=_p90Merge.apply(this,arguments);try{var A=(a&&a.lvh)||{},B=(b&&b.lvh)||{},H={};
  [A,B].forEach(function(src){Object.keys(src).forEach(function(k){var r=src[k];if(Array.isArray(r)&&(!H[k]||(r[1]||0)>(H[k][1]||0)))H[k]=r;});});if(Object.keys(H).length)o.lvh=H;}catch(_){}return o;};}
function p90Hist(pos,tot){
  var S=settings.p85||(settings.p85={});if(!S.lvh||typeof S.lvh!=="object")S.lvh={};var H=S.lvh,t=todayKey(),old=H[t];
  H[t]=[Math.round(pos*10)/10,tot,old?old[2]:null,old?old[3]:null];
  var ks=Object.keys(H).sort();while(ks.length>120)delete H[ks.shift()];
  if(!old||Math.abs(old[0]-H[t][0])>=1||Math.abs(old[1]-tot)>=0.5){clearTimeout(P90.hs);P90.hs=setTimeout(function(){try{saveAll();}catch(_){}},1500);}
  return H;
}
/* 色つきの細い棒（A1 緑・A2 青・B1 紫、0〜700時間） */
function p90Bar(P,big){
  var h='<span class="p90-bar'+(big?" big":"")+'" aria-hidden="true">';
  P.L.forEach(function(o){var w=(o.h1-o.h0)/7,fill=Math.max(0,Math.min(1,(P.pos-o.h0)/(o.h1-o.h0)));
    h+='<span class="p90-seg" style="width:'+w+'%"><i style="width:'+Math.round(fill*100)+'%;background:'+o.col+'"></i></span>';});
  return h+'</span>';
}
function p90Line(where){
  if(typeof P47_LANG!=="undefined"&&P47_LANG!=="ru")return "";
  var P=null;try{P=p90Level();}catch(_){return "";}
  var rem=P.remain>0?'あと約'+P.remain+'時間':'到達';
  return '<button type="button" class="p90-line'+(where?" p90-"+where:"")+'" data-act="p90open" aria-label="いまの現在地 '+P.cur.lv+' '+P.pct+'%、'+P.cur.lv+'まで'+rem+'。くわしく見る">'+
    '<b style="color:'+P.cur.col+'">'+P.cur.lv+'</b><span class="p90-lt">'+P.pct+'%</span>'+p90Bar(P)+'<span class="p90-lr">'+P.cur.lv+'まで '+rem+'</span></button>';
}
window.p90LevelLine=p90Line;
/* 「今日は何分できる？」（その日まだ答えていないときだけ、ホームの1行がこれになる） */
function p90Ask(){
  var g=_p90Goal();
  return '<div class="p90-ask" role="group" aria-label="今日は何分できますか"><span>今日は何分できる？</span>'+P90_MINS.map(function(m){return '<button type="button" class="'+(m===g?"on":"")+'" data-act="p90min" data-val="'+m+'">'+m+'</button>';}).join("")+'</div>';
}
/* ホーム：大きなカードの時間の棒の下に1行だけ */
if(typeof renderHome==="function"){
  var _p90Home=renderHome;
  renderHome=function(){
    var h=String(_p90Home.apply(this,arguments));
    if(typeof P47_LANG==="undefined"||P47_LANG!=="ru")return h;
    try{var i=h.indexOf('<div class="p87-bar">');if(i<0)return h;var j=h.indexOf('</div>',i)+6;
      h=h.slice(0,j)+(p90Today()?p90Line("home"):p90Ask())+h.slice(j);}catch(_){}
    return h;
  };
}
/* 「このあと」シートの上：今日の時間と、組み立ての理由 */
var _p90HomeHtml=p85HomeHtml;
p85HomeHtml=function(){
  var h=_p90HomeHtml.apply(this,arguments);
  /* 15/30/60分の切りかえは「今日は何分できる？」に置きかえる（同じことを2か所で聞かない） */
  h=h.replace(/<div class="p85c-mins"[\s\S]*?<\/div>/,"");
  try{var m=p90Today(),F=P90.fit,box;
    if(!m)box='<div class="p90-plan">'+p90Ask()+'<p>答えると、AIコーチがその時間に合わせて今日の勉強を組み直します。</p></div>';
    else box='<div class="p90-plan"><div class="p90-ph"><b>今日は'+m+'分</b><span>組み立てた量：約'+(F?F.used:"—")+'分</span><button type="button" data-act="p90reask">変える</button></div>'+
      '<p>復習でウォームアップ → 頭を使うもの → 新しい言葉 → まぜた問題、の順です。'+(F&&F.note.length?F.note.join("。")+"。":"")+(F&&F.drop?"時間に入らない"+F.drop+"つは、今日は外しました。":"")+'</p>'+
      '<button type="button" class="p90-why" data-act="p90open">組み立て方の根拠と、いまの現在地 ›</button></div>';
    var k=h.indexOf('<div class="p81-box">');if(k<0)k=h.indexOf('<button type="button" class="p85c-wkb"');if(k>=0)h=h.slice(0,k)+box+h.slice(k);
  }catch(_){}
  return h;
};

/* ---------- 現在地のシート ---------- */
function p90Html(){
  var P=p90Level(),h='',ST={reached:["到達","ok"],almost:["ほぼ到達","warn"],working:["学習中",""]};
  h+='<div class="p90-now"><div><span>いまの現在地</span><b style="color:'+P.cur.col+'">'+P.cur.lv+' <small>'+P.pct+'%</small></b></div><div><span>'+P.cur.lv+'まで</span><b>'+(P.remain>0?'約'+P.remain+'<small>時間</small>':'到達')+'</b></div><div><span>このペースで</span><b>'+(P.remain<=0?'—':(P.dayN?'約'+P.dayN+'<small>日</small>':'—'))+'</b></div></div>';
  h+=p90Bar(P,true)+'<div class="p90-scale"><span>0</span><span style="left:'+(150/7)+'%">A1 150h</span><span style="left:'+(350/7)+'%">A2 350h</span><span style="right:0">B1 700h</span></div>';
  h+='<div class="p90-est"><p>'+(P.remain>0?P.cur.lv+'まで <b>約'+P.remain+'時間</b>（幅をみて'+P.lo+'〜'+P.hi+'時間）':P.cur.lv+'に到達しています')+(P.dy!=null&&P.dy!==0?'<span class="p90-dy '+(P.dy<0?"dn":"up")+'">昨日より '+(P.dy<0?'':'+')+P.dy+'時間</span>':'')+'</p>'+
    '<p class="p85c-fnote" style="margin:4px 0 0">推定の確かさ：<b>'+P.conf+'</b>。'+(P.conf==="低い"?'まだ材料が少ないので、幅を広くとっています。'+P.cur.lv+'の問題を解き、到達テストを受けると確かになります。':P.conf==="中"?'到達テストかミニ模試を受けると、もっと確かになります。':'最近のテストと、たくさんの問題の結果から出しています。')+
    ' いまの位置は学習時間に直すと約'+P.pos+'時間ぶんで、記録した勉強時間は'+P.logged+'時間です。'+(P.pace?'この14日の平均は1日'+P.pace+'分。':'')+'目安で、合格を約束するものではありません。</p></div>';
  if(P.hist&&Object.keys(P.hist).length>=2)h+=p90HistChart(P);
  h+='<div class="p85c-lsec"><b>レベルごとの判定</b>'+P.L.map(function(o){var st=(o.st==="working"&&o.f<0.05)?["これから",""]:ST[o.st],pc=function(x){return x==null?'—':Math.round(x*100)+'%';};
    return '<div class="p90-lv"><div class="p90-lvt"><b style="color:'+o.col+'">'+o.lv+'</b>'+(st[0]?'<em class="p90-st '+st[1]+'">'+st[0]+'</em>':'')+'<span>'+Math.round(o.f*100)+'%</span></div><span class="p90-one"><i style="width:'+Math.round(o.f*100)+'%;background:'+o.col+'"></i></span>'+
      '<details class="p90-why"><summary>内訳を見る</summary><dl>'+
      '<dt>学んだ範囲 '+pc(o.cov)+'</dt><dd>単語 '+o.nW+' / '+o.tW+'語（覚えている強さで重みづけ '+pc(o.w)+'）・ 文法書の章 '+o.nG+' / '+o.tG+'（'+pc(o.g)+'）</dd>'+
      '<dt>身についている度合い '+pc(o.K)+'</dt><dd>問題の正答率：'+(o.nq?Math.round(o.okq/o.nq*100)+'%（'+o.nq+'問）':'まだ')+'<br>話す・書く：'+(o.no?Math.round(o.oko/o.no*100)+'%（'+o.no+'文）':'まだ')+(o.nq+o.no<20?'<br><small>材料が少ないので、仮の値を多めに使っています。</small>':'')+'</dd>'+
      '<dt>テスト '+(o.tp!=null?o.tp+'%':'まだ')+'</dt><dd>'+(o.tp!=null?'到達テスト・ミニ模試のいちばん新しい結果（合格ライン66%）。'+(o.td?'（'+esc(String(o.td).slice(5).replace("-","/"))+'）':''):'到達テストかミニ模試を受けると、判定に入ります。')+'</dd>'+
      '<dt>判定</dt><dd>'+(o.st==="reached"?'テストが合格ラインを超え、達成度も80%以上なので「到達」です。':o.st==="almost"?'達成度は85%を超えています。到達テストで合格ライン（66%）を超えると「到達」になります。':'達成度が85%に届くと「ほぼ到達」、そのうえでテストが合格ラインを超えると「到達」です。')+'</dd></dl></details></div>';}).join("")+
    '<details class="p90-why p90-how"><summary>計算のしかた</summary><ol>'+
    '<li><b>学んだ範囲</b>＝単語60%＋文法書の章40%。単語は、復習の間隔が長い（よく覚えている）ほど重く数えます。章は、章の問題の正答率で重みづけします。</li>'+
    '<li><b>身についている度合い</b>＝問題の正答率（50%で0、90%以上で満点）と、話す・書く練習（瞬間作文を声や文字で答えた結果、3文作文の添削）。材料が少ないうちは仮の値（75%）を多めに使います。</li>'+
    '<li><b>達成度</b>＝学んだ範囲 ×（0.6＋0.4×身についている度合い）。到達テストかミニ模試があれば、その結果と半分ずつにします。</li>'+
    '<li><b>時間</b>：A1 約150・A2 約350・B1 約700時間の目安を下から積み上げます。下のレベルが8割に届くまでは、上のレベルを割り引きます。</li>'+
    '<li><b>あなたのペース</b>：毎日の推定を記録し、勉強時間が5時間以上たまったら、実際に進んだ速さで残り時間を補正します'+(P.facN?'（いまは'+P.facN+'。補正 ×'+(Math.round(P.fac*100)/100)+'）':'（まだ補正していません）')+'。</li></ol></details></div>';
  h+='<div class="p85c-lsec"><b>今日の勉強の組み立て方（根拠）</b><ul class="p85c-ltips">'+
    '<li><b>復習を先に、間をあけて</b>：同じ時間でも、間をあけて復習するほうが長く覚えています（Cepeda ほか 2006、分散学習の研究のまとめ）。復習の日は、単語ごとの記憶の強さから決めます。</li>'+
    '<li><b>読むより、思い出す</b>：読み返すより、問題を解いて思い出すほうが1週間後によく覚えています（Roediger & Karpicke 2006）。どの項目も、解く形にしています。</li>'+
    '<li><b>正答率を約85%に</b>：やさしすぎても難しすぎても伸びにくく、85%前後がいちばん効率がよいという研究があります（Wilson ほか 2019）。直近の正答率で、新しい言葉の量を増やしたり減らしたりします。</li>'+
    '<li><b>復習をためない</b>：復習の時期の言葉がたまっているときは、新しい言葉を控えめにします。</li>'+
    '<li><b>種類をまぜる</b>：同じ種類を続けるより、まぜて解くほうが本番で見分けられるようになります（Rohrer & Taylor 2007）。最後に、分野がまざった検定の10問を置きます。</li>'+
    '<li><b>短い日も0にしない</b>：10分しかない日は復習だけにします。続けることで、間をあけた復習がこわれません。</li></ul>'+
    '<p class="p85c-fnote">参考：ロシア語は、英語を話す人にとって「むずかしめ」の言語とされています（米国国務省の語学研修所 FSI の分類）。日本語を話す人にとっても、格の変化がある分、時間がかかります。</p></div>';
  h+='<div class="p85c-lsec"><b>外のAIで会話の練習</b><p class="p85c-fnote" style="margin-top:0">ChatGPT などに貼りつける、今日のあなた用の会話練習の文を作ります。</p><button type="button" class="p47-btn primary p85c-wide" data-act="p90talk">会話練習の文を作る</button></div>';
  return h;
}
/* 残り時間の移りかわり（毎日の推定。いまのレベルの日だけ） */
function p90HistChart(P){
  var ks=Object.keys(P.hist).sort().filter(function(k){var r=P.hist[k];return r[2]!=null&&r[3]===P.cur.lv;}).slice(-30);if(ks.length<2)return "";
  var v=ks.map(function(k){return P.hist[k][2];}),mx=Math.max.apply(null,v),mn=Math.min.apply(null,v),W=300,Hh=56,rg=Math.max(1,mx-mn);
  var pts=v.map(function(x,i){return [Math.round(i/(v.length-1)*W*10)/10,Math.round((4+(mx-x)/rg*(Hh-8))*10)/10];});
  return '<div class="p90-hist"><small>'+P.cur.lv+'までの残り時間（毎日の推定、'+ks.length+'日分）：'+v[0]+'時間 → '+v[v.length-1]+'時間</small><svg viewBox="0 0 '+W+' '+Hh+'" preserveAspectRatio="none" role="img" aria-label="残り時間の移りかわり"><polyline points="'+pts.map(function(p){return p.join(",");}).join(" ")+'" fill="none" stroke="'+P.cur.col+'" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg></div>';
}
function p90Open(){p85Sheet("いまの現在地",p90Html());}

/* ---------- 外のAIに貼る会話練習の文（毎日、進み具合で変わる） ---------- */
function p90Recent(days){var from=Date.now()/1000-days*86400,ids={};Object.keys(progress).forEach(function(id){var p=progress[id],w=WMAP[id];if(!w||!p||!p.status||p.status==="new")return;var t=p.firstSeen||p.lastReviewed||0;if(t>1e12)t/=1000;if(t>=from)ids[id]=1;});return Object.keys(ids);}
function p90Talk(){
  var P=p90Level(),lv=P.cur.lv,weak=[];try{weak=p85Weak().slice(0,3);}catch(_){}
  var known=[];Object.keys(progress).forEach(function(id){var p=progress[id],w=WMAP[id];if(w&&p&&p.status&&p.status!=="new")known.push(id);});
  var rec=p90Recent(3),fresh=false;if(rec.length<8)rec=known.slice(-20);
  if(rec.length<5){fresh=true;rec=[];try{VOCAB.forEach(function(w){if(rec.length<15&&w.level==="A1")rec.push(w.id);});}catch(_){}}
  var ww=[];try{ww=p85WeakWords().slice(0,6);}catch(_){}
  var cats={};rec.concat(ww).forEach(function(id){var c=(WMAP[id]||{}).category;if(c)cats[c]=(cats[c]||0)+1;});
  var cat=Object.keys(cats).sort(function(a,b){return cats[b]-cats[a];})[0]||"あいさつ";
  var scenes={"食べ物・飲み物":"カフェで注文する","場所・街":"道をたずねる","交通・方向":"駅で切符を買う","人・家族":"家族を紹介し合う","時間・曜日・月":"会う日と時間を決める","買い物":"店で買い物をする","数・時間":"値段や時間をたずねる"};
  var scene=scenes[cat]||("「"+cat+"」の言葉を使って、初めて会った人と話す");
  var wl=function(a){return a.slice(0,15).map(function(id){var w=WMAP[id];return w.word+"（"+w.meaning+"）";}).join("、");};
  var gr=weak.filter(function(b){return b.k[0]==="g";}).map(function(b){return p85KeyName(b.k);});
  var ch=null;try{var X=p85CState&&p85CState();if(X&&X.next)ch=p85ChName(X.next);}catch(_){}
  var lvTxt={A1:"CEFR A1（入門）",A2:"CEFR A2（初級）",B1:"CEFR B1（中級）"}[lv];
  var acc=p85Acc14();
  var t="あなたはロシア語の会話練習の相手です。わたしは日本語を話すロシア語の学習者で、いまのレベルは"+lvTxt+"くらいです。\n\n"+
    "# 今日の場面\n"+scene+"。あなたはロシア語を話す相手の役、わたしは日本から来た学習者の役です。\n\n"+
    "# 今日使いたい言葉（"+(fresh?"これから習うやさしい言葉":"最近習った言葉")+(ww.length?"と、よくまちがえる言葉":"")+"）\n"+wl(rec)+(ww.length?"\nよくまちがえる言葉："+wl(ww):"")+"\n\n"+
    ((gr.length||ch)?"# 今日意識したい文法\n"+(gr.length?"苦手："+gr.join("、")+"\n":"")+(ch?"いま学んでいる章："+ch+"\n":"")+"\n":"")+
    "# 進め方\n"+
    "1. ロシア語で短く1文ずつ話しかけてください。"+(lv==="A1"?"1文は8語くらいまで。":"")+"そのあとに（ ）で日本語訳をつけてください。\n"+
    "2. わたしが返事をしたら、まちがいがあれば正しい文を示し、どこがなぜちがうか（性・格・動詞の形など）を日本語で1〜2文で説明してください。正しければ、ひとことほめて次へ進んでください。\n"+
    "3. "+(acc!=null&&acc<75?"わたしは今、正答率が低めです。やさしい質問から始め、":"")+"上の言葉をなるべく使ってください。知らなそうな言葉には訳をつけてください。\n"+
    "4. 10往復したら終わりにして、わたしのまちがいを3つまでまとめ、言い直す練習の文を3つください。\n"+
    "5. 一度に質問は1つだけにしてください。\n\n"+
    "準備ができたら、最初のひとことを話しかけてください。";
  return {t:t,scene:scene,lv:lv};
}
function p90TalkHtml(){
  var T=p90Talk();
  return '<p class="p85c-fnote" style="margin-top:0">今日の場面：<b>'+esc(T.scene)+'</b>（'+T.lv+'）。最近習った言葉・よくまちがえる言葉・苦手な文法から、毎日作り直します。名前などの個人の情報は入りません。</p>'+
    '<textarea class="p90-ta" id="p90ta" readonly rows="12">'+esc(T.t)+'</textarea>'+
    '<div class="p85c-fbtn" style="margin-top:10px"><button type="button" class="p47-btn primary" data-act="p90copy">コピーする</button></div>'+
    '<p class="p85c-fnote">使い方：コピーして、ChatGPT や Claude などのチャットに貼りつけて送ります。声で話せるアプリなら、音声の会話モードで使うと「話す」練習になります。答えはロシア語で、わからないときは日本語でたずねてもかまいません。</p>';
}
function p90OpenTalk(){p85Sheet("会話練習の文",p90TalkHtml());}
async function p90Copy(){
  var ta=document.getElementById("p90ta");if(!ta)return;var ok=false;
  try{if(navigator.clipboard&&navigator.clipboard.writeText){await navigator.clipboard.writeText(ta.value);ok=true;}}catch(_){}
  if(!ok){try{ta.removeAttribute("readonly");ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);ok=document.execCommand("copy");ta.setAttribute("readonly","");}catch(_){}}
  toast(ok?"コピーしました。外のAIのチャットに貼りつけてください":"コピーできませんでした。文を長押しして選んでコピーしてください");
}
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;var a=el.getAttribute("data-act");
  if(["p90min","p90reask","p90open","p90talk","p90copy"].indexOf(a)<0)return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p90min"){var S=p85Set();S.today={d:todayKey(),min:+el.getAttribute("data-val")};try{saveAll();}catch(_){}
    var sh=document.getElementById("p87sheet");if(sh&&sh.className==="show"&&typeof p87Open==="function")p87Open();render();return;}
  if(a==="p90reask"){var S2=p85Set();delete S2.today;try{saveAll();}catch(_){}var sh2=document.getElementById("p87sheet");if(sh2&&sh2.className==="show"&&typeof p87Open==="function")p87Open();render();return;}
  if(a==="p90open"){var s3=document.getElementById("p87sheet");if(s3&&s3.className==="show"&&typeof p87Close==="function")p87Close();p90Open();return;}
  if(a==="p90talk"){p90OpenTalk();return;}
  if(a==="p90copy"){p90Copy();return;}
},true);
try{if(typeof P81_IC==='object'&&!P81_IC.chat)P81_IC.chat='<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>';}catch(_){}
/* 「このあと」シートの「ほかのやり方」に会話練習の入口 */
if(typeof p87PlanHtml==="function"){var _p90Plan87=p87PlanHtml;p87PlanHtml=function(){var h=_p90Plan87.apply(this,arguments);
  return h.replace(/(<\/div>)$/,'<button type="button" class="p81-row" data-act="p87go" data-val="p90talk"><span class="p81-ric">'+p81Ic("chat",20)+'</span><span class="p81-rtx"><b>外のAIで会話練習</b><small>ChatGPT などに貼る、今日のあなた用の文</small></span><span class="p81-rgo">'+p81Ic("go",16)+'</span></button></div>');};}
(function(){
  var css='.p90-line{display:flex;align-items:center;gap:7px;width:100%;border:0;background:none;color:var(--muted);font:inherit;padding:0;margin:-6px 0 12px;cursor:pointer;text-align:left;min-height:28px}.p90-line *{pointer-events:none}'+
    '.p90-line b{font-size:13px;font-weight:800}.p90-lt{font-size:12px;font-weight:700;color:var(--ink);font-variant-numeric:tabular-nums}.p90-lr{font-size:11.5px;white-space:nowrap;font-variant-numeric:tabular-nums}'+
    '.p90-bar{flex:1;min-width:40px;display:flex;gap:2px;height:6px}.p90-bar.big{height:12px;gap:3px;margin:14px 0 4px}.p90-seg{display:block;height:100%;border-radius:3px;background:var(--line);overflow:hidden}.p90-seg i{display:block;height:100%;border-radius:3px}'+
    '.p90-line.p90-trki{margin:0 0 12px;padding:9px 12px;border:1px solid var(--line);border-radius:12px;background:var(--card);min-height:40px}'+
    '.p90-ask{display:flex;align-items:center;gap:4px;margin:-6px 0 12px;flex-wrap:nowrap}.p90-ask>span{font-size:12px;font-weight:700;color:var(--muted);white-space:nowrap;margin-right:2px}'+
    '.p90-ask button{flex:1;min-width:0;min-height:32px;padding:0;border:1px solid var(--line);border-radius:8px;background:none;color:var(--ink);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer;font-variant-numeric:tabular-nums}.p90-ask button.on{border-color:var(--accent);color:var(--accent)}'+
    '@media(max-width:350px){.p90-ask>span{font-size:11px}.p90-lr{display:none}}'+
    '.p90-plan{margin:0 0 12px;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card)}.p90-plan .p90-ask{margin:0}.p90-plan p{font-size:12.5px;line-height:1.7;color:var(--muted);margin:8px 0 0}'+
    '.p90-ph{display:flex;align-items:baseline;gap:10px}.p90-ph b{font-size:15px}.p90-ph span{flex:1;font-size:12px;color:var(--muted)}.p90-ph button{border:0;background:none;color:var(--accent);font:inherit;font-size:13px;font-weight:700;padding:4px 0 4px 8px;min-height:32px;cursor:pointer}'+
    '.p90-why{display:block;border:0;background:none;color:var(--accent);font:inherit;font-size:12.5px;font-weight:700;padding:8px 0 0;cursor:pointer}'+
    '.p90-now{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.p90-now>div{min-width:0}.p90-now span{display:block;font-size:11.5px;color:var(--muted);font-weight:700}.p90-now b{display:block;font-size:24px;font-weight:800;line-height:1.2;font-variant-numeric:tabular-nums;white-space:nowrap}.p90-now b small{font-size:12px;font-weight:700;color:var(--muted);margin-left:1px}'+
    '.p90-scale{position:relative;height:16px;font-size:10.5px;color:var(--muted)}.p90-scale span{position:absolute;top:0;white-space:nowrap}.p90-scale span:nth-child(2),.p90-scale span:nth-child(3){transform:translateX(-50%)}'+
    '.p90-est{margin:10px 0 4px;padding:10px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card)}.p90-est>p:first-child{margin:0;font-size:14px;line-height:1.6}.p90-dy{display:inline-block;margin-left:8px;font-size:12px;font-weight:800;padding:1px 8px;border-radius:999px}.p90-dy.dn{color:#22A06B;background:color-mix(in srgb,#22A06B 12%,transparent)}.p90-dy.up{color:#C77700;background:color-mix(in srgb,#C77700 12%,transparent)}'+
    '.p90-st{font-style:normal;font-size:11.5px;font-weight:800;padding:0 8px;border-radius:999px;border:1px solid currentColor;margin-left:8px;color:var(--muted)}.p90-st.ok{color:#22A06B}.p90-st.warn{color:#C77700}.p90-lvt{align-items:center}.p90-lvt>span{margin-left:auto}'+
    '.p90-why{margin-top:6px}.p90-why summary{cursor:pointer;font-size:12.5px;font-weight:700;color:var(--accent);padding:4px 0;min-height:24px}.p90-why dl{margin:4px 0 0}.p90-why dt{font-size:12.5px;font-weight:800;margin-top:6px}.p90-why dd{margin:2px 0 0;font-size:12.5px;line-height:1.65;color:var(--muted)}.p90-how ol{margin:6px 0 0;padding-left:20px}.p90-how li{font-size:12.5px;line-height:1.7;color:var(--muted);margin:4px 0}.p90-how li b{color:var(--ink)}'+
    '.p90-hist{margin:10px 0 0}.p90-hist small{display:block;font-size:12px;color:var(--muted);margin-bottom:4px}.p90-hist svg{display:block;width:100%;height:64px}'+
    '.p90-lv{padding:8px 0}.p90-lvt{display:flex;justify-content:space-between;font-size:14px}.p90-lvt span{font-weight:800;font-variant-numeric:tabular-nums}.p90-one{display:block;height:8px;border-radius:4px;background:var(--line);overflow:hidden;margin:5px 0 4px}.p90-one i{display:block;height:100%;border-radius:4px}.p90-lv small{font-size:12px;color:var(--muted)}'+
    '.p90-ta{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--ink);font:inherit;font-size:13px;line-height:1.6;padding:10px 12px;resize:vertical}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
