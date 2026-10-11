// Usage:
//   node render.cjs frames <piece> <variant> <theme> <outDir>      every frame as PNG
//   node render.cjs stills <piece> <variant> <theme> <outDir> t1,t2  single times as PNG
// piece: how | endcard; variant: wide | tall (how only); theme: dark | light
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const [mode, piece, variant, theme, outDir, times] = process.argv.slice(2);
const size = piece === 'how' ? (variant === 'wide' ? [1920, 820] : [1080, 1350]) : [1600, 900];
const dur = piece === 'how' ? 15 : 4.8;
(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error(e); process.exit(1); });
  await p.goto('file://' + path.join(__dirname, 'film.html'));
  await p.evaluate(async () => { await document.fonts.load('600 120px IS80'); });
  await p.evaluate(o => window.setup(o), { piece, variant, theme });
  const list = mode === 'stills' ? times.split(',').map(Number) : [...Array(Math.round(dur * 30)).keys()].map(i => i / 30);
  const t0 = Date.now();
  for (let i = 0; i < list.length; i++) {
    await p.evaluate(t => window.render(t), list[i]);
    const name = mode === 'stills' ? `${piece}-${variant}-${theme}-t${list[i].toFixed(2)}.png` : String(i).padStart(4, '0') + '.png';
    await p.screenshot({ path: path.join(outDir, name) });
  }
  console.log(`${piece} ${variant} ${theme}: ${list.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await b.close();
})();
