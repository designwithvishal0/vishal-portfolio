'use strict';
// Film version motion pieces, drawn on one canvas as a pure function of time.
// how:     F1, 15 s loop, three 5 s acts (drop off stream, uncertain ring, honest 70% bar)
// endcard: F2, 4.8 s one shot, soft discs of light resolve into one point
// Lens behaviour is simulated, not faked with gaussian blur: every element is convolved
// with a disc kernel (circle of confusion), motion blur is temporal supersampling.

const FPS = 30;
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const mix = (p, q, t) => p.map((v, i) => lerp(v, q[i], t));
const css = c => c.map(v => Math.round(v)).join(',');
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eout = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const ein = t => { t = clamp(t); return t * t * t; };
const esine = t => { t = clamp(t); return -(Math.cos(Math.PI * t) - 1) / 2; };
const eoutBack = (t, s = 1.2) => { t = clamp(t); const c3 = s + 1; return 1 + c3 * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2); };
function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const gauss = r => (r() + r() + r() + r() - 2) * Math.sqrt(3);

// ---------- optics ----------
// Disc kernel of radius R projected on a line: its CDF. A line of half width h convolved with it:
const cdf = u => u <= -1 ? 0 : u >= 1 ? 1 : 0.5 + (u * Math.sqrt(1 - u * u) + Math.asin(u)) / Math.PI;
const band = (s, h, R) => cdf((s + h) / R) - cdf((s - h) / R);
// Stylised exposure: a defocused element keeps at least this peak opacity (spec: 40 to 60%).
let FLOOR_LINE = 0.5, FLOOR_DOT = 0.32;

// Stroke a path defocused by a disc kernel of radius R: nested strokes reproduce the
// exact cross section (level sets of the distance to the path).
function strokeSoft(ctx, path, width, R, rgb, alpha, floor = FLOOR_LINE) {
  if (alpha <= 0.002) return;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.strokeStyle = `rgb(${rgb})`;
  ctx.beginPath(); path(ctx);
  if (R < 0.4) { ctx.globalAlpha = alpha; ctx.lineWidth = width; ctx.stroke(); ctx.globalAlpha = 1; return; }
  const h = width / 2, peak = band(0, h, R), gain = Math.max(peak, floor) / peak;
  const smax = h + R, J = Math.max(8, Math.min(56, Math.round(smax / 0.55)));
  let prev = 0;
  for (let j = 0; j < J; j++) {
    const s0 = smax * (1 - j / J), s1 = smax * (1 - (j + 1) / J);
    let C = Math.min(0.997, alpha * Math.min(1, gain * band((s0 + s1) / 2, h, R)));
    if (C < prev) C = prev;
    const a = 1 - (1 - C) / (1 - prev);
    if (a > 0.0006) { ctx.globalAlpha = a; ctx.lineWidth = 2 * s0; ctx.stroke(); }
    prev = C;
  }
  ctx.globalAlpha = 1;
}

function lensArea(r1, r2, d) {
  if (d >= r1 + r2) return 0;
  const rm = Math.min(r1, r2);
  if (d <= Math.abs(r1 - r2)) return Math.PI * rm * rm;
  const a1 = r1 * r1 * Math.acos(clamp((d * d + r1 * r1 - r2 * r2) / (2 * d * r1), -1, 1));
  const a2 = r2 * r2 * Math.acos(clamp((d * d + r2 * r2 - r1 * r1) / (2 * d * r2), -1, 1));
  const k = 0.5 * Math.sqrt(Math.max(0, (-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2)));
  return a1 + a2 - k;
}
// A disc of radius r convolved with a disc kernel of radius R (exact overlap area profile).
function dotSoft(ctx, x, y, r, R, rgb, alpha, floor = FLOOR_DOT) {
  if (alpha <= 0.002 || r <= 0) return;
  if (R < 0.4) { ctx.globalAlpha = alpha; ctx.fillStyle = `rgb(${rgb})`; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1; return; }
  const peak = Math.min(r, R) ** 2 / (R * R), gain = Math.max(peak, floor) / peak;
  const ext = r + R, K = 14, g = ctx.createRadialGradient(x, y, 0, x, y, ext);
  for (let k = 0; k <= K; k++) {
    const cov = lensArea(r, R, ext * k / K) / (Math.PI * R * R);
    g.addColorStop(k / K, `rgba(${rgb},${Math.min(1, alpha * gain * cov).toFixed(4)})`);
  }
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, ext, 0, Math.PI * 2); ctx.fill();
}

