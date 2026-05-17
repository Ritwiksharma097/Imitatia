import rawData from "@/data/content.json";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

export interface Category {
  taxonomy: string; // "category" | "post_tag"
  slug: string;
  name: string;
}

export interface ContentItem {
  id: string;
  type: "post" | "page";
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;       // "YYYY-MM-DD HH:MM:SS"
  modified: string;
  author: string;
  categories: Category[];
  featuredImage: string | null;
  seo: { title: string; description: string };
}

export interface CategoryDef {
  slug: string;
  name: string;
}

// ─────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────

const data = rawData as {
  posts: ContentItem[];
  pages: ContentItem[];
  categories: CategoryDef[];
};

export const SITE = {
  name: "Imitatia",
  tagline: "Novels, Blogs & Games by Nin Nin",
  description:
    "Imitatia is a personal storytelling space where fiction meets reflection. Original novels, introspective blogs, anime reviews, and narrative games by Nin Nin.",
  url: "https://imitatia.com",
  author: "Nin Nin",
  twitter: "@ninxyami",
  ogImage: "/images/og.png",
};

// ─────────────────────────────────────────────────────────
// Post / page queries
// ─────────────────────────────────────────────────────────

export const allPosts: ContentItem[] = data.posts;
export const allPages: ContentItem[] = data.pages;
export const allCategories: CategoryDef[] = data.categories;

export function getPost(slug: string): ContentItem | null {
  return allPosts.find((p) => p.slug === slug) ?? null;
}

export function getPage(slug: string): ContentItem | null {
  return allPages.find((p) => p.slug === slug) ?? null;
}

export function postsInCategory(slug: string): ContentItem[] {
  return allPosts.filter((p) => p.categories.some((c) => c.slug === slug));
}

export function getCategoryDef(slug: string): CategoryDef | null {
  return allCategories.find((c) => c.slug === slug) ?? null;
}

// Latest N posts excluding ones with given slugs
export function latestPosts(n: number, exclude: string[] = []): ContentItem[] {
  return allPosts.filter((p) => !exclude.includes(p.slug)).slice(0, n);
}

// ─────────────────────────────────────────────────────────
// Novels — derived from categories
// ─────────────────────────────────────────────────────────

export interface NovelMeta {
  slug: string;
  /** When set, /novels/<slug>/ won't be auto-generated; clicking the novel links here instead. */
  externalLink?: string;
  /** When set, chapters come from this WP category. When omitted, the novel has no chapter list. */
  categorySlug?: string;
  /** When set, this novel's landing page pulls long-form description from this WP page slug. */
  descriptionPageSlug?: string;
  title: string;
  /** One-line blurb shown on cards and indexes. */
  blurb: string;
  /** Longer 1-2 sentence pitch shown at the top of the landing page. */
  pitch?: string;
  cover: string | null;
  status: "ongoing" | "complete" | "published" | "upcoming";
  badge?: string;
  /** For published novels only — purchase/read links. */
  purchaseLinks?: { label: string; url: string }[];
  /** Publication metadata for published novels. */
  publication?: {
    publisher?: string;
    releaseDate?: string;
    pages?: string;
    isbn?: string;
    asin?: string;
  };
}

