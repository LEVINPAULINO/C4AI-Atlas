# Deploy to GitHub Pages

This directory is the repository root. Do not upload the parent `Roadmap/` folder: it contains the coding workspace, the corpus, and local environments. Only the contents of `site/` belong in `LEVINPAULINO/C4AI-Atlas`.

## Before the first push

- GitHub repository: <https://github.com/LEVINPAULINO/C4AI-Atlas>
- Node.js 22 or newer for local checks
- Git installed
- The repository may be empty or contain only a README

The site is built by GitHub Actions. Do not commit `node_modules/`, `dist/`, `.venv/`, or `.astro/`; `.gitignore` already excludes them.

## First upload, command line

Run these commands from this directory:

```bash
cd /Users/levine/Desktop/Roadmap/site

git init
git add .
git commit -m "C4AI Atlas v0.1"
git branch -M main
git remote add origin https://github.com/LEVINPAULINO/C4AI-Atlas.git
git push -u origin main
```

If the remote already has a commit, clone it first and copy these files into the clone instead of forcing a push:

```bash
git clone https://github.com/LEVINPAULINO/C4AI-Atlas.git /tmp/c4ai-atlas
rsync -a --exclude node_modules --exclude dist --exclude .venv --exclude .astro /Users/levine/Desktop/Roadmap/site/ /tmp/c4ai-atlas/
cd /tmp/c4ai-atlas
git add .
git commit -m "Add C4AI Atlas site"
git push
```

## Turn on GitHub Pages

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy C4AI Atlas** to finish.
5. The site should appear at:

```text
https://levinpaulino.github.io/C4AI-Atlas/
```

The workflow reads the repository name, sets `SITE_BASE=/C4AI-Atlas/`, runs `npm ci`, `npm run check`, and `npm run build`, then deploys `dist/`.

## If the deploy fails

- **Actions is not listed**: confirm `.github/workflows/pages.yml` was pushed. Finder hides folders that start with a dot; use `ls -a` or `git status`.
- **Pages shows "Not found"**: check that **Settings → Pages → Source** is **GitHub Actions**, not "Deploy from a branch".
- **The page loads without CSS**: the base path is wrong. The workflow should set `SITE_BASE` to the exact repository name, including capitalization.
- **Type check fails**: run `npm ci && npm run check` locally before pushing.

## Later updates

```bash
cd /Users/levine/Desktop/Roadmap/site
git add .
git commit -m "Describe the change"
git push
```

The Actions workflow redeploys on every push to `main`.

## Contact and links

The contact address and repository URL are defined once in:

```text
src/lib/site.ts
```

Changing that file updates the footer, the About page, the Responsibility page, and the newsletter notes. Also update `README.md`, `CITATION.cff`, and `RESPONSIBILITY.md` if the address changes.

Newsletter provider and Zenodo DOI are intentionally not configured yet. Their pages say so; do not add a dead signup form or a fake DOI.
