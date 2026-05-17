import Link from "next/link";
import { ContentItem, formatDate, plainText, readingTime, decodeTitle } from "@/lib/content";

interface Props {
  post: ContentItem;
  variant?: "feature" | "default" | "compact";
}

export default function PostCard({ post, variant = "default" }: Props) {
  const date = formatDate(post.date);
  const rt = readingTime(post.content);
  const excerpt = plainText(post.excerpt || post.content, 180);
  const primaryCat = post.categories.find(
    (c) => c.taxonomy === "category" &&
      !["novels", "web-novel", "published-novels"].includes(c.slug)
  ) ?? post.categories[0];

  if (variant === "feature") {
    return (
      <Link
        href={`/${post.slug}/`}
        className="group relative grid overflow-hidden rounded-3xl border border-line/60 bg-paper-deep/30 transition hover:border-accent/60 lg:grid-cols-2"
      >
        <div className="aspect-[4/3] overflow-hidden lg:aspect-auto lg:h-full">
          {post.featuredImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.featuredImage}
              alt=""
              loading="eager"
              className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
            />
          )}
        </div>
        <div className="flex flex-col justify-center gap-5 p-8 lg:p-12">
          {primaryCat && (
            <span className="smallcaps text-xs text-accent">
              {primaryCat.name}
            </span>
          )}
          <h2 className="font-display text-3xl leading-[1.05] tracking-tight text-ink lg:text-5xl headline-balance">
            {decode(post.title)}
          </h2>
          <p className="font-serif-body text-base leading-relaxed text-ink-soft">
            {excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span>{date}</span>
            <span aria-hidden>·</span>
            <span>{rt} min read</span>
          </div>
        </div>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link href={`/${post.slug}/`} className="group flex gap-4 py-4 border-b border-line/60 last:border-b-0">
        {post.featuredImage && (
          <div className="hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.featuredImage}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover transition group-hover:scale-105"
            />
          </div>
        )}
        <div className="flex flex-col">
          {primaryCat && (
            <span className="smallcaps text-[11px] text-accent">{primaryCat.name}</span>
          )}
          <h3 className="font-display text-lg leading-snug text-ink group-hover:text-accent">
            {decode(post.title)}
          </h3>
          <p className="mt-1 text-xs text-muted">{date}</p>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${post.slug}/`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line/60 bg-paper-deep/30 transition hover:-translate-y-0.5 hover:border-accent/60"
    >
      <div className="aspect-[5/3] overflow-hidden">
        {post.featuredImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.featuredImage}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        {primaryCat && (
          <span className="smallcaps text-[11px] text-accent">{primaryCat.name}</span>
        )}
        <h3 className="font-display text-2xl leading-tight tracking-tight text-ink group-hover:text-accent headline-balance">
          {decode(post.title)}
        </h3>
        <p className="line-clamp-3 font-serif-body text-sm leading-relaxed text-ink-soft">
          {excerpt}
        </p>
        <div className="mt-auto flex items-center gap-3 pt-2 text-xs text-muted">
          <span>{date}</span>
          <span aria-hidden>·</span>
          <span>{rt} min read</span>
        </div>
      </div>
    </Link>
  );
}

function decode(t: string): string {
  return decodeTitle(t);
}
