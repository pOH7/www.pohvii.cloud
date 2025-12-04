"use client";

import Link from "next/link";
import { Tag } from "lucide-react";
import { motion } from "framer-motion";

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
    <footer className="bg-muted/30 w-full px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl text-center">
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="text-primary mb-2 text-3xl font-bold">
              {tags.length}
            </div>
            <p className="text-muted-foreground">Total Tags</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-accent mb-2 text-3xl font-bold">
              {totalArticles}
            </div>
            <p className="text-muted-foreground">Total Articles</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="text-secondary mb-2 text-3xl font-bold">
              {avgPerTag}
            </div>
            <p className="text-muted-foreground">Avg per Tag</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-border border-t pt-6"
        >
          <Link
            href={`/${lang}/blog`}
            className="text-primary hover:text-accent inline-flex items-center gap-2 underline-offset-4 transition-colors hover:underline"
          >
            Browse all articles
            <Tag className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </footer>
  );
}
