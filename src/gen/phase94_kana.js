/* ===== PHASE94：ロシア語の上にカタカナの読みを出す（読みがなボタン）と、読み上げが鳴らないときの手当て =====
   2026-11-28 Yuta：検定の単語問題が初心者には読めないので、ボタンで読みがなを出したい。音声が鳴っていないようなので直してほしい。
   ・ruKana(語)：src/gen/ru_kana.py と同じ規則で、ロシア語1語をカタカナにする（アクセントは単語帳の形から探す）
   ・ruKanaApply(root, selector)：画面のロシア語に <ruby> で読みを付ける
   ・読み上げ：何も鳴っていないときに cancel() を呼ばない（iPhone ではすぐ後の読み上げが消えることがあるため）。
     最初に画面を触ったときに無音の読み上げで音声を使える状態にする。読み上げが始まらなかったときは画面に知らせる。 */
(function(){
if(typeof P47_LANG!=="undefined"&&P47_LANG!=="ru")return;
var AC="́",VOW="аеёиоуыэюя",SOFTV="еёиюя";
var C={"б":["バ ビ ブ ベ ボ","ビャ ビ ビュ ビェ ビョ","ブ","ビ","プ"],"в":["ヴァ ヴィ ヴ ヴェ ヴォ","ヴャ ヴィ ヴュ ヴィェ ヴョ","ヴ","ヴィ","フ"],"г":["ガ ギ グ ゲ ゴ","ギャ ギ ギュ ゲ ギョ","グ","ギ","ク"],
 "д":["ダ ディ ドゥ デ ド","ジャ ジ ジュ ジェ ジョ","ド","ジ","ト"],"ж":["ジャ ジ ジュ ジェ ジョ","ジャ ジ ジュ ジェ ジョ","ジュ","ジ","シュ"],"з":["ザ ズィ ズ ゼ ゾ","ジャ ジ ジュ ジェ ジョ","ズ","ジ","ス"],
 "й":["ヤ イ ユ イェ ヨ","ヤ イ ユ イェ ヨ","イ","イ","イ"],"к":["カ キ ク ケ コ","キャ キ キュ ケ キョ","ク","キ","ク"],"л":["ラ リ ル レ ロ","リャ リ リュ リェ リョ","ル","リ","ル"],
 "м":["マ ミ ム メ モ","ミャ ミ ミュ ミェ ミョ","ム","ミ","ム"],"н":["ナ ニ ヌ ネ ノ","ニャ ニ ニュ ニェ ニョ","ン","ニ","ン"],"п":["パ ピ プ ペ ポ","ピャ ピ ピュ ピェ ピョ","プ","ピ","プ"],
 "р":["ラ リ ル レ ロ","リャ リ リュ リェ リョ","ル","リ","ル"],"с":["サ スィ ス セ ソ","シャ シ シュ シェ ショ","ス","シ","ス"],"т":["タ ティ トゥ テ ト","チャ チ チュ チェ チョ","ト","チ","ト"],
 "ф":["ファ フィ フ フェ フォ","フャ フィ フュ フィェ フョ","フ","フィ","フ"],"х":["ハ ヒ フ ヘ ホ","ヒャ ヒ ヒュ ヘ ヒョ","フ","ヒ","フ"],"ц":["ツァ ツィ ツ ツェ ツォ","ツァ ツィ ツ ツェ ツォ","ツ","ツ","ツ"],
 "ч":["チャ チ チュ チェ チョ","チャ チ チュ チェ チョ","チ","チ","チ"],"ш":["シャ シ シュ シェ ショ","シャ シ シュ シェ ショ","シュ","シ","シュ"],"щ":["シャ シ シュ シェ ショ","シャ シ シュ シェ ショ","シ","シ","シ"]};
var VOICED="бвгджз",VOICELESS="пфктшсхцчщ",DEV={"б":"п","в":"ф","г":"к","д":"т","ж":"ш","з":"с"};
var BARE={a:"ア",i:"イ",u:"ウ",e:"エ",o:"オ"},IOT={a:"ヤ",i:"イ",u:"ユ",e:"イェ",o:"ヨ"},IDX={a:0,i:1,u:2,e:3,o:4};
var SP={"что":"シト","чтобы":"シトブィ","что-то":"シタタ","что-нибудь":"シタニブーチ","его":"イヴォー","сегодня":"シヴォードニャ","конечно":"カニェーシナ","скучно":"スクーシナ","ничего":"ニチヴォー","чего":"チヴォー","кого":"カヴォー",
 "в":"ヴ","с":"ス","к":"ク","здравствуйте":"ズドラーストヴイチェ","чувство":"チューストヴァ","солнце":"ソーンツェ","сердце":"シェールツェ","лестница":"リェースニツァ","дождь":"ドーシチ","счастье":"シャースチエ","счастливый":"シシスリーヴィ","пожалуйста":"パジャーラスタ"};
function vw(ch,st,fin){var soft=SOFTV.indexOf(ch)>=0,b={"а":"a","я":"a","о":"o","ё":"o","у":"u","ю":"u","ы":"i","и":"i","э":"e","е":"e"}[ch];
  if(!st){if(b==="o")b="a";if("ея".indexOf(ch)>=0&&!fin)b="i";if(ch==="е"&&fin)b="e";}return [b,soft];}
function kanaOf(w){
  var raw=w.replace(/́/g,"").toLowerCase();if(SP[raw])return SP[raw];
  var s=w.toLowerCase().replace(/ться/g,"ца").replace(/тся/g,"ца").replace(/сч/g,"щ"),L=[],si=null;
  for(var q=0;q<s.length;q++){var ch=s[q];if(ch===AC){if(L.length)si=L.length-1;continue;}L.push(ch);}
  if(si===null)for(var q2=0;q2<L.length;q2++)if(L[q2]==="ё")si=q2;
  var vi=[];L.forEach(function(ch,i){if(VOW.indexOf(ch)>=0)vi.push(i);});
  var mono=si===null&&vi.length===1;if(mono)si=vi[0];
  var t=L.join("");if(/[ое]го$/.test(t)&&t.length>3)t=t.replace(/([оеё])г(о)$/,"$1в$2");
  var out=[],i=0,n=t.length;
  while(i<n){var c=t[i];
    if("ъь-".indexOf(c)>=0){i++;continue;}
    if(VOW.indexOf(c)>=0){var bs=vw(c,i===si,i===n-1),pv=i>0?t[i-1]:"",k;
      if(bs[1]&&(i===0||VOW.indexOf(pv)>=0||"ъь-".indexOf(pv)>=0)&&c!=="и")k=IOT[c==="я"?"a":c==="е"?"e":bs[0]];else if(c==="ы")k="ィ";else k=BARE[bs[0]];
      out.push(k+(i===si&&!mono?"ー":""));i++;continue;}
    if(C[c]){var R=C[c],nx=i+1<n?t[i+1]:"",c2=c;
      if(VOICED.indexOf(c)>=0&&(nx===""||VOICELESS.indexOf(nx)>=0||("ъь".indexOf(nx)>=0&&nx!==""&&i+2>=n)))c2=DEV[c];
      if(nx!==""&&VOW.indexOf(nx)>=0){var b2=vw(nx,i+1===si,i+1===n-1),row=(b2[1]?R[1]:R[0]).split(" "),k2;
        if(nx==="ы")k2={"б":"ブィ","в":"ヴィ","м":"ムィ","п":"プィ","ф":"フィ"}[c]||R[0].split(" ")[1];else k2=row[IDX[b2[0]]];
        out.push(k2+(i+1===si&&!mono?"ー":""));i+=2;continue;}
      if(nx==="ь"){out.push(c2===c?R[3]:C[c2][3]);i+=2;continue;}
      if(c2!==c)out.push(i+1<n?C[c2][2]:R[4]);else out.push(R[2]);i++;continue;}
    i++;}
  return out.join("");
}
/* アクセント：単語帳の語（アクセント記号つき）から探す。変化した形は、辞書の形と同じ位置の母音にアクセントを置く（目安） */
var ACC=null;
function accMap(){if(ACC)return ACC;ACC={};try{(window.VOCAB||[]).forEach(function(w){[w.word,w.accent].forEach(function(x){if(!x||/\s/.test(x)||x.indexOf(AC)<0)return;var k=x.replace(/́/g,"").toLowerCase().replace(/ё/g,"е");if(!ACC[k])ACC[k]=x.toLowerCase();});});}catch(_){}return ACC;}
function accOf(tok){
  if(tok.indexOf(AC)>=0||/ё/i.test(tok))return tok;
  var k=tok.toLowerCase().replace(/ё/g,"е"),m=accMap();if(m[k])return m[k];
  var r=null;try{r=p72Look(tok);}catch(_){}var b=r&&r.base?String(r.base).toLowerCase():"";
  if(b.indexOf(AC)>0){var pos=b.indexOf(AC),nv=0;for(var i=0;i<pos;i++)if(VOW.indexOf(b[i])>=0)nv++;
    var w=tok.toLowerCase(),c=0;for(var j=0;j<w.length;j++)if(VOW.indexOf(w[j])>=0){c++;if(c===nv&&w.slice(0,j).replace(/[^а-яё]/g,"").slice(0,2)===b.replace(/́/g,"").slice(0,2))return w.slice(0,j+1)+AC+w.slice(j+1);}}
  return tok;
}
var KC={};
window.ruKana=function(tok){var k=String(tok||"");if(KC[k]!==undefined)return KC[k];var r="";try{r=kanaOf(accOf(k));}catch(_){}KC[k]=r;return r;};
window.ruKanaApply=function(root,sel){
  if(!root)return;var els=root.querySelectorAll(sel);
  [].forEach.call(els,function(el){if(el.closest(".rk-done"))return;el.classList.add("rk-done");
    var tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),list=[],n;while((n=tw.nextNode())){if(/[А-Яа-яЁё]/.test(n.nodeValue)&&!(n.parentNode&&n.parentNode.closest("rt,ruby,button.p71-spk")))list.push(n);}
    list.forEach(function(tn){var s=tn.nodeValue,f=document.createDocumentFragment(),last=0,re=/[А-Яа-яЁё́]+(?:-[А-Яа-яЁё́]+)?/g,m;
      while((m=re.exec(s))){if(m.index>last)f.appendChild(document.createTextNode(s.slice(last,m.index)));
        var kn=ruKana(m[0]),rb=document.createElement("ruby");rb.className="rk";rb.appendChild(document.createTextNode(m[0]));
        if(kn){var rt=document.createElement("rt");rt.textContent=kn;rb.appendChild(rt);}f.appendChild(rb);last=m.index+m[0].length;}
      if(last<s.length)f.appendChild(document.createTextNode(s.slice(last)));tn.parentNode.replaceChild(f,tn);});});
};
(function(){var c=document.createElement("style");c.textContent=
 'ruby.rk{ruby-position:over;ruby-align:center}ruby.rk rt{font-size:.5em;font-weight:600;color:var(--muted);letter-spacing:0;line-height:1.1}'+
 '.p86-kana{display:inline-flex;align-items:center;gap:4px;margin-left:auto;padding:4px 12px;min-height:36px;border:1px solid var(--line);border-radius:999px;background:none;color:var(--muted);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}'+
 '.p86-kana.on{border-color:var(--accent,#0a84ff);color:var(--accent,#0a84ff);background:rgba(10,132,255,.08)}'+
 '.p86-tagrow{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:6px}.p86-tagrow .p86-tag{margin:0}'+
 '.p86-orow{display:flex;align-items:stretch;gap:6px}.p86-orow .p86-opt{flex:1;min-width:0}.p86-orow .p71-spk{flex:none;align-self:center}'+
 '.p86-nsbar{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 8px;padding:6px 10px;border:1px dashed var(--line);border-radius:12px;font-size:12.5px;color:var(--muted)}';
 document.head.appendChild(c);})();

/* ---------- 読み上げの手当て（iPhone など） ---------- */
var ss=window.speechSynthesis;if(!ss||!window.SpeechSynthesisUtterance)return;
var lastCancel=0,unlocked=false,warned=0;
try{var _cancel=ss.cancel.bind(ss);ss.cancel=function(){if(ss.speaking||ss.pending){lastCancel=Date.now();return _cancel();}};}catch(_){}
try{var _speak=ss.speak.bind(ss);
  ss.speak=function(u){
    var started=false,silent=u&&u.volume===0;
    try{u.addEventListener("start",function(){started=true;unlocked=true;});}catch(_){}
    if(!silent)setTimeout(function(){if(started||ss.speaking)return;var ns=false;try{ns=nsOn();}catch(_){}
      if(!ns&&Date.now()-warned>60000){warned=Date.now();try{toast("音が出ませんでした。端末の音量を上げて、もう一度スピーカーのボタンを押してください");}catch(_){}}},2500);
    /* 止めた直後に読むと、iPhone では消えてしまうことがあるので少し待つ（すでに音が使える状態のときだけ） */
    if(unlocked&&Date.now()-lastCancel<150){setTimeout(function(){_speak(u);},150);return;}
    return _speak(u);};}catch(_){}
/* 最初に画面を触ったとき、無音の読み上げで音声を使える状態にしておく（iPhone は、触った直後でないと読み上げを始めないため） */
var unlock=function(){if(unlocked)return;try{var u=new SpeechSynthesisUtterance(" ");u.volume=0;u.lang="ru-RU";u.onend=function(){unlocked=true;};_speak(u);}catch(_){}
  document.removeEventListener("touchend",unlock,true);document.removeEventListener("click",unlock,true);};
document.addEventListener("touchend",unlock,true);document.addEventListener("click",unlock,true);
})();
