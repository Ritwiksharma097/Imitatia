import Link from "next/link";
import PostCard from "@/components/PostCard";
import {
  allPosts,
  novels,
  postsInCategory,
  latestPosts,
  chaptersForNovel,
  decodeTitle,
  SITE,
} from "@/lib/content";

// Featured & hero post selection
function pickFeatured() {
  // Newest post that's NOT a novel chapter
  const nonChapter = allPosts.find(
    (p) =>
      !p.categories.some((c) =>
        ["audrey", "utcb", "coincidence-or-jeanie", "infection"].includes(c.slug)
      )
  );
  return nonChapter ?? allPosts[0];
}

export default function Home() {
  const featured = pickFeatured();
  const recent = latestPosts(6, [featured.slug]);
  const dreams = postsInCategory("imitatia-dreams").slice(0, 4);
  const reviews = postsInCategory("imitatia-reviews").slice(0, 3);

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto max-w-wide px-6 pb-20 pt-20 lg:px-10 lg:pb-32 lg:pt-28">
          <div className="grid gap-14 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7 stagger">
              <p className="smallcaps text-sm text-accent">
                <span className="blossom-mark" /> A quiet space for stories
              </p>
              <h1 className="font-display mt-5 text-6xl leading-[0.95] tracking-tight text-ink sm:text-7xl lg:text-8xl headline-balance">
                Stories that <em className="text-accent font-display">remember</em> you back.
              </h1>
              <p className="mt-7 max-w-xl font-serif-body text-xl leading-relaxed text-ink-soft">
                Original novels, introspective essays, anime reviews,
                and narrative games — written and built by Nin Nin.
                A digital journal made public, because words can connect us,
                even from a quiet place.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/novels/"
                  className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
                >
                  Read the novels
                  <ArrowRight />
                </Link>
                <Link
                  href="/blog/"
                  className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
                >
                  Wander the blog
                </Link>
              </div>
            </div>

            {/* Vertical "magazine cover" of latest post */}
            <Link
              href={`/${featured.slug}/`}
              className="group relative col-span-full mt-6 self-center lg:col-span-5 lg:mt-0"
            >
              <div className="relative overflow-hidden rounded-[28px] border border-line/60 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.35)] dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)]">
                <div className="aspect-[3/4] w-full overflow-hidden">
                  {featured.featuredImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={featured.featuredImage}
                      alt=""
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
                    />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="smallcaps text-xs text-white/85">Latest</p>
                  <h2 className="font-display mt-2 text-3xl leading-tight text-white headline-balance">
                    {decode(featured.title)}
                  </h2>
                </div>
                <div className="absolute right-5 top-5 rounded-full bg-paper/90 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-ink">
                  {SITE.name}
                </div>
              </div>
              {/* decorative dot */}
              <span className="pointer-events-none absolute -left-3 -top-3 h-6 w-6 rounded-full bg-accent animate-drift" />
            </Link>
          </div>
        </div>

        {/* paper edge divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-line to-transparent" />
      </section>

      {/* NOVELS */}
      <section className="mx-auto max-w-wide px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="smallcaps text-sm text-accent">The novels</p>
            <h2 className="font-display mt-3 text-4xl leading-tight tracking-tight text-ink lg:text-5xl headline-balance">
              Four worlds, slowly unfolding.
            </h2>
          </div>
          <Link
            href="/novels/"
            className="hidden text-sm text-ink/85 hover:text-accent sm:inline-flex items-center gap-1"
          >
            All novels <ArrowRight />
          </Link>
        </div>

        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {novels.map((n) => {
            const chCount = chaptersForNovel(n.categorySlug).length;
            return (
              <li key={n.slug}>
                <Link
                  href={`/novels/${n.slug}/`}
                  className="group block overflow-hidden rounded-2xl border border-line/60 bg-paper-deep/30 transition hover:-translate-y-1 hover:border-accent/60"
                >
                  <div className="aspect-[3/4] overflow-hidden">
                    {n.cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={n.cover}
                        alt={n.title}
                        className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-muted">
                      <span>{n.badge}</span>
                      <span>{chCount} ch.</span>
                    </div>
                    <h3 className="font-display mt-2 text-2xl leading-tight text-ink group-hover:text-accent">
                      {n.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 font-serif-body text-sm leading-relaxed text-ink-soft">
                      {n.blurb}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* IMITATIA DREAMS — distinct visual treatment */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-60"
          style={{
            backgroundImage:
              "radial-gradient(800px 400px at 50% 0%, var(--accent-soft), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-wide px-6 py-20 lg:px-10 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <p className="smallcaps text-sm text-accent">Imitatia dreams</p>
            <h2 className="font-display mt-3 text-4xl leading-tight tracking-tight text-ink lg:text-5xl headline-balance">
              The quieter pieces — essays from the in-between.
            </h2>
            <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
              Reflections on life, attention, and the small fires that keep
              meaning alive. Less newsletter, more diary, made public.
            </p>
          </div>

          <ul className="mt-14 grid gap-6 md:grid-cols-2">
            {dreams.map((p, i) => (
              <li key={p.slug} className={i === 0 ? "md:row-span-2" : ""}>
                <PostCard post={p} variant={i === 0 ? "feature" : "default"} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* RECENT */}
      <section className="mx-auto max-w-wide px-6 py-20 lg:px-10 lg:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="smallcaps text-sm text-accent">Recently posted</p>
            <h2 className="font-display mt-3 text-4xl leading-tight tracking-tight text-ink lg:text-5xl headline-balance">
              The newest pages of the journal.
            </h2>
          </div>
          <Link href="/blog/" className="hidden text-sm text-ink/85 hover:text-accent sm:inline-flex items-center gap-1">
            Everything <ArrowRight />
          </Link>
        </div>
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {recent.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      </section>

      {/* REVIEWS */}
      {reviews.length > 0 && (
        <section className="mx-auto max-w-wide px-6 py-20 lg:px-10 lg:py-28 border-t border-line/60">
          <div className="grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4 lg:sticky lg:top-28 lg:self-start">
              <p className="smallcaps text-sm text-accent">Nin Nin&rsquo;s picks</p>
              <h2 className="font-display mt-3 text-4xl leading-tight tracking-tight text-ink lg:text-5xl headline-balance">
                Reviews of things that left a mark.
              </h2>
              <Link
                href="/reviews/"
                className="mt-6 inline-flex items-center gap-2 font-sans text-sm text-ink/85 hover:text-accent"
              >
                All reviews <ArrowRight />
              </Link>
            </div>
            <ul className="lg:col-span-8 divide-y divide-line/60">
              {reviews.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} variant="compact" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* CALL TO COFFEE */}
      <section className="mx-auto max-w-wide px-6 pb-24 lg:px-10">
        <div className="relative overflow-hidden rounded-3xl border border-line/60 bg-paper-deep/60 p-10 lg:p-16">
          <div className="grid items-center gap-8 lg:grid-cols-2">
            <div>
              <p className="smallcaps text-sm text-accent">A small note</p>
              <h2 className="font-display mt-3 text-4xl leading-tight text-ink lg:text-5xl headline-balance">
                If a story stayed with you, you can stay a little with me.
              </h2>
            </div>
            <div className="flex flex-col items-start gap-4 lg:items-end">
              <a
                href="https://ko-fi.com/ninxyami"
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5"
              >
                Buy Nin a coffee
                <ArrowRight />
              </a>
              <p className="text-xs text-muted">Optional, always. Reading is enough.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function ArrowRight() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}

function decode(t: string): string {
  return decodeTitle(t);
}
