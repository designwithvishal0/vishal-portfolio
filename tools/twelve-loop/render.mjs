// Steps scene.html frame by frame and writes the loop. Usage: node render.mjs <outdir> [wide|tall]
// Needs Playwright (Chromium) and ffmpeg. Output: twelve-scene.mp4/.jpg (1280x720) or twelve-phone.mp4/.jpg (720x900).
import { chromium } from '/opt/node-tools/node_modules/playwright/index.mjs';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const [, , outDir = '.', cut = 'wide'] = process.argv;
const tall = cut === 'tall';
const [W, H] = tall ? [720, 900] : [1280, 720];
const FPS = 30, T = 9.0, XF = 0.5;                       // 9 s timeline, 0.5 s crossfade back into frame 0
const name = tall ? 'twelve-phone' : 'twelve-scene';
const tmp = mkdtempSync(join(tmpdir(), 'tw-'));

const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1.5 });
await p.goto('file://' + resolve(import.meta.dirname, 'scene.html') + (tall ? '#tall' : ''));
await p.evaluate(() => document.fonts.ready);
const N = Math.round(T * FPS);
for (let i = 0; i < N; i++) {
  await p.evaluate(t => render(t), i / FPS);
  await p.screenshot({ path: join(tmp, `f${String(i).padStart(4, '0')}.png`) });
}
await b.close();

const ff = (...a) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...a], { stdio: 'inherit' });
// tail crossfades into the head, then the head's first XF seconds are trimmed, so the last frame flows into the first
const fc = `[0:v]scale=${W}:${H}:flags=lanczos,format=yuv420p,setsar=1,split[a][b];` +
  `[b]trim=0:${XF},setpts=PTS-STARTPTS[h];[a][h]xfade=transition=fade:duration=${XF}:offset=${T - XF}[x];` +
  `[x]trim=start=${XF},setpts=PTS-STARTPTS[out]`;
ff('-framerate', String(FPS), '-i', join(tmp, 'f%04d.png'), '-filter_complex', fc, '-map', '[out]', '-an',
   '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'veryslow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', join(outDir, name + '.mp4'));
// poster = the settled frame (₹1,850 and the phone), like the ixigo and Split posters
ff('-ss', '4.3', '-i', join(outDir, name + '.mp4'), '-frames:v', '1', '-q:v', '3', join(outDir, name + '.jpg'));
rmSync(tmp, { recursive: true });
console.log('wrote', name);
