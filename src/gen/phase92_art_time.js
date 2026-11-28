/* ===== PHASE92-ART: 「速さ」と「時」の言葉の絵を描き直す（2026-11-28 Yuta「ゆっくりとかの絵が微妙。分かりやすく、クールで、記憶に残る絵に」） =====
   方針：
   - 1枚に「ひと目で分かる場面」を1つだけ。矢印や線だけの抽象的な図はやめる。
   - 対になる言葉は同じ道具で見せて、違いだけが目に入るようにする
       ゆっくり ⇔ 速い：同じスピードメーター（針が左＝遅い／右＝速い）
       以前 ⇔ より遅く：同じ「木の成長」の2コマ（光っている方が答え）
       〜する前に ⇔ 〜した後で：同じ「食事→歯みがき」の2コマ（光っている方が答え）
   - 濃い紺の背景＋明るい差し色（クールな見た目、暗い画面でも明るい画面でも見やすい）
   - すべてこのアプリのために一から描いたSVG（他のアプリや本の絵は使っていない）
   既存の P67_ART のキーを上書きするので、同じキーを使うキルギス語版の単語にも同じ絵が出る。 */
(function(A){
  var K=window.P67KIT;if(!A||!K||!K.fig)return;
  var fig=K.fig,T=K.T;
  var SK="#F2C39A",NAVY="#172554",NAVY2="#1E3A8A",DEEP="#0F172A",GOLD="#FBBF24",CYAN="#22D3EE",LIME="#A3E635",PINK="#F472B6",RED="#F43F5E",WHITE="#F8FAFC";
  function g(x,y,s,inner,rot){return '<g transform="translate('+x+' '+y+')'+(s&&s!==1?' scale('+s+')':'')+(rot?' rotate('+rot+')':'')+'">'+inner+'</g>';}
  /* 角丸のカード（clipPath の id a3c は表示のたびに番号が付くので重ならない） */
  function C(bg,body){return '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><clipPath id="a3c"><rect width="96" height="96" rx="16"/></clipPath></defs><g clip-path="url(#a3c)">'+bg+body+'</g></svg>';}
  /* 背景：夜の紺（星つき）・道路・室内（紺の壁） */
  var STARS='<g fill="#fff" opacity=".55"><circle cx="12" cy="10" r=".9"/><circle cx="30" cy="18" r=".7"/><circle cx="70" cy="8" r=".9"/><circle cx="86" cy="22" r=".7"/><circle cx="52" cy="12" r=".6"/></g>';
  var BG_NIGHT='<rect width="96" height="96" fill="'+NAVY+'"/><rect y="56" width="96" height="40" fill="'+NAVY2+'" opacity=".55"/>'+STARS+'<rect y="78" width="96" height="18" fill="'+DEEP+'"/>';
  var BG_ROAD='<rect width="96" height="96" fill="'+NAVY+'"/>'+STARS+'<rect y="66" width="96" height="30" fill="#334155"/><rect y="66" width="96" height="2" fill="#64748B"/><g fill="#E2E8F0"><rect x="4" y="80" width="12" height="2.4" rx="1"/><rect x="28" y="80" width="12" height="2.4" rx="1"/><rect x="52" y="80" width="12" height="2.4" rx="1"/><rect x="76" y="80" width="12" height="2.4" rx="1"/></g>';
  var BG_ROOM='<rect width="96" height="96" fill="#1E293B"/><rect y="74" width="96" height="22" fill="#334155"/><rect y="74" width="96" height="2" fill="#475569"/>';
  /* 2コマ（左右）。hl=0 なら左、1 なら右が光る（答えの方） */
  function two(left,right,hl){
    var f=function(x,on){return '<rect x="'+x+'" y="14" width="40" height="62" rx="8" fill="'+(on?"#1E3A8A":"#1E293B")+'" stroke="'+(on?GOLD:"#475569")+'" stroke-width="'+(on?2.6:1.2)+'"/>';};
    return C('<rect width="96" height="96" fill="'+DEEP+'"/>',f(5,hl===0)+f(51,hl===1)+
      g(0,0,1,left)+g(0,0,1,right)+'<path d="M46 45h4" stroke="#94A3B8" stroke-width="2"/><path d="M49 41l3 4-3 4" stroke="#94A3B8" stroke-width="2" fill="none"/>'+
      (hl===0?'':'<rect x="5" y="14" width="40" height="62" rx="8" fill="'+DEEP+'" opacity=".45"/>')+(hl===1?'':'<rect x="51" y="14" width="40" height="62" rx="8" fill="'+DEEP+'" opacity=".45"/>'));}
  /* スピードメーター：v=0（遅い）〜1（速い） */
  function gauge(x,y,r,v){
    var arc=function(a0,a1,c){var R=Math.PI/180,x0=x+Math.cos(a0*R)*r,y0=y+Math.sin(a0*R)*r,x1=x+Math.cos(a1*R)*r,y1=y+Math.sin(a1*R)*r;return '<path d="M'+x0.toFixed(1)+' '+y0.toFixed(1)+'A'+r+' '+r+' 0 0 1 '+x1.toFixed(1)+' '+y1.toFixed(1)+'" stroke="'+c+'" stroke-width="'+(r*0.28).toFixed(1)+'" fill="none"/>';};
    var a=(180+v*180)*Math.PI/180,nx=x+Math.cos(a)*r*0.82,ny=y+Math.sin(a)*r*0.82;
    return '<circle cx="'+x+'" cy="'+y+'" r="'+(r*1.28)+'" fill="'+DEEP+'" opacity=".85"/>'+arc(180,240,LIME)+arc(240,300,GOLD)+arc(300,360,RED)+
      '<path d="M'+x+' '+y+'L'+nx.toFixed(1)+' '+ny.toFixed(1)+'" stroke="'+WHITE+'" stroke-width="'+(r*0.16).toFixed(1)+'" stroke-linecap="round"/><circle cx="'+x+'" cy="'+y+'" r="'+(r*0.18).toFixed(1)+'" fill="'+WHITE+'"/>';}
  /* カメ（ゆっくりの目印） */
  function turtle(x,y,s){return g(x,y,s,
    '<ellipse cx="0" cy="9" rx="20" ry="3" fill="#000" opacity=".25"/>'+
    '<path d="M-14 4q-2 5 2 6h4q2-4-1-6zM8 4q-2 5 2 6h4q2-4-1-6z" fill="#65A30D"/>'+
    '<path d="M16 -2q8-3 11 2t-3 7q-5 0-8-4z" fill="#84CC16"/><circle cx="23" cy="0" r="1.4" fill="'+DEEP+'"/><path d="M22 4q2 1 4 0" stroke="'+DEEP+'" stroke-width=".8" fill="none"/>'+
    '<path d="M-20 4q0-18 18-18t18 18z" fill="#16A34A"/><path d="M-20 4q0-18 18-18t18 18" fill="none" stroke="#14532D" stroke-width="1.4"/>'+
    '<path d="M-8 -9l6-3 6 3v6l-6 3-6-3zM-17 1l3-7 6 3v4zM13 1l-3-7-6 3v4z" fill="#4ADE80" opacity=".55"/>'+
    '<path d="M-21 4h37" stroke="#14532D" stroke-width="2.2" stroke-linecap="round"/><path d="M-20 2l-5 2 5 1z" fill="#65A30D"/>');}
  /* 時計 */
  function clock(x,y,r,h,m,col){var R=Math.PI/180,ha=((h%12)+m/60)*30-90,ma=m*6-90;
    var t='';for(var i=0;i<12;i++){var a=i*30*R;t+='<path d="M'+(x+Math.cos(a)*r*0.78).toFixed(1)+' '+(y+Math.sin(a)*r*0.78).toFixed(1)+'L'+(x+Math.cos(a)*r*0.9).toFixed(1)+' '+(y+Math.sin(a)*r*0.9).toFixed(1)+'" stroke="#94A3B8" stroke-width="'+(i%3?0.6:1.2)+'"/>';}
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+WHITE+'" stroke="'+(col||CYAN)+'" stroke-width="'+(r*0.16).toFixed(1)+'"/>'+t+
      '<path d="M'+x+' '+y+'L'+(x+Math.cos(ha*R)*r*0.5).toFixed(1)+' '+(y+Math.sin(ha*R)*r*0.5).toFixed(1)+'" stroke="'+DEEP+'" stroke-width="'+(r*0.13).toFixed(1)+'" stroke-linecap="round"/>'+
      '<path d="M'+x+' '+y+'L'+(x+Math.cos(ma*R)*r*0.74).toFixed(1)+' '+(y+Math.sin(ma*R)*r*0.74).toFixed(1)+'" stroke="'+DEEP+'" stroke-width="'+(r*0.08).toFixed(1)+'" stroke-linecap="round"/><circle cx="'+x+'" cy="'+y+'" r="'+(r*0.09).toFixed(1)+'" fill="'+RED+'"/>';}
  function star(x,y,s,c){return g(x,y,s||1,'<path d="M0 -10l2.9 6 6.6.9-4.8 4.6 1.2 6.5L0 4.9-5.9 8l1.2-6.5L-9.5-3.1l6.6-.9z" fill="'+(c||GOLD)+'"/>');}
  function spark(x,y,s,c){return g(x,y,s||1,'<path d="M0 -6q1 5 6 6-5 1-6 6-1-5-6-6 5-1 6-6z" fill="'+(c||GOLD)+'"/>');}
  function check(x,y,s){return g(x,y,s||1,'<circle r="7" fill="#22C55E"/><path d="M-3.5 0l2.5 2.6 4.5-5" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>');}
  function badge(x,y,t,c){return g(x,y,1,'<circle r="8" fill="'+(c||GOLD)+'"/>'+T(0,3.6,t,10,DEEP,900));}
  function plate(x,y,s,food){return g(x,y,s||1,'<ellipse cx="0" cy="2" rx="14" ry="4.5" fill="#CBD5E1"/><ellipse cx="0" cy="0" rx="14" ry="4.5" fill="#fff"/><ellipse cx="0" cy="0" rx="9" ry="2.8" fill="#E2E8F0"/>'+(food||''));}
  function bowlFood(){return '<path d="M-7 -1q0-7 7-7t7 7z" fill="#F59E0B"/><circle cx="-3" cy="-4" r="1.6" fill="#EF4444"/><circle cx="2" cy="-5" r="1.4" fill="#22C55E"/>';}
  function brush(x,y,s){return g(x,y,s||1,'<rect x="-2" y="-14" width="4" height="22" rx="2" fill="'+CYAN+'"/><rect x="-3" y="-20" width="6" height="7" rx="1.5" fill="#fff"/><path d="M-2 -20v-3M0 -20v-3.5M2 -20v-3" stroke="#fff" stroke-width="1"/>');}
  /* 蛇口の下で手を洗う */
  function hands(x,y,s){return g(x,y,s||1,'<path d="M-12 -24h14q4 0 4 4v3h-5v-2h-13z" fill="#CBD5E1"/><rect x="-6" y="-28" width="6" height="4" rx="1" fill="#94A3B8"/>'+
    '<path d="M1 -16v8" stroke="#7DD3FC" stroke-width="3" stroke-linecap="round"/>'+
    '<path d="M-10 4q0-8 6-10l5-1 5 1q6 2 6 10l-2 6h-18z" fill="'+SK+'" stroke="#C9935F" stroke-width=".8"/><path d="M1 -6v16" stroke="#C9935F" stroke-width=".8"/>'+
    '<g fill="#fff" opacity=".9"><circle cx="-9" cy="-4" r="2.4"/><circle cx="10" cy="-2" r="2"/><circle cx="-6" cy="11" r="1.8"/><circle cx="8" cy="10" r="2.2"/><circle cx="12" cy="4" r="1.4"/></g>');}
  function sapling(x,y,s){return g(x,y,s||1,'<path d="M0 0v-12" stroke="#16A34A" stroke-width="2"/><path d="M0 -8q-7-1-7-7 6 0 7 7zM0 -11q7-1 7-7-6 0-7 7z" fill="#4ADE80"/>');}
  function bigtree(x,y,s){return g(x,y,s||1,'<rect x="-3" y="-16" width="6" height="16" fill="#92400E"/><circle cx="0" cy="-26" r="13" fill="#16A34A"/><circle cx="-8" cy="-20" r="8" fill="#22C55E"/><circle cx="8" cy="-21" r="8" fill="#22C55E"/><circle cx="3" cy="-32" r="6" fill="#4ADE80"/>');}

  /* ---------- 速さ ---------- */
  /* ゆっくり・遅い：カメがのんびり歩き、メーターの針は左（緑）。足あとの間がせまい */
  A.w2_slow=C(BG_ROAD,
    gauge(24,26,13,0.1)+T(24,46,"km/h",7,"#94A3B8",700)+
    '<g fill="#86EFAC" opacity=".55"><circle cx="20" cy="73" r="1.6"/><circle cx="26" cy="73" r="1.6"/><circle cx="32" cy="73" r="1.6"/><circle cx="38" cy="73" r="1.6"/></g>'+
    turtle(60,64,1.15)+'<path d="M72 40q4-4 8 0" stroke="#94A3B8" stroke-width="1.4" fill="none"/>'+T(84,40,"…",12,"#CBD5E1",900));
  /* 速い・速く：人が全力で走り、メーターの針は右（赤）。後ろに残像とスピード線 */
  A.x_fast=C(BG_ROAD,
    gauge(72,24,13,0.93)+T(72,44,"km/h",7,"#94A3B8",700)+
    '<g stroke="'+CYAN+'" stroke-linecap="round"><path d="M4 40h18" stroke-width="2.4"/><path d="M8 50h20" stroke-width="2.4" opacity=".8"/><path d="M2 60h16" stroke-width="2.4" opacity=".6"/></g>'+
    '<g opacity=".25">'+g(30,0,1,fig(0,36,0.62,{shirt:"#F43F5E",walk:1,pose:"both"}),14)+'</g>'+
    g(46,0,1,fig(0,34,0.66,{shirt:"#F43F5E",pants:"#0F172A",walk:1,pose:"both",hairc:"#1F1A17"}),16)+
    '<path d="M28 72q4-4 8 0M18 72q3-3 6 0" stroke="#94A3B8" stroke-width="1.6" fill="none"/>');
  /* ゆっくりお願いします：早口の人（ギザギザのふきだし）に、もう一人が手のひらを見せて「カメの速さで」 */
  A.w2_slowplease=C(BG_ROOM,
    fig(22,40,0.62,{shirt:"#F43F5E",pose:"point",hairc:"#1F1A17"})+
    '<path d="M6 8l5 4 4-5 4 5 5-4 4 5 5-4 2 8-3 6 3 6-6 2-4 5-5-4-5 4-4-5-6 1 1-7-4-5 4-5z" fill="'+RED+'" opacity=".9"/><path d="M14 18l3-3 3 3 3-3 3 3 3-3" stroke="#fff" stroke-width="1.6" fill="none"/>'+
    fig(72,40,0.62,{shirt:CYAN,pose:"side",hair:"long",hairc:"#5B3A29",skirt:"#1E3A8A",sad:1})+
    '<rect x="50" y="5" width="40" height="28" rx="9" fill="'+WHITE+'"/><path d="M66 32l4 6 2-6z" fill="'+WHITE+'"/>'+turtle(70,22,0.5)+
    '<path d="M60 52h0" />');

  /* ---------- いま・まえ・あと ---------- */
  /* 今：大きな時計の真下、光の輪の中に立って足もとを指さす「いま・ここ」 */
  A.t_seychas=C(BG_NIGHT,
    '<ellipse cx="48" cy="82" rx="26" ry="6" fill="'+GOLD+'" opacity=".25"/><ellipse cx="48" cy="82" rx="16" ry="3.6" fill="'+GOLD+'" opacity=".55"/>'+
    '<path d="M36 82L42 34h12l6 48z" fill="'+GOLD+'" opacity=".12"/>'+
    clock(48,20,14,10,10,GOLD)+'<path d="M30 8q-4 4-4 10M66 8q4 4 4 10" stroke="'+GOLD+'" stroke-width="1.6" fill="none" stroke-linecap="round"/>'+
    fig(48,44,0.58,{shirt:CYAN,pants:"#0F172A",pose:"both"})+spark(20,52,0.8)+spark(78,56,0.7,CYAN));
  /* 後で・それから：①宿題（いま）→ ②サッカー（あとで）。光っているのは右のコマ */
  A.t_potom=two(
    '<rect x="11" y="56" width="28" height="3" fill="#B7794A"/>'+fig(25,36,0.46,{shirt:"#64748B",sit:1,pose:"write",sad:1})+'<rect x="28" y="51" width="10" height="5" fill="#fff"/>'+T(25,26,"1",9,"#94A3B8",900)+'<rect x="17" y="18" width="16" height="12" rx="3" fill="none"/>',
    fig(66,36,0.46,{shirt:"#F43F5E",walk:1,pose:"both"})+'<circle cx="80" cy="66" r="5" fill="#fff"/><path d="M80 61l2 3-2 2-2-2zM76 67l2-1 1 3M84 67l-2-1-1 3" fill="'+DEEP+'"/>'+T(71,26,"2",9,GOLD,900)+spark(84,32,0.6),1);
  /* すでに・もう：お皿はもう空っぽ（くず）、おなかいっぱいで満足＋チェック */
  A.t_uzhe=C(BG_ROOM,
    '<rect x="8" y="58" width="50" height="4" rx="1" fill="#B7794A"/><rect x="12" y="62" width="3" height="12" fill="#8B5E3C"/><rect x="51" y="62" width="3" height="12" fill="#8B5E3C"/>'+
    plate(32,54,1.2,'<g fill="#F59E0B"><circle cx="-4" cy="-.5" r="1"/><circle cx="2" cy=".5" r=".8"/><circle cx="5" cy="-1" r=".9"/></g>')+'<path d="M50 46v10M48 46v4M52 46v4" stroke="#CBD5E1" stroke-width="1.2"/>'+
    fig(72,36,0.62,{shirt:"#A855F7",pose:"hip"})+'<path d="M64 30q-3-2-1-5" stroke="#94A3B8" stroke-width="1.2" fill="none"/>'+
    check(80,14,1.3)+clock(22,20,10,12,30,CYAN));
  /* まだ・さらに：目ざましが鳴り、日も高いのに「まだ」寝ている */
  A.t_eshchyo=C('<rect width="96" height="96" fill="#1E3A8A"/><rect x="58" y="8" width="30" height="26" rx="3" fill="#7DD3FC"/><circle cx="78" cy="18" r="5" fill="'+GOLD+'"/><path d="M73 8v26M58 21h30" stroke="#1E3A8A" stroke-width="2"/><rect y="74" width="96" height="22" fill="#334155"/>',
    '<rect x="6" y="56" width="60" height="12" rx="3" fill="#F8FAFC"/><rect x="6" y="48" width="8" height="26" rx="2" fill="#92400E"/><rect x="62" y="56" width="6" height="18" rx="2" fill="#92400E"/>'+
    '<ellipse cx="22" cy="54" rx="8" ry="5" fill="#fff"/><circle cx="24" cy="50" r="6.5" fill="'+SK+'"/><path d="M18 48q2-6 8-5" stroke="#4A2F1F" stroke-width="3" fill="none"/><path d="M21 50q1.5 1 3 0M26 50q1.5 1 3 0" stroke="'+DEEP+'" stroke-width="1" fill="none"/>'+
    '<path d="M28 56q16-8 38 0v6H28z" fill="#60A5FA"/>'+T(40,40,"Z",9,"#fff",900)+T(48,32,"z",8,"#fff",900)+T(54,26,"z",6,"#fff",900)+
    g(80,58,1,'<circle r="7" fill="'+RED+'"/><circle r="5" fill="#fff"/><path d="M0 0v-3.4M0 0l2.4 1.4" stroke="'+DEEP+'" stroke-width="1"/><circle cx="-5" cy="-6" r="2.4" fill="'+GOLD+'"/><circle cx="5" cy="-6" r="2.4" fill="'+GOLD+'"/>')+
    '<path d="M70 48l-3-3M90 48l3-3M70 58h-4M90 58h4" stroke="'+GOLD+'" stroke-width="1.6" stroke-linecap="round"/>');
  /* 以前・より早く／より遅く：同じ木の「前」と「後」。光っている方が答え */
  var TREE_L='<rect x="9" y="66" width="32" height="4" fill="#4D7C0F"/>'+sapling(25,66,1.2)+T(25,26,"",8,"#fff"),
      TREE_R='<rect x="55" y="66" width="32" height="4" fill="#4D7C0F"/>'+bigtree(71,66,0.95);
  A.t_ranshe=two(TREE_L,TREE_R,0);
  A.t_pozzhe=two(TREE_L,TREE_R,1);
  /* 今では：むかしのダイヤル電話 → いまはスマホ（右が光る） */
  A.t_teper=two(
    g(25,50,1,'<path d="M-13 8l3-12h20l3 12z" fill="#B91C1C"/><path d="M-14 -6q0-6 6-6h16q6 0 6 6v2h-6v-2h-16v2h-6z" fill="#7F1D1D"/><circle cx="0" cy="2" r="5" fill="#FDE68A"/><circle cx="0" cy="2" r="2" fill="#B91C1C"/>')+'<path d="M16 30q4 4 8 0t8 0" stroke="#94A3B8" stroke-width="1" fill="none" opacity=".6"/>',
    g(71,46,1,'<rect x="-10" y="-18" width="20" height="36" rx="4" fill="'+DEEP+'" stroke="'+CYAN+'" stroke-width="1.6"/><rect x="-7.5" y="-14" width="15" height="26" rx="1.5" fill="#38BDF8"/><rect x="-5" y="-11" width="4" height="4" rx="1" fill="#fff"/><rect x="1" y="-11" width="4" height="4" rx="1" fill="'+GOLD+'"/><rect x="-5" y="-5" width="4" height="4" rx="1" fill="'+PINK+'"/><rect x="1" y="-5" width="4" height="4" rx="1" fill="'+LIME+'"/>')+spark(84,24,0.6)+spark(58,26,0.5,CYAN),1);
  /* その時：思い出の写真（誕生日のケーキ）を指さして「あの時」 */
  A.t_togda=C(BG_NIGHT,
    g(58,34,1,'<rect x="-24" y="-22" width="48" height="44" rx="2" fill="#FEF3C7" transform="rotate(-6)"/><rect x="-20" y="-18" width="40" height="30" fill="#FDE68A" transform="rotate(-6)"/>'+
      '<g transform="rotate(-6)"><rect x="-12" y="-2" width="24" height="10" rx="2" fill="'+PINK+'"/><rect x="-12" y="-2" width="24" height="3" fill="#fff"/><path d="M-6 -2v-6M0 -2v-6M6 -2v-6" stroke="#60A5FA" stroke-width="1.6"/><g fill="#F97316"><ellipse cx="-6" cy="-10" rx="1.2" ry="2"/><ellipse cx="0" cy="-10" rx="1.2" ry="2"/><ellipse cx="6" cy="-10" rx="1.2" ry="2"/></g></g>')+
    fig(18,46,0.56,{shirt:CYAN,pose:"point"})+spark(86,12,0.7)+spark(30,14,0.6,CYAN));
  /* 〜前に：カレンダーを3枚さかのぼる（くるっと左向きの矢印） */
  A.t_nazad=C(BG_NIGHT,
    [0,1,2].map(function(i){var x=62-i*24,y=34+i*3;return '<g opacity="'+(1-i*0.25)+'"><rect x="'+x+'" y="'+y+'" width="20" height="24" rx="3" fill="#fff"/><rect x="'+x+'" y="'+y+'" width="20" height="7" rx="3" fill="'+RED+'"/>'+T(x+10,y+20,String(28-i),10,DEEP,900)+'</g>';}).reverse().join("")+
    '<path d="M76 22q-30-16-58 6" stroke="'+GOLD+'" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M14 22l5 8 4-8z" fill="'+GOLD+'"/>'+
    T(48,86,"",8,"#fff")+'<rect x="18" y="72" width="60" height="4" rx="2" fill="#334155"/><circle cx="74" cy="74" r="3.6" fill="'+CYAN+'"/><circle cx="24" cy="74" r="3.6" fill="'+GOLD+'"/>');
  /* ずっと前に：クモの巣とほこりをかぶった古い時計と写真 */
  A.t_davno=C('<rect width="96" height="96" fill="#292524"/><rect y="74" width="96" height="22" fill="#44403C"/>',
    '<path d="M0 0l30 0M0 0l26 14M0 0l14 26M0 0v30" stroke="#D6D3D1" stroke-width=".7" opacity=".8"/><path d="M8 0q2 7-6 9M16 0q3 13-12 17M24 0q4 18-20 25" stroke="#D6D3D1" stroke-width=".7" fill="none" opacity=".8"/>'+
    clock(62,38,20,3,40,"#A8A29E")+'<path d="M48 22l28 32M76 22L48 54" stroke="#D6D3D1" stroke-width=".5" opacity=".5"/>'+
    '<rect x="10" y="44" width="26" height="30" rx="2" fill="#D6BC8A" transform="rotate(-8 23 59)"/><rect x="13" y="47" width="20" height="18" fill="#A8875A" transform="rotate(-8 23 59)"/><circle cx="22" cy="53" r="3.4" fill="#78593A"/><path d="M16 64q6-9 12 0z" fill="#78593A"/>'+
    '<g fill="#A8A29E" opacity=".7"><circle cx="54" cy="70" r="1"/><circle cx="66" cy="72" r="1.2"/><circle cx="80" cy="69" r="1"/></g>'+T(78,88,"",8,"#fff"));
  /* 最近：きのう買った新しいスニーカー（カレンダーの最後の数日に印） */
  A.t_nedavno=C(BG_ROOM,
    g(30,30,1,'<rect x="-22" y="-18" width="44" height="34" rx="4" fill="#fff"/><rect x="-22" y="-18" width="44" height="9" rx="4" fill="'+CYAN+'"/>'+
      [0,1,2,3,4,5,6,7,8,9,10,11].map(function(i){var cx=-17+(i%6)*6.8,cy=-3+Math.floor(i/6)*8,on=i>=9;return '<rect x="'+(cx-2.6)+'" y="'+(cy-2.6)+'" width="5.2" height="5.2" rx="1.2" fill="'+(on?GOLD:"#E2E8F0")+'"/>';}).join("")+'<circle cx="17" cy="5" r="4.6" fill="none" stroke="'+RED+'" stroke-width="1.4"/>')+
    g(62,64,1.25,'<path d="M-18 0q0-8 6-10l6 2 4-6h8q2 6 8 8 6 2 6 6z" fill="'+PINK+'"/><path d="M-18 0h38v3h-38z" fill="#fff"/><path d="M-4 -8l4 3M0 -10l4 3" stroke="#fff" stroke-width="1.2"/>')+spark(86,44,0.8)+spark(42,52,0.6,CYAN)+spark(80,30,0.5));
  /* 〜後に・〜を通って：トンネルをくぐって出てくる電車、時計は「＋1時間」 */
  A.p_cherez=C(BG_NIGHT,
    '<path d="M4 78V44q0-24 28-24t28 24v34z" fill="#475569"/><path d="M14 78V46q0-16 18-16t18 16v32z" fill="'+DEEP+'"/>'+
    '<rect y="76" width="96" height="3" fill="#94A3B8"/>'+
    g(64,64,1,'<rect x="-16" y="-14" width="34" height="22" rx="6" fill="'+RED+'"/><rect x="-12" y="-10" width="9" height="7" rx="1.5" fill="#BAE6FD"/><rect x="0" y="-10" width="9" height="7" rx="1.5" fill="#BAE6FD"/><rect x="12" y="-10" width="5" height="7" rx="1.5" fill="#BAE6FD"/><circle cx="-8" cy="9" r="3" fill="'+DEEP+'"/><circle cx="10" cy="9" r="3" fill="'+DEEP+'"/><circle cx="17" cy="0" r="1.6" fill="'+GOLD+'"/>')+
    '<path d="M86 60h8M88 66h6" stroke="'+CYAN+'" stroke-width="1.6" stroke-linecap="round"/>'+clock(76,22,11,1,0,GOLD)+badge(88,10,"+1",GOLD));
  /* すぐに：ベルが鳴った瞬間にとび上がる（いなずま）、ストップウォッチは 0:01 */
  A.t_srazu=C(BG_NIGHT,
    g(22,26,1,'<path d="M-9 6q0-15 9-15t9 15l3 4h-24z" fill="'+GOLD+'"/><circle cx="0" cy="13" r="2.6" fill="'+GOLD+'"/>')+'<path d="M8 18l-4-3M8 30H3M36 18l4-3M36 30h5" stroke="'+GOLD+'" stroke-width="1.8" stroke-linecap="round"/>'+
    '<path d="M44 10l-8 18h8l-6 18 16-24h-9l6-12z" fill="'+CYAN+'"/>'+
    fig(66,36,0.6,{shirt:"#F43F5E",pose:"both"})+'<path d="M56 80h20" stroke="#94A3B8" stroke-width="1.6" stroke-dasharray="2 2"/>'+
    g(22,64,1,'<circle r="11" fill="'+WHITE+'" stroke="'+CYAN+'" stroke-width="2"/><rect x="-3" y="-15" width="6" height="3" fill="'+CYAN+'"/>'+T(0,3,"0:01",7,DEEP,900)));
  /* 最初に・第一に：一列のドミノの「最初の1枚」を指で押す（光っている1枚目） */
  A.s_1=C(BG_NIGHT,
    [0,1,2,3,4].map(function(i){var x=26+i*13;return '<rect x="'+x+'" y="44" width="7" height="30" rx="1.5" fill="'+(i?"#E2E8F0":GOLD)+'"'+(i?'':' transform="rotate(-14 '+(x+3.5)+' 74)"')+'/><circle cx="'+(x+3.5)+'" cy="52" r="1.2" fill="'+DEEP+'"/><circle cx="'+(x+3.5)+'" cy="64" r="1.2" fill="'+DEEP+'"/>';}).join("")+
    g(14,52,1,'<path d="M-14 -5h10q3-6 8-4l-1 4h11q3 0 3 2.5t-3 2.5h-8v2h4q2.5 0 2.5 2.5t-2.5 2.5h-5v1q0 3-3 3h-7q-6 0-6-6z" fill="'+SK+'" stroke="#C9935F" stroke-width=".8"/><rect x="-22" y="-7" width="9" height="16" rx="2" fill="'+CYAN+'"/>')+badge(29,30,"1",GOLD)+spark(16,34,0.6,CYAN)+'<path d="M14 80h76" stroke="#475569" stroke-width="2"/>');
  /* ついに・やっと・結局：長い山道をのぼり切って頂上に旗を立てる（汗） */
  A.s_fin=C('<rect width="96" height="96" fill="'+NAVY+'"/>'+STARS,
    '<path d="M-4 96L40 22l14 14 12-10 34 70z" fill="#334155"/><path d="M40 22l-7 12 6-2 5 5 5-5z" fill="#E2E8F0"/>'+
    '<path d="M6 92q14-4 10-14t12-12 6-14 6-14" stroke="'+GOLD+'" stroke-width="1.8" stroke-dasharray="2.5 3" fill="none"/>'+
    g(40,0,1,fig(0,6,0.4,{shirt:"#F43F5E",pose:"both"}))+'<path d="M48 -2v22" stroke="'+WHITE+'" stroke-width="1.6"/><path d="M48 -2h14l-4 4 4 4h-14z" fill="'+GOLD+'"/>'+
    '<path d="M32 8q-2 3 0 4 2-1 0-4z" fill="#7DD3FC"/>'+spark(70,14,0.8)+spark(20,30,0.6,CYAN)+spark(80,40,0.5));
  /* 再び・また：同じ旗の前を「もう1周」走る（周回カウンター ×2） */
  A.w2_again=C(BG_NIGHT,
    '<ellipse cx="48" cy="54" rx="40" ry="22" fill="none" stroke="#475569" stroke-width="10"/><ellipse cx="48" cy="54" rx="40" ry="22" fill="none" stroke="'+CYAN+'" stroke-width="1.4" stroke-dasharray="4 4"/>'+
    '<path d="M48 76V58" stroke="'+WHITE+'" stroke-width="1.6"/><path d="M48 58h12l-3 3 3 3h-12z" fill="'+GOLD+'"/>'+
    '<path d="M70 30q12 6 14 18" stroke="'+GOLD+'" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M80 46l4 6 3-7z" fill="'+GOLD+'"/>'+
    g(0,0,1,fig(30,52,0.4,{shirt:"#F43F5E",walk:1,pose:"both"}))+
    '<rect x="62" y="6" width="28" height="16" rx="5" fill="'+GOLD+'"/>'+T(76,18,"×2",11,DEEP,900));
  /* 少しずつ・だんだん：芽 → 小さな木 → 大きな木（階段のように少しずつ） */
  A.t_postepenno=C(BG_NIGHT,
    '<path d="M6 78h26v-8h22v-8h22v-8h16" fill="none" stroke="#475569" stroke-width="2"/>'+
    sapling(18,78,0.9)+g(42,70,1,'<path d="M0 0v-14" stroke="#92400E" stroke-width="2.4"/><circle cx="0" cy="-18" r="7" fill="#22C55E"/>')+bigtree(66,62,0.62)+bigtree(86,54,0.8)+
    '<path d="M12 40q30-2 70-26" stroke="'+GOLD+'" stroke-width="2.2" fill="none" stroke-dasharray="3 3"/><path d="M80 10l6 3-5 5z" fill="'+GOLD+'"/>');
  /* 前もって：晴れているうちに、カバンへかさを入れておく（向こうに雨雲） */
  A.t_zaranee=C('<rect width="96" height="96" fill="#1E3A8A"/><rect y="74" width="96" height="22" fill="#334155"/>',
    '<circle cx="16" cy="14" r="7" fill="'+GOLD+'"/>'+
    g(78,18,1,'<path d="M-14 4q0-8 8-8 2-6 9-5 7 1 7 8 6 1 5 7z" fill="#64748B"/><path d="M-8 10l-2 5M0 10l-2 5M8 10l-2 5" stroke="#7DD3FC" stroke-width="1.6" stroke-linecap="round"/>')+
    fig(30,40,0.6,{shirt:CYAN,pose:"hold"})+
    g(56,64,1,'<rect x="-12" y="-6" width="24" height="16" rx="3" fill="#92400E"/><path d="M-5 -6q0-6 5-6t5 6" stroke="#92400E" stroke-width="2" fill="none"/>')+
    g(56,44,1,'<path d="M0 -18l4 26h-8z" fill="'+PINK+'"/><path d="M-1.5 -10h3M-2.5 -2h5" stroke="#BE185D" stroke-width="1"/><path d="M0 -18v-4" stroke="#CBD5E1" stroke-width="1.4"/><path d="M0 8v8q0 4-4 4t-4-3" stroke="#CBD5E1" stroke-width="2" fill="none" stroke-linecap="round"/>',-12)+
    '<path d="M62 30l-2 6" stroke="'+GOLD+'" stroke-width="1.4"/>'+check(16,62,1));
  /* 〜する前に／〜した後で：同じ「①手を洗う → ②食べる」「①食べる → ②歯みがき」の2コマ。光っている方が答え */
  A.t_prezhde=two(hands(25,52,1.2)+T(25,26,"1",9,GOLD,900),plate(71,58,1.2,bowlFood())+'<path d="M84 44v12M82 44v4M86 44v4" stroke="#CBD5E1" stroke-width="1.2"/>'+T(71,26,"2",9,"#94A3B8",900),0);
  A.t_posle=two(plate(25,58,1.2,'<g fill="#F59E0B"><circle cx="-4" cy="-.5" r="1"/><circle cx="3" cy=".5" r=".8"/></g>')+check(36,44,0.8)+T(25,26,"1",9,"#94A3B8",900),
    g(71,52,1,'<circle cx="0" cy="-6" r="10" fill="'+SK+'"/><path d="M-10 -8q0-10 10-10t10 10q-4-5-10-5t-10 5z" fill="#4A2F1F"/><circle cx="-3.5" cy="-7" r="1.1" fill="'+DEEP+'"/><circle cx="3.5" cy="-7" r="1.1" fill="'+DEEP+'"/><ellipse cx="0" cy="-1" rx="4" ry="2.6" fill="#fff"/>')+brush(80,52,0.8)+'<g fill="#fff" opacity=".8"><circle cx="64" cy="58" r="1.8"/><circle cx="78" cy="60" r="1.4"/></g>'+T(71,26,"2",9,GOLD,900),1);
  /* もうすぐ：バス停の表示「1分」、むこうからバスが近づいてくる */
  A.t_skoro=C(BG_ROAD,
    '<path d="M18 66V24" stroke="#94A3B8" stroke-width="2.4"/><rect x="6" y="12" width="24" height="18" rx="4" fill="'+DEEP+'" stroke="'+CYAN+'" stroke-width="1.4"/>'+T(18,25,"1 min",7,GOLD,900)+
    fig(30,40,0.5,{shirt:"#A855F7",pose:"down"})+
    g(70,58,1,'<rect x="-18" y="-16" width="38" height="24" rx="5" fill="'+GOLD+'"/><rect x="-14" y="-12" width="8" height="8" rx="1.5" fill="#BAE6FD"/><rect x="-3" y="-12" width="8" height="8" rx="1.5" fill="#BAE6FD"/><rect x="8" y="-12" width="8" height="8" rx="1.5" fill="#BAE6FD"/><circle cx="-10" cy="9" r="3.4" fill="'+DEEP+'"/><circle cx="12" cy="9" r="3.4" fill="'+DEEP+'"/><circle cx="-17" cy="0" r="1.6" fill="#fff"/>')+
    '<path d="M44 52h-6M46 46h-4" stroke="'+CYAN+'" stroke-width="1.6" stroke-linecap="round"/>');
  /* あるとき：「むかしむかし」の開いた本から、お城と星が浮かびあがる */
  A.t_odnazhdy=C(BG_NIGHT,
    '<path d="M48 82q-18-8-38-4V48q20-4 38 4z" fill="#F8FAFC"/><path d="M48 82q18-8 38-4V48q-20-4-38 4z" fill="#E2E8F0"/><path d="M48 52v30" stroke="#94A3B8" stroke-width="1"/>'+
    '<g stroke="#CBD5E1" stroke-width="1"><path d="M16 56q14-2 26 2M16 62q14-2 26 2M16 68q14-2 26 2M54 58q12-4 26-2M54 64q12-4 26-2M54 70q12-4 26-2"/></g>'+
    '<path d="M48 50q-16-14 0-30" stroke="'+GOLD+'" stroke-width="1" opacity=".5" fill="none"/>'+
    g(48,30,1,'<rect x="-12" y="-6" width="24" height="16" fill="#A78BFA"/><rect x="-16" y="-14" width="7" height="24" fill="#8B5CF6"/><rect x="9" y="-14" width="7" height="24" fill="#8B5CF6"/><path d="M-17 -14l4.5-7 4.5 7zM8 -14l4.5-7 4.5 7z" fill="'+PINK+'"/><path d="M-4 10v-6q4-4 8 0v6z" fill="'+DEEP+'"/>')+
    star(22,16,0.7)+star(76,14,0.6,CYAN)+spark(84,36,0.6)+spark(14,38,0.5,CYAN));
})(typeof P67_ART!=="undefined"?P67_ART:null);
