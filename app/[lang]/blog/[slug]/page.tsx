import { notFound } from "next/navigation";
import { BlogArticle, type BlogPost } from "@/components/blog";

// This would normally come from a database or CMS
const blogPosts: BlogPost[] = [
  {
    slug: "building-modern-web-apps-with-react-and-nextjs",
    title: "Building Modern Web Apps with React and Next.js",
    description:
      "Complete guide to modern web development covering React fundamentals, Next.js features, and best practices for building scalable applications.",
    image:
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=600&fit=crop",
    date: "Jan 15, 2024",
    readTime: "12 min read",
    author: "Léon Zhang",
    category: "Web Development",
    tags: ["React", "Next.js", "Web Development"],
    content: `
      <h2 id="introduction">Introduction to Modern Web Development</h2>
      <p>In today's fast-paced digital world, building modern web applications requires a solid understanding of the latest frameworks and best practices. React and Next.js have emerged as the go-to technologies for creating scalable, performant, and maintainable web applications.</p>
      
      <h2 id="why-react">Why React?</h2>
      <p>React revolutionized the way we build user interfaces by introducing concepts like components, virtual DOM, and declarative programming. Its component-based architecture allows developers to build reusable UI elements that can be composed together to create complex applications.</p>
      
      <h3 id="react-benefits">Key Benefits of React:</h3>
      <ul>
        <li>Component-based architecture for better code organization</li>
        <li>Virtual DOM for optimal performance</li>
        <li>Large ecosystem and community support</li>
        <li>Excellent developer tools and debugging experience</li>
      </ul>
      
      <h2 id="enter-nextjs">Enter Next.js</h2>
      <p>Next.js builds upon React by providing a production-ready framework that includes everything you need to build modern web applications. It offers features like server-side rendering, static site generation, and automatic code splitting out of the box.</p>
      
      <h3 id="nextjs-features">Next.js Features:</h3>
      <ul>
        <li>Server-side rendering (SSR) and static site generation (SSG)</li>
        <li>Automatic code splitting and performance optimization</li>
        <li>Built-in CSS and Sass support</li>
        <li>API routes for full-stack development</li>
        <li>Image optimization and lazy loading</li>
      </ul>
      
      <h2 id="best-practices">Best Practices</h2>
      <p>When building modern web applications with React and Next.js, following best practices is crucial for maintainability and performance:</p>
      
      <ol>
        <li><strong>Component Organization:</strong> Keep components small and focused on a single responsibility</li>
        <li><strong>State Management:</strong> Use local state for component-specific data and global state management for shared data</li>
        <li><strong>Performance Optimization:</strong> Utilize React.memo, useMemo, and useCallback for optimization</li>
        <li><strong>Code Splitting:</strong> Leverage Next.js automatic code splitting and dynamic imports</li>
        <li><strong>SEO Optimization:</strong> Use Next.js built-in features for better search engine optimization</li>
      </ol>
      
      <h2 id="conclusion">Conclusion</h2>
      <p>React and Next.js provide a powerful foundation for building modern web applications. By understanding their core concepts and following best practices, developers can create applications that are not only performant but also maintainable and scalable.</p>
    `,
  },
  {
    slug: "css-grid-mastery-advanced-layout-techniques",
    title: "CSS Grid Mastery: Advanced Layout Techniques",
    description:
      "Learn advanced CSS Grid techniques for creating beautiful, responsive layouts that work across all devices and browsers.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1200&h=600&fit=crop",
    date: "Jan 10, 2024",
    readTime: "8 min read",
    author: "Léon Zhang",
    category: "Web Design",
    tags: ["CSS", "Layout", "Web Design"],
    content: `
      <h2 id="mastering-css-grid">Mastering CSS Grid Layout</h2>
      <p>CSS Grid has revolutionized web layout design, providing developers with unprecedented control over two-dimensional layouts. Unlike Flexbox, which excels at one-dimensional layouts, Grid allows you to control both rows and columns simultaneously.</p>
      
      <h2 id="grid-fundamentals">Grid Fundamentals</h2>
      <p>Before diving into advanced techniques, let's review the fundamental concepts of CSS Grid:</p>
      
      <h3 id="grid-container-properties">Grid Container Properties:</h3>
      <ul>
        <li><code>display: grid</code> - Creates a grid container</li>
        <li><code>grid-template-columns</code> - Defines column sizes</li>
        <li><code>grid-template-rows</code> - Defines row sizes</li>
        <li><code>gap</code> - Sets spacing between grid items</li>
      </ul>
      
      <h2 id="advanced-layout-techniques">Advanced Layout Techniques</h2>
      <p>Now let's explore some advanced techniques that will take your grid layouts to the next level:</p>
      
      <h3 id="named-grid-lines">1. Named Grid Lines</h3>
      <p>Instead of using line numbers, you can name your grid lines for better readability and maintenance.</p>
      
      <h3 id="grid-areas">2. Grid Areas</h3>
      <p>Define named grid areas to create semantic layouts that are easy to understand and modify.</p>
      
      <h3 id="responsive-grid">3. Responsive Grid with Auto-Fit and Auto-Fill</h3>
      <p>Create responsive layouts that automatically adjust the number of columns based on available space.</p>
      
      <h2 id="browser-support">Browser Support and Fallbacks</h2>
      <p>CSS Grid enjoys excellent browser support across all modern browsers. However, it's still important to consider fallbacks for older browsers when necessary.</p>
      
      <h2 id="grid-conclusion">Conclusion</h2>
      <p>CSS Grid is a powerful tool that, when mastered, can significantly improve your layout capabilities and development workflow. Practice these techniques and experiment with different approaches to become proficient in grid-based design.</p>
    `,
  },
  {
    slug: "typescript-best-practices-for-large-applications",
    title: "TypeScript Best Practices for Large Applications",
    description:
      "Discover essential TypeScript patterns and practices for building maintainable, type-safe applications at scale.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=600&fit=crop",
    date: "Jan 5, 2024",
    readTime: "15 min read",
    author: "Léon Zhang",
    category: "Programming",
    tags: ["TypeScript", "Best Practices", "Programming"],
    content: `
      <h2 id="typescript-intro">Introduction to TypeScript at Scale</h2>
      <p>TypeScript has become the de facto standard for building large-scale JavaScript applications. Its static type system helps catch errors early, improves code maintainability, and enhances developer productivity through better tooling and IDE support.</p>
      
      <h2 id="project-structure">Project Structure and Organization</h2>
      <p>A well-organized project structure is crucial for large TypeScript applications. Consider using a modular approach with clear separation of concerns.</p>
      
      <h3 id="folder-structure">Recommended Folder Structure:</h3>
      <ul>
        <li><code>src/</code> - Source code directory</li>
        <li><code>types/</code> - Type definitions</li>
        <li><code>utils/</code> - Utility functions</li>
        <li><code>components/</code> - Reusable components</li>
        <li><code>services/</code> - API and business logic</li>
      </ul>
      
      <h2 id="type-safety">Type Safety Best Practices</h2>
      <p>Leverage TypeScript's type system to create robust, maintainable code that prevents common runtime errors.</p>
      
      <h3 id="strict-mode">Enable Strict Mode</h3>
      <p>Always use strict mode in your TypeScript configuration to catch potential issues early in development.</p>
      
      <h2 id="performance">Performance Considerations</h2>
      <p>Large TypeScript projects require careful attention to compilation performance and bundle size optimization.</p>
      
      <h2 id="typescript-conclusion">Conclusion</h2>
      <p>Following these TypeScript best practices will help you build scalable, maintainable applications that can grow with your team and requirements.</p>
    `,
  },
];

interface BlogDetailPageProps {
  params: Promise<{
    lang: string;
    slug: string;
  }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { lang, slug } = await params;

  // Find the blog post by slug
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  // Get related posts (exclude current post)
  const relatedPosts = blogPosts.filter((p) => p.slug !== slug).slice(0, 2);

  return (
    <BlogArticle
      post={post}
      relatedPosts={relatedPosts}
      lang={lang}
      utterancesRepo="pOH7/www.pohvii.cloud"
    />
  );
}
