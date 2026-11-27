/* ===== Phase86：ロシア語検定（ТРКИ）対策モード =====
   ・3つの検定レベル（やさしい順）：ТЭУ（入門・A1目安）→ ТБУ（基礎・A2目安）→ ТРКИ-1（第1レベル・B1目安）
   ・ホームの一覧の下に小さな入口（data-act="p86open"）。押すと全画面の #p86 が開きます。
   ・問題の種類（分野）
       ex 試験形式（語彙・文法）… phase86_trki_data.js の P86_LG（書き下ろし）
       vo 単語          … 単語帳の例文から自動で作る（その単語が辞書の形のまま出てくる例文だけ）
       gr 文法の形      … 瞬間作文の文から自動で作る（語の形を選ぶ）。ТРКИ-1 は B1 文法の練習問題 P82_Q も入る
       rd 読解          … P86_RD（書き下ろし）
       au 聴解（会話）  … P86_AU（書き下ろし、端末の声で読み上げ）
       hs 聴解（短い文）… 瞬間作文の文を聞いて意味を選ぶ（自動）
   ・覚え方の仕組み（間隔をあけた復習＋周回）
       正解すると 1日→3日→7日→14日→30日→60日 と間をあけて出し直す（段階 box 1〜6）。
       box が4以上（＝1週間あけても正解できた）を「定着」とする。まちがえると box=1（翌日にもう一度）。
       「周回」：分野の全問を1回ずつ解くと1周。次の周は、また最初の問題から順番に（文法書を何周も回すイメージ）。
       今日の練習は「復習の日が来た問題」→「いまの周でまだ解いていない問題（順番どおり）」の順に出す。
   ・記録：settings.p86 = {
       lv:"A1"|"A2"|"B1"（選んでいるレベル）,
       s:{問題ID:[解いた回数, 正解した回数, box, 次に出す日(日数), 最後に解いた日(日数)]},
       mk:[{lv, d:時刻ms, lg:[正解,問題数], rd:[…], au:[…], sec:秒}]（新しい順・30件）,
       q:{…}（前の版の記録。開いたときに s へ移します） }
     settings は、ほかの学習記録と同じく端末（localStorage）とクラウドの両方に保存されます（saveAll）。
     1問ごとの記録は AI学習コーチの coachLog にも送ります（なくても動きます）。
   ・キルギス語版では動きません（ТРКИ はロシア語の試験のため）。 */
