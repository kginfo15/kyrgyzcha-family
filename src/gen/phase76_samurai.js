/* ===== Phase76：武士の道の4コマ（9話×4コマ、描き下ろし） =====
   この道の物語（P74_TALES.samurai）はこのアプリのオリジナル。実在の武将・家紋・城は使わず、紋や城もこの道のために描いたもの。
   主人公の服装は話ごとの成長（P.st）にそろえる：百姓 → 陣がさの足軽 → はちがね → かぶと → 大かぶと → 白い陣羽織。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="samurai")P=x;});if(!P)return;
var S=function(k){return m6(P.st[Math.max(0,Math.min(8,k))],{});},A=function(k){return m6(P.al[k].o,{});};
var N=P74_NPC,YA=A(0),KO=A(1),SG=A(2),CH=A(3),TE=A(4);
var vil1=m6(N.people1,{head:"straw",body:{type:"tunic",c:"#5E6E7E",patch:1}}),vil2=m6(N.people2,{off:"none",head:"bandana",body:{type:"tunic",c:"#8A6A4A"}});
var lord={hand:"none",off:"none",head:"none",body:{type:"samurai",c:"#3E6E4A",t:"#E8B923",under:"#2B2233",haori:"#3E6E4A"},hair:"#8A8A8A",beard:"#8A8A8A"};
var envoy=m6(N.ashigaru,{hand:"none",off:"scroll"});
/* この道だけで使う背景：わらぶきの家・城・砦・関所・旗・嵐の紋 */
var hut=function(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-18" y="-18" width="36" height="18" fill="#C9B48A" stroke="#2B2233" stroke-width="1.2"/><path d="M-26-16q26-30 52 0z" fill="#B89A5A" stroke="#2B2233" stroke-width="1.2"/><rect x="-5" y="-12" width="10" height="12" fill="#5A3A22"/></g>';};
var vill=function(){return hut(36,108,1)+hut(90,104,.8)+hut(206,108,1.1);};
var castle=function(x,y,s,fire){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><path d="M-46 0l6-24h80l6 24z" fill="#8C8C96" stroke="#2B2233" stroke-width="1.2"/><rect x="-30" y="-44" width="60" height="20" fill="#F6F1E1" stroke="#2B2233" stroke-width="1.2"/><path d="M-40-44q40-14 80 0z" fill="#3A3F58" stroke="#2B2233" stroke-width="1.2"/><rect x="-20" y="-62" width="40" height="18" fill="#F6F1E1" stroke="#2B2233" stroke-width="1.2"/><path d="M-30-62q30-14 60 0z" fill="#3A3F58" stroke="#2B2233" stroke-width="1.2"/><path d="M-12-72l12-8 12 8z" fill="#3A3F58"/><rect x="-14" y="-40" width="6" height="8" fill="#2B2233"/><rect x="8" y="-40" width="6" height="8" fill="#2B2233"/>'+(fire?'<path d="M-24-44q-6-20 8-34q0 14 8 18q2-14 12-22q4 18 10 22q6-10 4-20q14 18 6 36z" fill="#E0603A" opacity=".9"/><path d="M-10-46q0-12 8-18q2 10 8 12q4-6 4-12q8 12 2 20z" fill="#FFD34D"/>':'')+'</g>';};
var crest=function(x,y,r){return '<g transform="translate('+x+' '+y+')"><circle r="'+r+'" fill="#F6F1E1" stroke="#2B2233" stroke-width="1.6"/><path d="M0 '+(-r*.7)+'q'+(r*.7)+' 0 '+(r*.5)+' '+(r*.5)+'q-'+(r*.3)+' '+(r*.3)+'-'+(r*.6)+' 0M'+(-r*.6)+' '+(r*.3)+'q0 '+(r*.5)+' '+(r*.6)+' '+(r*.3)+'" stroke="#3A4A6A" stroke-width="'+(r*.22)+'" fill="none" stroke-linecap="round"/></g>';};
var nobori=function(x,y,c){return '<g><path d="M'+x+' '+y+'v-70" stroke="#5A3A22" stroke-width="3"/><rect x="'+x+'" y="'+(y-68)+'" width="16" height="44" fill="'+(c||"#3A4A6A")+'" stroke="#2B2233" stroke-width="1"/>'+crest(x+8,y-50,6)+'</g>';};
var snow=function(n){var s="";for(var k=0;k<(n||24);k++){s+='<circle cx="'+((k*53)%240)+'" cy="'+((k*37)%130+4)+'" r="'+(1+(k%3)*.6)+'" fill="#fff" opacity=".9"/>';}return s;};
var snowGround='<path d="M0 104q60-8 120 0t120 0v36H0z" fill="#E8EEF4"/><path d="M0 116q70-6 130 2t110-2v24H0z" fill="#D6E0EA"/>';
var fort='<path d="M40 104v-30h160v30" fill="#8A6A4A" stroke="#2B2233" stroke-width="1.2"/><path d="M40 74v-8M60 74v-8M80 74v-8M100 74v-8M120 74v-8M140 74v-8M160 74v-8M180 74v-8M200 74v-8" stroke="#6E4A22" stroke-width="5"/><path d="M40 70h160" stroke="#fff" stroke-width="3"/>';
var gate='<path d="M60 112v-70M180 112v-70" stroke="#5A3A22" stroke-width="8"/><path d="M46 46h148M54 56h132" stroke="#3A2A1E" stroke-width="8"/>';
var bolt=function(x,y,s){return '<path transform="translate('+x+' '+y+') scale('+(s||1)+')" d="M0 0l-10 22h8l-8 22 22-30h-9l9-14z" fill="#FFD34D" stroke="#2B2233" stroke-width="1.2"/>';};
var tatami='<rect width="240" height="140" fill="#E8D5A8"/><path d="M0 104h240v36H0z" fill="#C9B47A"/><path d="M0 104h240M80 104v36M160 104v36" stroke="#8A7A4A" stroke-width="1.4"/><path d="M20 0v104M220 0v104" stroke="#8A5A2B" stroke-width="6"/><rect x="60" y="14" width="120" height="60" fill="#F6F1E1" stroke="#8A5A2B" stroke-width="2"/><path d="M100 14v60M140 14v60" stroke="#C9B48A" stroke-width="1.4"/>';
var anvil='<path d="M150 124h40l-6-10h-28z" fill="#5A5A6A" stroke="#2B2233" stroke-width="1.2"/><path d="M146 114h48l6-8h-60z" fill="#6E6E78" stroke="#2B2233" stroke-width="1.2"/>';
P76.samurai=[
 /* 序章 戦の世 */
 [{t:"戦の世。村は野盗におびえて暮らしています。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+vill()+M6.P(m6(vil1,{face:"worry"}),130,132,80)+M6.P(m6(vil2,{face:"cry"}),178,132,76,{flip:1})+M6.sweat(146,48);}},
  {t:"百姓の若者は、村を守りたいと思いました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#5E6E8E")+M6.Up(m6(S(0),{face:"determined",off:"none"}),120,12,128);}},
  {t:"くわを置き、竹やりを手に取ります。",
   d:function(){return M6.sky("dawn")+M6.grass()+'<path d="M40 128l30-24" stroke="#8A5A2B" stroke-width="4" stroke-linecap="round"/><path d="M66 104l10-4-2 10z" fill="#9AA4AE"/>'+M6.P(m6(S(1),{face:"determined",pose:"fist"}),140,132,96)+M6.spark(196,40);}},
  {t:"そして、足軽になる決心をしました。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.grass()+M6.P(m6(vil1,{face:"cry",pose:"wave"}),40,132,64)+M6.P(m6(vil2,{face:"cry",pose:"wave"}),80,132,60)+M6.P(m6(S(1),{face:"smile",pose:"wave"}),180,132,86,{flip:1})+M6.lines(210,84,3,1);}}],
 /* 第1話 片目の権太 */
 [{t:"野盗のかしら、片目の権太が村をおそってきました。",
   d:function(){return M6.sky("dusk")+M6.grass("dusk")+vill()+M6.P(m6(N.gonta,{face:"laugh"}),170,132,104,{flip:1})+M6.P(m6(N.nobushi,{face:"rival"}),220,132,80,{flip:1})+M6.P(m6(S(1),{face:"determined"}),50,132,86);}},
  {t:"槍の名人、弥七といっしょに戦います。",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#F8DCC0")+M6.P(m6(YA,{face:"determined",pose:"fist"}),70,134,104)+M6.P(m6(S(1),{face:"determined",pose:"fist"}),170,134,104,{flip:1})+M6.sfx(120,30,"やあっ","#E2483B",-6);}},
  {t:"権太を討ち取り、村を守りました。弥七は「おまえについていく」と仲間になります。",
   d:function(){return M6.sky("day")+M6.grass()+vill()+M6.P(m6(YA,{face:"laugh",pose:"reach"}),70,132,92)+M6.P(m6(S(1),{face:"laugh",pose:"reach"}),170,132,90,{flip:1})+M6.bub(70,22,"ついていく",80,38);}},
  {t:"権太の持っていた旗には、嵐の紋。となりの国、嵐堂家のものでした。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#3A4A6A")+crest(120,66,40)+M6.sfx(156,30,"嵐堂家","#E8EEF4",0);}}],
 /* 第2話 嵐の紋 */
 [{t:"夜、嵐堂家の足軽大将がせめてきます。",
   d:function(){return M6.sky("night")+M6.grass("night")+nobori(150,100)+nobori(206,104)+M6.P(m6(N.ashitaisho,{face:"rival"}),176,132,100,{flip:1})+M6.P(m6(S(2),{face:"surprise"}),56,132,90);}},
  {t:"足軽大将を討ち取り、手柄を立てました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#5E6E8E")+M6.P(m6(S(2),{face:"laugh",pose:"fist"}),120,134,118)+M6.sfx(46,40,"手柄だ！","#FFE066",-8);}},
  {t:"その夜、しのびの者の小雪があらわれます。",
   d:function(){return M6.sky("night")+M6.grass("night")+'<rect x="0" y="0" width="240" height="140" fill="#1E2A40" opacity=".3"/>'+M6.P(m6(KO,{face:"smile"}),180,132,90,{flip:1})+M6.P(m6(S(2),{face:"surprise"}),60,132,86)+M6.sfx(140,30,"シュタッ","#C9D3DD",-6);}},
  {t:"「嵐堂がこの城をねらっている」と知らせて、小雪は仲間になりました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#3A3F58")+M6.Up(m6(KO,{face:"determined"}),120,16,124)+M6.bub(56,28,"城を\nねらっている",92,50);}}],
 /* 第3話 猪武者 */
 [{t:"嵐堂の先鋒、猪武者の大熊がつっこんできます。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(N.okuma,{face:"angry",pose:"run"}),150,132,110,{flip:1})+M6.lines(200,80,5,1)+M6.dust(210,124,1.3)+M6.P(m6(S(3),{face:"surprise"}),40,132,78);}},
  {t:"弥七の槍がその足を止め、あなたが討ち取りました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(YA,{face:"determined",pose:"fist"}),60,134,96)+M6.P(m6(S(3),{face:"determined",pose:"run"}),160,134,104,{rot:-6})+M6.sfx(166,30,"ズバッ","#E2483B",-8);}},
  {t:"あなたは侍に取り立てられました。",
   d:function(){return tatami+M6.P(m6(lord,{face:"smile",pose:"reach"}),70,130,92)+M6.P(m6(S(3),{face:"joy",pose:"pray"}),170,130,90,{flip:1})+M6.spark(124,36);}},
  {t:"大熊は最後に言いました。「鉄心さまは、戦を終わらせるために天下をとると言っておられる」",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#F8DCC0")+M6.Up(m6(N.okuma,{face:"sad"}),120,16,124)+M6.bub(56,26,"戦を\n終わらせるため",92,50);}}],
 /* 第4話 雪の砦 */
 [{t:"雪の山の上に、嵐堂の砦があります。",
   d:function(){return M6.sky("dark")+fort+snowGround+M6.P(m6(N.toride,{face:"rival"}),120,104,56)+M6.P(m6(S(4),{face:"determined"}),50,134,80)+M6.P(m6(YA,{face:"determined"}),200,134,76,{flip:1})+snow(26);}},
  {t:"雪の砦を落としました。",
   d:function(){return M6.sky("day")+snowGround+nobori(50,104,"#7A1F2B")+M6.P(m6(S(4),{face:"laugh",pose:"fist"}),130,132,96)+M6.sfx(150,30,"えいえい","#7A1F2B",-6)+snow(10);}},
  {t:"軍師の宗玄が仲間になりました。昔は、敵の大将の鉄心に仕えていたといいます。",
   d:function(){return M6.sky("day")+snowGround+M6.P(m6(SG,{face:"smile"}),160,132,92,{flip:1})+M6.P(m6(S(4),{face:"surprise"}),70,132,90)+M6.dream(160,30,90,44,M6.P(m6(N.tesshin,{}),160,50,40))+snow(8);}},
  {t:"「鉄心どのは、本気で戦のない世を作りたいのだ。ただ、そのやり方が強すぎる」",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#6E5A62")+M6.Up(m6(SG,{face:"worry"}),120,16,124)+M6.bub(56,26,"やり方が\n強すぎる",92,50);}}],
 /* 第5話 白狐の左近 */
 [{t:"鉄心の右腕、剣の天才の白狐の左近があらわれました。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(N.sakon,{face:"smile"}),176,132,98,{flip:1})+M6.P(m6(S(5),{face:"determined"}),60,132,94)+M6.sfx(184,24,"ふふ","#9AA4AE",0);}},
  {t:"一騎打ちが始まります。",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#F8DCC0")+M6.P(m6(S(5),{face:"determined",pose:"run"}),70,134,100)+M6.P(m6(N.sakon,{face:"determined",pose:"run"}),170,134,100,{flip:1})+M6.spark(120,62,1.6,"#fff")+M6.sfx(120,30,"キィン","#2B2233",0);}},
  {t:"勝ったのはあなたでした。左近は刀をおさめます。",
   d:function(){return M6.sky("day")+M6.grass()+M6.P(m6(N.sakon,{face:"smile",hand:"none"}),170,132,94,{flip:1})+M6.P(m6(S(5),{face:"surprise"}),70,132,94)+M6.sfx(200,40,"…","#2B2233",0);}},
  {t:"「鉄心さまに、おまえのことを伝えよう」と去りました。あなたは城代になりました。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+castle(180,104,.9)+M6.P(m6(N.sakon,{face:"smile",hand:"none"}),56,132,60,{flip:1,op:.85})+M6.P(m6(S(5),{face:"determined"}),120,132,86);}}],
 /* 第6話 炎の城 */
 [{t:"夜、主君の城が炎に包まれました。",
   d:function(){return M6.sky("night")+M6.grass("night")+castle(120,108,1.3,1)+M6.sfx(40,30,"ゴォォ","#E0603A",-6);}},
  {t:"燃える城から、人々を救い出します。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#7A3A2A")+M6.P(m6(S(6),{face:"determined",pose:"carry"}),110,134,104)+M6.P(m6(vil2,{face:"cry"}),190,134,64,{flip:1})+M6.sweat(130,30);}},
  {t:"弓の名人、千代が仲間になります。",
   d:function(){return M6.sky("dawn")+M6.grass()+M6.P(m6(CH,{face:"smile",pose:"reach"}),160,132,92,{flip:1})+M6.P(m6(S(6),{face:"smile"}),70,132,92)+M6.heart(118,40);}},
  {t:"主君は深い傷を負い、あなたに城をたくしました。こうして、あなたは城主になりました。",
   d:function(){return tatami+M6.lie(m6(lord,{face:"sad"}),80,124,90)+M6.P(m6(S(6),{face:"cry",pose:"pray"}),176,130,90,{flip:1})+M6.bub(70,24,"城をたのむ",80,64);}}],
 /* 第7話 雷鳴の関所 */
 [{t:"鉄心のもとへ続く道は、雷鳴の関所ただ一つ。",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+gate+bolt(30,10)+bolt(206,14)+M6.P(m6(N.sekisho,{face:"rival"}),120,124,90);}},
  {t:"宗玄の策で、守将を討ち取りました。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#E5B53B")+M6.P(m6(SG,{face:"smile",pose:"point"}),56,134,90)+M6.P(m6(S(7),{face:"determined",pose:"run"}),160,134,104)+M6.sfx(200,30,"いざ","#2B2233",-6);}},
  {t:"あなたは大名となりました。",
   d:function(){return M6.sky("day")+castle(120,96,1)+M6.grass()+nobori(30,120,"#7A1F2B")+nobori(194,120,"#7A1F2B")+M6.P(m6(S(7),{face:"joy"}),120,134,76)+M6.spark(70,40)+M6.spark(170,40);}},
  {t:"鉄心からの使者がきます。「これ以上、兵を死なせたくない。大将どうし、一騎打ちで決めよう」",
   d:function(){return tatami+M6.P(m6(envoy,{face:"worry",pose:"pray"}),76,130,88)+M6.P(m6(S(7),{face:"determined"}),176,130,94,{flip:1})+M6.bub(76,22,"一騎打ちで\n決めよう",84,40);}}],
 /* 最終回 天下ひとつ */
 [{t:"二人の大将の、最後の勝負。",
   d:function(){return M6.sky("dusk")+M6.grass("dusk")+M6.P(m6(N.tesshin,{face:"determined"}),176,132,104,{flip:1})+M6.P(m6(S(8),{face:"determined"}),60,132,104)+M6.spark(120,60,1.6,"#fff");}},
  {t:"長い一騎打ちのあと、鉄心は刀を置きました。",
   d:function(){return M6.sky("dawn")+M6.grass()+'<path d="M140 128l50-6" stroke="#C9D3DD" stroke-width="4" stroke-linecap="round"/>'+M6.P(m6(N.tesshin2,{face:"smile"}),170,132,96,{flip:1})+M6.P(m6(S(8),{face:"surprise"}),60,132,96);}},
  {t:"「おまえとなら、戦のない世が作れる」",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#FFE7A8")+M6.P(m6(N.tesshin2,{face:"laugh",pose:"reach"}),80,134,110)+M6.P(m6(S(8),{face:"laugh",pose:"reach"}),170,134,104,{flip:1})+M6.heart(124,30);}},
  {t:"刀かじの鉄之助は、これからはくわやすきを打つと笑います。百姓から身を起こしたあなたは、天下をおさめる人になりました。",
   d:function(){return M6.sky("day")+M6.grass()+vill()+anvil+M6.P(m6(TE,{face:"laugh",pose:"fist"}),170,128,70,{flip:1})+M6.P(m6(S(8),{face:"laugh",pose:"wave"}),76,134,90)+M6.P(m6(vil1,{face:"joy",pose:"wave"}),22,134,54)+M6.spark(120,30);}}]
];
})();
