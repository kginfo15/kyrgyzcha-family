/* ===== Phase93：育てるモードの3D（2026-11-28 Yuta の要望） =====
   ・育てる画面の上の絵と、進化の演出を、3Dのキャラクターにする（ほかの画面の小さな絵は今までの2Dのまま）。
   ・外部ライブラリは使わない自前の小さな WebGL 描画（読み込みが軽い・通信なしで動く）。
     WebGL が使えない端末・描画に失敗したときは、今までの2Dの絵がそのまま出る。
   ・形は球・円柱・円すい・箱・輪の組み合わせで、すべてこのアプリのオリジナル。トゥーン（アニメ風の段々の陰）＋輪郭線。
   ・育てる画面：指1本で回す、2本指でつまんで拡大・縮小、仲間をタップすると反応（ジャンプ・ハート、翼があれば空を飛ぶ）、
     地面をタップするとそこへ歩いていく。何もしなければ、仲間は自分で歩きまわり、ときどき遊ぶ。
   ・進化：前の姿が光に包まれて回り → 白く光って → 新しい姿が光の粒と一緒に現れる（#pgrevo の s1〜s4 に合わせる）。
   ・画面が閉じたら描画を止めて WebGL を手放す。アプリが裏に回ったときも止める。 */
(function(){
if(typeof pGrPageHtml!=="function"||typeof PGR_KINDS==="undefined")return;

/* ---------------- 数学 ---------------- */
function hx(c){if(Array.isArray(c))return c;c=String(c||"#888888").replace("#","");if(c.length===3)c=c[0]+c[0]+c[1]+c[1]+c[2]+c[2];
  return [parseInt(c.substr(0,2),16)/255,parseInt(c.substr(2,2),16)/255,parseInt(c.substr(4,2),16)/255];}
function mul(a,b){var o=new Float32Array(16);for(var c=0;c<4;c++)for(var r=0;r<4;r++){o[c*4+r]=a[r]*b[c*4]+a[4+r]*b[c*4+1]+a[8+r]*b[c*4+2]+a[12+r]*b[c*4+3];}return o;}
function rot3(r){var cx=Math.cos(r[0]),sx=Math.sin(r[0]),cy=Math.cos(r[1]),sy=Math.sin(r[1]),cz=Math.cos(r[2]),sz=Math.sin(r[2]);
  var a00=cz,a01=-sz*cx,a02=sz*sx,a10=sz,a11=cz*cx,a12=-cz*sx,a21=sx,a22=cx;
  return [cy*a00,cy*a01+sy*a21,cy*a02+sy*a22, a10,a11,a12, -sy*a00,-sy*a01+cy*a21,-sy*a02+cy*a22];}
function trs(p,r,u){var R=rot3(r),m=new Float32Array(16);
  m[0]=R[0]*u;m[1]=R[3]*u;m[2]=R[6]*u;m[4]=R[1]*u;m[5]=R[4]*u;m[6]=R[7]*u;m[8]=R[2]*u;m[9]=R[5]*u;m[10]=R[8]*u;m[12]=p[0];m[13]=p[1];m[14]=p[2];m[15]=1;return m;}
function persp(f,asp,n,fa){var t=1/Math.tan(f/2),m=new Float32Array(16);m[0]=t/asp;m[5]=t;m[10]=(fa+n)/(n-fa);m[11]=-1;m[14]=2*fa*n/(n-fa);return m;}
function sub(a,b){return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];}
function crs(a,b){return [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];}
function nrm(a){var l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l];}
function look(e,t){var z=nrm(sub(e,t)),x=nrm(crs([0,1,0],z)),y=crs(z,x),m=new Float32Array(16);
  m[0]=x[0];m[4]=x[1];m[8]=x[2];m[1]=y[0];m[5]=y[1];m[9]=y[2];m[2]=z[0];m[6]=z[1];m[10]=z[2];
  m[12]=-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]);m[13]=-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]);m[14]=-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]);m[15]=1;return m;}
function clamp(v,a,b){return v<a?a:v>b?b:v;}
function lerp(a,b,t){return a+(b-a)*t;}
function rnd(a,b){return a+Math.random()*(b-a);}

/* ---------------- 形（頂点） ---------------- */
function gSph(){var P=[],I=[],S=20,R=14;for(var r=0;r<=R;r++){var th=r/R*Math.PI;for(var s=0;s<=S;s++){var ph=s/S*Math.PI*2;P.push(Math.sin(th)*Math.cos(ph),Math.cos(th),Math.sin(th)*Math.sin(ph));}}
  for(r=0;r<R;r++)for(s=0;s<S;s++){var a=r*(S+1)+s,b=a+S+1;I.push(a,a+1,b,b,a+1,b+1);}return {p:P,n:P.slice(),i:I};}
/* 管：y=0 で半径1、y=1 で半径 rt。seg が少ないときは角ばった面 */
function gTube(rt,seg){seg=seg||16;var P=[],N=[],I=[],flat=seg<=6,k;
  var dy=1-rt;
  for(var s=0;s<seg;s++){var a0=s/seg*Math.PI*2,a1=(s+1)/seg*Math.PI*2,c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
    var n0=nrm([c0,dy,s0]),n1=nrm([c1,dy,s1]);if(flat){var am=(a0+a1)/2;n0=n1=nrm([Math.cos(am),dy,Math.sin(am)]);}
    k=P.length/3;P.push(c0,0,s0, c1,0,s1, c1*rt,1,s1*rt, c0*rt,1,s0*rt);N.push(n0[0],n0[1],n0[2],n1[0],n1[1],n1[2],n1[0],n1[1],n1[2],n0[0],n0[1],n0[2]);I.push(k,k+2,k+1,k,k+3,k+2);
    k=P.length/3;P.push(0,0,0,c1,0,s1,c0,0,s0);N.push(0,-1,0,0,-1,0,0,-1,0);I.push(k,k+1,k+2);
    if(rt>0){k=P.length/3;P.push(0,1,0,c0*rt,1,s0*rt,c1*rt,1,s1*rt);N.push(0,1,0,0,1,0,0,1,0);I.push(k,k+1,k+2);}}
  return {p:P,n:N,i:I};}
function gTor(t){var P=[],N=[],I=[],U=28,V=10;for(var u=0;u<=U;u++){var a=u/U*Math.PI*2;for(var v=0;v<=V;v++){var b=v/V*Math.PI*2,cb=Math.cos(b);
  P.push((1+t*cb)*Math.cos(a),t*Math.sin(b),(1+t*cb)*Math.sin(a));N.push(cb*Math.cos(a),Math.sin(b),cb*Math.sin(a));}}
  for(u=0;u<U;u++)for(v=0;v<V;v++){var p=u*(V+1)+v,q=p+V+1;I.push(p,p+1,q,p+1,q+1,q);}return {p:P,n:N,i:I};}
function gBox(){var P=[],N=[],I=[],F=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
  F.forEach(function(n){var u=n[1]?[1,0,0]:[0,1,0],w=crs(n,u),k=P.length/3;
    [[-1,-1],[1,-1],[1,1],[-1,1]].forEach(function(c){P.push(n[0]+u[0]*c[0]+w[0]*c[1],n[1]+u[1]*c[0]+w[1]*c[1],n[2]+u[2]*c[0]+w[2]*c[1]);N.push(n[0],n[1],n[2]);});
    I.push(k,k+1,k+2,k,k+2,k+3);});return {p:P,n:N,i:I};}
/* 平らな太陽（光 n 本。xy 平面、+z 向き）と平らな輪 */
function gSun(n){var P=[],N=[],I=[],k,r0=.56,seg=60;P.push(0,0,0);N.push(0,0,1);for(k=0;k<=seg;k++){var a=k/seg*Math.PI*2;P.push(Math.cos(a)*r0,Math.sin(a)*r0,0);N.push(0,0,1);if(k)I.push(0,k,k+1);}
  for(k=0;k<n;k++){var c=k/n*Math.PI*2,h=Math.PI/n*.55,b=P.length/3;P.push(Math.cos(c-h)*r0*.97,Math.sin(c-h)*r0*.97,0,Math.cos(c)*1,Math.sin(c)*1,0,Math.cos(c+h)*r0*.97,Math.sin(c+h)*r0*.97,0);N.push(0,0,1,0,0,1,0,0,1);I.push(b,b+1,b+2);}
  return {p:P,n:N,i:I};}
function gRing(t){var P=[],N=[],I=[],seg=48;for(var k=0;k<=seg;k++){var a=k/seg*Math.PI*2;P.push(Math.cos(a),Math.sin(a),0,Math.cos(a)*t,Math.sin(a)*t,0);N.push(0,0,1,0,0,1);if(k){var b=k*2;I.push(b-2,b,b-1,b-1,b,b+1);}}return {p:P,n:N,i:I};}
function geoData(key){var s=key.split(":");
  if(s[0]==="sph")return gSph();if(s[0]==="box")return gBox();if(s[0]==="tor")return gTor(+s[1]||.25);
  if(s[0]==="tube")return gTube(+s[1],s[2]?+s[2]:16);
  if(s[0]==="sun")return gSun(+s[1]||40);if(s[0]==="ring")return gRing(+s[1]||.7);if(s[0]==="tri")return gTube(0,3);return gSph();}

/* ---------------- 部品（ノード） ----------------
   p 位置 / r 回転 [x,y,z] / s その部品だけの大きさ（子には効かない）/ u 子にも効く大きさ / g 形 / c 色 / em 光る強さ / ol 輪郭線 */
function N(g,c,p,s,r,o){var n={g:g||null,c:c?hx(c):null,p:p||[0,0,0],r:r||[0,0,0],s:s||[1,1,1],u:1,k:[],em:0,ol:g?1:0,al:1};
  if(o)for(var x in o)n[x]=o[x];return n;}
function A(par,ch){par.k.push(ch);return ch;}
function S(par,g,c,p,s,r,o){return A(par,N(g,c,p,s,r,o));}

/* ---------------- WebGL ---------------- */
var VS="attribute vec3 aP;attribute vec3 aN;uniform mat4 uVP;uniform mat4 uM;uniform mat3 uNm;uniform float uOut;varying vec3 vN;varying vec3 vW;"+
  "void main(){vec3 n=normalize(uNm*aN);vec4 w=uM*vec4(aP,1.);w.xyz+=n*uOut;vW=w.xyz;vN=n;gl_Position=uVP*w;}";
var FS="precision mediump float;uniform vec3 uC;uniform vec3 uL;uniform vec3 uE;uniform vec3 uSky;uniform vec3 uGnd;uniform vec3 uFog;uniform vec3 uGlow;"+
  "uniform float uOf;uniform float uEm;uniform float uA;uniform float uFd;uniform float uFn;uniform float uFf;varying vec3 vN;varying vec3 vW;"+
  "void main(){if(uOf>.5){gl_FragColor=vec4(uC*uA,uA);return;}vec3 n=normalize(vN);vec3 v=normalize(uE-vW);if(dot(n,v)<0.)n=-n;float d=dot(n,uL);"+
  "float b=smoothstep(.0,.06,d)*.3+smoothstep(.42,.5,d)*.14;vec3 amb=mix(uGnd,uSky,n.y*.5+.5);vec3 c=uC*amb*(.62+b);"+
  "float rim=pow(1.-max(dot(n,v),0.),3.);c+=uSky*rim*.22*step(-.25,d);"+
  "float sp=smoothstep(.93,.96,dot(reflect(-uL,n),v));c+=vec3(.12)*sp;"+
  "c=mix(c,uGlow,uEm);float f=clamp((length(uE-vW)-uFn)/(uFf-uFn),0.,1.)*uFd;c=mix(c,uFog,f);gl_FragColor=vec4(c*uA,uA);}";
var PVS="attribute vec3 aP;attribute vec4 aC;attribute float aS;uniform mat4 uVP;uniform float uPx;varying vec4 vC;"+
  "void main(){vec4 p=uVP*vec4(aP,1.);gl_Position=p;gl_PointSize=clamp(aS*uPx/max(p.w,.1),1.,96.);vC=aC;}";
var PFS="precision mediump float;varying vec4 vC;void main(){vec2 q=gl_PointCoord-.5;float r=length(q);"+
  "float a=smoothstep(.5,.05,r)*.75+max(0.,1.-abs(q.x)*9.)*max(0.,1.-abs(q.y)*2.2)*.5+max(0.,1.-abs(q.y)*9.)*max(0.,1.-abs(q.x)*2.2)*.5;"+
  "a*=vC.a;if(a<.01)discard;gl_FragColor=vec4(vC.rgb*a,a);}";
/* 牧場の動かない物（地面・山・ユルタ・旗・木…）は、まとめて1つの形にして1回で描く（スマホで軽くするため） */
var VSB="attribute vec3 aP;attribute vec3 aN;attribute vec4 aC;uniform mat4 uVP;varying vec3 vN;varying vec3 vW;varying vec4 vCol;void main(){vN=aN;vW=aP;vCol=aC;gl_Position=uVP*vec4(aP,1.);}";
var FSB=FS.replace("uniform vec3 uC;","varying vec4 vCol;").replace("if(uOf>.5){gl_FragColor=vec4(uC*uA,uA);return;}","").replace("vec3 c=uC*amb","vec3 c=vCol.rgb*amb").replace("mix(c,uGlow,uEm)","mix(c,uGlow,vCol.a)").replace("gl_FragColor=vec4(c*uA,uA);","gl_FragColor=vec4(c,1.);");
function prog(gl,v,f){function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o;}
  var p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,v));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,f));gl.linkProgram(p);
  if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error("link");var U={},A2={};
  for(var i=0,n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);i<n;i++){var u=gl.getActiveUniform(p,i);U[u.name]=gl.getUniformLocation(p,u.name);}
  for(i=0,n=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);i<n;i++){var a=gl.getActiveAttrib(p,i);A2[a.name]=gl.getAttribLocation(p,a.name);}
  return {p:p,u:U,a:A2};}
var G3_OK=null;
function g3Ok(){if(G3_OK!==null)return G3_OK;try{var c=document.createElement("canvas"),gl=c.getContext("webgl",{failIfMajorPerformanceCaveat:true})||c.getContext("experimental-webgl");
  G3_OK=!!gl;var ex=gl&&gl.getExtension("WEBGL_lose_context");if(ex)ex.loseContext();}catch(_){G3_OK=false;}return G3_OK;}

/* ---------------- 飾り ---------------- */
var GOLD="#F2C230",DARK="#2B2233";
function eyes(H,hr,o,fx,fy,fz,R){/* 目：瞳（色）＋黒目＋白い光。closed なら細い線。R があれば まばたき用に覚える */
  var J=1-(o.a||0),es=o.es||1;
  [-1,1].forEach(function(sd){
    if(o.closed){S(H,"tor:.25",DARK,[hr*fx,hr*fy+hr*.04,sd*hr*fz],[hr*.12*es,hr*.1,hr*.12*es],[0,sd*.5,Math.PI/2],{ol:0});if(J>.4)S(H,"sph","#F6A8A8",[hr*(fx-.1),hr*(fy-.28),sd*hr*(fz+.12)],[hr*.05,hr*.06,hr*.1],[0,sd*.6,0],{ol:0,al:.85});return;}
    var ey=hr*.17*(1+.25*J)*es,ex=hr*.1*es,ez=hr*.13*(1+.15*J)*es,list=[];
    var nl=Math.hypot(fx,fy,fz)||1,nx=fx/nl,nz=fz/nl;
    if(o.eyec){list.push(S(H,"sph",o.eyec,[hr*fx,hr*fy,sd*hr*fz],[ex,ey,ez],[0,sd*.5,0],{ol:0}));
      list.push(S(H,"sph","#14101A",[hr*fx+nx*ex*.5,hr*fy,sd*(hr*fz+nz*ex*.5)],[ex*.62,ey*(o.slit?.88:.66),ez*(o.slit?.26:.62)],[0,sd*.5,0],{ol:0}));}
    else list.push(S(H,"sph","#1E1A24",[hr*fx,hr*fy,sd*hr*fz],[ex,ey,ez],[0,sd*.5,0],{ol:0}));
    list.push(S(H,"sph","#FFFFFF",[hr*fx+nx*ex*.8,hr*fy+ey*.38,sd*(hr*fz+nz*ex*.8)-sd*ez*.25],[hr*.045*es,hr*.055*es,hr*.045*es],[0,0,0],{ol:0,em:.5}));
    list.push(S(H,"sph","#FFFFFF",[hr*fx+nx*ex*.85,hr*fy-ey*.38,sd*(hr*fz+nz*ex*.85)-sd*ez*.1],[hr*.022*es,hr*.026*es,hr*.022*es],[0,0,0],{ol:0,em:.5}));
    if(o.lid){/* 眠そうなまぶた */S(H,"sph",o.lidc||"#E8B48A",[hr*(fx-.01),hr*(fy+.09),sd*hr*fz],[ex*1.15,ey*.62,ez*1.15],[0,sd*.5,0],{ol:0});}
    if(R)list.forEach(function(n){R.eyes.push({n:n,y:n.s[1]});});
    if(o.brow)S(H,"box",o.browc||"#3A2A1A",[hr*(fx-.02),hr*(fy+.2*es),sd*hr*fz],[hr*.12,hr*.03,hr*.1],[sd*.3,0,-.25],{ol:0});
    if(!o.brow&&!o.nob2&&J>.35)S(H,"sph","#F6A8A8",[hr*(fx-.08),hr*(fy-.3),sd*hr*(fz+.12)],[hr*.05,hr*.06,hr*.1],[0,sd*.6,0],{ol:0,al:.7});
  });}
function kalpak(H,hr,y){S(H,"tube:.3","#F4F1EA",[-hr*.04,y,0],[hr*.66,hr*1.0,hr*.66],[0,0,.12]);
  S(H,"tube:1.12",DARK,[-hr*.04,y-hr*.04,0],[hr*.7,hr*.2,hr*.7],[0,0,.12]);
  S(H,"sph",DARK,[-hr*.1,y+hr*1.0,0],[hr*.07,hr*.07,hr*.07],[0,0,0],{ol:0});}
function crown(H,hr,y,col){col=col||GOLD;S(H,"tube:1.08",col,[-hr*.05,y,0],[hr*.46,hr*.24,hr*.46],[0,0,.08],{em:.08});
  for(var k=0;k<6;k++){var a=k/6*Math.PI*2;S(H,"tube:0",col,[-hr*.05+Math.cos(a)*hr*.45,y+hr*.22,Math.sin(a)*hr*.45],[hr*.09,hr*.22,hr*.09],[0,0,0],{em:.1});}
  S(H,"sph","#E2483B",[hr*.38,y+hr*.12,0],[hr*.06,hr*.08,hr*.08],[0,0,0],{em:.3,ol:0});}
function tumar(par,x,y,z,s,col){S(par,"tri",col||GOLD,[x,y,z],[s*.8,s*1.3,s*.35],[0,0,Math.PI],{em:.1});
  S(par,"sph","#B3202B",[x+s*.15,y-s*.45,z],[s*.18,s*.18,s*.18],[0,0,0],{ol:0,em:.2});}
function sparkMark(H,x,y,z,s,col){S(H,"sph",col||"#FFE27A",[x,y,z],[s*.5,s,s],[0,0,0],{em:.7,ol:0});}

/* 翼：羽根を扇のように重ねる（bone があれば竜の皮の翼） */
function wing(wn,sd,w,wc,bone,tip){
  function dir(ph,l){return [sd*Math.sin(-sd*ph)*l,0,sd*Math.cos(-sd*ph)*l];}
  if(bone){[[.1,1.0],[.6,.88],[1.1,.7]].forEach(function(q){S(wn,"tube:.3",bone,[0,0,0],[.04*w,w*q[1],.04*w],[sd*Math.PI/2,-sd*q[0],0]);});
    [[.3,1.0],[.85,.85],[1.3,.62]].forEach(function(q){var c=dir(q[0],w*q[1]*.47);S(wn,"sph",wc,c,[w*.36,.012,w*q[1]*.5],[0,-sd*q[0],0]);});
    S(wn,"sph",bone,[0,0,0],[w*.09,w*.09,w*.1]);return;}
  S(wn,"sph",wc,[-w*.02,0,sd*w*.2],[w*.2,.05,w*.28]);
  for(var f=0;f<5;f++){var ph=.05+f*.28,ln=w*(.7-f*.07),c=dir(ph,ln*.5);c[2]+=sd*w*.12;
    S(wn,"sph",f>=2&&tip?tip:wc,c,[w*.1,.022,ln*.5],[0,-sd*ph,0]);}}
