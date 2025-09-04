# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Next.js App Router pages, layouts, and route handlers.
- `components/`: Reusable UI components (PascalCase, `.tsx`).
- `hooks/`: React hooks (`useX.ts`).
- `lib/`: Utilities, config, and helpers.
- `content/`: MD/MDX-backed content (blog/articles).
- `public/`: Static assets served from `/`.
- `tests/`: Playwright E2E tests (`*.spec.ts`).
- Root config: `next.config.ts`, `middleware.ts`, `eslint.config.mjs`, `playwright.config.ts`, `tsconfig.json`.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server with Turbopack at `http://localhost:3000`.
- `pnpm build`: Production build.
- `pnpm start`: Serve the production build.
- `pnpm lint` / `pnpm lint:fix`: Run ESLint (auto-fix with `:fix`).
- `pnpm format` / `pnpm format:check`: Prettier write/check.
- `pnpm exec playwright test`: Run E2E tests (HTML report in `playwright-report/`).

## Coding Style & Naming Conventions
- **Language**: TypeScript + React (Next.js 15). TailwindCSS is used for styling.
- **Formatting**: Prettier; 2-space indent; single quotes; semicolons per config.
- **Linting**: ESLint with `eslint-config-next` and Prettier integration.
- **Files**: Components `PascalCase.tsx`; hooks `useThing.ts`; utilities `camelCase.ts`.
- **Routes**: Use the App Router patterns under `app/` (e.g., `app/blog/[slug]/page.tsx`).

## Testing Guidelines
- **Framework**: Playwright (`tests/*.spec.ts`). Name tests descriptively, e.g., `blog-heading-underline.spec.ts`.
- **Local run**: `pnpm exec playwright test` (starts server via `playwright.config.ts`).
- **Trace/Report**: Failing tests collect traces; open `playwright-report/index.html` after runs.
- **Coverage**: Aim to cover critical navigation and content rendering flows.

## Commit & Pull Request Guidelines
- **Commits**: Follow Conventional Commits: `feat:`, `fix:`, `refactor:`, optional scope (`feat(blog): ...`).
- **Branches**: `feat/short-desc`, `fix/issue-123`.
- **PRs**: Provide a clear description, link issues (`Closes #123`), include screenshots for UI changes, and note any i18n/content updates. Ensure `pnpm build` and Playwright tests pass.

## Security & Configuration Tips
- Store secrets in environment variables (`.env*`, not committed). Avoid hardcoding keys.
- Be mindful of middleware and i18n routing in `middleware.ts` when adding routes.
