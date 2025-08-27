import { NextRequest, NextResponse } from 'next/server';

const locales = ['en', 'zh'];
const defaultLocale = 'en';

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
    const acceptLanguage = request.headers.get('accept-language');
    let preferredLocale = defaultLocale;
    
    if (acceptLanguage) {
      const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
      for (const lang of languages) {
        if (lang.startsWith('zh')) {
          preferredLocale = 'zh';
          break;
        } else if (lang.startsWith('en')) {
          preferredLocale = 'en';
          break;
        }
      }
    }

    return preferredLocale;
  }

  return defaultLocale;
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Check if there's a locale in the pathname
  const pathnameIsMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  );

  // Redirect if there is no locale
  if (pathnameIsMissingLocale) {
    const locale = getLocale(request);
    const newPath = `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`;
    return NextResponse.redirect(new URL(newPath, request.url));
  }
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};