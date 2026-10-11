// Usage:
//   node render.cjs questions <wide|tall> <light|dark> <outDir> [t1,t2,...]   all 240 frames, or stills at times
//   node render.cjs numerals x <light|dark> <outDir> [t1,...]                all 120 frames, or stills
// Frames are PNG, named 0000.png..; stills are named <piece>-<variant>-<theme>-t<time>.png.
// Questions: frames inside a snap are the average of 8 sub frames over a 180 degree shutter (motion blur).
const { chromium } = require('playwright');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const [piece, variant, theme, outDir, times] = process.argv.slice(2);
const FPS = 30;
const Q = piece === 'questions';
const size = Q ? (variant === 'wide' ? [1920, 600] : [1080, 600]) : [1080, 1080];
const dur = Q ? 8 : 4;
const SNAPS = [3.6, 4.05, 4.5, 4.95];
const blurred = t => Q && SNAPS.some(s => t >= s - 1e-6 && t < s + 0.5);
const SUB = 8;

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: size[0], height: size[1] }, deviceScaleFactor: 1 });
  p.on('pageerror', e => { console.error(e); process.exit(1); });
  p.on('console', m => console.log('[page]', m.text()));
  await p.goto('file://' + path.join(__dirname, Q ? 'questions.html' : 'numerals.html'));
  await p.evaluate(async () => { await document.fonts.load('600 72px Bric'); await document.fonts.ready; });
  const info = await p.evaluate(o => window.setup(o), { variant, theme });
  if (info) console.log(JSON.stringify(info));
  const list = times ? times.split(',').map(Number) : [...Array(Math.round(dur * FPS)).keys()].map(i => i / FPS);
  const shot = () => p.screenshot({ type: 'png', clip: { x: 0, y: 0, width: size[0], height: size[1] } });
  const t0 = Date.now();
  for (let i = 0; i < list.length; i++) {
    const t = list[i], f = Math.round(t * FPS);
    const name = times ? `${piece}-${variant}-${theme}-t${t.toFixed(2)}.png` : String(i).padStart(4, '0') + '.png';
    if (!blurred(t)) {
      await p.evaluate(([t, f]) => window.render(t, f), [t, f]);
      fs.writeFileSync(path.join(outDir, name), await shot());
      continue;
    }
    // Forward 180 degree shutter: sub frames in [t, t + 1/60), all inside the same jitter tick.
    let acc = null, info2;
    for (let k = 0; k < SUB; k++) {
      await p.evaluate(([t, f]) => window.render(t, f), [t + (k / SUB) / (FPS * 2), f]);
      const { data, info: inf } = await sharp(await shot()).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      info2 = inf;
      if (!acc) acc = new Float32Array(data.length);
      for (let j = 0; j < data.length; j++) acc[j] += data[j];
    }
    const out = Buffer.alloc(acc.length);
    for (let j = 0; j < acc.length; j++) out[j] = Math.round(acc[j] / SUB);
    await sharp(out, { raw: { width: info2.width, height: info2.height, channels: 3 } }).png().toFile(path.join(outDir, name));
  }
  console.log(`${piece} ${variant} ${theme}: ${list.length} frames in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await b.close();
})();
