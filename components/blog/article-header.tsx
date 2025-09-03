"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import {
  Calendar,
  Clock,
  User,
  Share,
  BookmarkPlus,
  MessageCircle,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ArticleHeaderProps {
  title: string;
  description: string;
  image: string;
  date: string;
  readTime: string;
  author: string;
  category: string;
  tags: string[];
  onShare?: () => void;
  onBookmark?: () => void;
  onScrollToComments?: () => void;
}

export function ArticleHeader({
  title,
  description,
  image,
  date,
  readTime,
  author,
  category,
  tags,
  onShare,
  onBookmark,
  onScrollToComments,
}: ArticleHeaderProps) {
  return (
    <>
      {/* Hero Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="aspect-[16/9] overflow-hidden rounded-lg mb-8 group"
      >
        <Image
          src={image}
          alt={title}
          width={1200}
          height={600}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          priority
        />
      </motion.div>

      {/* Article Header */}
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
          className="flex items-center gap-2 mb-4"
        >
          <Folder className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium text-primary">{category}</span>
        </motion.div>

        {/* Tags */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap gap-2 mb-4"
        >
          {tags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
            >
              <Badge variant="secondary">{tag}</Badge>
            </motion.div>
          ))}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-3xl md:text-4xl font-bold mb-4 leading-tight"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg leading-relaxed mb-6 text-muted-foreground"
        >
          {description}
        </motion.p>

        {/* Metadata */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-6 text-sm text-muted-foreground mb-6"
        >
          <span className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {date}
          </span>
          <span className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {readTime}
          </span>
          <span className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {author}
          </span>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-3 pb-8 border-b border-border"
        >
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2 hover:translate-y-[-1px] transition-transform"
            onClick={onShare}
          >
            <Share className="w-4 h-4" />
            Share
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2 hover:translate-y-[-1px] transition-transform"
            onClick={onBookmark}
          >
            <BookmarkPlus className="w-4 h-4" />
            Reading List
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="inline-flex items-center gap-2 hover:translate-y-[-1px] transition-transform"
            onClick={onScrollToComments}
          >
            <MessageCircle className="w-4 h-4" />
            Comments
          </Button>
        </motion.div>
      </motion.header>
    </>
  );
}
