"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleHeader } from "./article-header";
import { TableOfContents } from "./table-of-contents";
import { UtterancesComments } from "./utterances-comments";
import { RelatedPosts } from "./related-posts";
import { useReadingProgress } from "@/hooks/use-reading-progress";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  video?: string; // Optional video URL
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  id: string;
}

export interface BlogArticleProps {
  post: BlogPost;
  relatedPosts?: BlogPost[];
  lang?: string;
  utterancesRepo?: string;
  children?: React.ReactNode;
}

export function BlogArticle({
  post,
  relatedPosts = [],
  lang = "en",
  utterancesRepo = "pOH7/www.pohvii.cloud",
  children,
}: BlogArticleProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const { readingProgress, activeSection, tocItems, scrollToSection } =
    useReadingProgress(contentRef);

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="bg-background text-foreground min-h-screen overflow-x-clip">
      {/* Back Button - Full Width */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto w-full max-w-6xl px-4 pt-8 pb-4 md:px-8"
      >
        <Link href={`/${lang}/blog`}>
          <Button
            variant="outline"
            className="inline-flex cursor-pointer items-center gap-2 transition-transform hover:translate-y-[-1px]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Button>
        </Link>
      </motion.div>

      {/* Article Header - Full Width */}
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

      {/* Content Area with Sidebar - Two Column Layout */}
      <div className="mx-auto flex max-w-6xl gap-8 px-4 md:px-8">
        {/* Main Article Content */}
        <article className="max-w-4xl min-w-0 flex-1">
          {/* Article Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="blog-article-content mb-12"
          >
            {children}
          </motion.div>

          {/* Article Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="border-border mb-12 border-t pt-8"
          >
            <div className="mb-6 flex items-center gap-2">
              <Folder className="text-primary h-4 w-4" />
              <span className="text-primary text-sm font-medium">
                {post.category}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <Link href={`/${lang}/blog`}>
                <Button
                  variant="outline"
                  className="inline-flex cursor-pointer items-center gap-2 transition-transform hover:translate-y-[-1px]"
                >
                  <ArrowLeft className="h-4 w-4" />
                  All Posts
                </Button>
              </Link>
            </div>
          </motion.footer>
        </article>

        {/* Table of Contents - Sticky Sidebar */}
        <TableOfContents
          items={tocItems}
          activeSection={activeSection}
          readingProgress={readingProgress}
          onItemClick={scrollToSection}
        />
      </div>

      {/* Comments Section - Full Width */}
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <div id="comments">
          <UtterancesComments
            repo={utterancesRepo}
            issueTerm={post.id}
            label="comment"
          />
        </div>
      </div>

      {/* Related Posts - Full Width */}
      <div className="mx-auto w-full max-w-6xl px-4 md:px-8">
        <RelatedPosts posts={relatedPosts} lang={lang} maxPosts={2} />
      </div>
    </div>
  );
}
