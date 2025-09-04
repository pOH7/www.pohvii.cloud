import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://www.pohvii.cloud/sitemap.xml",
    host: "https://www.pohvii.cloud",
  };
}
