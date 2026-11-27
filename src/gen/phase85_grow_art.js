/* ===== Phase85：育てるモードの絵（動物・鳥・竜・卵・小物） =====
   すべてこのアプリのために描いたオリジナルの線画（既存のキャラクターや写真をなぞっていない）。
   どれも「足もとの中心が (0,0)、右向き」の座標で描き、呼ぶ側で位置と大きさを決める。
   線の色・太さは phase74 の絵とそろえる（#2B2233、1.6）。 */
var PG_O=' stroke="#2B2233" stroke-width="1.6" stroke-linejoin="round"';
function pgSh(c,k){try{return p74Shade(c,k);}catch(_){return c;}}
function pgL(a,b,t){return a+(b-a)*t;}
function pgN(v){return (+v).toFixed(1);}
/* 目（大きくてつやのある目。子どもほど大きい） */
function pgEye(x,y,r,col){
  return '<ellipse cx="'+pgN(x)+'" cy="'+pgN(y)+'" rx="'+pgN(r*.82)+'" ry="'+pgN(r)+'" fill="'+(col||"#2B2233")+'"/>'+
    '<circle cx="'+pgN(x-r*.28)+'" cy="'+pgN(y-r*.38)+'" r="'+pgN(r*.36)+'" fill="#fff"/><circle cx="'+pgN(x+r*.3)+'" cy="'+pgN(y+r*.34)+'" r="'+pgN(r*.16)+'" fill="#fff" opacity=".9"/>';
}
/* シルダク（フェルトのじゅうたん）風の渦の模様：x,y から幅 w に並べる */
function pgCurl(x,y,w,c){var s="",n=Math.max(1,Math.round(w/10));for(var i=0;i<n;i++){var cx=x+(i+.5)*w/n;s+='<path d="M'+pgN(cx-4)+' '+pgN(y+2)+'q0-5 4-5q4 0 4 4q0 3-3 3" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round"/>';}return s;}
/* 房かざり（チャチク） */
function pgTassel(x,y,c){return '<path d="M'+pgN(x)+' '+pgN(y)+'v4" stroke="#2B2233" stroke-width="1"/><path d="M'+pgN(x-2.6)+' '+pgN(y+4)+'h5.2l1 7h-7.2z" fill="'+(c||"#E2483B")+'"'+PG_O.replace("1.6","1")+'/>';}
/* 小さなカルパク（白いフェルトの帽子。つばは黒） */
function pgKalpak(x,y,s,c){s=s||1;return '<g transform="translate('+pgN(x)+' '+pgN(y)+') scale('+s+')"><path d="M-9 0q1-16 9-20q8 4 9 20z" fill="'+(c||"#F4F1E6")+'"'+PG_O+'/><path d="M-10 0q10-4 20 0l-1 3q-9-3-18 0z" fill="#2B2233"/><path d="M-4 -8q4 2 8 0" stroke="#B3202B" stroke-width="1.2" fill="none"/></g>';}
function pgCrown(x,y,s,c){s=s||1;c=c||"#F2C230";return '<g transform="translate('+pgN(x)+' '+pgN(y)+') scale('+s+')"><path d="M-9 0l-2-11 6 5 5-9 5 9 6-5-2 11z" fill="'+c+'"'+PG_O+'/><circle cx="0" cy="-4" r="1.8" fill="#E2483B"/></g>';}
function pgFlowers(x,y,s){s=s||1;var cs=["#F48FB1","#FFD34D","#FFFFFF","#B39DDB","#F48FB1"],h="";for(var i=0;i<5;i++){var a=-150+i*30,px=Math.cos(a*Math.PI/180)*10,py=Math.sin(a*Math.PI/180)*6;h+='<circle cx="'+pgN(px)+'" cy="'+pgN(py)+'" r="3.4" fill="'+cs[i]+'"'+PG_O.replace("1.6","1")+'/><circle cx="'+pgN(px)+'" cy="'+pgN(py)+'" r="1.1" fill="#E8A33D"/>';}return '<g transform="translate('+pgN(x)+' '+pgN(y)+') scale('+s+')"><path d="M-11 0q11-9 22 0" stroke="#5E9E4A" stroke-width="2" fill="none"/>'+h+'</g>';}
/* トゥマル（三角のお守り） */
function pgTumar(x,y,c){return '<path d="M'+pgN(x-4)+' '+pgN(y)+'h8l-4 7z" fill="'+(c||"#E8B923")+'"'+PG_O.replace("1.6","1.1")+'/><circle cx="'+pgN(x)+'" cy="'+pgN(y+2.4)+'" r="1.2" fill="#B3202B"/>';}
function pgBell(x,y){return '<path d="M'+pgN(x-3.4)+' '+pgN(y+4)+'q0-7 3.4-7t3.4 7z" fill="#F2C230"'+PG_O.replace("1.6","1.1")+'/><circle cx="'+pgN(x)+'" cy="'+pgN(y+4.6)+'" r="1.1" fill="#2B2233"/>';}
/* 星のしるし（ひたいなど） */
function pgStarMark(x,y,r,c){var p="";for(var i=0;i<10;i++){var a=-90+i*36,rr=i%2?r*.45:r;p+=(i?"L":"M")+pgN(x+Math.cos(a*Math.PI/180)*rr)+" "+pgN(y+Math.sin(a*Math.PI/180)*rr);}return '<path d="'+p+'z" fill="'+(c||"#FFE27A")+'"/>';}

