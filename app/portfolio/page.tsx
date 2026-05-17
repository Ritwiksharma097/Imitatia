import type { Metadata } from "next";
import { getPage, plainText, SITE } from "@/lib/content";
import { PostContent } from "@/components/PostContent";
import { notFound } from "next/navigation";

const page = getPage("portfolio");

export const metadata: Metadata = {
  title: "Portfolio",
  description: page
    ? plainText(page.excerpt || page.content, 160)
    : `Nin Nin's storytelling portfolio — novels, chapters, interactive games, and dev blogs.`,
  alternates: { canonical: "/portfolio/" },
  openGraph: {
    type: "website",
    url: `${SITE.url}/portfolio/`,
    title: "Portfolio",
    description: page ? plainText(page.excerpt || page.content, 160) : undefined,
  },
};

export default function PortfolioPage() {
  if (!page) notFound();

  return (
    <div className="relative">
      <header className="mx-auto max-w-3xl px-6 pb-10 pt-20 lg:px-0 lg:pt-28">
        <p className="smallcaps text-sm text-accent">Storytelling</p>
        <h1 className="font-display mt-4 text-5xl leading-[1.0] tracking-tight text-ink lg:text-7xl headline-balance">
          The whole portfolio.
        </h1>
        <p className="font-display mt-4 text-2xl italic text-ink-soft lg:text-3xl">
          Novels, chapters, games — all in one place.
        </p>
      </header>

      <div className="mx-auto max-w-3xl px-6 pb-20 lg:px-0">
        <PostContent item={page} />
      </div>
    </div>
  );
}
