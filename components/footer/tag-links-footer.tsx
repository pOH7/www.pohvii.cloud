"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface TagLinksFooterProps {
  allTags: string[];
  lang: string;
}

export function TagLinksFooter({ allTags, lang }: TagLinksFooterProps) {
  return (
    <footer className="bg-muted/30 w-full px-4 py-12 md:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          <h3 className="mb-4 text-2xl font-bold">More great resources</h3>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {allTags.map((tag, index) => (
            <motion.div
              key={tag}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link
                href={`/${lang}/tag/${encodeURIComponent(tag)}/`}
                className="text-muted-foreground hover:text-primary group transition-colors"
              >
                <span className="underline-offset-4 group-hover:underline">
                  Articles about {tag}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="border-border mt-8 border-t pt-6"
        >
          <Link
            href={`/${lang}/tag/`}
            className="text-primary inline-flex items-center gap-2 underline-offset-4 transition-all hover:underline hover:opacity-70"
          >
            Browse all topics
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </div>
    </footer>
  );
}
