import type { Metadata } from "next";
import Link from "next/link";
import { novels, chaptersForNovel } from "@/lib/content";

export const metadata: Metadata = {
  title: "Novels by Nin Nin",
  description:
    "Original novels by Nin Nin: Audrey, Under The Cherry Blossoms, Coincidence or Jeanie, and The Infection. Read chapter by chapter.",
  alternates: { canonical: "/novels/" },
};

export default function NovelsIndex() {
  return (
    <div className="mx-auto max-w-wide px-6 py-16 lg:px-10 lg:py-24">
      <header className="max-w-3xl">
        <p className="smallcaps text-sm text-accent">The novels</p>
        <h1 className="font-display mt-3 text-5xl leading-[1.05] tracking-tight text-ink lg:text-6xl headline-balance">
          Stories I&rsquo;m still telling.
        </h1>
        <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
          Some of these are full novels. Some are released chapter by chapter,
          so you&rsquo;re here for the journey as it unfolds. All of them
          mean something to me — and I hope at least one of them finds you.
        </p>
      </header>

      <ul className="mt-16 space-y-16">
        {novels.map((n, i) => {
          const chs = n.categorySlug ? chaptersForNovel(n.categorySlug) : [];
          const target = n.externalLink ?? `/novels/${n.slug}/`;
          const reverse = i % 2 === 1;
          return (
            <li key={n.slug}>
              <article
                className={`grid items-center gap-10 lg:grid-cols-12 ${
                  reverse ? "lg:[direction:rtl]" : ""
                }`}
              >
                <Link
                  href={target}
                  className="group relative lg:col-span-5 [direction:ltr]"
                >
                  <div className="overflow-hidden rounded-2xl border border-line/60 shadow-[0_25px_60px_-25px_rgba(0,0,0,0.4)] dark:shadow-[0_25px_60px_-25px_rgba(0,0,0,0.7)]">
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
                  </div>
                </Link>
                <div className="lg:col-span-7 [direction:ltr]">
                  <div className="flex items-center gap-3">
                    <span className="smallcaps text-xs text-accent">{n.badge}</span>
                    {n.categorySlug && (
                      <span className="text-xs text-muted">
                        · {chs.length} chapter{chs.length === 1 ? "" : "s"}
                      </span>
                    )}
                    <span className="text-xs text-muted">
                      · {n.status}
                    </span>
                  </div>
                  <h2 className="font-display mt-3 text-4xl leading-tight tracking-tight text-ink lg:text-5xl headline-balance">
                    {n.title}
                  </h2>
                  <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
                    {n.blurb}
                  </p>
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Link
                      href={target}
                      className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
                    >
                      {n.externalLink ? "View" : "Explore"}
                    </Link>
                    {chs[0] && (
                      <Link
                        href={`/${chs[0].slug}/`}
                        className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-6 py-3 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
                      >
                        Start reading
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
