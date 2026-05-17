import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  novels,
  chaptersForNovel,
  formatDate,
  decodeTitle,
  getPage,
  SITE,
  NovelMeta,
} from "@/lib/content";

interface Params { slug: string }

export function generateStaticParams(): Params[] {
  return novels.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const n = novels.find((x) => x.slug === slug);
  if (!n) return {};
  const description = n.pitch || n.blurb;
  return {
    title: n.title,
    description,
    alternates: { canonical: `/novels/${n.slug}/` },
    openGraph: {
      type: "book",
      url: `${SITE.url}/novels/${n.slug}/`,
      title: n.title,
      description,
      images: n.cover ? [{ url: n.cover }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: n.title,
      description,
      images: n.cover ? [n.cover] : undefined,
    },
  };
}

export default async function NovelPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const novel = novels.find((n) => n.slug === slug);
  if (!novel) notFound();

  const chapters = novel.categorySlug ? chaptersForNovel(novel.categorySlug) : [];
  const descriptionPage = novel.descriptionPageSlug
    ? getPage(novel.descriptionPageSlug)
    : null;
  const firstChapter = chapters[0];
  const latestChapter = chapters[chapters.length - 1];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: novel.title,
    description: novel.pitch || novel.blurb,
    image: novel.cover ? `${SITE.url}${novel.cover}` : undefined,
    author: { "@type": "Person", name: SITE.author },
    ...(novel.publication?.isbn ? { isbn: novel.publication.isbn } : {}),
    ...(novel.publication?.publisher
      ? { publisher: { "@type": "Organization", name: novel.publication.publisher } }
      : {}),
    ...(novel.publication?.releaseDate ? { datePublished: novel.publication.releaseDate } : {}),
  };

  return (
    <div className="relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* HERO */}
      <header className="relative overflow-hidden">
        {novel.cover && (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-25 blur-3xl"
            style={{
              backgroundImage: `url(${novel.cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="mx-auto grid max-w-wide gap-8 px-6 py-10 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:py-24">
          <div className="lg:col-span-5">
            {novel.cover && (
              <div className="mx-auto max-w-[300px] overflow-hidden rounded-2xl border border-line/60 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)] sm:max-w-[380px] lg:max-w-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={novel.cover}
                  alt={novel.title}
                  className="block h-auto w-full"
                />
              </div>
            )}
          </div>
          <div className="lg:col-span-7 lg:pt-2">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="smallcaps rounded-full bg-paper-deep/60 px-3 py-1 text-accent">
                {novel.badge}
              </span>
              {novel.status && novel.status.toLowerCase() !== (novel.badge || "").toLowerCase() && (
                <span className="smallcaps rounded-full bg-paper-deep/60 px-3 py-1 text-ink/80">
                  {novel.status}
                </span>
              )}
              {chapters.length > 0 && (
                <span className="smallcaps rounded-full bg-paper-deep/60 px-3 py-1 text-ink/80">
                  {chapters.length} chapter{chapters.length === 1 ? "" : "s"}
                </span>
              )}
            </div>
            <h1 className="font-display mt-4 text-4xl leading-[1.0] tracking-tight text-ink sm:text-5xl lg:text-7xl headline-balance">
              {novel.title}
            </h1>
            {novel.pitch && (
              <p className="mt-5 max-w-2xl font-display italic text-lg leading-snug text-ink-soft sm:text-xl lg:text-2xl headline-balance">
                {novel.pitch}
              </p>
            )}

            <div className="mt-7 flex flex-wrap gap-3">
              {firstChapter && (
                <Link
                  href={`/${firstChapter.slug}/`}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
                >
                  Start from Chapter 1
                </Link>
              )}
              {chapters.length > 1 && latestChapter && (
                <Link
                  href={`/${latestChapter.slug}/`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
                >
                  Read latest
                </Link>
              )}
              {novel.purchaseLinks?.map((link) => (
                <a
                  key={link.url}
                  href={link.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Publication info bar */}
      {novel.publication && (
        <section className="mx-auto -mt-4 mb-10 max-w-3xl px-6 lg:px-0">
          <dl className="grid grid-cols-2 gap-4 rounded-2xl border border-line/60 bg-paper-deep/40 p-6 text-sm sm:grid-cols-3 lg:grid-cols-5">
            {[
              novel.publication.publisher && { label: "Publisher", value: novel.publication.publisher },
              novel.publication.releaseDate && { label: "Released", value: novel.publication.releaseDate },
              novel.publication.pages && { label: "Pages", value: novel.publication.pages },
              novel.publication.isbn && { label: "ISBN-13", value: novel.publication.isbn },
              novel.publication.asin && { label: "ASIN", value: novel.publication.asin },
            ]
              .filter(Boolean)
              .map((r) => (
                <div key={(r as { label: string }).label}>
                  <dt className="smallcaps text-[11px] text-accent">{(r as { label: string }).label}</dt>
                  <dd className="font-display mt-1 text-ink">{(r as { value: string }).value}</dd>
                </div>
              ))}
          </dl>
        </section>
      )}

      {/* Long-form description (from WP page) */}
      {descriptionPage && (
        <section className="mx-auto max-w-3xl px-6 pb-16 lg:px-0">
          <div className="prose-imitatia">
            <div
              dangerouslySetInnerHTML={{
                __html: prepareDescriptionHtml(descriptionPage.content),
              }}
            />
          </div>
        </section>
      )}

      {/* Chapter list */}
      {chapters.length > 0 && (
        <section
          id="chapters"
          className="mx-auto max-w-3xl scroll-mt-24 border-t border-line/60 px-6 py-16 lg:px-0"
        >
          <p className="smallcaps text-sm text-accent">Chapters</p>
          <h2 className="font-display mt-2 text-3xl text-ink lg:text-4xl">
            Read in order.
          </h2>

          <ol className="mt-10 space-y-1">
            {chapters.map((ch, i) => (
              <li key={ch.slug}>
                <Link
                  href={`/${ch.slug}/`}
                  className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-3 border-b border-line/40 py-5 transition hover:border-accent sm:gap-4"
                >
                  <span className="font-display text-2xl text-muted group-hover:text-accent sm:text-3xl">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="font-display text-base leading-snug text-ink group-hover:text-accent sm:text-xl">
                    {stripChapterPrefix(ch.title)}
                  </span>
                  <span className="hidden font-sans text-xs text-muted sm:inline">
                    {formatDate(ch.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ol>

          {chapters.length > 1 && latestChapter && (
            <div className="mt-12 rounded-2xl border border-line/60 bg-paper-deep/40 p-6 text-center sm:p-8">
              <p className="smallcaps text-xs text-accent">Latest chapter</p>
              <h3 className="font-display mt-2 text-2xl text-ink">
                {stripChapterPrefix(latestChapter.title)}
              </h3>
              <Link
                href={`/${latestChapter.slug}/`}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
              >
                Read the latest →
              </Link>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

/**
 * Clean up the WP description page HTML so it doesn't duplicate hero info:
 *  - strip leading H2 with the title
 *  - strip leading blockquote (we show the pitch in hero)
 *  - strip leading figure (cover image already in hero)
 *  - strip the "Title / Published by / Release Date / ..." metadata block
 *  - strip [Read Now] WP button groups (we have buttons in the hero)
 *  - strip leading <hr> separators
 */
function prepareDescriptionHtml(html: string): string {
  let out = html;

  // Drop leading H2 title
  out = out.replace(/^\s*<h2[^>]*>[\s\S]*?<\/h2>\s*/i, "");
  // Drop leading blockquote (the tagline)
  out = out.replace(/^\s*<blockquote[^>]*>[\s\S]*?<\/blockquote>\s*/i, "");
  // Drop leading figure
  out = out.replace(/^\s*<figure[^>]*>[\s\S]*?<\/figure>\s*/i, "");
  // Drop any leading hr separators (now-dangling)
  while (/^\s*<hr[^>]*>/i.test(out)) {
    out = out.replace(/^\s*<hr[^>]*>\s*/i, "");
  }
  // Strip the WP metadata <p> with "Title: ... Published by: ..."
  out = out.replace(
    /<p>\s*<strong>Title:<\/strong>[\s\S]*?<\/p>\s*/i,
    ""
  );
  // Drop "Read Now" button groups anywhere
  out = out.replace(
    /<div class="wp-block-buttons[^"]*">[\s\S]*?<a[^>]*>\s*Read Now\s*<\/a>[\s\S]*?<\/div>\s*<\/div>/gi,
    ""
  );
  // Also drop empty leading hr after the strip
  while (/^\s*<hr[^>]*>/i.test(out)) {
    out = out.replace(/^\s*<hr[^>]*>\s*/i, "");
  }

  return out.trim();
}

function stripChapterPrefix(t: string): string {
  const cleaned = decodeTitle(t);
  return cleaned.replace(/^[^—–-]+[—–-]\s*Chapter\s*\d+\s*[:：]?\s*/i, "");
}
