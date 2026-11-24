/* ===== Phase76：セメテイの道の4コマ（9話×4コマ、描き下ろし） =====
   資料で確かめた特徴：カヌケイは結婚した女性（エレチェク＋巻きスカート）、セメテイの馬タイブールルは灰色がかった馬、
   未婚の娘の帽子（ウク・トプ）は魔よけのフクロウの羽つき、アイチュレクは白鳥の姿になって飛ぶと語られる。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="semetey")P=x;});if(!P)return;
var S=function(k){return P.st[Math.max(0,Math.min(8,k))];},A=function(k){return P.al[k].o;};
var N=P74_NPC,KN=m6(N.kanykey,{beld:"#3A2A4A"}),BK=A(2),KC=A(3),TB="#9AA4AE";
var AI=m6(A(4),{head:"ukutopu",headc:"#5B4BB7",off:"none"});
var MN=null;P74_PATHS.forEach(function(x){if(x.id==="manas")MN=x;});
var manas=MN?MN.st[6]:S(6),alm=MN?m6(MN.al[2].o,{braid:"#E8B923"}):KC;
var sch1=m6(N.people1,{head:"tebetei",headc:"#3A2E5C",body:{type:"chapan",c:"#4A3A5E",t:"#C99A2E",fur:1},beard:"#2B2233"}),sch2=m6(N.people1,{head:"kalpak",body:{type:"chapan",c:"#5E3A2E",t:"#C99A2E"},beard:"#5A3A22"});
var boy=S(0),KO=m6(N.rival,{}),trait=m6(N.people1,{head:"tebetei",headc:"#2B2233",body:{type:"chapan",c:"#2B2233",t:"#6E5A4A"}});
var seitek=m6(N.child,{body:{type:"chapan",c:"#3E6E4A",t:"#E8D5A8"}}),lis1=m6(N.people1,{}),lis2=m6(N.people2,{off:"none"});
P76.semetey=[
 /* 序章 */
 [{t:"「セメテイ」は、マナス三部作の2つめの物語です。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.yurt(30,100,.8)+M6.P(m6(N.manaschy,{pose:"point",face:"smile"}),120,104,70)+M6.fire(120,124,1.1)+M6.P(m6(lis1,{face:"joy"}),190,132,58,{flip:1})+M6.P(m6(lis2,{face:"surprise"}),60,132,56);}},
  {t:"主人公は、英雄マナスと妻カヌケイの息子セメテイです。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.dream(120,64,200,104,M6.P(m6(manas,{face:"smile"}),76,108,72)+M6.P(m6(KN,{face:"smile",pose:"carry"}),158,110,70)+M6.baby(159,92,1)+M6.heart(118,38));}},
  {t:"語り手によって、筋が違うところがあります。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(N.manaschy,{pose:"point",face:"laugh"}),64,130,90)+M6.P(m6(N.elder,{pose:"both",face:"determined",hand:"none"}),176,130,90,{flip:1})+M6.bub(64,22,"こう語る！",70,40)+M6.bub(176,22,"いや、こう！",172,40);}},
  {t:"この道では、多くの紹介に共通する流れを、やさしくまとめています。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.scroll(120,62,1.6,"セメテイ")+M6.P(m6(N.child,{face:"joy",pose:"both"}),44,134,54)+M6.P(m6(lis2,{face:"smile",pose:"wave"}),200,134,58,{flip:1});}}],
 /* 第1話 母と子の旅 */
 [{t:"マナスが亡くなったあと、親族のなかには、その地位をねらう者たちがいました。",
   d:function(){return M6.yurtIn(1)+M6.gloom(120,70,70)+M6.P(m6(sch1,{face:"rival",pose:"hip"}),84,130,100)+M6.P(m6(sch2,{face:"rival",pose:"point"}),156,130,100,{flip:1})+M6.bub(120,20,"ひそひそ…",110,36);}},
  {t:"カヌケイは、幼いセメテイを守ろうと決めます。",
   d:function(){return M6.yurtIn(1)+M6.speed(120,70,"#C99A2E")+M6.Up(m6(KN,{face:"determined",pose:"carry"}),120,10,132)+M6.baby(122,118,2);}},
  {t:"息子を連れて、自分の父の国ブハラへのがれます。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.lines(40,70,5,-1)+M6.horse(126,126,1,"#8A5A3A",{run:1,mane:"#2B2233",rider:m6(KN,{face:"worry",pose:"carry"})})+M6.baby(128,98,.9);}},
  {t:"母が子どもを守りぬく、物語のはじまりの大切な場面です。",
   d:function(){return M6.sky("dawn")+M6.grass()+M6.city(160,100,1)+M6.P(m6(KN,{face:"joy",pose:"carry"}),60,130,100)+M6.baby(62,104,1.3)+M6.spark(30,30)+M6.spark(100,24,.8);}}],
 /* 第2話 何も知らない少年 */
 [{t:"セメテイは、自分が英雄マナスの息子だとは知らないまま育ちます。",
   d:function(){return M6.steppe("day")+M6.sheep(40,128,1)+M6.sheep(180,126,1.1,1)+M6.sheep(206,112,.8,1)+M6.P(m6(boy,{face:"smile",hand:"staff"}),112,132,86);}},
  {t:"ふつうの羊飼いの子として、元気に暮らしていました。",
   d:function(){return M6.steppe("day")+M6.P(m6(boy,{face:"laugh",pose:"carry",hand:"none"}),110,132,92)+M6.sheep(112,108,.8)+M6.heart(150,40)+M6.sheep(200,128,1,1);}},
  {t:"どこで生まれたかより、どう生きるかが大事。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(boy,{face:"worry",look:"u",hand:"none",pose:"chin"}),100,132,92)+M6.bub(170,30,"ぼくは\nだれだろう",130,52);}},
  {t:"そう感じさせる、静かな少年時代の場面です。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.lie(m6(boy,{face:"sleep",hand:"none"}),126,116,80)+M6.sheep(50,126,.9)+M6.sheep(196,128,.9,1)+M6.zz(80,90)+M6.spark(120,24,1,"#F6F1E1");}}],
 /* 第3話 明かされた真実 */
 [{t:"大きくなったセメテイに、母カヌケイと、相談役だったバカイが、本当のことを打ち明けます。",
   d:function(){return M6.yurtIn()+M6.P(m6(KN,{face:"determined",pose:"point"}),56,130,96)+M6.P(m6(BK,{face:"sad",hand:"none"}),112,130,94)+M6.P(m6(S(2),{face:"surprise"}),190,130,98,{flip:1});}},
  {t:"自分が英雄マナスの息子だと知り、セメテイはおどろきます。",
   d:function(){return M6.yurtIn()+M6.speed(120,70,"#F5B301")+M6.Up(m6(S(2),{face:"surprise"}),120,10,132)+M6.bang(178,24)+M6.bang(194,30);}},
  {t:"セメテイは、父の武器とよろいを受けつぎます。",
   d:function(){return M6.yurtIn()+M6.P(m6(KN,{face:"smile",pose:"hold"}),70,130,98)+'<g transform="translate(70 100)"><path d="M-14 -8h28l2 20h-32z" fill="#F4F1E6" stroke="#2B2233" stroke-width="1.4"/><path d="M-12 0h24M0 -8v20" stroke="#C9C2AE"/></g>'+M6.P(m6(S(3),{face:"determined",pose:"reach",hand:"spear"}),166,130,100,{flip:1})+M6.spark(120,40);}},
  {t:"父の馬タイブールルとともに、ふるさとへ帰る決心をします。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.grass()+M6.horse(140,126,1,TB,{mane:"#4A4A5A"})+M6.P(m6(S(3),{face:"determined",pose:"fist"}),64,132,96)+M6.spark(206,30);}}],
 /* 第4話 ふるさとタラスへ */
 [{t:"セメテイは、カヌケイとバカイといっしょに、父の地タラスへ向かいます。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.horse(56,122,.6,"#8A5A3A",{mane:"#2B2233",rider:m6(KN,{face:"smile"})})+M6.horse(116,124,.6,"#E9D9B8",{rider:m6(BK,{face:"smile",hand:"none"})})+M6.horse(184,126,.72,TB,{mane:"#4A4A5A",rider:m6(S(4),{face:"determined"})});}},
  {t:"そこでは、マナスの親族が力をにぎっていました。",
   d:function(){return M6.yurtIn()+M6.gloom(120,64,80)+M6.P(m6(sch1,{face:"laugh",pose:"hip"}),90,130,104)+M6.P(m6(sch2,{face:"laugh",pose:"toast",hand:"none"}),160,130,100,{flip:1})+M6.bowl(176,82,1);}},
  {t:"セメテイはまず、内側の争いをおさめなければなりません。",
   d:function(){return M6.yurtIn()+M6.speed(120,70,"#B3202B")+M6.P(m6(S(4),{face:"angry",pose:"point"}),72,134,112)+M6.P(m6(sch1,{face:"surprise"}),178,134,100,{flip:1})+M6.sweat(196,50);}},
  {t:"そして、人々の暮らしを取りもどしていきます。",
   d:function(){return M6.steppe("day")+M6.yurt(40,100,.7)+M6.yurt(200,98,.7,"#2C5D8F")+M6.P(m6(S(4),{face:"smile",pose:"wave"}),120,132,92)+M6.P(m6(lis1,{face:"joy",pose:"both"}),60,134,64)+M6.P(m6(lis2,{face:"joy",pose:"both"}),180,134,62,{flip:1})+M6.sheep(214,130,.8,1);}}],
 /* 第5話 友クルチョロ */
 [{t:"アルマンベトの息子クルチョロが、セメテイの仲間になります。",
   d:function(){return M6.steppe("day")+M6.P(m6(KC,{face:"smile",pose:"wave",hand:"none"}),70,132,96)+M6.P(m6(S(5),{face:"joy"}),168,132,98,{flip:1})+M6.bub(70,22,"よろしく！",76,38);}},
  {t:"父どうしが、固い友だったように――",
   d:function(){return M6.sky("dusk")+M6.dream(120,66,210,112,M6.P(m6(manas,{face:"laugh",pose:"reach"}),88,118,84)+M6.P(m6(alm,{face:"laugh",pose:"reach",hand:"none"}),152,118,84,{flip:1})+M6.heart(120,30));}},
  {t:"息子どうしも、力を合わせます。",
   d:function(){return M6.steppe("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(S(5),{face:"laugh",pose:"reach"}),88,134,108)+M6.P(m6(KC,{face:"laugh",pose:"reach",hand:"none"}),152,134,108,{flip:1})+M6.spark(40,30)+M6.spark(200,30);}},
  {t:"親から子へ受けつがれる友情が、この物語の見どころの一つです。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.grass()+M6.horse(86,124,.82,TB,{mane:"#4A4A5A",rider:m6(S(5),{face:"determined"})})+M6.horse(170,126,.82,"#D8B36A",{mane:"#8A5A2B",rider:m6(KC,{face:"determined"})});}}],
 /* 第6話 アイチュレク */
 [{t:"セメテイの妻アイチュレクは、ふしぎな力をもつ女性として語られます。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#B9A6F2")+M6.Up(m6(AI,{face:"smile"}),120,10,132)+M6.spark(40,40,1,"#B9A6F2")+M6.spark(200,30,1.2,"#B9A6F2")+M6.spark(60,100,.7,"#B9A6F2");}},
  {t:"物語では、白鳥の姿になって空を飛ぶとも語られます。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.swan(110,60,1.4)+M6.lines(64,50,4,-1)+M6.spark(170,30)+M6.spark(40,80,.7);}},
  {t:"マナスの物語のカヌケイと同じように、",
   d:function(){return M6.yurtIn()+M6.P(m6(KN,{face:"smile"}),80,130,100)+M6.P(m6(m6(AI,{head:"elechek",beld:"#2C3A6E"}),{face:"smile"}),160,130,100,{flip:1})+M6.heart(120,40);}},
  {t:"アイチュレクも、物語の中で大きな役わりを果たします。",
   d:function(){return M6.steppe("day")+M6.P(m6(m6(AI,{head:"elechek",beld:"#2C3A6E"}),{face:"determined",pose:"point"}),84,132,104)+M6.P(m6(S(6),{face:"surprise"}),170,132,100,{flip:1})+M6.bub(84,22,"いい考えが\nあります",100,40);}}],
 /* 第7話 外からの危機 */
 [{t:"国の外からも、危険がせまります。",
   d:function(){var s=M6.sky("dark")+M6.mts("dark")+M6.grass("dark");for(var i=0;i<5;i++)s+=M6.P(m6(KO,{face:"rival"}),30+i*44,104,40,{op:.7});return s+M6.flag(220,110,"#3A2E5C");}},
  {t:"父マナスと戦った強敵コヌルバイは、セメテイの時代になっても人々をおびやかします。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#2B2233")+M6.Up(m6(KO,{face:"angry"}),120,10,132)+M6.sfx(170,40,"ゴゴゴ","#B9A6F2",0);}},
  {t:"さらに、思いがけない人の裏切りもありました。",
   d:function(){return M6.yurtIn(1)+M6.gloom(176,80,50)+M6.P(m6(trait,{face:"rival",look:"l"}),176,130,98,{flip:1})+M6.P(m6(S(7),{face:"surprise"}),68,130,100)+M6.bang(96,30);}},
  {t:"セメテイは、難しい戦いを続けることになります。",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+M6.lines(30,70,5,-1)+M6.P(m6(S(7),{face:"angry",pose:"run"}),88,134,104,{rot:8})+M6.P(m6(KC,{face:"determined",pose:"run"}),164,134,96,{rot:8})+M6.sfx(140,34,"負けない！","#F5B301",-6);}}],
 /* 第8話 次の世代へ */
 [{t:"物語の終わり方は、語り手によって違います。",
   d:function(){return M6.sky("day")+'<path d="M120 0v140" stroke="#2B2233" stroke-width="3"/>'+M6.scroll(60,70,1.2,"ある版")+M6.scroll(180,70,1.2,"別の版")+M6.bang(120,14);}},
  {t:"ふしぎな形で姿を消すと語る版もあれば、国を去らなければならなくなると語る版もあります。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(S(8),{face:"smile"}),70,132,92,{op:.45})+M6.spark(50,50)+M6.spark(90,40,.7)+M6.horse(180,126,.7,TB,{mane:"#4A4A5A",flip:1,rider:m6(S(8),{face:"sad"})});}},
  {t:"そのまえにセメテイは、幼い息子セイテクを、信頼できる人たちに託します。",
   d:function(){return M6.yurtIn()+M6.P(m6(S(8),{face:"sad",pose:"carry"}),70,130,104)+M6.baby(72,104,1.3)+M6.P(m6(N.elder,{face:"determined",pose:"carry",hand:"none"}),170,130,100,{flip:1});}},
  {t:"物語は、三部作の最後「セイテク」へと続きます。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#F2D28A")+M6.P(m6(seitek,{face:"laugh",pose:"fist"}),120,132,86)+M6.scroll(46,50,.9,"セイテク")+M6.spark(200,30);}}]
];
})();
