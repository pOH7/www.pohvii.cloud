"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface TagLinksFooterProps {
  allTags: string[];
  lang: string;
}

export function TagLinksFooter({ allTags, lang }: TagLinksFooterProps) {
  return (
    <footer className="border-t [border-top-style:dotted] px-4 py-10 md:px-8">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-5">
          <h3 className="mb-2 text-2xl font-bold">More great resources</h3>
          <p className="text-sm text-muted-foreground">
            Browse topic pages to find grouped notes and articles.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {allTags.map((tag) => (
            <Link
              key={tag}
              href={`/${lang}/tag/${encodeURIComponent(tag)}/`}
              className="inline-flex w-fit border-b-2 border-b-primary text-sm no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Articles about {tag}
            </Link>
          ))}
        </div>

        <div className="mt-8 border-t [border-top-style:dotted] pt-5">
          <Link
            href={`/${lang}/tag/`}
            className="inline-flex items-center gap-2 border-b-2 border-b-primary text-sm font-medium no-underline transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Browse all topics
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
