/* ===== PHASE83（2026-11-26 Yutaさんの要望）=====
   1) 開くたびに出ていた「バッジ獲得！」をやめる
   2) 開くたびに最初の説明画面（オンボーディング）に戻るのを直し、前に見ていた画面から再開する
   3) 冒険の画面をシンプルにする
   4) 穴埋めを少しやさしく（形の選択肢を4つ→3つ、形だけの問題は1レッスン1問、答える前のヒント）
   5) 2段階の穴埋めは、最初に「2回選ぶ」ことがわかる案内をつけ、解説の最初に「ひとことで」まとめを出す
   6) こどもモード：日本語にふりがな、日本語の文の読み上げボタン
   原因（1と2）：オンボーディング済みの印とバッジの記録が「この端末の保存（localStorage）」にしかなく、
   公開ページでは端末の保存が消えることがあるため。どちらもクラウド保存される settings にも入れるようにした。 */

/* ---------- 共通 ---------- */
function p83Save(){try{saveAll();}catch(_){}}
function p83HasData(){try{return Object.keys(progress||{}).length>0||Object.keys(cprogress||{}).length>0;}catch(_){return false;}}
function p83Cloud(){return typeof P50==="undefined"||P50.state!=="connecting";}/* クラウドの確認が終わったか */

/* ---------- 2) オンボーディング：一度見たら二度と出さない ---------- */
var _p83Onb=renderOnboardHost;
renderOnboardHost=function(){
  try{
    if(!lget(K.onb,false)){
      if(settings.p83Onb||p83HasData()){lset(K.onb,true);}            /* クラウドに「見た」記録がある／学習記録がある → 出さない */
      else if(!p83Cloud()){var host=document.getElementById("onboardHost");if(host)host.innerHTML="";return;} /* クラウドを読み終えるまで待つ */
    }
  }catch(_){}
  return _p83Onb.apply(this,arguments);
};
document.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act");
  if(a==="onbskip"||a==="onbfinish"){settings.p83Onb=1;p83Save();}
},true);

/* ---------- 1) バッジのお祝い：開いたときは出さない。レッスンを終えた直後に、新しく取ったものだけ ---------- */
var P83_LOUD=0;
p70CheckBadges=function(){
  try{var S=p70Stats(),e=p70Earned(S),fresh=[],sb=settings.p83B||{},ch=false;
    Object.keys(sb).forEach(function(k){if(!p70Store.badges[k])p70Store.badges[k]=sb[k];});
    p70Store.known[todayKey()]=S.known;
    e.forEach(function(b){if(!p70Store.badges[b[0]]){p70Store.badges[b[0]]=todayKey();fresh.push(b);}});
    p70Store.init=1;p70Save();
    Object.keys(p70Store.badges).forEach(function(k){if(sb[k]!==p70Store.badges[k]){sb[k]=p70Store.badges[k];ch=true;}});
    settings.p83B=sb;if(ch&&p83Cloud())p83Save();
    /* お祝いを出すのは「レッスンを終えた直後」かつ「クラウドの記録を読み終えたあと」だけ */
    if(P83_LOUD&&p83Cloud()&&fresh.length&&!document.querySelector("#p48modal.show"))setTimeout(function(){p70ShowBadge(fresh);},400);
  }catch(_){}
};
var _p83Fin=p71Finish;
p71Finish=function(){P83_LOUD=1;try{return _p83Fin.apply(this,arguments);}finally{P83_LOUD=0;}};
var _p83Start=p71Start;
p71Start=function(){try{p70CheckBadges();}catch(_){}return _p83Start.apply(this,arguments);};/* 始める前の状態を記録（終わったときに差だけ出す） */

