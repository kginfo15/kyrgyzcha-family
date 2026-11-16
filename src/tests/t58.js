const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const f of ['build_tmp/ru.html','build_tmp/ky.html']){
 const p=await b.newPage({viewport:{width:375,height:740}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(()=>{for(const pre of ["russianApp_v1_","kyrgyzApp_v4_"])localStorage.setItem(pre+"onboardingDone",'true');});
 await p.goto('file://'+process.cwd()+'/'+f);await p.waitForTimeout(600);
 for(const lv of ['A1','A2']){
  const info=await p.evaluate(lv=>{p58Start(lv);const T=ui.p58;const c={v:0,g:0,r:0};T.items.forEach(i=>c[i.sec]++);
   const g=T.items.filter(i=>i.kind==='gram');const bad=g.filter(i=>(i.sent.match(/＿＿＿/g)||[]).length!==1||i.opts.length<3||i.ans<0);
   const dupOpts=T.items.filter(i=>i.opts&&new Set(i.opts).size!==i.opts.length).length;
   return {c,bad:bad.length,dupOpts,samples:g.slice(0,4).map(i=>i.sent+' | '+i.opts.join('/')+' => '+i.correct)};},lv);
  console.log(f,lv,JSON.stringify(info));
  // answer all: correct for first 40, wrong for rest
  for(let k=0;k<45;k++){const ok=await p.evaluate(k=>{const T=ui.p58;if(!T||T.done)return false;const it=T.items[T.pos];const v=k<40?it.ans:(it.ans+1)%it.opts.length;const el=document.querySelector('[data-act="p58pick"][data-val="'+v+'"]');if(!el)return 'noel';el.click();return true;},k);if(ok!==true){if(ok==='noel')console.log('noel at',k);break;}await p.waitForTimeout(ok?50:0);
   await p.waitForTimeout(700);}
  const r=await p.evaluate(lv=>({done:ui.p58&&ui.p58.done,lt:appHist.levelTests&&appHist.levelTests[lv],txt:document.getElementById('main').innerText.slice(0,200)}),lv);
  console.log(JSON.stringify(r));
  await p.screenshot({path:'shot_'+f.split('/')[1]+lv+'.png',fullPage:true});
 }
 console.log('errs',errs);await p.close();}
await b.close();})();
