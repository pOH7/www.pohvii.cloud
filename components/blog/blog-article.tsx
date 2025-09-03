"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Share, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArticleHeader } from "./article-header";
import { TableOfContents } from "./table-of-contents";
import { UtterancesComments } from "./utterances-comments";
import { RelatedPosts } from "./related-posts";
import { useReadingProgress } from "@/hooks/use-reading-progress";
import { useSharing } from "@/hooks/use-sharing";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  content?: string;
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
  const { share } = useSharing();

  const handleShare = () => {
    share({
      title: post.title,
      text: post.description,
      url: window.location.href,
    });
  };

  const handleBookmark = () => {
    // In a real app, this would save to user's reading list
    console.log("Bookmarked:", post.title);
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full px-4 md:px-8 max-w-6xl mx-auto pt-8 pb-4"
      >
        <Link href={`/${lang}/blog`}>
          <Button
            variant="outline"
            className="inline-flex items-center gap-2 hover:translate-y-[-1px] transition-transform"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>
      </motion.div>

      <div className="flex max-w-6xl mx-auto px-4 md:px-8 gap-8">
        {/* Main Article Content */}
        <article className="flex-1 max-w-4xl">
          {/* Article Header with Hero Image */}
          <ArticleHeader
            title={post.title}
            description={post.description}
            image={post.image}
            date={post.date}
            readTime={post.readTime}
            author={post.author}
            category={post.category}
            tags={post.tags}
            onShare={handleShare}
            onBookmark={handleBookmark}
            onScrollToComments={scrollToComments}
          />

          {/* Article Content */}
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="blog-article-content mb-12"
          >
            {children ? (
              children
            ) : post.content ? (
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : null}
          </motion.div>

          {/* Article Footer */}
          <motion.footer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="border-t border-border pt-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Folder className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                {post.category}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <Link href={`/${lang}/blog`}>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 hover:translate-y-[-1px] transition-transform"
                >
                  <ArrowLeft className="w-4 h-4" />
                  All Posts
                </Button>
              </Link>

              <Button
                variant="outline"
                className="inline-flex items-center gap-2 hover:translate-y-[-1px] transition-transform"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
                Share Article
              </Button>
            </div>
          </motion.footer>

          {/* Comments Section */}
          <div id="comments">
            <UtterancesComments
              repo={utterancesRepo}
              issueTerm="pathname"
              label="comment"
            />
          </div>

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} lang={lang} maxPosts={2} />
        </article>

        {/* Table of Contents - Sticky Sidebar */}
        <TableOfContents
          items={tocItems}
          activeSection={activeSection}
          readingProgress={readingProgress}
          onItemClick={scrollToSection}
        />
      </div>
    </div>
  );
}
