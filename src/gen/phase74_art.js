/* ===== Phase74 絵：冒険の主人公・仲間・モンスター・ボス（このアプリのために一から描いたオリジナルの SVG） ===== */
/* 座標は 120×160。主人公は正面向きで、右手（画面の右）に武器・道具、左手（画面の左）に盾や本を持つ。 */
function p74Shade(hex,k){ /* k>0 で明るく、k<0 で暗く */
  var n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;
  function f(c){return Math.max(0,Math.min(255,Math.round(k>=0?c+(255-c)*k:c*(1+k))));}
  return "#"+((1<<24)+(f(r)<<16)+(f(g)<<8)+f(b)).toString(16).slice(1);
}
var P74_OUT='stroke="#2B2233" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"';
/* ---------- 手に持つ物 ---------- */
var P74_HAND={
  hoe:function(){return '<path d="M88 66L84 136" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/><path d="M80 64q10-8 20-2l-4 7q-8-3-14 1z" fill="#9AA4AE" '+P74_OUT+'/>';},
  stick:function(){return '<path d="M90 56L84 138" stroke="#7A4E26" stroke-width="6" stroke-linecap="round"/><circle cx="90" cy="56" r="4" fill="#7A4E26"/>';},
  sword:function(){return '<path d="M88 40l5 4-3 52-5 0z" fill="#DCE3EA" '+P74_OUT+'/><path d="M80 96h16" stroke="#7A5A2E" stroke-width="5" stroke-linecap="round"/><path d="M88 99v10" stroke="#5A3A1E" stroke-width="5"/>';},
  bigsword:function(){return '<path d="M87 18l7 6-2 72h-8z" fill="#EEF3F8" '+P74_OUT+'/><path d="M89 26v66" stroke="#B9C6D3" stroke-width="2"/><path d="M76 96h24" stroke="#C99A2E" stroke-width="6" stroke-linecap="round"/><circle cx="88" cy="96" r="4" fill="#E2483B" '+P74_OUT+'/><path d="M88 100v12" stroke="#5A3A1E" stroke-width="5"/>';},
  lightsword:function(){return '<g><path d="M86 8l9 8-2 80h-10z" fill="#FFF7D6" '+P74_OUT+'/><path d="M89 16v76" stroke="#FFD34D" stroke-width="3"/><path d="M72 96h32" stroke="#E8B923" stroke-width="7" stroke-linecap="round"/><path d="M88 90l6 6-6 6-6-6z" fill="#4FB3E8" '+P74_OUT+'/><path d="M88 102v12" stroke="#5A3A1E" stroke-width="5"/></g>';},
  staff:function(){return '<path d="M88 46L84 140" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/><path d="M88 46q-8-6-2-14q8 2 6 12" fill="none" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/>';},
  crystal:function(){return '<path d="M88 50L84 140" stroke="#6B4A8A" stroke-width="5" stroke-linecap="round"/><path d="M88 22l9 14-9 16-9-16z" fill="#8FD3F4" '+P74_OUT+'/><path d="M88 26l4 10-4 10" fill="none" stroke="#fff" stroke-width="1.6" opacity=".8"/>';},
  bigstaff:function(){return '<path d="M88 44L84 142" stroke="#E8B923" stroke-width="5" stroke-linecap="round"/><circle cx="88" cy="30" r="12" fill="#FFF3B0" '+P74_OUT+'/><circle cx="88" cy="30" r="6" fill="#FFD34D"/><path d="M74 30a14 14 0 0 1 28 0" fill="none" stroke="#E8B923" stroke-width="4"/><path d="M70 18l4 4M106 18l-4 4M88 10v5" stroke="#FFD34D" stroke-width="2.5" stroke-linecap="round"/>';},
  flag:function(){return '<path d="M88 30L86 140" stroke="#7A4E26" stroke-width="4" stroke-linecap="round"/><path d="M88 32h24l-6 9 6 9H88z" fill="#3E8E5A" '+P74_OUT+'/><circle cx="99" cy="41" r="3" fill="#F5E6A8"/>';},
  key:function(){return '<path d="M88 64v40" stroke="#C99A2E" stroke-width="5" stroke-linecap="round"/><circle cx="88" cy="58" r="7" fill="none" stroke="#C99A2E" stroke-width="4"/><path d="M88 96h7M88 102h5" stroke="#C99A2E" stroke-width="3"/>';},
  scepter:function(){return '<path d="M88 46L85 132" stroke="#C99A2E" stroke-width="5" stroke-linecap="round"/><circle cx="88" cy="38" r="9" fill="#E2483B" '+P74_OUT+'/><path d="M80 46h16" stroke="#E8B923" stroke-width="4" stroke-linecap="round"/><path d="M88 26v4M84 28h8" stroke="#E8B923" stroke-width="2.5" stroke-linecap="round"/>';},
  bigscepter:function(){return '<path d="M88 40L85 136" stroke="#E8B923" stroke-width="6" stroke-linecap="round"/><path d="M76 34l12-14 12 14-12 10z" fill="#9B7BEA" '+P74_OUT+'/><path d="M88 24v14" stroke="#fff" stroke-width="1.6" opacity=".7"/><path d="M78 44h20" stroke="#E8B923" stroke-width="5" stroke-linecap="round"/>';},
  bamboo:function(){return '<path d="M90 24L84 140" stroke="#8DB255" stroke-width="5" stroke-linecap="round"/><path d="M90 24l3-10 1 10z" fill="#C8D9A0" '+P74_OUT+'/><path d="M86 70h6M85 100h6" stroke="#5E7F2F" stroke-width="2"/>';},
  katana:function(){return '<path d="M84 98q4-40 14-60l2 2q-8 22-10 58z" fill="#E6ECF2" '+P74_OUT+'/><ellipse cx="87" cy="99" rx="7" ry="2.6" fill="#2B2233"/><path d="M87 101v12" stroke="#3A2A55" stroke-width="5"/><path d="M85 103l4 3M85 108l4 3" stroke="#E8B923" stroke-width="1.4"/>';},
  meito:function(){return '<g><path d="M83 98q4-46 17-70l3 2q-10 26-12 68z" fill="#F4F8FB" '+P74_OUT+'/><path d="M88 92q3-30 12-58" stroke="#9FB6CC" stroke-width="1.4" fill="none"/><ellipse cx="87" cy="99" rx="8" ry="3" fill="#C99A2E" '+P74_OUT+'/><path d="M87 101v13" stroke="#7A1F2B" stroke-width="5"/></g>';},
  saihai:function(){return '<path d="M88 70v40" stroke="#2B2233" stroke-width="4" stroke-linecap="round"/><path d="M88 70q-12-8-14-24M88 70q-4-14 0-28M88 70q8-10 14-24M88 70q-10-2-18-12M88 70q12-4 18-14" stroke="#FFFFFF" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M88 70q-12-8-14-24M88 70q8-10 14-24" stroke="#C9D3DD" stroke-width="1" fill="none"/>';},
  rod:function(){return '<path d="M86 132L100 30" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/><path d="M100 30q12 30 6 56" fill="none" stroke="#C9D3DD" stroke-width="1.2"/><circle cx="106" cy="86" r="3" fill="#E2483B"/>';},
  oar:function(){return '<path d="M90 40L84 128" stroke="#9A6A36" stroke-width="5" stroke-linecap="round"/><path d="M84 124q-6 10 0 22q8 2 8-10z" fill="#B98247" '+P74_OUT+'/>';},
  cutlass:function(){return '<path d="M86 96q0-34 12-50q4 4 2 8q-8 16-8 42z" fill="#E6ECF2" '+P74_OUT+'/><path d="M80 98q8 8 16 0" fill="none" stroke="#C99A2E" stroke-width="4"/><path d="M88 100v12" stroke="#5A3A1E" stroke-width="5"/>';},
  scope:function(){return '<path d="M82 104l18-40" stroke="#B98247" stroke-width="7" stroke-linecap="round"/><path d="M95 74l7-16" stroke="#C99A2E" stroke-width="9" stroke-linecap="round"/><circle cx="102" cy="58" r="3" fill="#8FD3F4"/>';},
  admflag:function(){return '<path d="M88 22L86 140" stroke="#C99A2E" stroke-width="4" stroke-linecap="round"/><path d="M88 24q14-4 26 2v24q-12-6-26-2z" fill="#1F4E8C" '+P74_OUT+'/><path d="M101 30l2 5h5l-4 3 2 5-5-3-4 3 2-5-4-3h5z" fill="#FFD34D"/>';}
};
var P74_OFF={
  none:function(){return "";},
  basket:function(){return '<path d="M18 104h22l-3 18H21z" fill="#C99A5B" '+P74_OUT+'/><path d="M20 104q9-12 18 0" fill="none" stroke="#8A5A2B" stroke-width="3"/><circle cx="25" cy="102" r="3" fill="#E2483B"/><circle cx="32" cy="101" r="3" fill="#F2A541"/>';},
  roundshield:function(){return '<circle cx="28" cy="106" r="15" fill="#A0703C" '+P74_OUT+'/><circle cx="28" cy="106" r="5" fill="#C9D3DD" '+P74_OUT+'/>';},
  kiteshield:function(){return '<path d="M14 90h28v16q0 16-14 24q-14-8-14-24z" fill="#D8DEE6" '+P74_OUT+'/><path d="M28 94v30M18 104h20" stroke="#1F4E8C" stroke-width="4"/>';},
  holyshield:function(){return '<path d="M12 88h32v18q0 18-16 26q-16-8-16-26z" fill="#F6F1E1" '+P74_OUT+'/><path d="M28 92v34M16 104h24" stroke="#E8B923" stroke-width="5"/><circle cx="28" cy="104" r="4" fill="#4FB3E8"/>';},
  book:function(){return '<rect x="14" y="96" width="26" height="20" rx="2" fill="#7A3B2E" '+P74_OUT+'/><path d="M18 100h18" stroke="#E8B923" stroke-width="2"/><circle cx="27" cy="108" r="3" fill="#E8B923"/>';},
  orb:function(){return '<circle cx="26" cy="104" r="10" fill="#B9A6F2" '+P74_OUT+'/><circle cx="23" cy="101" r="3" fill="#fff" opacity=".8"/>';},
  scroll:function(){return '<rect x="14" y="98" width="26" height="14" rx="3" fill="#F5E6C4" '+P74_OUT+'/><path d="M18 103h18M18 107h12" stroke="#B38A55" stroke-width="1.6"/>';},
  lantern:function(){return '<path d="M27 88v6" stroke="#2B2233" stroke-width="2"/><rect x="19" y="94" width="16" height="20" rx="4" fill="#FFD34D" '+P74_OUT+'/><path d="M19 100h16M19 108h16" stroke="#C99A2E" stroke-width="1.5"/>';},
  compass:function(){return '<circle cx="26" cy="106" r="10" fill="#E8D5A8" '+P74_OUT+'/><path d="M26 98l3 8-3 8-3-8z" fill="#E2483B"/>';},
  map:function(){return '<path d="M12 96l9 3 9-3 9 3v18l-9-3-9 3-9-3z" fill="#F0DFB2" '+P74_OUT+'/><path d="M17 106q6-4 10 2t10-2" stroke="#E2483B" stroke-width="1.6" fill="none" stroke-dasharray="2 2"/>';},
  gunbai:function(){return '<path d="M28 116v12" stroke="#2B2233" stroke-width="3"/><path d="M16 102q12-20 24 0q-2 14-12 16q-10-2-12-16z" fill="#1F1F1F" '+P74_OUT+'/><circle cx="28" cy="104" r="5" fill="#E2483B"/>';}
};
/* ---------- 頭の上 ---------- */
var P74_HEAD={
  none:function(){return "";},
  straw:function(){return '<ellipse cx="60" cy="40" rx="34" ry="8" fill="#E9C46A" '+P74_OUT+'/><path d="M42 40q2-16 18-16t18 16z" fill="#F2D488" '+P74_OUT+'/><path d="M43 36h34" stroke="#C0392B" stroke-width="3"/>';},
  bandana:function(c){return '<path d="M36 46q2-22 24-22t24 22q-24-8-48 0z" fill="'+(c||"#C0392B")+'" '+P74_OUT+'/><path d="M83 44l8 6-6 2" fill="'+(c||"#C0392B")+'" '+P74_OUT+'/><circle cx="50" cy="36" r="1.6" fill="#fff"/><circle cx="66" cy="33" r="1.6" fill="#fff"/>';},
  hood:function(c){return '<path d="M32 62q-2-38 28-38t28 38q-6-24-28-24t-28 24z" fill="'+(c||"#7A6A55")+'" '+P74_OUT+'/>';},
  leathercap:function(){return '<path d="M36 48q0-24 24-24t24 24z" fill="#9A6A36" '+P74_OUT+'/><path d="M36 48h48" stroke="#6E4A22" stroke-width="4"/>';},
  helmet:function(){return '<path d="M34 54q0-32 26-32t26 32z" fill="#C9D3DD" '+P74_OUT+'/><path d="M60 22v32" stroke="#8C9AA8" stroke-width="3"/><path d="M34 54h52" stroke="#8C9AA8" stroke-width="4"/>';},
  plume:function(c){return '<path d="M60 22q16-16 30-6q-12 0-18 12" fill="'+(c||"#E2483B")+'" '+P74_OUT+'/><path d="M34 54q0-32 26-32t26 32z" fill="#DCE3EA" '+P74_OUT+'/><path d="M34 54h52" stroke="#E8B923" stroke-width="4"/><path d="M60 24v30" stroke="#E8B923" stroke-width="3"/>';},
  holyhelm:function(){return '<path d="M60 10l6 12h-12z" fill="#FFD34D" '+P74_OUT+'/><path d="M32 54q0-34 28-34t28 34z" fill="#F6F1E1" '+P74_OUT+'/><path d="M32 54h56" stroke="#E8B923" stroke-width="5"/><path d="M40 34q20-10 40 0" fill="none" stroke="#E8B923" stroke-width="3"/><path d="M28 40l-10-12 14 4M92 40l10-12-14 4" fill="#F6F1E1" '+P74_OUT+'/>';},
  wizard:function(c){return '<path d="M36 46h48l-14-40q-2-6 4-8q-14-2-20 8z" fill="'+(c||"#4A3F8C")+'" '+P74_OUT+'/><ellipse cx="60" cy="46" rx="30" ry="6" fill="'+(c||"#4A3F8C")+'" '+P74_OUT+'/>';},
  starhat:function(c){return '<path d="M34 46h52l-16-42q-4-4 6-6q-20-4-26 10z" fill="'+(c||"#2C3E80")+'" '+P74_OUT+'/><ellipse cx="60" cy="46" rx="32" ry="7" fill="'+(c||"#2C3E80")+'" '+P74_OUT+'/><path d="M56 26l2 4 4 .5-3 3 1 4-4-2-4 2 1-4-3-3 4-.5z" fill="#FFD34D"/><circle cx="68" cy="16" r="2" fill="#FFD34D"/><circle cx="48" cy="38" r="1.6" fill="#FFD34D"/>';},
  sagehat:function(){return '<path d="M32 46h56l-18-44q-6-2 2-8q-22-2-30 14z" fill="#F6F1E1" '+P74_OUT+'/><ellipse cx="60" cy="46" rx="34" ry="7" fill="#F6F1E1" '+P74_OUT+'/><path d="M40 42q20-6 40 0" stroke="#E8B923" stroke-width="3" fill="none"/><circle cx="60" cy="30" r="4" fill="#4FB3E8" '+P74_OUT+'/>';},
  circlet:function(){return '<path d="M36 40q24-8 48 0" fill="none" stroke="#C99A2E" stroke-width="4"/><circle cx="60" cy="36" r="3" fill="#4FB3E8"/>';},
  crown:function(){return '<path d="M42 40l2-16 8 8 8-12 8 12 8-8 2 16z" fill="#E8B923" '+P74_OUT+'/><circle cx="60" cy="32" r="2.5" fill="#E2483B"/>';},
  bigcrown:function(){return '<path d="M38 42l0-22 10 10 12-18 12 18 10-10 0 22z" fill="#FFD34D" '+P74_OUT+'/><path d="M38 42h44" stroke="#C99A2E" stroke-width="4"/><circle cx="60" cy="28" r="3.5" fill="#E2483B" '+P74_OUT+'/><circle cx="46" cy="36" r="2.2" fill="#4FB3E8"/><circle cx="74" cy="36" r="2.2" fill="#3E8E5A"/>';},
  jingasa:function(){return '<path d="M24 46q36-26 72 0z" fill="#2B2233" '+P74_OUT+'/><circle cx="60" cy="38" r="3" fill="#E2483B"/>';},
  hachigane:function(){return '<path d="M36 44q24-8 48 0" fill="none" stroke="#F6F1E1" stroke-width="6"/><rect x="54" y="38" width="12" height="6" rx="1" fill="#9AA4AE" '+P74_OUT+'/>';},
  kabuto:function(){return '<path d="M32 52q0-30 28-30t28 30z" fill="#3A3F58" '+P74_OUT+'/><path d="M28 52q4 10 12 12M92 52q-4 10-12 12" fill="none" stroke="#3A3F58" stroke-width="6" stroke-linecap="round"/><path d="M60 22v-4" stroke="#C99A2E" stroke-width="3"/><path d="M50 22q10-12 20 0" fill="none" stroke="#C99A2E" stroke-width="4"/>';},
  greatkabuto:function(){return '<path d="M30 52q0-32 30-32t30 32z" fill="#7A1F2B" '+P74_OUT+'/><path d="M26 52q4 12 14 14M94 52q-4 12-14 14" fill="none" stroke="#7A1F2B" stroke-width="7" stroke-linecap="round"/><path d="M60 22l-14-18q8 4 14 12q6-8 14-12z" fill="#E8B923" '+P74_OUT+'/><circle cx="60" cy="30" r="4" fill="#E8B923" '+P74_OUT+'/>';},
  sailorcap:function(){return '<path d="M38 44q0-18 22-18t22 18z" fill="#F6F7FA" '+P74_OUT+'/><path d="M38 44h44" stroke="#1F4E8C" stroke-width="4"/>';},
  tricorn:function(c){return '<path d="M28 44q10-18 32-18t32 18q-10-6-32-6t-32 6z" fill="'+(c||"#2B2233")+'" '+P74_OUT+'/><path d="M34 42q26-8 52 0" stroke="#E8B923" stroke-width="2.5" fill="none"/>';},
  admiral:function(){return '<path d="M24 44q12-22 36-22t36 22q-10-8-36-8t-36 8z" fill="#1A2B4C" '+P74_OUT+'/><path d="M32 40q28-10 56 0" stroke="#E8B923" stroke-width="3" fill="none"/><path d="M60 26l3 6 6 1-4 4 1 6-6-3-6 3 1-6-4-4 6-1z" fill="#FFD34D"/><path d="M84 30q10-10 14-4q-6 0-10 8" fill="#F6F1E1" '+P74_OUT+'/>';}
};
/* ---------- 服 ---------- */
function p74Body(o){
  var c=o.c||"#7E9C5A",d=p74Shade(c,-.25),t=o.t||"#E8B923",s="";
  if(o.type==="tunic"){ /* 農民の服 */
    s+='<path d="M42 84q18-8 36 0l4 38H38z" fill="'+c+'" '+P74_OUT+'/><path d="M48 92h24v30H48z" fill="'+(o.apron||"#C9A66B")+'" '+P74_OUT+'/><path d="M48 92l-4-8M72 92l4-8" stroke="'+(o.apron||"#C9A66B")+'" stroke-width="3"/><path d="M40 118h40" stroke="#6E4A22" stroke-width="4"/>';
    if(o.patch)s+='<rect x="64" y="104" width="7" height="7" fill="#B07A47" '+P74_OUT+'/>';
  }else if(o.type==="armor"){
    s+='<path d="M40 84q20-10 40 0l4 38H36z" fill="'+c+'" '+P74_OUT+'/><path d="M46 88q14-6 28 0v20q-14 6-28 0z" fill="'+p74Shade(c,.35)+'" '+P74_OUT+'/><path d="M60 88v26" stroke="'+d+'" stroke-width="2"/><path d="M38 116h44" stroke="'+t+'" stroke-width="5"/>';
    s+='<ellipse cx="40" cy="88" rx="8" ry="6" fill="'+p74Shade(c,.2)+'" '+P74_OUT+'/><ellipse cx="80" cy="88" rx="8" ry="6" fill="'+p74Shade(c,.2)+'" '+P74_OUT+'/>';
    if(o.emblem)s+='<path d="M60 92l5 6-5 8-5-8z" fill="'+t+'" '+P74_OUT+'/>';
  }else if(o.type==="robe"){
    s+='<path d="M42 84q18-8 36 0l10 62H32z" fill="'+c+'" '+P74_OUT+'/><path d="M60 86v60" stroke="'+t+'" stroke-width="3"/><path d="M34 140h52" stroke="'+t+'" stroke-width="4"/><path d="M42 106h36" stroke="'+(o.belt||"#6E4A22")+'" stroke-width="4"/>';
    if(o.stars)s+='<path d="M48 124l1.5 3 3 .4-2.2 2 .6 3-2.9-1.5-2.9 1.5.6-3-2.2-2 3-.4z" fill="'+t+'"/><circle cx="72" cy="120" r="1.8" fill="'+t+'"/><circle cx="66" cy="132" r="1.5" fill="'+t+'"/>';
  }else if(o.type==="royal"){
    s+='<path d="M40 84q20-10 40 0l8 62H32z" fill="'+c+'" '+P74_OUT+'/><path d="M40 84q20 10 40 0" fill="none" stroke="#F6F1E1" stroke-width="7"/><path d="M60 92v54" stroke="#F6F1E1" stroke-width="6"/><circle cx="60" cy="100" r="1.4" fill="#2B2233"/><circle cx="60" cy="116" r="1.4" fill="#2B2233"/><circle cx="60" cy="132" r="1.4" fill="#2B2233"/><path d="M42 108h36" stroke="'+t+'" stroke-width="4"/>';
  }else if(o.type==="samurai"){
    s+='<path d="M42 84q18-8 36 0l4 38H38z" fill="'+(o.under||"#3A3F58")+'" '+P74_OUT+'/>';
    s+='<path d="M44 88h32v26H44z" fill="'+c+'" '+P74_OUT+'/><path d="M44 96h32M44 104h32" stroke="'+d+'" stroke-width="2"/>';
    s+='<path d="M30 86h14v18H32z" fill="'+c+'" '+P74_OUT+'/><path d="M90 86H76v18h12z" fill="'+c+'" '+P74_OUT+'/><path d="M31 92h13M31 98h13M76 92h13M76 98h13" stroke="'+t+'" stroke-width="1.5"/>';
    s+='<path d="M40 114l-2 14h44l-2-14z" fill="'+c+'" '+P74_OUT+'/><path d="M50 114v14M60 114v14M70 114v14" stroke="'+d+'" stroke-width="2"/>';
    if(o.haori)s+='<path d="M38 84l-6 40h10l4-36M82 84l6 40H78l-4-36" fill="'+o.haori+'" '+P74_OUT+'/>';
  }else if(o.type==="sailor"){
    s+='<path d="M42 84q18-8 36 0l4 38H38z" fill="'+c+'" '+P74_OUT+'/><path d="M42 84l18 14 18-14" fill="none" stroke="'+t+'" stroke-width="4"/><path d="M38 118h44" stroke="#6E4A22" stroke-width="4"/><path d="M44 100h32M44 108h32" stroke="'+p74Shade(c,.4)+'" stroke-width="3"/>';
  }else if(o.type==="coat"){
    s+='<path d="M40 84q20-10 40 0l8 58H32z" fill="'+c+'" '+P74_OUT+'/><path d="M52 86l8 16 8-16" fill="#F6F1E1" '+P74_OUT+'/><path d="M56 102v40M64 102v40" stroke="'+t+'" stroke-width="2.5"/><circle cx="54" cy="112" r="2" fill="'+t+'"/><circle cx="66" cy="112" r="2" fill="'+t+'"/><circle cx="54" cy="124" r="2" fill="'+t+'"/><circle cx="66" cy="124" r="2" fill="'+t+'"/>';
    if(o.epaulet)s+='<path d="M34 86q6-6 12 0" stroke="'+t+'" stroke-width="5" fill="none"/><path d="M74 86q6-6 12 0" stroke="'+t+'" stroke-width="5" fill="none"/>';
  }
  return s;
}
/* ---------- 主人公・仲間の全身 ---------- */
function p74Person(o){
  o=o||{};var skin=o.skin||"#F3C9A0",hair=o.hair||"#5A3A22",s="";
  if(o.aura)s+='<circle cx="60" cy="86" r="56" fill="'+o.aura+'" opacity=".22"/><circle cx="60" cy="86" r="44" fill="'+o.aura+'" opacity=".18"/>';
  s+='<ellipse cx="60" cy="150" rx="30" ry="5" fill="#000" opacity=".18"/>';
  if(o.cape)s+='<path d="M40 84q-14 30-10 62h60q4-32-10-62z" fill="'+o.cape+'" '+P74_OUT+'/><path d="M40 84q20 8 40 0" fill="none" stroke="'+p74Shade(o.cape,-.3)+'" stroke-width="3"/>';
  /* 足 */
  var boot=o.boot||"#5A3A22";
  if(!(o.body&&(o.body.type==="robe"||o.body.type==="royal")))s+='<path d="M48 120v22M72 120v22" stroke="'+(o.pants||"#5C5470")+'" stroke-width="10" stroke-linecap="round"/>';
  s+='<path d="M41 144q0-6 9-6h4v8H42zM79 144q0-6-9-6h-4v8h12z" fill="'+boot+'" '+P74_OUT+'/>';
  s+=P74_HAND[o.hand||"none"]?P74_HAND[o.hand]():"";
  s+=p74Body(o.body||{type:"tunic"});
  /* 腕と手 */
  var sl=(o.body&&o.body.sleeve)||(o.body&&o.body.c)||"#7E9C5A";
  s+='<path d="M42 88q-10 6-12 18" stroke="'+sl+'" stroke-width="9" stroke-linecap="round" fill="none"/><path d="M78 88q8 4 10 14" stroke="'+sl+'" stroke-width="9" stroke-linecap="round" fill="none"/>';
  s+=P74_OFF[o.off||"none"]();
  s+='<circle cx="30" cy="108" r="5" fill="'+skin+'" '+P74_OUT+'/><circle cx="88" cy="104" r="5" fill="'+skin+'" '+P74_OUT+'/>';
  /* 頭 */
  s+='<path d="M54 78h12v8H54z" fill="'+skin+'"/>';
  if(o.longhair)s+='<path d="M38 50q-6 24 0 38h12q-8-14-4-36zM82 50q6 24 0 38H70q8-14 4-36z" fill="'+hair+'" '+P74_OUT+'/>';
  s+='<circle cx="60" cy="58" r="23" fill="'+skin+'" '+P74_OUT+'/>';
  s+='<path d="M37 56q0-22 23-22t23 22q-6-10-14-12q-4 6-12 6q-10 0-14 6q-4 0-6 0z" fill="'+hair+'" '+P74_OUT+'/>';
  if(o.beard)s+='<path d="M44 66q2 18 16 18t16-18q-6 6-16 6t-16-6z" fill="'+o.beard+'" '+P74_OUT+'/>';
  /* 顔：まっすぐ前を見る目、きりっとした眉 */
  s+='<path d="M47 52l8 2M73 52l-8 2" stroke="#2B2233" stroke-width="2.4" stroke-linecap="round"/>';
  s+='<ellipse cx="51" cy="60" rx="3" ry="3.8" fill="#2B2233"/><ellipse cx="69" cy="60" rx="3" ry="3.8" fill="#2B2233"/><circle cx="52" cy="58.6" r="1.1" fill="#fff"/><circle cx="70" cy="58.6" r="1.1" fill="#fff"/>';
  s+='<circle cx="45" cy="67" r="3.2" fill="#F08A7E" opacity=".45"/><circle cx="75" cy="67" r="3.2" fill="#F08A7E" opacity=".45"/>';
  if(!o.beard)s+='<path d="M55 70q5 4 10 0" stroke="#2B2233" stroke-width="2" fill="none" stroke-linecap="round"/>';
  if(o.scar)s+='<path d="M71 64l5 6" stroke="#B5523F" stroke-width="1.6"/>';
  if(o.glasses)s+='<circle cx="51" cy="60" r="6" fill="none" stroke="#2B2233" stroke-width="1.6"/><circle cx="69" cy="60" r="6" fill="none" stroke="#2B2233" stroke-width="1.6"/><path d="M57 60h6" stroke="#2B2233" stroke-width="1.6"/>';
  var hd=o.head||"none";s+=P74_HEAD[hd]?P74_HEAD[hd](o.headc):"";
  if(o.spark)s+='<path d="M18 30l3 7 7 3-7 3-3 7-3-7-7-3 7-3zM104 50l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFD34D"/>';
  return s;
}
/* 動物の仲間（ネコ・フクロウ・タカ・カモメ・オオカミ・キツネ） */
function p74Animal(kind,c){
  var s='<ellipse cx="60" cy="150" rx="26" ry="5" fill="#000" opacity=".18"/>';c=c||"#8C8C9A";var d=p74Shade(c,-.3),l=p74Shade(c,.45);
  if(kind==="cat"||kind==="fox"||kind==="wolf"){
    var tail=kind==="fox"?'<path d="M86 132q30-6 22-40q-4 20-24 28z" fill="'+c+'" '+P74_OUT+'/><path d="M106 96q2 8-4 14" stroke="#fff" stroke-width="5" stroke-linecap="round"/>':'<path d="M84 134q26-4 24-34" fill="none" stroke="'+c+'" stroke-width="8" stroke-linecap="round"/>';
    s+=tail+'<path d="M38 146q-4-40 22-44q26 4 22 44z" fill="'+c+'" '+P74_OUT+'/><path d="M50 146q-2-24 10-28q12 4 10 28z" fill="'+l+'"/>';
    var ear=kind==="wolf"?'<path d="M36 70l2-30 18 18zM84 70l-2-30-18 18z" fill="'+c+'" '+P74_OUT+'/>':'<path d="M38 66l4-26 16 16zM82 66l-4-26-16 16z" fill="'+c+'" '+P74_OUT+'/>';
    s+=ear+'<ellipse cx="60" cy="76" rx="26" ry="22" fill="'+c+'" '+P74_OUT+'/>';
    if(kind!=="cat")s+='<path d="M48 82q12 18 24 0q-12 6-24 0z" fill="'+l+'" '+P74_OUT+'/>';
    s+='<ellipse cx="50" cy="72" rx="3.6" ry="4.4" fill="#2B2233"/><ellipse cx="70" cy="72" rx="3.6" ry="4.4" fill="#2B2233"/><circle cx="51" cy="70.5" r="1.3" fill="#fff"/><circle cx="71" cy="70.5" r="1.3" fill="#fff"/><path d="M57 80l3 3 3-3z" fill="#2B2233"/>';
    if(kind==="cat")s+='<path d="M40 80h-12M40 84l-11 3M80 80h12M80 84l11 3" stroke="#2B2233" stroke-width="1.2"/>';
  }else{ /* 鳥 */
    var gull=kind==="gull";
    s+='<path d="M60 148l-6-8M64 148l6-8" stroke="#E8A33D" stroke-width="3" stroke-linecap="round"/>';
    s+='<ellipse cx="60" cy="108" rx="28" ry="34" fill="'+c+'" '+P74_OUT+'/><ellipse cx="60" cy="118" rx="18" ry="22" fill="'+l+'"/>';
    s+='<path d="M34 100q-16 14-6 34q10-6 12-20z" fill="'+d+'" '+P74_OUT+'/><path d="M86 100q16 14 6 34q-10-6-12-20z" fill="'+d+'" '+P74_OUT+'/>';
    if(kind==="owl")s+='<path d="M40 76l6-14 8 10M80 76l-6-14-8 10" fill="'+c+'" '+P74_OUT+'/><circle cx="50" cy="88" r="9" fill="#FFF7D6" '+P74_OUT+'/><circle cx="70" cy="88" r="9" fill="#FFF7D6" '+P74_OUT+'/><circle cx="50" cy="88" r="4" fill="#2B2233"/><circle cx="70" cy="88" r="4" fill="#2B2233"/><path d="M57 96l3 6 3-6z" fill="#E8A33D" '+P74_OUT+'/>';
    else s+='<circle cx="50" cy="86" r="3.6" fill="#2B2233"/><circle cx="70" cy="86" r="3.6" fill="#2B2233"/><circle cx="51" cy="85" r="1.2" fill="#fff"/><circle cx="71" cy="85" r="1.2" fill="#fff"/><path d="M54 94l6 '+(gull?'6':'10')+' 6-'+(gull?'6':'10')+'z" fill="'+(gull?"#F2B33D":"#E8A33D")+'" '+P74_OUT+'/>';
  }
  return s;
}
function p74Svg(inner,cls,vb){return '<svg class="'+(cls||"")+'" viewBox="'+(vb||"0 0 120 160")+'" aria-hidden="true">'+inner+'</svg>';}