(function(){
if(typeof P47_LANG!=="undefined"&&P47_LANG==="ky")return;
if(!window.P86_LG)return;

/* ---------- レベルの説明（やさしい順） ---------- */
var LV={
  A1:{code:"ТЭУ",name:"入門レベル",cefr:"A1",pass:66,passNote:"公開されている要項に合格の％が見つからなかったため、ほかのレベルと同じ66%を目安にしています。",
      exam:"文法・語彙 70問50分／聴解 25問30分／読解 30問／作文 1題40分／会話 3課題25分（公開されている練習用の要項より）",
      mock:{ex:10,vo:8,gr:7,rd:2,au:2,hs:4,min:30}},
  A2:{code:"ТБУ",name:"基礎レベル",cefr:"A2",pass:75,passNote:"公開されている要項では、各部門75%以上で合格です（1部門だけ70%でも可）。",
      exam:"文法・語彙 110問50分／読解 30問50分／聴解 30問30分／作文 2題50分／会話 50分（公開されている要項より）",
      mock:{ex:12,vo:9,gr:9,rd:2,au:2,hs:4,min:35}},
  B1:{code:"ТРКИ-1",name:"第1レベル",cefr:"B1",pass:66,passNote:"公開されている要項では、5つの部門それぞれ66%以上で合格です。",
      exam:"語彙・文法 165問60分／読解 20問50分／聴解 30問35分／作文 2題60分／会話 13問（公開されている要項より）",
      mock:{ex:18,vo:4,gr:8,rd:2,au:2,hs:0,min:35}}
};
var LVS=["A1","A2","B1"];
var SECN={ex:"試験形式（語彙・文法）",vo:"単語",gr:"文法の形",rd:"読解",au:"聴解（会話・アナウンス）",hs:"聴解（短い文）"};
var SECS={ex:"試験と同じ形の問題",vo:"例文の空所に入る単語を選ぶ",gr:"文に合う語の形（語尾）を選ぶ",rd:"文章を読んで3択",au:"会話やアナウンスを聞いて3択",hs:"短い文を聞いて意味を選ぶ"};
var CAT={ex:"lg",vo:"lg",gr:"lg",rd:"rd",au:"au",hs:"au"};   /* 模試の部門 */
var CATN={lg:"語彙・文法",rd:"読解",au:"聴解"};
var PART={1:"パート1　語の意味と使い分け",2:"パート2　名詞・代名詞の格",3:"パート3　動詞",4:"パート4　文のつなぎ方"};
var INT=[0,1,3,7,14,30,60];      /* box ごとの間隔（日） */
var SOLID=4;                     /* box がこれ以上で「定着」 */

function hash(s){var h=5381;s=String(s);for(var i=0;i<s.length;i++)h=((h<<5)+h+s.charCodeAt(i))|0;return (h>>>0).toString(36);}
function plain(s){return String(s||"").replace(/́/g,"");}
/* 過去形の語幹（был／была／было／были → был）。性・数だけがちがう過去形は、主語が я・ты だと両方正しくなるので選択肢にしない */
function pst(x){var m=low(x).match(/^(.+л)(а|о|и)?(ся|сь)?$/);return m?m[1]+(m[3]?"+":""):"";}
function low(s){return plain(s).toLowerCase().replace(/ё/g,"е");}
function lk(s){return plain(s).toLowerCase();}
function today(){var d=new Date();return Math.floor((d.getTime()-d.getTimezoneOffset()*60000)/86400000);}
/* 決まった順に選ぶための乱数（同じ問題はいつも同じまちがいの選択肢になる） */
function seeded(seed){var x=parseInt(hash(seed),36)||1;return function(){x=(x*1103515245+12345)&0x7fffffff;return x/0x7fffffff;};}

/* ---------- 問題の一覧を作る（最初に開いたときに1回だけ） ---------- */
var ITEMS=null,BYID={};
function add(it){if(BYID[it.id])return;BYID[it.id]=it;ITEMS.push(it);}
function build(){
  if(ITEMS)return;ITEMS=[];var n=0;
  /* ex：書き下ろしの試験形式（前の版と同じIDの付け方なので、記録はそのまま） */
  P86_LG.forEach(function(q){add({id:"lg:"+q.p+":"+hash(q.s+"|"+q.a),lv:q.lv||"B1",sec:"ex",part:q.p,t:"gap",s:q.s,h:q.h,j:q.j,a:q.a,w:q.w,x:q.x,ord:n++,hideJ:1});});
  /* rd・au：文章ごと */
  P86_RD.forEach(function(t){t.q.forEach(function(q,i){add({id:"rd:"+t.id+":"+i,lv:t.lv||"B1",sec:"rd",t:"q",txt:t,q:q.q,qj:q.qj,a:q.a,w:q.w,x:q.x,ord:n++});});});
  P86_AU.forEach(function(t){t.q.forEach(function(q,i){add({id:"au:"+t.id+":"+i,lv:t.lv||"B1",sec:"au",t:"q",txt:t,q:q.q,qj:q.qj,a:q.a,w:q.w,x:q.x,ord:n++});});});
  /* vo：単語帳の例文から */
  try{
    var pool={};
    VOCAB.forEach(function(w){var k=(w.level||"A1")+"|"+(w.pos||"");(pool[k]=pool[k]||[]).push(w);});
    VOCAB.forEach(function(w){
      if(!w.exRu||!w.exJa||!LV[w.level])return;var wd=plain(w.word);if(/\s/.test(wd))return;
      var ex=plain(w.exRu),re=new RegExp("(^|[^А-Яа-яЁё\\-])("+wd.replace(/[-]/g,"\\-")+")(?=$|[^А-Яа-яЁё\\-])","i"),m=ex.match(re);if(!m)return;
      var cand=(pool[w.level+"|"+(w.pos||"")]||[]).filter(function(o){return o!==w&&o.meaning!==w.meaning&&!/\s/.test(plain(o.word))&&low(o.word)!==low(wd)&&ex.toLowerCase().indexOf(low(o.word))<0;});
      if(cand.length<2)return;
      var r=seeded(w.id),d=[];while(d.length<2){var o=cand[Math.floor(r()*cand.length)];if(d.indexOf(o)<0)d.push(o);}
      var cap=/^[А-ЯЁ]/.test(m[2]);function fit(s){s=plain(s);return cap?s.charAt(0).toUpperCase()+s.slice(1):s.toLowerCase();}
      var s=ex.slice(0,m.index+m[1].length)+"＿"+ex.slice(m.index+m[0].length);
      add({id:"vo:"+w.id,lv:w.level,sec:"vo",t:"gap",s:s,j:w.exJa,a:fit(m[2]),w:d.map(function(o){return fit(o.word);}),
        x:fit(m[2])+"＝"+(/^「/.test(w.simpleExp||"")?w.simpleExp:"「"+w.meaning+"」。"+(w.simpleExp||"")),opt:d.map(function(o){return [fit(o.word),o.meaning];}),wid:w.id,ord:n++});
    });
  }catch(_){}
  /* gr・hs：瞬間作文の文から（ユニット1〜15＝入門、16〜27＝基礎、28〜＝第1レベル） */
  try{
    var F=(window.P58_FORMS&&P58_FORMS.f)||{},byUnit={};
    var lvOf=function(c){var u=parseInt(String(c.unit||"").replace(/[^0-9]/g,""),10)||0;return u<=15?"A1":u<=27?"A2":"B1";};
    COMPOSE.forEach(function(c){(byUnit[c.unit]=byUnit[c.unit]||[]).push(c);});
    COMPOSE.forEach(function(c){
      var lv=lvOf(c),ru=plain(c.ru||"");if(!ru||!c.ja)return;
      /* 形を選ぶ問題：辞書の形とちがう形で出てくる語（名詞・代名詞・動詞・形容詞）のうち、ほかの形が2つ以上あるもの */
      var bd=(c.breakdown||[]).filter(function(b){
        if(!/名詞|代名詞|動詞|形容詞/.test(b.pos||""))return false;
        var sf=lk(b.surface),bs=lk(b.base),fs=F[bs];if(!fs||sf===bs&&!/動詞/.test(b.pos))return false;
        return Object.keys(fs).filter(function(k){return k!==sf&&k.indexOf(" ")<0;}).length>=2;});
      if(bd.length){
        var b=bd[bd.length-1],sf=plain(b.surface),fs=Object.keys(F[lk(b.base)]).filter(function(k){return low(k)!==low(sf)&&k.indexOf(" ")<0&&!(/動詞/.test(b.pos)&&pst(k)&&pst(k)===pst(sf));});
        var r=seeded(c.id),d=[];while(d.length<2&&fs.length){var k=fs.splice(Math.floor(r()*fs.length),1)[0];d.push(k);}
        var re=new RegExp("(^|[^А-Яа-яЁё\\-])("+sf.replace(/[-]/g,"\\-")+")(?=$|[^А-Яа-яЁё\\-])"),m=ru.match(re);
        if(m&&d.length===2){
          var cap=/^[А-ЯЁ]/.test(sf);var fit=function(s){return cap?s.charAt(0).toUpperCase()+s.slice(1):s;};
          add({id:"gr:"+c.id,lv:lv,sec:"gr",t:"gap",s:ru.slice(0,m.index+m[1].length)+"＿"+ru.slice(m.index+m[0].length),h:plain(b.base),j:c.ja,a:sf,w:d.map(fit),
            x:(b.why||"")+(c.gEasy?"　"+c.gEasy:""),unit:c.unit,form:1,ord:n++});
        }
      }
      /* 短い文を聞く問題：同じユニットのほかの文の訳を、まちがいの選択肢にする */
      var same=(byUnit[c.unit]||[]).filter(function(o){return o!==c&&o.ja!==c.ja;});
      if(same.length>=2&&lv!=="B1"){
        var r2=seeded("h"+c.id),d2=[];while(d2.length<2){var o=same[Math.floor(r2()*same.length)];if(d2.indexOf(o.ja)<0)d2.push(o.ja);}
        add({id:"hs:"+c.id,lv:lv,sec:"hs",t:"hear",say:ru,q:"聞こえた文の意味は？",a:c.ja,w:d2,x:ru+"　"+(c.gEasy||""),ord:n++});
      }
    });
  }catch(_){}
  /* ТРКИ-1：B1 文法の章の練習問題（P82_Q：[文＿, 訳, 正解, 誤り[], 理由]） */
  try{if(window.P82_Q)Object.keys(P82_Q).forEach(function(t){P82_Q[t].forEach(function(q,i){
    add({id:"g82:"+t+":"+i,lv:"B1",sec:"gr",t:"gap",s:plain(q[0]),j:q[1],a:plain(q[2]),w:q[3].map(plain),x:q[4],ord:n++});});});}catch(_){}
}
function items(lv,sec){build();return ITEMS.filter(function(it){return it.lv===lv&&(!sec||it.sec===sec);});}

/* ---------- 記録 ---------- */
function rec(){
  if(!settings.p86||typeof settings.p86!=="object"||Array.isArray(settings.p86))settings.p86={};
  var r=settings.p86;
  if(!r.s||typeof r.s!=="object"||Array.isArray(r.s))r.s={};
  if(!Array.isArray(r.mk))r.mk=[];
  var p2=function(a){return Array.isArray(a)&&a.length===2&&isFinite(a[0])&&isFinite(a[1]);};
  r.mk=r.mk.filter(function(m){return m&&typeof m==="object"&&p2(m.lg)&&p2(m.rd)&&p2(m.au);});
  /* 壊れた記録（数値でない・長さが足りない）は捨てる */
  Object.keys(r.s).forEach(function(id){var v=r.s[id];
    if(!Array.isArray(v)||v.length<5||!v.slice(0,5).every(function(x){return typeof x==="number"&&isFinite(x);}))delete r.s[id];});
  if(!LV[r.lv])r.lv="A1";
  /* 前の版の記録（q：[回数, 続けて正解, 時刻, 誤答]）を s に移す */
  if(r.q&&typeof r.q==="object"){var t=today();Object.keys(r.q).forEach(function(id){var o=r.q[id];if(!Array.isArray(o)||r.s[id])return;
    var c=Math.max(0,o[1]|0),box=o[1]>=2?2:(o[1]>=1?1:1);r.s[id]=[o[0]|0,c,box,t,t];});delete r.q;}
  return r;
}
function st(id){var s=rec().s[id];return Array.isArray(s)&&s.length>=5?s:null;}
function save(){try{saveAll();}catch(_){}}
function mark(it,ok,sec){
  var r=rec(),t=today(),s=(st(it.id)||[0,0,0,t,t]).slice();
  /* 正解で箱が上がるのは「はじめて」か「復習の日が来た」ときだけ。同じ日に何周しても定着にはならない */
  var fresh=!s[0]||s[3]<=t;
  s[0]++;if(ok){s[1]++;if(fresh){s[2]=Math.min(INT.length-1,s[2]+1);s[3]=t+INT[s[2]];}}else{s[2]=1;s[3]=t+1;}s[4]=t;
  r.s[it.id]=s;save();
  try{if(typeof coachLog==="function")coachLog({m:"trki",id:"trki:"+it.id,ok:ok?1:0,s:sec,g:["trki-"+it.sec,"trki-"+it.lv].concat(it.part?["trki-p"+it.part]:[]),w:it.wid&&!ok?[it.wid]:[]});}catch(_){}
}
/* 状態：0=まだ 1=練習中 2=定着 */
function stat(it){var s=st(it.id);if(!s||!s[0])return 0;return s[2]>=SOLID?2:1;}
function due(it){var s=st(it.id);return !!(s&&s[0]&&s[3]<=today());}
function sum(list){var o={n:list.length,solid:0,learn:0,due:0};list.forEach(function(it){var k=stat(it);if(k===2)o.solid++;else if(k===1)o.learn++;if(due(it))o.due++;});return o;}
/* 周回：全問を1回ずつ解くと1周 */
function lap(list){if(!list.length)return {lap:1,done:0,n:0};var mn=1e9;list.forEach(function(it){var s=st(it.id);mn=Math.min(mn,s?s[0]:0);});
  var L=mn+1,d=0;list.forEach(function(it){var s=st(it.id);if((s?s[0]:0)>=L)d++;});return {lap:L,done:d,n:list.length};}

/* ---------- 出題の順番 ---------- */
/* 復習の日が来た問題（日付の古い順・まちがえたものを先に）→ いまの周でまだの問題（順番どおり） */
function queue(list,n){
  var t=today(),rv=list.filter(due).sort(function(a,b){var x=st(a.id),y=st(b.id);return (x[2]-y[2])||(x[3]-y[3]);});
  var L=lap(list).lap,nx=list.filter(function(it){var s=st(it.id);return (s?s[0]:0)<L&&!due(it);}).sort(function(a,b){return a.ord-b.ord;});
  var nr=Math.min(rv.length,Math.max(Math.ceil(n*0.7),n-nx.length));
  return rv.slice(0,nr).concat(nx.slice(0,n-nr));
}
/* 読解・聴解（会話）は文章ごと：問いの1つでも復習の日・未回答があれば、その文章を出す */
function textQueue(list,k){
  var groups=[],seen={};list.forEach(function(it){if(!seen[it.txt.id]){seen[it.txt.id]=1;groups.push(list.filter(function(x){return x.txt===it.txt;}));}});
  var L=lap(list).lap;
  groups.sort(function(a,b){function sc(g){var d=g.filter(due).length,u=g.filter(function(it){var s=st(it.id);return (s?s[0]:0)<L;}).length;return d*10+u;}return sc(b)-sc(a)||a[0].ord-b[0].ord;});
  var out=[];groups.slice(0,k).forEach(function(g){out=out.concat(g);});return out;
}

/* ---------- 画面の状態 ---------- */
var V=null;
function el(){var m=document.getElementById("p86");if(!m){m=document.createElement("div");m.id="p86";document.body.appendChild(m);}return m;}
function open(){build();rec();V={view:"top"};draw();}
function close(){stopTimer();hush();var m=el();m.className="";m.innerHTML="";document.body.classList.remove("p70-noscroll","p86-on");V=null;try{render();}catch(_){}}
function ic(k,s){try{return p81Ic(k,s);}catch(_){return "";}}
function pct(a,b){return b?Math.round(a/b*100):0;}
function curLv(){return rec().lv;}

/* ---------- トップ画面 ---------- */
function sbar(o){var a=pct(o.solid,o.n),b=pct(o.learn,o.n);return '<div class="p86-sbar"><i class="s" style="width:'+a+'%"></i><i class="l" style="width:'+b+'%"></i></div>';}
function lastMock(lv){var L=rec().mk;for(var i=0;i<L.length;i++)if((L[i].lv||"B1")===lv)return L[i];return null;}
function topHtml(){
  var lv=curLv(),L=LV[lv],all=items(lv),o=sum(all),h='';
  /* レベルを選ぶ（やさしい順） */
  h+='<div class="p86-lvs" role="tablist">'+LVS.map(function(k,i){var x=LV[k];return '<button type="button" class="p86-lvb'+(k===lv?" on":"")+'" data-act="p86lv" data-val="'+k+'"><small>'+(i===0?"いちばんやさしい":i===1?"ふつう":"むずかしい")+'</small><b>'+x.code+'</b><span>'+x.name+'・'+x.cefr+'</span></button>';}).join('<i class="p86-arw">›</i>')+'</div>';
  /* 進み具合 */
  h+='<div class="p86-card"><div class="p86-big2"><div><b>'+pct(o.solid,o.n)+'<small>%</small></b><span>定着</span></div><div class="p86-nums"><p><i class="dot s"></i>定着 <b>'+o.solid+'</b>問</p><p><i class="dot l"></i>練習中 <b>'+o.learn+'</b>問</p><p><i class="dot n"></i>まだ <b>'+(o.n-o.solid-o.learn)+'</b>問</p><p class="p86-mut">解いた問題 '+(o.solid+o.learn)+' / '+o.n+'（'+pct(o.solid+o.learn,o.n)+'%）</p></div></div>'+sbar(o)+
     '<p class="p86-judge">'+judge(lv,o)+'</p></div>';
  /* 今日の練習 */
  h+='<button type="button" class="p86-big" data-act="p86today"><span><b>今日の10問</b><small>'+(o.due?'復習 '+o.due+'問を先に、そのあと続きから':'続きから順番に')+'</small></span>'+ic("go",18)+'</button>';
  /* 分野ごと */
  h+='<div class="p86-h">分野ごとに練習（何周でも回せます）</div><div class="p86-box">';
  ["ex","vo","gr","rd","au","hs"].forEach(function(s){var li=items(lv,s);if(!li.length)return;var so=sum(li),lp=lap(li);
    h+='<button type="button" class="p86-r" data-act="p86prac" data-val="'+s+'"><span><b>'+SECN[s]+'</b><small>'+lp.lap+'周目 '+lp.done+' / '+lp.n+'　・　定着 '+pct(so.solid,so.n)+'%'+(so.due?'　・　<em>復習 '+so.due+'</em>':'')+'</small>'+sbar(so)+'</span>'+ic("go",16)+'</button>';});
  h+='</div>';
  /* 模試 */
  var m=lastMock(lv),M=L.mock;
  h+='<div class="p86-h">ミニ模試（本番を小さくした形・'+M.min+'分）</div><button type="button" class="p86-big p86-big2b" data-act="p86mock"><span><b>'+L.code+' のミニ模試を受ける</b><small>'+(m?'前回：'+["lg","rd","au"].map(function(c){var p=pct(m[c][0],m[c][1]);return CATN[c]+' '+p+'%';}).join('・'):'まだ受けていません')+'</small></span>'+ic("go",18)+'</button>';
  var ms=rec().mk.filter(function(x){return (x.lv||"B1")===lv;});
  if(ms.length>1){h+='<div class="p86-box p86-hist">';ms.slice(0,6).forEach(function(x){var d=new Date(x.d);
    h+='<div class="p86-hr"><span>'+(d.getMonth()+1)+'/'+d.getDate()+'</span>'+["lg","rd","au"].map(function(c){var p=pct(x[c][0],x[c][1]);return '<em class="'+(p>=L.pass?"ok":"ng")+'">'+CATN[c].slice(0,2)+' '+p+'%</em>';}).join("")+'</div>';});h+='</div>';}
  /* 説明 */
  h+='<details class="p86-info"><summary>覚え方のしくみ</summary>'+
    '<p><b>周回</b>　分野ごとに、全部の問題を順番に1回ずつ解くと「1周」です。終わったら2周目、3周目…と、文法書を何度も読み返すように回します。</p>'+
    '<p><b>間隔をあけた復習</b>　正解した問題は、<b>1日後→3日後→1週間後→2週間後→1か月後→2か月後</b>と、だんだん間をあけてもう一度出ます。まちがえた問題は、その回の最後と次の日にもう一度出ます。</p>'+
    '<p><b>定着</b>　1週間あけても正解できた問題を「定着」と数えます。全部の分野の定着が増え、ミニ模試で合格ラインを2回続けて超えたら、本番でも合格に近い力です。</p>'+
    '<p><b>今日の10問</b>　復習の日が来た問題を先に、そのあと続きの問題を出します。迷ったらこれを毎日押すだけで大丈夫です。</p></details>';
  h+='<details class="p86-info"><summary>検定のレベルと '+L.code+' の試験</summary>'+
    '<p>ロシア語検定（ТРКИ）は、ロシア政府の公式な検定です。やさしい順に <b>ТЭУ（入門・A1目安）→ ТБУ（基礎・A2目安）→ ТРКИ-1（第1レベル・B1目安）</b> → ТРКИ-2〜4 と上がります。「第1レベル」は一番下ではなく、下から3番目なので注意してください。</p>'+
    '<p><b>'+L.code+'（'+L.name+'）</b>　'+L.exam+'。</p>'+
    '<p><b>合格ライン</b>　'+L.passNote+'</p>'+
    '<p>このアプリの問題は、本番の形に合わせて書き下ろしたものと、アプリの単語帳・瞬間作文から自動で作ったものです（本物の過去問ではありません）。作文と会話の部門はまだありません。「その他の練習」のAI会話で補ってください。</p>'+
    '<p class="p86-mut">試験の形は公開されている要項にもとづく目安です。最新の実施要項は、受験する試験会場で確かめてください。</p></details>';
  return h;
}
function judge(lv,o){
  var L=LV[lv],m=lastMock(lv);
  if(!o.solid&&!o.learn)return 'まずは「今日の10問」から始めましょう。'+L.code+' は'+(lv==="A1"?"いちばんやさしいレベルです。":"前のレベルが終わってからがおすすめです。");
  if(!m)return '練習が進んだら、ミニ模試でいまの位置を確かめましょう（合格ライン '+L.pass+'%）。';
  var low=["lg","rd","au"].filter(function(c){return pct(m[c][0],m[c][1])<L.pass;});
  if(!low.length)return '前回のミニ模試は<b>全部門で合格ライン（'+L.pass+'%）以上</b>でした。もう1回続けて超えられたら、本番でも合格に近い力です。';
  return '前回のミニ模試では <b>'+low.map(function(c){return CATN[c];}).join("・")+'</b> が合格ライン（'+L.pass+'%）に届いていません。その分野の練習を多めにしましょう。';
}

/* ---------- 始める ---------- */
function steps(list){return list.map(function(it){return {it:it,opts:shuffle([it.a].concat(it.w))};});}
function startPrac(sec){
  var lv=curLv(),list;
  if(sec==="today"){
    /* 復習の日が来た問題を全分野から → 足りなければ単語・文法・試験形式の続き */
    var all=items(lv).filter(function(it){return it.sec!=="rd"&&it.sec!=="au";});
    list=queue(all.filter(due),7);
    var rest=10-list.length,secs=["ex","gr","vo","hs"],i=0;
    while(rest>0&&i<20){var s=secs[i%secs.length];var nx=queue(items(lv,s).filter(function(it){return list.indexOf(it)<0&&!due(it);}),1);if(nx.length){list.push(nx[0]);rest--;}i++;}
  }else if(sec==="rd"||sec==="au")list=textQueue(items(lv,sec),1);
  else list=queue(items(lv,sec),10);
  if(!list.length){toast("問題がありません");return;}
  V={view:"q",mode:"prac",kind:sec,steps:steps(list),pos:0,picked:null,ok:0,ng:0,again:{}};
  qStart();draw();
}
function startMock(){
  var lv=curLv(),M=LV[lv].mock,list=[];
  /* 試験形式はパートごとに均等に */
  var ex=items(lv,"ex"),per=Math.ceil(M.ex/4);
  [1,2,3,4].forEach(function(p){list=list.concat(shuffle(ex.filter(function(it){return it.part===p;})).slice(0,per));});
  list=list.slice(0,M.ex);
  list=list.concat(shuffle(items(lv,"vo")).slice(0,M.vo)).concat(shuffle(items(lv,"gr")).slice(0,M.gr));
  list=list.concat(textQueue(shuffle(items(lv,"rd")),M.rd)).concat(textQueue(shuffle(items(lv,"au")),M.au)).concat(shuffle(items(lv,"hs")).slice(0,M.hs));
  if(!list.length){toast("問題がありません");return;}
  V={view:"q",mode:"mock",lv:lv,steps:steps(list),pos:0,picked:null,ans:{},t0:Date.now(),end:Date.now()+M.min*60000,plays:{}};
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
  var e=document.getElementById("p86tm"),left=V.end-Date.now();
  if(left<=0){stopTimer();toast("時間になりました");finishMock();return;}
  if(e){e.textContent=mmss(left);e.classList.toggle("warn",left<5*60000);}},1000);}
