/* ===== Phase76：海の道の4コマ（9話×4コマ、描き下ろし） =====
   この道の物語（P74_TALES.sea）はこのアプリのオリジナル。人物・船・海の生き物もすべてオリジナルの絵。
   主人公の服装は話ごとの成長（P.st）にそろえる：漁村の若者 → 水夫 → 航海士の三角帽子 → 提督の帽子。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="sea")P=x;});if(!P)return;
var S=function(k){return m6(P.st[Math.max(0,Math.min(8,k))],{});},A=function(k){return m6(P.al[k].o,{});};
var N=P74_NPC,KA=A(0),FY=A(1),TA=A(3),LE=A(4),GULL="an:gull:#E8EEF4";
var KR=m6(N.karina,{}),fish1=m6(N.people1,{head:"straw",body:{type:"tunic",c:"#5CB8B2",patch:1}}),fish2=m6(N.people2,{off:"none",head:"bandana",body:{type:"tunic",c:"#C7823E"}});
/* この道だけで使う背景：海・船・甲板・港・霧・氷・うず・地図 */
var sea=function(k){var c=k==="night"?"#1F3A5A":k==="ice"?"#7FB3CF":k==="dark"?"#2E4A5E":"#3F86B0",l=k==="night"?"#4F6E8E":"#BFE3F2";return '<path d="M0 92h240v48H0z" fill="'+c+'"/><path d="M10 104q10-6 20 0M70 116q10-6 20 0M150 102q10-6 20 0M196 124q10-6 20 0M110 130q10-6 20 0" stroke="'+l+'" stroke-width="2" fill="none" stroke-linecap="round"/>';};
var ship=function(x,y,s,sail,flip){var g='<path d="M-44 0h88l-12 18h-64z" fill="#7A4E26" stroke="#2B2233" stroke-width="1.4"/><path d="M-40 6h80" stroke="#5A3A1E" stroke-width="2"/><path d="M0 0v-62" stroke="#5A3A1E" stroke-width="3"/><path d="M2-58q30 20 0 52z" fill="'+(sail||"#F6F1E1")+'" stroke="#2B2233" stroke-width="1.2"/><path d="M-2-48q-26 16 0 40z" fill="'+(sail||"#F6F1E1")+'" stroke="#2B2233" stroke-width="1.2"/><path d="M0-62h10l-3 4 3 4H0" fill="#E2483B"/>';return '<g transform="translate('+x+' '+y+') scale('+(flip?-(s||1):(s||1))+' '+(s||1)+')">'+g+'</g>';};
var deck='<path d="M0 110h240v30H0z" fill="#9A6A36"/><path d="M0 110h240M0 122h240M60 110v30M140 110v30M210 110v30" stroke="#6E4A22" stroke-width="1.4"/><path d="M0 100h240" stroke="#5A3A1E" stroke-width="5"/><path d="M20 100v10M80 100v10M160 100v10M220 100v10" stroke="#5A3A1E" stroke-width="3"/>';
var port=function(){return '<path d="M0 100h110v40H0z" fill="#B89A6A"/><path d="M0 100h110" stroke="#6E4A22" stroke-width="3"/><rect x="16" y="70" width="30" height="30" fill="#E8D5A8" stroke="#2B2233" stroke-width="1.2"/><path d="M12 70l19-14 19 14z" fill="#2C5D8F"/><rect x="56" y="76" width="26" height="24" fill="#F2E2BE" stroke="#2B2233" stroke-width="1.2"/><path d="M52 76l17-12 17 12z" fill="#B3202B"/>';};
var fog='<g fill="#fff" opacity=".55"><ellipse cx="40" cy="60" rx="60" ry="16"/><ellipse cx="190" cy="44" rx="70" ry="18"/><ellipse cx="120" cy="96" rx="90" ry="14"/></g>';
var ice='<path d="M0 100l20-14 18 14zM170 104l26-20 24 20zM90 98l14-10 14 10z" fill="#E8EEF4" stroke="#9AB8D0" stroke-width="1.2"/>';
var whirl=function(x,y){var s='';for(var k=0;k<4;k++)s+='<ellipse cx="'+x+'" cy="'+y+'" rx="'+(20+k*22)+'" ry="'+(6+k*6)+'" fill="none" stroke="#BFE3F2" stroke-width="2.4" stroke-dasharray="14 8" opacity="'+(1-k*.2)+'"/>';return s;};
var net='<path d="M40 120l40-30 40 30M50 112l60 0M60 104l40 0" stroke="#C9B48A" stroke-width="1.6" fill="none"/><path d="M78 92l4-6M84 96l6-4" stroke="#E2483B" stroke-width="2"/>';
var half=function(x,y,s,side){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><path d="'+(side?'M0-30h34l-4 60H0z':'M0-30h-34l4 60H0z')+'" fill="#F2E2BE" stroke="#8A5A2B" stroke-width="2"/><path d="'+(side?'M4 10q14-20 26-6':'M-4 10q-14-20-26-6')+'" stroke="#2C5D8F" stroke-width="2" stroke-dasharray="4 3" fill="none"/></g>';};
var bolt=function(x,y,s){return '<path transform="translate('+x+' '+y+') scale('+(s||1)+')" d="M0 0l-10 22h8l-8 22 22-30h-9l9-14z" fill="#FFD34D" stroke="#2B2233" stroke-width="1.2"/>';};
P76.sea=[
 /* 序章 黒い帆 */
 [{t:"小さな漁村の沖に、黒い帆の船があらわれました。",
   d:function(){return M6.sky("dusk")+sea()+port()+ship(190,96,.7,"#2B2233")+M6.P(m6(S(0),{face:"surprise",look:"r"}),70,104,70)+M6.sfx(160,30,"！","#E2483B",0);}},
  {t:"それから、村の網が次々に切られていきます。",
   d:function(){return M6.sky("day")+M6.grass()+net+M6.P(m6(fish1,{face:"cry"}),160,132,86,{flip:1})+M6.sfx(60,40,"ズタズタ…","#5A3A22",-6);}},
  {t:"若者はつりざおを置きました。",
   d:function(){return M6.sky("dawn")+sea()+port()+'<path d="M40 98l40-30" stroke="#8A5A2B" stroke-width="3"/>'+M6.P(m6(S(0),{face:"determined",hand:"none",off:"none"}),150,104,80)+M6.spark(196,40);}},
  {t:"そして、海へ出る決心をしました。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#FFE7A8")+M6.Up(m6(S(0),{face:"determined",off:"none"}),120,12,128)+M6.spark(40,40)+M6.spark(200,36);}}],
 /* 第1話 大ダコ */
 [{t:"網を切っていたのは、大ダコでした。",
   d:function(){return M6.sky("day")+sea()+deck+M6.P("sea:kraken:#9A6BD6",160,138,110)+M6.P(m6(S(1),{face:"surprise"}),52,134,84)+M6.sfx(130,30,"ザバァ","#2C5D8F",-6);}},
  {t:"オールをふるって、大ダコを追いはらいました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#BFE3F2")+M6.P(m6(S(1),{face:"determined",pose:"fist"}),110,134,114)+M6.sfx(184,40,"えいっ","#1F6E8C",-6);}},
  {t:"見張りのとくいなカーチャが、遠めがねで黒い帆の船を見つけ、仲間になります。",
   d:function(){return M6.sky("day")+sea()+ship(200,90,.5,"#2B2233")+deck+M6.P(m6(KA,{face:"determined"}),80,134,100)+M6.sfx(150,30,"見つけた！","#E2483B",-4);}},
  {t:"大ダコは、黒帆団の船に飼われていたのです。",
   d:function(){return M6.sky("dark")+sea("dark")+ship(120,96,1,"#2B2233")+M6.P("sea:kraken:#9A6BD6",200,140,60)+M6.sfx(40,30,"黒帆団","#E8EEF4",-4);}}],
 /* 第2話 ほら吹きサム */
 [{t:"黒帆団の小船長、ほら吹きサムが港にやってきました。",
   d:function(){return M6.sky("day")+sea()+port()+'<path d="M110 100h130v40H110z" fill="#B89A6A"/><path d="M110 100h130" stroke="#6E4A22" stroke-width="3"/>'+M6.P(m6(N.sam,{face:"laugh",pose:"hip"}),170,104,90,{flip:1})+M6.P(m6(S(2),{face:"angry"}),60,104,80)+M6.bub(170,18,"おれは最強！",170,34);}},
  {t:"サムを追いはらいました。",
   d:function(){return M6.sky("day")+sea()+deck+M6.P(m6(N.sam,{face:"cry",pose:"run"}),180,134,84)+M6.lines(150,80,4,-1)+M6.P(m6(S(2),{face:"laugh",pose:"point"}),60,134,90);}},
  {t:"船大工のフョードルがこわれた船を直してくれて、自分たちの船が手に入りました。",
   d:function(){return M6.sky("day")+sea()+ship(150,100,1)+M6.P(m6(FY,{face:"laugh",pose:"fist"}),44,132,90)+M6.sfx(150,30,"トントン","#7A4E26",-6)+M6.spark(150,30);}},
  {t:"サムは逃げながら言いました。「ヴォルナ船長は、七つの港の宝の地図を探しているんだぞ！」",
   d:function(){return M6.sky("day")+sea()+deck+M6.P(m6(N.sam,{face:"angry",look:"l"}),186,134,86)+M6.bub(80,26,"宝の地図を\n探しているんだぞ！",160,60,1);}}],
 /* 第3話 霧の海 */
 [{t:"夜の霧の海で、霧の番人があらわれました。",
   d:function(){return M6.sky("night")+sea("night")+deck+M6.P("b:0",160,132,100)+fog+M6.P(m6(S(3),{face:"worry"}),50,134,80);}},
  {t:"番人を追いはらうと、霧の向こうに大きな船が見えました。",
   d:function(){return M6.sky("night")+sea("night")+fog+ship(160,88,1,"#2B2233")+deck+M6.P(m6(S(3),{face:"surprise",look:"r"}),50,134,80);}},
  {t:"船首に立つのは、黒帆のヴォルナ。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#1F2A44")+M6.Up(m6(N.volna,{face:"rival"}),120,14,126);}},
  {t:"港のうわさでは、ヴォルナは昔、正直な船乗りだったそうです。",
   d:function(){return M6.sky("day")+sea()+port()+M6.P(m6(fish1,{face:"smile"}),40,104,62)+M6.P(m6(fish2,{face:"smile"}),80,104,60)+M6.dream(170,48,110,70,M6.P(m6(N.volna2,{face:"laugh",eyepatch:null,off:"none"}),170,84,56))+M6.P(m6(S(3),{face:"surprise",look:"r"}),104,104,56);}}],
 /* 第4話 赤い帆 */
 [{t:"赤い帆の船の船長、カリーナがあらわれます。",
   d:function(){return M6.sky("day")+sea()+ship(180,96,.8,"#C0392B",1)+deck+M6.P(m6(KR,{face:"laugh",pose:"hip"}),70,134,96)+M6.sfx(160,24,"勝負！","#C0392B",-4);}},
  {t:"カリーナとの勝負に勝ちました。",
   d:function(){return M6.sky("day")+deck+M6.P(m6(S(4),{face:"determined",pose:"fist"}),80,134,96)+M6.P(m6(KR,{face:"surprise"}),180,134,92,{flip:1,rot:8})+M6.spark(130,60,1.4);}},
  {t:"カモメのチャイカが、こちらの船に飛び移って仲間になりました。",
   d:function(){return M6.sky("day")+deck+M6.P(m6(S(4),{face:"laugh",pose:"reach"}),80,134,96)+M6.P(GULL,170,90,56)+M6.heart(200,40);}},
  {t:"カリーナは笑います。「次は負けないよ。でも、ヴォルナに地図をわたすのは、もっといや」",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F8DCC0")+M6.Up(m6(KR,{face:"laugh"}),120,14,126)+M6.bub(56,26,"次は\n負けないよ",92,50);}}],
 /* 第5話 氷の海 */
 [{t:"氷の海で、大うみへびがおそってきます。",
   d:function(){return M6.sky("dark")+sea("ice")+ice+deck+M6.P("sea:serpent:#9AB8D0",160,138,110)+M6.P(m6(S(5),{face:"surprise"}),50,134,84);}},
  {t:"カリーナの船と力を合わせ、大うみへびを追いはらいました。",
   d:function(){return M6.sky("day")+sea("ice")+ice+ship(70,98,.7)+ship(180,98,.7,"#C0392B",1)+M6.sfx(124,40,"いまだ！","#1F6E8C",0)+M6.spark(124,70,1.3);}},
  {t:"あなたは船長になります。",
   d:function(){return M6.sky("day")+deck+M6.speed(120,70,"#BFE3F2")+M6.Up(m6(S(5),{face:"joy"}),120,12,128)+M6.spark(40,40)+M6.spark(200,40);}},
  {t:"カリーナが地図の半分を見せてくれました。「もう半分は、ヴォルナが持っている」",
   d:function(){return M6.sky("day")+deck+half(90,64,1.4,0)+M6.P(m6(KR,{face:"worry"}),190,134,88,{flip:1})+M6.bub(170,18,"もう半分は\nヴォルナ",190,40);}}],
 /* 第6話 鉄フック */
 [{t:"黒帆団の副船長、鉄フックのクリュークが待ちぶせしていました。",
   d:function(){return M6.sky("dusk")+sea()+deck+M6.P(m6(N.kryuk,{face:"rival"}),170,132,100,{flip:1})+M6.P(m6(S(6),{face:"determined"}),60,132,94)+M6.spark(116,60,1.3,"#fff");}},
  {t:"クリュークを追いはらいました。",
   d:function(){return M6.sky("dusk")+deck+M6.P(m6(N.kryuk,{face:"cry",pose:"run"}),200,134,78)+M6.lines(170,84,4,-1)+M6.P(m6(S(6),{face:"laugh",pose:"fist"}),80,134,96);}},
  {t:"船の料理番ターニャが「おなかがすいては戦えない」と仲間になります。",
   d:function(){return M6.sky("day")+deck+M6.P(m6(TA,{face:"laugh",pose:"carry"}),80,134,96)+M6.bowl(130,96,1.2)+M6.P(m6(S(6),{face:"joy"}),190,134,90,{flip:1})+M6.bub(70,18,"おなかが\nすいては…",80,36);}},
  {t:"クリュークは言います。「船長は、宝で黒帆団の仲間を食べさせたいだけなんだ」",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#3A3F58")+M6.Up(m6(N.kryuk,{face:"sad"}),120,16,124)+M6.bub(56,26,"仲間を\n食べさせたい",92,50);}}],
 /* 第7話 大うず */
 [{t:"嵐の夜、大うずが船の前に広がります。",
   d:function(){return M6.sky("night")+sea("night")+whirl(120,112)+bolt(40,10)+bolt(200,14)+ship(120,92,.6)+M6.sfx(40,70,"ゴォォ","#BFE3F2",-6);}},
  {t:"みんなで力を合わせて、大うずをこえました。",
   d:function(){return M6.sky("night")+deck+M6.P(m6(KA,{face:"determined"}),40,134,74)+M6.P(m6(S(7),{face:"determined",pose:"point"}),120,134,90)+M6.P(m6(FY,{face:"determined",pose:"carry"}),196,134,80,{flip:1})+M6.sweat(140,40);}},
  {t:"あなたは、船団をひきいる提督になりました。",
   d:function(){return M6.sky("dawn")+sea()+ship(50,96,.5)+ship(120,92,.7)+ship(196,96,.5,"#C0392B",1)+M6.spark(120,20,1.3);}},
  {t:"目の前に、ヴォルナの船。ヴォルナは叫びます。「この海で生きるには、宝が必要なんだ！」",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#1F2A44")+M6.Up(m6(N.volna,{face:"angry"}),120,16,124)+M6.bub(56,26,"宝が\n必要なんだ！",92,50,1);}}],
 /* 最終回 七つの港 */
 [{t:"ヴォルナを追いはらい、二つに分かれた地図を合わせました。",
   d:function(){return M6.sky("day")+deck+half(100,60,1.3,0)+half(100,60,1.3,1)+M6.P(m6(S(8),{face:"surprise"}),200,134,74,{flip:1})+M6.sfx(40,110,"ぴたり","#2C5D8F",-6);}},
  {t:"それは宝のありかではなく、七つの港を安全に結ぶ航路図でした。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#FFE7A8")+'<rect x="40" y="20" width="160" height="100" fill="#F2E2BE" stroke="#8A5A2B" stroke-width="2"/>'+[[60,40],[110,34],[170,44],[70,96],[130,80],[184,100],[100,64]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="5" fill="#B3202B"/>';}).join("")+'<path d="M60 40L110 34 170 44 130 80 184 100M110 34 100 64 70 96M100 64 130 80" stroke="#2C5D8F" stroke-width="2" stroke-dasharray="4 3" fill="none"/>';}},
  {t:"地図をかいたのは、老いた航海士レフ。レフが仲間になり、ヴォルナの船も船団に加わります。",
   d:function(){return M6.sky("day")+deck+M6.P(m6(LE,{face:"smile"}),50,134,88)+M6.P(m6(N.volna2,{face:"smile"}),130,134,92)+M6.P(m6(S(8),{face:"laugh",pose:"reach"}),204,134,90,{flip:1})+M6.heart(166,36);}},
  {t:"漁村の若者は、大提督になりました。",
   d:function(){return M6.sky("day")+sea()+port()+ship(190,96,.6)+M6.P(m6(KA,{face:"laugh",pose:"wave"}),20,104,52)+M6.P(m6(TA,{face:"joy"}),52,104,52)+M6.P(m6(S(8),{face:"laugh",pose:"wave"}),90,104,68)+M6.P(GULL,140,64,30)+M6.spark(190,30);}}]
];
})();
