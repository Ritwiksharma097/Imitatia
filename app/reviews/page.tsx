import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { postsInCategory } from "@/lib/content";

export const metadata: Metadata = {
  title: "Reviews",
  description: "Reviews of anime, manga, TV shows, and games that left a mark — by Nin Nin.",
  alternates: { canonical: "/reviews/" },
};

export default function ReviewsIndex() {
  const reviews = postsInCategory("imitatia-reviews");

  return (
    <div className="mx-auto max-w-wide px-6 py-16 lg:px-10 lg:py-24">
      <header className="max-w-3xl">
        <p className="smallcaps text-sm text-accent">Nin Nin&rsquo;s picks</p>
        <h1 className="font-display mt-3 text-5xl leading-[1.05] tracking-tight text-ink lg:text-6xl headline-balance">
          Things that left a mark.
        </h1>
        <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
          Anime, manga, shows — pieces of media that taught me something
          about story, feeling, or the in-between.
        </p>
      </header>
      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.map((p) => (
          <li key={p.slug}><PostCard post={p} /></li>
        ))}
      </ul>
    </div>
  );
}
