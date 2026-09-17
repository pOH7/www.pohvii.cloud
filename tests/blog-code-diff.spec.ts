import { expect, test } from "@playwright/test";

test("Blog diff renders changes, follows the site theme, and fits mobile", async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 1280, height: 1100 });
  await page.addInitScript(() => {
    if (window.top === window) localStorage.setItem("theme", "light");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    "/en/blog/hide-the-proxmox-ve-no-valid-subscription-popup-07b0801b"
  );

  const diff = page.getByRole("region", { name: "Code changes" });
  const viewer = diff.locator("diffs-container");
  const additions = viewer.locator(
    '[data-line][data-line-type="change-addition"]'
  );
  const deletions = viewer.locator(
    '[data-line][data-line-type="change-deletion"]'
  );

  await expect(additions).toHaveText(["orig_cmd();"]);
  await expect(deletions).toHaveCount(22);
  await expect(
    deletions.filter({ hasText: "No valid subscription" })
  ).toBeVisible();
  await expect(viewer).toHaveCSS("color-scheme", "light");
  await page.getByRole("button", { name: "Toggle theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect(viewer).toHaveCSS("color-scheme", "dark");
  await diff.screenshot({ path: testInfo.outputPath("diff-dark.png") });

  await page.setViewportSize({ width: 390, height: 844 });
  await diff.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveCSS("color-scheme", "dark");
  const bounds = await diff.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(390);
  await diff.screenshot({ path: testInfo.outputPath("diff-mobile.png") });
  expect(errors).toEqual([]);
});