// ---------- state ----------
let P, W, H, U, GROUND, FG, cvs, ctx, layer, lctx, noise, L;
const DEFK = 0.75; // spec defocus values are circle of confusion diameters; kernel radius = D / 2

function setup(o) {
  P = o;
  if (o.piece === 'how') { [W, H] = o.variant === 'wide' ? [1920, 820] : [1080, 1350]; }
  else { [W, H] = [1600, 900]; }
  U = o.piece === 'how' && o.variant === 'tall' ? 1.3 : 1;
  const dark = o.theme === 'dark';
  if (o.piece === 'how') { GROUND = hex(dark ? '#0D0E11' : '#F6F7F9'); FG = hex(dark ? '#ECEAE4' : '#0E1014'); }
  else { GROUND = hex(dark ? '#060708' : '#E4E7EC'); FG = hex(dark ? '#ECEAE4' : '#0E1014'); }
  cvs = document.getElementById('c'); cvs.width = W; cvs.height = H;
  ctx = cvs.getContext('2d', { willReadFrequently: true });
  layer = document.createElement('canvas'); layer.width = W; layer.height = H; lctx = layer.getContext('2d');
  const r = rng(7); noise = new Float32Array(W * H); for (let i = 0; i < W * H; i++) noise[i] = gauss(r);
  if (o.piece === 'how') { layoutHow(); initAct1(); initAct2(); } else initEnd();
}

// ---------- F1 layout ----------
function layoutHow() {
  if (P.variant === 'wide') L = {
    yc: 0.40 * H, amp: 0.06 * H, ph: -0.35, freq: 0.8, band: 17, gateH: 74, nDots: 360, fall: 430,
    ring: { cx: W / 2, cy: H * 0.5, r: 0.15 * H, w: 6 },
    track: { x0: 0.2 * W, w: 0.6 * W, y: 0.6 * H, h: 10, ow: 1.5, num: 120 },
  };
  else L = {
    yc: 0.40 * H, amp: 0.045 * H, ph: -0.35, freq: 0.8, band: 17 * U, gateH: 74 * U, nDots: 230, fall: 520,
    ring: { cx: W / 2, cy: H * 0.47, r: 0.15 * 820 * U, w: 6 * U },
    track: { x0: 0.13 * W, w: 0.74 * W, y: 0.56 * H, h: 10 * U, ow: 1.5 * U, num: 140 },
  };
}
const sy = x => L.yc + L.amp * Math.sin(2 * Math.PI * (x / W) * L.freq + L.ph);

