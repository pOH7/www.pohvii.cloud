# Homepage Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder homepage with a quiet, editorial, philosophy-first personal front page in both locales.

**Architecture:** Keep the implementation scoped to the existing homepage route. Use page-local localized copy in `app/[lang]/page.tsx` so the page can ship as a static, self-contained monograph layout without introducing feed dependencies or new runtime state. Verify the redesign with Playwright homepage assertions that fail on the old placeholder page and pass on the new layout.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS v4, Playwright

---

## File Structure

- Modify: `app/[lang]/page.tsx`
  Responsibility: Define the localized homepage copy, render the new editorial layout, and update homepage metadata.
- Modify: `tests/smoke.spec.ts`
  Responsibility: Replace placeholder homepage assertions with red-green Playwright checks for the redesigned English and Chinese pages.

### Task 1: Replace Placeholder Homepage Assertions

**Files:**

- Modify: `tests/smoke.spec.ts`
- Test: `tests/smoke.spec.ts`

- [ ] **Step 1: Write the failing test**

Update the existing homepage tests so they assert the new philosophy-first content instead of `"Welcome"` / `"欢迎"` and the temporary language links.

```ts
test("English homepage renders the monograph introduction", async ({
  page,
}) => {
  await page.goto("/en");

  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(
    page.getByRole("heading", {
      name: "I build systems that should stay understandable after the first launch.",
      level: 1,
    })
  ).toBeVisible();
  await expect(page.getByText("Clarity over theatre")).toBeVisible();
  await expect(page.getByRole("link", { name: "English" })).toHaveCount(0);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec playwright test tests/smoke.spec.ts --grep "homepage"`
Expected: FAIL because the old homepage still renders placeholder copy and the temporary language links.

- [ ] **Step 3: Confirm failure is the right failure**

Check that the failure is caused by missing redesigned content, not by Playwright setup or unrelated routes.

### Task 2: Implement The Homepage Redesign

**Files:**

- Modify: `app/[lang]/page.tsx`
- Test: `tests/smoke.spec.ts`

- [ ] **Step 1: Write the minimal implementation**

Replace the placeholder body with localized, page-local content and a quiet editorial layout.

Implementation shape:

```ts
const homeContent = {
  en: {
    name: "Léon Zhang",
    eyebrow: "Software, writing, and the work around them",
    title:
      "I build systems that should stay understandable after the first launch.",
    intro: "...",
    principles: [
      { label: "01", title: "Clarity over theatre", body: "..." },
      { label: "02", title: "Durability over noise", body: "..." },
      { label: "03", title: "Writing as engineering", body: "..." },
    ],
    siteNote: "...",
    metadataTitle: "Léon Zhang",
    metadataDescription: "...",
  },
  zh: {
    name: "张磊",
    eyebrow: "软件、写作，以及它们之间的工作",
    title: "我更在意系统在第一次上线之后，是否仍然容易理解和修改。",
    intro: "...",
    principles: [
      { label: "01", title: "清晰胜过表演", body: "..." },
      { label: "02", title: "耐久胜过噪音", body: "..." },
      { label: "03", title: "写作也是工程的一部分", body: "..." },
    ],
    siteNote: "...",
    metadataTitle: "首页",
    metadataDescription: "...",
  },
} as const;
```

Render the page as:

```tsx
<section className="relative overflow-hidden">
  <div className="mx-auto max-w-5xl px-4 py-14 md:px-8 md:py-20">
    <div className="max-w-3xl border-b [border-bottom-style:dotted] pb-10">
      ...
    </div>

    <div className="mt-10 grid gap-8">
      {page.principles.map((principle) => (
        <article
          key={principle.title}
          className="border-b [border-bottom-style:dotted] pb-6"
        >
          ...
        </article>
      ))}
    </div>

    <div className="mt-10 max-w-2xl">...</div>
  </div>
</section>
```

Also update `generateMetadata()` to use the same locale-specific copy rather than the current generic homepage description.

- [ ] **Step 2: Run test to verify it passes**

Run: `pnpm exec playwright test tests/smoke.spec.ts --grep "homepage"`
Expected: PASS for the redesigned homepage tests.

- [ ] **Step 3: Refactor only if needed**

If the route file becomes difficult to scan, tighten variable names or extract tiny render helpers. Do not add feed lookups, CTA controls, or extra homepage modules unless clarity demands it.

### Task 3: Verify The Finished Homepage

**Files:**

- Modify: `app/[lang]/page.tsx`
- Modify: `tests/smoke.spec.ts`

- [ ] **Step 1: Run focused linting**

Run: `pnpm exec oxlint 'app/[lang]/page.tsx' tests/smoke.spec.ts`
Expected: 0 errors

- [ ] **Step 2: Run a production build**

Run: `pnpm run build`
Expected: exit 0

- [ ] **Step 3: Re-run the homepage tests as fresh evidence**

Run: `pnpm exec playwright test tests/smoke.spec.ts --grep "homepage"`
Expected: PASS

- [ ] **Step 4: Review the diff against the spec**

Confirm the result still matches the approved design:

- No CTA
- No featured content rail
- No stack-heavy section
- Placeholder route-test paragraphs removed
- Copy remains philosophy-first in both locales
