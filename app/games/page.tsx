import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Imitatia Studios — Games",
  description:
    "Narrative games in development at Imitatia Studios: Prison Sandbox, Untamed Shadows, and Point and Touch Thief — by Nin Nin.",
  alternates: { canonical: "/games/" },
};

interface Game {
  slug: string;
  pageSlug: string; // the WP page slug
  title: string;
  tagline: string;
  blurb: string;
  cover: string;
  status: string;
  genre: string;
}

const games: Game[] = [
  {
    slug: "prison-sandbox",
    pageSlug: "prison-sandbox",
    title: "Prison Sandbox",
    tagline: "Every choice shapes your sentence.",
    blurb:
      "An open-ended survival and escape simulator inside a fully simulated prison. Every inmate has a story, every guard has a routine, every rumor can change your fate.",
    cover: "/images/2025/08/prison-ss-1.webp",
    status: "In Development",
    genre: "Survival · Sandbox · Escape",
  },
  {
    slug: "untamed-shadows-hitman-style-stealth-in-a-living-jungle",
    pageSlug: "untamed-shadows-hitman-style-stealth-in-a-living-jungle",
    title: "Untamed Shadows",
    tagline: "Hitman-style stealth, reimagined through claws and instinct.",
    blurb:
      "You are a tigress — a mother, a hunter, a strategist — navigating a living jungle where every faction, predator, and prey matters. Be the shadow. Rescue your cub.",
    cover: "/images/2025/08/their-a-rt.webp",
    status: "Concept",
    genre: "3D Stealth · Sandbox",
  },
  {
    slug: "point-and-touch-thief-project",
    pageSlug: "point-and-touch-thief-project",
    title: "Point and Touch Thief Project",
    tagline: "An upcoming puzzle-driven heist adventure.",
    blurb:
      "Eight unique heists. No combat, no quick reflexes — just clever planning and problem-solving. A prologue, a series of tense capers, and an epilogue that leads into Prison Sandbox.",
    cover: "/images/2025/08/their-a-rt.webp",
    status: "In Development",
    genre: "Point-and-touch puzzle",
  },
];

export default function GamesIndex() {
  return (
    <div className="mx-auto max-w-wide px-6 py-16 lg:px-10 lg:py-24">
      <header className="max-w-3xl">
        <p className="smallcaps text-sm text-accent">Imitatia studios</p>
        <h1 className="font-display mt-3 text-5xl leading-[1.05] tracking-tight text-ink lg:text-6xl headline-balance">
          Worlds I&rsquo;m still building.
        </h1>
        <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
          A small corner for the games I&rsquo;m making. All projects are
          early-stage — design docs, prototypes, and slow patient work. If
          any of these grab you, the dev blogs below have the messy
          behind-the-scenes.
        </p>
      </header>

      <ul className="mt-16 grid gap-8 lg:grid-cols-3">
        {games.map((g) => (
          <li key={g.slug}>
            <Link
              href={`/${g.pageSlug}/`}
              className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line/60 bg-paper-deep/30 transition hover:-translate-y-1 hover:border-accent/60"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={g.cover}
                  alt={g.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                />
                <span className="absolute left-4 top-4 rounded-full bg-paper/90 px-3 py-1 text-[10px] uppercase tracking-wider text-ink backdrop-blur">
                  {g.status}
                </span>
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <p className="smallcaps text-[11px] text-accent">{g.genre}</p>
                <h2 className="font-display text-3xl leading-tight tracking-tight text-ink group-hover:text-accent headline-balance">
                  {g.title}
                </h2>
                <p className="font-display italic text-base text-ink-soft">
                  {g.tagline}
                </p>
                <p className="font-serif-body text-sm leading-relaxed text-ink-soft">
                  {g.blurb}
                </p>
                <span className="mt-auto inline-flex items-center gap-1 pt-3 text-sm text-accent">
                  More about {g.title}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <path d="M5 12h14M13 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
