"use client";

import { Tag } from "lucide-react";
import Link from "next/link";

interface TagData {
  name: string;
  count: number;
}

interface StatsFooterProps {
  tags: TagData[];
  lang: string;
}

export function StatsFooter({ tags, lang }: StatsFooterProps) {
  if (tags.length === 0) {
    return null;
  }

  const totalArticles = tags.reduce((sum, tag) => sum + tag.count, 0);
  const avgPerTag =
    tags.length > 0 ? Math.round(totalArticles / tags.length) : 0;

  return (
    <footer className="border-t [border-top-style:dotted] px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8 grid grid-cols-1 gap-6 text-sm md:grid-cols-3">
          <div>
            <div className="mb-1 text-3xl font-bold text-primary">
              {tags.length}
            </div>
            <p className="text-muted-foreground">Total Tags</p>
          </div>

          <div>
            <div className="mb-1 text-3xl font-bold text-primary">
              {totalArticles}
            </div>
            <p className="text-muted-foreground">Total Articles</p>
          </div>

          <div>
            <div className="mb-1 text-3xl font-bold text-primary">
              {avgPerTag}
            </div>
            <p className="text-muted-foreground">Avg per Tag</p>
          </div>
        </div>

        <div className="border-t [border-top-style:dotted] pt-5">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-2 border-b-2 border-b-primary text-sm font-medium no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse all articles
            <Tag className="size-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
