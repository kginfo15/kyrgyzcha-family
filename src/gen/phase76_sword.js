/* ===== Phase76：剣の道の4コマ（9話×4コマ、描き下ろし） =====
   この道の物語（P74_TALES.sword）はこのアプリのオリジナル。人物・敵・城もすべてオリジナルの絵。
   主人公の服装は話ごとの成長（P.st）にそろえる：農民のくわ → 木の棒 → 剣と盾 → 騎士のよろい → 光の剣。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="sword")P=x;});if(!P)return;
var S=function(k){return m6(P.st[Math.max(0,Math.min(8,k))],{});},A=function(k){return m6(P.al[k].o,{});};
var N=P74_NPC,SO=A(0),IV=A(1),VE=A(2),MI=A(4);
var king={hand:"none",off:"none",head:"crown",body:{type:"royal",c:"#5B2A86",t:"#E8B923"},beard:"#E8EEF4",hair:"#E8EEF4",cape:"#B3202B"};
var miner=m6(N.people1,{head:"bandana",headc:"#8A6A4A",body:{type:"tunic",c:"#6E5A4A",apron:"#4A3A2A"},hand:"none"});
var miner2=m6(miner,{headc:"#5A5A6A",body:{type:"tunic",c:"#8A7A68",apron:"#5A3A22"},beard:"#5A3A22"});
var sis=m6(N.zheleza,{head:"none",visor:null,hand:"none",off:"none"});
/* この道だけで使う背景：森・城・鉱山の入口・地図・光る目・いなずま */
var tree=function(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-3" y="-14" width="6" height="16" fill="#6E4A22"/><circle cy="-28" r="18" fill="#3E7A4A"/><circle cx="-12" cy="-20" r="12" fill="#3E7A4A"/><circle cx="12" cy="-20" r="12" fill="#357042"/></g>';};
var forest=function(){return tree(20,104,1.1)+tree(64,98,.8)+tree(180,100,.9)+tree(226,106,1.2);};
var castle=function(x,y,s,dark){var c=dark?"#3A3F58":"#C9C3B4",d=dark?"#2B2233":"#A39C8A";return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-40" y="-40" width="80" height="40" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><rect x="-52" y="-62" width="22" height="62" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><rect x="30" y="-62" width="22" height="62" fill="'+c+'" stroke="#2B2233" stroke-width="1.4"/><path d="M-54-62l13-16 13 16zM28-62l13-16 13 16z" fill="'+(dark?"#5B2A86":"#B3202B")+'" stroke="#2B2233" stroke-width="1.4"/><path d="M-10 0v-18q10-12 20 0v18z" fill="'+d+'"/><path d="M-36-40v-6h8v6M-20-40v-6h8v6M-4-40v-6h8v6M12-40v-6h8v6M28-40v-6" fill="'+c+'" stroke="#2B2233" stroke-width="1.2"/><rect x="-46" y="-50" width="8" height="10" fill="'+(dark?"#C9A8FF":"#2B2233")+'"/><rect x="38" y="-50" width="8" height="10" fill="'+(dark?"#C9A8FF":"#2B2233")+'"/></g>';};
var cave='<path d="M0 104l50-70 40 30 40-50 60 60 50-20v90H0z" fill="#8C7A68"/><path d="M96 112q0-40 28-40t28 40z" fill="#2B2233"/><path d="M96 112h56" stroke="#5A3A22" stroke-width="4"/><path d="M104 112v-34M144 112v-34M100 80h48" stroke="#8A5A2B" stroke-width="5"/>';
var map=function(x,y){return '<g transform="translate('+x+' '+y+')"><path d="M-60-38l40 6 40-6 40 6v72l-40-6-40 6-40-6z" fill="#F2E2BE" stroke="#8A5A2B" stroke-width="2"/><path d="M-20-32v72M20-38v72" stroke="#D9C49A" stroke-width="1.4"/><path d="M-50 20l14-22 10 12 12-18 16 28" stroke="#8C7A68" stroke-width="3" fill="none"/><path d="M-44 30q30-10 80 4" stroke="#5CA4D9" stroke-width="2" fill="none" stroke-dasharray="4 3"/><path d="M-18 -16l10 10M-8 -16l-10 10" stroke="#E2483B" stroke-width="4" stroke-linecap="round"/><circle cx="34" cy="6" r="4" fill="#2B2233"/></g>';};
var eyes=function(){var s="";[[40,90],[78,82],[170,86],[206,94],[124,76]].forEach(function(p){s+='<circle cx="'+p[0]+'" cy="'+p[1]+'" r="2.6" fill="#FFE066"/><circle cx="'+(p[0]+8)+'" cy="'+p[1]+'" r="2.6" fill="#FFE066"/>';});return s;};
var bolt=function(x,y,s){return '<path transform="translate('+x+' '+y+') scale('+(s||1)+')" d="M0 0l-10 22h8l-8 22 22-30h-9l9-14z" fill="#FFD34D" stroke="#2B2233" stroke-width="1.2"/>';};
var crop='<g fill="#5E8A3A">'+[20,44,68,92,140,164,188,212].map(function(x,k){return '<path d="M'+x+' 128q-4-14 2-24q4 12-2 24z'+(k%3===1?'" transform="rotate(30 '+x+' 128)':'')+'"/>';}).join('</g><g fill="#5E8A3A">')+'</g>';
var arrow=function(x,y){return '<path d="M'+x+' '+y+'h46" stroke="#6E4A22" stroke-width="2.4"/><path d="M'+(x+46)+' '+(y-4)+'l8 4-8 4z" fill="#8C9AA8" stroke="#2B2233" stroke-width="1"/><path d="M'+x+' '+y+'l-6-5M'+x+' '+y+'l-6 5" stroke="#E2483B" stroke-width="2"/>';};
var shadow=function(x,y){return '<g opacity=".75"><path d="M'+(x-30)+' '+y+'q-10-40 30-60q40 20 30 60q-14-14-30-4q-16-10-30 4z" fill="#3A2E5C"/></g>';};
P76.sword=[
 /* 序章 畑を荒らす影 */
 [{t:"小さな村の畑が、夜になるたびに荒らされます。",
   d:function(){return M6.sky("night")+M6.grass("night")+crop+M6.P(m6(S(0),{face:"surprise"}),120,132,84)+M6.sfx(48,40,"ガサガサ","#E8EEF4",-8)+M6.sweat(144,44);}},
  {t:"農民の若者は古いくわを手に、見張りに立つことにしました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#5E6E8E")+M6.Up(m6(S(0),{face:"determined",off:"none"}),120,12,128)+M6.spark(196,40,1,"#fff");}},
  {t:"暗やみの中で光る、いくつもの目。",
   d:function(){return M6.sky("night")+M6.grass("night")+'<g fill="#1E2A40">'+tree(30,110,1.2)+tree(210,110,1.2)+'</g>'+eyes()+M6.P(m6(S(0),{face:"worry",look:"l"}),130,132,72)+M6.sweat(150,62);}},
  {t:"そのうしろに、黒い旗が見えた気がしました。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.flag(186,70,"#2B2233")+M6.P(m6(S(0),{face:"surprise",look:"r"}),70,132,90)+M6.bang(102,34)+M6.sfx(200,40,"？","#E8EEF4",0);}}],
 /* 第1話 森の盗賊 */
 [{t:"森の盗賊のかしら、赤ひげのグロムがおそってきました。",
   d:function(){return M6.sky("day")+forest()+M6.grass()+M6.P(m6(S(1),{face:"determined"}),60,132,84)+M6.P(m6(N.grom,{face:"angry"}),180,132,100,{flip:1})+M6.bang(120,46);}},
  {t:"そのとき、森の奥から一本の矢が飛んできます。弓使いのソーニャです。",
   d:function(){return M6.sky("day")+forest()+M6.grass()+M6.P(m6(SO,{face:"determined",pose:"reach"}),48,132,84)+arrow(90,66)+M6.P(m6(N.grom,{face:"surprise"}),190,132,96,{flip:1})+M6.sfx(120,40,"ヒュッ","#2B2233",-6);}},
  {t:"グロムは逃げながら叫びます。「おれたちは、黒い騎士さまに鉄をとどけていただけだ！」",
   d:function(){return M6.sky("day")+forest()+M6.grass()+M6.P(m6(N.grom,{face:"cry",pose:"run"}),150,132,92)+M6.lines(120,90,4,-1)+M6.dust(110,126,1)+M6.bub(80,30,"鉄をとどけて\nいただけだ！",130,56,1);}},
  {t:"助けてくれたソーニャは、仲間になりました。",
   d:function(){return M6.sky("day")+forest()+M6.grass()+M6.P(m6(S(1),{face:"laugh",pose:"wave"}),76,132,86)+M6.P(m6(SO,{face:"joy",pose:"wave"}),164,132,84,{flip:1})+M6.heart(120,40);}}],
 /* 第2話 黒騎士団 */
 [{t:"黒騎士団の斥候隊長ヴォーロンが、剣をぬきました。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(S(2),{face:"determined"}),70,132,90)+M6.P(m6(N.voron,{face:"rival"}),174,132,94,{flip:1})+M6.spark(122,70,1.4,"#fff");}},
  {t:"盾の大男イワンが、とびこんで攻撃を受けとめます。",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#F8DCC0")+M6.P(m6(IV,{face:"determined",pose:"fist"}),100,134,116)+M6.sfx(150,40,"ガキーン","#E2483B",-6)+M6.spark(152,70,1.2);}},
  {t:"ヴォーロンをたおすと、地図が落ちていました。山の鉱山に赤い印があります。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+map(120,70)+M6.sfx(196,30,"！","#E2483B",0);}},
  {t:"黒騎士団は、そこで人々をむりやり働かせているようです。イワンも仲間になりました。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(SO,{face:"worry"}),50,132,78)+M6.P(m6(S(2),{face:"determined",pose:"point"}),120,132,86)+M6.P(m6(IV,{face:"determined"}),194,132,96,{flip:1});}}],
 /* 第3話 山の鉱山 */
 [{t:"鉱山の入口を、石の巨人が守っていました。",
   d:function(){return M6.sky("day")+cave+M6.P("b:1",124,136,104)+M6.P(m6(S(3),{face:"surprise"}),40,136,70)+M6.sweat(58,64);}},
  {t:"仲間が気を引き、そのすきに大きくふみこみます。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(S(3),{face:"determined",pose:"run"}),96,136,104,{rot:-8})+M6.lines(50,70,5,-1)+M6.sfx(176,40,"ザンッ","#E2483B",-8)+M6.bang(190,80);}},
  {t:"巨人をたおし、とらわれていた人々を助け出しました。",
   d:function(){return M6.sky("day")+cave+M6.P(m6(miner,{face:"cry",pose:"both"}),44,136,74)+M6.P(m6(miner2,{face:"joy",pose:"wave"}),200,136,76,{flip:1})+M6.P(m6(S(3),{face:"smile"}),124,136,80)+M6.heart(84,48)+M6.heart(164,46);}},
  {t:"鉱夫が教えてくれます。「黒騎士団の団長の名はノーチ。昔は、国いちばんの騎士だったそうだ」",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(miner2,{face:"worry"}),70,132,94)+M6.P(m6(S(3),{face:"surprise",look:"l"}),170,132,90,{flip:1})+M6.bub(76,24,"団長は ノーチ",80,40);}}],
 /* 第4話 双子の騎士 */
 [{t:"ノーチの過去を知る、双子の騎士ザーパドとヴォストークが立ちはだかります。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(N.twins,{face:"rival"}),150,132,88,{flip:1})+M6.P(m6(N.twins,{face:"rival"}),206,132,88,{flip:1})+M6.P(m6(S(4),{face:"determined"}),56,132,92);}},
  {t:"二人を相手にした勝負に、勝ちました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(S(4),{face:"laugh",pose:"fist"}),120,134,116)+M6.sfx(46,40,"勝った！","#E2483B",-8)+M6.spark(200,40);}},
  {t:"けがをした仲間を、薬師のヴェーラが治してくれます。ヴェーラも旅に加わりました。",
   d:function(){return M6.sky("day")+M6.grass()+M6.P(m6(IV,{face:"worry"}),70,132,88)+M6.P(m6(VE,{face:"smile",pose:"reach"}),170,132,86,{flip:1})+M6.spark(110,70,1,"#7ED9C8")+M6.spark(126,56,.8,"#7ED9C8");}},
  {t:"双子は言います。「団長は、ある日から人が変わった。黒い影に、心をのまれたように」",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#6E5A62")+M6.Up(m6(N.twins,{face:"sad"}),120,20,120)+shadow(200,90)+M6.bub(60,26,"人が変わった",90,46);}}],
 /* 第5話 王都の夜 */
 [{t:"王都の夜に、オオカミ王の遠ぼえがひびきます。",
   d:function(){return M6.sky("night")+castle(70,104,.9)+M6.grass("night")+M6.P("b:4",176,134,104)+M6.sfx(140,30,"アオーン","#FFE066",-6);}},
  {t:"あなたとイワンは、オオカミ王を追いはらいました。",
   d:function(){return M6.sky("night")+M6.grass("night")+M6.P(m6(S(5),{face:"determined",pose:"point"}),60,132,90)+M6.P(m6(IV,{face:"laugh"}),114,132,88)+M6.P("b:4",196,134,90,{flip:1})+M6.lines(166,80,4,1)+M6.dust(194,128,1);}},
  {t:"王さまは、あなたを騎士に任命しました。",
   d:function(){return M6.sky("night")+'<rect y="0" width="240" height="140" fill="#3A2E5C" opacity=".4"/>'+'<path d="M0 108h240v32H0z" fill="#7A1F2B"/>'+M6.P(m6(king,{face:"smile",pose:"reach"}),74,130,98)+M6.P(m6(S(5),{face:"joy",pose:"pray"}),170,132,88,{flip:1})+M6.spark(124,40)+M6.spark(206,30);}},
  {t:"王さまは静かに話します。「ノーチは、かつてわたしの命を守った英雄だ。どうか、彼を止めてほしい」",
   d:function(){return '<rect width="240" height="140" fill="#3A2E5C"/>'+M6.Up(m6(king,{face:"sad"}),120,16,124)+M6.bub(56,28,"彼を\n止めてほしい",86,50);}}],
 /* 第6話 鉄仮面 */
 [{t:"黒騎士団の副団長、鉄仮面のジェレーザがあらわれました。",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+M6.P(m6(N.zheleza,{}),170,132,100,{flip:1})+M6.P(m6(S(6),{face:"determined"}),62,132,92)+M6.spark(118,64,1.4,"#fff");}},
  {t:"戦いのあと、仮面の下から現れたのは、ノーチの妹でした。",
   d:function(){return M6.sky("dark")+M6.speed(120,70,"#6E5A62")+M6.Up(m6(sis,{face:"sad"}),120,16,124)+M6.sfx(180,116,"カラン","#C9D3DD",-8)+M6.sfx(40,40,"！","#FFE066",0);}},
  {t:"相棒のタカ、ヤーストレプも仲間になります。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(S(6),{face:"laugh",pose:"reach"}),90,132,92)+M6.eagle(170,48,.9,1)+M6.heart(206,30);}},
  {t:"「兄は、影の竜の力で国を守れると信じてしまった。お願い、兄を助けて」",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+M6.P(m6(sis,{face:"cry",pose:"pray"}),72,132,92)+M6.P(m6(S(6),{face:"determined"}),170,132,92,{flip:1})+M6.bub(70,24,"兄を助けて",76,40);}}],
 /* 第7話 雷の峠 */
 [{t:"ノーチの城へ続く峠を、雷の大ワシが守っていました。",
   d:function(){return M6.sky("night")+M6.mts("night")+bolt(40,14,1.2)+bolt(200,10,1)+M6.P("b:6",130,128,110)+M6.sfx(54,122,"ゴロゴロ","#FFE066",-8);}},
  {t:"ヴェーラと力を合わせ、大ワシをしずめました。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.P(m6(VE,{face:"smile",pose:"reach"}),60,132,84)+M6.P(m6(S(7),{face:"smile"}),130,132,90)+M6.eagle(200,40,1.2,1)+M6.spark(176,70)+M6.spark(220,64);}},
  {t:"ついにノーチの城の前に立ちました。あなたは騎士団長として、仲間をひきいています。",
   d:function(){return M6.sky("night")+M6.mts("night")+castle(150,96,1,1)+M6.grass("night")+M6.P(m6(VE,{face:"determined"}),30,134,62)+M6.P(m6(IV,{face:"determined"}),66,134,70)+M6.P(m6(S(7),{face:"determined",pose:"point"}),110,134,74);}},
  {t:"城の上から、ノーチの声がひびきます。「影の竜の力があれば、だれも国をおそえない。じゃまをするな！」",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#3A2E5C")+shadow(120,140)+M6.Up(m6(N.nochi,{}),120,18,122)+M6.bub(60,26,"じゃまを\nするな！",90,50,1);}}],
 /* 最終回 夜明けの剣 */
 [{t:"夜明けの光とともに、光の剣を高くかかげます。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#FFE7A8")+M6.Up(m6(S(8),{face:"determined"}),120,10,130)+M6.spark(44,40,1.3)+M6.spark(200,30,1.3);}},
  {t:"ノーチをおおっていた影が、すうっと消えていきました。",
   d:function(){return M6.sky("dawn")+M6.grass("dusk")+shadow(126,70)+M6.P(m6(N.nochi2,{face:"surprise"}),120,132,96)+M6.sfx(146,40,"シュウウ","#5B2A86",-6)+M6.spark(60,46);}},
  {t:"ノーチは剣を置き、国をもう一度立て直す手伝いをすると約束します。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(N.nochi2,{face:"smile",pose:"reach"}),80,132,94)+M6.P(m6(S(8),{face:"smile",pose:"reach"}),164,132,92,{flip:1})+'<path d="M40 128l40-6" stroke="#C9D3DD" stroke-width="4" stroke-linecap="round"/>'+M6.heart(122,40);}},
  {t:"旅の歌い手ミーシャがこの旅を歌にしました。くわを持った若者は、剣の英雄になったのです。",
   d:function(){return M6.sky("day")+castle(120,100,.7)+M6.grass()+M6.P(m6(SO,{face:"laugh",pose:"wave"}),28,134,62)+M6.P(m6(IV,{face:"laugh"}),68,134,70)+M6.P(m6(S(8),{face:"laugh",pose:"fist"}),120,134,80)+M6.P(m6(VE,{face:"joy"}),170,134,62,{flip:1})+M6.P(m6(MI,{face:"laugh"}),212,134,64,{flip:1})+M6.note(190,40)+M6.note(206,56);}}]
];
})();
