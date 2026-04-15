import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";

import {
  BlogIndexClient,
  BLOG_POSTS_PER_PAGE,
} from "@/components/blog/blog-index-client";
import { TagLinksFooter } from "@/components/footer";
import { getBlogDiscoveryPosts, getBlogDiscoveryTags } from "@/lib/blog-feed";
import { supportedLangs } from "@/lib/i18n";
import { getAllPostsWithIds } from "@/lib/self-healing-blog";
import { buildLanguageAlternates, buildListingMetadata } from "@/lib/seo";

export default async function BlogPaginationPage(
  props: PageProps<"/[lang]/blog/page/[pageNumber]">
) {
  const { lang, pageNumber } = await props.params;
  const currentPage = parseInt(pageNumber, 10);

  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  // Redirect page 1 to /blog
  if (currentPage === 1) {
    redirect(`/${lang}/blog`);
  }

  const allPosts = getAllPostsWithIds(lang);
  const totalPages = Math.ceil(allPosts.length / BLOG_POSTS_PER_PAGE);

  if (currentPage > totalPages) {
    notFound();
  }

  const posts = getBlogDiscoveryPosts(lang);
  const tags = getBlogDiscoveryTags(lang);
  const footerTags = tags.map((tag) => tag.name).slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <BlogIndexClient
        lang={lang}
        posts={posts}
        tags={tags}
        currentPage={currentPage}
      />
      <TagLinksFooter allTags={footerTags} lang={lang} />
    </div>
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]/blog/page/[pageNumber]">
): Promise<Metadata> {
  const { lang, pageNumber } = await props.params;
  const page = parseInt(pageNumber, 10);
  return buildListingMetadata({
    title: `Blog - Page ${page}`,
    description: `Browse blog articles - Page ${page}. Discover articles about web development, React, TypeScript, and more.`,
    canonicalPath: `/${lang}/blog/page/${page}/`,
    alternates: buildLanguageAlternates(
      supportedLangs,
      (supportedLang) => `/${supportedLang}/blog/page/${page}/`
    ),
    image: "/og-blog.svg",
    twitterImage: "/twitter-blog.svg",
  });
}

export function generateStaticParams() {
  const allParams: { lang: string; pageNumber: string }[] = [];
  for (const lang of supportedLangs) {
    const allPosts = getAllPostsWithIds(lang);
    const totalPages = Math.ceil(allPosts.length / BLOG_POSTS_PER_PAGE) || 1;
    for (let page = 2; page <= totalPages; page++) {
      allParams.push({ lang, pageNumber: String(page) });
    }
  }
  return allParams;
}
