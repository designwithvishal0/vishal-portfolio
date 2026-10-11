'use strict';
// K2 numerals: 4 s at 30 fps, 1080x1080, a pure function of t.
// '60%' -> '50%' -> '30%'. Each digit change is an interpolation between the signed distance
// fields of the two glyph outlines (Bricolage 800, width 75%), melting top first; during the
// melt the edge softens (about 6 px) and the ink spreads, then it snaps crisp with a small
// overshoot. '0%' never changes.

const N = 1080, S = 2, M = N * S;           // work at 2x, box filter down to 1x
const THEME = { light: { ground: [250, 250, 248], ink: [11, 11, 12] }, dark: { ground: [12, 12, 14], ink: [242, 241, 236] } };
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const esine = t => { t = clamp(t); return -(Math.cos(Math.PI * t) - 1) / 2; };

// Felzenszwalb and Huttenlocher exact squared Euclidean distance transform.
function edt(feat) { // feat: Uint8Array M*M, 1 = feature pixel; returns Float32Array of distances
  const INF = 1e20, f = new Float64Array(M), d = new Float64Array(M), v = new Int32Array(M), z = new Float64Array(M + 1);
  const g = new Float64Array(M * M);
  for (let i = 0; i < M * M; i++) g[i] = feat[i] ? 0 : INF;
  const pass = (get, set) => {
    for (let q = 0; q < M; q++) f[q] = get(q);
    let k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (let q = 1; q < M; q++) {
      let s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (let q = 0; q < M; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
    for (let q = 0; q < M; q++) set(q, d[q]);
  };
  for (let x = 0; x < M; x++) pass(q => g[q * M + x], (q, val) => { g[q * M + x] = val; });
  for (let y = 0; y < M; y++) pass(q => g[y * M + q], (q, val) => { g[y * M + q] = val; });
  const out = new Float32Array(M * M);
  for (let i = 0; i < M * M; i++) out[i] = Math.sqrt(g[i]);
  return out;
}
// Signed distance in 2x pixels, positive outside the ink, with a half pixel sub sample correction.
function sdf(alpha) {
  const inside = new Uint8Array(M * M), outside = new Uint8Array(M * M);
  for (let i = 0; i < M * M; i++) { const a = alpha[i] >= 128; inside[i] = a ? 1 : 0; outside[i] = a ? 0 : 1; }
  const dOut = edt(inside), dIn = edt(outside), s = new Float32Array(M * M);
  for (let i = 0; i < M * M; i++) s[i] = inside[i] ? -(dIn[i] - 0.5) : dOut[i] - 0.5;
  return s;
}

// Separable box blur, applied twice (close to a gaussian). Blurring a distance field rounds its
// corners, which is what makes the half way shapes read as melting ink instead of a cut.
function blur(src, r) {
  let a = Float32Array.from(src), b = new Float32Array(M * M);
  const run = (get, set) => { // one line
    let sum = 0; const n = 2 * r + 1;
    for (let q = -r; q <= r; q++) sum += get(clamp(q, 0, M - 1));
    for (let q = 0; q < M; q++) { set(q, sum / n); sum += get(Math.min(M - 1, q + r + 1)) - get(Math.max(0, q - r)); }
  };
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < M; y++) run(q => a[y * M + q], (q, v) => { b[y * M + q] = v; });
    for (let x = 0; x < M; x++) run(q => b[q * M + x], (q, v) => { a[q * M + x] = v; });
  }
  return a;
}

