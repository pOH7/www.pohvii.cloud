import type { MetadataRoute } from "next";

import { getSitemapBlogEntries } from "@/lib/sitemap-content";

const locales = ["en", "zh"];
const baseUrl = "https://www.pohvii.cloud";

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/`,
      changeFrequency: "weekly",
      priority: 1,
    });
  }

  for (const locale of locales) {
    urls.push({
      url: `${baseUrl}/${locale}/blog/`,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  for (const locale of locales) {
    const posts = getSitemapBlogEntries(locale);
    for (const post of posts) {
      urls.push({
        url: `${baseUrl}/${locale}/blog/${post.canonicalSlug}/`,
        ...(post.lastModified && { lastModified: post.lastModified }),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return urls;
}
