import type { Metadata } from "next";
import PostCard from "@/components/PostCard";
import { allPosts, SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description:
    `Every story, essay, chapter, and review on ${SITE.name}. Updates from Nin Nin.`,
  alternates: { canonical: "/blog/" },
};

export default function BlogIndex() {
  const posts = allPosts; // already newest-first

  return (
    <div className="mx-auto max-w-wide px-6 py-16 lg:px-10 lg:py-24">
      <header className="max-w-3xl">
        <p className="smallcaps text-sm text-accent">The blog</p>
        <h1 className="font-display mt-3 text-5xl leading-[1.05] tracking-tight text-ink lg:text-6xl headline-balance">
          Everything ever written here.
        </h1>
        <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
          Novel chapters, anime reviews, philosophical essays, dev updates —
          all in one feed, newest first.
        </p>
      </header>

      <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((p) => (
          <li key={p.slug}>
            <PostCard post={p} />
          </li>
        ))}
      </ul>
    </div>
  );
}