let TH, ctx, img, F = {}, G = {}, L = {};
function setup(o) {
  TH = THEME[o.theme];
  ctx = document.getElementById('c').getContext('2d');
  img = ctx.createImageData(N, N);
  const off = new OffscreenCanvas(M, M), oc = off.getContext('2d', { willReadFrequently: true });
  const font = px => { oc.font = `800 ${px}px Bric`; oc.fontStretch = 'condensed'; };
  // Layout at a reference size, then scale so the ink spans 80% of the width.
  const lay = fs => {
    font(fs);
    const mm = ch => oc.measureText(ch);
    const cell = Math.max(...'6530'.split('').map(c => mm(c).width));
    const hD = mm('6').actualBoundingBoxAscent;
    font(100); const p100 = oc.measureText('%');
    const fsP = 100 * (0.6 * hD) / p100.actualBoundingBoxAscent;
    font(fsP); const pm = oc.measureText('%');
    font(fs); const zero = mm('0');
    const d6 = mm('6');
    const inkL = (cell - d6.width) / 2 - d6.actualBoundingBoxLeft;   // approximately the digit's left ink edge
    const pctX = 2 * cell + fs * 0.03;
    const inkR = pctX + pm.actualBoundingBoxRight;
    return { fs, fsP, cell, hD, hP: pm.actualBoundingBoxAscent, inkL, inkR, pctX, zeroL: cell - zero.actualBoundingBoxLeft };
  };
  let l = lay(400); const k = (0.8 * M) / (l.inkR - l.inkL); l = lay(400 * k);
  const x0 = (M - (l.inkR - l.inkL)) / 2 - l.inkL, base = (M + l.hD) / 2;
  L = { x0, base, top: base - l.hD, hD: l.hD, digitR: x0 + l.cell, zeroL: x0 + l.zeroL };
  for (const d of ['6', '5', '3']) {
    oc.fillStyle = '#000'; oc.fillRect(0, 0, M, M); oc.fillStyle = '#fff'; oc.textBaseline = 'alphabetic';
    font(l.fs);
    const w = oc.measureText(d).width;
    oc.fillText(d, x0 + (l.cell - w) / 2, base);
    oc.fillText('0', x0 + l.cell, base);
    font(l.fsP); oc.fillText('%', x0 + l.pctX, base - l.hD + l.hP);  // % top aligned with the digits
    const px = oc.getImageData(0, 0, M, M).data, a = new Uint8Array(M * M);
    for (let i = 0; i < M * M; i++) a[i] = px[i * 4];
    F[d] = sdf(a); G[d] = blur(F[d], 22);
  }
  // Where the melt effects apply: the changing digit only, fading out before the 0.
  const r0 = L.digitR - 0.04 * M, r1 = Math.min(L.zeroL - 0.01 * M, L.digitR + 0.02 * M);
  L.mask = new Float32Array(M); for (let x = 0; x < M; x++) L.mask[x] = 1 - sstep(r0, r1, x);
  return { fontSize2x: Math.round(l.fs), inkWidth1x: Math.round((l.inkR - l.inkL) / S), digitHeight1x: Math.round(l.hD / S) };
}

// State at time t: from, to, melt progress and the edge effects (in 1x pixels).
function state(t) {
  const seg = (a, b, t0) => {
    const u = (t - t0) / 1.0, p = esine(clamp((u - 0.06) / 0.84));
    const bump = sstep(0, 0.3, u) * (1 - sstep(0.78, 0.96, u));
    const tau = t - (t0 + 0.96);  // snap: a damped breath right after the edge goes crisp
    const over = tau > 0 ? -2.2 * Math.sin(Math.PI * tau / 0.16) * Math.exp(-tau / 0.09) : 0;
    return { a, b, p, melt: bump, soft: 3 * bump, spread: 5 * bump + over };
  };
  if (t < 0.5) return { a: '6', b: '6', p: 0, melt: 0, soft: 0, spread: 0 };
  if (t < 2.0) return seg('6', '5', 0.5);
  return seg('5', '3', 2.0);
}

function render(t) {
  const st = state(t), A = F[st.a], B = F[st.b], GA = G[st.a], GB = G[st.b], acc = new Float32Array(N * N);
  const kMelt = 0.35;
  for (let y = 0; y < M; y++) {
    const yn = clamp((y - L.top) / L.hD);
    const p = clamp(st.p * (1 + kMelt) - kMelt * yn);  // top melts first
    const row = y * M, orow = (y >> 1) * N;
    for (let x = 0; x < M; x++) {
      const m = L.mask[x], i = row + x;
      let s = A === B ? A[i] : A[i] + (B[i] - A[i]) * p;
      if (st.melt > 0) { const sb = GA[i] + (GB[i] - GA[i]) * p; s += (sb - s) * st.melt * m; }
      s -= st.spread * S * m;
      const w = (0.55 + st.soft * m) * S;  // half width of the edge ramp, 2x pixels
      const cov = clamp(0.5 - s / (2 * w));
      acc[orow + (x >> 1)] += cov * cov * (3 - 2 * cov);
    }
  }
  const d = img.data, g = TH.ground, ink = TH.ink;
  for (let i = 0; i < N * N; i++) {
    const a = acc[i] / 4;
    d[i * 4] = g[0] + (ink[0] - g[0]) * a; d[i * 4 + 1] = g[1] + (ink[1] - g[1]) * a; d[i * 4 + 2] = g[2] + (ink[2] - g[2]) * a; d[i * 4 + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
}
window.setup = setup; window.render = render;