function stopTimer(){if(TM){clearInterval(TM);TM=null;}}
function mmss(ms){var s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+":"+("0"+s%60).slice(-2);}

/* ---------- 問題の画面 ---------- */
function gapHtml(it,done,ok){
  var p=String(it.s).split("＿"),fill=done?'<span class="p71-blank '+(ok?"ok":"ng")+'">'+esc(it.a)+'</span>':'<span class="p71-blank">　　　</span>';
  return esc(p[0])+fill+esc(p.slice(1).join("＿"));
}
function full(it){return String(it.s).replace("＿",it.a);}
function textHtml(it,done){
  var t=it.txt,prac=V.mode==="prac";
  if(it.sec==="rd")return '<div class="p86-txt"><div class="p86-tt">'+esc(t.t)+'</div><div class="p71-sent p86-body p86-rdb">'+esc(t.tx).replace(/\n/g,"<br>")+'</div>'+
      (prac?'<details class="p86-tr"><summary>日本語訳を見る</summary><p>'+esc(t.j).replace(/\n/g,"<br>")+'</p></details>':'')+'</div>';
  var key=t.id,h='<div class="p86-txt"><div class="p86-tt">'+esc(t.t)+'</div>'+playBtn(key)+
    (done&&prac?'<details class="p86-tr"><summary>聞いた内容（ロシア語と訳）</summary><div class="p71-sent p86-body">'+t.ln.map(function(l){return (l[0]?'<b>'+esc(l[0])+'：</b>':'')+esc(l[1]);}).join("<br>")+'</div><p>'+esc(t.j).replace(/\n/g,"<br>")+'</p></details>':'');
  return h+'</div>';
}
/* 聴解の再生ボタン：模試では2回まで（本番は2回流れるレベルと1回のレベルがある） */
function playBtn(key){
  var used=V.mode==="mock"?(V.plays[key]||0):0,can=V.mode!=="mock"||used<2;
  return '<button type="button" class="p86-play" data-act="p86play"'+(can?'':' disabled')+'><svg viewBox="0 0 24 24" width="22" height="22"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><span>'+
    (V.playing?'再生中…':(V.mode==="mock"?(can?'聞く（あと'+(2-used)+'回）':'もう聞けません'):'聞く'))+'</span></button>'+
    '<p class="p86-mut">'+(V.mode==="mock"?'ミニ模試では2回まで聞けます。':'何回でも聞けます。慣れたら1〜2回で答えてみましょう。')+'</p>';
}
function qHtml(){
  var x=V.steps[V.pos],it=x.it,prac=V.mode==="prac",done=prac&&V.picked!==null,ok=done&&V.picked===it.a,sel=!prac?V.ans[V.pos]:null;
  var tag=(x.again?'もう一度・':'')+SECN[it.sec]+(it.part?'　'+PART[it.part].split("　")[0]:'')+(prac&&!x.again&&due(it)?'　<em class="p86-rv1">復習</em>':'');
  var h='<div class="p86-tag">'+tag+'</div>';
  if(it.t==="gap"){
    h+='<div class="p86-paper"><div class="p71-sent p86-q">'+gapHtml(it,done,ok)+'</div>'+(it.h?'<div class="p86-hint">（'+esc(it.h)+'）を正しい形に</div>':'')+
      (prac?(done||!it.hideJ?'<div class="p86-ja">'+esc(it.j)+'</div>':'<details class="p86-tr p86-trs"><summary>訳を見る</summary><p>'+esc(it.j)+'</p></details>'):(!it.hideJ&&it.j?'<div class="p86-ja">'+esc(it.j)+'</div>':''))+
      (done?p71Spk(full(it)):'')+'</div>';
  }else if(it.t==="hear"){
    h+='<div class="p86-txt">'+playBtn(it.id)+(done?'<div class="p71-sent p86-body">'+esc(it.say)+'</div>':'')+'</div><div class="p86-paper"><div class="p86-q p86-qj">'+esc(it.q)+'</div></div>';
  }else{
    h+=textHtml(it,done)+'<div class="p86-paper"><div class="p71-sent p86-q">'+esc(it.q)+'</div>'+(prac?'<div class="p86-ja">'+esc(it.qj)+'</div>':'')+'</div>';
  }
  var ja=it.t==="hear";
  h+='<div class="p86-opts">'+x.opts.map(function(o,i){
    var c=done?(o===it.a?"right":(o===V.picked?"wrong":"dim")):(sel===o?"sel":"");
    return '<button type="button" class="p86-opt '+c+(ja?' ja':'')+'" data-act="p86pick" data-val="'+i+'"><span'+(ja?'':' class="p71-sent"')+'>'+esc(o)+'</span></button>';}).join("")+'</div>';
  if(done)h+='<div class="p86-exp">'+expHtml(it,ok)+'</div>';
  return h;
}
/* 解説：正解の理由＋ほかの選択肢がなぜちがうか（単語＝意味、形＝形の名前） */
function expHtml(it,ok){
  var h='<p><b class="'+(ok?"ok":"ng")+'">'+(ok?'正解':'正解は '+esc(it.a))+'</b></p><p>'+esc(it.x||"")+'</p>';
  if(it.opt)h+='<p class="p86-oth">ほかの選択肢：'+it.opt.map(function(o){return '<b>'+esc(o[0])+'</b>＝'+esc(o[1]);}).join("、")+'</p>';
  else if(it.form){var lab=it.w.map(function(o){var f="";try{var r=p72Look(o);f=r&&r.form?r.form:"";}catch(_){}return '<b>'+esc(o)+'</b>'+(f?'（'+esc(f)+'）':'');});
    var fa="";try{var r=p72Look(it.a);fa=r&&r.form?r.form:"";}catch(_){}
    h+='<p class="p86-oth">'+(fa?'正解の形：<b>'+esc(it.a)+'</b>（'+esc(fa)+'）　':'')+'ほかの形：'+lab.join("、")+'</p>';}
  if(it.t==="gap")h+='<p class="p86-full">'+esc(full(it))+'</p>';
  return h;
}
function headHtml(){
  var n=V.steps.length,p=Math.min(V.pos+(V.mode==="prac"&&V.picked!==null?1:0),n);
  return '<div class="p86-qh"><button type="button" class="p86-back" data-act="p86quit" aria-label="やめる">'+ic("x",18)+'</button>'+
    '<div class="p86-prog"><i style="width:'+pct(V.mode==="mock"?Object.keys(V.ans).length:p,n)+'%"></i></div>'+
    '<span class="p86-cnt">'+(V.pos+1)+' / '+n+'</span>'+(V.mode==="mock"?'<span id="p86tm" class="p86-tm">'+mmss(V.end-Date.now())+'</span>':'')+'</div>';
}
function footHtml(){
  if(V.mode==="prac")return V.picked!==null?'<button type="button" class="p86-main" data-act="p86next">次へ</button>':'<div class="p86-wait">選んでください</div>';
  var last=V.pos>=V.steps.length-1;
  return '<div class="p86-nav"><button type="button" class="p86-sub" data-act="p86prev"'+(V.pos?'':' disabled')+'>前へ</button>'+
    (last?'<button type="button" class="p86-main" data-act="p86fin">採点する</button>':'<button type="button" class="p86-main" data-act="p86next">'+(V.ans[V.pos]!==undefined?'次へ':'あとで答える')+'</button>')+'</div>';
}