/* ---------- 2) 前に見ていた画面から再開 ---------- */
var P83_LKEY=K.set+"_p83last",P83_TOUCHED=0,P83_READY=0,P83_CLOUDLAST=null;
/* クラウドから届いた「前の画面」を受け取っておく（読み込み直後の描き直しで上書きされないように） */
if(typeof p50Adopt==="function"){var _p83Ad=p50Adopt;p50Adopt=function(id,obj){try{if(id==="settings"&&obj&&obj.p83Last)P83_CLOUDLAST=obj.p83Last;}catch(_){}return _p83Ad.apply(this,arguments);};}
function p83Here(){
  var g=document.getElementById("p72g"),pg=document.getElementById("p70page");
  if(g&&g.className&&typeof P72G!=="undefined"&&P72G)return {v:"guide",g:P72G.id||""};
  if(pg&&/show/.test(pg.className)&&typeof p74Story==="function"&&p74Story())return {v:"adv"};
  return {v:"home"};
}
function p83Remember(){
  if(!P83_READY&&!P83_TOUCHED)return;/* 開いた直後（前の画面に戻す前）は覚えない */
  try{var L=p83Here();L.b=ui.bnav;var o=settings.p83Last||{};
    if(o.v===L.v&&o.g===L.g&&o.b===L.b)return;
    settings.p83Last=L;lset(P83_LKEY,L);
    if(p83Cloud())p83Save();/* 端末とクラウドの両方に保存 */
  }catch(_){}
}
function p83Restore(L){
  if(!L||P83_TOUCHED)return;
  try{
    var ob=document.getElementById("onboardHost");if(ob&&ob.innerHTML)return;
    if(L.b&&L.b!==ui.bnav&&["home","wordbook","profile","review"].indexOf(L.b)>=0){ui.bnav=L.b;render();}
    var now=p83Here();
    if(L.v==="adv"&&now.v!=="adv")p70OpenRoad();
    else if(L.v==="guide"&&!(now.v==="guide"&&now.g===L.g))p72GuideOpen(L.g||null);
  }catch(_){}
}
/* 画面が変わったら覚える */
(function(){
  var r=render;render=function(){var o=r.apply(this,arguments);setTimeout(p83Remember,0);return o;};
  var a=p74Open;p74Open=function(){var o=a.apply(this,arguments);setTimeout(p83Remember,0);return o;};
  var c=p70ClosePage;p70ClosePage=function(){var o=c.apply(this,arguments);setTimeout(p83Remember,0);return o;};
  var g=p72GuideRender;p72GuideRender=function(){var o=g.apply(this,arguments);setTimeout(p83Remember,0);return o;};
})();
/* 開いた直後：この端末の記録で戻す → クラウドを読み終えたら、まだ何も触っていなければクラウドの記録で戻す */
document.addEventListener("pointerdown",function(){P83_TOUCHED=1;},true);
setTimeout(function(){p83Restore(lget(P83_LKEY,null)||settings.p83Last);},60);
(function wait(n){
  if(p83Cloud()){try{renderOnboardHost();}catch(_){}p83Restore(P83_CLOUDLAST||settings.p83Last);P83_READY=1;setTimeout(p83Remember,300);try{p70CheckBadges();}catch(_){}return;}
  if(n<60)setTimeout(function(){wait(n+1);},250);else P83_READY=1;
})(0);

