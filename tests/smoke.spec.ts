import { expect, test, type Page } from "@playwright/test";

const SCROLL_OFFSET_TOLERANCE_PX = 8;

async function expectTargetNearHeaderOffset(page: Page, id: string) {
  const banner = page.getByRole("banner").first();
  await expect(banner).toBeVisible();

  const scrollMargin = await page.evaluate((elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return 0;

    const style = window.getComputedStyle(element);
    const blockStart = Number.parseFloat(style.scrollMarginBlockStart);
    const top = Number.parseFloat(style.scrollMarginTop);

    return Math.max(
      Number.isFinite(blockStart) ? blockStart : 0,
      Number.isFinite(top) ? top : 0
    );
  }, id);

  expect(
    scrollMargin,
    `Expected #${id} to define non-zero scroll-margin-top/scroll-margin-block-start`
  ).toBeGreaterThan(0);

  const getHeaderBottom = async () => {
    return banner.evaluate((header) => header.getBoundingClientRect().bottom);
  };

  const getTargetTop = async () => {
    return page.evaluate((elementId) => {
      return (
        document.getElementById(elementId)?.getBoundingClientRect().top ?? -1
      );
    }, id);
  };

  const getTargetDeltaFromHeader = async () => {
    const [targetTop, headerBottom] = await Promise.all([
      getTargetTop(),
      getHeaderBottom(),
    ]);

    expect(
      headerBottom,
      "Expected a banner landmark header to be present"
    ).toBeGreaterThan(0);

    return targetTop - headerBottom;
  };

  await expect
    .poll(async () => getTargetDeltaFromHeader(), { timeout: 5_000 })
    .toBeGreaterThanOrEqual(-1);

  await expect
    .poll(async () => getTargetDeltaFromHeader(), { timeout: 5_000 })
    .toBeLessThanOrEqual(scrollMargin + SCROLL_OFFSET_TOLERANCE_PX);
}

async function typeIntoBlogSearch(page: Page, value: string) {
  const search = page.getByRole("searchbox", { name: "Search articles" });
  await search.click();
  await search.pressSequentially(value);
  return search;
}

function getSitemapUrlEntry(xml: string, loc: string): string {
  const entries = xml.match(/<url>[\s\S]*?<\/url>/g) ?? [];
  const entry = entries.find((candidate) =>
    candidate.includes(`<loc>${loc}</loc>`)
  );

  expect(entry, `Expected sitemap entry for ${loc}`).toBeTruthy();
  return entry ?? "";
}

test("English homepage renders the monograph introduction", async ({
  page,
}) => {
  await page.goto("/en");

  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", {
      name: "I build systems that should stay understandable after the first launch.",
      level: 1,
    })
  ).toBeVisible();
  await expect(page.getByText("Clarity over theatre")).toBeVisible();
  await expect(page.getByText("Writing as engineering")).toBeVisible();
  await expect(
    page.getByText(
      "No launch story and no conversion funnel. Just the working assumptions behind the software and the writing that survives implementation details."
    )
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Notes" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "English" })).toHaveCount(0);
});

test("Chinese homepage renders the monograph introduction", async ({
  page,
}) => {
  await page.goto("/zh");

  await expect(page).toHaveURL(/\/zh\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(
    page.getByRole("heading", {
      name: "我更在意系统在第一次上线之后，是否仍然容易理解和修改。",
      level: 1,
    })
  ).toBeVisible();
  await expect(page.getByText("清晰胜过表演")).toBeVisible();
  await expect(page.getByText("写作也是工程的一部分")).toBeVisible();
  await expect(
    page.getByText(
      "这里没有包装过的个人叙事，也没有转化导向的页面结构。只有我在做软件时反复验证的一些前提，以及那些在实现细节变化之后仍然值得保留的文字。"
    )
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "笔记" })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "中文" })).toHaveCount(0);
});