/* ---------------- 四つ足 ----------------
   2026-11-28 作り直し：胸・腰・胴の3つの丸で体をつくり、首（向きを変えられる）・頭蓋と鼻づら・ひざのある足にした。
   子どものうちは頭が大きく足と鼻が短い（かわいい）。育つと、その動物らしい体つき（犬の鼻づら、馬の長い首と足、
   ヤクのこぶと長い毛、ユキヒョウの太く長いしっぽ…）になる。
   o の主な値：bh 胴の太さ / hip 腰の大きさ / len 胴の長さ / leg 足の長さ / legT 足の太さ / head 頭 / muz 鼻づらの長さ /
     mw 鼻づらの太さ / mt 鼻づらの下向き / na 首の角度 / neck 首の長さ / ear 耳 / tail しっぽ / hoof ひづめ / rab うさぎの座り姿 */
function bQuad(o){
  var a=o.a||0,J=1-a,R={t:"quad",legs:[],tail:[],wings:[],ears:[],eyes:[],o:o},root=N();
  var cr=.19*(o.bh||1)*(1+.12*J),pr=cr*(o.hip||.92),L=(.07+.12*a)*(o.len||1),hr=(.16+.08*J)*(o.head||1);if(o.es==null)o.es=1.15;
  var lgl=(.1+.15*a)*(o.leg||1),by=lgl+cr*.8,cy=(o.chY||0)*cr,py=(o.hipY||0)*cr,col=o.col,bel=o.bel||col;
  var B=S(root,null,null,[0,by,0]);R.body=B;R.by=by;R.bR=cr;R.L=L+cr*.3;R.cr=cr;
  /* 胴 */
  S(B,"sph",col,[L,cy,0],[cr*1.02,cr,cr*.9]);
  S(B,"sph",col,[-L,py,0],[pr*1.02,pr,pr*.92]);
  S(B,"sph",col,[0,(cy+py)/2-cr*.05,0],[L+cr*.25,(cr+pr)/2*.92,(cr+pr)/2*.84]);
  S(B,"sph",bel,[L*.4,(cy+py)/2-cr*.45,0],[L*.85+cr*.3,cr*.46,cr*.6],[0,0,0],{ol:0});
  if(o.patch)[[L*.2,cr*.55,cr*.4,1],[-L*.7,pr*.3,-pr*.6,.8],[L*.9,cy+cr*.2,-cr*.55,.7]].forEach(function(q){S(B,"sph",o.patch,[q[0],q[1],q[2]],[cr*.42*q[3],cr*.36*q[3],cr*.36*q[3]],[0,0,0],{ol:0});});
  if(o.hump)S(B,"sph",o.fcol||col,[L*.8,cy+cr*.62,0],[cr*.8,cr*.6,cr*.62]);
  if(o.ruff)for(var rf=0;rf<9;rf++){var ra=rf/9*Math.PI*2;S(B,"sph",o.rcol||col,[L+cr*.55,cy+cr*.25+Math.sin(ra)*cr*.45,Math.cos(ra)*cr*.6],[cr*.28,cr*.3,cr*.24],[0,0,0]);}
  if(o.fluff){for(var f=0;f<14;f++){var ft=f/13,fx=lerp(L+cr*.5,-L-pr*.6,ft);[-1,1].forEach(function(sd){S(B,"sph",o.fcol||col,[fx,-cr*.52,sd*cr*.7],[cr*.24,cr*.5,cr*.2],[sd*.12,0,0]);});}
    S(B,"sph",o.fcol||col,[L+cr*.55,cy-cr*.2,0],[cr*.4,cr*.7,cr*.62]);}
  if(o.stripe)for(var sk=0;sk<4;sk++){var sx=lerp(L*.9,-L*1.0,sk/3);S(B,"sph",o.stripe,[sx,(cy+py)/2+cr*.55,0],[cr*.09,cr*.42,cr*.62],[0,0,.2],{ol:0});}
  /* 首（動かせる）と頭 */
  var na=o.na!=null?o.na:.8,nl=(o.neck==null?.5:o.neck)*(.12+.16*a)+cr*.15,nb=[L+cr*.5,cy+cr*.42,0];
  var NK=S(B,null,null,nb);R.neck=NK;
  var hp=[Math.cos(na)*nl,Math.sin(na)*nl,0],nw=o.nw||1;
  S(NK,"sph",col,[hp[0]*.5,hp[1]*.5,0],[nl*.5+cr*.36,cr*.5*nw,cr*.46*nw],[0,0,na]);
  if(o.ruff)S(NK,"sph",o.rcol||col,[hp[0]*.3,hp[1]*.3-cr*.1,0],[cr*.62,cr*.62,cr*.66]);
  var H=S(NK,null,null,hp);R.head=H;R.hr=hr;
  var mz=o.muz==null?.8:o.muz,ml=hr*mz*(.45+.55*a),mw=o.mw||1,mt=o.mt||0;
  S(H,"sph",col,[0,0,0],[hr,hr*.92,hr*.9]);
  if(o.cheek)S(H,"sph",col,[hr*.12,-hr*.32,0],[hr*.72,hr*.52,hr*.98]);
  if(o.jaw)S(H,"sph",col,[-hr*.1,-hr*.45,0],[hr*.75,hr*.62,hr*.72],[0,0,-.4]);
  if(o.stripe)[-1,0,1].forEach(function(q){S(H,"sph",o.stripe,[hr*.45,hr*.62,q*hr*.2],[hr*.22,hr*.06,hr*.06],[0,q*.3,-.9],{ol:0});});
  var M=S(H,null,null,[hr*.5,hr*(o.my==null?-.24:o.my),0],[1,1,1],[0,0,-mt]);R.muz=M;
  S(M,"sph",o.snc||col,[ml*.5,0,0],[ml*.55+hr*.26,hr*.37*mw,hr*.43*mw]);
  S(M,"sph",o.snc2||bel,[ml*.42,-hr*.17*mw,0],[ml*.5+hr*.18,hr*.2*mw,hr*.33*mw],[0,0,0],{ol:0});
  var nx=ml+hr*.24;
  S(M,"sph",o.nose||DARK,[nx,hr*.1*mw,0],[hr*.09,hr*.075,hr*(o.ear==="horse"?.2:.12)*mw],[0,0,0],{ol:0});
  if(o.ear==="horse"||o.ear==="drag"||o.ear==="yak")[-1,1].forEach(function(sd){S(M,"sph","#2B2233",[nx-hr*.02,hr*.02,sd*hr*.2*mw],[hr*.05,hr*.06,hr*.04],[0,0,0],{ol:0});});
  if(o.omega)[-1,1].forEach(function(sd){S(M,"tor:.3",DARK,[nx-hr*.04,-hr*.06,sd*hr*.06],[hr*.055,hr*.055,hr*.055],[Math.PI/2,0,0],{ol:0});});
  if(o.whisk)[-1,1].forEach(function(sd){for(var w2=0;w2<3;w2++)S(M,"box",o.wkc||"#FFFFFF",[nx*.6,-hr*.02+w2*hr*.045,sd*hr*.42*mw],[hr*.28,.0016,.0016],[0,sd*(.3-w2*.12),.1-w2*.12],{ol:0,al:.75});});
  if(o.blaze)S(H,"sph",o.blaze,[hr*.65,hr*.15,0],[hr*.4,hr*.5,hr*.12],[0,0,-.6],{ol:0});
  var ef=o.ef||[.5,.22,.55],ek=.97/Math.sqrt(ef[0]*ef[0]+Math.pow(ef[1]/.92,2)+Math.pow(ef[2]/.9,2));
  eyes(H,hr,o,ef[0]*ek,ef[1]*ek,ef[2]*ek,R);
  if(o.mark)sparkMark(H,hr*.55,hr*.68,0,hr*.1,o.mark);
  /* 耳・角 */
  [-1,1].forEach(function(sd){var e,e2;
    if(o.ear==="cat"){e=S(H,null,null,[-hr*.08,hr*.7,sd*hr*.46],[1,1,1],[sd*.32,0,.05]);S(e,"tube:0:4",col,[0,0,0],[hr*.3,hr*.5,hr*.2],[0,Math.PI/4,0]);S(e,"tube:0:4",o.ein||"#F4B6B6",[hr*.07,hr*.03,0],[hr*.17,hr*.36,hr*.1],[0,Math.PI/4,0],{ol:0});R.ears.push(e);}
    else if(o.ear==="round"){e=S(H,null,null,[-hr*.12,hr*.74,sd*hr*.52],[1,1,1],[sd*.5,0,0]);S(e,"sph",col,[0,0,0],[hr*.12,hr*.2,hr*.2]);S(e,"sph",o.spotc||DARK,[-hr*.03,0,0],[hr*.08,hr*.14,hr*.14],[0,0,0],{ol:0});R.ears.push(e);}
    else if(o.ear==="dogf"||o.ear==="dogt"){var lg=o.ear==="dogt"?1.4:1;e=S(H,null,null,[-hr*.1,hr*.55,sd*hr*.66],[1,1,1],[sd*.32,0,.1]);
      S(e,"sph",o.ecol||col,[0,-hr*.3*lg,sd*hr*.08],[hr*.22,hr*.44*lg,hr*.09]);if(o.ear==="dogt")S(e,"sph",o.ecol||col,[-hr*.02,-hr*.68*lg,sd*hr*.1],[hr*.18,hr*.16,hr*.1]);R.ears.push(e);}
    else if(o.ear==="dogu"){e=S(H,null,null,[-hr*.1,hr*.66,sd*hr*.48],[1,1,1],[sd*.28,0,.15]);S(e,"tube:0:4",o.ecol||col,[0,0,0],[hr*.24,hr*.46,hr*.14],[0,Math.PI/4,0]);S(e,"tube:0:4",o.ein||"#E8C0B0",[hr*.05,hr*.03,0],[hr*.12,hr*.3,hr*.08],[0,Math.PI/4,0],{ol:0});R.ears.push(e);}
    else if(o.ear==="rab"){var el=.8+.4*a;e=S(H,null,null,[-hr*.2,hr*.72,sd*hr*.3],[1,1,1],[sd*.14,0,.22]);S(e,"sph",col,[0,hr*.7*el,0],[hr*.19,hr*.72*el,hr*.1]);S(e,"sph",o.ein||"#F4B6B6",[hr*.06,hr*.7*el,0],[hr*.1,hr*.56*el,hr*.05],[0,0,0],{ol:0});
      if(o.etip)S(e,"sph",o.etip,[0,hr*1.3*el,0],[hr*.17,hr*.16*el,hr*.1],[0,0,0],{ol:0});R.ears.push(e);}
    else if(o.ear==="horse"){e=S(H,null,null,[-hr*.2,hr*.74,sd*hr*.36],[1,1,1],[sd*.22,0,-.1]);S(e,"tube:0:6",col,[0,0,0],[hr*.15,hr*.46,hr*.11]);S(e,"tube:0:6","#3A2E30",[hr*.03,hr*.02,0],[hr*.08,hr*.3,hr*.05],[0,0,0],{ol:0});R.ears.push(e);}
    else if(o.ear==="yak"){e=S(H,null,null,[-hr*.05,hr*.18,sd*hr*.9],[1,1,1],[sd*.2,0,0]);S(e,"sph",col,[0,0,sd*hr*.1],[hr*.14,hr*.09,hr*.24]);R.ears.push(e);
      var hs=(o.horn||1)*(.2+.8*a);if(hs>.1){var h0=S(H,null,null,[-hr*.05,hr*.6,sd*hr*.6],[1,1,1],[sd*1.25,0,.1]);S(h0,"tube:.62",o.hcol||"#E8DCC0",[0,0,0],[hr*.14,hr*.55*hs,hr*.14]);
        e2=S(h0,null,null,[0,hr*.55*hs,0],[1,1,1],[-sd*1.45,0,.3]);S(e2,"tube:0",o.hcol||"#E8DCC0",[0,0,0],[hr*.087,hr*.5*hs,hr*.087]);}}
    else if(o.ear==="drag"){S(H,"tube:0",o.wcol||col,[-hr*.15,hr*.3,sd*hr*.82],[hr*.12,hr*.32,hr*.06],[-sd*1.1,0,.6]);
      var hz=(o.horn||.5);e=S(H,null,null,[-hr*.3,hr*.6,sd*hr*.36],[1,1,1],[sd*.3,0,1.15]);S(e,"tube:0",o.hcol||"#F1E6C8",[0,0,0],[hr*.11,hr*.7*hz,hr*.11]);}
  });
  if(o.mane){var mn=8;for(var m=0;m<mn;m++){var t=m/(mn-1),mxp=lerp(hp[0]-hr*.2,-cr*.15,t),myp=lerp(hp[1]+hr*.55,cr*.25,t);
      S(NK,"sph",o.mane,[mxp-Math.sin(na)*cr*.3,myp+Math.cos(na)*cr*.3,cr*.08],[nl*.1+.02,cr*(.22+.08*a),cr*.1],[0,0,na-.2]);}
    S(H,"sph",o.mane,[hr*.2,hr*.8,0],[hr*.3,hr*.16,hr*.18],[0,0,-.6]);}
  /* 足（ひざつき） */
  var lr=cr*.22*(o.legT||1)*(1+.18*J);
  [[1,1],[1,-1],[-1,1],[-1,-1]].forEach(function(q,qi){var fr=q[0]>0,jx=fr?L+cr*.18:-L-pr*.12,jy=(fr?cy:py)-cr*.32,jz=q[1]*(fr?cr:pr)*.5,len=by+jy;
    var lp=S(B,null,null,[jx,jy,jz]),u=len*.5,kn;
    if(o.rab&&!fr){/* うさぎの後ろ足：大きなもも＋長い足 */
      S(lp,"sph",col,[-pr*.05,-len*.35,q[1]*pr*.12],[pr*.66,pr*.62,pr*.4]);S(lp,"sph",o.paw||bel,[pr*.32,-len+lr*.5,q[1]*pr*.1],[pr*.58,lr*.62,lr*1.15]);
      R.legs.push({n:lp,k:null,ph:qi===3?0:Math.PI,fr:0});return;}
    if(fr)S(lp,"sph",col,[0,cr*.06,0],[cr*.38,cr*.52,cr*.34]);else S(lp,"sph",col,[-pr*.04,pr*.1,0],[pr*.6,pr*.72,pr*.4]);
    S(lp,"tube:.85",col,[0,0,0],[lr*1.12,u+lr*.2,lr*1.12],[0,0,Math.PI]);
    kn=S(lp,null,null,[0,-u,0]);S(kn,"sph",col,[0,0,0],[lr*.92,lr*.92,lr*.92]);
    S(kn,"tube:.9",o.sock||col,[0,0,0],[lr*.9,u,lr*.9],[0,0,Math.PI]);
    if(o.hoof)S(kn,"tube:.92",o.hoofc||"#4A3A32",[0,-u,0],[lr*.98,lr*.75,lr*.98]);
    else{S(kn,"sph",o.paw||o.sock||col,[lr*.35,-u+lr*.42,0],[lr*1.3,lr*.62,lr*1.05]);
      if(o.claws)for(var cl2=-1;cl2<=1;cl2++)S(kn,"tube:0","#F1E6C8",[lr*1.45,-u+lr*.3,cl2*lr*.45],[lr*.16,lr*.4,lr*.16],[0,0,-1.6],{ol:0});}
    if(o.spots)S(lp,"sph",o.spotc,[lr*.95,-u*.5,0],[lr*.3,lr*.3,lr*.3],[0,0,0],{ol:0});
    if(o.fluff)S(kn,"sph",o.fcol||col,[0,-u*.55,0],[lr*1.35,u*.4,lr*1.35]);
    R.legs.push({n:lp,k:kn,ph:(qi===0||qi===3)?0:Math.PI,fr:fr?1:0});});
  /* しっぽ */
  var T=S(B,null,null,[-L-pr*.88,py+pr*.28,0]);R.tailRoot=T;
  var chain=function(n,len,rad,col2,r0,dr,tip,tipS,shrink){var p=T,rr=rad;for(var c=0;c<n;c++){var nd=S(p,null,null,c?[0,len,0]:[0,0,0],[1,1,1],[0,0,c?dr:r0]);S(nd,"sph",col2,[0,len*.5,0],[rr,len*.72+rr*.3,rr]);R.tail.push(nd);rr*=(shrink||.84);p=nd;}
    if(tip)S(p,"sph",tip,[0,len,0],[rr*(tipS||1.4),rr*(tipS||1.4)*1.2,rr*(tipS||1.4)]);return p;};
  var ts=.35+.65*a;
  if(o.tail==="cat")chain(5,(.045+.04*a),pr*.13,col,.75,-.22,o.ttip||col,1.15,.95);
  else if(o.tail==="leo")chain(6,(.05+.055*a),pr*.34,col,2.1,-.32,o.spotc,1.25,.97);
  else if(o.tail==="dog")chain(4,(.035+.035*a),pr*.15,col,.85,-.32,o.ttip||bel,1.3,.92);
  else if(o.tail==="ring")chain(6,(.03+.03*a),pr*.12,col,.6,-.75,o.ttip||col,1.2,.9);
  else if(o.tail==="bush")chain(3,(.05+.04*a),pr*.28,o.rcol||col,1.0,-.45,o.ttip||bel,1.25,.95);
  else if(o.tail==="pom")S(T,"sph",o.ttip||"#FFFFFF",[pr*.05,0,0],[pr*.3,pr*.3,pr*.3]);
  else if(o.tail==="horse"){var hn=S(T,null,null,[0,0,0],[1,1,1],[0,0,2.2]);S(hn,"tube:.7",col,[0,0,0],[pr*.14,.06,pr*.14]);R.tail.push(hn);
    var hp2=hn,hw=pr*.17;for(var hc=0;hc<3;hc++){var h2=S(hp2,null,null,[0,hc?.13*ts:.05,0],[1,1,1],[0,0,hc?.12:.25]);S(h2,"tube:1.12",o.mane||col,[0,0,0],[hw,.14*ts,hw*.75]);R.tail.push(h2);hw*=1.12;hp2=h2;}
    S(hp2,"sph",o.mane||col,[0,.14*ts,0],[hw*1.05,hw*.7,hw*.8]);}
  else if(o.tail==="yak"){var yn=S(T,null,null,[0,0,0],[1,1,1],[0,0,2.5]);S(yn,"tube:.7",col,[0,0,0],[pr*.11,.18*ts,pr*.11]);R.tail.push(yn);var y2=S(yn,null,null,[0,.17*ts,0]);S(y2,"sph",o.fcol||col,[0,.1*ts,0],[pr*.26,.16*ts,pr*.22]);R.tail.push(y2);}
  else if(o.tail==="drag"){var dp=T,dl=.06+.07*a,dr0=pr*.36;for(var c2=0;c2<6;c2++){var dn=S(dp,null,null,c2?[0,dl,0]:[0,0,0],[1,1,1],[0,0,c2?-.14:1.95]);S(dn,"tube:.75",col,[0,0,0],[dr0,dl*1.05,dr0]);S(dn,"sph",col,[0,dl,0],[dr0*.76,dr0*.76,dr0*.76]);
      if(o.spike&&c2<5)S(dn,"tube:0",o.spcol||"#F1E6C8",[-dr0*.7,dl*.5,0],[dr0*.38,dr0*1.0,dr0*.22],[0,0,1.2]);R.tail.push(dn);dr0*=.76;dp=dn;}
    S(dp,"tri",o.spcol||col,[0,dl,0],[dr0*3,dr0*4,dr0*.9]);}
  /* 翼 */
  if(o.wing>0){var w=o.wing*(.36+.24*a),wc=o.wcol||"#FFFFFF";[-1,1].forEach(function(sd){
    var wn=S(B,null,null,[L*.55,cy+cr*.78,sd*cr*.42]);
    wing(wn,sd,w,wc,o.ear==="drag"?(o.bone||o.col):null,o.wtip);
    R.wings.push({n:wn,sd:sd});});}
  /* 模様（ユキヒョウの輪の模様） */
  if(o.spots){var Ax=L+cr*.25,Ay=(cr+pr)/2*.92,Az=(cr+pr)/2*.84,cyy=(cy+py)/2-cr*.05;
    for(var k=0;k<22;k++){var u2=-.85+1.7*((k*.618)%1),th=-.2+((k*.37)%1)*2.4,sd2=k%2?1:-1,rq=Math.sqrt(1-u2*u2),pz=sd2*Az*rq*Math.cos(th),py2=Ay*rq*Math.sin(th);
      var nn=nrm([u2/Ax,Math.sin(th)/Ay,sd2*Math.cos(th)/Az]),rs=cr*(.09+.05*((k*.29)%1));
      var cp=[u2*Ax,cyy+py2,pz];
      if(o.rosette){var t1=nrm(crs(nn,[0,1,0.001])),t2=crs(nn,t1);for(var dq=0;dq<4;dq++){var da=dq/4*Math.PI*2+k;S(B,"sph",o.spotc,[cp[0]+(t1[0]*Math.cos(da)+t2[0]*Math.sin(da))*rs,cp[1]+(t1[1]*Math.cos(da)+t2[1]*Math.sin(da))*rs,cp[2]+(t1[2]*Math.cos(da)+t2[2]*Math.sin(da))*rs],[rs*.42,rs*.42,rs*.42],[0,0,0],{ol:0});}}
      else S(B,"sph",o.spotc,cp,[rs*.8,rs*.8,rs*.8],[0,0,0],{ol:0});}
    [[.3,.62,.35],[.05,.72,-.32],[-.25,.6,.5],[-.3,.62,-.5]].forEach(function(q){S(H,"sph",o.spotc,[hr*q[0],hr*q[1],hr*q[2]],[hr*.08,hr*.08,hr*.08],[0,0,0],{ol:0});});}
  if(o.spike){for(var q2=0;q2<6;q2++){var sx2=lerp(L+cr*.4,-L-pr*.6,q2/5),sy=q2<3?cy:py;S(B,"tube:0",o.spcol||"#F1E6C8",[sx2,sy+cr*.95,0],[.03*(1+a),.07*(1+a),.02],[0,0,.15]);}
    for(var q3=0;q3<3;q3++)S(NK,"tube:0",o.spcol||"#F1E6C8",[hp[0]*(.25+q3*.25)-cr*.3*Math.sin(na),hp[1]*(.25+q3*.25)+cr*.42*Math.cos(na),0],[.025*(1+a),.055*(1+a),.018],[0,0,na-1.2]);}
  if(o.stars){for(var st=0;st<7;st++){var sxx=-.6+1.2*((st*.43)%1),ang=.3+st*.4;S(B,"sph","#FFE27A",[sxx*(L+cr*.25),(cy+py)/2+cr*.9*Math.sin(ang)*Math.sqrt(1-sxx*sxx),(st%2?1:-1)*cr*.8*Math.cos(ang)*Math.sqrt(1-sxx*sxx)],[.018,.018,.018],[0,0,0],{ol:0,em:.9});}}
  /* かざり */
  var A0=o.acc||{},nr=cr*.5*nw,np=[nb[0]+hp[0]*.32,nb[1]+hp[1]*.32,0],nrot=[0,0,na-Math.PI/2],down=[Math.sin(na),-Math.cos(na)],Lc=L+cr*.45,ty=(cy+py)/2;
  if(A0.scarf){S(B,"tor:.32",A0.scarf,np,[nr*1.08,nr*1.2,nr*1.08],nrot);S(B,"box",A0.scarf,[np[0]+down[0]*nr*1.1,np[1]+down[1]*nr*1.1,nr*.55],[.025,.07,.025],[0,0,-.3]);}
  if(A0.ribbon){S(B,"tor:.2",A0.ribbon,np,[nr*1.05,nr*1.1,nr*1.05],nrot);[-1,1].forEach(function(sd){S(B,"sph",A0.ribbon,[np[0]+down[0]*nr*1.05,np[1]+down[1]*nr*1.05,sd*nr*.3],[.03,.045,.05]);});}
  if(A0.bell){S(B,"sph",GOLD,[np[0]+down[0]*nr*1.25,np[1]+down[1]*nr*1.25,0],[nr*.26,nr*.26,nr*.26],[0,0,0],{em:.1});}
  if(A0.tumar)tumar(B,np[0]+down[0]*nr*1.2,np[1]+down[1]*nr*1.2,0,cr*.11,A0.tumar);
  if(A0.flowers){S(B,"tor:.22","#5E9E4A",np,[nr*1.05,nr*1.15,nr*1.05],nrot,{ol:0});var fc=["#F48FB1","#FFE27A","#FFFFFF","#B39DDB","#F48FB1","#FFB84D"];
    for(var fl=0;fl<6;fl++){var fa2=fl/6*Math.PI*2;S(B,"sph",fc[fl],[np[0]+Math.cos(fa2)*nr*.4,np[1]+Math.sin(fa2)*nr*.4+nr*.2,Math.sin(fa2+1)*nr*1.05],[.032,.032,.032],[0,0,0],{em:.15});}
    S(H,"sph","#F48FB1",[-hr*.1,hr*.8,hr*.3],[hr*.12,hr*.12,hr*.12],[0,0,0],{em:.15});}
  if(A0.cloth||A0.cape){var cc=A0.cape||A0.cloth,big=A0.cape?1.2:1,cw=(cr+pr)/2;
    var CL=S(B,null,null,[-L*.1*big,ty,0]);R.cape=A0.cape?CL:null;
    S(CL,"sph",cc,[0,cw*.66,0],[Lc*.62*big,cw*.36,cw*.96]);
    [-1,1].forEach(function(sd){S(CL,"box",cc,[0,cw*.08,sd*cw*.9],[Lc*.5*big,cw*.48,.016]);S(CL,"box",A0.cape?GOLD:"#F2EEE4",[0,cw*.08,sd*cw*.915],[Lc*.36*big,cw*.32,.006],[0,0,0],{ol:0});
      S(CL,"box",cc,[0,cw*.08,sd*cw*.92],[Lc*.3*big,cw*.22,.006],[0,0,0],{ol:0});S(CL,"box",GOLD,[0,-cw*.4,sd*cw*.92],[Lc*.5*big,.016,.02],[0,0,0],{ol:0});
      if(A0.tassels){["#E2483B","#F2C230","#2C5D8F"].forEach(function(tc,ti){S(CL,"tube:0",tc,[(ti-1)*Lc*.4,-cw*.42,sd*cw*.92],[.025,.08,.025],[0,0,Math.PI]);});}});
    if(A0.cape)S(B,"tor:.25",GOLD,np,[nr*1.05,nr*1.15,nr*1.05],nrot);}
  if(A0.bags){[-1,1].forEach(function(sd){S(B,"box","#8A5A2B",[-L*.15,ty+cr*.05,sd*cr*.98],[Lc*.3,cr*.32,cr*.13]);S(B,"box","#5A3A22",[-L*.15,ty+cr*.3,sd*cr*.98],[Lc*.31,cr*.05,cr*.14],[0,0,0],{ol:0});});S(B,"box","#5A3A22",[-L*.15,ty+cr*.95,0],[Lc*.1,.02,cr*1.0],[0,0,0],{ol:0});}
  if(A0.armor){S(B,"sph","#B3202B",[np[0]+down[0]*nr*1.15,np[1]+down[1]*nr*1.15,0],[cr*.1,cr*.14,cr*.14],[0,0,0],{ol:0,em:.2});
    S(H,"sph",A0.armor,[hr*.3,hr*.45,0],[hr*.55,hr*.3,hr*.5],[0,0,-.5],{em:.06});}
  if(A0.kalpak)kalpak(H,hr,hr*.62);
  if(A0.crown)crown(H,hr,hr*.72,A0.crown);
  R.aura=A0.aura||null;
  return {root:root,R:R};
}

