/* ===== Phase77：耳で聞いた音で辞書を引く =====
   聞こえたままのひらがな・カタカナ（例：すぱしば、ドスビダニヤ、ヤブロコ）でも、近い発音の単語を出す。
   単語帳の発音カナ（w.kana）と入力を、どちらも「音のかぎ」に直してから、ちがいの少なさで比べる。
   ゆれをまとめるもの：長音・小さい「っ」、アクセントのない о が「ア」に聞こえる（o→a）、е/и（e→i）、ヴ/ブ、シ/スィ、
   日本語で子音のあとにつく「ウ」「オ」（ズドラ→zdra、語末のト→t）。 */
var P77_K={"あ":"a","い":"i","う":"u","え":"e","お":"o","か":"ka","き":"ki","く":"ku","け":"ke","こ":"ko","が":"ga","ぎ":"gi","ぐ":"gu","げ":"ge","ご":"go",
 "さ":"sa","し":"si","す":"su","せ":"se","そ":"so","ざ":"za","じ":"zi","ず":"zu","ぜ":"ze","ぞ":"zo","た":"ta","ち":"ci","つ":"cu","て":"te","と":"to",
 "だ":"da","ぢ":"zi","づ":"zu","で":"de","ど":"do","な":"na","に":"ni","ぬ":"nu","ね":"ne","の":"no","は":"ha","ひ":"hi","ふ":"hu","へ":"he","ほ":"ho",
 "ば":"ba","び":"bi","ぶ":"bu","べ":"be","ぼ":"bo","ぱ":"pa","ぴ":"pi","ぷ":"pu","ぺ":"pe","ぽ":"po","ま":"ma","み":"mi","む":"mu","め":"me","も":"mo",
 "や":"ya","ゆ":"yu","よ":"yo","ら":"ra","り":"ri","る":"ru","れ":"re","ろ":"ro","わ":"wa","を":"o","ん":"n","ゔ":"bu"};
var P77_SMALL={"ぁ":"a","ぃ":"i","ぅ":"u","ぇ":"e","ぉ":"o","ゃ":"a","ゅ":"u","ょ":"o"};
function p77Key(s){
  s=p73Hira(String(s||"")).replace(/[ー〜～・\s　っッ゛]/g,"");var out="";
  for(var i=0;i<s.length;i++){var c=s.charAt(i);
    if(P77_SMALL[c]){var v=P77_SMALL[c];
      if(/[ゃゅょ]/.test(c)){out=out.replace(/i$/,"")+"y"+v;}   /* しゃ→sya、にゃ→nya */
      else if(/[aiueo]$/.test(out)){out=out.replace(/[aiueo]$/,"")+v;} /* ヴィ→bi、ティ→ti、ミェ→me */
      else out+=v;continue;}
    out+=P77_K[c]!=null?P77_K[c]:(/[a-z]/.test(c)?c:"");}
  out=out.replace(/w/g,"b").replace(/o/g,"a").replace(/e/g,"i").replace(/iy/g,"y").replace(/yi/g,"i").replace(/(.)\1+/g,"$1");
  out=out.replace(/([bcdghjkmnprstwz])[uo](?=[bcdghjkmnprstwz])/g,"$1").replace(/([bcdghkprstz])[ua]$/,"$1");
  return out.replace(/(.)\1+/g,"$1");
}
function p77Lev(a,b){var m=a.length,n=b.length,prev=[],cur,i,j;for(j=0;j<=n;j++)prev[j]=j;
  for(i=1;i<=m;i++){cur=[i];for(j=1;j<=n;j++)cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a.charAt(i-1)===b.charAt(j-1)?0:1));prev=cur;}return prev[n];}
var P77_IX=null;
function p77Ix(){if(P77_IX)return P77_IX;P77_IX={};VOCAB.forEach(function(w){if(!w.kana)return;var parts=String(w.kana).split(/[\s・]+/).filter(Boolean);
  P77_IX[w.id]=[p77Key(parts.join(""))].concat(parts.length>1?parts.map(p77Key):[]);});return P77_IX;}
if(typeof p73Score==="function"){
  var _p77Score=p73Score;
  p73Score=function(e,q,sc){var r=_p77Score.apply(this,arguments);if(sc!=="kana"||r[0]>=56||q.length<2)return r;
    var ks=p77Ix()[e.w.id];if(!ks)return r;var qk=p77Key(q);if(qk.length<2)return r;
    var best=99;ks.forEach(function(k){if(Math.abs(k.length-qk.length)<=3){var d=p77Lev(qk,k);if(d<best)best=d;}});
    var allow=qk.length<=3?0:qk.length<=6?1:qk.length<=10?2:3;
    if(best<=allow){var s=58-best*7;if(s>r[0])return [s,"hear"];}
    return r;};
  if(typeof P73_WHY==="object")P73_WHY.hear="聞こえた音";
}
if(typeof renderWordSearch==="function"){
  var _p77Ws=renderWordSearch;
  renderWordSearch=function(){var h=String(_p77Ws.apply(this,arguments));
    return h.replace("つづりが少し違っても、近い単語が出ます。","つづりが少し違っても、近い単語が出ます。<br><b>耳で聞いた音</b>を、聞こえたままのひらがな・カタカナで入れても探せます（例：すぱしば、ドスビダニヤ）。");};
}