test("Blog page is reachable", async ({ page }) => {
  await page.goto("/en/blog");

  await expect(page).toHaveURL(/\/en\/blog\/?$/);
  await expect(
    page.getByRole("heading", { name: "Blog", level: 1 }).first()
  ).toBeVisible();
});

test("Blog index metadata stays scoped to the blog and exposes discovery controls", async ({
  page,
}) => {
  await page.goto("/en/blog");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.pohvii.cloud/en/blog/"
  );
  await expect(
    page.getByRole("searchbox", { name: "Search articles" })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "RSS Feed" })).toHaveAttribute(
    "href",
    "/rss.xml"
  );
});

test("Blog page no longer renders the duplicated hot tags section", async ({
  page,
}) => {
  await page.goto("/en/blog");

  await expect(
    page.getByRole("complementary", { name: "Hot tags" })
  ).toHaveCount(0);
});

test("Blog index paginates the unfiltered post list", async ({ page }) => {
  await page.goto("/en/blog");

  await expect(
    page.getByRole("navigation", { name: "pagination" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Essential Algorithms and Data Structures: A Comprehensive Programming Guide",
    })
  ).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "Go to next page",
    })
  ).toHaveAttribute("href", "/en/blog/page/2");
});

test("Blog search narrows the visible article list", async ({ page }) => {
  await page.goto("/en/blog");

  await typeIntoBlogSearch(page, "Lenis");

  const lenisArticle = page.locator("article").filter({
    has: page.getByRole("link", {
      name: "How to Implement Lenis in Next.js App Router",
    }),
  });

  await expect(
    lenisArticle.getByRole("link", {
      name: "How to Implement Lenis in Next.js App Router",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Fix `brew upgrade codex` When Homebrew Says the Latest Version Is Already Installed",
    })
  ).toHaveCount(0);
  await expect(
    page.getByRole("navigation", { name: "pagination" })
  ).toHaveCount(0);
});

test("Hash-prefixed blog search shows tag suggestions and filters by the chosen tag", async ({
  page,
}) => {
  await page.goto("/en/blog");

  const search = await typeIntoBlogSearch(page, "#rea");

  const suggestions = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(
    suggestions.getByRole("button", { name: "React" })
  ).toBeVisible();

  await suggestions.getByRole("button", { name: "React" }).click();

  await expect(search).toHaveValue("#React");
  await expect(
    page.getByRole("link", {
      name: "How to Implement Lenis in Next.js App Router",
    })
  ).toBeVisible();
  await expect(
    page.getByRole("link", {
      name: "Fix `brew upgrade codex` When Homebrew Says the Latest Version Is Already Installed",
    })
  ).toHaveCount(0);
});

test("Blog post suggestions navigate to the selected article", async ({
  page,
}) => {
  await page.goto("/en/blog");

  await typeIntoBlogSearch(page, "Lenis");

  const suggestions = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(
    suggestions.getByRole("link", {
      name: "How to Implement Lenis in Next.js App Router",
    })
  ).toBeVisible();

  await suggestions
    .getByRole("link", { name: "How to Implement Lenis in Next.js App Router" })
    .click();

  await expect(page).toHaveURL(
    /\/en\/blog\/how-to-implement-lenis-in-nextjs-app-router-1750f15b\/?$/
  );
  await expect(
    page.getByRole("heading", {
      name: "How to Implement Lenis in Next.js App Router",
      level: 1,
    })
  ).toBeVisible();
});

test("Choosing a tag suggestion keeps the search input editable", async ({
  page,
}) => {
  await page.goto("/en/blog");

  const search = await typeIntoBlogSearch(page, "#next");
  const suggestions = page.getByRole("listbox", { name: "Search suggestions" });

  await suggestions.getByRole("button", { name: "Next.js" }).click();
  await page.keyboard.type("x");

  await expect(search).toHaveValue("#Next.jsx");
});

