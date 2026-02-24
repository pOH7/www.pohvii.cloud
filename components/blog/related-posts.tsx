"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Folder, ArrowRight } from "lucide-react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export interface RelatedPostsProps {
  posts: BlogPost[];
  lang?: string;
  maxPosts?: number;
}

export function RelatedPosts({
  posts,
  lang = "en",
  maxPosts = 2,
}: RelatedPostsProps) {
  const displayPosts = posts.slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t [border-top-style:dotted] pt-8">
      <h2 className="mb-6 text-2xl font-bold">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {displayPosts.map((post) => (
          <article
            key={post.slug}
            className="bg-card border-border rounded-md border"
          >
            <div className="border-border aspect-video overflow-hidden border-b">
              <Image
                src={post.image}
                alt={post.title}
                width={400}
                height={200}
                className="size-full object-cover"
              />
            </div>
            <div className="space-y-3 p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-xs">
                <Folder className="text-primary size-3.5" />
                <span>{post.category}</span>
              </div>

              <h3 className="text-lg/tight font-semibold">
                <Link
                  href={`/${lang}/blog/${post.slug}`}
                  className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary border-b-2 no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  {post.title}
                </Link>
              </h3>

              <p className="text-muted-foreground line-clamp-2 text-sm">
                {post.description}
              </p>

              <div className="text-muted-foreground flex items-center gap-4 text-xs">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="size-3.5" />
                  {post.date}
                </span>
                <span>{post.readTime}</span>
              </div>

              <Link
                href={`/${lang}/blog/${post.slug}`}
                className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary inline-flex items-center gap-1 border-b-2 text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                Read more
                <ArrowRight className="size-3.5" />
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
