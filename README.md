# t6nut.github.io

Portfolio of Tõnu T jr. Live at **https://t6nut.github.io**.

All content lives in `content/*.yml`. A small Node script (`build.mjs`) turns it into plain HTML and CSS. GitHub Actions builds and deploys on every push to `main`.

## Change content

Pick one:

1. **Pages CMS (visual editor):** go to https://app.pagescms.org, sign in with GitHub, open this repo. Edit the forms and save. Each save is a commit that redeploys.
2. **GitHub.com:** open a file in `content/`, click the pencil, edit, commit.
3. **Locally:** edit the YAML, then `git commit` and `git push`.

The site updates about a minute later. Watch progress under the repo's **Actions** tab. If the YAML is broken, the build fails and the live site stays as it was.

| File | What it holds |
|---|---|
| `content/profile.yml` | Name, pitch, links, About text, education |
| `content/projects.yml` | Featured projects and the "more sites" lists |
| `content/experience.yml` | Jobs (used on the About timeline) |
| `content/skills.yml` | Skill groups |

YAML tip: wrap a value in quotes if it contains `: `, `#`, or a comma inside `[ ]` or `{ }`.

## Run locally

```
npm install
npm run dev      # builds and serves on http://localhost:3000
```

## Custom domain (later)

1. Repo **Settings → Pages → Custom domain**: enter e.g. `trubetsky.dev` and save.
2. At your DNS provider, add `A` records for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a `CNAME` for `www` → `t6nut.github.io`.
3. Tick **Enforce HTTPS** once the certificate is issued.
4. Change `site_url` in `content/profile.yml` to the new domain.
