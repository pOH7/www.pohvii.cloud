import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { serialize } from "next-mdx-remote/serialize";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";

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
        rehypeSlug,
        [
          rehypeAutolinkHeadings,
          {
            behavior: "wrap",
            properties: { className: ["heading-anchor"] },
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
