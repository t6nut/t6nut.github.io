// Builds the site from content/*.yml into dist/.
//   dist/index.html            one-page portfolio
// Usage: npm run build   (npm run dev also serves dist/ on http://localhost:3000)
import fs from 'node:fs';
import { parse } from 'yaml';

const read = (f) => parse(fs.readFileSync(`content/${f}.yml`, 'utf8'));
const p = read('profile');
const { featured, personal = [], more, renders = [] } = read('projects');
const { jobs } = read('experience');
const { groups: skills } = read('skills');
const s = read('sections');

const DIST = 'dist';
const year = new Date().getFullYear();

const esc = (v = '') => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
// Escape, then turn *word* into the gold italic serif accent.
const rich = (v = '') => esc(v).replace(/\*(.+?)\*/g, '<em>$1</em>');
const ext = (href, label, cls = '') => `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''} target="_blank" rel="noopener">${label}</a>`;
const pad = (i) => String(i + 1).padStart(2, '0');
const tags = (list = []) => `<ul class="tags">${list.map((t) => `<li>${esc(t)}</li>`).join('')}</ul>`;

// <picture> with a WebP source when src/<name>.webp sits next to the JPEG/PNG.
const picture = (src, alt, attrs = '') => {
  const webp = src.replace(/\.(jpe?g|png)$/i, '.webp');
  const hasWebp = webp !== src && fs.existsSync(`src/${webp.replace(/^\//, '')}`);
  return `<picture>${hasWebp ? `<source srcset="${esc(webp)}" type="image/webp">` : ''}<img src="${esc(src)}" alt="${esc(alt)}" ${attrs}></picture>`;
};

// Section eyebrows are numbered 01, 02 … in page order (the template is evaluated top to bottom).
let secNum = 0;
const eyebrow = (sec, numbered = true) => `<p class="eyebrow">${numbered ? `${pad(secNum++)} / ` : ''}${esc(sec.label)}</p>`;

// Section header: eyebrow + H2, with an optional intro or extra markup on the right.
const secHead = (id, sec, { numbered = true, size = '', intro = sec.intro, extra = '' } = {}) => `<div class="sec-head" data-reveal>
    <div>
      ${eyebrow(sec, numbered)}
      <h2 id="${id}-h" class="h2${size ? ` ${size}` : ''}">${rich(sec.title)}</h2>
    </div>
    ${intro ? `<p class="sec-intro">${esc(intro)}</p>` : ''}${extra}
  </div>`;

const links = (pr) => {
  const out = [];
  if (pr.url) out.push([pr.url2 ? 'Website' : 'Live', pr.url]);
  if (pr.url2) out.push(['Shop', pr.url2]);
  if (pr.code) out.push(['Code', pr.code]);
  return out.map(([label, href]) => ext(href, `${label} <span aria-hidden="true">↗</span>`)).join('');
};

