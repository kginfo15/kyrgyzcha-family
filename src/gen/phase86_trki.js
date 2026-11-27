/* ===== Phase86：ТРКИ-1（B1）試験対策モード =====
   ・ホームの一覧の下に小さな入口（p86open）。押すと全画面の #p86 が開きます。
   ・できること
     1) 部門別の練習：語彙・文法（パート1〜4）／読解／聴解。問題は phase86_trki_data.js（すべてオリジナル）。
        まちがえた問題は、そのセッションの最後にもう一度出ます。2回続けて正解した問題を「できた」とします。
        次に出す問題は「まちがえたまま」→「まだ解いていない」→「1回だけ正解」→「できた（古い順）」の順に選びます。
     2) ミニ模試：本番を小さくした形（語彙・文法30問・読解2本・聴解2本、制限時間35分）。
        答えの説明は最後にまとめて出し、部門ごとの点を合格ライン66%と比べます。
   ・記録：settings.p86 = { q:{問題ID:[解いた回数, 続けて正解した回数, 最後に解いた時刻ms, まちがえたことがある1/0]},
                           mk:[{d:時刻ms, lg:[正解,問題数], rd:[…], au:[…], sec:かかった秒}] （新しい順・30件まで） }
     settings はほかの学習記録と同じく、端末（localStorage）とクラウドの両方に保存されます（saveAll）。
     1問ごとの記録は、AI学習コーチの coachLog があればそちらにも送ります（なくても動きます）。
   ・キルギス語版では動きません（ТРКИはロシア語の試験のため）。 */
