"use client";

import { useRef, memo, type RefObject } from "react";
import Link from "next/link";
import { ArrowLeft, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type BlogArticleProps } from "./blog-article";
import { TableOfContents } from "./table-of-contents";
import { ArticleHeader } from "./article-header";
import { GiscusComments } from "./giscus-comments";
import { RelatedPosts } from "./related-posts";
import { useReadingProgress } from "@/hooks/use-reading-progress";

export function BlogArticleWithTOC({
  post,
  relatedPosts = [],
  lang = "en",
  children,
}: BlogArticleProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-clip">
      <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-4 md:px-8">
        <Link href={`/${lang}/blog`}>
          <Button variant="outline" className="inline-flex items-center gap-2">
            <ArrowLeft className="size-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      <div className="mx-auto mb-8 w-full max-w-6xl px-4 md:px-8">
        <ArticleHeader
          title={post.title}
          description={post.description}
          image={post.image}
          {...(post.video && { video: post.video })}
          date={post.date}
          readTime={post.readTime}
          author={post.author}
          category={post.category}
          tags={post.tags}
          lang={lang}
          onScrollToComments={scrollToComments}
        />
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-start gap-8 px-4 md:px-8">
        <MemoizedBlogArticle contentRef={contentRef}>
          {children}
        </MemoizedBlogArticle>

        <MemoizedArticleTOC contentRef={contentRef} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div id="comments">
          <GiscusComments term={post.id} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <RelatedPosts posts={relatedPosts} lang={lang} maxPosts={2} />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <footer className="mb-12 border-t [border-top-style:dotted] pt-8">
          <div className="mb-6 flex items-center gap-2 text-xs">
            <Folder className="text-primary size-4" />
            <span className="text-primary">{post.category}</span>
          </div>

          <div className="flex items-center justify-between">
            <Link href={`/${lang}/blog`}>
              <Button
                variant="outline"
                className="inline-flex items-center gap-2"
              >
                <ArrowLeft className="size-4" />
                All Posts
              </Button>
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

interface BlogArticleContentProps {
  contentRef: RefObject<HTMLDivElement | null>;
  children?: BlogArticleProps["children"];
}

function BlogArticleContent({ contentRef, children }: BlogArticleContentProps) {
  return (
    <article className="max-w-4xl min-w-0 flex-1">
      <div ref={contentRef} className="blog-article-content mb-12">
        {children}
      </div>
    </article>
  );
}

interface ArticleTOCProps {
  contentRef: RefObject<HTMLDivElement | null>;
}

function ArticleTOC({ contentRef }: ArticleTOCProps) {
  const { activeSection, tocItems, scrollToSection } =
    useReadingProgress(contentRef);

  return (
    <TableOfContents
      items={tocItems}
      activeSection={activeSection}
      onItemClick={scrollToSection}
    />
  );
}

const MemoizedBlogArticle = memo(BlogArticleContent);
const MemoizedArticleTOC = memo(ArticleTOC);

export const MemoizedBlogArticleWithTOC = memo(BlogArticleWithTOC);
