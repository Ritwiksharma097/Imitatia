import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  allPosts,
  allPages,
  getPost,
  getPage,
  formatDate,
  readingTime,
  plainText,
  novelOfPost,
  decodeTitle,
  SITE,
  ContentItem,
} from "@/lib/content";
import { PostContent } from "@/components/PostContent";
import PostCard from "@/components/PostCard";

// Slugs reserved by other routes — these must NOT be served as posts.
const RESERVED = new Set([
  "blog", "novels", "reviews", "games", "about", "category",
  "feed.xml", "sitemap.xml", "robots.txt",
]);

interface Params { slug: string }

export function generateStaticParams(): Params[] {
  const ids: Params[] = [];
  for (const p of allPosts) ids.push({ slug: p.slug });
  // Only include pages that we WANT at top-level. We exclude pages that
  // have their own dedicated routes (about, home, portfolio, etc.).
  const pageBlacklist = new Set([
    "home", "about", "portfolio", "nin-nin",
    "imitatia-studios", "imitatia-posts", "novels-by-nin-nin",
    "audrey", "under-the-cherry-blossoms", "coincidence-or-jeanie",
    // these become novel landing pages
  ]);
  for (const p of allPages) {
    if (pageBlacklist.has(p.slug)) continue;
    if (RESERVED.has(p.slug)) continue;
    ids.push({ slug: p.slug });
  }
  return ids;
}

function resolveItem(slug: string): ContentItem | null {
  return getPost(slug) ?? getPage(slug);
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const item = resolveItem(slug);
  if (!item) return {};
  const title = item.seo.title || decode(item.title);
  const description =
    item.seo.description || plainText(item.excerpt || item.content, 160);
  const url = `${SITE.url}/${item.slug}/`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: item.featuredImage
        ? [{ url: item.featuredImage }]
        : undefined,
      publishedTime: item.date.replace(" ", "T") + "Z",
      modifiedTime: item.modified.replace(" ", "T") + "Z",
      authors: [item.author],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: item.featuredImage ? [item.featuredImage] : undefined,
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const item = resolveItem(slug);
  if (!item) notFound();

  const isPost = item.type === "post";
  const novel = isPost ? novelOfPost(item) : null;
  const primaryCat = item.categories.find(
    (c) => c.taxonomy === "category" &&
    !["novels", "web-novel", "published-novels"].includes(c.slug)
  ) ?? item.categories[0];

  const related = isPost
    ? allPosts
        .filter((p) =>
          p.slug !== item.slug &&
          p.categories.some((c) =>
            item.categories.some((ic) => ic.slug === c.slug)
          )
        )
        .slice(0, 3)
    : [];

  const jsonLd = isPost
    ? {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: decode(item.title),
        datePublished: item.date.replace(" ", "T") + "Z",
        dateModified: item.modified.replace(" ", "T") + "Z",
        author: { "@type": "Person", name: item.author },
        publisher: {
          "@type": "Organization",
          name: SITE.name,
          logo: { "@type": "ImageObject", url: `${SITE.url}/favicon.svg` },
        },
        image: item.featuredImage ? `${SITE.url}${item.featuredImage}` : undefined,
        mainEntityOfPage: `${SITE.url}/${item.slug}/`,
        description: plainText(item.excerpt || item.content, 240),
      }
    : null;

  return (
    <article className="relative">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      {/* HERO */}
      <header className="relative">
        {item.featuredImage && (
          <div className="relative h-[55vh] min-h-[420px] w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.featuredImage}
              alt=""
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-paper/0 via-paper/30 to-paper" />
          </div>
        )}

        <div
          className={
            item.featuredImage
              ? "relative mx-auto -mt-32 max-w-3xl px-6 pb-10 lg:-mt-44 lg:px-0"
              : "mx-auto max-w-3xl px-6 pb-10 pt-16 lg:px-0 lg:pt-24"
          }
        >
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {primaryCat && (
              <Link
                href={`/category/${primaryCat.slug}/`}
                className="smallcaps rounded-full border border-line/80 bg-paper/80 px-3 py-1 text-accent backdrop-blur"
              >
                {primaryCat.name}
              </Link>
            )}
            {novel && (
              <Link
                href={`/novels/${novel.slug}/`}
                className="smallcaps rounded-full border border-line/80 bg-paper/80 px-3 py-1 text-ink/80 backdrop-blur"
              >
                from {novel.title}
              </Link>
            )}
          </div>

          <h1 className="font-display mt-5 text-4xl leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl headline-balance">
            {decode(item.title)}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted">
            <span>By {item.author}</span>
            <span aria-hidden>·</span>
            <span>{formatDate(item.date)}</span>
            {isPost && (
              <>
                <span aria-hidden>·</span>
                <span>{readingTime(item.content)} min read</span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <div className="mx-auto max-w-3xl px-6 pb-20 lg:px-0">
        <PostContent item={item} />
      </div>

      {/* TAGS */}
      {isPost && item.categories.length > 0 && (
        <div className="mx-auto max-w-3xl px-6 pb-12 lg:px-0">
          <div className="flex flex-wrap gap-2">
            {item.categories
              .filter((c) => c.taxonomy === "category")
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}/`}
                  className="rounded-full border border-line/60 px-3 py-1 font-sans text-xs text-ink/85 transition hover:border-accent hover:text-accent"
                >
                  {c.name}
                </Link>
              ))}
          </div>
        </div>
      )}

      {/* RELATED */}
      {related.length > 0 && (
        <section className="border-t border-line/60 bg-paper-deep/30">
          <div className="mx-auto max-w-wide px-6 py-16 lg:px-10">
            <p className="smallcaps text-sm text-accent">Read next</p>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug}>
                  <PostCard post={r} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </article>
  );
}

function decode(t: string): string {
  return decodeTitle(t);
}

// Force this dynamic catch-all to be statically generated
export const dynamicParams = false;
