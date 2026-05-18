# Authoring guide — how to add posts to Imitatia

This file is for you (Nin Nin) and for any AI assistant helping you publish.
If you're an assistant reading this: this document fully describes the
workflow. You don't need to read other source files unless asked.

---

## TL;DR — the three workflows

| You want to... | How |
|---|---|
| Add a new post or chapter | See "Workflow A" below |
| Fix a typo / small edit | See "Workflow B" — edit on GitHub directly |
| Add a brand new novel | See "Workflow C" |

---

## Workflow A — adding a new post or chapter

### The fastest path: ask an AI to do it

Open Claude or Sonnet, paste your Word doc or text, and say:

> Here's a new post for imitatia.com. Please give me the JSON entry to paste
> into `data/content.json`. Title: `<title>`. Category: `<imitatia-dreams | imitatia-reviews | audrey | utcb | coincidence-or-jeanie | infection | poems | updates>`.
> Featured image: I'll add separately.

The assistant will:
1. Decode any Word formatting into clean HTML (paragraphs, em, strong, blockquotes, headings)
2. Generate the JSON entry with proper structure
3. Suggest a slug (URL path)
4. Tell you exactly where to paste it

Then you:
1. Open `data/content.json`
2. Paste the entry at the **top of the `posts` array** (newest first)
3. Drop the featured image into `public/images/YYYY/MM/` (or run `scripts/optimize-image.py` first to size it right)
4. `git add . && git commit -m "Add post: <title>" && git push`
5. Wait 2 min for Cloudflare to rebuild
6. Done

### The DIY path: use the helper script

If Python is installed locally:

```bash
python scripts/new-post.py
```

The script will prompt you for title, slug, category, date, featured image, excerpt, and body HTML. It writes the entry into `content.json` for you.

For images, first run:

```bash
python scripts/optimize-image.py /path/to/your/cover.jpg
```

It resizes to max 1600px, converts to WebP, saves to `public/images/YYYY/MM/`, and prints the path to paste into your post.

### The schema (for reference)

A post entry in `data/content.json` looks like this:

```json
{
  "id": "1042",
  "type": "post",
  "slug": "my-new-post",
  "title": "My New Post",
  "excerpt": "Short one-liner shown on cards and as meta description.",
  "content": "<p>Real post body as HTML. Use &lt;p&gt; for paragraphs, &lt;h2&gt; for sections, &lt;blockquote&gt; for quotes, &lt;em&gt; and &lt;strong&gt; for emphasis.</p>",
  "date": "2026-05-20 09:00:00",
  "modified": "2026-05-20 09:00:00",
  "author": "Nin Nin",
  "categories": [
    {"taxonomy": "category", "slug": "imitatia-dreams", "name": "Imitatia Dreams"}
  ],
  "featuredImage": "/images/2026/05/my-cover.webp",
  "seo": {"title": "", "description": ""}
}
```

Rules:
- `id` must be unique — pick max existing + 1
- `slug` becomes the URL: `imitatia.com/<slug>/`
- `slug` must be unique across all posts and pages, lowercase letters/digits/hyphens only
- `featuredImage` must start with `/images/...` (the file should exist under `public/images/...`)
- `date` format: `YYYY-MM-DD HH:MM:SS` (24-hour)
- `categories` is an array — a post can be in multiple categories
- `content` is HTML, not markdown
- Place new posts at the **top of the `posts` array** (the site sorts by date but ordering helps when scanning JSON)

### Available categories

| Slug | Display name | Use for |
|---|---|---|
| `imitatia-dreams` | Imitatia Dreams | Personal essays, reflections |
| `imitatia-reviews` | Reviews | Anime / manga / show reviews |
| `poems` | Poems | Poetry |
| `audrey` | Audrey | An Audrey chapter |
| `utcb` | UTCB | An Under The Cherry Blossoms chapter |
| `coincidence-or-jeanie` | Coincidence or Jeanie? | A Coincidence or Jeanie chapter |
| `infection` | Infection | A Coincidence or Jeanie chapter |
| `updates` | Updates | Dev blogs, status updates |

You can add new categories — just put a new slug/name and the site will pick them up. To make a new category appear in `lib/content.ts`'s category list, also add it there (so it shows in the sitemap, etc.).

### For novel chapters specifically

When adding a chapter to an existing novel (Audrey, UTCB, etc.):

1. Categorize it correctly (e.g., `"slug": "audrey"`)
2. The novel landing page at `/novels/audrey/` auto-discovers it and adds it to the chapter list
3. Add a `<!--CHAPTER_NAV:audrey-->` HTML comment at the bottom of the content where you want the "previous chapter / next chapter" buttons to appear
4. Title convention: `"Audrey — Chapter 8: The Chapter Name"` (em-dash separator, no extra punctuation)
5. The site auto-strips the "Audrey — Chapter 8:" prefix when listing chapters and shows just the chapter name

---

## Workflow B — small fixes via GitHub web editor

For typos, link changes, tiny edits:

1. Go to your repo: <https://github.com/Ritwiksharma097/Imitatia>
2. Navigate to the file:
   - For post content: `data/content.json`
   - For page layouts: `app/<page>/page.tsx`
   - For nav/footer: `components/Nav.tsx` or `components/Footer.tsx`
