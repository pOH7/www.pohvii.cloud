import fs from "fs";
import path from "path";

import matter from "gray-matter";
import readingTime from "reading-time";

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

const contentDir = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "content",
  "blog"
);

function getLangDir(lang: string) {
  return path.join(contentDir, lang);
}

export function getAllPostSlugs(lang: string): string[] {
  const dir = getLangDir(lang);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => f.replace(/\.(mdx?|MDX?)$/, ""));
}

export async function getPostBySlug(lang: string, slug: string) {
  const filePath = path.join(getLangDir(lang), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);

  const fm = data as Partial<BlogFrontmatter>;

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
    readTime: readingTime(content).text,
  };

  return { meta, rawContent: content } as const;
}

export function getAllPosts(lang: string): BlogMeta[] {
  const slugs = getAllPostSlugs(lang);
  const posts: { post: BlogMeta; originalDate: string | Date }[] = [];

  for (const slug of slugs) {
    const filePath = path.join(getLangDir(lang), `${slug}.mdx`);
    const raw = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(raw);
    const fm = data as Partial<BlogFrontmatter>;
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
        readTime: readingTime(content).text,
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
