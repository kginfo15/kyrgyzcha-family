/* ===== Phase80：物語を「漫画のページ」で読む =====
   4コマ（phase76 の描き下ろし）を、1話6〜7コマの漫画のページに組み直す。
   ・コマの大きさを変える（横長の大ゴマ・縦長の顔のアップ・ななめの切れ目）。ページの型は話ごとに3種類を順番に使う。
   ・顔のアップのコマは新しく描く：人物の上半身を大きく、気持ちに合わせた背景（集中線・キラキラ・いなずま・たて線）。
   ・動きのコマは少しかたむけて、流線と大きな効果音をのせる。かげの部分にスクリーントーン（点の網）をのせる。
   ・ナレーションはコマの中の四角い枠、セリフ（本文の「」）は顔のアップのふきだしに入れる。
   ・漫画のコマでは、目を大きく・光を2つ入れた漫画らしい目で描く（P74_MANGA のときだけ。ほかの画面の絵は変えない）。
   絵はすべてこのアプリのオリジナル（p74Person・M6 の部品を組み合わせて描く）。 */
var P74_MANGA=false,M8_REC=null;
(function(){
if(typeof M6==="undefined"||typeof p76Comic!=="function")return;
/* ---------- 漫画の目 ---------- */
if(typeof p74Face==="function"){var _face=p74Face;
  p74Face=function(o){var h=_face.apply(this,arguments);if(!P74_MANGA)return h;
    var f=o.face||(o.rival?"rival":"none");if(/^(joy|laugh|sleep|cry|surprise)$/.test(f)||o.mask||o.visor)return h;
    var L={l:-2,r:2}[o.look]||0,U={u:-2,d:2}[o.look]||0,K="#2B2233",ic=o.eyec&&!o.visor?o.eyec:"#5A3A2A";
    var sharp=/^(angry|rival|determined)$/.test(f);
    var eye=function(x,side){var cx=x+L,cy=60+U;return '<ellipse cx="'+cx+'" cy="'+(cy+.4)+'" rx="3.9" ry="'+(sharp?4.4:5.4)+'" fill="#fff" stroke="'+K+'" stroke-width=".8"/>'+
      '<ellipse cx="'+cx+'" cy="'+(cy+.9)+'" rx="3" ry="'+(sharp?3.6:4.4)+'" fill="'+ic+'"/><ellipse cx="'+cx+'" cy="'+(cy+1.4)+'" rx="1.7" ry="'+(sharp?2.4:2.9)+'" fill="'+K+'"/>'+
      '<circle cx="'+(cx+1.3)+'" cy="'+(cy-1.6)+'" r="1.5" fill="#fff"/><circle cx="'+(cx-1.3)+'" cy="'+(cy+2.6)+'" r=".7" fill="#fff"/>'+
      '<path d="M'+(cx-4.6)+' '+(cy-(sharp?3:4.4))+'q4.6 '+(sharp?(side<0?2:-1):-2.6)+' 9.2 '+(sharp?(side<0?2.6:-2.6)*-1:0)+'" stroke="'+K+'" stroke-width="2.2" fill="none" stroke-linecap="round"/>';};
    /* 元の目（黒い楕円）を消して、漫画の目に置きかえる */
    h=h.replace(/<ellipse cx="[\d.\-]+" cy="[\d.\-]+" rx="3" ry="3.8" fill="#2B2233"\/><circle cx="[\d.\-]+" cy="[\d.\-]+" r="1.1" fill="#fff"\/>/g,"");
    return h+eye(51,-1)+eye(69,1)+(f==="angry"?'<path d="M77 44l3-3m0 3l-3-3M80 47l3-3" stroke="#E2483B" stroke-width="1.6" stroke-linecap="round"/>':'');};}
/* ---------- 描いた人物を記録（顔のアップの元にする） ---------- */
var _P=M6.P,_Up=M6.Up,_bub=M6.bub,_sfx=M6.sfx;
M6.sfx=function(x,y,t){if(M8_REC){var w=String(t).length*18.5+6;M8_REC.push({bub:1,sfx:1,x:x+w/2,y:y-9,w:w,h:28});}return _sfx.apply(this,arguments);};
var M8_HIDE=[];
M6.bub=function(x,y,t){var tt=String(t).replace(/[\s\n]/g,"");if(M8_REC&&tt&&M8_HIDE.some(function(q){q=q.replace(/\s/g,"");return q.indexOf(tt.replace(/…$/,""))>=0||tt.indexOf(q)>=0;}))return "";
  if(M8_REC){var L=String(t).split("\n"),w=Math.max.apply(null,L.map(function(l){return l.length;}))*11+16,h=L.length*13+10;M8_REC.push({bub:1,x:x,y:y,w:w,h:h});}return _bub.apply(this,arguments);};
var _horse=M6.horse;M6.horse=function(x,y,s,c,opt){if(M8_REC&&opt&&opt.rider&&typeof opt.rider==="object"){s=s||1;var sc=opt.rs||.5,hx=x+(opt.flip?-2:2)*s,hy=y+(-58-52*sc)*s,hh=146*sc*s;M8_REC.push({o:opt.rider,x:hx,y:hy+.66*hh,h:hh,rider:1});}return _horse.apply(this,arguments);};
M6.P=function(o,x,y,h,opt){if(M8_REC&&o&&typeof o==="object")M8_REC.push({o:o,x:x,y:y,h:h,flip:opt&&opt.flip});return _P.apply(this,arguments);};
M6.Up=function(o,x,top,h,opt){if(M8_REC&&o&&typeof o==="object")M8_REC.push({o:o,x:x,y:top+h*1.2,h:h*1.25,flip:opt&&opt.flip,up:1});return _Up.apply(this,arguments);};
function run(k){M8_REC=[];var b="";try{b=k.d();}catch(e){b=M6.steppe();}var r=M8_REC;M8_REC=null;return {b:b,rec:r};}
var N=0;function uid(p){N++;return "m8"+p+N;}
/* ---------- 部品：トーン・集中線・流線・背景 ---------- */
function tone(x,y,w,h,op,from){var p=uid("p"),g=uid("g"),m=uid("m");
  return '<defs><pattern id="'+p+'" width="3.2" height="3.2" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><circle cx="1.6" cy="1.6" r=".75" fill="#1F1A24"/></pattern>'+
    '<linearGradient id="'+g+'" x1="0" y1="0" x2="0" y2="1"><stop offset="'+(from||.55)+'" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity="1"/></linearGradient><mask id="'+m+'"><rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#'+g+')"/></mask></defs>'+
    '<rect x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" fill="url(#'+p+')" mask="url(#'+m+')" opacity="'+(op||.16)+'"/>';}
function focus(cx,cy,w,h,c,op,inner){var s="",n=64;for(var i=0;i<n;i++){var a=i/n*Math.PI*2+(i%2)*.03,r1=(inner||.42)*Math.max(w,h)*(0.9+((i*37)%7)/20),r2=Math.max(w,h);
    var x1=cx+Math.cos(a)*r1,y1=cy+Math.sin(a)*r1*.8,x2=cx+Math.cos(a)*r2,y2=cy+Math.sin(a)*r2*.8,x3=cx+Math.cos(a+.02)*r2,y3=cy+Math.sin(a+.02)*r2*.8;
    s+='<path d="M'+x1.toFixed(1)+' '+y1.toFixed(1)+'L'+x2.toFixed(1)+' '+y2.toFixed(1)+'L'+x3.toFixed(1)+' '+y3.toFixed(1)+'z" fill="'+(c||"#1F1A24")+'"/>';}
  return '<g opacity="'+(op||.55)+'">'+s+'</g>';}
function flow(x,y,w,h,c){var s="";for(var i=0;i<16;i++){var yy=y+((i*53)%100)/100*h,ll=w*(.18+((i*29)%10)/30);s+='<path d="M'+(x+w-ll*.2)+' '+yy.toFixed(1)+'h-'+ll.toFixed(1)+'" stroke="'+(c||"#fff")+'" stroke-width="'+(1+(i%3)*.6)+'" stroke-linecap="round" opacity=".85"/>';}return s;}
function sparkles(w,h){var s="";[[.12,.2,1.6],[.85,.18,1.2],[.78,.75,1.8],[.18,.8,1.1],[.5,.08,.9],[.92,.5,1],[.06,.5,1.3]].forEach(function(q){s+=M6.spark(q[0]*w,q[1]*h,q[2],"#FFFFFF");});
  [[.25,.32],[.7,.28],[.62,.86],[.32,.7]].forEach(function(q){s+='<circle cx="'+(q[0]*w)+'" cy="'+(q[1]*h)+'" r="7" fill="#fff" opacity=".35"/>';});return s;}
function moodBg(f){var g=uid("bg"),W=240,H=140;
  if(/^(joy|laugh|smile)$/.test(f))return '<defs><radialGradient id="'+g+'"><stop offset="0" stop-color="#FFF6D6"/><stop offset="1" stop-color="#F7C6D0"/></radialGradient></defs><rect width="240" height="140" fill="url(#'+g+')"/>'+sparkles(W,H);
  if(/^(angry|rival)$/.test(f))return '<rect width="240" height="140" fill="#3A2430"/>'+focus(120,62,W,H,"#E2483B",.5,.36)+tone(0,0,240,140,.25,0);
  if(/^(determined)$/.test(f))return '<rect width="240" height="140" fill="#F4F1EA"/>'+focus(120,62,W,H,"#1F1A24",.75,.4);
  if(/^(surprise)$/.test(f)){var z="";for(var i=0;i<14;i++){var a=i/14*Math.PI*2,x1=120+Math.cos(a)*70,y1=62+Math.sin(a)*50,x2=120+Math.cos(a+.12)*150,y2=62+Math.sin(a+.12)*110,x3=120+Math.cos(a+.2)*80,y3=62+Math.sin(a+.2)*58;z+='<path d="M'+x1+' '+y1+'L'+x2+' '+y2+'L'+x3+' '+y3+'z" fill="#2B4A7A"/>';}
    return '<rect width="240" height="140" fill="#fff"/><g opacity=".85">'+z+'</g>';}
  if(/^(sad|cry|worry)$/.test(f)){var v="";for(var j=0;j<30;j++)v+='<path d="M'+(j*8+((j*13)%5))+' 0v'+(60+((j*29)%70))+'" stroke="#41506E" stroke-width="'+(1+(j%3)*.5)+'"/>';return '<rect width="240" height="140" fill="#C9D3E2"/><g opacity=".55">'+v+'</g>'+tone(0,0,240,140,.25,.2);}
  return '<rect width="240" height="140" fill="#EDE6D6"/>'+tone(0,0,240,140,.2,.3);}
/* ---------- コマを作る ---------- */
function mainOf(rec,avoid){var L=rec.filter(function(r){return !r.bub&&r.o&&r.o.body&&(!avoid||r.o!==avoid.o);});if(!L.length)return null;
  L.sort(function(a,b){var fa=a.o.face&&a.o.face!=="none"?1:0,fb=b.o.face&&b.o.face!=="none"?1:0;return (fb-fa)||(b.h-a.h);});return L[0];}
function closeUp(r,flip,face){var o=m6(r.o,{});if(face)o.face=face;var f=o.face||"none";o.pose=undefined;
  return {b:moodBg(f)+M6.Up(o,120,2,128,{cut:100,flip:flip?1:0}),cx:120,cy:70,kind:"cu",face:f};}
function centerOf(rec){var L=rec.filter(function(r){return r.x!=null&&!r.bub;});if(!L.length)return 120;var s=0;L.forEach(function(r){s+=r.x;});return s/L.length;}
var SFX={act:["ドン！","ザッ！","ダッ！","ゴゴゴ"],joy:["ワァッ！","やった！","パアッ"],surprise:["！？","ハッ！","ドキッ"],sad:["……","シーン"],calm:["スッ","フワッ"]};
function moodOf(rec){var rr=rec.filter(function(r){return r.o;}),fs=rr.map(function(r){return r.o.face||"";}).join(" "),ps=rr.map(function(r){return r.o.pose||"";}).join(" ");
  if(/angry|rival/.test(fs)||/run|attack|swing|strike|jump/.test(ps))return "act";if(/surprise/.test(fs))return "surprise";if(/joy|laugh/.test(fs))return "joy";if(/sad|cry|worry/.test(fs))return "sad";if(/determined/.test(fs))return "act";return "calm";}
/* SVG：ソース（240×140）を、コマの縦横比 a に合わせて切りとる */
function vbOf(p,a){var vw,vh;if(a>=240/140){vw=240;vh=240/a;}else{vh=140;vw=140*a;}
  if(p.zoom){vw/=p.zoom;vh/=p.zoom;}
  var cx=p.cx!=null?p.cx:120,cy=p.cy!=null?p.cy:70,bx=Math.max(0,Math.min(240-vw,cx-vw/2)),by=Math.max(0,Math.min(140-vh,cy-vh/2));
  if(p.rec&&p.rec.length&&!p.zoom){/* もとの絵のふきだし・顔が半分だけ切れない位置をさがす */
    var bs=1e9,X=bx,Y=by;for(var tx=0;tx<=240-vw+.01;tx+=Math.max(2,(240-vw)/30)){for(var ty=0;ty<=140-vh+.01;ty+=Math.max(2,(140-vh)/24)){
      var sc=(Math.abs(tx-bx)+Math.abs(ty-by))*.6;
      p.rec.forEach(function(r){var b=r.bub?[r.x-r.w/2,r.y-r.h/2,r.x+r.w/2,r.y+r.h/2]:[r.x-.17*r.h,r.y-.9*r.h,r.x+.17*r.h,r.y-.42*r.h],wt=r.bub?3:4;
        var iw=Math.max(0,Math.min(tx+vw,b[2])-Math.max(tx,b[0])),ih=Math.max(0,Math.min(ty+vh,b[3])-Math.max(ty,b[1])),A=(b[2]-b[0])*(b[3]-b[1]),I=iw*ih;
        if(I>0&&I<A)sc+=Math.min(I,A-I)*wt;});
      if(sc<bs){bs=sc;X=tx;Y=ty;}}}bx=X;by=Y;}
  return {x:bx,y:by,vw:vw,vh:vh};}
function svgOf(p,a){var V=vbOf(p,a),x=V.x,y=V.y,vw=V.vw,vh=V.vh;
  var body=p.b;if(p.tilt)body='<g transform="rotate('+p.tilt+' '+(x+vw/2)+' '+(y+vh/2)+') translate('+(x+vw/2)+' '+(y+vh/2)+') scale(1.12) translate('+(-(x+vw/2))+' '+(-(y+vh/2))+')">'+body+'</g>';
  var ov=tone(x,y,vw,vh,p.kind==="cu"?.12:.16,p.kind==="cu"?.7:.6);
  if(p.kind==="act")ov+=focus(x+vw/2,y+vh/2,vw,vh,"#1F1A24",.35,.5)+flow(x,y+vh*.05,vw*.35,vh*.9);
  if(p.sfx){var fs=Math.round(vh*.22),tw=fs*p.sfx.length*.92,pos=sfxPos(p,V,fs,tw),sx=pos[0],sy=pos[1];ov+='<text x="'+sx.toFixed(1)+'" y="'+sy.toFixed(1)+'" transform="rotate(-10 '+(sx+tw/2).toFixed(1)+' '+sy.toFixed(1)+')" font-size="'+fs+'" font-weight="900" fill="'+(p.sfxc||"#E2483B")+'" stroke="#1F1A24" stroke-width="'+(fs*.07).toFixed(1)+'" paint-order="stroke" font-family="system-ui,sans-serif" letter-spacing="-1">'+esc(p.sfx)+'</text>';}
  return '<svg viewBox="'+x.toFixed(1)+' '+y.toFixed(1)+' '+vw.toFixed(1)+' '+vh.toFixed(1)+'" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'+body+ov+'</svg>';}
/* 擬音の位置：顔・ふきだし・ナレーションと重ならないところ */
function sfxPos(p,V,fs,tw){var best=null,bs=1e9,nar=p.narBox;
  [[.04,.3],[.96,.3],[.04,.62],[.96,.62],[.04,.94],[.96,.94],[.5,.3],[.5,.94]].forEach(function(c,ci){var sx=c[0]<.5?V.x+V.vw*c[0]:c[0]>.5?V.x+V.vw*c[0]-tw:V.x+V.vw/2-tw/2,sy=V.y+Math.max(fs+2,V.vh*c[1]-2),x0=sx,y0=sy-fs,x1=sx+tw,y1=sy,sc=ci*.5;
    var ov=function(a,b,c2,d,wt){var w=Math.min(x1,c2)-Math.max(x0,a),h=Math.min(y1,d)-Math.max(y0,b);if(w>0&&h>0)sc+=w*h*wt;};
    (p.rec||[]).forEach(function(r){if(r.bub){ov(r.x-r.w/2,r.y-r.h/2,r.x+r.w/2,r.y+r.h/2,3);return;}var hh=r.h;ov(r.x-.18*hh,r.y-.82*hh,r.x+.18*hh,r.y-.4*hh,5);});
    if(nar)ov(nar[0],nar[1],nar[2],nar[3],4);
    if(sc<bs){bs=sc;best=[sx,sy];}});
  return best;}
function narSize(t,frac,ratio,mf){var W=340*frac,H=340/ratio,sm=frac<.7,fsz=sm?12:12.5,lh=sm?18:19.4,mw=W*mf-16,cw=t.length*fsz*1.1,rows=Math.max(1,Math.ceil(cw/mw));
  return {fw:Math.min(cw,mw)/W+16/W+.03,fh:Math.min(1,(rows*lh+12)/H+.04)};}
/* ナレーションの枠を置く角と幅：人物の顔・もとのふきだし・擬音と重ならないところを選ぶ */
function corner(p,V,t,frac,ratio){var best={side:"tl",mf:frac<.7?.64:.76,fw:.6,fh:.44},bs=1e9;
  (frac<.7?[.64,.52]:[.76,.62,.5]).forEach(function(mf,mi){var NS=narSize(t,frac,ratio,mf),fw=NS.fw,fh=NS.fh;
  ["tl","tr","bl","br"].forEach(function(k,ki){var x0=V.x+(k.charAt(1)==="l"?0:V.vw*(1-fw)),y0=V.y+(k.charAt(0)==="t"?0:V.vh*(1-fh)),x1=x0+V.vw*fw,y1=y0+V.vh*fh,sc=(k.charAt(0)==="b"?V.vw*V.vh*.03:0)+ki+mi*V.vw*V.vh*.01+(fh>.7?V.vw*V.vh*.2:0);
    var hd=0,ov=function(a,b,c,d,wt){var w=Math.min(x1,c)-Math.max(x0,a),h=Math.min(y1,d)-Math.max(y0,b);if(w>0&&h>0){sc+=w*h*wt;return w*h/((c-a)*(d-b));}return 0;};
    (p.rec||[]).forEach(function(r){if(r.bub){ov(r.x-r.w/2,r.y-r.h/2,r.x+r.w/2,r.y+r.h/2,r.sfx?2:3);return;}var hh=r.h;
      if(r.x+.16*hh<V.x||r.x-.16*hh>V.x+V.vw)return;
      hd=Math.max(hd,ov(r.x-.17*hh,r.y-.9*hh,r.x+.17*hh,r.y-.42*hh,5));ov(r.x-.2*hh,r.y-.42*hh,r.x+.2*hh,r.y,1);});
    if(sc<bs){bs=sc;best={side:k,mf:mf,fw:fw,fh:fh,hd:hd};}});});
  return best;}
/* 本文の「」をセリフとして取り出す */
function quotes(A){var q=[];A.forEach(function(k){String(k.t||"").replace(/「([^「」]{2,26})」/g,function(_,s){q.push(s);});});return q;}
function shortQ(s){s=s.replace(/^[…、\s]+/,"");if(s.length>18){var c=s.slice(0,18),m=Math.max(c.lastIndexOf("、"),c.lastIndexOf("！"),c.lastIndexOf("？"),c.lastIndexOf("。"));s=(m>6?c.slice(0,m+1):c+"…");}return s;}
/* ページの型：行ごとに [縦横比, [[コマ番号, 幅の割合], …], ななめ] */
var LAY=[
  [[2.15,[[0,1]]],[1.75,[[1,.36],[2,.64]],1],[1.75,[[4,.62],[3,.38]],1],[1.9,[[5,1]]]],
  [[1.75,[[0,.64],[1,.36]],1],[2.05,[[2,1]]],[1.75,[[3,.38],[4,.62]],1],[1.9,[[5,1]]]],
  [[2.15,[[0,1]]],[1.75,[[2,.6],[1,.4]],1],[2.0,[[4,1]]],[1.6,[[3,.38],[5,.62]],1]]];
function build(P,i){var A=P76[P.id][i];if(!A||!A.length)return "";
  var Q0=[];A.forEach(function(k){String(k.t||"").replace(/「([^「」]{2,80})」/g,function(_,x){Q0.push(x);});});M8_HIDE=Q0;
  P74_MANGA=true;var R=[];try{R=A.map(run);}finally{M8_HIDE=[];}
  var all=[];R.forEach(function(r){all=all.concat(r.rec);});
  var k1=R[1]||R[0],k2=R[2]||k1,k3=R[3]||k2,T=A.map(function(k){return String(k.t||"");});
  /* セリフ：20字以内の「」だけをふきだしにし、ナレーションからは外す。顔のアップは、そのセリフがあるコマの人物 */
  var Q=[];T.forEach(function(t,n){t.replace(/「([^「」]{2,20})」([^「」]{0,5})/g,function(_,x,nx){if(!nx||/^[。、！\s]/.test(nx)||/^(と|って)(言|いっ|いい|いわ|たの|頼|考|思|おも|叫|さけ|答|こた|聞|きい|約束|ちか|誓|笑|わら|声|つぶや|ささや|伝|たず|話|はな|歌|うた|命|めい|祈|いの|書|か)/.test(nx))Q.push({s:x,n:n});});});Q=Q.slice(0,2);
  Q.forEach(function(qq){var t0=T[qq.n],k0=t0.indexOf("「"+qq.s+"」"),af=t0.slice(k0+qq.s.length+2);T[qq.n]=(t0.slice(0,k0)+(/^(と|って)/.test(af)?"そう"+af.replace(/^(と|って)/,""):af)).replace(/^[\s、。]+/,"");});
  var m1=Q[0]?mainOf(R[Q[0].n].rec):mainOf((R[0].rec).concat(k1.rec));m1=m1||mainOf(k1.rec);
  var m2=Q[1]?mainOf(R[Q[1].n].rec,m1):null;m2=m2||mainOf(k2.rec,m1)||mainOf(k2.rec)||m1;
  var q=Q.map(function(x){return x.s;});
  var cu1=m1?closeUp(m1,false):{b:M6.steppe(),cx:120,cy:70},cu2=m2?closeUp(m2,true,m2===m1?(m1.o.face==="determined"?"surprise":"determined"):null):{b:M6.steppe(),cx:120,cy:70};
  var mood=moodOf(k2.rec),sf=SFX[mood][(i+P.id.length)%SFX[mood].length];
  var pan=[
    {b:R[0].b,cx:centerOf(R[0].rec),cy:70,t:T[0],kind:"wide",rec:R[0].rec},
    {b:cu1.b,cx:120,cy:70,kind:"cu",q:q[0]||""},
    {b:k1.b,cx:centerOf(k1.rec),cy:70,t:T[1],kind:"mid",rec:k1.rec},
    {b:cu2.b,cx:120,cy:70,kind:"cu",q:q[1]||""},
    {b:k2.b,cx:centerOf(k2.rec),cy:72,t:T[2],rec:k2.rec,kind:mood==="act"||mood==="surprise"?"act":"mid",tilt:mood==="act"?-4:mood==="surprise"?3:0,sfx:sf,sfxc:mood==="joy"?"#F5A623":mood==="sad"?"#5A6A8A":"#E2483B"},
    {b:k3.b,cx:centerOf(k3.rec),cy:70,t:T[3],kind:"wide",rec:k3.rec}];
  var L=LAY[i%LAY.length],h='<div class="m8-page" data-k="p75-comic" role="img" aria-label="漫画：'+esc(P.story[i].t)+'">',nb=0;
  L.forEach(function(row){var ratio=row[0],cells=row[1],sl=row[2];
    h+='<div class="m8-row" style="aspect-ratio:'+ratio+'">';
    cells.forEach(function(c,ci){var p=pan[c[0]];if(!p)return;var a=ratio*c[1];
      var cls="m8-c"+(sl&&cells.length===2?(ci===0?" m8-sl":" m8-sr"):"");
      var V=vbOf(p,a),CN=corner(p,V,p.t||"",c[1],ratio),fw=CN.fw,fh=CN.fh,side=p.kind==="cu"?"tl":CN.side;
      /* どの角に置いても顔にかかるときは、コマの上に帯を作ってナレーションを入れる */
      if(p.t&&p.kind!=="cu"&&CN.hd>.1){var W=326*c[1],H=326/ratio,sm=c[1]<.7,fz=sm?11.5:12,lh=sm?17:18,rows=Math.max(1,Math.ceil(p.t.length*fz*1.08/(W-24))),bh=rows*lh+10;
        if(bh<H*.55){var a2=W/(H-bh-5);nb++;h+='<div class="'+cls+'" style="flex:'+c[1]+'"><div class="m8-in m8-band"><div class="m8-cap'+(sm?" sm":"")+'">'+esc(p.t)+'</div>'+(p.sfxl=false,svgOf(p,a2))+'</div></div>';return;}}
      if(p.t){var nx0=V.x+(side.charAt(1)==="l"?0:V.vw*(1-fw)),ny0=V.y+(side.charAt(0)==="t"?0:V.vh*(1-fh));p.narBox=[nx0,ny0,nx0+V.vw*fw,ny0+V.vh*fh];}
      var txt="";if(p.t){nb++;txt='<div class="m8-nar '+side+(c[1]<.7?" sm":"")+'" style="max-width:'+Math.round(CN.mf*100)+'%">'+esc(p.t)+'</div>';}
      if(p.q)txt+='<div class="m8-bub '+(c[1]<.5?"nar":"")+'">'+esc(p.q)+'</div>';
      h+='<div class="'+cls+'" style="flex:'+c[1]+'"><div class="m8-in">'+svgOf(p,a)+txt+'</div></div>';});
    h+='</div>';});
  P74_MANGA=false;
  return h+'</div>';}
p76Comic=function(P,i){try{return build(P,i);}catch(e){P74_MANGA=false;return "";}};
/* 読み方の名前：「4コマ漫画」→「漫画」 */
if(typeof p75RdBar==="function"){var _rb=p75RdBar;p75RdBar=function(){return String(_rb.apply(this,arguments)).replace("4コマ漫画で読む","漫画で読む");};}
(function(){try{var st=document.createElement("style");st.textContent=
'.m8-page{background:#FBF8F0;border:1px solid var(--line);border-radius:6px;padding:7px;margin:8px 0 12px;display:flex;flex-direction:column;gap:7px;box-shadow:0 2px 10px rgba(0,0,0,.08)}'+
'html.p72-dark .m8-page,body.p72-dark .m8-page{background:#EDE8DC}'+
'.m8-row{display:flex;gap:7px;width:100%}'+
'.m8-c{position:relative;min-width:0;background:#1F1A24}'+
'.m8-in{position:absolute;inset:2.5px;overflow:hidden;background:#fff;line-height:0}'+
'.m8-in svg{width:100%;height:100%;display:block}'+
'.m8-sl,.m8-sl .m8-in{clip-path:polygon(0 0,100% 0,calc(100% - 16px) 100%,0 100%)}'+
'.m8-sr{margin-left:-14px}.m8-sr,.m8-sr .m8-in{clip-path:polygon(16px 0,100% 0,100% 100%,0 100%)}'+
'.m8-sl .m8-in{inset:2.5px 2.5px 2.5px 2.5px}.m8-sr .m8-in{inset:2.5px}'+
'.m8-nar{position:absolute;max-width:76%;background:#fff;color:#1F1A24;border:1.8px solid #1F1A24;font-size:12.5px;line-height:1.55;font-weight:600;padding:4px 7px;box-shadow:2px 2px 0 rgba(0,0,0,.25)}'+
'.m8-nar.tl{left:6px;top:6px}.m8-nar.tr{right:6px;top:6px}.m8-nar.bl{left:6px;bottom:6px}.m8-nar.br{right:6px;bottom:6px}.m8-nar.sm{max-width:64%;font-size:12px;line-height:1.5}'+
'.m8-sr .m8-nar.tl,.m8-sr .m8-nar.bl{left:18px}.m8-sl .m8-nar.tr,.m8-sl .m8-nar.br{right:20px}'+
'.m8-band{display:flex;flex-direction:column;background:#1F1A24;gap:2.5px}.m8-band svg{flex:1;min-height:0;height:auto}'+
'.m8-cap{flex:none;background:#fff;color:#1F1A24;font-size:12px;line-height:18px;font-weight:600;padding:5px 9px}.m8-cap.sm{font-size:11.5px;line-height:17px;padding:5px 8px}'+
'.m8-sr .m8-cap{padding-left:20px}.m8-sl .m8-cap{padding-right:20px}'+
'.m8-bub{position:absolute;right:6%;top:5%;max-width:66%;background:#fff;color:#1F1A24;border:2px solid #1F1A24;border-radius:50%/42%;font-size:12.5px;line-height:1.45;font-weight:800;padding:8px 12px;text-align:center}'+
'.m8-bub:after{content:"";position:absolute;left:22%;bottom:-11px;border:7px solid transparent;border-top:12px solid #1F1A24;border-bottom:0}'+
'.m8-bub.nar{right:6%;left:auto;max-width:82%;font-size:11.5px;padding:6px 9px}';
document.head.appendChild(st);}catch(_){}})();
})();
