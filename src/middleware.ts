import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { locales, localePrefix, pathnames } from './navigation';

const i18nMiddleware = createMiddleware({
  locales,
  localePrefix,
  pathnames,
  defaultLocale: 'en',
});

// All pages that are public and don't require authentication
const publicPages = [pathnames['/login']]; 

export default function middleware(request: NextRequest) {
  const session = request.cookies.get('auth_session');
  const pathname = request.nextUrl.pathname;

  // Check if the current path is a public page
  const isPublicPage = publicPages.includes(pathname as (typeof publicPages)[number]);

  // If the user is logged in and tries to access a public page (like /login),
  // redirect them to the dashboard.
  if (session && isPublicPage) {
    return NextResponse.redirect(new URL(pathnames['/'], request.url));
  }

  // If the user is not logged in and tries to access a protected page,
  // redirect them to the login page.
  if (!session && !isPublicPage) {
    const loginUrl = new URL(pathnames['/login'], request.url);
    // You could optionally add a 'from' query parameter to redirect back after login
    // loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // If authentication checks pass, proceed with the i18n middleware.
  return i18nMiddleware(request);
}

export const config = {
  // Match all pathnames except for
  // - … if they start with `/api`, `/_next` or `/_vercel`
  // - … the ones containing a dot (e.g. `favicon.ico`)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
