/* ===== PHASE71: 一歩レッスン =====
   「次の一歩」を、テーマを6語前後に小分けした練習レッスンにする。
   流れ：新しい言葉 → 絵で確認 → 文法メモ → 二段階の穴埋め（①意味で言葉を選ぶ ②文に合う形を選ぶ）＋解説 → 前のレッスンのおさらい → まちがえた問題をもう一度。
   画面・絵・文言はこのアプリ用に一から作ったもの。記録は settings.p71（クラウド保存・バックアップの対象）。 */
if(!settings.p71||typeof settings.p71!=="object")settings.p71={};
(function(){var s=settings.p71;if(!s.done)s.done={};if(!s.weak)s.weak={};if(!s.seen)s.seen={};})();
function p71St(){var s=settings.p71;if(!s.done)s.done={};if(!s.weak)s.weak={};if(!s.seen)s.seen={};return s;}
var P71_SIZE=6,P71=null;
function p71N(s){return String(s||"").replace(/́/g,"").toLowerCase().replace(/ё/g,"е");}
function p71Plain(s){return String(s||"").replace(/́/g,"");}
/* ---------- レッスンの区切り ---------- */
function p71Lessons(ti){var th=P47_THEMES[ti];if(!th)return [];var ids=th.ids,n=ids.length,k=Math.max(1,Math.round(n/P71_SIZE)),out=[];
  for(var i=0;i<k;i++)out.push(ids.slice(Math.round(i*n/k),Math.round((i+1)*n/k)));return out;}
function p71Key(ti,li){return P47_THEMES[ti].cat+"#"+li;}
function p71NextIn(ti){var L=p71Lessons(ti),st=p71St();for(var i=0;i<L.length;i++)if(!st.done[p71Key(ti,i)])return i;return -1;}
function p71DoneCount(ti){var L=p71Lessons(ti),st=p71St(),n=0;for(var i=0;i<L.length;i++)if(st.done[p71Key(ti,i)])n++;return n;}
/* ---------- ロシア語の形（よくある規則変化だけ。文の中の形と一致したときだけ使う） ---------- */
var P71_LB={nom:"主格「〜が・〜は」",gen:"生格「〜の・〜がない」",dat:"与格「〜に」",acc:"対格「〜を」",ins:"造格「〜で・〜と」",pre:"前置格「〜で（場所）・〜について」"};
function p71Add(m,f,l){if(!f)return;if(!m[f])m[f]=[];if(m[f].indexOf(l)<0)m[f].push(l);}
function p71Noun(b,sameOk){
  var m={},st,c;
  if(/[^а-я-]/.test(b)||b.length<3)return null;
  if(/ия$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,st+"и","生格");p71Add(m,st+"и","与格");p71Add(m,st+"и","前置格");p71Add(m,st+"ю","対格");p71Add(m,st+"ей","造格");return m;}
  if(/[^и]я$/.test(b)&&!/мя$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,st+"и","生格");p71Add(m,st+"е","与格");p71Add(m,st+"е","前置格");p71Add(m,st+"ю","対格");p71Add(m,st+"ей","造格");return m;}
  if(/а$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,st+(/[гкхжшщч]$/.test(st)?"и":"ы"),"生格");p71Add(m,st+"е","与格");p71Add(m,st+"е","前置格");p71Add(m,st+"у","対格");p71Add(m,st+(/[жшщчц]$/.test(st)?"ей":"ой"),"造格");return m;}
  if(!sameOk)return null; /* 以下は不変化名詞・母音が消える名詞などと区別できないので、文の中で形が変わっているときだけ */
  if(/ие$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,b,"対格");p71Add(m,st+"я","生格");p71Add(m,st+"ю","与格");p71Add(m,st+"ем","造格");p71Add(m,st+"и","前置格");return m;}
  if(/о$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,b,"対格");p71Add(m,st+"а","生格");p71Add(m,st+"у","与格");p71Add(m,st+"ом","造格");p71Add(m,st+"е","前置格");return m;}
  if(/е$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,b,"対格");p71Add(m,st+"я","生格");p71Add(m,st+"ю","与格");p71Add(m,st+"ем","造格");p71Add(m,st+"е","前置格");return m;}
  if(/ий$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,st+"я","生格");p71Add(m,st+"ю","与格");p71Add(m,st+"ем","造格");p71Add(m,st+"и","前置格");return m;}
  if(/й$/.test(b)){st=b.slice(0,-1);p71Add(m,b,"主格");p71Add(m,st+"я","生格");p71Add(m,st+"ю","与格");p71Add(m,st+"ем","造格");p71Add(m,st+"е","前置格");return m;}
  if(/[бвгдзклмнпрстфхжшщчц]$/.test(b)){c=/[жшщчц]$/.test(b);p71Add(m,b,"主格");p71Add(m,b+"а","生格");p71Add(m,b+"у","与格");p71Add(m,b+(c?"ем":"ом"),"造格");p71Add(m,b+"е","前置格");return m;}
  return null;
}
function p71Adj(b){
  if(!/(ый|ий|ой)$/.test(b)||b.length<4)return null;
  var st=b.slice(0,-2),m={},soft=/(син|летн|зимн|последн|средн|верхн|нижн|домашн|сегодняшн|вчерашн|утренн|вечерн|поздн|ранн|осенн|весенн|древн|внутренн|внешн|задн|передн|ближн|дальн|здешн|тамошн|прежн|лишн)ий$/.test(b);
  var vel=/[гкх]$/.test(st),sib=/[жшщч]$/.test(st),oy=/ой$/.test(b);
  var y=(soft||vel||sib)?"и":"ы",o=(soft||(sib&&!oy))?"е":"о",a=soft?"я":"а",u=soft?"ю":"у";
  p71Add(m,b,"男性・主格");p71Add(m,st+a+"я","女性・主格");p71Add(m,st+o+(soft?"е":"е"),"中性・主格");p71Add(m,st+y+"е","複数・主格");
  p71Add(m,st+o+"го","男性・中性の生格");p71Add(m,st+o+"му","男性・中性の与格");p71Add(m,st+y+"м","男性・中性の造格");p71Add(m,st+o+"м","男性・中性の前置格");
  p71Add(m,st+u+"ю","女性・対格");p71Add(m,st+o+"й","女性の生格・与格・造格・前置格");p71Add(m,st+y+"х","複数の生格・前置格");p71Add(m,st+y+"ми","複数・造格");
  if(soft){/* 中性主格は -ее */delete m[st+"ее"];p71Add(m,st+"ее","中性・主格");}
  return m;
}
function p71Verb(b,surf){
  var refl=/(ться|тись)$/.test(b),base=refl?b.slice(0,-2):b;
  if(!/ть$/.test(base)||/ереть$/.test(base)||/^(есть|съесть|надоесть)$/.test(b)||base.length<4)return null;
  var st=base.slice(0,-2),R=function(s,v){return refl?s+(v?"сь":"ся"):s;},m={},pres={},past={};
  p71Add(m,b,"不定形（辞書の形）");
  [["л","男性・過去",0],["ла","女性・過去",1],["ло","中性・過去",1],["ли","複数・過去",1]].forEach(function(x){var f=R(st+x[0],x[2]);p71Add(m,f,x[1]);past[f]=1;});
  var pm={};
  if(/[ая]ть$/.test(base)&&!/(ова|ева)ть$/.test(base)){var s1=base.slice(0,-2);
    [["ю","я の形",1],["ешь","ты の形",0],["ет","он・она の形",0],["ем","мы の形",0],["ете","вы の形",1],["ют","они の形",0]].forEach(function(x){pm[R(s1+x[0],x[2])]=x[1];});}
  else if(/ить$/.test(base)){var s2=base.slice(0,-3),sb=/[жшщч]$/.test(s2);
    [["ишь","ты の形",0],["ит","он・она の形",0],["им","мы の形",0],["ите","вы の形",1],[sb?"ат":"ят","они の形",0]].forEach(function(x){pm[R(s2+x[0],x[2])]=x[1];});}
  var sn=p71N(surf);
  if(pm[sn]){Object.keys(pm).forEach(function(f){p71Add(m,f,pm[f]);});return {m:m,grp:"pres",pm:pm,past:past};}
  return {m:m,grp:past[sn]?"past":(sn===b?"inf":null),pm:pm,past:past};
}
/* 文の中の手がかり（前置詞・数・主語） */
var P71_PREP={"в":"в＋前置格は「〜の中で」、в＋対格は「〜の中へ」",
  "во":"во は в と同じ。в＋前置格は「〜の中で」、в＋対格は「〜の中へ」",
  "на":"на＋前置格は「〜の上で・〜で」、на＋対格は「〜の上へ・〜へ」",
  "к":"к（〜のところへ）のあとは与格","ко":"ко（〜のところへ）のあとは与格",
  "у":"у（〜のところに・〜には）のあとは生格","из":"из（〜から）のあとは生格","от":"от（〜から）のあとは生格","для":"для（〜のために）のあとは生格","без":"без（〜なしで）のあとは生格","до":"до（〜まで）のあとは生格","после":"после（〜のあと）のあとは生格","около":"около（〜の近く）のあとは生格","кроме":"кроме（〜以外）のあとは生格","возле":"возле（〜のそば）のあとは生格","напротив":"напротив（〜の向かい）のあとは生格",
  "с":"с＋造格は「〜と一緒に」、с＋生格は「〜から」","со":"со は с と同じ。с＋造格は「〜と一緒に」",
  "о":"о（〜について）のあとは前置格","об":"об（〜について）のあとは前置格","при":"при（〜のときに）のあとは前置格",
  "по":"по（〜に沿って・〜で）のあとはふつう与格","через":"через（〜を通って・〜後に）のあとは対格","про":"про（〜について）のあとは対格",
  "за":"за＋造格は「〜の後ろで」、за＋対格は「〜のために・〜の間に」","под":"под＋造格は「〜の下で」","над":"над（〜の上方で）のあとは造格","перед":"перед（〜の前で）のあとは造格","между":"между（〜の間で）のあとは造格",
  "нет":"нет（〜がない）のあとは生格","два":"2・3・4（два／две／три／четыре）のあとは単数の生格","две":"2・3・4（два／две／три／четыре）のあとは単数の生格","три":"2・3・4（два／две／три／четыре）のあとは単数の生格","четыре":"2・3・4（два／две／три／четыре）のあとは単数の生格"};
