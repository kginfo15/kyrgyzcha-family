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
      mock:{ex:10,vo:8,gr:7,rd:3,au:3,hs:4,min:35}},
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
            x:(b.why||"")+(c.gEasy?"　"+c.gEasy:""),xg:c.gEasy||"",unit:c.unit,form:1,ord:n++});
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
function mark(it,ok,sec,pk){
  var r=rec(),t=today(),s=(st(it.id)||[0,0,0,t,t]).slice();
  /* 正解で箱が上がるのは「はじめて」か「復習の日が来た」ときだけ。同じ日に何周しても定着にはならない */
  var fresh=!s[0]||s[3]<=t;
  /* 聴解を「文字で見る」で解いたときは、耳で聞き取れた証拠にならないので段は上げない（周回の回数には数える） */
  var nsx=(it.sec==="au"||it.t==="hear")&&typeof nsOn==="function"&&nsOn();if(nsx&&ok)fresh=false;
  s[0]++;if(ok){s[1]++;if(fresh){s[2]=Math.min(INT.length-1,s[2]+1);s[3]=t+INT[s[2]];}}else{s[2]=1;s[3]=t+1;}s[4]=t;
  if(nsx&&ok&&s[3]<=t)s[3]=t+1;
  r.s[it.id]=s;save();
  try{if(typeof coachLog==="function")coachLog(Object.assign({m:"trki",id:"trki:"+it.id,ok:ok?1:0,s:sec,g:["trki-"+it.sec,"trki-"+it.lv].concat(it.part?["trki-p"+it.part]:[]),w:it.wid&&!ok?[it.wid]:[]},
      /* まちがえたときは、AI学習コーチの「自分専用の講義」に出す材料（問題・正解・選んだ答え・理由）も渡す */
      !ok&&pk!==undefined?{x:{s:it.t==="gap"?it.s:(it.t==="hear"?it.q+"（"+it.say+"）":it.q),a:it.a,p:pk,r:String(it.x||"").replace(/<[^>]*>/g,"")}}:{}));}catch(_){}
}
/* 「定着とは？」の説明（どの画面からでも開ける小さな重ね画面） */
function solidHtml(){
  var lv=curLv(),li=items(lv),cnt=[0,0,0,0,0,0,0],none=0;
  li.forEach(function(it){var s=st(it.id);if(!s||!s[0])none++;else cnt[Math.min(6,Math.max(0,s[2]))]++;});
  var steps=[["1段","はじめて正解","1日後"],["2段","1日後も正解","3日後"],["3段","3日後も正解","1週間後"],["4段","1週間後も正解","2週間後"],["5段","2週間後も正解","1か月後"],["6段","1か月後も正解","2か月後"]];
  var h='<div class="p86-solbox" role="dialog" aria-label="定着とは"><div class="p86-solh"><b>「定着」の数え方</b><button type="button" class="p86-x" data-act="p86solx" aria-label="閉じる">'+ic("x",18)+'</button></div><div class="p86-solsc">';
  h+='<p>問題ごとに「段」があり、<b>間をあけて正解するたびに1段ずつ上がります</b>。<b>4段目に上がった問題を「定着」</b>と数えます。4段目までは「練習中」、まだ1回も解いていない問題は「まだ」です。</p>';
  h+='<div class="p86-stairs">'+steps.map(function(x,i){return '<div class="p86-st'+(i>=SOLID-1?" s":"")+'"><span>'+x[0]+'</span><div><b>'+x[1]+'</b><small>次に出るのは '+x[2]+'</small></div><em>'+cnt[i+1]+'問</em></div>';}).join("")+'</div>';
  h+='<p class="p86-mut">右の数は、いまの '+LV[lv].code+' であなたの問題がその段にいる数です（まだ解いていない問題 '+none+'問）。</p>';
  h+='<p><b>なぜ「1週間あけても正解」で定着なの？</b>　解いた直後に正解できるのは、答えが頭に残っているからで、覚えた証拠にはなりません。日をあけて、忘れかけたころに思い出せた記憶ほど長持ちします。そこで「1日・3日・1週間と、だんだん長くあけても正解できた」ことを定着の目じるしにしています。いちばん早くても、はじめて解いた日から<b>11日</b>かかります。</p>';
  h+='<p><b>同じ日に何周しても段は上がらない</b>　段が上がるのは「はじめて解いたとき」と「復習の日が来たとき」だけです。同じ日にくり返し正解しても、練習にはなりますが段は上がりません。</p>';
  h+='<p><b>まちがえたら</b>　その問題は1段目にもどり、その回の最後と次の日にもう一度出ます。そこからまた1日→3日…と上がっていきます。</p>';
  h+='<p><b>毎日することは1つだけ</b>　「今日の10問」を押すと、復習の日が来た問題が先に出ます。これを続けると、自然に段が上がって定着が増えていきます。</p>';
  return h+'</div></div>';
}
function solidOpen(){var p=document.getElementById("p86");if(!p)return;solidClose();var d=document.createElement("div");d.id="p86sol";d.innerHTML=solidHtml();p.appendChild(d);}
function solidClose(){var d=document.getElementById("p86sol");if(d)d.remove();}
function solidQ(){return '<button type="button" class="p86-solq" data-act="p86solid">定着とは？</button>';}
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
  h+='<div class="p86-card"><div class="p86-big2"><div><b>'+pct(o.solid,o.n)+'<small>%</small></b><span>定着</span>'+solidQ()+'</div><div class="p86-nums"><p><i class="dot s"></i>定着 <b>'+o.solid+'</b>問</p><p><i class="dot l"></i>練習中 <b>'+o.learn+'</b>問</p><p><i class="dot n"></i>まだ <b>'+(o.n-o.solid-o.learn)+'</b>問</p><p class="p86-mut">解いた問題 '+(o.solid+o.learn)+' / '+o.n+'（'+pct(o.solid+o.learn,o.n)+'%）</p></div></div>'+sbar(o)+
     '<p class="p86-judge">'+judge(lv,o)+'</p></div>';
  /* 今日の練習 */
  h+='<button type="button" class="p86-big" data-act="p86today"><span><b>今日の10問</b><small>'+(o.due?'復習 '+o.due+'問を先に、そのあと続きから':'続きから順番に')+'</small></span>'+ic("go",18)+'</button>';
  h+=goalHtml(lv);
  /* 分野ごと */
  h+='<div class="p86-h p86-hq"><span>分野ごとに練習（何周でも回せます）</span>'+solidQ()+'</div><div class="p86-box">';
  ["ex","vo","gr","rd","au","hs"].forEach(function(s){var li=items(lv,s);if(!li.length)return;var so=sum(li),lp=lap(li);
    h+='<button type="button" class="p86-r" data-act="p86prac" data-val="'+s+'"><span><b>'+SECN[s]+'</b><small>'+lp.lap+'周目 '+lp.done+' / '+lp.n+'　・　定着 '+pct(so.solid,so.n)+'%'+(so.due?'　・　<em>復習 '+so.due+'</em>':'')+'</small>'+sbar(so)+'</span>'+ic("go",16)+'</button>';});
  h+='</div>';
  /* 模試 */
  var m=lastMock(lv),M=L.mock;
  h+='<div class="p86-h">ミニ模試（本番を小さくした形・'+M.min+'分）</div><button type="button" class="p86-big p86-big2b" data-act="p86mock"><span><b>'+L.code+' のミニ模試を受ける</b><small>'+(m?'前回：'+["lg","rd","au"].map(function(c){var p=pct(m[c][0],m[c][1]);return CATN[c]+' '+p+'%';}).join('・'):'まだ受けていません')+'</small></span>'+ic("go",18)+'</button>';
  var ms=rec().mk.filter(function(x){return (x.lv||"B1")===lv;});
  if(ms.length>1){h+='<div class="p86-box p86-hist">';ms.slice(0,6).forEach(function(x){var d=new Date(x.d);
    h+='<div class="p86-hr"><span>'+(d.getMonth()+1)+'/'+d.getDate()+'</span>'+["lg","rd","au"].map(function(c){var p=pct(x[c][0],x[c][1]);return '<em class="'+(p>=L.pass?"ok":"ng")+'">'+CATN[c].slice(0,2)+' '+p+'%</em>';}).join("")+(x.ns?'<em class="ns-mk">聴解は文字</em>':'')+'</div>';});h+='</div>';}
  /* 説明 */
  h+='<details class="p86-info"><summary>覚え方のしくみ</summary>'+
    '<p><b>周回</b>　分野ごとに、全部の問題を順番に1回ずつ解くと「1周」です。終わったら2周目、3周目…と、文法書を何度も読み返すように回します。</p>'+
    '<p><b>間隔をあけた復習</b>　正解した問題は、<b>1日後→3日後→1週間後→2週間後→1か月後→2か月後</b>と、だんだん間をあけてもう一度出ます。まちがえた問題は、その回の最後と次の日にもう一度出ます。</p>'+
    '<p><b>定着</b> '+solidQ()+'　1週間あけても正解できた問題を「定着」と数えます。全部の分野の定着が増え、ミニ模試で合格ラインを2回続けて超えたら、本番でも合格に近い力です。</p>'+
    '<p><b>今日の10問</b>　復習の日が来た問題を先に、そのあと続きの問題を出します。迷ったらこれを毎日押すだけで大丈夫です。</p></details>';
  h+='<details class="p86-info"><summary>検定のレベルと '+L.code+' の試験</summary>'+
    '<p>ロシア語検定（ТРКИ）は、ロシア政府の公式な検定です。やさしい順に <b>ТЭУ（入門・A1目安）→ ТБУ（基礎・A2目安）→ ТРКИ-1（第1レベル・B1目安）</b> → ТРКИ-2〜4 と上がります。「第1レベル」は一番下ではなく、下から3番目なので注意してください。</p>'+
    '<p><b>'+L.code+'（'+L.name+'）</b>　'+L.exam+'。</p>'+
    '<p><b>合格ライン</b>　'+L.passNote+'</p>'+
    '<p>このアプリの問題は、本番の形に合わせて書き下ろしたものと、アプリの単語帳・瞬間作文から自動で作ったものです（本物の過去問ではありません）。作文と会話の部門はまだありません。「その他の練習」のAI会話で補ってください。</p>'+
    '<p class="p86-mut">試験の形は公開されている要項にもとづく目安です。最新の実施要項は、受験する試験会場で確かめてください。</p></details>';
  return h;
}
/* ---------- 合格までの道のり（目標3つと、時間の目安） ----------
   時間の目安は、日本語が母語の人がロシア語を学ぶときによく言われる学習時間をもとにした「おおよそ」です（単語・文法・会話の学習もふくむ累計）。 */
