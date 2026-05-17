import type { Metadata } from "next";
import Link from "next/link";
import { getPage, SITE, plainText } from "@/lib/content";
import { PostContent } from "@/components/PostContent";

const ninNin = getPage("nin-nin");

export const metadata: Metadata = {
  title: "About Nin Nin",
  description:
    ninNin
      ? plainText(ninNin.excerpt || ninNin.content, 160)
      : `About ${SITE.author} — writer, game developer, and creator of ${SITE.name}.`,
  alternates: { canonical: "/about/" },
};

export default function AboutPage() {
  const page = ninNin;

  return (
    <div className="relative">
      {/* Hero */}
      <header className="mx-auto max-w-3xl px-6 pb-12 pt-20 lg:px-0 lg:pt-28">
        <p className="smallcaps text-sm text-accent">About</p>
        <h1 className="font-display mt-4 text-5xl leading-[1.0] tracking-tight text-ink sm:text-6xl lg:text-7xl headline-balance">
          Nin Nin
        </h1>
        <p className="font-display mt-4 text-2xl italic text-ink-soft lg:text-3xl">
          Writer. Game developer. Quietly stubborn dreamer.
        </p>
      </header>

      {/* Real WP content if present */}
      {page && (
        <div className="mx-auto max-w-3xl px-6 pb-16 lg:px-0">
          <PostContent item={page} />
        </div>
      )}

      {/* Fallback when page content is missing */}
      {!page && (
        <div className="mx-auto max-w-3xl px-6 pb-16 font-serif-body text-lg leading-relaxed text-ink lg:px-0">
          <p>
            Hi — I&rsquo;m Nin Nin, also known as Nin Xyami, and I&rsquo;m the
            mind behind {SITE.name}, a digital space where storytelling,
            philosophy, and personal expression come to life.
          </p>
        </div>
      )}

      {/* Where to go next */}
      <section className="border-t border-line/60 bg-paper-deep/30">
        <div className="mx-auto max-w-wide px-6 py-16 lg:px-10">
          <p className="smallcaps text-sm text-accent">From here</p>
          <h2 className="font-display mt-2 text-3xl text-ink lg:text-4xl">
            A few places to wander next.
          </h2>
          <ul className="mt-10 grid gap-6 sm:grid-cols-3">
            {[
              { href: "/novels/", label: "Read the novels",  sub: "Audrey, UTCB, Jeanie & The Infection" },
              { href: "/blog/",   label: "Wander the blog",  sub: "Essays, dev updates & reviews" },
              { href: "/games/",  label: "See the games",    sub: "What Imitatia Studios is building" },
            ].map((c) => (
              <li key={c.href}>
                <Link
                  href={c.href}
                  className="group flex h-full flex-col justify-between rounded-2xl border border-line/60 bg-paper-deep/60 p-6 transition hover:-translate-y-0.5 hover:border-accent"
                >
                  <div>
                    <p className="font-display text-2xl text-ink group-hover:text-accent">
                      {c.label}
                    </p>
                    <p className="mt-2 text-sm text-muted">{c.sub}</p>
                  </div>
                  <svg
                    className="mt-6 text-ink/40 group-hover:text-accent"
                    width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden
                  >
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