var P71_SUBJ={"я":"я（私）","ты":"ты（きみ）","он":"он（彼）","она":"она（彼女）","оно":"оно（それ）","мы":"мы（私たち）","вы":"вы（あなた・あなたたち）","они":"они（彼ら）"};
/* ---------- 穴埋め問題を作る ---------- */
function p71Find(sentence,w){
  if(!sentence)return null;
  var toks=String(sentence).split(/(\s+|[,.!?;:—«»"“”()]+)/),words=p71N(w.word).split(/\s+/).filter(Boolean),hit=-1,len=words.length;
  function stem(s){return s.length>4?s.slice(0,Math.max(3,s.length-2)):s;}
  var idx=[];for(var i=0;i<toks.length;i++)if(/[^\s,.!?;:—«»"“”()]/.test(toks[i]))idx.push(i);
  for(var pass=0;pass<2&&hit<0;pass++){
    for(var j=0;j+len<=idx.length;j++){var ok=true;
      for(var k=0;k<len;k++){var t=p71N(toks[idx[j+k]]),ww=words[k];if(pass===0?t!==ww:(k<len-1?t!==ww:(stem(ww).length<2||t.indexOf(stem(ww))!==0))){ok=false;break;}}
      if(ok){hit=j;break;}}
  }
  if(hit<0)return null;
  var a=idx[hit],z=idx[hit+len-1];
  return {toks:toks,a:a,z:z,surface:toks.slice(a,z+1).join("")};
}
function p71Ctx(f){
  var out=[],prev=null;for(var i=f.a-1;i>=0;i--){if(/[^\s,.!?;:—«»"“”()]/.test(f.toks[i])){prev=p71N(f.toks[i]);break;}}
  if(prev&&P71_PREP[prev])out.push("すぐ前に "+prev+" があります。"+P71_PREP[prev]+"です。");
  return out;
}
function p71Subj(f){for(var i=0;i<f.toks.length;i++){if(i>=f.a&&i<=f.z)continue;var t=p71N(f.toks[i]);if(P71_SUBJ[t])return t;}return null;}
function p71Cap(s,ref){return /^[А-ЯЁA-Z]/.test(ref)?s.charAt(0).toUpperCase()+s.slice(1):s;}
function p71Forms(w,f){
  /* 文に合う形を選ぶ選択肢。{opts:[形],lab:{形:説明},ans:形} */
  if(!f||/\s/.test(p71N(w.word)))return null;
  var b=p71Plain(w.word).toLowerCase(),bn=p71N(w.word),sn=p71N(f.surface),m=null,info=null;
  if(P47_LANG!=="ky"){
    if(w.pos==="noun")m=p71Noun(b,sn!==bn);
    else if(w.pos==="adjective")m=p71Adj(b);
    else if(w.pos==="verb"){info=p71Verb(b,f.surface);if(info){m={};var keep=info.grp==="pres"?info.pm:info.grp?info.past:null;if(!keep)m=null;else{p71Add(m,b,"不定形（辞書の形）");Object.keys(keep).forEach(function(k){(info.m[k]||[]).forEach(function(l){p71Add(m,k,l);});});}}}
    var shown=null;if(m)Object.keys(m).forEach(function(k){if(p71N(k)===sn)shown=k;});
    if(!shown)m=null;
  }
  var opts,lab={};
  if(m){opts=Object.keys(m).filter(function(x){return x!==shown;});
    if(info&&info.grp==="pres"&&/ить$/.test(bn.replace(/с[яь]$/,"")))opts=opts.filter(function(x){return !/(ю|юсь)$/.test(x);});
    Object.keys(m).forEach(function(k){lab[p71N(k)]=m[k].join("・");});
    /* в／на＋-у（в саду́ など）は場所を表す特別な前置格 */
    var pv=p71Ctx(f).length?p71N(f.toks.slice(0,f.a).join("").trim().split(/\s+/).pop()):"";
    if(w.pos==="noun"&&/^(в|во|на)$/.test(pv)&&/у$/.test(sn)&&lab[sn]==="与格")lab[sn]="前置格（場所を表す特別な形 -у）";
    var gov={"в":"前置格|対格","во":"前置格|対格","на":"前置格|対格","о":"前置格","об":"前置格","при":"前置格","к":"与格","ко":"与格","по":"与格","с":"造格|生格","со":"造格|生格","над":"造格","перед":"造格","между":"造格","под":"造格|対格","за":"造格|対格","через":"対格","про":"対格"}[pv];
    "у из от для без до после около кроме возле напротив нет два две три четыре".split(" ").forEach(function(q){if(q===pv)gov="生格";});
    if(gov&&lab[sn]&&lab[sn].indexOf("・")>0&&w.pos==="noun"){var keep=lab[sn].split("・").filter(function(l){return new RegExp(gov).test(l);});if(keep.length===1)lab[sn]=keep[0];}}
  else{shown=p71Plain(f.surface).toLowerCase();var F=(window.P58_FORMS&&P58_FORMS.f)||{},fs=F[bn]?Object.keys(F[bn]):[];opts=fs.filter(function(x){return p71N(x)!==sn;});}
  opts=opts.filter(function(x,i,a){return a.map(p71N).indexOf(p71N(x))===i;});
  if(opts.length<2)return null;
  opts=shuffle(opts).slice(0,3);
  var all=shuffle(opts.concat([shown]));
  return {opts:all.map(function(x){return p71Cap(x,f.surface);}),ans:p71Cap(shown,f.surface),lab:lab,key:sn};
}
function p71Cloze(id,src){
  var w=WMAP[id];if(!w)return null;
  var s=src&&src.ru||w.exRu,ja=src&&src.ja||w.exJa;if(!s)return null;
  var f=p71Find(s,w);if(!f)return null;
  return {id:id,f:f,ja:ja||"",forms:p71Forms(w,f),why:src&&src.why||"",cid:src&&src.cid||""};
}
/* 作文の文（文ごとの解説つき）から、その単語を含む文を探す */
var P71_CIDX=null;
function p71ComposeFor(w){
  if(!P71_CIDX){P71_CIDX={};(window.COMPOSE||[]).forEach(function(c){(c.breakdown||[]).forEach(function(t){var k=p71N(t.base);if(!k)return;(P71_CIDX[k]=P71_CIDX[k]||[]).push([c,t]);});});}
  return P71_CIDX[p71N(w.word)]||[];
}
/* ---------- レッスンを組み立てる ---------- */
function p71Distract(id,pool,n){
  var w=WMAP[id],same=pool.filter(function(x){return x!==id&&WMAP[x]&&WMAP[x].pos===w.pos&&p71N(WMAP[x].word)!==p71N(w.word)&&WMAP[x].meaning!==w.meaning;});
  var other=pool.filter(function(x){return x!==id&&WMAP[x]&&same.indexOf(x)<0&&p71N(WMAP[x].word)!==p71N(w.word)&&WMAP[x].meaning!==w.meaning;});
  var out=shuffle(same).slice(0,n);if(out.length<n)out=out.concat(shuffle(other).slice(0,n-out.length));
  if(out.length<n){var all=VOCAB.filter(function(v){return v.level===w.level&&v.pos===w.pos&&v.id!==id&&out.indexOf(v.id)<0&&v.meaning!==w.meaning;}).map(function(v){return v.id;});out=out.concat(shuffle(all).slice(0,n-out.length));}
  return out;
}
function p71Build(ti,li){
  var th=P47_THEMES[ti],L=p71Lessons(ti);if(!th||!L.length)return null;
  if(li==null||li<0){li=p71NextIn(ti);if(li<0){var st=p71St(),old=null;L.forEach(function(_,j){var d=st.done[p71Key(ti,j)];if(old===null||d<old.d)old={j:j,d:d};});li=old?old.j:0;}}
  var ids=L[li],pool=th.ids,steps=[],memo=[];
  ids.forEach(function(id){steps.push({t:"card",id:id});});
  shuffle(ids.slice()).forEach(function(id){steps.push({t:"pick",id:id,opts:shuffle([id].concat(p71Distract(id,pool,3)))});});
  var cz=[];
  ids.forEach(function(id){var c=p71Cloze(id);if(c)cz.push({t:"cloze",id:id,c:c,opts:shuffle([id].concat(p71Distract(id,pool,3)))});});
  /* 文ごとの解説がある文：形の変化があるものを最大2つ */
  var extra=[];ids.forEach(function(id){var w=WMAP[id];p71ComposeFor(w).forEach(function(ct){var c=ct[0],t=ct[1];if(p71N(t.surface)===p71N(w.word)||p71N(c.ru)===p71N(w.exRu))return;
    var cc=p71Cloze(id,{ru:c.accent||c.ru,ja:c.ja,why:t.why||t.note||"",cid:c.id});if(cc&&cc.forms)extra.push({t:"form",id:id,c:cc,unit:c.unit,g:c.gDetail||"",ge:c.gEasy||""});});});
  extra=shuffle(extra).filter(function(x,i,a){return a.findIndex(function(y){return y.id===x.id;})===i;}).slice(0,2);
  /* 文法メモ */
  cz.concat(extra).forEach(function(x){var c=x.c,w=WMAP[x.id];if(!c.forms)return;var l=c.forms.lab[c.forms.key];
    if(p71N(c.f.surface)!==p71N(w.word)||l)memo.push({w:w,surf:p71Plain(c.f.surface),lab:l||"",ctx:p71Ctx(c.f)});});
  var units=extra.map(function(x){return x.unit+"｜"+x.g;}).filter(function(x,i,a){return x.length>2&&a.indexOf(x)===i;}).slice(0,1);
  memo=memo.filter(function(r,i,a){return a.findIndex(function(q){return q.w.id===r.w.id&&p71N(q.surf)===p71N(r.surf);})===i;});
  if(memo.length||units.length)steps.push({t:"memo",memo:memo.slice(0,6),units:units});
  cz.forEach(function(x){steps.push(x);});
  extra.forEach(function(x){steps.push(x);});
  /* おさらい：前のレッスンで習った言葉（まちがえた言葉を優先） */
  var st=p71St(),inL={};ids.forEach(function(id){inL[id]=1;});
  var weak=Object.keys(st.weak).filter(function(id){return WMAP[id]&&!inL[id];}).sort(function(a,b){return st.weak[b]-st.weak[a];});
  var seen=Object.keys(st.seen).filter(function(id){return WMAP[id]&&!inL[id]&&weak.indexOf(id)<0;}).sort(function(a,b){return st.seen[a]<st.seen[b]?-1:1;});
  var rv=weak.slice(0,3);rv=rv.concat(seen.slice(0,Math.max(0,4-rv.length)));
  rv.forEach(function(id){var w=WMAP[id],tp=P47_THEMES.filter(function(t){return t.ids.indexOf(id)>=0;})[0],p=tp?tp.ids:pool,c=p71Cloze(id);
    if(c)steps.push({t:"cloze",id:id,c:c,opts:shuffle([id].concat(p71Distract(id,p,3))),rev:1});
    else steps.push({t:"pick",id:id,opts:shuffle([id].concat(p71Distract(id,p,3))),rev:1});});
  return {ti:ti,li:li,n:L.length,ids:ids,steps:steps,pos:0,stage:0,picked:null,picked2:null,mist:{},retried:{},ok:0,ng:0,rv:rv,before:p47DoneToday(),confirm:false};
}
/* ---------- 画面 ---------- */
function p71Pic(id,cls){var p=p59Pic(id);return '<div class="p59-pic p71-pic '+(cls||"")+'" data-p71pic="'+id+'"></div>';}
function p71FillPics(root){if(!root)return;root.querySelectorAll("[data-p71pic]").forEach(function(d){try{p66Fill(d,p59Pic(d.getAttribute("data-p71pic")));}catch(_){}});}
function p71Stamp(ok){if(ok){var d="",n=9,R=21;for(var i=0;i<n;i++){var a1=i/n*Math.PI*2-Math.PI/2,a2=(i+1)/n*Math.PI*2-Math.PI/2;d+=(i?"":"M"+(30+Math.cos(a1)*R).toFixed(1)+" "+(30+Math.sin(a1)*R).toFixed(1))+"A6.6 6.6 0 0 1 "+(30+Math.cos(a2)*R).toFixed(1)+" "+(30+Math.sin(a2)*R).toFixed(1);}
    return '<svg class="p71-stamp" viewBox="0 0 60 60" aria-hidden="true"><g fill="none" stroke="#E0503F" stroke-width="2.6" stroke-linecap="round"><path d="'+d+'z"/><path d="M30 30m-2 0a2 2 0 1 1 4 0a5 5 0 1 1-9 0a8 8 0 1 1 15 0a11 11 0 1 1-21-1"/></g></svg>';}
  return '<svg class="p71-stamp" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 14l17 30H13z" fill="none" stroke="#3B82C4" stroke-width="3.4" stroke-linejoin="round"/></svg>';}
function p71StampOld(ok){return ok?''
  :'<svg class="p71-stamp" viewBox="0 0 60 60" aria-hidden="true"><path d="M30 14l17 30H13z" fill="none" stroke="#3B82C4" stroke-width="3.4" stroke-linejoin="round"/></svg>';}
function p71Sentence(c,fill,cls){
  var f=c.f,h="";for(var i=0;i<f.toks.length;i++){if(i===f.a){h+='<span class="p71-blank '+(cls||"")+'">'+(fill?esc(fill):"　？　")+'</span>';i=f.z;continue;}h+=esc(f.toks[i]);}
  return h;
}
function p71Head(){var S=P71,tot=S.steps.length,p=Math.min(S.pos,tot);
  return '<div class="p71-top"><button type="button" class="p71-x" data-act="p71quit" aria-label="やめる">✕</button><div class="p71-meta"><small>'+esc(P47_THEMES[S.ti].cat)+' ・ レッスン '+(S.li+1)+' / '+S.n+'</small><div class="p71-bar"><i style="width:'+Math.round(p/tot*100)+'%"></i></div></div><span class="p71-count">'+p+'<small>/'+tot+'</small></span></div>';}
function p71WordLine(w){return '<b class="p71-ru">'+esc(w.accent||w.word)+'</b>'+(w.kana?'<small class="p71-kana">'+esc(w.kana)+'</small>':'');}
function p71Spk(t){return '<button type="button" class="p71-spk" data-act="p71say" data-val="'+esc(p71Plain(t))+'" aria-label="読み上げ"><svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8q3 4 0 8M18.5 5.5q5 6.5 0 13" stroke="currentColor" stroke-width="1.8" fill="none" stroke-linecap="round"/></svg></button>';}
function p71Opt(label,i,state,sub){return '<button type="button" class="p71-opt '+(state||"")+'" data-act="p71pick" data-val="'+i+'"><span>'+label+'</span>'+(sub?'<small>'+sub+'</small>':'')+'</button>';}
function p71Explain(x,w){
  var c=x.c,fm=c.forms,surf=p71Plain(c.f.surface),h='<div class="p71-exp"><div class="p71-exph">解説</div>';
  h+='<p><b>'+esc(w.accent||w.word)+'</b>　'+esc(w.meaning||"")+'</p>';
  var changed=p71N(surf)!==p71N(w.word);
  if(changed)h+='<p class="p71-chg"><span>辞書の形</span><b>'+esc(p71Plain(w.accent||w.word))+'</b><i>→</i><span>この文では</span><b>'+esc(surf)+'</b></p>';
  if(fm&&fm.lab[fm.key])h+='<p>この形は <b>'+esc(fm.lab[fm.key])+'</b> です。</p>';
  p71Ctx(c.f).forEach(function(t){h+='<p class="p71-hint">'+esc(t)+'</p>';});
  if(w.pos==="verb"){var sj=p71Subj(c.f);if(sj&&fm&&fm.lab[fm.key]&&!/不定形/.test(fm.lab[fm.key]))h+='<p class="p71-hint">主語は '+esc(P71_SUBJ[sj])+'。動詞の形は主語に合わせます。</p>';}
  if(w.pos==="adjective"&&fm&&fm.lab[fm.key]){var nx=null;for(var j=c.f.z+1;j<c.f.toks.length;j++){if(/[^\s,.!?;:—«»"“”()]/.test(c.f.toks[j])){nx=p71Plain(c.f.toks[j]);break;}if(/[.!?]/.test(c.f.toks[j]))break;}
    h+='<p class="p71-hint">形容詞は、説明する名詞'+(nx?'（ここでは '+esc(nx)+'）':'')+'の性・数・格に形を合わせます。'+(nx?'':'「〜は…だ」の形でも、主語の名詞に合わせます。')+'</p>';}
  if(c.why)h+='<p>'+esc(c.why)+'</p>';
  if(x.ge)h+='<p>'+esc(x.ge)+'</p>';
  if(changed&&w.changeRule&&!/この形のまま/.test(w.changeRule))h+='<p class="p71-rule">'+esc(w.changeRule)+'</p>';
  if(w.detailExp&&w.detailExp!==c.why)h+='<p class="p71-det">'+esc(w.detailExp)+'</p>';
  if(fm&&Object.keys(fm.lab).length){var rows=fm.opts.filter(function(o){return fm.lab[p71N(o)];});
    if(rows.length>1)h+='<div class="p71-tbl"><div class="p71-tblh">選択肢の見分け方</div>'+rows.map(function(o){var k=p71N(o);return '<div class="'+(k===fm.key?"on":"")+'"><b>'+esc(o)+'</b><span>'+esc(fm.lab[k])+'</span></div>';}).join("")+'</div>';}
  return h+'</div>';
}
function p71Render(){
  var m=document.getElementById("p71");if(!m){m=document.createElement("div");m.id="p71";document.body.appendChild(m);}
  var S=P71;if(!S){m.className="";m.innerHTML="";document.body.classList.remove("p70-noscroll");return;}
  document.body.classList.add("p70-noscroll");
  var h='',foot='',x=S.steps[S.pos];
  if(S.confirm){h='<div class="p71-body p71-center"><div class="p71-note"><h3>レッスンをやめますか？</h3><p>このレッスンの答えは記録されません。次はこのレッスンの最初から始まります。</p></div></div>';
    foot='<button type="button" class="p71-sec" data-act="p71stay">続ける</button><button type="button" class="p71-main" data-act="p71close">やめる</button>';}
  else if(!x){h=p71Result();foot='<button type="button" class="p71-sec" data-act="p71close">ホームへ</button><button type="button" class="p71-main" data-act="p71again">次の一歩へ</button>';}
  else{var w=WMAP[x.id];
    if(x.t==="card"){h='<div class="p71-body"><div class="p71-tag">新しい言葉 '+(S.ids.indexOf(x.id)+1)+' / '+S.ids.length+'</div><div class="p71-card">'+p71Pic(x.id,"big")+'<div class="p71-cw">'+p71WordLine(w)+p71Spk(w.accent||w.word)+'</div><div class="p71-mean">'+esc(w.meaning||"")+'</div>'+
        (w.exRu?'<div class="p71-ex"><div>'+esc(w.exRu)+p71Spk(w.exRu)+'</div><small>'+esc(w.exJa||"")+'</small></div>':'')+(w.simpleExp?'<p class="p71-cexp">'+esc(w.simpleExp)+'</p>':'')+'</div></div>';
      foot='<button type="button" class="p71-main" data-act="p71next">次へ</button>';}
    else if(x.t==="pick"){var done=S.picked!==null;
      h='<div class="p71-body"><div class="p71-tag">'+(x.rev?'おさらい・':'')+'絵と意味に合う言葉は？</div><div class="p71-q">'+p71Pic(x.id)+'<div class="p71-mean">'+esc(w.meaning||"")+'</div>'+(done&&S.picked===x.id?p71Stamp(1):done?p71Stamp(0):'')+'</div><div class="p71-opts">'+
        x.opts.map(function(o,i){var st=done?(o===x.id?"right":(o===S.picked?"wrong":"dim")):"";return p71Opt(esc(WMAP[o].accent||WMAP[o].word),i,st,done&&o!==x.id&&o===S.picked?esc(WMAP[o].meaning):"");}).join("")+'</div>'+
        (done&&S.picked!==x.id?'<div class="p71-exp"><p><b>'+esc(w.accent||w.word)+'</b>　'+esc(w.meaning||"")+'</p>'+(w.simpleExp?'<p class="p71-det">'+esc(w.simpleExp)+'</p>':'')+'</div>':'')+'</div>';
      foot=done?'<button type="button" class="p71-main" data-act="p71next">次へ</button>':'<div class="p71-wait">選んでください</div>';}
    else if(x.t==="memo"){h='<div class="p71-body"><div class="p71-tag">文法メモ</div><div class="p71-note"><h3>このあとの穴埋めで出る形</h3><p class="p71-lead">穴埋めは2段階です。①意味で言葉を選び、②文に合う形を選びます。②の手がかりを先に見ておきましょう。</p>'+
        x.memo.map(function(r){return '<div class="p71-mrow"><div class="p71-chg"><b>'+esc(p71Plain(r.w.accent||r.w.word))+'</b><i>→</i><b>'+esc(r.surf)+'</b></div>'+(r.lab?'<span>'+esc(r.lab)+'</span>':'')+r.ctx.map(function(t){return '<small>'+esc(t)+'</small>';}).join("")+'</div>';}).join("")+
        (P47_LANG!=="ky"?'<div class="p71-cases"><div class="p71-tblh">格（名詞の形）のおさらい</div>'+["nom","gen","dat","acc","ins","pre"].map(function(k){return '<div><b>'+P71_LB[k].split("「")[0]+'</b><span>「'+P71_LB[k].split("「")[1]+'</span></div>';}).join("")+'</div>':'')+
        x.units.map(function(u){var p=u.split("｜");return '<div class="p71-unit"><div class="p71-tblh">'+esc(p[0])+'</div><p>'+esc(p[1])+'</p></div>';}).join("")+'</div></div>';
      foot='<button type="button" class="p71-main" data-act="p71next">穴埋めへ</button>';}
    else{/* cloze / form */
      var c=x.c,fm=c.forms,two=x.t==="cloze",st1=two?S.picked:x.id,doneAll;
      var inStage2=!two||(S.picked===x.id&&fm),stage2Done=S.picked2!==null;
      doneAll=two?(S.picked!==null&&(S.picked!==x.id||!fm||stage2Done)):stage2Done;
      var fill=null,bcls="";
      if(doneAll){fill=p71Plain(c.f.surface);bcls=(two?(S.picked===x.id&&(!fm||p71N(S.picked2)===fm.key)):p71N(S.picked2)===fm.key)?"ok":"ng";}
      else if(inStage2&&two)fill=null;
      h='<div class="p71-body"><div class="p71-tag">'+(x.rev?'おさらい・':'')+(two?(inStage2?'② 文に合う形は？':'① 空欄に入る言葉は？'):'形の穴埋め・文に合う形は？')+'</div>'+
        '<div class="p71-paper"><div class="p71-sent">'+p71Sentence(c,fill,bcls)+'</div><div class="p71-ja">'+esc(c.ja)+'</div>'+(doneAll?p71Spk(p71Plain(c.f.toks.join(""))):'')+(doneAll?p71Stamp(bcls==="ok"):'')+'</div>';
      if(two&&!inStage2&&S.picked===null){h+='<div class="p71-opts">'+x.opts.map(function(o,i){return p71Opt(esc(WMAP[o].accent||WMAP[o].word),i,"",esc(WMAP[o].meaning));}).join("")+'</div>'+(fm||p71N(c.f.surface)!==p71N(w.word)?'<p class="p71-small">辞書の形で並んでいます。形は次で選びます。</p>':'');}
      else if(two&&S.picked!==x.id){h+='<div class="p71-opts">'+x.opts.map(function(o,i){var s=o===x.id?"right":(o===S.picked?"wrong":"dim");return p71Opt(esc(WMAP[o].accent||WMAP[o].word),i,s,esc(WMAP[o].meaning));}).join("")+'</div>';}
      else if(inStage2){h+='<div class="p71-chosen">'+(two?'<span>選んだ言葉</span><b>'+esc(w.accent||w.word)+'</b><small>'+esc(w.meaning)+'</small>':'<span>この文で使う言葉</span><b>'+esc(w.accent||w.word)+'</b><small>'+esc(w.meaning)+'</small>')+'</div>';
        h+='<div class="p71-opts">'+fm.opts.map(function(o,i){var s=stage2Done?(p71N(o)===fm.key?"right":(o===S.picked2?"wrong":"dim")):"";return p71Opt(esc(o),i,s,stage2Done&&fm.lab[p71N(o)]?esc(fm.lab[p71N(o)]):"");}).join("")+'</div>';}
      if(doneAll)h+=p71Explain(x,w);
      h+='</div>';
      foot=doneAll?'<button type="button" class="p71-main" data-act="p71next">次へ</button>':'<div class="p71-wait">選んでください</div>';}
  }
  m.innerHTML='<div class="p71-wrap">'+p71Head()+'<div class="p71-scroll">'+h+'</div><div class="p71-foot">'+foot+'</div></div>';
  m.className="show";p71FillPics(m);
  var sc=m.querySelector(".p71-scroll");if(sc&&S._top!==S.pos+"/"+S.stage){sc.scrollTop=0;S._top=S.pos+"/"+S.stage;}
  if(S.scrollExp){S.scrollExp=0;var e=m.querySelector(".p71-paper")||m.querySelector(".p71-q");if(e&&sc)setTimeout(function(){sc.scrollTop=Math.max(0,sc.scrollTop+e.getBoundingClientRect().top-sc.getBoundingClientRect().top-44);},30);}
}
function p71Result(){
  var S=P71,tot=S.ok+S.ng,rate=tot?Math.round(S.ok/tot*100):100,weak=S.ids.concat(S.rv).filter(function(id){return S.mist[id];});
  var L=p71Lessons(S.ti),dn=p71DoneCount(S.ti),lv=P47_THEMES[S.ti].level;
  return '<div class="p71-body"><div class="p71-done"><div class="p71-dart">'+(window.P70_SCENE&&P70_SCENE[lv]?P70_SCENE[lv]():"")+'</div><h3>レッスン '+(S.li+1)+' 完了</h3><p>'+esc(P47_THEMES[S.ti].cat)+' ・ '+dn+' / '+L.length+' レッスン</p></div>'+
    '<div class="p71-sum"><div><b>'+rate+'<small>%</small></b><span>1回目で正解</span></div><div><b>'+S.ids.length+'</b><span>新しい言葉</span></div><div><b>'+S.rv.length+'</b><span>おさらい</span></div></div>'+
    (weak.length?'<div class="p71-note"><div class="p71-tblh">次のレッスンのおさらいにも出る言葉</div>'+weak.map(function(id){var w=WMAP[id];return '<div class="p71-wrow"><b>'+esc(w.accent||w.word)+'</b><span>'+esc(w.meaning)+'</span></div>';}).join("")+'</div>':'<div class="p71-note"><p>まちがえた言葉はありません。習った言葉は、これからのレッスンのおさらいにも少しずつ出てきます。</p></div>')+'</div>';
}
/* ---------- 操作 ---------- */
function p71Start(ti,li){
  if(ti==null||ti<0){var R=p70Road();ti=R.cur<0?0:R.cur;}
  var S=p71Build(ti,li);if(!S){toast("このテーマには単語がありません");return;}
  try{p70ClosePage();}catch(_){}
  P71=S;p71Render();var x=S.steps[0];if(x&&x.t==="card"){var w=WMAP[x.id];setTimeout(function(){try{speak(w.accent||w.word);}catch(_){}},250);}
}
function p71Grade(x,ok){
  var S=P71,st=p71St();
  if(!S.retried[S.pos]){if(ok)S.ok++;else S.ng++;try{p23BumpMode("challenge");}catch(_){}}
  if(!ok){S.mist[x.id]=1;st.weak[x.id]=(st.weak[x.id]||0)+1;
    if(!S.retried[S.pos]&&!x.again){var cp={};for(var k in x)cp[k]=x[k];cp.again=1;if(cp.opts)cp.opts=shuffle(cp.opts.slice());if(cp.c&&cp.c.forms){cp.c=Object.assign({},cp.c,{forms:Object.assign({},cp.c.forms,{opts:shuffle(cp.c.forms.opts.slice())})});}S.steps.push(cp);}}
  else if(x.rev&&st.weak[x.id]&&!S.mist[x.id]){st.weak[x.id]--;if(st.weak[x.id]<=0)delete st.weak[x.id];}
  S.scrollExp=1;
}
function p71Pick(i){
  var S=P71,x=S&&S.steps[S.pos];if(!x)return;
  if(x.t==="pick"){if(S.picked!==null)return;S.picked=x.opts[i];p71Grade(x,S.picked===x.id);if(S.picked===x.id)try{speak(WMAP[x.id].accent||WMAP[x.id].word);}catch(_){}}
  else if(x.t==="cloze"||x.t==="form"){var fm=x.c.forms;
    if(x.t==="cloze"&&S.picked===null){S.picked=x.opts[i];var ok=S.picked===x.id;if(!ok||!fm)p71Grade(x,ok);if(ok&&!fm)try{speak(p71Plain(x.c.f.toks.join("")));}catch(_){} S.stage=1;}
    else if(fm&&S.picked2===null&&(x.t==="form"||S.picked===x.id)){S.picked2=fm.opts[i];var ok2=p71N(S.picked2)===fm.key;p71Grade(x,ok2);S.stage=2;try{speak(p71Plain(x.c.f.toks.join("")));}catch(_){}}
    else return;}
  p71Render();
}
function p71Next(){
  var S=P71;if(!S)return;S.pos++;S.picked=null;S.picked2=null;S.stage=0;
  if(S.pos>=S.steps.length){p71Finish();}
  else{var x=S.steps[S.pos];if(x.t==="card"){var w=WMAP[x.id];try{speak(w.accent||w.word);}catch(_){}}}
  p71Render();
}
function p71Finish(){
  var S=P71,st=p71St(),t=todayKey();if(S.fin)return;S.fin=1;
  st.done[p71Key(S.ti,S.li)]=t;st.last=P47_THEMES[S.ti].cat;
  S.ids.forEach(function(id){st.seen[id]=t;try{answer(id,S.mist[id]?"no":"ok");}catch(_){}});
  S.rv.forEach(function(id){st.seen[id]=t;try{answer(id,S.mist[id]?"no":"ok");}catch(_){}});
  try{saveAll();}catch(_){}
  try{p70CheckBadges();}catch(_){}
  if(S.before<p47Target()&&p47DoneToday()>=p47Target())S.cele=1;
}
function p71Close(){var S=P71;P71=null;p71Render();try{render();}catch(_){}if(S&&S.cele)setTimeout(function(){try{p53Celebrate();}catch(_){}},300);}
document.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(!/^p71/.test(a))return;e.stopImmediatePropagation();e.preventDefault();
  if(a==="p71next")p71Next();
  else if(a==="p71pick")p71Pick(+v);
  else if(a==="p71say"){try{speak(v);}catch(_){}}
  else if(a==="p71quit"){if(P71&&P71.pos>=P71.steps.length)p71Close();else if(P71&&P71.pos===0&&P71.picked===null)p71Close();else{P71.confirm=true;p71Render();}}
  else if(a==="p71stay"){P71.confirm=false;p71Render();}
  else if(a==="p71close")p71Close();
  else if(a==="p71again"){var S=P71;P71=null;var R=p70Road();var ti=p71NextIn(S.ti)>=0?S.ti:(R.cur<0?S.ti:R.cur);if(S&&S.cele)setTimeout(function(){try{p53Celebrate();}catch(_){}},300);p71Start(ti);}
  else if(a==="p71go"){p71Start(+v);}
},true);
/* ---------- 道のり：テーマの進み具合にレッスンを反映し、路線図のような見た目にする ---------- */
var _p71Road=p70Road;
p70Road=function(){var R=_p71Road();R.cur=-1;R.list.forEach(function(x){x.ln=p71Lessons(x.i).length;x.ld=p71DoneCount(x.i);if(x.ld>=x.ln)x.done=true;if(!x.done&&R.cur<0)R.cur=x.i;});return R;};
p70RoadCard=function(){
  var R=p70Road(),done=R.list.filter(function(x){return x.done;}).length,c=R.list[R.cur],ls=p71St().last;
  R.list.forEach(function(x){if(ls&&x.cat===ls&&!x.done)c=x;});
  var li=c?p71NextIn(c.i):-1;
  var bar=c?'<em class="p71-rcbar"><i style="width:'+Math.round(c.ld/c.ln*100)+'%"></i></em>':'';
  return '<button type="button" class="p70-roadcard" data-act="p71go" data-val="'+(c?c.i:0)+'"><span class="p70-rcart">'+P70_SCENE[c?c.level:P_LVLS[P_LVLS.length-1]]()+'</span><span class="p70-rctxt"><small>次の一歩 ・ '+(c?esc(c.cat):'')+'</small><b>'+(c?'レッスン '+(li+1)+' / '+c.ln+'：言葉・穴埋め・おさらい':'すべてのテーマを達成！')+'</b>'+bar+'</span><span class="p70-rcgo">›</span></button>'+
    '<button type="button" class="p71-maplink" data-act="p70road">道のり（'+done+' / '+R.list.length+' テーマ）を見る</button>';
};
p70OpenRoad=function(){
  var R=p70Road(),h='<div class="p70-phead"><b>道のり</b><button type="button" class="p70-x" data-act="p70close" aria-label="閉じる">✕</button></div><div class="p70-pbody"><p class="p70-lead">テーマは駅、レッスンは駅と駅のあいだの区間です。駅を押すと、そのテーマの次のレッスンから始まります。</p>';
  var lv="";
  R.list.forEach(function(x){
    if(x.level!==lv){if(lv)h+='</div>';lv=x.level;h+='<div class="p70-lvban"><div class="p70-lvart">'+P70_SCENE[lv]()+'</div><b>'+lv+'</b><span>'+({A1:"街かど",A2:"市場",B1:"列車の旅"}[lv]||"")+'</span></div><div class="p71-line">';}
    var st=x.done?"d":(x.i===R.cur?"c":"");
    h+='<button type="button" class="p71-stn '+st+'" data-act="p71go" data-val="'+x.i+'"'+(st==="c"?' id="p70cur"':'')+'><span class="p71-sdot">'+(x.done?'✓':'')+'</span><span class="p71-stxt"><b>'+esc(x.cat)+'</b><small>レッスン '+x.ld+' / '+x.ln+' ・ 覚えた '+x.k+' / '+x.n+' 語'+(st==="c"?' ・ いまここ':'')+'</small><em>'+Array.apply(null,Array(x.ln)).map(function(_,j){return '<i class="'+(j<x.ld?"on":"")+'"></i>';}).join("")+'</em></span></button>';
  });
  if(lv)h+='</div>';h+='</div>';
  var m=document.getElementById("p70page");if(!m){m=document.createElement("div");m.id="p70page";document.body.appendChild(m);}
  m.innerHTML=h;m.className="show";document.body.classList.add("p70-noscroll");
  setTimeout(function(){var c=document.getElementById("p70cur");if(c&&c.scrollIntoView)c.scrollIntoView({block:"center"});},60);
};
/* ---------- 見た目 ---------- */
(function(){try{var st=document.createElement("style");st.textContent=[
'#p71{position:fixed;inset:0;z-index:120;background:var(--bg,#000);display:none;color:var(--ink)}#p71.show{display:block}',
'.p71-wrap{height:100%;display:flex;flex-direction:column;max-width:560px;margin:0 auto}',
'.p71-top{display:flex;align-items:center;gap:10px;padding:calc(env(safe-area-inset-top) + 10px) 16px 10px;border-bottom:1px solid var(--line)}',
'.p71-x{flex:none;width:44px;height:44px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--ink);font-size:16px}',
'.p71-meta{flex:1;min-width:0}.p71-meta small{display:block;font-size:11.5px;color:var(--muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:5px}',
'.p71-bar{height:4px;background:var(--line);border-radius:2px;overflow:hidden}.p71-bar i{display:block;height:100%;background:var(--accent);transition:width .3s}',
'.p71-count{flex:none;font-weight:800;font-size:16px;font-variant-numeric:tabular-nums}.p71-count small{font-size:11px;color:var(--muted);font-weight:600}',
'.p71-scroll{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch}',
'.p71-body{padding:14px 16px 24px}.p71-center{display:flex;align-items:center;min-height:100%}',
'.p71-foot{display:flex;gap:10px;padding:10px 16px calc(env(safe-area-inset-bottom) + 12px);border-top:1px solid var(--line);background:var(--bg,#000)}',
'.p71-main,.p71-sec{flex:1;min-height:52px;border-radius:14px;font:inherit;font-size:16px;font-weight:700}.p71-main{background:var(--accent);border:1px solid var(--accent);color:#fff}.p71-sec{background:var(--card);border:1px solid var(--line);color:var(--ink)}',
'.p71-wait{flex:1;min-height:52px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:13px}',
'.p71-tag{display:inline-block;font-size:12px;font-weight:700;color:var(--accent);margin-bottom:10px;letter-spacing:.02em}',
'.p71-card,.p71-q,.p71-note{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:16px;position:relative}',
'.p71-card{display:flex;flex-direction:column;align-items:center;text-align:center;gap:8px}.p71-pic.big svg{width:150px!important;height:150px!important}.p71-pic.big{min-height:120px;font-size:84px;line-height:1}',
'.p71-cw{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center}.p71-ru{font-size:26px;font-weight:800}.p71-kana{font-size:13px;color:var(--muted);width:100%}',
'.p71-mean{font-size:17px;font-weight:700}.p71-ex{width:100%;text-align:left;background:var(--card2,rgba(127,127,127,.08));border-radius:12px;padding:10px 12px;font-size:15px;line-height:1.6}.p71-ex>div{display:flex;align-items:center;justify-content:space-between;gap:6px}.p71-ex small{display:block;color:var(--muted);font-size:13px}',
'.p71-cexp{font-size:13px;color:var(--muted);line-height:1.7;text-align:left;margin:2px 0 0}',
'.p71-spk{flex:none;width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:transparent;color:var(--accent);display:inline-flex;align-items:center;justify-content:center}',
'.p71-q{display:flex;flex-direction:column;align-items:center;gap:6px;margin-bottom:12px}.p71-q .p71-pic svg{width:110px!important;height:110px!important}.p71-q .p71-pic{font-size:64px;min-height:90px}',
'.p71-opts{display:flex;flex-direction:column;gap:8px}',
'.p71-opt{display:flex;flex-direction:column;align-items:flex-start;text-align:left;gap:2px;width:100%;min-height:52px;padding:10px 14px;border-radius:12px;border:1px solid var(--line);border-left:4px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:17px;font-weight:600}',
'.p71-opt small{font-size:12px;color:var(--muted);font-weight:500}.p71-opt.right{border-color:#2F9E6E;border-left-color:#2F9E6E}.p71-opt.right span:before{content:"○ ";color:#2F9E6E}',
'.p71-opt.wrong{border-color:#C8553D;border-left-color:#C8553D}.p71-opt.wrong span:before{content:"× ";color:#C8553D}.p71-opt.dim{opacity:.5}',
'.p71-paper{position:relative;border-radius:14px;padding:16px 16px 14px 26px;margin-bottom:12px;background-color:var(--card);border:1px solid var(--line);background-image:repeating-linear-gradient(transparent 0 33px,rgba(127,127,127,.18) 33px 34px);background-position:0 12px}',
'.p71-paper:before{content:"";position:absolute;left:14px;top:0;bottom:0;width:1.5px;background:rgba(217,79,69,.45)}',
'.p71-sent{font-size:20px;line-height:34px;font-weight:600;padding-right:46px}.p71-ja{font-size:13.5px;color:var(--muted);line-height:1.6;margin-top:4px}',
'.p71-paper .p71-spk{position:absolute;right:8px;bottom:8px}',
'.p71-blank{display:inline-block;min-width:64px;padding:0 6px;border-bottom:2.5px solid var(--accent);color:var(--accent);text-align:center;line-height:28px}.p71-blank.ok{color:#2F9E6E;border-color:#2F9E6E}.p71-blank.ng{color:#C8553D;border-color:#C8553D}',
'.p71-stamp{position:absolute;right:6px;top:6px;width:44px;height:44px;animation:p71in .35s ease-out}@keyframes p71in{0%{transform:scale(1.6) rotate(-20deg);opacity:0}100%{transform:none;opacity:1}}',
'.p71-small{font-size:12px;color:var(--muted);margin:8px 2px 0}',
'.p71-chosen{display:flex;align-items:baseline;gap:8px;flex-wrap:wrap;margin:0 0 10px;font-size:13px;color:var(--muted)}.p71-chosen b{font-size:17px;color:var(--ink)}',
'.p71-exp{margin-top:14px;background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px;font-size:14.5px;line-height:1.75}.p71-exp p{margin:0 0 8px}.p71-exp p:last-child{margin-bottom:0}',
'.p71-exph,.p71-tblh{font-size:12px;font-weight:800;color:var(--accent);margin-bottom:6px;letter-spacing:.04em}',
'.p71-chg{display:flex;align-items:center;flex-wrap:wrap;gap:6px}.p71-chg span{font-size:11.5px;color:var(--muted)}.p71-chg b{font-size:16px}.p71-chg i{font-style:normal;color:var(--accent);font-weight:800}',
'.p71-hint{background:rgba(59,130,196,.12);border-radius:10px;padding:6px 10px}.p71-rule,.p71-det{color:var(--muted);font-size:13.5px}',
'.p71-tbl,.p71-cases{margin-top:8px;border-top:1px solid var(--line);padding-top:8px}.p71-tbl>div:not(.p71-tblh),.p71-cases>div:not(.p71-tblh){display:flex;gap:10px;padding:4px 0;font-size:13.5px}.p71-tbl b,.p71-cases b{min-width:92px}.p71-tbl span,.p71-cases span{color:var(--muted)}.p71-tbl .on b{color:#2F9E6E}',
'.p71-note h3{margin:0 0 6px;font-size:17px}.p71-lead{font-size:13.5px;color:var(--muted);line-height:1.7;margin:0 0 10px}',
'.p71-mrow{border-top:1px solid var(--line);padding:8px 0;display:flex;flex-direction:column;gap:3px}.p71-mrow span{font-size:13px;font-weight:700}.p71-mrow small{font-size:12.5px;color:var(--muted);line-height:1.6}',
'.p71-unit{margin-top:10px;border-top:1px solid var(--line);padding-top:8px}.p71-unit p{font-size:13.5px;line-height:1.75;margin:0;white-space:pre-line}',
'.p71-done{text-align:center}.p71-dart{height:120px;border-radius:16px;overflow:hidden;margin-bottom:10px}.p71-dart svg{width:100%;height:100%;display:block}.p71-done h3{margin:4px 0;font-size:22px}.p71-done p{margin:0 0 12px;color:var(--muted);font-size:13px}',
'.p71-sum{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px}.p71-sum>div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:10px;text-align:center}.p71-sum b{font-size:24px;font-weight:800}.p71-sum small{font-size:12px}.p71-sum span{display:block;font-size:11.5px;color:var(--muted)}',
'.p71-wrow{display:flex;gap:10px;padding:5px 0;border-top:1px solid var(--line);font-size:14px}.p71-wrow span{color:var(--muted)}',
'.p71-rcbar{display:block;height:4px;border-radius:2px;background:var(--line);margin-top:6px;overflow:hidden}.p71-rcbar i{display:block;height:100%;background:var(--accent)}',
'.p70-rctxt b{white-space:normal!important;font-size:14px!important;line-height:1.35}',
'.p71-maplink{display:block;width:100%;margin:-4px 0 10px;padding:8px 0;min-height:40px;background:none;border:none;color:var(--accent);font:inherit;font-size:13px;text-align:right}',
/* 路線図 */
'.p71-line{position:relative;padding:6px 0 6px 0}.p71-line:before{content:"";position:absolute;left:21px;top:0;bottom:0;width:6px;border-radius:3px;background:var(--line)}',
'.p71-stn{position:relative;display:flex;align-items:flex-start;gap:12px;width:100%;padding:10px 0;background:none;border:none;color:var(--ink);font:inherit;text-align:left}',
'.p71-sdot{flex:none;position:relative;z-index:1;width:30px;height:30px;margin-left:9px;border-radius:8px;background:var(--bg,#000);border:3px solid var(--lineStrong,var(--line));display:flex;align-items:center;justify-content:center;color:#fff;font-weight:900;font-size:14px}',
'.p71-stn.d .p71-sdot{background:var(--accent);border-color:var(--accent)}.p71-stn.c .p71-sdot{border-color:var(--accent);box-shadow:0 0 0 5px rgba(127,127,127,.18)}.p71-stn.c .p71-sdot:after{content:"";width:10px;height:10px;border-radius:3px;background:var(--accent)}',
'.p71-stxt{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}.p71-stxt b{font-size:15px}.p71-stn.c .p71-stxt b{color:var(--accent)}.p71-stxt small{font-size:11.5px;color:var(--muted)}',
'.p71-stxt em{display:flex;flex-wrap:wrap;gap:3px;margin-top:3px}.p71-stxt em i{width:12px;height:4px;border-radius:1px;background:var(--line)}.p71-stxt em i.on{background:var(--accent)}'
].join("");document.head.appendChild(st);}catch(_){}})();