/* ---------- 3) 冒険の画面をシンプルに ---------- */
var P83_OPEN={};/* 開いている章（いまの章は最初から開く） */
p74Main=function(){
  var P=p74Path(),S=p74State(),st=S.stage,h='',l=p75Lv(),c=S.cur;
  if(P74_VIEW==="read"&&P.story)return '<button type="button" class="p74-rtop" data-act="p74tab" data-val="map">‹ 冒険の画面にもどる</button>'+p74Reader(P,S);
  var nb=S.ch.filter(function(x){return !x.beat;})[0];
  /* いまの姿と、次にやること（1枚にまとめる） */
  h+='<div class="p83-top" style="--pc:'+P.color+'"><div class="p83-fig">'+p74Hero(P,st,"p83-hero")+'</div><div class="p83-info"><small>'+esc(P.name)+'</small><b>'+esc(P.titles[st])+'</b>'+
     '<span class="p83-lv">難易度 <em>'+'★'.repeat(l)+'</em><i>'+'★'.repeat(5-l)+'</i></span></div></div>';
  if(c){h+='<button type="button" class="p83-go" data-act="p71go" data-val="'+c.i+'"><b>次のレッスンへ</b><small>テーマ「'+esc(c.cat)+'」 ・ 完了 '+c.ld+' / '+c.ln+'</small></button>';}
  else h+='<div class="p83-goal">この道はすべてクリアしました！</div>';
  if(nb)h+='<p class="p83-goal">次の目標：'+(P.ev?'':'ボス')+'「'+esc(p74BossName(P,nb.c))+'」'+(P.ev?'をクリア':'を倒す')+'（あと '+(nb.need-nb.done)+' テーマ）</p>';
  h+='<div class="p83-links">'+(P.story?'<button type="button" data-act="p74ri" data-val="'+Math.min(st,8)+'">物語を読む</button>':'')+'<button type="button" data-act="p74choose">道を変える</button><button type="button" data-act="p75lv">難易度</button></div>';
  /* タブは4つ（装備・技・仲間は「集めたもの」にまとめる） */
  var v=P74_VIEW||"map";if(v==="gear"||v==="skill"||v==="ally")v="got";
  var tabs=[["map","地図"]];if(P.story)tabs.push(["story","物語"]);if(P.hist)tabs.push(["ex","例文"]);tabs.push(["got","持ち物"]);
  h+='<div class="p74-tabs">'+tabs.map(function(t){return '<button type="button" data-act="p74tab" data-val="'+t[0]+'" class="'+(v===t[0]?"on":"")+'">'+t[1]+'</button>';}).join("")+'</div>';
  if(v==="map"){
    var curc=nb?nb.c:-1;
    S.ch.forEach(function(ch){var ct=P.story&&P.story[ch.c+1]?P.story[ch.c+1].t.replace(/^[^　]+　/,""):P74_BOSS[ch.c].t+"の地",open=P83_OPEN[ch.c]!=null?P83_OPEN[ch.c]:ch.c===curc;
      var td=ch.themes.filter(function(x){return x.done;}).length;
      h+='<div class="p83-ch'+(open?" open":"")+'"><button type="button" class="p83-chh" data-act="p83ch" data-val="'+ch.c+'">'+(typeof p84Row==="function"?'<span class="p84-tt"><span class="p84-tl"><small>第'+(ch.c+1)+'章</small><b>'+esc(ct)+'</b>'+p84Clear(ch)+'</span>'+p84Row(ch)+'</span>':'<small>第'+(ch.c+1)+'章</small><b>'+esc(ct)+'</b><span>'+(ch.beat?'✓ クリア':td+' / '+ch.themes.length)+'</span>')+'<i>'+(open?'−':'＋')+'</i></button>';
      if(open){
        ch.themes.forEach(function(x){var st2=x.done?"d":(c&&x.i===c.i?"c":"");
          h+='<button type="button" class="p83-row '+st2+'" data-act="p71go" data-val="'+x.i+'">'+(x.done&&typeof p84Stamp==="function"?'<span class="p83-dot p84d">'+p84Stamp(true,x.i-ch.from,p84Ink(),false)+'</span>':'<span class="p83-dot">'+(x.done?'✓':'')+'</span>')+'<span class="p83-rtx"><b>'+esc(x.cat)+'</b><small>'+(x.done?P.verb:'完了 '+x.ld+' / '+x.ln)+(st2==="c"?' ・ いまここ':'')+'</small></span></button>';});
        h+='<div class="p83-boss'+(ch.beat?" beat":"")+'"><small>'+(P.ev?'この章の大きな出来事':'ボス')+'</small><b>'+esc(p74BossName(P,ch.c))+'</b><span>'+(ch.beat?P.verb+'！':'この章のテーマを全部終えると'+(P.ev?'クリア':'倒せます'))+'</span></div>';}
      h+='</div>';});
  }else if(v==="story"&&P.story){h+=p74StoryTab(P,S);
  }else if(v==="ex"&&P.hist){h+=p74ExTab(P,S);
  }else{
    h+='<div class="p83-sub">装備 <small>'+S.gear+' / '+P.gear.length+'</small></div><div class="p74-list">'+P.gear.map(function(g,i){var on=i<S.gear;var how=i===0?"はじめの持ち物":(i%2?"第"+((i+1)/2)+"章"+(P.ev?"の出来事を半分クリア":"の敵を半分倒す"):"第"+(i/2)+"章"+(P.ev?"をクリア":"のボスを倒す"));
      return '<div class="p74-li'+(on?"":" off")+'"><span class="p74-gi">'+(on?'★':'？')+'</span><span><b>'+(on?esc(g):'？？？')+'</b><small>'+how+'</small></span></div>';}).join("")+'</div>';
    h+='<div class="p83-sub">技 <small>'+S.skills+' / '+P.sk.length+'</small></div><div class="p74-list">'+P.sk.map(function(k,i){var on=i<S.skills;return '<div class="p74-li'+(on?"":" off")+'"><span class="p74-gi">'+(on?'✦':'？')+'</span><span><b>'+(on?esc(k):'？？？')+'</b><small>'+(P.ev?'「':'ボス「')+esc(p74BossName(P,i))+(P.ev?'」をクリアすると覚える':'」を倒すと覚える')+'</small></span></div>';}).join("")+'</div>';
    var need=[1,2,4,6,8];
    h+='<div class="p83-sub">仲間 <small>'+S.allies+' / '+P.al.length+'</small></div><div class="p74-allies">'+P.al.map(function(a,i){var on=i<S.allies;return '<div class="p74-ac'+(on?"":" off")+'">'+p74AllyArt(a,"p74-aimg2")+'<b>'+(on?esc(a.n):'？？？')+'</b><small>'+(on?esc(a.r):(P.ev?need[i]+'つの章をクリアすると仲間に':'ボスを'+need[i]+'体倒すと仲間に'))+'</small></div>';}).join("")+'</div>';
  }
  h+='<div class="p74-foot"><button type="button" data-act="p74plain">ストーリーなしにする</button></div>';
  return h;
};
document.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="p83ch"){e.stopImmediatePropagation();e.preventDefault();
    var S=p74State(),nb=S.ch.filter(function(x){return !x.beat;})[0],k=+v,open=P83_OPEN[k]!=null?P83_OPEN[k]:(nb&&nb.c===k);P83_OPEN[k]=!open;
    var sc=document.querySelector("#p70page .p70-pbody"),y=sc?sc.scrollTop:0;p74Open(false);var sc2=document.querySelector("#p70page .p70-pbody");if(sc2)sc2.scrollTop=y;}
},true);

