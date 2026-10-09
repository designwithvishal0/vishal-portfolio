// B2 film: a page being decided. 8.0 s seamless loop, 1080x1350, drawn as a pure function of t.
// Story: a loose pile of page blocks (the undecided page, price and CTA buried below the fold)
// lands, a fold line appears, springs reorder the page so the price and the CTA sit above the fold,
// everything snaps to the grid (the decision), the CTA is tapped, the page is scrolled, then it loosens
// back into the opening pile so the loop joins.
// Layout is authored in a 520x1040 frame, drawn scaled by K so the frame is 600x1200 in the 1080x1350 video.
const K = 600 / 520, W = 1080 / K, H = 1350 / K, FW = 520, FH = 1040, FX = (W - FW) / 2, FY = (H - FH) / 2, FOLD = Math.round(FH * 0.58);
const PW = 1080, PH = 1350;
const THEMES = {
  light: { ground: '#FFFFFF', edge: '#D5D9E6', hero: '#DCE3FF', sq: '#E8ECF7', chip: '#FFE2A0', cta: '#11131C', fill: '#FFC23D', fold: '#8A90A3', guide: '#2B44E0', shadow: [17, 19, 28], sA: 1, tap: [17, 19, 28] },
  dark: { ground: '#141928', edge: '#2A3148', hero: '#24306E', sq: '#1E2438', chip: '#4A3A10', cta: '#E9ECF5', fill: '#FFC23D', fold: '#5C6380', guide: '#9DB0FF', shadow: [0, 0, 0], sA: 2.4, tap: [233, 236, 245] },
};
let C;
const cv = document.getElementById('c'); cv.width = PW; cv.height = PH;
const ctx = cv.getContext('2d');
const off = document.createElement('canvas'); off.width = PW; off.height = PH;
const octx = off.getContext('2d');

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, f) => a + (b - a) * f;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeIn = x => x * x;
const inOut = x => (x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
// Damped spring step response (0 -> 1). zeta .55 gives one visible overshoot (about 12%) and a settle.
function spring(tau, w = 11, z = .55) {
  if (tau <= 0) return 0;
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
}
// Landing squash: a short decaying bump after contact.
const squash = tau => (tau <= 0 ? 0 : Math.exp(-tau * 10) * Math.sin(tau * 26));

// Poses in frame coordinates. L: the loose pile. R: reordered, still a little off grid and tilted. D: decided, on the 8 px grid.
const B = [
  { id: 'hero', L: [34, 38, 452, 480, -2.2], R: [37, 29, 452, 336, -1.4], D: [32, 32, 456, 336, 0], land: .42, move: 2.0 },
  { id: 'sq1', L: [26, 552, 216, 216, 3.0], R: [36, 637, 216, 216, 1.6], D: [32, 632, 216, 216, 0], land: .52, move: 2.3 },
  { id: 'sq2', L: [276, 540, 216, 216, -3.6], R: [268, 628, 216, 216, -2.0], D: [272, 632, 216, 216, 0], land: .6, move: 2.36 },
  { id: 'sq3', L: [42, 786, 216, 216, -1.8], R: [29, 876, 216, 216, -1.2], D: [32, 872, 216, 216, 0], land: .68, move: 2.42 },
  { id: 'sq4', L: [262, 796, 216, 216, 3.8], R: [276, 868, 216, 216, 2.2], D: [272, 872, 216, 216, 0], land: .76, move: 2.48 },
  { id: 'chip', L: [262, 742, 176, 56, -4.0], R: [36, 389, 176, 56, -2.4], D: [32, 392, 176, 56, 0], land: .9, move: 2.18 },
  { id: 'cta', L: [38, 924, 452, 88, 1.4], R: [28, 476, 456, 88, 1.2], D: [32, 472, 456, 88, 0], land: 1.04, move: 2.1 },
];
const RAD = { hero: 28, sq1: 20, sq2: 20, sq3: 20, sq4: 20, chip: 28, cta: 24 };

function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }

// State of one block at time t: [x, y, w, h, rot, lift (0 resting, 1 held up), shadow strength, squash]
function pose(b, t) {
  const tl = t;
  let p = b.L.slice(), lift = 0, shad = 1, sq = 0;
  if (tl < 7.2) {
    // 0 to 1.2: falls from the held pose onto the page with gravity, then squashes on contact.
    const fallStart = b.land - .42;
    if (tl < b.land) lift = 1 - easeIn(clamp((tl - fallStart) / .42));
    sq = squash(tl - b.land);
    // 2.0 to 3.4: picked up and moved to its new place on a spring with one overshoot.
    const s1 = spring(tl - b.move, 9);
    if (tl > b.move) {
      p = b.L.map((v, i) => lerp(v, b.R[i], s1));
      lift = Math.max(lift, .55 * Math.sin(Math.PI * clamp((tl - b.move) / .7)));
    }
    // 3.4 to 4.2: snaps to the grid, tilt to zero, shadows flatten.
    const snapAt = 3.42 + (b.move - 2.0) * .25;
    const s2 = spring(tl - snapAt, 20, .72);
    if (tl > snapAt) p = b.R.map((v, i) => lerp(v, b.D[i], s2));
    shad = 1 - smooth(snapAt, snapAt + .45, tl);
  } else {
    // 7.2 to 8.0: loosens back into the held pile (the opening state).
    const f = inOut(clamp((tl - 7.2) / .8));
    p = b.D.map((v, i) => lerp(v, b.L[i], f));
    lift = f; shad = f;
  }
  return { p, lift, shad, sq };
}

function drawBlock(c, b, st, t, scrollY) {
  const [x, y, w, h, rot] = st.p;
  const cx = FX + x + w / 2, by = FY + y + h + scrollY;
  const sc = 1 + .045 * st.lift;
  const sy = 1 - .085 * st.sq, sx = 1 + .05 * st.sq;
  const r = RAD[b.id];
  c.save();
  c.translate(cx, by - 26 * st.lift);
  c.rotate(rot * Math.PI / 180);
  c.scale(sc * sx, sc * sy);
  // soft contact shadow, larger and softer while held
  const a = (.10 + .12 * st.lift) * st.shad * C.sA;
  if (a > .002) {
    c.shadowColor = `rgba(${C.shadow},${clamp(a)})`;
    c.shadowBlur = 14 + 46 * st.lift; c.shadowOffsetY = 6 + 30 * st.lift;
  }
  let fillCol = C[b.id.startsWith('sq') ? 'sq' : b.id];
  if (b.id === 'cta') {
    // CTA: outline until tapped, then a marigold fill floods out from the tap point.
    rr(c, -w / 2, -h, w, h, r); c.fillStyle = C.ground; c.fill();
    c.shadowColor = 'transparent';
    const tapX = w * .2, tapY = -h / 2;
    const fillR = t < 7.2 ? lerp(0, w * 1.1, 1 - Math.pow(1 - clamp((t - 4.32) / .38), 3)) : w * 1.1;
    const fillA = t < 7.2 ? 1 : 1 - smooth(7.2, 7.75, t);
    if (fillR > 0 && fillA > 0) {
      c.save(); rr(c, -w / 2, -h, w, h, r); c.clip();
      c.globalAlpha = fillA; c.fillStyle = C.fill; c.beginPath(); c.arc(tapX, tapY, fillR, 0, Math.PI * 2); c.fill();
      c.restore();
    }
    const filled = fillR >= w ? fillA : 0;
    rr(c, -w / 2 + 2, -h + 2, w - 4, h - 4, r - 2);
    c.lineWidth = 4; c.strokeStyle = C.cta; c.globalAlpha = 1 - filled; c.stroke(); c.globalAlpha = 1;
  } else {
    rr(c, -w / 2, -h, w, h, r); c.fillStyle = fillCol; c.fill();
  }
  c.restore();
}