/* ---------- 四つ足の動物（犬・猫・うさぎ・ヤク・天馬・ユキヒョウ・竜） ----------
   o.a：育ちぐあい 0〜1（子どもは頭が大きく足が短い）
   o.col 体の色、o.bel おなか・口もとの色、o.ear 耳の形、o.tail しっぽの形、o.sn 鼻先の長さ、o.leg 足の長さ
   o.fluff ヤクの長い毛、o.spots ユキヒョウの模様、o.mane たてがみの色、o.wing 翼の大きさ 0〜1、o.horn 角の長さ、o.spike 背中のとげ
   o.acc：かざり {scarf:色, bell:1, tumar:色, cloth:色, bags:1, kalpak:1, crown:色, flowers:1, cape:色, armor:色, mark:色, tassels:1} */
function pgQ(o){
  var a=o.a||0,ac=o.acc||{},c=o.col||"#C9A27A",bl=o.bel||pgSh(c,.5),dk=pgSh(c,-.28),s="";
  var L=pgL(34,66,a)*(o.len||1),Hb=pgL(24,30,a)*(o.bh||1),leg=pgL(9,19,a)*(o.leg||1),R=pgL(17,14.5,a)*(o.head||1);
  var by=-(leg+Hb/2)+2,neckUp=o.neck?R*.9*o.neck:0;
  var hx=L/2+R*.25+(o.neck?R*.2:0),hy=by-Hb/2-R*.38-neckUp;
  var lw=pgL(7,9.5,a)*(o.lw||1),paw=o.hoof?"#3A2E2A":bl;
  var legs=function(far){var col=far?dk:c,off=far?5:0,h="";
    [-L*.3,L*.27].forEach(function(lx){lx+=off;h+='<rect x="'+pgN(lx-lw/2)+'" y="'+pgN(by)+'" width="'+pgN(lw)+'" height="'+pgN(-by-1)+'" rx="'+pgN(lw/2)+'" fill="'+col+'"'+PG_O+'/>'+
      '<ellipse cx="'+pgN(lx+1.4)+'" cy="-2" rx="'+pgN(lw*.66)+'" ry="3" fill="'+(far?pgSh(paw,-.2):paw)+'"'+PG_O+'/>';});return h;};
  /* 光の輪（伝説の姿） */
  if(ac.aura)s+='<ellipse cx="'+pgN(L*.1)+'" cy="'+pgN(by-6)+'" rx="'+pgN(L*.9)+'" ry="'+pgN(Hb*1.6)+'" fill="'+ac.aura+'" opacity=".22"/>';
  /* マント（体の後ろ） */
  if(ac.cape)s+='<path d="M'+pgN(L*.32)+' '+pgN(by-Hb*.45)+'q-'+pgN(L*.5)+' -6 -'+pgN(L*.9)+' '+pgN(Hb*.2)+'q8 '+pgN(Hb*.5)+' 2 '+pgN(Hb*.9)+'q'+pgN(L*.4)+' -4 '+pgN(L*.7)+' -'+pgN(Hb*.6)+'z" fill="'+ac.cape+'"'+PG_O+'/>';
  /* 奥の翼 */
  if(o.wing)s+=pgWing(-L*.05+4,by-Hb*.4,o.wing*pgL(.6,1.25,a),o.wcol||"#F4F1E6",1);
  s+=legs(1);
  /* しっぽ */
  var tx=-L/2+2,ty=by-Hb*.1,t=o.tail;
  if(t==="cat")s+='<path d="M'+pgN(tx)+' '+pgN(ty)+'q-14 -2 -12 -'+pgN(16+a*8)+'q1 -6 6 -6" fill="none" stroke="#2B2233" stroke-width="'+pgN(lw+1.6)+'" stroke-linecap="round"/><path d="M'+pgN(tx)+' '+pgN(ty)+'q-14 -2 -12 -'+pgN(16+a*8)+'q1 -6 6 -6" fill="none" stroke="'+c+'" stroke-width="'+pgN(lw-1.4)+'" stroke-linecap="round"/>';
  else if(t==="dog")s+='<path d="M'+pgN(tx)+' '+pgN(ty)+'q-12 -6 -8 -'+pgN(14+a*6)+'q4 -6 8 0" fill="none" stroke="#2B2233" stroke-width="'+pgN(lw*.8+1.6)+'" stroke-linecap="round"/><path d="M'+pgN(tx)+' '+pgN(ty)+'q-12 -6 -8 -'+pgN(14+a*6)+'q4 -6 8 0" fill="none" stroke="'+c+'" stroke-width="'+pgN(lw*.8-1.4)+'" stroke-linecap="round"/>';
  else if(t==="pom")s+='<circle cx="'+pgN(tx-2)+'" cy="'+pgN(ty-3)+'" r="'+pgN(5+a*2)+'" fill="'+(o.tcol||"#FFFFFF")+'"'+PG_O+'/>';
  else if(t==="horse")s+='<path d="M'+pgN(tx+2)+' '+pgN(ty-4)+'q-16 2 -16 '+pgN(18+a*8)+'q8 -4 10 -10q2 8 6 10q-2-12 4-18z" fill="'+(o.mane||dk)+'"'+PG_O+'/>';
  else if(t==="yak")s+='<path d="M'+pgN(tx+1)+' '+pgN(ty-2)+'q-8 4 -9 '+pgN(14+a*6)+'" stroke="#2B2233" stroke-width="4.6" fill="none" stroke-linecap="round"/><path d="M'+pgN(tx+1)+' '+pgN(ty-2)+'q-8 4 -9 '+pgN(14+a*6)+'" stroke="'+c+'" stroke-width="2" fill="none"/><path d="M'+pgN(tx-11)+' '+pgN(ty+10+a*6)+'q-4 8 2 12q6-4 4-12z" fill="'+(o.tcol||pgSh(c,-.15))+'"'+PG_O+'/>';
  else if(t==="leo"){var tw=lw+3+a*2;s+='<path d="M'+pgN(tx)+' '+pgN(ty)+'q-'+pgN(18+a*10)+' 4 -'+pgN(16+a*8)+' -'+pgN(20+a*10)+'q2 -8 9 -6" fill="none" stroke="#2B2233" stroke-width="'+pgN(tw+3)+'" stroke-linecap="round"/><path d="M'+pgN(tx)+' '+pgN(ty)+'q-'+pgN(18+a*10)+' 4 -'+pgN(16+a*8)+' -'+pgN(20+a*10)+'q2 -8 9 -6" fill="none" stroke="'+c+'" stroke-width="'+pgN(tw)+'" stroke-linecap="round"/><path d="M'+pgN(tx-14-a*6)+' '+pgN(ty-2)+'h3M'+pgN(tx-18-a*8)+' '+pgN(ty-12-a*5)+'h3" stroke="'+(o.spotc||dk)+'" stroke-width="3" stroke-linecap="round"/>';}
  else if(t==="drag")s+='<path d="M'+pgN(tx+2)+' '+pgN(ty-4)+'q-'+pgN(14+a*10)+' 2 -'+pgN(18+a*12)+' '+pgN(10)+'l-2 -6l-6 4l6 4" fill="'+c+'"'+PG_O+'/><path d="M'+pgN(tx+2)+' '+pgN(ty+4)+'q-'+pgN(12+a*8)+' 4 -'+pgN(18+a*12)+' '+pgN(2)+'" fill="none"'+PG_O+'/>';
  /* 体 */
  s+='<ellipse cx="0" cy="'+pgN(by)+'" rx="'+pgN(L/2)+'" ry="'+pgN(Hb/2)+'" fill="'+c+'"'+PG_O+'/>';
  s+='<ellipse cx="'+pgN(L*.06)+'" cy="'+pgN(by+Hb*.2)+'" rx="'+pgN(L*.32)+'" ry="'+pgN(Hb*.24)+'" fill="'+bl+'"/>';
  s+='<ellipse cx="'+pgN(-L*.12)+'" cy="'+pgN(by-Hb*.26)+'" rx="'+pgN(L*.22)+'" ry="'+pgN(Hb*.12)+'" fill="#fff" opacity=".22"/>';
  if(o.spots){for(var i=0;i<6;i++){var sx=-L*.36+i*L*.13,sy=by-Hb*.18+(i%2?Hb*.22:0);s+='<circle cx="'+pgN(sx)+'" cy="'+pgN(sy)+'" r="'+pgN(2.6+a)+'" fill="none" stroke="'+(o.spotc||dk)+'" stroke-width="1.8" stroke-dasharray="3 1.6"/>';}}
  if(o.stars){[[-.25,-.1],[.05,-.25],[.22,.05],[-.05,.12]].forEach(function(p){s+=pgStarMark(L*p[0],by+Hb*p[1],2.4+a,"#FFE9A8");});}
  /* ヤクの長い毛（おなかの下のすだれ） */
  if(o.fluff){var fb=by+Hb*.3,fl=pgL(5,13,a)*o.fluff,p='M'+pgN(-L*.46)+' '+pgN(by)+'Q'+pgN(-L*.5)+' '+pgN(fb+fl)+' '+pgN(-L*.38)+' '+pgN(fb+fl);
    for(var j=0;j<6;j++){var x1=-L*.38+(j+.5)*L*.13,x2=-L*.38+(j+1)*L*.13;p+='L'+pgN(x1)+' '+pgN(fb+fl-4)+'L'+pgN(x2)+' '+pgN(fb+fl+(j%2?1:-1));}
    p+='Q'+pgN(L*.5)+' '+pgN(fb+fl)+' '+pgN(L*.46)+' '+pgN(by)+'z';s+='<path d="'+p+'" fill="'+(o.fcol||dk)+'"'+PG_O+'/>';}
  if(o.spike){for(var k=0;k<5;k++){var kx=-L*.3+k*L*.14,ky=by-Hb/2+1+Math.abs(k-2)*.6;s+='<path d="M'+pgN(kx-3.4)+' '+pgN(ky+2)+'l3.4 -'+pgN(5+a*3)+'l3.4 '+pgN(5+a*3)+'z" fill="'+(o.spcol||"#F2C230")+'"'+PG_O.replace("1.6","1.2")+'/>';}}
  s+=legs(0);
  /* 背中のかざり：鞍敷き（シルダク風）・荷物 */
  if(ac.cloth){var cw=L*.5,cx0=-L*.28,cy0=by-Hb*.48;s+='<path d="M'+pgN(cx0)+' '+pgN(cy0)+'q'+pgN(cw/2)+' -5 '+pgN(cw)+' 0l2 '+pgN(Hb*.62)+'q-'+pgN(cw/2+1)+' 4 -'+pgN(cw+4)+' 0z" fill="'+ac.cloth+'"'+PG_O+'/>'+pgCurl(cx0+2,cy0+Hb*.24,cw-4,"#F2D28A")+'<path d="M'+pgN(cx0-1)+' '+pgN(cy0+Hb*.62-3)+'q'+pgN(cw/2)+' 4 '+pgN(cw+3)+' 0" stroke="#F2D28A" stroke-width="1.6" fill="none"/>';
    if(ac.tassels)s+=pgTassel(cx0-1,cy0+Hb*.6,"#E2483B")+pgTassel(cx0+cw+2,cy0+Hb*.6,"#E2483B")+pgTassel(cx0+cw/2,cy0+Hb*.66,"#F2C230");}
  if(ac.bags)s+='<path d="M'+pgN(-L*.2)+' '+pgN(by-Hb*.2)+'h'+pgN(L*.3)+'v'+pgN(Hb*.55)+'q-'+pgN(L*.15)+' 5 -'+pgN(L*.3)+' 0z" fill="#B0773C"'+PG_O+'/><path d="M'+pgN(-L*.2)+' '+pgN(by-Hb*.02)+'h'+pgN(L*.3)+'" stroke="#7A4E26" stroke-width="2"/><rect x="'+pgN(-L*.3)+'" y="'+pgN(by-Hb*.8)+'" width="'+pgN(L*.46)+'" height="'+pgN(Hb*.3)+'" rx="4" fill="#E8D5A8"'+PG_O+'/><path d="M'+pgN(-L*.3)+' '+pgN(by-Hb*.65)+'h'+pgN(L*.46)+'" stroke="#B3202B" stroke-width="2"/>';
  if(ac.armor)s+='<path d="M'+pgN(L*.18)+' '+pgN(by-Hb*.4)+'q'+pgN(L*.22)+' 0 '+pgN(L*.3)+' '+pgN(Hb*.35)+'q-'+pgN(L*.1)+' '+pgN(Hb*.3)+' -'+pgN(L*.26)+' '+pgN(Hb*.3)+'z" fill="'+ac.armor+'"'+PG_O+'/><circle cx="'+pgN(L*.36)+'" cy="'+pgN(by)+'" r="2.4" fill="#E2483B"/>';
  /* 手前の翼 */
  if(o.wing)s+=pgWing(-L*.05,by-Hb*.3,o.wing*pgL(.6,1.25,a),o.wcol||"#F4F1E6",0);
  /* 首（長い首の動物）とたてがみ */
  if(o.neck){s+='<path d="M'+pgN(L*.22)+' '+pgN(by-Hb*.35)+'Q'+pgN(hx-R*.6)+' '+pgN(hy+R*.2)+' '+pgN(hx-R*.4)+' '+pgN(hy-R*.2)+'L'+pgN(hx+R*.2)+' '+pgN(hy+R*.4)+'Q'+pgN(L*.48)+' '+pgN(by-Hb*.1)+' '+pgN(L*.46)+' '+pgN(by+Hb*.1)+'z" fill="'+c+'"'+PG_O+'/>';
    if(o.mane)s+='<path d="M'+pgN(hx-R*.5)+' '+pgN(hy-R*.6)+'q-'+pgN(R*.9)+' '+pgN(R*.6)+' -'+pgN(R*1.2)+' '+pgN(R*1.9)+'q4 -2 6 -1q-4 '+pgN(R*.4)+' -2 '+pgN(R*.9)+'q'+pgN(R*.7)+' -'+pgN(R*.9)+' '+pgN(R*1.2)+' -'+pgN(R*2.4)+'z" fill="'+o.mane+'"'+PG_O+'/>';}
  /* 首かざり */
  var nx=L*.36+(o.neck?R*.2:0),ny=by-Hb*.3-(o.neck?neckUp*.45:0);
  if(ac.scarf)s+='<path d="M'+pgN(nx-R*.35)+' '+pgN(ny-R*.55)+'q'+pgN(R*.5)+' '+pgN(R*.3)+' '+pgN(R*.9)+' '+pgN(R*.1)+'l1 '+pgN(R*.4)+'q-'+pgN(R*.5)+' '+pgN(R*.25)+' -'+pgN(R*1.0)+' -'+pgN(R*.05)+'z" fill="'+ac.scarf+'"'+PG_O+'/><path d="M'+pgN(nx-R*.2)+' '+pgN(ny-R*.15)+'l-5 9l5 -2l2 5z" fill="'+ac.scarf+'"'+PG_O.replace("1.6","1.2")+'/>';
  if(ac.bell)s+=pgBell(nx+R*.2,ny-R*.1);
  if(ac.tumar)s+=pgTumar(nx+R*.05,ny-R*.05,ac.tumar);
  /* 頭 */
  var hr=o.hlong?R*1.15:R;
  if(ac.cape&&0)s+="";
  /* 角（ヤク・竜） */
  if(o.horn){var hl=o.horn*pgL(.3,1,a)*R;s+='<path d="M'+pgN(hx-R*.55)+' '+pgN(hy-R*.5)+'q-'+pgN(hl*.7)+' -'+pgN(hl*.1)+' -'+pgN(hl*.8)+' -'+pgN(hl*.9)+'q'+pgN(hl*.45)+' '+pgN(hl*.25)+' '+pgN(hl*.95)+' '+pgN(hl*.6)+'z" fill="'+(o.hcol||"#F1E6C8")+'"'+PG_O+'/><path d="M'+pgN(hx+R*.45)+' '+pgN(hy-R*.62)+'q'+pgN(hl*.5)+' -'+pgN(hl*.2)+' '+pgN(hl*.55)+' -'+pgN(hl*.95)+'q-'+pgN(hl*.1)+' '+pgN(hl*.55)+' -'+pgN(hl*.7)+' '+pgN(hl*.75)+'z" fill="'+(o.hcol||"#F1E6C8")+'"'+PG_O+'/>';}
  /* 耳（頭の後ろ側） */
  var e=o.ear,ein=o.ein||"#F4B6B6";
  if(e==="rab"){var el=pgL(R*1.0,R*1.5,a);s+='<g transform="rotate(-18 '+pgN(hx-R*.35)+' '+pgN(hy-R*.6)+')"><ellipse cx="'+pgN(hx-R*.35)+'" cy="'+pgN(hy-R*.6-el*.5)+'" rx="'+pgN(R*.3)+'" ry="'+pgN(el*.55)+'" fill="'+c+'"'+PG_O+'/><ellipse cx="'+pgN(hx-R*.35)+'" cy="'+pgN(hy-R*.6-el*.5)+'" rx="'+pgN(R*.14)+'" ry="'+pgN(el*.42)+'" fill="'+ein+'"/></g>'+
    '<g transform="rotate(12 '+pgN(hx+R*.15)+' '+pgN(hy-R*.7)+')"><ellipse cx="'+pgN(hx+R*.15)+'" cy="'+pgN(hy-R*.7-el*.5)+'" rx="'+pgN(R*.3)+'" ry="'+pgN(el*.55)+'" fill="'+c+'"'+PG_O+'/><ellipse cx="'+pgN(hx+R*.15)+'" cy="'+pgN(hy-R*.7-el*.5)+'" rx="'+pgN(R*.14)+'" ry="'+pgN(el*.42)+'" fill="'+ein+'"/></g>';}
  else if(e==="cat"||e==="horse"||e==="drag"){var ew=e==="horse"?.28:.42,eh=e==="horse"?.75:.85;
    [[-.55,-.55,-1],[.2,-.82,1]].forEach(function(p){var bx=hx+R*p[0],byy=hy+R*p[1];s+='<path d="M'+pgN(bx-R*ew)+' '+pgN(byy+R*.15)+'L'+pgN(bx+p[2]*R*.08)+' '+pgN(byy-R*eh)+'L'+pgN(bx+R*ew)+' '+pgN(byy+R*.05)+'z" fill="'+c+'"'+PG_O+'/>'+(e==="cat"?'<path d="M'+pgN(bx-R*ew*.5)+' '+pgN(byy+R*.05)+'L'+pgN(bx+p[2]*R*.06)+' '+pgN(byy-R*eh*.65)+'L'+pgN(bx+R*ew*.5)+' '+pgN(byy)+'z" fill="'+ein+'"/>':'');});}
  else if(e==="round"){s+='<circle cx="'+pgN(hx-R*.6)+'" cy="'+pgN(hy-R*.68)+'" r="'+pgN(R*.3)+'" fill="'+c+'"'+PG_O+'/><circle cx="'+pgN(hx+R*.18)+'" cy="'+pgN(hy-R*.92)+'" r="'+pgN(R*.3)+'" fill="'+c+'"'+PG_O+'/><circle cx="'+pgN(hx-R*.6)+'" cy="'+pgN(hy-R*.68)+'" r="'+pgN(R*.14)+'" fill="'+dk+'"/><circle cx="'+pgN(hx+R*.18)+'" cy="'+pgN(hy-R*.92)+'" r="'+pgN(R*.14)+'" fill="'+dk+'"/>';}
  else if(e==="yak"){s+='<ellipse cx="'+pgN(hx-R*.95)+'" cy="'+pgN(hy-R*.15)+'" rx="'+pgN(R*.38)+'" ry="'+pgN(R*.18)+'" transform="rotate(-20 '+pgN(hx-R*.95)+' '+pgN(hy-R*.15)+')" fill="'+c+'"'+PG_O+'/>';}
  /* 頭の丸 */
  s+='<ellipse cx="'+pgN(hx)+'" cy="'+pgN(hy)+'" rx="'+pgN(hr)+'" ry="'+pgN(R)+'" fill="'+c+'"'+PG_O+'/>';
  /* 垂れ耳（頭の手前） */
  if(e==="dog")s+='<path d="M'+pgN(hx-R*.55)+' '+pgN(hy-R*.75)+'q-'+pgN(R*.7)+' '+pgN(R*.1)+' -'+pgN(R*.62)+' '+pgN(R*1.15)+'q'+pgN(R*.35)+' '+pgN(R*.25)+' '+pgN(R*.65)+' -'+pgN(R*.15)+'z" fill="'+(o.ecol||dk)+'"'+PG_O+'/>';
  /* 前髪（ヤク） */
  if(o.fluff)s+='<path d="M'+pgN(hx-R*.8)+' '+pgN(hy-R*.4)+'q'+pgN(R*.6)+' -'+pgN(R*.9)+' '+pgN(R*1.5)+' -'+pgN(R*.45)+'l-3 5l-3 -3l-3 5l-3 -3l-3 4z" fill="'+(o.fcol||dk)+'"'+PG_O.replace("1.6","1.2")+'/>';
  /* 顔：鼻先・鼻・目・ほお・口 */
  var sn=o.sn||.5,mx=hx+R*.55,my=hy+R*.34;
  s+='<ellipse cx="'+pgN(mx+R*.12*sn)+'" cy="'+pgN(my)+'" rx="'+pgN(R*(.28+.32*sn))+'" ry="'+pgN(R*.3)+'" fill="'+(o.snc||bl)+'"'+(sn>.6?PG_O.replace("1.6","1.2"):"")+'/>';
  var nsx=mx+R*(.25+.42*sn),nsy=my-R*.12;
  s+=o.hoof?'<ellipse cx="'+pgN(nsx-R*.08)+'" cy="'+pgN(nsy+R*.1)+'" rx="'+pgN(R*.07)+'" ry="'+pgN(R*.1)+'" fill="#2B2233"/>':'<ellipse cx="'+pgN(nsx)+'" cy="'+pgN(nsy)+'" rx="'+pgN(R*.13)+'" ry="'+pgN(R*.09)+'" fill="'+(o.nose||"#2B2233")+'"/>';
  s+='<path d="M'+pgN(nsx-R*.25)+' '+pgN(nsy+R*.2)+'q'+pgN(R*.12)+' '+pgN(R*.1)+' '+pgN(R*.22)+' 0q'+pgN(R*.1)+' '+pgN(R*.1)+' '+pgN(R*.2)+' 0" stroke="#2B2233" stroke-width="1.2" fill="none" stroke-linecap="round"/>';
  var er=R*pgL(.27,.19,a);
  if(o.closed)s+='<path d="M'+pgN(hx-R*.12)+' '+pgN(hy-R*.05)+'q'+pgN(er)+' -'+pgN(er)+' '+pgN(er*2)+' 0M'+pgN(hx+R*.36)+' '+pgN(hy-R*.1)+'q'+pgN(er)+' -'+pgN(er)+' '+pgN(er*2)+' 0" stroke="#2B2233" stroke-width="1.8" fill="none" stroke-linecap="round"/>';
  else s+=pgEye(hx+R*.02,hy-R*.08,er,o.eyec)+pgEye(hx+R*.52,hy-R*.12,er*.92,o.eyec);
  if(o.brow)s+='<path d="M'+pgN(hx-R*.2)+' '+pgN(hy-R*.42)+'l'+pgN(R*.4)+' '+pgN(R*.1)+'M'+pgN(hx+R*.35)+' '+pgN(hy-R*.42)+'l'+pgN(R*.35)+' -'+pgN(R*.05)+'" stroke="#2B2233" stroke-width="1.6" stroke-linecap="round"/>';
  s+='<ellipse cx="'+pgN(hx-R*.3)+'" cy="'+pgN(hy+R*.3)+'" rx="'+pgN(R*.17)+'" ry="'+pgN(R*.1)+'" fill="#F28B8B" opacity=".55"/>';
  if(ac.mark)s+=pgStarMark(hx+R*.25,hy-R*.62,R*.2,ac.mark);
  /* 頭のかざり */
  if(ac.kalpak)s+=pgKalpak(hx-R*.05,hy-R*.78,R/14);
  if(ac.crown)s+=pgCrown(hx-R*.05,hy-R*.82,R/13,ac.crown);
  if(ac.flowers)s+=pgFlowers(hx-R*.1,hy-R*.8,R/14);
  if(ac.ribbon)s+='<path d="M'+pgN(hx-R*.55)+' '+pgN(hy-R*.85)+'l-6 -5v10zM'+pgN(hx-R*.55)+' '+pgN(hy-R*.85)+'l6 -5v10z" fill="'+ac.ribbon+'"'+PG_O.replace("1.6","1.2")+'/><circle cx="'+pgN(hx-R*.55)+'" cy="'+pgN(hy-R*.85)+'" r="2" fill="'+ac.ribbon+'"'+PG_O.replace("1.6","1")+'/>';
  return s;
}
/* 翼（羽を重ねた形）。x,y：つけ根、k：大きさ、far：奥の翼 */
function pgWing(x,y,k,c,far){
  var d=far?pgSh(c,-.18):c,s='<g transform="translate('+pgN(x)+' '+pgN(y)+') scale('+k.toFixed(2)+')'+(far?' rotate(-14)':'')+'">';
  s+='<path d="M0 0q-6 -26 -30 -34q-4 6 -2 10q-8 -2 -12 0q2 8 8 12q-8 0 -10 4q8 8 20 8q-6 2 -6 6q14 4 32 -6z" fill="'+d+'"'+PG_O+'/>';
  s+='<path d="M-6 -8q-10 -12 -22 -16M-8 -2q-12 -4 -26 -4M-6 4q-12 2 -22 6" stroke="'+pgSh(c,-.3)+'" stroke-width="1.2" fill="none"/>';
  return s+'</g>';
}
/* 卵（a：0＝丸い卵、1＝ひびが入る） */
function pgEgg(c,spot,crack){
  var s='<ellipse cx="0" cy="-17" rx="14" ry="18" fill="'+c+'"'+PG_O+'/><ellipse cx="-5" cy="-24" rx="4" ry="6" fill="#fff" opacity=".45"/>';
  s+='<circle cx="5" cy="-12" r="2.6" fill="'+spot+'"/><circle cx="-4" cy="-8" r="1.8" fill="'+spot+'"/><circle cx="2" cy="-26" r="2" fill="'+spot+'"/>';
  if(crack)s+='<path d="M-12 -18l5 3l3 -5l4 5l4 -4l3 3" stroke="#2B2233" stroke-width="1.4" fill="none" stroke-linejoin="round"/>';
  return s;
}
/* ---------- 鳥（イヌワシ・伝説の大鳥） ----------
   o.a 育ちぐあい、o.col 体、o.bel 胸、o.head 頭の色、o.spread 翼を広げる、o.hood 狩りの目かくし帽（トモゴ）、o.fuzz ひなの綿毛 */
