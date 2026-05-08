import readingTime from "reading-time";

import { getRawBlogEntries, getRawBlogEntryBySlug } from "./blog-content";
import { normalizeBlogImage } from "./blog-image";

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  author?: string;
  category?: string;
  tags?: string[];
  image?: string;
  video?: string;
}

export interface BlogMeta extends Omit<
  BlogFrontmatter,
  "image" | "author" | "category" | "tags" | "video"
> {
  slug: string;
  lang: string;
  readTime: string;
  image: string;
  author: string;
  category: string;
  tags: string[];
  video?: string;
}

export function getAllPostSlugs(lang: string): string[] {
  return getRawBlogEntries(lang).map((entry) => entry.slug);
}

export async function getPostBySlug(lang: string, slug: string) {
  const entry = getRawBlogEntryBySlug(lang, slug);
  if (!entry) return null;

  const fm = entry.data as Partial<BlogFrontmatter>;

  const formatDate = (value: unknown): string => {
    if (value instanceof Date) {
      return value.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    }
    if (typeof value === "string") return value;
    return new Date().toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const meta: BlogMeta = {
    slug,
    lang,
    title: fm.title ?? slug,
    description: fm.description ?? "",
    date: formatDate(fm.date),
    ...(fm.lastModified && { lastModified: formatDate(fm.lastModified) }),
    author: fm.author ?? "",
    category: fm.category ?? "",
    tags: fm.tags ?? [],
    image: normalizeBlogImage(fm.image),
    ...(fm.video && { video: fm.video }),
    readTime: readingTime(entry.content).text,
  };

  return { meta, rawContent: entry.content } as const;
}

export function getAllPosts(lang: string): BlogMeta[] {
  const posts: { post: BlogMeta; originalDate: string | Date }[] = [];

  for (const entry of getRawBlogEntries(lang)) {
    const fm = entry.data as Partial<BlogFrontmatter>;
    const formatDate = (value: unknown): string => {
      if (value instanceof Date) {
        return value.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      }
      if (typeof value === "string") return value;
      return new Date().toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    };
    posts.push({
      post: {
        slug: entry.slug,
        lang,
        title: fm.title ?? entry.slug,
        description: fm.description ?? "",
        date: formatDate(fm.date),
        ...(fm.lastModified && { lastModified: formatDate(fm.lastModified) }),
        author: fm.author ?? "",
        category: fm.category ?? "",
        tags: fm.tags ?? [],
        image: normalizeBlogImage(fm.image),
        ...(fm.video && { video: fm.video }),
        readTime: readingTime(entry.content).text,
      },
      originalDate: fm.date ?? new Date(),
    });
  }

  // Sort by original date desc (most recent first)
  return posts
    .sort((a, b) => {
      const dateA = new Date(a.originalDate);
      const dateB = new Date(b.originalDate);
      return dateB.getTime() - dateA.getTime();
    })
    .map(({ post }) => post);
}

export function getFeaturedPosts(lang: string, limit: number = 2): BlogMeta[] {
  const allPosts = getAllPosts(lang);
  return allPosts.slice(0, limit);
}

export function getRecentPosts(
  lang: string,
  limit: number = 6,
  skip: number = 0
): BlogMeta[] {
  const allPosts = getAllPosts(lang);
  return allPosts.slice(skip, skip + limit);
}

export interface TagWithCount {
  name: string;
  count: number;
  slug: string;
}

export function getAllTags(lang: string): TagWithCount[] {
  const posts = getAllPosts(lang);
  const tagCounts = new Map<string, number>();

  // Count occurrences of each tag
  posts.forEach((post) => {
    post.tags.forEach((tag) => {
      if (tag.trim()) {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      }
    });
  });

  // Convert to array and sort by count (descending)
  return Array.from(tagCounts.entries())
    .map(([name, count]) => ({
      name,
      count,
      slug: encodeURIComponent(name.toLowerCase()),
    }))
    .sort((a, b) => b.count - a.count);
}
