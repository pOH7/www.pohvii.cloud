# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Development:**
- `pnpm dev` - Start development server with Turbopack
- `pnpm build` - Build production version with Turbopack  
- `pnpm start` - Start production server

**Code Quality:**
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Run ESLint with auto-fix
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check code formatting

**Testing:**
- `npx playwright test` - Run E2E tests
- `npx playwright test --ui` - Run tests with UI mode
- `npx playwright show-report` - Show test report

## Architecture

This is a **Next.js 15 blog website** with internationalization support for English and Chinese.

**Key Architecture:**
- **App Router** with internationalized routing pattern `[lang]/`
- **Dynamic routing** for blog posts: `[lang]/blog/[slug]`
- **MDX blog system** with frontmatter support located in `content/blog/{lang}/`
- **Server-side i18n** using dictionary pattern (no client-side libraries)
- **shadcn/ui** components with Tailwind CSS v4
- **Theme system** with dark/light mode support

**Core Structure:**
- `app/[lang]/` - Internationalized app routes (en/zh)
- `components/` - Reusable UI components and blog-specific components
- `lib/blog.ts` - Blog content processing with MDX serialization
- `content/blog/{lang}/` - MDX blog posts organized by language
- `dictionaries/` - Translation files for i18n

**Blog System:**
- Posts are written in MDX with gray-matter frontmatter
- Content processed with remark-gfm, rehype-slug, rehype-autolink-headings
- Automatic reading time calculation
- Support for categories, tags, and related posts
- Table of contents generation for blog articles

**i18n Implementation:**
- URL structure: `/en/`, `/zh/` for different languages
- Dictionary-based translations loaded server-side
- Language-specific content in separate directories
- No client-side i18n runtime overhead

**Key Dependencies:**
- Next.js 15 with Turbopack for fast builds
- MDX processing with next-mdx-remote
- shadcn/ui components with Radix UI primitives
- Framer Motion for animations
- Playwright for E2E testing