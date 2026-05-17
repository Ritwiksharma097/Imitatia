import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-6 py-24 text-center">
      <p className="smallcaps text-sm text-accent">404</p>
      <h1 className="font-display mt-3 text-5xl leading-[1.0] tracking-tight text-ink sm:text-6xl lg:text-8xl headline-balance">
        This page has wandered off.
      </h1>
      <p className="mt-6 font-serif-body text-xl text-ink-soft">
        Maybe a chapter moved. Maybe a draft never made it.
        Either way — there&rsquo;s still plenty to read.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3.5 font-sans text-sm font-medium text-paper transition hover:-translate-y-0.5 hover:bg-accent"
        >
          Go home
        </Link>
        <Link
          href="/blog/"
          className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-7 py-3.5 font-sans text-sm font-medium text-ink transition hover:border-accent hover:text-accent"
        >
          Browse the blog
        </Link>
      </div>
    </div>
  );
}
