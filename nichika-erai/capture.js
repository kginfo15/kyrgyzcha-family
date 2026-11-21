// index.html を1フレームずつ撮って ffmpeg で mp4 にする。
// 使い方: node capture.js [out.mp4] [fps]   (PREVIEW="1,6,10" で静止画だけ書き出し)
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');

(async () => {
  const out = process.argv[2] || path.join(__dirname, 'nichika-erai.mp4');
  const fps = +(process.argv[3] || 30), total = 60;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  await page.goto('file://' + path.join(__dirname, 'index.html') + '#capture');
  await page.evaluate(() => document.fonts.load('900 40px Maru', 'にちか').then(() => document.fonts.ready));
  if (process.env.PREVIEW) {
    for (const t of process.env.PREVIEW.split(',')) {
      await page.evaluate(t => window.render(t), +t);
      await page.screenshot({ path: path.join(path.dirname(out), `prev_${t}.png`) });
    }
    return browser.close();
  }
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(__dirname, 'song.m4a'), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '20', '-preset', 'medium',
    '-c:a', 'copy', '-t', String(total), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  for (let i = 0; i < total * fps; i++) {
    await page.evaluate(t => window.render(t), i / fps);
    const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  }
  ff.stdin.end();
  await new Promise(r => ff.on('close', r));
  await browser.close();
  console.log('done', out);
})();
