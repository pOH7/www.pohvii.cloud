# Blog Metadata Documentation

## Overview

All blog posts in this project use MDX format with YAML frontmatter for metadata. Blog posts are stored in the `/content/blog/` directory, organized by language (e.g., `/en/` for English posts).

## Metadata Fields

### Core Fields

| Field | Type | Default | Description | Examples |
|-------|------|---------|-------------|----------|
| `title` | string | slug name | The main title of the blog post | `"How to Write a Tech Blog: A Comprehensive Guide"` |
| `description` | string | `""` (empty) | A brief summary of the post content | `"Master the art of technical writing..."` |
| `date` | string/Date | current date | Publication date (various formats accepted) | `2025-09-15T00:00:00.000Z`, `2025-09-15` |
| `lastModified` | string/Date | undefined | Last modification date (used in sitemap) | `2025-10-11`, `2025-10-11T00:00:00.000Z` |
| `author` | string | `""` (empty) | The author's name | `"Léon Zhang"`, `"pOH7"` |
| `category` | string | `""` (empty) | Primary category for the post | `"Web Development"`, `"Spring"`, `"Infrastructure"` |
| `tags` | array | `[]` (empty) | Array of relevant tags for categorization | `["SEO", "HTML", "Web Development"]` |
| `image` | string | `""` (empty) | URL to the featured image | `"https://images.unsplash.com/..."` |
| `video` | string | undefined | Optional video URL | `"https://youtube.com/..."` |
| `id` | string | **REQUIRED** | 8-character unique identifier for self-healing URLs | `"8f4e9d12"`, `"fe8adea7"` |

### Alternative Field Names

The system also supports these alternative field names (based on observed usage):
- `publishDate` → mapped to `date`
- `featured` → not currently used in processing but can be included for future features

## Date Format Handling

The system is flexible with date formats:

### Accepted Formats
- **ISO 8601 with time**: `2025-09-15T00:00:00.000Z`
- **Date only**: `2025-09-15`
- **JavaScript Date object**: When parsed by gray-matter

### Display Format
All dates are automatically formatted to a localized string format: `"Sep 15, 2025"` (month abbreviated, day, year)

### Last Modified Date
The `lastModified` field tracks when a post was last updated:
- **Purpose**: Used in sitemap generation for SEO (`lastmod` attribute)
- **When to use**: Add when making significant content updates to existing posts
- **Fallback**: If not provided, the sitemap uses the original `date` field
- **Format**: Same as `date` field (ISO 8601 or date-only string)

## Required vs Optional Fields

### Required Fields
- **id**: Must be a unique 8-character hexadecimal identifier (generated using `lib/post-id.ts`)

### Optional Fields (with defaults)
While most fields have defaults, it's strongly recommended to provide them explicitly:

- **title**: Falls back to the slug name if not provided
- **description**: Defaults to empty string
- **date**: Falls back to current date if not provided
- **lastModified**: Only included if explicitly provided; used in sitemap generation
- **author**: Defaults to empty string
- **category**: Defaults to empty string
- **tags**: Defaults to empty array
- **image**: Defaults to empty string
- **video**: Only included if explicitly provided

## Post ID Requirements

### Why IDs are Required

The `id` field is **mandatory** for the self-healing URL system implemented in `lib/post-id.ts`. This system allows:

1. **URL Stability**: Blog posts can be accessed by their unique ID even if the title/slug changes
2. **Self-Healing URLs**: URLs automatically redirect to the correct slug when titles are updated
3. **Canonical URL Generation**: Ensures consistent linking across the site

### Generating Post IDs

Use the `generatePostId` function from `lib/post-id.ts`:

```typescript
import { generatePostId } from './lib/post-id';

const postId = generatePostId({
  slug: 'my-blog-post',
  title: 'My Blog Post Title',
  date: '2025-01-22',
  lang: 'en'
});
// Returns: "8f4e9d12" (8-character hex string)
```

### ID Format
- **Length**: Exactly 8 characters
- **Character set**: Hexadecimal (0-9, a-f)
- **Uniqueness**: Generated from SHA-256 hash of post metadata
- **Examples**: `"8f4e9d12"`, `"fe8adea7"`, `"ab123cd4"`

## Computed Fields

The following fields are automatically computed and added to the metadata:

| Field | Description | Example |
|-------|-------------|---------|
| `slug` | Filename without extension | `"tech-blog-writing-guide"` |
| `lang` | Language code from directory | `"en"` |
| `readTime` | Estimated reading time | `"5 min read"` |

## File Naming Convention

Blog post files should follow this naming pattern:
```
[topic-name-kebab-case].mdx
```

Examples:
- `sharepoint-development-graph-api.mdx`
- `zero-knowledge-password-proofs-opaque-authentication.mdx`
- `tech-blog-writing-guide.mdx`

## Language Organization

Blog posts are organized by language:
```
/content/blog/
  ├── en/          # English posts
  │   ├── post1.mdx
  │   └── post2.mdx
  └── [other-languages]/
```

## Example Metadata Blocks

### Minimal Example
```yaml
---
title: Basic Post Title
description: A simple description
date: 2025-01-22
id: ab123cd4
---
```