// Act 1: Start where people drop off
let dots, gx; const GSTART = [0.55, 1.05, 1.55], PEEL = [0.15, 0.40, 0.10];
function initAct1() {
  const r = rng(11); gx = [0.3 * W, 0.5 * W, 0.7 * W];
  const m = 30 * U, v0 = W / 8.6, cross = (W + 2 * m) / v0, slow = (W + 2 * m) / (0.86 * v0);
  const start = -0.45 - slow, span = 5.1 - start, n = Math.round(L.nDots / cross * span);
  dots = [];
  for (let i = 0; i < n; i++) {
    const e = start + (i + r()) / n * span, v = v0 * (0.86 + 0.28 * r());
    const d = { e, v, m, o: clamp(gauss(r) * L.band, -2.6 * L.band, 2.6 * L.band), r: (1.5 + 2 * r()) * U,
      wa: 2.2 * U * r(), wf: 0.3 + 0.6 * r(), wp: 6.283 * r(), peel: -1, pc: 0, fx: 0.45 + 0.9 * r(), fy: 0.75 + 0.5 * r() };
    for (let g = 0; g < 3; g++) {
      const c = e + (gx[g] + m) / v;
      if (c >= GSTART[g] + 0.3 && r() < PEEL[g]) { d.peel = g; d.pc = c; break; }
    }
    dots.push(d);
  }
}
function act1(c, t, X) {
  const f = eio((t - 2.5) / 1.0);
  const prox = x => Math.exp(-(((x - gx[1]) / (0.075 * W)) ** 2));
  const DB = 10 * DEFK * U;
  for (let g = 0; g < 3; g++) {
    const p = eout((t - GSTART[g]) / 0.6); if (p <= 0) continue;
    const half = L.gateH * p, y0 = sy(gx[g]);
    strokeSoft(c, k => { k.moveTo(gx[g], y0 - half); k.lineTo(gx[g], y0 + half); }, 1.5 * U, DB * (1 - f * prox(gx[g])) + X, css(FG), 0.85, 0.34);
  }
  const col = css(FG);
  for (const d of dots) {
    let x, y, a = 0.95, extra = 0;
    if (d.peel >= 0 && t > d.pc) {
      const s = t - d.pc, k = 1.05, g = gx[d.peel];
      x = g + d.v * d.fx * (1 - Math.exp(-k * s)) / k;
      y = sy(g) + d.o + 24 * U * s + 0.5 * L.fall * U * d.fy * s * s;
      a *= 1 - sstep(0.2, 1.25, s);
      extra = 18 * DEFK * U * sstep(0.0, 1.0, s);
      if (a <= 0) continue;
    } else {
      x = -d.m + d.v * (t - d.e);
      if (x < -d.m - 5 || x > W + d.m + 5) continue;
      y = sy(x) + d.o + d.wa * Math.sin(6.283 * d.wf * t + d.wp);
    }
    dotSoft(c, x, y, d.r, DB * (1 - f * prox(x)) + extra + X, col, a);
  }
  if (t > 2.85) {
    const p = eio((t - 2.85) / 0.6), cx = gx[1] + 34 * U, cy = sy(gx[1]) + 34 * U;
    strokeSoft(c, k => k.arc(cx, cy, 38 * U, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * p), 2 * U, X, css(FG), 1);
  }
}

// Act 2: Design the uncertain moment
let ringTab; const RT0 = -0.45, RDT = 1 / 2400;
function initAct2() {
  const steps = [[-0.45, 0.55], [-0.12, 0.27], [0.2, 0.74], [0.47, 0.38], [0.8, 0.79], [1.08, 0.22]];
  let x = 0.55, v = 0; ringTab = [];
  for (let t = RT0; t <= 2.7; t += RDT) {
    let target = 0.6, w = 10.5, z = 0.2;
    if (t < 1.4) { for (const [s, val] of steps) if (t >= s) target = val; w = 30; z = 0.72; }
    const acc = w * w * (target - x) - 2 * z * w * v; v += acc * RDT; x += v * RDT;
    ringTab.push(x);
  }
}
function ringVal(t) {
  const i = clamp((t - RT0) / RDT, 0, ringTab.length - 1), i0 = Math.floor(i);
  const vs = lerp(ringTab[i0], ringTab[Math.min(i0 + 1, ringTab.length - 1)], i - i0);
  return t < 2.6 ? vs : vs + (1 - vs) * eout((t - 2.6) / 0.6);
}
function act2(c, t, X) {
  const { cx, cy, r, w } = L.ring;
  const env = t < 1.4 ? 1 : Math.exp(-3.4 * (t - 1.4));
  const wx = 6 * U * env * (0.65 * Math.sin(6.283 * 1.9 * t + 0.3) + 0.35 * Math.sin(6.283 * 3.3 * t + 1.7));
  const wy = 6 * U * env * (0.6 * Math.sin(6.283 * 2.3 * t + 2.1) + 0.4 * Math.sin(6.283 * 3.7 * t + 0.4));
  const x0 = cx + wx, y0 = cy + wy, col = css(FG);
  const D = 18 * DEFK * U * (1 - eio((t - 1.4) / 1.2)) + X;
  const v = ringVal(t);
  strokeSoft(c, k => k.arc(x0, y0, r, 0, Math.PI * 2), w, D, col, 0.24, 0.24);
  strokeSoft(c, k => k.arc(x0, y0, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * clamp(v, 0.001, 1)), w, D, col, 1);
  if (t > 3.2) {
    const p = eout((t - 3.2) / 0.4);
    const pts = [[-0.30, 0.02], [-0.08, 0.24], [0.33, -0.20]].map(([a, b]) => [x0 + a * r, y0 + b * r]);
    const l1 = Math.hypot(pts[1][0] - pts[0][0], pts[1][1] - pts[0][1]), l2 = Math.hypot(pts[2][0] - pts[1][0], pts[2][1] - pts[1][1]);
    const len = p * (l1 + l2);
    strokeSoft(c, k => {
      k.moveTo(...pts[0]);
      if (len <= l1) k.lineTo(lerp(pts[0][0], pts[1][0], len / l1), lerp(pts[0][1], pts[1][1], len / l1));
      else { k.lineTo(...pts[1]); const q = (len - l1) / l2; k.lineTo(lerp(pts[1][0], pts[2][0], q), lerp(pts[1][1], pts[2][1], q)); }
    }, w, X, col, 1);
  }
}

