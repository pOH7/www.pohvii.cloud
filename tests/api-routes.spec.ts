import { test, expect } from "@playwright/test";

test.describe("API Routes", () => {
  test("sitemap.xml is accessible and properly formatted", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("xml");

    // Get raw XML content by accessing the response text directly
    const xmlContent = await response?.text();

    // Check XML declaration and structure in raw XML
    expect(xmlContent).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(xmlContent).toContain(
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    );
    expect(xmlContent).toContain("</urlset>");
  });

  test("sitemap contains required homepage URLs", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const xmlContent = await response?.text();

    // Check both language homepages exist
    expect(xmlContent).toContain("https://www.pohvii.cloud/en/");
    expect(xmlContent).toContain("https://www.pohvii.cloud/zh/");

    // Check priority is set correctly for homepage
    const enHomepageMatch = xmlContent?.match(
      /<url>.*?<loc>https:\/\/www\.pohvii\.cloud\/en\/<\/loc>.*?<priority>(.*?)<\/priority>.*?<\/url>/s
    );
    expect(enHomepageMatch?.[1]).toBe("1");
  });

  test("sitemap contains blog index pages", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const xmlContent = await response?.text();

    expect(xmlContent).toContain("https://www.pohvii.cloud/en/blog/");
    expect(xmlContent).toContain("https://www.pohvii.cloud/zh/blog/");

    // Check blog index priority
    const blogIndexMatch = xmlContent?.match(
      /<url>.*?<loc>https:\/\/www\.pohvii\.cloud\/en\/blog\/<\/loc>.*?<priority>(.*?)<\/priority>.*?<\/url>/s
    );
    expect(blogIndexMatch?.[1]).toBe("0.8");
  });

  test("sitemap contains all blog posts with proper metadata", async ({
    page,
  }) => {
    const response = await page.goto("/sitemap.xml");
    const xmlContent = await response?.text();

    // Should contain at least one blog post URL
    const blogPostRegex =
      /<loc>https:\/\/www\.pohvii\.cloud\/(en|zh)\/blog\/[^<]+\/<\/loc>/g;
    const blogPosts = xmlContent?.match(blogPostRegex);
    expect(blogPosts).toBeTruthy();
    expect(blogPosts?.length).toBeGreaterThan(0);

    // Check that blog posts have proper metadata
    expect(xmlContent).toContain("<lastmod>");
    expect(xmlContent).toContain("<changefreq>");
    expect(xmlContent).toContain("<priority>");
  });

  test("robots.txt is accessible and properly configured", async ({ page }) => {
    const response = await page.goto("/robots.txt");
    expect(response?.status()).toBe(200);
    expect(response?.headers()["content-type"]).toContain("text");

    const content = await page.textContent("body");
    expect(content).toBeTruthy();
  });

  test("robots.txt contains proper directives", async ({ page }) => {
    await page.goto("/robots.txt");
    const content = await page.textContent("body");

    // Check user-agent directive (case-insensitive)
    expect(content).toContain("User-Agent: *");

    // Check allow directive
    expect(content).toContain("Allow: /");

    // Check sitemap reference
    expect(content).toContain("Sitemap: https://www.pohvii.cloud/sitemap.xml");

    // Check host directive
    expect(content).toContain("Host: https://www.pohvii.cloud");
  });

  test("sitemap XML is valid and well-formed", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const xmlContent = await response?.text();

    // Basic XML validation using raw XML content
    const urlCount = (xmlContent?.match(/<url>/g) || []).length;
    const closingUrlCount = (xmlContent?.match(/<\/url>/g) || []).length;
    expect(urlCount).toBe(closingUrlCount);

    const locCount = (xmlContent?.match(/<loc>/g) || []).length;
    const closingLocCount = (xmlContent?.match(/<\/loc>/g) || []).length;
    expect(locCount).toBe(closingLocCount);

    // Ensure all blog post URLs are HTTPS (exclude xmlns declarations)
    const blogUrls = xmlContent?.match(
      /<loc>https:\/\/www\.pohvii\.cloud[^<]*<\/loc>/g
    );
    expect(blogUrls).toBeTruthy();
    expect(
      blogUrls?.every((url) => url.includes("https://www.pohvii.cloud"))
    ).toBe(true);

    // No HTTP URLs should exist in actual site URLs
    const httpBlogUrls = xmlContent?.match(
      /<loc>http:\/\/www\.pohvii\.cloud[^<]*<\/loc>/g
    );
    expect(httpBlogUrls).toBeNull();
  });

  test("sitemap change frequencies are appropriate", async ({ page }) => {
    const response = await page.goto("/sitemap.xml");
    const xmlContent = await response?.text();

    // Homepage should have weekly frequency
    const homepageFreq = xmlContent?.match(
      /<url>.*?<loc>https:\/\/www\.pohvii\.cloud\/en\/<\/loc>.*?<changefreq>(.*?)<\/changefreq>.*?<\/url>/s
    );
    expect(homepageFreq?.[1]).toBe("weekly");

    // Blog index should have daily frequency
    const blogIndexFreq = xmlContent?.match(
      /<url>.*?<loc>https:\/\/www\.pohvii\.cloud\/en\/blog\/<\/loc>.*?<changefreq>(.*?)<\/changefreq>.*?<\/url>/s
    );
    expect(blogIndexFreq?.[1]).toBe("daily");

    // Blog posts should have monthly frequency
    const blogPostFreq = xmlContent?.match(
      /<url>.*?<loc>https:\/\/www\.pohvii\.cloud\/en\/blog\/[^<]+<\/loc>.*?<changefreq>(.*?)<\/changefreq>.*?<\/url>/s
    );
    expect(blogPostFreq?.[1]).toBe("monthly");
  });
});
