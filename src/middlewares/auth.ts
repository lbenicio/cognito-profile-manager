
import { NextRequest, NextResponse } from 'next/server';
import { pathnames, locales } from '@/navigation';

// All pages that are public and don't require authentication
const publicPages = [
    pathnames['/login'],
    pathnames['/terms'],
    pathnames['/privacy']
]; 
const publicPathnameRegex = new RegExp(
  `^(/(${locales.join('|')}))?(${publicPages.join('|')})/?$`,
  'i'
);


// Helper function to redirect to the login page and clear auth cookies
function redirectToLogin(request: NextRequest): NextResponse {
    const loginUrl = new URL(pathnames['/login'], request.url);
    const response = NextResponse.redirect(loginUrl);
    
    // Clear both session and state cookies on redirect to prevent issues.
    response.cookies.set('auth_session', '', { expires: new Date(0), path: '/' });
    response.cookies.set('oauth_state', '', { expires: new Date(0), path: '/' });

    return response;
}

export async function authMiddleware(request: NextRequest): Promise<NextResponse | null> {
  const sessionCookie = request.cookies.get('auth_session');
  const isPublicPage = publicPathnameRegex.test(request.nextUrl.pathname);

  if (!sessionCookie) {
    // If there's no session cookie and the user is trying to access a protected page, redirect them.
    if (!isPublicPage) {
      return redirectToLogin(request);
    }
    // Otherwise, if they're on a public page, let them proceed.
    return null;
  }

  // If a session cookie exists, we let the request pass.
  // The actual validation of the token happens in the `getUser` function on each protected page.
  // This prevents redirect loops if the token is invalid, showing an error on the page instead.
  
  // However, if the user with a session tries to access the login page, we should redirect them to the dashboard.
  if (isPublicPage) {
    return NextResponse.redirect(new URL(pathnames['/'], request.url));
  }
  
  // For all other cases (user with a session on a protected page), allow access.
  return null;
}
