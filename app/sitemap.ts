import { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/blog";
import { getAllPostsWithIds } from "@/lib/self-healing-blog";
import { generateSlug, combineSlugId } from "@/lib/post-id";
import { getAllNoteTopics } from "@/lib/note";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

const locales = ["en", "zh"];
const baseUrl = "https://www.pohvii.cloud";

// Manual lastModified dates for static pages
const staticPageDates = {
  homepage: new Date("2025-09-05"), // Update when homepage content changes
  blogIndex: new Date("2025-09-05"), // Update when blog index layout changes
  noteIndex: new Date("2025-10-13"), // Update when note index layout changes
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
      url: `${baseUrl}/${locale}/`,
      lastModified: staticPageDates.homepage,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  // Add blog index pages (use manual date)
  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/blog/`,
      lastModified: staticPageDates.blogIndex,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // Add individual blog posts with self-healing URLs (use frontmatter date)
  for (const locale of locales) {
    const posts = await getAllPostsWithIds(locale);
    for (const post of posts) {
      // Extract original slug from filename for getBlogPostDate
      const originalSlug = getAllPostSlugs(locale).find((slug) => {
        const filePath = path.join(
          process.cwd(),
          "content",
          "blog",
          locale,
          `${slug}.mdx`
        );
        try {
          const raw = fs.readFileSync(filePath, "utf8");
          const { data } = matter(raw);
          return data.id === post.id;
        } catch {
          return false;
        }
      });

      const lastModified = originalSlug
        ? getBlogPostDate(locale, originalSlug)
        : new Date();

      // Use canonical URL format: /locale/blog/slug-id
      const canonicalSlug = post.id
        ? combineSlugId(generateSlug(post.title), post.id)
        : generateSlug(post.title);

      urls.push({
        url: `${baseUrl}/${locale}/blog/${canonicalSlug}/`,
        lastModified,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  // Add note index pages
  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/note/`,
      lastModified: staticPageDates.noteIndex,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Add individual note pages
  for (const locale of locales) {
    const topics = getAllNoteTopics(locale);
    for (const topic of topics) {
      urls.push({
        url: `${baseUrl}/${locale}/note/${topic}/`,
        lastModified: new Date(), // Could be extracted from file stats if needed
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
