// Timeline for scene.html. Pure function of t (seconds); render(t) resolves once clip frames are decoded.
const $ = id => document.getElementById(id);
const C = x => Math.max(0, Math.min(1, x)), R = (t, a, b) => C((t - a) / (b - a));
const eo = x => 1 - (1 - x) ** 3, eio = x => x < .5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2;
const back = x => { const s = 1.5; x -= 1; return x * x * ((s + 1) * x + s) + 1; };
// in at a (dur d), out at z (dur e); dy = rise in px
function show(el, t, a, z, { d = .6, e = .35, dy = 28, sc = 0, ox = 0 } = {}) {
  const i = eo(R(t, a, a + d)), o = R(t, z - e, z), v = i * (1 - o);
  el.style.opacity = v;
  el.style.transform = `translate(${ox * (1 - i)}px,${dy * (1 - i) - 14 * o}px) scale(${1 + sc * (1 - i)})`;
  return v;
}
const T = 45, SEC = [['Landing pages', 0], ['Product pages', 18.6], ['Store audits', 23.8], ['Apps and campaigns', 29]];
const FRAMES = { bbb_phone: 180, pdp_phone: 210, pwl_phone: 180, ixigo_phone: 180, reward_phone: 180, twelve_phone: 180, bbb_hero: 102 };
const AR = { bbb_phone: 500 / 1040, pdp_phone: 440 / 960, pwl_phone: 510 / 1060, ixigo_phone: 440 / 1040, reward_phone: 470 / 1000, twelve_phone: 490 / 1030 };
// visible phone inside each clip (fractions of the clip trimmed left, top, right, bottom): the clips carry a margin of their old backdrop
const CROP = { bbb_phone: [.05, .02, .05, .03], pdp_phone: [.05, .04, .05, .04], pwl_phone: [.03, 0, .03, .02], ixigo_phone: [.035, 0, .035, .01], reward_phone: [.04, .01, .04, .02], twelve_phone: [.025, 0, .025, .02] };
const fr = (clip, s) => `frames/${clip}/${String(Math.min(FRAMES[clip], Math.max(1, Math.floor(s * 30) + 1))).padStart(3, '0')}.jpg`;
const pend = [];
function src(img, u) { if (img.getAttribute('src') !== u) { img.src = u; pend.push(img.decode().catch(() => {})); } }
function phone(id, im, clip, s, x, y, h, v, dy = 0, rot = 0) {
  const [cl, ct, cr, cb] = CROP[clip], w = Math.round(h * AR[clip] * (1 - cl - cr) / (1 - ct - cb)), el = $(id);
  Object.assign(el.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px', opacity: v, transform: `translateY(${dy}px) rotate(${rot}deg)`, borderRadius: Math.round(w * .14) + 'px' });
  const img = $(im), iw = w / (1 - cl - cr), ih = h / (1 - ct - cb);
  Object.assign(img.style, { width: iw + 'px', height: ih + 'px', left: -cl * iw + 'px', top: -ct * ih + 'px', transform: 'none' });
  src(img, fr(clip, s));
}
const glow = (c, x, y, o = 1) => { const g = $('glow').style; g.setProperty('--gc', c); g.setProperty('--gx', x); g.setProperty('--gy', y); g.setProperty('--go', o); };
const heads = {
  land: `<span class="chip" style="color:#3DDC84;border-color:rgba(61,220,132,.4)"><b>01</b> Landing pages</span><div class="h" style="font-size:66px;margin-top:22px">Landing pages<br>that <span class="s" style="color:#3DDC84;font-size:74px">convert.</span></div>`,
  pdp: `<span class="chip" style="color:#FF5C9D;border-color:rgba(255,62,138,.45)"><b>02</b> Product pages</span><div class="h" style="font-size:50px;margin-top:20px">Product pages that kill<br>the <span id="dbt" style="padding:0 6px;border-radius:6px">doubt,</span><br><span class="s" style="color:#FF5C9D;font-size:56px">before it kills the sale.</span></div>`,
  audit: `<span class="chip" style="color:#C9F158;border-color:rgba(201,241,88,.4)"><b>03</b> Store audits</span><div class="h" style="font-size:56px;margin-top:20px">Store audits that find<br>where your money<br><span class="s" style="color:#FF6B8A;font-size:64px">leaks.</span></div>`,
  apps: `<span class="chip" style="color:#FFB36B;border-color:rgba(255,154,61,.45)"><b>04</b> Apps</span><div class="h" style="font-size:56px;margin-top:20px">Apps people get,<br>from the very <span class="s" style="color:#FFB36B;font-size:62px">first tap.</span></div>`,
};
let curHead = '';
const setHead = k => { if (curHead !== k) { $('head').innerHTML = heads[k] || ''; curHead = k; } };
const APPS = [
  ['ixigo_phone', 'IXIGO TRAINS', 'Is my seat<br>confirmed?', '#FF8A3D'],
  ['reward_phone', 'REWARD CENTRE', 'How close am<br>I to Gold?', '#E9C46A'],
  ['twelve_phone', 'TWELVE', 'How much can<br>I spend today?', '#C9F158'],
];
const PILL = (el, html, x, y, bg, fg) => { if (el.dataset.k !== html) { el.innerHTML = html; el.dataset.k = html; } Object.assign(el.style, { left: x + 'px', top: y + 'px', background: bg, color: fg }); };
// hearts for the campaign scene: seeded, so every render is identical
const H = Array.from({ length: 16 }, (_, i) => { const r = n => (Math.sin(i * 91.7 + n * 37.3) * 43758.5453) % 1; const a = Math.abs; return { x: 20 + a(r(1)) * 680, d: 36 + a(r(2)) * 3.4, sp: 70 + a(r(3)) * 90, s: 14 + a(r(4)) * 18, w: a(r(5)) > .6 }; });
$('hearts').innerHTML = H.map((h, i) => `<div class="l" id="h${i}" style="left:${h.x}px;top:0;font-size:${h.s}px;color:${h.w ? '#fff' : '#FF4D6D'}">♥</div>`).join('');
$('tags').innerHTML = ['Landing pages', 'Product pages', 'Store audits', 'Apps'].map(s => `<span class="chip" style="font-size:17px;color:#F2F1EC;border-color:rgba(242,241,236,.25)">${s}</span>`).join('');
$('bashim').src = $('bashbg').src = fr('bbb_hero', 0);

window.render = async t => {
  pend.length = 0;
  // ---- 0 to 11.2: the hook
  let v = show($('hook'), t, .1, 5.9, { d: .8, dy: 40 });
  const up = eio(R(t, 3, 3.6));
  $('hook').style.transform += ` translateY(${-246 * up}px) scale(${1 - .3 * up})`; $('hook').style.transformOrigin = '0 0';
  show($('ring'), t, 3.3, 5.9, { sc: -.1, dy: 0 });
  const k = eio(R(t, 3.5, 5.3)), n = 2.30 - 2 * k;
  $('num').textContent = n.toFixed(2); $('arc').style.strokeDashoffset = 1131 * k * .87;
  show($('then'), t, 4.7, 5.9, { dy: 14 });
  v = show($('stay'), t, 5.95, 8.2, { d: .35, sc: .35, dy: 0 });
  const tilt = eio(R(t, 7, 7.6));
  $('stay').style.transform += ` rotate(${-9 * tilt}deg) scale(${1 + .25 * tilt})`; $('stay').style.opacity = v * (1 - .75 * tilt);
  show($('leave'), t, 7.05, 8.2, { d: .5, dy: 30 });
  show($('me'), t, 8.3, 11.2, { d: .7, dy: 40 });
  $('stayw').style.opacity = eo(R(t, 10, 10.4));
  glow(t < 8.3 ? '#26330f' : '#1f2a12', '75%', '20%');
  // ---- 11.2 to 13: the Big Birthday Bash banner
  v = show($('bash'), t, 11.2, 13, { d: .45, e: .3, dy: 0, sc: .06 });
  if (v > 0) { const u = fr('bbb_hero', t - 11.2); src($('bashim'), u); src($('bashbg'), u); }
  // ---- section heads
  const sec = t < 18.6 ? 'land' : t < 23.8 ? 'pdp' : t < 29 ? 'audit' : t < 35.2 ? 'apps' : '';
  setHead(sec);
  const hs = { land: [13, 18.6], pdp: [18.6, 23.8], audit: [23.8, 29], apps: [29, 35.2] }[sec];
  if (hs) show($('head'), t, hs[0] + .05, hs[1], { d: .6, dy: 30 }); else $('head').style.opacity = 0;
  for (const p of ['p1', 'p2', 'p3', 'phA']) $(p).style.opacity = 0;
  $('lines').innerHTML = ''; $('lines').style.opacity = 1;
  // ---- 13 to 18.6: landing pages
  if (t >= 13 && t < 18.6) {
    glow('#123d26', '80%', '55%');
    const i = eo(R(t, 13.3, 14.1)), o = R(t, 18.25, 18.6);
    phone('phA', 'imA', 'bbb_phone', t - 13.3, 404, 300, 500, i * (1 - o), 90 * (1 - i));
    [['p1', '+ Games people play', 14.6, 560], ['p2', '+ Moments they enjoy', 15.3, 622]].forEach(([id, s, a, y]) => {
      const el = $(id); PILL(el, s, 44, y, '#3DDC84', '#06210f'); el.style.fontSize = '21px'; const b = back(R(t, a, a + .45));
      el.style.opacity = C(R(t, a, a + .2)) * (1 - o); el.style.transform = `scale(${.6 + .4 * b})`; el.style.transformOrigin = '0 50%';
    });
  }
  // ---- 18.6 to 23.8: product pages
  if (t >= 18.6 && t < 23.8) {
    glow('#3d0f25', '30%', '70%');
    const d = $('dbt'); if (d) { const h = eo(R(t, 19.5, 19.9)); d.style.background = `rgba(255,62,138,${h})`; }
    const i = eo(R(t, 18.9, 19.7)), o = R(t, 23.45, 23.8);
    phone('phA', 'imA', 'pdp_phone', t - 18.9, 78, 330, 470, i * (1 - o), 90 * (1 - i));
    let L = '';
    [['p1', 'Doubt answered', 20.1, 400], ['p2', 'Trust built in', 20.8, 540], ['p3', 'Price adds up', 21.5, 680]].forEach(([id, s, a, y]) => {
      const el = $(id); PILL(el, s, 372, y - 19, '#FF3E8A', '#fff'); const b = back(R(t, a, a + .45)), w = eo(R(t, a - .25, a + .1));
      el.style.opacity = C(R(t, a, a + .2)) * (1 - o); el.style.transform = `scale(${.6 + .4 * b})`; el.style.transformOrigin = '0 50%';
      L += `<line x1="250" y1="${y}" x2="${250 + 116 * w}" y2="${y}" stroke="#FF3E8A" stroke-width="2" opacity="${(1 - o)}"/><circle cx="250" cy="${y}" r="${5 * w}" fill="#FF3E8A" opacity="${1 - o}"/>`;
    });
    $('lines').innerHTML = L; $('lines').style.opacity = 1;
  }
  // ---- 23.8 to 29: store audits
  v = show($('audit'), t, 24.2, 29, { d: .6, dy: 40 });
  if (v > 0) {
    glow('#2c3a10', '80%', '75%');
    [[1, 100, 24.7], [2, 62, 25.05], [3, 14, 25.4], [4, 6, 25.75]].forEach(([n, w, a]) => { $('b' + n).style.width = w * eo(R(t, a, a + .7)) + '%'; });
    const lk = eo(R(t, 26.5, 26.9));
    $('b3').style.background = lk > .5 ? '#FF6B8A' : '#C9F158'; $('lk').style.color = lk > .5 ? '#FF6B8A' : '#F2F1EC';
    $('leak').style.opacity = lk; $('leak').style.transform = `scale(${.7 + .3 * back(lk)})`;
    $('fix').style.opacity = eo(R(t, 27.3, 27.8));
  }
  // ---- 29 to 35.2: apps, three questions
  $('q').style.opacity = 0;
  if (t >= 29 && t < 35.2) {
    const b = Math.min(2, Math.floor((t - 29.4) / 1.95 + (t < 29.4 ? 0 : 0))), j = Math.max(0, b), a = 29.4 + j * 1.95, z = j === 2 ? 35.2 : a + 1.95;
    const [clip, lab, qq, col] = APPS[j];
    glow(col + '44', '80%', '60%');
    const qe = $('q'); if (qe.dataset.k !== lab) { qe.innerHTML = `<div class="t" style="font-size:15px;letter-spacing:.18em;color:${col}">${lab}</div><div class="s" style="font-size:52px;line-height:1.02;margin-top:12px">${qq}</div>`; qe.dataset.k = lab; }
    qe.style.top = '330px'; show(qe, t, a, z, { d: .45, e: .25, dy: 24 });
    const i = eo(R(t, a, a + .55)), o = R(t, z - .25, z);
    phone('phA', 'imA', clip, t - a + 1, 396, 290, 510, i * (1 - o), 70 * (1 - i));
  }
  // ---- 35.2 to 41: one campaign
  show($('res'), t, 35.3, 41, { dy: 20 });
  $('wk').style.opacity = eo(R(t, 35.8, 36.2)) * .55 + 0;
  show($('r1'), t, 36.1, 41, { dy: 30 });
  $('gmv').textContent = '₹' + (9.89 * eo(R(t, 36.1, 37.1))).toFixed(2);
  show($('r2'), t, 37.3, 41, { dy: 30 });
  $('sh').textContent = Math.round(13707 * eo(R(t, 37.3, 38.3))).toLocaleString('en-IN');
  if (t >= 35.2 && t < 41) {
    glow('#4a0f1c', '70%', '55%');
    const i = eo(R(t, 35.6, 36.4)), o = R(t, 40.65, 41);
    phone('phA', 'imA', 'pwl_phone', t - 35.6, 460, 350, 450, i * (1 - o), 80 * (1 - i), 3 * (1 - i));
  }
  H.forEach((h, i) => { const e = $('h' + i), s = t - h.d; const vis = s > 0 && t < 41; e.style.opacity = vis ? C(s * 3) * C((41 - t) * 3) * C(1.8 - s * .25) : 0; e.style.transform = `translate(${Math.sin(s * 2 + i) * 14}px,${880 - s * h.sp}px)`; });
  // ---- 41 to 45: the close
  show($('end'), t, 41.25, 99, { d: .8, dy: 40 });
  if (t >= 41) glow('#26330f', '50%', '30%');
  [...$('tags').children].forEach((c, i) => { c.style.opacity = eo(R(t, 42.5 + i * .12, 42.9 + i * .12)); });
  $('open').style.opacity = eo(R(t, 43.2, 43.6)); $('nm').style.opacity = eo(R(t, 42, 42.5));
  await Promise.all(pend);
};
