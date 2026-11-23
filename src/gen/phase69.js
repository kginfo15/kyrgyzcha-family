/* ===== PHASE69: 「もっと見る」の余白と表記、明るい色テーマ（白・クリームなど） ===== */
/* --- 明るいテーマを追加（暗いテーマの後ろに並べる） --- */
(function(){
  var L=[
    ["white","ホワイト",{a:"#0A72E8",d:"#0757B3",s:"#3A8DDE",rgb:"10,114,232",bg:"#F2F2F7",card:"#FFFFFF",card2:"#F4F5F8",line:"#E2E3E8",lineStrong:"#CFD1D8",light:1,ink:"#1C1C1E",muted:"#6B6B72",mutedSoft:"#8E8E95",chip:"#ECEDF1",chipText:"#4A4A50"}],
    ["cream","クリーム",{a:"#C0702A",d:"#9A5418",s:"#B8893F",rgb:"192,112,42",bg:"#F6F0E2",card:"#FFFCF4",card2:"#F8F1E2",line:"#E8DDC8",lineStrong:"#D9CAAE",light:1,ink:"#3A2E22",muted:"#7A6A57",mutedSoft:"#9A8A75",chip:"#F0E6D2",chipText:"#5A4A38"}],
    ["mint","ミント",{a:"#1F9D6B",d:"#147A52",s:"#3BAF8A",rgb:"31,157,107",bg:"#EEF6F2",card:"#FFFFFF",card2:"#F1F8F4",line:"#D9E9E0",lineStrong:"#C3DACD",light:1,ink:"#16302A",muted:"#5D7169",mutedSoft:"#82958D",chip:"#E3F0E9",chipText:"#3F574E"}],
    ["sakura","サクラ",{a:"#D2557A",d:"#AE3D60",s:"#C77B95",rgb:"210,85,122",bg:"#FBF1F3",card:"#FFFFFF",card2:"#FCF3F5",line:"#F0DCE2",lineStrong:"#E4C6CF",light:1,ink:"#3A2329",muted:"#7D6168",mutedSoft:"#A0848B",chip:"#F7E5EA",chipText:"#5E434A"}],
    ["sky","スカイ",{a:"#2F7FD8",d:"#1F61AE",s:"#4AA3D8",rgb:"47,127,216",bg:"#EDF3FA",card:"#FFFFFF",card2:"#F1F6FC",line:"#D8E3F0",lineStrong:"#C2D2E6",light:1,ink:"#172536",muted:"#5B6B7E",mutedSoft:"#8090A3",chip:"#E2EBF6",chipText:"#3E4F63"}],
    ["midnight","ミッドナイト",{a:"#5EC4C4",d:"#3A9B9B",s:"#9BE3D8",rgb:"94,196,196",bg:"#0B1416",card:"#142124",card2:"#1C2D31",line:"#22363A",lineStrong:"#2F4A4F"}],
    ["wine","ワイン",{a:"#E0607E",d:"#B9435F",s:"#F2A7B8",rgb:"224,96,126",bg:"#140B0E",card:"#21141A",card2:"#2D1C23",line:"#33212A",lineStrong:"#47303A"}]
  ];
  L.forEach(function(x){if(!P62_THEMES.some(function(t){return t[0]===x[0];}))P62_THEMES.push(x);});
})();
var P69_LKEYS=["--ink","--ink2","--muted","--mutedSoft","--chipBg","--chipText","--pillBg","--track2","--sky","--bg2","--paper","--shadow"];
var _p69Apply=p62ApplyTheme;
p62ApplyTheme=function(){
  _p69Apply.apply(this,arguments);
  var t=null;P62_THEMES.forEach(function(x){if(x[0]===settings.p62Theme)t=x[2];});
  var light=!!(t&&t.light);
  [document.documentElement,document.body].forEach(function(el){
    if(!el)return;P69_LKEYS.forEach(function(k){el.style.removeProperty(k);});
    if(!light)return;
    var m={"--ink":t.ink,"--ink2":t.ink,"--muted":t.muted,"--mutedSoft":t.mutedSoft,"--chipBg":t.chip,"--chipText":t.chipText,"--pillBg":t.chip,"--track2":t.line,"--sky":t.card2,"--bg2":t.bg,"--paper":t.bg,"--shadow":"0 1px 2px rgba(0,0,0,.05),0 4px 14px rgba(0,0,0,.05)"};
    Object.keys(m).forEach(function(k){el.style.setProperty(k,m[k]);});
  });
  document.body.classList.toggle("p69-light",light);
  try{var mt=document.querySelector('meta[name="theme-color"]');if(mt)mt.setAttribute("content",t&&t.bg?t.bg:"#000000");document.documentElement.style.colorScheme=light?"light":"dark";}catch(_){}
};
p62ApplyTheme();
/* 設定の色見本：明るいテーマは枠線つきで見やすく */
(function(){try{var st=document.createElement("style");st.textContent=[
'.p62-sw{display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:10px 8px!important}',
'.p62-swb small{white-space:nowrap;font-size:11px}',
'.p62-chip{box-shadow:inset 0 0 0 1px rgba(127,127,127,.35)}',
/* 明るいテーマ共通の補正（暗い前提の固定色を打ち消す） */
'body.p69-light{color:var(--ink)}',
'body.p69-light .card,body.p69-light .qcard,body.p69-light .p47-card,body.p69-light .p62-lrow{box-shadow:var(--shadow)}',
'body.p69-light .p59-pic.p68-scene svg{box-shadow:0 4px 14px rgba(0,0,0,.12)!important}',
'body.p69-light nav.tabs,body.p69-light .tabbar,body.p69-light nav.bottom{background:rgba(255,255,255,.88)!important;border-top:1px solid var(--line)!important;-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}',
'body.p69-light .p68-g{background:var(--accentSoft)!important;color:var(--accentDeep)!important}',
'body.p69-light #p68pop{background:var(--card)!important;color:var(--ink)!important;border:1px solid var(--line)!important;box-shadow:0 10px 30px rgba(0,0,0,.15)!important}',
'body.p69-light ::placeholder{color:var(--mutedSoft)}',
'body.p69-light input,body.p69-light textarea,body.p69-light select{color:var(--ink);background:var(--card)}',
/* 「もっと見る」：両端に余白をとって文字が端に付かないように */
'.p15-morepanel{padding:4px 18px!important;border-radius:16px!important;border:1px solid var(--line)!important}',
'.p15-morepanel .p15-sec{padding:14px 0!important;line-height:1.8}',
'.p15-morepanel .p15-seclabel{margin-bottom:6px}',
'.p15-morepanel .kv{display:flex;flex-wrap:wrap;gap:6px}',
'.p15-morepanel .kv span{padding:3px 10px;border-radius:999px;background:var(--chipBg);color:var(--chipText);font-size:12px;font-weight:700}',
'.p69-stat{display:flex;gap:14px;margin-top:8px;font-size:12.5px;color:var(--muted)}',
'.p69-stat b{font-weight:800;color:var(--ink);margin-left:3px}',
'.p8-grammarpanel{padding-left:18px!important;padding-right:18px!important}',
'.p15-morepanel .p15-sec{border-top-color:rgba(127,127,127,.22)!important}',
'.p15-morepanel .p15-sec:first-child{border-top:none!important}',
'body.p62-bg .p52-next,body.p62-bg .p47-btn.primary{background:var(--accent)!important;background-image:none!important;color:#fff!important;border-color:var(--accent)!important}'
].join("");document.head.appendChild(st);}catch(_){}})();
/* 「詳細」の品詞を日本語に、成績を言葉に */
var P69_POS={noun:"名詞",verb:"動詞",adjective:"形容詞",adj:"形容詞",adverb:"副詞",adv:"副詞",particle:"助詞",pronoun:"代名詞",preposition:"前置詞",prep:"前置詞",conjunction:"接続詞",conj:"接続詞",numeral:"数詞",number:"数詞",phrase:"表現",expression:"表現",interjection:"間投詞",predicative:"述語",participle:"形動詞",gerund:"副動詞",postposition:"後置詞",auxiliary:"助動詞","modal":"助動詞",other:"その他"};
function p69Fix(root){
  if(!root||!root.querySelectorAll)return;
  root.querySelectorAll(".p15-morepanel .kv span:first-child").forEach(function(s){
    var k=String(s.textContent||"").trim().toLowerCase();
    var parts=k.split(/\s*[\/,]\s*/);var ja=parts.map(function(p){return P69_POS[p]||"";});
    if(ja.every(Boolean))s.textContent=ja.join("・");
  });
  root.querySelectorAll(".p15-morepanel .small.muted").forEach(function(d){
    if(d.getAttribute("data-p69"))return;
    var m=/^〇(\d+) \/ △(\d+) \/ ✗(\d+)$/.exec(String(d.textContent||"").trim());if(!m)return;
    d.setAttribute("data-p69","1");d.className="p69-stat";
    d.innerHTML='<span>できた<b>'+m[1]+'</b></span><span>あいまい<b>'+m[2]+'</b></span><span>まちがい<b>'+m[3]+'</b></span>';
  });
}
(function(){
  var run=function(){p69Fix(document.getElementById("main"));p69Fix(document.getElementById("sheetHost"));};
  try{var mo=new MutationObserver(function(){run();});["main","sheetHost"].forEach(function(id){var el=document.getElementById(id);if(el)mo.observe(el,{childList:true,subtree:true});});}catch(_){}
  run();
})();