/* ---------- モンスター（8つの形 × 色。テーマごとに違う姿になる） ---------- */
var P74_MKIND=["けだまろ","いわごろ","よるばね","きのこぼう","もやもや","かぶとん","にょろり","つぼみん"];
var P74_MCOL=[["#E36D5B","あかい"],["#4F8FD8","あおい"],["#5BAE6B","みどりの"],["#E5B53B","きいろい"],["#9A6BD6","むらさきの"],["#E58AB0","ももいろの"],["#5CB8B2","みずいろの"],["#C7823E","ちゃいろの"],["#8C93A8","はいいろの"]];
function p74Rng(seed){var x=(seed*9301+49297)%233280;return function(){x=(x*9301+49297)%233280;return x/233280;};}
function p74Eyes(cx,cy,gap,r,angry,glow){
  var e=glow?"#FFE36B":"#fff",p=glow?"#C0392B":"#2B2233",s="";
  [-1,1].forEach(function(k){var x=cx+k*gap/2;s+='<ellipse cx="'+x+'" cy="'+cy+'" rx="'+r+'" ry="'+(r*1.15)+'" fill="'+e+'" '+P74_OUT+'/><circle cx="'+(x+k*.6)+'" cy="'+(cy+r*.2)+'" r="'+(r*.5)+'" fill="'+p+'"/>';
    if(angry)s+='<path d="M'+(x-k*r*1.2)+' '+(cy-r*1.6)+'L'+(x+k*r*1.1)+' '+(cy-r*.9)+'" stroke="#2B2233" stroke-width="2.6" stroke-linecap="round"/>';});
  return s;
}
function p74Mouth(x,y,w,kind){
  if(kind===0)return '<path d="M'+(x-w)+' '+y+'q'+w+' '+(w*.8)+' '+(w*2)+' 0" fill="#7A1F2B" '+P74_OUT+'/><path d="M'+(x-w*.6)+' '+(y+.5)+'l2 4 2-4M'+(x+w*.2)+' '+(y+.5)+'l2 4 2-4" fill="#fff"/>';
  if(kind===1)return '<path d="M'+(x-w)+' '+y+'h'+(w*2)+'" stroke="#2B2233" stroke-width="2.4" stroke-linecap="round"/><path d="M'+(x-w*.7)+' '+y+'l2.5 4 2.5-4M'+(x+w*.2)+' '+y+'l2.5 4 2.5-4" fill="#fff" '+P74_OUT+'/>';
  return '<ellipse cx="'+x+'" cy="'+(y+2)+'" rx="'+(w*.6)+'" ry="'+(w*.5)+'" fill="#7A1F2B" '+P74_OUT+'/>';
}
function p74Monster(ti,boss){
  var r=p74Rng(ti*7+3),kind=ti%8,col=P74_MCOL[(ti*5+Math.floor(ti/8))%P74_MCOL.length][0];
  var c=col,d=p74Shade(c,-.28),l=p74Shade(c,.45),s='<ellipse cx="60" cy="150" rx="34" ry="5" fill="#000" opacity=".2"/>',mk=Math.floor(r()*3),angry=r()>.35;
  if(kind===0){ /* 毛玉 */
    var pts=[];for(var i=0;i<26;i++){var a=i/26*Math.PI*2,R=i%2?34:40;pts.push((60+Math.cos(a)*R).toFixed(1)+' '+(104+Math.sin(a)*R*.92).toFixed(1));}
    s+='<path d="M'+pts.join("L")+'z" fill="'+c+'" '+P74_OUT+'/><ellipse cx="60" cy="112" rx="20" ry="16" fill="'+l+'" opacity=".55"/>';
    s+='<path d="M44 144v6h6v-6M70 144v6h6v-6" fill="'+d+'" '+P74_OUT+'/>'+p74Eyes(60,96,22,6.5,angry)+p74Mouth(60,116,8,mk);
  }else if(kind===1){ /* 岩 */
    s+='<path d="M28 146l6-52 18-18h20l18 22 4 48z" fill="'+p74Shade(c,-.1)+'" '+P74_OUT+'/><path d="M38 100l10 6M76 92l-8 10M44 130l12-4" stroke="'+d+'" stroke-width="2.4" stroke-linecap="round"/>';
    s+='<path d="M24 110q-10 10-6 22l12-4z" fill="'+d+'" '+P74_OUT+'/><path d="M96 110q10 10 6 22l-12-4z" fill="'+d+'" '+P74_OUT+'/><path d="M46 78l4-12 8 8z" fill="'+l+'" '+P74_OUT+'/>'+p74Eyes(60,100,24,5.5,true)+p74Mouth(60,120,9,1);
  }else if(kind===2){ /* コウモリのような羽 */
    s+='<path d="M48 100L8 78q4 18 6 30q8-6 12 2q6-8 12 0z" fill="'+d+'" '+P74_OUT+'/><path d="M72 100l40-22q-4 18-6 30q-8-6-12 2q-6-8-12 0z" fill="'+d+'" '+P74_OUT+'/>';
    s+='<ellipse cx="60" cy="104" rx="22" ry="24" fill="'+c+'" '+P74_OUT+'/><path d="M44 86l-4-16 12 10zM76 86l4-16-12 10z" fill="'+c+'" '+P74_OUT+'/><path d="M50 140l4-12 6 12 6-12 4 12" fill="none" stroke="'+d+'" stroke-width="3"/>'+p74Eyes(60,100,18,5.5,angry)+p74Mouth(60,116,6,0);
  }else if(kind===3){ /* きのこ */
    s+='<path d="M44 108h32l4 38H40z" fill="#F5E6C4" '+P74_OUT+'/><path d="M18 108q0-46 42-46t42 46z" fill="'+c+'" '+P74_OUT+'/><circle cx="40" cy="90" r="6" fill="#fff" opacity=".85"/><circle cx="64" cy="76" r="7" fill="#fff" opacity=".85"/><circle cx="84" cy="96" r="5" fill="#fff" opacity=".85"/>';
    s+=p74Eyes(60,124,16,4.6,angry)+p74Mouth(60,136,5,mk);
  }else if(kind===4){ /* もやもや（雲の霊） */
    s+='<path d="M30 126q-14-4-8-20q-6-18 14-22q4-18 24-14q18-8 28 8q18 2 14 20q10 12-4 22q4 14-14 12q-6 12-20 4q-14 8-22-4q-16 4-12-6z" fill="'+l+'" '+P74_OUT+'/><path d="M44 128q4 14-6 20M60 132q2 12-4 18M76 128q6 12 0 20" stroke="'+c+'" stroke-width="4" fill="none" stroke-linecap="round"/>';
    s+=p74Eyes(60,102,22,6,angry)+p74Mouth(60,118,7,2);
  }else if(kind===5){ /* かぶと虫 */
    s+='<path d="M36 140l-10 8M84 140l10 8M34 120l-14 4M86 120l14 4" stroke="#2B2233" stroke-width="3" stroke-linecap="round"/>';
    s+='<ellipse cx="60" cy="118" rx="30" ry="28" fill="'+c+'" '+P74_OUT+'/><path d="M60 92v52" stroke="'+d+'" stroke-width="2.4"/><ellipse cx="48" cy="108" rx="6" ry="9" fill="'+l+'" opacity=".5"/>';
    s+='<ellipse cx="60" cy="86" rx="18" ry="12" fill="'+d+'" '+P74_OUT+'/><path d="M60 76q-2-20 14-32q-4 14-6 30z" fill="'+d+'" '+P74_OUT+'/>'+p74Eyes(60,86,16,4.2,true);
  }else if(kind===6){ /* にょろり（へび） */
    s+='<path d="M24 140q10-24 36-10t36-14" stroke="'+c+'" stroke-width="22" fill="none" stroke-linecap="round"/><path d="M24 140q10-24 36-10t36-14" stroke="'+l+'" stroke-width="6" fill="none" stroke-dasharray="4 8" stroke-linecap="round"/>';
    s+='<ellipse cx="88" cy="94" rx="20" ry="18" fill="'+c+'" '+P74_OUT+'/><path d="M100 104l10 4-10 2" stroke="#E2483B" stroke-width="2.4" fill="none"/>'+p74Eyes(86,90,14,4.5,angry);
  }else{ /* つぼみ（植物） */
    s+='<path d="M60 146V110" stroke="#3E8E5A" stroke-width="7"/><path d="M60 132q-22-2-30 10q16 6 30-4zM60 126q22-4 30 8q-16 6-30-2z" fill="#5BAE6B" '+P74_OUT+'/>';
    s+='<path d="M60 116q-30-4-28-34q14 6 28 0q14 6 28 0q2 30-28 34z" fill="'+c+'" '+P74_OUT+'/><path d="M34 84q6-20 26-24q20 4 26 24q-12 6-26 2q-14 4-26-2z" fill="'+l+'" '+P74_OUT+'/>'+p74Eyes(60,96,20,5,angry)+p74Mouth(60,108,6,mk);
  }
  return s;
}
function p74MonsterName(ti){var kind=ti%8,col=P74_MCOL[(ti*5+Math.floor(ti/8))%P74_MCOL.length][1];return col+" "+P74_MKIND[kind];}

