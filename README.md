# Imitatia.com — Next.js Static Site

Personal storytelling space by Nin Nin. Rebuilt from WordPress as a static
Next.js 15 site, deployed on Cloudflare Pages with zero hosting cost.

> **Adding a new post?** See [AUTHORING.md](./AUTHORING.md). It covers
> everything: helper scripts, JSON schema, how to add chapters, image
> optimization, and how AI assistants can help.

---

## Quick start

```bash
npm install
npm run dev        # http://localhost:3000
```

To build for production:

```bash
npm run build
```

That produces a static export in `./out/`. Just upload `out/` to Cloudflare
Pages and you're done.

---

## Stack

- **Framework**: Next.js 15 (App Router) with `output: 'export'` for full static export
- **Styling**: Tailwind CSS 3 + CSS variables for theming
- **Fonts**: Fraunces (display), EB Garamond (body), Inter Tight (UI) — served via `next/font/google`
- **Content**: A single JSON file at `data/content.json` derived from the WordPress SQL dump
- **Images**: Stored under `public/images/`, all converted to WebP and resized to max 1600px
- **Deployment**: Cloudflare Pages (free tier, no Workers needed)

---

## Project structure

```
imitatia/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme, nav, footer)
│   ├── page.tsx                # Homepage
│   ├── globals.css             # Theme + prose styles
│   ├── not-found.tsx           # 404
│   ├── robots.ts               # /robots.txt
│   ├── sitemap.ts              # /sitemap.xml
│   ├── feed.xml/route.ts       # RSS feed
│   ├── [slug]/page.tsx         # Posts AND pages at top-level (matches WP URLs)
│   ├── blog/page.tsx           # Blog index
│   ├── novels/
│   │   ├── page.tsx            # Novels index
│   │   └── [slug]/page.tsx     # Per-novel landing page with chapter list
│   ├── reviews/page.tsx
│   ├── games/page.tsx
│   ├── about/page.tsx
│   └── category/[slug]/page.tsx
│
├── components/
│   ├── Nav.tsx                 # Sticky nav with mobile menu
│   ├── Footer.tsx
│   ├── PostCard.tsx            # Three variants: feature / default / compact
│   ├── PostContent.tsx         # Renders cleaned WP HTML + chapter nav markers
│   └── Theme.tsx               # Dark/light toggle, script for no-flash
│
├── lib/
│   └── content.ts              # Typed query helpers (getPost, novelOfPost, etc.)
│
├── data/
│   └── content.json            # ALL site content (posts, pages, categories)
│
├── public/
│   ├── images/                 # Migrated, optimized images
│   ├── favicon.svg
│   └── _redirects              # Cloudflare Pages 301s (WP -> new URLs)
│
├── next.config.ts              # Static export config
├── tailwind.config.ts
├── postcss.config.js
└── tsconfig.json
```

---

## Deploying to Cloudflare Pages

### Option A — GitHub auto-deploy (recommended)

1. Push this folder to a GitHub repo.
2. Cloudflare Dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
3. Pick the repo. Set:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Node version**: 22 (set `NODE_VERSION=22` under Environment variables)
4. Save and deploy. Every git push redeploys.

### Option B — Direct upload

```bash
npm run build
npx wrangler pages deploy out --project-name=imitatia
```

### Point your domain

In Cloudflare Pages → your project → **Custom domains** → add `imitatia.com`.
Since the domain is on Namecheap, set Namecheap's nameservers to Cloudflare's
(or just add a CNAME record `imitatia.com → <your-project>.pages.dev`).

---

## Adding new content

### A new blog post

Open `data/content.json` and add an entry to `posts` (newest-first order).
The minimum required fields:

```json
{
  "id": "1001",
  "type": "post",
  "slug": "my-new-post",
  "title": "My New Post",
  "excerpt": "Short summary shown in cards and meta description.",
  "content": "<p>The actual HTML content.</p><p>Multiple paragraphs work.</p>",
  "date": "2026-05-20 09:00:00",
  "modified": "2026-05-20 09:00:00",
  "author": "Nin Nin",
  "categories": [
    { "taxonomy": "category", "slug": "imitatia-dreams", "name": "Imitatia Dreams" }
  ],
  "featuredImage": "/images/2026/05/my-image.webp",
  "seo": { "title": "", "description": "" }
}
```

Rules:
- `slug` becomes the URL: `/my-new-post/`
- Put images in `public/images/2026/05/` and reference them via `/images/...`
- `content` is plain HTML — use `<p>`, `<h2>`, `<h3>`, `<figure><img/></figure>`, `<blockquote>`, `<ul>` etc.
- Then `npm run build` and deploy.

### A new novel chapter

Same as above, but make sure `categories` includes one of:
- `audrey` / `utcb` / `coincidence-or-jeanie` / `infection`

The novel system auto-discovers chapters from category membership and shows
prev/next links automatically (no `[chapter_nav]` needed — just add this
HTML comment in the content where you want the navigator to appear):

```html
<!--CHAPTER_NAV:audrey-->
```

### A new novel

Add it to the `novels` array in `lib/content.ts` with a `categorySlug`.

---

## Dark mode

Default: respects system preference. User can toggle via the sun/moon button
in the nav. Choice is saved to `localStorage` under `imitatia-theme`. No flash
on initial load (handled by inline script before hydration).

---

## SEO

All handled through Next.js Metadata API:
- Every post/page has its own `<title>`, `<meta description>`, OpenGraph, Twitter Card
- JSON-LD `BlogPosting` structured data on every article
- Auto-generated `/sitemap.xml`, `/robots.txt`, `/feed.xml`
- Canonical URLs everywhere
- WordPress 301 redirects in `public/_redirects` preserve link equity

---

## Migration notes

This site was generated from a WordPress SQL dump (`inteqyyc_wp79_1_.sql`)
using a pipeline of three Python scripts kept in the repo root (or `scripts/`
if you re-add them):

1. `parse_sql.py` — robust MySQL VALUES tokenizer
2. `extract.py` — pulls posts, pages, categories, featured images, AIOSEO metadata
3. `build_content.py` — cleans WP Gutenberg HTML, rewrites image URLs, copies referenced images
4. `optimize_images.py` — resizes to 1600px and converts to WebP

If you ever need to re-migrate (e.g. you grab a fresh SQL dump), run those
four scripts in order, then copy `site_data/content.json` and `site_data/public/images/`
into this project.

---

## License

All content (novels, blogs, images) © Nin Nin. Code in this repository: MIT
(do what you want with the scaffold).
