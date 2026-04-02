import type { Metadata } from "next";
import type { BlogPost } from "@/components/blog";

export const SITE_URL = "https://www.pohvii.cloud";

export function withTrailingSlash(pathname: string): string {
  return pathname.endsWith("/") ? pathname : `${pathname}/`;
}

export function buildLanguageAlternates(
  supportedLangs: readonly string[],
  pathnameForLang: (lang: string) => string
): Record<string, string> {
  return supportedLangs.reduce(
    (acc, lang) => {
      acc[lang] = withTrailingSlash(pathnameForLang(lang));
      return acc;
    },
    {} as Record<string, string>
  );
}

export function buildListingMetadata(args: {
  title: string;
  description: string;
  canonicalPath: string;
  alternates: Record<string, string>;
  image: string;
  twitterImage: string;
}): Metadata {
  const canonicalPath = withTrailingSlash(args.canonicalPath);

  return {
    title: args.title,
    description: args.description,
    openGraph: {
      title: args.title,
      description: args.description,
      type: "website",
      url: canonicalPath,
      images: [
        {
          url: args.image,
          width: 1200,
          height: 630,
          alt: args.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: args.title,
      description: args.description,
      images: [args.twitterImage],
    },
    alternates: {
      canonical: canonicalPath,
      languages: args.alternates,
    },
  };
}

function toAbsoluteUrl(pathname: string): string {
  return new URL(pathname, SITE_URL).toString();
}

function toIsoDate(value?: string): string | undefined {
  if (!value) return undefined;

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
}

export function buildBlogPostingJsonLd(args: {
  post: BlogPost;
  lang: string;
  canonicalUrl: string;
}) {
  const homeUrl = toAbsoluteUrl(`/${args.lang}/`);
  const blogUrl = toAbsoluteUrl(`/${args.lang}/blog/`);
  const imageUrl = toAbsoluteUrl(args.post.image || "/og-default-blog.svg");
  const publishedTime = toIsoDate(args.post.date);
  const modifiedTime = toIsoDate(args.post.lastModified);

  return [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: args.post.title,
      description: args.post.description,
      url: args.canonicalUrl,
      mainEntityOfPage: args.canonicalUrl,
      image: [imageUrl],
      datePublished: publishedTime,
      ...(modifiedTime ? { dateModified: modifiedTime } : {}),
      author: {
        "@type": "Person",
        name: args.post.author || "Léon Zhang",
      },
      publisher: {
        "@type": "Organization",
        name: "Léon Zhang",
      },
      keywords: args.post.tags,
      ...(args.post.category ? { articleSection: args.post.category } : {}),
      inLanguage: args.lang,
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: args.lang === "zh" ? "首页" : "Home",
          item: homeUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: args.lang === "zh" ? "博客" : "Blog",
          item: blogUrl,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: args.post.title,
          item: args.canonicalUrl,
        },
      ],
    },
  ];
}