### Standard Example
```yaml
---
title: VMware Fusion Networking Configuration
description: >-
  Practical notes on configuring VMware Fusion virtual networks, DHCP/NAT
  settings, and useful commands on macOS.
date: 2025-09-06T00:00:00.000Z
lastModified: 2025-11-24
author: Léon Zhang
category: Infrastructure
tags:
  - VMware
  - macOS
  - Networking
  - Virtualization
image: >-
  https://images.unsplash.com/photo-1496096265110-f83ad7f96608?w=1200&h=600&fit=crop
id: ef79b0dd
---
```

### Full Example with Multi-line Values
```yaml
---
title: >-
  Zero-Knowledge Password Proofs: How OPAQUE is Revolutionizing Authentication
  Security
description: >-
  Discover how zero-knowledge password proofs and the OPAQUE protocol are
  transforming authentication security, eliminating password breaches and
  protecting user credentials even from servers themselves.
date: 2025-09-17T00:00:00.000Z
author: Léon Zhang
category: Cryptography
tags:
  - Cryptography
  - Security
  - Authentication
  - Zero Knowledge
  - OPAQUE
  - Privacy
image: >-
  https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=1200&h=600&fit=crop
---
```

## Tag Guidelines

### Common Categories Used
- **Web Development**: SEO, HTML, PWA, Performance
- **Programming Languages**: Java, TypeScript, JavaScript
- **Frameworks**: Spring Boot, Next.js, React
- **Infrastructure**: VMware, Proxmox, Virtualization, Networking
- **DevOps**: Git, Git LFS, Automation
- **Security**: Authentication, Cryptography, Zero Knowledge
- **APIs**: REST, GraphQL, Microsoft Graph

### Tag Best Practices
1. Use Title Case for consistency
2. Include 3-8 tags per post
3. Balance broad and specific tags
4. Reuse existing tags when applicable

## Category Examples

Common categories observed in the codebase:
- `Web Development`
- `Spring`
- `Infrastructure`
- `Version Control`
- `Writing`
- `Cryptography`
- `SEO`

## Image Guidelines

- Use high-quality images with proper dimensions
- Unsplash format: `https://images.unsplash.com/photo-[ID]?w=1200&h=600&fit=crop`
- Standard dimensions: 1200x600 for optimal display
- Always include images for better visual appeal and SEO

## Processing Pipeline

1. **Reading**: Files are read using Node.js `fs` module
2. **Parsing**: Gray-matter parses YAML frontmatter
3. **Defaults**: Missing fields are filled with default values
4. **Enhancement**: Reading time is calculated
5. **Formatting**: Dates are formatted for display
6. **MDX Processing**: Content is serialized with plugins:
   - remarkGfm (GitHub Flavored Markdown)
   - rehypePrettyCode (syntax highlighting)
   - rehypeSlug (heading IDs)
   - rehypeAutolinkHeadings (heading links)

## API Functions

The blog system provides these functions:

| Function | Purpose | Returns |
|----------|---------|---------|
| `getAllPostSlugs(lang)` | Get all post filenames | `string[]` |
| `getPostBySlug(lang, slug)` | Get single post with content | Post object with meta and MDX |
| `getAllPosts(lang)` | Get all posts metadata | `BlogMeta[]` sorted by date |
| `getFeaturedPosts(lang, limit)` | Get recent posts | Limited `BlogMeta[]` |
| `getRecentPosts(lang, limit, skip)` | Get paginated posts | `BlogMeta[]` |
| `getAllTags(lang)` | Get all tags with counts | `TagWithCount[]` |

## Sorting and Display

- Posts are automatically sorted by date (newest first)
- The original date value is preserved for accurate sorting
- Formatted dates are used for display only

## Migration Checklist

When adding or updating blog posts:

1. ✅ Include title and description
2. ✅ Use consistent date format
3. ✅ Add author name (use consistent naming)
4. ✅ Select appropriate category
5. ✅ Add 3-8 relevant tags
6. ✅ Include high-quality image URL
7. ✅ Use kebab-case for filename
8. ✅ Place in correct language directory
9. ✅ **MUST add unique 8-character ID for self-healing URLs** (see `lib/post-id.ts`)

## Troubleshooting

### Common Issues and Solutions

1. **Missing Post ID**
   - **Symptom**: Post doesn't appear in listings or self-healing URLs don't work
   - **Solution**: Add required `id` field using `generatePostId()` from `lib/post-id.ts`
   - **Critical**: The `id` field is mandatory for all new posts

2. **Invalid Post ID Format**
   - **Symptom**: URL parsing errors or redirect loops
   - **Solution**: Ensure ID is exactly 8 hexadecimal characters (0-9, a-f)
   - **Example**: `"8f4e9d12"` ✅, `"invalid-id"` ❌

3. **Missing Metadata Fields**
   - Fields will use defaults, but may appear empty in UI
   - Always include at minimum: title, description, date, **id**

4. **Date Display Issues**
   - Ensure valid date format
   - Check for typos in date field

5. **Tags Not Showing**
   - Verify array syntax with proper indentation
   - Use quotes for tags with special characters

6. **Image Not Loading**
   - Verify URL is accessible
   - Use HTTPS URLs only
   - Check image dimensions

7. **Post Not Appearing**
   - Verify `.mdx` extension
   - Check file is in correct language directory
   - Ensure valid YAML frontmatter syntax
   - **Most common**: Missing required `id` field