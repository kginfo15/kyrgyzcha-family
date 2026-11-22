/* ===== PHASE60: 出題の向きを選ぶ ／ 記録画面を落ち着いた表示に ／ 絵を控えめに ===== */
/* ---- 1) 出題の向き：ミックス／外国語→日本語／日本語→外国語 ---- */
if(!settings.p60Dir)settings.p60Dir="mix";
var _p60Make=p52Make;
p52Make=function(s){
  var q=_p60Make(s),d=settings.p60Dir||"mix";
  if(!q||q.type==="intro"||d==="mix"||(s&&s.origin==="levelTest"))return q;
  var want=null;
  if(d==="ru2ja"&&(q.type==="reverse"||q.type==="cloze"))want="meaning";
  if(d==="ja2ru"&&(q.type==="meaning"||q.type==="listen"))want="reverse";
  if(!want)return q;
  var w=WMAP[q.id],pool=shuffle(p52Pool(w)),opts=[],seen={};seen[want==="reverse"?w.word:p52Short(w.meaning)]=1;
  for(var i=0;i<pool.length&&opts.length<3;i++){var key=want==="reverse"?pool[i].word:p52Short(pool[i].meaning);if(seen[key])continue;seen[key]=1;opts.push(pool[i].id);}
  opts.push(q.id);opts=shuffle(opts);
  return {id:q.id,type:want,opts:opts,pick:null};
};
function p60DirUI(){
  var n=p47L().name,d=settings.p60Dir||"mix";
  var o=[["mix","ミックス"],["ru2ja",n+"→日本語"],["ja2ru","日本語→"+n]];
  return '<div class="p60-dir"><div class="p60-dirl">クイズの出し方</div><div class="p60-seg">'+o.map(function(x){return '<button type="button" data-act="p60dir" data-val="'+x[0]+'" class="'+(d===x[0]?"on":"")+'">'+x[1]+'</button>';}).join("")+'</div></div>';
}
var _p60Words=renderP47Words;
renderP47Words=function(){var h=String(_p60Words.apply(this,arguments));var i=h.indexOf('<div class="p47-sec">');return i<0?p60DirUI()+h:h.slice(0,i)+p60DirUI()+h.slice(i);};
var _p60Settings=renderSettings;
renderSettings=function(embed){var h=String(_p60Settings.apply(this,arguments));var i=h.indexOf('<div class="p47-set');return i<0?h:h.slice(0,i)+'<div class="p60-setdir">'+p60DirUI()+'</div>'+h.slice(i);};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  if(el.getAttribute("data-act")!=="p60dir")return;
  e.stopImmediatePropagation();e.preventDefault();
  settings.p60Dir=el.getAttribute("data-val");if(ui.session)ui.session.p52=null;saveAll();saveUI();render();
},true);
/* ---- 2) 記録：飾りを減らし、数字と線だけで見せる ---- */
function p60Cols(vals,labels,todayIdx){
  var mx=Math.max(1,Math.max.apply(null,vals));
  return '<div class="p60-cols">'+vals.map(function(v,i){return '<div class="p60-col'+(i===todayIdx?" today":"")+'"><em>'+(v||"")+'</em><i style="height:'+(v?Math.max(4,Math.round(v/mx*56)):2)+'px"></i><span>'+labels[i]+'</span></div>';}).join("")+'</div>';
}
renderP48Stats=function(){
  var total=VOCAB.length,known=p47KnownCount(),pct=total?known/total*100:0;
  var streak=appHist.streak.count||0,t=p47Target(),d=Math.min(p47DoneToday(),t);
  var all=0;Object.keys(appHist.days||{}).forEach(function(k){all+=p48DayCount(k);});
  var L=p56LevelState(),wd=["日","月","火","水","木","金","土"];
  var h='<div class="p60-st"><div class="p48-title">記録</div>';
  h+='<div class="p60-sum"><div class="p60-cap">覚えた単語</div><div class="p60-big">'+known.toLocaleString()+'<small> / '+total.toLocaleString()+' 語</small><em>'+(Math.round(pct*10)/10)+'%</em></div>'+
     '<div class="p60-line"><i style="width:'+pct.toFixed(1)+'%"></i></div>'+
     '<div class="p60-facts"><span><b>'+streak+'</b> 日連続</span><span>今日 <b>'+d+'</b> / '+t+' 問</span><span>累計 <b>'+all.toLocaleString()+'</b> 問</span></div></div>';
  h+='<div class="p60-h">レベル</div><div class="p60-list">';
  P_LVLS.forEach(function(lv){
    var c=L[lv],tt=appHist.levelTests[lv]||{},p=p53Projection(lv);
    var eta=p.done?'すべて覚えました':('残り '+p.left+' 語'+(p.eta?' ・ 今のペースで '+(p.eta.getFullYear()!==new Date().getFullYear()?p.eta.getFullYear()+'年':'')+(p.eta.getMonth()+1)+'月'+p.eta.getDate()+'日ごろ':''));
    h+='<div class="p60-row"><div class="p60-rt"><b>'+lv+'</b><span>'+c.k+' / '+c.n+' 語</span><em>'+c.pct+'%</em></div><div class="p60-line"><i style="width:'+c.pct+'%"></i></div>'+
       '<div class="p60-rs">'+eta+'</div>'+
       '<div class="p60-rs p60-test"><span>到達テスト ・ '+(tt.passed?'合格':(tt.best!=null?'最高 '+tt.best+'%':'未受験'))+'</span><button type="button" class="p60-link" data-act="p56test" data-val="'+lv+'">'+(tt.best!=null?'もう一度受ける':'受ける')+' ›</button></div></div>';
  });
  h+='<button type="button" class="p60-rowlink" data-act="p56a2"><span>A2の文法項目ごとの達成度</span><span>›</span></button></div>';
  var fc=p53Forecast(),fl=[];for(var i=0;i<7;i++){var dd=new Date();dd.setDate(dd.getDate()+i);fl.push(i===0?"今日":i===1?"明日":wd[dd.getDay()]);}
  h+='<div class="p60-h">復習の予定<small>単語数</small></div><div class="p60-list p60-pad">'+p60Cols(fc,fl,0)+'</div>';
  var dv=[],dl=[];for(var j=6;j>=0;j--){var dt=new Date();dt.setDate(dt.getDate()-j);dv.push(p48DayCount(todayKey(dt)));dl.push(j===0?"今日":wd[dt.getDay()]);}
  h+='<div class="p60-h">この7日間<small>回答数</small></div><div class="p60-list p60-pad">'+p60Cols(dv,dl,6)+'</div>';
  var today=new Date(),start=new Date();start.setDate(today.getDate()-28-today.getDay());var nCells=28+today.getDay()+1;
  h+='<div class="p60-h">学習した日<small>5週間</small></div><div class="p60-list p60-pad"><div class="p60-cal">'+wd.map(function(w){return '<span>'+w+'</span>';}).join("");
  for(var k=0;k<35;k++){var cd=new Date(start);cd.setDate(start.getDate()+k);
    if(k>=nCells){h+='<i class="fut"></i>';continue;}
    var vv=p48DayCount(todayKey(cd)),lvN=vv===0?0:(vv<10?1:(vv<25?2:(vv<50?3:4)));
    h+='<i class="s'+lvN+(k===nCells-1?" today":"")+'" title="'+(cd.getMonth()+1)+'/'+cd.getDate()+' '+vv+'問">'+cd.getDate()+'</i>';}
  h+='</div></div></div>';
  return h;
};
(function(){
  var st=document.createElement("style");
  st.textContent=
  /* 絵は控えめに：単語より小さく、彩度を落として添える */
  '.p59-pic{font-size:30px!important;line-height:1!important;margin:0 0 6px!important;filter:saturate(.75)!important;opacity:.9}.p59-pic.sm{font-size:26px!important}.p48-dialog .p59-pic{font-size:28px!important}'+
  '.p60-dir{margin:0 0 16px}.p60-dirl{font-size:12px;font-weight:700;color:var(--muted);margin:0 2px 6px}.p60-seg{display:flex;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:3px;gap:2px}'+
  '.p60-seg button{flex:1;border:none;background:none;color:var(--muted);font-size:12px;font-weight:700;padding:9px 4px;border-radius:9px;cursor:pointer;font-family:inherit;white-space:nowrap}.p60-seg button.on{background:var(--card2);color:var(--ink)}'+
  '.p60-setdir{margin:0 0 4px}'+
  '.p60-st{padding-bottom:24px}.p60-sum{padding:4px 2px 6px}.p60-cap{font-size:13px;color:var(--muted);font-weight:600}'+
  '.p60-big{font-size:40px;font-weight:800;letter-spacing:-.02em;line-height:1.15;display:flex;align-items:baseline;gap:4px;font-variant-numeric:tabular-nums}.p60-big small{font-size:15px;font-weight:600;color:var(--muted);letter-spacing:0}.p60-big em{margin-left:auto;font-style:normal;font-size:17px;font-weight:700;color:var(--muted)}'+
  '.p60-line{height:4px;border-radius:2px;background:var(--line);overflow:hidden;margin:8px 0}.p60-line i{display:block;height:100%;background:var(--accent);border-radius:2px;min-width:2px}'+
  '.p60-facts{display:flex;gap:16px;flex-wrap:wrap;font-size:13px;color:var(--muted);margin-top:10px}.p60-facts b{color:var(--ink);font-weight:800;font-variant-numeric:tabular-nums}'+
  '.p60-h{display:flex;justify-content:space-between;align-items:baseline;font-size:13px;font-weight:700;color:var(--muted);margin:26px 2px 8px}.p60-h small{font-size:12px;font-weight:500}'+
  '.p60-list{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden}.p60-pad{padding:14px 12px 10px}'+
  '.p60-row{padding:14px 14px 12px;border-bottom:1px solid var(--line)}.p60-rt{display:flex;align-items:baseline;gap:10px}.p60-rt b{font-size:17px;font-weight:800}.p60-rt span{font-size:13px;color:var(--muted);font-variant-numeric:tabular-nums}.p60-rt em{margin-left:auto;font-style:normal;font-size:15px;font-weight:700;font-variant-numeric:tabular-nums}'+
  '.p60-rs{font-size:12.5px;color:var(--muted);line-height:1.6}.p60-test{display:flex;justify-content:space-between;align-items:center;margin-top:6px}'+
  '.p60-link{border:none;background:none;color:var(--accent);font-size:13.5px;font-weight:700;padding:6px 0 6px 12px;cursor:pointer;font-family:inherit}'+
  '.p60-rowlink{display:flex;justify-content:space-between;width:100%;border:none;background:none;color:var(--ink);font-size:14px;padding:14px;cursor:pointer;font-family:inherit;text-align:left}.p60-rowlink span:last-child{color:var(--muted)}'+
  '.p60-cols{display:flex;align-items:flex-end;gap:6px;height:96px}.p60-col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:4px;height:100%}'+
  '.p60-col em{font-style:normal;font-size:11.5px;font-weight:700;color:var(--muted);min-height:14px;font-variant-numeric:tabular-nums}.p60-col i{display:block;width:100%;max-width:26px;border-radius:3px;background:var(--lineStrong,var(--line))}.p60-col span{font-size:11px;color:var(--muted)}'+
  '.p60-col.today i{background:var(--accent)}.p60-col.today span,.p60-col.today em{color:var(--ink);font-weight:700}'+
  '.p60-cal{display:grid;grid-template-columns:repeat(7,1fr);gap:5px;text-align:center}.p60-cal span{font-size:11px;color:var(--muted);padding-bottom:2px}'+
  '.p60-cal i{font-style:normal;font-size:11.5px;line-height:30px;height:30px;border-radius:7px;color:var(--muted);background:transparent;font-variant-numeric:tabular-nums}.p60-cal i.fut{visibility:hidden}'+
  '.p60-cal i.s1{background:color-mix(in srgb,var(--accent) 22%,transparent);color:var(--ink)}.p60-cal i.s2{background:color-mix(in srgb,var(--accent) 42%,transparent);color:var(--ink)}.p60-cal i.s3{background:color-mix(in srgb,var(--accent) 65%,transparent);color:#fff}.p60-cal i.s4{background:var(--accent);color:#fff}'+
  '.p60-cal i.today{box-shadow:inset 0 0 0 1.5px var(--ink)}'+
  /* ホームの「いまの目標」も枠や装飾を外して1行に */
  '.p56-goal{background:none!important;border:none!important;padding:2px 2px 0!important;margin:0 0 14px!important;border-radius:0!important}.p56-goal b{font-size:14px!important;color:var(--ink)!important}.p56-gbar{height:4px!important;border-radius:2px!important;background:var(--line)!important}.p56-gbar i{background:var(--accent)!important;border-radius:2px!important}.p56-gn{color:var(--muted)!important;font-size:12.5px!important}';
  document.head.appendChild(st);
})();
