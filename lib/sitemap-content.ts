import { getRawBlogEntries } from "./blog-content";
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
  return getRawBlogEntries(locale).map((entry) => {
    const frontmatter = entry.data as Partial<BlogFrontmatter>;
    const title = frontmatter.title?.trim() || entry.slug;
    const postId = normalizePostId(frontmatter.id);
    const lastModified = getFrontmatterDate(entry.data);

    return {
      canonicalSlug: postId
        ? combineSlugId(generateSlug(title), postId)
        : generateSlug(title),
      ...(lastModified && { lastModified }),
    };
  });
}
