import { BlogArticle, type BlogPost } from "./blog-article";

// Sample data that matches the original HTML design
const samplePost: BlogPost = {
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
};

const sampleRelatedPosts: BlogPost[] = [
  {
    slug: "css-grid-mastery-advanced-layout-techniques",
    title: "CSS Grid Mastery: Advanced Layout Techniques",
    description:
      "Learn advanced CSS Grid techniques for creating beautiful, responsive layouts that work across all devices and browsers.",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop",
    date: "Jan 10, 2024",
    readTime: "8 min read",
    author: "Léon Zhang",
    category: "Web Design",
    tags: ["CSS", "Layout", "Web Design"],
    content: "",
  },
  {
    slug: "typescript-best-practices-for-large-applications",
    title: "TypeScript Best Practices for Large Applications",
    description:
      "Discover essential TypeScript patterns and practices for building maintainable, type-safe applications at scale.",
    image:
      "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=200&fit=crop",
    date: "Jan 5, 2024",
    readTime: "15 min read",
    author: "Léon Zhang",
    category: "Programming",
    tags: ["TypeScript", "Best Practices", "Programming"],
    content: "",
  },
];

interface EnhancedBlogDetailProps {
  lang?: string;
}

export function EnhancedBlogDetail({ lang = "en" }: EnhancedBlogDetailProps) {
  return (
    <BlogArticle
      post={samplePost}
      relatedPosts={sampleRelatedPosts}
      lang={lang}
    />
  );
}
