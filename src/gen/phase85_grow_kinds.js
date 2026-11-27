/* ===== Phase85：育てるモードの仲間（10種類） =====
   どの仲間も10段階。段階5（6つ目）で「進化の道」を2つから選ぶ（マナスだけは物語どおり1本道）。
   仲間の形：{id,name,sub,brAt,br:{a:{n,x},b:{n,x}},t(i,b),x(i,b),bg(i,b),fig(i,b),c(i,b)}
     i＝段階 0〜9、b＝選んだ道 "a"/"b"（選ぶ前は null）。
   文化の言葉（タイガン・トゥルパル・トモゴ・アルプ・カラ・クシュ・アジダール・コムズ・アクン・シルダク・トゥマル）は
   キルギスの暮らしや昔話に実際にある言葉。動物の姿や「〜の道」の中身はこのアプリの創作（そう書いてある）。 */
var PGR_KINDS={},PGR_ORDER=[];
function pgrAdd(k){PGR_KINDS[k.id]=k;PGR_ORDER.push(k.id);}
/* 背景（240×140） */
var PGB={
  steppe:function(k){return M6.steppe(k||"day");},
  meadow:function(){var s=M6.steppe("day"),cs=["#F48FB1","#FFD34D","#FFFFFF","#B39DDB"];for(var i=0;i<26;i++){var x=(i*37)%236+2,y=96+((i*13)%40);s+='<circle cx="'+x+'" cy="'+y+'" r="1.8" fill="'+cs[i%4]+'"/>';}return s;},
  snow:function(k){return M6.sky(k||"day")+M6.mts(k||"day")+'<path d="M0 92q60-12 120-4t120-4v56H0z" fill="#F4F8FB"/><path d="M0 112q80-10 240 0v28H0z" fill="#E3EDF4"/>'+[[30,20],[80,40],[150,16],[200,44],[120,60],[60,70],[220,80]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.6" fill="#fff" opacity=".9"/>';}).join("");},
  high:function(k){return M6.sky(k||"day")+'<path d="M0 90l40-58 22 26 30-46 34 52 30-30 40 40 44-30v56H0z" fill="#8EA6BC"/><path d="M40 32l-12 16 8-2 4 6 6-6 6 2zM92 12l-14 20 9-3 5 7 6-7 8 3zM196 60l-8 10 6-1 3 4 4-4 5 1z" fill="#fff"/>'+M6.grass(k||"day");},
  sky:function(k){var s=M6.sky(k||"day")+'<path d="M0 120q40-14 80-6t80-6 80 6v26H0z" fill="#9FB7C9" opacity=".7"/>',op=k==="night"?".28":".92";
    [[40,40,1],[170,28,1.2],[110,96,1.4],[214,90,.9]].forEach(function(c){s+='<g transform="translate('+c[0]+' '+c[1]+') scale('+c[2]+')" fill="#fff" opacity="'+op+'"><ellipse cx="0" cy="0" rx="18" ry="7"/><ellipse cx="-9" cy="-4" rx="9" ry="7"/><ellipse cx="7" cy="-6" rx="10" ry="8"/></g>';});return s;},
  cliff:function(k){return M6.sky(k||"day")+M6.mts(k||"day")+'<path d="M0 100q30-6 60-2l30 2v40H0z" fill="#9AA4AE"/><path d="M150 140v-40q30-10 90-6v46z" fill="#9AA4AE"/><path d="M60 98q60 10 90 2v40H60z" fill="#8DBF6A"/>';},
  yurt:function(n){return M6.yurtIn(n);}
};
/* 図を置く：x＝足もとの中心、y＝地面、s＝大きさ */
function pgPut(svg,x,y,s){return '<g transform="translate('+x+' '+y+') scale('+s.toFixed(3)+')">'+svg+'</g>';}
var PGA=[0,.14,.28,.42,.56,.7,.82,.92,1,1];/* 段階ごとの育ちぐあい */
/* 動物の仲間を作る共通の形 */
function pgrAnimal(d){
  var pick=function(arr,arrA,arrB,i,b){return i<5?arr[i]:(b==="b"?arrB:arrA)[i-5];};
  return {id:d.id,name:d.name,sub:d.sub,brAt:5,br:d.br,
    t:function(i,b){return pick(d.T,d.Ta,d.Tb,i,b);},
    x:function(i,b){return pick(d.X,d.Xa,d.Xb,i,b);},
    bg:function(i,b){return d.bg(i,b);},
    fig:function(i,b){var sc=(d.sc?d.sc(i,b):1.0+.042*i);return pgPut(d.draw(i,b),d.x||120,d.y||132,sc);},
    c:function(i,b){var sc=(d.sc?d.sc(i,b):1.0+.042*i);return [d.x||120,(d.y||132)-(d.h||40)*sc];}};
}
/* ---------------- 1) マナス（物語どおりの1本道） ---------------- */
(function(){
  var P=null;try{P74_PATHS.forEach(function(x){if(x.id==="manas")P=x;});}catch(_){}
  if(!P||typeof M6==="undefined")return;
  var S=function(k){return P.st[k];},N=P74_NPC;
  var C=m6(N.chiyirdy,{beld:"#2B2233"}),AL=m6(P.al[2].o,{braid:"#E8B923"}),KN=m6(N.kanykey,{beld:"#3A2A4A"}),BK=P.al[1].o;
  var mate=function(c){return {hand:"spear",off:"none",head:"kalpak",body:{type:"chapan",c:c,t:"#E8D5A8"},hair:"#2B2233"};};
  var AK="#F2EEE4",AKM="#8A6A4A";/* アク・クラ：白っぽい灰色の馬（phase76_manas と同じ色） */
  var st=[
   {t:"ゆりかごのマナス",bg:function(){return M6.yurtIn()+M6.P(m6(C,{face:"joy",look:"d"}),62,134,100);},
    fig:function(){return M6.beshik(142,130,2.6)+M6.spark(170,56,.9,"#FFD34D")+M6.heart(118,52,.8);},c:[142,92],
    x:"物語では、ジャクプとチユルドゥの夫婦が長いあいだ祈りつづけて、やっと生まれた男の子がマナスです。ゆりかごは「ベシク（бешик）」と呼ばれる木のゆりかごです。"},
   {t:"少年マナス",bg:function(){return M6.steppe("day")+M6.yurt(206,104,.8)+M6.sheep(168,128,.9,1)+M6.sheep(196,134,.8,1);},
    fig:function(){return M6.P(m6(S(0),{face:"laugh",pose:"wave"}),104,136,100);},c:[104,84],
    x:"遊牧の暮らしでは、子どもも羊や馬の世話を手伝いました。物語の少年マナスも、草原で元気に育ちます。"},
   {t:"力自慢の少年",bg:function(){return M6.steppe("day")+M6.yurt(214,104,.7);},
    fig:function(){return M6.P(m6(S(1),{pose:"wave",face:"laugh",hand:"none"}),108,136,104)+M6.rock(138,74,.95)+M6.sweat(96,46)+M6.lines(176,60,3,1);},c:[112,80],
    x:"物語では、少年マナスは力が強く、元気にあふれていて、まわりの大人をおどろかせます。"},
   {t:"馬を乗りこなす少年",bg:function(){return M6.steppe("day")+M6.yurt(30,100,.6);},
    fig:function(){return M6.horse(128,130,1.08,AK,{mane:AKM,run:1,rider:m6(S(1),{face:"joy"})})+M6.lines(46,70,4,-1);},c:[134,66],
    x:"とても小さいころから、すぐれた馬に乗れるようになったと語られます。愛馬アク・クラ（Аккула）は、物語の中で何度も活やくします。"},
   {t:"若き勇者",bg:function(){return M6.steppe("dawn")+M6.eagle(190,30,.85);},
    fig:function(){return M6.P(m6(S(2),{face:"determined",look:"r"}),116,138,124);},c:[116,72],
    x:"弓と馬は、草原で暮らす人々にとって大切な道具でした。物語の若いマナスも、勇者として名を知られていきます。"},
   {t:"四十人の仲間の長",bg:function(){return M6.steppe("day")+M6.flag(206,118,"#B3202B")+M6.P(mate("#6B8E4E"),34,124,74)+M6.P(mate("#C7823E"),62,128,80)+M6.P(mate("#5E4A7E"),176,128,80,{flip:1})+M6.P(mate("#3E6E4A"),204,124,74,{flip:1});},
    fig:function(){return M6.P(m6(S(3),{face:"determined",pose:"fist"}),120,138,124);},c:[120,72],
    x:"物語では、マナスは若いうちに「四十人の仲間（кырк чоро）」をつくります。仲間たちは一生マナスを助け、最後までともに戦ったと語られます。"},
   {t:"アルマンベトの友",bg:function(){return M6.steppe("dusk")+M6.P(m6(AL,{face:"smile"}),168,136,116,{flip:1});},
    fig:function(){return M6.P(m6(S(4),{face:"smile",pose:"fist"}),88,136,120);},c:[88,72],
    x:"別の国で育った勇者アルマンベト（Алмамбет）が、長い旅のすえに仲間に加わります。二人は兄弟のような友になります。"},
   {t:"カヌケイの夫",bg:function(){return M6.steppe("day")+M6.yurt(210,104,.85)+M6.P(m6(KN,{face:"smile"}),164,136,110,{flip:1});},
    fig:function(){return M6.P(m6(S(5),{face:"smile"}),90,136,120);},c:[90,72],
    x:"妻カヌケイ（Каныкей）は、かしこく、人をもてなす心をもった女性として描かれます。夫が人々をまとめる戦いにも、自分から力を貸しました。"},
   {t:"民のかしら",bg:function(){return M6.steppe("day")+M6.yurt(26,100,.6)+M6.yurt(66,96,.5)+M6.yurt(218,100,.6)+M6.P(m6(BK,{face:"smile"}),200,134,78,{flip:1});},
    fig:function(){return M6.horse(118,132,1.15,AK,{mane:AKM,rider:m6(S(6),{face:"determined"})})+M6.flag(60,128,"#B3202B");},c:[122,62],
    x:"マナスたちの大きな目的は、ばらばらになっていた部族をまとめ、一つの民にすることでした。知恵のある相談役バカイ（Бакай）も、マナスを支えます。"},
   {t:"英雄マナス",bg:function(){return M6.steppe("dawn")+M6.speed(120,70,"#F2D28A")+M6.eagle(40,28,.85)+M6.flag(214,122,"#B3202B");},
    fig:function(){return M6.horse(120,134,1.25,AK,{mane:AKM,run:1,rider:m6(S(8),{face:"determined",olpok:1})});},c:[124,58],
    x:"白い戦衣アク・オルポクを着て愛馬アク・クラに乗り、仲間をひきいて大遠征（Чоң казат）に出る英雄の姿です。2013年、「マナス」の三部作はユネスコの無形文化遺産に登録されました。"}];
  pgrAdd({id:"manas",name:"マナス",sub:"キルギスの英雄叙事詩の主人公。物語どおりに育つ",brAt:0,
    t:function(i){return st[i].t;},x:function(i){return st[i].x;},bg:function(i){return st[i].bg();},fig:function(i){return st[i].fig();},c:function(i){return st[i].c;}});
})();

/* ---------------- 2) おじさん ---------------- */
(function(){
  if(typeof M6==="undefined")return;
  var base={hand:"none",off:"none",head:"kalpak",body:{type:"chapan",c:"#5E7F9A",t:"#E8D5A8"},beard:"#5A3A22",hair:"#5A3A22"};
  var fur={hand:"none",off:"none",head:"kalpak",body:{type:"chapan",c:"#7A1F2B",t:"#E8B923",fur:1},beard:"#5A3A22",hair:"#5A3A22"};
  var gray=function(o){return m6(o,{beard:"#D8D8D8",hair:"#D8D8D8"});};
  var O=function(i,b){if(i<4)return base;var o=fur;if(i>=7)o=m6(fur,{body:{type:"chapan",c:b==="b"?"#3E3A7A":"#5A4A2A",t:"#E8B923",fur:1}});if(i>=8)o=gray(o);return o;};
  var draw=function(i,b){
    if(i===0)return M6.P(m6(base,{head:"none",body:{type:"chapan",c:"#9FB7C9",t:"#E8EEF4"},face:"sleep",pose:"none"}),120,136,106)+M6.zz(148,40)+M6.zz(162,26);
    if(i===1)return M6.P(m6(base,{pose:"both",face:"laugh"}),120,136,108);
    if(i===2)return M6.P(m6(base,{hand:"whip",face:"smile",pose:"wave"}),110,136,108);
    if(i===3)return M6.horse(124,132,1.05,"#8A5A2B",{mane:"#2B2233",rider:m6(base,{face:"joy"})});
    if(i===4)return M6.P(m6(O(4),{face:"smile",pose:"hip"}),118,136,116);
    if(b!=="b"){/* 鷹匠の道 */
      if(i===5)return M6.P(m6(O(5),{face:"joy",pose:"wave"}),112,136,116)+pgPut(pgBird({a:.1,fuzz:1,col:"#F4F1EA"}),150,82,.7);
      if(i===6)return M6.P(m6(O(6),{face:"determined",pose:"wave"}),110,136,118)+pgPut(pgBird({a:.7,col:"#6E4A22",hood:1}),150,78,.62);
      if(i===7)return M6.horse(118,132,1.1,"#5A3A22",{mane:"#2B2233",rider:m6(O(7),{face:"determined"})})+pgPut(pgBird({a:.8,col:"#6E4A22",spread:1}),168,48,.55);
      if(i===8)return M6.P(m6(O(8),{face:"laugh",pose:"wave"}),106,136,120)+pgPut(pgBird({a:.9,col:"#6E4A22",acc:{tumar:"#E8B923"}}),146,74,.66)+M6.flag(176,132,"#B3202B")+pgTumar(106,96,"#E8B923");
      return M6.P(m6(O(9),{face:"determined",pose:"wave",aura:"#FFD34D"}),104,136,124)+pgPut(pgBird({a:1,col:"#6E4A22",spread:1,acc:{aura:"#FFD34D"}}),150,66,.8);}
    /* 語り手の道 */
    if(i===5)return M6.P(m6(O(5),{face:"smile",pose:"hold"}),114,136,116)+pgKomuz(118,104,1,-50);
    if(i===6)return M6.P(m6(O(6),{face:"laugh",pose:"hold"}),114,136,118)+pgKomuz(118,104,1,-50)+M6.note(150,50)+M6.note(76,40);
    if(i===7)return M6.fire(160,128,1)+M6.P(m6(O(7),{face:"joy",pose:"hold"}),104,136,118)+pgKomuz(108,104,1,-50)+M6.note(70,40)+M6.note(140,34);
    if(i===8)return M6.P(m6(O(8),{face:"determined",pose:"both"}),114,136,120)+M6.note(60,40)+M6.note(170,30)+M6.note(186,60);
    return M6.P(m6(O(9),{face:"laugh",pose:"both",aura:"#B39DDB"}),116,136,126)+M6.note(56,30)+M6.note(180,24)+M6.note(196,56)+M6.spark(40,60,1,"#FFD34D");
  };
  var bgs=function(i,b){
    if(i===0)return M6.yurtIn(1);if(i===1)return M6.steppe("dawn")+M6.yurt(200,100,.8);
    if(i===2)return M6.steppe("day")+M6.sheep(170,128,.9,1)+M6.sheep(200,134,.8,1);if(i<5)return M6.steppe("day")+M6.yurt(30,100,.6);
    if(b==="b")return i>=7?M6.yurtIn(1):M6.steppe(i===5?"day":"dusk")+M6.yurt(206,100,.7);
    return i===9?M6.steppe("dawn")+M6.speed(120,70,"#F2D28A"):PGB.high(i===7?"dusk":"day");
  };
  var T=["ねぼすけのおじさん","早起きのおじさん","羊飼いのおじさん","馬に乗るおじさん","草原の名人"],
      X=["朝が苦手なおじさん。まだユルトの中で寝ています。","朝日をあびて、大きくのびをするようになりました。","羊の世話をまかされて、むちを持って草原へ。","馬に乗って、草原をぐるりと見まわります。","毛皮のえりのチャパン（長い上着）を着るようになりました。そろそろ進む道を選ぶころです。"],
      Ta=["鷹匠の見習い","鷹匠","狩りの名人","祭りの名鷹匠","伝説の鷹匠"],
      Xa=["イヌワシのひなを育て始めました。","腕にイヌワシをのせて歩きます。ワシの頭には目かくしの帽子「トモゴ（томого）」。","馬の上からワシを放ちます。","祭りでワシの腕前を見せ、お守りのトゥマルをもらいました。","ひげは白くなっても、ワシとの息はぴったり。草原で知らない人はいません。"],
      Tb=["コムズを習うおじさん","歌うおじさん","宴の語り手","名高いアクン","伝説の語り手"],
      Xb=["3本の弦の楽器コムズ（комуз）を習い始めました。","コムズをひきながら、楽しい歌をうたいます。","たき火の前で、昔話を語って聞かせます。","その場で歌を作って歌い返す歌い手「アクン（акын）」として知られるようになりました。","ひげは白くなっても声はよく通り、聞く人を夢中にさせます。"];
  pgrAdd({id:"oji",name:"おじさん",sub:"ねぼすけのおじさんが、草原の名人に",brAt:5,
    br:{a:{n:"鷹匠の道",x:"イヌワシと狩りをする「ブルクチュ（бүркүтчү）」をめざします。"},b:{n:"語り手の道",x:"コムズをひいて歌い、物語を語る人をめざします。"}},
    t:function(i,b){return i<5?T[i]:(b==="b"?Tb:Ta)[i-5];},x:function(i,b){return i<5?X[i]:(b==="b"?Xb:Xa)[i-5];},
    bg:bgs,fig:draw,c:function(i){return i===0?[120,100]:[116,74];}});
})();

/* ---------------- 3〜10) 動物と伝説の生きもの ---------------- */
(function(){
  if(typeof M6==="undefined")return;
  /* かざりを段階に合わせて足していく */
  var acc=function(i,list){var o={};list.forEach(function(x){if(i>=x[0])o[x[1]]=x[2];});return o;};
  var mix=function(a,b){var o={};for(var k in a)o[k]=a[k];for(var j in b)o[j]=b[j];return o;};

  /* 犬（タイガン） */
  pgrAdd(pgrAnimal({id:"dog",name:"犬",sub:"子犬から、草原の頼もしい犬に",h:44,
    br:{a:{n:"狩りの犬（タイガン）",x:"キルギスの足の速い猟犬「タイガン（тайган）」の道。細い体で風のように走ります。"},b:{n:"守りの犬",x:"羊の群れとユルトを守る、大きくてやさしい犬の道。"}},
    T:["子犬","よちよち子犬","元気な子犬","若い犬","草原の犬"],
    X:["ころころの子犬が仲間になりました。","短い足で、一生けんめい歩きます。","赤いスカーフをもらいました。","首に鈴をつけました。歩くとちりんと鳴ります。","ぐんと大きくなりました。そろそろ進む道を選ぶころです。"],
    Ta:["狩りの見習い","風の足の犬","ワシと組む犬","草原一の狩り犬","伝説のタイガン"],
    Xa:["体がすらりと細くなり、足が長くなりました。青い上着をもらいました。","草原を風のように走ります。","キルギスでは、イヌワシと犬がいっしょに狩りに出ることもあります。","首にお守りのトゥマル。だれよりも速く走ります。","金色の光をまとう、伝説のタイガンです。"],
    Tb:["羊の番犬","ユルトの守り","群れのリーダー","村の英雄","伝説の守り犬"],
    Xb:["シルダク（フェルトのじゅうたん）の模様の背かけをもらって、羊の番をします。","房かざりが増えました。ユルトをしっかり守ります。","小さなカルパクをかぶって、群れの先頭を歩きます。","お守りのトゥマルをもらった、村の人気者です。","大きな体でみんなを守る、伝説の守り犬です。"],
    bg:function(i,b){return i>=5&&b!=="b"?(i===9?PGB.steppe("dawn")+M6.speed(120,70,"#F2D28A"):PGB.steppe(i===7?"dusk":"day")+(i===7?M6.eagle(60,30,.8):"")):PGB.steppe("day")+M6.yurt(206,100,.75)+(i>=5?M6.sheep(40,128,.8)+M6.sheep(62,134,.7):"");},
    draw:function(i,b){var o={a:PGA[i],col:"#E8D2B0",bel:"#FFF6E6",ear:"dog",tail:"dog",sn:.9,leg:1.1,ecol:"#B98B5E",closed:i===1,acc:acc(i,[[2,"scarf","#B3202B"],[3,"bell",1]])};
      if(i>=5&&b!=="b")o=mix(o,{col:"#E2C9A2",leg:1.4,len:1.12,bh:.85,sn:1.15,head:.9,acc:mix({scarf:"#B3202B"},acc(i,[[5,"cloth","#2C5D8F"],[8,"tumar","#E8B923"],[9,"aura","#FFD34D"],[9,"mark","#FFE27A"]]))});
      if(i>=5&&b==="b")o=mix(o,{col:"#D9B88E",bel:"#FFF1DE",bh:1.18,len:1.05,head:1.08,ecol:"#7A5A3A",acc:mix({bell:1},acc(i,[[5,"cloth","#B3202B"],[6,"tassels",1],[7,"kalpak",1],[8,"tumar","#E8B923"],[9,"aura","#FFB84D"]]))});
      return pgQ(o);}}));

  /* 猫 */
  pgrAdd(pgrAnimal({id:"cat",name:"猫",sub:"ユルトでくらす子猫が、ふしぎな猫に",h:38,
    br:{a:{n:"ユルトの守り猫",x:"ユルトの家族を見守る、たのもしい猫の道。"},b:{n:"星の猫",x:"夜空の星に親しむ、ふしぎな猫の道（このアプリの創作）。"}},
    T:["子猫","ねむい子猫","遊ぶ子猫","若い猫","ユルトの猫"],
    X:["小さな子猫が仲間になりました。","まるくなって、すやすやねむります。","赤いリボンをもらって、毛糸で遊びます。","首に鈴をつけました。","しっぽがすらりと長くなりました。そろそろ進む道を選ぶころです。"],
    Ta:["ユルトの見張り番","カルパクの猫","宴の人気者","ユルトの守り神","伝説の守り猫"],
    Xa:["小さなカルパクをかぶって、天窓トゥンドゥクの下で家族を見守ります。","ユルトのすみずみまで見まわります。","青いシルダクの背かけで、宴の人気者に。","お守りのトゥマルと赤いマント。","ユルトのみんなを守る、伝説の猫です。"],
    Tb:["夜空を見る猫","星のしるしの猫","月夜の猫","星を集める猫","伝説の星の猫"],
    Xb:["毛の色が夜空のように深くなりました。","ひたいに星のしるしがあらわれました。","むらさきのスカーフをなびかせ、月夜を歩きます。","夜空色のマントをまといます。","星の冠をいただく、伝説の猫です。"],
    bg:function(i,b){return i>=5&&b==="b"?PGB.steppe("night"):PGB.yurt(i===1);},
    draw:function(i,b){var o={a:PGA[i],col:"#F2A65A",bel:"#FFF1DE",ear:"cat",tail:"cat",sn:.35,closed:i===1,acc:acc(i,[[2,"ribbon","#E2483B"],[3,"bell",1]])};
      if(i>=5&&b!=="b")o.acc=mix(o.acc,acc(i,[[5,"kalpak",1],[7,"cloth","#2C5D8F"],[8,"tumar","#E8B923"],[8,"cape","#B3202B"],[9,"aura","#FFD34D"]]));
      if(i>=5&&b==="b")o=mix(o,{col:"#3E4A7A",bel:"#8FA0D8",eyec:"#2B2233",stars:i>=6,acc:acc(i,[[6,"mark","#FFE27A"],[7,"scarf","#B39DDB"],[8,"cape","#2A2350"],[9,"crown","#FFE27A"],[9,"aura","#B39DDB"]])});
      return pgQ(o);}}));

  /* うさぎ */
  pgrAdd(pgrAnimal({id:"rabbit",name:"うさぎ",sub:"ちいさなうさぎが、季節の主に",h:44,
    br:{a:{n:"雪うさぎ",x:"冬の天山で、雪のように白くなるうさぎの道。"},b:{n:"花うさぎ",x:"春の草原で、花にかこまれるうさぎの道。"}},
    T:["子うさぎ","ねむい子うさぎ","はねる子うさぎ","若いうさぎ","草原のうさぎ"],
    X:["ちいさな子うさぎが仲間になりました。","耳をたたんで、すやすやねむります。","ぴょんぴょん。黄色いスカーフをもらいました。","耳がのびて、遠くの音も聞こえます。","足が強くなりました。そろそろ進む道を選ぶころです。"],
    Ta:["白くなるうさぎ","雪原のうさぎ","吹雪のうさぎ","雪山の主","伝説の雪うさぎ"],
    Xa:["毛が雪のように白くなってきました。","赤いスカーフで雪原をかけます。","お守りのトゥマルで吹雪もへっちゃら。","銀の冠をいただく雪山の主。","光る雪をまとう、伝説のうさぎです。"],
    Tb:["花をつむうさぎ","花かざりのうさぎ","春をよぶうさぎ","草原の花の主","伝説の花うさぎ"],
    Xb:["花の冠をかぶりました。","草原の花にかこまれてはねまわります。","ピンクのリボンで、春の草原をはねます。","シルダクの背かけと花の冠。","花の光につつまれる、伝説のうさぎです。"],
    bg:function(i,b){return i>=5?(b==="b"?PGB.meadow():PGB.snow("day")):PGB.steppe("day");},
    draw:function(i,b){var o={a:PGA[i],col:"#D8BFA0",bel:"#FFF6E6",ear:"rab",tail:"pom",sn:.3,leg:.8,closed:i===1,acc:acc(i,[[2,"scarf","#F2C230"]])};
      if(i>=5&&b!=="b")o=mix(o,{col:i===5?"#EFE8DE":"#F8F8F6",bel:"#FFFFFF",ein:"#F4C6C6",acc:mix({scarf:"#B3202B"},acc(i,[[7,"tumar","#E8B923"],[8,"crown","#DCE3EA"],[9,"aura","#BFE8FF"],[9,"mark","#BFE8FF"]]))});
      if(i>=5&&b==="b")o=mix(o,{col:"#F6E6DA",bel:"#FFFFFF",acc:acc(i,[[5,"flowers",1],[7,"ribbon","#F48FB1"],[8,"cloth","#B3202B"],[9,"aura","#F48FB1"]])});
      return pgQ(o);}}));

  /* ヤク */
  pgrAdd(pgrAnimal({id:"yak",name:"ヤク",sub:"ふわふわの子ヤクが、天山の大ヤクに",h:46,
    sc:function(i){return i===9?1.5:.98+.045*i;},
    br:{a:{n:"荷運びのヤク",x:"高い山の道で、荷物を運んで人を助けるヤクの道。"},b:{n:"祭りのヤク",x:"きれいなかざりをつけて、祭りで人気者になるヤクの道。"}},
    T:["子ヤク","ふわふわの子ヤク","角が出た子ヤク","若いヤク","高原のヤク"],
    X:["ふわふわの子ヤクが仲間になりました。キルギスの高い山の牧草地では、ヤクが飼われています。","長い毛がのびてきました。","小さな角が生えてきました。","首に鈴をつけました。","がっしりした体になりました。そろそろ進む道を選ぶころです。"],
    Ta:["荷物を運ぶヤク","峠をこえるヤク","山の道案内","キャラバンの先頭","天山の大ヤク"],
    Xa:["背中に荷物をのせて歩きます。","寒い峠も、長い毛で平気です。","お守りのトゥマルをつけて、山道を案内します。","キャラバン（荷物を運ぶ隊）の先頭を歩きます。","山のように大きくなった、伝説の大ヤクです。"],
    Tb:["かざりのヤク","祭りのヤク","房かざりのヤク","草原の人気者","伝説の大ヤク"],
    Xb:["赤いシルダクの背かけをもらいました。","房かざりをゆらして、祭りに出かけます。","頭に花かざり。","みんなが会いに来る人気者です。","山のように大きくなった、伝説の大ヤクです。"],
    bg:function(i,b){return i===9?PGB.high("dawn"):PGB.high("day");},
    draw:function(i,b){var o={a:PGA[i],col:"#7E6656",bel:"#9A8474",snc:"#B09A88",ear:"yak",tail:"yak",sn:.75,horn:1.5,fluff:1,fcol:"#4A3A32",hoof:1,len:1.15,bh:1.25,leg:.85,head:1.08,acc:acc(i,[[3,"bell",1]])};
      if(i>=5&&b!=="b")o.acc=mix(o.acc,acc(i,[[5,"bags",1],[7,"tumar","#E8B923"],[9,"aura","#FFD34D"]]));
      if(i>=5&&b==="b")o.acc=mix(o.acc,acc(i,[[5,"cloth","#B3202B"],[6,"tassels",1],[7,"flowers",1],[9,"aura","#F48FB1"]]));
      if(i===9)o.hcol="#FFF3C8";
      return pgQ(o);}}));

  /* 天馬（トゥルパル） */
  pgrAdd(pgrAnimal({id:"tulpar",name:"天馬トゥルパル",sub:"子馬に翼が生えて、空をかける名馬に",h:62,
    br:{a:{n:"白いトゥルパル",x:"白い体に金のたてがみ。英雄を乗せて空をかける道。"},b:{n:"夜空のトゥルパル",x:"星をまとい、夜空をわたる道（このアプリの創作）。"}},
    T:["子馬","走る子馬","翼が生えた子馬","空を見上げる若駒","翼の若駒"],
    X:["トゥルパル（тулпар）は、キルギスなど中央アジアの物語に出てくる、翼のある名馬です。まずは小さな子馬から。","長い足で、草原を走りまわります。","背中に小さな翼が生えてきました。","翼が大きくなり、空にあこがれます。","いよいよ飛べそう。そろそろ進む道を選ぶころです。"],
    Ta:["白い翼の馬","風をきる天馬","雲をこえる天馬","英雄の天馬","伝説のアク・トゥルパル"],
    Xa:["たてがみが金色にかがやきます。","赤い鞍敷きをつけて、風をきって飛びます。","お守りのトゥマルをつけて、雲の上へ。","英雄を乗せるのにふさわしい姿です。","「アク（白い）」の名をもつ、伝説の天馬です。"],
    Tb:["夜空の若駒","星をまとう天馬","月をわたる天馬","夜明けをつげる天馬","伝説の夜空のトゥルパル"],
    Xb:["体が夜空の色に変わりました。","体に星がまたたきます。","ひたいに星のしるし。月をわたって飛びます。","夜空色のマントをなびかせます。","星の冠をいただく、伝説の天馬です。"],
    bg:function(i,b){return i<2?PGB.steppe("day"):(b==="b"&&i>=5?PGB.sky("night"):PGB.sky(i===9?"dawn":"day"));},
    draw:function(i,b){var o={a:PGA[i],col:"#F4F1EA",bel:"#FFFFFF",mane:"#C9D3DD",ear:"horse",tail:"horse",sn:.9,neck:1,leg:1.4,hoof:1,wing:[0,0,.35,.55,.75,1,1,1,1,1.1][i],wcol:"#FFFFFF",acc:{}};
      if(i>=5&&b!=="b")o=mix(o,{mane:"#F2C230",wcol:"#FFF8E6",acc:acc(i,[[6,"cloth","#B3202B"],[7,"tumar","#E8B923"],[8,"armor","#F2C230"],[9,"aura","#FFD34D"],[9,"mark","#FFE27A"]])});
      if(i>=5&&b==="b")o=mix(o,{col:"#2E3A66",bel:"#4A5A8E",mane:"#B39DDB",wcol:"#8FA0D8",stars:i>=6,acc:acc(i,[[7,"mark","#FFE27A"],[8,"cape","#2A2350"],[9,"crown","#FFE27A"],[9,"aura","#B39DDB"]])});
      return pgQ(o);}}));

  /* ユキヒョウ */
  pgrAdd(pgrAnimal({id:"leopard",name:"ユキヒョウ",sub:"天山の子ユキヒョウが、山の王に",h:40,
    br:{a:{n:"山の王",x:"天山の岩山を治める、強いユキヒョウの道。"},b:{n:"雪の精",x:"雪と氷の光をまとう、ふしぎなユキヒョウの道（このアプリの創作）。"}},
    T:["子ユキヒョウ","ねむい子ユキヒョウ","雪であそぶ子","若いユキヒョウ","岩山のユキヒョウ"],
    X:["ユキヒョウ（илбирс）は天山などの高い山にすむ動物で、キルギスの大切なシンボルです。","太いしっぽを抱いて、まるくなってねむります。","雪の上をころころ転がって遊びます。","太くて長いしっぽで、岩の上でもバランスをとります。","たくましくなりました。そろそろ進む道を選ぶころです。"],
    Ta:["岩山の若者","雪山の狩人","峰の守り手","天山の王","伝説のユキヒョウ"],
    Xa:["首にお守りのトゥマル。岩から岩へ、軽々ととび移ります。","雪山を見わたして、えものをさがします。","赤いマントをなびかせて、峰を守ります。","金の冠をいただく、天山の王です。","金色の光をまとう、伝説のユキヒョウです。"],
    Tb:["雪の子","氷のひとみ","吹雪をまとう者","雪の精霊","伝説の雪の精"],
    Xb:["毛が雪のように白く光りはじめました。","ひとみが氷の色になりました。","体に雪の結晶がきらめきます。","ひたいに光のしるし。","雪の冠をいただく、伝説の雪の精です。"],
    bg:function(i,b){return i>=5&&b==="b"?PGB.snow("night"):PGB.snow(i===9?"dawn":"day");},
    draw:function(i,b){var o={a:PGA[i],col:"#E6E2DA",bel:"#FFFFFF",ear:"round",tail:"leo",sn:.45,spots:1,spotc:"#5A5560",eyec:"#3E5E7A",closed:i===1,acc:{}};
      if(i>=5&&b!=="b")o.acc=acc(i,[[5,"tumar","#E8B923"],[7,"cape","#B3202B"],[8,"crown","#F2C230"],[9,"aura","#FFD34D"]]);
      if(i>=5&&b==="b")o=mix(o,{col:"#EEF6FB",spotc:"#8FB8D8",eyec:"#2F7FB8",stars:i>=7,acc:acc(i,[[6,"scarf","#8FB8D8"],[8,"mark","#BFE8FF"],[9,"crown","#DCEFFF"],[9,"aura","#BFE8FF"]])});
      return pgQ(o);}}));

  /* イヌワシ */
  pgrAdd(pgrAnimal({id:"eagle",x:105,name:"イヌワシ",sub:"卵からかえって、大空の王者に",h:56,
    sc:function(i){return i===0?1.5:1.05+.045*i;},
    br:{a:{n:"狩りのワシ（ブルクト）",x:"鷹匠といっしょに狩りをする、イヌワシ「ブルクト（бүркүт）」の道。"},b:{n:"天空の大鳥",x:"キルギスの昔話の大きな鳥「アルプ・カラ・クシュ（Алп кара куш）」をめざす道。"}},
    T:["イヌワシの卵","ふわふわのひな","大きなひな","若いワシ","大空のワシ"],
    X:["岩山の巣に、イヌワシの卵がひとつ。","卵からかえった、ふわふわのひなです。","よく食べて、ぐんぐん大きくなります。","茶色の羽が生えそろいました。","翼を広げて、はじめて大空へ。そろそろ進む道を選ぶころです。"],
    Ta:["鷹匠のワシ","狩りに出るワシ","お守りのワシ","祭りの名ワシ","伝説のブルクト"],
    Xa:["目かくしの帽子「トモゴ（томого）」をかぶり、出番を待ちます。","トモゴを外して、大空へまい上がります。","胸にお守りのトゥマル。","祭りのワシの腕くらべで、みんなをおどろかせます。","金色の光をまとう、伝説のイヌワシです。"],
    Tb:["黒い翼の若鳥","嵐をよぶ翼","山より大きな影","天をめぐる大鳥","伝説のアルプ・カラ・クシュ"],
    Xb:["羽が夜のように黒くなってきました。","翼の先が金色に光ります。","広げた翼が、山に大きな影を落とします。","ひたいに光のしるし。","昔話に出てくる大きな鳥のような、伝説の姿です。"],
    bg:function(i,b){return i<3?PGB.cliff("day"):(b==="b"&&i>=5?PGB.sky(i>=8?"dusk":"day"):PGB.cliff(i===9?"dawn":"day"));},
    draw:function(i,b){
      if(i===0)return pgEgg("#F4ECD8","#B0773C",0);
      if(i<3)return pgBird({a:i===1?0:.2,fuzz:1,col:"#F4F1EA"});
      var o={a:PGA[i],col:"#6E4A22",bel:"#9A6A3A",head:"#D8A24A",spread:i===4,acc:{}};
      if(i>=5&&b!=="b")o=mix(o,{hood:i===5,spread:i===6||i===9,brow:1,acc:acc(i,[[7,"tumar","#E8B923"],[9,"aura","#FFD34D"]])});
      if(i>=5&&b==="b")o=mix(o,{col:"#2E2A3A",bel:"#4A3F5A",head:"#5A4A6A",spread:i!==5,brow:1,wtip:i>=6?"#F2C230":"",acc:acc(i,[[8,"mark","#FFE27A"],[9,"aura","#B39DDB"]])});
      return pgBird(o);}}));

  /* 竜（アジダール） */
  pgrAdd(pgrAnimal({id:"dragon",name:"竜アジダール",sub:"卵から生まれた子竜が、伝説の竜に",h:44,
    sc:function(i){return i===0?1.5:1.0+.042*i;},
    br:{a:{n:"山の竜",x:"岩と水晶の力をもつ、大地の竜の道。"},b:{n:"天の竜",x:"雲と光をまとう、空の竜の道。"}},
    T:["ふしぎな卵","竜の赤ちゃん","よちよち子竜","翼の生えた子竜","若い竜"],
    X:["アジダール（ажыдаар）は、キルギスの昔話に出てくる竜です。この仲間は、それをもとにしたこのアプリだけの竜。まずはふしぎな卵から。","卵からかえった、竜の赤ちゃんです。","背中に小さなとげが出てきました。","小さな翼が生えてきました。","角がのびて、たくましくなりました。そろそろ進む道を選ぶころです。"],
    Ta:["岩の竜","水晶の竜","山をまもる竜","大地の竜","伝説の山の竜"],
    Xa:["うろこが岩のようにかたくなりました。","背中のとげが水晶に変わりました。","お守りのトゥマルを首に。","金の冠をいただく、大地の竜です。","水晶の光をまとう、伝説の竜です。"],
    Tb:["雲の竜","光の竜","虹をわたる竜","天の竜王","伝説の天の竜"],
    Xb:["体が雲のように白くなりました。","角と背中のとげが金色に光ります。","大きな翼で、虹をわたって飛びます。","金の冠をいただく、天の竜王です。","光の輪をまとう、伝説の竜です。"],
    bg:function(i,b){return i>=5&&b==="b"?PGB.sky(i===9?"dawn":"day"):PGB.high(i===9?"dusk":"day");},
    draw:function(i,b){
      if(i===0)return pgEgg("#9ED0A6","#5E9E6A",0);
      var o={a:PGA[i],col:"#6FAF7A",bel:"#E8E2B0",ear:"drag",tail:"drag",sn:.8,horn:i>=4?1:.5,spike:i>=2,wing:[0,0,0,.35,.55,.75,.85,1,1,1.1][i],wcol:"#9ED0A6",hcol:"#F1E6C8",closed:i===1,acc:{}};
      if(i>=5&&b!=="b")o=mix(o,{col:"#7E8C78",bel:"#C9CDB0",spcol:"#8FE0E8",wcol:"#A9B8A0",acc:acc(i,[[7,"tumar","#E8B923"],[8,"crown","#F2C230"],[9,"aura","#8FE0E8"]])});
      if(i>=5&&b==="b")o=mix(o,{col:"#F4F1EA",bel:"#FFF6D8",spcol:"#F2C230",wcol:"#FFF6D8",hcol:"#F2C230",acc:acc(i,[[8,"crown","#F2C230"],[9,"aura","#FFD34D"],[9,"mark","#FFE27A"]])});
      return pgQ(o);}}));
})();