/* ---------- 結果 ---------- */
function resHtml(){
  var h='',lv=V.lv||curLv(),L=LV[lv];
  if(V.mode==="mock"){
    var r=V.res,allOk=["lg","rd","au"].every(function(c){return pct(r[c][0],r[c][1])>=L.pass;});
    h+='<div class="p86-done"><h3>'+L.code+' ミニ模試の結果</h3><p>'+(allOk?'3部門とも合格ライン（'+L.pass+'%）を超えました。':'合格ライン（'+L.pass+'%）に届いていない部門があります。')+'</p></div><div class="p86-card">';
    ["lg","rd","au"].forEach(function(c){if(!r[c][1])return;var p=pct(r[c][0],r[c][1]),need=Math.max(0,Math.ceil(r[c][1]*L.pass/100)-r[c][0]);
      h+='<div class="p86-row3"><div class="p86-rl"><b>'+CATN[c]+'</b><small>'+r[c][0]+' / '+r[c][1]+'問</small></div><div class="p86-rr"><div class="p86-bar"><i style="width:'+p+'%"></i><u style="left:'+L.pass+'%"></u></div><span class="p86-mk"><b class="'+(p>=L.pass?"ok":"ng")+'">'+p+'%</b></span></div></div>'+
        (need?'<p class="p86-need">'+CATN[c]+'はあと <b>'+need+'問</b> 正解すれば合格ラインです。</p>':'');});
    h+='<p class="p86-mut">かかった時間 '+mmss(r.sec*1000)+'　（本番は作文・会話もあり、それぞれ合格ラインが必要です）</p></div>';
    var miss=V.steps.map(function(x,i){return {x:x,a:V.ans[i]};}).filter(function(o){return o.a!==o.x.it.a;});
    if(miss.length){h+='<div class="p86-h">まちがえた問題の説明（'+miss.length+'問）　※明日の練習でもう一度出ます</div>';
      miss.forEach(function(o){var it=o.x.it;
        h+='<div class="p86-rv"><div class="p86-tag">'+SECN[it.sec]+'</div><div class="p86-q '+(it.t==="hear"?"":"p71-sent")+'">'+esc(it.t==="gap"?full(it):it.t==="hear"?it.say:it.q)+'</div>'+
          '<p class="p86-ja">'+esc(it.t==="gap"?it.j:it.t==="hear"?"":it.qj)+(it.txt?'（'+esc(it.txt.t)+'）':'')+'</p>'+
          '<p>あなたの答え：<b class="ng">'+(o.a===undefined?'（答えていない）':esc(o.a))+'</b>　正解：<b class="ok">'+esc(it.a)+'</b></p>'+expHtml(it,true).replace(/^<p><b class="ok">正解<\/b><\/p>/,"")+'</div>';});
    }else h+='<div class="p86-card"><p>全問正解です！</p></div>';
    h+='<button type="button" class="p86-big" data-act="p86home"><span><b>トップへ</b><small>弱い部門の練習から続けましょう</small></span>'+ic("go",18)+'</button>';
    return h;
  }
  var tot=V.ok+V.ng,miss2=[],seen={};
  V.steps.forEach(function(x){if(V.again[x.it.id]&&!seen[x.it.id]){seen[x.it.id]=1;miss2.push(x.it);}});
  var li=V.kind==="today"?items(curLv()):items(curLv(),V.kind),so=sum(li);
  h+='<div class="p86-done"><h3>おつかれさまでした</h3><p>1回目で正解 '+V.ok+' / '+tot+'問</p></div>';
  h+='<div class="p86-card"><div class="p86-ch">'+(V.kind==="today"?L.code+' 全体':SECN[V.kind])+'の定着 '+pct(so.solid,so.n)+'%</div>'+sbar(so)+'<p class="p86-mut">定着 '+so.solid+'・練習中 '+so.learn+'・まだ '+(so.n-so.solid-so.learn)+'（全 '+so.n+'問）'+(V.kind!=="today"?'　'+lap(li).lap+'周目 '+lap(li).done+' / '+li.length:'')+'</p></div>';
  if(miss2.length){h+='<div class="p86-h">見直しておきたい問題（明日もう一度出ます）</div>';miss2.forEach(function(it){
    h+='<div class="p86-rv"><div class="p86-q '+(it.t==="hear"?"":"p71-sent")+'">'+esc(it.t==="gap"?full(it):it.t==="hear"?it.say:it.q+' → '+it.a)+'</div><p class="p86-ja">'+esc(it.t==="gap"?it.j:it.t==="hear"?it.a:it.qj)+'</p></div>';});}
  h+='<div class="p86-nav2"><button type="button" class="p86-sub" data-act="p86home">トップへ</button><button type="button" class="p86-main" data-act="p86prac" data-val="'+V.kind+'">続けてもう1回</button></div>';
  return h;
}

