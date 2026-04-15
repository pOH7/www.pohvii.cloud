"use client";

import { useLenis } from "lenis/react";
import { ArrowLeft, Folder } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useRef, type RefObject } from "react";

import { Button } from "@/components/ui/button";
import { useReadingProgress } from "@/hooks/use-reading-progress";

import { ArticleHeader } from "./article-header";
import { GiscusComments } from "./giscus-comments";
import { KeepReading } from "./keep-reading";
import { RelatedPosts } from "./related-posts";
import { TableOfContents } from "./table-of-contents";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  video?: string;
  date: string;
  lastModified?: string;
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
  adjacentPosts?: {
    previous?: BlogPost;
    next?: BlogPost;
  };
  lang?: string;
  children?: React.ReactNode;
}

export function BlogArticle({
  post,
  markdownSource,
  relatedPosts = [],
  adjacentPosts,
  lang = "en",
  children,
}: BlogArticleProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const lenis = useLenis();

  const getScrollOffset = useCallback((element: HTMLElement) => {
    const computed = window.getComputedStyle(element);
    const parsed = parseFloat(
      (computed.scrollMarginTop as unknown as string) || "0"
    );

    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 96;
  }, []);

  const scrollToComments = useCallback(() => {
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      const headerOffset = getScrollOffset(commentsSection);
      const targetTop = Math.max(
        0,
        window.scrollY +
          commentsSection.getBoundingClientRect().top -
          headerOffset
      );

      if (lenis) {
        lenis.scrollTo(targetTop, {
          duration: 1.2,
        });
        return;
      }

      window.scrollTo({ top: targetTop });
    }
  }, [getScrollOffset, lenis]);

  const copyMarkdown = useCallback(async (): Promise<boolean> => {
    const titleMarkdown = `# ${post.title}`.trim();
    const bodyMarkdown = markdownSource.trim();
    const markdownToCopy = bodyMarkdown
      ? `${titleMarkdown}\n\n${bodyMarkdown}`
      : titleMarkdown;

    try {
      // oxlint-disable-next-line typescript/no-unnecessary-condition
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
    <div className="min-h-screen overflow-x-clip bg-background text-foreground">
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
          {...(post.lastModified && { lastModified: post.lastModified })}
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
        <MemoizedKeepReading
          {...(adjacentPosts?.previous
            ? { previous: adjacentPosts.previous }
            : {})}
          {...(adjacentPosts?.next ? { next: adjacentPosts.next } : {})}
          lang={lang}
        />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div id="comments" className="scroll-mt-24">
          <MemoizedGiscusComments term={post.id} />
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 md:px-8">
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
          <Folder className="size-4 text-primary" />
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
const MemoizedKeepReading = memo(KeepReading);
const MemoizedGiscusComments = memo(GiscusComments);
const MemoizedRelatedPosts = memo(RelatedPosts);