/* ---------- 4) 穴埋めを少しやさしく ---------- */
/* 形の選択肢は3つまで（正解＋まぎらわしい形2つ） */
var _p83Forms=p71Forms;
p71Forms=function(w,f){var r=_p83Forms.apply(this,arguments);
  if(r&&r.opts&&r.opts.length>3){var others=r.opts.filter(function(o){return p71N(o)!==r.key;});r.opts=shuffle([r.ans].concat(others.slice(0,2)));}
  return r;};
/* 作文の文から作る「形だけ」の問題は1レッスン1問、いちばん短い文 */
var _p83Build=p71Build;
p71Build=function(){var S=_p83Build.apply(this,arguments);
  try{if(S&&S.steps){var fs=S.steps.filter(function(x){return x.t==="form"&&!x.again;});
    if(fs.length>1){var keep=fs.slice().sort(function(a,b){return a.c.f.toks.join("").length-b.c.f.toks.join("").length;})[0];
      S.steps=S.steps.filter(function(x){return x.t!=="form"||x===keep;});}}}catch(_){}
  return S;};

/* ---------- 5) 2段階の案内・ヒント・解説の「ひとことで」 ---------- */
var P83_CASEJA={"主格":"「〜は・〜が」の形","生格":"「〜の」の形。数や量、否定のあとにも使う","与格":"「〜に」の形","対格":"「〜を」の形","造格":"「〜で（道具）・〜として・〜と一緒に」の形","前置格":"「〜で（場所）・〜について」の形"};
function p83CaseNote(lab){if(!lab)return "";var k=Object.keys(P83_CASEJA).filter(function(c){return lab.indexOf(c)===0||lab.indexOf(c)>=0&&lab.length<12;})[0];return k?P83_CASEJA[k]:"";}
function p83Hint(x){/* 答える前に出せるヒント（答えそのものは言わない） */
  var c=x.c,w=WMAP[x.id],out=[];
  try{p71Ctx(c.f).forEach(function(t){out.push(esc(t));});}catch(_){}
  if(!out.length&&w&&w.pos==="verb"){var sj=null;try{sj=p71Subj(c.f);}catch(_){}
    out.push(sj?'この文の主語は <b>'+esc(P71_SUBJ[sj])+'</b> です。動詞の語尾は主語に合わせて変わります。':'動詞の語尾は、だれがするか（主語）や、いつのことか（現在・過去）で変わります。日本語の訳を手がかりにしましょう。');}
  if(!out.length&&w&&w.pos==="adjective")out.push('形容詞は、うしろの名詞の「性（男性・女性・中性）」と「数」と「格」に合わせて語尾が変わります。');
  if(!out.length){out.generic=1;out.push(w&&w.pos==="noun"?'日本語の訳で、この言葉に「は・を・に・の・で」のどれがついているかを見てみましょう。':'日本語の訳を手がかりに、文に合う形を選びましょう。');}
  return out;
}
function p83Steps(n,two){
  if(!two)return '<div class="p83-how"><b>この問題は「形」だけを選びます</b><span>使う言葉は決まっています。文に合う形（語尾）を選びます。</span></div>';
  return '<div class="p83-how"><b>'+(n===1?'2回選ぶ問題です':'① 正解！ つぎは ② 文に合う形（語尾）を選びます')+'</b><div class="p83-steps"><span class="'+(n===1?"on":"ok")+'">'+(n===1?'①':'✓')+' 意味に合う言葉</span><i>→</i><span class="'+(n===2?"on":"")+'">② 文に合う形（語尾）</span></div></div>';
}
function p83KyText(h){return h;}
var _p83R=p71Render;
p71Render=function(){
  var o=_p83R.apply(this,arguments);
  try{var S=P71,m=document.getElementById("p71"),x=S&&!S.confirm&&S.steps[S.pos];
    if(m&&x&&!x.m&&(x.t==="cloze"||x.t==="form")){
      var fm=x.c.forms,two=x.t==="cloze"&&!!fm,tag=m.querySelector(".p71-tag"),row=tag&&(tag.closest(".p72-tagrow")||tag);
      var stage2=x.t==="form"||(S.picked===x.id&&fm),answered=x.t==="form"?S.picked2!==null:(S.picked!==null&&(S.picked!==x.id||!fm||S.picked2!==null));
      if(!answered&&row&&(two||x.t==="form")){row.insertAdjacentHTML("afterend",p83KyText(p83Steps(stage2?2:1,two)));
        var sm=m.querySelector(".p71-small");if(sm)sm.remove();}
      /* ② の前にヒント（押すと開く） */
      var gh=m.querySelector(".p75-ghint");
      if(!answered&&!stage2&&two&&gh)gh.remove();
      if(!answered&&stage2&&fm){var op=m.querySelector(".p71-opts");
        if(op){op.insertAdjacentHTML("beforebegin",'<details class="p83-hint"><summary>ヒントを見る</summary><p class="p83-why">'+(P47_LANG==="ky"?'キルギス語は、言葉の終わりに語尾（〜に・〜を・〜の など）をつけて、文の中での役わりを表します。':'ロシア語は、文の中での役わり（「〜は」「〜を」「〜に」など）によって、言葉の終わり（語尾）が変わります。')+'</p>'+p83Hint(x).map(function(t){return '<p>'+t+'</p>';}).join("")+'</details>');
          if(gh){var d=m.querySelector(".p83-hint");gh.querySelectorAll("button").forEach(function(b){d.appendChild(b);});gh.remove();}}}
      /* 答えたあと：解説の最初に「ひとことで」 */
      if(answered){var ex=m.querySelector(".p71-exp");if(ex&&!ex.querySelector(".p83-sum"))ex.insertAdjacentHTML("afterbegin",p83Sum(x,S));
        /* 解説の見出しの ①②③ は問題の①②とまぎらわしいので外す */
        m.querySelectorAll(".p72-sh").forEach(function(s){s.textContent=s.textContent.replace(/^[①②③④⑤]\s*/,"");});}
    }
    if(m&&settings.p83Kids)p83Kids(m);
    if(m&&x&&!S.confirm)p83KidsBtn(m);
  }catch(_){}
  return o;
};
function p83Lab(w,fm,surf,key,any){/* その形の名前（例：対格）。いくつか候補があるときは、ヒントの文に出てくる格を選ぶ */
  var l=(fm&&fm.lab[key])||"";try{if(!l&&typeof p72FormName==="function")l=p72FormName(w,surf)||"";}catch(_){}
  if(!any&&l.indexOf("・")>0&&P71){var x=P71.steps[P71.pos],t=x?p83Hint(x).join(""):"",k=l.split("・").filter(function(q){return t.indexOf(q.replace(/複数$/,""))>=0;});if(k.length===1)l=k[0];}
  if(!any&&P71){var x2=P71.steps[P71.pos],m2=x2?/(生格|与格|対格|造格|前置格)/.exec(p83Hint(x2).join("")):null;
    if(m2&&l==="主格"&&m2[1]==="対格")l="対格（この言葉は辞書の形と同じ形）";}
  return l;
}
function p83Sum(x,S){
  var c=x.c,fm=c.forms,w=WMAP[x.id],surf=p71Plain(c.f.surface),lab=p83Lab(w,fm,surf,fm?fm.key:""),h='<div class="p83-sum"><div class="p83-sumh">ひとことで</div>';
  var miss1=x.t==="cloze"&&S.picked!==x.id;
  if(miss1&&S.picked&&WMAP[S.picked])h+='<p>選んだ <b>'+esc(WMAP[S.picked].accent||WMAP[S.picked].word)+'</b> は「'+esc(WMAP[S.picked].meaning)+'」。この文に合う言葉は <b>'+esc(w.accent||w.word)+'</b>（'+esc(w.meaning)+'）でした。</p>';
  h+='<p>答えは <b>'+esc(surf)+'</b>。'+(p71N(surf)!==p71N(w.word)?'辞書の形 <b>'+esc(p71Plain(w.accent||w.word))+'</b> の語尾が変わった形です。':'辞書の形のままです。')+'</p>';
  if(lab){var cn=p83CaseNote(lab);h+='<p>この形は <b>'+esc(lab)+'</b>'+(cn?'（'+esc(cn)+'）':'')+'です。</p>';}
  var hs=fm?p83Hint(x):[];if(hs.length&&fm&&!hs.generic)h+='<p>'+hs[0]+'</p>';
  if(fm&&S.picked2&&p71N(S.picked2)!==fm.key){var l2=p83Lab(w,fm,S.picked2,p71N(S.picked2),1);h+='<p>選んだ <b>'+esc(S.picked2)+'</b> は'+(l2?' <b>'+esc(l2)+'</b>'+(p83CaseNote(l2)?'（'+esc(p83CaseNote(l2))+'）':'')+' の形':'この文には合わない形')+'でした。</p>';}
  return h+'<small>くわしい説明は下にあります。</small></div>';
}

