import { test, expect } from "@playwright/test";

const url =
  "http://localhost:3000/en/blog/building-modern-web-apps-with-react-and-nextjs/";

test.describe("Blog heading anchor styling", () => {
  test("Intro H2 is link-wrapped, not underlined, shows icon on hover", async ({
    page,
  }) => {
    await page.goto(url);

    // Locate the autolink anchor inside the H2 heading
    const introAnchor = page.locator(
      'h2:has-text("Introduction to Modern Web Development") a.heading-anchor'
    );

    await expect(introAnchor).toBeVisible();

    // Check computed style: no underline on the anchor
    const textDecoration = await introAnchor.evaluate((el) => {
      const cs = getComputedStyle(el as HTMLElement);
      // Prefer textDecorationLine if present, else fall back to shorthand
      const styled = cs as CSSStyleDeclaration & {
        textDecorationLine?: string;
      };
      return styled.textDecorationLine ?? styled.textDecoration;
    });

    expect(textDecoration).not.toContain("underline");

    // Pseudo-element content and opacity behavior on hover
    const beforeOpacity = await introAnchor.evaluate(
      (el) => getComputedStyle(el as HTMLElement, "::after").opacity
    );
    const beforeContent = await introAnchor.evaluate(
      (el) => getComputedStyle(el as HTMLElement, "::after").content
    );

    await introAnchor.hover();

    const afterOpacity = await introAnchor.evaluate(
      (el) => getComputedStyle(el as HTMLElement, "::after").opacity
    );

    // Expect the icon content to be set and opacity to increase on hover
    expect(beforeContent.replaceAll('"', "")).toContain("🔗");
    expect(parseFloat(beforeOpacity)).toBeLessThan(0.1);
    expect(parseFloat(afterOpacity)).toBeGreaterThan(0.5);
  });
});
