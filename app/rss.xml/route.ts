import { getBlogFeedItems } from "@/lib/blog-feed";

const siteUrl = "https://www.pohvii.cloud";
const feedTitle = "Léon Zhang";
const feedDescription = "Latest blog posts from Léon Zhang.";

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildRssXml() {
  const items = getBlogFeedItems();
  const itemXml = items
    .map(
      (item) => `
      <item>
        <title>${escapeXml(item.title)}</title>
        <link>${escapeXml(item.link)}</link>
        <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
        <pubDate>${item.pubDate.toUTCString()}</pubDate>
        <description>${escapeXml(item.description)}</description>
        ${
          item.categories.length > 0
            ? item.categories
                .map(
                  (category) => `<category>${escapeXml(category)}</category>`
                )
                .join("")
            : ""
        }
      </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(feedTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(feedDescription)}</description>
    <language>en-US</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${itemXml}
  </channel>
</rss>`;
}

export function GET() {
  const body = buildRssXml();

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
