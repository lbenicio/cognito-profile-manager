import { NextRequest, NextResponse } from 'next/server';
import createI18nMiddleware from 'next-intl/middleware';
import { pathnames, locales, localePrefix } from '@/navigation';

const publicPages = ['/login', '/terms', '/privacy'];

const i18nMiddleware = createI18nMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

export function middleware(request: NextRequest) {
  // Create a regex that matches public pages, considering locales.
  // Example: /login, /en/login, /es/terms
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`,
    'i'
  );
  const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

  const sessionCookie = request.cookies.get('session');

  // The core i18n logic runs on every request.
  // It determines the locale and sets appropriate headers on the response.
  const i18nResponse = i18nMiddleware(request);

  // --- Authentication Logic ---

  // If there's no session and the user is trying to access a protected page...
  if (!sessionCookie && !isPublicPage) {
    // ...redirect them to the login page.
    // The `next-intl` middleware has already processed the request, so the
    // locale is baked into the URL's `basePath`. Redirecting to `/login`
    // will preserve the locale.
    const loginUrl = new URL(pathnames['/login'], request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If there IS a session and the user is on a public page (like /login)...
  if (sessionCookie && isPublicPage) {
    // ...redirect them to the main dashboard.
    const dashboardUrl = new URL(pathnames['/'], request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If authentication checks pass, allow the request to proceed with the
  // i18n-enhanced response.
  return i18nResponse;
}

export const config = {
  // Skip all paths that should not be internationalized. This example skips the
  // folders "api", "_next" and all files with an extension (e.g. favicon.ico)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