/* ---------------- 鳥（イヌワシ） ---------------- */
function bBird(o){
  var a=o.a||0,R={t:"bird",legs:[],tail:[],wings:[],ears:[],eyes:[],o:o},root=N();
  if(o.fuzz){/* ひな：まんまる */
    var s=.8+.6*a,B=S(root,null,null,[0,.3*s,0]);R.body=B;R.by=.3*s;R.bR=.25*s;R.L=.2*s;
    S(B,"sph",o.col,[0,0,0],[.26*s,.27*s,.25*s]);for(var f=0;f<7;f++){var fa=f/7*Math.PI*2;S(B,"sph",o.col,[Math.cos(fa)*.2*s,-.05*s+Math.sin(f*1.7)*.08*s,Math.sin(fa)*.2*s],[.09*s,.09*s,.09*s]);}
    var H=S(B,null,null,[.06*s,.22*s,0]);R.head=H;R.hr=.17*s;S(H,"sph",o.col,[0,0,0],[.18*s,.17*s,.18*s]);
    S(H,"tube:0","#E8B923",[.15*s,-.02*s,0],[.045*s,.09*s,.04*s],[0,0,-1.75]);
    eyes(H,.18*s,{a:0,closed:o.closed},.62,.25,.5);
    [-1,1].forEach(function(sd){var w=S(B,null,null,[0,.05*s,sd*.22*s],[1,1,1],[sd*.9,0,0]);S(w,"sph",o.col,[0,0,sd*.07*s],[.12*s,.03*s,.09*s]);R.wings.push({n:w,sd:sd,fold:.9});
      var lp=S(B,null,null,[0,-.2*s,sd*.08*s]);S(lp,"tube:.7","#E8B923",[0,0,0],[.022*s,.1*s,.022*s],[0,0,Math.PI]);S(lp,"sph","#E8B923",[.03*s,-.1*s,0],[.05*s,.015*s,.035*s]);R.legs.push({n:lp,ph:sd>0?0:Math.PI});});
    return {root:root,R:R};}
  /* おとなのイヌワシ：体はたて長、頭は小さめで平たく、太い眉の骨と大きなかぎ形のくちばし、後頭部が金色、足は羽毛のズボン */
  var sz=.75+.45*a,lh=.12*sz,B2=S(root,null,null,[0,lh+.27*sz,0],[1,1,1],[0,0,-.32]);R.body=B2;R.by=lh+.27*sz;R.bR=.22*sz;R.L=.2*sz;
  S(B2,"sph",o.col,[0,0,0],[.2*sz,.3*sz,.2*sz]);
  S(B2,"sph",o.bel||o.col,[.07*sz,-.02*sz,0],[.13*sz,.24*sz,.15*sz],[0,0,0],{ol:0});
  S(B2,"sph",o.col,[.02*sz,.24*sz,0],[.13*sz,.12*sz,.13*sz]);
  var H2=S(B2,null,null,[.05*sz,.37*sz,0],[1,1,1],[0,0,.32]);R.head=H2;R.hr=.14*sz;
  S(H2,"sph",o.col,[0,0,0],[.15*sz,.13*sz,.13*sz]);S(H2,"sph",o.head||o.col,[-.06*sz,.03*sz,0],[.12*sz,.11*sz,.135*sz]);
  S(H2,"sph",o.head||o.col,[-.1*sz,-.06*sz,0],[.08*sz,.1*sz,.11*sz]);
  /* くちばし：黄色いろう膜＋黒っぽい先が下に曲がる */
  S(H2,"sph","#E8B923",[.12*sz,-.005*sz,0],[.045*sz,.04*sz,.05*sz],[0,0,0],{ol:0});
  var bk=S(H2,null,null,[.14*sz,-.01*sz,0],[1,1,1],[0,0,-1.75]);S(bk,"tube:.35","#5A5A62",[0,0,0],[.035*sz,.08*sz,.03*sz]);
  var bk2=S(bk,null,null,[0,.08*sz,0],[1,1,1],[0,0,-.9]);S(bk2,"tube:0","#3A3A42",[0,0,0],[.013*sz,.045*sz,.011*sz]);
  [-1,1].forEach(function(sd){S(H2,"box",o.col,[.06*sz,.06*sz,sd*.08*sz],[.06*sz,.014*sz,.03*sz],[sd*.25,0,-.15]);});
  eyes(H2,.15*sz,{a:1,eyec:"#C88A2A",es:.9},.62,.22,.55,R);
  if(o.hood){S(H2,"sph","#7A4A2A",[-.02*sz,.05*sz,0],[.15*sz,.12*sz,.15*sz]);S(H2,"tube:0","#B3202B",[-.02*sz,.16*sz,0],[.026*sz,.09*sz,.026*sz]);}
  if(o.mark)sparkMark(H2,.08*sz,.09*sz,0,.016*sz,o.mark);
  var w=.55*sz;[-1,1].forEach(function(sd){var wn=S(B2,null,null,[.02*sz,.18*sz,sd*.15*sz],[1,1,1],[sd*1.35,-sd*.45,0]);
    wing(wn,sd,w,o.col,null,o.wtip);
    R.wings.push({n:wn,sd:sd,fold:1.35,sweep:.45});
    var lp=S(root,null,null,[0,lh+.02*sz,sd*.07*sz]);S(lp,"sph",o.bel||o.col,[0,.02*sz,0],[.05*sz,.085*sz,.05*sz]);S(lp,"tube:.7","#E8B923",[0,-.03*sz,0],[.02*sz,lh-.03*sz,.02*sz],[0,0,Math.PI]);
    for(var c=-1;c<=1;c++)S(lp,"tube:0",DARK,[.02*sz,-lh+.01,c*.02*sz],[.011*sz,.05*sz,.011*sz],[c*.4,0,-1.6],{ol:0});R.legs.push({n:lp,ph:sd>0?0:Math.PI});
    if(o.jess)S(lp,"tor:.3","#8A5A2B",[0,-lh*.55,0],[.024*sz,.02*sz,.024*sz],[0,0,0],{ol:0});});
  var T=S(B2,null,null,[-.04*sz,-.28*sz,0],[1,1,1],[0,0,.35]);R.tailRoot=T;
  [-1,0,1].forEach(function(c){S(T,"sph",o.col,[-.13*sz,0,c*.045*sz],[.17*sz,.02*sz,.065*sz],[0,c*.3,0]);});
  if(o.young)S(T,"sph","#F4F1EA",[-.07*sz,.005*sz,0],[.08*sz,.022*sz,.1*sz],[0,0,0],{ol:0});
  var A0=o.acc||{};if(A0.tumar)tumar(B2,.17*sz,.12*sz,0,.045*sz,A0.tumar);
  R.aura=A0.aura||null;return {root:root,R:R};
}
function bEgg(col,spot){var root=N(),R={t:"egg",legs:[],tail:[],wings:[],ears:[],eyes:[],o:{}},B=S(root,null,null,[0,.36,0]);R.body=B;R.by=.36;R.bR=.3;R.L=.2;
  S(B,"sph",col,[0,0,0],[.27,.36,.27]);for(var k=0;k<8;k++){var a=k*2.4,y=-.6+((k*.37)%1)*1.2,r=Math.sqrt(1-y*y);S(B,"sph",spot,[Math.cos(a)*.27*r*.97,y*.36,Math.sin(a)*.27*r*.97],[.045,.045,.045],[0,0,0],{ol:0});}
  return {root:root,R:R};}

/* ---------------- 人（マナス・おじさん） ----------------
   2026-11-28 作り直し：大人は頭が体の4〜5分の1の、人らしい体つき（子どものうちは頭が大きい）。
   ひじ・ひざが曲がる腕と足、肩、首、耳・鼻・まゆ・口、長いそでのチャパン（чапан：前開きの長い上着）と帯、
   黒い長ぐつ（өтүк）。帽子は白いフェルトのカルパック（ак калпак）、鷹匠はキツネの毛皮のふちのテベテイ（тебетей）、
   戦士はかぶと（дулыга）。
   o: a(0=子ども〜1=大人) coat trim fur hat(kalpak|tebetei|batyr|gold|none) hatc beard hair armor cape hand off pose sleep olpok lid belly */
