/* ===== Phase75：文法解説書の「読んだ」マーク・しおり・クイズからの案内、「日本語訳とずれるところ」の章 =====
   記録：settings.p72g = {read:{章id:日付}, bm:{id:章id, y:スクロール位置}}（この端末と、クラウド保存の設定に入る。個人情報は含まない）。
   新しい章の文章と例文は、このアプリのために書いたオリジナル。使う単語は単語帳（VOCAB）にある語とその変化形だけ。 */
(function(){if(!window.P72_GUIDE||P47_LANG==="ky")return;
var ch={id:"jpdiff",t:"日本語の訳とずれるところ",s:"до́ма は「家で」なのに、訳すと「家にいる」。こうしたずれを、理由といっしょに。",b:
 '<p>ロシア語を日本語に訳すと、<b>単語の意味と、自然な日本語の訳がずれる</b>ことがよくあります。ずれる理由はだいたい次の3つです。</p>'+
 '<ol><li><b>「です・いる」に当たる動詞を言わない</b>（今のことを言うとき）</li><li><b>「に」「を」「が」の分け方が日本語と違う</b></li><li><b>「私は」ではなく「私に」「私のところに」と言う決まった言い方がある</b></li></ol>'+
 '<p class="p72-n">この章の見方：<br>・<b>直訳</b>＝1語ずつ日本語にしたもの（不自然でOK）<br>・<b>自然な訳</b>＝ふつうの日本語にしたもの<br>直訳を見ると、ロシア語が「どう考えているか」がわかります。</p>'+
 '<h4>1. до́ма は「家で」。でも訳すと「家にいる」</h4>'+
 '<p>до́ма は「家で・家に（いる）」という、<b>場所を表す1語の言葉</b>です（形は変わりません）。</p>'+
 '<p class="p72-eg">Я до́ма.<br>直訳：私は ／ 家で<br>自然な訳：私は家にいます。</p>'+
 '<p><b>なぜ「いる」が出てくるの？</b>　ロシア語では、今のことを言うとき「です・いる・ある」に当たる動詞を<b>言わない</b>のがふつうです。だから「私は＋家で」の2語だけで文になります。日本語は動詞がないと文にならないので、訳すときに「いる」を<b>補います</b>。</p>'+
 '<p><b>過去なら動詞が出てくる</b>：「いた」は言います。</p>'+
 '<p class="p72-eg">Вчера́ я был до́ма.<br>直訳：昨日 ／ 私は ／ いた ／ 家で<br>自然な訳：昨日、私は家にいました。</p>'+
 '<p class="p72-n">был は быть（いる・ある）の過去の形（男性が主語のとき）。女性なら была́ です。</p>'+
 '<h4>2. 日本語の「家に」は、ロシア語では2つに分かれる</h4>'+
 '<p>日本語の「に」は、<b>いる場所</b>（家にいる）にも、<b>行く先</b>（家に帰る）にも使います。ロシア語はここをはっきり分けます。</p>'+
 '<ul class="p72-tbl2"><li><b>до́ма</b><span>家で（いる場所）→「家にいる」</span></li><li><b>домо́й</b><span>家へ（行く先）→「家に帰る・家へ行く」</span></li></ul>'+
 '<p class="p72-eg">Я иду́ домо́й.<br>直訳：私は ／ 歩いて行く ／ 家へ<br>自然な訳：私は家に帰ります。</p>'+
 '<p>ほかの場所でも同じです。<b>в＋前置格</b>（語尾 -е など）は「〜で・〜にいる」、<b>в＋対格</b>（語尾 -у など）は「〜へ」。</p>'+
 '<ul class="p72-ex"><li><b>Я в шко́ле.</b><span>私は学校にいます。（шко́ле＝前置格：いる場所）</span></li><li><b>Я иду́ в шко́лу.</b><span>私は学校へ行きます。（шко́лу＝対格：行く先）</span></li></ul>'+
 '<p class="p72-n">見分け方：日本語の「に」を「で」に言いかえて通じれば<b>いる場所</b>（学校に<u>いる</u>→学校で過ごす）、「へ」に言いかえて通じれば<b>行く先</b>（学校に<u>行く</u>→学校へ行く）です。</p>'+
 '<h4>3. 「私は猫を飼っている」は「私のところに猫がいる」</h4>'+
 '<p>「持っている・いる（家族・ペットなど）」は、ロシア語では <b>у меня́ есть</b> と言います。</p>'+
 '<p class="p72-eg">У меня́ есть ко́шка.<br>直訳：私のところに ／ ある・いる ／ 猫が<br>自然な訳：私は猫を飼っています。</p>'+
 '<p><b>ここがずれる</b>：日本語では「猫<b>を</b>」ですが、ロシア語の ко́шка は<b>主格（〜が）</b>のままです。ロシア語の文では「猫<b>が</b>いる」と考えているからです。「私は」も、ロシア語では у меня́（私のところに）です。</p>'+
 '<ul class="p72-ex"><li><b>У меня́ есть брат.</b><span>私には兄弟がいます。</span></li></ul>'+
 '<h4>4. 「ない」ときは生格（〜の形）になる</h4>'+
 '<p>「〜がない・いない」と言うときは <b>нет＋生格</b> です。есть（ある）のときは主格だったものが、нет になると<b>生格</b>に変わります。</p>'+
 '<p class="p72-eg">У меня́ нет ко́шки.<br>直訳：私のところに ／ ない ／ 猫の（生格）<br>自然な訳：私は猫を飼っていません。</p>'+
 '<p class="p72-n">ко́шка → ко́шки：女性名詞の生格は語尾 -а が -и（または -ы）に変わります。日本語の「猫を」「猫が」のどちらとも違う形なので、<b>「нет のあとは生格」</b>とセットで覚えましょう。</p>'+
 '<h4>5. 「好き」は2つの言い方がある</h4>'+
 '<p><b>(1) люби́ть＋対格</b>：「〜を好む」。日本語は「〜<b>が</b>好き」ですが、ロシア語は<b>対格（〜を）</b>です。</p>'+
 '<p class="p72-eg">Я люблю́ ма́му.<br>直訳：私は ／ 大好き・愛する ／ 母を<br>自然な訳：私は母が大好きです。</p>'+
 '<p><b>(2) нра́виться</b>：「〜が（人に）気に入る」。好きな物が<b>主格（〜が）</b>、好きな人が<b>与格（〜に）</b>になります。</p>'+
 '<p class="p72-eg">Мне нра́вится му́зыка.<br>直訳：私に ／ 気に入る ／ 音楽が<br>自然な訳：私は音楽が好きです。</p>'+
 '<p class="p72-n">日本語の「私は」が、ロシア語では мне（私に・与格）になります。「音楽が私の気に入る」という考え方です。</p>'+
 '<h4>6. 「寒い・退屈だ」は「私に寒い」</h4>'+
 '<p>体や気持ちで感じることは、<b>感じる人を与格（〜に）</b>にして言います。</p>'+
 '<ul class="p72-ex"><li><b>Мне хо́лодно.</b><span>私は寒いです。（直訳：私に ／ 寒い）</span></li><li><b>Мне ску́чно.</b><span>私は退屈です。（直訳：私に ／ 退屈だ）</span></li></ul>'+
 '<p class="p72-n">Я хо́лодно とは言いません。「寒さが私にやって来ている」というイメージで覚えると、мне がなぜ与格なのかがわかります。</p>'+
 '<h4>7. 「〜しなければならない」も「私に必要だ」</h4>'+
 '<p class="p72-eg">Мне на́до рабо́тать.<br>直訳：私に ／ 必要だ ／ 働くこと<br>自然な訳：私は働かなければなりません。</p>'+
 '<p class="p72-n">на́до・ну́жно（必要だ）、мо́жно（〜してよい）も、する人を与格にします：Мне мо́жно?（私はしてもいいですか？）</p>'+
 '<h4>まとめ：訳がずれたら「直訳」にもどる</h4>'+
 '<ul class="p72-tbl2"><li><b>до́ма／домо́й</b><span>いる場所／行く先。日本語はどちらも「家に」</span></li><li><b>у меня́ есть ＋主格</b><span>「私は〜を持っている」。物は「〜が」の形</span></li><li><b>нет ＋生格</b><span>「〜がない」。物は生格</span></li><li><b>люби́ть ＋対格</b><span>「〜が好き」。物は「〜を」の形</span></li><li><b>мне ＋ нра́вится／хо́лодно／на́до</b><span>日本語の「私は」が「私に（与格）」</span></li></ul>'};
var k=-1;P72_GUIDE.forEach(function(g,i){if(g.id==="pre")k=i;});P72_GUIDE.splice(k>=0?k+1:P72_GUIDE.length,0,ch);
})();
function p75G(){if(!settings.p72g||typeof settings.p72g!=="object")settings.p72g={};var g=settings.p72g;if(!g.read||typeof g.read!=="object")g.read={};return g;}
var _p75GR=p72GuideRender;
p72GuideRender=function(){_p75GR.apply(this,arguments);var m=document.getElementById("p72g");if(!m||!P72G)return;var g=p75G(),G=window.P72_GUIDE||[];
  try{
  if(!P72G.id){/* 目次：読んだ章に ✓、しおりの章へのボタン */
    var n=0;m.querySelectorAll('.p72-toc button[data-act="p72guide"]').forEach(function(b){var id=b.getAttribute("data-val");if(g.read[id]){n++;b.classList.add("p75-read");b.insertAdjacentHTML("beforeend",'<i class="p75-ck" aria-label="読んだ">✓</i>');}if(g.bm&&g.bm.id===id)b.insertAdjacentHTML("beforeend",'<i class="p75-bmk" aria-label="しおり">🔖</i>');});
    var toc=m.querySelector(".p72-toc"),bm=g.bm&&G.filter(function(x){return x.id===g.bm.id;})[0];
    if(toc)toc.insertAdjacentHTML("beforebegin",'<div class="p75-gstat"><span>読んだ章 <b>'+n+'</b> / '+G.length+'</span>'+(bm?'<button type="button" data-act="p75gbm">🔖 しおりの所へ：'+esc(bm.t)+' ›</button>':'<small>章の中で「しおり」を押すと、ここからすぐ飛べます</small>')+'</div>');
  }else{
    var id=P72G.id,on=!!g.read[id],isb=g.bm&&g.bm.id===id;
    var sub=m.querySelector(".p72-gsub");if(sub)sub.insertAdjacentHTML("afterend",'<div class="p75-gbar"><button type="button" class="'+(isb?"on":"")+'" data-act="p75gbmset">🔖 '+(isb?"しおりをはさんでいます（外す）":"しおりをはさむ")+'</button>'+(on?'<span class="p75-ck2">✓ 読んだ</span>':'')+'</div>');
    var nav=m.querySelector(".p72-gnav");if(nav)nav.insertAdjacentHTML("beforebegin",'<button type="button" class="p75-readbtn'+(on?" on":"")+'" data-act="p75gread">'+(on?'✓ 読んだ（押すと取り消し）':'この章を読んだ ✓')+'</button>');
    if(P72G.y){var sc=m.querySelector(".p71-scroll");if(sc){var y=P72G.y;P72G.y=0;setTimeout(function(){sc.scrollTop=y;},30);}}
  }
  if(P71){/* クイズの途中で開いたとき：すぐ戻れるボタン */
    var body=m.querySelector(".p72-gbody");if(body){body.insertAdjacentHTML("afterbegin",'<button type="button" class="p75-back" data-act="p72gx">‹ クイズにもどる</button>');body.insertAdjacentHTML("beforeend",'<button type="button" class="p75-back big" data-act="p72gx">‹ クイズにもどる</button>');}}
  }catch(_){}};
