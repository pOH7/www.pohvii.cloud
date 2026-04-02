import type { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/blog";
import { getAllPostsWithIds } from "@/lib/self-healing-blog";
import { generateSlug, combineSlugId } from "@/lib/post-id";
import { getAllNoteTopics } from "@/lib/note";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

interface NoteFrontmatter {
  title?: string;
  description?: string;
  platform?: string;
  order?: number;
  icon?: string;
  protected?: boolean;
  date?: string;
  lastModified?: string;
}

const locales = ["en", "zh"];
const baseUrl = "https://www.pohvii.cloud";

function toValidDate(value: unknown): Date | undefined {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return undefined;
}

function getFrontmatterDate(data: Record<string, unknown>): Date | undefined {
  return toValidDate(data.lastModified) ?? toValidDate(data.date);
}

function getBlogPostDate(locale: string, slug: string): Date | undefined {
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
    return getFrontmatterDate(data);
  } catch {
    return undefined;
  }
}

function isNoteProtected(locale: string, topic: string): boolean {
  try {
    const overviewFile = path.join(
      process.cwd(),
      "content",
      "note",
      locale,
      topic,
      "overview.mdx"
    );

    if (fs.existsSync(overviewFile)) {
      const raw = fs.readFileSync(overviewFile, "utf8");
      const { data } = matter(raw);
      const fm = data as Partial<NoteFrontmatter>;
      return fm.protected === true;
    }
  } catch {
    // If we can't read the file, assume it's not protected
  }

  return false;
}

function getNoteDate(locale: string, topic: string): Date | undefined {
  try {
    const overviewFile = path.join(
      process.cwd(),
      "content",
      "note",
      locale,
      topic,
      "overview.mdx"
    );

    if (!fs.existsSync(overviewFile)) {
      return undefined;
    }

    const raw = fs.readFileSync(overviewFile, "utf8");
    const { data } = matter(raw);
    return getFrontmatterDate(data);
  } catch {
    return undefined;
  }
}

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  // Static indexes omit lastModified unless they have a trustworthy source.
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

  // Add individual blog posts with self-healing URLs (use frontmatter date)
  for (const locale of locales) {
    const posts = getAllPostsWithIds(locale);
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
        : undefined;

      // Use canonical URL format: /locale/blog/slug-id
      const canonicalSlug = post.id
        ? combineSlugId(generateSlug(post.title), post.id)
        : generateSlug(post.title);

      urls.push({
        url: `${baseUrl}/${locale}/blog/${canonicalSlug}/`,
        ...(lastModified && { lastModified }),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/note/`,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Add individual note pages (exclude protected notes)
  for (const locale of locales) {
    const topics = getAllNoteTopics(locale);
    for (const topic of topics) {
      // Skip protected notes - they should not appear in sitemap
      if (isNoteProtected(locale, topic)) {
        continue;
      }

      const lastModified = getNoteDate(locale, topic);

      urls.push({
        url: `${baseUrl}/${locale}/note/${encodeURIComponent(topic)}/`,
        ...(lastModified && { lastModified }),
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