test("Blog search combines a tag token with trailing keywords", async ({
  page,
}) => {
  await page.goto("/en/blog");

  await typeIntoBlogSearch(page, "#macOS VPN");

  const suggestions = page.getByRole("listbox", { name: "Search suggestions" });
  await expect(
    suggestions.getByRole("link", {
      name: "Routing Home LAN Traffic Through WireGuard VPN",
    })
  ).toBeVisible();
  await expect(
    page
      .locator("article")
      .filter({
        has: page.getByRole("link", {
          name: "Routing Home LAN Traffic Through WireGuard VPN",
        }),
      })
      .getByRole("link", {
        name: "Routing Home LAN Traffic Through WireGuard VPN",
      })
  ).toBeVisible();
  await expect(suggestions.getByRole("button", { name: "VPN" })).toHaveCount(0);
  await expect(
    page.getByRole("link", {
      name: "How to Clear All Blocked Contacts in iOS: The macOS Mail App Solution",
    })
  ).toHaveCount(0);
});

test("Selecting a tag suggestion preserves earlier tags", async ({ page }) => {
  await page.goto("/en/blog");

  const search = await typeIntoBlogSearch(page, "#macOS #v");
  const suggestions = page.getByRole("listbox", { name: "Search suggestions" });

  await expect(
    suggestions.getByRole("button", { name: "Virtualization" })
  ).toBeVisible();

  await suggestions.getByRole("button", { name: "Virtualization" }).click();

  await expect(search).toHaveValue("#macOS #Virtualization");
});

test("Tag index metadata stays scoped to the tag hub", async ({ page }) => {
  await page.goto("/en/tag");

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://www.pohvii.cloud/en/tag/"
  );
});

test("Blog cards show updated date when lastModified exists", async ({
  page,
}) => {
  await page.goto("/en/tag/Proxmox");

  const windowsPostCard = page.locator("article").filter({
    has: page.getByRole("link", {
      name: "Installing Windows on Proxmox VE (PVE)",
    }),
  });

  await expect(windowsPostCard.getByText("Updated Mar 30, 2026")).toBeVisible();
});

test("Blog detail shows updated date when lastModified exists", async ({
  page,
}) => {
  await page.goto("/en/blog/installing-windows-on-proxmox-ve-pve-9a943890");

  await expect(page.getByText("Updated Mar 30, 2026")).toBeVisible();
});

test("Sitemap stays blog-only and keeps content-backed blog dates", async ({
  request,
}) => {
  const response = await request.get("/sitemap.xml");
  expect(response.ok()).toBe(true);

  const xml = await response.text();
  const englishHome = getSitemapUrlEntry(xml, "https://www.pohvii.cloud/en/");
  const englishBlogIndex = getSitemapUrlEntry(
    xml,
    "https://www.pohvii.cloud/en/blog/"
  );
  const windowsPost = getSitemapUrlEntry(
    xml,
    "https://www.pohvii.cloud/en/blog/installing-windows-on-proxmox-ve-pve-9a943890/"
  );
  const locs = Array.from(
    xml.matchAll(/<loc>(.*?)<\/loc>/g),
    (match) => match[1]
  );
  const staticIndexes = new Set([
    "https://www.pohvii.cloud/en/",
    "https://www.pohvii.cloud/zh/",
    "https://www.pohvii.cloud/en/blog/",
    "https://www.pohvii.cloud/zh/blog/",
  ]);
  const dynamicEntries = locs.filter((loc) => !staticIndexes.has(loc));

  expect(englishHome).not.toContain("<lastmod>");
  expect(englishBlogIndex).not.toContain("<lastmod>");
  expect(dynamicEntries.length).toBeGreaterThan(0);
  expect(dynamicEntries.every((loc) => loc.includes("/blog/"))).toBe(true);
  expect(windowsPost).toContain("<lastmod>2026-03-30");
});

test("RSS feed description stays blog-only", async ({ request }) => {
  const response = await request.get("/rss.xml");
  expect(response.ok()).toBe(true);

  const xml = await response.text();
  expect(xml).toContain(
    "<description>Latest blog posts from Léon Zhang.</description>"
  );
  expect(xml).not.toContain("technical notes");
});

