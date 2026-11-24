/* ===== Phase79：キルギス語版をロシア語版と同じ構成にする =====
   ・ホームの「学び方を選ぶ」（3つの入り口）・辞書（耳で聞いた音でも引ける）・注釈を、キルギス語版でも出す。
   ・文法解説書はキルギス語の内容（phase79_ky_guide.js）。各章の練習問題は、作文の文（文ごとの解説つき）から作る。
   ・歴史の道（マナス・セメテイ・クルマンジャン・トクトグル）の例文を、キルギス語の文にする。
   ロシア語版（P47_LANG!=="ky"）では何もしない。 */
(function(){
if(typeof P47_LANG==="undefined"||P47_LANG!=="ky")return;

/* ---------- 歴史の道の例文（キルギス語） ---------- */
var EX={
 manas:[["Бул — манасчы. Ал «Манасты» айтат.","これはマナスチです。彼は「マナス」を語ります。"],["Бул — Жакып. Ал кары.","これはジャクプです。彼は年をとっています。"],["Манас — күчтүү бала.","マナスは力の強い子どもです。"],["Бул — Манас жана анын достору.","これはマナスと彼の仲間たちです。"],["Алмамбет — Манастын досу.","アルマンベトはマナスの友です。"],["Каныкей акылдуу жана боорукер.","カヌケイはかしこくて、やさしいです。"],["Бул — чоң той.","これは大きな祝宴です。"],["Манас алыска кетет.","マナスは遠くへ出発します。"],["Бул — Манастын уулу.","これはマナスの息子です。"]],
 semetey:[["Семетей — Манастын уулу.","セメテイはマナスの息子です。"],["Апа менен уул алыска кетишет.","母と息子は遠くへ出発します。"],["Семетей — кичине бала.","セメテイは小さな子どもです。"],["Бакай чынчыл.","バカイは正直です。"],["Семетей үйүнө кайтат.","セメテイは家へ帰ります。"],["Күлчоро — жакшы дос.","クルチョロはよい友だちです。"],["Айчүрөк акылдуу жана сулуу.","アイチュレクはかしこくて、美しいです。"],["Семетей достору менен бирге.","セメテイは仲間たちといっしょです。"],["Бул — жаңы жол.","これは新しい道です。"]],
 kurmanjan:[["Курманжан тоодо жашайт.","クルマンジャンは山で暮らしています。"],["Курманжан үйүнө кайтат.","クルマンジャンは家へ帰ります。"],["Алымбек — анын күйөөсү.","アリムベクは彼女の夫です。"],["Курманжан көп иштейт.","クルマンジャンはたくさん働きます。"],["Эми ал — датка.","今や彼女は「ダトカ」です。"],["Курманжан тынч сүйлөйт.","クルマンジャンは落ち着いて話します。"],["Бул — абдан кыйын күн.","これはとてもつらい（難しい）日です。"],["Курманжанды баары билет.","みんながクルマンジャンを知っています。"],["Биз Курманжанды эстейбиз.","わたしたちはクルマンジャンを覚えています。"]],
 toktogul:[["Акын комуз менен ырдайт.","アクン（即興の歌い手）はコムズをひきながら歌います。"],["Токтогул — кичине бала.","トクトグルは小さな子どもです。"],["Апа ырдайт.","お母さんが歌います。"],["Адамдар анын үнүн угушат.","人々は彼の声を聞きます。"],["Бул — абдан жаман жыл.","これはとても悪い年です。"],["Ал жерде абдан муздак.","そこはとても寒いです。"],["Токтогул үйүнө кайтат.","トクトグルは家へ帰ります。"],["Адамдар аны сүйүшөт.","人々は彼が大好きです。"],["Бул — Токтогул шаары.","これはトクトグルの町です。"]]
};
try{(window.P74_PATHS||[]).forEach(function(P){var L=EX[P.id];if(!L)return;P.story.forEach(function(s,i){if(L[i])s.ex=L[i];});});}catch(_){}

/* ---------- ロシア語の辞書データを使わない（id がキルギス語の単語と別物のため） ---------- */
try{P73_D={};}catch(_){}
try{P73_U=[];}catch(_){}
/* 辞書（ひらがな・カタカナ・耳で聞いた音での検索、関連語）をキルギス語版でも使う */
try{p73Ru=function(){return true;};}catch(_){}
if(typeof renderWordSearch==="function"){
  var _ws=renderWordSearch;
  renderWordSearch=function(){var h=String(_ws.apply(this,arguments));
    return h.replace(/キルギス語・日本語・英語・ひらがな・カタカナで引けます/g,"キルギス語・日本語・ひらがな・カタカナで引けます")
      .replace(/placeholder="例：[^"]*"/,'placeholder="例：рахмат、ありがとう、らふまと、ジャクシ、市場"')
      .replace("（例：すぱしば、ドスビダニヤ）","（例：らふまと、ジャクシ、サラム）");};
}
try{P77_TIPS.dict="知らない単語を調べられます。キルギス語・日本語のほか、耳で聞いた音をひらがな・カタカナで入れても探せます（例：らふまと）。";}catch(_){}
/* 単語の「よみ」の注意（ө・ү は日本語にない音） */
if(typeof renderWordDetailSheet==="function"){
  var _wd=renderWordDetailSheet;
  renderWordDetailSheet=function(){var h=String(_wd.apply(this,arguments));var w=byId(ui.searchDetailId);
    if(w&&/[өүӨҮ]/.test(w.word)&&h.indexOf("p79-kn")<0){var k='<div class="roma">'+esc(w.roma||"")+'</div>';var i=h.indexOf(k);
      if(i>=0)h=h.slice(0,i+k.length)+'<div class="p79-kn">カタカナは目安です。ө は「エ」の舌で口を「オ」の形に、ү は「イ」の舌で口を「ウ」の形に丸めた音。録音で確かめてください。</div>'+h.slice(i+k.length);}
    return h;};
}

/* ---------- 文法解説書の練習問題（作文の文から） ---------- */
var BYW=null;
function byw(){if(BYW)return BYW;BYW={};VOCAB.forEach(function(v){var k=p71N(v.word);if(!BYW[k])BYW[k]=v.id;});return BYW;}
function unitNo(c){var m=/Unit\s*0*(\d+)/.exec(c.unit||"");return m?+m[1]:0;}
function guideOf(t){return (window.P79_GUIDE||[]).filter(function(g){return g.id===t;})[0];}
var CACHE={};
function cands(t){
  if(CACHE[t])return CACHE[t];var g=guideOf(t),out={a:[],b:[],c:[]};if(!g){CACHE[t]=out;return out;}
  var rx=g.rx?new RegExp(g.rx):null,U=g.u||[],B=byw();
  (window.COMPOSE||[]).forEach(function(c){var inU=U.indexOf(unitNo(c))>=0;
    (c.breakdown||[]).forEach(function(tk){var id=B[p71N(tk.base)],w=id&&WMAP[id];if(!w)return;
      var sn=p71N(tk.surface),bn=p71N(tk.base),r={id:id,c:c,tk:tk};
      if(sn!==bn){if(g.pos&&w.pos!==g.pos)return;var hit=rx?rx.test(sn):inU;if(!hit)return;(inU||!rx?out.a:out.b).push(r);}
      else if(inU&&!/\s/.test(bn))out.c.push(r);});});
  CACHE[t]=out;return out;
}
p77GpTopics=function(t){return [t];};
p77GpCount=function(t){var c=cands(t);return c.a.length+c.b.length+c.c.length;};
p77GpSteps=function(t){
  var C=cands(t),steps=[],used={},words={};
  function add(r,kind){if(steps.length>=10||used[r.c.id]||words[r.id])return;
    var cc=null;try{cc=p71Cloze(r.id,{ru:r.c.accent||r.c.ru,ja:r.c.ja,why:r.tk.why||r.tk.note||"",cid:r.c.id});}catch(_){}
    if(!cc)return;
    if(kind==="form"){if(!cc.forms)return;steps.push({t:"form",id:r.id,c:cc,unit:r.c.unit,g:r.c.gDetail||"",ge:r.c.gEasy||""});}
    else{if(cc.forms)return;var th=null;try{th=P47_THEMES.filter(function(x){return x.ids.indexOf(r.id)>=0;})[0];}catch(_){}
      var opts=[r.id];try{opts=shuffle([r.id].concat(p71Distract(r.id,th?th.ids:VOCAB.map(function(v){return v.id;}),3)));}catch(_){}
      steps.push({t:"cloze",id:r.id,c:cc,opts:opts});}
    used[r.c.id]=1;words[r.id]=1;}
  shuffle(C.a.slice()).forEach(function(r){add(r,"form");});
  shuffle(C.b.slice()).forEach(function(r){add(r,"form");});
  if(steps.length<10)shuffle(C.c.slice()).forEach(function(r){add(r,"cloze");});
  return shuffle(steps);
};

/* ---------- キルギス語の語尾の見分け（ロシア語の性・格の判定を使わない） ---------- */
var KV="аыоуеэиөүяёю";
function kyVow(s){for(var i=s.length-1;i>=0;i--){var c=s.charAt(i);if(KV.indexOf(c)>=0)return c;}return "а";}
function kyA(s){var v=kyVow(s);return /[аыя]/.test(v)?"а":/[оуёю]/.test(v)?"о":/[еэи]/.test(v)?"е":"ө";}
function kyI(s){var v=kyVow(s);return /[аыя]/.test(v)?"ы":/[оуёю]/.test(v)?"у":/[еэи]/.test(v)?"и":"ү";}
function kyEnd(s){var c=s.charAt(s.length-1);return KV.indexOf(c)>=0?"v":/[кпстфхцчшщ]/.test(c)?"x":"d";}
/* 名詞の格・複数の形を規則で作る */
function kyNoun(b){var e=kyEnd(b),A=kyA(b),I=kyI(b),c=b.charAt(b.length-1),m={};
  m[b+(e==="x"?"к":"г")+A]="与格（〜へ・〜に）";m[b+(e==="x"?"т":"д")+A]="位格（〜で・〜に）";m[b+(e==="x"?"т":"д")+A+"н"]="奪格（〜から）";
  m[b+(e==="v"?"н":e==="x"?"т":"д")+I]="対格（〜を）";m[b+(e==="v"?"н":e==="x"?"т":"д")+I+"н"]="属格（〜の）";
  m[b+(e==="v"||/[йр]/.test(c)?"л":e==="x"?"т":"д")+A+"р"]="複数（〜たち）";return m;}
var KY_CASE=[[/(дан|ден|дон|дөн|тан|тен|тон|төн|нан|нен|нон|нөн)$/,"奪格","から"],[/(нын|нин|нун|нүн|дын|дин|дун|дүн|тын|тин|тун|түн)$/,"属格","の"],
  [/(да|де|до|дө|та|те|то|тө)$/,"位格","で"],[/(га|ге|го|гө|ка|ке|ко|кө|на|не|но|нө)$/,"与格","へ"],[/(ны|ни|ну|нү|ды|ди|ду|дү|ты|ти|ту|тү)$/,"対格","を"]];
function kyStemMatch(b,t){if(t.indexOf(b)===0)return t.slice(b.length);
  var s=b.slice(0,-1),l=b.charAt(b.length-1),alt={"п":"б","к":"г","т":"д"}[l];if(alt&&t.indexOf(s+alt)===0)return t.slice(b.length);return null;}
/* 名詞の語尾を分ける：{c:格,jp:助詞,pl:複数,ps:所有} */
function kyNounInfo(b,t){var suf=kyStemMatch(b,t);if(suf===null)return null;var o={c:"",jp:"",pl:false,ps:"",suf:suf,pr:false};if(!suf)return o;var rest=suf;
  var qm=/(бы|би|бу|бү|пы|пи|пу|пү)$/.exec(rest);if(qm&&rest.length>qm[0].length){o.q=true;rest=rest.slice(0,-qm[0].length);if(KY_PRED.test(rest)){o.pr=true;rest="";}}
  var pm=/(мын|мин|мун|мүн|сың|сиң|суң|сүң|сыз|сиз|суз|сүз|быз|биз|буз|бүз|пыз|пиз|пуз|пүз)$/.exec(rest);
  if(pm){var r2=rest.slice(0,-pm[0].length);for(var q=0;q<KY_CASE.length;q++)if(KY_CASE[q][0].test(r2)&&KY_CASE[q][1]!=="対格"){rest=r2;o.pr=true;break;}}
  for(var i=0;i<KY_CASE.length;i++){var m=KY_CASE[i][0].exec(rest);if(m&&rest.length>=m[0].length){o.c=KY_CASE[i][1];o.jp=KY_CASE[i][2];rest=rest.slice(0,-m[0].length);break;}}
  if(!o.c&&/^[аеоө]$/.test(rest.slice(-1))&&/(ым|им|ум|үм|м|ың|иң|уң|үң|ң)[аеоө]$/.test(suf)){o.c="与格";o.jp="へ";rest=rest.slice(0,-1);}
  if(/(ыңыз|иңиз|уңуз|үңүз|ңыз|ңиз|ңуз|ңүз)$/.test(rest)){o.ps="あなたの";rest=rest.replace(/[ыиуү]?ң[ыиуү]з$/,"");}
  else if(/(ыбыз|ибиз|убуз|үбүз|быз|биз|буз|бүз)$/.test(rest)){o.ps="私たちの";rest=rest.replace(/[ыиуү]?б[ыиуү]з$/,"");}
  else if(/(ым|им|ум|үм|м)$/.test(rest)){o.ps="私の";rest=rest.replace(/[ыиуү]?м$/,"");}
  else if(/(ың|иң|уң|үң|ң)$/.test(rest)){o.ps="きみの";rest=rest.replace(/[ыиуү]?ң$/,"");}
  else if(/(сы|си|су|сү|ы|и|у|ү)$/.test(rest)&&rest.length){o.ps="彼の・その";rest=rest.replace(/с?[ыиуү]$/,"");}
  if(/(лар|лер|лор|лөр|дар|дер|дор|дөр|тар|тер|тор|төр)$/.test(rest))o.pl=true;
  return o;}
var KY_CJ={"位格":"位格（〜で・〜に）","与格":"与格（〜へ・〜に）","奪格":"奪格（〜から）","対格":"対格（〜を）","属格":"属格（〜の）"};
function kyNounLabel(o,lg){var a=[];if(o.pl)a.push("複数");if(o.ps)a.push("「"+o.ps+"」の語尾");a.push(o.c?(lg?KY_CJ[o.c]:o.c):"主格（語尾なし）");if(o.pr)a.push("「〜です」の語尾");if(o.q)a.push("質問の -бы");return a.join("＋");}
function kyStem(w){var b=p71Plain(w.word).toLowerCase();if(w.pos!=="verb")return b;if(b==="жеш")return "же";
  if(/(уу|үү)$/.test(b))return b.slice(0,-2);if(/оо$/.test(b))return b.slice(0,-2)+"а";if(/өө$/.test(b))return b.slice(0,-2)+(/[өү]/.test(b.slice(0,-2))?"ө":"е");return b;}
function kyVerbLabel(st,t){var suf=t.indexOf(st)===0?t.slice(st.length):null;if(suf===null)return "";
  if(/^[ыиуү]?(ңыз|ңиз|ңуз|ңүз)(чы|чи|чу|чү)?$/.test(suf))return "ていねいなお願い（〜してください）";
  if(/^(гы|ги|гу|гү|кы|ки|ку|кү)/.test(suf))return "「〜したい」の形（-гы ＋ келет）";
  if(/^(ба|бе|бо|бө|па|пе|по|пө)/.test(suf))return "否定（〜しない）";
  if(/^(ды|ди|ду|дү|ты|ти|ту|тү)/.test(suf))return "過去形（〜した）";
  if(/^[ыиуү]?п$/.test(suf))return "-ып 形（〜して）";
  if(/^(са|се|со|сө)/.test(suf))return "条件（〜したら）";
  if(/^[ыиуү]?ш/.test(suf))return "「〜すること」の形";
  if(/^(а|е|о|ө|й)/.test(suf)||/^[ыиуү]?й/.test(suf))return "現在・未来形（〜する）";
  return "";}
function kyLabel(w,tok){if(!w)return "";var n=p71N(tok),b=p71N(w.word);if(w.pos==="verb"){return kyVerbLabel(kyStem(w),n);}
  if(/\s/.test(b))return "";var sx=kyStemMatch(b,n);if(sx&&KY_Q.test(sx))return "質問の -бы（〜か）";if(sx&&KY_PRED.test(sx))return "「〜です」の語尾（-мын など）";
  if(!/^(noun|proper_noun|pronoun)$/.test(w.pos))return "";var o=kyNounInfo(b,n);return o&&o.suf?kyNounLabel(o,1):"";}
var KY_PRED=/^(мын|мин|мун|мүн|сың|сиң|суң|сүң|сыз|сиз|суз|сүз|быз|биз|буз|бүз|пыз|пиз|пуз|пүз|сыңар|сиңер|суңар|сүңөр)$/;
var KY_Q=/^(бы|би|бу|бү|пы|пи|пу|пү)$/;
/* 代名詞の変化形：[日本語, 格, 助詞] */
var PRONF={};(function(){var P={"мен":["私","мени","мага","менде","менден","менин"],"сен":["きみ","сени","сага","сенде","сенден","сенин"],"сиз":["あなた","сизди","сизге","сизде","сизден","сиздин"],
  "ал":["彼・彼女","аны","ага","анда","андан","анын"],"биз":["私たち","бизди","бизге","бизде","бизден","биздин"],"силер":["きみたち","силерди","силерге","силерде","силерден","силердин"],
  "алар":["彼ら","аларды","аларга","аларда","алардан","алардын"],"бул":["これ","муну","буга","мунда","мындан","мунун"]};
  Object.keys(P).forEach(function(k){var q=P[k];PRONF[k]=[q[0],"",""];PRONF[q[1]]=[q[0],"対格","を"];PRONF[q[2]]=[q[0],"与格","に"];PRONF[q[3]]=[q[0],"位格","のところに"];PRONF[q[4]]=[q[0],"奪格","から"];PRONF[q[5]]=[q[0],"属格","の"];});})();
/* 単語帳にない変化形を、語尾を外して単語帳の語に結びつける */
var KY_WL=null;
function kyFind(n){if(!KY_WL){KY_WL=VOCAB.filter(function(w){return !/[\s\-]/.test(p71N(w.word))&&p71N(w.word).length>=2;}).slice().sort(function(a,b){return p71N(b.word).length-p71N(a.word).length;});}
  for(var i=0;i<KY_WL.length;i++){var w=KY_WL[i],b=p71N(w.word);
    if(w.pos==="verb"){var st=kyStem(w);if(st.length>=2&&n.indexOf(st)===0&&n!==b&&kyVerbLabel(st,n))return w;continue;}
    if(n.length<=b.length)continue;var suf=kyStemMatch(b,n);if(suf===null)continue;
    if(KY_PRED.test(suf)||KY_Q.test(suf))return w;
    if(/^(noun|proper_noun|pronoun)$/.test(w.pos)){var o=kyNounInfo(b,n);if(o&&(o.c||o.ps||o.pl||o.pr||o.q)&&o.suf.length<=8)return w;}}
  return null;}
if(typeof p72Look==="function"){var _lk=p72Look;
  p72Look=function(tok,ctx){var n=p71N(tok);if(!n||(ctx&&ctx.w&&ctx.hit)||(p72Index()[n]||[]).length)return _lk.apply(this,arguments);
    var w=kyFind(n);if(w)return {id:w.id,base:w.accent||w.word,mean:w.meaning,form:kyLabel(w,tok),g:null};
    return _lk.apply(this,arguments);};}
p72Short=function(tok){var r=p72Look(tok);if(!r)return null;return {m:r.mean||"",t:"",base:r.base};};
try{p72GenderInfo=function(){return null;};}catch(_){}
try{p72FormName=function(w,tok){return kyLabel(w,tok);};}catch(_){}
/* 名詞の変化形を、練習の選択肢・単語の検索に使えるように足す */
try{var F=(window.P58_FORMS=window.P58_FORMS||{f:{}}).f=P58_FORMS.f||{};
  VOCAB.forEach(function(w){if(w.pos!=="noun")return;var b=p71Plain(w.word).toLowerCase();if(/[\s\-]/.test(b)||b.length<2)return;
    var m=kyNoun(b),k=p71N(b);F[k]=F[k]||{};Object.keys(m).forEach(function(x){F[k][x]=1;});});
  P72_IX=null;}catch(_){}
/* 練習の「形を選ぶ」問題に、それぞれの形の説明をつける */
if(typeof p71Forms==="function"){var _fo=p71Forms;
  p71Forms=function(w,f){var r=_fo.apply(this,arguments);if(!r)return r;
    r.opts.forEach(function(x){var l=kyLabel(w,x);if(l)r.lab[p71N(x)]=l;});return r;};}
/* 文の中の言葉：格に合わせた日本語の助詞 */
var KY_EXTRA={"атым":["私の名前","ат（名前）＋「私の」の語尾"],"жайыраак":["もっとゆっくり","比較（-ыраак）"],"чоңураак":["もっと大きい","比較（-ураак）"],"турат":["（値段が）する","туруу の現在形"]};
var PRON={"мен":"私","сен":"きみ","сиз":"あなた","ал":"彼・彼女","биз":"私たち","силер":"きみたち","сиздер":"あなたたち","алар":"彼ら","бул":"これ","ошол":"それ","тигил":"あれ"};
p72CtxGloss=function(ws,k){
  var x=ws[k];if(KY_EXTRA[x.n])return {html:esc(KY_EXTRA[x.n][0]),label:KY_EXTRA[x.n][1],note:""};
  var r=p72Look(x.t);if(!r||!r.id)return null;var w=WMAP[r.id];if(!w)return null;
  if(/^(эмне|ким|канча|кайда|кайдан|качан)$/.test(x.n))return {html:esc(String(w.meaning).split(/[／\/、,]/)[0]),label:"疑問の言葉",note:""};
  var mean=String(r.mean||w.meaning||"").split(/[／\/、,]/)[0].replace(/（.*?）/g,"").trim();
  if(w.pos==="verb"){var l=kyVerbLabel(kyStem(w),x.n),pv=k>0?ws[k-1].n:"";
    if(/^ал/.test(x.n)&&p71N(w.word)==="алуу"&&/[аеоөй]$/.test(pv))return {html:"できる",label:"「〜できる」の形（-а ＋ ал-）"+(/(бы|би|бу|бү)$/.test(x.n)?"・質問":/ба/.test(x.n)?"・否定":""),note:""};
    if(/^жат/.test(x.n)&&/[ыиуү]п$/.test(pv))return {html:"〜しているところ",label:"「いま〜している」の形（-ып ＋ жат-）",note:""};return {html:esc(mean),label:l||(p71N(w.word)===x.n?"":"動詞の変化形"),note:""};}
  if(PRONF[x.n]){var pf=PRONF[x.n],jp0=pf[2];if(!pf[1])jp0=k===0?"は":"";
    return {html:esc(pf[0])+(jp0?'<b class="p72-pt">'+esc(jp0)+'</b>':''),label:pf[1]?pf[1]:"主格（語尾なし）",note:pf[1]==="位格"&&/^(бар|жок|барбы)$/.test(ws[ws.length-1].n)?"「〜のところに（-да）…がある」で「〜は…を持っている」の意味になります。":pf[1]==="与格"&&/(^| )керек( |$)/.test(ws.map(function(y){return y.n;}).join(" "))?"「〜に（-га）…が必要だ」で「〜は…が必要です」の意味になります。":""};}
  var sx=kyStemMatch(p71N(w.word),x.n);
  if(sx&&KY_PRED.test(sx))return {html:esc(mean)+'<b class="p72-pt">です</b>',label:"「〜です」の語尾",note:""};
  if(sx&&KY_Q.test(sx))return {html:esc(mean)+'<b class="p72-pt">か</b>',label:"質問の -бы",note:""};
  if(!/^(noun|pronoun|proper_noun)$/.test(w.pos))return null;
  var o=kyNounInfo(p71N(w.word),x.n);if(!o)return null;
  var jp=o.jp,note="",nx=ws[k+1]?ws[k+1].n:"";
  if(!o.c){var first=true;for(var j=0;j<k;j++){var rj=p72Look(ws[j].t),wj=rj&&rj.id&&WMAP[rj.id];if(PRONF[ws[j].n]||(wj&&/^(noun|pronoun|proper_noun)$/.test(wj.pos))){first=false;break;}}
    if(k===0)first=true;
    if(k===0&&ws.length===2){var r1=p72Look(ws[1].t);if(r1&&r1.id&&WMAP[r1.id]&&WMAP[r1.id].pos==="verb")first=false;}
    if(/^(бар|жок|барбы|жокпу|керек)$/.test(nx))jp="が";
    else if(/^эмес/.test(nx))jp="";
    else if(/^(эмне|ким|канча)$/.test(x.n))jp="";
    else if(k===ws.length-1)jp="";
    else if(first)jp="は";
    else{var vb=ws.slice(k+1).some(function(y){var ry=p72Look(y.t);return ry&&ry.id&&WMAP[ry.id]&&WMAP[ry.id].pos==="verb";});if(vb){jp="を";note="「〜を」に当たる -ны は、決まったもの（その・この〜）にだけつきます。ここは決まっていないものなので語尾がありません。";}}}
  if(o.c==="位格"&&/^(бар|жок|барбы)$/.test(ws[ws.length-1].n)&&PRON[p71N(w.word)])note="「〜に（-да）…がある」で「〜は…を持っている」の意味になります。";
  if(o.c==="与格"&&/(^| )керек( |$)/.test(ws.map(function(y){return y.n;}).join(" ")))note="「〜に（-га）…が必要だ」で「〜は…が必要です」の意味になります。";
  if(o.c==="与格"&&(o.ps||PRON[p71N(w.word)]))jp="に";
  var nm=PRON[p71N(w.word)]||mean;
  if(o.pr&&o.c==="位格")jp="に";
  if(o.q&&!o.c){jp=o.pr?"ですか":"か";o.prs=o.pr;o.pr=false;}
  return {html:esc(nm)+(jp?'<b class="p72-pt">'+esc(jp)+'</b>':'')+(o.pr?'<small>（います・です）</small>':''),label:(o.pr=o.pr||o.prs,kyNounLabel(o)),note:note};
};
p72SentNotes=function(){return [];};

/* ---------- 文法解説書の見た目（ロシア語用の絵・目標・アイコンを、キルギス語用に） ---------- */
try{P72_BAN={basics:[["студент","Мен студентмин."],["үй","Бул менин үйүм."]],plural:[["китеп","китеп → китептер"],["дос","дос → достор"]],
  poss:[["бала","бала → балам"],["китеп","китеп → китебим"]],loc:[["үй","үйдө"],["мектеп","мектепте"]],dat:[["мектеп","мектепке"],["базар","базарга"]],
  acc:[["нан","нан жейм"],["китеп","китепти окудум"]],abl:[["мектеп","мектептен"],["үй","үйдөн"]],present:[["окуу","окуйм"],["жазуу","жазам"]],past:[["окуу","окудум"],["жазуу","жаздым"]],
  want:[["чай","чай ичким келет"],["нан","нан жегим келет"]],compare:[["үй","чоңураак үй"],["машина","эң жакшы машина"]]};}catch(_){}
try{P72_GOAL={basics:["Мен Бишкекке барам.","日本語と同じ順番で文が作れることがわかります。"],harmony:["шаарга／мектепке／үйгө","同じ「へ」の語尾が3つの形になる理由がわかります。"],
  pred:["Мен студентмин.","「私は学生です」の -мин がどこから来るかわかります。"],plural:["китеп → китептер","複数の -лар が -тер になる理由がわかります。"],
  poss:["Менин атым Таро.","атым の -ым が「私の」だとわかります。"],cases:["үй → үйдө・үйгө・үйдөн","同じ「家」の語尾が変わる理由がわかります。"],
  loc:["Менде машина бар.","「持っている」を「私には〜がある」と言う理由がわかります。"],dat:["Мага суу керек.","「私に水が必要」で「水がほしい」になるしくみがわかります。"],
  acc:["нан жейм／нанды жедим","「を」の -ны をつける時とつけない時がわかります。"],abl:["Мен Япониядан келдим.","「〜から」の -дан の使い方がわかります。"],
  present:["барам／барасыз／барат","だれが言うかで動詞の語尾が変わるしくみがわかります。"],past:["бардым／бардыңыз／барды","過去形の作り方がわかります。"],
  question:["Сиз студентсизби?","「〜ですか」の作り方がわかります。"],want:["Чай ичким келет.","「〜したい」「〜できる」の言い方がわかります。"],
  polite:["Кайра айтыңызчы.","ていねいなお願いの作り方がわかります。"],connect:["…, анткени ооруп жатам.","理由や「でも」の言い方がわかります。"],
  compare:["Бишкек Оштон чоң.","「〜より大きい」の言い方がわかります。"],jpdiff:["Мен үйгө барам.","日本語と同じところ・ちがうところがまとめてわかります。"]};}catch(_){}
try{var IC={basics:["Мен","#3B82C4"],harmony:["а/е","#8A63C9"],pred:["-мын","#2E9C8F"],plural:["-лар","#4A9BB0"],poss:["-ым","#C98A12"],cases:["格","#5B8C3A"],loc:["で","#5B8C3A"],dat:["へ","#C98A12"],acc:["を","#E0503F"],abl:["から","#2E9C8F"],
  present:["-ам","#3B82C4"],past:["-дым","#8A63C9"],question:["-бы?","#E0503F"],want:["-гым","#C98A12"],polite:["-ңыз","#2E9C8F"],connect:["＋","#4A9BB0"],compare:["＞","#5B8C3A"],jpdiff:["日","#E0503F"]};
  Object.keys(IC).forEach(function(id){var q=IC[id];P72_ICON[id]=function(){var fs=q[0].length>3?10:q[0].length>2?12:16;
    return '<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="1" y="1" width="42" height="42" rx="11" fill="'+q[1]+'" opacity=".15"/><rect x="6" y="9" width="32" height="26" rx="8" fill="'+q[1]+'"/><text x="22" y="'+(22+fs*0.36)+'" text-anchor="middle" font-size="'+fs+'" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">'+q[0]+'</text></svg>';};});}catch(_){}
if(typeof p72GuideRender==="function"){var _gr=p72GuideRender;
  p72GuideRender=function(){_gr.apply(this,arguments);var m=document.getElementById("p72g");if(!m||!P72G)return;
    var how=m.querySelector(".p72-how span");if(how)how.innerHTML=how.innerHTML.replace("意味・性（男性／女性／中性）・なぜその形か","意味と、どの語尾がついた形か");
    m.querySelectorAll(".p72-where").forEach(function(e){e.remove();});
    var g=guideOf(P72G.id);if(g&&g.u&&g.u.length){var names=[];(window.COMPOSE||[]).forEach(function(c){if(g.u.indexOf(unitNo(c))>=0&&names.indexOf(c.unit)<0)names.push(c.unit);});
      var nav=m.querySelector(".p72-gnav");if(nav&&names.length)nav.insertAdjacentHTML("beforebegin",'<div class="p72-where"><div class="p71-tblh">この文法がたくさん出てくる会話の単元</div><p>その他の練習 › 文法別練習 の「'+names.map(esc).join("」「")+'」</p></div>');}};}

/* ---------- CSS ---------- */
try{var st=document.createElement("style");st.textContent='.p79-kn{margin-top:6px;font-size:12.5px;line-height:1.6;color:var(--muted)}';document.head.appendChild(st);}catch(_){}
})();
