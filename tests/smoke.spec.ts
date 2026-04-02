import { expect, test, type Page } from "@playwright/test";

const HEADER_OFFSET_MIN = 72;
const HEADER_OFFSET_MAX = 120;

async function expectTargetNearHeaderOffset(page: Page, id: string) {
  await page.waitForTimeout(2_000);

  const top = await page.evaluate((elementId) => {
    return (
      document.getElementById(elementId)?.getBoundingClientRect().top ?? -1
    );
  }, id);

  expect(top).toBeGreaterThanOrEqual(HEADER_OFFSET_MIN);
  expect(top).toBeLessThanOrEqual(HEADER_OFFSET_MAX);
}

async function typeIntoBlogSearch(page: Page, value: string) {
  const search = page.getByRole("searchbox", { name: "Search articles" });
  await search.click();
  await search.pressSequentially(value);
  return search;
}

test("English homepage renders expected content", async ({ page }) => {
  await page.goto("/en");

  await expect(page).toHaveURL(/\/en\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", { name: "Welcome", level: 1 })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toBeVisible();
});

test("Chinese homepage renders expected content", async ({ page }) => {
  await page.goto("/zh");

  await expect(page).toHaveURL(/\/zh\/?$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "zh");
  await expect(
    page.getByRole("heading", { name: "欢迎", level: 1 })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "中文" })).toBeVisible();
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

test("Blog discovery keeps hot tags compact and links to the dedicated tag page", async ({
  page,
}) => {
  await page.goto("/en/blog");

  const hotTags = page.getByRole("complementary", { name: "Hot tags" });
  await expect(hotTags).toBeVisible();
  await expect(hotTags.getByRole("button")).toHaveCount(5);
  await expect(
    hotTags.getByRole("link", { name: "More tags" })
  ).toHaveAttribute("href", "/en/tag/");
});

test("Desktop hot tags rail sits outside the centered blog column", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1600, height: 1200 });
  await page.goto("/en/blog");

  const mainColumn = page.getByTestId("blog-discovery-main");
  const hotTagsRail = page.getByTestId("blog-hot-tags-rail");

  const [mainBox, railBox] = await Promise.all([
    mainColumn.boundingBox(),
    hotTagsRail.boundingBox(),
  ]);

  expect(mainBox).not.toBeNull();
  expect(railBox).not.toBeNull();
  expect(
    (railBox?.x ?? 0) - ((mainBox?.x ?? 0) + (mainBox?.width ?? 0))
  ).toBeGreaterThanOrEqual(24);
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

test("Choosing a hot tag keeps the search input editable", async ({ page }) => {
  await page.goto("/en/blog");

  await page
    .getByRole("button", { name: /#Next\.js/i })
    .first()
    .click();
  await page.keyboard.type("x");

  await expect(
    page.getByRole("searchbox", { name: "Search articles" })
  ).toHaveValue("#Next.jsx");
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
  await page.goto("/en/blog/testing-comment-system-795aade4");

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
    hrefs.every((href) => !href?.includes("testing-comment-system-795aade4"))
  ).toBe(true);
});
