// Shared behaviour on every page: reveal on scroll, nav colour by section, mobile menu.
const doc = document.documentElement;
requestAnimationFrame(() => document.body.classList.add('loaded'));

const io = new IntersectionObserver(
  (es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
  { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
);
document.querySelectorAll('.rv').forEach((el) => io.observe(el));

const nav = document.getElementById('nav')!;
const zones = document.querySelectorAll<HTMLElement>('[data-nav]');
const initial = (nav.className.match(/t-(\w+)/) || [])[1] || 'indigo';
const hit = (z: Element, y: number) => { const r = z.getBoundingClientRect(); return r.top <= y && r.bottom > y; };
function probe() {
  let t = initial;
  zones.forEach((z) => { if (hit(z, 38)) t = z.dataset.nav!; });
  nav.className = 'nav t-' + t + (scrollY > 10 ? ' solid' : '');
}
let tk = false;
addEventListener('scroll', () => { if (tk) return; tk = true; requestAnimationFrame(() => { probe(); tk = false; }); }, { passive: true });
addEventListener('resize', probe);
probe();

const burger = document.getElementById('burger')!;
const sheet = document.getElementById('sheet')!;
function menu(o: boolean) {
  doc.classList.toggle('menu-open', o);
  burger.setAttribute('aria-expanded', String(o));
  burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
  sheet.setAttribute('aria-hidden', String(!o));
  sheet.inert = !o;
  document.body.style.overflow = o ? 'hidden' : '';
}
burger.addEventListener('click', () => menu(!doc.classList.contains('menu-open')));
sheet.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => menu(false)));
addEventListener('keydown', (e) => { if (e.key === 'Escape' && doc.classList.contains('menu-open')) menu(false); });
