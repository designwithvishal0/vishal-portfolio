// Renders scene.html to the phone hero reel. Usage: node render.mjs <out.mp4> [stills t1,t2,...]
// Needs ./frames/<clip>/NNN.jpg (render.sh makes them from Vishal's _showreel_work/clips), Playwright Chromium and ffmpeg.
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
const [, , out = 'hero-phone.mp4', mode, list] = process.argv;
const FPS = 30, T = 45;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
const p = await b.newPage({ viewport: { width: 720, height: 900 }, deviceScaleFactor: 1.5 });
await p.goto('file://' + resolve(import.meta.dirname, 'scene.html'));
await p.evaluate(() => document.fonts.ready);
if (mode === 'stills') {
  for (const t of list.split(',')) { await p.evaluate(t => render(t), +t); await p.screenshot({ path: `${out}-${t}.png` }); }
  await b.close(); process.exit(0);
}
const tmp = mkdtempSync(join(tmpdir(), 'cp-'));
for (let i = 0; i < T * FPS; i++) {
  await p.evaluate(t => render(t), i / FPS);
  await p.screenshot({ path: join(tmp, `f${String(i).padStart(4, '0')}.jpg`), type: 'jpeg', quality: 95 });
}
await b.close();
const ff = (...a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
ff('-framerate', String(FPS), '-i', join(tmp, 'f%04d.jpg'), '-vf', 'scale=720:900:flags=lanczos,format=yuv420p', '-an', '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '25', '-movflags', '+faststart', out);
rmSync(tmp, { recursive: true });
console.log('wrote', out);
