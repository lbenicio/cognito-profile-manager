import { NextRequest, NextResponse } from 'next/server';
import { pathnames } from '@/navigation';

// All pages that are public and don't require authentication
const publicPages = [pathnames['/login']]; 

export function authMiddleware(request: NextRequest): NextResponse | null {
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
  
  // If no redirect is needed, return null to pass to the next middleware.
  return null;
}