/* ---------- ボス（8体。後ろほど強い） 名前はロシア語の単語から ---------- */
var P74_BOSS=[
  {n:"トゥマン",ru:"тума́н",ja:"霧",t:"霧の番人",c:"#9AAEC2"},
  {n:"カーメニ",ru:"ка́мень",ja:"石",t:"石の巨人",c:"#8C7A68"},
  {n:"ブーリャ",ru:"бу́ря",ja:"嵐",t:"嵐の大コウモリ",c:"#4E5B8C"},
  {n:"メチェーリ",ru:"мете́ль",ja:"吹雪",t:"吹雪の大ジカ",c:"#BFE3F2"},
  {n:"ヴォールク",ru:"волк",ja:"オオカミ",t:"夜のオオカミ王",c:"#4A4F63"},
  {n:"アゴーニ",ru:"ого́нь",ja:"火",t:"炎の大トカゲ",c:"#E0603A"},
  {n:"グローム",ru:"гром",ja:"雷",t:"雷の大ワシ",c:"#E5B53B"},
  {n:"チェーニ",ru:"тень",ja:"影",t:"影の竜",c:"#3A2E5C"}
];
function p74Boss(bi){
  var B=P74_BOSS[bi],c=B.c,d=p74Shade(c,-.35),l=p74Shade(c,.4),s='';
  s+='<circle cx="60" cy="92" r="58" fill="'+c+'" opacity=".16"/><ellipse cx="60" cy="151" rx="44" ry="6" fill="#000" opacity=".25"/>';
  if(bi===0){ /* 霧の番人：ランタンを持つ大きな霧のかたまり */
    s+='<path d="M22 146q-10-30 4-56q-4-34 34-40q38 6 34 40q14 26 4 56q-10-8-14 0q-8-10-14 0q-6-10-14 0q-8-8-14 0q-6-8-20 0z" fill="'+l+'" '+P74_OUT+'/><path d="M30 100q30 12 60 0" stroke="'+c+'" stroke-width="4" fill="none"/>';
    s+='<path d="M96 96v10" stroke="#2B2233" stroke-width="2"/><rect x="90" y="106" width="14" height="18" rx="4" fill="#FFD34D" '+P74_OUT+'/>'+p74Eyes(60,78,24,6.5,true,true)+p74Mouth(60,96,8,2);
  }else if(bi===1){ /* 石の巨人 */
    s+='<path d="M14 92l14-12 10 4-4 34-16 6z" fill="'+d+'" '+P74_OUT+'/><path d="M106 92l-14-12-10 4 4 34 16 6z" fill="'+d+'" '+P74_OUT+'/>';
    s+='<path d="M30 148l4-70 14-18h24l14 18 4 70z" fill="'+c+'" '+P74_OUT+'/><path d="M44 50h32l4 22H40z" fill="'+l+'" '+P74_OUT+'/><path d="M40 96l12 8M80 92l-10 12M48 130l14-6M72 126l6 10" stroke="'+d+'" stroke-width="3" stroke-linecap="round"/>';
    s+='<path d="M52 104l8-8 8 8-8 8z" fill="#7FE0C8" '+P74_OUT+'/>'+p74Eyes(60,62,18,4.4,true,true);
  }else if(bi===2){ /* 嵐の大コウモリ */
    s+='<path d="M50 90L2 50q2 30 8 48q10-8 14 4q8-10 14 2q6-8 12 0z" fill="'+d+'" '+P74_OUT+'/><path d="M70 90l48-40q-2 30-8 48q-10-8-14 4q-8-10-14 2q-6-8-12 0z" fill="'+d+'" '+P74_OUT+'/>';
    s+='<ellipse cx="60" cy="100" rx="26" ry="32" fill="'+c+'" '+P74_OUT+'/><path d="M40 76l-6-24 18 14zM80 76l6-24-18 14z" fill="'+c+'" '+P74_OUT+'/><path d="M28 30l6 10-4 2 6 10M92 24l-6 12 4 2-6 10" stroke="#FFD34D" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    s+=p74Eyes(60,94,20,6,true,true)+p74Mouth(60,114,9,0)+'<path d="M48 146l4-16 8 14 8-14 4 16" fill="none" stroke="'+d+'" stroke-width="4"/>';
  }else if(bi===3){ /* 吹雪の大ジカ */
    s+='<path d="M44 52q-14-16-10-34M44 40l-10-6M40 28l-8 0M76 52q14-16 10-34M76 40l10-6M80 28l8 0" stroke="#E8F6FC" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M44 52q-14-16-10-34M76 52q14-16 10-34" stroke="#2B2233" stroke-width="1.4" fill="none"/>';
    s+='<path d="M34 148l2-36q-6-30 24-34q30 4 24 34l2 36z" fill="'+l+'" '+P74_OUT+'/><ellipse cx="60" cy="68" rx="18" ry="20" fill="'+c+'" '+P74_OUT+'/><ellipse cx="60" cy="80" rx="9" ry="7" fill="#fff" '+P74_OUT+'/><circle cx="60" cy="78" r="3" fill="#2B2233"/>';
    s+='<path d="M18 60l3 5-3 5-3-5zM102 90l3 5-3 5-3-5zM24 116l3 5-3 5-3-5z" fill="#fff" stroke="#9FD3EA"/>'+p74Eyes(60,62,16,4.2,true,true);
  }else if(bi===4){ /* 夜のオオカミ王 */
    s+='<path d="M40 60l-4-34 22 20zM80 60l4-34-22 20z" fill="'+c+'" '+P74_OUT+'/><path d="M26 148q-8-50 34-60q42 10 34 60z" fill="'+c+'" '+P74_OUT+'/><path d="M42 148q0-30 18-36q18 6 18 36z" fill="'+l+'"/>';
    s+='<ellipse cx="60" cy="72" rx="28" ry="24" fill="'+c+'" '+P74_OUT+'/><path d="M46 80q14 24 28 0q-14 8-28 0z" fill="'+l+'" '+P74_OUT+'/><path d="M56 84l4 4 4-4z" fill="#2B2233"/><path d="M50 90l2 6 2-6M66 90l2 6 2-6" fill="#fff"/>';
    s+='<path d="M44 40l4-12 6 8 6-12 6 12 6-8 4 12z" fill="#C99A2E" '+P74_OUT+'/>'+p74Eyes(60,68,22,4.6,true,true);
  }else if(bi===5){ /* 炎の大トカゲ */
    s+='<path d="M88 130q26 0 24-30q-6 14-22 16" fill="'+c+'" '+P74_OUT+'/><path d="M30 148l4-28q-2-40 26-44q28 4 26 44l4 28z" fill="'+c+'" '+P74_OUT+'/><path d="M44 148q0-22 16-28q16 6 16 28z" fill="#F7C873"/>';
    s+='<path d="M40 56q2-20 20-22q18 2 20 22q0 18-20 22q-20-4-20-22z" fill="'+c+'" '+P74_OUT+'/><path d="M46 34l4-10 4 8 6-12 6 12 4-8 4 10" fill="#FFD34D" '+P74_OUT+'/>';
    s+='<path d="M50 66q10 8 20 0" stroke="#2B2233" stroke-width="2.6" fill="none"/><path d="M68 70q14 6 24-2q-6 10 2 16q-14 0-20-8" fill="#FFB23E" '+P74_OUT+'/>'+p74Eyes(60,52,18,4.4,true,true);
  }else if(bi===6){ /* 雷の大ワシ */
    s+='<path d="M48 92L4 66q10 30 20 44q8-4 12 4q6-6 12 2zM72 92l44-26q-10 30-20 44q-8-4-12 4q-6-6-12 2z" fill="'+c+'" '+P74_OUT+'/><path d="M10 72l10 6M18 86l10 4M110 72l-10 6M102 86l-10 4" stroke="'+d+'" stroke-width="2"/>';
    s+='<ellipse cx="60" cy="108" rx="24" ry="34" fill="'+p74Shade(c,-.15)+'" '+P74_OUT+'/><ellipse cx="60" cy="68" rx="18" ry="18" fill="#F6F1E1" '+P74_OUT+'/><path d="M56 72l14 4-12 8z" fill="#E8A33D" '+P74_OUT+'/>';
    s+='<path d="M98 20l-10 18h8l-8 18" stroke="#FFD34D" stroke-width="4" fill="none" stroke-linejoin="round"/><path d="M52 144l-4 6M60 144v6M68 144l4 6" stroke="#E8A33D" stroke-width="3"/>'+p74Eyes(60,64,16,4,true,true);
  }else{ /* 影の竜 */
    s+='<path d="M44 84L0 40q4 40 18 58q8-8 14 2q8-8 14 4zM76 84l44-44q-4 40-18 58q-8-8-14 2q-8-8-14 4z" fill="'+p74Shade(c,.15)+'" '+P74_OUT+'/>';
    s+='<path d="M92 136q26-6 22-40q-6 18-22 22" fill="'+c+'" '+P74_OUT+'/><path d="M28 150l4-34q-4-34 28-40q32 6 28 40l4 34z" fill="'+c+'" '+P74_OUT+'/><path d="M44 150q0-26 16-32q16 6 16 32z" fill="#7B6AA8"/>';
    s+='<path d="M38 58q0-26 22-28q22 2 22 28q-2 18-22 20q-20-2-22-20z" fill="'+c+'" '+P74_OUT+'/><path d="M42 36l-8-18 14 10zM78 36l8-18-14 10z" fill="#C9B8F2" '+P74_OUT+'/><path d="M50 70l3 6 3-6M64 70l3 6 3-6" fill="#fff"/>';
    s+='<path d="M60 22l3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#B48CF2" opacity=".9"/>'+p74Eyes(60,54,20,4.6,true,true);
  }
  return s;
}