window.addEventListener("click",function(e){var el=e.target&&e.target.closest?e.target.closest("[data-act]"):null;if(!el)return;var a=el.getAttribute("data-act");if(!/^p75g/.test(a))return;
  e.stopImmediatePropagation();e.preventDefault();var g=p75G();
  if(a==="p75gread"&&P72G&&P72G.id){if(g.read[P72G.id])delete g.read[P72G.id];else{g.read[P72G.id]=todayKey();toast("「読んだ」にしました");}try{saveAll();}catch(_){}var sc=document.querySelector("#p72g .p71-scroll"),y=sc?sc.scrollTop:0;P72G.y=y;p72GuideRender();}
  else if(a==="p75gbmset"&&P72G&&P72G.id){var sc2=document.querySelector("#p72g .p71-scroll");if(g.bm&&g.bm.id===P72G.id){delete g.bm;toast("しおりを外しました");}else{g.bm={id:P72G.id,y:sc2?sc2.scrollTop:0};toast("しおりをはさみました。目次からすぐ飛べます");}try{saveAll();}catch(_){}P72G.y=sc2?sc2.scrollTop:0;p72GuideRender();}
  else if(a==="p75gbm"&&g.bm){P72G={id:g.bm.id,y:g.bm.y||0};p72GuideRender();}
},true);
/* しおりの位置は、章を読みながらスクロールしたら更新する */
document.addEventListener("scroll",function(e){var t=e.target;if(!t||!t.classList||!t.classList.contains("p71-scroll")||!t.closest("#p72g"))return;var g=p75G();if(P72G&&g.bm&&g.bm.id===P72G.id){g.bm.y=t.scrollTop;clearTimeout(p75G._t);p75G._t=setTimeout(function(){try{saveAll();}catch(_){}},800);}},true);
/* ---------- 穴埋め問題で：わからないときの案内 ---------- */
function p75HintTopic(x){var w=WMAP[x.id],fm=x.c&&x.c.forms,lab=fm&&fm.lab?fm.lab[fm.key]:"";var t=[];try{t=p72Topics(w,lab,x.c.f);}catch(_){}
  var c=(x.c&&x.c.f&&x.c.f.toks?x.c.f.toks.join(""):"").toLowerCase().replace(/́/g,"");
  if(/(^|[^а-яё])(дома|домой)([^а-яё]|$)/.test(c)||/(^|[^а-яё])(мне|тебе|ему|ей|нам|вам|им) (нравится|нравятся|холодно|скучно|надо|нужно|можно)/.test(c)||/у (меня|тебя|него|неё|нас|вас|них) (есть|нет)/.test(c))t.push("jpdiff");
  var out=[];t.forEach(function(k){var g=k==="jpdiff"?(P72_GUIDE||[]).filter(function(q){return q.id==="jpdiff";})[0]:p72GuideFor(k);if(g&&out.indexOf(g)<0)out.push(g);});return out.slice(0,2);}
