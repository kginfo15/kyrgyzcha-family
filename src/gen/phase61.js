/* ===== PHASE61: 録音済みの音声（キルギス語）。audio/ky-index.json と audio/ky-*.mp3 があれば端末の読み上げより優先して再生 ===== */
var P61={idx:null,full:{},el:null,token:0,unlocked:false,base:"audio/"};
function p61Norm(t){
  var s=String(t||"").toLowerCase().replace(/́/g,"");
  try{s=s.replace(/[^\p{L}\p{N}_\s\-]/gu," ");}catch(_){s=s.replace(/[.,!?;:()«»"'…—–\/]/g," ");}
  return s.replace(/\s+/g," ").trim();
}
function p61Has(text){return !!(P61.idx&&P61.idx[p61Norm(text)]);}
function p61El(){if(!P61.el){P61.el=new Audio();P61.el.preload="auto";}return P61.el;}
function p61Stop(){P61.token++;try{if(P61.el){P61.el.pause();}}catch(_){}}
function p61Bytes(rec){
  var name=rec[0],off=rec[1],len=rec[2],url=P61.base+"ky-"+name+".mp3";
  if(P61.full[name])return Promise.resolve(P61.full[name].slice(off,off+len));
  return fetch(url,{headers:{Range:"bytes="+off+"-"+(off+len-1)}}).then(function(r){
    if(!r.ok)throw new Error("http "+r.status);
    return r.arrayBuffer().then(function(buf){
      if(r.status===206&&buf.byteLength<=len+16)return buf;
      P61.full[name]=buf;return buf.slice(off,off+len); /* サーバーが範囲指定に対応していない場合は全体を保持 */
    });
  });
}
/* 再生できたら true、録音が無い・失敗なら false で解決 */
function p61Play(text,rate){
  var rec=P61.idx&&P61.idx[p61Norm(text)];
  if(!rec)return Promise.resolve(false);
  var my=++P61.token;
  return p61Bytes(rec).then(function(buf){
    if(my!==P61.token)return true;
    var el=p61El(),url=URL.createObjectURL(new Blob([buf],{type:"audio/mpeg"}));
    return new Promise(function(resolve){
      var done=false,fin=function(ok){if(done)return;done=true;try{URL.revokeObjectURL(url);}catch(_){}resolve(ok);};
      el.onended=function(){fin(true);};el.onerror=function(){fin(false);};el.onpause=function(){if(my!==P61.token)fin(true);};
      el.src=url;
      try{el.playbackRate=Math.max(0.5,Math.min(1.5,(rate||settings.ruRate||0.9)/0.9));}catch(_){}
      var p=el.play();if(p&&p.catch)p.catch(function(){fin(false);});
      setTimeout(function(){fin(true);},20000);
    });
  }).catch(function(){return false;});
}
(function(){
  if(typeof P47_LANG==="undefined"||P47_LANG!=="ky"||!window.fetch)return;
  fetch(P61.base+"ky-index.json").then(function(r){if(!r.ok)throw 0;return r.json();}).then(function(j){P61.idx=j;if(ui.bnav==="settings")render();}).catch(function(){});
  /* iPhone では最初のタップで音声再生を有効にしておく */
  var unlock=function(){if(P61.unlocked)return;P61.unlocked=true;try{var el=p61El();el.src="data:audio/mpeg;base64,//MoxAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV//MoxDsAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV//MoxHYAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV//MoxLEAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVMQU1FMy4xMDBVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//MoxMQAAANIAAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV";var p=el.play();if(p&&p.catch)p.catch(function(){});}catch(_){}};
  document.addEventListener("touchend",unlock,true);document.addEventListener("click",unlock,true);
  var _spk=speak;
  speak=function(text,rate){
    if(!p61Has(text)){p61Stop();return _spk.apply(this,arguments);}
    try{window.speechSynthesis&&window.speechSynthesis.cancel();}catch(_){}
    var a=arguments,self=this;
    p61Play(text,rate).then(function(ok){if(!ok)_spk.apply(self,a);});
  };
  var _su=speakUtterance;
  speakUtterance=function(text,lang,rate,voice){
    if(String(lang||"").indexOf("ja")===0||!p61Has(text))return _su.apply(this,arguments);
    var a=arguments,self=this;
    return p61Play(text,rate).then(function(ok){if(!ok)return _su.apply(self,a);});
  };
  try{var ss=window.speechSynthesis;if(ss&&ss.cancel){var _c=ss.cancel.bind(ss);ss.cancel=function(){p61Stop();return _c();};}}catch(_){}
  var _set=renderSettings;
  renderSettings=function(embed){
    var h=String(_set.apply(this,arguments));
    return h+'<div class="p61-note">'+(P61.idx?'キルギス語は録音音声（'+Object.keys(P61.idx).length.toLocaleString()+'件）で再生します。録音が無い文は端末の読み上げになります。<br>音声：kyrgyz-ai/TTS_small（MMS-TTS を元にしたキルギス語モデル, CC BY-NC 4.0）':'録音音声を読み込めないため、端末の読み上げを使っています。')+'</div>';
  };
  var st=document.createElement("style");st.textContent='.p61-note{font-size:11.5px;color:var(--muted);line-height:1.7;margin:18px 4px 8px}';document.head.appendChild(st);
})();
