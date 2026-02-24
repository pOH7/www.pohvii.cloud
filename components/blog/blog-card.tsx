"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readTime?: string;
  tags: string[];
  lang: string;
  index?: number;
  layout?: "grid" | "list";
}

export function BlogCard({
  slug,
  title,
  description,
  image,
  date,
  readTime,
  tags,
  lang,
  index = 0,
  layout = "grid",
}: BlogCardProps) {
  const isListLayout = layout === "list";

  return (
    <article
      data-index={index}
      className={`bg-card border-border rounded-md border ${
        isListLayout ? "md:flex" : "flex h-full flex-col"
      }`}
    >
      <div
        className={`border-border overflow-hidden ${
          isListLayout
            ? "aspect-video border-b md:aspect-square md:w-60 md:border-r md:border-b-0"
            : "aspect-video border-b"
        }`}
      >
        <Image
          src={image}
          alt={title}
          width={isListLayout ? 400 : 800}
          height={isListLayout ? 400 : 400}
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/${lang}/tag/${encodeURIComponent(tag)}`}
              className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary border-b-2 text-xs no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <h2 className="text-xl/tight font-semibold">
          <Link
            href={`/${lang}/blog/${slug}`}
            className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary border-b-2 no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            {title}
          </Link>
        </h2>

        <p className="text-muted-foreground line-clamp-3 text-sm">
          {description}
        </p>

        <div className="text-muted-foreground mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {date}
          </span>
          {readTime && (
            <span className="inline-flex items-center gap-1">
              <Clock className="size-3.5" />
              {readTime}
            </span>
          )}
        </div>

        <div>
          <Link
            href={`/${lang}/blog/${slug}`}
            className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary inline-flex items-center gap-1 border-b-2 text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Read article
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