var _p75HR=p71Render;
p71Render=function(){var o=_p75HR.apply(this,arguments);try{var S=P71,x=S&&!S.confirm&&S.steps[S.pos];
  if(x&&!x.m&&(x.t==="cloze"||x.t==="form")&&p72Ru()){var open=x.t==="form"?S.picked2===null:(S.picked===null||(S.picked===x.id&&x.c.forms&&S.picked2===null));
    var m=document.getElementById("p71"),pp=m&&m.querySelector(".p71-paper");
    if(open&&pp&&!m.querySelector(".p75-ghint")){var gs=p75HintTopic(x);if(gs.length)pp.insertAdjacentHTML("afterend",'<div class="p75-ghint"><small>文法がわからないときは</small>'+gs.map(function(g){return '<button type="button" data-act="p72guide" data-val="'+g.id+'">文法解説書「'+esc(g.t)+'」を読む ›</button>';}).join("")+'<em>読んだら「クイズにもどる」で、この問題に戻れます</em></div>');}}
  }catch(_){}return o;};
(function(){try{var st=document.createElement("style");st.textContent=
'.p75-ck{font-style:normal;color:#2E9E5B;font-weight:900;font-size:16px;margin-left:4px}.p75-bmk{font-style:normal;margin-left:2px}.p72-toc button.p75-read b{opacity:.75}'+
'.p75-gstat{display:flex;flex-direction:column;gap:6px;margin:0 0 10px}.p75-gstat span{font-size:13px;color:var(--muted);font-weight:700}.p75-gstat span b{color:var(--ink);font-size:16px}.p75-gstat small{font-size:12px;color:var(--muted)}'+
'.p75-gstat button,.p75-gbar button,.p75-back,.p75-ghint button{border:1px solid var(--line);background:var(--card);color:var(--ink);font:inherit;font-size:13.5px;font-weight:800;padding:8px 12px;border-radius:12px;cursor:pointer;text-align:left}'+
'.p75-gbar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 10px}.p75-gbar button.on{border-color:#E0A100;background:rgba(224,161,0,.14)}.p75-ck2{color:#2E9E5B;font-weight:800;font-size:13px}'+
'.p75-readbtn{display:block;width:100%;margin:16px 0 10px;padding:12px;border-radius:14px;border:2px solid #2E9E5B;background:transparent;color:#2E9E5B;font:inherit;font-size:15px;font-weight:800;cursor:pointer}.p75-readbtn.on{background:#2E9E5B;color:#fff}'+
'.p75-back{display:block;margin:0 0 10px;color:var(--accent)}.p75-back.big{width:100%;text-align:center;margin:14px 0 4px;background:var(--accent);border-color:var(--accent);color:#fff;font-size:15px;padding:12px}'+
'.p75-ghint{margin:10px 0 0;padding:10px 12px;border-radius:14px;border:1px dashed var(--line);display:flex;flex-direction:column;gap:6px}.p75-ghint small{font-size:12px;color:var(--muted);font-weight:700}.p75-ghint button{color:var(--accent)}.p75-ghint em{font-style:normal;font-size:11.5px;color:var(--muted)}'+
'.p72-tbl2{list-style:none;padding:0;margin:8px 0;display:flex;flex-direction:column;gap:6px}.p72-tbl2 li{display:flex;gap:10px;padding:8px 10px;border-radius:10px;border:1px solid var(--line)}.p72-tbl2 li b{min-width:7.5em}.p72-tbl2 li span{flex:1;font-size:14px}';
document.head.appendChild(st);}catch(_){}})();
