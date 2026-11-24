/* ===== PHASE72: 一歩レッスンの強化
   ・問題文の単語を押すと意味が出る
   ・答えたあとの解説を、初心者向けにくわしく（なぜこの形？／語尾の作り方／文の言葉）
   ・その文法をどこで習うか（道のりのレッスン・文法別練習・文法解説書）
   ・アプリ内の文法解説書（P72_GUIDE）
   ・問題のお気に入りと、お気に入りだけの練習 ===== */
function p72Ru(){return P47_LANG!=="ky";}
function p72St(){var s=p71St();if(!s.fav)s.fav={};return s;}

/* ---------- 名詞の複数形（文の中の形が複数のときだけ使う） ---------- */
function p72NounPl(b){
  var m={},st;if(/[^а-я-]/.test(b)||b.length<3)return m;
  function add(f,l){p71Add(m,f,l);}
  if(/[бвгдзклмнпрстфхжшщчц]$/.test(b)){var sib=/[жшщч]$/.test(b),vel=/[гкхжшщч]$/.test(b);
    add(b+(vel?"и":"ы"),"主格複数");add(b+(sib?"ей":(/ц$/.test(b)?"ев":"ов")),"生格複数");add(b+"ам","与格複数");add(b+"ами","造格複数");add(b+"ах","前置格複数");}
  else if(/й$/.test(b)){st=b.slice(0,-1);add(st+"и","主格複数");add(st+"ев","生格複数");add(st+"ям","与格複数");add(st+"ями","造格複数");add(st+"ях","前置格複数");}
  else if(/а$/.test(b)){st=b.slice(0,-1);add(st+"ам","与格複数");add(st+"ами","造格複数");add(st+"ах","前置格複数");}
  else if(/я$/.test(b)){st=b.slice(0,-1);add(st+"ям","与格複数");add(st+"ями","造格複数");add(st+"ях","前置格複数");}
  else if(/о$/.test(b)){st=b.slice(0,-1);add(st+"а","主格複数");add(st+"ам","与格複数");add(st+"ами","造格複数");add(st+"ах","前置格複数");}
  else if(/ь$/.test(b)){st=b.slice(0,-1);add(st+"и","主格複数");add(st+"ей","生格複数");add(st+"ям","与格複数");add(st+"ями","造格複数");add(st+"ях","前置格複数");}
  return m;
}
/* p71Noun は単数だけ。文の中が複数形のときは複数形の選択肢も作る */
var _p72Noun=p71Noun;
p71Noun=function(b,sameOk){
  var m=_p72Noun(b,sameOk);if(!m||!P72_NSURF)return m;
  var pl=p72NounPl(b),sn=P72_NSURF;
  if(Object.keys(pl).some(function(k){return p71N(k)===sn;})&&!Object.keys(m).some(function(k){return p71N(k)===sn;})){
    Object.keys(pl).forEach(function(k){pl[k].forEach(function(l){p71Add(m,k,l);});});}
  return m;
};
var P72_NSURF=null;
var _p72Forms=p71Forms;
p71Forms=function(w,f){P72_NSURF=f?p71N(f.surface):null;try{
    var r=_p72Forms(w,f);
    /* 数のあとの名詞：1・2〜4・5以上で形が決まるので、ラベルをしぼる */
    if(r&&w.pos==="noun"){var k=r.key,l=r.lab[k],n=p72Num(f);
      if(l&&n&&l.indexOf("・")>0){var want=n.k==="few"?/^生格$/:n.k==="many"?/生格複数/:n.k==="one"?/主格|対格/:null;
        if(want){var keep=l.split("・").filter(function(x){return want.test(x);});if(keep.length)r.lab[k]=keep.join("・");}}}
    return r;}finally{P72_NSURF=null;}};

