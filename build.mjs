// Builds the site from content/*.yml into dist/.
//   dist/index.html            one-page portfolio
// Usage: npm run build   (npm run dev also serves dist/ on http://localhost:3000)
import fs from 'node:fs';
import { parse } from 'yaml';

const read = (f) => parse(fs.readFileSync(`content/${f}.yml`, 'utf8'));
const p = read('profile');
const { featured, personal = [], more } = read('projects');
const { jobs } = read('experience');
const { groups: skills } = read('skills');

const DIST = 'dist';
const year = new Date().getFullYear();

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const bare = (u) => u.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
const ext = (href, label, cls = '') => `<a href="${esc(href)}"${cls ? ` class="${cls}"` : ''} rel="noopener">${esc(label)}</a>`;

const THEME_BOOT = `<script>try{var m=localStorage.getItem('theme')}catch(e){}var h=new Date().getHours();document.documentElement.dataset.theme=m==='light'||m==='dark'?m:(h>=19||h<7?'dark':'light')</script>`;

const head = ({ title, description, canonical, css, extra = '', theme = true }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="color-scheme" content="light dark">
<meta name="theme-color" content="#f6f5f1">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${esc(canonical)}">
<meta name="twitter:card" content="summary">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
${theme ? `${THEME_BOOT}\n` : ''}<link rel="stylesheet" href="${css}">
${theme ? '<script src="/theme.js" defer></script>\n' : ''}${extra}</head>`;

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

const projectLinks = (pr) => {
  const links = [];
  if (pr.url) links.push(ext(pr.url, `${bare(pr.url)} ↗`));
  if (pr.url2) links.push(ext(pr.url2, `${bare(pr.url2)} ↗`));
  if (pr.code) links.push(ext(pr.code, 'Code ↗'));
  return links.join('');
};

const index = `${head({
  title: p.seo_title,
  description: p.seo_description,
  canonical: `${p.site_url}/`,
  css: 'styles.css',
  extra: `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>\n`,
})}
<body>
<a class="skip" href="#work">Skip to work</a>
<header class="top">
  <div class="wrap top-in">
    <a class="mark" href="#top"><span aria-hidden="true">TT</span><span class="sr">${esc(p.name)}, back to top</span></a>
    <div class="top-right">
    <nav aria-label="Main">
      <a href="#work">Work</a><a href="#skills">Skills</a><a href="#about">About</a><a href="#contact">Contact</a>
    </nav>
    <button class="theme-toggle" type="button" hidden>
      <svg class="i i-auto" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.25"/><path d="M8 1.75a6.25 6.25 0 0 1 0 12.5z" fill="currentColor"/></svg>
      <svg class="i i-light" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="3"/><path d="M8 1v1.6M8 13.4V15M1 8h1.6M13.4 8H15M3.05 3.05l1.13 1.13M11.82 11.82l1.13 1.13M3.05 12.95l1.13-1.13M11.82 4.18l1.13-1.13"/></svg>
      <svg class="i i-dark" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.6A5.75 5.75 0 0 1 6.4 2.5a5.75 5.75 0 1 0 7.1 7.1z"/></svg>
      <span class="theme-label">Auto</span>
    </button>
    </div>
  </div>
</header>

<main>
<section id="top" class="hero wrap" aria-labelledby="name">
  <p class="eyebrow">${esc(p.role)} · ${esc(p.location)}</p>
  <h1 id="name">${esc(p.name)}</h1>
  <p class="pitch">${esc(p.pitch)}</p>
  <p class="cta">
    <a class="btn" href="mailto:${esc(p.email)}">Email me</a>
    ${ext(p.linkedin, 'LinkedIn', 'plain')}
    ${ext(p.github, 'GitHub', 'plain')}
  </p>
</section>

<section id="work" class="wrap" aria-labelledby="work-h">
  <h2 id="work-h" class="label">Selected client work</h2>
  <ol class="projects">
${featured.map((pr) => `    <li class="project">
      <div class="p-main">
        <h3>${esc(pr.name)}</h3>
        <p>${esc(pr.summary)}</p>
        <p class="p-links">${projectLinks(pr)}</p>
      </div>
      <dl class="p-meta">
        <dt>Role</dt><dd>${esc(pr.role)}</dd>
        <dt>Stack</dt><dd><ul class="tags">${pr.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
      </dl>
    </li>`).join('\n')}
  </ol>

  <h3 id="personal" class="label sub">Personal projects</h3>
  <ol class="projects">
${personal.map((pr) => `    <li class="project">
      <div class="p-main">
        <h3>${esc(pr.name)}</h3>
        <p>${esc(pr.summary)}</p>
        ${pr.highlights?.length ? `<ul class="highlights">${pr.highlights.map((h) => `<li>${esc(h)}</li>`).join('')}</ul>` : ''}
        <p class="p-links">${projectLinks(pr)}</p>
      </div>
      <dl class="p-meta">
        <dt>Stack</dt><dd><ul class="tags">${pr.stack.map((s) => `<li>${esc(s)}</li>`).join('')}</ul></dd>
      </dl>
    </li>`).join('\n')}
  </ol>

  <h3 class="label sub">More sites I've built</h3>
  <div class="more">
${more.map((g) => `    <div>
      <h4>${esc(g.label)}</h4>
      <ul>${g.items.map((i) => `<li>${i.url ? ext(i.url, i.name) : esc(i.name)}</li>`).join('')}</ul>
    </div>`).join('\n')}
  </div>
</section>

<section id="skills" class="wrap" aria-labelledby="skills-h">
  <h2 id="skills-h" class="label">Skills</h2>
  <div class="skills">
${skills.map((g) => `    <div>
      <h3>${esc(g.label)}</h3>
      <p>${g.items.map(esc).join(', ')}</p>
    </div>`).join('\n')}
  </div>
</section>

<section id="about" class="wrap" aria-labelledby="about-h">
  <h2 id="about-h" class="label">About</h2>
  <div class="about">
    <div class="prose">${p.about.map((t) => `<p>${esc(t)}</p>`).join('')}</div>
    <ol class="timeline" aria-label="Experience">
${jobs.map((j) => `      <li><span class="when">${esc(j.when)}</span><span><strong>${esc(j.title)}</strong><br>${esc(j.org)}</span></li>`).join('\n')}
${p.education.map((e) => `      <li><span class="when">${esc(e.when)}</span><span><strong>${esc(e.title)}</strong><br>${esc(e.org)}</span></li>`).join('\n')}
    </ol>
  </div>
</section>

<section id="contact" class="wrap contact" aria-labelledby="contact-h">
  <h2 id="contact-h" class="label">Contact</h2>
  <p class="big"><a href="mailto:${esc(p.email)}">${esc(p.email)}</a></p>
  <p>${esc(p.availability)}</p>
  <p class="cta">${ext(p.linkedin, 'LinkedIn', 'plain')} ${ext(p.github, 'GitHub', 'plain')}</p>
</section>
</main>

<footer class="wrap foot">
  <p>© ${year} ${esc(p.name)}</p>
</footer>
<script src="/main.js" defer></script>
</body>
</html>
`;

// ---------- Write ----------
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const f of fs.readdirSync('src')) fs.copyFileSync(`src/${f}`, `${DIST}/${f}`);
fs.writeFileSync(`${DIST}/index.html`, index);
fs.writeFileSync(`${DIST}/robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${p.site_url}/sitemap.xml\n`);
fs.writeFileSync(`${DIST}/sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${p.site_url}/</loc></url>
</urlset>
`);

console.log(`Built ${DIST}/`);
