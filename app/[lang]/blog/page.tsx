import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { TagLinksFooter } from "@/components/footer";
import { BlogCard } from "@/components/blog/blog-card";
import { AnimatedSectionHeader } from "@/components/blog/animated-section-header";
import {
  getFeaturedPostsWithIds,
  getAllPostsWithIds,
} from "@/lib/self-healing-blog";
import { supportedLangs } from "@/lib/i18n";

const POSTS_PER_PAGE = 10;

export default async function BlogPage(props: PageProps<"/[lang]/blog">) {
  const { lang } = await props.params;
  const currentPage = 1;

  // Get featured posts (with self-healing URLs)
  const featuredPosts = getFeaturedPostsWithIds(lang, 2).map((p) => ({
    slug: p.slug, // Already in self-healing format (slug-id)
    title: p.title,
    description: p.description,
    image:
      p.image ||
      `https://placehold.co/800x400/ed254e/ffffff?text=${encodeURIComponent(p.title)}`,
    date: p.date,
    readTime: p.readTime,
    tags: p.tags.slice(0, 2),
  }));

  // Get all posts for pagination (with self-healing URLs)
  const allPosts = getAllPostsWithIds(lang);
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
    <div className="bg-background text-foreground min-h-screen">
      {/* Featured Posts Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
        <AnimatedSectionHeader
          title="Blog"
          subtitle="Discover my latest articles and tutorials"
        />

        <div className="mb-16 grid gap-8 md:grid-cols-2">
          {featuredPosts.map((post, index) => (
            <BlogCard
              key={post.slug}
              slug={post.slug}
              title={post.title}
              description={post.description}
              image={post.image}
              date={post.date}
              readTime={post.readTime}
              tags={post.tags}
              lang={lang}
              index={index}
              layout="grid"
            />
          ))}
        </div>
      </section>

      {/* All Posts Section */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <AnimatedSectionHeader
          title="All Posts"
          subtitle={`${allPosts.length} articles available`}
        />

        {/* Posts List - One per line */}
        <div className="mb-16 space-y-6">
          {paginatedPosts.map((post, index) => (
            <BlogCard
              key={`${post.slug}-${currentPage}`}
              slug={post.slug}
              title={post.title}
              description={post.description}
              image={
                post.image ||
                `https://placehold.co/400x300/ed254e/ffffff?text=${encodeURIComponent("📝")}`
              }
              date={post.date}
              readTime={post.readTime}
              tags={post.tags.slice(0, 4)}
              lang={lang}
              index={index}
              layout="list"
            />
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-16 flex justify-center">
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
                  // Since currentPage is always 1, we show pages 1-5 (or less if totalPages < 5)
                  const pageNumber = i + 1;

                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href={
                          pageNumber === 1
                            ? `/${lang}/blog`
                            : `/${lang}/blog/page/${pageNumber}`
                        }
                        isActive={currentPage === pageNumber}
                        className="transition-transform hover:scale-110"
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

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