// Act 3: Honest copy over comforting copy
function barVal(t) {
  if (t <= 0) return 0;
  if (t <= 0.9) return eio(t / 0.9);
  const s = t - 0.9, z = 0.54, w = 9, wd = w * Math.sqrt(1 - z * z);
  return 0.7 + 0.3 * Math.exp(-z * w * s) * (Math.cos(wd * s) + z * w / wd * Math.sin(wd * s));
}
function act3(c, t, X) {
  const { x0, w: tw, y, h, ow, num } = L.track, col = css(FG);
  const D = 16 * DEFK * U * (1 - eio((t - 0.9) / 1.1)) + X;
  strokeSoft(c, k => k.roundRect(x0, y - h / 2, tw, h, h / 2), ow, D, col, 0.72, 0.4);
  const v = barVal(t);
  if (v > 0.002) {
    const xe = x0 + Math.max(h / 2, v * tw - h / 2);
    strokeSoft(c, k => { k.moveTo(x0 + h / 2, y); k.lineTo(xe, y); }, h, D, col, clamp(v * 40));
  }
  const xm = x0 + 0.7 * tw;
  if (t > 2.0) {
    const p = (t - 2.0) / 0.45, yo = -30 * U * (1 - eoutBack(p)), a = sstep(0, 0.35, p);
    strokeSoft(c, k => { k.moveTo(xm, y - 40 * U + yo); k.lineTo(xm, y + 22 * U + yo); }, 2 * U, X, col, a);
  }
  if (t > 2.25) {
    const p = (t - 2.25) / 0.55, a = eout(p), rise = 12 * U * (1 - eout(p));
    c.save();
    c.font = `600 ${num}px IS80`; c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    c.fillStyle = `rgb(${col})`; c.globalAlpha = a;
    if (X > 0.4) c.filter = `blur(${(X * 0.45).toFixed(2)}px)`;
    c.fillText('70%', xm, y - 40 * U - 26 * U + rise);
    c.restore();
  }
}

function drawHow(t) {
  t = ((t % 15) + 15) % 15;
  ctx.fillStyle = `rgb(${css(GROUND)})`; ctx.fillRect(0, 0, W, H);
  const acts = [act1, act2, act3];
  for (let k = 0; k < 3; k++) {
    let tau = t - 5 * k;
    if (k === 0 && t > 14) tau = t - 15;
    if (tau < -0.4 || tau > 5) continue;
    let a = 1, X = 0;
    if (tau < 0) a = esine((tau + 0.4) / 0.4);
    if (tau > 4.6) { const p = (tau - 4.6) / 0.4; a = 1 - esine(p); X = 16 * U * ein(Math.min(1, p * 1.15)); }
    if (a >= 0.999) { acts[k](ctx, tau, X); continue; }
    lctx.clearRect(0, 0, W, H); acts[k](lctx, tau, X);
    ctx.globalAlpha = a; ctx.drawImage(layer, 0, 0); ctx.globalAlpha = 1;
  }
}
function subsHow(t) {
  if (t >= 4.5 && t < 7.0) return 10;   // jumping ring, spring
  if (t >= 9.9 && t < 11.7) return 14;  // fast fill and pull back
  if (t >= 8.7 && t < 9.55) return 1;   // static hold
  return 4;
}

