/* ===== PHASE67-ART2: 前置詞・代名詞・数・時間・比べる言葉・体の状態などの絵（このアプリ用に新しく描いた図解SVG。既存の絵やキャラクター・ロゴは使っていない） =====
   箱とボール、人、時間の線などの「図解」で、絵文字では表せない言葉の意味を見せる。 */
(function(A){
  var GOLD="#FBBF24",BLUE="#3B82F6",RED="#EF4444",GREEN="#22C55E",GRAY="#9CA3AF",INK="#1F2937";
  function svg(b){return '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+b+'</svg>';}
  var SH='<ellipse cx="48" cy="88" rx="36" ry="4" fill="#000" opacity=".22"/>';
  var FONT='system-ui,-apple-system,Segoe UI,sans-serif';
  function T(x,y,s,sz,c,w){return '<text x="'+x+'" y="'+y+'" font-size="'+sz+'" text-anchor="middle" font-weight="'+(w||800)+'" font-family="'+FONT+'" fill="'+(c||INK)+'">'+s+'</text>';}
  function pill(x,y,w,h,s,sz,bg,fg){return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="'+Math.min(h/2,8)+'" fill="'+(bg||"#fff")+'"/>'+T(x,y+sz*0.36,s,sz,fg);}
  function head(x,y,a,c,k){k=k||1;return '<path d="M0 0l'+(-10*k)+' '+(-6*k)+'v'+(12*k)+'z" transform="translate('+x+' '+y+') rotate('+a.toFixed(1)+')" fill="'+(c||BLUE)+'"/>';}
  function arr(x1,y1,x2,y2,c,w,dash){var a=Math.atan2(y2-y1,x2-x1),ex=x2-Math.cos(a)*7,ey=y2-Math.sin(a)*7;
    return '<path d="M'+x1+' '+y1+'L'+ex.toFixed(1)+' '+ey.toFixed(1)+'" stroke="'+(c||BLUE)+'" stroke-width="'+(w||4)+'" stroke-linecap="round"'+(dash?' stroke-dasharray="'+dash+'"':'')+' fill="none"/>'+head(x2,y2,a*180/Math.PI,c);}
  function parr(d,x,y,a,c,w,dash){return '<path d="'+d+'" stroke="'+(c||BLUE)+'" stroke-width="'+(w||4)+'" stroke-linecap="round" fill="none"'+(dash?' stroke-dasharray="'+dash+'"':'')+'/>'+head(x,y,a,c);}
  function X(x,y,r,c){r=r||7;return '<path d="M'+(x-r)+' '+(y-r)+'L'+(x+r)+' '+(y+r)+'M'+(x+r)+' '+(y-r)+'L'+(x-r)+' '+(y+r)+'" stroke="'+(c||RED)+'" stroke-width="4.5" stroke-linecap="round"/>';}
  function CK(x,y,r,c){r=r||7;return '<path d="M'+(x-r)+' '+y+'l'+(r*0.7)+' '+(r*0.7)+'l'+(r*1.3)+' '+(-r*1.4)+'" stroke="'+(c||GREEN)+'" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>';}
  function slash(x,y,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+RED+'" stroke-width="4.5"/><path d="M'+(x-r*0.7)+' '+(y+r*0.7)+'L'+(x+r*0.7)+' '+(y-r*0.7)+'" stroke="'+RED+'" stroke-width="4.5"/>';}
  /* 人（x=中心, y=頭の中心） */
  function per(x,y,c,o){o=o||{};var s=o.s||1,h=o.hair||"#5B3A29",g='<g transform="translate('+x+' '+y+') scale('+s+')"'+(o.op?' opacity="'+o.op+'"':'')+'>';
    if(o.long)g+='<path d="M-9.5 2q-1-13 9.5-13t9.5 13v15h-5v-11h-9v11h-5z" fill="'+h+'"/>';
    g+='<path d="M-11 30q0-16 11-16t11 16v8h-22z" fill="'+c+'"/>';
    if(o.tie)g+='<path d="M0 15.5l-2.5 3 2.5 11 2.5-11z" fill="#1F2937"/><path d="M-4.5 14.5l4.5 4 4.5-4" stroke="#fff" stroke-width="1.6" fill="none"/>';
    g+='<circle cx="0" cy="0" r="8" fill="'+(o.skin||"#F2C39A")+'"/>';
    g+=o.long?'<path d="M-8.5 0q0-10 8.5-10t8.5 10q-4-6-8.5-6t-8.5 6z" fill="'+h+'"/>':'<path d="M-8 -1q1-9 8-9t8 9q-3-4-8-4t-8 4z" fill="'+h+'"/>';
    if(o.face!==false){
      if(o.mood==="sad")g+='<circle cx="-3" cy="1" r="1" fill="#3B2A20"/><circle cx="3" cy="1" r="1" fill="#3B2A20"/><path d="M-3 6q3-2.5 6 0" stroke="#3B2A20" stroke-width="1.2" fill="none"/>';
      else if(o.mood==="tired")g+='<path d="M-4.5 1h3M1.5 1h3" stroke="#3B2A20" stroke-width="1.3"/><path d="M-2 6h4" stroke="#3B2A20" stroke-width="1.2"/>';
      else if(o.mood==="happy")g+='<path d="M-4.5 1.5q1.5-2 3 0M1.5 1.5q1.5-2 3 0" stroke="#3B2A20" stroke-width="1.2" fill="none"/><path d="M-3 4.5q3 3 6 0" stroke="#3B2A20" stroke-width="1.2" fill="none"/>';
      else g+='<circle cx="-3" cy="1" r="1" fill="#3B2A20"/><circle cx="3" cy="1" r="1" fill="#3B2A20"/>';
    }
    return g+'</g>';}
  function kid(x,y,c,o){o=o||{};o.s=o.s||0.7;return per(x,y,c,o);}
  function ghost(x,y,s,c){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')" fill="none" stroke="'+(c||GRAY)+'" stroke-width="2" stroke-dasharray="3 2.5"><circle cx="0" cy="0" r="8"/><path d="M-11 38v-8q0-16 11-16t11 16v8z"/></g>';}
  function shadow(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')" fill="#6B7280"><circle cx="0" cy="0" r="8"/><path d="M-11 38v-8q0-16 11-16t11 16v8z"/></g>';}
  /* 目印（金色の輪と上の三角） */
  function hi(x,y,s){s=s||1;return '<ellipse cx="'+x+'" cy="'+(y+38*s)+'" rx="'+(14*s)+'" ry="'+(4*s)+'" fill="'+GOLD+'" opacity=".8"/><path d="M'+(x-6)+' '+(y-13*s-8)+'h12l-6 8z" fill="'+GOLD+'"/>';}
  function mk(x,y){return '<path d="M'+(x-6)+' '+(y-8)+'h12l-6 8z" fill="'+GOLD+'"/>';}
  function glow(x,y,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+GOLD+'" opacity=".35"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="none" stroke="'+GOLD+'" stroke-width="2.5"/>';}
  /* もの */
  function box(x,y,w,h,c){c=c||["#C68B59","#E0A872","#A86F42"];return '<path d="M'+x+' '+y+'l7-7h'+w+'l-7 7z" fill="'+c[1]+'"/><path d="M'+(x+w)+' '+y+'l7-7v'+h+'l-7 7z" fill="'+c[2]+'"/><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="'+c[0]+'"/><path d="M'+(x+w/2-4)+' '+y+'h8v'+(h*0.35)+'h-8z" fill="#fff" opacity=".18"/>';}
  function ball(x,y,r,c){r=r||9;return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(c||RED)+'"/><circle cx="'+(x-r*0.35)+'" cy="'+(y-r*0.35)+'" r="'+(r*0.28)+'" fill="#fff" opacity=".65"/>';}
  function house(x,y,s,c){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><rect x="-12" y="0" width="24" height="20" fill="'+(c||"#F5D0A9")+'"/><path d="M-16 1l16-15 16 15z" fill="#C2410C"/><rect x="-4" y="8" width="8" height="12" fill="#7C4A2D"/><rect x="5" y="5" width="5" height="5" fill="#93C5FD"/></g>';}
  function bag(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-6 -2q0-9 6-9t6 9" stroke="#9D174D" stroke-width="2.6" fill="none"/><path d="M-11 -3h22l3 17h-28z" fill="#EC4899"/><rect x="-3" y="1" width="6" height="4" rx="1" fill="#FCD34D"/></g>';}
  function apple(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 -6q-4-4-8-2-5 3-4 10 2 9 8 9 2 0 4-1 2 1 4 1 6 0 8-9 1-7-4-10-4-2-8 2z" fill="#E11D48"/><path d="M0 -6q0-4 2-6" stroke="#6B4A3A" stroke-width="1.8" fill="none"/><path d="M2 -9q5-3 7 0-4 3-7 0z" fill="#22C55E"/><circle cx="-5" cy="-1" r="1.8" fill="#fff" opacity=".6"/></g>';}
  function banana(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-12 -6q2 16 16 14 5-1 8-5-8 3-14-2-5-4-6-10z" fill="#FACC15"/><path d="M-12 -6l-1-3 2 0z" fill="#6B4A3A" stroke="#6B4A3A" stroke-width="1.5"/><path d="M12 3l1.5 1" stroke="#6B4A3A" stroke-width="2"/></g>';}
  function books(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><rect x="-12" y="4" width="24" height="6" rx="1" fill="#3B82F6"/><rect x="-10" y="-2" width="22" height="6" rx="1" fill="#10B981"/><rect x="-13" y="-8" width="22" height="6" rx="1" fill="#F59E0B"/><path d="M-12 7h22M-10 1h20M-13 -5h20" stroke="#fff" stroke-width=".8" opacity=".7"/></g>';}
  function gift(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><rect x="-10" y="-4" width="20" height="16" fill="#A855F7"/><rect x="-12" y="-9" width="24" height="6" fill="#C084FC"/><rect x="-2" y="-9" width="4" height="21" fill="#FCD34D"/><path d="M0 -9q-8-8-9-2t9 2q8-8 9-2t-9 2" fill="none" stroke="#FCD34D" stroke-width="2.4"/></g>';}
  function cup(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-12 -8h24l-3 18h-18z" fill="#F9FAFB"/><path d="M12 -4q8 0 6 7t-8 5" stroke="#F9FAFB" stroke-width="3" fill="none"/><ellipse cx="0" cy="-8" rx="12" ry="2.5" fill="#B45309"/><path d="M-4 -14q2-3 0-6M3 -14q2-3 0-6" stroke="#D1D5DB" stroke-width="1.6" fill="none"/></g>';}
  function cloud(x,y,s,c){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-16 6q-8 0-8-7t9-7q2-9 12-9 9 0 11 8 9-1 10 7 0 8-9 8z" fill="'+(c||"#CBD5E1")+'"/></g>';}
  function rain(x,y,s){s=s||1;return cloud(x,y,s,"#94A3B8")+'<g transform="translate('+x+' '+y+') scale('+s+')" stroke="#60A5FA" stroke-width="2.4" stroke-linecap="round"><path d="M-12 12l-3 7M-2 12l-3 7M8 12l-3 7"/></g>';}
  function sun(x,y,s){s=s||1;var r='';for(var i=0;i<8;i++){var a=i*Math.PI/4;r+='<path d="M'+(Math.cos(a)*12).toFixed(1)+' '+(Math.sin(a)*12).toFixed(1)+'L'+(Math.cos(a)*17).toFixed(1)+' '+(Math.sin(a)*17).toFixed(1)+'"/>';}
    return '<g transform="translate('+x+' '+y+') scale('+s+')"><g stroke="#FBBF24" stroke-width="3" stroke-linecap="round">'+r+'</g><circle r="9" fill="#FCD34D"/></g>';}
  function umb(x,y,s,c){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-16 0q0-14 16-14t16 14q-4-3-8 0-4-3-8 0-4-3-8 0-4-3-8 0z" fill="'+(c||"#8B5CF6")+'"/><path d="M0 -1v16q0 4-4 4t-4-4" stroke="#374151" stroke-width="2.2" fill="none"/></g>';}
  function pin(x,y,s,c){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 0q-11-12-11-20a11 11 0 0 1 22 0q0 8-11 20z" fill="'+(c||RED)+'"/><circle cx="0" cy="-20" r="4.5" fill="#fff"/></g>';}
  function flag(x,y,c){return '<rect x="'+x+'" y="'+(y-30)+'" width="2.5" height="30" fill="#6B7280"/><path d="M'+(x+2.5)+' '+(y-30)+'h16l-4 6 4 6h-16z" fill="'+(c||RED)+'"/>';}
  function clock(x,y,r,h,m,fill){var ha=(h%12+m/60)*30-90,ma=m*6-90,rad=Math.PI/180;
    return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(fill||"#F9FAFB")+'" stroke="#475569" stroke-width="3"/>'+
    [0,3,6,9].map(function(i){var a=(i*30-90)*rad;return '<circle cx="'+(x+Math.cos(a)*r*0.78).toFixed(1)+'" cy="'+(y+Math.sin(a)*r*0.78).toFixed(1)+'" r="1.6" fill="#475569"/>';}).join("")+
    '<path d="M'+x+' '+y+'L'+(x+Math.cos(ha*rad)*r*0.5).toFixed(1)+' '+(y+Math.sin(ha*rad)*r*0.5).toFixed(1)+'" stroke="#1F2937" stroke-width="3.2" stroke-linecap="round"/>'+
    '<path d="M'+x+' '+y+'L'+(x+Math.cos(ma*rad)*r*0.75).toFixed(1)+' '+(y+Math.sin(ma*rad)*r*0.75).toFixed(1)+'" stroke="#1F2937" stroke-width="2.2" stroke-linecap="round"/><circle cx="'+x+'" cy="'+y+'" r="2" fill="#1F2937"/>';}
  function sector(cx,cy,r,f,c){if(f>=1)return '<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+c+'"/>';var a=f*2*Math.PI-Math.PI/2,ex=cx+Math.cos(a)*r,ey=cy+Math.sin(a)*r;
    return '<path d="M'+cx+' '+cy+'V'+(cy-r)+'A'+r+' '+r+' 0 '+(f>0.5?1:0)+' 1 '+ex.toFixed(1)+' '+ey.toFixed(1)+'z" fill="'+c+'"/>';}
  function chair(x,y,c){return '<g transform="translate('+x+' '+y+')"><rect x="-10" y="-30" width="4" height="30" fill="'+(c||"#8B5E3C")+'"/><rect x="-10" y="-30" width="20" height="4" fill="'+(c||"#8B5E3C")+'"/><rect x="-10" y="-12" width="22" height="4" fill="'+(c||"#8B5E3C")+'"/><rect x="8" y="-8" width="4" height="8" fill="'+(c||"#8B5E3C")+'"/><rect x="-10" y="-8" width="4" height="8" fill="'+(c||"#8B5E3C")+'"/></g>';}
  function face(x,y,r,m){var g='<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#FCD34D"/><circle cx="'+(x-r*0.35)+'" cy="'+(y-r*0.15)+'" r="'+(r*0.11)+'" fill="#3B2A20"/><circle cx="'+(x+r*0.35)+'" cy="'+(y-r*0.15)+'" r="'+(r*0.11)+'" fill="#3B2A20"/>';
    if(m==="happy")g+='<path d="M'+(x-r*0.45)+' '+(y+r*0.2)+'q'+(r*0.45)+' '+(r*0.5)+' '+(r*0.9)+' 0" stroke="#3B2A20" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    else g+='<path d="M'+(x-r*0.4)+' '+(y+r*0.5)+'q'+(r*0.4)+' '+(-r*0.4)+' '+(r*0.8)+' 0" stroke="#3B2A20" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    return g;}
  function bubble(x,y,w,h,inner,c){return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="9" fill="'+(c||"#F9FAFB")+'"/><path d="M'+(x-w/2+8)+' '+(y+h/2-1)+'l-4 9 11-9z" fill="'+(c||"#F9FAFB")+'"/>'+(inner||'');}
  function qb(x,y,r){r=r||13;return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+BLUE+'"/><path d="M'+(x-r*0.55)+' '+(y+r*0.65)+'l-3 7 9-4z" fill="'+BLUE+'"/>'+T(x,y+r*0.55,"?",r*1.5,"#fff",900);}
  function fog(x,y,w,h){return '<rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" rx="'+(h/2)+'" fill="#E5E7EB" opacity=".72"/>';}
  /* ---------- 前置詞：箱とボール ---------- */
  var BX=[30,52,36,28]; /* x,y,w,h */
  function bx(){return box(BX[0],BX[1],BX[2],BX[3]);}
  A.p_v=svg(SH+'<path d="M28 50l7-7h38l-7 7z" fill="#7A4B2A"/><rect x="28" y="50" width="38" height="34" fill="#8B5A33"/>'+ball(47,68,10)+'<rect x="28" y="50" width="38" height="34" fill="#C68B59" opacity=".55"/><path d="M66 50l7-7v34l-7 7z" fill="#A86F42"/><rect x="28" y="50" width="38" height="34" fill="none" stroke="#7A4B2A" stroke-width="2"/><path d="M28 50l-10-12M66 50l12-10" stroke="#E0A872" stroke-width="5" stroke-linecap="round"/>'+mk(47,52));
  A.p_na=svg(SH+box(28,54,38,30)+ball(47,37,10)+mk(47,22));
  A.p_u=svg(SH+box(14,54,36,30)+ball(70,74,10)+'<path d="M56 64h6" stroke="'+GOLD+'" stroke-width="3" stroke-linecap="round"/>'+mk(70,58));
  A.p_k=svg(SH+box(56,54,30,30)+ball(14,72,9)+arr(27,72,52,72));
  A.p_iz=svg(SH+'<path d="M26 56l7-7h38l-7 7z" fill="#7A4B2A"/>'+box(26,56,38,28).replace(/<path d="M26 56l7-7h38l-7 7z" fill="#E0A872"\/>/,'')+'<path d="M26 56l-10-10M64 56l12-9" stroke="#E0A872" stroke-width="5" stroke-linecap="round"/>'+arr(48,52,48,30)+ball(48,18,9));
  A.p_ot=svg(SH+box(10,54,30,30)+arr(46,70,74,70)+ball(84,70,8));
  A.p_do=svg(SH+'<rect x="6" y="66" width="84" height="6" rx="3" fill="#CBD5E1"/><circle cx="12" cy="69" r="5" fill="'+GREEN+'"/>'+arr(18,69,70,69)+'<rect x="72" y="46" width="4" height="40" fill="'+RED+'"/>'+flag(74,46,RED)+T(14,58,"",8));
  A.p_cherez=svg(SH+'<path d="M30 84V52q0-18 18-18t18 18v32z" fill="#A8A29E"/><path d="M38 84V54q0-10 10-10t10 10v30z" fill="#44403C"/>'+arr(6,72,90,72,BLUE,4)+'<path d="M38 72h20" stroke="#93C5FD" stroke-width="4" stroke-dasharray="3 3"/>');
  A.p_mimo=svg(SH+box(30,40,32,28)+parr("M6 80Q48 92 86 70",88,69,-28)+T(48,60,"",8));
  A.p_vdol=svg('<rect x="0" y="40" width="96" height="22" fill="#60A5FA"/><path d="M0 51q12-4 24 0t24 0 24 0 24 0" stroke="#BFDBFE" stroke-width="2" fill="none"/><rect x="0" y="62" width="96" height="10" fill="#86C06C"/><rect x="0" y="30" width="96" height="10" fill="#86C06C"/>'+arr(8,80,88,80,BLUE,4)+'<circle cx="20" cy="22" r="6" fill="#4CA35A"/><circle cx="52" cy="22" r="6" fill="#4CA35A"/><circle cx="80" cy="22" r="6" fill="#4CA35A"/>');
  A.p_vokrug=svg(SH+box(30,46,32,26)+'<ellipse cx="50" cy="56" rx="40" ry="28" fill="none" stroke="'+BLUE+'" stroke-width="4" stroke-dasharray="0" />'+head(20,38,-40)+head(80,74,140));
  A.p_mezhdu=svg(SH+box(4,56,24,28)+box(64,56,24,28)+ball(48,72,10)+mk(48,56));
  A.p_sredi=svg(SH+[[16,40],[34,30],[56,28],[76,38],[20,62],[42,54],[64,60],[82,62],[30,80],[54,80],[74,80]].map(function(p){return ball(p[0],p[1],8,"#9CA3AF");}).join("")+glow(48,58,13)+ball(48,58,9));
  A.p_krome=svg([14,32,50,68,86].map(function(x,i){return ball(x,52,8,i===3?"#9CA3AF":RED)+(i===3?X(x,74,6):CK(x+1,74,5));}).join(""));
  A.p_vmesto=svg(SH+'<circle cx="24" cy="62" r="11" fill="none" stroke="'+GRAY+'" stroke-width="2.5" stroke-dasharray="4 3"/>'+box(58,56,24,24,["#3B82F6","#93C5FD","#1D4ED8"])+parr("M28 44Q48 22 66 44",68,47,60)+parr("M66 82Q48 92 30 80",28,78,-150,GRAY,3)+X(24,62,6,GRAY));
  A.p_s=svg(SH+per(32,30,"#10B981")+per(64,30,"#F97316",{long:1,hair:"#B45309"})+'<path d="M40 58q8 6 16 0" stroke="#F2C39A" stroke-width="5" fill="none" stroke-linecap="round"/>');
  A.p_dlya=svg(SH+gift(20,66,1)+arr(34,66,54,66)+per(72,32,"#F97316",{long:1,hair:"#B45309",mood:"happy"}));
  A.p_bez=svg(SH+cup(34,64,1.5)+'<rect x="64" y="58" width="16" height="16" rx="2" fill="#F9FAFB" stroke="#CBD5E1"/>'+slash(72,66,15));
  A.p_o=svg(SH+per(26,44,"#10B981")+bubble(64,30,50,40,house(64,28,1)));
  A.p_pered=svg(SH+box(36,44,34,28)+ball(40,76,11)+mk(40,58));
  A.p_szadi=svg(SH+ball(70,46,10)+box(30,50,36,34)+mk(70,30));
  A.p_vperedi=svg(SH+per(78,40,"#10B981",{s:0.85})+per(54,40,"#3B82F6",{s:0.85})+per(30,40,"#F97316",{s:0.85,long:1})+arr(70,22,92,22,BLUE,3)+hi(78,40,0.85));
  A.p_naprotiv=svg('<rect x="0" y="66" width="96" height="22" fill="#4B5563"/><path d="M4 77h12M28 77h12M52 77h12M76 77h12" stroke="#F3F4F6" stroke-width="2"/>'+house(18,42,1.2)+house(78,42,1.2,"#BFDBFE")+arr(36,52,60,52,BLUE,3)+head(36,52,180,BLUE));
  A.p_vnutri=svg(SH+'<rect x="18" y="34" width="60" height="50" fill="#F5D0A9"/><path d="M12 36l36-28 36 28z" fill="#C2410C"/><rect x="28" y="44" width="40" height="32" fill="#FEF3C7" stroke="#7C4A2D" stroke-width="3"/>'+per(48,52,"#10B981",{s:0.6})+mk(48,40));
  A.p_snaruzhi=svg(SH+'<rect x="8" y="40" width="46" height="44" fill="#F5D0A9"/><path d="M4 42l27-24 27 24z" fill="#C2410C"/><rect x="24" y="60" width="14" height="24" fill="#7C4A2D"/><rect x="12" y="48" width="9" height="9" fill="#93C5FD"/><rect x="42" y="48" width="9" height="9" fill="#93C5FD"/>'+per(76,46,"#10B981")+hi(76,46));
  function shelf(top){return '<rect x="22" y="10" width="52" height="78" fill="#8B5E3C"/><rect x="26" y="14" width="44" height="70" fill="#5C3D27"/><rect x="26" y="37" width="44" height="4" fill="#8B5E3C"/><rect x="26" y="60" width="44" height="4" fill="#8B5E3C"/>'+books(38,top?28:74,0.7)+ball(top?58:56,top?28:74,7)+glow(top?58:56,top?28:74,10)+(top?arr(84,50,84,22,GOLD,3):arr(84,46,84,76,GOLD,3));}
  A.p_naverhu=svg(shelf(1));A.p_vnizu=svg(shelf(0));
  function hiLow(up){return '<rect x="18" y="'+(up?18:50)+'" width="22" height="'+(up?70:38)+'" rx="2" fill="'+(up?GOLD:"#CBD5E1")+'"/><rect x="56" y="'+(up?50:18)+'" width="22" height="'+(up?38:70)+'" rx="2" fill="'+(up?"#CBD5E1":"#94A3B8")+'"/>'+(up?arr(29,46,29,26,"#B45309",3):'<rect x="18" y="50" width="22" height="38" rx="2" fill="'+GOLD+'"/>'+arr(29,58,29,80,"#B45309",3));}
  A.p_vyshe=svg(hiLow(1));A.p_nizhe=svg(hiLow(0));
  /* ここ・そこ・〜へ・〜から */
  A.here=svg(SH+per(24,32,"#10B981")+'<path d="M34 56l10 8" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+glow(54,78,9)+pin(54,84,0.9,GOLD)+pin(86,58,0.45,"#CBD5E1"));
  A.there=svg(SH+per(18,34,"#10B981")+'<path d="M26 54l16-6" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+arr(44,48,70,40,BLUE,2.5,"3 3")+pin(80,62,0.9,GOLD)+pin(18,90,0.4,"#CBD5E1"));
  A.tuda=svg(SH+per(16,34,"#10B981")+arr(30,72,70,72)+pin(80,80,0.85,GOLD));
  A.syuda=svg(SH+per(18,34,"#10B981")+pin(18,90,0.45,GOLD)+arr(74,72,34,72)+pin(82,80,0.6,"#CBD5E1"));
  A.ottuda=svg(SH+per(16,34,"#10B981")+pin(80,80,0.85,GOLD)+arr(68,72,30,72));
  A.otsyuda=svg(SH+per(18,34,"#10B981")+pin(18,90,0.45,GOLD)+'<circle cx="18" cy="72" r="0" />'+arr(34,72,76,72)+pin(84,80,0.5,"#CBD5E1"));
  /* ---------- 人の代名詞（左＝話している私、右＝相手、奥＝その他の人） ---------- */
  var ME=[20,36,"#10B981"],YOU=[76,36,"#3B82F6"];
  function scene(o){var g=SH;
    g+=o.third||(per(48,22,"#9CA3AF",{s:0.7})+'');
    g+=per(ME[0],ME[1],ME[2])+'<path d="M4 14h22v10h-14l-4 4v-4h-4z" fill="#F9FAFB"/><path d="M8 19h14" stroke="#9CA3AF" stroke-width="2"/>';
    g+=o.you||per(YOU[0],YOU[1],YOU[2],o.youo||{});
    return g+(o.extra||'');}
  A.ya=svg(scene({extra:hi(20,36)+'<path d="M26 58l-4-6" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'}));
  A.ty=svg(scene({extra:hi(76,36)+'<path d="M28 56l14-4" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>',youo:{mood:"happy"}}));
  A.vy=svg(scene({youo:{tie:1,hair:"#9CA3AF"},extra:hi(76,36)+'<path d="M28 56l14-4" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'}));
  A.vy_vse=svg(scene({you:per(66,40,"#3B82F6",{s:0.85})+per(86,40,"#F97316",{s:0.85,long:1})+per(76,30,"#8B5CF6",{s:0.75}),extra:'<ellipse cx="76" cy="73" rx="22" ry="5" fill="'+GOLD+'" opacity=".8"/>'+mk(76,14)}));
  A.on=svg(scene({third:per(48,24,"#64748B",{s:0.8})+hi(48,24,0.8)}));
  A.ona=svg(scene({third:per(48,24,"#E11D48",{s:0.8,long:1,hair:"#B45309"})+hi(48,24,0.8)}));
  A.ono=svg(SH+per(20,36,"#10B981")+'<path d="M28 56l20-8" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+box(52,56,30,26)+glow(70,64,22)+mk(70,40));
  A.my=svg(SH+per(20,36,"#10B981")+per(42,36,"#F97316",{long:1})+per(76,36,"#3B82F6",{op:.55})+'<ellipse cx="31" cy="74" rx="24" ry="5" fill="'+GOLD+'" opacity=".8"/>'+mk(31,16));
  A.oni=svg(scene({third:per(40,24,"#64748B",{s:0.75})+per(58,24,"#E11D48",{s:0.75,long:1})+'<ellipse cx="49" cy="53" rx="20" ry="4" fill="'+GOLD+'" opacity=".8"/>'+mk(49,8)}));
  A.eto=svg(SH+per(18,34,"#10B981")+'<path d="M26 54l12-2" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+box(42,58,24,24)+glow(56,66,18)+house(84,62,0.5,"#E5E7EB"));
  /* この・あの（近い物／遠い物）  性：дом(男) сумка(女) яблоко(中) книги(複) */
  function item(k,x,y,s){return k==="m"?house(x,y-8,s):k==="f"?bag(x,y,s):k==="n"?apple(x,y,s):books(x,y,s);}
  function near(k){return svg(SH+per(16,34,"#10B981")+'<path d="M24 54l14-2" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+glow(50,64,16)+item(k,50,66,1.15)+item(k,84,58,0.5)+'<path d="M76 70v0" />');}
  A.etot=near("m");A.eta=near("f");A.eti=near("p");
  A.tot=svg(SH+per(16,34,"#10B981")+'<path d="M24 54l18-8" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+arr(44,46,66,40,BLUE,2.5,"3 3")+item("m",44,74,0.7)+glow(80,48,14)+item("m",80,52,0.75));
  /* 〜の（持ち主）：持ち主に金色の印、物との間を金色の線で結ぶ */
  function owner(who,k){var g=SH,ix,iy=74;
    if(who==="me"){g+=per(22,30,"#10B981")+hi(22,30)+'<path d="M4 8h22v10h-14l-4 4v-4h-4z" fill="#F9FAFB"/>';ix=68;}
    else if(who==="you"){g+=per(74,30,"#3B82F6",{tie:1,hair:"#9CA3AF"})+hi(74,30);ix=28;}
    else if(who==="youc"){g+=per(74,30,"#3B82F6",{mood:"happy"})+hi(74,30);ix=28;}
    else if(who==="we"){g+=per(16,30,"#10B981")+per(38,30,"#F97316",{long:1})+'<ellipse cx="27" cy="68" rx="22" ry="4.5" fill="'+GOLD+'" opacity=".8"/>'+mk(27,10);ix=72;}
    else if(who==="they"){g+=per(62,30,"#64748B")+per(82,30,"#E11D48",{long:1})+'<ellipse cx="72" cy="68" rx="22" ry="4.5" fill="'+GOLD+'" opacity=".8"/>'+mk(72,10);ix=24;}
    else if(who==="he"){g+=per(72,30,"#64748B")+hi(72,30);ix=26;}
    else if(who==="she"){g+=per(72,30,"#E11D48",{long:1,hair:"#B45309"})+hi(72,30);ix=26;}
    g+='<circle cx="'+ix+'" cy="'+(iy-4)+'" r="17" fill="#F9FAFB" opacity=".9"/>'+item(k,ix,iy-2,1);
    return svg(g);}
  A.moy=owner("me","m");A.moya=owner("me","f");A.moyo=owner("me","n");A.moi=owner("me","p");
  A.vash=owner("you","m");A.vasha=owner("you","f");A.vashi=owner("you","p");
  A.tvoy=owner("youc","m");A.nash=owner("we","m");A.ikh=owner("they","m");A.ego=owner("he","m");A.eyo=owner("she","f");
  A.chey=svg(SH+'<circle cx="48" cy="30" r="17" fill="#F9FAFB"/>'+bag(48,32,1.1)+qb(76,16,10)+per(18,52,"#10B981",{s:0.7})+per(48,58,"#3B82F6",{s:0.6})+per(78,52,"#E11D48",{s:0.7,long:1}));
  A.svoy=svg(SH+per(34,30,"#10B981")+hi(34,30)+bag(72,68,1.2)+parr("M48 50Q70 34 72 52",72,54,95,GOLD,3)+parr("M64 76Q46 86 42 70",42,68,-95,GOLD,3));
  A.sam=svg(SH+per(48,30,"#10B981")+hi(48,30)+'<path d="M58 56l-8-6" stroke="#F2C39A" stroke-width="4.5" stroke-linecap="round"/>'+ghost(16,40,0.8)+ghost(80,40,0.8));
  A.sebya=svg(SH+per(28,34,"#10B981")+'<rect x="58" y="10" width="30" height="72" rx="15" fill="#BAE6FD" stroke="#94A3B8" stroke-width="3"/>'+per(73,34,"#10B981",{op:.6,s:0.85})+'<path d="M38 30h14" stroke="'+GOLD+'" stroke-width="2.5" stroke-dasharray="3 3"/>');
  /* 疑問詞：右上に「？」 */
  function Q(inner){return svg(SH+inner+qb(78,18,13));}
  A.q_kto=Q(shadow(42,32,1.05));
  A.q_chto=Q(box(26,48,36,32)+'<path d="M26 48l7-7h36" fill="none"/>'+T(44,72,"?",20,"#fff",900));
  A.q_gde=Q(pin(42,80,1.3,RED)+'<ellipse cx="42" cy="84" rx="16" ry="4" fill="#000" opacity=".2"/>');
  A.q_kuda=Q(per(16,34,"#10B981",{s:0.85})+arr(30,72,60,72)+pin(70,80,0.7,"#CBD5E1")+T(70,72,"?",11,"#475569",900));
  A.q_otkuda=Q(pin(18,80,0.7,"#CBD5E1")+T(18,72,"?",11,"#475569",900)+arr(30,72,58,72)+per(74,40,"#10B981",{s:0.85}));
  A.q_kogda=Q(clock(42,56,26,3,0));
  A.q_pochemu=Q(per(40,36,"#10B981")+'<path d="M26 58l-8-10M54 58l8-10" stroke="#F2C39A" stroke-width="4.5" stroke-linecap="round"/>'+cup(64,78,0.7).replace('scale(0.7)','scale(0.7) rotate(80)')+'<path d="M58 84q8 2 14-2" stroke="#B45309" stroke-width="3" fill="none"/>');
  A.q_zachem=Q('<circle cx="42" cy="56" r="28" fill="#F9FAFB"/><circle cx="42" cy="56" r="20" fill="'+RED+'"/><circle cx="42" cy="56" r="12" fill="#F9FAFB"/><circle cx="42" cy="56" r="5" fill="'+RED+'"/>'+arr(80,76,48,58,"#374151",3));
  A.q_kak=Q('<g transform="translate(40 58)"><path d="M-6 -24h12l2 7 6 3 7-3 8 8-3 7 3 6 7 2v12l-7 2-3 6 3 7-8 8-7-3-6 3-2 7h-12l-2-7-6-3-7 3-8-8 3-7-3-6-7-2v-12l7-2 3-6-3-7 8-8 7 3 6-3z" fill="#94A3B8"/><circle r="9" fill="#F9FAFB"/></g>');
  function which(k){return Q([20,44,68].map(function(x,i){var c=["#EF4444","#3B82F6","#22C55E"][i];return k==="m"?house(x,58,0.9,c):k==="f"?'<g>'+bag(x,70,0.9).replace("#EC4899",c)+'</g>':books(x,70,0.85);}).join(""));}
  A.q_kakoy=which("m");A.q_kakaya=which("f");A.q_kakie=which("p");
  A.q_skolko=Q([0,1,2,3,4].map(function(i){return '<ellipse cx="36" cy="'+(80-i*7)+'" rx="16" ry="5" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>';}).join("")+'<ellipse cx="62" cy="80" rx="12" ry="4" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/><ellipse cx="62" cy="74" rx="12" ry="4" fill="#F59E0B" stroke="#B45309" stroke-width="1.5"/>');
  A.q_naskolko=Q('<rect x="10" y="56" width="62" height="14" rx="7" fill="#E5E7EB"/><rect x="10" y="56" width="40" height="14" rx="7" fill="'+BLUE+'"/>'+T(50,48,"?",14,"#64748B",900)+'<path d="M50 52v20" stroke="#64748B" stroke-width="2" stroke-dasharray="2 2"/>');
  A.kotoryy=svg(SH+house(20,56,0.9,"#E5E7EB")+house(48,56,0.9,"#FDE68A")+house(76,56,0.9,"#E5E7EB")+glow(48,64,20)+mk(48,30)+'<path d="M8 88h80" stroke="none"/>');
  A.q_say=svg(SH+per(26,46,"#10B981")+bubble(64,30,50,36,T(56,40,"A",22,"#3B82F6",900)+T(76,40,"?",22,"#64748B",900)));
  A.q_repeat=svg(SH+per(26,46,"#10B981")+bubble(64,30,50,36,'<path d="M52 30a12 12 0 1 1 3 9" stroke="'+BLUE+'" stroke-width="4" fill="none" stroke-linecap="round"/>'+head(54,40,120,BLUE,0.8)));
  A.understand=svg(SH+per(48,46,"#10B981",{s:1.05,mood:"happy"})+'<g transform="translate(48 14)"><circle r="10" fill="#FDE047"/><rect x="-4" y="9" width="8" height="6" rx="1" fill="#9CA3AF"/><path d="M-16 -6l-5-3M16 -6l5-3M0 -16v-5M-13 6l-5 2M13 6l5 2" stroke="#FDE047" stroke-width="2.5" stroke-linecap="round"/></g>');
  /* 不定・否定の代名詞 */
  A.nikto=svg(SH+ghost(22,34,0.9)+ghost(48,34,0.9)+ghost(74,34,0.9)+slash(48,52,30));
  A.nichto=svg(SH+'<path d="M24 52l7-7h38l-7 7z" fill="#7A4B2A"/><rect x="24" y="52" width="38" height="32" fill="#C68B59"/><path d="M62 52l7-7v32l-7 7z" fill="#A86F42"/><path d="M24 52l-10-10M62 52l12-9" stroke="#E0A872" stroke-width="5" stroke-linecap="round"/>'+T(44,78,"0",22,"#fff",900)+slash(76,22,12));
  A.nigde=svg('<rect x="6" y="20" width="84" height="64" rx="6" fill="#D1FAE5"/><path d="M6 50q30-14 50 4t34-6" stroke="#93C5FD" stroke-width="6" fill="none"/><path d="M30 20v64M62 20v64" stroke="#fff" stroke-width="3"/>'+pin(24,50,0.55,"#CBD5E1")+pin(50,78,0.55,"#CBD5E1")+pin(74,44,0.55,"#CBD5E1")+slash(48,52,32));
  A.nikuda=svg(SH+per(48,34,"#10B981",{s:0.85})+arr(36,62,10,62,GRAY,3)+arr(60,62,86,62,GRAY,3)+arr(48,22,48,4,GRAY,3)+slash(48,52,34));
  A.nikakoy=svg([20,48,76].map(function(x,i){return '<rect x="'+(x-11)+'" y="40" width="22" height="22" rx="'+(i===1?11:3)+'" fill="'+["#F59E0B","#3B82F6","#22C55E"][i]+'" opacity=".55"/>';}).join("")+slash(48,52,34));
  A.kto_to=svg(SH+'<circle cx="48" cy="50" r="40" fill="#E5E7EB" opacity=".35"/>'+shadow(48,30,1.05)+fog(48,60,80,22)+qb(76,18,11));
  A.chto_to=svg(SH+gift(46,62,2)+qb(78,20,11));
  A.gde_to=svg(SH+'<path d="M8 70q20-30 40-20t40-14" stroke="#CBD5E1" stroke-width="6" fill="none" stroke-dasharray="2 6" stroke-linecap="round"/>'+pin(60,62,1,RED)+fog(52,50,76,26)+cloud(28,28,0.8,"#E5E7EB"));
  A.kogda_to=svg(clock(48,48,30,10,10)+fog(48,52,84,30)+'<path d="M8 88h80" stroke="none"/>');
  A.kuda_to=svg(SH+per(16,34,"#10B981",{s:0.85})+arr(30,70,84,70)+fog(70,62,48,40));
  A.chey_to=svg(SH+bag(46,62,1.8)+qb(78,22,11)+fog(46,66,60,16));
  A.kakoy_to=svg(SH+'<path d="M48 22l8 18 20 2-15 13 5 20-18-11-18 11 5-20-15-13 20-2z" fill="#A78BFA"/>'+fog(48,52,84,30));
  A.kto_nibud=svg(SH+shadow(20,36,0.85)+shadow(48,36,0.85)+shadow(76,36,0.85)+'<path d="M20 22l28-12 28 12" stroke="'+GOLD+'" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>'+T(48,12,"?",14,GOLD,900));
  A.chto_nibud=svg(SH+box(6,58,22,22)+gift(48,70,0.9)+'<g>'+ball(80,72,10,"#22C55E")+'</g>'+'<path d="M17 50L48 26 80 50" stroke="'+GOLD+'" stroke-width="2.5" fill="none" stroke-dasharray="3 3"/>'+T(48,22,"?",14,GOLD,900));
  A.nekogo=svg(SH+per(22,34,"#10B981",{mood:"sad"})+'<path d="M32 50h12" stroke="#94A3B8" stroke-width="3" stroke-dasharray="2 3"/>'+ghost(66,34,1)+X(66,52,10));
  A.nechego=svg(SH+per(22,34,"#10B981",{mood:"sad"})+'<rect x="48" y="40" width="40" height="42" rx="3" fill="#E5E7EB"/><rect x="52" y="44" width="32" height="34" fill="#F9FAFB"/>'+T(68,70,"0",22,"#94A3B8",900));
  A.inoy=svg([16,36,56].map(function(x){return ball(x,56,9,"#9CA3AF");}).join("")+'<rect x="70" y="46" width="20" height="20" rx="3" fill="'+BLUE+'"/>'+glow(80,56,15));
  A.nekotorye=svg([[14,36],[34,36],[54,36],[74,36],[24,62],[44,62],[64,62],[84,62]].map(function(p,i){return per(p[0],p[1]-12,i<3?"#F59E0B":"#CBD5E1",{s:0.55,face:false});}).join("")+'<rect x="4" y="12" width="64" height="36" rx="10" fill="none" stroke="'+GOLD+'" stroke-width="2.5"/>');
  A.mnogie=svg([[14,36],[34,36],[54,36],[74,36],[24,62],[44,62],[64,62],[84,62]].map(function(p,i){return per(p[0],p[1]-12,i<7?"#F59E0B":"#CBD5E1",{s:0.55,face:false});}).join(""));
  /* ---------- 接続詞 ---------- */
  A.c_i=svg(SH+apple(22,58,1.6)+T(48,68,"+",30,BLUE,900)+banana(76,58,1.5));
  A.c_ili=svg(SH+apple(18,30,1.4)+banana(78,30,1.3)+parr("M48 86V62Q48 50 26 46",22,44,-160,BLUE,3.5)+parr("M48 62Q48 50 70 46",74,44,-20,BLUE,3.5)+T(48,30,"?",22,"#64748B",900));
  A.c_a=svg(SH+per(20,30,"#10B981")+apple(20,80,1)+per(76,30,"#E11D48",{long:1})+banana(76,80,1)+'<path d="M48 18v62" stroke="#94A3B8" stroke-width="3" stroke-dasharray="4 4"/>');
  A.c_no=svg(SH+'<rect x="60" y="20" width="16" height="66" fill="#B45353"/><path d="M60 30h16M60 44h16M60 58h16M60 72h16M68 20v10M64 30v14M72 44v14M64 58v14M68 72v14" stroke="#7F2D2D" stroke-width="1.5"/>'+parr("M8 64H44Q54 64 54 74V84",54,88,90,BLUE,4));
  A.c_tem_ne_menee=svg(SH+'<rect x="40" y="46" width="16" height="40" fill="#B45353"/><path d="M40 56h16M40 66h16M40 76h16M48 46v10M44 56v10M52 66v10" stroke="#7F2D2D" stroke-width="1.5"/>'+parr("M6 76H26Q30 30 48 30T70 76H82",88,76,0,GREEN,4));
  A.c_khotya=svg(rain(48,16,1.1)+per(48,46,"#10B981")+umb(48,40,1.2).replace('<path d="M0 -1v16','<path d="M0 -1v0')+parr("M24 86H80",88,86,0,GREEN,3));
  A.c_zato=svg('<path d="M48 18v62" stroke="#6B7280" stroke-width="3"/><path d="M20 80h56" stroke="#6B7280" stroke-width="4"/><path d="M14 30L82 40" stroke="#6B7280" stroke-width="3"/><path d="M6 32h24l-4 10H10z" fill="#FCA5A5"/><path d="M68 42h24l-4 10H72z" fill="#86EFAC"/>'+T(18,28,"−",18,RED,900)+T(80,38,"+",18,"#15803D",900));
  function cause(res){return svg(SH+rain(22,24,1)+(res?arr(38,46,54,58,BLUE,3.5):arr(54,58,38,46,BLUE,3.5))+per(72,38,"#10B981")+umb(72,34,1)+(res?glow(72,52,22):glow(22,26,22)));}
  A.c_potomu=cause(0);A.c_poetomu=cause(1);
  A.c_esli=svg(SH+per(16,48,"#10B981",{s:0.85})+'<circle cx="26" cy="30" r="2.5" fill="#F9FAFB"/><circle cx="32" cy="23" r="3.5" fill="#F9FAFB"/><rect x="36" y="4" width="56" height="34" rx="16" fill="#F9FAFB"/>'+rain(52,16,0.55)+arr(64,20,72,20,BLUE,2.5)+umb(82,22,0.55)+'<path d="M48 88" />');
  A.c_chtoby=svg(SH+per(18,40,"#10B981",{s:0.9})+books(18,80,0.7)+parr("M32 52Q52 28 66 40",70,44,45,BLUE,3.5)+'<circle cx="76" cy="54" r="16" fill="#F9FAFB"/><circle cx="76" cy="54" r="11" fill="'+RED+'"/><circle cx="76" cy="54" r="6" fill="#F9FAFB"/><circle cx="76" cy="54" r="2.5" fill="'+RED+'"/>');
  A.c_blagodarya=svg(SH+sun(22,28,1.1)+arr(40,40,56,52,BLUE,3.5)+face(72,62,18,"happy"));
  A.c_iz_za=svg(SH+rain(22,26,1)+arr(40,40,56,52,BLUE,3.5)+face(72,62,18,"sad"));
  A.c_ne_tolko=svg(SH+apple(24,40,1.4)+CK(24,72,7)+T(48,56,"+",26,BLUE,900)+glow(74,46,20)+banana(74,44,1.4)+CK(74,74,7));
  A.c_li=svg(SH+CK(28,48,12)+T(48,58,"/",30,"#94A3B8")+X(70,48,11)+qb(48,18,11));
  A.c_razve=svg(SH+per(44,40,"#10B981",{s:1.05})+'<path d="M30 60l-8-12" stroke="#F2C39A" stroke-width="4.5" stroke-linecap="round"/>'+qb(78,20,12)+T(78,52,"!",24,RED,900));
  A.c_by=svg(SH+per(20,46,"#10B981",{s:0.9})+'<circle cx="32" cy="30" r="3" fill="#F9FAFB"/><circle cx="40" cy="22" r="4" fill="#F9FAFB"/><rect x="40" y="2" width="52" height="34" rx="16" fill="#F9FAFB"/>'+house(66,14,0.8,"#FDE68A")+'<path d="M50 10l2 4 4 1-4 1-2 4-2-4-4-1 4-1z" fill="#FBBF24"/>');
  A.c_po_moemu=svg(SH+per(28,42,"#10B981")+'<path d="M38 66l-8-6" stroke="#F2C39A" stroke-width="4.5" stroke-linecap="round"/>'+bubble(68,24,44,32,'<path d="M60 22l5 5 10-10" stroke="'+GREEN+'" stroke-width="4" fill="none" stroke-linecap="round"/>')+mk(28,26));
  A.c_po_slovam=svg(SH+per(18,42,"#64748B")+bubble(48,18,36,24,T(48,24,"“ ”",18,"#64748B"))+per(78,44,"#10B981",{s:0.9})+'<path d="M88 30q4 4 0 10" stroke="'+BLUE+'" stroke-width="2.5" fill="none"/><path d="M92 26q7 8 0 18" stroke="'+BLUE+'" stroke-width="2.5" fill="none"/>');
  A.c_naoborot=svg(SH+arr(14,34,82,34,BLUE,5)+arr(82,62,14,62,"#F97316",5));
  A.c_chem=svg(SH+'<rect x="12" y="22" width="24" height="64" rx="3" fill="'+BLUE+'"/><rect x="60" y="54" width="24" height="32" rx="3" fill="#CBD5E1"/>'+pill(48,56,22,24,"&gt;",20));
  A.c_zavisit=svg(SH+'<rect x="10" y="62" width="34" height="18" rx="9" fill="#E5E7EB"/><circle cx="35" cy="71" r="7" fill="'+GREEN+'"/>'+arr(48,71,62,71,BLUE,3)+sun(78,30,0.75)+rain(78,64,0.55)+'<path d="M66 48h24" stroke="#94A3B8" stroke-width="2"/>');
  /* ---------- 数 ---------- */
  function num(n){var t=Math.floor(n/10),o=n%10,g='<rect x="4" y="4" width="88" height="88" rx="14" fill="#F9FAFB"/>'+T(48,40,String(n),34,INK,900);
    var w=t*7+(o?14:0),x=48-w/2;
    for(var i=0;i<t;i++){g+='<rect x="'+(x+i*7)+'" y="50" width="5" height="36" rx="1" fill="'+BLUE+'"/>';for(var j=1;j<10;j++)g+='<path d="M'+(x+i*7)+' '+(50+j*3.6)+'h5" stroke="#fff" stroke-width=".7"/>';}
    for(var k=0;k<o;k++){g+='<circle cx="'+(x+t*7+4+(k%3)*4.5)+'" cy="'+(56+Math.floor(k/3)*5)+'" r="1.9" fill="#F59E0B"/>';}
    return svg(g);}
  [11,12,13,14,15,16,17,18,19,20,30,40,50,60,70,80,90].forEach(function(n){A["n"+n]=num(n);});
  A.n1000=svg('<rect x="4" y="4" width="88" height="88" rx="14" fill="#F9FAFB"/>'+T(48,34,"1000",28,INK,900)+'<g transform="translate(34 46)"><path d="M0 8l8-8h22l-8 8z" fill="#93C5FD"/><path d="M22 8l8-8v22l-8 8z" fill="#1D4ED8"/><rect x="0" y="8" width="22" height="22" fill="'+BLUE+'"/><path d="M0 15h22M0 22h22M7 8v22M14 8v22" stroke="#fff" stroke-width=".7"/></g>');
  A.n1000000=svg('<rect x="4" y="4" width="88" height="88" rx="14" fill="#F9FAFB"/>'+T(48,40,"1 000 000",15,INK,900)+T(48,66,"100万",20,BLUE,900)+'<path d="M16 78h64" stroke="#E5E7EB" stroke-width="2"/>');
  function frac(a,b,f){return svg('<circle cx="48" cy="38" r="30" fill="#E5E7EB"/>'+sector(48,38,30,f,"#F59E0B")+'<circle cx="48" cy="38" r="30" fill="none" stroke="#fff" stroke-width="2"/>'+(b===4?'<path d="M48 8v60M18 38h60" stroke="#fff" stroke-width="2"/>':'<path d="M48 8v60" stroke="#fff" stroke-width="2"/>')+pill(48,82,40,22,a+"/"+b,17));}
  A.half=frac(1,2,0.5);A.quarter=frac(1,4,0.25);
  A.halfhour=svg('<circle cx="48" cy="40" r="32" fill="#F9FAFB" stroke="#475569" stroke-width="3"/>'+sector(48,40,29,0.5,"#FDE68A")+clock(48,40,32,12,30,"none")+pill(48,84,44,20,"30分",14));
  function ordn(n){var g='';for(var i=1;i<=10;i++){var r=i<=5?0:1,c=(i-1)%5,x=6+c*17.6,y=r?56:24,on=i===n;g+='<rect x="'+x+'" y="'+y+'" width="15" height="22" rx="3" fill="'+(on?GOLD:i<n?"#CBD5E1":"#E5E7EB")+'"/>'+T(x+7.5,y+16,String(i),on?13:10,on?INK:"#64748B",on?900:700);}
    var oc=(n-1)%5,ox=6+oc*17.6+7.5,oy=n<=5?24:56;return svg(g+mk(ox,oy-1)+'<path d="M6 88h84" stroke="none"/>');}
  [4,5,6,7,8,10].forEach(function(n){A["ord"+n]=ordn(n);});
  A.raz=svg('<path d="M30 30a22 22 0 1 1 -4 26" stroke="'+BLUE+'" stroke-width="5" fill="none" stroke-linecap="round"/>'+head(26,58,110,BLUE)+'<circle cx="48" cy="48" r="16" fill="#F9FAFB"/>'+T(48,54,"1回",15,INK,900)+'<path d="M14 82h68" stroke="none"/>');
  A.neskolko=svg(SH+ball(30,66,10)+ball(52,70,10,"#F59E0B")+ball(42,48,10,"#22C55E")+ball(66,52,10,BLUE));
  A.kolichestvo=svg('<rect x="10" y="30" width="44" height="54" rx="6" fill="#DBEAFE" opacity=".6" stroke="#93C5FD" stroke-width="2.5"/>'+[[20,76],[32,76],[44,76],[26,66],[38,66],[32,56]].map(function(p){return ball(p[0],p[1],5.5);}).join("")+pill(72,28,30,22,"6",17,BLUE,"#fff")+'<path d="M58 40l-6 10" stroke="'+BLUE+'" stroke-width="2.5"/>');
  A.chislo=svg('<rect x="14" y="14" width="68" height="70" rx="8" fill="#F9FAFB"/><rect x="14" y="14" width="68" height="18" rx="8" fill="'+RED+'"/><rect x="14" y="24" width="68" height="8" fill="'+RED+'"/><circle cx="32" cy="14" r="3" fill="#475569"/><circle cx="64" cy="14" r="3" fill="#475569"/>'+T(48,72,"23",32,INK,900));
  /* ---------- 頻度（1週間に何日） ---------- */
  function freq(n,lab){var g=T(48,34,lab||(n+"/7"),26,INK,900);for(var i=0;i<7;i++){var x=6+i*12.4;g+='<rect x="'+x+'" y="48" width="10.5" height="16" rx="2.5" fill="'+(i<n?GREEN:"#E5E7EB")+'"/>'+(i<n?'<path d="M'+(x+2.5)+' 56l2.5 2.5 4-5" stroke="#fff" stroke-width="1.8" fill="none"/>':'');}
    return svg('<rect x="2" y="8" width="92" height="66" rx="10" fill="#F9FAFB"/>'+g+T(48,90,"",8));}
  A.f_vsegda=freq(7);A.f_obychno=freq(6);A.f_chasto=freq(5);A.f_inogda=freq(3);A.f_redko=freq(1);
  A.f_nikogda=svg('<rect x="2" y="8" width="92" height="66" rx="10" fill="#F9FAFB"/>'+T(48,34,"0/7",26,RED,900)+[0,1,2,3,4,5,6].map(function(i){var x=6+i*12.4;return '<rect x="'+x+'" y="48" width="10.5" height="16" rx="2.5" fill="#E5E7EB"/><path d="M'+(x+2.5)+' 52.5l5.5 7M'+(x+8)+' 52.5l-5.5 7" stroke="#F87171" stroke-width="1.6"/>';}).join(""));
  A.f_postoyanno=svg('<rect x="2" y="8" width="92" height="66" rx="10" fill="#F9FAFB"/>'+[0,1,2,3,4,5,6].map(function(i){return '<rect x="'+(6+i*12.4)+'" y="48" width="10.5" height="16" rx="2.5" fill="#BBF7D0"/>';}).join("")+'<path d="M8 40q10-10 20 0t20 0 20 0 20 0" stroke="'+BLUE+'" stroke-width="4" fill="none"/><rect x="6" y="54" width="84" height="4" rx="2" fill="'+GREEN+'"/>'+T(48,26,"∞",22,INK,900));
  A.kazhdyy=svg(SH+[12,30,48,66,84].map(function(x){return per(x,40,"#F59E0B",{s:0.6})+CK(x+1,24,5);}).join(""));
  /* ---------- 時間の線（左＝過去、右＝未来、「今」の印） ---------- */
  function tl(inner,noNow){var g='<path d="M6 60H84" stroke="#94A3B8" stroke-width="4" stroke-linecap="round"/>'+head(92,60,0,"#94A3B8");
    if(!noNow)g+='<path d="M60 48v24" stroke="'+INK+'" stroke-width="0"/>'+pill(60,84,26,18,"今",13,"#F9FAFB",INK)+'<path d="M60 52v16" stroke="#F9FAFB" stroke-width="3.5"/>';
    return svg(g+inner);}
  function dot(x,c,r){return '<circle cx="'+x+'" cy="60" r="'+(r||7)+'" fill="'+(c||GOLD)+'" stroke="#fff" stroke-width="2"/>';}
  function rng(a,b,c){return '<rect x="'+a+'" y="54" width="'+(b-a)+'" height="12" rx="6" fill="'+(c||GOLD)+'" opacity=".85"/>';}
  A.t_uzhe=tl(dot(34,GREEN,9)+CK(34,58,5,"#fff")+'<path d="M34 46V36" stroke="#94A3B8" stroke-width="0"/>'+pill(34,34,34,18,"完了",11,GREEN,"#fff"));
  A.t_eshchyo=tl(rng(18,78,GOLD)+arr(66,40,88,40,BLUE,3.5)+T(36,44,"…",20,"#475569"));
  A.t_seychas=tl(glow(60,60,10)+dot(60,GOLD,7));
  A.t_potom=tl(dot(80)+parr("M60 44Q70 30 80 44",81,47,70,BLUE,3));
  A.t_davno=tl(dot(12)+'<path d="M12 40H60" stroke="'+BLUE+'" stroke-width="2.5" stroke-dasharray="3 3"/><path d="M12 36v8M60 36v8" stroke="'+BLUE+'" stroke-width="2.5"/>');
  A.t_nedavno=tl(dot(48)+'<path d="M48 40H60" stroke="'+BLUE+'" stroke-width="2.5"/><path d="M48 36v8M60 36v8" stroke="'+BLUE+'" stroke-width="2.5"/>');
  A.t_skoro=tl(dot(72)+'<path d="M60 40H72" stroke="'+BLUE+'" stroke-width="2.5"/><path d="M60 36v8M72 36v8" stroke="'+BLUE+'" stroke-width="2.5"/>');
  A.t_ranshe=tl(dot(30)+arr(54,40,26,40,BLUE,3.5));
  A.t_pozzhe=tl(dot(84,GOLD,6)+arr(64,40,88,40,BLUE,3.5));
  A.t_teper=tl(rng(8,60,"#CBD5E1")+rng(60,84,GOLD)+X(30,40,6,"#94A3B8")+CK(72,40,6));
  A.t_togda=tl(dot(30)+bubble(30,28,34,22,T(30,33,"その時",9,INK))+'<path d="M30 40v12" stroke="none"/>');
  A.t_nazad=tl(dot(26)+parr("M60 44Q44 26 28 44",26,48,110,BLUE,3)+pill(43,24,30,16,"3日",10,BLUE,"#fff"));
  A.t_odnazhdy=tl('<path d="M34 46l3.5 7 7.5 1-5.5 5 1.5 7.5-7-4-7 4 1.5-7.5-5.5-5 7.5-1z" fill="'+GOLD+'"/>');
  A.t_proshlyy=tl(rng(8,58,GOLD)+'<path d="M8 40h50" stroke="none"/>'+T(32,44,"過去",12,"#B45309"));
  A.t_budushchiy=tl(rng(62,88,GOLD)+T(76,44,"未来",12,"#B45309"));
  A.t_vo_vremya=tl(rng(24,72,"#93C5FD")+'<path d="M48 46l3.5 7 7.5 1-5.5 5 1.5 7.5-7-4-7 4 1.5-7.5-5.5-5 7.5-1z" fill="'+GOLD+'" transform="translate(0 -18)"/>',1);
  A.t_v_to_vremya=svg('<rect x="10" y="30" width="70" height="12" rx="6" fill="#93C5FD"/><rect x="18" y="56" width="70" height="12" rx="6" fill="#F9A8D4"/>'+per(6,14,"#3B82F6",{s:0.45})+per(10,82,"#E11D48",{s:0.0001})+'<path d="M40 22v54M62 22v54" stroke="#94A3B8" stroke-width="2" stroke-dasharray="3 3"/>'+T(30,90,"",8));
  function evt(x){return '<path d="M'+x+' 46l3.5 7 7.5 1-5.5 5 1.5 7.5-7-4-7 4 1.5-7.5-5.5-5 7.5-1z" fill="'+RED+'" stroke="#fff" stroke-width="1.5"/>';}
  A.t_prezhde=tl(rng(8,48,GOLD)+evt(56)+arr(44,40,16,40,BLUE,3),1);
  A.t_posle=tl(rng(48,88,GOLD)+evt(40)+arr(52,40,80,40,BLUE,3),1);
  A.t_srazu=tl(evt(36)+dot(54,GOLD,7)+'<path d="M45 34l-5 10h6l-4 10" stroke="'+GOLD+'" stroke-width="3" fill="none" stroke-linejoin="round"/>',1);
  A.t_poka=tl(rng(14,60,GOLD)+T(36,44,"〜今",11,"#B45309"));
  A.t_zaranee=tl(evt(76)+dot(28,GREEN,8)+CK(28,58,4.5,"#fff")+arr(36,40,68,40,"#94A3B8",2.5,"3 3"),1);
  A.t_postepenno=svg('<path d="M10 84h14v-12h14v-12h14v-12h14v-12h14v-12" stroke="'+BLUE+'" stroke-width="5" fill="none" stroke-linejoin="round"/>'+arr(14,62,72,18,GOLD,3.5));
  function steps(n,lastFlag){var g='<path d="M14 54H82" stroke="#CBD5E1" stroke-width="4"/>';[16,48,80].forEach(function(x,i){var on=i+1===n;g+='<circle cx="'+x+'" cy="54" r="'+(on?15:11)+'" fill="'+(on?GOLD:"#E5E7EB")+'"/>'+T(x,54+(on?7:5),String(i+1),on?20:14,on?INK:"#94A3B8",900);});
    if(lastFlag)g+=flag(80,36,RED);return svg(g+mk([16,48,80][n-1],lastFlag?6:34));}
  A.s_1=steps(1);A.s_2=steps(2);A.s_3=steps(3);A.s_fin=steps(3,1);
  /* ---------- 比べる言葉 ---------- */
  function pile(n,x,c){var g='',p=[[0,0],[-12,0],[12,0],[-6,-11],[6,-11],[0,-22],[-18,-11],[18,-11]];for(var i=0;i<n;i++)g+=ball(x+p[i][0],74+p[i][1],6.5,c);return g;}
  A.c_bolshe=svg(SH+'<ellipse cx="26" cy="66" rx="26" ry="26" fill="'+GOLD+'" opacity=".3"/>'+pile(6,26)+pile(2,72,"#94A3B8")+pill(48,32,24,22,"&gt;",18));
  A.c_menshe=svg(SH+pile(6,26,"#94A3B8")+'<ellipse cx="72" cy="72" rx="18" ry="16" fill="'+GOLD+'" opacity=".3"/>'+pile(2,72)+pill(48,32,24,22,"&lt;",18));
  function stars(n,x,y,c){var g='';for(var i=0;i<n;i++)g+='<path d="M0 -7l2 4.5 5 .5-4 3.5 1.2 5L0 4 -4.2 6.5-3 1.5-7-2l5-.5z" transform="translate('+(x+(i-(n-1)/2)*14)+' '+y+') scale(1.2)" fill="'+(c||GOLD)+'"/>';return g;}
  A.c_luchshe=svg('<rect x="6" y="14" width="84" height="30" rx="8" fill="#FEF3C7" stroke="'+GOLD+'" stroke-width="2.5"/>'+stars(3,48,30)+'<rect x="6" y="54" width="84" height="30" rx="8" fill="#F3F4F6"/>'+stars(1,48,70,"#CBD5E1")+arr(4,62,4,22,GREEN,0.01));
  A.c_khuzhe=svg('<rect x="6" y="14" width="84" height="30" rx="8" fill="#F3F4F6"/>'+stars(3,48,30,"#CBD5E1")+'<rect x="6" y="54" width="84" height="30" rx="8" fill="#FEE2E2" stroke="'+RED+'" stroke-width="2.5"/>'+stars(1,48,70,"#F87171"));
  function dist(nearHi){return svg(SH+per(12,40,"#10B981",{s:0.8})+flag(38,84,nearHi?GOLD:"#CBD5E1")+flag(78,84,nearHi?"#CBD5E1":GOLD)+'<path d="M16 76H'+(nearHi?36:76)+'" stroke="'+BLUE+'" stroke-width="2.5" stroke-dasharray="3 3"/>'+head(nearHi?38:78,76,0,BLUE,0.7));}
  A.c_blizhe=dist(1);A.c_dalshe=dist(0);
  function price(lowHi){return svg('<g transform="rotate(-8 28 46)"><path d="M10 28h30l8 18-8 18H10z" fill="'+(lowHi?GOLD:"#E5E7EB")+'"/><circle cx="40" cy="46" r="3" fill="#fff"/>'+T(24,52,"100",14,INK,900)+'</g><g transform="rotate(8 68 46)"><path d="M50 28h30l8 18-8 18H50z" fill="'+(lowHi?"#E5E7EB":GOLD)+'"/><circle cx="80" cy="46" r="3" fill="#fff"/>'+T(64,52,"500",14,INK,900)+'</g>'+(lowHi?arr(26,72,26,90,GREEN,3.5):arr(66,90,66,72,RED,3.5)));}
  A.c_deshevle=price(1);A.c_dorozhe=price(0);
  A.c_samyy=svg(SH+'<rect x="10" y="56" width="20" height="30" rx="2" fill="#CBD5E1"/><rect x="38" y="24" width="20" height="62" rx="2" fill="'+GOLD+'"/><rect x="66" y="44" width="20" height="42" rx="2" fill="#CBD5E1"/><path d="M38 18l4-10 6 6 6-6 4 10z" fill="'+GOLD+'"/>');
  A.c_slishkom=svg(SH+'<path d="M28 34h40l-5 50H33z" fill="#DBEAFE" opacity=".7" stroke="#93C5FD" stroke-width="2.5"/><path d="M29 38h38l-4.6 46H33.4z" fill="#60A5FA"/><path d="M26 34q-6 10-4 26M70 34q6 10 4 26M48 30q0-10 4-14" stroke="#60A5FA" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="48" cy="33" rx="22" ry="5" fill="#93C5FD"/>');
  function meter(f,c,extra){return svg('<rect x="8" y="40" width="80" height="18" rx="9" fill="#E5E7EB"/><rect x="8" y="40" width="'+Math.max(18,80*f)+'" height="18" rx="9" fill="'+(c||BLUE)+'"/>'+(extra||''));}
  A.m_ochen=meter(0.88,"#F97316",T(48,30,"!!",22,"#F97316",900));
  A.m_dovolno=meter(0.68,BLUE,'<path d="M8 72h80" stroke="#CBD5E1" stroke-width="2"/>');
  A.m_sovsem=meter(1,GREEN,pill(48,24,44,18,"100%",13,"#F9FAFB","#15803D"));
  A.m_pochti=meter(0.86,BLUE,'<rect x="85" y="30" width="4" height="38" fill="'+RED+'"/>'+pill(46,24,40,18,"90%",13));
  A.m_kraine=meter(1,RED,T(48,30,"MAX",16,RED,900)+'<path d="M84 30l6-8M88 36l8-4" stroke="'+RED+'" stroke-width="3" stroke-linecap="round"/>');
  A.m_dostatochno=meter(0.72,GREEN,'<rect x="64" y="32" width="3" height="34" fill="#15803D"/>'+CK(76,76,6));
  A.m_nemnogo=meter(0.22,BLUE,pill(28,24,36,18,"少し",12));
  A.m_primerno=svg('<rect x="8" y="26" width="80" height="44" rx="10" fill="#F9FAFB"/>'+T(48,60,"≈10",30,INK,900)+'<path d="M14 72q34 10 68 0" stroke="#CBD5E1" stroke-width="3" fill="none" stroke-dasharray="4 4"/>');
  A.m_mnogo=svg(SH+[[20,80],[34,80],[48,80],[62,80],[76,80],[27,68],[41,68],[55,68],[69,68],[34,56],[48,56],[62,56],[41,44],[55,44],[48,32]].map(function(p){return ball(p[0],p[1],7);}).join(""));
  A.m_malo=svg(SH+ball(40,80,7)+ball(58,80,7)+'<path d="M10 88h76" stroke="none"/>');
  A.ves=svg(SH+'<circle cx="48" cy="56" r="34" fill="'+GOLD+'" opacity=".25" stroke="'+GOLD+'" stroke-width="3"/>'+[[30,46],[48,40],[66,46],[34,64],[52,60],[68,66],[48,76]].map(function(p){return ball(p[0],p[1],7);}).join("")+T(48,18,"全部",12,"#B45309"));
  A.tselyy=svg(SH+'<ellipse cx="48" cy="66" rx="38" ry="14" fill="#B45309"/><rect x="10" y="48" width="76" height="18" fill="#F59E0B"/><ellipse cx="48" cy="48" rx="38" ry="14" fill="#FCD34D"/><circle cx="34" cy="46" r="3" fill="'+RED+'"/><circle cx="56" cy="44" r="3" fill="'+RED+'"/><circle cx="48" cy="52" r="3" fill="'+RED+'"/>');
  A.polnyy=svg(SH+'<path d="M30 20h36l-5 64H35z" fill="#DBEAFE" opacity=".6" stroke="#93C5FD" stroke-width="2.5"/><path d="M31 24h34l-4.6 60H35.4z" fill="#F97316"/>');
  A.lyuboy=svg(SH+box(6,58,22,22)+ball(48,70,10,"#22C55E")+apple(80,70,1.2)+'<path d="M48 18v6" stroke="none"/>'+arr(48,24,18,50,GOLD,2.5,"3 3")+arr(48,24,48,54,GOLD,2.5,"3 3")+arr(48,24,78,54,GOLD,2.5,"3 3")+'<circle cx="48" cy="18" r="7" fill="#F2C39A"/>');
  A.tolko=svg(SH+'<ellipse cx="48" cy="70" rx="36" ry="12" fill="#F9FAFB"/><ellipse cx="48" cy="68" rx="28" ry="8" fill="#E5E7EB"/>'+apple(48,58,1.6)+pill(80,22,26,22,"1",16,GOLD));
  A.tozhe=svg(SH+per(26,30,"#10B981")+per(70,30,"#E11D48",{long:1})+'<path d="M38 50l6-16" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/><path d="M82 50l6-16" stroke="#F2C39A" stroke-width="4" stroke-linecap="round"/>'+'<path d="M40 30l4-8 4 8z" fill="#FCD34D"/><circle cx="44" cy="22" r="4" fill="#F9A8D4"/><path d="M84 30l4-8 4 8z" fill="#FCD34D"/><circle cx="88" cy="22" r="4" fill="#F9A8D4"/>'+T(48,22,"=",22,BLUE,900));
  A.imenno=svg(SH+[18,48,78].map(function(x,i){return ball(x,64,10,i===1?RED:"#CBD5E1");}).join("")+glow(48,64,15)+arr(48,14,48,48,GOLD,4));
  A.naprimer=svg('<rect x="10" y="10" width="76" height="76" rx="8" fill="#F9FAFB"/>'+[0,1,2].map(function(i){return '<circle cx="24" cy="'+(28+i*20)+'" r="4" fill="#94A3B8"/><rect x="34" y="'+(25+i*20)+'" width="'+(i===1?40:32)+'" height="6" rx="3" fill="'+(i===1?GOLD:"#CBD5E1")+'"/>';}).join("")+pill(70,48,30,16,"例",10,BLUE,"#fff"));
  A.deystvitelno=svg('<circle cx="48" cy="46" r="32" fill="none" stroke="'+RED+'" stroke-width="4"/><circle cx="48" cy="46" r="25" fill="none" stroke="'+RED+'" stroke-width="2"/>'+T(48,54,"本当",20,RED,900)+'<path d="M24 86h48" stroke="none"/>');
  /* ---------- 形容詞 ---------- */
  function rope(longHi){return svg('<rect x="8" y="28" width="80" height="12" rx="6" fill="'+(longHi?GOLD:"#CBD5E1")+'"/><rect x="8" y="60" width="28" height="12" rx="6" fill="'+(longHi?"#CBD5E1":GOLD)+'"/>'+(longHi?'<path d="M8 22h80M8 18v8M88 18v8" stroke="'+BLUE+'" stroke-width="2.5"/>':'<path d="M8 82h28M8 78v8M36 78v8" stroke="'+BLUE+'" stroke-width="2.5"/>'));}
  A.a_dlinnyy=rope(1);A.a_korotkiy=rope(0);
  function road(w){return svg('<rect x="0" y="0" width="96" height="96" fill="#86C06C"/><path d="M'+(48-w)+' 96L'+(48-w/3)+' 30h'+(w*2/3)+'L'+(48+w)+' 96z" fill="#4B5563"/><path d="M48 36v8M48 52v12M48 72v16" stroke="#F3F4F6" stroke-width="2"/><rect x="0" y="0" width="96" height="30" fill="#BAE6FD"/>'+arr(48-w+4,90,48+w-4,90,GOLD,3)+head(48-w+4,90,180,GOLD));}
  A.a_shirokiy=road(44);A.a_uzkiy=road(14);
  A.a_chistyy=svg(SH+'<ellipse cx="48" cy="60" rx="38" ry="18" fill="#F9FAFB"/><ellipse cx="48" cy="58" rx="26" ry="11" fill="#E0F2FE"/><path d="M76 24l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#7DD3FC"/><path d="M22 28l2 4 4 2-4 2-2 4-2-4-4-2 4-2z" fill="#BAE6FD"/>');
  A.a_gryaznyy=svg(SH+'<ellipse cx="48" cy="60" rx="38" ry="18" fill="#F9FAFB"/><ellipse cx="48" cy="58" rx="26" ry="11" fill="#E7E5E4"/><circle cx="36" cy="58" r="6" fill="#92400E" opacity=".7"/><circle cx="56" cy="54" r="4" fill="#92400E" opacity=".6"/><circle cx="60" cy="64" r="5" fill="#78350F" opacity=".7"/><path d="M28 30q4-4 8 0M64 24q4-4 8 0" stroke="#4B5563" stroke-width="2" fill="none"/><circle cx="32" cy="32" r="2" fill="#374151"/><circle cx="68" cy="26" r="2" fill="#374151"/>');
  A.a_vazhnyy=svg(SH+'<rect x="20" y="10" width="50" height="70" rx="4" fill="#F9FAFB"/><path d="M28 24h34M28 34h34M28 44h26" stroke="#CBD5E1" stroke-width="3"/><circle cx="66" cy="64" r="17" fill="'+RED+'"/>'+T(66,72,"!",24,"#fff",900));
  A.a_nuzhno=svg(SH+'<rect x="18" y="12" width="56" height="72" rx="6" fill="#F9FAFB"/><rect x="36" y="6" width="20" height="10" rx="3" fill="#94A3B8"/>'+[0,1,2].map(function(i){return '<rect x="26" y="'+(26+i*18)+'" width="10" height="10" rx="2" fill="none" stroke="#64748B" stroke-width="2"/><rect x="42" y="'+(29+i*18)+'" width="24" height="4" rx="2" fill="#CBD5E1"/>';}).join("")+'<rect x="22" y="40" width="48" height="18" rx="4" fill="none" stroke="'+RED+'" stroke-width="2.5"/>'+T(82,56,"!",26,RED,900));
  A.a_gotov=svg(SH+'<rect x="18" y="38" width="60" height="44" rx="6" fill="#F59E0B"/><rect x="38" y="28" width="20" height="12" rx="3" fill="none" stroke="#B45309" stroke-width="4"/><path d="M18 52h60" stroke="#B45309" stroke-width="3"/><circle cx="74" cy="30" r="14" fill="'+GREEN+'"/>'+CK(74,30,6,"#fff"));
  A.a_svobodnyy=svg(SH+chair(40,84,"#8B5E3C")+'<circle cx="72" cy="30" r="14" fill="'+GREEN+'"/>'+CK(72,30,6,"#fff"));
  A.a_zanyat=svg(SH+chair(40,84,"#8B5E3C")+per(42,40,"#3B82F6")+'<circle cx="76" cy="26" r="13" fill="'+RED+'"/><rect x="69" y="23.5" width="14" height="5" fill="#fff"/>');
  function queue(n){var xs=[20,40,60,80],g='<rect x="2" y="30" width="10" height="56" fill="#94A3B8"/>';xs.forEach(function(x,i){g+=per(x,36,["#64748B","#3B82F6","#F97316","#8B5CF6"][i],{s:0.85,long:i===2});});
    return svg(SH+g+arr(2,20,2,20)+hi(xs[n],36,0.85));}
  A.a_sleduyushchiy=queue(1);A.a_posledniy=queue(3);
  A.a_predydushchiy=svg('<rect x="6" y="26" width="24" height="34" rx="3" fill="'+GOLD+'"/><rect x="36" y="20" width="24" height="46" rx="3" fill="#F9FAFB" stroke="'+BLUE+'" stroke-width="3"/><rect x="66" y="26" width="24" height="34" rx="3" fill="#E5E7EB"/>'+T(18,48,"1",14,INK,900)+T(48,48,"2",16,INK,900)+T(78,48,"3",14,"#94A3B8",900)+arr(44,80,16,80,BLUE,3.5)+pill(48,10,24,14,"今",10,BLUE,"#fff"));
  A.a_izvestnyy=svg('<rect x="0" y="60" width="96" height="36" fill="#7C3AED" opacity=".35"/><path d="M28 0L40 40h16L68 0z" fill="#FEF9C3" opacity=".5"/>'+per(48,26,"#E11D48",{long:1,hair:"#B45309",mood:"happy"})+'<path d="M48 4l2.5 5 5.5.6-4 3.8 1 5.4-5-2.7-5 2.7 1-5.4-4-3.8 5.5-.6z" fill="'+GOLD+'"/>'+[10,26,70,86].map(function(x,i){return shadow(x,82,0.45)+(i%2?'':'<path d="M'+(x+4)+' 72l2-4 2 4-2 4z" fill="#fff"/>');}).join("")+'<path d="M16 66l4-6M80 64l4-6" stroke="#fff" stroke-width="2"/>');
  A.a_populyarnyy=svg(SH+per(48,34,"#3B82F6",{mood:"happy"})+[[18,22],[78,20],[14,52],[84,50],[30,10],[66,8]].map(function(p){return '<path d="M0 3q-6-5-6-9 0-4 3-4 2 0 3 2 1-2 3-2 3 0 3 4 0 4-6 9z" transform="translate('+p[0]+' '+p[1]+') scale(1.1)" fill="#F43F5E"/>';}).join(""));
  function sib(bigHi){return svg(SH+per(32,24,"#3B82F6",{s:1.1})+kid(68,48,"#F97316",{s:0.75})+(bigHi?hi(32,24,1.1):hi(68,48,0.75)));}
  A.a_starshiy=sib(1);A.a_mladshiy=sib(0);
  A.a_prostoy=svg('<circle cx="12" cy="48" r="5" fill="'+GREEN+'"/><circle cx="84" cy="48" r="5" fill="'+RED+'"/><path d="M18 48H78" stroke="'+BLUE+'" stroke-width="4" stroke-linecap="round"/>');
  A.a_slozhnyy=svg('<circle cx="10" cy="48" r="5" fill="'+GREEN+'"/><circle cx="86" cy="48" r="5" fill="'+RED+'"/><path d="M15 48q10-30 20-4t-6 22 20-30 6 40 14-44 -8 30 18-6" stroke="'+BLUE+'" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M82 46l-4-2" stroke="'+BLUE+'" stroke-width="3.5"/>');
  A.a_vozmozhno=svg(SH+'<rect x="26" y="14" width="44" height="72" rx="3" fill="#7C4A2D"/><path d="M30 18h22v68H30z" fill="#FEF3C7"/><path d="M52 18l14 6v58l-14 4z" fill="#A16207"/><circle cx="62" cy="54" r="2" fill="#FCD34D"/>'+per(41,50,"#10B981",{s:0.6})+'<circle cx="80" cy="22" r="12" fill="'+GREEN+'"/>'+CK(80,22,5,"#fff"));
  A.a_nevozmozhno=svg(SH+'<rect x="20" y="12" width="56" height="74" fill="#B45353"/>'+[0,1,2,3,4,5].map(function(r){return '<path d="M20 '+(24+r*12)+'h56" stroke="#7F2D2D" stroke-width="1.5"/>'+[0,1,2].map(function(c){return '<path d="M'+(30+c*18+(r%2)*9)+' '+(12+r*12)+'v12" stroke="#7F2D2D" stroke-width="1.5"/>';}).join("");}).join("")+'<circle cx="78" cy="22" r="13" fill="'+RED+'"/>'+X(78,22,5,"#fff"));
  A.a_odinakovyy=svg(SH+box(10,46,28,28,["#3B82F6","#93C5FD","#1D4ED8"])+box(56,46,28,28,["#3B82F6","#93C5FD","#1D4ED8"])+pill(51,62,20,20,"=",18));
  A.a_pokhozhiy=svg(SH+box(10,46,28,28,["#3B82F6","#93C5FD","#1D4ED8"])+box(58,48,26,26,["#6366F1","#A5B4FC","#4338CA"])+pill(51,62,20,20,"≈",18));
  A.a_raznyy=svg(SH+ball(20,64,12)+box(38,54,20,22,["#3B82F6","#93C5FD","#1D4ED8"])+'<path d="M80 46l14 28H66z" fill="'+GREEN+'"/>');
  A.a_obshchiy=svg(SH+'<ellipse cx="48" cy="60" rx="24" ry="10" fill="#F9FAFB"/><ellipse cx="48" cy="58" rx="16" ry="6" fill="#F59E0B"/>'+per(14,34,"#10B981",{s:0.75})+per(82,34,"#E11D48",{s:0.75,long:1})+per(48,14,"#3B82F6",{s:0.6})+'<path d="M24 60l10 0M72 60l-10 0" stroke="'+GOLD+'" stroke-width="2.5" stroke-dasharray="2 2"/>');
  A.a_otdelnyy=svg(SH+[18,48,78].map(function(x,i){return per(x,26,["#10B981","#3B82F6","#E11D48"][i],{s:0.7,long:i===2})+'<ellipse cx="'+x+'" cy="72" rx="12" ry="5" fill="#F9FAFB"/><circle cx="'+x+'" cy="70" r="4" fill="#F59E0B"/>';}).join("")+'<path d="M33 18v64M63 18v64" stroke="#94A3B8" stroke-width="2.5" stroke-dasharray="4 3"/>');
  A.a_lichnyy=svg(SH+per(34,32,"#10B981")+hi(34,32)+bag(72,70,1.1)+'<g transform="translate(72 34)"><rect x="-9" y="0" width="18" height="14" rx="2" fill="'+GOLD+'"/><path d="M-5 0v-4a5 5 0 0 1 10 0v4" stroke="'+GOLD+'" stroke-width="3" fill="none"/></g>');
  A.a_gosudarstvennyy=svg(SH+'<path d="M10 36l38-20 38 20z" fill="#E5E7EB"/><rect x="12" y="76" width="72" height="8" fill="#E5E7EB"/>'+[18,32,46,60,74].map(function(x){return '<rect x="'+x+'" y="40" width="6" height="36" fill="#F3F4F6"/>';}).join("")+'<rect x="12" y="36" width="72" height="4" fill="#D1D5DB"/><rect x="47" y="2" width="2" height="16" fill="#6B7280"/><path d="M49 2h14v8H49z" fill="#3B82F6"/>');
  A.a_byvshiy=svg(SH+per(26,32,"#9CA3AF",{op:.45})+arr(46,52,64,52,"#94A3B8",3)+per(78,32,"#3B82F6")+'<path d="M8 20h36" stroke="none"/>'+T(26,14,"前",12,"#64748B"));
  A.a_zhivoy=svg(SH+'<path d="M30 70h36l-4 16H34z" fill="#B45353"/><path d="M48 70V34" stroke="#16A34A" stroke-width="4"/><path d="M48 50q-18-2-20-16 16 0 20 16zM48 42q16-4 20-18-16 0-20 18z" fill="#22C55E"/><circle cx="48" cy="28" r="7" fill="#F472B6"/><circle cx="48" cy="28" r="3" fill="#FCD34D"/>');
  A.a_myortvyy=svg(SH+'<path d="M30 70h36l-4 16H34z" fill="#78716C"/><path d="M48 70V46q0-10-10-14" stroke="#A16207" stroke-width="4" fill="none"/><path d="M44 54q-12 4-16 14 10 0 16-14z" fill="#A8A29E"/><path d="M38 32q-6 4-6 10 6-2 6-10z" fill="#78716C"/>');
  A.a_neudobnyy=svg(SH+'<rect x="22" y="52" width="52" height="10" rx="2" fill="#8B5E3C"/><rect x="26" y="62" width="5" height="22" fill="#8B5E3C"/><rect x="65" y="62" width="5" height="22" fill="#8B5E3C"/>'+[28,36,44,52,60,68].map(function(x){return '<path d="M'+(x-3)+' 52l3-10 3 10z" fill="#9CA3AF"/>';}).join("")+per(48,18,"#3B82F6",{s:0.6,mood:"sad"}));
  A.a_glavnyy=svg('<path d="M48 48L16 20M48 48L80 20M48 48L14 78M48 48L82 78" stroke="#CBD5E1" stroke-width="3"/>'+[[16,20],[80,20],[14,78],[82,78]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="8" fill="#94A3B8"/>';}).join("")+'<circle cx="48" cy="48" r="18" fill="'+GOLD+'"/><path d="M38 44l3-9 7 5 7-5 3 9z" fill="#B45309"/>');
  A.a_tsentralnyy=svg('<circle cx="48" cy="48" r="40" fill="#E5E7EB"/><circle cx="48" cy="48" r="26" fill="#CBD5E1"/><circle cx="48" cy="48" r="12" fill="'+GOLD+'"/><path d="M48 8v80M8 48h80" stroke="#94A3B8" stroke-width="1.5" stroke-dasharray="3 3"/>');
  A.a_osobennyy=svg([[14,30],[38,26],[62,30],[86,26],[14,68],[86,68],[38,72],[62,72]].map(function(p){return ball(p[0],p[1],8,"#CBD5E1");}).join("")+'<path d="M48 30l5 11 12 1-9 8 3 12-11-7-11 7 3-12-9-8 12-1z" fill="'+GOLD+'"/>');
  A.a_obychnyy=svg([[16,36],[40,36],[64,36],[16,62],[40,62],[64,62]].map(function(p){return ball(p[0]+8,p[1],10,"#94A3B8");}).join(""));
  A.a_vremennyy=svg(SH+'<path d="M30 12h36M30 84h36" stroke="#8B5E3C" stroke-width="5" stroke-linecap="round"/><path d="M34 14q0 20 14 34-14 14-14 34h28q0-20-14-34 14-14 14-34z" fill="#DBEAFE" stroke="#94A3B8" stroke-width="2"/><path d="M40 28h16l-8 16zM36 80q0-12 12-18 12 6 12 18z" fill="#F59E0B"/>');
  A.a_postoyannyy=svg(T(48,64,"∞",58,BLUE,900));
  A.a_sovremennyy=svg(SH+'<rect x="26" y="8" width="44" height="80" rx="8" fill="#1F2937"/><rect x="30" y="16" width="36" height="62" rx="3" fill="#60A5FA"/><rect x="34" y="22" width="12" height="12" rx="3" fill="#F9FAFB"/><rect x="50" y="22" width="12" height="12" rx="3" fill="#FDE68A"/><rect x="34" y="40" width="12" height="12" rx="3" fill="#86EFAC"/><rect x="50" y="40" width="12" height="12" rx="3" fill="#FCA5A5"/><path d="M76 16l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FBBF24"/>');
  A.a_starinnyy=svg(SH+'<path d="M24 26h48l-4 54H28z" fill="#A16207"/><path d="M24 26h48" stroke="#78350F" stroke-width="4"/><ellipse cx="48" cy="22" rx="14" ry="5" fill="#CA8A04"/><path d="M30 46q18 10 36 0M29 62q19 10 38 0" stroke="#FDE68A" stroke-width="2.5" fill="none"/><path d="M68 34q14 4 10 20t-12 10" stroke="#A16207" stroke-width="4" fill="none"/>');
  A.a_traditsionnyy=A.a_starinnyy;
  /* ---------- 体：部位に色、痛みはギザギザ ---------- */
  function body(part,pain){var h=GOLD,g='<path d="M33 64h13v26h-9zM50 64h13l-4 26h-9z" fill="#1E3A8A"/><path d="M30 38l-12 26 6 3 10-20zM66 38l12 26-6 3-10-20z" fill="#60A5FA"/><circle cx="21" cy="66" r="3.5" fill="#F2C39A"/><circle cx="75" cy="66" r="3.5" fill="#F2C39A"/><path d="M30 38q0-4 6-4h24q6 0 6 4v26H30z" fill="#60A5FA"/><rect x="43" y="27" width="10" height="9" fill="#F2C39A"/><circle cx="48" cy="18" r="12" fill="#F2C39A"/>';
    var H={head:'<circle cx="48" cy="18" r="12"/>',throat:'<rect x="43" y="27" width="10" height="9"/>',belly:'<path d="M31 48h34v16H31z"/>',back:'<path d="M30 38q0-4 6-4h24q6 0 6 4v16H30z"/>',shoulder:'<path d="M30 38q0-4 6-4h5v10H29zM66 38q0-4-6-4h-5v10h12z"/>',skin:'<circle cx="21" cy="66" r="4"/><circle cx="75" cy="66" r="4"/><rect x="43" y="27" width="10" height="9"/><circle cx="48" cy="18" r="12"/>'};
    if(H[part])g+='<g fill="'+h+'" opacity=".9" stroke="#F59E0B" stroke-width="1.5">'+H[part]+'</g>';
    if(part!=="back")g+='<path d="M36 13q12-12 24 0q-12-5-24 0z" fill="#5B3A29"/><circle cx="44" cy="19" r="1.4" fill="#3B2A20"/><circle cx="52" cy="19" r="1.4" fill="#3B2A20"/>'+(pain?'<path d="M44 25q4-3 8 0" stroke="#3B2A20" stroke-width="1.4" fill="none"/>':'');
    else g+='<path d="M36 18q0-12 12-12t12 12q-4-4-12-4t-12 4z" fill="#5B3A29"/><circle cx="48" cy="12" r="9" fill="#5B3A29"/>';
    if(pain){var p=pain;g+='<path d="M'+p[0]+' '+(p[1]-14)+'l4 8 8-4-3 9 9 2-8 5 5 8-9-2-1 9-5-8-6 6 0-9-9 0 6-6-7-6 9-1-1-9z" fill="#FEE2E2" stroke="'+RED+'" stroke-width="2.5" stroke-linejoin="round"/>';}
    return svg(g);}
  A.b_head=body("head");A.b_throat=body("throat");A.b_belly=body("belly");A.b_back=body("back");A.b_shoulder=body("shoulder");A.b_skin=body("skin");
  A.b_pain=body("head",[74,22]);
  A.b_tired=svg(SH+per(40,40,"#64748B",{mood:"tired"})+'<path d="M28 20q-4 4 0 8" stroke="#7DD3FC" stroke-width="2.5" fill="none"/><path d="M52 30q4 6 0 8" stroke="#7DD3FC" stroke-width="2.5" fill="none"/><rect x="66" y="40" width="22" height="40" rx="3" fill="none" stroke="#475569" stroke-width="3"/><rect x="72" y="35" width="10" height="5" rx="1" fill="#475569"/><rect x="69" y="70" width="16" height="7" rx="1" fill="'+RED+'"/>');
  A.b_tired_f=A.b_tired.replace(per(40,40,"#64748B",{mood:"tired"}),per(40,40,"#E11D48",{mood:"tired",long:1,hair:"#B45309"}));
  A.b_fever=svg(SH+per(36,40,"#3B82F6",{mood:"sad",skin:"#F8A58A"})+'<path d="M20 18q-3-5 0-10M30 14q-3-5 0-10M40 18q-3-5 0-10" stroke="#F87171" stroke-width="2.5" fill="none"/><rect x="68" y="12" width="12" height="56" rx="6" fill="#F9FAFB" stroke="#94A3B8" stroke-width="2"/><circle cx="74" cy="72" r="10" fill="'+RED+'"/><rect x="71" y="18" width="6" height="52" rx="3" fill="'+RED+'"/>'+T(74,10,"39°",10,RED,900));
  A.b_sick=svg('<rect x="4" y="54" width="88" height="22" rx="3" fill="#93C5FD"/><rect x="4" y="76" width="6" height="12" fill="#6B7280"/><rect x="86" y="76" width="6" height="12" fill="#6B7280"/><rect x="6" y="44" width="22" height="14" rx="5" fill="#F9FAFB"/><circle cx="20" cy="42" r="10" fill="#F2C39A"/><path d="M11 38q2-8 9-8t9 8z" fill="#5B3A29"/><circle cx="17" cy="43" r="1.2" fill="#3B2A20"/><circle cx="23" cy="43" r="1.2" fill="#3B2A20"/><path d="M17 48q3-2 6 0" stroke="#3B2A20" stroke-width="1.2" fill="none"/><path d="M28 50h60v8H28z" fill="#BFDBFE"/><rect x="12" y="28" width="16" height="7" rx="3" fill="#7DD3FC"/><path d="M48 20h14M55 13v14" stroke="'+BLUE+'" stroke-width="4"/>');
  A.b_injury=svg(SH+'<path d="M8 60q20-14 40-10t40 4v18q-20 2-40-4T8 76z" fill="#F2C39A"/><rect x="38" y="48" width="24" height="26" rx="3" fill="#F9FAFB" transform="rotate(6 50 61)"/><path d="M42 56l16 2M41 62l16 2M40 68l16 2" stroke="#E5E7EB" stroke-width="1.5"/><circle cx="50" cy="61" r="3" fill="#FCA5A5"/><path d="M72 36l3 7 7-3-3 7 7 3-8 2 2 7-6-4-4 6-1-8-8-1 6-4-4-7 8 2z" fill="none" stroke="'+RED+'" stroke-width="2.2"/>');
  A.b_weak=svg(SH+per(36,42,"#64748B",{mood:"tired"})+'<rect x="62" y="38" width="28" height="16" rx="3" fill="none" stroke="#475569" stroke-width="3"/><rect x="90" y="43" width="3" height="6" fill="#475569"/><rect x="65" y="41" width="5" height="10" fill="'+RED+'"/>'+T(76,72,"",8));
  A.b_dizzy=svg(SH+per(48,44,"#3B82F6",{mood:"tired"})+'<path d="M48 22a10 4 0 1 0 1 0" stroke="none"/><ellipse cx="48" cy="20" rx="20" ry="6" fill="none" stroke="#A855F7" stroke-width="3" stroke-dasharray="6 4"/>'+head(68,20,90,"#A855F7",0.6)+'<path d="M30 10l2 4 4 1-4 1-2 4-2-4-4-1 4-1zM68 6l2 4 4 1-4 1-2 4-2-4-4-1 4-1z" fill="'+GOLD+'"/>');
  A.h_good=svg(SH+'<path d="M48 82Q14 58 14 36q0-16 16-16 10 0 18 10 8-10 18-10 16 0 16 16 0 22-34 46z" fill="#F43F5E"/>'+arr(80,70,80,40,GREEN,4)+'<path d="M18 74q6-12 16-10-4 10-16 10z" fill="#22C55E"/>');
  A.h_bad=svg(SH+'<path d="M48 82Q14 58 14 36q0-16 16-16 10 0 18 10 8-10 18-10 16 0 16 16 0 22-34 46z" fill="#9CA3AF"/>'+arr(80,40,80,72,RED,4)+'<path d="M36 40l24 20M60 40L36 60" stroke="#fff" stroke-width="4.5" stroke-linecap="round"/>');
  A.h_lose=svg(SH+'<rect x="18" y="56" width="60" height="28" rx="6" fill="#E5E7EB"/><rect x="32" y="62" width="32" height="12" rx="3" fill="#A7F3D0"/>'+T(48,72,"−3kg",10,"#065F46",900)+per(48,22,"#3B82F6",{s:0.7,mood:"happy"})+arr(84,30,84,56,GREEN,3.5));
  /* ---------- 時間：曜日・前後の日 ---------- */
  var DOW=["月","火","水","木","金","土","日"];
  function week(on){var g='<rect x="2" y="22" width="92" height="52" rx="8" fill="#F9FAFB"/>';DOW.forEach(function(d,i){var x=5+i*12.9,o=on.indexOf(i)>=0;g+='<rect x="'+x+'" y="30" width="11.5" height="36" rx="3" fill="'+(o?(i>=5?"#F87171":GOLD):"#E5E7EB")+'"/>'+T(x+5.75,53,d,9.5,o?INK:"#94A3B8",o?900:600);});return svg(g);}
  A.d_mon=week([0]);A.d_tue=week([1]);A.d_wed=week([2]);A.d_thu=week([3]);A.d_fri=week([4]);A.d_sat=week([5]);A.d_sun=week([6]);
  A.d_budni=week([0,1,2,3,4]);A.d_weekend=week([5,6]);
  function days(t){var lab=["","","今日","",""],g='';[-2,-1,0,1,2].forEach(function(o,i){var x=4+i*18.4,on=o===t,tod=o===0;g+='<rect x="'+x+'" y="'+(on?24:32)+'" width="16" height="'+(on?38:28)+'" rx="3" fill="'+(on?GOLD:tod?"#DBEAFE":"#E5E7EB")+'"/><rect x="'+x+'" y="'+(on?24:32)+'" width="16" height="6" rx="2" fill="'+(on?"#B45309":tod?BLUE:"#94A3B8")+'"/>';});
    g+=pill(4+2*18.4+8,80,30,16,"今日",10,BLUE,"#fff");
    if(t!==0){var xa=4+2*18.4+8,xb=4+(t+2)*18.4+8;g+=parr("M"+xa+" 18Q"+((xa+xb)/2)+" 4 "+xb+" 18",xb,20,t>0?60:120,BLUE,2.5);}
    return svg(g);}
  A.d_today=days(0);A.d_yesterday=days(-1);A.d_tomorrow=days(1);A.d_dby=days(-2);A.d_dat=days(2);
  A.t_vek=svg('<rect x="6" y="40" width="84" height="16" rx="8" fill="#E5E7EB"/><rect x="6" y="40" width="84" height="16" rx="8" fill="none" stroke="'+GOLD+'" stroke-width="3"/>'+pill(48,26,50,20,"100年",14));
  A.t_seredina=svg('<rect x="6" y="40" width="84" height="16" rx="8" fill="#E5E7EB"/><rect x="36" y="40" width="24" height="16" fill="'+GOLD+'"/>'+mk(48,38)+'<path d="M6 64v6M90 64v6" stroke="#94A3B8" stroke-width="2"/>');
  /* ---------- 動詞 ---------- */
  A.v_sprashivat=svg(SH+per(28,42,"#10B981")+qb(66,24,16));
  A.v_otvechat=svg(SH+per(28,42,"#3B82F6")+bubble(66,24,40,32,T(66,34,"!",26,GREEN,900)));
  A.v_nachinat=svg(SH+'<path d="M24 84V20" stroke="#6B7280" stroke-width="3"/><path d="M24 20h30l-6 8 6 8H24z" fill="'+GREEN+'"/>'+arr(30,70,86,70,BLUE,4)+T(48,58,"",8));
  A.v_konchat=svg(SH+arr(6,70,62,70,BLUE,4)+'<path d="M70 84V20" stroke="#6B7280" stroke-width="3"/>'+[0,1,2,3].map(function(r){return [0,1,2].map(function(c){return '<rect x="'+(72+c*7)+'" y="'+(20+r*5)+'" width="7" height="5" fill="'+((r+c)%2?"#1F2937":"#F9FAFB")+'"/>';}).join("");}).join(""));
  A.v_pokazat=svg(SH+'<rect x="40" y="10" width="52" height="40" rx="3" fill="#F9FAFB" stroke="#94A3B8" stroke-width="2"/><path d="M48 40l10-12 8 8 10-16 10 20" stroke="'+BLUE+'" stroke-width="3" fill="none"/>'+per(20,44,"#10B981")+'<path d="M28 64l20-22" stroke="#8B5E3C" stroke-width="2.5"/>');
  A.v_brat=svg(SH+'<rect x="14" y="62" width="68" height="6" fill="#B7866A"/>'+apple(52,52,1.2)+'<path d="M52 12v22" stroke="#F2C39A" stroke-width="8" stroke-linecap="round"/><path d="M44 36q8 6 16 0" stroke="#F2C39A" stroke-width="6" fill="none" stroke-linecap="round"/>'+arr(76,52,76,24,BLUE,3));
  A.v_vernut=svg(SH+per(18,40,"#10B981",{s:0.85})+per(78,40,"#3B82F6",{s:0.85})+books(48,40,0.8)+parr("M66 66Q48 80 30 66",28,64,-140,BLUE,3.5));
  A.v_izmenit=svg(SH+ball(22,56,12)+parr("M38 52Q48 40 58 52",60,55,50,BLUE,3.5)+box(62,44,24,24,["#3B82F6","#93C5FD","#1D4ED8"]));
  A.v_reshit=svg(SH+per(26,44,"#10B981")+'<rect x="48" y="12" width="44" height="34" rx="6" fill="#F9FAFB"/>'+T(70,34,"2+2=4",10,INK,900)+'<circle cx="80" cy="60" r="11" fill="'+GREEN+'"/>'+CK(80,60,5,"#fff"));
  A.v_dumat=svg(SH+per(30,46,"#10B981")+'<circle cx="44" cy="28" r="3" fill="#F9FAFB"/><circle cx="52" cy="20" r="4.5" fill="#F9FAFB"/><ellipse cx="72" cy="16" rx="20" ry="13" fill="#F9FAFB"/>'+T(72,22,"…",18,"#64748B"));
  A.v_vspomnit=svg(SH+per(30,46,"#10B981",{mood:"happy"})+'<circle cx="44" cy="28" r="3" fill="#F9FAFB"/><circle cx="52" cy="20" r="4.5" fill="#F9FAFB"/><ellipse cx="72" cy="16" rx="20" ry="13" fill="#F9FAFB"/>'+house(72,14,0.55,"#FDE68A")+'<path d="M58 10a14 10 0 0 1 4-4" stroke="none"/>');
  A.v_zabyt=svg(SH+per(30,46,"#10B981",{mood:"sad"})+'<circle cx="44" cy="28" r="3" fill="#F9FAFB"/><circle cx="52" cy="20" r="4.5" fill="#F9FAFB"/><ellipse cx="72" cy="16" rx="20" ry="13" fill="#F9FAFB" stroke="#CBD5E1" stroke-dasharray="3 3"/>'+T(72,22,"?",16,"#94A3B8",900));
  A.v_zhdat=svg(SH+per(30,40,"#10B981")+clock(72,30,16,10,10)+'<path d="M60 60h24" stroke="#94A3B8" stroke-width="3" stroke-dasharray="2 4" stroke-linecap="round"/>');
  A.v_vstrechat=svg(SH+per(26,36,"#10B981")+per(70,36,"#E11D48",{long:1,mood:"happy"})+'<path d="M36 58l12-6 12 6" stroke="#F2C39A" stroke-width="4.5" fill="none" stroke-linecap="round"/>');
  /* ---------- 代名詞・名詞の変化：〜に（渡す）／〜を（見る）／〜と（一緒に） ---------- */
  function tgt(w,x){return w==="me"?per(x,34,"#10B981")+'<path d="M'+(x-32)+' 4h20v10h-8l-4 4v-4h-8z" fill="#F9FAFB"/><path d="M'+(x-29)+' 9h14" stroke="#9CA3AF" stroke-width="2"/>':w==="you"?per(x,34,"#3B82F6",{tie:1,hair:"#9CA3AF"}):w==="kid"?kid(x,50,"#F97316",{mood:"happy"}):w==="wife"?per(x,34,"#E11D48",{long:1,hair:"#B45309"}):per(x,34,"#64748B",{tie:1})+'<rect x="'+(x+6)+'" y="56" width="12" height="9" rx="1.5" fill="#7C4A2D"/>';}
  function ty(w){return w==="kid"?50:34;}
  function casef(w,k){var g=SH,ys=ty(w),sc=w==="kid"?0.7:1;
    if(k==="dat")g+=per(16,34,"#9CA3AF",{s:0.9})+gift(42,64,0.8)+arr(30,46,58,46,BLUE,3)+tgt(w,76)+hi(76,ys,sc);
    else if(k==="acc")g+=per(16,34,"#9CA3AF",{s:0.9})+'<ellipse cx="22" cy="30" rx="5" ry="3.5" fill="#fff" stroke="#475569" stroke-width="1.5"/><circle cx="23" cy="30" r="1.8" fill="#1F2937"/>'+arr(30,32,62,ys,BLUE,2.5,"4 3")+tgt(w,76)+hi(76,ys,sc);
    else g+=per(28,34,"#9CA3AF",{s:0.9})+tgt(w,64)+'<path d="M36 60q'+(w==="kid"?'8 6 18 4':'10 6 18 0')+'" stroke="#F2C39A" stroke-width="5" fill="none" stroke-linecap="round"/>'+hi(64,ys,sc);
    return svg(g);}
  ["me","you","kid","wife","col"].forEach(function(w){["dat","acc","with"].forEach(function(k){A["cf_"+w+"_"+k]=casef(w,k);});});
})(P67_ART);
