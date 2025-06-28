import { NextRequest, NextResponse } from 'next/server';
import { pathnames, locales } from '@/navigation';

// List of public pages that do not require authentication
const publicPages = ['/login', '/terms', '/privacy'];

/**
 * Checks if the given pathname is a public page, considering locales.
 */
function isPublicPage(pathname: string): boolean {
  // Matches /login, /en/login, /es/terms, etc.
  const publicPathnameRegex = RegExp(
    `^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`,
    'i'
  );
  return publicPathnameRegex.test(pathname);
}

/**
 * Authentication middleware.
 * - Redirects unauthenticated users from protected pages to login.
 * - Redirects authenticated users from public pages to dashboard.
 * - Returns null if no redirect is needed.
 */
export function authMiddleware(request: NextRequest): NextResponse | null {
  const isPublic = isPublicPage(request.nextUrl.pathname);
  const sessionCookie = request.cookies.get('session');

  // If there's no session and the user is trying to access a protected page...
  if (!sessionCookie && !isPublic) {
    const loginUrl = new URL(pathnames['/login'], request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If there IS a session and the user is on a public page (like /login)...
  if (sessionCookie && isPublic) {
    const dashboardUrl = new URL(pathnames['/'], request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If authentication checks pass, allow the request to proceed.
  return null;
}