var GOAL_H={A1:150,A2:350,B1:700},GOAL_LAP=3,GOAL_SOLID=80,GOAL_MOCK=2;
function goalHtml(lv){
  var L=LV[lv],secs=["ex","vo","gr","rd","au","hs"].filter(function(s){return items(lv,s).length;}),all=items(lv),o=sum(all);
  /* 周回：全分野のうち、いちばん遅れている分野の「終わった周＋いまの周の進み」 */
  var lp=Math.min.apply(null,secs.map(function(s){var x=lap(items(lv,s));return (x.lap-1)+(x.n?x.done/x.n:0);}));
  var sp=pct(o.solid,o.n),ms=rec().mk.filter(function(x){return (x.lv||"B1")===lv;}),run=0;
  for(var i=0;i<ms.length;i++){if(["lg","rd","au"].every(function(c){return pct(ms[i][c][0],ms[i][c][1])>=L.pass;}))run++;else break;}
  var lapH=Math.round(all.length*20/3600*10)/10,setH=Math.round(lapH*GOAL_LAP*1.5),hh=GOAL_H[lv],mo=Math.round(hh*2/30);
  function row(lab,v,goal,txt){var p=Math.min(100,Math.round(v/goal*100));return '<div class="p86-gr"><div class="p86-gt"><b>'+lab+'</b><span>'+txt+'</span></div><div class="p86-bar"><i style="width:'+p+'%"></i></div></div>';}
  return '<div class="p86-card p86-goal"><div class="p86-ch">'+L.code+' 合格までの道のり</div>'+
    row("① 全分野を"+GOAL_LAP+"周",lp,GOAL_LAP,(Math.floor(lp*10)/10)+' / '+GOAL_LAP+'周')+
    row("② 定着 "+GOAL_SOLID+"%",sp,GOAL_SOLID,sp+'% / '+GOAL_SOLID+'%')+
    row("③ ミニ模試で全部門合格を"+GOAL_MOCK+"回続けて",run,GOAL_MOCK,run+' / '+GOAL_MOCK+'回')+
    '<p class="p86-mut">3つそろえば、'+L.code+' の選択問題（語彙・文法・読解・聴解）は合格ラインに届く力の目安です。</p>'+
    '<details class="p86-info p86-gi"><summary>何周・何時間かかる？</summary>'+
    '<p><b>この問題集</b>　'+all.length+'問。1周は約'+lapH+'時間（1問20秒で計算）。'+GOAL_LAP+'周と復習で、約'+setH+'時間です。</p>'+
    '<p><b>なぜ3周？</b>　1周目は「知る」、2周目は「思い出せる」、3周目は「迷わず選べる」ようにするためです。復習は1日・3日・1週間…と間をあけて自動で出るので、3周するころには多くの問題が「定着」になります。</p>'+
    '<p><b>勉強時間の目安（このレベルまでの合計）</b>　'+L.code+' までは、単語・文法・聞き取りの学習もふくめて<b>約'+hh+'時間</b>です（1日30分なら約'+mo+'か月、1日1時間ならその半分）。日本語が母語の人がロシア語を学ぶときによく言われる時間をもとにした、おおよその数字です。</p>'+
    '<p><b>この問題集だけでは足りないところ</b>　本番には作文と会話の部門もあり、それぞれ合格ラインが必要です。このアプリの瞬間作文（書く・言う練習）も並行して進めてください。</p></details></div>';
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
/* "ex:2" のように「分野:パート番号」で、試験形式の1つのパートだけを出す（AI学習コーチの確認問題から使う）。"ex" だけなら全パート */
function kindList(lv,k){var m=/^ex:([1-4])$/.exec(k||"");if(m)return items(lv,"ex").filter(function(it){return it.part===+m[1];});return k==="today"?items(lv):items(lv,k);}
function kindName(k){var m=/^ex:([1-4])$/.exec(k||"");return m?SECN.ex+"　"+PART[+m[1]].split("　")[0]:SECN[k];}
function startPrac(sec){
  var lv=curLv(),list;
  if(!/^(today|ex|vo|gr|rd|au|hs|ex:[1-4])$/.test(sec||""))sec="today";
  if(sec==="today"){
    /* 復習の日が来た問題を全分野から → 足りなければ単語・文法・試験形式の続き */
    var all=items(lv).filter(function(it){return it.sec!=="rd"&&it.sec!=="au";});
    list=queue(all.filter(due),7);
    var rest=10-list.length,secs=["ex","gr","vo","hs"],i=0;
    while(rest>0&&i<20){var s=secs[i%secs.length];var nx=queue(items(lv,s).filter(function(it){return list.indexOf(it)<0&&!due(it);}),1);if(nx.length){list.push(nx[0]);rest--;}i++;}
  }else if(sec==="rd"||sec==="au")list=textQueue(items(lv,sec),1);
  else list=queue(kindList(lv,sec),10);
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
  if(nsOn())return '<div class="p86-txt"><div class="p86-tt">'+esc(t.t)+'</div><div class="p71-sent p86-body">'+t.ln.map(function(l){return (l[0]?'<b>'+esc(l[0])+'：</b>':'')+esc(l[1]);}).join("<br>")+'</div>'+nsNote()+'<div class="ns-wrap">'+nsBtn()+'</div>'+
      (done&&prac?'<details class="p86-tr"><summary>日本語訳を見る</summary><p>'+esc(t.j).replace(/\n/g,"<br>")+'</p></details>':'')+'</div>';
  var key=t.id,h='<div class="p86-txt"><div class="p86-tt">'+esc(t.t)+'</div>'+playBtn(key)+'<div class="ns-wrap">'+nsBtn()+'</div>'+
    (done&&prac?'<details class="p86-tr"><summary>聞いた内容（ロシア語と訳）</summary><div class="p71-sent p86-body">'+t.ln.map(function(l){return (l[0]?'<b>'+esc(l[0])+'：</b>':'')+esc(l[1]);}).join("<br>")+'</div><p>'+esc(t.j).replace(/\n/g,"<br>")+'</p></details>':'');
  return h+'</div>';
}
function nsNote(){return '<p class="ns-note">聞き取りの代わりに文字で読んでいます。この回は周回には数えますが、聴解の「定着」には数えません。</p>';}
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
    h+='<div class="p86-txt">'+(nsOn()?'<div class="p71-sent p86-body">'+esc(it.say)+'</div>'+nsNote():playBtn(it.id)+(done?'<div class="p71-sent p86-body">'+esc(it.say)+'</div>':''))+'<div class="ns-wrap">'+nsBtn()+'</div></div><div class="p86-paper"><div class="p86-q p86-qj">'+esc(it.q)+'</div></div>';
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
/* ---------- 「なぜこの形？」の説明（文の中の手がかり → 形の作り方 → ほかの選択肢がちがう理由） ----------
   文の中から「形を決めている手がかり」（前置詞・нет・数・動詞・主語・時を表す語・うしろの名詞）を探し、
   見つかったときだけ書きます（あてずっぽうの説明は出しません）。問題ごとの説明（it.x）は「この文のポイント」として残します。 */
var W_CJ={nom:"主格（〜が・〜は）",gen:"生格（〜の・〜がない・数のあと）",dat:"与格（〜に）",acc:"対格（〜を・〜へ）",ins:"造格（〜で・〜と・〜として）",pre:"前置格（〜で〔場所〕・〜について）"};
var W_PREP={"о":["pre","о（〜について）"],"об":["pre","об（〜について）"],"обо":["pre","обо（〜について）"],"при":["pre","при（〜のときに・〜のそばで）"],
  "у":["gen","у（〜のところに）"],"из":["gen","из（〜の中から）"],"от":["gen","от（〜から：人や場所から離れて）"],"до":["gen","до（〜まで）"],"без":["gen","без（〜なしで）"],"для":["gen","для（〜のために）"],
  "после":["gen","после（〜のあとで）"],"около":["gen","около（〜の近くに）"],"кроме":["gen","кроме（〜をのぞいて）"],"мимо":["gen","мимо（〜のそばを通って）"],"напротив":["gen","напротив（〜の向かいに）"],"среди":["gen","среди（〜の中で）"],"вокруг":["gen","вокруг（〜のまわりに）"],"из-за":["gen","из-за（〜のせいで）"],
  "к":["dat","к（〜のほうへ・〜のところへ）"],"ко":["dat","ко（〜のほうへ）"],"по":["dat","по（〜にそって・〜で〔電話・テレビなど〕）"],
  "через":["acc","через（〜を通って・〜後に）"],"про":["acc","про（〜について）"],
  "между":["ins","между（〜のあいだに）"],"над":["ins","над（〜の上のほうに）"],"перед":["ins","перед（〜の前に）"]};
var W_PRON={"меня":["я","gen・acc"],"мне":["я","dat・pre"],"мной":["я","ins"],"тебя":["ты","gen・acc"],"тебе":["ты","dat・pre"],"тобой":["ты","ins"],
  "его":["он","gen・acc"],"него":["он","gen・acc"],"ему":["он","dat"],"нему":["он","dat"],"им":["он／они","ins／dat"],"ним":["он／они","ins／dat"],"нём":["он","pre"],
  "её":["она","gen・acc"],"нее":["она","gen・acc"],"неё":["она","gen・acc"],"ей":["она","dat・ins"],"ней":["она","dat・ins・pre"],
  "нас":["мы","gen・acc・pre"],"нам":["мы","dat"],"нами":["мы","ins"],"вас":["вы","gen・acc・pre"],"вам":["вы","dat"],"вами":["вы","ins"],
  "их":["они","gen・acc"],"них":["они","gen・acc・pre"],"ими":["они","ins"],"ними":["они","ins"],"себя":["себя","gen・acc"],"себе":["себя","dat・pre"],"собой":["себя","ins"],
  "я":["я","nom"],"ты":["ты","nom"],"он":["он","nom"],"она":["она","nom"],"мы":["мы","nom"],"вы":["вы","nom"],"они":["они","nom"]};
Object.keys(W_PRON).forEach(function(k){var e=k.replace(/ё/g,"е");if(!W_PRON[e])W_PRON[e]=W_PRON[k];});
var W_CN={nom:"主格",gen:"生格",dat:"与格",acc:"対格",ins:"造格",pre:"前置格"};
function wTok(s){return (low(s).match(/[а-яё\-]+/g)||[]);}
function wInfo0(form){var o=null;try{o=p72Look(form);}catch(_){}var n=low(form),pr=W_PRON[n];
  var cs=[];if(pr)cs=pr[1].split(/[・／]/);else if(o&&o.form&&!o.guess)Object.keys(P72_CASEK).forEach(function(c){if(o.form.indexOf(c)>=0)cs.push(P72_CASEK[c]);});
  var w=o&&o.id&&window.WMAP?WMAP[o.id]:null;
  return {o:o,w:w,cs:cs,lab:pr?(pr[0]+" の"+pr[1].split(/[・／]/).map(function(c){return W_CN[c]||c;}).join("・")):(o&&o.form&&!o.guess&&w&&/^(noun|verb|adjective|pronoun|number)$/.test(w.pos)?o.form.split("・").filter(function(x,k,a){return a.indexOf(x)===k;}).join("・"):""),base:o?plain(o.base||""):"",pos:w?w.pos:(pr?"pronoun":""),pl:/複数/.test(o&&o.form||"")&&!/(^|・)(主格|生格|与格|対格|造格|前置格)(・|$)/.test(o&&o.form||"")};}
function wInfo(form){
  var r=wInfo0(form);if(r.cs.length||W_PRON[low(form)])return r;
  if(r.pos==="verb"){if(!r.lab){var v=wVGuess(form,r.base);if(v){r.lab=v;r.gs=1;if(/複数/.test(v))r.pl=true;}}return r;}
  if(r.pos==="adjective"){if(!r.lab){var sh=wShort(form,r.base);if(sh){r.lab=sh;r.gs=1;}}return r;}
  var m=null;try{m=wLemma(form,r.o);}catch(_){}
  if(m){var cs=[],sg=0,pl=0;m.hit.forEach(function(h){if(cs.indexOf(h[1])<0)cs.push(h[1]);if(h[0]==="s")sg=1;else pl=1;});
    r.cs=cs;r.w=m.w;r.pos="noun";r.base=plain(m.w.word);r.pl=pl&&!sg;r.gs=1;r.anim=cs.indexOf("acc")>=0&&cs.indexOf("gen")>=0;
    r.lab=(pl&&!sg?"複数・":sg&&!pl?"":"")+cs.map(function(c){return W_CN[c];}).join("・")+(pl&&sg?"（単数・複数）":"");}
  return r;
}
/* ---------- 辞書に形の名前がない語の「形」を、語尾の規則から割り出す ----------
   単語帳に「ребёнка＝生格」のような情報がない語でも、辞書の形（ребёнок）と性がわかれば、
   規則どおりの変化表を作って、どの格の形かを決められる。規則から外れる語は表に書いておく。 */
var W_LEX=null;
function wLex(){if(W_LEX)return W_LEX;W_LEX={};try{VOCAB.forEach(function(w){var k=low(w.word||"");if(!k||/\s/.test(k))return;if(!W_LEX[k]||w.pos==="noun"&&W_LEX[k].pos!=="noun")W_LEX[k]=w;});}catch(_){}return W_LEX;}
var W_IRR={
  "дети":{pl:1,f:{nom:"дети",gen:"детей",dat:"детям",acc:"детей",ins:"детьми",pre:"детях"}},
  "люди":{pl:1,f:{nom:"люди",gen:"людей",dat:"людям",acc:"людей",ins:"людьми",pre:"людях"}},
  "мать":{f:{nom:"мать",gen:"матери",dat:"матери",acc:"мать",ins:"матерью",pre:"матери"},p:{nom:"матери",gen:"матерей",dat:"матерям",acc:"матерей",ins:"матерями",pre:"матерях"}},
  "дочь":{f:{nom:"дочь",gen:"дочери",dat:"дочери",acc:"дочь",ins:"дочерью",pre:"дочери"},p:{nom:"дочери",gen:"дочерей",dat:"дочерям",acc:"дочерей",ins:"дочерями",pre:"дочерях"}},
  "имя":{f:{nom:"имя",gen:"имени",dat:"имени",acc:"имя",ins:"именем",pre:"имени"},p:{nom:"имена",gen:"имен",dat:"именам",acc:"имена",ins:"именами",pre:"именах"}},
  "время":{f:{nom:"время",gen:"времени",dat:"времени",acc:"время",ins:"временем",pre:"времени"}},
  "друг":{p:{nom:"друзья",gen:"друзей",dat:"друзьям",acc:"друзей",ins:"друзьями",pre:"друзьях"}},
  "брат":{p:{nom:"братья",gen:"братьев",dat:"братьям",acc:"братьев",ins:"братьями",pre:"братьях"}},
  "сын":{p:{nom:"сыновья",gen:"сыновей",dat:"сыновьям",acc:"сыновей",ins:"сыновьями",pre:"сыновьях"}},
  "человек":{p:{nom:"люди",gen:"людей",dat:"людям",acc:"людей",ins:"людьми",pre:"людях"}},
  "ребенок":{p:{nom:"дети",gen:"детей",dat:"детям",acc:"детей",ins:"детьми",pre:"детях"}},
  "церковь":{f:{nom:"церковь",gen:"церкви",dat:"церкви",acc:"церковь",ins:"церковью",pre:"церкви"}}
};
/* 規則どおりの変化表 {格:[形…]}（単数 s・複数 p）。生き物かどうかは分からないので、対格には生格の形も「生き物なら」として入れる */
function wDecl(L){
  var irr=W_IRR[L]||{},T={s:{},p:{}},add=function(n,c,f){if(!f)return;(T[n][c]=T[n][c]||[]).indexOf(f)<0&&T[n][c].push(f);};
  if(irr.pl){Object.keys(irr.f).forEach(function(c){add("p",c,irr.f[c]);});return T;}
  var hard=/[кгхжшчщц]$/,sib=/[жшчщц]$/;
  if(/мя$/.test(L)&&irr.f){}
  else if(/[ая]$/.test(L)){var s=L.slice(0,-1),soft=/я$/.test(L),ia=/ия$/.test(L);
    add("s","nom",L);add("s","gen",s+(soft||hard.test(s)?"и":"ы"));add("s","dat",s+(ia?"и":"е"));add("s","acc",s+(soft?"ю":"у"));add("s","ins",s+(soft||sib.test(s)?"ей":"ой"));add("s","pre",s+(ia?"и":"е"));
    add("p","nom",s+(soft||hard.test(s)?"и":"ы"));add("p","gen",soft?(ia?s.slice(0,-1)+"ий":s+"ь"):s);
    if(!soft&&/[^аеёиоуыэюяйь][^аеёиоуыэюяйь]$/.test(s))add("p","gen",s.slice(0,-1)+(/[жшчщк]/.test(s.slice(-2,-1))?"е":"о")+s.slice(-1));
    add("p","dat",s+(soft?"ям":"ам"));add("p","ins",s+(soft?"ями":"ами"));add("p","pre",s+(soft?"ях":"ах"));}
  else if(/ь$/.test(L)&&W_LEX&&W_LEX[L]&&(function(){var g=null;try{g=p72GenderInfo(W_LEX[L]).g;}catch(_){}return g==="f";})()){var s=L.slice(0,-1);
    add("s","nom",L);add("s","gen",s+"и");add("s","dat",s+"и");add("s","acc",L);add("s","ins",s+"ью");add("s","pre",s+"и");
    add("p","nom",s+"и");add("p","gen",s+"ей");add("p","dat",s+"ям");add("p","ins",s+"ями");add("p","pre",s+"ях");}
  else if(/[ое]$/.test(L)){var s=L.slice(0,-1),soft=/е$/.test(L)&&!sib.test(s),ie=/ие$/.test(L);
    add("s","nom",L);add("s","acc",L);add("s","gen",s+(soft?"я":"а"));add("s","dat",s+(soft?"ю":"у"));add("s","ins",s+(soft?"ем":"ом"));add("s","pre",s+(ie?"и":"е"));
    add("p","nom",s+(soft?"я":"а"));add("p","acc",s+(soft?"я":"а"));add("p","gen",ie?s.slice(0,-1)+"ий":soft?s+"ей":s);add("p","dat",s+(soft?"ям":"ам"));add("p","ins",s+(soft?"ями":"ами"));add("p","pre",s+(soft?"ях":"ах"));}
  else {var soft=/[йь]$/.test(L),b=soft?L.slice(0,-1):L,stems=[b],m=/^(.*[^аеёиоуыэюя])[оее]([^аеёиоуыэюяйь])$/.exec(b);if(m&&b.length>3)stems.push(m[1]+m[2]);
    if(/ец$/.test(b)&&b.length>3)stems.push(b.slice(0,-2)+"ц");
    add("s","nom",L);add("s","acc",L);
    stems.forEach(function(s){var y=soft||/й$/.test(L);
      add("s","gen",s+(y?"я":"а"));add("s","dat",s+(y?"ю":"у"));add("s","ins",s+(y?"ем":sib.test(s)?"ем":"ом"));if(y)add("s","ins",s+"ём");add("s","pre",s+"е");
      add("s","acc",s+(y?"я":"а"));
      add("p","nom",s+(y||hard.test(s)?"и":"ы"));add("p","gen",s+(/ь$/.test(L)||sib.test(s)?"ей":/й$/.test(L)?"ев":"ов"));add("p","dat",s+(y?"ям":"ам"));add("p","ins",s+(y?"ями":"ами"));add("p","pre",s+(y?"ях":"ах"));});}
  if(irr.f)Object.keys(irr.f).forEach(function(c){T.s[c]=[irr.f[c]];});
  if(irr.p){T.p={};Object.keys(irr.p).forEach(function(c){add("p",c,irr.p[c]);});}
  if(T.p.nom&&!T.p.acc)T.p.nom.forEach(function(f){add("p","acc",f);});
  if(T.p.gen)T.p.gen.forEach(function(f){add("p","acc",f);});
  return T;
}
/* 形 f の辞書の形を探す（単語帳にある名詞だけ） */
function wLemma(f,o){
  var X=wLex(),k=low(f),c=[];
  if(o&&o.base&&low(o.base)!==k)c.push(low(o.base));
  Object.keys(W_IRR).forEach(function(L){var T=wDecl(L);["s","p"].forEach(function(n){Object.keys(T[n]).forEach(function(cs){if(T[n][cs].indexOf(k)>=0)c.push(L);});});});
  var st=k.replace(/(ами|ями|ах|ях|ам|ям|ом|ем|ём|ой|ей|ою|ью|ов|ев|ий|ы|и|а|я|у|ю|е|о|ь)$/,"");
  [st,st+"а",st+"я",st+"о",st+"е",st+"ь",st+"й",st+"ие",st+"ия"].forEach(function(x){c.push(x);});
  if(/[^аеёиоуыэюя][^аеёиоуыэюя]$/.test(st)){c.push(st.slice(0,-1)+"о"+st.slice(-1));c.push(st.slice(0,-1)+"е"+st.slice(-1));c.push(st.slice(0,-1)+"ок");}
  if(/ц$/.test(st))c.push(st.slice(0,-1)+"ец");
  if(/енк$/.test(st))c.push(st.slice(0,-1)+"ок");
  for(var i=0;i<c.length;i++){var L=c[i],w=X[L];if(!w||w.pos!=="noun")continue;var T=wDecl(L),hit=[],pl=null;
    ["s","p"].forEach(function(n){Object.keys(T[n]).forEach(function(cs){if(T[n][cs].indexOf(k)>=0){hit.push([n,cs]);}});});
    if(hit.length)return {L:L,w:w,hit:hit};}
  return null;
}
/* 動詞の形を語尾から決める（単語帳に形の名前がないとき） */
function wVGuess(a,base){
  var x=low(a).replace(/(ся|сь)$/,""),b=low(base||"");
  if(x===b.replace(/(ся|сь)$/,"")&&/(ть|ти|чь)$/.test(x))return "不定形";
  if(/(л|ла|ло|ли)$/.test(x)||/(шел|шла|шло|шли)$/.test(x))return /ли$/.test(x)?"複数・過去":/ла$/.test(x)?"女性・過去":/ло$/.test(x)?"中性・過去":"男性・過去";
  if(/(вший|вшая|вшее|вшие|щий|щая|щее|щие|нный|нная|нное|нные|тый|тая|тое|тые)$/.test(x))return "形動詞";
  if(/(ите|йте|ьте)$/.test(x)&&!/(ете|ёте)$/.test(x))return /ите$/.test(x)?"вы の形または命令形（丁寧）":"命令形（丁寧）";
  if(/(ете|ёте)$/.test(x))return "вы の形";
  if(/(ешь|ёшь|ишь)$/.test(x))return "ты の形";
  if(/(ем|ём|им)$/.test(x))return "мы の形";
  if(/(ют|ут|ят|ат)$/.test(x))return "они の形";
  if(/(ет|ёт|ит)$/.test(x))return "он・она の形";
  if(/(ю|у)$/.test(x))return "я の形";
  if(/(я|а|в)$/.test(x)&&b&&x!==b)return "副動詞（〜しながら・〜して）";
  if(/(й|и|ь)$/.test(x)&&x!==b)return "命令形";
  return "";
}
/* 短い形容詞（должен・рад・готов・занят…）：語尾で性・数が決まる */
function wShort(a,base){var x=low(a),b=low(base||"");if(!b||!/(ен|ад|ов|ят|ен|ан|ив|ин|ет|ит|ст|ол|ел|ок|ек|ок)$/.test(b))return "";
  if(x===b)return "短い形・男性";var st=b.replace(/([^аеёиоуыэюя])[ео]([^аеёиоуыэюя])$/,"$1$2");
  if(x===b+"а"||x===st+"а")return "短い形・女性";if(x===b+"о"||x===st+"о")return "短い形・中性";if(x===b+"ы"||x===st+"ы"||x===b+"и"||x===st+"и")return "短い形・複数";return "";}
/* 空欄の前の語（前置詞・数・нет）と、文の中の動詞・主語・時の語から「どの形が必要か」を決める */
function wHead(o){return /\s/.test(String(o).trim())&&!wConj(o)?String(o).trim().split(/\s+/).pop():o;}
function wNeed(it){
  var s=low(it.s),i=s.indexOf("＿"),bef=wTok(s.slice(0,i)),aft=wTok(s.slice(i+1)),p1=bef[bef.length-1]||"",p2=bef[bef.length-2]||"",all=bef.concat(aft);
  var A=wInfo(wHead(it.a)),r={A:A,aft:aft};
  /* 前置詞（空欄のすぐ前、または「前置詞＋形容詞＋＿」） */
  var prep=W_PREP[p1]||W_PREP[p2]&&!W_PREP[p1]&&/(ой|ом|ем|ую|юю|ые|ие|ых|их|ым|им|ей|ий|ый|ое|ее|ая|яя|его|ему|ого|ому|ими|ыми|мой|моей|моём|твоём|нашем|вашем|этом|этой|том|той)$/.test(p1)&&W_PREP[p2];
  var pw=W_PREP[p1]?p1:p2;
  if(prep&&A.cs.indexOf(prep[0])>=0){r.c=prep[0];r.why="前置詞 "+prep[1]+" のうしろは、いつも"+W_CJ[prep[0]]+"です。";return r;}
  if((p1==="в"||p1==="на"||p1==="во"||((p2==="в"||p2==="на")&&!W_PREP[p1]))&&(A.cs.indexOf("pre")>=0||A.cs.indexOf("acc")>=0)){
    var mv=all.some(function(t){return /^(ид|ход|шё|шл|пош|пойд|ех|ед|езж|поех|поед|приех|прид|пришё|пришл|вернул|возвращ|лет|полет|бега|кла|полож|поста|пове|сес|сяд|сад|спеш|опазд|опозд)/.test(t);});
    if(A.cs.indexOf("acc")>=0&&(mv||A.cs.indexOf("pre")<0)){r.c="acc";r.why="в・на には2つの使い方があります。「どこへ（行き先）」なら対格、「どこで（場所）」なら前置格。この文は"+(mv?"行く・来る・置くなどの動き（行き先）":"行き先")+"なので対格です。";return r;}
    if(A.cs.indexOf("pre")>=0){r.c="pre";r.why="в・на には2つの使い方があります。「どこへ（行き先）」なら対格、「どこで（場所）」なら前置格。この文は「どこで」（いる・住む・働く場所など）なので前置格です。";return r;}}
  if((p1==="с"||p1==="со"||p2==="с"&&!W_PREP[p1])&&A.cs.indexOf("ins")>=0){r.c="ins";r.why="с が「〜と一緒に・〜入りの」の意味のとき、うしろは造格です（「〜から」の意味なら生格）。";return r;}
  if((p1==="с"||p1==="со")&&A.cs.indexOf("gen")>=0&&A.cs.indexOf("ins")<0){r.c="gen";r.why="с が「〜から」（с японского＝日本語から、с работы＝仕事から）の意味のとき、うしろは生格です（「〜と一緒に」なら造格）。";return r;}
  if((p1==="за"||p1==="под")&&A.cs.indexOf("ins")>=0){r.c="ins";r.why=p1+"（"+(p1==="за"?"〜のうしろに・〜を取りに":"〜の下に")+"）で「どこに」を言うときは造格です（「どこへ」なら対格）。";return r;}
  if((p1==="за"||p1==="под")&&A.cs.indexOf("acc")>=0){r.c="acc";r.why=p1+" で「どこへ」や「〜のお礼に・〜の間に」を言うときは対格です。";return r;}
  /* 数・量のあと */
  var num=p1;if(/^(один|одна|одно)$/.test(num)&&A.cs.indexOf("nom")>=0){r.c="nom";r.why="1（один・одна・одно）のあとは、名詞は主格（辞書の形）のままです。";return r;}
  if(/^(два|две|три|четыре|оба|обе|полтора)$/.test(num)&&A.cs.indexOf("gen")>=0){r.c="gen";r.why="2・3・4（два／две／три／четыре）のあとは、名詞は「単数の生格」になります。数の数え方の決まりで、意味とは関係ありません。";return r;}
  if(/^(пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать|тринадцать|четырнадцать|пятнадцать|шестнадцать|семнадцать|восемнадцать|девятнадцать|двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|сто|двести|триста|сколько|много|мало|несколько|немного)$/.test(num)&&A.cs.indexOf("gen")>=0){
    r.c="gen";r.why="5以上の数（20・100 などもふくむ）や сколько（いくつ）・много（たくさん）・несколько（いくつか）のあとは、名詞は「複数の生格」になります。";return r;}
  if(/^(лет|года|год)$/.test(it.a.toLowerCase())&&/\d|два|три|пять|двадцать|сто/.test(s)){r.c="gen";r.why="年数・年齢は、最後の数字で形が決まります。1 → год、2・3・4 → года、5〜20 と 0 → лет。";return r;}
  if(bef.some(function(t){return /^(сколько|много|мало|несколько|немного)$/.test(t);})&&A.cs.indexOf("gen")>=0&&A.pl){r.c="gen";r.why="сколько（いくつ）・много（たくさん）・несколько（いくつか）のように「数・量」をたずねたり言ったりする語があると、数えるものは「複数の生格」になります。";return r;}
  if(/^(утром|днём|днем|вечером|ночью|весной|летом|осенью|зимой)$/.test(low(it.a))){r.c="ins";r.why="утром（朝に）・днём（昼に）・вечером（夜に）・летом（夏に）・зимой（冬に）は、「〜に（時）」を表す造格の形で、前置詞なしで使います。";return r;}
  /* нет／не было のあと */
  if(bef.indexOf("нет")>=0||/не (было|будет)/.test(s.slice(0,i))){if(A.cs.indexOf("gen")>=0){r.c="gen";r.why="нет（〜がない）、не было（なかった）、не будет（ないだろう）のあとは、ない物・いない人を生格で言います。";return r;}}
  /* 与格をとる言い方 */
  if(A.cs.indexOf("dat")>=0&&all.some(function(t){return /^(звон|позвон|помога|помог|помож|дар|подар|отвеч|ответ|совет|посовет|меша|помеша|вер|нрав|понрав|нужн|нужен|надо|нельзя|можно|холодно|тепло|жарко|скучно|интересно|весело|грустно|плохо|хорошо|лет|года|год|пиш|напиш|напомн|звонит|обеща|пообещ|покаж|показ|объясн|скаж|сказ|говор|дай|дайте|дам|дал|приш|пришл|посла|отправ|улыба|рад)/.test(t);})){
    r.c="dat";r.why="「だれに」（電話する・あげる・言う・見せる・手伝う相手）や、「〜にとって」（好き・必要・寒い・〜歳）は与格で言います。日本語の「〜に」とほぼ同じ感覚です。";return r;}
  /* 比較級のあとの「〜より」 */
  if(A.cs.indexOf("gen")>=0&&/^(старше|младше|моложе|лучше|хуже|больше|меньше|выше|ниже|дороже|дешевле|умнее|сильнее|быстрее|[а-я]+ее)$/.test(p1)){r.c="gen";r.why="比較級（старше＝年上だ、лучше＝よりよい など）のすぐあとに名詞・代名詞を置くと「〜より」の意味になり、それは生格で言います（старше меня＝私より年上）。чем を使うなら чем я のように主格です。";return r;}
  if(A.cs.indexOf("dat")>=0&&all.some(function(t){return /^(кажется|казалось|кажутся|хочется|хотелось|нравится|нравятся|нравилось|понравился|понравилась|понравилось)$/.test(t);})){r.c="dat";r.why="кажется（〜と思える）・нравится（気に入る）・хочется（〜したい気がする）は、そう感じる人を与格で言います（Мне кажется＝私には〜と思える）。日本語の「私は」ではなく「私には」と考えます。";return r;}
  /* 文の頭の主語 */
  if(A.cs.indexOf("nom")>=0&&!bef.length&&A.pos==="noun"){r.c="nom";r.why="空欄は文の主語（〜が・〜は）です。主語は主格（辞書の形、複数なら主格の複数）で言います。";return r;}
  /* 「я＋動詞＋＿」の物の目的語（対格＝主格と同じ形） */
  if(A.cs.indexOf("nom")>=0&&A.cs.indexOf("gen")<0&&A.pos==="noun"&&!prep&&bef.length>=2&&bef.some(function(t){return W_SUBJ[t];})&&!/^(в|на|во|с|со|за|под|это|вот|и|а|но|или|что|быть|был|была|были|стал|стала|стали)$/.test(p1)&&wInfo(p1).pos==="verb"){r.c="acc";r.why="空欄は、動詞 "+p1+" が直接はたらきかける相手（〜を）なので対格です。物を表す男性名詞・中性名詞と、物の複数は、対格が主格と同じ形になります（проверю документы＝書類を確認する）。";return r;}
  /* 生格をとる動詞（бояться＝〜をこわがる など） */
  if(A.cs.indexOf("gen")>=0&&all.some(function(t){return /^(бо[иаюя]|испуга|избега|достиг|желаю|жела|пугал)/.test(t);})){r.c="gen";r.why="бояться（〜をこわがる）・желать（〜を願う）・достигать（〜に達する）は、「〜を」の相手を生格で言う動詞です。日本語の「〜が・〜を」に合わせて主格や対格にしないように覚えておきます。";return r;}
  /* 「名詞＋＿」で持ち主・部分（машина отца＝父の車） */
  if(A.cs.indexOf("gen")>=0&&!prep&&p1&&wLex()[p1]&&wLex()[p1].pos==="noun"&&!/^(в|на|с|за|под|и|а|но|не|это|что|как)$/.test(p1)){r.c="gen";r.why="名詞のすぐうしろに置いて「〜の」（だれの・何の）を言うときは生格です。日本語とは順番が逆で、「машина（車）＋ отца（父の）」のように、説明する名詞のあとに置きます。";return r;}
  /* 主語のない文で「〜にとって」（Мне удобно＝私には都合がいい） */
  if(A.cs.indexOf("dat")>=0&&all.some(function(t){return /^(удобно|неудобно|интересно|весело|грустно|скучно|трудно|легко|стыдно|страшно|пора|жаль|жалко|лень|приятно|больно|плохо|хорошо|понятно|непонятно|некогда|нечего|негде|некуда|исполнилось|лет|года|год)$/.test(t);})){r.c="dat";r.why="удобно（都合がいい）・трудно（むずかしい）・интересно（おもしろい）のような「主語のない文」では、そう感じる人を与格で言います（Мне удобно＝私には都合がいい）。日本語の「私は」ではなく「私には」と考えます。";return r;}
  /* 「〜を」をとる動詞のあとの代名詞（Меня зовут…、Я жду вас…） */
  if(A.cs.indexOf("acc")>=0&&W_PRON[low(it.a)]&&!prep&&all.some(function(t){return /^(зов|позов|люб|жд|подожд|вид|увид|зна|понима|поним|слуша|спрос|спраш|прош|попрос|поздрав|благодар|встреч|встрет|ищ|иска|найд|нашёл|нашл|помн|запомн|забыл|забуд|пригла|приглас|провод|провож|отвез|отвоз|отвед|вед|вез|бер|брал|взял|возьм|целу|обним|слыш|услыш|узна|узнал)/.test(t);})){
    r.c="acc";r.why=(all.indexOf("зовут")>=0?"Меня зовут… は「（人は）私を…と呼ぶ」という言い方です。呼ばれる人は「〜を」に当たるので対格（меня・тебя・его・её・вас）になります。":"この文の動詞は「〜を」をとる動詞（待つ・見る・知る・愛する・招く など）です。「〜を」に当たる人は対格で言います。");return r;}
  /* 造格をとる動詞 */
  if(A.cs.indexOf("ins")>=0&&all.some(function(t){return /^(стал|стан|стать|работа|занима|интерес|увлека|был|была|были|будет|буду|являет|горд|доволен|довольн|пользу|пиш|ед|ест)/.test(t);})){
    r.c="ins";r.why="стать（〜になる）・работать（〜として働く）・заниматься（〜をする）・интересоваться（〜に興味がある）や、道具・手段（ペンで書く、スプーンで食べる、カードで払う）は造格で言います。";return r;}
  if(A.cs.indexOf("ins")>=0&&!prep){r.c="ins";r.why="前置詞なしの造格は「〜で（道具・手段）」や「〜として」を表します。";return r;}
  if(A.cs.indexOf("acc")>=0&&!prep&&A.cs.indexOf("nom")<0&&A.pos==="noun"&&!/^(в|на|во|с|со|за|под)$/.test(p1)){r.c="acc";r.why="動詞が直接はたらきかける相手（〜を）は対格です。";return r;}
  if(A.cs.length===1&&A.cs[0]==="gen"&&!prep&&/^[а-яё]+$/.test(p1)&&!W_PREP[p1]&&!/^(в|на|во|с|со|за|под|и|а|но|не|это|что|как)$/.test(p1)&&A.pos==="noun"){r.c="gen";r.why="名詞のうしろにつけて「〜の」（持ち主・部分）を言うときは生格です。";return r;}
  return r;
}
var W_SUBJ={"я":"я","ты":"ты","он":"он・она","она":"он・она","оно":"он・она","мы":"мы","вы":"вы","они":"они"};
function wVerb(it,A){
  var s=low(it.s),i=s.indexOf("＿"),toks=wTok(s),bef=wTok(s.slice(0,i)),lab=A.lab||"",out=[];
  /* 主語は、空欄と同じ節（コンマで区切られた部分）の中の я・ты・он… */
  var cl=s.split(/[,;—]/),pos0=0,ci=0;for(var q=0;q<cl.length;q++){if(i>=pos0&&i<=pos0+cl[q].length){ci=q;break;}pos0+=cl[q].length+1;}
  var ct=wTok(cl[ci]||s),subj=null;ct.forEach(function(t,k){if(W_SUBJ[t]&&!subj&&!W_PREP[ct[k-1]||""]&&!/^(с|со)$/.test(ct[k-1]||""))subj=t;});
  if(A.vyAmb&&lab==="вы の形")out.push("-ите／-ете で終わる形は、「вы（あなた）が〜する」と「〜してください」（頼む形）が同じつづりです。この文には主語の вы があり、質問・説明の文なので「あなたは〜する」の意味です。");
  if(A.vyAmb&&lab!=="вы の形")out.push("-ите／-ете で終わる形は、「вы（あなた）が〜する」と「〜してください」（頼む形）が同じつづりです。この文には主語がないので「〜してください」の意味です。");
  if(/の形$/.test(lab)&&!/命令/.test(lab)){var who=lab.replace(/ の形.*/,"");
    if(subj&&W_SUBJ[subj].indexOf(who.split("・")[0])>=0)out.push("主語が "+subj+" なので、動詞は "+who+" の形にします。ロシア語の動詞は、主語（я・ты・он／она・мы・вы・они）ごとに語尾が変わります。");
    else out.push("動詞は主語に合わせて語尾が変わります。この文の主語に合うのは "+who+" の形です。");}
  var a=low(it.a),past=/過去/.test(lab)||/(л|ла|ло|ли|лся|лась|лось|лись|ёл|ог|ёк|ёз)$/.test(a)&&!/の形$/.test(lab),
    pe=!past?"":/(ли|лись)$/.test(a)?"複数・вы（-ли）":/(ла|лась)$/.test(a)?"女性ひとり（-ла）":/(ло|лось)$/.test(a)?"中性（-ло）":"男性ひとり（-л）";
  if(pe==="中性（-ло）"&&/(пять|шесть|семь|восемь|девять|десять|двадцать|сто|много|несколько|мало)/.test(s))out.push("5以上の数や много（たくさん）・несколько（いくつか）が主語のときは、動詞は中性・単数（-ло）にするのが決まりです。");
  else if(pe){out.push("過去形は、主語の性と数で語尾が決まります（男性ひとり -л、女性ひとり -ла、中性 -ло、複数・вы -ли）。"+
    (subj==="я"||subj==="ты"?"主語の "+subj+" は男性なら -л、女性なら -ла。この文は "+pe+" の形です。":subj?"主語は "+subj+" なので "+pe+" の形です。":"この文の主語に合わせて "+pe+" の形です。"));}
  /* 同じ動詞の完了体・不完了体が並んでいるとき */
  var pair=it.w.filter(function(o){var x=low(o);return x!==a&&(a.length>x.length?a.slice(-x.length)===x:x.slice(-a.length)===a)&&Math.abs(a.length-x.length)<=4;});
  if(pair.length&&pe){var perf=a.length>low(pair[0]).length;
    out.push("選択肢に同じ動詞の完了体と不完了体があります。"+(perf?"答えは完了体：1回で終わったこと・その結果（〜し終えた）や、次々に起きたことを言うときに使います。":"答えは不完了体：その動作をしていた（続いていた）こと・くり返し・「〜したことがある」を言うときに使います。"));}
  if(!/命令/.test(lab)&&A.pos==="verb"&&/(ите|йте|ьте)$/.test(a)&&!/の形/.test(lab)||/(^|[^а-яё])(пожалуйста)/.test(s)&&/(и|й|ь)$/.test(a)&&!/ть$/.test(a)&&A.pos==="verb")lab=lab+"命令";
  if(a!=="есть"&&(/不定形/.test(lab)||it.a===A.base&&/(ть|ти|чь|ться|тись)$/.test(a))){
    var t=bef.slice(-3).join(" ");
    if(/буд/.test(t))out.push("буду・будешь など（未来を作る быть）のうしろの動詞は、辞書の形（不定形）のままです。");
    else if(/мог|мож|хоч|хот|над|нужн|нельз|можн|люб|умею|уме|нач|конч|стал|пора|чтобы|реш|забыл|забуд|прош|попрос|сов|прид|ид|пошл|пойд/.test(t))out.push("「できる（мочь）・したい（хотеть）・必要だ（надо・нужно）・好きだ（любить）・始める・〜するために（чтобы）」などのうしろの動詞は、辞書の形（不定形）のままです。主語に合わせて形を変えるのは、前の語のほうです。");
    else if(/^(как|что|где|куда|когда|зачем|почему)$/.test(bef[0]||""))out.push("「как это сказать?（どう言えばいい？）」のように、主語を言わずに「〜すればいいか」とたずねる文では、動詞は辞書の形（不定形）を使います。");}
  if(/命令/.test(lab))out.push("「〜してください」と頼む文なので命令形です。вы や知らない人には -те のついた形を使います。");
  if(bef.some(function(t){return t==="давай"||t==="давайте";})&&/мы/.test(lab))out.push("давай（давайте）＋мы の形（未来）で「一緒に〜しよう」とさそう言い方になります。");
  /* чтобы＋過去形（〜するように） */
  if(past&&bef.indexOf("чтобы")>=0)out.push("чтобы のうしろに別の主語（ты・ребёнок など）が来るときは、動詞を過去形にします（Я хочу, чтобы ты пришёл＝君に来てほしい）。形は過去でも意味は「〜するように・〜してほしい」で、過去のことではありません。");
  /* 行く：идти（今そこへ向かう・1回・一方向）と ходить（往復・くり返し・習慣） */
  var mvA=/^(ид|ход|хож|шел|шла|шли|ех|ед|езд|езж)/.test(a),mvO=it.w.some(function(o){var x=low(o);return /^(ид|ход|хож|шел|шла|шли|ех|ед|езд|езж)/.test(x)&&(/^(ход|хож|езд|езж)/.test(x)!==/^(ход|хож|езд|езж)/.test(a));});
  if(mvA&&mvO)out.push(/^(ход|хож|езд|езж)/.test(a)?"「行く」には2種類あります。идти・ехать は「今そこへ向かっている（1回・一方向）」、ходить・ездить は「行って帰ってくる・何度も通う（くり返し・習慣）」。この文は"+(/(часто|каждый|каждую|каждое|обычно|всегда|иногда|редко|вчера|раньше)/.test(s)?"くり返し・往復（часто・каждый・вчера など）":"くり返し・往復")+"なので ходить・ездить の形です。":"「行く」には2種類あります。идти・ехать は「今そこへ向かっている（1回・一方向）」、ходить・ездить は「行って帰ってくる・何度も通う（くり返し・習慣）」。この文は今・これから1回向かうことなので идти・ехать の形です。");
  var cs0=cl[ci]||s;
  if(/(вчера|назад|прошл)/.test(cs0))out.push("вчера（昨日）・〜назад（〜前）・в прошлом…（この前の）のように、過去の時を表す語があります。");
  if(/(завтра|скоро|потом|через|следующ|будущ)/.test(cs0))out.push("завтра（明日）・скоро（もうすぐ）・через（〜後に）のように、これからの時を表す語があります。");
  if(/(каждый|каждую|каждое|часто|обычно|всегда|иногда|долго|редко)/.test(cs0))out.push("каждый（毎〜）・часто（よく）・всегда（いつも）・долго（長いあいだ）のような、くり返しや続く時間を表す語があるときは、不完了体を使います。");
  return out;
}
function wAdj(it,A){
  var s=low(it.s),i=s.indexOf("＿"),aft=wTok(s.slice(i+1)),n=aft[0];if(!n)return [];
  var N=wInfo(n);if(!N.o||!N.w||N.w.pos!=="noun")return [];
  var g=null;try{var gi=p72GenderInfo(N.w,N.o.g);g=gi&&gi.g;}catch(_){}
  var cn=N.cs.map(function(c){return W_CN[c];}).join("・"),gn=N.pl?"複数":(g?P72_GNAME[g].replace("名詞",""):"");
  var pr=W_PREP[wTok(s.slice(0,i)).slice(-1)[0]||""];
  return ["形容詞（や мой・этот・какой・который）は、説明する名詞に「性・数・格」をそろえます。うしろの名詞 "+n+" は"+[gn,cn].filter(Boolean).join("・")+(gn||cn?"なので、":"に合わせて、")+"形容詞も同じ性・数・格の語尾にします。"+(pr?"前置詞 "+pr[1]+" のうしろなので、名詞も形容詞も"+W_CN[pr[0]]+"です。":"")];
}
/* ---------- 決まった言い方（単語の辞書の意味だけでは文の意味にならないもの） ---------- */
var W_IDIOM=[
  [/(^|[.!?] )есть |у [а-яё]+ есть|есть ли /,"есть＝「ある・いる」（存在の есть）",
   "есть には2つの別の語があります。①「ある・いる」の есть（У меня есть машина＝私には車がある、Есть другой цвет?＝別の色はありますか）は形が変わりません。②「食べる」の есть は я ем・он ест・мы едим と変わります。ест・едим は②の形なので、「ある」の意味の文には入りません。"],
  [/(ид[её]т|шёл|шел|шла|шли|пойд[её]т) (снег|дождь)|(снег|дождь) (ид[её]т|шёл|шел)/,"идёт снег／идёт дождь＝「雪／雨が降る」",
   "идти の基本の意味は「歩いて行く」ですが、雨や雪が「降っている」、授業や映画が「行われている・上映中だ」のように、何かが続いて進んでいるときにも идти を使います（Идёт урок＝授業中です、Что идёт в кино?＝映画館で何をやっている？）。日本語の「降る」に当たる別の動詞は使いません。過去なら шёл снег（男性名詞 снег に合わせて шёл）、шёл дождь です。"],
  [/(меня|тебя|его|её|ее|вас|нас|их) зовут|как (вас|тебя|его|её|ее) зовут/,"Меня зовут …＝「私の名前は…です」",
   "直訳は「（人々は）私を…と呼ぶ」。звать（呼ぶ）の они の形 зовут を、主語を言わずに使います。名前を言われる人は「〜を」に当たるので対格（меня・тебя・его・её・вас）。名前そのものは主格のままです。"],
  [/у (меня|тебя|него|неё|нее|нас|вас|них|[а-яё]+[аыиуе]) (есть|нет|был|была|было|были|будет)/,"у＋人＋есть＝「（人）は…を持っている・…がいる」",
   "ロシア語では「私は犬を持っている」を「私のところに犬がある（У меня есть собака）」と言います。у のうしろの人は生格（меня・тебя・него…）、持っている物は主格です。ないときは нет＋生格（У меня нет собаки）。"],
  [/сколько сто(ит|ят|ил|ила|или)/,"Сколько стоит …?＝「…はいくらですか」",
   "стоить（値段が〜だ）は、値段をきかれる物が主語です。物が1つなら стоит、2つ以上なら стоят。"],
  [/(мне|тебе|ему|ей|нам|вам|им|[а-яё]+[уеи]) (очень )?(нравится|нравятся|понравился|понравилась|понравилось|понравились|нравился|нравилась|нравилось|нравились)/,"мне нравится …＝「私は…が好き（気に入っている）」",
   "直訳は「…は私に気に入られている」。好きなもの（…）が主語で、好きな人は与格（мне・тебе・ему…）。だから動詞は好きなものに合わせます（Мне нравится музыка／Мне нравятся фильмы）。"],
  [/(мне|тебе|ему|ей|нам|вам|им) (очень )?(холодно|жарко|тепло|скучно|интересно|грустно|весело|плохо|хорошо|страшно|трудно|легко)/,"мне холодно＝「私は寒い」",
   "気持ちや体の感じは「私にとって寒い」と言います。感じる人は与格（мне・тебе…）、感じは -о の形（холодно・скучно）。я холодный とは言いません。"],
  [/(мне|тебе|ему|ей|нам|вам|им) (нужно|надо|можно|нельзя|пора)/,"мне нужно／надо …＝「私は…しなければならない」",
   "нужно・надо（必要だ）、можно（してよい）、нельзя（してはいけない）は、する人を与格（мне・тебе…）にして、うしろに動詞の辞書の形（不定形）を置きます。"],
  [/(лет|год|года)\b|(мне|тебе|ему|ей|вам) [а-яё]+ (лет|год|года)/,"年齢＝与格＋数＋год／года／лет",
   "「私は20歳です」は Мне двадцать лет（私にとって20年）。年をとる人は与格。年の語は数で決まります：1 → год、2・3・4 → года、5〜20 → лет。"],
  [/как (это )?сказать/,"Как (это) сказать …?＝「（これを）…でどう言いますか」",
   "だれが言うかを決めない「どう言えばいい？」という一般的な問いなので、主語に合わせた形（скажу・скажите など）ではなく、動詞の辞書の形（不定形）сказать を使います。日本語の「どう言う？」と同じく、主語がない言い方です。"],
  [/по-(русски|японски|английски|китайски|французски|немецки)/,"по-русски＝「ロシア語で」",
   "по-＋-ски の形は「〜語で（話す・書く）」という副詞で、形は変わりません。говорить по-русски（ロシア語を話す）。「ロシア語」という名詞は русский язык です。"],
  [/^(сегодня |вчера |завтра |зимой |летом |здесь |там |на улице )*(было |будет )?(холодно|жарко|тепло|прохладно)/,"天気・気温＝主語なしの -о の形",
   "「今日は寒い」は Сегодня холодно。主語（「天気が」など）を言わず、холодно・жарко・тепло のような -о で終わる形だけで言います。過去は было холодно、未来は будет холодно。"],
  [/как дела/,"Как дела?＝「元気？・調子はどう？」","直訳は「用事（дела）はどう？」。あいさつの決まった言い方です。"],
  [/давай(те)? /,"давай（те）＋動詞＝「〜しよう」","さそうときの言い方。いっしょにすることは мы の未来の形（Давай посмотрим＝見よう）か、くり返すことなら不定形（Давай говорить по-русски）。"],
  [/(еду|едем|ед[её]шь|ед[её]т|едете|едут|ехать|ездить|езжу|ездим|ездит|ездят|поеду|поедем|поехал|поехала|поехали|ездил|ездила|ездили) на (автобусе|поезде|машине|метро|такси|велосипеде|трамвае|троллейбусе|самол[её]те)/,"на＋乗り物（前置格）＝「〜で（行く）」",
   "乗り物で行くときは ехать・ездить を使い、乗り物は на＋前置格（на автобусе＝バスで）。歩いて行くときは идти・ходить です。"],
  [/играть в |играю в |играет в |играем в |играют в |играл в /,"играть в＋スポーツ・ゲーム（対格）","サッカーやチェスなど「〜をする」は в＋対格（играть в футбол）。楽器は на＋前置格（играть на гитаре）。"],
  [/играть на |играю на |играет на |играем на |играют на |играл на /,"играть на＋楽器（前置格）","楽器を「ひく」は на＋前置格（играть на гитаре）。スポーツは в＋対格です。"],
  [/спасибо за/,"спасибо за＋対格＝「〜をありがとう」","お礼の理由は за＋対格（Спасибо за помощь＝手伝ってくれてありがとう）。"],
  [/в (понедельник|вторник|среду|четверг|пятницу|субботу|воскресенье)/,"в＋曜日（対格）＝「〜曜日に」","曜日は в＋対格：в среду（水曜に）、в субботу（土曜に）。-а で終わる曜日は -у になります。"],
  [/в (\d+|один|два|три|четыре|пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать) (час|часа|часов)/,"в＋数＋час＝「〜時に」","時刻は в＋数＋час：в час（1時に）、в два часа（2時に）、в пять часов（5時に）。час の形は数で決まります。"],
  [/рад(а|ы)? (вас|тебя|его|её) видеть/,"Рад вас видеть＝「お会いできてうれしいです」","рад（うれしい）は話す人の性・数で形が変わります：男性 рад、女性 рада、複数 рады。"],
  [/извините|простите/,"Извините／Простите＝「すみません」","人に話しかける・あやまるときの決まった言い方（丁寧な命令形の形）。"],
  [/(думаю|думаешь|думает|думаем|думаете|думают|думать|говорить|говорим|рассказывать|рассказывает|рассказал|рассказала|спросить|спрашивать|мечтать|мечтаю|заботиться|забочусь) о /,"о＋前置格＝「〜について」","「〜について考える・話す」は о＋前置格（думать о маме＝母のことを考える）。"]
];
function wIdioms(it){
  var t=low(it.t==="gap"?full(it):(it.say||"")),out=[];
  W_IDIOM.forEach(function(d,k){if(d[0].test(t)||k===0&&it.t==="gap"&&low(it.a)==="есть"&&it.w.some(function(o){return /^(ест|едим|ем)$/.test(low(o));}))out.push([d[1],d[2]]);});
  return out;
}
/* 形の名前を、日本語の「どういう意味になるか」に言いかえる */
function wGloss(lab,pos){
  if(!lab)return "";
  if(/命令/.test(lab))return "「〜してください・〜して」と頼む形";
  if(/過去/.test(lab))return "「〜した（〜していた）」という過去の形";
  var m=lab.match(/^(я|ты|он・она|мы|вы|они) の形/);if(m)return "「"+{"я":"私が","ты":"君が","он・она":"彼・彼女が","мы":"私たちが","вы":"あなた（たち）が","они":"彼らが"}[m[1]]+"〜する」という形";
  if(/不定形|辞書の形/.test(lab)&&pos==="verb")return "「〜する（こと）」という、主語を決めない辞書の形";
  if(/短い形/.test(lab))return "「〜だ・〜されている」という短い形";
  var c=[];Object.keys(P72_CASEK).forEach(function(k){if(lab.indexOf(k)>=0)c.push({nom:"「〜が・〜は」",gen:"「〜の・〜がない」",dat:"「〜に」",acc:"「〜を・〜へ」",ins:"「〜で・〜と」",pre:"「〜で（場所）・〜について」"}[P72_CASEK[k]]);});
  return c.length?c.join("・")+"の形":"";
}
/* 文の単語ごとの意味（辞書の形と、文の中の形） */
function wGlossList(it){
  var t=it.t==="gap"?full(it):(it.say||""),seen={},rows=[];
  (t.match(/[А-Яа-яЁё́\-]+/g)||[]).forEach(function(tok){var k=low(tok);if(seen[k])return;seen[k]=1;var r=null;try{r=p72Look(tok);}catch(_){}
    if(!r||!r.mean)return;var b=plain(r.base||""),ch=low(b)!==k;
    /* 文の中での働き：形の名前（格・だれの形・過去など）と、それが日本語で何に当たるか */
    var I=null;try{I=wInfo(tok);}catch(_){}var lab=I&&I.lab?I.lab:(r.form&&!r.guess?r.form:""),gl=lab?wGloss(lab,I&&I.pos):"";
    rows.push('<li><b>'+esc(tok)+'</b>'+(ch?'（辞書の形 '+esc(b)+'）':'')+'　'+esc(r.mean)+(lab?'<small>　'+esc(lab)+(gl?'＝'+esc(gl):'')+'</small>':'')+'</li>');});
  return rows.length?'<details class="p86-gl"'+(window.P86_GL_OPEN?' open':'')+'><summary>この文の単語：意味と働き</summary><ul>'+rows.join("")+'</ul><p class="p86-mut">単語を押すと、くわしい説明と辞書のページが開きます。</p></details>':"";
}
function moreHtml(it){
  if(it.t!=="gap"&&it.t!=="hear")return "";
  var rows=[];
  if(it.t==="gap"&&it.j)rows.push(["文の意味",esc(it.j)]);
  wIdioms(it).forEach(function(d){rows.push(["決まった言い方",'<b>'+esc(d[0])+'</b><br>'+esc(d[1])]);});
  /* 単語の問題：ほかの選択肢の意味 */
  if(it.t==="gap"&&(it.sec==="vo"||it.part===1)&&!it.opt){var ow=it.w.map(function(o){var r=null;try{r=p72Look(o);}catch(_){}return '<b>'+esc(o)+'</b>'+(r&&r.mean?'＝'+esc(r.mean):'');});
    var ra=null;try{ra=p72Look(it.a);}catch(_){}
    rows.push(["選択肢の意味",'<b>'+esc(it.a)+'</b>'+(ra&&ra.mean?'＝'+esc(ra.mean):'')+'（正解）<br>'+ow.join("<br>")+'<br><small>文の意味（「'+esc(it.j||"")+'」）に合うのは '+esc(it.a)+' だけです。</small>']);}
  var h=rows.length?'<div class="p86-why p86-more">'+rows.map(function(q){return '<div class="p86-wr"><span>'+q[0]+'</span><p>'+q[1]+'</p></div>';}).join("")+'</div>':"";
  return h+(it.t==="gap"?wGlossList(it):"");
}
/* つなぎ言葉（接続詞・疑問詞）：意味と、うしろにどんな文が来るか */
var W_CONJ={"и":["そして・〜と","同じ向きの内容を並べる"],"а":["〜だが一方・それで","2つを比べる・話題を移す（反対まではいかない）"],"но":["しかし","前と反対・予想とちがう内容が続く"],"или":["または・それとも","2つのうちどちらか"],
 "что":["〜ということ","「言う・思う・知っている」の内容（事実）を続ける"],"чтобы":["〜するように・〜するために","目的や「〜してほしい」という願い。うしろは不定形か過去形"],"если":["もし〜なら","条件（これから起きるかもしれないこと）"],
 "хотя":["〜だけれども","前とうしろが予想と反対の関係"],"когда":["〜するとき・いつ","時を言う・たずねる"],"потому что":["なぜなら〜だから","うしろが理由"],"поэтому":["だから","うしろが結果"],"так как":["〜なので","前に置く理由"],
 "где":["どこで","場所（いる・住む・ある）"],"куда":["どこへ","行き先（行く・来る・置く）"],"откуда":["どこから","出発点"],"почему":["なぜ","理由をたずねる"],"зачем":["何のために","目的をたずねる"],
 "ли":["〜かどうか","はい・いいえで答える内容を文の中に入れる。動詞などのすぐあとに置く"],"чем":["〜よりも","比較級のあとで比べる相手を言う"],"как":["どのように・〜のように","やり方・ようす"],
 "который":["（〜する）ところの","前の名詞を、うしろの文で説明する"],"которая":["（〜する）ところの","前の女性名詞を説明する"],"которое":["（〜する）ところの","前の中性名詞を説明する"],"которые":["（〜する）ところの","前の複数名詞を説明する"],
 "сколько":["いくつ・いくら","数・量をたずねる"],"чей":["だれの","男性名詞につく"],"чья":["だれの","女性名詞につく"],"чьё":["だれの","中性名詞につく"],"чьи":["だれの","複数につく"],
 "здесь":["ここで","場所（どこで）"],"сюда":["ここへ","行き先（どこへ）"],"туда":["そこへ","行き先（どこへ）"],"там":["そこで","場所（どこで）"],"домой":["家へ","行き先"],"дома":["家で","場所"],
 "ничего":["何も〜ない","не と一緒に使う（ничего не знаю）。ロシア語は否定を重ねても否定のまま"],"никогда":["一度も〜ない・決して〜ない","не と一緒に使う（никогда не опаздываю）"],"никто":["だれも〜ない","не と一緒に使う"],"нигде":["どこにも〜ない","не と一緒に使う"],
 "что-то":["何か","実際にある・あったが、何かは分からない（-то）"],"что-нибудь":["何か（どれでも）","まだ決まっていない・どれでもいい（質問・頼み・これからのこと）"],"кто-то":["だれか","実際にいるが、だれかは分からない"],"кто-нибудь":["だれか（だれでも）","まだ決まっていない"],
 "когда-то":["昔いつか","過去のある時"],"когда-нибудь":["いつか（これから）","まだ決まっていない時"],"где-то":["どこかで","実際にあるが場所は分からない"],"всегда":["いつも","否定の не とは組まない"],"иногда":["ときどき",""],
 "до":["〜まで","時・場所の終わり（с … до …＝〜から〜まで）"],"через":["〜後に・〜を通って","時間がたったあと"],"в":["〜に・〜で","時刻・場所"],"уже":["もう","すでに起きた"],"ещё":["まだ・もっと","続いている・追加"],"еще":["まだ・もっと","続いている・追加"]};
function wConj(o){return W_CONJ[low(o).replace(/^(и|а) /,"")]||null;}
function wTask(it,r,A){
  var opts=it.w.concat([it.a]),same=opts.map(function(o){var I=wInfo(wHead(o));return low(I.base||wHead(o));}),one=same.every(function(b){return b===same[0];});
  if(opts.every(function(o){return wConj(o);}))return "文と文、言葉と言葉をつなぐ言葉（つなぎ言葉・たずねる言葉）を選ぶ問題です。どれも短い語ですが意味がちがうので、空欄の前とうしろが「反対・理由・条件・場所・時」のどの関係かを見て選びます。";
  if(one&&A.pos==="noun"||r.c)return "選択肢はどれも同じ単語の別の形です。意味では選べないので、空欄の前にある前置詞・動詞・数などを見て「文の中で何の役をしているか（格）」を決め、その格の語尾を選びます。";
  if(one&&A.pos==="verb")return "選択肢はどれも同じ動詞の別の形です。だれがするか（主語）、いつのことか（過去・今・これから）、頼む文かどうかを見て、合う語尾を選びます。";
  if(one&&(A.pos==="adjective"||A.pos==="pronoun"))return "選択肢はどれも同じ語の別の形です。説明している名詞や主語の「性・数・格」に語尾をそろえます。";
  return "";
}
/* 規則どおりの動詞（-ать／-ять と -ить）の現在形の表。答えが表の形と一致するときだけ出す（不規則な動詞で間違った表を見せない） */
function wConjTable(base,a,lab){
  var b=low(base||""),P=["я","ты","он・она","мы","вы","они"],f=null,type="";
  if(/(ать|ять)$/.test(b)&&!/(вать)$/.test(b)){var s1=b.slice(0,-2);f=[s1+"ю",s1+"ешь",s1+"ет",s1+"ем",s1+"ете",s1+"ют"];type="-ать・-ять の動詞（第1変化）";}
  else if(/ить$/.test(b)){var s2=b.slice(0,-3),sib=/[жшчщ]$/.test(s2);f=[s2+(sib?"у":"ю"),s2+"ишь",s2+"ит",s2+"им",s2+"ите",s2+(sib?"ат":"ят")];type="-ить の動詞（第2変化）";}
  if(!f)return "";var m=/^(я|ты|он・она|мы|вы|они) の形/.exec(lab||"");if(!m)return "";var k=P.indexOf(m[1]);if(k<0||f[k]!==a)return "";
  return plain(base)+" は"+type+"。辞書の形から "+(type.indexOf("ить")>=0?"-ить":"-ть")+" を取って、主語ごとの語尾をつけます：<br>"+P.map(function(p,i){return (i===k?"▶ ":"")+p+" "+f[i];}).join("　/　");
}
/* 形だけでは決まらない語の使い分け：-ся 動詞・который・свой・行く動詞 */
function wMean(o){var r=null;try{r=p72Look(o);}catch(_){}return r&&r.mean?String(r.mean).replace(/^（.+?で）/,""):"";}
function wSpecial(it,r0){
  r0=r0||{};var a=low(it.a),s=low(it.s),out=[],ws=it.w.map(low);
  /* -ся 動詞：-ся（-сь）がないと別の動詞になる */
  if(/(сь|ся)$/.test(a)&&!/\s/.test(a)){var bare=it.w.filter(function(o){var x=low(o);return !/(сь|ся)$/.test(x);});
    if(bare.length){var I=wInfo(it.a),b=I.base?plain(I.base):"";
      out.push(["-ся のつく動詞","答えの "+it.a+" は、最後に -ся（母音のあとでは -сь）がつく動詞"+(b?"（辞書の形 "+b+(wMean(b)?"＝"+wMean(b):"")+"）":"")+"の形です。-ся は「自分に向かう動作」を表すことが多く、-ся がつくかどうかで意味が変わる動詞があります（учить＝〜を覚える・教える／учиться＝学校などで学ぶ・勉強している）。人称語尾は -ся の前につけ、そのあとに -сь／-ся を残します（я учусь、он учится）。<br>"+
        bare.map(function(o){var J=wInfo(o),m=J.base?wMean(plain(J.base)):"";return o+" は -ся のない"+(J.base?" "+plain(J.base)+(m?"（"+m+"）":""):"動詞")+" の形です。-ся のない形は、ふつう「〜を」（対格の目的語）といっしょに使います（учу слова＝単語を覚える）。この文には「〜を」がないので合いません。";}).join("<br>")]);}}
  /* который：性・数は前の名詞、格は自分の節での働き */
  if(/^котор/.test(a)){var bi=s.indexOf("＿"),pre=s.slice(0,bi),ant=null;
    wTok(pre).forEach(function(t){var I=wInfo(t);if(I.w&&I.w.pos==="noun")ant=I;});
    var g=null;if(ant){try{var gi=p72GenderInfo(ant.w,ant.o.g);g=gi&&gi.g;}catch(_){}}
    var KE={"ый":[["m","nom"],["m","acc"]],"ого":[["m","gen"],["n","gen"],["m","acc"]],"ому":[["m","dat"],["n","dat"]],"ым":[["m","ins"],["n","ins"],["p","dat"]],"ом":[["m","pre"],["n","pre"]],
      "ая":[["f","nom"]],"ой":[["f","gen"],["f","dat"],["f","ins"],["f","pre"]],"ую":[["f","acc"]],"ое":[["n","nom"],["n","acc"]],"ые":[["p","nom"],["p","acc"]],"ых":[["p","gen"],["p","pre"],["p","acc"]],"ыми":[["p","ins"]]};
    var ke=function(o){var x=low(o).replace(/^котор/,"");return KE[x]||[];};
    var GN={m:"男性",f:"女性",n:"中性",p:"複数"},ng=ant&&ant.pl?"p":g;
    var aft=s.slice(bi+1).split(/[,;—?.!]/)[0],at=wTok(aft),pb=wTok(pre).slice(-1)[0]||"",sj=at.filter(function(t){return W_SUBJ[t];})[0],isP=!!W_PREP[pb]||/^(в|во|на|с|со|к|ко|у|из|от|для|без|о|об|про|по|за|под|над|перед|между|при)$/.test(pb);
    var nc=isP&&r0.c?r0.c:sj?(r0.c||"acc"):"nom";
    var roleTx=isP?"который の前に前置詞 "+pb+" があるので、その前置詞が求める"+W_CN[nc]+"です。":sj?"この節の主語は "+sj+" です。который は主語ではなく、動詞の相手（"+(nc==="dat"?"「〜に」":"「〜を」")+"）なので"+W_CN[nc]+"です。"+(nc==="acc"&&ng!=="f"?"（物を表す男性・中性・複数では、対格は主格と同じ形です）":""):"この節には ほかに主語がなく、который 自身が「〜が」（主語）なので主格です。";
    out.push(["который の決め方","который（〜するところの・〜という）は、2つのことで形を決めます。<br>① 性と数：コンマの前の名詞に合わせます"+(ant&&ng?"。"+plain(ant.o.base)+" は"+GN[ng]+(ng==="p"?"":"名詞")+"なので、"+GN[ng]+"の形":"")+"。<br>② 格：コンマのあとの節の中での役目で決めます。"+roleTx+"<br>"+(ng?"だから "+GN[ng]+"・"+W_CN[nc]+"の "+it.a+" です。":"")]);
    if(ng)out.push(["ほかの選択肢",it.w.map(function(o){var e=ke(o),ok=e.some(function(q){return q[0]===ng&&q[1]===nc;}),cm=e.some(function(q){return q[1]===nc;}),gm=e.some(function(q){return q[0]===ng;});
      var lab=e.map(function(q){return GN[q[0]]+"・"+W_CN[q[1]];}).join("／");
      return '<b>'+esc(o)+'</b>（'+esc(lab)+(ok?"":gm?"。性・数は合っていますが、格が"+W_CN[nc]+"ではないので合いません":cm?"。格は合っていますが、"+GN[ng]+"ではないので合いません":"。性・数も格も合いません")+'）';}).join("<br>")]);}
  /* свой：持ち主が主語と同じとき */
  if(/^сво/.test(a)&&ws.some(function(o){return /^(ее|его|их|ей|ему|им)$/.test(o)||/^(мо|тво|наш|ваш)/.test(o);})){
    out.push(["свой と её・его の違い","свой は「（主語）自身の」。持ち主が文の主語と同じとき、特に主語が он・она・они のときは свой を使います。её・его・их を使うと「主語とは別の、ある女性・男性・人たちの」という意味になってしまいます（Она любит свою работу＝彼女は自分の仕事が好き／Она любит её работу＝彼女は（別の）女性の仕事が好き）。свой も、うしろの名詞と同じ性・数・格の語尾にそろえます。"]);}
  /* 行く動詞：選択肢ごとの意味 */
  var MV=function(x){return /^(иду|идешь|идет|идем|идете|идут|идти|шел|шла|шли)$/.test(x)?"идти＝歩いて・今1回その方向へ":/^(хожу|ходишь|ходит|ходим|ходите|ходят|ходить|ходил|ходила|ходили)$/.test(x)?"ходить＝歩いて・くり返し通う／行って帰る":/^(еду|едешь|едет|едем|едете|едут|ехать|ехал|ехала|ехали)$/.test(x)?"ехать＝乗り物で・今1回その方向へ":/^(езжу|ездишь|ездит|ездим|ездите|ездят|ездить|ездил|ездила|ездили)$/.test(x)?"ездить＝乗り物で・くり返し通う／行って帰る":"";};
  if(MV(a)&&ws.some(MV)){var hint=/(каждый|каждую|каждое|часто|обычно|всегда|иногда|редко)/.test(s)?"この文には くり返しを表す語（каждый・часто など）があります。":/(сейчас|сегодня|завтра)/.test(s)?"この文は今・これからの1回の移動です。":"";
    out.push(["「行く」の4つの動詞","歩くか乗り物か、1回の一方向かくり返し・往復かで4つに分かれます。"+hint+(it.j?"日本語訳（"+it.j+"）の意味に合うものを選びます。":"")+"<br>"+[it.a].concat(it.w).filter(function(o){return MV(low(o));}).map(function(o){return o+"：「"+MV(low(o))+"」"+(low(o)===a?"（正解）":"");}).join("<br>")]);}
  return out;
}
function whyHtml(it){
  if(it.t!=="gap"||it.sec==="vo"||it.part===1)return "";
  /* 「ある」の есть と「食べる」の есть（ест・едим）：形ではなく意味で選ぶ */
  if(low(it.a)==="есть"&&it.w.some(function(o){return /^(ест|едим|ем|ешь|едите|едят)$/.test(low(o));})){
    var EV={"ем":"я ем＝私が食べる","ешь":"ты ешь＝君が食べる","ест":"он・она ест＝彼・彼女が食べる","едим":"мы едим＝私たちが食べる","едите":"вы едите＝あなたが食べる","едят":"они едят＝彼らが食べる"};
    return '<div class="p86-why"><div class="p86-wh">なぜこの形？</div><div class="p86-wr"><span>この問題で見ること</span><p>選択肢は同じつづりから来ていますが、意味がちがいます。この文は「〜がある・〜がいる」と言っているので、形の変わらない「ある」の есть が入ります。</p></div>'+
      '<div class="p86-wr"><span>形を決める手がかり</span><p>У меня есть＋主格＝「私には〜がある」、Есть …?＝「〜はありますか」。うしろの名詞（ある物）は主格のままです。</p></div>'+
      '<div class="p86-wr"><span>ほかの選択肢</span><p>'+it.w.map(function(o){return '<b>'+esc(o)+'</b>（「食べる」の есть の形：'+esc(EV[low(o)]||"")+'。「ある」の意味にはならないので合いません）';}).join("<br>")+'</p></div></div>';}
  var r=wNeed(it),A=r.A,rows=[];
  /* 「вы の形」と「命令形（丁寧）」は同じつづり（говорите）。文に主語 вы があれば вы の形、なければ頼む形 */
  if(A.pos==="verb"&&/вы の形/.test(A.lab||"")&&/命令/.test(A.lab||"")){var cl0=low(it.s).split(/[,;—]/).filter(function(c){return c.indexOf("＿")>=0;})[0]||low(it.s);
    A.lab=wTok(cl0).indexOf("вы")>=0?"вы の形":"命令形（丁寧）";A.vyAmb=1;}
  var tk="";try{tk=wTask(it,r,A);}catch(_){}if(tk)rows.push(["この問題で見ること",tk]);
  var spc=[];try{spc=wSpecial(it,r);}catch(_){}
  if(r.c){rows.push(["形を決める手がかり",r.why]);
    var e="";if(A.w&&A.w.pos==="noun"){var g=null;try{var gi=p72GenderInfo(A.w,A.o.g);g=gi&&gi.g;}catch(_){}
      if(g&&P72_END[r.c]){var t=P72_END[r.c][A.pl?"p":"s"][g]||"";if(t)e=plain(A.base)+" は"+P72_GNAME[g]+"。"+W_CN[r.c]+(A.pl?"の複数":"")+"の作り方："+t;}}
    else if(W_PRON[low(it.a)])e=W_PRON[low(it.a)][0]+" の"+W_CN[r.c]+"は "+it.a+"（代名詞は形を1つずつ覚えます）。";
    if(r.c==="acc"&&A.cs.indexOf("gen")>=0&&A.pos==="noun"&&!/生格と同じ/.test(e))e+=(e?"<br>":"")+"人や動物（生き物）を表す男性名詞と、生き物の複数は、対格が生格と同じ形になります（ждать ребёнка、видеть брата、видеть родителей）。物なら主格と同じ形です。";
    if(e)rows.push(["形の作り方",e]);}
  else if(A.pos==="verb"){var v=wVerb(it,A);if(v.length)rows.push(["形を決める手がかり",v.join("<br>")]);
    var cj=wConjTable(A.base,low(it.a),A.lab);if(cj)rows.push(["形の作り方",cj]);}
  else if(!it.w.concat([it.a]).some(function(o){return /短い形/.test(wInfo(o).lab);})&&(A.pos==="adjective"||/^(мо|тво|наш|ваш|эт|как|котор|чь|чей|сво|весь|вс)/.test(low(it.a)))){var a=wAdj(it,A);if(a.length)rows.push(["形を決める手がかり",a[0]]);}
  /* 前置詞のあとの н（к нему、у неё、с ними） */
  if(W_PRON[low(it.a)]&&/^н/.test(low(it.a))&&it.w.some(function(o){return low(o)===low(it.a).slice(1)||low(o)==="её"&&low(it.a)==="неё";}))
    rows.push(["前置詞のあとの н","он・она・оно・они の形（его・ему・её・ей・им・их など）は、前置詞のすぐあとでは頭に н がつきます（к нему、у неё、с ними）。前置詞がなければ н はつきません。"]);
  /* 短い形（〜だ・〜されている）は主語にそろえる */
  if(it.w.concat([it.a]).some(function(o){return /短い形/.test(wInfo(o).lab);})){var sp=wTok(it.s).filter(function(t){return W_SUBJ[t];})[0];
    if(sp){var spn={"я":"話す人（男性なら語尾なし、女性なら -а）","ты":"話し相手（男性なら語尾なし、女性なら -а）","он":"男性","она":"女性","оно":"中性","мы":"複数","вы":"複数（вы は1人に使っても複数の形）","они":"複数"}[sp];
      rows.push(["形を決める手がかり","短い形（должен・рад・готов・занят など「〜だ」を表す形）は、主語の性・数にそろえます（男性は語尾なし、女性 -а、中性 -о、複数 -ы／-и）。主語 "+sp+" は"+spn+"なので "+it.a+" です。"]);}
    var sb=sp?null:wTok(it.s).map(wInfo).filter(function(I){return I.w&&I.w.pos==="noun";})[0];
    if(sb){var sg=null;try{var gi2=p72GenderInfo(sb.w,sb.o.g);sg=gi2&&gi2.g;}catch(_){}
      rows.push(["形を決める手がかり","短い形（「〜だ」「〜されている」）は、主語の性・数にそろえます（男性は語尾なし、女性 -а、中性 -о、複数 -ы／-и）。主語 "+plain(sb.o.base)+" は"+(sb.pl?"複数":sg?P72_GNAME[sg]:"")+"なので、この形です。"]);}}
  /* つなぎ言葉：全部の選択肢の意味と使い方 */
  if(wConj(it.a)&&it.w.every(function(o){return wConj(o);})){var ca=wConj(it.a);
    rows.push(["つなぎ言葉の使い分け",[it.a].concat(it.w).map(function(o){var c=wConj(o);return o+"＝「"+c[0]+"」："+c[1]+(o===it.a?"（正解）":"");}).join("<br>")]);}
  spc.forEach(function(q){if(q[0]!=="ほかの選択肢")rows.push(q);});
  /* ほかの選択肢 */
  if(/\s/.test(it.a.trim())&&!wConj(it.a)&&r.c){var aw=it.a.trim().split(/\s+/);
    rows.push(["前の語もそろえる","名詞の前の "+aw.slice(0,-1).join(" ")+"（形容詞や мой・наш・этот など）も、名詞 "+aw[aw.length-1]+" と同じ"+W_CN[r.c]+(A.pl?"・複数":"")+"の語尾にそろえます。選択肢は、名詞だけでなく前の語の語尾もいっしょに変わっているので、2語とも"+W_CN[r.c]+"になっているものを選びます。"]);}
  var ow=it.w.map(function(o){var I=wInfo(wHead(o)),l=I.lab||(low(o)===low(I.base)&&/^(noun|verb|adjective)$/.test(I.pos)?"辞書の形":"");
    var why=r.c&&I.cs.length&&I.cs.indexOf(r.c)<0?"。ここでは"+W_CN[r.c]+"が必要なので合いません":"";
    if(!why&&r.c&&I.cs.indexOf(r.c)>=0&&I.pos==="noun"&&!!A.pl!==!!I.pl&&!/単数・複数/.test(l))why="。形は"+W_CN[r.c]+"でも"+(A.pl?"単数（1つ）":"複数")+"の形です。"+(/^(пять|шесть|семь|восемь|девять|десять|двадцать|тридцать|сто|сколько|много|несколько)$/.test(low(wTok(it.s.slice(0,it.s.indexOf("＿"))).slice(-1)[0]||""))?"5以上の数・много などのあとは複数の生格なので":"文の意味（日本語訳）では"+(A.pl?"複数":"1つ")+"なので")+"合いません";
    if(!why&&r.c==="acc"&&A.cs.indexOf("gen")>=0&&A.pos==="noun"&&I.pos==="noun"&&I.cs.indexOf("nom")>=0&&I.cs.indexOf("acc")>=0)why="。物なら対格はこの形ですが、"+plain(A.base)+" は人・生き物なので、対格は生格と同じ "+it.a+" を使います";
    var gl=wGloss(l,I.pos);
    if(!why&&A.pos==="verb"&&I.pos==="verb"&&l){var ga=wGloss(A.lab||(low(it.a)===low(A.base)?"辞書の形":""),"verb");if(ga&&ga!==gl)why="。この文に必要なのは"+ga+"なので合いません";}
    return '<b>'+esc(o)+'</b>'+(l?'（'+esc(l)+(gl?'＝'+esc(gl):'')+esc(why)+'）':'');});
  var spo=spc.filter(function(q){return q[0]==="ほかの選択肢";})[0];
  if(spo)rows.push(spo);else if(ow.some(function(x){return /（/.test(x);})&&!spc.some(function(q){return /4つの動詞/.test(q[0]);}))rows.push(["ほかの選択肢",ow.join("<br>")]);
  if(!rows.length)return "";
  return '<div class="p86-why"><div class="p86-wh">なぜこの形？</div>'+rows.map(function(q){return '<div class="p86-wr"><span>'+q[0]+'</span><p>'+(q[0]==="ほかの選択肢"?q[1]:esc(q[1]).replace(/&lt;br&gt;/g,"<br>"))+'</p></div>';}).join("")+'</div>';
}
function expHtml(it,ok){
  var wh="";try{wh=whyHtml(it);}catch(_){}
  /* 自動で作った文法問題は、手がかりが見つかったら、単語ごとの短い説明（ほかの文から来ることがある）を省いて、文全体の説明だけを残す */
  var xx=wh&&/手がかり/.test(wh)&&it.form&&it.xg!==undefined?it.xg:it.x;
  var mh="";try{mh=moreHtml(it);}catch(_){}
  var h='<p><b class="'+(ok?"ok":"ng")+'">'+(ok?'正解':'正解は '+esc(it.a))+'</b></p>'+mh+wh+(xx?(wh?'<p class="p86-pt"><b>この文のポイント</b>'+esc(xx)+'</p>':'<p>'+esc(xx)+'</p>'):'');
  if(wh&&/ほかの選択肢/.test(wh)){}
  else if(it.opt)h+='<p class="p86-oth">ほかの選択肢：'+it.opt.map(function(o){return '<b>'+esc(o[0])+'</b>＝'+esc(o[1]);}).join("、")+'</p>';
  else if(it.form){var lab=it.w.map(function(o){var f="";try{var r=p72Look(o);f=r&&r.form?r.form:"";}catch(_){}return '<b>'+esc(o)+'</b>'+(f?'（'+esc(f)+'）':'');});
    var fa="";try{var r=p72Look(it.a);fa=r&&r.form?r.form:"";}catch(_){}
    h+='<p class="p86-oth">'+(fa?'正解の形：<b>'+esc(it.a)+'</b>（'+esc(fa)+'）　':'')+'ほかの形：'+lab.join("、")+'</p>';}
  else if(it.t==="gap"&&it.w&&it.w.length&&!/選択肢の意味/.test(mh)){
    /* 選択肢の意味がどこにも出ていない問題：1語ずつ辞書で引いて、意味と形を並べる */
    var gl=function(o){var ph=null;o.split(/\s+/).some(function(t){var r=null;try{r=p72Look(t);}catch(_){}var m=r&&r.mean&&/^（(.+?) で）(.*)$/.exec(r.mean);if(m&&low(o).indexOf(low(m[1]))>=0){ph=m[2];return true;}});if(ph)return ph;return o.split(/\s+/).map(function(t){var r=null;try{r=p72Look(t);}catch(_){}return r&&r.mean?(r.mean+(r.form&&!r.guess?'・'+r.form:'')):"";}).filter(Boolean).join("＋");};
    h+='<p class="p86-oth">ほかの選択肢：'+it.w.map(function(o){var g=gl(o);return '<b>'+esc(o)+'</b>'+(g?'＝'+esc(g):'');}).join("、")+'</p>';}
  if(it.t==="gap")h+='<p class="p86-full">'+esc(full(it))+'</p>'+(typeof sayAllBtn==="function"?sayAllBtn(full(it)):'');
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

/* ---------- この回に出てきた単語（単語帳の id）：まちがえた問題の語を先に ---------- */
function sessWords(){
  if(!V||!V.steps)return [];var ids=[],bad={};
  if(V.mode==="mock")V.steps.forEach(function(x,i){if(V.ans[i]!==x.it.a)bad[x.it.id]=1;});else Object.keys(V.again||{}).forEach(function(k){bad[k]=1;});
  var its=[];V.steps.forEach(function(x){if(its.indexOf(x.it)<0)its.push(x.it);});
  its.sort(function(a,b){return (bad[b.id]?1:0)-(bad[a.id]?1:0);});
  its.forEach(function(it){
    if(it.wid&&window.WMAP&&WMAP[it.wid])ids.push(it.wid);
    var t=[it.t==="gap"?full(it):"",it.say||"",it.t==="gap"?"":(it.q||"")+" "+(it.a||"")].join(" ");
    if(it.txt&&!ids.__t){ids.__t={};}
    if(it.txt&&!ids.__t[it.txt.id]){ids.__t[it.txt.id]=1;t+=" "+(it.txt.tx||"")+" "+(it.txt.ln||[]).map(function(l){return l[1];}).join(" ");}
    (t.match(/[А-Яа-яЁё\u0301\-]+/g)||[]).forEach(function(tok){var r=null;try{r=p72Look(tok);}catch(_){}if(r&&r.id&&!r.guess&&window.WMAP&&WMAP[r.id])ids.push(r.id);});});
  var out=[];ids.forEach(function(id){if(out.indexOf(id)<0)out.push(id);});return out.slice(0,60);
}
function wordsCard(){
  var n=sessWords().length;if(!n)return "";
  return '<div class="p86-card p86-wl"><div class="p86-ch">出てきた単語をもう一周する？</div><p class="p86-mut">この回の問題に出てきた単語 '+n+'語（まちがえた問題の単語が先）を、単語カードで1周できます。やるかどうかは自由です。ここで覚えた単語は、ふだんの単語学習と同じように「学習した単語」として記録されます。</p>'+
    '<button type="button" class="p86-sub p86-wlb" data-act="p86words">'+n+'語を1周する</button></div>';
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
    h+='<p class="p86-mut">かかった時間 '+mmss(r.sec*1000)+'　（本番は作文・会話もあり、それぞれ合格ラインが必要です）</p>'+((V.nsUsed||nsOn())?'<p class="p86-mut">※ 今回は聴解を文字で読んで解きました。聴解の点は、耳で聞いたときの力とは別の目安として見てください。</p>':'')+'</div>';
    var miss=V.steps.map(function(x,i){return {x:x,a:V.ans[i]};}).filter(function(o){return o.a!==o.x.it.a;});
    if(miss.length){h+='<div class="p86-h">まちがえた問題の説明（'+miss.length+'問）　※明日の練習でもう一度出ます</div>';
      miss.forEach(function(o){var it=o.x.it;
        h+='<div class="p86-rv"><div class="p86-tag">'+SECN[it.sec]+'</div><div class="p86-q '+(it.t==="hear"?"":"p71-sent")+'">'+esc(it.t==="gap"?full(it):it.t==="hear"?it.say:it.q)+'</div>'+
          '<p class="p86-ja">'+esc(it.t==="gap"?it.j:it.t==="hear"?"":it.qj)+(it.txt?'（'+esc(it.txt.t)+'）':'')+'</p>'+
          '<p>あなたの答え：<b class="ng">'+(o.a===undefined?'（答えていない）':esc(o.a))+'</b>　正解：<b class="ok">'+esc(it.a)+'</b></p>'+'<div class="p86-mexp">'+expHtml(it,true).replace(/^<p><b class="ok">正解<\/b><\/p>/,"")+'</div></div>';});
    }else h+='<div class="p86-card"><p>全問正解です！</p></div>';
    h+=wordsCard();
    h+='<button type="button" class="p86-big" data-act="p86home"><span><b>トップへ</b><small>弱い部門の練習から続けましょう</small></span>'+ic("go",18)+'</button>';
    return h;
  }
  var tot=V.ok+V.ng,miss2=[],seen={};
  V.steps.forEach(function(x){if(V.again[x.it.id]&&!seen[x.it.id]){seen[x.it.id]=1;miss2.push(x.it);}});
  var li=kindList(curLv(),V.kind),so=sum(li);
  h+='<div class="p86-done"><h3>おつかれさまでした</h3><p>1回目で正解 '+V.ok+' / '+tot+'問</p></div>';
  h+='<div class="p86-card"><div class="p86-ch">'+(V.kind==="today"?L.code+' 全体':kindName(V.kind))+'の定着 '+pct(so.solid,so.n)+'%'+solidQ()+'</div>'+sbar(so)+'<p class="p86-mut">定着 '+so.solid+'・練習中 '+so.learn+'・まだ '+(so.n-so.solid-so.learn)+'（全 '+so.n+'問）'+(V.kind!=="today"?'　'+lap(li).lap+'周目 '+lap(li).done+' / '+li.length:'')+'</p></div>';
  if(miss2.length){h+='<div class="p86-h">見直しておきたい問題（明日もう一度出ます）</div>';miss2.forEach(function(it){
    h+='<div class="p86-rv"><div class="p86-q '+(it.t==="hear"?"":"p71-sent")+'">'+esc(it.t==="gap"?full(it):it.t==="hear"?it.say:it.q+' → '+it.a)+'</div><p class="p86-ja">'+esc(it.t==="gap"?it.j:it.t==="hear"?it.a:it.qj)+'</p></div>';});}
  h+=wordsCard();
  h+='<div class="p86-nav2"><button type="button" class="p86-sub" data-act="p86home">トップへ</button><button type="button" class="p86-main" data-act="p86prac" data-val="'+V.kind+'">続けてもう1回</button></div>';
  return h;
}

/* 解説の中のロシア語：押すとその単語の辞書のページが開く（単語帳にある語だけ） */
function linkWords(m){
  m.querySelectorAll(".p86-exp,.p86-mexp").forEach(function(root){
    var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),list=[],nd;
    while((nd=tw.nextNode()))if(!(nd.parentNode.closest&&nd.parentNode.closest("button,summary,.p72-w,.p86-full,svg"))&&/[А-Яа-яЁё]/.test(nd.nodeValue))list.push(nd);
    list.forEach(function(t){var parts=t.nodeValue.split(/([А-Яа-яЁё́]+(?:-[А-Яа-яЁё́]+)*)/),fr=document.createDocumentFragment(),hit=0;
      parts.forEach(function(p,i){if(!p)return;var r=null;if(i%2){try{r=p72Look(p);}catch(_){}}
        if(r&&r.id&&!r.guess){var b=document.createElement("button");b.type="button";b.className="p86-dl";b.setAttribute("data-act","p72wdict");b.setAttribute("data-val",r.id);b.textContent=p;fr.appendChild(b);hit=1;}
        else fr.appendChild(document.createTextNode(p));});
      if(hit)t.parentNode.replaceChild(fr,t);});
  });
}
document.addEventListener("nschange",function(){if(V&&document.body.classList.contains("p86-on")){if(V.mode==="mock"&&nsOn())V.nsUsed=1;hush();if(V)V.playing=0;draw();}});
/* 練習（文法書の章の練習・一歩レッスンの穴埋め）からも、同じ「なぜこの形？」を使えるようにする
   o={s:"＿ のある文", a:正解, w:[ほかの選択肢], j:日本語訳}。返すのは解説の HTML（文の意味・決まった言い方・なぜこの形？・単語の意味と働き） */
