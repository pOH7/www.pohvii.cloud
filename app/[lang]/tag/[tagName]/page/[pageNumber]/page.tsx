import { notFound } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { BlogCard } from "@/components/blog/blog-card";
import { AnimatedSectionHeader } from "@/components/blog/animated-section-header";
import { getAllPostsWithIds } from "@/lib/self-healing-blog";
import { supportedLangs } from "@/lib/i18n";
import { TagLinksFooter } from "@/components/footer";

const POSTS_PER_PAGE = 10;

export default async function TagPaginationPage(
  props: PageProps<"/[lang]/tag/[tagName]/page/[pageNumber]">
) {
  const { lang, tagName, pageNumber } = await props.params;
  const decodedTagName = decodeURIComponent(tagName);
  const currentPage = parseInt(pageNumber, 10);

  // Validate page number
  if (isNaN(currentPage) || currentPage < 1) {
    notFound();
  }

  // Get all posts and filter by tag
  const allPosts = getAllPostsWithIds(lang);
  const taggedPosts = allPosts.filter((post) =>
    post.tags.some((tag) => tag.toLowerCase() === decodedTagName.toLowerCase())
  );

  // If no posts found for this tag, return 404
  if (taggedPosts.length === 0) {
    notFound();
  }

  const totalPages = Math.ceil(taggedPosts.length / POSTS_PER_PAGE);

  // Check if page number is valid
  if (currentPage > totalPages) {
    notFound();
  }

  const paginatedPosts = taggedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  // Generate other tag links for footer
  const allTags = Array.from(new Set(allPosts.flatMap((post) => post.tags)))
    .filter(Boolean)
    .filter((tag) => tag.toLowerCase() !== decodedTagName.toLowerCase())
    .slice(0, 10);

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header Section */}
      <section className="mx-auto w-full max-w-7xl px-4 py-12 md:px-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <Tag className="text-primary h-6 w-6" />
            <Badge variant="secondary" className="px-3 py-1 text-lg">
              {decodedTagName}
            </Badge>
          </div>
          <AnimatedSectionHeader
            title={`Articles about ${decodedTagName} - Page ${currentPage}`}
            subtitle={`${taggedPosts.length} article${taggedPosts.length !== 1 ? "s" : ""} found`}
          />
        </div>
      </section>

      {/* Posts List - One per line */}
      <section className="mx-auto w-full max-w-7xl px-4 pb-16 md:px-8">
        <div className="mb-16 space-y-6">
          {paginatedPosts.map((post, index) => (
            <BlogCard
              key={`${post.slug}-${currentPage}`}
              slug={post.slug}
              title={post.title}
              description={post.description}
              image={
                post.image ||
                "https://placehold.co/400x300/ed254e/ffffff?text=%F0%9F%93%9D"
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
                          ? `/${lang}/tag/${encodeURIComponent(tagName)}`
                          : `/${lang}/tag/${encodeURIComponent(tagName)}/page/${currentPage - 1}`
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
                            ? `/${lang}/tag/${encodeURIComponent(tagName)}`
                            : `/${lang}/tag/${encodeURIComponent(tagName)}/page/${pageNumber}`
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
                    href={
                      currentPage < totalPages
                        ? `/${lang}/tag/${encodeURIComponent(tagName)}/page/${currentPage + 1}`
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

      {/* Footer with Related Tag Links */}
      <TagLinksFooter allTags={allTags} lang={lang} />
    </div>
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]/tag/[tagName]/page/[pageNumber]">
) {
  const { tagName, pageNumber: pageNumberStr } = await props.params;
  const decodedTagName = decodeURIComponent(tagName);
  const pageNumber = parseInt(pageNumberStr, 10);
  return {
    title: `${decodedTagName} Articles - Page ${pageNumber}`,
    description: `Discover articles about ${decodedTagName} - Page ${pageNumber}. Learn about web development, programming, and more.`,
  };
}

export function generateStaticParams() {
  const params: { lang: string; tagName: string; pageNumber: string }[] = [];
  for (const lang of supportedLangs) {
    const allPosts = getAllPostsWithIds(lang);
    const tagCounts = new Map<string, number>();
    for (const post of allPosts) {
      for (const tag of post.tags) {
        const key = tag;
        tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
      }
    }
    for (const [tag, count] of tagCounts) {
      const totalPages = Math.ceil(count / POSTS_PER_PAGE) || 1;
      for (let page = 2; page <= totalPages; page++) {
        params.push({
          lang,
          tagName: encodeURIComponent(tag),
          pageNumber: String(page),
        });
      }
    }
  }
  return params;
}