/* ---------- 6) こどもモード：ふりがなと日本語の読み上げ ---------- */
var P83_FURI=/*P83F*/{"d":{},"x":{}}/*P83FE*/;
var P83_ML=0;(function(){for(var k in P83_FURI.d)if(k.length>P83_ML)P83_ML=k.length;})();
var P83_KAN=/[一-龯々〆ヶ]/;
function p83Ruby(sf,rd){/* 送りがなはルビの外に出す（例：行き→ 行(い)き） */
  var a=sf,b=rd,tail="",head="";
  while(a.length>1&&b.length>1&&!P83_KAN.test(a.slice(-1))&&a.slice(-1)===b.slice(-1)){tail=a.slice(-1)+tail;a=a.slice(0,-1);b=b.slice(0,-1);}
  while(a.length>1&&b.length>1&&!P83_KAN.test(a[0])&&a[0]===b[0]){head+=a[0];a=a.slice(1);b=b.slice(1);}
  return esc(head)+'<ruby>'+esc(a)+'<rt>'+esc(b)+'</rt></ruby>'+esc(tail);
}
function p83FuriHtml(t){
  var key=t.trim(),X=P83_FURI.x[key],out="",i=0;
  if(X){X.forEach(function(p){var j=t.indexOf(p[0],i);if(j<0)return;out+=esc(t.slice(i,j))+p83Ruby(p[0],p[1]);i=j+p[0].length;});return out+esc(t.slice(i));}
  var D=P83_FURI.d;
  while(i<t.length){var hit=0;
    if(P83_KAN.test(t[i])||(i+1<t.length&&P83_KAN.test(t.slice(i,i+P83_ML)))){
      for(var L=Math.min(P83_ML,t.length-i);L>0;L--){var k=t.substr(i,L);if(D[k]&&P83_KAN.test(k)){out+=p83Ruby(k,D[k]);i+=L;hit=1;break;}}}
    if(!hit){out+=esc(t[i]);i++;}}
  return out;
}
function p83Kids(root){
  if(!root||!root.querySelectorAll)return;
  var tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,null),list=[],n;
  while((n=tw.nextNode())){if(!P83_KAN.test(n.nodeValue))continue;var p=n.parentNode;if(!p||p.closest("ruby,script,style,textarea,.p83-f,.p83-nf,svg"))continue;list.push(n);}
  list.forEach(function(n){var s=document.createElement("span");s.className="p83-f";s.innerHTML=p83FuriHtml(n.nodeValue);n.parentNode.replaceChild(s,n);});
  /* 日本語の文に読み上げボタン */
  root.querySelectorAll(".p71-ja,.p71-mean,.p71-ex small,.p53-clozeja,.p52-q.ja").forEach(function(el){
    if(el.querySelector(".p83-jspk")||!el.textContent.trim())return;
    var t=el.textContent.replace(/\s+/g," ").trim();
    var tt=el.cloneNode(true);tt.querySelectorAll("rt").forEach(function(r){r.remove();});t=tt.textContent.trim();
    el.insertAdjacentHTML("beforeend",' <button type="button" class="p83-jspk" data-act="p83ja" data-val="'+esc(t)+'" aria-label="日本語を読み上げ">🔈<small>よむ</small></button>');});
}
function p83KidsBtn(m){
  var row=m.querySelector(".p72-tagrow")||m.querySelector(".p71-tag");if(!row||m.querySelector(".p83-kbtn"))return;
  var b='<button type="button" class="p83-kbtn'+(settings.p83Kids?" on":"")+'" data-act="p83kids" aria-pressed="'+(settings.p83Kids?"true":"false")+'">'+(settings.p83Kids?'ふりがな ON':'ふりがな')+'</button>';
  if(row.classList.contains("p72-tagrow")){var fav=row.querySelector(".p72-fav");if(fav)fav.insertAdjacentHTML("beforebegin",b);else row.insertAdjacentHTML("beforeend",b);}
  else row.insertAdjacentHTML("afterend",'<div class="p83-krow">'+b+'</div>');
}
function p83SayJa(t){
  try{var ss=window.speechSynthesis;if(!ss){toast("この端末では読み上げが使えません");return;}ss.cancel();
    var u=new SpeechSynthesisUtterance(t);u.lang="ja-JP";u.rate=0.9;var vs=ss.getVoices().filter(function(v){return /^ja/i.test(v.lang);});if(vs.length)u.voice=vs[0];
    else if(ss.getVoices().length)toast("日本語の声が見つかりません（端末の設定で追加できます）");
    ss.speak(u);}catch(_){toast("読み上げできませんでした");}
}
/* 4択クイズ（まとめて周回など）の画面にも、こどもモードを当てる */
(function(){var r=render;render=function(){var o=r.apply(this,arguments);try{if(settings.p83Kids)document.querySelectorAll("#main .p52-card").forEach(p83Kids);}catch(_){}return o;};})();
document.addEventListener("click",function(e){
  var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a==="p83kids"){e.stopImmediatePropagation();e.preventDefault();settings.p83Kids=settings.p83Kids?0:1;p83Save();
    toast(settings.p83Kids?"こどもモード：日本語にふりがなをつけます":"ふりがなを消しました");if(P71)p71Render();try{render();}catch(_){}}
  else if(a==="p83ja"){e.stopImmediatePropagation();e.preventDefault();p83SayJa(v||"");}
},true);
/* 設定画面にも切りかえ */
if(typeof renderSettings==="function"){var _p83Set=renderSettings;renderSettings=function(){var h=String(_p83Set.apply(this,arguments));
  var row='<div class="p83-setrow"><div><b>こどもモード（ふりがな）</b><small>練習の画面の日本語にふりがなをつけ、日本語の文を読み上げるボタンを出します。</small></div><button type="button" class="p83-kbtn'+(settings.p83Kids?" on":"")+'" data-act="p83kids">'+(settings.p83Kids?'ON':'OFF')+'</button></div>';
  return row+h;};}