window.trkiWhy=function(o){try{var it={t:"gap",sec:"gr",s:String(o.s),a:String(o.a),w:(o.w||[]).map(String).filter(function(x){return low(x)!==low(o.a);}),j:o.j||"",x:""};
  window.P86_GL_OPEN=!!o.open;var m=moreHtml(it),w=whyHtml(it);window.P86_GL_OPEN=false;
  if(o.noMeaning)m=m.replace(/<div class="p86-wr"><span>文の意味<\/span><p>[\s\S]*?<\/p><\/div>/,"").replace(/<div class="p86-why p86-more"><\/div>/,"");
  return '<div class="p86x">'+w+m+'</div>';}catch(e){return "";}};
/* ---------- 描く ---------- */
function draw(){
  var m=el();document.body.classList.add("p70-noscroll");try{p72PopClose();p72Theme();}catch(_){}
  var body,head,foot='';
  if(V.view==="top"){head='<div class="p86-th"><button type="button" class="p86-back" data-act="p86close" aria-label="もどる">‹</button><b>ロシア語検定 対策</b></div>';body=(typeof window.p90LevelLine==="function"?window.p90LevelLine("trki"):"")+topHtml();}
  else if(V.view==="q"){head=headHtml();body=qHtml();foot='<div class="p86-foot">'+footHtml()+'</div>';}
  else {head='<div class="p86-th"><button type="button" class="p86-back" data-act="p86home" aria-label="もどる">‹</button><b>ロシア語検定 対策</b></div>';body=resHtml();}
  m.innerHTML='<div class="p86-wrap">'+head+'<div class="p86-scroll">'+body+'</div>'+foot+'</div>';
  m.className="show";document.body.classList.add("p86-on");
  try{p72Wrap(m);}catch(_){}
  try{linkWords(m);}catch(_){}
  /* 練習の聞き取り問題は、出たときに1回自動で読む（模試は回数制限があるので自動では読まない） */
  try{if(V.view==="q"&&V.mode==="prac"&&V.picked===null){var ix=V.steps[V.pos].it;if(ix.t==="hear"&&typeof autoSay==="function")autoSay("p86:"+V.pos+":"+ix.id,null,function(){play();});}}catch(_){}
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
  if(!x.again){if(ok)V.ok++;else V.ng++;mark(x.it,ok,qSec(),o);}
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
    if(V.ans[i]!==undefined)mark(x.it,ok,per,V.ans[i]);});
  var R=rec();R.mk.unshift({lv:V.lv,d:Date.now(),lg:r.lg,rd:r.rd,au:r.au,sec:r.sec,ns:V.nsUsed||nsOn()?1:0});R.mk=R.mk.slice(0,30);save();
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
  if(a==="p86solid"){solidOpen();return;}
  if(a==="p86solx"){solidClose();return;}
  if(!V)return;
  if(a==="p86close")close();
  else if(a==="p86home"){stopTimer();hush();V={view:"top"};draw();}
  else if(a==="p86lv"){if(LV[v]){rec().lv=v;save();V={view:"top"};draw();}}
  else if(a==="p86today")startPrac("today");
  else if(a==="p86words"){var ws=sessWords();if(!ws.length){toast("単語が見つかりませんでした");return;}close();
    try{ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;startSessionFromIds(ws,"検定の問題に出てきた単語",undefined,{type:"all",allLevels:true});}catch(_){toast("単語の学習を開けませんでした");}}
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

