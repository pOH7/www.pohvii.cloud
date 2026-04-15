import type { Element, Text } from "hast";
import type { Metadata } from "next";
import { MDXRemote } from "next-mdx-remote/rsc";
import { notFound, redirect } from "next/navigation";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
// Syntax highlighting
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { BlogArticle, type BlogPost } from "@/components/blog";
import { mdxComponents } from "@/components/mdx-components";
import { supportedLangs } from "@/lib/i18n";
import { parseSlugId, generateSlug } from "@/lib/post-id";
import rehypeNumberedHeadings from "@/lib/rehypeNumberedHeadings";
// Remove unused import - we'll use getAllPostsWithIds for related posts
import {
  getPostBySlugId,
  generateSelfHealingStaticParams,
  getAllPostsWithIds,
  getAdjacentPosts,
} from "@/lib/self-healing-blog";
import { buildBlogPostingJsonLd } from "@/lib/seo";

export async function generateMetadata(
  props: PageProps<"/[lang]/blog/[slug]">
): Promise<Metadata> {
  const params = props.params;
  const { lang, slug: slugWithId } = await params;

  // Try self-healing approach first
  const selfHealingResult = await getPostBySlugId(lang, slugWithId);

  if (!selfHealingResult) {
    return {
      title: "Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  const post = selfHealingResult.meta;
  const canonicalUrl = selfHealingResult.canonicalUrl;

  // Generate hreflang alternates for all supported languages
  const alternateLanguages = supportedLangs.reduce(
    (acc, supportedLang) => {
      if (post.id) {
        acc[supportedLang] =
          `/${supportedLang}/blog/${generateSlug(post.title)}-${post.id}`;
      }
      return acc;
    },
    {} as Record<string, string>
  );

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
      ...(post.lastModified && { modifiedTime: post.lastModified }),
      authors: [post.author || "Léon Zhang"],
      url: canonicalUrl, // Always use canonical URL
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
      canonical: canonicalUrl, // Critical: canonical URL for SEO
      languages: alternateLanguages, // Proper hreflang implementation
    },
  };
}

export default async function BlogDetailPage(
  props: PageProps<"/[lang]/blog/[slug]">
) {
  const { lang, slug: slugWithId } = await props.params;

  // Use self-healing blog functions
  const selfHealingResult = await getPostBySlugId(lang, slugWithId);
  if (!selfHealingResult) notFound();

  // Check if we need to redirect (self-healing URL)
  if (selfHealingResult.needsRedirect) {
    const { id } = parseSlugId(slugWithId);
    const correctSlug = generateSlug(selfHealingResult.meta.title);
    const correctUrl = `/${lang}/blog/${correctSlug}-${id}`;
    redirect(correctUrl); // 301 redirect to canonical URL
  }

  const mdx = selfHealingResult;

  const all = getAllPostsWithIds(lang);
  const adjacentPosts = getAdjacentPosts(all, mdx.meta.slug, mdx.meta.id);
  const relatedPosts: BlogPost[] = all
    .filter((p) => p.id !== mdx.meta.id && p.slug !== mdx.meta.slug)
    .slice(0, 2)
    .map((p) => ({
      slug: p.slug,
      title: p.title,
      description: p.description,
      image: p.image,
      date: p.date,
      ...(p.lastModified && { lastModified: p.lastModified }),
      readTime: p.readTime,
      author: p.author,
      category: p.category,
      tags: p.tags,
      id: p.id,
    }));

  const post: BlogPost = {
    slug: mdx.meta.slug,
    title: mdx.meta.title,
    description: mdx.meta.description,
    image: mdx.meta.image,
    ...(mdx.meta.video && { video: mdx.meta.video }),
    date: mdx.meta.date,
    ...(mdx.meta.lastModified && { lastModified: mdx.meta.lastModified }),
    readTime: mdx.meta.readTime,
    author: mdx.meta.author,
    category: mdx.meta.category,
    tags: mdx.meta.tags,
    id: mdx.meta.id,
  };

  const jsonLd = buildBlogPostingJsonLd({
    post,
    lang,
    canonicalUrl: selfHealingResult.canonicalUrl,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogArticle
        post={post}
        relatedPosts={relatedPosts}
        adjacentPosts={adjacentPosts}
        lang={lang}
        markdownSource={mdx.rawContent}
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
                      const first = node.children[0];
                      // oxlint-disable-next-line typescript/no-unnecessary-condition
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
                          // oxlint-disable-next-line typescript/no-unnecessary-condition
                          if (!node.properties) node.properties = {};
                          (node.properties as Record<string, unknown>)[
                            "data-diff"
                          ] = map[mark];
                          // remove the marker and following optional space
                          first.value =
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
                    content: {
                      type: "text",
                      value: "",
                    },
                  },
                ],
              ],
            },
          }}
        />
      </BlogArticle>
    </>
  );
}

export async function generateStaticParams() {
  // Use the new self-healing static params generation
  return await generateSelfHealingStaticParams();
}
