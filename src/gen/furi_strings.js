const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch();const out=new Set();
for(const f of process.argv.slice(2)){const p=await b.newPage();await p.goto('file://'+f);await p.waitForTimeout(800);
const r=await p.evaluate(()=>{const a=[];VOCAB.forEach(w=>{a.push(w.meaning,w.exJa,w.simpleExp)});(window.COMPOSE||[]).forEach(c=>a.push(c.ja));
 (window.P74_PATHS||[]).forEach(P=>(P.story||[]).forEach(s=>{(s.ex||[]).forEach(e=>a.push(e&&e[1]))}));(window.P82_Q?Object.values(P82_Q).flat().map(q=>q&&q[1]):[]).forEach(x=>a.push(x));
 return a.filter(x=>typeof x==='string'&&x.trim());});r.forEach(x=>out.add(x.trim()));await p.close();}
require('fs').writeFileSync(process.env.OUT||'/tmp/claude-0/s/jstr.json',JSON.stringify([...out]));console.log(out.size);await b.close();})();
