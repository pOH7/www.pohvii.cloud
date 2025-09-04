import type { IConfig, ISitemapField } from "next-sitemap";

const siteUrl =
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.pohvii.cloud";

export default {
  siteUrl,
  generateRobotsTxt: true,
  robotsTxtOptions: {
    policies: [{ userAgent: "*", allow: "/" }],
  },
  // Avoid including API and internal paths
  exclude: ["/api/*"],
  transform: async (config, path): Promise<ISitemapField> => {
    void config; // silence noUnusedParameters in strict TS configs
    const isHome = path === "/";
    return {
      loc: path,
      changefreq: isHome ? "daily" : "weekly",
      priority: isHome ? 1.0 : 0.7,
      lastmod: new Date().toISOString(),
      alternateRefs: [],
    };
  },
} satisfies IConfig;
