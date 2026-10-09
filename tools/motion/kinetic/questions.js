'use strict';
// K1 "four questions": 12 s loop, a pure function of (t, frame).
// The four work[].question strings appear nervous (per glyph jitter of offset, rotation,
// weight and width every 3 frames), drift and overlap, then snap one by one into a clean list,
// hold, and loosen back into the loop. Motion blur on the snaps comes from render.cjs
// averaging sub frames; this file only has to be exact at any t.

const Q = ['Will I travel tonight?', 'Has everyone paid me back?', 'Am I okay this month?', 'Is this alert real?'];
const THEME = {
  light: { ground: '#FAFAF8', ink: '#0B0B0C', hue: ['#4B32C9', '#8A6400', '#0E6B5C', '#B53A16'], blend: 'multiply' },
  dark: { ground: '#0C0C0E', ink: '#F2F1EC', hue: ['#BBAAFF', '#FFD466', '#7FE0CB', '#FF9C78'], blend: 'screen' },
};
// Settled list, and the nervous layout each line jumps to (dx as a fraction of the frame, dy in px, scale).
// The film opens and ends on the settled list; only 1.6 to 3.6 s is nervous, and every glyph stays readable.
const VARIANT = {
  wide: {
    W: 1920, H: 600, list: { size: 80, x: 0.08, gap: 40 }, bullet: 14,
    nerv: [{ dx: 0.30, dy: -28, sc: 1.22 }, { dx: 0.05, dy: 8, sc: 0.9 }, { dx: 0.40, dy: 18, sc: 1.08 }, { dx: 0.16, dy: 30, sc: 0.86 }],
  },
  tall: {
    W: 1080, H: 600, list: { size: 74, x: 0.06, gap: 34 }, bullet: 22,
    nerv: [{ dx: 0.10, dy: -22, sc: 1.0 }, { dx: 0.0, dy: 6, sc: 0.84 }, { dx: 0.16, dy: 14, sc: 0.94 }, { dx: 0.22, dy: 26, sc: 0.9 }],
  },
};

const LOOP = 8;
const T_LOOSEN = 1.6, LOOSEN_LEN = 0.6;        // 1.6 to 2.2: the list loosens into its nervous layout
const T_SNAP = i => 3.6 + 0.45 * i;            // 3.6 to 5.4: snap back in work order, then hold to 8.0 (= 0.0)
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, t) => a + (b - a) * t;
const eio = t => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const eout = t => { t = clamp(t); return 1 - Math.pow(1 - t, 3); };
const ein = t => { t = clamp(t); return t * t; };
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const mixc = (a, b, t) => `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], t))).join(',')})`;
// Integer hash to [0, 1): seeded, so every render is identical.
function rnd(a, b, c, d) {
  let x = Math.imul(a + 1, 0x9E3779B1) ^ Math.imul(b + 7, 0x85EBCA77) ^ Math.imul(c + 13, 0xC2B2AE3D) ^ Math.imul(d + 29, 0x27D4EB2F);
  x = Math.imul(x ^ (x >>> 15), 0x2C1B3C6D); x = Math.imul(x ^ (x >>> 12), 0x297A2D39); x ^= x >>> 15;
  return (x >>> 0) / 4294967296;
}
// Damped spring step response: zeta 0.62, settles (2%) in about 0.45 s, about 7% overshoot.
function spring(t) {
  if (t <= 0) return 0;
  const z = 0.62, w = 14, wd = w * Math.sqrt(1 - z * z);
  const v = 1 - Math.exp(-z * w * t) * (Math.cos(wd * t) + (z / Math.sqrt(1 - z * z)) * Math.sin(wd * t));
  return t > 0.9 ? 1 : v;
}

let V, TH, stage, qs = [];
const m = () => document.getElementById('m');
function measure(text, size, wt, wd) {
  const e = m(); e.textContent = text;
  e.style.fontSize = size + 'px'; e.style.fontWeight = wt; e.style.fontStretch = wd + '%';
  return e.getBoundingClientRect().width;
}