/* ---------- ホームの小さな入口（あいさつのすぐ下・1行だけ） ---------- */
function homeChip(){
  var sub="ТЭУ・ТБУ・ТРКИ-1",code="ТРКИ";
  try{var r=rec();if(r.s&&Object.keys(r.s).length){build();var lv=r.lv,o=sum(items(lv));code=LV[lv].code;sub='定着 '+pct(o.solid,o.n)+'%'+(o.due?'・復習 '+o.due+'問':'');}}catch(_){}
  return '<button type="button" class="p86-chip" data-act="p86open"><span class="p86-eb">'+code+'</span><b>ロシア語検定 対策</b><small>'+sub+'</small>'+ic("go",14)+'</button>';
}
if(typeof renderHome==="function"){
  var _p86Home=renderHome;
  renderHome=function(){
    var h=String(_p86Home.apply(this,arguments));
    if(h.indexOf('class="p47-home"')<0||h.indexOf('p86-chip')>=0)return h;
    var w=h.indexOf('<div class="p81-hint">');if(w<0)w=h.indexOf('<div class="p70-week">');if(w<0)w=h.indexOf('<div class="p51-herowrap">');
    return w>=0?h.slice(0,w)+homeChip()+h.slice(w):h;
  };
}
if(typeof p81GuideHtml==="function"){
  var _gh=p81GuideHtml;
  p81GuideHtml=function(){var h=_gh.apply(this,arguments);
    return h.replace('<div class="p81-tipbox">','<div class="p81-g"><div class="p81-gwho">ロシア語検定（ТРКИ）に合格したい人</div><div class="p81-gmode"><b>ロシア語検定 対策</b></div><p>やさしい順に ТЭУ（入門）→ ТБУ（基礎）→ ТРКИ-1（第1レベル）の3つから選び、試験と同じ形の問題・単語・文法・読解・聴解を何周も回します。正解した問題は間をあけてもう一度出るので、忘れかけたころに復習できます。「今日の10問」を毎日押すだけで進みます。</p><button type="button" class="p81-gbtn" data-act="p81go" data-val="p86open">検定対策を開く '+ic("go",15)+'</button></div><div class="p81-tipbox">');};
}