/* ---------- マナスの道の部品（カルパク帽・バトゥルのかぶと・チャパン・槍・弓・愛馬） ---------- */
P74_HEAD.kalpak=function(){return '<path d="M40 44q4-30 20-32q16 2 20 32z" fill="#FBF8F0" '+P74_OUT+'/><path d="M46 30q14-6 28 0M44 38q16-6 32 0" stroke="#D8CFB8" stroke-width="1.6" fill="none"/><path d="M36 46q4-8 10-6l14 2 14-2q6-2 10 6l-10 2-14-3-14 3z" fill="#2B2233" '+P74_OUT+'/><path d="M60 12v-4" stroke="#2B2233" stroke-width="3" stroke-linecap="round"/>';};
P74_HEAD.batyr=function(c){return '<path d="M34 52q0-30 26-36q26 6 26 36z" fill="'+(c||"#9AA4AE")+'" '+P74_OUT+'/><path d="M60 16V4" stroke="#C99A2E" stroke-width="3"/><circle cx="60" cy="4" r="3" fill="#E2483B"/><path d="M32 52q28-8 56 0" stroke="#8A5A2B" stroke-width="7" stroke-linecap="round"/><path d="M60 18v32" stroke="#C99A2E" stroke-width="2.5"/>';};
P74_HEAD.goldbatyr=function(){return '<path d="M32 52q0-32 28-38q28 6 28 38z" fill="#E8B923" '+P74_OUT+'/><path d="M60 14V0" stroke="#C99A2E" stroke-width="3"/><path d="M60 2q-10-4-12 6q8-2 12-2q4 0 12 2q-2-10-12-6z" fill="#F6F1E1" '+P74_OUT+'/><path d="M30 52q30-9 60 0" stroke="#F6F1E1" stroke-width="8" stroke-linecap="round"/><path d="M30 52q30-9 60 0" stroke="#2B2233" stroke-width="1.4" fill="none"/><circle cx="60" cy="32" r="4" fill="#4FB3E8" '+P74_OUT+'/>';};
P74_HAND.spear=function(){return '<path d="M90 30L84 140" stroke="#7A4E26" stroke-width="5" stroke-linecap="round"/><path d="M90 10l6 14-6 8-6-8z" fill="#DCE3EA" '+P74_OUT+'/><path d="M86 34l8 1" stroke="#E2483B" stroke-width="4" stroke-linecap="round"/>';};
P74_HAND.bigspear=function(){return '<path d="M90 28L84 142" stroke="#5A3A1E" stroke-width="6" stroke-linecap="round"/><path d="M90 2l8 18-8 10-8-10z" fill="#F4F8FB" '+P74_OUT+'/><path d="M84 32q6 10 12 0" fill="#E2483B" '+P74_OUT+'/><path d="M86 36l-4 12M94 36l4 12" stroke="#E2483B" stroke-width="3" stroke-linecap="round"/>';};
P74_HAND.bow=function(){return '<path d="M92 50q22 40 0 84" fill="none" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/><path d="M92 50v84" stroke="#E8E1D0" stroke-width="1.4"/>';};
P74_HAND.whip=function(){return '<path d="M88 98l4-20" stroke="#5A3A1E" stroke-width="5" stroke-linecap="round"/><path d="M92 78q14-10 8-26q-4 12-14 8" fill="none" stroke="#8A5A2B" stroke-width="2.4" stroke-linecap="round"/>';};
P74_OFF.quiver=function(){return '<path d="M18 92l8-4 10 26-8 4z" fill="#8A5A2B" '+P74_OUT+'/><path d="M20 90l-4-10M24 88l-2-11M28 87l1-10" stroke="#E8E1D0" stroke-width="2"/>';};
P74_OFF.kshield=function(){return '<circle cx="28" cy="106" r="15" fill="#B3202B" '+P74_OUT+'/><circle cx="28" cy="106" r="9" fill="none" stroke="#E8B923" stroke-width="2.5"/><path d="M28 98v16M20 106h16" stroke="#E8B923" stroke-width="2"/>';};
(function(){var _b=p74Body;p74Body=function(o){
  if(o.type!=="chapan")return _b(o);
  var c=o.c||"#2C5D8F",t=o.t||"#E8B923",d=p74Shade(c,-.25);
  return '<path d="M40 84q20-10 40 0l8 58H32z" fill="'+c+'" '+P74_OUT+'/><path d="M50 84l10 58M70 84l-10 58" stroke="'+t+'" stroke-width="3"/>'+
    '<path d="M34 138h52" stroke="'+t+'" stroke-width="4"/><path d="M40 108h40" stroke="'+(o.belt||"#5A3A1E")+'" stroke-width="5"/><rect x="56" y="104" width="8" height="8" rx="1" fill="#C99A2E" '+P74_OUT+'/>'+
    '<path d="M44 120q4-4 8 0t8 0 8 0 8 0" stroke="'+p74Shade(t,.2)+'" stroke-width="1.6" fill="none"/>'+(o.fur?'<path d="M40 84q20 10 40 0" fill="none" stroke="#C9A27A" stroke-width="7"/>':'')+'<path d="M40 86v50" stroke="'+d+'" stroke-width="2"/>';};})();
