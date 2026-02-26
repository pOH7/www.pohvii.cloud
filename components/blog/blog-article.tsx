"use client";

import { memo, useCallback, useRef, type RefObject } from "react";
import Link from "next/link";
import { ArrowLeft, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleHeader } from "./article-header";
import { TableOfContents } from "./table-of-contents";
import { GiscusComments } from "./giscus-comments";
import { RelatedPosts } from "./related-posts";
import { useReadingProgress } from "@/hooks/use-reading-progress";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  video?: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  id: string;
}

export interface BlogArticleProps {
  post: BlogPost;
  markdownSource: string;
  relatedPosts?: BlogPost[];
  lang?: string;
  children?: React.ReactNode;
}

export function BlogArticle({
  post,
  markdownSource,
  relatedPosts = [],
  lang = "en",
  children,
}: BlogArticleProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  const scrollToComments = useCallback(() => {
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const copyMarkdown = useCallback(async (): Promise<boolean> => {
    const titleMarkdown = `# ${post.title}`.trim();
    const bodyMarkdown = markdownSource.trim();
    const markdownToCopy = bodyMarkdown
      ? `${titleMarkdown}\n\n${bodyMarkdown}`
      : titleMarkdown;

    try {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if ("clipboard" in navigator && navigator.clipboard) {
        await navigator.clipboard.writeText(markdownToCopy);
      } else {
        throw new Error("clipboard API not available");
      }
      return true;
    } catch {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = markdownToCopy;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand("copy");
        document.body.removeChild(textarea);
        return copied;
      } catch {
        return false;
      }
    }
  }, [markdownSource, post.title]);

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
        <MemoizedArticleHeader
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
          onCopyMarkdown={copyMarkdown}
        />
      </div>

      <div className="mx-auto flex w-full max-w-6xl items-start gap-8 px-4 md:px-8">
        <MemoizedBlogArticleContent contentRef={contentRef}>
          {children}
        </MemoizedBlogArticleContent>

        <MemoizedArticleTOC contentRef={contentRef} />
      </div>

      <MemoizedArticleFooter category={post.category} lang={lang} />

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div id="comments">
          <MemoizedGiscusComments term={post.id} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-10 md:px-8">
        <MemoizedRelatedPosts posts={relatedPosts} lang={lang} maxPosts={2} />
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

interface ArticleFooterProps {
  category: string;
  lang: string;
}

function ArticleFooter({ category, lang }: ArticleFooterProps) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
      <footer className="mb-12 border-t [border-top-style:dotted] pt-8">
        <div className="mb-6 flex items-center gap-2 text-xs">
          <Folder className="text-primary size-4" />
          <span className="text-primary">{category}</span>
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
  );
}

const MemoizedBlogArticleContent = memo(BlogArticleContent);
const MemoizedArticleTOC = memo(ArticleTOC);
const MemoizedArticleHeader = memo(ArticleHeader);
const MemoizedArticleFooter = memo(ArticleFooter);
const MemoizedGiscusComments = memo(GiscusComments);
const MemoizedRelatedPosts = memo(RelatedPosts);
