import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, ArrowLeft, Clock, Share, Bookmark } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"

// This would normally come from a database or CMS
const blogPosts = [
  {
    slug: "building-modern-web-apps-with-react-and-nextjs",
    title: "Building Modern Web Apps with React and Next.js",
    description: "Complete guide to modern web development covering React fundamentals, Next.js features, and best practices for building scalable applications.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    date: "Jan 15, 2024",
    readTime: "12 min read",
    tags: ["React", "Next.js", "Web Development"],
    content: `
      <h2>Introduction to Modern Web Development</h2>
      <p>In today's fast-paced digital world, building modern web applications requires a solid understanding of the latest frameworks and best practices. React and Next.js have emerged as the go-to technologies for creating scalable, performant, and maintainable web applications.</p>
      
      <h2>Why React?</h2>
      <p>React revolutionized the way we build user interfaces by introducing concepts like components, virtual DOM, and declarative programming. Its component-based architecture allows developers to build reusable UI elements that can be composed together to create complex applications.</p>
      
      <h3>Key Benefits of React:</h3>
      <ul>
        <li>Component-based architecture for better code organization</li>
        <li>Virtual DOM for optimal performance</li>
        <li>Large ecosystem and community support</li>
        <li>Excellent developer tools and debugging experience</li>
      </ul>
      
      <h2>Enter Next.js</h2>
      <p>Next.js builds upon React by providing a production-ready framework that includes everything you need to build modern web applications. It offers features like server-side rendering, static site generation, and automatic code splitting out of the box.</p>
      
      <h3>Next.js Features:</h3>
      <ul>
        <li>Server-side rendering (SSR) and static site generation (SSG)</li>
        <li>Automatic code splitting and performance optimization</li>
        <li>Built-in CSS and Sass support</li>
        <li>API routes for full-stack development</li>
        <li>Image optimization and lazy loading</li>
      </ul>
      
      <h2>Best Practices</h2>
      <p>When building modern web applications with React and Next.js, following best practices is crucial for maintainability and performance:</p>
      
      <ol>
        <li><strong>Component Organization:</strong> Keep components small and focused on a single responsibility</li>
        <li><strong>State Management:</strong> Use local state for component-specific data and global state management for shared data</li>
        <li><strong>Performance Optimization:</strong> Utilize React.memo, useMemo, and useCallback for optimization</li>
        <li><strong>Code Splitting:</strong> Leverage Next.js automatic code splitting and dynamic imports</li>
        <li><strong>SEO Optimization:</strong> Use Next.js built-in features for better search engine optimization</li>
      </ol>
      
      <h2>Conclusion</h2>
      <p>React and Next.js provide a powerful foundation for building modern web applications. By understanding their core concepts and following best practices, developers can create applications that are not only performant but also maintainable and scalable.</p>
    `
  },
  {
    slug: "css-grid-mastery-advanced-layout-techniques",
    title: "CSS Grid Mastery: Advanced Layout Techniques",
    description: "Learn advanced CSS Grid techniques for creating beautiful, responsive layouts that work across all devices and browsers.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
    date: "Jan 10, 2024",
    readTime: "8 min read",
    tags: ["CSS", "Layout", "Web Design"],
    content: `
      <h2>Mastering CSS Grid Layout</h2>
      <p>CSS Grid has revolutionized web layout design, providing developers with unprecedented control over two-dimensional layouts. Unlike Flexbox, which excels at one-dimensional layouts, Grid allows you to control both rows and columns simultaneously.</p>
      
      <h2>Grid Fundamentals</h2>
      <p>Before diving into advanced techniques, let's review the fundamental concepts of CSS Grid:</p>
      
      <h3>Grid Container Properties:</h3>
      <ul>
        <li><code>display: grid</code> - Creates a grid container</li>
        <li><code>grid-template-columns</code> - Defines column sizes</li>
        <li><code>grid-template-rows</code> - Defines row sizes</li>
        <li><code>gap</code> - Sets spacing between grid items</li>
      </ul>
      
      <h2>Advanced Layout Techniques</h2>
      <p>Now let's explore some advanced techniques that will take your grid layouts to the next level:</p>
      
      <h3>1. Named Grid Lines</h3>
      <p>Instead of using line numbers, you can name your grid lines for better readability and maintenance.</p>
      
      <h3>2. Grid Areas</h3>
      <p>Define named grid areas to create semantic layouts that are easy to understand and modify.</p>
      
      <h3>3. Responsive Grid with Auto-Fit and Auto-Fill</h3>
      <p>Create responsive layouts that automatically adjust the number of columns based on available space.</p>
      
      <h2>Browser Support and Fallbacks</h2>
      <p>CSS Grid enjoys excellent browser support across all modern browsers. However, it's still important to consider fallbacks for older browsers when necessary.</p>
      
      <h2>Conclusion</h2>
      <p>CSS Grid is a powerful tool that, when mastered, can significantly improve your layout capabilities and development workflow. Practice these techniques and experiment with different approaches to become proficient in grid-based design.</p>
    `
  }
]