function bHum(o){
  var a=o.a==null?1:o.a,J=1-a,R={t:"hum",legs:[],tail:[],wings:[],ears:[],arms:[],eyes:[],o:o},root=N();
  var legL=.2+.25*a,tH=.22+.18*a,sw=.085+.055*a,hh=.112+.04*J,skin=o.skin||"#E2AD84",coat=o.coat||"#5E7F9A",trim=o.trim||"#E8D5A8",boot=o.boot||"#2A2226";
  var B=S(root,null,null,[0,legL,0]);R.body=B;R.by=legL;R.bR=.18;R.L=.12;
  /* 足（ひざつき）＋長ぐつ */
  [-1,1].forEach(function(sd){var lp=S(B,null,null,[0,0,sd*sw*.42]),u=legL*.5;
    S(lp,"tube:.85",o.pants||"#3A3A4A",[0,0,0],[sw*.36,u+.01,sw*.36],[0,0,Math.PI]);
    var kn=S(lp,null,null,[0,-u,0]);S(kn,"sph",o.pants||"#3A3A4A",[0,0,0],[sw*.31,sw*.31,sw*.31]);
    S(kn,"tube:.9",boot,[0,0,0],[sw*.33,u,sw*.33],[0,0,Math.PI]);S(kn,"sph",boot,[sw*.22,-u+.025,0],[sw*.45,.032,sw*.3]);
    S(kn,"tube:0",boot,[sw*.6,-u+.025,0],[.018,.05,.018],[0,0,-1.25]);
    R.legs.push({n:lp,k:kn,ph:sd>0?0:Math.PI});});
  /* 上着（チャパン）：肩から ひざ下まで、すそが少し広がる */
  var bot=-legL*.62,cl=tH-bot,bw=sw*(o.belly?1.35:1.22);
  if(!o.armor||o.olpok){var cc=o.olpok?"#F2EEE4":coat;
    S(B,"tube:"+(sw*1.02/bw).toFixed(2),cc,[0,bot,0],[bw,cl,bw*.85]);
    S(B,"tor:.14",o.olpok?GOLD:trim,[0,bot+.008,0],[bw,bw,bw*.85],[0,0,0],{ol:0});
    S(B,"box",o.olpok?GOLD:trim,[bw*.97,bot+cl*.5,0],[.01,cl*.5,.02],[0,0,.065],{ol:0});
    if(o.emb)for(var em=0;em<4;em++)S(B,"sph",o.emb,[bw*.97-em*.005,bot+cl*(.15+em*.08),sw*.25],[.008,.018,.03],[0,0,0],{ol:0});}
  if(o.belly)S(B,"sph",o.olpok?"#F2EEE4":coat,[sw*.25,tH*.35,0],[sw*1.05,tH*.42,sw*1.1]);
  if(o.armor){var ac=o.armor;S(B,"tube:.85",o.olpok?"#F2EEE4":ac,[0,bot,0],[bw*1.02,-bot+.02,bw*.88]);
    S(B,"sph",ac,[0,tH*.55,0],[sw*1.12,tH*.55,sw*1.02],[0,0,0],{em:.05});
    for(var sc2=0;sc2<3;sc2++)S(B,"tor:.12",o.trim||"#B3202B",[0,tH*(.3+sc2*.18),0],[sw*1.1,sw*.4,sw*1.0],[0,0,0],{ol:0});
    S(B,"sph",GOLD,[sw*1.08,tH*.62,0],[.022,.04,.04],[0,0,0],{ol:0,em:.2});}
  /* 肩と帯 */
  S(B,"sph",o.armor&&!o.olpok?o.armor:(o.olpok?"#F2EEE4":coat),[0,tH*.88,0],[sw*1.02,sw*.62,sw*1.12]);
  S(B,"tor:.2",o.belt||"#3A2A22",[0,tH*.28,0],[bw*.84+.008,bw*.35,bw*.72],[0,0,0],{ol:0});
  S(B,"box",GOLD,[bw*.9,tH*.28,0],[.012,.022,.03],[0,0,0],{ol:0,em:.15});
  if(o.fur)S(B,"tor:.45",o.furc||"#E8D5A8",[0,tH*.97,0],[sw*.82,sw*.6,sw*.8]);
  /* 腕（ひじつき）：チャパンの長いそで */
  var armL=.14+.2*a,sl=o.olpok?"#F2EEE4":(o.armor&&!o.olpok?o.armor:coat);
  [-1,1].forEach(function(sd){var ap=S(B,null,null,[0,tH*.86,sd*(sw*1.05+.02)]),u=armL*.5;
    S(ap,"sph",sl,[0,0,0],[sw*.36,sw*.36,sw*.36]);S(ap,"tube:.9",sl,[0,0,0],[sw*.3,u+.01,sw*.3],[0,0,Math.PI]);
    var el=S(ap,null,null,[0,-u,0]);S(el,"sph",sl,[0,0,0],[sw*.27,sw*.27,sw*.27]);S(el,"tube:1.25",sl,[0,0,0],[sw*.26,u,sw*.26],[0,0,Math.PI]);
    S(el,"tor:.2",o.olpok?GOLD:trim,[0,-u,0],[sw*.33,sw*.25,sw*.33],[0,0,0],{ol:0});
    var hd=S(el,null,null,[0,-u-.01,0]);S(hd,"sph",o.glove&&sd>0?"#8A5A2B":skin,[0,-.02,0],[.036+.004*J,.042,.032]);if(o.glove&&sd>0)S(hd,"tube:1.2","#8A5A2B",[0,.0,0],[.04,.06,.04]);
    R.arms.push({n:ap,e:el,h:hd,sd:sd});});
  var rH=R.arms[0].h,lH=R.arms[1].h;/* 右手（sd=-1）と左手 */
  /* 首と頭 */
  var Hp=S(B,null,null,[0,tH,0]);R.head=Hp;R.hr=hh;
  S(Hp,"tube:1",skin,[0,0,0],[.032+.01*a,.04,.032+.01*a]);
  var H=S(Hp,null,null,[0,hh*1.0+.02,0]);R.face=H;
  S(H,"sph",skin,[0,0,0],[hh*.96,hh,hh*.9]);S(H,"sph",skin,[hh*.28,-hh*.42,0],[hh*.6,hh*.5,hh*.68]);/* あご */
  S(H,"sph",o.hair||DARK,[-hh*.2,hh*.12,0],[hh*.84,hh*.9,hh*.92]);
  [-1,1].forEach(function(sd){S(H,"sph",skin,[-hh*.05,-hh*.08,sd*hh*.9],[hh*.12,hh*.2,hh*.1]);});
  S(H,"sph",skin,[hh*.97,-hh*.12,0],[hh*.13,hh*.16,hh*.11],[0,0,0],{ol:0});/* 鼻 */
  eyes(H,hh,{a:a,closed:o.sleep,eyec:"#3A2A22",es:.72,brow:a>.4,browc:o.hair||DARK,nob2:a>.4,lid:o.lid,lidc:skin},.84,.08,.38,R);
  if(J>.4&&!o.sleep)[-1,1].forEach(function(sd){S(H,"sph","#F2A0A0",[hh*.7,-hh*.32,sd*hh*.5],[hh*.05,hh*.07,hh*.12],[0,sd*.6,0],{ol:0,al:.7});});
  var mouth=S(H,null,null,[hh*.86,-hh*.42,0]);R.mouth=mouth;R.mouthS=S(mouth,"sph","#7A3030",[0,0,0],[hh*.05,hh*.03,hh*.16],[0,0,0],{ol:0});R.mouthY=hh*.03;
  if(o.beard){[-1,1].forEach(function(sd){S(H,"sph",o.beard,[hh*.92,-hh*.3,sd*hh*.15],[hh*.08,hh*.06,hh*.2],[sd*.35,0,0],{ol:0});});
    S(H,"sph",o.beard,[hh*.55,-hh*.78,0],[hh*.38,hh*.32,hh*.42]);}
  if(o.sleep)S(mouth,"sph","#5A2020",[0,0,0],[hh*.05,hh*.07,hh*.08],[0,0,0],{ol:0});
  /* 帽子 */
  if(o.hat==="kalpak")kalpak(H,hh*1.3,hh*.5);
  else if(o.hat==="tebetei"){S(H,"tube:.55",o.hatc||"#7A1F2B",[-hh*.05,hh*.45,0],[hh*.82,hh*.8,hh*.82],[0,0,.08]);S(H,"tor:.55","#C97A3A",[-hh*.05,hh*.48,0],[hh*.9,hh*.9,hh*.9],[0,0,.08]);
    S(H,"tor:.4","#E8B080",[-hh*.05,hh*.62,0],[hh*.86,hh*.6,hh*.86],[0,0,.08],{ol:0});S(H,"sph",GOLD,[-hh*.0,hh*1.25,0],[hh*.1,hh*.1,hh*.1],[0,0,0],{ol:0,em:.2});}
  else if(o.sleep){var nc=S(H,null,null,[-hh*.1,hh*.55,0],[1,1,1],[0,0,.9]);S(nc,"tube:.15","#E8EEF4",[0,0,0],[hh*.8,hh*1.1,hh*.8]);S(nc,"tor:.3","#5E7F9A",[0,0,0],[hh*.82,hh*.5,hh*.82],[0,0,0],{ol:0});S(nc,"sph","#FFFFFF",[0,hh*1.15,0],[hh*.22,hh*.22,hh*.22]);}
  else if(o.hat==="batyr"||o.hat==="gold"){var hc=o.hat==="gold"?GOLD:(o.hatc||"#9AA4AE");S(H,"tube:.08",hc,[-hh*.02,hh*.3,0],[hh*1.02,hh*1.35,hh*1.02],[0,0,0],{em:o.hat==="gold"?.08:0});
    S(H,"tor:.18",o.hat==="gold"?"#B3202B":"#5A6470",[-hh*.02,hh*.34,0],[hh*1.0,hh*.8,hh*1.0],[0,0,0],{ol:0});
    S(H,"sph",hc,[-hh*.45,-hh*.15,0],[hh*.65,hh*.62,hh*.98]);S(H,"tube:0","#B3202B",[-hh*.02,hh*1.6,0],[hh*.1,hh*.4,hh*.1]);}
  /* マント */
  if(o.cape){var cp=S(B,null,null,[-sw*.95,tH*.95,0],[1,1,1],[0,0,-.1]);S(cp,"box",o.cape,[-.015,-(tH+legL*.62)/2,0],[.014,(tH+legL*.62)/2,sw*1.25]);R.cape=cp;}
  /* 持ちもの */
  var it=o.hand;
  if(it==="spear"||it==="bigspear"){var big=it==="bigspear"?1.2:1;S(rH,"tube:1","#8A5A2B",[0,-.4*big,0],[.012*big,1.3*big,.012*big]);S(rH,"tube:0","#DCE3EA",[0,.9*big,0],[.028*big,.13*big,.018*big],[0,0,0],{em:.1});
    if(big>1)S(rH,"sph","#B3202B",[0,.88*big,0],[.035,.05,.035]);}
  else if(it==="whip"){S(rH,"tube:.6","#8A5A2B",[0,-.02,0],[.011,.2,.011],[0,0,-.4]);S(rH,"tube:.5","#5A3A22",[.07,.16,0],[.005,.18,.005],[0,0,-2.2],{ol:0});}
  else if(it==="stick")S(rH,"tube:.8","#8A5A2B",[0,-.25,0],[.016,.6,.016]);
  else if(it==="bow"){var bw2=S(rH,null,null,[0,0,0],[1,1,1],[0,0,0]);for(var k=0;k<5;k++){var ang=-.9+k*.45;S(bw2,"tube:1","#8A5A2B",[Math.sin(ang)*.05,Math.cos(ang)*.22-.02,0],[.009,.1,.009],[0,0,-ang*.6]);}}
  else if(it==="rock"){S(B,"sph","#8A8A8A",[0,tH+hh*2.5+.06,0],[.15,.11,.13],[.3,.2,.1]);}
  if(o.off==="shield"){var sh=S(lH,null,null,[0,0,.04],[1,1,1],[Math.PI/2,0,0]);S(sh,"tube:1","#B3202B",[0,0,0],[.14,.02,.14]);S(sh,"sph",GOLD,[0,-.01,0],[.04,.04,.04],[0,0,0],{em:.15});S(sh,"tor:.1",GOLD,[0,-.015,0],[.12,.12,.12],[0,0,0],{ol:0});}
  if(o.off==="quiver"||(o.off==="shield"&&o.quiver)){var qv=S(B,null,null,[-sw*1.0,tH*.55,-.04],[1,1,1],[.35,0,0]);S(qv,"tube:1","#7A4A2A",[0,-.12,0],[.035,.28,.035]);for(var q=0;q<3;q++)S(qv,"tube:1","#E8D5A8",[0,.16,(q-1)*.014],[.005,.08,.005],[0,0,0],{ol:0});}
  if(o.komuz){var kz=S(B,null,null,[sw*1.25,tH*.45,0],[1,1,1],[.0,0,.85]);S(kz,"sph","#A0612F",[0,0,0],[.075,.1,.045]);S(kz,"tube:1","#7A4A2A",[0,.08,0],[.014,.24,.014]);S(kz,"sph","#5A3A22",[0,.33,0],[.024,.03,.02]);
    for(var st2=0;st2<3;st2++)S(kz,"box","#F2EEE4",[.0,.14,(st2-1)*.007],[.002,.18,.002],[0,0,0],{ol:0});
    R.arms.forEach(function(x){x.hold=1;});}
  if(o.bird){R.arms[1].hold=1;}
  if(o.pose==="up"){R.arms.forEach(function(x){x.up=1;});}
  R.aura=o.aura||null;R.sleep=o.sleep;R.lid=o.lid;
  return {root:root,R:R};
}
/* 馬に乗る：馬の背中に人をのせる */
function bRide(horse,rider){var hb=horse.R.body,rr=rider.root,rb=rider.R,cr=horse.R.cr||horse.R.bR;
  rr.p=[-cr*.15,cr*.86-rb.by*.82+.015,0];rr.u=.82;A(hb,rr);
  rb.legs.forEach(function(l){var sd=l.n.p[2]>0?1:-1;l.n.r=[-sd*.75,0,.55];if(l.k)l.k.r=[0,0,-1.1];l.fixed=1;});
  rb.seated=1;horse.R.rider=rb;
  /* 鞍と鞍の布（赤いフェルトに金のふち） */
  S(hb,"sph","#B3202B",[-cr*.15,cr*.8,0],[cr*.75,cr*.22,cr*.98]);S(hb,"tor:.2",GOLD,[-cr*.15,cr*.74,0],[cr*.76,cr*.3,cr*.98],[0,0,0],{ol:0});
  S(hb,"sph","#6A4024",[-cr*.15,cr*.95,0],[cr*.45,cr*.1,cr*.45]);
  return horse;}
/* ベシク（ゆりかご） */
function bCradle(){var root=N(),R={t:"cradle",legs:[],tail:[],wings:[],ears:[],eyes:[],o:{}},B=S(root,null,null,[0,.28,0]);R.body=B;R.by=.28;R.bR=.3;R.L=.35;
  S(B,"box","#A0612F",[0,0,0],[.38,.1,.2]);S(B,"box","#B3202B",[0,.1,0],[.3,.03,.18],[0,0,0],{ol:0});
  [-1,1].forEach(function(sd){S(B,"tor:.08","#8A5A2B",[sd*.36,.05,0],[.2,.2,.2],[Math.PI/2,0,0]);S(B,"box","#8A5A2B",[sd*.34,-.17,0],[.04,.08,.24]);});
  S(B,"sph","#F4ECD8",[-.02,.12,0],[.24,.09,.13]);var H=S(B,null,null,[.24,.15,0]);R.head=H;R.hr=.11;S(H,"sph","#E8B48A",[0,0,0],[.11,.11,.11]);S(H,"sph","#F4ECD8",[-.04,.03,0],[.1,.1,.12]);
  eyes(H,.11,{a:0,closed:1},.8,.05,.35);return {root:root,R:R};}

/* ---------------- 背景のもの ---------------- */
/* ユルタ（боз үй）：白いフェルトの壁と屋根、屋根の頂にトゥンドゥク（түндүк：丸い天窓の木の枠）、
   壁をしめる模様の帯、木の扉（赤く塗って模様をつけることが多い）。扉は +x 向き */
function yurt(par,x,z,s,rot){var y=S(par,null,null,[x,0,z],[1,1,1],[0,rot||0,0]);y.u=s;
  S(y,"tube:1:20","#F4F0E6",[0,0,0],[.9,.72,.9]);S(y,"tube:.2:20","#ECE6D8",[0,.71,0],[.97,.52,.97]);
  S(y,"tube:1:20","#B3202B",[0,.5,0],[.912,.07,.912],[0,0,0],{ol:0});S(y,"tube:1:20","#F2C230",[0,.52,0],[.918,.025,.918],[0,0,0],{ol:0});
  for(var k=0;k<10;k++){var a=k/10*Math.PI*2+.31;S(y,"box","#2C5D8F",[Math.cos(a)*.915,.535,Math.sin(a)*.915],[.035,.035,.006],[0,-a+Math.PI/2,Math.PI/4],{ol:0});}
  S(y,"tube:1:20","#D8CFC0",[0,.71,0],[.975,.03,.975],[0,0,0],{ol:0});
  S(y,"tor:.25","#7A4A2A",[0,1.18,0],[.2,.4,.2]);
  [-1,0,1].forEach(function(q){S(y,"box","#7A4A2A",[0,1.2,q*.07],[.2,.012,.012],[0,0,0],{ol:0});S(y,"box","#7A4A2A",[q*.07,1.2,0],[.012,.012,.2],[0,0,0],{ol:0});});
  S(y,"box","#A0302A",[.9,.29,0],[.035,.29,.2]);S(y,"box","#F2C230",[.93,.29,0],[.008,.22,.14],[0,0,0],{ol:0});S(y,"box","#A0302A",[.935,.29,0],[.008,.18,.1],[0,0,0],{ol:0});
  S(y,"box","#6A4024",[.9,.6,0],[.045,.03,.24]);return y;}
/* キルギスの国旗（2023年12月からの図柄）：赤地に、まっすぐな40本の光をもつ黄色い太陽、
   太陽の中に赤いトゥンドゥク（丸い輪と、2方向に3本ずつ交わる線）。縦横の比は 3:5 */
function kgFlag(par,x,z,h,rot){var f=S(par,null,null,[x,0,z],[1,1,1],[0,rot||0,0]);
  S(f,"tube:1","#E8E4DC",[0,0,0],[.03,h,.03]);S(f,"sph",GOLD,[0,h+.04,0],[.05,.05,.05],[0,0,0],{em:.2});
  var W=.75,Hh=.45,F=S(f,null,null,[W+.03,h-Hh-.03,0]);f.flag=F;
  S(F,"box","#E8112D",[0,0,0],[W,Hh,.006],[0,0,0],{ol:0});
  [1,-1].forEach(function(sd){var P=S(F,null,null,[0,0,sd*.008],[1,1,1],[0,sd>0?0:Math.PI,0]);
    S(P,"sun:40","#FFE000",[0,0,0],[Hh*.6,Hh*.6,1],[0,0,0],{ol:0});
    S(P,"ring:.72","#E8112D",[0,0,.002],[Hh*.3,Hh*.3,1],[0,0,0],{ol:0});
    [-1,0,1].forEach(function(q){[.62,-.62].forEach(function(ang){var d=q*Hh*.085,R0=Hh*.29;S(P,"box","#E8112D",[d*Math.cos(ang),d*Math.sin(ang),.003],[Hh*.011,Math.sqrt(R0*R0-d*d),.001],[0,0,ang],{ol:0});});});});
  return f;}
/* 柵（羊の囲い） */
function fence(par,cx,cz,r,n){for(var k=0;k<n;k++){var a=k/n*Math.PI*2,px=cx+Math.cos(a)*r,pz=cz+Math.sin(a)*r;S(par,"tube:1","#8A6A4A",[px,0,pz],[.035,.42,.035]);
  var a2=(k+1)/n*Math.PI*2,qx=cx+Math.cos(a2)*r,qz=cz+Math.sin(a2)*r,mx2=(px+qx)/2,mz=(pz+qz)/2,ln=Math.hypot(qx-px,qz-pz)/2,ra=Math.atan2(-(qz-pz),qx-px);
  [.18,.34].forEach(function(yy){S(par,"box","#9A7A58",[mx2,yy,mz],[ln,.018,.018],[0,ra,0]);});}}
/* 天山のトウヒ（細長い円すい形の木） */
function spruce(par,x,z,h){S(par,"tube:1","#5A3A22",[x,0,z],[.07,h*.3,.07]);[[.18,.42,.55],[.42,.34,.45],[.64,.26,.36]].forEach(function(q){S(par,"tube:0:9",q[0]>.5?"#3E6E4A":"#2F5A3A",[x,h*q[0]-h*.12,z],[q[1]*h*.42,q[2]*h,q[1]*h*.42]);});}
/* フェルトのじゅうたん（シルダク風の色の組み合わせ） */
function felt(par,x,z,rot){var c=S(par,null,null,[x,.006,z],[1,1,1],[0,rot||0,0]);S(c,"box","#B3202B",[0,0,0],[.55,.006,.36],[0,0,0],{ol:0});S(c,"box","#F4F0E6",[0,.002,0],[.48,.006,.29],[0,0,0],{ol:0});S(c,"box","#2C5D8F",[0,.004,0],[.42,.006,.23],[0,0,0],{ol:0});
  [-1,1].forEach(function(sd){S(c,"tor:.3","#F2C230",[sd*.2,.012,0],[.08,.02,.08],[0,0,0],{ol:0});});S(c,"sph","#F2C230",[0,.012,0],[.06,.01,.06],[0,0,0],{ol:0});return c;}
function sheep(par,x,z,s,r){var sh=S(par,null,null,[x,0,z],[1,1,1],[0,r||0,0]);sh.u=s;
  for(var k=0;k<7;k++){var a=k/7*Math.PI*2;S(sh,"sph","#F4F1EA",[Math.cos(a)*.16,.36+Math.sin(k*2.1)*.04,Math.sin(a)*.1],[.13,.12,.12]);}
  S(sh,"sph","#F4F1EA",[0,.4,0],[.22,.15,.15]);S(sh,"sph","#3A3030",[.24,.38,0],[.08,.07,.065]);
  [[.1,.06],[.1,-.06],[-.1,.06],[-.1,-.06]].forEach(function(l){S(sh,"tube:1","#3A3030",[l[0],0,l[1]],[.022,.3,.022]);});return sh;}
function fire(par,x,z){var f=S(par,null,null,[x,0,z]);S(f,"tube:1","#6A4A2A",[-.15,.04,0],[.035,.3,.035],[0,.5,-Math.PI/2]);S(f,"tube:1","#6A4A2A",[-.1,.04,-.12],[.035,.3,.035],[0,-.8,-Math.PI/2]);
  var fl=[];[["#FF7A2A",.11,.3],["#FFC24A",.07,.2]].forEach(function(c){fl.push(S(f,"tube:0",c[0],[0,.04,0],[c[1],c[2],c[1]],[0,0,0],{em:.25,ol:0}));});f.flames=fl;return f;}
function rock(par,x,z,s,c){return S(par,"sph",c||"#8E8A84",[x,s*.25,z],[s*.5,s*.4,s*.42],[rnd(0,1),rnd(0,3),rnd(0,1)]);}

/* ---------------- 場所（空・地面・山） ---------------- */
var ENV={
  steppe:{sky:"linear-gradient(180deg,#7DB8EA 0%,#BFE0F5 55%,#F1EAD0 100%)",fog:"#D6E8F2",g:"#9CC56A",g2:"#94BE63",m:"#7F93AE",sky3:"#FFFFFF",gnd:"#E9E2C8",L:[.45,.8,.4]},
  dawn:{sky:"linear-gradient(180deg,#F29A6B 0%,#F7CC98 50%,#FFF0D6 100%)",fog:"#F6D2AE",g:"#A7C46A",g2:"#A0BE64",m:"#9A86A0",sky3:"#FFE8D0",gnd:"#E8D2B8",L:[.7,.55,.3]},
  night:{sky:"linear-gradient(180deg,#0C0E2C 0%,#232660 60%,#463C72 100%)",fog:"#3A3768",g:"#3F5A4C",g2:"#3B5646",m:"#2C3260",sky3:"#B8C0FF",gnd:"#6A6490",L:[.3,.8,.5],stars:1},
  snow:{sky:"linear-gradient(180deg,#9CC4E6 0%,#DDEBF7 60%,#FFFFFF 100%)",fog:"#E6F0F8",g:"#F2F6FA",g2:"#E2EAF2",m:"#9AAFC6",sky3:"#FFFFFF",gnd:"#DCE6F0",L:[.45,.8,.4],snow:1},
  snight:{sky:"linear-gradient(180deg,#101A3A 0%,#2C4472 60%,#6A84B0 100%)",fog:"#4A5F8E",g:"#C8D6EA",g2:"#B4C4DC",m:"#3A4C78",sky3:"#C8D8FF",gnd:"#8A9AC0",L:[.3,.8,.5],stars:1,snow:1},
  high:{sky:"linear-gradient(180deg,#6FAFE6 0%,#CFE6F6 60%,#EDE6D4 100%)",fog:"#D2E2EE",g:"#A9AD86",g2:"#A2A67F",m:"#7A8496",sky3:"#FFFFFF",gnd:"#E2DCC8",L:[.45,.8,.4],rocks:1},
  meadow:{sky:"linear-gradient(180deg,#86C4EE 0%,#CDEAF6 55%,#F6F0D6 100%)",fog:"#DCEEF2",g:"#8FCB6A",g2:"#88C462",m:"#86A0B8",sky3:"#FFFFFF",gnd:"#ECE6C8",L:[.45,.8,.4],flowers:1},
  inside:{sky:"radial-gradient(circle at 50% 30%,#8A5A3A 0%,#4A2E22 75%)",fog:"#4A2E22",g:"#B3202B",g2:"#8E1A24",m:"#5A3A2A",sky3:"#FFE2B8",gnd:"#C89A70",L:[.4,.85,.35],inside:1},
  stage:{sky:"none",fog:"#140F22",g:"#2A2140",g2:"#2A2140",m:"#2A2140",sky3:"#FFF2D6",gnd:"#8A7AB0",L:[.4,.8,.45],stage:1}};
