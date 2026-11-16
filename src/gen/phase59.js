/* ===== PHASE59: 単語に絵を付ける ／ チャレンジを5問ごとに止めない ===== */
var P59_PIC=/*P59S*/{}/*P59E*/;
/* 数量・場所のフレーズは、中心になる名詞の絵を使う */
(function(){
  var rules=[["幼稚園","🧸"],["学校","🏫"],["薬局","💊"],["病院","🏥"],["事務所","🏢"],["タクシー","🚕"],["書類","📄"],["お茶","🍵"],["ナン","🫓"],["パン","🍞"],["牛乳","🥛"],["水","💧"],["薬","💊"],["銀行","🏦"],["郵便局","📮"],["レストラン","🍽️"],["空港","🛫"],["職場","💼"],["仕事","💼"],["医者","🧑‍⚕️"],["店","🏪"],["家","🏠"],["子ども","🧒"],["妻","👰"],["同僚","🧑‍💼"]];
  if(!Object.keys(P59_PIC).length)return;
  VOCAB.forEach(function(w){
    if(P59_PIC[w.id]||!/\s/.test(w.word))return;
    var m=/^A1-(\d+)$/.exec(w.id),n=m?+m[1]:0,a2=/^A2-(\d+)$/.exec(w.id),k=a2?+a2[1]:0;
    if(!((n>=719&&n<=793)||(k>=1&&k<=24)||(k>=152&&k<=169)||(k>=196&&k<=204)))return;
    for(var i=0;i<rules.length;i++)if(String(w.meaning).indexOf(rules[i][0])>=0){P59_PIC[w.id]=rules[i][1];break;}
  });
})();
var P59_BYTEXT=(function(){var m={};VOCAB.forEach(function(w){var p=P59_PIC[w.id];if(!p)return;m[w.word]=p;if(w.accent)m[w.accent]=p;});return m;})();
function p59Pic(id){return P59_PIC[id]||"";}
function p59Own(el){var t="";for(var i=0;i<el.childNodes.length;i++)if(el.childNodes[i].nodeType===3)t+=el.childNodes[i].textContent;return t.trim();}
function p59Put(el,pic,cls){
  if(!el||!pic)return;var prev=el.previousElementSibling;
  if(prev&&prev.classList&&prev.classList.contains("p59-pic"))return;
  var d=document.createElement("div");d.className="p59-pic"+(cls?" "+cls:"");d.setAttribute("aria-hidden","true");d.textContent=pic;
  el.parentNode.insertBefore(d,el);
}
function p59Decorate(){
  try{
    if(ui.view==="p58test"&&ui.p58&&!ui.p58.done)return; /* テスト中はヒントになるので出さない */
    var i,els=document.querySelectorAll(".p52-dw");
    for(i=0;i<els.length;i++)p59Put(els[i],P59_BYTEXT[p59Own(els[i])]);
    var s=ui.session,q=s&&s.p52;
    if(q&&q.id){
      var ja=document.querySelector("#main .p52-q.ja");if(ja)p59Put(ja,p59Pic(q.id));
      var qq=document.querySelector("#main .p52-q:not(.ja)");if(qq&&q.pick!==null&&q.pick!==undefined)p59Put(qq,p59Pic(q.id));
    }
    if(s&&s.revealed){var a=document.querySelector("#main .p8-wordcard .accent");if(a)p59Put(a,P59_BYTEXT[p59Own(a)]);}
    var l=document.querySelector("#main .lisnow .ru2");if(l)p59Put(l,P59_BYTEXT[p59Own(l)],"sm");
  }catch(_){}
}
/* ---- 5問ごとの中断画面をやめる：最後まで続けて出題する ---- */
var _p59Render=render;
render=function(){
  if(ui.mixCheckpoint&&ui.mixQueue){ui.mixCheckpoint=false;saveUI();p21OpenCurrent();return;}
  var r=_p59Render.apply(this,arguments);
  p59Decorate();
  return r;
};
/* ---- 終了画面：続けてもう1セットできるように ---- */
var _p59Fin=p21RenderFinish;
p21RenderFinish=function(){
  return String(_p59Fin.apply(this,arguments)).replace('今日の学習が終わりました','おつかれさまでした！').replace('>もう一度やる<','>続けてもう'+p47Target()+'問<');
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  if(el.getAttribute("data-act")!=="p21again")return;
  e.stopImmediatePropagation();e.preventDefault();
  ui.mixSummary=null;ui.mixQueue=null;saveUI();
  var q=p47BuildChallenge(p47Target()).filter(function(it){return it.id;});
  if(!q.length){toast("対象の問題がありません");ui.bnav="home";ui.learnOpen=false;render();return;}
  ui.studyMode="challenge";
  ui.mixQueue={items:q,pos:0,mode:"challenge",startedAt:now(),stats:{ok:0,maybe:0,no:0,answered:0},total:q.length};
  clearTransientUI();ui.bnav="wordbook";ui.learnOpen=true;p21OpenCurrent();window.scrollTo(0,0);
},true);
(function(){
  var st=document.createElement("style");
  st.textContent='.p59-pic{font-size:64px;line-height:1.1;text-align:center;margin:2px 0 8px;font-family:"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif;filter:drop-shadow(0 6px 14px rgba(0,0,0,.35))}.p59-pic.sm{font-size:44px;margin:0 0 4px}.p48-dialog .p59-pic{font-size:52px}';
  document.head.appendChild(st);
})();