const head = ({ title, description, canonical, css, extra = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="color-scheme" content="dark">
<meta name="theme-color" content="#0b0b0d">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<script>document.documentElement.classList.add('js')</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,800&family=Instrument+Serif:ital@1&family=JetBrains+Mono:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="${css}">
${extra}</head>`;

// ---------- Portfolio ----------
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: p.name,
  jobTitle: p.role,
  email: `mailto:${p.email}`,
  url: p.site_url,
  address: { '@type': 'PostalAddress', addressLocality: 'Tallinn', addressCountry: 'EE' },
  sameAs: [p.linkedin, p.github],
};

const dot = p.logo.indexOf('.');
const logoA = dot === -1 ? p.logo : p.logo.slice(0, dot);
const logoB = dot === -1 ? '' : p.logo.slice(dot);
const city = p.location.split(',')[0];
const kindLabel = { app: 'App', game: 'Game' };

const index = `${head({
  title: p.seo_title,
  description: p.seo_description,
  canonical: `${p.site_url}/`,
  css: 'styles.css',
  extra: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`,
})}
<body>
<a class="skip" href="#work">Skip to work</a>
<header class="site-nav">
  <a class="logo" href="#top" aria-label="${esc(p.logo)}"><span class="logo-a">${esc(logoA)}</span><span class="logo-b">${esc(logoB)}</span><span class="caret" aria-hidden="true"></span></a>
  <button class="menu-btn" type="button" aria-expanded="false" aria-controls="nav-links" hidden>Menu</button>
  <nav id="nav-links" class="nav-links" aria-label="Main">
    <a href="#work">Work</a><a href="#about">About</a><a href="#skills">Skills</a><a href="#experience">Experience</a><a href="#contact" class="nav-contact">Contact</a>
  </nav>
</header>

<main>
<section id="top" class="hero" aria-labelledby="hero-h">
  <div class="hero-bg" aria-hidden="true">
    <div class="hero-ambient"></div>
    <div class="hero-photo"><div class="hero-drift">${picture('/img/hero.jpg', '', 'width="1400" height="1867" fetchpriority="high"')}${picture('/img/hero.jpg', '', 'width="1400" height="1867" class="hero-haze"')}</div></div>
    <div class="hero-shade"></div>
    <div class="hero-wash"></div>
  </div>
  <div class="hero-in">
    <p class="eyebrow rise"><span class="dot"></span>${esc(p.role)} · ${esc(city)}</p>
    <h1 id="hero-h" class="rise">${rich(p.headline)}</h1>
    <p class="lede rise">${esc(p.pitch)}</p>
    <p class="cta rise">
      <a class="pill pill-gold" href="#work">See selected work →</a>
      <a class="pill" href="mailto:${esc(p.email)}">Get in touch</a>
    </p>
  </div>
  <div class="hero-bar">
    <span>${esc(p.availability)}</span><span aria-hidden="true">Scroll ↓</span>
  </div>
</section>

<section id="work" class="sec wrap" aria-labelledby="work-h">
  ${secHead('work', s.work)}
  <div class="work-grid">
${featured.map((pr, i) => `    <article class="card work-card" data-reveal>
      <span class="ghost" aria-hidden="true">${pad(i)}</span>
      <p class="card-role">${esc(pr.role)}</p>
      <h3>${esc(pr.name)}</h3>
      <p class="card-sum">${esc(pr.summary)}</p>
      ${tags(pr.stack)}
      <p class="card-links">${links(pr)}</p>
    </article>`).join('\n')}
  </div>
</section>

<section id="projects" class="sec wrap" aria-labelledby="projects-h">
  ${secHead('projects', s.projects, { extra: `
    <div class="filters" role="group" aria-label="Filter projects" hidden>
      <button type="button" data-filter="all" aria-pressed="true">All</button><button type="button" data-filter="app" aria-pressed="false">Apps</button><button type="button" data-filter="game" aria-pressed="false">Games</button>
    </div>` })}
  <div class="proj-grid">
${personal.map((pr, i) => `    <article class="card proj-card"${pr.kind ? ` data-kind="${esc(pr.kind)}"` : ''}>
      <div class="proj-top" aria-hidden="true">
        <span class="ghost">${pad(i)}</span>
        ${kindLabel[pr.kind] ? `<span class="badge">${kindLabel[pr.kind]}</span>` : ''}
      </div>
      <div class="proj-body">
        <h3>${esc(pr.name)}</h3>
        <p class="card-sum">${esc(pr.summary)}</p>
        ${tags(pr.stack)}
        ${pr.highlights?.length ? `<details class="how">
          <summary><span class="how-closed">+ How it works</span><span class="how-open">− Hide details</span></summary>
          <ul>${pr.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
        </details>` : ''}
        <p class="card-links">${links(pr)}</p>
      </div>
    </article>`).join('\n')}
  </div>

  <div class="more" data-reveal>
    <h3 class="more-h">${esc(s.projects.more)}</h3>
${more.map((g) => `    <div>
      <h4>${esc(g.label)}</h4>
      <ul>${g.items.map((it) => `<li>${it.url ? ext(it.url, esc(it.name)) : `<span>${esc(it.name)}</span>`}</li>`).join('')}</ul>
    </div>`).join('\n')}
  </div>
</section>

<section id="about" class="sec alt" aria-labelledby="about-h">
  <div class="wrap about">
    <div data-reveal>
      <figure class="portrait">
        ${picture('/img/portrait.jpg', p.name, 'width="960" height="960" loading="lazy"')}
        <figcaption>${esc(p.location)}</figcaption>
      </figure>
    </div>
    <div data-reveal>
      ${eyebrow(s.about)}
      <h2 id="about-h" class="h2 sm">${rich(s.about.title)}</h2>
      <div class="prose">${p.about.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
${p.stats?.length ? `      <dl class="stats">${p.stats.map((st) => `<div><dt>${esc(st.label)}</dt><dd>${esc(st.value)}</dd></div>`).join('')}</dl>` : ''}
    </div>
  </div>
</section>

${renders.length ? `<section id="renders" class="sec wrap" aria-labelledby="renders-h">
  ${secHead('renders', s.renders, { numbered: false, size: 'sm' })}
  <div class="renders" data-reveal>
${renders.map((r) => `    <figure>
      <div class="render-frame">${picture(r.image, `${r.title}, ${s.renders.tag}`, 'width="1200" height="800" loading="lazy"')}</div>
      <figcaption><span>${esc(r.title)}</span><span>${esc(s.renders.tag)}</span></figcaption>
    </figure>`).join('\n')}
  </div>
</section>

` : ''}<section id="skills" class="sec wrap" aria-labelledby="skills-h">
  ${secHead('skills', s.skills)}
  <div class="skills" data-reveal>
${skills.map((g) => `    <div>
      <h3>${esc(g.label)}</h3>
      <ul>${g.items.map((it) => `<li>${esc(it)}</li>`).join('')}</ul>
    </div>`).join('\n')}
  </div>
</section>

<section id="experience" class="sec alt narrow" aria-labelledby="experience-h">
  <div class="wrap-n">
  ${secHead('experience', s.experience)}
  <ol class="timeline">
${jobs.map((j) => `    <li data-reveal>
      <p class="when">${esc(j.when)}${j.place ? ` · ${esc(j.place)}` : ''}</p>
      <h3>${esc(j.title)}</h3>
      <p class="org">${esc(j.org)}</p>
      ${j.bullets?.length ? `<ul>${j.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>` : ''}
    </li>`).join('\n')}
  </ol>
  </div>
</section>

<section id="education" class="sec alt narrow" aria-labelledby="education-h">
  <div class="wrap-n">
  ${secHead('education', s.education, { size: 'sm' })}
  <div class="edu" data-reveal>
${p.education.map((e) => `    <div class="card edu-card">
      <p class="when">${esc(e.when)}</p>
      <h3>${esc(e.title)}</h3>
      <p class="org">${esc(e.org)}</p>
      ${e.note ? `<p class="note">${esc(e.note)}</p>` : ''}
    </div>`).join('\n')}
  </div>
  </div>
</section>

<section id="contact" class="sec contact" aria-labelledby="contact-h">
  <div class="contact-in" data-reveal>
    ${eyebrow(s.contact)}
    <h2 id="contact-h" class="h2 xl">${rich(s.contact.title)}</h2>
    <p class="contact-avail">${esc(p.availability)}</p>
    <a class="contact-mail" href="mailto:${esc(p.email)}">${esc(p.email)}</a>
    <p class="cta">
      <a class="pill pill-gold" href="mailto:${esc(p.email)}">Email me →</a>
      ${ext(p.linkedin, 'LinkedIn', 'pill')}
      ${ext(p.github, 'GitHub', 'pill')}
    </p>
  </div>
</section>
</main>

<footer class="foot">
  <span>${esc(p.name)} © ${year}</span>
  <span>${esc(s.footer)}</span>
</footer>
<script src="/main.js" type="module"></script>
</body>
</html>
`;

// ---------- Write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.cpSync('src', DIST, { recursive: true });
fs.writeFileSync(`${DIST}/index.html`, index);
fs.writeFileSync(`${DIST}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${p.site_url}/sitemap.xml\n`);
fs.writeFileSync(`${DIST}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${p.site_url}/</loc></url>
</urlset>
`);

console.log(`Built ${DIST}/`);