(function(){
if(typeof P47_LANG!=="undefined"&&P47_LANG==="ky")return;
if(!window.P86_LG)return;

var PASS=66;                     /* 合格ライン（各部門 66%） */
var SEC={lg:"語彙・文法",rd:"読解",au:"聴解"};
var PART={1:"パート1　語の意味と使い分け",2:"パート2　名詞・代名詞の格",3:"パート3　動詞（体・移動・活用）",4:"パート4　文のつなぎ方"};
var MOCK={lg:{1:5,2:10,3:9,4:6},rd:2,au:2,min:35};

/* ---------- 問題に変わらないIDをつける（文から作るので、問題を足しても前の記録はずれない） ---------- */
function hash(s){var h=5381;s=String(s);for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36);}
var ITEMS=[];                    /* 1問ずつの一覧 {id,sec,part,q,txt?} */
P86_LG.forEach(function(q){ITEMS.push({id:"lg:"+q.p+":"+hash(q.s+"|"+q.a),sec:"lg",part:q.p,q:q});});
P86_RD.forEach(function(t){t.q.forEach(function(q,i){ITEMS.push({id:"rd:"+t.id+":"+i,sec:"rd",txt:t,q:q});});});
P86_AU.forEach(function(t){t.q.forEach(function(q,i){ITEMS.push({id:"au:"+t.id+":"+i,sec:"au",txt:t,q:q});});});

/* ---------- 記録 ---------- */
function rec(){if(!settings.p86||typeof settings.p86!=="object"||Array.isArray(settings.p86))settings.p86={};var r=settings.p86;
  /* 古い形・壊れた記録でも止まらないように整える */
  if(!r.q||typeof r.q!=="object"||Array.isArray(r.q))r.q={};
  if(!Array.isArray(r.mk))r.mk=[];
  r.mk=r.mk.filter(function(m){return m&&m.lg&&m.rd&&m.au;});return r;}
function st(id){var s=rec().q[id];return Array.isArray(s)&&s.length>=4?s:[0,0,0,0];}
function mastered(id){return st(id)[1]>=2;}
function save(){try{saveAll();}catch(_){}}
function mark(it,ok,sec){
  var r=rec(),s=st(it.id).slice();
  s[0]++;s[1]=ok?s[1]+1:0;s[2]=Date.now();if(!ok)s[3]=1;r.q[it.id]=s;save();
  /* AI学習コーチへの記録（ある場合だけ） */
  try{if(typeof coachLog==="function")coachLog({m:"trki",id:"trki:"+it.id,ok:ok?1:0,s:sec,g:["trki-"+it.sec].concat(it.part?["trki-p"+it.part]:[]),w:[]});}catch(_){}
}
/* 部門・パートごとの「できた」の数 */
function prog(f){var n=0,m=0,w=0;ITEMS.forEach(function(it){if(!f(it))return;n++;var s=st(it.id);if(s[1]>=2)m++;else if(s[0]&&s[1]===0)w++;});return {n:n,m:m,w:w};}

/* ---------- 出題の順番：まちがえたまま → 未回答 → 1回正解 → できた（古い順） ---------- */
function rank(it){var s=st(it.id);if(s[0]&&s[1]===0)return 0;if(!s[0])return 1;if(s[1]<2)return 2;return 3;}
function pick(list,n){
  var a=shuffle(list).map(function(it){return {it:it,r:rank(it),t:st(it.id)[2]};});
  a.sort(function(x,y){return x.r-y.r||(x.r===3?x.t-y.t:0);});
  return a.slice(0,n).map(function(x){return x.it;});
}
/* 読解・聴解は「文章1本」単位で選ぶ（できていない問いが多い文章から） */
function pickText(sec,n){
  var src=sec==="rd"?P86_RD:P86_AU;
  var a=shuffle(src).map(function(t){var its=ITEMS.filter(function(it){return it.txt===t;});var sc=0;its.forEach(function(it){sc+=rank(it)<3?(3-rank(it)):0;});return {t:t,its:its,sc:sc};});
  a.sort(function(x,y){return y.sc-x.sc;});
  var out=[];a.slice(0,n).forEach(function(x){out=out.concat(x.its);});return out;
}

/* ---------- 画面の状態 ---------- */
var V=null;   /* {view:"top"|"q"|"res", mode:"prac"|"mock", steps:[], pos, picked, ...} */
function el(){var m=document.getElementById("p86");if(!m){m=document.createElement("div");m.id="p86";document.body.appendChild(m);}return m;}
function open(){V={view:"top"};draw();}
function close(){stopTimer();try{window.speechSynthesis&&speechSynthesis.cancel();}catch(_){}var m=el();m.className="";m.innerHTML="";document.body.classList.remove("p70-noscroll","p86-on");V=null;try{render();}catch(_){}}
function ic(k,s){try{return p81Ic(k,s);}catch(_){return "";}}
function pct(a,b){return b?Math.round(a/b*100):0;}

/* ---------- トップ画面 ---------- */
function bar(p,line){return '<div class="p86-bar"><i style="width:'+Math.max(0,Math.min(100,p))+'%"></i>'+(line?'<u style="left:'+PASS+'%"></u>':'')+'</div>';}
function lastMock(){return rec().mk[0]||null;}
function topHtml(){
  var mk=lastMock(),h='';
  /* 見通しのカード */
  h+='<div class="p86-card"><div class="p86-ch">いまの見通し <small>合格ラインは各部門 '+PASS+'%</small></div>';
  ["lg","rd","au"].forEach(function(s){
    var p=prog(function(it){return it.sec===s;}),mp=mk&&mk[s]?pct(mk[s][0],mk[s][1]):null;
    h+='<div class="p86-row3"><div class="p86-rl"><b>'+SEC[s]+'</b><small>できた '+p.m+' / '+p.n+'問</small></div>'+
       '<div class="p86-rr">'+bar(pct(p.m,p.n))+'<span class="p86-mk">'+(mp===null?'模試 まだ':'模試 <b class="'+(mp>=PASS?"ok":"ng")+'">'+mp+'%</b>')+'</span></div></div>';
  });
  h+='<p class="p86-judge">'+judge(mk)+'</p></div>';
  /* ミニ模試 */
  h+='<button type="button" class="p86-big" data-act="p86mock"><span><b>ミニ模試を受ける</b><small>語彙・文法30問・読解2本・聴解2本／'+MOCK.min+'分</small></span>'+ic("go",18)+'</button>';
  /* 部門別の練習 */
  h+='<div class="p86-h">部門ごとに練習（まちがえた問題から先に出ます）</div><div class="p86-box">';
  [1,2,3,4].forEach(function(k){var p=prog(function(it){return it.sec==="lg"&&it.part===k;});
    h+=row("p86prac","lg"+k,PART[k],"できた "+p.m+" / "+p.n+(p.w?"　まちがえたまま "+p.w:""));});
  var pr=prog(function(it){return it.sec==="rd";}),pa=prog(function(it){return it.sec==="au";});
  h+=row("p86prac","rd","読解　文章を読んで3択","文章 "+P86_RD.length+"本・できた "+pr.m+" / "+pr.n+(pr.w?"　まちがえたまま "+pr.w:""));
  h+=row("p86prac","au","聴解　聞いて3択","音声 "+P86_AU.length+"本・できた "+pa.m+" / "+pa.n+(pa.w?"　まちがえたまま "+pa.w:""));
  var wn=ITEMS.filter(function(it){return rank(it)===0;}).length;
  if(wn)h+=row("p86prac","wrong","まちがえたままの問題だけ",wn+"問");
  h+='</div>';
  /* 模試の記録 */
  var L=rec().mk;
  if(L.length){h+='<div class="p86-h">ミニ模試の記録</div><div class="p86-box p86-hist">';
    L.slice(0,8).forEach(function(m){var d=new Date(m.d);
      h+='<div class="p86-hr"><span>'+(d.getMonth()+1)+'/'+d.getDate()+'</span>'+["lg","rd","au"].map(function(s){var p=m[s]?pct(m[s][0],m[s][1]):0;return '<em class="'+(p>=PASS?"ok":"ng")+'">'+SEC[s].slice(0,2)+' '+p+'%</em>';}).join("")+'</div>';});
    h+='</div>';}
  /* 本番の形の説明 */
  h+='<details class="p86-info"><summary>本番の ТРКИ-1 はどんな試験？</summary>'+
    '<p>ロシア語を母語としない人のための、ロシア政府の公式な検定です。ТРКИ-1 は B1（中級の入り口）にあたり、ロシアでの大学入学や仕事で求められることがあります。</p>'+
    '<table class="p86-t"><tr><th>部門</th><th>本番</th><th>このアプリ</th></tr>'+
    '<tr><td>語彙・文法</td><td>165問・60分</td><td>練習・模試</td></tr>'+
    '<tr><td>読解</td><td>文章3本・20問・50分（辞書可）</td><td>練習・模試</td></tr>'+
    '<tr><td>聴解</td><td>音声6本・30問・35分（1回だけ流れる）</td><td>練習・模試</td></tr>'+
    '<tr><td>作文</td><td>2題・60分</td><td>まだありません</td></tr>'+
    '<tr><td>会話</td><td>13問・約60分</td><td>まだありません</td></tr></table>'+
    '<p>5つの部門の<b>どれも66%以上</b>で合格です。1つだけ落ちたときは、その部門だけを受け直せます。</p>'+
    '<p>この画面の問題は、本番の形に合わせて書き下ろしたオリジナルです（本物の過去問ではありません）。単語はアプリの単語帳にある語だけを使っています。作文と会話は、いまは「その他の練習」のAI会話で補ってください。</p>'+
    '<p class="p86-mut">本番の形は公開されている試験の要項にもとづきます。最新の実施要項は、受験する試験会場で確かめてください。</p></details>';
  return h;
}
function row(act,val,t,sub){return '<button type="button" class="p86-r" data-act="'+act+'" data-val="'+val+'"><span><b>'+t+'</b><small>'+sub+'</small></span>'+ic("go",16)+'</button>';}
/* ひとことの判定 */
function judge(mk){
  var all=prog(function(){return true;});
  if(!mk)return all.m?'まずは1回、ミニ模試を受けて、いまの位置を確かめましょう。':'まずは部門ごとの練習を1つ解いてみるか、ミニ模試でいまの力を確かめましょう。';
  var low=["lg","rd","au"].filter(function(s){return !mk[s]||pct(mk[s][0],mk[s][1])<PASS;});
  if(!low.length)return '前回のミニ模試は<b>全部門で合格ライン以上</b>でした。もう1回続けて超えられたら、本番でも合格に近い力です。作文と会話の準備も始めましょう。';
  return '前回のミニ模試では <b>'+low.map(function(s){return SEC[s];}).join("・")+'</b> が合格ラインに届いていません。その部門の練習から始めるのが近道です。';
}

/* ---------- 問題を始める ---------- */
function startPrac(v){
  var steps;
  if(v==="rd"||v==="au")steps=pickText(v,1);
  else if(v==="wrong")steps=pick(ITEMS.filter(function(it){return rank(it)===0;}),10);
  else {var k=+v.slice(2);steps=pick(ITEMS.filter(function(it){return it.sec==="lg"&&it.part===k;}),10);}
  if(!steps.length){toast("問題がありません");return;}
  /* 読解・聴解は文章ごとにまとめ、問いの順番はそのまま */
  V={view:"q",mode:"prac",kind:v,steps:steps.map(function(it){return {it:it,opts:shuffle([it.q.a].concat(it.q.w))};}),pos:0,picked:null,ok:0,ng:0,again:{}};
  qStart();draw();
}
function startMock(){
  var steps=[];
  [1,2,3,4].forEach(function(k){steps=steps.concat(pick(ITEMS.filter(function(it){return it.sec==="lg"&&it.part===k;}),MOCK.lg[k]));});
  steps=steps.concat(pickText("rd",MOCK.rd)).concat(pickText("au",MOCK.au));
  V={view:"q",mode:"mock",steps:steps.map(function(it){return {it:it,opts:shuffle([it.q.a].concat(it.q.w))};}),pos:0,picked:null,ans:{},t0:Date.now(),end:Date.now()+MOCK.min*60000,plays:{}};
  startTimer();qStart();draw();
}

/* ---------- 1問ごとの時間（画面が隠れていた間は数えない、上限2分） ---------- */
var QT={t:0,hid:0,h0:0};
function qStart(){QT={t:Date.now(),hid:0,h0:document.hidden?Date.now():0};}
document.addEventListener("visibilitychange",function(){if(!QT.t)return;if(document.hidden)QT.h0=Date.now();else if(QT.h0){QT.hid+=Date.now()-QT.h0;QT.h0=0;}});
function qSec(){var hid=QT.hid+(QT.h0?Date.now()-QT.h0:0);return Math.max(0,Math.min(120,Math.round((Date.now()-QT.t-hid)/1000)));}

/* ---------- 模試の残り時間 ---------- */
var TM=null;
function startTimer(){stopTimer();TM=setInterval(function(){if(!V||V.mode!=="mock"||V.view!=="q"){stopTimer();return;}
  var e=document.getElementById("p86tm");var left=V.end-Date.now();
  if(left<=0){stopTimer();toast("時間になりました");finishMock();return;}
  if(e){e.textContent=mmss(left);e.classList.toggle("warn",left<5*60000);}},1000);}
function stopTimer(){if(TM){clearInterval(TM);TM=null;}}
function mmss(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+("0"+s%60).slice(-2);}

/* ---------- 問題の画面 ---------- */
function sentHtml(q,done,ok){
  var p=String(q.s).split("＿"),fill=done?'<span class="p71-blank '+(ok?"ok":"ng")+'">'+esc(q.a)+'</span>':'<span class="p71-blank">　　　</span>';
  return esc(p[0])+fill+esc(p.slice(1).join("＿"));
}
function full(q){return String(q.s).replace("＿",q.a);}
function textHtml(it,done){
  var t=it.txt,prac=V.mode==="prac";
  if(it.sec==="rd"){
    return '<div class="p86-txt"><div class="p86-tt">'+esc(t.t)+'</div><div class="p71-sent p86-body p86-rdb">'+esc(t.tx).replace(/\n/g,"<br>")+'</div>'+
      (prac?'<details class="p86-tr"><summary>日本語訳を見る</summary><p>'+esc(t.j).replace(/\n/g,"<br>")+'</p></details>':'')+'</div>';
  }
  /* 聴解：模試では2回まで（本番は1回）。答えたあとは本文も見られる */
  var used=V.mode==="mock"?(V.plays[t.id]||0):0,can=V.mode!=="mock"||used<2;
  var h='<div class="p86-txt"><div class="p86-tt">'+esc(t.t)+'</div><button type="button" class="p86-play" data-act="p86play"'+(can?'':' disabled')+'>'+
    '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><span>'+(V.playing?'再生中…':(V.mode==="mock"?(can?'聞く（あと'+(2-used)+'回）':'もう聞けません'):'聞く'))+'</span></button>'+
    (V.mode==="mock"?'<p class="p86-mut">本番は1回だけ流れます。ミニ模試では2回まで聞けます。</p>':'<p class="p86-mut">何回でも聞けます。慣れたら1回で答えてみましょう。</p>');
  if(done&&prac)h+='<details class="p86-tr"><summary>聞いた内容（ロシア語と訳）</summary><div class="p71-sent p86-body">'+t.ln.map(function(l){return (l[0]?'<b>'+esc(l[0])+'：</b>':'')+esc(l[1]);}).join("<br>")+'</div><p>'+esc(t.j).replace(/\n/g,"<br>")+'</p></details>';
  return h+'</div>';
}
function qHtml(){
  var x=V.steps[V.pos],it=x.it,q=it.q,prac=V.mode==="prac",done=prac&&V.picked!==null,ok=done&&V.picked===q.a;
  var sel=!prac?V.ans[V.pos]:null;
  var h='<div class="p86-tag">'+(x.again?'もう一度・':'')+SEC[it.sec]+(it.part?'　'+PART[it.part].split("　")[0]:'')+'</div>';
  if(it.sec==="lg"){
    h+='<div class="p86-paper"><div class="p71-sent p86-q">'+sentHtml(q,done,ok)+'</div>'+(q.h?'<div class="p86-hint">（'+esc(q.h)+'）を正しい形に</div>':'')+
      (prac?(done?'<div class="p86-ja">'+esc(q.j)+'</div>':'<details class="p86-tr p86-trs"><summary>訳を見る</summary><p>'+esc(q.j)+'</p></details>'):'')+
      (done?p71Spk(full(q)):'')+'</div>';
  }else{
    h+=textHtml(it,done)+'<div class="p86-paper"><div class="p71-sent p86-q">'+esc(q.q)+'</div>'+(prac?'<div class="p86-ja">'+esc(q.qj)+'</div>':'')+'</div>';
  }
  h+='<div class="p86-opts">'+x.opts.map(function(o,i){
    var c=done?(o===q.a?"right":(o===V.picked?"wrong":"dim")):(sel===o?"sel":"");
    return '<button type="button" class="p86-opt '+c+'" data-act="p86pick" data-val="'+i+'"><span class="p71-sent">'+esc(o)+'</span></button>';}).join("")+'</div>';
  if(done)h+='<div class="p86-exp"><p><b class="'+(ok?"ok":"ng")+'">'+(ok?'正解':'正解は '+esc(q.a))+'</b></p><p>'+esc(q.x)+'</p>'+(it.sec==="lg"?'<p class="p86-full">'+esc(full(q))+'</p>':'')+'</div>';
  return h;
}
function headHtml(){
  var n=V.steps.length,p=Math.min(V.pos+(V.view==="q"&&V.mode==="prac"&&V.picked!==null?1:0),n);
  return '<div class="p86-qh"><button type="button" class="p86-back" data-act="p86quit" aria-label="やめる">'+ic("x",18)+'</button>'+
    '<div class="p86-prog"><i style="width:'+pct(V.mode==="mock"?Object.keys(V.ans).length:p,n)+'%"></i></div>'+
    '<span class="p86-cnt">'+(V.pos+1)+' / '+n+'</span>'+(V.mode==="mock"?'<span id="p86tm" class="p86-tm">'+mmss(V.end-Date.now())+'</span>':'')+'</div>';
}
function footHtml(){
  var x=V.steps[V.pos];
  if(V.mode==="prac")return V.picked!==null?'<button type="button" class="p86-main" data-act="p86next">次へ</button>':'<div class="p86-wait">選んでください</div>';
  var last=V.pos>=V.steps.length-1;
  return '<div class="p86-nav"><button type="button" class="p86-sub" data-act="p86prev"'+(V.pos?'':' disabled')+'>前へ</button>'+
    (last?'<button type="button" class="p86-main" data-act="p86fin">採点する</button>':'<button type="button" class="p86-main" data-act="p86next">'+(V.ans[V.pos]!==undefined?'次へ':'あとで答える')+'</button>')+'</div>';
}

/* ---------- 結果 ---------- */
function resHtml(){
  var h='';
  if(V.mode==="mock"){
    var r=V.res,allOk=["lg","rd","au"].every(function(s){return pct(r[s][0],r[s][1])>=PASS;});
    h+='<div class="p86-done"><h3>ミニ模試の結果</h3><p>'+(allOk?'3部門とも合格ライン（'+PASS+'%）を超えました。':'合格ライン（'+PASS+'%）に届いていない部門があります。')+'</p></div><div class="p86-card">';
    ["lg","rd","au"].forEach(function(s){var p=pct(r[s][0],r[s][1]),need=Math.max(0,Math.ceil(r[s][1]*PASS/100)-r[s][0]);
      h+='<div class="p86-row3"><div class="p86-rl"><b>'+SEC[s]+'</b><small>'+r[s][0]+' / '+r[s][1]+'問</small></div><div class="p86-rr">'+bar(p,1)+'<span class="p86-mk"><b class="'+(p>=PASS?"ok":"ng")+'">'+p+'%</b></span></div></div>'+
        (need?'<p class="p86-need">'+SEC[s]+'はあと <b>'+need+'問</b> 正解すれば合格ラインです。</p>':'');});
    h+='<p class="p86-mut">かかった時間 '+mmss(r.sec*1000)+'　（本番は作文・会話もあり、それぞれ66%以上が必要です）</p></div>';
    var miss=V.steps.map(function(x,i){return {x:x,a:V.ans[i]};}).filter(function(o){return o.a!==o.x.it.q.a;});
    if(miss.length){h+='<div class="p86-h">まちがえた問題の説明（'+miss.length+'問）</div>';
      miss.forEach(function(o){var it=o.x.it,q=it.q;
        h+='<div class="p86-rv"><div class="p86-tag">'+SEC[it.sec]+'</div><div class="p71-sent p86-q">'+(it.sec==="lg"?esc(full(q)):esc(q.q))+'</div>'+
          '<p class="p86-ja">'+esc(it.sec==="lg"?q.j:q.qj)+(it.txt?'（'+esc(it.txt.t)+'）':'')+'</p>'+
          '<p>あなたの答え：<b class="ng">'+(o.a===undefined?'（答えていない）':esc(o.a))+'</b>　正解：<b class="ok">'+esc(q.a)+'</b></p><p>'+esc(q.x)+'</p></div>';});
    }else h+='<div class="p86-card"><p>全問正解です！</p></div>';
    h+='<button type="button" class="p86-big" data-act="p86home"><span><b>試験対策のトップへ</b><small>弱い部門の練習から続けましょう</small></span>'+ic("go",18)+'</button>';
    return h;
  }
  var tot=V.ok+V.ng,miss2=[],seen={};
  V.steps.forEach(function(x){if(V.again[x.it.id]&&!seen[x.it.id]){seen[x.it.id]=1;miss2.push(x.it);}});
  h+='<div class="p86-done"><h3>練習 おわり</h3><p>1回目で正解 '+V.ok+' / '+tot+'問</p></div>';
  if(miss2.length){h+='<div class="p86-h">見直しておきたい問題</div>';miss2.forEach(function(it){var q=it.q;
    h+='<div class="p86-rv"><div class="p71-sent p86-q">'+(it.sec==="lg"?esc(full(q)):esc(q.q)+'　→ <b>'+esc(q.a)+'</b>')+'</div><p class="p86-ja">'+esc(it.sec==="lg"?q.j:q.qj)+'</p></div>';});}
  else h+='<div class="p86-card"><p>全部1回目で正解です。</p></div>';
  h+='<div class="p86-nav2"><button type="button" class="p86-sub" data-act="p86home">トップへ</button><button type="button" class="p86-main" data-act="p86prac" data-val="'+V.kind+'">続けてもう1回</button></div>';
  return h;
}

/* ---------- 描く ---------- */
function draw(){
  var m=el();document.body.classList.add("p70-noscroll");try{p72PopClose();p72Theme();}catch(_){}
  var body,head,foot='';
  if(V.view==="top"){
    head='<div class="p86-th"><button type="button" class="p86-back" data-act="p86close" aria-label="もどる">‹</button><b>ТРКИ-1 試験対策</b><span class="p86-lv">B1</span></div>';
    body=topHtml();
  }else if(V.view==="q"){head=headHtml();body=qHtml();foot='<div class="p86-foot">'+footHtml()+'</div>';}
  else {head='<div class="p86-th"><button type="button" class="p86-back" data-act="p86home" aria-label="もどる">‹</button><b>ТРКИ-1 試験対策</b></div>';body=resHtml();}
  m.innerHTML='<div class="p86-wrap">'+head+'<div class="p86-scroll">'+body+'</div>'+foot+'</div>';
  m.className="show";document.body.classList.add("p86-on");
  try{p72Wrap(m);}catch(_){}
  var sc=m.querySelector(".p86-scroll"),key=V.view+"/"+(V.pos||0)+"/"+(V.picked!==null&&V.picked!==undefined?1:0);
  if(sc&&V._k!==key){if(!(V.view==="q"&&V.picked!==null&&V.mode==="prac"))sc.scrollTop=0;V._k=key;}
  if(V.view==="q"&&V.mode==="prac"&&V.picked!==null){var e=m.querySelector(".p86-exp");if(e)setTimeout(function(){try{e.scrollIntoView({block:"nearest"});}catch(_){}},30);}
}

/* ---------- 操作 ---------- */
function onPick(i){
  var x=V.steps[V.pos],o=x.opts[i];
  if(V.mode==="mock"){V.ans[V.pos]=o;draw();return;}
  if(V.picked!==null)return;
  V.picked=o;var ok=o===x.it.q.a;
  if(!x.again){if(ok)V.ok++;else V.ng++;mark(x.it,ok,qSec());}
  if(!ok&&!x.again){V.again[x.it.id]=1;V.steps.push({it:x.it,opts:shuffle(x.opts.slice()),again:1});}
  if(x.it.sec==="lg")try{speak(full(x.it.q));}catch(_){}
  draw();
}
function onNext(){
  hush();
  if(V.mode==="prac"){if(V.picked===null)return;V.pos++;V.picked=null;
    if(V.pos>=V.steps.length){V.view="res";draw();return;}qStart();draw();return;}
  if(V.pos<V.steps.length-1){V.pos++;qStart();draw();}
}
function finishMock(){
  stopTimer();hush();
  var r={lg:[0,0],rd:[0,0],au:[0,0]},na=Object.keys(V.ans).length;
  r.sec=Math.round((Date.now()-V.t0)/1000);
  /* 1問あたりの時間は、模試全体の時間を答えた問題の数で割ったもの（上限2分） */
  var per=na?Math.min(120,Math.round(r.sec/na)):0;
  V.steps.forEach(function(x,i){var ok=V.ans[i]===x.it.q.a;r[x.it.sec][1]++;if(ok)r[x.it.sec][0]++;
    /* 模試の答えも練習の記録に入れる（答えた問題だけ） */
    if(V.ans[i]!==undefined)mark(x.it,ok,per);});
  var R=rec();R.mk.unshift({d:Date.now(),lg:r.lg,rd:r.rd,au:r.au,sec:r.sec});R.mk=R.mk.slice(0,30);save();
  V.res=r;V.view="res";draw();
}
function hush(){if(V)V.playing=0;try{window.speechSynthesis&&speechSynthesis.cancel();}catch(_){}}
/* 聴解の再生：話し手ごとに1文ずつ、少し間をあけて読む */
function play(){
  var x=V.steps[V.pos],t=x.it.txt;if(!t||!t.ln||V.playing)return;
  if(V.mode==="mock"){var u=V.plays[t.id]||0;if(u>=2)return;V.plays[t.id]=u+1;}
  V.playing=1;draw();
  var i=0,me=V;
  (function nx(){
    if(V!==me||!V.playing)return;
    if(i>=t.ln.length){V.playing=0;draw();return;}
    var s=t.ln[i++][1];
    Promise.resolve(typeof speakUtterance==="function"?speakUtterance(s,"ru-RU"):(speak(s),new Promise(function(r){setTimeout(r,s.length*90);}))).then(function(){setTimeout(nx,450);});
  })();
}
function quit(){
  if(V.mode==="mock"&&V.view==="q"){
    if(!V.qc){V.qc=1;toast("もう一度押すと模試をやめます（記録は残りません）");setTimeout(function(){if(V)V.qc=0;},2500);return;}
  }
  stopTimer();V.playing=0;try{speechSynthesis.cancel();}catch(_){}V={view:"top"};draw();
}
document.addEventListener("click",function(e){
  var t=e.target.closest&&e.target.closest("[data-act]");if(!t)return;var a=t.getAttribute("data-act");
  if(a.indexOf("p86")!==0)return;
  e.stopImmediatePropagation();e.preventDefault();var v=t.getAttribute("data-val");
  if(a==="p86open"){open();return;}
  if(!V)return;
  if(a==="p86close")close();
  else if(a==="p86home"){stopTimer();V={view:"top"};draw();}
  else if(a==="p86prac")startPrac(v);
  else if(a==="p86mock")startMock();
  else if(a==="p86pick")onPick(+v);
  else if(a==="p86next")onNext();
  else if(a==="p86prev"){if(V.pos>0){hush();V.pos--;qStart();draw();}}
  else if(a==="p86fin"){var un=V.steps.length-Object.keys(V.ans).length;
    if(un&&!V.fc){V.fc=1;toast("答えていない問題が"+un+"問あります。もう一度押すと採点します");setTimeout(function(){if(V)V.fc=0;},2500);return;}
    finishMock();}
  else if(a==="p86play")play();
  else if(a==="p86quit")quit();
},true);
/* 文の読み上げボタン（p71say）は phase71 の処理が #p71 の外でも動かないことがあるので、ここでも受ける */
document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest('#p86 [data-act="p71say"]');if(!t)return;e.stopImmediatePropagation();e.preventDefault();try{speak(t.getAttribute("data-val"));}catch(_){}},true);

