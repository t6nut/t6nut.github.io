// Small enhancements. The page works fine without any of this.
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- Nav: highlight the link of the section in view, mobile menu ----------
const nav = document.querySelector('.site-nav');
const links = [...nav.querySelectorAll('.nav-links a[href^="#"]')];
const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean);

function update() {
  // The active section is the last one whose top has passed a line a third of the way down the viewport.
  // At the very bottom of the page, the last section wins, even if it's short.
  const line = nav.offsetHeight + window.innerHeight / 3;
  const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
  let current = null;
  for (const s of sections) if (s.getBoundingClientRect().top <= line) current = s;
  if (atBottom) current = sections[sections.length - 1];

  for (const a of links) {
    const on = current && a.hash === `#${current.id}`;
    a.classList.toggle('active', Boolean(on));
    if (on) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
}

let queued = false;
const onScroll = () => {
  if (queued) return;
  queued = true;
  requestAnimationFrame(() => { queued = false; update(); });
};
window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
update();

const menuBtn = nav.querySelector('.menu-btn');
const setMenu = (open) => {
  nav.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.textContent = open ? 'Close' : 'Menu';
};
menuBtn.hidden = false;
menuBtn.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelector('.nav-links').addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); menuBtn.focus(); }
});

// ---------- Typewriter logo ----------
// The full text is in the HTML; it is cleared and typed back in. aria-label on the link keeps the name stable.
const logo = nav.querySelector('.logo');
const partA = logo.querySelector('.logo-a');
const partB = logo.querySelector('.logo-b');
if (!reduceMotion) {
  const a = partA.textContent;
  const b = partB.textContent;
  const full = a + b;
  let n = 0;
  partA.textContent = '';
  partB.textContent = '';
  logo.classList.add('typing');
  const step = () => {
    n += 1;
    partA.textContent = full.slice(0, Math.min(n, a.length));
    partB.textContent = full.slice(a.length, Math.max(n, a.length));
    if (n >= full.length) { logo.classList.remove('typing'); return; }
    // Extra pause before the ".dev" part.
    setTimeout(step, n === a.length ? 260 : 70 + Math.random() * 70);
  };
  setTimeout(step, 450);
}

// ---------- Scroll reveal ----------
// Only blocks that start below the viewport are hidden, and only once the observer has reported on them.
if (!reduceMotion && 'IntersectionObserver' in window) {
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target;
      if (!el.dataset.seen) {
        el.dataset.seen = '1';
        if (!e.isIntersecting && e.boundingClientRect.top > 0) {
          el.classList.add('reveal-pending');
          requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('reveal-anim')));
        } else {
          io.unobserve(el);
        }
        continue;
      }
      if (e.isIntersecting) {
        el.classList.remove('reveal-pending');
        io.unobserve(el);
      }
    }
  }, { threshold: 0.1 });
  for (const el of document.querySelectorAll('[data-reveal]')) io.observe(el);
}

// ---------- Project filter (All / Apps / Games) ----------
const filters = document.querySelector('.filters');
if (filters) {
  const buttons = [...filters.querySelectorAll('button')];
  const cards = [...document.querySelectorAll('.proj-card')];
  filters.hidden = false;
  filters.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    const f = btn.dataset.filter;
    for (const b of buttons) b.setAttribute('aria-pressed', String(b === btn));
    let i = 0;
    for (const c of cards) {
      const show = f === 'all' || c.dataset.kind === f;
      c.hidden = !show;
      c.classList.remove('card-in');
      if (!show) continue;
      i += 1;
      c.querySelector('.ghost').textContent = String(i).padStart(2, '0');
      void c.offsetWidth; // restart the entrance animation
      c.classList.add('card-in');
    }
  });
}
