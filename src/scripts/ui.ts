// Every microinteraction on the site. Each one is off under reduced motion or the footer toggle.
const root = document.documentElement;
const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches || root.classList.contains('calm');
const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };

// Reduce motion toggle
const calm = document.getElementById('calm');
if (calm) {
  const sync = () => { const on = root.classList.contains('calm'); calm.setAttribute('aria-pressed', String(on)); calm.textContent = on ? 'Motion off' : 'Reduce motion'; };
  calm.addEventListener('click', () => { root.classList.toggle('calm'); save('calm', root.classList.contains('calm') ? '1' : '0'); sync(); });
  sync();
}

// Light and dark: follows the device until the visitor picks, then remembers. The new theme spreads in a circle from the switch.
const theme = document.getElementById('theme');
if (theme) {
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const label = () => { theme.textContent = dark() ? 'Light mode' : 'Dark mode'; };
  const apply = () => { root.dataset.theme = dark() ? 'light' : 'dark'; save('theme', root.dataset.theme); label(); };
  theme.addEventListener('click', () => {
    const d = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };
    if (!d.startViewTransition || reduced()) return apply();
    const r = theme.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    d.startViewTransition(apply).ready.then(() => root.animate(
      { clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
      { duration: 560, easing: 'cubic-bezier(.23,1,.32,1)', pseudoElement: '::view-transition-new(root)' }));
  });
  label();
}

// Sections reveal once as they enter
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Work loops: hover or focus on desktop, in view on touch
const tiles = document.querySelectorAll<HTMLElement>('.tile');
const play = (t: Element, on: boolean) => {
  const v = t.querySelector('video'), m = t.querySelector('.media'); if (!v || !m) return;
  if (on && !reduced()) v.play().then(() => m.classList.add('playing')).catch(() => {});
  else { v.pause(); m.classList.remove('playing'); }
};
if (fine) tiles.forEach(t => {
  ['mouseenter', 'focus'].forEach(ev => t.addEventListener(ev, () => play(t, true)));
  ['mouseleave', 'blur'].forEach(ev => t.addEventListener(ev, () => play(t, false)));
});
else { const vio = new IntersectionObserver(es => es.forEach(e => play(e.target, e.intersectionRatio > .6)), { threshold: [0, .6] }); tiles.forEach(t => vio.observe(t)); }

// A "View case study" label follows the cursor over a tile's image, with a little lag
if (fine && tiles.length) {
  const c = document.createElement('div');
  c.className = 'cursor'; c.setAttribute('aria-hidden', 'true'); c.innerHTML = '<span>View case study</span>';
  document.body.append(c);
  let x = 0, y = 0, tx = 0, ty = 0, on = false;
  const loop = () => { x += (tx - x) * .22; y += (ty - y) * .22; c.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`; if (on) requestAnimationFrame(loop); };
  document.querySelectorAll<HTMLElement>('.tile .media').forEach(m => {
    m.addEventListener('pointerenter', e => { x = tx = e.clientX; y = ty = e.clientY; on = true; c.classList.add('on'); loop(); });
    m.addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; if (reduced()) { x = tx; y = ty; } });
    m.addEventListener('pointerleave', () => { on = false; c.classList.remove('on'); });
  });
}

// Result numbers count up once in view
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return; cio.unobserve(e.target);
  const el = e.target as HTMLElement; if (reduced()) return;
  const n = +el.dataset.n!, t0 = performance.now(), d = 900;
  const tick = (t: number) => { const p = Math.min((t - t0) / d, 1); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 4))) + '%'; if (p < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
}), { threshold: .5 });
document.querySelectorAll('.r-num[data-n]').forEach(n => cio.observe(n));

// Email copies on tap, the tag says so, then resets
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  const tag = b.querySelector('.tag')!;
  try { await navigator.clipboard.writeText(b.dataset.copy!); } catch { location.href = `mailto:${b.dataset.copy}`; return; }
  tag.textContent = 'Copied'; b.classList.add('done');
  setTimeout(() => { tag.textContent = 'Copy'; b.classList.remove('done'); }, 2000);
}));
