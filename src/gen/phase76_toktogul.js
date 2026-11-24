/* ===== Phase76：トクトグルの道の4コマ（9話×4コマ、描き下ろし） =====
   実在の人物なので、本文（phase74_hist）にある事実だけを絵にする。創作の台詞は入れず、ふきだしは気持ちを表す短い言葉だけ。
   服装：男性は白いカルパク（黒いふち）とチャパン、結婚した女性（母ブルマ）はエレチェクと巻きスカート（ベルデムチ）。
   コムズは3本の弦のキルギスの楽器。とらえられる場面やシベリアの労働は、つらさを強く描きすぎない。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="toktogul")P=x;});if(!P)return;
var S=function(k){return m6(P.st[Math.max(0,Math.min(8,k))],{});};
var N=P74_NPC,MO=m6(N.mother,{beld:"#3A2A4A"}),boy=m6(S(0),{hand:"none"});
var p1=m6(N.people1,{}),p2=m6(N.people2,{off:"none"}),eld=m6(N.elder,{hand:"none"});
var bai=m6(N.people1,{head:"tebetei",headc:"#3A2E5C",body:{type:"chapan",c:"#5E3A7E",t:"#E8B923",fur:1},beard:"#2B2233",hair:"#2B2233"});
var bai2=m6(bai,{headc:"#2B2233",body:{type:"chapan",c:"#2B2233",t:"#C99A2E",fur:1},beard:"#5A3A22"});
var off=m6(N.officer,{head:"cap"}),guard=m6(N.officer,{head:"cap",beard:null,off:"none"});
var fr1=m6(P.al[3].o,{}),fr2=m6(N.people1,{head:"tebetei",headc:"#7A4E26",body:{type:"chapan",c:"#8A5A2B",t:"#E8D5A8",fur:1},beard:"#2B2233",hand:"stick"});
var clerk=m6(N.people1,{head:"none",body:{type:"coat",c:"#4A5A6E",t:"#C9D3DD"},hair:"#5A3A22",off:"scroll"});
/* この道だけで使う背景：雪・針葉樹・湖 */
var snow=function(n){var s="";for(var k=0;k<(n||24);k++){s+='<circle cx="'+((k*53)%240)+'" cy="'+((k*37)%130+4)+'" r="'+(1+(k%3)*.6)+'" fill="#fff" opacity=".9"/>';}return s;};
var pine=function(x,y,s){return '<g transform="translate('+x+' '+y+') scale('+(s||1)+')"><rect x="-2" y="-6" width="4" height="8" fill="#5A3A22"/><path d="M0-40l-14 20h7l-11 15h36l-11-15h7z" fill="#2E4A3E"/><path d="M0-40l-6 9 6-2 6 2z" fill="#fff" opacity=".85"/></g>';};
var snowGround='<path d="M0 104q60-8 120 0t120 0v36H0z" fill="#E8EEF4"/><path d="M0 116q70-6 130 2t110-2v24H0z" fill="#D6E0EA"/>';
var lake='<path d="M0 98q60-6 120 0t120 0v42H0z" fill="#4F8FB8"/><path d="M20 108h40M90 116h50M170 106h40M60 126h60" stroke="#BFE3F2" stroke-width="2" stroke-linecap="round" opacity=".8"/>';
var road='<path d="M90 140q20-20 60-34t90-10" stroke="#C9B48A" stroke-width="14" fill="none" opacity=".8"/>';
P76.toktogul=[
 /* 序章 歌で語る人アクン */
 [{t:"キルギスには、その場で言葉を考えながら歌う詩人「アクン」がいます。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.fire(120,118,1.2)+M6.P(m6(p1,{face:"smile"}),46,132,64)+M6.P(m6(S(4),{face:"joy",off:"none"}),176,132,72,{flip:1})+M6.note(196,40)+M6.note(214,56);}},
  {t:"トクトグル・サトゥルガノフは、アクンであり作曲家として知られる実在の人物です。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.Up(m6(S(4),{face:"smile",off:"none"}),120,10,132)+M6.spark(40,36)+M6.spark(200,34);}},
  {t:"コムズは、3本の弦をもつキルギスの楽器です。",
   d:function(){return M6.yurtIn()+M6.Up(m6(S(2),{face:"laugh",look:"d"}),120,14,128)+M6.note(56,40)+M6.note(40,64)+M6.note(190,36)+M6.sfx(200,70,"♪","#C99A2E",0);}},
  {t:"この道では、記録で確かめられる出来事をもとに、彼の人生を紹介します。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.scroll(120,64,1.7,"1864〜1933")+M6.spark(50,30)+M6.spark(196,30);}}],
 /* 第1話 ケトメン・トベの村 */
 [{t:"1864年、トクトグルはケトメン・トベの谷にあるクシュチュ・スウ村に生まれました。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.yurt(70,108,.8)+M6.yurt(178,104,.7)+M6.sheep(130,124,.8)+M6.sheep(150,128,.7,1);}},
  {t:"まずしい農家でしたが、母のブルマが大切に育てました。",
   d:function(){return M6.yurtIn()+M6.P(m6(MO,{face:"smile",pose:"hold"}),80,130,96)+M6.P(m6(boy,{face:"joy"}),160,130,62,{flip:1})+M6.heart(118,42);}},
  {t:"少年は羊の世話を手伝いながら、谷を走りまわりました。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(S(0),{face:"laugh",pose:"run"}),90,132,62)+M6.lines(50,100,4,-1)+M6.sheep(170,124,.9,1)+M6.sheep(200,128,.8,1)+M6.dust(70,128,.8);}},
  {t:"この村は、今ではトクトグル貯水池の水の下にしずんでいます。当時この地域はコーカンド・ハン国の一部でした。",
   d:function(){return M6.sky("day")+M6.mts()+lake+M6.spark(60,40,1,"#fff")+M6.sfx(190,40,"いま","#2C5D8F",-6);}}],
 /* 第2話 最初の先生は母 */
 [{t:"母のブルマは、悲しみの歌をうたう「コショクチュ」として知られた人でした。",
   d:function(){return M6.yurtIn(1)+M6.Up(m6(MO,{face:"sad",pose:"pray"}),120,12,128)+M6.note(60,44)+M6.note(186,40);}},
  {t:"トクトグルは、そのそばで、じっと歌を聞いていました。",
   d:function(){return M6.yurtIn()+M6.P(m6(MO,{face:"sad"}),70,130,96)+M6.P(m6(boy,{face:"surprise",look:"l"}),168,130,64,{flip:1})+M6.note(108,40)+M6.note(124,56);}},
  {t:"母は、トクトグルにとって最初の先生だったと伝えられています。",
   d:function(){return M6.yurtIn()+M6.P(m6(MO,{face:"smile",pose:"point"}),76,130,96)+M6.P(m6(S(1),{face:"determined"}),164,130,68,{flip:1})+M6.note(150,46)+M6.spark(196,38);}},
  {t:"言葉とメロディーで気持ちを伝える力は、この母から受けついだものでした。",
   d:function(){return M6.sky("dusk")+M6.speed(120,70,"#F8DCC0")+M6.Up(m6(S(1),{face:"joy"}),120,12,128)+M6.note(46,40)+M6.note(64,64)+M6.note(184,34)+M6.heart(206,62);}}],
 /* 第3話 人々のための歌 */
 [{t:"若いトクトグルは、歌い手として名前を知られるようになります。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.fire(120,120,1)+M6.P(m6(p1,{face:"joy",pose:"both"}),36,132,58)+M6.P(m6(S(3),{face:"laugh"}),120,132,76)+M6.P(m6(p2,{face:"joy"}),204,132,56,{flip:1})+M6.note(150,46);}},
  {t:"歌の中で、お金持ちのぜいたくや不正を、ユーモアをこめて批判しました。",
   d:function(){return M6.yurtIn()+M6.P(m6(S(3),{face:"laugh",look:"r"}),70,130,94)+M6.P(m6(bai,{face:"angry",pose:"fist"}),176,130,98,{flip:1})+M6.sfx(70,26,"♪","#C99A2E",0)+M6.bang(206,30);}},
  {t:"そのため、まずしい人々からは愛されました。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.P(m6(p1,{face:"laugh",pose:"wave"}),40,132,62)+M6.P(m6(eld,{face:"smile"}),92,132,64)+M6.P(m6(p2,{face:"joy",pose:"heart"}),148,132,60,{flip:1})+M6.P(m6(S(3),{face:"smile"}),204,132,70,{flip:1})+M6.heart(118,36)+M6.heart(66,46);}},
  {t:"けれど、力をもつ人々の中には、彼をきらう者もいました。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(bai,{face:"angry"}),80,130,98)+M6.P(m6(bai2,{face:"rival",pose:"point"}),160,130,98,{flip:1})+M6.gloom(120,40,40);}}],
 /* 第4話 えん罪 */
 [{t:"1898年、アンディジャンという町で反乱が起きます。",
   d:function(){return M6.sky("dark")+M6.city(120,104,1.3)+M6.grass("dark")+M6.dust(60,120,1.2)+M6.dust(180,118,1)+M6.sfx(120,30,"1898","#E2483B",-4);}},
  {t:"トクトグルをきらう有力者が、彼も加わったといううその訴えを出しました。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(bai,{face:"rival",pose:"point"}),70,130,98)+M6.P(m6(off,{face:"none"}),168,130,100,{flip:1})+M6.bub(70,24,"あの男です",86,40);}},
  {t:"トクトグルはとらえられ、重い刑を言いわたされます。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.P(m6(guard,{face:"none"}),56,132,88)+M6.P(m6(S(4),{face:"surprise",off:"none",hand:"none"}),130,132,84)+M6.P(m6(guard,{face:"none"}),200,132,88,{flip:1})+M6.bang(156,36);}},
  {t:"そして、遠いシベリアでの強制労働に送られることになりました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#5E6E8E")+M6.Up(m6(S(4),{face:"sad",off:"none",hand:"none"}),120,12,128)+M6.sfx(196,44,"…","#E8EEF4",0);}}],
 /* 第5話 遠いシベリア */
 [{t:"送られたのは、イルクーツクの近くの、ふるさとから遠くはなれた土地でした。",
   d:function(){return M6.sky("dark")+pine(40,108,1.1)+pine(80,104,.9)+pine(196,108,1.2)+snowGround+M6.P(m6(S(5),{face:"worry"}),130,132,78)+snow(30);}},
  {t:"きびしい寒さの中で、毎日はたらきました。",
   d:function(){return M6.sky("dark")+pine(28,108,1)+pine(214,104,1)+snowGround+M6.P(m6(S(5),{face:"determined",pose:"carry",hand:"none"}),110,132,82)+M6.sweat(134,46)+M6.lines(160,80,3,1)+snow(26);}},
  {t:"夜になると、ふるさとと家族のことを思い出しました。",
   d:function(){return M6.sky("night")+pine(34,108,1)+snowGround+M6.P(m6(S(5),{face:"sad",look:"u"}),80,132,80)+M6.dream(170,50,100,62,M6.yurt(150,74,.55)+M6.P(m6(MO,{face:"smile"}),192,78,46))+snow(14);}},
  {t:"それでも、ふるさとを思う気持ちは消えませんでした。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#5E6E8E")+M6.Up(m6(S(5),{face:"determined"}),120,12,128)+M6.spark(48,40,1,"#fff")+M6.spark(194,46,1,"#fff")+snow(12);}}],
 /* 第6話 ふるさとへの長い道 */
 [{t:"やがてトクトグルは、シベリアからふるさとへ向かって歩きだします。",
   d:function(){return M6.sky("dawn")+pine(30,108,1)+pine(64,104,.8)+snowGround+M6.P(m6(S(5),{face:"joy",pose:"run"}),150,132,80)+M6.lines(110,96,4,-1);}},
  {t:"帰った年は、資料によって1905年とも1910年とも書かれています。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.scroll(80,64,1.2,"1905？")+M6.scroll(170,64,1.2,"1910？")+M6.sfx(124,30,"？","#2C5D8F",0);}},
  {t:"旅のあいだ、ウズベクやカザフの人々とも出会いました。",
   d:function(){return M6.sky("day")+M6.steppe()+road+M6.P(m6(S(5),{face:"surprise",pose:"wave"}),60,132,80)+M6.P(m6(fr1,{face:"smile"}),150,132,80,{flip:1})+M6.P(m6(fr2,{face:"smile"}),206,132,80,{flip:1});}},
  {t:"いっしょに歩くうちに、友だちになったと伝えられています。",
   d:function(){return M6.sky("dusk")+M6.steppe("dusk")+M6.fire(120,120,.9)+M6.P(m6(fr1,{face:"laugh",pose:"toast"}),50,132,78)+M6.P(m6(S(5),{face:"laugh",pose:"both"}),120,132,80)+M6.P(m6(fr2,{face:"laugh",pose:"toast"}),192,132,78,{flip:1})+M6.heart(86,40)+M6.heart(156,40);}}],
 /* 第7話 帰ってきた歌い手 */
 [{t:"ふるさとにもどると、息子はすでに亡くなり、家族もばらばらになっていました。",
   d:function(){return M6.sky("dark")+M6.mts("dark")+M6.grass("dark")+M6.yurt(180,104,.8)+M6.P(m6(S(6),{face:"cry",pose:"cover",hand:"none"}),90,132,84)+M6.sfx(150,48,"…","#E8EEF4",0);}},
  {t:"それでもトクトグルは、コムズを手に、また歌いはじめます。",
   d:function(){return M6.sky("dawn")+M6.speed(120,70,"#F4C6A8")+M6.Up(m6(S(6),{face:"determined"}),120,12,128)+M6.note(48,40)+M6.note(196,36)+M6.sfx(196,74,"♪","#C99A2E",0);}},
  {t:"「まずしい人々の声」と呼ばれる、最も有名なアクンになりました。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.fire(120,120,1.1)+M6.P(m6(p1,{face:"laugh",pose:"both"}),30,132,56)+M6.P(m6(eld,{face:"joy"}),70,132,56)+M6.P(m6(S(7),{face:"laugh",off:"none"}),130,132,78)+M6.P(m6(p2,{face:"joy",pose:"heart"}),214,132,56,{flip:1})+M6.note(160,40)+M6.note(176,58);}},
  {t:"1928年には首都に招かれ、18曲の器楽曲が記録されました。",
   d:function(){return M6.yurtIn()+M6.P(m6(S(7),{face:"smile",off:"none"}),74,130,94)+M6.P(m6(clerk,{face:"joy"}),176,130,92,{flip:1})+M6.scroll(176,40,.8,"18")+M6.note(120,40)+M6.note(132,56);}}],
 /* 第8話 名前が残る町 */
 [{t:"トクトグルは1933年、ふるさとの村で亡くなり、そこに葬られました。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+'<path d="M108 120v-30l12-10 12 10v30z" fill="#C9D3DD" stroke="#8A8A8A" stroke-width="2"/><path d="M120 86v-10" stroke="#8A8A8A" stroke-width="2"/>'+M6.P(m6(p1,{face:"sad",pose:"pray"}),56,132,60)+M6.P(m6(p2,{face:"sad",pose:"pray"}),184,132,58,{flip:1});}},
  {t:"お墓には記念碑が建てられ、村には博物館もできました。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.city(80,106,1)+M6.statue(m6(S(8),{aura:null,spark:0,cape:null}),180,126,90);}},
  {t:"ジャララバード州のトクトグル町は、彼の名前から付けられました。",
   d:function(){return M6.sky("day")+M6.mts()+lake+M6.city(120,98,1.1)+M6.sfx(120,30,"トクトグル町","#2C5D8F",0);}},
  {t:"ビシケクには、彼の名前の通りや記念像があり、歌は今も歌われています。",
   d:function(){return M6.sky("day")+M6.grass()+M6.statue(m6(S(8),{aura:null,spark:0,cape:null}),120,120,100)+M6.P(m6(N.child,{face:"joy",pose:"point"}),44,132,52)+M6.P(m6(p2,{face:"smile"}),204,132,58,{flip:1})+M6.note(170,40)+M6.note(186,58);}}]
];
})();
