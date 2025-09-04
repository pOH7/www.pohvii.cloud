import { MetadataRoute } from "next";
import { getAllPostSlugs } from "@/lib/blog";

const locales = ["en", "zh"];
const baseUrl = "https://www.pohvii.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  // Add homepage for each locale
  locales.forEach((locale) => {
    urls.push({
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    });
  });

  // Add blog index pages
  locales.forEach((locale) => {
    urls.push({
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    });
  });

  // Add individual blog posts
  locales.forEach((locale) => {
    const slugs = getAllPostSlugs(locale);
    slugs.forEach((slug) => {
      urls.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    });
  });

  return urls;
}