// ---------- F2 end card ----------
let discs, levels, M0;
const END = 4.8, YL = 0.62, LV = [2.6, 2.74, 2.90, 3.08, 3.29, 3.53, 3.80];
function initEnd() {
  const dark = P.theme === 'dark';
  const base = (dark ? ['#6E5FA0', '#3E5784', '#2F6B55', '#3442A0'] : ['#CDBFE3', '#BCCDEB', '#C2D4B2', '#B9C0E6']).map(hex);
  const sharp = dark ? base.map(c => mix(c, FG, 0.38)) : ['#6E5FA0', '#3E5784', '#2F6B55', '#3442A0'].map(hex);
  const r = rng(23); discs = [];
  const cols = 8, rows = 7;
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const ci = Math.floor(r() * 4), ang = r() * 6.283, sp = 8 + 12 * r();
    const d = {
      x: -50 + (i + 0.15 + 0.7 * r()) / cols * (W + 100), y: -50 + (j + 0.15 + 0.7 * r()) / rows * (H + 100),
      vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, D: 24 + 136 * Math.pow(r(), 1.6), ps: 4 + 4 * r(),
      a0: dark ? 0.32 + 0.22 * r() : 0.6 + 0.2 * r(), c0: base[ci], c1: sharp[ci], dl: 0.2 * r(),
    };
    discs.push(d);
  }
  const s4 = discs.reduce((s, d) => s + d.ps ** 4, 0);
  for (const d of discs) d.w = d.ps ** 4 / s4;
  // positions on the line when phase C starts
  for (const d of discs) d.x26 = W / 2 + (d.x + d.vx * 2.6 - W / 2) * 0.92;
  // merge tree: pair neighbours level by level
  let cl = discs.map((d, i) => ({ x: d.x26, w: d.w, c: d.c1, born: -1 })).sort((a, b) => a.x - b.x);
  M0 = cl.reduce((s, q) => s + q.x * q.w, 0);
  levels = [];
  const rr = rng(5);
  for (let l = 0; cl.length > 1; l++) {
    const S = LV[l], E = LV[l + 1], pairs = [], next = [];
    let rest = cl;
    if (cl.length % 2) {
      // the unpaired cluster is the one farthest from the centre of mass; it waits a level
      const k = Math.abs(cl[0].x - M0) > Math.abs(cl[cl.length - 1].x - M0) ? 0 : cl.length - 1;
      pairs.push({ a: cl[k], solo: true }); next.push(cl[k]);
      rest = cl.filter((_, i) => i !== k);
    }
    for (let i = 0; i < rest.length; i += 2) {
      const a = rest[i], b = rest[i + 1], w = a.w + b.w;
      const m = { x: (a.x * a.w + b.x * b.w) / w, w, c: mix(a.c, b.c, b.w / w), born: E };
      pairs.push({ a, b, m, s: S + rr() * 0.35 * (E - S) });
      next.push(m);
    }
    next.sort((p, q) => p.x - q.x);
    levels.push({ S, E, pairs });
    cl = next;
  }
}
const rOf = w => 8 * Math.pow(w, 0.25);
const pop = s => s < 0 ? 1 : 1 + 0.32 * Math.exp(-9 * s) * Math.sin(21 * s);
function drawEnd(t) {
  t = clamp(t, 0, END);
  ctx.fillStyle = `rgb(${css(GROUND)})`; ctx.fillRect(0, 0, W, H);
  const yl = YL * H, cx = W / 2;
  if (t < LV[0]) {
    // big discs first so the small ones sit on top
    const order = discs.slice().sort((a, b) => b.D - a.D);
    for (const d of order) {
      const e = eio((t - 1.0 - d.dl) / 1.4);
      const x = cx + (d.x + d.vx * t - cx) * lerp(1, 0.92, e), y = lerp(d.y + d.vy * t, yl, e);
      const col = mix(d.c0, d.c1, e);
      const r = rOf(d.w) * lerp(0.6, 1, e);
      dotSoft(ctx, x, y, r, (d.D / 2) * (1 - e), css(col), 1, lerp(d.a0, 1, e));
    }
    return;
  }
  const g = eio((t - LV[0]) / (LV[LV.length - 1] - LV[0]));
  const disp = x => cx + (x - M0) * lerp(1, 0.55, g) + (M0 - cx) * (1 - g);
  const colOf = q => mix(q.c, FG, Math.pow(q.w, 0.6));
  let l = levels.findIndex(v => t < v.E);
  if (l < 0) {
    // one point left: pulse once, then hold
    const q = levels[levels.length - 1].pairs.find(p => !p.solo).m;
    const ps = t < 3.8 ? 1 : 1 + 0.6 * Math.sin(Math.PI * esine((t - 3.8) / 0.5));
    dotSoft(ctx, cx, yl, rOf(q.w) * pop(t - q.born) * ps, 0, css(FG), 1);
    return;
  }
  const { pairs } = levels[l];
  for (const p of pairs) {
    if (p.solo) { dotSoft(ctx, disp(p.a.x), yl, rOf(p.a.w) * pop(t - p.a.born), 0, css(colOf(p.a)), 1); continue; }
    const e = Math.pow(clamp((t - p.s) / (levels[l].E - p.s)), 2.2);
    for (const q of [p.a, p.b]) dotSoft(ctx, disp(lerp(q.x, p.m.x, e)), yl, rOf(q.w) * pop(t - q.born), 0, css(colOf(q)), 1);
  }
}
function subsEnd(t) { return t >= 2.55 && t < 4.35 ? 10 : 4; }

