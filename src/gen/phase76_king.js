/* ===== Phase76：王の道の4コマ（9話×4コマ、描き下ろし） =====
   この道の物語（P74_TALES.king）はこのアプリのオリジナル。人物・町・城もすべてオリジナルの絵。
   主人公の服装は話ごとの成長（P.st）にそろえる：農民 → 村の旗 → 町のかぎ → 髪かざり → 冠 → 大王の冠。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="king")P=x;});if(!P)return;
var S=function(k){return m6(P.st[Math.max(0,Math.min(8,k))],{});},A=function(k){return m6(P.al[k].o,{});};
var N=P74_NPC,AN=A(0),BO=A(1),NA=A(2),GR=A(4),FOX="an:fox:#E0803A";
var p1=m6(N.people1,{head:"straw",body:{type:"tunic",c:"#6B8E4E",patch:1}}),p2=m6(N.people2,{off:"none",body:{type:"tunic",c:"#C7823E"}}),eld=m6(N.elder,{hand:"staff",head:"none",body:{type:"tunic",c:"#7A5A3A"}});
var kn=m6(N.baronsol,{off:"none",hand:"none"});
/* この道だけで使う背景：村・町・市場・川と橋・城・手紙 */
var house=function(x,y,s,c){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-16" y="-20" width="32" height="20" fill="'+(c||"#E8D5A8")+'" stroke="#2B2233" stroke-width="1.2"/><path d="M-20-20l20-16 20 16z" fill="#B3202B" stroke="#2B2233" stroke-width="1.2"/><rect x="-4" y="-12" width="8" height="12" fill="#7A4E26"/></g>';};
var village=function(){return house(40,108,1)+house(84,104,.8,"#F2E2BE")+house(200,108,1.1);};
var town=function(){return house(26,104,1.1)+house(66,100,1,"#C9D3DD")+house(110,98,1.2,"#F2E2BE")+house(156,100,1)+house(200,104,1.2,"#C9D3DD");};
var stall=function(x,y,c){return '<g transform="translate('+x+' '+y+')"><rect x="-22" y="-16" width="44" height="16" fill="#C99A2E" stroke="#2B2233" stroke-width="1.2"/><path d="M-26-30h52l-4 14h-44z" fill="'+(c||"#E2483B")+'" stroke="#2B2233" stroke-width="1.2"/><path d="M-26-30h52" stroke="#fff" stroke-width="2" stroke-dasharray="6 6"/><circle cx="-10" cy="-20" r="4" fill="#E0603A"/><circle cx="0" cy="-20" r="4" fill="#5BAE6B"/><circle cx="10" cy="-20" r="4" fill="#F5B301"/></g>';};
var river=function(flood){return '<path d="M0 '+(flood?92:104)+'q60-8 120 0t120 0v'+(flood?48:36)+'H0z" fill="#4F8FB8"/><path d="M20 112q14-6 28 0M110 122q14-6 28 0M180 110q14-6 28 0" stroke="#BFE3F2" stroke-width="2" fill="none"/>'+(flood?'<path d="M10 96q10-10 20 0t20 0M150 94q10-10 20 0t20 0" stroke="#fff" stroke-width="3" fill="none"/>':'');};
var bridge='<path d="M40 104q80-44 160 0" stroke="#8A5A2B" stroke-width="8" fill="none"/><path d="M60 92v14M90 80v26M120 76v30M150 80v26M180 92v14" stroke="#6E4A22" stroke-width="3"/>';
var castle=function(x,y,s,dark){var c=dark?"#3A3F58":"#E8D5A8";return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-40" y="-40" width="80" height="40" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><rect x="-52" y="-62" width="22" height="62" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><rect x="30" y="-62" width="22" height="62" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><path d="M-54-62l13-16 13 16zM28-62l13-16 13 16z" fill="#B8860B" stroke="#2B2233" stroke-width="1.4"/><path d="M-10 0v-18q10-12 20 0v18z" fill="#7A4E26"/><path d="M0-40v-20" stroke="#2B2233" stroke-width="1.4"/><path d="M0-60h14l-4 5 4 5H0" fill="#B3202B"/></g>';};
var letter=function(x,y,s,c){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-30" y="-20" width="60" height="40" fill="'+(c||"#F5D76E")+'" stroke="#8A6A2A" stroke-width="2"/><path d="M-30-20l30 22 30-22" stroke="#8A6A2A" stroke-width="2" fill="none"/><circle cy="4" r="7" fill="#B3202B"/></g>';};
var coins=function(x,y){return '<g fill="#F5B301" stroke="#8A6A2A" stroke-width="1"><ellipse cx="'+x+'" cy="'+y+'" rx="8" ry="3"/><ellipse cx="'+x+'" cy="'+(y-4)+'" rx="8" ry="3"/><ellipse cx="'+(x+12)+'" cy="'+y+'" rx="8" ry="3"/></g>';};
var bolt=function(x,y,s){return '<path transform="translate('+x+' '+y+') scale('+(s||1)+')" d="M0 0l-10 22h8l-8 22 22-30h-9l9-14z" fill="#FFD34D" stroke="#2B2233" stroke-width="1.2"/>';};
var road='<path d="M0 124q120-30 240 0" stroke="#C9B48A" stroke-width="12" fill="none"/>';
var hall='<rect width="240" height="140" fill="#F2E2BE"/><path d="M0 108h240v32H0z" fill="#7A1F2B"/><path d="M30 0v108M210 0v108" stroke="#C99A2E" stroke-width="10"/>';
P76.king=[
 /* 序章 足りない冬じたく */
 [{t:"小さな村は、冬をこすための食べ物が足りません。",
   d:function(){return M6.sky("dusk")+M6.grass("dusk")+village()+M6.P(m6(p1,{face:"worry"}),130,132,80)+M6.P(m6(p2,{face:"sad"}),180,132,76,{flip:1})+'<path d="M120 118l8-4" stroke="#8A5A2B" stroke-width="2"/>'+M6.sfx(46,40,"からっぽ…","#5A3A22",-4);}},
  {t:"村人たちは、まじめな農民のあなたに「世話役になってくれ」とたのみました。",
   d:function(){return M6.sky("day")+M6.grass()+village()+M6.P(m6(eld,{face:"smile",pose:"reach"}),70,132,92)+M6.P(m6(S(0),{face:"surprise"}),170,132,90,{flip:1})+M6.bub(68,22,"世話役に\nなってくれ",84,40);}},
  {t:"あなたは、うなずきました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.Up(m6(S(0),{face:"determined",off:"none"}),120,12,128)+M6.spark(40,40)+M6.spark(200,36);}},
  {t:"そのころ村には、税を二倍にするという知らせが届いていました。",
   d:function(){return M6.sky("dark")+M6.grass("dark")+village()+M6.P(m6(N.taxman,{face:"rival"}),160,132,96,{flip:1})+M6.P(m6(S(0),{face:"surprise"}),60,132,86)+M6.sfx(150,26,"税は2倍！","#E2483B",-4);}}],
 /* 第1話 欲ばり地主 */
 [{t:"畑を独りじめしていたのは、欲ばり地主でした。",
   d:function(){return M6.sky("day")+M6.grass()+'<path d="M60 112h180" stroke="#8A5A2B" stroke-width="3" stroke-dasharray="2 10"/>'+M6.P(m6(N.landlord,{face:"laugh"}),160,132,100,{flip:1})+coins(206,128)+M6.P(m6(S(1),{face:"angry"}),50,132,84);}},
  {t:"村の話し合いで、地主を退けました。",
   d:function(){return M6.sky("day")+M6.grass()+M6.P(m6(p1,{face:"angry",pose:"point"}),30,132,66)+M6.P(m6(S(1),{face:"determined",pose:"point"}),84,132,80)+M6.P(m6(p2,{face:"angry",pose:"point"}),134,132,64)+M6.P(m6(N.landlord,{face:"cry",pose:"run"}),206,132,82,{flip:1})+M6.sweat(220,60);}},
  {t:"帳簿にくわしいアンナが「数字はうそをつかない」と言って、大臣役を引き受けてくれます。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#C9D3DD")+M6.Up(m6(AN,{face:"smile"}),120,14,126)+M6.bub(56,26,"数字はうそを\nつかない",94,50);}},
  {t:"畑はみんなで分けられ、村は冬をこせました。",
   d:function(){return M6.sky("day")+M6.grass()+village()+M6.P(m6(p1,{face:"laugh",pose:"both"}),40,132,66)+M6.P(m6(S(1),{face:"laugh"}),100,132,80)+M6.P(m6(AN,{face:"joy"}),156,132,78,{flip:1})+M6.P(m6(p2,{face:"joy",pose:"heart"}),208,132,64,{flip:1})+M6.heart(130,40);}}],
 /* 第2話 あばれ川 */
 [{t:"春、あばれ川の大水が村をおそいます。",
   d:function(){return M6.sky("dark")+village()+river(1)+M6.P(m6(S(2),{face:"surprise"}),120,130,72)+M6.sfx(40,40,"ザザーッ","#4F8FB8",-6);}},
  {t:"みんなで堤防をつくりました。力仕事をまとめたのは、元兵士のボリスです。",
   d:function(){return M6.sky("day")+'<path d="M0 104h240v36H0z" fill="#8C7A68"/>'+M6.P(m6(BO,{face:"determined",pose:"point"}),60,132,96)+M6.P(m6(p1,{face:"determined",pose:"carry"}),140,132,70)+M6.P(m6(S(2),{face:"determined",pose:"carry"}),196,132,78,{flip:1})+M6.sweat(210,52);}},
  {t:"大きな橋もかかりました。ボリスは将軍として仲間になります。",
   d:function(){return M6.sky("day")+river()+bridge+M6.P(m6(BO,{face:"laugh",pose:"wave"}),40,132,82)+M6.P(m6(S(2),{face:"laugh",pose:"wave"}),204,132,80,{flip:1})+M6.spark(120,40);}},
  {t:"橋ができると人が集まり、村は町になりました。",
   d:function(){return M6.sky("day")+M6.grass()+town()+stall(60,128)+stall(180,128,"#2C5D8F")+M6.P(m6(S(2),{face:"joy"}),120,134,74)+M6.sfx(120,24,"町になった！","#B8860B",0);}}],
 /* 第3話 金の手紙 */
 [{t:"街道の盗賊団があらわれましたが、みんなで退けました。",
   d:function(){return M6.sky("day")+M6.mts()+road+M6.P(m6(N.roadchief,{face:"angry"}),180,134,96,{flip:1})+M6.P(m6(BO,{face:"determined"}),60,134,94)+M6.bang(124,50);}},
  {t:"市場はますますにぎわいます。",
   d:function(){return M6.sky("day")+M6.grass()+town()+stall(50,128)+stall(120,128,"#5BAE6B")+stall(190,128,"#2C5D8F")+M6.P(m6(p2,{face:"laugh"}),88,136,50)+M6.P(m6(p1,{face:"joy"}),160,136,52,{flip:1})+M6.note(30,40)+M6.note(220,36);}},
  {t:"そんなある日、となりの領地の金の男爵ゾーロトから、金色の手紙が届きました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F5D76E")+letter(120,70,1.8)+M6.spark(50,30,1.2)+M6.spark(196,36,1.2);}},
  {t:"「その町を、わたしに売りなさい」",
   d:function(){return M6.sky("dusk")+M6.dream(160,60,140,96,M6.P(m6(N.zoloto,{face:"laugh"}),160,104,80))+M6.P(m6(S(3),{face:"angry"}),50,134,86)+M6.bub(160,16,"町を売りなさい",160,30);}}],
 /* 第4話 お金の戦い */
 [{t:"男爵の大商人ジェーニギは、物の値段を上げて市場を乗っとろうとしました。",
   d:function(){return M6.sky("day")+M6.grass()+town()+stall(60,128)+M6.P(m6(N.guild,{face:"laugh",pose:"point"}),168,134,96,{flip:1})+M6.sfx(60,40,"値上げ！","#E2483B",-6);}},
  {t:"町の人たちは、こまってしまいます。",
   d:function(){return M6.sky("dark")+M6.grass("dark")+M6.P(m6(p1,{face:"worry"}),60,132,86)+M6.P(m6(S(4),{face:"worry"}),126,132,90)+M6.P(m6(p2,{face:"sad"}),190,132,82,{flip:1})+M6.sweat(140,40);}},
  {t:"料理長のナースチャが、安くておいしい料理で町の祭りを開き、人々を集めます。",
   d:function(){return M6.sky("day")+M6.grass()+town()+M6.P(m6(NA,{face:"laugh",pose:"carry"}),80,132,92)+M6.bowl(130,96,1.2)+M6.P(m6(p1,{face:"laugh"}),176,132,70,{flip:1})+M6.P(m6(p2,{face:"joy"}),216,132,66,{flip:1})+M6.heart(170,40);}},
  {t:"ジェーニギは負けを認め、帰っていきました。ナースチャも仲間になりました。",
   d:function(){return M6.sky("dusk")+road+M6.P(m6(N.guild,{face:"sad"}),196,132,74,{flip:1})+M6.P(m6(NA,{face:"joy",pose:"wave"}),50,132,86)+M6.P(m6(S(4),{face:"smile",pose:"wave"}),110,132,90);}}],
 /* 第5話 国境の騎士 */
 [{t:"国境をこえて、男爵の騎士隊がやってきました。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(N.baronsol,{face:"rival"}),130,132,80,{flip:1})+M6.P(m6(N.baroncap,{face:"rival"}),180,132,96,{flip:1})+M6.P(m6(N.baronsol,{face:"rival"}),226,132,80,{flip:1})+M6.P(m6(S(5),{face:"surprise"}),40,132,84);}},
  {t:"ボリスの守りで、騎士隊を退けました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#C9D3DD")+M6.P(m6(BO,{face:"determined",pose:"fist"}),110,134,116)+M6.sfx(184,40,"守れ！","#E2483B",-6);}},
  {t:"あなたは辺境伯としてみとめられます。",
   d:function(){return hall+M6.P(m6(S(5),{face:"joy"}),120,130,100)+M6.P(m6(AN,{face:"laugh",pose:"both"}),44,130,80)+M6.P(m6(BO,{face:"laugh"}),196,130,86,{flip:1})+M6.spark(80,30)+M6.spark(160,30);}},
  {t:"つかまえた騎士がつぶやきました。「男爵さまも、本当は命令されているだけなんだ」",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#6E5A62")+M6.Up(m6(kn,{face:"sad"}),120,16,124)+M6.bub(56,28,"命令されて\nいるだけ",90,50);}}],
 /* 第6話 金の男爵 */
 [{t:"金の男爵ゾーロトとの対決です。",
   d:function(){return M6.sky("day")+castle(190,104,.8)+M6.grass()+M6.P(m6(N.zoloto,{face:"rival"}),170,132,98,{flip:1})+M6.P(m6(S(6),{face:"determined"}),56,132,94)+M6.spark(116,66,1.3,"#F5B301");}},
  {t:"退けられた男爵は、手紙のたばを見せました。差出人は、王国の宰相テーニ。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#9A6BD6")+letter(90,74,1.2,"#C9C3D9")+letter(150,64,1.2,"#C9C3D9")+M6.sfx(120,24,"宰相テーニ","#3A2E5C",0);}},
  {t:"かしこいキツネのリサが、手紙のうそを見やぶり、仲間になりました。",
   d:function(){return M6.sky("day")+M6.grass()+letter(150,90,.8,"#C9C3D9")+M6.P(FOX,110,134,68)+M6.P(m6(S(6),{face:"surprise"}),200,132,90,{flip:1})+M6.sfx(56,40,"うそだ！","#E0803A",-6);}},
  {t:"宰相は、国を二つに分けて自分のものにしようとしていたのです。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#3A2E5C")+M6.Up(m6(N.teni,{face:"rival"}),120,14,126)+M6.sfx(30,116,"たくらみ","#C9A8FF",-6);}}],
 /* 第7話 雷の夜 */
 [{t:"宰相が呼んだ雷の大ワシが、都をおそいます。",
   d:function(){return M6.sky("night")+castle(60,110,.8,1)+bolt(200,10)+M6.P("b:6",160,128,104)+M6.sfx(40,30,"ゴロゴロ","#FFE066",-8);}},
  {t:"アンナとボリスと力を合わせ、都を守りぬきました。",
   d:function(){return M6.sky("dawn")+castle(120,96,.8)+M6.grass()+M6.P(m6(AN,{face:"laugh",pose:"fist"}),50,134,82)+M6.P(m6(S(7),{face:"laugh",pose:"fist"}),120,134,90)+M6.P(m6(BO,{face:"laugh",pose:"fist"}),190,134,86,{flip:1});}},
  {t:"人々は、あなたを王にえらびました。",
   d:function(){return hall+M6.speed(120,70,"#FFE7A8")+M6.Up(m6(S(7),{face:"joy"}),120,12,128)+M6.spark(40,40,1.3)+M6.spark(200,40,1.3);}},
  {t:"しかし宰相テーニは姿を消し、「影の兵」を集めているといううわさが広がります。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.P(m6(N.shadowsol,{}),150,132,76,{op:.7})+M6.P(m6(N.shadowsol,{}),196,132,76,{op:.7})+M6.P(m6(N.teni,{face:"rival"}),70,132,92)+M6.sfx(150,30,"ヒソヒソ","#C9A8FF",-6);}}],
 /* 最終回 大いなる治世 */
 [{t:"影の宰相テーニを退け、国は一つにまとまりました。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#FFE7A8")+M6.P(m6(S(8),{face:"determined",pose:"reach"}),90,134,110)+M6.P(m6(N.teni,{face:"cry"}),206,134,70,{flip:1,op:.8})+M6.sfx(176,30,"くっ…","#3A2E5C",0);}},
  {t:"金の男爵ゾーロトとも、平和の約束を結びます。",
   d:function(){return hall+M6.P(m6(N.zoloto2,{face:"smile",pose:"reach"}),80,130,94)+M6.P(m6(S(8),{face:"smile",pose:"reach"}),164,130,96,{flip:1})+M6.heart(122,36);}},
  {t:"旅の商人グリーシャが仲間になり、七つの町を結ぶ道ができました。",
   d:function(){return M6.sky("day")+road+house(30,110,.8)+house(110,100,.7,"#C9D3DD")+house(210,108,.8,"#F2E2BE")+M6.P(m6(GR,{face:"laugh",pose:"point"}),150,134,84,{flip:1})+M6.P(FOX,70,134,46);}},
  {t:"小さな村の世話役だったあなたは、人々にしたわれる大王になったのです。",
   d:function(){return M6.sky("day")+castle(120,92,.7)+M6.grass()+M6.P(m6(AN,{face:"laugh"}),26,134,64)+M6.P(m6(BO,{face:"laugh"}),66,134,68)+M6.P(m6(S(8),{face:"laugh",pose:"wave"}),120,134,82)+M6.P(m6(NA,{face:"joy"}),172,134,62,{flip:1})+M6.P(m6(GR,{face:"laugh"}),214,134,64,{flip:1})+M6.spark(90,24)+M6.spark(150,24);}}]
];
})();
