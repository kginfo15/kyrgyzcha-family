const {chromium}=require('playwright');
const LINKS={"Kaktus.media": "https://kaktus.media/doc/556368_voditeley_predypredili_o_lavinah_i_gololede_na_odnoy_iz_gornyh_dorog.html", "24.kg": "https://24.kg/article/kurs-valyut-v-bankah-kyrgyzstana-na-6-noyabrya", "Economist.kg": "https://economist.kg/biznes/2026/11/06/kitaiskaia-goskompaniia-postroit-v-kyzyl-kie-krupnyi-rynok-na-100-tysiach-m2/", "Азаттык": "https://www.azattyqasia.org/a/kyrgyzstan-dobivaetsya-vozvrascheniya-svoego-grazhdanina-iz-rossiyskoy-voinskoy-chasti/33892065.html", "Tazabek.KG": "https://news.google.com/rss/articles/CBMiS0FVX3lxTE9uUHdsOFhIYnpYZnl3MnVMQW00SS1jTE82QmtiUlBkeHFmOXE0UDZyOE81QlNZdy0xOEhXX0U2dXpPQWZqTnIyTEhoONIBUEFVX3lxTE1OcGF3ZURWWkdtdnI1dmdHNGFkVlRuaEg2VGxSTzNjZnRlSXVUckRCTkp6Tkgtc2swa3ktZWlUZThLOVJsOXJjUWo5N3JVRGlm?oc=5", "Кактус.медиа": "https://news.google.com/rss/articles/CBMilwFBVV95cUxNMmpMNjFGSmtqUWxYSml6Uy1mUmU3VVNvQlFrR09zLXRtek9uZnFWdG01d0x3NDR2ckhCSC1YUFo0OWMzYzZ2V3pkUXpQSVpJZjFRekhIUWdUcHd0YmJmX3JYN1NrS2hIZjB5b2gteUVDclNHNl9VelpoeVlIZkJXR0JYbGRiZmhrRFFXRHVJLW84TzRUNmMw?oc=5", "24.KG": "https://news.google.com/rss/articles/CBMilgFBVV95cUxPZndJYkVET0pSOGFodVFuOG8xMkpUemVtV245aXhLS3RVNG9mOVlCZ1JSWlgxVUVsSldTUkdvQVhNSmZ2aE9COVhGRU5QZmoyMWxhMmFCQ1lVUzdmOVZIREVCX3pGSG4xSm1QR3AtR2ltaXZIYzZkb0VVN1pUS1J0eVVCMFdYTHJXajc5dVRfQ1kwVG1RVmc?oc=5"};
function jaLink(url){
  try{
    const u = new URL(url);
    if(!/^https?:$/.test(u.protocol)) return url;
    if(/(^|\.)news\.google\.com$/.test(u.hostname) || /\.translate\.goog$/.test(u.hostname))
      return "https://translate.google.com/translate?sl=auto&tl=ja&hl=ja&u=" + encodeURIComponent(url);
    const host = u.hostname.replace(/-/g,"--").replace(/\./g,"-") + ".translate.goog";
    const q = new URLSearchParams(u.search);
    q.set("_x_tr_sl","auto"); q.set("_x_tr_tl","ja"); q.set("_x_tr_hl","ja"); q.set("_x_tr_pto","wapp");
    return `https://${host}${u.pathname}?${q.toString()}${u.hash}`;
  }catch(e){ return url; }
}
(async()=>{const b=await chromium.launch();
for(const [src,url] of Object.entries(LINKS)){
  const ctx=await b.newContext({locale:'ja-JP',userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1',viewport:{width:390,height:844}});
  const p=await ctx.newPage(); const t=jaLink(url);
  try{
    const r=await p.goto(t,{waitUntil:'domcontentloaded',timeout:45000});
    await p.waitForTimeout(9000);
    const txt=(await p.evaluate(()=>document.body?document.body.innerText:''))||'';
    const ja=(txt.match(/[぀-ヿ一-鿿]/g)||[]).length, cy=(txt.match(/[Ѐ-ӿ]/g)||[]).length;
    const h1=await p.evaluate(()=>{const e=document.querySelector('h1');return e?e.innerText:''});
    console.log('RESULT',src,'| status',r&&r.status(),'| final',p.url().slice(0,80),'| ja',ja,'cyr',cy,'| h1:',h1.slice(0,60));
  }catch(e){console.log('RESULT',src,'| ERROR',e.message.slice(0,120));}
  await ctx.close();
}
await b.close();})();
