/* ===== PHASE67-ART13: 2回目の見直しで描き直した絵（このアプリ用に一から描いたSVG） ===== */
(function(A){
  var K=window.P67KIT;if(!K||!K.reg)return;
  var fig=K.fig,card=K.card,T=K.T,arr=K.arr,g=K.g,check=K.check,cross=K.cross,sparkle=K.sparkle,table=K.table,sweat=K.sweat,bubble=K.bubble,desk=K.desk,building=K.building;
  var SK="#F2C39A",SKL="#C9935F";
  var done={};function put(k,v){A[k]=v;done[k]=1;}
  function ring(x,y,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="#F59E0B" stroke-width="2.4" stroke-dasharray="4 3"/>';}
  function hbox(x,y,w,h){return '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="6" fill="none" stroke="#F59E0B" stroke-width="2.4" stroke-dasharray="4 3"/>';}

  /* 体の部分：場所を点線で囲み、矢印で指す */
  put("b_head",card("cool",fig(40,30,1,{shirt:"#2563EB"})+ring(40,28,12)+arr(84,22,58,26,"#F59E0B")));
  put("b_throat",card("cool",'<path d="M10 96q2-24 22-30h24q20 6 22 30z" fill="#0EA5E9"/><rect x="36" y="40" width="16" height="28" fill="'+SK+'"/><path d="M36 60q8 6 16 0" stroke="#0284C7" stroke-width="0" fill="none"/>'+
    '<circle cx="44" cy="28" r="16" fill="'+SK+'"/><path d="M28 26q0-16 16-16t16 16q-4-8-16-8t-16 8z" fill="#4A2F1F"/><circle cx="38" cy="28" r="1.8" fill="#1F2937"/><circle cx="50" cy="28" r="1.8" fill="#1F2937"/><path d="M39 38q5-4 10 0" stroke="#1F2937" stroke-width="1.6" fill="none"/>'+
    '<ellipse cx="44" cy="54" rx="6" ry="4.5" fill="#F87171" opacity=".8"/><path d="M32 50l-5-2M56 50l5-2M32 57l-5 1M56 57l5 1" stroke="#EF4444" stroke-width="1.8" stroke-linecap="round"/>'+ring(44,54,10)+arr(90,44,58,52,"#F59E0B")+sweat(64,22)));
  put("b_belly",card("cool",fig(40,24,1,{shirt:"#16A34A",pose:"hold"})+hbox(27,40,26,18)+arr(86,50,57,49,"#F59E0B")));
  /* 背中：後ろ姿の人。背中の部分を囲む */
  put("b_back",card("cool",g(42,24,1,'<path d="M-6.5 31h5.5v26h-5.5zM1 31h5.5v26H1z" fill="#1E3A5F"/><ellipse cx="-4" cy="58" rx="4.6" ry="2.2" fill="#2B2B2B"/><ellipse cx="4" cy="58" rx="4.6" ry="2.2" fill="#2B2B2B"/>'+
    '<path d="M-11 13q0-5 6-5h10q6 0 6 5v20h-22z" fill="#F97316"/><path d="M0 10v22" stroke="#EA580C" stroke-width="1"/><path d="M-11 13q-4 8-3 17M11 13q4 8 3 17" stroke="#F97316" stroke-width="5.4" stroke-linecap="round" fill="none"/><circle cx="-14" cy="31" r="2.7" fill="'+SK+'"/><circle cx="14" cy="31" r="2.7" fill="'+SK+'"/>'+
    '<rect x="-3" y="4" width="6" height="5" fill="'+SK+'"/><circle cy="-2" r="8.5" fill="#4A2F1F"/><path d="M-8.5 -1q1 5 2 6M8.5 -1q-1 5-2 6" stroke="'+SK+'" stroke-width="2.4"/>')+
    hbox(28,32,28,26)+arr(86,44,60,44,"#F59E0B")+T(14,18,"",8)));
  /* お湯・水：蛇口とハンドルの色、湯気・氷で区別 */
  function faucet(hc){return '<rect x="8" y="14" width="10" height="18" rx="2" fill="#94A3B8"/><path d="M18 22h28q10 0 10 10v4" stroke="#94A3B8" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M28 18v-6" stroke="#94A3B8" stroke-width="3"/><rect x="21" y="7" width="14" height="6" rx="3" fill="'+hc+'"/><path d="M8 80h80" stroke="#CBD5E1" stroke-width="1"/>'+
    '<path d="M24 66h52q-2 14-26 14t-26-14z" fill="#E2E8F0" stroke="#94A3B8" stroke-width="1.4"/>';}
  put("o_hotwater",card("wall",faucet("#EF4444")+'<rect x="53" y="38" width="6" height="30" rx="3" fill="#7DD3FC"/><path d="M30 70q20 4 40 0" stroke="#7DD3FC" stroke-width="3" fill="none"/>'+
    [36,46,66].map(function(x){return '<path d="M'+x+' 62q-4-5 0-10t0-10" stroke="#F1F5F9" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".95"/><path d="M'+x+' 62q-4-5 0-10t0-10" stroke="#CBD5E1" stroke-width="1" fill="none"/>';}).join("")+
    '<g transform="translate(80 30)"><rect x="-3" y="-18" width="6" height="28" rx="3" fill="#fff" stroke="#94A3B8"/><rect x="-1.4" y="-10" width="2.8" height="18" fill="#EF4444"/><circle cy="12" r="5" fill="#EF4444"/></g>'));
  put("o_coldwater",card("cool",faucet("#2563EB")+'<rect x="53" y="38" width="6" height="30" rx="3" fill="#7DD3FC"/><path d="M30 70q20 4 40 0" stroke="#7DD3FC" stroke-width="3" fill="none"/>'+
    [[34,64,0],[44,66,15],[66,64,-12]].map(function(p){return '<rect x="'+(p[0]-4)+'" y="'+(p[1]-4)+'" width="8" height="8" rx="1.5" fill="#E0F2FE" stroke="#38BDF8" stroke-width="1.2" transform="rotate('+p[2]+' '+p[0]+' '+p[1]+')"/>';}).join("")+
    '<g transform="translate(80 26)" stroke="#2563EB" stroke-width="2" stroke-linecap="round">'+[0,60,120].map(function(a){return '<path d="M0 -9v18" transform="rotate('+a+')"/><path d="M-3 -6l3 2 3-2M-3 6l3-2 3 2" fill="none" transform="rotate('+a+')"/>';}).join("")+'</g>'));
  /* 玉ねぎ：丸ごとと、切った輪切り */
  put("f_onion",card("wall",table()+'<path d="M40 22q-2-8 2-14M40 22q3-7 8-10" stroke="#16A34A" stroke-width="2.6" fill="none" stroke-linecap="round"/>'+
    '<path d="M40 22q-24 14-20 32 3 14 20 14t20-14q4-18-20-32z" fill="#E7B56B" stroke="#B7791F" stroke-width="1.4"/><path d="M40 24q-12 14-10 30 2 12 10 14M40 24q12 14 10 30-2 12-10 14M40 24v44" stroke="#C98A2E" stroke-width="1" fill="none"/>'+
    '<path d="M34 68l-3 5M40 68v6M46 68l3 5" stroke="#B7791F" stroke-width="1.2"/>'+
    '<ellipse cx="76" cy="70" rx="14" ry="9" fill="#F5F3FF" stroke="#A78BFA" stroke-width="1.6"/><ellipse cx="76" cy="70" rx="9.5" ry="6" fill="none" stroke="#C4B5FD" stroke-width="1.4"/><ellipse cx="76" cy="70" rx="5" ry="3" fill="none" stroke="#C4B5FD" stroke-width="1.4"/>'));
  /* 白：ほかの色の絵と同じ形。暗い背景で白がわかるように */
  put("w2_white",'<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="96" height="96" rx="16" fill="#334155"/>'+
    '<path d="M16 22q20-12 44-4 14 4 16 16 2 14-10 22-12 8-28 10-16 2-22-10-6-12 0-34z" fill="#FFFFFF"/><path d="M62 82l18-28" stroke="#A16207" stroke-width="5" stroke-linecap="round"/><path d="M78 52l6-9 2 3-5 9z" fill="#FFFFFF" stroke="#E5E7EB" stroke-width=".8"/>'+
    '<circle cx="78" cy="20" r="6" fill="#fff" opacity=".9"/><path d="M74 20h8M78 16v8" stroke="#334155" stroke-width="0"/></svg>');
  /* 掃除機：本体・ホース・床用ヘッド、ごみを吸い込む */
  put("vacuum",card("wall",'<rect x="0" y="74" width="96" height="22" fill="#D6B48A"/><rect x="0" y="72" width="96" height="3" fill="#B98A5A"/>'+
    '<rect x="12" y="48" width="30" height="22" rx="10" fill="#7C3AED"/><rect x="18" y="52" width="12" height="7" rx="3" fill="#C4B5FD"/><circle cx="18" cy="71" r="4" fill="#1F2937"/><circle cx="36" cy="71" r="4" fill="#1F2937"/>'+
    '<path d="M40 56q14-4 16-16t14-6" stroke="#475569" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M70 34l6 34" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/><path d="M66 68h20q3 0 3 3v1H63v-1q0-3 3-3z" fill="#475569"/>'+
    [[56,70],[52,67],[48,71],[58,66]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.4" fill="#78716C"/>';}).join("")+'<path d="M50 62q6 2 10 6" stroke="#94A3B8" stroke-width="1" stroke-dasharray="2 2" fill="none"/>'));
  /* 運転手：横から見た車と、ハンドルを握る運転手 */
  put("driver",card("city",'<rect y="78" width="96" height="18" fill="#6B7280"/><path d="M0 86h96" stroke="#F3F4F6" stroke-width="1.6" stroke-dasharray="8 6"/>'+
    '<path d="M8 72v-12q0-5 5-6l12-3 10-14q3-4 8-4h22q5 0 8 4l10 14q8 1 8 7v14z" fill="#F59E0B"/><path d="M38 50l8-11h12v11zM62 50v-11h7l8 11z" fill="#BAE6FD"/>'+
    '<circle cx="54" cy="37" r="5.5" fill="'+SK+'"/><path d="M48.5 35q1-6 6-6t5.5 5z" fill="#1E3A5F"/><rect x="47" y="34" width="14" height="2" rx="1" fill="#1E3A5F"/><path d="M50 43h10v7H50z" fill="#2563EB"/>'+
    '<circle cx="45" cy="50" r="4" fill="none" stroke="#1F2937" stroke-width="2"/><path d="M51 47l-4 2" stroke="'+SK+'" stroke-width="2.2" stroke-linecap="round"/>'+
    '<circle cx="24" cy="74" r="7" fill="#1F2937"/><circle cx="24" cy="74" r="3" fill="#CBD5E1"/><circle cx="74" cy="74" r="7" fill="#1F2937"/><circle cx="74" cy="74" r="3" fill="#CBD5E1"/>'+
    '<rect x="6" y="60" width="5" height="4" rx="1" fill="#FEF08A"/>'));
  /* 明らかな：見ればすぐわかる（目 → 明るく照らされた大きな丸 → チェック） */
  put("w3_obvious",card("cool",'<path d="M10 34q12-12 24 0-12 12-24 0z" fill="#fff" stroke="#334155" stroke-width="1.6"/><circle cx="22" cy="34" r="4.5" fill="#2563EB"/><circle cx="22" cy="34" r="2" fill="#0F172A"/>'+
    arr(36,36,48,44,"#64748B")+'<path d="M60 14l-14 54h44l-14-54z" fill="#FEF9C3" opacity=".9"/><circle cx="66" cy="56" r="13" fill="#EF4444"/><circle cx="62" cy="52" r="3.5" fill="#FCA5A5"/>'+
    '<rect x="56" y="8" width="20" height="8" rx="3" fill="#475569"/>'+check(26,66,1.6)));
  /* もう一度言ってください：ふきだしに「くり返し」の矢印 */
  put("q_repeat",card("wall",fig(28,36,0.86,{shirt:"#0EA5E9",pose:"wave"})+bubble(66,26,40,30,'<path d="M60 26a7 7 0 1 1 3 5.7" stroke="#2563EB" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M56 20l4 6 5-5" fill="#2563EB"/>'+T(76,32,"×2",10,"#2563EB",900),1)));
  /* どう言いますか：物を指して、ふきだしに「？」 */
  put("q_say",card("wall",table()+fig(26,30,0.86,{shirt:"#7C3AED",pose:"point"})+K.apple(66,58,1.1)+bubble(62,20,34,24,'<text x="62" y="27" font-size="18" text-anchor="middle" font-weight="900" fill="#2563EB">「?」</text>',1)));
  /* 職員：社員証を首から下げて職場にいる人（社員証を拡大） */
  put("i_staff",card("wall",desk(4,60,46)+'<rect x="12" y="44" width="16" height="12" rx="1.5" fill="#334155"/><rect x="14" y="46" width="12" height="8" fill="#93C5FD"/><path d="M18 56h4v4h-4z" fill="#334155"/>'+
    fig(54,24,0.9,{shirt:"#F8FAFC",tie:"#1E40AF",badge:1})+'<path d="M52 33l3 9 3-9" stroke="#2563EB" stroke-width="1" fill="none"/>'+
    '<g transform="translate(82 30)"><rect x="-11" y="-14" width="22" height="30" rx="3" fill="#fff" stroke="#2563EB" stroke-width="1.6"/><rect x="-11" y="-14" width="22" height="7" rx="3" fill="#2563EB"/><circle cy="2" r="5" fill="'+SK+'"/><path d="M-5 10q5-6 10 0" fill="#2563EB"/><path d="M-6 -20l6 6 6-6" stroke="#2563EB" stroke-width="1.2" fill="none"/></g>'+ring(58,40,6)));

  window.P67SC=window.P67SC||{};for(var k in done)P67SC[k]=1;
})(P67_ART);