3. Click the pencil ✏️ icon (top right of the file view)
4. Edit in the browser
5. Scroll down, type a short commit message, click **Commit changes**
6. Cloudflare rebuilds automatically in ~2 min

This works on phone too if you ever need to fix something on the go.

---

## Workflow C — adding a new novel

When you start a new novel (not just a new chapter of an existing one):

1. Pick a category slug for the novel (e.g. `the-darkening`)
2. Edit `lib/content.ts` — find the `novels` array, add a new entry:

```typescript
{
  slug: "the-darkening",
  categorySlug: "the-darkening",
  descriptionPageSlug: "the-darkening",  // optional, if you have a description page
  title: "The Darkening",
  blurb: "One-line teaser shown on cards.",
  pitch: "Longer 1-2 sentence pitch shown on the landing page.",
  cover: "/images/2026/06/darkening-cover.webp",
  status: "ongoing",  // or "published" | "upcoming" | "complete"
  badge: "Web Novel",  // or "Published"
  purchaseLinks: [    // only for published novels
    { label: "Buy on Amazon Kindle", url: "https://..." }
  ],
  publication: {       // only for published novels
    publisher: "Amazon Kindle",
    releaseDate: "June 2026",
    pages: "247",
    isbn: "...",
    asin: "...",
  },
},
```

3. Optionally create a description page (rich back-of-book content). Add a new
   entry to the `pages` array in `data/content.json` with `slug` matching your
   `descriptionPageSlug` above.
4. Add chapters as posts categorized under that novel's slug.
5. Push. The site auto-generates `/novels/the-darkening/` with cover, pitch,
   description, chapter list, all without any other code change.

---

## Where things live in the project

```
imitatia/
├── data/content.json          ← all post + page content (THE source of truth)
├── public/images/YYYY/MM/     ← all images, organized by date
├── public/favicon.*           ← favicons (don't touch unless rebranding)
├── lib/content.ts             ← novel metadata, site config, query helpers
├── app/                       ← Next.js routes (most of this is set, don't edit unless changing design)
│   ├── page.tsx               ← homepage
│   ├── novels/page.tsx        ← novels index
│   ├── novels/[slug]/page.tsx ← per-novel landing page
│   ├── [slug]/page.tsx        ← per-post page
│   ├── blog/page.tsx          ← blog index
│   ├── reviews/page.tsx       ← reviews index
│   ├── games/page.tsx         ← games landing
│   ├── about/page.tsx         ← about page
│   ├── portfolio/page.tsx     ← portfolio
│   ├── category/[slug]/       ← category archives
│   └── feed.xml/route.ts      ← RSS feed
├── components/                ← reusable UI (Nav, Footer, PostCard, etc.)
└── scripts/                   ← helper scripts (new-post.py, optimize-image.py)
```

---

## Common gotchas

1. **Slugs must match WordPress URLs to preserve SEO.** If you're moving an old WordPress draft over, use the exact same slug it had on WordPress (e.g. `audrey-chapter-3-the-morning-after`, not `chapter-3`).

2. **`content.json` is JSON, not JavaScript.** That means:
   - No trailing commas
   - All strings double-quoted
   - Backslash-escape any `"` inside content (or use `&quot;` in HTML)
   - No `// comments`

3. **HTML in `content` field**: paste real HTML, not markdown. Use `<p>...</p>` for paragraphs, not blank lines.

4. **Featured images must be optimized.** WordPress originals are often 4-10 MB. Run them through `scripts/optimize-image.py` first or your build size balloons.

5. **The category needs to exist somewhere meaningful.** If you make up a category like `"slug": "new-genre"`, posts will work but won't appear in any auto-list unless the category is added to `lib/content.ts`'s `categories` array. Use existing categories when you can.

6. **Date format matters.** `"2026-05-20 09:00:00"` not `"May 20, 2026"`. The date affects sorting on the homepage and blog index.

7. **If you delete a post, also delete its featured image** to keep the repo clean. The build doesn't fail if an image is unused, but bloat adds up.

---

## When Cloudflare doesn't rebuild

After you push, go to <https://dash.cloudflare.com> → Workers & Pages → imitatia → Deployments. The latest deploy should show "In progress" then "Success." If it failed, click into it to see the error log. Usually JSON syntax error in `content.json` — paste the error into Claude/Sonnet, they'll point at the bad line.

---

## For AI assistants helping with this site

If the user pastes a Word doc and asks for "a new post entry":
1. Extract the title, body text, any images
2. Convert formatting to HTML (paragraphs → `<p>`, bold → `<strong>`, italics → `<em>`, headings → `<h2>`/`<h3>`, quotes → `<blockquote>`, lists → `<ul>`/`<ol>`)
3. Slugify the title (lowercase, hyphens, no punctuation) — preserve any existing slug if mentioned
4. Pick a unique numeric `id` larger than 1000 (the user can adjust)
5. Set `"date"` to now if not specified
6. Ask about category if not obvious from context
7. Output the complete JSON entry as a single code block, ready to paste
8. Remind the user where the featured image should go and how to optimize it

If asked to add a chapter to an existing novel, look at the category slug rules above (e.g. `"audrey"` for Audrey chapters) and remind them to add `<!--CHAPTER_NAV:audrey-->` at the end of the content for prev/next navigation.
