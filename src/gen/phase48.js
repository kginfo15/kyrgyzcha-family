/* ===== PHASE48: イラストアイコン・まとめて練習・終了確認・記録画面・音声設定 ===== */
/* ---- イラスト風アイコン（48×48、アクセント色＋金＋生成り） ---- */
var P48_A="var(--accent)",P48_D="var(--accentDeep)",P48_G="#F2B705",P48_C="#FFF4E0",P48_K="#1B1B1F";
var P48_ART={
 chat:'<path d="M6 10a6 6 0 016-6h16a6 6 0 016 6v10a6 6 0 01-6 6H17l-7 6v-6.4A6 6 0 016 20z" fill="'+P48_A+'"/><circle cx="14" cy="15" r="2" fill="#fff"/><circle cx="20" cy="15" r="2" fill="#fff"/><circle cx="26" cy="15" r="2" fill="#fff"/><path d="M22 28h14a6 6 0 016 6v4a6 6 0 01-6 6v4l-6-4h-8a6 6 0 01-6-6v-4a6 6 0 016-6z" fill="'+P48_G+'"/>',
 people:'<circle cx="18" cy="15" r="7" fill="'+P48_C+'"/><path d="M5 40c0-8 6-13 13-13s13 5 13 13z" fill="'+P48_A+'"/><circle cx="34" cy="19" r="5.5" fill="'+P48_C+'"/><path d="M24 40c1-6 5-10 10-10s10 4 10 10z" fill="'+P48_G+'"/><path d="M11 13a7 7 0 0114-1c-4 0-8-1-10-4-1 3-2 4-4 5z" fill="'+P48_K+'"/>',
 food:'<ellipse cx="24" cy="21" rx="12" ry="4" fill="'+P48_C+'"/><path d="M6 22h36a18 14 0 01-36 0z" fill="'+P48_A+'"/><path d="M14 26h20" stroke="'+P48_D+'" stroke-width="2" stroke-linecap="round"/><path d="M18 12c-2-3 2-4 0-7M24 12c-2-3 2-4 0-7M30 12c-2-3 2-4 0-7" stroke="'+P48_G+'" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="12" y="38" width="24" height="4" rx="2" fill="'+P48_D+'"/>',
 clock:'<circle cx="24" cy="25" r="17" fill="'+P48_A+'"/><circle cx="24" cy="25" r="13" fill="'+P48_C+'"/><path d="M24 16v9l6 4" stroke="'+P48_K+'" stroke-width="3" fill="none" stroke-linecap="round"/><rect x="19" y="3" width="10" height="5" rx="2" fill="'+P48_G+'"/><circle cx="24" cy="25" r="2" fill="'+P48_G+'"/>',
 city:'<rect x="6" y="18" width="12" height="24" rx="2" fill="'+P48_D+'"/><rect x="16" y="8" width="16" height="34" rx="2" fill="'+P48_A+'"/><rect x="30" y="22" width="12" height="20" rx="2" fill="'+P48_G+'"/><g fill="'+P48_C+'"><rect x="20" y="13" width="3" height="4"/><rect x="25" y="13" width="3" height="4"/><rect x="20" y="21" width="3" height="4"/><rect x="25" y="21" width="3" height="4"/><rect x="20" y="29" width="3" height="4"/><rect x="25" y="29" width="3" height="4"/><rect x="9" y="23" width="3" height="3"/><rect x="9" y="30" width="3" height="3"/><rect x="34" y="27" width="4" height="3"/></g><rect x="22" y="36" width="4" height="6" fill="'+P48_K+'"/>',
 bus:'<rect x="7" y="6" width="34" height="30" rx="7" fill="'+P48_A+'"/><rect x="11" y="11" width="26" height="11" rx="3" fill="'+P48_C+'"/><circle cx="14" cy="29" r="2.5" fill="'+P48_G+'"/><circle cx="34" cy="29" r="2.5" fill="'+P48_G+'"/><rect x="11" y="36" width="6" height="6" rx="2" fill="'+P48_K+'"/><rect x="31" y="36" width="6" height="6" rx="2" fill="'+P48_K+'"/><rect x="18" y="8" width="12" height="2" rx="1" fill="'+P48_D+'"/>',
 bag:'<path d="M17 16v-3a7 7 0 0114 0v3" stroke="'+P48_D+'" stroke-width="3" fill="none"/><path d="M8 16h32l-3 26H11z" fill="'+P48_G+'"/><path d="M8 16h32l-1 7H9z" fill="'+P48_A+'"/><circle cx="18" cy="21" r="1.8" fill="'+P48_C+'"/><circle cx="30" cy="21" r="1.8" fill="'+P48_C+'"/>',
 heart:'<path d="M24 42S6 31 6 18A9 9 0 0124 13a9 9 0 0118 5c0 13-18 24-18 24z" fill="'+P48_A+'"/><rect x="21" y="16" width="6" height="16" rx="1.5" fill="#fff"/><rect x="16" y="21" width="16" height="6" rx="1.5" fill="#fff"/><path d="M12 15a5 5 0 015-4" stroke="'+P48_C+'" stroke-width="2" fill="none" stroke-linecap="round" opacity=".7"/>',
 book:'<path d="M4 10c7-2 13-1 20 3v28c-7-4-13-5-20-3z" fill="'+P48_C+'"/><path d="M44 10c-7-2-13-1-20 3v28c7-4 13-5 20-3z" fill="#F3E3C3"/><path d="M4 38c7-2 13-1 20 3 7-4 13-5 20-3v3c-7-2-13-1-20 3-7-4-13-5-20-3z" fill="'+P48_A+'"/><path d="M9 17h10M9 22h10M29 17h10M29 22h10M29 27h7" stroke="'+P48_D+'" stroke-width="1.8" stroke-linecap="round" opacity=".6"/><path d="M34 4v12l3-2 3 2V4z" fill="'+P48_G+'"/>',
 bolt:'<circle cx="24" cy="24" r="19" fill="'+P48_A+'"/><path d="M27 7L13 27h10l-3 14 15-21H25z" fill="'+P48_G+'"/>',
 palette:'<path d="M24 5C13 5 5 13 5 23c0 11 9 20 19 20 3 0 4-2 4-4s-2-3-2-5 2-3 4-3h5c4 0 8-4 8-9C43 12 35 5 24 5z" fill="'+P48_C+'"/><circle cx="14" cy="21" r="3.5" fill="'+P48_A+'"/><circle cx="20" cy="12" r="3.5" fill="'+P48_G+'"/><circle cx="30" cy="12" r="3.5" fill="#34C759"/><circle cx="36" cy="21" r="3.5" fill="'+P48_D+'"/>',
 case:'<rect x="5" y="14" width="38" height="26" rx="5" fill="'+P48_A+'"/><path d="M17 14v-3a3 3 0 013-3h8a3 3 0 013 3v3" stroke="'+P48_D+'" stroke-width="3" fill="none"/><rect x="5" y="23" width="38" height="4" fill="'+P48_D+'"/><rect x="20" y="21" width="8" height="8" rx="2" fill="'+P48_G+'"/>',
 home_ru:'<path d="M6 22L24 7l18 15z" fill="'+P48_A+'"/><rect x="10" y="21" width="28" height="21" fill="'+P48_G+'"/><path d="M10 26h28M10 31h28M10 36h28" stroke="#C77C02" stroke-width="1.4"/><rect x="20" y="30" width="8" height="12" rx="1" fill="'+P48_D+'"/><rect x="13" y="25" width="5" height="5" fill="'+P48_C+'"/><rect x="30" y="25" width="5" height="5" fill="'+P48_C+'"/><circle cx="24" cy="16" r="2.5" fill="'+P48_C+'"/>',
 home_ky:'<path d="M5 41V26Q24 6 43 26v15z" fill="'+P48_C+'"/><path d="M3 27Q24 4 45 27" fill="none" stroke="'+P48_G+'" stroke-width="3.2" stroke-linecap="round"/><circle cx="24" cy="12" r="3.5" fill="'+P48_G+'"/><path d="M8 33h32" stroke="'+P48_A+'" stroke-width="2.2" stroke-dasharray="3 2"/><rect x="19" y="28" width="10" height="13" rx="1.5" fill="'+P48_A+'"/><path d="M5 41h38" stroke="'+P48_D+'" stroke-width="2"/>',
 mountain:'<circle cx="35" cy="13" r="6" fill="'+P48_G+'"/><path d="M2 42l14-24 9 13 6-8 15 19z" fill="'+P48_A+'"/><path d="M16 18l-5 8 3 1 2-3 2 3 3-1z" fill="'+P48_C+'"/><path d="M31 23l-3 4 2 1 1-2 2 2 1-1z" fill="'+P48_C+'"/><path d="M2 42h44" stroke="'+P48_D+'" stroke-width="2"/>',
 smile:'<circle cx="24" cy="24" r="19" fill="'+P48_G+'"/><circle cx="17" cy="20" r="2.6" fill="'+P48_K+'"/><circle cx="31" cy="20" r="2.6" fill="'+P48_K+'"/><path d="M15 28c3 5 6 6 9 6s6-1 9-6" stroke="'+P48_K+'" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="12" cy="28" r="3" fill="'+P48_A+'" opacity=".5"/><circle cx="36" cy="28" r="3" fill="'+P48_A+'" opacity=".5"/>',
 link:'<rect x="4" y="17" width="24" height="14" rx="7" fill="none" stroke="'+P48_A+'" stroke-width="5"/><rect x="20" y="17" width="24" height="14" rx="7" fill="none" stroke="'+P48_G+'" stroke-width="5"/>',
 cards:'<rect x="15" y="5" width="25" height="33" rx="5" fill="'+P48_G+'" transform="rotate(8 27 21)"/><rect x="8" y="9" width="25" height="33" rx="5" fill="'+P48_A+'"/><rect x="13" y="16" width="15" height="3" rx="1.5" fill="'+P48_C+'"/><rect x="13" y="23" width="10" height="3" rx="1.5" fill="'+P48_C+'" opacity=".7"/>',
 grid:'<rect x="6" y="6" width="16" height="16" rx="4" fill="'+P48_A+'"/><rect x="26" y="6" width="16" height="16" rx="4" fill="'+P48_G+'"/><rect x="6" y="26" width="16" height="16" rx="4" fill="'+P48_G+'"/><rect x="26" y="26" width="16" height="16" rx="4" fill="'+P48_A+'"/>',
 loop:'<circle cx="24" cy="24" r="18" fill="'+P48_A+'"/><path d="M15 21a10 10 0 0117-5" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M33 11v6h-6" stroke="#fff" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M33 27a10 10 0 01-17 5" stroke="'+P48_G+'" stroke-width="3.4" fill="none" stroke-linecap="round"/><path d="M15 37v-6h6" stroke="'+P48_G+'" stroke-width="3.4" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
 star:'<path d="M24 4l6 12.5 13.6 2-9.8 9.6 2.3 13.6L24 35.3l-12.1 6.4 2.3-13.6-9.8-9.6 13.6-2z" fill="'+P48_G+'"/>'
};
P48_ART.home=(P47_LANG==="ky")?P48_ART.home_ky:P48_ART.home_ru;
function p48Art(k,size){return '<svg width="'+(size||30)+'" height="'+(size||30)+'" viewBox="0 0 48 48" aria-hidden="true">'+(P48_ART[k]||P48_ART.grid)+'</svg>';}
/* テーマ一覧・ホームカードのアイコンをイラストに差し替え */
var _p48Words=renderP47Words;
renderP47Words=function(){
  return String(_p48Words()).replace(/<span class="p47-themeic"><svg[\s\S]*?<\/svg><\/span><span class="p47-themetxt"><b>([^<]*)<\/b>/g,function(m,cat){
    var t=cat.replace(/&amp;/g,"&");return '<span class="p47-themeic p48-ill">'+p48Art(p47CatIcon(t),30)+'</span><span class="p47-themetxt"><b>'+cat+'</b>';});
};
/* ---- ホーム：まとめて練習（チャレンジモード）を追加 ---- */
var _p48Home=renderHome;
renderHome=function(){
  var h=String(_p48Home());
  h=h.replace(/<span class="p47-cardic">[\s\S]*?<\/svg><\/span>/,'<span class="p47-cardic p48-ill">'+p48Art("cards",32)+'</span>');
  var lapTxt=(p35LapDone()>0||p35Lap()>1)?(p36ScopeLabel()+' '+p35Lap()+'周目'):'全単語を順番に見ていく周回モード';
  var card='<button type="button" class="p47-card" data-act="p48reinf"><span class="p47-cardic p48-ill">'+p48Art("loop",32)+'</span>'+
    '<span class="p47-cardtxt"><b>まとめて練習</b><small>'+esc(lapTxt)+'</small></span>'+p47Icon("chev",18)+'</button>';
  return h.replace('<button type="button" class="p47-more"',card+'<button type="button" class="p47-more"');
};
/* ---- 終了確認 ---- */
function p48ShowQuit(){
  var m=document.getElementById("p48modal");if(!m){m=document.createElement("div");m.id="p48modal";document.body.appendChild(m);}
  var chal=ui.mixQueue&&ui.mixQueue.mode==="challenge";
  m.innerHTML='<div class="p48-mask" data-act="p48quitno"></div><div class="p48-dialog" role="dialog" aria-modal="true">'+
    '<div class="p48-dlgart">'+p48Art(P47_LANG==="ky"?"home":"star",44)+'</div>'+
    '<h3>練習をやめますか？</h3><p>'+(chal?'ここまでの回答は今日のチャレンジに記録されています。ホームの「続きから再開」で続きができます。':'ここまでの回答は記録されています。')+'</p>'+
    '<button type="button" class="p48-dlgbtn danger" data-act="p48quitok">はい、やめる</button>'+
    '<button type="button" class="p48-dlgbtn" data-act="p48quitno">練習を続ける</button></div>';
  m.className="show";
}
function p48HideQuit(){var m=document.getElementById("p48modal");if(m){m.className="";m.innerHTML="";}}
function p48Quit(){
  p48HideQuit();
  try{if(ui.session&&ui.session.origin==="reinforce")saveReinforceState();}catch(_){}
  try{window.speechSynthesis.cancel();}catch(_){}
  ui.session=null;ui.composeSession=null;ui.composeSub="select";ui.mixCheckpoint=false;ui.chalPick=false;ui.lapDonePending=false;
  clearTransientUI();ui.bnav="home";ui.learnOpen=false;saveUI();render();window.scrollTo(0,0);
}
/* ---- 記録画面 ---- */
function p48DayCount(k){var d=appHist.days[k];if(!d)return 0;return (d.studiedWords||0)+(d.composeCount||0);}
function p48Gauge(pct,size){
  var sw=16,r=(size-sw)/2-6,c=2*Math.PI*r,arc=c*0.75,off=arc*(1-Math.max(0,Math.min(1,pct)));
  var cx=size/2;
  var ticks="";for(var i=0;i<=30;i++){var a=(135+i*9)*Math.PI/180,r1=r+sw/2+4,r2=r1+(i%5===0?6:3);ticks+='<line x1="'+(cx+Math.cos(a)*r1).toFixed(1)+'" y1="'+(cx+Math.sin(a)*r1).toFixed(1)+'" x2="'+(cx+Math.cos(a)*r2).toFixed(1)+'" y2="'+(cx+Math.sin(a)*r2).toFixed(1)+'" stroke="rgba(255,255,255,.4)" stroke-width="'+(i%5===0?2:1)+'" stroke-linecap="round"/>';}
  return '<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'" class="p48-gaugesvg" aria-hidden="true"><defs><linearGradient id="p48g" x1="0" y1="1" x2="1" y2="0"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--sub)"/></linearGradient></defs>'+ticks+
    '<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="rgba(255,255,255,.16)" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+arc.toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(135 '+cx+' '+cx+')"/>'+
    (pct>0?'<circle cx="'+cx+'" cy="'+cx+'" r="'+r+'" fill="none" stroke="url(#p48g)" stroke-width="'+sw+'" stroke-linecap="round" stroke-dasharray="'+(arc-off).toFixed(1)+' '+c.toFixed(1)+'" transform="rotate(135 '+cx+' '+cx+')" class="p48-arc"/>':'')+'</svg>';
}
function renderP48Stats(){
  var total=VOCAB.length,known=p47KnownCount(),pct=total?known/total:0;
  var lv=function(l){var ids=VOCAB.filter(function(w){return w.level===l;});var k=ids.filter(function(w){return p47IsKnown(w.id);}).length;return {k:k,n:ids.length};};
  var a1=lv("A1"),a2=lv("A2");
  var streak=appHist.streak.count||0,t=p47Target(),d=p47DoneToday();
  var all=0;Object.keys(appHist.days||{}).forEach(function(k){all+=p48DayCount(k);});
  var h='<div class="p48-stats"><div class="p48-title">記録</div>';
  h+='<div class="p48-hero p49-scene"><div class="p49-sceneart">'+p47L().hero+'</div><div class="p48-gauge">'+p48Gauge(pct,230)+'<div class="p48-gin"><div class="p48-pct">'+Math.round(pct*1000)/10+'<small>%</small></div><div class="p48-gl">覚えた単語</div><div class="p48-gn">'+known.toLocaleString()+' / '+total.toLocaleString()+'</div></div></div>';
  P_LVLS.map(function(l){return [l,lv(l)];}).forEach(function(x){var p=x[1].n?x[1].k/x[1].n:0;
    h+='<div class="p48-lv"><span class="p48-lvtag">'+x[0]+'</span><span class="p48-lvbar"><i style="width:'+(p*100).toFixed(1)+'%"></i></span><span class="p48-lvn">'+Math.round(p*100)+'%</span></div>';});
  h+='</div>';
  h+='<div class="p48-tiles">'+
    '<div class="p48-tile"><span class="p48-ill">'+p48Art("star",26)+'</span><b>'+streak+'</b><small>連続日数</small></div>'+
    '<div class="p48-tile"><span class="p48-ill">'+p48Art("bolt",26)+'</span><b>'+Math.min(d,t)+'<i>/'+t+'</i></b><small>今日のチャレンジ</small></div>'+
    '<div class="p48-tile"><span class="p48-ill">'+p48Art("cards",26)+'</span><b>'+all.toLocaleString()+'</b><small>これまでの回答</small></div></div>';
  /* この7日間 */
  var days=[],mx=1;for(var i=6;i>=0;i--){var dt=new Date();dt.setDate(dt.getDate()-i);var k=todayKey(dt),v=p48DayCount(k);mx=Math.max(mx,v);days.push({k:k,v:v,wd:["日","月","火","水","木","金","土"][dt.getDay()],today:i===0});}
  h+='<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">'+p48Art("clock",22)+'</span>この7日間</b><span>回答数</span></div><div class="p48-bars">';
  days.forEach(function(x){var hh=x.v?Math.max(6,Math.round(x.v/mx*110)):3;
    h+='<button type="button" class="p48-bar'+(x.today?" today":"")+'" data-act="p48day" data-val="'+x.wd+'曜日 '+x.v+'問" title="'+x.wd+' '+x.v+'問" aria-label="'+x.wd+'曜日 '+x.v+'問">'+
      ((x.today||x.v===mx)&&x.v?'<em>'+x.v+'</em>':'<em></em>')+'<i style="height:'+hh+'px"></i><span>'+x.wd+'</span></button>';});
  h+='</div></div>';
  /* 学習カレンダー（5週間） */
  var today=new Date(),start=new Date();start.setDate(today.getDate()-28-today.getDay());
  h+='<div class="p48-card p49-cardill"><div class="p48-ch"><b><span class="p49-chic p48-ill">'+p48Art(P47_LANG==="ky"?"sun":"star",22)+'</span>学習カレンダー</b><span>5週間</span></div><div class="p48-heat">'+
    ["日","月","火","水","木","金","土"].map(function(w){return '<span>'+w+'</span>';}).join("");
  var nCells=28+today.getDay()+1;
  for(var j=0;j<35;j++){var dd=new Date(start);dd.setDate(start.getDate()+j);
    if(j>=nCells){h+='<i class="fut"></i>';continue;}
    var kk=todayKey(dd),vv=p48DayCount(kk);
    var lvN=vv===0?0:(vv<10?1:(vv<25?2:(vv<50?3:4)));
    h+='<i class="l0'+(lvN?' s'+lvN:'')+(j===nCells-1?" today":"")+'" title="'+(dd.getMonth()+1)+'/'+dd.getDate()+' '+vv+'問">'+(lvN?p48Art(P47_LANG==="ky"?"sun":"star",30):'')+'</i>';}
  h+='</div><div class="p48-heatkey"><span>学習した日にスタンプ。たくさん解いた日ほど大きくなります</span></div></div>';
  h+='</div>';
  return h;
}
var _p48Render2=render;
render=function(){
  var r=_p48Render2.apply(this,arguments);
  try{
    var studying=(ui.chalPick||(ui.mixSummary&&ui.mixSummary.stats)||(ui.mixCheckpoint&&ui.mixQueue)||(ui.lapDonePending&&ui.session&&ui.session.origin==="reinforce"));
    if(ui.bnav==="stats"&&!studying){var m=document.getElementById("main");if(m)m.innerHTML=renderP48Stats();}
  }catch(e){}
  return r;
};
/* ---- 音声 ---- */
var P48_TR={"а":"a","б":"b","в":"v","г":"g","д":"d","ж":"c","з":"z","и":"i","й":"y","к":"k","л":"l","м":"m","н":"n","ң":"n","о":"o","ө":"ö","п":"p","р":"r","с":"s","т":"t","у":"u","ү":"ü","ф":"f","х":"h","ц":"ts","ч":"ç","ш":"ş","щ":"şç","ъ":"","ы":"ı","ь":"","э":"e","ё":"yo","ю":"yu","я":"ya"};
function p48KyToTr(t){
  var out="",prev=" ";
  for(var i=0;i<t.length;i++){var ch=t[i],lo=ch.toLowerCase(),r;
    if(lo==="е"){r=(/[^а-яөүңё]/i.test(prev)||"аеёиоуыэюяөү".indexOf(prev.toLowerCase())>=0)?"ye":"e";}
    else r=(lo in P48_TR)?P48_TR[lo]:ch;
    if(ch!==lo&&r)r=r.charAt(0).toUpperCase()+r.slice(1);
    out+=r;prev=ch;}
  return out;
}
function p48TargetLangs(){return P47_LANG==="ky"?["ky","kk","tr","ru"]:["ru"];}
function p48VoiceScore(v){var n=(v.name||"")+" "+(v.voiceURI||""),s=0,l=(v.lang||"").toLowerCase();
  var langs=p48TargetLangs();var li=langs.indexOf(l.slice(0,2));if(li<0)return -1;s+=(langs.length-li)*10;
  if(P47_LANG==="ky"&&l.indexOf("tr")===0)s+=25;
  if(/premium|プレミアム/i.test(n))s+=9;if(/enhanced|拡張|natural|neural|online/i.test(n))s+=7;if(/google/i.test(n))s+=5;if(v.localService===false)s+=1;
  return s;}
