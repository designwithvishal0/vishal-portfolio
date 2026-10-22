// Usage:
//   node render.cjs frames <theme> <outDir>          every frame (240) as PNG
//   node render.cjs stills <theme> <outDir> t1,t2    single times as PNG
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const [mode, theme, outDir, times] = process.argv.slice(2);
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error(e); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'fold.html'));
  await p.evaluate(th => window.setup(th), theme);
  const list = mode === 'stills' ? times.split(',').map(Number) : [...Array(240).keys()].map(i => i / 30);
  const t0 = Date.now();
  for (let i = 0; i < list.length; i++) {
    await p.evaluate(t => window.render(t), list[i]);
    const name = mode === 'stills' ? `fold-${theme}-t${list[i].toFixed(2)}.png` : String(i).padStart(4, '0') + '.png';
    await p.screenshot({ path: path.join(outDir, name) });
  }
  console.log(`fold ${theme}: ${list.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await b.close();
})();
