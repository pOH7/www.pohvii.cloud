"use client";

import { ArrowRight, Search, Rss } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { BlogCard } from "@/components/blog/blog-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { BlogDiscoveryPost, BlogDiscoveryTag } from "@/lib/blog-feed";

interface BlogIndexClientProps {
  lang: string;
  posts: BlogDiscoveryPost[];
  tags: BlogDiscoveryTag[];
  currentPage?: number;
}

export const BLOG_POSTS_PER_PAGE = 10;
const TAG_SUGGESTION_LIMIT = 6;
const POST_SUGGESTION_LIMIT = 3;

function matchesAllTerms(haystack: string, terms: string[]) {
  return terms.every((term) => haystack.includes(term));
}

function dedupeTagTokens(tokens: string[]) {
  const seenTags = new Set<string>();

  return tokens.filter((token) => {
    if (!token.startsWith("#")) return true;

    const normalizedToken = token.toLowerCase();
    if (seenTags.has(normalizedToken)) return false;

    seenTags.add(normalizedToken);
    return true;
  });
}

export function BlogIndexClient({
  lang,
  posts,
  tags,
  currentPage = 1,
}: BlogIndexClientProps) {
  const [query, setQuery] = useState("");
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const queryTokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const tagTerms = queryTokens
    .filter((token) => token.startsWith("#"))
    .map((token) => token.slice(1))
    .filter(Boolean);
  const textTerms = queryTokens.filter((token) => !token.startsWith("#"));
  const lastToken = queryTokens.at(-1) ?? "";
  const activeTagTerm = lastToken.startsWith("#") ? lastToken.slice(1) : "";
  const activeTextTerm = lastToken.startsWith("#") ? "" : lastToken;
  const isTagMode = tagTerms.length > 0;
  const shouldSuggestTags =
    activeTagTerm.length > 0 || trimmedQuery === "#" || !isTagMode;

  const tagSuggestions = shouldSuggestTags
    ? (activeTagTerm || trimmedQuery === "#"
        ? tags.filter((tag) => {
            if (!activeTagTerm) return true;
            return tag.name.toLowerCase().includes(activeTagTerm);
          })
        : tags.filter((tag) => {
            if (!activeTextTerm) return false;
            return tag.name.toLowerCase().includes(activeTextTerm);
          })
      ).slice(0, TAG_SUGGESTION_LIMIT)
    : [];

  const postSuggestions = posts
    .filter((post) => {
      if (textTerms.length === 0) return false;

      const postHaystack = [post.title, post.description, ...post.tags]
        .join(" ")
        .toLowerCase();
      const matchesTags =
        tagTerms.length === 0 ||
        tagTerms.every((term) =>
          post.tags.some((tag) => tag.toLowerCase().includes(term))
        );

      return matchesTags && matchesAllTerms(postHaystack, textTerms);
    })
    .slice(0, POST_SUGGESTION_LIMIT);

  const showSuggestions =
    isSuggestionOpen &&
    trimmedQuery.length > 0 &&
    (tagSuggestions.length > 0 || postSuggestions.length > 0);

  const filteredPosts = posts.filter((post) => {
    if (tagTerms.length === 0 && textTerms.length === 0) return true;

    const postHaystack = [post.title, post.description, ...post.tags]
      .join(" ")
      .toLowerCase();
    const matchesTags =
      tagTerms.length === 0 ||
      tagTerms.every((term) =>
        post.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    const matchesText =
      textTerms.length === 0 || matchesAllTerms(postHaystack, textTerms);

    return matchesTags && matchesText;
  });
  const hasActiveFilters = trimmedQuery.length > 0;
  const totalPages = Math.ceil(posts.length / BLOG_POSTS_PER_PAGE);
  const pageStartIndex = (currentPage - 1) * BLOG_POSTS_PER_PAGE;
  const visiblePosts = hasActiveFilters
    ? filteredPosts
    : posts.slice(pageStartIndex, pageStartIndex + BLOG_POSTS_PER_PAGE);
  const visibleRangeStart = posts.length === 0 ? 0 : pageStartIndex + 1;
  const visibleRangeEnd = pageStartIndex + visiblePosts.length;

  const updateQuery = (nextValue: string) => {
    setQuery(nextValue);
    setIsSuggestionOpen(nextValue.trim().length > 0);
  };

  const focusSearchInput = (nextValue: string) => {
    const moveCaretToEnd = () => {
      const input = document.getElementById("blog-index-search");
      if (!(input instanceof HTMLInputElement)) return;

      input.focus();
      input.setSelectionRange(nextValue.length, nextValue.length);
    };

    moveCaretToEnd();
    window.requestAnimationFrame(moveCaretToEnd);
  };

  const buildQueryWithTag = (tagName: string) => {
    const nextTagToken = `#${tagName}`;
    const queryTokens = query.split(/\s+/).filter(Boolean);

    if (queryTokens.length === 0) return nextTagToken;

    const hasTrailingWhitespace = /\s$/.test(query);

    if (hasTrailingWhitespace) {
      return dedupeTagTokens([...queryTokens, nextTagToken]).join(" ");
    }

    const nextTokens = [...queryTokens];
    const lastIndex = nextTokens.length - 1;

    if (nextTokens[lastIndex]?.startsWith("#")) {
      nextTokens[lastIndex] = nextTagToken;
    } else {
      nextTokens.push(nextTagToken);
    }

    return dedupeTagTokens(nextTokens).join(" ");
  };

  const applyTagQuery = (tagName: string) => {
    const nextValue = buildQueryWithTag(tagName);
    setQuery(nextValue);
    setIsSuggestionOpen(false);
    focusSearchInput(nextValue);
  };

  const resetFilters = () => {
    setQuery("");
    setIsSuggestionOpen(false);
  };
  const paginationWindow = Array.from(
    { length: Math.min(totalPages, 5) },
    (_, index) => {
      if (totalPages <= 5) return index + 1;
      if (currentPage <= 3) return index + 1;
      if (currentPage >= totalPages - 2) return totalPages - 4 + index;
      return currentPage - 2 + index;
    }
  );

  return (
    <section className="relative px-4 py-12 md:px-8">
      <div
        className="mx-auto w-full max-w-5xl"
        data-testid="blog-discovery-main"
      >
        <div className="mb-8 border-b [border-bottom-style:dotted] pb-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
                Discover
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
              <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
                Search by title or type a tag with{" "}
                <span className="font-medium">#</span>.
              </p>
            </div>

            <Button asChild variant="outline" className="w-fit">
              <Link href="/rss.xml">
                <Rss className="size-4" />
                RSS Feed
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <label htmlFor="blog-index-search" className="relative block">
                <span className="sr-only">Search posts</span>
                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="blog-index-search"
                  type="search"
                  value={query}
                  onFocus={() => {
                    if (trimmedQuery) setIsSuggestionOpen(true);
                  }}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setIsSuggestionOpen(false);
                    }, 120);
                  }}
                  onChange={(event) => updateQuery(event.target.value)}
                  placeholder="Search titles or type #react"
                  aria-label="Search articles"
                  className="pr-28 pl-10"
                />
              </label>

              {trimmedQuery ? (
                <button
                  type="button"
                  onMouseDown={(event) => {
                    event.preventDefault();
                    resetFilters();
                  }}
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              ) : null}

              {showSuggestions ? (
                <div
                  role="listbox"
                  aria-label="Search suggestions"
                  className="absolute z-20 mt-2 w-full rounded-md border border-border bg-background p-2 shadow-sm"
                >
                  {tagSuggestions.length > 0 ? (
                    <div className={postSuggestions.length > 0 ? "mb-2" : ""}>
                      <p className="px-2 pb-1 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Tags
                      </p>
                      <div className="space-y-1">
                        {tagSuggestions.map((tag) => (
                          <button
                            key={tag.name}
                            type="button"
                            aria-label={tag.name}
                            onMouseDown={(event) => {
                              event.preventDefault();
                              applyTagQuery(tag.name);
                            }}
                            className="flex w-full items-center justify-between rounded-sm p-2 text-left text-sm hover:bg-accent"
                          >
                            <span>{tag.name}</span>
                            <span
                              aria-hidden="true"
                              className="text-xs text-muted-foreground"
                            >
                              #{tag.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {postSuggestions.length > 0 ? (
                    <div>
                      <p className="px-2 pb-1 text-[11px] font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                        Posts
                      </p>
                      <div className="space-y-1">
                        {postSuggestions.map((post) => (
                          <Link
                            key={post.slug}
                            href={`/${lang}/blog/${post.slug}`}
                            className="block rounded-sm p-2 text-sm hover:bg-accent"
                          >
                            {post.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="text-muted-foreground">
                {hasActiveFilters
                  ? `${filteredPosts.length} article${filteredPosts.length === 1 ? "" : "s"} shown`
                  : `Showing ${visibleRangeStart}-${visibleRangeEnd} of ${posts.length} articles`}
              </p>
              <p className="text-xs text-muted-foreground">
                {isTagMode ? "Tag search mode" : "Keyword search"}
              </p>
            </div>
          </div>
        </div>

        {visiblePosts.length === 0 ? (
          <div className="rounded-md border border-border bg-card p-8 text-center">
            <p className="text-lg font-medium">
              No articles match your filters.
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try a different keyword or reset the tag filter.
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-5"
              onClick={resetFilters}
            >
              Reset filters
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {visiblePosts.map((post, index) => (
              <BlogCard
                key={post.slug}
                slug={post.slug}
                title={post.title}
                description={post.description}
                image={post.image}
                date={post.date}
                {...(post.lastModified && { lastModified: post.lastModified })}
                readTime={post.readTime}
                tags={post.tags.slice(0, 4)}
                lang={lang}
                index={index}
                layout="list"
              />
            ))}
          </div>
        )}

        {!hasActiveFilters && totalPages > 1 ? (
          <div className="mt-10 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href={
                      currentPage === 1
                        ? "#"
                        : currentPage === 2
                          ? `/${lang}/blog`
                          : `/${lang}/blog/page/${currentPage - 1}`
                    }
                    className={
                      currentPage === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                {paginationWindow.map((pageNumber) => (
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
                ))}

                <PaginationItem>
                  <PaginationNext
                    href={
                      currentPage === totalPages
                        ? "#"
                        : `/${lang}/blog/page/${currentPage + 1}`
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
        ) : null}
      </div>
    </section>
  );
}
