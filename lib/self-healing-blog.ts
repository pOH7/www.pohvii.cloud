import readingTime from "reading-time";

import { getRawBlogEntries, getRawBlogEntryBySlug } from "./blog-content";
import { normalizeBlogImage } from "./blog-image";
import {
  parseSlugId,
  generateSlug,
  generateCanonicalUrl,
  combineSlugId,
} from "./post-id";

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
  id?: string; // Added for self-healing URLs
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
  id: string; // Required for self-healing URLs
}

export interface SelfHealingResult {
  meta: BlogMeta;
  sourceSlug: string;
  rawContent: string;
  needsRedirect: boolean;
  canonicalUrl: string;
}

function normalizePostId(value: unknown): string {
  if (typeof value === "string") return value.trim().toLowerCase();
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.trunc(value));
  }
  return "";
}

export function getAllPostSlugs(lang: string): string[] {
  return getRawBlogEntries(lang).map((entry) => entry.slug);
}

/**
 * Get a post by its unique ID
 */
export async function getPostById(
  lang: string,
  id: string
): Promise<SelfHealingResult | null> {
  for (const entry of getRawBlogEntries(lang)) {
    const fm = entry.data as Partial<BlogFrontmatter>;

    if (normalizePostId(fm.id) === id) {
      return await buildSelfHealingResult(lang, entry.content, fm, entry.slug);
    }
  }

  return null;
}

/**
 * Enhanced getPostBySlug that handles self-healing URLs
 */
export async function getPostBySlugId(
  lang: string,
  slugWithId: string
): Promise<SelfHealingResult | null> {
  const { slug: providedSlug, id } = parseSlugId(slugWithId);

  // If we have an ID, try to find by ID first (most reliable)
  if (id) {
    const postById = await getPostById(lang, id);
    if (postById) {
      const currentSlug = generateSlug(postById.meta.title);
      const needsRedirect = providedSlug !== currentSlug;

      return {
        ...postById,
        needsRedirect,
        canonicalUrl: generateCanonicalUrl(
          "https://www.pohvii.cloud",
          lang,
          postById.meta.title,
          id
        ),
      };
    }
  }

  // Fallback: try to find by slug (legacy support)
  return await getPostBySlugLegacy(lang, providedSlug);
}

/**
 * Legacy slug lookup for backward compatibility
 */
async function getPostBySlugLegacy(
  lang: string,
  slug: string
): Promise<SelfHealingResult | null> {
  const entry = getRawBlogEntryBySlug(lang, slug);
  if (!entry) return null;

  const fm = entry.data as Partial<BlogFrontmatter>;

  return await buildSelfHealingResult(lang, entry.content, fm, slug);
}

/**
 * Build a standardized result object
 */
async function buildSelfHealingResult(
  lang: string,
  content: string,
  fm: Partial<BlogFrontmatter>,
  fallbackSlug: string
): Promise<SelfHealingResult> {
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

  const title = fm.title ?? fallbackSlug;
  const currentSlug = generateSlug(title);
  const postId = normalizePostId(fm.id);

  const meta: BlogMeta = {
    slug: currentSlug,
    lang,
    title,
    description: fm.description ?? "",
    date: formatDate(fm.date),
    ...(fm.lastModified && { lastModified: formatDate(fm.lastModified) }),
    author: fm.author ?? "",
    category: fm.category ?? "",
    tags: fm.tags ?? [],
    image: normalizeBlogImage(fm.image),
    ...(fm.video && { video: fm.video }),
    readTime: readingTime(content).text,
    id: postId,
  };

  const canonicalUrl = postId
    ? generateCanonicalUrl("https://www.pohvii.cloud", lang, title, postId)
    : `https://www.pohvii.cloud/${lang}/blog/${currentSlug}`;

  return {
    meta,
    sourceSlug: fallbackSlug,
    rawContent: content,
    needsRedirect: false, // Will be set by caller if needed
    canonicalUrl,
  };
}

/**
 * Get all posts with self-healing URL format
 */
export function getAllPostsWithIds(lang: string): BlogMeta[] {
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

    const title = fm.title ?? entry.slug;
    const currentSlug = generateSlug(title);
    const postId = normalizePostId(fm.id);

    posts.push({
      post: {
        slug: postId ? combineSlugId(currentSlug, postId) : currentSlug, // Use slug-id format if ID exists
        lang,
        title,
        description: fm.description ?? "",
        date: formatDate(fm.date),
        ...(fm.lastModified && { lastModified: formatDate(fm.lastModified) }),
        author: fm.author ?? "",
        category: fm.category ?? "",
        tags: fm.tags ?? [],
        image: normalizeBlogImage(fm.image),
        ...(fm.video && { video: fm.video }),
        readTime: readingTime(entry.content).text,
        id: postId,
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

export interface AdjacentPosts {
  previous?: BlogMeta;
  next?: BlogMeta;
}

export function getAdjacentPosts(
  posts: BlogMeta[],
  currentSlug: string,
  currentId?: string
): AdjacentPosts {
  const currentIndex = posts.findIndex((post) => {
    if (post.slug === currentSlug) {
      return true;
    }

    if (!currentId) {
      return false;
    }

    return (
      post.id === currentId ||
      post.slug === combineSlugId(currentSlug, currentId)
    );
  });

  if (currentIndex === -1) {
    return {};
  }

  const adjacentPosts: AdjacentPosts = {};

  if (currentIndex > 0) {
    adjacentPosts.previous = posts[currentIndex - 1];
  }

  if (currentIndex < posts.length - 1) {
    adjacentPosts.next = posts[currentIndex + 1];
  }

  return adjacentPosts;
}

/**
 * Get featured posts with self-healing URL format
 */
export function getFeaturedPostsWithIds(
  lang: string,
  limit: number = 2
): BlogMeta[] {
  const allPosts = getAllPostsWithIds(lang);
  return allPosts.slice(0, limit);
}

/**
 * Generate static params for all posts with self-healing URLs
 */
export async function generateSelfHealingStaticParams(): Promise<
  { lang: string; slug: string }[]
> {
  const params: { lang: string; slug: string }[] = [];

  // Import supported languages from i18n
  const { supportedLangs } = await import("./i18n");

  for (const lang of supportedLangs) {
    const posts = getAllPostsWithIds(lang);
    for (const post of posts) {
      params.push({
        lang,
        slug: post.id
          ? combineSlugId(generateSlug(post.title), post.id)
          : generateSlug(post.title),
      });
    }
  }

  return params;
}
