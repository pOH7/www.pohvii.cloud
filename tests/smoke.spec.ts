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
