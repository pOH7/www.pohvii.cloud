import { TagLinksFooter } from "@/components/footer";
import { BlogIndexClient } from "@/components/blog/blog-index-client";
import { supportedLangs } from "@/lib/i18n";
import type { Metadata } from "next";
import { buildLanguageAlternates, buildListingMetadata } from "@/lib/seo";
import { getBlogDiscoveryPosts, getBlogDiscoveryTags } from "@/lib/blog-feed";

export default async function BlogPage(props: PageProps<"/[lang]/blog">) {
  const { lang } = await props.params;
  const posts = getBlogDiscoveryPosts(lang);
  const tags = getBlogDiscoveryTags(lang);
  const footerTags = tags.map((tag) => tag.name).slice(0, 10);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <BlogIndexClient lang={lang} posts={posts} tags={tags} />
      <TagLinksFooter allTags={footerTags} lang={lang} />
    </div>
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]/blog">
): Promise<Metadata> {
  const { lang } = await props.params;
  const description =
    "Discover my latest articles and tutorials about web development, Java, Spring Boot, React, TypeScript, and software engineering best practices.";
  const canonicalPath = `/${lang}/blog/`;

  return {
    keywords: [
      "Tech Blog",
      "Web Development",
      "Java",
      "Spring Boot",
      "React",
      "TypeScript",
      "Software Engineering",
      "Programming Tutorials",
      "Technical Writing",
    ],
    ...buildListingMetadata({
      title: "Blog",
      description,
      canonicalPath,
      alternates: buildLanguageAlternates(
        supportedLangs,
        (supportedLang) => `/${supportedLang}/blog/`
      ),
      image: "/og-blog.svg",
      twitterImage: "/twitter-blog.svg",
    }),
  };
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
