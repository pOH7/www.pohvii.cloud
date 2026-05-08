import { getSitemapBlogEntries } from "@/lib/sitemap-content";

const locales = ["en", "zh"];
const baseUrl = "https://www.pohvii.cloud";

type SitemapEntry = {
  url: string;
  lastModified?: Date;
  changeFrequency: "daily" | "monthly" | "weekly";
  priority: number;
};

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function getSitemapEntries(): SitemapEntry[] {
  const urls: SitemapEntry[] = [];

  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/`,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/blog/`,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const locale of locales) {
    const posts = getSitemapBlogEntries(locale);
    for (const post of posts) {
      urls.push({
        url: `${baseUrl}/${locale}/blog/${post.canonicalSlug}/`,
        ...(post.lastModified && { lastModified: post.lastModified }),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return urls;
}

function buildSitemapXml() {
  const entries = getSitemapEntries()
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    ${
      entry.lastModified
        ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>`
        : ""
    }
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

export function GET() {
  return new Response(buildSitemapXml(), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
