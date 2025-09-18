import { notFound, redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Calendar, ArrowRight, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllPostsWithIds } from "@/lib/self-healing-blog";
import { supportedLangs } from "@/lib/i18n";
import { TagLinksFooter } from "@/components/footer";

const POSTS_PER_PAGE = 10;

export default async function BlogPaginationPage({
  params,
}: {
  params: { lang: string; pageNumber: string };
}) {
  const { lang, pageNumber } = await params;
  const currentPage = parseInt(pageNumber, 10);

  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  // Redirect page 1 to /blog
  if (currentPage === 1) {
    redirect(`/${lang}/blog`);
  }

  // Get all posts for pagination
  const allPosts = await getAllPostsWithIds(lang);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);

  // Check if page number is valid
  if (currentPage > totalPages) {
    notFound();
  }

  const paginatedPosts = allPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Generate tag links for footer
  const allTags = Array.from(new Set(allPosts.flatMap((post) => post.tags)))
    .filter(Boolean)
    .slice(0, 10);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <section className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-fade-in-up">
            Blog - Page {currentPage}
          </h1>
          <p className="text-muted-foreground animate-fade-in-up stagger-1">
            {allPosts.length} articles available
          </p>
        </div>
      </section>

      {/* Posts List - One per line */}
      <section className="w-full px-4 md:px-8 max-w-7xl mx-auto pb-16">
        <div className="space-y-6 mb-16">
          {paginatedPosts.map((post, index) => (
            <Card
              key={`${post.slug}-${currentPage}`}
              className={`blog-card-hover group overflow-hidden animate-slide-in-up stagger-${index + 1} flex flex-col md:flex-row`}
            >
              <div className="md:w-1/3 aspect-video md:aspect-square bg-muted relative overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                    <span className="text-4xl">📝</span>
                  </div>
                )}
              </div>

              <div className="md:w-2/3 p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-xl leading-tight hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="leading-relaxed line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                  <div className="flex items-center gap-3 mb-4 text-sm text-muted-foreground">
                    {post.author && (
                      <>
                        <span>{post.author}</span>
                        <span>•</span>
                      </>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.slice(0, 4).map((tag) => (
                      <Link
                        key={tag}
                        href={`/${lang}/tag/${encodeURIComponent(tag)}`}
                      >
                        <Badge
                          variant="outline"
                          className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          #{tag}
                        </Badge>
                      </Link>
                    ))}
                  </div>

                  <Link href={`/${lang}/blog/${post.slug}`}>
                    <Button className="flex items-center gap-2 group">
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </Link>
                </CardContent>
              </div>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mb-16">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      currentPage > 1
                        ? currentPage === 2
                          ? `/${lang}/blog`
                          : `/${lang}/blog/page/${currentPage - 1}`
                        : "#"
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {/* Page numbers */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNumber;
                  if (totalPages <= 5) {
                    pageNumber = i + 1;
                  } else if (currentPage <= 3) {
                    pageNumber = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNumber = totalPages - 4 + i;
                  } else {
                    pageNumber = currentPage - 2 + i;
                  }

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={
                          pageNumber === 1
                            ? `/${lang}/blog`
                            : `/${lang}/blog/page/${pageNumber}`
                        }
                        isActive={currentPage === pageNumber}
                        className="hover:scale-110 transition-transform"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                <PaginationItem>
                  <PaginationNext
                    href={
                      currentPage < totalPages
                        ? `/${lang}/blog/page/${currentPage + 1}`
                        : "#"
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </section>

      {/* Footer with Tag Links */}
      <TagLinksFooter allTags={allTags} lang={lang} />
    </div>
  );
}

export async function generateMetadata({
  params,
}: {
  params: { lang: string; pageNumber: string };
}) {
  const { pageNumber } = await params;
  const page = parseInt(pageNumber, 10);
  return {
    title: `Blog - Page ${page}`,
    description: `Browse blog articles - Page ${page}. Discover articles about web development, React, TypeScript, and more.`,
  };
}

export async function generateStaticParams() {
  const allParams: { lang: string; pageNumber: string }[] = [];
  for (const lang of supportedLangs) {
    const allPosts = await getAllPostsWithIds(lang);
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE) || 1;
    for (let page = 2; page <= totalPages; page++) {
      allParams.push({ lang, pageNumber: String(page) });
    }
  }
  return allParams;
}
