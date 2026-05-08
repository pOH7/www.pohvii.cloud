import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

const root = process.cwd();
const siteUrl = "https://www.pohvii.cloud";
const supportedLangs = ["en", "zh"];
const contentDir = path.join(root, "content", "blog");
const publicDir = path.join(root, "public");

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function normalizePostId(value) {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return "";
}

function toValidDate(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return undefined;
}

function getCanonicalSlug(title, id) {
  const slug = generateSlug(title);
  return id ? `${slug}-${id}` : slug;
}

function readPosts(lang) {
  const dir = path.join(contentDir, lang);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.(mdx?|MDX?)$/, "");
      const raw = fs.readFileSync(path.join(dir, file), "utf8");
      const { data } = matter(raw);
      const title = data.title?.trim() || slug;
      const id = normalizePostId(data.id);
      const date = toValidDate(data.lastModified) ?? toValidDate(data.date);

      return {
        title,
        description: data.description?.trim() || "",
        canonicalSlug: getCanonicalSlug(title, id),
        date: date ?? new Date(0),
        categories: Array.isArray(data.tags) ? data.tags.filter(Boolean) : [],
      };
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());
}

function buildRssXml() {
  const items = supportedLangs
    .flatMap((lang) =>
      readPosts(lang).map((post) => ({
        ...post,
        link: `${siteUrl}/${lang}/blog/${post.canonicalSlug}`,
      }))
    )
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50);
  const lastBuildDate = items[0]?.date ?? new Date(0);
  const itemXml = items
    .map(
      (item) => `
      <item>
        <title>${escapeXml(item.title)}</title>
        <link>${escapeXml(item.link)}</link>
        <guid isPermaLink="true">${escapeXml(item.link)}</guid>
        <pubDate>${item.date.toUTCString()}</pubDate>
        <description>${escapeXml(item.description)}</description>
        ${item.categories
          .map((category) => `<category>${escapeXml(category)}</category>`)
          .join("")}
      </item>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Léon Zhang</title>
    <link>${siteUrl}</link>
    <description>Latest blog posts from Léon Zhang.</description>
    <language>en-US</language>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    <lastBuildDate>${lastBuildDate.toUTCString()}</lastBuildDate>
${itemXml}
  </channel>
</rss>`;
}

function buildSitemapXml() {
  const staticEntries = supportedLangs.flatMap((lang) => [
    {
      url: `${siteUrl}/${lang}/`,
      changeFrequency: "weekly",
      priority: "1.0",
    },
    {
      url: `${siteUrl}/${lang}/blog/`,
      changeFrequency: "daily",
      priority: "0.8",
    },
  ]);
  const postEntries = supportedLangs.flatMap((lang) =>
    readPosts(lang).map((post) => ({
      url: `${siteUrl}/${lang}/blog/${post.canonicalSlug}/`,
      lastModified: post.date.getTime() > 0 ? post.date : undefined,
      changeFrequency: "monthly",
      priority: "0.6",
    }))
  );
  const entries = [...staticEntries, ...postEntries]
    .map(
      (entry) => `
  <url>
    <loc>${escapeXml(entry.url)}</loc>
    ${entry.lastModified ? `<lastmod>${entry.lastModified.toISOString()}</lastmod>` : ""}
    <changefreq>${entry.changeFrequency}</changefreq>
    <priority>${entry.priority}</priority>
  </url>`
    )
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>`;
}

function buildRobotsTxt() {
  return `User-agent: *
Allow: /

Host: ${siteUrl}
Sitemap: ${siteUrl}/sitemap.xml
`;
}

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(path.join(publicDir, "rss.xml"), buildRssXml());
fs.writeFileSync(path.join(publicDir, "sitemap.xml"), buildSitemapXml());
fs.writeFileSync(path.join(publicDir, "robots.txt"), buildRobotsTxt());

process.stdout.write("Generated static rss.xml, sitemap.xml, and robots.txt\n");
