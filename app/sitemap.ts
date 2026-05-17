import type { MetadataRoute } from "next";
import { allPosts, allPages, novels, allCategories, SITE } from "@/lib/content";

export const dynamic = "force-static";

// Pages routed under our top-level [slug] that we DON'T want indexed as pages
// Keep this in sync with the page blacklist in app/[slug]/page.tsx
const PAGE_BLACKLIST = new Set([
  "home", "about", "portfolio", "nin-nin", "imitatia-studios",
  "imitatia-posts", "novels-by-nin-nin",
  "audrey", "under-the-cherry-blossoms", "coincidence-or-jeanie",
  "friends-review-the-one-where-ross-sucks",
]);

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url.replace(/\/$/, "");
  const now = new Date();

  const staticRoutes = [
    "/",
    "/blog/",
    "/novels/",
    "/reviews/",
    "/games/",
    "/portfolio/",
    "/about/",
  ].map((p) => ({
    url: `${base}${p}`,
    lastModified: now,
    changeFrequency: (p === "/" ? "daily" : "weekly") as "daily" | "weekly",
    priority: p === "/" ? 1 : 0.7,
  }));

  const postRoutes = allPosts.map((p) => ({
    url: `${base}/${p.slug}/`,
    lastModified: parseDate(p.modified) ?? parseDate(p.date) ?? now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const pageRoutes = allPages
    .filter((p) => !PAGE_BLACKLIST.has(p.slug))
    .map((p) => ({
      url: `${base}/${p.slug}/`,
      lastModified: parseDate(p.modified) ?? parseDate(p.date) ?? now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));

  const novelRoutes = novels.map((n) => ({
    url: `${base}/novels/${n.slug}/`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const catRoutes = allCategories.map((c) => ({
    url: `${base}/category/${c.slug}/`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...postRoutes, ...pageRoutes, ...novelRoutes, ...catRoutes];
}

function parseDate(d: string | undefined): Date | undefined {
  if (!d) return undefined;
  const dt = new Date(d.replace(" ", "T") + "Z");
  return isNaN(dt.getTime()) ? undefined : dt;
}