interface BlogDetailPageProps {
  params: Promise<{
    lang: string
    slug: string
  }>
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { lang, slug } = await params
  
  // Find the blog post by slug
  const post = blogPosts.find(p => p.slug === slug)
  
  if (!post) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="w-full px-4 md:px-8 max-w-4xl mx-auto pt-8 pb-4">
        <Link href={`/${lang}/blog`}>
          <Button variant="ghost" className="mb-6 flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <article className="w-full px-4 md:px-8 max-w-4xl mx-auto">
        {/* Featured Image */}
        <div className="aspect-[16/9] overflow-hidden rounded-lg mb-8">
          <Image 
            src={post.image} 
            alt={post.title}
            width={1200}
            height={600}
            className="w-full h-full object-cover"
            priority
          />
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
            {post.description}
          </p>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {post.readTime}
            </span>
          </div>
          
          <div className="flex items-center gap-3 pb-8 border-b">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share className="w-4 h-4" />
              Share
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Bookmark className="w-4 h-4" />
              Save
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <div 
          className="prose prose-lg max-w-none mb-12 
                     prose-headings:font-bold prose-headings:text-foreground
                     prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
                     prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3
                     prose-p:text-foreground prose-p:leading-relaxed prose-p:mb-4
                     prose-ul:text-foreground prose-ol:text-foreground
                     prose-li:mb-2 prose-code:text-primary
                     prose-strong:text-foreground"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Article Footer */}
        <footer className="border-t pt-8">
          <div className="flex flex-wrap gap-2 mb-6">
            <span className="text-sm font-medium">Tags:</span>
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          
          <div className="flex items-center justify-between">
            <Link href={`/${lang}/blog`}>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                All Posts
              </Button>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Share className="w-4 h-4" />
                Share Article
              </Button>
            </div>
          </div>
        </footer>
      </article>

      {/* Related Posts Section */}
      <section className="w-full px-4 md:px-8 max-w-4xl mx-auto py-16">
        <h2 className="text-2xl font-bold mb-8">Related Posts</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {blogPosts
            .filter(p => p.slug !== slug)
            .slice(0, 2)
            .map((relatedPost) => (
              <Card key={relatedPost.slug} className="blog-card-hover group overflow-hidden">
                <div className="aspect-video overflow-hidden">
                  <Image 
                    src={relatedPost.image} 
                    alt={relatedPost.title}
                    width={400}
                    height={200}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base leading-tight">{relatedPost.title}</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {relatedPost.date}
                    </span>
                    <span>{relatedPost.readTime}</span>
                  </div>
                  <Link href={`/${lang}/blog/${relatedPost.slug}`}>
                    <Button size="sm" className="flex items-center gap-1">
                      Read More
                    </Button>
                  </Link>
                </CardContent>
              </Card>
          ))}
        </div>
      </section>
    </div>
  )
}