test("About, contact, and footer copy stay blog-only", async ({ page }) => {
  await page.goto("/en/about");

  await expect(
    page.getByText(
      "This site is a working record of ideas, experiments, and long-form technical writing."
    )
  ).toBeVisible();
  await expect(
    page.getByText(
      "If you have a question about an article or a specific implementation detail, reach out directly."
    )
  ).toBeVisible();

  await page.goto("/en/contact");
  await expect(page.getByText("Feedback on a blog post.")).toBeVisible();

  await page.goto("/en/blog");
  await expect(
    page.getByText("Browse topic pages to find related articles.")
  ).toBeVisible();
});

test("About and Contact pages render instead of 404s", async ({ page }) => {
  await page.goto("/en/about");
  await expect(
    page.getByRole("heading", { name: "About", level: 1 })
  ).toBeVisible();

  await page.goto("/en/contact");
  await expect(
    page.getByRole("heading", { name: "Contact", level: 1 })
  ).toBeVisible();
});

test("Contact page uses the updated email and public profile links", async ({
  page,
}) => {
  await page.goto("/en/contact");

  const channels = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Where to find me" }),
  });

  await expect(channels.getByRole("link", { name: /^Email/ })).toHaveAttribute(
    "href",
    "mailto:pOHVII@gmail.com"
  );
  await expect(channels.getByRole("link", { name: /^GitHub/ })).toHaveAttribute(
    "href",
    "https://github.com/pOH7"
  );
  await expect(channels.getByRole("link", { name: /^X/ })).toHaveAttribute(
    "href",
    "https://x.com/pOHVII"
  );
  await expect(
    channels.getByRole("link", { name: /^LinkedIn/ })
  ).toHaveAttribute("href", "https://www.linkedin.com/in/léon-zhang/");
});

test("Auth session endpoint no longer returns 404", async ({ request }) => {
  const response = await request.get("/api/auth/get-session/");

  expect(response.status()).not.toBe(404);
});

test("Root document does not rely on native smooth scrolling", async ({
  page,
}) => {
  await page.goto("/en");

  const html = page.locator("html");

  await expect(html).not.toHaveAttribute("data-scroll-behavior", "smooth");
  await expect
    .poll(async () => {
      return page.evaluate(() => {
        return window.getComputedStyle(document.documentElement).scrollBehavior;
      });
    })
    .toBe("auto");
});

test("Comments button lands the comments section below the sticky header", async ({
  page,
}) => {
  await page.goto("/en/blog/testing-comment-system-795aade4");

  await page.getByRole("button", { name: "Comments" }).click();

  await expectTargetNearHeaderOffset(page, "comments");
});

test("TOC navigation lands headings below the sticky header", async ({
  page,
}) => {
  await page.goto("/en/blog/testing-comment-system-795aade4");

  await page.getByRole("button", { name: "Comments" }).click();
  await expectTargetNearHeaderOffset(page, "comments");

  const desktopTocItem = page.locator(
    'aside [data-id="testing-our-comment-system"]'
  );

  await expect(desktopTocItem).toHaveCount(1);
  await desktopTocItem.evaluate((button) => {
    (button as HTMLButtonElement).click();
  });

  await expectTargetNearHeaderOffset(page, "testing-our-comment-system");
});

test("Article pages provide adjacent reading navigation without self-linking", async ({
  page,
}) => {
  await page.goto("/en/blog/tech-blog-writing-guide-0c74e0ba");

  await expect(
    page.getByRole("heading", { name: "Keep Reading", level: 2 })
  ).toBeVisible();

  const adjacentLinks = page.locator('a[href*="/en/blog/"]').filter({
    hasText: /Previous|Next/,
  });
  await expect(adjacentLinks).toHaveCount(2);

  const hrefs = await adjacentLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href"))
  );

  expect(hrefs.every((href) => href !== null)).toBe(true);
  expect(
    hrefs.every((href) => !href?.includes("tech-blog-writing-guide-0c74e0ba"))
  ).toBe(true);
});
