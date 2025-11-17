import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Element, Text } from "hast";
// Syntax highlighting

import rehypePrettyCode from "rehype-pretty-code";
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
  author?: string;
  category?: string;
  tags?: string[];
  image?: string;
  video?: string;
  id?: string; // Added for self-healing URLs
}

export interface BlogMeta
  extends Omit<
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
  mdxSource: Awaited<ReturnType<typeof serialize>>;
  rawContent: string;
  needsRedirect: boolean;
  canonicalUrl: string;
}

const contentDir = path.join(process.cwd(), "content", "blog");

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

/**
 * Get a post by its unique ID
 */
export async function getPostById(
  lang: string,
  id: string
): Promise<SelfHealingResult | null> {
  const dir = getLangDir(lang);
  if (!fs.existsSync(dir)) return null;

  const files = fs.readdirSync(dir);

  for (const file of files) {
    if (!file.endsWith(".mdx") && !file.endsWith(".md")) continue;

    const filePath = path.join(dir, file);
    const raw = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(raw);
    const fm = data as Partial<BlogFrontmatter>;

    if (fm.id === id) {
      return await buildSelfHealingResult(lang, content, fm, "");
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
  const filePath = path.join(getLangDir(lang), `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const { content, data } = matter(raw);
  const fm = data as Partial<BlogFrontmatter>;

  return await buildSelfHealingResult(lang, content, fm, slug);
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
  const postId = fm.id ?? "";

  const meta: BlogMeta = {
    slug: currentSlug,
    lang,
    title,
    description: fm.description ?? "",
    date: formatDate(fm.date),
    author: fm.author ?? "",
    category: fm.category ?? "",
    tags: fm.tags ?? [],
    image: fm.image ?? "",
    ...(fm.video && { video: fm.video }),
    readTime: readingTime(content).text,
    id: postId,
  };

  const mdxSource = await serialize(content, {
    mdxOptions: {
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        [
          rehypePrettyCode,
          {
            keepBackground: false,
            theme: {
              light: "github-light-default",
              dark: "github-dark-default",
            },
            onVisitLine(node: Element) {
              if (node.children.length === 0) {
                const space: Text = { type: "text", value: " " };
                node.children = [space];
              }
              const first = node.children[0];
              // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
              if (first && "type" in first && first.type === "text") {
                const v = first.value;
                const mark = v.trimStart().charAt(0);
                const leading = v.match(/^\s*/)?.[0] || "";
                if (
                  mark === "+" ||
                  mark === "-" ||
                  mark === "~" ||
                  mark === "!"
                ) {
                  const map: Record<string, string> = {
                    "+": "add",
                    "-": "remove",
                    "~": "change",
                    "!": "change",
                  };
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                  if (!node.properties) node.properties = {};
                  (node.properties as Record<string, unknown>)["data-diff"] =
                    map[mark];
                  first.value =
                    leading + v.trimStart().slice(1).replace(/^\s/, "");
                }
              }
            },
          },
        ],
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "prepend",
            properties: {
              className: ["heading-anchor"],
              ariaLabel: "Link to this section",
            },
            content: {
              type: "element",
              tagName: "span",
              properties: {
                className: ["heading-link-icon"],
                ariaHidden: "true",
              },
              children: [
                {
                  type: "element",
                  tagName: "svg",
                  properties: {
                    viewBox: "0 0 24 24",
                    fill: "none",
                    stroke: "currentColor",
                    strokeWidth: 2,
                    strokeLinecap: "round",
                    strokeLinejoin: "round",
                    ariaHidden: "true",
                    focusable: "false",
                  },
                  children: [
                    {
                      type: "element",
                      tagName: "path",
                      properties: {
                        d: "M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5",
                      },
                      children: [],
                    },
                    {
                      type: "element",
                      tagName: "path",
                      properties: {
                        d: "M14 11a 5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 0 0 7.07 7.07L14 19",
                      },
                      children: [],
                    },
                  ],
                },
              ],
            },
          },
        ],
      ],
      development: process.env.NODE_ENV === "development",
    },
    parseFrontmatter: false,
  });

  const canonicalUrl = postId
    ? generateCanonicalUrl("https://www.pohvii.cloud", lang, title, postId)
    : `https://www.pohvii.cloud/${lang}/blog/${currentSlug}`;

  return {
    meta,
    mdxSource,
    rawContent: content,
    needsRedirect: false, // Will be set by caller if needed
    canonicalUrl,
  };
}

/**
 * Get all posts with self-healing URL format
 */
export function getAllPostsWithIds(lang: string): BlogMeta[] {
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

    const title = fm.title ?? slug;
    const currentSlug = generateSlug(title);

    posts.push({
      post: {
        slug: fm.id ? combineSlugId(currentSlug, fm.id) : currentSlug, // Use slug-id format if ID exists
        lang,
        title,
        description: fm.description ?? "",
        date: formatDate(fm.date),
        author: fm.author ?? "",
        category: fm.category ?? "",
        tags: fm.tags ?? [],
        image: fm.image ?? "",
        ...(fm.video && { video: fm.video }),
        readTime: readingTime(content).text,
        id: fm.id ?? "",
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
