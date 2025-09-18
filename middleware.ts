import { NextRequest, NextResponse } from "next/server";

// Simple slug-id parsing for middleware (Edge Runtime compatible)
function parseSlugIdSimple(slugWithId: string): { id: string } {
  const lastDashIndex = slugWithId.lastIndexOf("-");

  if (lastDashIndex === -1 || lastDashIndex === slugWithId.length - 1) {
    return { id: "" };
  }

  const potentialId = slugWithId.substring(lastDashIndex + 1);

  // Check if the potential ID looks like our 8-character format
  if (potentialId.length === 8 && /^[a-f0-9]+$/.test(potentialId)) {
    return { id: potentialId };
  }

  return { id: "" };
}

const locales = ["en", "zh"];
const defaultLocale = "en";

// Get the preferred locale
function getLocale(request: NextRequest): string {
  // Check if there's a locale in the pathname
  const pathname = request.nextUrl.pathname;
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    // Get preferred locale from headers
    const acceptLanguage = request.headers.get("accept-language");
    let preferredLocale = defaultLocale;

    if (acceptLanguage) {
      const languages = acceptLanguage
        .split(",")
        .map((lang) => lang.split(";")[0].trim());
      for (const lang of languages) {
        if (lang.startsWith("zh")) {
          preferredLocale = "zh";
          break;
        } else if (lang.startsWith("en")) {
          preferredLocale = "en";
          break;
        }
      }
    }

    return preferredLocale;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore API, Next internals, well-known, and any file with an extension
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/.well-known") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check if there is any supported locale in the pathname
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Handle self-healing URLs for blog posts
  if (pathnameHasLocale) {
    const blogRouteMatch = pathname.match(/^\/([a-z]{2})\/blog\/(.+)$/);
    if (blogRouteMatch) {
      const [, , slugWithId] = blogRouteMatch;
      const { id } = parseSlugIdSimple(slugWithId);

      // If the URL doesn't have an ID (legacy format), let the page component handle it
      // The page component will try to find the post and redirect to the correct URL with ID
      if (!id) {
        // This is a legacy URL format - let the page handle the lookup and redirect
        return NextResponse.next();
      }

      // For URLs with IDs, continue to the page component which will handle slug validation
      return NextResponse.next();
    }

    // For non-blog routes with locale, continue normally
    return NextResponse.next();
  }

  // Redirect if there is no locale
  const locale = getLocale(request);
  request.nextUrl.pathname = `/${locale}${pathname}`;
  // e.g. incoming request is /products
  // The new URL is now /en-US/products
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Match all paths; filtering happens inside middleware for simplicity
  matcher: ["/:path*"],
};
