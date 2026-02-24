"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  Clock,
  User,
  MessageCircle,
  Folder,
  Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MemoizedCopyMarkdownButton } from "./copy-markdown-button";

export interface ArticleHeaderProps {
  title: string;
  description: string;
  image: string;
  video?: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  lang?: string;
  onScrollToComments?: () => void;
  onCopyMarkdown?: () => Promise<boolean>;
}

export function ArticleHeader({
  title,
  description,
  image,
  video,
  date,
  readTime,
  author,
  category,
  tags,
  lang = "en",
  onScrollToComments,
  onCopyMarkdown,
}: ArticleHeaderProps) {
  return (
    <>
      <header className="mb-6 border-b [border-bottom-style:dotted] pb-6">
        <div className="text-muted-foreground mb-4 flex items-center gap-2 text-xs">
          <Folder className="text-primary size-3.5" />
          <span>{category}</span>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
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

        <h1 className="mb-4 text-3xl/tight font-bold md:text-4xl">{title}</h1>

        <p className="text-muted-foreground mb-5 text-base/relaxed md:text-lg">
          {description}
        </p>

        <div className="text-muted-foreground mb-5 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="size-3.5" />
            {date}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-3.5" />
            {readTime}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <User className="size-3.5" />
            {author}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="inline-flex cursor-pointer items-center gap-2"
            onClick={onScrollToComments}
          >
            <MessageCircle className="size-4" />
            Comments
          </Button>
          <MemoizedCopyMarkdownButton onCopy={onCopyMarkdown} />
        </div>
      </header>

      <div className="border-border group relative mb-8 aspect-video overflow-hidden rounded-md border">
        {video ? (
          <div className="relative size-full">
            <video
              src={video}
              poster={image}
              controls
              muted
              className="size-full object-cover"
              preload="metadata"
            >
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15 opacity-0 transition-opacity group-hover:opacity-100">
              <Play className="size-14 text-white" />
            </div>
          </div>
        ) : (
          <Image
            src={image}
            alt={title}
            width={1200}
            height={600}
            className="size-full object-cover"
            priority
          />
        )}
      </div>

      <div className="mb-8 border-t [border-top-style:dotted]" />
    </>
  );
}
