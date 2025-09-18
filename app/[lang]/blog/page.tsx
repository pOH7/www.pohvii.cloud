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
import { TagLinksFooter } from "@/components/footer";
import {
  getFeaturedPostsWithIds,
  getAllPostsWithIds,
} from "@/lib/self-healing-blog";
import { supportedLangs } from "@/lib/i18n";

const POSTS_PER_PAGE = 10;

export default async function BlogPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = await params;
  const currentPage = 1;

  // Get featured posts (with self-healing URLs)
  const featuredPosts = (await getFeaturedPostsWithIds(lang, 2)).map((p) => ({
    slug: p.slug, // Already in self-healing format (slug-id)
    title: p.title,
    description: p.description,
    image: p.image,
    date: p.date,
    tags: p.tags?.slice(0, 2) ?? [],
  }));

  // Get all posts for pagination (with self-healing URLs)
  const allPosts = await getAllPostsWithIds(lang);
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE);
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
      {/* Featured Posts Section */}
      <section className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 animate-fade-in-up">
            Blog
          </h1>
          <p className="text-muted-foreground animate-fade-in-up stagger-1">
            Discover my latest articles and tutorials
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {featuredPosts.map((post, index) => (
            <Card
              key={post.slug}
              className={`blog-card-hover group overflow-hidden animate-fade-in-up stagger-${index + 2}`}
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={
                    post.image ||
                    `https://placehold.co/800x400/ed254e/ffffff?text=${encodeURIComponent(post.title)}`
                  }
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-3">
                <Link href={`/${lang}/blog/${post.slug}`}>
                  <CardTitle className="text-xl leading-tight hover:text-primary transition-colors cursor-pointer">
                    {post.title}
                  </CardTitle>
                </Link>
                <CardDescription className="leading-relaxed">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
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
                </div>
                <Button
                  asChild
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="inline-flex cursor-pointer"
                  >
                    Read More
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* All Posts Section */}
      <section className="w-full px-4 md:px-8 max-w-7xl mx-auto pb-16">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 animate-slide-in-up">
            All Posts
          </h2>
          <p className="text-muted-foreground animate-slide-in-up stagger-1">
            {allPosts.length} articles available
          </p>
        </div>

        {/* Posts List - One per line */}
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
                  <Link href={`/${lang}/blog/${post.slug}`}>
                    <CardTitle className="text-xl leading-tight hover:text-primary transition-colors line-clamp-2 cursor-pointer">
                      {post.title}
                    </CardTitle>
                  </Link>
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

                  <Button
                    asChild
                    className="flex items-center gap-2 group cursor-pointer"
                  >
                    <Link
                      href={`/${lang}/blog/${post.slug}`}
                      className="inline-flex cursor-pointer"
                    >
                      Read More
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
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
                    href="#"
                    className="pointer-events-none opacity-50"
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
                    href={totalPages > 1 ? `/${lang}/blog/page/2` : "#"}
                    className={
                      totalPages === 1 ? "pointer-events-none opacity-50" : ""
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

export function generateMetadata() {
  return {
    title: "Blog",
    description:
      "Discover my latest articles and tutorials about web development, Java, Spring Boot, React, TypeScript, and software engineering best practices.",
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
    openGraph: {
      title: "Blog",
      description:
        "Discover my latest articles and tutorials about web development, Java, Spring Boot, React, TypeScript, and software engineering best practices.",
      type: "website",
      url: "https://www.pohvii.cloud/blog",
      images: [
        {
          url: "/og-blog.svg",
          width: 1200,
          height: 630,
          alt: "Léon Zhang - Tech Blog",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Blog",
      description:
        "Discover my latest articles and tutorials about web development, Java, Spring Boot, React, TypeScript, and software engineering best practices.",
      images: ["/twitter-blog.svg"],
    },
  };
}

export async function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
