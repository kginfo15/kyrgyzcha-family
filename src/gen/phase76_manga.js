/* ===== Phase76：物語の4コマ漫画（コマごとの描き下ろし） =====
   1コマずつ、背景・人物（表情 face・動き pose・向き）・小物・効果（集中線・汗・きらめき）・ふきだしを組み立てて描く。
   人物・馬・ユルト・小物はすべてこのアプリのオリジナルの絵（既存の絵や写真をなぞっていない）。
   服装は資料で確かめた特徴だけを、簡単な形で表す（HANDOVER の phase76 の欄に資料を記録）。
   データ：P76[道id] = [ [コマ1,コマ2,コマ3,コマ4], …(話ごと) ]。コマ = {d:function(){return svgの中身}, t:"コマの下の文"}。
   P76 にない道・話は、phase75_comic の自動4コマ（場面の絵のアップと引き）を使う。 */
var P76={},P76_N=0;
var M6={
 /* ---------- 背景（240×140） ---------- */
 sky:function(k){var c={day:["#BFE3F2","#E4F4FA"],dusk:["#F2B48C","#F8DCC0"],night:["#24304F","#34446B"],dark:["#4A3E4E","#6E5A62"],dawn:["#F4C6A8","#CFE3F0"]}[k||"day"];P76_N++;var id="m6g"+P76_N;
   return '<defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+c[0]+'"/><stop offset="1" stop-color="'+c[1]+'"/></linearGradient></defs><rect width="240" height="140" fill="url(#'+id+')"/>'+
     (k==="night"?'<circle cx="198" cy="24" r="10" fill="#F6F1E1"/><circle cx="192" cy="21" r="10" fill="#34446B" opacity=".0"/>'+[[30,18],[70,30],[120,12],[150,34],[88,8],[222,48],[14,44]].map(function(p){return '<circle cx="'+p[0]+'" cy="'+p[1]+'" r="1.3" fill="#fff"/>';}).join(""):"")+
     (k==="day"?'<circle cx="206" cy="24" r="11" fill="#FFD34D"/>':'')+(k==="dawn"||k==="dusk"?'<circle cx="40" cy="70" r="14" fill="#FFB84D" opacity=".9"/>':'');},
 mts:function(k){var far=k==="night"?"#3E4C70":k==="dusk"?"#B88A8A":k==="dark"?"#5E5266":"#9FB7C9";
   return '<path d="M0 84l30-34 22 20 34-44 30 36 26-22 40 34 30-26 28 24v52H0z" fill="'+far+'"/><path d="M86 26l-10 12 7-1 3 5 4-5 7 2zM30 50l-7 8 5-1 2 3 3-3 4 1z" fill="#fff" opacity=".9"/>';},
 grass:function(k){var a=k==="night"?"#2F4A33":k==="dark"?"#4E5A3A":k==="dusk"?"#9A9A5A":"#8DBF6A",b=k==="night"?"#284028":k==="dark"?"#434E32":k==="dusk"?"#86884E":"#7AAE57";
   return '<path d="M0 92q60-12 120-4t120-4v56H0z" fill="'+a+'"/><path d="M0 112q80-10 240 0v28H0z" fill="'+b+'"/>';},
 steppe:function(k){return M6.sky(k)+M6.mts(k)+M6.grass(k);},
 /* ユルトの中：壁の格子（ケレゲ）、天井の骨（ウーク）、天窓（トゥンドゥク）、床のフェルトじゅうたん */
 yurtIn:function(night){var w=night?"#6E3A2E":"#B85A3A",bg=night?"#3A2A22":"#F2E3C6";
   var s='<rect width="240" height="140" fill="'+bg+'"/>';
   for(var i=0;i<14;i++){s+='<path d="M120 -6L'+(i*20-10)+' 62" stroke="'+w+'" stroke-width="2.4"/>';}
   s+='<circle cx="120" cy="-6" r="22" fill="'+(night?"#24304F":"#BFE3F2")+'" stroke="'+w+'" stroke-width="3"/><path d="M104 -6h32M120 -22v32M108 -18l24 24M132 -18l-24 24" stroke="'+w+'" stroke-width="2"/>';
   s+='<rect y="58" width="240" height="46" fill="'+(night?"#4A3428":"#EAD7B0")+'"/>';
   for(var j=0;j<26;j++){s+='<path d="M'+(j*10-10)+' 58l20 46M'+(j*10+10)+' 58l-20 46" stroke="'+w+'" stroke-width="1.6" opacity=".7"/>';}
   s+='<path d="M0 58h240" stroke="#B3202B" stroke-width="4"/><rect y="100" width="240" height="40" fill="'+(night?"#5A2A2A":"#B3202B")+'"/><path d="M10 112q10-8 20 0t20 0M70 112q10-8 20 0t20 0M130 112q10-8 20 0t20 0M190 112q10-8 20 0t20 0" stroke="#F2D28A" stroke-width="3" fill="none"/><path d="M0 100h240" stroke="#2B2233" stroke-width="1.4"/>';
   s+='<g transform="translate(176 66)"><rect width="46" height="10" fill="#8A5A2B" stroke="#2B2233"/><rect y="-10" width="46" height="10" fill="#2C5D8F" stroke="#2B2233"/><rect y="-20" width="46" height="10" fill="#B3202B" stroke="#2B2233"/><rect y="-28" width="46" height="8" fill="#E8D5A8" stroke="#2B2233"/></g>';
   return s;},
 /* ユルト（外から） */
 yurt:function(x,y,s,c){s=s||1;c=c||"#B3202B";return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-26 0v-18q26-22 52 0v18z" fill="#F4EBD8" stroke="#2B2233" stroke-width="1.6"/><path d="M-26 -18q26-26 52 0" fill="#E8DCC0" stroke="#2B2233" stroke-width="1.6"/><path d="M-22 -10h44" stroke="'+c+'" stroke-width="3.4"/><path d="M-22 -10q4-4 8 0t8 0 8 0 8 0 8 0" stroke="#F4EBD8" stroke-width="1.2" fill="none"/><path d="M-6 0v-12h12v12" fill="#8A5A2B" stroke="#2B2233" stroke-width="1.2"/><path d="M-5 -31h10" stroke="#8A5A2B" stroke-width="3"/></g>';},
 fire:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><ellipse cx="0" cy="8" rx="22" ry="6" fill="#FFB84D" opacity=".25"/><path d="M-12 6l24-4M-12 2l24 4" stroke="#5A3A1E" stroke-width="4" stroke-linecap="round"/><path d="M0 4q-12-12 0-26q2 9 7 9q5 9-7 17z" fill="#F2A541"/><path d="M0 4q-5-7 0-14q5 7 0 14z" fill="#FFE36B"/></g>';},
 flag:function(x,y,c){return '<path d="M'+x+' '+y+'v-34" stroke="#6E4A22" stroke-width="2"/><path d="M'+x+' '+(y-34)+'q10 4 20 0v12q-10 4-20 0z" fill="'+(c||"#B3202B")+'" stroke="#2B2233" stroke-width="1"/>';},
 rock:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-20 0q-4-18 10-24q16-6 26 6q8 12-2 18z" fill="#9AA4AE" stroke="#2B2233" stroke-width="1.6"/><path d="M-6 -16q6-2 10 2" stroke="#C9D3DD" stroke-width="2" fill="none"/></g>';},
 dust:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')" fill="#E8D5A8" opacity=".8"><circle cx="0" cy="0" r="8"/><circle cx="10" cy="-4" r="6"/><circle cx="-10" cy="-2" r="5"/></g>';},
 /* ---------- 人物 ---------- */
 /* o＝p74Person の指定。x＝足もとの中心、y＝足もと、h＝高さ（px） */
 P:function(o,x,y,h,opt){opt=opt||{};var sc=h/150,inner=typeof o==="string"?p74Art(o):p74Person(o);if(opt.flip)inner='<g transform="translate(120 0) scale(-1 1)">'+inner+'</g>';if(opt.rot)inner='<g transform="rotate('+opt.rot+' 60 140)">'+inner+'</g>';
   return '<g transform="translate('+(x-60*sc).toFixed(1)+' '+(y-148*sc).toFixed(1)+') scale('+sc.toFixed(3)+')"'+(opt.op?' opacity="'+opt.op+'"':'')+'>'+inner+'</g>';},
 /* 上半身だけ（アップのコマ用）：h＝頭から腰までの高さ */
 Up:function(o,x,top,h,opt){opt=opt||{};P76_N++;var id="m6c"+P76_N,cut=opt.cut||120,sc=h/(cut+4),inner=p74Person(o);if(opt.flip)inner='<g transform="translate(120 0) scale(-1 1)">'+inner+'</g>';
   return '<defs><clipPath id="'+id+'"><rect x="-30" y="-4" width="180" height="'+cut+'"/></clipPath></defs><g transform="translate('+(x-60*sc).toFixed(1)+' '+(top+4*sc).toFixed(1)+') scale('+sc.toFixed(3)+')"><g clip-path="url(#'+id+')">'+inner+'</g></g>';},
 /* 横になって眠る人（頭が左）。x＝体の中心、y＝床 */
 lie:function(o,x,y,h){var sc=h/150;return '<g transform="translate('+x+' '+y+') rotate(-90) scale('+sc.toFixed(3)+') translate(-60 -100)">'+p74Person(o)+'</g><path d="M'+(x-h*.1)+' '+(y-14)+'q'+(h*.3)+' -10 '+(h*.62)+' 0v14h-'+(h*.62)+'z" fill="#C7823E" stroke="#2B2233" stroke-width="1.4"/>';},
 /* 馬（横向き、右を向く）。x＝体の中心、y＝ひづめ。rider があれば乗せる。run で走る形 */
 horse:function(x,y,s,c,opt){opt=opt||{};s=s||1;c=c||"#E9D9B8";var d=p74Shade(c,-.25),m=opt.mane||"#5A3A22",run=opt.run,O=' stroke="#2B2233" stroke-width="1.6" stroke-linejoin="round"';
   var leg=function(px,a){return '<path d="M'+px+' -26q'+(a*6)+' 12 '+(a*10)+' 24" stroke="'+d+'" stroke-width="8" stroke-linecap="round" fill="none"/><path d="M'+(px+a*10-3)+' -2h7" stroke="#2B2233" stroke-width="3.4" stroke-linecap="round"/>';};
   var g=(run?leg(-22,-1.6)+leg(-14,-1)+leg(18,1.6)+leg(26,1):leg(-22,0)+leg(-12,0)+leg(16,0)+leg(26,0));
   g+='<path d="M-34 -40q-14 4-16 22q8-10 16-16" fill="'+m+'"'+O+'/>';
   g+='<path d="M-32 -46q0-14 30-14h22q14 0 16 16q2 14-18 16h-34q-16 0-16-18z" fill="'+c+'"'+O+'/>';
   g+='<path d="M14 -50q4-26 20-36l12 8q-8 12-10 30z" fill="'+c+'"'+O+'/>';
   g+='<path d="M30 -90q10-8 22 0l16 16q5 6-1 10q-6 3-11-1l-24-12q-6-6-2-13z" fill="'+c+'"'+O+'/><path d="M34 -92l0-9 7 6z" fill="'+c+'"'+O+'/><ellipse cx="45" cy="-84" rx="2" ry="2.4" fill="#2B2233"/><circle cx="64" cy="-71" r="1.3" fill="#2B2233"/><path d="M58 -66q4 2 8 0" stroke="#2B2233" stroke-width="1" fill="none"/>';
   g+='<path d="M30 -92q-14 6-18 40q4-4 6-8q2-16 14-26z" fill="'+m+'"'+O+'/>';
   g+='<path d="M-8 -60q10-8 22 0l-2 10h-18z" fill="#8A3A2A"'+O+'/><path d="M-6 -50q8 4 16 0" stroke="#E8B923" stroke-width="2" fill="none"/>';
   var rd='';if(opt.rider){P76_N++;var id="m6r"+P76_N,ro=opt.rider,sc=(opt.rs||.5);
     rd='<defs><clipPath id="'+id+'"><rect x="-20" y="-40" width="160" height="152"/></clipPath></defs><g transform="translate('+(2-60*sc)+' '+(-58-112*sc)+') scale('+sc+')"><g clip-path="url(#'+id+')">'+p74Person(ro)+'</g></g>'+
       '<path d="M4 -56q-4 12 2 20" stroke="'+(ro.pants||"#5C5470")+'" stroke-width="7" stroke-linecap="round" fill="none"/><path d="M2 -36h9" stroke="'+(ro.boot||"#5A3A22")+'" stroke-width="5" stroke-linecap="round"/>';}
   var all=g+rd;if(opt.flip)all='<g transform="scale(-1 1)">'+all+'</g>';
   return '<g transform="translate('+x+' '+y+') scale('+s+')">'+all+'</g>'+(run?M6.dust(x-(opt.flip?-50:50)*s,y-6,s*.9):'');},
 /* ゆりかご（ベシク） */
 beshik:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-22 0l4-14h36l4 14z" fill="#B0773C" stroke="#2B2233" stroke-width="1.4"/><path d="M-16 -14q16-24 32 0" stroke="#8A5A2B" stroke-width="3" fill="none"/><path d="M-18 -14h36v-4h-36z" fill="#B3202B"/><circle cx="0" cy="-20" r="6" fill="#F3C9A0" stroke="#2B2233" stroke-width="1.2"/><path d="M-3 -20q3 2 6 0" stroke="#2B2233" stroke-width="1" fill="none"/></g>';},
 /* だっこされた赤ちゃん（白い布でくるむ） */
 baby:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-14 4q-2-14 12-16q14 0 14 12q0 10-14 10z" fill="#FBF8F0" stroke="#2B2233" stroke-width="1.4"/><circle cx="-2" cy="-6" r="6" fill="#F3C9A0" stroke="#2B2233" stroke-width="1.2"/><path d="M-5 -6q1-1.6 2 0M0 -6q1-1.6 2 0" stroke="#2B2233" stroke-width="1" fill="none"/><path d="M-3 -3q1.6 1.4 3 0" stroke="#2B2233" stroke-width="1" fill="none"/></g>';},
 bowl:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-9 0h18q-2 8-9 8t-9-8z" fill="#F4EBD8" stroke="#2B2233" stroke-width="1.2"/><path d="M-4 -3q2-3 0-6M2 -3q2-3 0-6" stroke="#9AA4AE" stroke-width="1" fill="none"/></g>';},
 eagle:function(x,y,s,flip){s=s||1;var g='<path d="M0 0q-20-14-34-6q14 0 22 10q-16 0-24 8q16-2 26 2z" fill="#6E4A22" stroke="#2B2233" stroke-width="1.2"/><path d="M0 0q8-6 16-4l6 2-6 2q-6 6-16 4z" fill="#8A5A2B" stroke="#2B2233" stroke-width="1.2"/><circle cx="14" cy="-3" r="1.4" fill="#2B2233"/><path d="M22 -2l4 1-4 2" fill="#E8B923"/>';return '<g transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')">'+g+'</g>';},
 /* 羊 */
 sheep:function(x,y,s,flip){s=s||1;var g='<ellipse cx="0" cy="-10" rx="14" ry="10" fill="#FBF8F0" stroke="#2B2233" stroke-width="1.4"/><path d="M-10 -2v8M-2 -2v8M6 -2v8M12 -4v8" stroke="#2B2233" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="14" cy="-14" rx="6" ry="5" fill="#5A4A42" stroke="#2B2233" stroke-width="1.2"/><circle cx="16" cy="-15" r="1" fill="#fff"/><path d="M10 -18q-4-4 -2-6" stroke="#5A4A42" stroke-width="2.4" fill="none"/>';return '<g transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')">'+g+'</g>';},
 /* 白鳥（飛ぶ） */
 swan:function(x,y,s,flip){s=s||1;var g='<path d="M0 0q-18-26-40-22q14 6 22 18q-20-4-30 4q20 2 30 10z" fill="#FBF8F0" stroke="#2B2233" stroke-width="1.3"/><path d="M0 0q10 2 18-6q4-10 12-10q4 0 4 4l-6 1q-4 2-6 8q-6 10-22 9z" fill="#FBF8F0" stroke="#2B2233" stroke-width="1.3"/><path d="M34 -12l6 1-6 2z" fill="#E8B923"/><circle cx="31" cy="-13" r="1" fill="#2B2233"/>';return '<g transform="translate('+x+' '+y+') scale('+(flip?-s:s)+' '+s+')">'+g+'</g>';},
 /* 中央アジアの古い町（丸屋根と門） */
 city:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M-60 0v-30h120v30z" fill="#E8C98A" stroke="#2B2233" stroke-width="1.4"/><path d="M-14 0v-40h28v40z" fill="#E0B870" stroke="#2B2233" stroke-width="1.4"/><path d="M-8 0v-22q8-10 16 0v22z" fill="#6E4A22"/><path d="M-30 -30q14-22 28 0z" fill="#3E8EB8" stroke="#2B2233" stroke-width="1.4"/><path d="M8 -40q14-24 28 0z" fill="#3E8EB8" stroke="#2B2233" stroke-width="1.4" transform="translate(6 10)"/><path d="M44 0v-56h8v56z" fill="#E0B870" stroke="#2B2233" stroke-width="1.4"/><path d="M42 -56h12l-6-8z" fill="#3E8EB8" stroke="#2B2233" stroke-width="1.2"/><path d="M-56 -20h24M30 -20h10" stroke="#3E8EB8" stroke-width="2"/></g>';},
 /* 黒いもや（裏切り・あやしさ） */
 gloom:function(x,y,r){return '<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#3A2E5C" opacity=".35"/><circle cx="'+x+'" cy="'+y+'" r="'+(r*.7)+'" fill="#3A2E5C" opacity=".3"/>';},
 /* 巻物（物語の本） */
 scroll:function(x,y,s,t){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><rect x="-30" y="-20" width="60" height="40" fill="#FBF3DC" stroke="#2B2233" stroke-width="1.4"/><rect x="-34" y="-24" width="6" height="48" rx="3" fill="#8A5A2B" stroke="#2B2233"/><rect x="28" y="-24" width="6" height="48" rx="3" fill="#8A5A2B" stroke="#2B2233"/>'+(t?'<text x="0" y="4" text-anchor="middle" font-size="10" font-weight="800" fill="#2B2233" font-family="system-ui,sans-serif">'+esc(t)+'</text>':'<path d="M-20 -8h40M-20 0h34M-20 8h38" stroke="#9AA4AE" stroke-width="2"/>')+'</g>';},
 /* 古い写真機（三脚つきの箱） */
 camera:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><path d="M0 0l-14 34M0 0l14 34M0 0v34" stroke="#6E4A22" stroke-width="2.4"/><rect x="-16" y="-22" width="32" height="22" fill="#6E4A22" stroke="#2B2233" stroke-width="1.4"/><path d="M16 -16h10v10H16z" fill="#2B2233"/><circle cx="26" cy="-11" r="4" fill="#9AA4AE" stroke="#2B2233"/><path d="M-16 -22q-8-6-8 10" fill="#2B2233"/></g>';},
 /* 額に入った古い写真（中身は svg） */
 frame:function(x,y,w,h,inner){return '<g><rect x="'+(x-w/2-6)+'" y="'+(y-h/2-6)+'" width="'+(w+12)+'" height="'+(h+12)+'" fill="#8A5A2B" stroke="#2B2233" stroke-width="1.6"/><rect x="'+(x-w/2)+'" y="'+(y-h/2)+'" width="'+w+'" height="'+h+'" fill="#E8D5B0"/><g opacity=".85" style="filter:sepia(1)">'+inner+'</g></g>';},
 /* 台座の上の像 */
 statue:function(o,x,y,h){return '<rect x="'+(x-24)+'" y="'+(y-10)+'" width="48" height="'+(140-y+10)+'" fill="#B8B2A6" stroke="#2B2233" stroke-width="1.4"/><rect x="'+(x-30)+'" y="'+(y-14)+'" width="60" height="6" fill="#9A9488" stroke="#2B2233"/><g style="filter:grayscale(1) brightness(1.05)">'+M6.P(o,x,y-14,h)+'</g>';},
 /* 紙幣の形（実物の図柄はまねない：数字と横顔のシルエットだけ） */
 note50:function(x,y,s){s=s||1;return '<g transform="translate('+x+' '+y+') scale('+s+')"><rect x="-50" y="-26" width="100" height="52" rx="4" fill="#E9D9F2" stroke="#2B2233" stroke-width="1.4"/><rect x="-44" y="-20" width="88" height="40" rx="3" fill="none" stroke="#9B7BB8" stroke-width="1.2"/><text x="30" y="-4" text-anchor="middle" font-size="16" font-weight="900" fill="#5E3A7E" font-family="system-ui,sans-serif">50</text><text x="30" y="12" text-anchor="middle" font-size="8" font-weight="800" fill="#5E3A7E" font-family="system-ui,sans-serif">сом</text><circle cx="-18" cy="0" r="14" fill="#C9B6DA"/><path d="M-26 -6q8-10 16 0v4q-8-4-16 0z" fill="#F6F1E1"/></g>';},
 /* ---------- 効果 ---------- */
 speed:function(cx,cy,c){var s='';for(var i=0;i<36;i++){var a=i/36*Math.PI*2,r1=58+(i%3)*8,r2=160;s+='<path d="M'+(cx+Math.cos(a)*r1).toFixed(1)+' '+(cy+Math.sin(a)*r1*.7).toFixed(1)+'L'+(cx+Math.cos(a)*r2).toFixed(1)+' '+(cy+Math.sin(a)*r2*.7).toFixed(1)+'" stroke="'+(c||"#2B2233")+'" stroke-width="'+(i%2?1:2)+'" opacity=".55"/>';}return s;},
 lines:function(x,y,n,dir){var s='';for(var i=0;i<(n||5);i++)s+='<path d="M'+x+' '+(y+i*7)+'h'+(dir||-1)*(18+(i%2)*10)+'" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".9"/>';return s;},
 spark:function(x,y,s,c){s=s||1;return '<path transform="translate('+x+' '+y+') scale('+s+')" d="M0-8l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="'+(c||"#F5B301")+'"/>';},
 bang:function(x,y){return '<g transform="translate('+x+' '+y+')"><path d="M0 0l3 12h-6z" fill="#E2483B" stroke="#2B2233" stroke-width=".8"/><circle cy="16" r="2.2" fill="#E2483B"/></g>';},
 sweat:function(x,y){return '<path d="M'+x+' '+y+'q4 5 0 8q-4-3 0-8z" fill="#7FC4F0" stroke="#2B2233" stroke-width=".8"/>';},
 heart:function(x,y,s){s=s||1;return '<path transform="translate('+x+' '+y+') scale('+s+')" d="M0 6q-9-6-9-11a4.5 4.5 0 0 1 9-1a4.5 4.5 0 0 1 9 1q0 5-9 11z" fill="#E2483B"/>';},
 note:function(x,y){return '<path transform="translate('+x+' '+y+')" d="M0 0v-12l8-2v12" stroke="#2B2233" stroke-width="1.6" fill="none"/><ellipse cx="'+(x-2)+'" cy="'+y+'" rx="3" ry="2.2" fill="#2B2233"/><ellipse cx="'+(x+6)+'" cy="'+(y-2)+'" rx="3" ry="2.2" fill="#2B2233"/>';},
 zz:function(x,y){return '<text x="'+x+'" y="'+y+'" font-size="12" font-weight="800" fill="#7E8CB8" font-family="system-ui,sans-serif">z<tspan dy="-6" font-size="9">z</tspan></text>';},
 /* 考え・夢の雲（中身は svg） */
 dream:function(x,y,w,h,inner){return '<g><ellipse cx="'+x+'" cy="'+y+'" rx="'+w/2+'" ry="'+h/2+'" fill="#fff" stroke="#2B2233" stroke-width="1.4"/><circle cx="'+(x-w/2+10)+'" cy="'+(y+h/2+6)+'" r="4" fill="#fff" stroke="#2B2233" stroke-width="1.2"/><circle cx="'+(x-w/2+4)+'" cy="'+(y+h/2+14)+'" r="2.4" fill="#fff" stroke="#2B2233" stroke-width="1.2"/>'+inner+'</g>';},
 /* ふきだし：t は短い日本語（1〜2行、\n で改行） */
 bub:function(x,y,t,tx,ty,shout){var L=String(t).split("\n"),w=Math.max.apply(null,L.map(function(l){return l.length;}))*11+16,h=L.length*13+10,x0=x-w/2,y0=y-h/2;
   var tail='<path d="M'+(x-5)+' '+(y0+h-1)+'L'+tx+' '+ty+'L'+(x+6)+' '+(y0+h-1)+'z" fill="#fff" stroke="#2B2233" stroke-width="1.4" stroke-linejoin="round"/><path d="M'+(x-4)+' '+(y0+h-1)+'h9" stroke="#fff" stroke-width="2.6"/>';
   if(ty<y0)tail='<path d="M'+(x-5)+' '+(y0+1)+'L'+tx+' '+ty+'L'+(x+6)+' '+(y0+1)+'z" fill="#fff" stroke="#2B2233" stroke-width="1.4" stroke-linejoin="round"/><path d="M'+(x-4)+' '+(y0+1)+'h9" stroke="#fff" stroke-width="2.6"/>';
   return '<g><rect x="'+x0+'" y="'+y0+'" width="'+w+'" height="'+h+'" rx="'+(shout?4:10)+'" fill="#fff" stroke="#2B2233" stroke-width="'+(shout?2.2:1.4)+'"/>'+tail+L.map(function(l,i){return '<text x="'+x+'" y="'+(y0+15+i*13)+'" text-anchor="middle" font-size="11" font-weight="800" fill="#2B2233" font-family="system-ui,sans-serif">'+esc(l)+'</text>';}).join("")+'</g>';},
 /* 文字の効果音 */
 sfx:function(x,y,t,c,r){return '<text x="'+x+'" y="'+y+'" transform="rotate('+(r||-8)+' '+x+' '+y+')" font-size="18" font-weight="900" fill="'+(c||"#E2483B")+'" stroke="#fff" stroke-width="3" paint-order="stroke" font-family="system-ui,sans-serif">'+esc(t)+'</text>';},
 svg:function(b){return '<svg class="p76-svg" viewBox="0 0 240 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+b+'</svg>';}
};
/* 人物の指定をもとに、表情・動きなどを変えたコピーを作る */
function m6(o,ex){var c=JSON.parse(JSON.stringify(o||{}));for(var k in ex)c[k]=ex[k];return c;}
/* 4コマを描く（P76 にあれば） */
function p76Has(P,i){return !!(P76[P.id]&&P76[P.id][i]);}
function p76Comic(P,i){var A=P76[P.id][i];
  return '<div class="p75-comic p76" role="img" aria-label="4コマ漫画：'+esc(P.story[i].t)+'">'+A.map(function(k,n){var sv="";try{sv=M6.svg(k.d());}catch(e){sv=M6.svg(M6.steppe());}
    return '<div class="p75-pan"><i>'+(n+1)+'</i><div class="p75-pimg">'+sv+'</div>'+(k.t?'<p>'+esc(k.t)+'</p>':'')+'</div>';}).join("")+'</div>';}
var _p76Comic=p75Comic;
p75Comic=function(P,i){if(P&&p76Has(P,i))return p76Comic(P,i);return _p76Comic.apply(this,arguments);};
(function(){try{var st=document.createElement("style");st.textContent='.p76 .p75-pimg svg{aspect-ratio:240/140}';document.head.appendChild(st);}catch(_){}})();