/* ---------- 数の手がかり ---------- */
var P72_FEW=/^(два|две|три|четыре|полтора|полторы|оба|обе)$/,P72_ONE=/^(один|одна|одно)$/;
var P72_MANY=/^(пять|шесть|семь|восемь|девять|десять|одиннадцать|двенадцать|тринадцать|четырнадцать|пятнадцать|шестнадцать|семнадцать|восемнадцать|девятнадцать|двадцать|тридцать|сорок|пятьдесят|шестьдесят|семьдесят|восемьдесят|девяносто|сто|двести|триста|четыреста|пятьсот|шестьсот|семьсот|восемьсот|девятьсот|тысяча|тысячу|тысячи|тысяч|миллион|миллиона|миллионов|много|мало|немного|несколько|сколько|столько|ноль)$/;
function p72Num(f){
  if(!f)return null;var seen=0;
  for(var i=f.a-1;i>=0&&seen<3;i--){var t=f.toks[i];if(!/[^\s,.!?;:—«»"“”()]/.test(t))continue;seen++;var n=p71N(t);
    if(/^\d+$/.test(n)){var d=+n%10,dd=+n%100;return {w:t,k:(dd>=11&&dd<=14)?"many":d===1?"one":(d>=2&&d<=4)?"few":"many"};}
    if(P72_ONE.test(n))return {w:t,k:"one"};if(P72_FEW.test(n))return {w:t,k:"few"};if(P72_MANY.test(n))return {w:t,k:"many"};
    if(seen===1&&/(ый|ий|ой|ых|их|ая|ое|ые|ого|ую|ой)$/.test(n))continue; /* 数と名詞のあいだの形容詞 */
    break;}
  return null;
}
var P72_NUMTXT={one:"1（один／одна）のあとは、名詞は主格の単数（辞書の形）のままです。",
  few:"2・3・4（два／две／три／четыре）のあとは、名詞は「単数の生格」になります。",
  many:"5以上の数（пять…двести…）や много（たくさん）・сколько（いくつ）のあとは、名詞は「複数の生格」になります。"};

/* ---------- やさしい説明 ---------- */
var P72_EASY={
  nom:"主格は、辞書にのっている形です。文の主語（〜が・〜は）や、「これは〜です」の「〜」に使います。",
  gen:"生格は「〜の」を表す形です。ほかにも、нет（〜がない）のあと、数や量のあと、у・из・без・для などの前置詞のあとで使います。",
  dat:"与格は「〜に」を表す形です。あげる・言う・電話する相手や、「私には寒い」のように感じる人を表します。",
  acc:"対格は「〜を」を表す形です。動詞が直接はたらきかける相手に使います。в・на と一緒だと「〜へ（行き先）」になります。",
  ins:"造格は「〜で（道具・手段）」「〜と一緒に（с と）」「〜として・〜になる」を表す形です。",
  pre:"前置格は、必ず前置詞と一緒に使う形です。в・на と「〜で（場所）」、о と「〜について」を表します。",
  pres:"動詞の現在形は、主語（я・ты・он…）によって語尾が6通りに変わります。主語が決まれば形も決まります。",
  inf:"不定形は辞書の形（-ть で終わる形）です。могу́（できる）・хочу́（したい）・на́до（必要だ）・люблю́（好きだ）などのあとでは、この形のまま使います。",
  past:"過去形は、主語の人の数で語尾が決まります。男性ひとりなら -л、女性ひとりなら -ла、中性なら -ло、複数・вы なら -ли。я・ты は話す人の性別で選びます。",
  adj:"形容詞は、説明する名詞に「性・数・格」をそろえます。名詞が変われば形容詞の語尾も変わります。"};
var P72_TOPIC_NAME={nom:"主格",gen:"生格",dat:"与格",acc:"対格",ins:"造格",pre:"前置格",num:"数と名詞",adj:"形容詞の一致",pres:"現在形・不定形",past:"過去形",prep:"前置詞と格",plural:"複数形",aspect:"完了体と不完了体",motion:"移動の動詞",imper:"命令形"};
/* 名詞の語尾の作り方（性ごと） */
var P72_END={
  gen:{s:{m:"子音で終わる語 → -а（-й は -я）　例 сто́л → стола́",f:"-а → -ы（г・к・х・ж・ш・щ・ч のあとは -и）、-я → -и　例 ма́ма → ма́мы",n:"-о → -а、-е → -я　例 окно́ → окна́"},
       p:{m:"子音で終わる語 → -ов（ж・ш・щ・ч のあとは -ей、-й は -ев）　例 стол → столо́в",f:"-а をとる（語尾なし）　例 ма́ма → мам、-ь は -ей",n:"-о をとる（語尾なし）　例 окно́ → о́кон"}},
  dat:{s:{m:"子音で終わる語 → -у（-й は -ю）　例 брат → бра́ту",f:"-а・-я → -е（-ия は -ии、-ь は -и）　例 ма́ма → ма́ме",n:"-о → -у、-е → -ю"},p:{m:"-ам（やわらかい語は -ям）",f:"-ам／-ям",n:"-ам／-ям"}},
  acc:{s:{m:"物なら主格と同じ。人・動物なら生格と同じ（брат → бра́та）",f:"-а → -у、-я → -ю　例 ка́рта → ка́рту（-ь は変わらない）",n:"主格と同じ"},p:{m:"物なら主格と同じ、人・動物なら生格と同じ",f:"物なら主格と同じ、人・動物なら生格と同じ",n:"主格と同じ"}},
  ins:{s:{m:"子音で終わる語 → -ом（ж・ш・щ・ч・ц のあとでアクセントがない時や -й は -ем）　例 хлеб → хле́бом",f:"-а → -ой、-я → -ей（-ь は -ью）　例 ма́ма → ма́мой",n:"-о → -ом、-е → -ем"},p:{m:"-ами（やわらかい語は -ями）",f:"-ами／-ями",n:"-ами／-ями"}},
  pre:{s:{m:"子音で終わる語 → -е　例 го́род → в го́роде（-ий は -ии）",f:"-а・-я → -е（-ия は -ии、-ь は -и）",n:"-о → -е（-ие は -ии）"},p:{m:"-ах（やわらかい語は -ях）",f:"-ах／-ях",n:"-ах／-ях"}},
  nom:{s:{m:"辞書の形",f:"辞書の形",n:"辞書の形"},p:{m:"-ы（г・к・х・ж・ш・щ・ч のあとは -и）　例 стол → столы́",f:"-а → -ы／-и、-я → -и",n:"-о → -а、-е → -я　例 окно́ → о́кна"}}};
var P72_GNAME={m:"男性名詞",f:"女性名詞",n:"中性名詞"};
function p72Gender(w){
  var t=(w.detailExp||"")+(w.changeRule||"")+(w.simpleExp||"");
  if(/男性名詞/.test(t))return "m";if(/女性名詞/.test(t))return "f";if(/中性名詞/.test(t))return "n";
  var b=p71N(w.word);if(/(а|я)$/.test(b))return /^(папа|дядя|дедушка|мужчина)$/.test(b)?"m":"f";if(/(о|е)$/.test(b))return "n";if(/[бвгдзклмнпрстфхжшщчцй]$/.test(b))return "m";return null;
}
var P72_CASEK={"主格":"nom","生格":"gen","与格":"dat","対格":"acc","造格":"ins","前置格":"pre"};
function p72CaseOf(l){var k=null;Object.keys(P72_CASEK).forEach(function(c){if(l.indexOf(c)>=0&&!k)k=P72_CASEK[c];});return k;}
/* ラベルから、関係する文法トピックを出す */
function p72Topics(w,lab,f){
  var t=[],l=lab||"";function add(x){if(x&&t.indexOf(x)<0)t.push(x);}
  if(w.pos==="verb"){if(/過去/.test(l))add("past");else if(/の形|不定形/.test(l))add("pres");}
  else{if(w.pos==="adjective"&&l)add("adj");if(l.indexOf("・")<0||w.pos==="adjective")add(p72CaseOf(l));if(/複数/.test(l))add("plural");}
  if(f){if(p71Ctx(f).length)add("prep");if(p72Num(f))add("num");}
  return t;
}

/* ---------- 単語の意味を調べる ---------- */
var P72_FN={"я":"私は","меня":"私を・私の（生格／対格）","мне":"私に（与格）","мной":"私と（造格）","ты":"きみは","тебя":"きみを（生格／対格）","тебе":"きみに（与格）","он":"彼は・それは","его":"彼を・彼の","ему":"彼に","она":"彼女は・それは","её":"彼女を・彼女の","ее":"彼女を・彼女の","ей":"彼女に","мы":"私たちは","нас":"私たちを・私たちの","нам":"私たちに","вы":"あなた（たち）は","вас":"あなた（たち）を","вам":"あなた（たち）に","они":"彼らは","их":"彼らを・彼らの","им":"彼らに",
  "это":"これ・それ","и":"そして・〜と","а":"では・一方","но":"しかし","не":"〜ない","да":"はい","нет":"いいえ・〜がない","в":"〜の中で・〜へ","во":"〜の中で・〜へ","на":"〜の上で・〜へ","с":"〜と一緒に・〜から","со":"〜と一緒に","к":"〜のところへ","у":"〜のところに・〜には","из":"〜から","от":"〜から","для":"〜のために","без":"〜なしで","до":"〜まで","после":"〜のあと","о":"〜について","об":"〜について","по":"〜に沿って・〜で","за":"〜の後ろで・〜のために","под":"〜の下で","над":"〜の上方で","перед":"〜の前で","между":"〜の間で","через":"〜を通って・〜後に","что":"何・〜ということ","как":"どのように・〜のように","где":"どこで","куда":"どこへ","когда":"いつ・〜のとき","почему":"なぜ","кто":"誰","уже":"もう","ещё":"まだ・もっと","еще":"まだ・もっと","очень":"とても","тоже":"〜も","мой":"私の","моя":"私の","моё":"私の","мои":"私の","твой":"きみの","твоя":"きみの","наш":"私たちの","наша":"私たちの","ваш":"あなたの","ваша":"あなたの","этот":"この","эта":"この","это́т":"この","один":"1・ひとつ","одна":"1・ひとつ","два":"2","две":"2","три":"3","четыре":"4","пять":"5","шесть":"6","семь":"7","восемь":"8","девять":"9","десять":"10","двадцать":"20","сто":"100","двести":"200","триста":"300","пятьсот":"500","тысяча":"1000","тысячу":"1000（対格）","тысячи":"1000（生格）","тысяч":"1000（生格複数）","здесь":"ここで","там":"そこで","сейчас":"今","бы":"〜だろうに（仮定）","ли":"〜かどうか","же":"（強め）"};
var P72_IX=null;
var P72_PROPER={"москва":["モスクワ（地名）","Москва́","f"],"россия":["ロシア（国名）","Росси́я","f"],"япония":["日本（国名）","Япо́ния","f"],"бишкек":["ビシケク（地名）","Бишке́к","m"],"киргизия":["キルギス（国名）","Кирги́зия","f"]};
function p72Index(){
  if(P72_IX)return P72_IX;var ix={};function put(k,v){k=p71N(k);if(!k)return;(ix[k]=ix[k]||[]).push(v);}
  VOCAB.forEach(function(w){var n=p71N(w.word);if(/\s/.test(n))return;put(n,{id:w.id,base:w.accent||w.word,form:""});});
  var F=(window.P58_FORMS&&P58_FORMS.f)||{},byW={};VOCAB.forEach(function(w){var n=p71N(w.word);if(!byW[n])byW[n]=w;});
  Object.keys(F).forEach(function(lem){var w=byW[p71N(lem)];Object.keys(F[lem]).forEach(function(fm){put(fm,{id:w?w.id:null,base:w?(w.accent||w.word):lem,form:"",mean:w?"":""});});});
  (window.COMPOSE||[]).forEach(function(c){(c.breakdown||[]).forEach(function(t){if(!t.surface||/\s/.test(p71N(t.surface)))return;var w=byW[p71N(t.base)];put(t.surface,{id:w?w.id:null,base:t.base,mean:t.meaning||"",form:""});});});
  if(p72Ru()){/* 規則で作れる形も引けるようにする（со́ма、Москву́ など） */
    VOCAB.forEach(function(w){var b=p71Plain(w.word).toLowerCase();if(/\s/.test(b))return;var m=null;
      try{if(w.pos==="noun"){m=_p72Noun(b,true)||{};var pl=p72NounPl(b);Object.keys(pl).forEach(function(k){pl[k].forEach(function(l){p71Add(m,k,l);});});}
        else if(w.pos==="adjective")m=p71Adj(b);else if(w.pos==="verb"){var v=p71Verb(b,b);if(v){m=v.m;Object.keys(v.pm||{}).forEach(function(k){p71Add(m,k,v.pm[k]);});}}}catch(_){}
      if(m)Object.keys(m).forEach(function(k){if(p71N(k)!==p71N(b))put(k,{id:w.id,base:w.accent||w.word,form:m[k].join("・")});});});
    Object.keys(P72_PROPER).forEach(function(k){var m=_p72Noun(k,true)||{};m[k]=["主格"];Object.keys(m).forEach(function(f){put(f,{id:null,base:P72_PROPER[k][1],mean:P72_PROPER[k][0],form:f===k?"":m[f].join("・"),g:P72_PROPER[k][2]});});});}
  P72_IX=ix;return ix;
}
function p72Look(tok,ctx){
  var n=p71N(tok);if(!n)return null;
  if(ctx&&ctx.w&&ctx.hit)return {id:ctx.w.id,base:ctx.w.accent||ctx.w.word,mean:ctx.w.meaning,form:ctx.lab||""};
  var ix=p72Index(),hs=ix[n]||[],r=null;
  hs.forEach(function(h){if(!r||(!r.id&&h.id))r=h;});
  if(r){var w=r.id&&WMAP[r.id];var o={id:r.id,base:r.base,mean:w?w.meaning:(r.mean||P72_FN[n]||""),form:r.form||"",g:r.g||null};
    if(w&&p71N(w.word)!==n&&!o.form){o.form=p72FormName(w,tok);}if(P72_FN[n]&&!w)o.mean=P72_FN[n];return o;}
  if(P72_FN[n])return {id:null,base:tok,mean:P72_FN[n],form:""};
  /* 語幹で探す（最後の手段） */
  if(n.length>=5){var best=null;for(var cut=1;cut<=3&&!best;cut++){var s=n.slice(0,n.length-cut);if(s.length<4)break;
      for(var i=0;i<VOCAB.length;i++){var vn=p71N(VOCAB[i].word);if(/\s/.test(vn))continue;if(vn.indexOf(s)===0&&vn.length-s.length<=3){best=VOCAB[i];break;}}}
    if(best)return {id:best.id,base:best.accent||best.word,mean:best.meaning,form:p72FormName(best,tok),guess:1};}
  return null;
}
function p72FormName(w,tok){
  if(!p72Ru()||!w)return "";var b=p71Plain(w.word).toLowerCase(),n=p71N(tok),m=null;
  try{if(w.pos==="noun"){m=_p72Noun(b,true)||{};var pl=p72NounPl(b);Object.keys(pl).forEach(function(k){pl[k].forEach(function(l){p71Add(m,k,l);});});}
    else if(w.pos==="adjective")m=p71Adj(b);else if(w.pos==="verb"){var v=p71Verb(b,tok);m=v&&v.m;}}catch(_){}
  if(!m)return "";var out="";Object.keys(m).forEach(function(k){if(p71N(k)===n)out=m[k].join("・");});return out;
}

/* ---------- 画面の明るさに合わせて色を選ぶ ---------- */
function p72Theme(){try{document.documentElement.classList.toggle("p72-dark",!document.body.classList.contains("p69-light"));}catch(_){}}
/* ---------- 単語の説明（性・形・理由） ---------- */
var P72_GEX={"папа":"m","дядя":"m","дедушка":"m","мужчина":"m","юноша":"m","кофе":"m","время":"n","имя":"n"};
function p72GenderInfo(w,g0){
  if(!w)return g0?{g:g0,why:""}:null;
  var b=p71N(w.word),t=(w.detailExp||"")+(w.changeRule||"")+(w.simpleExp||""),tg=/男性名詞/.test(t)?"m":/女性名詞/.test(t)?"f":/中性名詞/.test(t)?"n":null;
  var byEnd=/[бвгдзклмнпрстфхжшщчц]$/.test(b)?["m","子音で終わる語は男性"]:/й$/.test(b)?["m","-й で終わる語は男性"]:/мя$/.test(b)?["n","-мя で終わる語は中性"]:/[ая]$/.test(b)?["f","-а・-я で終わる語は女性"]:/[ое]$/.test(b)?["n","-о・-е で終わる語は中性"]:/ь$/.test(b)?[null,"-ь で終わる語は男性と女性があり、単語ごとに覚えます"]:[null,""];
  if(P72_GEX[b])return {g:P72_GEX[b],why:b==="кофе"?"кофе（コーヒー）は形は変わりませんが、男性として扱う特別な語です":b==="время"||b==="имя"?byEnd[1]:"-а・-я で終わりますが、意味が男性なので男性名詞（例外）"};
  var g=tg||byEnd[0];if(!g)return null;
  var why=byEnd[0]&&g!==byEnd[0]?"語尾からは"+P72_GNAME[byEnd[0]].replace("名詞","")+"に見えますが、この語は"+P72_GNAME[g]+"（例外）":byEnd[1];
  return {g:g,why:why};
}
var P72_CASEJP={nom:"主格（〜が・〜は）",gen:"生格（〜の・〜がない・数のあと）",dat:"与格（〜に）",acc:"対格（〜を・〜へ）",ins:"造格（〜で・〜と一緒に）",pre:"前置格（〜で〔場所〕・〜について）"};
function p72FormWhy(w,form,g){
  if(!form)return "";var ck=p72CaseOf(form),pl=/複数/.test(form);
  if(w&&w.pos==="noun"&&ck&&ck!=="nom"&&g&&P72_END[ck]){var e=P72_END[ck][pl?"p":"s"][g]||"";return P72_CASEJP[ck]+(pl?"の複数":"")+"。"+P72_GNAME[g]+"の作り方："+e.split("　例")[0];}
  if(ck)return P72_CASEJP[ck]+(pl?"の複数":"")+"の形です。";
  if(/過去/.test(form))return "過去形。主語が"+form.replace(/・過去.*/,"")+"のときの語尾です。";
  if(/の形$/.test(form))return "現在形。主語が "+form.replace(/ の形$/,"")+" のときの語尾です。";
  if(/不定形/.test(form))return "辞書の形（不定形）です。";
  return "";
}
function p72InfoHtml(tok,ctx,full){
  var r=p72Look(tok,ctx),h="";
  if(!r)return '<div class="p72-pm"><span class="p72-mut">この言葉の意味は、まだ辞書にありません。日本語訳を参考にしてください。</span></div>';
  var w=r.id&&WMAP[r.id],changed=r.base&&p71N(r.base)!==p71N(tok);
  if(changed){var d=p72Diff(r.base,tok);h+='<div class="p72-pb"><span>辞書の形</span><b>'+esc(p71Plain(r.base))+'</b><i>→</i><b>'+esc(d.stem)+'<em>'+esc(d.endB)+'</em></b></div>';}
  h+='<div class="p72-pm">'+(esc(r.mean||"")||'<span class="p72-mut">意味が見つかりませんでした</span>')+'</div>';
  if(w&&w.kana&&!changed)h+='<div class="p72-mut">'+esc(w.kana)+'</div>';
  var gi=(w&&w.pos==="noun")||r.g?p72GenderInfo(w,r.g):null;
  var rows=[];
  if(gi&&gi.g)rows.push(['性','<b class="p72-g'+gi.g+'">'+P72_GNAME[gi.g]+'</b>'+(gi.why?'<small>'+esc(gi.why)+'</small>':'')]);
  else if(w&&w.pos){var pp=w.pos==="phrase"&&/副詞/.test((w.simpleExp||"")+(w.detailExp||""))?"adverb":w.pos;var pn={verb:"動詞",adjective:"形容詞",adverb:"副詞（形は変わらない）",phrase:"決まった言い方",number:"数詞",pronoun:"代名詞",preposition:"前置詞"}[pp];if(pn)rows.push(['品詞',esc(pn)]);}
  if(r.form){var fw=p72FormWhy(w,r.form,gi&&gi.g);rows.push(['形','<b>'+esc(r.form)+'</b>'+(fw?'<small>'+esc(fw)+'</small>':'')]);}
  else if(changed&&!r.form)rows.push(['形','<small>辞書の形から変わった形です。</small>']);
  if(rows.length)h+='<div class="p72-prow">'+rows.map(function(q){return '<div><span>'+q[0]+'</span><div>'+q[1]+'</div></div>';}).join("")+'</div>';
  if(full&&w&&w.simpleExp)h+='<div class="p72-pnote">'+esc(w.simpleExp)+'</div>';
  if(r.guess)h+='<div class="p72-mut">※ つづりから推測しました</div>';
  if(full&&w){var fav=progress[w.id]&&progress[w.id].favorite;h+='<button type="button" class="p72-pfav'+(fav?" on":"")+'" data-act="p72wfav" data-val="'+w.id+'">'+(fav?'★ 単語をお気に入りに登録ずみ':'☆ この単語をお気に入りに入れる')+'</button>';}
  return h;
}
/* ---------- 単語ポップアップ ---------- */
function p72Wrap(root){
  if(!root)return;
  root.querySelectorAll(".p71-sent,.p71-ex>div,.p71-gl-ru,.p72-art,.p72-ban,.p72-gru").forEach(function(el){
    var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),list=[],nd;
    while((nd=tw.nextNode()))if(!(nd.parentNode.closest&&nd.parentNode.closest("button,.p72-w,svg,em"))&&/[А-Яа-яЁёҢңӨөҮү]/.test(nd.nodeValue))list.push(nd);
    list.forEach(function(t){var parts=t.nodeValue.split(/([А-Яа-яЁёҢңӨөҮү́\-]*[А-Яа-яЁёҢңӨөҮү][А-Яа-яЁёҢңӨөҮү́\-]*)/),fr=document.createDocumentFragment();
      parts.forEach(function(p,i){if(!p)return;if(i%2&&(/^-/.test(p)||/[＋+]\s*$/.test(parts[i-1]||""))&&el.closest(".p72-art")){var e2=document.createElement("em");e2.className="p72-endg";e2.textContent=p;fr.appendChild(e2);return;}if(i%2){var s=document.createElement("span");s.className="p72-w";s.setAttribute("data-act","p72w");s.setAttribute("data-val",p);s.textContent=p;
          if(t.parentNode.classList&&t.parentNode.classList.contains("p71-blank"))s.setAttribute("data-hit","1");fr.appendChild(s);}else fr.appendChild(document.createTextNode(p));});
      t.parentNode.replaceChild(fr,t);});
  });
}
function p72Pop(el){
  p72PopClose();var tok=el.getAttribute("data-val"),S=P71,x=S&&S.steps[S.pos],ctx=null;
  if(x&&x.c&&el.getAttribute("data-hit")){var w=WMAP[x.id],fm=x.c.forms;ctx={w:w,hit:1,lab:(fm&&fm.lab[fm.key])||p72FormName(w,tok)};}
  else if(x&&x.c&&p71N(tok)===p71N(x.c.f.surface)&&el.closest(".p71-sent")){var w2=WMAP[x.id];ctx={w:w2,hit:1,lab:p72FormName(w2,tok)};}
  var plain=p71Plain(tok),h='<div class="p72-ph"><b>'+esc(plain)+'</b>'+p71Spk(plain,"p72-pspk")+'<button type="button" class="p72-px" data-act="p72popx" aria-label="閉じる">✕</button></div>'+p72InfoHtml(tok,ctx,1);
  var p=document.createElement("div");p.id="p72pop";p.innerHTML=h;document.body.appendChild(p);
  var r0=el.getBoundingClientRect(),W=Math.min(330,window.innerWidth-24),left=Math.max(12,Math.min(r0.left+r0.width/2-W/2,window.innerWidth-W-12));
  p.style.width=W+"px";p.style.left=left+"px";var ph=p.offsetHeight,top=r0.bottom+8;if(top+ph>window.innerHeight-12)top=Math.max(12,r0.top-ph-8);p.style.top=top+"px";
  el.classList.add("on");P72_POPEL=el;
}
var P72_POPEL=null;
function p72PopClose(){var p=document.getElementById("p72pop");if(p)p.remove();if(P72_POPEL){P72_POPEL.classList.remove("on");P72_POPEL=null;}}

/* ---------- どこで習う？（道のりのレッスンの索引） ---------- */
var P72_WIX=null;
function p72WhereIndex(){
  if(P72_WIX)return P72_WIX;var ix={},R=p70Road();
  R.list.forEach(function(x){var L=p71Lessons(x.i);L.forEach(function(ids,li){ids.forEach(function(id){var c=null;try{c=p71Cloze(id);}catch(_){}if(!c)return;var w=WMAP[id],fm=c.forms,l=fm?fm.lab[fm.key]:p72FormName(w,c.f.surface);
    p72Topics(w,l,c.f).forEach(function(t){var a=ix[t]=ix[t]||[];if(!a.length||a[a.length-1].ti!==x.i||a[a.length-1].li!==li)a.push({ti:x.i,li:li});});});});});
  P72_WIX=ix;return ix;
}
var P72_UNITS={gen:["Unit 22","Unit 03"],dat:["Unit 15"],acc:["Unit 13"],ins:["Unit 21"],pre:["Unit 14","Unit 04"],num:["Unit 07","Unit 22"],plural:["Unit 38"],pres:["Unit 10"],past:["Unit 11"],aspect:["Unit 23"],motion:["Unit 05","Unit 32"],imper:["Unit 16"],prep:["Unit 04","Unit 39"],nom:["Unit 01"],adj:["Unit 24"]};
function p72UnitNames(t){var all={};(window.COMPOSE||[]).forEach(function(c){if(c.unit)all[c.unit.split("：")[0]]=c.unit;});return (P72_UNITS[t]||[]).map(function(u){return all[u];}).filter(Boolean);}
function p72Where(t){
  var a=(p72WhereIndex()[t]||[]),st=p71St(),first=a[0],next=null,cnt=0;
  a.forEach(function(r){var d=st.done[p71Key(r.ti,r.li)];if(d)cnt++;else if(!next)next=r;});
  return {first:first,next:next,done:cnt,total:a.length};
}
function p72LName(r){return '『'+esc(P47_THEMES[r.ti].cat)+'』レッスン '+(r.li+1);}
function p72WhereHtml(topics,inLesson){
  if(!p72Ru()||!topics.length)return "";
  var h='<div class="p72-where"><div class="p71-tblh">この文法はどこで習う？</div>';
  topics.forEach(function(t){var g=p72GuideFor(t),wh=p72Where(t),u=p72UnitNames(t);
    h+='<div class="p72-wrow"><b>'+esc(P72_TOPIC_NAME[t]||t)+'</b>';
    if(wh.total){h+='<p>道のりの '+wh.total+' レッスンに出てきます（いま '+wh.done+' レッスン通過）。';
      if(wh.first&&wh.next&&wh.first.ti===wh.next.ti&&wh.first.li===wh.next.li)h+='最初に出てくるのは '+p72LName(wh.first)+'（まだ）。';
      else{if(wh.first)h+='最初は '+p72LName(wh.first)+'。';if(wh.next)h+='まだのものでは、次は '+p72LName(wh.next)+' に出てきます。';else if(wh.done)h+='道のりに出てくるレッスンは全部通過しました。';}
      h+='</p>';}
    if(u.length)h+='<p>まとめて練習：その他の練習 › 文法別練習 の「'+u.map(esc).join("」「")+'」</p>';
    if(g)h+='<button type="button" class="p72-glink" data-act="p72guide" data-val="'+g.id+'">文法解説書「'+esc(g.t)+'」を読む ›</button>';
    h+='</div>';});
  return h+'</div>';
}
function p72GuideFor(t){var id={nom:"nom",gen:"gen",dat:"dat",acc:"acc",ins:"ins",pre:"pre",num:"num",adj:"adj",pres:"pres",past:"past",prep:"prep",plural:"plural",aspect:"aspect",motion:"motion",imper:"imper"}[t];
  if(!id||!window.P72_GUIDE)return null;for(var i=0;i<P72_GUIDE.length;i++)if(P72_GUIDE[i].id===id)return P72_GUIDE[i];return null;}

/* ---------- 答えたあとの解説（作り直し） ---------- */
function p72Diff(a,b){/* 共通の頭を探して、語尾の違いを出す */
  var x=p71N(a),y=p71N(b),k=0;while(k<x.length&&k<y.length&&x[k]===y[k])k++;
  var pa=p71Plain(a),pb=p71Plain(b);return {stem:pb.slice(0,k),endB:pb.slice(k),endA:pa.slice(k)};}
var _p72Explain=p71Explain;
p71Explain=function(x,w){
  if(!p72Ru())return _p72Explain(x,w);
  var c=x.c,fm=c.forms,surf=p71Plain(c.f.surface),dict=p71Plain(w.accent||w.word),changed=p71N(surf)!==p71N(w.word);
  var lab=(fm&&fm.lab[fm.key])||(changed?p72FormName(w,surf):"");
  var num=w.pos==="noun"||w.pos==="adjective"?p72Num(c.f):null;
  if(num&&w.pos==="noun"&&lab&&lab.indexOf("・")>0){var want=num.k==="few"?/^生格$/:num.k==="many"?/生格複数/:null;if(want){var kp=lab.split("・").filter(function(q){return want.test(q);});if(kp.length)lab=kp.join("・");}}
  var h='<div class="p71-exp"><div class="p71-exph">解説</div>';
  h+='<p class="p72-ans"><b>'+esc(w.accent||w.word)+'</b>　'+esc(w.meaning||"")+'</p>';
  /* 1. 形の変化 */
  if(changed){var d=p72Diff(dict,surf);
    h+='<div class="p72-sec"><div class="p72-sh">① 形の変化</div><p class="p71-chg"><span>辞書の形</span><b>'+esc(d.stem)+'<em>'+esc(d.endA)+'</em></b><i>→</i><span>この文では</span><b>'+esc(d.stem)+'<em>'+esc(d.endB||"")+'</em></b></p>';
    h+='<p>'+(d.endA&&d.endB?'語尾の <b>-'+esc(d.endA)+'</b> が <b>-'+esc(d.endB)+'</b> に変わりました。':d.endB?'語尾に <b>-'+esc(d.endB)+'</b> がつきました。':d.endA?'語尾の <b>-'+esc(d.endA)+'</b> がとれました。':'')+(lab?'この形は <b>'+esc(lab)+'</b> です。':'')+'</p></div>';}
  else if(lab)h+='<div class="p72-sec"><div class="p72-sh">① 形</div><p>辞書の形のまま使っています。この形は <b>'+esc(lab)+'</b> です。</p></div>';
  /* 2. なぜこの形？ */
  var why=[];
  if(num&&w.pos==="noun")why.push('すぐ前に数 <b>'+esc(num.w)+'</b> があります。'+P72_NUMTXT[num.k]+(num.k==="many"&&/двести|триста|сто|тысяч/.test(p71N(num.w))?'（'+esc(num.w)+' も「5以上」の仲間です）':''));
  p71Ctx(c.f).forEach(function(t){why.push(esc(t));});
  if(w.pos==="verb"&&lab){var sj=p71Subj(c.f);
    if(/過去/.test(lab))why.push((sj?'主語は '+esc(P71_SUBJ[sj])+'。':'')+'過去形は主語の性・数で語尾（-л／-ла／-ло／-ли）が決まります。');
    else if(/不定形/.test(lab))why.push('前の動詞や на́до・мо́жно などのあとなので、形を変えずに不定形（辞書の形）を使います。');
    else if(sj)why.push('主語は '+esc(P71_SUBJ[sj])+'。現在形の語尾は主語に合わせて決まります（'+esc(lab)+'）。');
    else why.push('動詞の語尾は主語に合わせて決まります。この文は「'+esc(lab.replace(/ の形$/,""))+'」が主語の形です。');}
  if(w.pos==="adjective"&&lab){var nx=null;for(var j=c.f.z+1;j<c.f.toks.length;j++){if(/[^\s,.!?;:—«»"“”()]/.test(c.f.toks[j])){nx=p71Plain(c.f.toks[j]);break;}if(/[.!?]/.test(c.f.toks[j]))break;}
    why.push('形容詞は、説明する名詞'+(nx?'（ここでは <b>'+esc(nx)+'</b>）':'')+'に「性・数・格」をそろえます。'+(nx?'':'「〜は…だ」の文でも、主語の名詞に合わせます。'));}
  var ck=lab?p72CaseOf(lab):null;
  if(w.pos==="noun"&&ck&&!why.length){
    if(ck==="nom")why.push('この言葉が文の主語（〜が・〜は）なので、辞書の形（主格）です。');
    else if(ck==="acc")why.push('動詞が直接はたらきかける「〜を」に当たるので、対格になります。');
    else if(ck==="dat")why.push('「〜に」と相手を表すので、与格になります。');
    else if(ck==="gen")why.push('「〜の」や量を表すので、生格になります。');
    else if(ck==="ins")why.push('「〜で・〜として」を表すので、造格になります。');}
  if(c.why&&!/形を大きく変えずに|そのまま使う/.test(c.why))why.push(esc(c.why));
  if(why.length||ck||lab){h+='<div class="p72-sec"><div class="p72-sh">② なぜこの形？</div>'+why.map(function(t){return '<p class="p71-hint">'+t+'</p>';}).join("");
    var ek=w.pos==="verb"?(/過去/.test(lab)?"past":/不定形/.test(lab)?"inf":lab?"pres":null):w.pos==="adjective"&&lab?"adj":ck;
    if(ek&&P72_EASY[ek])h+='<p class="p72-easy"><span>ことばの説明</span>'+esc(P72_EASY[ek])+'</p>';
    h+='</div>';}
  /* 3. 語尾の作り方 */
  if(w.pos==="noun"&&ck&&P72_END[ck]){var g=p72Gender(w),pl=/複数/.test(lab)?"p":"s",E=P72_END[ck][pl];
    h+='<div class="p72-sec"><div class="p72-sh">③ '+esc(lab.split("・")[0])+'の作り方</div>'+(g?'<p><b>'+esc(dict)+'</b> は'+P72_GNAME[g]+'です。</p>':'')+
      '<div class="p72-end">'+["m","f","n"].map(function(k){return '<div class="'+(k===g?"on":"")+'"><b>'+P72_GNAME[k].replace("名詞","")+'</b><span>'+esc(E[k])+'</span></div>';}).join("")+'</div></div>';}
  if(w.pos==="verb"&&lab&&/の形/.test(lab)&&!/過去/.test(lab)){
    var vb=p71Plain(w.word).toLowerCase(),vi=p71Verb(vb,surf);if(vi&&vi.pm&&Object.keys(vi.pm).length>=5){
      h+='<div class="p72-sec"><div class="p72-sh">③ '+esc(dict)+' の現在形</div><div class="p72-end">'+Object.keys(vi.pm).map(function(k){return '<div class="'+(p71N(k)===p71N(surf)?"on":"")+'"><b>'+esc(vi.pm[k].replace(/ の形$/,""))+'</b><span>'+esc(k)+'</span></div>';}).join("")+'</div><p class="p72-mut">※ 規則どおりの場合の形です。不規則な動詞もあります。</p></div>';}}
  /* 4. この単語のメモ */
  var memo=[];if(x.ge)memo.push(x.ge);if(changed&&w.changeRule&&!/この形のまま/.test(w.changeRule))memo.push(w.changeRule);if(w.detailExp&&w.detailExp!==c.why)memo.push(w.detailExp);
  memo=memo.filter(function(t,i,a){return a.indexOf(t)===i;});
  if(memo.length)h+='<div class="p72-sec"><div class="p72-sh">この単語・この文のメモ</div>'+memo.map(function(t){return '<p class="p71-det">'+esc(t)+'</p>';}).join("")+'</div>';
  /* 5. 選択肢の見分け方 */
  if(fm&&Object.keys(fm.lab).length){var rows=fm.opts.filter(function(o){return fm.lab[p71N(o)];});
    if(rows.length>1)h+='<div class="p71-tbl"><div class="p71-tblh">選択肢の見分け方</div>'+rows.map(function(o){var k=p71N(o);return '<div class="'+(k===fm.key?"on":"")+'"><b>'+esc(o)+'</b><span>'+esc(k===fm.key?lab||fm.lab[k]:fm.lab[k])+'</span></div>';}).join("")+'</div>';}
  /* 6. 文の言葉 */
  h+=p72Gloss(c,w,lab);
  /* 7. どこで習う？ */
  h+=p72WhereHtml(p72Topics(w,lab,c.f),1);
  return h+'</div>';
};
function p72Gloss(c,w,lab){
  var f=c.f,rows=[];
  for(var i=0;i<f.toks.length;i++){var t=f.toks[i];if(!/[А-Яа-яЁёҢңӨөҮү]/.test(t))continue;
    if(i===f.a){rows.push({ru:p71Plain(f.toks.slice(f.a,f.z+1).join("")),m:w.meaning,f:lab,hit:1});i=f.z;continue;}
    var r=p72Look(t);rows.push({ru:p71Plain(t),m:r?r.mean:"",f:r?r.form:"",b:r&&r.base&&p71N(r.base)!==p71N(t)?p71Plain(r.base):""});}
  if(rows.length<2)return "";
  return '<div class="p72-gl"><div class="p71-tblh">文の中の言葉（押すと詳しく）</div>'+rows.map(function(r){return '<div class="'+(r.hit?"on":"")+'"><b class="p71-gl-ru">'+esc(r.ru)+'</b><span>'+esc(r.m||"―")+(r.b?'<small>（辞書の形 '+esc(r.b)+(r.f?'・'+esc(r.f):'')+'）</small>':r.f?'<small>（'+esc(r.f)+'）</small>':'')+'</span></div>';}).join("")+'</div>';
}

/* ---------- 文法解説書 ---------- */
var P72G=null;
function p72GuideOpen(id){P72G={id:id||null};p72GuideRender();}
function p72GuideClose(){P72G=null;p72GuideRender();}
function p72GuideRender(){
  var m=document.getElementById("p72g");if(!m){m=document.createElement("div");m.id="p72g";document.body.appendChild(m);}
  if(!P72G){m.className="";m.innerHTML="";var pg=document.getElementById("p70page");if(!P71&&!(pg&&/show/.test(pg.className)))document.body.classList.remove("p70-noscroll");return;}
  document.body.classList.add("p70-noscroll");
  var G=window.P72_GUIDE||[],idx=-1;G.forEach(function(g,i){if(g.id===P72G.id)idx=i;});
  var h='<div class="p71-wrap"><div class="p72-gtop">'+(idx>=0?'<button type="button" class="p71-x" data-act="p72gtoc" aria-label="目次へ">‹</button>':'<span style="width:44px"></span>')+'<b>'+(idx>=0?esc(G[idx].t):'文法解説書')+'</b><button type="button" class="p71-x" data-act="p72gx" aria-label="閉じる">✕</button></div><div class="p71-scroll"><div class="p71-body p72-gbody">';
  if(idx<0){h+='<p class="p72-glead">このアプリのために書いた、はじめての人向けの文法ガイドです。上から順に読むのがおすすめです。</p><div class="p72-how"><b>使い方</b><span>ロシア語の<u>単語を押す</u>と、意味・性（男性／女性／中性）・なぜその形かが出ます。例文は<u>カードを押す</u>と読み上げます。<em>赤い文字</em>は語尾が変わったところ、<b class="p72-mk">黄色の線</b>は大事なところです。</span></div><div class="p72-toc">'+
      G.map(function(g,i){return '<button type="button" data-act="p72guide" data-val="'+g.id+'">'+p72TocIcon(g.id,i)+'<span><b>'+esc(g.t)+'</b><small>'+esc(g.s)+'</small></span><em>›</em></button>';}).join("")+'</div>';}
  else{var g=G[idx];h+='<p class="p72-gsub">'+esc(g.s)+'</p>'+p72Banner(g.id)+p72Goal(g.id)+'<div class="p72-art">'+g.b+'</div>';
    var t=g.id;if(P72_TOPIC_NAME[t]&&!/^(aspect|motion|imper)$/.test(t)){var wh=p72Where(t),u=p72UnitNames(t);
      h+='<div class="p72-where"><div class="p71-tblh">このアプリで練習できる場所</div>';
      if(wh.total)h+='<p>道のり（次の一歩）の '+wh.total+' レッスンに出てきます。いま '+wh.done+' レッスン通過。'+(wh.next?'次は '+p72LName(wh.next)+'。':'')+'</p>'+(wh.next&&!P71?'<button type="button" class="p72-glink" data-act="p72gol" data-val="'+wh.next.ti+'|'+wh.next.li+'">そのレッスンを始める ›</button>':'');
      if(u.length)h+='<p>その他の練習 › 文法別練習 の「'+u.map(esc).join("」「")+'」でまとめて練習できます。</p>'+(!P71?'<button type="button" class="p72-glink" data-act="p72gram">文法別練習を開く ›</button>':'');
      h+='</div>';}
    else{var u2=p72UnitNames(t);if(u2.length)h+='<div class="p72-where"><div class="p71-tblh">このアプリで練習できる場所</div><p>その他の練習 › 文法別練習 の「'+u2.map(esc).join("」「")+'」</p>'+(!P71?'<button type="button" class="p72-glink" data-act="p72gram">文法別練習を開く ›</button>':'')+'</div>';}
    h+='<div class="p72-gnav">'+(idx>0?'<button type="button" data-act="p72guide" data-val="'+G[idx-1].id+'">‹ '+esc(G[idx-1].t)+'</button>':'<span></span>')+(idx<G.length-1?'<button type="button" data-act="p72guide" data-val="'+G[idx+1].id+'">'+esc(G[idx+1].t)+' ›</button>':'<span></span>')+'</div>';
    h+='<p class="p72-mut p72-gnote">この解説書の文章と例文は、このアプリのために書いたオリジナルです。</p>';}
  h+='</div></div></div>';
  p72Theme();m.innerHTML=h;m.className="show";var sc=m.querySelector(".p71-scroll");if(sc)sc.scrollTop=0;
  p72GuidePost(m);
}

/* ---------- 解説書の絵・例文カード・色づけ ---------- */
var P72_BAN={basics:[["студент","Я студе́нт."],["дом","Э́то мой дом."]],gender:[["стол","стол","m"],["мама","ма́ма","f"],["окно","окно́","n"]],cases:"cases",
  nom:[["мама","Ма́ма до́ма."],["книга","Э́то кни́га."]],gen:[["машина","маши́на бра́та"],["чай","ча́шка ча́я"]],dat:[["врач","к врачу́"],["мама","звоню́ ма́ме"]],
  acc:[["книга","чита́ю кни́гу"],["школа","иду́ в шко́лу"]],ins:[["молоко","чай с молоко́м"],["ручка","пишу́ ру́чкой"]],pre:[["школа","в шко́ле"],["работа","на рабо́те"]],
  num:"num",adj:[["дом","но́вый дом"],["машина","но́вая маши́на"]],pres:[["читать","я чита́ю"],["говорить","я говорю́"]],past:[["читать","он чита́л"],["писать","она́ писа́ла"]],
  aspect:[["читать","чита́ть"],["прочитать","прочита́ть"]],imper:[["повторить","Повтори́те!"],["показать","Покажи́те!"]],motion:[["идти","идти́（歩いて）"],["ехать","е́хать（乗り物で）"]],prep:"prep",plural:[["книга","кни́ги"],["окно","о́кна"]]};
var P72_BYW=null;
function p72WId(word){if(!P72_BYW){P72_BYW={};VOCAB.forEach(function(w){var n=p71N(w.word);if(!P72_BYW[n])P72_BYW[n]=w.id;});}return P72_BYW[p71N(word)]||null;}
function p72HasPic(id){try{return !!(id&&p59Pic(id));}catch(_){return false;}}
var P72_SVG={
  num:function(){function coin(x,y){return '<g transform="translate('+x+' '+y+')"><circle r="13" fill="#E9B949" stroke="#B9862A" stroke-width="2"/><circle r="8.5" fill="none" stroke="#B9862A" stroke-width="1.4"/><text y="4.5" text-anchor="middle" font-size="11" font-weight="800" fill="#8A5F14">с</text></g>';}
    var g=[[1,"оди́н сом","",60],[2,"два со́м","а",170],[5,"пять со́м","ов",280]],h='<svg viewBox="0 0 340 120" class="p72-svg">';
    g.forEach(function(q){for(var i=0;i<q[0];i++)h+=coin(q[3]-(q[0]-1)*9+i*18,40-(i%2)*8);h+='<text x="'+q[3]+'" y="88" text-anchor="middle" font-size="14" font-weight="700" fill="currentColor">'+q[1]+'<tspan fill="#E0503F">'+q[2]+'</tspan></text><text x="'+q[3]+'" y="108" text-anchor="middle" font-size="11" fill="currentColor" opacity=".65">'+(q[0]===1?"1：主格":q[0]===2?"2〜4：単数の生格":"5〜：複数の生格")+'</text>';});
    return h+'</svg>';},
  cases:function(){var c=[["主格","が・は","#3B82C4"],["生格","の・ない","#2E9C8F"],["与格","に","#C98A12"],["対格","を・へ","#E0503F"],["造格","で・と","#8A63C9"],["前置格","で・について","#5B8C3A"]],h='<svg viewBox="0 0 340 118" class="p72-svg">';
    c.forEach(function(q,i){var x=8+(i%3)*111,y=8+Math.floor(i/3)*56;h+='<rect x="'+x+'" y="'+y+'" width="103" height="48" rx="10" fill="'+q[2]+'" opacity=".16"/><rect x="'+x+'" y="'+y+'" width="6" height="48" rx="3" fill="'+q[2]+'"/><text x="'+(x+16)+'" y="'+(y+21)+'" font-size="14" font-weight="800" fill="'+q[2]+'">'+q[0]+'</text><text x="'+(x+16)+'" y="'+(y+39)+'" font-size="12" fill="currentColor">「'+q[1]+'」</text>';});
    return h+'</svg>';},
  prep:function(){var P=[["в","中に",0],["на","上に",1],["под","下に",2],["над","上の方に",3],["пе́ред","前に",4],["за","後ろに",5]],h='<svg viewBox="0 0 340 204" class="p72-svg">';
    P.forEach(function(q,i){var x=10+(i%3)*110,y=6+Math.floor(i/3)*102,bx=x+28,by=y+24;
      var pos=[[bx+18,by+26],[bx+24,by-2],[bx+24,by+48],[bx+24,by-16],[bx+10,by+40],[bx+44,by+6]][q[2]];
      var box='<path d="M'+bx+' '+(by+10)+'l12-8h36l-12 8z" fill="#C9A26B"/><rect x="'+bx+'" y="'+(by+10)+'" width="36" height="30" fill="#B7864A"'+(q[2]===0?' opacity=".5"':'')+'/><path d="M'+(bx+36)+' '+(by+10)+'l12-8v30l-12 8z" fill="#9A6E39"/>';
      var ball='<circle cx="'+pos[0]+'" cy="'+pos[1]+'" r="7" fill="#E0503F" stroke="#fff" stroke-width="1.5"/>';
      h+=(q[2]===5?ball+box:box+ball)+'<text x="'+(x+50)+'" y="'+(y+90)+'" text-anchor="middle" font-size="12.5" fill="currentColor"><tspan font-weight="800">'+q[0]+'</tspan> '+q[1]+'</text>';});
    return h+'</svg>';}
};
var P72_GOAL={basics:["Я студе́нт.","「私は学生です」なのに「です」に当たる言葉がない理由がわかります。"],gender:["мой па́па／моя́ ма́ма","同じ「私の」が мой と моя́ に分かれる理由がわかります。"],
  cases:["ма́ма → ма́му・ма́ме・ма́мой","同じ「母」なのに語尾が変わる理由がわかります。"],nom:["Ма́ма до́ма.","主語は辞書の形のまま使えばいいことがわかります。"],
  gen:["У меня́ нет вре́мени.","вре́мя（時間）が вре́мени になる理由がわかります。"],dat:["Я звоню́ ма́ме.","「母に」が ма́ме になる理由がわかります。"],
  acc:["Я чита́ю кни́гу.","кни́га（本）が кни́гу になる理由がわかります。"],ins:["чай с молоко́м","молоко́（牛乳）が молоко́м になる理由がわかります。"],
  pre:["Я живу́ в Москве́.","Москва́ が Москве́ になる理由がわかります。"],num:["два со́ма／пять со́мов","数によって сом の形が変わる理由がわかります。"],
  adj:["но́вый дом／но́вая маши́на","「新しい」の語尾が変わる理由がわかります。"],pres:["я чита́ю／ты чита́ешь","主語によって動詞の語尾が変わるしくみがわかります。"],
  past:["он чита́л／она́ чита́ла","過去形の -л と -ла の使い分けがわかります。"],aspect:["чита́ть／прочита́ть","「読む」に2つの言葉がある理由がわかります。"],
  imper:["Повтори́те, пожа́луйста.","「〜してください」の作り方がわかります。"],motion:["я иду́／я е́ду","「行く」が2つある理由がわかります。"],
  prep:["в шко́ле／в шко́лу","同じ в でも、あとの語尾が変わる理由がわかります。"],plural:["кни́га → кни́ги","複数形の作り方がわかります。"]};
function p72Goal(id){var q=P72_GOAL[id];if(!q)return "";return '<div class="p72-goal" data-act="p72say" data-val="'+esc(p71Plain(q[0]).replace(/→|／/g,","))+'"><div><small>この章を読むと</small><b class="p72-gru">'+esc(q[0])+'</b><span>'+esc(q[1])+'</span></div>'+p71Spk(p71Plain(q[0]).replace(/→|／/g,","),"p72-exspk")+'</div>';}
function p72Banner(id){
  var b=P72_BAN[id];if(!b)return "";
  if(typeof b==="string")return '<div class="p72-ban p72-bsvg">'+P72_SVG[b]()+'</div>';
  var items=b.map(function(q){var wid=p72WId(q[0]);return p72HasPic(wid)?'<div class="p72-bi'+(q[2]?' p72-gb'+q[2]:'')+'">'+p71Pic(wid)+'<span class="p72-cap">'+esc(q[1])+'</span>'+(q[2]?'<small class="p72-g'+q[2]+'">'+P72_GNAME[q[2]].replace("名詞","")+'</small>':'')+'</div>':'';}).join("");
  return items?'<div class="p72-ban">'+items+'</div>':'';
}
/* 目次のアイコン（オリジナル。章の内容を図で表す） */
var P72_ICON=(function(){
  var C={nom:"#3B82C4",gen:"#2E9C8F",dat:"#C98A12",acc:"#E0503F",ins:"#8A63C9",pre:"#5B8C3A"};
  function tile(col,inner){return '<svg viewBox="0 0 44 44" aria-hidden="true"><rect x="1" y="1" width="42" height="42" rx="11" fill="'+col+'" opacity=".15"/>'+inner+'</svg>';}
  function T(x,y,s,txt,col,w){return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="'+s+'" font-weight="'+(w||800)+'" fill="'+col+'" font-family="system-ui,sans-serif">'+txt+'</text>';}
  /* 格：格の色の丸に、日本語の助詞 */
  function cas(k,p){return tile(C[k],'<circle cx="22" cy="22" r="14" fill="'+C[k]+'"/>'+T(22,28.5,18,p,"#fff"));}
  return {
    basics:function(){var c="#3B82C4";return tile(c,'<path d="M8 9h28a3 3 0 0 1 3 3v15a3 3 0 0 1-3 3H20l-7 6v-6H8a3 3 0 0 1-3-3V12a3 3 0 0 1 3-3z" fill="'+c+'"/>'+T(22,24.5,11,"Я…","#fff"));},
    gender:function(){return tile("#7A7F8C",'<circle cx="14" cy="15" r="8" fill="#3B82C4"/><circle cx="30" cy="15" r="8" fill="#E0503F"/><circle cx="22" cy="29" r="8" fill="#2E9C8F"/>'+T(14,19,10,"男","#fff")+T(30,19,10,"女","#fff")+T(22,33,10,"中","#fff"));},
    cases:function(){var cs=[C.nom,C.gen,C.dat,C.acc,C.ins,C.pre],h="";for(var i=0;i<6;i++){var a1=(i/6)*Math.PI*2-Math.PI/2,a2=((i+1)/6)*Math.PI*2-Math.PI/2,R=16,r=7;
        h+='<path d="M'+(22+Math.cos(a1)*R).toFixed(1)+' '+(22+Math.sin(a1)*R).toFixed(1)+'A'+R+' '+R+' 0 0 1 '+(22+Math.cos(a2)*R).toFixed(1)+' '+(22+Math.sin(a2)*R).toFixed(1)+'L'+(22+Math.cos(a2)*r).toFixed(1)+' '+(22+Math.sin(a2)*r).toFixed(1)+'A'+r+' '+r+' 0 0 0 '+(22+Math.cos(a1)*r).toFixed(1)+' '+(22+Math.sin(a1)*r).toFixed(1)+'z" fill="'+cs[i]+'" stroke="#fff" stroke-width="1.2"/>';}
      return tile("#7A7F8C",h+T(22,26,11,"6","#7A7F8C"));},
    nom:function(){return cas("nom","が");},
    gen:function(){return cas("gen","の");},
    dat:function(){return cas("dat","に");},
    acc:function(){return cas("acc","を");},
    ins:function(){return cas("ins","と");},
    pre:function(){var c=C.pre;return tile(c,'<path d="M22 6c-6.5 0-11 4.7-11 10.8C11 25 22 37 22 37s11-12 11-20.2C33 10.7 28.5 6 22 6z" fill="'+c+'"/>'+T(22,21.5,12,"で","#fff"));},
    num:function(){var c="#C98A12";function coin(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="5.5" fill="#E9B949" stroke="#B9862A" stroke-width="1.4"/>';}
      return tile(c,coin(9,30)+coin(20,30)+coin(20,22)+coin(33,30)+coin(33,22)+coin(33,14)+coin(28,8)+coin(38,8)+T(9,20,10,"1",c)+T(14,13,10,"2",c));},
    adj:function(){var c="#D2557A";return tile(c,'<rect x="5" y="9" width="34" height="11" rx="5.5" fill="'+c+'"/><rect x="5" y="24" width="34" height="11" rx="5.5" fill="none" stroke="'+c+'" stroke-width="1.8"/>'+T(22,17.6,9,"но́вая","#fff")+T(22,32.6,9,"кни́га",c));},
    pres:function(){var c="#1F9D6B";return tile(c,'<circle cx="13" cy="14" r="5.5" fill="'+c+'"/><path d="M4.5 33q0-11 8.5-11t8.5 11z" fill="'+c+'"/><rect x="22" y="15" width="18" height="13" rx="6.5" fill="#fff" stroke="'+c+'" stroke-width="1.8"/>'+T(31,25,9.5,"-ю",c));},
    past:function(){var c="#6B7A99";return tile(c,'<circle cx="23" cy="23" r="13" fill="#fff" stroke="'+c+'" stroke-width="2.2"/><path d="M23 15v8l-5 3.5" fill="none" stroke="'+c+'" stroke-width="2.4" stroke-linecap="round"/><path d="M7.5 18A16 16 0 0 1 13 9.5" fill="none" stroke="#E0503F" stroke-width="2.4" stroke-linecap="round"/><path d="M5.5 14.5l2 4.5 4.3-2.3" fill="none" stroke="#E0503F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>');},
    aspect:function(){var c="#8A63C9";return tile(c,'<path d="M6 14h5M14 14h5M22 14h5M30 14h5" stroke="'+c+'" stroke-width="3.4" stroke-linecap="round"/><path d="M36.5 10.5l2.5 3.5-2.5 3.5" fill="none" stroke="'+c+'" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M6 30h22" stroke="'+c+'" stroke-width="3.4" stroke-linecap="round"/><circle cx="34" cy="30" r="6.5" fill="'+c+'"/><path d="M30.8 30l2.2 2.2 4.2-4.4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>');},
    imper:function(){var c="#E0503F";return tile(c,'<path d="M8 8h28a3 3 0 0 1 3 3v16a3 3 0 0 1-3 3H25l-8 7v-7H8a3 3 0 0 1-3-3V11a3 3 0 0 1 3-3z" fill="'+c+'"/><rect x="20" y="12" width="4" height="10" rx="2" fill="#fff"/><circle cx="22" cy="26" r="2.2" fill="#fff"/>');},
    motion:function(){var c="#2F7FD8";return tile(c,'<circle cx="11" cy="9" r="3.4" fill="'+c+'"/><path d="M11 13.5l-1.2 8 3.5 4.5v7M9.8 21.5l-3.6 4.8M11 16l4.5 3.5" fill="none" stroke="'+c+'" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><rect x="20" y="15" width="20" height="14" rx="3.5" fill="'+c+'"/><rect x="22.5" y="17.5" width="6" height="5" rx="1.2" fill="#fff"/><rect x="31.5" y="17.5" width="6" height="5" rx="1.2" fill="#fff"/><circle cx="24.5" cy="31" r="3" fill="#444"/><circle cx="35.5" cy="31" r="3" fill="#444"/>');},
    prep:function(){return tile("#B7864A",'<path d="M9 21l9-6h19l-9 6z" fill="#D4AE78"/><rect x="9" y="21" width="19" height="16" fill="#B7864A"/><path d="M28 21l9-6v16l-9 6z" fill="#9A6E39"/><circle cx="21" cy="11" r="5" fill="#E0503F" stroke="#fff" stroke-width="1.2"/>');},
    plural:function(){var c="#4A9BB0";return tile(c,'<rect x="18" y="6" width="17" height="23" rx="2.5" fill="#fff" stroke="'+c+'" stroke-width="1.6"/><rect x="13" y="10" width="17" height="23" rx="2.5" fill="#fff" stroke="'+c+'" stroke-width="1.6"/><rect x="8" y="14" width="17" height="23" rx="2.5" fill="'+c+'"/>'+T(16.5,29,10,"×3","#fff"));}
  };
})();
function p72TocIcon(id,i){var f=P72_ICON[id];return f?'<i class="p72-ic">'+f()+'</i>':'<i>'+(i+1)+'</i>';}
/* 語尾の色づけ：辞書の形と比べて、変わったところを赤に */
function p72Mark(span,base){var t=span.textContent;if(!base||p71N(base)===p71N(t))return;var d=p72Diff(base,t);if(!d.endB||d.stem.length<1)return;span.innerHTML=esc(d.stem)+'<em>'+esc(d.endB)+'</em>';}
function p72Short(tok){
  var r=p72Look(tok);if(!r)return null;var w=r.id&&WMAP[r.id],gi=(w&&w.pos==="noun")||r.g?p72GenderInfo(w,r.g):null,tags=[];
  if(gi&&gi.g)tags.push('<i class="p72-g'+gi.g+'">'+P72_GNAME[gi.g].replace("名詞","")+'</i>');
  if(r.form)tags.push(esc(r.form));else if(w&&w.pos==="verb")tags.push("動詞");
  return {m:r.mean||"",t:tags.join(" "),base:r.base};
}
function p72GuidePost(m){
  /* 例文カード：絵・読み上げ・単語ごとの説明 */
  m.querySelectorAll(".p72-art .p72-ex li").forEach(function(li){
    var bEl=li.querySelector("b"),sp=li.querySelector("span");if(!bEl)return;var ru=bEl.textContent,ja=sp?sp.textContent:"";
    var toks=ru.split(/[\s,.!?;:—«»"“”()]+/).filter(function(t){return /[А-Яа-яЁё]/.test(t);}),pic="",rows="";
    toks.forEach(function(t){var r=p72Look(t);if(!pic&&r&&r.id&&WMAP[r.id].pos==="noun"&&p72HasPic(r.id))pic=r.id;});
    if(toks.length>1)rows=toks.map(function(t){var q=p72Short(t);return '<div><b class="p72-bw">'+esc(p71Plain(t))+'</b><span>'+(q?esc(q.m):"")+(q&&q.t?' <small>'+q.t+'</small>':'')+'</span></div>';}).join("");
    li.setAttribute("data-act","p72say");li.setAttribute("data-val",p71Plain(ru));
    li.innerHTML=(pic?p71Pic(pic,"p72-exp"):'')+'<div class="p72-exb"><div class="p72-exru"><b>'+esc(ru)+'</b>'+p71Spk(ru,"p72-exspk")+'</div><span>'+esc(ja)+'</span>'+(rows?'<div class="p72-bd">'+rows+'</div>':'')+'</div>';
    if(pic)li.classList.add("pic");});
  p71FillPics(m);
  p72Wrap(m);
  /* 赤い語尾：例文・バナー・単語ごとの説明 */
  m.querySelectorAll(".p72-exru .p72-w,.p72-cap .p72-w,.p72-bw .p72-w,.p72-gru .p72-w").forEach(function(sp){var r=p72Look(sp.getAttribute("data-val"));if(r&&r.base)p72Mark(sp,r.base);});
  /* 「A → B」の B の語尾を赤に */
  m.querySelectorAll(".p72-art .p72-w,.p72-gru .p72-w").forEach(function(sp){var pv=sp.previousSibling;if(pv&&pv.nodeType===3&&/^\s*→\s*$/.test(pv.nodeValue)){var a=pv.previousSibling;if(a&&a.classList&&a.classList.contains("p72-w"))p72Mark(sp,a.getAttribute("data-val"));}});
  /* 変化表：同じ列の1行目と比べて赤に */
  m.querySelectorAll(".p72-art table.p72-t").forEach(function(tb){var R=tb.rows;if(R.length<3)return;
    for(var j=1;j<R[1].cells.length;j++){var c0=R[1].cells[j],w0=c0&&c0.querySelectorAll(".p72-w");if(!w0||w0.length!==1)continue;var base=w0[0].getAttribute("data-val");
      for(var i=2;i<R.length;i++){var c=R[i].cells[j],ws=c&&c.querySelectorAll(".p72-w");if(!ws||!ws.length)continue;var last=ws[ws.length-1];if(ws.length<=2&&!/→/.test(c.textContent))p72Mark(last,base);}}});
}
/* ---------- お気に入りの問題 ---------- */
function p72FavKey(x){if(!x)return null;return x.id+"|"+(x.c&&x.c.cid?x.c.cid:x.c?"ex":"pick");}
function p72FavToggle(){
  var S=P71,x=S&&S.steps[S.pos];if(!x||!x.id)return;var st=p72St(),k=p72FavKey(x);
  if(st.fav[k]){delete st.fav[k];toast("お気に入りから外しました");}
  else{st.fav[k]={id:x.id,cid:x.c&&x.c.cid||"",t:todayKey(),unit:x.unit||"",g:x.g||"",ge:x.ge||""};toast("お気に入りに入れました。ホームの「お気に入り」から練習できます");}
  try{saveAll();}catch(_){}p71Render();
}
function p72FavList(){var st=p72St();return Object.keys(st.fav).filter(function(k){return WMAP[st.fav[k].id];});}
function p72FavCount(){var n=p72FavList().length,seen={};p72FavList().forEach(function(k){seen[p72St().fav[k].id]=1;});try{p47BookmarkIds().forEach(function(id){if(!seen[id])n++;});}catch(_){}return n;}
function p72PoolFor(id){var tp=P47_THEMES.filter(function(t){return t.ids.indexOf(id)>=0;})[0];return tp?tp.ids:VOCAB.filter(function(v){return v.level===WMAP[id].level;}).map(function(v){return v.id;});}
function p72FavStep(fv){
  var id=fv.id,w=WMAP[id],pool=p72PoolFor(id),opts=shuffle([id].concat(p71Distract(id,pool,3)));
  if(fv.cid){var c=(window.COMPOSE||[]).filter(function(q){return q.id===fv.cid;})[0];
    if(c){var t=(c.breakdown||[]).filter(function(b){return p71N(b.base)===p71N(w.word);})[0];
      var cc=p71Cloze(id,{ru:c.accent||c.ru,ja:c.ja,why:t?(t.why||t.note||""):"",cid:c.id});
      if(cc&&cc.forms)return {t:"form",id:id,c:cc,unit:c.unit,g:c.gDetail||"",ge:c.gEasy||""};
      if(cc)return {t:"cloze",id:id,c:cc,opts:opts};}}
  var c2=p71Cloze(id);if(c2)return {t:"cloze",id:id,c:c2,opts:opts};
  return {t:"pick",id:id,opts:opts};
}
function p72FavStart(){
  var st=p72St(),keys=shuffle(p72FavList()),steps=[],ids=[],used={};
  keys.forEach(function(k){if(steps.length>=12)return;var s=p72FavStep(st.fav[k]);if(s){steps.push(s);if(ids.indexOf(s.id)<0)ids.push(s.id);used[s.id]=1;}});
  var bm=[];try{bm=shuffle(p47BookmarkIds());}catch(_){}
  bm.forEach(function(id){if(steps.length>=15||used[id])return;used[id]=1;var s=p72FavStep({id:id});steps.push(s);ids.push(id);});
  if(!steps.length){toast("お気に入りがまだありません。問題の右上の ☆ や、単語を押して出る ☆ から入れられます");return;}
  try{p70ClosePage();}catch(_){}p72GuideClose();
  P71={fav:1,ti:-1,li:0,n:1,ids:ids,steps:steps,pos:0,stage:0,picked:null,picked2:null,mist:{},retried:{},ok:0,ng:0,rv:[],before:p47DoneToday(),confirm:false};
  p71Render();
}
var _p72Head=p71Head;
p71Head=function(){var S=P71;if(!S.fav)return _p72Head();var tot=S.steps.length,p=Math.min(S.pos,tot);
  return '<div class="p71-top"><button type="button" class="p71-x" data-act="p71quit" aria-label="やめる">✕</button><div class="p71-meta"><small>お気に入りの練習</small><div class="p71-bar"><i style="width:'+Math.round(p/tot*100)+'%"></i></div></div><span class="p71-count">'+p+'<small>/'+tot+'</small></span></div>';};
var _p72Result=p71Result;
p71Result=function(){var S=P71;
  if(!S.fav){var h=_p72Result(),n=p72FavCount();return n?h.replace(/<\/div>$/,'<button type="button" class="p72-glink p72-favgo" data-act="p72fav">☆ お気に入りの問題（'+n+'）を練習する ›</button></div>'):h;}
  var tot=S.ok+S.ng,rate=tot?Math.round(S.ok/tot*100):100,weak=S.ids.filter(function(id){return S.mist[id];});
  return '<div class="p71-body"><div class="p71-done"><h3>お気に入りの練習 完了</h3><p>'+S.ids.length+' 語・'+S.steps.length+' 問</p></div><div class="p71-sum"><div><b>'+rate+'<small>%</small></b><span>1回目で正解</span></div><div><b>'+S.ids.length+'</b><span>言葉</span></div><div><b>'+weak.length+'</b><span>まちがえた</span></div></div>'+
    (weak.length?'<div class="p71-note"><div class="p71-tblh">もう一度見ておきたい言葉</div>'+weak.map(function(id){var w=WMAP[id];return '<div class="p71-wrow"><b>'+esc(w.accent||w.word)+'</b><span>'+esc(w.meaning)+'</span></div>';}).join("")+'</div>':'<div class="p71-note"><p>全部正解です。お気に入りは、外すまで何度でも練習できます。</p></div>')+'</div>';};
var _p72Finish=p71Finish;
p71Finish=function(){var S=P71;if(!S.fav)return _p72Finish();if(S.fin)return;S.fin=1;var st=p71St(),t=todayKey();
  S.ids.forEach(function(id){st.seen[id]=t;try{answer(id,S.mist[id]?"no":"ok");}catch(_){}});try{saveAll();}catch(_){}
  if(S.before<p47Target()&&p47DoneToday()>=p47Target())S.cele=1;};

/* ---------- 描画のあとに追加する ---------- */
var _p72Render=p71Render;
p71Render=function(){
  p72PopClose();p72Theme();_p72Render();var m=document.getElementById("p71"),S=P71;if(!m||!S)return;
  var x=S.steps[S.pos];
  if(x&&!S.confirm&&(x.t==="pick"||x.t==="cloze"||x.t==="form")){var tag=m.querySelector(".p71-tag");
    if(tag){var on=!!p72St().fav[p72FavKey(x)],row=document.createElement("div");row.className="p72-tagrow";tag.parentNode.insertBefore(row,tag);row.appendChild(tag);
      var b=document.createElement("button");b.type="button";b.className="p72-fav"+(on?" on":"");b.setAttribute("data-act","p72favq");b.setAttribute("aria-label",on?"お気に入りから外す":"お気に入りに入れる");b.innerHTML=(on?"★":"☆")+'<small>'+(on?"お気に入り":"お気に入り")+'</small>';row.appendChild(b);}}
  if(S.confirm||!x){/* 結果画面に「次の一歩へ」の代わりのボタン */
    if(!x&&S.fav){var mb=m.querySelector('.p71-main[data-act="p71again"]');if(mb){mb.textContent="もう一度";mb.setAttribute("data-act","p72fav");}}}
  m.querySelectorAll(".p71-blank").forEach(function(bl){var n=bl.nextSibling;if(n&&n.nodeType===3){var mt=/^[,.!?;:…»”"]+/.exec(n.nodeValue);if(mt){var g=document.createElement("span");g.style.whiteSpace="nowrap";bl.parentNode.insertBefore(g,bl);g.appendChild(bl);g.appendChild(document.createTextNode(mt[0]));n.nodeValue=n.nodeValue.slice(mt[0].length);}}});
  p72Wrap(m);
  if(x&&x.t==="memo"&&p72Ru()){var note=m.querySelector(".p71-note");if(note){var d=document.createElement("button");d.type="button";d.className="p72-glink";d.setAttribute("data-act","p72guide");d.setAttribute("data-val","cases");d.textContent="文法解説書で「格」をくわしく読む ›";note.appendChild(d);}}
};

/* ---------- ホームのリンク ---------- */
var _p72RoadCard=p70RoadCard;
p70RoadCard=function(){
  var h=_p72RoadCard(),n=p72FavCount();
  return h.replace(/<button type="button" class="p71-maplink" data-act="p70road">道のり（([^<]*)）を見る<\/button>/,function(_,t){
    return '<div class="p72-links"><button type="button" data-act="p70road"><b>道のり</b><small>'+t+'</small></button>'+(p72Ru()?'<button type="button" data-act="p72guide" data-val=""><b>文法解説書</b><small>'+((window.P72_GUIDE||[]).length)+' 章</small></button>':'')+'<button type="button" data-act="p72fav"><b>お気に入り</b><small>'+n+' 問</small></button></div>';});
};

/* ---------- 操作（window で先に受ける） ---------- */
window.addEventListener("click",function(e){
  var pop=document.getElementById("p72pop"),el=e.target&&e.target.closest?e.target.closest("[data-act]"):null,a=el?el.getAttribute("data-act"):"",v=el?el.getAttribute("data-val"):"";
  if(pop&&!(e.target.closest&&e.target.closest("#p72pop"))&&a!=="p72w"){p72PopClose();e.stopImmediatePropagation();e.preventDefault();return;}
  if(!/^p72/.test(a)){if(a==="p71again"&&P71&&P71.fav){e.stopImmediatePropagation();e.preventDefault();p72FavStart();}return;}
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p72w"){if(P72_POPEL===el)p72PopClose();else p72Pop(el);}
  else if(a==="p72popx")p72PopClose();
  else if(a==="p72say"){try{speak(v);}catch(_){}el.classList.add("say");setTimeout(function(){el.classList.remove("say");},700);}
  else if(a==="p72wfav"){var p=P(v);p.favorite=!p.favorite;try{saveAll();}catch(_){}toast(p.favorite?"単語をお気に入りに入れました":"単語をお気に入りから外しました");var cur=P72_POPEL;if(cur){P72_POPEL=null;p72Pop(cur);}}
  else if(a==="p72favq")p72FavToggle();
  else if(a==="p72fav"){var S=P71;P71=null;p72FavStart();if(!P71){p71Render();try{render();}catch(_){}}if(S&&S.cele)setTimeout(function(){try{p53Celebrate();}catch(_){}},300);}
  else if(a==="p72guide")p72GuideOpen(v||null);
  else if(a==="p72gtoc")p72GuideOpen(null);
  else if(a==="p72gx"){p72GuideClose();}
  else if(a==="p72gol"){var q=v.split("|");p72GuideClose();p71Start(+q[0],+q[1]);}
  else if(a==="p72gram"){p72GuideClose();try{p70ClosePage();}catch(_){}var t=document.querySelector('[data-act="tab"][data-val="grammar"]');if(t)t.click();}
},true);
document.addEventListener("keydown",function(e){if(e.key==="Escape"){if(document.getElementById("p72pop"))p72PopClose();else if(P72G)p72GuideClose();}});

/* ---------- 見た目 ---------- */
(function(){try{var st=document.createElement("style");st.textContent=[
':root{--p72u:rgba(46,156,143,.6);--p72mkbg:#FFEC8A;--p72mkfg:#2B2100;--p72red:#D63B27;--p72ptbg:#FFF7D6;--p72ptbd:#EBCB6A;--p72ptlb:#8A5D00;--p72on:rgba(46,156,143,.2)}',
'html.p72-dark{--p72mkbg:rgba(255,214,64,.2);--p72mkfg:#FFE27A;--p72red:#FF8A72;--p72ptbg:rgba(255,214,64,.08);--p72ptbd:rgba(255,214,64,.32);--p72ptlb:#FFD54A;--p72on:rgba(120,220,200,.22)}',
'.p72-w{cursor:pointer;border-radius:3px;text-decoration:none;border-bottom:2px solid var(--p72u);padding-bottom:0;-webkit-tap-highlight-color:transparent}.p72-w.on{background:var(--p72on);border-bottom-color:transparent}',
'#p72pop{position:fixed;z-index:160;background:var(--card);color:var(--ink);border:1px solid var(--line);border-radius:14px;box-shadow:0 10px 30px rgba(0,0,0,.28);padding:10px 12px 12px;font-size:14px;line-height:1.6}',
'.p72-ph{display:flex;align-items:center;gap:6px}.p72-ph b{font-size:19px;flex:1;min-width:0;overflow-wrap:anywhere}.p72-px{width:36px;height:36px;border:none;background:none;color:var(--muted);font-size:15px}',
'.p72-pb{display:flex;gap:8px;align-items:baseline;font-size:13px}.p72-pb span{color:var(--muted)}.p72-pb b{font-size:15px}.p72-pm{font-size:15.5px;font-weight:700;margin:2px 0}.p72-pf{font-size:12.5px;color:var(--accent);font-weight:700}',
'.p72-mut{color:var(--muted);font-size:12px}.p72-pfav{margin-top:8px;width:100%;min-height:40px;border-radius:10px;border:1px solid var(--line);background:none;color:var(--ink);font:inherit;font-size:13px}.p72-pfav.on{color:#C98A12;border-color:#C98A12}',
'.p72-tagrow{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}.p72-tagrow .p71-tag{margin-bottom:0}',
'.p72-fav{flex:none;display:flex;align-items:center;gap:4px;min-height:36px;padding:0 10px;border-radius:18px;border:1px solid var(--line);background:var(--card);color:var(--muted);font:inherit;font-size:16px}.p72-fav small{font-size:11.5px}.p72-fav.on{color:#C98A12;border-color:#C98A12}',
'.p72-sec{margin:10px 0 4px;padding-top:10px;border-top:1px solid var(--line)}.p72-sh{font-size:13px;font-weight:800;margin-bottom:6px}',
'.p71-chg b em,.p72-sec em{font-style:normal;color:#E0503F;font-weight:900}.p72-ans{font-size:15.5px}',
'.p72-easy{background:var(--card2,rgba(127,127,127,.08));border-radius:10px;padding:8px 10px;font-size:13.5px}.p72-easy span{display:block;font-size:11.5px;font-weight:800;color:var(--muted)}',
'.p72-end>div{display:flex;gap:10px;padding:5px 6px;font-size:13px;border-radius:8px}.p72-end b{flex:none;min-width:52px}.p72-end span{color:var(--muted)}.p72-end .on{background:rgba(46,156,143,.14)}.p72-end .on span{color:var(--ink)}',
'.p72-gl{margin-top:10px;border-top:1px solid var(--line);padding-top:8px}.p72-gl>div:not(.p71-tblh){display:flex;gap:10px;padding:4px 0;font-size:13.5px;align-items:baseline}.p72-gl b{flex:none;min-width:92px;font-size:14.5px}.p72-gl span{color:var(--muted)}.p72-gl small{display:block;font-size:11.5px}.p72-gl .on b{color:#2F9E6E}',
'.p72-where{margin-top:12px;border-top:1px solid var(--line);padding-top:8px}.p72-wrow{padding:4px 0 8px}.p72-wrow>b{font-size:14px}.p72-where p{font-size:13px;color:var(--muted);margin:2px 0 4px}',
'.p72-glink{display:block;width:100%;text-align:left;min-height:40px;margin-top:6px;padding:8px 12px;border-radius:10px;border:1px solid var(--accent);background:none;color:var(--accent);font:inherit;font-size:13.5px;font-weight:700}',
'.p72-favgo{margin-top:12px}',
'.p72-links{display:flex;gap:8px;margin:-2px 0 12px}.p72-links button{flex:1;min-width:0;min-height:48px;padding:6px 4px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px}.p72-links b{font-size:13px;color:var(--accent)}.p72-links small{font-size:11px;color:var(--muted)}',
'#p72g{position:fixed;inset:0;z-index:150;background:var(--bg,#000);color:var(--ink);display:none}#p72g.show{display:block}',
'.p72-gtop{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top) + 10px) 16px 10px;border-bottom:1px solid var(--line)}.p72-gtop b{flex:1;min-width:0;text-align:center;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.p72-glead,.p72-gsub{font-size:13.5px;color:var(--muted);line-height:1.7;margin:0 0 12px}',
'.p72-toc button{display:flex;align-items:center;gap:12px;width:100%;padding:12px 4px;border:none;border-bottom:1px solid var(--line);background:none;color:var(--ink);font:inherit;text-align:left}.p72-toc i{flex:none;width:28px;height:28px;border-radius:8px;background:rgba(46,156,143,.15);color:var(--accent);font-style:normal;font-weight:800;font-size:13px;display:flex;align-items:center;justify-content:center}.p72-toc span{flex:1;min-width:0}.p72-toc b{display:block;font-size:15px}.p72-toc small{display:block;font-size:12px;color:var(--muted);margin-top:2px}.p72-toc em{font-style:normal;color:var(--muted)}',
'.p72-art{font-size:15px;line-height:1.8}.p72-art h4{font-size:14px;color:var(--accent);margin:18px 0 6px}.p72-art p,.p72-art ol,.p72-art ul{margin:0 0 10px}.p72-art ol{padding-left:20px}',
'.p72-t{width:100%;border-collapse:collapse;font-size:13px;margin:6px 0 10px}.p72-t th,.p72-t td{border:1px solid var(--line);padding:6px 6px;text-align:left;vertical-align:top}.p72-t th{background:rgba(127,127,127,.1);font-size:12px}',
'.p72-ex{list-style:none;padding:0}.p72-ex li{padding:8px 10px;border-radius:10px;background:var(--card);border:1px solid var(--line);margin-bottom:6px}.p72-ex b{display:block;font-size:15.5px}.p72-ex li>span,.p72-exb>span{display:block;font-size:13px;color:var(--muted)}.p72-t td:first-child{min-width:3.2em}',
'.p72-n{font-size:13px;background:rgba(59,130,196,.12);border-radius:10px;padding:8px 10px}',
'.p72-how{display:flex;flex-direction:column;gap:4px;background:var(--p72ptbg);border:1px solid var(--p72ptbd);border-radius:12px;padding:10px 12px;margin:0 0 14px;font-size:13px;line-height:1.7}.p72-how>b{font-size:12px;color:var(--p72ptlb);background:none;padding:0}.p72-how em{font-style:normal;color:var(--p72red);font-weight:800}.p72-how u{text-decoration:none;font-weight:800}',
'.p72-mk,.p72-art b{font-weight:800;background:var(--p72mkbg);color:var(--p72mkfg);padding:1px 4px;border-radius:5px;-webkit-box-decoration-break:clone;box-decoration-break:clone}.p72-art b .p72-w{border-bottom-color:currentColor}',
'.p72-art em,.p72-endg,.p72-goal em,.p72-ban em{font-style:normal;color:var(--p72red);font-weight:800}.p71-chg b em,.p72-pb em{font-style:normal;color:var(--p72red)}',
'.p72-art h4{position:relative;padding-left:12px;font-size:15px!important;color:var(--ink)!important;margin:22px 0 8px!important}.p72-art h4:before{content:"";position:absolute;left:0;top:3px;bottom:3px;width:5px;border-radius:3px;background:var(--accent)}',
'.p72-art{font-size:15.5px!important;line-height:1.9!important}.p72-art p{margin:0 0 12px}.p72-art li{margin-bottom:6px}',
'.p72-art .p72-n{position:relative;background:var(--p72ptbg);border:1px solid var(--p72ptbd);padding:28px 12px 10px;font-size:14px;line-height:1.85;color:var(--ink)}.p72-art .p72-n:before{content:"ポイント";position:absolute;left:12px;top:7px;font-size:11.5px;font-weight:800;color:var(--p72ptlb);letter-spacing:.08em}',
'.p72-art .p72-eg{position:relative;background:var(--card);border:1px solid var(--line);border-left:4px solid var(--accent);border-radius:12px;padding:28px 12px 10px;font-size:14.5px;line-height:1.85;margin:0 0 12px}.p72-art .p72-eg:before{content:"たとえば";position:absolute;left:12px;top:7px;font-size:11.5px;font-weight:800;color:var(--accent);letter-spacing:.08em}',
'.p72-goal{display:flex;gap:10px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 12px;margin:10px 0 4px}.p72-goal>div{flex:1;min-width:0}.p72-goal small{display:block;font-size:11.5px;font-weight:800;color:var(--accent)}.p72-goal b{display:block;font-size:17px;margin:2px 0;line-height:1.6}.p72-goal>div>span{display:block;font-size:13px;color:var(--muted);line-height:1.6}.p72-goal .p72-w{display:inline}.p72-exru .p72-w,.p72-bd .p72-w{border-bottom-color:var(--p72u)!important}.p72-ex .p71-pic,.p72-bi .p71-pic{min-height:0!important;max-height:72px;overflow:hidden;aspect-ratio:1/1;padding:0!important}.p72-ex .p71-pic{height:56px!important;max-height:56px}',
'.p72-t tr:nth-child(even) td{background:rgba(127,127,127,.06)}.p72-t td:first-child{font-weight:700}.p72-t th{color:var(--accent)}',
'.p72-ban{display:flex;gap:8px;margin:0 0 6px;overflow-x:auto}.p72-bi{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;gap:4px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px 6px}.p72-bi .p71-pic{width:72px;height:72px}.p72-cap{font-size:14px;font-weight:700;text-align:center}.p72-bi small{font-size:11px;font-weight:800}',
'.p72-bsvg{display:block;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:8px}.p72-svg{display:block;width:100%;height:auto;color:var(--ink)}',
'.p72-gm,.p72-gbm{border-color:#3B82C4!important}.p72-gf,.p72-gbf{border-color:#E0503F!important}.p72-gn,.p72-gbn{border-color:#2E9C8F!important}i.p72-gm,b.p72-gm,small.p72-gm{color:#3B82C4}i.p72-gf,b.p72-gf,small.p72-gf{color:#E0503F}i.p72-gn,b.p72-gn,small.p72-gn{color:#2E9C8F}.p72-bd i{font-style:normal;font-weight:800}',
'.p72-art .p72-ex li{display:flex;gap:10px;align-items:flex-start;padding:10px 12px;cursor:pointer;transition:background .2s}.p72-art .p72-ex li.say{background:rgba(46,156,143,.16)}.p72-ex .p72-exp{flex:none;width:56px;height:56px;margin-top:2px}.p72-exb{flex:1;min-width:0}',
'.p72-exru{display:flex;align-items:center;gap:6px;justify-content:space-between}.p72-exru>b{background:none!important;color:var(--ink)!important;font-size:17px;font-weight:700;padding:0}.p72-exspk{flex:none;width:36px;height:36px}.p72-exb>span{display:block;font-size:13px;color:var(--muted)}',
'.p72-bd{margin-top:6px;border-top:1px dashed var(--line);padding-top:4px}.p72-bd>div{display:flex;gap:8px;font-size:12.5px;line-height:1.6;padding:1px 0}.p72-bd b{flex:none;min-width:78px;background:none!important;color:var(--ink)!important;font-weight:700;padding:0}.p72-bd span{color:var(--muted)}.p72-bd small{font-size:11px}',
'.p72-toc i.p72-ic{width:52px;height:52px;background:none;padding:0;border-radius:0}.p72-ic svg{width:52px;height:52px;display:block}.p72-toc button{gap:14px!important}',
'.p72-ti{position:relative;width:44px!important;height:44px!important;background:none!important;padding:0}.p72-ti .p71-pic{width:44px;height:44px}.p72-ti u{position:absolute;right:-4px;bottom:-4px;min-width:18px;height:18px;border-radius:9px;background:var(--accent);color:#fff;font-size:10.5px;text-decoration:none;display:flex;align-items:center;justify-content:center}',
'.p72-prow{margin-top:6px;border-top:1px solid var(--line);padding-top:6px}.p72-prow>div{display:flex;gap:8px;padding:2px 0;font-size:13px}.p72-prow>div>span{flex:none;width:28px;color:var(--muted);font-size:12px;padding-top:1px}.p72-prow small{display:block;color:var(--muted);font-size:12px;line-height:1.55}.p72-pnote{margin-top:6px;font-size:12.5px;color:var(--muted);line-height:1.6;background:rgba(127,127,127,.08);border-radius:8px;padding:6px 8px}.p72-pb i{font-style:normal;color:var(--muted)}',
'.p72-gnav{display:flex;justify-content:space-between;gap:8px;margin-top:18px}.p72-gnav button{flex:1;min-width:0;min-height:44px;padding:6px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:12.5px}.p72-gnav span{flex:1}.p72-gnote{margin-top:14px;text-align:center}'
].join("");document.head.appendChild(st);}catch(_){}})();
