"use client";

import Link from "next/link";
import { Tag } from "lucide-react";

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
            <div className="text-primary mb-1 text-3xl font-bold">
              {tags.length}
            </div>
            <p className="text-muted-foreground">Total Tags</p>
          </div>

          <div>
            <div className="text-primary mb-1 text-3xl font-bold">
              {totalArticles}
            </div>
            <p className="text-muted-foreground">Total Articles</p>
          </div>

          <div>
            <div className="text-primary mb-1 text-3xl font-bold">
              {avgPerTag}
            </div>
            <p className="text-muted-foreground">Avg per Tag</p>
          </div>
        </div>

        <div className="border-t [border-top-style:dotted] pt-5">
          <Link
            href={`/${lang}/blog`}
            className="border-b-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-primary inline-flex items-center gap-2 border-b-2 text-sm font-medium no-underline transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Browse all articles
            <Tag className="size-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
