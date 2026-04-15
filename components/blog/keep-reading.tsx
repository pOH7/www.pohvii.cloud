"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export interface KeepReadingPost {
  slug: string;
  title: string;
  description: string;
}

export interface KeepReadingProps {
  previous?: KeepReadingPost;
  next?: KeepReadingPost;
  lang?: string;
}

function KeepReadingCard({
  post,
  label,
  icon,
  lang,
}: {
  post: KeepReadingPost;
  label: string;
  icon: ReactNode;
  lang: string;
}) {
  return (
    <Link
      href={`/${lang}/blog/${post.slug}`}
      className="group flex h-full flex-col rounded-md border border-border bg-card p-5 transition-colors hover:bg-accent"
    >
      <div className="flex items-center gap-2 text-xs tracking-[0.24em] text-muted-foreground uppercase">
        {icon}
        <span>{label}</span>
      </div>
      <h3 className="mt-3 line-clamp-2 text-lg font-semibold group-hover:text-primary">
        {post.title}
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
        {post.description}
      </p>
      <span className="mt-5 inline-flex items-center gap-1 text-sm font-medium">
        Read article
      </span>
    </Link>
  );
}

export function KeepReading({ previous, next, lang = "en" }: KeepReadingProps) {
  if (!previous && !next) {
    return null;
  }

  return (
    <section className="mt-16 border-t [border-top-style:dotted] pt-8">
      <h2 className="mb-6 text-2xl font-bold">Keep Reading</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {previous ? (
          <KeepReadingCard
            post={previous}
            label="Previous"
            icon={<ArrowLeft className="size-3.5" />}
            lang={lang}
          />
        ) : null}
        {next ? (
          <KeepReadingCard
            post={next}
            label="Next"
            icon={<ArrowRight className="size-3.5" />}
            lang={lang}
          />
        ) : null}
      </div>
    </section>
  );
}
