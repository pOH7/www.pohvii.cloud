import matter from "gray-matter";
import type { ComponentType } from "react";

export type BlogMdxComponent = ComponentType<{
  components?: Record<string, unknown>;
}>;

const blogModules = import.meta.glob<string>("../content/blog/**/*.{md,mdx}", {
  eager: true,
  import: "default",
  query: "?blog-raw",
});
const blogComponentModules = import.meta.glob<{ default: BlogMdxComponent }>(
  "../content/blog/**/*.{md,mdx}",
  {
    eager: true,
  }
);

export interface RawBlogEntry {
  lang: string;
  slug: string;
  content: string;
  data: Record<string, unknown>;
}

function parseBlogModulePath(modulePath: string) {
  const normalizedPath = modulePath.replace(/\\/g, "/");
  const match = normalizedPath.match(
    /(?:^|\/)content\/blog\/([^/]+)\/([^/]+)\.(?:md|mdx)$/i
  );

  if (!match) return null;

  return {
    lang: match[1],
    slug: match[2],
  };
}

const blogEntries = Object.entries(blogModules)
  .flatMap(([modulePath, raw]) => {
    const parsed = parseBlogModulePath(modulePath);
    if (!parsed) return [];

    const { content, data } = matter(raw);

    return [
      {
        lang: parsed.lang,
        slug: parsed.slug,
        content,
        data,
      },
    ];
  })
  .filter((entry) => entry.lang && entry.slug);

export function getRawBlogEntries(lang: string): RawBlogEntry[] {
  return blogEntries.filter((entry) => entry.lang === lang);
}

export function getRawBlogEntryBySlug(
  lang: string,
  slug: string
): RawBlogEntry | undefined {
  return blogEntries.find(
    (entry) => entry.lang === lang && entry.slug === slug
  );
}

export function getBlogMdxComponent(
  lang: string,
  slug: string
): BlogMdxComponent | undefined {
  for (const [modulePath, module] of Object.entries(blogComponentModules)) {
    const parsed = parseBlogModulePath(modulePath);
    if (parsed?.lang === lang && parsed.slug === slug) {
      return module.default;
    }
  }

  return undefined;
}