function pgBird(o){
  var a=o.a||0,ac=o.acc||{},c=o.col||"#6E4A22",bl=o.bel||"#B0773C",hc=o.head||"#D8A24A",s="";
  var H=pgL(26,52,a),W=pgL(22,30,a),R=pgL(11,10,a);
  if(ac.aura)s+='<ellipse cx="0" cy="'+pgN(-H*.6)+'" rx="'+pgN(W*2.2)+'" ry="'+pgN(H*.9)+'" fill="'+ac.aura+'" opacity=".22"/>';
  /* 広げた翼 */
  if(o.spread){var k=pgL(.8,1.6,a);[[-1,1],[1,0]].forEach(function(p){s+='<g transform="translate(0 '+pgN(-H*.62)+') scale('+(p[0]*k).toFixed(2)+' '+k.toFixed(2)+')"><path d="M2 0q12 -30 44 -34q-2 6 -6 8q8 0 12 2q-4 6 -10 8q6 2 8 6q-6 4 -14 4q4 4 2 8q-20 2 -36 -2z" fill="'+(p[1]?pgSh(c,-.18):c)+'"'+PG_O+'/><path d="M10 -8q14 -10 28 -16M10 -2q16 -4 30 -6M10 4q12 0 22 -2" stroke="'+pgSh(c,-.35)+'" stroke-width="1.1" fill="none"/>'+(o.wtip?'<path d="M40 -30q4 4 4 8M46 -20q2 4 0 8" stroke="'+o.wtip+'" stroke-width="3" stroke-linecap="round"/>':'')+'</g>';});}
  /* しっぽ */
  s+='<path d="M-6 '+pgN(-H*.18)+'l-10 '+pgN(H*.2)+'h22z" fill="'+pgSh(c,-.1)+'"'+PG_O+'/>';
  /* 足 */
  s+='<path d="M-5 '+pgN(-H*.12)+'v'+pgN(H*.1)+'M5 '+pgN(-H*.12)+'v'+pgN(H*.1)+'" stroke="#E8A33D" stroke-width="3.4" stroke-linecap="round"/><path d="M-9 -1h8M1 -1h8" stroke="#2B2233" stroke-width="2.2" stroke-linecap="round"/>';
  /* 体 */
  if(o.fuzz)s+='<path d="M'+pgN(-W*.55)+' '+pgN(-H*.45)+'q-6 -2 -4 -8q-6 -6 0 -10q0 -8 8 -8q4 -8 12 -4q8 -4 12 4q8 0 8 8q6 4 0 10q2 6 -4 8q0 10 -16 10t-16 -10z" fill="'+c+'"'+PG_O+'/>';
  else s+='<path d="M0 '+pgN(-H)+'q'+pgN(W*.62)+' 0 '+pgN(W*.62)+' '+pgN(H*.45)+'q0 '+pgN(H*.42)+' -'+pgN(W*.62)+' '+pgN(H*.42)+'q-'+pgN(W*.62)+' 0 -'+pgN(W*.62)+' -'+pgN(H*.42)+'q0 -'+pgN(H*.45)+' '+pgN(W*.62)+' -'+pgN(H*.45)+'z" fill="'+c+'"'+PG_O+'/><path d="M0 '+pgN(-H*.72)+'q'+pgN(W*.36)+' 0 '+pgN(W*.36)+' '+pgN(H*.3)+'q0 '+pgN(H*.26)+' -'+pgN(W*.36)+' '+pgN(H*.26)+'q-'+pgN(W*.36)+' 0 -'+pgN(W*.36)+' -'+pgN(H*.26)+'q0 -'+pgN(H*.3)+' '+pgN(W*.36)+' -'+pgN(H*.3)+'z" fill="'+bl+'"/>';
  /* たたんだ翼 */
  if(!o.spread&&!o.fuzz)s+='<path d="M'+pgN(-W*.5)+' '+pgN(-H*.75)+'q-6 '+pgN(H*.35)+' 4 '+pgN(H*.62)+'q'+pgN(W*.4)+' -'+pgN(H*.1)+' '+pgN(W*.4)+' -'+pgN(H*.45)+'q-2 -'+pgN(H*.2)+' -'+pgN(W*.4)+' -'+pgN(H*.17)+'z" fill="'+pgSh(c,-.12)+'"'+PG_O+'/>';
  if(ac.tumar)s+=pgTumar(W*.1,-H*.8,ac.tumar);
  /* 頭 */
  var hx=W*.12,hy=-H-R*.55;
  s+='<circle cx="'+pgN(hx)+'" cy="'+pgN(hy)+'" r="'+pgN(R)+'" fill="'+(o.fuzz?c:hc)+'"'+PG_O+'/>';
  s+='<path d="M'+pgN(hx+R*.6)+' '+pgN(hy-R*.15)+'q'+pgN(R*.8)+' -'+pgN(R*.1)+' '+pgN(R*.75)+' '+pgN(R*.65)+'q-'+pgN(R*.2)+' -'+pgN(R*.15)+' -'+pgN(R*.75)+' '+pgN(R*.05)+'z" fill="#F2C230"'+PG_O.replace("1.6","1.3")+'/>';
  if(o.hood)s+='<path d="M'+pgN(hx-R*1.02)+' '+pgN(hy+R*.1)+'q0 -'+pgN(R*1.2)+' '+pgN(R*1.02)+' -'+pgN(R*1.2)+'t'+pgN(R*.9)+' '+pgN(R*.9)+'l-'+pgN(R*.2)+' '+pgN(R*.3)+'z" fill="#7A4E26"'+PG_O+'/><path d="M'+pgN(hx-R*.2)+' '+pgN(hy-R*1.15)+'l2 -5l2 5" fill="#B3202B" stroke="#2B2233" stroke-width="1"/>'+pgCurl(hx-R*.8,hy-R*.6,R*1.4,"#F2D28A");
  else s+=pgEye(hx+R*.28,hy-R*.12,R*pgL(.36,.26,a),o.eyec);
  if(!o.hood&&o.brow)s+='<path d="M'+pgN(hx-R*.1)+' '+pgN(hy-R*.45)+'l'+pgN(R*.65)+' '+pgN(R*.12)+'" stroke="#2B2233" stroke-width="2" stroke-linecap="round"/>';
  if(ac.crown)s+=pgCrown(hx,hy-R*.95,R/11,ac.crown);
  if(ac.mark)s+=pgStarMark(hx-R*.2,hy-R*.55,R*.22,ac.mark);
  return s;
}
/* コムズ（3本の弦の楽器） */
function pgKomuz(x,y,s,r){s=s||1;return '<g transform="translate('+pgN(x)+' '+pgN(y)+') rotate('+(r||-40)+') scale('+s+')"><path d="M0 -8q9 0 9 12q0 12 -9 14q-9 -2 -9 -14q0 -12 9 -12z" fill="#B0773C"'+PG_O+'/><rect x="-2" y="-40" width="4" height="34" rx="2" fill="#8A5A2B"'+PG_O.replace("1.6","1.2")+'/><path d="M-1 -38v54M0 -38v54M1 -38v54" stroke="#F4F1E6" stroke-width=".5"/><circle cx="0" cy="6" r="2.4" fill="#5A3A22"/></g>';}