(function(){try{var st=document.createElement("style");st.textContent=
'.p83-top{display:flex;gap:12px;align-items:center;background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px}'+
'.p83-fig{flex:none;width:72px;height:72px;border-radius:14px;overflow:hidden;background:color-mix(in srgb,var(--pc,var(--accent)) 14%,transparent)}.p83-fig svg{width:100%;height:100%}'+
'.p83-info{min-width:0;display:flex;flex-direction:column;gap:2px}.p83-info small{color:var(--muted);font-size:12.5px;font-weight:700}.p83-info b{font-size:19px;line-height:1.3}'+
'.p83-lv{font-size:12.5px;color:var(--muted);font-weight:700}.p83-lv em{font-style:normal;color:#E0A100}.p83-lv i{font-style:normal;opacity:.3}'+
'.p83-go{display:flex;flex-direction:column;align-items:center;gap:2px;width:100%;margin:12px 0 0;min-height:58px;border-radius:14px;border:none;background:var(--accent);color:#fff;font:inherit;cursor:pointer;padding:8px 12px}.p83-go b{font-size:17px}.p83-go small{font-size:12.5px;opacity:.9;font-weight:600}'+
'.p83-goal{margin:10px 2px 0;font-size:13.5px;color:var(--muted);line-height:1.6}'+
'.p83-links{display:flex;gap:8px;margin:10px 0 0;flex-wrap:wrap}.p83-links button{flex:1;min-width:0;white-space:nowrap;min-height:40px;border-radius:12px;border:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;padding:0 6px}'+
'.p83-ch{border:1px solid var(--line);border-radius:14px;background:var(--card);margin:0 0 8px;overflow:hidden}.p83-chh{display:flex;align-items:center;gap:8px;width:100%;min-height:50px;padding:8px 12px;border:0;background:transparent;color:var(--ink);font:inherit;text-align:left;cursor:pointer}'+
'.p83-chh small{flex:none;color:var(--muted);font-size:12px;font-weight:700}.p83-chh b{flex:1;min-width:0;font-size:15px}.p83-chh span{flex:none;font-size:12.5px;color:var(--muted);font-weight:700}.p83-chh i{flex:none;font-style:normal;width:22px;text-align:center;color:var(--muted);font-size:18px}'+
'.p83-ch.open .p83-chh{border-bottom:1px solid var(--line)}'+
'.p83-row{display:flex;align-items:center;gap:10px;width:100%;min-height:52px;padding:6px 12px;border:0;border-bottom:1px solid var(--line);background:transparent;color:var(--ink);font:inherit;text-align:left;cursor:pointer}'+
'.p83-row.c{background:color-mix(in srgb,var(--accent) 12%,transparent)}.p83-row.d{opacity:.7}'+
'.p83-dot{flex:none;width:24px;height:24px;border-radius:50%;border:2px solid var(--line);display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;color:#fff}.p83-row.d .p83-dot{background:#2E9E5B;border-color:#2E9E5B}.p83-row.c .p83-dot{border-color:var(--accent);background:var(--accent)}'+
'.p83-rtx{min-width:0;display:flex;flex-direction:column}.p83-rtx b{font-size:15px}.p83-rtx small{font-size:12.5px;color:var(--muted)}'+
'.p83-boss{padding:10px 12px;display:flex;flex-direction:column;gap:2px}.p83-boss small{font-size:12px;color:#B07D00;font-weight:800}.p83-boss b{font-size:15px}.p83-boss span{font-size:12.5px;color:var(--muted)}.p83-boss.beat small{color:#2E9E5B}'+
'.p83-sub{font-weight:800;font-size:15px;margin:14px 2px 8px}.p83-sub small{color:var(--muted);font-weight:700;margin-left:6px}'+
'.p83-steps{display:flex;align-items:center;gap:5px;margin:2px 0 8px;font-size:12.5px;font-weight:800;flex-wrap:wrap}.p83-steps>span{padding:4px 9px;border-radius:999px;border:1px solid var(--line);color:var(--muted)}.p83-steps>span.on{background:var(--accent);border-color:var(--accent);color:#fff}.p83-steps>span.ok{color:#2E9E5B;border-color:#2E9E5B}.p83-steps i{font-style:normal;color:var(--muted)}'+
'.p83-how{border-left:4px solid var(--accent);background:color-mix(in srgb,var(--accent) 9%,transparent);border-radius:10px;padding:8px 10px;margin:0 0 10px;display:flex;flex-direction:column;gap:6px}.p83-how b{font-size:14px}.p83-how .p83-steps{margin:0}.p83-how span{font-size:13.5px;line-height:1.6;color:var(--ink)}'+
'.p83-hint{margin:0 0 10px;border:1px dashed var(--line);border-radius:12px;padding:8px 12px}.p83-hint summary{cursor:pointer;font-weight:800;font-size:14px;color:var(--accent);min-height:28px;display:flex;align-items:center}.p83-hint p{margin:6px 0 2px;font-size:14px;line-height:1.7}.p83-hint .p83-why{color:var(--muted);font-size:13px}.p83-hint button{display:block;margin:8px 0 2px;border:1px solid var(--line);background:var(--card);color:var(--accent);font:inherit;font-size:13.5px;font-weight:800;padding:8px 12px;border-radius:12px;text-align:left;cursor:pointer;width:100%}'+
'.p83-sum{border:2px solid #2E9E5B;border-radius:12px;padding:10px 12px;margin:0 0 12px;background:color-mix(in srgb,#2E9E5B 8%,transparent)}.p83-sumh{font-weight:900;color:#2E9E5B;font-size:13.5px;margin-bottom:4px}.p83-sum p{margin:4px 0;font-size:15px;line-height:1.7}.p83-sum small{color:var(--muted);font-size:12px}'+
'.p83-kbtn{flex:none;border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:12.5px;font-weight:800;border-radius:999px;padding:0 12px;min-height:34px;cursor:pointer;margin-right:6px}.p83-kbtn.on{background:#E0A100;border-color:#E0A100;color:#1a1a1a}'+
'.p83-krow{display:flex;justify-content:flex-end;margin:-4px 0 8px}'+
'.p83-f ruby rt{font-size:.55em;font-weight:600;opacity:.85;letter-spacing:0}.p83-f ruby{ruby-position:over}'+
'.p83-jspk{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;font:inherit;font-size:12px;font-weight:800;padding:2px 10px;min-height:30px;cursor:pointer;vertical-align:middle;margin-left:4px}.p83-jspk small{margin-left:3px;font-size:11.5px}'+
'.p83-setrow{display:flex;align-items:center;gap:12px;justify-content:space-between;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:12px;margin:0 0 12px}.p83-setrow b{display:block;font-size:15px}.p83-setrow small{display:block;font-size:12.5px;color:var(--muted);line-height:1.5;margin-top:2px}';
document.head.appendChild(st);}catch(_){}})();
