import fs from "fs";
import path from "path";

import matter from "gray-matter";

import { combineSlugId, generateSlug } from "./post-id";

interface BlogFrontmatter {
  title?: string;
  id?: string;
  date?: string;
  lastModified?: string;
}

export interface SitemapBlogEntry {
  canonicalSlug: string;
  lastModified?: Date;
}

const BLOG_CONTENT_DIR = path.join(
  /*turbopackIgnore: true*/ process.cwd(),
  "content",
  "blog"
);

function getBlogLangDir(locale: string) {
  return path.join(BLOG_CONTENT_DIR, locale);
}

function normalizePostId(value: unknown): string {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }

  return "";
}

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

export function getSitemapBlogEntries(locale: string): SitemapBlogEntry[] {
  const dir = getBlogLangDir(locale);
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(".mdx") || file.endsWith(".md"))
    .map((file) => {
      const filePath = path.join(dir, file);
      const slug = file.replace(/\.(mdx?|MDX?)$/, "");
      const raw = fs.readFileSync(filePath, "utf8");
      const { data } = matter(raw);
      const frontmatter = data as Partial<BlogFrontmatter>;
      const title = frontmatter.title?.trim() || slug;
      const postId = normalizePostId(frontmatter.id);
      const lastModified = getFrontmatterDate(data);

      return {
        canonicalSlug: postId
          ? combineSlugId(generateSlug(title), postId)
          : generateSlug(title),
        ...(lastModified && { lastModified }),
      };
    });
}