function scene(c, t) {
  t = ((t % 8) + 8) % 8;
  c.setTransform(K, 0, 0, K, 0, 0);
  c.fillStyle = C.ground; c.fillRect(0, 0, W, H);
  // scroll: content moves up 6% of the frame and back while the page is held decided
  const scrollY = -FH * .06 * (smooth(4.85, 5.75, t) - smooth(6.25, 7.15, t));
  c.save();
  rr(c, FX, FY, FW, FH, 56); c.clip();
  const order = ['hero', 'sq1', 'sq2', 'sq3', 'sq4', 'chip', 'cta'];
  const states = B.map(b => pose(b, t));
  // held blocks draw last so they pass over resting ones
  const idx = order.map((_, i) => i).sort((i, j) => (states[i].lift - states[j].lift) || (i - j));
  for (const i of idx) drawBlock(c, B[i], states[i], t, scrollY);
  // tap and ripple on the CTA at 4.2 to 4.8
  const cta = states[6].p;
  const tx = FX + cta[0] + cta[2] * .7, ty = FY + cta[1] + cta[3] / 2 + scrollY;
  const dotA = smooth(4.14, 4.26, t) * (1 - smooth(4.5, 4.7, t));
  if (dotA > 0) {
    const pr = 30 * (1 - .18 * Math.sin(Math.PI * clamp((t - 4.24) / .16)));
    c.fillStyle = `rgba(${C.tap},${.28 * dotA})`; c.beginPath(); c.arc(tx, ty, pr, 0, Math.PI * 2); c.fill();
  }
  const rp = clamp((t - 4.3) / .5);
  if (rp > 0 && rp < 1) {
    c.strokeStyle = `rgba(${C.tap},${.45 * (1 - rp)})`; c.lineWidth = 4;
    c.beginPath(); c.arc(tx, ty, 30 + 90 * (1 - Math.pow(1 - rp, 2)), 0, Math.PI * 2); c.stroke();
  }
  // alignment guide while the blocks snap (3.4 to 4.2)
  const gA = smooth(3.42, 3.56, t) * (1 - smooth(3.95, 4.2, t));
  if (gA > 0) {
    c.globalAlpha = gA; c.fillStyle = C.guide;
    c.fillRect(FX + 32 - 1.5, FY, 3, FH); c.fillRect(FX + 488 - 1.5, FY, 3, FH);
    c.globalAlpha = 1;
  }
  c.restore();
  // fold line: fixed to the frame, drawn left to right at 1.2 to 2.0, fades as the page loosens
  const fp = inOut(clamp((t - 1.2) / .8));
  const fA = 1 - smooth(7.25, 7.8, t);
  if (fp > 0 && t < 8 && fA > 0) {
    c.save(); c.beginPath(); c.rect(FX, 0, FW * fp, H); c.clip();
    c.setLineDash([18, 12]); c.lineWidth = 3; c.strokeStyle = C.fold; c.globalAlpha = fA;
    c.beginPath(); c.moveTo(FX - 8, FY + FOLD); c.lineTo(FX + FW + 8, FY + FOLD); c.stroke();
    c.restore();
  }
  // frame edge
  c.lineWidth = 2; c.strokeStyle = C.edge; rr(c, FX + 1, FY + 1, FW - 2, FH - 2, 55); c.stroke();
}

// Temporal supersampling: 10 samples over a 180 degree shutter.
const N = 10;
window.setup = theme => { C = THEMES[theme]; };
window.render = t => {
  const acc = new Float32Array(PW * PH * 4);
  for (let k = 0; k < N; k++) {
    scene(octx, t + (k / N) * (.5 / 30));
    const d = octx.getImageData(0, 0, PW, PH).data;
    for (let i = 0; i < d.length; i++) acc[i] += d[i];
  }
  const img = ctx.createImageData(PW, PH);
  for (let i = 0; i < acc.length; i++) img.data[i] = acc[i] / N + .5;
  ctx.putImageData(img, 0, 0);
};
