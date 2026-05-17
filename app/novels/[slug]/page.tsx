import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { novels, chaptersForNovel, formatDate, decodeTitle, SITE } from "@/lib/content";

interface Params { slug: string }

export function generateStaticParams(): Params[] {
  return novels
    .filter((n) => !n.externalLink && n.categorySlug)
    .map((n) => ({ slug: n.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const n = novels.find((x) => x.slug === slug);
  if (!n) return {};
  return {
    title: n.title,
    description: n.blurb,
    alternates: { canonical: `/novels/${n.slug}/` },
    openGraph: {
      type: "book",
      url: `${SITE.url}/novels/${n.slug}/`,
      title: n.title,
      description: n.blurb,
      images: n.cover ? [{ url: n.cover }] : undefined,
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

  return (
    <div className="relative">
      {/* HERO */}
      <header className="relative overflow-hidden">
        {novel.cover && (
          <div
            aria-hidden
            className="absolute inset-0 -z-10 opacity-30 blur-3xl"
            style={{
              backgroundImage: `url(${novel.cover})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        )}
        <div className="mx-auto grid max-w-wide gap-10 px-6 py-20 lg:grid-cols-12 lg:gap-14 lg:px-10 lg:py-28">
          <div className="lg:col-span-5">
            {novel.cover && (
              <div className="overflow-hidden rounded-3xl border border-line/60 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.45)]">
                <div className="aspect-[3/4] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={novel.cover}
                    alt={novel.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-7 lg:pt-6">
            <p className="smallcaps text-sm text-accent">
              {novel.badge} · {novel.status}
            </p>
            <h1 className="font-display mt-3 text-5xl leading-[1.0] tracking-tight text-ink lg:text-7xl headline-balance">
              {novel.title}
            </h1>
            <p className="mt-6 max-w-2xl font-serif-body text-xl leading-relaxed text-ink-soft">
              {novel.blurb}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {chapters[0] && (
                <Link
                  href={`/${chapters[0].slug}/`}
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
                >
                  Start from Chapter 1
                </Link>
              )}
              {chapters.length > 1 && (
                <Link
                  href={`/${chapters[chapters.length - 1].slug}/`}
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
                >
                  Read latest
                </Link>
              )}
            </div>
            <p className="mt-6 text-sm text-muted">
              {chapters.length} chapter{chapters.length === 1 ? "" : "s"} so far
            </p>
          </div>
        </div>
      </header>

      {/* CHAPTERS */}
      <section className="mx-auto max-w-3xl px-6 pb-24 lg:px-0">
        <p className="smallcaps text-sm text-accent">Chapters</p>
        <h2 className="font-display mt-2 text-3xl text-ink lg:text-4xl">
          Read in order.
        </h2>

        <ol className="mt-10 space-y-1">
          {chapters.map((ch, i) => (
            <li key={ch.slug}>
              <Link
                href={`/${ch.slug}/`}
                className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-b border-line/40 py-5 transition hover:border-accent"
              >
                <span className="font-display text-3xl text-muted group-hover:text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="font-display text-xl leading-snug text-ink group-hover:text-accent">
                  {stripChapterPrefix(ch.title)}
                </span>
                <span className="font-sans text-xs text-muted">
                  {formatDate(ch.date)}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function stripChapterPrefix(t: string): string {
  // "Audrey — Chapter X: Foo" -> "Foo"
  const cleaned = decodeTitle(t);
  return cleaned.replace(/^[^—–-]+[—–-]\s*Chapter\s*\d+\s*[:：]?\s*/i, "");
}
