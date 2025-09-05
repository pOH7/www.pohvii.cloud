import { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/blog";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const locales = ["en", "zh"];
const baseUrl = "https://www.pohvii.cloud";

// Manual lastModified dates for static pages
const staticPageDates = {
  homepage: new Date("2025-09-05"), // Update when homepage content changes
  blogIndex: new Date("2025-09-05"), // Update when blog index layout changes
};

function getBlogPostDate(locale: string, slug: string): Date {
  try {
    const filePath = path.join(
      process.cwd(),
      "content",
      "blog",
      locale,
      `${slug}.mdx`
    );
    const raw = fs.readFileSync(filePath, "utf8");
    const { data } = matter(raw);

    // Use lastModified if available, fall back to date, then current date
    if (data.lastModified) {
      return new Date(data.lastModified);
    }
    if (data.date) {
      return new Date(data.date);
    }
  } catch {
    // Fall back to current date if frontmatter parsing fails
  }

  return new Date();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const urls: MetadataRoute.Sitemap = [];

  // Add homepage for each locale (use manual date)
  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}`,
      lastModified: staticPageDates.homepage,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Add blog index pages (use manual date)
  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: staticPageDates.blogIndex,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // Add individual blog posts (use frontmatter date)
  for (const locale of locales) {
    const slugs = getAllPostSlugs(locale);
    for (const slug of slugs) {
      const lastModified = getBlogPostDate(locale, slug);

      urls.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