/* ---------- ホームの小さな入口 ---------- */
if(typeof p81List==="function"){
  var _list=p81List;
  p81List=function(){
    var h=_list.apply(this,arguments),mk=null,sub;
    try{mk=lastMock();}catch(_){}
    if(mk){var lo=Math.min(pct(mk.lg[0],mk.lg[1]),pct(mk.rd[0],mk.rd[1]),pct(mk.au[0],mk.au[1]));sub=lo>=PASS?"前回の模試：全部門 合格ライン以上":"前回の模試：いちばん低い部門 "+lo+"%";}
    else sub="検定の形の問題・ミニ模試";
    return h+'<button type="button" class="p86-ent" data-act="p86open"><span class="p86-eb">ТРКИ-1</span><span class="p86-et"><b>試験対策</b><small>'+sub+'</small></span>'+ic("go",15)+'</button>';
  };
}
/* 使い方のページにも1行 */
if(typeof p81GuideHtml==="function"){
  var _gh=p81GuideHtml;
  p81GuideHtml=function(){var h=_gh.apply(this,arguments);
    return h.replace('<div class="p81-tipbox">','<div class="p81-g"><div class="p81-gwho">ロシア語検定（ТРКИ-1・B1）に合格したい人</div><div class="p81-gmode"><b>試験対策</b></div><p>本番と同じ形のオリジナル問題を、部門ごと（語彙・文法・読解・聴解）に解きます。まちがえた問題は、2回続けて正解するまで何度も出ます。ミニ模試で、合格ライン66%まであと何問かが分かります。</p><button type="button" class="p81-gbtn" data-act="p81go" data-val="p86open">試験対策を開く '+ic("go",15)+'</button></div><div class="p81-tipbox">');};
}