function setup(o) {
  V = VARIANT[o.variant]; TH = THEME[o.theme];
  stage = document.getElementById('stage');
  stage.style.width = V.W + 'px'; stage.style.height = V.H + 'px'; stage.style.background = TH.ground;
  document.body.style.background = TH.ground;
  const L = V.list, pitch = L.size * 1.15, top0 = Math.round((V.H - pitch * 4) / 2);
  const tx = Math.round(V.W * L.x + L.gap);
  Q.forEach((text, i) => {
    const n = V.nerv[i];
    const w = measure(text, L.size * n.sc, 760, 95);
    const nx = clamp(tx + n.dx * V.W, tx, V.W * 0.97 - w);
    const el = document.createElement('div'); el.className = 'q'; el.style.mixBlendMode = TH.blend;
    const glyphs = [...text].map(ch => { const sp = document.createElement('span'); sp.textContent = ch; el.appendChild(sp); return sp; });
    const b = document.createElement('div'); b.className = 'b'; b.style.background = TH.hue[i];
    b.style.width = b.style.height = V.bullet + 'px';
    stage.appendChild(el); stage.appendChild(b);
    qs.push({ i, el, b, glyphs, nx, ny: top0 + i * pitch + n.dy, ns: L.size * n.sc,
      lx: tx, ly: top0 + i * pitch, ls: L.size, bx: Math.round(V.W * L.x), hue: rgb(TH.hue[i]), ink: rgb(TH.ink) });
  });
  return qs.map(q => ({ nx: Math.round(q.nx), ns: q.ns, listRight: Math.round(q.lx + measure(Q[q.i], q.ls, 600, 85)), W: V.W }));
}

// Glyph state for one tick. a = jitter amplitude (1 nervous, 0 settled). Small on purpose: offsets of 4 px or less
// at render size, 2.5 degrees, weight 420 to 760 and width 78 to 95%, so every word stays legible mid tremble.
function glyph(sp, qi, gi, tick, a) {
  const r = k => rnd(qi, gi, tick, k);
  const dx = (r(1) * 2 - 1) * 4 * a, dy = (r(2) * 2 - 1) * 4 * a, rot = (r(3) * 2 - 1) * 2.5 * a;
  sp.style.transform = a > 0.0005 ? `translate(${dx.toFixed(2)}px,${dy.toFixed(2)}px) rotate(${rot.toFixed(2)}deg)` : 'none';
  const space = sp.textContent === ' ';
  sp.style.fontWeight = space ? 600 : lerp(600, 420 + 340 * r(4), a).toFixed(1);
  sp.style.fontStretch = space ? '85%' : lerp(85, 78 + 17 * r(5), a).toFixed(2) + '%';
}

function render(t, frame) {
  const tick = Math.floor(frame / 3);
  for (const q of qs) {
    const { i, el, b, glyphs } = q, tS = T_SNAP(i);
    let p;                                        // 0 settled, 1 nervous
    if (t < T_LOOSEN) p = 0;
    else if (t < tS) p = eio((t - T_LOOSEN - i * 0.06) / LOOSEN_LEN);
    else p = 1 - spring(t - tS);
    const a = clamp(t < tS ? p : 1 - eout((t - tS) / 0.32));
    const x = lerp(q.lx, q.nx, p), y = lerp(q.ly, q.ny, p), size = lerp(q.ls, q.ns, p);
    const flick = 0.85 + 0.15 * rnd(i, 99, tick, 7);
    el.style.transform = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px)`;
    el.style.fontSize = size.toFixed(2) + 'px';
    el.style.opacity = lerp(1, flick, a).toFixed(3);
    el.style.color = mixc(q.ink, q.hue, clamp(a));
    glyphs.forEach((sp, gi) => glyph(sp, i, gi, tick, a));
    // the bullet keeps the project's hue; it shrinks away while the line is nervous and springs back with the snap
    const bs = t < tS ? 1 - eio((t - T_LOOSEN) / 0.3) : spring(t - tS - 0.08);
    b.style.transform = `translate(${q.bx}px,${(q.ly + q.ls * 0.66).toFixed(2)}px) translate(-50%,-50%) scale(${Math.max(0, bs).toFixed(3)})`;
    b.style.opacity = bs > 0 ? '1' : '0';
  }
}
window.setup = setup; window.render = render;
