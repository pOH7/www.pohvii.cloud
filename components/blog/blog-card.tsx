"use client";

import { Calendar, Clock, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  lastModified?: string;
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
  lastModified,
  readTime,
  tags,
  lang,
  index = 0,
  layout = "grid",
}: BlogCardProps) {
  const isListLayout = layout === "list";
  const displayDate = lastModified ? `Updated ${lastModified}` : date;
  const hasImage = Boolean(image);

  return (
    <article
      data-index={index}
      className={`flex h-full flex-col rounded-md border border-border bg-card ${
        isListLayout && hasImage ? "md:flex-row" : ""
      }`}
    >
      {image ? (
        <div
          className={`overflow-hidden border-border ${
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
      ) : null}

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Link
              key={tag}
              href={`/${lang}/tag/${encodeURIComponent(tag)}`}
              className="border-b-2 border-b-primary text-xs no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              #{tag}
            </Link>
          ))}
        </div>

        <h2 className="text-xl/tight font-semibold">
          <Link
            href={`/${lang}/blog/${slug}`}
            className="border-b-2 border-b-primary no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            {title}
          </Link>
        </h2>

        <p className="line-clamp-3 text-sm text-muted-foreground">
          {description}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {displayDate}
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
            className="inline-flex items-center gap-1 border-b-2 border-b-primary text-sm font-medium no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Read article
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