/* ---------- 見た目 ---------- */
var css=document.createElement("style");css.textContent=
 '.p86-dl{display:inline;border:0;background:none;padding:0;margin:0;font:inherit;color:inherit;line-height:inherit;text-decoration:underline dotted;text-decoration-color:var(--accent,#0a84ff);text-underline-offset:3px;cursor:pointer;-webkit-user-select:text;user-select:text}.p86-dl:active{color:var(--accent,#0a84ff)}'+
 '.ns-mk{font-style:normal;font-size:11px;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:0 5px}'+
 '.p86-solq{border:0;background:none;color:var(--accent,#0a84ff);font:inherit;font-size:12px;padding:6px 4px;min-height:32px;cursor:pointer;text-decoration:underline;text-underline-offset:2px;white-space:nowrap}'+
 '.p86-hq{display:flex;align-items:center;justify-content:space-between;gap:8px}.p86-hq .p86-solq{font-weight:400}'+
 '#p86sol{position:absolute;inset:0;z-index:5;background:rgba(0,0,0,.55);display:flex;align-items:flex-end;justify-content:center}'+
 '.p86-solbox{background:var(--bg,#000);color:var(--ink);width:100%;max-width:560px;max-height:88%;border-radius:16px 16px 0 0;display:flex;flex-direction:column;border:1px solid var(--line)}'+
 '.p86-solh{display:flex;align-items:center;gap:8px;padding:14px 16px 6px}.p86-solh b{flex:1;font-size:17px}'+
 '.p86-x{border:0;background:none;color:var(--ink);min-width:44px;min-height:44px;display:flex;align-items:center;justify-content:center;cursor:pointer}'+
 '.p86-solsc{overflow-y:auto;padding:0 16px calc(18px + env(safe-area-inset-bottom));font-size:14px;line-height:1.7}.p86-solsc p{margin:10px 0}'+
 '.p86-stairs{display:flex;flex-direction:column;gap:6px;margin:12px 0}.p86-st{display:flex;align-items:center;gap:10px;border:1px solid var(--line);border-radius:10px;padding:6px 10px}'+
 '.p86-st>span{font-size:12px;color:var(--muted);min-width:30px}.p86-st>div{flex:1;min-width:0;display:flex;flex-direction:column}.p86-st b{font-size:14px}.p86-st small{font-size:12px;color:var(--muted)}.p86-st em{font-style:normal;font-size:13px;color:var(--muted)}'+
 '.p86-st.s{border-color:var(--ok,#30d158)}.p86-st.s>span{color:var(--ok,#30d158);font-weight:600}'+
 '.p86-gl{margin:10px 0 0;border:1px solid var(--line);border-radius:10px;padding:8px 12px;font-size:14px}.p86-gl summary{cursor:pointer;color:var(--accent,#0a84ff);min-height:28px}'+
 '.p86-gl ul{margin:8px 0 0;padding:0;list-style:none}.p86-gl li{padding:4px 0;border-top:1px solid var(--line);line-height:1.5;overflow-wrap:anywhere}.p86-gl li small{color:var(--muted)}'+
 '.p86-more{margin-top:10px}'+
 '.p86-chip{display:flex;align-items:center;gap:8px;width:100%;margin:8px 0 2px;border:1px solid var(--line);background:none;color:var(--ink);border-radius:999px;padding:4px 12px 4px 6px;min-height:40px;font:inherit;text-align:left;cursor:pointer}'+
 '.p86-chip .p86-eb{font-size:11px;padding:2px 7px}.p86-chip b{font-size:13px;font-weight:600;white-space:nowrap}.p86-chip small{flex:1;min-width:0;font-size:12px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.p86-chip svg{color:var(--muted);flex:none}'+
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
 '.p86-goal .p86-gr{margin:8px 0}.p86-gt{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;margin-bottom:4px}.p86-gt b{font-weight:600}.p86-gt span{color:var(--muted);white-space:nowrap;font-variant-numeric:tabular-nums}.p86-gi{margin-top:8px}.p86-goal .p86-bar{display:block}.p86-wl .p86-wlb{width:100%;margin-top:8px}.p86-why{margin:8px 0;border:1px solid var(--line);border-radius:12px;padding:8px 12px;background:var(--card2)}.p86-wh{font-size:13px;font-weight:800;color:var(--accent);margin-bottom:4px}.p86-wr{display:flex;gap:10px;padding:6px 0;border-top:1px solid var(--line)}.p86-wr:first-of-type{border-top:none}.p86-wr span{flex:0 0 5.5em;font-size:12px;font-weight:700;color:var(--muted);padding-top:2px}.p86-wr p{margin:0!important;font-size:14px!important;line-height:1.7;min-width:0;overflow-wrap:anywhere}.p86-pt b{display:block;font-size:12px;color:var(--muted)}'+
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
