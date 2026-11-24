/* ===== Phase74 冒険モードの「時代の絵」 =====
   冒険モード（道を選んでいるとき）のレッスンでは、よく出る単語の絵を、その道の時代の人物・建物で描いた絵に差しかえる。
   絵は1つだけ出す。単語の意味が伝わることがいちばん大事なので、差しかえるのは下の P74_ERA_KEYS にある絵だけ。
   それ以外の絵（バス・電話・数字など）はもとの絵のまま。
   人物の衣装は男女で分ける（キルギスの道：男性＝カルパク、結婚している女性＝エレチェク、若い女性・女の子＝テベテイ）。
   すべてこのアプリのためのオリジナルの絵。 ===== */
var P74_ROLES={
 kg:{man:{head:"kalpak",body:{type:"chapan",c:"#2C5D8F",t:"#E8D5A8"},hair:"#2B2233"},
     man2:{head:"kalpak",body:{type:"chapan",c:"#6B8E4E",t:"#E8D5A8"},hair:"#2B2233",beard:"#2B2233"},
     woman:{head:"elechek",body:{type:"robe",c:"#B3202B",t:"#E8B923"},hair:"#2B2233"},
     woman2:{head:"tebetei",headc:"#2C5D8F",body:{type:"robe",c:"#5CB8B2",t:"#E8D5A8"},hair:"#2B2233",longhair:1},
     girl:{head:"tebetei",headc:"#B3202B",body:{type:"robe",c:"#C7823E",t:"#E8D5A8"},hair:"#2B2233",longhair:1},
     boy:{head:"kalpak",body:{type:"chapan",c:"#3E6E4A",t:"#E8D5A8"},hair:"#2B2233"},
     oldman:{head:"kalpak",body:{type:"chapan",c:"#5E4A7E",t:"#E8B923",fur:1},beard:"#E8EEF4",hair:"#E8EEF4"},
     oldwoman:{head:"elechek",body:{type:"robe",c:"#5E6E7E",t:"#E8D5A8"},hair:"#C9D3DD"}},
 med:{man:{head:"leathercap",body:{type:"tunic",c:"#7E9C5A",apron:"#8A5A2B"},hair:"#5A3A22"},
     man2:{head:"none",body:{type:"tunic",c:"#2C5D8F",apron:"#6E4A22"},hair:"#C98A3A",beard:"#C98A3A"},
     woman:{head:"bandana",headc:"#F6F1E1",body:{type:"robe",c:"#B3202B",t:"#F6F1E1"},hair:"#5A3A22",longhair:1},
     woman2:{head:"none",body:{type:"robe",c:"#5CB8B2",t:"#F6F1E1"},hair:"#E5B53B",longhair:1},
     girl:{head:"none",body:{type:"robe",c:"#E58AB0",t:"#F6F1E1"},hair:"#C98A3A",longhair:1},
     boy:{head:"none",body:{type:"tunic",c:"#C7823E",apron:"#6E4A22"},hair:"#5A3A22"},
     oldman:{head:"hood",headc:"#6E5A4A",body:{type:"robe",c:"#6E5A4A",t:"#E8D5A8"},beard:"#E8EEF4",hair:"#E8EEF4"},
     oldwoman:{head:"bandana",headc:"#8C93A8",body:{type:"robe",c:"#5E4A7E",t:"#E8D5A8"},hair:"#C9D3DD",longhair:1}},
 jp:{man:{head:"none",body:{type:"robe",c:"#2C3E6B",t:"#E8D5A8"},hair:"#2B2233"},
     man2:{head:"hachigane",body:{type:"robe",c:"#5A4A3E",t:"#E8D5A8"},hair:"#2B2233",beard:"#2B2233"},
     woman:{head:"none",body:{type:"robe",c:"#B3202B",t:"#F6F1E1"},hair:"#2B2233",longhair:1},
     woman2:{head:"none",body:{type:"robe",c:"#5B4BB7",t:"#F6F1E1"},hair:"#2B2233",longhair:1},
     girl:{head:"none",body:{type:"robe",c:"#E58AB0",t:"#F6F1E1"},hair:"#2B2233",longhair:1},
     boy:{head:"none",body:{type:"robe",c:"#3E8E5A",t:"#E8D5A8"},hair:"#2B2233"},
     oldman:{head:"none",body:{type:"robe",c:"#6E6E78",t:"#E8D5A8"},beard:"#E8EEF4",hair:"#E8EEF4"},
     oldwoman:{head:"none",body:{type:"robe",c:"#5E4A7E",t:"#E8D5A8"},hair:"#C9D3DD",longhair:1}},
 sea:{man:{head:"bandana",headc:"#C0392B",body:{type:"sailor",c:"#F6F7FA",t:"#2C5D8F"},hair:"#2B2233"},
     man2:{head:"tricorn",headc:"#3A3F58",body:{type:"coat",c:"#3A3F58",t:"#C9D3DD"},hair:"#5A3A22",beard:"#5A3A22"},
     woman:{head:"bandana",headc:"#5CB8B2",body:{type:"robe",c:"#5CB8B2",t:"#F6F1E1"},hair:"#C98A3A",longhair:1},
     woman2:{head:"none",body:{type:"robe",c:"#E36D5B",t:"#F6F1E1"},hair:"#2B2233",longhair:1},
     girl:{head:"none",body:{type:"robe",c:"#E5B53B",t:"#F6F1E1"},hair:"#C98A3A",longhair:1},
     boy:{head:"bandana",headc:"#2C5D8F",body:{type:"sailor",c:"#F6F7FA",t:"#C0392B"},hair:"#5A3A22"},
     oldman:{head:"tricorn",headc:"#3A3F58",body:{type:"coat",c:"#3A3F58",t:"#C9D3DD"},beard:"#E8EEF4",hair:"#E8EEF4"},
     oldwoman:{head:"bandana",headc:"#8C93A8",body:{type:"robe",c:"#5E6E7E",t:"#F6F1E1"},hair:"#C9D3DD",longhair:1}}
};
function p74EraOf(P){if(!P)return "";if(P.hist)return "kg";return {sword:"med",king:"med",magic:"med",samurai:"jp",sea:"sea"}[P.id]||"";}
/* 背景（96×96） */
function p74EraBg(era,o){o=o||{};var s='';
  s+='<rect width="96" height="96" fill="'+(o.night?"#2E3A5C":"#CFE8F4")+'"/>';
  if(o.night)s+='<path d="M74 12a9 9 0 1 0 6 15a7 7 0 1 1-6-15z" fill="#F6F1E1"/><circle cx="20" cy="14" r="1" fill="#fff"/><circle cx="44" cy="22" r="1" fill="#fff"/>';
  if(o.sun==="low")s+='<circle cx="18" cy="56" r="10" fill="#FFB84D"/><path d="M18 40v-6M6 46l-4-4M30 46l4-4" stroke="#FFB84D" stroke-width="2.4" stroke-linecap="round"/>';
  if(o.sun==="high")s+='<circle cx="48" cy="14" r="9" fill="#FFD34D"/><path d="M48 0v2M34 14h-4M62 14h4M38 4l-3-3M58 4l3-3" stroke="#FFD34D" stroke-width="2.4" stroke-linecap="round"/>';
  if(era==="sea")s+='<path d="M0 60h96v36H0z" fill="'+(o.night?"#1F3A5C":"#4F8FD8")+'"/><path d="M0 78h96v18H0z" fill="#E8D5A8"/><path d="M10 68q5-3 10 0M60 66q5-3 10 0" stroke="#fff" stroke-width="1.4" fill="none" opacity=".8"/>';
  else{s+='<path d="M0 62l18-20 12 10 16-18 20 22 12-10 18 16v38H0z" fill="'+(o.night?"#4A5878":(era==="kg"?"#9FB7C9":"#A9C3B0"))+'"/>';
    if(era==="kg")s+='<path d="M42 38l4-4 4 6-3-1-1 2z" fill="#fff"/>';
    s+='<path d="M0 70q48-8 96 0v26H0z" fill="'+(o.night?"#35502F":"#8DBF6A")+'"/>';}
  return s;}