function buildEnv(name,extra){var E=ENV[name]||ENV.steppe,root=N();
  if(E.stage){S(root,"tor:.06",GOLD,[0,.01,0],[1.1,.3,1.1],[0,0,0],{ol:0,em:.8});S(root,"tube:1","#3A2E5A",[0,-.04,0],[1.05,.05,1.05],[0,0,0],{ol:0,em:.1});return root;}
  if(E.inside){S(root,"tube:1",E.g,[0,-.03,0],[4.5,.03,4.5],[0,0,0],{ol:0});S(root,"tube:1","#F2EEE4",[0,0,0],[4.6,3,4.6],[0,0,0],{ol:0,inner:1});return root;}
  S(root,"tube:1",E.g,[0,-.05,0],[16,.05,16],[0,0,0],{ol:0});
  for(var k=0;k<14;k++){var a=k*2.4,r=1.8+((k*.61)%1)*4;S(root,"sph",E.g2,[Math.cos(a)*r,-.01,Math.sin(a)*r],[rnd(.5,1.1),.03,rnd(.4,.9)],[0,a,0],{ol:0});}
  for(k=0;k<11;k++){var ma=k/11*Math.PI*2+.2,mr=12+((k*.37)%1)*3,mh=rnd(2.6,4.6),mw=rnd(2.4,3.6);
    S(root,"tube:0:7",E.m,[Math.cos(ma)*mr,-.05,Math.sin(ma)*mr],[mw,mh,mw],[0,ma,0],{ol:0});
    S(root,"tube:0:7",E.snow?"#FFFFFF":"#F4F6FA",[Math.cos(ma)*mr,-.05+mh*.62,Math.sin(ma)*mr],[mw*.38,mh*.38,mw*.38],[0,ma,0],{ol:0});}
  if(!E.snow&&!E.rocks)for(k=0;k<26;k++){var ga=k*1.7,gr=1.2+((k*.53)%1)*5;S(root,"tube:0:5",k%3?"#6FA34A":"#7FB858",[Math.cos(ga)*gr,0,Math.sin(ga)*gr],[.05,.12,.05],[0,0,(k%5-2)*.12],{ol:0});}
  if(E.flowers||name==="steppe"||name==="dawn"){var fc=["#F48FB1","#FFE27A","#FFFFFF","#B39DDB","#E2483B"],n=E.flowers?40:12;
    for(k=0;k<n;k++){var fa=k*2.1,fr=1.3+((k*.71)%1)*4.6;S(root,"sph",fc[k%5],[Math.cos(fa)*fr,.05,Math.sin(fa)*fr],[.045,.035,.045],[0,0,0],{ol:0,em:.15});}}
  if(E.rocks||E.snow)for(k=0;k<8;k++){var ra=k*1.9+.5,rr=2.2+((k*.43)%1)*3.5;rock(root,Math.cos(ra)*rr,Math.sin(ra)*rr,rnd(.3,.8),E.snow?"#C9D3DD":"#8E8A84");}
  if(extra&&extra.ranch){/* 牧場：うしろ側にユルタと国旗、羊の囲い、トウヒの林。仲間が歩く真ん中（半径5）はあけておく */
    var put=function(deg,r){var a=deg*Math.PI/180;return [Math.cos(a)*r,Math.sin(a)*r];},face=function(p){return Math.atan2(p[1],-p[0]);};
    [[100,6.6,1.05],[136,7.2,1.3],[170,6.5,.95]].forEach(function(q){var p=put(q[0],q[1]);yurt(root,p[0],p[1],q[2],face(p));});
    var fp=put(118,5.7);root.flag=kgFlag(root,fp[0],fp[1],2.1,Math.atan2(-fp[0],-fp[1]));
    var pp=put(35,6.6);fence(root,pp[0],pp[1],1.05,12);sheep(root,pp[0]+.3,pp[1]-.2,1,1.2);sheep(root,pp[0]-.35,pp[1]+.25,.85,2.6);sheep(root,pp[0]-.1,pp[1]-.45,.9,.4);
    [[60,8.6,1.9],[68,9.4,2.4],[76,8.4,1.6],[200,8.2,2.0],[210,9.2,2.6],[220,8.0,1.7],[300,9.0,2.2],[312,8.4,1.8]].forEach(function(q){var p=put(q[0],q[1]);spruce(root,p[0],p[1],q[2]);});
    var cp=put(128,4.6);felt(root,cp[0],cp[1],face(cp));
    for(k=0;k<6;k++){var rp=put(250+k*14,6.2+(k%3)*.7);rock(root,rp[0],rp[1],rnd(.3,.6),"#9A958E");}
    root.ranch=1;}
  else if(extra&&extra.yurt)yurt(root,-3,-2.6,1,.6);
  if(extra&&extra.yurts){yurt(root,-3,-2.6,1,.6);yurt(root,-4.6,-.6,.8,.2);yurt(root,2.6,-3.6,.85,1.2);}
  if(extra&&extra.sheep){sheep(root,2.2,-1.4,1,2.4);sheep(root,2.8,-.6,.85,2.0);sheep(root,1.6,-2.3,.9,2.8);}
  if(extra&&extra.fire)root.fire=fire(root,1.1,.5);
  if(E.stars){S(root,"sph","#FFF6D8",[-6,7.5,-9],[.7,.7,.7],[0,0,0],{ol:0,em:1});}
  return root;}

/* ---------------- 仲間ごとの形（2Dの絵と同じ設定） ---------------- */
function ac(i,list){var o={};list.forEach(function(x){if(i>=x[0])o[x[1]]=x[2];});return o;}
function mx(a,b){var o={},k;for(k in a)o[k]=a[k];for(k in b)o[k]=b[k];return o;}
var PA=(typeof PGA!=="undefined")?PGA:[0,.14,.28,.42,.56,.7,.82,.92,1,1];
function sc0(i){return .78+.07*i;}
/* 動物ごとの体つき */
var BODY={
  dog:{bh:1,hip:.86,len:1.15,leg:1.05,head:1.05,muz:.8,mw:.9,mt:.1,na:.85,neck:.5,ear:"dogf",tail:"dog",ef:[.52,.22,.52]},
  taigan:{bh:.85,hip:.8,len:1.25,leg:1.35,legT:.88,head:1.1,muz:.9,mw:1.0,jaw:1,mt:.08,na:.95,neck:.75,ear:"dogt",tail:"ring",hipY:.1,ef:[.5,.24,.5]},
  guard:{bh:1.2,hip:.9,len:1.1,leg:1.0,legT:1.2,head:1.1,muz:.8,mw:1.05,mt:.12,na:.7,neck:.4,ear:"dogf",tail:"bush",ruff:1,ef:[.52,.24,.52]},
  cat:{bh:.9,hip:.92,len:1.1,leg:.8,legT:.85,head:1.0,muz:.3,mw:1.15,cheek:1,na:1.0,neck:.35,ear:"cat",tail:"cat",whisk:1,omega:1,nose:"#E89A9A",ef:[.8,.14,.36],my:-.12,slit:1},
  rabbit:{rab:1,bh:.95,hip:1.3,hipY:-.15,chY:.3,len:.7,leg:.5,legT:.7,head:1.0,muz:.3,mw:1.15,cheek:1,na:1.15,neck:.25,ear:"rab",tail:"pom",whisk:1,omega:1,nose:"#E89A9A",ef:[.62,.16,.52],my:-.14},
  yak:{bh:1.3,hip:.88,len:1.2,leg:.72,legT:1.3,head:1.0,muz:.8,mw:1.15,mt:.3,na:.15,neck:.35,hump:1,fluff:1,ear:"yak",tail:"yak",hoof:1,ef:[.45,.22,.62]},
  horse:{bh:.95,hip:.95,len:1.35,leg:1.55,legT:.8,head:1.05,muz:1.3,mw:1.38,mt:.85,jaw:1,na:1.05,neck:1.05,nw:1.2,ear:"horse",tail:"horse",hoof:1,ef:[.3,.18,.72]},
  leopard:{bh:.95,hip:.95,len:1.4,leg:.8,legT:1.25,head:.85,muz:.36,mw:1.25,cheek:1,na:.6,neck:.35,ear:"round",tail:"leo",spots:1,rosette:1,whisk:1,omega:1,nose:"#C98A8A",ef:[.78,.16,.38],my:-.14},
  dragon:{bh:1.05,hip:1.0,len:1.3,leg:.75,legT:1.25,head:1.0,muz:1.05,mw:.9,mt:.12,na:.95,neck:1.1,ear:"drag",tail:"drag",claws:1,ef:[.52,.3,.5]}};
/* 毛色などの個性（人によって違う。0 は今までの色） */
var VAR={
  dog:[{n:"クリーム"},{n:"赤茶",col:"#C27F45",bel:"#F4DEC0",ecol:"#8A5228",snc:"#E8C8A0"},{n:"黒と茶",col:"#2E2A2E",bel:"#D9A066",ecol:"#2E2A2E",snc:"#D9A066",sock:"#D9A066"},{n:"白ぶち",col:"#F6F1E8",bel:"#FFFFFF",ecol:"#9A6A40",patch:"#B98B5E"}],
  cat:[{n:"茶トラ",stripe:"#D27A32"},{n:"グレー",col:"#A4A8B0",bel:"#F2F2F2",stripe:"#7E838E",eyec:"#5FAF6A"},{n:"三毛",col:"#FBF6EE",bel:"#FFFFFF",patch:"#E8963E",eyec:"#D9A030"},{n:"黒",col:"#2E2A30",bel:"#4A4450",eyec:"#F2C230",ein:"#C08A9A",wkc:"#CFCFCF"}],
  rabbit:[{n:"茶色"},{n:"グレー",col:"#A8A49E",bel:"#F2EFEA"},{n:"白に黒耳",col:"#F6F3EE",bel:"#FFFFFF",etip:"#3A3234",eyec:"#B84A5A"},{n:"こげ茶",col:"#7A5A44",bel:"#E8D8C8"}],
  yak:[{n:"茶色"},{n:"黒",col:"#3A3234",bel:"#4E4446",fcol:"#241E20",snc:"#5A5052"},{n:"白",col:"#EDE8E0",bel:"#FFFFFF",fcol:"#D8D0C4",snc:"#F4EFE8"},{n:"白黒",col:"#3A3234",bel:"#F4EFE8",fcol:"#241E20",patch:"#F4EFE8",snc:"#F4EFE8"}],
  tulpar:[{n:"白"},{n:"栗毛",col:"#9A5E2E",bel:"#B07040",mane:"#3A2420",blaze:"#FFFFFF",sock:"#F4F1EA"},{n:"月毛",col:"#E2C07A",bel:"#ECD49A",mane:"#FFF4DC",blaze:"#FFF8EE"},{n:"芦毛",col:"#B8BCC4",bel:"#D6D9DE",mane:"#6A6E78",patch:"#9EA2AC"}],
  leopard:[{n:"灰白"},{n:"クリーム",col:"#EFE5D2",spotc:"#6A5E58"},{n:"けむり色",col:"#CFCBC6",spotc:"#4A4650"},{n:"大きな斑",spotc:"#3E3A44",big:1}],
  eagle:[{n:"こげ茶"},{n:"黒っぽい",col:"#4E3418",bel:"#6A4A28"},{n:"明るい茶",col:"#8A5E2E",bel:"#B07A44",head:"#E8B860"},{n:"金色の首",head:"#F2C86A"}],
  dragon:[{n:"緑"},{n:"青",col:"#5E8FC9",bel:"#D8E6F4",wcol:"#9CC0E8"},{n:"赤",col:"#C9604E",bel:"#F4D8B0",wcol:"#E8A08A"},{n:"むらさき",col:"#8E6FB8",bel:"#E8DCF4",wcol:"#BFA8E0"}],
  oji:[{n:"青いチャパン"},{n:"緑のチャパン",coat:"#4E7A52"},{n:"茶色のチャパン",coat:"#8A5A34"},{n:"紺のチャパン",coat:"#2E3E6A"}],
  manas:[{n:"物語どおり"}]};