/* ---------- 描く ---------- */
function draw(){
  var m=el();document.body.classList.add("p70-noscroll");try{p72PopClose();p72Theme();}catch(_){}
  var body,head,foot='';
  if(V.view==="top"){head='<div class="p86-th"><button type="button" class="p86-back" data-act="p86close" aria-label="もどる">‹</button><b>ロシア語検定 対策</b></div>';body=topHtml();}
  else if(V.view==="q"){head=headHtml();body=qHtml();foot='<div class="p86-foot">'+footHtml()+'</div>';}
  else {head='<div class="p86-th"><button type="button" class="p86-back" data-act="p86home" aria-label="もどる">‹</button><b>ロシア語検定 対策</b></div>';body=resHtml();}
  m.innerHTML='<div class="p86-wrap">'+head+'<div class="p86-scroll">'+body+'</div>'+foot+'</div>';
  m.className="show";document.body.classList.add("p86-on");
  try{p72Wrap(m);}catch(_){}
  var sc=m.querySelector(".p86-scroll"),key=V.view+"/"+(V.pos||0)+"/"+(V.picked!==null&&V.picked!==undefined?1:0);
  if(sc&&V._k!==key){if(!(V.view==="q"&&V.picked!==null&&V.mode==="prac"))sc.scrollTop=0;V._k=key;}
  if(V.view==="q"&&V.mode==="prac"&&V.picked!==null){var e=m.querySelector(".p86-exp");if(e)setTimeout(function(){try{e.scrollIntoView({block:"nearest"});}catch(_){}},30);}
}

