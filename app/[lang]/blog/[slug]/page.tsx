import { notFound } from "next/navigation";
import { BlogArticle, type BlogPost } from "@/components/blog";
import { getAllPosts, getPostBySlug } from "@/lib/blog";
import { supportedLangs } from "@/lib/i18n";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxComponents } from "@/components/mdx-components";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeNumberedHeadings from "@/lib/rehypeNumberedHeadings";
import type { Element, ElementContent, Text } from "hast";
import type { Metadata } from "next";
// Syntax highlighting
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - type definitions provided by package at runtime
import rehypePrettyCode from "rehype-pretty-code";

interface BlogDetailPageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { lang, slug } = await params;
  const mdx = await getPostBySlug(lang, slug);

  if (!mdx) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const post = mdx.meta;
  const baseUrl = "https://www.pohvii.cloud";
  const postUrl = `${baseUrl}/${lang}/blog/${slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    authors: [{ name: post.author || "Léon Zhang" }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.date,
      authors: [post.author || "Léon Zhang"],
      url: postUrl,
      images: [
        {
          url: post.image || "/og-default-blog.svg",
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      tags: post.tags,
      section: post.category,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image || "/twitter-default-blog.svg"],
    },
    alternates: {
      canonical: postUrl,
    },
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { lang, slug } = await params;

  const mdx = await getPostBySlug(lang, slug);
  if (!mdx) notFound();

  const all = await getAllPosts(lang);
  const relatedPosts: BlogPost[] = all
    .filter((p) => p.slug !== slug)
    .slice(0, 2)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      image: p.image ?? "",
      date: p.date,
      readTime: p.readTime,
      author: p.author ?? "",
      category: p.category ?? "",
      tags: p.tags ?? [],
    }));

  const post: BlogPost = {
    slug,
    title: mdx.meta.title,
    description: mdx.meta.description,
    image: mdx.meta.image ?? "",
    ...(mdx.meta.video && { video: mdx.meta.video }),
    date: mdx.meta.date,
    readTime: mdx.meta.readTime,
    author: mdx.meta.author ?? "",
    category: mdx.meta.category ?? "",
    tags: mdx.meta.tags ?? [],
  };

  return (
    <BlogArticle
      post={post}
      relatedPosts={relatedPosts}
      lang={lang}
      utterancesRepo="pOH7/www.pohvii.cloud"
    >
      <MDXRemote
        source={mdx.rawContent}
        components={mdxComponents}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              // Ensure slug IDs are based on the original text (without numbers)
              rehypeSlug,
              // Then prefix visible headings with hierarchical numbers
              rehypeNumberedHeadings,
              // Syntax highlighting via Shiki
              [
                rehypePrettyCode,
                {
                  keepBackground: false,
                  theme: {
                    light: "github-light-default",
                    dark: "github-dark-default",
                  },
                  onVisitLine(node: Element) {
                    // Prevent lines from collapsing so copy/select keeps structure
                    if (node.children.length === 0) {
                      const space: Text = { type: "text", value: " " };
                      node.children = [space];
                    }
                    // Diff-style detection: + added, - removed, ~ changed
                    const first: ElementContent | undefined =
                      node.children?.[0];
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
                        (node.properties as Record<string, unknown>)[
                          "data-diff"
                        ] = map[mark];
                        // remove the marker and following optional space
                        (first as Text).value =
                          leading + v.trimStart().slice(1).replace(/^\s/, "");
                      }
                    }
                  },
                },
              ],
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "prepend",
                  properties: {
                    className: ["heading-anchor"],
                    ariaLabel: "Link to this section",
                  },
                  // Inline SVG link icon (Lucide "link-2" style)
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
                              d: "M14 11a5 5 0 0 0-7.07 0L5.5 12.43a5 5 0 0 0 7.07 7.07L14 19",
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
          },
        }}
      />
    </BlogArticle>
  );
}

export async function generateStaticParams() {
  const params: { lang: string; slug: string }[] = [];
  for (const lang of supportedLangs) {
    const posts = await getAllPosts(lang);
    for (const post of posts) {
      params.push({ lang, slug: post.slug });
    }
  }
  return params;
}