function vr(k,v){var L=VAR[k]||[{}];return L[v>=0&&v<L.length?v:0]||{};}
function vcol(V){var o={};for(var x in V)if(x!=="n"&&x!=="big")o[x]=V[x];return o;}
var SPEC={
 dog:function(i,b,v){var V=vcol(vr("dog",v)),o=mx(mx(BODY.dog,{a:PA[i],col:"#E8D2B0",bel:"#FFF6E6",sn:.9,ecol:"#B98B5E",closed:i===1}),V);o.acc=ac(i,[[2,"scarf","#B3202B"],[3,"bell",1]]);
   if(i>=5&&b!=="b")o=mx(mx(o,BODY.taigan),{acc:mx({scarf:"#B3202B"},ac(i,[[5,"cloth","#2C5D8F"],[6,"tassels",1],[8,"tumar","#E8B923"],[9,"aura","#FFD34D"]])),mark:i>=9?"#FFE27A":0});
   if(i>=5&&b==="b")o=mx(mx(o,BODY.guard),{rcol:V.col||"#F4E6CC",acc:mx({bell:1},ac(i,[[5,"cloth","#B3202B"],[6,"tassels",1],[7,"kalpak",1],[8,"tumar","#E8B923"],[9,"aura","#FFB84D"]]))});
   return {f:bQuad(o),env:i>=5&&b!=="b"?(i===9?"dawn":"steppe"):"steppe",ex:i>=5&&b==="b"?{yurt:1,sheep:1}:{yurt:1},sc:sc0(i)};},
 cat:function(i,b,v){var V=vcol(vr("cat",v)),o=mx(mx(BODY.cat,{a:PA[i],col:"#F2A65A",bel:"#FFF1DE",eyec:"#8FBF4A",closed:i===1}),V);o.acc=ac(i,[[2,"ribbon","#E2483B"],[3,"bell",1]]);
   if(i>=5&&b!=="b")o.acc=mx(o.acc,ac(i,[[5,"kalpak",1],[7,"cloth","#2C5D8F"],[8,"tumar","#E8B923"],[8,"cape","#B3202B"],[9,"aura","#FFD34D"]]));
   if(i>=5&&b==="b")o=mx(o,{col:"#3E4A7A",bel:"#8FA0D8",eyec:"#FFE27A",stripe:V.stripe?"#5A6AA0":0,patch:V.patch?"#B39DDB":0,stars:i>=6,mark:i>=6?"#FFE27A":0,acc:ac(i,[[7,"scarf","#B39DDB"],[8,"cape","#2A2350"],[9,"crown","#FFE27A"],[9,"aura","#B39DDB"]])});
   return {f:bQuad(o),env:i>=5&&b==="b"?"night":(i<2?"inside":"steppe"),ex:{yurt:1},sc:sc0(i)*.85};},
 rabbit:function(i,b,v){var V=vcol(vr("rabbit",v)),o=mx(mx(BODY.rabbit,{a:PA[i],col:"#D8BFA0",bel:"#FFF6E6",closed:i===1}),V);o.acc=ac(i,[[2,"scarf","#F2C230"]]);
   if(i>=5&&b!=="b")o=mx(o,{col:i===5?"#EFE8DE":"#F8F8F6",bel:"#FFFFFF",ein:"#F4C6C6",mark:i>=9?"#BFE8FF":0,acc:mx({scarf:"#B3202B"},ac(i,[[6,"cloth","#2C5D8F"],[7,"tumar","#E8B923"],[8,"crown","#DCE3EA"],[9,"aura","#BFE8FF"]]))});
   if(i>=5&&b==="b")o=mx(o,{acc:ac(i,[[5,"flowers",1],[7,"ribbon","#F48FB1"],[8,"cloth","#B3202B"],[9,"aura","#F48FB1"]])});
   return {f:bQuad(o),env:i>=5?(b==="b"?"meadow":"snow"):"steppe",ex:{},sc:sc0(i)*.85,hop:1};},
 yak:function(i,b,v){var V=vcol(vr("yak",v)),o=mx(mx(BODY.yak,{a:PA[i],col:"#7E6656",bel:"#9A8474",snc:"#B09A88",horn:1.5,fcol:"#4A3A32"}),V);o.acc=ac(i,[[3,"bell",1]]);
   if(i>=5&&b!=="b")o.acc=mx(o.acc,ac(i,[[5,"bags",1],[7,"tumar","#E8B923"],[9,"aura","#FFD34D"]]));
   if(i>=5&&b==="b")o.acc=mx(o.acc,ac(i,[[5,"cloth","#B3202B"],[6,"tassels",1],[7,"flowers",1],[9,"aura","#F48FB1"]]));
   if(i===9)o.hcol="#FFF3C8";
   return {f:bQuad(o),env:i===9?"dawn":"high",ex:{},sc:i===9?1.85:sc0(i)*1.0,slow:1};},
 tulpar:function(i,b,v){var V=vcol(vr("tulpar",v)),o=mx(mx(BODY.horse,{a:PA[i],col:"#F4F1EA",bel:"#FFFFFF",mane:"#C9D3DD",wing:[0,0,.35,.55,.75,1,1,1,1,1.1][i],wcol:"#FFFFFF",acc:{}}),V);
   if(i>=5&&b!=="b")o=mx(o,{col:"#F7F4EE",bel:"#FFFFFF",mane:"#F2C230",patch:0,sock:0,wcol:"#FFF8E6",mark:i>=9?"#FFE27A":0,acc:ac(i,[[5,"scarf","#B3202B"],[6,"cloth","#B3202B"],[7,"tumar","#E8B923"],[8,"armor","#F2C230"],[9,"aura","#FFD34D"]])});
   if(i>=5&&b==="b")o=mx(o,{col:"#2E3A66",bel:"#4A5A8E",mane:"#B39DDB",wcol:"#8FA0D8",patch:0,blaze:V.blaze?"#B39DDB":0,stars:i>=6,mark:i>=7?"#FFE27A":0,acc:ac(i,[[6,"scarf","#B39DDB"],[8,"cape","#2A2350"],[9,"crown","#FFE27A"],[9,"aura","#B39DDB"]])});
   return {f:bQuad(o),env:i<2?"steppe":(b==="b"&&i>=5?"night":(i===9?"dawn":"steppe")),ex:{},sc:sc0(i)*.95,fly:i>=4};},
 leopard:function(i,b,v){var V0=vr("leopard",v),V=vcol(V0),o=mx(mx(BODY.leopard,{a:PA[i],col:"#E6E2DA",bel:"#FFFFFF",spotc:"#6A6670",eyec:"#A8BFAE",closed:i===1,acc:{}}),V);
   if(i>=5&&b!=="b")o.acc=ac(i,[[5,"tumar","#E8B923"],[6,"scarf","#B3202B"],[7,"cape","#B3202B"],[8,"crown","#F2C230"],[9,"aura","#FFD34D"]]);
   if(i>=5&&b==="b")o=mx(o,{col:"#EEF6FB",spotc:"#8FB8D8",eyec:"#5FB0E8",stars:i>=7,mark:i>=8?"#BFE8FF":0,acc:ac(i,[[6,"scarf","#8FB8D8"],[9,"crown","#DCEFFF"],[9,"aura","#BFE8FF"]])});
   var sp=bQuad(o);return {f:sp,env:i>=5&&b==="b"?"snight":(i===9?"dawn":"snow"),ex:{},sc:sc0(i)*(V0.big?1.05:1)};},
 eagle:function(i,b,v){if(i===0)return {f:bEgg("#F4ECD8","#B0773C"),env:"high",ex:{},sc:1,egg:1};
   if(i<3)return {f:bBird({a:i===1?0:.25,fuzz:1,col:"#F4F1EA",closed:false}),env:"high",ex:{},sc:1,hop:1};
   var V=vcol(vr("eagle",v)),o=mx({a:PA[i],col:"#6E4A22",bel:"#9A6A3A",head:"#D8A24A",young:i<5,acc:{}},V);
   if(i>=5&&b!=="b")o=mx(o,{hood:i===5,brow:1,acc:ac(i,[[6,"jess",1],[7,"tumar","#E8B923"],[9,"aura","#FFD34D"]])});
   if(i>=5&&b==="b")o=mx(o,{col:"#2E2A3A",bel:"#4A3F5A",head:"#5A4A6A",brow:1,wtip:i>=6?"#F2C230":"",mark:i>=8?"#FFE27A":0,acc:ac(i,[[9,"aura","#B39DDB"]])});
   return {f:bBird(o),env:i>=5&&b==="b"?(i===9?"dawn":"steppe"):(i===9?"dawn":"high"),ex:{},sc:.9+.09*i,fly:i>=3,hop:1};},
 dragon:function(i,b,v){if(i===0)return {f:bEgg("#9ED0A6","#5E9E6A"),env:"high",ex:{},sc:1,egg:1};
   var V=vcol(vr("dragon",v)),o=mx(mx(BODY.dragon,{a:PA[i],col:"#6FAF7A",bel:"#E8E2B0",horn:i>=4?1:.5,spike:i>=2,wing:[0,0,0,.35,.55,.75,.85,1,1,1.1][i],wcol:"#9ED0A6",hcol:"#F1E6C8",eyec:"#F2C230",slit:1,closed:i===1,acc:{}}),V);
   if(i>=5&&b!=="b")o=mx(o,{bel:"#C9CDB0",spcol:"#8FE0E8",hcol:"#B8C4C8",acc:ac(i,[[6,"armor","#8E9AA0"],[7,"tumar","#E8B923"],[8,"crown","#F2C230"],[9,"aura","#8FE0E8"]])});
   if(i>=5&&b==="b")o=mx(o,{bone:o.col,col:"#F4F1EA",bel:"#FFF6D8",spcol:"#F2C230",hcol:"#F2C230",mark:i>=9?"#FFE27A":0,acc:ac(i,[[6,"scarf","#F2C230"],[8,"crown","#F2C230"],[9,"aura","#FFD34D"]])});
   return {f:bQuad(o),env:i>=5&&b==="b"?(i===9?"dawn":"steppe"):(i===9?"dawn":"high"),ex:{},sc:.78+.07*i,fly:i>=4};},
 manas:function(i){var H=function(a,c){return bHum(mx({a:a},c));};
   var C=[{},{coat:"#6B8E4E",trim:"#E8D5A8",hat:"kalpak",hand:"whip"},{coat:"#2C5D8F",trim:"#E8D5A8",hat:"kalpak",hand:"rock",pose:"up"},{coat:"#2C5D8F",trim:"#E8D5A8",hat:"kalpak"},
     {coat:"#2C5D8F",trim:"#E8B923",hat:"kalpak",hand:"bow",off:"quiver"},{coat:"#1F4E8C",trim:"#E8B923",emb:"#E8B923",hat:"batyr",hand:"spear",off:"quiver",cape:"#7A1F2B"},
     {armor:"#9AA4AE",trim:"#B3202B",coat:"#9AA4AE",hat:"batyr",hand:"spear",off:"shield",cape:"#B3202B",beard:DARK},{coat:"#B3202B",trim:"#E8B923",emb:"#E8B923",fur:1,hat:"batyr",hand:"spear",off:"shield",cape:"#1F4E8C",beard:DARK},
     {armor:"#C9D3DD",trim:"#E8B923",coat:"#C9D3DD",hat:"batyr",hatc:"#C9D3DD",hand:"bigspear",off:"shield",cape:"#B3202B",beard:DARK},
     {armor:"#E8B923",olpok:1,trim:"#FFD34D",coat:"#B3202B",hat:"gold",hand:"bigspear",off:"shield",cape:"#E8B923",beard:DARK,aura:"#FFD34D"}];
   var horse=function(a){return bQuad(mx(BODY.horse,{a:a,col:"#F2EEE4",bel:"#FFFFFF",mane:"#8A6A4A"}));};
   if(i===0)return {f:bCradle(),env:"inside",ex:{},sc:1.3,cradle:1};
   var A1=[0,.15,.3,.35,.55,.75,.88,1,1,1][i];
   if(i===3||i===8||i===9)return {f:bRide(horse(i===3?.75:1),H(A1,C[i])),env:i===9?"dawn":"steppe",ex:i===8?{yurts:1}:{yurt:1},sc:i===9?1.15:1.05};
   return {f:H(A1,C[i]),env:i===4?"dawn":"steppe",ex:i===1?{yurt:1,sheep:1}:{yurt:1},sc:1.1};},
 oji:function(i,b,v){var V=vcol(vr("oji",v)),base=mx({coat:"#5E7F9A",trim:"#E8D5A8",hat:"kalpak",beard:"#5A3A22",hair:"#5A3A22",belly:1,lid:1},V),fur=mx(base,{coat:"#7A1F2B",trim:"#E8B923",fur:1});
   var O=function(){if(i<4)return base;var o=fur;if(i>=5&&b!=="b")o=mx(o,{hat:"tebetei",coat:i>=7?"#5A4A2A":"#6A4A2A",trim:"#C97A3A",fur:1,furc:"#C97A3A",glove:1,lid:i<6});
     if(i>=5&&b==="b")o=mx(o,{coat:i>=7?"#3E3A7A":"#2E5E8A",trim:"#E8B923",emb:"#E8B923",fur:0,lid:i<6});
     if(i>=8)o=mx(o,{beard:"#D8D8D8",hair:"#D8D8D8"});return o;};
   if(i===0)return {f:bHum(mx(base,{hat:"none",coat:"#9FB7C9",trim:"#E8EEF4",sleep:1,lid:0})),env:"inside",ex:{},sc:1,sleepy:1};
   if(i===1)return {f:bHum(mx(base,{pose:"up"})),env:"dawn",ex:{yurt:1},sc:1,sleepy:1};
   if(i===2)return {f:bHum(mx(base,{hand:"whip"})),env:"steppe",ex:{yurt:1,sheep:1},sc:1,yawn:1};
   if(i===3)return {f:bRide(bQuad(mx(BODY.horse,{a:1,col:"#8A5A2B",bel:"#A8784A",mane:DARK})),bHum(base)),env:"steppe",ex:{yurt:1},sc:1.05,yawn:1};
   if(i===4)return {f:bHum(mx(O(),{lid:0})),env:"steppe",ex:{yurt:1},sc:1};
   if(b!=="b"){var eg=i===5?bBird({a:.1,fuzz:1,col:"#F4F1EA"}):bBird({a:.8,col:"#6E4A22",bel:"#9A6A3A",head:"#D8A24A",hood:i===6,acc:i>=8?{tumar:"#E8B923"}:{}});
     var man=bHum(mx(O(),{bird:1,aura:i===9?"#FFD34D":null}));var lh=man.R.arms[1].h;eg.root.u=i===5?.5:.45;eg.root.p=[0,.02,.02];A(lh,eg.root);man.R.pet=eg.R;
     if(i===7){var h7=bRide(bQuad(mx(BODY.horse,{a:1,col:"#5A3A22",bel:"#7A5A3A",mane:DARK})),man);return {f:h7,env:"high",ex:{},sc:1.05};}
     return {f:man,env:i===9?"dawn":"high",ex:{},sc:1};}
   var akyn=bHum(mx(O(),{komuz:i<8,pose:i>=8?"up":null,aura:i===9?"#B39DDB":null}));akyn.R.notes=i>=6;
   return {f:akyn,env:i===7?"night":"steppe",ex:i===7?{fire:1,yurt:1}:{yurt:1},sc:1};}
};
function g3Spec(k,i,b,v){var f=SPEC[k]||SPEC.dog;var s=f(i,b||"a",v||0);s.k=k;s.i=i;s.v=v||0;return s;}

/* ---------------- 描画の1画面ぶん（View） ---------------- */
var VIEWS=[],RAF=0,LAST=0;
function View(cv,mode){
  var gl=cv.getContext("webgl",{antialias:true,alpha:true,premultipliedAlpha:true})||cv.getContext("experimental-webgl");if(!gl)throw new Error("no webgl");
  this.cv=cv;this.gl=gl;this.mode=mode;this.P=prog(gl,VS,FS);this.Q=prog(gl,PVS,PFS);this.geo={};this.pb=gl.createBuffer();
  this.parts=[];this.t=0;this.yaw=-.9;this.pitch=.3;this.dist=4;this.tgt=[0,.6,0];this.idle=0;this.em=0;
  this.st={x:0,z:0,y:0,hd:-.6,mode:"idle",tm:1.2,w:0,ph:0,act:0,spin:0,sq:1};
  var self=this;this.lost=false;
  cv.addEventListener("webglcontextlost",function(e){e.preventDefault();self.lost=true;if(self.onlost)self.onlost();},false);
  VIEWS.push(this);if(!RAF){LAST=0;RAF=requestAnimationFrame(loop);}
}
View.prototype.g=function(key){var G=this.geo[key];if(G)return G;var gl=this.gl,d=geoData(key);G={v:gl.createBuffer(),i:gl.createBuffer(),n:d.i.length};
  var arr=new Float32Array(d.p.length*2);for(var k=0;k<d.p.length/3;k++){arr[k*6]=d.p[k*3];arr[k*6+1]=d.p[k*3+1];arr[k*6+2]=d.p[k*3+2];arr[k*6+3]=d.n[k*3];arr[k*6+4]=d.n[k*3+1];arr[k*6+5]=d.n[k*3+2];}
  gl.bindBuffer(gl.ARRAY_BUFFER,G.v);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,G.i);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(d.i),gl.STATIC_DRAW);
  this.geo[key]=G;return G;};
View.prototype.setEnv=function(name,ex){this.envName=name;this.envList=null;this.bk=null;this.E=ENV[name]||ENV.steppe;this.env=buildEnv(name,ex);this.envParts();
  if(this.mode==="page"&&this.cv.parentNode)this.cv.parentNode.style.background=this.E.sky;};
View.prototype.envParts=function(){var E=this.E;this.parts=this.parts.filter(function(p){return p.keep;});
  if(E.stars)for(var k=0;k<90;k++){var a=Math.random()*Math.PI*2,e=rnd(.15,1.2),r=20;this.parts.push({p:[Math.cos(a)*Math.cos(e)*r,Math.sin(e)*r,Math.sin(a)*Math.cos(e)*r],v:[0,0,0],c:[1,.97,.85],s:rnd(.6,1.6),l:1e9,m:1e9,tw:rnd(0,6),env:1});}
  if(E.snow)for(k=0;k<70;k++)this.parts.push({p:[rnd(-6,6),rnd(0,6),rnd(-6,6)],v:[rnd(-.1,.1),-rnd(.3,.6),rnd(-.1,.1)],c:[1,1,1],s:rnd(.05,.09),l:1e9,m:1e9,snow:1,env:1});};
function fitPet(o,spec){o.spec=spec;o.F=spec.f;o.R=spec.f.R;o.sc=spec.sc||1;
  /* 高さを測る */
  var ymax=.3,root=o.F.root;root.p=[0,0,0];root.r=[0,0,0];root.u=o.sc;
  (function w(n,W){var M=mul(W,trs(n.p,n.r,n.u));if(n.g){var ey=Math.hypot(M[1]*n.s[0],M[5]*n.s[1],M[9]*n.s[2]);ymax=Math.max(ymax,M[13]+ey);}n.k.forEach(function(c){w(c,M);});})(root,trs([0,0,0],[0,0,0],1));
  o.h=ymax;return o;}
View.prototype.setChar=function(spec){fitPet(this,spec);};
/* 牧場：いま育てていない仲間も同じ場所に置く */
View.prototype.addPet=function(spec,x,z){var o=fitPet({sq:1,st:{x:x,z:z,hx:x,hz:z,y:0,hd:rnd(-3,3),mode:"idle",tm:rnd(.5,3),w:0,ph:0,act:0,spin:0}},spec);(this.others=this.others||[]).push(o);return o;};
View.prototype.pets=function(){return [this].concat(this.others||[]);};
View.prototype.burst=function(kind,at,n,pp){var cols={heart:[[1,.45,.65]],gold:[[1,.85,.35],[1,1,.8]],white:[[1,1,1],[1,.95,.8]],note:[[.75,.62,1],[1,.85,.35]],zz:[[.85,.9,1]],aura:[hx((pp||this).R.aura||"#FFD34D")],spark:[[1,.6,.2],[1,.85,.3]]}[kind]||[[1,1,1]];
  for(var k=0;k<(n||12);k++){var c=cols[k%cols.length],a=Math.random()*Math.PI*2,sp;
    if(kind==="heart"||kind==="zz"||kind==="note")this.parts.push({p:[at[0]+rnd(-.2,.2),at[1],at[2]+rnd(-.2,.2)],v:[rnd(-.15,.15),rnd(.5,.9),rnd(-.15,.15)],c:c,s:kind==="heart"?rnd(.16,.24):rnd(.12,.18),l:0,m:rnd(1.2,2),wig:kind!=="heart"});
    else{sp=rnd(.8,2.4);var e=rnd(-.4,1.2);this.parts.push({p:at.slice(),v:[Math.cos(a)*Math.cos(e)*sp,Math.sin(e)*sp,Math.sin(a)*Math.cos(e)*sp],c:c,s:rnd(.1,.22),l:0,m:rnd(.6,1.3),g:1});}}};
View.prototype.pick=function(px,py){/* 画面の点 → 仲間に当たったか／地面のどこか */
  var cv=this.cv,W=cv.clientWidth,H=cv.clientHeight,x=px/W*2-1,y=1-py/H*2,p=this.VP,best=null,bw=1e9;
  this.pets().forEach(function(o){var st=o.st,c=[st.x,st.y+o.h*.5,st.z],cw=p[3]*c[0]+p[7]*c[1]+p[11]*c[2]+p[15];if(cw<=0)return;
    var cx=(p[0]*c[0]+p[4]*c[1]+p[8]*c[2]+p[12])/cw,cy=(p[1]*c[0]+p[5]*c[1]+p[9]*c[2]+p[13])/cw,rad=Math.max(.12,o.h*.55*p[5]/cw);
    if(Math.hypot((x-cx)*W/H,y-cy)<rad&&cw<bw){bw=cw;best=o;}});
  if(best)return {hit:best};
  var e=this.eye,f=nrm(sub(this.tgt,e)),r=nrm(crs(f,[0,1,0])),u=crs(r,f),t=Math.tan(this.fov/2),d=nrm([f[0]+r[0]*x*t*W/H+u[0]*y*t,f[1]+r[1]*x*t*W/H+u[1]*y*t,f[2]+r[2]*x*t*W/H+u[2]*y*t]);
  if(d[1]<-.01){var k=-e[1]/d[1];return {g:[e[0]+d[0]*k,e[2]+d[2]*k]};}return {};};
View.prototype.react=function(o){o=o||this;var st=o.st,sp=o.spec;if(sp.cradle||sp.egg){st.mode="jump";st.act=0;this.burst("heart",[st.x,o.h*.9,st.z],8);return;}
  if(sp.fly&&Math.random()<.5&&st.mode!=="fly"){st.mode="fly";st.act=0;st.fa=Math.atan2(st.z,st.x);this.burst("gold",[st.x,o.h*.6,st.z],14);return;}
  st.mode="jump";st.act=0;st.spin=(sp.i>=5&&Math.random()<.6)?1:0;this.burst("heart",[st.x,o.h*1.05,st.z],9);
  if(sp.i>=5)this.burst(o.R.aura?"aura":"gold",[st.x,o.h*.6,st.z],10,o);};
/* ふだんのしぐさを選ぶ */
function pickIdle(R,sp){var L;
  if(R.t==="hum"||R.rider&&R.t==="quad"){L=["look","look","stretch","wave",""];if(sp.sleepy||sp.yawn)L=L.concat(["yawn","yawn","yawn"]);}
  else if(R.t==="quad"){L=["sniff","look","wag",""];if(!R.o.rab&&!R.o.hoof)L.push("sit","sit");if(R.wings.length)L.push("stretch");if(R.o.hoof)L.push("sniff");}
  else L=["look",""];
  return L[Math.floor(Math.random()*L.length)];}
