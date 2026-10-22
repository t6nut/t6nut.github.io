// Sticky header border + highlight the nav link of the section in view. The page works fine without this.
const header = document.querySelector('.top');
const links = [...document.querySelectorAll('.top nav a[href^="#"]')];
const sections = links.map((a) => document.querySelector(a.hash)).filter(Boolean);

function update() {
  header.classList.toggle('scrolled', window.scrollY > 8);

  // The active section is the last one whose top has passed a line a third of the way down the viewport.
  // At the very bottom of the page, the last section wins, even if it's short.
  const line = header.offsetHeight + window.innerHeight / 3;
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
