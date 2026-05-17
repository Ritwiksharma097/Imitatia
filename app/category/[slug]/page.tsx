import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostCard from "@/components/PostCard";
import {
  allCategories,
  getCategoryDef,
  postsInCategory,
  SITE,
} from "@/lib/content";

interface Params { slug: string }

export function generateStaticParams(): Params[] {
  return allCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategoryDef(slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: `Everything in ${cat.name} on ${SITE.name}.`,
    alternates: { canonical: `/category/${cat.slug}/` },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const cat = getCategoryDef(slug);
  if (!cat) notFound();
  const posts = postsInCategory(cat.slug);

  return (
    <div className="mx-auto max-w-wide px-6 py-16 lg:px-10 lg:py-24">
      <header className="max-w-3xl">
        <p className="smallcaps text-sm text-accent">Category</p>
        <h1 className="font-display mt-3 text-5xl leading-[1.05] tracking-tight text-ink lg:text-6xl headline-balance">
          {cat.name}
        </h1>
        <p className="mt-5 font-serif-body text-lg leading-relaxed text-ink-soft">
          {posts.length} post{posts.length === 1 ? "" : "s"} in this category.
        </p>
      </header>

      {posts.length === 0 ? (
        <p className="mt-12 text-muted">Nothing here yet.</p>
      ) : (
        <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.slug}>
              <PostCard post={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export const dynamicParams = false;
