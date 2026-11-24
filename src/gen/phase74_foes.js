/* ===== Phase74 道ごとの敵・ボス・物語の出来事 =====
   P74_FOES[道のid] = 8章ぶん。各章 {f:[[名前, 絵],[名前, 絵]], b:{n:ボス名, t:ひとこと, a:絵}}。
   テーマ（敵）は章の中で f[0] と f[1] を交互に使い、章の最後のボスは b。
   絵の書き方：
     "m:種類:色"   いままでのモンスター（種類 0〜7）
     "b:番号"      いままでのボスの絵（0〜7）
     "sea:種類:色" 海の生きもの（kraken / crab / jelly / shark / serpent）
     "ev:種類"     出来事のアイコン（river / pass / storm / road / boulder / crowd / scroll / moon / star / yurt / snow / komuz / sheep / camera / fire / whirl）
     "an:種類:色"  動物（wolf / fox / cat / hawk / owl / gull / horse）
     "npc:名前"    P74_NPC の人物
     {…}           人物の部品をそのまま（rival:1 で敵らしい顔、mask / eyepatch / visor も使える）
   hist の道（物語・歴史）は「たたかい」ではなく「出来事」を順にたどる（P.ev=1）。
   実在の人物の道の出来事は、場面の解説（資料で確かめた内容）に書かれていることだけを使う。 ===== */