/* 1こま分の動き */
View.prototype.step=function(dt,p){p=p||this;var main=p===this,st=p.st,sp=p.spec,R=p.R,t=this.t,self=this;
  var still=sp.cradle||sp.egg||this.mode==="evo";
  st.tm-=dt;
  if(st.mode==="idle"&&st.tm<=0&&!still){var r0=(sp.slow?1.6:2.4)*(st.hx!=null?.6:1),a=Math.random()*Math.PI*2,d=rnd(.6,r0);st.tx=(st.hx||0)+Math.cos(a)*d;st.tz=(st.hz||0)+Math.sin(a)*d;st.mode="walk";
    if(this.env&&this.env.ranch){var wr=Math.hypot(st.tx,st.tz);if(wr>4.5){st.tx*=4.5/wr;st.tz*=4.5/wr;}}
    if(sp.fly&&Math.random()<.18){st.mode="fly";st.act=0;st.fa=Math.atan2(st.z,st.x);}}
  if(st.mode==="idle"&&st.tm<=0&&still&&this.mode!=="evo"){st.mode="jump";st.act=0;st.tm=rnd(3,6);}
  if(st.mode==="walk"){var dx=st.tx-st.x,dz=st.tz-st.z,dd=Math.hypot(dx,dz),spd=(sp.slow?.35:sp.sleepy?.25:.55)*Math.sqrt(p.sc);
    var want=Math.atan2(-dz,dx),df=((want-st.hd+Math.PI*3)%(Math.PI*2))-Math.PI;st.hd+=clamp(df,-4*dt,4*dt);
    if(Math.abs(df)<1){st.x+=Math.cos(st.hd)*spd*dt;st.z-=Math.sin(st.hd)*spd*dt;}
    st.w=Math.min(1,st.w+dt*3);if(dd<.08){st.mode="idle";st.tm=rnd(3,7);if(Math.random()<.25){st.mode="jump";st.act=0;st.spin=sp.i>=5?1:0;}}}
  else st.w=Math.max(0,st.w-dt*3);
  st.y=0;
  if(st.mode==="jump"){st.act+=dt;var T=.75,q=st.act/T;st.y=Math.sin(Math.min(1,q)*Math.PI)*(.25+.1*p.sc);if(q>=1){st.mode="idle";st.tm=rnd(1,3);st.spin=0;}}
  if(st.mode==="fly"){st.act+=dt;var FT=8,fq=st.act/FT,alt=(.9+.6*p.sc)*Math.sin(Math.min(1,fq)*Math.PI)*1.25;st.fa+=dt*.7;var fr=2.1;
    var tx=Math.cos(st.fa)*fr,tz=Math.sin(st.fa)*fr;st.hd=Math.atan2(-(tz-st.z),tx-st.x);st.x=lerp(st.x,tx,Math.min(1,dt*1.5));st.z=lerp(st.z,tz,Math.min(1,dt*1.5));st.y=Math.max(0,alt);
    if(fq>=1){st.mode="idle";st.tm=rnd(2,4);st.y=0;}}
  if(sp.hop)st.y+=Math.abs(Math.sin(st.ph))*.12*st.w*p.sc;
  st.ph+=dt*(5+3*st.w)*st.w*(sp.slow?.7:1);
  var fly=st.mode==="fly"?Math.min(1,Math.min(st.act,FT-st.act)/.6):0;
  /* ふだんの小さなしぐさ：においをかぐ（草を食べる）・すわる・見まわす・しっぽをふる・のび・あくび・手をふる */
  var aw=st.aw||(st.aw={sniff:0,sit:0,look:0,wag:0,stretch:0,yawn:0,wave:0});
  if(st.mode==="idle"&&!still){st.it=(st.it==null?rnd(.4,1.5):st.it)-dt;if(st.it<=0){st.ia=pickIdle(R,sp);st.it=rnd(2.2,4.2);}}else{st.ia="";st.it=rnd(.5,1.2);}
  for(var key in aw)aw[key]=lerp(aw[key],st.ia===key?1:0,Math.min(1,dt*3));
  /* まばたき */
  st.bt=(st.bt==null?rnd(1,4):st.bt)-dt;if(st.bt<=0)st.bt=rnd(2,5.5);var bl=st.bt<.15?Math.sin(st.bt/.15*Math.PI):0;bl=Math.max(bl,aw.yawn*.95);
  if(R.eyes)R.eyes.forEach(function(e){e.n.s[1]=e.y*(1-.9*bl);});
  /* からだの各部分 */
  var B=R.body,breath=Math.sin(t*2.2)*.006,w=st.w,ph=st.ph;
  if(R.t==="quad"){var sit=(R.o.rab||R.o.hoof||R.rider)?0:aw.sit;
    B.p[1]=R.by+(sp.hop?0:Math.abs(Math.sin(ph))*.022*w)+breath-sit*R.by*.42;B.r[2]=-.15*fly+sit*.45;B.r[0]=Math.sin(ph)*.03*w;
    R.legs.forEach(function(l){var s0=Math.sin(ph+l.ph),lift=Math.max(0,Math.sin(ph+l.ph+1.3));
      if(sp.hop){l.n.r[2]=(l.fr?-.4:.5)*Math.abs(Math.sin(ph))*w+(l.fr?-.6:.6)*fly;if(l.k)l.k.r[2]=-.4*Math.abs(Math.sin(ph))*w;return;}
      if(l.fr){l.n.r[2]=s0*.5*w-.6*fly-sit*.5;if(l.k)l.k.r[2]=-lift*.95*w-.5*fly;}
      else{l.n.r[2]=s0*.45*w+.6*fly+sit*1.25;if(l.k)l.k.r[2]=lift*.5*w+.4*fly-sit*2.5;}});
    if(R.neck){var lk=Math.sin(t*.9)*.75*aw.look+Math.sin(t*.43)*.18*(1-w);
      R.neck.r=[0,lk,-aw.sniff*.95+Math.sin(ph*2)*.05*w-sit*.15];
      R.head.r=[Math.sin(t*1.1)*.08*aw.look,0,aw.sniff*.4+Math.sin(t*14)*.035*aw.sniff+(st.mode==="jump"?.18:0)];}}
  if(R.t==="bird"){B.p[1]=R.by+breath;R.legs.forEach(function(l){l.n.r[2]=sp.hop?-.5*Math.abs(Math.sin(ph))*w-.6*fly:Math.sin(ph+l.ph)*.6*w;});}
  if(R.t==="hum"&&!R.seated){B.p[1]=R.by+Math.abs(Math.sin(ph))*.015*w+breath;
    R.legs.forEach(function(l){var s0=Math.sin(ph+l.ph);l.n.r[2]=s0*.45*w;if(l.k)l.k.r[2]=-Math.max(0,-Math.cos(ph+l.ph))*.75*w;});}
  if(R.t==="hum"||(R.rider)){var H2=R.t==="hum"?R:R.rider,yw=aw.yawn,stv=aw.stretch;
    H2.arms.forEach(function(x,ix){var sw=Math.sin(ph+(x.sd>0?Math.PI:0))*.45*w,z,el,xr=-x.sd*.1;
      if(x.up){z=2.7+Math.sin(t*3+ix)*.12;el=.1;}
      else if(x.hold){z=.75+Math.sin(t*2)*.04;el=1.25;}
      else{z=(H2.seated?.45:sw)+.04;el=.22+(H2.seated?.6:0)+Math.max(0,sw)*.5;
        var up2=Math.max(stv,yw*.9);if(up2>.01){z=lerp(z,2.9,up2);el=lerp(el,.12,up2);xr=lerp(xr,-x.sd*.35,up2);}
        if(ix===0&&aw.wave>.01){z=lerp(z,2.5,aw.wave);el=lerp(el,.55+Math.sin(t*9)*.45,aw.wave);xr=lerp(xr,-x.sd*.3,aw.wave);}
        if(ix===0&&st.mode==="jump")z=Math.max(z,2.4);}
      x.n.r=[xr,0,z];if(x.e)x.e.r=[0,0,el];});
    if(H2.sleep)H2.head.r=[Math.sin(t*.7)*.1,0,-.25+Math.sin(t*.9)*.08];
    else H2.head.r=[Math.sin(t*.6)*.04*(H2.lid?1:0),Math.sin(t*.8)*.65*aw.look+Math.sin(t*.37)*.12*(1-w),yw*.35-(H2.lid?.08:0)];
    if(H2.mouthS)H2.mouthS.s[1]=H2.mouthY*(1+yw*4);
    if(H2.cape)H2.cape.r[2]=-.1-.25*w-Math.sin(t*3.1)*.05;}
  if(R.cape&&R.t==="quad")R.cape.r[0]=Math.sin(t*3)*.03;
  if(R.head&&R.t==="bird"){var lb=Math.sin(t*.6)*.35*(1-w)+(Math.sin(t*1.7)>.9?.4:0);R.head.r=[0,lb,Math.sin(t*1.4)*.05+.28+(st.mode==="jump"?.15:0)];}
  var wag=Math.min(1,aw.wag+(st.mode==="jump"?1:0)+(main&&self.foc===p?0:0));
  R.tail.forEach(function(n,ix){var f2=sp.k==="dog"?(3+10*wag):(2.5+4*wag);n.r[0]=Math.sin(t*f2-ix*.55)*(.12+.4*wag)+Math.sin(ph-ix*.5)*.1*w;});
  R.ears.forEach(function(e,ix){e.r[1]=Math.sin(t*1.7+ix*2)*.06+(Math.sin(t*.37+ix)>.97?.25:0);e.r[0]=(e.r0==null?(e.r0=e.r[0]):e.r0)+(Math.sin(t*.53+ix*1.3)>.985?.25:0)+aw.sniff*.1*(ix?1:-1);});
  R.wings.forEach(function(wg){var sd=wg.sd,fl=Math.sin(t*(R.t==="bird"?9:7));
    if(R.t==="bird"){var rest=[sd*(wg.fold||1.35),-sd*(wg.sweep||.3),0],fy=[-sd*(.05+.75*fl),-sd*.1,0];wg.n.r=[lerp(rest[0],fy[0],fly),lerp(rest[1],fy[1],fly),0];}
    else{var r1=[-sd*(1.1+Math.sin(t*1.3)*.08+aw.stretch*.5),-sd*.85,0],r2=[-sd*(.1+.7*fl),-sd*.15,0];wg.n.r=[lerp(r1[0],r2[0],fly),lerp(r1[1],r2[1],fly),0];}});
  if(R.pet&&R.pet.wings)R.pet.wings.forEach(function(wg){wg.n.r=[wg.sd*(wg.fold||1.35)+Math.sin(t*2)*.05,-wg.sd*(wg.sweep||.3),0];});
  if(sp.cradle)B.r[0]=Math.sin(t*1.6)*.14;
  if(sp.egg){B.r[2]=Math.sin(t*7)*.12*Math.max(0,Math.sin(t*.9));}
  /* 置く */
  var root=p.F.root,j=st.mode==="jump"?st.act/.75:0;root.p=[st.x,st.y,st.z];root.r=[0,st.hd+(st.spin?Math.PI*2*Math.min(1,j):0),0];
  root.u=p.sc*(p.sq||1);
  /* 粒を出す */
  p.emit=(p.emit||0)-dt;if(p.emit<=0){p.emit=.35;
    if(R.aura&&this.mode==="page")this.parts.push({p:[st.x+rnd(-.5,.5)*p.sc,st.y+rnd(0,p.h),st.z+rnd(-.5,.5)*p.sc],v:[0,rnd(.2,.4),0],c:hx(R.aura),s:rnd(.08,.14),l:0,m:1.4});
    if(sp.sleepy&&Math.random()<.4)this.burst("zz",[st.x+.15,p.h*1.0,st.z],1,p);
    var hm=R.t==="hum"?R:R.rider;if(hm&&hm.notes&&Math.random()<.5)this.burst("note",[st.x+.2,p.h*.9,st.z],1,p);
    if(main&&this.env&&this.env.fire)this.parts.push({p:[1.1+rnd(-.05,.05),.25,.5],v:[rnd(-.1,.1),rnd(.6,1),rnd(-.1,.1)],c:[1,.55,.2],s:rnd(.05,.09),l:0,m:.9});}
  if(main&&this.env&&this.env.fire)this.env.fire.flames.forEach(function(f,ix){f.s=[f.s[0],(ix?.2:.3)*(1+Math.sin(t*12+ix)*.15),f.s[2]];});
};
/* 描画 */
View.prototype.render=function(){var gl=this.gl,cv=this.cv,dpr=Math.min(window.devicePixelRatio||1,this.lowq?1.25:2),W=Math.max(1,Math.round(cv.clientWidth*dpr)),H=Math.max(1,Math.round(cv.clientHeight*dpr));
  if(cv.width!==W||cv.height!==H){cv.width=W;cv.height=H;}gl.viewport(0,0,W,H);
  var E=this.E,fo=(this.foc&&this.pets().indexOf(this.foc)>=0)?this.foc:this,st=fo.st;
  /* カメラ（見ている仲間を追う） */
  var ty=st.y+fo.h*(this.mode==="evo"?.5:.45),k=Math.min(1,(this.dt||.016)*3);
  this.tgt=[lerp(this.tgt[0],st.x,k),lerp(this.tgt[1],ty,k),lerp(this.tgt[2],st.z,k)];
  var d=this.dist,cp=Math.cos(this.pitch),e=[this.tgt[0]+d*cp*Math.cos(this.yaw),this.tgt[1]+d*Math.sin(this.pitch),this.tgt[2]+d*cp*Math.sin(this.yaw)];
  if(E.inside){var rr=Math.hypot(e[0],e[2]);if(rr>4.2){e[0]*=4.2/rr;e[2]*=4.2/rr;}e[1]=Math.min(e[1],2.6);}
  if(!E.inside&&!E.stage){var er=Math.hypot(e[0],e[2]),cm=this.env&&this.env.ranch?5.7:9.5;if(er>cm){e[0]*=cm/er;e[2]*=cm/er;}}
  if(e[1]<.15)e[1]=.15;this.eye=e;this.fov=.72;
  this.VP=mul(persp(this.fov,W/H,.1,80),look(e,this.tgt));
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);gl.enable(gl.DEPTH_TEST);gl.depthMask(true);
  var P=this.P,u=P.u;gl.useProgram(P.p);
  gl.uniformMatrix4fv(u.uVP,false,this.VP);gl.uniform3fv(u.uL,nrm(E.L));gl.uniform3fv(u.uE,e);gl.uniform3fv(u.uSky,hx(E.sky3));gl.uniform3fv(u.uGnd,hx(E.gnd));
  gl.uniform3fv(u.uFog,hx(E.fog));gl.uniform3fv(u.uGlow,[1,.97,.86]);gl.uniform1f(u.uFd,E.stage?0:1);gl.uniform1f(u.uFn,E.inside?20:7);gl.uniform1f(u.uFf,E.inside?30:19);
  if(!this.bk&&!this.nobake&&this.env&&!this.env.fire&&!E.inside&&!E.stage&&this.mode==="page"){try{this.bk=bake(this,this.env);}catch(_){this.bk=null;this.nobake=1;}}
  var list=this.bk?[]:this.envList;if(!list){list=[];if(this.env)collect(this.env,trs([0,0,0],[0,0,0],1),list,0,0);if(this.env&&!this.env.fire)this.envList=list;}var self=this,pets=this.pets(),cl=[],I=trs([0,0,0],[0,0,0],1);
  pets.forEach(function(o){var n0=cl.length;collect(o.F.root,I,cl,o===self?self.em:0,1);
    /* 遠くの仲間・重いときは輪郭線を省く */
    if(o!==fo&&(self.lowq||Math.hypot(o.st.x-self.eye[0],o.st.z-self.eye[2])>7))for(var q=n0;q<cl.length;q++)cl[q].ol=0;});
  gl.enable(gl.CULL_FACE);gl.disable(gl.BLEND);
  if(this.bk)this.drawBake();
  list.forEach(function(x){if(x.inner)gl.disable(gl.CULL_FACE);self.draw(x,0,0);if(x.inner)gl.enable(gl.CULL_FACE);});
  /* 影 */
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.depthMask(false);
  pets.forEach(function(o){var s2=o.st,sr=(o.R.L+o.R.bR)*1.1*o.sc*(1-Math.min(.6,s2.y*.3));
    self.draw({g:"tube:1",c:[.1,.08,.15],mm:mul(trs([s2.x,.012,s2.z],[0,s2.hd,0],1),new Float32Array([sr*1.1,0,0,0,0,.004,0,0,0,0,sr*.75,0,0,0,0,1])),nm:new Float32Array([1,0,0,0,1,0,0,0,1]),em:0,al:E.stage?0:.18},0,1);});
  gl.depthMask(true);gl.disable(gl.BLEND);
  /* 輪郭線 → 本体 */
  gl.cullFace(gl.FRONT);var ow=.011*Math.max(.8,this.sc)*(this.mode==="evo"?1.2:1);cl.forEach(function(x){if(x.ol&&x.al>.9)self.draw(x,ow,0);});
  gl.cullFace(gl.BACK);cl.forEach(function(x){if(x.al<1){gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);}self.draw(x,0,0);if(x.al<1)gl.disable(gl.BLEND);});
  this.drawParts();};
function collect(n,W,list,em,ch){var M=mul(W,trs(n.p,n.r,n.u));
  if(n.g){var s=n.s,mm=new Float32Array(M),nm=new Float32Array(9);for(var c=0;c<3;c++){for(var r=0;r<3;r++){mm[c*4+r]=M[c*4+r]*s[c];nm[c*3+r]=M[c*4+r]/(s[c]||1);}}
    list.push({g:n.g,c:n.c||[.5,.5,.5],mm:mm,nm:nm,em:Math.max(n.em,em),ol:ch&&n.ol,al:n.al,inner:n.inner});}
  for(var i=0;i<n.k.length;i++)collect(n.k[i],M,list,em,ch);}
View.prototype.draw=function(x,out,flat){var gl=this.gl,P=this.P,u=P.u,G=this.g(x.g);
  gl.bindBuffer(gl.ARRAY_BUFFER,G.v);gl.enableVertexAttribArray(P.a.aP);gl.vertexAttribPointer(P.a.aP,3,gl.FLOAT,false,24,0);gl.enableVertexAttribArray(P.a.aN);gl.vertexAttribPointer(P.a.aN,3,gl.FLOAT,false,24,12);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,G.i);gl.uniformMatrix4fv(u.uM,false,x.mm);gl.uniformMatrix3fv(u.uNm,false,x.nm);
  gl.uniform1f(u.uOut,out);gl.uniform1f(u.uOf,out>0||flat?1:0);
  var oc=this.em>.3?[1,.92,.7]:(this.E.stage||this.E.stars?[.08,.06,.14]:[.16,.12,.14]);gl.uniform3fv(u.uC,out>0?oc:x.c);
  gl.uniform1f(u.uEm,x.em||0);gl.uniform1f(u.uA,x.al==null?1:x.al);gl.drawElements(gl.TRIANGLES,G.n,gl.UNSIGNED_SHORT,0);};
View.prototype.drawParts=function(){var gl=this.gl,Q=this.Q,ps=this.parts,dt=this.dt||.016,t=this.t;if(!ps.length)return;
  var out=[];for(var i=ps.length-1;i>=0;i--){var p=ps[i];p.l+=dt;if(p.l>p.m){ps.splice(i,1);continue;}
    if(p.g){p.v[1]-=dt*1.6;p.v[0]*=.985;p.v[2]*=.985;}if(p.in){p.v=[(p.to[0]-p.p[0])*2.2,(p.to[1]-p.p[1])*2.2,(p.to[2]-p.p[2])*2.2];}
    p.p[0]+=p.v[0]*dt+(p.wig?Math.sin(t*4+i)*.004:0);p.p[1]+=p.v[1]*dt;p.p[2]+=p.v[2]*dt;
    if(p.snow&&p.p[1]<0){p.p[1]=6;p.p[0]=rnd(-6,6);p.p[2]=rnd(-6,6);}
    var al=p.env?(p.tw!=null?.55+.45*Math.sin(t*2+p.tw):.9):Math.min(1,(1-p.l/p.m)*1.6);out.push(p.p[0],p.p[1],p.p[2],p.c[0],p.c[1],p.c[2],al,p.s*(p.env&&p.tw!=null?3:1));}
  var arr=new Float32Array(out);gl.useProgram(Q.p);gl.bindBuffer(gl.ARRAY_BUFFER,this.pb);gl.bufferData(gl.ARRAY_BUFFER,arr,gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(Q.a.aP);gl.vertexAttribPointer(Q.a.aP,3,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(Q.a.aC);gl.vertexAttribPointer(Q.a.aC,4,gl.FLOAT,false,32,12);
  gl.enableVertexAttribArray(Q.a.aS);gl.vertexAttribPointer(Q.a.aS,1,gl.FLOAT,false,32,28);
  gl.uniformMatrix4fv(Q.u.uVP,false,this.VP);gl.uniform1f(Q.u.uPx,this.cv.height/ (2*Math.tan(this.fov/2)));
  gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.depthMask(false);gl.drawArrays(gl.POINTS,0,arr.length/8);gl.depthMask(true);gl.disable(gl.BLEND);
  gl.disableVertexAttribArray(Q.a.aC);gl.disableVertexAttribArray(Q.a.aS);gl.useProgram(this.P.p);};
View.prototype.dispose=function(){var i=VIEWS.indexOf(this);if(i>=0)VIEWS.splice(i,1);this.dead=1;
  try{var ex=this.gl.getExtension("WEBGL_lose_context");if(ex)ex.loseContext();}catch(_){}if(this.cv&&this.cv.parentNode)this.cv.parentNode.removeChild(this.cv);};
function bake(v,env){var gl=v.gl,list=[],chunks=[],cur=null,cache={};collect(env,trs([0,0,0],[0,0,0],1),list,0,0);
  function flush(){if(!cur||!cur.i.length)return;var vb=gl.createBuffer(),ib=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,vb);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(cur.v),gl.STATIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(cur.i),gl.STATIC_DRAW);chunks.push({v:vb,i:ib,n:cur.i.length});cur=null;}
  list.forEach(function(x){var d=cache[x.g]||(cache[x.g]=geoData(x.g)),nv=d.p.length/3;if(!cur||cur.n+nv>65000){flush();cur={v:[],i:[],n:0};}
    var m=x.mm,q=x.nm,c=x.c,b=cur.n,V=cur.v;
    for(var k=0;k<nv;k++){var px=d.p[k*3],py=d.p[k*3+1],pz=d.p[k*3+2],nx=d.n[k*3],ny=d.n[k*3+1],nz=d.n[k*3+2];
      var ox=q[0]*nx+q[3]*ny+q[6]*nz,oy=q[1]*nx+q[4]*ny+q[7]*nz,oz=q[2]*nx+q[5]*ny+q[8]*nz,l=Math.hypot(ox,oy,oz)||1;
      V.push(m[0]*px+m[4]*py+m[8]*pz+m[12],m[1]*px+m[5]*py+m[9]*pz+m[13],m[2]*px+m[6]*py+m[10]*pz+m[14],ox/l,oy/l,oz/l,c[0],c[1],c[2],x.em||0);}
    for(k=0;k<d.i.length;k++)cur.i.push(d.i[k]+b);cur.n+=nv;});
  flush();return {ch:chunks,P:prog(gl,VSB,FSB),n:list.length};}
