"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface BlogCardProps {
  slug: string;
  title: string;
  description: string;
  image: string;
  date: string;
  readTime?: string;
  tags: string[];
  lang: string;
  index?: number;
  layout?: "grid" | "list";
}

export function BlogCard({
  slug,
  title,
  description,
  image,
  date,
  readTime,
  tags,
  lang,
  index = 0,
  layout = "grid",
}: BlogCardProps) {
  const isListLayout = layout === "list";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      className="group h-full"
    >
      <Card
        className={`h-full overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
          isListLayout ? "flex flex-col md:flex-row" : ""
        }`}
      >
        <div
          className={`overflow-hidden ${
            isListLayout
              ? "bg-muted relative aspect-video md:aspect-square md:w-1/3"
              : "aspect-video"
          }`}
        >
          <Image
            src={image}
            alt={title}
            width={isListLayout ? 400 : 800}
            height={isListLayout ? 400 : 400}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        <div className={isListLayout ? "flex flex-1 flex-col" : ""}>
          <CardHeader className={isListLayout ? "flex-1" : ""}>
            <div className="mb-2 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <Link href={`/${lang}/blog/${slug}`}>
              <CardTitle className="hover:text-primary cursor-pointer leading-tight transition-colors">
                {title}
              </CardTitle>
            </Link>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="text-muted-foreground mb-4 flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {date}
              </span>
              {readTime && (
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {readTime}
                </span>
              )}
            </div>
            <Button
              asChild
              className="group flex w-full cursor-pointer items-center gap-2 md:w-auto"
            >
              <Link href={`/${lang}/blog/${slug}`}>
                Read Article
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </CardContent>
        </div>
      </Card>
    </motion.div>
  );
}