/* ---------- 操作 ---------- */
function hush(){if(V)V.playing=0;try{window.speechSynthesis&&speechSynthesis.cancel();}catch(_){}}
function onPick(i){
  var x=V.steps[V.pos],o=x.opts[i];
  if(V.mode==="mock"){V.ans[V.pos]=o;draw();return;}
  if(V.picked!==null)return;
  V.picked=o;var ok=o===x.it.a;
  if(!x.again){if(ok)V.ok++;else V.ng++;mark(x.it,ok,qSec());}
  if(!ok&&!x.again){V.again[x.it.id]=1;V.steps.push({it:x.it,opts:shuffle(x.opts.slice()),again:1});}
  if(x.it.t==="gap")try{speak(full(x.it));}catch(_){}
  draw();
}
function onNext(){
  hush();
  if(V.mode==="prac"){if(V.picked===null)return;V.pos++;V.picked=null;if(V.pos>=V.steps.length){V.view="res";draw();return;}qStart();draw();return;}
  if(V.pos<V.steps.length-1){V.pos++;qStart();draw();}
}
function finishMock(){
  stopTimer();hush();
  var r={lg:[0,0],rd:[0,0],au:[0,0]},na=Object.keys(V.ans).length;
  r.sec=Math.round((Date.now()-V.t0)/1000);
  var per=na?Math.min(120,Math.round(r.sec/na)):0;
  V.steps.forEach(function(x,i){var c=CAT[x.it.sec],ok=V.ans[i]===x.it.a;r[c][1]++;if(ok)r[c][0]++;
    if(V.ans[i]!==undefined)mark(x.it,ok,per);});
  var R=rec();R.mk.unshift({lv:V.lv,d:Date.now(),lg:r.lg,rd:r.rd,au:r.au,sec:r.sec});R.mk=R.mk.slice(0,30);save();
  V.res=r;V.view="res";draw();
}
/* 聴解の再生：1文ずつ、少し間をあけて読む */
function play(){
  var x=V.steps[V.pos],it=x.it,lines=it.t==="hear"?[it.say]:(it.txt&&it.txt.ln||[]).map(function(l){return l[1];}),key=it.t==="hear"?it.id:it.txt.id;
  if(!lines.length||V.playing)return;
  if(V.mode==="mock"){var u=V.plays[key]||0;if(u>=2)return;V.plays[key]=u+1;}
  V.playing=1;draw();
  var i=0,me=V;
  (function nx(){
    if(V!==me||!V.playing)return;
    if(i>=lines.length){V.playing=0;draw();return;}
    var s=lines[i++];
    Promise.resolve(typeof speakUtterance==="function"?speakUtterance(s,"ru-RU"):(speak(s),new Promise(function(r){setTimeout(r,s.length*90);}))).then(function(){setTimeout(nx,450);});
  })();
}
function quit(){
  if(V.mode==="mock"&&V.view==="q"&&!V.qc){V.qc=1;toast("もう一度押すと模試をやめます（記録は残りません）");setTimeout(function(){if(V)V.qc=0;},2500);return;}
  stopTimer();hush();V={view:"top"};draw();
}
document.addEventListener("click",function(e){
  var t=e.target.closest&&e.target.closest("[data-act]");if(!t)return;var a=t.getAttribute("data-act");
  if(a.indexOf("p86")!==0)return;
  e.stopImmediatePropagation();e.preventDefault();var v=t.getAttribute("data-val");
  if(a==="p86open"){open();return;}
  if(!V)return;
  if(a==="p86close")close();
  else if(a==="p86home"){stopTimer();hush();V={view:"top"};draw();}
  else if(a==="p86lv"){if(LV[v]){rec().lv=v;save();V={view:"top"};draw();}}
  else if(a==="p86today")startPrac("today");
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
document.addEventListener("click",function(e){var t=e.target.closest&&e.target.closest('#p86 [data-act="p71say"]');if(!t)return;e.stopImmediatePropagation();e.preventDefault();try{speak(t.getAttribute("data-val"));}catch(_){}},true);

/* ---------- ホームの小さな入口 ---------- */
if(typeof p81List==="function"){
  var _list=p81List;
  p81List=function(){
    var h=_list.apply(this,arguments),sub="ТЭУ・ТБУ・ТРКИ-1 の問題とミニ模試",code="ТРКИ";
    try{var r=rec();if(r.s&&Object.keys(r.s).length){build();var lv=r.lv,o=sum(items(lv));code=LV[lv].code;sub=LV[lv].name+'　定着 '+pct(o.solid,o.n)+'%'+(o.due?'・今日の復習 '+o.due+'問':'');}}catch(_){}
    return h+'<button type="button" class="p86-ent" data-act="p86open"><span class="p86-eb">'+code+'</span><span class="p86-et"><b>ロシア語検定 対策</b><small>'+sub+'</small></span>'+ic("go",15)+'</button>';
  };
}
if(typeof p81GuideHtml==="function"){
  var _gh=p81GuideHtml;
  p81GuideHtml=function(){var h=_gh.apply(this,arguments);
    return h.replace('<div class="p81-tipbox">','<div class="p81-g"><div class="p81-gwho">ロシア語検定（ТРКИ）に合格したい人</div><div class="p81-gmode"><b>ロシア語検定 対策</b></div><p>やさしい順に ТЭУ（入門）→ ТБУ（基礎）→ ТРКИ-1（第1レベル）の3つから選び、試験と同じ形の問題・単語・文法・読解・聴解を何周も回します。正解した問題は間をあけてもう一度出るので、忘れかけたころに復習できます。「今日の10問」を毎日押すだけで進みます。</p><button type="button" class="p81-gbtn" data-act="p81go" data-val="p86open">検定対策を開く '+ic("go",15)+'</button></div><div class="p81-tipbox">');};
}

/* ---------- 見た目 ---------- */
var css=document.createElement("style");css.textContent=
 '#p86{position:fixed;inset:0;z-index:150;background:var(--bg,#000);color:var(--ink);display:none}#p86.show{display:block}'+
 'body.p86-on #toast{z-index:300}'+
 '.p86-wrap{height:100%;max-width:560px;margin:0 auto;display:flex;flex-direction:column}'+
 '.p86-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;padding:4px 16px 24px}'+
 '.p86-th{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 16px 8px}.p86-th b{font-size:18px;flex:1}'+
 '.p86-back{flex:none;width:40px;height:40px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:24px;line-height:1;display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0}'+
 /* レベルの選択（やさしい順に左から） */
 '.p86-lvs{display:flex;align-items:stretch;gap:2px;margin:4px 0 10px}.p86-arw{flex:none;align-self:center;font-style:normal;color:var(--muted);font-size:16px}'+
 '.p86-lvb{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:1px;padding:8px 2px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;cursor:pointer}'+
 '.p86-lvb small{font-size:10.5px;color:var(--muted);white-space:nowrap}.p86-lvb b{font-size:16px;letter-spacing:.2px}.p86-lvb span{font-size:11px;color:var(--muted);white-space:nowrap}'+
 '.p86-lvb.on{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}.p86-lvb.on b{color:var(--accent)}'+
 '.p86-card{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px;margin:8px 0 12px}.p86-card p{font-size:14px;line-height:1.7;margin:6px 0 0}'+
 '.p86-ch{font-size:15px;font-weight:700;margin-bottom:6px}'+
 '.p86-big2{display:flex;align-items:center;gap:16px;margin-bottom:10px}.p86-big2>div:first-child{display:flex;flex-direction:column;align-items:center;min-width:84px}.p86-big2>div:first-child b{font-size:38px;line-height:1;color:var(--accent)}.p86-big2>div:first-child b small{font-size:16px}.p86-big2>div:first-child span{font-size:12px;color:var(--muted);margin-top:4px}'+
 '.p86-nums p{margin:0!important;font-size:13px!important;line-height:1.65!important}.p86-nums b{font-size:14px}'+
 '.dot{display:inline-block;width:9px;height:9px;border-radius:3px;margin-right:6px;vertical-align:0}.dot.s,.p86-sbar .s{background:#2e9c5a}.dot.l,.p86-sbar .l{background:var(--accent)}.dot.n{background:rgba(127,127,127,.35)}'+
 '.p86-sbar{display:flex;height:8px;border-radius:4px;overflow:hidden;background:rgba(127,127,127,.22);margin-top:6px}.p86-sbar i{display:block;height:100%}'+
 '.p86-row3{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px solid var(--line)}.p86-row3:first-of-type{border-top:0}'+
 '.p86-rl{width:96px;flex:none;display:flex;flex-direction:column}.p86-rl b{font-size:14px}.p86-rl small{font-size:11.5px;color:var(--muted)}'+
 '.p86-rr{flex:1;min-width:0;display:flex;align-items:center;gap:8px}.p86-mk{flex:none;font-size:12px;color:var(--muted);min-width:54px;text-align:right}.p86-mk b{font-size:15px}'+
 '.p86-bar{position:relative;flex:1;height:8px;border-radius:4px;background:rgba(127,127,127,.22)}.p86-bar i{position:absolute;left:0;top:0;bottom:0;border-radius:4px;background:var(--accent)}.p86-bar u{position:absolute;top:-4px;bottom:-4px;width:2px;background:var(--ink);opacity:.55}'+
 '#p86 .ok{color:#2e9c5a}#p86 .ng{color:#d9534f}html.p72-dark #p86 .ok{color:#5fd08a}html.p72-dark #p86 .ng{color:#ff7b72}'+
 '.p86-judge{font-size:13.5px!important}'+
 '.p86-big{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:1.5px solid var(--accent);background:var(--card);color:var(--ink);border-radius:14px;padding:12px 14px;font:inherit;cursor:pointer;margin:4px 0 0}.p86-big span{flex:1;display:flex;flex-direction:column}.p86-big b{font-size:16px}.p86-big small{font-size:12.5px;color:var(--muted)}.p86-big svg{color:var(--accent)}'+
 '.p86-big2b{border-width:1px;border-color:var(--line)}'+
 '.p86-h{font-size:13px;font-weight:700;color:var(--muted);margin:18px 4px 6px}'+
 '.p86-box{border:1px solid var(--line);background:var(--card);border-radius:14px;overflow:hidden}'+
 '.p86-r{display:flex;align-items:center;gap:10px;width:100%;text-align:left;border:0;border-top:1px solid var(--line);background:none;color:var(--ink);font:inherit;padding:11px 12px 11px 14px;min-height:60px;cursor:pointer}.p86-r:first-child{border-top:0}.p86-r>span{flex:1;min-width:0;display:flex;flex-direction:column;gap:1px}.p86-r b{font-size:15px}.p86-r small{font-size:12px;color:var(--muted)}.p86-r small em{font-style:normal;color:var(--accent);font-weight:700}.p86-r svg{color:var(--muted)}'+
 '.p86-hist{padding:4px 12px;margin-top:8px}.p86-hr{display:flex;align-items:center;gap:8px;font-size:13px;padding:8px 0;border-top:1px solid var(--line)}.p86-hr:first-child{border-top:0}.p86-hr span{width:44px;color:var(--muted)}.p86-hr em{font-style:normal;flex:1}'+
 '.p86-info{margin:14px 0 0;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px}.p86-info summary{font-size:14.5px;font-weight:700;cursor:pointer}.p86-info p{font-size:13.5px;line-height:1.75;margin:8px 0}'+
 '.p86-mut{font-size:12px!important;color:var(--muted)}'+
 /* 問題の画面 */
 '.p86-qh{display:flex;align-items:center;gap:10px;padding:calc(10px + env(safe-area-inset-top)) 16px 8px}.p86-qh .p86-back{font-size:16px}'+
 '.p86-prog{flex:1;height:6px;border-radius:3px;background:rgba(127,127,127,.22);overflow:hidden}.p86-prog i{display:block;height:100%;background:var(--accent)}'+
 '.p86-cnt{font-size:12.5px;color:var(--muted);flex:none}.p86-tm{flex:none;font-size:13px;font-weight:700;font-variant-numeric:tabular-nums;border:1px solid var(--line);border-radius:8px;padding:3px 7px}.p86-tm.warn{color:#d9534f;border-color:#d9534f}'+
 '.p86-tag{font-size:12.5px;font-weight:700;color:var(--muted);margin:6px 2px 8px}.p86-rv1{font-style:normal;font-size:11px;border:1px solid var(--accent);color:var(--accent);border-radius:6px;padding:1px 5px}'+
 '.p86-paper{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:14px;position:relative}'+
 '.p86-q{font-size:19px;line-height:1.6;font-weight:600}.p86-qj{font-size:16px}.p86-hint{font-size:14px;color:var(--muted);margin-top:6px}.p86-ja{font-size:13.5px;color:var(--muted);margin-top:8px;line-height:1.6;padding-right:40px}'+
 '.p86-paper .p71-spk{position:absolute;right:8px;bottom:8px}'+
 '.p86-tr{margin-top:8px;font-size:13.5px}.p86-tr summary{color:var(--accent);cursor:pointer;font-weight:600}.p86-tr p{line-height:1.75;color:var(--muted);margin:6px 0 0}.p86-trs{margin-top:10px}'+
 '.p86-txt{border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px 14px;margin:0 0 10px}.p86-tt{font-size:12.5px;font-weight:700;color:var(--muted);margin-bottom:6px}'+
 '.p86-body{font-size:16.5px;line-height:1.85;font-weight:400;margin-top:8px}'+
 '.p86-rdb{max-height:40vh;overflow-y:auto;-webkit-overflow-scrolling:touch;padding-right:4px;margin-top:0}'+
 '.p86-play{display:flex;align-items:center;justify-content:center;gap:6px;width:100%;min-height:52px;border-radius:12px;border:1.5px solid var(--accent);background:none;color:var(--accent);font:inherit;font-size:16px;font-weight:700;cursor:pointer}.p86-play[disabled]{opacity:.45}'+
 '.p86-opts{display:flex;flex-direction:column;gap:8px;margin:12px 0 0}'+
 '.p86-opt{width:100%;text-align:left;min-height:52px;padding:10px 14px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:17px;cursor:pointer}.p86-opt.ja{font-size:15px;line-height:1.5}'+
 '.p86-opt.sel{border-color:var(--accent);box-shadow:inset 0 0 0 1px var(--accent)}.p86-opt.right{border-color:#2e9c5a;background:rgba(46,156,90,.12)}.p86-opt.wrong{border-color:#d9534f;background:rgba(217,83,79,.12)}.p86-opt.dim{opacity:.5}'+
 '.p86-exp{margin:12px 0 0;border-left:3px solid var(--accent);background:var(--card);border-radius:0 12px 12px 0;padding:10px 14px}.p86-exp p{font-size:14.5px;line-height:1.75;margin:4px 0}.p86-exp b{font-size:inherit}.p86-exp p:first-child b{font-size:16px}.p86-full{font-weight:600}.p86-oth{font-size:13.5px!important;color:var(--muted)}.p86-oth b{color:var(--ink)}'+
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