View.prototype.drawBake=function(){var gl=this.gl,K=this.bk,P=K.P,u=P.u,E=this.E;gl.useProgram(P.p);
  var U=function(n,f,v){if(u[n])gl[f](u[n],v);};gl.uniformMatrix4fv(u.uVP,false,this.VP);
  U("uL","uniform3fv",nrm(E.L));U("uE","uniform3fv",this.eye);U("uSky","uniform3fv",hx(E.sky3));U("uGnd","uniform3fv",hx(E.gnd));U("uFog","uniform3fv",hx(E.fog));U("uGlow","uniform3fv",[1,.97,.86]);
  U("uFd","uniform1f",1);U("uFn","uniform1f",7);U("uFf","uniform1f",19);
  K.ch.forEach(function(c){gl.bindBuffer(gl.ARRAY_BUFFER,c.v);gl.enableVertexAttribArray(P.a.aP);gl.vertexAttribPointer(P.a.aP,3,gl.FLOAT,false,40,0);
    gl.enableVertexAttribArray(P.a.aN);gl.vertexAttribPointer(P.a.aN,3,gl.FLOAT,false,40,12);gl.enableVertexAttribArray(P.a.aC);gl.vertexAttribPointer(P.a.aC,4,gl.FLOAT,false,40,24);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,c.i);gl.drawElements(gl.TRIANGLES,c.n,gl.UNSIGNED_SHORT,0);});
  gl.disableVertexAttribArray(P.a.aC);gl.useProgram(this.P.p);};
/* 仲間どうしが重ならないように少しずつ押しはなす */
function sep(ps){for(var i=0;i<ps.length;i++)for(var j=i+1;j<ps.length;j++){var a=ps[i].st,b=ps[j].st;if(a.mode==="fly"||b.mode==="fly")continue;
  var dx=b.x-a.x,dz=b.z-a.z,d=Math.hypot(dx,dz)||.01,r=(ps[i].R.L+ps[i].R.bR)*ps[i].sc+(ps[j].R.L+ps[j].R.bR)*ps[j].sc;
  if(d<r){var k=(r-d)*.08;a.x-=dx/d*k;a.z-=dz/d*k;b.x+=dx/d*k;b.z+=dz/d*k;}}}
function loop(ts){RAF=0;if(!VIEWS.length)return;var dt=LAST?Math.min(.05,(ts-LAST)/1000):.016;LAST=ts;
  if(!document.hidden)VIEWS.slice().forEach(function(v){if(v.dead||v.lost)return;try{v.dt=dt;v.t+=dt;if(v.tick)v.tick(dt);v.step(dt);if(v.others){v.others.forEach(function(o){v.step(dt,o);});sep(v.pets());}
    v.render();v.fa=(v.fa||.016)*.97+dt*.03;v.fn=(v.fn||0)+1;if(v.fn>90&&v.fa>.034&&!v.lowq){v.lowq=1;}}catch(e){v.lost=true;if(v.onlost)v.onlost();}});
  RAF=requestAnimationFrame(loop);}

/* ---------------- 育てる画面の3D ---------------- */
var PV=null;
function pageStage(){var K=pGrKind(),P=pGrPts(),G=pGrStage(pGrKP(K.id,P.p)),b=pGrBr(K.id),i=G.i;if(K.brAt&&i>=K.brAt&&!b)i=K.brAt-1;return {k:K.id,i:i,b:b||"a"};}
function vOf(k){var o=pGrSt().own[k];return o&&o.v||0;}
function nmOf(k){var o=pGrSt().own[k];return o&&o.nm||"";}
function mountPage(){unmountPage();if(!g3Ok())return;var hero=document.querySelector("#pgrpage .pgr-hero");if(!hero)return;
  var cv=document.createElement("canvas");cv.className="pgr-g3c";cv.setAttribute("aria-label","3Dの牧場。指でまわす・2本指で拡大・仲間をタップで反応");
  hero.classList.add("g3");hero.appendChild(cv);
  try{var v=new View(cv,"page"),s=pageStage(),sp=g3Spec(s.k,s.i,s.b,vOf(s.k));v.setChar(sp);
    var inside=sp.env==="inside";v.setEnv(sp.env,inside?sp.ex:mx(sp.ex,{ranch:1,yurt:0,yurts:0,sheep:0}));
    v.dist=clamp(v.h*1.55+1.15,1.8,inside?3.4:7);v.pitch=.28;v.yaw=-1.1;v.st.hd=.5;v.st.tm=1.5;
    v.onlost=function(){unmountPage();hero.classList.remove("g3");hero.style.background="";};
    /* 牧場：育てたことのある仲間を全員ならべる（育てていない仲間は、育ったところの姿で） */
    var S0=pGrSt(),T0=pGrPts().p,oth=PGR_ORDER.filter(function(id){return id!==s.k&&S0.own[id];});
    oth.forEach(function(id,ix){var K2=pGrKind(id),o2=S0.own[id],i2=pGrStage(pGrKP(id,T0)).i,b2=o2.br||null;if(K2.brAt&&i2>=K2.brAt&&!b2)i2=K2.brAt-1;
      var an=ix/Math.max(1,oth.length)*Math.PI*2+.6,rr=inside?2.4:2.5+(ix%2)*1.3;
      try{var pt=v.addPet(g3Spec(id,i2,b2||"a",o2.v||0),Math.cos(an)*rr,Math.sin(an)*rr);pt.kid=id;pt.ki=i2;}catch(_){}});
    v.kid=s.k;v.ki=s.i;if(oth.length){v.dgoal=v.dist;v.dist=Math.min(inside?3.8:10.5,v.dist+4+oth.length*.4);v.pitch=.42;}
    else if(!inside){v.dgoal=v.dist;v.dist=v.dist+3.5;v.pitch=.4;}
    var lab=document.createElement("div");lab.className="pgr-g3l";hero.appendChild(lab);
    v.showLab=function(o){o=o||v;var K3=pGrKind(o.kid),nm=nmOf(o.kid),V0=(VAR[o.kid]||[])[vOf(o.kid)];
      lab.innerHTML='<b>'+esc(nm||K3.name)+'</b>'+(nm?'<span>'+esc(K3.name)+'</span>':'')+' 第'+(o.ki+1)+'段階'+(o===v?'<i>育てています</i>':'<i>お休み中</i>')+
        '<small>'+(V0&&o.kid!=="manas"?esc(V0.n)+(v.others&&v.others.length?'　':''):'')+(v.others&&v.others.length?'牧場の仲間 '+(v.others.length+1):'')+'</small>';};
    v.showLab(v);
    input(v,cv);PV=v;
    var hint=document.createElement("div");hint.className="pgr-g3h";hint.textContent="指でまわす・2本指で拡大・仲間をタップ";hero.appendChild(hint);setTimeout(function(){hint.classList.add("off");},4500);
    /* 全画面で見る */
    var fb=document.createElement("button");fb.type="button";fb.className="pgr-g3fs";fb.setAttribute("aria-label","全画面で見る");fb.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
    hero.appendChild(fb);fb.addEventListener("click",function(e){e.stopPropagation();e.preventDefault();fsToggle(hero);});
  }catch(e){if(v)v.dispose();hero.classList.remove("g3");hero.style.background="";if(cv.parentNode)cv.parentNode.removeChild(cv);}}
/* 全画面：ページいっぱいに広げる（使える端末では本当の全画面にもする）。スマホを横にすると、その形いっぱいに大きく映る */
function fsToggle(hero,off){var on=!off&&!hero.classList.contains("fs");
  hero.classList.toggle("fs",on);document.body.classList.toggle("pgr-fs",on);
  var fb=hero.querySelector(".pgr-g3fs");if(fb){fb.setAttribute("aria-label",on?"全画面をやめる":"全画面で見る");fb.innerHTML=on?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>':'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';}
  try{if(on&&hero.requestFullscreen&&!document.fullscreenElement){var pr=hero.requestFullscreen({navigationUI:"hide"});if(pr&&pr.then)pr.then(function(){try{screen.orientation&&screen.orientation.lock&&screen.orientation.lock("landscape").catch(function(){});}catch(_){}}).catch(function(){});}
    else if(!on&&document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});}catch(_){}
  if(on){var h=hero.querySelector(".pgr-g3h");if(h){h.textContent="スマホを横にすると大きく見えます・右上の×でもどる";h.classList.remove("off");setTimeout(function(){h.classList.add("off");},4000);}}}
document.addEventListener("fullscreenchange",function(){if(!document.fullscreenElement){var h=document.querySelector("#pgrpage .pgr-hero.fs");if(h)fsToggle(h,1);}});
document.addEventListener("keydown",function(e){if(e.key==="Escape"){var h=document.querySelector("#pgrpage .pgr-hero.fs");if(h){e.stopPropagation();fsToggle(h,1);}}},true);
function unmountPage(){if(PV){PV.dispose();PV=null;}document.body.classList.remove("pgr-fs");try{if(document.fullscreenElement&&document.exitFullscreen)document.exitFullscreen().catch(function(){});}catch(_){}}
function input(v,cv){var pts={},start=null,pd=0,moved=0;
  function cnt(){return Object.keys(pts).length;}
  cv.addEventListener("pointerdown",function(e){pts[e.pointerId]=[e.clientX,e.clientY];try{cv.setPointerCapture(e.pointerId);}catch(_){}
    if(cnt()===1){start={x:e.clientX,y:e.clientY,t:Date.now()};moved=0;}else start=null;
    v.dgoal=0;if(cnt()===2){var a=Object.keys(pts).map(function(k){return pts[k];});pd=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);}v.idle=0;});
  cv.addEventListener("pointermove",function(e){if(!pts[e.pointerId])return;var o=pts[e.pointerId];pts[e.pointerId]=[e.clientX,e.clientY];
    if(cnt()===1){var dx=e.clientX-o[0],dy=e.clientY-o[1];if(start&&Math.hypot(e.clientX-start.x,e.clientY-start.y)>8)moved=1;if(moved){v.yaw+=dx*.009;v.pitch=clamp(v.pitch+dy*.006,.04,1.25);}}
    else if(cnt()===2){var a=Object.keys(pts).map(function(k){return pts[k];}),d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);if(pd>0)v.dist=clamp(v.dist*pd/d,1.4,v.E&&v.E.inside?3.8:11);pd=d;moved=1;}v.idle=0;});
  function up(e){var had=pts[e.pointerId];delete pts[e.pointerId];if(!had)return;
    if(start&&!moved&&Date.now()-start.t<450&&cnt()===0){var r=cv.getBoundingClientRect(),hit=v.pick(e.clientX-r.left,e.clientY-r.top);
      var fo=v.foc||v;
      if(hit.hit){v.react(hit.hit);v.foc=hit.hit;if(v.showLab)v.showLab(hit.hit);v.dgoal=clamp(hit.hit.h*1.55+1.15,1.8,v.E&&v.E.inside?3.4:7);v.t=Math.max(v.t,1.7);}
      else if(hit.g&&!fo.spec.cradle&&!fo.spec.egg&&fo.st.mode!=="fly"){var gx=hit.g[0],gz=hit.g[1],gr=Math.hypot(gx,gz);if(gr>4.2){gx*=4.2/gr;gz*=4.2/gr;}fo.st.tx=gx;fo.st.tz=gz;fo.st.mode="walk";
        v.parts.push({p:[gx,.05,gz],v:[0,.3,0],c:[1,1,1],s:.18,l:0,m:.6});}}
    start=null;}
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  cv.addEventListener("wheel",function(e){e.preventDefault();v.dgoal=0;v.dist=clamp(v.dist*(e.deltaY>0?1.1:.9),1.4,v.E&&v.E.inside?3.8:11);},{passive:false});
  v.tick=function(dt){v.idle+=dt;if(v.idle>5)v.yaw+=dt*.08;
    if(v.dgoal&&v.t>1.6){v.dist=lerp(v.dist,v.dgoal,Math.min(1,dt*1.1));v.pitch=lerp(v.pitch,.28,Math.min(1,dt*1.1));if(Math.abs(v.dist-v.dgoal)<.02)v.dgoal=0;}};}

/* ---------------- 進化の演出の3D ---------------- */
var EV=null;
function mountEvo(){unmountEvo();if(!g3Ok())return;var m=document.getElementById("pgrevo"),E=typeof PGR_EV!=="undefined"?PGR_EV:null;if(!m||!E)return;var box=m.querySelector(".pgr-efig");if(!box)return;
  var cv=document.createElement("canvas");cv.className="pgr-g3e";box.appendChild(cv);m.classList.add("g3");
  try{var v=new View(cv,"evo"),K=pGrKind(E.k),b=pGrBr(K.id)||"a",fi=E.first?E.to:E.from;if(K.brAt&&fi>=K.brAt&&!pGrBr(K.id))fi=K.brAt-1;
    v.setChar(g3Spec(K.id,fi,b,vOf(K.id)));v.setEnv("stage");stageFit(v);v.ph="s1";v.pt=0;v.swapped=0;v.sq=1;v.yaw=-1.2;v.pitch=.22;v.dist=clamp(v.h*2.4+1.2,2.2,7);v.st.hd=1.2-.0;
    v.onlost=function(){unmountEvo();m.classList.remove("g3");};
    v.tick=function(dt){evoTick(v,dt);};EV=v;
    /* 演出の段階（class の s1〜s4・sc）を見張る。ほかの所で class が書きかわっても 3D の印を戻す */
    v.mo=new MutationObserver(function(){if(EV!==v)return;if(!m.classList.contains("g3")&&m.classList.contains("show"))m.classList.add("g3");
      ["sc","s4","s3","s2","s1"].some(function(c){if(m.classList.contains(c)){evoPhase(c);return true;}return false;});});
    v.mo.observe(m,{attributes:true,attributeFilter:["class"]});}catch(e){if(v)v.dispose();m.classList.remove("g3");if(cv.parentNode)cv.parentNode.removeChild(cv);}}
function stageFit(v){if(v.env){v.env.u=clamp((v.R.L+v.R.bR)*v.sc*1.35,.32,1.1);v.envList=null;}}
function unmountEvo(){if(EV){try{EV.mo&&EV.mo.disconnect();}catch(_){}EV.dispose();EV=null;}var m=document.getElementById("pgrevo");if(m)m.classList.remove("g3");}
function evoSwap(v){var E=PGR_EV;if(!E)return;var K=pGrKind(E.k),b=pGrBr(K.id)||"a";v.setChar(g3Spec(K.id,E.to,b,vOf(K.id)));stageFit(v);v.swapped=1;v.sq=.35;v.dist=clamp(v.h*2.4+1.2,2.2,7);
  v.burst("gold",[0,v.h*.5,0],40);v.burst("white",[0,v.h*.5,0],24);}
function evoTick(v,dt){v.pt+=dt;var p=v.pt,st=v.st;v.yaw+=dt*(v.ph==="s2"?.5:.18);
  if(v.ph==="s1"||v.ph==="sc"){v.em=v.ph==="sc"?.15+.1*Math.sin(v.t*3):0;st.hd=-v.yaw+.6;}
  else if(v.ph==="s2"){v.em=Math.min(1,p/1.4);v.spinA=(v.spinA||0)+dt*(2+p*9);st.hd=-v.yaw+.6+v.spinA;v.sq=1-.12*Math.min(1,p/1.6);
    if(Math.random()<.7){var a=Math.random()*Math.PI*2,r=rnd(1.4,2.2),c=[0,v.h*.5,0];v.parts.push({p:[Math.cos(a)*r,rnd(0,v.h*1.4),Math.sin(a)*r],v:[0,0,0],to:c,in:1,c:[1,.9,.55],s:rnd(.08,.16),l:0,m:.9});}}
  else if(v.ph==="s3"){v.em=1;if(!v.swapped)evoSwap(v);}
  else if(v.ph==="s4"){if(!v.swapped)evoSwap(v);var q=Math.min(1,p/.8);v.em=Math.max(0,1-p/.9);
    v.sq=q<1?.35+.65*(1+Math.sin(q*Math.PI*.5*3)*Math.exp(-q*3)*.25)*q+.0:1;if(q<1)v.sq=Math.max(.35,1-Math.pow(1-q,3)*.65+Math.sin(q*9)*.08*(1-q));
    st.hd=-v.yaw+.6;if(p>1.4&&!v.jumped){v.jumped=1;st.mode="jump";st.act=0;st.spin=1;v.burst("heart",[0,v.h,0],8);}
    if(v.R.aura&&Math.random()<.3)v.parts.push({p:[rnd(-.5,.5),rnd(0,v.h),rnd(-.5,.5)],v:[0,rnd(.3,.5),0],c:hx(v.R.aura),s:rnd(.08,.14),l:0,m:1.3});}
  if(st.mode!=="jump")st.mode="idle";st.tm=9;}
function evoPhase(c){if(!EV)return;if(c!==EV.ph){EV.ph=c;EV.pt=0;if(c==="s2")EV.spinA=0;}}

/* ---------------- つなぐ ---------------- */
var _open=pGrOpen;pGrOpen=function(){var r=_open.apply(this,arguments);try{mountPage();}catch(_){}return r;};
var _close=pGrClose;pGrClose=function(){unmountPage();return _close.apply(this,arguments);};
var _evo=pGrEvolve;pGrEvolve=function(){unmountEvo();var r=_evo.apply(this,arguments);try{mountEvo();evoPhase("s1");}catch(_){}return r;};
var _go=pGrGo;pGrGo=function(c){var r=_go.apply(this,arguments);try{var m=document.getElementById("pgrevo");if(m&&EV)m.classList.add("g3");if(m&&m.className.indexOf(c)>=0)evoPhase(c);}catch(_){}return r;};
var _fill=pGrEvoFill;pGrEvoFill=function(){var r=_fill.apply(this,arguments);try{if(EV&&EV.swapped)evoSwap(EV);}catch(_){}return r;};
var _eclose=pGrEvoClose;pGrEvoClose=function(){unmountEvo();return _eclose.apply(this,arguments);};
document.addEventListener("visibilitychange",function(){if(!document.hidden&&VIEWS.length&&!RAF){LAST=0;RAF=requestAnimationFrame(loop);}});

/* テスト用（画面には出ない） */
window.G3T={spec:g3Spec,View:View,ok:g3Ok,page:function(){return PV;},evo:function(){return EV;}};

/* ---------------- 見た目 ---------------- */
var css=document.createElement("style");css.textContent=
  ".pgr-hero.g3{position:relative;aspect-ratio:4/3.1;max-height:62vh;background:#BFE0F5}"+
  ".pgr-hero.g3>svg{visibility:hidden;position:absolute;inset:0;height:100%}"+
  ".pgr-g3c{position:absolute;inset:0;width:100%;height:100%;display:block;touch-action:none;cursor:grab}"+
  ".pgr-g3h{position:absolute;left:50%;bottom:10px;transform:translateX(-50%);background:rgba(20,16,30,.55);color:#fff;font-size:12px;line-height:1.4;padding:5px 12px;border-radius:99px;white-space:nowrap;pointer-events:none;transition:opacity .8s}"+
  ".pgr-g3h.off{opacity:0}"+
  ".pgr-g3l{position:absolute;left:8px;top:8px;background:rgba(20,16,30,.55);color:#fff;font-size:12px;line-height:1.5;padding:4px 10px;border-radius:10px;pointer-events:none;max-width:calc(100% - 64px)}"+
  ".pgr-g3l span{margin-left:5px;font-size:11px;opacity:.85}"+
  ".pgr-g3fs{position:absolute;right:8px;top:8px;width:38px;height:38px;border-radius:12px;border:0;background:rgba(20,16,30,.55);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;z-index:2}"+
  ".pgr-hero.g3.fs{position:fixed;inset:0;z-index:400;aspect-ratio:auto;max-height:none;width:100%;height:100%;margin:0;border-radius:0}"+
  ".pgr-hero.g3.fs .pgr-g3fs{top:calc(10px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));width:44px;height:44px}"+
  ".pgr-hero.g3.fs .pgr-g3l{top:calc(10px + env(safe-area-inset-top));left:calc(10px + env(safe-area-inset-left));font-size:13px}"+
  "body.pgr-fs{overflow:hidden}"+
  ".pgr-g3l b{font-size:13px}.pgr-g3l i{font-style:normal;margin-left:6px;padding:0 6px;border-radius:99px;background:rgba(255,214,110,.9);color:#2B2233;font-size:11px}.pgr-g3l small{display:block;opacity:.8;font-size:11px}"+
  "#pgrevo.g3 .pgr-efig{aspect-ratio:1/1}"+
  "#pgrevo.g3 .pgr-eold,#pgrevo.g3 .pgr-enew{visibility:hidden}"+
  ".pgr-g3e{position:absolute;left:-30%;top:-30%;width:160%;height:160%;pointer-events:none}"+
  "@media (max-height:420px){.pgr-hero.g3{aspect-ratio:auto;height:58vh}}";
document.head.appendChild(css);
})();
