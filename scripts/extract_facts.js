// Quarterly step 1: pull the numbers a sector's text report may use, straight from the site.
// Usage: node extract_facts.js <monitor.html> <sector-data dir> <sector id|all> <period start YYYY-MM-DD> <out dir>
// Opens monitor.html in headless Chromium, serves the sector-data files locally (no network needed),
// runs the page's own sumData() so the numbers are exactly what the summary screen shows,
// and writes <out dir>/facts-<sector>.json. The text writer may only use numbers found here
// (or in the news headlines / strategy trees / indicator tags that the refs point to).
const {chromium} = require('playwright');
const fs = require('fs'), path = require('path');
const [html, dataDir, which, start, outDir] = process.argv.slice(2);
(async () => {
  const b = await chromium.launch();
  const pg = await b.newPage();
  await pg.route(/raw\.githubusercontent\.com\/kginfo15\/kyrgyzcha-family\/sector-data\/(.*)/, r => {
    const n = r.request().url().split('/sector-data/')[1].split('?')[0], f = path.join(dataDir, n);
    fs.existsSync(f) ? r.fulfill({path: f, contentType: 'application/json'}) : r.fulfill({status: 404, body: ''});
  });
  await pg.goto('file://' + path.resolve(html) + '#v=home');
  await pg.waitForFunction(() => typeof projReady === 'function' && projReady(), null, {timeout: 90000});
  await pg.waitForTimeout(1500);
  const sids = which === 'all' ? await pg.evaluate(() => Object.keys(SUM_SPEC)) : [which];
  fs.mkdirSync(outDir, {recursive: true});
  for (const sid of sids) {
    const facts = await pg.evaluate(([sid, start]) => {
      const M = v => Math.round(v / 1e5) / 10;          // US$ -> millions, 1 decimal
      const D = sumData(sid), t0 = Date.parse(start), now = Date.now();
      const set = new Set(); for (const r of D.rows) for (const p of r.ps) set.add(p);
      const mapped = [...set];
      const sumBy = (ps) => { const o = {}; for (const p of ps) o[p.donor] = (o[p.donor] || 0) + shareAmt(p); for (const k in o) o[k] = M(o[k]); return Object.fromEntries(Object.entries(o).sort((a, b) => b[1] - a[1])); };
      const endBy = (ps, lim) => ps.filter(p => p.e && p.e <= lim);
      const y = new Date().getFullYear(), e1 = y + '-12-31', e2 = (y + 1) + '-12-31';
      const proj = p => ({id: p.id, donor: p.donor, name: (p.tj || p.t || '').slice(0, 90), musd: M(shareAmt(p)), start: p.s || '', end: p.e || '', rows: D.rows.filter(r => r.ps.includes(p)).map(r => r.id)});
      const news = items().filter(x => x.c.includes(sid) && x.ts >= t0 && (x.g || x.d.length))
        .map(x => ({id: x.i, date: new Date(x.ts).toISOString().slice(0, 10), gov: !!x.g, donors: x.d, title: x.tj || x.t, url: x.u}));
      const newProj = mapped.filter(p => p.s && Date.parse(p.s) >= t0);
      return {
        sector: sid, asof: new Date().toISOString().slice(0, 10), data: INDEX.updated, period_start: start,
        active_n: D.act.length, active_musd: M(D.act.reduce((v, p) => v + shareAmt(p), 0)),
        mapped_n: mapped.length, mapped_musd: M(mapped.reduce((v, p) => v + shareAmt(p), 0)),
        by_donor: sumBy(mapped),
        ['end_' + y + '_n']: endBy(mapped, e1).length, ['end_' + y + '_musd']: M(endBy(mapped, e1).reduce((v, p) => v + shareAmt(p), 0)), ['end_' + y + '_by_donor']: sumBy(endBy(mapped, e1)),
        ['end_' + (y + 1) + '_n']: endBy(mapped, e2).length, ['end_' + (y + 1) + '_musd']: M(endBy(mapped, e2).reduce((v, p) => v + shareAmt(p), 0)),
        empty_rows: D.rows.filter(r => !r.ps.length).map(r => r.id),
        rows: Object.fromEntries(D.rows.map(r => [r.id, {name: r.n, level: r.lv, n: r.ps.length, musd: M(r.a), by_donor: Object.fromEntries(Object.entries(r.by).map(([k, v]) => [k, M(v)])),
          ['end_' + y + '_musd']: M(endBy(r.ps, e1).reduce((v, p) => v + shareAmt(p), 0))}])),
        new_projects: newProj.map(proj),
        top_projects: mapped.sort((a, b) => shareAmt(b) - shareAmt(a)).slice(0, 25).map(proj),
        not_mapped_top: D.act.filter(p => !set.has(p)).sort((a, b) => shareAmt(b) - shareAmt(a)).slice(0, 10).map(proj),
        news_n: news.length, news
      };
    }, [sid, start]);
    fs.writeFileSync(path.join(outDir, 'facts-' + sid + '.json'), JSON.stringify(facts, null, 1));
    console.log(sid, 'mapped', facts.mapped_n, facts.mapped_musd, 'news', facts.news_n);
  }
  await b.close();
})();
