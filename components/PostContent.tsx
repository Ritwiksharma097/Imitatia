import Link from "next/link";
import {
  ContentItem,
  chapterNeighbors,
  chaptersForNovel,
  novelOfPost,
  getCategoryDef,
  decodeTitle,
} from "@/lib/content";

interface Props {
  item: ContentItem;
}

/**
 * Renders WordPress-derived HTML with our custom markers expanded:
 *   <!--CHAPTER_NAV:slug-->  →  prev/next chapter navigation
 *   <!--READ_NOW:slug-->     →  CTA pointing to the most recent chapter of that novel
 *
 * We split the content on the marker comment boundaries and interleave React.
 */
export function PostContent({ item }: Props) {
  // If the post body starts with a <figure> whose image is the same URL as the
  // featured image (we now display the featured image in the hero, so showing
  // it again right at the top of the body is a duplicate).
  let html = item.content;
  if (item.featuredImage) {
    const featBase = stripSizeAndQuery(item.featuredImage);
    // Match leading <figure ...>...<img src="X"... /></figure> possibly followed by whitespace
    const leading = html.match(/^\s*<figure[^>]*>[\s\S]*?<img[^>]*\bsrc="([^"]+)"[\s\S]*?<\/figure>\s*/i);
    if (leading) {
      const imgBase = stripSizeAndQuery(leading[1]);
      if (imgBase === featBase || imgBase.endsWith(featBase) || featBase.endsWith(imgBase)) {
        html = html.slice(leading[0].length);
      }
    }
  }
  const segments = splitOnMarkers(html);

  return (
    <div className="prose-imitatia prose-imitatia-root">
      {segments.map((seg, i) => {
        if (seg.kind === "html") {
          return (
            <div
              key={i}
              dangerouslySetInnerHTML={{ __html: seg.html }}
            />
          );
        }
        if (seg.kind === "chapter_nav") {
          return <ChapterNavBlock key={i} item={item} categorySlug={seg.slug} />;
        }
        if (seg.kind === "read_now") {
          return <ReadNowBlock key={i} categorySlug={seg.slug} />;
        }
        return null;
      })}
    </div>
  );
}

type Segment =
  | { kind: "html"; html: string }
  | { kind: "chapter_nav"; slug: string }
  | { kind: "read_now"; slug: string };

function splitOnMarkers(html: string): Segment[] {
  const re = /<!--(CHAPTER_NAV|READ_NOW):([^>]+)-->/g;
  const out: Segment[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    if (m.index > last) {
      out.push({ kind: "html", html: html.slice(last, m.index) });
    }
    const slug = m[2].trim();
    if (m[1] === "CHAPTER_NAV") out.push({ kind: "chapter_nav", slug });
    else out.push({ kind: "read_now", slug });
    last = m.index + m[0].length;
  }
  if (last < html.length) out.push({ kind: "html", html: html.slice(last) });
  return out;
}

// ─────────────────────────────────────────────────────────
// Chapter nav (prev/next within a novel)
// ─────────────────────────────────────────────────────────

function ChapterNavBlock({
  item,
  categorySlug,
}: {
  item: ContentItem;
  categorySlug: string;
}) {
  const { prev, next } = chapterNeighbors(item, categorySlug);
  const cat = getCategoryDef(categorySlug);
  if (!prev && !next) return null;

  return (
    <nav
      aria-label="Chapter navigation"
      className="not-prose my-12 grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/${prev.slug}/`}
          className="group flex flex-col rounded-2xl border border-line bg-paper-deep/40 p-5 transition hover:border-accent hover:bg-paper-deep"
        >
          <span className="smallcaps text-xs text-muted">← Previous in {cat?.name}</span>
          <span className="font-display mt-1 text-lg leading-tight text-ink group-hover:text-accent">
            {cleanTitle(prev.title)}
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={`/${next.slug}/`}
          className="group flex flex-col rounded-2xl border border-line bg-paper-deep/40 p-5 text-right transition hover:border-accent hover:bg-paper-deep"
        >
          <span className="smallcaps text-xs text-muted">Next in {cat?.name} →</span>
          <span className="font-display mt-1 text-lg leading-tight text-ink group-hover:text-accent">
            {cleanTitle(next.title)}
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}

// ─────────────────────────────────────────────────────────
// Read Now (used on novel landing pages)
// ─────────────────────────────────────────────────────────

function ReadNowBlock({ categorySlug }: { categorySlug: string }) {
  const chs = chaptersForNovel(categorySlug);
  if (chs.length === 0) return null;
  const latest = chs[chs.length - 1];
  const first = chs[0];

  return (
    <div className="not-prose my-10 rounded-2xl border border-line bg-paper-deep/60 p-6 sm:p-8">
      <p className="smallcaps text-xs text-accent">Read</p>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Link
          href={`/${first.slug}/`}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
        >
          Start from Chapter 1
        </Link>
        {chs.length > 1 && (
          <Link
            href={`/${latest.slug}/`}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
          >
            Latest: {cleanTitle(latest.title).replace(/^[^—–-]+[—–-]\s*/, "")}
          </Link>
        )}
      </div>
      <p className="mt-3 text-sm text-muted">
        {chs.length} chapter{chs.length === 1 ? "" : "s"} available
      </p>
    </div>
  );
}

function cleanTitle(t: string): string {
  return decodeTitle(t);
}

// Normalize a URL for comparison: drop query strings and WP size suffixes like -1024x768
function stripSizeAndQuery(u: string): string {
  return u.split("?")[0].replace(/-\d+x\d+(?=\.[a-zA-Z]+$)/, "");
}
