/* ===== Phase76：クルマンジャン・ダトカの道の4コマ（9話×4コマ、描き下ろし） =====
   実在の人物なので、本文（phase74_hist）にある事実だけを絵にする。創作の台詞は入れず、ふきだしは気持ちを表す短い言葉だけ。
   服装：娘のころはテベテイ（未婚）、結婚式は花嫁の帽子シュクル、結婚後はエレチェクと巻きスカート（ベルデムチ）。
   処刑の場面そのものは描かない。 */
(function(){
var P=null;P74_PATHS.forEach(function(x){if(x.id==="kurmanjan")P=x;});if(!P)return;
var S=function(k){var o=m6(P.st[Math.max(0,Math.min(8,k))],{});if(o.head==="elechek")o.beld=o.beld||"#2B2233";return o;};
var N=P74_NPC,FA=m6(N.manbat,{hand:"none"}),AB=m6(N.alymbek,{hand:"none"}),KB=m6(P.al[2].o,{hand:"none"});
var girl=m6(S(1),{hand:"none"}),bride=m6(S(1),{hand:"none",head:"shokulo",body:{type:"chapan",c:"#B3202B",t:"#E8B923"}});
var p1=m6(N.people1,{}),p2=m6(N.people2,{off:"none"}),eld=m6(N.elder,{hand:"none"});
var stranger=m6(N.people1,{head:"tebetei",headc:"#5E4A7E",body:{type:"chapan",c:"#5E4A7E",t:"#C99A2E"},beard:"#5A3A22"});
var envoy=m6(N.people1,{head:"none",body:{type:"robe",c:"#2E7E8F",t:"#E8B923"},beard:"#2B2233",hair:"#2B2233"});
var off=m6(N.officer,{head:"cap"}),MH=m6(N.officer,{head:"cap",headc:"#3A3F58",body:{type:"coat",c:"#3A3F58",t:"#C99A2E",epaulet:1}});
var guard=m6(N.officer,{head:"cap",beard:null});
P76.kurmanjan=[
 /* 序章 アライの山々 */
 [{t:"1811年、今のキルギス南部オシ州のアライ地方に、一人の女の子が生まれました。",
   d:function(){return M6.sky("day")+'<path d="M0 90l40-60 30 34 40-54 36 50 30-30 64 60v50H0z" fill="#9FB7C9"/><path d="M110 10l-14 20 9-2 5 7 5-7 10 3zM40 30l-9 12 6-1 3 4 3-4 6 1z" fill="#fff"/>'+M6.grass()+M6.yurt(196,108,.8)+M6.P(m6(S(0),{face:"joy",pose:"wave",off:"none"}),90,130,64);}},
  {t:"彼女の名はクルマンジャン。のちに「クルマンジャン・ダトカ」と呼ばれる実在の女性です。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.Up(m6(S(0),{face:"smile",off:"none"}),120,10,132)+M6.spark(40,40)+M6.spark(196,34);}},
  {t:"当時この地域は、コーカンド・ハン国という国の一部でした。",
   d:function(){return M6.sky("day")+M6.mts()+M6.grass()+M6.city(120,104,1.2)+M6.P(m6(p1,{face:"smile"}),30,132,50)+M6.P(m6(p2,{face:"smile"}),210,132,48,{flip:1});}},
  {t:"この道では、記録で確かめられる出来事をもとに、彼女の人生を紹介します。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.scroll(120,64,1.7,"1811〜1907")+M6.spark(50,30)+M6.spark(196,30);}}],
 /* 第1話 自分で選んだ道 */
 [{t:"18歳のころ、クルマンジャンは、会ったこともない男性と結婚させられそうになります。",
   d:function(){return M6.yurtIn()+M6.P(m6(eld,{pose:"point",face:"smile"}),56,130,96)+M6.P(m6(stranger,{face:"smile"}),118,130,96)+M6.P(m6(girl,{face:"worry"}),192,130,92,{flip:1})+M6.sweat(206,40);}},
  {t:"その人を、どうしても好きになれませんでした。",
   d:function(){return M6.yurtIn()+M6.speed(120,70,"#9AA4AE")+M6.Up(m6(girl,{face:"sad"}),120,10,132)+M6.sfx(172,40,"…","#2B2233",0);}},
  {t:"彼女は、いったん家を出ます。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.yurt(52,104,.9)+M6.P(m6(girl,{face:"determined",pose:"run"}),150,132,86,{rot:6})+M6.lines(110,90,4,-1);}},
  {t:"そして、父マンバトバイのもとで暮らすことを選びました。親が結婚相手を決めるのがふつうだった時代に、とてもめずらしいことでした。",
   d:function(){return M6.yurtIn()+M6.P(m6(FA,{face:"smile",pose:"reach"}),80,130,100)+M6.P(m6(girl,{face:"joy"}),160,130,92,{flip:1})+M6.heart(120,36);}}],
 /* 第2話 アリムベクとの結婚 */
 [{t:"1832年、クルマンジャンは、アライ地方を治めていたアリムベクと結婚します。",
   d:function(){return M6.yurtIn()+M6.P(m6(bride,{face:"smile",blush:1}),88,130,98)+M6.P(m6(AB,{face:"smile"}),156,130,102,{flip:1})+M6.spark(40,30)+M6.spark(206,30)+M6.heart(122,30);}},
  {t:"アリムベクは「ダトカ」という位をもつ有力者でした。",
   d:function(){return M6.steppe("day")+M6.speed(120,70,"#F2D28A")+M6.P(m6(AB,{face:"determined",pose:"hip"}),120,134,110)+M6.P(m6(p1,{face:"smile",pose:"pray"}),36,134,58)+M6.P(m6(p2,{face:"smile",pose:"pray"}),206,134,56,{flip:1})+M6.sfx(150,30,"ダトカ","#B3202B",-6);}},
  {t:"クルマンジャンは夫を支えながら、",
   d:function(){return M6.yurtIn()+M6.P(m6(S(2),{face:"smile",pose:"point"}),70,130,98)+M6.P(m6(AB,{face:"surprise",look:"l"}),140,130,100,{flip:1})+M6.P(m6(eld,{face:"smile"}),204,130,90,{flip:1})+M6.bub(70,22,"こうしては\nどうでしょう",88,40);}},
  {t:"人々の暮らしや、政治のことを学んでいきます。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(S(3),{face:"determined",pose:"hold",cape:null}),100,130,100)+M6.scroll(100,104,.6)+'<circle cx="160" cy="40" r="10" fill="#FFD34D" stroke="#2B2233" stroke-width="1.2"/><rect x="155" y="49" width="10" height="6" fill="#9AA4AE"/><path d="M146 28l-4-4M174 28l4-4M160 24v-5" stroke="#FFD34D" stroke-width="2"/>';}}],
 /* 第3話 突然の別れ */
 [{t:"1862年、夫アリムベクは、宮廷の争いの中で命を落とします。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(p1,{face:"cry",pose:"reach"}),70,130,94)+M6.P(m6(S(3),{face:"surprise",cape:null}),164,130,100,{flip:1})+M6.bang(196,24);}},
  {t:"深い悲しみの中でも――",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#3A4A6A")+M6.Up(m6(S(3),{face:"cry",pose:"cover",cape:null}),120,10,132);}},
  {t:"クルマンジャンは、アライの人々を見捨てませんでした。",
   d:function(){return M6.steppe("day")+M6.P(m6(p1,{face:"worry"}),50,132,74)+M6.P(m6(p2,{face:"worry"}),96,132,70)+M6.P(m6(N.child,{face:"worry"}),132,134,50)+M6.P(m6(S(3),{face:"determined",pose:"reach",cape:null}),196,132,94,{flip:1});}},
  {t:"ここから、彼女自身が人々を率いる時代が始まります。",
   d:function(){return M6.sky("dawn")+M6.mts()+M6.grass()+M6.horse(134,126,1,"#F2EEE4",{mane:"#8A6A4A",rider:m6(S(4),{face:"determined",pose:"point",cape:null})})+M6.P(m6(p1,{face:"joy",pose:"fist"}),36,134,52)+M6.spark(206,28);}}],
 /* 第4話 ダトカと呼ばれて */
 [{t:"夫を失ったクルマンジャンは、ブハラとコーカンドの君主たちから、",
   d:function(){return M6.sky("day")+M6.grass()+M6.city(70,100,.8)+M6.P(m6(envoy,{face:"smile",pose:"hold"}),150,132,94)+M6.scroll(150,104,.55)+M6.P(m6(envoy,{face:"smile",body:{type:"robe",c:"#7E3A2E",t:"#E8B923"}}),206,132,90,{flip:1});}},
  {t:"アライの統治者として認められ、「ダトカ」の位をあたえられました。",
   d:function(){return M6.yurtIn()+M6.speed(120,70,"#F5B301")+M6.P(m6(S(5),{face:"joy",hand:"none",off:"scroll"}),120,134,114)+M6.sfx(160,34,"ダトカ！","#B3202B",-6)+M6.spark(50,30);}},
  {t:"人々は、新しい指導者をむかえました。",
   d:function(){return M6.steppe("day")+M6.flag(120,108,"#7A1F2B")+M6.P(m6(p1,{face:"laugh",pose:"both"}),40,134,70)+M6.P(m6(p2,{face:"laugh",pose:"both"}),90,134,66)+M6.P(m6(eld,{face:"smile",pose:"pray"}),156,134,70)+M6.P(m6(N.child,{face:"joy",pose:"wave"}),206,134,50,{flip:1});}},
  {t:"女性が地域を治めるのは、当時としてはとてもめずらしいことでした。",
   d:function(){return M6.yurtIn()+M6.P(m6(S(5),{face:"determined",pose:"point"}),70,130,100)+M6.P(m6(p1,{face:"surprise",look:"l"}),150,130,84,{flip:1})+M6.P(m6(eld,{face:"smile",look:"l"}),204,130,84,{flip:1})+M6.spark(110,40);}}],
 /* 第5話 時代の大きな変化 */
 [{t:"1876年、アライ地方はロシア帝国に組みこまれます。",
   d:function(){var s=M6.sky("dark")+M6.mts("dark")+M6.grass("dark");for(var i=0;i<5;i++)s+=M6.P(m6(guard,{face:"none"}),40+i*40,108,40,{op:.8});return s+M6.P(m6(off,{face:"determined"}),120,136,74);}},
  {t:"戦おうという声もありました。けれどもクルマンジャンは、争いを続けるのではなく――",
   d:function(){return M6.yurtIn()+M6.P(m6(p1,{face:"angry",pose:"fist"}),60,130,90)+M6.P(m6(stranger,{face:"angry",pose:"fist"}),110,130,90)+M6.P(m6(S(5),{face:"determined",pose:"reach"}),190,130,100,{flip:1})+M6.bub(190,22,"待ちなさい",186,38);}},
  {t:"人々を説得して、新しい支配を受け入れる道を選びました。",
   d:function(){return M6.yurtIn()+M6.P(m6(S(6),{face:"determined",aura:null}),74,130,100)+M6.P(m6(off,{face:"smile"}),164,130,100,{flip:1})+'<rect x="96" y="100" width="48" height="10" fill="#8A5A2B" stroke="#2B2233"/>'+M6.scroll(120,94,.5);}},
  {t:"多くの命を守るための、つらく難しい決断だったと考えられています。",
   d:function(){return M6.sky("dusk")+M6.mts("dusk")+M6.grass("dusk")+M6.P(m6(S(6),{face:"sad",look:"d",aura:null}),120,132,100)+M6.yurt(40,104,.7)+M6.yurt(206,106,.7);}}],
 /* 第6話 母としての悲しみ */
 [{t:"1893年、クルマンジャンの息子たちと孫たちが、密輸と役人殺害の罪に問われます。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(guard,{face:"determined"}),44,130,92)+M6.P(m6(KB,{face:"sad",look:"d"}),110,130,90)+M6.P(m6(S(7),{face:"surprise"}),190,130,96,{flip:1})+M6.bang(206,26);}},
  {t:"いちばんかわいがっていた息子カムチベクには、死刑が言いわたされました。",
   d:function(){return M6.sky("night")+M6.speed(120,70,"#3A4A6A")+M6.Up(m6(S(7),{face:"cry"}),120,10,132);}},
  {t:"力ずくで息子を助け出そうという人々の声を、彼女は受け入れませんでした。",
   d:function(){return M6.yurtIn(1)+M6.P(m6(p1,{face:"angry",pose:"fist"}),56,130,90)+M6.P(m6(stranger,{face:"angry",pose:"fist"}),106,130,90)+M6.P(m6(S(7),{face:"sad",pose:"reach"}),188,130,96,{flip:1})+M6.bub(188,22,"なりません",184,38);}},
  {t:"1895年、彼女は公開の処刑の場に立ち会いました。のちに彼女は、オシで息子のとなりに葬られています。",
   d:function(){return M6.sky("night")+M6.mts("night")+M6.grass("night")+M6.P(m6(S(7),{face:"sleep",pose:"pray"}),120,130,96)+M6.spark(60,30,.8,"#F6F1E1")+M6.spark(190,24,.8,"#F6F1E1");}}],
 /* 第7話 遠くからの訪問者 */
 [{t:"晩年のクルマンジャンのもとには、遠くからも人が訪ねてきました。",
   d:function(){return M6.steppe("day")+M6.yurt(200,100,.9)+M6.horse(70,128,.72,"#8A5A3A",{mane:"#2B2233",rider:m6(MH,{face:"smile"})})+M6.P(m6(S(7),{face:"smile",pose:"wave"}),160,132,84,{flip:1});}},
  {t:"1906年には、旅をしていたロシア軍の大佐マンネルヘイムが、彼女に会いました。",
   d:function(){return M6.yurtIn()+M6.P(m6(MH,{face:"smile",pose:"pray"}),70,130,100)+M6.P(m6(S(7),{face:"smile"}),160,130,96,{flip:1})+M6.bowl(122,104,1.2);}},
  {t:"そして、彼女の写真をとっています。",
   d:function(){return M6.steppe("day")+M6.P(m6(S(7),{face:"determined",hand:"staff"}),70,132,96)+M6.camera(170,98,1.2)+M6.P(m6(MH,{face:"determined",pose:"reach"}),214,132,90,{flip:1})+M6.sfx(110,34,"パシャ","#F5B301",-6)+M6.spark(140,60,1.2,"#FFE36B");}},
  {t:"その写真は、今も彼女の姿を伝える大切な記録になっています。",
   d:function(){return M6.yurtIn()+M6.frame(120,62,70,84,M6.P(m6(S(7),{face:"determined",hand:"staff"}),120,104,76))+M6.P(m6(N.child,{face:"surprise"}),44,134,54)+M6.P(m6(p2,{face:"smile"}),206,134,62,{flip:1});}}],
 /* 第8話 アライの女王 */
 [{t:"クルマンジャン・ダトカは、1907年2月1日に亡くなりました。",
   d:function(){return M6.sky("dusk")+'<path d="M0 90l40-60 30 34 40-54 36 50 30-30 64 60v50H0z" fill="#B88A8A"/>'+M6.grass("dusk")+M6.P(m6(p1,{face:"sad",pose:"pray"}),70,132,70)+M6.P(m6(p2,{face:"sad",pose:"pray"}),120,132,66)+M6.P(m6(eld,{face:"sad",pose:"pray"}),170,132,70);}},
  {t:"人々は彼女を「アライの女王」と呼んで敬いました。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#F2D28A")+M6.Up(m6(S(8),{face:"smile",aura:null,spark:null}),120,10,132)+M6.spark(40,40)+M6.spark(200,40);}},
  {t:"今ではキルギスの50ソム紙幣に、彼女の肖像がえがかれています。",
   d:function(){return M6.sky("day")+M6.speed(120,70,"#C9B6DA")+M6.note50(120,70,1.6);}},
  {t:"2004年には、首都ビシケクに記念像が建てられました。",
   d:function(){return M6.sky("day")+M6.grass()+M6.statue(m6(S(8),{face:"smile",aura:null,spark:null}),120,96,72)+M6.P(m6(N.child,{face:"joy",pose:"point"}),40,134,54)+M6.P(m6(p2,{face:"smile",pose:"wave"}),200,134,60,{flip:1});}}]
];
})();
