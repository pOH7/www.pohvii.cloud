import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, ArrowRight, Folder, Tag, TrendingUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";

export default async function BlogPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = await params;

  const all = await getAllPosts(lang);
  const featuredPosts = all.slice(0, 2).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    image: p.image,
    date: p.date,
    tags: p.tags?.slice(0, 2) ?? [],
  }));

  const recentPosts = all.slice(2, 8).map((p) => ({
    slug: p.slug,
    title: p.title,
    description: p.description,
    image: p.image,
    date: p.date,
    tag: p.tags?.[0] ?? "",
  }));

  const categories = [
    { name: "Web Development", count: 15 },
    { name: "React & Frontend", count: 12 },
    { name: "Backend & APIs", count: 8 },
    { name: "Design & UI/UX", count: 6 },
    { name: "DevOps & Tools", count: 4 },
    { name: "Career & Tips", count: 3 },
  ];

  const popularTags = [
    { name: "JavaScript", count: 12 },
    { name: "React", count: 10 },
    { name: "TypeScript", count: 9 },
    { name: "CSS", count: 8 },
    { name: "Design", count: 7 },
    { name: "Node.js", count: 6 },
    { name: "Performance", count: 6 },
    { name: "Next.js", count: 5 },
    { name: "Testing", count: 4 },
    { name: "Git", count: 3 },
  ];

  const popularPosts = [
    {
      title: "Building Modern Web Apps",
      description: "Complete guide to React and Next.js",
    },
    {
      title: "JavaScript Fundamentals",
      description: "Master core JS concepts",
    },
    { title: "CSS Grid Mastery", description: "Advanced layout techniques" },
    {
      title: "TypeScript Advanced Tips",
      description: "Better code with TypeScript",
    },
    { title: "Web Performance Guide", description: "Optimize your site speed" },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Featured Posts Section */}
      <section className="w-full py-12 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2 animate-fade-in-up">
            Featured Posts
          </h2>
          <p className="text-muted-foreground animate-fade-in-up stagger-1">
            Discover my latest and most popular articles
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          {featuredPosts.map((post, index) => (
            <Card
              key={post.slug}
              className={`blog-card-hover group overflow-hidden animate-fade-in-up stagger-${index + 2}`}
            >
              <div className="aspect-video overflow-hidden">
                <Image
                  src={post.image}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl leading-tight">
                  {post.title}
                </CardTitle>
                <CardDescription className="leading-relaxed">
                  {post.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  <div className="flex gap-2">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Link href={`/${lang}/blog/${post.slug}`}>
                  <Button className="flex items-center gap-2">
                    Read More <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Main Content with Sidebar */}
      <section className="w-full px-4 md:px-8 max-w-7xl mx-auto pb-16">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Recent Posts - Main Content */}
          <div className="lg:col-span-3">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2 animate-slide-in-up">
                Recent Posts
              </h2>
              <p className="text-muted-foreground animate-slide-in-up stagger-1">
                Latest articles and tutorials
              </p>
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {recentPosts.map((post, index) => (
                <Card
                  key={post.slug}
                  className={`blog-card-hover group overflow-hidden animate-slide-in-up stagger-${index + 2}`}
                >
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
                    <CardTitle className="text-base leading-tight">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-sm leading-relaxed">
                      {post.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.date}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {post.tag}
                      </Badge>
                    </div>
                    <Link href={`/${lang}/blog/${post.slug}`}>
                      <Button size="sm" className="flex items-center gap-1">
                        Read <ArrowRight className="w-3 h-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* View All Posts Button */}
            <div className="text-center">
              <Link href={`/${lang}/blog/all`}>
                <Button
                  size="lg"
                  className="flex items-center gap-2 mx-auto animate-pulse-subtle"
                >
                  View All Posts <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Categories Section */}
            <Card className="animate-slide-in-up stagger-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="w-5 h-5" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center justify-between py-2 px-3 rounded hover:bg-muted transition-colors cursor-pointer"
                  >
                    <span className="text-sm">{category.name}</span>
                    <Badge variant="outline" className="text-xs">
                      {category.count}
                    </Badge>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Categories
                </Button>
              </CardContent>
            </Card>

            {/* Tags Section */}
            <Card className="animate-slide-in-up stagger-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map((tag) => (
                    <Badge
                      key={tag.name}
                      variant="secondary"
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      {tag.name} ({tag.count})
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Tags
                </Button>
              </CardContent>
            </Card>

            {/* Popular Posts Section */}
            <Card className="animate-slide-in-up stagger-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Popular Posts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {popularPosts.map((post, index) => (
                  <div key={index} className="group cursor-pointer">
                    <h4 className="font-medium text-sm leading-tight group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {post.description}
                    </p>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full mt-4">
                  View All Popular
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
