import { expect, test } from "@playwright/test";

test("Blog detail renders without hero media when a post has no image", async ({
  page,
}) => {
  await page.goto("/en/blog/testing-comment-system-795aade4");

  await expect(
    page.getByRole("heading", { name: "Testing Comment System", level: 1 })
  ).toBeVisible();
  await expect(
    page.getByRole("img", { name: "Testing Comment System" })
  ).toHaveCount(0);
});

test("Blog tag cards omit thumbnails when a post has no image", async ({
  page,
}) => {
  await page.goto("/en/tag/Testing");

  const testingPostCard = page.locator("article").filter({
    has: page.getByRole("link", { name: "Testing Comment System" }),
  });

  await expect(testingPostCard).toHaveCount(1);
  await expect(
    testingPostCard.getByRole("img", { name: "Testing Comment System" })
  ).toHaveCount(0);
});

test("Blog tag cards still render local thumbnails", async ({ page }) => {
  await page.goto("/en/tag/Outlook");

  const outlookPostCard = page.locator("article").filter({
    has: page.getByRole("link", {
      name: "Batch Add Email Addresses to Outlook Contacts",
    }),
  });

  await expect(outlookPostCard).toHaveCount(1);
  await expect(
    outlookPostCard.getByRole("img", {
      name: "Batch Add Email Addresses to Outlook Contacts",
    })
  ).toHaveCount(1);
});
