"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readTime: string;
  category: string;
  tags: string[];
}

export interface RelatedPostsProps {
  posts: BlogPost[];
  lang?: string;
  maxPosts?: number;
}

export function RelatedPosts({
  posts,
  lang = "en",
  maxPosts = 2,
}: RelatedPostsProps) {
  const displayPosts = posts.slice(0, maxPosts);

  if (displayPosts.length === 0) {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.3 }}
      className="mt-16"
    >
      <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
      <div className="grid md:grid-cols-2 gap-6">
        {displayPosts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + index * 0.1 }}
            className="group"
          >
            <Card className="blog-card-hover overflow-hidden h-full">
              <div className="aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <Folder className="w-3 h-3 text-primary" />
                  <span className="text-xs font-medium text-primary">
                    {post.category}
                  </span>
                </div>
                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                  {post.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {post.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <Link href={`/${lang}/blog/${post.slug}`}>
                  <Button
                    size="sm"
                    className="hover:translate-y-[-1px] transition-transform"
                    variant="outline"
                  >
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
