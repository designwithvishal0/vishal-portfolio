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
  const sync = () => calm.setAttribute(calm.classList.contains('sw') ? 'aria-checked' : 'aria-pressed', String(root.classList.contains('calm')));
  calm.addEventListener('click', () => { root.classList.toggle('calm'); save('calm', root.classList.contains('calm') ? '1' : '0'); sync(); resync(); });
  sync();
}

// Light and dark: follows the device until the visitor picks, then remembers. The new theme spreads in a circle from the switch.
const theme = document.getElementById('theme');
if (theme) {
  const dark = () => root.dataset.theme ? root.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  const label = () => { if (theme.classList.contains('sw')) theme.setAttribute('aria-checked', String(dark())); else theme.textContent = dark() ? 'Light mode' : 'Dark mode'; };
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

// Accessibility menu: a click or tap opens it everywhere. With a mouse, hovering opens it too and leaving closes it,
// unless it was clicked open; then it stays until a second click, a click outside or Escape. Screen readers hear its state.
const a11y = document.querySelector<HTMLButtonElement>('.a11y'), menu = document.getElementById('a11y-menu');
if (a11y && menu) {
  let byHover = false, pinned = false;
  a11y.setAttribute('aria-expanded', 'false');
  menu.addEventListener('toggle', e => {
    const open = (e as ToggleEvent).newState === 'open';
    a11y.setAttribute('aria-expanded', String(open));
    if (!open) pinned = byHover = false;
  });
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    let t = 0;
    const isOpen = () => menu.matches(':popover-open');
    const open = () => { clearTimeout(t); if (!isOpen()) { menu.showPopover(); byHover = true; } };
    const close = () => { clearTimeout(t); t = window.setTimeout(() => { if (isOpen() && !pinned) menu.hidePopover(); }, 300); };
    a11y.addEventListener('click', () => {
      // runs before the button's own popover toggle: a click on a menu hover opened pins it instead of shutting it
      if (byHover && isOpen()) { a11y.popoverTargetAction = 'show'; setTimeout(() => { a11y.popoverTargetAction = 'toggle'; }); }
      pinned = true; byHover = false;
    });
    [a11y, menu].forEach(el => { el.addEventListener('pointerenter', open); el.addEventListener('pointerleave', close); });
  }
}

// Sections enter once as they scroll in
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); } }), { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Result numbers count up from zero once, the first time they are half in view. Under reduced motion they just show.
// data-suf sets what follows the number (default %).
const nums = document.querySelectorAll<HTMLElement>('.r-num[data-n]');
const suf = (el: HTMLElement) => el.dataset.suf ?? '%';
if (!reduced()) nums.forEach(el => { el.textContent = `0${suf(el)}`; });
const cio = new IntersectionObserver(es => es.forEach(e => {
  if (!e.isIntersecting) return;
  cio.unobserve(e.target);
  const el = e.target as HTMLElement, n = +el.dataset.n!;
  if (reduced()) { el.textContent = `${n}${suf(el)}`; return; }
  const t0 = performance.now();
  const tick = (t: number) => {
    const p = Math.min((t - t0) / 900, 1);
    el.textContent = `${Math.round(n * (1 - (1 - p) ** 4))}${suf(el)}`;
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
