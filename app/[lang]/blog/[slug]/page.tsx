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

interface BlogDetailPageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
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
              [
                rehypeAutolinkHeadings,
                {
                  behavior: "wrap",
                  properties: { className: ["heading-anchor"] },
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
