const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();
for(const [name,opt] of [["pc",{viewport:{width:1440,height:900}}],["iphone",{...devices['iPhone 13']}]]){
  const ctx=await b.newContext(opt);const p=await ctx.newPage();
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('requestfailed',r=>{if(/leaflet|carto/.test(r.url()))errs.push('FAILED '+r.url())});
  await p.goto('https://yuuuta21.github.io/kyrgyzcha-family/weather.html?v='+Date.now(),{waitUntil:'networkidle'});
  await p.waitForTimeout(3000);
  console.log(name,'favs',await p.locator('.fav').count(),'cities',await p.locator('.city').count(),'news items',await p.locator('#news .nitem').count(),'passes',await p.locator('.pass').count());
  await p.click('#openMap');await p.waitForTimeout(6000);
  console.log(name,'MAP: L',await p.evaluate(()=>!!window.L),'| tiles loaded',await p.locator('img.leaflet-tile-loaded').count(),'| markers',await p.locator('.leaflet-marker-icon').count(),'| errors',JSON.stringify(errs.slice(0,4)));
  await ctx.close();}
await b.close();})();
