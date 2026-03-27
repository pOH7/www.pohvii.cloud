import { expect, test } from "@playwright/test";

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