/* 愛馬（横向き） */
(function(){var _a=p74Animal;p74Animal=function(kind,c){
  if(kind!=="horse")return _a(kind,c);
  c=c||"#E9D9B8";var m="#5A3A22",s='<ellipse cx="60" cy="150" rx="40" ry="5" fill="#000" opacity=".18"/>';
  s+='<path d="M96 96q16 6 14 30q-6-14-14-16" fill="'+m+'" '+P74_OUT+'/>';
  s+='<path d="M34 112v34M44 114v32M80 114v32M90 112v34" stroke="'+p74Shade(c,-.15)+'" stroke-width="8" stroke-linecap="round"/><path d="M30 146h8M40 146h8M76 146h8M86 146h8" stroke="#2B2233" stroke-width="5" stroke-linecap="round"/>';
  s+='<ellipse cx="62" cy="104" rx="36" ry="20" fill="'+c+'" '+P74_OUT+'/>';
  s+='<path d="M36 100q-10-24-4-42l18 6q0 18 6 32z" fill="'+c+'" '+P74_OUT+'/><path d="M30 60q-14 2-18 14q4 8 14 6l10-4z" fill="'+c+'" '+P74_OUT+'/>';
  s+='<path d="M34 56q6-10 18 0q-4 12 2 26q-8-12-20-26z" fill="'+m+'" '+P74_OUT+'/><path d="M30 56l2-10 6 8z" fill="'+c+'" '+P74_OUT+'/>';
  s+='<circle cx="26" cy="66" r="2.4" fill="#2B2233"/><circle cx="16" cy="74" r="1.4" fill="#2B2233"/>';
  s+='<path d="M48 90q14-6 30 0v14q-16 4-30 0z" fill="#B3202B" '+P74_OUT+'/><path d="M50 96q12-4 26 0" stroke="#E8B923" stroke-width="2" fill="none"/>';
  return s;};})();
