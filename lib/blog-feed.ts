import { getAllTags, type TagWithCount } from "./blog";
import { getRawBlogEntries } from "./blog-content";
import { supportedLangs } from "./i18n";
import { combineSlugId, generateSlug } from "./post-id";
import { getAllPostsWithIds } from "./self-healing-blog";

const siteUrl = "https://www.pohvii.cloud";

export interface BlogDiscoveryPost {
  slug: string;
  title: string;
  description: string;
  date: string;
  lastModified?: string;
  readTime: string;
  tags: string[];
  image: string;
}

export type BlogDiscoveryTag = TagWithCount;

export interface BlogFeedItem {
  title: string;
  description: string;
  link: string;
  guid: string;
  pubDate: Date;
  categories: string[];
}

interface BlogFeedFrontmatter {
  title?: string;
  description?: string;
  date?: string | Date;
  lastModified?: string | Date;
  author?: string;
  category?: string;
  tags?: string[];
  image?: string;
  id?: string;
}

function toValidDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }
  return new Date();
}

function normalizePostId(value: unknown): string {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return "";
}

function getCanonicalSlug(title: string, id?: string) {
  const slug = generateSlug(title);
  return id ? combineSlugId(slug, id) : slug;
}

export function getBlogDiscoveryPosts(lang: string): BlogDiscoveryPost[] {
  return getAllPostsWithIds(lang).map((post) => ({
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    ...(post.lastModified && { lastModified: post.lastModified }),
    readTime: post.readTime,
    tags: post.tags,
    image: post.image,
  }));
}

export function getBlogDiscoveryTags(lang: string): TagWithCount[] {
  return getAllTags(lang);
}

function readFeedItemsForLang(lang: string): BlogFeedItem[] {
  return getRawBlogEntries(lang)
    .map((entry) => {
      const fm = entry.data as BlogFeedFrontmatter;
      const title = fm.title?.trim() || entry.slug;
      const id = normalizePostId(fm.id);
      const canonicalSlug = getCanonicalSlug(title, id || undefined);
      const pubDate = toValidDate(fm.lastModified ?? fm.date);

      return {
        title,
        description: fm.description?.trim() || "",
        link: `${siteUrl}/${lang}/blog/${canonicalSlug}`,
        guid: `${siteUrl}/${lang}/blog/${canonicalSlug}`,
        pubDate,
        categories: (fm.tags ?? []).filter(Boolean),
      };
    })
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

export function getBlogFeedItems(limit = 50): BlogFeedItem[] {
  return supportedLangs
    .flatMap((lang) => readFeedItemsForLang(lang))
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime())
    .slice(0, limit);
}
