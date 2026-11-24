/* ===== Phase76：魔法の道の4コマ（9話×4コマ、描き下ろし） =====
   この道の物語（P74_TALES.magic）はこのアプリのオリジナル。人物・動物・塔もすべてオリジナルの絵。
   主人公の服装は話ごとの成長（P.st）にそろえる：薬草つみ → 弟子のフード → とんがり帽子 → 星の帽子 → 賢者の帽子。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="magic")P=x;});if(!P)return;
var S=function(k){return m6(P.st[Math.max(0,Math.min(8,k))],{});};
var N=P74_NPC,PA=m6(P.al[1].o,{}),LI=m6(P.al[2].o,{});
var CAT="an:cat:#3A3F58",OWL="an:owl:#9A7B5A",WOLF="an:wolf:#C9D3DD";
var kid1=m6(N.child,{head:"none",body:{type:"tunic",c:"#5CB8B2"},hair:"#C98A3A"}),kid2=m6(N.child,{head:"none",body:{type:"tunic",c:"#E0603A"},hair:"#2B2233",longhair:1});
/* この道だけで使う背景：森（色つき／灰色）・魔導書・塔・学校・光の玉 */
var tree=function(x,y,s,c){c=c||"#3E7A4A";return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-3" y="-14" width="6" height="16" fill="'+(c==="#9A9AA8"?"#6E6E78":"#6E4A22")+'"/><circle cy="-28" r="18" fill="'+c+'"/><circle cx="-12" cy="-20" r="12" fill="'+c+'"/><circle cx="12" cy="-20" r="12" fill="'+c+'" opacity=".9"/></g>';};
var forest=function(c){return tree(22,104,1.1,c)+tree(66,98,.8,c)+tree(178,100,.9,c)+tree(224,106,1.2,c);};
var gray='<rect width="240" height="140" fill="#8C8C96" opacity=".35"/>';
var book=function(x,y,s,glow){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')">'+(glow?'<circle r="34" fill="#FFE7A8" opacity=".55"/>':'')+'<path d="M-30-14q15-6 30 2q15-8 30-2v30q-15-6-30 2q-15-8-30-2z" fill="#F6F1E1" stroke="#5A3A22" stroke-width="2"/><path d="M0-12v30" stroke="#5A3A22" stroke-width="1.6"/><path d="M-24-4h18M-24 2h18M6-4h18" stroke="#B9A6F2" stroke-width="1.6"/><path d="M6 4h18" stroke="#F5B301" stroke-width="3" stroke-linecap="round"/></g>';};
var tower=function(x,y,s,c){c=c||"#8C93A8";return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><path d="M-16 0l4-80h24l4 80z" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><path d="M-18-80l18-30 18 30z" fill="#5B4BB7" stroke="#2B2233" stroke-width="1.4"/><rect x="-4" y="-64" width="8" height="12" rx="4" fill="#FFE066"/><rect x="-4" y="-34" width="8" height="12" rx="4" fill="#2B2233"/><path d="M0-110l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z" fill="#FFD34D"/></g>';};
var school=function(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-50" y="-36" width="100" height="36" fill="#E8D5A8" stroke="#2B2233" stroke-width="1.4"/><path d="M-56-36l56-26 56 26z" fill="#5B4BB7" stroke="#2B2233" stroke-width="1.4"/><path d="M-10 0v-20q10-10 20 0v20z" fill="#7A4E26"/><rect x="-40" y="-28" width="12" height="12" rx="6" fill="#8FD3F4"/><rect x="28" y="-28" width="12" height="12" rx="6" fill="#8FD3F4"/><circle cy="-46" r="6" fill="#FFD34D" stroke="#2B2233" stroke-width="1"/></g>';};
var orb=function(x,y,r,dim){return '<g><circle cx="'+x+'" cy="'+y+'" r="'+(r*1.8)+'" fill="'+(dim?"#9A9AA8":"#FFE7A8")+'" opacity=".45"/><circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="'+(dim?"#C9C9D3":"#FFF7D6")+'" stroke="'+(dim?"#6E6E78":"#F5B301")+'" stroke-width="2"/><circle cx="'+(x-r*.35)+'" cy="'+(y-r*.35)+'" r="'+(r*.25)+'" fill="#fff"/></g>';};
var snow=function(n){var s="";for(var k=0;k<(n||24);k++){s+='<circle cx="'+((k*53)%240)+'" cy="'+((k*37)%130+4)+'" r="'+(1+(k%3)*.6)+'" fill="#fff" opacity=".9"/>';}return s;};
var snowGround='<path d="M0 104q60-8 120 0t120 0v36H0z" fill="#E8EEF4"/><path d="M0 116q70-6 130 2t110-2v24H0z" fill="#D6E0EA"/>';
var lava='<path d="M0 100l60-64 30 26 30-40 50 50 30-20 40 48v40H0z" fill="#6E3A2E"/><path d="M120 22l-10 20h20z" fill="#E0603A"/><path d="M0 112q60-6 120 0t120 0v28H0z" fill="#5A3A2E"/><path d="M40 120q20-4 40 0M150 124q20-4 40 0" stroke="#E0603A" stroke-width="3" fill="none"/>';
var bolt=function(x,y,s){return '<path transform="translate('+x+' '+y+') scale('+(s||1)+')" d="M0 0l-10 22h8l-8 22 22-30h-9l9-14z" fill="#FFD34D" stroke="#2B2233" stroke-width="1.2"/>';};
var shelves='<rect width="240" height="140" fill="#4A3A2E"/>'+[20,56,92].map(function(y){return '<rect x="0" y="'+y+'" width="240" height="4" fill="#2B2233"/>'+[0,1,2,3,4,5,6,7,8,9,10,11,12,13].map(function(k){var c=["#7A1F2B","#2C5D8F","#3E6E4A","#C99A2E","#5B4BB7"][k%5];return '<rect x="'+(6+k*17)+'" y="'+(y-22+(k%3)*2)+'" width="13" height="'+(22-(k%3)*2)+'" fill="'+c+'"/>';}).join("");}).join("")+'<path d="M0 108h240v32H0z" fill="#6E4A22"/>';
P76.magic=[
 /* 序章 光る魔導書 */
 [{t:"薬草をつみに入った森で、古い魔導書を見つけました。",
   d:function(){return M6.sky("dusk")+forest()+M6.grass("dusk")+M6.P(m6(S(0),{face:"surprise",look:"d"}),80,132,90)+book(170,116,.8)+M6.spark(170,94);}},
  {t:"本はひとりでに開き、一行だけ光ります。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#5B4BB7")+book(120,74,2.2,1)+M6.sfx(40,40,"パラパラ","#FFE066",-8)+M6.spark(200,40,1.3);}},
  {t:"「灰が来る。光を守れ」",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#3A3478")+M6.Up(m6(S(0),{face:"worry",off:"none"}),120,14,126)+M6.bub(58,28,"灰が来る。\n光を守れ",96,50);}},
  {t:"その夜から、森の色が少しずつ灰色に変わりはじめました。",
   d:function(){return M6.sky("dark")+forest("#9A9AA8")+M6.grass("dark")+gray+M6.P(m6(S(0),{face:"sad"}),120,132,84)+M6.sweat(140,46);}}],
 /* 第1話 灰色の森 */
 [{t:"灰色の森で、灰をまとった番人が立ちはだかります。",
   d:function(){return M6.sky("dark")+forest("#9A9AA8")+M6.grass("dark")+M6.P("b:0",170,134,110)+M6.P(m6(S(1),{face:"determined"}),56,134,84);}},
  {t:"魔導書をかかげて、番人を封じました。",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#FFE7A8")+M6.P(m6(S(1),{face:"determined",pose:"reach"}),90,134,108)+book(184,56,1,1)+M6.sfx(170,110,"ピカッ","#F5B301",-6);}},
  {t:"森に少し色がもどり、黒ネコのコーシカがついて来ます。使い魔として仲間になりました。",
   d:function(){return M6.sky("day")+forest()+M6.grass()+M6.P(m6(S(1),{face:"joy",look:"d"}),90,132,90)+M6.P(CAT,170,134,56,{flip:1})+M6.heart(176,60);}},
  {t:"魔導書の次のページには、魔法学校の地図がかかれていました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+book(80,74,1.6)+school(180,100,.9)+M6.sfx(140,30,"！","#E2483B",0);}}],
 /* 第2話 兄弟子 */
 [{t:"魔法学校の試験は、兄弟子ズヴェズダーとの決闘です。",
   d:function(){return M6.sky("day")+school(120,88,1.1)+M6.grass()+M6.P(m6(S(2),{face:"worry"}),44,134,86)+M6.P(m6(N.zvezda,{face:"rival"}),196,134,92,{flip:1});}},
  {t:"二つの魔法がぶつかり、勝ったのはあなたでした。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#B9A6F2")+M6.P(m6(S(2),{face:"determined",pose:"reach"}),60,134,96)+M6.bang(124,60)+M6.P(m6(N.zvezda,{face:"surprise"}),200,134,86,{flip:1,rot:10});}},
  {t:"見習い神官のパーシャが「すごい！」と仲間になります。",
   d:function(){return M6.sky("day")+M6.grass()+M6.P(m6(PA,{face:"laugh",pose:"both"}),164,132,92,{flip:1})+M6.P(m6(S(2),{face:"smile"}),70,132,90)+M6.bub(164,24,"すごい！",156,40,1);}},
  {t:"負けたズヴェズダーは言い残して去りました。「もっと力がほしい。灰の魔導士なら、それをくれる」",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#9A9AA8")+M6.Up(m6(N.zvezda,{face:"angry",look:"d"}),120,16,124)+M6.bub(56,28,"もっと\n力がほしい",90,50);}}],
 /* 第3話 石の塔 */
 [{t:"古い塔を、石の巨人が守っていました。",
   d:function(){return M6.sky("day")+M6.mts()+tower(190,128,1)+M6.grass()+M6.P("b:1",110,134,104)+M6.P(m6(S(3),{face:"surprise"}),30,134,66);}},
  {t:"パーシャと力を合わせて、巨人を封じました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(PA,{face:"determined",pose:"reach"}),56,134,88)+M6.P(m6(S(3),{face:"determined",pose:"reach"}),150,134,96)+M6.spark(210,60,1.4,"#B9A6F2")+M6.sfx(166,30,"えいっ","#5B4BB7",-6);}},
  {t:"塔の書庫には、古い記録がならんでいます。",
   d:function(){return shelves+M6.P(m6(S(3),{face:"surprise",look:"u"}),90,134,96)+M6.P(CAT,170,136,50,{flip:1})+M6.spark(140,30);}},
  {t:"記録には灰の魔導士ペーペルの名前。「光をひとりじめにすれば、だれにも負けない」と考えた魔法使いでした。",
   d:function(){return shelves+M6.dream(120,60,200,96,M6.P(m6(N.pepel,{face:"rival"}),90,104,72)+orb(160,64,12))+M6.P(m6(S(3),{face:"worry"}),40,138,60);}}],
 /* 第4話 吹雪の谷 */
 [{t:"吹雪の谷で、大ジカが道をふさいでいました。",
   d:function(){return M6.sky("dark")+snowGround+M6.P("b:3",150,134,110)+M6.P(m6(S(4),{face:"worry"}),48,134,80)+snow(30);}},
  {t:"大ジカを封じると、森の弓使いリーパが仲間になりました。",
   d:function(){return M6.sky("day")+snowGround+M6.P(m6(LI,{face:"laugh",pose:"wave"}),164,132,88,{flip:1})+M6.P(m6(S(4),{face:"joy",pose:"wave"}),70,132,90)+M6.heart(118,40)+snow(12);}},
  {t:"谷の奥で見たのは、灰色のローブを着たズヴェズダー。",
   d:function(){return M6.sky("dark")+snowGround+gray+M6.P(m6(N.zvezda2,{face:"sad"}),170,134,96,{flip:1})+M6.P(m6(S(4),{face:"surprise"}),60,134,88)+M6.bang(84,30)+snow(20);}},
  {t:"目から光が消え、灰の力に苦しんでいるようでした。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#6E6E78")+M6.Up(m6(N.zvezda2,{face:"cry"}),120,14,126)+snow(16);}}],
 /* 第5話 灰にのまれた兄弟子 */
 [{t:"灰の力にのまれたズヴェズダーが、おそいかかってきます。",
   d:function(){return M6.sky("dark")+M6.grass("dark")+M6.P(m6(N.zvezda2,{face:"angry",pose:"reach"}),170,134,100,{flip:1})+M6.P(m6(S(5),{face:"determined"}),56,134,90)+M6.dust(120,90,1.4);}},
  {t:"光の魔法で、呪いをときました。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#FFE7A8")+M6.P(m6(S(5),{face:"determined",pose:"reach"}),80,134,104)+orb(184,64,16)+M6.sfx(150,120,"キラーン","#F5B301",-6);}},
  {t:"正気にもどったズヴェズダーは、頭を下げます。",
   d:function(){return M6.sky("day")+M6.grass()+M6.P(m6(N.zvezda3,{face:"sad",pose:"pray"}),160,134,90,{flip:1,rot:-8})+M6.P(m6(S(5),{face:"smile"}),70,134,92)+M6.sfx(156,40,"ごめん","#2C5D8F",-4);}},
  {t:"「ペーペルは、世界中の光を一つの玉に集めている。全部集まったら、世界は灰色になってしまう」",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#6E6E78")+orb(120,70,26,1)+M6.bub(60,24,"世界が\n灰色に",96,52)+M6.sfx(196,110,"…","#E8EEF4",0);}}],
 /* 第6話 炎の山 */
 [{t:"炎の山で、大トカゲがほのおをはきます。",
   d:function(){return M6.sky("dusk")+lava+M6.P("b:5",160,134,106)+M6.P(m6(S(6),{face:"worry"}),50,134,84)+M6.sweat(70,50);}},
  {t:"水の魔法で、大トカゲを封じました。",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#8FD3F4")+M6.P(m6(S(6),{face:"determined",pose:"reach"}),90,134,106)+M6.sfx(140,40,"ザブーン","#2C5D8F",-6);}},
  {t:"物知りフクロウのサヴァーと出会い、仲間になりました。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.P(m6(S(6),{face:"joy"}),80,132,92)+M6.P(OWL,170,120,60,{flip:1})+M6.heart(196,40);}},
  {t:"サヴァーは言います。「光の玉は、星の塔のてっぺんじゃ。塔は雷に守られておる」",
   d:function(){return M6.sky("night")+M6.mts("night")+tower(176,128,1.1,"#5E6E8E")+bolt(220,20)+M6.P(OWL,70,130,80)+M6.bub(60,20,"星の塔の\nてっぺんじゃ",74,44);}}],
 /* 第7話 星の塔 */
 [{t:"星の塔の上で、雷の大ワシがあばれています。",
   d:function(){return M6.sky("night")+bolt(30,12,1.2)+bolt(210,16)+M6.P("b:6",130,130,112)+M6.sfx(40,110,"ゴロゴロ","#FFE066",-8);}},
  {t:"リーパと力を合わせ、大ワシを封じました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#3A3478")+M6.P(m6(LI,{face:"determined",pose:"reach"}),60,134,88)+M6.P(m6(S(7),{face:"determined",pose:"reach"}),156,134,96)+M6.spark(210,50,1.4)+M6.spark(30,40);}},
  {t:"てっぺんには、光の玉を手にしたペーペルがいました。",
   d:function(){return M6.sky("night")+'<path d="M0 112h240v28H0z" fill="#5E6E8E"/>'+M6.P(m6(N.pepel,{face:"rival"}),170,132,100,{flip:1})+orb(130,60,14)+M6.P(m6(S(7),{face:"surprise"}),54,132,88)+M6.bang(80,30);}},
  {t:"「わたしも昔は、おまえのように光を守ろうとした。だが、だれもわたしを認めなかった」",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#4A4A55")+M6.Up(m6(N.pepel,{face:"sad"}),120,14,126)+M6.bub(58,26,"だれも\n認めなかった",92,50);}}],
 /* 最終回 白夜の大魔法 */
 [{t:"光の玉が開き、世界に色がもどりました。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#FFE7A8")+orb(120,64,26)+M6.spark(40,30,1.4)+M6.spark(200,30,1.4)+M6.spark(60,110)+M6.spark(190,110);}},
  {t:"灰が消えると、ペーペルは小さな老人にもどり、静かに「ありがとう」と言いました。",
   d:function(){return M6.sky("day")+M6.grass()+M6.P(m6(N.pepel2,{face:"cry",pose:"pray"}),150,134,82,{flip:1})+M6.P(m6(S(8),{face:"smile"}),70,134,96)+M6.bub(168,22,"ありがとう",160,40);}},
  {t:"雪オオカミのヴォールチクが仲間になり、あなたは大賢者と呼ばれるようになりました。",
   d:function(){return M6.sky("day")+forest()+M6.grass()+M6.P(m6(S(8),{face:"laugh",pose:"wave"}),100,134,100)+M6.P(WOLF,190,136,66,{flip:1})+M6.heart(196,52)+M6.spark(40,30);}},
  {t:"ペーペルは今、魔法学校で子どもたちに薬草を教えています。",
   d:function(){return M6.sky("day")+school(180,86,.9)+M6.grass()+M6.P(m6(N.pepel2,{face:"laugh",pose:"point"}),60,134,88)+M6.P(m6(kid1,{face:"joy"}),132,134,54,{flip:1})+M6.P(m6(kid2,{face:"laugh"}),176,134,52,{flip:1})+'<path d="M96 104q4-12 10-14q-2 10-10 14z" fill="#5E8A3A"/>';}}]
];
})();