export const novels: NovelMeta[] = [
  {
    slug: "audrey",
    categorySlug: "audrey",
    descriptionPageSlug: "audrey",
    title: "Audrey",
    blurb:
      "A slow-burn web novel about a small-town bartender, a stranger she shouldn't trust, and the careful life she's been living unraveling around her.",
    pitch:
      "In Ashford Hollow, the nights are long and the gossip never sleeps. Audrey pours whiskey for the same regulars every night — until a stranger walks in and her small-town routine starts to shift.",
    cover: "/images/2025/08/Audre-image.webp",
    status: "ongoing",
    badge: "Web Novel",
  },
  {
    slug: "under-the-cherry-blossoms",
    categorySlug: "utcb",
    descriptionPageSlug: "under-the-cherry-blossoms",
    title: "Under The Cherry Blossoms",
    blurb:
      "A story of love, healing, and the quiet power of connection — told beneath the falling petals of a new beginning.",
    pitch:
      "Lily Andrews steps into her first job at Mystique Holdings in Los Angeles, and finds herself drawn to her boss — a man marked by a past he can't seem to let go of.",
    cover: "/images/2025/07/DALL.E-2024-04-16-13.33.35-A-picturesque-scene-of-a-river-flowing-gently-beneath-cherry-blossom-trees-in-full-bloom.-The-setting-is-serene-and-idyllic-reminiscent-of-a-calm-spr.webp",
    status: "published",
    badge: "Published",
    purchaseLinks: [
      {
        label: "Buy on Amazon Kindle",
        url: "https://www.amazon.com/dp/B0CXKK83LZ",
      },
    ],
    publication: {
      publisher: "Amazon Kindle",
      releaseDate: "April 13, 2024",
      pages: "347",
      isbn: "9798322913917",
      asin: "B0CXKK83LZ",
    },
  },
  {
    slug: "canvas",
    categorySlug: undefined,
    descriptionPageSlug: "canvas",
    title: "Canvas",
    blurb:
      "A medieval tale of love, betrayal, and vengeance set in the fictional kingdom of Eiralia — where cherry blossoms witness both love and loss.",
    pitch:
      "A story carried in mind for years. At its heart, it is simple, yet it carries the weight of love, betrayal, and vengeance.",
    cover: "/images/2025/08/slider-canvas1.webp",
    status: "published",
    badge: "Published",
    publication: {
      publisher: "Amazon Kindle",
      releaseDate: "October 2025",
    },
  },
  {
    slug: "coincidence-or-jeanie",
    categorySlug: "coincidence-or-jeanie",
    descriptionPageSlug: "coincidence-or-jeanie",
    title: "Coincidence or Jeanie?",
    blurb:
      "Some call it intuition. Nick doesn't call it anything — he just notices. A mystery that whispers before it shouts.",
    pitch:
      "Seventeen-year-old Nick Clement has just settled into life in Pacifica. Lately, his 'gut feelings' keep lining up with real events — and one of them points toward a girl he hasn't even met yet.",
    cover: "/images/2025/08/Coincidence-jeanie1.webp",
    status: "ongoing",
    badge: "Web Novel",
  },
  {
    slug: "the-infection",
    categorySlug: "infection",
    descriptionPageSlug: "the-infection-part-one-angelas-story",
    title: "The Infection",
    blurb:
      "A character-driven sci-fi horror about a mother who will cross a sealed neighborhood to reach her daughter.",
    pitch:
      "Green light splits the sky and reality changes. Inside the Barrier, nights glow, rules bend, and kindness can be the difference between turning and surviving. This is Angela's story.",
    cover: "/images/2025/10/concept-art1.webp",
    status: "ongoing",
    badge: "Web Novel",
  },
];

// Returns chapters of a novel ordered chronologically (oldest first).
export function chaptersForNovel(categorySlug: string): ContentItem[] {
  return postsInCategory(categorySlug)
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
}

// Given a post and its novel category, returns prev/next chapter posts.
export function chapterNeighbors(
  post: ContentItem,
  categorySlug: string
): { prev: ContentItem | null; next: ContentItem | null } {
  const chs = chaptersForNovel(categorySlug);
  const idx = chs.findIndex((c) => c.slug === post.slug);
  if (idx === -1) return { prev: null, next: null };
  return {
    prev: idx > 0 ? chs[idx - 1] : null,
    next: idx < chs.length - 1 ? chs[idx + 1] : null,
  };
}

// Detects whether a post belongs to a novel and which one
export function novelOfPost(post: ContentItem): NovelMeta | null {
  for (const n of novels) {
    if (!n.categorySlug) continue;
    if (post.categories.some((c) => c.slug === n.categorySlug)) return n;
  }
  return null;
}

// ─────────────────────────────────────────────────────────
// Formatting
// ─────────────────────────────────────────────────────────

export function formatDate(d: string): string {
  // d may be 'YYYY-MM-DD HH:MM:SS' or ISO
  const dt = new Date(d.replace(" ", "T") + (d.endsWith("Z") ? "" : "Z"));
  if (isNaN(dt.getTime())) return d.slice(0, 10);
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function readingTime(content: string): number {
  const text = content.replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

// Strip HTML and normalize whitespace, useful for meta descriptions and cards
export function plainText(html: string, max?: number): string {
  let s = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (max && s.length > max) {
    s = s.slice(0, max).replace(/[.,;\s]+$/, "") + "…";
  }
  return s;
}

// Decode HTML entities AND normalize WP-era title artifacts (e.g. "--" -> "—")
export function decodeTitle(t: string): string {
  return t
    .replace(/&amp;/g, "&")
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#8217;/g, "’")
    .replace(/&#8216;/g, "‘")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, " ")
    // Normalize "Title -- Chapter" / "Title - Chapter" to em-dash separator
    .replace(/\s--\s/g, " — ")
    .replace(/(\w)\s+-\s+(\w)/g, "$1 — $2");
}
