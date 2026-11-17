/* ===== PHASE62: ホーム画面の形と色を選べるように ／ クイズは「次へ」を画面下に固定してスクロール不要に ===== */
if(!settings.p62Home)settings.p62Home="basic";
if(!settings.p62Theme)settings.p62Theme="basic";
var P62_HOMES=[
  ["basic","ベーシック","今日のチャレンジ・単語練習・まとめて練習を全部表示"],
  ["matome","まとめて練習だけ","まとめて練習と今日の進み具合だけのシンプルな画面"],
  ["chal","チャレンジだけ","今日のチャレンジだけに集中する画面"],
  ["list","シンプル一覧","絵を出さず、すべての練習を一覧で表示"]
];
var P62_THEMES=[
  ["basic","ベーシック",null],
  ["blue","ブルー",{a:"#0A84FF",d:"#0066CC",s:"#64D2FF",rgb:"10,132,255"}],
  ["red","レッド＆ゴールド",{a:"#E5332A",d:"#B3261E",s:"#F2B705",rgb:"229,51,42"}],
  ["forest","フォレスト",{a:"#2FB36B",d:"#1E8A4F",s:"#A8E06C",rgb:"47,179,107"}],
  ["sunset","サンセット",{a:"#FF7A45",d:"#D9541E",s:"#FFC53D",rgb:"255,122,69"}],
  ["lavender","ラベンダー",{a:"#8E7CFF",d:"#6652E0",s:"#C4B5FD",rgb:"142,124,255"}],
  ["rose","ローズ",{a:"#FF5C8A",d:"#D93A69",s:"#FFB3C7",rgb:"255,92,138"}],
  ["navy","ネイビー",{a:"#4C9DFF",d:"#2B6FD1",s:"#8FD3FF",rgb:"76,157,255",bg:"#0B1220",card:"#151E30",card2:"#1F2B42",line:"#24324A",lineStrong:"#31425F"}],
  ["mocha","モカ",{a:"#D9A066",d:"#B07A42",s:"#F2D3A0",rgb:"217,160,102",bg:"#14100C",card:"#221A14",card2:"#2E241C",line:"#33281F",lineStrong:"#45372B"}]
].filter(function(t){return !(t[0]===(P47_LANG==="ky"?"red":"blue"));});
function p62ApplyTheme(){
  var t=null;P62_THEMES.forEach(function(x){if(x[0]===settings.p62Theme)t=x[2];});
  var keys=["--accent","--accentDeep","--accentSoft","--blue","--blueDeep","--sub","--star","--navy","--teal","--bg","--card","--card2","--line","--lineStrong"];
  [document.documentElement,document.body].forEach(function(el){
    if(!el)return;keys.forEach(function(k){el.style.removeProperty(k);});
    if(!t)return;
    var m={"--accent":t.a,"--accentDeep":t.d,"--accentSoft":"rgba("+t.rgb+",.16)","--blue":t.a,"--blueDeep":t.d,"--sub":t.s,"--star":t.a,"--navy":t.a,"--teal":t.s};
    if(t.bg){m["--bg"]=t.bg;m["--card"]=t.card;m["--card2"]=t.card2;m["--line"]=t.line;m["--lineStrong"]=t.lineStrong;}
    Object.keys(m).forEach(function(k){el.style.setProperty(k,m[k]);});
  });
  document.body.classList.toggle("p62-bg",!!(t&&t.bg));
  if(t&&t.bg)document.body.style.setProperty("background",t.bg,"important");else document.body.style.removeProperty("background");
}
p62ApplyTheme();
function p62Row(act,val,title,sub){return '<button type="button" class="p62-lrow" data-act="'+act+'"'+(val?' data-val="'+val+'"':'')+'><span><b>'+title+'</b><small>'+sub+'</small></span><i>›</i></button>';}
var _p62Home=renderHome;
renderHome=function(){
  var h=String(_p62Home()),mode=settings.p62Home||"basic";
  var tailLink='<button type="button" class="p62-custom" data-act="p62open">ホーム画面の形・色を変える</button>';
  var iHero=h.indexOf('<div class="p51-herowrap">'),iCard=h.indexOf('<button type="button" class="p47-card"'),iMore=h.indexOf('<button type="button" class="p47-more"');
  var end=h.lastIndexOf('</div>');
  if(mode==="basic"||iHero<0||iCard<0||iMore<0)return h.slice(0,end)+tailLink+h.slice(end);
  var head=h.slice(0,iHero),hero=h.slice(iHero,iCard),more=h.slice(iMore,end);
  var t=p47Target(),d=p47DoneToday(),today=p48DayCount(todayKey()),streak=appHist.streak.count||0,known=p47KnownCount();
  var body="";
  if(mode==="matome"){
    var lapTxt=(p35LapDone()>0||p35Lap()>1)?(p36ScopeLabel()+' '+p35Lap()+'周目'):'全単語を順番に見ていく周回モード';
    var art=(hero.match(/<div class="p47-heroart">[\s\S]*?<\/div>(?=<div class="p47-herobody">)/)||[""])[0];
    body='<div class="p51-herowrap"><button type="button" class="p47-hero" data-act="p48reinf">'+art+'<div class="p47-herobody"><div class="p47-herotxt"><div class="p47-kicker">まとめて練習</div>'+
      '<div class="p47-big">'+today+'<small> 問（今日）</small></div><div class="p47-sub">'+esc(lapTxt)+'</div></div></div>'+
      '<div class="p47-gauge"><i style="width:'+Math.min(100,Math.round(today/Math.max(1,t)*100))+'%"></i></div><div class="p47-cta">'+(today?'つづける':'はじめる')+p47Icon("chev",18)+'</div></button></div>'+
      '<div class="p62-facts"><span>覚えた単語 <b>'+known.toLocaleString()+'</b> / '+VOCAB.length.toLocaleString()+'</span></div>';
  }else if(mode==="chal"){
    body=hero+'<div class="p62-facts"><span>覚えた単語 <b>'+known.toLocaleString()+'</b> / '+VOCAB.length.toLocaleString()+'</span></div>';
  }else{
    body='<div class="p62-list">'+
      '<button type="button" class="p62-lrow" data-act="p47chal"><span><b>今日のチャレンジ</b><small>'+Math.min(d,t)+' / '+t+' 問</small><em class="p62-bar"><u style="width:'+Math.min(100,Math.round(d/Math.max(1,t)*100))+'%"></u></em></span><i>›</i></button>'+
      p62Row("p47words","","単語練習","テーマを選んで覚える ・ 覚えた "+known+" / "+VOCAB.length+"語")+
      p62Row("p48reinf","","まとめて練習","全単語を順番に見ていく")+
      p62Row("openlearn","compose","瞬間作文","日本語を見て、すぐ言う")+
      p62Row("openlearn","listening","リスニング","聞き流しで耳を慣らす")+
      p62Row("openlearn","p55talk","AI会話","場面のロールプレイで話す")+
      p62Row("openlearn","p55mist","間違えたノート","間違えた単語と作文")+
      p62Row("openlearn","gnote","文法ノート","文法の早見表と練習")+'</div>';
    more="";
  }
  if(mode!=="list")more="";
  return head+body+more+tailLink+'</div>';
};
function p62SettingsUI(){
  var h='<div class="p62-set"><div class="p60-dirl">ホーム画面の形</div><div class="p62-opts">';
  P62_HOMES.forEach(function(x){h+='<button type="button" class="p62-opt'+(settings.p62Home===x[0]?" on":"")+'" data-act="p62home" data-val="'+x[0]+'"><span class="p62-radio"></span><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span></button>';});
  h+='</div><div class="p60-dirl" style="margin-top:16px">色</div><div class="p62-sw">';
  P62_THEMES.forEach(function(x){var t=x[2],a=t?t.a:"var(--accent)",s=t?t.s:"var(--sub)",bg=t&&t.bg?t.bg:"#000";
    h+='<button type="button" class="p62-swb'+(settings.p62Theme===x[0]?" on":"")+'" data-act="p62theme" data-val="'+x[0]+'"'+(x[0]==="basic"?' data-basic="1"':'')+'><span class="p62-chip" style="background:'+bg+'"><i style="background:'+(x[0]==="basic"?"":a)+'"></i><i style="background:'+(x[0]==="basic"?"":s)+'"></i></span><small>'+x[1]+'</small></button>';});
  return h+'</div></div>';
}
var _p62Settings=renderSettings;
renderSettings=function(embed){var h=String(_p62Settings.apply(this,arguments));var i=h.indexOf('<div class="p60-setdir">');if(i<0)i=h.indexOf('<div class="p47-set');return i<0?h:h.slice(0,i)+p62SettingsUI()+h.slice(i);};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  if(a!=="p62home"&&a!=="p62theme"&&a!=="p62open"&&!(a==="openlearn"&&el.classList.contains("p62-lrow")&&(v==="compose"||v==="listening"||v==="gnote")))return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p62home"){settings.p62Home=v;saveAll();render();toast("ホーム画面を変更しました");return;}
  if(a==="p62theme"){settings.p62Theme=v;saveAll();p62ApplyTheme();render();return;}
  if(a==="p62open"){clearTransientUI();ui.learnOpen=false;ui.bnav="settings";saveUI();render();window.scrollTo(0,0);return;}
  clearTransientUI();ui.session=null;ui.composeSession=null;ui.mixSummary=null;ui.bnav="wordbook";ui.view=v;ui.learnOpen=true;saveUI();render();window.scrollTo(0,0);
},true);
(function(){
  var st=document.createElement("style");
  st.textContent=
  /* クイズ：「次へ」は常に画面下。答えた後は選ばなかった選択肢をたたんで1画面に収める */
  'body.p58-focus .p52-foot{position:fixed!important;left:0;right:0;bottom:0!important;margin:0!important;padding:14px 16px calc(14px + env(safe-area-inset-bottom))!important;background:linear-gradient(180deg,transparent,var(--bg) 26%)!important;z-index:45}'+
  'body.p58-focus .p52-foot>*{max-width:520px;margin-left:auto;margin-right:auto}body.p58-focus .p52{padding-bottom:120px!important}'+
  'body.p58-focus .p52-opt.dim{display:none}body.p58-focus .p52-opts:has(.p52-opt.right) .p52-opt{padding-top:11px;padding-bottom:11px}'+
  'body.p58-focus .p52:has(.p52-res) .p52-card{padding-top:14px;padding-bottom:12px}body.p58-focus .p52:has(.p52-res) .p52-card .p52-q{font-size:26px;margin-bottom:4px}body.p58-focus .p52:has(.p52-res) .p52-spk.big{display:none}'+
  'body.p58-focus .p52-res{padding-top:9px!important;padding-bottom:9px!important}body.p58-focus .p52:has(.p52-res) .p52-detail .p52-dexp{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}'+
  'body.p58-focus .p52:has(.p52-res) .p52-detail .p59-pic{display:none}body.p58-focus .p52:has(.p52-res) .p52-res span{display:none}body.p58-focus .p52:has(.p52-res) .p52-detail .p52-dw{font-size:22px}body.p58-focus .p52:has(.p52-res) .p52-detail .p52-dm{font-size:16px;margin-top:4px}body.p58-focus .p52:has(.p52-res) .p52-detail .p52-dk{margin-top:0;font-size:13px}body.p58-focus .p52:has(.p52-res) .p52-opts{gap:8px}body.p58-focus .p52:has(.p52-res) .p52-res{margin:8px 0!important}'+
  '.p62-custom{display:block;margin:18px auto 0;background:none;border:none;color:var(--muted);font-size:12.5px;font-weight:600;padding:8px 12px;cursor:pointer;font-family:inherit;text-decoration:underline;text-underline-offset:3px}'+
  '.p62-facts{display:flex;gap:18px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin:14px 4px 0}.p62-facts b{color:var(--ink);font-weight:800;font-variant-numeric:tabular-nums}'+
  '.p62-list{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}.p62-lrow{display:flex;align-items:center;gap:10px;width:100%;padding:14px;border:none;border-bottom:1px solid var(--line);background:none;color:var(--ink);text-align:left;cursor:pointer;font-family:inherit}.p62-lrow:last-child{border-bottom:none}'+
  '.p62-lrow>span{flex:1;min-width:0;display:block}.p62-lrow b{display:block;font-size:15.5px;font-weight:700}.p62-lrow small{display:block;font-size:12.5px;color:var(--muted);margin-top:2px}.p62-lrow>i{font-style:normal;color:var(--muted);font-size:18px}'+
  '.p62-bar{display:block;height:4px;border-radius:2px;background:var(--line);margin-top:8px;overflow:hidden}.p62-bar u{display:block;height:100%;background:var(--accent);border-radius:2px}'+
  '.p62-set{margin:0 0 18px}.p62-opts{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}.p62-opt{display:flex;align-items:center;gap:12px;width:100%;padding:13px 14px;border:none;border-bottom:1px solid var(--line);background:none;color:var(--ink);text-align:left;cursor:pointer;font-family:inherit}.p62-opt:last-child{border-bottom:none}'+
  '.p62-opt b{display:block;font-size:14.5px;font-weight:700}.p62-opt small{display:block;font-size:12px;color:var(--muted);margin-top:2px;line-height:1.5}.p62-radio{width:20px;height:20px;border-radius:50%;border:2px solid var(--lineStrong,#555);flex:none;box-sizing:border-box}.p62-opt.on .p62-radio{border:6px solid var(--accent)}'+
  '.p62-sw{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}.p62-swb{border:none;background:none;color:var(--muted);cursor:pointer;font-family:inherit;padding:0;display:flex;flex-direction:column;align-items:center;gap:5px}.p62-swb small{font-size:11px;line-height:1.3;text-align:center}'+
  '.p62-chip{display:flex;width:100%;height:44px;border-radius:12px;border:2px solid var(--line);overflow:hidden;align-items:flex-end;box-sizing:border-box}.p62-chip i{flex:1;height:55%}.p62-swb[data-basic] .p62-chip i:first-child{background:var(--accent)}.p62-swb[data-basic] .p62-chip i:last-child{background:var(--sub)}'+
  '.p62-swb.on .p62-chip{border-color:var(--ink)}.p62-swb.on small{color:var(--ink);font-weight:700}'+
  'body.p62-bg header.app,body.p62-bg nav.bnav{background:var(--bg)!important}';
  document.head.appendChild(st);
})();
