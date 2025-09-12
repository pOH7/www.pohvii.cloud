import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import type { Element, ElementContent, Text } from "hast";
// Syntax highlighting
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - type definitions provided by package at runtime
import rehypePrettyCode from "rehype-pretty-code";

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  author?: string;
  category?: string;
  tags?: string[];
  image?: string;
  video?: string;
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
    author: fm.author ?? "",
    category: fm.category ?? "",
    tags: fm.tags ?? [],
    image: fm.image ?? "",
    ...(fm.video && { video: fm.video }),
    readTime: readingTime(content).text,
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
              const first: ElementContent | undefined = node.children?.[0];
              if (first && (first as Text).type === "text") {
                const v = (first as Text).value;
                const mark = v.trimStart().charAt(0);
                const leading = v.match(/^\s*/)?.[0] ?? "";
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
                  if (!node.properties) node.properties = {};
                  (node.properties as Record<string, unknown>)["data-diff"] =
                    map[mark];
                  (first as Text).value =
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

  return { meta, mdxSource, rawContent: content } as const;
}

export async function getAllPosts(lang: string): Promise<BlogMeta[]> {
  const slugs = getAllPostSlugs(lang);
  const posts: BlogMeta[] = [];

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
      slug,
      lang,
      title: fm.title ?? slug,
      description: fm.description ?? "",
      date: formatDate(fm.date),
      author: fm.author ?? "",
      category: fm.category ?? "",
      tags: fm.tags ?? [],
      image: fm.image ?? "",
      ...(fm.video && { video: fm.video }),
      readTime: readingTime(content).text,
    });
  }

  // Sort by date desc if possible
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getFeaturedPosts(
  lang: string,
  limit: number = 2
): Promise<BlogMeta[]> {
  const slugs = getAllPostSlugs(lang);
  const posts: BlogMeta[] = [];

  for (let i = 0; i < Math.min(slugs.length, limit); i++) {
    const slug = slugs[i];
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
      slug,
      lang,
      title: fm.title ?? slug,
      description: fm.description ?? "",
      date: formatDate(fm.date),
      author: fm.author ?? "",
      category: fm.category ?? "",
      tags: fm.tags ?? [],
      image: fm.image ?? "",
      ...(fm.video && { video: fm.video }),
      readTime: readingTime(content).text,
    });
  }

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function getRecentPosts(
  lang: string,
  limit: number = 6,
  skip: number = 0
): Promise<BlogMeta[]> {
  const slugs = getAllPostSlugs(lang);
  const posts: BlogMeta[] = [];

  // Process posts starting from skip index
  const endIndex = Math.min(slugs.length, skip + limit);
  for (let i = skip; i < endIndex; i++) {
    const slug = slugs[i];
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
      slug,
      lang,
      title: fm.title ?? slug,
      description: fm.description ?? "",
      date: formatDate(fm.date),
      author: fm.author ?? "",
      category: fm.category ?? "",
      tags: fm.tags ?? [],
      image: fm.image ?? "",
      ...(fm.video && { video: fm.video }),
      readTime: readingTime(content).text,
    });
  }

  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}

export interface TagWithCount {
  name: string;
  count: number;
  slug: string;
}

export async function getAllTags(lang: string): Promise<TagWithCount[]> {
  const posts = await getAllPosts(lang);
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
