const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const a of ['ru','ky']){const p=await b.newPage({viewport:{width:375,height:667}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.addInitScript(()=>{for(const pre of ["russianApp_v1_","kyrgyzApp_v4_"])localStorage.setItem(pre+"onboardingDone",'true');});
await p.goto('file://'+process.cwd()+'/build_tmp/'+a+'.html');await p.waitForTimeout(500);
const meas=async(name)=>{await p.waitForTimeout(150);const r=await p.evaluate(()=>{scrollTo(0,0);const H=innerHeight;const nav=document.querySelector('nav.bnav');const navTop=nav&&getComputedStyle(nav).display!=='none'?nav.getBoundingClientRect().top:H;
 const btns=[...document.querySelectorAll('#main button')].filter(e=>e.offsetParent);const hidden=btns.filter(e=>e.getBoundingClientRect().bottom>navTop).map(e=>(e.innerText||e.getAttribute('aria-label')||e.dataset.act||'').trim().slice(0,14));
 const back=document.querySelector('#main .p51-back');return {docH:document.documentElement.scrollHeight,H,navTop:Math.round(navTop),back:back?Math.round(back.getBoundingClientRect().top):null,below:hidden.slice(0,8)};});
 console.log(a,name,JSON.stringify(r));await p.screenshot({path:'F_'+a+'_'+name+'.png'});};
await p.evaluate(()=>{ui.bnav='wordbook';ui.learnOpen=true;startSession(VOCAB.slice(0,10).map(w=>w.id),'t');render();});await meas('card');
await p.evaluate(()=>{const b=document.querySelector('[data-act="flip"],.flipbtn,[data-act="reveal"]');b&&b.click();});await meas('cardflip');
await p.evaluate(()=>{ui.session=null;ui.bnav='wordbook';ui.learnOpen=true;ui.view='compose';startCompose(COMPOSE.slice(0,5).map(c=>c.id),'t');render();});await meas('compose');
await p.evaluate(()=>{ui.composeSession=null;p58Start('A2');const g=ui.p58.items.findIndex(i=>i.kind==='gram');ui.p58.pos=g;render();});await meas('testgram');
await p.evaluate(()=>{const g=ui.p58.items.findIndex(i=>i.kind==='read');ui.p58.pos=g;render();});await meas('testread');
console.log(a,'errs',errs);await p.close();}
await b.close();})();
