/* ===== Phase76：マナスの道の4コマ（9話×4コマ、すべて描き下ろし） =====
   コマの下の文は、phase74_hist のマナスの本文を4つに分けて言いかえたもの（内容は本文と同じ。創作の台詞は入れない）。
   ふきだしの言葉は、場面の気持ちを表す短い言葉だけ。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="manas")P=x;});if(!P)return;
var S=function(k){return P.st[Math.max(0,Math.min(8,k))];},A=function(k){return P.al[k].o;};
var N=P74_NPC,J=m6(N.jakyp,{hand:"none"}),C=m6(N.chiyirdy,{beld:"#2B2233"}),BK=A(1),AL=m6(A(2),{braid:"#E8B923"}),KN=m6(N.kanykey,{beld:"#3A2A4A"}),CB=A(4),SAR="#D8B36A";
/* 資料：アク・クラは白っぽい灰色、アルマンベトの馬サラルは黄色みのある馬、アルマンベトは「金の三つ編み」、マナスは白い戦衣アク・オルポク、既婚女性はエレチェク＋巻きスカート（ベルデムチ） */
var listener1=m6(N.people1,{}),listener2=m6(N.people2,{off:"none"}),kid=m6(N.child,{});
var elder2=m6(N.elder,{hand:"none",body:{type:"chapan",c:"#5E4A7E",t:"#E8B923",fur:1}});
var bokmurun=m6(N.people1,{head:"tebetei",headc:"#7A1F2B",body:{type:"chapan",c:"#2C5D8F",t:"#E8B923",fur:1}});
var KO=m6(N.rival,{});
var friend=function(c,h){return {hand:"spear",off:"none",head:h||"kalpak",body:{type:"chapan",c:c,t:"#E8D5A8"},hair:"#2B2233"};};
var semChild=m6(N.child,{body:{type:"chapan",c:"#2C5D8F",t:"#E8B923"}});
P76.manas=[
 /* 序章 語り手マナスチ */
 [{t:"「マナス」は、キルギスに伝わるとても長い叙事詩（英雄の物語を語る詩）です。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.yurt(206,100,.9)+M6.P(m6(N.manaschy,{pose:"both",face:"determined"}),120,104,70)+M6.fire(120,124,1.1)+M6.P(m6(listener1,{face:"smile"}),46,132,58,{})+M6.P(m6(kid,{face:"surprise"}),78,134,44)+M6.P(m6(listener2,{face:"smile"}),174,132,56,{flip:1});}},
  {t:"本に書かれるずっと前から、語り手マナスチが、声の調子や身ぶりをまじえて語り伝えてきました。",
   d:function(){return M6.sky("night")+M6.speed(120,80,"#F2D28A")+M6.Up(m6(N.manaschy,{pose:"both",face:"laugh"}),116,18,128)+M6.note(30,40)+M6.note(206,56)+M6.bub(196,24,"いざ\n語ろう！",160,44,1);}},
  {t:"三部作をつづけて語ると、13時間ほどかかることもあるといわれます。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(listener1,{face:"surprise"}),56,132,74)+M6.P(m6(kid,{face:"sleep"}),118,134,54)+M6.zz(128,74)+M6.P(m6(listener2,{face:"joy"}),182,132,72,{flip:1})+M6.bub(186,24,"まだ\nつづく！",170,42);}},
  {t:"語り手によって細かい筋は少しずつ違います。この道では、多くの語りに共通する流れを「物語ではこう語られる」として紹介します。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.fire(60,116,.9)+M6.P(m6(N.manaschy,{pose:"point",face:"smile"}),60,104,72)+M6.dream(160,56,130,84,M6.horse(160,92,.5,"#F2EEE4",{rider:m6(S(5),{face:"determined"}),run:1})+M6.spark(110,30,.8)+M6.spark(206,36,.8));}}],
 /* 第1話 待ちのぞまれた子 */
 [{t:"ジャクプと妻のチユルドゥには、長いあいだ子どもがいませんでした。",
   d:function(){return M6.yurtIn()+M6.P(m6(J,{face:"worry"}),78,130,104)+M6.P(m6(C,{face:"sad"}),156,130,100,{flip:1})+M6.beshik(206,128,.9);}},
  {t:"二人は、子どもをさずかるように祈りつづけました。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.yurt(206,104,.8)+M6.P(m6(J,{pose:"pray",face:"sleep"}),88,130,96)+M6.P(m6(C,{pose:"pray",face:"sleep"}),146,130,92)+M6.spark(118,30,.9,"#F6F1E1")+M6.spark(60,22,.6,"#F6F1E1");}},
  {t:"すると、すばらしい息子が生まれることを知らせる夢が届きます。",
   d:function(){return M6.yurtIn(1)+M6.lie(m6(J,{face:"sleep"}),80,124,92)+M6.zz(50,80)+M6.dream(160,52,120,84,'<circle cx="160" cy="52" r="26" fill="#FFF3B0"/>'+M6.baby(160,62,1.6)+M6.spark(130,30)+M6.spark(192,34)+M6.spark(176,80,.7));}},
  {t:"やがて生まれた男の子がマナスです。小さいころから人並みはずれて強い子でした。",
   d:function(){return M6.yurtIn()+M6.P(m6(C,{pose:"carry",face:"joy"}),92,130,104)+M6.baby(94,104,1.4)+M6.P(m6(J,{pose:"both",face:"laugh"}),166,130,106)+M6.heart(124,26)+M6.spark(40,30)+M6.spark(206,26)+M6.sfx(10,104,"ぎゅっ！","#E2483B",-12);}}],
 /* 第2話 力自慢の少年 */
 [{t:"少年マナスは力が強く、元気にあふれていました。",
   d:function(){return M6.steppe("day")+M6.yurt(206,104,.8)+M6.P(m6(S(1),{pose:"hold",face:"laugh",hand:"none"}),96,132,96)+M6.rock(100,118,1.05)+M6.sfx(140,48,"よいしょ！","#E2483B",-10)+M6.lines(46,40,4,-1);}},
  {t:"まわりの大人たちは、その力におどろきます。",
   d:function(){return M6.steppe("day")+M6.speed(120,70,"#9AA4AE")+M6.Up(m6(listener1,{face:"surprise"}),64,24,118)+M6.Up(m6(J,{face:"surprise"}),170,20,122,{flip:1})+M6.bang(116,22)+M6.bang(132,30)+M6.sweat(90,40)+M6.sweat(196,36);}},
  {t:"とても小さいころから、すぐれた馬に乗れるようになったとも語られます。",
   d:function(){return M6.steppe("day")+M6.horse(150,126,.95,"#F2EEE4",{mane:"#8A6A4A"})+M6.P(m6(S(1),{pose:"reach",face:"joy",hand:"none"}),62,130,80)+M6.heart(120,40,.9)+M6.spark(170,30);}},
  {t:"遊牧の暮らしでは、馬は家族のように大切な仲間。愛馬アク・クラは、物語の中で何度も活やくします。",
   d:function(){return M6.steppe("day")+M6.lines(40,60,6,-1)+M6.horse(120,128,1.05,"#F2EEE4",{mane:"#8A6A4A",run:1,rider:m6(S(2),{face:"laugh",pose:"fist",hand:"none"})})+M6.sfx(140,40,"アク・クラ！","#2C5D8F",-6);}}],
 /* 第3話 四十人の仲間 */
 [{t:"マナスはまだ若いうちに、自分の「四十人の仲間（クルク・チョロ）」をつくります。",
   d:function(){var s=M6.steppe("day")+M6.flag(200,106,"#B3202B")+M6.flag(36,104,"#2C5D8F");var cs=["#6B8E4E","#C7823E","#2C5D8F","#7A1F2B","#5E4A7E","#3E6E4A"];for(var i=0;i<6;i++)s+=M6.P(m6(friend(cs[i]),{face:"joy",pose:"fist"}),24+i*38,108,40);
     return s+M6.P(m6(S(3),{pose:"fist",face:"laugh"}),120,136,74);}},
  {t:"仲間たちは一生マナスを助け、最後までともに戦ったと語られます。",
   d:function(){return M6.steppe("day")+M6.speed(120,70,"#F2D28A")+M6.Up(m6(CB,{face:"laugh",pose:"fist"}),70,22,120)+M6.Up(m6(friend("#7A1F2B"),{face:"joy",pose:"fist",hand:"none"}),168,30,112,{flip:1})+M6.bub(120,20,"マナスと\nともに！",96,40,1);}},
  {t:"マナスたちの大きな目的は、ばらばらになっていた部族をまとめ、一つの民にすることです。",
   d:function(){return M6.steppe("day")+M6.yurt(36,96,.7,"#2C5D8F")+M6.yurt(204,96,.7,"#3E6E4A")+M6.yurt(60,126,.7,"#C7823E")+M6.yurt(184,128,.7,"#5E4A7E")+'<path d="M50 92Q120 64 190 92M74 120Q120 96 168 120" stroke="#E8B923" stroke-width="3" stroke-dasharray="6 5" fill="none"/>'+M6.P(m6(S(3),{pose:"both",face:"determined"}),120,124,70)+M6.spark(120,18);}},
  {t:"知恵のある相談役バカイも、マナスを支えます。",
   d:function(){return M6.yurtIn()+M6.P(m6(BK,{pose:"point",face:"smile",hand:"none"}),78,130,102)+M6.P(m6(S(3),{face:"determined",look:"l"}),164,130,104,{flip:1})+M6.bub(70,22,"まず\n話し合おう",88,42);}}],
 /* 第4話 友アルマンベト */
 [{t:"アルマンベトは、もともとは別の国で育った勇者です。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.horse(120,126,.95,SAR,{mane:"#8A5A2B",rider:m6(AL,{face:"determined",hand:"none"})});}},
  {t:"長い旅のすえに、マナスのもとへやって来ます。",
   d:function(){return M6.steppe("day")+M6.yurt(206,100,.9)+M6.yurt(160,92,.6)+M6.P(m6(AL,{face:"smile",hand:"none"}),56,130,88)+M6.P(m6(S(4),{pose:"wave",face:"joy"}),176,130,92,{flip:1})+M6.bub(176,24,"よく来た！",170,40);}},
  {t:"マナスはアルマンベトを兄弟のように大切にし、アルマンベトもマナスのいちばんの友として力をつくします。",
   d:function(){return M6.steppe("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(S(4),{pose:"reach",face:"laugh"}),82,134,110)+M6.P(m6(AL,{pose:"reach",face:"laugh",hand:"none"}),158,134,110,{flip:1})+M6.heart(120,30,1.2)+M6.spark(40,26)+M6.spark(206,26);}},
  {t:"生まれた場所が違っても固い友情を結べる、という物語としても読まれています。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.grass()+M6.horse(86,124,.82,"#F2EEE4",{mane:"#8A6A4A",rider:m6(S(4),{face:"determined"})})+M6.horse(168,126,.82,SAR,{mane:"#8A5A2B",rider:m6(AL,{face:"determined"})})+M6.flag(220,120,"#B3202B");}}],
 /* 第5話 かしこいカヌケイ */
 [{t:"マナスの妻カヌケイは、かしこく、人をもてなす心をもった女性として描かれます。",
   d:function(){return M6.yurtIn()+M6.P(m6(KN,{pose:"hold",face:"smile"}),86,130,102)+M6.bowl(86,104,1.3)+M6.P(m6(listener1,{face:"joy"}),168,130,90,{flip:1})+M6.P(m6(elder2,{face:"smile"}),214,130,86,{flip:1});}},
  {t:"夫が人々をまとめる戦いにも、自分から力を貸しました。物語では、大遠征の前に四十人の仲間の帽子や服を縫ったと語られます。",
   d:function(){var k='';for(var i=0;i<3;i++)k+='<g transform="translate('+(146+i*24)+' 92) scale(.4)">'+P74_HEAD.kalpak()+'</g>';
     return M6.yurtIn()+M6.P(m6(KN,{pose:"hold",face:"determined",look:"r"}),78,130,104)+'<path d="M64 104l30-6" stroke="#9AA4AE" stroke-width="1.6"/><path d="M94 98q10 4 6 14" stroke="#B3202B" stroke-width="1.2" fill="none"/>'+
       '<g transform="translate(140 120)"><path d="M0 0h80v10H0z" fill="#8A5A2B" stroke="#2B2233"/><path d="M6 0l4-16h18l4 16zM44 0l4-16h18l4 16z" fill="#F4F1E6" stroke="#2B2233" stroke-width="1.2"/></g>'+k+M6.spark(206,40)+M6.bub(160,26,"四十人の分を\n縫いましょう",104,52);}},
  {t:"のちに、息子セメテイを守り育てるのもカヌケイです。",
   d:function(){return M6.yurtIn(1)+M6.beshik(170,128,1.2)+M6.P(m6(KN,{pose:"carry",face:"smile"}),88,130,104)+M6.baby(90,104,1.4)+M6.heart(130,40)+M6.note(200,50);}},
  {t:"物語の中で、女性の知恵と強さがたいせつにされている人物として知られています。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.Up(m6(KN,{face:"smile"}),120,14,130)+M6.spark(50,30)+M6.spark(190,40)+M6.spark(70,100,.7);}}],
 /* 第6話 コケトイの追悼の宴 */
 [{t:"長老コケトイが亡くなり、あとをついだボクムルンは、各地の部族を呼び集めます。",
   d:function(){return M6.yurtIn()+M6.P(m6(bokmurun,{face:"sad"}),80,130,100)+M6.P(m6(elder2,{face:"sad",pose:"pray"}),160,130,96,{flip:1});}},
  {t:"盛大な追悼の宴（アシ）が開かれ、遠くからも人々が集まります。",
   d:function(){var s=M6.steppe("day");for(var i=0;i<6;i++)s+=M6.yurt(20+i*40,96-(i%2)*4,.55,["#B3202B","#2C5D8F","#3E6E4A"][i%3]);return s+M6.flag(120,108,"#B3202B")+M6.horse(60,130,.6,"#8A5A3A",{mane:"#2B2233",rider:m6(listener1,{face:"joy"})})+M6.horse(180,132,.6,"#E9D9B8",{flip:1,mane:"#5A3A22",rider:m6(friend("#7A1F2B"),{face:"joy",hand:"none"})});}},
  {t:"宴では競馬などの競技が行われ、マナスも愛馬アク・クラで駆けます。",
   d:function(){return M6.steppe("day")+M6.lines(30,60,6,-1)+M6.horse(76,128,.7,"#8A5A3A",{mane:"#2B2233",run:1,rider:m6(friend("#6B8E4E"),{face:"worry",hand:"none"})})+M6.horse(160,124,.9,"#F2EEE4",{mane:"#8A6A4A",run:1,rider:m6(S(6),{face:"laugh",hand:"none"})})+M6.sfx(150,34,"はやい！","#E2483B",-8);}},
  {t:"力くらべも行われ、この宴をきっかけに人々のまとまりが強くなったともいわれます。",
   d:function(){return M6.steppe("day")+M6.yurt(206,98,.7)+M6.P(m6(CB,{pose:"reach",face:"angry",hand:"none",off:"none"}),100,132,84,{rot:12})+M6.P(m6(friend("#5E4A7E"),{pose:"reach",face:"angry",hand:"none"}),142,132,84,{flip:1,rot:-12})+M6.P(m6(listener1,{pose:"both",face:"laugh"}),34,132,62)+M6.P(m6(listener2,{pose:"both",face:"joy"}),206,134,58,{flip:1})+M6.sfx(96,40,"がんばれ！","#E2483B",-6);}}],
 /* 第7話 大遠征 */
 [{t:"宴のあと、マナスは仲間たちをひきいて大遠征に出ます。",
   d:function(){var s=M6.sky("dawn")+M6.mts()+M6.grass();for(var i=0;i<4;i++)s+=M6.horse(36+i*36,108-(i%2)*2,.42,["#8A5A3A","#E9D9B8","#5A3A22","#C7823E"][i],{rider:friend(["#6B8E4E","#C7823E","#7A1F2B","#3E6E4A"][i])});
     return s+M6.flag(196,120,"#B3202B")+M6.horse(170,130,.8,"#F2EEE4",{mane:"#8A6A4A",rider:m6(S(7),{face:"determined",olpok:1})});}},
  {t:"強敵コヌルバイとのたたかいは、よく知られた場面です。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#2B2233")+M6.Up(m6(KO,{face:"angry"}),120,12,132);}},
  {t:"叙事詩の中でも、特に長く、はげしい戦いが続く部分です。",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+M6.dust(120,120,2)+M6.P(m6(S(7),{face:"angry",pose:"run",olpok:1}),76,134,104,{rot:8})+M6.P(m6(KO,{face:"angry"}),168,134,104,{flip:1,rot:-8})+M6.sfx(104,40,"ガキン！","#F5B301",-10)+M6.spark(120,60,1.4,"#FFE36B");}},
  {t:"アルマンベトやチュバクたち仲間も、それぞれ見せ場をもって活やくします。",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+M6.P(m6(AL,{face:"determined",pose:"run"}),76,132,98,{rot:6})+M6.P(m6(CB,{face:"angry",pose:"fist"}),164,132,98,{flip:1})+M6.lines(36,70,5,-1)+M6.sfx(150,30,"いくぞ！","#F5B301",8);}}],
 /* 第8話 英雄のあとをつぐ者 */
 [{t:"多くの語りでは、マナスは遠征で深い傷を負い、そのために亡くなります。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(S(8),{face:"sad",look:"d",olpok:1}),110,134,96,{rot:-6})+M6.P(m6(BK,{face:"cry",hand:"none"}),46,132,84)+M6.P(m6(KN,{face:"cry"}),190,132,88,{flip:1});}},
  {t:"カヌケイとバカイたちは、英雄の体を人に知られない場所へ運んで葬ったと語られます。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.P(m6(BK,{face:"sad",pose:"pray"}),80,128,78)+M6.P(m6(KN,{face:"sad",pose:"pray"}),150,128,76)+M6.spark(120,24,1,"#F6F1E1")+M6.spark(40,40,.6,"#F6F1E1");}},
  {t:"けれども物語は終わりません。カヌケイは幼い息子セメテイを連れて逃れ、セメテイは守られて育ちます。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.grass()+M6.yurt(206,100,.8)+M6.P(m6(KN,{face:"determined",pose:"hold"}),92,130,104)+M6.P(m6(semChild,{face:"smile",pose:"wave"}),142,132,60)+M6.spark(40,30);}},
  {t:"そして孫セイテクの物語へと続きます。この3つをあわせて「マナス三部作」と呼びます。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+[["マナス",48],["セメテイ",120],["セイテク",192]].map(function(q,k){return '<g><rect x="'+(q[1]-34)+'" y="30" width="68" height="84" rx="6" fill="#FBF8F0" stroke="#2B2233" stroke-width="1.6"/><rect x="'+(q[1]-34)+'" y="30" width="68" height="16" rx="6" fill="'+["#B3202B","#2C5D8F","#3E6E4A"][k]+'"/><text x="'+q[1]+'" y="42" text-anchor="middle" font-size="10.5" font-weight="800" fill="#fff" font-family="system-ui,sans-serif">'+q[0]+'</text></g>'+M6.P(m6([S(8),semChild,m6(N.child,{body:{type:"chapan",c:"#3E6E4A",t:"#E8D5A8"}})][k],{face:"smile"}),q[1],110,[56,48,42][k]);}).join("");}}]
];
})();