/* ---------- 見た目 ---------- */
var css=document.createElement("style");css.textContent=
 '#p86{position:fixed;inset:0;z-index:150;background:var(--bg,#000);color:var(--ink);display:none}#p86.show{display:block}'+
 '.p86-wrap{height:100%;max-width:560px;margin:0 auto;display:flex;flex-direction:column}'+
 '.p86-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:4px 16px 24px}'+
 '.p86-th{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 16px 8px}.p86-th b{font-size:18px;flex:1}'+
 '.p86-lv{font-size:12px;font-weight:700;border:1px solid var(--line);border-radius:8px;padding:3px 8px;color:var(--muted)}'+
 '.p86-back{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
 '.p86-card{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px;margin:8px 0 12px}.p86-card p{font-size:14px;line-height:1.7;margin:6px 0 0}'+
 '.p86-ch{font-size:15px;font-weight:700;margin-bottom:6px}.p86-ch small{font-size:12px;font-weight:400;color:var(--muted);margin-left:6px}'+
 '.p86-row3{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.p86-row3:first-of-type{border-top:0}'+
 '.p86-rl{width:96px;flex:none;display:flex;flex-direction:column}.p86-rl b{font-size:14px}.p86-rl small{font-size:11.5px;color:var(--muted)}'+
 '.p86-rr{flex:1;min-width:0;display:flex;align-items:center;gap:8px}.p86-mk{flex:none;font-size:12px;color:var(--muted);min-width:66px;text-align:right}.p86-mk b{font-size:15px}'+
 '.p86-bar{position:relative;flex:1;height:8px;border-radius:4px;background:rgba(127,127,127,.22);overflow:visible}.p86-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:var(--accent)}.p86-bar u{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--ink);opacity:.55}'+
 '#p86 .ok{color:#2e9c5a}#p86 .ng{color:#d9534f}html.p72-dark #p86 .ok{color:#5fd08a}html.p72-dark #p86 .ng{color:#ff7b72}'+
 /* 短いお知らせ（toast）をこの画面の前に出す */
 'body.p86-on #toast{z-index:300}'+
 '.p86-judge{font-size:13.5px!important}'+
 '.p86-big{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1.5px solid var(--accent);background:var(--card);color:var(--ink);border-radius:14px;padding:12px 14px;font:inherit;cursor:pointer;margin:4px 0 0}.p86-big span{flex:1;display:flex;flex-direction:column}.p86-big b{font-size:16px}.p86-big small{font-size:12.5px;color:var(--muted)}.p86-big svg{color:var(--accent)}'+
 '.p86-h{font-size:13px;font-weight:700;color:var(--muted);margin:18px 4px 6px}'+
 '.p86-box{border:1px solid var(--line);background:var(--card);border-radius:14px;overflow:hidden}'+
 '.p86-r{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);font:inherit;padding:11px 12px 11px 14px;min-height:56px;cursor:pointer}.p86-r:first-child{border-top:0}.p86-r span{flex:1;display:flex;flex-direction:column;gap:1px}.p86-r b{font-size:15px}.p86-r small{font-size:12px;color:var(--muted)}.p86-r svg{color:var(--muted)}'+
 '.p86-hist{padding:4px 12px}.p86-hr{display:flex;align-items:center;gap:8px;font-size:13px;padding:8px 0;border-top:1px solid var(--line)}.p86-hr:first-child{border-top:0}.p86-hr span{width:44px;color:var(--muted)}.p86-hr em{font-style:normal;flex:1}'+
 '.p86-info{margin:18px 0 0;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px}.p86-info summary{font-size:14.5px;font-weight:700;cursor:pointer}.p86-info p{font-size:13.5px;line-height:1.75;margin:8px 0}'+
 '.p86-t{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0}.p86-t th,.p86-t td{text-align:left;padding:6px 4px;border-bottom:1px solid var(--line);vertical-align:top}'+
 '.p86-mut{font-size:12px!important;color:var(--muted)}'+
 /* 問題の画面 */
 '.p86-qh{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 16px 8px}.p86-qh .p86-back{font-size:16px}'+
 '.p86-prog{flex:1;height:6px;border-radius:3px;background:rgba(127,127,127,.22);overflow:hidden}.p86-prog i{display:block;height:100%;background:var(--accent)}'+
 '.p86-cnt{font-size:12.5px;color:var(--muted);flex:none}.p86-tm{flex:none;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;border:1px solid var(--line);border-radius:8px;padding:3px 7px}.p86-tm.warn{color:#d9534f;border-color:#d9534f}'+
 '.p86-tag{font-size:12.5px;font-weight:700;color:var(--muted);margin:6px 2px 8px}'+
 '.p86-paper{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:14px;position:relative}'+
 '.p86-q{font-size:19px;line-height:1.6;font-weight:600}.p86-hint{font-size:14px;color:var(--muted);margin-top:6px}.p86-ja{font-size:13.5px;color:var(--muted);margin-top:8px;line-height:1.6}'+
 '.p86-paper .p71-spk{position:absolute;right:8px;bottom:8px}'+
 '.p86-tr{margin-top:8px;font-size:13.5px}.p86-tr summary{color:var(--accent);cursor:pointer;font-weight:600}.p86-tr p{line-height:1.75;color:var(--muted);margin:6px 0 0}.p86-trs{margin-top:10px}'+
 '.p86-txt{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px;margin:0 0 10px}.p86-tt{font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:6px}'+
 '.p86-body{font-size:16.5px;line-height:1.85;font-weight:400}'+
 /* 読解の本文は画面の上半分ほどに収め、中だけスクロール（問いと選択肢がすぐ見えるように） */
 '.p86-rdb{max-height:40vh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-right:4px}'+
 '.p86-play{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;min-height:52px;border-radius:12px;border:1.5px solid var(--accent);background:none;color:var(--accent);font:inherit;font-size:16px;font-weight:700;cursor:pointer}.p86-play[disabled]{opacity:.45}'+
 '.p86-opts{display:flex;flex-direction:column;gap:8px;margin:12px 0 0}'+
 '.p86-opt{width:100%;text-align:left;min-height:52px;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:17px;cursor:pointer}'+
 '.p86-opt.sel{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}.p86-opt.right{border-color:#2e9c5a;background:rgba(46,156,90,.12)}.p86-opt.wrong{border-color:#d9534f;background:rgba(217,83,79,.12)}.p86-opt.dim{opacity:.5}'+
 '.p86-exp{margin:12px 0 0;border-left:3px solid var(--accent);background:var(--card);border-radius:0 12px 12px 0;padding:10px 14px}.p86-exp p{font-size:14.5px;line-height:1.75;margin:4px 0}.p86-exp b{font-size:16px}.p86-full{font-weight:600}'+
 '.p86-foot{padding:10px 16px calc(12px + env(safe-area-inset-bottom));border-top:1px solid var(--line);background:var(--bg)}'+
 '.p86-main{flex:1;width:100%;min-height:52px;border-radius:14px;border:0;background:var(--accent);color:#fff;font:inherit;font-size:16px;font-weight:700;cursor:pointer}'+
 '.p86-sub{flex:none;min-width:96px;min-height:52px;border-radius:14px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:15px;cursor:pointer}.p86-sub[disabled]{opacity:.4}'+
 '.p86-nav,.p86-nav2{display:flex;gap:10px}.p86-nav2{margin:16px 0 0}'+
 '.p86-wait{text-align:center;color:var(--muted);font-size:14px;min-height:52px;display:flex;align-items:center;justify-content:center}'+
 '.p86-done{text-align:center;margin:8px 0 6px}.p86-done h3{font-size:20px;margin:6px 0}.p86-done p{font-size:14px;color:var(--muted);margin:0}'+
 '.p86-need{font-size:13px!important;margin:0 0 6px!important}'+
 '.p86-rv{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:10px 14px;margin:0 0 8px}.p86-rv .p86-q{font-size:16px}.p86-rv p{font-size:13.5px;line-height:1.7;margin:4px 0}.p86-rv .p86-tag{margin:0 0 4px}'+
 /* ホームの入口（小さく1行） */
 '.p86-ent{display:flex;align-items:center;gap:10px;width:100%;margin:12px 0 0;border:1px dashed var(--line);background:none;color:var(--ink);border-radius:12px;padding:8px 12px;min-height:48px;font:inherit;text-align:left;cursor:pointer}'+
 '.p86-eb{flex:none;font-size:11.5px;font-weight:800;letter-spacing:.3px;color:var(--accent);border:1px solid var(--accent);border-radius:7px;padding:3px 6px}'+
 '.p86-et{flex:1;min-width:0;display:flex;flex-direction:column}.p86-et b{font-size:14px;font-weight:600}.p86-et small{font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.p86-ent svg{color:var(--muted)}';
document.head.appendChild(css);
})();
