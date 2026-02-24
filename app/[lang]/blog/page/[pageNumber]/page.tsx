import { notFound, redirect } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { getAllPostsWithIds } from "@/lib/self-healing-blog";
import { supportedLangs } from "@/lib/i18n";
import { TagLinksFooter } from "@/components/footer";
import { BlogCard } from "@/components/blog/blog-card";
import { AnimatedSectionHeader } from "@/components/blog/animated-section-header";

const POSTS_PER_PAGE = 10;

export default async function BlogPaginationPage(
  props: PageProps<"/[lang]/blog/page/[pageNumber]">
) {
  const { lang, pageNumber } = await props.params;
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
  const allPosts = getAllPostsWithIds(lang);
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
    <div className="bg-background text-foreground min-h-screen">
      {/* Header Section */}
      <section className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8">
        <AnimatedSectionHeader
          title={`Blog - Page ${currentPage}`}
          subtitle={`${allPosts.length} articles available`}
        />
      </section>

      {/* Posts List - One per line */}
      <section className="mx-auto w-full max-w-5xl px-4 pb-16 md:px-8">
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

export async function generateMetadata(
  props: PageProps<"/[lang]/blog/page/[pageNumber]">
) {
  const { pageNumber } = await props.params;
  const page = parseInt(pageNumber, 10);
  return {
    title: `Blog - Page ${page}`,
    description: `Browse blog articles - Page ${page}. Discover articles about web development, React, TypeScript, and more.`,
  };
}

export function generateStaticParams() {
  const allParams: { lang: string; pageNumber: string }[] = [];
  for (const lang of supportedLangs) {
    const allPosts = getAllPostsWithIds(lang);
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE) || 1;
    for (let page = 2; page <= totalPages; page++) {
      allParams.push({ lang, pageNumber: String(page) });
    }
  }
  return allParams;
}
