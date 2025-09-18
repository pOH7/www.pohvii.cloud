import { createHash } from "crypto";

/**
 * Generates a unique 8-character ID for a blog post based on its content and metadata
 */
export function generatePostId(content: {
  slug: string;
  title: string;
  date: string;
  lang: string;
}): string {
  const hashInput = `${content.slug}-${content.title}-${content.date}-${content.lang}`;
  return createHash("sha256").update(hashInput).digest("hex").substring(0, 8);
}

/**
 * Generates a URL-safe slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .replace(/^-|-$/g, ""); // Remove leading/trailing hyphens
}

/**
 * Parses a slug-id format string into its components
 * Example: "my-blog-post-abc12345" -> { slug: "my-blog-post", id: "abc12345" }
 */
export function parseSlugId(slugWithId: string): { slug: string; id: string } {
  const lastDashIndex = slugWithId.lastIndexOf("-");

  if (lastDashIndex === -1 || lastDashIndex === slugWithId.length - 1) {
    // No dash found or dash is at the end - treat as legacy slug without ID
    return { slug: slugWithId, id: "" };
  }

  const potentialId = slugWithId.substring(lastDashIndex + 1);

  // Check if the potential ID looks like our 8-character format
  if (potentialId.length === 8 && /^[a-f0-9]+$/.test(potentialId)) {
    return {
      slug: slugWithId.substring(0, lastDashIndex),
      id: potentialId,
    };
  }

  // Doesn't match our ID format - treat as legacy slug
  return { slug: slugWithId, id: "" };
}

/**
 * Combines a slug and ID into the self-healing URL format
 */
export function combineSlugId(slug: string, id: string): string {
  return `${slug}-${id}`;
}

/**
 * Generates the canonical URL for a blog post
 */
export function generateCanonicalUrl(
  baseUrl: string,
  lang: string,
  title: string,
  id: string
): string {
  const slug = generateSlug(title);
  const slugWithId = combineSlugId(slug, id);
  return `${baseUrl}/${lang}/blog/${slugWithId}`;
}

/**
 * Validates if a slug matches the expected format for a title
 */
export function isSlugValid(
  providedSlug: string,
  expectedTitle: string
): boolean {
  const expectedSlug = generateSlug(expectedTitle);
  return providedSlug === expectedSlug;
}
