// Theme switch for the portfolio.
// Modes cycle Auto → Light → Dark. Auto follows the visitor's local time: dark 19:00–07:00.
// The inline script in <head> sets the first theme before paint; this file wires the button and keeps Auto current.
const root = document.documentElement;
const MODES = ['auto', 'light', 'dark'];
const LABELS = { auto: 'Auto', light: 'Light', dark: 'Dark' };

const saved = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
const save = (m) => {
  try { if (m === 'auto') localStorage.removeItem('theme'); else localStorage.setItem('theme', m); } catch { /* private mode etc. */ }
};
const byTime = () => { const h = new Date().getHours(); return h >= 19 || h < 7 ? 'dark' : 'light'; };

let mode = MODES.includes(saved()) ? saved() : 'auto';

function apply() {
  root.dataset.theme = mode === 'auto' ? byTime() : mode;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = getComputedStyle(root).getPropertyValue('--bg').trim();
  for (const b of document.querySelectorAll('.theme-toggle')) {
    b.hidden = false;
    b.dataset.mode = mode;
    b.querySelector('.theme-label').textContent = LABELS[mode];
    const detail = mode === 'auto' ? `, ${root.dataset.theme} by time of day` : '';
    b.setAttribute('aria-label', `Colour theme: ${LABELS[mode]}${detail}. Change theme`);
  }
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.theme-toggle')) return;
  mode = MODES[(MODES.indexOf(mode) + 1) % MODES.length];
  save(mode);
  apply();
});

setInterval(() => { if (mode === 'auto') apply(); }, 60_000);
apply();