// ---------- frame assembly: temporal supersampling + static monochrome grain ----------
const SHUTTER = 0.75; // 270 degrees
function render(t, nOverride) {
  const isHow = P.piece === 'how';
  const N = nOverride || (isHow ? subsHow(t) : subsEnd(t));
  const draw = isHow ? drawHow : drawEnd;
  const img = ctx.createImageData(W, H), out = img.data;
  let acc = null;
  for (let s = 0; s < N; s++) {
    const ts = N === 1 ? t : t + ((s + 0.5) / N - 0.5) * SHUTTER / FPS;
    draw(isHow ? ts : Math.max(0, ts));
    const d = ctx.getImageData(0, 0, W, H).data;
    if (N === 1) { acc = d; break; }
    if (!acc) acc = new Float32Array(d.length);
    for (let i = 0; i < d.length; i++) acc[i] += d[i];
  }
  const inv = N === 1 ? 1 : 1 / N, [g0, g1, g2] = GROUND;
  const lg = 0.2126 * g0 + 0.7152 * g1 + 0.0722 * g2, lf = 0.2126 * FG[0] + 0.7152 * FG[1] + 0.0722 * FG[2];
  const span = Math.abs(lf - lg);
  for (let i = 0, p = 0; i < out.length; i += 4, p++) {
    const r = acc[i] * inv, gg = acc[i + 1] * inv, b = acc[i + 2] * inv;
    const dl = Math.abs(r - g0) + Math.abs(gg - g1) + Math.abs(b - g2);
    let n = 0;
    if (dl > 0.6) { const a = Math.min(1, (dl / 3) / span * 3); n = noise[p] * (0.9 + 1.9 * a); }
    out[i] = r + n; out[i + 1] = gg + n; out[i + 2] = b + n; out[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
function frame(i) { render(i / FPS); }
window.setup = setup; window.frame = frame; window.render = render;
