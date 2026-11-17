/* ===== PHASE63: 見た目の作り直し（平らな面・細い線・文字中心）と、色テーマ5種 ===== */
/* 色は「背景・面・アクセント」をひとまとめにした5種類 */
P62_THEMES=[
  ["basic","ベーシック",null],
  ["navy","ネイビー",{a:"#4C9DFF",d:"#2B6FD1",s:"#8FD3FF",rgb:"76,157,255",bg:"#0A111E",card:"#131C2D",card2:"#1C283E",line:"#223049",lineStrong:"#30415F"}],
  ["forest","フォレスト",{a:"#2FB36B",d:"#1E8A4F",s:"#A8E06C",rgb:"47,179,107",bg:"#0A120E",card:"#131D17",card2:"#1B2921",line:"#213228",lineStrong:"#2E4638"}],
  ["mocha","モカ",{a:"#C98545",d:"#A3672D",s:"#EFC78F",rgb:"201,133,69",bg:"#13100C",card:"#201A14",card2:"#2C241C",line:"#32281F",lineStrong:"#45372B"}],
  ["plum","プラム",{a:"#8E7CFF",d:"#6652E0",s:"#C4B5FD",rgb:"142,124,255",bg:"#100D18",card:"#1A1626",card2:"#241F34",line:"#2A243D",lineStrong:"#3A3254"}]
];
if(!P62_THEMES.some(function(t){return t[0]===settings.p62Theme;}))settings.p62Theme="basic";
p62ApplyTheme();
function p63ApplyArt(){document.body.classList.toggle("p63-art",!!settings.p63Art);}
p63ApplyArt();
var _p63SetUI=p62SettingsUI;
p62SettingsUI=function(){
  var h=String(_p63SetUI.apply(this,arguments)),i=h.lastIndexOf('</div>');
  return h.slice(0,i)+'<button type="button" class="p63-tog" data-act="p63art"><span><b>ホームに絵を表示</b><small>今日のチャレンジのカードに夜景の絵を出します</small></span><i class="'+(settings.p63Art?"on":"")+'"></i></button>'+h.slice(i);
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el||el.getAttribute("data-act")!=="p63art")return;
  e.stopImmediatePropagation();e.preventDefault();settings.p63Art=!settings.p63Art;saveAll();p63ApplyArt();render();
},true);
(function(){
  var st=document.createElement("style");
  st.textContent=
  /* 共通：影・グラデーション・絵のアイコンをやめる */
  '#main *,nav.bnav,header.app{box-shadow:none!important}'+
  '.p47-cardic,.p47-themeic,.p49-hubic,.p51-headic,.p50-ic,.p55-scic,.p49-chic,.p49-finart{display:none!important}'+
  '#main{letter-spacing:-.005em}'+
  '.p48-title,.p51-headt,.greet,.p47-greet{font-weight:700!important;letter-spacing:-.02em!important;background:none!important;-webkit-text-fill-color:currentColor!important}'+
  '.p47-greet{font-size:26px!important}.p48-title{font-size:26px!important}'+
  /* ホーム */
  '.p47-streak{background:none!important;border:1px solid var(--line)!important;border-radius:10px!important;padding:6px 10px!important}'+
  '.p47-card{border-radius:14px!important;background:var(--card)!important;border:1px solid var(--line)!important;padding:15px 14px!important;margin-bottom:8px!important}.p47-card b{font-weight:700!important;font-size:15.5px!important}.p47-card small{font-size:12.5px!important}'+
  '.p47-more{font-weight:600!important}'+
  'body:not(.p63-art) .p47-heroart{display:none!important}'+
  'body:not(.p63-art) .p47-hero{background:var(--card)!important;border:1px solid var(--line)!important;border-radius:16px!important;color:var(--ink)!important}'+
  'body:not(.p63-art) .p47-kicker{color:var(--muted)!important;font-weight:600!important;font-size:13px!important;letter-spacing:0!important;text-transform:none!important}'+
  'body:not(.p63-art) .p47-big{font-weight:700!important;font-size:46px!important;font-variant-numeric:tabular-nums;letter-spacing:-.03em!important}body:not(.p63-art) .p47-big small{color:var(--muted)!important;font-weight:600!important;letter-spacing:0!important}'+
  'body:not(.p63-art) .p47-sub{color:var(--muted)!important}'+
  'body:not(.p63-art) .p47-gauge{height:4px!important;border-radius:2px!important;background:var(--line)!important}body:not(.p63-art) .p47-gauge i{background:var(--accent)!important;border-radius:2px!important}'+
  'body:not(.p63-art) .p47-cta{background:var(--accent)!important;color:#fff!important;border-radius:12px!important;font-weight:700!important;padding:14px!important}'+
  'body:not(.p63-art) .p51-gear{background:none!important;border:1px solid var(--line)!important;color:var(--muted)!important;border-radius:10px!important}'+
  '.p63-art .p47-hero{border-radius:16px!important}'+
  /* 単語練習・その他の練習：一覧の形に */
  '.p47-tile{border-radius:14px!important;background:var(--card)!important}.p47-tile b{font-weight:700!important;font-variant-numeric:tabular-nums}'+
  '.p47-theme{border-radius:14px!important;background:var(--card)!important;margin-bottom:8px!important}.p47-themehead b{font-weight:700!important}.p47-cnt{font-weight:700!important;font-variant-numeric:tabular-nums}'+
  '.p47-bar{height:3px!important;border-radius:2px!important}.p47-bar i{border-radius:2px!important;background:var(--accent)!important}'+
  '.p47-sec{font-weight:700!important;color:var(--muted)!important;letter-spacing:0!important}'+
  '.p47-btn{border-radius:12px!important;font-weight:700!important}'+
  'div:has(> .hubcard){display:block!important;background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}'+
  '.hubcard{display:block!important;width:100%!important;border:none!important;border-bottom:1px solid var(--line)!important;border-radius:0!important;background:none!important;padding:14px!important;min-height:0!important;text-align:left!important}.hubcard:last-child{border-bottom:none!important}'+
  '.hubcard .nm{font-weight:700!important;font-size:15.5px!important;margin:0!important}.hubcard .ds,.hubcard small{font-size:12.5px!important}'+
  '.p52-morehub{border-style:solid!important;border-radius:12px!important;font-weight:600!important}'+
  '.p51-back{border-radius:12px!important;background:var(--card)!important;border:1px solid var(--line)!important}'+
  /* クイズ・カード */
  '.p52-card{background:var(--card)!important;border-radius:16px!important}'+
  '.p52-tag{background:none!important;padding:0!important;border-radius:0!important;color:var(--muted)!important;font-weight:600!important;font-size:12.5px!important}.p52-tag.p52-new{color:var(--sub)!important}'+
  '.p52-q{font-weight:700!important;letter-spacing:-.02em!important}.p52-dw{font-weight:700!important}.p52-dm{font-weight:700!important}'+
  '.p52-opt{border-radius:12px!important;font-weight:600!important}.p52-n{border-radius:7px!important;font-weight:700!important}'+
  '.p52-next{border-radius:12px!important;font-weight:700!important}.p52-res{border-radius:12px!important}.p52-detail{border-radius:14px!important}.p52-dex{border-radius:10px!important}'+
  '.p52-prog{height:4px!important}.p52-cnt{font-weight:600!important;font-variant-numeric:tabular-nums}'+
  '.p52-bm,.p52-spk{background:none!important;border:1px solid var(--line)!important}'+
  '.p53-blank{font-weight:700!important}'+
  /* 設定など既存のカード */
  '.p47-set,.p48-card,#main .card,.p55-sc,.row2{border-radius:14px!important;background-image:none!important}'+
  '#main .h2,#main .lab,.p51-k{font-weight:700!important}'+
  '.p60-seg{border-radius:10px!important}.p60-seg button{border-radius:8px!important}'+
  '.p62-sw{grid-template-columns:repeat(5,1fr)!important;gap:8px!important}.p62-chip{height:40px!important;border-radius:10px!important;border-width:1.5px!important}'+
  '.p63-tog{display:flex;align-items:center;gap:12px;width:100%;margin-top:14px;padding:13px 14px;border:1px solid var(--line);border-radius:14px;background:var(--card);color:var(--ink);text-align:left;cursor:pointer;font-family:inherit}'+
  '.p63-tog>span{flex:1}.p63-tog b{display:block;font-size:14.5px;font-weight:700}.p63-tog small{display:block;font-size:12px;color:var(--muted);margin-top:2px}'+
  '.p63-tog>i{width:44px;height:26px;border-radius:13px;background:var(--lineStrong,#444);position:relative;flex:none;transition:background .15s}.p63-tog>i:after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;transition:transform .15s}.p63-tog>i.on{background:var(--accent)}.p63-tog>i.on:after{transform:translateX(18px)}'+
  /* 下のタブと上の帯 */
  'nav.bnav{border-top:1px solid var(--line)!important;background:var(--bg)!important}header.app{border-bottom:1px solid var(--line)!important;background:var(--bg)!important}';
  st.textContent+=(P47_LANG==="ky"?'.p62-swb[data-basic] .p62-chip i:first-child{background:#E5332A!important}.p62-swb[data-basic] .p62-chip i:last-child{background:#F2B705!important}':'.p62-swb[data-basic] .p62-chip i:first-child{background:#0A84FF!important}.p62-swb[data-basic] .p62-chip i:last-child{background:#64D2FF!important}');
  document.head.appendChild(st);
})();
