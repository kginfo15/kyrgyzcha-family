const {chromium}=require('playwright');
(async()=>{const f=process.argv[2];const b=await chromium.launch();
 const SKIP=/^(resetdata|reset|resetall|p50export|p50import|exportdata|importdata|onbreplay|p50sync|copy|p55ai|p55start|p55send|p55report|p55mic|aisend|dl|csv)/i;
 const screens=[["home",null],["hub",null],["stats",null],["settings",null]];
 const views=["compose","p55talk","p55read","listening","p55mist","gnote","qadrill","dialog","p47words","search","a2check","reviewqueue"];
 views.forEach(v=>screens.push(["view",v]));
 const problems=[];let tested=0;
 for(const [kind,v] of screens){
  const p0=await b.newPage({viewport:{width:390,height:844}});
  await p0.addInitScript(()=>{for(const pre of ["russianApp_v1_","kyrgyzApp_v4_"])localStorage.setItem(pre+"onboardingDone",'true');window.confirm=()=>false;window.alert=()=>{};});
  await p0.goto('file://'+f);await p0.waitForTimeout(600);
  const setup=async(p)=>{await p.evaluate(([kind,v])=>{
     VOCAB.slice(0,30).forEach(w=>{const pr=P(w.id);pr.status="learning";pr.correctCount=1;pr.nextReview=Date.now()-1;});answer(VOCAB[2].id,"no");
     if(kind==="home"){ui.bnav="home";}else if(kind==="hub"){ui.bnav="wordbook";ui.learnOpen=false;}else if(kind==="stats"){ui.bnav="stats";}else if(kind==="settings"){ui.bnav="settings";}
     else{ui.bnav="wordbook";ui.learnOpen=true;ui.view=v;}render();},[kind,v]);};
  await setup(p0);
  const acts=await p0.evaluate(()=>Array.from(document.querySelectorAll('#main [data-act], nav.bnav [data-act]')).map((el,i)=>({i,a:el.getAttribute('data-act'),v:el.getAttribute('data-val')})));
  await p0.close();
  const seen={};
  for(const t of acts){
   const key=t.a+'|'+t.v; if(seen[key]||SKIP.test(t.a))continue; seen[key]=1;
   const p=await b.newPage({viewport:{width:390,height:844}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
   await p.addInitScript(()=>{for(const pre of ["russianApp_v1_","kyrgyzApp_v4_"])localStorage.setItem(pre+"onboardingDone",'true');window.confirm=()=>false;window.alert=()=>{};});
   await p.goto('file://'+f);await p.waitForTimeout(500);await setup(p);
   const sel='[data-act="'+t.a+'"]'+(t.v!==null?'[data-val="'+t.v.replace(/"/g,'\\"')+'"]':'');
   try{const el=await p.$(sel); if(el){await el.click({timeout:2000});await p.waitForTimeout(250);} }catch(e){errs.push('click '+e.message.split('\n')[0]);}
   const st=await p.evaluate(()=>({bnav:ui.bnav,view:ui.view,lo:ui.learnOpen,sess:!!ui.session,cs:!!ui.composeSession,len:(document.getElementById('main')||{}).innerText.length}));
   tested++;
   if(errs.length||st.len<20)problems.push({from:kind+(v?':'+v:''),act:key,errs,st});
   // back-button expectations
   if(t.a==='closelearn'){const exp={p47words:'home',search:'wordbook/p47words',a2check:'stats'}[v]||'hub';
     const got=st.bnav==='home'?'home':(st.bnav==='stats'?'stats':(st.lo?'wordbook/'+st.view:'hub'));
     if(got!==exp)problems.push({from:kind+':'+v,act:'BACK',expected:exp,got});}
   await p.close();
  }
 }
 console.log('tested',tested);console.log(JSON.stringify(problems.filter(x=>x.act==="BACK"||(x.errs||[]).some(e=>!/Timeout/.test(e))||(x.st&&x.st.len<20))));await b.close();})();
