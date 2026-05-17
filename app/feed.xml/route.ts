import { allPosts, SITE, plainText, decodeTitle } from "@/lib/content";

export const dynamic = "force-static";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function pubDate(d: string): string {
  const dt = new Date(d.replace(" ", "T") + "Z");
  return dt.toUTCString();
}

export async function GET() {
  const base = SITE.url.replace(/\/$/, "");
  const items = allPosts
    .slice(0, 30)
    .map((p) => {
      const title = escapeXml(decodeTitle(p.title));
      const link = `${base}/${p.slug}/`;
      const desc = escapeXml(plainText(p.excerpt || p.content, 320));
      const cat = (p.categories[0]?.name ?? "").trim();
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${pubDate(p.date)}</pubDate>
      <description>${desc}</description>
      ${cat ? `<category>${escapeXml(cat)}</category>` : ""}
      <dc:creator>${escapeXml(p.author)}</dc:creator>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)}</title>
    <link>${base}</link>
    <description>${escapeXml(SITE.description)}</description>
    <language>en-us</language>
    <atom:link href="${base}/feed.xml" rel="self" type="application/rss+xml"/>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