function p48Voices(){try{return window.speechSynthesis.getVoices().filter(function(v){return p48VoiceScore(v)>=0;}).sort(function(a,b){return p48VoiceScore(b)-p48VoiceScore(a);});}catch(_){return [];}}
function p48Voice(){var vs=p48Voices();if(!vs.length)return null;if(settings.p48Voice){for(var i=0;i<vs.length;i++)if(vs[i].voiceURI===settings.p48Voice)return vs[i];}return vs[0];}
function p48Prep(text,v){
  var t=String(text||"").replace(/́/g,"");
  if(P47_LANG!=="ky")return t;
  var l=((v&&v.lang)||"ru").toLowerCase();
  if(l.indexOf("tr")===0)return p48KyToTr(t);
  if(l.indexOf("ky")===0||l.indexOf("kk")===0)return t;
  return t.replace(/ө/g,"о").replace(/Ө/g,"О").replace(/ү/g,"у").replace(/Ү/g,"У").replace(/ң/g,"нг").replace(/Ң/g,"Нг");
}
function p48Utter(text,rate){var v=p48Voice();var u=new SpeechSynthesisUtterance(p48Prep(text,v));u.lang=v?v.lang:(P47_LANG==="ky"?"ru-RU":"ru-RU");if(v)u.voice=v;u.rate=rate||settings.ruRate||0.9;return u;}
speak=function(text,rate){
  if(!window.speechSynthesis||!window.SpeechSynthesisUtterance){toast("この端末では読み上げを使えません");return;}
  try{var u=p48Utter(text,rate);window.speechSynthesis.cancel();window.speechSynthesis.speak(u);}catch(e){toast("読み上げに失敗しました");}
};
var _p48SU=speakUtterance;
speakUtterance=function(text,lang,rate,voice){
  if(String(lang||"").indexOf("ru")!==0&&String(lang||"").indexOf("ky")!==0)return _p48SU.apply(this,arguments);
  return new Promise(function(resolve){
    if(!window.speechSynthesis){resolve();return;}
    var clean=String(text||"").trim();if(!clean){resolve();return;}
    try{var u=p48Utter(clean,rate),done=false;
      var fb=setTimeout(function(){if(!done){done=true;resolve();}},Math.max(2500,clean.length*180));
      u.onend=u.onerror=function(){if(done)return;done=true;clearTimeout(fb);resolve();};
      window.speechSynthesis.speak(u);}catch(e){resolve();}
  });
};
try{window.speechSynthesis.addEventListener("voiceschanged",function(){if(ui.bnav==="settings")render();});}catch(_){}
var _p48Settings=renderSettings;
renderSettings=function(embed){
  var h=String(_p48Settings(embed));
  var vs=p48Voices(),cur=p48Voice(),rate=settings.ruRate||0.9;
  var langName={ru:"ロシア語",ky:"キルギス語",kk:"カザフ語",tr:"トルコ語"};
  var s='<div class="p47-set"><div class="p47-setrow"><div><b>読み上げの声</b><small>'+(P47_LANG==="ky"?"キルギス語の声がない端末では、トルコ語の声が ө・ү・ы をいちばん正確に読みます":"「拡張」「プレミアム」と付いた声が自然です")+'</small></div></div>';
  if(!vs.length)s+='<div class="p48-empty">この端末で使える声が見つかりません。下の「もっと自然な声にするには」をご覧ください。</div>';
  else{s+='<div class="p48-voices">';vs.slice(0,8).forEach(function(v,i){var on=cur&&cur.voiceURI===v.voiceURI;
      s+='<button type="button" class="p48-voice'+(on?" on":"")+'" data-act="p48voice" data-val="'+esc(v.voiceURI)+'"><span><b>'+esc(v.name)+'</b><small>'+(langName[(v.lang||"").slice(0,2).toLowerCase()]||v.lang)+(i===0?' ・ おすすめ':'')+'</small></span>'+(on?p47Icon("check",18):'')+'</button>';});
    s+='</div>';}
  s+='<div class="p47-setrow" style="margin-top:14px"><div><b>速さ</b></div></div><div class="p47-seg" style="grid-template-columns:repeat(4,1fr)">'+
    [[0.6,"ゆっくり"],[0.8,"やや遅め"],[0.9,"ふつう"],[1.05,"速め"]].map(function(o){return '<button type="button" data-act="p48rate" data-val="'+o[0]+'" class="'+(Math.abs(rate-o[0])<0.02?"on":"")+'">'+o[1]+'</button>';}).join("")+'</div>'+
    '<button type="button" class="p47-btn primary" style="width:100%;margin-top:12px" data-act="p48test">試しに聞く</button>'+
    '<details class="p48-help"><summary>もっと自然な声にするには</summary><p><b>iPhone</b>：設定 → アクセシビリティ → 読み上げコンテンツ → 声 → '+(P47_LANG==="ky"?'トルコ語（またはロシア語）':'ロシア語')+' → 「拡張」または「プレミアム」の声をダウンロード。その後このアプリを開き直し、上の一覧から選びます。</p><p><b>Android</b>：設定 → システム → 言語と入力 → 音声出力（テキスト読み上げ）→ Google の音声データで'+(P47_LANG==="ky"?'トルコ語':'ロシア語')+'をインストール。</p></details></div>';
  return h.replace('<div class="p47-set"><button type="button" class="p47-link" data-act="onbreplay">',s+'<div class="p47-set"><button type="button" class="p47-link" data-act="onbreplay">');
};
/* ---- 操作 ---- */
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act"),v=el.getAttribute("data-val");
  var quitActs={endsession:1,endreview:1,cend:1};
  if(quitActs[a]&&(ui.session||ui.composeSession)){e.stopImmediatePropagation();e.preventDefault();p48ShowQuit();return;}
  var mine={p48reinf:1,p48quitok:1,p48quitno:1,p48statsmore:1,p48day:1,p48voice:1,p48rate:1,p48test:1};
  if(!mine[a])return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p48reinf"){ui.studyMode="challenge";clearTransientUI();startReinforceMode();return;}
  if(a==="p48quitok"){p48Quit();return;}
  if(a==="p48quitno"){p48HideQuit();return;}
  if(a==="p48statsmore"){ui.p48StatsMore=!ui.p48StatsMore;saveUI();render();return;}
  if(a==="p48day"){toast(v);return;}
  if(a==="p48voice"){settings.p48Voice=v;saveAll();render();speak(P47_LANG==="ky"?"Саламатсызбы! Кыргызча үйрөнөбүз.":"Здравствуйте! Давайте учить русский язык.");return;}
  if(a==="p48rate"){settings.ruRate=+v;saveAll();render();return;}
  if(a==="p48test"){speak(P47_LANG==="ky"?"Саламатсызбы! Кыргызча үйрөнөбүз.":"Здравствуйте! Давайте учить русский язык.");return;}
},true);
/* ---- 見た目 ---- */
(function(){
  var css=
  '.p48-ill{background:linear-gradient(145deg,var(--card2),var(--card))!important;border:1px solid var(--line)}'+
  '.p47-card+.p47-card{margin-top:10px}'+
  '#p48modal{position:fixed;inset:0;z-index:120;display:none}#p48modal.show{display:block}'+
  '.p48-mask{position:absolute;inset:0;background:rgba(0,0,0,.6);backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}'+
  '.p48-dialog{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:min(340px,calc(100% - 40px));background:var(--card);border:1px solid var(--line);border-radius:24px;padding:24px 20px 18px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.5);animation:p48pop .18s ease-out}'+
  '@keyframes p48pop{from{transform:translate(-50%,-46%) scale(.96);opacity:0}}'+
  '.p48-dlgart{width:64px;height:64px;border-radius:20px;margin:0 auto 12px;display:flex;align-items:center;justify-content:center;background:var(--card2)}'+
  '.p48-dialog h3{margin:0 0 8px;font-size:19px}.p48-dialog p{margin:0 0 18px;color:var(--muted);font-size:13.5px;line-height:1.7}'+
  '.p48-dlgbtn{display:block;width:100%;padding:14px;border-radius:14px;border:1px solid var(--line);background:var(--card2);color:var(--ink);font-weight:800;font-size:15px;margin-top:8px;cursor:pointer}'+
  '.p48-dlgbtn.danger{background:#FF453A;border-color:#FF453A;color:#fff}'+
  '.p48-stats{padding:2px 2px 24px}.p48-title{font-size:28px;font-weight:800;letter-spacing:-.02em;margin:8px 2px 14px}'+
  '.p48-hero{background:radial-gradient(120% 90% at 50% 0%,var(--accentSoft),transparent 70%),var(--card);border:1px solid var(--line);border-radius:24px;padding:18px 18px 16px}'+
  '.p48-gauge{position:relative;width:230px;height:200px;margin:0 auto;overflow:hidden}.p48-gaugesvg{display:block}'+
  '.p48-arc{filter:drop-shadow(0 0 8px var(--accentSoft))}'+
  '.p48-gin{position:absolute;left:0;right:0;top:62px;text-align:center}.p48-pct{font-size:46px;font-weight:800;letter-spacing:-.03em;line-height:1}'+
  '.p48-pct small{font-size:20px;color:var(--muted);margin-left:2px}.p48-gl{font-size:12px;color:var(--muted);font-weight:700;margin-top:6px;letter-spacing:.06em}.p48-gn{font-size:13px;font-weight:700;margin-top:2px}'+
  '.p48-lv{display:flex;align-items:center;gap:10px;margin-top:10px}.p48-lvtag{font-size:11px;font-weight:800;padding:3px 8px;border-radius:8px;background:var(--card2);color:var(--muted)}'+
  '.p48-lvbar{flex:1;height:10px;border-radius:9px;background:var(--card2);overflow:hidden}.p48-lvbar i{display:block;height:100%;border-radius:9px;background:linear-gradient(90deg,var(--accent),var(--sub));min-width:2px}'+
  '.p48-lvn{font-size:13px;font-weight:800;min-width:38px;text-align:right}'+
  '.p48-tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:12px 0}'+
  '.p48-tile{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:12px 10px;display:flex;flex-direction:column;gap:4px}'+
  '.p48-tile .p48-ill{width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center}'+
  '.p48-tile b{font-size:22px;letter-spacing:-.02em;margin-top:4px}.p48-tile b i{font-style:normal;font-size:13px;color:var(--muted)}.p48-tile small{font-size:11px;color:var(--muted)}'+
  '.p48-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:16px;margin-bottom:12px}'+
  '.p48-ch{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:12px}.p48-ch b{font-size:15px}.p48-ch span{font-size:11px;color:var(--muted)}'+
  '.p48-bars{display:grid;grid-template-columns:repeat(7,1fr);gap:8px;align-items:end;height:150px}'+
  '.p48-bar{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%;background:none;border:none;padding:0;color:var(--muted);cursor:pointer}'+
  '.p48-bar i{display:block;width:100%;max-width:26px;border-radius:4px 4px 2px 2px;background:var(--accent);opacity:.4}'+
  '.p48-bar.today i{opacity:1}.p48-bar em{font-style:normal;font-size:11px;font-weight:800;color:var(--ink);min-height:14px}.p48-bar span{font-size:11px}.p48-bar.today span{color:var(--ink);font-weight:800}'+
  '.p48-heat{display:grid;grid-template-columns:repeat(7,minmax(0,30px));justify-content:space-between;row-gap:6px}.p48-heat span{font-size:10px;color:var(--muted);text-align:center}.p48-heat i.fut{background:transparent;border:1px dashed var(--line)}.p48-heat i,.p48-heatkey i{display:block;aspect-ratio:1;border-radius:5px;background:var(--card2)}'+
  '.p48-heat .l1,.p48-heatkey .l1{background:color-mix(in srgb,var(--accent) 30%,var(--card2))}.p48-heat .l2,.p48-heatkey .l2{background:color-mix(in srgb,var(--accent) 55%,var(--card2))}'+
  '.p48-heat .l3,.p48-heatkey .l3{background:color-mix(in srgb,var(--accent) 78%,var(--card2))}.p48-heat .l4,.p48-heatkey .l4{background:var(--accent)}'+
  '.p48-heat i.today{outline:2px solid #F2B705;outline-offset:1px}'+
  '.p48-heatkey{display:flex;align-items:center;justify-content:flex-end;gap:4px;margin-top:10px;font-size:10px;color:var(--muted)}.p48-heatkey i{width:12px}'+
  '.p48-morebtn{display:block;margin:6px auto 0;background:none;border:none;color:var(--muted);font-size:13px;font-weight:700;padding:10px;cursor:pointer}'+
  '.p48-voices{display:flex;flex-direction:column;gap:6px;margin-top:12px}.p48-voice{display:flex;align-items:center;justify-content:space-between;padding:11px 12px;border-radius:12px;border:1px solid var(--line);background:var(--card2);color:var(--ink);text-align:left;cursor:pointer}'+
  '.p48-voice b{display:block;font-size:14px}.p48-voice small{display:block;font-size:11px;color:var(--muted);margin-top:1px}.p48-voice.on{border-color:var(--accent);color:var(--accent)}.p48-voice.on b{color:var(--ink)}'+
  '.p48-empty{margin-top:10px;font-size:13px;color:var(--muted)}'+
  '.p48-help{margin-top:12px}.p48-help summary{cursor:pointer;color:var(--accent);font-size:13px;font-weight:700}.p48-help p{font-size:12.5px;color:var(--muted);line-height:1.7;margin:8px 0 0}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