/* ---------- 海の生きもの ---------- */
function p74Sea(kind,c){
  c=c||"#7A5AA8";var d=p74Shade(c,-.3),l=p74Shade(c,.45),s='<ellipse cx="60" cy="150" rx="34" ry="5" fill="#000" opacity=".2"/>';
  if(kind==="kraken"){
    [[22,150,8,118],[40,152,30,124],[80,152,90,124],[98,150,112,118]].forEach(function(t){s+='<path d="M'+(t[0]+14)+' 112Q'+t[2]+' '+t[3]+' '+t[0]+' 146q8 4 12-4q-4-14 '+(t[0]<60?6:-6)+'-26z" fill="'+c+'" '+P74_OUT+'/>';});
    s+='<path d="M24 112q-4-64 36-64t36 64q-36 10-72 0z" fill="'+c+'" '+P74_OUT+'/><circle cx="42" cy="72" r="5" fill="'+l+'"/><circle cx="76" cy="66" r="4" fill="'+l+'"/>'+p74Eyes(60,94,24,6,true)+p74Mouth(60,108,8,1);
  }else if(kind==="crab"){
    s+='<path d="M30 132l-12 12M38 136l-8 12M90 132l12 12M82 136l8 12" stroke="'+d+'" stroke-width="4" stroke-linecap="round"/>';
    s+='<path d="M28 110q-16-10-14-30q10 4 14 12q4-10 12-10q2 16-12 28z" fill="'+c+'" '+P74_OUT+'/><path d="M92 110q16-10 14-30q-10 4-14 12q-4-10-12-10q-2 16 12 28z" fill="'+c+'" '+P74_OUT+'/>';
    s+='<ellipse cx="60" cy="120" rx="32" ry="20" fill="'+c+'" '+P74_OUT+'/><path d="M50 102V86M70 102V86" stroke="'+d+'" stroke-width="3"/><circle cx="50" cy="84" r="6" fill="#fff" '+P74_OUT+'/><circle cx="70" cy="84" r="6" fill="#fff" '+P74_OUT+'/><circle cx="51" cy="85" r="2.6" fill="#2B2233"/><circle cx="69" cy="85" r="2.6" fill="#2B2233"/>'+p74Mouth(60,124,8,1);
  }else if(kind==="jelly"){
    s+='<path d="M38 112q-4 20 4 36M50 114q4 18-2 34M62 114q-4 18 2 34M74 112q6 20-2 36M84 110q4 16 0 30" stroke="'+d+'" stroke-width="3" fill="none" stroke-linecap="round" opacity=".8"/>';
    s+='<path d="M24 112q0-50 36-50t36 50q-8 6-12 0q-6 6-12 0q-6 6-12 0q-6 6-12 0q-6 6-12 0q-6 6-12 0z" fill="'+c+'" opacity=".85" '+P74_OUT+'/><path d="M40 80q10-10 24-8" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round" opacity=".7"/>'+p74Eyes(60,94,20,5,false)+p74Mouth(60,104,6,0);
  }else if(kind==="shark"){
    s+='<path d="M8 104q30-34 76-20l24-16-6 26 8 22-24-10q-44 18-78-2z" fill="'+c+'" '+P74_OUT+'/><path d="M14 108q36 14 74 0" fill="'+l+'" opacity=".6"/><path d="M52 82l8-22 12 22z" fill="'+c+'" '+P74_OUT+'/>';
    s+='<path d="M14 110l6 4 4-4 4 4 4-4 4 4 4-4" stroke="#fff" stroke-width="2" fill="none"/><path d="M28 98l8-2" stroke="#2B2233" stroke-width="2.6" stroke-linecap="round"/><circle cx="32" cy="102" r="3" fill="#2B2233"/>';
    s+='<path d="M0 132q20-10 40 0t40 0 40 0v18H0z" fill="#4F8FD8" opacity=".55"/>';
  }else{ /* serpent：海の大へび */
    s+='<path d="M0 134q20-10 40 0t40 0 40 0v16H0z" fill="#4F8FD8" opacity=".55"/>';
    s+='<path d="M14 136q4-26 22-26t18 26M62 136q4-30 24-36" stroke="'+c+'" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M14 136q4-26 22-26t18 26" stroke="'+l+'" stroke-width="4" fill="none" stroke-dasharray="3 7" stroke-linecap="round"/>';
    s+='<path d="M76 104q2-30 24-30q14 4 10 20l-8 2 8 6q-10 12-34 2z" fill="'+c+'" '+P74_OUT+'/><path d="M82 76l-6-14 14 10zM98 72l2-14 8 14z" fill="'+d+'" '+P74_OUT+'/>'+p74Eyes(94,86,12,4,true);
  }
  return s;
}
/* ---------- 出来事のアイコン ---------- */
function p74Ev(kind){
  var s='',O=P74_OUT;
  var mt=function(snow){return '<path d="M4 120l30-40 18 18 24-34 40 56z" fill="#9FB7C9" '+O+'/>'+(snow?'<path d="M64 74l12-10 10 14-8-2-6 6-4-4z" fill="#fff"/>':'');};
  if(kind==="river"){s+=mt(1)+'<path d="M0 118h120v34H0z" fill="#8DBF6A"/><path d="M0 124q30-8 60 0t60 0v18q-30 8-60 0t-60 0z" fill="#4F8FD8" '+O+'/><path d="M14 132q10-4 20 0M64 134q10-4 20 0" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round"/><circle cx="96" cy="148" r="5" fill="#9AA4AE" '+O+'/>';}
  else if(kind==="pass"){s+='<path d="M0 140l34-80 26 30 18-24 42 74z" fill="#8C9AA8" '+O+'/><path d="M24 84l10-24 10 12-6 2-4-4-4 8zM70 72l8-6 8 10-6-1z" fill="#fff"/><path d="M56 140q-10-14 6-24t-2-24" stroke="#E8D5A8" stroke-width="5" fill="none" stroke-linecap="round"/>';}
  else if(kind==="storm"){s+='<path d="M24 80q-14-2-12-16t18-12q4-18 26-16q20-2 26 16q18-2 22 14t-14 14z" fill="#5E6E8C" '+O+'/><path d="M58 82l-12 26h12l-8 26 22-34H60l10-18z" fill="#FFD34D" '+O+'/><path d="M30 92l-6 14M90 92l-6 14M40 104l-4 10M98 104l-4 10" stroke="#4F8FD8" stroke-width="3" stroke-linecap="round"/>';}
  else if(kind==="road"){s+=mt(1)+'<path d="M0 116h120v36H0z" fill="#8DBF6A"/><path d="M46 152q4-20 18-22t6-14h-6q4 8-8 12t-26 24z" fill="#E8D5A8" '+O+'/>';}
  else if(kind==="boulder"){s+='<ellipse cx="60" cy="150" rx="44" ry="5" fill="#000" opacity=".2"/><path d="M14 148q-6-40 18-62q20-18 46-10q26 10 28 40q2 20-6 32z" fill="#9A8C7E" '+O+'/><path d="M40 96l10 14M74 92l-6 18M54 126l18-6" stroke="#6E6258" stroke-width="3" stroke-linecap="round"/>';}
  else if(kind==="crowd"){[[22,"#6B8E4E"],[98,"#2C5D8F"],[42,"#B3202B"],[78,"#C7823E"],[60,"#5E4A7E"]].forEach(function(p,i){var y=i<2?104:(i<4?112:120);s+='<path d="M'+(p[0]-16)+' '+(y+40)+'q0-26 16-26t16 26z" fill="'+p[1]+'" '+O+'/><circle cx="'+p[0]+'" cy="'+(y+4)+'" r="11" fill="#F3C9A0" '+O+'/><path d="M'+(p[0]-11)+' '+(y+1)+'q11-16 22 0z" fill="#FBF8F0" '+O+'/>';});}
  else if(kind==="scroll"){s+='<path d="M26 56h68v84H26z" fill="#F6EBD0" '+O+'/><rect x="20" y="48" width="80" height="10" rx="5" fill="#B5793B" '+O+'/><rect x="20" y="136" width="80" height="10" rx="5" fill="#B5793B" '+O+'/><path d="M36 74h48M36 88h40M36 102h48M36 116h30" stroke="#8A7A5A" stroke-width="3" stroke-linecap="round"/>';}
  else if(kind==="moon"){s+='<rect x="6" y="40" width="108" height="108" rx="20" fill="#2E3A5C"/><path d="M78 60a30 30 0 1 0 14 48a24 24 0 1 1-14-48z" fill="#F6F1E1"/><circle cx="30" cy="62" r="2" fill="#fff"/><circle cx="44" cy="126" r="1.6" fill="#fff"/><circle cx="96" cy="128" r="2" fill="#fff"/>';}
  else if(kind==="star"){s+='<circle cx="60" cy="96" r="44" fill="#FFD34D" opacity=".25"/><path d="M60 52l9 34 34 10-34 10-9 34-9-34-34-10 34-10z" fill="#FFD34D" '+O+'/><path d="M98 54l3 8 8 3-8 3-3 8-3-8-8-3 8-3zM22 128l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#FFD34D"/>';}
  else if(kind==="yurt"){s+='<ellipse cx="60" cy="150" rx="46" ry="5" fill="#000" opacity=".18"/><path d="M16 148v-34q44-30 88 0v34z" fill="#F4EBD8" '+O+'/><path d="M16 114q44-50 88 0" fill="#E8DCC0" '+O+'/><path d="M22 124h76" stroke="#B3202B" stroke-width="5"/><path d="M50 148v-22h20v22" fill="#8A5A2B" '+O+'/><path d="M56 70h8l-2-8h-4z" fill="#8A5A2B"/>';}
  else if(kind==="snow"){s+='<rect x="6" y="40" width="108" height="108" rx="20" fill="#CFE3F2"/><path d="M6 128q54-14 108 0v20H6z" fill="#fff"/>';[[36,70,10],[80,62,13],[60,104,9],[96,104,7],[24,108,6]].forEach(function(f){var x=f[0],y=f[1],r=f[2];s+='<path d="M'+(x-r)+' '+y+'h'+(2*r)+'M'+x+' '+(y-r)+'v'+(2*r)+'M'+(x-r*.7)+' '+(y-r*.7)+'l'+(1.4*r)+' '+(1.4*r)+'M'+(x+r*.7)+' '+(y-r*.7)+'l'+(-1.4*r)+' '+(1.4*r)+'" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M'+(x-r)+' '+y+'h'+(2*r)+'M'+x+' '+(y-r)+'v'+(2*r)+'" stroke="#7FA8C9" stroke-width="1"/>';});}
  else if(kind==="komuz"){s+='<ellipse cx="60" cy="150" rx="24" ry="4" fill="#000" opacity=".18"/><path d="M60 102V30" stroke="#8A5A2B" stroke-width="10" stroke-linecap="round"/><path d="M52 34h-8M52 44h-8M68 34h8" stroke="#5A3A1E" stroke-width="4" stroke-linecap="round"/><path d="M60 96q-26 2-24 30q4 22 24 22t24-22q2-28-24-30z" fill="#B5793B" '+O+'/><path d="M56 146V34M60 146V34M64 146V34" stroke="#F6F1E1" stroke-width="1.2"/><circle cx="60" cy="122" r="5" fill="#5A3A1E"/>';}
  else if(kind==="sheep"){s+='<ellipse cx="60" cy="150" rx="34" ry="5" fill="#000" opacity=".18"/><path d="M40 130v18M80 130v18" stroke="#2B2233" stroke-width="6" stroke-linecap="round"/>';var cl=[[34,110],[46,96],[62,92],[78,98],[88,112],[76,126],[58,130],[42,126]];cl.forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="14" fill="#FBF8F0" '+O+'/>';});s+='<ellipse cx="60" cy="112" rx="28" ry="18" fill="#FBF8F0"/><ellipse cx="94" cy="102" rx="12" ry="14" fill="#5A4A3E" '+O+'/><circle cx="98" cy="100" r="2" fill="#fff"/>';}
  else if(kind==="camera"){s+='<path d="M40 150l20-40 20 40M60 110v40" stroke="#6E4A22" stroke-width="4" stroke-linecap="round"/><rect x="34" y="70" width="52" height="40" rx="6" fill="#4A3A2A" '+O+'/><circle cx="60" cy="90" r="12" fill="#2B2233" '+O+'/><circle cx="56" cy="86" r="3" fill="#fff" opacity=".6"/><rect x="40" y="62" width="14" height="8" fill="#8A6A4A" '+O+'/>';}
  else if(kind==="fire"){s+='<path d="M30 146l60-14M30 132l60 14" stroke="#6E4A22" stroke-width="8" stroke-linecap="round"/><path d="M60 138q-30-14-10-50q4 16 12 16q-4-24 14-40q0 30 12 40q8 26-28 34z" fill="#F2A541" '+O+'/><path d="M60 136q-12-10 0-30q12 14 0 30z" fill="#FFE36B"/>';}
  else if(kind==="whirl"){s+='<ellipse cx="60" cy="110" rx="54" ry="34" fill="#1F6E8C" '+O+'/><path d="M60 110m-40 0a40 24 0 1 1 80 0a30 18 0 1 1-60 0a20 12 0 1 1 40 0a10 6 0 1 1-20 0" stroke="#BFE3F2" stroke-width="3" fill="none"/>';}
  return s;
}
/* 絵の書き方（上の説明）→ svg の中身 */
function p74Art(a){
  if(!a)return "";
  if(typeof a==="object")return p74Person(a);
  var q=String(a).split(":");
  if(q[0]==="m")return p74Monster(0,0,+q[1],q[2]);
  if(q[0]==="b")return p74Boss(+q[1]);
  if(q[0]==="sea")return p74Sea(q[1],q[2]);
  if(q[0]==="ev")return p74Ev(q[1]);
  if(q[0]==="an")return p74Animal(q[1],q[2]);
  if(q[0]==="npc")return p74Person(P74_NPC[q[1]]||{});
  return "";
}

/* ---------- 敵として出てくる人物（すべてオリジナル。実在の国や人々を表すものではない） ---------- */
(function(){var R=function(o){o.rival=1;return o;},N=P74_NPC;
  /* 剣の道：黒騎士団 */
  N.bandit=R({hand:"stick",off:"none",head:"bandana",headc:"#5A3A22",body:{type:"tunic",c:"#6E5A4A",apron:"#4A3A2A"},hair:"#2B2233",mask:"#2B2233"});
  N.grom=R({hand:"bigsword",off:"none",head:"leathercap",body:{type:"tunic",c:"#7A3A2A",apron:"#4A3A2A"},beard:"#C0392B",hair:"#C0392B",scar:1});
  N.bk=R({hand:"sword",off:"roundshield",head:"helmet",headc:"#3A3F58",body:{type:"armor",c:"#3A3F58",t:"#B3202B"},hair:"#2B2233"});
  N.bkarcher=R({hand:"none",off:"quiver",head:"hood",headc:"#3A3F58",body:{type:"tunic",c:"#3A3F58",apron:"#2B2233"},hair:"#2B2233"});
  N.voron=R({hand:"sword",off:"none",head:"hood",headc:"#2B2233",body:{type:"coat",c:"#2B2233",t:"#8C93A8"},hair:"#2B2233",cape:"#2B2233"});
  N.twins=R({hand:"lightsword",off:"kiteshield",head:"plume",headc:"#8C93A8",body:{type:"armor",c:"#8C93A8",t:"#3A3F58"},hair:"#E5B53B"});
  N.zheleza={hand:"bigsword",off:"kiteshield",head:"helmet",headc:"#5A5A6A",body:{type:"armor",c:"#5A5A6A",t:"#B3202B"},visor:"#5A5A6A",longhair:1,hair:"#C9D3DD",cape:"#7A1F2B"};
  N.nochi={hand:"bigsword",off:"kiteshield",head:"helmet",headc:"#2B2233",body:{type:"armor",c:"#2B2233",t:"#9A6BD6",emblem:1},visor:"#2B2233",eyec:"#C9A8FF",cape:"#3A2E5C",aura:"#3A2E5C"};
  N.nochi2={hand:"none",off:"none",head:"none",body:{type:"armor",c:"#5A5A6A",t:"#9A6BD6"},hair:"#C9D3DD",beard:"#C9D3DD",cape:"#3A2E5C"};
  /* 魔法の道：灰の魔導士 */
  N.ashapp=R({hand:"staff",off:"none",head:"hood",headc:"#6E6E78",body:{type:"robe",c:"#6E6E78",t:"#2B2233"},hair:"#2B2233"});
  N.zvezda=R({hand:"crystal",off:"book",head:"wizard",headc:"#2C5D8F",body:{type:"robe",c:"#2C5D8F",t:"#E5B53B"},hair:"#E5B53B"});
  N.zvezda2=R({hand:"crystal",off:"book",head:"wizard",headc:"#4A4A55",body:{type:"robe",c:"#4A4A55",t:"#9A9AA8"},hair:"#9A9AA8",aura:"#6E6E78"});
  N.zvezda3={hand:"crystal",off:"book",head:"wizard",headc:"#2C5D8F",body:{type:"robe",c:"#2C5D8F",t:"#E5B53B"},hair:"#E5B53B"};
  N.ashknight={hand:"sword",off:"roundshield",head:"helmet",headc:"#6E6E78",body:{type:"armor",c:"#8C8C96",t:"#4A4A55"},visor:"#6E6E78",eyec:"#FFD34D"};
  N.towerguard=R({hand:"bigstaff",off:"none",head:"starhat",headc:"#3A2E5C",body:{type:"robe",c:"#3A2E5C",t:"#C9D3DD"},hair:"#2B2233"});
  N.pepel=R({hand:"bigstaff",off:"orb",head:"sagehat",headc:"#4A4A55",body:{type:"robe",c:"#4A4A55",t:"#9A9AA8"},beard:"#C9C9D3",hair:"#C9C9D3",aura:"#6E6E78",cape:"#2B2233"});
  N.pepel2={hand:"staff",off:"none",head:"sagehat",headc:"#7A5A3A",body:{type:"robe",c:"#7A5A3A",t:"#E8D5A8"},beard:"#F6F7FA",hair:"#F6F7FA"};
  /* 王の道：金の男爵と影の宰相 */
  N.taxman=R({hand:"none",off:"scroll",head:"tricorn",headc:"#5A4A3E",body:{type:"coat",c:"#5A4A3E",t:"#C99A2E"},hair:"#2B2233",glasses:1});
  N.landlord=R({hand:"key",off:"none",head:"none",body:{type:"coat",c:"#7A5A2A",t:"#E5B53B"},beard:"#5A3A22",hair:"#5A3A22"});
  N.roadchief=R({hand:"cutlass",off:"none",head:"leathercap",body:{type:"tunic",c:"#4A5A3A",apron:"#2B2233"},beard:"#2B2233",hair:"#2B2233",eyepatch:1});
  N.guild=R({hand:"none",off:"map",head:"tricorn",headc:"#B8860B",body:{type:"coat",c:"#B8860B",t:"#7A1F2B"},beard:"#2B2233",hair:"#2B2233"});
  N.baronsol=R({hand:"sword",off:"kiteshield",head:"helmet",headc:"#B8860B",body:{type:"armor",c:"#C99A2E",t:"#5A3A22"},hair:"#5A3A22"});
  N.baroncap=R({hand:"bigsword",off:"kiteshield",head:"plume",headc:"#B8860B",body:{type:"armor",c:"#C99A2E",t:"#7A1F2B"},beard:"#5A3A22",hair:"#5A3A22",cape:"#7A1F2B"});
  N.zoloto=R({hand:"scepter",off:"none",head:"circlet",body:{type:"royal",c:"#C99A2E",t:"#7A1F2B"},beard:"#E5B53B",hair:"#E5B53B",cape:"#7A1F2B"});
  N.zoloto2={hand:"none",off:"scroll",head:"circlet",body:{type:"royal",c:"#C99A2E",t:"#7A1F2B"},beard:"#E5B53B",hair:"#E5B53B"};
  N.spy=R({hand:"none",off:"lantern",head:"hood",headc:"#2B2233",body:{type:"tunic",c:"#2B2233",apron:"#3A3F58"},mask:"#3A3F58"});
  N.shadowsol={hand:"sword",off:"none",head:"hood",headc:"#3A2E5C",body:{type:"armor",c:"#3A2E5C",t:"#2B2233"},visor:"#3A2E5C",eyec:"#C9A8FF"};
  N.teni=R({hand:"none",off:"book",head:"sagehat",headc:"#2B2233",body:{type:"robe",c:"#2B2233",t:"#9A6BD6"},hair:"#8A8A8A",beard:"#8A8A8A",aura:"#3A2E5C"});
  /* 武士の道：嵐堂家（架空の家） */
  N.nobushi=R({hand:"katana",off:"none",head:"bandana",headc:"#5A5A5A",body:{type:"tunic",c:"#5A4A3E",apron:"#3A2A1E"},hair:"#2B2233",beard:"#2B2233"});
  N.gonta=R({hand:"bigsword",off:"none",head:"hachigane",body:{type:"tunic",c:"#4A3A2A",apron:"#2B2233"},hair:"#2B2233",beard:"#2B2233",eyepatch:1});
  N.ashigaru=R({hand:"bamboo",off:"none",head:"jingasa",headc:"#3A4A6A",body:{type:"samurai",c:"#3A4A6A",t:"#C9D3DD",under:"#2B2233"},hair:"#2B2233"});
  N.ashitaisho=R({hand:"katana",off:"none",head:"kabuto",headc:"#3A4A6A",body:{type:"samurai",c:"#3A4A6A",t:"#E5B53B",under:"#2B2233"},hair:"#2B2233",beard:"#2B2233"});
  N.kiba=R({hand:"katana",off:"none",head:"kabuto",headc:"#2B2233",body:{type:"samurai",c:"#2B3A5A",t:"#C99A2E",under:"#7A1F2B"},hair:"#2B2233"});
  N.okuma=R({hand:"bigsword",off:"none",head:"greatkabuto",headc:"#5A3A22",body:{type:"samurai",c:"#5A3A22",t:"#C99A2E",under:"#2B2233"},beard:"#2B2233",hair:"#2B2233"});
  N.eshinobi=R({hand:"katana",off:"none",head:"hood",headc:"#3A4A6A",body:{type:"tunic",c:"#3A4A6A",apron:"#2B2233"},mask:"#3A4A6A"});
  N.toride=R({hand:"bamboo",off:"none",head:"kabuto",headc:"#9AB8D0",body:{type:"samurai",c:"#5E7F9A",t:"#E8EEF4",under:"#2B2233"},beard:"#E8EEF4",hair:"#E8EEF4"});
  N.sakon=R({hand:"katana",off:"none",head:"hachigane",body:{type:"samurai",c:"#E8EEF4",t:"#9AA4AE",under:"#3A4A6A"},hair:"#E8EEF4",longhair:1});
  N.hatamoto=R({hand:"bamboo",off:"none",head:"kabuto",headc:"#2B2233",body:{type:"samurai",c:"#2B2233",t:"#E5B53B",under:"#3A4A6A"},hair:"#2B2233"});
  N.sekisho=R({hand:"bigsword",off:"none",head:"greatkabuto",headc:"#C99A2E",body:{type:"samurai",c:"#4A3A6A",t:"#FFD34D",under:"#2B2233"},beard:"#2B2233",hair:"#2B2233"});
  N.tesshin=R({hand:"meito",off:"gunbai",head:"greatkabuto",headc:"#2B2233",body:{type:"samurai",c:"#2B2233",t:"#E5B53B",haori:"#3A4A6A",under:"#7A1F2B"},beard:"#2B2233",hair:"#2B2233",aura:"#3A4A6A"});
  N.tesshin2={hand:"none",off:"none",head:"none",body:{type:"samurai",c:"#2B2233",t:"#E5B53B",haori:"#3A4A6A",under:"#7A1F2B"},beard:"#2B2233",hair:"#2B2233"};
  /* 海の道：黒帆団（架空の海賊団） */
  N.pirate=R({hand:"cutlass",off:"none",head:"bandana",headc:"#2B2233",body:{type:"sailor",c:"#3A3F58",t:"#2B2233"},hair:"#2B2233"});
  N.sam=R({hand:"cutlass",off:"none",head:"tricorn",headc:"#2B2233",body:{type:"coat",c:"#3A3F58",t:"#C9D3DD"},beard:"#5A3A22",hair:"#5A3A22",eyepatch:1});
  N.gunner=R({hand:"none",off:"lantern",head:"bandana",headc:"#7A1F2B",body:{type:"sailor",c:"#2B2233",t:"#7A1F2B"},beard:"#2B2233",hair:"#2B2233"});
  N.karina={hand:"cutlass",off:"compass",head:"tricorn",headc:"#C0392B",body:{type:"coat",c:"#C0392B",t:"#E5B53B"},hair:"#7A1F2B",longhair:1};
  N.karinaR=R({hand:"cutlass",off:"compass",head:"tricorn",headc:"#C0392B",body:{type:"coat",c:"#C0392B",t:"#E5B53B"},hair:"#7A1F2B",longhair:1});
  N.pnav=R({hand:"scope",off:"none",head:"tricorn",headc:"#3A3F58",body:{type:"coat",c:"#2B2233",t:"#5CB8B2"},hair:"#2B2233"});
  N.kryuk=R({hand:"cutlass",off:"none",head:"bandana",headc:"#2B2233",body:{type:"coat",c:"#2B2233",t:"#8C93A8"},beard:"#2B2233",hair:"#2B2233",scar:1});
  N.volna=R({hand:"cutlass",off:"compass",head:"tricorn",headc:"#1E2433",body:{type:"coat",c:"#1E2433",t:"#9A6BD6"},beard:"#2B2233",hair:"#2B2233",cape:"#2B2233",eyepatch:1,aura:"#1F2A44"});
  N.volna2={hand:"none",off:"map",head:"tricorn",headc:"#1E2433",body:{type:"coat",c:"#1E2433",t:"#9A6BD6"},beard:"#2B2233",hair:"#2B2233",eyepatch:1};
  /* 物語の道：叙事詩の中の人物 */
  N.relative=R({hand:"whip",off:"none",head:"tebetei",headc:"#3A3F58",body:{type:"chapan",c:"#3A3F58",t:"#C99A2E",fur:1},beard:"#2B2233",hair:"#2B2233"});
  N.kulchoro={hand:"bow",off:"quiver",head:"batyr",body:{type:"chapan",c:"#5E7F9A",t:"#E8B923"},hair:"#2B2233"};
  N.aichurek={hand:"none",off:"none",head:"elechek",body:{type:"chapan",c:"#2C8F8A",t:"#FFD34D",fur:1},hair:"#2B2233",longhair:1,spark:1};
})();

/* ---------- 道ごとの敵（8章） ---------- */
var P74_FOES={
 sword:[
  {f:[["畑あらしのけだまろ","m:0:#C7823E"],["盗賊の見張り","npc:bandit"]],b:{n:"盗賊のかしら 赤ひげのグロム",a:"npc:grom"}},
  {f:[["街道のいわごろ","m:1:#8C7A68"],["黒騎士団の見習い兵","npc:bk"]],b:{n:"斥候隊長 ヴォーロン",a:"npc:voron"}},
  {f:[["鉱山のよるばね","m:2:#4A4F63"],["黒騎士団の弓兵","npc:bkarcher"]],b:{n:"鉱山を守る石の巨人",a:"b:1"}},
  {f:[["峠のもやもや","m:4:#9AAEC2"],["黒騎士団の騎士","npc:bk"]],b:{n:"双子の騎士 ザーパドとヴォストーク",a:"npc:twins"}},
  {f:[["夜の森のオオカミ","an:wolf:#4A4F63"],["黒騎士団の弓兵","npc:bkarcher"]],b:{n:"夜のオオカミ王",a:"b:4"}},
  {f:[["火山のかぶとん","m:5:#E0603A"],["黒騎士団の重装兵","npc:bk"]],b:{n:"鉄仮面の副団長 ジェレーザ",a:"npc:zheleza"}},
  {f:[["雷雲のよるばね","m:2:#E5B53B"],["黒騎士団の親衛隊","npc:twins"]],b:{n:"雷の大ワシ",a:"b:6"}},
  {f:[["影のにょろり","m:6:#3A2E5C"],["影にのまれた騎士","npc:shadowsol"]],b:{n:"黒騎士団長 ノーチ",a:"npc:nochi"}}],
 magic:[
  {f:[["森のきのこぼう","m:3:#9A6BD6"],["灰色のもやもや","m:4:#9A9AA8"]],b:{n:"灰の番人",a:"b:0"}},
  {f:[["魔導書をねらうタカ","an:hawk:#4A4A55"],["灰の弟子","npc:ashapp"]],b:{n:"兄弟子 ズヴェズダー",a:"npc:zvezda"}},
  {f:[["塔のいわごろ","m:1:#8C93A8"],["灰の弟子","npc:ashapp"]],b:{n:"塔を守る石の巨人",a:"b:1"}},
  {f:[["氷のつぼみん","m:7:#5CB8B2"],["雪のもやもや","m:4:#BFE3F2"]],b:{n:"吹雪の大ジカ",a:"b:3"}},
  {f:[["灰の騎士","npc:ashknight"],["夜のよるばね","m:2:#3A3F58"]],b:{n:"灰にのまれたズヴェズダー",a:"npc:zvezda2"}},
  {f:[["炎のかぶとん","m:5:#E0603A"],["灰の騎士","npc:ashknight"]],b:{n:"炎の大トカゲ",a:"b:5"}},
  {f:[["雷のよるばね","m:2:#E5B53B"],["星の塔の番人","npc:towerguard"]],b:{n:"雷の大ワシ",a:"b:6"}},
  {f:[["灰の分身","m:4:#4A4A55"],["灰の騎士","npc:ashknight"]],b:{n:"灰の魔導士 ペーペル",a:"npc:pepel"}}],
 king:[
  {f:[["畑あらしのかぶとん","m:5:#5BAE6B"],["いじわるな徴税人","npc:taxman"]],b:{n:"欲ばり地主",a:"npc:landlord"}},
  {f:[["川のにょろり","m:6:#4F8FD8"],["地主の手下","npc:bandit"]],b:{n:"春のあばれ川",a:"ev:river"}},
  {f:[["街道の盗賊","npc:bandit"],["夜のよるばね","m:2:#4A4F63"]],b:{n:"街道の盗賊団長",a:"npc:roadchief"}},
  {f:[["値上げの使い","npc:taxman"],["倉庫のきのこぼう","m:3:#C7823E"]],b:{n:"男爵の大商人 ジェーニギ",a:"npc:guild"}},
  {f:[["男爵の兵","npc:baronsol"],["森のオオカミ","an:wolf:#8C93A8"]],b:{n:"男爵の騎士隊長",a:"npc:baroncap"}},
  {f:[["男爵の兵","npc:baronsol"],["炎のかぶとん","m:5:#E0603A"]],b:{n:"金の男爵 ゾーロト",a:"npc:zoloto"}},
  {f:[["宰相のスパイ","npc:spy"],["雷雲のもやもや","m:4:#E5B53B"]],b:{n:"雷の大ワシ",a:"b:6"}},
  {f:[["影の兵","npc:shadowsol"],["宰相のスパイ","npc:spy"]],b:{n:"影の宰相 テーニ",a:"npc:teni"}}],
 samurai:[
  {f:[["野盗","npc:nobushi"],["山のいわごろ","m:1:#8C7A68"]],b:{n:"野盗のかしら 片目の権太",a:"npc:gonta"}},
  {f:[["嵐堂の足軽","npc:ashigaru"],["夜霧のもやもや","m:4:#9AAEC2"]],b:{n:"嵐堂の足軽大将",a:"npc:ashitaisho"}},
  {f:[["嵐堂の足軽","npc:ashigaru"],["嵐堂の騎馬武者","npc:kiba"]],b:{n:"猪武者 大熊",a:"npc:okuma"}},
  {f:[["雪山のもやもや","m:4:#BFE3F2"],["嵐堂のしのび","npc:eshinobi"]],b:{n:"雪の砦の守将",a:"npc:toride"}},
  {f:[["嵐堂の槍隊","npc:ashigaru"],["夜のオオカミ","an:wolf:#4A4F63"]],b:{n:"白狐の左近",a:"npc:sakon"}},
  {f:[["嵐堂の騎馬武者","npc:kiba"],["火の粉のかぶとん","m:5:#E0603A"]],b:{n:"炎に包まれた城",a:"ev:fire"}},
  {f:[["嵐堂の旗本","npc:hatamoto"],["雷雲のよるばね","m:2:#E5B53B"]],b:{n:"雷鳴の関所の守将",a:"npc:sekisho"}},
  {f:[["嵐堂の旗本","npc:hatamoto"],["嵐堂のしのび","npc:eshinobi"]],b:{n:"嵐堂家の当主 鉄心",a:"npc:tesshin"}}],
 sea:[
  {f:[["網をからめるにょろり","sea:serpent:#5BAE6B"],["黒帆団の見張り","npc:pirate"]],b:{n:"大ダコ",a:"sea:kraken:#9A6BD6"}},
  {f:[["港のカニ","sea:crab:#E36D5B"],["黒帆団の下っぱ","npc:pirate"]],b:{n:"ほら吹きサム",a:"npc:sam"}},
  {f:[["光るクラゲ","sea:jelly:#E58AB0"],["黒帆団の砲手","npc:gunner"]],b:{n:"霧の海の番人",a:"b:0"}},
  {f:[["はらぺこのサメ","sea:shark:#8C93A8"],["黒帆団の切りこみ隊","npc:pirate"]],b:{n:"赤帆のカリーナ",a:"npc:karinaR"}},
  {f:[["氷のクラゲ","sea:jelly:#BFE3F2"],["黒帆団の航海士","npc:pnav"]],b:{n:"氷海の大うみへび",a:"sea:serpent:#9AB8D0"}},
  {f:[["火山島のカニ","sea:crab:#E0603A"],["黒帆団の砲手長","npc:gunner"]],b:{n:"鉄フックのクリューク",a:"npc:kryuk"}},
  {f:[["嵐のよるばね","m:2:#4E5B8C"],["黒帆団の精鋭","npc:pnav"]],b:{n:"嵐の大うず",a:"ev:whirl"}},
  {f:[["深海の大ザメ","sea:shark:#3A3F58"],["黒帆団の親衛隊","npc:kryuk"]],b:{n:"黒帆のヴォルナ",a:"npc:volna"}}],
 /* 物語・歴史の道は「出来事」。章の出来事のあとに、その場面（story[章+1]）が開く */
 manas:[
  {f:[["ジャクプとチユルドゥの祈り","npc:jakyp"],["ふしぎな夢のしらせ","ev:moon"]],b:{n:"マナスの誕生",a:"ev:star"}},
  {f:[["子馬に乗る練習","an:horse:#9A6A36"],["大人もおどろく力","ev:boulder"]],b:{n:"アク・クラと草原をかける",a:"an:horse:#E9D9B8"}},
  {f:[["仲間を集める","npc:people1"],["相談役バカイの知恵","npc:elder"]],b:{n:"四十人の仲間がそろう",a:"ev:crowd"}},
  {f:[["遠くから来た勇者","ev:road"],["長い旅の話","ev:fire"]],b:{n:"アルマンベトとの友情",a:{hand:"sword",off:"none",head:"batyr",headc:"#C99A2E",body:{type:"armor",c:"#5E7F9A",t:"#E8B923"},hair:"#2B2233",cape:"#2C5D8F"}}},
  {f:[["カヌケイのもてなし","ev:yurt"],["かしこい助言","ev:scroll"]],b:{n:"妻カヌケイ",a:"npc:kanykey"}},
  {f:[["宴の知らせが広がる","ev:road"],["競馬のしたく","an:horse:#E9D9B8"]],b:{n:"ボクムルンの追悼の宴",a:"ev:crowd"}},
  {f:[["大遠征への出発","ev:road"],["けわしい山道","ev:pass"]],b:{n:"強敵コヌルバイとのたたかい",a:"npc:rival"}},
  {f:[["深い傷","ev:moon"],["仲間たちの別れ","ev:crowd"]],b:{n:"物語は息子へ",a:"npc:child"}}],
 semetey:[
  {f:[["マナスが亡くなったあと","ev:moon"],["地位をねらう親族","npc:relative"]],b:{n:"ブハラへのがれる旅",a:"ev:road"}},
  {f:[["羊飼いの子として育つ","ev:sheep"],["ふつうの少年の日々","ev:yurt"]],b:{n:"父を知らない少年",a:"ev:moon"}},
  {f:[["母カヌケイの思い","npc:kanykey"],["相談役バカイ","npc:elder"]],b:{n:"明かされた真実",a:"ev:scroll"}},
  {f:[["父の馬タイブールル","an:horse:#9AA4AE"],["ふるさとへの長い道","ev:road"]],b:{n:"タラスの争いをおさめる",a:"ev:crowd"}},
  {f:[["アルマンベトの息子","npc:kulchoro"],["父どうしの友情","ev:fire"]],b:{n:"友クルチョロ",a:"npc:kulchoro"}},
  {f:[["ふしぎな力をもつ女性","ev:star"],["アイチュレク","npc:aichurek"]],b:{n:"アイチュレクが妻に",a:"npc:aichurek"}},
  {f:[["外からせまる危険","ev:storm"],["思いがけない裏切り","ev:moon"]],b:{n:"強敵コヌルバイ",a:"npc:rival"}},
  {f:[["幼い息子セイテク","npc:child"],["信頼できる人たち","ev:crowd"]],b:{n:"物語は「セイテク」へ",a:"ev:star"}}],
 kurmanjan:[
  {f:[["アライの山の暮らし","ev:pass"],["決められた結婚の話","ev:scroll"]],b:{n:"父のもとで暮らす決心",a:"ev:yurt"}},
  {f:[["アライを治めるアリムベク","npc:alymbek"],["暮らしと政治を学ぶ","ev:scroll"]],b:{n:"アリムベクとの結婚（1832年）",a:"npc:alymbek"}},
  {f:[["宮廷の争い","ev:storm"],["悲しい知らせ","ev:moon"]],b:{n:"夫を失う（1862年）",a:"ev:moon"}},
  {f:[["人々を見捨てない","ev:crowd"],["君主たちとの話し合い","ev:scroll"]],b:{n:"「ダトカ」の位を受ける",a:"ev:star"}},
  {f:[["時代の大きな変化","ev:storm"],["人々の声を聞く","ev:crowd"]],b:{n:"争いを続けない決断（1876年）",a:"ev:scroll"}},
  {f:[["息子たちへの訴え","ev:scroll"],["力ずくを止める","ev:crowd"]],b:{n:"母としてのつらい日（1895年）",a:"ev:moon"}},
  {f:[["遠くからの客","ev:road"],["記録に残る写真","ev:camera"]],b:{n:"マンネルヘイムの訪問（1906年）",a:"npc:officer"}},
  {f:[["人々の敬意","ev:crowd"],["長い人生","ev:moon"]],b:{n:"「アライの女王」として記憶される",a:"ev:star"}}],
 toktogul:[
  {f:[["ケトメン・トベの谷","ev:pass"],["まずしい農家の暮らし","ev:yurt"]],b:{n:"トクトグルの誕生（1864年）",a:"ev:star"}},
  {f:[["母ブルマの歌","npc:mother"],["コムズの音","ev:komuz"]],b:{n:"最初の先生は母",a:"npc:mother"}},
  {f:[["歌い手として知られる","ev:crowd"],["不正を歌で批判する","ev:scroll"]],b:{n:"まずしい人々の声になる",a:"npc:people1"}},
  {f:[["アンディジャンの反乱（1898年）","ev:storm"],["うその訴え","ev:scroll"]],b:{n:"とらえられる",a:"ev:moon"}},
  {f:[["ふるさとから遠い道","ev:road"],["イルクーツクの近く","ev:snow"]],b:{n:"きびしい寒さと労働",a:"ev:snow"}},
  {f:[["ふるさとへの思い","ev:moon"],["ウズベクやカザフの人々との交流","ev:crowd"]],b:{n:"故郷へもどる長い旅",a:"ev:road"}},
  {f:[["家族の悲しい知らせ","ev:moon"],["歌いつづける","ev:komuz"]],b:{n:"首都で記録された曲（1928年）",a:"ev:scroll"}},
  {f:[["ふるさとの村","ev:yurt"],["人々の記憶","ev:crowd"]],b:{n:"名前が残る町",a:"ev:star"}}]
};

/* ---------- 5つの冒険の道の物語（オリジナル）。story[0]＝序章、story[i]＝ボスを i 体倒したあと。nx＝次回予告 ---------- */
var P74_TALES={
 sword:[
  {t:"序章　畑を荒らす影",night:1,fig:["h@90"],x:"小さな村の畑が、夜になるたびに荒らされます。農民の若者は古いくわを手に、見張りに立つことにしました。\n暗やみの中で光る、いくつもの目。そのうしろに、黒い旗が見えた気がしました。",nx:"畑を荒らしていたのは、ただのモンスターではなかった！"},
  {t:"第1話　森の盗賊",fig:["h@20","a0@90","npc:grom@164"],x:"森の盗賊のかしら、赤ひげのグロムを追いはらいました。助けてくれたのは、弓使いのソーニャ。ソーニャは仲間になりました。\nグロムは逃げながら叫びます。「おれたちは、黒い騎士さまに鉄をとどけていただけだ！」",nx:"国中の村から鉄を集める、なぞの騎士たちとは？"},
  {t:"第2話　黒騎士団",fig:["h@20","a1@90","npc:voron@164"],x:"黒騎士団の斥候隊長ヴォーロンをたおし、盾の大男イワンが仲間に加わりました。\nヴォーロンの地図には、山の鉱山に赤い印。黒騎士団は、そこで人々をむりやり働かせているようです。",nx:"山の鉱山で、とらわれた人々を助け出せ！"},
  {t:"第3話　山の鉱山",fig:["a0@10","h@80","a1@150"],x:"鉱山を守る石の巨人をたおし、とらわれていた人々を助け出しました。\n助けた鉱夫が教えてくれます。「黒騎士団の団長の名はノーチ。昔は、国いちばんの騎士だったそうだ」",nx:"ノーチの過去を知る、双子の騎士が立ちはだかる。"},
  {t:"第4話　双子の騎士",fig:["h@20","a2@90","npc:twins@164"],x:"双子の騎士ザーパドとヴォストークとの勝負に勝ちました。けがをした仲間を、薬師のヴェーラが治してくれます。ヴェーラも旅に加わりました。\n双子は言います。「団長は、ある日から人が変わった。黒い影に、心をのまれたように」",nx:"オオカミの遠ぼえが、王都の夜にひびく。"},
  {t:"第5話　王都の夜",night:1,fig:["h@60","a1@130"],x:"王都をおそった夜のオオカミ王を追いはらい、あなたは騎士に任命されました。\n王さまは静かに話します。「ノーチは、かつてわたしの命を守った英雄だ。どうか、彼を止めてほしい」",nx:"黒騎士団の副団長が、ついに姿を現す。"},
  {t:"第6話　鉄仮面",fig:["h@20","a3@90","npc:zheleza@160"],x:"鉄仮面の副団長ジェレーザとの戦いのあと、仮面の下から現れたのは、ノーチの妹でした。相棒のタカ、ヤーストレプも仲間になります。\n「兄は、影の竜の力で国を守れると信じてしまった。お願い、兄を助けて」",nx:"ノーチの城へ続く峠を、雷の大ワシが守っている。"},
  {t:"第7話　雷の峠",night:1,fig:["a2@10","h@80","npc:nochi@160"],x:"雷の大ワシをしずめ、ついにノーチの城の前に立ちました。あなたは騎士団長として、仲間をひきいています。\n城の上から、ノーチの声がひびきます。「影の竜の力があれば、だれも国をおそえない。じゃまをするな！」",nx:"最終回。影にのまれた英雄を、取りもどせるか。"},
  {t:"最終回　夜明けの剣",fig:["h@30","npc:nochi2@100","a4@166"],x:"夜明けの光とともに、ノーチをおおっていた影が消えました。ノーチは剣を置き、国をもう一度立て直す手伝いをすると約束します。\n旅の歌い手ミーシャが仲間に加わり、この旅を歌にしました。畑を守るためにくわを持った若者は、剣の英雄になったのです。"}],
 magic:[
  {t:"序章　光る魔導書",night:1,fig:["h@90"],x:"薬草をつみに入った森で、古い魔導書を見つけました。本はひとりでに開き、一行だけ光ります。「灰が来る。光を守れ」\nその夜から、森の色が少しずつ灰色に変わりはじめました。",nx:"森の色をうばっているのは、だれ？"},
  {t:"第1話　灰色の森",fig:["h@60","a0@130"],x:"灰をまとった番人を封じると、森に少し色がもどりました。黒ネコのコーシカが、魔導書のにおいをかいでついて来ます。使い魔として仲間になりました。\n魔導書の次のページには、魔法学校の地図がかかれていました。",nx:"魔法学校で待っていたのは、きびしいライバル。"},
  {t:"第2話　兄弟子",fig:["h@20","a1@90","npc:zvezda@164"],x:"魔法学校の試験の決闘で、兄弟子のズヴェズダーに勝ちました。見習い神官のパーシャが「すごい！」と仲間になります。\n負けたズヴェズダーは、くやしそうに言い残して去りました。「もっと力がほしい。灰の魔導士なら、それをくれる」",nx:"古い塔に、灰の魔導士の秘密がねむる。"},
  {t:"第3話　石の塔",fig:["a1@20","h@90","a0@156"],x:"古い塔を守る石の巨人を封じ、塔の書庫に入りました。\n古い記録には、灰の魔導士ペーペルの名前。昔、大賢者になれなかった魔法使いで、「光をひとりじめにすれば、だれにも負けない」と考えたそうです。",nx:"吹雪の谷で、なつかしい顔が苦しんでいる。"},
  {t:"第4話　吹雪の谷",fig:["h@20","a2@90","npc:zvezda2@164"],x:"吹雪の大ジカを封じた谷で、森の弓使いリーパが仲間になりました。\n谷の奥で見たのは、灰色のローブを着たズヴェズダー。目から光が消え、灰の力に苦しんでいるようでした。",nx:"灰にのまれたライバルを、助けられるか。"},
  {t:"第5話　灰にのまれた兄弟子",fig:["h@40","npc:zvezda3@120"],x:"灰の力にのまれたズヴェズダーを封じ、呪いをときました。正気にもどったズヴェズダーは、頭を下げます。\n「ペーペルは、世界中の光を一つの玉に集めている。全部集まったら、世界は灰色になってしまう」",nx:"光の玉のありかを知る者をさがせ。"},
  {t:"第6話　炎の山",fig:["h@50","a3@130"],x:"炎の大トカゲを封じた山で、物知りフクロウのサヴァーと出会い、仲間になりました。\nサヴァーは言います。「光の玉は、星の塔のてっぺんじゃ。塔は雷に守られておる」",nx:"雷の向こうで、ペーペルが待っている。"},
  {t:"第7話　星の塔",night:1,fig:["a2@10","h@80","npc:pepel@160"],x:"雷の大ワシを封じ、星の塔のてっぺんにたどり着きました。そこには、光の玉を手にしたペーペルがいました。\n「わたしも昔は、おまえのように光を守ろうとした。だが、だれもわたしを認めなかった」",nx:"最終回。世界の光を取りもどせ！"},
  {t:"最終回　白夜の大魔法",fig:["h@30","npc:pepel2@100","a4@166"],x:"光の玉が開き、世界に色がもどりました。灰が消えると、ペーペルは小さな老人にもどり、静かに「ありがとう」と言いました。\n雪オオカミのヴォールチクが仲間になり、あなたは大賢者と呼ばれるようになりました。ペーペルは今、魔法学校で子どもたちに薬草を教えています。"}],
 king:[
  {t:"序章　足りない冬じたく",fig:["npc:people1@40","h@110"],x:"小さな村は、冬をこすための食べ物が足りません。村人たちは、まじめな農民のあなたに「世話役になってくれ」とたのみました。\nそのころ村には、税を二倍にするという知らせが届いていました。",nx:"税を上げたのは、いったいだれ？"},
  {t:"第1話　欲ばり地主",fig:["h@20","a0@90","npc:landlord@164"],x:"畑を独りじめしていた欲ばり地主を、村の話し合いで退けました。帳簿にくわしいアンナが「数字はうそをつかない」と言って、大臣役を引き受けてくれます。\n畑はみんなで分けられ、村は冬をこせました。",nx:"春の大水が、村をおそう！"},
  {t:"第2話　あばれ川",fig:["h@50","a1@130"],x:"あばれ川の大水から村を守るため、みんなで堤防と橋をつくりました。元兵士のボリスが力仕事をまとめ、将軍として仲間になります。\n橋ができると人が集まり、村は町になりました。",nx:"にぎわう町を、ねらう者がいる。"},
  {t:"第3話　金の手紙",fig:["a0@20","h@90","a1@156"],x:"街道の盗賊団を退け、市場はますますにぎわいます。\nそんなある日、となりの領地の金の男爵ゾーロトから、金色の手紙が届きました。「その町を、わたしに売りなさい」",nx:"男爵の大商人が、市場を乗っとりにくる。"},
  {t:"第4話　お金の戦い",fig:["h@20","a2@90","npc:guild@164"],x:"男爵の大商人ジェーニギは、物の値段を上げて市場を乗っとろうとしました。料理長のナースチャが、安くておいしい料理で町の祭りを開き、人々を集めます。ナースチャも仲間になりました。\nジェーニギは負けを認め、帰っていきました。",nx:"男爵が、とうとう兵を動かす。"},
  {t:"第5話　国境の騎士",fig:["a1@20","h@90","npc:baroncap@164"],x:"国境をこえてきた男爵の騎士隊を、ボリスの守りで退けました。あなたは辺境伯としてみとめられます。\nけれど、つかまえた騎士がつぶやきました。「男爵さまも、本当は命令されているだけなんだ」",nx:"男爵に命令しているのは、だれ？"},
  {t:"第6話　金の男爵",fig:["h@20","a3@90","npc:zoloto2@160"],x:"金の男爵ゾーロトを退けると、男爵は手紙のたばを見せました。差出人は、王国の宰相テーニ。かしこいキツネのリサが手紙のうそを見やぶり、仲間になりました。\n宰相は、国を二つに分けて自分のものにしようとしていたのです。",nx:"宰相が呼んだ大ワシが、都をおそう。"},
  {t:"第7話　雷の夜",night:1,fig:["a0@10","h@80","npc:teni@160"],x:"雷の大ワシから都を守り、人々はあなたを王にえらびました。\nしかし宰相テーニは姿を消し、「影の兵」を集めているといううわさが広がります。",nx:"最終回。影の宰相との、最後の対決。"},
  {t:"最終回　大いなる治世",fig:["h@30","npc:zoloto2@100","a4@166"],x:"影の宰相テーニを退け、国は一つにまとまりました。金の男爵ゾーロトとも、平和の約束を結びます。\n旅の商人グリーシャが仲間になり、七つの町を結ぶ道ができました。小さな村の世話役だったあなたは、人々にしたわれる大王になったのです。"}],
 samurai:[
  {t:"序章　戦の世",night:1,fig:["h@90"],x:"戦の世。村は野盗におびえて暮らしています。百姓の若者は、村を守るために竹やりを手に取り、足軽になる決心をしました。",nx:"野盗のかしらが、村をねらっている！"},
  {t:"第1話　片目の権太",fig:["h@20","a0@90","npc:gonta@164"],x:"野盗のかしら、片目の権太を討ち取り、村を守りました。いっしょに戦った槍の名人、弥七が「おまえについていく」と仲間になります。\n権太の持っていた旗には、嵐の紋。となりの国、嵐堂家のものでした。",nx:"嵐堂家が、ついに動きだす。"},
  {t:"第2話　嵐の紋",night:1,fig:["h@20","a1@90","npc:ashitaisho@164"],x:"嵐堂家の足軽大将を討ち取り、手柄を立てました。その夜、しのびの者の小雪があらわれ、「嵐堂がこの城をねらっている」と知らせて仲間になります。",nx:"嵐堂家いちばんの暴れ者が、先頭に立つ。"},
  {t:"第3話　猪武者",fig:["a0@20","h@90","npc:okuma@160"],x:"嵐堂の先鋒、猪武者の大熊を討ち取り、あなたは侍に取り立てられました。\n大熊は最後に言いました。「鉄心さまは、戦を終わらせるために天下をとると言っておられる」",nx:"敵の大将の考えを知る者が、山の砦にいる。"},
  {t:"第4話　雪の砦",fig:["h@40","a2@120"],x:"雪の砦を落とし、軍師の宗玄が仲間になりました。宗玄は、昔は鉄心に仕えていたといいます。\n「鉄心どのは、本気で戦のない世を作りたいのだ。ただ、そのやり方が強すぎる」",nx:"鉄心の右腕、剣の天才が立ちはだかる。"},
  {t:"第5話　白狐の左近",fig:["h@40","npc:sakon@120"],x:"白狐の左近との一騎打ちに勝ち、城代になりました。左近は刀をおさめ、「鉄心さまに、おまえのことを伝えよう」と去りました。",nx:"主君の城が、炎に包まれる。"},
  {t:"第6話　炎の城",night:1,fire:1,fig:["h@30","a3@140"],x:"燃える城から人々を救い出しました。弓の名人、千代が仲間になります。\n主君は深い傷を負い、あなたに城をたくしました。こうして、あなたは城主になりました。",nx:"鉄心のもとへ続く道は、ただ一つ。"},
  {t:"第7話　雷鳴の関所",fig:["a2@10","h@80","npc:tesshin@160"],x:"雷鳴の関所を守る将を討ち取り、あなたは大名となりました。\nそこへ、鉄心からの使者がきます。「これ以上、兵を死なせたくない。大将どうし、一騎打ちで決めよう」",nx:"最終回。二人の大将の、最後の勝負。"},
  {t:"最終回　天下ひとつ",fig:["h@30","npc:tesshin2@100","a4@166"],x:"長い一騎打ちのあと、鉄心は刀を置きました。「おまえとなら、戦のない世が作れる」\n刀かじの鉄之助が仲間になり、これからは刀ではなく、くわやすきを打つと笑います。百姓から身を起こしたあなたは、天下をおさめる人になりました。"}],
 sea:[
  {t:"序章　黒い帆",fig:["h@90"],x:"小さな漁村の沖に、黒い帆の船があらわれました。それからというもの、村の網が次々に切られていきます。\n若者はつりざおを置き、海へ出る決心をしました。",nx:"網を切っていたのは…？"},
  {t:"第1話　大ダコ",fig:["h@20","a0@90","sea:kraken:#9A6BD6@164"],x:"網を切っていた大ダコを追いはらいました。見張りのとくいなカーチャが、遠めがねで黒い帆の船を見つけ、仲間になります。\n大ダコは、黒帆団の船に飼われていたのです。",nx:"黒帆団の小船長が、港にやってくる。"},
  {t:"第2話　ほら吹きサム",fig:["h@20","a1@90","npc:sam@164"],x:"黒帆団の小船長、ほら吹きサムを追いはらいました。船大工のフョードルがこわれた船を直してくれて、自分たちの船が手に入りました。\nサムは逃げながら言いました。「ヴォルナ船長は、七つの港の宝の地図を探しているんだぞ！」",nx:"霧の中から、なぞの船があらわれる。"},
  {t:"第3話　霧の海",night:1,fig:["h@30","npc:volna@140"],x:"霧の海の番人を追いはらうと、霧の向こうに黒帆団の大きな船が見えました。船首に立つのは、黒帆のヴォルナ。\n港のうわさでは、ヴォルナは昔、正直な船乗りだったそうです。",nx:"宝の地図をねらうのは、黒帆団だけではなかった。"},
  {t:"第4話　赤い帆",fig:["h@20","a2@90","npc:karinaR@164"],x:"赤帆のカリーナとの勝負に勝ちました。カリーナも宝の地図を追う、もう一人の船長です。カモメのチャイカが、こちらの船に飛び移って仲間になりました。\nカリーナは笑います。「次は負けないよ。でも、ヴォルナに地図をわたすのは、もっといや」",nx:"ライバルと、まさかの協力！"},
  {t:"第5話　氷の海",fig:["h@40","npc:karina@120"],x:"カリーナの船と力を合わせ、氷の海の大うみへびを追いはらいました。あなたは船長になります。\nカリーナが地図の半分を見せてくれました。「もう半分は、ヴォルナが持っている」",nx:"黒帆団の副船長が、待ちぶせしている。"},
  {t:"第6話　鉄フック",fig:["h@20","a3@90","npc:kryuk@164"],x:"黒帆団の副船長、鉄フックのクリュークを追いはらいました。船の料理番ターニャが「おなかがすいては戦えない」と仲間になります。\nクリュークは言います。「船長は、宝で黒帆団の仲間を食べさせたいだけなんだ」",nx:"ヴォルナの船へ行くには、大うずをこえなければ。"},
  {t:"第7話　大うず",night:1,fig:["a0@10","h@80","npc:volna@160"],x:"嵐の大うずをこえ、あなたは船団をひきいる提督になりました。\n目の前に、黒帆のヴォルナの船。ヴォルナは叫びます。「この海で生きるには、宝が必要なんだ！」",nx:"最終回。地図の本当のなぞが明らかに。"},
  {t:"最終回　七つの港",fig:["h@30","npc:volna2@100","a4@166"],x:"ヴォルナを追いはらい、二つに分かれた地図を合わせると、それは宝のありかではなく、七つの港を安全に結ぶ航路図でした。\n地図をかいたのは、老いた航海士レフ。レフが仲間になり、ヴォルナの船も港を結ぶ船団に加わります。漁村の若者は、大提督になりました。"}]
};
P74_PATHS.forEach(function(P){if(P74_TALES[P.id])P.story=P74_TALES[P.id];if(P.hist){P.ev=1;P.verb="クリア";}});
/* 章の番号（テーマ番号から） */
function p74ChOf(ti){var CH=p74Chapters(P47_THEMES.length);for(var c=0;c<CH.length;c++)if(ti>=CH[c][0]&&ti<CH[c][1])return c;return CH.length-1;}
function p74FoeOf(P,ti){var D=P&&P74_FOES[P.id];if(!D)return null;var c=p74ChOf(ti),CH=p74Chapters(P47_THEMES.length);return D[c].f[(ti-CH[c][0])%2];}
function p74FoeName(P,ti){var f=p74FoeOf(P,ti);return f?f[0]:p74MonsterName(ti);}
function p74FoeArt(P,ti){var f=p74FoeOf(P,ti);return f?p74Art(f[1]):p74Monster(ti);}
function p74BossName(P,c){var D=P&&P74_FOES[P.id];return D?D[c].b.n:P74_BOSS[c].t+" "+P74_BOSS[c].n;}
function p74BossArt(P,c){var D=P&&P74_FOES[P.id];return D?p74Art(D[c].b.a):p74Boss(c);}
