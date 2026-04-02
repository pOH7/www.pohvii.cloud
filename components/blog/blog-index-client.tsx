"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BlogCard } from "@/components/blog/blog-card";
import type { BlogDiscoveryPost, BlogDiscoveryTag } from "@/lib/blog-feed";

interface BlogIndexClientProps {
  lang: string;
  posts: BlogDiscoveryPost[];
  tags: BlogDiscoveryTag[];
}

const HOT_TAG_LIMIT = 5;
const TAG_SUGGESTION_LIMIT = 6;
const POST_SUGGESTION_LIMIT = 3;

interface HotTagsRailProps {
  lang: string;
  hotTags: BlogDiscoveryTag[];
  activeQuery: string;
  applyTagQuery: (tagName: string) => void;
  className?: string;
  testId?: string;
}

function HotTagsRail({
  lang,
  hotTags,
  activeQuery,
  applyTagQuery,
  className,
  testId,
}: HotTagsRailProps) {
  return (
    <aside
      aria-label="Hot tags"
      {...(testId ? { "data-testid": testId } : {})}
      className={`bg-card border-border rounded-md border p-3 ${className ?? ""}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">Hot tags</h2>
        <Link
          href={`/${lang}/tag/`}
          className="text-primary text-sm font-medium no-underline"
        >
          More tags
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 lg:flex-col">
        {hotTags.map((tag) => (
          <button
            key={tag.name}
            type="button"
            aria-pressed={activeQuery === `#${tag.name.toLowerCase()}`}
            onClick={() => applyTagQuery(tag.name)}
            className={`rounded-sm border px-3 py-2 text-left text-sm transition-colors ${
              activeQuery === `#${tag.name.toLowerCase()}`
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:bg-accent"
            }`}
          >
            <span className="block font-medium">#{tag.name}</span>
            <span className="text-muted-foreground block text-xs">
              {tag.count} articles
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

export function BlogIndexClient({ lang, posts, tags }: BlogIndexClientProps) {
  const [query, setQuery] = useState("");
  const [isSuggestionOpen, setIsSuggestionOpen] = useState(false);

  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toLowerCase();
  const isTagMode = normalizedQuery.startsWith("#");
  const normalizedTagQuery = isTagMode ? normalizedQuery.slice(1).trim() : "";
  const normalizedTextQuery = isTagMode ? "" : normalizedQuery;
  const hotTags = tags.slice(0, HOT_TAG_LIMIT);

  const tagSuggestions = (
    isTagMode
      ? tags.filter((tag) => {
          if (!normalizedTagQuery) return true;
          return tag.name.toLowerCase().includes(normalizedTagQuery);
        })
      : tags.filter((tag) => {
          if (!normalizedTextQuery) return false;
          return tag.name.toLowerCase().includes(normalizedTextQuery);
        })
  ).slice(0, TAG_SUGGESTION_LIMIT);

  const postSuggestions = posts
    .filter((post) => {
      if (!normalizedTextQuery) return false;
      return [post.title, post.description]
        .join(" ")
        .toLowerCase()
        .includes(normalizedTextQuery);
    })
    .slice(0, POST_SUGGESTION_LIMIT);

  const showSuggestions =
    isSuggestionOpen &&
    trimmedQuery.length > 0 &&
    (tagSuggestions.length > 0 || postSuggestions.length > 0);

  const filteredPosts = posts.filter((post) => {
    if (isTagMode) {
      if (!normalizedTagQuery) return true;
      return post.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedTagQuery)
      );
    }

    if (!normalizedTextQuery) return true;

    return [post.title, post.description, ...post.tags]
      .join(" ")
      .toLowerCase()
      .includes(normalizedTextQuery);
  });

  const updateQuery = (nextValue: string) => {
    setQuery(nextValue);
    setIsSuggestionOpen(nextValue.trim().length > 0);
  };

  const applyTagQuery = (tagName: string) => {
    setQuery(`#${tagName}`);
    setIsSuggestionOpen(false);
  };

  const resetFilters = () => {
    setQuery("");
    setIsSuggestionOpen(false);
  };

  return (
    <section className="relative px-4 py-12 md:px-8">
      <div
        className="mx-auto w-full max-w-5xl"
        data-testid="blog-discovery-main"
      >
        <div className="mb-8 border-b [border-bottom-style:dotted] pb-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
                Discover
              </p>
              <h1 className="text-3xl font-bold md:text-4xl">Blog</h1>
              <p className="text-muted-foreground max-w-2xl text-sm md:text-base">
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
                <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />
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
                  className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium"
                >
                  Clear
                </button>
              ) : null}

              {showSuggestions ? (
                <div
                  role="listbox"
                  aria-label="Search suggestions"
                  className="bg-background border-border absolute z-20 mt-2 w-full rounded-md border p-2 shadow-sm"
                >
                  {tagSuggestions.length > 0 ? (
                    <div className={postSuggestions.length > 0 ? "mb-2" : ""}>
                      <p className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
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
                            className="hover:bg-accent flex w-full items-center justify-between rounded-sm p-2 text-left text-sm"
                          >
                            <span>{tag.name}</span>
                            <span
                              aria-hidden="true"
                              className="text-muted-foreground text-xs"
                            >
                              #{tag.count}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {!isTagMode && postSuggestions.length > 0 ? (
                    <div>
                      <p className="text-muted-foreground px-2 pb-1 text-[11px] font-semibold tracking-[0.18em] uppercase">
                        Posts
                      </p>
                      <div className="space-y-1">
                        {postSuggestions.map((post) => (
                          <Link
                            key={post.slug}
                            href={`/${lang}/blog/${post.slug}`}
                            onMouseDown={() => setIsSuggestionOpen(false)}
                            className="hover:bg-accent block rounded-sm p-2 text-sm"
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
                {filteredPosts.length} article
                {filteredPosts.length === 1 ? "" : "s"} shown
              </p>
              <p className="text-muted-foreground text-xs">
                {isTagMode ? "Tag search mode" : "Keyword search"}
              </p>
            </div>
          </div>

          <HotTagsRail
            lang={lang}
            hotTags={hotTags}
            activeQuery={normalizedQuery}
            applyTagQuery={applyTagQuery}
            className="mt-4 min-[1520px]:hidden"
          />
        </div>

        {filteredPosts.length === 0 ? (
          <div className="border-border bg-card rounded-md border p-8 text-center">
            <p className="text-lg font-medium">
              No articles match your filters.
            </p>
            <p className="text-muted-foreground mt-2 text-sm">
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
            {filteredPosts.map((post, index) => (
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
      </div>

      <HotTagsRail
        lang={lang}
        hotTags={hotTags}
        activeQuery={normalizedQuery}
        applyTagQuery={applyTagQuery}
        testId="blog-hot-tags-rail"
        className="absolute top-12 left-[calc(50%+32rem+2rem)] hidden w-56 min-[1520px]:block"
      />
    </section>
  );
}
