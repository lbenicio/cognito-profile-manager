import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, localePrefix, pathnames } from './navigation';

const publicPages = [pathnames['/login']];

export default function middleware(request: NextRequest) {
  // 1. Handle internationalization routing
  const handleI18nRouting = createMiddleware({
    defaultLocale: 'en',
    locales,
    localePrefix,
    pathnames,
  });
  const response = handleI18nRouting(request);

  // 2. Handle authentication
  const session = request.cookies.get('auth_session');
  const pathname = request.nextUrl.pathname;
  const isPublicPage = publicPages.includes(pathname);

  // If the user is on a public page but already has a session, redirect to the homepage.
  if (isPublicPage && session) {
    return NextResponse.redirect(new URL(pathnames['/'], request.url));
  }

  // If the user is on a protected page and has no session, redirect to the login page.
  if (!isPublicPage && !session) {
    const loginUrl = new URL(pathnames['/login'], request.url);
    // You could optionally add a 'from' query parameter to redirect back after login
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If all checks pass, continue with the i18n-handled response.
  return response;
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};