/* 物語の場面の絵：草原・山・ユルト（遊牧民の移動式住居）＋人物 */
function p74Scene(figs,opt){
  opt=opt||{};var s='<rect width="240" height="140" fill="'+(opt.night?"#2E3A5C":"#BFE3F2")+'"/>';
  if(opt.night)s+='<circle cx="200" cy="26" r="10" fill="#F6F1E1"/><circle cx="40" cy="20" r="1.4" fill="#fff"/><circle cx="90" cy="34" r="1.2" fill="#fff"/><circle cx="150" cy="16" r="1.4" fill="#fff"/>';
  else s+='<circle cx="204" cy="28" r="12" fill="#FFD34D"/>';
  s+='<path d="M0 84l40-44 30 30 34-46 40 50 30-30 66 60v40H0z" fill="'+(opt.night?"#4A5878":"#9FB7C9")+'"/><path d="M104 24l-12 14 8-2 4 6 4-6 8 2z" fill="#fff" opacity=".9"/><path d="M40 40l-8 10 6-1 2 4 3-4 5 1z" fill="#fff" opacity=".9"/>';
  s+='<path d="M0 92q60-14 120-4t120-6v58H0z" fill="'+(opt.night?"#3E5A3E":"#8DBF6A")+'"/><path d="M0 108q80-10 240 0v32H0z" fill="'+(opt.night?"#35502F":"#7AAE57")+'"/>';
  if(opt.yurt!==false)s+='<g transform="translate('+(opt.yx||176)+' 70)"><path d="M0 34V18q22-14 44 0v16z" fill="#F4EBD8" stroke="#2B2233" stroke-width="1.6"/><path d="M0 18q22-24 44 0" fill="#E8DCC0" stroke="#2B2233" stroke-width="1.6"/><path d="M4 24h36" stroke="#B3202B" stroke-width="3"/><path d="M18 34V24h8v10" fill="#8A5A2B" stroke="#2B2233" stroke-width="1.2"/></g>';
  if(opt.fire)s+='<g transform="translate(118 108)"><path d="M-10 6h20" stroke="#5A3A1E" stroke-width="4"/><path d="M0 4q-10-10 0-22q2 8 6 8q4 8-6 14z" fill="#F2A541"/><path d="M0 4q-4-6 0-12q4 6 0 12z" fill="#FFE36B"/></g>';
  (figs||[]).forEach(function(f){s+='<g transform="translate('+f.x+' '+(f.y||36)+') scale('+(f.s||.62)+')">'+f.svg+'</g>';});
  return '<svg class="p74-scene" viewBox="0 0 240 140" aria-hidden="true">'+s+'</svg>';
}
P74_HEAD.elechek=function(){return '<path d="M36 50q-2-30 24-34q26 4 24 34q-4-8-24-10q-20 2-24 10z" fill="#FBF8F0" '+P74_OUT+'/><path d="M38 40q22-10 44 0M40 32q20-8 40 0" stroke="#D8CFB8" stroke-width="1.8" fill="none"/><path d="M36 50q-6 20 2 34l6-4q-6-14-2-28z" fill="#FBF8F0" '+P74_OUT+'/><path d="M84 50q6 20-2 34l-6-4q6-14 2-28z" fill="#FBF8F0" '+P74_OUT+'/>';};
P74_HEAD.tebetei=function(c){return '<path d="M40 46q0-24 20-26q20 2 20 26z" fill="'+(c||"#B3202B")+'" '+P74_OUT+'/><path d="M34 48q26-12 52 0q-4 8-26 6q-22 2-26-6z" fill="#6B4A2E" '+P74_OUT+'/><path d="M60 20v-6" stroke="#E8B923" stroke-width="3" stroke-linecap="round"/>';};
P74_HAND.komuz=function(){return '<path d="M104 92l10-40" stroke="#8A5A2B" stroke-width="5" stroke-linecap="round"/><path d="M111 50l6 2M110 55l6 2" stroke="#5A3A1E" stroke-width="2" stroke-linecap="round"/><path d="M88 96q8-8 20-2q8 8 2 20q-8 12-20 6q-10-8-2-24z" fill="#B5793B" '+P74_OUT+'/><path d="M98 118l15-64M102 118l14-64" stroke="#F6F1E1" stroke-width=".9"/><circle cx="98" cy="104" r="3" fill="#5A3A1E"/>';};
