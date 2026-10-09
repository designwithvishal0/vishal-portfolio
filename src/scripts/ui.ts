// Every interaction on the site. Motion stops under the OS reduced motion setting or the footer toggle.
const root = document.documentElement;
const osCalm = matchMedia('(prefers-reduced-motion: reduce)');
const reduced = () => osCalm.matches || root.classList.contains('calm');
const save = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch {} };
const resyncs: (() => void)[] = [];
const resync = () => resyncs.forEach(f => f());
osCalm.addEventListener('change', resync);

// Reduce motion toggle
const calm = document.getElementById('calm');
if (calm) {
  const sync = () => calm.setAttribute('aria-pressed', String(root.classList.contains('calm')));
  calm.addEventListener('click', () => { root.classList.toggle('calm'); save('calm', root.classList.contains('calm') ? '1' : '0'); sync(); resync(); });
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

// Sections enter once as they scroll in
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Result numbers count up from zero once, the first time they are half in view. Under reduced motion they just show.
const nums = document.querySelectorAll<HTMLElement>('.r-num[data-n]');
if (!reduced()) nums.forEach(el => { el.textContent = '0%'; });
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const el = e.target as HTMLElement, n = +el.dataset.n!;
  if (reduced()) { el.textContent = `${n}%`; return; }
  const t0 = performance.now();
  const tick = (t: number) => {
    const p = Math.min((t - t0) / 900, 1);
    el.textContent = `${Math.round(n * (1 - (1 - p) ** 4))}%`;
    if (p < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}), { threshold: .5 });
nums.forEach(el => cio.observe(el));

// Work loops play while mostly in view, on every device. Under reduced motion nothing starts on its own.
// The button pauses or plays one loop, and that choice wins until the page reloads.
document.querySelectorAll<HTMLElement>('.media').forEach(m => {
  const v = m.querySelector('video'), b = m.querySelector<HTMLButtonElement>('.vctl');
  if (!v || !b) return;
  let shown = 0, user: boolean | null = null;
  const sync = () => {
    const run = user === null ? shown >= .6 && !reduced() : user && shown > 0;
    if (run) v.play().catch(() => {}); else v.pause();
    m.dataset.state = run ? 'playing' : 'paused';
    b.setAttribute('aria-label', `${run ? 'Pause' : 'Play'} the ${b.dataset.name} preview`);
  };
  v.addEventListener('playing', () => m.classList.add('started'), { once: true });
  b.addEventListener('click', () => { user = m.dataset.state !== 'playing'; m.dataset.user = ''; sync(); });
  new IntersectionObserver(([e]) => { shown = e.isIntersecting ? e.intersectionRatio : 0; sync(); }, { threshold: [0, .6] }).observe(m);
  resyncs.push(sync);
});

// Email copies on tap, the tag says so, then resets
const status = document.getElementById('copied');
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach(b => b.addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(b.dataset.copy!); } catch { location.href = `mailto:${b.dataset.copy}`; return; }
  b.classList.add('done'); if (status) status.textContent = 'Email address copied';
  setTimeout(() => { b.classList.remove('done'); if (status) status.textContent = ''; }, 2000);
}));
