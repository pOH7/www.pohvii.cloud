"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { BlogMeta } from "@/lib/blog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Calendar,
  ArrowRight,
  Grid3X3,
  List,
  Settings,
  BarChart3,
  Clock,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface AllPostsClientProps {
  posts: BlogMeta[];
  lang: string;
}

const POSTS_PER_PAGE = 9;

type SortOption = "recent" | "popular" | "alphabetical";
type ViewMode = "grid" | "list";

export function AllPostsClient({ posts, lang }: AllPostsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Ref for intersection observer
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Get unique categories and tags from posts
  const { categories, allTags } = useMemo(() => {
    const categoryMap = new Map<string, number>();
    const tagMap = new Map<string, number>();

    posts.forEach((post) => {
      // Count categories
      if (post.category) {
        categoryMap.set(
          post.category,
          (categoryMap.get(post.category) || 0) + 1
        );
      }

      // Count tags
      post.tags.forEach((tag) => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
      });
    });

    const categories = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    const allTags = Array.from(tagMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Show top 10 tags

    return { categories, allTags };
  }, [posts]);

  // Filter and sort posts
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesCategory =
        selectedCategory === "all" || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    // Sort posts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "popular":
          // For now, sort by tags length as popularity proxy
          return b.tags.length - a.tags.length;
        case "recent":
        default:
          return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
    });

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
    const endIndex = startIndex + POSTS_PER_PAGE;
    return filteredAndSortedPosts.slice(startIndex, endIndex);
  }, [filteredAndSortedPosts, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, sortBy]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-slide-in-up");
            entry.target.style.opacity = "1";
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, [paginatedPosts]);

  // Handle category filter
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 200); // Simulate loading
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header Section */}
      <header className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-8">
              All Posts
            </h1>

            {/* Search and Controls */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 search-input focus:scale-[1.02] transition-all duration-200"
                />
              </div>

              <div className="flex gap-3">
                <Select
                  value={sortBy}
                  onValueChange={(value) => setSortBy(value as SortOption)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Sort by Recent</SelectItem>
                    <SelectItem value="popular">Sort by Popular</SelectItem>
                    <SelectItem value="alphabetical">Sort by A-Z</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Filter Navigation */}
      <nav className="max-w-7xl mx-auto px-4 py-4">
        <div className="animate-slide-in-up stagger-2">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange("all")}
              className="rounded-full transition-all duration-200"
            >
              All
            </Button>
            {categories.map((category, index) => (
              <Button
                key={category.name}
                variant={
                  selectedCategory === category.name ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleCategoryChange(category.name)}
                className={`rounded-full transition-all duration-200 animate-fade-in-up stagger-${index + 1}`}
              >
                {category.name} ({category.count})
              </Button>
            ))}
          </div>

          <div className="flex justify-between items-center">
            <p className="text-muted-foreground">
              <BarChart3 className="inline w-4 h-4 mr-1" />
              {filteredAndSortedPosts.length} posts found
            </p>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Posts Grid/List */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : paginatedPosts.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2">No posts found</h3>
            <p className="text-muted-foreground">
              Try adjusting your search terms or filters.
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                : "space-y-6"
            }
          >
            {paginatedPosts.map((post, index) => (
              <article
                key={`${post.slug}-${currentPage}`}
                ref={(el) => {
                  cardsRef.current[index] = el;
                }}
                className={`blog-card-hover bg-card border border-border rounded-lg overflow-hidden opacity-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                  viewMode === "list" ? "flex flex-col md:flex-row" : ""
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div
                  className={`${viewMode === "list" ? "md:w-1/3" : "w-full"} aspect-video bg-muted relative overflow-hidden`}
                >
                  {post.image ? (
                    <Image
                      src={post.image}
                      alt={post.title}
                      width={600}
                      height={400}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                      <span className="text-4xl">📝</span>
                    </div>
                  )}
                </div>

                <div
                  className={`p-6 ${viewMode === "list" ? "md:w-2/3" : "w-full"}`}
                >
                  <CardHeader className="p-0 mb-4">
                    <CardTitle
                      className={`${viewMode === "list" ? "text-xl" : "text-lg"} leading-tight hover:text-primary transition-colors line-clamp-2`}
                    >
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
                      {post.category && (
                        <Badge variant="secondary" className="text-xs">
                          {post.category}
                        </Badge>
                      )}
                      {post.tags.slice(0, 3).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer"
                        >
                          #{tag}
                        </Badge>
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
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
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
                        onClick={() => setCurrentPage(pageNumber)}
                        isActive={currentPage === pageNumber}
                        className="cursor-pointer"
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {totalPages > 5 && currentPage < totalPages - 2 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => setCurrentPage(totalPages)}
                        className="cursor-pointer"
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </main>
    </div>
  );
}
