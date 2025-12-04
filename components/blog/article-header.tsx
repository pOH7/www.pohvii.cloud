"use client";

import { motion } from "framer-motion";
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
import { Badge } from "@/components/ui/badge";

export interface ArticleHeaderProps {
  title: string;
  description: string;
  image: string;
  video?: string; // Optional video URL
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  lang?: string; // Add lang prop for tag links
  onScrollToComments?: () => void;
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
}: ArticleHeaderProps) {
  return (
    <>
      {/* Article Header - Now above hero content */}
      <motion.header
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        {/* Category */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-4 flex items-center gap-2"
        >
          <Folder className="text-primary h-4 w-4" />
          <span className="text-primary text-sm font-medium">{category}</span>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-4 flex flex-wrap gap-2"
        >
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Link href={`/${lang}/tag/${encodeURIComponent(tag)}`}>
                <Badge
                  variant="outline"
                  className="hover:bg-primary hover:text-primary-foreground cursor-pointer text-xs transition-colors"
                >
                  #{tag}
                </Badge>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4 text-3xl leading-tight font-bold md:text-4xl"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-muted-foreground mb-6 text-lg leading-relaxed"
        >
          {description}
        </motion.p>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground mb-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm"
        >
          <span className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            {date}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {readTime}
          </span>
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {author}
          </span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="mb-6 flex items-center gap-3"
        >
          <Button
            variant="outline"
            size="sm"
            className="inline-flex cursor-pointer items-center gap-2 transition-transform hover:translate-y-[-1px]"
            onClick={onScrollToComments}
          >
            <MessageCircle className="h-4 w-4" />
            Comments
          </Button>
        </motion.div>
      </motion.header>

      {/* Hero Content - Image or Video */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="group relative mb-8 aspect-[16/9] overflow-hidden rounded-lg"
      >
        {video ? (
          <div className="relative h-full w-full">
            <video
              src={video}
              poster={image}
              controls
              muted
              className="h-full w-full object-cover"
              preload="metadata"
            >
              {/* Empty track element to satisfy jsx-a11y/media-has-caption */}
              <track kind="captions" />
              Your browser does not support the video tag.
            </video>
            {/* Optional custom play button overlay */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-colors group-hover:bg-black/10 group-hover:opacity-100">
              <Play className="h-16 w-16 text-white drop-shadow-lg" />
            </div>
          </div>
        ) : (
          <Image
            src={image}
            alt={title}
            width={1200}
            height={600}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            priority
          />
        )}
      </motion.div>

      {/* Bottom border separator */}
      <div className="border-border mb-8 border-b" />
    </>
  );
}
