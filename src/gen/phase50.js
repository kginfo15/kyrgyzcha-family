/* ===== PHASE50: クラウド保存（Claudeアカウントごとに非公開で自動同期）とバックアップ ===== */
var P50={db:null,coll:null,state:"connecting",lastAt:0,busy:false,timer:null,sent:{},err:"",
  metaKey:K.prog.replace("vocabProgress","syncMeta")};
P50.meta=lget(P50.metaKey,{});
var P50_PB=12,P50_CB=4;
function p50Hash(s){var h=0;for(var i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}
function p50Payloads(){
  var o={settings:settings,hist:appHist,known:p47Known},i;
  for(i=0;i<P50_PB;i++)o["prog"+i]={};
  for(i=0;i<P50_CB;i++)o["cprog"+i]={};
  Object.keys(progress).forEach(function(id){o["prog"+(p50Hash(id)%P50_PB)][id]=progress[id];});
  Object.keys(cprogress).forEach(function(id){o["cprog"+(p50Hash(id)%P50_CB)][id]=cprogress[id];});
  return o;
}
function p50Adopt(docId,obj){
  var m;
  if(docId==="settings"){Object.keys(obj).forEach(function(k){settings[k]=obj[k];});}
  else if(docId==="hist"){appHist=obj;if(!appHist.days)appHist.days={};if(!appHist.streak)appHist.streak={count:0,last:null};if(!appHist.totals)appHist.totals={};}
  else if(docId==="known"){p47Known=obj||{};lset(P47_KNOWN_KEY,p47Known);}
  else if((m=/^prog(\d+)$/.exec(docId))){var b=+m[1];Object.keys(progress).forEach(function(id){if(p50Hash(id)%P50_PB===b)delete progress[id];});Object.keys(obj).forEach(function(id){progress[id]=obj[id];});}
  else if((m=/^cprog(\d+)$/.exec(docId))){var c=+m[1];Object.keys(cprogress).forEach(function(id){if(p50Hash(id)%P50_CB===c)delete cprogress[id];});Object.keys(obj).forEach(function(id){cprogress[id]=obj[id];});}
}
var _p50SaveAll=saveAll;
saveAll=function(){var r=_p50SaveAll.apply(this,arguments);p50Schedule();return r;};
var _p50SaveKnown=p47SaveKnown;
p47SaveKnown=function(){var r=_p50SaveKnown.apply(this,arguments);p50Schedule();return r;};
function p50Schedule(){if(!P50.coll)return;clearTimeout(P50.timer);P50.timer=setTimeout(p50Flush,4000);}
async function p50Flush(){
  if(!P50.coll||P50.busy)return;
  P50.busy=true;clearTimeout(P50.timer);
  try{
    var pl=p50Payloads(),ids=Object.keys(pl),changed=false,tooBig="";
    for(var i=0;i<ids.length;i++){
      var id=ids[i],s=JSON.stringify(pl[id]);
      if(s===P50.sent[id])continue;
      if(s.length>250000){tooBig="データが大きすぎて一部を保存できませんでした";continue;}
      var t=Date.now();
      try{await P50.coll.doc(id).set({t:t,v:s});}
      catch(e){
        if(e&&e.code==="unavailable"){await new Promise(function(r){setTimeout(r,800+Math.random()*800);});await P50.coll.doc(id).set({t:t,v:s});}
        else throw e;
      }
      P50.sent[id]=s;P50.meta[id]=t;changed=true;
    }
    if(changed){lset(P50.metaKey,P50.meta);P50.lastAt=Date.now();}
    P50.state="cloud";P50.err=tooBig;
  }catch(e){
    var c=e&&e.code;
    P50.state=(c==="revoked"||c==="not_granted"||c==="invalid_argument")?"local":"error";
    P50.err=c==="invalid_argument"?"このページの共有設定では保存できません（編集できる権限が必要です）":(c==="quota_exceeded"?"保存容量の上限に達しました":"保存できませんでした。通信状態を確認してください");
  }
  P50.busy=false;
  if(ui.bnav==="settings")render();
}
async function p50Init(){
  var to=setTimeout(function(){if(P50.state==="connecting"){P50.state="local";P50.err="クラウドに接続できませんでした";if(ui.bnav==="settings")render();}},12000);
  try{
    if(!window.claude||!window.claude.use){P50.state="local";P50.err="";clearTimeout(to);return;}
    var db=await window.claude.use("db"),user=await window.claude.use("user");
    var uid=user?await user.id():null;
    if(!db||!uid){P50.state="local";P50.err=db?"Claudeにログインすると保存できます":"";clearTimeout(to);if(ui.bnav==="settings")render();return;}
    P50.db=db;
    P50.coll=db.collection("data/users/"+uid);
    var snap=await P50.coll.get(),adopted=false;
    snap.docs.forEach(function(d){
      if(!d.exists)return;var body=d.data(),id=d.id;if(!body||typeof body.v!=="string")return;
      /* 設定の中の p85（AIコーチの到達テストの履歴など）は、どちらが新しくても足し合わせる */
      if(id==="settings"&&typeof p85MergeSettings==="function"){try{p85MergeSettings(JSON.parse(body.v));}catch(_){}}
      var local=JSON.stringify(p50Payloads()[id]);
      if(body.v===local){P50.sent[id]=body.v;P50.meta[id]=body.t;return;}
      if((body.t||0)>(P50.meta[id]||0)||/^lg\d/.test(id)){try{p50Adopt(id,JSON.parse(body.v));P50.sent[id]=body.v;P50.meta[id]=body.t;adopted=true;}catch(_){}}
    });
    clearTimeout(to);
    lset(P50.metaKey,P50.meta);
    P50.state="cloud";P50.err="";P50.lastAt=Date.now();
    if(adopted){_p50SaveAll();toast("クラウドの記録を読み込みました");render();}
    p50Flush();
    document.addEventListener("visibilitychange",function(){if(document.visibilityState==="hidden")p50Flush();});
  }catch(e){clearTimeout(to);P50.state="local";P50.err="クラウドに接続できませんでした";}
  if(ui.bnav==="settings")render();
}
setTimeout(p50Init,0);
/* ---- バックアップ（書き出し・読み込み） ---- */
exportData=async function(){
  var data={appVersion:APP_VERSION,dataVersion:DATA_VERSION,exportedAt:new Date().toISOString(),settings:settings,vocabProgress:progress,composeProgress:cprogress,knownWords:p47Known,streak:appHist.streak,learningHistory:appHist.days,totals:appHist.totals,coachLog:(typeof P85!=="undefined"?P85.log:undefined)};
  var json=JSON.stringify(data,null,2),name=(P47_LANG==="ky"?"kyrgyz":"russian")+"_backup_"+todayKey()+".json";
  try{
    var dl=window.claude&&window.claude.use?await window.claude.use("downloads"):null;
    if(dl){await dl.save({filename:name,data:json});toast("バックアップを保存しました");return;}
  }catch(e){if(e&&e.code!=="unavailable"){toast("保存を取りやめました");return;}}
  var blob=new Blob([json],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");
  a.href=url;a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(url);a.remove();},200);toast("バックアップを書き出しました");
};
importData=function(){
  var inp=document.createElement("input");inp.type="file";inp.accept="application/json,.json";
  inp.onchange=function(){var f=inp.files[0];if(!f)return;var r=new FileReader();
    r.onload=function(){try{var d=JSON.parse(r.result);
      if(!confirm("バックアップの内容で今の記録を置き換えます。よろしいですか？"))return;
      if(d.vocabProgress)progress=d.vocabProgress;if(d.composeProgress)cprogress=d.composeProgress;
      if(d.settings)Object.keys(d.settings).forEach(function(k){settings[k]=d.settings[k];});
      if(d.knownWords){p47Known=d.knownWords;lset(P47_KNOWN_KEY,p47Known);}
      if(d.coachLog&&typeof p85Merge==="function"){Object.keys(d.coachLog).forEach(function(m){p85Merge(m,d.coachLog[m]);});p85SaveLocal();}if(d.streak)appHist.streak=d.streak;if(d.learningHistory)appHist.days=d.learningHistory;if(d.totals)appHist.totals=d.totals;
      saveAll();render();toast("バックアップを読み込みました");}catch(e){toast("ファイルを読み込めませんでした");}};
    r.readAsText(f);};
  inp.click();
};
/* ---- 設定画面：データの保存 ---- */
var _p50Settings=renderSettings;
renderSettings=function(embed){
  var h=String(_p50Settings(embed)),st=P50.state,tm="";
  if(P50.lastAt){var d=new Date(P50.lastAt);tm=String(d.getHours()).padStart(2,"0")+":"+String(d.getMinutes()).padStart(2,"0");}
  var head=st==="cloud"?'<b>クラウドに自動保存中</b><small>Claudeアカウントに保存され、どの端末で開いても同じ記録から続けられます。記録はあなただけが見られます。'+(tm?' 最終確認 '+tm:'')+'</small>'
    :st==="connecting"?'<b>クラウドに接続中…</b><small>少しお待ちください</small>'
    :st==="error"?'<b>保存できていません</b><small>'+esc(P50.err)+'。次の操作のときにもう一度試します。</small>'
    :'<b>この端末だけに保存</b><small>'+(P50.err?esc(P50.err)+'。':'')+'ブラウザのデータを消すと記録も消えます。下のボタンでバックアップを取ってください。</small>';
  var s='<div class="p47-set p50-save'+(st==="cloud"?" ok":"")+'"><div class="p50-row"><span class="p50-ic p48-ill">'+p48Art(st==="cloud"?"home":"case",30)+'</span><div class="p47-setrow">'+head+'</div></div>'+
    '<div class="p50-btns">'+(st==="cloud"?'<button type="button" class="p47-btn" data-act="p50sync">今すぐ保存</button>':'')+
    '<button type="button" class="p47-btn" data-act="p50export">バックアップを書き出す</button><button type="button" class="p47-btn" data-act="p50import">バックアップから戻す</button></div></div>';
  return h.replace('<div class="p47-set"><div class="p47-setrow"><div><b>1日のチャレンジ数</b>',s+'<div class="p47-set"><div class="p47-setrow"><div><b>1日のチャレンジ数</b>');
};
document.addEventListener("click",function(e){
  var el=e.target.closest&&e.target.closest("[data-act]");if(!el)return;
  var a=el.getAttribute("data-act");
  if(a!=="p50sync"&&a!=="p50export"&&a!=="p50import")return;
  e.stopImmediatePropagation();e.preventDefault();
  if(a==="p50sync"){P50.sent={};p50Flush().then(function(){toast(P50.state==="cloud"?"クラウドに保存しました":"保存できませんでした");});return;}
  if(a==="p50export"){exportData();return;}
  if(a==="p50import"){importData();return;}
},true);
(function(){
  var css='.p50-row{display:flex;gap:12px;align-items:flex-start}.p50-ic{width:48px;height:48px;border-radius:14px;display:flex;align-items:center;justify-content:center;flex:0 0 auto}'+
    '.p50-save .p47-setrow b{font-size:15px}.p50-save .p47-setrow small{line-height:1.6;margin-top:4px}.p50-save.ok{border-color:color-mix(in srgb,var(--accent) 45%,var(--line))}'+
    '.p50-btns{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}.p50-btns .p47-btn{font-size:12.5px;padding:11px 6px}.p50-btns .p47-btn:first-child:nth-last-child(3){grid-column:1/-1;background:var(--accent);border-color:var(--accent);color:#fff}';
  try{var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);}catch(_){}
})();
