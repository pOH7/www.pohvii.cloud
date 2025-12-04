"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Folder, ArrowRight } from "lucide-react";
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
      <h2 className="mb-8 text-2xl font-bold">Related Posts</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {displayPosts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 + index * 0.1 }}
            className="group"
          >
            <Card className="h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
              <div className="aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={400}
                  height={200}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="mb-2 flex items-center gap-2">
                  <Folder className="text-primary h-3 w-3" />
                  <span className="text-primary text-xs font-medium">
                    {post.category}
                  </span>
                </div>
                <Link href={`/${lang}/blog/${post.slug}`}>
                  <CardTitle className="group-hover:text-primary cursor-pointer text-lg leading-tight transition-colors">
                    {post.title}
                  </CardTitle>
                </Link>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-muted-foreground mb-3 line-clamp-2 text-sm">
                  {post.description}
                </p>
                <div className="text-muted-foreground mb-3 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {post.date}
                  </span>
                  <span>{post.readTime}</span>
                </div>
                <Button
                  asChild
                  size="sm"
                  className="group flex cursor-pointer items-center gap-2"
                  variant="outline"
                >
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="inline-flex cursor-pointer"
                  >
                    Read More
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