/* 人物を置く：x＝中心、高さ h（足もとは y=90） */
function p74EraFig(o,x,h,opt){opt=opt||{};var sc=h/160,tx=x-60*sc,ty=90-150*sc;var inner=p74Person(o);
  if(opt.flip)inner='<g transform="translate(120 0) scale(-1 1)">'+inner+'</g>';
  if(opt.bow)inner='<g transform="rotate(16 60 146)">'+inner+'</g>';
  return '<g transform="translate('+tx.toFixed(1)+' '+ty.toFixed(1)+') scale('+sc.toFixed(3)+')"'+(opt.dim?' opacity=".45"':'')+'>'+inner+'</g>'+(opt.mark?'<path d="M'+(x-5)+' '+(ty+2)+'h10l-5 7z" fill="#F5B301" stroke="#2B2233" stroke-width="1"/>':'');}
function p74R(era,role,pose){var o=JSON.parse(JSON.stringify(P74_ROLES[era][role]));if(pose)o.pose=pose;o.hand="none";o.off="none";return o;}
/* 小さな記号 */
var P74_IC={
 q:function(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="8" fill="#3B82F6"/><text x="'+x+'" y="'+(y+4.5)+'" text-anchor="middle" font-size="13" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">?</text>';},
 ok:function(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="8" fill="none" stroke="#16A34A" stroke-width="3.2"/>';},
 ng:function(x,y){return '<path d="M'+(x-7)+' '+(y-7)+'l14 14M'+(x+7)+' '+(y-7)+'l-14 14" stroke="#DC2626" stroke-width="3.4" stroke-linecap="round"/>';},
 check:function(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="8" fill="#16A34A"/><path d="M'+(x-4)+' '+y+'l3 3 5-6" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';},
 heart:function(x,y){return '<path d="M'+x+' '+(y+6)+'q-9-6-9-11a4.5 4.5 0 0 1 9-1a4.5 4.5 0 0 1 9 1q0 5-9 11z" fill="#E2483B"/>';},
 bulb:function(x,y){return '<circle cx="'+x+'" cy="'+y+'" r="6" fill="#FFD34D" stroke="#2B2233" stroke-width="1"/><rect x="'+(x-3)+'" y="'+(y+5)+'" width="6" height="4" fill="#9AA4AE"/><path d="M'+(x-10)+' '+(y-6)+'l-3-2M'+(x+10)+' '+(y-6)+'l3-2M'+x+' '+(y-10)+'v-3" stroke="#FFD34D" stroke-width="1.6" stroke-linecap="round"/>';},
 drop:function(x,y){return '<path d="M'+x+' '+(y-5)+'q5 6 0 9q-5-3 0-9z" fill="#7FC4F0"/>';},
 bubble:function(x,y,t){return '<rect x="'+(x-12)+'" y="'+(y-8)+'" width="24" height="16" rx="7" fill="#fff" stroke="#2B2233" stroke-width="1.2"/><path d="M'+(x-6)+' '+(y+7)+'l-3 5 7-5" fill="#fff" stroke="#2B2233" stroke-width="1.2"/><text x="'+x+'" y="'+(y+4)+'" text-anchor="middle" font-size="10" font-weight="800" fill="#2B2233" font-family="system-ui,sans-serif">'+t+'</text>';},
 arrow:function(x,y){return '<path d="M'+(x-8)+' '+y+'h14m-5-5 5 5-5 5" stroke="#3B82F6" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';},
 again:function(x,y){return '<path d="M'+(x+6)+' '+(y-3)+'a7 7 0 1 0 1 6" stroke="#3B82F6" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M'+(x+8)+' '+(y-9)+'v6h-6" stroke="#3B82F6" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';},
 bowl:function(x,y){return '<path d="M'+(x-8)+' '+y+'h16q-2 8-8 8t-8-8z" fill="#F4EBD8" stroke="#2B2233" stroke-width="1.2"/><path d="M'+(x-5)+' '+(y-3)+'q2-3 0-5M'+x+' '+(y-3)+'q2-3 0-5" stroke="#9AA4AE" stroke-width="1" fill="none"/>';}
};
/* 家（道ごと） */
function p74EraHouse(era,x,y,s){s=s||1;var g;
  if(era==="kg")g='<path d="M-22 22v-14q22-16 44 0v14z" fill="#F4EBD8" stroke="#2B2233" stroke-width="1.4"/><path d="M-22 8q22-22 44 0" fill="#E8DCC0" stroke="#2B2233" stroke-width="1.4"/><path d="M-19 13h38" stroke="#B3202B" stroke-width="2.6"/><path d="M-5 22v-10h10v10" fill="#8A5A2B" stroke="#2B2233" stroke-width="1.1"/><path d="M-3 -6h6l-1-3h-4z" fill="#8A5A2B"/>';
  else if(era==="jp")g='<path d="M-24 4l24-20 24 20z" fill="#C9A86A" stroke="#2B2233" stroke-width="1.4"/><path d="M-18 4h36v18h-36z" fill="#F4EBD8" stroke="#2B2233" stroke-width="1.4"/><path d="M-4 22v-12h8v12M-14 8h6v6h-6zM8 8h6v6h-6z" fill="#8A5A2B" stroke="#2B2233" stroke-width="1"/>';
  else if(era==="sea")g='<path d="M-20 2l20-14 20 14z" fill="#8A5A2B" stroke="#2B2233" stroke-width="1.4"/><path d="M-16 2h32v20h-32z" fill="#C7823E" stroke="#2B2233" stroke-width="1.4"/><path d="M-16 8h32M-16 14h32" stroke="#8A5A2B" stroke-width="1"/><path d="M-4 22v-10h8v10" fill="#5A3A22"/>';
  else g='<path d="M-22 4l22-18 22 18z" fill="#C9A86A" stroke="#2B2233" stroke-width="1.4"/><path d="M-18 4h36v18h-36z" fill="#F1E2C4" stroke="#2B2233" stroke-width="1.4"/><path d="M-18 4l10 18M18 4l-10 18" stroke="#8A5A2B" stroke-width="1.6"/><path d="M-4 22v-11h8v11" fill="#8A5A2B" stroke="#2B2233" stroke-width="1"/>';
  return '<g transform="translate('+x+' '+y+') scale('+s+')">'+g+'</g>';}
function p74EraSvg(b){return '<svg viewBox="0 0 96 96" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+b+'</svg>';}
/* 絵のキー → 描き方 */
var P74_ERA_KEYS={
 k_hello:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","wave"),28,62)+p74EraFig(p74R(e,"woman","wave"),68,60,{flip:1});},
 t_morning:function(e){return p74EraBg(e,{sun:"low"})+p74EraFig(p74R(e,"man","wave"),60,64);},
 t_day:function(e){return p74EraBg(e,{sun:"high"})+p74EraFig(p74R(e,"woman","wave"),48,64);},
 t_evening:function(e){return p74EraBg(e,{night:1})+p74EraFig(p74R(e,"man","wave"),48,64);},
 k_bye:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","wave"),26,62)+p74EraFig(p74R(e,"woman","wave"),72,52,{flip:1})+P74_IC.arrow(86,40);},
 j_thank:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman","heart"),30,58,{bow:1})+p74EraFig(p74R(e,"man","point"),66,62)+P74_IC.bowl(84,58)+P74_IC.heart(26,16);},
 w2_please:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"boy","pray"),48,62)+P74_IC.bubble(76,20,"…");},
 k_sorry:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","pray"),30,58,{bow:1})+P74_IC.drop(22,22)+p74EraFig(p74R(e,"oldman"),70,62,{flip:1});},
 w2_okay:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman","wave"),44,64)+P74_IC.check(78,24);},
 w2_yes:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man"),40,64)+P74_IC.ok(76,26);},
 w2_no:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","shrug"),40,64)+P74_IC.ng(78,26);},
 h_good:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman","both"),42,62)+P74_IC.check(78,26);},
 w2_alright:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","heart"),42,64)+P74_IC.check(78,26);},
 vb_idontknow:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","shrug"),48,64)+P74_IC.q(80,20);},
 understand:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman","point"),44,62)+P74_IC.bulb(46,16);},
 w2_dontunderstand:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"boy","shrug"),48,62)+P74_IC.q(28,18)+P74_IC.q(70,14);},
 q_repeat:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman","pray"),36,62)+'<g>'+P74_IC.bubble(74,22,"")+'</g>'+P74_IC.again(74,22);},
 q_say:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","point"),36,62)+P74_IC.bubble(74,22,"…?");},
 q_chto:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"boy","point"),26,60)+p74EraHouse(e,70,66,.7)+P74_IC.q(70,30);},
 q_kto:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman","point"),26,60)+p74EraFig(p74R(e,"man2"),72,62,{flip:1})+P74_IC.q(72,14);},
 q_gde:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","point"),30,62)+P74_IC.q(72,40);},
 /* 人・家族 */
 n_person:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man"),48,70);},
 n_people:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),18,54)+p74EraFig(p74R(e,"woman2"),40,52)+p74EraFig(p74R(e,"oldman"),60,54)+p74EraFig(p74R(e,"woman"),80,52);},
 n_man:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),48,70);},
 n_woman:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman"),48,70);},
 n_child:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"boy","wave"),48,50);},
 i_children:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"boy","wave"),30,48)+p74EraFig(p74R(e,"girl"),66,46);},
 n_boy:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"boy"),48,56);},
 n_girl:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"girl"),48,56);},
 i_family:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),22,62)+p74EraFig(p74R(e,"girl"),48,42)+p74EraFig(p74R(e,"woman"),74,60);},
 n_mom:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman"),34,64,{mark:1})+p74EraFig(p74R(e,"boy"),68,42);},
 n_dad:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),34,66,{mark:1})+p74EraFig(p74R(e,"girl"),68,42);},
 i_parents:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),22,62,{mark:1})+p74EraFig(p74R(e,"woman"),52,60,{mark:1})+p74EraFig(p74R(e,"boy"),80,40,{dim:1});},
 n_daughter:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman"),30,60,{dim:1})+p74EraFig(p74R(e,"girl"),66,46,{mark:1});},
 n_son:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),30,62,{dim:1})+p74EraFig(p74R(e,"boy"),66,46,{mark:1});},
 n_brothers:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man"),32,62)+p74EraFig(p74R(e,"boy"),68,50);},
 n_sisters:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman2"),32,60)+p74EraFig(p74R(e,"girl"),68,48);},
 n_wife:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),30,64,{dim:1})+p74EraFig(p74R(e,"woman"),66,62,{mark:1});},
 n_husband:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man2"),30,64,{mark:1})+p74EraFig(p74R(e,"woman"),66,62,{dim:1});},
 n_grandpa:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"oldman"),34,64,{mark:1})+p74EraFig(p74R(e,"boy"),70,42);},
 n_grandma:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"oldwoman"),34,62,{mark:1})+p74EraFig(p74R(e,"girl"),70,42);},
 i_friends:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"man","wave"),30,62)+p74EraFig(p74R(e,"man2","wave"),66,62,{flip:1});},
 i_friend_f:function(e){return p74EraBg(e)+p74EraFig(p74R(e,"woman2","wave"),30,60)+p74EraFig(p74R(e,"girl","wave"),66,58,{flip:1});},
 n_guest:function(e){return p74EraBg(e)+p74EraHouse(e,68,66,.9)+p74EraFig(p74R(e,"man","wave"),26,62);},
 /* 住まい */
 p_house:function(e){return p74EraBg(e)+p74EraHouse(e,48,64,1.5);},
 p_village:function(e){return p74EraBg(e)+p74EraHouse(e,24,66,.8)+p74EraHouse(e,70,62,.9)+p74EraHouse(e,48,76,.7);}
};
/* 差しかえた絵の svg（なければ null） */
var P74_ERA_CACHE={};
function p74EraArt(key,P){var e=p74EraOf(P),f=P74_ERA_KEYS[key];if(!e||!f)return null;var k=e+":"+key;if(!P74_ERA_CACHE[k])P74_ERA_CACHE[k]=p74EraSvg(f(e));return P74_ERA_CACHE[k];}
