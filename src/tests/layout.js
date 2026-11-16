const {chromium}=require('playwright');
(async()=>{const f=process.argv[2];const b=await chromium.launch();const p=await b.newPage({viewport:{width:375,height:667}});
 await p.addInitScript(()=>{for(const pre of ["russianApp_v1_","kyrgyzApp_v4_"])localStorage.setItem(pre+"onboardingDone",'true');});
 await p.goto('file://'+f);await p.waitForTimeout(600);
 const states=[["home",{bnav:"home"}],["hub",{bnav:"wordbook",learnOpen:false}],["stats",{bnav:"stats"}],["settings",{bnav:"settings"}]];
 ["compose","p55talk","p55read","listening","p55mist","gnote","qadrill","dialog","p47words","search","a2check"].forEach(v=>states.push([v,{bnav:"wordbook",learnOpen:true,view:v}]));
 const out=[];
 for(const [name,s] of states){
  const r=await p.evaluate((s)=>{Object.assign(ui,s);ui.session=null;ui.composeSession=null;render();window.scrollTo(0,0);
    const W=window.innerWidth,over=[];document.querySelectorAll('#main *').forEach(el=>{const rc=el.getBoundingClientRect();if(rc.width>0&&(rc.right>W+1||rc.left<-1)){const cls=(el.className&&el.className.baseVal===undefined?el.className:'')||el.tagName;over.push(String(cls).slice(0,30)+':'+Math.round(rc.right));}});
    const back=document.querySelector('.p51-back,.subhead button');const bt=back?Math.round(back.getBoundingClientRect().top):null;
    return {sw:document.documentElement.scrollWidth,W,over:[...new Set(over)].slice(0,6),backTop:bt};},s);
  out.push(name+' '+JSON.stringify(r));
 }
 // study screens
 const st=await p.evaluate(()=>{ui.bnav="wordbook";ui.view="word";ui.learnOpen=true;VOCAB.slice(0,5).forEach(w=>{const pr=P(w.id);pr.status="learning";pr.correctCount=1;});startSessionFromIds(VOCAB.slice(0,5).map(w=>w.id),"t");window.scrollTo(0,0);
   const W=window.innerWidth,over=[];document.querySelectorAll('#main *').forEach(el=>{const rc=el.getBoundingClientRect();if(rc.width>0&&rc.right>W+1)over.push((el.className||el.tagName)+'');});return {sw:document.documentElement.scrollWidth,over:[...new Set(over)].slice(0,6),h:document.documentElement.scrollHeight};});
 out.push('quiz '+JSON.stringify(st));
 console.log(out.join('\n'));await b.close();})();
